import Anthropic from '@anthropic-ai/sdk';
import { AGENT_TOOLS, CLAUDE_MODEL, MAX_AGENT_TURNS, SYSTEM_PROMPT } from '../consts/agent.consts';
import { fetchPullFiles, searchRepoCode } from './github.service';
import type { AgentEvent, ReviewComment, ReviewRequest } from '../types/review.types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface EmitFn {
  (event: AgentEvent): void;
}

const nowIso = (): string => new Date().toISOString();

const runTool = async (
  toolName: string,
  toolInput: Record<string, unknown>,
  request: ReviewRequest,
  emit: EmitFn
): Promise<string> => {
  const { repoOwner, repoName, pullNumber } = request;

  if (toolName === 'fetch_pull_files') {
    emit({ type: 'tool_call', label: 'Fetching changed files', timestamp: nowIso() });
    const files = await fetchPullFiles(repoOwner, repoName, pullNumber);
    emit({
      type: 'tool_result',
      label: `Found ${files.length} changed file(s)`,
      detail: files.map(({ filename }) => filename).join(', '),
      timestamp: nowIso(),
    });
    return JSON.stringify(files);
  }

  if (toolName === 'search_repo') {
    const { query } = toolInput;
    const queryText = String(query ?? '');
    emit({ type: 'tool_call', label: `Searching repo for "${queryText}"`, timestamp: nowIso() });
    const result = await searchRepoCode(repoOwner, repoName, queryText);
    emit({ type: 'tool_result', label: 'Search complete', detail: result, timestamp: nowIso() });
    return result;
  }

  emit({ type: 'error', label: `Unknown tool: ${toolName}`, timestamp: nowIso() });
  return `Error: unknown tool ${toolName}`;
};

export const runCodeReviewAgent = async (
  request: ReviewRequest,
  emit: EmitFn
): Promise<ReviewComment[]> => {
  const { repoOwner, repoName, pullNumber } = request;

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Review pull request #${pullNumber} in ${repoOwner}/${repoName}.`,
    },
  ];

  for (let turn = 0; turn < MAX_AGENT_TURNS; turn += 1) {
    const isFinalTurn = turn === MAX_AGENT_TURNS - 1;

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: AGENT_TOOLS as unknown as Anthropic.Tool[],
      // Force tool use every turn so Claude can't end the loop by replying in
      // plain text instead of calling a tool. On the final turn, force
      // submit_review specifically so the agent always produces a result
      // within its turn budget rather than silently running out.
      tool_choice: isFinalTurn
        ? { type: 'tool', name: 'submit_review' }
        : { type: 'any' },
      messages,
    });

    const { content } = response;

    // Note: block.type checks below are TypeScript discriminated-union
    // narrowing guards, not plain property reads — they're kept as dot
    // notation deliberately, since destructuring `type` ahead of the check
    // would lose the narrowing needed to safely access .text/.input after it.
    const textBlocks = content.filter((block) => block.type === 'text');
    if (textBlocks.length > 0) {
      const thought = textBlocks.map((block) => ('text' in block ? block.text : '')).join(' ');
      if (thought.trim().length > 0) {
        emit({ type: 'thinking', label: thought, timestamp: nowIso() });
      }
    }

    const toolUseBlocks = content.filter((block) => block.type === 'tool_use');

    const submitBlock = toolUseBlocks.find(({ name }) => name === 'submit_review');
    if (submitBlock && submitBlock.type === 'tool_use') {
      const { input } = submitBlock;
      const { comments: submittedComments } = input as { comments: Array<Omit<ReviewComment, 'id'>> };
      const comments: ReviewComment[] = submittedComments.map((comment, index) => ({
        id: `${Date.now()}-${index}`,
        ...comment,
      }));
      emit({
        type: 'done',
        label: `Review complete: ${comments.length} comment(s)`,
        detail: JSON.stringify(comments),
        timestamp: nowIso(),
      });
      return comments;
    }

    if (toolUseBlocks.length === 0) {
      break;
    }

    messages.push({ role: 'assistant', content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      if (block.type !== 'tool_use') continue;
      const { id, name, input } = block;
      const result = await runTool(name, input as Record<string, unknown>, request, emit);
      toolResults.push({ type: 'tool_result', tool_use_id: id, content: result });
    }

    messages.push({ role: 'user', content: toolResults });
  }

  emit({ type: 'error', label: 'Agent stopped without submitting a review', timestamp: nowIso() });
  return [];
};

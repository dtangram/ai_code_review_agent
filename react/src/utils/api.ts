import { API_BASE_URL } from '../consts';
import type { AgentEvent, ReviewComment, ReviewFormValues, ReviewSummary } from '../types/review.types';

interface StreamHandlers {
  onEvent: (event: AgentEvent) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

export const startReviewStream = async (
  values: ReviewFormValues,
  handlers: StreamHandlers
): Promise<void> => {
  const { repoOwner, repoName, pullNumber } = values;
  const { onEvent, onError, onClose } = handlers;

  const response = await fetch(`${API_BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoOwner, repoName, pullNumber: Number(pullNumber) }),
  });

  const { ok, body } = response;
  if (!ok || !body) {
    onError('Failed to start review.');
    return;
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const read = async (): Promise<void> => {
    const { value, done } = await reader.read();
    if (done) {
      onClose();
      return;
    }

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data:')) continue;
      const json = line.replace(/^data:\s*/, '');
      try {
        const event = JSON.parse(json) as AgentEvent;
        onEvent(event);
      } catch {
        onError('Received malformed event from server.');
      }
    }

    await read();
  };

  await read();
};

export const publishReviewToGithub = async (
  reviewId: string,
  comments: ReviewComment[]
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      comments: comments.map(({ filePath, line, severity, summary, explanation, suggestedFix }) => ({
        filePath,
        line,
        body: `**[${severity}]** ${summary}\n\n${explanation}${
          suggestedFix ? `\n\nSuggested fix:\n\`\`\`\n${suggestedFix}\n\`\`\`` : ''
        }`,
      })),
    }),
  });

  const { ok } = response;
  if (!ok) {
    const { error } = (await response.json().catch(() => ({}))) as { error?: unknown };
    throw new Error(typeof error === 'string' ? error : 'Failed to publish review.');
  }

  const { htmlUrl } = (await response.json()) as { htmlUrl: string };
  return htmlUrl;
};

export const fetchReviewHistory = async (): Promise<ReviewSummary[]> => {
  const response = await fetch(`${API_BASE_URL}/api/reviews`);
  const { ok } = response;
  if (!ok) {
    throw new Error('Failed to load review history.');
  }
  return (await response.json()) as ReviewSummary[];
};

export const fetchAllowedRepos = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/api/reviews/allowed-repos`);
  const { ok } = response;
  if (!ok) {
    throw new Error('Failed to load allowed repos.');
  }
  const { repos } = (await response.json()) as { repos: string[] };
  return repos;
};

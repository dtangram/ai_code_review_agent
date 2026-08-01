export const SYSTEM_PROMPT = `You are a senior code reviewer. You review a pull request by:
1. Reading the changed files (fetch_pull_files)
2. Searching the rest of the repository for related code, existing patterns, or usages that provide context (search_repo)
3. Producing a list of specific, actionable review comments

Only flag real issues: bugs, missing null/error handling, security concerns, inconsistent patterns versus the rest of the codebase,
and accessibility problems in UI code. Do not comment on pure style preferences unless they contradict an existing convention
you found in the repo. For each issue, cite the file and, when possible, the line. Be concise and specific — no filler.
When you are done investigating, call submit_review with your final structured findings.`;

export const AGENT_TOOLS = [
  {
    name: 'fetch_pull_files',
    description: 'Fetch the list of changed files and their diffs for the pull request under review.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'search_repo',
    description:
      'Search the repository (outside the diff) for a keyword, function name, or pattern, to understand existing conventions before flagging an issue.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Keyword or symbol to search for' },
      },
      required: ['query'],
    },
  },
  {
    name: 'submit_review',
    description: 'Submit the final list of review comments once investigation is complete.',
    input_schema: {
      type: 'object' as const,
      properties: {
        comments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              line: { type: ['number', 'null'] },
              severity: { type: 'string', enum: ['info', 'suggestion', 'warning', 'critical'] },
              summary: { type: 'string' },
              explanation: { type: 'string' },
              suggestedFix: { type: ['string', 'null'] },
            },
            required: ['filePath', 'line', 'severity', 'summary', 'explanation', 'suggestedFix'],
          },
        },
      },
      required: ['comments'],
    },
  },
] as const;

export const CLAUDE_MODEL = 'claude-sonnet-4-6';
export const MAX_AGENT_TURNS = 8;

// Comma-separated "owner/repo" pairs this public demo is allowed to run against,
// e.g. "dtangram/heroLog-heroku,dtangram/ai-code-review-agent".
// Set in .env — the endpoint rejects any repo not on this list.
export const ALLOWED_REPOS: string[] = (process.env.DEMO_REPOS ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter((entry) => entry.length > 0);

export const isAllowedRepo = (owner: string, name: string): boolean =>
  ALLOWED_REPOS.length === 0 || ALLOWED_REPOS.includes(`${owner}/${name}`);

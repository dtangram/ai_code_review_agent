import type { PullFile } from '../types/review.types';

const GITHUB_API_BASE = 'https://api.github.com';

const githubHeaders = (): Record<string, string> => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${process.env.GITHUB_TOKEN ?? ''}`,
  'X-GitHub-Api-Version': '2022-11-28',
});

export const fetchPullFiles = async (
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PullFile[]> => {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}/files`,
    { headers: githubHeaders() }
  );

  const { ok, status } = response;
  if (!ok) {
    throw new Error(`GitHub API error fetching PR files: ${status}`);
  }

  const files = (await response.json()) as Array<{
    filename: string;
    status: string;
    patch?: string;
    additions: number;
    deletions: number;
  }>;

  return files.map(({ filename, status: fileStatus, patch, additions, deletions }) => ({
    filename,
    status: fileStatus,
    patch: patch ?? null,
    additions,
    deletions,
  }));
};

// Best-effort: history display is more useful with a PR title, but a fetch
// failure here shouldn't block the review itself, so this returns null
// instead of throwing.
export const fetchPullRequestTitle = async (
  owner: string,
  repo: string,
  pullNumber: number
): Promise<string | null> => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}`, {
      headers: githubHeaders(),
    });
    const { ok } = response;
    if (!ok) return null;
    const { title } = (await response.json()) as { title?: string };
    return title ?? null;
  } catch {
    return null;
  }
};

export const searchRepoCode = async (
  owner: string,
  repo: string,
  query: string
): Promise<string> => {
  const searchQuery = encodeURIComponent(`${query} repo:${owner}/${repo}`);
  const response = await fetch(`${GITHUB_API_BASE}/search/code?q=${searchQuery}`, {
    headers: githubHeaders(),
  });

  const { ok, status } = response;
  if (!ok) {
    return `Search failed with status ${status}`;
  }

  const { items } = (await response.json()) as {
    items: Array<{ path: string; html_url: string }>;
  };

  if (items.length === 0) {
    return 'No matches found.';
  }

  return items
    .slice(0, 8)
    .map(({ path }) => `- ${path}`)
    .join('\n');
};

export interface PublishComment {
  filePath: string;
  line: number | null;
  body: string;
}

export const publishReviewToGithub = async (
  owner: string,
  repo: string,
  pullNumber: number,
  comments: PublishComment[]
): Promise<{ htmlUrl: string }> => {
  const inlineComments = comments
    .filter((comment): comment is PublishComment & { line: number } => comment.line !== null)
    .map(({ filePath, line, body }) => ({ path: filePath, line, body }));

  const generalNotes = comments
    .filter(({ line }) => line === null)
    .map(({ filePath, body }) => `**${filePath}** — ${body}`)
    .join('\n\n');

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`,
    {
      method: 'POST',
      headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'COMMENT',
        body: generalNotes.length > 0
          ? `AI Code Review Agent findings:\n\n${generalNotes}`
          : 'AI Code Review Agent findings — see inline comments.',
        comments: inlineComments,
      }),
    }
  );

  const { ok, status } = response;
  if (!ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub review publish failed (${status}): ${errorBody}`);
  }

  const { html_url: htmlUrl } = (await response.json()) as { html_url: string };
  return { htmlUrl };
};

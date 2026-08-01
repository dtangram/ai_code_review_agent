export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export const SEVERITY_LABELS: Record<string, string> = {
  info: 'Info',
  suggestion: 'Suggestion',
  warning: 'Warning',
  critical: 'Critical',
};

export const EMPTY_STATE_MESSAGE =
  'Enter a repository and pull request number to start a review.';

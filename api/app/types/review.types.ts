export type AgentEventType =
  | 'tool_call'
  | 'tool_result'
  | 'thinking'
  | 'comment'
  | 'done'
  | 'error';

export interface AgentEvent {
  type: AgentEventType;
  label: string;
  detail?: string;
  timestamp: string;
}

export type Severity = 'info' | 'suggestion' | 'warning' | 'critical';

export interface ReviewComment {
  id: string;
  filePath: string;
  line: number | null;
  severity: Severity;
  summary: string;
  explanation: string;
  suggestedFix: string | null;
}

export interface ReviewRequest {
  repoOwner: string;
  repoName: string;
  pullNumber: number;
}

export interface ReviewRecord {
  id: string;
  repoOwner: string;
  repoName: string;
  pullNumber: number;
  prTitle: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  comments: ReviewComment[];
  createdAt: string;
}

export interface PullFile {
  filename: string;
  status: string;
  patch: string | null;
  additions: number;
  deletions: number;
}

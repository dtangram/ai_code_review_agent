export type AgentEventType = 'tool_call' | 'tool_result' | 'thinking' | 'comment' | 'done' | 'error';

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
  status: 'pending' | 'accepted' | 'dismissed';
}

export interface ReviewFormValues {
  repoOwner: string;
  repoName: string;
  pullNumber: string;
}

export interface ReviewSummary {
  id: string;
  repoOwner: string;
  repoName: string;
  pullNumber: number;
  prTitle: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  comments: Array<{ severity: Severity }>;
  createdAt: string;
}

export type ReviewRunState = 'idle' | 'running' | 'completed' | 'error';

export type OSPage = 
  | 'dashboard'
  | 'ai-assistant'
  | 'ai-memory'
  | 'automation'
  | 'device-control'
  | 'github'
  | 'analytics'
  | 'file-explorer'
  | 'calendar'
  | 'settings'
  | 'vision'
  | 'browser'
  | 'activity';

export type GlowTheme = 'electric-blue' | 'neon-cyan' | 'royal-purple' | 'emerald' | 'charcoal-obsidian';

export interface SystemMetrics {
  cpuUsage: number;
  ramUsageGB: number;
  ramTotalGB: number;
  aiModel: string;
  neuralLatencyMs: number;
  activeThreads: number;
  memoryNodesCount: number;
  automationsActive: number;
  connectedDevicesCount: number;
  uptimeHours: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  attachments?: string[];
  codeBlock?: {
    language: string;
    code: string;
  };
  tokens?: number;
}

export interface MemoryNode {
  id: string;
  title: string;
  category: 'User Preference' | 'Project Context' | 'Fact' | 'Code Snippet' | 'System Rule' | 'Interaction';
  content: string;
  importance: number; // 0 - 100
  createdAt: string;
  lastAccessed: string;
  connections: string[]; // Node IDs
  tags: string[];
  pinned?: boolean;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: 'trigger' | 'action' | 'condition' | 'ai-process';
  icon: string;
  configSummary: string;
  status?: 'idle' | 'running' | 'success' | 'failed';
}

export interface AutomationWorkflow {
  id: string;
  title: string;
  description: string;
  trigger: WorkflowNode;
  actions: WorkflowNode[];
  enabled: boolean;
  schedule?: string;
  lastRun?: string;
  successRate: number;
  totalExecutions: number;
}

export interface DeviceItem {
  id: string;
  name: string;
  category: 'laptop' | 'phone' | 'wearable' | 'display' | 'iot' | 'hub';
  status: 'online' | 'standby' | 'syncing' | 'offline';
  batteryPct?: number;
  connectionSignal: number; // 0 - 100
  ipAddress: string;
  osVersion: string;
  temperatureC?: number;
  lastActive: string;
  iconName: string;
  details?: {
    cpuLoad?: number;
    storageUsedPct?: number;
    networkSpeedMbps?: number;
  };
}

export interface GithubRepo {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  pullRequestsCount: number;
  lastCommitMessage: string;
  lastCommitTime: string;
  cicdStatus: 'passing' | 'building' | 'failed';
  aiReviewStatus: 'approved' | 'action-needed' | 'pending';
}

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'code' | 'image' | 'archive' | 'audio';
  size: string;
  modified: string;
  tags: string[];
  isCloud: boolean;
  starred?: boolean;
  contentPreview?: string;
  path: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string; // YYYY-MM-DD
  type: 'meeting' | 'ai-task' | 'focus' | 'deadline';
  location?: string;
  attendees?: string[];
  aiSuggested?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  estimatedMinutes: number;
  category: string;
  aiBreakdown?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'system' | 'ai-agent' | 'github' | 'iot' | 'reminder';
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  actionLabel?: string;
  actionId?: string;
}

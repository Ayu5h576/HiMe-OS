/**
 * Native Desktop Runtime Agent Types & Contracts for HiMe OS.
 */

export interface BatteryInfo {
  percent: number;
  isCharging: boolean;
  timeRemainingMinutes?: number;
}

export interface CpuInfo {
  model: string;
  cores: number;
  usagePercent: number;
  loadAverage: number[];
}

export interface RamInfo {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usagePercent: number;
}

export interface StorageInfo {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usagePercent: number;
  mountPoint: string;
}

export interface SystemInfo {
  os: string;
  platform: string;
  release: string;
  arch: string;
  hostname: string;
  activeWindow?: string;
  wifiConnected: boolean;
  bluetoothConnected: boolean;
  uptimeSeconds: number;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryBytes: number;
  status: string;
}

export interface FileChangeEvent {
  eventType: 'created' | 'modified' | 'deleted' | 'renamed';
  folder: 'desktop' | 'downloads' | 'documents' | string;
  filePath: string;
  timestamp: string;
}

export type AgentEventType =
  | 'battery'
  | 'network'
  | 'clipboard'
  | 'process'
  | 'file'
  | 'health';

export interface AgentEvent {
  id: string;
  type: AgentEventType;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface AgentHealthReport {
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  version: string;
  os: string;
  agentUptimeSeconds: number;
  latencyMs: number;
  cpuUsagePercent: number;
  ramUsagePercent: number;
  lastHeartbeat: string;
}

export type SystemActionType =
  | 'launch_app'
  | 'close_app'
  | 'kill_process'
  | 'restart_process'
  | 'shutdown'
  | 'restart'
  | 'sleep'
  | 'lock'
  | 'volume_up'
  | 'volume_down'
  | 'mute'
  | 'brightness';

export interface SystemActionPayload {
  action: SystemActionType;
  target?: string;
  value?: number;
}

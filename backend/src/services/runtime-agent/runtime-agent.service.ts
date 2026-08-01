import { SystemMonitorService } from './system-monitor.service';
import { BatteryMonitorService } from './battery-monitor.service';
import { CpuMonitorService } from './cpu-monitor.service';
import { RamMonitorService } from './ram-monitor.service';
import { StorageMonitorService } from './storage-monitor.service';
import { ProcessManagerService } from './process-manager.service';
import { CommandExecutorService } from './command-executor.service';
import { FileWatcherService } from './file-watcher.service';
import { EventStreamService } from './event-stream.service';
import { HealthReporterService } from './health-reporter.service';
import { CommandChannelService } from './command-channel.service';
import {
  BatteryInfo,
  CpuInfo,
  RamInfo,
  StorageInfo,
  SystemInfo,
  ProcessInfo,
  AgentHealthReport,
  SystemActionPayload,
  AgentEvent,
  AgentEventType,
} from './types';
import { logger } from '../../config/logger';

export class NativeRuntimeAgentService {
  private systemMonitor: SystemMonitorService;
  private batteryMonitor: BatteryMonitorService;
  private cpuMonitor: CpuMonitorService;
  private ramMonitor: RamMonitorService;
  private storageMonitor: StorageMonitorService;
  private processManager: ProcessManagerService;
  private commandExecutor: CommandExecutorService;
  private fileWatcher: FileWatcherService;
  private eventStream: EventStreamService;
  private healthReporter: HealthReporterService;
  private commandChannel: CommandChannelService;

  constructor(
    systemMonitor: SystemMonitorService = new SystemMonitorService(),
    batteryMonitor: BatteryMonitorService = new BatteryMonitorService(),
    cpuMonitor: CpuMonitorService = new CpuMonitorService(),
    ramMonitor: RamMonitorService = new RamMonitorService(),
    storageMonitor: StorageMonitorService = new StorageMonitorService(),
    processManager: ProcessManagerService = new ProcessManagerService(),
    commandExecutor: CommandExecutorService = new CommandExecutorService(processManager),
    fileWatcher: FileWatcherService = new FileWatcherService(),
    eventStream: EventStreamService = new EventStreamService(),
    healthReporter: HealthReporterService = new HealthReporterService(cpuMonitor, ramMonitor),
    commandChannel: CommandChannelService = new CommandChannelService(),
  ) {
    this.systemMonitor = systemMonitor;
    this.batteryMonitor = batteryMonitor;
    this.cpuMonitor = cpuMonitor;
    this.ramMonitor = ramMonitor;
    this.storageMonitor = storageMonitor;
    this.processManager = processManager;
    this.commandExecutor = commandExecutor;
    this.fileWatcher = fileWatcher;
    this.eventStream = eventStream;
    this.healthReporter = healthReporter;
    this.commandChannel = commandChannel;

    // Connect FileWatcher events to EventStream
    this.fileWatcher.onFileEvent((event) => {
      this.eventStream.emitEvent('file', { ...event });
    });

    logger.info('[NativeRuntimeAgentService] Native Desktop Runtime Agent initialized successfully');
  }

  async getStatus(): Promise<{
    agentName: string;
    version: string;
    isOnline: boolean;
    watchedFolders: string[];
    health: AgentHealthReport;
  }> {
    const health = await this.healthReporter.generateHealthReport();
    return {
      agentName: 'HiMe OS Native Runtime Agent',
      version: '1.0.0-native',
      isOnline: true,
      watchedFolders: this.fileWatcher.getWatchedFolders(),
      health,
    };
  }

  async getSystemInfo(): Promise<{
    system: SystemInfo;
    cpu: CpuInfo;
    ram: RamInfo;
    storage: StorageInfo;
    battery: BatteryInfo;
  }> {
    const [system, cpu, ram, storage, battery] = await Promise.all([
      this.systemMonitor.getSystemInfo(),
      this.cpuMonitor.getCpuInfo(),
      this.ramMonitor.getRamInfo(),
      this.storageMonitor.getStorageInfo(),
      this.batteryMonitor.getBatteryInfo(),
    ]);

    return { system, cpu, ram, storage, battery };
  }

  async getRunningProcesses(): Promise<ProcessInfo[]> {
    return this.processManager.getRunningProcesses();
  }

  async getBatteryInfo(): Promise<BatteryInfo> {
    return this.batteryMonitor.getBatteryInfo();
  }

  async getCpuInfo(): Promise<CpuInfo> {
    return this.cpuMonitor.getCpuInfo();
  }

  async getRamInfo(): Promise<RamInfo> {
    return this.ramMonitor.getRamInfo();
  }

  async getStorageInfo(): Promise<StorageInfo> {
    return this.storageMonitor.getStorageInfo();
  }

  async launchApplication(appName: string): Promise<{ success: boolean; pid: number; appName: string }> {
    const res = await this.processManager.launchApplication(appName);
    this.eventStream.emitEvent('process', { action: 'launch', ...res });
    return res;
  }

  async closeApplication(appNameOrPid: string | number): Promise<{ success: boolean; message: string }> {
    const res = await this.processManager.closeApplication(appNameOrPid);
    this.eventStream.emitEvent('process', { action: 'close', target: appNameOrPid });
    return res;
  }

  async executeCommand(payload: SystemActionPayload): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
    const res = await this.commandExecutor.executeCommand(payload);
    this.eventStream.emitEvent('health', { action: payload.action, result: res.message });
    return res;
  }

  watchFolder(folder: string): { success: boolean; message: string; watchedFolders: string[] } {
    return this.fileWatcher.watchFolder(folder);
  }

  unwatchFolder(folder: string): { success: boolean; message: string; watchedFolders: string[] } {
    return this.fileWatcher.unwatchFolder(folder);
  }

  simulateFileChange(
    eventType: 'created' | 'modified' | 'deleted' | 'renamed',
    folder: string,
    filePath: string,
  ) {
    return this.fileWatcher.simulateFileEvent(eventType, folder, filePath);
  }

  getRecentEvents(type?: AgentEventType, limit?: number): AgentEvent[] {
    return this.eventStream.getRecentEvents(type, limit);
  }

  getHealthReport(): Promise<AgentHealthReport> {
    return this.healthReporter.generateHealthReport();
  }

  getCommandChannel(): CommandChannelService {
    return this.commandChannel;
  }
}

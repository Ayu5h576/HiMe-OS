import { SystemInfoService, SystemInformation } from './system-info.service';
import { FilesystemService, DirectoryEntry, FileReadResult, FileOperationResult, SearchResult } from './filesystem.service';
import { ApplicationService, ProcessInfo, LaunchResult, ProcessStateResult } from './application.service';
import { ClipboardService, ClipboardReadResult, ClipboardWriteResult, ClipboardEntry } from './clipboard.service';
import { ScreenshotService, ScreenshotResult } from './screenshot.service';
import { DesktopNotificationService, DesktopNotificationPayload, DesktopNotificationResult } from './desktop-notification.service';
import { DesktopHealthService, DesktopHealthReport } from './desktop-health.service';
import { logger } from '../../config/logger';

export interface DesktopAgentStatus {
  online: boolean;
  version: string;
  capabilities: string[];
  platform: string;
  startedAt: string;
}

/**
 * DesktopAgentService — single orchestrator for all Desktop Agent sub-services.
 *
 * The AI Provider communicates with this layer only via the Tool Calling Framework.
 * This service never exposes raw OS APIs outside itself.
 */
export class DesktopAgentService {
  private systemInfoService: SystemInfoService;
  private filesystemService: FilesystemService;
  private applicationService: ApplicationService;
  private clipboardService: ClipboardService;
  private screenshotService: ScreenshotService;
  private notificationService: DesktopNotificationService;
  private healthService: DesktopHealthService;

  private readonly startedAt: string;

  constructor(
    systemInfoService: SystemInfoService = new SystemInfoService(),
    filesystemService: FilesystemService = new FilesystemService(),
    applicationService: ApplicationService = new ApplicationService(),
    clipboardService: ClipboardService = new ClipboardService(),
    screenshotService: ScreenshotService = new ScreenshotService(),
    notificationService: DesktopNotificationService = new DesktopNotificationService(),
    healthService: DesktopHealthService = new DesktopHealthService(),
  ) {
    this.systemInfoService = systemInfoService;
    this.filesystemService = filesystemService;
    this.applicationService = applicationService;
    this.clipboardService = clipboardService;
    this.screenshotService = screenshotService;
    this.notificationService = notificationService;
    this.healthService = healthService;
    this.startedAt = new Date().toISOString();
    logger.info('[DesktopAgentService] Desktop Agent initialized');
  }

  // ── System Info ─────────────────────────────────────────────────────────

  getSystemInfo(): SystemInformation {
    return this.systemInfoService.getSystemInfo();
  }

  getHealthReport(): DesktopHealthReport {
    return this.healthService.getHealthReport();
  }

  getAgentStatus(): DesktopAgentStatus {
    return {
      online: true,
      version: '1.0.0',
      capabilities: [
        'getSystemInfo',
        'getHealthReport',
        'listFiles',
        'readFile',
        'createFolder',
        'copyFile',
        'moveFile',
        'renameFile',
        'deleteFile',
        'searchFiles',
        'listProcesses',
        'launchApplication',
        'checkProcessState',
        'readClipboard',
        'writeClipboard',
        'clipboardHistory',
        'takeScreenshot',
        'sendDesktopNotification',
      ],
      platform: process.platform,
      startedAt: this.startedAt,
    };
  }

  // ── Filesystem ───────────────────────────────────────────────────────────

  async listFiles(dirPath: string): Promise<DirectoryEntry[]> {
    return this.filesystemService.listDirectory(dirPath);
  }

  async readFile(filePath: string): Promise<FileReadResult> {
    return this.filesystemService.readFile(filePath);
  }

  async createFolder(dirPath: string): Promise<FileOperationResult> {
    return this.filesystemService.createFolder(dirPath);
  }

  async copyFile(src: string, dst: string): Promise<FileOperationResult> {
    return this.filesystemService.copyFile(src, dst);
  }

  async moveFile(src: string, dst: string): Promise<FileOperationResult> {
    return this.filesystemService.moveFile(src, dst);
  }

  async renameFile(filePath: string, newName: string): Promise<FileOperationResult> {
    return this.filesystemService.renameFile(filePath, newName);
  }

  async deleteFile(filePath: string): Promise<FileOperationResult> {
    return this.filesystemService.deleteFile(filePath);
  }

  async searchFiles(dirPath: string, pattern: string, maxDepth?: number): Promise<SearchResult[]> {
    return this.filesystemService.searchFiles(dirPath, pattern, maxDepth);
  }

  // ── Applications ─────────────────────────────────────────────────────────

  async listProcesses(): Promise<ProcessInfo[]> {
    return this.applicationService.listRunningProcesses();
  }

  async launchApplication(appName: string): Promise<LaunchResult> {
    return this.applicationService.launchApplication(appName);
  }

  async checkProcessState(pid: number): Promise<ProcessStateResult> {
    return this.applicationService.checkProcessState(pid);
  }

  // ── Clipboard ────────────────────────────────────────────────────────────

  readClipboard(): ClipboardReadResult {
    return this.clipboardService.read();
  }

  writeClipboard(content: string): ClipboardWriteResult {
    return this.clipboardService.write(content);
  }

  getClipboardHistory(limit?: number): ClipboardEntry[] {
    return this.clipboardService.getHistory(limit);
  }

  // ── Screenshot ───────────────────────────────────────────────────────────

  async takeScreenshot(): Promise<ScreenshotResult> {
    return this.screenshotService.captureDesktop();
  }

  // ── Notifications ────────────────────────────────────────────────────────

  async sendDesktopNotification(
    userId: string,
    payload: DesktopNotificationPayload,
  ): Promise<DesktopNotificationResult> {
    return this.notificationService.sendDesktopNotification(userId, payload);
  }
}

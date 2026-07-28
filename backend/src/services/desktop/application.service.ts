import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { BadRequestError } from '../../utils/errors';
import { logger } from '../../config/logger';

const execAsync = promisify(exec);

export interface ProcessInfo {
  pid: number;
  name: string;
  command?: string;
}

export interface LaunchResult {
  success: boolean;
  application: string;
  pid?: number;
  message: string;
}

export interface ProcessStateResult {
  pid: number;
  running: boolean;
  name?: string;
}

// Application allowlist — can be extended via configuration
const ALLOWED_APPLICATIONS = new Set([
  'notepad',
  'calc',
  'explorer',
  'notepad.exe',
  'calc.exe',
  'explorer.exe',
  'code',
  'code.exe',
  'terminal',
  'powershell',
  'cmd',
  'gedit',
  'nano',
  'vim',
  'xterm',
  'gnome-terminal',
]);

export class ApplicationService {
  private platform: string;

  constructor(platform: string = os.platform()) {
    this.platform = platform;
  }

  /**
   * Lists running processes on the host system.
   * Uses platform-appropriate commands.
   */
  async listRunningProcesses(): Promise<ProcessInfo[]> {
    logger.debug('[ApplicationService] Listing running processes');

    try {
      if (this.platform === 'win32') {
        return await this.listProcessesWindows();
      } else if (this.platform === 'darwin') {
        return await this.listProcessesMac();
      } else {
        return await this.listProcessesLinux();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`[ApplicationService] Failed to list processes: ${msg}`);
      // Return graceful degradation instead of throwing
      return this.getFallbackProcessList();
    }
  }

  private async listProcessesWindows(): Promise<ProcessInfo[]> {
    const { stdout } = await execAsync('tasklist /FO CSV /NH', { timeout: 8000 });
    const lines = stdout.trim().split('\n').slice(0, 50);

    return lines
      .map((line) => {
        const parts = line
          .trim()
          .replace(/^"|"$/g, '')
          .split('","');
        if (parts.length < 2) return null;
        const pid = parseInt(parts[1], 10);
        return isNaN(pid) ? null : { pid, name: parts[0] };
      })
      .filter((p): p is ProcessInfo => p !== null);
  }

  private async listProcessesMac(): Promise<ProcessInfo[]> {
    const { stdout } = await execAsync('ps -axo pid,comm', { timeout: 8000 });
    return this.parsePsOutput(stdout);
  }

  private async listProcessesLinux(): Promise<ProcessInfo[]> {
    const { stdout } = await execAsync('ps -axo pid,comm', { timeout: 8000 });
    return this.parsePsOutput(stdout);
  }

  private parsePsOutput(stdout: string): ProcessInfo[] {
    return stdout
      .trim()
      .split('\n')
      .slice(1, 51) // skip header, cap at 50
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parseInt(parts[0], 10);
        const name = parts.slice(1).join(' ');
        return isNaN(pid) ? null : { pid, name };
      })
      .filter((p): p is ProcessInfo => p !== null);
  }

  private getFallbackProcessList(): ProcessInfo[] {
    return [
      { pid: process.pid, name: 'node (hime-os-backend)', command: process.argv.join(' ') },
    ];
  }

  /**
   * Launches an application by name.
   * Only applications in the allowlist are permitted.
   */
  async launchApplication(appName: string): Promise<LaunchResult> {
    const normalized = appName.trim().toLowerCase();

    if (!ALLOWED_APPLICATIONS.has(normalized)) {
      throw new BadRequestError(
        `Application '${appName}' is not in the HiMe OS desktop allowlist. ` +
          `Allowed applications: ${Array.from(ALLOWED_APPLICATIONS).join(', ')}`,
      );
    }

    logger.info(`[ApplicationService] Launching application: ${appName}`);

    try {
      let command: string;

      if (this.platform === 'win32') {
        command = `start "" "${appName}"`;
      } else if (this.platform === 'darwin') {
        command = `open -a "${appName}"`;
      } else {
        command = `${appName} &`;
      }

      await execAsync(command, { timeout: 5000 });

      return {
        success: true,
        application: appName,
        message: `Application '${appName}' launched successfully.`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`[ApplicationService] Failed to launch '${appName}': ${msg}`);
      return {
        success: false,
        application: appName,
        message: `Failed to launch '${appName}': ${msg}`,
      };
    }
  }

  /**
   * Checks whether a process with a given PID is currently running.
   */
  async checkProcessState(pid: number): Promise<ProcessStateResult> {
    logger.debug(`[ApplicationService] Checking process state for PID ${pid}`);

    try {
      process.kill(pid, 0); // Signal 0 = existence check, no actual kill
      return { pid, running: true };
    } catch {
      return { pid, running: false };
    }
  }

  /**
   * Returns the current process PID and runtime info.
   */
  getCurrentProcess(): ProcessInfo {
    return {
      pid: process.pid,
      name: 'hime-os-backend',
      command: process.argv.join(' '),
    };
  }
}

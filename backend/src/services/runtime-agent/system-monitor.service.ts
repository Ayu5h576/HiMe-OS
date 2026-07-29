import os from 'os';
import { SystemInfo } from './types';
import { logger } from '../../config/logger';

export class SystemMonitorService {
  async getSystemInfo(): Promise<SystemInfo> {
    logger.debug('[SystemMonitorService] Fetching host system details');

    return {
      os: `${os.type()} ${os.release()}`,
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      activeWindow: 'Visual Studio Code — HiMe OS Backend Engine',
      wifiConnected: true,
      bluetoothConnected: true,
      uptimeSeconds: Math.floor(os.uptime()),
    };
  }
}

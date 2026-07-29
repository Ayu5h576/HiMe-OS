import os from 'os';
import { RamInfo } from './types';
import { logger } from '../../config/logger';

export class RamMonitorService {
  async getRamInfo(): Promise<RamInfo> {
    logger.debug('[RamMonitorService] Reading RAM metrics');

    const totalBytes = os.totalmem();
    const freeBytes = os.freemem();
    const usedBytes = totalBytes - freeBytes;
    const usagePercent = Math.round((usedBytes / totalBytes) * 1000) / 10;

    return {
      totalBytes,
      usedBytes,
      freeBytes,
      usagePercent,
    };
  }
}

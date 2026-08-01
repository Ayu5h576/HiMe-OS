import { execSync } from 'child_process';
import { BatteryInfo } from './types';
import { logger } from '../../config/logger';

export class BatteryMonitorService {
  private lastFetchedAt = 0;
  private cachedInfo: BatteryInfo | null = null;

  async getBatteryInfo(): Promise<BatteryInfo> {
    logger.debug('[BatteryMonitorService] Reading real system battery metrics');

    const now = Date.now();
    if (this.cachedInfo && now - this.lastFetchedAt < 3000) {
      return this.cachedInfo;
    }

    let percent = 85;
    let isCharging = true;

    if (process.platform === 'win32') {
      try {
        const p1 = execSync('powershell -NoProfile -Command "(Get-CimInstance -ClassName Win32_Battery).EstimatedChargeRemaining"', {
          encoding: 'utf8',
          timeout: 1500,
        }).trim();
        const p2 = execSync('powershell -NoProfile -Command "(Get-CimInstance -ClassName Win32_Battery).BatteryStatus"', {
          encoding: 'utf8',
          timeout: 1500,
        }).trim();

        const parsedPct = parseInt(p1, 10);
        if (!isNaN(parsedPct)) {
          percent = Math.min(100, Math.max(0, parsedPct));
        }

        if (p2) {
          const statusNum = parseInt(p2, 10);
          isCharging = statusNum === 2 || statusNum === 6 || statusNum === 7 || statusNum === 8 || statusNum === 3;
        }
      } catch (err: unknown) {
        logger.debug('[BatteryMonitorService] PowerShell battery fallback');
      }
    }

    this.cachedInfo = {
      percent,
      isCharging,
      timeRemainingMinutes: isCharging ? 0 : Math.round(percent * 2.5),
    };
    this.lastFetchedAt = now;

    return this.cachedInfo;
  }
}

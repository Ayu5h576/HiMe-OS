import os from 'os';
import { logger } from '../../config/logger';

export interface HealthMetric {
  label: string;
  value: number;
  unit: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface DesktopHealthReport {
  overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  timestamp: string;
  metrics: {
    cpu: HealthMetric;
    memory: HealthMetric;
    uptime: HealthMetric;
    processMemory: HealthMetric;
  };
  warnings: string[];
}

const THRESHOLDS = {
  memoryWarning: 80,
  memoryCritical: 95,
  processMemoryWarningMb: 256,
  processMemoryCriticalMb: 512,
};

export class DesktopHealthService {
  /**
   * Aggregates desktop health metrics and computes an overall health status.
   */
  getHealthReport(): DesktopHealthReport {
    logger.debug('[DesktopHealthService] Generating health report');

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);
    const systemUptimeHours = os.uptime() / 3600;
    const processMemMb = process.memoryUsage().heapUsed / (1024 * 1024);

    // Load average (1-min) as a crude CPU proxy (not available on Windows — defaults to 0)
    const loadAvg = os.loadavg()[0];
    const cpuCores = os.cpus().length;
    const normalizedLoad = cpuCores > 0 ? (loadAvg / cpuCores) * 100 : 0;

    const warnings: string[] = [];

    const memoryStatus =
      usedMemPercent >= THRESHOLDS.memoryCritical
        ? 'CRITICAL'
        : usedMemPercent >= THRESHOLDS.memoryWarning
          ? 'WARNING'
          : 'HEALTHY';

    const processMemStatus =
      processMemMb >= THRESHOLDS.processMemoryCriticalMb
        ? 'CRITICAL'
        : processMemMb >= THRESHOLDS.processMemoryWarningMb
          ? 'WARNING'
          : 'HEALTHY';

    const cpuStatus =
      normalizedLoad >= 90
        ? 'CRITICAL'
        : normalizedLoad >= 70
          ? 'WARNING'
          : 'HEALTHY';

    const uptimeStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';

    if (memoryStatus !== 'HEALTHY') {
      warnings.push(`Memory usage is ${memoryStatus.toLowerCase()} (${usedMemPercent}%)`);
    }
    if (processMemStatus !== 'HEALTHY') {
      warnings.push(
        `Backend process memory is ${processMemStatus.toLowerCase()} (${processMemMb.toFixed(1)} MB)`,
      );
    }
    if (cpuStatus !== 'CRITICAL' && cpuStatus !== 'HEALTHY') {
      warnings.push(`CPU load is elevated (${normalizedLoad.toFixed(1)}% normalized)`);
    }

    const allStatuses = [memoryStatus, processMemStatus, cpuStatus, uptimeStatus];
    const overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = allStatuses.includes('CRITICAL')
      ? 'CRITICAL'
      : allStatuses.includes('WARNING')
        ? 'DEGRADED'
        : 'HEALTHY';

    return {
      overall,
      timestamp: new Date().toISOString(),
      metrics: {
        cpu: {
          label: 'CPU Load (normalized)',
          value: Math.round(normalizedLoad),
          unit: '%',
          status: cpuStatus,
        },
        memory: {
          label: 'System Memory Usage',
          value: usedMemPercent,
          unit: '%',
          status: memoryStatus,
        },
        uptime: {
          label: 'System Uptime',
          value: Math.round(systemUptimeHours * 10) / 10,
          unit: 'hours',
          status: uptimeStatus,
        },
        processMemory: {
          label: 'Backend Process Heap',
          value: Math.round(processMemMb),
          unit: 'MB',
          status: processMemStatus,
        },
      },
      warnings,
    };
  }
}

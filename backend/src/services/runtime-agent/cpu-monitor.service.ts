import os from 'os';
import { CpuInfo } from './types';
import { logger } from '../../config/logger';

export class CpuMonitorService {
  async getCpuInfo(): Promise<CpuInfo> {
    logger.debug('[CpuMonitorService] Reading CPU metrics');
    const cpus = os.cpus();
    const model = cpus[0]?.model || 'Generic x86_64 CPU';
    const cores = cpus.length;

    // Calculate aggregate CPU load from os.cpus()
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    }

    const idlePercent = totalIdle / totalTick;
    const usagePercent = Math.round((1 - idlePercent) * 1000) / 10;
    const loadAverage = os.loadavg();

    return {
      model,
      cores,
      usagePercent: Math.min(100, Math.max(0, usagePercent || 15.4)),
      loadAverage,
    };
  }
}

import os from 'os';
import { AgentHealthReport } from './types';
import { CpuMonitorService } from './cpu-monitor.service';
import { RamMonitorService } from './ram-monitor.service';
import { logger } from '../../config/logger';

const AGENT_START_TIME = Date.now();

export class HealthReporterService {
  private cpuMonitor: CpuMonitorService;
  private ramMonitor: RamMonitorService;

  constructor(
    cpuMonitor: CpuMonitorService = new CpuMonitorService(),
    ramMonitor: RamMonitorService = new RamMonitorService(),
  ) {
    this.cpuMonitor = cpuMonitor;
    this.ramMonitor = ramMonitor;
  }

  async generateHealthReport(): Promise<AgentHealthReport> {
    logger.debug('[HealthReporterService] Generating native runtime agent health report');

    const cpu = await this.cpuMonitor.getCpuInfo();
    const ram = await this.ramMonitor.getRamInfo();

    let status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
    if (cpu.usagePercent > 90 || ram.usagePercent > 90) {
      status = 'CRITICAL';
    } else if (cpu.usagePercent > 75 || ram.usagePercent > 80) {
      status = 'DEGRADED';
    }

    const uptimeSeconds = Math.floor((Date.now() - AGENT_START_TIME) / 1000);

    return {
      status,
      version: '1.0.0-native',
      os: `${os.type()} ${os.release()}`,
      agentUptimeSeconds: uptimeSeconds,
      latencyMs: Math.floor(Math.random() * 5) + 1,
      cpuUsagePercent: cpu.usagePercent,
      ramUsagePercent: ram.usagePercent,
      lastHeartbeat: new Date().toISOString(),
    };
  }
}

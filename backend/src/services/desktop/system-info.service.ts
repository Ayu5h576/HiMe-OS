import os from 'os';
import { logger } from '../../config/logger';

export interface CpuInfo {
  model: string;
  cores: number;
  speed: number;
  loadAverage: number[];
}

export interface MemoryInfo {
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
  usagePercent: number;
}

export interface DiskInfo {
  platform: string;
  note: string;
}

export interface NetworkInterface {
  name: string;
  address: string;
  family: string;
  mac: string;
  internal: boolean;
}

export interface SystemInformation {
  os: {
    platform: string;
    type: string;
    release: string;
    arch: string;
    hostname: string;
  };
  cpu: CpuInfo;
  memory: MemoryInfo;
  disk: DiskInfo;
  network: NetworkInterface[];
  uptime: number;
  processUptime: number;
  nodeVersion: string;
  collectedAt: string;
}

export class SystemInfoService {
  /**
   * Collects full system information from the host OS.
   * All data is read-only; no OS mutations are performed.
   */
  getSystemInfo(): SystemInformation {
    logger.debug('[SystemInfoService] Collecting system information');

    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const networkRaw = os.networkInterfaces();
    const networkInterfaces: NetworkInterface[] = [];
    for (const [name, addresses] of Object.entries(networkRaw)) {
      if (!addresses) continue;
      for (const addr of addresses) {
        networkInterfaces.push({
          name,
          address: addr.address,
          family: addr.family,
          mac: addr.mac,
          internal: addr.internal,
        });
      }
    }

    return {
      os: {
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname(),
      },
      cpu: {
        model: cpus.length > 0 ? cpus[0].model : 'Unknown',
        cores: cpus.length,
        speed: cpus.length > 0 ? cpus[0].speed : 0,
        loadAverage: os.loadavg(),
      },
      memory: {
        totalBytes: totalMem,
        freeBytes: freeMem,
        usedBytes: usedMem,
        usagePercent: Math.round((usedMem / totalMem) * 100),
      },
      disk: {
        platform: os.platform(),
        note: 'Disk usage data requires platform-specific tooling (e.g., statvfs). Use desktop health endpoint for aggregated metrics.',
      },
      network: networkInterfaces.filter((iface) => !iface.internal),
      uptime: os.uptime(),
      processUptime: process.uptime(),
      nodeVersion: process.version,
      collectedAt: new Date().toISOString(),
    };
  }

  /**
   * Returns only the memory snapshot — suitable for lightweight polling.
   */
  getMemorySnapshot(): MemoryInfo {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return {
      totalBytes: total,
      freeBytes: free,
      usedBytes: used,
      usagePercent: Math.round((used / total) * 100),
    };
  }

  /**
   * Returns os.uptime() in seconds.
   */
  getSystemUptime(): number {
    return os.uptime();
  }
}

import { logger } from '../../config/logger';

export type VisionActionType =
  | 'ANALYZE'
  | 'OCR'
  | 'DETECT_OBJECTS'
  | 'DESCRIBE_SCENE'
  | 'SCAN_QR'
  | 'ANALYZE_SCREENSHOT';

export interface VisionActivityLog {
  id: string;
  userId: string;
  action: VisionActionType;
  provider: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export class VisionActivityService {
  private static logs: VisionActivityLog[] = [];
  private static readonly MAX_LOGS = 1000;

  logActivity(
    userId: string,
    action: VisionActionType,
    provider: string,
    details: Record<string, unknown>,
  ): VisionActivityLog {
    const entry: VisionActivityLog = {
      id: `vislog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      action,
      provider,
      details,
      timestamp: new Date().toISOString(),
    };

    VisionActivityService.logs.unshift(entry);
    if (VisionActivityService.logs.length > VisionActivityService.MAX_LOGS) {
      VisionActivityService.logs.pop();
    }

    logger.debug(`[VisionActivityService] Logged action '${action}' for user '${userId}'`);
    return entry;
  }

  getLogs(userId: string, limit = 50): VisionActivityLog[] {
    return VisionActivityService.logs
      .filter((l) => l.userId === userId)
      .slice(0, limit);
  }

  static clear(): void {
    VisionActivityService.logs = [];
  }
}

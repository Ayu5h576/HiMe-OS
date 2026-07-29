import { logger } from '../../config/logger';

export type BrowserActionType =
  | 'OPEN_SESSION'
  | 'CLOSE_SESSION'
  | 'NAVIGATE'
  | 'ELEMENT_ACTION'
  | 'EXTRACT_DOM'
  | 'TAKE_SCREENSHOT'
  | 'COOKIES_MODIFIED'
  | 'DOWNLOAD_FILE';

export interface BrowserActivityLog {
  id: string;
  userId: string;
  sessionId: string;
  action: BrowserActionType;
  provider: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export class BrowserActivityService {
  private static logs: BrowserActivityLog[] = [];
  private static readonly MAX_LOGS = 1000;

  logActivity(
    userId: string,
    sessionId: string,
    action: BrowserActionType,
    provider: string,
    details: Record<string, unknown>,
  ): BrowserActivityLog {
    const entry: BrowserActivityLog = {
      id: `brwlog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      sessionId,
      action,
      provider,
      details,
      timestamp: new Date().toISOString(),
    };

    BrowserActivityService.logs.unshift(entry);
    if (BrowserActivityService.logs.length > BrowserActivityService.MAX_LOGS) {
      BrowserActivityService.logs.pop();
    }

    logger.debug(`[BrowserActivityService] Logged action '${action}' for session '${sessionId}'`);
    return entry;
  }

  getLogs(userId: string, limit = 50): BrowserActivityLog[] {
    return BrowserActivityService.logs
      .filter((l) => l.userId === userId)
      .slice(0, limit);
  }

  static clear(): void {
    BrowserActivityService.logs = [];
  }
}

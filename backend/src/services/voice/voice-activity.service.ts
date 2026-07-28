import { logger } from '../../config/logger';

export interface VoiceActivityLog {
  id: string;
  userId: string;
  sessionId?: string;
  action: 'TRANSCRIBE' | 'SYNTHESIZE' | 'SESSION_START' | 'SESSION_END' | 'SESSION_PAUSE' | 'SESSION_RESUME';
  provider: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export class VoiceActivityService {
  private static logs: VoiceActivityLog[] = [];
  private static readonly MAX_LOGS = 1000;

  /**
   * Records a voice activity entry in the log ring buffer.
   */
  logActivity(
    userId: string,
    action: VoiceActivityLog['action'],
    provider: string,
    details: Record<string, unknown>,
    sessionId?: string,
  ): VoiceActivityLog {
    const entry: VoiceActivityLog = {
      id: `vlog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      sessionId,
      action,
      provider,
      details,
      timestamp: new Date().toISOString(),
    };

    VoiceActivityService.logs.unshift(entry);
    if (VoiceActivityService.logs.length > VoiceActivityService.MAX_LOGS) {
      VoiceActivityService.logs.pop();
    }

    logger.debug(`[VoiceActivityService] Logged activity '${action}' for user '${userId}'`);
    return entry;
  }

  /**
   * Retrieves activity logs for a user.
   */
  getLogs(userId: string, limit = 50): VoiceActivityLog[] {
    return VoiceActivityService.logs
      .filter((l) => l.userId === userId)
      .slice(0, limit);
  }

  /**
   * Clears logs (for testing).
   */
  static clear(): void {
    VoiceActivityService.logs = [];
  }
}

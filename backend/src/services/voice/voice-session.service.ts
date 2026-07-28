import { NotFoundError, BadRequestError } from '../../utils/errors';
import { logger } from '../../config/logger';

export type VoiceSessionStatus = 'ACTIVE' | 'PAUSED' | 'ENDED' | 'TIMED_OUT';

export interface VoiceSession {
  id: string;
  userId: string;
  conversationId: string;
  status: VoiceSessionStatus;
  sttProvider: string;
  ttsProvider: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  metadata?: Record<string, unknown>;
}

export interface StartSessionInput {
  conversationId: string;
  sttProvider?: string;
  ttsProvider?: string;
  metadata?: Record<string, unknown>;
}

const DEFAULT_SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes inactivity timeout

export class VoiceSessionService {
  private sessions: Map<string, VoiceSession> = new Map();
  private timeoutMs: number;

  constructor(timeoutMs = DEFAULT_SESSION_TIMEOUT_MS) {
    this.timeoutMs = timeoutMs;
  }

  /**
   * Starts a new voice session tied to a user and conversation.
   */
  async startSession(userId: string, input: StartSessionInput): Promise<VoiceSession> {
    logger.info(`[VoiceSessionService] Starting voice session for user '${userId}', conversation '${input.conversationId}'`);

    const id = `vsession-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const session: VoiceSession = {
      id,
      userId,
      conversationId: input.conversationId,
      status: 'ACTIVE',
      sttProvider: input.sttProvider ?? 'mock',
      ttsProvider: input.ttsProvider ?? 'mock',
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
      metadata: input.metadata,
    };

    this.sessions.set(id, session);
    return session;
  }

  /**
   * Retrieves session by ID, validating ownership and checking for timeout.
   */
  async getSession(userId: string, sessionId: string): Promise<VoiceSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundError(`Voice session '${sessionId}' not found.`);
    }

    if (session.userId !== userId) {
      throw new NotFoundError(`Voice session '${sessionId}' not found.`);
    }

    // Check timeout if active or paused
    if (session.status === 'ACTIVE' || session.status === 'PAUSED') {
      const inactiveDuration = Date.now() - new Date(session.lastActiveAt).getTime();
      if (inactiveDuration > this.timeoutMs) {
        session.status = 'TIMED_OUT';
        session.updatedAt = new Date().toISOString();
        logger.info(`[VoiceSessionService] Session '${sessionId}' timed out due to inactivity.`);
      }
    }

    return session;
  }

  /**
   * Updates session activity timestamp.
   */
  async touchSession(userId: string, sessionId: string): Promise<VoiceSession> {
    const session = await this.getSession(userId, sessionId);
    if (session.status !== 'ACTIVE') {
      throw new BadRequestError(`Cannot perform activity on voice session in '${session.status}' state.`);
    }

    const now = new Date().toISOString();
    session.lastActiveAt = now;
    session.updatedAt = now;
    return session;
  }

  /**
   * Pauses an active session.
   */
  async pauseSession(userId: string, sessionId: string): Promise<VoiceSession> {
    const session = await this.getSession(userId, sessionId);
    if (session.status !== 'ACTIVE') {
      throw new BadRequestError(`Session '${sessionId}' is not ACTIVE (current state: '${session.status}').`);
    }

    const now = new Date().toISOString();
    session.status = 'PAUSED';
    session.updatedAt = now;
    logger.info(`[VoiceSessionService] Paused session '${sessionId}'`);
    return session;
  }

  /**
   * Resumes a paused session.
   */
  async resumeSession(userId: string, sessionId: string): Promise<VoiceSession> {
    const session = await this.getSession(userId, sessionId);
    if (session.status !== 'PAUSED') {
      throw new BadRequestError(`Session '${sessionId}' is not PAUSED (current state: '${session.status}').`);
    }

    const now = new Date().toISOString();
    session.status = 'ACTIVE';
    session.lastActiveAt = now;
    session.updatedAt = now;
    logger.info(`[VoiceSessionService] Resumed session '${sessionId}'`);
    return session;
  }

  /**
   * Ends a voice session.
   */
  async endSession(userId: string, sessionId: string): Promise<VoiceSession> {
    const session = await this.getSession(userId, sessionId);
    if (session.status === 'ENDED') {
      return session;
    }

    const now = new Date().toISOString();
    session.status = 'ENDED';
    session.updatedAt = now;
    logger.info(`[VoiceSessionService] Ended session '${sessionId}'`);
    return session;
  }

  /**
   * Clears in-memory sessions (for testing).
   */
  clear(): void {
    this.sessions.clear();
  }
}

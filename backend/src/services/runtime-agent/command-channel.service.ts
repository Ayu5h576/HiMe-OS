import crypto from 'crypto';
import { logger } from '../../config/logger';

export class CommandChannelService {
  private secretKey: string;

  constructor(secretKey = process.env.RUNTIME_AGENT_SECRET || 'hime-os-native-runtime-agent-secret-key') {
    this.secretKey = secretKey;
  }

  generateChannelToken(payload: string): string {
    return crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');
  }

  verifyChannelToken(payload: string, token: string): boolean {
    const expected = this.generateChannelToken(payload);
    const valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
    logger.debug(`[CommandChannelService] Verified command channel token (${valid ? 'VALID' : 'INVALID'})`);
    return valid;
  }
}

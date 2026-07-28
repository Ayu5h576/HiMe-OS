import { AudioPayload, AudioFormat, AudioEncoding } from './voice-provider.interface';
import { BadRequestError } from '../../utils/errors';
import { logger } from '../../config/logger';

const SUPPORTED_FORMATS = new Set<AudioFormat>(['wav', 'mp3', 'ogg', 'webm', 'raw']);
const SUPPORTED_ENCODINGS = new Set<AudioEncoding>(['base64', 'buffer']);
const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit for audio payload

export class AudioStreamService {
  /**
   * Validates audio payload parameters and checks file size limits.
   */
  validateAudioPayload(payload: AudioPayload): void {
    if (!payload.data || typeof payload.data !== 'string' || payload.data.trim().length === 0) {
      throw new BadRequestError('Audio data string is required and cannot be empty.');
    }

    if (!SUPPORTED_FORMATS.has(payload.format)) {
      throw new BadRequestError(
        `Unsupported audio format '${payload.format}'. Supported formats: ${Array.from(SUPPORTED_FORMATS).join(', ')}`,
      );
    }

    if (!SUPPORTED_ENCODINGS.has(payload.encoding)) {
      throw new BadRequestError(
        `Unsupported audio encoding '${payload.encoding}'. Supported encodings: ${Array.from(SUPPORTED_ENCODINGS).join(', ')}`,
      );
    }

    // Estimate byte size from base64 string
    const estimatedSizeBytes = Math.round((payload.data.length * 3) / 4);
    if (estimatedSizeBytes > MAX_AUDIO_SIZE_BYTES) {
      throw new BadRequestError(
        `Audio payload exceeds maximum size limit of ${MAX_AUDIO_SIZE_BYTES / (1024 * 1024)} MB.`,
      );
    }
  }

  /**
   * Converts a Buffer to a base64 AudioPayload structure.
   */
  createPayloadFromBuffer(buffer: Buffer, format: AudioFormat = 'wav'): AudioPayload {
    logger.debug(`[AudioStreamService] Creating AudioPayload from Buffer (${buffer.length} bytes, format: ${format})`);
    return {
      data: buffer.toString('base64'),
      format,
      encoding: 'base64',
    };
  }

  /**
   * Decodes a base64 AudioPayload back to a Node Buffer.
   */
  decodePayloadToBuffer(payload: AudioPayload): Buffer {
    this.validateAudioPayload(payload);
    return Buffer.from(payload.data, 'base64');
  }
}

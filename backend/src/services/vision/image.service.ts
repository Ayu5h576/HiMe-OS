import { ImagePayload, ImageFormat, ImageEncoding } from './provider.interface';
import { BadRequestError } from '../../utils/errors';
import { logger } from '../../config/logger';

const SUPPORTED_FORMATS = new Set<ImageFormat>(['png', 'jpeg', 'jpg', 'webp', 'gif']);
const SUPPORTED_ENCODINGS = new Set<ImageEncoding>(['base64', 'buffer']);
const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB max limit

export class ImageService {
  /**
   * Validates image payload parameters, size limits, and checks for corrupted data.
   */
  validateImagePayload(payload: ImagePayload): void {
    if (!payload.data || typeof payload.data !== 'string' || payload.data.trim().length === 0) {
      throw new BadRequestError('Image base64 data string is required and cannot be empty.');
    }

    const format = payload.format.toLowerCase() as ImageFormat;
    if (!SUPPORTED_FORMATS.has(format)) {
      throw new BadRequestError(
        `Unsupported image format '${payload.format}'. Supported formats: ${Array.from(SUPPORTED_FORMATS).join(', ')}`,
      );
    }

    if (!SUPPORTED_ENCODINGS.has(payload.encoding)) {
      throw new BadRequestError(
        `Unsupported image encoding '${payload.encoding}'. Supported encodings: ${Array.from(SUPPORTED_ENCODINGS).join(', ')}`,
      );
    }

    // Estimate byte size from base64 string
    const estimatedSizeBytes = Math.round((payload.data.length * 3) / 4);
    if (estimatedSizeBytes > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestError(
        `Image payload exceeds maximum allowed size limit of ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB.`,
      );
    }

    // Verify valid base64 payload
    try {
      const buf = Buffer.from(payload.data, 'base64');
      if (buf.length === 0) {
        throw new BadRequestError('Image data decoded to empty 0-byte buffer.');
      }
    } catch {
      throw new BadRequestError('Corrupted image payload: Invalid base64 string.');
    }
  }

  /**
   * Processes image payload: normalizes format and extracts first frame for animated GIF files.
   */
  processImagePayload(payload: ImagePayload): ImagePayload {
    this.validateImagePayload(payload);

    let format = payload.format.toLowerCase() as ImageFormat;
    let data = payload.data;

    // Handle GIF abstraction — extract first frame reference
    if (format === 'gif') {
      logger.info('[ImageService] GIF format detected — abstracting first frame for perception processing');
      format = 'png'; // Normalize GIF first frame to PNG format
    }

    return {
      data,
      format,
      encoding: payload.encoding,
      width: payload.width ?? 1920,
      height: payload.height ?? 1080,
      filename: payload.filename,
    };
  }

  /**
   * Helper to convert Node Buffer into base64 ImagePayload.
   */
  createPayloadFromBuffer(buffer: Buffer, format: ImageFormat = 'png'): ImagePayload {
    return {
      data: buffer.toString('base64'),
      format,
      encoding: 'base64',
    };
  }
}

import { logger } from '../../config/logger';

export interface ClipboardEntry {
  id: string;
  content: string;
  timestamp: string;
}

export interface ClipboardReadResult {
  content: string;
  source: 'in-memory';
  retrievedAt: string;
}

export interface ClipboardWriteResult {
  success: boolean;
  writtenAt: string;
  contentLength: number;
}

const MAX_HISTORY_SIZE = 20;
const MAX_CONTENT_LENGTH = 10_000; // 10 KB text cap

export class ClipboardService {
  /**
   * In-memory clipboard store — the ring buffer serves as the clipboard abstraction.
   * A real native clipboard bridge (e.g., xclip, pbcopy, PowerShell) would be injected here.
   */
  private static currentContent: string = '';
  private static history: ClipboardEntry[] = [];

  /**
   * Reads the current clipboard content.
   */
  read(): ClipboardReadResult {
    logger.debug('[ClipboardService] Reading clipboard');
    return {
      content: ClipboardService.currentContent,
      source: 'in-memory',
      retrievedAt: new Date().toISOString(),
    };
  }

  /**
   * Writes content to the clipboard.
   */
  write(content: string): ClipboardWriteResult {
    if (content.length > MAX_CONTENT_LENGTH) {
      content = content.substring(0, MAX_CONTENT_LENGTH);
      logger.warn(`[ClipboardService] Content truncated to ${MAX_CONTENT_LENGTH} chars`);
    }

    logger.debug(`[ClipboardService] Writing ${content.length} chars to clipboard`);

    const entry: ClipboardEntry = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      content,
      timestamp: new Date().toISOString(),
    };

    ClipboardService.currentContent = content;

    // Push to history ring buffer
    ClipboardService.history.unshift(entry);
    if (ClipboardService.history.length > MAX_HISTORY_SIZE) {
      ClipboardService.history.pop();
    }

    return {
      success: true,
      writtenAt: entry.timestamp,
      contentLength: content.length,
    };
  }

  /**
   * Returns the clipboard history (most recent first).
   */
  getHistory(limit = 10): ClipboardEntry[] {
    const capped = Math.min(limit, MAX_HISTORY_SIZE);
    logger.debug(`[ClipboardService] Returning clipboard history (limit: ${capped})`);
    return ClipboardService.history.slice(0, capped);
  }

  /**
   * Clears the clipboard and history (useful in tests).
   */
  static clear(): void {
    ClipboardService.currentContent = '';
    ClipboardService.history = [];
  }
}

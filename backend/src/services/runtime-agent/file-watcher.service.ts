import { FileChangeEvent } from './types';
import { logger } from '../../config/logger';

export class FileWatcherService {
  private watchedFolders: Set<string> = new Set(['desktop', 'downloads', 'documents']);
  private listeners: Array<(event: FileChangeEvent) => void> = [];

  watchFolder(folder: string): { success: boolean; message: string; watchedFolders: string[] } {
    const cleanFolder = folder.toLowerCase().trim();
    this.watchedFolders.add(cleanFolder);
    logger.info(`[FileWatcherService] Started watching folder '${cleanFolder}'`);
    return {
      success: true,
      message: `Started watching folder '${cleanFolder}'`,
      watchedFolders: Array.from(this.watchedFolders),
    };
  }

  unwatchFolder(folder: string): { success: boolean; message: string; watchedFolders: string[] } {
    const cleanFolder = folder.toLowerCase().trim();
    this.watchedFolders.delete(cleanFolder);
    logger.info(`[FileWatcherService] Stopped watching folder '${cleanFolder}'`);
    return {
      success: true,
      message: `Stopped watching folder '${cleanFolder}'`,
      watchedFolders: Array.from(this.watchedFolders),
    };
  }

  getWatchedFolders(): string[] {
    return Array.from(this.watchedFolders);
  }

  onFileEvent(listener: (event: FileChangeEvent) => void): void {
    this.listeners.push(listener);
  }

  simulateFileEvent(
    eventType: 'created' | 'modified' | 'deleted' | 'renamed',
    folder: string,
    filePath: string,
  ): FileChangeEvent {
    const event: FileChangeEvent = {
      eventType,
      folder,
      filePath,
      timestamp: new Date().toISOString(),
    };

    logger.debug(`[FileWatcherService] Emitting file event ${eventType} on ${filePath}`);
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        logger.error(`[FileWatcherService] Listener error: ${err}`);
      }
    }

    return event;
  }
}

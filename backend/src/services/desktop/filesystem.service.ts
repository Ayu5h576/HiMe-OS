import path from 'path';
import fs from 'fs';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { logger } from '../../config/logger';

export interface DirectoryEntry {
  name: string;
  type: 'file' | 'directory';
  sizeBytes: number | null;
  lastModified: string;
  extension: string | null;
}

export interface FileReadResult {
  path: string;
  sizeBytes: number;
  encoding: string;
  content: string;
  lastModified: string;
}

export interface FileOperationResult {
  success: boolean;
  operation: string;
  source?: string;
  destination?: string;
  path?: string;
  message: string;
}

export interface SearchResult {
  path: string;
  name: string;
  type: 'file' | 'directory';
  sizeBytes: number | null;
}

// Default scoped root — expandable via env; defaults to user home directory
const FS_ROOT = process.env.DESKTOP_FS_ROOT ?? require('os').homedir();
const MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1 MB read cap
const MAX_SEARCH_RESULTS = 100;
const FORBIDDEN_EXTENSIONS = new Set(['.exe', '.bat', '.sh', '.cmd', '.ps1', '.msi', '.dll']);

export class FilesystemService {
  private fsRoot: string;

  constructor(fsRoot: string = FS_ROOT) {
    this.fsRoot = fsRoot;
  }

  /**
   * Resolves and validates a user-provided path.
   * Prevents traversal outside the scoped root.
   */
  private resolveSafe(userPath: string): string {
    const resolved = path.resolve(this.fsRoot, userPath);
    if (!resolved.startsWith(this.fsRoot)) {
      throw new BadRequestError(
        `Path traversal detected. Access is restricted to the desktop root: ${this.fsRoot}`,
      );
    }
    return resolved;
  }

  /**
   * Lists directory contents (one level deep).
   */
  async listDirectory(dirPath: string): Promise<DirectoryEntry[]> {
    const resolved = this.resolveSafe(dirPath);
    logger.debug(`[FilesystemService] listDirectory: ${resolved}`);

    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(resolved, { withFileTypes: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new NotFoundError(`Directory not accessible: ${msg}`);
    }

    const results: DirectoryEntry[] = [];
    for (const entry of entries) {
      const fullPath = path.join(resolved, entry.name);
      let sizeBytes: number | null = null;
      let lastModified = '';

      try {
        const stat = await fs.promises.stat(fullPath);
        sizeBytes = entry.isFile() ? stat.size : null;
        lastModified = stat.mtime.toISOString();
      } catch {
        lastModified = new Date().toISOString();
      }

      results.push({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        sizeBytes,
        lastModified,
        extension: entry.isFile() ? path.extname(entry.name) || null : null,
      });
    }

    return results;
  }

  /**
   * Reads the text content of a scoped file.
   * Limited to MAX_FILE_SIZE_BYTES.
   */
  async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<FileReadResult> {
    const resolved = this.resolveSafe(filePath);
    logger.debug(`[FilesystemService] readFile: ${resolved}`);

    let stat: fs.Stats;
    try {
      stat = await fs.promises.stat(resolved);
    } catch {
      throw new NotFoundError(`File not found: ${filePath}`);
    }

    if (!stat.isFile()) {
      throw new BadRequestError(`Path is not a file: ${filePath}`);
    }

    if (stat.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestError(
        `File too large to read (${stat.size} bytes). Maximum allowed: ${MAX_FILE_SIZE_BYTES} bytes.`,
      );
    }

    const content = await fs.promises.readFile(resolved, { encoding });

    return {
      path: filePath,
      sizeBytes: stat.size,
      encoding,
      content,
      lastModified: stat.mtime.toISOString(),
    };
  }

  /**
   * Creates a new folder at the specified path.
   */
  async createFolder(dirPath: string): Promise<FileOperationResult> {
    const resolved = this.resolveSafe(dirPath);
    logger.debug(`[FilesystemService] createFolder: ${resolved}`);

    await fs.promises.mkdir(resolved, { recursive: true });

    return {
      success: true,
      operation: 'createFolder',
      path: dirPath,
      message: `Folder created at ${dirPath}`,
    };
  }

  /**
   * Copies a file from source to destination (both scoped).
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<FileOperationResult> {
    const src = this.resolveSafe(sourcePath);
    const dst = this.resolveSafe(destinationPath);
    logger.debug(`[FilesystemService] copyFile: ${src} → ${dst}`);

    try {
      await fs.promises.access(src, fs.constants.R_OK);
    } catch {
      throw new NotFoundError(`Source file not accessible: ${sourcePath}`);
    }

    await fs.promises.copyFile(src, dst);

    return {
      success: true,
      operation: 'copyFile',
      source: sourcePath,
      destination: destinationPath,
      message: `File copied from '${sourcePath}' to '${destinationPath}'`,
    };
  }

  /**
   * Moves a file from source to destination (both scoped).
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<FileOperationResult> {
    const src = this.resolveSafe(sourcePath);
    const dst = this.resolveSafe(destinationPath);
    logger.debug(`[FilesystemService] moveFile: ${src} → ${dst}`);

    await fs.promises.rename(src, dst);

    return {
      success: true,
      operation: 'moveFile',
      source: sourcePath,
      destination: destinationPath,
      message: `File moved from '${sourcePath}' to '${destinationPath}'`,
    };
  }

  /**
   * Renames a file or folder within the same directory.
   */
  async renameFile(filePath: string, newName: string): Promise<FileOperationResult> {
    const resolved = this.resolveSafe(filePath);
    const parentDir = path.dirname(resolved);
    const sanitizedName = path.basename(newName); // strip any path components
    const newResolved = path.join(parentDir, sanitizedName);

    if (!newResolved.startsWith(this.fsRoot)) {
      throw new BadRequestError('Rename target is outside the desktop root.');
    }

    logger.debug(`[FilesystemService] renameFile: ${resolved} → ${newResolved}`);
    await fs.promises.rename(resolved, newResolved);

    return {
      success: true,
      operation: 'renameFile',
      source: filePath,
      destination: newName,
      message: `Renamed '${path.basename(filePath)}' to '${sanitizedName}'`,
    };
  }

  /**
   * Deletes a file (safe mode: only files, not directories; validates extension).
   */
  async deleteFile(filePath: string): Promise<FileOperationResult> {
    const resolved = this.resolveSafe(filePath);
    logger.debug(`[FilesystemService] deleteFile: ${resolved}`);

    // Extension guard fires before any filesystem access
    const ext = path.extname(resolved).toLowerCase();
    if (FORBIDDEN_EXTENSIONS.has(ext)) {
      throw new BadRequestError(
        `Deletion of executable files (${ext}) is not permitted for safety.`,
      );
    }

    let stat: fs.Stats;
    try {
      stat = await fs.promises.stat(resolved);
    } catch {
      throw new NotFoundError(`File not found: ${filePath}`);
    }

    if (stat.isDirectory()) {
      throw new BadRequestError(
        `Cannot delete a directory via deleteFile. Path: ${filePath}`,
      );
    }

    await fs.promises.unlink(resolved);

    return {
      success: true,
      operation: 'deleteFile',
      path: filePath,
      message: `File deleted: ${filePath}`,
    };
  }

  /**
   * Recursively searches for files matching a glob-like pattern by name substring.
   * Limited to MAX_SEARCH_RESULTS.
   */
  async searchFiles(
    dirPath: string,
    pattern: string,
    maxDepth = 3,
  ): Promise<SearchResult[]> {
    const resolved = this.resolveSafe(dirPath);
    logger.debug(`[FilesystemService] searchFiles: ${resolved} pattern="${pattern}"`);

    const results: SearchResult[] = [];
    const normalizedPattern = pattern.toLowerCase();

    const walk = async (currentPath: string, depth: number): Promise<void> => {
      if (depth > maxDepth || results.length >= MAX_SEARCH_RESULTS) return;

      let entries: fs.Dirent[];
      try {
        entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (results.length >= MAX_SEARCH_RESULTS) break;

        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(this.fsRoot, fullPath);

        if (entry.name.toLowerCase().includes(normalizedPattern)) {
          let sizeBytes: number | null = null;
          try {
            if (entry.isFile()) {
              const stat = await fs.promises.stat(fullPath);
              sizeBytes = stat.size;
            }
          } catch {
            // ignore stat errors
          }

          results.push({
            path: relativePath,
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            sizeBytes,
          });
        }

        if (entry.isDirectory()) {
          await walk(fullPath, depth + 1);
        }
      }
    };

    await walk(resolved, 0);
    return results;
  }
}

import { FastifyPluginAsync } from 'fastify';
import { DesktopController } from '../controllers/desktop.controller';
import { authenticate } from '../middleware/auth';
import {
  getAgentStatusSwaggerSchema,
  getSystemInfoSwaggerSchema,
  getHealthSwaggerSchema,
  listFilesSwaggerSchema,
  readFileSwaggerSchema,
  createFolderSwaggerSchema,
  copyFileSwaggerSchema,
  moveFileSwaggerSchema,
  renameFileSwaggerSchema,
  deleteFileSwaggerSchema,
  searchFilesSwaggerSchema,
  launchApplicationSwaggerSchema,
  listProcessesSwaggerSchema,
  readClipboardSwaggerSchema,
  writeClipboardSwaggerSchema,
  clipboardHistorySwaggerSchema,
  takeScreenshotSwaggerSchema,
  desktopNotifySwaggerSchema,
} from '../schemas/desktop.schema';

export const desktopRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new DesktopController();

  // ── Status ───────────────────────────────────────────────────────────────

  fastify.get(
    '/desktop/status',
    { schema: getAgentStatusSwaggerSchema, preHandler: [authenticate] },
    controller.getAgentStatus,
  );

  // ── System Info ──────────────────────────────────────────────────────────

  fastify.get(
    '/desktop/system/info',
    { schema: getSystemInfoSwaggerSchema, preHandler: [authenticate] },
    controller.getSystemInfo,
  );

  fastify.get(
    '/desktop/system/health',
    { schema: getHealthSwaggerSchema, preHandler: [authenticate] },
    controller.getHealth,
  );

  // ── File System ──────────────────────────────────────────────────────────

  fastify.get(
    '/desktop/files',
    { schema: listFilesSwaggerSchema, preHandler: [authenticate] },
    controller.listFiles,
  );

  fastify.get(
    '/desktop/files/read',
    { schema: readFileSwaggerSchema, preHandler: [authenticate] },
    controller.readFile,
  );

  fastify.post(
    '/desktop/files/folder',
    { schema: createFolderSwaggerSchema, preHandler: [authenticate] },
    controller.createFolder,
  );

  fastify.post(
    '/desktop/files/copy',
    { schema: copyFileSwaggerSchema, preHandler: [authenticate] },
    controller.copyFile,
  );

  fastify.post(
    '/desktop/files/move',
    { schema: moveFileSwaggerSchema, preHandler: [authenticate] },
    controller.moveFile,
  );

  fastify.post(
    '/desktop/files/rename',
    { schema: renameFileSwaggerSchema, preHandler: [authenticate] },
    controller.renameFile,
  );

  fastify.delete(
    '/desktop/files',
    { schema: deleteFileSwaggerSchema, preHandler: [authenticate] },
    controller.deleteFile,
  );

  fastify.get(
    '/desktop/files/search',
    { schema: searchFilesSwaggerSchema, preHandler: [authenticate] },
    controller.searchFiles,
  );

  // ── Applications ─────────────────────────────────────────────────────────

  fastify.get(
    '/desktop/apps',
    { schema: listProcessesSwaggerSchema, preHandler: [authenticate] },
    controller.listProcesses,
  );

  fastify.post(
    '/desktop/apps/launch',
    { schema: launchApplicationSwaggerSchema, preHandler: [authenticate] },
    controller.launchApplication,
  );

  // ── Clipboard ─────────────────────────────────────────────────────────────

  fastify.get(
    '/desktop/clipboard',
    { schema: readClipboardSwaggerSchema, preHandler: [authenticate] },
    controller.readClipboard,
  );

  fastify.post(
    '/desktop/clipboard',
    { schema: writeClipboardSwaggerSchema, preHandler: [authenticate] },
    controller.writeClipboard,
  );

  fastify.get(
    '/desktop/clipboard/history',
    { schema: clipboardHistorySwaggerSchema, preHandler: [authenticate] },
    controller.getClipboardHistory,
  );

  // ── Screenshot ────────────────────────────────────────────────────────────

  fastify.post(
    '/desktop/screenshot',
    { schema: takeScreenshotSwaggerSchema, preHandler: [authenticate] },
    controller.takeScreenshot,
  );

  // ── Notifications ─────────────────────────────────────────────────────────

  fastify.post(
    '/desktop/notify',
    { schema: desktopNotifySwaggerSchema, preHandler: [authenticate] },
    controller.sendNotification,
  );
};

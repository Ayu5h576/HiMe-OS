import { FastifyRequest, FastifyReply } from 'fastify';
import { DesktopAgentService } from '../services/desktop/desktop-agent.service';
import {
  listFilesQuerySchema,
  readFileQuerySchema,
  createFolderSchema,
  copyFileSchema,
  moveFileSchema,
  renameFileSchema,
  deleteFileSchema,
  searchFilesQuerySchema,
  launchApplicationSchema,
  writeClipboardSchema,
  clipboardHistoryQuerySchema,
  desktopNotifySchema,
} from '../schemas/desktop.schema';

export class DesktopController {
  private agentService: DesktopAgentService;

  constructor(agentService: DesktopAgentService = new DesktopAgentService()) {
    this.agentService = agentService;
  }

  // ── Status & System Info ──────────────────────────────────────────────────

  getAgentStatus = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = this.agentService.getAgentStatus();
    return reply.status(200).send({ success: true, data });
  };

  getSystemInfo = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = this.agentService.getSystemInfo();
    return reply.status(200).send({ success: true, data });
  };

  getHealth = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = this.agentService.getHealthReport();
    return reply.status(200).send({ success: true, data });
  };

  // ── File System ───────────────────────────────────────────────────────────

  listFiles = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { path } = listFilesQuerySchema.parse(req.query);
    const data = await this.agentService.listFiles(path);
    return reply.status(200).send({ success: true, data });
  };

  readFile = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { path, encoding } = readFileQuerySchema.parse(req.query);
    const data = await this.agentService.readFile(path);
    return reply.status(200).send({ success: true, data });
  };

  createFolder = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { path } = createFolderSchema.parse(req.body);
    const data = await this.agentService.createFolder(path);
    return reply.status(201).send({ success: true, data });
  };

  copyFile = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { source, destination } = copyFileSchema.parse(req.body);
    const data = await this.agentService.copyFile(source, destination);
    return reply.status(200).send({ success: true, data });
  };

  moveFile = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { source, destination } = moveFileSchema.parse(req.body);
    const data = await this.agentService.moveFile(source, destination);
    return reply.status(200).send({ success: true, data });
  };

  renameFile = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { path, newName } = renameFileSchema.parse(req.body);
    const data = await this.agentService.renameFile(path, newName);
    return reply.status(200).send({ success: true, data });
  };

  deleteFile = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { path } = deleteFileSchema.parse(req.query);
    await this.agentService.deleteFile(path);
    return reply.status(204).send();
  };

  searchFiles = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { path, pattern, maxDepth } = searchFilesQuerySchema.parse(req.query);
    const data = await this.agentService.searchFiles(path, pattern, maxDepth);
    return reply.status(200).send({ success: true, data });
  };

  // ── Applications ─────────────────────────────────────────────────────────

  listProcesses = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = await this.agentService.listProcesses();
    return reply.status(200).send({ success: true, data });
  };

  launchApplication = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { name } = launchApplicationSchema.parse(req.body);
    const data = await this.agentService.launchApplication(name);
    return reply.status(200).send({ success: true, data });
  };

  // ── Clipboard ─────────────────────────────────────────────────────────────

  readClipboard = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = this.agentService.readClipboard();
    return reply.status(200).send({ success: true, data });
  };

  writeClipboard = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { content } = writeClipboardSchema.parse(req.body);
    const data = this.agentService.writeClipboard(content);
    return reply.status(200).send({ success: true, data });
  };

  getClipboardHistory = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { limit } = clipboardHistoryQuerySchema.parse(req.query);
    const data = this.agentService.getClipboardHistory(limit);
    return reply.status(200).send({ success: true, data });
  };

  // ── Screenshot ────────────────────────────────────────────────────────────

  takeScreenshot = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const data = await this.agentService.takeScreenshot();
    return reply.status(200).send({ success: true, data });
  };

  // ── Notifications ─────────────────────────────────────────────────────────

  sendNotification = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = (req.user as { id: string }).id;
    const payload = desktopNotifySchema.parse(req.body);
    const data = await this.agentService.sendDesktopNotification(userId, payload);
    return reply.status(200).send({ success: true, data });
  };
}

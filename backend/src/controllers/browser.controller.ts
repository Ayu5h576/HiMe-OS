import { FastifyRequest, FastifyReply } from 'fastify';
import { BrowserService } from '../services/browser/browser.service';
import {
  openBrowserSchema,
  navigateBrowserSchema,
  actionBrowserSchema,
  extractDOMSchema,
  screenshotBrowserSchema,
  sessionBrowserSchema,
} from '../schemas/browser.schema';

export class BrowserController {
  private browserService: BrowserService;

  constructor(browserService: BrowserService = new BrowserService()) {
    this.browserService = browserService;
  }

  open = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = openBrowserSchema.parse(req.body ?? {});
    const result = await this.browserService.openSession(userId, body.url, body.options, body.provider);
    return reply.status(200).send({ success: true, data: result });
  };

  navigate = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = navigateBrowserSchema.parse(req.body);
    const result = await this.browserService.navigate(
      userId,
      body.sessionId,
      body.url,
      body.action,
      body.provider,
    );
    return reply.status(200).send({ success: true, data: result });
  };

  action = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = actionBrowserSchema.parse(req.body);
    const result = await this.browserService.performAction(
      userId,
      body.sessionId,
      {
        action: body.action,
        selector: body.selector,
        text: body.text,
        value: body.value,
        filePath: body.filePath,
        scrollOffset: body.scrollOffset,
        waitTimeMs: body.waitTimeMs,
      },
      body.provider,
    );
    return reply.status(200).send({ success: true, data: result });
  };

  extract = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = extractDOMSchema.parse(req.body);
    const result = await this.browserService.extractDOM(userId, body.sessionId, body.options, body.provider);
    return reply.status(200).send({ success: true, data: result });
  };

  screenshot = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = screenshotBrowserSchema.parse(req.body);
    const result = await this.browserService.takeScreenshot(
      userId,
      body.sessionId,
      { type: body.type, selector: body.selector, format: body.format },
      body.provider,
    );
    return reply.status(200).send({ success: true, data: result });
  };

  getSession = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const query = req.query as { sessionId?: string; provider?: string };
    if (query.sessionId) {
      const state = await this.browserService.getSession(query.sessionId, query.provider);
      return reply.status(200).send({ success: true, data: state });
    }
    const sessionService = (this.browserService as any).sessionService;
    const userSessions = sessionService ? sessionService.getUserSessions(userId) : [];
    return reply.status(200).send({ success: true, data: userSessions });
  };

  closeSession = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = sessionBrowserSchema.parse(req.body);
    if (!body.sessionId) {
      return reply.status(400).send({ success: false, error: 'sessionId is required in body' });
    }
    await this.browserService.closeSession(userId, body.sessionId, body.provider);
    return reply.status(200).send({ success: true, data: { sessionId: body.sessionId, closed: true } });
  };

  getProviders = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const providers = this.browserService.getProviders();
    return reply.status(200).send({ success: true, data: providers });
  };
}

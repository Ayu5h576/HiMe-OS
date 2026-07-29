import { FastifyRequest, FastifyReply } from 'fastify';
import { VisionService } from '../services/vision/vision.service';
import {
  analyzeImageSchema,
  ocrSchema,
  objectsSchema,
  sceneSchema,
  screenshotSchema,
} from '../schemas/vision.schema';

export class VisionController {
  private visionService: VisionService;

  constructor(visionService: VisionService = new VisionService()) {
    this.visionService = visionService;
  }

  analyze = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = analyzeImageSchema.parse(req.body);
    const result = await this.visionService.analyzeImage(userId, body.image, body.options, body.provider);
    return reply.status(200).send({ success: true, data: result });
  };

  ocr = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = ocrSchema.parse(req.body);
    const result = await this.visionService.extractText(userId, body.image, body.options, body.provider);
    return reply.status(200).send({ success: true, data: result });
  };

  objects = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = objectsSchema.parse(req.body);
    const result = await this.visionService.detectObjects(userId, body.image, body.provider);
    return reply.status(200).send({ success: true, data: result });
  };

  scene = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = sceneSchema.parse(req.body);
    const result = await this.visionService.describeScene(userId, body.image, body.provider);
    return reply.status(200).send({ success: true, data: result });
  };

  screenshot = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = req.user.id;
    const body = screenshotSchema.parse(req.body);
    const result = await this.visionService.analyzeScreenshot(userId, body.image, body.provider);
    return reply.status(200).send({ success: true, data: result });
  };

  getProviders = async (_req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const providers = this.visionService.getProviders();
    return reply.status(200).send({ success: true, data: providers });
  };
}

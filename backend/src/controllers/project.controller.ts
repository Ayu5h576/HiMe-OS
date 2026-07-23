import { FastifyRequest, FastifyReply } from 'fastify';
import { ProjectService } from '../services/project.service';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} from '../schemas/project.schema';

export class ProjectController {
  private service: ProjectService;

  constructor(service: ProjectService = new ProjectService()) {
    this.service = service;
  }

  createProject = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = createProjectSchema.parse(req.body);
    const userId = req.user.id;
    const project = await this.service.createProject(userId, body);
    return reply.status(201).send({ success: true, data: project });
  };

  getUserProjects = async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user.id;
    const projects = await this.service.getUserProjects(userId);
    return reply.status(200).send({ success: true, data: projects });
  };

  getProjectById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = projectIdSchema.parse(req.params);
    const userId = req.user.id;
    const project = await this.service.getProjectById(userId, id);
    return reply.status(200).send({ success: true, data: project });
  };

  updateProject = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = projectIdSchema.parse(req.params);
    const body = updateProjectSchema.parse(req.body);
    const userId = req.user.id;
    const project = await this.service.updateProject(userId, id, body);
    return reply.status(200).send({ success: true, data: project });
  };

  deleteProject = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = projectIdSchema.parse(req.params);
    const userId = req.user.id;
    await this.service.deleteProject(userId, id);
    return reply.status(204).send();
  };
}

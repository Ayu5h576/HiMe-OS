import { FastifyRequest, FastifyReply } from 'fastify';
import { TaskService } from '../services/task.service';
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
  taskIdSchema,
  projectIdParamSchema,
} from '../schemas/task.schema';

export class TaskController {
  private service: TaskService;

  constructor(service: TaskService = new TaskService()) {
    this.service = service;
  }

  createTask = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = projectIdParamSchema.parse(req.params);
    const body = createTaskSchema.parse(req.body);
    const userId = req.user.id;
    const task = await this.service.createTask(userId, projectId, body);
    return reply.status(201).send({ success: true, data: task });
  };

  getProjectTasks = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = projectIdParamSchema.parse(req.params);
    const query = getTasksQuerySchema.parse(req.query);
    const userId = req.user.id;
    const result = await this.service.getProjectTasks(userId, projectId, query);
    return reply.status(200).send({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  };

  getTaskById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = taskIdSchema.parse(req.params);
    const userId = req.user.id;
    const task = await this.service.getTaskById(userId, id);
    return reply.status(200).send({ success: true, data: task });
  };

  updateTask = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = taskIdSchema.parse(req.params);
    const body = updateTaskSchema.parse(req.body);
    const userId = req.user.id;
    const task = await this.service.updateTask(userId, id, body);
    return reply.status(200).send({ success: true, data: task });
  };

  deleteTask = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = taskIdSchema.parse(req.params);
    const userId = req.user.id;
    await this.service.deleteTask(userId, id);
    return reply.status(204).send();
  };
}

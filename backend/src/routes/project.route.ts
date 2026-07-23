import { FastifyPluginAsync } from 'fastify';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import {
  createProjectSwaggerSchema,
  getProjectsSwaggerSchema,
  getProjectByIdSwaggerSchema,
  updateProjectSwaggerSchema,
  deleteProjectSwaggerSchema,
} from '../schemas/project.schema';

export const projectRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new ProjectController();

  fastify.post(
    '/projects',
    { schema: createProjectSwaggerSchema, preHandler: [authenticate] },
    controller.createProject,
  );

  fastify.get(
    '/projects',
    { schema: getProjectsSwaggerSchema, preHandler: [authenticate] },
    controller.getUserProjects,
  );

  fastify.get(
    '/projects/:id',
    { schema: getProjectByIdSwaggerSchema, preHandler: [authenticate] },
    controller.getProjectById,
  );

  fastify.patch(
    '/projects/:id',
    { schema: updateProjectSwaggerSchema, preHandler: [authenticate] },
    controller.updateProject,
  );

  fastify.delete(
    '/projects/:id',
    { schema: deleteProjectSwaggerSchema, preHandler: [authenticate] },
    controller.deleteProject,
  );
};

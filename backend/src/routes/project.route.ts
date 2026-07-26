import { FastifyPluginAsync } from 'fastify';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
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
    { schema: createProjectSwaggerSchema, preHandler: [authenticate, authorize('project:create')] },
    controller.createProject,
  );

  fastify.get(
    '/projects',
    { schema: getProjectsSwaggerSchema, preHandler: [authenticate, authorize('project:read')] },
    controller.getUserProjects,
  );

  fastify.get(
    '/projects/:id',
    { schema: getProjectByIdSwaggerSchema, preHandler: [authenticate, authorize('project:read')] },
    controller.getProjectById,
  );

  fastify.patch(
    '/projects/:id',
    { schema: updateProjectSwaggerSchema, preHandler: [authenticate, authorize('project:update')] },
    controller.updateProject,
  );

  fastify.delete(
    '/projects/:id',
    { schema: deleteProjectSwaggerSchema, preHandler: [authenticate, authorize('project:delete')] },
    controller.deleteProject,
  );
};

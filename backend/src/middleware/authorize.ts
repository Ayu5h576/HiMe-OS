import { FastifyRequest, FastifyReply } from 'fastify';
import { Permission, SystemRole, AuthorizationOptions } from '../types/permissions';
import { AuthorizationService } from '../services/authorization/authorization.service';
import { RoleService } from '../services/authorization/role.service';

export const authorize = (permission: Permission, options?: AuthorizationOptions) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user;
    if (!user) {
      reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required for authorization check',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const authService = new AuthorizationService();
    try {
      authService.assertAuthorized(user, permission, options);
    } catch (err: unknown) {
      const errorObj = err as { statusCode?: number; name?: string; message?: string };
      reply.status(errorObj.statusCode || 403).send({
        success: false,
        error: errorObj.name || 'Forbidden',
        message: errorObj.message || 'You do not have permission to perform this action',
        timestamp: new Date().toISOString(),
      });
    }
  };
};

export const authorizeRole = (requiredRole: SystemRole) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user;
    if (!user) {
      reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required for role check',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const roleService = new RoleService();
    if (!roleService.hasRoleAtLeast(user.role, requiredRole)) {
      reply.status(403).send({
        success: false,
        error: 'Forbidden',
        message: `Requires minimum role '${requiredRole}'`,
        timestamp: new Date().toISOString(),
      });
    }
  };
};

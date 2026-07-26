import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { RoleService } from '../src/services/authorization/role.service';
import { PermissionService } from '../src/services/authorization/permission.service';
import { AuthorizationService } from '../src/services/authorization/authorization.service';
import { SystemRole } from '../src/types/permissions';

describe('Authorization & RBAC Layer Module', () => {
  let app: FastifyInstance;
  let tokenUser = '';
  let tokenAdmin = '';
  let userIdUser = '';
  let userIdAdmin = '';
  let projectIdUser = '';
  let taskIdUser = '';
  let automationIdUser = '';

  const roleService = new RoleService();
  const permissionService = new PermissionService();
  const authorizationService = new AuthorizationService();

  beforeAll(async () => {
    app = await buildApp();

    // Register Normal USER
    const userRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Standard User',
        email: `rbac-user-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const userBody = JSON.parse(userRes.payload);
    tokenUser = userBody.accessToken;
    userIdUser = userBody.user.id;

    // Register ADMIN User
    const adminRes = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'Admin User',
        email: `rbac-admin-${Date.now()}@example.com`,
        password: 'Password123!',
      },
    });
    const adminBody = JSON.parse(adminRes.payload);
    tokenAdmin = adminBody.accessToken;
    userIdAdmin = adminBody.user.id;

    // User creates a project
    const projRes = await app.inject({
      method: 'POST',
      url: '/projects',
      headers: { authorization: `Bearer ${tokenUser}` },
      payload: {
        name: 'RBAC User Project',
        description: 'Testing RBAC authorization',
      },
    });
    projectIdUser = JSON.parse(projRes.payload).data.id;

    // User creates a task in the project
    const taskRes = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUser}/tasks`,
      headers: { authorization: `Bearer ${tokenUser}` },
      payload: {
        title: 'RBAC Test Task',
        description: 'Verify task authorization',
      },
    });
    taskIdUser = JSON.parse(taskRes.payload).data.id;

    // User creates an automation
    const autoRes = await app.inject({
      method: 'POST',
      url: `/projects/${projectIdUser}/automations`,
      headers: { authorization: `Bearer ${tokenUser}` },
      payload: {
        name: 'RBAC Automation Rule',
        triggerType: 'MANUAL',
        actionType: 'LOG_EVENT',
      },
    });
    automationIdUser = JSON.parse(autoRes.payload).data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Role Service & Hierarchy Evaluation', () => {
    it('should evaluate role ranks correctly', () => {
      expect(roleService.getRoleRank('VIEWER')).toBe(10);
      expect(roleService.getRoleRank('EDITOR')).toBe(20);
      expect(roleService.getRoleRank('USER')).toBe(30);
      expect(roleService.getRoleRank('SERVICE_ACCOUNT')).toBe(35);
      expect(roleService.getRoleRank('ADMIN')).toBe(40);
      expect(roleService.getRoleRank('OWNER')).toBe(50);
    });

    it('should check minimum role requirements accurately', () => {
      expect(roleService.hasRoleAtLeast('ADMIN', 'USER')).toBe(true);
      expect(roleService.hasRoleAtLeast('OWNER', 'ADMIN')).toBe(true);
      expect(roleService.hasRoleAtLeast('USER', 'ADMIN')).toBe(false);
      expect(roleService.hasRoleAtLeast('VIEWER', 'EDITOR')).toBe(false);
    });

    it('should correctly evaluate role precedence with isHigherRole', () => {
      expect(roleService.isHigherRole('OWNER', 'ADMIN')).toBe(true);
      expect(roleService.isHigherRole('ADMIN', 'USER')).toBe(true);
      expect(roleService.isHigherRole('USER', 'ADMIN')).toBe(false);
    });

    it('should validate valid vs invalid roles', () => {
      expect(roleService.isValidRole('USER')).toBe(true);
      expect(roleService.isValidRole('ADMIN')).toBe(true);
      expect(roleService.isValidRole('OWNER')).toBe(true);
      expect(roleService.isValidRole('EDITOR')).toBe(true);
      expect(roleService.isValidRole('INVALID_ROLE')).toBe(false);
    });
  });

  describe('Permission Service & Centralized Matrix', () => {
    it('should resolve permissions for USER role', () => {
      const userPerms = permissionService.getPermissionsForRole('USER');
      expect(userPerms).toContain('project:create');
      expect(userPerms).toContain('project:read');
      expect(userPerms).toContain('task:create');
      expect(userPerms).toContain('automation:run');
      expect(userPerms).not.toContain('user:manage');
      expect(userPerms).not.toContain('admin:access');
    });

    it('should resolve permissions for ADMIN role (inherits USER + admin perms)', () => {
      const adminPerms = permissionService.getPermissionsForRole('ADMIN');
      expect(adminPerms).toContain('project:create');
      expect(adminPerms).toContain('user:manage');
      expect(adminPerms).toContain('admin:access');
    });

    it('should resolve permissions for OWNER role', () => {
      const ownerPerms = permissionService.getPermissionsForRole('OWNER');
      expect(ownerPerms).toContain('project:delete');
      expect(ownerPerms).toContain('admin:access');
    });

    it('should grant limited permissions to VIEWER and EDITOR roles', () => {
      expect(permissionService.roleHasPermission('VIEWER', 'project:read')).toBe(true);
      expect(permissionService.roleHasPermission('VIEWER', 'project:delete')).toBe(false);

      expect(permissionService.roleHasPermission('EDITOR', 'task:create')).toBe(true);
      expect(permissionService.roleHasPermission('EDITOR', 'user:manage')).toBe(false);
    });
  });

  describe('Authorization Service Logic & Assertions', () => {
    it('should authorize valid permissions for authenticated user', () => {
      const userContext = { id: userIdUser, role: 'USER' as SystemRole };
      expect(authorizationService.isAuthorized(userContext, 'project:read')).toBe(true);
      expect(authorizationService.isAuthorized(userContext, 'user:manage')).toBe(false);
    });

    it('should throw UnauthorizedError when user context is missing', () => {
      expect(() => authorizationService.assertAuthorized(undefined, 'project:read')).toThrow(
        'Authentication required',
      );
    });

    it('should throw ForbiddenError when role lacks required permission', () => {
      const userContext = { id: userIdUser, role: 'USER' as SystemRole };
      expect(() => authorizationService.assertAuthorized(userContext, 'user:manage')).toThrow(
        /lacks required permission/,
      );
    });

    it('should validate resource ownership and allow owner or admin bypass', () => {
      const ownerUser = { id: 'owner-123', role: 'USER' as SystemRole };
      const nonOwnerUser = { id: 'user-456', role: 'USER' as SystemRole };
      const adminUser = { id: 'admin-789', role: 'ADMIN' as SystemRole };

      // Owner accessing own resource
      expect(
        authorizationService.isAuthorized(ownerUser, 'project:update', {
          resourceOwnerId: 'owner-123',
        }),
      ).toBe(true);

      // Non-owner trying to access resource
      expect(
        authorizationService.isAuthorized(nonOwnerUser, 'project:update', {
          resourceOwnerId: 'owner-123',
        }),
      ).toBe(false);

      // Admin bypassing ownership check
      expect(
        authorizationService.isAuthorized(adminUser, 'project:update', {
          resourceOwnerId: 'owner-123',
        }),
      ).toBe(true);
    });
  });

  describe('HTTP Route Authorization Middleware Enforcement', () => {
    it('should allow USER to perform authorized actions on Project, Task, and Automation', async () => {
      // Read project
      const projRes = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser}`,
        headers: { authorization: `Bearer ${tokenUser}` },
      });
      expect(projRes.statusCode).toBe(200);

      // Update task
      const taskRes = await app.inject({
        method: 'PATCH',
        url: `/tasks/${taskIdUser}`,
        headers: { authorization: `Bearer ${tokenUser}` },
        payload: { title: 'Updated Task Title via Authorization' },
      });
      expect(taskRes.statusCode).toBe(200);

      // Run automation with payload
      const autoRes = await app.inject({
        method: 'POST',
        url: `/automations/${automationIdUser}/run`,
        headers: { authorization: `Bearer ${tokenUser}` },
        payload: { input: {} },
      });
      expect(autoRes.statusCode).toBe(200);
    });

    it('should reject unauthenticated request with HTTP 401 Unauthorized', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser}`,
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Unauthorized');
    });

    it('should reject request with invalid bearer token with HTTP 401 Unauthorized', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/projects/${projectIdUser}`,
        headers: { authorization: 'Bearer invalid-token-payload' },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body.error).toBe('Unauthorized');
    });
  });
});

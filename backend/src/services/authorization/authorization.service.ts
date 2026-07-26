import {
  AuthUserContext,
  Permission,
  AuthorizationOptions,
  SystemRole,
} from '../../types/permissions';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';

export class AuthorizationService {
  private permissionService: PermissionService;
  private roleService: RoleService;

  constructor(
    permissionService: PermissionService = new PermissionService(),
    roleService: RoleService = new RoleService(),
  ) {
    this.permissionService = permissionService;
    this.roleService = roleService;
  }

  isAuthorized(
    user: AuthUserContext | undefined,
    permission: Permission,
    options?: AuthorizationOptions,
  ): boolean {
    if (!user) {
      return false;
    }

    if (!this.roleService.isValidRole(user.role)) {
      return false;
    }

    const hasPermission = this.permissionService.roleHasPermission(user.role, permission);
    if (!hasPermission) {
      return false;
    }

    if (options?.resourceOwnerId) {
      const isOwner = user.id === options.resourceOwnerId;
      const isAdminOrOwnerRole = this.roleService.hasRoleAtLeast(user.role as SystemRole, 'ADMIN');

      if (!isOwner && !isAdminOrOwnerRole) {
        return false;
      }
    }

    return true;
  }

  assertAuthorized(
    user: AuthUserContext | undefined,
    permission: Permission,
    options?: AuthorizationOptions,
  ): void {
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!this.roleService.isValidRole(user.role)) {
      throw new ForbiddenError(`Invalid role '${user.role}'`);
    }

    const hasPermission = this.permissionService.roleHasPermission(user.role, permission);
    if (!hasPermission) {
      throw new ForbiddenError(`Role '${user.role}' lacks required permission '${permission}'`);
    }

    if (options?.resourceOwnerId) {
      const isOwner = user.id === options.resourceOwnerId;
      const isAdminOrOwnerRole = this.roleService.hasRoleAtLeast(user.role as SystemRole, 'ADMIN');

      if (!isOwner && !isAdminOrOwnerRole) {
        throw new ForbiddenError('You do not have access to this resource');
      }
    }
  }

  isOwnerOrAdmin(userId: string, userRole: string, resourceOwnerId: string): boolean {
    const isOwner = userId === resourceOwnerId;
    const isAdminOrOwnerRole = this.roleService.hasRoleAtLeast(userRole as SystemRole, 'ADMIN');
    return isOwner || isAdminOrOwnerRole;
  }
}

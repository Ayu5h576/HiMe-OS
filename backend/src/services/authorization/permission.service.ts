import { SystemRole, Permission } from '../../types/permissions';
import { ROLE_PERMISSIONS } from '../../config/permissions';

export class PermissionService {
  getPermissionsForRole(role: string): Permission[] {
    const normalizedRole = role.toUpperCase() as SystemRole;
    return ROLE_PERMISSIONS[normalizedRole] ?? [];
  }

  roleHasPermission(role: string, permission: Permission): boolean {
    const permissions = this.getPermissionsForRole(role);
    return permissions.includes(permission);
  }
}

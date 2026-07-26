import { SystemRole } from '../../types/permissions';
import { ROLE_HIERARCHY } from '../../config/permissions';

export class RoleService {
  getRoleRank(role: string): number {
    const normalizedRole = role.toUpperCase() as SystemRole;
    return ROLE_HIERARCHY[normalizedRole] ?? 0;
  }

  hasRoleAtLeast(userRole: string, requiredRole: SystemRole): boolean {
    const userRank = this.getRoleRank(userRole);
    const requiredRank = this.getRoleRank(requiredRole);
    return userRank >= requiredRank;
  }

  isHigherRole(roleA: string, roleB: string): boolean {
    return this.getRoleRank(roleA) > this.getRoleRank(roleB);
  }

  isValidRole(role: string): boolean {
    const normalizedRole = role.toUpperCase() as SystemRole;
    return normalizedRole in ROLE_HIERARCHY;
  }
}

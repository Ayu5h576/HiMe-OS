export type SystemRole = 'USER' | 'ADMIN' | 'OWNER' | 'EDITOR' | 'VIEWER' | 'SERVICE_ACCOUNT';

export type Permission =
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'task:create'
  | 'task:read'
  | 'task:update'
  | 'task:delete'
  | 'conversation:create'
  | 'conversation:read'
  | 'conversation:update'
  | 'conversation:delete'
  | 'memory:create'
  | 'memory:read'
  | 'memory:update'
  | 'memory:delete'
  | 'automation:create'
  | 'automation:read'
  | 'automation:update'
  | 'automation:delete'
  | 'automation:run'
  | 'user:manage'
  | 'user:read'
  | 'admin:access';

export interface AuthUserContext {
  id: string;
  role: SystemRole | string;
  email?: string;
  name?: string;
}

export interface AuthorizationOptions {
  resourceOwnerId?: string;
  allowAdminBypass?: boolean;
}

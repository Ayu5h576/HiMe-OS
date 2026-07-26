import '@fastify/jwt';
import { UserRole } from '@prisma/client';

export * from './ai';
export * from './vector';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: UserPayload;
  }
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  timestamp: string;
  uptime: string;
}

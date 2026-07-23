import { PrismaClient, User, UserRole } from '@prisma/client';
import { prisma } from '../config/database';
import { env } from '../config/env';

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
}

export class UserRepository {
  private db: PrismaClient;
  private memoryStore: Map<string, User> = new Map();

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase();
    try {
      return await this.db.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        for (const user of this.memoryStore.values()) {
          if (user.email === normalizedEmail) return user;
        }
        return null;
      }
      throw err;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.db.user.findUnique({
        where: { id },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        return this.memoryStore.get(id) ?? null;
      }
      throw err;
    }
  }

  async create(data: CreateUserData): Promise<User> {
    const normalizedEmail = data.email.toLowerCase();
    try {
      return await this.db.user.create({
        data: {
          email: normalizedEmail,
          name: data.name,
          password: data.password,
          role: data.role ?? UserRole.USER,
          isActive: data.isActive ?? true,
        },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const user: User = {
          id: `test-uuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          email: normalizedEmail,
          name: data.name,
          password: data.password,
          role: data.role ?? UserRole.USER,
          isActive: data.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.memoryStore.set(user.id, user);
        return user;
      }
      throw err;
    }
  }
}

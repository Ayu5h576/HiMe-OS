import { PrismaClient, RefreshToken } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateRefreshTokenData {
  tokenHash: string;
  jti: string;
  familyId: string;
  userId: string;
  expiresAt: Date;
}

export class RefreshTokenRepository {
  private db: PrismaClient;

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    return this.db.refreshToken.create({
      data: {
        tokenHash: data.tokenHash,
        jti: data.jti,
        familyId: data.familyId,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.db.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  async findByJti(jti: string): Promise<RefreshToken | null> {
    return this.db.refreshToken.findUnique({
      where: { jti },
    });
  }

  async revokeById(id: string): Promise<RefreshToken> {
    return this.db.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeByFamilyId(familyId: string): Promise<void> {
    await this.db.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async markReplaced(id: string, replacedByTokenId: string): Promise<RefreshToken> {
    return this.db.refreshToken.update({
      where: { id },
      data: {
        replacedByTokenId,
        revokedAt: new Date(),
      },
    });
  }

  async deleteExpiredTokens(): Promise<number> {
    const result = await this.db.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }
}

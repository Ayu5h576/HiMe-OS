import crypto from 'crypto';
import { User } from '@prisma/client';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { UserRepository } from '../repositories/user.repository';
import { hashToken } from '../utils/hash';
import { UnauthorizedError } from '../utils/errors';
import { env } from '../config/env';
import { UserPayload, AuthResponse, UserResponse } from '../types';

export type SignJwtFunction = (payload: object, options?: { expiresIn?: string }) => string;
export type VerifyJwtFunction = (token: string) => { jti: string; sub: string };

interface RefreshTokenPayload {
  jti: string;
  sub: string;
  familyId: string;
  type: 'refresh';
}

export class RefreshTokenService {
  private refreshTokenRepo: RefreshTokenRepository;
  private userRepo: UserRepository;

  constructor(
    refreshTokenRepo: RefreshTokenRepository = new RefreshTokenRepository(),
    userRepo: UserRepository = new UserRepository(),
  ) {
    this.refreshTokenRepo = refreshTokenRepo;
    this.userRepo = userRepo;
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  async issueRefreshToken(
    user: User,
    signJwt: SignJwtFunction,
    familyId?: string,
  ): Promise<string> {
    const jti = crypto.randomUUID();
    const family = familyId ?? crypto.randomUUID();
    const expiresInMs = this.parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + expiresInMs);

    const payload: RefreshTokenPayload = {
      jti,
      sub: user.id,
      familyId: family,
      type: 'refresh',
    };

    const rawToken = signJwt(payload, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
    const tokenHash = hashToken(rawToken);

    await this.refreshTokenRepo.create({
      tokenHash,
      jti,
      familyId: family,
      userId: user.id,
      expiresAt,
    });

    return rawToken;
  }

  async rotateRefreshToken(
    rawToken: string,
    verifyJwt: VerifyJwtFunction,
    signAccessToken: SignJwtFunction,
    signRefreshToken: SignJwtFunction,
  ): Promise<AuthResponse> {
    // Step 1: Verify JWT signature and decode
    let decoded: RefreshTokenPayload;
    try {
      decoded = verifyJwt(rawToken) as unknown as RefreshTokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Step 2: Find the token by hash
    const tokenHash = hashToken(rawToken);
    const existingToken = await this.refreshTokenRepo.findByTokenHash(tokenHash);

    if (!existingToken) {
      throw new UnauthorizedError('Refresh token not recognized');
    }

    // Step 3: Check if token was already revoked
    if (existingToken.revokedAt) {
      // Reuse detection: revoke the entire family
      await this.refreshTokenRepo.revokeByFamilyId(existingToken.familyId);
      throw new UnauthorizedError('Refresh token has been revoked — possible token theft detected');
    }

    // Step 4: Check if token was already replaced (reuse detection)
    if (existingToken.replacedByTokenId) {
      // Reuse of an old rotated token — revoke entire family
      await this.refreshTokenRepo.revokeByFamilyId(existingToken.familyId);
      throw new UnauthorizedError('Refresh token reuse detected — session revoked');
    }

    // Step 5: Check expiration
    if (existingToken.expiresAt < new Date()) {
      await this.refreshTokenRepo.revokeById(existingToken.id);
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Step 6: Fetch the user
    const user = await this.userRepo.findById(existingToken.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      await this.refreshTokenRepo.revokeByFamilyId(existingToken.familyId);
      throw new UnauthorizedError('Account is deactivated');
    }

    // Step 7: Issue new refresh token in the same family
    const newRefreshToken = await this.issueRefreshToken(
      user,
      signRefreshToken,
      existingToken.familyId,
    );

    // Step 8: Mark old token as replaced
    const newTokenHash = hashToken(newRefreshToken);
    const newTokenRecord = await this.refreshTokenRepo.findByTokenHash(newTokenHash);
    if (newTokenRecord) {
      await this.refreshTokenRepo.markReplaced(existingToken.id, newTokenRecord.id);
    }

    // Step 9: Issue new access token
    const accessPayload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };

    const newAccessToken = signAccessToken(accessPayload);

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return {
      user: userResponse,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async revokeRefreshToken(rawToken: string, verifyJwt: VerifyJwtFunction): Promise<void> {
    try {
      verifyJwt(rawToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(rawToken);
    const existingToken = await this.refreshTokenRepo.findByTokenHash(tokenHash);

    if (!existingToken) {
      throw new UnauthorizedError('Refresh token not recognized');
    }

    if (existingToken.revokedAt) {
      // Already revoked, no-op (idempotent logout)
      return;
    }

    await this.refreshTokenRepo.revokeById(existingToken.id);
  }
}

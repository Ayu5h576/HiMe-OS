import { User, UserRole } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { hashPassword, comparePassword } from '../utils/hash';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { AuthResponse, UserResponse, UserPayload } from '../types';

export type SignJwtFunction = (payload: UserPayload, options?: { expiresIn?: string }) => string;

export class AuthService {
  private userRepo: UserRepository;

  constructor(userRepo: UserRepository = new UserRepository()) {
    this.userRepo = userRepo;
  }

  private mapUserToResponse(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private generateTokens(
    user: User,
    signJwt: SignJwtFunction,
  ): { accessToken: string; refreshToken: string } {
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };

    const accessToken = signJwt(payload);
    // Extension point for refresh tokens: signed with 7d expiry
    const refreshToken = signJwt(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async register(input: RegisterInput, signJwt: SignJwtFunction): Promise<AuthResponse> {
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await this.userRepo.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: UserRole.USER,
      isActive: true,
    });

    const { accessToken, refreshToken } = this.generateTokens(user, signJwt);

    return {
      user: this.mapUserToResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput, signJwt: SignJwtFunction): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { accessToken, refreshToken } = this.generateTokens(user, signJwt);

    return {
      user: this.mapUserToResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return this.mapUserToResponse(user);
  }
}

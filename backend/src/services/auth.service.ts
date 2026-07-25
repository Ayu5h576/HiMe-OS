import { User, UserRole } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { hashPassword, comparePassword } from '../utils/hash';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { AuthResponse, UserResponse, UserPayload } from '../types';
import { RefreshTokenService, SignJwtFunction, VerifyJwtFunction } from './refresh-token.service';

export { SignJwtFunction };

export class AuthService {
  private userRepo: UserRepository;
  private refreshTokenService: RefreshTokenService;

  constructor(
    userRepo: UserRepository = new UserRepository(),
    refreshTokenService: RefreshTokenService = new RefreshTokenService(),
  ) {
    this.userRepo = userRepo;
    this.refreshTokenService = refreshTokenService;
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

  private generateAccessToken(user: User, signJwt: SignJwtFunction): string {
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    };

    return signJwt(payload);
  }

  async register(
    input: RegisterInput,
    signJwt: SignJwtFunction,
    signRefreshJwt: SignJwtFunction,
  ): Promise<AuthResponse> {
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

    const accessToken = this.generateAccessToken(user, signJwt);
    const refreshToken = await this.refreshTokenService.issueRefreshToken(user, signRefreshJwt);

    return {
      user: this.mapUserToResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async login(
    input: LoginInput,
    signJwt: SignJwtFunction,
    signRefreshJwt: SignJwtFunction,
  ): Promise<AuthResponse> {
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

    const accessToken = this.generateAccessToken(user, signJwt);
    const refreshToken = await this.refreshTokenService.issueRefreshToken(user, signRefreshJwt);

    return {
      user: this.mapUserToResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(
    rawRefreshToken: string,
    verifyRefreshJwt: VerifyJwtFunction,
    signAccessJwt: SignJwtFunction,
    signRefreshJwt: SignJwtFunction,
  ): Promise<AuthResponse> {
    return this.refreshTokenService.rotateRefreshToken(
      rawRefreshToken,
      verifyRefreshJwt,
      signAccessJwt,
      signRefreshJwt,
    );
  }

  async logout(rawRefreshToken: string, verifyRefreshJwt: VerifyJwtFunction): Promise<void> {
    await this.refreshTokenService.revokeRefreshToken(rawRefreshToken, verifyRefreshJwt);
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return this.mapUserToResponse(user);
  }
}

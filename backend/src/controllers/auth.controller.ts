import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from '../schemas/auth.schema';
import { env } from '../config/env';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService = new AuthService()) {
    this.authService = authService;
  }

  private signAccessJwt(request: FastifyRequest) {
    return (payload: object, options?: { expiresIn?: string }) =>
      request.server.jwt.sign(payload, options);
  }

  private signRefreshJwt(request: FastifyRequest) {
    return (payload: object, options?: { expiresIn?: string }) =>
      request.server.jwt.sign(payload, {
        ...options,
        // Override sign secret with refresh secret
        key: env.JWT_REFRESH_SECRET,
      } as object);
  }

  private verifyRefreshJwt(request: FastifyRequest) {
    return (token: string) =>
      request.server.jwt.verify(token, {
        key: env.JWT_REFRESH_SECRET,
      } as object) as { jti: string; sub: string };
  }

  register = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const input = registerSchema.parse(request.body);
    const result = await this.authService.register(
      input,
      this.signAccessJwt(request),
      this.signRefreshJwt(request),
    );
    reply.status(201).send(result);
  };

  login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const input = loginSchema.parse(request.body);
    const result = await this.authService.login(
      input,
      this.signAccessJwt(request),
      this.signRefreshJwt(request),
    );
    reply.status(200).send(result);
  };

  getMe = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userPayload = request.user;
    const userProfile = await this.authService.getProfile(userPayload.id);
    reply.status(200).send({ user: userProfile });
  };

  refresh = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const input = refreshSchema.parse(request.body);
    const result = await this.authService.refresh(
      input.refreshToken,
      this.verifyRefreshJwt(request),
      this.signAccessJwt(request),
      this.signRefreshJwt(request),
    );
    reply.status(200).send(result);
  };

  logout = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const input = logoutSchema.parse(request.body);
    await this.authService.logout(input.refreshToken, this.verifyRefreshJwt(request));
    reply.status(200).send({ success: true, message: 'Logged out successfully' });
  };
}

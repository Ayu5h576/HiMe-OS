import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../schemas/auth.schema';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService = new AuthService()) {
    this.authService = authService;
  }

  register = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const input = registerSchema.parse(request.body);
    const result = await this.authService.register(input, (payload, options) =>
      request.server.jwt.sign(payload, options),
    );
    reply.status(201).send(result);
  };

  login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const input = loginSchema.parse(request.body);
    const result = await this.authService.login(input, (payload, options) =>
      request.server.jwt.sign(payload, options),
    );
    reply.status(200).send(result);
  };

  getMe = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userPayload = request.user;
    const userProfile = await this.authService.getProfile(userPayload.id);
    reply.status(200).send({ user: userProfile });
  };
}

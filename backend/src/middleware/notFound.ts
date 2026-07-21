import { FastifyRequest, FastifyReply } from 'fastify';

export const notFoundHandler = (request: FastifyRequest, reply: FastifyReply): void => {
  reply.status(404).send({
    success: false,
    error: 'Not Found',
    message: `Route ${request.method} ${request.url} not found`,
    timestamp: new Date().toISOString(),
  });
};

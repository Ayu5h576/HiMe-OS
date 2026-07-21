import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { env } from '../config/env';

export const errorHandler = (
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void => {
  request.log.error(error);

  if (error instanceof ZodError) {
    reply.status(400).send({
      success: false,
      error: 'Validation Error',
      details: error.errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const statusCode = 'statusCode' in error && error.statusCode ? error.statusCode : 500;
  const message =
    statusCode === 500 && env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message;

  reply.status(statusCode).send({
    success: false,
    error: statusCode === 500 ? 'Internal Error' : 'Bad Request',
    message,
    timestamp: new Date().toISOString(),
  });
};

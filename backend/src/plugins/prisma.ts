import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { prisma, connectDatabase } from '../config/database';

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  await connectDatabase();

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    instance.log.info('Disconnecting Prisma Client...');
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin, { name: 'prisma' });

declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

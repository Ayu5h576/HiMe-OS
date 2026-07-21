import { buildApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const startServer = async (): Promise<void> => {
  try {
    const app = await buildApp();

    const host = '0.0.0.0';
    const port = env.PORT;

    await app.listen({ port, host });
    logger.info(`🚀 HiMe OS Backend Server listening on http://localhost:${port}`);
    logger.info(`📚 Swagger OpenAPI documentation available on http://localhost:${port}/docs`);

    const gracefulShutdown = async (signal: string) => {
      logger.info(`⚠️ Received ${signal}. Starting graceful shutdown...`);
      try {
        await app.close();
        logger.info('👋 Server shut down gracefully');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, '❌ Error during server shutdown');
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    logger.error({ err: error }, '❌ Fatal error starting HiMe OS Backend Server');
    process.exit(1);
  }
};

startServer();

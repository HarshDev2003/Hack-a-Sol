import http from 'http';
import app from './app.js';
import env from './config/env.js';
import { connectDatabase } from './config/database.js';
import logger from './config/logger.js';

const startServer = async () => {
  try {
    await connectDatabase();
    const server = http.createServer(app);
    server.listen(env.port, () => {
      logger.info(`🚀 API server listening on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();


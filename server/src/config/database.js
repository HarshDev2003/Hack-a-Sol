import mongoose from 'mongoose';
import env from './env.js';
import logger from './logger.js';

mongoose.set('strictQuery', true);

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      dbName: env.nodeEnv === 'test' ? 'lumen_test' : undefined
    });
    logger.info('✅ MongoDB connected');
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection error');
    throw error;
  }
};

export default mongoose;


import mongoose from 'mongoose';
import { logger } from './logger.js';

export const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed successfully');
  } catch (error) {
    logger.error(`Error closing database connection: ${error.message}`);
    throw error;
  }
};

export const checkDatabaseConnection = () => {
  return mongoose.connection.readyState === 1;
};

export const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
    };
  } catch (error) {
    logger.error(`Error getting database stats: ${error.message}`);
    throw error;
  }
};
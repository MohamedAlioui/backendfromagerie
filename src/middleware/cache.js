import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));

export const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await redisClient.get(key);
      
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // Store the original res.json function
      const originalJson = res.json;

      // Override res.json method to cache the response
      res.json = function(body) {
        redisClient.setEx(key, duration, JSON.stringify(body))
          .catch(err => logger.error('Redis cache error:', err));
          
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

export const clearCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cleared cache for pattern: ${pattern}`);
    }
  } catch (error) {
    logger.error('Clear cache error:', error);
  }
};
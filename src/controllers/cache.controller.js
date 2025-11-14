import cacheService from '../services/cache.service.js';
import logger from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/response.js';

class CacheController {
  async getCacheStats(req, res, next) {
    try {
      logger.info('Fetching cache statistics');
      
      const stats = cacheService.getStats();
      
      sendSuccess(res, {
        cache: stats,
        server: {
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        }
      }, 'Cache statistics retrieved successfully', 200, req.requestId);
    } catch (error) {
      logger.error('Error fetching cache stats:', error);
      next(error);
    }
  }

  async resetCacheStats(req, res, next) {
    try {
      cacheService.resetStats();
      logger.info('Cache statistics reset');
      
      sendSuccess(res, cacheService.getStats(), 'Cache statistics reset successfully', 200, req.requestId);
    } catch (error) {
      logger.error('Error resetting cache stats:', error);
      next(error);
    }
  }

  async flushCache(req, res, next) {
    try {
      const stats = cacheService.getStats();
      cacheService.cache.flushAll();
      cacheService.resetStats();
      
      logger.info(`Cache flushed - removed ${stats.size} keys`);
      
      sendSuccess(res, cacheService.getStats(), `Cache flushed successfully - removed ${stats.size} keys`, 200, req.requestId);
    } catch (error) {
      logger.error('Error flushing cache:', error);
      next(error);
    }
  }
}

export default new CacheController();

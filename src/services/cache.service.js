import NodeCache from 'node-cache';
import logger from '../utils/logger.js';

class CacheService {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600,
      checkperiod: 600,
      useClones: false,
      maxKeys: 1000
    });
    
    this.stats = {
      hits: 0,
      misses: 0,
      keys: 0,
      expires: 0
    };
  }

  get(key) {
    const value = this.cache.get(key);
    if (value === undefined) {
      this.stats.misses++;
      logger.debug(`Cache miss for key: ${key}`);
    } else {
      this.stats.hits++;
      logger.debug(`Cache hit for key: ${key}`);
    }
    return value;
  }

  set(key, value, ttl = null) {
    const success = ttl ? 
      this.cache.set(key, value, ttl) : 
      this.cache.set(key, value);
    
    if (success) {
      this.stats.keys = this.cache.keys().length;
    }
    return success;
  }

  del(key) {
    const deleted = this.cache.del(key);
    if (deleted) {
      this.stats.keys = this.cache.keys().length;
    }
    return deleted;
  }

  size() {
    return this.cache.keys().length;
  }

  getStats() {
    const keys = this.cache.keys();
    const memoryUsage = process.memoryUsage();
    
    return {
      size: keys.length,
      maxSize: this.cache.options.maxKeys || 1000,
      defaultTTL: this.cache.options.stdTTL,
      checkPeriod: this.cache.options.checkperiod,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits + this.stats.misses > 0 ? 
        (this.stats.hits / (this.stats.hits + this.stats.misses)).toFixed(4) : 0,
      totalKeys: this.stats.keys,
      expiredCount: this.stats.expires,
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
      },
      timestamp: new Date().toISOString()
    };
  }

  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      keys: this.cache.keys().length,
      expires: 0
    };
  }
}

export default new CacheService();

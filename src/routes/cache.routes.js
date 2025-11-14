import express from 'express';
import cacheController from '../controllers/cache.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authenticate, authorize(['admin']), cacheController.getCacheStats);
router.post('/stats/reset', authenticate, authorize(['admin']), cacheController.resetCacheStats);
router.post('/flush', authenticate, authorize(['admin']), cacheController.flushCache);

export default router;

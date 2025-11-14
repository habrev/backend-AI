import express from 'express';
import aiController from '../controllers/ai.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import rateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(rateLimiter);

router.get('/models', aiController.getAvailableModels);

router.post('/chat', optionalAuth, aiController.chat);
router.post('/generate', optionalAuth, aiController.generateText);
router.post('/sentiment', optionalAuth, aiController.analyzeSentiment);
router.post('/summarize', optionalAuth, aiController.summarizeText);

export default router;

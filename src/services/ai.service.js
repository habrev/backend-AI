import openaiService from './openai.service.js';
import cacheService from './cache.service.js';
import { getDefaultModel } from '../config/ai-models.js';
import logger from '../utils/logger.js';

class AIService {
  async chatCompletion(message, model = null, temperature = 0.7, maxTokens = 500) {
    const selectedModel = model || getDefaultModel().id;
    
    // Create cache key based on input parameters
    const cacheKey = `chat:${selectedModel}:${Buffer.from(message).toString('base64').slice(0, 50)}`;
    
    // Check cache first
    const cachedResponse = cacheService.get(cacheKey);
    if (cachedResponse) {
      logger.debug(`Cache hit for chat completion with model: ${selectedModel}`);
      return cachedResponse;
    }

    logger.info(`Processing chat completion with model: ${selectedModel}`);
    
    const response = await openaiService.chatCompletion(
      message,
      selectedModel,
      temperature,
      maxTokens
    );

    // Cache the response with TTL based on model (longer for more expensive models)
    const ttl = selectedModel.includes('gpt-4') ? 3600 : 1800; // 1 hour for GPT-4, 30 min for others
    cacheService.set(cacheKey, response, ttl);

    return response;
  }

  async generateText(prompt, model = null, temperature = 0.7, maxTokens = 300) {
    const selectedModel = model || getDefaultModel().id;
    
    const cacheKey = `generate:${selectedModel}:${Buffer.from(prompt).toString('base64').slice(0, 50)}`;
    
    const cachedResponse = cacheService.get(cacheKey);
    if (cachedResponse) {
      logger.debug(`Cache hit for text generation with model: ${selectedModel}`);
      return cachedResponse;
    }

    logger.info(`Processing text generation with model: ${selectedModel}`);
    
    const response = await openaiService.generateText(
      prompt,
      selectedModel,
      temperature,
      maxTokens
    );

    const ttl = selectedModel.includes('gpt-4') ? 3600 : 1800;
    cacheService.set(cacheKey, response, ttl);

    return response;
  }

  async analyzeSentiment(text, model = null) {
    const selectedModel = model || getDefaultModel().id;
    
    const cacheKey = `sentiment:${selectedModel}:${Buffer.from(text).toString('base64').slice(0, 50)}`;
    
    const cachedResponse = cacheService.get(cacheKey);
    if (cachedResponse) {
      logger.debug(`Cache hit for sentiment analysis with model: ${selectedModel}`);
      return cachedResponse;
    }

    logger.info(`Processing sentiment analysis with model: ${selectedModel}`);
    
    const response = await openaiService.analyzeSentiment(text, selectedModel);

    cacheService.set(cacheKey, response, 1800); // 30 minutes TTL

    return response;
  }

  async summarizeText(text, model = null, maxLength = 150) {
    const selectedModel = model || getDefaultModel().id;
    
    const cacheKey = `summary:${selectedModel}:${Buffer.from(text).toString('base64').slice(0, 50)}`;
    
    const cachedResponse = cacheService.get(cacheKey);
    if (cachedResponse) {
      logger.debug(`Cache hit for text summarization with model: ${selectedModel}`);
      return cachedResponse;
    }

    logger.info(`Processing text summarization with model: ${selectedModel}`);
    
    const response = await openaiService.summarizeText(text, selectedModel, maxLength);

    const ttl = selectedModel.includes('gpt-4') ? 3600 : 1800;
    cacheService.set(cacheKey, response, ttl);

    return response;
  }
}

export default new AIService();

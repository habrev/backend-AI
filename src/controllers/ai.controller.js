import aiService from '../services/ai.service.js';
import { getAvailableModels, isValidModel, getDefaultModel } from '../config/ai-models.js';
import logger from '../utils/logger.js';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/response.js';

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  model: z.string().optional().default(getDefaultModel().id),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(4000).optional().default(500)
});

const generateSchema = z.object({
  prompt: z.string().min(1).max(5000),
  model: z.string().optional().default(getDefaultModel().id),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(2000).optional().default(300)
});

const sentimentSchema = z.object({
  text: z.string().min(1).max(5000),
  model: z.string().optional().default(getDefaultModel().id)
});

const summarizeSchema = z.object({
  text: z.string().min(1).max(10000),
  model: z.string().optional().default(getDefaultModel().id),
  maxLength: z.number().min(50).max(1000).optional().default(150)
});

class AIController {
  async chat(req, res, next) {
    try {
      const validatedData = chatSchema.parse(req.body);
      
      if (!isValidModel(validatedData.model)) {
        return sendError(res, `Invalid model: ${validatedData.model}. Available models: ${getAvailableModels().map(m => m.id).join(', ')}`, 400, req.requestId);
      }

      logger.info(`AI Chat request - Model: ${validatedData.model}, Message length: ${validatedData.message.length}`);

      const result = await aiService.chatCompletion(
        validatedData.message,
        validatedData.model,
        validatedData.temperature,
        validatedData.maxTokens
      );

      sendSuccess(res, {
        response: result,
        model: validatedData.model,
        timestamp: new Date().toISOString()
      }, 'Chat completion successful', 200, req.requestId);
    } catch (error) {
      logger.error('AI Chat error:', error);
      next(error);
    }
  }

  async generateText(req, res, next) {
    try {
      const validatedData = generateSchema.parse(req.body);
      
      if (!isValidModel(validatedData.model)) {
        return sendError(res, `Invalid model: ${validatedData.model}`, 400, req.requestId);
      }

      logger.info(`Text Generation request - Model: ${validatedData.model}, Prompt length: ${validatedData.prompt.length}`);

      const result = await aiService.generateText(
        validatedData.prompt,
        validatedData.model,
        validatedData.temperature,
        validatedData.maxTokens
      );

      sendSuccess(res, {
        generatedText: result,
        model: validatedData.model,
        timestamp: new Date().toISOString()
      }, 'Text generation successful', 200, req.requestId);
    } catch (error) {
      logger.error('Text Generation error:', error);
      next(error);
    }
  }

  async analyzeSentiment(req, res, next) {
    try {
      const validatedData = sentimentSchema.parse(req.body);
      
      if (!isValidModel(validatedData.model)) {
        return sendError(res, `Invalid model: ${validatedData.model}`, 400, req.requestId);
      }

      logger.info(`Sentiment Analysis request - Model: ${validatedData.model}, Text length: ${validatedData.text.length}`);

      const result = await aiService.analyzeSentiment(
        validatedData.text,
        validatedData.model
      );

      sendSuccess(res, {
        sentiment: result,
        model: validatedData.model,
        timestamp: new Date().toISOString()
      }, 'Sentiment analysis successful', 200, req.requestId);
    } catch (error) {
      logger.error('Sentiment Analysis error:', error);
      next(error);
    }
  }

  async summarizeText(req, res, next) {
    try {
      const validatedData = summarizeSchema.parse(req.body);
      
      if (!isValidModel(validatedData.model)) {
        return sendError(res, `Invalid model: ${validatedData.model}`, 400, req.requestId);
      }


      logger.info(`Text Summarization request - Model: ${validatedData.model}, Text length: ${validatedData.text.length}`);

      const result = await aiService.summarizeText(
        validatedData.text,
        validatedData.model,
        validatedData.maxLength
      );

      sendSuccess(res, {
        summary: result,
        model: validatedData.model,
        originalLength: validatedData.text.length,
        summaryLength: result.length,
        timestamp: new Date().toISOString()
      }, 'Text summarization successful', 200, req.requestId);
    } catch (error) {
      logger.error('Text Summarization error:', error);
      next(error);
    }
  }

  async getAvailableModels(req, res, next) {
    try {
      const models = getAvailableModels();
      
      sendSuccess(res, {
        models,
        defaultModel: getDefaultModel().id,
        timestamp: new Date().toISOString()
      }, 'Available models retrieved successfully', 200, req.requestId);
    } catch (error) {
      logger.error('Error getting available models:', error);
      next(error);
    }
  }
}

export default new AIController();

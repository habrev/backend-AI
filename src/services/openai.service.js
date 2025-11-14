import OpenAI from 'openai';
import logger from '../utils/logger.js';
import { getModelById } from '../config/ai-models.js';

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'mock-key'
    });
    this.useMock = !process.env.OPENAI_API_KEY;
  }

  async chatCompletion(message, model = 'gpt-3.5-turbo', temperature = 0.7, maxTokens = 500) {
    if (this.useMock) {
      return this._mockAIResponse(`Mock response for: ${message}`, model);
    }

    try {
      // Validate model constraints
      const modelConfig = getModelById(model);
      const actualMaxTokens = Math.min(maxTokens, modelConfig.maxTokens);

      logger.debug(`Calling OpenAI chat completion with model: ${model}, maxTokens: ${actualMaxTokens}`);

      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'user', content: message }
        ],
        temperature: temperature,
        max_tokens: actualMaxTokens
      });

      return completion.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
  }

  async generateText(prompt, model = 'gpt-3.5-turbo', temperature = 0.7, maxTokens = 300) {
    if (this.useMock) {
      return this._mockAIResponse(`Mock generated text for: ${prompt}`, model);
    }

    try {
      const modelConfig = getModelById(model);
      const actualMaxTokens = Math.min(maxTokens, modelConfig.maxTokens);

      logger.debug(`Calling OpenAI text generation with model: ${model}`);

      const completion = await this.openai.completions.create({
        model: model,
        prompt: prompt,
        temperature: temperature,
        max_tokens: actualMaxTokens
      });

      return completion.choices[0].text;
    } catch (error) {
      logger.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
  }

  async analyzeSentiment(text, model = 'gpt-3.5-turbo') {
    if (this.useMock) {
      const sentiments = ['positive', 'negative', 'neutral'];
      return sentiments[Math.floor(Math.random() * sentiments.length)];
    }

    try {
      const prompt = `Analyze the sentiment of the following text and respond with only one word: positive, negative, or neutral.\n\nText: "${text}"`;
      
      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 10
      });

      return completion.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
      logger.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
  }

  async summarizeText(text, model = 'gpt-3.5-turbo', maxLength = 150) {
    if (this.useMock) {
      return `Mock summary for text of length ${text.length}. Original: ${text.substring(0, 100)}...`;
    }

    try {
      const prompt = `Please summarize the following text in about ${maxLength} characters:\n\n${text}`;
      
      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: Math.ceil(maxLength / 4) // Rough estimate
      });

      return completion.choices[0].message.content;
    } catch (error) {
      logger.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
  }

  _mockAIResponse(baseResponse, model) {
    logger.debug(`Using mock response for model: ${model}`);
    return `${baseResponse} [Generated with ${model} - Mock Mode]`;
  }
}

export default new OpenAIService();

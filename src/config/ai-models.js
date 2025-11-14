export const AI_MODELS = {
  GPT_3_5_TURBO: {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    maxTokens: 4096,
    contextWindow: 16385,
    description: 'Fast, efficient model for most tasks'
  },
  GPT_3_5_TURBO_16K: {
    id: 'gpt-3.5-turbo-16k',
    name: 'GPT-3.5 Turbo 16K',
    maxTokens: 16384,
    contextWindow: 16385,
    description: 'GPT-3.5 Turbo with larger context window'
  },
  GPT_4: {
    id: 'gpt-4',
    name: 'GPT-4',
    maxTokens: 8192,
    contextWindow: 8192,
    description: 'More capable model for complex tasks'
  },
  GPT_4_TURBO: {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    maxTokens: 4096,
    contextWindow: 128000,
    description: 'Latest GPT-4 Turbo with large context window'
  },
  GPT_4_32K: {
    id: 'gpt-4-32k',
    name: 'GPT-4 32K',
    maxTokens: 32768,
    contextWindow: 32768,
    description: 'GPT-4 with extended context window'
  }
};

export const getModelById = (modelId) => {
  return Object.values(AI_MODELS).find(model => model.id === modelId);
};

export const isValidModel = (modelId) => {
  return Object.values(AI_MODELS).some(model => model.id === modelId);
};

export const getDefaultModel = () => {
  return AI_MODELS.GPT_3_5_TURBO;
};

export const getAvailableModels = () => {
  return Object.values(AI_MODELS).map(model => ({
    id: model.id,
    name: model.name,
    maxTokens: model.maxTokens,
    contextWindow: model.contextWindow,
    description: model.description
  }));
};

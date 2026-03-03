export const AI_API_KEY_HEADER = 'x-ai-api-key';
export const AI_BASE_URL_HEADER = 'x-ai-base-url';
export const AI_MODEL_HEADER = 'x-ai-model';

export interface AIClientConfig {
  apiKey: string;
  baseURL: string;
  model?: string;
}

const MISSING_AI_CONFIG_ERROR = '缺少 AI 设置。请先在“设置”页面填写 API Key 和 Base URL。模型名可在同一页面配置。';

export function getAIClientConfigFromHeaders(headers: Headers): AIClientConfig {
  const apiKey = headers.get(AI_API_KEY_HEADER)?.trim() ?? '';
  const baseURL = headers.get(AI_BASE_URL_HEADER)?.trim() ?? '';
  const model = headers.get(AI_MODEL_HEADER)?.trim() ?? '';

  if (!apiKey || !baseURL) {
    throw new Error(MISSING_AI_CONFIG_ERROR);
  }

  return {
    apiKey,
    baseURL,
    model: model || undefined,
  };
}

export function isMissingAIClientConfigError(error: unknown): boolean {
  return error instanceof Error && error.message === MISSING_AI_CONFIG_ERROR;
}

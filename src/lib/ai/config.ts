export interface AIClientConfig {
  apiKey: string;
  baseURL: string;
  model?: string;
}

export const MISSING_AI_CONFIG_ERROR =
  '缺少 AI 设置。请先在“设置”页面填写 API Key 和 Base URL。模型名可在同一页面配置。';

export function ensureAIClientConfig(config: AIClientConfig): AIClientConfig {
  const apiKey = config.apiKey?.trim() ?? '';
  const baseURL = config.baseURL?.trim() ?? '';
  const model = config.model?.trim() ?? '';

  if (!apiKey || !baseURL) {
    throw new Error(MISSING_AI_CONFIG_ERROR);
  }

  return {
    apiKey,
    baseURL,
    model: model || undefined,
  };
}

export function normalizeAIBaseURL(baseURL: string): string {
  return baseURL.trim().replace(/\/+$/, '');
}

export function isMissingAIClientConfigError(error: unknown): boolean {
  return error instanceof Error && error.message === MISSING_AI_CONFIG_ERROR;
}

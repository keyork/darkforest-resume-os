'use client';

import { ensureAIClientConfig, type AIClientConfig } from '@/lib/ai/config';

export const AI_SETTINGS_STORAGE_KEY = 'darkforest.ai.settings';
export const DEFAULT_AI_MODEL = 'moonshotai/Kimi-K2.5';

export interface AISettings {
  apiKey: string;
  baseURL: string;
  modelName: string;
}

export function getStoredAISettings(): AISettings {
  if (typeof window === 'undefined') {
    return { apiKey: '', baseURL: '', modelName: DEFAULT_AI_MODEL };
  }

  const raw = window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return { apiKey: '', baseURL: '', modelName: DEFAULT_AI_MODEL };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AISettings>;
    return {
      apiKey: parsed.apiKey?.trim() ?? '',
      baseURL: parsed.baseURL?.trim() ?? '',
      modelName: parsed.modelName?.trim() || DEFAULT_AI_MODEL,
    };
  } catch {
    return { apiKey: '', baseURL: '', modelName: DEFAULT_AI_MODEL };
  }
}

export function saveAISettings(settings: AISettings) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    AI_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      apiKey: settings.apiKey.trim(),
      baseURL: settings.baseURL.trim(),
      modelName: settings.modelName.trim() || DEFAULT_AI_MODEL,
    })
  );
}

export function clearAISettings() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
}

export function hasStoredAISettings(settings = getStoredAISettings()): boolean {
  return Boolean(settings.apiKey && settings.baseURL);
}

export function getStoredAIClientConfig(settings = getStoredAISettings()): AIClientConfig {
  return ensureAIClientConfig({
    apiKey: settings.apiKey.trim(),
    baseURL: settings.baseURL.trim(),
    model: settings.modelName.trim() || DEFAULT_AI_MODEL,
  });
}

export function getAIClientConfigFromSettings(settings: AISettings): AIClientConfig {
  return ensureAIClientConfig({
    apiKey: settings.apiKey.trim(),
    baseURL: settings.baseURL.trim(),
    model: settings.modelName.trim() || DEFAULT_AI_MODEL,
  });
}

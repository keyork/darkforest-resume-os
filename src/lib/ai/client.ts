import OpenAI from 'openai';
import type { ZodType } from 'zod';
import type { AIClientConfig } from './config';

declare global {
  // eslint-disable-next-line no-var
  var __openaiClients: Map<string, OpenAI> | undefined;
}

function getOpenAI(config: AIClientConfig): OpenAI {
  if (!global.__openaiClients) {
    global.__openaiClients = new Map();
  }

  const cacheKey = `${config.baseURL}::${config.apiKey}`;
  const existing = global.__openaiClients.get(cacheKey);
  if (existing) return existing;

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  global.__openaiClients.set(cacheKey, client);
  return client;
}

export interface CallAgentOptions {
  systemPrompt: string;
  userMessage: string;
  clientConfig: AIClientConfig;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  schema?: ZodType<unknown>;
}

const DEFAULT_MODEL = 'moonshotai/Kimi-K2.5';
const MAX_JSON_RETRIES = 2;

export async function callAgent<T>(options: CallAgentOptions): Promise<T> {
  const {
    systemPrompt,
    userMessage,
    clientConfig,
    model = clientConfig.model ?? DEFAULT_MODEL,
    maxTokens = 8192,
    temperature = 0.2,
    schema,
  } = options;

  const client = getOpenAI(clientConfig);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_JSON_RETRIES; attempt += 1) {
    const response = await client.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature,
      // NOTE: do NOT pass response_format — Kimi API doesn't support it and
      // returns empty content when the parameter is present. JSON output is
      // enforced via the system prompt instead.
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    const choice = response.choices[0];
    const finishReason = choice?.finish_reason ?? 'unknown';
    const content = normalizeMessageContent(choice?.message?.content);

    if (!content) {
      lastError = new Error(
        `AI returned empty response (finish_reason: ${finishReason}, model: ${model}, attempt: ${attempt})`
      );
      continue;
    }

    const jsonText = extractJson(content);

    try {
      const parsed = JSON.parse(jsonText) as unknown;
      return (schema ? schema.parse(parsed) : parsed) as T;
    } catch (error) {
      lastError = new Error(
        `Failed to parse/validate AI JSON response (finish_reason: ${finishReason}, model: ${model}, attempt: ${attempt}): ${jsonText.slice(0, 300)}${error instanceof Error ? ` :: ${error.message}` : ''}`
      );

      if (!shouldRetryJsonParse(jsonText, finishReason) || attempt === MAX_JSON_RETRIES) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error(`AI call failed unexpectedly (model: ${model})`);
}

export async function callAgentText(options: CallAgentOptions): Promise<string> {
  const {
    systemPrompt,
    userMessage,
    clientConfig,
    model = clientConfig.model ?? DEFAULT_MODEL,
    maxTokens = 8192,
    temperature = 0.6,
  } = options;

  const client = getOpenAI(clientConfig);

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });

  const choice = response.choices[0];
  const content = normalizeMessageContent(choice?.message?.content);

  if (!content) {
    const reason = choice?.finish_reason ?? 'unknown';
    throw new Error(
      `AI returned empty response (finish_reason: ${reason}, model: ${model})`
    );
  }

  return content;
}

/**
 * Strip surrounding markdown code fences and return raw JSON text.
 * Handles: ```json ... ```, ``` ... ```, and bare JSON.
 */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

function normalizeMessageContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return content
    .map((part) => {
      if (
        part &&
        typeof part === 'object' &&
        'text' in part &&
        typeof part.text === 'string'
      ) {
        return part.text;
      }
      return '';
    })
    .join('')
    .trim();
}

function shouldRetryJsonParse(jsonText: string, finishReason: string): boolean {
  if (finishReason === 'length') return true;

  const trimmed = jsonText.trim();
  const openCurly = (trimmed.match(/{/g) ?? []).length;
  const closeCurly = (trimmed.match(/}/g) ?? []).length;
  const openSquare = (trimmed.match(/\[/g) ?? []).length;
  const closeSquare = (trimmed.match(/]/g) ?? []).length;

  return openCurly !== closeCurly || openSquare !== closeSquare;
}

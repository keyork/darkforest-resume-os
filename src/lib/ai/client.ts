import type { ZodType } from 'zod';
import type { AIClientConfig } from './config';
import { ensureAIClientConfig, normalizeAIBaseURL } from './config';

export interface CallAgentOptions {
  systemPrompt: string;
  userMessage: string;
  clientConfig: AIClientConfig;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  schema?: ZodType<unknown>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

const DEFAULT_MODEL = 'moonshotai/Kimi-K2.5';
export const AI_REQUEST_TIMEOUT_MS = 180_000;
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
    signal,
    timeoutMs = AI_REQUEST_TIMEOUT_MS,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_JSON_RETRIES; attempt += 1) {
    const response = await createChatCompletion({
      clientConfig,
      model,
      maxTokens,
      temperature,
      systemPrompt,
      userMessage,
      signal,
      timeoutMs,
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
    signal,
    timeoutMs = AI_REQUEST_TIMEOUT_MS,
  } = options;

  const response = await createChatCompletion({
    clientConfig,
    model,
    maxTokens,
    temperature,
    systemPrompt,
    userMessage,
    signal,
    timeoutMs,
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

export async function testAIConnection(
  clientConfig: AIClientConfig,
  signal?: AbortSignal,
): Promise<{ model: string; reply: string }> {
  const normalizedConfig = ensureAIClientConfig(clientConfig);
  const model = normalizedConfig.model ?? DEFAULT_MODEL;

  const reply = await callAgentText({
    systemPrompt: 'You are a connectivity test assistant.',
    userMessage: 'Reply with exactly one word: PONG',
    clientConfig: normalizedConfig,
    model,
    maxTokens: 16,
    temperature: 0,
    signal,
    timeoutMs: 30_000,
  });

  return {
    model,
    reply: reply.trim() || '(empty response)',
  };
}

interface CreateChatCompletionInput {
  clientConfig: AIClientConfig;
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  userMessage: string;
  signal?: AbortSignal;
  timeoutMs: number;
}

interface ChatCompletionResponse {
  choices: Array<{
    finish_reason?: string | null;
    message?: {
      content?: unknown;
    } | null;
  }>;
}

async function createChatCompletion(
  input: CreateChatCompletionInput,
): Promise<ChatCompletionResponse> {
  const config = ensureAIClientConfig(input.clientConfig);
  const request = createRequestSignal(input.signal, input.timeoutMs);

  try {
    const response = await fetch(`${normalizeAIBaseURL(config.baseURL)}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        max_tokens: input.maxTokens,
        temperature: input.temperature,
        messages: [
          { role: 'system', content: input.systemPrompt },
          { role: 'user', content: input.userMessage },
        ],
      }),
      signal: request.signal,
    });

    if (!response.ok) {
      throw new Error(await formatErrorResponse(response));
    }

    return (await response.json()) as ChatCompletionResponse;
  } catch (error) {
    if (
      request.didTimeout &&
      (error instanceof DOMException && error.name === 'AbortError')
    ) {
      throw new Error(`AI request timed out after ${Math.round(input.timeoutMs / 1000)}s`);
    }

    throw error;
  } finally {
    request.cleanup();
  }
}

function createRequestSignal(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  let didTimeout = false;

  const onAbort = () => {
    controller.abort(signal?.reason);
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason);
    } else {
      signal.addEventListener('abort', onAbort, { once: true });
    }
  }

  const timeoutId = windowOrGlobalThis().setTimeout(() => {
    didTimeout = true;
    controller.abort(new DOMException('AI request timeout', 'AbortError'));
  }, timeoutMs);

  return {
    signal: controller.signal,
    get didTimeout() {
      return didTimeout;
    },
    cleanup() {
      windowOrGlobalThis().clearTimeout(timeoutId);
      signal?.removeEventListener('abort', onAbort);
    },
  };
}

function windowOrGlobalThis() {
  return globalThis;
}

async function formatErrorResponse(response: Response): Promise<string> {
  const bodyText = await response.text().catch(() => response.statusText);

  try {
    const parsed = JSON.parse(bodyText) as {
      error?: {
        message?: string;
        code?: string;
      } | string;
    };
    const errorObject =
      parsed.error && typeof parsed.error === 'object'
        ? parsed.error
        : undefined;

    if (typeof parsed.error === 'string' && parsed.error.trim()) {
      return `${response.status} ${response.statusText}: ${parsed.error}`;
    }

    if (errorObject?.message) {
      const code = errorObject.code ? ` (${errorObject.code})` : '';
      return `${response.status} ${response.statusText}: ${errorObject.message}${code}`;
    }
  } catch {
    // Ignore JSON parse errors and fall back to raw response text.
  }

  return `${response.status} ${response.statusText}: ${bodyText || response.statusText}`;
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

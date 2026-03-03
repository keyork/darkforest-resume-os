import OpenAI from 'openai';

// Singleton OpenAI client pointing at Moonshot API
declare global {
  // eslint-disable-next-line no-var
  var __openai: OpenAI | undefined;
}

function getOpenAI(): OpenAI {
  if (!global.__openai) {
    global.__openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? '',
      baseURL: process.env.OPENAI_BASE_URL ?? 'https://api.moonshot.cn/v1',
    });
  }
  return global.__openai;
}

export interface CallAgentOptions {
  systemPrompt: string;
  userMessage: string;
  model?: string;
  maxTokens?: number;
}

export async function callAgent<T>(options: CallAgentOptions): Promise<T> {
  const {
    systemPrompt,
    userMessage,
    model = 'kimi-k2.5',
    maxTokens = 8192,
  } = options;

  const client = getOpenAI();

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    // NOTE: do NOT pass response_format — Kimi API doesn't support it and
    // returns empty content when the parameter is present. JSON output is
    // enforced via the system prompt instead.
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });

  const choice = response.choices[0];
  const content = choice?.message?.content;

  if (!content) {
    const reason = choice?.finish_reason ?? 'unknown';
    throw new Error(
      `AI returned empty response (finish_reason: ${reason}, model: ${model})`
    );
  }

  // Strip markdown code fences if present (e.g. ```json ... ```)
  const jsonText = extractJson(content);

  try {
    return JSON.parse(jsonText) as T;
  } catch {
    throw new Error(
      `Failed to parse AI JSON response: ${jsonText.slice(0, 300)}`
    );
  }
}

export async function callAgentText(options: CallAgentOptions): Promise<string> {
  const {
    systemPrompt,
    userMessage,
    model = 'kimi-k2.5',
    maxTokens = 8192,
  } = options;

  const client = getOpenAI();

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });

  const choice = response.choices[0];
  const content = choice?.message?.content;

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

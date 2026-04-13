export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAIClientConfigFromHeaders } from '@/lib/ai/config';
import OpenAI from 'openai';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const config = getAIClientConfigFromHeaders(req.headers);
    const model = config.model ?? 'moonshotai/Kimi-K2.5';

    const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL });

    const response = await client.chat.completions.create({
      model,
      max_tokens: 16,
      temperature: 0,
      messages: [
        { role: 'system', content: 'You are a connectivity test assistant.' },
        { role: 'user', content: 'Reply with exactly one word: PONG' },
      ],
    });

    const reply = response.choices[0]?.message?.content?.trim() ?? '(empty response)';
    return NextResponse.json({ ok: true, model, reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

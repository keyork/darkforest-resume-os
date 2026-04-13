export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { parseJDFromText } from '@/lib/ai/agents/jd-parser-agent';
import { getAIClientConfigFromHeaders, isMissingAIClientConfigError } from '@/lib/ai/config';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'JD 历史记录已切换到浏览器存储，请从客户端读取。' },
    { status: 405 }
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientConfig = getAIClientConfigFromHeaders(request.headers);
    const body = (await request.json()) as { text?: string };
    const text = body.text?.trim() ?? '';

    if (!text) {
      return NextResponse.json({ error: 'Missing required field: text' }, { status: 400 });
    }

    const parsed = await parseJDFromText(text, clientConfig);

    return NextResponse.json({
      rawText: text,
      parsed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to parse job description',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: isMissingAIClientConfigError(error) ? 400 : 500 }
    );
  }
}

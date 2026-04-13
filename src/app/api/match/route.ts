export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { runMatchAnalysis } from '@/lib/ai/agents/match-agent';
import { getAIClientConfigFromHeaders, isMissingAIClientConfigError } from '@/lib/ai/config';
import type { JobDescription } from '@/lib/types/jd';
import type { Item } from '@/lib/types/item';
import type { MatchResult } from '@/lib/types/match';
import type { Profile } from '@/lib/types/profile';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: '匹配历史已切换到浏览器存储，请从客户端读取。' },
    { status: 405 }
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientConfig = getAIClientConfigFromHeaders(request.headers);
    const body = (await request.json()) as {
      jd?: JobDescription;
      profile?: Profile;
      items?: Item[];
    };

    const jd = body.jd;
    const profile = body.profile;
    const items = Array.isArray(body.items) ? body.items : [];

    if (!jd?.parsed) {
      return NextResponse.json({ error: 'Missing parsed JD context' }, { status: 400 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Missing profile context' }, { status: 400 });
    }

    const profileSummary = {
      name: profile.name,
      title: profile.title,
      summary: profile.summary,
      contact: profile.contact,
      items: items
        .filter((item) => item.visible)
        .map(toSemanticItem),
    };

    const analysis = await runMatchAnalysis(profileSummary, jd.parsed, clientConfig);

    return NextResponse.json({
      analysis: analysis as Omit<MatchResult, 'id' | 'profileId' | 'jdId' | 'createdAt'>,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to run match analysis',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: isMissingAIClientConfigError(error) ? 400 : 500 }
    );
  }
}

function toSemanticItem(item: Item) {
  const {
    id,
    profileId,
    visible,
    sortOrder,
    source,
    createdAt,
    updatedAt,
    ...semanticItem
  } = item;

  void id;
  void profileId;
  void visible;
  void sortOrder;
  void source;
  void createdAt;
  void updatedAt;

  return semanticItem;
}

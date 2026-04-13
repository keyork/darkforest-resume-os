export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { generateResumeMarkdown } from '@/lib/ai/agents/resume-gen-agent';
import { getAIClientConfigFromHeaders, isMissingAIClientConfigError } from '@/lib/ai/config';
import type { JobDescription } from '@/lib/types/jd';
import type { Item } from '@/lib/types/item';
import type { MatchResult } from '@/lib/types/match';
import type { GenerationStrategy } from '@/lib/types/resume';
import type { Profile } from '@/lib/types/profile';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: '简历历史已切换到浏览器存储，请从客户端读取。' },
    { status: 405 }
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientConfig = getAIClientConfigFromHeaders(request.headers);
    const body = (await request.json()) as {
      profile?: Profile;
      items?: Item[];
      strategy?: GenerationStrategy;
      jd?: JobDescription;
      matchResult?: MatchResult;
    };

    const profile = body.profile;
    const items = Array.isArray(body.items) ? body.items : [];
    const strategy = body.strategy;
    const jd = body.jd;
    const matchResult = body.matchResult;

    if (!profile) {
      return NextResponse.json({ error: 'Missing profile context' }, { status: 400 });
    }

    if (!strategy?.narrative || !strategy.language || !strategy.length) {
      return NextResponse.json(
        { error: 'Missing required fields: narrative, language, length' },
        { status: 400 }
      );
    }

    const content = await generateResumeMarkdown(
      {
        profileName: profile.name,
        profileTitle: profile.title,
        profileSummary: profile.summary,
        profileContact: {
          email: profile.contact?.email,
          phone: profile.contact?.phone,
          location: profile.contact?.location,
          website: profile.contact?.website,
          linkedin: profile.contact?.linkedin,
          github: profile.contact?.github,
        },
        visibleItems: items.filter((item) => item.visible),
        strategy,
        parsedJD: jd?.parsed ?? null,
        matchResult: matchResult
          ? {
              resumeStrategy: matchResult.resumeStrategy,
            }
          : null,
      },
      clientConfig
    );

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate resume',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: isMissingAIClientConfigError(error) ? 400 : 500 }
    );
  }
}

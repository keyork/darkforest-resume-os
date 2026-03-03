export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatedResumes, jobDescriptions, matchResults, items, profiles } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import { generateResumeMarkdown } from '@/lib/ai/agents/resume-gen-agent';
import { getAIClientConfigFromHeaders, isMissingAIClientConfigError } from '@/lib/ai/config';
import type { GeneratedResume, GenerationStrategy, NarrativeStrategy } from '@/lib/types/resume';
import type { ParsedJD } from '@/lib/types/jd';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12);

const PROFILE_DEFAULT_ID = 'profile_default';

function serializeGeneratedResume(row: typeof generatedResumes.$inferSelect): GeneratedResume {
  return {
    id: row.id,
    profileId: row.profileId,
    jdId: row.jdId ?? undefined,
    matchResultId: row.matchResultId ?? undefined,
    strategy: JSON.parse(row.strategy) as GenerationStrategy,
    content: row.content,
    createdAt: row.createdAt,
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await db
      .select()
      .from(generatedResumes)
      .orderBy(desc(generatedResumes.createdAt));

    const resumes = rows.map((row) => ({
      id: row.id,
      profileId: row.profileId,
      jdId: row.jdId ?? undefined,
      strategy: JSON.parse(row.strategy) as GenerationStrategy,
      createdAt: row.createdAt,
    }));

    return NextResponse.json({ resumes });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch generated resumes', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientConfig = getAIClientConfigFromHeaders(request.headers);
    const body = await request.json() as {
      narrative: NarrativeStrategy;
      language: 'zh' | 'en';
      length: '1page' | '2page';
      jdId?: string;
      matchResultId?: string;
    };

    const { narrative, language, length, jdId, matchResultId } = body;

    if (!narrative || !language || !length) {
      return NextResponse.json(
        { error: 'Missing required fields: narrative, language, length' },
        { status: 400 }
      );
    }

    // 1. Fetch visible items for PROFILE_DEFAULT_ID
    const visibleItemRows = await db
      .select()
      .from(items)
      .where(and(eq(items.profileId, PROFILE_DEFAULT_ID), eq(items.visible, true)));

    // 2. Fetch profile
    const profileRows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, PROFILE_DEFAULT_ID));

    if (profileRows.length === 0) {
      return NextResponse.json({ error: 'Default profile not found' }, { status: 404 });
    }

    const profile = profileRows[0];

    // 3. Optionally fetch JD
    let parsedJD: ParsedJD | null = null;
    if (jdId) {
      const jdRows = await db
        .select()
        .from(jobDescriptions)
        .where(eq(jobDescriptions.id, jdId));

      if (jdRows.length === 0) {
        return NextResponse.json({ error: 'Job description not found' }, { status: 404 });
      }

      const jdRow = jdRows[0];
      parsedJD = jdRow.parsed ? (JSON.parse(jdRow.parsed) as ParsedJD) : null;
    }

    // 4. Optionally fetch match result
    let matchResultData: { resumeStrategy: { narrative: string; emphasize: string[]; deemphasize: string[] } } | null = null;
    if (matchResultId) {
      const mrRows = await db
        .select()
        .from(matchResults)
        .where(eq(matchResults.id, matchResultId));

      if (mrRows.length === 0) {
        return NextResponse.json({ error: 'Match result not found' }, { status: 404 });
      }

      const mrParsed = JSON.parse(mrRows[0].result) as { resumeStrategy?: { narrative: string; emphasize: string[]; deemphasize: string[] } };
      matchResultData = mrParsed.resumeStrategy
        ? { resumeStrategy: mrParsed.resumeStrategy }
        : null;
    }

    // 5. Generate resume markdown
    const content = await generateResumeMarkdown({
      profileName: profile.name,
      profileTitle: profile.title,
      profileSummary: profile.summary,
      profileContact: JSON.parse(profile.contact),
      visibleItems: visibleItemRows.map((row) => ({
        ...JSON.parse(row.data),
        id: row.id,
        profileId: row.profileId,
        visible: row.visible,
        sortOrder: row.sortOrder,
        source: row.source,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
      strategy: { narrative, language, length, jdId, matchResultId },
      parsedJD: parsedJD ?? null,
      matchResult: matchResultData ? { resumeStrategy: matchResultData.resumeStrategy } : null,
    }, clientConfig);

    // 6. Save to DB
    const id = `gr_${nanoid()}`;
    const now = new Date().toISOString();

    const strategy: GenerationStrategy = { narrative, language, length, jdId, matchResultId };

    const inserted = await db
      .insert(generatedResumes)
      .values({
        id,
        profileId: PROFILE_DEFAULT_ID,
        jdId: jdId ?? null,
        matchResultId: matchResultId ?? null,
        strategy: JSON.stringify(strategy),
        content,
        createdAt: now,
      })
      .returning();

    const resume = serializeGeneratedResume(inserted[0]);
    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate resume', details: error instanceof Error ? error.message : String(error) },
      { status: isMissingAIClientConfigError(error) ? 400 : 500 }
    );
  }
}

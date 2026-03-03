export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matchResults, jobDescriptions, items, profiles } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import { runMatchAnalysis } from '@/lib/ai/agents/match-agent';
import type { MatchResult } from '@/lib/types/match';
import type { ParsedJD } from '@/lib/types/jd';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12);

const PROFILE_DEFAULT_ID = 'profile_default';

function serializeMatchResult(row: typeof matchResults.$inferSelect): MatchResult {
  const result = JSON.parse(row.result) as Omit<MatchResult, 'id' | 'profileId' | 'jdId' | 'createdAt'>;
  return {
    ...result,
    id: row.id,
    profileId: row.profileId,
    jdId: row.jdId,
    createdAt: row.createdAt,
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await db
      .select()
      .from(matchResults)
      .orderBy(desc(matchResults.createdAt));

    const results = rows.map((row) => {
      const result = JSON.parse(row.result) as { summary?: string };
      return {
        id: row.id,
        profileId: row.profileId,
        jdId: row.jdId,
        overallScore: row.overallScore,
        summary: result.summary ?? '',
        createdAt: row.createdAt,
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch match results', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as { jdId: string };
    const { jdId } = body;

    if (!jdId || typeof jdId !== 'string') {
      return NextResponse.json({ error: 'Missing required field: jdId' }, { status: 400 });
    }

    // 1. Fetch JD
    const jdRows = await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.id, jdId));

    if (jdRows.length === 0) {
      return NextResponse.json({ error: 'Job description not found' }, { status: 404 });
    }

    const jdRow = jdRows[0];
    const parsedJD: ParsedJD | null = jdRow.parsed ? (JSON.parse(jdRow.parsed) as ParsedJD) : null;

    if (!parsedJD) {
      return NextResponse.json({ error: 'Job description has not been parsed yet' }, { status: 400 });
    }

    // 2. Fetch all visible items for PROFILE_DEFAULT_ID
    const visibleItems = await db
      .select()
      .from(items)
      .where(and(eq(items.profileId, PROFILE_DEFAULT_ID), eq(items.visible, true)));

    // 3. Fetch profile
    const profileRows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, PROFILE_DEFAULT_ID));

    if (profileRows.length === 0) {
      return NextResponse.json({ error: 'Default profile not found' }, { status: 404 });
    }

    const profile = profileRows[0];

    // 4. Build profileSummary string
    const profileSummary = JSON.stringify(
      {
        name: profile.name,
        title: profile.title,
        summary: profile.summary,
        items: visibleItems.map((item) => JSON.parse(item.data)),
      },
      null,
      2
    );

    // 5. Run match analysis
    const analysisResult = await runMatchAnalysis(profileSummary, parsedJD);

    // 6. Save match result
    const id = `mr_${nanoid()}`;
    const now = new Date().toISOString();

    const inserted = await db
      .insert(matchResults)
      .values({
        id,
        profileId: PROFILE_DEFAULT_ID,
        jdId,
        result: JSON.stringify(analysisResult),
        overallScore: analysisResult.scores.overall,
        createdAt: now,
      })
      .returning();

    const result = serializeMatchResult(inserted[0]);
    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to run match analysis', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

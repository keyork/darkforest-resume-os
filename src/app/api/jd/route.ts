export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobDescriptions } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import { parseJDFromText } from '@/lib/ai/agents/jd-parser-agent';
import { getAIClientConfigFromHeaders, isMissingAIClientConfigError } from '@/lib/ai/config';
import type { JobDescription, ParsedJD } from '@/lib/types/jd';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12);

function serializeJD(row: typeof jobDescriptions.$inferSelect): JobDescription {
  return {
    id: row.id,
    rawText: row.rawText,
    parsed: row.parsed ? (JSON.parse(row.parsed) as ParsedJD) : null,
    createdAt: row.createdAt,
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await db
      .select()
      .from(jobDescriptions)
      .orderBy(desc(jobDescriptions.createdAt));

    const jds = rows.map(serializeJD);
    return NextResponse.json({ jds });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch job descriptions', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientConfig = getAIClientConfigFromHeaders(request.headers);
    const body = await request.json() as { text: string };
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing required field: text' }, { status: 400 });
    }

    const parsed = await parseJDFromText(text, clientConfig);

    const id = `jd_${nanoid()}`;
    const now = new Date().toISOString();

    const inserted = await db
      .insert(jobDescriptions)
      .values({
        id,
        rawText: text,
        parsed: JSON.stringify(parsed),
        createdAt: now,
      })
      .returning();

    const jd = serializeJD(inserted[0]);
    return NextResponse.json({ jd }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create job description', details: error instanceof Error ? error.message : String(error) },
      { status: isMissingAIClientConfigError(error) ? 400 : 500 }
    );
  }
}

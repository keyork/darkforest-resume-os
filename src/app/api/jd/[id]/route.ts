export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobDescriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { JobDescription, ParsedJD } from '@/lib/types/jd';

function serializeJD(row: typeof jobDescriptions.$inferSelect): JobDescription {
  return {
    id: row.id,
    rawText: row.rawText,
    parsed: row.parsed ? (JSON.parse(row.parsed) as ParsedJD) : null,
    createdAt: row.createdAt,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    const rows = await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.id, id));

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Job description not found' }, { status: 404 });
    }

    const jd = serializeJD(rows[0]);
    return NextResponse.json({ jd });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch job description', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    const rows = await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.id, id));

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Job description not found' }, { status: 404 });
    }

    await db.delete(jobDescriptions).where(eq(jobDescriptions.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete job description', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatedResumes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { GeneratedResume, GenerationStrategy } from '@/lib/types/resume';

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const rows = await db
      .select()
      .from(generatedResumes)
      .where(eq(generatedResumes.id, id));

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Generated resume not found' }, { status: 404 });
    }

    const resume = serializeGeneratedResume(rows[0]);
    return NextResponse.json({ resume });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch generated resume', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const rows = await db
      .select()
      .from(generatedResumes)
      .where(eq(generatedResumes.id, id));

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Generated resume not found' }, { status: 404 });
    }

    await db.delete(generatedResumes).where(eq(generatedResumes.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete generated resume', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

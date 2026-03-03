export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matchResults } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { MatchResult } from '@/lib/types/match';

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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    const rows = await db
      .select()
      .from(matchResults)
      .where(eq(matchResults.id, id));

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Match result not found' }, { status: 404 });
    }

    const result = serializeMatchResult(rows[0]);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch match result', details: error instanceof Error ? error.message : String(error) },
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
      .from(matchResults)
      .where(eq(matchResults.id, id));

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Match result not found' }, { status: 404 });
    }

    await db.delete(matchResults).where(eq(matchResults.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete match result', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

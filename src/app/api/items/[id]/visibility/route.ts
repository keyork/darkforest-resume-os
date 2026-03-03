export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db, serializeItem } from '@/lib/db';
import { items } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    const rows = await db.select().from(items).where(eq(items.id, id));

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const currentVisible = Boolean(rows[0].visible);

    const updated = await db
      .update(items)
      .set({
        visible: !currentVisible,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(items.id, id))
      .returning();

    const item = serializeItem(updated[0]);
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to toggle item visibility', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

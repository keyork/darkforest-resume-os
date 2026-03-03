export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db, serializeItem } from '@/lib/db';
import { items } from '@/lib/db/schema';
import type { ItemData, ItemSource } from '@/lib/types/item';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;

    const rows = await db.select().from(items).where(eq(items.id, id));

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = serializeItem(rows[0]);
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch item', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = params;
    const body = await request.json() as {
      data?: ItemData;
      visible?: boolean;
      sortOrder?: number;
      source?: ItemSource;
    };

    const updateData: Partial<typeof items.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.data !== undefined) updateData.data = JSON.stringify(body.data);
    if (body.visible !== undefined) updateData.visible = body.visible;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.source !== undefined) updateData.source = body.source;

    const updated = await db
      .update(items)
      .set(updateData)
      .where(eq(items.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = serializeItem(updated[0]);
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update item', details: error instanceof Error ? error.message : error },
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

    const existing = await db.select().from(items).where(eq(items.id, id));

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await db.delete(items).where(eq(items.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete item', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

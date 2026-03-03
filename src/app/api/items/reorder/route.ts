export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { items } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      items: Array<{ id: string; sortOrder: number }>;
    };

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Missing required field: items array' }, { status: 400 });
    }

    const now = new Date().toISOString();

    for (const entry of body.items) {
      await db
        .update(items)
        .set({
          sortOrder: entry.sortOrder,
          updatedAt: now,
        })
        .where(eq(items.id, entry.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reorder items', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

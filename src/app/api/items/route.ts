export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db, serializeItem } from '@/lib/db';
import { items } from '@/lib/db/schema';
import { type ItemType, type ItemData, ITEM_ID_PREFIXES } from '@/lib/types/item';
import { eq, and, sql } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12);

const PROFILE_DEFAULT_ID = 'profile_default';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type') as ItemType | null;
    const visibleParam = searchParams.get('visible');

    const conditions = [eq(items.profileId, PROFILE_DEFAULT_ID)];

    if (typeParam) {
      conditions.push(eq(items.type, typeParam));
    }

    if (visibleParam === 'true') {
      conditions.push(eq(items.visible, true));
    } else if (visibleParam === 'false') {
      conditions.push(eq(items.visible, false));
    }

    const rows = await db
      .select()
      .from(items)
      .where(and(...conditions));

    const result = rows.map(serializeItem);
    return NextResponse.json({ items: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      type: ItemType;
      data: ItemData;
      profileId?: string;
    };

    const { type, data } = body;
    const profileId = body.profileId ?? PROFILE_DEFAULT_ID;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing required fields: type, data' }, { status: 400 });
    }

    // Get count of existing items of the same type for this profile to set sortOrder
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(and(eq(items.profileId, profileId), eq(items.type, type)));

    const sortOrder = Number(countResult[0]?.count ?? 0);

    const id = `${ITEM_ID_PREFIXES[type]}${nanoid()}`;
    const now = new Date().toISOString();

    const inserted = await db
      .insert(items)
      .values({
        id,
        profileId,
        type,
        data: JSON.stringify(data),
        visible: true,
        sortOrder,
        source: 'manual',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const item = serializeItem(inserted[0]);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create item', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db, serializeProfile } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import type { Profile, Contact } from '@/lib/types/profile';
import { eq } from 'drizzle-orm';

const PROFILE_DEFAULT_ID = 'profile_default';

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await db.select().from(profiles).where(eq(profiles.id, PROFILE_DEFAULT_ID));

    if (rows.length > 0) {
      const profile = serializeProfile(rows[0]);
      return NextResponse.json({ profile });
    }

    // Create default profile
    const now = new Date().toISOString();
    const inserted = await db
      .insert(profiles)
      .values({
        id: PROFILE_DEFAULT_ID,
        name: '',
        title: '',
        summary: '',
        contact: '{}',
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const profile = serializeProfile(inserted[0]);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as Partial<Pick<Profile, 'name' | 'title' | 'summary' | 'contact'>>;

    const updateData: Partial<typeof profiles.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.contact !== undefined) updateData.contact = JSON.stringify(body.contact);

    const updated = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, PROFILE_DEFAULT_ID))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = serializeProfile(updated[0]);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}

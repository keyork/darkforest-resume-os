export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { items, profiles } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import { ITEM_ID_PREFIXES } from '@/lib/types/item';
import type { ItemType, ItemData } from '@/lib/types/item';
import type { Contact } from '@/lib/types/profile';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12);

const PROFILE_DEFAULT_ID = 'profile_default';

interface ImportItem {
  type: ItemType;
  data: ItemData;
  selected: boolean;
}

interface ConfirmImportBody {
  mode: 'merge' | 'replace';
  profileData?: {
    name?: string;
    title?: string;
    summary?: string;
    contact?: Contact;
  };
  items: ImportItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmImportBody = await request.json();
    const { mode, profileData, items: importItems } = body;

    const selectedItems = importItems.filter((i) => i.selected);
    const now = new Date().toISOString();

    // Ensure default profile exists
    const existing = db
      .select()
      .from(profiles)
      .where(eq(profiles.id, PROFILE_DEFAULT_ID))
      .get();

    if (!existing) {
      db.insert(profiles)
        .values({
          id: PROFILE_DEFAULT_ID,
          name: profileData?.name ?? '',
          title: profileData?.title ?? '',
          summary: profileData?.summary ?? '',
          contact: JSON.stringify(profileData?.contact ?? {}),
          createdAt: now,
          updatedAt: now,
        })
        .run();
    } else if (profileData) {
      db.update(profiles)
        .set({
          ...(profileData.name !== undefined && { name: profileData.name }),
          ...(profileData.title !== undefined && { title: profileData.title }),
          ...(profileData.summary !== undefined && { summary: profileData.summary }),
          ...(profileData.contact !== undefined && {
            contact: JSON.stringify(profileData.contact),
          }),
          updatedAt: now,
        })
        .where(eq(profiles.id, PROFILE_DEFAULT_ID))
        .run();
    }

    if (mode === 'replace') {
      // Delete all existing items for this profile
      db.delete(items).where(eq(items.profileId, PROFILE_DEFAULT_ID)).run();
    }

    // Insert selected items
    // Get current count per type for sort_order
    const sortOrderMap: Record<string, number> = {};

    for (const importItem of selectedItems) {
      const { type, data } = importItem;
      const prefix = ITEM_ID_PREFIXES[type];
      const id = `${prefix}${nanoid()}`;

      if (sortOrderMap[type] === undefined) {
        // Count existing items of this type
        const countResult = db
          .select()
          .from(items)
          .where(
            and(
              eq(items.profileId, PROFILE_DEFAULT_ID),
              eq(items.type, type)
            )
          )
          .all();
        sortOrderMap[type] = countResult.length;
      }

      const sortOrder = sortOrderMap[type]++;

      // Deduplication check for experience: same company + overlapping dates
      // (just flag via source; actual insert proceeds)
      let isDuplicate = false;
      if (type === 'experience' && mode === 'merge') {
        const expData = data as { company?: string; startDate?: string };
        if (expData.company) {
          const existingExps = db
            .select()
            .from(items)
            .where(
              and(
                eq(items.profileId, PROFILE_DEFAULT_ID),
                eq(items.type, 'experience')
              )
            )
            .all();

          for (const existingExp of existingExps) {
            const parsed = JSON.parse(existingExp.data);
            if (
              parsed.company === expData.company &&
              parsed.startDate === expData.startDate
            ) {
              isDuplicate = true;
              break;
            }
          }
        }
      }

      db.insert(items)
        .values({
          id,
          profileId: PROFILE_DEFAULT_ID,
          type,
          data: JSON.stringify(data),
          visible: true,
          sortOrder,
          source: isDuplicate ? 'ai_parsed' : 'ai_parsed',
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    return NextResponse.json({
      success: true,
      imported: selectedItems.length,
      profileId: PROFILE_DEFAULT_ID,
    });
  } catch (error) {
    console.error('[POST /api/profile/import/confirm]', error);
    return NextResponse.json(
      { error: 'Import failed', details: String(error) },
      { status: 500 }
    );
  }
}

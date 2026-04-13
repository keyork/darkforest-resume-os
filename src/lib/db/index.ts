import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';
import type { Item, ItemData, ItemType } from '@/lib/types/item';
import type { Profile, Contact } from '@/lib/types/profile';

// --- DB Singleton (prevents SQLITE_BUSY on hot reload) ---
const dbFile = process.env.DATABASE_URL?.trim() || './db/resume-agent.db';
const DB_PATH = path.isAbsolute(dbFile) ? dbFile : path.resolve(process.cwd(), dbFile);

// Ensure db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof Database> | undefined;
}

function getDb() {
  if (!global.__db) {
    global.__db = new Database(DB_PATH, { timeout: 10000 });
    try {
      global.__db.pragma('journal_mode = WAL');
      global.__db.pragma('foreign_keys = ON');
    } catch {
      // Ignore pragma errors during build
    }
  }
  return global.__db;
}

export const sqlite = getDb();
export const db = drizzle({ client: sqlite, schema });

// --- Serialize / Deserialize helpers ---

export function serializeItem(raw: typeof schema.items.$inferSelect): Item {
  const data = JSON.parse(raw.data) as ItemData;
  return {
    id: raw.id,
    profileId: raw.profileId,
    visible: Boolean(raw.visible),
    sortOrder: raw.sortOrder,
    source: raw.source,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    ...data,
  } as Item;
}

export function serializeProfile(raw: typeof schema.profiles.$inferSelect): Profile {
  const contact: Contact = JSON.parse(raw.contact || '{}');
  return {
    id: raw.id,
    name: raw.name,
    title: raw.title,
    summary: raw.summary,
    contact,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function extractItemData(item: Partial<Item> & { type: ItemType }): ItemData {
  const { id, profileId, visible, sortOrder, source, createdAt, updatedAt, ...rest } = item as Item & { id?: string; profileId?: string; visible?: boolean; sortOrder?: number; source?: string; createdAt?: string; updatedAt?: string };
  void id; void profileId; void visible; void sortOrder; void source; void createdAt; void updatedAt;
  return rest as ItemData;
}

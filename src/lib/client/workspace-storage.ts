'use client';

import type { GeneratedResume, GenerationStrategy } from '@/lib/types/resume';
import type { JobDescription, ParsedJD } from '@/lib/types/jd';
import type { MatchResult } from '@/lib/types/match';
import type { Item, ItemData, ItemSource, ItemType } from '@/lib/types/item';
import { ITEM_ID_PREFIXES } from '@/lib/types/item';
import type { Contact, Profile } from '@/lib/types/profile';

const WORKSPACE_STORAGE_KEY = 'darkforest.workspace.v1';
const WORKSPACE_CORRUPT_BACKUP_KEY = 'darkforest.workspace.corrupt-backup';
const WORKSPACE_VERSION = 1;

export const PROFILE_DEFAULT_ID = 'profile_default';
export const WORKSPACE_UPDATED_EVENT = 'darkforest:workspace-updated';

export interface WorkspaceSnapshot {
  version: number;
  profile: Profile;
  items: Item[];
  jds: JobDescription[];
  matchResults: MatchResult[];
  generatedResumes: GeneratedResume[];
}

interface ImportWorkspaceInput {
  mode: 'merge' | 'replace';
  profileData?: {
    name?: string;
    title?: string;
    summary?: string;
    contact?: Contact;
  };
  items: Array<{
    type: ItemType;
    data: ItemData;
    selected: boolean;
  }>;
}

interface ImportWorkspaceResult {
  imported: number;
  skippedDuplicates: number;
}

interface UpdateItemInput {
  id: string;
  data?: ItemData | Record<string, unknown>;
  visible?: boolean;
  sortOrder?: number;
  source?: ItemSource;
}

function nowIso() {
  return new Date().toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function createRandomSuffix() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  }

  return Math.random().toString(36).slice(2, 14);
}

function createEntityId(prefix: string) {
  return `${prefix}${createRandomSuffix()}`;
}

function normalizeDedupValue(value: string | undefined) {
  return (value ?? '').trim().toLowerCase();
}

function compareCreatedAtDesc(a: { createdAt: string }, b: { createdAt: string }) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function compareItems(a: Item, b: Item) {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return compareCreatedAtDesc(a, b);
}

function createEmptyProfile(timestamp = nowIso()): Profile {
  return {
    id: PROFILE_DEFAULT_ID,
    name: '',
    title: '',
    summary: '',
    contact: {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createEmptyWorkspace(timestamp = nowIso()): WorkspaceSnapshot {
  return {
    version: WORKSPACE_VERSION,
    profile: createEmptyProfile(timestamp),
    items: [],
    jds: [],
    matchResults: [],
    generatedResumes: [],
  };
}

function normalizeProfile(value: unknown, fallbackTimestamp: string): Profile {
  if (!isRecord(value)) return createEmptyProfile(fallbackTimestamp);

  const createdAt =
    typeof value.createdAt === 'string' && value.createdAt ? value.createdAt : fallbackTimestamp;
  const updatedAt =
    typeof value.updatedAt === 'string' && value.updatedAt ? value.updatedAt : createdAt;

  return {
    id: PROFILE_DEFAULT_ID,
    name: typeof value.name === 'string' ? value.name : '',
    title: typeof value.title === 'string' ? value.title : '',
    summary: typeof value.summary === 'string' ? value.summary : '',
    contact: isRecord(value.contact) ? (value.contact as Contact) : {},
    createdAt,
    updatedAt,
  };
}

function parseWorkspace(raw: string | null): WorkspaceSnapshot | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    const root =
      isRecord(parsed) && isRecord(parsed.data)
        ? parsed.data
        : parsed;

    if (!isRecord(root)) return null;

    const fallbackTimestamp = nowIso();

    return {
      version: WORKSPACE_VERSION,
      profile: normalizeProfile(root.profile, fallbackTimestamp),
      items: Array.isArray(root.items) ? (root.items as Item[]) : [],
      jds: Array.isArray(root.jds) ? (root.jds as JobDescription[]) : [],
      matchResults: Array.isArray(root.matchResults) ? (root.matchResults as MatchResult[]) : [],
      generatedResumes: Array.isArray(root.generatedResumes)
        ? (root.generatedResumes as GeneratedResume[])
        : [],
    };
  } catch {
    return null;
  }
}

function backupCorruptWorkspace(raw: string) {
  const backupPayload = {
    raw,
    backedUpAt: nowIso(),
  };

  window.localStorage.setItem(WORKSPACE_CORRUPT_BACKUP_KEY, JSON.stringify(backupPayload));
}

function readWorkspaceState(): {
  snapshot: WorkspaceSnapshot;
  raw: string | null;
  corrupt: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      snapshot: createEmptyWorkspace(),
      raw: null,
      corrupt: false,
    };
  }

  const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (!raw) {
    return {
      snapshot: createEmptyWorkspace(),
      raw: null,
      corrupt: false,
    };
  }

  const parsed = parseWorkspace(raw);
  if (parsed) {
    return {
      snapshot: parsed,
      raw,
      corrupt: false,
    };
  }

  console.warn('[workspace] Failed to parse local workspace data. Preserving raw storage.');

  return {
    snapshot: createEmptyWorkspace(),
    raw,
    corrupt: true,
  };
}

function persistWorkspace(snapshot: WorkspaceSnapshot) {
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(snapshot));
  window.dispatchEvent(new CustomEvent(WORKSPACE_UPDATED_EVENT));
}

export function getWorkspace(): WorkspaceSnapshot {
  const state = readWorkspaceState();

  if (!state.raw && !state.corrupt && typeof window !== 'undefined') {
    const fresh = createEmptyWorkspace();
    persistWorkspace(fresh);
    return fresh;
  }

  return state.snapshot;
}

function updateWorkspace(
  updater: (current: WorkspaceSnapshot) => WorkspaceSnapshot
): WorkspaceSnapshot {
  const current = readWorkspaceState();
  if (current.corrupt && current.raw) {
    backupCorruptWorkspace(current.raw);
  }

  const next = updater(current.snapshot);
  persistWorkspace(next);
  return next;
}

export function resetWorkspace() {
  const next = createEmptyWorkspace();
  persistWorkspace(next);
  return next;
}

export function getProfile() {
  return getWorkspace().profile;
}

export function updateProfile(
  patch: Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>
) {
  let updatedProfile = getProfile();

  updateWorkspace((workspace) => {
    const nextProfile: Profile = {
      ...workspace.profile,
      ...patch,
      contact: patch.contact ? { ...patch.contact } : workspace.profile.contact,
      updatedAt: nowIso(),
    };

    updatedProfile = nextProfile;
    return {
      ...workspace,
      profile: nextProfile,
    };
  });

  return updatedProfile;
}

export function listItems(filters: { type?: ItemType; visible?: boolean } = {}) {
  return getWorkspace()
    .items
    .filter((item) => {
      if (filters.type && item.type !== filters.type) return false;
      if (filters.visible !== undefined && item.visible !== filters.visible) return false;
      return true;
    })
    .sort(compareItems);
}

export function getItem(id: string) {
  return getWorkspace().items.find((item) => item.id === id);
}

export function createItem(type: ItemType, data: ItemData) {
  const timestamp = nowIso();
  const snapshot = getWorkspace();
  const nextSortOrder =
    snapshot.items
      .filter((item) => item.type === type)
      .reduce((maxOrder, item) => Math.max(maxOrder, item.sortOrder), -1) + 1;

  const item: Item = {
    id: createEntityId(ITEM_ID_PREFIXES[type]),
    profileId: PROFILE_DEFAULT_ID,
    visible: true,
    sortOrder: nextSortOrder,
    source: 'manual',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...data,
    type,
  } as Item;

  updateWorkspace((workspace) => ({
    ...workspace,
    items: [...workspace.items, item],
  }));

  return item;
}

export function updateItem(input: UpdateItemInput) {
  let updatedItem: Item | undefined;

  updateWorkspace((workspace) => ({
    ...workspace,
    items: workspace.items.map((item) => {
      if (item.id !== input.id) return item;

      const nextItem = {
        ...item,
        ...(input.data ?? {}),
        ...(input.visible !== undefined ? { visible: input.visible } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
        ...(input.source !== undefined ? { source: input.source } : {}),
        updatedAt: nowIso(),
      } as Item;

      updatedItem = nextItem;
      return nextItem;
    }),
  }));

  if (!updatedItem) {
    throw new Error(`Item not found: ${input.id}`);
  }

  return updatedItem;
}

export function deleteItem(id: string) {
  updateWorkspace((workspace) => ({
    ...workspace,
    items: workspace.items.filter((item) => item.id !== id),
  }));

  return id;
}

export function toggleItemVisibility(id: string) {
  const current = getItem(id);
  if (!current) {
    throw new Error(`Item not found: ${id}`);
  }

  return updateItem({
    id,
    visible: !current.visible,
  });
}

export function reorderItems(items: Array<{ id: string; sortOrder: number }>) {
  const orderMap = new Map(items.map((item) => [item.id, item.sortOrder]));

  updateWorkspace((workspace) => ({
    ...workspace,
    items: workspace.items.map((item) => {
      const nextOrder = orderMap.get(item.id);
      if (nextOrder === undefined) return item;

      return {
        ...item,
        sortOrder: nextOrder,
        updatedAt: nowIso(),
      };
    }),
  }));
}

export function getItemDeduplicationKey(type: ItemType, data: ItemData | Item): string | null {
  switch (type) {
    case 'skill': {
      const name = normalizeDedupValue('name' in data ? data.name : '');
      return name ? `skill:${name}` : null;
    }
    case 'experience': {
      const company = normalizeDedupValue('company' in data ? data.company : '');
      const title = normalizeDedupValue('title' in data ? data.title : '');
      const startDate = normalizeDedupValue('startDate' in data ? data.startDate : '');
      return company && title && startDate ? ['experience', company, title, startDate].join(':') : null;
    }
    case 'project': {
      const name = normalizeDedupValue('name' in data ? data.name : '');
      const role = normalizeDedupValue('role' in data ? data.role : '');
      return name ? ['project', name, role].join(':') : null;
    }
    case 'education': {
      const school = normalizeDedupValue('school' in data ? data.school : '');
      const degree = normalizeDedupValue('degree' in data ? data.degree : '');
      const major = normalizeDedupValue('major' in data ? data.major : '');
      const startDate = normalizeDedupValue('startDate' in data ? data.startDate : '');
      return school && startDate
        ? ['education', school, degree, major, startDate].join(':')
        : null;
    }
    case 'certification': {
      const name = normalizeDedupValue('name' in data ? data.name : '');
      const issuer = normalizeDedupValue('issuer' in data ? data.issuer : '');
      const issueDate = normalizeDedupValue('issueDate' in data ? data.issueDate : '');
      return name && issuer && issueDate
        ? ['certification', name, issuer, issueDate].join(':')
        : null;
    }
    default:
      return null;
  }
}

export function listJDs() {
  return [...getWorkspace().jds].sort(compareCreatedAtDesc);
}

export function getJD(id: string) {
  return getWorkspace().jds.find((jd) => jd.id === id);
}

export function createJD(rawText: string, parsed: ParsedJD | null) {
  const jd: JobDescription = {
    id: createEntityId('jd_'),
    rawText,
    parsed,
    createdAt: nowIso(),
  };

  updateWorkspace((workspace) => ({
    ...workspace,
    jds: [jd, ...workspace.jds],
  }));

  return jd;
}

export function deleteJD(id: string) {
  updateWorkspace((workspace) => ({
    ...workspace,
    jds: workspace.jds.filter((jd) => jd.id !== id),
    matchResults: workspace.matchResults.filter((result) => result.jdId !== id),
    generatedResumes: workspace.generatedResumes.filter((resume) => resume.jdId !== id),
  }));

  return id;
}

export function listMatchResults() {
  return [...getWorkspace().matchResults].sort(compareCreatedAtDesc);
}

export function getMatchResult(id: string) {
  return getWorkspace().matchResults.find((result) => result.id === id);
}

export function createMatchResult(
  analysis: Omit<MatchResult, 'id' | 'profileId' | 'jdId' | 'createdAt'>,
  jdId: string
) {
  const result: MatchResult = {
    ...analysis,
    id: createEntityId('mr_'),
    profileId: PROFILE_DEFAULT_ID,
    jdId,
    createdAt: nowIso(),
  };

  updateWorkspace((workspace) => ({
    ...workspace,
    matchResults: [result, ...workspace.matchResults],
  }));

  return result;
}

export function deleteMatchResult(id: string) {
  updateWorkspace((workspace) => ({
    ...workspace,
    matchResults: workspace.matchResults.filter((result) => result.id !== id),
    generatedResumes: workspace.generatedResumes.filter((resume) => resume.matchResultId !== id),
  }));

  return id;
}

export function listGeneratedResumes() {
  return [...getWorkspace().generatedResumes].sort(compareCreatedAtDesc);
}

export function getGeneratedResume(id: string) {
  return getWorkspace().generatedResumes.find((resume) => resume.id === id);
}

export function createGeneratedResume(input: {
  strategy: GenerationStrategy;
  content: string;
  jdId?: string;
  matchResultId?: string;
}) {
  const resume: GeneratedResume = {
    id: createEntityId('gr_'),
    profileId: PROFILE_DEFAULT_ID,
    jdId: input.jdId,
    matchResultId: input.matchResultId,
    strategy: input.strategy,
    content: input.content,
    createdAt: nowIso(),
  };

  updateWorkspace((workspace) => ({
    ...workspace,
    generatedResumes: [resume, ...workspace.generatedResumes],
  }));

  return resume;
}

export function deleteGeneratedResume(id: string) {
  updateWorkspace((workspace) => ({
    ...workspace,
    generatedResumes: workspace.generatedResumes.filter((resume) => resume.id !== id),
  }));

  return id;
}

export function importParsedProfile(input: ImportWorkspaceInput): ImportWorkspaceResult {
  const selectedItems = input.items.filter((item) => item.selected);
  let importedCount = 0;
  let skippedDuplicates = 0;

  updateWorkspace((workspace) => {
    const timestamp = nowIso();
    const baseProfile =
      input.mode === 'replace'
        ? {
            ...createEmptyProfile(workspace.profile.createdAt),
            updatedAt: timestamp,
          }
        : workspace.profile;

    const nextProfile: Profile = {
      ...baseProfile,
      ...(input.profileData ?? {}),
      contact: input.profileData?.contact ? { ...input.profileData.contact } : baseProfile.contact,
      updatedAt: timestamp,
    };

    const nextItems = input.mode === 'replace' ? [] : [...workspace.items];
    const sortOrderByType = new Map<ItemType, number>();
    const deduplicationKeys = new Set<string>();

    for (const existing of nextItems) {
      const currentMax = sortOrderByType.get(existing.type) ?? -1;
      sortOrderByType.set(existing.type, Math.max(currentMax, existing.sortOrder));

      const dedupKey = getItemDeduplicationKey(existing.type, existing);
      if (dedupKey) {
        deduplicationKeys.add(dedupKey);
      }
    }

    for (const entry of selectedItems) {
      const dedupKey = getItemDeduplicationKey(entry.type, entry.data);
      if (dedupKey && deduplicationKeys.has(dedupKey)) {
        skippedDuplicates += 1;
        continue;
      }

      const nextOrder = (sortOrderByType.get(entry.type) ?? -1) + 1;
      sortOrderByType.set(entry.type, nextOrder);

      nextItems.push({
        id: createEntityId(ITEM_ID_PREFIXES[entry.type]),
        profileId: PROFILE_DEFAULT_ID,
        visible: true,
        sortOrder: nextOrder,
        source: 'ai_parsed',
        createdAt: timestamp,
        updatedAt: timestamp,
        ...entry.data,
        type: entry.type,
      } as Item);

      if (dedupKey) {
        deduplicationKeys.add(dedupKey);
      }

      importedCount += 1;
    }

    return {
      ...workspace,
      profile: nextProfile,
      items: nextItems,
      matchResults: input.mode === 'replace' ? [] : workspace.matchResults,
      generatedResumes: input.mode === 'replace' ? [] : workspace.generatedResumes,
    };
  });

  return {
    imported: importedCount,
    skippedDuplicates,
  };
}

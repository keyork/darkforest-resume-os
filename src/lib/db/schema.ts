import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().default(''),
  title: text('title').notNull().default(''),
  summary: text('summary').notNull().default(''),
  contact: text('contact').notNull().default('{}'), // JSON: Contact
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['skill', 'experience', 'project', 'education', 'certification'] }).notNull(),
  data: text('data').notNull().default('{}'), // JSON: ItemData
  visible: integer('visible', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  source: text('source', { enum: ['manual', 'ai_parsed', 'ai_confirmed'] }).notNull().default('manual'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const jobDescriptions = sqliteTable('job_descriptions', {
  id: text('id').primaryKey(),
  rawText: text('raw_text').notNull(),
  parsed: text('parsed'), // JSON: ParsedJD | null
  createdAt: text('created_at').notNull(),
});

export const matchResults = sqliteTable('match_results', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id),
  jdId: text('jd_id').notNull().references(() => jobDescriptions.id),
  result: text('result').notNull().default('{}'), // JSON: MatchResult
  overallScore: real('overall_score').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const generatedResumes = sqliteTable('generated_resumes', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id),
  jdId: text('jd_id'),
  matchResultId: text('match_result_id'),
  strategy: text('strategy').notNull().default('{}'), // JSON: GenerationStrategy
  content: text('content').notNull().default(''),
  createdAt: text('created_at').notNull(),
});

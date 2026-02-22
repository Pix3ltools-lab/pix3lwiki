import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/middleware';
import { getTursoClient } from '@/lib/db/turso';
import type { InStatement } from '@libsql/client';

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  sort_order: z.number().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

const pageSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  category_id: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
  status: z.string(),
  author_id: z.string(),
  version: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

const versionSchema = z.object({
  id: z.string(),
  page_id: z.string(),
  title: z.string(),
  content: z.string(),
  version: z.number(),
  author_id: z.string(),
  change_summary: z.string().nullable().optional(),
  created_at: z.string(),
});

const linkSchema = z.object({
  id: z.string(),
  wiki_page_id: z.string(),
  board_id: z.string().nullable().optional(),
  card_id: z.string().nullable().optional(),
  workspace_id: z.string().nullable().optional(),
  link_type: z.string(),
  created_at: z.string(),
});

const backupSchema = z.object({
  confirm: z.literal('DELETE ALL DATA', {
    errorMap: () => ({ message: 'Include confirm: "DELETE ALL DATA" in the request body to proceed' }),
  }),
  exported_at: z.string(),
  pages: z.array(pageSchema),
  categories: z.array(categorySchema),
  versions: z.array(versionSchema),
  links: z.array(linkSchema),
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = backupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid backup format', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { categories, pages, versions, links } = parsed.data;

  const statements: InStatement[] = [];

  // Delete in reverse FK order
  statements.push({ sql: 'DELETE FROM pix3lboard_links', args: [] });
  statements.push({ sql: 'DELETE FROM wiki_versions', args: [] });
  statements.push({ sql: 'DELETE FROM wiki_pages', args: [] });
  statements.push({ sql: 'DELETE FROM wiki_categories', args: [] });

  // Insert categories
  for (const c of categories) {
    statements.push({
      sql: `INSERT INTO wiki_categories (id, name, slug, description, color, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [c.id, c.name, c.slug, c.description ?? null, c.color ?? '#8b5cf6', c.sort_order ?? 0, c.created_at, c.updated_at],
    });
  }

  // Insert pages
  for (const p of pages) {
    statements.push({
      sql: `INSERT INTO wiki_pages (id, title, slug, content, category_id, tags, status, author_id, version, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.id, p.title, p.slug, p.content, p.category_id ?? null, p.tags ?? '[]', p.status, p.author_id, p.version, p.created_at, p.updated_at],
    });
  }

  // Insert versions
  for (const v of versions) {
    statements.push({
      sql: `INSERT INTO wiki_versions (id, page_id, title, content, version, author_id, change_summary, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [v.id, v.page_id, v.title, v.content, v.version, v.author_id, v.change_summary ?? null, v.created_at],
    });
  }

  // Insert links
  for (const l of links) {
    statements.push({
      sql: `INSERT INTO pix3lboard_links (id, wiki_page_id, board_id, card_id, workspace_id, link_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [l.id, l.wiki_page_id, l.board_id ?? null, l.card_id ?? null, l.workspace_id ?? null, l.link_type, l.created_at],
    });
  }

  try {
    const db = getTursoClient();
    await db.batch(statements);
  } catch (err) {
    console.error('[AUDIT] Restore FAILED by user', auth.user.id, 'at', new Date().toISOString(), '-', err);
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }

  console.log(
    '[AUDIT] Restore completed by user', auth.user.id,
    'at', new Date().toISOString(),
    '| pages:', pages.length,
    '| categories:', categories.length
  );

  return NextResponse.json({
    success: true,
    counts: {
      categories: categories.length,
      pages: pages.length,
      versions: versions.length,
      links: links.length,
    },
  });
}

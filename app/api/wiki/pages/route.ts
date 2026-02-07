import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db/turso';
import { requireAuth } from '@/lib/auth/middleware';
import { createPageSchema } from '@/lib/validation/schemas';
import { generateId } from '@/lib/utils/id';
import { slugify } from '@/lib/utils/slug';
import { WikiPageRow, WikiPageWithAuthor } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('category_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT wp.*, u.name as author_name, u.email as author_email,
             wc.name as category_name, wc.color as category_color
      FROM wiki_pages wp
      JOIN users u ON wp.author_id = u.id
      LEFT JOIN wiki_categories wc ON wp.category_id = wc.id
      WHERE 1=1
    `;
    const args: Record<string, unknown> = {};

    if (status) {
      sql += ' AND wp.status = :status';
      args.status = status;
    }
    if (categoryId) {
      sql += ' AND wp.category_id = :categoryId';
      args.categoryId = categoryId;
    }

    sql += ' ORDER BY wp.updated_at DESC LIMIT :limit OFFSET :offset';
    args.limit = limit;
    args.offset = offset;

    const rows = await query<WikiPageRow & { author_name: string | null; author_email: string; category_name: string | null; category_color: string | null }>(sql, args);

    const pages: WikiPageWithAuthor[] = rows.map(row => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      content: row.content,
      category_id: row.category_id,
      tags: JSON.parse(row.tags || '[]'),
      status: row.status as 'draft' | 'published' | 'archived',
      author_id: row.author_id,
      version: row.version,
      created_at: row.created_at,
      updated_at: row.updated_at,
      author_name: row.author_name,
      author_email: row.author_email,
      category_name: row.category_name,
      category_color: row.category_color,
    }));

    return NextResponse.json({ pages });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const parsed = createPageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, content, category_id, tags, status } = parsed.data;
    const id = generateId();
    let slug = slugify(title);

    // Ensure unique slug
    const existing = await query('SELECT id FROM wiki_pages WHERE slug = :slug', { slug });
    if (existing.length > 0) {
      slug = `${slug}-${generateId(6)}`;
    }

    const now = new Date().toISOString();

    await execute(
      `INSERT INTO wiki_pages (id, title, slug, content, category_id, tags, status, author_id, version, created_at, updated_at)
       VALUES (:id, :title, :slug, :content, :categoryId, :tags, :status, :authorId, 1, :now, :now)`,
      {
        id,
        title,
        slug,
        content: content || '',
        categoryId: category_id || null,
        tags: JSON.stringify(tags || []),
        status: status || 'draft',
        authorId: auth.user.id,
        now,
      }
    );

    // Create initial version
    const versionId = generateId();
    await execute(
      `INSERT INTO wiki_versions (id, page_id, title, content, version, author_id, change_summary, created_at)
       VALUES (:id, :pageId, :title, :content, 1, :authorId, :summary, :now)`,
      {
        id: versionId,
        pageId: id,
        title,
        content: content || '',
        authorId: auth.user.id,
        summary: 'Initial version',
        now,
      }
    );

    return NextResponse.json({ page: { id, title, slug, status } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

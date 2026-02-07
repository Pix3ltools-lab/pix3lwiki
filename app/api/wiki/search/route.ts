import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/turso';
import { requireAuth } from '@/lib/auth/middleware';
import { WikiPageRow, WikiPageWithAuthor } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status') || 'published';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!q) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const searchTerm = `%${q}%`;

    let sql = `
      SELECT wp.*, u.name as author_name, u.email as author_email,
             wc.name as category_name, wc.color as category_color
      FROM wiki_pages wp
      JOIN users u ON wp.author_id = u.id
      LEFT JOIN wiki_categories wc ON wp.category_id = wc.id
      WHERE (wp.title LIKE :searchTerm OR wp.content LIKE :searchTerm)
    `;
    const args: Record<string, unknown> = { searchTerm };

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

    return NextResponse.json({ pages, query: q });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

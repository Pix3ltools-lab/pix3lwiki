import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db/turso';
import { requireAuth } from '@/lib/auth/middleware';
import { WikiPageRow, WikiPageWithAuthor } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const row = await queryOne<WikiPageRow & { author_name: string | null; author_email: string; category_name: string | null; category_color: string | null }>(
      `SELECT wp.*, u.name as author_name, u.email as author_email,
              wc.name as category_name, wc.color as category_color
       FROM wiki_pages wp
       JOIN users u ON wp.author_id = u.id
       LEFT JOIN wiki_categories wc ON wp.category_id = wc.id
       WHERE wp.slug = :slug`,
      { slug: params.slug }
    );

    if (!row) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const page: WikiPageWithAuthor = {
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
    };

    return NextResponse.json({ page });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

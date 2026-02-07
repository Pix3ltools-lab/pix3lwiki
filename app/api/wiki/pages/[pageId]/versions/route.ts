import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/turso';
import { requireAuth } from '@/lib/auth/middleware';
import { WikiVersionWithAuthor } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Verify page exists
    const page = await queryOne<{ id: string }>(
      'SELECT id FROM wiki_pages WHERE id = :pageId',
      { pageId: params.pageId }
    );

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const rows = await query<WikiVersionWithAuthor>(
      `SELECT wv.*, u.name as author_name, u.email as author_email
       FROM wiki_versions wv
       JOIN users u ON wv.author_id = u.id
       WHERE wv.page_id = :pageId
       ORDER BY wv.version DESC`,
      { pageId: params.pageId }
    );

    return NextResponse.json({ versions: rows });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

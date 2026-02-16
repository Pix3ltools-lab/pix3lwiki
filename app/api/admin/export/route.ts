import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { query } from '@/lib/db/turso';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [pages, categories, versions, links] = await Promise.all([
    query('SELECT * FROM wiki_pages ORDER BY updated_at DESC'),
    query('SELECT * FROM wiki_categories ORDER BY sort_order, name'),
    query('SELECT * FROM wiki_versions ORDER BY created_at DESC'),
    query('SELECT * FROM pix3lboard_links ORDER BY created_at DESC'),
  ]);

  const exported_at = new Date().toISOString();
  const date = exported_at.slice(0, 10);

  const data = { exported_at, pages, categories, versions, links };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="pix3lwiki-export-${date}.json"`,
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';
import { query } from '@/lib/db/turso';
import JSZip from 'jszip';

interface WikiPage {
  slug: string;
  title: string;
  content: string;
  status: string;
  category_id: string | null;
  tags: string;
  created_at: string;
  updated_at: string;
}

interface WikiCategory {
  id: string;
  name: string;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [pages, categories] = await Promise.all([
    query<WikiPage>('SELECT slug, title, content, status, category_id, tags, created_at, updated_at FROM wiki_pages ORDER BY title'),
    query<WikiCategory>('SELECT id, name FROM wiki_categories'),
  ]);

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  const zip = new JSZip();

  for (const page of pages) {
    let tags: string[] = [];
    try {
      tags = JSON.parse(page.tags || '[]');
    } catch {
      // ignore malformed tags
    }

    const categoryName = page.category_id ? categoryMap.get(page.category_id) || '' : '';

    const frontmatter = [
      '---',
      `title: "${page.title.replace(/"/g, '\\"')}"`,
      `status: ${page.status}`,
      ...(categoryName ? [`category: "${categoryName.replace(/"/g, '\\"')}"`] : []),
      ...(tags.length > 0 ? [`tags: ${JSON.stringify(tags)}`] : []),
      `created_at: "${page.created_at}"`,
      `updated_at: "${page.updated_at}"`,
      '---',
    ].join('\n');

    zip.file(`${page.slug}.md`, `${frontmatter}\n\n${page.content}`);
  }

  const arrayBuffer = await zip.generateAsync({ type: 'arraybuffer' });
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="pix3lwiki-markdown-${date}.zip"`,
    },
  });
}

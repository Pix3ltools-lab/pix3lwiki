import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db/turso';
import { requireAuth } from '@/lib/auth/middleware';
import { createCategorySchema } from '@/lib/validation/schemas';
import { generateId } from '@/lib/utils/id';
import { slugify } from '@/lib/utils/slug';
import { WikiCategory } from '@/types';

export async function GET() {
  try {
    const rows = await query<WikiCategory & { page_count: number }>(
      `SELECT wc.*, COUNT(wp.id) as page_count
       FROM wiki_categories wc
       LEFT JOIN wiki_pages wp ON wp.category_id = wc.id AND wp.status = 'published'
       GROUP BY wc.id
       ORDER BY wc.sort_order ASC, wc.name ASC`
    );

    const categories = rows.map(row => ({
      ...row,
      page_count: Number(row.page_count),
    }));

    return NextResponse.json({ categories });
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
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, description, color, sort_order } = parsed.data;
    const id = generateId();
    let slug = slugify(name);

    const existing = await query('SELECT id FROM wiki_categories WHERE slug = :slug', { slug });
    if (existing.length > 0) {
      slug = `${slug}-${generateId(6)}`;
    }

    const now = new Date().toISOString();

    await execute(
      `INSERT INTO wiki_categories (id, name, slug, description, color, sort_order, created_at, updated_at)
       VALUES (:id, :name, :slug, :description, :color, :sortOrder, :now, :now)`,
      {
        id,
        name,
        slug,
        description: description || null,
        color,
        sortOrder: sort_order,
        now,
      }
    );

    return NextResponse.json({ category: { id, name, slug, color } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

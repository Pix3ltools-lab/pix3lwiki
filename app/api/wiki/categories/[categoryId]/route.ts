import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db/turso';
import { requireAuth } from '@/lib/auth/middleware';
import { updateCategorySchema } from '@/lib/validation/schemas';
import { WikiCategory } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const category = await queryOne<WikiCategory>(
      'SELECT * FROM wiki_categories WHERE id = :id',
      { id: params.categoryId }
    );

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const existing = await queryOne<WikiCategory>(
      'SELECT * FROM wiki_categories WHERE id = :id',
      { id: params.categoryId }
    );

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updates = parsed.data;
    const now = new Date().toISOString();
    const fields: string[] = ['updated_at = :now'];
    const args: Record<string, unknown> = { id: params.categoryId, now };

    if (updates.name !== undefined) {
      fields.push('name = :name');
      args.name = updates.name;
    }
    if (updates.description !== undefined) {
      fields.push('description = :description');
      args.description = updates.description;
    }
    if (updates.color !== undefined) {
      fields.push('color = :color');
      args.color = updates.color;
    }
    if (updates.sort_order !== undefined) {
      fields.push('sort_order = :sortOrder');
      args.sortOrder = updates.sort_order;
    }

    await execute(
      `UPDATE wiki_categories SET ${fields.join(', ')} WHERE id = :id`,
      args
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!auth.user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM wiki_categories WHERE id = :id',
      { id: params.categoryId }
    );

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await execute('DELETE FROM wiki_categories WHERE id = :id', { id: params.categoryId });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

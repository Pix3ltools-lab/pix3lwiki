import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db/turso';
import { requireAuth } from '@/lib/auth/middleware';
import { updatePageSchema } from '@/lib/validation/schemas';
import { generateId } from '@/lib/utils/id';
import { WikiPageRow, WikiPageWithAuthor } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
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
       WHERE wp.id = :pageId`,
      { pageId: params.pageId }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const existing = await queryOne<WikiPageRow>(
      'SELECT * FROM wiki_pages WHERE id = :pageId',
      { pageId: params.pageId }
    );

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updatePageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updates = parsed.data;
    const now = new Date().toISOString();
    const newVersion = existing.version + 1;

    // Build update query
    const fields: string[] = ['version = :version', 'updated_at = :now'];
    const args: Record<string, unknown> = {
      pageId: params.pageId,
      version: newVersion,
      now,
    };

    if (updates.title !== undefined) {
      fields.push('title = :title');
      args.title = updates.title;
    }
    if (updates.content !== undefined) {
      fields.push('content = :content');
      args.content = updates.content;
    }
    if (updates.category_id !== undefined) {
      fields.push('category_id = :categoryId');
      args.categoryId = updates.category_id;
    }
    if (updates.tags !== undefined) {
      fields.push('tags = :tags');
      args.tags = JSON.stringify(updates.tags);
    }
    if (updates.status !== undefined) {
      fields.push('status = :status');
      args.status = updates.status;
    }

    await execute(
      `UPDATE wiki_pages SET ${fields.join(', ')} WHERE id = :pageId`,
      args
    );

    // Create version record
    const versionId = generateId();
    await execute(
      `INSERT INTO wiki_versions (id, page_id, title, content, version, author_id, change_summary, created_at)
       VALUES (:id, :pageId, :title, :content, :version, :authorId, :summary, :now)`,
      {
        id: versionId,
        pageId: params.pageId,
        title: updates.title || existing.title,
        content: updates.content !== undefined ? updates.content : existing.content,
        version: newVersion,
        authorId: auth.user.id,
        summary: updates.change_summary || null,
        now,
      }
    );

    return NextResponse.json({ success: true, version: newVersion });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const existing = await queryOne<{ id: string; author_id: string }>(
      'SELECT id, author_id FROM wiki_pages WHERE id = :pageId',
      { pageId: params.pageId }
    );

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Only author or admin can delete
    if (existing.author_id !== auth.user.id && !auth.user.is_admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await execute('DELETE FROM wiki_pages WHERE id = :pageId', { pageId: params.pageId });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

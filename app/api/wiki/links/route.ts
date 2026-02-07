import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db/turso';
import { requireAuth } from '@/lib/auth/middleware';
import { createLinkSchema } from '@/lib/validation/schemas';
import { generateId } from '@/lib/utils/id';

export const dynamic = 'force-dynamic';
import { Pix3lBoardLink } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const wikiPageId = searchParams.get('wiki_page_id');
    const boardId = searchParams.get('board_id');
    const cardId = searchParams.get('card_id');

    let sql = 'SELECT * FROM pix3lboard_links WHERE 1=1';
    const args: Record<string, unknown> = {};

    if (wikiPageId) {
      sql += ' AND wiki_page_id = :wikiPageId';
      args.wikiPageId = wikiPageId;
    }
    if (boardId) {
      sql += ' AND board_id = :boardId';
      args.boardId = boardId;
    }
    if (cardId) {
      sql += ' AND card_id = :cardId';
      args.cardId = cardId;
    }

    sql += ' ORDER BY created_at DESC';

    const links = await query<Pix3lBoardLink>(sql, args);
    return NextResponse.json({ links });
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
    const parsed = createLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { wiki_page_id, board_id, card_id, workspace_id, link_type } = parsed.data;
    const id = generateId();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO pix3lboard_links (id, wiki_page_id, board_id, card_id, workspace_id, link_type, created_at)
       VALUES (:id, :wikiPageId, :boardId, :cardId, :workspaceId, :linkType, :now)`,
      {
        id,
        wikiPageId: wiki_page_id,
        boardId: board_id || null,
        cardId: card_id || null,
        workspaceId: workspace_id || null,
        linkType: link_type,
        now,
      }
    );

    return NextResponse.json({ link: { id, wiki_page_id, link_type } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

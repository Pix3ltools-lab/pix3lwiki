export interface WikiPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  category_id: string | null;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author_id: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface WikiPageRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  category_id: string | null;
  tags: string;
  status: string;
  author_id: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface WikiPageWithAuthor extends WikiPage {
  author_name: string | null;
  author_email: string;
  category_name?: string | null;
  category_color?: string | null;
}

export interface WikiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WikiVersion {
  id: string;
  page_id: string;
  title: string;
  content: string;
  version: number;
  author_id: string;
  change_summary: string | null;
  created_at: string;
}

export interface WikiVersionWithAuthor extends WikiVersion {
  author_name: string | null;
  author_email: string;
}

export interface Pix3lBoardLink {
  id: string;
  wiki_page_id: string;
  board_id: string | null;
  card_id: string | null;
  workspace_id: string | null;
  link_type: 'reference' | 'documentation' | 'notes';
  created_at: string;
}

export interface WikiContext {
  boardId?: string;
  cardId?: string;
  workspaceId?: string;
}

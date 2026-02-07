import { config } from 'dotenv';
config();

import { getTursoClient } from './turso';

async function setup() {
  const db = getTursoClient();

  console.log('Creating wiki tables...');

  // Wiki categories
  await db.execute(`
    CREATE TABLE IF NOT EXISTS wiki_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      color TEXT DEFAULT '#8b5cf6',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  console.log('  wiki_categories table ready');

  // Wiki pages
  await db.execute(`
    CREATE TABLE IF NOT EXISTS wiki_pages (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL DEFAULT '',
      category_id TEXT,
      tags TEXT DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'draft',
      author_id TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES wiki_categories(id) ON DELETE SET NULL,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('  wiki_pages table ready');

  // Wiki versions (history)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS wiki_versions (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      version INTEGER NOT NULL,
      author_id TEXT NOT NULL,
      change_summary TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (page_id) REFERENCES wiki_pages(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('  wiki_versions table ready');

  // Pix3lBoard links (cross-app references)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pix3lboard_links (
      id TEXT PRIMARY KEY,
      wiki_page_id TEXT NOT NULL,
      board_id TEXT,
      card_id TEXT,
      workspace_id TEXT,
      link_type TEXT NOT NULL DEFAULT 'reference',
      created_at TEXT NOT NULL,
      FOREIGN KEY (wiki_page_id) REFERENCES wiki_pages(id) ON DELETE CASCADE
    )
  `);
  console.log('  pix3lboard_links table ready');

  // Indexes
  await db.execute('CREATE INDEX IF NOT EXISTS idx_wiki_pages_slug ON wiki_pages(slug)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_wiki_pages_category ON wiki_pages(category_id)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_wiki_pages_author ON wiki_pages(author_id)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_wiki_pages_status ON wiki_pages(status)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_wiki_versions_page ON wiki_versions(page_id)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_pix3lboard_links_page ON pix3lboard_links(wiki_page_id)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_pix3lboard_links_board ON pix3lboard_links(board_id)');
  await db.execute('CREATE INDEX IF NOT EXISTS idx_pix3lboard_links_card ON pix3lboard_links(card_id)');
  console.log('  indexes created');

  console.log('Wiki database setup complete!');
}

setup().catch(console.error);

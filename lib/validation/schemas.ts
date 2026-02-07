import { z } from 'zod';

export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().default(''),
  category_id: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const updatePageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().optional(),
  category_id: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  change_summary: z.string().max(500).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format').default('#8b5cf6'),
  sort_order: z.number().int().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  sort_order: z.number().int().optional(),
});

export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  category_id: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createLinkSchema = z.object({
  wiki_page_id: z.string().min(1),
  board_id: z.string().nullable().optional(),
  card_id: z.string().nullable().optional(),
  workspace_id: z.string().nullable().optional(),
  link_type: z.enum(['reference', 'documentation', 'notes']).default('reference'),
});

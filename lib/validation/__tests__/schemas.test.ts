import { describe, test, expect } from 'vitest';
import {
  createPageSchema,
  updatePageSchema,
  createCategorySchema,
  searchSchema,
  createLinkSchema,
} from '../schemas';

describe('createPageSchema', () => {
  test('accepts valid input with all fields', () => {
    const result = createPageSchema.safeParse({
      title: 'My Page',
      content: '# Hello',
      category_id: 'cat-123',
      tags: ['tag1', 'tag2'],
      status: 'published',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('My Page');
      expect(result.data.status).toBe('published');
    }
  });

  test('accepts minimal input (title only)', () => {
    const result = createPageSchema.safeParse({ title: 'Minimal' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('');
      expect(result.data.tags).toEqual([]);
      expect(result.data.status).toBe('draft');
    }
  });

  test('rejects empty title', () => {
    const result = createPageSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  test('rejects title over 200 characters', () => {
    const result = createPageSchema.safeParse({ title: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  test('rejects invalid status', () => {
    const result = createPageSchema.safeParse({
      title: 'Test',
      status: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  test('allows null category_id', () => {
    const result = createPageSchema.safeParse({
      title: 'Test',
      category_id: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('updatePageSchema', () => {
  test('accepts partial update (title only)', () => {
    const result = updatePageSchema.safeParse({ title: 'New Title' });
    expect(result.success).toBe(true);
  });

  test('accepts empty object (no fields to update)', () => {
    const result = updatePageSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  test('accepts change_summary', () => {
    const result = updatePageSchema.safeParse({
      content: 'Updated content',
      change_summary: 'Fixed typo',
    });
    expect(result.success).toBe(true);
  });

  test('rejects change_summary over 500 chars', () => {
    const result = updatePageSchema.safeParse({
      change_summary: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  test('rejects empty title when provided', () => {
    const result = updatePageSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });
});

describe('createCategorySchema', () => {
  test('accepts valid category', () => {
    const result = createCategorySchema.safeParse({
      name: 'Engineering',
      description: 'Tech docs',
      color: '#ff5500',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sort_order).toBe(0);
    }
  });

  test('accepts minimal input (name only)', () => {
    const result = createCategorySchema.safeParse({ name: 'Docs' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBe('#8b5cf6');
    }
  });

  test('rejects empty name', () => {
    const result = createCategorySchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  test('rejects name over 100 characters', () => {
    const result = createCategorySchema.safeParse({ name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  test('rejects invalid color format', () => {
    const result = createCategorySchema.safeParse({
      name: 'Test',
      color: 'red',
    });
    expect(result.success).toBe(false);
  });

  test('rejects 3-digit hex color', () => {
    const result = createCategorySchema.safeParse({
      name: 'Test',
      color: '#f00',
    });
    expect(result.success).toBe(false);
  });

  test('accepts 6-digit hex color', () => {
    const result = createCategorySchema.safeParse({
      name: 'Test',
      color: '#aaBBcc',
    });
    expect(result.success).toBe(true);
  });
});

describe('searchSchema', () => {
  test('accepts valid search query', () => {
    const result = searchSchema.safeParse({ q: 'hello' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
      expect(result.data.offset).toBe(0);
    }
  });

  test('rejects empty query', () => {
    const result = searchSchema.safeParse({ q: '' });
    expect(result.success).toBe(false);
  });

  test('accepts optional filters', () => {
    const result = searchSchema.safeParse({
      q: 'test',
      category_id: 'cat-1',
      status: 'published',
      limit: '10',
      offset: '5',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(10);
      expect(result.data.offset).toBe(5);
    }
  });

  test('coerces string limit/offset to numbers', () => {
    const result = searchSchema.safeParse({
      q: 'test',
      limit: '50',
      offset: '10',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
      expect(result.data.offset).toBe(10);
    }
  });

  test('rejects limit over 100', () => {
    const result = searchSchema.safeParse({ q: 'test', limit: '101' });
    expect(result.success).toBe(false);
  });
});

describe('createLinkSchema', () => {
  test('accepts valid link', () => {
    const result = createLinkSchema.safeParse({
      wiki_page_id: 'page-123',
      board_id: 'board-456',
      link_type: 'documentation',
    });
    expect(result.success).toBe(true);
  });

  test('requires wiki_page_id', () => {
    const result = createLinkSchema.safeParse({
      board_id: 'board-456',
    });
    expect(result.success).toBe(false);
  });

  test('rejects empty wiki_page_id', () => {
    const result = createLinkSchema.safeParse({
      wiki_page_id: '',
    });
    expect(result.success).toBe(false);
  });

  test('defaults link_type to reference', () => {
    const result = createLinkSchema.safeParse({
      wiki_page_id: 'page-123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.link_type).toBe('reference');
    }
  });

  test('rejects invalid link_type', () => {
    const result = createLinkSchema.safeParse({
      wiki_page_id: 'page-123',
      link_type: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});

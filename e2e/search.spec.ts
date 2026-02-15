import { test, expect } from '@playwright/test';
import { createPage, uniqueName } from './fixtures';

test.describe('Search', () => {
  test('search by title', async ({ page }) => {
    const title = uniqueName('E2E Searchable');
    await createPage(page, title, 'Content for search test', { status: 'published' });

    // Navigate to search page
    await page.goto('/wiki/search');
    await expect(page.locator('text=Search Wiki')).toBeVisible({ timeout: 10000 });

    // Type search query
    await page.fill('input[placeholder="Search pages..."]', title);

    // Wait for results (debounced)
    await expect(page.locator(`text=${title}`)).toBeVisible({ timeout: 10000 });
  });

  test('search by content', async ({ page }) => {
    const title = uniqueName('E2E ContentSearch');
    const uniqueContent = `UniquePhrase${Date.now()}`;
    await createPage(page, title, uniqueContent, { status: 'published' });

    // Navigate to search page
    await page.goto('/wiki/search');
    await expect(page.locator('text=Search Wiki')).toBeVisible({ timeout: 10000 });

    // Search by the unique content phrase
    await page.fill('input[placeholder="Search pages..."]', uniqueContent);

    // Should find the page by content match
    await expect(page.locator(`text=${title}`)).toBeVisible({ timeout: 10000 });
  });
});

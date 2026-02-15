import { Page, expect } from '@playwright/test';

/**
 * Login via the UI form.
 */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[placeholder="you@example.com"]', email);
  await page.fill('input[placeholder="Your password"]', password);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('/wiki', { timeout: 15000 });
}

/**
 * Create a wiki page via the UI.
 * Returns the slug from the redirect URL.
 */
export async function createPage(
  page: Page,
  title: string,
  content: string,
  options: { status?: 'draft' | 'published' } = {}
) {
  await page.goto('/wiki/new');
  await expect(page.locator('text=Create New Page')).toBeVisible({ timeout: 10000 });

  // Fill title
  await page.fill('input[placeholder="Page title"]', title);

  // Fill content
  await page.fill('textarea[data-editor]', content);

  // Set status if specified
  if (options.status) {
    await page.selectOption('select:below(:text("Status"))', options.status);
  }

  // Click Create Page
  await page.click('button:has-text("Create Page")');

  // Wait for redirect to the new page
  await page.waitForURL(/\/wiki\//, { timeout: 10000 });

  // Return the slug from the URL
  const url = new URL(page.url());
  const pathParts = url.pathname.split('/');
  return pathParts[pathParts.length - 1];
}

/**
 * Navigate to a wiki page by its slug.
 */
export async function navigateToPage(page: Page, slug: string) {
  await page.goto(`/wiki/${slug}`);
  await expect(page.locator('article')).toBeVisible({ timeout: 10000 });
}

/**
 * Generate a unique name with a timestamp suffix to avoid collisions.
 */
export function uniqueName(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

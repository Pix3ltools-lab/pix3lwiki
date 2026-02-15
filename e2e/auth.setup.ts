import { test as setup, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_USER_EMAIL!;
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD!;

setup('authenticate', async ({ page }) => {
  if (!E2E_EMAIL || !E2E_PASSWORD) {
    throw new Error(
      'Missing E2E_USER_EMAIL or E2E_USER_PASSWORD env vars. ' +
      'Set them before running tests.'
    );
  }

  await page.goto('/auth/login');

  // Fill credentials
  await page.fill('input[placeholder="you@example.com"]', E2E_EMAIL);
  await page.fill('input[placeholder="Your password"]', E2E_PASSWORD);

  // Submit
  await page.click('button:has-text("Sign in")');

  // Wait for redirect to /wiki
  await expect(page).toHaveURL('/wiki', { timeout: 15000 });

  // Verify we see the wiki pages list
  await expect(page.locator('text=Wiki Pages')).toBeVisible();

  // Save auth state for reuse
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
});

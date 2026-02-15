import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_USER_EMAIL!;
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD!;

// Auth tests run with a clean browser — no saved storage state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication', () => {
  test('login with valid credentials redirects to /wiki', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[placeholder="you@example.com"]', E2E_EMAIL);
    await page.fill('input[placeholder="Your password"]', E2E_PASSWORD);
    await page.click('button:has-text("Sign in")');

    await expect(page).toHaveURL('/wiki', { timeout: 15000 });
    await expect(page.locator('text=Wiki Pages')).toBeVisible();
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[placeholder="you@example.com"]', E2E_EMAIL);
    await page.fill('input[placeholder="Your password"]', 'wrong-password-12345');
    await page.click('button:has-text("Sign in")');

    // Should stay on login and show error
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('.text-accent-danger')).toBeVisible({ timeout: 5000 });
  });

  test('unauthenticated access to /wiki redirects to login', async ({ page }) => {
    await page.goto('/wiki');

    // Middleware redirects to /auth/login?redirect=/wiki
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test('logout redirects to home page', async ({ page }) => {
    // First login
    await page.goto('/auth/login');
    await page.fill('input[placeholder="you@example.com"]', E2E_EMAIL);
    await page.fill('input[placeholder="Your password"]', E2E_PASSWORD);
    await page.click('button:has-text("Sign in")');
    await expect(page).toHaveURL('/wiki', { timeout: 15000 });

    // Click the sign-out button (LogOut icon in header)
    await page.click('button[aria-label="Sign out"]');

    // Should redirect to home
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Sign in link should be visible
    await expect(page.locator('text=Sign in')).toBeVisible();
  });
});

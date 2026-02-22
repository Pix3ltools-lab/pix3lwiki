import { test, expect } from '@playwright/test';

// Smoke test: verifies that force-dynamic config is correct in production.
// window.__PIX3L_CONFIG__.pix3lboardUrl must not point to localhost,
// which would mean the server-side env var was missing or invalid at build time.
test('window.__PIX3L_CONFIG__.pix3lboardUrl is not localhost', async ({ page }) => {
  await page.goto('/');

  const pix3lboardUrl = await page.evaluate(() => {
    return (window as unknown as { __PIX3L_CONFIG__?: { pix3lboardUrl?: string } })
      .__PIX3L_CONFIG__?.pix3lboardUrl;
  });

  expect(pix3lboardUrl).toBeTruthy();
  expect(pix3lboardUrl).not.toContain('localhost');
});

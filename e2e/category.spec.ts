import { test, expect } from '@playwright/test';
import { uniqueName } from './fixtures';

test.describe('Categories (Admin)', () => {
  test('admin can access admin panel', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Admin Panel')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Categories')).toBeVisible();
  });

  test('create a category', async ({ page }) => {
    const catName = uniqueName('E2E Cat');

    await page.goto('/admin');
    await expect(page.locator('text=Categories')).toBeVisible({ timeout: 10000 });

    // Click Add Category
    await page.click('button:has-text("Add Category")');
    await expect(page.locator('text=Create Category')).toBeVisible();

    // Fill the form
    await page.fill('input[placeholder="Category name"]', catName);
    await page.fill('input[placeholder="Brief description"]', 'Test category description');

    // Submit
    await page.click('button:has-text("Create")');

    // Category should appear in the list
    await expect(page.locator(`text=${catName}`)).toBeVisible({ timeout: 5000 });
  });

  test('edit a category', async ({ page }) => {
    const catName = uniqueName('E2E EditCat');

    await page.goto('/admin');
    await expect(page.locator('text=Categories')).toBeVisible({ timeout: 10000 });

    // Create category first
    await page.click('button:has-text("Add Category")');
    await expect(page.locator('text=Create Category')).toBeVisible();
    await page.fill('input[placeholder="Category name"]', catName);
    await page.click('button:has-text("Create")');
    await expect(page.locator(`text=${catName}`)).toBeVisible({ timeout: 5000 });

    // Click edit button on the category
    const catRow = page.locator('div', { hasText: catName }).filter({ has: page.locator('button[title="Edit"]') });
    await catRow.locator('button[title="Edit"]').click();
    await expect(page.locator('text=Edit Category')).toBeVisible();

    // Update the name
    const nameInput = page.locator('input[placeholder="Category name"]');
    await nameInput.clear();
    await nameInput.fill(`${catName} Updated`);
    await page.click('button:has-text("Update")');

    // Updated name should appear
    await expect(page.locator(`text=${catName} Updated`)).toBeVisible({ timeout: 5000 });
  });

  test('delete a category', async ({ page }) => {
    const catName = uniqueName('E2E DelCat');

    await page.goto('/admin');
    await expect(page.locator('text=Categories')).toBeVisible({ timeout: 10000 });

    // Create category first
    await page.click('button:has-text("Add Category")');
    await expect(page.locator('text=Create Category')).toBeVisible();
    await page.fill('input[placeholder="Category name"]', catName);
    await page.click('button:has-text("Create")');
    await expect(page.locator(`text=${catName}`)).toBeVisible({ timeout: 5000 });

    // Click delete button
    const catRow = page.locator('div', { hasText: catName }).filter({ has: page.locator('button[title="Delete"]') });
    await catRow.locator('button[title="Delete"]').click();

    // Confirm in dialog
    await expect(page.locator('text=Delete Category')).toBeVisible();
    await page.click('button:has-text("Delete")');

    // Should be gone
    await expect(page.locator(`text=${catName}`).first()).not.toBeVisible({ timeout: 5000 });
  });
});

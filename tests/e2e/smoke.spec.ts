import { test, expect } from '@playwright/test';

test('smoke: load dashboard, open case, generate mock plan', async ({ page }) => {
  // Load dashboard
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Dashboard');
  await expect(page.locator('a[href="/cases"]')).toBeVisible();

  // Navigate to cases
  await page.click('a[href="/cases"]');
  await expect(page.locator('h1')).toContainText('Cases');

  // Open first case
  const firstCase = page.locator('a[href^="/cases/"]').first();
  await expect(firstCase).toBeVisible();
  await firstCase.click();

  // Verify case detail loaded
  await expect(page.locator('text=Overview')).toBeVisible();
  await expect(page.locator('text=Goals')).toBeVisible();
  await expect(page.locator('text=Sessions')).toBeVisible();

  // Navigate to treatment plan
  await page.click('text=Generate Treatment Plan');
  await expect(page.locator('h1')).toContainText('Treatment Plan Builder');

  // Generate plan
  await page.click('text=Generate Treatment Plan');
  await expect(page.locator('text=Clinician Review Required')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=AI Generated')).toBeVisible();
  await expect(page.locator('text=Clinical Summary')).toBeVisible();
});

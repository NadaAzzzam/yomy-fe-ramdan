import { test, expect } from '@playwright/test';

test('fresh install opens onboarding and theme controls work', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/setup/);
  await page.getByRole('button', { name: 'Theme', exact: true }).click();
  await page.getByRole('button', { name: 'داكن', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Theme', exact: true })).toBeVisible();
});

test('main tabs load without JavaScript errors and restore saved state', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/home');
  for (const route of ['subha', 'more', 'weekly', 'notes', 'motivation', 'setup']) {
    await page.goto('/' + route);
    await expect(page.locator('ion-page, .ion-page').last()).toBeVisible();
  }
  await page.reload();
  expect(errors).toEqual([]);
});

test('daily progress rolls over while app remains open', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 10, 12, 23, 59, 58) });
  await page.goto('/home');
  await page.clock.fastForward(5000);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('yomy-ramadan-state')!).lastSeenDate)).toBe('2026-11-13');
});

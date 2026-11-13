import { test, expect } from '@playwright/test';

for (const viewport of [
  {width:320,height:568}, {width:360,height:640},
  {width:390,height:844}, {width:844,height:390}, {width:768,height:1024},
]) {
  test('controls fit ' + viewport.width + 'x' + viewport.height, async ({page}) => {
    await page.setViewportSize(viewport);
    for (const route of ['setup','home','salah','subha','more','notes','weekly','motivation']) {
      await page.goto('/' + route);
      await expect(page.locator('.ion-page:not(.ion-page-hidden) .ion-content-inner').first()).toBeVisible();
      const overflow = await page.locator('.ion-page:not(.ion-page-hidden) .ion-content-inner').first().evaluate(root => {
        const box = root.getBoundingClientRect();
        return [...root.querySelectorAll('button, ion-button, input, select, textarea')].filter(element => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && (rect.left < box.left - 1 || rect.right > box.right + 1);
        }).map(element => element.textContent?.trim().slice(0,80));
      });
      expect(overflow, route).toEqual([]);
    }
  });
}

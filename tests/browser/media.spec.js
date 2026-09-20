import { test, expect } from '@playwright/test';

test('PNG scenes load, real audio is opt-in, replay sounds stop on interrupt and mute', async ({
  page,
}) => {
  const errors = [];
  const pngs = new Set();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.url().includes('/assets/scenes/') && response.url().endsWith('.png')) {
      expect(response.status()).toBe(200);
      pngs.add(response.url());
    }
  });
  await page.addInitScript(() => {
    const OriginalAudio = window.Audio;
    window.__media = [];
    window.Audio = function (...args) {
      const element = new OriginalAudio(...args);
      window.__media.push(element);
      return element;
    };
    window.Audio.prototype = OriginalAudio.prototype;
  });
  await page.goto('/');
  await page.getByRole('button', { name: '調査を始める →' }).click();
  expect(pngs.size).toBe(8);
  expect(await page.evaluate(() => window.__media.length)).toBe(0);
  await page.locator('#sound-toggle').click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__media.some((a) => a.src.includes('investigation') && a.currentTime > 0),
      ),
    )
    .toBe(true);
  await page.getByRole('button', { name: '島へ届いた調査資料', exact: false }).click();
  await page.getByRole('button', { name: '地図', exact: true }).click();
  await page.getByRole('button', { name: '保健室 未訪問' }).click();
  await page.screenshot({ path: 'test-results/manga-infirmary.png', fullPage: true });
  await page.getByRole('button', { name: '人型を調べる：寝台の下の人型' }).click();
  await page.getByRole('button', { name: '再現する：寝台の下の人型' }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__media.some((a) => a.src.includes('bed-drag') && a.currentTime > 0),
      ),
    )
    .toBe(true);
  await page.getByRole('button', { name: '再現を中断する' }).click();
  expect(
    await page.evaluate(() =>
      window.__media.filter((a) => /bed-drag|reconstruction/.test(a.src)).every((a) => a.paused),
    ),
  ).toBe(true);
  await page.getByRole('button', { name: '天井蓋の白粉', exact: false }).click();
  await page.getByRole('button', { name: '地図', exact: true }).click();
  await page.getByRole('button', { name: '天井点検路 未訪問' }).click();
  await expect(page.locator('#location-name')).toHaveText('天井点検路');
  await expect(page.locator('canvas')).toBeVisible();
  await page.locator('#sound-toggle').click();
  await expect.poll(() => page.evaluate(() => window.__media.every((a) => a.paused))).toBe(true);
  expect(
    await page.evaluate(() => window.__media.filter((a) => a.error).map((a) => a.src)),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

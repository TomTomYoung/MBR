import { test, expect } from '@playwright/test';
import { Investigation } from '../../src/engine.js';
import { gameData } from '../../src/data/game.js';

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

test('additional cues load, projector stops on line advance, and terminal cues wait for their narration', async ({
  page,
}) => {
  const engine = new Investigation();
  for (let step = 0; step < 20; step++)
    for (const node of [...engine.state.unlocked]) {
      engine.travel(node, { jump: true });
      for (const marker of gameData.markers.filter((m) => m.node === node)) {
        engine.discover(marker.id);
        engine.finishReplay(marker.caseId);
      }
      for (const record of engine.availableEvidence()) engine.collect(record.id);
    }
  engine.state.started = true;
  engine.travel('observatory', { jump: true });
  await page.addInitScript((save) => {
    localStorage.setItem('mbr-investigation-v1', save);
    const OriginalAudio = window.Audio;
    window.__media = [];
    window.Audio = function (...args) {
      const element = new OriginalAudio(...args);
      window.__media.push(element);
      return element;
    };
    window.Audio.prototype = OriginalAudio.prototype;
  }, engine.exportSave());
  await page.goto('/');
  const assets = await page.evaluate(async () => {
    const { audioAssets } = await import('/src/audio-assets.js');
    const { replaySounds } = await import('/src/data/media.js');
    return {
      count: Object.keys(audioAssets).length,
      missing: Object.values(replaySounds).filter((key) => !audioAssets[key]?.url),
    };
  });
  expect(assets).toEqual({ count: 47, missing: [] });
  await page.locator('#sound-toggle').click();
  const start = async (id) => {
    const record = gameData.cases.find((c) => c.id === id);
    await page.getByRole('button', { name: `再現する：${record.label}` }).click();
  };
  await start('case-16');
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__media.some((a) => a.src.includes('projector-loop') && a.loop && a.currentTime > 0),
      ),
    )
    .toBe(true);
  await page.locator('#next-line').click();
  expect(
    await page.evaluate(() =>
      window.__media.filter((a) => a.src.includes('projector-loop')).every((a) => a.paused),
    ),
  ).toBe(true);
  await page.locator('#stop-replay').click();
  await start('case-16');
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__media.some((a) => a.src.includes('projector-loop') && !a.paused),
      ),
    )
    .toBe(true);
  await page.locator('#stop-replay').click();
  expect(
    await page.evaluate(() =>
      window.__media.filter((a) => a.src.includes('projector-loop')).every((a) => a.paused),
    ),
  ).toBe(true);
  await start('case-36');
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__media.some(
          (a) => a.src.includes('projector-stop') && !a.loop && a.currentTime > 0,
        ),
      ),
    )
    .toBe(true);
  await page.locator('#stop-replay').click();
  await page.getByRole('button', { name: '地図', exact: true }).click();
  await page.getByRole('button', { name: '最終報告室 訪問済', exact: true }).click();
  for (const [id, key, line] of [
    ['case-07', 'terminal-scheduled', 3],
    ['case-24', 'report-print', 2],
  ]) {
    await start(id);
    for (let current = 0; current < line; current++) {
      expect(
        await page.evaluate((key) => window.__media.some((a) => a.src.includes(key)), key),
      ).toBe(false);
      await page.locator('#next-line').click();
    }
    await expect
      .poll(() =>
        page.evaluate(
          (key) => window.__media.some((a) => a.src.includes(key) && a.currentTime > 0),
          key,
        ),
      )
      .toBe(true);
    await page.locator('#stop-replay').click();
  }
  expect(
    await page.evaluate(() => window.__media.filter((a) => a.error).map((a) => a.src)),
  ).toEqual([]);
});

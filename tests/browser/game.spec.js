import { test, expect } from '@playwright/test';
import { Investigation } from '../../src/engine.js';
import { gameData, caseId } from '../../src/data/game.js';
import { solutions } from '../../src/data/solutions.js';
function fullSave() {
  const e = new Investigation();
  for (let step = 0; step < 20; step++)
    for (const id of [...e.state.unlocked]) {
      e.travel(id, { jump: true });
      for (const m of gameData.markers.filter((m) => m.node === id)) {
        e.discover(m.id);
        e.finishReplay(m.caseId);
      }
      for (const r of e.availableEvidence()) e.collect(r.id);
    }
  e.state.started = true;
  return e;
}
test('new game: discovery, interrupted replay, testimony, unlock, save and map jump', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: '調査を始める →' }).click();
  await page.getByRole('button', { name: '島へ届いた調査資料', exact: false }).click();
  await page.getByRole('button', { name: '地図', exact: true }).click();
  await page.getByRole('button', { name: '保健室 未訪問' }).click();
  await expect(page.locator('#location-name')).toHaveText('保健室');
  await page.getByRole('button', { name: '人型を調べる：寝台の下の人型' }).click();
  await page.getByRole('button', { name: '再現する：寝台の下の人型' }).click();
  await page.getByRole('button', { name: '再現を中断する' }).click();
  expect(
    JSON.parse(await page.evaluate(() => localStorage.getItem('mbr-investigation-v1'))).replayed,
  ).toHaveLength(0);
  await page.getByRole('button', { name: '再現する：寝台の下の人型' }).click();
  for (let i = 0; i < 4; i++) await page.locator('#next-line').click();
  await page.getByRole('button', { name: '天井蓋の白粉', exact: false }).click();
  await page.getByRole('button', { name: '地図', exact: true }).click();
  await page.getByRole('button', { name: '天井点検路 未訪問' }).click();
  await expect(page.locator('#location-name')).toHaveText('天井点検路');
  await page.getByRole('button', { name: '点検路の持出し痕', exact: false }).click();
  await page.reload();
  await expect(page.locator('#location-name')).toHaveText('天井点検路');
  await page.getByRole('button', { name: /証拠・証言/ }).click();
  await expect(page.locator('#book-content')).toContainText('高槻 千景');
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/desktop-journal.png', fullPage: true });
});
test('report form confirms arbitrary three, locks them, and completes final case', async ({
  page,
}) => {
  const e = fullSave();
  const ids = [caseId(7), caseId(23), caseId(14)];
  await page.addInitScript(
    (save) => localStorage.setItem('mbr-investigation-v1', save),
    e.exportSave(),
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'リポート', exact: true }).click();
  for (const id of ids)
    for (const [field, value] of Object.entries(solutions[id]))
      await page.locator(`[data-case="${id}"] [data-field="${field}"]`).selectOption(value);
  await expect(page.locator('#confirmed-count')).toHaveText('03');
  await expect(page.locator(`[data-case="${ids[0]}"] [data-field="victim"]`)).toBeDisabled();
  const completed = fullSave();
  for (const [id, answer] of Object.entries(solutions)) completed.setReport(id, answer);
  completed.checkReports();
  await page.evaluate((save) => {
    localStorage.setItem('mbr-investigation-v1', save);
  }, completed.exportSave());
  // Navigate in a fresh context without the original seed script.
  const final = await page.context().browser().newPage();
  await final.goto('/');
  await final.evaluate(
    (save) => localStorage.setItem('mbr-investigation-v1', save),
    completed.exportSave(),
  );
  await final.reload();
  await final.getByRole('button', { name: 'リポート', exact: true }).click();
  await expect(final.locator('#confirmed-count')).toHaveText('40');
  await final.getByRole('button', { name: '最終出席簿を閉じる' }).click();
  await expect(final.locator('#book-content')).toContainText('灯の通報');
  await final.close();
});
test('mobile canvas, map and journal remain within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '調査を始める →' }).click();
  await page.getByRole('button', { name: '島へ届いた調査資料', exact: false }).click();
  await expect(page.locator('canvas')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test-results/mobile-exploration.png', fullPage: true });
  await page.getByRole('button', { name: '地図', exact: true }).click();
  await page.getByRole('button', { name: '温室・水路縁 未訪問' }).click();
  await expect(page.locator('#location-name')).toHaveText('温室・水路縁');
});

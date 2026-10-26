import { test, expect } from '@playwright/test';
import { Investigation } from '../../src/engine.js';
import { editions } from '../../src/data/editions.js';

function firstEditionSave() {
  const engine = new Investigation(editions[1].data);
  engine.collect('arrival');
  engine.travel('infirmary', { jump: true });
  engine.state.started = true;
  engine.state.notes = '初版の調査メモ';
  const save = { ...engine.state };
  delete save.edition;
  return JSON.stringify(save);
}

async function options(page) {
  if (await page.locator('#book').isVisible()) await page.locator('#close-book').click();
  await page.locator('#settings-tab').click();
}

test('latest default, legacy restore, text switching and independent progress survive reload', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const legacy = firstEditionSave();
  await page.evaluate((raw) => localStorage.setItem('mbr-investigation-v1', raw), legacy);
  await page.reload();
  await expect(page.locator('#edition-label')).toHaveText('第2版（最新）');
  await expect(page.locator('#book-content')).toContainText('船を下りてから');
  expect(await page.evaluate(() => localStorage.getItem('mbr-investigation-v1'))).toBe(legacy);
  await page.getByRole('button', { name: '調査を始める →' }).click();
  await page.getByRole('button', { name: /島へ届いた調査資料/ }).click();
  await expect(page.locator('#message')).toContainText('調査資料の束を開く');
  await page.locator('#map-tab').click();
  await page.getByRole('button', { name: '温室・水路縁 未訪問' }).click();
  await options(page);
  await page.getByLabel('調査メモ').fill('第2版は温室から');
  await page.getByLabel('プレイする版').selectOption('1');
  await expect(page.locator('#edition-label')).toHaveText('初版');
  await expect(page.locator('#location-name')).toHaveText('保健室');
  await expect(page.getByLabel('調査メモ')).toHaveValue('初版の調査メモ');
  await page.locator('#close-book').click();
  await expect(page.locator('#message')).toHaveText(
    editions[1].data.nodes.find((n) => n.id === 'infirmary').description,
  );
  await page.getByRole('button', { name: '人型を調べる：寝台の下の人型' }).click();
  await page.getByRole('button', { name: '再現する：寝台の下の人型' }).click();
  await expect(page.locator('#replay-text')).toHaveText('寝台を引く音。床に隠された蓋が開く。');
  await page.locator('#stop-replay').click();
  await page.reload();
  await expect(page.locator('#edition-label')).toHaveText('初版');
  await options(page);
  await page.getByLabel('プレイする版').selectOption('2');
  await expect(page.locator('#location-name')).toHaveText('温室・水路縁');
  await expect(page.getByLabel('調査メモ')).toHaveValue('第2版は温室から');
  await page.locator('#close-book').click();
  await page.getByRole('button', { name: '人型を調べる：水路縁の人型' }).click();
  await page.getByRole('button', { name: '再現する：水路縁の人型' }).click();
  await expect(page.locator('#replay-text')).toContainText('配給袋が地面に落ちる');
  await page.locator('#stop-replay').click();
  await page.reload();
  await expect(page.locator('#edition-label')).toHaveText('第2版（最新）');
  await expect(page.locator('#location-name')).toHaveText('温室・水路縁');
  expect(errors).toEqual([]);
});

test('options can select either edition from the initial prologue on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'オプション・版の切替' }).click();
  await page.getByLabel('プレイする版').selectOption('1');
  await expect(page.locator('#book-content')).toContainText('島に生存者はいない');
  await page.getByRole('button', { name: 'オプション・版の切替' }).click();
  await page.getByLabel('プレイする版').selectOption('2');
  await expect(page.locator('#book-content')).toContainText('船を下りてから');
  await page.getByRole('button', { name: 'オプション・版の切替' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const width = await page
    .locator('#book-content')
    .evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  await page.screenshot({ path: 'test-results/mobile-edition-options.png', fullPage: true });
});

test('export names the edition; importing legacy save switches only that edition', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '調査を始める →' }).click();
  await options(page);
  await page.getByLabel('調査メモ').fill('新版のメモを残す');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'セーブを書き出す' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('hakusho-investigation-v2.json');
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const exported = JSON.parse(Buffer.concat(chunks).toString());
  expect(exported.edition).toBe(2);
  expect(exported.notes).toBe('新版のメモを残す');
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('初版');
    await dialog.accept();
  });
  await page.locator('input[type=file]').setInputFiles({
    name: 'old-save.json',
    mimeType: 'application/json',
    buffer: Buffer.from(firstEditionSave()),
  });
  await expect(page.locator('#edition-label')).toHaveText('初版');
  await expect(page.locator('#location-name')).toHaveText('保健室');
  await options(page);
  await page.getByLabel('プレイする版').selectOption('2');
  await expect(page.getByLabel('調査メモ')).toHaveValue('新版のメモを残す');
});

test('reset changes only the selected edition and a corrupt other save cannot be overwritten', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '調査を始める →' }).click();
  await page.evaluate(
    (raw) => localStorage.setItem('mbr-investigation-v1', raw),
    firstEditionSave(),
  );
  await options(page);
  await page.getByLabel('調査メモ').fill('消すメモ');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: '調査を最初からやり直す' }).click();
  await page.getByRole('button', { name: '調査を始める →' }).click();
  await options(page);
  await expect(page.getByLabel('調査メモ')).toHaveValue('');
  await page.getByLabel('プレイする版').selectOption('1');
  await expect(page.getByLabel('調査メモ')).toHaveValue('初版の調査メモ');
  await page.getByLabel('プレイする版').selectOption('2');
  await page.evaluate(() => localStorage.setItem('mbr-investigation-v1', 'broken'));
  await page.reload();
  await options(page);
  await page.getByLabel('プレイする版').selectOption('1');
  await expect(page.locator('#edition-label')).toHaveText('第2版（最新）');
  await expect(page.getByLabel('プレイする版')).toHaveValue('2');
  await expect(page.locator('#toast')).toContainText('版を切り替えられませんでした');
  expect(await page.evaluate(() => localStorage.getItem('mbr-investigation-v1'))).toBe('broken');
});

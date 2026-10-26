import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Investigation } from '../src/engine.js';
import { editions, DEFAULT_EDITION } from '../src/data/editions.js';
import { replaySounds } from '../src/data/media.js';
import { solutions } from '../src/data/solutions.js';
import { EditionStorage, EDITION_KEY, investigationFromSave } from '../src/edition-storage.js';

const memoryStorage = () => {
  const values = new Map();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};
const legacySave = () => {
  const e = new Investigation(editions[1].data);
  e.collect('arrival');
  e.travel('infirmary', { jump: true });
  e.state.started = true;
  e.state.notes = '初版のメモ';
  const state = { ...e.state };
  delete state.edition;
  return JSON.stringify(state);
};

test('the complete first-edition data remains identical to the pre-edition release', () => {
  const { edition, ...data } = editions[1].data;
  assert.equal(edition, 1);
  assert.equal(
    createHash('sha256').update(JSON.stringify(data)).digest('hex'),
    '335e0d9f3ea564afdc8d04de9779309aa3c272aa23447d6891dc71640a12987f',
  );
});

test('edition 2 rewrites every scene, record and location without changing the investigation graph', () => {
  const first = editions[1].data;
  const second = editions[2].data;
  const proseKeys = new Set(['text', 'description', 'intro', 'ending', 'edition']);
  const structural = (data) =>
    JSON.parse(JSON.stringify(data, (key, value) => (proseKeys.has(key) ? undefined : value)));
  assert.deepEqual(structural(second), structural(first));
  for (const [i, scene] of second.cases.entries())
    scene.lines.forEach((line, j) =>
      assert.notEqual(line.text, first.cases[i].lines[j].text, `${scene.id}:${j}`),
    );
  for (const [i, record] of second.records.entries())
    assert.notEqual(record.text, first.records[i].text, record.id);
  for (const [i, node] of second.nodes.entries())
    assert.notEqual(node.description, first.nodes[i].description, node.id);
  assert.notDeepEqual(second.intro, first.intro);
  assert.notDeepEqual(second.ending, first.ending);
});

for (const { id, data } of Object.values(editions)) {
  test(`edition ${id}: all content is reachable, forty reports complete, saves round-trip`, () => {
    const engine = new Investigation(data);
    for (let round = 0; round < 25; round++) {
      const before = engine.state.records.length;
      for (const node of [...engine.state.unlocked]) {
        engine.travel(node, { jump: true });
        for (const marker of data.markers.filter((m) => m.node === node)) {
          engine.discover(marker.id);
          engine.finishReplay(marker.caseId);
        }
        for (const record of engine.availableEvidence()) engine.collect(record.id);
      }
      if (engine.state.records.length === before) break;
    }
    assert.equal(engine.state.unlocked.length, 41);
    assert.equal(engine.state.found.length, 40);
    assert.equal(engine.state.seenMarkers.length, 43);
    assert.equal(engine.state.replayed.length, 40);
    assert.equal(engine.state.records.length, data.records.length);
    const answers = Object.entries(solutions);
    for (const [caseId, answer] of answers.slice(0, 39)) engine.setReport(caseId, answer);
    assert.equal(engine.checkReports().confirmed.length, 39);
    engine.setReport(...answers[39]);
    assert.equal(engine.checkReports().complete, true);
    const restored = investigationFromSave(engine.exportSave());
    assert.deepEqual(restored.state, engine.state);
    assert.equal(restored.data.edition, id);
  });

  test(`edition ${id}: testimony, living speakers and objective audio lines remain aligned`, () => {
    const roster = JSON.parse(
      readFileSync(new URL('../doc/scenario/original-40.json', import.meta.url)),
    ).roster;
    for (const c of data.cases) {
      const spoken = c.lines.filter((l) => l.speaker);
      spoken.forEach((line, i) => {
        const record = data.records.find((r) => r.id === c.testimony[i]);
        assert.equal(record.text, line.text);
        assert.equal(record.speaker, line.speaker);
        const person = roster.find((p) => `p${String(p.id).padStart(2, '0')}` === line.speaker);
        assert(c.discoveryAt < person.deathAt, `${c.id}: ${line.speaker}`);
      });
    }
    for (const cue of Object.keys(replaySounds)) {
      const [caseId, line] = cue.split(':');
      assert.equal(data.cases.find((c) => c.id === caseId).lines[Number(line)].speaker, null);
    }
  });
}

test('default is latest even with a legacy save; switching preserves independent progress and notes', () => {
  const storage = memoryStorage();
  const old = legacySave();
  storage.setItem(editions[1].saveKey, old);
  const session = new EditionStorage(storage);
  assert.equal(session.edition.id, DEFAULT_EDITION);
  assert.equal(session.engine.state.node, 'gate');
  assert.equal(storage.getItem(editions[1].saveKey), old);
  session.engine.state.notes = '第2版のメモ';
  session.engine.collect('arrival');
  session.engine.travel('studio', { jump: true });
  session.select(1);
  assert.equal(session.engine.state.node, 'infirmary');
  assert.equal(session.engine.state.notes, '初版のメモ');
  assert.equal(storage.getItem(EDITION_KEY), '1');
  assert.equal(new EditionStorage(storage).edition.id, 1);
  session.select(2);
  assert.equal(session.engine.state.node, 'studio');
  assert.equal(session.engine.state.notes, '第2版のメモ');
  session.engine.reset();
  session.save();
  session.select(1);
  assert.equal(session.engine.state.node, 'infirmary');
  assert.equal(session.engine.state.notes, '初版のメモ');
});

test('legacy exports route to edition 1; a mismatched or unknown edition never loads over current progress', () => {
  assert.equal(investigationFromSave(legacySave()).state.edition, 1);
  const latest = new Investigation();
  latest.collect('arrival');
  const before = latest.exportSave();
  assert.throws(() => latest.loadSave(legacySave()), /別の版/);
  assert.equal(latest.exportSave(), before);
  for (const edition of [0, 3, null, '2', {}, '__proto__']) {
    assert.throws(() => investigationFromSave(JSON.stringify({ ...latest.state, edition })));
  }
});

test('corrupt destination save leaves the selected edition, storage and progress untouched', () => {
  const storage = memoryStorage();
  const session = new EditionStorage(storage);
  session.engine.collect('arrival');
  session.engine.state.notes = 'keep';
  session.save();
  storage.setItem(editions[1].saveKey, 'broken');
  const before = [...storage.values];
  const engineBefore = session.engine.exportSave();
  assert.throws(() => session.select(1));
  assert.equal(session.edition.id, 2);
  assert.equal(session.engine.exportSave(), engineBefore);
  assert.deepEqual([...storage.values], before);
});

test('unavailable browser storage still keeps both editions in memory and reports save failure', () => {
  const unavailable = () => {
    throw new Error('blocked');
  };
  const session = new EditionStorage({ getItem: unavailable, setItem: unavailable });
  session.engine.state.notes = '第2版を保持';
  assert.equal(session.save(), false);
  session.select(1);
  session.engine.state.notes = '初版を保持';
  session.select(2);
  assert.equal(session.engine.state.notes, '第2版を保持');
  assert.match(session.warning, /保存ができません/);
  session.select(1);
  assert.equal(session.engine.state.notes, '初版を保持');
});

test('invalid preference falls back to latest and cross-edition import replaces only its destination', () => {
  const storage = memoryStorage();
  storage.setItem(EDITION_KEY, '99');
  const session = new EditionStorage(storage);
  assert.equal(session.edition.id, 2);
  session.engine.state.notes = 'latest';
  session.activate(investigationFromSave(legacySave()));
  session.save();
  assert.equal(session.edition.id, 1);
  session.select(2);
  assert.equal(session.engine.state.notes, 'latest');
  const savedFirst = investigationFromSave(storage.getItem(editions[1].saveKey));
  assert.equal(savedFirst.state.notes, '初版のメモ');
});

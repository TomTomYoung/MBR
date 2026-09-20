import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Investigation } from '../src/engine.js';
import { gameData, caseId } from '../src/data/game.js';
import { solutions } from '../src/data/solutions.js';

export function investigateAll(engine = new Investigation()) {
  let changed = true,
    rounds = 0;
  while (changed && rounds++ < 100) {
    const before = JSON.stringify(engine.state);
    for (const id of [...engine.state.unlocked]) {
      engine.travel(id, { jump: true });
      for (const marker of gameData.markers.filter((m) => m.node === id)) {
        engine.discover(marker.id);
        engine.finishReplay(marker.caseId);
      }
      for (const record of engine.availableEvidence()) engine.collect(record.id);
    }
    changed = before !== JSON.stringify(engine.state);
  }
  return engine;
}
test('all authored identifiers, references and conditions are valid', () => {
  for (const key of ['nodes', 'cases', 'markers', 'records', 'people', 'weapons'])
    assert.equal(new Set(gameData[key].map((x) => x.id)).size, gameData[key].length, key);
  const n = new Set(gameData.nodes.map((n) => n.id)),
    r = new Set(gameData.records.map((r) => r.id)),
    c = new Set(gameData.cases.map((c) => c.id));
  assert.equal(c.size, 40);
  assert.equal(gameData.people.length, 40);
  for (const node of gameData.nodes) {
    for (const exit of node.exits) assert(n.has(exit));
    for (const req of node.requiresAny) assert(r.has(req), `${node.id}: ${req}`);
  }
  for (const marker of gameData.markers) {
    assert(n.has(marker.node));
    assert(c.has(marker.caseId));
  }
  for (const record of gameData.records) {
    assert(n.has(record.node));
    for (const id of record.cases) assert(c.has(id));
  }
  for (const item of gameData.cases) {
    assert.equal(Object.keys(solutions[item.id]).length, 4);
    assert(item.lines.length >= 4);
    for (const id of [...item.evidence, ...item.testimony]) assert(r.has(id));
  }
});
test('the physical graph is connected', () => {
  const seen = new Set(['gate']);
  for (let i = 0; i < gameData.nodes.length; i++)
    for (const n of gameData.nodes) if (seen.has(n.id)) n.exits.forEach((x) => seen.add(x));
  assert.equal(seen.size, gameData.nodes.length);
});
test('unlocked unvisited map jump works; locked and unconnected walking do not', () => {
  const e = new Investigation();
  assert.throws(() => e.travel('terminal', { jump: true }));
  e.collect('arrival');
  assert(!e.state.visited.includes('studio'));
  assert.throws(() => e.travel('studio'));
  e.travel('studio', { jump: true });
  assert(e.state.visited.includes('studio'));
});
test('discovery and full replay independently reveal evidence and testimony', () => {
  const e = new Investigation();
  e.collect('arrival');
  e.travel('infirmary', { jump: true });
  assert.equal(e.availableEvidence().length, 0);
  const marker = gameData.markers.find((m) => m.node === 'infirmary');
  e.discover(marker.id);
  assert.equal(e.state.replayed.length, 0);
  assert.equal(e.state.records.length, 1);
  assert(e.availableEvidence().some((r) => r.id === 'e07a'));
  assert(!e.state.records.includes('t07a'));
  const result = e.finishReplay(marker.caseId);
  assert(result.added.length);
  assert(e.state.records.includes('t07a'));
  assert.equal(e.finishReplay(marker.caseId).added.length, 0);
});
test('all forty cases and every record are reachable without entering any answer', () => {
  const e = investigateAll();
  assert.equal(e.state.unlocked.length, gameData.nodes.length);
  assert.equal(e.state.found.length, 40);
  assert.equal(e.state.replayed.length, 40);
  assert.equal(e.state.records.length, gameData.records.length);
  assert.equal(e.state.confirmed.length, 0);
  assert.equal(Object.keys(e.state.reports).length, 0);
});
test('multiple markers and fragmented silhouettes do not duplicate death reports', () => {
  const e = investigateAll();
  assert.equal(e.state.seenMarkers.length, 43);
  assert.equal(e.state.found.length, 40);
  const fragment = gameData.markers.find((m) => m.node === 'roof');
  assert.equal(fragment.caseId, caseId(29));
});
test('any three complete correct reports confirm; one or two do not expose partial correctness', () => {
  const e = investigateAll();
  const ids = [caseId(40), caseId(7), caseId(18)];
  e.setReport(ids[0], solutions[ids[0]]);
  assert.deepEqual(e.checkReports(), { confirmed: [], complete: false });
  e.setReport(ids[1], solutions[ids[1]]);
  assert.deepEqual(e.checkReports(), { confirmed: [], complete: false });
  e.setReport(ids[2], { ...solutions[ids[2]], weapon: 'W01' });
  assert.deepEqual(e.checkReports(), { confirmed: [], complete: false });
  e.setReport(ids[2], solutions[ids[2]]);
  assert.equal(e.checkReports().confirmed.length, 3);
  assert.throws(() => e.setReport(ids[0], { cause: '毒死' }));
});
test('39 plus final one confirms all forty including mutual killing and accident', () => {
  const e = investigateAll();
  const all = Object.keys(solutions);
  for (const id of all.slice(0, 39)) e.setReport(id, solutions[id]);
  assert.equal(e.checkReports().confirmed.length, 39);
  e.setReport(all[39], solutions[all[39]]);
  assert.deepEqual(e.checkReports(), { confirmed: [all[39]], complete: true });
  assert.equal(solutions[caseId(35)].killer, 'none');
  assert.equal(solutions[caseId(39)].killer, 'p40');
  assert.equal(solutions[caseId(40)].killer, 'p39');
});
test('save round-trip, rejected corruption and confirmed-answer integrity', () => {
  const e = investigateAll();
  e.setReport(caseId(7), solutions[caseId(7)]);
  e.state.notes = '<script>not executed</script>';
  const raw = e.exportSave();
  const next = new Investigation();
  next.loadSave(raw);
  assert.deepEqual(next.state, e.state);
  const before = next.exportSave();
  for (const bad of [
    'invalid',
    'null',
    '{}',
    JSON.stringify({ ...e.state, node: 'missing' }),
    JSON.stringify({ ...e.state, confirmed: [caseId(40)] }),
  ]) {
    assert.throws(() => next.loadSave(bad));
    assert.equal(next.exportSave(), before);
  }
});
test('living witnesses and original death answers remain consistent', () => {
  const original = JSON.parse(
    readFileSync(new URL('../doc/scenario/original-40.json', import.meta.url)),
  ).roster;
  for (const c of gameData.cases) {
    const victim = original.find((p) => caseId(p.id) === c.id);
    if (c.discoveryAt)
      assert(c.discoveryAt >= victim.deathAt, `${c.label} discovered before death`);
    for (const line of c.lines.filter((l) => l.speaker)) {
      const p = original.find((p) => 'p' + String(p.id).padStart(2, '0') === line.speaker);
      assert(c.discoveryAt < p.deathAt, `${p.name} speaks after death`);
    }
    const answer = solutions[c.id];
    assert.equal(answer.victim, 'p' + String(victim.id).padStart(2, '0'));
    assert.equal(
      answer.killer,
      victim.killer ? 'p' + String(victim.killer).padStart(2, '0') : 'none',
    );
  }
  for (const t of gameData.records.filter((r) => r.kind === 'testimony')) {
    const p = original.find((p) => 'p' + String(p.id).padStart(2, '0') === t.speaker);
    if (t.spokenAt) assert(t.spokenAt < p.deathAt);
  }
});
test('testimony uses utterance time rather than the time claimed inside its text', () => {
  const e = investigateAll();
  const testimony = e.getRecords({ kind: 'testimony', speaker: 'p10' });
  const times = testimony.map((t) => t.spokenAt);
  assert.deepEqual(times, [...times].sort());
  assert(testimony.some((t) => t.spokenAt === '15:48' && t.text.includes('15:46')));
});

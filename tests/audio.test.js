import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ArchiveAudio } from '../src/audio.js';
import { replaySounds } from '../src/data/media.js';
import { cases } from '../src/data/game.js';
import { readFileSync, existsSync } from 'node:fs';

function player() {
  const created = [];
  const assets = {
    field: { url: 'field.ogg', loop: true },
    end: { url: 'end.ogg' },
    cue: { url: 'cue.ogg' },
  };
  const controller = new ArchiveAudio(assets, (url) => {
    const audio = {
      url,
      paused: true,
      ended: false,
      play() {
        this.paused = false;
        return Promise.resolve();
      },
      pause() {
        this.paused = true;
      },
      addEventListener() {},
    };
    created.push(audio);
    return audio;
  });
  return { controller, created };
}
test('audio waits for consent; mute and background suspension stop music and effects', () => {
  const { controller, created } = player();
  controller.setContext({ music: 'field' });
  controller.play('cue');
  assert.equal(created.length, 0);
  controller.setEnabled(true);
  controller.play('cue');
  assert.equal(created.filter((a) => !a.paused).length, 2);
  controller.setEnabled(false);
  assert.ok(created.every((a) => a.paused));
  controller.setEnabled(true);
  assert.equal(created.filter((a) => !a.paused).length, 1);
  controller.setSuspended(true);
  assert.ok(created.every((a) => a.paused));
  controller.setSuspended(false);
  assert.equal(created.filter((a) => !a.paused).length, 1);
});
test('changing context replaces a loop and does not restart a completed ending', () => {
  const { controller, created } = player();
  controller.setEnabled(true);
  controller.setContext({ music: 'field' });
  controller.setContext({ music: 'end' });
  assert.equal(created[0].paused, true);
  assert.equal(created[1].loop, false);
  created[1].ended = true;
  created[1].paused = true;
  controller.setContext({ music: 'end' });
  assert.equal(created.length, 2);
  assert.equal(created[1].paused, true);
});
test('placed media exists and replay cues are attached only to objective lines', () => {
  const manifest = JSON.parse(
    readFileSync(new URL('../assets/asset-manifest.json', import.meta.url)),
  );
  for (const a of manifest.images)
    assert.ok(existsSync(new URL(`../${a.path}`, import.meta.url)), a.path);
  for (const a of manifest.audio) {
    assert.ok(existsSync(new URL(`../${a.ogg}`, import.meta.url)), a.ogg);
    assert.ok(existsSync(new URL(`../${a.wav}`, import.meta.url)), a.wav);
  }
  const keys = new Set(manifest.audio.map((a) => a.key));
  for (const [id, sound] of Object.entries(replaySounds)) {
    const [caseId, line] = id.split(':');
    assert.equal(cases.find((c) => c.id === caseId).lines[Number(line)].speaker, null, id);
    assert.ok(keys.has(sound), sound);
  }
});

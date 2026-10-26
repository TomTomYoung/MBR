import { gameData as original, caseId, intro, ending } from './game.js';
import { caseTextV2 } from './case-text-v2.js';
import { descriptionsV2, introV2, endingV2, sharedTextV2 } from './world-text-v2.js';

export const DEFAULT_EDITION = 2;
const firstEdition = { ...original, edition: 1, intro, ending };
const secondEdition = structuredClone(firstEdition);
secondEdition.edition = 2;
secondEdition.intro = introV2;
secondEdition.ending = endingV2;

for (const node of secondEdition.nodes) {
  if (!descriptionsV2[node.id]) throw new Error(`第2版の地点本文がありません: ${node.id}`);
  node.description = descriptionsV2[node.id];
}
const records = new Map(secondEdition.records.map((r) => [r.id, r]));
const cases = new Map(secondEdition.cases.map((c) => [c.id, c]));
for (const raw of caseTextV2) {
  const scene = cases.get(caseId(raw.v));
  scene.lines = raw.lines.map(([speaker, text], i) => ({
    ...scene.lines[i],
    text,
  }));
  raw.clues.forEach(([, text], i) => {
    records.get(scene.evidence[i]).text = text;
  });
  raw.lines
    .filter(([speaker]) => speaker)
    .forEach(([, text], i) => {
      records.get(scene.testimony[i]).text = text;
    });
  (raw.extra || []).forEach((r, i) => {
    records.get(`t${raw.v}x${i}`).text = r.text;
  });
}
for (const [id, text] of Object.entries(sharedTextV2)) records.get(id).text = text;

export const editions = {
  1: { id: 1, label: '初版', saveKey: 'mbr-investigation-v1', data: firstEdition },
  2: {
    id: 2,
    label: '第2版（最新）',
    saveKey: 'mbr-investigation-v2',
    data: secondEdition,
    model: {
      version: '1.2b',
      repository: 'TomTomYoung/GAMEBOOK',
      commit: '89514cbb7a76b208cfaa6c767755839def206aa4',
      path: 'doc/SCENARIO_MODEL_V1_2B.md',
    },
  },
};
export const defaultGameData = editions[DEFAULT_EDITION].data;

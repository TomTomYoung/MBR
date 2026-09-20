import { caseText } from './case-text.js';
import { nodes, edges, intro, ending } from './world.js';
import { people, weapons } from './people.js';
export { nodes, edges, intro, ending, people, weapons };
export const causes = [
  '射殺',
  '刺殺',
  '殴打死',
  '毒死',
  '溺死',
  '圧死',
  '転落死',
  '切創による死亡',
];
export const personId = (n) => (n ? `p${String(n).padStart(2, '0')}` : null);
export const caseId = (v) => `case-${String((v * 17) % 41).padStart(2, '0')}`;
export const cases = caseText.map((raw) => ({
  id: caseId(raw.v),
  label: raw.label,
  node: raw.node,
  discoveryAt: raw.at,
  discoverers: raw.finders.map(personId),
  lines: raw.lines.map(([who, text]) => ({ speaker: personId(who), text })),
  evidence: raw.clues.map((_, i) => `e${String(raw.v).padStart(2, '0')}${'abc'[i]}`),
  testimony: raw.lines
    .filter((l) => l[0])
    .map((_, i) => `t${String(raw.v).padStart(2, '0')}${'abcdefghijklmnopqrstuvwxyz'[i]}`)
    .concat((raw.extra || []).map((_, i) => `t${raw.v}x${i}`)),
}));
export const records = [
  {
    id: 'arrival',
    kind: 'evidence',
    title: '島へ届いた調査資料',
    text: '四十人の氏名・委員活動が記された名簿と、開幕の点呼の録音。保健室、温室、校内スタジオへ続く配置図が添えられている。声は点呼の氏名と対応する。',
    node: 'gate',
    cases: [],
  },
  ...caseText.flatMap((raw) =>
    raw.clues.map(([title, text, node], i) => ({
      id: `e${String(raw.v).padStart(2, '0')}${'abc'[i]}`,
      kind: 'evidence',
      title,
      text,
      node: node || raw.node,
      cases: [caseId(raw.v)],
      requiresFound: caseId(raw.v),
      requiresReplay: i === 2 ? caseId(raw.v) : null,
    })),
  ),
  ...caseText.flatMap((raw) =>
    raw.lines
      .filter(([who]) => who)
      .map(([who, text], i) => ({
        id: `t${String(raw.v).padStart(2, '0')}${'abcdefghijklmnopqrstuvwxyz'[i]}`,
        kind: 'testimony',
        title: '発見現場での発言',
        text,
        speaker: personId(who),
        spokenAt: raw.at,
        node: raw.node,
        cases: [caseId(raw.v)],
        source: raw.label + 'の再現',
      })),
  ),
  ...caseText.flatMap((raw) =>
    (raw.extra || []).map((r, i) => ({
      id: `t${raw.v}x${i}`,
      kind: 'testimony',
      title: '最終報告の文面',
      text: r.text,
      speaker: personId(r.speaker),
      spokenAt: r.at,
      node: raw.node,
      cases: [caseId(raw.v)],
      source: r.source,
    })),
  ),
];
// The same observed transfer/audio can be cited in more than one discovered case.
records.find((r) => r.id === 'e01b').cases = [caseId(1), caseId(7), caseId(32)];
records.find((r) => r.id === 'e06b').cases = [caseId(6), caseId(34)];
records.find((r) => r.id === 'e08c').cases = [caseId(8), caseId(32)];
records.push(
  {
    id: 'e15d',
    kind: 'evidence',
    title: '二体の巡回人形',
    text: '体育館のレール上に、悠真が服を着せた訓練人形が二体ある。本人が歩いた痕跡の両側を人形が動いている。三人分に見えた巡回のうち、二つには車輪しかない。',
    node: 'gym',
    cases: [caseId(15)],
    requiresFound: caseId(15),
  },
  {
    id: 'e23d',
    kind: 'evidence',
    title: '持ち去られた育苗トレー',
    text: '蛍が潜んだ床下の待避庫は固定されている。その上に載せた育苗トレーだけが持ち去られ、蛍は庫内に残っていた。移動するトレーの下に人がいるように見えた痕跡と、庫内の靴跡が別々に残る。',
    node: 'greenhouse',
    cases: [caseId(23)],
    requiresFound: caseId(23),
  },
  {
    id: 't36x',
    kind: 'testimony',
    title: '観察室からの伝言',
    text: '向こうに誰かいる。私はこっちで待つ。',
    node: 'darkroom',
    cases: [caseId(36)],
    speaker: 'p36',
    spokenAt: '11:29',
    source: '発見再現後に読み取れる、小夜の伝言',
  },
  {
    id: 't20x',
    kind: 'testimony',
    title: '報復と読まれた手紙',
    text: 'この島で行われたことを、外へ知らせる。あなたたちが隠したことは、全部記録してある。',
    node: 'comms',
    cases: [caseId(20), caseId(26)],
    speaker: 'p20',
    spokenAt: null,
    source: '通信卓に残された灯の手紙／記入時刻不明',
  },
);
cases.find((c) => c.id === caseId(15)).evidence.push('e15d');
cases.find((c) => c.id === caseId(23)).evidence.push('e23d');
cases.find((c) => c.id === caseId(36)).testimony.push('t36x');
cases.find((c) => c.id === caseId(26)).testimony.push('t20x');
export const markers = cases.map((c, i) => ({
  id: `m-${c.id}`,
  caseId: c.id,
  node: c.node,
  part: 'full',
  x: 0.36 + (i % 3) * 0.15,
  y: 0.75 + (i % 2) * 0.09,
}));
// Secondary traces share the death report, never create duplicate victims.
markers.push(
  { id: 'm-lift-fragment', caseId: caseId(29), node: 'roof', part: 'upper', x: 0.63, y: 0.8 },
  { id: 'm-morgue-a', caseId: caseId(32), node: 'morgue', part: 'full', x: 0.38, y: 0.76 },
  { id: 'm-morgue-b', caseId: caseId(8), node: 'morgue', part: 'full', x: 0.69, y: 0.78 },
);
markers.find((m) => m.caseId === caseId(29)).part = 'lower';
export const gameData = { nodes, edges, people, weapons, causes, cases, records, markers };

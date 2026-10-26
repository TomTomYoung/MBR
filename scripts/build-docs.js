import { writeFileSync } from 'node:fs';
import { people, weapons } from '../src/data/game.js';
import { editions } from '../src/data/editions.js';
import { solutions } from '../src/data/solutions.js';
const name = (id) => people.find((p) => p.id === id)?.name || 'なし（事故）';
const weapon = (id) => weapons.find((w) => w.id === id)?.name || id;
for (const edition of Object.values(editions)) {
  const gameData = edition.data;
  const suffix = edition.id === 1 ? '' : '_V2';
  const place = (id) => gameData.nodes.find((n) => n.id === id).name;
  const record = (id) => gameData.records.find((r) => r.id === id);
  let out =
    '# 実装用・全40事件の本文\n\nこのファイルは npm run docs で src/data から生成します。作者用の解答を含みます。発見再現の本文には真偽ラベルを表示しません。事件番号は死亡順や人物番号とは対応しません。\n\n';
  for (const c of gameData.cases) {
    const s = solutions[c.id];
    out += `## ${c.id} ${c.label}\n\n地点：${place(c.node)}。発見周知：${c.discoveryAt || '全員死亡後の客観観測'}。第一発見者：${c.discoverers.map(name).join('、') || '参加者なし／透明な探偵の観測'}。\n\n作者用正解：${name(s.victim)}／${s.cause}／${weapon(s.weapon)}／${name(s.killer)}。\n\n### 再現台本\n\n`;
    c.lines.forEach(
      (l, i) => (out += `${i + 1}. ${l.speaker ? name(l.speaker) : '客観描写'}：${l.text}\n\n`),
    );
    out += '### 調査できる証拠\n\n';
    for (const id of c.evidence) {
      const r = record(id);
      out += `${r.id}「${r.title}」／${place(r.node)}／人型発見後${r.requiresReplay ? '・再現完了後' : ''}\n\n${r.text}\n\n`;
    }
    out += '### 再現完了時に取得する証言\n\n';
    for (const id of c.testimony) {
      const r = record(id);
      out += `${id}／${name(r.speaker)}／発言${r.spokenAt || '不明'}／${r.source}\n\n${r.text}\n\n`;
    }
  }
  writeFileSync(`doc/scenario/PLAYABLE_CASES${suffix}.md`, out.trimEnd() + '\n');
  let world =
    '# 地点・接続・解放条件\n\n場所のグラフです。時刻別ノードはありません。解放条件は記録取得のOR条件です。到達可能性は tests/engine.test.js で全探索しています。\n\n';
  for (const n of gameData.nodes) {
    world += `## ${n.id} ${n.name}\n\n区画：${n.area}\n\n情景：${n.description}\n\n接続：${n.exits.map(place).join('、')}\n\n解放：${n.requiresAny.length ? n.requiresAny.map((id) => `${id}「${record(id).title}」`).join(' または ') : '初期解放'}\n\n人型：${
      gameData.markers
        .filter((m) => m.node === n.id)
        .map((m) => `${m.id} → ${m.caseId}（${m.part}）`)
        .join('、') || 'なし'
    }\n\n`;
    const list = gameData.records.filter((r) => r.kind === 'evidence' && r.node === n.id);
    for (const r of list)
      world += `取得物：${r.id}「${r.title}」／${r.requiresFound ? `${r.requiresFound} 発見後` : '条件なし'}${r.requiresReplay ? '・再現完了後' : ''}\n\n`;
  }
  writeFileSync(`doc/scenario/NODES${suffix}.md`, world.trimEnd() + '\n');
  console.log(
    `Documented ${edition.label}: ${gameData.cases.length} cases and ${gameData.nodes.length} nodes.`,
  );
  if (edition.id === 2) {
    const narrative = `# 第2版・導入、結末、共通資料\n\nこのファイルは npm run docs で生成します。結末のネタバレを含みます。\n\n## 導入\n\n${gameData.intro.join('\n\n')}\n\n## 結末\n\n${gameData.ending.join('\n\n')}\n\n## 共通・追加資料\n\n`;
    const ids = ['arrival', 'e15d', 'e23d', 't36x', 't20x'];
    writeFileSync(
      'doc/scenario/NARRATIVE_V2.md',
      narrative +
        ids
          .map((id) => {
            const r = record(id);
            return `### ${r.id} ${r.title}\n\n種別：${r.kind}\n\n${r.text}\n`;
          })
          .join('\n'),
    );
  }
}

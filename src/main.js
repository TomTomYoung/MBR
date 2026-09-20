import Phaser from 'phaser';
import '@fontsource/noto-serif-jp/400.css';
import '@fontsource/noto-sans-jp/400.css';
import './style.css';
import { Investigation } from './engine.js';
import { ArchiveScene } from './scene.js';
import { nodes, people, weapons, causes, markers, intro, ending } from './data/game.js';

const $ = (id) => document.getElementById(id);
const engine = new Investigation();
const SAVE_KEY = 'mbr-investigation-v1';
const book = $('book'),
  replay = $('replay');
let scene,
  mode = 'explore',
  activeReplay = null,
  toastTimer,
  muted = true,
  audioContext,
  restoreWarning = '';
try {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) engine.loadSave(saved);
} catch (error) {
  restoreWarning = `保存データを読み込めませんでした。${error.message} 調査は新しく始められます。`;
}
const name = (id) => people.find((p) => p.id === id)?.name || 'なし（事故）';
const label = (id) => engine.cases.get(id)?.label || '共通資料';
function el(tag, text, className) {
  const e = document.createElement(tag);
  if (text != null) e.textContent = text;
  if (className) e.className = className;
  return e;
}
function button(text, handler, className = '') {
  const b = el('button', text, className);
  b.addEventListener('click', handler);
  return b;
}
function save() {
  try {
    localStorage.setItem(SAVE_KEY, engine.exportSave());
    $('save-status').textContent = '調査を保存しました';
  } catch {
    $('save-status').textContent = '自動保存ができません。手引きから書き出してください。';
  }
}
function toast(text) {
  $('toast').textContent = text;
  $('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4500);
}
function sound(type = 'tap') {
  if (muted) return;
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const o = audioContext.createOscillator(),
      g = audioContext.createGain();
    o.connect(g);
    g.connect(audioContext.destination);
    o.type = type === 'replay' ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(
      type === 'confirm' ? 440 : type === 'replay' ? 110 : 210,
      audioContext.currentTime,
    );
    g.gain.setValueAtTime(0.018, audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    o.start();
    o.stop(audioContext.currentTime + 0.22);
  } catch {
    /* Audio is optional. */
  }
}
function run(fn) {
  try {
    fn();
  } catch (e) {
    toast(e.message);
  }
}
function unlockedMessage(ids) {
  return ids.length
    ? '\n輪郭が現れた場所：' + ids.map((id) => engine.nodes.get(id).name).join('、')
    : '';
}
function render(message) {
  const s = engine.state,
    n = engine.nodes.get(s.node);
  $('confirmed-count').textContent = String(s.confirmed.length).padStart(2, '0');
  $('progress-fill').style.width = `${(s.confirmed.length / 40) * 100}%`;
  $('record-count').textContent = s.records.length;
  $('area-label').textContent = mode === 'map' ? 'MAP / 白鐘学園' : n.area;
  $('location-name').textContent = mode === 'map' ? '学園の地図' : n.name;
  $('location-meta').textContent = `${s.unlocked.length} 地点を解放 ／ ${s.found.length} 件を発見`;
  $('scene-label').textContent =
    mode === 'map'
      ? 'MAP / CONNECTIONS'
      : `SCENE / ${String(nodes.indexOf(n) + 1).padStart(2, '0')}`;
  $('scene-hint').textContent =
    mode === 'map'
      ? '解放済みの地点へは、未訪問でも移動できる。'
      : '白い人型を調べ、発見の瞬間を再現する。';
  $('stage').setAttribute(
    'aria-label',
    mode === 'map'
      ? '白黒の学園地図。移動は右の地点一覧からも行えます。'
      : `${n.name}の白黒の情景。${n.description}`,
  );
  $('message').textContent =
    message ||
    (mode === 'map'
      ? '輪郭のある場所を選ぶ。まだ訪れていない場所にも、直接移動できる。'
      : n.description);
  $('app').classList.toggle('mode-map', mode === 'map');
  for (const id of ['explore', 'map']) {
    const selected = mode === id;
    $(`${id}-tab`).classList.toggle('selected', selected);
    $(`${id}-tab`).setAttribute('aria-pressed', selected);
  }
  scene?.show(s, mode);
  renderCommands();
}
function travel(id, jump = false) {
  run(() => {
    engine.travel(id, { jump });
    mode = 'explore';
    sound();
    save();
    render();
  });
}
function markerAction(id) {
  run(() => {
    const m = engine.markers.get(id),
      seen = engine.state.seenMarkers.includes(id),
      c = engine.discover(id);
    save();
    if (seen) {
      startReplay(c.id);
      return;
    }
    render(
      `白い人型を確かめた。${c.label}。\nこの場所に焼き付いた、事件が知られた瞬間を再現できる。`,
    );
    sound();
  });
}
function renderCommands() {
  const root = $('commands');
  root.replaceChildren();
  const group = (text) => root.append(el('p', text, 'command-group'));
  const command = (title, detail, fn, { disabled = false, obtained = false } = {}) => {
    const b = button('', fn, `command ${disabled ? 'locked' : ''} ${obtained ? 'obtained' : ''}`);
    b.append(el('span', title), el('small', detail));
    b.disabled = disabled;
    root.append(b);
    return b;
  };
  if (mode === 'map') {
    $('command-title').textContent = '移動先を選ぶ';
    $('command-count').textContent = `${engine.state.unlocked.length} PLACES`;
    for (const area of [...new Set(nodes.map((n) => n.area))]) {
      const list = nodes.filter((n) => n.area === area && engine.state.unlocked.includes(n.id));
      if (!list.length) continue;
      root.append(el('h3', area, 'map-list-area'));
      for (const n of list)
        command(n.name, engine.state.visited.includes(n.id) ? '訪問済' : '未訪問', () =>
          travel(n.id, true),
        );
    }
    return;
  }
  const n = engine.nodes.get(engine.state.node),
    ms = markers.filter((m) => m.node === n.id);
  $('command-title').textContent = '調査する';
  $('command-count').textContent = 'COMMAND';
  if (ms.length) {
    group('発見の痕跡');
    for (const m of ms) {
      const seen = engine.state.seenMarkers.includes(m.id);
      command(
        `${seen ? '再現する' : '人型を調べる'}：${label(m.caseId)}`,
        seen ? '再生 →' : '未調査',
        () => markerAction(m.id),
      );
    }
  }
  const evidence = engine.availableEvidence();
  if (evidence.length) {
    group('調べる');
    for (const r of evidence) {
      const got = engine.state.records.includes(r.id);
      command(
        r.title,
        got ? '確認済' : '調べる →',
        () =>
          run(() => {
            const result = engine.collect(r.id);
            sound();
            save();
            render(r.text + unlockedMessage(result.unlocked));
            if (result.unlocked.length) toast(`${result.unlocked.length} 地点の輪郭が現れた。`);
          }),
        { obtained: got },
      );
    }
  }
  if (!ms.length && !evidence.length)
    root.append(el('p', 'この場所に新しい痕跡は見つからない。', 'empty'));
  group('移動する');
  for (const id of n.exits) {
    const target = engine.nodes.get(id),
      open = engine.state.unlocked.includes(id);
    command(open ? target.name : '輪郭のない通路', open ? '移動 →' : '未解放', () => travel(id), {
      disabled: !open,
    });
  }
  if (ms.some((m) => engine.state.found.includes(m.caseId)))
    command('この現場のリポートを開く', '記入 →', () =>
      showReports(ms.find((m) => engine.state.found.includes(m.caseId)).caseId),
    );
}
function startReplay(id) {
  if (!engine.canReplay(id)) return;
  const c = engine.cases.get(id);
  activeReplay = { id, line: 0 };
  $('replay-title').textContent = c.label;
  $('replay-context').textContent = c.discoveryAt
    ? `発見が周知された場面 ／ 発言時刻 ${c.discoveryAt}`
    : '人の声が途絶えた現場 ／ 客観的な再現';
  showReplayLine();
  if (!replay.open) replay.showModal();
  $('next-line').focus();
  sound('replay');
}
function showReplayLine() {
  const c = engine.cases.get(activeReplay.id),
    l = c.lines[activeReplay.line];
  $('replay-speaker').textContent = l.speaker ? name(l.speaker) : '現場の音と痕跡';
  $('replay-text').textContent = l.text;
  $('replay-page').textContent = `${activeReplay.line + 1} / ${c.lines.length}`;
  $('next-line').textContent =
    activeReplay.line === c.lines.length - 1 ? '再現を終える →' : '次へ →';
}
$('next-line').addEventListener('click', () =>
  run(() => {
    if (!activeReplay) return;
    const c = engine.cases.get(activeReplay.id);
    if (activeReplay.line < c.lines.length - 1) {
      activeReplay.line++;
      showReplayLine();
      sound('replay');
      return;
    }
    const result = engine.finishReplay(c.id);
    activeReplay = null;
    replay.close();
    save();
    render(
      `再現を終えた。${result.added.length ? `${result.added.length} 件の証言を手帳へ記録した。` : 'この現場の記録を確かめた。'}\n新たに調べられる痕跡がないか、周囲を確かめよう。${unlockedMessage(result.unlocked)}`,
    );
    if (result.added.length || result.unlocked.length)
      toast(
        `証言 ${result.added.length} 件を記録${result.unlocked.length ? ` ／ ${result.unlocked.length} 地点を解放` : ''}`,
      );
  }),
);
$('stop-replay').addEventListener('click', () => {
  activeReplay = null;
  replay.close();
});
replay.addEventListener('cancel', () => {
  activeReplay = null;
});
function openBook(title, kicker = 'INVESTIGATION ARCHIVE') {
  $('book-title').textContent = title;
  $('book-kicker').textContent = kicker;
  $('book-content').replaceChildren();
  if (!book.open) book.showModal();
  return $('book-content');
}
$('close-book').addEventListener('click', () => book.close());
function selectField(text, values, value, onChange) {
  const l = el('label', text);
  const select = el('select');
  for (const [v, t] of values) {
    const o = el('option', t);
    o.value = v;
    select.append(o);
  }
  select.value = value || '';
  select.addEventListener('change', () => onChange(select.value));
  l.append(select);
  return l;
}
function showJournal(filters = { kind: '', caseId: '', speaker: '', order: 'case' }) {
  const root = openBook('証拠と証言');
  root.append(
    el(
      'p',
      '証拠は実際に残った事実。証言は、その人が述べた言葉。発言時刻は、話題にした出来事の時刻とは限らない。',
      'section-note',
    ),
  );
  const controls = el('div', null, 'filters');
  const refresh = (key, value) => showJournal({ ...filters, [key]: value });
  controls.append(
    selectField(
      '種類',
      [
        ['', 'すべて'],
        ['evidence', '証拠'],
        ['testimony', '証言'],
      ],
      filters.kind,
      (v) => refresh('kind', v),
    ),
    selectField(
      '事件',
      [['', 'すべての事件'], ...engine.state.found.map((id) => [id, label(id)])],
      filters.caseId,
      (v) => refresh('caseId', v),
    ),
    selectField(
      '人物別・発言時刻順',
      [['', 'すべての人物'], ...people.map((p) => [p.id, p.name])],
      filters.speaker,
      (v) => refresh('speaker', v),
    ),
  );
  controls.append(
    selectField(
      '表示順',
      [
        ['case', '事件ごと'],
        ['person', '人物・発言時刻順'],
      ],
      filters.order || 'case',
      (v) => refresh('order', v),
    ),
  );
  root.append(controls);
  const list = engine.getRecords({
      kind: filters.kind || null,
      caseId: filters.caseId || null,
      speaker: filters.speaker || null,
    }),
    grid = el('div', null, 'archive-cards');
  if (!filters.speaker) {
    if (filters.order === 'person')
      list.sort(
        (a, b) =>
          (a.speaker || 'zzz').localeCompare(b.speaker || 'zzz') ||
          (a.spokenAt || '99:99').localeCompare(b.spokenAt || '99:99'),
      );
    else
      list.sort(
        (a, b) =>
          (a.cases.find((id) => engine.state.found.includes(id)) || '').localeCompare(
            b.cases.find((id) => engine.state.found.includes(id)) || '',
          ) ||
          a.kind.localeCompare(b.kind) ||
          (a.spokenAt || '99:99').localeCompare(b.spokenAt || '99:99'),
      );
  }
  if (!list.length) root.append(el('p', 'この条件に該当する記録は、まだ取得していない。', 'empty'));
  for (const r of list) {
    const related = r.cases.filter((id) => engine.state.found.includes(id));
    const card = el('article', null, 'record-card');
    card.append(
      el(
        'span',
        r.kind === 'evidence' ? '証拠 / FACT' : '証言 / STATEMENT',
        `record-type ${r.kind}`,
      ),
      el(
        'h3',
        r.kind === 'testimony' ? `${name(r.speaker)}　${r.spokenAt || '時刻不明'}` : r.title,
      ),
      el('p', r.text),
      el(
        'p',
        `${engine.nodes.get(r.node).name} ／ ${r.source || '現場の調査'}${related.length ? ' ／ ' + related.map(label).join('・') : ''}`,
        'source',
      ),
    );
    grid.append(card);
  }
  root.append(grid);
}
function showReports(onlyId = '') {
  const root = openBook('死亡リポート', 'REPORT / FOUR FIELDS, THREE RECORDS');
  root.append(
    el(
      'p',
      '被害者・死因・凶器の個体・加害者を記す。正しいリポートが任意の三件そろうと確定する。未確定の回答は自由に修正できる。39件確定後は最後の一件を単独で照合する。',
      'section-note',
    ),
  );
  const actions = el('div', null, 'report-actions'),
    result = el('p', '仮説は記入のたびに保存されます。');
  result.id = 'report-result';
  result.setAttribute('aria-live', 'polite');
  actions.append(
    button('リポートを照合する', () => checkReports(onlyId), 'primary'),
    button(onlyId ? '全事件を表示' : '未確定だけ表示', () => showReports(onlyId ? '' : 'pending')),
    result,
  );
  root.append(actions);
  if (engine.state.confirmed.length === 40) {
    const banner = el('div', null, 'end-banner');
    banner.append(el('p', '四十人の記録が確定した。'), button('最終出席簿を閉じる', showEnding));
    root.append(banner);
  }
  const grid = el('div', null, 'report-grid');
  root.append(grid);
  const list = engine.state.found.filter(
    (id) =>
      !onlyId || (onlyId === 'pending' ? !engine.state.confirmed.includes(id) : id === onlyId),
  );
  if (!list.length)
    grid.append(el('p', 'まだ記入できる事件がない。人型を調べて事件を記録しよう。', 'empty'));
  for (const id of list) {
    const c = engine.cases.get(id),
      confirmed = engine.state.confirmed.includes(id),
      report = engine.state.reports[id] || {};
    const card = el('article', null, `report-card ${confirmed ? 'confirmed' : ''}`);
    card.dataset.case = id;
    card.append(
      el('span', `記録 ${id.slice(-2)} ／ ${engine.nodes.get(c.node).name}`, 'eyebrow'),
      el('h3', c.label),
    );
    const fields = el('div', null, 'fields');
    const types = [
      ['victim', '被害者', people.map((p) => [p.id, p.name])],
      ['cause', '死因', causes.map((x) => [x, x])],
      ['weapon', '凶器・設備', weapons.map((w) => [w.id, w.name])],
      ['killer', '加害者', [...people.map((p) => [p.id, p.name]), ['none', 'なし（事故）']]],
    ];
    for (const [key, title, values] of types) {
      const field = el('div', null, 'field');
      const l = selectField(title, [['', '未記入'], ...values], report[key], (v) =>
        run(() => {
          engine.setReport(id, { [key]: v });
          save();
          checkReports(onlyId, true);
        }),
      );
      const sel = l.querySelector('select');
      sel.disabled = confirmed;
      sel.dataset.field = key;
      sel.setAttribute('aria-label', `${c.label}：${title}`);
      field.append(l);
      fields.append(field);
    }
    card.append(
      fields,
      button(
        'この事件の証拠・証言',
        () => showJournal({ kind: '', caseId: id, speaker: '' }),
        'crosslink',
      ),
    );
    grid.append(card);
  }
}
function checkReports(onlyId = '', automatic = false) {
  const result = engine.checkReports();
  save();
  if (result.confirmed.length) {
    sound('confirm');
    render(`${result.confirmed.length} 件のリポートが確定した。`);
    showReports(onlyId);
    $('report-result').textContent = `${result.confirmed.length} 件が確定した。`;
    toast(`${result.confirmed.length} 件の記録が確定した。`);
    if (result.complete) showEnding();
  } else if (!automatic)
    $('report-result').textContent = '新たに確定した記録はない。調査を続けよう。';
}
function showPeople() {
  const root = openBook('四十人の生徒名簿', 'CLASS REGISTER');
  root.append(
    el(
      'p',
      '開幕の点呼に残された氏名と活動。武器の所持者は受渡しによって変わる。名札や衣装だけで身元を決めないように。',
      'section-note',
    ),
  );
  const grid = el('div', null, 'roster');
  for (const p of people) {
    const card = el('article', null, 'person');
    card.append(
      el('span', `出席番号 ${p.id.slice(1)}`),
      el('h3', p.name),
      el('p', p.role),
      button(
        '証言を見る',
        () => showJournal({ kind: 'testimony', caseId: '', speaker: p.id }),
        'crosslink',
      ),
    );
    grid.append(card);
  }
  root.append(grid);
}
function showSettings() {
  const root = openBook('調査の手引き・保存');
  root.className = 'guide';
  const sections = [
    [
      '残された空間',
      'ここには時間の流れがない。以前と以後の事実が同じ場所に残る。痕跡が並んで見えても、同時に起きたとは限らない。',
    ],
    [
      '調べる・再現する',
      '人型を調べると、その事件をリポートへ記入できる。再現を最後まで読むと証言を取得する。再現後に調査できる証拠もある。',
    ],
    [
      '移動する',
      '通路のコマンドは接続された解放済みの場所へ移動する。地図からは、解放済みなら未訪問でも移動できる。新しい場所の手掛かりは証拠と証言に残る。',
    ],
    [
      '操作',
      'ボタン・選択欄をクリック、またはタップ。Tabで項目を移動し、Enterで決定する。手帳と再現はEscapeでも閉じられる。音は右下で切り替える。',
    ],
    [
      'リポート',
      '凶器はW番号などの個体まで選ぶ。事故の加害者と凶器には「なし」を選ぶ。三件そろうまでは部分的な正誤は示されない。未確定の間は何度でも書き直せる。',
    ],
  ];
  for (const [h, p] of sections) root.append(el('h3', h), el('p', p));
  root.append(el('h3', '自分のメモ'));
  const notes = el('textarea');
  notes.value = engine.state.notes;
  notes.maxLength = 50000;
  notes.setAttribute('aria-label', '調査メモ');
  notes.placeholder = '気になった人物、矛盾、確かめたい場所…';
  notes.addEventListener('input', () => {
    engine.state.notes = notes.value;
    save();
  });
  root.append(notes);
  const actions = el('div', null, 'actions');
  actions.append(
    button('セーブを書き出す', () => {
      const url = URL.createObjectURL(
        new Blob([engine.exportSave()], { type: 'application/json' }),
      );
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hakusho-investigation.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }),
    button('セーブを読み込む', () => input.click()),
  );
  const input = el('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.hidden = true;
  input.addEventListener('change', async () => {
    const f = input.files[0];
    if (!f) return;
    if (f.size > 1_000_000) {
      toast('セーブファイルが大きすぎます。');
      return;
    }
    try {
      const raw = await f.text();
      const candidate = new Investigation();
      candidate.loadSave(raw);
      if (!window.confirm('現在の調査を、選んだセーブに置き換えますか？')) return;
      engine.loadSave(raw);
      mode = 'explore';
      save();
      render();
      book.close();
      toast('調査記録を読み込みました。');
    } catch (e) {
      toast(e.message);
    }
  });
  root.append(
    actions,
    input,
    el(
      'small',
      '自動保存はこの端末・このブラウザに保存されます。別の端末へ移す前に書き出してください。',
    ),
  );
  const danger = el('div', null, 'danger');
  danger.append(
    button('調査を最初からやり直す', () => {
      if (!window.confirm('現在の調査記録を消して、正門からやり直しますか？')) return;
      engine.reset();
      mode = 'explore';
      save();
      render();
      book.close();
      showIntro();
    }),
  );
  root.append(danger);
}
function showIntro() {
  const root = openBook('白鐘学園・最終出席簿', 'PROLOGUE / 白い輪郭');
  root.className = 'onboarding';
  root.append(el('p', '四十人の最期を、記録する。', 'cover-line'));
  for (const p of intro) root.append(el('p', p));
  if (restoreWarning) root.append(el('p', restoreWarning));
  root.append(
    button(
      '調査を始める →',
      () => {
        engine.state.started = true;
        save();
        book.close();
        render('校門に残された調査資料を調べよう。');
      },
      'primary',
    ),
  );
}
function showEnding() {
  const root = openBook('最終出席簿', 'EPILOGUE / 40 RECORDS');
  root.className = 'ending';
  for (const p of ending) root.append(el('p', p));
  root.append(button('記録を読み返す', () => showReports(), 'primary'));
}
// Clear presentation class whenever another book section replaces its content.
const observer = new MutationObserver(() => {
  if (
    !['調査の手引き・保存', '白鐘学園・最終出席簿', '最終出席簿'].includes(
      $('book-title').textContent,
    )
  )
    $('book-content').className = '';
});
observer.observe($('book-title'), { childList: true });
$('explore-tab').addEventListener('click', () => {
  mode = 'explore';
  render();
});
$('map-tab').addEventListener('click', () => {
  mode = 'map';
  render();
});
$('journal-tab').addEventListener('click', () => showJournal());
$('reports-tab').addEventListener('click', () => showReports());
$('people-tab').addEventListener('click', showPeople);
$('settings-tab').addEventListener('click', showSettings);
$('sound-toggle').addEventListener('click', () => {
  muted = !muted;
  $('sound-toggle').textContent = `音：${muted ? '切' : '入'}`;
  $('sound-toggle').setAttribute('aria-pressed', !muted);
  sound();
});
const archive = new ArchiveScene(
  (s) => {
    scene = s;
    document.querySelector('.loading')?.remove();
    render();
    if (!engine.state.started) showIntro();
    else if (restoreWarning) toast(restoreWarning);
  },
  markerAction,
  (id) => travel(id, true),
);
async function boot() {
  // Canvas text does not automatically reflow when a web font arrives.
  const glyphs =
    nodes.map((n) => n.name).join('') +
    '白鐘学園残された場所解放現在地未訪問確定済再現する人型を調べる未解放訪問済白い線解放された接続場所を選んで移動';
  await Promise.all([
    document.fonts.load('16px "Noto Sans JP"', glyphs),
    document.fonts.load('23px "Noto Serif JP"', '白鐘学園残された場所'),
  ]);
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'stage',
    width: 1280,
    height: 720,
    backgroundColor: '#171717',
    scene: [archive],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true },
    audio: { noAudio: true },
    fps: { target: 30 },
    banner: false,
  });
}
boot().catch((error) => {
  document.querySelector('.loading').textContent =
    '景色の読込みに失敗しました。ページを再読込みしてください。';
  console.error(error);
});
window.addEventListener('pagehide', () => {
  if (engine.state.started) save();
});

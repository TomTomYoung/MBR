import { gameData } from './data/game.js';
import { solutions } from './data/solutions.js';

export const SAVE_VERSION = 1;
const ids = (items) => new Map(items.map((x) => [x.id, x]));
export class Investigation {
  constructor(data = gameData, answers = solutions) {
    this.data = data;
    this.answers = answers;
    this.nodes = ids(data.nodes);
    this.records = ids(data.records);
    this.cases = ids(data.cases);
    this.markers = ids(data.markers);
    this.state = this.fresh();
  }
  fresh() {
    return {
      version: SAVE_VERSION,
      node: 'gate',
      unlocked: ['gate'],
      visited: ['gate'],
      found: [],
      seenMarkers: [],
      replayed: [],
      records: [],
      reports: {},
      confirmed: [],
      notes: '',
      started: false,
    };
  }
  reset() {
    this.state = this.fresh();
  }
  refresh() {
    const before = new Set(this.state.unlocked);
    for (const n of this.data.nodes)
      if (!n.requiresAny.length || n.requiresAny.some((id) => this.state.records.includes(id))) {
        if (!this.state.unlocked.includes(n.id)) this.state.unlocked.push(n.id);
      }
    return this.state.unlocked.filter((id) => !before.has(id));
  }
  travel(node, { jump = false } = {}) {
    if (!this.nodes.has(node) || !this.state.unlocked.includes(node))
      throw new Error('まだ輪郭のない場所へは移動できない。');
    if (!jump && !this.nodes.get(this.state.node).exits.includes(node))
      throw new Error('ここから直接は移動できない。');
    this.state.node = node;
    if (!this.state.visited.includes(node)) this.state.visited.push(node);
  }
  discover(markerId) {
    const m = this.markers.get(markerId);
    if (!m || m.node !== this.state.node) throw new Error('その人型はここにはない。');
    if (!this.state.seenMarkers.includes(m.id)) this.state.seenMarkers.push(m.id);
    if (!this.state.found.includes(m.caseId)) this.state.found.push(m.caseId);
    return this.cases.get(m.caseId);
  }
  availableEvidence() {
    return this.data.records.filter(
      (r) =>
        r.kind === 'evidence' &&
        r.node === this.state.node &&
        (!r.requiresFound || this.state.found.includes(r.requiresFound)) &&
        (!r.requiresReplay || this.state.replayed.includes(r.requiresReplay)),
    );
  }
  collect(recordId) {
    const r = this.availableEvidence().find((r) => r.id === recordId);
    if (!r) throw new Error('まだこの痕跡を調べることはできない。');
    if (!this.state.records.includes(r.id)) this.state.records.push(r.id);
    return { record: r, unlocked: this.refresh() };
  }
  canReplay(caseId) {
    return (
      this.state.found.includes(caseId) &&
      this.data.markers.some((m) => m.caseId === caseId && m.node === this.state.node)
    );
  }
  finishReplay(caseId) {
    if (!this.canReplay(caseId)) throw new Error('この場所からその再現は始められない。');
    const c = this.cases.get(caseId);
    const added = [];
    for (const id of c.testimony)
      if (!this.state.records.includes(id)) {
        this.state.records.push(id);
        added.push(id);
      }
    if (!this.state.replayed.includes(caseId)) this.state.replayed.push(caseId);
    return { added, unlocked: this.refresh() };
  }
  setReport(caseId, patch) {
    if (!this.state.found.includes(caseId) || this.state.confirmed.includes(caseId))
      throw new Error('このリポートは編集できない。');
    const allowed = {
      victim: this.data.people.map((x) => x.id),
      killer: [...this.data.people.map((x) => x.id), 'none'],
      cause: this.data.causes,
      weapon: this.data.weapons.map((x) => x.id),
    };
    for (const [key, value] of Object.entries(patch))
      if (!allowed[key] || (value !== '' && !allowed[key].includes(value)))
        throw new Error('回答候補にない値です。');
    this.state.reports[caseId] = { ...this.state.reports[caseId], ...patch };
  }
  isCorrect(id) {
    return (
      Object.entries(this.answers[id] || {}).length === 4 &&
      Object.entries(this.answers[id]).every(([k, v]) => this.state.reports[id]?.[k] === v)
    );
  }
  checkReports() {
    const correct = this.state.found.filter(
      (id) => !this.state.confirmed.includes(id) && this.isCorrect(id),
    );
    const confirmed = [];
    while (correct.length >= 3) confirmed.push(...correct.splice(0, 3));
    if (
      this.state.confirmed.length + confirmed.length === this.data.cases.length - 1 &&
      correct.length === 1
    )
      confirmed.push(correct.shift());
    this.state.confirmed.push(...confirmed);
    return { confirmed, complete: this.state.confirmed.length === this.data.cases.length };
  }
  getRecords({ kind = null, caseId = null, speaker = null } = {}) {
    return this.state.records
      .map((id) => this.records.get(id))
      .filter(
        (r) =>
          (!kind || r.kind === kind) &&
          (!caseId || r.cases.includes(caseId)) &&
          (!speaker || r.speaker === speaker),
      )
      .sort(
        (a, b) =>
          (a.spokenAt || '99:99').localeCompare(b.spokenAt || '99:99') || a.id.localeCompare(b.id),
      );
  }
  exportSave() {
    return JSON.stringify(this.state, null, 2);
  }
  loadSave(text) {
    let s;
    try {
      s = JSON.parse(text);
    } catch {
      throw new Error('セーブの形式を読み取れません。');
    }
    if (!s || s.version !== SAVE_VERSION || !this.nodes.has(s.node))
      throw new Error('このセーブ形式には対応していません。');
    const lists = {
      unlocked: this.nodes,
      visited: this.nodes,
      found: this.cases,
      seenMarkers: this.markers,
      replayed: this.cases,
      records: this.records,
      confirmed: this.cases,
    };
    for (const [key, map] of Object.entries(lists))
      if (
        !Array.isArray(s[key]) ||
        new Set(s[key]).size !== s[key].length ||
        s[key].some((x) => !map.has(x))
      )
        throw new Error('セーブに不明な記録が含まれています。');
    if (
      typeof s.reports !== 'object' ||
      s.reports === null ||
      Array.isArray(s.reports) ||
      typeof s.notes !== 'string' ||
      s.notes.length > 50000
    )
      throw new Error('手帳のデータが壊れています。');
    if (
      !s.unlocked.includes(s.node) ||
      !s.visited.includes(s.node) ||
      s.visited.some((x) => !s.unlocked.includes(x)) ||
      s.replayed.some((x) => !s.found.includes(x)) ||
      s.confirmed.some((x) => !s.found.includes(x))
    )
      throw new Error('調査状態の対応が壊れています。');
    const prev = this.state;
    try {
      this.state = { ...this.fresh(), ...s, reports: {}, started: !!s.started };
      for (const [id, report] of Object.entries(s.reports)) {
        if (!report || typeof report !== 'object' || Array.isArray(report))
          throw new Error('回答の形式が壊れています。');
        const was = this.state.confirmed;
        this.state.confirmed = [];
        this.setReport(id, report);
        this.state.confirmed = was;
      }
      if (s.confirmed.some((id) => !this.isCorrect(id)))
        throw new Error('確定済み回答が一致しません。');
      const permitted = new Set(
        this.data.nodes
          .filter(
            (n) => !n.requiresAny.length || n.requiresAny.some((id) => s.records.includes(id)),
          )
          .map((n) => n.id),
      );
      if (s.unlocked.some((id) => !permitted.has(id))) throw new Error('解放条件が一致しません。');
      this.refresh();
    } catch (error) {
      this.state = prev;
      throw error;
    }
  }
}

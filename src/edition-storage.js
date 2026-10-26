import { Investigation } from './engine.js';
import { DEFAULT_EDITION, editions } from './data/editions.js';

export const EDITION_KEY = 'mbr-preferred-edition';
const storageWarning =
  '自動保存ができません。この画面を閉じる前に、各版のセーブを書き出してください。';

export function investigationFromSave(text) {
  let save;
  try {
    save = JSON.parse(text);
  } catch {
    throw new Error('セーブの形式を読み取れません。');
  }
  const id = save?.edition === undefined ? 1 : save.edition;
  if (typeof id !== 'number' || !editions[id])
    throw new Error('このセーブの版には対応していません。');
  const candidate = new Investigation(editions[id].data);
  candidate.loadSave(text);
  return candidate;
}

export class EditionStorage {
  constructor(storage) {
    this.storage = storage;
    this.warning = '';
    let id = DEFAULT_EDITION;
    try {
      const preferred = storage.getItem(EDITION_KEY);
      if (preferred === '1' || preferred === '2') id = Number(preferred);
    } catch {
      this.warning = storageWarning;
    }
    this.engine = new Investigation(editions[id].data);
    try {
      const saved = storage.getItem(editions[id].saveKey);
      if (saved) this.engine.loadSave(saved);
    } catch (error) {
      this.warning = `保存データを読み込めませんでした。${error.message} 新しい調査を始められます。`;
    }
    // Also retain both sessions in memory if browser storage is unavailable.
    this.sessions = new Map([[id, this.engine]]);
  }
  get edition() {
    return editions[this.engine.data.edition];
  }
  save() {
    try {
      this.storage.setItem(this.edition.saveKey, this.engine.exportSave());
      return true;
    } catch {
      this.warning = storageWarning;
      return false;
    }
  }
  activate(candidate) {
    this.warning = '';
    this.save();
    this.engine = candidate;
    this.sessions.set(candidate.data.edition, candidate);
    try {
      this.storage.setItem(EDITION_KEY, String(candidate.data.edition));
    } catch {
      this.warning = storageWarning;
    }
  }
  select(id) {
    if (!editions[id] || typeof id !== 'number') throw new Error('選択できない版です。');
    if (id === this.edition.id) return;
    let candidate = this.sessions.get(id);
    if (!candidate) {
      candidate = new Investigation(editions[id].data);
      let saved;
      try {
        saved = this.storage.getItem(editions[id].saveKey);
      } catch {
        // The memory session remains usable; activate reports write failures.
      }
      // A malformed other-edition save must not be overwritten by switching.
      if (saved) candidate.loadSave(saved);
    }
    this.activate(candidate);
  }
}

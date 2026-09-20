// Browser audio is opt-in and independent of the investigation state.
export class ArchiveAudio {
  constructor(assets, createAudio = (url) => new Audio(url)) {
    this.assets = assets;
    this.createAudio = createAudio;
    this.enabled = false;
    this.suspended = false;
    this.context = {};
    this.channels = new Map();
    this.effects = new Set();
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    this.sync();
  }
  setSuspended(suspended) {
    this.suspended = suspended;
    this.sync();
  }
  setContext(context) {
    this.context = context;
    this.sync();
  }
  start(audio) {
    try {
      const attempt = audio.play();
      attempt?.catch(() => {});
    } catch {
      // Missing media or a browser playback restriction must not block play.
    }
  }
  make(key, volume) {
    const asset = this.assets[key];
    if (!asset?.url) return null;
    const audio = this.createAudio(asset.url);
    audio.preload = 'none';
    audio.volume = volume ?? asset.volume ?? 0.7;
    audio.loop = Boolean(asset.loop);
    return audio;
  }
  sync() {
    if (!this.enabled || this.suspended) {
      for (const { audio } of this.channels.values()) audio.pause();
      this.stopEffects();
      return;
    }
    for (const channel of ['music', 'ambience']) {
      const key = this.context[channel];
      const current = this.channels.get(channel);
      if (current && current.key === key) {
        if (current.audio.paused && !current.audio.ended) this.start(current.audio);
        continue;
      }
      current?.audio.pause();
      this.channels.delete(channel);
      if (!key) continue;
      const audio = this.make(key);
      if (!audio) continue;
      this.channels.set(channel, { key, audio });
      this.start(audio);
    }
  }
  play(key) {
    if (!this.enabled || this.suspended) return;
    const audio = this.make(key);
    if (!audio) return;
    // Looping scene effects end with the current replay line via stopEffects().
    if (this.effects.size >= 6) {
      const oldest = this.effects.values().next().value;
      oldest.pause();
      this.effects.delete(oldest);
    }
    this.effects.add(audio);
    const finish = () => this.effects.delete(audio);
    audio.addEventListener('ended', finish, { once: true });
    audio.addEventListener('error', finish, { once: true });
    this.start(audio);
  }
  stopEffects() {
    for (const audio of this.effects) audio.pause();
    this.effects.clear();
  }
}

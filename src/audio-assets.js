const urls = import.meta.glob('../assets/audio/*/*.ogg', {
  query: '?url',
  import: 'default',
  eager: true,
});

export const audioAssets = {
  investigation: { url: urls['../assets/audio/bgm/investigation.ogg'], loop: true, volume: 0.45 },
  reconstruction: { url: urls['../assets/audio/bgm/reconstruction.ogg'], loop: true, volume: 0.45 },
  deduction: { url: urls['../assets/audio/bgm/deduction.ogg'], loop: true, volume: 0.45 },
  'final-attendance': {
    url: urls['../assets/audio/bgm/final-attendance.ogg'],
    loop: false,
    volume: 0.45,
  },
  'island-wind': {
    url: urls['../assets/audio/ambience/island-wind.ogg'],
    loop: true,
    volume: 0.42,
  },
  'empty-school': {
    url: urls['../assets/audio/ambience/empty-school.ogg'],
    loop: true,
    volume: 0.42,
  },
  'ui-cursor': { url: urls['../assets/audio/sfx/ui-cursor.ogg'], loop: false, volume: 0.7 },
  'ui-confirm': { url: urls['../assets/audio/sfx/ui-confirm.ogg'], loop: false, volume: 0.7 },
  'ui-back': { url: urls['../assets/audio/sfx/ui-back.ogg'], loop: false, volume: 0.7 },
  'notebook-open': { url: urls['../assets/audio/sfx/notebook-open.ogg'], loop: false, volume: 0.7 },
  'evidence-record': {
    url: urls['../assets/audio/sfx/evidence-record.ogg'],
    loop: false,
    volume: 0.7,
  },
  'testimony-record': {
    url: urls['../assets/audio/sfx/testimony-record.ogg'],
    loop: false,
    volume: 0.7,
  },
  'replay-enter': { url: urls['../assets/audio/sfx/replay-enter.ogg'], loop: false, volume: 0.7 },
  'replay-exit': { url: urls['../assets/audio/sfx/replay-exit.ogg'], loop: false, volume: 0.7 },
  'report-confirm': {
    url: urls['../assets/audio/sfx/report-confirm.ogg'],
    loop: false,
    volume: 0.7,
  },
  'all-confirmed': { url: urls['../assets/audio/sfx/all-confirmed.ogg'], loop: false, volume: 0.7 },
  footsteps: { url: urls['../assets/audio/sfx/footsteps.ogg'], loop: false, volume: 0.7 },
  'door-latch': { url: urls['../assets/audio/sfx/door-latch.ogg'], loop: false, volume: 0.7 },
  'bed-drag': { url: urls['../assets/audio/sfx/bed-drag.ogg'], loop: false, volume: 0.7 },
  'water-drips': { url: urls['../assets/audio/sfx/water-drips.ogg'], loop: false, volume: 0.7 },
  'water-splash': { url: urls['../assets/audio/sfx/water-splash.ogg'], loop: false, volume: 0.7 },
  'broadcast-chime': {
    url: urls['../assets/audio/sfx/broadcast-chime.ogg'],
    loop: false,
    volume: 0.7,
  },
  'distant-gunshot': {
    url: urls['../assets/audio/sfx/distant-gunshot.ogg'],
    loop: false,
    volume: 0.7,
  },
  'mechanism-stop': {
    url: urls['../assets/audio/sfx/mechanism-stop.ogg'],
    loop: false,
    volume: 0.7,
  },
};

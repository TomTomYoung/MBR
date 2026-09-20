import Phaser from 'phaser';
import { nodes, edges, markers } from './data/game.js';
const images = import.meta.glob('../assets/scenes/*.{png,svg}', {
  query: '?url',
  import: 'default',
  eager: true,
});
export class ArchiveScene extends Phaser.Scene {
  constructor(onReady, onMarker, onTravel) {
    super('Archive');
    this.onReady = onReady;
    this.onMarker = onMarker;
    this.onTravel = onTravel;
    this.view = null;
  }
  preload() {
    for (const n of nodes) {
      const png = images[`../assets/scenes/${n.id}.png`];
      if (png) this.load.image(n.id, png);
      else
        this.load.svg(n.id, images[`../assets/scenes/${n.id}.svg`], { width: 1280, height: 720 });
    }
  }
  create() {
    this.layer = this.add.container();
    this.onReady(this);
  }
  show(state, mode = 'explore') {
    if (!this.layer) return;
    this.layer.removeAll(true);
    if (mode === 'map') {
      this.drawMap(state);
      return;
    }
    this.layer.add(this.add.image(640, 360, state.node).setDisplaySize(1280, 720));
    const list = markers.filter((m) => m.node === state.node);
    list.forEach((m, i) => {
      const x = 1280 * (0.28 + i * 0.23),
        y = 625 + (i % 2) * 15;
      const g = this.add.graphics({ x, y });
      g.lineStyle(9, 0x111111, 0.65);
      this.outline(g, m.part);
      g.lineStyle(3, 0xffffff, 0.94);
      this.outline(g, m.part);
      g.setRotation(-0.08).setScale(0.95, 0.65);
      this.layer.add(g);
      const seen = state.seenMarkers.includes(m.id),
        complete = state.confirmed.includes(m.caseId);
      const label = this.add
        .text(x, y + 50, complete ? '確定済' : seen ? '再現する' : '人型を調べる', {
          fontFamily: 'Noto Sans JP, sans-serif',
          fontSize: '17px',
          color: '#fff',
          backgroundColor: '#111111',
          padding: { x: 9, y: 4 },
        })
        .setOrigin(0.5);
      const zone = this.add
        .zone(x, y, 185, 150)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.onMarker(m.id));
      zone
        .on('pointerover', () => label.setStyle({ color: '#111', backgroundColor: '#eee' }))
        .on('pointerout', () => label.setStyle({ color: '#fff', backgroundColor: '#111' }));
      this.layer.add([label, zone]);
    });
  }
  outline(g, part) {
    if (part !== 'lower') {
      g.strokeEllipse(-64, -2, 30, 25);
      g.beginPath();
      g.moveTo(-47, -9);
      g.lineTo(-30, -26);
      g.lineTo(5, -24);
      g.lineTo(30, -48);
      g.lineTo(39, -43);
      g.lineTo(12, -7);
      g.lineTo(-8, 0);
      g.moveTo(-44, 10);
      g.lineTo(-20, 30);
      g.lineTo(15, 35);
      g.lineTo(17, 26);
      g.lineTo(-10, 18);
      g.lineTo(-10, 6);
      g.strokePath();
    }
    if (part !== 'upper') {
      g.beginPath();
      g.moveTo(-8, 0);
      g.lineTo(25, -13);
      g.lineTo(70, -1);
      g.lineTo(108, -17);
      g.lineTo(116, -9);
      g.lineTo(74, 12);
      g.lineTo(32, 4);
      g.lineTo(55, 29);
      g.lineTo(99, 44);
      g.lineTo(96, 54);
      g.lineTo(48, 41);
      g.lineTo(5, 19);
      g.lineTo(-10, 6);
      g.strokePath();
    }
  }
  drawMap(state) {
    const g = this.add.graphics();
    this.layer.add(g);
    g.fillStyle(0x151515);
    g.fillRect(0, 0, 1280, 720);
    for (let x = 35; x < 1280; x += 28) {
      g.lineStyle(1, 0x242424);
      g.lineBetween(x, 0, x, 720);
    }
    for (let y = 20; y < 720; y += 28) g.lineBetween(0, y, 1280, y);
    const lookup = new Map(nodes.map((n) => [n.id, n]));
    for (const [a, b] of edges) {
      const n = lookup.get(a),
        m = lookup.get(b),
        open = state.unlocked.includes(a) && state.unlocked.includes(b);
      g.lineStyle(open ? 3 : 1, open ? 0xaaaaaa : 0x363636);
      g.lineBetween(n.x, n.y, m.x, m.y);
    }
    this.layer.add(
      this.add.text(25, 24, '白鐘学園 ／ 残された場所', {
        fontFamily: 'Noto Serif JP, serif',
        fontSize: '23px',
        color: '#eee',
      }),
    );
    this.layer.add(
      this.add
        .text(1250, 27, `解放 ${state.unlocked.length} / ${nodes.length}`, {
          fontFamily: 'Noto Sans JP, sans-serif',
          fontSize: '17px',
          color: '#bbb',
        })
        .setOrigin(1, 0),
    );
    for (const n of nodes) {
      const unlocked = state.unlocked.includes(n.id),
        current = n.id === state.node;
      const box = this.add
        .rectangle(n.x, n.y, 127, 52, current ? 0xe6e6e2 : unlocked ? 0x252525 : 0x171717)
        .setStrokeStyle(current ? 3 : 1, unlocked ? 0xbdbdb8 : 0x454545);
      const text = this.add
        .text(n.x, n.y - 4, unlocked ? n.name : '未解放', {
          fontFamily: 'Noto Sans JP, sans-serif',
          fontSize: n.name.length > 7 ? '13px' : '16px',
          color: current ? '#111' : unlocked ? '#eee' : '#666',
        })
        .setOrigin(0.5);
      const sub = this.add
        .text(
          n.x,
          n.y + 17,
          current ? '現在地' : unlocked ? (state.visited.includes(n.id) ? '訪問済' : '未訪問') : '',
          {
            fontFamily: 'Noto Sans JP, sans-serif',
            fontSize: '10px',
            color: current ? '#444' : '#aaa',
          },
        )
        .setOrigin(0.5);
      if (unlocked) {
        box.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.onTravel(n.id));
        box
          .on('pointerover', () => box.setStrokeStyle(3, 0xffffff))
          .on('pointerout', () => box.setStrokeStyle(current ? 3 : 1, 0xbdbdb8));
      }
      this.layer.add([box, text, sub]);
    }
    this.layer.add(
      this.add.text(25, 675, '白い線：解放された接続　／　場所を選んで移動', {
        fontFamily: 'Noto Sans JP, sans-serif',
        fontSize: '16px',
        color: '#aaa',
      }),
    );
  }
}

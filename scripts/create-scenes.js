import { writeFileSync, mkdirSync } from 'node:fs';
import { nodes } from '../src/data/world.js';
mkdirSync('assets/scenes', { recursive: true });
const line = (x, y, a, b, w = 2) =>
  `<path d="M${x} ${y}L${a} ${b}" fill="none" stroke="#333" stroke-width="${w}"/>`;
const rect = (x, y, w, h, fill = '#ddd') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#222" stroke-width="3"/>`;
const poly = (p, fill = '#aaa') =>
  `<polygon points="${p}" fill="${fill}" stroke="#222" stroke-width="3"/>`;
const circle = (x, y, r, fill = '#eee') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#222" stroke-width="3"/>`;
const door = (x = 820) =>
  rect(x, 180, 130, 290, '#222') +
  rect(x + 9, 189, 105, 267, 'url(#shade)') +
  circle(x + 99, 320, 4, '#fff');
const window = (x = 320, y = 180, w = 200, h = 130) =>
  rect(x, y, w, h, '#fafafa') +
  line(x + w / 2, y, x + w / 2, y + h, 5) +
  line(x, y + h / 2, x + w, y + h / 2, 5) +
  rect(x - 8, y + h, w + 16, 9, '#999');
const desk = (x = 420, y = 470, w = 220) =>
  poly(`${x},${y} ${x + 80},${y - 55} ${x + w + 80},${y - 55} ${x + w},${y}`, '#eee') +
  poly(`${x},${y} ${x + w},${y} ${x + w},${y + 15} ${x},${y + 15}`) +
  line(x + 8, y + 15, x + 8, y + 110, 7) +
  line(x + w - 8, y + 15, x + w - 8, y + 110, 7) +
  line(x + w + 70, y - 45, x + w + 70, y + 35, 6);
const shelf = (x = 330, y = 200, w = 140) =>
  rect(x, y, w, 275, '#888') +
  [0, 1, 2, 3]
    .map(
      (j) =>
        rect(x + 8, y + 12 + j * 65, w - 16, 52, '#ddd') +
        Array.from({ length: 7 }, (_, i) =>
          rect(x + 12 + i * 16, y + 19 + j * 65, 11, 44, (i + j) % 3 ? '#bbb' : '#555'),
        ).join(''),
    )
    .join('');
const bed = (x = 260, y = 500) =>
  poly(`${x},${y} ${x + 230},${y - 75} ${x + 470},${y - 45} ${x + 230},${y + 55}`, '#ddd') +
  poly(
    `${x},${y} ${x + 230},${y + 55} ${x + 470},${y - 45} ${x + 470},${y - 20} ${x + 230},${y + 85} ${x},${y + 30}`,
    '#999',
  ) +
  poly(
    `${x + 25},${y - 3} ${x + 120},${y - 32} ${x + 260},${y - 12} ${x + 170},${y + 22}`,
    '#fafafa',
  ) +
  line(x, y, x, y + 110, 7) +
  line(x + 230, y + 55, x + 230, y + 150, 7) +
  line(x + 470, y - 40, x + 470, y + 55, 7);
const cabinet = (x, y, w = 160) =>
  rect(x, y, w, 270, '#aaa') +
  rect(x + 8, y + 9, w / 2 - 12, 250, 'url(#shade)') +
  rect(x + w / 2 + 4, y + 9, w / 2 - 12, 250, 'url(#shade)') +
  circle(x + w / 2 - 18, y + 120, 3) +
  circle(x + w / 2 + 16, y + 120, 3);
const piano = () =>
  poly('320,450 400,345 685,345 760,455', ' #222') +
  rect(340, 450, 405, 38, '#eee') +
  Array.from(
    { length: 27 },
    (_, i) =>
      rect(344 + i * 14, 455, 13, 29, '#eee') +
      (i % 7 !== 2 && i % 7 !== 6 ? rect(353 + i * 14, 451, 8, 18, '#222') : ''),
  ).join('') +
  line(355, 489, 355, 575, 12) +
  line(726, 488, 726, 575, 12) +
  rect(450, 378, 145, 60, 'url(#shade)');
const pipes = () =>
  [0, 1, 2]
    .map(
      (i) =>
        line(700 + i * 33, 140, 700 + i * 33, 385, 13) +
        line(700 + i * 33, 385, 900, 385 + i * 33, 11) +
        circle(705 + i * 33, 335, 15, '#555'),
    )
    .join('');
const monitor = (x = 430, y = 300) =>
  rect(x, y, 170, 110, '#222') +
  rect(x + 10, y + 10, 150, 85, 'url(#screen)') +
  rect(x + 70, y + 110, 30, 35, '#333');
const crates = () =>
  [0, 1, 2, 3, 4, 5]
    .map(
      (i) =>
        rect(320 + (i % 3) * 130, 460 - Math.floor(i / 3) * 100, 125, 95, i % 2 ? '#aaa' : '#ccc') +
        line(
          330 + (i % 3) * 130,
          465 - Math.floor(i / 3) * 100,
          430 + (i % 3) * 130,
          540 - Math.floor(i / 3) * 100,
        ),
    )
    .join('');
const clock = () =>
  circle(600, 265, 120, '#eee') +
  Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return line(
      600 + Math.sin(a) * 98,
      265 - Math.cos(a) * 98,
      600 + Math.sin(a) * 112,
      265 - Math.cos(a) * 112,
      4,
    );
  }).join('') +
  line(600, 265, 600, 190, 5) +
  line(600, 265, 650, 298, 5);
function indoor(seed) {
  return (
    poly('0,0 1280,0 975,145 305,145', '#aaa') +
    poly('0,0 305,145 305,458 0,720', 'url(#shade)') +
    rect(305, 145, 670, 313, '#d8d8d8') +
    poly('975,145 1280,0 1280,720 975,458', 'url(#shade)') +
    poly('0,720 305,458 975,458 1280,720', '#bbb') +
    Array.from({ length: 13 }, (_, i) => line(640 + (i - 6) * 47, 458, (i - 2) * 155, 720, 1)).join(
      '',
    ) +
    [485, 522, 575, 647].map((y) => line(0, y, 1280, y, 1)).join('') +
    line(305, 160, 975, 160) +
    line(315, 150, 315, 450) +
    line(964, 150, 964, 450) +
    Array.from({ length: 18 }, (_, i) => line(25 + i * 70, 12, 305 + i * 34, 144, 1)).join('') +
    `<path d="M${370 + (seed % 100)},450 l25,-4 -7,-25 16,-9" fill="none" stroke="#999"/>`
  );
}
function outside(type) {
  let s =
    rect(0, 0, 1280, 720, '#e8e8e8') +
    rect(0, 0, 1280, 280, 'url(#sky)') +
    poly('0,420 530,300 1280,420 1280,720 0,720', '#bbb');
  s +=
    poly('130,150 500,210 500,428 130,505', '#bbb') +
    rect(500, 210, 520, 218, '#ddd') +
    poly('100,146 480,100 1045,195 500,217', '#444');
  for (let j = 0; j < 2; j++)
    for (let i = 0; i < 7; i++) s += window(525 + i * 68, 245 + j * 88, 42, 58);
  s += line(0, 710, 600, 430) + line(1280, 710, 690, 430) + line(0, 580, 1280, 580, 1);
  if (type === 'gate')
    s +=
      rect(215, 100, 44, 535, '#666') +
      rect(1000, 100, 44, 535, '#666') +
      rect(250, 150, 750, 28, '#222') +
      Array.from({ length: 23 }, (_, i) => line(275 + i * 31, 180, 275 + i * 31, 590, 7)).join('');
  if (type === 'roof' || type === 'walkway')
    s +=
      poly('0,570 1280,520 1280,720 0,720', '#aaa') +
      line(0, 460, 1280, 410, 9) +
      line(0, 550, 1280, 500, 5) +
      [0, 180, 400, 620, 840, 1060, 1270]
        .map((x) => line(x, 460 - x * 0.04, x, 650 - x * 0.04, 8))
        .join('');
  if (type === 'dock')
    s +=
      rect(0, 420, 1280, 300, 'url(#water)') +
      poly('320,720 520,420 680,420 960,720', '#aaa') +
      Array.from({ length: 10 }, (_, i) =>
        line(320 + i * 16, 710 - i * 29, 960 - i * 28, 710 - i * 29, 4),
      ).join('') +
      poly('520,420 540,220 690,230 680,420', 'url(#shade)');
  return s;
}
function props(type) {
  switch (type) {
    case 'lecture':
      return (
        desk(500, 360, 170) +
        rect(380, 175, 450, 145, '#333') +
        [0, 1, 2]
          .map((j) => [0, 1, 2].map((i) => desk(200 + i * 275, 485 + j * 80, 100)).join(''))
          .join('')
      );
    case 'changing':
      return (
        cabinet(330, 190, 160) +
        cabinet(505, 190, 160) +
        cabinet(680, 190, 160) +
        desk(450, 565, 240) +
        rect(855, 365, 85, 95, '#222')
      );
    case 'infirmary':
      return bed() + window() + rect(630, 78, 165, 70, '#222') + door();
    case 'medical':
    case 'aid':
      return bed(240, 480) + cabinet(760, 210) + desk(760, 570, 170);
    case 'morgue':
      return bed(50, 450) + bed(660, 450) + rect(905, 200, 60, 28, '#fff');
    case 'consult':
      return (
        desk(430, 480, 190) +
        window(335, 210, 210, 110) +
        rect(370, 492, 55, 120, '#666') +
        rect(725, 435, 50, 115, '#666') +
        door()
      );
    case 'studio':
      return (
        desk(330, 460, 470) + monitor() + monitor(650, 300) + window(830, 225, 120, 140) + door(310)
      );
    case 'theater':
      return (
        poly('240,455 325,400 950,400 1090,505', '#555') +
        rect(330, 170, 290, 228, 'url(#mirror)') +
        rect(642, 170, 300, 228, 'url(#mirror)') +
        poly('220,140 330,160 330,465 215,530', '#444') +
        poly('950,160 1080,140 1100,530 950,465', '#444') +
        line(640, 160, 640, 396, 5)
      );
    case 'wardrobe':
      return (
        cabinet(325, 190) +
        cabinet(505, 190) +
        cabinet(685, 190) +
        line(310, 515, 975, 515, 5) +
        [380, 550, 720, 890]
          .map((x) =>
            poly(`${x},330 ${x - 30},355 ${x - 40},455 ${x + 40},455 ${x + 30},355`, '#ccc'),
          )
          .join('')
      );
    case 'darkroom':
      return (
        rect(365, 190, 430, 210, 'url(#mirror)') +
        rect(780, 415, 24, 45, '#eee') +
        desk(400, 490, 250) +
        door()
      );
    case 'photo':
      return (
        window(360, 180, 480, 210) +
        rect(350, 170, 500, 230, 'url(#mirror)') +
        desk(450, 490, 230) +
        circle(620, 385, 30, '#222') +
        line(620, 410, 570, 530, 6) +
        line(620, 410, 670, 530, 6) +
        door()
      );
    case 'exhibition':
      return (
        poly('540,105 610,138 610,510 540,550', 'url(#shade)') +
        rect(670, 345, 140, 110, '#aaa') +
        line(470, 615, 925, 463, 5) +
        line(490, 623, 945, 466, 2) +
        door(340)
      );
    case 'library':
      return (
        shelf() + shelf(505) + shelf(680) + desk(230, 540, 230) + rect(865, 365, 90, 45, '#222')
      );
    case 'post':
      return (
        cabinet(340, 195, 260) +
        [0, 1, 2, 3]
          .map(
            (i) =>
              rect(360 + (i % 2) * 110, 235 + Math.floor(i / 2) * 90, 92, 55, '#777') +
              rect(368 + (i % 2) * 110, 245 + Math.floor(i / 2) * 90, 74, 8, '#222'),
          )
          .join('') +
        desk(680, 490, 160) +
        door()
      );
    case 'review':
    case 'management':
      return (
        desk(365, 485, 380) +
        rect(390, 180, 260, 165, '#eee') +
        [0, 1, 2, 3, 4, 5].map((i) => line(415, 210 + i * 21, 625, 210 + i * 21, 2)).join('') +
        cabinet(780, 190) +
        rect(460, 410, 100, 20, '#eee')
      );
    case 'cafeteria':
      return (
        rect(340, 180, 245, 170, '#333') +
        rect(620, 180, 245, 170, '#333') +
        desk(285, 445, 530) +
        desk(100, 605, 330) +
        circle(490, 395, 32) +
        rect(660, 355, 95, 43, '#bbb')
      );
    case 'equipment':
      return (
        cabinet(350, 190, 230) +
        cabinet(650, 190, 230) +
        [0, 1, 2, 3].map((i) => line(390 + i * 35, 225, 390 + i * 35, 430, 8)).join('') +
        desk(380, 540, 280)
      );
    case 'music':
      return piano() + window(725, 190, 190, 150) + rect(530, 405, 35, 90, '#eee');
    case 'store':
      return crates() + shelf(805, 190, 150) + desk(255, 580, 220);
    case 'greenhouse':
      return (
        Array.from({ length: 7 }, (_, i) => line(175 + i * 150, 700, 430 + i * 65, 100, 6)).join(
          '',
        ) +
        line(0, 270, 1280, 270, 4) +
        line(0, 400, 1280, 400, 4) +
        [0, 1, 2, 3]
          .map(
            (i) =>
              desk(220 + i * 180, 490, 140) +
              [0, 1, 2]
                .map((j) => circle(280 + i * 180 + j * 35, 410 - (j % 2) * 25, 26, '#777'))
                .join(''),
          )
          .join('') +
        rect(860, 560, 390, 150, 'url(#water)')
      );
    case 'flood':
      return (
        pipes() +
        line(305, 300, 975, 300, 3) +
        rect(440, 495, 340, 65, 'url(#shade)') +
        rect(820, 210, 100, 110, '#555')
      );
    case 'observatory':
      return (
        rect(330, 180, 415, 210, 'url(#sky)') +
        poly('350,370 440,270 580,360 700,255 740,385', '#333') +
        circle(650, 235, 27) +
        pipes() +
        desk(370, 490, 240) +
        circle(520, 407, 35, '#222')
      );
    case 'clock':
      return (
        clock() +
        door(815) +
        cabinet(345, 260, 100) +
        line(980, 70, 1080, 650, 5) +
        line(940, 75, 1040, 650, 5) +
        Array.from({ length: 12 }, (_, i) =>
          line(940 + i * 8, 80 + i * 46, 980 + i * 8, 80 + i * 46, 4),
        ).join('')
      );
    case 'gym':
      return (
        window(350, 195, 100, 180) +
        window(505, 195, 100, 180) +
        window(660, 195, 100, 180) +
        line(180, 220, 1100, 320, 15) +
        line(180, 245, 1100, 345, 5) +
        line(250, 230, 250, 620, 7) +
        line(990, 310, 990, 590, 7) +
        poly('180,650 460,500 790,500 1150,650', '#ccc')
      );
    case 'lift':
      return (
        rect(365, 165, 510, 335, '#222') +
        rect(390, 183, 460, 300, '#888') +
        Array.from({ length: 12 }, (_, i) => line(400 + i * 37, 190, 400 + i * 37, 480, 3)).join(
          '',
        ) +
        rect(905, 275, 40, 100, '#555')
      );
    case 'shelter':
      return door(350) + door(810) + desk(600, 510, 160) + rect(325, 220, 35, 45, '#222');
    case 'stairs':
      return (
        Array.from({ length: 10 }, (_, i) =>
          rect(330 + i * 25, 550 - i * 35, 470 - i * 22, 35, i % 2 ? '#bbb' : '#ddd'),
        ).join('') +
        line(850, 595, 650, 230, 9) +
        door(770)
      );
    case 'mechanism':
      return (
        poly('350,145 480,170 480,490 350,570', 'url(#shade)') +
        poly('830,170 940,145 940,570 830,490', 'url(#shade)') +
        pipes() +
        rect(540, 350, 100, 140, '#555')
      );
    case 'comms':
    case 'terminal':
      return (
        desk(330, 485, 430) +
        monitor(475, 307) +
        rect(675, 363, 80, 86, '#555') +
        Array.from({ length: 7 }, (_, i) => line(681, 370 + i * 10, 749, 370 + i * 10, 2)).join(
          '',
        ) +
        rect(405, 449, 130, 15, '#aaa') +
        door(830)
      );
    case 'tunnel':
      return (
        poly('120,720 450,180 820,180 1160,720', 'url(#shade)') +
        rect(510, 230, 230, 260, '#222') +
        pipes() +
        Array.from({ length: 8 }, (_, i) =>
          line(290 + i * 15, 650 - i * 50, 985 - i * 15, 650 - i * 50, 4),
        ).join('')
      );
    default:
      return '';
  }
}
for (const [i, node] of nodes.entries()) {
  const outdoors = ['gate', 'courtyard', 'dock', 'roof', 'walkway'].includes(node.art);
  let body = outdoors ? outside(node.art) : indoor(i * 17) + props(node.art);
  if (node.id === 'south')
    body +=
      line(1090, 340, 1110, 90, 10) +
      line(1230, 340, 1210, 90, 10) +
      line(1095, 310, 1220, 140, 4) +
      line(1225, 310, 1105, 140, 4) +
      rect(1070, 65, 180, 95, '#aaa') +
      `<ellipse cx="1160" cy="65" rx="90" ry="25" fill="#bbb" stroke="#222" stroke-width="3"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs>
 <pattern id="shade" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#888"/><path d="M0 9L9 0" stroke="#444" stroke-width="1"/></pattern>
 <pattern id="sky" width="18" height="6" patternUnits="userSpaceOnUse"><rect width="18" height="6" fill="#eee"/><path d="M0 2H14" stroke="#bbb"/></pattern>
 <pattern id="water" width="60" height="15" patternUnits="userSpaceOnUse"><rect width="60" height="15" fill="#888"/><path d="M0 3H28M33 11H58" stroke="#ddd"/></pattern>
 <pattern id="screen" width="8" height="5" patternUnits="userSpaceOnUse"><rect width="8" height="5" fill="#555"/><path d="M0 2H8" stroke="#777"/></pattern>
 <linearGradient id="mirror"><stop stop-color="#444"/><stop offset=".5" stop-color="#bbb"/><stop offset="1" stop-color="#555"/></linearGradient>
 <radialGradient id="vignette"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>
 ${body}<rect width="1280" height="720" fill="url(#vignette)"/><rect x="12" y="12" width="1256" height="696" fill="none" stroke="#eee" stroke-width="2"/><path d="M22 35V22H60M1220 22H1258V60M22 660V698H60M1220 698H1258V660" fill="none" stroke="#eee" stroke-width="3"/></svg>`;
  writeFileSync(`assets/scenes/${node.id}.svg`, svg);
}
console.log(`Generated ${nodes.length} monochrome location illustrations.`);

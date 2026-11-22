import { circle, ellipse, emblem, figure, paint, path, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Cute: soft, round and pleased to see you. A service is a cloud, a data store a jam jar, a queue
 * a caterpillar. Always light: pastel needs a pale page.
 */
const W = 6;
const ink = (k: Kit) => k.T;
const blush = (k: Kit) => k.A('rose', 'chip');
const mint = (k: Kit) => k.A('teal', 'fill');
const butter = (k: Kit) => k.A('amber', 'fill');

/** Rosy cheeks either side of a middle. */
const cheeks = (k: Kit, cx: number, cy: number, apart: number, r: number): string => circle(cx - apart, cy, r, `${paint(blush(k))} opacity="0.5"`) + circle(cx + apart, cy, r, `${paint(blush(k))} opacity="0.5"`);
/** Two eyes and a smile. */
const face = (k: Kit, cx: number, cy: number, s = 1): string =>
  circle(cx - 7 * s, cy, 2.6 * s, paint(k.T)) + circle(cx + 7 * s, cy, 2.6 * s, paint(k.T)) + path(`M${cx - 4 * s} ${cy + 5 * s}Q${cx} ${cy + 9 * s} ${cx + 4 * s} ${cy + 5 * s}`, paint('none', k.T, 2.2 * s));
const heart = (k: Kit, cx: number, cy: number, s: number): string =>
  path(`M${cx} ${cy + 5 * s}C${cx - 9 * s} ${cy - 1 * s} ${cx - 5 * s} ${cy - 8 * s} ${cx} ${cy - 3 * s}C${cx + 5 * s} ${cy - 8 * s} ${cx + 9 * s} ${cy - 1 * s} ${cx} ${cy + 5 * s}Z`, paint(blush(k)));

export const cute: Pack = {
  id: 'cute',
  name: 'Cute',
  summary: 'Soft, round and smiling: clouds, jam jars, toy blocks and a caterpillar',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 70,
  style: {
    hand: { base: 'clean' },
    general: { weight: 'bold', corners: 'round', shadow: false },
    connectors: { weight: 'bold' },
    schemes: {
      light: scheme(
        { canvas: '#fff5f8', grid: '#f6dfe7', text: '#5a3348', textMuted: '#8a6278', edge: '#b07a92', edgeText: '#8a6278', edgeLabelBg: '#ffffff', codeBg: '#fdeef3', codeBorder: '#f1cfdb' },
        {
          neutral: ['#ffffff', '#b98399', '#5a3348', '#a8607c'],
          teal: ['#e3f7f0', '#48a48d', '#1f5648', '#3f9a83'],
          blue: ['#e6f1fd', '#6397d0', '#24476e', '#4f86c2'],
          violet: ['#efe9fd', '#917cd8', '#3f2f78', '#8370cf'],
          amber: ['#fff3d1', '#b98a24', '#5e440a', '#a67c1f'],
          rose: ['#ffe3ec', '#dc5f8a', '#6b1f3c', '#cf4f7c'],
          green: ['#e9f7dc', '#67a343', '#2c4f17', '#5f9a3c'],
        },
      ),
    },
  },
  draw: {
    // A soft pill with rosy cheeks. An API wears a heart.
    serviceCard: (k, kind) =>
      rect(3, 3, 342, 126, 44, paint(k.F, k.L, W)) +
      cheeks(k, 174, 98, 126, 13) +
      (kind === 'api' ? heart(k, 44, 40, 2.2) : ''),

    // A cloud, what it does where its face would be.
    serviceGlyph: (k, kind) =>
      path('M34 94A24 24 0 0 1 24 48A28 28 0 0 1 74 24A27 27 0 0 1 116 48A23 23 0 0 1 104 94Z', paint(k.F, k.L, W)) +
      cheeks(k, 68, 76, 34, 7) +
      emblem(kind, 68, 56, 38, ink(k), 4),

    // A jam jar under a gingham lid.
    database: (k, kind) =>
      path('M40 22H100Q112 22 112 36V88Q112 103 97 103H43Q28 103 28 88V36Q28 22 40 22Z', paint(k.F, k.L, W)) +
      rect(38, 5, 64, 18, 7, paint(k.C, k.L, 4)) +
      cheeks(k, 70, 84, 28, 6) +
      emblem(kind, 70, 60, 38, ink(k), 4),

    // A caterpillar: beads in a row, a head at the front.
    queue: (k, kind) =>
      [32, 76, 120, 164, 208].map((cx, i) => circle(cx, 34, 26, paint(i % 2 ? butter(k) : mint(k), k.L, 5))).join('') +
      path('M236 12L230 2M254 12L260 2', paint('none', k.L, 3.5)) +
      circle(246, 34, 26, paint(k.F, k.L, 5)) +
      face(k, 246, 30, 1.1) +
      cheeks(k, 246, 40, 15, 5) +
      (kind === 'queue'
        ? [32, 76, 120, 164, 208].map((cx) => circle(cx, 34, 5, paint(k.C))).join('')
        : kind === 'topic'
        ? heart(k, 76, 34, 1.5) + heart(k, 120, 34, 1.5) + heart(k, 164, 34, 1.5)
        : path('M18 34q11-13 22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0', paint('none', ink(k), 4))),

    // Bears, mostly.
    actor: (k, kind) =>
      figure(
        {
          k,
          w: 5,
          round: 1,
          hat: (cx, cy, r) => circle(cx - r * 0.85, cy - r * 0.8, r * 0.45, paint(k.F, k.L, 4)) + circle(cx + r * 0.85, cy - r * 0.8, r * 0.45, paint(k.F, k.L, 4)) + circle(cx, cy, r - 2.5, paint(k.F)) + face(k, cx, cy - 1, r / 15),
        },
        kind,
      ),

    // A soft card with cheeks.
    componentCard: (k) => rect(3, 3, 294, 102, 30, paint(k.F, k.L, 5)) + cheeks(k, 150, 80, 108, 10),

    // A toy block.
    componentGlyph: (k, kind) =>
      rect(18, 12, 84, 80, 20, paint(k.F, k.L, W)) +
      ellipse(60, 12, 14, 7, paint(k.C, k.L, 3)) +
      cheeks(k, 60, 74, 26, 6) +
      emblem(kind, 60, 52, 36, ink(k), 4),

    // A note with its corner folded, signed with a heart.
    artifact: (k, kind) =>
      path('M20 5H56L78 27V84Q78 96 66 96H20Q8 96 8 84V17Q8 5 20 5Z', paint(k.F, k.L, 5)) +
      path('M56 5V20Q56 27 63 27H78', paint('none', k.L, 3.5)) +
      heart(k, 64, 82, 1.3) +
      emblem(kind, 40, 54, 34, ink(k), 4),

    // A flower.
    junction: (k) =>
      [0, 60, 120, 180, 240, 300]
        .map((turn) => {
          const at = (turn * Math.PI) / 180;
          return circle(50 + Math.cos(at) * 26, 50 + Math.sin(at) * 26, 17, paint(k.F, k.L, 5));
        })
        .join('') + circle(50, 50, 16, paint(k.A('amber', 'chip'), k.L, 4)),
  },
};

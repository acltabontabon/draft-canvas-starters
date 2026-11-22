import { circle, ellipse, emblem, figure, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * High fantasy: ink on vellum. A service is a gatehouse, a data store a tower under a red roof,
 * a queue a scroll unrolled. Always light: it is a page from a book.
 */
const W = 6;
const ink = (k: Kit) => k.T;
const burgundy = (k: Kit) => k.A('rose', 'chip');
const gilt = (k: Kit) => k.A('amber', 'chip');

export const highFantasy: Pack = {
  id: 'high-fantasy',
  name: 'High fantasy',
  summary: 'Ink on vellum: banners, towers, rune stones and scrolls',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 50,
  style: {
    hand: { base: 'draft', wobble: 'calm' },
    general: { shadow: false },
    connectors: { weight: 'fine' },
    schemes: {
      light: scheme(
        { canvas: '#f4ebd3', grid: '#e4d8b8', text: '#2b2118', textMuted: '#6e5a3a', edge: '#7d7462', edgeText: '#6e5a3a', edgeLabelBg: '#faf5e6', codeBg: '#efe5c9', codeBorder: '#d9cba6' },
        {
          neutral: ['#faf4e2', '#6e6a5e', '#2b2118', '#5a5548'],
          teal: ['#e2efe6', '#2f6f5a', '#153d30', '#2a6350'],
          blue: ['#e3e9f1', '#44648f', '#1f3352', '#3a577e'],
          violet: ['#ebe3f0', '#6f4f8f', '#3a2552', '#5f427c'],
          amber: ['#f6e7b6', '#a07d16', '#54400a', '#8c6c10'],
          rose: ['#f3dcdc', '#8f2c3c', '#561420', '#7b2333'],
          green: ['#e3ecd6', '#3f6f3a', '#1f3d1c', '#2f5d3a'],
        },
      ),
    },
  },
  draw: {
    // A banner with swallow-tailed ends. An API hangs a wax seal on it.
    serviceCard: (k, kind) =>
      poly('3,3 345,3 327,66 345,129 3,129 21,66', paint(k.F, k.L, W)) +
      path('M30 14H318M30 118H318', paint('none', gilt(k), 2.5)) +
      (kind === 'api' ? circle(40, 30, 12, paint(burgundy(k), k.L, 2.5)) : ''),

    // A gatehouse, battlements along its top.
    serviceGlyph: (k, kind) =>
      path('M18 100V28H32V14H46V28H60V14H76V28H90V14H104V28H118V100Z', paint(k.F, k.L, W)) +
      emblem(kind, 68, 64, 40, ink(k), 3.8),

    // A round tower under a red roof, a pennant at its top.
    database: (k, kind) =>
      path('M70 16V3', paint('none', k.L, 3.5)) +
      path('M70 3L84 7L70 11Z', paint(gilt(k))) +
      rect(38, 40, 64, 62, 2, paint(k.F, k.L, W)) +
      poly('70,10 112,42 28,42', paint(burgundy(k), k.L, 5)) +
      emblem(kind, 70, 72, 38, ink(k), 3.8),

    // A scroll unrolled between its two rolls.
    queue: (k, kind) =>
      rect(22, 10, 232, 44, 0, paint(k.F, k.L, 5)) +
      ellipse(22, 32, 12, 27, paint(k.K, k.L, 5)) +
      ellipse(254, 32, 12, 27, paint(k.K, k.L, 5)) +
      (kind === 'queue'
        ? path('M56 22h40M56 32h40M56 42h26M118 22h40M118 32h40M118 42h26M180 22h40M180 32h40M180 42h26', paint('none', ink(k), 3.5))
        : kind === 'topic'
        ? circle(64, 32, 8, paint(burgundy(k))) + path('M80 32h34M114 32l30-11h68M114 32h98M114 32l30 11h68', paint('none', ink(k), 4))
        : path('M52 32q12-15 24 0t24 0t24 0t24 0t24 0t24 0t24 0', paint('none', ink(k), 4))),

    // Wanderers, hooded.
    actor: (k, kind) =>
      figure(
        {
          k,
          w: 5,
          round: 1,
          hat: (cx, cy, r) => path(`M${cx - r * 1.25} ${cy + r * 0.9}Q${cx - r * 1.4} ${cy - r * 1.6} ${cx} ${cy - r * 1.9}Q${cx + r * 1.4} ${cy - r * 1.6} ${cx + r * 1.25} ${cy + r * 0.9}Q${cx + r * 0.9} ${cy - r * 0.9} ${cx} ${cy - r * 0.95}Q${cx - r * 0.9} ${cy - r * 0.9} ${cx - r * 1.25} ${cy + r * 0.9}Z`, paint(k.L)),
        },
        kind,
      ),

    // A stone tablet, ruled in gilt.
    componentCard: (k) => rect(3, 3, 294, 102, 26, paint(k.F, k.L, 5)) + rect(13, 13, 274, 82, 18, paint('none', gilt(k), 2)),

    // A standing stone.
    componentGlyph: (k, kind) =>
      path('M26 98V46Q26 8 60 8Q94 8 94 46V98Z', paint(k.F, k.L, W)) +
      path('M14 98H106', paint('none', k.L, 5)) +
      emblem(kind, 60, 56, 38, ink(k), 3.8),

    // A parchment between its rolls.
    artifact: (k, kind) =>
      rect(14, 14, 58, 72, 0, paint(k.F, k.L, 5)) +
      rect(7, 5, 72, 15, 7, paint(k.K, k.L, 5)) +
      rect(7, 80, 72, 15, 7, paint(k.K, k.L, 5)) +
      emblem(kind, 43, 50, 34, ink(k), 3.8),

    // An eight-pointed star.
    junction: (k) =>
      poly('50,4 60,34 90,24 70,50 90,76 60,66 50,96 40,66 10,76 30,50 10,24 40,34', paint(k.F, k.L, 6)) +
      circle(50, 50, 8, paint(gilt(k))),
  },
};

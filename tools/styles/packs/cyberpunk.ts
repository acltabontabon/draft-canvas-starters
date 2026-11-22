import { circle, emblem, figure, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Cyberpunk: a night city. Cut corners, a second outline slipped out of register, magenta and
 * cyan on near-black. Always dark: neon needs the night.
 */
const W = 6;
const ink = (k: Kit) => k.T;
const cyan = (k: Kit) => k.A('teal', 'chip');
const magenta = (k: Kit) => k.A('rose', 'chip');
const yellow = (k: Kit) => k.A('amber', 'chip');

/** A barcode: thin and thick bars in a row. */
const barcode = (k: Kit, x: number, y: number, h: number, colour: string): string =>
  [0, 4, 7, 12, 15, 20, 23, 26]
    .map((at, i) => rect(x + at, y, i % 3 === 0 ? 3 : 1.6, h, 0, paint(colour)))
    .join('');

export const cyberpunk: Pack = {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  summary: 'A night city in magenta and cyan: cut corners and glitched outlines',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 60,
  style: {
    hand: { base: 'clean' },
    general: { corners: 'sharp', shadow: false },
    connectors: { head: 'triangle', colour: 'plain' },
    schemes: {
      dark: scheme(
        { canvas: '#120c1f', grid: '#1d1433', text: '#e6dbff', textMuted: '#a99bd6', edge: '#9a8fd0', edgeText: '#c9b8f5', edgeLabelBg: '#1a1230', codeBg: '#170f29', codeBorder: '#2c2050' },
        {
          neutral: ['#1e1436', '#9a8fd0', '#e6dbff', '#c2b5f5'],
          teal: ['#0d2a30', '#3de0e0', '#c9fbfb', '#6beaea'],
          blue: ['#131f45', '#5b8cff', '#d6e2ff', '#84a8ff'],
          violet: ['#2a1650', '#b06cff', '#ecd9ff', '#c693ff'],
          amber: ['#2e2a0c', '#f7e04b', '#fdf6c4', '#f9e86f'],
          rose: ['#3a0f2c', '#f0489a', '#ffd3ea', '#f571b3'],
          green: ['#0f2e1c', '#39e58c', '#cdfbe2', '#6aeda8'],
        },
      ),
    },
  },
  draw: {
    // A panel with two corners cut, and its outline again a few pixels out of register.
    serviceCard: (k, kind) =>
      group('translate(8 8)', poly('24,3 337,3 337,101 318,121 3,121 3,24', paint('none', cyan(k), 3))) +
      poly('24,3 337,3 337,101 318,121 3,121 3,24', paint(k.F, k.L, W)) +
      rect(30, 3, 70, 7, 0, paint(yellow(k))) +
      (kind === 'api' ? barcode(k, 14, 48, 36, cyan(k)) : ''),

    // A holo panel.
    serviceGlyph: (k, kind) =>
      group('translate(7 7)', poly('26,4 114,4 114,72 96,92 10,92 10,20', paint('none', cyan(k), 3))) +
      poly('26,4 114,4 114,72 96,92 10,92 10,20', paint(k.F, k.L, W)) +
      rect(32, 4, 40, 6, 0, paint(yellow(k))) +
      emblem(kind, 62, 50, 40, ink(k), 3.8),

    // A data cell: a capsule banded top and bottom.
    database: (k, kind) =>
      poly('44,4 96,4 112,20 112,88 96,104 44,104 28,88 28,20', paint(k.F, k.L, W)) +
      path('M28 22H112M28 86H112', paint('none', magenta(k), 4)) +
      rect(14, 44, 14, 20, 0, paint(k.L)) +
      rect(112, 44, 14, 20, 0, paint(k.L)) +
      emblem(kind, 70, 54, 38, ink(k), 3.8),

    // A slanted conduit.
    queue: (k, kind) =>
      poly('20,5 272,5 256,59 4,59', paint(k.F, k.L, 5)) +
      (kind === 'queue'
        ? path('M62 16l18 16l-18 16M112 16l18 16l-18 16M162 16l18 16l-18 16', paint('none', cyan(k), 5)) + path('M212 16l18 16l-18 16', paint('none', yellow(k), 5))
        : kind === 'topic'
        ? rect(40, 23, 18, 18, 0, paint(magenta(k))) + path('M66 32h44M110 32l34-13h76M110 32h110M110 32l34 13h76', paint('none', cyan(k), 4))
        : path('M34 32h24l10-14l16 28l16-28l16 28l16-28l16 28l16-28l10 14h34', paint('none', cyan(k), 4))),

    // Street people: a visor across the eyes, a crest of hair.
    actor: (k, kind) =>
      figure(
        {
          k,
          w: 5,
          round: 0,
          hat: (cx, cy, r) =>
            rect(cx - r - 2, cy - r * 0.35, r * 2 + 4, r * 0.55, 0, paint(yellow(k))) +
            poly(`${cx - r * 0.6},${cy - r} ${cx - r * 0.2},${cy - r * 1.7} ${cx + r * 0.1},${cy - r} ${cx + r * 0.45},${cy - r * 1.5} ${cx + r * 0.75},${cy - r}`, paint(magenta(k))),
        },
        kind,
      ),

    // A module card: opposite corners cut, ticks at the ends.
    componentCard: (k) =>
      poly('3,3 279,3 297,21 297,105 21,105 3,87', paint(k.F, k.L, 5)) +
      path('M16 16H40M16 16V40M284 92H260M284 92V68', paint('none', cyan(k), 3)),

    // A module on its contacts.
    componentGlyph: (k, kind) =>
      [36, 52, 68, 84].map((x) => rect(x - 3, 4, 6, 12, 0, paint(k.L)) + rect(x - 3, 88, 6, 12, 0, paint(k.L))).join('') +
      poly('32,16 88,16 100,28 100,76 88,88 32,88 20,76 20,28', paint(k.F, k.L, W)) +
      circle(31, 27, 3, paint(magenta(k))) +
      emblem(kind, 60, 52, 38, ink(k), 3.8),

    // A data shard, barcoded.
    artifact: (k, kind) =>
      poly('6,4 60,4 80,24 80,96 26,96 6,76', paint(k.F, k.L, 5)) +
      barcode(k, 34, 80, 10, cyan(k)) +
      emblem(kind, 43, 44, 36, ink(k), 3.8),

    // A diamond with a hot centre.
    junction: (k) =>
      group('translate(6 6)', poly('46,5 87,46 46,87 5,46', paint('none', cyan(k), 3))) +
      poly('46,5 87,46 46,87 5,46', paint(k.F, k.L, 7)) +
      rect(37, 37, 18, 18, 0, paint(magenta(k))),
  },
};

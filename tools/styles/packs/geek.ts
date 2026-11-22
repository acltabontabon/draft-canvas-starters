import { circle, emblem, figure, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Geek: a green-screen terminal. Square corners, heavy pixel lines, a floppy disk for a data
 * store, a CRT for a service, paper tape for a queue. Always dark: phosphor needs a black screen.
 */
const W = 6;
const ink = (k: Kit) => k.T;

/** Sprocket holes along a strip of tape. */
const holes = (k: Kit, y: number): string => Array.from({ length: 12 }, (_, i) => rect(16 + i * 21.5, y, 9, 5, 0, paint(k.L))).join('');

export const geek: Pack = {
  id: 'geek',
  name: 'Geek',
  summary: 'A green-screen terminal: floppy disks, CRTs, chips and paper tape',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 20,
  style: {
    hand: { base: 'clean' },
    general: { corners: 'sharp', shadow: false },
    connectors: { head: 'triangle' },
    schemes: {
      dark: scheme(
        { canvas: '#0b1410', grid: '#16261f', text: '#c9f5df', textMuted: '#7fbf9f', edge: '#4fb889', edgeText: '#9fe1cb', edgeLabelBg: '#101d17', codeBg: '#0f1b16', codeBorder: '#1f3a2e' },
        {
          neutral: ['#13231c', '#4fb889', '#c9f5df', '#7cf2b2'],
          teal: ['#0f2a26', '#3fc9b0', '#c6f4ea', '#5fe3cc'],
          blue: ['#10233a', '#5aa7e8', '#d2e8fb', '#7fc0f5'],
          violet: ['#201a38', '#a08cf0', '#e2dcfb', '#b9a8f7'],
          amber: ['#2c2410', '#e0b04a', '#fbeccb', '#fac775'],
          rose: ['#311820', '#f07a94', '#fddbe2', '#f59bb0'],
          green: ['#14291a', '#6fd07c', '#d5f6d9', '#8fe39a'],
        },
      ),
    },
  },
  draw: {
    // A terminal window: a title bar with its three squares, and room for the name under it.
    serviceCard: (k, kind) =>
      rect(3, 3, 342, 126, 0, paint(k.F, k.L, W)) +
      rect(3, 3, 342, 24, 0, paint(k.L)) +
      rect(14, 10, 10, 10, 0, paint(k.A('amber', 'chip'))) +
      rect(30, 10, 10, 10, 0, paint(k.K)) +
      rect(46, 10, 10, 10, 0, paint(k.K)) +
      // An API has a socket in its side.
      (kind === 'api' ? rect(3, 54, 16, 28, 0, paint(k.K, k.L, W)) + rect(9, 64, 6, 8, 0, paint(k.C)) : ''),

    // A CRT on its stand, with what the service does on the screen.
    serviceGlyph: (k, kind) =>
      rect(14, 5, 108, 76, 0, paint(k.F, k.L, W)) +
      rect(26, 16, 84, 54, 0, paint(k.K, k.L, 3)) +
      rect(54, 81, 28, 9, 0, paint(k.L)) +
      rect(36, 90, 64, 9, 0, paint(k.L)) +
      rect(100, 72, 8, 5, 0, paint(k.A('amber', 'chip'))) +
      emblem(kind, 68, 43, 40, ink(k), 3.8),

    // A floppy disk: the shutter at the top, the label where the kind is written.
    database: (k, kind) =>
      poly('22,6 102,6 118,22 118,102 22,102', paint(k.F, k.L, W)) +
      rect(44, 6, 44, 26, 0, paint(k.L)) +
      rect(72, 11, 9, 16, 0, paint(k.F)) +
      rect(36, 46, 68, 56, 0, paint(k.K, k.L, 3)) +
      emblem(kind, 70, 74, 40, ink(k), 3.8),

    // Punched paper tape, with what kind of queue it is running through it.
    queue: (k, kind) =>
      rect(3, 9, 270, 46, 0, paint(k.F, k.L, 5)) +
      holes(k, 0) +
      holes(k, 59) +
      (kind === 'queue'
        ? path('M70 9v46M138 9v46M206 9v46', paint('none', k.L, 3)) + rect(26, 24, 22, 16, 0, paint(k.A('amber', 'chip'))) + rect(94, 24, 22, 16, 0, paint(k.C)) + rect(162, 24, 22, 16, 0, paint(k.C))
        : kind === 'topic'
        ? path('M24 32h76M100 32l44-13h104M100 32h148M100 32l44 13h104', paint('none', ink(k), 4)) + rect(18, 25, 14, 14, 0, paint(k.A('amber', 'chip')))
        : path('M22 32h20v-12h22v24h22v-24h22v24h22v-24h22v24h22v-24h22v12h34', paint('none', ink(k), 4))),

    // Blocky pixel people, and the machines beside them.
    actor: (k, kind) =>
      figure(
        {
          k,
          w: 5,
          round: 0,
          hat: (cx, cy, r) => rect(cx - r * 0.55, cy - r * 0.2, r * 0.35, r * 0.45, 0, paint(k.T)) + rect(cx + r * 0.2, cy - r * 0.2, r * 0.35, r * 0.45, 0, paint(k.T)),
        },
        kind,
      ),

    // A frame of square brackets.
    componentCard: (k) =>
      rect(3, 3, 294, 102, 0, paint(k.F, k.L, 5)) +
      path('M30 14H14V94H30', paint('none', k.C, 6)) +
      path('M270 14H286V94H270', paint('none', k.C, 6)),

    // A chip on its pins.
    componentGlyph: (k, kind) =>
      [28, 44, 60, 76].map((y) => rect(12, y - 3, 16, 6, 0, paint(k.L)) + rect(92, y - 3, 16, 6, 0, paint(k.L))).join('') +
      rect(26, 18, 68, 68, 0, paint(k.F, k.L, W)) +
      circle(36, 28, 3, paint(k.A('amber', 'chip'))) +
      emblem(kind, 60, 54, 38, ink(k), 3.8),

    // A punch card, its corner cut.
    artifact: (k, kind) =>
      poly('6,4 62,4 80,22 80,96 6,96', paint(k.F, k.L, 5)) +
      path('M62 4V22H80', paint('none', k.L, 3)) +
      emblem(kind, 43, 58, 36, ink(k), 3.8),

    // A pixel diamond.
    junction: (k) => poly('50,6 94,50 50,94 6,50', paint(k.F, k.L, 8)) + group('rotate(45 50 50)', rect(40, 40, 20, 20, 0, paint(k.C))),
  },
};

import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * High seas: an age-of-sail chart on parchment, inked like a hand-coloured woodcut. Every kind of
 * shape is its own object from the ship or the harbour: a service is a painted signboard, a worker
 * a rowing boat, a gateway a lighthouse; a data store is a barrel, a ledger, a sack of loot, a
 * powder keg; a queue is a bottle of messages, a topic a hoist of signal flags, a stream a boat on
 * the current. Each is cut in tar-brown ink with a bold wedge of shade on its lee side (the light
 * comes from the top left) and a sliver of sail-cloth on the lit one, then touched in by hand with
 * brass, oxblood and sea green. The canvas is the chart itself: rhumb lines from a compass point,
 * soundings, an island, a wave or two. Always light: it is drawn on paper.
 */
const W = 5.5; // the outline of an object
const M = 3.5; // a mark inside it

// The printer's inks: they stay as they are whatever colour a shape is given.
const BRASS = '#c8952c';
const OX = '#9b2a20';
const SEA = '#1f6269';
const NAVY = '#1d3c58';
const SAIL = '#fdf6e3';

const n = (value: number) => Math.round(value * 10) / 10;
const op = (value: number) => (value < 1 ? ` opacity="${value}"` : '');
const flat = (colour: string, opacity = 1) => `fill="${colour}" stroke="none"${op(opacity)}`;
const ink = (colour: string, w = M, opacity = 1) => `fill="none" stroke="${colour}" stroke-width="${w}"${op(opacity)}`;
const body = (k: Kit, w = W) => paint(k.F, k.L, w);

/** The woodcut's shade: a wedge of the shape's own darkest ink over its lee side. */
const shade = (k: Kit, d: string, opacity = 0.22) => path(d, flat(k.T, opacity));
/** The lit edge: a sliver of bare sail-cloth. */
const glint = (d: string, w = 3, opacity = 0.8) => path(d, ink(SAIL, w, opacity));
/** The shadow an object stands on. */
const ground = (k: Kit, cx: number, cy: number, rx: number, ry = 3.5) => ellipse(cx, cy, rx, ry, flat(k.T, 0.2));
/** A few cut strokes of hatching: `count` strokes of (`dx`, `dy`), each a step of (`sx`, `sy`) on. */
const hatch = (k: Kit, x: number, y: number, dx: number, dy: number, count: number, sx: number, sy = 0) =>
  path(Array.from({ length: count }, (_, i) => `M${n(x + i * sx)} ${n(y + i * sy)}l${dx} ${dy}`).join(''), ink(k.L, 2.6));

/** Part of a circle, clockwise from `from` to `to` degrees (0 is east, 90 south). */
function arc(cx: number, cy: number, r: number, from: number, to: number): string {
  const at = (a: number) => `${n(cx + r * Math.cos((a * Math.PI) / 180))} ${n(cy + r * Math.sin((a * Math.PI) / 180))}`;
  return `M${at(from)}A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${at(to)}`;
}
/** Round things: shade on the lower right, a glint on the upper left. */
const roundShade = (k: Kit, cx: number, cy: number, r: number, w: number, opacity = 0.22) => path(arc(cx, cy, r, -25, 115), ink(k.T, w, opacity));
const roundGlint = (cx: number, cy: number, r: number, w = 3) => glint(arc(cx, cy, r, 185, 265), w);

/** A line of water: `count` half-waves, each `half` long, starting at (`x`, `y`). */
const waves = (x: number, y: number, half: number, amp: number, count: number) => `M${x} ${y}q${n(half / 2)} ${-amp} ${half} 0${`t${half} 0`.repeat(count - 1)}`;

/** A spark: a star of `points` points. */
function burst(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    out.push(`${n(cx + r * Math.cos(a))},${n(cy + r * Math.sin(a))}`);
  }
  return out.join(' ');
}

/** A brass stud, nailed in. */
const stud = (k: Kit, x: number, y: number, r = 4.5) => circle(x, y, r, paint(BRASS, k.L, 2.5));

/** A tricorn hat seen from the front, its brim turned up at both ends, braided in brass, with a red cockade. */
const tricorn = (k: Kit) =>
  path('M26 13Q40 28 60 26Q80 28 94 13Q82 16 74 12Q60 -3 46 12Q38 16 26 13Z', paint(k.L, k.L, 3)) +
  path('M37 19Q49 24 60 23Q71 24 83 19', ink(BRASS, 2.8)) +
  circle(60, 13, 4.5, flat(OX));

/** A sailor: striped shirt, red neckerchief, tricorn hat. Drawn at 120 by 82. */
const sailor = (k: Kit) =>
  path('M24 78Q24 48 60 48Q96 48 96 78Z', body(k)) +
  path('M33 61H87M28 71H92', ink(k.C, 4.5)) +
  shade(k, 'M62 48Q96 48 96 78H72Q80 62 62 48Z') +
  path('M48 49L60 63L72 49Z', flat(OX)) +
  circle(60, 32, 15, body(k)) +
  roundShade(k, 60, 32, 10, 6) +
  tricorn(k);

/** A deckhand behind the sailor: a smaller figure in a knotted headscarf. */
const deckhand = (k: Kit, cx: number, knot: 1 | -1) =>
  path(`M${cx - 20} 78Q${cx - 20} 55 ${cx} 55Q${cx + 20} 55 ${cx + 20} 78Z`, paint(k.C, k.L, 5)) +
  circle(cx, 41, 11.5, body(k, 5)) +
  roundShade(k, cx, 41, 7.5, 5) +
  path(`M${cx - 12} 39Q${cx - 12} 27 ${cx} 27Q${cx + 12} 27 ${cx + 12} 39Q${cx} 33 ${cx - 12} 39Z`, paint(knot === 1 ? SEA : BRASS, k.L, 3)) +
  path(`M${cx + knot * 11} 37L${cx + knot * 20} 44`, ink(k.L, 4));

/** A rolled chart standing in a chest: its foot at (`x`, 64), leaning by `angle` degrees. */
const rolledChart = (k: Kit, x: number, angle: number, length: number, ribbon?: string) =>
  group(
    `translate(${x} 64) rotate(${angle})`,
    rect(-10, -length, 20, length, 0, paint(SAIL, k.L, 4.5)) +
      rect(3, -length + 4, 6, length - 4, 0, flat(k.T, 0.2)) +
      (ribbon ? rect(-10, -length + 16, 20, 8, 0, flat(ribbon)) : '') +
      ellipse(0, -length, 10, 5, paint(k.F, k.L, 4)),
  );

/** A signboard: a painted board in a bevelled frame, lit from the top left. */
const board = (k: Kit) =>
  rect(3, 3, 342, 126, 10, flat(k.F)) +
  path('M342 6V126H6L15 117H333V15Z', flat(k.T, 0.2)) +
  path('M6 126V6H342L333 15H15V117Z', flat(SAIL, 0.75)) +
  rect(3, 3, 342, 126, 10, ink(k.L, W));

/* ------------------------------------------------------------ the chart -- */

const TW = 520;
const TH = 440;

/** The part of a line that lies on the tile, or nothing. */
function onTile(x0: number, y0: number, x1: number, y1: number): string {
  let t0 = 0;
  let t1 = 1;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const edges: [number, number][] = [
    [-dx, x0],
    [dx, TW - x0],
    [-dy, y0],
    [dy, TH - y0],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return '';
      continue;
    }
    const r = q / p;
    if (p < 0) t0 = Math.max(t0, r);
    else t1 = Math.min(t1, r);
  }
  if (t1 - t0 < 0.002) return '';
  return `M${n(x0 + t0 * dx)} ${n(y0 + t0 * dy)}L${n(x0 + t1 * dx)} ${n(y0 + t1 * dy)}`;
}

/**
 * Rhumb lines from the compass point at (`px`, `py`). Each bearing runs a whole number of tiles
 * across and down before it meets itself again, so the net joins at every edge.
 */
function rhumbs(px: number, py: number, bearings: [number, number][]): string {
  const out = new Set<string>();
  for (const [a, b] of bearings)
    for (let i = -3; i <= 3; i += 1)
      for (let j = -3; j <= 3; j += 1) {
        const d = onTile(px + i * TW, py + j * TH, px + (i + a) * TW, py + (j + b) * TH);
        if (d) out.add(d);
      }
  return [...out].join('');
}

/** A chart-maker's numerals, as pen strokes in a box 4 wide and 6 tall. */
const DIGITS: Record<string, [number, number][]> = {
  '0': [[1, 0], [3, 0], [4, 1.5], [4, 4.5], [3, 6], [1, 6], [0, 4.5], [0, 1.5], [1, 0]],
  '1': [[0.6, 1.5], [2.2, 0], [2.2, 6]],
  '2': [[0, 1.2], [1, 0], [3, 0], [4, 1.2], [4, 2.4], [0, 6], [4, 6]],
  '3': [[0, 0], [4, 0], [2, 2.5], [3.4, 2.8], [4, 4.2], [3, 6], [1, 6], [0, 5]],
  '4': [[3, 6], [3, 0], [0, 4], [4, 4]],
  '5': [[4, 0], [0.6, 0], [0.3, 2.6], [2.6, 2.3], [4, 3.4], [4, 4.8], [2.8, 6], [0, 5.6]],
  '6': [[3.6, 0], [1.2, 1.6], [0, 4], [0.8, 5.6], [2.4, 6], [3.8, 5], [3.6, 3.4], [2.2, 2.8], [0.4, 3.6]],
  '7': [[0, 0], [4, 0], [1.6, 6]],
  '8': [[2, 2.8], [0.4, 1.6], [1, 0.2], [3, 0.2], [3.6, 1.6], [2, 2.8], [0.2, 4.2], [1, 6], [3, 6], [3.8, 4.2], [2, 2.8]],
  '9': [[3.8, 2], [2.4, 3.2], [0.6, 2.6], [0.2, 1.2], [1.4, 0], [3, 0.2], [3.8, 2], [3.4, 4.4], [2, 6]],
};

/** A sounding: a depth written at (`x`, `y`), `size` to a unit, turned by `turn` degrees. */
function sounding(text: string, x: number, y: number, size: number, turn: number): string {
  const cos = Math.cos((turn * Math.PI) / 180);
  const sin = Math.sin((turn * Math.PI) / 180);
  return [...text]
    .map((digit, at) =>
      DIGITS[digit]
        .map(([u, v], i) => {
          const a = (u + at * 5.6) * size;
          const b = v * size;
          return `${i ? 'L' : 'M'}${n(x + a * cos - b * sin)} ${n(y + a * sin + b * cos)}`;
        })
        .join(''),
    )
    .join('');
}

export const highSeas: Pack = {
  id: 'high-seas',
  name: 'High seas',
  summary: 'A hand-coloured woodcut sea chart: a lighthouse, a ledger, a powder keg, a bottle of messages',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 40,
  style: {
    // A quill on a rolling deck: the line wanders and is gone over twice.
    hand: { base: 'sketch', wobble: 'lively' },
    general: { shadow: false },
    connectors: { colour: 'plain' },
    schemes: {
      light: scheme(
        { canvas: '#f6e7c8', grid: '#e4d0a6', text: '#2b1b0e', textMuted: '#654c31', edge: '#6f5334', edgeText: '#5a4229', edgeLabelBg: '#fbf2dc', codeBg: '#f0e0bb', codeBorder: '#d8c292' },
        {
          neutral: ['#fbf0d6', '#5a3d22', '#2b1b0e', '#b08a56'],
          teal: ['#d9ebe2', '#1f6a66', '#0d3835', '#4f9a90'],
          blue: ['#dbe6ee', '#27547a', '#102c46', '#5c8cb0'],
          violet: ['#eaddea', '#6a487f', '#35204a', '#9a7bb0'],
          amber: ['#f8e2a4', '#8f6410', '#452c04', '#b07d18'],
          rose: ['#f5d6c8', '#9b2a20', '#58130d', '#cc6a56'],
          green: ['#e1e8c4', '#526f2c', '#273b12', '#6f8c3c'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      // A painted signboard in a bevelled frame, a brass stud in each corner and a rule between them.
      if (kind === 'generic')
        return (
          board(k) +
          path('M34 24H314M34 108H314M24 34V98M324 34V98', ink(k.C, 3)) +
          poly('24,57 31,66 24,75 17,66', flat(OX)) +
          poly('324,57 331,66 324,75 317,66', flat(OX)) +
          stud(k, 24, 24) +
          stud(k, 324, 24) +
          stud(k, 24, 108) +
          stud(k, 324, 108)
        );
      // An API is the same board with an iron mooring ring on its left edge, something to tie up
      // to. Its rule stops short of the bottom-right corner, where the app writes "API".
      return (
        board(k) +
        path('M34 24H314M34 108H292M24 34V40M24 94V98M324 34V88', ink(k.C, 3)) +
        stud(k, 24, 24) +
        stud(k, 324, 24) +
        stud(k, 24, 108) +
        rect(19, 44, 14, 14, 4, flat(k.L)) +
        circle(26, 72, 13, ink(k.L, 6.5)) +
        glint(arc(26, 72, 13, 190, 260), 2.6)
      );
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A rowing boat: three hands at the oars, doing the work. A pennant at the stern.
        case 'worker':
          return (
            path('M12 50V10', ink(k.L, 4)) +
            path('M12 9L40 18L12 28Z', flat(OX)) +
            circle(48, 36, 9.5, paint(k.C, k.L, 4.5)) +
            circle(76, 36, 9.5, paint(k.C, k.L, 4.5)) +
            circle(104, 36, 9.5, paint(k.C, k.L, 4.5)) +
            path('M6 46Q16 48 22 56H114Q120 48 130 46Q130 86 100 86H36Q6 86 6 46Z', body(k)) +
            shade(k, 'M9 67H127Q121 86 100 86H36Q15 86 9 67Z', 0.26) +
            glint('M26 60H110', 3.5) +
            path('M9 67H127', ink(k.L, 3)) +
            path('M48 48L20 94M76 48L48 94M104 48L76 94', ink(k.T, 5)) +
            path('M25 86L18 97M53 86L46 97M81 86L74 97', ink(k.T, 11)) +
            path(waves(4, 98, 16, 8, 8), ink(SEA, 4))
          );
        // A far island with one palm tree and somebody else's flag on it: land that is not yours.
        case 'external':
          return (
            path('M8 88Q20 64 54 61Q98 57 128 88Z', body(k)) +
            shade(k, 'M74 59Q106 62 128 88H82Q90 74 74 59Z', 0.26) +
            hatch(k, 24, 80, 7, -5, 3, 11) +
            path('M26 76V50', ink(k.L, 3.5)) +
            path('M26 49L46 55L26 62Z', flat(OX)) +
            path('M64 61Q58 40 72 24', ink(k.L, 7)) +
            path('M72 23Q46 -2 20 30Q50 16 72 23Z', paint(k.C, k.L, 3.5)) +
            path('M72 23Q44 22 38 52Q54 30 72 23Z', paint(k.C, k.L, 3.5)) +
            path('M72 23Q100 -2 124 30Q96 16 72 23Z', paint(k.C, k.L, 3.5)) +
            path('M72 23Q102 22 108 52Q92 30 72 23Z', paint(k.C, k.L, 3.5)) +
            circle(67, 29, 4.5, paint(BRASS, k.L, 2.5)) +
            circle(77, 30, 4.5, paint(BRASS, k.L, 2.5)) +
            path(waves(6, 97, 20, 8, 6), ink(SEA, 4.5))
          );
        // An hourglass in a brass-knobbed stand: the watch is kept by the sand.
        case 'scheduler':
          return (
            ground(k, 70, 100, 48) +
            path('M30 14V90M106 14V90', ink(k.L, 5)) +
            path('M42 15H94Q94 38 75 52Q94 66 94 89H42Q42 66 61 52Q42 38 42 15Z', paint(SAIL, k.L, 5)) +
            path('M50 30H86Q82 41 68 49Q54 41 50 30Z', flat(k.C)) +
            path('M68 49V76', ink(k.C, 3.5)) +
            path('M49 87Q68 58 87 87Z', flat(k.C)) +
            shade(k, 'M82 17H92Q92 38 73 52Q92 66 92 87H82Q84 66 67 52Q84 38 82 17Z', 0.2) +
            rect(21, 4, 94, 12, 5, body(k, 5)) +
            rect(21, 88, 94, 12, 5, body(k, 5)) +
            shade(k, 'M72 6H112V14H64Z') +
            shade(k, 'M72 90H112V98H64Z') +
            stud(k, 30, 10, 4) +
            stud(k, 106, 10, 4) +
            stud(k, 30, 94, 4) +
            stud(k, 106, 94, 4)
          );
        // A lighthouse with its door at the foot: the one way into the harbour.
        case 'gateway':
          return (
            path('M58 27L4 8V46Z', flat(BRASS, 0.5)) +
            path('M78 27L132 8V46Z', flat(BRASS, 0.5)) +
            path('M16 99Q38 78 68 78Q98 78 120 99Z', paint(k.C, k.L, 4)) +
            shade(k, 'M72 78Q98 78 120 99H84Q88 88 72 78Z', 0.3) +
            path('M49 90L55 36H81L87 90Z', body(k, 5)) +
            path('M53.2 52H82.8L84.4 67H51.6Z', flat(k.C)) +
            shade(k, 'M69 36H81L87 90H69Z', 0.24) +
            path('M61 90V77Q68 68 75 77V90Z', flat(k.T)) +
            rect(58, 18, 20, 18, 2, paint(BRASS, k.L, 4)) +
            path('M46 36H90', ink(k.L, 6.5)) +
            path('M52 18L68 4L84 18Z', paint(OX, k.L, 4)) +
            path(waves(4, 99, 16, 6, 8), ink(SEA, 4))
          );
        // A block and tackle: one rope hauled in, three paid out.
        case 'load-balancer':
          return (
            path('M3 52H30', ink(k.L, 7)) +
            path('M64 52L116 15M64 52H120M64 52L116 89', ink(k.L, 5)) +
            path('M53 16V8M53 88V96', ink(k.L, 6)) +
            rect(28, 16, 50, 72, 20, body(k)) +
            shade(k, 'M54 16H58Q78 16 78 36V68Q78 88 58 88H54Q70 78 70 52Q70 26 54 16Z', 0.26) +
            glint('M36 34V66', 3.5) +
            circle(53, 52, 15, paint(BRASS, k.L, 4.5)) +
            circle(53, 52, 4.5, flat(k.L)) +
            circle(120, 13, 9, paint(k.C, k.L, 4.5)) +
            circle(125, 52, 9, paint(k.C, k.L, 4.5)) +
            circle(120, 91, 9, paint(k.C, k.L, 4.5))
          );
        // A messenger gull on the wing, a sealed letter slung beneath it: it carries word between two ships.
        case 'proxy':
          return (
            path('M74 50Q84 22 124 4Q116 34 94 54Z', body(k, 5)) +
            path('M124 4L104 15L115 24Z', flat(k.T)) +
            path('M32 50L5 40L13 57L7 69L36 63Z', body(k, 5)) +
            path('M54 70L52 80M70 70L72 80', ink(k.L, 3)) +
            ellipse(62, 56, 36, 15, body(k, 5)) +
            shade(k, 'M27 59Q62 68 97 59Q88 71 62 71Q36 71 27 59Z', 0.26) +
            circle(100, 46, 12.5, body(k, 5)) +
            path('M110 40L133 48L110 55Z', paint(BRASS, k.L, 3)) +
            circle(103, 43, 2.8, flat(k.T)) +
            path('M42 53Q40 22 14 3Q60 10 84 52Q64 61 42 53Z', body(k, 5)) +
            path('M14 3L40 12L34 24Z', flat(k.T)) +
            hatch(k, 52, 46, -5, -14, 3, 10, 2) +
            rect(42, 78, 40, 23, 3, paint(SAIL, k.L, 4)) +
            path('M42 78L62 91L82 78', ink(k.L, 3)) +
            circle(62, 91, 5.5, flat(OX))
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // A barrel stood on end: staved, hooped twice, bunged.
        case 'generic':
          return (
            ground(k, 73, 103, 48, 4) +
            path('M36 15Q16 56 36 97Q70 109 104 97Q124 56 104 15Z', body(k)) +
            path('M56 22Q49 58 56 101M84 22Q91 58 84 101', ink(k.L, 2.6)) +
            shade(k, 'M92 17Q106 56 92 101Q100 100 104 97Q124 56 104 15Z', 0.28) +
            glint('M41 28Q31 56 41 88', 4) +
            path('M28 35Q70 47 112 35M28 78Q70 90 112 78', ink(k.L, 6)) +
            ellipse(70, 15, 34, 8, paint(k.C, k.L, 4.5)) +
            circle(70, 60, 5.5, flat(k.T))
          );
        // The ship's ledger, open: ruled rows on each page, a ribbon to keep the place.
        case 'sql':
          return (
            path('M6 23Q38 12 70 25Q102 12 134 23V98Q102 88 70 101Q38 88 6 98Z', paint(k.C, k.L, 5)) +
            path('M64 92V107L70 101L76 107V92Z', flat(OX)) +
            path('M10 16Q40 5 70 18Q100 5 130 16V90Q100 80 70 92Q40 80 10 90Z', body(k)) +
            shade(k, 'M70 18Q82 11 94 9Q86 46 90 84Q78 87 70 92Z', 0.24) +
            path('M70 18V92', ink(k.L, 4.5)) +
            path('M21 32Q42 25 59 33M21 48Q42 41 59 49M21 64Q42 57 59 65M81 33Q98 25 119 32M81 49Q98 41 119 48M81 65Q98 57 119 64', ink(k.T, 4)) +
            path('M21 32Q30 28 37 28', ink(OX, 4.5))
          );
        // A sack of loot, tied at the neck: a coin, a gem and an ingot, whatever came aboard.
        case 'nosql':
          return (
            ground(k, 72, 103, 52, 4) +
            path('M50 26Q40 12 46 4Q58 10 70 6Q82 10 94 4Q100 12 90 26Q126 46 124 80Q122 103 70 103Q18 103 16 80Q14 46 50 26Z', body(k)) +
            shade(k, 'M88 27Q126 46 124 80Q122 103 70 103Q102 98 106 74Q108 46 88 27Z', 0.26) +
            glint('M27 70Q28 50 44 38', 4) +
            path('M48 27Q70 35 92 27', ink(BRASS, 7)) +
            path('M90 28Q104 34 100 48', ink(BRASS, 4.5)) +
            circle(44, 74, 11.5, paint(BRASS, k.T, 3.5)) +
            path('M73 48L88 64L73 80L58 64Z', paint(SEA, k.T, 3.5)) +
            path('M73 48L80 64L73 80', flat(SAIL, 0.35)) +
            rect(87, 76, 18, 15, 2, paint(OX, k.T, 3.5))
          );
        // A powder keg with the fuse lit: quick, and not for keeping.
        case 'cache':
          return (
            ground(k, 73, 104, 50) +
            path('M62 34Q58 13 78 13Q92 13 100 15', ink(k.T, 4.5)) +
            poly(burst(110, 15, 14, 6, 8), flat(OX)) +
            poly(burst(110, 15, 7, 3, 8), flat(BRASS)) +
            path('M30 34H110Q130 68 110 102H30Q10 68 30 34Z', body(k)) +
            path('M52 36Q44 68 52 100M88 36Q96 68 88 100', ink(k.L, 2.6)) +
            shade(k, 'M96 36H110Q130 68 110 102H96Q112 68 96 36Z', 0.28) +
            glint('M33 44Q24 68 33 92', 4) +
            path('M24 48Q70 56 116 48M24.5 90Q70 98 115.5 90', ink(k.L, 5.5)) +
            path('M77 54L57 73H69L62 89L85 68H72Z', flat(k.T))
          );
        // A chest of rolled charts: many papers, each in its place.
        case 'file-system':
          return (
            ground(k, 72, 104, 58) +
            rolledChart(k, 38, -18, 52) +
            rolledChart(k, 70, 3, 53, OX) +
            rolledChart(k, 100, 20, 50) +
            rect(15, 60, 110, 42, 5, body(k)) +
            shade(k, 'M92 62H123V100H84Z', 0.26) +
            path('M34 64V100M106 64V100', ink(k.L, 4.5)) +
            rect(8, 52, 124, 14, 5, body(k, 5)) +
            shade(k, 'M96 54H130V64H90Z') +
            path('M61 60H79V75Q70 85 61 75Z', paint(BRASS, k.L, 3.5)) +
            circle(70, 70, 2.8, flat(k.T))
          );
        // A bucket heaped with shot: round things of any size, kept loose.
        case 'object-storage':
          return (
            ground(k, 72, 104, 46) +
            path('M21 46Q21 5 70 5Q119 5 119 46', ink(k.L, 4.5)) +
            circle(46, 36, 14.5, paint(k.C, k.L, 4)) +
            circle(94, 36, 14.5, paint(k.C, k.L, 4)) +
            circle(70, 27, 16, paint(k.C, k.L, 4)) +
            roundShade(k, 70, 27, 10, 7, 0.3) +
            roundShade(k, 94, 36, 9, 6, 0.3) +
            glint('M61 23Q63 17 70 16M38 33Q39 28 45 26', 3.5) +
            path('M18 44H122L108 102H32Z', body(k)) +
            path('M52 46L56 100M88 46L84 100', ink(k.L, 2.6)) +
            shade(k, 'M96 46H122L108 102H90Z', 0.28) +
            glint('M27 52L37 94', 3.5) +
            path('M22.5 61H117.5M29 88H111', ink(k.L, 5.5))
          );
        // A brass-bound spyglass, drawn out: made for finding.
        case 'search-index':
          return group(
            'rotate(-28 68 56)',
            rect(8, 47, 42, 18, 3, body(k, 5)) +
              rect(48, 43, 42, 26, 3, body(k, 5)) +
              rect(88, 38, 40, 36, 3, body(k)) +
              shade(k, 'M10 58H126V72H90V67H50V63H10Z', 0.28) +
              glint('M14 51H44M56 48H84M96 44H122', 3) +
              rect(2, 45, 9, 22, 3, paint(BRASS, k.L, 3.5)) +
              rect(45, 41, 8, 30, 2, paint(BRASS, k.L, 3.5)) +
              rect(85, 36, 8, 40, 2, paint(BRASS, k.L, 3.5)) +
              rect(123, 33, 11, 46, 3, paint(BRASS, k.L, 4)) +
              path('M128.5 58V75', ink(k.T, 6, 0.3)),
          );
        // A tally slate hung from a nail: one ruled table.
        case 'table':
          return (
            rect(18, 28, 116, 78, 5, flat(k.T, 0.22)) +
            path('M36 22L70 7L104 22', ink(k.L, 4)) +
            rect(12, 22, 116, 80, 5, flat(k.F)) +
            rect(14, 24, 112, 18, 3, flat(k.C)) +
            rect(14, 42, 36, 58, 0, flat(k.T, 0.12)) +
            path('M12 42H128M12 62H128M12 82H128M50 24V102M90 24V102', ink(k.T, 3.5)) +
            rect(12, 22, 116, 80, 5, ink(k.L, W)) +
            stud(k, 70, 7, 4.5)
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // A corked bottle on its side, three rolled notes inside waiting their turn at the neck.
        case 'queue': {
          const note = (x: number) => rect(x, 18, 36, 28, 4, paint(SAIL, k.T, 3.5)) + rect(x + 13, 18, 10, 28, 0, flat(OX));
          return (
            path('M12 6H176Q198 6 208 21H246V43H208Q198 58 176 58H12Q4 58 4 50V14Q4 6 12 6Z', body(k, 5)) +
            shade(k, 'M6 46H202Q192 56 176 56H12Q6 56 6 50Z', 0.26) +
            glint('M18 13H166', 3.5) +
            note(22) +
            note(76) +
            note(130) +
            rect(243, 16, 10, 32, 3, body(k, 4)) +
            rect(253, 21, 19, 22, 4, paint(BRASS, k.L, 4)) +
            shade(k, 'M255 34H270V41H255Z', 0.3)
          );
        }
        // A hoist of signal flags: one message run up for every ship in sight.
        case 'topic':
          return (
            path('M3 8H273', ink(k.L, 5)) +
            rect(14, 9, 42, 42, 2, body(k, 4.5)) +
            path('M35 11V49M16 30H54', ink(NAVY, 8)) +
            path('M68 9H110L89 59Z', paint(k.C, k.L, 4.5)) +
            shade(k, 'M89 9H110L89 59Z', 0.26) +
            path('M122 9H162V59L142 45L122 59Z', body(k, 4.5)) +
            rect(124, 20, 36, 12, 0, flat(BRASS)) +
            shade(k, 'M150 11H160V54L150 48Z') +
            rect(174, 9, 42, 42, 2, body(k, 4.5)) +
            path('M174 9H216V51Z', flat(OX)) +
            rect(174, 9, 42, 42, 2, ink(k.L, 4.5)) +
            path('M228 9H270L249 59Z', body(k, 4.5)) +
            shade(k, 'M249 9H270L249 59Z') +
            circle(249, 24, 7, flat(NAVY))
          );
        // A current: a small boat carried along on a band of sea.
        case 'stream':
          return (
            path('M178 26V3', ink(k.L, 4)) +
            path('M183 4L210 22H183Z', paint(SAIL, k.L, 3.5)) +
            path('M173 6L150 22H173Z', paint(OX, k.L, 3.5)) +
            path('M140 26H216Q212 48 196 48H160Q144 48 140 26Z', paint(k.C, k.L, 4.5)) +
            shade(k, 'M186 28H214Q210 46 196 46H176Q186 40 186 28Z', 0.3) +
            path(`${waves(4, 41, 22.3, 9, 12)}V55Q271.6 61 265 61H10Q4 61 4 55Z`, body(k, 5)) +
            shade(k, 'M6 52H270V55Q270 59 265 59H10Q6 59 6 55Z', 0.26) +
            path(waves(15, 51, 22.3, 7, 11), ink(k.C, 4)) +
            glint('M128 44q8 -5 16 0M212 44q8 -5 16 0', 3.5)
          );
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A sailor in a tricorn hat.
        case 'human':
          return sailor(k);
        // A crew of three: the sailor, and a deckhand at each shoulder.
        case 'group':
          return deckhand(k, 24, -1) + deckhand(k, 96, 1) + group('translate(6 7.8) scale(0.9)', sailor(k));
        // A merchant from another port: a cloak, and a wide-brimmed hat with a feather.
        case 'thirdParty':
          return (
            path('M18 78Q30 48 60 48Q90 48 102 78Z', paint(k.C, k.L, W)) +
            shade(k, 'M64 48Q90 48 102 78H76Q82 62 64 48Z', 0.28) +
            path('M47 49L60 70L73 49Z', body(k, 3.5)) +
            circle(60, 35, 13, body(k)) +
            roundShade(k, 60, 35, 8.5, 5.5) +
            path('M75 15Q92 -5 112 9Q96 10 83 23Z', paint(OX, k.L, 3)) +
            path('M44 24Q44 5 60 5Q76 5 76 24Z', paint(k.L, k.L, 3)) +
            ellipse(60, 25, 39, 6.5, flat(k.L)) +
            path('M46 18H74', ink(BRASS, 4))
          );
        // A whole ship under sail: a system that answers for itself.
        case 'system':
          return (
            path('M42 58V4M78 58V10', ink(k.L, 4.5)) +
            path('M42 3L62 8L42 14Z', flat(OX)) +
            path('M22 18Q42 24 60 18V46Q42 52 22 46Z', body(k, 4)) +
            shade(k, 'M48 21Q54 20 60 18V46Q54 48 46 49Z', 0.26) +
            path('M64 22Q78 27 94 22V46Q78 51 64 46Z', body(k, 4)) +
            shade(k, 'M84 24Q90 23 94 22V46Q88 48 82 48Z', 0.26) +
            path('M99 20L117 45H99Z', body(k, 3.5)) +
            path('M4 50H24V58H94L116 47Q113 77 88 77H30Q8 75 4 50Z', paint(k.C, k.L, W)) +
            shade(k, 'M10 67H108Q102 77 88 77H30Q16 76 10 67Z', 0.3) +
            path('M12 65H108', ink(SAIL, 3)) +
            path(waves(2, 79, 14.5, 5, 8), ink(SEA, 3.5))
          );
        // A ship's lantern, lit: something small you carry.
        case 'device':
          return (
            circle(60, 46, 22, flat(BRASS, 0.3)) +
            circle(60, 8, 5.5, ink(k.L, 4)) +
            path('M45 26L52 14H68L75 26Z', paint(BRASS, k.L, 4)) +
            rect(45, 26, 30, 40, 3, body(k, 5)) +
            path('M60 30Q73 47 60 61Q47 47 60 30Z', flat(BRASS)) +
            path('M60 43Q66 51 60 58Q54 51 60 43Z', flat(OX)) +
            shade(k, 'M67 28H73V64H67Z') +
            rect(41, 66, 38, 12, 4, body(k, 5)) +
            shade(k, 'M62 68H77V76H58Z')
          );
        // A parrot on its perch: it listens, and it talks back.
        case 'agent':
          return (
            path('M44 44L5 65L15 78L54 60Z', paint(OX, k.L, 3.5)) +
            path('M32 70H106', ink(k.L, 6.5)) +
            path('M64 28Q40 34 38 52Q40 67 58 66Q80 63 86 44Q86 34 80 28Z', body(k)) +
            shade(k, 'M84 36Q88 56 70 64Q64 66 56 66Q76 58 78 36Z', 0.26) +
            path('M56 36Q44 46 48 60Q66 58 70 40Z', paint(k.C, k.L, 3.5)) +
            circle(74, 21, 16.5, body(k)) +
            path('M66 6Q74 -2 86 4Q78 6 76 10Z', flat(OX)) +
            path('M87 10Q110 12 104 38Q98 26 86 29Z', paint(BRASS, k.L, 3.5)) +
            circle(76, 18, 5.5, flat(SAIL)) +
            circle(77, 18, 3.2, flat(k.T))
          );
      }
    },

    // A plank sawn rough at both ends and nailed down with brass, the middle left clear.
    componentCard: (k) =>
      path('M12 4H288L296 20L290 37L296 54L290 71L296 88L288 104H12L4 88L10 71L4 54L10 37L4 20Z', flat(k.F)) +
      path('M5 90H295L288 104H12Z', flat(k.T, 0.2)) +
      path('M12 4H288L294 15H6Z', flat(SAIL, 0.75)) +
      path('M44 21H98M212 21H252M56 87H112M196 87H256', ink(k.C, 2.8)) +
      path('M12 4H288L296 20L290 37L296 54L290 71L296 88L288 104H12L4 88L10 71L4 54L10 37L4 20Z', ink(k.L, 5)) +
      stud(k, 25, 23) +
      stud(k, 25, 85) +
      stud(k, 275, 23) +
      stud(k, 275, 85),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A cargo crate, cross-braced: its lid and its lee side showing.
        case 'module':
          return (
            ground(k, 64, 100, 54) +
            path('M98 28L114 12V82L98 98Z', paint(k.C, k.L, 5)) +
            shade(k, 'M98 28L114 12V82L98 98Z', 0.3) +
            path('M8 28L24 12H114L98 28Z', body(k, 5)) +
            glint('M27 20H96', 3.5) +
            rect(8, 28, 90, 70, 2, body(k)) +
            path('M21 41L85 85M85 41L21 85', ink(k.L, 5)) +
            rect(21, 41, 64, 44, 1, ink(k.L, 4)) +
            shade(k, 'M21 85L85 41V85Z', 0.18) +
            stud(k, 14.5, 34.5, 3) +
            stud(k, 91.5, 34.5, 3) +
            stud(k, 14.5, 91.5, 3) +
            stud(k, 91.5, 91.5, 3)
          );
        // A grappling hook on its rope: it takes hold of the other ship.
        case 'adapter':
          return (
            path('M67 12Q84 -1 98 13Q109 25 117 9', ink(BRASS, 5.5)) +
            circle(60, 16, 9.5, ink(k.L, 5.5)) +
            path('M60 26V84', ink(k.L, 9)) +
            path('M60 87Q26 91 17 58M60 87Q94 91 103 58', ink(k.L, 8)) +
            path('M7 65L16 42L30 61Z', paint(k.L, k.L, 2)) +
            path('M113 65L104 42L90 61Z', paint(k.L, k.L, 2)) +
            path('M60 82L49 100H71Z', paint(k.L, k.L, 2)) +
            path('M58 30V78M24 74Q34 84 52 85', ink(k.F, 2.8, 0.75))
          );
        // A brass-bolted porthole, the sea showing through: an opening others look in by.
        case 'port': {
          const bolts = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => circle(n(60 + 37.5 * Math.cos((a * Math.PI) / 180)), n(52 + 37.5 * Math.sin((a * Math.PI) / 180)), 3.8, flat(k.L))).join('');
          return (
            rect(103, 41, 14, 22, 3, paint(k.C, k.L, 3.5)) +
            circle(60, 52, 46, body(k)) +
            roundShade(k, 60, 52, 37.5, 13, 0.24) +
            roundGlint(60, 52, 41, 4) +
            circle(60, 52, 28, paint(SEA, k.L, 5.5)) +
            path('M36 52Q48 30 72 28Q54 36 46 56Z', flat(SAIL, 0.3)) +
            path(waves(38, 60, 14.7, 9, 3), ink(SAIL, 4.5)) +
            bolts
          );
        }
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A scroll, rolled at the head and the foot, its first letter illuminated.
        case 'file':
          return (
            rect(15, 14, 56, 72, 0, body(k, 5)) +
            shade(k, 'M58 22H69V78H58Z', 0.18) +
            rect(25, 31, 11, 11, 1, flat(OX)) +
            path('M42 36H58M26 50H58M26 63H46', ink(k.T, 4)) +
            rect(5, 5, 76, 18, 9, body(k, 5)) +
            shade(k, 'M14 15H72Q78 15 78 14V14Q78 21 72 21H14Q9 21 8 16Z', 0.26) +
            rect(5, 77, 76, 18, 9, body(k, 5)) +
            shade(k, 'M14 87H72Q78 87 78 86V86Q78 93 72 93H14Q9 93 8 88Z', 0.26)
          );
        // The ship's wheel: how she is set to run.
        case 'config': {
          const spokes = [0, 45, 90, 135].map((a) => {
            const x = 40.5 * Math.cos((a * Math.PI) / 180);
            const y = 40.5 * Math.sin((a * Math.PI) / 180);
            return `M${n(43 - x)} ${n(50 - y)}L${n(43 + x)} ${n(50 + y)}`;
          });
          return (
            path(spokes.join(''), ink(k.L, 6)) +
            circle(43, 50, 25.5, ink(k.L, 14)) +
            circle(43, 50, 25.5, ink(k.F, 7)) +
            path(arc(43, 50, 25.5, -25, 115), ink(k.T, 7, 0.28)) +
            circle(43, 50, 9.5, paint(BRASS, k.L, 4)) +
            circle(43, 50, 2.8, flat(k.L))
          );
        }
        // A key on a red ribbon.
        case 'secret':
          return (
            path('M36 30Q22 46 17 66M40 32Q32 50 31 70', ink(OX, 5)) +
            path('M47 70H67V80H58V85H67V95H47Z', body(k, 5)) +
            rect(37, 42, 12, 54, 3, body(k, 5)) +
            shade(k, 'M44 46H47V94H44Z', 0.3) +
            circle(43, 25, 21, body(k)) +
            roundShade(k, 43, 25, 14.5, 7, 0.26) +
            roundGlint(43, 25, 15, 3.5) +
            circle(43, 25, 8, paint(k.K, k.L, 4.5))
          );
        // A letter of marque: a written sheet under a wax seal and its ribbons.
        case 'certificate':
          return (
            path('M35 68L23 98L34 91L41 99L45 70Z', paint(k.C, k.L, 3.5)) +
            path('M51 68L63 98L52 91L45 99L41 70Z', paint(k.C, k.L, 3.5)) +
            rect(7, 4, 72, 68, 4, body(k, 5)) +
            shade(k, 'M66 7H77V70H66Z', 0.18) +
            path('M19 17H67M19 30H67', ink(k.T, 4)) +
            poly(burst(43, 60, 19, 15.5, 10), paint(OX, k.L, 3.5)) +
            path(arc(43, 60, 9, -25, 115), ink(k.T, 4.5, 0.35)) +
            circle(43, 60, 8.5, ink(SAIL, 2.8, 0.8))
          );
      }
    },

    // A compass rose: a ring with its points outside it, each point half in light and half in
    // shade, north in red, the middle left empty.
    junction: (k) =>
      path('M18 18L35 23L23 35ZM82 18L65 23L77 35ZM18 82L35 77L23 65ZM82 82L65 77L77 65Z', flat(k.L)) +
      path('M50 99L41 78H59ZM1 50L22 41V59ZM99 50L78 41V59Z', paint(k.F, k.L, 2.5)) +
      path('M50 99V78H59ZM1 50H22V59ZM99 50H78V59Z', flat(k.L)) +
      path('M50 1L41 22H59Z', paint(SAIL, k.L, 2.5)) +
      path('M50 1L59 22H50Z', flat(OX)) +
      circle(50, 50, 34, body(k, 5)) +
      roundShade(k, 50, 50, 28.5, 6, 0.2) +
      roundGlint(50, 50, 29.5, 3) +
      circle(50, 50, 24.5, ink(k.C, 2.6)),
  },

  // The chart the shapes are drawn on: rhumb lines run out from a compass point, soundings are
  // written over the shoals, an island lies off the east edge, and the sea is ruffled here and there.
  backdrop: {
    tile: [TW, TH],
    draw: () => {
      const island = 'M452 316Q466 292 498 298Q526 286 548 304Q574 316 558 340Q534 358 502 348Q466 354 452 316Z';
      const shoal = 'M442 318Q458 280 498 286Q530 272 558 296Q590 314 568 348Q538 370 502 360Q452 366 442 318Z';
      const soundings: [string, number, number, number, number][] = [
        ['7', 62, 52, 1.5, -6],
        ['12', 236, 44, 1.4, 4],
        ['9', 392, 118, 1.5, -3],
        ['24', 300, 196, 1.4, 5],
        ['5', 44, 262, 1.5, 3],
        ['18', 196, 318, 1.4, -5],
        ['3', 396, 300, 1.5, 6],
        ['31', 88, 392, 1.4, 2],
        ['6', 330, 398, 1.5, -4],
        ['15', 452, 222, 1.4, 3],
        ['4', 476, 44, 1.5, -2],
      ];
      return (
        path(
          rhumbs(150, 170, [
            [1, 0],
            [0, 1],
            [1, 1],
            [1, -1],
            [2, 1],
            [2, -1],
            [1, 2],
            [1, -2],
          ]),
          ink('#c9ad7a', 1, 0.36),
        ) +
        path(shoal, ink('#c9ad7a', 1, 0.3)) +
        group('translate(-520 0)', path(shoal, ink('#c9ad7a', 1, 0.3))) +
        path(island, ink('#ccb07c', 1.2, 0.42)) +
        group('translate(-520 0)', path(island, ink('#ccb07c', 1.2, 0.42))) +
        path('M470 318h14M474 326h20M486 334h18M500 322h12', ink('#c2a36c', 1.1, 0.36)) +
        // The rose is drawn in line only and faintly: at a distance it repeats, and must not read as a pattern of dots.
        circle(150, 170, 26, ink('#c2a36c', 1, 0.3)) +
        circle(150, 170, 17, ink('#c2a36c', 1, 0.3)) +
        poly(burst(150, 170, 24, 5, 8), ink('#c2a36c', 1, 0.34)) +
        path('M150 146L150 170L146.5 166.5Z', flat('#9b2a20', 0.28)) +
        path('M150 136l-4 7h8Z', flat('#9b2a20', 0.28)) +
        path(soundings.map(([text, x, y, size, turn]) => sounding(text, x, y, size, turn)).join(''), ink('#a98a55', 1.1, 0.32)) +
        path(`${waves(250, 120, 9, 4, 4)}${waves(262, 130, 9, 4, 3)}${waves(60, 330, 9, 4, 4)}${waves(48, 340, 9, 4, 3)}${waves(340, 262, 9, 4, 3)}${waves(120, 60, 9, 4, 3)}`, ink('#5f9a94', 1.3, 0.45))
      );
    },
  },
};

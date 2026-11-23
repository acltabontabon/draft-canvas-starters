import { scheme, type Kit, type Pack } from '../kit';

/**
 * Geek: a retro computing lab at night, drawn like the inventory screen of a 16-bit game. Every
 * kind of shape is its own piece of old hardware in chunky pixel art: a floppy disk, a cassette, a
 * RAM stick, a router with its antennas, a mainframe with its tape reels. Everything is built from
 * square blocks on a grid, so diagonals are stairs and corners are sharp. Each object is lit from
 * the top left in three tones of its own phosphor colour, glows a little against the black tube,
 * and carries a spot of amber, magenta or cyan where a light is on. The canvas behind is the tube
 * itself: faint scanlines and a few stray characters. Always dark: phosphor needs a black screen.
 */

/** A block: x, y, width, height. */
type Box = readonly [x: number, y: number, w: number, h: number];

/* ---------------------------------------------------------------- palette -- */

/** The black of the tube, darker than the canvas: screens, slots and shade. */
const INK = '#030a07';
/** The lights that are on: amber first, then a little magenta and cyan. */
const AMBER = '#ffb53f';
const GOLD = '#b8741c';
const MAG = '#ff5fb2';
const CYAN = '#62e8ff';
/** The brightest pixel on a lit edge. */
const WHITE = '#f3fff8';

/* ------------------------------------------------------------ pixel engine -- */

/** Every drawing is rasterised on a one-unit grid, so overlapping blocks become one clean shape. */
const GW = 352;
const GH = 140;
type Mask = Uint8Array;

function raster(boxes: readonly Box[], grow = 0): Mask {
  const m = new Uint8Array(GW * GH);
  for (const [bx, by, bw, bh] of boxes) {
    const x0 = Math.max(0, Math.round(bx) - grow);
    const y0 = Math.max(0, Math.round(by) - grow);
    const x1 = Math.min(GW, Math.round(bx + bw) + grow);
    const y1 = Math.min(GH, Math.round(by + bh) + grow);
    for (let y = y0; y < y1; y += 1) m.fill(1, y * GW + x0, y * GW + x1);
  }
  return m;
}

/** Path data for a mask: runs of pixels merged along each row, then down the rows. */
function trace(m: Mask): string {
  const out: number[][] = [];
  let open = new Map<number, number[]>();
  for (let y = 0; y < GH; y += 1) {
    const next = new Map<number, number[]>();
    let x = 0;
    while (x < GW) {
      if (!m[y * GW + x]) {
        x += 1;
        continue;
      }
      let end = x;
      while (end < GW && m[y * GW + end]) end += 1;
      const key = x * 1000 + end;
      const above = open.get(key);
      if (above) {
        above[3]! += 1;
        next.set(key, above);
      } else {
        const made = [x, y, end - x, 1];
        out.push(made);
        next.set(key, made);
      }
      x = end;
    }
    open = next;
  }
  return out.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w!}z`).join('');
}

const fillOf = (m: Mask, colour: string, opacity = 1): string => {
  const d = trace(m);
  return d ? `<path d="${d}" fill="${colour}"${opacity < 1 ? ` opacity="${opacity}"` : ''}/>` : '';
};

/** Blocks in one flat colour. */
const px = (colour: string, ...boxes: Box[]): string => fillOf(raster(boxes), colour);
/** Blocks in one colour, seen through. */
const pxa = (colour: string, opacity: number, ...boxes: Box[]): string => fillOf(raster(boxes), colour, opacity);
/** Blocks grown on every side: an outline, or a glow. */
const grown = (colour: string, grow: number, opacity: number, ...boxes: Box[]): string => fillOf(raster(boxes, grow), colour, opacity);

/** The soft phosphor glow around a thing: its outline again, wider and faint. */
const halo = (k: Kit, boxes: readonly Box[], reach = 9, opacity = 0.16): string => fillOf(raster(boxes, reach), k.L, opacity);

interface Look {
  /** Outline thickness. */
  t?: number;
  /** How wide the lit and shaded edges are. */
  s?: number;
  /** How strongly the body is washed with the line colour over its fill. 0 leaves it flat. */
  tone?: number;
  /** How bright the lit edge is. */
  hi?: number;
  /** How far the glow reaches past the outline. 0 for none. */
  glow?: number;
}

/**
 * A solid thing made of blocks, lit from the top left: a glow, a square-cornered outline in the
 * shape's line colour, its fill left dark along the bottom and right, washed with the line colour
 * everywhere else, and a bright edge along the top and left.
 */
function solid(k: Kit, boxes: readonly Box[], look: Look = {}): string {
  const { t = 5, s = 4, tone = 0.36, hi = 0.8, glow = 4 } = look;
  const m = raster(boxes);
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < GW && y < GH && m[y * GW + x] === 1;
  const body = new Uint8Array(GW * GH);
  const lit = new Uint8Array(GW * GH);
  for (let y = 0; y < GH; y += 1) {
    for (let x = 0; x < GW; x += 1) {
      if (!m[y * GW + x]) continue;
      if (!inside(x + s, y) || !inside(x, y + s)) continue;
      body[y * GW + x] = 1;
      if (!inside(x - s, y) || !inside(x, y - s)) lit[y * GW + x] = 1;
    }
  }
  return (
    (glow ? fillOf(raster(boxes, t + glow), k.L, 0.16) : '') +
    (t ? fillOf(raster(boxes, t), k.L) : '') +
    fillOf(m, k.F) +
    (tone ? fillOf(body, k.L, tone) : '') +
    (hi ? fillOf(lit, k.C, hi) : '')
  );
}

/** A dark glass screen in a thin frame, with a streak of glare in its top right corner. */
const screen = (k: Kit, [x, y, w, h]: Box, t = 3): string =>
  grown(k.L, t, 1, [x, y, w, h]) + px(INK, [x, y, w, h]) + pxa(k.C, 0.28, [x + w - 16, y + 2, 12, 3], [x + w - 7, y + 5, 5, 3]);

/** Lights that are on: each block glows, and has one white pixel in its lit corner. */
function lamp(colour: string, boxes: readonly Box[], spec: 'all' | 'first' | 'none' = 'all'): string {
  const marks = (spec === 'all' ? boxes : spec === 'first' ? boxes.slice(0, 1) : []).filter(([, , w, h]) => w >= 6 && h >= 5).map(([x, y]): Box => [x + 1, y + 1, 3, 3]);
  return fillOf(raster(boxes, 3), colour, 0.26) + fillOf(raster(boxes), colour) + (marks.length ? fillOf(raster(marks), WHITE, 0.9) : '');
}

/** A little moulded block: lit along its top and left, shaded along its bottom and right. */
function chip(colour: string, boxes: readonly Box[], s = 3): string {
  return (
    px(colour, ...boxes) +
    pxa(WHITE, 0.6, ...boxes.flatMap(([x, y, w, h]): Box[] => [[x, y, w, s], [x, y, s, h]])) +
    pxa(INK, 0.4, ...boxes.flatMap(([x, y, w, h]): Box[] => [[x + s, y + h - s, w - s, s], [x + w - s, y + s, s, h - s]]))
  );
}

/** The line of light a standing thing throws on the bench under it. */
const ground = (k: Kit, x: number, y: number, w: number): string => pxa(k.L, 0.3, [x + 6, y, w - 12, 3], [x, y, 3, 3], [x + w - 3, y, 3, 3]);

/** A pixel disc: three crossed blocks. */
const disc = (cx: number, cy: number, r: number): Box[] => {
  const a = Math.round(r * 0.42);
  const b = Math.round(r * 0.76);
  return [
    [cx - a, cy - r, a * 2, r * 2],
    [cx - b, cy - b, b * 2, b * 2],
    [cx - r, cy - a, r * 2, a * 2],
  ];
};

/** Which of a digit's seven segments are lit. */
const SEGMENTS: Record<string, string> = { '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '7': 'abc' };

/** A seven-segment digit, `w` by `h`, its strokes `t` thick. */
function digit(ch: string, x: number, y: number, w: number, h: number, t: number): Box[] {
  const half = h / 2;
  const all: Record<string, Box> = {
    a: [x, y, w, t],
    b: [x + w - t, y, t, half],
    c: [x + w - t, y + half, t, half],
    d: [x, y + h - t, w, t],
    e: [x, y + half, t, half],
    f: [x, y, t, half],
    g: [x, y + (h - t) / 2, w, t],
  };
  return [...SEGMENTS[ch]!].map((segment) => all[segment]!);
}

/** A pixel person: a head with stepped corners and a fringe, on a body with stepped shoulders. */
function person(k: Kit, cx: number, top: number, head: number, wide: number, bottom: number, glasses: boolean, tone = 0.36): string {
  const hx = cx - head / 2;
  const left = cx - wide / 2;
  const ty = top + head + 10;
  const eye = top + Math.round(head * 0.34);
  const g = Math.round(head * 0.4);
  const dot = head >= 24 ? 5 : 4;
  const inset = Math.round(head * 0.2);
  return (
    solid(
      k,
      [
        [left + 14, ty, wide - 28, 6],
        [left + 6, ty + 6, wide - 12, 8],
        [left, ty + 14, wide, bottom - ty - 14],
      ],
      { glow: 0, tone },
    ) +
    pxa(INK, 0.5, [cx - 4, ty, 8, 7]) +
    solid(
      k,
      [
        [hx + 4, top, head - 8, head],
        [hx, top + 4, head, head - 8],
      ],
      { glow: 0, tone },
    ) +
    pxa(INK, 0.55, [hx + 4, top, head - 8, Math.round(head * 0.22)], [hx, top + 4, 5, Math.round(head * 0.3)], [hx + head - 5, top + 4, 5, Math.round(head * 0.18)]) +
    (glasses
      ? px(k.T, [hx + 1, eye, g, 10], [hx + head - 1 - g, eye, g, 10], [hx + 1 + g, eye + 3, head - 2 - g * 2, 3]) +
        px(INK, [hx + 3, eye + 2, g - 4, 6], [hx + head + 1 - g, eye + 2, g - 4, 6]) +
        px(CYAN, [hx + 3, eye + 2, 3, 3], [hx + head + 1 - g, eye + 2, 3, 3]) +
        px(k.T, [cx - 4, top + head - 5, 8, 3])
      : px(k.T, [hx + inset, eye + 1, dot, dot], [hx + head - inset - dot, eye + 1, dot, dot]))
  );
}

const personBoxes = (cx: number, top: number, head: number, wide: number, bottom: number): Box[] => [
  [cx - wide / 2, top + head + 24, wide, bottom - top - head - 24],
  [cx - head / 2, top, head, head + 24],
];

/** The long tray every queue is drawn in, its ends stepped, with a dark channel down its middle. */
const tray = (k: Kit): string =>
  solid(
    k,
    [
      [11, 9, 254, 46],
      [5, 15, 266, 34],
    ],
    { tone: 0.3 },
  ) + px(INK, [15, 15, 246, 34]);

/* ---------------------------------------------------------------- backdrop -- */

/** A three by five character, for the stray text left on the tube. */
const FONT: Record<string, string[]> = {
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  C: ['###', '#..', '#..', '#..', '###'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  '>': ['#..', '.#.', '..#', '.#.', '#..'],
  _: ['...', '...', '...', '...', '###'],
  ':': ['...', '.#.', '...', '.#.', '...'],
  ' ': ['...', '...', '...', '...', '...'],
};

/** Path data for a word of the tube's font, its pixels `c` across, runs along a row joined. */
function word(text: string, x: number, y: number, c: number): string {
  let d = '';
  [...text].forEach((ch, index) => {
    const rows = FONT[ch]!;
    rows.forEach((row, j) => {
      let i = 0;
      while (i < 3) {
        if (row[i] !== '#') {
          i += 1;
          continue;
        }
        let end = i;
        while (end < 3 && row[end] === '#') end += 1;
        d += `M${x + (index * 4 + i) * c} ${y + j * c}h${(end - i) * c}v${c}h${-(end - i) * c}z`;
        i = end;
      }
    });
  });
  return d;
}

const TILE = [480, 360] as const;

function tube(): string {
  let scan = '';
  for (let y = 2; y < TILE[1]; y += 6) scan += `M0 ${y}h${TILE[0]}v2h${-TILE[0]}z`;
  const cross = (x: number, y: number) => `M${x - 5} ${y - 1}h11v2h-11zM${x - 1} ${y - 5}h2v11h-2z`;
  const text = word('>_', 30, 38, 3) + word('7F 0A', 214, 20, 3) + word('10', 392, 98, 3) + word('C4', 122, 140, 3) + word('E7', 306, 176, 3) + word('01:10', 44, 254, 3) + word('FF 4C', 400, 272, 3) + word('A0', 216, 314, 3);
  const marks = cross(152, 62) + cross(442, 164) + cross(92, 322) + cross(272, 218) + cross(250, 98) + cross(20, 158);
  return (
    `<path d="${scan}" fill="#0f1c16"/>` +
    `<path d="${marks}" fill="#11251a"/>` +
    `<path d="${text}" fill="#12281b"/>` +
    // The prompt's cursor, and two stuck pixels.
    `<path d="M56 38h7v15h-7z" fill="${AMBER}" opacity="0.2"/>` +
    `<path d="M330 176h3v3h-3zM176 326h4v4h-4z" fill="${MAG}" opacity="0.22"/>` +
    `<path d="M108 80h4v4h-4zM446 320h4v4h-4z" fill="${CYAN}" opacity="0.22"/>`
  );
}

/* -------------------------------------------------------------------- pack -- */

export const geek: Pack = {
  id: 'geek',
  name: 'Geek',
  summary: 'A retro computing lab in glowing phosphor: every shape its own piece of 16-bit pixel hardware',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 20,
  style: {
    hand: { base: 'clean' },
    general: { corners: 'sharp', shadow: false },
    connectors: { head: 'triangle' },
    schemes: {
      dark: scheme(
        { canvas: '#0b1410', grid: '#16261f', text: '#d2fbe4', textMuted: '#7fbf9f', edge: '#46c48c', edgeText: '#a9ecd2', edgeLabelBg: '#0f1d17', codeBg: '#0e1b15', codeBorder: '#1f3a2e' },
        {
          neutral: ['#0f261b', '#3fd08a', '#d6ffe8', '#8dffc2'],
          teal: ['#0b2a27', '#2fcdb6', '#cdfaf1', '#74f2de'],
          blue: ['#0e2440', '#55a9f2', '#d8ecff', '#8fcbff'],
          violet: ['#211a40', '#a48ff7', '#e8e1ff', '#c4b5ff'],
          amber: ['#2e230b', '#e9b243', '#fff0cc', '#ffd27a'],
          rose: ['#35151f', '#f4739a', '#ffdde6', '#ffa3bd'],
          green: ['#12301a', '#6fdc6f', '#dcfbdc', '#a2f59a'],
        },
      ),
    },
  },
  backdrop: { tile: TILE, draw: () => tube() },
  draw: {
    serviceCard: (k, kind) => {
      // A terminal window with a hard pixel shadow: a ruled title bar with three lit buttons, the
      // rest a flat dark field for the name and whatever is written under it.
      const window =
        px(k.L, [0, 0, 348, 132]) +
        px(k.F, [6, 24, 336, 102]) +
        pxa(k.C, 0.8, [0, 0, 348, 3], [0, 3, 3, 129]) +
        pxa(INK, 0.4, [345, 3, 3, 129], [3, 129, 342, 3]) +
        pxa(INK, 0.4, [64, 7, 272, 2], [64, 11, 272, 2], [64, 15, 272, 2], [64, 19, 272, 2]) +
        px(INK, [9, 6, 13, 13], [26, 6, 13, 13], [43, 6, 13, 13]) +
        px(AMBER, [11, 8, 9, 9]) +
        px(MAG, [28, 8, 9, 9]) +
        px(CYAN, [45, 8, 9, 9]) +
        pxa(WHITE, 0.85, [12, 9, 3, 3], [29, 9, 3, 3], [46, 9, 3, 3]) +
        pxa(INK, 0.5, [338, 24, 4, 102], [6, 122, 332, 4]) +
        pxa(k.L, 0.25, [6, 24, 3, 98]);
      switch (kind) {
        case 'api':
          // The same window with a three-pin socket let into its left edge, for callers to plug into.
          return window + px(k.L, [0, 40, 22, 6], [16, 40, 6, 54], [0, 88, 22, 6]) + px(INK, [0, 46, 16, 42]) + px(k.C, [2, 50, 10, 8], [2, 74, 10, 8]) + lamp(AMBER, [[2, 62, 10, 8]], 'none');
        default:
          return window;
      }
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        case 'worker':
          // A desktop computer: a prompt on the screen and a row of blocks filling up as it works.
          return (
            ground(k, 4, 100, 128) +
            solid(k, [
              [20, 6, 96, 60],
              [56, 66, 24, 12],
              [14, 78, 108, 6],
              [8, 84, 120, 12],
            ]) +
            screen(k, [30, 14, 76, 40]) +
            px(k.C, [35, 19, 5, 5], [40, 24, 5, 5], [35, 29, 5, 5], [50, 26, 20, 5]) +
            lamp(AMBER, [[75, 22, 8, 10]], 'none') +
            px(k.C, [35, 41, 10, 8], [48, 41, 10, 8], [61, 41, 10, 8]) +
            pxa(k.L, 0.45, [74, 41, 10, 8], [87, 41, 10, 8]) +
            pxa(INK, 0.55, [16, 88, 74, 4], [96, 88, 24, 4], [30, 58, 22, 4]) +
            px(AMBER, [98, 58, 8, 4])
          );
        case 'external':
          // A satellite dish on its mast, tilted up at a far-off star.
          return (
            ground(k, 20, 101, 76) +
            px(k.L, [52, 84, 12, 12], [28, 94, 60, 7], [64, 22, 8, 8], [72, 14, 8, 8]) +
            pxa(k.C, 0.75, [52, 84, 3, 10], [28, 94, 60, 2]) +
            solid(k, [
              [22, 6, 10, 10],
              [16, 16, 26, 10],
              [14, 26, 38, 10],
              [14, 36, 48, 10],
              [16, 46, 56, 10],
              [22, 56, 60, 10],
              [30, 66, 56, 10],
              [44, 76, 28, 6],
            ]) +
            px(k.C, [32, 16, 10, 10], [42, 26, 10, 10], [52, 36, 10, 10], [62, 46, 10, 10], [72, 56, 10, 10]) +
            lamp(AMBER, [[80, 2, 12, 12]]) +
            px(CYAN, [96, 22, 5, 5], [101, 27, 5, 9], [96, 36, 5, 5], [108, 16, 5, 5], [113, 21, 5, 21], [108, 42, 5, 5]) +
            px(k.C, [116, 60, 6, 22], [108, 68, 22, 6]) +
            px(WHITE, [116, 68, 6, 6]) +
            px(MAG, [124, 2, 6, 6], [100, 88, 6, 6])
          );
        case 'scheduler':
          // A digital alarm clock: a snooze bar, two feet and big segment digits.
          return (
            ground(k, 6, 100, 124) +
            px(k.L, [18, 88, 14, 10], [104, 88, 14, 10]) +
            solid(k, [
              [46, 8, 44, 9],
              [10, 22, 116, 62],
            ]) +
            screen(k, [20, 34, 96, 42]) +
            px(k.C, ...digit('1', 24, 38, 16, 34, 5), ...digit('2', 44, 38, 16, 34, 5), ...digit('3', 74, 38, 16, 34, 5), ...digit('0', 94, 38, 16, 34, 5)) +
            lamp(AMBER, [
              [64, 46, 6, 6],
              [64, 60, 6, 6],
            ], 'none') +
            px(MAG, [106, 25, 10, 4])
          );
        case 'gateway':
          // A router: two antennas, a row of port lights, and an arrow showing the one way in.
          return (
            ground(k, 6, 100, 124) +
            px(k.L, [16, 12, 12, 42], [108, 12, 12, 42], [16, 92, 14, 6], [106, 92, 14, 6]) +
            pxa(k.C, 0.75, [16, 12, 3, 42], [108, 12, 3, 42]) +
            lamp(CYAN, [
              [14, 2, 16, 10],
              [106, 2, 16, 10],
            ]) +
            grown(k.T, 3, 0.2, [62, 2, 12, 20], [46, 22, 44, 6], [52, 28, 32, 6], [58, 34, 20, 6], [64, 40, 8, 6]) +
            px(k.T, [62, 2, 12, 20], [46, 22, 44, 6], [52, 28, 32, 6], [58, 34, 20, 6], [64, 40, 8, 6]) +
            solid(k, [[10, 56, 116, 32]]) +
            lamp(AMBER, [[18, 66, 10, 12]]) +
            px(k.C, [34, 66, 10, 12], [50, 66, 10, 12], [66, 66, 10, 12]) +
            px(INK, [86, 66, 32, 12]) +
            pxa(k.C, 0.6, [90, 70, 24, 4])
          );
        case 'load-balancer':
          // A network switch: one cable in at the top, three out to three machines below.
          return (
            px(k.L, [65, 6, 6, 18], [38, 58, 6, 18], [19, 72, 25, 6], [19, 72, 6, 12], [65, 58, 6, 26], [92, 58, 6, 18], [92, 72, 25, 6], [111, 72, 6, 12]) +
            lamp(CYAN, [[59, 0, 18, 12]]) +
            solid(k, [[26, 28, 84, 26]]) +
            px(INK, [32, 34, 46, 14], [90, 34, 14, 14]) +
            px(k.T, [34, 36, 10, 10], [50, 36, 10, 10], [66, 36, 10, 10]) +
            lamp(AMBER, [[92, 36, 10, 10]]) +
            solid(
              k,
              [
                [10, 88, 24, 10],
                [56, 88, 24, 10],
                [102, 88, 24, 10],
              ],
              { t: 4, glow: 3, s: 3 },
            ) +
            px(k.T, [14, 91, 5, 4], [60, 91, 5, 4], [106, 91, 5, 4])
          );
        case 'proxy':
          // A relay box standing between two parties: one arrow passes through each way.
          return (
            grown(k.C, 3, 0.2, [4, 28, 110, 8], [112, 18, 8, 28], [120, 22, 7, 20], [127, 28, 7, 8]) +
            px(k.C, [4, 28, 110, 8], [112, 18, 8, 28], [120, 22, 7, 20], [127, 28, 7, 8]) +
            grown(AMBER, 3, 0.2, [22, 68, 110, 8], [16, 58, 8, 28], [9, 62, 7, 20], [2, 68, 7, 8]) +
            px(AMBER, [22, 68, 110, 8], [16, 58, 8, 28], [9, 62, 7, 20], [2, 68, 7, 8]) +
            solid(k, [[50, 8, 36, 88]]) +
            px(INK, [50, 26, 6, 12], [80, 26, 6, 12], [50, 66, 6, 12], [80, 66, 6, 12]) +
            lamp(CYAN, [[62, 14, 12, 7]]) +
            pxa(INK, 0.55, [60, 44, 16, 5], [60, 53, 16, 5]) +
            px(MAG, [64, 84, 8, 5])
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        case 'generic':
          // A floppy disk: a metal shutter at the top, a written label below.
          return (
            solid(k, [
              [22, 6, 84, 96],
              [106, 18, 12, 84],
            ]) +
            px(k.C, [44, 3, 48, 29]) +
            pxa(WHITE, 0.6, [44, 3, 48, 3], [44, 3, 3, 29]) +
            pxa(INK, 0.35, [89, 6, 3, 26]) +
            px(INK, [72, 9, 11, 18], [27, 90, 6, 8]) +
            pxa(k.T, 0.94, [38, 52, 64, 50]) +
            px(MAG, [38, 52, 64, 6]) +
            pxa(INK, 0.7, [46, 66, 48, 5], [46, 77, 48, 5], [46, 88, 30, 5])
          );
        case 'sql':
          // A deck of punched cards, every hole in its row and column.
          return (
            halo(k, [
              [34, 8, 96, 56],
              [10, 36, 96, 62],
            ]) +
            solid(k, [[34, 8, 96, 56]], { tone: 0.12, hi: 0.4, glow: 0 }) +
            solid(k, [[22, 22, 96, 56]], { tone: 0.22, hi: 0.6, glow: 0 }) +
            solid(
              k,
              [
                [22, 36, 84, 10],
                [10, 46, 96, 52],
              ],
              { glow: 0 },
            ) +
            px(INK, ...[0, 1, 2].flatMap((row) => [0, 1, 2, 3, 4].map((col): Box => [19 + col * 17, 53 + row * 14, 10, 9]))) +
            lamp(
              AMBER,
              [
                [36, 53, 10, 9],
                [70, 67, 10, 9],
                [19, 81, 10, 9],
              ],
              'none',
            ) +
            lamp(CYAN, [[53, 81, 10, 9]], 'none')
          );
        case 'nosql':
          // A cassette tape: two reels behind a window, anything recorded on it in any order.
          return (
            solid(k, [
              [16, 14, 108, 78],
              [10, 20, 120, 66],
            ]) +
            pxa(k.T, 0.94, [20, 22, 100, 44]) +
            px(AMBER, [20, 26, 100, 5]) +
            px(MAG, [20, 33, 100, 4]) +
            px(INK, [32, 41, 76, 20]) +
            px(k.C, ...disc(50, 51, 8), ...disc(90, 51, 8)) +
            px(k.L, [58, 48, 24, 6]) +
            px(INK, [47, 48, 6, 6], [87, 48, 6, 6]) +
            px(k.L, [36, 72, 68, 4], [36, 72, 4, 20], [100, 72, 4, 20]) +
            px(k.C, [48, 80, 6, 6], [86, 80, 6, 6]) +
            lamp(AMBER, [[64, 80, 12, 6]], 'none')
          );
        case 'cache':
          // A stick of RAM: gold contacts along the bottom, two chips and a bolt for speed.
          return (
            px(AMBER, ...[0, 1, 2, 3, 4, 6, 7, 8, 9, 10].map((i): Box => [12 + i * 11, 72, 7, 22])) +
            px(GOLD, ...[0, 1, 2, 3, 4, 6, 7, 8, 9, 10].map((i): Box => [12 + i * 11, 88, 7, 6])) +
            solid(k, [
              [10, 18, 120, 16],
              [18, 34, 104, 12],
              [10, 46, 120, 24],
            ]) +
            px(INK, [22, 26, 24, 38], [94, 26, 24, 38]) +
            pxa(k.C, 0.7, [22, 26, 24, 3], [94, 26, 24, 3], [22, 29, 3, 35], [94, 29, 3, 35]) +
            grown(CYAN, 3, 0.3, [71, 22, 14, 7], [64, 29, 14, 7], [57, 36, 35, 7], [71, 43, 14, 7], [64, 50, 14, 7], [57, 57, 14, 7]) +
            px(k.T, [71, 22, 14, 7], [64, 29, 14, 7], [57, 36, 35, 7], [71, 43, 14, 7], [64, 50, 14, 7], [57, 57, 14, 7])
          );
        case 'file-system':
          // A tabbed folder with a sheet showing, and a little tree of what is inside it on the front.
          return (
            px(k.L, [66, 10, 54, 20]) +
            pxa(k.T, 0.94, [69, 13, 48, 16]) +
            pxa(INK, 0.6, [75, 18, 30, 3]) +
            solid(k, [
              [12, 10, 46, 18],
              [12, 28, 116, 68],
            ]) +
            px(k.L, [6, 38, 128, 6]) +
            pxa(k.C, 0.8, [6, 38, 128, 2]) +
            pxa(k.L, 0.9, [26, 62, 3, 26], [26, 71, 14, 3], [26, 85, 14, 3]) +
            px(k.T, [22, 54, 10, 8], [40, 68, 10, 8], [40, 82, 10, 8]) +
            px(k.C, [38, 54, 50, 8], [56, 68, 52, 8]) +
            lamp(AMBER, [[56, 82, 36, 8]], 'none')
          );
        case 'object-storage':
          // A hooped bucket heaped with blobs of every shape.
          return (
            solid(k, [[30, 8, 22, 28]], { tone: 0.6, glow: 0 }) +
            lamp(CYAN, disc(74, 20, 13), 'none') +
            pxa(WHITE, 0.9, [66, 10, 5, 5]) +
            lamp(AMBER, [[98, 8, 18, 28]]) +
            pxa(INK, 0.3, [112, 8, 4, 28]) +
            solid(k, [
              [20, 48, 100, 28],
              [30, 76, 80, 22],
            ]) +
            px(k.L, [8, 34, 124, 14], [20, 62, 100, 5]) +
            pxa(k.C, 0.8, [8, 34, 124, 3], [8, 34, 3, 14]) +
            pxa(INK, 0.4, [8, 44, 124, 4])
          );
        case 'search-index':
          // An index card with a magnifier over it, one entry found.
          return (
            solid(k, [
              [10, 8, 30, 12],
              [10, 20, 78, 78],
            ]) +
            pxa(k.T, 0.85, [20, 30, 34, 5], [20, 44, 30, 5], [20, 58, 26, 5], [20, 72, 30, 5], [20, 86, 46, 5]) +
            px(k.L, [108, 74, 12, 12], [116, 82, 12, 12], [124, 90, 12, 14]) +
            pxa(k.C, 0.8, [112, 74, 8, 3], [120, 82, 8, 3], [128, 90, 8, 3]) +
            grown(k.L, 11, 0.16, ...disc(92, 52, 24)) +
            grown(k.L, 7, 1, ...disc(92, 52, 24)) +
            pxa(k.C, 0.8, [82, 21, 20, 3], [61, 42, 3, 20]) +
            px(INK, ...disc(92, 52, 24)) +
            pxa(CYAN, 0.16, ...disc(92, 52, 24)) +
            pxa(WHITE, 0.55, [78, 34, 12, 4], [74, 38, 4, 8]) +
            lamp(AMBER, [[76, 50, 32, 8]], 'none')
          );
        case 'table':
          // A sheet of green-bar tractor-feed printout: one header row, ruled rows and a column under it.
          return (
            solid(k, [[12, 8, 116, 90]]) +
            px(INK, ...[0, 1, 2, 3, 4, 5].flatMap((i): Box[] => [[16, 14 + i * 14, 6, 6], [118, 14 + i * 14, 6, 6]])) +
            pxa(INK, 0.5, [26, 8, 2, 90], [112, 8, 2, 90]) +
            pxa(k.C, 0.3, [32, 44, 76, 11], [32, 68, 76, 11]) +
            px(k.C, [32, 14, 76, 14]) +
            pxa(k.T, 0.9, [36, 33, 14, 5], [60, 33, 40, 5], [36, 47, 14, 5], [60, 47, 30, 5], [36, 59, 14, 5], [60, 59, 42, 5], [36, 83, 14, 5], [60, 83, 26, 5]) +
            pxa(k.T, 0.9, [36, 71, 14, 5]) +
            lamp(AMBER, [[60, 71, 36, 5]], 'none') +
            pxa(INK, 0.6, [54, 14, 3, 78])
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        case 'queue':
          // Packets lined up in a tray, the one at the head framed and lit amber, room for more at the tail.
          return (
            tray(k) +
            pxa(k.L, 0.7, [26, 29, 6, 6], [54, 29, 6, 6], [82, 29, 6, 6], [110, 29, 6, 6]) +
            chip(k.C, [
              [134, 21, 22, 22],
              [162, 21, 22, 22],
              [190, 21, 22, 22],
            ]) +
            px(k.T, [221, 17, 34, 30]) +
            grown(AMBER, 3, 0.26, [221, 17, 34, 30]) +
            chip(AMBER, [[225, 21, 26, 22]])
          );
        case 'topic':
          // One block's trace splitting three ways, to three receivers.
          return (
            tray(k) +
            px(k.T, [44, 30, 88, 4], [130, 19, 4, 27], [130, 19, 72, 4], [130, 30, 72, 4], [130, 42, 72, 4]) +
            grown(AMBER, 3, 0.26, [20, 20, 24, 24]) +
            chip(AMBER, [[20, 20, 24, 24]]) +
            px(k.C, [202, 17, 52, 8], [202, 28, 52, 8], [202, 40, 52, 8]) +
            px(WHITE, [249, 17, 5, 8]) +
            px(MAG, [249, 28, 5, 8]) +
            px(CYAN, [249, 40, 5, 8])
          );
        case 'stream': {
          // An oscilloscope trace: a square wave running the whole length, the pen at its head.
          const wave: Box[] = [];
          for (let i = 0; i < 10; i += 1) {
            const x = 20 + i * 23;
            wave.push([x, i % 2 === 0 ? 40 : 19, 28, 5]);
            if (i < 9) wave.push([x + 23, 19, 5, 26]);
          }
          return (
            tray(k) +
            pxa(k.L, 0.28, ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i): Box => [42 + i * 23, 15, 2, 34]), [15, 31, 246, 2]) +
            grown(k.C, 2, 0.25, ...wave) +
            px(k.C, ...wave) +
            lamp(AMBER, [[250, 15, 10, 13]])
          );
        }
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        case 'human':
          // A pixel person in glasses, a pen in the shirt pocket.
          return halo(k, personBoxes(60, 6, 30, 66, 76)) + person(k, 60, 6, 30, 66, 76, true) + px(AMBER, [72, 62, 5, 10]) + px(WHITE, [72, 62, 5, 3]);
        case 'group':
          // Three pixel people, the one in front in glasses.
          return (
            halo(k, [...personBoxes(26, 22, 20, 40, 76), ...personBoxes(94, 22, 20, 40, 76), ...personBoxes(60, 6, 26, 54, 76)]) +
            person(k, 26, 22, 20, 40, 76, false, 0.2) +
            person(k, 94, 22, 20, 40, 76, false, 0.2) +
            person(k, 60, 6, 26, 54, 76, true)
          );
        case 'thirdParty':
          // A visitor: a person set between square brackets, wearing an amber badge.
          return (
            px(k.C, [4, 4, 8, 74], [4, 4, 20, 8], [4, 70, 20, 8], [108, 4, 8, 74], [96, 4, 20, 8], [96, 70, 20, 8]) +
            pxa(WHITE, 0.5, [4, 4, 20, 3], [4, 7, 3, 71], [96, 4, 20, 3], [108, 12, 3, 58]) +
            halo(k, personBoxes(60, 10, 26, 48, 76), 7) +
            person(k, 60, 10, 26, 48, 76, false) +
            px(k.T, [59, 46, 3, 14]) +
            lamp(AMBER, [[53, 58, 14, 12]], 'none') +
            pxa(INK, 0.7, [56, 62, 8, 2], [56, 66, 5, 2])
          );
        case 'system':
          // A mainframe cabinet: two tape reels over a panel of lights.
          return (
            px(k.L, [16, 76, 14, 5], [90, 76, 14, 5]) +
            solid(k, [[10, 6, 100, 66]]) +
            grown(k.L, 4, 1, ...disc(36, 25, 12), ...disc(84, 25, 12)) +
            px(INK, ...disc(36, 25, 12), ...disc(84, 25, 12)) +
            pxa(k.C, 0.45, [28, 17, 8, 3], [28, 20, 3, 5], [76, 17, 8, 3], [76, 20, 3, 5]) +
            px(k.C, [32, 21, 8, 8], [80, 21, 8, 8]) +
            pxa(k.T, 0.9, [52, 12, 16, 3]) +
            px(k.L, [10, 44, 100, 4]) +
            px(k.C, [18, 54, 8, 8], [30, 54, 8, 8]) +
            lamp(MAG, [[42, 54, 8, 8]]) +
            lamp(AMBER, [[54, 54, 8, 8]]) +
            pxa(INK, 0.6, [72, 53, 30, 4], [72, 61, 30, 4])
          );
        case 'device':
          // A handheld game console: a little invader on its screen, a cross pad and two buttons.
          return (
            solid(k, [[43, 6, 34, 70]], { glow: 0 }) +
            px(k.L, [47, 10, 26, 28]) +
            px(INK, [49, 12, 22, 24]) +
            px(k.C, [53, 17, 4, 4], [63, 17, 4, 4], [51, 21, 18, 4], [55, 25, 10, 4], [51, 29, 4, 4], [65, 29, 4, 4]) +
            px(INK, [55, 21, 3, 3], [62, 21, 3, 3]) +
            px(k.T, [46, 52, 14, 5], [50, 48, 5, 13]) +
            lamp(AMBER, [[67, 45, 7, 7]], 'none') +
            lamp(MAG, [[62, 55, 7, 7]], 'none') +
            pxa(INK, 0.6, [62, 67, 10, 2], [62, 71, 10, 2])
          );
        case 'agent':
          // A boxy robot: an antenna with a lit tip, glowing eyes, a grille and two arms.
          return (
            px(k.L, [57, 8, 6, 10], [52, 50, 16, 10], [22, 26, 8, 14], [90, 26, 8, 14], [22, 60, 14, 6], [22, 60, 6, 16], [84, 60, 14, 6], [92, 60, 6, 16]) +
            px(k.C, [20, 74, 10, 6], [90, 74, 10, 6]) +
            lamp(AMBER, [[53, 0, 14, 9]]) +
            solid(k, [
              [30, 18, 60, 32],
              [40, 60, 40, 16],
            ]) +
            px(INK, [37, 24, 20, 15], [63, 24, 20, 15], [46, 42, 28, 5]) +
            lamp(CYAN, [
              [41, 27, 12, 9],
              [67, 27, 12, 9],
            ]) +
            px(k.T, [48, 43, 4, 3], [55, 43, 4, 3], [62, 43, 4, 3], [69, 43, 3, 3]) +
            lamp(MAG, [[55, 64, 10, 8]], 'none')
          );
      }
    },

    // A block of code between square brackets: a light frame, two heavy lit brackets and a gutter of
    // line marks down the left. The middle stays clear for the name.
    componentCard: (k) =>
      px(k.L, [3, 3, 294, 102]) +
      px(k.F, [6, 6, 288, 96]) +
      px(k.L, [0, 0, 10, 108], [0, 0, 30, 10], [0, 98, 30, 10], [290, 0, 10, 108], [270, 0, 30, 10], [270, 98, 30, 10]) +
      pxa(k.C, 0.85, [0, 0, 30, 3], [0, 0, 3, 108], [270, 0, 30, 3], [290, 10, 3, 88], [270, 98, 20, 3]) +
      pxa(INK, 0.45, [7, 10, 3, 88], [0, 105, 30, 3], [27, 3, 3, 7], [297, 3, 3, 105], [270, 105, 27, 3], [270, 7, 20, 3]) +
      pxa(k.L, 0.55, ...[0, 1, 2, 3, 4, 5, 6].map((i): Box => [17, 22 + i * 10, i % 3 === 1 ? 4 : 7, 3])) +
      px(AMBER, [276, 16, 7, 7]) +
      pxa(WHITE, 0.9, [277, 17, 3, 3]),

    componentGlyph: (k, kind) => {
      switch (kind) {
        case 'module':
          // An EPROM chip: five legs a side, a notch at the top, a dot by pin one and a window on the die.
          return (
            px(k.L, ...[14, 30, 46, 62, 78].flatMap((y): Box[] => [[8, y, 24, 8], [88, y, 24, 8]])) +
            pxa(k.C, 0.8, ...[14, 30, 46, 62, 78].flatMap((y): Box[] => [[8, y, 24, 3], [88, y, 24, 3]])) +
            solid(k, [[36, 8, 48, 88]]) +
            px(k.L, [50, 3, 20, 12]) +
            px(INK, [55, 3, 10, 7]) +
            lamp(AMBER, [[41, 13, 6, 6]], 'none') +
            grown(k.L, 3, 1, ...disc(60, 40, 13)) +
            px(INK, ...disc(60, 40, 13)) +
            px(k.C, [53, 35, 14, 11]) +
            px(CYAN, [57, 38, 6, 5]) +
            pxa(WHITE, 0.6, [50, 30, 7, 3], [50, 33, 3, 4]) +
            pxa(k.T, 0.9, [44, 64, 32, 5], [44, 74, 32, 5], [44, 84, 20, 5])
          );
        case 'adapter':
          // A chunky plug: two prongs to push into something else, and its cable trailing away.
          return (
            px(k.C, [2, 26, 30, 12], [2, 66, 30, 12]) +
            pxa(WHITE, 0.65, [2, 26, 30, 3], [2, 66, 30, 3]) +
            pxa(INK, 0.4, [2, 35, 30, 3], [2, 75, 30, 3]) +
            px(INK, [8, 30, 7, 4], [8, 70, 7, 4]) +
            px(k.L, [84, 46, 24, 12], [98, 46, 12, 52], [98, 86, 22, 12]) +
            pxa(k.C, 0.75, [85, 46, 25, 3], [98, 58, 3, 28], [110, 86, 10, 3]) +
            solid(k, [
              [34, 14, 32, 76],
              [66, 28, 14, 48],
            ]) +
            lamp(AMBER, [[43, 23, 12, 10]]) +
            pxa(INK, 0.55, [42, 44, 16, 5], [42, 54, 16, 5], [42, 64, 16, 5])
          );
        case 'port':
          // A serial socket: a D-shaped shell with two rows of pins, a screw post at each end.
          return (
            solid(k, [
              [14, 20, 92, 64],
              [8, 26, 104, 52],
            ]) +
            px(k.C, [11, 45, 11, 14], [98, 45, 11, 14]) +
            pxa(WHITE, 0.7, [11, 45, 11, 3], [98, 45, 11, 3]) +
            px(INK, [13, 51, 7, 3], [100, 51, 7, 3]) +
            grown(k.L, 3, 1, [28, 34, 64, 18], [36, 52, 48, 18]) +
            px(INK, [28, 34, 64, 18], [36, 52, 48, 18]) +
            px(k.T, [32, 39, 8, 8], [44, 39, 8, 8], [68, 39, 8, 8], [80, 39, 8, 8], [39, 56, 8, 8], [50, 56, 8, 8], [61, 56, 8, 8], [72, 56, 8, 8]) +
            lamp(AMBER, [[56, 39, 8, 8]], 'none')
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        case 'file':
          // A page with a stepped dog-ear, a heading and lines of pixel text, the cursor at the end.
          return (
            solid(k, [
              [10, 8, 48, 84],
              [58, 16, 9, 76],
              [67, 25, 9, 67],
            ]) +
            px(k.L, [52, 8, 6, 23], [52, 25, 24, 6]) +
            px(k.C, [20, 22, 24, 7]) +
            pxa(k.T, 0.9, [20, 40, 46, 5], [20, 52, 46, 5], [20, 64, 46, 5], [20, 76, 26, 5]) +
            lamp(AMBER, [[50, 74, 7, 9]], 'none')
          );
        case 'config':
          // A block of DIP switches on its legs, each switch set up or down.
          return (
            px(k.L, [15, 74, 8, 22], [31, 74, 8, 22], [47, 74, 8, 22], [63, 74, 8, 22]) +
            pxa(k.C, 0.75, [15, 74, 3, 22], [31, 74, 3, 22], [47, 74, 3, 22], [63, 74, 3, 22]) +
            solid(k, [[10, 8, 66, 60]]) +
            px(INK, [15, 20, 10, 40], [31, 20, 10, 40], [47, 20, 10, 40], [63, 20, 10, 40]) +
            px(k.T, [16, 21, 8, 16], [32, 43, 8, 16], [64, 43, 8, 16]) +
            pxa(INK, 0.35, [16, 33, 8, 4], [32, 55, 8, 4], [64, 55, 8, 4]) +
            lamp(AMBER, [[48, 21, 8, 16]], 'none') +
            px(k.C, [18, 13, 4, 3], [34, 13, 4, 3], [50, 13, 4, 3], [66, 13, 4, 3])
          );
        case 'secret':
          // A pixel padlock, its keyhole lit.
          return (
            px(k.L, [20, 18, 10, 34], [56, 18, 10, 34], [28, 8, 30, 10], [24, 12, 8, 8], [54, 12, 8, 8]) +
            pxa(k.C, 0.85, [28, 8, 30, 3], [20, 18, 3, 26], [24, 12, 3, 6], [56, 20, 3, 24]) +
            solid(k, [[12, 48, 62, 44]]) +
            px(INK, [33, 56, 20, 30]) +
            lamp(AMBER, [[37, 60, 12, 10]]) +
            px(AMBER, [40, 70, 6, 12]) +
            px(k.C, [17, 53, 4, 4], [65, 53, 4, 4], [17, 83, 4, 4], [65, 83, 4, 4])
          );
        case 'certificate':
          // A certificate with a gold seal and two ribbon tails hanging from it.
          return (
            solid(k, [[10, 8, 66, 52]]) +
            pxa(k.L, 0.7, [17, 15, 52, 2], [17, 15, 2, 38], [17, 51, 26, 2], [67, 15, 2, 26]) +
            pxa(k.T, 0.9, [24, 23, 38, 5], [24, 33, 22, 5]) +
            px(MAG, [48, 66, 9, 30], [63, 66, 9, 30]) +
            pxa(INK, 0.35, [54, 66, 3, 30], [69, 66, 3, 30]) +
            grown(INK, 3, 1, ...disc(60, 60, 14)) +
            lamp(AMBER, disc(60, 60, 14), 'none') +
            px(GOLD, [55, 55, 12, 12]) +
            pxa(WHITE, 0.9, [51, 50, 5, 5])
          );
      }
    },

    // A pixel diamond, stepped at every edge and lit along its upper left, its middle empty for a word.
    junction: (k) =>
      solid(
        k,
        [
          [44, 8, 12, 84],
          [32, 20, 36, 60],
          [20, 32, 60, 36],
          [8, 44, 84, 12],
        ],
        { s: 3, tone: 0, hi: 0.75 },
      ),
  },
};

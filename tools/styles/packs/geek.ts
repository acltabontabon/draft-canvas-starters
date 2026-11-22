import { paint, path, scheme, type Kit, type Pack } from '../kit';

/**
 * Geek: a retro computing lab at night. Every kind of shape is its own piece of old hardware,
 * drawn in phosphor green as chunky pixel art: a floppy disk, a cassette, a RAM stick, a router
 * with its antennas, a mainframe with its tape reels. Everything is built from square blocks, so
 * diagonals are stairs and corners are sharp, and one amber light is on somewhere in each machine.
 * Always dark: phosphor needs a black screen.
 */

/** A block: x, y, width, height. */
type Box = readonly [x: number, y: number, w: number, h: number];

/** Outline weight, in the drawing's own units. */
const W = 6;

/** Path data for a set of blocks, each grown by `grow` on every side. All wound the same way, so they join. */
const blocks = (boxes: readonly Box[], grow = 0): string =>
  boxes.map(([x, y, w, h]) => `M${x - grow} ${y - grow}h${w + 2 * grow}v${h + 2 * grow}h${-(w + 2 * grow)}z`).join('');

/** Blocks in one flat colour. */
const px = (colour: string, ...boxes: Box[]): string => path(blocks(boxes), paint(colour));

/** A solid thing made of blocks: its inside in `fill`, with a square-cornered outline `t` thick around it. */
const slab = (k: Kit, boxes: readonly Box[], fill: string = k.F, t = W, line: string = k.L): string =>
  path(blocks(boxes, t), paint(line)) + path(blocks(boxes), paint(fill));

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

const amber = (k: Kit): string => k.A('amber', 'chip');

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

/** A pixel person: a head with stepped corners on a body with stepped shoulders. */
function person(k: Kit, cx: number, top: number, head: number, wide: number, bottom: number, glasses: boolean): string {
  const hx = cx - head / 2;
  const left = cx - wide / 2;
  const ty = top + head + W * 2;
  const eye = top + Math.round(head * 0.3);
  const g = Math.round(head * 0.4);
  const dot = head >= 24 ? 5 : 4;
  const inset = Math.round(head * 0.2);
  return (
    slab(k, [
      [left + 14, ty, wide - 28, 6],
      [left + 6, ty + 6, wide - 12, 8],
      [left, ty + 14, wide, bottom - ty - 14],
    ]) +
    slab(k, [
      [hx + 4, top, head - 8, head],
      [hx, top + 4, head, head - 8],
    ]) +
    (glasses
      ? px(k.T, [hx + 1, eye, g, 10], [hx + head - 1 - g, eye, g, 10], [hx + 1 + g, eye + 3, head - 2 - g * 2, 3]) +
        px(k.K, [hx + 4, eye + 3, g - 6, 4], [hx + head + 2 - g, eye + 3, g - 6, 4]) +
        px(k.L, [cx - 4, top + head - 6, 8, 3])
      : px(k.T, [hx + inset, eye + 2, dot, dot], [hx + head - inset - dot, eye + 2, dot, dot]))
  );
}

/** The long tray every queue is drawn in, its ends stepped. */
const tray = (k: Kit, fill: string): string =>
  slab(
    k,
    [
      [11, 9, 254, 46],
      [5, 15, 266, 34],
    ],
    fill,
    5,
  );

export const geek: Pack = {
  id: 'geek',
  name: 'Geek',
  summary: 'A retro computing lab in phosphor green: every shape its own piece of pixel hardware',
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
    serviceCard: (k, kind) => {
      // A terminal window: a solid title bar with three square buttons, the rest clear for the name.
      const window = slab(k, [[6, 6, 336, 120]]) + px(k.L, [6, 6, 336, 22]) + px(amber(k), [12, 8, 12, 12]) + px(k.K, [30, 8, 12, 12], [48, 8, 12, 12]);
      switch (kind) {
        case 'api':
          // The same window with a three-pin socket let into its left edge, for callers to plug into.
          return window + px(k.L, [0, 38, 22, 6], [16, 38, 6, 56], [0, 88, 22, 6]) + px(k.K, [0, 44, 16, 44]) + px(k.C, [2, 50, 10, 8], [2, 62, 10, 8], [2, 74, 10, 8]);
        default:
          // Nothing below the title bar: a service's description is written there.
          return window;
      }
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        case 'worker':
          // A desktop computer: a prompt on the screen and a row of blocks filling up as it works.
          return (
            slab(k, [
              [22, 8, 92, 58],
              [58, 66, 20, 18],
              [10, 84, 116, 12],
            ]) +
            slab(k, [[32, 18, 72, 38]], k.K, 4) +
            px(k.T, [36, 22, 6, 6], [42, 28, 6, 6], [36, 34, 6, 6], [54, 34, 12, 6]) +
            px(k.C, [36, 45, 10, 8], [50, 45, 10, 8], [64, 45, 10, 8]) +
            px(amber(k), [78, 45, 10, 8]) +
            px(k.L, [18, 88, 60, 4], [86, 88, 32, 4])
          );
        case 'external':
          // A satellite dish on its mast, tilted up at a far-off star.
          return (
            px(k.L, [52, 84, 12, 14], [28, 96, 60, 8], [64, 22, 8, 8], [72, 14, 8, 8]) +
            slab(k, [
              [22, 6, 10, 10],
              [16, 16, 26, 10],
              [14, 26, 38, 10],
              [14, 36, 48, 10],
              [16, 46, 56, 10],
              [22, 56, 60, 10],
              [30, 66, 56, 10],
              [44, 76, 28, 6],
            ]) +
            px(k.L, [32, 16, 10, 10], [42, 26, 10, 10], [52, 36, 10, 10], [62, 46, 10, 10], [72, 56, 10, 10]) +
            px(amber(k), [80, 0, 14, 14]) +
            px(k.C, [114, 6, 8, 26], [105, 15, 26, 8], [104, 48, 8, 8], [122, 64, 8, 8])
          );
        case 'scheduler':
          // A digital alarm clock: a snooze bar, two feet and big segment digits.
          return (
            slab(k, [[46, 8, 44, 10]]) +
            px(k.L, [16, 90, 16, 12], [104, 90, 16, 12]) +
            slab(k, [[10, 22, 116, 62]]) +
            slab(k, [[20, 32, 96, 42]], k.K, 4) +
            px(k.C, ...digit('1', 24, 36, 16, 34, 5), ...digit('2', 44, 36, 16, 34, 5), ...digit('3', 74, 36, 16, 34, 5), ...digit('0', 94, 36, 16, 34, 5)) +
            px(amber(k), [64, 44, 6, 6], [64, 58, 6, 6])
          );
        case 'gateway':
          // A router: two antennas, a row of port lights, and an arrow showing the way in.
          return (
            px(k.L, [18, 10, 10, 42], [108, 10, 10, 42], [16, 94, 14, 8], [106, 94, 14, 8]) +
            px(k.C, [16, 2, 14, 10], [106, 2, 14, 10]) +
            px(k.T, [62, 2, 12, 18], [46, 20, 44, 7], [52, 27, 32, 7], [58, 34, 20, 7], [64, 41, 8, 6]) +
            slab(k, [[10, 56, 116, 32]]) +
            px(amber(k), [18, 66, 10, 12]) +
            px(k.C, [34, 66, 10, 12], [50, 66, 10, 12], [66, 66, 10, 12]) +
            slab(k, [[90, 67, 26, 10]], k.K, 3)
          );
        case 'load-balancer':
          // A network switch: one cable in at the top, three out to three machines below.
          return (
            px(k.L, [65, 6, 6, 18], [38, 58, 6, 18], [19, 72, 25, 6], [19, 72, 6, 12], [65, 58, 6, 26], [92, 58, 6, 18], [92, 72, 25, 6], [111, 72, 6, 12]) +
            px(k.C, [59, 0, 18, 12]) +
            slab(k, [[26, 28, 84, 26]]) +
            px(k.T, [34, 36, 10, 10], [50, 36, 10, 10], [66, 36, 10, 10]) +
            px(amber(k), [92, 36, 10, 10]) +
            slab(k, [[10, 88, 24, 10]]) +
            slab(k, [[56, 88, 24, 10]]) +
            slab(k, [[102, 88, 24, 10]])
          );
        case 'proxy':
          // A relay box standing between two parties: one arrow passes through each way.
          return (
            px(k.C, [4, 28, 110, 8], [112, 18, 8, 28], [120, 22, 7, 20], [127, 28, 7, 8]) +
            px(k.C, [22, 68, 110, 8], [16, 58, 8, 28], [9, 62, 7, 20], [2, 68, 7, 8]) +
            slab(k, [[50, 8, 36, 88]]) +
            px(amber(k), [62, 16, 12, 8]) +
            px(k.L, [58, 44, 20, 5], [58, 54, 20, 5], [58, 82, 20, 5])
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        case 'generic':
          // A floppy disk: a metal shutter at the top, a written label below.
          return (
            slab(k, [
              [26, 8, 76, 92],
              [102, 20, 12, 80],
            ]) +
            px(k.L, [44, 2, 46, 30]) +
            px(k.K, [72, 8, 10, 18]) +
            slab(k, [[40, 54, 60, 46]], k.K, 4) +
            px(k.T, [48, 62, 44, 5], [48, 74, 44, 5], [48, 86, 28, 5])
          );
        case 'sql':
          // A deck of punched cards, every hole in its row and column.
          return (
            slab(k, [[34, 8, 96, 56]]) +
            slab(k, [[22, 22, 96, 56]]) +
            slab(k, [
              [10, 46, 96, 52],
              [22, 36, 84, 10],
            ]) +
            px(k.T, ...[0, 1, 2].flatMap((row) => [0, 1, 2, 3, 4].map((col): Box => [20 + col * 17, 52 + row * 15, 9, 8])))
          );
        case 'nosql':
          // A cassette tape: two reels behind a window, anything recorded on it in any order.
          return (
            slab(k, [
              [16, 18, 108, 70],
              [10, 24, 120, 58],
            ]) +
            slab(k, [[22, 30, 96, 32]], k.K, 4) +
            px(k.T, [38, 35, 22, 22], [80, 35, 22, 22]) +
            px(k.K, [45, 42, 8, 8], [87, 42, 8, 8]) +
            px(k.L, [60, 43, 20, 6]) +
            px(k.L, [38, 72, 64, 4], [38, 72, 4, 16], [98, 72, 4, 16]) +
            px(k.C, [50, 80, 6, 6], [84, 80, 6, 6]) +
            px(amber(k), [66, 80, 8, 6])
          );
        case 'cache':
          // A stick of RAM: gold contacts along the bottom, two chips and a bolt for speed.
          return (
            px(amber(k), ...[0, 1, 2, 3, 4, 6, 7, 8, 9, 10].map((i): Box => [12 + i * 11, 76, 7, 16])) +
            slab(k, [
              [10, 24, 120, 14],
              [18, 38, 104, 14],
              [10, 52, 120, 18],
            ]) +
            px(k.L, [24, 30, 22, 34], [98, 30, 22, 34]) +
            px(k.T, [71, 26, 14, 7], [64, 33, 14, 7], [57, 40, 35, 7], [71, 47, 14, 7], [64, 54, 14, 7], [57, 61, 14, 7])
          );
        case 'file-system':
          // A tabbed folder, with a little tree of what is inside it on the front.
          return (
            slab(k, [
              [12, 28, 116, 68],
              [12, 10, 48, 18],
            ]) +
            px(k.L, [6, 38, 128, 6]) +
            px(k.T, [22, 54, 10, 8], [40, 68, 10, 8], [40, 82, 10, 8]) +
            px(k.C, [38, 54, 50, 8], [56, 68, 52, 8], [56, 82, 36, 8])
          );
        case 'object-storage':
          // A hooped bucket heaped with blobs of every shape.
          return (
            slab(k, [[28, 12, 22, 28]]) +
            slab(k, disc(72, 20, 14), k.C) +
            px(amber(k), [96, 10, 20, 26]) +
            slab(k, [
              [20, 48, 100, 28],
              [30, 76, 80, 20],
            ]) +
            px(k.L, [8, 34, 124, 14], [20, 62, 100, 5])
          );
        case 'search-index':
          // An index card with a magnifier over it, one entry found.
          return (
            slab(k, [
              [10, 20, 78, 78],
              [10, 8, 30, 12],
            ]) +
            px(k.T, [20, 30, 34, 5], [20, 44, 30, 5], [20, 58, 26, 5], [20, 72, 30, 5], [20, 86, 46, 5]) +
            px(k.L, [108, 74, 12, 12], [116, 82, 12, 12], [124, 90, 12, 14]) +
            slab(k, disc(92, 52, 24), k.K, 7) +
            px(amber(k), [78, 48, 28, 8])
          );
        case 'table':
          // A sheet of tractor-feed printout: one header row, ruled rows and a column under it.
          return (
            slab(k, [[12, 8, 116, 90]]) +
            px(k.L, [24, 8, 3, 90], [113, 8, 3, 90]) +
            px(k.L, ...[0, 1, 2, 3, 4, 5].flatMap((i): Box[] => [[14, 14 + i * 14, 6, 6], [120, 14 + i * 14, 6, 6]])) +
            px(k.L, [32, 14, 76, 16], [32, 46, 76, 4], [32, 62, 76, 4], [32, 78, 76, 4], [56, 30, 4, 62])
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        case 'queue':
          // Packets lined up in a tray, the one at the head framed and lit amber, room for more at the tail.
          return (
            tray(k, k.F) +
            px(k.C, [134, 20, 24, 24], [164, 20, 24, 24], [194, 20, 24, 24]) +
            px(k.T, [226, 15, 34, 34]) +
            px(amber(k), [231, 20, 24, 24]) +
            px(k.L, [22, 29, 6, 6], [52, 29, 6, 6], [82, 29, 6, 6], [112, 29, 6, 6])
          );
        case 'topic':
          // One block's trace splitting three ways, to three receivers.
          return tray(k, k.F) + px(k.T, [40, 30, 90, 5], [128, 14, 5, 37], [128, 14, 74, 5], [128, 30, 74, 5], [128, 46, 74, 5]) + px(amber(k), [14, 19, 26, 26]) + px(k.C, [202, 11, 56, 11], [202, 27, 56, 11], [202, 43, 56, 11]);
        case 'stream': {
          // An oscilloscope trace: a square wave running the whole length, the pen at its head.
          const wave: Box[] = [];
          for (let i = 0; i < 10; i += 1) {
            const x = 14 + i * 24;
            wave.push([x, i % 2 === 0 ? 40 : 18, 30, 6]);
            if (i < 9) wave.push([x + 24, 18, 6, 28]);
          }
          return tray(k, k.K) + px(k.C, ...wave) + px(amber(k), [256, 13, 10, 16]);
        }
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        case 'human':
          // A pixel person in glasses.
          return person(k, 60, 6, 30, 66, 76, true);
        case 'group':
          // Three pixel people, the one in front in glasses.
          return person(k, 26, 22, 20, 40, 76, false) + person(k, 94, 22, 20, 40, 76, false) + person(k, 60, 6, 26, 54, 76, true);
        case 'thirdParty':
          // A visitor: a person set between square brackets, wearing an amber badge.
          return (
            px(k.C, [4, 4, 8, 74], [4, 4, 20, 8], [4, 70, 20, 8], [108, 4, 8, 74], [96, 4, 20, 8], [96, 70, 20, 8]) +
            person(k, 60, 10, 26, 48, 76, false) +
            px(k.T, [58, 48, 4, 14]) +
            px(amber(k), [53, 60, 14, 12])
          );
        case 'system':
          // A mainframe cabinet: two tape reels over a panel of lights.
          return (
            px(k.L, [16, 78, 14, 4], [90, 78, 14, 4]) +
            slab(k, [[10, 8, 100, 64]]) +
            slab(k, disc(36, 26, 12), k.K, 4) +
            slab(k, disc(84, 26, 12), k.K, 4) +
            px(k.C, [33, 23, 6, 6], [81, 23, 6, 6]) +
            px(k.L, [52, 14, 16, 4], [10, 46, 100, 4]) +
            px(k.C, [18, 56, 8, 8], [30, 56, 8, 8], [42, 56, 8, 8]) +
            px(amber(k), [54, 56, 8, 8]) +
            px(k.L, [72, 55, 30, 4], [72, 63, 30, 4])
          );
        case 'device':
          // A handheld game console: a screen, a cross pad and two buttons.
          return (
            slab(k, [[43, 6, 34, 70]]) +
            slab(k, [[49, 12, 22, 22]], k.K, 3) +
            px(k.C, [52, 15, 6, 6], [58, 21, 6, 6], [58, 27, 10, 4]) +
            px(k.T, [46, 52, 14, 5], [50.5, 47.5, 5, 14]) +
            px(amber(k), [66, 46, 7, 7]) +
            px(k.C, [63, 57, 7, 7])
          );
        case 'agent':
          // A boxy robot: an antenna with a lit tip, square eyes, a grille and two arms.
          return (
            px(k.L, [57, 8, 6, 10], [20, 28, 8, 14], [92, 28, 8, 14], [20, 62, 14, 6], [20, 62, 6, 18], [86, 62, 14, 6], [94, 62, 6, 18]) +
            px(amber(k), [54, 0, 12, 10]) +
            slab(k, [[40, 64, 40, 12]]) +
            slab(k, [[34, 22, 52, 28]]) +
            px(k.T, [42, 28, 12, 10], [66, 28, 12, 10]) +
            px(k.L, [48, 42, 24, 4]) +
            px(k.C, [54, 66, 12, 6])
          );
      }
    },

    // A block of code between square brackets: a light frame, two heavy brackets, the middle clear.
    componentCard: (k) => slab(k, [[3, 3, 294, 102]], k.F, 3) + px(k.L, [0, 0, 10, 108], [0, 0, 30, 10], [0, 98, 30, 10], [290, 0, 10, 108], [270, 0, 30, 10], [270, 98, 30, 10]),

    componentGlyph: (k, kind) => {
      switch (kind) {
        case 'module':
          // A chip: five legs a side, a notch at the top and a dot by pin one.
          return (
            px(k.L, ...[14, 30, 46, 62, 78].flatMap((y): Box[] => [[8, y, 24, 8], [88, y, 24, 8]])) +
            slab(k, [[36, 10, 48, 84]]) +
            px(k.L, [48, 4, 24, 14]) +
            px(k.K, [54, 4, 12, 8]) +
            px(amber(k), [42, 24, 8, 8]) +
            px(k.T, [44, 44, 32, 6], [44, 58, 32, 6], [44, 72, 20, 6])
          );
        case 'adapter':
          // A chunky plug: two prongs to push into something else, and its cable trailing away.
          return (
            px(k.L, [2, 26, 28, 12], [2, 66, 28, 12], [84, 46, 24, 12], [98, 46, 12, 52], [98, 86, 22, 12]) +
            slab(k, [
              [34, 14, 32, 76],
              [66, 28, 14, 48],
            ]) +
            px(amber(k), [44, 24, 10, 10]) +
            px(k.T, [42, 46, 16, 5], [42, 56, 16, 5], [42, 66, 16, 5])
          );
        case 'port':
          // A serial socket: a D-shaped shell with two rows of pins, a screw post at each end.
          return (
            slab(k, [
              [14, 20, 92, 64],
              [8, 26, 104, 52],
            ]) +
            px(k.C, [11, 46, 10, 12], [99, 46, 10, 12]) +
            slab(
              k,
              [
                [30, 34, 60, 18],
                [38, 52, 44, 18],
              ],
              k.K,
              4,
            ) +
            px(k.T, [33, 39, 8, 8], [44.5, 39, 8, 8], [56, 39, 8, 8], [67.5, 39, 8, 8], [79, 39, 8, 8], [40, 56, 8, 8], [51, 56, 8, 8], [62, 56, 8, 8], [73, 56, 8, 8])
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        case 'file':
          // A page with a stepped dog-ear and lines of pixel text.
          return (
            slab(k, [
              [10, 8, 48, 84],
              [58, 16, 9, 76],
              [67, 25, 9, 67],
            ]) +
            px(k.L, [52, 8, 6, 23], [52, 25, 24, 6]) +
            px(k.T, [20, 30, 22, 6], [20, 44, 46, 6], [20, 58, 46, 6], [20, 72, 28, 6])
          );
        case 'config':
          // A block of DIP switches on its legs, each switch set up or down.
          return (
            px(k.L, [15, 74, 8, 22], [31, 74, 8, 22], [47, 74, 8, 22], [63, 74, 8, 22]) +
            slab(k, [[10, 10, 66, 58]]) +
            slab(k, [[16, 22, 8, 36]], k.K, 3) +
            slab(k, [[32, 22, 8, 36]], k.K, 3) +
            slab(k, [[48, 22, 8, 36]], k.K, 3) +
            slab(k, [[64, 22, 8, 36]], k.K, 3) +
            px(k.T, [16, 22, 8, 14], [32, 44, 8, 14], [64, 44, 8, 14]) +
            px(amber(k), [48, 22, 8, 14])
          );
        case 'secret':
          // A pixel padlock, its keyhole lit.
          return (
            px(k.L, [20, 18, 10, 34], [56, 18, 10, 34], [28, 8, 30, 10], [24, 12, 8, 8], [54, 12, 8, 8]) +
            slab(k, [[12, 50, 62, 42]]) +
            px(amber(k), [37, 60, 12, 10], [40, 70, 6, 14])
          );
        case 'certificate':
          // A certificate with a seal and two ribbon tails hanging from it.
          return (
            slab(k, [[10, 8, 66, 52]]) +
            px(k.T, [18, 18, 50, 5], [18, 30, 24, 5]) +
            px(k.C, [48, 66, 9, 32], [63, 66, 9, 32]) +
            slab(k, disc(60, 60, 14), k.F, 5) +
            px(amber(k), [54, 54, 12, 12])
          );
      }
    },

    // A pixel diamond, stepped at every edge, its middle empty for a word.
    junction: (k) =>
      slab(k, [
        [44, 8, 12, 84],
        [32, 20, 36, 60],
        [20, 32, 60, 36],
        [8, 44, 84, 12],
      ]),
  },
};

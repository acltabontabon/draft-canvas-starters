import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Weeb: a page of manga under an after-school sky. Every kind of shape is an object from an
 * original, archetypal anime town, inked with a confident outline and coloured like a cel: one flat
 * colour, one hard-edged shadow on the lower right (the light comes from the top left), a crisp
 * white highlight. A service is a manga panel with inked corners, a gateway a shrine gate, a
 * scheduler the school clock tower, a worker a boxy helper mecha, a proxy a paper crane carrying a
 * letter; data is a stack of manga volumes, a bento box, a capsule machine, an energy drink, a
 * bookshelf; a queue is ramen bowls waiting on the counter, a topic a megaphone, a stream carp
 * streamers in the wind; the people are students, a traveller in a straw hat and a floating orb
 * familiar. Screentone dots, speed lines and four-point sparkles are the texture. The inks that
 * never change are a hot vermilion, sakura pink, sunflower yellow and clean white. Nothing here is
 * anybody's character, and nothing is written: marks are plain geometry. Always light: it is a
 * daytime sky.
 */
const W = 5.5; // the outline of an object
const M = 3.5; // a mark inside it

// The spot inks: they stay as they are whatever colour a shape is given.
const VERMILION = '#f0492a';
const SAKURA = '#ff9fbe';
const SUN = '#ffc93c';
const WHITE = '#ffffff';
const GLASS = '#d4eafb';

const n = (value: number) => Math.round(value * 10) / 10;
const rad = (deg: number) => (deg * Math.PI) / 180;
const op = (value: number) => (value < 1 ? ` opacity="${value}"` : '');
const flat = (colour: string, opacity = 1) => `fill="${colour}" stroke="none"${op(opacity)}`;
const ink = (colour: string, w = M, opacity = 1) => `fill="none" stroke="${colour}" stroke-width="${w}"${op(opacity)}`;
const body = (k: Kit, w = W) => paint(k.F, k.L, w);

/** The cel shadow: one hard-edged tone of the shape's own line colour over its lower right. */
const cel = (k: Kit, d: string, opacity = 0.22) => path(d, flat(k.L, opacity));
/** A highlight: a crisp stroke of white along a lit edge. */
const hi = (d: string, w = 3, opacity = 0.9) => path(d, ink(WHITE, w, opacity));
/** The shadow something stands on. */
const ground = (k: Kit, cx: number, cy: number, rx: number, ry = 3.5) => ellipse(cx, cy, rx, ry, flat(k.L, 0.2));

/** Part of a circle, clockwise from `from` to `to` degrees (0 is east, 90 south). */
function arc(cx: number, cy: number, r: number, from: number, to: number): string {
  const at = (a: number) => `${n(cx + r * Math.cos(rad(a)))} ${n(cy + r * Math.sin(rad(a)))}`;
  return `M${at(from)}A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${at(to)}`;
}
const roundCel = (k: Kit, cx: number, cy: number, r: number, w: number, opacity = 0.22) => path(arc(cx, cy, r, -20, 110), ink(k.L, w, opacity));
const roundHi = (cx: number, cy: number, r: number, w = 3.5) => hi(arc(cx, cy, r, 195, 250), w);

/**
 * Screentone: rows of small dots in the shape's line colour, every other row set half a step
 * along. `keep` cuts the field to a shape. Each dot is a stroke too short to see, round-capped.
 */
function tone(k: Kit, x: number, y: number, w: number, h: number, keep: (x: number, y: number) => boolean = () => true, step = 7, opacity = 0.4, size = 2.6): string {
  let d = '';
  let row = 0;
  for (let j = y; j <= y + h; j += step * 0.8, row += 1) for (let i = x + (row % 2 ? step / 2 : 0); i <= x + w; i += step) if (keep(i, j)) d += `M${n(i)} ${n(j)}h.1`;
  return d ? path(d, ink(k.L, size, opacity)) : '';
}

/** Speed lines: each a sliver from a blunt end (`x0`, `y0`), `w` wide, to a point at (`x1`, `y1`). */
function slivers(lines: [number, number, number, number, number][]): string {
  return lines
    .map(([x0, y0, x1, y1, w]) => {
      const length = Math.hypot(x1 - x0, y1 - y0);
      const px = (-(y1 - y0) / length) * (w / 2);
      const py = ((x1 - x0) / length) * (w / 2);
      return `M${n(x0 + px)} ${n(y0 + py)}L${x1} ${y1}L${n(x0 - px)} ${n(y0 - py)}Z`;
    })
    .join('');
}
const speed = (k: Kit, lines: [number, number, number, number, number][], opacity = 1) => path(slivers(lines), flat(k.L, opacity));

/** A star of `points` points between two radii. */
function burst(cx: number, cy: number, outer: number, inner: number, points: number, turn = 0): string {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2 + rad(turn);
    out.push(`${n(cx + r * Math.cos(a))},${n(cy + r * Math.sin(a))}`);
  }
  return out.join(' ');
}
/** A four-point sparkle. Given the kit, it is inked round so a pale one still reads on the sky. */
const sparkle = (cx: number, cy: number, r: number, colour: string, k?: Kit) => poly(burst(cx, cy, r, r * 0.26, 4), k ? paint(colour, k.L, 2.2) : flat(colour));

/** A cog's outline, as polygon points. */
function cog(cx: number, cy: number, tip: number, root: number, teeth: number): string {
  const step = 360 / teeth;
  const out: string[] = [];
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step - 90;
    for (const [r, at] of [
      [root, a - step * 0.3],
      [tip, a - step * 0.17],
      [tip, a + step * 0.17],
      [root, a + step * 0.3],
    ])
      out.push(`${n(cx + r * Math.cos(rad(at)))},${n(cy + r * Math.sin(rad(at)))}`);
  }
  return out.join(' ');
}

/** A sakura petal's outline: a notched teardrop `r` long, turned by `turn` degrees. */
function petal(cx: number, cy: number, r: number, turn: number): string {
  const cos = Math.cos(rad(turn));
  const sin = Math.sin(rad(turn));
  const at = (u: number, v: number) => `${n(cx + (u * cos - v * sin) * r)} ${n(cy + (u * sin + v * cos) * r)}`;
  return `M${at(0, 1)}Q${at(-0.9, 0.1)} ${at(-0.35, -0.9)}L${at(0, -0.55)}L${at(0.35, -0.9)}Q${at(0.9, 0.1)} ${at(0, 1)}Z`;
}

/** A manga panel: a flat sheet with a hard block of shadow behind it, down and to the right. */
const panel = (k: Kit) => rect(9, 9, 336, 120, 5, flat(k.C)) + rect(3, 3, 336, 120, 5, flat(k.F));
const panelEdge = (k: Kit) => rect(3, 3, 336, 120, 5, ink(k.L, W));

/** A student, head and shoulders: a blazer, a red tie, ink-dark hair with a band of shine. Drawn at 120 by 82. */
const student = (k: Kit) =>
  path('M20 80Q20 52 60 52Q100 52 100 80Z', paint(k.C, k.L, W)) +
  cel(k, 'M66 52Q100 53 100 80H80Q86 64 66 52Z', 0.28) +
  poly('51,53 60,65 69,53', paint(WHITE, k.L, 3)) +
  poly('57.5,60 62.5,60 64.5,72 60,78 55.5,72', flat(VERMILION)) +
  circle(60, 31, 17, body(k)) +
  path('M42 33Q36 7 60 7Q84 7 78 33Q77 22 69 16Q62 24 52 24L54 19Q47 22 44 25Z', paint(k.L, k.L, 3)) +
  path('M59 9Q56 0 67 0Q62 4 64 9Z', flat(k.L)) +
  hi('M48 15Q60 9 72 15', 3);

/** A classmate behind: smaller, lighter hair, a ponytail on the `side` given or cropped short. */
const classmate = (k: Kit, cx: number, side: -1 | 0 | 1) =>
  path(`M${cx - 21} 80Q${cx - 21} 57 ${cx} 57Q${cx + 21} 57 ${cx + 21} 80Z`, body(k, 5)) +
  (side ? path(`M${cx + side * 10} 32Q${cx + side * 27} 32 ${cx + side * 21} 55Q${cx + side * 15} 45 ${cx + side * 10} 42Z`, paint(k.C, k.L, 3.5)) : '') +
  circle(cx, 42, 12.5, body(k, 5)) +
  path(
    side
      ? `M${cx - 14} 45Q${cx - 17} 25 ${cx} 25Q${cx + 17} 25 ${cx + 14} 45L${cx + 9} 34Q${cx} 30 ${cx - 9} 34Z`
      : `M${cx - 14} 44Q${cx - 17} 25 ${cx} 25Q${cx + 17} 25 ${cx + 14} 44L${cx + 9} 33L${cx + 4} 37L${cx - 1} 31L${cx - 6} 37L${cx - 10} 33Z`,
    paint(k.C, k.L, 3.5),
  );

/** A ramen bowl on its foot, a red line under the rim, something floating in the broth. */
const bowl = (k: Kit, x: number, topping: string) =>
  path(`M${x} 21H${x + 62}Q${x + 60} 46 ${x + 44} 51H${x + 18}Q${x + 2} 46 ${x} 21Z`, body(k, 5)) +
  cel(k, `M${x + 42} 21H${x + 62}Q${x + 60} 46 ${x + 44} 51H${x + 34}Q${x + 46} 40 ${x + 42} 21Z`, 0.24) +
  path(`M${x + 5} 33H${x + 57}`, ink(VERMILION, 3.5)) +
  rect(x + 20, 51, 22, 6, 0, flat(k.L)) +
  ellipse(x + 31, 20, 31, 7.5, paint(k.C, k.L, 4.5)) +
  topping;

/** A carp streamer: mouth ring at (`x`, `y`), `len` long to the root of its tail, `h` tall. */
function carp(k: Kit, x: number, y: number, len: number, h: number, attrs: string, band: string): string {
  const e = x + len;
  const outline = `M${x} ${y}Q${n(x + len / 2)} ${y - 4} ${e} ${n(y + h * 0.28)}L${e + 20} ${y - 1}L${e + 12} ${n(y + h / 2)}L${e + 20} ${y + h + 1}L${e} ${n(y + h * 0.72)}Q${n(x + len / 2)} ${y + h + 4} ${x} ${y + h}Z`;
  return (
    path(outline, attrs) +
    cel(k, `M${x} ${y + h}Q${n(x + len / 2)} ${y + h + 4} ${e} ${n(y + h * 0.72)}L${e + 20} ${y + h + 1}L${e + 12} ${n(y + h / 2)}Q${n(x + len / 2)} ${n(y + h * 0.8)} ${x} ${n(y + h * 0.6)}Z`, 0.24) +
    tone(k, x + 46, y + 5, len - 62, h * 0.4, undefined, 8, 0.55, 3) +
    path(`M${x + 34} ${y}Q${x + 41} ${n(y + h / 2)} ${x + 34} ${y + h}`, ink(band, 4.5)) +
    path(outline, ink(k.L, 4.5)) +
    ellipse(x + 2, n(y + h / 2), 4.5, n(h / 2), paint(WHITE, k.L, 4)) +
    circle(x + 20, n(y + h * 0.42), 5, paint(WHITE, k.L, 2.5)) +
    circle(x + 21, n(y + h * 0.42), 2, flat(k.T))
  );
}

/* -------------------------------------------------------------- the sky -- */

const TW = 520;
const TH = 400;

/** A flat cel cloud, its flat foot at (`x`, `y`), with one hard-edged tone along its underside. */
function cloud(x: number, y: number, s: number): string {
  const p = (u: number, v: number) => `${n(x + u * s)} ${n(y + v * s)}`;
  return (
    path(
      `M${p(0, 0)}Q${p(-14, 0)} ${p(-14, -10)}Q${p(-14, -21)} ${p(0, -20)}Q${p(4, -34)} ${p(22, -32)}Q${p(32, -46)} ${p(50, -37)}Q${p(66, -41)} ${p(70, -24)}Q${p(88, -26)} ${p(88, -12)}Q${p(88, 0)} ${p(74, 0)}Z`,
      flat('#f3f9fe'),
    ) + path(`M${p(-13, -7)}Q${p(10, -3)} ${p(30, -8)}Q${p(56, -2)} ${p(87, -8)}Q${p(86, 0)} ${p(74, 0)}H${n(x)}Q${p(-11, 0)} ${p(-13, -7)}Z`, flat('#deebf6'))
  );
}

export const weeb: Pack = {
  id: 'weeb',
  name: 'Weeb',
  summary: 'Inked manga under an after-school sky: a shrine gate, a bento box, ramen bowls in line, carp streamers in the wind',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 80,
  style: {
    // A mangaka's G-pen over ruled pencil: a clean, heavy, sure line with softened corners.
    hand: { base: 'clean' },
    general: { weight: 'bold', corners: 'soft', shadow: false },
    connectors: { colour: 'plain' },
    schemes: {
      light: scheme(
        { canvas: '#e9f3fb', grid: '#d2e2f0', text: '#1a2150', textMuted: '#4a5585', edge: '#3a4680', edgeText: '#2c3668', edgeLabelBg: '#f6fafe', codeBg: '#dcebf7', codeBorder: '#bcd2e6' },
        {
          neutral: ['#ffffff', '#27306b', '#161c45', '#5c6bb0'],
          teal: ['#d5f3ee', '#0f6f73', '#073f44', '#2a9d98'],
          blue: ['#d6e6ff', '#2450b8', '#122a6b', '#4b7be0'],
          violet: ['#e8defc', '#5b3fb0', '#2d1c66', '#8667d6'],
          amber: ['#ffeeb8', '#9a5a00', '#4d2c00', '#c97e0a'],
          rose: ['#ffdfe6', '#c22a55', '#6b0f2c', '#e2557d'],
          green: ['#dcf3d2', '#2f7a2f', '#173f17', '#4f9c44'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      // A manga panel: two corners inked solid, screentone fading in from the other two, a
      // sparkle where the light catches. The middle is bare paper for the name.
      if (kind === 'generic')
        return (
          panel(k) +
          tone(k, 258, 11, 76, 34, (x, y) => (x - 258) / 76 > (y - 9) / 34) +
          tone(k, 9, 84, 76, 34, (x, y) => (85 - x) / 76 > (118 - y) / 34) +
          panelEdge(k) +
          path('M3 8Q3 3 8 3H32L3 32Z', flat(k.L)) +
          path('M339 118Q339 123 334 123H310L339 94Z', flat(k.L)) +
          sparkle(318, 23, 13, VERMILION) +
          sparkle(298, 37, 6, SUN, k)
        );
      // An API is the same panel with a small shrine gate standing on its left edge, the way in.
      // Speed lines run in along the bottom left; the bottom right is left bare for "API".
      return (
        panel(k) +
        tone(k, 258, 11, 76, 34, (x, y) => (x - 258) / 76 > (y - 9) / 34) +
        speed(k, [
          [6, 100, 74, 100, 5],
          [6, 108, 104, 108, 5],
          [6, 116, 62, 116, 4],
        ], 0.5) +
        panelEdge(k) +
        path('M3 8Q3 3 8 3H32L3 32Z', flat(k.L)) +
        rect(12, 52, 6, 32, 0, paint(VERMILION, k.L, 2.5)) +
        rect(27, 52, 6, 32, 0, paint(VERMILION, k.L, 2.5)) +
        rect(8, 59, 29, 6, 0, paint(VERMILION, k.L, 2.5)) +
        path('M4 51Q22.5 56 41 51L39 43Q22.5 48 6 43Z', paint(VERMILION, k.L, 2.5)) +
        sparkle(318, 23, 13, VERMILION) +
        sparkle(298, 37, 6, SUN, k)
      );
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A boxy helper mecha, fists at its sides, a cog on its chest: it does the work.
        case 'worker':
          return (
            path('M68 14V5', ink(k.L, 4.5)) +
            circle(68, 5, 5, flat(VERMILION)) +
            rect(10, 60, 22, 36, 7, paint(k.C, k.L, W)) +
            rect(104, 60, 22, 36, 7, paint(k.C, k.L, W)) +
            path('M34 56H102L109 101H27Z', body(k)) +
            cel(k, 'M82 56H102L109 101H88Z') +
            poly(cog(68, 80, 14, 9.5, 8), paint(SUN, k.L, 3)) +
            circle(68, 80, 4, flat(k.L)) +
            circle(30, 35, 8.5, paint(k.C, k.L, 4.5)) +
            circle(106, 35, 8.5, paint(k.C, k.L, 4.5)) +
            path('M41 13H95L102 25V54H34V25Z', body(k)) +
            cel(k, 'M82 13H95L102 25V54H88Z') +
            poly('41,27 95,27 91,45 45,45', flat(k.T)) +
            poly('50,30 60,30 55,42 45,42', flat(WHITE, 0.95)) +
            poly('64,30 68,30 63,42 59,42', flat(WHITE, 0.95)) +
            hi('M44 17H70', 3)
          );
        // A far mountain with the sun coming up behind it: somewhere that is not here.
        case 'external':
          return (
            circle(97, 35, 27, paint(VERMILION, k.L, 4.5)) +
            path('M4 98L48 24H66L132 98Z', body(k)) +
            cel(k, 'M66 24L132 98H94Q86 56 66 24Z') +
            tone(k, 16, 64, 50, 30, (x, y) => x > 13 + (98 - y) * 0.595 && x < 62) +
            poly('48,24 66,24 77,36 69,33 63,42 56,33 49,41 44,33 40.5,36', paint(WHITE, k.L, 3)) +
            path('M4 98L48 24H66L132 98', ink(k.L, W)) +
            path('M72 88Q70 78 81 78Q85 68 96 71Q106 66 110 77Q121 77 120 88Z', paint(WHITE, k.L, 3.5)) +
            path('M2 99H134', ink(k.L, 5))
          );
        // The school clock tower between two wings of classrooms: time, kept for everyone.
        case 'scheduler':
          return (
            rect(8, 70, 40, 31, 0, body(k, 5)) +
            rect(88, 70, 40, 31, 0, body(k, 5)) +
            path('M16 79h8v11h-8zM31 79h8v11h-8zM97 79h8v11h-8zM112 79h8v11h-8z', flat(k.C)) +
            cel(k, 'M108 70H128V101H108Z', 0.18) +
            rect(44, 36, 48, 65, 0, body(k)) +
            cel(k, 'M76 36H92V101H76Z') +
            path('M36 38L68 6L100 38Z', paint(k.C, k.L, W)) +
            cel(k, 'M68 6L100 38H78Z', 0.25) +
            circle(68, 61, 17, paint(WHITE, k.L, 4.5)) +
            path('M68 61V49M68 61L77 66', ink(k.T, 4)) +
            circle(68, 61, 3, flat(VERMILION)) +
            path('M61 101V91Q68 84 75 91V101Z', flat(k.T)) +
            path('M2 101H134', ink(k.L, 5)) +
            sparkle(118, 24, 12, SUN, k)
          );
        // A shrine gate with a path running through it: the one way in.
        case 'gateway':
          return (
            path('M46 100L61 60H75L90 100Z', flat(k.L, 0.18)) +
            rect(25, 22, 15, 78, 0, body(k)) +
            rect(96, 22, 15, 78, 0, body(k)) +
            cel(k, 'M34 24H38V98H34Z', 0.3) +
            cel(k, 'M105 24H109V98H105Z', 0.3) +
            rect(12, 40, 112, 12, 0, body(k, 5)) +
            cel(k, 'M14 47H122V50H14Z', 0.3) +
            rect(60, 24, 16, 17, 0, paint(VERMILION, k.L, 3.5)) +
            path('M4 21Q68 33 132 21L128 5Q68 17 8 5Z', paint(k.C, k.L, W)) +
            hi('M16 11Q68 22 120 11', 3, 0.85) +
            rect(20, 93, 25, 8, 0, flat(k.L)) +
            rect(91, 93, 25, 8, 0, flat(k.L)) +
            path('M4 101H132', ink(k.L, 4.5)) +
            sparkle(122, 68, 9, SUN, k) +
            path(petal(13, 70, 7, 30), paint(SAKURA, k.L, 2))
          );
        // A folding fan, opened: one handle, three leaves pointing three ways.
        case 'load-balancer': {
          const at = (r: number, a: number) => `${n(68 + r * Math.cos(rad(a)))},${n(92 + r * Math.sin(rad(a)))}`;
          const leaf = (a: number, b: number) => `${at(24, a)} ${at(88, a)} ${at(90, (a * 2 + b) / 3)} ${at(90, (a + b * 2) / 3)} ${at(88, b)} ${at(24, b)}`;
          const head = (a: number) => `${at(82, a)} ${at(60, a - 9)} ${at(60, a + 9)}`;
          return (
            path('M68 92V103', ink(VERMILION, 5)) +
            poly(leaf(-138, -106), body(k, 5)) +
            poly(leaf(-106, -74), paint(k.C, k.L, 5)) +
            poly(leaf(-74, -42), body(k, 5)) +
            poly(`${at(24, -74)} ${at(88, -74)} ${at(90, -58)} ${at(88, -42)} ${at(24, -42)}`, flat(k.L, 0.22)) +
            poly(head(-122), paint(VERMILION, k.L, 2.5)) +
            poly(head(-90), paint(VERMILION, k.L, 2.5)) +
            poly(head(-58), paint(VERMILION, k.L, 2.5)) +
            path(`M68 92L${at(24, -138).replace(',', ' ')}M68 92L${at(24, -106).replace(',', ' ')}M68 92L${at(24, -74).replace(',', ' ')}M68 92L${at(24, -42).replace(',', ' ')}`, ink(k.L, 4.5)) +
            circle(68, 92, 6, paint(SUN, k.L, 3))
          );
        }
        // A paper crane on the wing with a sealed letter: it carries word for somebody else.
        case 'proxy':
          return (
            speed(k, [
              [134, 82, 98, 83, 5],
              [134, 93, 106, 93, 4],
            ]) +
            poly('66,52 100,6 94,56', paint(k.C, k.L, 5)) +
            poly('86,60 132,26 102,70', body(k, 5)) +
            poly('50,60 16,20 38,68', body(k, 5)) +
            poly('16,20 4,37 25,31', paint(VERMILION, k.L, 4)) +
            rect(54, 84, 32, 18, 2, paint(WHITE, k.L, 3.5)) +
            path('M54 84L70 95L86 84', ink(k.L, 3)) +
            poly('38,68 68,50 102,70 70,86', body(k, 5)) +
            cel(k, 'M40 69L100 70L70 85Z', 0.24) +
            poly('48,58 58,2 88,58', body(k, 5)) +
            cel(k, 'M58 6L86 57H72Z', 0.24) +
            circle(70, 96, 4.5, flat(VERMILION))
          );
      }
    },

    database: (k, kind) => {
      // A manga volume lying flat, its spine toward you: a band of colour and a small label.
      const volume = (x: number, y: number, w: number, spot: string) =>
        rect(x, y, w, 25, 3, flat(k.F)) +
        rect(x + 12, y, 16, 25, 0, flat(k.C)) +
        rect(x + w - 34, y + 7, 18, 11, 2, flat(spot)) +
        cel(k, `M${x + 2} ${y + 18}H${x + w - 2}V${y + 23}H${x + 2}Z`) +
        rect(x, y, w, 25, 3, ink(k.L, 5));
      switch (kind) {
        // A stack of manga volumes: whatever is kept.
        case 'generic':
          return (
            ground(k, 70, 103, 60) +
            volume(12, 76, 116, VERMILION) +
            volume(22, 50, 100, WHITE) +
            group('rotate(-5 60 36)', volume(10, 23, 106, SUN)) +
            sparkle(124, 20, 12, VERMILION)
          );
        // A bento box from above: every thing in its own compartment, in rows.
        case 'sql':
          return (
            path('M10 97H130M10 104H130', ink(k.L, 4.5)) +
            path('M108 97H130M108 104H130', ink(VERMILION, 4.5)) +
            rect(6, 5, 128, 83, 13, body(k)) +
            rect(14, 13, 112, 67, 7, flat(k.L, 0.22)) +
            rect(18, 17, 56, 59, 5, paint(WHITE, k.L, 3.5)) +
            tone(k, 24, 60, 44, 12, undefined, 8, 0.3) +
            circle(46, 42, 9, flat(VERMILION)) +
            rect(80, 17, 42, 27, 5, paint(k.C, k.L, 3.5)) +
            rect(86, 22, 13, 17, 3, paint(SUN, k.L, 2.5)) +
            rect(103, 22, 13, 17, 3, paint(SUN, k.L, 2.5)) +
            rect(80, 49, 42, 27, 5, paint(k.F, k.L, 3.5)) +
            circle(93, 62.5, 7.5, paint(SAKURA, k.L, 2.5)) +
            circle(109, 62.5, 7.5, paint(k.C, k.L, 2.5)) +
            hi('M20 9H62', 3)
          );
        // A capsule-toy machine: turn the handle, and something of some shape drops out.
        case 'nosql':
          return (
            ground(k, 70, 104, 54) +
            rect(26, 58, 88, 44, 8, body(k)) +
            cel(k, 'M90 58H106Q114 58 114 66V94Q114 102 106 102H90Z') +
            circle(70, 36, 33, paint(GLASS, k.L, W)) +
            circle(55, 45, 12.5, paint(VERMILION, k.L, 3.5)) +
            circle(84, 44, 12.5, paint(SUN, k.L, 3.5)) +
            circle(70, 23, 12.5, paint(SAKURA, k.L, 3.5)) +
            path('M42.5 45H67.5M71.5 44H96.5M57.5 23H82.5', ink(k.L, 3)) +
            hi('M43 30Q46 18 56 11', 4) +
            rect(26, 58, 88, 11, 5, paint(k.C, k.L, 4.5)) +
            circle(50, 85, 10, paint(k.C, k.L, 4.5)) +
            path('M43 85H57', ink(k.L, 4.5)) +
            rect(74, 77, 30, 19, 5, flat(k.T)) +
            circle(89, 90, 6, paint(VERMILION, k.L, 2.5))
          );
        // An energy drink with a bolt on the can, in a burst of speed: quick, and soon gone.
        case 'cache':
          return (
            poly(burst(70, 56, 53, 36, 12, 15), flat(k.C, 0.4)) +
            speed(k, [
              [2, 40, 34, 43, 6],
              [8, 62, 36, 62, 5],
              [138, 48, 106, 51, 6],
              [132, 72, 104, 70, 5],
            ]) +
            rect(46, 5, 48, 12, 4, paint(k.C, k.L, 4.5)) +
            rect(42, 14, 56, 89, 8, flat(k.F)) +
            rect(42, 25, 56, 8, 0, flat(k.C)) +
            rect(42, 85, 56, 8, 0, flat(k.C)) +
            cel(k, 'M82 14H90Q98 14 98 22V95Q98 103 90 103H82Z') +
            rect(48, 38, 5, 42, 2.5, flat(WHITE, 0.95)) +
            poly('78,36 58,61 68,61 61,83 86,55 74,55 81,36', paint(SUN, k.L, 3)) +
            rect(42, 14, 56, 89, 8, ink(k.L, W))
          );
        // A bookshelf: everything stood in its row, shelf under shelf.
        case 'file-system': {
          const spine = (x: number, w: number, h: number, foot: number, colour: string) => rect(x, foot - h, w, h, 0, paint(colour, k.L, 3));
          return (
            rect(7, 5, 126, 99, 3, body(k)) +
            rect(14, 12, 112, 39, 0, flat(k.L, 0.24)) +
            rect(14, 59, 112, 39, 0, flat(k.L, 0.24)) +
            spine(17, 13, 34, 51, k.F) +
            spine(30, 11, 28, 51, VERMILION) +
            spine(41, 15, 36, 51, k.C) +
            spine(56, 11, 30, 51, WHITE) +
            spine(67, 13, 34, 51, k.F) +
            spine(80, 11, 26, 51, SUN) +
            poly('95,51 103,20 114,23 107,51', paint(k.C, k.L, 3)) +
            spine(17, 15, 30, 98, k.C) +
            spine(32, 11, 36, 98, k.F) +
            spine(43, 13, 28, 98, SAKURA) +
            spine(56, 15, 34, 98, k.F) +
            spine(71, 11, 30, 98, WHITE) +
            rect(87, 88, 36, 10, 0, paint(k.F, k.L, 3)) +
            rect(90, 78, 31, 10, 0, paint(k.C, k.L, 3)) +
            rect(88, 68, 33, 10, 0, paint(SUN, k.L, 3)) +
            path('M7 55H133', ink(k.L, W))
          );
        }
        // A crate of prizes: a capsule, a star, a block, loose things of any shape.
        case 'object-storage':
          return (
            ground(k, 70, 104, 54) +
            circle(40, 33, 18, paint(SAKURA, k.L, 4)) +
            path('M22 33H58', ink(k.L, 3)) +
            group('rotate(14 102 32)', rect(87, 17, 30, 30, 6, paint(k.C, k.L, 4))) +
            poly(burst(71, 27, 23, 10.5, 5), paint(SUN, k.L, 4)) +
            path('M12 48H128L118 102H22Z', body(k)) +
            cel(k, 'M102 48H128L118 102H98Z') +
            path('M31 70H62M78 70H109M34 86H62M78 86H106', ink(k.T, 7.5)) +
            rect(7, 42, 126, 14, 5, body(k, 5)) +
            hi('M15 47H72', 3)
          );
        // A magnifying glass with a sparkle caught in it: made for finding.
        case 'search-index':
          return (
            path('M88 76L123 99', ink(k.L, 16)) +
            path('M93 79L122 98', ink(k.C, 7.5)) +
            circle(58, 47, 38, paint(k.F, k.L, 7)) +
            tone(k, 26, 50, 62, 30, (x, y) => Math.hypot(x - 58, y - 47) < 29 && x + y < 122, 8, 0.35) +
            roundCel(k, 58, 47, 30.5, 8) +
            roundHi(58, 47, 30.5, 4) +
            sparkle(57, 44, 21, VERMILION) +
            sparkle(80, 27, 8, SUN, k)
          );
        // A ruled notebook page with a pencil beside it: one table, row by row.
        case 'table':
          return (
            rect(17, 12, 104, 92, 4, flat(k.C)) +
            rect(10, 5, 104, 92, 4, flat(k.F)) +
            path('M14 5H110Q114 5 114 9V24H10V9Q10 5 14 5Z', flat(k.C)) +
            rect(10, 24, 30, 73, 0, flat(k.L, 0.16)) +
            rect(77, 61, 37, 18, 0, flat(VERMILION, 0.9)) +
            path('M10 24H114M10 42.5H114M10 61H114M10 79H114M40 5V97M77 5V97', ink(k.T, 3.2)) +
            rect(10, 5, 104, 92, 4, ink(k.L, W)) +
            rect(125, 24, 10, 54, 0, paint(SUN, k.L, 3)) +
            poly('125,78 135,78 130,93', paint(WHITE, k.L, 3)) +
            rect(125, 13, 10, 11, 2, paint(SAKURA, k.L, 3))
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // Three bowls of ramen on the counter, served in the order they were asked for.
        case 'queue':
          return (
            path('M2 58H274', ink(k.L, 4.5)) +
            bowl(k, 6, circle(24, 19, 5, flat(SAKURA)) + path('M44 18L62 2M50 19L68 5', ink(k.L, 3.5))) +
            bowl(k, 80, circle(104, 19.5, 5.5, paint(WHITE, k.L, 2)) + circle(104, 19.5, 2.5, flat(SUN))) +
            bowl(k, 154, circle(178, 19, 5, flat(SAKURA)) + circle(194, 21, 3.5, flat(WHITE))) +
            poly('230,16 238,16 254,34 238,52 230,52 246,34', flat(k.L)) +
            poly('250,16 258,16 274,34 258,52 250,52 266,34', flat(k.C))
          );
        // A megaphone, shouting: one voice, and everyone in earshot hears it.
        case 'topic':
          return (
            speed(k, [
              [4, 20, 40, 23, 5],
              [10, 33, 44, 33, 5],
              [4, 46, 40, 43, 5],
            ]) +
            rect(86, 42, 15, 19, 4, paint(k.C, k.L, 4.5)) +
            rect(50, 19, 22, 26, 5, paint(k.C, k.L, W)) +
            poly('68,20 150,4 150,60 68,44', flat(k.F)) +
            poly('110,11.8 124,9.1 124,54.9 110,52.2', flat(VERMILION)) +
            cel(k, 'M68 37L150 41V60L68 44Z', 0.24) +
            hi('M76 22L138 10', 3) +
            poly('68,20 150,4 150,60 68,44', ink(k.L, W)) +
            ellipse(150, 32, 8, 28, paint(k.C, k.L, W)) +
            path('M172 15Q184 32 172 49M190 9Q208 32 190 55', ink(k.L, 5.5)) +
            path('M210 4Q234 32 210 60', ink(k.C, 5.5)) +
            sparkle(254, 14, 11, VERMILION) +
            sparkle(264, 38, 8, SUN, k) +
            sparkle(248, 54, 7, SAKURA, k)
          );
        // Carp streamers flying from a pole: the wind never stops running through them.
        case 'stream':
          return (
            speed(k, [
              [274, 12, 200, 14, 5],
              [274, 25, 214, 26, 4],
              [274, 45, 176, 47, 5],
              [266, 57, 196, 57, 4],
            ]) +
            path('M8 3V62', ink(k.L, 5.5)) +
            carp(k, 16, 5, 150, 24, flat(k.F), VERMILION) +
            carp(k, 16, 36, 112, 23, flat(k.C), SUN) +
            circle(8, 5, 5, paint(SUN, k.L, 2.5)) +
            path(petal(232, 37, 7, 40) + petal(254, 9, 6, -30), paint(SAKURA, k.L, 2))
          );
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A student.
        case 'human':
          return student(k);
        // Three classmates.
        case 'group':
          return classmate(k, 23, -1) + classmate(k, 97, 0) + group('translate(6 8.2) scale(0.9)', student(k));
        // A traveller from somewhere else, face hidden under a wide straw hat.
        case 'thirdParty':
          return (
            path('M16 80Q24 52 60 52Q96 52 104 80Z', paint(k.C, k.L, W)) +
            cel(k, 'M66 52Q96 53 104 80H80Q86 64 66 52Z', 0.28) +
            circle(60, 38, 14, body(k)) +
            path('M51 54L60 64L69 54', ink(k.L, 3.5)) +
            circle(60, 62, 4.5, flat(VERMILION)) +
            path('M12 37L60 4L108 37Q60 48 12 37Z', paint(SUN, k.L, W)) +
            cel(k, 'M60 6L104 36Q84 41 68 42Z', 0.22) +
            path('M60 6L42 40M60 6L80 41', ink(k.L, 2.4, 0.55)) +
            hi('M26 31L52 13', 3)
          );
        // An arcade cabinet: a whole system in one box, playing by its own rules.
        case 'system':
          return (
            rect(30, 3, 60, 77, 5, flat(k.F)) +
            path('M35 3H85Q90 3 90 8V16H30V8Q30 3 35 3Z', flat(k.C)) +
            sparkle(60, 9.5, 6, SUN) +
            rect(38, 21, 44, 22, 2, flat(k.T)) +
            poly('42,23 52,23 46,41 40,41', flat(WHITE, 0.9)) +
            sparkle(66, 32, 8.5, VERMILION) +
            cel(k, 'M74 62H90V75Q90 80 85 80H74Z') +
            rect(52, 66, 16, 10, 2, paint(k.C, k.L, 3)) +
            rect(30, 3, 60, 77, 5, ink(k.L, W)) +
            path('M26 51H94L98 62H22Z', paint(k.C, k.L, 4.5)) +
            path('M44 54V48', ink(k.L, 4)) +
            circle(44, 46, 5, flat(VERMILION)) +
            circle(66, 56.5, 3.4, flat(SUN)) +
            circle(78, 56.5, 3.4, flat(WHITE))
          );
        // A phone with a charm on its strap: something small you carry.
        case 'device':
          return (
            rect(41, 5, 33, 73, 8, body(k)) +
            rect(46, 12, 23, 50, 3, flat(k.T)) +
            poly('48,14 57,14 50,37 48,37', flat(WHITE, 0.9)) +
            sparkle(59, 44, 8.5, VERMILION) +
            circle(57.5, 70, 3.4, flat(k.C)) +
            path('M71 7Q83 4 79 19', ink(VERMILION, 3)) +
            path(petal(79, 27, 8, 0), paint(SAKURA, k.L, 2.2))
          );
        // A floating orb familiar with one bright lens, small fins and a ring of light over it.
        case 'agent':
          return (
            ground(k, 60, 79, 20, 2.5) +
            poly('38,38 9,22 17,42 7,53 37,53', paint(k.C, k.L, 4.5)) +
            poly('82,38 111,22 103,42 113,53 83,53', paint(k.C, k.L, 4.5)) +
            circle(60, 43, 25, body(k)) +
            roundCel(k, 60, 43, 19.5, 6.5) +
            circle(60, 43, 11.5, flat(k.T)) +
            sparkle(60, 43, 10, SUN) +
            ellipse(60, 9, 17, 4.5, ink(k.L, 6.5)) +
            ellipse(60, 9, 17, 4.5, ink(SUN, 3)) +
            sparkle(96, 70, 7, VERMILION) +
            sparkle(26, 68, 5, SUN, k)
          );
      }
    },

    // An inked tag: one corner folded over, a red bookmark, a punched hole, screentone in the far
    // corner. The middle is left bare for the name.
    componentCard: (k) =>
      group('translate(5 5)', path('M22 3H288Q292 3 292 7V96Q292 100 288 100H7Q3 100 3 96V22Z', flat(k.C))) +
      path('M22 3H288Q292 3 292 7V96Q292 100 288 100H7Q3 100 3 96V22Z', flat(k.F)) +
      tone(k, 222, 68, 66, 28, (x, y) => (x - 222) / 66 > (98 - y) / 30) +
      path('M22 3H288Q292 3 292 7V96Q292 100 288 100H7Q3 100 3 96V22Z', ink(k.L, 5)) +
      path('M3 22H18Q22 22 22 18V3Z', paint(k.C, k.L, 3.5)) +
      poly('252,3 270,3 270,25 261,18 252,25', paint(VERMILION, k.L, 3)) +
      circle(19, 52, 5.5, paint(k.K, k.L, 3)),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A block: one piece of the kit, three faces showing, the lit one sparkling.
        case 'module':
          return (
            ground(k, 60, 101, 44, 3) +
            poly('60,50 108,28 108,78 60,100', paint(k.C, k.L, W)) +
            cel(k, 'M60 100L108 78V46L60 80Z', 0.28) +
            poly('12,28 60,50 60,100 12,78', body(k)) +
            tone(k, 17, 56, 38, 34, (x, y) => y > 62 + (x - 12) * 0.46 && y < 76 + (x - 12) * 0.46 && x < 56, 7, 0.4) +
            poly('36,48 44,60 36,72 28,60', flat(VERMILION)) +
            poly('60,6 108,28 60,50 12,28', body(k)) +
            hi('M26 28L60 13', 3.5) +
            sparkle(100, 13, 12, SUN, k)
          );
        // A plug with a spark jumping from its pins: it makes one thing fit another.
        case 'adapter':
          return (
            path('M60 86Q60 99 78 99H116', ink(k.L, 6.5)) +
            rect(40, 23, 11, 26, 2, paint(k.C, k.L, 4.5)) +
            rect(69, 23, 11, 26, 2, paint(k.C, k.L, 4.5)) +
            path('M27 45H93V66Q93 89 60 89Q27 89 27 66Z', body(k)) +
            cel(k, 'M74 45H93V66Q93 89 60 89Q82 82 78 62Z') +
            hi('M35 53V66', 4) +
            poly(burst(60, 15, 15, 6.5, 8), paint(SUN, k.L, 2.5)) +
            sparkle(100, 26, 9, VERMILION) +
            sparkle(18, 30, 6, VERMILION)
          );
        // A round socket: the opening something else plugs into.
        case 'port':
          return (
            circle(60, 52, 44, body(k)) +
            roundCel(k, 60, 52, 36.5, 9) +
            roundHi(60, 52, 37, 4) +
            circle(60, 52, 28, paint(k.C, k.L, 5)) +
            rect(45, 39, 10, 26, 3, flat(k.T)) +
            rect(65, 39, 10, 26, 3, flat(k.T)) +
            sparkle(105, 13, 10, VERMILION)
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A manga page: four panels, a burst in one, screentone in another, speed lines in the last.
        case 'file':
          return (
            rect(11, 8, 70, 90, 2, flat(k.C)) +
            rect(5, 3, 70, 90, 2, body(k, 5)) +
            rect(12, 10, 56, 25, 0, paint(k.C, k.L, 3)) +
            poly(burst(40, 22.5, 11, 5, 8), flat(WHITE)) +
            rect(12, 40, 23, 22, 0, ink(k.L, 3)) +
            tone(k, 15, 44, 18, 16, undefined, 6, 0.5, 2.4) +
            poly('41,40 68,40 68,62 46,62', paint(VERMILION, k.L, 3)) +
            rect(12, 67, 56, 19, 0, ink(k.L, 3)) +
            speed(k, [
              [14, 71, 60, 76.5, 4],
              [14, 77, 50, 77, 3],
              [14, 83, 60, 77.5, 4],
            ])
          );
        // A row of faders, each pushed to its own level: how it is set.
        case 'config':
          return (
            rect(11, 11, 70, 84, 8, flat(k.C)) +
            rect(5, 5, 70, 84, 8, body(k)) +
            path('M22 18V76M40 18V76M58 18V76', ink(k.L, 4.5)) +
            rect(12, 24, 20, 12, 3, paint(VERMILION, k.L, 3)) +
            rect(30, 55, 20, 12, 3, paint(SUN, k.L, 3)) +
            rect(48, 37, 20, 12, 3, paint(k.C, k.L, 3))
          );
        // A protective charm pouch, tied shut with a red cord, a keyhole where the blessing would be.
        case 'secret':
          return (
            path('M43 20Q25 1 43 4Q61 1 43 20', ink(VERMILION, 4.5)) +
            path('M22 20H64L73 31V92Q73 97 68 97H18Q13 97 13 92V31Z', body(k)) +
            cel(k, 'M57 20H64L73 31V92Q73 97 68 97H57Z') +
            rect(23, 43, 40, 45, 3, ink(k.C, 3)) +
            circle(43, 59, 8.5, flat(k.T)) +
            poly('43,60 36.500,80 49.500,80', flat(k.T)) +
            poly('43,26 29,18 29,34', paint(VERMILION, k.L, 2.5)) +
            poly('43,26 57,18 57,34', paint(VERMILION, k.L, 2.5)) +
            circle(43, 26, 4.5, paint(VERMILION, k.L, 2.5))
          );
        // A seal stamp and the red mark it has just made on the paper: it vouches for you.
        case 'certificate':
          return (
            rect(5, 48, 76, 48, 3, body(k, 5)) +
            cel(k, 'M64 50H79V94H64Z', 0.16) +
            circle(40, 72, 16, ink(VERMILION, 5)) +
            poly('40,61 50,72 40,83 30,72', flat(VERMILION)) +
            group(
              'rotate(16 52 28)',
              rect(41, 1, 22, 31, 7, body(k)) + cel(k, 'M55 3H61V30H55Z', 0.28) + rect(35, 29, 34, 15, 3, paint(k.C, k.L, 4.5)) + rect(36, 41, 32, 4.5, 0, flat(VERMILION)),
            )
          );
      }
    },

    // An inked ring throwing four spark points, a red and a yellow sparkle beside it, the middle
    // left empty.
    junction: (k) =>
      poly('50,0 57,18 43,18', flat(k.L)) +
      poly('100,50 82,57 82,43', flat(k.L)) +
      poly('50,100 43,82 57,82', flat(k.L)) +
      poly('0,50 18,43 18,57', flat(k.L)) +
      sparkle(84, 16, 9, VERMILION) +
      sparkle(15, 85, 6, SUN, k) +
      circle(50, 50, 33, body(k)) +
      roundCel(k, 50, 50, 27.5, 6) +
      roundHi(50, 50, 28, 3) +
      circle(50, 50, 23, ink(k.C, 2.6)),
  },

  // The after-school sky: flat cel clouds with one hard tone along their undersides, sakura petals
  // drifting across, a sparkle or two and a few speed lines of wind.
  backdrop: {
    tile: [TW, TH],
    draw: () => {
      const petals: [number, number, number, number][] = [
        [44, 168, 6, 25],
        [132, 252, 5, -40],
        [226, 96, 6.5, 70],
        [286, 318, 5, 10],
        [368, 136, 5.5, -65],
        [412, 258, 6.5, 130],
        [474, 62, 5, 45],
        [176, 18, 5.5, -15],
        [84, 344, 6, 100],
        [326, 28, 4.5, 160],
        [498, 206, 5, -100],
      ];
      return (
        cloud(52, 92, 1.25) +
        cloud(300, 226, 0.95) +
        cloud(446, 352, 1.15) +
        cloud(446 - TW, 352, 1.15) +
        cloud(186, 398, 0.85) +
        cloud(186, 398 - TH, 0.85) +
        path('M372 78h62M392 86h84M360 94h46M96 296h54M78 304h40', ink('#c3d8ea', 1.4, 0.8)) +
        path(petals.map(([x, y, r, turn]) => petal(x, y, r, turn)).join(''), flat('#f5a9c3', 0.6)) +
        poly(burst(238, 168, 9, 2.2, 4), flat(WHITE, 0.95)) +
        poly(burst(452, 148, 6, 1.6, 4), flat(WHITE, 0.95)) +
        poly(burst(34, 268, 5, 1.4, 4), flat(WHITE, 0.95))
      );
    },
  },
};

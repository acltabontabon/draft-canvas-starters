import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Cute: kawaii stationery. Every kind of shape is its own little character, told apart by its
 * outline: a busy bee for a worker, a ringed planet for what is outside, a ghost standing in as
 * the proxy; a jam jar, a bento box, a storm cloud and a gift box for data; a caterpillar, a
 * megaphone and a stream of paper boats for the pipes; bear-eared people, a bunny visitor and a
 * round robot. Thick soft outlines, two dot eyes, a small smile, pink cheeks, and a heart or a star
 * for ornament. Cards are stitched like felt and keep their middle clear for the name.
 * Always light: pastel needs a pale page.
 */
const W = 6; // an outline
const M = 4; // a mark inside one

const n = (value: number): number => Math.round(value * 10) / 10;
const blush = (k: Kit) => k.A('rose', 'chip');
const sun = (k: Kit) => k.A('amber', 'chip');
/** Filled with the shape's own colour and outlined. */
const body = (k: Kit, w = W): string => paint(k.F, k.L, w);
const line = (k: Kit, w = M, colour = k.L): string => paint('none', colour, w);
/** A wash of the shape's accent over its fill. */
const tint = (k: Kit, o = 0.28): string => `${paint(k.C)} opacity="${o}"`;

const eyes = (k: Kit, cx: number, cy: number, apart: number, r = 3.4): string => circle(cx - apart, cy, r, paint(k.T)) + circle(cx + apart, cy, r, paint(k.T));
const smile = (k: Kit, cx: number, cy: number, half = 5, w = 3): string => path(`M${n(cx - half)} ${n(cy)}Q${n(cx)} ${n(cy + half * 1.3)} ${n(cx + half)} ${n(cy)}`, paint('none', k.T, w));
const cheeks = (k: Kit, cx: number, cy: number, apart: number, r = 4.6): string =>
  ellipse(cx - apart, cy, r, n(r * 0.7), `${paint(blush(k))} opacity="0.6"`) + ellipse(cx + apart, cy, r, n(r * 0.7), `${paint(blush(k))} opacity="0.6"`);
/** Two dot eyes, a small smile and pink cheeks, centred on the eyes. `spread` is how far out the cheeks sit. */
const face = (k: Kit, cx: number, cy: number, s = 1, spread = 16.5): string =>
  eyes(k, cx, cy, n(9 * s), n(3.4 * s)) + smile(k, cx, n(cy + 3.5 * s), n(4.5 * s), n(3 * s)) + cheeks(k, cx, n(cy + 6.5 * s), n(spread * s), n((spread > 15 ? 4.6 : 4) * s));

const heartPath = (cx: number, cy: number, s: number): string =>
  `M${n(cx)} ${n(cy + 5 * s)}C${n(cx - 9 * s)} ${n(cy - 1 * s)} ${n(cx - 5 * s)} ${n(cy - 8 * s)} ${n(cx)} ${n(cy - 3 * s)}C${n(cx + 5 * s)} ${n(cy - 8 * s)} ${n(cx + 9 * s)} ${n(cy - 1 * s)} ${n(cx)} ${n(cy + 5 * s)}Z`;
const heart = (k: Kit, cx: number, cy: number, s: number): string => path(heartPath(cx, cy, s), paint(blush(k)));
const star = (cx: number, cy: number, R: number, attrs: string, inner = 0.5): string =>
  poly(
    Array.from({ length: 10 }, (_, i) => {
      const at = (-90 + i * 36) * (Math.PI / 180);
      const r = i % 2 ? R * inner : R;
      return `${n(cx + Math.cos(at) * r)},${n(cy + Math.sin(at) * r)}`;
    }).join(' '),
    attrs,
  );

/** A row of stitches from one point to another: short dashes, evenly spaced, as one path's data. */
function stitches(ax: number, ay: number, bx: number, by: number, skip: (x: number, y: number) => boolean = () => false, dash = 11, gap = 8): string {
  const length = Math.hypot(bx - ax, by - ay);
  const count = Math.max(1, Math.round((length + gap) / (dash + gap)));
  const step = (length + gap) / count;
  const ux = (bx - ax) / length;
  const uy = (by - ay) / length;
  let out = '';
  for (let i = 0; i < count; i += 1) {
    const from = i * step;
    const to = from + step - gap;
    if (skip(ax + (ux * (from + to)) / 2, ay + (uy * (from + to)) / 2)) continue;
    out += `M${n(ax + ux * from)} ${n(ay + uy * from)}L${n(ax + ux * to)} ${n(ay + uy * to)}`;
  }
  return out;
}
/** One stitch round a corner at (`x`, `y`), turning toward (`sx`, `sy`). */
const corner = (x: number, y: number, sx: number, sy: number, r: number): string => `M${x} ${y + sy * r}Q${x} ${y} ${x + sx * r} ${y}`;

/** A bear-eared head. */
const bear = (k: Kit, cx: number, cy: number, r: number): string =>
  circle(n(cx - r * 0.72), n(cy - r * 0.74), n(r * 0.4), body(k, 5)) + circle(n(cx + r * 0.72), n(cy - r * 0.74), n(r * 0.4), body(k, 5)) + circle(cx, cy, r, body(k, 5));
/** Round shoulders under a head. */
const shoulders = (k: Kit, cx: number, width: number, top: number, bottom: number): string =>
  path(`M${cx - width / 2} ${bottom}Q${cx - width / 2} ${top} ${cx} ${top}Q${cx + width / 2} ${top} ${cx + width / 2} ${bottom}Z`, body(k, 5));

export const cute: Pack = {
  id: 'cute',
  name: 'Cute',
  summary: 'Kawaii stationery: a busy bee, a jam jar, a caterpillar queue and bear-eared friends, each with a smile',
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
          amber: ['#fff3d1', '#b98a24', '#5e440a', '#cc900e'],
          rose: ['#ffe3ec', '#dc5f8a', '#6b1f3c', '#cf4f7c'],
          green: ['#e9f7dc', '#67a343', '#2c4f17', '#5f9a3c'],
        },
      ),
    },
  },
  draw: {
    // A felt card, stitched round its edge, a heart sewn into the top-left corner. An API has a
    // snap fastener on its left edge, and leaves the bottom-right corner to the "API" tag.
    serviceCard: (k, kind) => {
      const api = kind === 'api';
      const skip = (x: number, y: number) => (x < 50 && y < 50) || (api && x > 280 && y > 86) || (api && x < 40 && Math.abs(y - 66) < 22);
      const [x0, y0, x1, y1, r] = [15, 15, 333, 117, 9];
      const seam =
        stitches(x0 + r + 6, y0, x1 - r - 6, y0, skip) +
        corner(x1, y0, -1, 1, r) +
        stitches(x1, y0 + r + 6, x1, y1 - r - 6, skip) +
        (api ? '' : corner(x1, y1, -1, -1, r)) +
        stitches(x1 - r - 6, y1, x0 + r + 6, y1, skip) +
        corner(x0, y1, 1, -1, r) +
        stitches(x0, y1 - r - 6, x0, y0 + r + 6, skip);
      return (
        rect(3, 3, 342, 126, 20, body(k)) +
        path(seam, `${line(k, 3)} opacity="0.8"`) +
        heart(k, 29, 30, 1.9) +
        (api ? circle(20, 66, 10.5, paint(k.C, k.L, 4)) + circle(20, 66, 3.4, paint(k.K)) : '')
      );
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A busy bee: striped, winged, a sting behind.
        case 'worker':
          return (
            poly('110,56 130,66 110,76', paint(k.T, k.T, 3)) +
            group('rotate(-12 72 23)', ellipse(72, 23, 15, 20, paint(k.K, k.L, 5))) +
            group('rotate(28 100 28)', ellipse(100, 28, 13, 18, paint(k.K, k.L, 5))) +
            path('M34 44Q30 28 21 24M47 38Q47 22 40 14', line(k, 4)) +
            circle(20, 23, 4.5, paint(k.T)) +
            circle(39, 13, 4.5, paint(k.T)) +
            ellipse(66, 66, 46, 31, paint(k.F)) +
            path('M83 43Q90 66 83 89', paint('none', k.T, 9)) +
            path('M100 51Q104 66 100 81', paint('none', k.T, 8)) +
            ellipse(66, 66, 46, 31, line(k, W)) +
            face(k, 47, 62)
          );
        // A little ringed planet, out among the stars.
        case 'external': {
          const ring = 'rotate(-16 68 52)';
          return (
            group(ring, ellipse(68, 52, 63, 18, line(k, 10)) + ellipse(68, 52, 63, 18, line(k, 4, k.F))) +
            circle(68, 52, 44, body(k)) +
            group(ring, path('M5 52A63 18 0 0 0 131 52', line(k, 10)) + path('M5 52A63 18 0 0 0 131 52', line(k, 4, k.F))) +
            face(k, 68, 38) +
            star(19, 18, 13, paint(sun(k))) +
            star(120, 91, 10, paint(sun(k)))
          );
        }
        // An alarm clock: two bells, two feet and the time on its face.
        case 'scheduler': {
          const bell = path('M55 12A13 13 0 0 1 81 12Z', paint(k.C, k.L, 5));
          return (
            path('M44 90L37 100M92 90L99 100', line(k, 7)) +
            group('rotate(-40 68 56)', bell) +
            group('rotate(40 68 56)', bell) +
            circle(68, 56, 42, body(k)) +
            circle(68, 56, 31, paint(k.K, k.L, 3.5)) +
            path('M68 36V53L80 46', paint('none', k.T, 5)) +
            eyes(k, 68, 62, 15, 3.6) +
            smile(k, 68, 67, 5.5, 3.2) +
            cheeks(k, 68, 71, 20, 4.4)
          );
        }
        // A little house with its door in the middle: the way in.
        case 'gateway':
          return (
            path('M68 7L130 52H116V98H20V52H6Z', body(k)) +
            path('M24 52H112', line(k, 4)) +
            heart(k, 68, 35, 2) +
            path('M50 98V76A18 18 0 0 1 86 76V98Z', paint(k.C, k.L, 4.5)) +
            circle(79, 84, 3.4, paint(k.K))
          );
        // One string, three balloons.
        case 'load-balancer': {
          const balloon = (cx: number, cy: number, washed: boolean) =>
            poly(`${cx - 5},${cy + 27} ${cx + 5},${cy + 27} ${cx},${cy + 20}`, paint(k.L, k.L, 2)) +
            ellipse(cx, cy, 20, 23, paint(k.F)) +
            (washed ? ellipse(cx, cy, 20, 23, tint(k, 0.3)) : '') +
            ellipse(cx, cy, 20, 23, line(k, W));
          return (
            path('M26 64L68 88M68 56V88M110 64L68 88', line(k, 3.5)) +
            balloon(26, 37, true) +
            balloon(110, 37, true) +
            balloon(68, 29, false) +
            face(k, 68, 27, 0.8) +
            heart(k, 68, 93, 1.9)
          );
        }
        // A friendly ghost, a hand out to either side: it stands in for someone.
        case 'proxy':
          return (
            path('M31 60Q14 54 14 65Q15 74 31 73', body(k, 5)) +
            path('M105 60Q122 54 122 65Q121 74 105 73', body(k, 5)) +
            path('M28 98V46A40 40 0 0 1 108 46V98Q94.7 82 81.3 98Q68 82 54.7 98Q41.3 82 28 98Z', body(k)) +
            eyes(k, 68, 44, 12, 4.4) +
            ellipse(68, 58, 5, 6, paint(k.T)) +
            cheeks(k, 68, 56, 22, 5)
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // A jam jar, half full, under its lid.
        case 'generic':
          return (
            path('M32 26H108Q122 26 122 42V86Q122 103 105 103H35Q18 103 18 86V42Q18 26 32 26Z', body(k)) +
            path('M21 54Q37 46 53 54T87 54T119 54V86Q119 100 105 100H35Q21 100 21 86Z', tint(k, 0.26)) +
            rect(34, 5, 72, 22, 8, paint(k.C, k.L, 5)) +
            face(k, 70, 70)
          );
        // A bento box, everything in its own compartment, chopsticks laid across the top.
        case 'sql':
          return (
            path('M12 8L128 13M12 19L128 20', line(k, 4.5)) +
            rect(8, 30, 124, 72, 14, body(k)) +
            path('M64 33V99M64 65H129', line(k, 4)) +
            path('M36 44Q41 44 46 54L54 72Q58 86 46 86H26Q14 86 18 72L26 54Q31 44 36 44Z', paint(k.K, k.L, 4)) +
            rect(28, 75, 16, 11, 2, paint(k.T)) +
            eyes(k, 36, 63, 6, 2.8) +
            smile(k, 36, 66, 3, 2.4) +
            heart(k, 97, 49, 2.1) +
            star(97, 83, 12, paint(sun(k)))
          );
        // A bowl of mixed sweets: a ball, a star and a cube, no two alike.
        case 'nosql':
          return (
            circle(38, 36, 17, paint(k.C, k.L, 5)) +
            group('rotate(14 104 38)', rect(89, 23, 30, 30, 6, body(k, 5))) +
            star(71, 28, 23, paint(sun(k), k.L, 5), 0.55) +
            rect(50, 92, 40, 12, 5, body(k, 5)) +
            path('M10 54H130Q130 99 70 99Q10 99 10 54Z', body(k)) +
            face(k, 70, 70)
          );
        // A storm cloud with a bolt of lightning: fast, and gone again.
        case 'cache':
          return (
            poly('80,52 54,82 71,82 62,103 96,70 78,70 90,52', paint(sun(k), sun(k), 5)) +
            path('M32 62A19 19 0 0 1 30 26A27 27 0 0 1 78 16A25 25 0 0 1 118 34A15 15 0 0 1 110 62Z', body(k)) +
            face(k, 70, 40)
          );
        // A folder with a sheet tucked into it.
        case 'file-system':
          return (
            path('M12 98V20Q12 10 22 10H50Q56 10 60 15L66 22H118Q128 22 128 32V98Z', body(k)) +
            path('M12 98V20Q12 10 22 10H50Q56 10 60 15L66 22H118Q128 22 128 32V98Z', tint(k, 0.4)) +
            group('rotate(4 81 32)', rect(50, 13, 62, 38, 5, paint(k.K, k.L, 4)) + path('M61 25H100', line(k, 3.5))) +
            path('M8 46Q7 38 15 38H125Q133 38 132 46L127 94Q126 102 118 102H22Q14 102 13 94Z', body(k)) +
            face(k, 70, 68)
          );
        // A gift box tied with a bow: anything at all may be inside.
        case 'object-storage':
          return (
            path('M70 31Q44 0 32 13Q24 28 70 31Z', paint(k.C, k.L, 5)) +
            path('M70 31Q96 0 108 13Q116 28 70 31Z', paint(k.C, k.L, 5)) +
            rect(20, 46, 100, 56, 9, body(k)) +
            rect(61, 55, 18, 44, 0, paint(k.C)) +
            rect(12, 30, 116, 22, 8, body(k)) +
            rect(61, 33, 18, 16, 0, paint(k.C)) +
            circle(70, 30, 7.5, paint(k.C, k.L, 4)) +
            eyes(k, 70, 74, 28, 3.6) +
            path('M65.5 76Q70 82 74.5 76', line(k, 3, k.K)) +
            cheeks(k, 70, 83, 34, 4.6)
          );
        // A magnifying glass, looking back at you.
        case 'search-index':
          return (
            path('M84 78L121 98', line(k, 16)) +
            path('M90 81L120 97.5', line(k, 6, k.C)) +
            circle(52, 48, 41, body(k)) +
            circle(52, 48, 30, paint(k.K, k.L, 3.5)) +
            path('M30 40Q33 28 44 24', line(k, 3.5)) +
            face(k, 54, 48, 0.95)
          );
        // A table, as tables are: laid with a gingham cloth, squares in rows and columns.
        case 'table': {
          const cloth = `M12 22H128V64${'q-9.67 10-19.33 0'.repeat(6)}Z`;
          return (
            path('M27 60V100M113 60V100', line(k, 9)) +
            path(cloth, paint(k.F)) +
            rect(12, 22, 29, 21, 0, tint(k, 0.4)) +
            rect(70, 22, 29, 21, 0, tint(k, 0.4)) +
            rect(41, 43, 29, 21, 0, tint(k, 0.4)) +
            rect(99, 43, 29, 21, 0, tint(k, 0.4)) +
            path('M41 22V64M70 22V64M99 22V64M12 43H128', line(k, 3.5)) +
            path(cloth, line(k, 5)) +
            rect(5, 8, 130, 15, 7.5, paint(k.C, k.L, 5))
          );
        }
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // A caterpillar: bead after bead, in order, behind one head.
        case 'queue': {
          const beads = [26, 62, 98, 134, 170, 206];
          return (
            beads.map((cx, i) => circle(cx, 39, 22, body(k, 5)) + (i % 2 ? '' : circle(cx, 39, 19.5, tint(k, 0.3)))).join('') +
            path('M234 15L228 5M256 15L262 5', line(k, 3.5)) +
            circle(227, 4.5, 3.6, paint(k.T)) +
            circle(263, 4.5, 3.6, paint(k.T)) +
            circle(245, 36, 26, body(k, 5)) +
            face(k, 246, 33, 0.95)
          );
        }
        // A megaphone, and one message flying out to three hearts.
        case 'topic':
          return (
            path('M58 45L52 60', line(k, 7)) +
            path('M28 22L104 5Q112 3 112 11V53Q112 61 104 59L28 42Z', body(k, 5)) +
            rect(8, 19, 24, 26, 8, paint(k.C, k.L, 5)) +
            path('M128 20Q137 32 128 44', line(k, 4)) +
            path(stitches(148, 27, 206, 17, undefined, 9, 9) + stitches(148, 32, 234, 32, undefined, 9, 9) + stitches(148, 37, 206, 47, undefined, 9, 9), line(k, 3.5)) +
            path(heartPath(226, 14, 2), paint(blush(k), k.L, 3)) +
            path(heartPath(256, 33, 2), paint(blush(k), k.L, 3)) +
            path(heartPath(226, 51, 2), paint(blush(k), k.L, 3))
          );
        // A stream, and paper boats sailing down it one after another.
        case 'stream': {
          const boat = (cx: number) =>
            path(`M${cx} 4L${cx + 14} 24H${cx - 14}Z`, paint(k.K, k.L, 3.5)) + path(`M${cx - 24} 27H${cx + 24}L${cx + 14} 44H${cx - 14}Z`, paint(k.C, k.L, 3.5));
          const water = 'M4 41Q21 31 38 41T72 41T106 41T140 41T174 41T208 41T242 41T272 41V52Q272 60 264 60H12Q4 60 4 52Z';
          return (
            boat(50) +
            boat(138) +
            boat(226) +
            path(water, paint(k.F)) +
            path(water, tint(k, 0.22)) +
            path(water, line(k, 5)) +
            path('M24 52q8-5 16 0t16 0M112 52q8-5 16 0t16 0M200 52q8-5 16 0t16 0', line(k, 3, k.C))
          );
        }
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A bear-eared person.
        case 'human':
          return shoulders(k, 60, 66, 51, 79) + bear(k, 60, 29, 21) + face(k, 60, 29, 1, 13.5);
        // Three of them, the middle one in front.
        case 'group':
          return (
            shoulders(k, 24, 40, 57, 79) +
            bear(k, 24, 42, 14) +
            eyes(k, 24, 43, 5.5, 2.6) +
            shoulders(k, 96, 40, 57, 79) +
            bear(k, 96, 42, 14) +
            eyes(k, 96, 43, 5.5, 2.6) +
            shoulders(k, 60, 54, 51, 79) +
            bear(k, 60, 30, 19) +
            face(k, 60, 30, 0.9, 13.5)
          );
        // A bunny from elsewhere, come to visit with a little bag.
        case 'thirdParty':
          return (
            shoulders(k, 44, 50, 59, 79) +
            group('rotate(-9 37 17)', ellipse(37, 17, 6.5, 13, body(k, 5))) +
            group('rotate(9 51 17)', ellipse(51, 17, 6.5, 13, body(k, 5))) +
            circle(44, 43, 17, body(k, 5)) +
            face(k, 44, 42, 0.8, 13.5) +
            path('M84 54V49Q84 42 91 42Q98 42 98 49V54', line(k, 4)) +
            rect(75, 53, 32, 25, 7, paint(k.C, k.L, 5)) +
            path(heartPath(91, 66, 1), paint(k.K))
          );
        // A smiling desktop computer.
        case 'system':
          return (
            path('M60 58V70', line(k, 8)) +
            rect(37, 67, 46, 11, 5.5, body(k, 5)) +
            rect(17, 4, 86, 56, 12, body(k, 5.5)) +
            rect(26, 12, 68, 40, 6, paint(k.K, k.L, 3.5)) +
            face(k, 60, 29, 0.95)
          );
        // A phone with a face on its screen. Only the middle of the box is shown.
        case 'device':
          return (
            rect(41, 4, 38, 74, 10, body(k, 5)) +
            rect(46.5, 12, 27, 47, 4, paint(k.K, k.L, 3)) +
            eyes(k, 60, 31, 6, 2.8) +
            smile(k, 60, 35, 3.6, 2.6) +
            cheeks(k, 60, 40, 8.5, 3) +
            circle(60, 68.5, 3.6, paint(k.C))
          );
        // A round little robot: an aerial, two ear bolts, eyes behind a visor.
        case 'agent':
          return (
            path('M40 80V75Q40 66 49 66H71Q80 66 80 75V80Z', body(k, 5)) +
            path('M60 20V11', line(k, 4.5)) +
            circle(60, 8, 5, paint(sun(k))) +
            rect(15, 33, 12, 18, 5, paint(k.C, k.L, 4)) +
            rect(93, 33, 12, 18, 5, paint(k.C, k.L, 4)) +
            rect(24, 19, 72, 47, 22, body(k, 5.5)) +
            rect(34, 29, 52, 27, 13, paint(k.K, k.L, 3.5)) +
            eyes(k, 60, 40, 11, 3.6) +
            smile(k, 60, 44, 4, 2.8)
          );
      }
    },

    // A gift tag: a point at one end with a hole for the string, stitched along its sides.
    componentCard: (k) =>
      path('M42 4H282Q296 4 296 18V90Q296 104 282 104H42Q33 104 28 97L8 66Q0 54 8 42L28 11Q33 4 42 4Z', body(k, 5.5)) +
      path(
        stitches(52, 15, 270, 15) + corner(285, 15, -1, 1, 9) + stitches(285, 30, 285, 78) + corner(285, 93, -1, -1, 9) + stitches(270, 93, 52, 93),
        `${line(k, 3)} opacity="0.8"`,
      ) +
      circle(27, 54, 7.5, paint(k.K, k.L, 4)),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A puzzle piece: one unit that fits the others.
        case 'module':
          return (
            path(
              'M12 38Q12 32 18 32H40A12 12 0 1 1 56 32H78Q84 32 84 38V58A12 12 0 1 1 84 74V94Q84 100 78 100H56A12 12 0 1 0 40 100H18Q12 100 12 94Z',
              body(k),
            ) + face(k, 48, 56, 0.95)
          );
        // A plug with two pins and a trailing lead.
        case 'adapter':
          return (
            path('M60 86Q60 100 76 100Q100 100 108 84', line(k, 6)) +
            rect(51, 74, 18, 16, 5, paint(k.C, k.L, 4.5)) +
            rect(40, 4, 10, 32, 3, paint(k.T)) +
            rect(70, 4, 10, 32, 3, paint(k.T)) +
            path('M22 42Q22 30 34 30H86Q98 30 98 42V54Q98 80 72 80H48Q22 80 22 54Z', body(k)) +
            face(k, 60, 50)
          );
        // A wall socket, which was always a face.
        case 'port':
          return (
            rect(12, 8, 96, 88, 22, body(k)) +
            circle(60, 52, 31, paint(k.K, k.L, 4)) +
            rect(45, 36, 8, 17, 4, paint(k.T)) +
            rect(67, 36, 8, 17, 4, paint(k.T)) +
            smile(k, 60, 61, 6, 3.2) +
            cheeks(k, 60, 62, 20, 4.6)
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A sheet of paper, its corner folded down.
        case 'file':
          return (
            path('M17 4H52L79 31V87Q79 96 70 96H17Q8 96 8 87V13Q8 4 17 4Z', body(k)) +
            path('M52 4V22Q52 31 61 31H79Z', paint(k.C, k.L, 4)) +
            path('M21 22H38', line(k, 4)) +
            face(k, 43, 58, 0.95)
          );
        // A cog with a face: settings.
        case 'config': {
          const turns = [0, 45, 90, 135, 180, 225, 270, 315];
          return (
            turns.map((turn) => group(`rotate(${turn} 43 50)`, rect(34.5, 9, 17, 22, 5.5, body(k, 5)))).join('') +
            circle(43, 50, 29, body(k, 5)) +
            turns.map((turn) => group(`rotate(${turn} 43 50)`, rect(37, 14, 12, 16, 0, paint(k.F)))).join('') +
            face(k, 43, 48, 0.9)
          );
        }
        // A key with a heart for a bow.
        case 'secret':
          return (
            rect(46, 68, 22, 11, 3.5, body(k, 5)) +
            rect(46, 84, 17, 11, 3.5, body(k, 5)) +
            rect(36, 44, 14, 53, 6, body(k, 5)) +
            path(heartPath(43, 30, 4.7), body(k)) +
            face(k, 43, 25, 0.82)
          );
        // A rosette with two ribbon tails and a star.
        case 'certificate': {
          const petals = Array.from({ length: 10 }, (_, i) => {
            const at = (i * 36 * Math.PI) / 180;
            return circle(n(43 + Math.cos(at) * 26), n(40 + Math.sin(at) * 26), 9.5, body(k, 5));
          }).join('');
          return (
            path('M30 56L19 97L32 88L41 97L46 60Z', paint(k.C, k.L, 5)) +
            path('M56 56L67 97L54 88L45 97L40 60Z', paint(k.C, k.L, 5)) +
            petals +
            circle(43, 40, 26, paint(k.F)) +
            circle(43, 40, 19, paint(k.K, k.L, 3.5)) +
            star(43, 40.5, 12.5, paint(sun(k)))
          );
        }
      }
    },

    // A flower: a ring of petals round an empty middle.
    junction: (k) =>
      Array.from({ length: 8 }, (_, i) => {
        const at = ((i * 45 + 22.5) * Math.PI) / 180;
        return circle(n(50 + Math.cos(at) * 33), n(50 + Math.sin(at) * 33), 14, body(k, 5));
      }).join('') + circle(50, 50, 33, paint(k.F)),
  },
};

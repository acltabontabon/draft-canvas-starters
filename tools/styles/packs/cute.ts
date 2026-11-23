import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Cute: a sheet of kawaii stickers. Every kind of shape is its own little character, die-cut with
 * a white edge and a soft shadow, as if peeled off a Japanese stationery sheet: a busy bee for a
 * worker, a ringed planet for what is outside, a ghost standing in as the proxy; a jam jar, a bento
 * box, a storm cloud and a gift box for data; a caterpillar, a megaphone and a stream of paper
 * boats for the pipes; bear-eared people, a bunny visitor and a round robot. Chunky round forms in
 * the shape's own colour, shaded low on the right and glossed high on the left, with shiny eyes, a
 * small smile and strawberry cheeks. The materials never change colour: strawberry, peach, butter,
 * mint, sky glass, lilac, milk and a cocoa shadow. Cards are stitched like felt, taped to the page,
 * and keep their middle clear for the name. The page behind is a faint gingham with sparkles.
 * Always light: pastel needs a pale page.
 */
const W = 5; // an outline
const M = 3.5; // a mark inside one
/** How far a sticker's white edge and its shadow are painted: the outline, and a rim beyond it. */
const RIM = W + 5;

// The materials: fixed whatever colour the shape is.
const COCOA = '#6b4438';
const BERRY = '#ff7a9e';
const PEACH = '#ffb38a';
const BUTTER = '#ffd257';
const HONEY = '#e79c1f';
const MINT = '#86dfc0';
const GLASS = '#dff1ff';
const LILAC = '#c5aaff';
const MILK = '#ffffff';

const n = (value: number): number => Math.round(value * 100) / 100;
const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Filled with the shape's own colour and outlined. */
const body = (k: Kit, w = W): string => paint(k.F, k.L, w);
/** A deeper pastel of the shape's colour, outlined: lids, bows, roofs. Lies over something pale. */
const soft = (k: Kit, o = 0.45, w = W): string => `fill="${k.C}" fill-opacity="${o}" stroke="${k.L}" stroke-width="${w}"`;
const line = (k: Kit, w = M, colour = k.L): string => paint('none', colour, w);
/** A wash of the shape's accent over its fill. */
const tint = (k: Kit, o = 0.3): string => `${paint(k.C)} opacity="${o}"`;
/** The side away from the light: the shape's own line colour, thinly. */
const shade = (k: Kit, o = 0.2): string => `${paint(k.L)} opacity="${o}"`;
/** Where the light lands. */
const shine = (o = 0.8): string => `${paint(MILK)} opacity="${o}"`;

/** A shape still waiting for its paint, so one outline can be a shadow, a white edge and a body. */
type Sh = (attrs: string) => string;
const P =
  (d: string): Sh =>
  (a) =>
    path(d, a);
const C =
  (cx: number, cy: number, r: number): Sh =>
  (a) =>
    circle(cx, cy, r, a);
const E =
  (cx: number, cy: number, rx: number, ry: number): Sh =>
  (a) =>
    ellipse(cx, cy, rx, ry, a);
const R =
  (x: number, y: number, w: number, h: number, r: number): Sh =>
  (a) =>
    rect(x, y, w, h, r, a);
const T =
  (transform: string, sh: Sh): Sh =>
  (a) =>
    group(transform, sh(a));

/** What makes it a sticker: a soft cocoa shadow, low and to the right, and a die-cut white edge. */
const edge = (...shapes: Sh[]): string => shapes.map((sh) => sh(paint(MILK, MILK, RIM))).join('');
const cast = (...shapes: Sh[]): string => group('translate(1 3)', shapes.map((sh) => sh(`${paint(COCOA, COCOA, RIM)} opacity="0.15"`)).join(''));
const sticker = (...shapes: Sh[]): string => cast(...shapes) + edge(...shapes);

/** The shaded lower right of a round form: a crescent just inside its outline. */
function moon(cx: number, cy: number, rx: number, ry = rx, from = -28, to = 148, flat = 1.07): string {
  const [ax, ay] = [n(cx + (rx - 2) * Math.cos(rad(from))), n(cy + (ry - 2) * Math.sin(rad(from)))];
  const [bx, by] = [n(cx + (rx - 2) * Math.cos(rad(to))), n(cy + (ry - 2) * Math.sin(rad(to)))];
  return `M${ax} ${ay}A${rx - 2} ${ry - 2} 0 0 1 ${bx} ${by}A${n((rx - 2) * flat)} ${n((ry - 2) * flat)} 0 0 0 ${ax} ${ay}Z`;
}
/** The shaded foot of a rounded box: a band along the inside of its bottom edge. */
function foot(x: number, y: number, w: number, h: number, r: number, b = 7): string {
  const [x0, x1, y1, c] = [x + 2, x + w - 2, y + h - 2, Math.max(r - 2, 2)];
  return `M${x0} ${y1 - c}Q${x0} ${y1} ${x0 + c} ${y1}H${x1 - c}Q${x1} ${y1} ${x1} ${y1 - c}Q${n(x1 - b * 0.5)} ${y1 - b} ${x1 - c} ${y1 - b}H${x0 + c}Q${n(x0 + b * 0.5)} ${y1 - b} ${x0} ${y1 - c}Z`;
}
/** A glossy highlight: a bean of light and a dot beside it, tilted toward the top left. */
const gloss = (cx: number, cy: number, s = 1, turn = -38, o = 0.85): string =>
  group(`rotate(${turn} ${cx} ${cy})`, ellipse(cx, cy, n(6.5 * s), n(2.9 * s), shine(o)) + circle(n(cx + 11 * s), cy, n(1.9 * s), shine(o)));
/** The bean alone, where there is no room for the dot. */
const glint = (cx: number, cy: number, s = 1, turn = -38, o = 0.85): string => group(`rotate(${turn} ${cx} ${cy})`, ellipse(cx, cy, n(6.5 * s), n(2.9 * s), shine(o)));

const eye = (k: Kit, cx: number, cy: number, r: number): string => ellipse(cx, cy, n(r * 0.88), r, paint(k.T)) + circle(n(cx - r * 0.28), n(cy - r * 0.36), n(r * 0.38), paint(MILK));
const eyes = (k: Kit, cx: number, cy: number, apart: number, r = 4): string => eye(k, n(cx - apart), cy, r) + eye(k, n(cx + apart), cy, r);
const smile = (k: Kit, cx: number, cy: number, half = 4, w = 2.8, colour = k.T): string =>
  path(`M${n(cx - half)} ${n(cy)}Q${n(cx)} ${n(cy + half * 1.3)} ${n(cx + half)} ${n(cy)}`, paint('none', colour, w));
const cheeks = (k: Kit, cx: number, cy: number, apart: number, r = 4.6): string =>
  ellipse(n(cx - apart), cy, r, n(r * 0.66), `${paint(BERRY)} opacity="0.6"`) + ellipse(n(cx + apart), cy, r, n(r * 0.66), `${paint(BERRY)} opacity="0.6"`);
/** Two shiny eyes, a small smile and strawberry cheeks, centred on the eyes. `spread` is how far out the cheeks sit. */
const face = (k: Kit, cx: number, cy: number, s = 1, spread = 15.5): string =>
  eyes(k, cx, cy, n(8.5 * s), n(4.1 * s)) + smile(k, cx, n(cy + 3.4 * s), n(4 * s), n(2.8 * s)) + cheeks(k, cx, n(cy + 6.6 * s), n(spread * s), n(4.6 * s));

const heartPath = (cx: number, cy: number, s: number): string =>
  `M${n(cx)} ${n(cy + 5 * s)}C${n(cx - 9 * s)} ${n(cy - 1 * s)} ${n(cx - 5 * s)} ${n(cy - 8 * s)} ${n(cx)} ${n(cy - 3 * s)}C${n(cx + 5 * s)} ${n(cy - 8 * s)} ${n(cx + 9 * s)} ${n(cy - 1 * s)} ${n(cx)} ${n(cy + 5 * s)}Z`;
/** A strawberry heart with a dot of light on it. */
const heart = (cx: number, cy: number, s: number, colour = BERRY): string => path(heartPath(cx, cy, s), paint(colour)) + circle(n(cx - 2.6 * s), n(cy - 2.4 * s), n(0.95 * s), shine(0.85));
const starPoints = (cx: number, cy: number, big: number, inner = 0.5): string =>
  Array.from({ length: 10 }, (_, i) => {
    const at = rad(-90 + i * 36);
    const r = i % 2 ? big * inner : big;
    return `${n(cx + Math.cos(at) * r)},${n(cy + Math.sin(at) * r)}`;
  }).join(' ');
const star = (cx: number, cy: number, big: number, attrs: string, inner = 0.5): string => poly(starPoints(cx, cy, big, inner), attrs);
/** A four-pointed sparkle. */
const sparklePath = (cx: number, cy: number, r: number): string =>
  `M${n(cx)} ${n(cy - r)}Q${n(cx)} ${n(cy)} ${n(cx + r)} ${n(cy)}Q${n(cx)} ${n(cy)} ${n(cx)} ${n(cy + r)}Q${n(cx)} ${n(cy)} ${n(cx - r)} ${n(cy)}Q${n(cx)} ${n(cy)} ${n(cx)} ${n(cy - r)}Z`;
const sparkle = (cx: number, cy: number, r: number, colour = BUTTER): string => path(sparklePath(cx, cy, r), paint(colour, colour, 2));

/** A closed, fully rounded outline through a ring of corners: each corner is turned, none is sharp. */
function blob(corners: Array<[number, number]>): string {
  const mid = (i: number): string => {
    const [a, b] = [corners[i % corners.length], corners[(i + 1) % corners.length]];
    return `${n((a[0] + b[0]) / 2)} ${n((a[1] + b[1]) / 2)}`;
  };
  return `M${mid(corners.length - 1)}${corners.map(([x, y], i) => `Q${n(x)} ${n(y)} ${mid(i)}`).join('')}Z`;
}
/** A cog's outline: `teeth` soft teeth between a root and a tip radius. */
function cog(cx: number, cy: number, tip: number, root: number, teeth: number): string {
  const step = 360 / teeth;
  const at = (r: number, deg: number): [number, number] => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
  return blob(Array.from({ length: teeth }, (_, i) => i * step - 90).flatMap((a) => [at(root, a - step * 0.33), at(tip, a - step * 0.2), at(tip, a + step * 0.2), at(root, a + step * 0.33)]));
}
/** A scalloped round edge: `waves` bumps between two radii. */
function scallop(cx: number, cy: number, out: number, inn: number, waves: number): string {
  const step = 360 / waves;
  const at = (r: number, deg: number): [number, number] => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
  return blob(Array.from({ length: waves }, (_, i) => i * step - 90).flatMap((a) => [at(out * 1.08, a), at(inn * 0.94, a + step / 2)]));
}

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

/** Round shoulders under a head. */
const shoulders = (cx: number, width: number, top: number, bottom: number): Sh =>
  P(`M${cx - width / 2 + 6} ${bottom}Q${cx - width / 2} ${bottom} ${cx - width / 2} ${bottom - 6}Q${cx - width / 2} ${top} ${cx} ${top}Q${cx + width / 2} ${top} ${cx + width / 2} ${bottom - 6}Q${cx + width / 2} ${bottom} ${cx + width / 2 - 6} ${bottom}Z`);
const earsOf = (cx: number, cy: number, r: number): [Sh, Sh] => [C(n(cx - r * 0.74), n(cy - r * 0.7), n(r * 0.4)), C(n(cx + r * 0.74), n(cy - r * 0.7), n(r * 0.4))];
/** A bear-eared head: two ears pink inside, a round head shaded and glossed. */
const bear = (k: Kit, cx: number, cy: number, r: number, attrs: string, lit = true): string => {
  const [left, right] = earsOf(cx, cy, r);
  return (
    left(attrs) +
    right(attrs) +
    circle(n(cx - r * 0.74), n(cy - r * 0.7), n(r * 0.17), `${paint(BERRY)} opacity="0.7"`) +
    circle(n(cx + r * 0.74), n(cy - r * 0.7), n(r * 0.17), `${paint(BERRY)} opacity="0.7"`) +
    circle(cx, cy, r, attrs) +
    (lit ? path(moon(cx, cy, r), shade(k, 0.18)) + glint(n(cx - r * 0.42), n(cy - r * 0.62), r / 22) : '')
  );
};

/** The quiet things scattered over the page behind the diagram. */
const PAGE: Array<[kind: 'sparkle' | 'heart' | 'dot' | 'star', x: number, y: number, size: number, colour: string, turn: number]> = [
  ['sparkle', 38, 46, 8, '#ffe7b0', 0],
  ['dot', 124, 26, 2.5, '#ffd3e0', 0],
  ['heart', 190, 70, 1.3, '#ffd0de', -14],
  ['sparkle', 270, 34, 5, '#e2d8ff', 0],
  ['star', 96, 126, 6, '#d5efe5', 12],
  ['dot', 26, 170, 2.5, '#e2d8ff', 0],
  ['sparkle', 222, 150, 9, '#ffd3e0', 0],
  ['dot', 296, 214, 2.5, '#d5efe5', 0],
  ['sparkle', 70, 236, 5, '#d3e9ff', 0],
  ['heart', 134, 284, 1.5, '#ffd3e0', 10],
  ['dot', 204, 250, 2.5, '#ffe7b0', 0],
  ['star', 264, 294, 5, '#ffe7b0', -10],
];

export const cute: Pack = {
  id: 'cute',
  name: 'Cute',
  summary: 'A kawaii sticker sheet: a busy bee, a jam jar, a caterpillar queue and bear-eared friends, glossy, die-cut and smiling',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 70,
  style: {
    // A felt-tip in a steady little hand: fat, round, and each line in the colour it started from.
    hand: { base: 'draft', wobble: 'calm', retrace: false },
    general: { weight: 'bold', corners: 'round', shadow: false },
    connectors: { weight: 'bold', colour: 'source' },
    schemes: {
      light: scheme(
        { canvas: '#fff4f7', grid: '#f8dbe5', text: '#553730', textMuted: '#8a6460', edge: '#b3807c', edgeText: '#7d5752', edgeLabelBg: '#ffffff', codeBg: '#ffeef3', codeBorder: '#f5cddb' },
        {
          neutral: ['#fffaf2', '#8a5f52', '#553730', '#b44d6c'],
          teal: ['#d2f5e8', '#3aa98b', '#15473a', '#1f8469'],
          blue: ['#d8ebff', '#5697df', '#1b406a', '#2a72bd'],
          violet: ['#e9e0ff', '#8f74df', '#382870', '#7153cc'],
          amber: ['#fff0b5', '#c98a0c', '#573d06', '#a66c00'],
          rose: ['#ffd9e4', '#ea5a88', '#681a38', '#cc3a6f'],
          green: ['#dff6c6', '#66ae3f', '#284b12', '#488a24'],
        },
      ),
    },
  },
  draw: {
    // A felt card, die-cut and stitched round its edge, held to the page by a strip of washi tape:
    // a heart sewn into the top-left corner, a sparkle in the top-right. An API has a snap
    // fastener on its left edge, and leaves the bottom-right corner to the "API" tag.
    serviceCard: (k, kind) => {
      const api = kind === 'api';
      const skip = (x: number, y: number) =>
        (x < 52 && y < 52) || (x > 300 && y < 44) || (Math.abs(x - 174) < 38 && y < 30) || (x > 284 && y > 86) || (api && x < 44 && Math.abs(y - 63) < 24);
      const [x0, y0, x1, y1, r] = [17, 17, 331, 109, 9];
      const seam =
        stitches(x0 + r + 6, y0, x1 - r - 6, y0, skip) +
        stitches(x1, y0 + r + 6, x1, y1 - r - 6, skip) +
        stitches(x1 - r - 6, y1, x0 + r + 6, y1, skip) +
        corner(x0, y1, 1, -1, r) +
        stitches(x0, y1 - r - 6, x0, y0 + r + 6, skip);
      const card = R(5, 5, 338, 116, 20);
      return (
        sticker(card) +
        card(body(k)) +
        path(foot(5, 5, 338, 116, 20, 9), shade(k, 0.13)) +
        path('M12 34Q12 12 34 12', line(k, 3.5, MILK)) +
        path(seam, `${line(k, 3)} opacity="0.75"`) +
        group('rotate(-3 174 10)', rect(144, 2, 60, 15, 2, `${paint(PEACH)} opacity="0.92"`) + path('M158 2l-5 15h7l5-15zM178 2l-5 15h7l5-15zM198 2l-5 15h7l5-15z', shine(0.5))) +
        heart(31, 32, 1.9) +
        sparkle(316, 30, 9) +
        circle(303, 21, 2.2, paint(LILAC)) +
        (api
          ? circle(23, 63, 10.5, paint(k.C, k.L, 3.5)) + circle(23, 63, 3.6, paint(MILK)) + glint(18.5, 57.5, 0.5)
          : star(316, 99, 9, paint(MINT)) + circle(301, 106, 2.2, paint(BERRY)))
      );
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A busy bee: striped, winged, a sting behind.
        case 'worker': {
          const bee = E(64, 62, 42, 28);
          const near = T('rotate(-14 68 27)', E(68, 27, 14, 19));
          const far = T('rotate(26 94 31)', E(94, 31, 12, 17));
          return (
            sticker(bee) + edge(near, far) +
            poly('104,56 120,63 104,70', paint(k.L, k.L, 3)) +
            far(paint(GLASS, k.L, 4)) +
            near(paint(GLASS, k.L, 4)) +
            glint(64, 20, 0.7, -70) +
            path('M38 42Q34 28 26 24M50 37Q50 22 44 15', line(k, 3.5)) +
            circle(25, 22, 4.6, paint(k.C)) +
            circle(43, 13, 4.6, paint(k.C)) +
            bee(paint(k.F)) +
            path('M80 37Q87 62 80 87', line(k, 9)) +
            path('M96 45Q100 62 96 79', line(k, 8)) +
            path(moon(64, 62, 42, 28), shade(k, 0.22)) +
            bee(line(k, W)) +
            gloss(42, 44) +
            face(k, 45, 60, 1, 14.5)
          );
        }
        // A little ringed planet, out among the stars.
        case 'external': {
          const tilt = 'rotate(-16 68 54)';
          const globe = C(68, 54, 36);
          return (
            sticker(globe, T(tilt, E(68, 54, 59, 15))) +
            group(tilt, ellipse(68, 54, 59, 15, line(k, 9)) + ellipse(68, 54, 59, 15, line(k, 3.5, k.F))) +
            globe(paint(k.F)) +
            circle(87, 33, 6, tint(k, 0.3)) +
            circle(48, 78, 4.5, tint(k, 0.3)) +
            path(moon(68, 54, 36), shade(k, 0.2)) +
            globe(line(k, W)) +
            gloss(49, 31) +
            face(k, 65, 42, 0.95, 15) +
            group(tilt, path('M9 54A59 15 0 0 0 127 54', line(k, 9)) + path('M9 54A59 15 0 0 0 127 54', line(k, 3.5, k.F))) +
            star(17, 17, 11, paint(BUTTER)) +
            sparkle(121, 90, 8, LILAC) +
            circle(116, 14, 2.6, paint(BERRY))
          );
        }
        // An alarm clock: two bells, two feet and the time on its face.
        case 'scheduler': {
          const clock = C(68, 57, 38);
          const bell = P('M54 15A14 14 0 0 1 82 15Z');
          const left = T('rotate(-38 68 57)', bell);
          const right = T('rotate(38 68 57)', bell);
          return (
            sticker(clock) + edge(left, right) +
            path('M46 88L40 96M90 88L96 96', line(k, 7)) +
            rect(64, 9, 8, 12, 3, paint(k.L)) +
            left(soft(k, 0.55, 4.5)) +
            right(soft(k, 0.55, 4.5)) +
            clock(paint(k.F)) +
            path(moon(68, 57, 38), shade(k, 0.22)) +
            clock(line(k, W)) +
            circle(68, 57, 28, paint(MILK, k.L, 3)) +
            path('M68 39V57L80 50', paint('none', k.T, 4.5)) +
            circle(68, 57, 3.2, paint(BERRY)) +
            eyes(k, 68, 65, 13, 3.6) +
            smile(k, 68, 68.5, 4, 2.6) +
            cheeks(k, 68, 72, 18, 4) +
            glint(40, 33, 0.8)
          );
        }
        // A little house whose door is its open mouth: the one way in.
        case 'gateway': {
          const walls = R(20, 50, 96, 45, 7);
          const roof = P('M68 7L127 49Q131 54 124 54H12Q5 54 9 49Z');
          const stack = R(92, 11, 14, 26, 3);
          return (
            sticker(walls, roof) + edge(stack) +
            stack(body(k, 4.5)) +
            walls(body(k)) +
            path(foot(20, 50, 96, 45, 7, 6), shade(k, 0.18)) +
            rect(22.5, 54, 91, 7, 0, shade(k, 0.2)) +
            roof(soft(k, 0.5)) +
            path('M61 17L24 44', line(k, 4, MILK)) +
            heart(68, 35, 1.8) +
            path('M54 95V75A14 14 0 0 1 82 75V95Z', paint(k.C, k.L, 4.5)) +
            circle(76, 85, 2.6, paint(BUTTER)) +
            eyes(k, 68, 70, 31, 4.2) +
            cheeks(k, 68, 81, 31, 4.4)
          );
        }
        // One string in the hand, three balloons.
        case 'load-balancer': {
          const balloon = (cx: number, cy: number, rx: number, ry: number, washed: boolean) =>
            poly(`${cx - 4.5},${cy + ry + 5} ${cx + 4.5},${cy + ry + 5} ${cx},${cy + ry - 2}`, paint(k.L, k.L, 2)) +
            ellipse(cx, cy, rx, ry, paint(k.F)) +
            (washed ? ellipse(cx, cy, rx, ry, tint(k, 0.4)) : '') +
            path(moon(cx, cy, rx, ry), shade(k, 0.2)) +
            ellipse(cx, cy, rx, ry, line(k, W)) +
            glint(n(cx - rx * 0.42), n(cy - ry * 0.52), rx / 20);
          return (
            sticker(E(27, 40, 19, 22), E(109, 40, 19, 22), E(68, 31, 22, 25)) +
            path('M27 66Q40 82 68 90M68 60V90M109 66Q96 82 68 90', line(k, 3)) +
            balloon(27, 40, 19, 22, true) +
            balloon(109, 40, 19, 22, true) +
            balloon(68, 31, 22, 25, false) +
            face(k, 68, 30, 0.82, 14.5) +
            heart(68, 92, 1.9)
          );
        }
        // A friendly ghost, a hand out to either side: it stands in for someone.
        case 'proxy': {
          const ghost = P('M30 94V46A38 38 0 0 1 106 46V94Q93.3 80 80.7 94Q68 80 55.3 94Q42.7 80 30 94Z');
          const left = P('M33 58Q14 52 13 64Q14 74 33 72');
          const right = P('M103 58Q122 52 123 64Q122 74 103 72');
          return (
            sticker(ghost, left, right) +
            left(body(k)) +
            right(body(k)) +
            ghost(paint(k.F)) +
            path('M103.5 46V90Q99 85 94 85.5Q99 66 96 44Q94 30 85 19Q103.5 27 103.5 46Z', shade(k, 0.2)) +
            ghost(line(k, W)) +
            gloss(47, 27) +
            eyes(k, 68, 46, 12, 5) +
            ellipse(68, 60, 4.6, 5.4, paint(k.T)) +
            cheeks(k, 68, 57, 22, 5) +
            sparkle(121, 24, 7, LILAC) +
            circle(14, 30, 2.6, paint(BERRY))
          );
        }
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // A jam jar, half full, under its lid.
        case 'generic': {
          const jar = P('M30 28H110Q126 28 126 44V83Q126 99 110 99H30Q14 99 14 83V44Q14 28 30 28Z');
          const lid = R(30, 6, 80, 23, 8);
          return (
            sticker(jar, lid) +
            jar(paint(k.F)) +
            path('M16.5 58Q30.5 50 44.5 58T72.5 58T100.5 58T123.5 58V83Q123.5 96.5 110 96.5H30Q16.5 96.5 16.5 83Z', tint(k, 0.42)) +
            path('M113 30.8Q123.5 33 123.5 44V83Q123.5 96.5 110 96.5H103Q114 94 114 83Z', shade(k, 0.18)) +
            jar(line(k, W)) +
            lid(soft(k, 0.55)) +
            rect(32.5, 22, 75, 4.5, 2, shade(k, 0.22)) +
            rect(38, 10.5, 30, 4, 2, shine(0.7)) +
            rect(23, 38, 5.5, 20, 2.75, shine(0.85)) +
            circle(25.75, 65, 2.6, shine(0.85)) +
            face(k, 70, 73)
          );
        }
        // A bento box, everything in its own compartment, chopsticks laid across the top.
        case 'sql': {
          const box = R(8, 28, 124, 71, 14);
          return (
            sticker(box, P('M14 9L126 13M14 19L126 19')) +
            path('M14 9L126 13M14 19L126 19', line(k, 5, PEACH)) +
            box(paint(k.F)) +
            path('M65.5 30.5H118Q129.5 30.5 129.5 42V63H65.5Z', tint(k, 0.22)) +
            path(foot(8, 28, 124, 71, 14, 7), shade(k, 0.18)) +
            box(line(k, W)) +
            path('M64 31V96.5M64 63.5H129.5', line(k, 3.5)) +
            path('M36 41Q41 41 46 51L54 69Q58 85 46 85H26Q14 85 18 69L26 51Q31 41 36 41Z', paint(MILK, k.L, 3.5)) +
            rect(28, 74, 16, 11, 2, paint(k.T)) +
            eyes(k, 36, 61, 6, 3) +
            smile(k, 36, 63.5, 2.8, 2.2) +
            cheeks(k, 36, 67, 11, 3) +
            heart(97, 47, 2.1) +
            star(97, 81, 12, paint(BUTTER, HONEY, 2.5)) +
            glint(22, 37, 0.7, 0)
          );
        }
        // A bowl of mixed sweets: a ball, a star and a cube, no two alike.
        case 'nosql': {
          const bowl = P('M10 54H130Q130 96 70 96Q10 96 10 54Z');
          const ball = C(38, 37, 16);
          const cube = T('rotate(14 104 38)', R(89, 24, 29, 29, 7));
          const sweet: Sh = (a) => star(71, 29, 22, a, 0.56);
          return (
            sticker(bowl) + edge(ball, cube, sweet) +
            ball(paint(BERRY, k.L, 4.5)) +
            glint(32, 29, 0.6) +
            cube(paint(MINT, k.L, 4.5)) +
            glint(98, 31, 0.55) +
            sweet(paint(BUTTER, k.L, 4.5)) +
            rect(52, 88, 36, 11, 5, body(k)) +
            bowl(paint(k.F)) +
            rect(12.5, 56.5, 115, 7, 0, tint(k, 0.4)) +
            path('M127.4 60Q124 93 72 93.5Q112 88 116 60Z', shade(k, 0.2)) +
            bowl(line(k, W)) +
            gloss(27, 73, 0.9, -60) +
            face(k, 70, 76)
          );
        }
        // A storm cloud with a bolt of lightning: fast, and gone again.
        case 'cache': {
          const cloud = P('M32 62A19 19 0 0 1 30 26A27 27 0 0 1 78 16A25 25 0 0 1 118 34A15 15 0 0 1 110 62Z');
          const bolt: Sh = (a) => poly('82,52 56,80 72,80 64,98 96,68 79,68 91,52', a);
          return (
            sticker(cloud, bolt) +
            bolt(paint(BUTTER, HONEY, 4.5)) +
            cloud(paint(k.F)) +
            path('M21 52Q26 59.5 33 59.5H109Q119 59 122.5 46Q114 53 104 53H38Q28 54 21 52Z', shade(k, 0.2)) +
            cloud(line(k, W)) +
            gloss(41, 21) +
            face(k, 70, 39) +
            sparkle(120, 84, 8) +
            sparkle(27, 82, 6, LILAC)
          );
        }
        // A folder with a sheet tucked into it.
        case 'file-system': {
          const back = P('M12 94V20Q12 10 22 10H50Q56 10 60 15L66 22H118Q128 22 128 32V94Z');
          const front = P('M8 47Q7 39 15 39H125Q133 39 132 47L127 91Q126 99 118 99H22Q14 99 13 91Z');
          return (
            sticker(back, front) +
            back(body(k)) +
            back(tint(k, 0.42)) +
            group('rotate(4 81 32)', rect(50, 14, 62, 38, 5, paint(MILK, k.L, 3.5)) + path('M60 25H101M60 33H88', `${line(k, 3)} opacity="0.55"`)) +
            front(paint(k.F)) +
            path('M12 84L13 91Q14 96.5 22 96.5H118Q126 96.5 127 91L128 84Q125 90 118 90H22Q15 90 12 84Z', shade(k, 0.2)) +
            front(line(k, W)) +
            rect(18, 44.5, 34, 4, 2, shine(0.8)) +
            circle(58.5, 46.5, 2, shine(0.8)) +
            face(k, 70, 67) +
            heart(113, 55, 1.4)
          );
        }
        // A gift box tied with a bow: anything at all may be inside.
        case 'object-storage': {
          const box = R(20, 46, 100, 53, 9);
          const lid = R(12, 30, 116, 22, 8);
          const loopL = P('M70 32Q44 3 32 15Q24 29 70 32Z');
          const loopR = P('M70 32Q96 3 108 15Q116 29 70 32Z');
          return (
            sticker(box, lid) + edge(loopL, loopR) +
            loopL(paint(k.C, k.L, 4.5)) +
            loopR(paint(k.C, k.L, 4.5)) +
            box(paint(k.F)) +
            rect(61, 50, 18, 46.5, 0, paint(k.C)) +
            rect(22.5, 52, 95, 6, 0, shade(k, 0.2)) +
            path(foot(20, 46, 100, 53, 9, 6), shade(k, 0.18)) +
            box(line(k, W)) +
            lid(paint(k.F)) +
            rect(61, 32.5, 18, 17, 0, paint(k.C)) +
            lid(line(k, W)) +
            rect(64, 34, 3.5, 60, 1.75, shine(0.35)) +
            rect(19, 35, 26, 4, 2, shine(0.8)) +
            circle(70, 31, 7.5, paint(k.C, k.L, 4)) +
            glint(45, 14.5, 0.6, -30, 0.6) +
            eyes(k, 70, 73, 27, 4) +
            smile(k, 70, 76, 4.2, 2.8, MILK) +
            cheeks(k, 70, 82, 33, 4.4)
          );
        }
        // A magnifying glass, looking back at you.
        case 'search-index': {
          const rim = C(52, 48, 40);
          return (
            group('translate(1 3)', path('M84 78L119 96', `${paint('none', COCOA, 20)} opacity="0.15"`)) +
            sticker(rim) +
            path('M84 78L119 96', line(k, 20, MILK)) +
            path('M84 78L119 96', line(k, 15)) +
            path('M92 82L118.5 95.6', line(k, 6, k.C)) +
            rim(paint(k.F)) +
            path(moon(52, 48, 40), shade(k, 0.22)) +
            rim(line(k, W)) +
            circle(52, 48, 29, paint(GLASS, k.L, 3.5)) +
            path('M29 46Q30 31 44 25Q36 34 34.5 46Z', shine(0.9)) +
            face(k, 54, 49, 0.95) +
            sparkle(118, 24, 9) +
            circle(104, 9, 2.4, paint(LILAC))
          );
        }
        // A table, as tables are: laid with a gingham cloth, squares in rows and columns.
        case 'table': {
          const cloth = P(`M12 22H128V63${'q-9.67 9-19.33 0'.repeat(6)}Z`);
          const top = R(6, 8, 128, 15, 7.5);
          const legL = R(21, 56, 12, 43, 5);
          const legR = R(107, 56, 12, 43, 5);
          return (
            sticker(cloth, legL, legR) + edge(top) +
            legL(body(k)) +
            legR(body(k)) +
            cloth(paint(k.F)) +
            path('M14.5 24.5H41V43H14.5ZM70 24.5H99V43H70ZM41 43H70V63H41ZM99 43H125.5V63H99Z', tint(k, 0.4)) +
            path('M41 24.5H70V43H41ZM99 24.5H125.5V43H99ZM14.5 43H41V63H14.5ZM70 43H99V63H70Z', tint(k, 0.14)) +
            cloth(line(k, W)) +
            top(soft(k, 0.55)) +
            rect(14, 11.5, 30, 3.6, 1.8, shine(0.75)) +
            face(k, 70, 41, 0.95)
          );
        }
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // A caterpillar: bead after bead, in order, behind one head.
        case 'queue': {
          const beads = [26, 60, 94, 128, 162, 196];
          const head = C(241, 32, 22);
          return (
            group('translate(1 3)', rect(10, 30, 204, 24, 12, `${paint(COCOA, COCOA, RIM)} opacity="0.15"`) + head(`${paint(COCOA, COCOA, RIM)} opacity="0.15"`)) +
            beads.map((cx) => circle(cx, 36, 18, paint(MILK, MILK, RIM))).join('') +
            head(paint(MILK, MILK, RIM)) +
            path('M231 13L226 5M251 13L256 5', line(k, 3.2)) +
            circle(225.5, 4.6, 3.4, paint(k.C)) +
            circle(256.5, 4.6, 3.4, paint(k.C)) +
            beads
              .map((cx, i) => circle(cx, 36, 18, body(k)) + (i % 2 ? '' : circle(cx, 36, 15.5, tint(k, 0.38))) + path(moon(cx, 36, 18), shade(k, 0.2)) + glint(cx - 7, 26, 0.55))
              .join('') +
            head(body(k)) +
            path(moon(241, 32, 22), shade(k, 0.2)) +
            glint(230, 17, 0.7) +
            face(k, 242, 31, 0.92, 14)
          );
        }
        // A megaphone, and one message flying out to three hearts.
        case 'topic': {
          const cone = P('M30 20L98 6Q106 4.5 106 12V50Q106 57.5 98 56L30 42Z');
          const grip = R(8, 17, 26, 28, 9);
          const bell = R(101, 4, 11, 54, 5.5);
          const hearts = [P(heartPath(228, 13, 2)), P(heartPath(256, 31, 2)), P(heartPath(228, 49, 2))];
          return (
            sticker(cone, grip, bell, ...hearts) +
            path('M56 46L51 57', line(k, 7)) +
            cone(paint(k.F)) +
            path('M32.5 34L103.5 40V50Q103.5 55 98 53.5L32.5 39.5Z', shade(k, 0.18)) +
            cone(line(k, W)) +
            grip(paint(k.C, k.L, 4.5)) +
            bell(soft(k, 0.55, 4.5)) +
            glint(46, 20.5, 0.75, -11) +
            face(k, 72, 28, 0.8, 14.5) +
            path('M124 19Q133 31 124 43', line(k, 4)) +
            path(stitches(144, 27, 204, 16, undefined, 9, 9) + stitches(144, 31, 232, 31, undefined, 9, 9) + stitches(144, 35, 204, 46, undefined, 9, 9), line(k, 3.2)) +
            hearts.map((sh) => sh(paint(BERRY, k.L, 3))).join('') +
            circle(223, 8.5, 2, shine(0.85)) +
            circle(251, 26.5, 2, shine(0.85)) +
            circle(223, 44.5, 2, shine(0.85))
          );
        }
        // A stream, and paper boats sailing down it one after another.
        case 'stream': {
          const water = P('M6 39Q27.5 29 49 39T92 39T135 39T178 39T221 39T264 39L270 37.5V47Q270 55 262 55H14Q6 55 6 47Z');
          const sail = (cx: number): Sh => P(`M${cx} 5L${cx + 13} 21H${cx - 13}Z`);
          const hull = (cx: number): Sh => P(`M${cx - 25} 24H${cx + 25}L${cx + 15} 42H${cx - 15}Z`);
          const boats = [70, 156, 242];
          return (
            cast(water) + edge(water, ...boats.flatMap((cx) => [sail(cx), hull(cx)])) +
            boats
              .map(
                (cx) =>
                  sail(cx)(paint(MILK, k.L, 3.5)) +
                  hull(cx)(soft(k, 0.5, 3.5)) +
                  circle(cx - 6, 31, 2.4, paint(k.T)) +
                  circle(cx + 6, 31, 2.4, paint(k.T)) +
                  ellipse(cx - 12.5, 33.5, 2.8, 1.8, `${paint(BERRY)} opacity="0.65"`) +
                  ellipse(cx + 12.5, 33.5, 2.8, 1.8, `${paint(BERRY)} opacity="0.65"`),
              )
              .join('') +
            water(paint(k.F)) +
            water(tint(k, 0.26)) +
            path('M8.5 47Q8.5 52.5 14 52.5H262Q267.5 52.5 267.5 47Q264 49 258 49H18Q12 49 8.5 47Z', shade(k, 0.2)) +
            water(line(k, W)) +
            path('M14 47q7-4 14 0t14 0M100 47q7-4 14 0t14 0M186 47q7-4 14 0t14 0', line(k, 3, MILK))
          );
        }
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A bear-eared person, a heart on their jumper.
        case 'human': {
          const torso = shoulders(60, 66, 49, 73);
          return (
            sticker(torso, C(60, 29, 20)) + edge(...earsOf(60, 29, 20)) +
            torso(body(k)) +
            ellipse(60, 52, 19, 6, shade(k, 0.22)) +
            heart(60, 64, 1.25) +
            bear(k, 60, 29, 20, body(k)) +
            face(k, 60, 30, 0.98, 13)
          );
        }
        // Three of them, the middle one in front.
        case 'group': {
          const [left, right, mid] = [shoulders(24, 38, 54, 73), shoulders(96, 38, 54, 73), shoulders(60, 54, 51, 73)];
          return (
            sticker(left, right, mid, C(24, 40, 13), C(96, 40, 13), C(60, 30, 18)) +
            left(body(k)) +
            left(tint(k, 0.3)) +
            bear(k, 24, 40, 13, body(k, 4.5), false) +
            circle(24, 40, 10.75, tint(k, 0.3)) +
            eyes(k, 24, 41, 5.2, 2.8) +
            right(body(k)) +
            right(tint(k, 0.3)) +
            bear(k, 96, 40, 13, body(k, 4.5), false) +
            circle(96, 40, 10.75, tint(k, 0.3)) +
            eyes(k, 96, 41, 5.2, 2.8) +
            mid(body(k)) +
            ellipse(60, 54, 15, 5, shade(k, 0.22)) +
            bear(k, 60, 30, 18, body(k)) +
            face(k, 60, 31, 0.9, 12.5)
          );
        }
        // A bunny from elsewhere, come to visit with a little bag.
        case 'thirdParty': {
          const torso = shoulders(42, 48, 56, 73);
          const earL = T('rotate(-10 35 19)', E(35, 19, 6.5, 12));
          const earR = T('rotate(10 49 19)', E(49, 19, 6.5, 12));
          const head = C(42, 42, 17);
          const bag = R(76, 49, 32, 24, 7);
          return (
            sticker(torso, head, bag) + edge(earL, earR) +
            torso(body(k)) +
            ellipse(42, 58, 14, 4.5, shade(k, 0.22)) +
            earL(body(k)) +
            earR(body(k)) +
            group('rotate(-10 35 19)', ellipse(35, 19.5, 2.4, 7, `${paint(BERRY)} opacity="0.65"`)) +
            group('rotate(10 49 19)', ellipse(49, 19.5, 2.4, 7, `${paint(BERRY)} opacity="0.65"`)) +
            head(body(k)) +
            path(moon(42, 42, 17), shade(k, 0.18)) +
            glint(34, 31, 0.7) +
            face(k, 42, 42, 0.82, 13) +
            path('M85 50V46Q85 39 92 39Q99 39 99 46V50', line(k, 4)) +
            bag(paint(k.C, k.L, 4.5)) +
            path(heartPath(92, 61.5, 1.15), paint(MILK)) +
            rect(80, 53, 12, 3, 1.5, shine(0.45))
          );
        }
        // A smiling desktop computer.
        case 'system': {
          const screen = R(15, 6, 90, 52, 12);
          const base = R(37, 63, 46, 10.5, 5);
          return (
            sticker(screen, base) +
            path('M60 58V66', line(k, 9)) +
            base(body(k)) +
            screen(body(k)) +
            path(foot(15, 6, 90, 52, 12, 6), shade(k, 0.2)) +
            rect(24, 13.5, 72, 36, 6, paint(GLASS, k.L, 3)) +
            poly('28,17 42,17 28,34', shine(0.75)) +
            face(k, 60, 29, 0.98) +
            circle(92, 53.6, 1.9, paint(MINT))
          );
        }
        // A phone with a face on its screen. Only the middle of the box is shown.
        case 'device': {
          const phone = R(42.5, 6, 35, 67, 10);
          return (
            sticker(phone) +
            phone(body(k)) +
            path(foot(42.5, 6, 35, 67, 10, 5), shade(k, 0.2)) +
            rect(47.5, 13, 25, 43, 4, paint(GLASS, k.L, 3)) +
            poly('50.5,16 59,16 50.5,27', shine(0.75)) +
            eyes(k, 60, 32, 5.6, 3) +
            smile(k, 60, 35, 3, 2.4) +
            cheeks(k, 60, 40, 8, 2.8) +
            circle(60, 64.5, 3.4, paint(k.C))
          );
        }
        // A round little robot: an aerial, two ear bolts, eyes behind a visor.
        case 'agent': {
          const head = R(24, 18, 72, 45, 22);
          const chest = P('M41 73V70Q41 61 50 61H70Q79 61 79 70V73Z');
          const [earL, earR] = [R(15, 31, 13, 18, 5), R(92, 31, 13, 18, 5)];
          return (
            sticker(chest, head) + edge(earL, earR) +
            chest(body(k)) +
            circle(60, 68.5, 2.4, paint(BERRY)) +
            path('M60 19V12', line(k, 4.5)) +
            circle(60, 9, 4.6, paint(BUTTER, k.L, 3)) +
            earL(paint(k.C, k.L, 4)) +
            earR(paint(k.C, k.L, 4)) +
            head(body(k)) +
            path(foot(24, 18, 72, 45, 22, 6), shade(k, 0.2)) +
            rect(33, 26.5, 54, 28, 14, paint(GLASS, k.L, 3.5)) +
            glint(42, 22.5, 0.6, 0) +
            eyes(k, 60, 39, 11, 4.2) +
            smile(k, 60, 42.5, 3.6, 2.6) +
            cheeks(k, 60, 46, 18, 3.6)
          );
        }
      }
    },

    // A gift tag: a point at one end with a ringed hole for the string, stitched along its sides.
    componentCard: (k) => {
      const tag = P('M42 5H280Q294 5 294 19V85Q294 99 280 99H42Q33 99 28 92L8 62Q1 52 8 42L28 12Q33 5 42 5Z');
      return (
        sticker(tag) +
        tag(paint(k.F)) +
        path('M33 94.5Q37 96.5 42 96.5H280Q291.5 96.5 291.5 85Q289 89.5 280 89.5H46Q38 89.5 33 94.5Z', shade(k, 0.14)) +
        tag(line(k, W)) +
        path(stitches(52, 16, 268, 16) + corner(283, 16, -1, 1, 9) + stitches(283, 31, 283, 73) + corner(283, 88, -1, -1, 9) + stitches(268, 88, 52, 88), `${line(k, 3)} opacity="0.75"`) +
        rect(46, 9.5, 46, 3.4, 1.7, shine(0.8)) +
        circle(28, 52, 8.5, paint(k.C, k.L, 3.5)) +
        circle(28, 52, 3.6, paint(k.K)) +
        circle(24.5, 48, 1.5, shine(0.8))
      );
    },

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A puzzle piece: one unit that fits the others.
        case 'module': {
          const piece = T(
            'translate(6 -5)',
            P('M12 38Q12 32 18 32H40A12 12 0 1 1 56 32H78Q84 32 84 38V58A12 12 0 1 1 84 74V94Q84 100 78 100H56A12 12 0 1 0 40 100H18Q12 100 12 94Z'),
          );
          return (
            sticker(piece) +
            piece(paint(k.F)) +
            group('translate(6 -5)', path('M57 97.5H78Q81.5 97.5 81.5 94V77Q76 80 76 88Q75 91 62 91Q58 93 57 97.5Z', shade(k, 0.2)) + path(moon(94.5, 66, 13.5), shade(k, 0.2))) +
            piece(line(k, W)) +
            glint(49, 16, 0.6) +
            gloss(29, 37, 0.8, 0) +
            face(k, 54, 54, 0.98) +
            sparkle(104, 22, 8) +
            circle(92, 9, 2.4, paint(BERRY))
          );
        }
        // A plug with two brass pins and a trailing lead.
        case 'adapter': {
          const plug = P('M22 42Q22 30 34 30H86Q98 30 98 42V52Q98 78 72 78H48Q22 78 22 52Z');
          const [pinL, pinR] = [R(40, 6, 11, 30, 4), R(69, 6, 11, 30, 4)];
          const collar = R(50, 72, 20, 14, 5);
          return (
            sticker(plug) + edge(pinL, pinR, collar) +
            path('M60 84Q60 95 76 95Q98 95 106 80', line(k, 6)) +
            collar(paint(k.C, k.L, 4.5)) +
            pinL(paint(BUTTER, k.L, 4)) +
            pinR(paint(BUTTER, k.L, 4)) +
            plug(paint(k.F)) +
            path('M95.5 44V52Q95.5 75.5 72 75.5H60Q85 74 87 44Z', shade(k, 0.2)) +
            plug(line(k, W)) +
            gloss(35, 39, 0.9, 0) +
            face(k, 60, 51)
          );
        }
        // A wall socket, which was always a face.
        case 'port': {
          const plate = R(12, 6, 96, 88, 22);
          return (
            sticker(plate) +
            plate(body(k)) +
            path(foot(12, 6, 96, 88, 22, 8), shade(k, 0.2)) +
            circle(60, 50, 31, soft(k, 0.3, 3.5)) +
            path(moon(60, 50, 31.5, 31.5, 152, 328), shade(k, 0.2)) +
            rect(44.5, 33, 9, 18, 4.5, paint(k.T)) +
            rect(66.5, 33, 9, 18, 4.5, paint(k.T)) +
            circle(47.2, 37.5, 1.7, paint(MILK)) +
            circle(69.2, 37.5, 1.7, paint(MILK)) +
            smile(k, 60, 59, 6, 3.2) +
            cheeks(k, 60, 61, 20, 4.6) +
            gloss(27, 17, 0.9, 0)
          );
        }
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A sheet of paper, its corner folded down.
        case 'file': {
          const sheet = P('M17 5H52L78 31V82Q78 91 69 91H17Q8 91 8 82V14Q8 5 17 5Z');
          return (
            sticker(sheet) +
            sheet(body(k)) +
            path(foot(8, 5, 70, 86, 9, 7), shade(k, 0.18)) +
            path('M56 33.5H75.5V44Q68 36 56 33.5Z', shade(k, 0.22)) +
            path('M52 5V22Q52 31 61 31H78Z', soft(k, 0.5, 4)) +
            path('M20 20H40M20 30H33', `${line(k, 3.5)} opacity="0.6"`) +
            face(k, 43, 57, 0.98) +
            heart(65, 78, 1.15)
          );
        }
        // A cog with a face: settings.
        case 'config': {
          const wheel = P(cog(43, 48, 39.5, 28, 8));
          return (
            sticker(wheel) +
            wheel(paint(k.F)) +
            path(moon(43, 48, 30), shade(k, 0.2)) +
            wheel(line(k, W)) +
            circle(43, 48, 22, `${line(k, 3)} opacity="0.35"`) +
            gloss(30, 33, 0.75) +
            face(k, 43, 47, 0.9, 14)
          );
        }
        // A key with a heart for a bow.
        case 'secret': {
          const bow = P(heartPath(43, 31, 4.5));
          const shaft = R(36, 46, 14, 45, 6);
          const [bitA, bitB] = [R(46, 65, 20, 10, 3.5), R(46, 79, 15, 10, 3.5)];
          return (
            sticker(shaft, bow) + edge(bitA, bitB) +
            bitA(soft(k, 0.45)) +
            bitB(soft(k, 0.45)) +
            shaft(soft(k, 0.45)) +
            rect(39.5, 58, 3, 28, 1.5, shine(0.6)) +
            bow(paint(k.F)) +
            path('M71 26Q71 38 45 51Q62 38 64 16Q70 19 71 26Z', shade(k, 0.2)) +
            bow(line(k, W)) +
            gloss(27, 19, 0.75) +
            face(k, 43, 27, 0.82, 14.5)
          );
        }
        // A rosette with two ribbon tails, a star pinned to it.
        case 'certificate': {
          const rose = P(scallop(43, 39, 32, 28, 12));
          const tailL = P('M30 56L20 91L32 83L41 91L46 58Z');
          const tailR = P('M56 56L66 91L54 83L45 91L40 58Z');
          return (
            sticker(tailL, tailR, rose) +
            tailL(paint(k.C, k.L, 4.5)) +
            tailR(paint(k.C, k.L, 4.5)) +
            rose(paint(k.F)) +
            rose(tint(k, 0.3)) +
            path(moon(43, 39, 31), shade(k, 0.2)) +
            rose(line(k, W)) +
            circle(43, 39, 20, paint(k.F, k.L, 3.5)) +
            face(k, 43, 38, 0.78, 12.5) +
            star(67, 16, 11, paint(BUTTER, HONEY, 2.5)) +
            glint(21, 21, 0.6)
          );
        }
      }
    },

    // A flower: a ring of petals round an empty middle.
    junction: (k) => {
      const petals = Array.from({ length: 8 }, (_, i) => {
        const at = rad(i * 45 + 22.5);
        return [n(50 + Math.cos(at) * 29), n(48 + Math.sin(at) * 29)] as const;
      });
      return (
        circle(51, 52, 43, `${paint(COCOA)} opacity="0.15"`) +
        petals.map(([x, y]) => circle(x, y, 12.5, paint(MILK, MILK, RIM))).join('') +
        petals.map(([x, y]) => circle(x, y, 12.5, body(k))).join('') +
        petals.map(([x, y]) => circle(x, y, 10, tint(k, 0.32))).join('') +
        circle(50, 48, 29.5, paint(k.F)) +
        glint(20, 28, 0.55) +
        glint(35, 16.5, 0.55, -20)
      );
    },
  },

  // A stationery page: the faintest strawberry gingham, with sparkles, hearts and dots let fall on it.
  backdrop: {
    tile: [320, 320],
    draw: () =>
      Array.from({ length: 8 }, (_, i) => rect(i * 40, 0, 20, 320, 0, `${paint('#ff86ab')} opacity="0.032"`) + rect(0, i * 40, 320, 20, 0, `${paint('#ff86ab')} opacity="0.032"`)).join('') +
      PAGE.map(([kind, x, y, size, colour, turn]) => {
        const mark =
          kind === 'sparkle'
            ? path(sparklePath(x, y, size), paint(colour, colour, 1.5))
            : kind === 'heart'
              ? path(heartPath(x, y, size), paint(colour))
              : kind === 'star'
                ? star(x, y, size, paint(colour, colour, 1.5))
                : circle(x, y, size, paint(colour));
        return turn ? group(`rotate(${turn} ${x} ${y})`, mark) : mark;
      }).join(''),
  },
};

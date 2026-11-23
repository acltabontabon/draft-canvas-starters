import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Match Point: a grass-court summer, drawn like a vintage club poster. The canvas is the lawn
 * itself, mown in stripes and ruled in chalk. Every kind of shape is something from the court or
 * the clubhouse: a service is a court plan with its net posts, a worker a ball machine, a gateway
 * the gate in the fence; a data store is a can of balls, a scoreboard, a kit bag, a row of lockers;
 * a queue is balls waiting on the baseline, a topic a loudhailer, a stream a rally over the net.
 * Each is a flat shape in the diagram's own colour with one hard shade on its lower right (the sun
 * is top left), one chalk highlight, and a touch of the club's materials: optic-yellow balls,
 * varnished wood, brass, net black and, rarely, strawberry red. The sport itself, and nobody's
 * tournament. Always dark: it is played on grass.
 */
const W = 5; // the outline of an object
const M = 3.5; // a mark inside it

// The club's materials: they stay as they are whatever colour a shape is given.
const CHALK = '#f6f1dc';
const BALL = '#d8f03c';
const WOOD = '#b0703c';
const BRASS = '#dcab42';
const NET = '#0c261b';
const BERRY = '#dc4254';

const n = (value: number) => Math.round(value * 10) / 10;
const op = (value: number) => (value < 1 ? ` opacity="${value}"` : '');
const flat = (colour: string, opacity = 1) => `fill="${colour}" stroke="none"${op(opacity)}`;
const ink = (colour: string, w = M, opacity = 1) => `fill="none" stroke="${colour}" stroke-width="${w}"${op(opacity)}`;
const body = (k: Kit, w = W) => paint(k.F, k.L, w);
const chip = (k: Kit, w = W) => paint(k.C, k.L, w);

/** The one hard shade: net black laid over the side away from the sun. */
const shade = (d: string, opacity = 0.32) => path(d, flat(NET, opacity));
/** The lit edge: a sliver of chalk. */
const glint = (d: string, w = 3, opacity = 0.7) => path(d, ink(CHALK, w, opacity));
/** The shadow an object stands on. */
const ground = (cx: number, cy: number, rx: number, ry = 3.5) => ellipse(cx, cy, rx, ry, flat(NET, 0.42));

/** Part of a circle, clockwise from `from` to `to` degrees (0 is east, 90 south). */
function arc(cx: number, cy: number, r: number, from: number, to: number): string {
  const at = (a: number) => `${n(cx + r * Math.cos((a * Math.PI) / 180))} ${n(cy + r * Math.sin((a * Math.PI) / 180))}`;
  return `M${at(from)}A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${at(to)}`;
}
/** Round things: shade along the lower right, chalk along the upper left. */
const roundShade = (cx: number, cy: number, r: number, w: number, opacity = 0.32) => path(arc(cx, cy, r, -25, 115), ink(NET, w, opacity));
const roundGlint = (cx: number, cy: number, r: number, w = 3) => glint(arc(cx, cy, r, 190, 262), w);

/** A band with only its top corners rounded: the header of a board or a sheet. */
const band = (x: number, y: number, w: number, h: number, r: number) => `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;

/** Several small boxes as one painted part. */
const boxes = (list: [number, number, number, number][]) => list.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}Z`).join('');

/** A ball: optic yellow, its two seams in chalk, and (when large enough to show) its shaded side. */
const ball = (cx: number, cy: number, r: number, opacity = 1) =>
  circle(cx, cy, r, flat(BALL, opacity)) +
  path(
    `M${n(cx - r * 0.5)} ${n(cy - r * 0.84)}Q${n(cx + r * 0.1)} ${n(cy)} ${n(cx - r * 0.5)} ${n(cy + r * 0.84)}M${n(cx + r * 0.5)} ${n(cy - r * 0.84)}Q${n(cx - r * 0.1)} ${n(cy)} ${n(cx + r * 0.5)} ${n(cy + r * 0.84)}`,
    ink(CHALK, n(Math.max(1.8, r * 0.17)), opacity < 1 ? opacity : 0.95),
  ) +
  (r >= 9 && opacity === 1 ? path(`M${n(cx + r * 0.87)} ${n(cy - r * 0.5)}Q${n(cx + r * 0.3)} ${n(cy + r * 0.3)} ${n(cx - r * 0.5)} ${n(cy + r * 0.87)}Q${n(cx + r * 0.9)} ${n(cy + r * 1.1)} ${n(cx + r * 0.87)} ${n(cy - r * 0.5)}Z`, flat(NET, 0.24)) : '');

/** The strings of a racket head: `nx` mains and `ny` crosses, cut to the oval. */
function strings(cx: number, cy: number, rx: number, ry: number, nx: number, ny: number): string {
  let d = '';
  for (let i = 1; i <= nx; i += 1) {
    const dx = -rx + (2 * rx * i) / (nx + 1);
    const h = ry * Math.sqrt(1 - (dx / rx) ** 2);
    d += `M${n(cx + dx)} ${n(cy - h)}V${n(cy + h)}`;
  }
  for (let i = 1; i <= ny; i += 1) {
    const dy = -ry + (2 * ry * i) / (ny + 1);
    const w = rx * Math.sqrt(1 - (dy / ry) ** 2);
    d += `M${n(cx - w)} ${n(cy + dy)}H${n(cx + w)}`;
  }
  return d;
}

/** A racket head: a dark face, ivory strings, and a frame in `frame`. */
const head = (cx: number, cy: number, rx: number, ry: number, nx: number, ny: number, frame: string, w = 5, face = NET) =>
  ellipse(cx, cy, rx, ry, flat(face, face === NET ? 0.55 : 1)) + path(strings(cx, cy, rx, ry, nx, ny), ink(CHALK, 1.8, 0.8)) + ellipse(cx, cy, rx, ry, ink(frame, w));

/** A point on a cubic curve. */
const bez = (p: [number, number][], t: number): [number, number] => {
  const u = 1 - t;
  const at = (i: 0 | 1) => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i];
  return [n(at(0)), n(at(1))];
};

/** A player, head and shoulders: whites, a headband knotted at the side. Drawn at 120 by 82. */
const player = (k: Kit, knot = BERRY) =>
  path('M24 78Q24 48 60 48Q96 48 96 78Z', chip(k)) +
  shade('M62 48Q96 48 96 78H72Q80 62 62 48Z', 0.24) +
  path('M48 49L60 63L72 49Z', paint(k.F, k.L, M)) +
  circle(60, 30, 15, chip(k)) +
  path('M45.6 26Q47 14 60 14Q73 14 74.4 26Q60 19 45.6 26Z', flat(k.F)) +
  path('M45 28Q60 21 75 28', ink(knot, 5.5)) +
  path('M76 28L86 24M76 29L86 34', ink(knot, 3.5));

/** A partner standing behind: smaller, the shirt in the shape's fill so the one in front leads. */
const partner = (k: Kit, cx: number, knot: string) =>
  path(`M${cx - 20} 78Q${cx - 20} 55 ${cx} 55Q${cx + 20} 55 ${cx + 20} 78Z`, body(k, 4.5)) +
  circle(cx, 41, 11.5, chip(k, 4.5)) +
  path(`M${cx - 11.5} 38Q${cx - 10} 29 ${cx} 29Q${cx + 10} 29 ${cx + 11.5} 38Q${cx} 33 ${cx - 11.5} 38Z`, flat(k.F)) +
  path(`M${cx - 11.5} 40Q${cx} 35 ${cx + 11.5} 40`, ink(knot, 4.5));

/** A court seen from above, as the frame of a card: baselines, tramlines, the net across the alleys. */
const court = (k: Kit) =>
  rect(3, 3, 342, 126, 9, flat(k.F)) +
  shade('M6 116H342V120Q342 126 336 126H12Q6 126 6 120Z', 0.36) +
  glint('M14 8.5H334', 2.5, 0.45) +
  rect(3, 3, 342, 126, 9, ink(k.L, W));

const TW = 560;
const TH = 420;

export const matchPoint: Pack = {
  id: 'match-point',
  name: 'Match Point',
  summary: 'A grass-court summer drawn like a vintage club poster: a ball machine, a scoreboard, a kit bag, a rally over the net',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 100,
  style: {
    // The groundsman's line marker: a chalk line, laid nearly straight.
    hand: { base: 'draft', wobble: 'calm' },
    general: { corners: 'soft', shadow: false },
    connectors: { colour: 'plain' },
    schemes: {
      dark: scheme(
        { canvas: '#1d4a35', grid: '#245740', text: '#f6f1dc', textMuted: '#bccbab', edge: '#e6e1c8', edgeText: '#f1ecd6', edgeLabelBg: '#163c2b', codeBg: '#173e2c', codeBorder: '#32694c' },
        {
          neutral: ['#143526', '#ebe6cc', '#f8f4e2', '#c3d1ac'],
          teal: ['#0e3a3d', '#74d9cb', '#defaf4', '#96e3d6'],
          blue: ['#16334f', '#8cc1f2', '#e3f0ff', '#a9d0f6'],
          violet: ['#34284f', '#c4a9f3', '#f0e8ff', '#d2bdf6'],
          amber: ['#3f300c', '#f0c64a', '#fff4d2', '#f4d777'],
          rose: ['#511d24', '#f68d8f', '#ffe6e2', '#f8aaa5'],
          green: ['#24390b', '#d8f03c', '#f6fcd2', '#e3f477'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      // A court plan: baselines top and bottom with their centre marks, the tramlines down each
      // side, and the net crossing only the alleys between its two brass posts. The middle of the
      // court is left clear for the name.
      if (kind === 'generic')
        return (
          court(k) +
          path('M22 17H326M22 115H326M22 17V115M37 17V115M311 17V115M326 17V115M174 17V25M174 115V107', ink(k.C, 3)) +
          path('M13 66H37M311 66H335', ink(CHALK, 3.5)) +
          circle(12, 66, 5, paint(BRASS, k.L, 2.5)) +
          circle(336, 66, 5, paint(BRASS, k.L, 2.5)) +
          ball(318.5, 100, 5.5)
        );
      // An API is the same court with a net-post socket let into its left edge: where others hook
      // on. Its lines stop short of the bottom-right corner, where the app writes "API".
      return (
        court(k) +
        path('M22 17H326M22 115H284M22 17V44M22 88V115M37 17V115M311 17V86M326 17V86M174 17V25M174 115V107', ink(k.C, 3)) +
        path('M311 66H335', ink(CHALK, 3.5)) +
        circle(336, 66, 5, paint(BRASS, k.L, 2.5)) +
        rect(8, 45, 22, 42, 7, paint(NET, k.L, 4)) +
        circle(19, 66, 7, ink(BRASS, 4)) +
        path('M27 66H37', ink(CHALK, 3.5))
      );
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A ball machine: a hopper of balls on a wheeled box, firing them out one after another.
        case 'worker':
          return (
            ground(52, 99, 50) +
            ball(24, 15, 9) +
            ball(45, 14, 9) +
            ball(34, 11, 9) +
            path('M66 54L96 26L108 38L80 64Z', chip(k, 4.5)) +
            shade('M102 32L108 38L80 64L74 58Z', 0.26) +
            path('M10 22H58L52 46H16Z', body(k, 4.5)) +
            rect(8, 44, 78, 42, 9, body(k)) +
            shade('M70 46H84V76Q84 84 76 84H12Q30 80 62 80Q70 80 70 72Z', 0.36) +
            glint('M16 50H60', 3, 0.6) +
            circle(30, 65, 8.5, paint(BRASS, k.L, 3)) +
            path('M30 65L35 60', ink(NET, 3)) +
            path('M48 60H68M48 70H68', ink(k.L, M)) +
            circle(26, 90, 9, paint(NET, k.L, 4)) +
            circle(68, 90, 9, paint(NET, k.L, 4)) +
            path('M100 20L106 14M110 30L116 24', ink(CHALK, 3, 0.7)) +
            ball(120, 12, 10)
          );
        // The pavilion on the far side of the net: somebody else's club, seen from your own court.
        case 'external':
          return (
            path('M68 16V3', ink(k.L, M)) +
            path('M68 2L88 7.5L68 13Z', flat(BERRY)) +
            rect(22, 44, 92, 36, 0, body(k, 4.5)) +
            shade('M70 46H112V78H70Z', 0.3) +
            rect(60, 54, 16, 26, 2, flat(NET)) +
            path('M34 46V78M48 46V78M88 46V78M102 46V78', ink(k.L, 4)) +
            path('M10 46L68 14L126 46Z', chip(k)) +
            shade('M68 14L126 46H68Z', 0.24) +
            rect(4, 80, 128, 21, 0, flat(NET, 0.62)) +
            path('M16 82V100M30 82V100M44 82V100M58 82V100M72 82V100M86 82V100M100 82V100M114 82V100M6 91H130', ink(k.L, 1.8, 0.75)) +
            path('M4 80H132', ink(CHALK, 5)) +
            path('M4 76V102M132 76V102', ink(WOOD, 5))
          );
        // A stopwatch, the time played marked off in red.
        case 'scheduler':
          return (
            ground(68, 100, 34) +
            path('M97 27L106 18', ink(k.L, 7)) +
            path('M68 12V20', ink(k.L, 7)) +
            rect(58, 2, 20, 11, 3.5, paint(BRASS, k.L, 3.5)) +
            circle(68, 58, 39, body(k, 5.5)) +
            roundShade(68, 58, 33.5, 6, 0.4) +
            roundGlint(68, 58, 34, 3) +
            circle(68, 58, 27.5, flat(k.C)) +
            path('M68 58V33.5A24.5 24.5 0 0 1 89.2 70.2Z', flat(BERRY)) +
            path('M68 34V39M68 82V77M44 58H49M92 58H87', ink(NET, 3.5)) +
            path('M68 58V37M68 58L86 68.5', ink(NET, 4.5)) +
            circle(68, 58, 5, flat(BRASS))
          );
        // The gate in the court fence: the only way onto the grass.
        case 'gateway':
          return (
            ground(68, 99, 60) +
            rect(4, 36, 38, 58, 3, body(k, 4)) +
            rect(94, 36, 38, 58, 3, body(k, 4)) +
            path('M6 52L20 38M6 70L38 38M8 86L40 54M22 92L40 74M130 52L116 38M130 70L98 38M128 86L96 54M114 92L96 74', ink(k.L, 2, 0.7)) +
            shade('M112 38H130V92H96L112 76Z', 0.3) +
            poly('46,98 90,98 80,64 56,64', flat(CHALK, 0.3)) +
            path('M58 82L68 71L78 82', ink(k.L, 5)) +
            rect(38, 22, 11, 76, 2, paint(WOOD, k.L, M)) +
            rect(87, 22, 11, 76, 2, paint(WOOD, k.L, M)) +
            shade('M44 24H47V96H44ZM93 24H96V96H93Z', 0.3) +
            path('M32 26Q68 -8 104 26L97 33Q68 5 39 33Z', chip(k, 4.5)) +
            shade('M68 9Q88 10 104 26L97 33Q84 20 68 19Z', 0.24) +
            circle(68, 8, 6, paint(BRASS, k.L, 3)) +
            ball(68, 92, 6)
          );
        // One serve, three places it can land: the racket sends each ball to a different target.
        case 'load-balancer':
          return (
            path('M26 70V98', ink(WOOD, 8)) +
            path('M26 82V98', ink(k.C, 8)) +
            path('M46 44Q84 6 110 14M46 44Q84 40 114 50M46 44Q84 84 110 86', ink(k.L, 4.5)) +
            ellipse(26, 44, 21, 27, flat(k.F)) +
            path(strings(26, 44, 21, 27, 4, 5), ink(k.C, 1.8, 0.85)) +
            ellipse(26, 44, 21, 27, ink(k.L, 5.5)) +
            path(arc(26, 44, 24, -20, 100), ink(NET, 3, 0.35)) +
            poly('46,34 50,41 58,44 50,47 46,54 43,47 36,44 43,41', flat(CHALK)) +
            ball(118, 14, 10) +
            ball(124, 51, 10) +
            ball(118, 88, 10)
          );
        // A ball kid: takes the ball from one side and hands it on to the other.
        case 'proxy':
          return (
            ground(68, 99, 40) +
            path('M32 30Q68 0 104 30', ink(CHALK, 3, 0.65)) +
            path('M95 20L105 30L92 33', ink(CHALK, 3, 0.65)) +
            path('M48 74L24 54M88 74L112 54', ink(k.L, 11)) +
            path('M48 74L24 54M88 74L112 54', ink(k.C, 5.5)) +
            path('M36 98Q36 62 68 62Q100 62 100 98Z', chip(k)) +
            shade('M70 62Q100 62 100 98H78Q86 78 70 62Z', 0.24) +
            path('M58 63L68 74L78 63Z', paint(k.F, k.L, 3)) +
            circle(68, 44, 14.5, chip(k)) +
            path('M53 41Q53 26 68 26Q83 26 83 41Z', paint(BERRY, k.L, 3)) +
            path('M82 40H96', ink(k.L, 5)) +
            ball(18, 47, 11) +
            ball(118, 47, 11)
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // A can of balls: three, stacked, under a pull-off lid.
        case 'generic':
          return (
            ground(73, 103, 38, 4) +
            rect(41, 12, 58, 89, 9, flat(k.F)) +
            ball(70, 37, 13.5) +
            ball(70, 62, 13.5) +
            ball(70, 87, 12) +
            shade('M86 20H97V92Q97 99 90 99H82Q86 96 86 90Z', 0.4) +
            glint('M48.5 30V84', 2.5, 0.5) +
            rect(41, 12, 58, 89, 9, ink(k.L, W)) +
            rect(36, 5, 68, 16, 6, chip(k, 4.5)) +
            shade('M78 7H98Q102 7 102 11V15Q102 19 98 19H72Z', 0.24) +
            path('M84 13H110', ink(BRASS, 4)) +
            circle(113, 13, 5, ink(BRASS, 3.5))
          );
        // The scoreboard: a name plate to each row, a tile to each set, the ball beside who serves.
        case 'sql':
          return (
            ground(70, 104, 54, 3) +
            path('M28 88V103M112 88V103', ink(k.L, 6)) +
            rect(7, 7, 126, 82, 6, flat(k.F)) +
            path(band(7, 7, 126, 20, 6), flat(k.C)) +
            shade('M120 9H131V87H120Z', 0.3) +
            path('M7 27H133M7 48H133M7 69H133M58 27V89', ink(k.L, M)) +
            path(boxes([[15, 33, 30, 9], [15, 54, 30, 9], [15, 75, 22, 9]]), flat(k.C)) +
            path(boxes([[65, 32, 12, 11], [83, 32, 12, 11], [65, 53, 12, 11], [83, 53, 12, 11], [101, 53, 12, 11], [65, 74, 12, 11]]), flat(CHALK)) +
            path(boxes([[101, 32, 12, 11]]), flat(BALL)) +
            path('M16 17H52', ink(NET, M, 0.6)) +
            rect(7, 7, 126, 82, 6, ink(k.L, W)) +
            circle(50, 37.5, 4.5, flat(BALL))
          );
        // A kit bag, half zipped: a racket, a bottle and a loose ball, whatever went in.
        case 'nosql':
          return (
            ground(70, 103, 58, 4) +
            path('M100 50L108 38', ink(WOOD, 7)) +
            group('rotate(24 110 24)', head(110, 20, 15, 19, 3, 4, WOOD, 4.5)) +
            rect(26, 14, 18, 36, 5, chip(k, 4)) +
            rect(29, 6, 12, 9, 2.5, flat(BERRY)) +
            ball(66, 36, 12) +
            path('M12 54Q12 42 24 42H116Q128 42 128 54V88Q128 100 116 100H24Q12 100 12 88Z', body(k)) +
            shade('M104 44H116Q126 44 126 54V88Q126 98 116 98H24Q60 96 92 94Q104 92 104 80Z', 0.38) +
            glint('M22 48H84', 3, 0.55) +
            path('M12 60H128', ink(k.L, M)) +
            path('M38 60Q38 78 52 78H88Q102 78 102 60', ink(k.C, 5)) +
            rect(60, 54, 20, 12, 3, paint(BRASS, k.L, 3)) +
            path('M24 88H116', ink(k.C, 3))
          );
        // A ball caught on the strings and gone again in a flash: quick, and not for keeping.
        case 'cache':
          return (
            path('M70 94V104', ink(WOOD, 10)) +
            path('M48 84L70 98L92 84', ink(k.L, 6.5)) +
            ellipse(70, 47, 49, 42, flat(k.F)) +
            path(strings(70, 47, 49, 42, 6, 5), ink(k.C, 2, 0.75)) +
            ellipse(70, 47, 49, 42, ink(k.L, 6.5)) +
            path(arc(70, 47, 45, -20, 110), ink(NET, 4, 0.4)) +
            path('M30 44L24 40M29 54H21M31 64L25 69', ink(CHALK, 3.5, 0.8)) +
            ball(54, 52, 15) +
            path('M100 12L74 50H89L80 86L114 42H97L106 12Z', paint(BRASS, NET, 3))
          );
        // The locker room: a row of doors, each with its own things behind it.
        case 'file-system':
          return (
            ground(70, 104, 60, 3) +
            path('M20 96V103M120 96V103', ink(k.L, 6)) +
            rect(8, 6, 124, 91, 6, flat(k.F)) +
            path(band(8, 6, 124, 13, 6), flat(k.C)) +
            shade('M94 21H130V95H94Z', 0.3) +
            path('M8 19H132M49 19V97M91 19V97', ink(k.L, 4)) +
            path('M17 31H40M17 39H40M59 31H82M59 39H82M100 31H123M100 39H123', ink(k.L, 3)) +
            path(boxes([[19, 50, 20, 10], [61, 50, 20, 10], [102, 50, 20, 10]]), flat(CHALK, 0.9)) +
            rect(8, 6, 124, 91, 6, ink(k.L, W)) +
            circle(41, 74, 4.5, flat(BRASS)) +
            circle(83, 74, 4.5, flat(BRASS)) +
            circle(124, 74, 4.5, flat(BRASS)) +
            poly('79,77 87,77 83,92', flat(BERRY))
          );
        // The ball hopper: a wire basket heaped with balls, any number, kept loose.
        case 'object-storage':
          return (
            ground(70, 104, 46, 3) +
            path('M26 46V16Q26 7 35 7H105Q114 7 114 16V46', ink(k.L, 4.5)) +
            ball(46, 38, 13) +
            ball(94, 38, 13) +
            ball(70, 31, 14.5) +
            path('M17 46H123L110 100H30Z', flat(k.F)) +
            ball(50, 68, 11) +
            ball(74, 76, 11) +
            ball(94, 64, 10) +
            shade('M98 48H121L109 98H88Z', 0.36) +
            path('M44 48L49 98M70 48V98M96 48L91 98M21 64H119M26 82H114', ink(k.L, 3)) +
            path('M17 46H123L110 100H30Z', ink(k.L, W)) +
            path('M13 46H127', ink(k.L, 7)) +
            glint('M20 44.5H84', 2, 0.6)
          );
        // The line call: a glass held over the chalk, and the mark the ball left on it.
        case 'search-index':
          return (
            path('M4 86H136', ink(CHALK, 8, 0.9)) +
            ellipse(112, 77, 13, 5.5, flat(NET, 0.6)) +
            path('M82 72L119 100', ink(WOOD, 11)) +
            path('M82 72L93 80.5', ink(BRASS, 11)) +
            circle(56, 46, 37, flat(k.F)) +
            path('M32 64H80', ink(CHALK, 13)) +
            ellipse(60, 48, 19, 9.5, flat(BALL)) +
            path(arc(56, 46, 29, -25, 100), ink(NET, 6, 0.3)) +
            path('M32 36Q38 22 54 19', ink(CHALK, 4, 0.75)) +
            circle(56, 46, 37, ink(k.L, 7))
          );
        // The draw sheet on its clipboard: four names, two matches, one winner.
        case 'table':
          return (
            rect(17, 15, 114, 90, 5, flat(NET, 0.42)) +
            rect(11, 9, 114, 90, 5, body(k)) +
            path(boxes([[19, 25, 30, 10], [19, 41, 30, 10], [19, 62, 30, 10], [19, 78, 30, 10]]), flat(k.C)) +
            path('M49 30H62V46H49M49 67H62V83H49M62 38H82V75H62M82 56.5H94', ink(k.L, M)) +
            rect(94, 49, 24, 15, 3, flat(BALL)) +
            path('M100 56.5H112', ink(NET, 3, 0.7)) +
            rect(50, 2, 36, 14, 4, paint(BRASS, k.L, M)) +
            shade('M70 4H82Q84 4 84 6V12Q84 14 82 14H66Z', 0.25)
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // Balls lined up along the baseline, waiting; the one at the front is already rolling off.
        case 'queue': {
          const waiting = [32, 68, 104, 140, 176].map((x) => ellipse(x + 3, 46, 12, 3, flat(NET, 0.45)) + ball(x, 32, 13)).join('');
          return (
            rect(4, 5, 268, 54, 10, flat(k.F)) +
            shade('M6 50H270V51Q270 57 262 57H14Q6 57 6 51Z', 0.36) +
            path('M12 47H264', ink(k.C, 4)) +
            waiting +
            ellipse(243, 46, 12, 3, flat(NET, 0.45)) +
            path('M204 24H218M200 33H216M206 42H218', ink(CHALK, 3, 0.7)) +
            ball(240, 32, 13) +
            rect(4, 5, 268, 54, 10, ink(k.L, W))
          );
        }
        // A loudhailer: one call, and everybody around the court hears it.
        case 'topic':
          return (
            rect(44, 38, 15, 23, 4, body(k, 4)) +
            path('M32 20L92 4V60L32 44Z', body(k)) +
            shade('M32 33L92 36V60L32 44Z', 0.36) +
            glint('M40 23L84 11.5', 3, 0.6) +
            rect(12, 19, 21, 26, 5, chip(k, 4.5)) +
            rect(88, 2, 10, 60, 5, paint(BRASS, k.L, M)) +
            path('M116 16Q130 32 116 48M138 9Q158 32 138 55M160 3Q186 32 160 61', ink(k.L, 5)) +
            ball(212, 13, 10) +
            ball(252, 32, 10) +
            ball(212, 51, 10)
          );
        // A rally: the ball's flight over the net, and where it has just been.
        case 'stream': {
          const flight: [number, number][] = [[18, 36], [80, 3], [190, 3], [256, 26]];
          const ghosts = [0.3, 0.52, 0.74].map((t, i) => circle(...bez(flight, t), 7.5 + i, flat(BALL, 0.3 + i * 0.2))).join('');
          return (
            rect(4, 43, 268, 17, 7, body(k, 4.5)) +
            shade('M6 53H270Q270 58 264 58H12Q6 58 6 53Z', 0.36) +
            path('M14 50H262', ink(k.C, 3)) +
            rect(122, 24, 32, 20, 0, flat(NET, 0.6)) +
            path('M130 26V43M138 26V43M146 26V43M123 34.5H153', ink(k.L, 1.8, 0.75)) +
            path('M120 24H156', ink(CHALK, 4.5)) +
            path('M120 21V44M156 21V44', ink(WOOD, 5)) +
            path('M18 36C80 3 190 3 256 26', ink(k.L, 4)) +
            ghosts +
            ball(256, 26, 12)
          );
        }
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A player in whites, the racket over one shoulder.
        case 'human':
          return path('M88 54L98 36', ink(WOOD, 6)) + group('rotate(30 101 22)', head(101, 19, 12.5, 16, 3, 4, WOOD, 4)) + player(k);
        // A doubles pair and one more: the player, and a partner at each shoulder.
        case 'group':
          return partner(k, 24, BALL) + partner(k, 96, BRASS) + group('translate(6 7.8) scale(0.9)', player(k));
        // The umpire: a blazer and tie, and a straw boater. Not one of the players.
        case 'thirdParty':
          return (
            path('M20 78Q22 49 60 49Q98 49 100 78Z', body(k)) +
            shade('M64 49Q98 49 100 78H76Q84 62 64 49Z', 0.4) +
            path('M48 50L60 76L72 50Z', flat(CHALK)) +
            path('M57 53H63L62.5 68L60 73L57.5 68Z', flat(BERRY)) +
            path('M47 49L60 78L40 62ZM73 49L60 78L80 62Z', chip(k, 3)) +
            rect(80, 64, 9, 9, 2, flat(BRASS)) +
            circle(60, 35, 13, chip(k)) +
            rect(45, 8, 30, 17, 3, paint(CHALK, k.L, 3)) +
            rect(46.5, 17, 27, 6, 0, flat(NET)) +
            ellipse(60, 25, 27, 5, paint(CHALK, k.L, 3)) +
            path('M70 24Q80 26 85 25', ink(NET, 2.5, 0.3))
          );
        // The umpire's chair: the high seat the whole match is run from.
        case 'system':
          return (
            ground(60, 80, 42, 2.5) +
            path('M45 38L27 79M75 38L93 79', ink(k.L, 5.5)) +
            path('M40.6 50H79.4M36 61H84M31 72H89', ink(k.L, M)) +
            rect(44, 3, 32, 25, 5, chip(k, 4.5)) +
            shade('M64 5H71Q74 5 74 8V26H60Z', 0.24) +
            path('M51 11H62M51 18H58', ink(NET, 3, 0.45)) +
            path('M36 30V22M84 30V22', ink(k.L, 4.5)) +
            rect(34, 27, 52, 13, 4, body(k)) +
            shade('M66 29H84V38H62Z', 0.4) +
            circle(36, 20, 4, flat(BRASS)) +
            circle(84, 20, 4, flat(BRASS)) +
            rect(92, 30, 20, 26, 3, body(k, 4)) +
            path('M97 38H107M97 45H107', ink(k.C, 3)) +
            circle(102, 51, 2.5, flat(BALL)) +
            path('M86 34H92', ink(k.L, 4))
          );
        // A wristwatch: something small you wear to the court.
        case 'device':
          return (
            rect(49, 2, 22, 78, 6, chip(k, 4)) +
            shade('M61 4H69V78H61Z', 0.22) +
            path('M56 9H64M56 73H64', ink(NET, 3, 0.45)) +
            rect(77, 36.5, 6, 9, 2, flat(BRASS)) +
            circle(60, 41, 17.5, body(k)) +
            roundShade(60, 41, 14.5, 3, 0.4) +
            circle(60, 41, 12, flat(CHALK)) +
            path('M60 41V33M60 41L66.5 45', ink(NET, 3.5)) +
            circle(60, 41, 2.6, flat(BERRY))
          );
        // A small round helper with a ball's seams, an aerial, and a flag up to call the line.
        case 'agent':
          return (
            ground(60, 80, 28, 2.5) +
            path('M60 18V7', ink(k.L, 4)) +
            circle(60, 6, 4.5, flat(BRASS)) +
            path('M48 72V78M72 72V78', ink(k.L, 7)) +
            path('M34 54L22 64', ink(k.L, 5.5)) +
            path('M86 50L104 34', ink(k.L, 5.5)) +
            path('M104 34V14', ink(k.L, 3)) +
            path('M104 14L118 19L104 25Z', flat(BERRY)) +
            circle(60, 47, 29, body(k)) +
            path('M38 30Q56 47 40 66M82 30Q64 47 80 66', ink(k.C, 4)) +
            roundShade(60, 47, 24.5, 5, 0.4) +
            roundGlint(60, 47, 24, 3) +
            rect(41, 37, 38, 17, 8.5, flat(NET)) +
            circle(51, 45.5, 4.5, flat(BALL)) +
            circle(69, 45.5, 4.5, flat(BALL))
          );
      }
    },

    // A racket press: a bar of the shape's colour between two varnished wooden ends, each screwed
    // down with brass, a chalk rule above and below, the middle left clear.
    componentCard: (k) =>
      rect(4, 4, 292, 100, 10, flat(k.F)) +
      path('M14 4H28V104H14Q4 104 4 94V14Q4 4 14 4ZM286 4H272V104H286Q296 104 296 94V14Q296 4 286 4Z', flat(WOOD)) +
      shade('M6 91H294V94Q294 102 286 102H14Q6 102 6 94Z', 0.36) +
      shade('M22 6H28V102H22ZM290 8Q294 10 294 14V94Q294 100 290 101Z', 0.3) +
      glint('M34 9.5H266', 2.5, 0.45) +
      path('M42 20H258M42 88H258', ink(k.C, 2.8)) +
      path('M28 4V104M272 4V104', ink(k.L, 3)) +
      rect(4, 4, 292, 100, 10, ink(k.L, W)) +
      circle(15.5, 24, 4.5, paint(BRASS, NET, 2)) +
      circle(15.5, 84, 4.5, paint(BRASS, NET, 2)) +
      circle(284.5, 24, 4.5, paint(BRASS, NET, 2)) +
      circle(284.5, 84, 4.5, paint(BRASS, NET, 2)),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A stringing square: mains and crosses woven over and under, one self-contained patch.
        case 'module': {
          const xs = [35, 52, 68, 85];
          const ys = [31, 45, 59, 73];
          const over: [number, number, number, number][] = [];
          xs.forEach((x, i) => ys.forEach((y, j) => (i + j) % 2 === 0 && over.push([x - 5, y - 5, 10, 10])));
          return (
            ground(62, 100, 52) +
            rect(10, 6, 100, 92, 12, body(k)) +
            shade('M98 10Q108 12 108 18V86Q108 96 98 96H22Q14 96 12 88H92Q98 88 98 82Z', 0.4) +
            rect(23, 19, 74, 66, 5, flat(NET, 0.5)) +
            path(xs.map((x) => `M${x} 19V85`).join('') + ys.map((y) => `M23 ${y}H97`).join(''), ink(k.L, 4)) +
            path(boxes(over), flat(k.C)) +
            rect(23, 19, 74, 66, 5, ink(k.L, M)) +
            glint('M20 12H84', 2.5, 0.55) +
            circle(17, 13, 3, flat(BRASS)) +
            circle(103, 13, 3, flat(BRASS)) +
            circle(17, 91, 3, flat(BRASS)) +
            circle(103, 91, 3, flat(BRASS))
          );
        }
        // The handle end of a racket, wound in overgrip with the tail of the tape still loose: the
        // part that fits it to the hand.
        case 'adapter':
          return (
            ground(60, 101, 30) +
            path('M38 8V2M49 13V2M60 15V2M71 13V2M82 8V2', ink(CHALK, 2.4, 0.85)) +
            path('M22 2Q60 30 98 2', ink(WOOD, 7)) +
            path('M54 46L20 2M66 46L100 2', ink(WOOD, 7.5)) +
            rect(51, 40, 18, 16, 2, paint(WOOD, k.L, M)) +
            path('M76 62Q94 52 97 68Q99 80 113 74', ink(BERRY, 7)) +
            rect(44, 52, 32, 40, 4, flat(k.F)) +
            path('M44 63L76 55V64L44 72ZM44 79L76 71V80L44 88Z', flat(k.C)) +
            shade('M67 54H74V90H67Z', 0.34) +
            glint('M49.5 57V86', 2.5, 0.5) +
            rect(44, 52, 32, 40, 4, ink(k.L, W)) +
            rect(38, 88, 44, 13, 5, chip(k, 4.5)) +
            shade('M64 90H78Q80 90 80 93V96Q80 99 78 99H60Z', 0.26)
          );
        // A racket head, face on: an open ring you put the ball through, strung fine so it stays clear.
        case 'port':
          return (
            rect(53, 88, 14, 15, 2.5, paint(WOOD, k.L, M)) +
            path('M38 76L60 92L82 76', ink(k.L, 7)) +
            ellipse(60, 44, 40, 38, flat(k.F)) +
            path(strings(60, 44, 40, 38, 3, 3), ink(k.C, 2.2, 0.6)) +
            ellipse(60, 44, 40, 38, ink(k.L, 12)) +
            ellipse(60, 44, 40, 38, ink(k.C, 5.5)) +
            path(arc(60, 44, 39, -20, 105), ink(NET, 6, 0.3)) +
            path('M33 16Q46 5 60 5Q74 5 87 16', ink(BRASS, 5.5)) +
            glint('M24 36Q27 24 35 18', 3, 0.75)
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A scorecard: a ruled sheet, a few games already marked, and the pencil.
        case 'file':
          return (
            rect(12, 10, 64, 86, 5, flat(NET, 0.42)) +
            rect(7, 5, 64, 86, 5, flat(k.F)) +
            path(band(7, 5, 64, 17, 5), flat(k.C)) +
            path('M7 22H71M7 39H71M7 56H71M7 73H71M31 22V91', ink(k.L, 3)) +
            path(boxes([[38, 27, 8, 7], [50, 27, 8, 7], [38, 44, 8, 7], [38, 61, 8, 7], [50, 61, 8, 7]]), flat(CHALK)) +
            path('M14 13.5H36', ink(NET, 3, 0.6)) +
            rect(7, 5, 64, 86, 5, ink(k.L, W)) +
            path('M80 50L68 84', ink(BRASS, 7)) +
            path('M68 84L65.5 93L72.5 86Z', paint(CHALK, CHALK, 1.5)) +
            path('M80 50L78 55.5', ink(BERRY, 7))
          );
        // A stringing gauge and its slider: how tight things are set.
        case 'config':
          return (
            circle(43, 37, 31, body(k)) +
            roundShade(43, 37, 26, 5, 0.4) +
            circle(43, 37, 20, flat(k.C)) +
            path('M43 37L23.3 33.5A20 20 0 0 1 36.2 18.2Z', flat(BALL)) +
            path('M43 37L57.1 22.9A20 20 0 0 1 62.7 33.5Z', flat(BERRY)) +
            path('M43 37L52 23', ink(NET, 4.5)) +
            circle(43, 37, 5, flat(BRASS)) +
            roundGlint(43, 37, 26.5, 3) +
            path('M10 86H76', ink(k.L, 5.5)) +
            rect(46, 77, 13, 18, 4.5, chip(k, M))
          );
        // The padlock off a locker.
        case 'secret':
          return (
            ground(44, 96, 34, 3) +
            path('M26 48V30Q26 11 43 11Q60 11 60 30V48', ink(k.L, 10)) +
            path('M26 44V30Q26 11 43 11Q60 11 60 30V44', ink(k.F, 3.5)) +
            rect(11, 44, 64, 50, 9, body(k)) +
            shade('M60 46H66Q73 46 73 53V85Q73 92 66 92H20Q52 90 56 88Q60 86 60 80Z', 0.4) +
            glint('M19 50H52', 2.5, 0.55) +
            circle(43, 68, 15, paint(BRASS, k.L, 3)) +
            circle(43, 64, 5.5, flat(NET)) +
            path('M43 66V76', ink(NET, 5))
          );
        // The club cup: a plain two-handled trophy on its plinth.
        case 'certificate':
          return (
            ground(43, 96, 30, 3) +
            path('M21 20Q3 20 7 36Q11 49 27 47M65 20Q83 20 79 36Q75 49 59 47', ink(k.L, 5)) +
            path('M43 56V76', ink(k.L, 9)) +
            path('M17 8H69Q69 56 43 60Q17 56 17 8Z', chip(k)) +
            shade('M50 8H69Q69 56 43 60Q58 46 50 8Z', 0.24) +
            path('M19 26Q43 34 67 26', ink(BRASS, 5)) +
            glint('M26 14Q26 34 31 44', 3, 0.8) +
            path('M14 8H72', ink(k.L, 6)) +
            rect(21, 74, 44, 20, 4, body(k)) +
            shade('M52 76H63V92H48Z', 0.4) +
            rect(31, 80, 18, 8, 2, flat(BRASS))
          );
      }
    },

    // The "T" where the service lines meet, set in a chalk ring: four marks outside it, the middle
    // left empty, and a ball that has just landed on the line.
    junction: (k) =>
      path('M50 3V15M50 85V97M3 50H15M85 50H97', ink(k.L, 6.5)) +
      circle(50, 50, 33, body(k)) +
      roundShade(50, 50, 28, 5, 0.4) +
      roundGlint(50, 50, 28.5, 3) +
      circle(50, 50, 23.5, ink(k.C, 2.6)) +
      ball(79, 21, 8),
  },

  // The lawn: mown in stripes of uneven width, a baseline and the corner of a service box ruled
  // across it in chalk, a few worn patches where the players stand, and one ball nobody fetched.
  backdrop: {
    tile: [TW, TH],
    draw: () => {
      const tufts: [number, number][] = [
        [44, 62], [118, 196], [262, 48], [338, 150], [452, 232], [508, 108], [92, 372], [286, 348], [404, 392], [182, 254], [528, 318], [24, 236], [366, 30], [228, 150],
      ];
      return (
        path(boxes([[0, 0, 80, TH], [310, 0, 88, TH]]), flat('#21513a')) +
        path(boxes([[150, 0, 86, TH], [470, 0, 90, TH]]), flat('#1a4531')) +
        ellipse(126, 316, 30, 7, flat('#173f2d', 0.5)) +
        ellipse(396, 204, 16, 5, flat('#173f2d', 0.42)) +
        ellipse(486, 66, 20, 5, flat('#173f2d', 0.38)) +
        path('M0 300H560M200 300V420M200 0V110M200 110H560M0 110H60M60 101V119', ink(CHALK, 6, 0.075)) +
        path(tufts.map(([x, y]) => `M${x} ${y}l-2 -6M${x + 4} ${y}l1 -7M${x + 8} ${y}l3 -5`).join(''), ink('#2c6248', 1.3, 0.8)) +
        circle(432, 352, 5, flat(BALL, 0.11))
      );
    },
  },
};

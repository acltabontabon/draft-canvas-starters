import { circle, ellipse, group, paint, path, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Match Point: a sunlit court, printed like a modern sports-club poster. The page is a washed-out
 * lemon-lime, the colour of a tennis ball left in the sun, and everything on it is big, flat and
 * heavily outlined: a service is a white board under a band of net tape, a worker a ball machine,
 * a gateway the gate in the court fence; a data store is a can of balls, a scoreboard, a kit bag,
 * a row of lockers; a queue is balls waiting in a row, a topic a loudhailer, a stream a rally over
 * the net. Each drawing is one strong silhouette in two or three blocks: the shape's own fill, a
 * block of its accent, and white, with a single hard shade on the lower right (the sun is top
 * left). Four inks only: ball yellow-green (always outlined, so it reads on the pale page), bottle
 * green, white and clay red, with varnished wood kept for racket handles and the racket press.
 * The sport itself, and nobody's tournament. Always light: it is a summer afternoon.
 */
const W = 6; // the outline of an object
const M = 5; // a mark inside it

// The poster's inks: they stay as they are whatever colour a shape is given.
const BALL = '#cfe82f';
const INK = '#173f2d';
const WHITE = '#ffffff';
const CLAY = '#d9583b';
const WOOD = '#b9783f'; // racket handles and the racket press only

const n = (value: number) => Math.round(value * 10) / 10;
const op = (value: number) => (value < 1 ? ` opacity="${value}"` : '');
const flat = (colour: string, opacity = 1) => `fill="${colour}" stroke="none"${op(opacity)}`;
const ink = (colour: string, w = M, opacity = 1) => `fill="none" stroke="${colour}" stroke-width="${w}"${op(opacity)}`;
const body = (k: Kit, w = W) => paint(k.F, k.L, w);
const block = (k: Kit, w = W) => paint(k.C, k.L, w);

/** The one hard shade: the shape's own line colour, thinned, over the side away from the sun. */
const shade = (k: Kit, d: string, opacity = 0.2) => path(d, flat(k.L, opacity));
/** The lit edge: a bar of white. */
const glint = (d: string, w = 4, opacity = 0.85) => path(d, ink(WHITE, w, opacity));
/** The shadow an object stands on. */
const ground = (k: Kit, cx: number, cy: number, rx: number, ry = 3.5) => ellipse(cx, cy, rx, ry, flat(k.L, 0.2));

/** A band with only its top corners rounded: the header of a board or a sheet. */
const band = (x: number, y: number, w: number, h: number, r: number) => `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;

/** Several boxes as one painted part. */
const boxes = (list: [number, number, number, number][]) => list.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}Z`).join('');

/** A ball: yellow-green, outlined in bottle green, one white seam. */
const ball = (cx: number, cy: number, r: number) =>
  circle(cx, cy, r, paint(BALL, INK, n(Math.max(3.5, r * 0.3)))) +
  path(`M${n(cx - r * 0.2)} ${n(cy - r * 0.72)}Q${n(cx + r * 0.62)} ${n(cy)} ${n(cx - r * 0.2)} ${n(cy + r * 0.72)}`, ink(WHITE, n(Math.max(2.8, r * 0.24))));

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

/** A racket head: a white face, three strings each way, a heavy frame. */
const racket = (k: Kit, cx: number, cy: number, rx: number, ry: number, w = W) =>
  ellipse(cx, cy, rx, ry, flat(WHITE)) + path(strings(cx, cy, rx, ry, 3, 3), ink(k.C, 3)) + ellipse(cx, cy, rx, ry, ink(k.L, w));

/** A player, head and shoulders: a shirt in the accent, a white collar, a clay headband. 120 by 82. */
const player = (k: Kit) =>
  path('M16 79Q16 47 60 47Q104 47 104 79Z', block(k)) +
  path('M64 47Q104 47 104 79H80Q88 62 64 47Z', flat(INK, 0.2)) +
  path('M46 48L60 64L74 48Z', paint(WHITE, k.L, 4)) +
  circle(60, 27, 17, body(k)) +
  path('M44.5 19Q48 10 60 10Q72 10 75.5 19Q60 13 44.5 19Z', flat(k.L)) +
  path('M43.5 22.5Q60 15 76.5 22.5', ink(CLAY, 6));

/** A partner standing behind: smaller and all in the fill, so the one in front leads. */
const partner = (k: Kit, cx: number) =>
  path(`M${cx - 22} 79Q${cx - 22} 54 ${cx} 54Q${cx + 22} 54 ${cx + 22} 79Z`, body(k, 5)) +
  circle(cx, 39, 13, body(k, 5)) +
  path(`M${cx - 12.5} 34Q${cx - 10} 26 ${cx} 26Q${cx + 10} 26 ${cx + 12.5} 34Q${cx} 29 ${cx - 12.5} 34Z`, flat(k.L));

/** A board: a white field under a band of net tape, heavily outlined. */
const board = (k: Kit) =>
  rect(4, 4, 340, 124, 14, flat(k.F)) +
  path(band(4, 4, 340, 18, 14), flat(k.C)) +
  path('M16 13H332', ink(WHITE, 3.5)) +
  shade(k, 'M7 115H341V114Q341 125 330 125H18Q7 125 7 114Z', 0.14) +
  rect(4, 4, 340, 124, 14, ink(k.L, W));

const TW = 520;
const TH = 400;

export const matchPoint: Pack = {
  id: 'match-point',
  name: 'Match Point',
  summary: 'A sunlit court as a bold club poster in lemon-lime, bottle green and clay: a ball machine, a scoreboard, a can of balls',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 100,
  style: {
    // The poster printer's line: clean, heavy and even, with rounded corners.
    hand: { base: 'clean' },
    general: { weight: 'bold', corners: 'round', shadow: false },
    connectors: { colour: 'plain' },
    schemes: {
      light: scheme(
        { canvas: '#f4f7d6', grid: '#e4eab8', text: '#173f2d', textMuted: '#4a6a52', edge: '#173f2d', edgeText: '#173f2d', edgeLabelBg: '#fcfdee', codeBg: '#edf2c6', codeBorder: '#cfdb95' },
        {
          neutral: ['#ffffff', '#173f2d', '#10281d', '#3f8259'],
          teal: ['#def5ee', '#0e6a61', '#06332f', '#1c9384'],
          blue: ['#e1eefc', '#1e5ca6', '#0c2a4f', '#3a80d0'],
          violet: ['#ece5fb', '#5a3ea6', '#2a1a57', '#7c5fcf'],
          amber: ['#fdefc0', '#8f5c08', '#40290a', '#bd7d0c'],
          rose: ['#fde2d9', '#ad381f', '#4f150a', '#d9583b'],
          green: ['#ebf6a6', '#3d6710', '#1c3306', '#6b951a'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      // A club board: a white field under a band of net tape, a ball resting on the tape.
      if (kind === 'generic') return board(k) + ball(318, 15, 10);
      // An API is the same board with a round notch bitten out of its left edge: where others
      // hook on. Its bottom right is left clear, where the app writes "API".
      return (
        board(k) +
        path('M0 46H4A20 20 0 0 1 4 86H0Z', flat(k.K)) +
        path('M4 46A20 20 0 0 1 4 86', ink(k.L, W)) +
        circle(5, 66, 7, flat(k.C))
      );
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A ball machine: a hopper on a wheeled box, its barrel up, one ball just fired.
        case 'worker':
          return (
            ground(k, 56, 100, 54) +
            path('M70 62L100 34L116 50L86 78Z', block(k)) +
            path('M12 12H82L72 44H22Z', block(k)) +
            glint('M24 21H66', 4, 0.7) +
            rect(6, 40, 88, 46, 12, body(k)) +
            shade(k, 'M72 43H82Q91 43 91 52V74Q91 83 82 83H18Q60 82 66 78Q72 74 72 66Z') +
            path('M22 56H50M22 69H40', ink(k.L, M)) +
            circle(66, 62, 8, flat(CLAY)) +
            circle(28, 90, 11, paint(k.L, k.L, 2)) +
            circle(72, 90, 11, paint(k.L, k.L, 2)) +
            circle(28, 90, 4, flat(WHITE)) +
            circle(72, 90, 4, flat(WHITE)) +
            ball(118, 18, 14)
          );
        // The pavilion on the far side of the net: somebody else's club, seen from your own court.
        case 'external':
          return (
            path('M68 16V4', ink(k.L, M)) +
            path('M68 2L90 8.5L68 15Z', paint(CLAY, k.L, 2)) +
            rect(20, 44, 96, 44, 0, body(k)) +
            shade(k, 'M72 47H113V85H72Z') +
            rect(54, 58, 28, 30, 4, flat(k.L)) +
            path('M4 46L68 12L132 46Z', block(k)) +
            path('M68 12L132 46H68Z', flat(INK, 0.2)) +
            rect(4, 84, 128, 17, 4, paint(k.L, k.L, 2)) +
            path('M10 88H126', ink(WHITE, 4.5))
          );
        // A stopwatch, the time played marked off in clay.
        case 'scheduler':
          return (
            ground(k, 68, 101, 34) +
            path('M98 28L108 18', ink(k.L, 9)) +
            path('M68 14V22', ink(k.L, 9)) +
            rect(55, 3, 26, 13, 5, block(k, 5)) +
            circle(68, 60, 38, body(k, 7)) +
            path('M68 60V30A30 30 0 0 1 94 75Z', flat(CLAY)) +
            path('M68 60V34M68 60L88 71.5', ink(k.L, 7)) +
            circle(68, 60, 6, flat(k.L))
          );
        // The gate in the court fence: the only way onto the grass, and a ball on its way through.
        case 'gateway':
          return (
            ground(k, 68, 100, 62) +
            rect(4, 40, 40, 54, 5, body(k)) +
            rect(92, 40, 40, 54, 5, body(k)) +
            path('M7 66L30 43M18 91L41 68M129 66L106 43M118 91L95 68', ink(k.C, M)) +
            rect(38, 26, 13, 70, 3, flat(k.L)) +
            rect(85, 26, 13, 70, 3, flat(k.L)) +
            path('M30 30Q68 -12 106 30L96 38Q68 6 40 38Z', block(k)) +
            path('M68 9Q90 10 106 30L96 38Q84 23 68 22Z', flat(INK, 0.2)) +
            ball(68, 78, 15)
          );
        // One ball off the racket, three places it can go.
        case 'load-balancer':
          return (
            path('M28 72V96', ink(k.L, 13)) +
            path('M28 76V95', ink(WOOD, 7)) +
            path('M62 48Q92 12 114 16M62 48H118M62 48Q92 86 114 86', ink(k.L, W)) +
            racket(k, 28, 44, 23, 29, 7) +
            circle(120, 15, 10.5, block(k, M)) +
            circle(124, 51, 10.5, block(k, M)) +
            circle(120, 88, 10.5, block(k, M)) +
            ball(64, 48, 13)
          );
        // A ball kid: the ball goes from one hand, over, to the other.
        case 'proxy':
          return (
            ground(k, 68, 101, 44) +
            path('M17 46Q68 -16 119 46', ink(k.C, 6)) +
            path('M48 82L18 52M88 82L118 52', ink(k.L, 14)) +
            path('M32 100Q32 66 68 66Q104 66 104 100Z', block(k)) +
            path('M72 66Q104 66 104 100H84Q90 80 72 66Z', flat(INK, 0.2)) +
            circle(68, 50, 16, body(k)) +
            path('M52 47Q52 32 68 32Q84 32 84 47Z', paint(CLAY, k.L, 4)) +
            path('M83 46H94', ink(k.L, W)) +
            ball(68, 16, 13)
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // A can of balls: three, stacked, under its lid.
        case 'generic':
          return (
            ground(k, 74, 104, 40) +
            rect(37, 5, 66, 98, 14, flat(k.F)) +
            shade(k, 'M86 8H91Q100 8 100 17V91Q100 100 91 100H86Z', 0.24) +
            ball(68, 39, 13) +
            ball(68, 64, 13) +
            ball(68, 88, 12) +
            path(band(37, 5, 66, 20, 14), flat(k.C)) +
            glint('M48 13H78', 4, 0.75) +
            path('M37 25H103', ink(k.L, M)) +
            rect(37, 5, 66, 98, 14, ink(k.L, W))
          );
        // The scoreboard: a name to each row, a tile to each set, the one in play lit.
        case 'sql':
          return (
            ground(k, 70, 104, 54, 3) +
            path('M30 86V102M110 86V102', ink(k.L, 8)) +
            rect(6, 6, 128, 82, 10, flat(k.F)) +
            path(band(6, 6, 128, 22, 10), flat(k.C)) +
            glint('M18 17H60', 4.5, 0.9) +
            path('M6 28H134M6 58H134', ink(k.L, M)) +
            path('M18 43H52M18 73H44', ink(k.L, 7)) +
            path(boxes([[66, 35, 17, 16], [89, 35, 17, 16], [66, 65, 17, 16], [89, 65, 17, 16]]), flat(k.C)) +
            rect(112, 35, 15, 16, 2, paint(BALL, INK, 3)) +
            rect(6, 6, 128, 82, 10, ink(k.L, W))
          );
        // A kit bag, half packed: a racket and a ball sticking out, whatever went in.
        case 'nosql':
          return (
            ground(k, 70, 104, 60, 3.5) +
            path('M100 46L106 34', ink(k.L, 12)) +
            path('M100 46L106 34', ink(WOOD, 6)) +
            group('rotate(22 110 22)', racket(k, 110, 20, 15, 19, 5.5)) +
            ball(38, 28, 15) +
            path('M48 44Q70 6 92 44', ink(k.L, 7)) +
            rect(6, 38, 128, 64, 18, flat(k.F)) +
            rect(6, 58, 128, 16, 0, flat(k.C)) +
            shade(k, 'M108 41H116Q131 41 131 56V84Q131 99 116 99H108Z', 0.24) +
            rect(6, 38, 128, 64, 18, ink(k.L, W)) +
            path('M6 58H134M6 74H134', ink(k.L, 4)) +
            rect(58, 58, 24, 16, 4, paint(WHITE, k.L, 4))
          );
        // A bolt off the strings: caught and gone again, quick, and not for keeping.
        case 'cache':
          return (
            path('M70 92V102', ink(k.L, 16)) +
            path('M70 94V102', ink(WOOD, 9)) +
            path('M46 82L70 96L94 82', ink(k.L, 8)) +
            ellipse(70, 46, 54, 41, flat(WHITE)) +
            path(strings(70, 46, 54, 41, 4, 3), ink(k.C, 3.5)) +
            ellipse(70, 46, 54, 41, ink(k.L, 8)) +
            path('M82 6L52 50H69L58 88L94 40H76L88 6Z', paint(BALL, INK, 4.5))
          );
        // The locker room: a row of doors, each with its own things behind it.
        case 'file-system':
          return (
            ground(k, 70, 104, 60, 3) +
            path('M22 94V102M118 94V102', ink(k.L, 8)) +
            rect(6, 6, 128, 90, 10, flat(k.F)) +
            rect(49, 6, 42, 90, 0, flat(k.C)) +
            shade(k, 'M91 9H124Q131 9 131 16V86Q131 93 124 93H91Z', 0.14) +
            path('M49 6V96M91 6V96', ink(k.L, M)) +
            path('M17 24H38M59 24H81M101 24H123', ink(k.L, M)) +
            path('M17 36H38M101 36H123', ink(k.L, M)) +
            path('M59 36H81', ink(WHITE, M)) +
            circle(39, 64, 5, flat(k.L)) +
            circle(81, 64, 5, flat(WHITE)) +
            circle(123, 64, 5, flat(k.L)) +
            rect(6, 6, 128, 90, 10, ink(k.L, W))
          );
        // The ball hopper: a wire basket heaped with balls, kept loose.
        case 'object-storage':
          return (
            ground(k, 70, 104, 48, 3) +
            path('M24 50V20Q24 6 38 6H102Q116 6 116 20V50', ink(k.L, W)) +
            ball(46, 38, 15) +
            ball(94, 38, 15) +
            ball(70, 28, 16) +
            path('M14 50H126L112 100H28Z', body(k)) +
            shade(k, 'M100 53H122L110 97H88Z', 0.24) +
            path('M50 52L54 98M90 52L86 98M20 74H120', ink(k.C, M)) +
            path('M14 50H126L112 100H28Z', ink(k.L, W)) +
            path('M10 50H130', ink(k.L, 9))
          );
        // The line call: a glass over the chalk, and the mark the ball left on it.
        case 'search-index':
          return (
            path('M86 76L124 100', ink(k.L, 15)) +
            path('M98 83.5L122 99', ink(k.C, 7)) +
            circle(58, 50, 44, flat(k.F)) +
            path('M24 70H92', ink(k.C, 14)) +
            ellipse(60, 49, 24, 12, paint(BALL, INK, 4.5)) +
            glint('M30 38Q37 22 54 17', 5, 1) +
            circle(58, 50, 44, ink(k.L, 9))
          );
        // The draw sheet on its clipboard: four names, two matches, one winner.
        case 'table':
          return (
            rect(8, 10, 124, 92, 10, body(k)) +
            shade(k, 'M11 90H129V89Q129 99 119 99H21Q11 99 11 89Z', 0.16) +
            path(boxes([[18, 28, 30, 12], [18, 46, 30, 12], [18, 66, 30, 12], [18, 84, 30, 10]]), flat(k.C)) +
            path('M48 34H62V52H48M48 72H62V89H48M62 43H80V80H62M80 61H94', ink(k.L, 4.5)) +
            rect(94, 50, 30, 22, 5, paint(BALL, INK, 4)) +
            rect(46, 2, 48, 18, 6, block(k, M))
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // Four balls in a rack, waiting their turn; the open end shows which way they leave.
        case 'queue':
          return (
            rect(4, 6, 268, 52, 26, flat(k.F)) +
            shade(k, 'M30 46H246Q262 46 269 34Q268 55 246 55H30Q8 55 7 34Q14 46 30 46Z', 0.2) +
            rect(4, 6, 268, 52, 26, ink(k.L, W)) +
            ball(40, 32, 17) +
            ball(84, 32, 17) +
            ball(128, 32, 17) +
            ball(172, 32, 17) +
            path('M214 18L232 32L214 46M236 18L254 32L236 46', ink(k.C, 7))
          );
        // A loudhailer: one call, and everybody around the court hears it.
        case 'topic':
          return (
            rect(52, 40, 20, 22, 6, body(k, M)) +
            path('M34 20L112 6V58L34 44Z', body(k)) +
            shade(k, 'M37 33L109 36V54L37 42Z', 0.22) +
            rect(10, 17, 26, 30, 8, paint(k.L, k.L, 2)) +
            rect(106, 5, 16, 54, 8, block(k)) +
            path('M146 17Q160 32 146 47M176 9Q198 32 176 55M208 7Q234 32 208 57', ink(k.L, 8))
          );
        // A rally: the ball's flight, over the net.
        case 'stream':
          return (
            path('M26 46C86 0 176 0 240 24', ink(k.C, 8)) +
            rect(116, 27, 44, 24, 0, paint(WHITE, k.L, 4)) +
            path('M127 29V49M138 29V49M149 29V49M118 39H158', ink(k.C, 3)) +
            path('M112 27H164', ink(k.L, 8)) +
            rect(4, 50, 268, 10, 5, paint(k.L, k.L, 2)) +
            ball(246, 25, 17)
          );
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A player, the racket over one shoulder.
        case 'human':
          return path('M90 52L99 37', ink(k.L, 10)) + path('M90 52L99 37', ink(WOOD, 5)) + group('rotate(28 102 21)', racket(k, 102, 19, 13, 17, 5)) + player(k);
        // A doubles pair and one more: the player, and a partner at each shoulder.
        case 'group':
          return partner(k, 24) + partner(k, 96) + group('translate(6 7.9) scale(0.9)', player(k));
        // The umpire: a dark blazer, a clay tie, a straw boater. Not one of the players.
        case 'thirdParty':
          return (
            path('M16 79Q18 48 60 48Q102 48 104 79Z', paint(k.L, k.L, W)) +
            path('M45 50L60 78L75 50Z', flat(WHITE)) +
            path('M56 52H64L63 68L60 73L57 68Z', flat(CLAY)) +
            circle(60, 34, 14.5, body(k)) +
            rect(43, 5, 34, 18, 5, body(k, M)) +
            rect(45.5, 14, 29, 7, 0, flat(k.C)) +
            path('M30 23H90', ink(k.L, 8))
          );
        // The umpire's chair: the high seat the whole match is run from.
        case 'system':
          return (
            ground(k, 60, 80, 46, 2.5) +
            path('M42 42L24 78M78 42L96 78', ink(k.L, 8)) +
            path('M36 55H84M30 68H90', ink(k.L, M)) +
            rect(38, 3, 44, 30, 8, body(k)) +
            shade(k, 'M64 6H72Q79 6 79 13V30H64Z') +
            rect(26, 28, 68, 17, 6, block(k))
          );
        // A wristwatch: something small you wear to the court.
        case 'device':
          return (
            rect(47, 3, 26, 76, 8, block(k, M)) +
            path('M62 5.5H66Q70.5 5.5 70.5 10V72Q70.5 76.5 66 76.5H62Z', flat(INK, 0.2)) +
            circle(60, 41, 20, body(k)) +
            path('M60 41V29M60 41L68 46', ink(k.L, M))
          );
        // A small round helper: a ball's seam, a visor, an aerial with a ball-yellow tip.
        case 'agent':
          return (
            ground(k, 60, 80, 30, 2.5) +
            path('M60 16V8', ink(k.L, M)) +
            path('M46 72V77M74 72V77', ink(k.L, 9)) +
            path('M30 50L18 58M90 50L102 58', ink(k.L, 8)) +
            circle(60, 46, 30, block(k)) +
            path('M82 26Q100 46 82 68Q93 60 90 46Q93 34 82 26Z', flat(INK, 0.2)) +
            path('M36 30Q52 20 68 24', ink(WHITE, 4.5, 0.85)) +
            rect(38, 36, 44, 20, 10, paint(WHITE, k.L, 4.5)) +
            circle(50, 46, 4.5, flat(k.L)) +
            circle(70, 46, 4.5, flat(k.L)) +
            circle(60, 7, 5.5, paint(BALL, INK, 3))
          );
      }
    },

    // A racket press: a white bar between two varnished wooden ends, each with one heavy screw,
    // the middle left clear.
    componentCard: (k) =>
      rect(4, 4, 292, 100, 14, flat(k.F)) +
      path('M18 4H30V104H18Q4 104 4 90V18Q4 4 18 4ZM282 4H270V104H282Q296 104 296 90V18Q296 4 282 4Z', flat(WOOD)) +
      shade(k, 'M7 91H293V90Q293 101 282 101H18Q7 101 7 90Z', 0.16) +
      path('M30 4V104M270 4V104', ink(k.L, M)) +
      rect(4, 4, 292, 100, 14, ink(k.L, W)) +
      circle(17, 54, 6, paint(WHITE, INK, 3.5)) +
      circle(283, 54, 6, paint(WHITE, INK, 3.5)),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A stringing square: three mains, three crosses, woven over and under.
        case 'module':
          return (
            ground(k, 62, 101, 52) +
            rect(10, 6, 100, 92, 16, body(k, 7)) +
            shade(k, 'M92 10H96Q106 10 106 20V84Q106 94 96 94H92Z') +
            path('M36 10V94M60 10V94M84 10V94', ink(k.C, 8)) +
            path('M14 30H106M14 52H106M14 74H106', ink(k.L, 8)) +
            path(boxes([[32, 24, 8, 12], [80, 24, 8, 12], [56, 46, 8, 12], [32, 68, 8, 12], [80, 68, 8, 12]]), flat(k.C)) +
            rect(10, 6, 100, 92, 16, ink(k.L, 7))
          );
        // The net-post crank: the handle that takes up the slack between the post and the net.
        case 'adapter':
          return (
            ground(k, 58, 101, 50) +
            rect(48, 18, 64, 22, 0, paint(WHITE, k.L, 4)) +
            path('M64 20V38M80 20V38M96 20V38', ink(k.C, 3)) +
            path('M44 18H112', ink(k.L, 8)) +
            rect(14, 4, 36, 96, 10, body(k)) +
            shade(k, 'M38 7H41Q47 7 47 13V91Q47 97 41 97H38Z', 0.24) +
            path('M32 56H96', ink(k.L, 12)) +
            rect(82, 44, 24, 54, 12, block(k)) +
            path('M97 47Q103 49 103 56V86Q103 93 97 95Z', flat(INK, 0.2)) +
            circle(32, 56, 14, paint(BALL, INK, 5))
          );
        // A racket head, face on: an open ring you put the ball through.
        case 'port':
          return (
            path('M60 88V100', ink(k.L, 17)) +
            path('M60 90V100', ink(WOOD, 10)) +
            path('M36 76L60 92L84 76', ink(k.L, 8)) +
            ellipse(60, 45, 44, 36, flat(k.F)) +
            path(strings(60, 45, 44, 36, 3, 3), ink(k.C, 3.5)) +
            ellipse(60, 45, 44, 36, ink(k.L, 13)) +
            ellipse(60, 45, 44, 36, ink(k.C, 5))
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A scorecard: a headed sheet, three lines written, one box ticked off in ball yellow.
        case 'file':
          return (
            rect(8, 5, 70, 90, 10, flat(k.F)) +
            path(band(8, 5, 70, 22, 10), flat(k.C)) +
            glint('M18 16H44', 4.5, 0.9) +
            path('M8 27H78', ink(k.L, M)) +
            path('M19 42H50M19 57H50M19 72H40', ink(k.L, 6)) +
            rect(57, 64, 14, 15, 3, paint(BALL, INK, 3.5)) +
            rect(8, 5, 70, 90, 10, ink(k.L, W))
          );
        // A tension gauge and its slider: how tight things are set.
        case 'config':
          return (
            circle(43, 38, 33, body(k, 7)) +
            path('M43 38L20.5 49.5A25.5 25.5 0 0 1 25 20Z', flat(k.C)) +
            path('M43 38L61 20A25.5 25.5 0 0 1 65.5 49.5Z', flat(CLAY)) +
            path('M43 38L55 21', ink(k.L, 7)) +
            circle(43, 38, 6, flat(k.L)) +
            path('M8 87H78', ink(k.L, 7)) +
            rect(46, 76, 16, 22, 6, block(k, M))
          );
        // The padlock off a locker.
        case 'secret':
          return (
            ground(k, 44, 97, 36, 3) +
            path('M24 46V30Q24 9 43 9Q62 9 62 30V46', ink(k.L, 11)) +
            rect(8, 42, 70, 53, 12, block(k)) +
            path('M62 45H66Q75 45 75 54V83Q75 92 66 92H62Z', flat(INK, 0.2)) +
            circle(43, 63, 8, flat(WHITE)) +
            path('M43 65V78', ink(WHITE, 7))
          );
        // The club cup: a plain two-handled trophy on its plinth.
        case 'certificate':
          return (
            ground(k, 43, 97, 32, 3) +
            path('M20 20Q2 20 6 36Q10 50 28 47M66 20Q84 20 80 36Q76 50 58 47', ink(k.L, W)) +
            path('M43 56V76', ink(k.L, 11)) +
            path('M15 7H71Q71 56 43 60Q15 56 15 7Z', block(k)) +
            path('M52 7H71Q71 56 43 60Q58 46 52 7Z', flat(INK, 0.2)) +
            glint('M26 16Q26 34 31 43', 5, 0.9) +
            path('M11 7H75', ink(k.L, 8)) +
            rect(18, 74, 50, 21, 6, body(k))
          );
      }
    },

    // The "T" where the service lines meet, set in a ring: four heavy marks outside it, the
    // middle left empty.
    junction: (k) => path('M50 2V16M50 84V98M2 50H16M84 50H98', ink(k.L, 8)) + circle(50, 50, 34, body(k, 7)) + circle(50, 50, 25, ink(k.C, 4)),
  },

  // The lawn in strong sun: three broad mown stripes a whisper apart in tone, and a few very
  // large, very faint ball seams printed over them. Nothing with corners, nothing straight but
  // the stripes themselves, which run off the page.
  backdrop: {
    tile: [TW, TH],
    draw: () =>
      path(boxes([[40, 0, 150, TH]]), flat('#eff3cb')) +
      path(boxes([[300, 0, 130, TH]]), flat('#f8fae2')) +
      path('M70 30Q270 170 130 360', ink(WHITE, 22, 0.2)) +
      path('M480 70Q340 210 450 370', ink(WHITE, 18, 0.18)),
  },
};

import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Hardwood: basketball in daylight, printed like a modern sports poster on warm peach. Four inks
 * and no more: ball orange, a deep warm black, white, and one court teal. Every kind is one big
 * flat object from the gym, cut from two or three blocks of colour under a heavy even outline: a
 * service is a white card with an orange end band and a court arc in its corner, a worker a
 * high-top on the run, a gateway the hoop seen front-on, a load balancer one ball passed three
 * ways, a scheduler the shot clock; a data store is a ball rack, a stat clipboard, a gym bag, a row
 * of lockers, a ball cart; a queue is tokens waiting behind the ball at the line, a topic the
 * horn, a stream a fast break. One hard shade on the lower right, one glint on the upper left,
 * nothing small. Maple shows once, as the wood of the component card. The canvas is a quiet
 * print: a few great white seam curves and a patch of halftone. No league, team, player or
 * brand: the sport alone. Always light: it is a poster.
 */

/** The four inks, whatever colour the shape is, and the one wood. */
const ORANGE = '#f0652a';
const INK = '#231a15';
const WHITE = '#ffffff';
const TEAL = '#1f5f7a';
const MAPLE = '#ecbb74';

/** The weight of every outline. */
const W = 6;

const n2 = (v: number) => Math.round(v * 100) / 100;
const fo = (colour: string, o: number) => `fill="${colour}" fill-opacity="${o}"`;
const ln = (colour: string, w: number) => paint('none', colour, w);
const lo = (colour: string, w: number, o: number) => `fill="none" stroke="${colour}" stroke-width="${w}" stroke-opacity="${o}"`;
const body = (k: Kit, fill: string = k.F, w = W) => paint(fill, k.L, w);

/** The one hard shade: a block of the shape's darkest ink, laid over its lower right. */
const shade = (k: Kit, d: string, o = 0.16) => path(d, fo(k.T, o));
/** The same on anything round. */
const crescent = (k: Kit, cx: number, cy: number, r: number, o = 0.18): string =>
  path(
    `M${n2(cx + 0.72 * r)} ${n2(cy - 0.72 * r)}Q${n2(cx + 1.2 * r)} ${n2(cy + 1.2 * r)} ${n2(cx - 0.72 * r)} ${n2(cy + 0.72 * r)}Q${n2(cx + 0.55 * r)} ${n2(cy + 0.55 * r)} ${n2(cx + 0.72 * r)} ${n2(cy - 0.72 * r)}Z`,
    fo(k.T, o),
  );
/** The glint on the upper left of a block of colour. */
const glint = (cx: number, cy: number, r: number, o = 0.75): string =>
  path(`M${n2(cx - 0.6 * r)} ${n2(cy - 0.22 * r)}Q${n2(cx - 0.5 * r)} ${n2(cy - 0.52 * r)} ${n2(cx - 0.2 * r)} ${n2(cy - 0.62 * r)}`, lo(WHITE, n2(Math.max(3, r * 0.17)), o));
/**
 * The ball: an orange disc under the heavy outline. A big one carries its seams, a middling one
 * two, a small one a single curve.
 */
const ball = (k: Kit, cx: number, cy: number, r: number): string => {
  const w = r >= 20 ? 5.5 : r >= 14 ? 5 : 4;
  const a = n2(r * 0.7);
  const s = r >= 24 ? 4 : 3.5;
  const cross = `M${cx - r} ${cy}Q${cx} ${n2(cy + 0.28 * r)} ${cx + r} ${cy}M${n2(cx - 0.1 * r)} ${cy - r}Q${n2(cx - 0.42 * r)} ${cy} ${n2(cx - 0.1 * r)} ${cy + r}`;
  const ribs = `M${n2(cx - a)} ${n2(cy - a)}Q${n2(cx - 0.12 * r)} ${n2(cy - 0.1 * r)} ${n2(cx - a)} ${n2(cy + a)}M${n2(cx + a)} ${n2(cy - a)}Q${n2(cx + 0.3 * r)} ${n2(cy + 0.1 * r)} ${n2(cx + a)} ${n2(cy + a)}`;
  const seam = r >= 24 ? cross + ribs : r >= 14 ? cross : `M${cx - r} ${n2(cy - 0.1 * r)}Q${cx} ${n2(cy + 0.5 * r)} ${cx + r} ${n2(cy - 0.1 * r)}`;
  return circle(cx, cy, r, paint(ORANGE)) + crescent(k, cx, cy, r, 0.2) + group(`rotate(-20 ${cx} ${cy})`, path(seam, ln(INK, s))) + glint(cx, cy, r) + circle(cx, cy, r, ln(INK, w));
};

/**
 * A player from the chest up, `s` times the size of the one who stands alone: a solid head under
 * a white sweatband, bare shoulders in the shape's fill and a plain vest in its accent. The
 * referee wears stripes and no band.
 */
const player = (k: Kit, cx: number, top: number, s: number, referee = false): string => {
  const p = (x: number, y: number) => `${n2(cx + x * s)} ${n2(top + y * s)}`;
  const torso = `M${p(-46, 76)}Q${p(-45, 46)} ${p(-21, 40)}L${p(-12, 38)}Q${p(0, 50)} ${p(12, 38)}L${p(21, 40)}Q${p(45, 46)} ${p(46, 76)}Z`;
  const lee = `M${p(0, 38)}L${p(12, 38)}L${p(21, 40)}Q${p(45, 46)} ${p(46, 76)}L${p(0, 76)}Z`;
  const head = rect(n2(cx - 7 * s), n2(top + 26 * s), n2(14 * s), n2(16 * s), 0, paint(k.L)) + circle(cx, n2(top + 18 * s), n2(17 * s), paint(k.L));
  if (referee) {
    return path(torso, paint(WHITE)) + path(`M${p(-22, 43)}L${p(-22, 75)}M${p(0, 47)}L${p(0, 75)}M${p(22, 43)}L${p(22, 75)}`, ln(INK, n2(9 * s))) + shade(k, lee, 0.14) + path(torso, ln(k.L, n2(W * s))) + head;
  }
  return (
    path(torso, paint(k.F)) +
    path(`M${p(-25, 76)}L${p(-25, 49)}L${p(-13, 38)}L${p(13, 38)}L${p(25, 49)}L${p(25, 76)}Z`, paint(k.C)) +
    shade(k, lee) +
    path(torso, ln(k.L, n2(W * s))) +
    head +
    path(`M${p(-11, 10.5)}Q${p(0, 7.5)} ${p(11, 10.5)}`, ln(WHITE, n2(5.5 * s)))
  );
};

/** The canvas: one great seam, drawn again a tile away wherever it leaves the edge. */
const TW = 560;
const TH = 420;
const halftone = (): [string, string, string] => {
  // A patch of dots that thins out towards the upper left: three sizes, each a path of points.
  const out: [string, string, string] = ['', '', ''];
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 7; j++) {
      const t = (i + j) / 14;
      if (t < 0.28 || (i * 5 + j * 3) % 7 === 0) continue;
      const x = 372 + i * 17 + (j % 2) * 8.5;
      const y = 282 + j * 15;
      out[t > 0.72 ? 2 : t > 0.5 ? 1 : 0] += `M${x} ${y}h0.01`;
    }
  return out;
};

export const hardwood: Pack = {
  id: 'hardwood',
  name: 'Hardwood',
  summary: 'Basketball as a bold daylight poster: ball orange, deep ink, white and court teal on warm peach',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 90,
  style: {
    // A poster printer's fat round marker: one heavy, even line, every corner rounded off.
    hand: { base: 'clean' },
    general: { weight: 'bold', corners: 'round' },
    connectors: { weight: 'bold', head: 'triangle', colour: 'plain' },
    schemes: {
      light: scheme(
        { canvas: '#fde8d4', grid: '#f5d6bb', text: '#231a15', textMuted: '#6b5546', edge: '#231a15', edgeText: '#231a15', edgeLabelBg: '#fde8d4', codeBg: '#fff7ef', codeBorder: '#e8c6a8' },
        {
          neutral: ['#ffffff', '#231a15', '#231a15', '#e4541a'],
          teal: ['#d8eef3', '#1f5f7a', '#0f303f', '#1f7896'],
          blue: ['#dde7fc', '#2850b4', '#14234c', '#3a68d2'],
          violet: ['#ebe2fb', '#6539b4', '#2a1852', '#7d52cc'],
          amber: ['#ffe7b8', '#a8500a', '#3d2003', '#c96508'],
          rose: ['#fddde0', '#bb2a41', '#480e19', '#d6425a'],
          green: ['#d9f2df', '#1c7541', '#0e331e', '#27914f'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      // A white card: an end band in the accent down its left, and the corner of a court arc
      // swept across its top right. Nothing else.
      const arc = path('M292 6Q292 56 342 56', ln(k.C, 6));
      // An API is that card with a socket bitten out of its band and a teal jack in it. The
      // bottom-right corner is left bare, where the app writes "API".
      if (kind === 'api') {
        return (
          path('M3 46Q23 46 23 66Q23 86 3 86Z', paint(TEAL, INK, 5)) +
          path('M17 3H331Q345 3 345 17V115Q345 129 331 129H17Q3 129 3 115V95Q32 95 32 66Q32 37 3 37V17Q3 3 17 3Z', paint(k.F)) +
          path('M17 3H40V129H17Q3 129 3 115V95Q32 95 32 66Q32 37 3 37V17Q3 3 17 3Z', paint(k.C)) +
          arc +
          path('M17 3H331Q345 3 345 17V115Q345 129 331 129H17Q3 129 3 115V95Q32 95 32 66Q32 37 3 37V17Q3 3 17 3Z', ln(k.L, W))
        );
      }
      return rect(3, 3, 342, 126, 14, paint(k.F)) + path('M17 3H30V129H17Q3 129 3 115V17Q3 3 17 3Z', paint(k.C)) + arc + rect(3, 3, 342, 126, 14, ln(k.L, W));
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A high-top on the run: the one doing the legwork.
        case 'worker':
          return (
            path('M3 30H19M3 52H15', ln(k.C, 7)) +
            path('M40 7H74L78 40Q104 46 120 58Q132 66 132 80H34Q28 44 40 7Z', paint(k.F)) +
            path('M40 7H74L76 24H36Q37 15 40 7Z', paint(k.C)) +
            path('M104 49Q130 60 132 80H98Q96 62 104 49Z', paint(k.C)) +
            shade(k, 'M33 62H126Q132 70 132 80H34Z') +
            path('M40 7H74L78 40Q104 46 120 58Q132 66 132 80H34Q28 44 40 7Z', ln(k.L, W)) +
            path('M80 43L92 35M91 48L103 40', ln(k.L, 5.5)) +
            path('M28 80H134V89Q134 99 124 99H38Q28 99 28 89Z', body(k, WHITE))
          );
        // Another building: the away arena, its pennant up over the dome.
        case 'external':
          return (
            path('M68 28V5', ln(k.L, W)) +
            poly('71,5 103,14 71,23', paint(TEAL, k.L, 4)) +
            path('M14 56Q68 -2 122 56Z', paint(k.C)) +
            path('M68 27Q104 32 122 56H68Z', fo(k.T, 0.18)) +
            path('M26 44Q40 30 56 24', lo(WHITE, 5, 0.75)) +
            path('M14 56Q68 -2 122 56Z', ln(k.L, W)) +
            poly('4,99 11,64 26,54 110,54 125,64 132,99', paint(k.F)) +
            poly('68,54 110,54 125,64 132,99 68,99', fo(k.T, 0.14)) +
            poly('4,99 11,64 26,54 110,54 125,64 132,99', ln(k.L, W)) +
            path('M22 73H44M92 73H114', ln(k.L, 8)) +
            poly('55,99 55,76 81,76 81,99', paint(k.L))
          );
        // The shot clock: a boxed dial with the time that is left.
        case 'scheduler':
          return (
            path('M36 86V99M100 86V99', ln(k.L, 8)) +
            rect(8, 4, 120, 84, 14, paint(k.C)) +
            shade(k, 'M11 70H125V74Q125 85 114 85H22Q11 85 11 74Z', 0.2) +
            path('M24 12H70', lo(WHITE, 5, 0.75)) +
            rect(8, 4, 120, 84, 14, ln(k.L, W)) +
            circle(68, 46, 31, body(k, k.F, 5.5)) +
            path('M68 46V19A27 27 0 0 1 91.38 59.5Z', paint(k.L)) +
            path('M68 46V16', ln(k.L, 5.5)) +
            circle(68, 46, 5, paint(k.F, k.L, 4))
          );
        // The hoop, front-on: backboard, the shooter's square, the rim and its net. The one way in.
        case 'gateway':
          return (
            rect(8, 3, 120, 66, 8, paint(k.F)) +
            shade(k, 'M11 52H125V66H11Z', 0.14) +
            rect(8, 3, 120, 66, 8, ln(k.L, W)) +
            rect(46, 24, 44, 34, 0, ln(k.C, 6)) +
            poly('40,72 96,72 85,101 51,101', body(k, WHITE, 5)) +
            path('M57 76L62 99M79 76L74 99M46 87H90', ln(k.L, 4)) +
            ellipse(68, 71, 31, 6.5, ln(INK, 12)) +
            ellipse(68, 71, 31, 6.5, ln(ORANGE, 6))
          );
        // The point guard's read: one ball, passed three ways.
        case 'load-balancer':
          return (
            path('M50 40L100 17M56 52H104M50 64L100 87', ln(k.L, 8)) +
            poly('128,4 110,27 99,5', body(k, k.C, 4.5)) +
            poly('133,52 106,39 106,65', body(k, k.C, 4.5)) +
            poly('128,100 99,99 110,77', body(k, k.C, 4.5)) +
            ball(k, 31, 52, 28)
          );
        // The referee's whistle: it stands between the two sides and calls the game.
        case 'proxy':
          return (
            path('M92 20L97 5M110 23L123 10', ln(k.L, 7)) +
            circle(15, 70, 9, ln(k.L, 5.5)) +
            path('M52 30H128V56H82.3A31 31 0 1 1 52 30Z', paint(k.C)) +
            crescent(k, 52, 62, 29, 0.2) +
            rect(108, 30, 20, 26, 0, paint(k.F)) +
            path('M32 48Q38 38 52 36H80', lo(WHITE, 5, 0.75)) +
            path('M52 30H128V56H82.3A31 31 0 1 1 52 30ZM108 30V56', ln(k.L, W)) +
            poly('64,30 92,30 87,43 69,43', paint(k.L, k.L, 3)) +
            circle(52, 65, 10, body(k, k.F, 5))
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // The ball rack: a rail of balls over a solid shelf, everything in its place.
        case 'generic':
          return (
            rect(12, 74, 116, 18, 4, body(k, k.C, 5.5)) +
            path('M14 81H126V89H14Z', fo(k.T, 0.18)) +
            path('M12 8V102M128 8V102M12 56H128', ln(k.L, 7)) +
            ball(k, 33, 35, 17) +
            ball(k, 70, 35, 17) +
            ball(k, 107, 35, 17)
          );
        // The stat sheet on its clipboard: a header, a column of marks and ruled rows.
        case 'sql':
          return (
            rect(14, 9, 112, 95, 12, paint(k.C)) +
            shade(k, 'M17 84H123V90Q123 101 112 101H28Q17 101 17 90Z', 0.2) +
            rect(14, 9, 112, 95, 12, ln(k.L, W)) +
            rect(28, 26, 84, 66, 4, body(k, WHITE, 5)) +
            path('M40 44H46M40 59H46M40 74H46', ln(k.C, 8)) +
            path('M60 44H100M60 59H92M60 74H98', ln(k.T, 6.5)) +
            poly('46,3 94,3 94,12 102,12 102,28 38,28 38,12 46,12', paint(k.L, k.L, 3))
          );
        // The gym bag: a ball and whatever else went in, nothing alike.
        case 'nosql':
          return (
            path('M36 48Q70 -2 104 48', ln(k.L, 7)) +
            ball(k, 94, 27, 19) +
            path('M8 56Q8 42 22 42H118Q132 42 132 56V90Q132 104 118 104H22Q8 104 8 90Z', paint(k.F)) +
            path('M22 42H34V104H22Q8 104 8 90V56Q8 42 22 42ZM118 42H106V104H118Q132 104 132 90V56Q132 42 118 42Z', paint(k.C)) +
            shade(k, 'M34 88H106V104H34Z', 0.14) +
            path('M8 56Q8 42 22 42H118Q132 42 132 56V90Q132 104 118 104H22Q8 104 8 90Z', ln(k.L, W)) +
            circle(49, 72, 8, ln(k.L, 5.5)) +
            path('M63 64h15v16h-15zM83 80l8.5 -17l8.5 17z', ln(k.L, 5.5))
          );
        // A ball already gone: quick off the hands, a bolt across it, and not for keeping.
        case 'cache':
          return (
            path('M3 34H27M3 56H21M3 78H27', ln(k.C, 7)) +
            circle(84, 54, 44, paint(k.C)) +
            crescent(k, 84, 54, 44, 0.2) +
            path('M45 36Q62 22 82 18', lo(WHITE, 6, 0.75)) +
            circle(84, 54, 44, ln(k.L, W)) +
            poly('96,14 58,62 80,62 68,98 112,48 88,48', body(k, WHITE, 5))
          );
        // The locker row: three doors, each with its vents and its latch.
        case 'file-system':
          return (
            path('M18 96V104M122 96V104', ln(k.L, 7)) +
            rect(6, 4, 128, 94, 8, paint(k.F)) +
            rect(49, 4, 42, 94, 0, paint(k.C)) +
            shade(k, 'M9 78H131V95H9Z', 0.14) +
            path('M49 4V98M91 4V98', ln(k.L, 5.5)) +
            rect(6, 4, 128, 94, 8, ln(k.L, W)) +
            path('M18 22H38M18 34H38M60 22H80M60 34H80M102 22H122M102 34H122', ln(k.L, 5.5)) +
            path('M38 56v12M80 56v12M122 56v12', ln(k.L, 6))
          );
        // The ball cart: a deep bin on wheels, heaped with whatever is thrown in.
        case 'object-storage':
          return (
            ball(k, 43, 31, 17) +
            ball(k, 97, 31, 17) +
            ball(k, 70, 23, 19) +
            poly('10,42 130,42 119,90 21,90', paint(k.F)) +
            poly('92,42 130,42 119,90 92,90', fo(k.T, 0.14)) +
            path('M49 44L52 89M91 44L88 89', ln(k.L, 4.5)) +
            poly('10,42 130,42 119,90 21,90', ln(k.L, W)) +
            rect(4, 36, 132, 14, 5, body(k, k.C, 5.5)) +
            circle(36, 98, 5.5, body(k, k.L, 3)) +
            circle(104, 98, 5.5, body(k, k.L, 3))
          );
        // The scout's glass: the one ball it was looking for, found.
        case 'search-index':
          return (
            path('M90 80L123 100', ln(k.L, 15)) +
            path('M96 83.6L121 98.8', ln(k.C, 6)) +
            circle(57, 47, 41, paint(k.F)) +
            crescent(k, 57, 47, 41, 0.14) +
            circle(57, 47, 41, ln(k.L, 7)) +
            ball(k, 57, 47, 20)
          );
        // The standings board, hung from the rafters: a header and a strict grid, one cell lit.
        case 'table':
          return (
            path('M32 0V10M108 0V10', ln(k.L, 6)) +
            rect(4, 9, 132, 94, 9, paint(k.F)) +
            path('M13 9H127Q136 9 136 18V34H4V18Q4 9 13 9Z', paint(k.C)) +
            path('M16 17H60', lo(WHITE, 5, 0.75)) +
            rect(50, 57, 42, 23, 0, paint(TEAL)) +
            shade(k, 'M92 34H133V100H92Z', 0.12) +
            path('M4 34H136M4 57H136M4 80H136M49 34V103M92 34V103', ln(k.L, 4.5)) +
            rect(4, 9, 132, 94, 9, ln(k.L, W))
          );
      }
    },

    queue: (k, kind) => {
      const plate = (d: string) => rect(3, 3, 270, 58, 16, paint(k.F)) + d + rect(3, 3, 270, 58, 16, ln(k.L, W));
      switch (kind) {
        // Waiting their turn at the line: three places held, and the ball at the front, next out.
        case 'queue':
          return (
            plate(shade(k, 'M6 44H270V47Q270 58 258 58H18Q6 58 6 47Z', 0.12)) +
            circle(38, 32, 15, body(k, k.F, 5)) +
            circle(82, 32, 15, body(k, k.F, 5)) +
            circle(126, 32, 15, body(k, k.F, 5)) +
            path('M38 32h0.01M82 32h0.01M126 32h0.01', ln(k.C, 13)) +
            ball(k, 172, 32, 19) +
            path('M206 6V58', ln(k.L, 5.5)) +
            path('M224 17L240 32L224 47M246 17L262 32L246 47', ln(k.C, 7))
          );
        // The arena horn: one call, carried out to everyone listening.
        case 'topic':
          return (
            plate(shade(k, 'M6 44H270V47Q270 58 258 58H18Q6 58 6 47Z', 0.12)) +
            poly('16,23 34,23 62,10 62,54 34,41 16,41', paint(k.L, k.L, 4)) +
            rect(62, 7, 9, 50, 3, body(k, k.C, 4)) +
            path('M88 20Q100 32 88 44M112 13Q130 32 112 51M138 7Q162 32 138 57', ln(k.C, 7)) +
            poly('184,14 208,24 184,34', paint(k.C, k.L, 4)) +
            poly('220,22 244,32 220,42', paint(TEAL, k.L, 4)) +
            path('M184 10V54M220 10V54', ln(k.L, 5))
          );
        // The fast break: a ball already down the floor, and the streak it leaves.
        case 'stream':
          return (
            poly('22,3 273,3 254,61 3,61', paint(k.F)) +
            poly('34,18 206,10 206,26', fo(k.C, 0.5)) +
            poly('14,32 202,23 202,41', paint(k.C)) +
            poly('40,46 206,38 206,54', fo(k.C, 0.5)) +
            poly('22,3 273,3 254,61 3,61', ln(k.L, W)) +
            ball(k, 226, 32, 22)
          );
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A player: bare shoulders, a plain vest and a sweatband.
        case 'human':
          return player(k, 60, 2, 1.02);
        // A team: three of them, the captain in front.
        case 'group':
          return player(k, 24, 21, 0.76) + player(k, 96, 21, 0.76) + player(k, 60, 4, 0.99);
        // The referee: on neither side, in the stripes that say so.
        case 'thirdParty':
          return player(k, 60, 2, 1.02, true);
        // The scorer's table: the console that runs the game.
        case 'system':
          return (
            rect(34, 3, 52, 26, 6, body(k, TEAL, 5.5)) +
            path('M44 16H64', ln(WHITE, 5.5)) +
            poly('8,40 112,40 107,78 13,78', paint(k.F)) +
            poly('76,40 112,40 107,78 76,78', fo(k.T, 0.14)) +
            path('M14 55H106', ln(k.C, 13)) +
            poly('8,40 112,40 107,78 13,78', ln(k.L, W)) +
            poly('12,27 108,27 117,40 3,40', paint(k.L, k.L, 3))
          );
        // The courtside tablet: a play drawn up on its screen.
        case 'device':
          return (
            rect(40, 3, 40, 76, 8, body(k)) +
            rect(46, 10, 28, 52, 2, paint(TEAL)) +
            path('M61 17l8 8M69 17l-8 8', ln(WHITE, 4)) +
            path('M54 46Q54 34 64 34', ln(ORANGE, 4)) +
            poly('71,34 63,28.5 63,39.5', paint(ORANGE)) +
            circle(54, 53, 4.5, ln(WHITE, 3.5)) +
            circle(60, 70.5, 3.5, paint(k.L))
          );
        // The ball boy: a little round robot, seamed like a ball, with a visor and two lit eyes.
        case 'agent':
          return (
            path('M60 12V7', ln(k.L, 5)) +
            circle(60, 6, 4.5, paint(TEAL, k.L, 3)) +
            path('M28 52L11 63M92 52L109 63', ln(k.L, 8)) +
            circle(60, 46, 33, paint(k.C)) +
            crescent(k, 60, 46, 33, 0.2) +
            path('M31 30Q38 20 50 15', lo(WHITE, 5, 0.75)) +
            path('M28 58Q60 76 92 58', ln(k.L, 4.5)) +
            circle(60, 46, 33, ln(k.L, W)) +
            rect(36, 30, 48, 24, 12, paint(INK)) +
            rect(46, 37, 9, 10, 3, paint(WHITE)) +
            rect(65, 37, 9, 10, 3, paint(WHITE))
          );
      }
    },

    // A length of the floor: a white card with one end of maple plank, and the corner of a court
    // arc across its top right.
    componentCard: (k) =>
      rect(3, 3, 294, 102, 12, paint(k.F)) +
      path('M15 3H34V105H15Q3 105 3 93V15Q3 3 15 3Z', paint(MAPLE)) +
      path('M6 38H34M6 72H34', lo(INK, 3.5, 0.4)) +
      path('M34 3V105', ln(k.L, 5)) +
      path('M254 6Q254 46 294 46', ln(k.C, 6)) +
      rect(3, 3, 294, 102, 12, ln(k.L, W)),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // One floor panel, lifted out: a slab with a length of painted line across its face.
        case 'module':
          return (
            poly('4,36 60,68 60,100 4,68', paint(k.C)) +
            poly('60,68 116,36 116,68 60,100', paint(k.C)) +
            poly('60,68 116,36 116,68 60,100', fo(k.T, 0.28)) +
            poly('60,4 116,36 60,68 4,36', paint(k.F)) +
            path('M83 25L41 49', ln(k.C, 11)) +
            path('M60 4L116 36L60 68L4 36ZM4 36V68L60 100L116 68V36M60 68V100', ln(k.L, W))
          );
        // The pump, its hose and the ball on the end of it: what joins one thing to another.
        case 'adapter':
          return (
            path('M48 84Q86 108 88 68', ln(k.L, 7)) +
            path('M33 34V14', ln(k.L, 7)) +
            path('M13 12H53', ln(k.L, 11)) +
            rect(18, 34, 30, 60, 6, paint(k.C)) +
            rect(36, 37, 9, 54, 0, fo(k.T, 0.2)) +
            path('M26 44V70', lo(WHITE, 5, 0.75)) +
            rect(18, 34, 30, 60, 6, ln(k.L, W)) +
            path('M10 98H56', ln(k.L, 8)) +
            ball(k, 89, 42, 27)
          );
        // The rim from above, bolted to the board: a ring waiting for something to drop through.
        case 'port':
          return (
            poly('44,8 76,8 72,26 48,26', paint(k.L, k.L, 3)) +
            path('M12 7H108', ln(k.L, 9)) +
            circle(60, 60, 34, paint(k.F, k.L, 19)) +
            circle(60, 60, 34, ln(k.C, 8)) +
            path('M32 43Q40 31 54 27', lo(WHITE, 3.5, 0.8))
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A play sheet: a dog-eared page with an X, an O and the cut to the basket.
        case 'file':
          return (
            poly('6,4 56,4 80,28 80,96 6,96', paint(k.F)) +
            shade(k, 'M9 80H77V93H9Z', 0.14) +
            poly('6,4 56,4 80,28 80,96 6,96', ln(k.L, W)) +
            poly('56,4 56,28 80,28', paint(k.C, k.L, 5)) +
            path('M20 24l14 14M34 24l-14 14', ln(k.C, 7)) +
            path('M27 66Q27 50 46 50', ln(k.L, 5.5)) +
            poly('56,50 45,42 45,58', paint(k.L)) +
            circle(27, 76, 8, ln(k.L, 5.5))
          );
        // The coach's whiteboard on its easel: three sliders, each set somewhere else.
        case 'config':
          return (
            path('M20 78L13 97M66 78L73 97', ln(k.L, 6.5)) +
            rect(4, 4, 78, 76, 8, paint(k.F)) +
            shade(k, 'M7 64H79V77H7Z', 0.14) +
            rect(4, 4, 78, 76, 8, ln(k.L, W)) +
            path('M16 22H70M16 42H70M16 62H70', ln(k.L, 5)) +
            circle(32, 22, 8.5, body(k, k.C, 4.5)) +
            circle(56, 42, 8.5, body(k, TEAL, 4.5)) +
            circle(38, 62, 8.5, body(k, k.C, 4.5))
          );
        // The padlock off a locker door.
        case 'secret':
          return (
            path('M24 46V30Q24 9 43 9Q62 9 62 30V46', ln(k.L, 12)) +
            rect(8, 42, 70, 55, 12, paint(k.C)) +
            shade(k, 'M11 80H75V84Q75 94 65 94H21Q11 94 11 84Z', 0.2) +
            path('M20 51H44', lo(WHITE, 5, 0.75)) +
            rect(8, 42, 70, 55, 12, ln(k.L, W)) +
            circle(43, 64, 8, paint(k.L)) +
            poly('39,66 47,66 50,84 36,84', paint(k.L))
          );
        // A medal on its ribbon: plain, and won.
        case 'certificate':
          return (
            poly('10,3 34,3 50,38 30,46', paint(TEAL, k.L, 4.5)) +
            poly('76,3 52,3 36,38 56,46', paint(k.F, k.L, 4.5)) +
            circle(43, 66, 30, paint(k.C)) +
            crescent(k, 43, 66, 30, 0.2) +
            path('M21 55Q27 44 38 40', lo(WHITE, 5, 0.75)) +
            circle(43, 66, 30, ln(k.L, W)) +
            poly('43,49 47.9,59.3 59.2,60.7 50.9,68.5 53,79.8 43,74.3 33,79.8 35.1,68.5 26.8,60.7 38.1,59.3', paint(WHITE, k.L, 3.5))
          );
      }
    },

    // The centre circle: a ring with the half-court line running up to it and away again, its
    // middle left empty for the word.
    junction: (k) => path('M50 2V14M50 86V98', ln(k.C, 7)) + circle(50, 50, 38, body(k)) + circle(50, 50, 28.5, ln(k.C, 4)),
  },

  // A quiet print: two great white seams sweeping right across the sheet and crossing once, a
  // short third beside them, and a patch of halftone thinning out in one corner. Nothing in it is
  // straight, closed or boxed, so nothing in it can be taken for part of the diagram.
  backdrop: {
    tile: [TW, TH],
    draw: () => {
      const dots = halftone();
      return (
        path('M0 136C150 40 410 232 560 136', lo(WHITE, 9, 0.22)) +
        path('M214 0C120 130 308 290 214 420', lo(WHITE, 9, 0.22)) +
        path('M52 318Q110 392 196 356', lo(WHITE, 6, 0.22)) +
        path(dots[0], lo(WHITE, 3.5, 0.45)) +
        path(dots[1], lo(WHITE, 5.5, 0.5)) +
        path(dots[2], lo(WHITE, 7.5, 0.55))
      );
    },
  },
};

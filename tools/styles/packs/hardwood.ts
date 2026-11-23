import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Hardwood: basketball by arena light, printed like a varsity poster on espresso black. Every kind
 * is an object from the gym: a service is a plaque with painted court-line corners and steel bolts,
 * a worker a sneaker mid-step, a gateway the hoop seen front-on, a load balancer one ball passed
 * three ways, a scheduler the shot clock; a data store is a ball rack, a stat clipboard, a gym bag,
 * a row of lockers, a ball cart; a queue is balls waiting at the line, a topic the arena horn, a
 * stream a fast break. Each is cut in flat tones with one hard shade on its lower right, one lit
 * edge on its upper left (the lights hang high and to the left) and a contact shadow where it
 * stands. The leather is orange, the wood maple, the lines chalk, the fittings steel, and one
 * scoreboard cyan glows where something is live. The canvas is the court itself: planks, a painted
 * lane line and an arc. No league, team, player or brand: the sport alone. Always dark: the house
 * lights are down.
 */

/** The materials, whatever colour the shape is. */
const ORANGE = '#e8742c';
const ORANGE_HI = '#ffb877';
const SEAM = '#3b1a0b';
const MAPLE = '#d9a25b';
const MAPLE_SH = '#8f6230';
const CHALK = '#f6efe2';
const STEEL = '#b4bdc6';
const STEEL_SH = '#5b6670';
const CYAN = '#5fdcf0';
const INK = '#120c08';
/** The arena light, and the shade it leaves. */
const HI = '#fff3df';
const SH = '#0a0503';
const WHITE = '#ffffff';

const n2 = (v: number) => Math.round(v * 100) / 100;
const fo = (colour: string, o: number) => `fill="${colour}" fill-opacity="${o}"`;
const ln = (colour: string, w: number) => paint('none', colour, w);
const lo = (colour: string, w: number, o: number) => `fill="none" stroke="${colour}" stroke-width="${w}" stroke-opacity="${o}"`;

/** The hard shade on the lower right of anything round. */
const crescent = (cx: number, cy: number, r: number, o = 0.3): string =>
  path(
    `M${n2(cx + 0.72 * r)} ${n2(cy - 0.72 * r)}Q${n2(cx + 1.2 * r)} ${n2(cy + 1.2 * r)} ${n2(cx - 0.72 * r)} ${n2(cy + 0.72 * r)}Q${n2(cx + 0.5 * r)} ${n2(cy + 0.5 * r)} ${n2(cx + 0.72 * r)} ${n2(cy - 0.72 * r)}Z`,
    fo(SH, o),
  );
/** The glint on its upper left. */
const glint = (cx: number, cy: number, r: number, colour: string = HI, o = 0.6): string =>
  path(`M${n2(cx - 0.62 * r)} ${n2(cy - 0.24 * r)}Q${n2(cx - 0.52 * r)} ${n2(cy - 0.56 * r)} ${n2(cx - 0.2 * r)} ${n2(cy - 0.66 * r)}`, lo(colour, n2(Math.max(2, r * 0.14)), o));
/** The seams of a ball: a cross and two ribs that bow towards it, tipped a little. */
const seams = (cx: number, cy: number, r: number, colour: string, w: number, tilt = -18): string => {
  const a = n2(r * 0.72);
  return group(
    `rotate(${tilt} ${cx} ${cy})`,
    path(`M${cx - r} ${cy}H${cx + r}M${cx} ${cy - r}V${cy + r}M${n2(cx - a)} ${n2(cy - a)}Q${n2(cx - 0.18 * r)} ${cy} ${n2(cx - a)} ${n2(cy + a)}M${n2(cx + a)} ${n2(cy - a)}Q${n2(cx + 0.18 * r)} ${cy} ${n2(cx + a)} ${n2(cy + a)}`, ln(colour, w)),
  );
};
/** A ball: leather, its seams, the shade and the glint. */
const ball = (cx: number, cy: number, r: number, colour: string = ORANGE, seam: string = SEAM, hi: string = ORANGE_HI): string => {
  const w = n2(Math.max(2, r * 0.13));
  return circle(cx, cy, r, paint(colour, seam, w)) + crescent(cx, cy, r) + seams(cx, cy, r, seam, w) + glint(cx, cy, r, hi, 0.9);
};
/** The shadow a thing stands on. */
const ground = (cx: number, cy: number, rx: number, ry = 3.5): string =>
  poly(`${cx - rx},${cy} ${n2(cx - rx * 0.7)},${cy - ry} ${n2(cx + rx * 0.7)},${cy - ry} ${cx + rx},${cy} ${n2(cx + rx * 0.7)},${cy + ry} ${n2(cx - rx * 0.7)},${cy + ry}`, fo('#000000', 0.5));
/** A steel bolt head. */
const bolt = (cx: number, cy: number, r = 5): string =>
  poly(`${cx - r},${cy} ${n2(cx - r / 2)},${n2(cy - r * 0.87)} ${n2(cx + r / 2)},${n2(cy - r * 0.87)} ${cx + r},${cy} ${n2(cx + r / 2)},${n2(cy + r * 0.87)} ${n2(cx - r / 2)},${n2(cy + r * 0.87)}`, paint(STEEL, STEEL_SH, 1.5)) +
  path(`M${n2(cx - r * 0.45)} ${n2(cy + r * 0.3)}L${n2(cx + r * 0.45)} ${n2(cy - r * 0.3)}`, ln(STEEL_SH, 1.6));
/** A small square lamp. */
const lamp = (cx: number, cy: number, r: number, colour: string): string => rect(cx - r, cy - r, r * 2, r * 2, 1.5, paint(colour));

/**
 * A player from the chest up, `s` times the size of the one who stands alone: bare shoulders in
 * the shape's fill, a plain vest, and a sweatband unless it is the referee.
 */
const player = (k: Kit, cx: number, top: number, s: number, o: { vest?: string; referee?: boolean } = {}): string => {
  const p = (x: number, y: number) => `${n2(cx + x * s)} ${n2(top + y * s)}`;
  const w = n2(4.5 * s);
  const torso = `M${p(-46, 76)}Q${p(-45, 46)} ${p(-21, 40)}L${p(-12, 38)}Q${p(0, 50)} ${p(12, 38)}L${p(21, 40)}Q${p(45, 46)} ${p(46, 76)}Z`;
  const neck = rect(n2(cx - 6.5 * s), n2(top + 28 * s), n2(13 * s), n2(14 * s), 0, paint(k.L));
  const head = circle(cx, n2(top + 18 * s), n2(16.5 * s), paint(k.L)) + crescent(cx, n2(top + 18 * s), n2(16.5 * s), 0.25) + glint(cx, n2(top + 18 * s), n2(16.5 * s), HI, 0.6);
  if (o.referee) {
    return (
      neck +
      path(torso, paint(CHALK, k.L, w)) +
      path(`M${p(-32, 50)}L${p(-32, 75)}M${p(-16, 44)}L${p(-16, 75)}M${p(0, 50)}L${p(0, 75)}M${p(16, 44)}L${p(16, 75)}M${p(32, 50)}L${p(32, 75)}`, ln(INK, n2(7 * s))) +
      path(`M${p(18, 43)}Q${p(42, 48)} ${p(43, 74)}L${p(0, 74)}L${p(0, 47)}Q${p(8, 45)} ${p(12, 40)}Z`, fo(SH, 0.22)) +
      path(`M${p(-13, 38)}Q${p(0, 51)} ${p(13, 38)}`, ln(INK, n2(5 * s))) +
      head
    );
  }
  return (
    neck +
    path(torso, paint(k.F, k.L, w)) +
    path(`M${p(-24, 75)}L${p(-24, 50)}L${p(-13, 39)}Q${p(0, 52)} ${p(13, 39)}L${p(24, 50)}L${p(24, 75)}Z`, paint(o.vest ?? k.C, k.L, n2(3 * s))) +
    path(`M${p(0, 46)}Q${p(8, 45)} ${p(13, 39)}L${p(24, 50)}L${p(24, 75)}L${p(0, 75)}Z`, fo(SH, 0.25)) +
    path(`M${p(-13, 39)}Q${p(0, 52)} ${p(13, 39)}`, lo(CHALK, n2(3 * s), 0.9)) +
    head +
    path(`M${p(-14.5, 11)}Q${p(0, 7)} ${p(14.5, 11)}`, ln(CHALK, n2(5.5 * s)))
  );
};

/** The planks of the court, each a butt joint or two along its length. */
const TW = 560;
const TH = 420;
const PLANK = 42;
const jointsOf = (row: number): [number, number] => {
  const a = (row * 197 + 83) % TW;
  const b = (a + 211 + row * 37) % TW;
  return a < b ? [a, b] : [b, a];
};
const planks = (): { seams: string; joints: string; lit: string } => {
  let seamsD = '';
  let joints = '';
  let lit = '';
  for (let row = 0; row < TH / PLANK; row++) {
    const y = PLANK / 2 + row * PLANK;
    seamsD += `M0 ${y}H${TW}`;
    const [a, b] = jointsOf(row);
    // The last plank lies across the seam of the tile: its joints are drawn in both halves.
    if (row === TH / PLANK - 1) joints += `M${a} ${y}V${TH}M${a} 0V${PLANK / 2}M${b} ${y}V${TH}M${b} 0V${PLANK / 2}`;
    else joints += `M${a} ${y}V${y + PLANK}M${b} ${y}V${y + PLANK}`;
    if (row % 3 === 1) lit += `M${a} ${y}H${b}V${y + PLANK}H${a}Z`;
  }
  return { seams: seamsD, joints, lit };
};

export const hardwood: Pack = {
  id: 'hardwood',
  name: 'Hardwood',
  summary: 'Basketball by arena light: orange leather, maple planks, chalk court lines and steel on espresso black',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 90,
  style: {
    // A sign-painter's court-line brush: one heavy, even stroke, corners eased, and every object
    // standing in the hard shadow of the arena lights.
    hand: { base: 'clean' },
    general: { weight: 'bold', corners: 'soft', depth: 'deep' },
    connectors: { weight: 'bold', head: 'triangle', colour: 'source' },
    schemes: {
      dark: scheme(
        { canvas: '#1c1511', grid: '#2b211a', text: '#f8f0e4', textMuted: '#bda78c', edge: '#cf9f63', edgeText: '#ecdcc2', edgeLabelBg: '#261c16', codeBg: '#231a14', codeBorder: '#46362b' },
        {
          neutral: ['#3b2a1b', '#d9a25b', '#fcf1de', '#f2c079'],
          teal: ['#10353b', '#4fcbd6', '#d9f8fa', '#86e3ea'],
          blue: ['#1c3054', '#74a9f3', '#e1edfe', '#9fc5fa'],
          violet: ['#32244f', '#b094f3', '#ede5fe', '#cab6fa'],
          amber: ['#48270c', '#f0873a', '#ffeedb', '#ffae68'],
          rose: ['#4a181d', '#f06a70', '#fde1e1', '#f8999d'],
          green: ['#18371f', '#64cf87', '#dbf7e4', '#92e2aa'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      // A plaque off the scorer's wall: a second line inside with its corners swept out like the
      // court's arcs, a steel bolt in each, and the ball at the top of the key.
      const finish = path('M9 108H339V117Q339 123 333 123H15Q9 123 9 117Z', fo(SH, 0.28)) + path('M16 7H332', lo(HI, 2.5, 0.45));
      const crest = ball(174, 14, 10) + path('M174 117V126', ln(k.C, 3.5));
      // An API is that plaque with a socket bitten out of its left edge and a live jack in it. Its
      // inner line stops short of the bottom-right corner, where the app writes "API".
      if (kind === 'api') {
        return (
          path('M3 47Q22 47 22 66Q22 85 3 85Z', fo(CYAN, 0.25)) +
          path('M3 53Q16 53 16 66Q16 79 3 79Z', paint(CYAN)) +
          path('M15 3H333Q345 3 345 15V117Q345 129 333 129H15Q3 129 3 117V90Q27 90 27 66Q27 42 3 42V15Q3 3 15 3Z', paint(k.F, k.L, 5)) +
          finish +
          path('M296 117H62Q62 91 36 91', lo(k.C, 2.5, 0.85)) +
          path('M36 41Q62 41 62 15H306Q306 41 333 41V84', lo(k.C, 2.5, 0.85)) +
          bolt(22, 22) +
          bolt(326, 22) +
          bolt(22, 110) +
          crest
        );
      }
      return (
        rect(3, 3, 342, 126, 12, paint(k.F, k.L, 5)) +
        finish +
        path('M42 15H306Q306 41 333 41V91Q306 91 306 117H42Q42 91 15 91V41Q42 41 42 15Z', lo(k.C, 2.5, 0.85)) +
        bolt(22, 22) +
        bolt(326, 22) +
        bolt(22, 110) +
        bolt(326, 110) +
        crest
      );
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A high-top mid-step, heel down and toe up, the floor rushing behind it: the one doing the running.
        case 'worker':
          return (
            ground(76, 99, 50) +
            path('M4 30H24M0 48H18M6 66H20', ln(k.C, 5)) +
            group(
              'translate(6 -5) rotate(-10 75 52)',
              path('M34 14H63L67 40Q94 46 112 59Q124 66 124 78H30Q25 48 34 14Z', paint(k.F, k.L, 5)) +
                path('M31 66H122Q124 70 124 78H30Z', fo(SH, 0.3)) +
                path('M100 52Q122 62 124 78H95Q93 64 100 52Z', paint(k.C, k.L, 3)) +
                path('M32 23H64', ln(k.C, 7)) +
                path('M69 43L80 36M78 47L89 40M87 51L98 44', ln(CHALK, 4)) +
                path('M38 30Q35 46 36 60', lo(HI, 3, 0.4)) +
                path('M26 78H126V84Q126 92 118 92H34Q26 92 26 84Z', paint(CHALK, k.L, 3)) +
                path('M30 87H122', lo(SH, 3, 0.35)),
            )
          );
        // Another building: the away arena, its pennant up over the dome.
        case 'external':
          return (
            ground(68, 99, 64) +
            path('M68 28V4', ln(k.L, 4.5)) +
            poly('70,4 98,11 70,19', paint(k.C)) +
            poly('70,11.5 98,11 70,19', fo(SH, 0.25)) +
            path('M16 52Q68 2 120 52Z', paint(k.F, k.L, 5)) +
            path('M68 27Q102 32 118 51H68Z', fo(SH, 0.3)) +
            path('M68 27V50M42 38L36 50M94 38L100 50', lo(k.L, 4, 0.85)) +
            poly('4,97 10,60 24,50 112,50 126,60 132,97', paint(k.F, k.L, 5)) +
            poly('68,53 111,53 123,62 129,94 68,94', fo(SH, 0.28)) +
            path('M19 70H117', ln(k.C, 10)) +
            path('M38 64V76M58 64V76M78 64V76M98 64V76', ln(k.F, 3.5)) +
            poly('57,97 57,83 79,83 79,97', paint(INK, k.L, 3.5))
          );
        // The shot clock: a boxed dial with the time that is left burning down.
        case 'scheduler':
          return (
            ground(68, 100, 46) +
            path('M38 86V98M98 86V98', ln(k.L, 6)) +
            rect(12, 5, 112, 83, 10, paint(k.F, k.L, 5)) +
            path('M20 9H116', lo(HI, 2.5, 0.45)) +
            path('M15 74H121V78Q121 85 114 85H22Q15 85 15 78Z', fo(SH, 0.28)) +
            circle(68, 46, 31, paint(INK, k.L, 3.5)) +
            path('M68 46V20A26 26 0 0 1 90.52 59Z', paint(ORANGE)) +
            path('M68 46V20A26 26 0 0 1 81 23.5Z', fo(ORANGE_HI, 0.6)) +
            path('M68 46V18M68 46L92 60', ln(CHALK, 4)) +
            path('M95 46h4M68 73v4M37 46h4', ln(CHALK, 3)) +
            circle(68, 46, 4.5, paint(CHALK)) +
            lamp(23, 16, 3.5, CYAN) +
            lamp(113, 16, 3.5, CYAN)
          );
        // The hoop, front-on: backboard, the shooter's square, the rim and its net. The one way in.
        case 'gateway':
          return (
            rect(12, 3, 112, 64, 5, paint(k.F, k.L, 5)) +
            poly('16,7 58,7 30,63 16,63', fo(HI, 0.1)) +
            path('M15 55H121V64H15Z', fo(SH, 0.25)) +
            rect(48, 28, 40, 30, 0, ln(k.C, 4)) +
            path('M42 71L54 100M94 71L82 100M55 73L61 100M81 73L75 100M68 74V100M47 83H89M51 93H85', ln(CHALK, 3)) +
            rect(62, 58, 12, 9, 0, paint(STEEL_SH)) +
            ellipse(68, 69, 29, 6, lo(ORANGE, 11, 0.25)) +
            ellipse(68, 69, 29, 6, ln(ORANGE, 5.5)) +
            path('M41 67Q52 62 68 62', lo(ORANGE_HI, 2, 0.9))
          );
        // The point guard's read: one ball, passed three ways.
        case 'load-balancer':
          return (
            path('M46 42L104 15M52 52H108M46 62L104 89', ln(k.L, 6.5)) +
            poly('124,6 110.5,23.5 101.5,5', paint(k.C, k.L, 2.5)) +
            poly('130,52 108,41.5 108,62.5', paint(k.C, k.L, 2.5)) +
            poly('124,98 101.5,99 110.5,80.5', paint(k.C, k.L, 2.5)) +
            circle(30, 52, 31, fo(ORANGE, 0.16)) +
            ball(30, 52, 25)
          );
        // The referee's whistle: it stands between the two sides and speaks for the game.
        case 'proxy':
          return (
            path('M96 22L102 7M112 25L125 12M80 22L76 7', ln(k.C, 5)) +
            path('M13 74Q4 98 36 100', ln(k.C, 4.5)) +
            circle(15, 66, 8, ln(STEEL, 4)) +
            path('M48 32H124V54H75.35A28 28 0 1 1 48 32Z', paint(k.F, k.L, 5)) +
            crescent(48, 60, 28, 0.32) +
            poly('110,34.5 121.5,34.5 121.5,51.5 110,51.5', paint(k.C)) +
            poly('60,32 88,32 83,44 65,44', paint(INK, k.L, 3)) +
            path('M26 50Q30 38 44 35H104', lo(HI, 3, 0.45)) +
            circle(48, 64, 8, paint(k.C, k.L, 3))
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // The ball rack: two shelves, everything kept in its place.
        case 'generic':
          return (
            ground(70, 104, 60) +
            path('M22 94V102M118 94V102', ln(k.L, 5)) +
            rect(8, 5, 124, 90, 6, paint(k.F, k.L, 5)) +
            path('M14 9H126', lo(HI, 2.5, 0.45)) +
            ball(33, 30, 16) +
            ball(70, 30, 16) +
            ball(107, 30, 16) +
            ball(33, 73, 16) +
            ball(70, 73, 16) +
            ball(107, 73, 16) +
            path('M11 54H129V92H11Z', fo(SH, 0.32)) +
            path('M8 50H132', ln(k.L, 6)) +
            path('M10 48.5H130', lo(HI, 2, 0.4))
          );
        // The stat sheet on its clipboard: ruled rows, a column of marks, a header.
        case 'sql':
          return (
            ground(70, 104, 54) +
            rect(16, 9, 108, 94, 8, paint(k.L)) +
            path('M16 88H124V95Q124 103 116 103H24Q16 103 16 95Z', fo(SH, 0.35)) +
            path('M22 12.5H118', lo(HI, 2.5, 0.5)) +
            rect(25, 20, 90, 75, 3, paint(k.F)) +
            rect(25, 30, 90, 13, 0, paint(k.C)) +
            path('M56 43V95', lo(k.L, 3, 0.7)) +
            path('M34 56H47M34 69H47M34 82H47', ln(k.C, 5.5)) +
            path('M65 56H106M65 69H96M65 82H102', ln(k.T, 5.5)) +
            poly('48,2 92,2 92,11 101,11 101,25 39,25 39,11 48,11', paint(STEEL, STEEL_SH, 1.5)) +
            path('M51 5.5H89', lo(WHITE, 2.5, 0.7)) +
            path('M41 21H99', lo(STEEL_SH, 3, 0.6))
          );
        // The gym bag: a ball, a bottle and whatever else went in, nothing alike.
        case 'nosql':
          return (
            ground(70, 104, 60) +
            path('M38 46Q70 0 102 46', ln(k.L, 5)) +
            ball(45, 30, 19) +
            rect(84, 13, 22, 34, 4, paint(STEEL, STEEL_SH, 1.5)) +
            rect(87, 16, 5, 28, 0, fo(WHITE, 0.5)) +
            rect(88, 4, 14, 10, 2, paint(CYAN, INK, 1.5)) +
            path('M10 54Q10 42 22 42H118Q130 42 130 54V90Q130 102 118 102H22Q10 102 10 90Z', paint(k.F, k.L, 5)) +
            path('M13 84H127V90Q127 99 118 99H22Q13 99 13 90Z', fo(SH, 0.3)) +
            path('M29 45V99M111 45V99', ln(k.C, 6)) +
            path('M40 52H100', lo(k.L, 3, 0.8)) +
            path('M16 46H124', lo(HI, 2.5, 0.4)) +
            circle(51, 74, 7.5, ln(k.T, 4)) +
            path('M64 67h14v14h-14zM86 82l8.5 -15l8.5 15z', ln(k.T, 4))
          );
        // A ball already gone: quick off the hands, a bolt across it, and not for keeping.
        case 'cache':
          return (
            path('M4 32H30M0 54H24M6 76H30', ln(k.C, 5.5)) +
            circle(82, 54, 41, paint(k.F, k.L, 5)) +
            crescent(82, 54, 41, 0.3) +
            seams(82, 54, 41, k.L, 3.5) +
            glint(82, 54, 41, HI, 0.5) +
            poly('94,12 58,60 78,60 66,98 108,48 86,48', lo(CYAN, 9, 0.25)) +
            poly('94,12 58,60 78,60 66,98 108,48 86,48', paint(CYAN, INK, 2)) +
            poly('91,20 66,56 79,56', fo(WHITE, 0.6))
          );
        // The locker row: three doors, each with its vents and its latch.
        case 'file-system':
          return (
            ground(70, 104, 62) +
            path('M16 96V102M124 96V102', ln(k.L, 5)) +
            rect(6, 4, 128, 92, 4, paint(k.F, k.L, 5)) +
            poly('50,7 90,7 90,93 50,93', fo(k.C, 0.3)) +
            path('M9 76H131V93H9Z', fo(SH, 0.28)) +
            path('M48 4V96M92 4V96', ln(k.L, 4.5)) +
            path('M16 19H38M16 29H38M60 19H82M60 29H82M102 19H124M102 29H124', ln(k.L, 4)) +
            path('M36 50v16M80 50v16M122 50v16', ln(STEEL, 5.5)) +
            path('M35 50v7M79 50v7M121 50v7', lo(WHITE, 2, 0.7)) +
            path('M11 8H129', lo(HI, 2.5, 0.45)) +
            poly('62,78 78,78 78,88 62,88', paint(ORANGE, SEAM, 1.5))
          );
        // The ball cart: a wire bin on wheels, heaped full of whatever is thrown in.
        case 'object-storage':
          return (
            ground(70, 105, 54, 3) +
            ball(40, 31, 17) +
            ball(100, 31, 17) +
            ball(70, 23, 19) +
            poly('10,40 130,40 118,90 22,90', paint(k.F, k.L, 5)) +
            poly('100,43 127,43 116,87 96,87', fo(SH, 0.28)) +
            path('M41 44L45 87M70 44V87M99 44L95 87M17 65H123', lo(k.L, 3.5, 0.8)) +
            path('M8 40H132', ln(k.L, 7)) +
            path('M10 38.5H130', lo(HI, 2, 0.5)) +
            path('M32 90V96M108 90V96', ln(k.L, 4.5)) +
            circle(32, 98, 5, paint(STEEL, STEEL_SH, 1.5)) +
            circle(108, 98, 5, paint(STEEL, STEEL_SH, 1.5))
          );
        // The scout's glass over the court: finding the one spot on the floor.
        case 'search-index':
          return (
            path('M88 78L124 100', ln(k.L, 14)) +
            path('M93 81L121 98', ln(MAPLE, 7)) +
            path('M93 79L119 95', lo(HI, 2, 0.5)) +
            circle(56, 48, 41, paint(k.F, k.L, 6)) +
            crescent(56, 48, 41, 0.28) +
            path('M56 10V86', ln(k.C, 4.5)) +
            circle(56, 48, 16, paint(k.F, k.C, 4.5)) +
            circle(56, 48, 6, paint(ORANGE)) +
            path('M24 38Q30 20 48 14', lo(WHITE, 4.5, 0.55))
          );
        // The standings board, hung from the rafters: a header and a strict grid, one cell lit.
        case 'table':
          return (
            path('M32 0V11M108 0V11', ln(STEEL, 4.5)) +
            rect(4, 10, 132, 92, 6, paint(k.F, k.L, 5)) +
            rect(7, 13, 126, 19, 3, paint(k.C)) +
            path('M11 16H129', lo(WHITE, 2.5, 0.45)) +
            path('M7 86H133V99H7Z', fo(SH, 0.25)) +
            rect(50, 56, 42, 21, 0, fo(CYAN, 0.28)) +
            path('M7 33H133M7 56H133M7 78H133M49 33V99M92 33V99', ln(k.L, 3)) +
            path('M15 44.5H41M15 67H41M15 89H41M100 44.5H125M100 67H117M100 89H125M58 44.5H84M58 89H76', lo(k.T, 4.5, 0.8)) +
            path('M58 67H84', ln(CYAN, 5))
          );
      }
    },

    queue: (k, kind) => {
      const plate = rect(3, 3, 270, 58, 12, paint(k.F, k.L, 4.5)) + path('M8 49H268V52Q268 58 261 58H15Q8 58 8 52Z', fo(SH, 0.28)) + path('M14 6.5H262', lo(HI, 2.5, 0.4));
      switch (kind) {
        // Balls waiting their turn at the line: the one at the front is live, and next out.
        case 'queue':
          return (
            plate +
            ball(36, 32, 17, k.C, INK, WHITE) +
            ball(80, 32, 17, k.C, INK, WHITE) +
            ball(124, 32, 17, k.C, INK, WHITE) +
            circle(170, 32, 24, fo(ORANGE, 0.22)) +
            ball(170, 32, 19) +
            path('M204 9V55', ln(CHALK, 4.5)) +
            path('M220 17L235 32L220 47M242 17L257 32L242 47', ln(k.C, 6))
          );
        // The arena horn: one call, carried out to three different pennants.
        case 'topic':
          return (
            plate +
            poly('13,23 29,23 57,9 57,55 29,41 13,41', paint(STEEL, STEEL_SH, 1.5)) +
            poly('13,23 29,23 57,9 57,20 29,31 13,31', fo(WHITE, 0.45)) +
            poly('29,36 57,44 57,55 29,41', fo(SH, 0.3)) +
            rect(56, 6, 8, 52, 2, paint(ORANGE, SEAM, 1.5)) +
            path('M78 20Q89 32 78 44M100 14Q117 32 100 50M124 9Q147 32 124 55', ln(k.C, 5.5)) +
            path('M172 9V55M204 9V55M236 9V55', ln(CHALK, 3.5)) +
            poly('172,11 198,22 172,33', paint(k.A('rose', 'chip'))) +
            poly('204,11 230,22 204,33', paint(CYAN)) +
            poly('236,11 262,22 236,33', paint(k.A('green', 'chip'))) +
            path('M172 22H198L172 33ZM204 22H230L204 33ZM236 22H262L236 33Z', fo(SH, 0.25))
          );
        // The fast break: a ball already down the floor, and the streak it leaves.
        case 'stream':
          return (
            poly('20,3 273,3 256,61 3,61', paint(k.F, k.L, 4.5)) +
            poly('9,50 262,50 260,58 7,58', fo(SH, 0.28)) +
            poly('34,19 208,12 208,25', fo(k.C, 0.55)) +
            poly('16,32 204,24 204,40', fo(k.C, 0.95)) +
            poly('42,45 208,39 208,52', fo(k.C, 0.55)) +
            circle(226, 32, 26, fo(ORANGE, 0.22)) +
            ball(226, 32, 21)
          );
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A player: bare shoulders, a plain vest and a sweatband.
        case 'human':
          return player(k, 60, 3, 1.02);
        // A team: three of them, the captain in front.
        case 'group':
          return player(k, 25, 22, 0.76) + player(k, 95, 22, 0.76) + path('M2 80Q4 60 18 54H102Q116 60 118 80Z', fo(SH, 0.3)) + player(k, 60, 6, 0.98);
        // The referee: not on either side, in the stripes that say so.
        case 'thirdParty':
          return player(k, 60, 3, 1.02, { referee: true });
        // The scorer's table: the console that runs the game, its board lit.
        case 'system':
          return (
            ground(60, 79, 56, 3) +
            rect(36, 3, 48, 24, 4, paint(k.F, k.L, 4)) +
            path('M44 11H76M44 19H64', ln(CYAN, 4)) +
            poly('12,26 108,26 117,38 3,38', paint(k.L)) +
            poly('12,26 108,26 110.5,29.5 9.5,29.5', fo(HI, 0.5)) +
            poly('8,38 112,38 108,76 12,76', paint(k.F, k.L, 4.5)) +
            poly('82,40 110,40 106.5,74 82,74', fo(SH, 0.25)) +
            path('M19 50H101', ln(k.C, 8)) +
            lamp(30, 65, 4.5, CYAN) +
            lamp(60, 65, 4.5, ORANGE) +
            lamp(90, 65, 4.5, k.C)
          );
        // The courtside tablet: a play drawn up on its screen.
        case 'device':
          return (
            rect(40, 3, 40, 76, 7, paint(k.F, k.L, 4.5)) +
            rect(45, 10, 30, 54, 2, paint(INK, k.L, 2)) +
            poly('46,11 63,11 46,42', fo(WHITE, 0.1)) +
            path('M62 18l8 8M70 18l-8 8', ln(ORANGE, 3.5)) +
            path('M54 47Q54 33 65 34', ln(CYAN, 3.2)) +
            poly('71,34.5 64,29.5 64,39', paint(CYAN)) +
            circle(54, 54, 4.8, ln(CHALK, 3.2)) +
            circle(60, 71.5, 3.2, paint(k.C))
          );
        // The ball boy: a little round robot, seamed like a ball, with a visor and two lit eyes.
        case 'agent':
          return (
            ground(60, 79.5, 30, 2.5) +
            path('M60 12V7', ln(k.L, 4)) +
            circle(60, 5.5, 4.5, paint(ORANGE, SEAM, 1.5)) +
            path('M29 52L13 62M91 52L107 62', ln(k.L, 6.5)) +
            poly('41,70 55,70 55,79 38,79', paint(k.L)) +
            poly('79,70 65,70 65,79 82,79', paint(k.L)) +
            circle(60, 44, 33, paint(k.F, k.L, 5)) +
            crescent(60, 44, 33, 0.3) +
            path('M34 24Q46 44 34 64M86 24Q74 44 86 64', lo(k.L, 3.5, 0.9)) +
            rect(39, 30, 42, 21, 10, paint(INK, k.L, 2.5)) +
            rect(45, 34.5, 11, 12, 3, fo(CYAN, 0.28)) +
            rect(64, 34.5, 11, 12, 3, fo(CYAN, 0.28)) +
            rect(47, 36.5, 7, 8, 2, paint(CYAN)) +
            rect(66, 36.5, 7, 8, 2, paint(CYAN)) +
            path('M38 30Q43 20 54 15', lo(HI, 3, 0.5)) +
            path('M51 62H69', ln(k.C, 4.5))
          );
      }
    },

    // A length of the floor: one plank between its seams, a butt joint or two, the sideline
    // painted down its left end and the corner of an arc at its right.
    componentCard: (k) =>
      rect(3, 3, 294, 102, 6, paint(k.F, k.L, 5)) +
      path('M6 92H294V102H6Z', fo(SH, 0.28)) +
      path('M28 16H294M28 92H294M96 6V16M214 6V16M150 92V102M248 92V102', lo(k.L, 2.5, 0.5)) +
      path('M10 7H290', lo(HI, 2.5, 0.4)) +
      path('M17 6V102', ln(k.C, 8)) +
      path('M264 6Q264 36 294 36', lo(k.C, 3.5, 0.9)),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // One floor panel, lifted out: planks on its face and a length of painted line across it.
        case 'module':
          return (
            ground(60, 97, 52, 4) +
            poly('4,38 60,68 60,93 4,63', paint(k.F, k.L, 5)) +
            poly('4,38 60,68 60,93 4,63', fo(SH, 0.3)) +
            poly('60,68 116,38 116,63 60,93', paint(k.F, k.L, 5)) +
            poly('60,68 116,38 116,63 60,93', fo(SH, 0.55)) +
            poly('60,8 116,38 60,68 4,38', paint(k.F, k.L, 5)) +
            poly('60,10 8,38 60,38', fo(HI, 0.1)) +
            path('M41.3 18L97.3 48M22.7 28L78.7 58M72 19.5L53.4 29.5M47 41L28.4 51', lo(k.L, 3, 0.7)) +
            path('M96 28L40 58', ln(k.C, 7))
          );
        // The pump, its hose and the needle in the ball: what joins one thing to another.
        case 'adapter':
          return (
            ground(34, 100, 28, 3) +
            ball(88, 40, 27) +
            path('M46 84Q84 106 85 67', ln(k.L, 5.5)) +
            poly('81,64 89,64 87.5,72 82.5,72', paint(STEEL, STEEL_SH, 1.5)) +
            path('M33 34V14', ln(STEEL, 5.5)) +
            path('M14 12H52', ln(k.L, 9)) +
            path('M16 10H50', lo(HI, 2.5, 0.5)) +
            rect(20, 32, 26, 62, 5, paint(k.F, k.L, 5)) +
            rect(36, 35, 7.5, 56, 0, fo(SH, 0.28)) +
            rect(22.5, 46, 21, 10, 0, paint(k.C)) +
            path('M12 97H54', ln(k.L, 6))
          );
        // The rim from above, bolted to the board: a ring waiting for something to drop through.
        case 'port':
          return (
            path('M12 6H108', ln(k.C, 7)) +
            poly('45,9 75,9 71,26 49,26', paint(k.L)) +
            circle(60, 58, 36, paint(INK, k.L, 9)) +
            path('M60 27V41M60 75V89M29 58H43M77 58H91M38 36L48 46M82 36L72 46M38 80L48 70M82 80L72 70', lo(CHALK, 3, 0.75)) +
            circle(60, 58, 17, lo(CHALK, 3, 0.85)) +
            path('M28 42Q36 27 52 22', lo(HI, 3.5, 0.6)) +
            path('M94 70Q88 88 68 94', lo(SH, 5, 0.45))
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A play sheet: a dog-eared page of Xs, Os and the cut to the basket.
        case 'file':
          return (
            poly('8,4 58,4 78,24 78,96 8,96', paint(k.F, k.L, 4.5)) +
            poly('10.5,84 75.5,84 75.5,93.5 10.5,93.5', fo(SH, 0.25)) +
            poly('58,4 58,24 78,24', paint(k.L)) +
            poly('58,4 58,24 68,24', fo(HI, 0.4)) +
            path('M21 26l12 12M33 26l-12 12M52 44l12 12M64 44l-12 12', ln(k.C, 4.5)) +
            path('M24 68Q24 52 40 52', ln(k.T, 3.5)) +
            poly('47,52 39,46 39,58', paint(k.T)) +
            circle(24, 77, 6.5, ln(k.T, 3.5)) +
            circle(58, 77, 6.5, ln(k.T, 3.5))
          );
        // The coach's whiteboard on its easel: three sliders, each set somewhere else.
        case 'config':
          return (
            path('M20 78L13 97M66 78L73 97', ln(k.L, 5)) +
            rect(4, 5, 78, 74, 5, paint(k.F, k.L, 4.5)) +
            path('M9 8.5H77', lo(HI, 2.5, 0.45)) +
            path('M7 68H79V76H7Z', fo(SH, 0.25)) +
            path('M14 23H72M14 41H72M14 59H72', lo(k.L, 4, 0.85)) +
            circle(30, 23, 7, paint(k.C, INK, 1.5)) +
            circle(56, 41, 10.5, fo(ORANGE, 0.25)) +
            circle(56, 41, 7, paint(ORANGE, SEAM, 1.5)) +
            circle(38, 59, 7, paint(k.C, INK, 1.5)) +
            path('M8 82H78', ln(STEEL, 5))
          );
        // The padlock off a locker door.
        case 'secret':
          return (
            path('M24 46V30Q24 8 43 8Q62 8 62 30V46', ln(STEEL_SH, 12)) +
            path('M24 46V30Q24 8 43 8Q62 8 62 30V46', ln(STEEL, 7.5)) +
            path('M22.5 34Q21 13 39 9.5', lo(WHITE, 2.5, 0.7)) +
            rect(9, 42, 68, 55, 9, paint(k.F, k.L, 5)) +
            path('M12 84H74V87Q74 94 67 94H19Q12 94 12 87Z', fo(SH, 0.3)) +
            path('M17 46H69', lo(HI, 2.5, 0.45)) +
            circle(43, 69, 16, lo(k.C, 3.5, 0.95)) +
            circle(43, 65, 6.5, paint(INK)) +
            poly('40,66 46,66 48.5,80 37.5,80', paint(INK))
          );
        // A medal on its ribbon: plain, and won.
        case 'certificate':
          return (
            poly('12,2 33,2 48,36 31,44', paint(k.C, INK, 1.5)) +
            poly('74,2 53,2 38,36 55,44', paint(k.C, INK, 1.5)) +
            poly('74,2 53,2 38,36 55,44', fo(SH, 0.38)) +
            poly('12,2 22,2 39,40 31,44', fo(WHITE, 0.3)) +
            circle(43, 67, 29, paint(k.F, k.L, 5)) +
            crescent(43, 67, 29, 0.3) +
            circle(43, 67, 20, lo(k.C, 3, 0.9)) +
            poly('43,54 46.5,62.2 55.4,63 48.7,68.8 50.6,77.5 43,73 35.4,77.5 37.3,68.8 30.6,63 39.5,62.2', paint(MAPLE, MAPLE_SH, 1.2)) +
            poly('43,54 43,73 35.4,77.5 37.3,68.8 30.6,63 39.5,62.2', fo(WHITE, 0.35)) +
            path('M19 56Q25 44 37 40', lo(HI, 3, 0.55))
          );
      }
    },

    // The centre circle: a ring with the half-court line running up to it and away again, its
    // middle left empty for the word.
    junction: (k) =>
      path('M50 2V12M50 88V98', ln(k.C, 5)) +
      circle(50, 50, 38, paint(k.F, k.L, 6)) +
      circle(50, 50, 30, lo(k.C, 2.5, 0.85)) +
      path('M18 40Q23 24 40 17', lo(HI, 3, 0.5)) +
      path('M83 60Q78 77 61 83', lo(SH, 4, 0.45)),
  },

  // The court by arena light: maple planks with a staggered butt joint here and there, a few of
  // them catching the light, a painted lane line running the length of the floor, the arc that
  // springs from it, two hash marks and a strip of tape someone left behind.
  backdrop: {
    tile: [TW, TH],
    draw: () => {
      const wood = planks();
      return (
        path(wood.lit, paint('#201813')) +
        path(wood.seams, ln('#2a2019', 1.25)) +
        path(wood.joints, ln('#2d221b', 1.25)) +
        path('M404 0V420', lo(CHALK, 2.5, 0.055)) +
        path('M404 82A108 108 0 0 0 404 298', lo(CHALK, 2.5, 0.055)) +
        path('M404 334h16M404 366h16', lo(CHALK, 2.5, 0.055)) +
        path('M118 300l8 8M126 300l-8 8', lo(ORANGE, 1.5, 0.13)) +
        path('M236 120h12', lo(CYAN, 1.5, 0.1))
      );
    },
  },
};

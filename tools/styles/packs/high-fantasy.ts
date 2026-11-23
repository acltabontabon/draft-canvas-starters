import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * High fantasy: a storybook realm, painted like a plate in an illuminated book. Iron-gall ink,
 * burnished gold leaf, lapis, vermilion and verdigris on vellum. Every kind of shape is its own
 * thing from that world, told apart by its outline: a worker is an anvil under a hammer, a cache a
 * potion flask with a bolt in it, a queue a row of rune stones with the next one gilded, an agent
 * an owl familiar. Cards are illuminated panels: a painted head band set with gold, a vine in the
 * margin, and a calm vellum field for the name. Light falls from the top left; gold glints there.
 * Always light: it is a page from a book.
 */

/** The illuminator's pigments. They stay as they are whatever colour a shape is given. */
const GOLD = '#e2aa1c';
const GOLD_D = '#9c6a0a';
const GOLD_H = '#fff2b4';
const LAPIS = '#2748a0';
const VERM = '#cf3a22';
const VERD = '#2e8b6c';
const VELLUM = '#fff9e6';

const o = (attrs: string, opacity: number) => `${attrs} opacity="${opacity}"`;

/** A thing with an inside: the shape's fill inside its ink outline. */
const body = (k: Kit, w = 5) => paint(k.F, k.L, w);
/** A solid dark part: iron, a roof, a hood. Stroked in its own colour so its corners are round too. */
const dark = (k: Kit, w = 3) => paint(k.L, k.L, w);
/** A pen mark, in the shape's ink. */
const ink = (k: Kit, w = 3.5) => paint('none', k.T, w);
/** A bare line in the outline's colour. */
const line = (k: Kit, w = 5) => paint('none', k.L, w);
/** Gold leaf, edged in its darker burnish. */
const gold = (w = 2.5) => paint(GOLD, GOLD_D, w);
/** The side turned away from the light: a wash of the shape's own ink. */
const sh = (k: Kit, d: string, opacity = 0.22) => path(d, o(paint(k.L), opacity));
/** The burnished side of a piece of gold. */
const burn = (d: string, opacity = 0.5) => path(d, o(paint(GOLD_D), opacity));
/** Light caught along an edge: a stroke of bare vellum. */
const hi = (d: string, w = 3, opacity = 0.8) => path(d, o(paint('none', VELLUM, w), opacity));
/** A glint on gold. */
const glint = (d: string, w = 2.5) => path(d, paint('none', GOLD_H, w));
/** The shadow a standing thing throws on the page. */
const ground = (k: Kit, cx: number, cy: number, rx: number, ry = 3.5) => ellipse(cx, cy, rx, ry, o(paint(k.T), 0.16));

/** A cut gem, point up, `rx` by `ry` about its centre. */
const gem = (cx: number, cy: number, rx: number, ry: number, attrs: string) => poly(`${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`, attrs);
/** The outline of a four-pointed star, to put in a path. */
const starD = (cx: number, cy: number, r: number) => {
  const s = Math.round(r * 26) / 100;
  return `M${cx} ${cy - r}L${cx + s} ${cy - s}L${cx + r} ${cy}L${cx + s} ${cy + s}L${cx} ${cy + r}L${cx - s} ${cy + s}L${cx - r} ${cy}L${cx - s} ${cy - s}Z`;
};
/** Little gilt stars, as many as are given: [cx, cy, r]. The first, if large, is edged. */
const stars = (...at: [number, number, number][]) => path(at.map(([x, y, r]) => starD(x, y, r)).join(''), paint(GOLD, GOLD_D, 1.5));

/**
 * An illuminated panel: a painted band across its head set with gold lozenges and a boss, ruled in
 * gold beneath. Its lower right corner is left bare: the app writes a small tag there.
 */
const panel = (k: Kit) =>
  rect(3, 3, 342, 126, 6, body(k, 5.5)) +
  path('M6 10Q6 6 10 6H338Q342 6 342 10V22H6Z', paint(k.L)) +
  hi('M12 9.5H336', 2, 0.35) +
  path('M6 24.5H342', paint('none', GOLD, 3.5)) +
  sh(k, 'M6 26.5H342V32H6Z', 0.13) +
  path([22, 46, 70, 94, 118, 142, 206, 230, 254, 278, 302, 326].map((x) => `M${x} 9.5l5 5l-5 5l-5-5Z`).join(''), paint(GOLD)) +
  gem(174, 16, 18, 12, gold(2.5)) +
  gem(174, 16, 8, 5.5, paint(VERM)) +
  glint('M161 15L173 7') +
  path('M52 119H292', paint('none', GOLD, 3)) +
  path('M52 113l6 6l-6 6l-6-6ZM292 113l6 6l-6 6l-6-6Z', paint(GOLD)) +
  path('M340.5 35V124.5H10', o(paint('none', k.L, 3), 0.16));

/** A vine in the margin, from `top` down: a verdigris stem, gold leaves, a vermilion berry. */
const vine = (x: number, top: number) =>
  path(`M${x} ${top}q-7 9 0 18t0 18t0 18t0 18`, paint('none', VERD, 3)) +
  path(`M${x + 2} ${top + 6}q9-5 12 3q-8 4-12-3ZM${x - 2} ${top + 30}q-9-5-12 3q8 4 12-3ZM${x + 2} ${top + 48}q9-5 12 3q-8 4-12-3Z`, paint(GOLD, GOLD_D, 1.5)) +
  circle(x, top + 76, 4, paint(VERM));

/** A hooded wanderer, head and shoulders: a cloak, a dark hood and the face in it. */
const wanderer = (k: Kit, cx: number, base: number, s: number, leader = true) => {
  const x = (value: number) => Math.round((cx + value * s) * 10) / 10;
  const y = (value: number) => Math.round((base - value * s) * 10) / 10;
  const cloak =
    path(`M${x(-40)} ${y(0)}Q${x(-40)} ${y(34)} ${x(0)} ${y(36)}Q${x(40)} ${y(34)} ${x(40)} ${y(0)}Z`, body(k, 5)) +
    sh(k, `M${x(12)} ${y(33)}Q${x(37)} ${y(30)} ${x(37.5)} ${y(2.5)}H${x(20)}Q${x(24)} ${y(22)} ${x(12)} ${y(33)}Z`, 0.24);
  const face = ellipse(x(0), y(49), 14 * s, 16 * s, paint(VELLUM));
  // Those standing behind wear a plain round hood: three peaks in a row read as horns.
  if (!leader) {
    return cloak + path(`M${x(-24)} ${y(33)}Q${x(-33)} ${y(76)} ${x(0)} ${y(77)}Q${x(33)} ${y(76)} ${x(24)} ${y(33)}Q${x(0)} ${y(22)} ${x(-24)} ${y(33)}Z`, dark(k)) + face;
  }
  return (
    cloak +
    path(`M${x(-24)} ${y(33)}Q${x(-34)} ${y(58)} ${x(-10)} ${y(70)}L${x(9)} ${y(78)}Q${x(8)} ${y(68)} ${x(18)} ${y(60)}Q${x(29)} ${y(48)} ${x(24)} ${y(33)}Q${x(0)} ${y(22)} ${x(-24)} ${y(33)}Z`, dark(k)) +
    hi(`M${x(-22)} ${y(42)}Q${x(-24)} ${y(58)} ${x(-8)} ${y(67)}`, 2.5, 0.45) +
    face +
    gem(x(0), y(19), 8 * s, 9 * s, gold(2)) +
    hi(`M${x(-33)} ${y(6)}Q${x(-31)} ${y(24)} ${x(-14)} ${y(30)}`, 3, 0.8)
  );
};

/** A standing stone on the road. */
const stone = (k: Kit, c: number, lit = false) =>
  path(`M${c - 19} 59V26Q${c - 19} 5 ${c} 5Q${c + 19} 5 ${c + 19} 26V59Z`, lit ? paint(GOLD, GOLD_D, 5) : body(k, 5)) +
  (lit
    ? burn(`M${c + 4} 8Q${c + 16.5} 11 ${c + 16.5} 26V56.5H${c + 8}V26Q${c + 8} 14 ${c + 4} 8Z`)
    : sh(k, `M${c + 4} 8Q${c + 16.5} 11 ${c + 16.5} 26V56.5H${c + 8}V26Q${c + 8} 14 ${c + 4} 8Z`));

/** A rolled scroll standing in a basket, leaning by `turn` degrees. */
const rolled = (k: Kit, cx: number, cy: number, turn: number, band: string) =>
  group(
    `translate(${cx} ${cy}) rotate(${turn})`,
    rect(-10, -52, 20, 58, 0, body(k, 4.5)) + rect(2, -49, 6, 52, 0, o(paint(k.L), 0.2)) + path('M-10 -26H10', paint('none', band, 7)) + ellipse(0, -52, 10, 4.5, paint(VELLUM, k.L, 3.5)),
  );

export const highFantasy: Pack = {
  id: 'high-fantasy',
  name: 'High fantasy',
  summary: 'An illuminated storybook in gold leaf and lapis: keeps, cauldrons, rune stones and an owl familiar',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 50,
  style: {
    hand: { base: 'draft', wobble: 'calm' },
    general: { shadow: false },
    connectors: { weight: 'fine' },
    schemes: {
      light: scheme(
        { canvas: '#f4ebd3', grid: '#e3d6b4', text: '#2a1d14', textMuted: '#6b5434', edge: '#6f5a3c', edgeText: '#5c4628', edgeLabelBg: '#fbf5e3', codeBg: '#efe4c6', codeBorder: '#d6c69c' },
        {
          neutral: ['#fbf3dc', '#4e3b26', '#2a1d14', '#7a6248'],
          teal: ['#cfe9dc', '#1c7059', '#0b3a2d', '#2e8b6c'],
          blue: ['#d3dff6', '#23449a', '#11245a', '#3559b0'],
          violet: ['#e6d8f2', '#643a96', '#34175a', '#7a4fae'],
          amber: ['#f9e3a0', '#96660a', '#483104', '#b8860f'],
          rose: ['#f9d6c9', '#b22c1a', '#5a1109', '#c8321f'],
          green: ['#dce9c0', '#44722a', '#213f0f', '#5a8a34'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      switch (kind) {
        // An illuminated panel, a vine climbing its left margin.
        case 'generic':
          return panel(k) + vine(17, 38);
        // The same, with a drop-cap tile in lapis and a golden door in it: the thing others come to.
        case 'api':
          return (
            panel(k) +
            rect(12, 38, 34, 42, 3, paint(LAPIS, GOLD, 3.5)) +
            path('M20 75V57Q20 46 29 46Q38 46 38 57V75Z', gold(2)) +
            burn('M29 46Q38 46 38 57V75H31V52Q31 48 29 46Z') +
            circle(26, 62, 2.5, paint(LAPIS)) +
            path(starD(29, 96, 9) + starD(17, 110, 4), paint(GOLD, GOLD_D, 1.5))
          );
      }
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // An anvil, a hammer coming down on it and sparks flying: work being done.
        case 'worker':
          return (
            ground(k, 71, 99.5, 50) +
            path('M6 60L40 54H128V68H102Q89 69 89 79Q89 87 106 90V98H36V90Q53 87 53 79Q53 70 38 69Q18 68 6 60Z', body(k, 5.5)) +
            sh(k, 'M46 69.5H96Q89 72 89 79Q89 87 106 90V95.5H36V90Q53 87 53 79Q53 72 46 69.5Z', 0.26) +
            hi('M42 58.5H124') +
            group(
              'translate(74 27) rotate(-24)',
              path('M-22 0H34', paint('none', GOLD_D, 7)) + rect(-42, -16, 27, 32, 3, dark(k, 3)) + rect(-35, -17.5, 7, 35, 0, paint(GOLD)) + hi('M-25 -12H-18', 2.5, 0.5),
            ) +
            path(starD(18, 38, 13), gold(2)) +
            stars([12, 14, 6], [116, 36, 8], [124, 14, 4.5])
          );
        // A far-off tower on its hill under a gilt moon, a path winding up to it: somewhere not ours.
        case 'external':
          return (
            path('M118 6A15 15 0 1 0 130 30A12 12 0 0 1 118 6Z', gold(2)) +
            stars([20, 20, 8], [34, 46, 4.5], [102, 44, 4]) +
            rect(50, 36, 36, 46, 0, body(k, 5)) +
            sh(k, 'M72 38.5H83.5V80H72Z') +
            hi('M54.5 40V70', 2.5) +
            rect(63.5, 46, 9, 14, 4.5, paint(GOLD, k.T, 2.5)) +
            poly('40,38 68,10 96,38', dark(k, 3)) +
            hi('M51 33L67 17', 3, 0.5) +
            circle(68, 8, 4.5, gold(2)) +
            path('M4 100Q34 98 46 82Q68 62 90 82Q102 98 132 100Z', body(k, 5)) +
            sh(k, 'M70 70Q82 73 90 82Q101 96 124 97.5H84Q92 86 70 70Z') +
            path('M34 99Q80 95 64 88Q55 83 64 78', paint('none', GOLD_D, 3.5))
          );
        // An hourglass in its frame, the golden sand running.
        case 'scheduler':
          return (
            path('M30 14V90M106 14V90', line(k, 5)) +
            path('M42 14H94Q94 40 75 52Q94 64 94 90H42Q42 64 61 52Q42 40 42 14Z', body(k, 5)) +
            sh(k, 'M82 16.5H91.5Q91 39 73 52Q91 65 91.5 87.5H82Q82 66 66 52Q82 38 82 16.5Z', 0.18) +
            path('M50 28H86Q82 41 68 49Q54 41 50 28Z', paint(GOLD)) +
            burn('M68 28H86Q82 41 68 49Z') +
            path('M46 87Q68 58 90 87Z', paint(GOLD)) +
            burn('M68 67Q82 74 90 87H68Z') +
            path('M68 49V68', paint('none', GOLD, 3)) +
            hi('M48.5 20Q49 34 58 43', 3.5, 0.9) +
            rect(20, 4, 96, 11, 3, dark(k, 3)) +
            rect(20, 89, 96, 11, 3, dark(k, 3)) +
            hi('M25 7.5H111M25 92.5H111', 2, 0.4) +
            path('M30 5l4.5 4.5l-4.5 4.5l-4.5-4.5ZM106 5l4.5 4.5l-4.5 4.5l-4.5-4.5ZM30 90l4.5 4.5l-4.5 4.5l-4.5-4.5ZM106 90l4.5 4.5l-4.5 4.5l-4.5-4.5Z', paint(GOLD))
          );
        // A castle gate between two towers, the gilded portcullis half down: the one way in.
        case 'gateway':
          return (
            path('M8 100V8H18V16H26V8H36V34H46V26H58V34H78V26H90V34H100V8H110V16H118V8H128V100Z', body(k, 5.5)) +
            sh(k, 'M27 18.5H33.5V97.5H27ZM119 18.5H125.5V97.5H119Z') +
            sh(k, 'M38.5 36.5H97.5V42H38.5Z', 0.14) +
            hi('M12.5 12V96M104.5 12V96', 2.5) +
            path('M46 100V66Q46 46 68 46Q90 46 90 66V100Z', paint(k.T, k.L, 5)) +
            path('M57 53V85M68 49.5V85M79 53V85M49.5 63H86.5M49.5 75H86.5', paint('none', GOLD, 3.5)) +
            path('M53 85l4 7l4-7ZM64 85l4 7l4-7ZM75 85l4 7l4-7Z', paint(GOLD)) +
            poly('15,50 29,50 29,76 22,69 15,76', paint(VERM)) +
            poly('107,50 121,50 121,76 114,69 107,76', paint(VERM)) +
            path('M22 28V40M114 28V40', ink(k, 5)) +
            gem(68, 38, 6, 6, gold(2))
          );
        // A pair of scales, level, a heap of gold in each pan: the load shared out.
        case 'load-balancer':
          return (
            path('M24 26L8 62M24 26L40 62M112 26L96 62M112 26L128 62', line(k, 3)) +
            path('M68 20V90M22 26H114', line(k, 6)) +
            hi('M26 24.5H110', 1.5, 0.45) +
            path('M44 101L55 88H81L92 101Z', dark(k, 3)) +
            path('M11 62Q13 50 24 50Q35 50 37 62Z', gold(2.5)) +
            path('M99 62Q101 50 112 50Q123 50 125 62Z', gold(2.5)) +
            burn('M24 50Q35 50 37 62H27Q29 54 24 50ZM112 50Q123 50 125 62H115Q117 54 112 50Z') +
            path('M4 62H44Q44 83 24 83Q4 83 4 62Z', body(k, 5)) +
            path('M92 62H132Q132 83 112 83Q92 83 92 62Z', body(k, 5)) +
            sh(k, 'M41.5 64.5Q40 80 24 80.5Q33 76 33 64.5ZM129.5 64.5Q128 80 112 80.5Q121 76 121 64.5Z', 0.26) +
            hi('M9 67Q10 74 15 77M97 67Q98 74 103 77', 2.5) +
            gem(68, 13, 9, 11, paint(VERM, k.L, 3)) +
            circle(22, 26, 4.5, gold(2)) +
            circle(114, 26, 4.5, gold(2))
          );
        // A messenger raven on a sealed scroll: it carries word between two parties.
        case 'proxy':
          return (
            stars([22, 24, 9], [40, 42, 4.5], [124, 62, 5]) +
            path('M64 80V90M80 77V90', paint('none', GOLD_D, 4)) +
            path('M86 12Q99 3 112 11L133 22L113 30Q114 56 92 72Q72 84 46 78L6 90L32 58Q58 26 86 12Z', dark(k, 4)) +
            path('M38 62Q62 34 98 44Q96 64 66 74Q48 78 24 82Z', o(paint(k.T), 0.4)) +
            path('M52 60Q72 43 94 48M44 70Q64 58 84 62', paint('none', k.F, 3)) +
            hi('M86 16Q96 8 107 12', 2.5, 0.5) +
            poly('113,11.5 133,22 114,28', gold(2)) +
            circle(102, 18, 4, paint(GOLD_H)) +
            circle(102.5, 18, 1.8, paint(k.T)) +
            rect(26, 88, 92, 13, 6.5, body(k, 5)) +
            sh(k, 'M31 95.5H113Q112 98.5 109 98.5H35Q32 98.5 31 95.5Z') +
            circle(72, 94.5, 8.5, paint(VERM, k.L, 2.5)) +
            path(starD(72, 94.5, 5), paint(GOLD))
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // A stone keep, battlements on top, a banner and one small door: where things are kept.
        case 'generic':
          return (
            ground(k, 70, 103.5, 54) +
            path('M18 38V6H35V17H47V6H64V17H76V6H93V17H105V6H122V38H112V102H28V38Z', body(k, 5.5)) +
            sh(k, 'M107.5 8.5H119.5V35.5H109.5V99.5H95V40H107.5Z') +
            hi('M22 10V34M32 42V98', 2.5) +
            path('M21 38.5H119', paint('none', GOLD, 4)) +
            path('M31 68H50M90 68H109M31 86H44M96 86H109', o(line(k, 3), 0.6)) +
            path('M44 48V60M96 48V60', ink(k, 5)) +
            poly('61,41 79,41 79,66 70,59 61,66', paint(LAPIS)) +
            path(starD(70, 50, 6), paint(GOLD)) +
            path('M58 102V86Q58 74 70 74Q82 74 82 86V102Z', dark(k, 3)) +
            path('M70 76V101M59.5 88H80.5', paint('none', GOLD, 2.5))
          );
        // A great tome lying open, every line ruled, an illuminated capital and a ribbon in its place.
        case 'sql':
          return (
            rect(4, 18, 132, 84, 4, dark(k, 3)) +
            path('M5 91V101H15ZM135 91V101H125ZM5 29V19H15ZM135 29V19H125Z', paint(GOLD)) +
            path('M70 22Q46 6 10 14V88Q46 80 70 94Z', body(k, 5)) +
            path('M70 22Q94 6 130 14V88Q94 80 70 94Z', body(k, 5)) +
            sh(k, 'M70 24Q62 18 54 15V82Q63 85 70 91Z', 0.14) +
            sh(k, 'M70 24Q78 18 88 14.5V82Q78 85 70 91Z', 0.26) +
            rect(18, 23, 18, 20, 2, paint(LAPIS, GOLD, 3)) +
            path(starD(27, 33, 6.5), paint(GOLD)) +
            path('M43 28Q51 28 58 31M43 39Q51 39 58 42M20 53Q40 48 58 55M20 66Q40 61 58 68', ink(k, 3.5)) +
            path('M120 30Q102 25 82 33M120 43Q102 38 82 46M120 56Q102 51 82 59M120 69Q108 66 98 68', ink(k, 3.5)) +
            poly('64,84 76,84 76,107 70,101 64,107', paint(VERM))
          );
        // A cauldron on its three legs, all sorts of things bubbling up out of the brew.
        case 'nosql':
          return (
            circle(36, 20, 11, paint(LAPIS, k.L, 3)) +
            hi('M29 17Q31 12 36 12', 2.5, 0.6) +
            poly('69,3 85,28 53,28', gold(3)) +
            burn('M69 3L85 28H71Z') +
            gem(104, 19, 12, 15, paint(VERM, k.L, 3)) +
            hi('M97 17L103 9', 2.5, 0.6) +
            ground(k, 70, 104, 46, 3) +
            path('M34 92L27 104M106 92L113 104', line(k, 6)) +
            path('M18 48Q8 100 70 100Q132 100 122 48Z', body(k, 5.5)) +
            sh(k, 'M119 50Q129 97 70 97.5Q108 90 102 50Z', 0.26) +
            hi('M25 58Q23 76 35 88', 3.5, 0.9) +
            path('M36 74q8.5-7 17 0t17 0t17 0t17 0', paint('none', GOLD, 4)) +
            ellipse(70, 46, 57, 9.5, paint(VERD, k.L, 6)) +
            circle(50, 45, 4, paint(GOLD_H)) +
            circle(86, 47, 3, paint(GOLD_H)) +
            circle(68, 43, 2.2, paint(GOLD_H))
          );
        // A corked potion flask with a bolt of lightning in it: quick, and soon gone.
        case 'cache':
          return (
            ground(k, 70, 103.5, 44, 3) +
            path('M60 14V38L26 84Q18 102 40 102H100Q122 102 114 84L80 38V14Z', body(k, 5.5)) +
            path('M42 67H98L111.5 85Q117 99.5 100 99.5H40Q23 99.5 28.5 85Z', o(paint(k.C), 0.42)) +
            sh(k, 'M82.5 40L111.5 85Q117 99.5 100 99.5H86Q104 96 97 83L82.5 60Z', 0.2) +
            hi('M57 42L33 80', 3.5, 0.9) +
            path('M54 16H86', line(k, 6)) +
            rect(60, 3, 20, 11, 3, paint(GOLD_D, k.L, 3)) +
            poly('76,44 54,75 68,75 63,97 87,63 72,63', paint(GOLD, k.T, 2.5)) +
            path(starD(114, 28, 13), gold(2)) +
            stars([24, 34, 8], [126, 58, 5], [12, 58, 4])
          );
        // A basket of rolled scrolls: files, kept together.
        case 'file-system':
          return (
            ground(k, 70, 103.5, 44, 3) +
            rolled(k, 48, 62, -27, LAPIS) +
            rolled(k, 92, 62, 27, GOLD) +
            rolled(k, 70, 60, 0, VERM) +
            path('M24 56H116L106 102H34Z', body(k, 5.5)) +
            sh(k, 'M26.5 58.5H113.5L104 99.5H36Z', 0.26) +
            sh(k, 'M92 58.5H113.5L104 99.5H88Z', 0.2) +
            path('M29 72H111M32 87H108', line(k, 3.5)) +
            path('M44 60V70M62 60V70M80 60V70M98 60V70M53 74V85M71 74V85M89 74V85M46 89V99M62 89V99M80 89V99M96 89V99', o(line(k, 3), 0.55)) +
            path('M19 56H121', line(k, 7.5)) +
            hi('M22 54.5H112', 2, 0.45)
          );
        // A treasure chest thrown open, heaped with gold and gems: whatever was put in it.
        case 'object-storage':
          return (
            stars([124, 14, 9], [12, 20, 6]) +
            path('M20 58L27 24Q70 2 113 24L120 58Z', body(k, 5.5)) +
            sh(k, 'M28 56L33 29Q70 11 107 29L112 56Z', 0.32) +
            path('M24 58Q30 39 47 42Q54 25 70 29Q86 25 93 42Q110 39 116 58Z', gold(3)) +
            burn('M70 29Q86 25 93 42Q110 39 116 58H86Q94 44 70 29Z') +
            glint('M33 50q4-6 10-5M57 37q5-5 11-4') +
            gem(73, 45, 8, 10, paint(VERM, k.T, 2)) +
            gem(99, 52, 6, 7, paint(LAPIS)) +
            circle(45, 52, 4.5, paint(VERD)) +
            rect(10, 58, 120, 44, 3, body(k, 5.5)) +
            sh(k, 'M12.5 82H127.5V99.5H12.5Z', 0.2) +
            hi('M15 63H125', 2.5, 0.7) +
            path('M30 59V101M110 59V101', paint('none', GOLD, 6)) +
            rect(60, 63, 20, 23, 3, gold(2.5)) +
            circle(70, 72, 3.5, paint(k.T)) +
            path('M70 72V80', ink(k, 3))
          );
        // A crystal ball on its gilt stand, an eye looking out of it: made for finding.
        case 'search-index':
          return (
            stars([124, 18, 10], [14, 20, 7], [126, 62, 4.5], [10, 66, 3.5]) +
            path('M38 82Q70 100 102 82L112 103H28Z', gold(3)) +
            burn('M74 92Q92 90 102 82L112 103H74Z') +
            circle(70, 44, 39, body(k, 5.5)) +
            sh(k, 'M106.5 46A36.5 36.5 0 0 1 46 71.5Q84 82 106.5 46Z', 0.24) +
            hi('M40.5 34Q45 18 62 11.5', 4, 0.95) +
            path('M42 46Q70 20 98 46Q70 72 42 46Z', paint(VELLUM, k.T, 4)) +
            circle(70, 46, 11.5, paint(LAPIS)) +
            circle(70, 46, 5.5, paint(k.T)) +
            circle(74, 42, 2.6, paint(VELLUM))
          );
        // A stone tablet, one corner chipped, cut into rows and columns under a heading.
        case 'table':
          return (
            path('M15 13H109L131 35V104H15Z', dark(k, 3)) +
            path('M9 6H104L126 28V98H9Z', body(k, 5.5)) +
            path('M11.5 8.5H103L123.5 29V32H11.5Z', o(paint(k.L), 0.3)) +
            hi('M14 11.5H100', 2.5, 0.7) +
            path('M9 32H126', ink(k, 5)) +
            path('M9 54H126M9 76H126M48 32V98M88 32V98', ink(k, 3.5)) +
            path(starD(28, 20, 7) + 'M68 15l5 5l-5 5l-5-5ZM104 17l4 4l-4 4l-4-4Z', paint(GOLD, GOLD_D, 1.5)) +
            gem(28, 43, 5.5, 6.5, paint(VERM)) +
            gem(28, 65, 5.5, 6.5, paint(LAPIS)) +
            gem(28, 87, 5.5, 6.5, paint(VERD)) +
            path('M58 43H78M98 43H116M58 65H78M98 65H116M58 87H78M98 87H116', o(line(k, 3.5), 0.45))
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // Rune stones along a road, each waiting its turn; the one at the head is gilded and lit.
        case 'queue':
          return (
            path('M4 60H272', line(k, 5)) +
            path('M54 58l3-9l3 9M108 58l3-9l3 9M162 58l3-9l3 9M216 58l3-9l3 9', paint('none', VERD, 3)) +
            stone(k, 30) +
            stone(k, 84) +
            stone(k, 138) +
            stone(k, 192) +
            stone(k, 246, true) +
            hi('M16 28Q16 12 27 9M70 28Q70 12 81 9M124 28Q124 12 135 9M178 28Q178 12 189 9', 2.5) +
            glint('M232 28Q232 12 243 9') +
            path('M28 20V46M28 30L38 22M88 20L76 33L88 46M129 22L145 44M145 22L129 44M190 46V20M182 29L190 20L198 29', ink(k, 3.5)) +
            path('M245 19L256 33L245 47L234 33Z', paint(VERM, VELLUM, 2.5)) +
            stars([219, 12, 6], [270, 8, 4.5])
          );
        // A herald's golden trumpet, three pennants flying from its cord: one call, heard by many.
        case 'topic':
          return (
            path('M104 9H272', paint('none', GOLD_D, 4)) +
            poly('122,9 162,9 162,58 142,45 122,58', body(k, 4)) +
            sh(k, 'M150 11H160V54L150 47.5Z') +
            gem(138, 26, 7, 8, paint(VERM)) +
            poly('172,9 212,9 212,58 192,45 172,58', dark(k, 4)) +
            path(starD(192, 26, 10), paint(GOLD)) +
            poly('222,9 262,9 262,58 242,45 222,58', body(k, 4)) +
            sh(k, 'M250 11H260V54L250 47.5Z') +
            gem(238, 26, 7, 8, paint(LAPIS)) +
            path('M6 24V40L13 37H58Q88 39 104 60V4Q88 25 58 27H13Z', gold(4)) +
            burn('M13 33H58Q84 33 102 44V56Q88 39 58 37H13Z') +
            glint('M16 30H58Q80 28 96 15') +
            path('M104 4V60', paint('none', GOLD_D, 7)) +
            path('M30 27V37M44 27V37', paint('none', GOLD_D, 3.5))
          );
        // A river winding across the page, a small boat carried along on it.
        case 'stream':
          return (
            path('M18 36Q48 10 78 36T138 36T198 36T258 36', paint('none', k.L, 28)) +
            path('M18 36Q48 10 78 36T138 36T198 36T258 36', paint('none', k.F, 18)) +
            path('M18 41Q48 15 78 41T138 41T198 41T258 41', o(paint('none', k.L, 7), 0.2)) +
            hi('M20 30Q48 6 76 30M140 30Q168 6 196 30', 2.5, 0.8) +
            path('M94 48q5-4 10 0t10 0M214 48q5-4 10 0t10 0M34 26q5-4 10 0t10 0', line(k, 3)) +
            path('M168 18V2', ink(k, 2.5)) +
            poly('171,3 171,15 184,15', paint(VERM)) +
            poly('165,6 165,15 157,15', paint(VELLUM, k.T, 1.5)) +
            path('M151 18H186L179 27H158Z', paint(GOLD_D, k.T, 2.5)) +
            stars([118, 12, 6], [238, 10, 5], [6, 12, 4])
          );
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A hooded adventurer with a staff, a star caught at its head.
        case 'human':
          return (
            wanderer(k, 50, 80, 1) +
            path('M106 22V80', paint('none', GOLD_D, 5)) +
            circle(106, 14, 12, o(paint(GOLD_H), 0.7)) +
            path(starD(106, 14, 13), gold(2))
          );
        // A fellowship of three, the leader in front.
        case 'group':
          return wanderer(k, 28, 80, 0.66, false) + wanderer(k, 92, 80, 0.66, false) + wanderer(k, 60, 80, 0.92);
        // A travelling merchant in a broad feathered hat, a bundle on a stick: someone from elsewhere.
        case 'thirdParty':
          return (
            path('M6 80Q6 46 44 44Q82 46 82 80Z', body(k, 5)) +
            sh(k, 'M56 46.5Q79 51 79.5 77.5H64Q66 58 56 46.5Z', 0.24) +
            hi('M11 72Q13 54 30 49') +
            circle(44, 32, 13, paint(VELLUM, k.L, 4)) +
            ellipse(44, 24, 27, 6.5, dark(k)) +
            path('M30 23Q32 4 44 4Q56 4 58 23Z', dark(k)) +
            path('M31 19H57', paint('none', GOLD, 4)) +
            path('M55 12Q64 0 74 4Q68 12 57 17Z', paint(VERM)) +
            path('M34 68L96 26', paint('none', GOLD_D, 5)) +
            circle(99, 27, 16, paint(LAPIS, k.L, 4.5)) +
            path('M99 13L104 22L113 27L104 32L99 41L94 32L85 27L94 22Z', paint(GOLD)) +
            hi('M87 21Q90 14 97 12.5', 2.5, 0.5)
          );
        // A castle of three towers: a whole realm that acts as one.
        case 'system':
          return (
            rect(36, 54, 48, 26, 0, body(k, 5)) +
            rect(14, 38, 24, 42, 0, body(k, 5)) +
            rect(82, 38, 24, 42, 0, body(k, 5)) +
            rect(46, 28, 28, 52, 0, body(k, 5)) +
            sh(k, 'M29 40.5H35.5V77.5H29ZM97 40.5H103.5V77.5H97ZM65 30.5H71.5V77.5H65Z') +
            poly('9,40 26,15 43,40', dark(k)) +
            poly('77,40 94,15 111,40', dark(k)) +
            poly('40,30 60,7 80,30', dark(k)) +
            hi('M17 36L26 22M85 36L94 22M49 26L60 13', 2.5, 0.5) +
            path('M26 8l5 5l-5 5l-5-5ZM94 8l5 5l-5 5l-5-5ZM60 0.5l5.5 5.5l-5.5 5.5l-5.5-5.5Z', paint(GOLD, GOLD_D, 1.5)) +
            path('M60 40V48M24 50V58M92 50V58', ink(k, 4.5)) +
            path('M53 80V69Q53 62 60 62Q67 62 67 69V80Z', paint(VERM, k.L, 3))
          );
        // A lantern, lit: the thing carried in the hand.
        case 'device':
          return (
            circle(60, 10, 6, line(k, 4)) +
            circle(60, 50, 22, o(paint(GOLD_H), 0.6)) +
            rect(43, 30, 34, 41, 2, body(k, 5)) +
            sh(k, 'M68.5 32.5H74.5V68.5H68.5Z') +
            hi('M47.5 34V66', 2.5) +
            path('M60 35Q73 50 67.5 59Q65 66 60 66Q55 66 52.5 59Q47 50 60 35Z', gold(2.5)) +
            path('M60 48Q65 56 60 62.5Q55 56 60 48Z', paint(GOLD_H)) +
            poly('47,19 73,19 81,30 39,30', dark(k)) +
            hi('M49 22H66', 2, 0.45) +
            rect(39, 70, 42, 10, 2, dark(k)) +
            path('M46 75H74', paint('none', GOLD, 3))
          );
        // An owl familiar on a branch, gold-eyed: it watches, and acts on its own.
        case 'agent':
          return (
            stars([104, 18, 9], [14, 28, 6.5], [18, 54, 3.5]) +
            path('M8 76H112', paint('none', GOLD_D, 6)) +
            path('M94 74Q102 59 114 63Q108 76 94 74Z', paint(VERD)) +
            path('M34 24L38 4L52 13Q60 10 68 13L82 4L86 24Q94 46 84 62Q76 74 60 74Q44 74 36 62Q26 46 34 24Z', body(k, 5)) +
            sh(k, 'M33.5 30Q28 47 37 61Q42 68 48 71Q38 54 40 36Z', 0.34) +
            sh(k, 'M86.5 30Q92 47 83 61Q78 68 72 71Q82 54 80 36Z', 0.34) +
            circle(48, 30, 11, paint(GOLD, k.L, 3.5)) +
            circle(72, 30, 11, paint(GOLD, k.L, 3.5)) +
            circle(48, 30, 5, paint(k.T)) +
            circle(72, 30, 5, paint(k.T)) +
            circle(50, 28, 1.8, paint(VELLUM)) +
            circle(74, 28, 1.8, paint(VELLUM)) +
            gem(60, 43, 5, 7, paint(VERM)) +
            path('M49 56l5.5 4l5.5-4l5.5 4l5.5-4', ink(k, 3))
          );
      }
    },

    // A smaller panel: a gold rule inside its frame, a gilt knot set with a stone at each corner.
    componentCard: (k) =>
      rect(3, 3, 294, 102, 4, body(k, 5.5)) +
      path('M292 9V100H9', o(paint('none', k.L, 3), 0.16)) +
      rect(12, 12, 276, 84, 0, paint('none', GOLD, 3)) +
      path('M150 6l6 6l-6 6l-6-6ZM150 90l6 6l-6 6l-6-6Z', paint(GOLD)) +
      gem(12, 12, 9, 9, gold(2)) +
      gem(288, 12, 9, 9, gold(2)) +
      gem(12, 96, 9, 9, gold(2)) +
      gem(288, 96, 9, 9, gold(2)) +
      path('M12 8l4 4l-4 4l-4-4ZM288 92l4 4l-4 4l-4-4Z', paint(VERM)) +
      path('M288 8l4 4l-4 4l-4-4ZM12 92l4 4l-4 4l-4-4Z', paint(LAPIS)),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A cut gem, catching the light: one whole, finished piece.
        case 'module':
          return (
            stars([106, 10, 9], [12, 80, 6.5], [104, 84, 4]) +
            poly('32,6 88,6 114,38 60,100 6,38', body(k, 5.5)) +
            poly('32,6 44,38 6,38', o(paint(VELLUM), 0.75)) +
            poly('60,6 76,38 44,38', o(paint(k.L), 0.12)) +
            poly('88,6 114,38 76,38', o(paint(k.L), 0.3)) +
            poly('44,38 76,38 60,100', o(paint(k.L), 0.2)) +
            poly('76,38 114,38 60,100', o(paint(k.L), 0.42)) +
            path('M6 38H114M32 6L44 38L60 6L76 38L88 6M44 38L60 100L76 38', line(k, 3)) +
            poly('32,6 88,6 114,38 60,100 6,38', line(k, 5.5))
          );
        // An ornate key, a stone set in its bow: it fits something outside.
        case 'adapter':
          return (
            stars([26, 20, 8], [98, 86, 6.5]) +
            group(
              'translate(57 52) rotate(-38)',
              path('M-20 -5.5H60V5.5H56V26H45V15H37V26H26V5.5H-20Z', dark(k)) +
                hi('M-14 -3.5H56', 2, 0.45) +
                path('M-12 -12V12', paint('none', GOLD, 7)) +
                circle(-40, 0, 18, paint(k.F, k.L, 9)) +
                circle(-40, 0, 18, paint('none', GOLD, 2.5)) +
                gem(-40, 0, 9, 9, paint(VERM)),
            )
          );
        // A keyhole plate, riveted in gold: where a key goes in.
        case 'port':
          return (
            path('M60 4Q100 4 104 30Q92 50 104 70Q98 96 60 100Q22 96 16 70Q28 50 16 30Q20 4 60 4Z', body(k, 5.5)) +
            sh(k, 'M60 6.5Q97 7 101.5 30Q89.5 50 101.5 70Q96 93 60 97.5Q82 90 86 70Q78 50 87 30Q84 12 60 6.5Z') +
            path('M60 13Q88 14 93 31Q83 50 93 69Q88 88 60 91Q32 88 27 69Q37 50 27 31Q32 14 60 13Z', paint('none', GOLD, 3)) +
            hi('M22.5 27Q27 11 50 8', 3, 0.85) +
            circle(60, 43, 12, paint(k.T)) +
            path('M53 49H67L73 78H47Z', paint(k.T, k.T, 2)) +
            path('M60 18l4.5 4.5l-4.5 4.5l-4.5-4.5ZM60 80.5l4 4l-4 4l-4-4Z', paint(GOLD, GOLD_D, 1.5))
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A scroll, unrolled between its two gilt-capped rolls, a red capital at its head.
        case 'file':
          return (
            rect(14, 12, 58, 76, 0, body(k, 5)) +
            sh(k, 'M61 19H69.5V81H61Z', 0.16) +
            rect(5, 4, 76, 15, 7.5, body(k, 5)) +
            sh(k, 'M8 12H78Q78 16.5 73 16.5H13Q8 16.5 8 12Z', 0.26) +
            rect(5, 81, 76, 15, 7.5, body(k, 5)) +
            sh(k, 'M8 89H78Q78 93.5 73 93.5H13Q8 93.5 8 89Z', 0.26) +
            path('M3 6.5H9V16.5H3ZM77 6.5H83V16.5H77ZM3 83.5H9V93.5H3ZM77 83.5H83V93.5H77Z', paint(GOLD, GOLD_D, 1.5)) +
            rect(23, 27, 14, 15, 1.5, paint(VERM)) +
            path('M43 30H62M43 39H62M24 50H62M24 60H62M24 70H48', ink(k, 3.5))
          );
        // An alchemist's recipe: a page of measures to set, and the phase of the moon to set them by.
        case 'config':
          return (
            path('M8 4H56L78 26V96H8Z', body(k, 5)) +
            sh(k, 'M56 4V26H78Z', 0.3) +
            path('M56 4V26H78', line(k, 4)) +
            hi('M12.5 9V91', 2.5) +
            path(starD(22, 21, 8), paint(GOLD, GOLD_D, 1.5)) +
            path('M34 21H46', ink(k, 3.5)) +
            path('M20 43H66M20 62H66', ink(k, 3.5)) +
            gem(34, 43, 7.5, 8.5, gold(2)) +
            gem(54, 62, 7.5, 8.5, paint(VERM, k.T, 2)) +
            circle(24, 82, 6.5, paint(k.T)) +
            circle(43, 82, 6, paint(GOLD_H, k.T, 3)) +
            path('M43 76A6 6 0 0 1 43 88Z', paint(k.T)) +
            circle(62, 82, 6, paint(GOLD_H, k.T, 3))
          );
        // A padlock, shut, a gold plate about its keyhole.
        case 'secret':
          return (
            path('M24 46V28Q24 6 43 6Q62 6 62 28V46', line(k, 8)) +
            hi('M24 30Q23 11 40 8', 2, 0.5) +
            path('M10 44H76V76Q76 94 43 97Q10 94 10 76Z', body(k, 5.5)) +
            sh(k, 'M60 46.5H73.5V76Q73 91 43 94.5Q62 88 60 72Z') +
            hi('M14.5 48.5V75', 2.5) +
            circle(43, 67, 15, gold(2.5)) +
            burn('M43 52A15 15 0 0 1 43 82A22 22 0 0 0 43 52Z') +
            circle(43, 63, 5.5, paint(k.T)) +
            path('M40 66H46L48.5 77H37.5Z', paint(k.T)) +
            path('M19 49.5l3 3l-3 3l-3-3ZM67 49.5l3 3l-3 3l-3-3Z', paint(k.L))
          );
        // A royal decree, ruled in gold, under its wax seal and ribbons.
        case 'certificate':
          return (
            rect(6, 4, 74, 72, 3, body(k, 5)) +
            rect(13, 11, 60, 58, 0, paint('none', GOLD, 2.5)) +
            path('M22 23H64', ink(k, 4.5)) +
            path('M22 35H64M22 47H38', ink(k, 3.5)) +
            poly('50,76 41,99 52,93 56,84', paint(LAPIS)) +
            poly('62,76 73,99 62,93 58,84', paint(LAPIS)) +
            circle(56, 68, 15, paint(VERM, k.L, 3)) +
            path(starD(56, 68, 9.5), paint(GOLD)) +
            hi('M45.5 63Q49 56 57 55.5', 2, 0.6)
          );
      }
    },

    // A gilt ring set with four stones, light on its shoulder; its middle is left bare for the word.
    junction: (k) =>
      circle(50, 50, 42, body(k, 6)) +
      circle(50, 50, 33.5, paint('none', GOLD, 3.5)) +
      hi('M15 36Q21 21 36 15') +
      gem(50, 8, 7, 7, paint(VERM, k.L, 2)) +
      gem(92, 50, 7, 7, paint(LAPIS, k.L, 2)) +
      gem(50, 92, 7, 7, paint(VERM, k.L, 2)) +
      gem(8, 50, 7, 7, paint(LAPIS, k.L, 2)),
  },

  // A vellum page: faint ruling, a margin line, a scatter of tiny gilt stars and two pen flourishes.
  backdrop: {
    tile: [480, 360],
    draw: () =>
      path('M0 20H480M0 60H480M0 100H480M0 140H480M0 180H480M0 220H480M0 260H480M0 300H480M0 340H480', paint('none', '#e5d9b6', 1)) +
      path('M92 0V360M96 0V360', paint('none', '#efd8c4', 1)) +
      path(starD(214, 78, 6) + starD(402, 44, 4) + starD(338, 236, 7) + starD(42, 204, 4.5) + starD(156, 304, 3.5) + starD(446, 318, 5) + starD(262, 164, 3), o(paint('#d2a93c'), 0.5)) +
      path('M296 118q12-12 24-2q8 9-2 15q-9 3-9-5M320 116q14-8 26 2', o(paint('none', '#b89a5c', 1.5), 0.45)) +
      path('M118 252q-10 10-22 2q-8-8 1-14q9-3 9 5M96 254q-12 8-22-1', o(paint('none', '#b89a5c', 1.5), 0.45)) +
      path('M346 118q4-5 8 0q-4 5-8 0ZM74 253q-4-5-8 0q4 5 8 0Z', o(paint('#4f9a7e'), 0.4)) +
      path('M94 137l3 3l-3 3l-3-3Z', o(paint('#c9574a'), 0.4)) +
      path('M420 178l3 3l-3 3l-3-3ZM430 178l3 3l-3 3l-3-3ZM440 178l3 3l-3 3l-3-3ZM196 338l3 3l-3 3l-3-3ZM206 338l3 3l-3 3l-3-3Z', o(paint('#c7b078'), 0.55)),
  },
};

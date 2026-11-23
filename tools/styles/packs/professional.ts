import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Professional: the house style of a consultancy's architecture deck, or a modern cloud console.
 * Every kind is a precise duotone product icon on one grid: a soft body with an even outline, one
 * solid plane in the shape's accent (a header band, a lid, a top face), a tinted shade plane set
 * down and to the right of it so the object stands a little off the page, a crisp highlight on the
 * lit edge, and a single amber spot for the part that matters (the next message out, the hit under
 * the lens, the key cell). Light always falls from the top left. Painted by role, so it follows
 * the device's light or dark theme and any recolour; only the amber, the highlight and a deep
 * shade are fixed. The canvas behind is a drafting sheet: a fine grid with registration marks.
 */

/** The fixed colours: the one spot, the highlight, and the shade laid over an accent plane. */
const AMBER = '#f2a93b';
const WHITE = '#ffffff';
const NIGHT = '#0b1930';

/** Outline, ink and detail weights: the same three everywhere. */
const W = 5;
const I = 5;
const D = 3.5;

const n = (value: number) => Math.round(value * 10) / 10;
const body = (k: Kit, w = W) => paint(k.F, k.L, w);
const chip = (k: Kit, w = W) => paint(k.C, k.L, w);
const edge = (k: Kit, w = W) => paint('none', k.L, w);
const ink = (k: Kit, w = I) => paint('none', k.T, w);
const spot = paint(AMBER);

/** The shade plane: the shape's own line colour, thinned. */
const tint = (k: Kit, opacity = 0.3) => `fill="${k.L}" fill-opacity="${opacity}"`;
/** The shade over an accent plane, where the line colour would not show. */
const dusk = (opacity = 0.2) => `fill="${NIGHT}" fill-opacity="${opacity}"`;
/** The highlight, as a stroke along a lit edge. */
const glint = (w = 3, opacity = 0.55) => `fill="none" stroke="${WHITE}" stroke-width="${w}" stroke-opacity="${opacity}"`;

/** The plane a boxy object stands off: its own outline again, down and to the right. */
const lift = (k: Kit, x: number, y: number, w: number, h: number, r: number, d = 5) => rect(x + d, y + d, w, h, r, tint(k));

/** A band with only its top corners rounded: the header of a card, a page or a badge. */
const band = (x: number, y: number, w: number, h: number, r: number) => `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;

/** A card: body, header band and its highlight, then the outline over both so it stays even. */
const card = (k: Kit, x: number, y: number, w: number, h: number, r: number, head: number) =>
  rect(x, y, w, h, r, paint(k.F)) + path(band(x, y, w, head, r), paint(k.C)) + path(`M${x + r} ${y + 5.5}H${x + w - r}`, glint(2.5, 0.4)) + rect(x, y, w, h, r, edge(k));

/** The shaded side of a round thing: a crescent along its lower right. */
const crescent = (cx: number, cy: number, r: number, flat = 1.5) => {
  const c = Math.SQRT1_2 * r;
  return `M${n(cx + c)} ${n(cy - c)}A${r} ${r} 0 0 1 ${n(cx - c)} ${n(cy + c)}A${n(r * flat)} ${n(r * flat)} 0 0 0 ${n(cx + c)} ${n(cy - c)}Z`;
};

/** The lit side of a round thing: an arc along its upper left. */
const arcHi = (cx: number, cy: number, r: number) => `M${n(cx - r * 0.94)} ${n(cy - r * 0.34)}A${r} ${r} 0 0 1 ${n(cx + r * 0.34)} ${n(cy - r * 0.94)}`;

/** A cog with flat-topped teeth. */
function gear(cx: number, cy: number, tip: number, root: number, teeth: number): string {
  const step = (Math.PI * 2) / teeth;
  const at = (r: number, a: number) => `${n(cx + r * Math.cos(a))} ${n(cy + r * Math.sin(a))}`;
  let d = '';
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step - Math.PI / 2;
    d += `${i === 0 ? 'M' : `A${root} ${root} 0 0 1 `}${at(root, a - step * 0.3)}L${at(tip, a - step * 0.17)}L${at(tip, a + step * 0.17)}L${at(root, a + step * 0.3)}`;
  }
  return `${d}A${root} ${root} 0 0 1 ${at(root, -Math.PI / 2 - step * 0.3)}Z`;
}

/**
 * A can: the classic data store, `rx` wide, from its lid at `top` to its base at `bottom`. Its
 * right side is in shade, its lid catches the light, and a status lamp glows low on its front.
 */
const can = (k: Kit, cx: number, rx: number, ry: number, top: number, bottom: number, lamp = true) => {
  const u = 0.36;
  const dy = ry * Math.sqrt(1 - u * u);
  const shell = `M${cx - rx} ${top}V${bottom}A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}V${top}Z`;
  const mid = (top + bottom) / 2 + ry * 0.3;
  return (
    ellipse(cx + 5, bottom + ry * 0.5, rx, ry * 0.85, tint(k, 0.22)) +
    path(shell, paint(k.F)) +
    path(`M${n(cx + rx * u)} ${top}V${n(bottom + dy)}A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}V${top}Z`, tint(k)) +
    path(`M${cx - rx} ${mid}A${rx} ${ry} 0 0 0 ${cx + rx} ${mid}`, edge(k, D)) +
    path(shell, edge(k)) +
    ellipse(cx, top, rx, ry, chip(k)) +
    path(`M${n(cx - rx * 0.68)} ${n(top - ry * 0.2)}Q${n(cx - rx * 0.45)} ${n(top - ry * 0.6)} ${n(cx - rx * 0.04)} ${n(top - ry * 0.64)}`, glint()) +
    (lamp ? circle(n(cx - rx * 0.62), n((mid + bottom) / 2 + ry * 0.78), 4.5, spot) : '')
  );
};

/** A message: an envelope `w` by `h`, its flap drawn in `flap`. */
const envelope = (x: number, y: number, w: number, h: number, attrs: string, flap: string) =>
  rect(x, y, w, h, 3, attrs) + path(`M${x + 3} ${y + 4}L${x + w / 2} ${y + h * 0.58}L${x + w - 3} ${y + 4}`, flap);

/**
 * Head and shoulders. `lead` is the one in front: jacket in the accent, its right side in shade, a
 * collar, and a badge on the chest. The others stand behind in a plain tinted jacket.
 */
const bust = (k: Kit, cx: number, head: number, r: number, half: number, top: number, bottom: number, lead = true) => {
  const w = lead ? W : D + 1;
  const right = `C${cx + half * 0.72} ${top} ${cx + half} ${top + half * 0.22} ${cx + half} ${top + half * 0.62}V${bottom}`;
  const torso = `M${cx - half} ${bottom}V${top + half * 0.62}C${cx - half} ${top + half * 0.22} ${cx - half * 0.72} ${top} ${cx - half * 0.36} ${top}H${cx + half * 0.36}${right}Z`;
  return (
    path(torso, paint(lead ? k.C : k.F)) +
    (lead
      ? path(`M${cx + 2} ${top}H${cx + half * 0.36}${right}H${cx + 2}Z`, dusk()) +
        path(`M${n(cx - half + 5.5)} ${n(top + half * 0.66)}C${n(cx - half + 5.5)} ${n(top + half * 0.34)} ${n(cx - half * 0.68)} ${top + 5.5} ${n(cx - half * 0.34)} ${top + 5.5}`, glint(3, 0.45)) +
        path(`M${cx - 8} ${top + 1}L${cx} ${top + 11}L${cx + 8} ${top + 1}`, paint('none', k.F, 3.5)) +
        rect(n(cx + half * 0.34), n(top + (bottom - top) * 0.44), 10, 12, 2.5, spot)
      : path(torso, tint(k, 0.3))) +
    path(torso, edge(k, w)) +
    circle(cx, head, r, paint(k.F)) +
    path(crescent(cx, head, r - 1, 1.22), tint(k)) +
    circle(cx, head, r, edge(k, w))
  );
};

/** A sheet with a folded corner, the fold in the accent, standing off a shade plane. */
const SHEET = 'M16 4H50L74 28V88Q74 94 68 94H16Q10 94 10 88V10Q10 4 16 4Z';
const page = (k: Kit, under = '', sheet = SHEET) =>
  group('translate(5 5)', path(sheet, tint(k))) + path(sheet, paint(k.F)) + under + path(sheet, edge(k)) + path('M50 4V22Q50 28 56 28H74Z', chip(k));

/** A four-pointed spark. */
const spark = (cx: number, cy: number, r: number) => {
  const a = r * 0.2;
  return `M${cx} ${cy - r}Q${cx + a} ${cy - a} ${cx + r} ${cy}Q${cx + a} ${cy + a} ${cx} ${cy + r}Q${cx - a} ${cy + a} ${cx - r} ${cy}Q${cx - a} ${cy - a} ${cx} ${cy - r}Z`;
};

/** A service's card: a hairline rule set inside the outline, under a slim band with one lamp. */
const serviceCard = (k: Kit, x: number, w: number) =>
  rect(x, 3, w, 126, 10, paint(k.F)) +
  rect(x + 7, 10, w - 14, 112, 5, `fill="none" stroke="${k.L}" stroke-width="1.6" stroke-opacity="0.5"`) +
  path(band(x, 3, w, 17, 10), paint(k.C)) +
  path(`M${x + 12} 8.5H${x + w - 40}`, glint(2.5, 0.4)) +
  rect(x + w - 32, 8.5, 18, 6.5, 3.25, spot) +
  rect(x, 3, w, 126, 10, edge(k, 4));

/** The drafting sheet's lines: every `step` from `first`, across a tile `size` wide and tall. */
const ruled = (first: number, step: number, size: number) => {
  let d = '';
  for (let at = first; at < size; at += step) d += `M${at} 0V${size}M0 ${at}H${size}`;
  return d;
};
const cross = (x: number, y: number, r: number) => `M${x - r} ${y}H${x + r}M${x} ${y - r}V${y + r}`;
const hair = (k: Kit, opacity: number, w = 1) => `fill="none" stroke="${k.T}" stroke-width="${w}" stroke-opacity="${opacity}"`;

export const professional: Pack = {
  id: 'professional',
  name: 'Professional',
  summary: 'Refined duotone product icons with quiet depth, on a drafting sheet, for documents and slides',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 10,
  style: {
    // A ruling pen: fine, exact, and a soft shadow as on a product page.
    hand: { base: 'clean' },
    general: { weight: 'fine' },
    connectors: { weight: 'fine', head: 'triangle', colour: 'plain' },
    schemes: {
      light: scheme(
        { canvas: '#f7f8fa', grid: '#e3e6eb', text: '#16202e', textMuted: '#55606f', edge: '#6b7686', edgeText: '#55606f', edgeLabelBg: '#ffffff', codeBg: '#eef0f4', codeBorder: '#dde1e7' },
        {
          neutral: ['#ffffff', '#66728a', '#16202e', '#3d4a63'],
          teal: ['#edf7f6', '#2f8179', '#12403b', '#1f736b'],
          blue: ['#ecf3fc', '#3a6fae', '#14365f', '#2660a4'],
          violet: ['#f1effb', '#6656ad', '#2d2360', '#5646a0'],
          amber: ['#faf4e6', '#94712a', '#4f3a0b', '#85621b'],
          rose: ['#faeef0', '#a85a68', '#5a2430', '#974a59'],
          green: ['#eef6ed', '#487f43', '#1f431d', '#3a7235'],
        },
      ),
      dark: scheme(
        { canvas: '#12161d', grid: '#232a34', text: '#e6eaf0', textMuted: '#9aa5b4', edge: '#7d8898', edgeText: '#aab4c2', edgeLabelBg: '#1a2029', codeBg: '#171c24', codeBorder: '#2a323d' },
        {
          neutral: ['#1b212b', '#7f8ba0', '#e6eaf0', '#a7b3c6'],
          teal: ['#14292b', '#4fa89f', '#cfeeea', '#6cc4ba'],
          blue: ['#16273d', '#5f95d2', '#d4e5f8', '#7fb0e6'],
          violet: ['#221f3d', '#9083d6', '#e1dcf8', '#a99ee6'],
          amber: ['#2c2615', '#c2a05a', '#f4e7c6', '#d8ba76'],
          rose: ['#301c21', '#cc8693', '#f6dade', '#dfa1ac'],
          green: ['#192b1b', '#6faa68', '#d6efd3', '#8bc684'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      switch (kind) {
        // A card under a slim header band.
        case 'generic':
          return serviceCard(k, 3, 342);
        // The same card, with a two-slot connector standing out of its left edge. Bottom right
        // stays clear: the app writes "API" there.
        case 'api':
          return serviceCard(k, 15, 330) + rect(3, 44, 28, 44, 5, paint(k.C)) + path('M8 50V82', glint(2.5, 0.4)) + rect(3, 44, 28, 44, 5, edge(k, 4)) + path('M13 58H22M13 74H22', paint('none', k.F, I));
      }
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A cog turning over a conveyor that carries two jobs: one waiting, one done.
        case 'worker':
          return (
            lift(k, 6, 78, 120, 20, 10, 4) +
            rect(9, 53, 21, 21, 3, body(k, D + 1)) +
            rect(102, 53, 21, 21, 3, paint(AMBER, k.L, D + 1)) +
            path(gear(66, 38, 32, 23, 8), paint(k.F)) +
            path(crescent(66, 38, 23, 1.7), tint(k)) +
            path(gear(66, 38, 32, 23, 8), edge(k)) +
            circle(66, 38, 10, chip(k, D + 1)) +
            rect(6, 78, 120, 20, 10, paint(k.C)) +
            path('M18 83.5H114', glint(2.5, 0.4)) +
            rect(6, 78, 120, 20, 10, edge(k)) +
            circle(22, 89, 3.5, paint(k.F)) +
            circle(66, 89, 3.5, paint(k.F)) +
            circle(110, 89, 3.5, paint(k.F))
          );
        // A cloud, and an arrow leaving it for somewhere else.
        case 'external': {
          const cloud = 'M36 97C17 97 5 85 5 70C5 56 15 45 29 43C31 26 45 13 63 13C79 13 92 23 97 37C112 38 123 50 123 67C123 84 110 97 93 97Z';
          return (
            group('translate(5 5)', path(cloud, tint(k))) +
            path(cloud, paint(k.F)) +
            path('M6 76C11 89 22 97 36 97H93C109 97 121 86 123 71C116 80 105 84 93 84H38C24 84 13 82 6 76Z', tint(k)) +
            path('M36 36C40 26 50 20 62 20', glint(3, 0.5)) +
            path(cloud, edge(k)) +
            path('M88 49L127 10', paint('none', k.K, 16)) +
            path('M70 67L127 10M102 8H129V35', ink(k, 7)) +
            circle(70, 67, 8.5, paint(AMBER, k.F, 3))
          );
        }
        // A calendar page with one day marked, and a clock set over its corner.
        case 'scheduler':
          return (
            lift(k, 8, 14, 92, 80, 8) +
            card(k, 8, 14, 92, 80, 8, 23) +
            path('M30 6V22M78 6V22', ink(k, W + 1)) +
            rect(19, 46, 14, 13, 2.5, paint(k.L)) +
            rect(40, 46, 14, 13, 2.5, spot) +
            rect(61, 46, 14, 13, 2.5, paint(k.L)) +
            rect(19, 67, 14, 13, 2.5, paint(k.L)) +
            rect(40, 67, 14, 13, 2.5, paint(k.L)) +
            circle(104, 72, 32, paint(k.K)) +
            circle(104, 72, 25, paint(k.F)) +
            path(crescent(104, 72, 24), tint(k)) +
            circle(104, 72, 25, edge(k)) +
            path('M104 56V72L115 79', ink(k))
          );
        // A keystoned arch on a threshold, and an arrow passing through it.
        case 'gateway':
          return (
            path('M4 64H130', ink(k, 7)) +
            path('M48 92V44A20 20 0 0 1 88 44V92Z', paint(k.K)) +
            path('M48 92V44A20 20 0 0 1 88 44V92Z', tint(k, 0.16)) +
            path('M28 96V44A40 40 0 0 1 108 44V96H88V44A20 20 0 0 0 48 44V96Z', paint(k.F)) +
            path('M88 96V44A20 20 0 0 0 82.1 29.9L96.3 15.7A40 40 0 0 1 108 44V96Z', tint(k)) +
            path('M28 96V44A40 40 0 0 1 108 44V96H88V44A20 20 0 0 0 48 44V96Z', edge(k)) +
            path('M58 3H78L75 25H61Z', paint(AMBER, k.L, 4)) +
            path('M53 64H83', ink(k, 7)) +
            path('M116 52L130 64L116 76', ink(k, 7)) +
            rect(14, 88, 108, 13, 4, paint(k.C)) +
            path('M20 92.5H116', glint(2.5, 0.4))
          );
        // One node, wired to three.
        case 'load-balancer':
          return (
            path('M42 52H100M70 17V87M70 17H100M70 87H100', ink(k)) +
            lift(k, 5, 33, 38, 38, 8) +
            rect(5, 33, 38, 38, 8, paint(k.C)) +
            path('M12 62V46Q12 40 18 40H34', glint(3, 0.45)) +
            rect(5, 33, 38, 38, 8, edge(k)) +
            circle(24, 52, 7, paint(AMBER, k.F, 3)) +
            [5, 40, 75]
              .map((y) => lift(k, 100, y, 28, 24, 5, 4) + rect(100, y, 28, 24, 5, body(k)) + path(`M108 ${y + 12}H120`, edge(k, D)))
              .join('')
          );
        // A shield standing between two parties, traffic passing through it both ways.
        case 'proxy': {
          const shield = 'M68 5L100 15V49C100 73 86 88 68 96C50 88 36 73 36 49V15Z';
          return (
            path('M4 38H132M120 27L132 38L120 49M132 68H4M16 57L4 68L16 79', ink(k, 5.5)) +
            group('translate(5 5)', path(shield, tint(k))) +
            path(shield, paint(k.C)) +
            path('M68 5L100 15V49C100 73 86 88 68 96Z', dusk(0.22)) +
            path('M42.5 46V19.5L64 13', glint(3, 0.45)) +
            path(shield, edge(k)) +
            path('M47 38H89M49 68H87', paint('none', k.F, 5.5)) +
            circle(68, 53, 5.5, spot)
          );
        }
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // The classic can.
        case 'generic':
          return can(k, 68, 54, 14, 20, 80);
        // A can with a table of rows and columns set over its corner, one cell picked out.
        case 'sql':
          return (
            can(k, 52, 44, 12, 18, 78, false) +
            rect(60, 40, 80, 68, 9, paint(k.K)) +
            lift(k, 66, 46, 66, 54, 6) +
            card(k, 66, 46, 66, 54, 6, 16) +
            path('M68.5 62H129.5M68.5 81H129.5M88 62V100M110 62V100', ink(k, D)) +
            rect(91.5, 65.5, 15, 12, 2, spot)
          );
        // Loose documents in a pile, the top one in braces.
        case 'nosql':
          return (
            rect(44, 6, 84, 58, 7, paint(k.C)) +
            path('M52 12.5H120', glint(2.5, 0.4)) +
            rect(44, 6, 84, 58, 7, edge(k)) +
            rect(28, 22, 84, 58, 7, paint(k.F)) +
            rect(28, 22, 84, 58, 7, tint(k, 0.32)) +
            rect(28, 22, 84, 58, 7, edge(k)) +
            rect(12, 38, 84, 64, 7, body(k)) +
            path('M44 52C38 52 36 54 36 59V64C36 68 34 70 29 70C34 70 36 72 36 76V81C36 86 38 88 44 88', ink(k)) +
            path('M64 52C70 52 72 54 72 59V64C72 68 74 70 79 70C74 70 72 72 72 76V81C72 86 70 88 64 88', ink(k)) +
            circle(54, 70, 5.5, spot)
          );
        // A memory chip struck by a bolt: fast, and in memory.
        case 'cache':
          return (
            path('M12 34H28M12 54H28M12 74H28M112 34H128M112 54H128M112 74H128M50 4V16M70 4V16M90 4V16M50 92V104M70 92V104M90 92V104', edge(k)) +
            rect(28, 16, 84, 76, 10, body(k)) +
            rect(38, 26, 64, 56, 5, paint(k.C)) +
            path('M102 31V77Q102 82 97 82H43Z', dusk(0.2)) +
            path('M44 32H82', glint(2.5, 0.45)) +
            poly('82,29 50,60 67,60 59,80 91,48 74,48', paint(AMBER, k.F, 3))
          );
        // A folder with two files standing in it.
        case 'file-system':
          return (
            path('M10 26Q10 18 18 18H44L56 30H122Q130 30 130 38V92H10Z', paint(k.C)) +
            path('M17 23.5H42', glint(2.5, 0.4)) +
            path('M10 26Q10 18 18 18H44L56 30H122Q130 30 130 38V92H10Z', edge(k)) +
            rect(60, 12, 42, 50, 4, body(k, D + 1)) +
            rect(76, 5, 42, 56, 4, body(k, D + 1)) +
            path('M86 18H108M86 30H108', ink(k, D)) +
            rect(10, 44, 120, 56, 8, paint(k.F)) +
            path('M10 84H130V92Q130 100 122 100H18Q10 100 10 92Z', tint(k)) +
            rect(22, 57, 34, 11, 3, spot) +
            rect(10, 44, 120, 56, 8, edge(k))
          );
        // A bucket with a few different things in it.
        case 'object-storage': {
          const pail = 'M16 34A54 12 0 0 0 124 34L113 90Q112 98 104 98H36Q28 98 27 90Z';
          return (
            ellipse(75, 97, 42, 6, tint(k, 0.22)) +
            ellipse(70, 34, 54, 12, body(k)) +
            circle(43, 26, 14, paint(k.C)) +
            path(arcHi(43, 26, 9), glint(3, 0.5)) +
            rect(61, 9, 28, 34, 4, body(k, D + 1)) +
            poly('94,42 107,16 120,42', paint(AMBER, AMBER, 3)) +
            path(pail, paint(k.F)) +
            path('M90 45.2A54 12 0 0 0 124 34L113 90Q112 98 104 98H88Z', tint(k)) +
            path('M21 62A50 11 0 0 0 119 62', edge(k, D)) +
            path(pail, edge(k))
          );
        }
        // Index cards under a large magnifier, the hit lit up in its glass.
        case 'search-index':
          return (
            rect(22, 7, 84, 60, 6, paint(k.F)) +
            rect(22, 7, 84, 60, 6, tint(k, 0.32)) +
            rect(22, 7, 84, 60, 6, edge(k)) +
            card(k, 8, 21, 84, 68, 6, 17) +
            path('M19 52H50M19 65H42M19 78H50', edge(k, D)) +
            circle(94, 62, 33, paint(k.K)) +
            path('M112 80L128 96', ink(k, 11)) +
            circle(94, 62, 25, paint(k.F)) +
            path(crescent(94, 62, 23), tint(k)) +
            path('M80 62H108', paint('none', AMBER, 7)) +
            circle(94, 62, 25, paint('none', k.T, 7))
          );
        // One table: a header, a grid, and its key column.
        case 'table':
          return (
            lift(k, 8, 10, 124, 86, 7) +
            card(k, 8, 10, 124, 86, 7, 22) +
            path('M8 32H48V96H15Q8 96 8 89Z', tint(k, 0.2)) +
            path('M8 32H132M8 54H132M8 75H132M48 32V96M90 32V96', ink(k, D)) +
            rect(17, 38.5, 22, 9, 4.5, spot) +
            rect(8, 10, 124, 86, 7, edge(k))
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // A tray of messages waiting in line, the first one on its way out.
        case 'queue':
          return (
            path('M212 5H15Q3 5 3 17V47Q3 59 15 59H212', paint(k.F)) +
            path('M212 59H15Q4 59 3 48H212Z', tint(k)) +
            path('M212 5H15Q3 5 3 17V47Q3 59 15 59H212', edge(k)) +
            envelope(16, 15, 38, 27, body(k, D), edge(k, D)) +
            envelope(64, 15, 38, 27, body(k, D), edge(k, D)) +
            envelope(112, 15, 38, 27, body(k, D), edge(k, D)) +
            envelope(160, 15, 38, 27, body(k, D), edge(k, D)) +
            path('M213 24H223M213 40H223', edge(k, D)) +
            lift(k, 232, 16, 38, 28, 3, 4) +
            envelope(232, 16, 38, 28, paint(AMBER, k.L, D), edge(k, D))
          );
        // One message in, and a copy of it out to each of three readers.
        case 'topic':
          return (
            lift(k, 3, 4, 146, 52, 12) +
            rect(3, 4, 146, 52, 12, body(k)) +
            envelope(53, 15, 46, 30, chip(k, D), paint('none', k.F, D)) +
            circle(76, 38.5, 3.5, spot) +
            path('M152 30H264M190 9V51M190 9H264M190 51H264M255 2L265 9L255 16M255 23L265 30L255 37M255 44L265 51L255 58', ink(k))
          );
        // A pipe in constant flow.
        case 'stream':
          return (
            rect(3, 5, 270, 54, 12, paint(k.F)) +
            path('M3 47H273Q273 59 261 59H15Q3 59 3 47Z', tint(k)) +
            [0.24, 0.36, 0.5, 0.64, 0.78, 0.9]
              .map((opacity, index) => {
                const x = 18 + index * 35;
                return poly(`${x},17 ${x + 14},17 ${x + 28},32 ${x + 14},47 ${x},47 ${x + 14},32`, `${paint(k.C)} fill-opacity="${opacity}"`);
              })
              .join('') +
            poly('228,17 242,17 256,32 242,47 228,47 242,32', spot) +
            rect(3, 5, 270, 54, 12, edge(k))
          );
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // Head and shoulders, in a jacket and a badge.
        case 'human':
          return bust(k, 60, 21, 16, 37, 46, 78);
        // Three people, the nearest in front.
        case 'group':
          return (
            bust(k, 24, 31, 11, 20, 50, 78, false) +
            bust(k, 96, 31, 11, 20, 50, 78, false) +
            path('M31 78V64C31 55 40 46 50 46H70C80 46 89 55 89 64V78Z', paint(k.K, k.K, 9)) +
            circle(60, 22, 14, paint(k.K, k.K, 11)) +
            bust(k, 60, 22, 14, 29, 46, 78)
          );
        // An office building: a tower and a wing, its door lit.
        case 'thirdParty':
          return (
            rect(68, 38, 34, 40, 3, paint(k.F)) +
            rect(68, 38, 34, 40, 3, tint(k, 0.3)) +
            rect(68, 38, 34, 40, 3, edge(k)) +
            card(k, 22, 5, 48, 73, 4, 13) +
            rect(31, 26, 10, 9, 1, paint(k.T)) +
            rect(51, 26, 10, 9, 1, paint(k.T)) +
            rect(31, 42, 10, 9, 1, paint(k.T)) +
            rect(51, 42, 10, 9, 1, paint(k.T)) +
            rect(80, 48, 10, 9, 1, paint(k.T)) +
            rect(80, 63, 10, 9, 1, paint(k.T)) +
            rect(40, 60, 12, 18, 0, spot) +
            path('M8 78H112', edge(k))
          );
        // A screen on its stand, at a prompt.
        case 'system':
          return (
            path('M60 63V75M38 77H82', edge(k)) +
            lift(k, 12, 4, 96, 58, 6) +
            card(k, 12, 4, 96, 58, 6, 15) +
            path('M25 30L34 38L25 46', ink(k)) +
            rect(42, 41, 16, 7, 1.5, spot)
          );
        // A phone, with something new on it.
        case 'device':
          return (
            lift(k, 40, 3, 36, 72, 8) +
            rect(40, 3, 36, 72, 8, body(k)) +
            rect(46, 12, 24, 44, 3, paint(k.C)) +
            path('M70 15V53Q70 56 67 56H49Z', dusk(0.2)) +
            path('M53 65H63', ink(k, D)) +
            circle(70, 13, 6, paint(AMBER, k.F, 2.5))
          );
        // A friendly robot head, with a spark of its own.
        case 'agent':
          return (
            path('M60 24V12', edge(k)) +
            circle(60, 9, 5.5, paint(k.L)) +
            rect(11, 40, 12, 20, 4, paint(k.L)) +
            rect(97, 40, 12, 20, 4, paint(k.L)) +
            rect(24, 24, 72, 54, 14, paint(k.F)) +
            path('M79 24H82Q96 24 96 38V64Q96 78 82 78H79Z', tint(k)) +
            rect(24, 24, 72, 54, 14, edge(k)) +
            circle(46, 46, 6, paint(k.T)) +
            circle(72, 46, 6, paint(k.T)) +
            path('M47 61Q59 69 71 61', ink(k, 4.5)) +
            path(spark(104, 14, 13), spot)
          );
      }
    },

    // A card with the two lugs of a component on its left edge, a tinted spine behind them.
    componentCard: (k) =>
      rect(17, 3, 280, 102, 8, paint(k.F)) +
      path('M40 3H25Q17 3 17 11V97Q17 105 25 105H40Z', tint(k, 0.2)) +
      path('M44.5 5V103', `fill="none" stroke="${k.L}" stroke-width="1.6" stroke-opacity="0.5"`) +
      rect(17, 3, 280, 102, 8, edge(k, 4)) +
      rect(3, 24, 28, 18, 4, chip(k, 4)) +
      rect(3, 66, 28, 18, 4, chip(k, 4)) +
      path('M8 29.5H26M8 71.5H26', glint(2.5, 0.4)) +
      circle(28, 54, 4, spot),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A packed box, seen from its corner, labelled.
        case 'module': {
          const hex = 'M58 4L102 28V74L58 98L14 74V28Z';
          return (
            group('translate(5 5)', path(hex, tint(k))) +
            path(hex, paint(k.F)) +
            path('M58 4L102 28L58 52L14 28Z', paint(k.C)) +
            path('M58 52L102 28V74L58 98Z', tint(k, 0.34)) +
            path('M25 27L58 9', glint(3, 0.5)) +
            poly('23,45 40,54.3 40,67.3 23,58', spot) +
            path(`${hex}M14 28L58 52L102 28M58 52V98`, edge(k))
          );
        }
        // A plug about to meet its socket.
        case 'adapter':
          return (
            path('M3 52H14', edge(k)) +
            path('M48 40H63M48 64H63', ink(k, W + 1)) +
            path('M48 22H34Q14 22 14 42V62Q14 82 34 82H48Z', paint(k.F)) +
            path('M14 54V62Q14 82 34 82H48V54Z', tint(k)) +
            path('M48 22H34Q14 22 14 42V62Q14 82 34 82H48Z', edge(k)) +
            lift(k, 78, 13, 34, 76, 6) +
            rect(78, 13, 34, 76, 6, paint(k.C)) +
            path('M84 20V82', glint(2.5, 0.4)) +
            rect(78, 13, 34, 76, 6, edge(k)) +
            path('M90 40H99M90 64H99', paint('none', k.F, W + 1)) +
            path(spark(70.5, 52, 7.5), spot)
          );
        // A block offering an interface: the lollipop others plug into.
        case 'port':
          return (
            lift(k, 6, 12, 54, 78, 6) +
            card(k, 6, 12, 54, 78, 6, 14) +
            path('M18 42H48M18 56H40', edge(k, D)) +
            path('M63 52H86', ink(k, W + 1)) +
            circle(100, 52, 14, chip(k)) +
            circle(100, 52, 5.5, paint(AMBER, k.F, 2.5))
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A page of lines under a title.
        case 'file':
          return page(k) + path('M22 43H42', paint('none', AMBER, 6)) + path('M22 57H62M22 70H62M22 83H46', ink(k));
        // A page of sliders, each set differently.
        case 'config':
          return page(k) + path('M26 40V84M42 40V84M58 40V84', edge(k, D)) + rect(19, 47, 14, 11, 3, paint(k.T)) + rect(35, 68, 14, 11, 3, spot) + rect(51, 55, 14, 11, 3, paint(k.T));
        // A page closed over a key.
        case 'secret':
          return (
            page(k, path('M10 44H74V88Q74 94 68 94H16Q10 94 10 88Z', paint(k.C)) + path('M74 49V88Q74 94 68 94H29Z', dusk(0.2))) +
            circle(29, 69, 9, paint(AMBER, k.F, 5.5)) +
            path('M38 69H64M55 69V79M64 69V77', paint('none', k.F, 5.5))
          );
        // A shorter page, signed, with a ribbon seal hanging off its foot.
        case 'certificate':
          return (
            page(k, '', 'M16 4H50L74 28V74Q74 80 68 80H16Q10 80 10 74V10Q10 4 16 4Z') +
            path('M22 42H52M22 55H34', ink(k)) +
            circle(58, 71, 21, paint(k.K)) +
            path('M49 79L45 98L58 91L71 98L67 79Z', paint(k.C)) +
            circle(58, 71, 14, chip(k)) +
            circle(58, 71, 5.5, paint(AMBER, k.F, 2.5))
          );
      }
    },

    // A ring with a port at each point of the compass, its lower right in shade.
    junction: (k) =>
      circle(50, 50, 38, paint(k.F)) +
      path(crescent(50, 50, 36, 1.12), tint(k)) +
      circle(50, 50, 38, edge(k, 6)) +
      rect(42, 4, 16, 16, 4, paint(k.C)) +
      rect(42, 80, 16, 16, 4, paint(k.C)) +
      rect(4, 42, 16, 16, 4, paint(k.C)) +
      rect(80, 42, 16, 16, 4, paint(k.C)),
  },

  // A drafting sheet: a fine grid under a heavier one, with a few registration marks where the
  // heavy lines meet, a target and a dimension line. No line sits on the tile's edge, so it joins.
  backdrop: {
    tile: [480, 480],
    draw: (k) =>
      path(ruled(12, 24, 480), hair(k, 0.04)) +
      path(ruled(60, 120, 480), hair(k, 0.065)) +
      path(cross(60, 180, 7) + cross(300, 60, 10) + cross(420, 300, 6) + cross(180, 420, 9) + cross(420, 180, 5), hair(k, 0.18, 1.25)) +
      circle(300, 300, 8, hair(k, 0.16, 1.25)) +
      path(cross(300, 300, 14), hair(k, 0.16, 1.25)) +
      path('M84 300H156M84 295V305M156 295V305M372 96V72H396', hair(k, 0.13, 1.25)),
  },
};

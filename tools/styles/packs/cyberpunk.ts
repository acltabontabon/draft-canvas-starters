import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Cyberpunk: a night city, and every kind of shape a thing found in it. A drone does the
 * background jobs, a checkpoint arch is the way in, the SQL store is a megatower with a strict
 * grid of lit windows, the cache a battery, the queue a maglev train. All of it in one hand: cut
 * corners at 45 degrees, the main body's outline printed a second time a few units out of
 * register in cyan (the glitch), a spot of hazard yellow. Always dark: neon needs the night.
 */
const W = 6;
const I = 4;
const cyan = (k: Kit) => k.A('teal', 'chip');
const magenta = (k: Kit) => k.A('rose', 'chip');
const yellow = (k: Kit) => k.A('amber', 'chip');

/** A rectangle with its corners cut at 45 degrees: top-left, top-right, bottom-right, bottom-left. */
const cut = (x: number, y: number, w: number, h: number, tl = 0, tr = tl, br = tl, bl = tl): string => {
  const p: number[][] = [];
  if (tl) p.push([x, y + tl], [x + tl, y]);
  else p.push([x, y]);
  if (tr) p.push([x + w - tr, y], [x + w, y + tr]);
  else p.push([x + w, y]);
  if (br) p.push([x + w, y + h - br], [x + w - br, y + h]);
  else p.push([x + w, y + h]);
  if (bl) p.push([x + bl, y + h], [x, y + h - bl]);
  else p.push([x, y + h]);
  return p.map((q) => q.join(',')).join(' ');
};

/** The glitch: an outline again, slipped down and right, in cyan. Drawn before the body it belongs to. */
const slip = (k: Kit, shape: (attrs: string) => string, by = 5, weight = 3): string => group(`translate(${by} ${by})`, shape(paint('none', cyan(k), weight)));

/** A body: its glitch, then the shape in the fill and outline of the node. */
const body = (k: Kit, points: string, weight = W, by = 5): string => slip(k, (attrs) => poly(points, attrs), by) + poly(points, paint(k.F, k.L, weight));

/** A line in the shape's ink. */
const line = (d: string, colour: string, weight = I): string => path(d, paint('none', colour, weight));

/** A barcode: thick and thin bars in a row. */
const barcode = (x: number, y: number, h: number, colour: string, wide = 1): string =>
  [
    [0, 4],
    [7, 2.5],
    [12, 5],
    [20, 2.5],
    [25, 4],
    [32, 2.5],
    [37, 5],
  ]
    .map(([at, w]) => rect(x + at * wide, y, w * wide, h, 0, paint(colour)))
    .join('');

/** A cube seen from a corner, its top face lit. */
const cube = (k: Kit, cx: number, cy: number, s: number, glitch = false): string => {
  const a = Math.round(s * 0.87);
  const h = s / 2;
  const hex = `${cx},${cy - s} ${cx + a},${cy - h} ${cx + a},${cy + h} ${cx},${cy + s} ${cx - a},${cy + h} ${cx - a},${cy - h}`;
  return (
    (glitch ? slip(k, (attrs) => poly(hex, attrs)) : '') +
    poly(hex, paint(k.F, k.L, 5)) +
    poly(`${cx},${cy - s} ${cx + a},${cy - h} ${cx},${cy} ${cx - a},${cy - h}`, paint(k.C, k.L, 5)) +
    line(`M${cx} ${cy}V${cy + s}`, k.L, 5)
  );
};

/**
 * A street figure, standing on y = 80 around x = 60: jacket, head, a visor across the eyes and a
 * crest of hair. `plain` leaves the jacket's zip off, for the people at the back of a group.
 */
const streetFigure = (k: Kit, weight = 5, plain = false, glitch = true): string => {
  const jacket = '20,80 20,58 36,42 84,42 100,58 100,80';
  return (
    (glitch ? slip(k, (attrs) => poly(jacket, attrs), 4) : '') +
    poly(jacket, paint(k.F, k.L, weight)) +
    (plain ? '' : line('M50 50L60 62L70 50M60 62V78', k.T)) +
    poly(cut(42, 10, 36, 36, 9), paint(k.F, k.L, weight)) +
    rect(38, 21, 44, 10, 0, paint(cyan(k))) +
    poly('44,10 50,0 56,8 62,0 68,8 74,0 76,10', paint(magenta(k)))
  );
};

export const cyberpunk: Pack = {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  summary: 'A neon night city of drones, megatowers and maglev trains, cut-cornered and glitched',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 60,
  style: {
    hand: { base: 'clean' },
    general: { corners: 'sharp', shadow: false },
    connectors: { head: 'triangle', colour: 'plain' },
    schemes: {
      dark: scheme(
        { canvas: '#120c1f', grid: '#1d1433', text: '#e6dbff', textMuted: '#a99bd6', edge: '#9a8fd0', edgeText: '#c9b8f5', edgeLabelBg: '#1a1230', codeBg: '#170f29', codeBorder: '#2c2050' },
        {
          neutral: ['#1e1436', '#9a8fd0', '#e6dbff', '#c2b5f5'],
          teal: ['#0d2a30', '#3de0e0', '#c9fbfb', '#6beaea'],
          blue: ['#131f45', '#5b8cff', '#d6e2ff', '#84a8ff'],
          violet: ['#2a1650', '#b06cff', '#ecd9ff', '#c693ff'],
          amber: ['#2e2a0c', '#f7e04b', '#fdf6c4', '#f9e86f'],
          rose: ['#3a0f2c', '#f0489a', '#ffd3ea', '#f571b3'],
          green: ['#0f2e1c', '#39e58c', '#cdfbe2', '#6aeda8'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      // A wall panel with a raised label tab along the top and a hazard strip on it. The API's panel
      // starts further in and has a jack socket let into its left edge: the thing others plug into.
      const x = kind === 'api' ? 16 : 4;
      const panel = `${x},32 ${x + 26},6 130,6 140,16 341,16 341,124 ${x + 12},124 ${x},112`;
      return (
        body(k, panel, W, 4) +
        rect(x + 34, 3, 60, 7, 0, paint(yellow(k))) +
        (kind === 'api'
          ? rect(3, 46, 30, 50, 0, paint(k.K, k.L, 5)) + rect(11, 57, 14, 7, 0, paint(cyan(k))) + rect(11, 78, 14, 7, 0, paint(cyan(k)))
          : barcode(22, 100, 12, k.L, 1.5))
      );
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A quad-rotor drone from above: four rotors on crossed arms, one eye. It does the errands.
        case 'worker':
          return (
            line('M24 24L112 80M112 24L24 80', k.L, 7) +
            [
              [24, 24],
              [112, 24],
              [24, 80],
              [112, 80],
            ]
              .map(([cx, cy]) => circle(cx, cy, 19, paint(k.F, k.L, 5)))
              .join('') +
            line('M11 24H37M99 24H125M11 80H37M99 80H125', k.T, 3.5) +
            body(k, cut(44, 30, 48, 44, 12)) +
            circle(68, 52, 8, paint(cyan(k))) +
            rect(57, 27, 22, 6, 0, paint(yellow(k)))
          );
        // An uplink dish on its stand, beaming out: the system on the other side of the sky.
        case 'external': {
          const tilt = 'rotate(-20 58 46)';
          const bowl = 'M58 4A42 42 0 0 0 58 88Z';
          return (
            line('M40 82L28 100M40 82L58 100M14 100H72', k.L, W) +
            slip(k, (attrs) => group(tilt, path(bowl, attrs))) +
            group(
              tilt,
              path(bowl, paint(k.F, k.L, W)) +
                ellipse(58, 46, 17, 42, paint(k.K, k.L, W)) +
                line('M58 46H90', k.L, W) +
                line('M105.6 30.4A22 22 0 0 1 105.6 61.6M121.1 24.2A38 38 0 0 1 121.1 67.8', k.C, 5.5) +
                circle(90, 46, 8, paint(magenta(k))),
            )
          );
        }
        // A countdown clock: an eight-sided face, the time still to run marked in hazard yellow.
        case 'scheduler':
          return (
            body(k, cut(18, 4, 94, 94, 28)) +
            path('M65 51V16A35 35 0 0 1 95.3 33.5Z', paint(yellow(k))) +
            line('M27 51h8M95 51h8M65 83v8', k.L, I) +
            line('M65 51V18M65 51L93 35', k.T, 5) +
            circle(65, 51, 5.5, paint(k.T))
          );
        // A checkpoint scanner arch: two pillars, a beam, scan lines, and the way in.
        case 'gateway':
          return (
            slip(k, (attrs) => poly('6,98 6,26 26,6 106,6 126,26 126,98', attrs)) +
            poly('6,98 6,26 26,6 106,6 126,26 126,98 100,98 100,34 32,34 32,98', paint(k.F, k.L, W)) +
            rect(52, 16, 28, 8, 0, paint(yellow(k))) +
            line('M36 50h12M84 50h12M36 68h12M84 68h12', cyan(k), I) +
            line('M66 98V54M52 66L66 52L80 66', k.T, 5)
          );
        // A highway interchange: one road in, three neon lanes out.
        case 'load-balancer':
          return (
            line('M34 52H108M56 52L93 15H108M56 52L93 89H108', k.L, 7) +
            body(k, cut(4, 34, 32, 36, 9), W, 4) +
            rect(108, 4, 22, 22, 0, paint(cyan(k))) +
            rect(108, 41, 22, 22, 0, paint(magenta(k))) +
            rect(108, 78, 22, 22, 0, paint(yellow(k)))
          );
        // A blank mask: whoever is talking, this is the face they see.
        case 'proxy':
          return (
            body(k, '20,6 116,6 130,30 118,70 86,98 50,98 18,70 6,30') +
            poly('24,36 58,44 58,56 30,50', paint(k.K, cyan(k), 3.5)) +
            poly('112,36 78,44 78,56 106,50', paint(k.K, cyan(k), 3.5)) +
            line('M56 76V88M68 74V90M80 76V88', k.T, I) +
            poly('58,6 78,6 68,20', paint(yellow(k)))
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // Data cells racked one on another, each with its light on: the stacked platters of any store.
        case 'generic':
          return [3, 37, 71]
            .map((y) => body(k, cut(22, y, 92, 30, 9)) + rect(35, y + 10, 12, 10, 0, paint(cyan(k))) + line(`M58 ${y + 15}H100`, k.L, I))
            .join('');
        // A megatower: rows and columns of lit windows, every one in its place.
        case 'sql':
          return (
            poly('18,102 18,60 28,50 46,50 46,102', paint(k.F, k.L, 5)) +
            poly('94,102 94,50 112,50 122,60 122,102', paint(k.F, k.L, 5)) +
            line('M70 12V3', k.L, 5) +
            body(k, '42,102 42,22 52,12 88,12 98,22 98,102') +
            [24, 40, 56, 72].map((y) => [51, 65, 79].map((x) => rect(x, y, 10, 10, 0, paint(k.T))).join('')).join('') +
            line('M32 64V90M108 64V90', cyan(k), 5) +
            line('M8 102H132', k.L, 5)
          );
        // Loose holo cubes, no two the same size, drifting: documents of any shape.
        case 'nosql':
          return cube(k, 46, 62, 38, true) + group('rotate(14 104 36)', cube(k, 104, 36, 25)) + group('rotate(-12 106 86)', cube(k, 106, 86, 15));
        // A battery cell with a bolt on it: fast, and gone when the power is.
        case 'cache':
          return (
            rect(118, 38, 14, 32, 0, paint(k.L)) +
            body(k, cut(6, 18, 112, 72, 12)) +
            line('M24 21V87', k.L, 5) +
            poly('74,24 46,58 62,58 54,86 86,48 68,48', paint(yellow(k)))
          );
        // A stack of tabbed data folders, one behind the other.
        case 'file-system': {
          const folder = (x: number, y: number) => `${x},${y + 56} ${x},${y + 8} ${x + 8},${y} ${x + 38},${y} ${x + 48},${y + 10} ${x + 100},${y + 10} ${x + 100},${y + 56}`;
          return (
            poly(folder(34, 4), paint(k.F, k.L, 5)) +
            poly(folder(20, 24), paint(k.F, k.L, 5)) +
            body(k, folder(6, 44)) +
            rect(16, 46, 24, 6, 0, paint(yellow(k))) +
            line('M22 72H78M22 86H58', k.T, I)
          );
        }
        // A shipping container: a ribbed steel box of whatever was put in it.
        case 'object-storage':
          return (
            slip(k, (attrs) => poly('6,36 28,14 130,14 130,78 108,100 6,100', attrs)) +
            poly('6,36 28,14 130,14 108,36', paint(k.F, k.L, 5)) +
            poly('108,36 130,14 130,78 108,100', paint(k.F, k.L, 5)) +
            poly('6,36 108,36 108,100 6,100', paint(k.F, k.L, W)) +
            line('M24 48V88M40 48V88M56 48V88M72 48V88', k.L, I) +
            rect(84, 46, 14, 12, 0, paint(yellow(k)))
          );
        // A cybernetic eye inside a scanner reticle: made for finding.
        case 'search-index':
          return (
            body(k, '4,52 38,16 98,16 132,52 98,88 38,88') +
            circle(68, 52, 24, paint(k.K, k.T, 5)) +
            circle(68, 52, 9, paint(cyan(k))) +
            line('M68 4V24M68 80V100M18 52h14M104 52h14', k.T, I)
          );
        // A holo grid panel: one table, its header row lit, rows and columns ruled.
        case 'table':
          return (
            body(k, cut(6, 8, 124, 88, 0, 14, 0, 14)) +
            poly('6,8 116,8 130,22 130,30 6,30', paint(k.L, k.L, W)) +
            line('M6 52H130M6 74H130M48 30V96M90 30V96', k.L, I)
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // A maglev train on its rail: cars in a line, the one at the front lit, next to arrive.
        case 'queue':
          return (
            line('M2 58H274', k.L, 5) +
            line('M64 38h6M130 38h6M196 38h6', k.L, 5) +
            [4, 70, 136].map((x) => poly(cut(x, 8, 60, 40, 8, 8, 0, 0), paint(k.F, k.L, 5)) + rect(x + 11, 19, 38, 11, 0, paint(k.K))).join('') +
            body(k, '202,48 202,8 240,8 272,40 272,48', 5, 4) +
            poly('211,19 236,19 247,30 211,30', paint(yellow(k)))
          );
        // A street loudhailer, its one announcement split three ways to three billboards.
        case 'topic':
          return (
            line('M46 32H88M88 32L108 12H214M88 32H214M88 32L108 52H214', k.L, W) +
            body(k, '4,20 18,20 42,5 42,59 18,44 4,44', 5, 4) +
            line('M18 20V44', k.L, I) +
            rect(50, 26, 12, 12, 0, paint(magenta(k))) +
            rect(216, 3, 56, 17, 0, paint(cyan(k))) +
            rect(216, 24, 56, 17, 0, paint(magenta(k))) +
            rect(216, 45, 56, 17, 0, paint(yellow(k)))
          );
        // A signal: one unbroken pulse train running the length, heading right.
        case 'stream': {
          const wave = 'M6 46H14L42 18H56L84 46H98L126 18H140L168 46H182L210 18H224L252 46H254';
          return (
            group('translate(4 5)', line(wave, cyan(k), 11)) +
            line(wave, k.L, 12) +
            line(wave, k.F, 4.5) +
            poly('254,31 274,46 254,61', paint(yellow(k)))
          );
        }
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A street figure: jacket, visor, a crest of hair.
        case 'human':
          return streetFigure(k);
        // Three of them, two standing behind.
        case 'group':
          return (
            group('translate(-12.4 31) scale(0.62)', streetFigure(k, 7, true, false)) +
            group('translate(58 31) scale(0.62)', streetFigure(k, 7, true, false)) +
            streetFigure(k)
          );
        // A corporate fixer: hat, tie and a briefcase. Someone from another outfit.
        case 'thirdParty':
          return (
            body(k, '4,80 4,58 20,42 60,42 76,58 76,80', 5, 4) +
            line('M30 51L40 61L50 51', k.T) +
            poly('37,61 43,61 45,70 40,78 35,70', paint(k.T)) +
            poly(cut(25, 14, 30, 34, 8), paint(k.F, k.L, 5)) +
            rect(23, 25, 34, 8, 0, paint(cyan(k))) +
            poly('28,16 30,3 50,3 52,16', paint(k.L, k.L, 4)) +
            line('M14 17H66', k.L, W) +
            line('M93 54V45H107V54', k.L, 5) +
            poly(cut(82, 54, 36, 26, 4), paint(k.F, k.L, 5)) +
            line('M82 65H118', k.L, I) +
            rect(95, 61, 10, 8, 0, paint(yellow(k)))
          );
        // A terminal with a prompt waiting on it: a system that takes part.
        case 'system':
          return (
            line('M60 60V72', k.L, 7) +
            poly('30,80 38,70 82,70 90,80', paint(k.F, k.L, 5)) +
            body(k, cut(10, 4, 100, 56, 10), 5) +
            poly(cut(20, 13, 80, 38, 4), paint(k.K)) +
            line('M30 23L41 32L30 41', cyan(k), 5) +
            line('M50 41H68', yellow(k), 5)
          );
        // A handheld deck: a screen with signal bars and one key.
        case 'device':
          return (
            body(k, cut(42, 4, 34, 72, 7), 5, 4) +
            rect(48, 13, 22, 40, 0, paint(k.K)) +
            line('M53 46V40M59 46V32M65 46V24', cyan(k), I) +
            rect(53, 61, 12, 6, 0, paint(yellow(k)))
          );
        // An android head on its shoulders: one eye glowing, the other a slit, an aerial, a vent for a mouth.
        case 'agent':
          return (
            poly('18,82 30,70 90,70 102,82', paint(k.F, k.L, 5)) +
            rect(10, 20, 12, 20, 0, paint(k.L)) +
            rect(98, 20, 12, 20, 0, paint(k.L)) +
            line('M104 20V8', k.L, I) +
            circle(104, 7, 4.5, paint(magenta(k))) +
            body(k, '34,4 86,4 98,16 98,40 86,52 82,66 38,66 34,52 22,40 22,16', 5, 4) +
            circle(46, 28, 11, paint(k.K, k.T, I)) +
            circle(46, 28, 5, paint(cyan(k))) +
            line('M68 28H86', k.T, 5) +
            line('M50 52V60M60 52V60M70 52V60', k.T, 3.5)
          );
      }
    },

    // A module card: opposite corners cut, a tick in the other two, a hazard tab on its edge.
    componentCard: (k) =>
      body(k, '4,4 276,4 294,22 294,100 22,100 4,82', 5) + line('M16 16H38M16 16V34M282 88H260M282 88V70', k.C, 3.5) + rect(1, 42, 7, 22, 0, paint(yellow(k))),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A chip on its contacts, the die lit in the middle.
        case 'module':
          return (
            line('M39 5V16M53 5V16M67 5V16M81 5V16M39 88V99M53 88V99M67 88V99M81 88V99M9 34H22M9 52H22M9 70H22M98 34H111M98 52H111M98 70H111', k.L, W) +
            body(k, cut(22, 16, 76, 72, 10)) +
            rect(44, 36, 32, 32, 0, paint(k.C)) +
            circle(33, 27, 3.5, paint(magenta(k)))
          );
        // A jack plug on its cable: what you push into somebody else's socket.
        case 'adapter':
          return group(
            'translate(0 -4) rotate(-35 60 52)',
            line('M24 52H8C-6 52 -8 68 6 76', k.L, 8) +
              body(k, cut(22, 32, 46, 40, 8)) +
              line('M37 42V62M49 42V62', k.T, I) +
              rect(68, 39, 10, 26, 0, paint(k.L)) +
              rect(78, 44, 28, 16, 0, paint(k.F, k.L, 5)) +
              line('M91 44V60', k.L, I) +
              poly('106,41 118,45 124,52 118,59 106,63', paint(cyan(k), k.L, I))
          );
        // A neural socket: a ring on its mounting lugs, pin holes waiting for a plug.
        case 'port':
          return (
            rect(4, 41, 16, 22, 0, paint(k.L)) +
            rect(100, 41, 16, 22, 0, paint(k.L)) +
            slip(k, (attrs) => circle(60, 52, 44, attrs)) +
            circle(60, 52, 44, paint(k.F, k.L, W)) +
            circle(60, 52, 28, paint(k.K, k.T, I)) +
            [
              [46, 46],
              [60, 40],
              [74, 46],
              [50, 62],
              [70, 62],
            ]
              .map(([cx, cy]) => circle(cx, cy, 4.5, paint(cyan(k))))
              .join('')
        );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A data shard: a slab with one corner sheared off, lines of text and a barcode.
        case 'file':
          return body(k, '6,4 46,4 76,34 76,94 20,94 6,80', 5) + line('M20 42H50M20 55H62', k.T) + barcode(22, 68, 16, cyan(k));
        // A slider panel: three faders, each set somewhere different.
        case 'config':
          return (
            body(k, cut(5, 5, 72, 88, 8), 5) +
            line('M23 20V78M41 20V78M59 20V78', k.L, I) +
            rect(15, 28, 16, 11, 0, paint(k.T)) +
            rect(33, 58, 16, 11, 0, paint(yellow(k))) +
            rect(51, 40, 16, 11, 0, paint(k.T))
          );
        // A key, cut square like a circuit trace.
        case 'secret':
          return (
            body(k, '34,4 60,4 74,18 74,36 60,50 54,50 54,62 70,62 70,72 54,72 54,78 66,78 66,88 54,88 54,94 40,94 40,50 34,50 20,36 20,18', 5) +
            poly(cut(36, 16, 22, 22, 6), paint(k.K, cyan(k), 3.5))
          );
        // A holo seal with its two ribbon tails and a tick: checked and signed.
        case 'certificate':
          return (
            poly('20,58 20,96 31,86 42,96 42,62', paint(k.F, k.L, 5)) +
            poly('44,62 44,96 55,86 66,96 66,58', paint(k.F, k.L, 5)) +
            body(k, cut(8, 4, 70, 66, 20), 5) +
            line('M27 36L39 48L60 24', k.T, 6)
          );
      }
    },

    // A neon diamond with a terminal at either side, its middle left empty for the word.
    junction: (k) => rect(1, 43, 10, 10, 0, paint(k.L)) + rect(85, 43, 10, 10, 0, paint(k.L)) + body(k, '48,6 90,48 48,90 6,48', 6, 5),
  },
};

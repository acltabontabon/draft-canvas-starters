import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Cyberpunk: a night city, and every kind of shape a thing found in it. A drone does the
 * background jobs, a checkpoint arch is the way in, the SQL store is a megatower with a strict
 * grid of lit windows, the cache a battery, the queue a maglev train. All of it in one hand, a
 * synthwave poster: indigo-black bodies with their corners cut at 45 degrees, every outline a neon
 * tube (the line again, wider and faint, underneath it), a lit plane top-left and a shaded one
 * bottom-right, chrome with a hard horizon, and a strict triad of spot colours: hot magenta,
 * electric cyan, acid yellow. Always dark: neon needs the night.
 */
const W = 5.5;
const I = 4;

/** The pack's own materials: the same whatever colour the shape is. */
const INK = '#06030f';
const MAG = '#ff2e97';
const CYN = '#22e6ff';
const YEL = '#f5ff3d';
const CHR = '#d9e0ff';
const STEEL = '#4b4585';
const WHT = '#ffffff';

const o = (opacity: number): string => (opacity < 1 ? ` opacity="${opacity}"` : '');

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

/** Path data for a polygon's points, a rectangle and a circle: several can share one painted path. */
const dOf = (points: string): string => `M${points.trim().split(/\s+/).join('L')}Z`;
const box = (x: number, y: number, w: number, h: number): string => `M${x} ${y}h${w}v${h}h${-w}z`;
const ring = (cx: number, cy: number, r: number): string => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

/** A flat tone: a filled polygon or path, usually faint. */
const tone = (points: string, colour: string, opacity = 1): string => poly(points, paint(colour) + o(opacity));
const toneD = (d: string, colour: string, opacity = 1): string => path(d, paint(colour) + o(opacity));
/** The lit plane (the shape's own line colour, faint) and the shaded one (night ink). */
const lit = (k: Kit, points: string, opacity = 0.3): string => tone(points, k.L, opacity);
const shade = (points: string, opacity = 0.4): string => tone(points, INK, opacity);

/** A line. */
const line = (d: string, colour: string, weight = I, opacity = 1): string => path(d, paint('none', colour, weight) + o(opacity));
/** A neon tube: the line, over itself again wider and faint. */
const tube = (d: string, colour: string, weight = 5, glow = 8, core = false): string =>
  line(d, colour, weight + glow, 0.24) + line(d, colour, weight) + (core ? line(d, WHT, 1.3, 0.55) : '');
/**
 * A body: a dark panel in the shape's fill, its outline a neon tube in the shape's line colour
 * (halo, tube, a white-hot core down its middle).
 */
const neonD = (k: Kit, d: string, weight = W, glow = 8): string =>
  path(d, paint('none', k.L, weight + glow) + o(0.24)) + path(d, paint(k.F, k.L, weight)) + path(d, paint('none', WHT, 1.3) + o(0.55));
const neon = (k: Kit, points: string, weight = W, glow = 8): string => neonD(k, dOf(points), weight, glow);
/** A lit pad or sign in a spot colour, with its halo. */
const pad = (x: number, y: number, w: number, h: number, colour: string): string => rect(x - 3, y - 3, w + 6, h + 6, 0, paint(colour) + o(0.26)) + rect(x, y, w, h, 0, paint(colour));
/** A round lamp: halo, light, a white-hot point. */
const lamp = (cx: number, cy: number, r: number, colour: string): string =>
  circle(cx, cy, r * 2, paint(colour) + o(0.26)) + circle(cx, cy, r, paint(colour)) + circle(cx - r * 0.3, cy - r * 0.3, r * 0.36, paint(WHT) + o(0.85));
/** Chrome: bright sky above a hard horizon, dark ground below. */
const chrome = (x: number, y: number, w: number, h: number): string => rect(x, y, w, h / 2, 0, paint(CHR)) + rect(x, y + h / 2, w, h / 2, 0, paint(STEEL));

/** A barcode: thick and thin bars in a row. */
const barcode = (x: number, y: number, h: number, colour: string): string =>
  toneD(
    [
      [0, 4],
      [7, 3],
      [13, 5],
      [21, 3],
      [27, 4],
      [34, 3],
      [40, 5],
    ]
      .map(([at, w]) => box(x + at, y, w, h))
      .join(''),
    colour,
  );

/** A holo cube seen from a corner: its top face lit, its right face in shade. */
const cube = (k: Kit, cx: number, cy: number, s: number, glow = false): string => {
  const a = Math.round(s * 0.87);
  const h = s / 2;
  const hex = `${cx},${cy - s} ${cx + a},${cy - h} ${cx + a},${cy + h} ${cx},${cy + s} ${cx - a},${cy + h} ${cx - a},${cy - h}`;
  return (
    (glow ? poly(hex, paint('none', k.L, 13) + o(0.24)) : '') +
    poly(hex, paint(k.F, k.L, 5)) +
    shade(`${cx},${cy} ${cx + a},${cy - h} ${cx + a},${cy + h} ${cx},${cy + s}`, 0.42) +
    poly(`${cx},${cy - s} ${cx + a},${cy - h} ${cx},${cy} ${cx - a},${cy - h}`, paint(k.C, k.L, 5)) +
    line(`M${cx} ${cy}V${cy + s}`, k.L, 5)
  );
};

/**
 * A street figure, standing on y = 78 around x = 60: jacket, head, a visor across the eyes and a
 * crest of hair. `back` is one of the people behind in a group: no halo, no zip.
 */
const streetFigure = (k: Kit, weight = 5, back = false): string => {
  const jacket = '22,78 22,58 38,43 82,43 98,58 98,78';
  return (
    (back ? poly(jacket, paint(k.F, k.L, weight)) : neon(k, jacket, weight, 7)) +
    shade('60,46 81,46 95.5,59 95.5,78 60,78', 0.3) +
    (back ? '' : lit(k, '25,59 39,45.5 49,45.5 25,69') + line('M50 49L60 61L70 49M60 61V76', k.T)) +
    poly(cut(43, 9, 34, 35, 9), paint(k.F, k.L, weight)) +
    rect(36, 18, 48, 15, 0, paint(CYN) + o(0.26)) +
    rect(39, 21, 42, 9, 0, paint(CYN)) +
    (back ? '' : rect(42, 22.5, 15, 2.5, 0, paint(WHT) + o(0.8))) +
    tone('45,10 50,1 56,8 62,1 68,8 74,1 76,10', MAG)
  );
};

export const cyberpunk: Pack = {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  summary: 'A neon night city of drones, megatowers and maglev trains, in glowing tube and chrome',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 60,
  style: {
    // Neon tube: thin, hard-cornered, each run lit in the colour of its source.
    hand: { base: 'clean' },
    general: { weight: 'fine', corners: 'sharp', shadow: false },
    connectors: { weight: 'fine', head: 'triangle', colour: 'source' },
    schemes: {
      dark: scheme(
        { canvas: '#0e0a1f', grid: '#1a1338', text: '#ece5ff', textMuted: '#a79fd6', edge: '#9d8cff', edgeText: '#d6cdff', edgeLabelBg: '#151030', codeBg: '#130d2a', codeBorder: '#2c2260' },
        {
          neutral: ['#1a1338', '#a590ff', '#efe9ff', '#c9bbff'],
          teal: ['#06242f', '#22e6ff', '#d4fbff', '#7cf0ff'],
          blue: ['#0c1a47', '#4f86ff', '#dbe6ff', '#8fb0ff'],
          violet: ['#260f52', '#b65cff', '#f0deff', '#cf99ff'],
          amber: ['#2b2a06', '#f5ff3d', '#fdffcf', '#f8ff7a'],
          rose: ['#330a28', '#ff2e97', '#ffd9ec', '#ff7abd'],
          green: ['#07291b', '#2bff9a', '#d2ffe8', '#7affc0'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      // A HUD wall panel: a raised label tab along the top with hazard ticks on it, a lit header
      // band, corner brackets, and a calm dark field for the words. The API's panel starts further
      // in and has a jack socket let into its left edge: the thing others plug into. Its bottom
      // right is left clear for "API".
      const x = kind === 'api' ? 20 : 8;
      const panel = `${x},30 ${x + 22},8 136,8 148,20 340,20 340,122 ${x + 14},122 ${x},108`;
      const ticks = [x + 32, x + 46, x + 60].map((a) => `M${a} 21l7 -9h7l-7 9z`).join('');
      return (
        neon(k, panel, 5) +
        lit(k, `${x + 3},30.5 ${x + 23},10.5 135,10.5 147,22.5 337.5,22.5 337.5,27 ${x + 3},27`, 0.26) +
        toneD(ticks, YEL) +
        rect(112, 13.5, 14, 5, 0, paint(MAG)) +
        line(`M${x + 24} 8H134`, WHT, 1.6, 0.75) +
        shade(`${x + 9},113 337.5,113 337.5,119.5 ${x + 15},119.5`, 0.3) +
        toneD(box(327, 46, 8, 3) + box(327, 55, 8, 3) + box(327, 64, 8, 3) + box(327, 73, 8, 3), k.L, 0.6) +
        line(`M${x + 12} 96V108H${x + 24}` + (kind === 'api' ? '' : 'M318 110H330V98'), k.C, 3.5) +
        line(`M${x + 44} 129H152`, CYN, 3, 0.9) +
        line('M250 129H306', MAG, 3, 0.9) +
        (kind === 'api'
          ? rect(1, 46, 36, 52, 0, paint(k.L) + o(0.24)) + rect(5, 50, 28, 44, 0, paint(INK, k.L, 5)) + rect(12, 59, 14, 7, 0, paint(CYN)) + rect(12, 78, 14, 7, 0, paint(CYN))
          : // Nothing below the tab: a service's description is written there.
            '')
      );
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A quad-rotor drone from above: four rotors on crossed arms, one eye. It does the errands.
        case 'worker': {
          const rotors = ring(28, 26, 19) + ring(108, 26, 19) + ring(28, 78, 19) + ring(108, 78, 19);
          return (
            tube('M28 26L108 78M108 26L28 78', k.L, 7, 7) +
            neonD(k, rotors, 4.5, 7) +
            line('M14 20L42 32M94 20L122 32M14 72L42 84M94 72L122 84', k.T, 3.5, 0.9) +
            toneD(ring(28, 26, 4.5) + ring(108, 26, 4.5) + ring(28, 78, 4.5) + ring(108, 78, 4.5), CHR) +
            neon(k, cut(45, 29, 46, 46, 12)) +
            lit(k, '56,32 80,32 88,40 88,45 48,45 48,40') +
            shade('48,60 88,60 88,64 80,72 56,72 48,64') +
            lamp(68, 53, 7.5, CYN) +
            rect(57, 26, 22, 6, 0, paint(YEL))
          );
        }
        // An uplink dish on its stand, beaming out: the system on the other side of the sky.
        case 'external': {
          const tilt = 'rotate(-20 58 46)';
          const bowl = 'M58 5A41 41 0 0 0 58 87Z';
          return (
            line('M40 82L28 99M40 82L58 99', k.L, W) +
            line('M12 100H74', k.L, W) +
            group(
              tilt,
              path(bowl, paint('none', k.L, 13) + o(0.24)) +
                path(bowl, paint(k.F, k.L, W)) +
                ellipse(58, 46, 16, 41, paint(k.F, k.L, W)) +
                ellipse(58, 46, 11, 34, paint(INK) + o(0.6)) +
                line('M49 11A37 37 0 0 0 24 34', WHT, 2.4, 0.6) +
                line('M58 46H90', k.L, 5) +
                tube('M105.6 30.4A22 22 0 0 1 105.6 61.6M121.1 24.2A38 38 0 0 1 121.1 67.8', k.C, 5, 7) +
                lamp(90, 46, 7, MAG),
            )
          );
        }
        // A countdown clock: an eight-sided face, the time still to run marked in hazard yellow.
        case 'scheduler':
          return (
            rect(58, 0, 16, 8, 0, paint(k.L)) +
            neon(k, cut(20, 7, 92, 92, 27)) +
            tone(cut(31, 18, 70, 70, 20), INK, 0.5) +
            lit(k, '23.5,35 48,10.5 56,10.5 23.5,43') +
            shade('108.5,71 84,95.5 76,95.5 108.5,63') +
            path('M66 53V20A33 33 0 0 1 94.6 36.5Z', paint(YEL)) +
            line('M36 53h8M88 53h8M66 81v8', k.L, I) +
            line('M66 53V22M66 53L92 38', k.T, 5) +
            circle(66, 53, 5.5, paint(k.T)) +
            circle(66, 53, 2, paint(INK))
          );
        // A checkpoint scanner arch: two pillars, a lintel, scan emitters, and the way in.
        case 'gateway':
          return (
            neon(k, '8,97 8,28 28,8 108,8 128,28 128,97 102,97 102,36 34,36 34,97') +
            tone('37,39 99,39 99,97 37,97', INK, 0.5) +
            lit(k, '11,29.5 29.5,11 37,11 11,37') +
            lit(k, '11,37 16,37 16,94 11,94') +
            shade('119.5,30 125,30 125,94 119.5,94') +
            shade('34,27.5 102,27.5 102,33 34,33', 0.3) +
            pad(54, 15, 28, 8, YEL) +
            tube('M38 52h11M87 52h11M38 68h11M87 68h11', CYN, 3.5, 6) +
            line('M68 95V60M55 72L68 59L81 72', k.T, 5) +
            line('M2 101H134', k.L, 3, 0.55)
          );
        // A highway interchange: one road in, three neon lanes out.
        case 'load-balancer':
          return (
            tube('M38 52H106M58 52L94 16H106M58 52L94 88H106', k.L, 6, 8, true) +
            neon(k, cut(6, 33, 34, 38, 9)) +
            lit(k, '9,43 16,36 30,36 9,57') +
            line('M17 44L26 52L17 60', k.T, 4.5) +
            pad(106, 5, 24, 22, CYN) +
            pad(106, 41, 24, 22, MAG) +
            pad(106, 77, 24, 22, YEL) +
            toneD(box(108, 7, 20, 3.5) + box(108, 43, 20, 3.5) + box(108, 79, 20, 3.5), WHT, 0.6) +
            toneD(box(108, 21, 20, 4) + box(108, 57, 20, 4) + box(108, 93, 20, 4), INK, 0.3)
          );
        // A blank mask: whoever is talking, this is the face they see.
        case 'proxy': {
          const eyes = 'M24 37L58 45V57L30 51ZM112 37L78 45V57L106 51Z';
          return (
            neon(k, '22,7 114,7 128,30 117,69 86,97 50,97 19,69 8,30') +
            shade('68,10 112.5,10 125,30 114.5,67.5 85,94 68,94', 0.3) +
            lit(k, '23.5,10 46,10 13,38 11,30') +
            path(eyes, paint('none', CYN, 10) + o(0.24)) +
            path(eyes, paint(INK, CYN, 3.5)) +
            line('M56 76V87M68 74V89M80 76V87', k.T, I) +
            tone('57,7 79,7 68,22', YEL)
          );
        }
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // Data cells racked one on another, each with its light on: the stacked platters of any store.
        case 'generic': {
          const ys = [8, 40, 72];
          const slabs = ys.map((y) => dOf(cut(22, y, 96, 26, 8))).join('');
          return (
            neonD(k, slabs) +
            toneD(ys.map((y) => dOf(`31,${y + 3} 109,${y + 3} 115,${y + 9} 25,${y + 9}`)).join(''), k.L, 0.24) +
            toneD(ys.map((y) => dOf(`25,${y + 18} 115,${y + 18} 109,${y + 23} 31,${y + 23}`)).join(''), INK, 0.34) +
            ys.map((y, i) => pad(34, y + 9, 12, 8, [CYN, MAG, CYN][i])).join('') +
            line(ys.map((y) => `M57 ${y + 13}H90`).join(''), k.T, I, 0.85) +
            toneD(ys.map((y) => box(98, y + 10, 8, 6)).join(''), YEL)
          );
        }
        // A megatower: rows and columns of lit windows, every one in its place.
        case 'sql': {
          const windows = (cells: number[][]) => cells.map(([c, r]) => box(49 + c * 12, 27 + r * 16, 9, 9)).join('');
          const all = [0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => [c, r])).filter(([c, r]) => !((c === 1 && r === 1) || (c === 0 && r === 3)));
          return (
            path(dOf('16,100 16,60 26,50 46,50 46,100') + dOf('94,100 94,50 114,50 124,60 124,100'), paint(k.F, k.L, 4.5)) +
            toneD(box(18.5, 62, 25, 38) + box(96.5, 52.5, 25, 47.5), INK, 0.32) +
            tube('M31 64V90M109 64V90', CYN, 4, 6) +
            line('M70 14V9', k.L, 4.5) +
            lamp(70, 7, 3.4, MAG) +
            neon(k, '42,100 42,24 52,14 88,14 98,24 98,100') +
            shade('85,17 87,17 95,25 95,100 85,100', 0.32) +
            lit(k, '45,25 53,17 59,17 45,31') +
            toneD(windows(all), k.T) +
            toneD(windows([[1, 1]]), YEL) +
            toneD(windows([[0, 3]]), CYN) +
            line('M6 101H134', k.L, 5)
          );
        }
        // Loose holo cubes, no two the same size, drifting: documents of any shape.
        case 'nosql':
          return (
            cube(k, 46, 60, 36, true) +
            line('M22 58L37 67M22 70L37 79', k.T, 3, 0.75) +
            group('rotate(14 104 34)', cube(k, 104, 34, 23)) +
            group('rotate(-12 106 84)', cube(k, 106, 84, 15)) +
            line('M70 103H90', CYN, 3, 0.9) +
            line('M8 104H30', MAG, 3, 0.9)
          );
        // A battery cell with a bolt on it: fast, and gone when the power is.
        case 'cache': {
          const bolt = '76,27 48,58 64,58 56,83 88,49 70,49';
          return (
            chrome(120, 40, 13, 28) +
            neon(k, cut(8, 20, 112, 68, 12)) +
            lit(k, '21,23.5 107,23.5 116.5,33 11.5,33') +
            shade('11.5,75 116.5,75 107,84.5 21,84.5') +
            line('M27 34V74', k.L, 5) +
            line('M100 42V66M108 42V66', CYN, 3.5) +
            poly(bolt, paint('none', YEL, 9) + o(0.26)) +
            tone(bolt, YEL)
          );
        }
        // A stack of tabbed data folders, one behind the other.
        case 'file-system': {
          const folder = (x: number, y: number) => `${x},${y + 56} ${x},${y + 8} ${x + 8},${y} ${x + 38},${y} ${x + 48},${y + 10} ${x + 100},${y + 10} ${x + 100},${y + 56}`;
          return (
            poly(folder(34, 4), paint(k.F, k.L, 4.5)) +
            shade(folder(34, 4), 0.4) +
            rect(46, 8, 20, 4, 0, paint(MAG)) +
            poly(folder(20, 23), paint(k.F, k.L, 4.5)) +
            shade(folder(20, 23), 0.24) +
            rect(32, 27, 20, 4, 0, paint(CYN)) +
            neon(k, folder(6, 42)) +
            lit(k, '9,55 103,55 103,61 9,61') +
            shade('9,89 103,89 103,95 9,95') +
            rect(17, 46, 20, 5, 0, paint(YEL)) +
            line('M20 72H76M20 83H56', k.T, I)
          );
        }
        // A shipping container: a ribbed steel box of whatever was put in it.
        case 'object-storage':
          return (
            poly('8,38 30,16 130,16 130,78 108,100 8,100', paint('none', k.L, 13) + o(0.24)) +
            poly('8,38 30,16 130,16 108,38', paint(k.F, k.L, 5)) +
            lit(k, '14,35.5 31,18.5 124,18.5 107,35.5', 0.3) +
            poly('108,38 130,16 130,78 108,100', paint(k.F, k.L, 5)) +
            shade('110.5,39 127.5,22 127.5,77 110.5,94', 0.42) +
            poly('8,38 108,38 108,100 8,100', paint(k.F, k.L, W)) +
            line('M24 49V89M39 49V89M54 49V89M69 49V89', k.L, I, 0.85) +
            shade('10.5,90 105.5,90 105.5,97.5 10.5,97.5') +
            line('M11 38H105', WHT, 1.6, 0.7) +
            pad(82, 47, 16, 12, YEL) +
            rect(84, 78, 12, 6, 0, paint(CYN))
          );
        // A cybernetic eye inside a scanner reticle: made for finding.
        case 'search-index':
          return (
            neon(k, '6,54 40,18 100,18 134,54 100,90 40,90') +
            lit(k, '10.5,54 41.5,21 51,21 20,54') +
            shade('129.5,54 98.5,87 89,87 120,54') +
            circle(70, 54, 25, paint(INK, k.T, 5)) +
            circle(70, 54, 15, paint('none', k.L, 4) + o(0.6)) +
            lamp(70, 54, 8, CYN) +
            line('M70 4V20M70 88V104M18 54h13M109 54h13', k.T, I)
          );
        // A holo grid panel: one table, its header row lit, rows and columns ruled.
        case 'table':
          return (
            neon(k, cut(8, 10, 124, 88, 0, 14, 0, 14)) +
            tone('8,10 118,10 132,24 132,32 8,32', k.L, 0.6) +
            line('M18 21H40M60 21H82M102 21H116', INK, 4, 0.75) +
            rect(52, 56, 38, 18, 0, paint(CYN) + o(0.4)) +
            shade('10.5,78 129.5,78 129.5,95.5 23,95.5 10.5,83', 0.26) +
            line('M8 54H132M8 76H132M50 32V98M92 32V98', k.L, I) +
            rect(102, 60, 14, 10, 0, paint(YEL)) +
            rect(18, 60, 14, 10, 0, paint(k.T) + o(0.8))
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // A maglev train on its rail: cars in a line, the one at the front lit, next to arrive.
        case 'queue': {
          const xs = [6, 72, 138];
          const cars = xs.map((x) => dOf(cut(x, 10, 60, 38, 8, 8, 0, 0))).join('');
          return (
            tube('M2 59H274', k.L, 4, 6, true) +
            line('M12 53H264', MAG, 2.5, 0.9) +
            line('M66 38h6M132 38h6M198 38h6', k.L, 5) +
            neonD(k, cars, 4.5, 6.5) +
            toneD(xs.map((x) => box(x + 10, 20, 40, 11)).join(''), INK) +
            toneD(xs.map((x) => box(x + 10, 28, 40, 3)).join(''), CYN, 0.8) +
            toneD(xs.map((x) => box(x + 2.5, 40, 55, 5.5)).join(''), INK, 0.34) +
            line(xs.map((x) => `M${x + 10} 13.6H${x + 50}`).join(''), WHT, 1.8, 0.65) +
            neon(k, '204,48 204,10 240,10 270,40 270,48', 4.5, 7) +
            shade('206.5,40 267,40 267.5,45.5 206.5,45.5') +
            poly('213,20 236,20 247,31 213,31', paint('none', YEL, 8) + o(0.26)) +
            tone('213,20 236,20 247,31 213,31', YEL) +
            rect(258, 41, 10, 4, 0, paint(CYN))
          );
        }
        // A street loudhailer, its one announcement split three ways to three billboards.
        case 'topic':
          return (
            tube('M48 32H90M90 32L110 12H212M90 32H212M90 32L110 52H212', k.L, 5, 7, true) +
            neon(k, '6,21 20,21 44,6 44,58 20,43 6,43', 5, 7) +
            shade('20,32 41.5,32 41.5,53.5 21,41', 0.32) +
            line('M20 21V43', k.L, I) +
            pad(52, 26, 12, 12, MAG) +
            pad(214, 4, 56, 15, CYN) +
            pad(214, 25, 56, 15, MAG) +
            pad(214, 46, 56, 15, YEL) +
            line('M222 11.5h20M250 11.5h12M222 32.5h12M242 32.5h20M222 53.5h24M254 53.5h8', INK, 3.5, 0.6)
          );
        // A signal: one unbroken pulse train running the length, heading right.
        case 'stream': {
          const wave = 'M6 44H14L42 16H56L84 44H98L126 16H140L168 44H182L210 16H224L252 44H256';
          const head = '254,29 274,44 254,59';
          return (
            line('M6 60H248', k.L, 2.5, 0.45) +
            group('translate(4 5)', line(wave, CYN, 4, 0.85)) +
            line(wave, k.L, 19, 0.22) +
            line(wave, k.L, 10) +
            line(wave, WHT, 2.4, 0.8) +
            poly(head, paint('none', YEL, 8) + o(0.26)) +
            tone(head, YEL)
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
          return group('translate(-10.4 30) scale(0.62)', streetFigure(k, 7, true)) + group('translate(56 30) scale(0.62)', streetFigure(k, 7, true)) + streetFigure(k);
        // A corporate fixer: hat, tie and a briefcase. Someone from another outfit.
        case 'thirdParty':
          return (
            neon(k, '6,78 6,58 22,43 60,43 76,58 76,78', 5, 7) +
            shade('41,46 59,46 73.5,59 73.5,78 41,78', 0.3) +
            tone('32,45.5 50,45.5 41,57', CHR) +
            tone('38,55 44,55 46,66 41,75 36,66', MAG) +
            poly(cut(26, 15, 30, 32, 8), paint(k.F, k.L, 5)) +
            rect(21, 23, 40, 13, 0, paint(CYN) + o(0.26)) +
            rect(24, 26, 34, 7, 0, paint(CYN)) +
            poly('29,16 31,4 51,4 53,16', paint(k.L, k.L, 4)) +
            rect(30, 10, 22, 4, 0, paint(INK) + o(0.55)) +
            line('M15 17H67', k.L, 6) +
            line('M89 54V46H103V54', k.L, 4.5) +
            neon(k, cut(78, 54, 36, 24, 4), 4.5, 6) +
            shade('80.5,67 111.5,67 111.5,75.5 80.5,75.5') +
            line('M78 64H114', k.L, 3.5) +
            rect(91, 60, 10, 8, 0, paint(YEL))
          );
        // A terminal with a prompt waiting on it: a system that takes part.
        case 'system':
          return (
            line('M60 60V70', k.L, 9) +
            poly('30,79 38,69 82,69 90,79', paint(k.F, k.L, 4.5)) +
            neon(k, cut(10, 6, 100, 54, 10), 5, 7) +
            tone(cut(19, 14, 82, 38, 5), INK) +
            tone('19,19 24,14 46,14 19,41', WHT, 0.1) +
            line('M54 24H90M54 32H78', k.L, 3, 0.5) +
            tube('M29 24L40 33L29 42', CYN, 4.5, 6) +
            line('M50 42H68', YEL, 5)
          );
        // A handheld deck: a screen with signal bars and one key.
        case 'device':
          return (
            neon(k, cut(43, 5, 34, 72, 7), 5, 6) +
            rect(49, 13, 22, 42, 0, paint(INK)) +
            tone('49,13 62,13 49,32', WHT, 0.12) +
            rect(52, 17, 8, 3, 0, paint(MAG)) +
            line('M54 49V43M60 49V35M66 49V27', CYN, I) +
            rect(54, 62, 12, 6, 0, paint(YEL))
          );
        // An android head on its shoulders: one eye glowing, the other a slit, an aerial, a vent for a mouth.
        case 'agent':
          return (
            poly('18,80 30,70 90,70 102,80', paint(k.F, k.L, 4.5)) +
            chrome(10, 21, 12, 20) +
            chrome(98, 21, 12, 20) +
            line('M104 21V12', k.L, I) +
            lamp(104, 9, 3.8, MAG) +
            neon(k, '34,6 86,6 98,18 98,41 86,53 82,66 38,66 34,53 22,41 22,18', 5, 7) +
            shade('60,8.5 85,8.5 95.5,19 95.5,40 84,51.5 80,63.5 60,63.5', 0.3) +
            lit(k, '24.5,19 35,8.5 47,8.5 24.5,31') +
            circle(46, 30, 11, paint(INK, k.T, I)) +
            lamp(46, 30, 5, CYN) +
            line('M68 30H86', k.T, 5) +
            line('M50 53V60M60 53V60M70 53V60', k.T, 3.5)
          );
      }
    },

    // A module card: a smaller HUD panel, opposite corners cut, a lit rule along the top, a bracket
    // in the other two corners, a hazard tab on its edge. The middle is left for the name.
    componentCard: (k) =>
      neon(k, '6,6 274,6 294,26 294,100 26,100 6,80', 5, 7) +
      lit(k, '8.5,8.5 273,8.5 281,16.5 8.5,16.5', 0.26) +
      rect(20, 10.5, 18, 4, 0, paint(MAG)) +
      rect(42, 10.5, 8, 4, 0, paint(CYN)) +
      shade('8.5,79 27,97.5 291.5,97.5 291.5,91 30,91 8.5,69.5', 0.26) +
      line('M16 40V28H28M270 90H284V76', k.C, 3.5) +
      toneD(box(281, 36, 7, 3) + box(281, 44, 7, 3) + box(281, 52, 7, 3), k.L, 0.6) +
      pad(1, 42, 8, 20, YEL),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A chip on its contacts, the die lit in the middle.
        case 'module':
          return (
            line('M39 5V16M53 5V16M67 5V16M81 5V16M39 88V99M53 88V99M67 88V99M81 88V99M9 34H22M9 52H22M9 70H22M98 34H111M98 52H111M98 70H111', k.L, W) +
            neon(k, cut(22, 16, 76, 72, 10)) +
            lit(k, '31,19 89,19 95,25 95,29 25,29 25,25') +
            shade('25,75 95,75 95,79 89,85 31,85 25,79') +
            pad(43, 36, 34, 32, k.C) +
            line('M50 46h9v12h11', INK, 3.5, 0.6) +
            circle(33, 37, 3.6, paint(MAG))
          );
        // A jack plug on its cable: what you push into somebody else's socket.
        case 'adapter': {
          const tip = '106,41 118,45 124,52 118,59 106,63';
          return group(
            'translate(0 -4) rotate(-35 60 52)',
            line('M24 52H8C-6 52 -8 68 6 76', k.L, 8) +
              neon(k, cut(22, 32, 46, 40, 8)) +
              lit(k, '31,35 59,35 65,41 65,44 25,44 25,41') +
              shade('25,60 65,60 65,63 59,69 31,69 25,63') +
              line('M37 46V58M49 46V58', k.T, I) +
              chrome(68, 39, 10, 26) +
              rect(78, 44, 28, 16, 0, paint(k.F, k.L, 4.5)) +
              line('M91 44V60', k.L, I) +
              poly(tip, paint('none', CYN, 9) + o(0.26)) +
              poly(tip, paint(CYN, k.L, 3)),
          );
        }
        // A neural socket: a ring on its mounting lugs, pin holes waiting for a plug.
        case 'port': {
          const pins = [
            [46, 46],
            [60, 40],
            [74, 46],
            [50, 62],
            [70, 62],
          ];
          return (
            chrome(4, 41, 16, 22) +
            chrome(100, 41, 16, 22) +
            circle(60, 52, 43, paint('none', k.L, 13) + o(0.24)) +
            circle(60, 52, 43, paint(k.F, k.L, W)) +
            line('M93.8 64.3A36 36 0 0 1 63.1 87.9', INK, 8, 0.36) +
            line('M26.2 39.7A36 36 0 0 1 56.9 16.1', WHT, 2.6, 0.6) +
            circle(60, 52, 28, paint(INK, k.T, I)) +
            toneD(pins.map(([cx, cy]) => ring(cx, cy, 7.5)).join(''), CYN, 0.26) +
            toneD(pins.map(([cx, cy]) => ring(cx, cy, 4.2)).join(''), CYN) +
            rect(55, 11.5, 10, 6, 0, paint(YEL))
          );
        }
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A data shard: a slab with one corner sheared off (the chip of it still falling), lines of
        // text and a barcode.
        case 'file':
          return (
            neon(k, '8,6 44,6 74,36 74,92 22,92 8,78', 5, 7) +
            lit(k, '10.5,8.5 43,8.5 49,14.5 10.5,14.5') +
            shade('23,83.5 71.5,83.5 71.5,89.5 23,89.5') +
            tone('58,3 82,27 82,3', MAG, 0.9) +
            line('M20 42H48M20 54H60', k.T) +
            barcode(20, 66, 13, CYN)
          );
        // A slider panel: three faders, each set somewhere different.
        case 'config':
          return (
            neon(k, cut(7, 7, 72, 86, 8), 5, 7) +
            lit(k, '16,9.5 70,9.5 76.5,16 9.5,16') +
            shade('9.5,84 76.5,84 70,90.5 16,90.5') +
            line('M25 24V78M43 24V78M61 24V78', INK, 5.5, 0.75) +
            line('M25 40V78M43 68V78M61 52V78', k.L, 3.5) +
            pad(17, 30, 16, 10, CYN) +
            pad(35, 58, 16, 10, YEL) +
            pad(53, 42, 16, 10, MAG)
          );
        // A key, cut square like a circuit trace.
        case 'secret': {
          const hole = cut(36, 17, 22, 22, 6);
          return (
            neon(k, '34,6 60,6 74,20 74,37 60,51 54,51 54,62 70,62 70,72 54,72 54,78 66,78 66,88 54,88 54,94 40,94 40,51 34,51 20,37 20,20', 5, 7) +
            lit(k, '22.5,21 35,8.5 43,8.5 22.5,29') +
            shade('58,48.5 59,48.5 71.5,36 71.5,21 66,15.5 66,34') +
            poly(hole, paint('none', CYN, 9) + o(0.26)) +
            poly(hole, paint(INK, CYN, 3.5)) +
            line('M47 56V90', k.T, 3, 0.75) +
            toneD(box(64.5, 64.5, 3.5, 5) + box(60.5, 80.5, 3.5, 5), YEL) +
            line('M8 70H28', CYN, 3, 0.9) +
            line('M14 82H30', MAG, 3, 0.9)
          );
        }
        // A holo seal with its two ribbon tails and a tick: checked and signed.
        case 'certificate': {
          const tails = dOf('21,58 21,95 31.5,86 42,95 42,62') + dOf('44,62 44,95 54.5,86 65,95 65,58');
          return (
            path(tails, paint(k.F, k.L, 4.5)) +
            toneD(tails, MAG, 0.8) +
            neon(k, cut(8, 6, 70, 64, 20), 5, 7) +
            lit(k, '10.5,27 29,8.5 38,8.5 10.5,36') +
            shade('75.5,49 57,67.5 48,67.5 75.5,40') +
            poly(cut(18, 15, 50, 46, 13), paint('none', k.C, 2.6) + o(0.7)) +
            tube('M28 38L39 49L59 26', YEL, 5.5, 7)
          );
        }
      }
    },

    // A neon diamond with a chrome terminal at either side and a stud top and bottom, its middle
    // left empty for the word.
    junction: (k) =>
      chrome(0, 43, 11, 14) +
      chrome(89, 43, 11, 14) +
      neon(k, '50,8 92,50 50,92 8,50', 5.5, 7) +
      lit(k, '50,12 12,50 18.5,50 50,18.5') +
      shade('50,88 88,50 81.5,50 50,81.5') +
      tone('50,2 56,8 50,14 44,8', YEL) +
      tone('50,86 56,92 50,98 44,92', CYN),
  },

  // The city from far above, at night: street lines, a few blocks a hair lighter than the dark,
  // circuit-trace avenues with their 45-degree jogs, two lit junctions and a little rain.
  backdrop: {
    tile: [480, 400],
    draw: () => {
      const blocks = box(104, 76, 84, 52) + box(312, 244, 56, 76) + box(20, 184, 60, 34) + box(424, 84, 44, 44) + box(244, 340, 40, 28);
      const streets = 'M0 64H480M0 228H480M0 332H480M92 0V400M300 0V400M412 0V400';
      const traces =
        'M0 140H120L150 170H260L290 140H480' +
        'M200 0V60L230 90V180' +
        'M200 400V372L176 348H130' +
        'M380 0V30' +
        'M380 400V310L350 280V228' +
        'M0 290H60L84 266H150' +
        'M480 290H440';
      const pads = [
        [380, 30],
        [150, 266],
        [130, 348],
        [350, 228],
      ]
        .map(([x, y]) => box(x - 3, y - 3, 6, 6))
        .join('');
      const rain = [
        [40, 30],
        [150, 20],
        [262, 44],
        [352, 96],
        [450, 180],
        [60, 110],
        [226, 210],
        [330, 190],
        [128, 200],
        [30, 250],
        [268, 290],
        [420, 356],
        [96, 372],
        [330, 366],
        [182, 300],
        [452, 36],
      ]
        .map(([x, y], i) => `M${x} ${y}l${-3 - (i % 3)} ${10 + (i % 4) * 3}`)
        .join('');
      return (
        // Barely lighter than the night: seen from far out the blocks repeat, and must not read as a pattern.
        toneD(blocks, '#191241', 0.28) +
        line(streets, '#1c1440', 1) +
        line(traces, '#34287a', 1.4, 0.5) +
        toneD(pads, '#3a2d85', 0.5) +
        line(rain, '#9d8cff', 1.2, 0.12) +
        circle(230, 180, 11, paint(CYN) + o(0.06)) +
        circle(230, 180, 2.6, paint(CYN) + o(0.5)) +
        circle(440, 290, 11, paint(MAG) + o(0.06)) +
        circle(440, 290, 2.6, paint(MAG) + o(0.5))
      );
    },
  },
};

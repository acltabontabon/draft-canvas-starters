import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * High seas: an age-of-sail chart on parchment, inked like a woodcut. Every kind of shape is its
 * own object from the ship or the harbour: a service is a painted signboard, a worker a rowing
 * boat, a gateway a lighthouse; a data store is a barrel, a ledger, a sack of loot, a powder keg;
 * a queue is a bottle of messages, a topic a hoist of signal flags, a stream a boat on the
 * current. Planks, rope and brass throughout, with one red pennant as the spot of colour.
 * Always light: it is drawn on paper.
 */
const W = 6; // the outline of an object
const M = 4; // a mark inside it
const red = (k: Kit) => k.A('rose', 'chip');
const lamp = (k: Kit) => k.A('amber', 'chip');
const body = (k: Kit, w = W) => paint(k.F, k.L, w);
const line = (colour: string, w = M) => paint('none', colour, w);
const n = (value: number) => Math.round(value * 10) / 10;

/** A line of water: `count` half-waves, each `half` long, starting at (`x`, `y`). */
const waves = (x: number, y: number, half: number, amp: number, count: number) => `M${x} ${y}q${n(half / 2)} ${-amp} ${half} 0${`t${half} 0`.repeat(count - 1)}`;

/** A spark: a star of `points` points. */
function burst(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    out.push(`${n(cx + r * Math.cos(a))},${n(cy + r * Math.sin(a))}`);
  }
  return out.join(' ');
}

/** A tricorn hat seen from the front, its brim turned up at both ends, with a red cockade. */
const tricorn = (k: Kit) => path('M26 13Q40 28 60 26Q80 28 94 13Q82 16 74 12Q60 -3 46 12Q38 16 26 13Z', paint(k.L, k.L, 3)) + circle(60, 15, 4, paint(red(k)));

/** A sailor: striped shirt, red neckerchief, tricorn hat. Drawn at 120 by 82. */
const sailor = (k: Kit) =>
  path('M24 78Q24 48 60 48Q96 48 96 78Z', body(k, 5.5)) +
  path('M33 62H87M29 71H91', line(k.C, 3.5)) +
  path('M49 49L60 61L71 49Z', paint(red(k))) +
  circle(60, 32, 15, body(k, 5.5)) +
  tricorn(k);

/** A deckhand behind the sailor: a smaller figure in a knotted headscarf. */
const deckhand = (k: Kit, cx: number, knot: 1 | -1) =>
  path(`M${cx - 20} 78Q${cx - 20} 55 ${cx} 55Q${cx + 20} 55 ${cx + 20} 78Z`, body(k, 5)) +
  circle(cx, 41, 11.5, body(k, 5)) +
  path(`M${cx - 12} 39Q${cx - 12} 27 ${cx} 27Q${cx + 12} 27 ${cx + 12} 39Q${cx} 33 ${cx - 12} 39Z`, paint(k.C, k.L, 3)) +
  path(`M${cx + knot * 11} 37L${cx + knot * 20} 44`, line(k.L, 4));

/** A rolled chart standing in a chest: its foot at (`x`, 64), leaning by `angle` degrees. */
const rolledChart = (k: Kit, x: number, angle: number, length: number, ribbon?: string) =>
  group(
    `translate(${x} 64) rotate(${angle})`,
    rect(-10, -length, 20, length, 0, paint(k.K, k.L, 4.5)) + (ribbon ? rect(-10, -length + 16, 20, 7, 0, paint(ribbon)) : '') + ellipse(0, -length, 10, 5, paint(k.F, k.L, 4)),
  );

export const highSeas: Pack = {
  id: 'high-seas',
  name: 'High seas',
  summary: 'A woodcut sea chart: a lighthouse, a ledger, a powder keg, a bottle of messages',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 40,
  style: {
    hand: { base: 'draft' },
    general: { shadow: false },
    connectors: { colour: 'plain' },
    schemes: {
      light: scheme(
        { canvas: '#f6e7c8', grid: '#e6d3ab', text: '#33230f', textMuted: '#6a553d', edge: '#8a6f4d', edgeText: '#6a553d', edgeLabelBg: '#fbf3e0', codeBg: '#f1e2bf', codeBorder: '#dcc79a' },
        {
          neutral: ['#fbf1da', '#7a5a3a', '#33230f', '#6b4a22'],
          teal: ['#e3efe6', '#2f7c78', '#17443f', '#2a6e69'],
          blue: ['#e2ecf2', '#3f7c9c', '#1c4258', '#33698a'],
          violet: ['#ece4ee', '#7a5c93', '#3f2a52', '#694c82'],
          amber: ['#f8e6b8', '#a8741d', '#5a3a08', '#94640f'],
          rose: ['#f6ddd2', '#b5402f', '#6b1f14', '#a03526'],
          green: ['#e6ecd2', '#5f7f3a', '#2f4418', '#516e30'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      // A painted signboard with a rope run round its edge.
      const board = rect(3, 3, 342, 126, 14, body(k));
      if (kind === 'generic') return board + rect(14, 14, 320, 104, 6, line(k.C, 3));
      // An API is the same board with an iron mooring ring on its left edge, something to tie up
      // to. Its rope stops short of the bottom-right corner, where the app writes "API".
      return (
        board +
        path('M296 118H20Q14 118 14 112V20Q14 14 20 14H328Q334 14 334 20V92', line(k.C, 3)) +
        circle(296, 118, 4.5, paint(k.C)) +
        circle(334, 92, 4.5, paint(k.C)) +
        rect(20, 44, 14, 14, 4, paint(k.L)) +
        circle(27, 71, 14, line(k.L, 6))
      );
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A rowing boat: three hands at the oars, doing the work. A pennant at the stern.
        case 'worker':
          return (
            path(waves(4, 97, 16, 9, 8), line(k.C, 3.5)) +
            path('M11 50V16', line(k.L, 4)) +
            path('M11 14L35 21L11 29Z', paint(red(k))) +
            circle(50, 38, 9, paint(k.C, k.L, 4.5)) +
            circle(78, 38, 9, paint(k.C, k.L, 4.5)) +
            circle(106, 38, 9, paint(k.C, k.L, 4.5)) +
            path('M6 48Q16 50 22 58H114Q120 50 130 48Q130 86 100 86H36Q6 86 6 48Z', body(k)) +
            path('M15 69H121', line(k.L, 3)) +
            path('M48 50L18 96M76 50L46 96M104 50L74 96', line(k.T, 4.5)) +
            path('M23 88L17 97M51 88L45 97M79 88L73 97', line(k.T, 10))
          );
        // A far island with one palm tree: land that is not yours.
        case 'external':
          return (
            path(waves(6, 98, 20, 9, 6), line(k.C, 4)) +
            path('M8 87Q20 62 54 59Q98 55 128 87Z', body(k)) +
            path('M64 60Q58 38 72 23', line(k.L, 6)) +
            path('M72 23Q46 -2 22 30Q50 16 72 23Z', paint(k.C, k.L, 3.5)) +
            path('M72 23Q44 22 38 50Q54 30 72 23Z', paint(k.C, k.L, 3.5)) +
            path('M72 23Q100 -2 122 30Q96 16 72 23Z', paint(k.C, k.L, 3.5)) +
            path('M72 23Q102 22 108 50Q92 30 72 23Z', paint(k.C, k.L, 3.5))
          );
        // An hourglass: the watch is kept by the sand.
        case 'scheduler':
          return (
            path('M32 14V90M104 14V90', line(k.L, 4.5)) +
            path('M42 14H94Q94 38 75 52Q94 66 94 90H42Q42 66 61 52Q42 38 42 14Z', paint(k.K, k.L, 5)) +
            path('M51 28H85Q81 40 68 48Q55 40 51 28Z', paint(k.C)) +
            path('M68 48V76', line(k.C, 3.5)) +
            path('M49 88Q68 58 87 88Z', paint(k.C)) +
            rect(23, 4, 90, 11, 5, body(k, 5)) +
            rect(23, 89, 90, 11, 5, body(k, 5))
          );
        // A lighthouse with its door at the foot: the one way into the harbour.
        case 'gateway':
          return (
            path('M20 100Q40 82 68 82Q96 82 116 100Z', paint(k.C, k.L, 4)) +
            path('M50 92L56 36H80L86 92Z', body(k)) +
            path('M54.3 52H81.7L83.2 66H52.8Z', paint(k.C)) +
            path('M62 92V80Q68 72 74 80V92Z', paint(k.T)) +
            rect(58, 18, 20, 18, 2, paint(lamp(k), k.L, 4)) +
            path('M49 36H87', line(k.L, 6)) +
            path('M53 18L68 5L83 18Z', paint(red(k), k.L, 4)) +
            path('M46 20L16 8M44 27H8M46 34L16 46M90 20L120 8M92 27H128M90 34L120 46', line(lamp(k), 4))
          );
        // A block and tackle: one rope hauled in, three paid out.
        case 'load-balancer':
          return (
            path('M5 52H21', line(k.L, 7)) +
            circle(29, 52, 8, line(k.L, 4.5)) +
            path('M70 52L118 15M70 52H122M70 52L118 89', line(k.L, 4.5)) +
            rect(38, 19, 42, 66, 17, body(k)) +
            circle(59, 52, 13, paint(k.C, k.L, 4)) +
            circle(59, 52, 4, paint(k.F)) +
            circle(120, 14, 8, paint(k.C, k.L, 4)) +
            circle(124, 52, 8, paint(k.C, k.L, 4)) +
            circle(120, 90, 8, paint(k.C, k.L, 4))
          );
        // A messenger gull on the wing, a sealed letter slung beneath it: it carries word between two ships.
        case 'proxy':
          return (
            path('M74 50Q84 22 122 5Q114 34 94 54Z', body(k, 5)) +
            path('M32 50L6 41L13 57L8 68L36 63Z', body(k, 5)) +
            path('M54 70L52 80M70 70L72 80', line(k.L, 3)) +
            ellipse(62, 56, 36, 15, body(k, 5)) +
            circle(100, 46, 12, body(k, 5)) +
            path('M110 41L131 48L110 54Z', paint(lamp(k), k.L, 3)) +
            circle(103, 43, 2.4, paint(k.T)) +
            path('M42 53Q40 22 16 4Q60 10 84 52Q64 61 42 53Z', body(k, 5)) +
            rect(42, 78, 40, 22, 3, paint(k.K, k.L, 4)) +
            path('M42 78L62 91L82 78', line(k.L, 3)) +
            circle(62, 91, 4.5, paint(red(k)))
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // A barrel, staved and hooped twice.
        case 'generic':
          return (
            path('M36 5H104Q126 54 104 103H36Q14 54 36 5Z', body(k)) +
            path('M56 6Q48 54 56 102M84 6Q92 54 84 102', line(k.L, 2.5)) +
            path('M29 27Q70 35 111 27M29 81Q70 89 111 81', line(k.L, 5)) +
            circle(70, 54, 5, paint(k.T))
          );
        // The ship's ledger, open: ruled rows on each page, a ribbon to keep the place.
        case 'sql':
          return (
            path('M6 23Q38 12 70 25Q102 12 134 23V98Q102 88 70 101Q38 88 6 98Z', paint(k.C, k.L, 5)) +
            path('M65 94V106L70 101L75 106V94Z', paint(red(k))) +
            path('M10 16Q40 5 70 18Q100 5 130 16V90Q100 80 70 92Q40 80 10 90Z', body(k)) +
            path('M70 18V92', line(k.L, 4)) +
            path('M21 32Q42 25 59 33M21 48Q42 41 59 49M21 64Q42 57 59 65M81 33Q98 25 119 32M81 49Q98 41 119 48M81 65Q98 57 119 64', line(k.T, 4))
          );
        // A sack of loot, tied at the neck: a coin, a gem and an ingot, whatever came aboard.
        case 'nosql':
          return (
            path('M50 26Q40 12 46 4Q58 10 70 6Q82 10 94 4Q100 12 90 26Q126 46 124 80Q122 103 70 103Q18 103 16 80Q14 46 50 26Z', body(k)) +
            path('M48 27Q70 35 92 27', line(k.C, 6)) +
            path('M90 28Q102 34 98 46', line(k.C, 4)) +
            circle(46, 72, 11, paint(k.C, k.T, 3.5)) +
            path('M74 48L88 63L74 78L60 63Z', paint(k.K, k.T, 3.5)) +
            rect(88, 74, 17, 15, 2, paint(k.F, k.T, 3.5))
          );
        // A powder keg with the fuse lit: quick, and not for keeping.
        case 'cache':
          return (
            path('M62 34Q58 13 78 13Q92 13 102 15', line(k.T, 4.5)) +
            poly(burst(111, 15, 12, 5.5, 8), paint(red(k))) +
            path('M30 34H110Q130 68 110 103H30Q10 68 30 34Z', body(k)) +
            path('M52 36Q44 68 52 101M88 36Q96 68 88 101', line(k.L, 2.5)) +
            path('M24 48Q70 55 116 48M24.5 91Q70 98 115.5 91', line(k.L, 4.5)) +
            path('M76 55L58 72H69L63 87L84 68H72Z', paint(k.T))
          );
        // A chest of rolled charts: many papers, each in its place.
        case 'file-system':
          return (
            rolledChart(k, 38, -18, 52) +
            rolledChart(k, 70, 3, 53, red(k)) +
            rolledChart(k, 100, 20, 50) +
            rect(15, 60, 110, 42, 6, body(k)) +
            path('M18 87H122', line(k.L, 2.5)) +
            rect(8, 52, 124, 14, 5, body(k, 5)) +
            path('M61 62H79V75Q70 85 61 75Z', paint(k.C, k.L, 3.5))
          );
        // A bucket heaped with shot: round things of any size, kept loose.
        case 'object-storage':
          return (
            path('M21 46Q21 5 70 5Q119 5 119 46', line(k.L, 4.5)) +
            circle(46, 36, 14, paint(k.C, k.L, 4)) +
            circle(94, 36, 14, paint(k.C, k.L, 4)) +
            circle(70, 28, 15, paint(k.C, k.L, 4)) +
            path('M18 44H122L108 102H32Z', body(k)) +
            path('M52 46L56 100M88 46L84 100', line(k.L, 2.5)) +
            path('M22.5 61H117.5M29 89H111', line(k.L, 4.5))
          );
        // A spyglass, drawn out: made for finding.
        case 'search-index':
          return group(
            'rotate(-28 68 56)',
            rect(8, 47, 42, 18, 3, body(k, 5)) +
              rect(48, 43, 42, 26, 3, body(k, 5)) +
              rect(88, 38, 40, 36, 3, body(k)) +
              rect(2, 45, 9, 22, 3, paint(k.C, k.L, 3.5)) +
              rect(45, 41, 8, 30, 2, paint(k.C, k.L, 3.5)) +
              rect(85, 36, 8, 40, 2, paint(k.C, k.L, 3.5)) +
              rect(124, 34, 10, 44, 3, paint(k.C, k.L, 4)),
          );
        // A tally slate hung from a nail: one ruled table.
        case 'table':
          return (
            path('M36 22L70 6L104 22', line(k.L, 4)) +
            circle(70, 6, 3.5, paint(k.T)) +
            rect(12, 22, 116, 80, 5, paint(k.F)) +
            rect(14, 24, 112, 18, 3, paint(k.C)) +
            path('M12 42H128M12 62H128M12 82H128M50 24V102M90 24V102', line(k.T, 3.5)) +
            rect(12, 22, 116, 80, 5, line(k.L, W))
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // A corked bottle on its side, three rolled notes inside waiting their turn at the neck.
        case 'queue': {
          const note = (x: number) => rect(x, 19, 34, 26, 4, paint(k.K, k.T, 3.5)) + path(`M${x + 17} 20V44`, line(red(k), 5));
          return (
            path('M12 6H176Q198 6 208 21H246V43H208Q198 58 176 58H12Q4 58 4 50V14Q4 6 12 6Z', body(k, 5)) +
            path('M20 13H150', line(k.K, 3)) +
            note(24) +
            note(76) +
            note(128) +
            rect(243, 16, 10, 32, 3, body(k, 4)) +
            rect(253, 22, 19, 20, 4, paint(k.C, k.L, 4))
          );
        }
        // A hoist of signal flags: one message run up for every ship in sight.
        case 'topic':
          return (
            path('M4 9H272', line(k.L, 5)) +
            rect(14, 9, 40, 40, 2, body(k, 4.5)) +
            path('M34 11V47M16 29H52', line(k.C, 6)) +
            path('M66 9H108L87 57Z', paint(k.C, k.L, 4.5)) +
            path('M120 9H160V57L140 43L120 57Z', body(k, 4.5)) +
            path('M122 25H158', line(k.T, 4.5)) +
            rect(172, 9, 40, 40, 2, body(k, 4.5)) +
            path('M172 9H212V49Z', paint(red(k), k.L, 4.5)) +
            path('M224 9H266L245 57Z', body(k, 4.5)) +
            circle(245, 24, 6, paint(k.C))
          );
        // A current: a small boat carried along on a band of sea.
        case 'stream':
          return (
            path('M178 26V3', line(k.L, 4)) +
            path('M183 4L208 21H183Z', paint(k.K, k.L, 3.5)) +
            path('M173 7L152 21H173Z', paint(red(k), k.L, 3.5)) +
            path('M140 26H216Q212 48 196 48H160Q144 48 140 26Z', paint(k.C, k.L, 4.5)) +
            path(`${waves(4, 41, 22.3, 9, 12)}V55Q271.6 61 265 61H10Q4 61 4 55Z`, body(k, 5)) +
            path(waves(15, 52, 22.3, 7, 11), line(k.C, 3.5))
          );
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A sailor in a tricorn hat.
        case 'human':
          return sailor(k);
        // A crew of three: the sailor, and a deckhand at each shoulder.
        case 'group':
          return deckhand(k, 24, -1) + deckhand(k, 96, 1) + group('translate(6 7.8) scale(0.9)', sailor(k));
        // A merchant from another port: a cloak, and a wide-brimmed hat with a feather.
        case 'thirdParty':
          return (
            path('M20 78Q32 48 60 48Q88 48 100 78Z', paint(k.C, k.L, 5.5)) +
            path('M48 49L60 68L72 49Z', body(k, 3.5)) +
            circle(60, 35, 13, body(k, 5.5)) +
            path('M75 14Q92 -4 108 10Q94 10 82 22Z', paint(k.C, k.L, 3)) +
            path('M44 24Q44 5 60 5Q76 5 76 24Z', paint(k.L, k.L, 3)) +
            ellipse(60, 25, 38, 6.5, paint(k.L)) +
            path('M46 18H74', line(k.C, 3.5))
          );
        // A whole ship under sail: a system that answers for itself.
        case 'system':
          return (
            path('M42 58V4M78 58V12', line(k.L, 4.5)) +
            path('M42 4L60 8.5L42 13Z', paint(red(k))) +
            path('M24 18Q42 24 60 18V46Q42 52 24 46Z', body(k, 4)) +
            path('M64 23Q78 28 92 23V46Q78 51 64 46Z', body(k, 4)) +
            path('M97 22L114 45H97Z', body(k, 3.5)) +
            path('M5 50H24V58H94L115 48Q112 79 88 79H30Q8 77 5 50Z', paint(k.C, k.L, 5.5)) +
            path('M16 67H104', line(k.F, 3))
          );
        // A ship's lantern, lit: something small you carry.
        case 'device':
          return (
            circle(60, 9, 6.5, line(k.L, 4)) +
            path('M46 26L52 16H68L74 26Z', paint(k.L, k.L, 3)) +
            rect(45, 26, 30, 40, 3, body(k, 5)) +
            path('M60 32Q71 47 60 59Q49 47 60 32Z', paint(lamp(k))) +
            rect(41, 66, 38, 12, 4, body(k, 5))
          );
        // A parrot on its perch: it listens, and it talks back.
        case 'agent':
          return (
            path('M44 44L6 66L15 78L54 60Z', paint(red(k), k.L, 3.5)) +
            path('M36 69H104', line(k.L, 6)) +
            path('M64 28Q40 34 38 52Q40 67 58 66Q80 63 86 44Q86 34 80 28Z', body(k, 5.5)) +
            path('M56 36Q44 46 48 60Q66 58 70 40Z', paint(k.C, k.L, 3.5)) +
            circle(74, 21, 16.5, body(k, 5.5)) +
            path('M87 10Q108 12 103 36Q98 26 86 29Z', paint(lamp(k), k.L, 3.5)) +
            circle(77, 17, 3.4, paint(k.T))
          );
      }
    },

    // A plank sawn rough at both ends and nailed down, the middle left clear.
    componentCard: (k) =>
      path('M12 4H288L296 20L290 37L296 54L290 71L296 88L288 104H12L4 88L10 71L4 54L10 37L4 20Z', body(k, 5)) +
      circle(26, 24, 4.5, paint(k.L)) +
      circle(26, 84, 4.5, paint(k.L)) +
      circle(274, 24, 4.5, paint(k.L)) +
      circle(274, 84, 4.5, paint(k.L)),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A crate, cross-braced.
        case 'module':
          return rect(10, 8, 100, 88, 5, body(k)) + path('M24 22L96 82M96 22L24 82', line(k.L, 4.5)) + rect(24, 22, 72, 60, 2, line(k.L, 3.5));
        // A grappling hook on its rope: it takes hold of the other ship.
        case 'adapter':
          return (
            path('M67 12Q84 0 98 13Q109 25 116 10', line(k.C, 5)) +
            circle(60, 16, 9, line(k.L, 5)) +
            path('M60 25V84', line(k.L, 7)) +
            path('M60 86Q28 90 18 58M60 86Q92 90 102 58', line(k.L, 7)) +
            path('M9 64L17 44L29 61Z', paint(k.L, k.L, 2)) +
            path('M111 64L103 44L91 61Z', paint(k.L, k.L, 2)) +
            path('M60 80L50 98H70Z', paint(k.L, k.L, 2))
          );
        // A brass porthole, bolted round, the sea showing through: an opening others look in by.
        case 'port': {
          const bolts = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => circle(n(60 + 37.5 * Math.cos((a * Math.PI) / 180)), n(52 + 37.5 * Math.sin((a * Math.PI) / 180)), 3.5, paint(k.L))).join('');
          return rect(103, 42, 13, 20, 3, paint(k.C, k.L, 3.5)) + circle(60, 52, 46, body(k)) + circle(60, 52, 28, paint(k.K, k.L, 5)) + path(waves(40, 58, 13.3, 9, 3), line(k.C, 4)) + bolts;
        }
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A scroll, rolled at the head and the foot.
        case 'file':
          return rect(15, 14, 56, 72, 0, body(k, 5)) + path('M26 37H60M26 50H60M26 63H48', line(k.T, 3.8)) + rect(5, 5, 76, 18, 9, body(k, 5)) + rect(5, 77, 76, 18, 9, body(k, 5));
        // The ship's wheel: how she is set to run.
        case 'config': {
          const spokes = [0, 45, 90, 135].map((a) => {
            const x = 40 * Math.cos((a * Math.PI) / 180);
            const y = 40 * Math.sin((a * Math.PI) / 180);
            return `M${n(43 - x)} ${n(50 - y)}L${n(43 + x)} ${n(50 + y)}`;
          });
          return path(spokes.join(''), line(k.L, 5.5)) + circle(43, 50, 25, line(k.L, 12)) + circle(43, 50, 25, line(k.F, 5)) + circle(43, 50, 8, paint(k.C, k.L, 4));
        }
        // A key.
        case 'secret':
          return (
            path('M43 44V96H67V86H58V80H67V68H43', body(k, 5)) +
            rect(37, 44, 12, 52, 3, body(k, 5)) +
            circle(43, 25, 21, body(k)) +
            circle(43, 25, 8.5, paint(k.K, k.L, 4))
          );
        // A letter of marque: a written sheet under a wax seal and its ribbons.
        case 'certificate':
          return (
            path('M35 68L24 97L34 91L41 98L45 70Z', paint(k.C, k.L, 3.5)) +
            path('M51 68L62 97L52 91L45 98L41 70Z', paint(k.C, k.L, 3.5)) +
            rect(7, 4, 72, 68, 4, body(k, 5)) +
            path('M19 18H67M19 31H67', line(k.T, 3.8)) +
            circle(43, 61, 16, paint(red(k), k.L, 4)) +
            circle(43, 61, 8, line(k.F, 2.5))
          );
      }
    },

    // A compass rose: a ring with its points outside it, north in red, the middle left empty.
    junction: (k) =>
      path('M50 98L42 80H58ZM2 50L20 42V58ZM98 50L80 42V58Z', paint(k.L, k.L, 2)) +
      path('M18 18L33 24L24 33ZM82 18L67 24L76 33ZM18 82L33 76L24 67ZM82 82L67 76L76 67Z', paint(k.L)) +
      path('M50 2L42 20H58Z', paint(red(k), k.L, 2)) +
      circle(50, 50, 34, body(k)) +
      circle(50, 50, 27.5, line(k.C, 2.5)),
  },
};

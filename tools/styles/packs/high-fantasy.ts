import { circle, ellipse, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * High fantasy: a storybook realm, drawn in ink on vellum like a page of an illuminated book.
 * Every kind of shape is its own thing from that world, told apart by its outline: a worker is an
 * anvil under a hammer, a cache a potion flask with a spark in it, a queue a row of rune stones
 * with the next one lit, an agent an owl familiar. Cards are plain cartouches, so a name sits
 * easily on them. One ruby spot and a little gilt, as an illuminator would spend them.
 * Always light: it is a page from a book.
 */
const W = 6;

const ruby = (k: Kit) => k.A('rose', 'line');
const gilt = (k: Kit) => k.A('amber', 'line');

/** A thing with an inside: the shape's fill inside its outline. */
const body = (k: Kit, w = W) => paint(k.F, k.L, w);
/** A solid dark part: iron, a roof, a hood. Stroked in its own colour so its corners are round too. */
const solid = (k: Kit, w = 3) => paint(k.L, k.L, w);
/** An inner mark, in the shape's ink. */
const mark = (k: Kit, w = 4) => paint('none', k.T, w);
/** A bare line in the outline's colour. */
const line = (k: Kit, w = W) => paint('none', k.L, w);
/** A wash of one colour, with no outline: a shaded facet, the dark inside of a lid. */
const shade = (colour: string, opacity: number) => `${paint(colour)} opacity="${opacity}"`;
/** A cut gem, point up, `rx` by `ry` about its centre. */
const gem = (cx: number, cy: number, rx: number, ry: number, attrs: string) => poly(`${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`, attrs);
/** A four-pointed spark. */
const spark = (cx: number, cy: number, r: number, attrs: string) => {
  const s = r * 0.26;
  return poly(`${cx},${cy - r} ${cx + s},${cy - s} ${cx + r},${cy} ${cx + s},${cy + s} ${cx},${cy + r} ${cx - s},${cy + s} ${cx - r},${cy} ${cx - s},${cy - s}`, attrs);
};

/**
 * A cartouche: a plaque whose upper corners are scooped out, ruled in gilt along its top and
 * bottom. Its lower corners stay square: the app writes a small tag in the right-hand one.
 */
const cartouche = (k: Kit, rule: string) =>
  path('M20 4H328Q328 20 344 20V128H4V20Q20 20 20 4Z', body(k)) +
  path(rule, paint('none', gilt(k), 3)) +
  gem(174, 16, 10, 7, paint(gilt(k)));

/** A hooded wanderer, head and shoulders: a cloak, a dark hood and the face in it. */
const wanderer = (k: Kit, cx: number, base: number, s: number, leader = true) => {
  const x = (value: number) => Math.round((cx + value * s) * 10) / 10;
  const y = (value: number) => Math.round((base - value * s) * 10) / 10;
  const clasp = leader;
  // Those standing behind wear a plain round hood: three peaks in a row read as horns.
  if (!leader) {
    return (
      path(`M${x(-40)} ${y(0)}Q${x(-40)} ${y(34)} ${x(0)} ${y(36)}Q${x(40)} ${y(34)} ${x(40)} ${y(0)}Z`, body(k, 5)) +
      path(`M${x(-24)} ${y(33)}Q${x(-33)} ${y(76)} ${x(0)} ${y(77)}Q${x(33)} ${y(76)} ${x(24)} ${y(33)}Q${x(0)} ${y(22)} ${x(-24)} ${y(33)}Z`, solid(k)) +
      ellipse(x(0), y(49), 14 * s, 16 * s, paint(k.F))
    );
  }
  return (
    path(`M${x(-40)} ${y(0)}Q${x(-40)} ${y(34)} ${x(0)} ${y(36)}Q${x(40)} ${y(34)} ${x(40)} ${y(0)}Z`, body(k, 5)) +
    path(`M${x(-24)} ${y(33)}Q${x(-34)} ${y(58)} ${x(-10)} ${y(70)}L${x(9)} ${y(78)}Q${x(8)} ${y(68)} ${x(18)} ${y(60)}Q${x(29)} ${y(48)} ${x(24)} ${y(33)}Q${x(0)} ${y(22)} ${x(-24)} ${y(33)}Z`, solid(k)) +
    ellipse(x(0), y(49), 14 * s, 16 * s, paint(k.F)) +
    (clasp ? gem(x(0), y(20), 7 * s, 8 * s, paint(ruby(k))) : '')
  );
};

/** A standing stone on the road, with the rune cut into it. */
const stone = (k: Kit, c: number, fill: string) => path(`M${c - 19} 59V26Q${c - 19} 5 ${c} 5Q${c + 19} 5 ${c + 19} 26V59Z`, paint(fill, k.L, 5));

/** A rolled scroll standing in a basket, leaning by `turn` degrees. */
const rolled = (k: Kit, cx: number, cy: number, turn: number, band: string) =>
  group(`translate(${cx} ${cy}) rotate(${turn})`, rect(-10, -52, 20, 58, 0, body(k, 5)) + path('M-10 -28H10', paint('none', band, 5)) + ellipse(0, -52, 10, 4.5, body(k, 4)));

export const highFantasy: Pack = {
  id: 'high-fantasy',
  name: 'High fantasy',
  summary: 'An illuminated storybook: keeps, cauldrons, rune stones and an owl familiar',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 50,
  style: {
    hand: { base: 'draft', wobble: 'calm' },
    general: { shadow: false },
    connectors: { weight: 'fine' },
    schemes: {
      light: scheme(
        { canvas: '#f4ebd3', grid: '#e4d8b8', text: '#2b2118', textMuted: '#6e5a3a', edge: '#7d7462', edgeText: '#6e5a3a', edgeLabelBg: '#faf5e6', codeBg: '#efe5c9', codeBorder: '#d9cba6' },
        {
          neutral: ['#faf4e2', '#6e6a5e', '#2b2118', '#5a5548'],
          teal: ['#e2efe6', '#2f6f5a', '#153d30', '#2a6350'],
          blue: ['#e3e9f1', '#44648f', '#1f3352', '#3a577e'],
          violet: ['#ebe3f0', '#6f4f8f', '#3a2552', '#5f427c'],
          amber: ['#f6e7b6', '#a07d16', '#54400a', '#8c6c10'],
          rose: ['#f3dcdc', '#8f2c3c', '#561420', '#7b2333'],
          green: ['#e3ecd6', '#3f6f3a', '#1f3d1c', '#2f5d3a'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      switch (kind) {
        // A cartouche, ruled in gilt with a small gold stud at the head.
        case 'generic':
          return cartouche(k, 'M46 16H156M192 16H302M24 116H324');
        // The same, with a great ruby set in its left edge: the thing others come to.
        case 'api':
          return (
            cartouche(k, 'M62 16H156M192 16H302M62 116H286') +
            poly('24,36 43,51 43,81 24,96 5,81 5,51', paint(ruby(k), k.L, 4)) +
            poly('24,49 33,56 33,76 24,83 15,76 15,56', paint('none', k.F, 2.5))
          );
      }
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // An anvil, a hammer coming down on it and a spark: work being done.
        case 'worker':
          return (
            path('M6 62L40 56H126V69H100Q87 70 87 80Q87 89 104 92V100H36V92Q53 89 53 80Q53 71 38 70Q18 69 6 62Z', body(k)) +
            group('translate(72 34) rotate(-24)', path('M-24 0H20', line(k, 7)) + rect(16, -15, 24, 30, 3, body(k, 5))) +
            spark(24, 28, 13, paint(gilt(k)))
          );
        // A far-off tower on its hill, a path winding up to it: somewhere that is not ours.
        case 'external':
          return (
            rect(48, 30, 40, 52, 0, body(k, 5)) +
            poly('37,32 68,4 99,32', paint(ruby(k), k.L, 5)) +
            path('M68 44V58', mark(k, 6)) +
            path('M6 100Q36 98 46 82Q68 60 90 82Q100 98 130 100Z', body(k)) +
            path('M38 100Q82 96 64 89Q54 84 66 79', line(k, 3.5))
          );
        // An hourglass in its frame, the sand running.
        case 'scheduler':
          return (
            path('M31 14V90M105 14V90', line(k, 5)) +
            path('M42 14H94Q94 40 75 52Q94 64 94 90H42Q42 64 61 52Q42 40 42 14Z', body(k, 5)) +
            path('M51 30H85Q81 41 68 49Q55 41 51 30Z', paint(gilt(k))) +
            path('M48 87Q68 58 88 87Z', paint(gilt(k))) +
            path('M68 49V66', paint('none', gilt(k), 3)) +
            rect(21, 4, 94, 11, 3, solid(k)) +
            rect(21, 89, 94, 11, 3, solid(k))
          );
        // A castle gate between two towers, the portcullis half down: the one way in.
        case 'gateway':
          return (
            path('M8 100V8H18V16H26V8H36V34H46V26H58V34H78V26H90V34H100V8H110V16H118V8H128V100Z', body(k)) +
            path('M46 100V64Q46 44 68 44Q90 44 90 64V100Z', paint(k.K, k.L, 5)) +
            path('M57 50V84M68 46V84M79 50V84M48 62H88M48 74H88', mark(k, 3.5)) +
            path('M53 84l4 6l4-6M64 84l4 6l4-6M75 84l4 6l4-6', paint(k.T))
          );
        // A pair of scales, level: the load shared out.
        case 'load-balancer':
          return (
            path('M24 24L6 62M24 24L42 62M112 24L94 62M112 24L130 62', line(k, 3.5)) +
            path('M68 16V92M24 24H112', line(k, 6)) +
            path('M48 100L57 88H79L88 100Z', solid(k)) +
            path('M4 62H44Q44 82 24 82Q4 82 4 62Z', body(k, 5)) +
            path('M92 62H132Q132 82 112 82Q92 82 92 62Z', body(k, 5)) +
            circle(68, 12, 7.5, paint(ruby(k), k.L, 3.5))
          );
        // A messenger raven on a sealed scroll: it carries word between two parties.
        case 'proxy':
          return (
            path('M64 80V90M80 77V90', line(k, 4)) +
            path('M86 12Q99 3 112 11L133 22L113 30Q114 56 92 72Q72 84 46 78L6 90L32 58Q58 26 86 12Z', solid(k, 4)) +
            circle(102, 18, 3.5, paint(k.F)) +
            path('M50 62Q72 40 94 47', paint('none', k.F, 3)) +
            rect(26, 88, 92, 13, 6.5, body(k, 5)) +
            path('M72 89V100', paint('none', ruby(k), 10))
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // A stone keep, battlements on top and one small door: where things are kept.
        case 'generic':
          return (
            path('M18 38V6H35V17H47V6H64V17H76V6H93V17H105V6H122V38H112V102H28V38Z', body(k)) +
            path('M28 38H112', line(k, 4)) +
            path('M28 66H112', mark(k, 4)) +
            path('M70 48V56', mark(k, 5)) +
            path('M60 102V88Q60 78 70 78Q80 78 80 88V102Z', solid(k))
          );
        // A great tome lying open, every line ruled, a ribbon marking the place.
        case 'sql':
          return (
            rect(4, 18, 132, 84, 4, solid(k)) +
            path('M70 22Q46 6 10 14V88Q46 80 70 94Z', body(k, 5)) +
            path('M70 22Q94 6 130 14V88Q94 80 70 94Z', body(k, 5)) +
            path('M22 32Q40 27 58 35M22 48Q40 43 58 51M22 64Q40 59 58 67M118 32Q100 27 82 35M118 48Q100 43 82 51M118 64Q100 59 82 67', mark(k, 3.5)) +
            poly('64,86 76,86 76,106 70,100 64,106', paint(ruby(k)))
          );
        // A cauldron on its three legs, all sorts of things bubbling up out of it.
        case 'nosql':
          return (
            circle(38, 22, 11, body(k, 4)) +
            poly('69,4 84,29 54,29', paint(gilt(k), k.L, 3)) +
            gem(103, 20, 12, 15, paint(ruby(k), k.L, 3)) +
            path('M34 92L27 104M106 92L113 104', line(k, 6)) +
            path('M20 50Q8 100 70 100Q132 100 120 50Z', body(k)) +
            path('M34 71q9-7 18 0t18 0t18 0t18 0', mark(k, 3.5)) +
            rect(11, 40, 118, 13, 6.5, solid(k))
          );
        // A corked potion flask with a bolt of lightning in it: quick, and soon gone.
        case 'cache':
          return (
            path('M60 14V38L26 84Q18 102 40 102H100Q122 102 114 84L80 38V14Z', body(k)) +
            path('M54 16H86', line(k, 6)) +
            rect(59, 3, 22, 11, 3, solid(k)) +
            poly('74.5,47.5 55,74.5 68.5,74.5 64,94 85,64 71.5,64', paint(gilt(k), k.T, 2.5)) +
            spark(112, 30, 13, paint(gilt(k)))
          );
        // A basket of rolled scrolls: files, kept together.
        case 'file-system':
          return (
            rolled(k, 48, 62, -27, k.T) +
            rolled(k, 92, 62, 27, k.T) +
            rolled(k, 70, 60, 0, ruby(k)) +
            path('M24 56H116L106 102H34Z', body(k)) +
            path('M29 72H111M32 87H108', mark(k, 3.5)) +
            path('M19 56H121', line(k, 7))
          );
        // A treasure chest thrown open, heaped with whatever was put in it.
        case 'object-storage':
          return (
            path('M20 58L27 24Q70 2 113 24L120 58Z', body(k)) +
            path('M28 56L33 29Q70 11 107 29L112 56Z', shade(k.L, 0.25)) +
            path('M24 58Q30 39 47 42Q54 25 70 29Q86 25 93 42Q110 39 116 58Z', paint(gilt(k), k.L, 3)) +
            gem(70, 45, 9, 11, paint(ruby(k), k.L, 2.5)) +
            rect(10, 58, 120, 44, 3, body(k)) +
            path('M30 58V102M110 58V102', line(k, 4)) +
            rect(60, 67, 20, 21, 3, solid(k)) +
            circle(70, 77, 3.5, paint(k.F))
          );
        // A crystal ball on its stand, an eye looking out of it: made for finding.
        case 'search-index':
          return (
            path('M40 80Q70 98 100 80L110 102H30Z', solid(k, 4)) +
            circle(70, 44, 39, body(k)) +
            path('M42 44Q70 18 98 44Q70 70 42 44Z', paint(k.K, k.T, 4)) +
            circle(70, 44, 10, paint(k.T)) +
            circle(73, 41, 3, paint(k.F))
          );
        // A stone tablet, one corner chipped, cut into rows and columns under a heading.
        case 'table':
          return (
            path('M12 8H108L128 28V100H12Z', body(k)) +
            path('M15 11H107L125 29V34H15Z', shade(k.C, 0.3)) +
            path('M12 34H128', mark(k, 5)) +
            path('M12 56H128M12 78H128M50 34V100M90 34V100', mark(k, 3.5))
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // Rune stones along a road, each waiting its turn; the one at the head is lit.
        case 'queue':
          return (
            path('M4 60H272', line(k, 5)) +
            stone(k, 30, k.F) +
            stone(k, 84, k.F) +
            stone(k, 138, k.F) +
            stone(k, 192, k.F) +
            stone(k, 246, ruby(k)) +
            path('M30 20V46M30 30L40 22M90 20L78 33L90 46M130 22L146 44M146 22L130 44M192 46V20M184 29L192 20L200 29', mark(k, 3.5)) +
            path('M246 20L256 33L246 46L236 33Z', paint('none', k.F, 3.5))
          );
        // A herald's trumpet, three pennants flying from its bell: one call, heard by many.
        case 'topic':
          return (
            path('M102 9H271', line(k, 5)) +
            poly('124,9 162,9 162,58 143,46 124,58', body(k, 4)) +
            poly('174,9 212,9 212,58 193,46 174,58', paint(ruby(k), k.L, 4)) +
            poly('224,9 262,9 262,58 243,46 224,58', body(k, 4)) +
            path('M6 24V40L13 37H58Q88 39 102 58V6Q88 25 58 27H13Z', body(k, 5)) +
            path('M102 6V58', line(k, 8)) +
            path('M30 26V38M42 26V38', line(k, 4))
          );
        // A river winding across the page, a small boat carried along on it.
        case 'stream':
          return (
            path('M18 32Q48 2 78 32T138 32T198 32T258 32', paint('none', k.L, 30)) +
            path('M18 32Q48 2 78 32T138 32T198 32T258 32', paint('none', k.F, 20)) +
            path('M38 18q5-4 10 0t10 0M98 46q5-4 10 0t10 0M218 46q5-4 10 0t10 0', mark(k, 3)) +
            path('M156 22H182L177 29H161Z', paint(k.T, k.T, 2)) +
            poly('168,5 168,20 180,20', paint(ruby(k)))
          );
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A hooded adventurer with a staff.
        case 'human':
          return wanderer(k, 52, 80, 1) + path('M106 16V80', line(k, 5)) + circle(106, 10, 6.5, paint(ruby(k), k.L, 3));
        // A fellowship of three, the leader in front.
        case 'group':
          return wanderer(k, 28, 80, 0.66, false) + wanderer(k, 92, 80, 0.66, false) + wanderer(k, 60, 80, 0.92);
        // A travelling merchant in a broad hat, a pack and bedroll on the back: someone from elsewhere.
        case 'thirdParty':
          return (
            path('M6 80Q6 46 44 44Q82 46 82 80Z', body(k, 5)) +
            circle(44, 32, 13, body(k, 4)) +
            ellipse(44, 24, 27, 6.5, solid(k)) +
            path('M30 23Q32 4 44 4Q56 4 58 23Z', solid(k)) +
            path('M34 68L96 26', line(k, 5)) +
            circle(99, 27, 16, paint(ruby(k), k.L, 4.5))
          );
        // A castle of three towers: a whole realm that acts as one.
        case 'system':
          return (
            rect(36, 54, 48, 26, 0, body(k, 5)) +
            rect(14, 38, 24, 42, 0, body(k, 5)) +
            rect(82, 38, 24, 42, 0, body(k, 5)) +
            rect(46, 28, 28, 52, 0, body(k, 5)) +
            poly('9,40 26,14 43,40', solid(k)) +
            poly('77,40 94,14 111,40', solid(k)) +
            poly('40,30 60,5 80,30', paint(ruby(k), k.L, 4)) +
            path('M60 40V48M26 50V57M94 50V57', mark(k, 4)) +
            path('M53 80V69Q53 62 60 62Q67 62 67 69V80Z', solid(k))
          );
        // A lantern, lit: the thing carried in the hand.
        case 'device':
          return (
            circle(60, 12, 6.5, line(k, 4.5)) +
            rect(43, 30, 34, 40, 2, body(k, 5)) +
            path('M60 37Q71 50 66 58Q64 64 60 64Q56 64 54 58Q49 50 60 37Z', paint(gilt(k))) +
            poly('48,20 72,20 80,30 40,30', solid(k)) +
            rect(40, 70, 40, 9, 2, solid(k))
          );
        // An owl familiar on a branch: it watches, and acts on its own.
        case 'agent':
          return (
            path('M10 76H110', line(k, 6)) +
            path('M34 24L38 4L52 13Q60 10 68 13L82 4L86 24Q94 46 84 62Q76 74 60 74Q44 74 36 62Q26 46 34 24Z', body(k, 5)) +
            circle(48, 30, 10.5, paint(k.K, k.L, 4)) +
            circle(72, 30, 10.5, paint(k.K, k.L, 4)) +
            circle(48, 30, 4.5, paint(k.T)) +
            circle(72, 30, 4.5, paint(k.T)) +
            gem(60, 43, 5, 7, paint(gilt(k))) +
            path('M48 58l6 4l6-4l6 4l6-4', mark(k, 3))
          );
      }
    },

    // A stone lintel: a squared frame with a stud at each corner and a keystone at its head.
    componentCard: (k) =>
      rect(3, 3, 294, 102, 3, body(k, 5.5)) +
      path('M30 16H270M30 92H270M16 30V78M284 30V78', paint('none', gilt(k), 2.5)) +
      gem(16, 16, 7, 7, paint(k.L)) +
      gem(284, 16, 7, 7, paint(k.L)) +
      gem(16, 92, 7, 7, paint(k.L)) +
      gem(284, 92, 7, 7, paint(k.L)),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A cut gem: one whole, finished piece.
        case 'module':
          return (
            poly('32,6 88,6 114,38 60,100 6,38', body(k)) +
            poly('44,38 76,38 60,100', shade(k.C, 0.35)) +
            path('M6 38H114M32 6L44 38L60 6L76 38L88 6M44 38L60 100L76 38', mark(k, 3.5))
          );
        // An ornate key, a ruby in its bow: it fits something outside.
        case 'adapter':
          return group(
            'translate(57 52) rotate(-38)',
            path('M-20 -5.5H60V5.5H56V26H45V15H37V26H26V5.5H-20Z', solid(k)) + path('M-12 -11V11', line(k, 6)) + circle(-40, 0, 18, paint(k.F, k.L, 9)) + gem(-40, 0, 8, 8, paint(ruby(k))),
          );
        // A keyhole plate: where a key goes in.
        case 'port':
          return (
            path('M60 4Q100 4 104 30Q92 50 104 70Q98 96 60 100Q22 96 16 70Q28 50 16 30Q20 4 60 4Z', body(k)) +
            circle(60, 40, 13, paint(k.T)) +
            path('M53 46H67L74 80H46Z', paint(k.T, k.T, 2)) +
            circle(60, 14, 3.5, paint(k.L)) +
            circle(60, 91, 3.5, paint(k.L))
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A scroll, unrolled between its two rolls.
        case 'file':
          return (
            rect(14, 12, 58, 76, 0, body(k, 5)) +
            rect(5, 4, 76, 15, 7.5, body(k, 5)) +
            rect(5, 81, 76, 15, 7.5, body(k, 5)) +
            path('M25 33H61M25 47H61M25 61H49', mark(k, 3.5))
          );
        // An alchemist's recipe: a page of measures to set, and the phase of the moon to set them by.
        case 'config':
          return (
            path('M8 4H56L78 26V96H8Z', body(k, 5)) +
            path('M56 4V26H78', line(k, 4)) +
            path('M20 42H66M20 61H66', mark(k, 3.5)) +
            circle(34, 42, 6.5, paint(k.T)) +
            circle(54, 61, 6.5, paint(ruby(k))) +
            circle(24, 81, 6, paint(k.T)) +
            circle(43, 81, 6, paint(k.F, k.T, 3)) +
            path('M43 75A6 6 0 0 1 43 87Z', paint(k.T)) +
            circle(62, 81, 6, paint(k.F, k.T, 3))
          );
        // An iron padlock, shut.
        case 'secret':
          return (
            path('M24 46V28Q24 6 43 6Q62 6 62 28V46', line(k, 8)) +
            path('M10 44H76V76Q76 94 43 97Q10 94 10 76Z', body(k)) +
            circle(43, 62, 7.5, paint(k.T)) +
            path('M39 66H47L50 82H36Z', paint(k.T, k.T, 2))
          );
        // A royal decree under its wax seal and ribbons.
        case 'certificate':
          return (
            rect(6, 4, 74, 72, 3, body(k, 5)) +
            path('M18 20H68', mark(k, 4.5)) +
            path('M18 34H68M18 48H40', mark(k, 3.5)) +
            poly('50,76 42,98 52,92 56,84', paint(ruby(k), k.L, 3)) +
            poly('62,76 72,98 62,92 58,84', paint(ruby(k), k.L, 3)) +
            circle(56, 68, 14, paint(ruby(k), k.L, 3.5)) +
            circle(56, 68, 5.5, paint('none', k.F, 2.5))
          );
      }
    },

    // A shield-boss ring with four gilt studs; its middle is left bare for the word.
    junction: (k) =>
      circle(50, 50, 42, body(k, 7)) +
      gem(50, 8, 7, 7, paint(gilt(k), k.L, 2)) +
      gem(92, 50, 7, 7, paint(gilt(k), k.L, 2)) +
      gem(50, 92, 7, 7, paint(gilt(k), k.L, 2)) +
      gem(8, 50, 7, 7, paint(gilt(k), k.L, 2)),
  },
};

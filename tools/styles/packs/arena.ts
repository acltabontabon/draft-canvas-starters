import { circle, group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Arena: the three-lanes-and-a-base battle arena, in deep navy with burnished gold trim. Every
 * kind is its own object from that world: a service is a plaque with pointed ends, a worker the
 * forge's anvil, a gateway the gatehouse, a load balancer the lane map; a cache is a winged
 * crystal, an object store a treasure chest, a queue a row of players waiting for a match.
 * Angular and heraldic throughout: bevelled corners, chevrons, faceted gems, a second line inside
 * the first, and one cyan spark where there is magic. Always dark: gold reads on navy.
 */
const W = 6;
/** The pack's two spots of colour, whatever colour the shape is: gold trim and the cyan spark. */
const gold = (k: Kit) => k.A('amber', 'chip');
const spark = (k: Kit) => k.A('teal', 'chip');

/** The shape's own body: its fill inside its outline. */
const body = (k: Kit, w = W) => paint(k.F, k.L, w);
/** A line and nothing else. */
const line = (colour: string, w: number) => paint('none', colour, w);
/** A cut gem seen from the front: a diamond `rx` by `ry` about (`cx`, `cy`). */
const gem = (k: Kit, cx: number, cy: number, rx: number, ry: number, colour: string, w = 4): string =>
  poly(`${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`, paint(colour, k.L, w));
/** A four-pointed spark. */
const star = (cx: number, cy: number, r: number, colour: string): string => {
  const q = r * 0.3;
  return poly(`${cx},${cy - r} ${cx + q},${cy - q} ${cx + r},${cy} ${cx + q},${cy + q} ${cx},${cy + r} ${cx - q},${cy + q} ${cx - r},${cy} ${cx - q},${cy - q}`, paint(colour));
};
/** A helm seen from the front, `s` times the size of the champion's, with its visor cut in ink. */
const helm = (k: Kit, cx: number, top: number, s: number, slit: 'T' | 'bar' = 'T'): string => {
  const p = (x: number, y: number) => `${cx + x * s},${top + y * s}`;
  return (
    poly(`${p(-20, 18)} ${p(-12, 0)} ${p(12, 0)} ${p(20, 18)} ${p(18, 40)} ${p(0, 50)} ${p(-18, 40)}`, body(k, 5)) +
    path(slit === 'T' ? `M${cx - 11 * s} ${top + 21 * s}H${cx + 11 * s}M${cx} ${top + 21 * s}V${top + 39 * s}` : `M${cx - 11 * s} ${top + 23 * s}H${cx + 11 * s}`, line(k.T, 5))
  );
};

export const arena: Pack = {
  id: 'arena',
  name: 'Arena',
  summary: 'Navy and gold battle arena: plaques, turrets, crystals, loot and the lanes between them',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 30,
  style: {
    hand: { base: 'clean' },
    general: { weight: 'bold', corners: 'sharp' },
    connectors: { weight: 'bold', head: 'triangle' },
    schemes: {
      dark: scheme(
        { canvas: '#0e1a2b', grid: '#18273c', text: '#f2e6c4', textMuted: '#b9a26b', edge: '#b9a26b', edgeText: '#d9c58f', edgeLabelBg: '#14233a', codeBg: '#121f33', codeBorder: '#24364f' },
        {
          neutral: ['#14263f', '#b9a26b', '#f2e6c4', '#e8b64c'],
          teal: ['#0f2f33', '#4fd1c5', '#cdf5f0', '#6fe0d6'],
          blue: ['#142a4d', '#6ea4f0', '#d9e8fd', '#8dbbf7'],
          violet: ['#251d47', '#a78bf5', '#e6defd', '#bca6f8'],
          amber: ['#33260d', '#e8b64c', '#fbecc8', '#f4cb6e'],
          rose: ['#3a1620', '#e8697f', '#fcd9df', '#f08a9c'],
          green: ['#142e1f', '#62c98a', '#d3f4df', '#84dba5'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      // A name plaque with pointed ends, a second line inside the first and a chevron notch top and bottom.
      const notches = poly('158,3 190,3 174,15', paint(k.L)) + poly('158,129 190,129 174,117', paint(k.L));
      // An API is that plaque squared off on the right, with a gem set in its left point: the socket
      // others plug into. Its inner line stops short of the bottom-right corner, where the app writes "API".
      if (kind === 'api')
        return (
          poly('26,3 320,3 345,28 345,129 26,129 3,66', body(k)) +
          path('M296 118H32L15 66L32 14H315L334 33V90', line(k.C, 3)) +
          notches +
          gem(k, 22, 66, 17, 27, spark(k)) +
          path('M8 66H36', line(k.L, 2.5))
        );
      return poly('26,3 322,3 345,66 322,129 26,129 3,66', body(k)) + poly('32,14 316,14 333,66 316,118 32,118 15,66', line(k.C, 3)) + notches;
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // The forge: an anvil, a hammer coming down on it and the spark it strikes.
        case 'worker':
          return (
            poly('6,62 36,58 128,58 128,72 100,72 90,82 90,90 106,90 106,102 30,102 30,90 46,90 46,82 38,74 22,74', body(k)) +
            path('M42 66H120', line(k.C, 3)) +
            group('translate(64 21) rotate(60)', rect(-5, -33, 10, 35, 0, paint(k.L)) + rect(-19, 0, 38, 22, 0, body(k, 5))) +
            star(19, 34, 14, spark(k))
          );
        // A teleport gate to somewhere else: a standing ring of stone with a swirl of magic in it.
        case 'external':
          return (
            poly('40,95 96,95 108,101 28,101', paint(k.L, k.L, 3)) +
            path('M34 4H102L126 24V72L102 92H34L10 72V24Z M44 20H92L108 33V63L92 76H44L28 63V33Z', `${body(k)} fill-rule="evenodd"`) +
            path('M68 48C76 40 85 50 77 58C65 67 50 58 52 44C56 30 80 27 92 42', line(spark(k), 5)) +
            gem(k, 68, 12, 5, 5, k.C, 0) +
            gem(k, 19, 48, 5, 5, k.C, 0) +
            gem(k, 117, 48, 5, 5, k.C, 0)
          );
        // The respawn timer: an hourglass, its sand lit.
        case 'scheduler':
          return (
            path('M32 16H104V28L76 52L104 76V88H32V76L60 52L32 28Z', body(k, 5)) +
            poly('44,30 92,30 68,49', paint(spark(k))) +
            poly('46,84 90,84 68,64', paint(spark(k))) +
            rect(22, 4, 92, 12, 0, body(k)) +
            rect(22, 88, 92, 12, 0, body(k))
          );
        // The gatehouse: two turrets, a wall between them and the one gate through it.
        case 'gateway':
          return (
            poly('8,100 8,6 20,6 20,16 32,16 32,6 44,6 44,34 58,34 68,22 78,34 92,34 92,6 104,6 104,16 116,16 116,6 128,6 128,100', body(k)) +
            path('M8 26H44M92 26H128', line(k.C, 3)) +
            path('M50 100V66L68 48L86 66V100Z', paint(k.K, k.L, 5)) +
            path('M62 60V100M74 60V100', line(k.L, 3)) +
            rect(22, 38, 8, 20, 0, paint(k.T)) +
            rect(106, 38, 8, 20, 0, paint(k.T))
          );
        // The lane map: one base, three lanes fanning out to three turrets.
        case 'load-balancer':
          return (
            path('M36 46L102 16M40 52H106M36 58L102 88', line(k.L, 7)) +
            poly('5,52 15,31 37,31 47,52 37,73 15,73', body(k)) +
            gem(k, 26, 52, 9, 11, k.C, 0) +
            gem(k, 114, 15, 16, 12, k.F, 5) +
            gem(k, 116, 52, 16, 12, k.F, 5) +
            gem(k, 114, 89, 16, 12, k.F, 5)
          );
        // A ward: a watching eye on a spike, planted between one side and the other.
        case 'proxy':
          return (
            poly('57,58 79,58 68,102', body(k, 5)) +
            path('M8 36Q68 -24 128 36Q68 92 8 36Z', body(k)) +
            circle(68, 35, 17, paint(k.K, k.L, 4)) +
            circle(68, 35, 8, paint(spark(k))) +
            path('M40 70L28 82L40 94M96 70L108 82L96 94', line(k.C, 4))
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // The vault crest: a shield bearing a stack of three plates.
        case 'generic':
          return (
            poly('70,3 126,16 126,58 106,86 70,105 34,86 14,58 14,16', body(k)) +
            poly('70,14 116,25 116,55 99,79 70,94 41,79 24,55 24,25', line(k.C, 3)) +
            [36, 52, 68].map((y) => poly(`46,${y} 58,${y - 7} 82,${y - 7} 94,${y} 82,${y + 7} 58,${y + 7}`, paint(k.F, k.T, 4))).join('')
          );
        // The scoreboard: ranked rows in strict columns, on its two posts.
        case 'sql':
          return (
            path('M30 90V104M110 90V104', line(k.L, 6)) +
            poly('54,16 70,3 86,16', paint(k.L, k.L, 4)) +
            poly('16,16 124,16 134,26 134,82 124,92 16,92 6,82 6,26', body(k)) +
            path('M6 41H134M6 66H134M40 16V92', line(k.L, 3)) +
            gem(k, 23, 28, 7, 7, spark(k), 0) +
            gem(k, 23, 54, 7, 7, k.C, 0) +
            gem(k, 23, 79, 7, 7, k.C, 0) +
            path('M52 28H122M52 54H106M52 79H90', line(k.T, 5))
          );
        // A loot bag: a tied sack with a gem, a coin and a card poking out of it, nothing alike.
        case 'nosql':
          return (
            gem(k, 70, 20, 14, 17, spark(k)) +
            circle(42, 26, 12, paint(gold(k), k.L, 4)) +
            poly('88,22 104,9 116,25 100,38', body(k, 4)) +
            path('M46 44L28 60Q4 86 22 100Q28 105 70 105Q112 105 118 100Q136 86 112 60L94 44Z', body(k)) +
            rect(42, 36, 56, 11, 0, paint(k.C, k.L, 4)) +
            circle(45, 79, 8, line(k.T, 4)) +
            rect(62, 71, 16, 16, 0, line(k.T, 4)) +
            poly('86,87 95,71 104,87', line(k.T, 4))
          );
        // A speed rune: a crystal with wings and a bolt of lightning in it.
        case 'cache':
          return (
            poly('40,30 3,9 13,32 4,36 17,53 10,58 40,76', body(k, 5)) +
            poly('100,30 137,9 127,32 136,36 123,53 130,58 100,76', body(k, 5)) +
            poly('70,3 102,28 102,80 70,105 38,80 38,28', body(k)) +
            poly('79,26 54,62 68,62 61,92 88,54 73,54', paint(spark(k)))
          );
        // A tome lying open, with index tabs down its edge: folders of pages.
        case 'file-system':
          return (
            rect(112, 25, 24, 15, 0, paint(k.C, k.L, 3)) +
            rect(112, 46, 24, 15, 0, paint(spark(k), k.L, 3)) +
            rect(112, 67, 24, 15, 0, paint(gold(k), k.L, 3)) +
            poly('4,26 4,98 64,105 122,98 122,26', paint(k.L, k.L, 3)) +
            poly('64,26 37,13 10,19 10,90 37,84 64,96', body(k, 5)) +
            poly('64,26 91,13 116,19 116,90 91,84 64,96', body(k, 5)) +
            path('M20 36H52M20 51H52M20 66H40', line(k.T, 4)) +
            poly('90,38 103,54 90,70 77,54', line(k.C, 4))
          );
        // A treasure chest, banded and locked: a box of whatever was dropped in it.
        case 'object-storage':
          return (
            poly('12,46 24,9 116,9 128,46', body(k)) +
            poly('12,46 128,46 128,102 12,102', body(k)) +
            path('M38 9V102M102 9V102', line(k.L, 4)) +
            poly('57,36 83,36 83,60 70,70 57,60', paint(gold(k), k.L, 4)) +
            circle(70, 50, 4.5, paint(k.K))
          );
        // A scout's spyglass, pulled out, and the thing it found.
        case 'search-index':
          return (
            group(
              'translate(11 93) rotate(-31)',
              rect(0, -8, 44, 16, 0, body(k, 5)) + rect(40, -12, 44, 24, 0, body(k, 5)) + rect(80, -16, 44, 32, 0, body(k, 5)) + rect(120, -20, 12, 40, 0, paint(k.C, k.L, 5)),
            ) + star(112, 84, 15, spark(k))
          );
        // One stat tablet: a slab with its corners cut, a header and a grid.
        case 'table':
          return (
            poly('20,5 120,5 134,19 134,103 6,103 6,19', body(k)) +
            poly('21,8 119,8 131,20 131,30 9,30 9,20', `fill="${k.C}" fill-opacity="0.85"`) +
            path('M6 30H134M6 54H134M6 78H134M48 30V103M92 30V103', line(k.L, 4))
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // The matchmaking queue: player tokens waiting in a row, the one at the front lit, and the way out.
        case 'queue':
          return (
            poly('14,4 262,4 272,14 272,50 262,60 14,60 4,50 4,14', body(k, 5)) +
            [42, 88, 134, 180]
              .map((x, i) => poly(`${x - 12},14 ${x + 12},14 ${x + 12},38 ${x},50 ${x - 12},38`, i === 3 ? paint(spark(k), k.T, 4) : line(k.T, 4)))
              .join('') +
            path('M220 16L240 32L220 48', line(k.C, 6))
          );
        // The announcer's horn: one call, fanned out to three.
        case 'topic':
          return (
            poly('10,4 244,4 272,13 254,22 272,32 254,42 272,51 244,60 10,60 4,54 4,10', body(k, 5)) +
            path('M74 23L222 13M74 32H228M74 41L222 51', line(k.T, 4)) +
            poly('14,23 30,23 62,8 62,56 30,41 14,41', paint(k.C, k.L, 4)) +
            gem(k, 232, 14, 10, 8, spark(k), 0) +
            gem(k, 238, 32, 10, 8, spark(k), 0) +
            gem(k, 232, 50, 10, 8, spark(k), 0)
          );
        // A lane: chevrons marching down it without end.
        case 'stream':
          return (
            poly('4,4 250,4 272,32 250,60 4,60 24,32', body(k, 5)) +
            [46, 94, 142, 190].map((x, i) => poly(`${x},14 ${x + 16},14 ${x + 32},32 ${x + 16},50 ${x},50 ${x + 16},32`, i === 3 ? paint(spark(k)) : `fill="${k.C}" fill-opacity="${0.4 + i * 0.25}"`)).join('')
          );
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A champion: armoured shoulders and a horned helm.
        case 'human':
          return (
            poly('8,80 14,60 40,50 80,50 106,60 112,80', body(k, 5)) +
            poly('42,28 24,22 16,3 32,12 46,14', paint(k.C, k.L, 4)) +
            poly('78,28 96,22 104,3 88,12 74,14', paint(k.C, k.L, 4)) +
            helm(k, 60, 8, 1)
          );
        // A team: three helms shoulder to shoulder, the captain in front.
        case 'group':
          return (
            poly('2,80 6,66 18,60 44,60 44,80', body(k, 5)) +
            poly('118,80 114,66 102,60 76,60 76,80', body(k, 5)) +
            helm(k, 28, 24, 0.72) +
            helm(k, 92, 24, 0.72) +
            poly('26,80 32,62 46,54 74,54 88,62 94,80', body(k, 5)) +
            poly('55,12 60,2 65,12', paint(k.C)) +
            helm(k, 60, 10, 0.9)
          );
        // A rival: a stranger's helm under another team's banner.
        case 'thirdParty':
          return (
            poly('3,80 9,62 26,54 50,54 67,62 73,80', body(k, 5)) +
            helm(k, 38, 10, 0.9, 'bar') +
            path('M112 3V80M76 9H112', line(k.L, 5)) +
            poly('78,12 104,12 104,54 91,44 78,54', paint(k.A('rose', 'chip'), k.L, 4))
          );
        // The base core: a great crystal held over its pedestal.
        case 'system':
          return (
            path('M38 64L10 44L18 18M82 64L110 44L102 18', line(k.L, 6)) +
            poly('18,80 102,80 102,72 88,72 80,62 40,62 32,72 18,72', body(k, 5)) +
            poly('60,2 84,28 60,55 36,28', body(k, 5)) +
            poly('60,2 71,28 60,55 49,28', paint(spark(k)))
          );
        // A handheld ward stone: a pointed slab with a lit face and one button.
        case 'device':
          return (
            poly('60,3 80,16 80,72 73,79 47,79 40,72 40,16', body(k, 5)) +
            poly('60,14 72,22 72,54 48,54 48,22', paint(k.K, k.L, 3)) +
            poly('60,26 67,38 60,50 53,38', paint(spark(k))) +
            poly('60,60 66,66 60,72 54,66', paint(k.C))
          );
        // A training bot: a square head with one cyan eye.
        case 'agent':
          return (
            path('M60 14V8', line(k.L, 4)) +
            poly('60,1 65,7 60,13 55,7', paint(k.C)) +
            rect(52, 56, 16, 8, 0, paint(k.L)) +
            rect(15, 27, 9, 16, 0, paint(k.L)) +
            rect(96, 27, 9, 16, 0, paint(k.L)) +
            poly('18,80 26,64 94,64 102,80', body(k, 5)) +
            poly('36,14 84,14 94,24 94,46 84,56 36,56 26,46 26,24', body(k, 5)) +
            poly('36,25 84,25 89,35 84,45 36,45 31,35', paint(k.K, k.L, 3)) +
            circle(60, 35, 7, paint(spark(k))) +
            path('M50 72H70', line(k.C, 4))
          );
      }
    },

    // An item slot: a frame with its corners notched out, and a second line inside.
    componentCard: (k) =>
      poly('14,3 286,3 286,14 297,14 297,94 286,94 286,105 14,105 14,94 3,94 3,14 14,14', body(k, 5)) +
      poly('27,15 273,15 285,27 285,81 273,93 27,93 15,81 15,27', line(k.C, 3)),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // An item gem, cut and faceted: one unit of power.
        case 'module':
          return (
            poly('26,5 94,5 114,36 60,100 6,36', body(k)) +
            poly('42,36 78,36 60,100', `fill="${k.C}" fill-opacity="0.45"`) +
            path('M6 36H114M26 5L42 36L60 5L78 36L94 5M42 36L60 100L78 36', line(k.L, 3.5))
          );
        // A gem in a mount with two prongs: it plugs into something else.
        case 'adapter':
          return (
            rect(88, 28, 26, 13, 0, body(k, 5)) +
            rect(88, 63, 26, 13, 0, body(k, 5)) +
            poly('34,20 78,20 90,32 90,72 78,84 34,84', body(k)) +
            gem(k, 36, 52, 28, 30, k.C, 5) +
            path('M22 52H50', line(k.L, 3))
          );
        // An empty socket: a ring with four claws, waiting for a gem.
        case 'port':
          return (
            path('M36 6H84L110 30V74L84 98H36L10 74V30Z M44 26H76L88 38V66L76 78H44L32 66V38Z', `${body(k)} fill-rule="evenodd"`) +
            poly('33,37 43,27 50,44', paint(k.C)) +
            poly('87,37 77,27 70,44', paint(k.C)) +
            poly('33,67 43,77 50,60', paint(k.C)) +
            poly('87,67 77,77 70,60', paint(k.C))
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A scroll of patch notes, rolled at both ends.
        case 'file':
          return rect(12, 12, 62, 76, 0, body(k, 5)) + path('M24 31H62M24 44H62M24 57H62M24 70H46', line(k.T, 4)) + rect(4, 4, 78, 14, 6, body(k, 5)) + rect(4, 82, 78, 14, 6, body(k, 5));
        // A page of settings: three sliders, each set somewhere else.
        case 'config':
          return (
            poly('14,4 72,4 82,14 82,86 72,96 14,96 4,86 4,14', body(k, 5)) +
            path('M16 27H70M16 50H70M16 73H70', line(k.L, 4)) +
            gem(k, 30, 27, 9, 9, k.T, 0) +
            gem(k, 56, 50, 9, 9, spark(k), 0) +
            gem(k, 38, 73, 9, 9, k.T, 0)
          );
        // An ornate key.
        case 'secret':
          return group(
            'translate(41.5 52) rotate(-34)',
            rect(-5, -12, 10, 60, 0, paint(k.C, k.L, 4)) +
              rect(5, 26, 16, 9, 0, paint(k.C, k.L, 4)) +
              rect(5, 39, 12, 9, 0, paint(k.C, k.L, 4)) +
              path('M0 -56L24 -32L0 -8L-24 -32Z M0 -43L11 -32L0 -21L-11 -32Z', `${paint(k.C, k.L, 4)} fill-rule="evenodd"`),
          );
        // A rank medal on its ribbon: two chevrons earned.
        case 'certificate':
          return (
            poly('12,4 32,4 48,38 34,44', paint(k.C, k.L, 4)) +
            poly('74,4 54,4 38,38 52,44', paint(k.C, k.L, 4)) +
            poly('43,34 71,49 71,81 43,97 15,81 15,49', body(k, 5)) +
            path('M29 68L43 56L57 68M29 82L43 70L57 82', line(k.T, 5))
          );
      }
    },

    // A gem's bezel seen from above: a faceted ring, its middle left empty for the word.
    junction: (k) =>
      poly('32,5 68,5 95,32 95,68 68,95 32,95 5,68 5,32', body(k)) +
      poly('36,17 64,17 83,36 83,64 64,83 36,83 17,64 17,36', line(k.C, 3)) +
      path('M32 5L36 17M68 5L64 17M95 32L83 36M95 68L83 64M68 95L64 83M32 95L36 83M5 68L17 64M5 32L17 36', line(k.L, 3)),
  },
};

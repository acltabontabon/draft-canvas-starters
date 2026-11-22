import { circle, emblem, figure, paint, path, poly, scheme, type Kit, type Pack } from '../kit';

/**
 * Arena: navy and gold, crests and gems. A service is a hexagonal crest, a data store a shield,
 * a queue the lane its messages march down. Always dark: gold reads on navy.
 */
const W = 6;
const gold = (k: Kit) => k.A('amber', 'chip');
const gem = (k: Kit) => k.A('teal', 'chip');
const ink = (k: Kit) => k.T;

/** A small faceted gem, pointing up and down. */
const jewel = (k: Kit, cx: number, cy: number, r: number, colour = gem(k)): string =>
  poly(`${cx},${cy - r} ${cx + r * 0.8},${cy} ${cx},${cy + r} ${cx - r * 0.8},${cy}`, paint(colour)) + path(`M${cx - r * 0.8} ${cy}H${cx + r * 0.8}`, paint('none', k.K, 1.6));

export const arena: Pack = {
  id: 'arena',
  name: 'Arena',
  summary: 'Navy and gold: crests, shields, gems and the lane between them',
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
    // A banner with pointed ends, a gold line inside it. An API wears a gem at its tip.
    serviceCard: (k, kind) =>
      poly('26,3 322,3 345,66 322,129 26,129 3,66', paint(k.F, k.L, W)) +
      poly('32,13 316,13 334,66 316,119 32,119 14,66', paint('none', gold(k), 2)) +
      (kind === 'api' ? jewel(k, 30, 66, 11) : ''),

    // A hexagonal crest.
    serviceGlyph: (k, kind) =>
      poly('68,3 123,29 123,75 68,101 13,75 13,29', paint(k.F, k.L, W)) +
      poly('68,14 113,35 113,69 68,90 23,69 23,35', paint('none', gold(k), 2)) +
      emblem(kind, 68, 52, 40, ink(k), 3.8),

    // A shield.
    database: (k, kind) =>
      path('M70 4L122 20V56Q122 90 70 105Q18 90 18 56V20Z', paint(k.F, k.L, W)) +
      path('M70 15L112 28V56Q112 82 70 94Q28 82 28 56V28Z', paint('none', gold(k), 2)) +
      emblem(kind, 70, 52, 40, ink(k), 3.8),

    // A lane, and what marches down it.
    queue: (k, kind) =>
      poly('22,5 254,5 272,32 254,59 22,59 4,32', paint(k.F, k.L, 5)) +
      (kind === 'queue'
        ? jewel(k, 86, 32, 13, gold(k)) + jewel(k, 138, 32, 13, gold(k)) + jewel(k, 190, 32, 13)
        : kind === 'topic'
        ? jewel(k, 58, 32, 13, gold(k)) + path('M82 32h40M122 32l34-13h70M122 32h104M122 32l34 13h70', paint('none', ink(k), 4))
        : path('M44 16l22 16l-22 16M98 16l22 16l-22 16M152 16l22 16l-22 16M206 16l22 16l-22 16', paint('none', ink(k), 5))),

    // Champions: a plume on every helm.
    actor: (k, kind) =>
      figure(
        {
          k,
          w: 5,
          round: 1,
          hat: (cx, cy, r) => path(`M${cx - r} ${cy - 2}Q${cx - r} ${cy - r - 5} ${cx} ${cy - r - 5}Q${cx + r} ${cy - r - 5} ${cx + r} ${cy - 2}Z`, paint(k.L)) + path(`M${cx} ${cy - r - 5}Q${cx + r * 1.2} ${cy - r - 12} ${cx + r * 1.5} ${cy - r + 2}`, paint('none', gold(k), 4)),
        },
        kind,
      ),

    // A card with its corners cut, and a gold line inside.
    componentCard: (k) =>
      poly('18,3 282,3 297,18 297,90 282,105 18,105 3,90 3,18', paint(k.F, k.L, 5)) +
      poly('22,12 278,12 288,22 288,86 278,96 22,96 12,86 12,22', paint('none', gold(k), 2)),

    // An item socket: an octagon with gems at its corners.
    componentGlyph: (k, kind) =>
      poly('40,8 80,8 104,32 104,72 80,96 40,96 16,72 16,32', paint(k.F, k.L, W)) +
      jewel(k, 60, 8, 6, gold(k)) +
      jewel(k, 60, 96, 6, gold(k)) +
      emblem(kind, 60, 52, 40, ink(k), 3.8),

    // A tablet with a pointed head.
    artifact: (k, kind) =>
      path('M10 24L43 4L76 24V96H10Z', paint(k.F, k.L, 5)) +
      path('M18 28L43 13L68 28', paint('none', gold(k), 2)) +
      emblem(kind, 43, 62, 36, ink(k), 3.8),

    // A cut gem.
    junction: (k) =>
      poly('50,5 92,36 76,94 24,94 8,36', paint(k.F, k.L, 7)) +
      path('M8 36H92M50 5L32 36L50 94L68 36Z', paint('none', gold(k), 2.5)) +
      circle(50, 36, 5, paint(gem(k))),
  },
};

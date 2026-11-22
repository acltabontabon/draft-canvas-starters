import { circle, emblem, figure, paint, path, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * High seas: a chart on parchment. A service is a ship under sail, a data store a barrel, a
 * queue a message in a bottle. Always light: it is drawn on paper.
 */
const W = 6;
const ink = (k: Kit) => k.T;
const red = (k: Kit) => k.A('rose', 'chip');

export const highSeas: Pack = {
  id: 'high-seas',
  name: 'High seas',
  summary: 'A sea chart on parchment: ships, barrels, crates and bottles',
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
    // A painted board with a rope edge. An API has a mooring ring.
    serviceCard: (k, kind) =>
      rect(3, 3, 342, 126, 12, paint(k.F, k.L, W)) +
      rect(12, 12, 324, 108, 7, paint('none', k.C, 2)) +
      circle(24, 24, 3, paint(k.L)) +
      circle(324, 24, 3, paint(k.L)) +
      circle(24, 108, 3, paint(k.L)) +
      circle(324, 108, 3, paint(k.L)) +
      (kind === 'api' ? circle(20, 66, 11, paint(k.K, k.L, 5)) : ''),

    // A ship: one square sail carrying what the service does, a pennant, a hull on the water.
    serviceGlyph: (k, kind) =>
      path('M68 6V70', paint('none', k.L, 5)) +
      path('M68 6L86 11L68 16Z', paint(red(k))) +
      path('M36 20Q68 27 100 20V60Q68 67 36 60Z', paint(k.K, k.L, 4)) +
      emblem(kind, 68, 40, 32, ink(k), 4) +
      path('M12 70H124Q116 96 94 96H40Q20 94 12 70Z', paint(k.F, k.L, W)) +
      path('M22 80H114', paint('none', k.L, 2.5)),

    // A barrel, hooped twice.
    database: (k, kind) =>
      path('M34 6H106Q126 54 106 102H34Q14 54 34 6Z', paint(k.F, k.L, W)) +
      path('M25 28Q70 37 115 28M25 80Q70 89 115 80', paint('none', k.L, 5)) +
      emblem(kind, 70, 54, 38, ink(k), 3.8),

    // A bottle on its side, and what is corked inside it.
    queue: (k, kind) =>
      rect(34, 8, 196, 48, 22, paint(k.F, k.L, 5)) +
      rect(228, 20, 30, 24, 3, paint(k.F, k.L, 5)) +
      rect(258, 23, 14, 18, 3, paint(k.C)) +
      (kind === 'queue'
        ? rect(66, 22, 30, 20, 3, paint(k.K, k.L, 3)) + rect(116, 22, 30, 20, 3, paint(k.K, k.L, 3)) + rect(166, 22, 30, 20, 3, paint(k.K, k.L, 3))
        : kind === 'topic'
        ? rect(58, 22, 30, 20, 3, paint(k.K, k.L, 3)) + path('M96 32h26M122 32l28-11h50M122 32h78M122 32l28 11h50', paint('none', ink(k), 4))
        : path('M58 32q13-16 26 0t26 0t26 0t26 0t26 0t18-6', paint('none', ink(k), 4))),

    // A crew under tricorn hats.
    actor: (k, kind) =>
      figure(
        {
          k,
          w: 5,
          round: 1,
          hat: (cx, cy, r) => path(`M${cx - r * 1.5} ${cy - r * 0.35}Q${cx - r * 0.7} ${cy - r * 1.9} ${cx} ${cy - r * 1.6}Q${cx + r * 0.7} ${cy - r * 1.9} ${cx + r * 1.5} ${cy - r * 0.35}Q${cx} ${cy - r * 0.95} ${cx - r * 1.5} ${cy - r * 0.35}Z`, paint(k.L)),
        },
        kind,
      ),

    // A plank, nailed at both ends.
    componentCard: (k) =>
      rect(3, 3, 294, 102, 8, paint(k.F, k.L, 5)) +
      path('M30 3V105M270 3V105', paint('none', k.L, 2.5)) +
      circle(16, 20, 3, paint(k.L)) +
      circle(16, 88, 3, paint(k.L)) +
      circle(284, 20, 3, paint(k.L)) +
      circle(284, 88, 3, paint(k.L)),

    // A crate, braced at the corners.
    componentGlyph: (k, kind) =>
      rect(22, 14, 76, 76, 5, paint(k.F, k.L, W)) +
      path('M22 34L42 14M98 34L78 14M22 70L42 90M98 70L78 90', paint('none', k.L, 3)) +
      emblem(kind, 60, 52, 38, ink(k), 3.8),

    // A chart, one corner curling.
    artifact: (k, kind) =>
      path('M10 6H64Q78 6 78 20V94H24Q10 94 10 80Z', paint(k.F, k.L, 5)) +
      path('M64 6Q64 20 78 20', paint('none', k.L, 3)) +
      path('M10 80Q24 80 24 94', paint('none', k.L, 3)) +
      emblem(kind, 44, 50, 36, ink(k), 3.8),

    // A ship's wheel.
    junction: (k) =>
      path('M50 4V96M4 50H96M17 17L83 83M83 17L17 83', paint('none', k.L, 5)) +
      circle(50, 50, 30, paint(k.F, k.L, 7)) +
      circle(50, 50, 9, paint(k.C)),
  },
};

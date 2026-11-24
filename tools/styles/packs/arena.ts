import { group, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Arena: the three-lanes-and-a-base battle arena, in deep navy enamel with burnished gold trim.
 * Every kind is its own emblem from that world: a service is a bevelled plaque with pointed ends,
 * a worker the forge's anvil, a gateway the gatehouse, a load balancer the lane map; a cache is a
 * winged crystal, an object store a treasure chest, a queue a row of player tokens waiting for a
 * match. Angular and heraldic throughout: every frame is a bevel lit from the top left and shaded
 * below, gems are cut in three tones, and one cyan spark glows where there is magic, with a ruby or
 * an emerald where a second jewel is needed. Always dark: gold reads on navy.
 */

/** The materials, whatever colour the shape is. */
const GOLD = '#e3ad48';
const GOLD_HI = '#ffe9a6';
const GOLD_SH = '#84531a';
const CYAN = '#4fe6e0';
const CYAN_DEEP = '#0c4a5c';
const RUBY = '#e0405e';
const EMERALD = '#34c583';
const ENAMEL = '#081220';
/** The light that falls from the top left, and the shade it leaves. */
const HI = '#fff6d8';
const SH = '#030812';
const WHITE = '#ffffff';

type Pt = readonly [number, number];
const n2 = (v: number) => Math.round(v * 100) / 100;
const P = (s: string): Pt[] =>
  s
    .trim()
    .split(/\s+/)
    .map((q) => {
      const [x, y] = q.split(',').map(Number);
      return [x, y] as const;
    });
const S = (p: readonly Pt[]) => p.map(([x, y]) => `${n2(x)},${n2(y)}`).join(' ');
const box = (x: number, y: number, w: number, h: number): Pt[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];
const oct = (x: number, y: number, w: number, h: number, c: number): Pt[] => [
  [x + c, y],
  [x + w - c, y],
  [x + w, y + c],
  [x + w, y + h - c],
  [x + w - c, y + h],
  [x + c, y + h],
  [x, y + h - c],
  [x, y + c],
];
const dia = (cx: number, cy: number, rx: number, ry: number): Pt[] => [
  [cx, cy - ry],
  [cx + rx, cy],
  [cx, cy + ry],
  [cx - rx, cy],
];

const fillOp = (colour: string, o: number) => `fill="${colour}" fill-opacity="${o}"`;
const line = (colour: string, w: number) => paint('none', colour, w);
const lineOp = (colour: string, w: number, o: number) => `fill="none" stroke="${colour}" stroke-width="${w}" stroke-opacity="${o}"`;

/** The inward normal of every edge of a polygon, whichever way round it was written. */
function normals(p: readonly Pt[]): Pt[] {
  const n = p.length;
  let a = 0;
  for (let i = 0; i < n; i++) a += p[i][0] * p[(i + 1) % n][1] - p[(i + 1) % n][0] * p[i][1];
  const s = a > 0 ? 1 : -1;
  return p.map((q, i) => {
    const r = p[(i + 1) % n];
    const dx = r[0] - q[0];
    const dy = r[1] - q[1];
    const l = Math.hypot(dx, dy) || 1;
    return [(s * -dy) / l, (s * dx) / l] as const;
  });
}
/** A polygon drawn `d` inside another, corner for corner. */
function inset(p: readonly Pt[], d: number): Pt[] {
  const n = p.length;
  const nr = normals(p);
  return p.map((q, i) => {
    const na = nr[(i + n - 1) % n];
    const nb = nr[i];
    const f = d / Math.max(1 + na[0] * nb[0] + na[1] * nb[1], 0.4);
    return [q[0] + (na[0] + nb[0]) * f, q[1] + (na[1] + nb[1]) * f] as const;
  });
}
/** The lit and the shaded faces of a bevel `d` wide round a polygon: two paths, one for each. */
function bevel(p: readonly Pt[], d: number): { q: Pt[]; faces: string } {
  const n = p.length;
  const q = inset(p, d);
  const nr = normals(p);
  let lit = '';
  let dark = '';
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dot = nr[i][0] * 0.6 + nr[i][1] * 0.8;
    const quad = `M${S([p[i], p[j], q[j], q[i]]).replace(/ /g, 'L')}Z`;
    if (dot > 0.3) lit += quad;
    else if (dot < -0.3) dark += quad;
  }
  return { q, faces: (lit ? path(lit, fillOp(HI, 0.55)) : '') + (dark ? path(dark, fillOp(SH, 0.45)) : '') };
}
/** A bevelled plate: a frame in the shape's line colour, lit above and shaded below, round a field of its fill. */
const plate = (k: Kit, p: readonly Pt[], d: number, rim: string = k.L, field: string = k.F): string => {
  const b = bevel(p, d);
  return poly(S(p), paint(rim)) + b.faces + poly(S(b.q), paint(field));
};
/** A solid piece of metal, bevelled the same way. */
const solid = (p: readonly Pt[], d: number, colour: string): string => poly(S(p), paint(colour)) + bevel(p, d).faces;
/** A cut gem: a body, a lit facet, a shaded facet and a bright table. */
const gem = (cx: number, cy: number, rx: number, ry: number, colour: string, o: { glow?: boolean; table?: boolean; edge?: string; rich?: boolean } = {}): string => {
  const a = dia(cx, cy, rx, ry);
  const i = dia(cx, cy, rx * 0.46, ry * 0.46);
  return (
    (o.glow ? poly(S(dia(cx, cy, rx + 6, ry + 6)), fillOp(colour, 0.22)) : '') +
    poly(S(a), paint(colour, o.edge ?? SH, 1.5)) +
    poly(S([a[0], i[0], i[3], a[3]]), fillOp(WHITE, 0.55)) +
    poly(S([a[1], a[2], i[2], i[1]]), fillOp(SH, 0.42)) +
    (o.rich ? poly(S([a[3], i[3], i[2], a[2]]), fillOp(SH, 0.2)) + poly(S([a[0], a[1], i[1], i[0]]), fillOp(WHITE, 0.18)) : '') +
    (o.table === false ? '' : poly(S([i[0], i[1], i[3]]), fillOp(WHITE, 0.3)))
  );
};
/** A gold stud, lit on its upper left. */
const stud = (cx: number, cy: number, r: number): string => {
  const a = dia(cx, cy, r, r);
  return poly(S(a), paint(GOLD, GOLD_SH, 1)) + poly(S([a[0], [cx, cy], a[3]]), fillOp(GOLD_HI, 0.85));
};
const starPts = (cx: number, cy: number, r: number): Pt[] => {
  const q = r * 0.26;
  return [
    [cx, cy - r],
    [cx + q, cy - q],
    [cx + r, cy],
    [cx + q, cy + q],
    [cx, cy + r],
    [cx - q, cy + q],
    [cx - r, cy],
    [cx - q, cy - q],
  ];
};
/** A four-pointed spark of magic, with its glow and a white heart. */
const star = (cx: number, cy: number, r: number, colour: string = CYAN): string =>
  poly(S(starPts(cx, cy, r * 1.45)), fillOp(colour, 0.25)) + poly(S(starPts(cx, cy, r)), paint(colour)) + poly(S(dia(cx, cy, r * 0.3, r * 0.3)), fillOp(WHITE, 0.85));
/** A line of light: the stroke, and the same stroke wider and fainter under it. */
const glowLine = (d: string, colour: string, w: number): string => path(d, lineOp(colour, w * 2.8, 0.22)) + path(d, line(colour, w));
/** A rod of the shape's metal with a lit ridge. */
const rod = (d: string, colour: string, w: number): string => path(d, line(colour, w)) + group(`translate(${n2(-w * 0.2)} ${n2(-w * 0.2)})`, path(d, lineOp(HI, n2(w * 0.3), 0.6)));

/** A helm seen from the front, `s` times the size of the champion's, its visor dark and its eyes lit. */
const helm = (k: Kit, cx: number, top: number, s: number, slit: 'T' | 'bar' = 'T'): string => {
  const p = (x: number, y: number): Pt => [cx + x * s, top + y * s];
  const y = top + (slit === 'T' ? 23 : 24) * s;
  return (
    plate(k, [p(-20, 18), p(-12, 0), p(12, 0), p(20, 18), p(18, 40), p(0, 50), p(-18, 40)], 4 * s) +
    poly(S([p(-2.5, 0), p(2.5, 0), p(2.5, 17), p(-2.5, 17)]), paint(k.C)) +
    path(slit === 'T' ? `M${n2(cx - 13 * s)} ${n2(y)}H${n2(cx + 13 * s)}M${cx} ${n2(y)}V${n2(top + 42 * s)}` : `M${n2(cx - 13 * s)} ${n2(y)}H${n2(cx + 13 * s)}`, line(ENAMEL, n2(7 * s))) +
    path(`M${n2(cx - 10 * s)} ${n2(y)}h${n2(6 * s)}M${n2(cx + 4 * s)} ${n2(y)}h${n2(6 * s)}`, line(CYAN, n2(3 * s)))
  );
};

/** The arena floor: a worn honeycomb of flagstones, three cells by four. */
const floor = (): string => {
  const edges: [number, number, number, number][] = [
    [0, 52, 30, 0],
    [30, 0, 90, 0],
    [90, 0, 120, 52],
    [120, 52, 180, 52],
    [0, 52, 30, 104],
    [90, 104, 120, 52],
  ];
  const kept = (i: number, j: number, e: number) => (i * 7 + j * 13 + e * 5 + i * j * 3) % 10 > 2;
  let d = '';
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 4; j++)
      edges.forEach(([x1, y1, x2, y2], e) => {
        if (!kept(i, j, e)) return;
        d += `M${x1 + i * 180} ${y1 + j * 104}L${x2 + i * 180} ${y2 + j * 104}`;
        // The top row's flat edges lie on the seam: drawn again along the bottom, half and half.
        if (e === 1 && j === 0) d += `M${x1 + i * 180} 416L${x2 + i * 180} 416`;
      });
  return d;
};
const hexAt = (cx: number, cy: number, s = 1): string => S([[-60, 0], [-30, -52], [30, -52], [60, 0], [30, 52], [-30, 52]].map(([x, y]) => [cx + x * s, cy + y * s] as const));

export const arena: Pack = {
  id: 'arena',
  name: 'Arena',
  summary: 'Navy enamel and bevelled gold battle arena: plaques, turrets, cut gems, loot and the lanes between them',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 30,
  style: {
    // Cast metal: heavy, hard-cornered, and standing well off the floor.
    hand: { base: 'clean' },
    general: { weight: 'bold', corners: 'sharp', depth: 'deep' },
    connectors: { weight: 'bold', head: 'triangle', colour: 'plain' },
    schemes: {
      dark: scheme(
        { canvas: '#0e1a2b', grid: '#1a2a42', text: '#f6ead0', textMuted: '#bfa972', edge: '#c9a65a', edgeText: '#ecd9a6', edgeLabelBg: '#132238', codeBg: '#111e32', codeBorder: '#2a3d59' },
        {
          neutral: ['#15294a', '#dcab4c', '#f8edcb', '#f5c85e'],
          teal: ['#0d3238', '#43d3c6', '#d6f9f4', '#77ecdf'],
          blue: ['#152e58', '#6ba7f6', '#deebfe', '#95c2fb'],
          violet: ['#2b2055', '#aa8ef8', '#eae2fe', '#c5b0fb'],
          amber: ['#3b2a0b', '#f1b53f', '#fef0cb', '#ffd570'],
          rose: ['#421626', '#ef6482', '#fddbe2', '#f892a6'],
          green: ['#11331f', '#5bd08b', '#d6f7e2', '#88e3ab'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      // A name plaque with pointed ends: a bevelled frame, a second line inside it, a gold crest
      // with a spark at the top and a gold tooth at the bottom, and studs on its shoulders.
      const crest = solid(P('150,1 198,1 189,10 174,18 159,10'), 3, GOLD) + gem(174, 8, 6, 5, CYAN, { table: false }) + solid(P('160,131 188,131 174,119'), 3, GOLD);
      // An API is that plaque squared off on the right, with a glowing gem set in its left point:
      // the socket others plug into. Its inner line stops short of the bottom-right corner, where
      // the app writes "API".
      if (kind === 'api') {
        return (
          plate(k, P('26,3 320,3 345,28 345,129 26,129 3,66'), 9) +
          path('M290 114H35L20 66L35 18H313L330 35V86', lineOp(k.C, 2.5, 0.8)) +
          crest +
          stud(332.5, 15.5, 6) +
          stud(46, 7.5, 5) +
          stud(46, 124.5, 5) +
          gem(23, 66, 14, 24, CYAN, { glow: true, rich: true })
        );
      }
      const p = P('26,3 322,3 345,66 322,129 26,129 3,66');
      return (
        plate(k, p, 9) +
        poly(S(inset(p, 15)), lineOp(k.C, 2.5, 0.8)) +
        crest +
        stud(46, 7.5, 5) +
        stud(302, 7.5, 5) +
        stud(46, 124.5, 5) +
        stud(302, 124.5, 5) +
        gem(18, 66, 9, 17, k.C) +
        gem(330, 66, 9, 17, k.C)
      );
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // The forge: an anvil, a hammer coming down on it and the spark it strikes.
        case 'worker':
          return (
            plate(k, P('3,59 36,52 131,52 131,74 105,74 93,84 93,88 111,88 111,103 25,103 25,88 43,88 43,84 35,76 19,75'), 5) +
            path('M42 64H124', lineOp(k.C, 5, 0.9)) +
            stud(68, 95.5, 5.5) +
            group(
              'translate(70 19) rotate(58)',
              poly(S(box(-4.5, -36, 9, 38)), paint(GOLD_SH)) + poly(S(box(-4.5, -36, 3, 38)), fillOp(GOLD_HI, 0.5)) + plate(k, oct(-21, 0, 42, 24, 5), 5) + rect(-21, 9, 42, 5, 0, paint(GOLD)),
            ) +
            star(20, 34, 15) +
            poly(S(dia(40, 20, 3.5, 3.5)), paint(CYAN)) +
            poly(S(dia(8, 16, 3, 3)), fillOp(CYAN, 0.7))
          );
        // A teleport gate to somewhere else: a standing ring of stone with a swirl of magic in it.
        case 'external':
          return (
            solid(P('38,92 98,92 112,103 24,103'), 3, k.L) +
            plate(k, P('34,2 102,2 128,24 128,72 102,94 34,94 8,72 8,24'), 6) +
            poly('45,20 91,20 108,34 108,62 91,76 45,76 28,62 28,34', paint(CYAN_DEEP, k.L, 3.5)) +
            path('M45 20H91L108 34L104 36L89 24H47L32 36L28 34Z', fillOp(SH, 0.5)) +
            glowLine('M68 49C75 42 84 50 77 57C66 66 52 58 54 45C57 32 78 28 91 40', CYAN, 4.5) +
            poly(S(dia(68, 49, 4, 4)), paint(WHITE)) +
            gem(68, 11, 6, 6, k.C, { table: false }) +
            gem(18, 48, 6, 8, k.C, { table: false }) +
            gem(118, 48, 6, 8, k.C, { table: false })
          );
        // The respawn timer: an hourglass between two gold posts, its sand lit.
        case 'scheduler':
          return (
            rod('M30 16V88M106 16V88', k.L, 6) +
            path('M38 17H98V28L75 52L98 76V87H38V76L61 52L38 28Z', paint(k.F, k.L, 3.5)) +
            path('M38 17H52V30L61 52L38 28Z', fillOp(HI, 0.16)) +
            poly('45,31 91,31 68,50', fillOp(CYAN, 0.25)) +
            poly('47,31 89,31 68,48', paint(CYAN)) +
            poly('47,31 68,31 68,48', fillOp(WHITE, 0.35)) +
            glowLine('M68 48V70', CYAN, 2.5) +
            poly('43,84 93,84 68,60', fillOp(CYAN, 0.25)) +
            poly('46,84 90,84 68,63', paint(CYAN)) +
            poly('68,63 90,84 68,84', fillOp(SH, 0.3)) +
            plate(k, oct(18, 2, 100, 15, 4), 4.5) +
            plate(k, oct(18, 87, 100, 15, 4), 4.5) +
            stud(68, 9.5, 4.5) +
            stud(68, 94.5, 4.5)
          );
        // The gatehouse: two turrets, a wall between them and the one lit gate through it.
        case 'gateway':
          return (
            plate(k, P('6,102 6,4 19,4 19,14 31,14 31,4 44,4 44,34 57,34 68,21 79,34 92,34 92,4 105,4 105,14 117,14 117,4 130,4 130,102'), 4) +
            path('M10 27H40M96 27H126', lineOp(k.C, 4, 0.9)) +
            poly('50,102 50,66 68,47 86,66 86,102', paint(CYAN_DEEP, k.L, 5)) +
            poly('56,98 56,69 68,57 80,69 80,98', fillOp(CYAN, 0.28)) +
            path('M62 60V100M74 60V100M53 82H83', line(k.L, 3)) +
            path('M21 40h8v20h-8zM107 40h8v20h-8z', fillOp(CYAN, 0.3)) +
            path('M22.5 42h5v16h-5zM108.5 42h5v16h-5z', paint(CYAN)) +
            gem(68, 36, 6, 7, RUBY, { table: false }) +
            path('M10 96H46V98H10ZM90 96H126V98H90Z', fillOp(SH, 0.35))
          );
        // The lane map: one base, three lanes fanning out to three turrets.
        case 'load-balancer':
          return (
            path('M34 46L104 15M40 52H106M34 58L104 89', lineOp(SH, 12, 0.5)) +
            rod('M34 46L104 15M40 52H106M34 58L104 89', k.L, 7) +
            plate(k, P('3,52 14,29 38,29 49,52 38,75 14,75'), 5) +
            gem(26, 52, 9, 13, CYAN, { glow: true }) +
            gem(115, 15, 18, 13, k.C, { edge: k.L, rich: true }) +
            gem(117, 52, 18, 13, k.C, { edge: k.L, rich: true }) +
            gem(115, 89, 18, 13, k.C, { edge: k.L, rich: true })
          );
        // A ward: a watching eye on a spike, planted between one side and the other.
        case 'proxy':
          return (
            plate(k, P('54,56 82,56 68,103'), 4.5) +
            plate(k, P('4,36 28,14 52,4 84,4 108,14 132,36 108,57 84,67 52,67 28,57'), 6) +
            poly(S(oct(49, 16, 38, 39, 11)), paint(ENAMEL, k.L, 3.5)) +
            gem(68, 35.5, 10, 14, CYAN, { glow: true, rich: true }) +
            path('M41 72L28 85L41 98M95 72L108 85L95 98', line(k.C, 5)) +
            stud(18, 36, 4.5) +
            stud(118, 36, 4.5)
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // The vault crest: a shield bearing a stack of three plates.
        case 'generic': {
          const disc = (y: number) =>
            poly(`44,${y} 57,${y - 8} 83,${y - 8} 96,${y} 96,${y + 5} 83,${y + 13} 57,${y + 13} 44,${y + 5}`, paint(k.L, k.F, 2.5)) +
            poly(`44,${y} 57,${y - 8} 83,${y - 8} 96,${y} 83,${y + 8} 57,${y + 8}`, fillOp(HI, 0.5)) +
            poly(`70,${y + 8} 83,${y + 8} 96,${y} 96,${y + 5} 83,${y + 13} 70,${y + 13}`, fillOp(SH, 0.4));
          const p = P('70,2 128,15 128,58 107,87 70,106 33,87 12,58 12,15');
          return plate(k, p, 7) + poly(S(inset(p, 12)), lineOp(k.C, 2, 0.7)) + disc(68) + disc(51) + disc(34) + gem(70, 34, 7, 4.5, CYAN, { table: false });
        }
        // The scoreboard: ranked rows in strict columns, on its two posts, under a gold crest.
        case 'sql':
          return (
            rod('M30 88V106M110 88V106', k.L, 7) +
            solid(P('52,17 70,2 88,17'), 3, GOLD) +
            plate(k, oct(4, 15, 132, 78, 10), 5) +
            path('M10 41H130M10 67H130M41 21V87', lineOp(k.L, 2.5, 0.75)) +
            gem(25, 30.5, 8, 8, CYAN, { glow: true, table: false }) +
            gem(25, 54, 7, 7, k.C, { table: false }) +
            gem(25, 78, 7, 7, k.C, { table: false }) +
            path('M52 30.5H122M52 54H108M52 78H92', line(k.T, 6))
          );
        // A loot bag: a tied sack with a gem, a coin and a card poking out of it, nothing alike.
        case 'nosql':
          return (
            gem(70, 20, 14, 18, CYAN, { glow: true, rich: true }) +
            solid(oct(27, 12, 26, 26, 8), 3, GOLD) +
            poly(S(dia(40, 25, 5, 5)), fillOp(GOLD_SH, 0.8)) +
            plate(k, P('88,22 104,8 117,25 101,39'), 3, k.L, RUBY) +
            plate(k, P('46,43 26,61 10,84 19,100 44,106 96,106 121,100 130,84 114,61 94,43'), 5) +
            poly('70,48 94,48 114,64 125,84 119,97 96,101 70,101', fillOp(SH, 0.22)) +
            solid(oct(40, 35, 60, 13, 4), 3, GOLD) +
            path('M38 80l7 -7l7 7l-7 7zM62 72h16v16h-16zM86 88l9 -17l9 17z', line(k.T, 3.5))
          );
        // A speed rune: a crystal with gold wings and a bolt of lightning in it.
        case 'cache': {
          const wing = (m: number) =>
            group(
              m < 0 ? 'translate(140 0) scale(-1 1)' : 'translate(0 0)',
              poly('42,30 2,7 13,31 3,36 17,53 9,59 42,78', paint(k.L)) + poly(m < 0 ? '42,78 9,59 17,53 42,64' : '42,30 2,7 8,20 42,42', m < 0 ? fillOp(SH, 0.4) : fillOp(HI, 0.5)) + path('M13 31L40 44M17 53L40 58', lineOp(SH, 2.5, 0.5)),
            );
          const p = P('70,2 104,27 104,81 70,106 36,81 36,27');
          return (
            wing(1) +
            wing(-1) +
            plate(k, p, 5.5) +
            poly('70,8 41,29 41,79 70,100', fillOp(HI, 0.1)) +
            poly('70,8 99,29 99,79 70,100', fillOp(SH, 0.25)) +
            poly('80,24 53,62 67,62 60,94 89,54 74,54', lineOp(CYAN, 7, 0.25)) +
            poly('80,24 53,62 67,62 60,94 89,54 74,54', paint(CYAN)) +
            poly('78,30 60,58 70,58', fillOp(WHITE, 0.6))
          );
        }
        // A tome lying open, with index tabs down its edge and a ribbon to mark the place: folders of pages.
        case 'file-system':
          return (
            poly('113,25 137,25 137,40 113,40', paint(k.C, ENAMEL, 2)) +
            poly('113,46 137,46 137,61 113,61', paint(CYAN, ENAMEL, 2)) +
            poly('113,67 137,67 137,82 113,82', paint(GOLD, ENAMEL, 2)) +
            path('M113 25H137V29H113ZM113 46H137V50H113ZM113 67H137V71H113Z', fillOp(WHITE, 0.4)) +
            solid(P('3,25 3,99 64,106 123,99 123,25'), 4, k.L) +
            poly('64,27 37,13 10,19 10,90 37,84 64,96', paint(k.F, k.L, 3)) +
            poly('64,27 91,13 116,19 116,90 91,84 64,96', paint(k.F, k.L, 3)) +
            poly('64,27 91,13 116,19 116,90 91,84 64,96', fillOp(SH, 0.25)) +
            poly('64,27 52,21 52,90 64,96', fillOp(SH, 0.22)) +
            path('M19 34H46M19 48H46M19 62H38', line(k.T, 4.5)) +
            gem(90, 52, 13, 17, k.C, { rich: true }) +
            poly('59,88 69,88 69,107 64,102 59,107', paint(RUBY, ENAMEL, 1.5))
          );
        // A treasure chest, strapped in gold and locked, light leaking from under its lid.
        case 'object-storage':
          return (
            plate(k, P('24,6 116,6 130,46 10,46'), 5) +
            plate(k, box(10, 44, 120, 60), 5) +
            poly('15,49 125,49 125,62 15,62', fillOp(SH, 0.3)) +
            glowLine('M15 45H125', CYAN, 2.5) +
            path('M33 6h10v98h-10zM97 6h10v98h-10z', paint(GOLD)) +
            path('M33 6h3.5v98h-3.5zM97 6h3.5v98h-3.5z', fillOp(GOLD_HI, 0.7)) +
            path('M40 6h3v98h-3zM104 6h3v98h-3z', fillOp(GOLD_SH, 0.7)) +
            solid(P('56,34 84,34 84,60 70,71 56,60'), 3.5, GOLD) +
            poly(S(dia(70, 50, 5, 8)), paint(ENAMEL))
          );
        // A scout's spyglass, pulled out, and the thing it found.
        case 'search-index': {
          const tube = (x: number, h: number) =>
            rect(x, -h, 44, h * 2, 0, paint(k.F, k.L, 4)) + rect(x + 2, -h + 2, 40, h * 0.5, 0, fillOp(HI, 0.22)) + rect(x + 2, h * 0.3, 40, h * 0.7 - 2, 0, fillOp(SH, 0.35));
          return (
            group(
              'translate(10 94) rotate(-31)',
              tube(0, 8) +
                tube(40, 12) +
                tube(80, 16) +
                path('M38 -11h6v22h-6zM78 -15h6v30h-6z', paint(GOLD)) +
                path('M38 -11h6v6h-6zM78 -15h6v8h-6z', fillOp(GOLD_HI, 0.7)) +
                rect(121, -21, 12, 42, 0, paint(GOLD, GOLD_SH, 1.5)) +
                rect(121, -21, 12, 12, 0, fillOp(GOLD_HI, 0.7)) +
                rect(121, 9, 12, 12, 0, fillOp(GOLD_SH, 0.6)),
            ) + star(112, 82, 15)
          );
        }
        // One stat tablet: a slab with its corners cut, a header and a grid, one cell lit.
        case 'table':
          return (
            plate(k, P('20,3 120,3 136,19 136,105 4,105 4,19'), 5) +
            poly('22,8 118,8 131,21 131,30 9,30 9,21', paint(k.C)) +
            poly('22,8 118,8 123,13 17,13', fillOp(WHITE, 0.4)) +
            poly('9,25 131,25 131,30 9,30', fillOp(SH, 0.3)) +
            rect(50, 56, 40, 22, 0, fillOp(CYAN, 0.3)) +
            path('M9 31.5H131M9 55H131M9 79H131M49 31V100M91 31V100', line(k.L, 3)) +
            gem(70, 67, 7, 7, CYAN, { table: false }) +
            path('M17 43H41M17 67H41M17 90H41M99 43H123M99 67H115M99 90H123M57 43H83M57 90H75', lineOp(k.T, 4, 0.75))
          );
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // The matchmaking queue: player tokens waiting in a row, the one at the front lit, and the way out.
        case 'queue': {
          const token = (x: number, lit: boolean) => {
            const c = lit ? CYAN : k.L;
            return (
              (lit ? poly(`${x - 17},9 ${x + 17},9 ${x + 17},40 ${x},56 ${x - 17},40`, fillOp(CYAN, 0.22)) : '') +
              poly(`${x - 13},13 ${x + 13},13 ${x + 13},38 ${x},51 ${x - 13},38`, paint(c, ENAMEL, 1.5)) +
              poly(`${x - 13},13 ${x},13 ${x},51 ${x - 13},38`, fillOp(WHITE, lit ? 0.4 : 0.3)) +
              poly(`${x - 6},20 ${x + 6},20 ${x + 6},34 ${x},40 ${x - 6},34`, fillOp(SH, lit ? 0.3 : 0.45))
            );
          };
          return (
            plate(k, oct(3, 3, 270, 58, 11), 4.5) +
            token(40, false) +
            token(86, false) +
            token(132, false) +
            token(178, true) +
            path('M206 14L226 32L206 50M228 14L248 32L228 50', line(k.C, 6))
          );
        }
        // The announcer's horn: one call, fanned out to three different jewels.
        case 'topic':
          return (
            plate(k, P('10,3 244,3 273,13 256,22 273,32 256,42 273,51 244,61 10,61 3,54 3,10'), 4.5) +
            path('M76 22L216 13M76 32H222M76 42L216 51', lineOp(k.C, 4, 0.9)) +
            solid(P('13,23 30,23 60,9 60,55 30,41 13,41'), 3, GOLD) +
            rect(59, 6, 7, 52, 0, paint(GOLD_HI, GOLD_SH, 1.5)) +
            path('M72 16L80 12M72 48L80 52', lineOp(GOLD_HI, 3, 0.8)) +
            gem(231, 14, 11, 8, CYAN, { glow: true, table: false }) +
            gem(237, 32, 11, 8, RUBY, { table: false }) +
            gem(231, 50, 11, 8, EMERALD, { table: false })
          );
        // A lane: chevrons marching down it without end, brighter as they go.
        case 'stream': {
          const chev = (x: number) => `${x},13 ${x + 17},13 ${x + 34},32 ${x + 17},51 ${x},51 ${x + 17},32`;
          return (
            plate(k, P('3,3 250,3 273,32 250,61 3,61 24,32'), 4.5) +
            [44, 92, 140].map((x, i) => poly(chev(x), fillOp(k.C, 0.5 + i * 0.22))).join('') +
            poly(chev(186), lineOp(CYAN, 8, 0.22)) +
            poly(chev(188), paint(CYAN)) +
            path([44, 92, 140, 188].map((x) => `M${x} 13h17l17 19h-17z`).join(''), fillOp(WHITE, 0.28))
          );
        }
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // A champion: armoured shoulders, a jewel at the collar and a horned helm.
        case 'human':
          return (
            plate(k, P('6,81 13,60 40,49 80,49 107,60 114,81'), 4.5) +
            path('M17 66L41 57H79L103 66', lineOp(k.C, 3, 0.85)) +
            gem(60, 69, 7, 9, CYAN, { glow: true, table: false }) +
            poly('43,28 24,22 15,2 32,11 47,14', paint(k.C, ENAMEL, 1.5)) +
            poly('77,28 96,22 105,2 88,11 73,14', paint(k.C, ENAMEL, 1.5)) +
            poly('15,2 32,11 47,14 43,19 28,16', fillOp(WHITE, 0.45)) +
            poly('77,28 96,22 105,2 98,19 84,22', fillOp(SH, 0.35)) +
            helm(k, 60, 7, 1.04)
          );
        // A team: three helms shoulder to shoulder, the captain in front under a gold crest.
        case 'group':
          return (
            poly('2,81 6,66 18,60 46,60 46,81', paint(k.F, k.L, 4)) +
            poly('118,81 114,66 102,60 74,60 74,81', paint(k.F, k.L, 4)) +
            helm(k, 27, 23, 0.74) +
            helm(k, 93, 23, 0.74) +
            path('M0 60H120V82H0Z', fillOp(SH, 0.28)) +
            plate(k, P('24,81 31,62 46,54 74,54 89,62 96,81'), 4) +
            solid(P('53,12 60,0 67,12'), 2, GOLD) +
            helm(k, 60, 9, 0.92)
          );
        // A rival: a stranger's helm under another team's ruby banner.
        case 'thirdParty':
          return (
            plate(k, P('2,81 8,62 26,53 50,53 68,62 74,81'), 4) +
            helm(k, 38, 8, 0.92, 'bar') +
            rod('M113 4V82', k.L, 6) +
            path('M76 10H113', line(k.L, 5)) +
            stud(113, 5, 5) +
            poly('79,12 107,12 107,58 93,47 79,58', paint(RUBY, ENAMEL, 1.5)) +
            poly('79,12 93,12 93,47 79,58', fillOp(WHITE, 0.25)) +
            poly('93,12 107,12 107,58 93,47', fillOp(SH, 0.25)) +
            poly(S(dia(93, 29, 7, 9)), paint(GOLD, GOLD_SH, 1.5))
          );
        // The base core: a great crystal held over its pedestal between two claws.
        case 'system':
          return (
            rod('M36 64L8 44L17 15M84 64L112 44L103 15', k.L, 6.5) +
            plate(k, P('13,81 107,81 107,68 93,68 84,59 36,59 27,68 13,68'), 4) +
            plate(k, dia(60, 29, 27, 28), 5) +
            gem(60, 29, 13, 19, CYAN, { glow: true, rich: true }) +
            stud(60, 70, 5)
          );
        // A handheld ward stone: a pointed slab with a lit rune on its face and one button.
        case 'device':
          return (
            plate(k, P('60,2 82,16 82,72 74,80 46,80 38,72 38,16'), 4.5) +
            poly('60,13 73,22 73,56 47,56 47,22', paint(ENAMEL, k.L, 2)) +
            poly('60,15 71,23 71,30 49,44 49,23', fillOp(WHITE, 0.08)) +
            gem(60, 37, 8, 13, CYAN, { glow: true }) +
            gem(60, 67, 6, 6, k.C, { table: false })
          );
        // A training bot: a square head with one cyan eye.
        case 'agent':
          return (
            path('M60 14V7', line(k.L, 4)) +
            gem(60, 6, 6, 6, RUBY, { table: false }) +
            rect(51, 55, 18, 10, 0, paint(k.L)) +
            path('M13 26h10v18h-10zM97 26h10v18h-10z', paint(k.L)) +
            path('M13 26h10v5h-10zM97 26h10v5h-10z', fillOp(HI, 0.5)) +
            plate(k, P('16,81 25,63 95,63 104,81'), 4) +
            plate(k, oct(24, 13, 72, 44, 10), 4.5) +
            poly('36,24 84,24 90,35 84,46 36,46 30,35', paint(ENAMEL, k.L, 2)) +
            gem(60, 35, 11, 9, CYAN, { glow: true }) +
            path('M48 73H72', line(k.C, 4))
          );
      }
    },

    // An item slot: a bevelled frame with its corners notched out, a gem set in each notch and a
    // second line inside.
    componentCard: (k) =>
      plate(k, P('14,3 286,3 286,14 297,14 297,94 286,94 286,105 14,105 14,94 3,94 3,14 14,14'), 6) +
      poly(S(oct(15, 15, 270, 78, 10)), lineOp(k.C, 2.5, 0.8)) +
      gem(9, 9, 8, 8, k.C, { table: false }) +
      gem(291, 9, 8, 8, k.C, { table: false }) +
      gem(9, 99, 8, 8, k.C, { table: false }) +
      gem(291, 99, 8, 8, k.C, { table: false }) +
      stud(150, 6, 4.5) +
      stud(150, 102, 4.5),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // An item gem, cut and faceted: one unit of power.
        case 'module':
          return (
            poly('26,4 94,4 116,36 60,102 4,36', paint(k.F, k.L, 5)) +
            poly('26,4 42,36 4,36', fillOp(k.C, 0.45)) +
            poly('26,4 60,4 42,36', fillOp(k.C, 0.9)) +
            poly('60,4 78,36 42,36', fillOp(k.C, 0.65)) +
            poly('60,4 94,4 78,36', fillOp(k.C, 0.4)) +
            poly('4,36 42,36 60,102', fillOp(k.C, 0.7)) +
            poly('42,36 78,36 60,102', fillOp(k.C, 0.45)) +
            poly('78,36 116,36 60,102 94,4', fillOp(SH, 0.3)) +
            poly('26,4 60,4 42,36', fillOp(WHITE, 0.3)) +
            path('M4 36H116M26 4L42 36L60 4L78 36L94 4M42 36L60 102L78 36', line(k.L, 3)) +
            star(36, 20, 9, WHITE)
          );
        // A gem in a gold-pronged mount: it plugs into something else.
        case 'adapter':
          return (
            solid(box(90, 22, 29, 17), 3.5, k.L) +
            solid(box(90, 65, 29, 17), 3.5, k.L) +
            path('M110 22h9v17h-9zM110 65h9v17h-9z', paint(GOLD)) +
            path('M110 22h9v5h-9zM110 65h9v5h-9z', fillOp(GOLD_HI, 0.7)) +
            plate(k, P('30,8 80,8 97,25 97,79 80,96 30,96'), 6) +
            poly(S(dia(39, 52, 37, 46)), paint(k.L)) +
            gem(39, 52, 30, 38, k.C, { rich: true }) +
            star(29, 39, 7, WHITE)
          );
        // An empty socket: a ring with four gold claws, waiting for a gem.
        case 'port':
          return (
            plate(k, P('36,4 84,4 112,30 112,74 84,100 36,100 8,74 8,30'), 7) +
            poly('44,25 76,25 90,38 90,66 76,79 44,79 30,66 30,38', paint(ENAMEL, k.L, 3.5)) +
            path('M44 25H76L90 38L85 40L74 30H46L35 40L30 38Z', fillOp(SH, 0.6)) +
            poly(S(dia(60, 52, 12, 14)), fillOp(CYAN, 0.16)) +
            poly(S(dia(60, 52, 5, 6)), fillOp(CYAN, 0.5)) +
            path('M30 37L43 24L52 45ZM90 37L77 24L68 45ZM30 67L43 80L52 59ZM90 67L77 80L68 59Z', paint(GOLD, GOLD_SH, 1.5)) +
            path('M30 37L43 24L46 31ZM90 37L77 24L74 31ZM30 67L36 61L52 59ZM68 59L84 61L90 67Z', fillOp(GOLD_HI, 0.75))
          );
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A scroll of patch notes, rolled at both ends and sealed in ruby wax.
        case 'file':
          return (
            rect(11, 12, 64, 76, 0, paint(k.F, k.L, 4)) +
            rect(13, 18, 60, 7, 0, fillOp(SH, 0.4)) +
            path('M23 34H63M23 46H63M23 58H63M23 70H44', line(k.T, 4.5)) +
            plate(k, oct(2, 3, 82, 16, 5), 4.5) +
            plate(k, oct(2, 81, 82, 16, 5), 4.5) +
            gem(60, 72, 8, 8, RUBY, { table: false })
          );
        // A page of settings: three sliders, each set somewhere else.
        case 'config':
          return (
            plate(k, oct(3, 3, 80, 94, 11), 4.5) +
            path('M15 27H71M15 50H71M15 73H71', lineOp(SH, 7, 0.5)) +
            path('M15 27H71M15 50H71M15 73H71', lineOp(k.L, 3, 0.9)) +
            gem(30, 27, 10, 10, k.C, { table: false }) +
            gem(57, 50, 10, 10, CYAN, { glow: true, table: false }) +
            gem(38, 73, 10, 10, k.C, { table: false })
          );
        // An ornate key, a glowing jewel in its bow.
        case 'secret':
          return group(
            'translate(41.5 53) rotate(-34)',
            solid(P('-5.5,-12 5.5,-12 5.5,24 22,24 22,34 5.5,34 5.5,38 17,38 17,48 -5.5,48'), 2.5, k.L) + plate(k, dia(0, -32, 26, 26), 7, k.L, ENAMEL) + gem(0, -32, 10, 10, CYAN, { glow: true }),
          );
        // A rank medal on its ribbon: two chevrons earned.
        case 'certificate':
          return (
            poly('10,3 32,3 49,38 33,45', paint(k.C, ENAMEL, 1.5)) +
            poly('76,3 54,3 37,38 53,45', paint(k.C, ENAMEL, 1.5)) +
            poly('76,3 54,3 37,38 53,45', fillOp(SH, 0.35)) +
            poly('10,3 21,3 40,42 33,45', fillOp(WHITE, 0.3)) +
            plate(k, P('43,32 73,48 73,82 43,98 13,82 13,48'), 5.5) +
            path('M28 67L43 55L58 67M28 82L43 70L58 82', line(GOLD, 5.5)) +
            path('M28 65L43 53L46 55.5L31 67.5ZM28 80L43 68L46 70.5L31 82.5Z', fillOp(GOLD_HI, 0.7))
          );
      }
    },

    // A gem's bezel seen from above: a faceted ring with a jewel at each compass point, its middle
    // left empty for the word.
    junction: (k) => {
      const p = oct(4, 4, 92, 92, 27);
      const q = inset(p, 12);
      return (
        plate(k, p, 12) +
        path(p.map((a, i) => `M${S([a, q[i]]).replace(' ', 'L')}`).join(''), lineOp(SH, 1.5, 0.5)) +
        gem(50, 10, 5, 5, CYAN, { table: false }) +
        gem(50, 90, 5, 5, CYAN, { table: false }) +
        gem(10, 50, 5, 5, CYAN, { table: false }) +
        gem(90, 50, 5, 5, CYAN, { table: false })
      );
    },
  },

  // The arena floor by starlight: a worn honeycomb of flagstones, a few of them a shade lighter,
  // a rune ring, survey ticks and a scatter of small stars.
  backdrop: {
    tile: [540, 416],
    draw: () =>
      poly(hexAt(240, 156), paint('#101d31')) +
      poly(hexAt(420, 364), paint('#101c30')) +
      poly(hexAt(60, 260), paint('#0f1c2f')) +
      path(floor(), line('#1a2b45', 1.25)) +
      poly(hexAt(330, 208, 0.62), line('#1d3050', 1.25)) +
      poly(hexAt(330, 208, 0.36), line('#1a2b46', 1.25)) +
      path('M330 166V176M330 240V250M288 208H298M362 208H372', line('#2a4369', 1.5)) +
      path('M147 49v6M144 52h6M507 153v6M504 156h6M57 361v6M54 364h6M417 257v6M414 260h6', lineOp(GOLD, 1.25, 0.3)) +
      path('M226 318h10M226 323h6M226 328h10M462 66h8M462 71h5', lineOp(GOLD, 1.25, 0.16)) +
      poly(S(starPts(96, 118, 5)), fillOp(GOLD, 0.4)) +
      poly(S(starPts(468, 302, 4)), fillOp(GOLD, 0.3)) +
      poly(S(starPts(284, 44, 3.5)), fillOp(GOLD, 0.28)) +
      poly(S(starPts(176, 386, 3)), fillOp(GOLD, 0.25)) +
      poly(S(starPts(330, 208, 4.5)), fillOp(CYAN, 0.38)) +
      poly(S(starPts(22, 196, 3)), fillOp(CYAN, 0.25)) +
      poly(S(starPts(392, 112, 2.5)), fillOp('#9fc3ff', 0.3)) +
      poly(S(starPts(128, 228, 2.5)), fillOp('#9fc3ff', 0.25)),
  },
};

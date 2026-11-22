/**
 * What every first-party style pack is drawn with: the colours that stand for "the shape's own
 * colour", the small emblems that tell one kind of a shape from another, and a few figures.
 *
 * A pack's drawings are ordinary SVG. Painted in one of the colours here, a part follows the
 * diagram: it takes the shape's own fill, line, text or chip colour (so it follows a recolour, and
 * the pack's light or dark palette), or one of the seven named colours. Painted in any other
 * colour, it keeps that colour everywhere. `build.ts` reads the table from the app, so it is
 * always the app's own light theme.
 */

export const ACCENTS = ['neutral', 'teal', 'blue', 'violet', 'amber', 'rose', 'green'] as const;
export type Accent = (typeof ACCENTS)[number];
export type Role = 'fill' | 'line' | 'text' | 'chip';

/** The colours a drawing is written in, for each thing a part can be painted as. */
export interface Kit {
  /** The shape's own fill, outline, name and accent colour. */
  F: string;
  L: string;
  T: string;
  C: string;
  /** The canvas behind the shape. */
  K: string;
  /** One of the seven named colours, whatever colour the shape itself is. */
  A(accent: Exclude<Accent, 'neutral'>, role: Role): string;
}

/** Every key a drawing can stand for: a file `art/<type>--<kind>.svg`, or `art/ellipse.svg`. */
export const SERVICE_CARDS = ['generic', 'api'] as const;
export const SERVICE_GLYPHS = ['worker', 'external', 'scheduler', 'gateway', 'load-balancer', 'proxy'] as const;
export const DATABASES = ['generic', 'sql', 'nosql', 'cache', 'file-system', 'object-storage', 'search-index', 'table'] as const;
export const QUEUES = ['queue', 'topic', 'stream'] as const;
export const ACTORS = ['human', 'system', 'device', 'group', 'thirdParty', 'agent'] as const;
export const COMPONENT_GLYPHS = ['module', 'adapter', 'port'] as const;
export const ARTIFACTS = ['file', 'config', 'secret', 'certificate'] as const;

/** The size each kind of drawing is made at: the proportions of the space the app gives it. */
export const SIZES = {
  serviceCard: [348, 132],
  serviceGlyph: [136, 104],
  database: [140, 108],
  queue: [276, 64],
  actor: [120, 82],
  componentCard: [300, 108],
  componentGlyph: [120, 104],
  artifact: [86, 100],
  junction: [100, 100],
} as const;

/**
 * What tells one kind from another, whatever world the pack is set in: a small line drawing in a
 * 40 by 40 box. A cache is a bolt in a barrel on the high seas and in a jam jar in the cute pack.
 */
export const EMBLEMS: Record<string, string> = {
  // Data stores.
  generic: 'M8 12a12 4 0 1 0 24 0a12 4 0 1 0 -24 0 M8 12v8a12 4 0 0 0 24 0v-8 M8 20v8a12 4 0 0 0 24 0v-8',
  sql: 'M7 9h26v22h-26z M7 16.5h26 M7 24h26 M16 9v22',
  nosql: 'M15 7c-4 0-5 2-5 5v4c0 3-2 4-4 4c2 0 4 1 4 4v4c0 3 1 5 5 5 M25 7c4 0 5 2 5 5v4c0 3 2 4 4 4c-2 0-4 1-4 4v4c0 3-1 5-5 5',
  cache: 'M23 5L10 23h9l-3 12l14-19h-9z',
  'file-system': 'M6 11v20h28v-17h-13l-4-3z',
  'object-storage': 'M8 12l3 20h18l3-20 M8 12a12 3.5 0 0 0 24 0a12 3.5 0 0 0 -24 0',
  'search-index': 'M17 6a11 11 0 1 0 0 22a11 11 0 1 0 0 -22 M25 25l9 9',
  table: 'M7 11h4 M16 11h17 M7 20h4 M16 20h17 M7 29h4 M16 29h17',
  // Services.
  worker: 'M20 13.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0 -13 M20 5v5 M20 30v5 M5 20h5 M30 20h5 M9.4 9.4l3.5 3.5 M27.1 27.1l3.5 3.5 M30.6 9.4l-3.5 3.5 M12.9 27.1l-3.5 3.5',
  external: 'M18 9h-10v23h23v-10 M23 7h10v10 M33 7l-14 14',
  scheduler: 'M20 6a14 14 0 1 0 0 28a14 14 0 1 0 0 -28 M20 12v8l6 4',
  gateway: 'M8 34v-17a12 12 0 0 1 24 0v17 M13 25h13 M22 20.5l4.5 4.5l-4.5 4.5',
  'load-balancer': 'M5 20h11 M16 20L29 9 M16 20h15 M16 20L29 31 M29 6.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0 -5 M31 17.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0 -5 M29 28.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0 -5',
  proxy: 'M6 14h24 M25 9l5 5l-5 5 M34 26h-24 M15 21l-5 5l5 5',
  // Components.
  module: 'M20 5l13 7v16l-13 7l-13-7v-16z M7 12l13 7l13-7 M20 19v16',
  adapter: 'M14 6v8 M26 6v8 M9 14h22v6a11 11 0 0 1 -22 0z M20 31v5',
  port: 'M20 6a14 14 0 1 0 0 28a14 14 0 1 0 0 -28 M14 17v6 M26 17v6',
  // Artifacts.
  file: 'M9 10h22 M9 18h22 M9 26h14',
  config: 'M6 12h28 M6 28h28 M14 7.5v9 M26 23.5v9',
  secret: 'M13 14a7 7 0 1 0 0 14a7 7 0 1 0 0 -14 M20 21h15 M30 21v6 M35 21v4',
  certificate: 'M20 5a10 10 0 1 0 0 20a10 10 0 1 0 0 -20 M14 23l-3 12l9-4l9 4l-3-12 M15.5 15l3.5 3.5l6-7',
};

/** An emblem, centred on (`cx`, `cy`) and `size` across, drawn as a line in `ink`. */
export function emblem(name: string, cx: number, cy: number, size: number, ink: string, weight = 3.6): string {
  const d = EMBLEMS[name];
  if (!d) throw new Error(`No emblem for "${name}".`);
  const scale = size / 40;
  return `<g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${scale})"><path d="${d}" fill="none" stroke="${ink}" stroke-width="${weight}"/></g>`;
}

/** `fill`, `stroke` and `stroke-width` attributes, written once. */
export const paint = (fill: string, stroke = 'none', width = 0): string => `fill="${fill}" stroke="${stroke}"${stroke === 'none' ? '' : ` stroke-width="${width}"`}`;

export const rect = (x: number, y: number, w: number, h: number, r: number, attrs: string): string => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${r ? ` rx="${r}"` : ''} ${attrs}/>`;
export const circle = (cx: number, cy: number, r: number, attrs: string): string => `<circle cx="${cx}" cy="${cy}" r="${r}" ${attrs}/>`;
export const ellipse = (cx: number, cy: number, rx: number, ry: number, attrs: string): string => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${attrs}/>`;
export const poly = (points: string, attrs: string): string => `<polygon points="${points}" ${attrs}/>`;
export const path = (d: string, attrs: string): string => `<path d="${d}" ${attrs}/>`;
export const group = (transform: string, body: string): string => `<g transform="${transform}">${body}</g>`;

/** A figure's look: how round it is, how heavy its line, and what it wears on its head. */
export interface Figure {
  k: Kit;
  /** Line weight. */
  w: number;
  /** 0 for square, blocky figures; 1 for round ones. */
  round: number;
  /** Something on a person's head, drawn over a head of radius `r` centred at (`cx`, `cy`). */
  hat?: (cx: number, cy: number, r: number) => string;
}

function person(f: Figure, cx: number, cy: number, r: number, width: number, top: number, bottom: number, hat = true): string {
  const { k, w, round } = f;
  const body = round
    ? path(`M${cx - width / 2} ${bottom}Q${cx - width / 2} ${top} ${cx} ${top}Q${cx + width / 2} ${top} ${cx + width / 2} ${bottom}Z`, paint(k.F, k.L, w))
    : rect(cx - width / 2, top, width, bottom - top, 0, paint(k.F, k.L, w));
  const head = round ? circle(cx, cy, r, paint(k.F, k.L, w)) : rect(cx - r, cy - r, r * 2, r * 2, 0, paint(k.F, k.L, w));
  return body + head + (hat && f.hat ? f.hat(cx, cy, r) : '');
}

/**
 * The six kinds of actor, as figures every pack can dress: a person, three people, a person from
 * outside (set between brackets), a system, a device and an agent. Drawn at 120 by 82.
 */
export function figure(f: Figure, kind: (typeof ACTORS)[number]): string {
  const { k, w, round } = f;
  const r = (value: number) => Math.round(value * round);
  switch (kind) {
    case 'human':
      return person(f, 60, 24, 15, 58, 46, 78);
    case 'group':
      return person(f, 26, 30, 10, 36, 48, 76, false) + person(f, 94, 30, 10, 36, 48, 76, false) + person(f, 60, 24, 14, 50, 46, 78);
    case 'thirdParty':
      return path('M24 10H12V72H24', paint('none', k.C, w)) + path('M96 10H108V72H96', paint('none', k.C, w)) + person(f, 60, 26, 13, 46, 46, 76);
    case 'system':
      return (
        rect(36, 6, 48, 70, r(8), paint(k.F, k.L, w)) +
        path('M46 22h28M46 40h28M46 58h28', paint('none', k.L, w * 0.7)) +
        circle(50, 31, 2.5, paint(k.C)) +
        circle(50, 49, 2.5, paint(k.C)) +
        circle(50, 67, 2.5, paint(k.C))
      );
    case 'device':
      return rect(42, 4, 36, 74, r(9), paint(k.F, k.L, w)) + rect(49, 13, 22, 44, r(3), paint(k.K, k.L, w * 0.6)) + circle(60, 67, 3.5, paint(k.C));
    case 'agent':
      return (
        path('M60 16V7', paint('none', k.L, w)) +
        circle(60, 6, 4, paint(k.C)) +
        rect(36, 16, 48, 32, r(10), paint(k.F, k.L, w)) +
        circle(50, 32, 4.5, paint(k.T)) +
        circle(70, 32, 4.5, paint(k.T)) +
        rect(44, 54, 32, 24, r(6), paint(k.F, k.L, w)) +
        path('M30 58v14M90 58v14', paint('none', k.L, w))
      );
  }
}

/** What a pack is: who made it, how it draws, and a drawing for every kind of shape. */
export interface Pack {
  id: string;
  name: string;
  summary: string;
  author: string;
  licence: string;
  order: number;
  /** The parts of the style that are not drawings: hand, weights, connectors, colours. */
  style: Record<string, unknown>;
  /** The drawings, as SVG markup for each kind. Absent: the pack keeps the app's own drawings. */
  draw?: {
    serviceCard(k: Kit, kind: (typeof SERVICE_CARDS)[number]): string;
    serviceGlyph(k: Kit, kind: (typeof SERVICE_GLYPHS)[number]): string;
    database(k: Kit, kind: (typeof DATABASES)[number]): string;
    queue(k: Kit, kind: (typeof QUEUES)[number]): string;
    actor(k: Kit, kind: (typeof ACTORS)[number]): string;
    componentCard(k: Kit): string;
    componentGlyph(k: Kit, kind: (typeof COMPONENT_GLYPHS)[number]): string;
    artifact(k: Kit, kind: (typeof ARTIFACTS)[number]): string;
    junction(k: Kit): string;
  };
}

/** A full set of colours for one theme: the canvas's own, and the seven named colours. */
export function scheme(
  surface: { canvas: string; grid: string; text: string; textMuted: string; edge: string; edgeText: string; edgeLabelBg: string; codeBg: string; codeBorder: string },
  accents: Record<Accent, [fill: string, line: string, text: string, chip: string]>,
): Record<string, unknown> {
  return {
    ...surface,
    accents: Object.fromEntries(ACCENTS.map((accent) => [accent, { fill: accents[accent][0], line: accents[accent][1], text: accents[accent][2], chip: accents[accent][3] }])),
  };
}

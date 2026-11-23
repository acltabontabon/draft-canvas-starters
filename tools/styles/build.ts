/**
 * Builds style packs with Draft Canvas's own importer, checks and renderer. Run it from a Draft
 * Canvas checkout, which it loads the app's modules from:
 *
 *   cd ../draft-canvas
 *   npx tsx ../draft-canvas-starters/tools/styles/build.ts [--check] [id...]
 *
 * A pack is a folder, `styles/<id>/`:
 *
 *   pack.json          its name, summary, author, licence and order
 *   style.json         everything about the style that is not a drawing
 *   art/<key>.svg      one drawing per kind of shape, e.g. `database--cache.svg`
 *   art/backdrop.svg   optional: one tile, repeated on the canvas behind the diagram
 *   <id>.draftstyle    what this writes, and the only file the app reads
 *   preview.svg        a sample diagram drawn in the pack, light and dark
 *   sheet.svg          every kind of shape drawn in the pack
 *
 * For a first-party pack (one with a definition in `tools/styles/packs/`) the drawings and
 * `style.json` are written first, from that definition. A pack drawn by hand has no definition:
 * its `art/` and `style.json` are the source, and this only assembles them.
 *
 * Every drawing goes through the app's `importSvgArt`, exactly as one a person chooses in
 * Settings does, so a pack can hold nothing an imported SVG could not. The finished style must
 * read back through the app's check with nothing repaired, or the build fails.
 * `--check` builds everything in memory and fails if a file on disk would change.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ACCENTS, ACTORS, ARTIFACTS, COMPONENT_GLYPHS, DATABASES, QUEUES, SERVICE_CARDS, SERVICE_GLYPHS, SIZES, type Kit, type Pack } from './kit';

const APP = process.cwd();
if (!existsSync(join(APP, 'src', 'import', 'svgArt', 'index.ts'))) {
  console.error('Run this from a Draft Canvas checkout that has style packs (it loads src/import/svgArt from the current folder).');
  process.exit(2);
}
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const STYLES = join(REPO, 'styles');

const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const only = args.filter((arg) => !arg.startsWith('--'));

// Each definition is loaded only when its pack is built, so one being redrawn cannot stop another.
const FIRST_PARTY: Pack[] = [];
for (const id of ['professional', 'geek', 'arena', 'high-seas', 'high-fantasy', 'cyberpunk', 'cute']) {
  if (only.length > 0 && !only.includes(id)) continue;
  const definition = (await import(`./packs/${id}.ts`)) as Record<string, Pack>;
  FIRST_PARTY.push(Object.values(definition)[0]!);
}

const app = (path: string) => import(pathToFileURL(join(APP, path)).href);
const { importSvgArt } = await app('src/import/svgArt/index.ts');
const { normalizeStyle, artSlotOf, STYLE_KINDS, KIND_FIELDS } = await app('src/document/style.ts');
const { serializeStyleFile, readStyleFile } = await app('src/document/styleFile.ts');
const { NODE_TYPES } = await app('src/document/types.ts');
const { createDocument, createEdge, createNode } = await app('src/document/factory.ts');
const { addEdges, addNodes } = await app('src/document/operations.ts');
const { resolveStyle } = await app('src/render/style/resolve.ts');
const { renderDocumentSvg } = await app('src/render/svg/document.ts');
const { LIGHT } = await app('src/render/theme/tokens.ts');

/* ------------------------------------------------- colours that mean roles -- */

const kit: Kit = {
  F: LIGHT.accents.neutral.fill,
  L: LIGHT.accents.neutral.line,
  T: LIGHT.accents.neutral.text,
  C: LIGHT.accents.neutral.chip,
  K: LIGHT.canvas,
  A: (accent, role) => LIGHT.accents[accent][role],
};
/** A colour of the app's light theme, and what a part painted in it is painted as. */
const ROLES = new Map<string, string>();
for (const accent of ACCENTS) {
  for (const role of ['fill', 'line', 'text', 'chip'] as const) {
    const colour = LIGHT.accents[accent][role].toLowerCase();
    if (!ROLES.has(colour)) ROLES.set(colour, accent === 'neutral' ? role : `${accent}:${role}`);
  }
}
ROLES.set(LIGHT.canvas.toLowerCase(), 'canvas');

/* ------------------------------------------------------------ the drawings -- */

/** The canvas behind the diagram: `art/backdrop.svg`, a tile and not a shape. */
const BACKDROP = 'backdrop';
const fileOf = (key: string) => `${key.replace(':', '--')}.svg`;
const keyOf = (file: string) => file.replace(/\.svg$/, '').replace('--', ':');
const svg = ([w, h]: readonly [number, number], body: string, left = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} 0 ${w} ${h}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>
`;

function drawn(pack: Pack): Map<string, string> {
  const out = new Map<string, string>();
  const draw = pack.draw;
  if (!draw) return out;
  for (const kind of SERVICE_CARDS) out.set(`service:${kind}`, svg(SIZES.serviceCard, draw.serviceCard(kit, kind)));
  for (const kind of SERVICE_GLYPHS) out.set(`service:${kind}`, svg(SIZES.serviceGlyph, draw.serviceGlyph(kit, kind)));
  for (const kind of DATABASES) out.set(`database:${kind}`, svg(SIZES.database, draw.database(kit, kind)));
  for (const kind of QUEUES) out.set(`queue:${kind}`, svg(SIZES.queue, draw.queue(kit, kind)));
  // A device is tall and narrow where the other actors are wide: it is framed on itself, so it is
  // drawn as large as they are.
  for (const kind of ACTORS) out.set(`actor:${kind}`, kind === 'device' ? svg([46, SIZES.actor[1]], draw.actor(kit, kind), 37) : svg(SIZES.actor, draw.actor(kit, kind)));
  out.set('component:generic', svg(SIZES.componentCard, draw.componentCard(kit)));
  for (const kind of COMPONENT_GLYPHS) out.set(`component:${kind}`, svg(SIZES.componentGlyph, draw.componentGlyph(kit, kind)));
  for (const kind of ARTIFACTS) out.set(`artifact:${kind}`, svg(SIZES.artifact, draw.artifact(kit, kind)));
  out.set('ellipse', svg(SIZES.junction, draw.junction(kit)));
  if (pack.backdrop) out.set(BACKDROP, svg(pack.backdrop.tile, pack.backdrop.draw(kit)));
  return out;
}

/* ---------------------------------------------------------------- writing -- */

const problems: string[] = [];
const stale: string[] = [];
function write(path: string, text: string): void {
  const now = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (now === text) return;
  if (CHECK) {
    stale.push(path.slice(REPO.length + 1).replace(/\\/g, '/'));
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

/* -------------------------------------------------------------- the pictures -- */

type Shape = { type: string; kind?: string; text: string; accent?: string };
function node(id: string, shape: Shape, x: number, y: number) {
  const field = shape.kind ? KIND_FIELDS[shape.type] : undefined;
  const made = createNode({ id, type: shape.type, x: 0, y: 0, text: shape.text, ...(field ? { [field]: shape.kind } : {}) });
  return { ...made, x: Math.round(x - made.width / 2), y: Math.round(y - made.height / 2), ...(shape.accent ? { accent: shape.accent } : {}) };
}
const titled = (title: string, nodes: unknown[], edges: unknown[] = []) => {
  const doc = addEdges(addNodes(createDocument(title), nodes), edges);
  return { ...doc, metadata: { ...doc.metadata, id: `pack-${title}`, createdAt: 0, updatedAt: 0 } };
};

/** A small system, so a pack is seen at work: who calls what, and where it ends up. */
function sample(style: unknown) {
  const row: Shape[] = [
    { type: 'actor', kind: 'human', text: 'Customer' },
    { type: 'service', kind: 'gateway', text: 'Gateway', accent: 'violet' },
    { type: 'service', kind: 'api', text: 'Orders API', accent: 'teal' },
    { type: 'queue', kind: 'queue', text: 'orders', accent: 'amber' },
    { type: 'service', kind: 'worker', text: 'Fulfilment', accent: 'green' },
    { type: 'database', kind: 'sql', text: 'Ledger', accent: 'blue' },
  ];
  const nodes = row.map((shape, index) => node(`n${index}`, shape, index * 210, 0));
  const below: Shape[] = [
    { type: 'database', kind: 'cache', text: 'Sessions', accent: 'rose' },
    { type: 'component', kind: 'adapter', text: 'Payments' },
    { type: 'artifact', kind: 'config', text: 'Settings' },
  ];
  nodes.push(...below.map((shape, index) => node(`b${index}`, shape, 210 + index * 210, 170)));
  const edges = [
    createEdge({ id: 'e0', source: 'n0', target: 'n1' }),
    createEdge({ id: 'e1', source: 'n1', target: 'n2' }),
    createEdge({ id: 'e2', source: 'n2', target: 'n3', async: true }),
    createEdge({ id: 'e3', source: 'n3', target: 'n4', async: true }),
    createEdge({ id: 'e4', source: 'n4', target: 'n5' }),
    createEdge({ id: 'e5', source: 'n1', target: 'b0' }),
    createEdge({ id: 'e6', source: 'n2', target: 'b1' }),
  ];
  return { ...titled('sample', nodes, edges), style };
}

/** Every kind of shape a drawing can stand for, in rows by type. */
function sheet(style: unknown) {
  const nodes: unknown[] = [];
  let y = 0;
  for (const type of NODE_TYPES) {
    const kinds = (STYLE_KINDS[type] as string[]).filter((kind) => artSlotOf(type, kind) !== null);
    const row = kinds.length > 0 ? kinds : artSlotOf(type, undefined) !== null ? [undefined] : [];
    if (row.length === 0) continue;
    row.forEach((kind, index) => nodes.push(node(`${type}-${kind ?? 'any'}`, { type, kind, text: kind ?? 'or' }, index * 200, y)));
    y += 150;
  }
  return { ...titled('sheet', nodes), style };
}

const picture = (doc: unknown, theme: 'light' | 'dark') => `${renderDocumentSvg(doc, { theme, openPoints: false, padding: 40 }).svg}\n`;

/** A first-party pack's own page: what it is, how to use it, and every shape drawn in it. */
function readme(pack: Pack, drawsShapes: boolean): string {
  return [
    `# ${pack.name}`,
    '',
    `${pack.summary}.`,
    '',
    '<picture>',
    '  <source media="(prefers-color-scheme: dark)" srcset="preview-dark.svg">',
    `  <img width="100%" alt="A sample diagram drawn in ${pack.name}" src="preview.svg">`,
    '</picture>',
    '',
    'In Draft Canvas, open **Settings → Appearance → Style packs**, load the gallery and choose **Add**,',
    `or download [${pack.id}.draftstyle](${pack.id}.draftstyle) and choose **Import style…**. It becomes a style of your`,
    'own, to change as you like.',
    '',
    '## Every shape',
    '',
    drawsShapes
      ? 'Each kind of shape has its own drawing. A shape’s name, its size and where connectors meet it are\nexactly as they are without the pack.'
      : 'This pack keeps Draft Canvas’s own drawings and changes how they are coloured and finished.',
    '',
    `<img width="100%" alt="Every kind of shape drawn in ${pack.name}" src="sheet.svg">`,
    '',
    `By ${pack.author}, under ${pack.licence}. Original artwork.`,
    '',
  ].join('\n');
}

/* ------------------------------------------------------------------ a pack -- */

const ids = existsSync(STYLES) ? readdirSync(STYLES).filter((name) => statSync(join(STYLES, name)).isDirectory()) : [];
for (const pack of FIRST_PARTY) if (!ids.includes(pack.id)) ids.push(pack.id);

let built = 0;
for (const id of ids.sort()) {
  if (only.length > 0 && !only.includes(id)) continue;
  const dir = join(STYLES, id);
  const first = FIRST_PARTY.find((pack) => pack.id === id);

  // A first-party pack is drawn here: its drawings and style.json are written from its definition.
  if (first) {
    write(join(dir, 'pack.json'), json({ id: first.id, name: first.name, summary: first.summary, author: first.author, licence: first.licence, order: first.order }));
    write(join(dir, 'style.json'), json(first.style));
    const art = drawn(first);
    for (const [key, markup] of art) write(join(dir, 'art', fileOf(key)), markup);
    write(join(dir, 'README.md'), readme(first, art.size > 0));
    // A drawing this definition no longer makes does not stay behind.
    if (!CHECK && existsSync(join(dir, 'art'))) {
      for (const name of readdirSync(join(dir, 'art'))) if (!art.has(keyOf(name))) rmSync(join(dir, 'art', name));
    }
  }

  const fail = (message: string) => problems.push(`styles/${id}: ${message}`);
  // In a check, what would be on disk is what the definition draws; otherwise it is what is on disk.
  const source = (name: string, fallback: () => string | undefined) => (CHECK && first ? fallback() : existsSync(join(dir, name)) ? readFileSync(join(dir, name), 'utf8') : undefined);
  const metaText = source('pack.json', () => json({ id: first!.id, name: first!.name, summary: first!.summary, author: first!.author, licence: first!.licence, order: first!.order }));
  const styleText = source('style.json', () => json(first!.style));
  if (!metaText || !styleText) {
    fail('needs pack.json and style.json');
    continue;
  }
  const meta = JSON.parse(metaText) as { id: string; name: string };
  const parts = JSON.parse(styleText) as Record<string, unknown>;

  const drawings = new Map<string, string>();
  if (CHECK && first) for (const [key, markup] of drawn(first)) drawings.set(key, markup);
  else if (existsSync(join(dir, 'art'))) for (const name of readdirSync(join(dir, 'art')).sort()) if (name.endsWith('.svg')) drawings.set(keyOf(name), readFileSync(join(dir, 'art', name), 'utf8'));

  const assets = new Map<string, unknown>();
  let backdrop: Record<string, unknown> | undefined;
  const shapes: Record<string, Record<string, unknown>> = { ...((parts.shapes as Record<string, Record<string, unknown>>) ?? {}) };
  // In file-name order whichever way the drawings arrived, so the same pack is always the same bytes.
  const ordered = [...drawings].sort(([x], [y]) => (fileOf(x) < fileOf(y) ? -1 : 1));
  for (const [key, markup] of ordered) {
    const [type, kind] = key.split(':');
    if (key !== BACKDROP && artSlotOf(type, kind) === null) {
      fail(`art/${fileOf(key)}: no drawing can stand for "${key}"`);
      continue;
    }
    const result = importSvgArt(markup, 'original');
    if (!result.ok) {
      fail(`art/${fileOf(key)}: ${result.message}`);
      continue;
    }
    if (result.notes.length > 0) fail(`art/${fileOf(key)}: ${result.notes.join(' ')}`);
    // A part painted in one of the app's own light-theme colours follows the diagram.
    const asset = {
      ...result.asset,
      paths: result.asset.paths.map((path: { fill?: string; stroke?: string }) => ({
        ...path,
        ...(path.fill ? { fill: ROLES.get(path.fill) ?? path.fill } : {}),
        ...(path.stroke ? { stroke: ROLES.get(path.stroke) ?? path.stroke } : {}),
      })),
    };
    assets.set(asset.id, asset);
    // The backdrop is the canvas's own drawing, not a shape's.
    if (key === BACKDROP) backdrop = { ...((parts.backdrop as Record<string, unknown>) ?? {}), art: asset.id };
    else shapes[key] = { ...(shapes[key] ?? {}), art: asset.id };
  }
  // A pack with no drawing for a type says so: it keeps the app's own, on purpose.
  for (const type of NODE_TYPES) {
    if (artSlotOf(type, undefined) === null && !(STYLE_KINDS[type] as string[]).some((kind) => artSlotOf(type, kind) !== null)) continue;
    const kinds = (STYLE_KINDS[type] as string[]).filter((kind) => artSlotOf(type, kind) !== null);
    const covered = kinds.length > 0 ? kinds.every((kind) => shapes[`${type}:${kind}`]?.art) : Boolean(shapes[type]?.art);
    if (!covered && !shapes[type]?.art) shapes[type] = { ...(shapes[type] ?? {}), builtin: true };
  }

  const raw = { v: 1, name: meta.name, ...parts, shapes, ...(backdrop ? { backdrop } : {}), assets: [...assets.values()] };
  const { style, repairs } = normalizeStyle(raw);
  if (!style || repairs.length > 0) {
    fail(`the style does not read back cleanly: ${repairs.join(' ') || 'unreadable'}`);
    continue;
  }
  const text = serializeStyleFile(meta.name, style);
  const back = readStyleFile(text);
  if (!back.ok || back.repairs.length > 0) {
    fail('the written file does not read back cleanly');
    continue;
  }
  write(join(dir, `${id}.draftstyle`), text);
  const resolved = resolveStyle(back.style);
  write(join(dir, 'preview.svg'), picture(sample(back.style), 'light'));
  write(join(dir, 'preview-dark.svg'), picture(sample(back.style), 'dark'));
  write(join(dir, 'sheet.svg'), picture(sheet(back.style), resolved.pinned ?? 'light'));
  built += 1;
  if (!CHECK) console.log(`✓ ${id}: ${assets.size - (backdrop ? 1 : 0)} drawings${backdrop ? ' and a backdrop' : ''}, ${Math.round(Buffer.byteLength(text) / 1024)} KB`);
}

if (problems.length > 0) {
  console.error(problems.map((problem) => `✗ ${problem}`).join('\n'));
  process.exit(1);
}
if (CHECK) {
  if (stale.length > 0) {
    console.error(`✗ out of date: ${stale.join(', ')}\n  Run tools/styles/build.ts and commit the result.`);
    process.exit(1);
  }
  console.log(`✓ ${built} style packs current`);
}

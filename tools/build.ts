/**
 * Builds starters from their specs, with Draft Canvas's own layout, validation and checks. Run it
 * from a Draft Canvas checkout, which it loads the app's modules from:
 *
 *   cd ../draft-canvas
 *   npx tsx ../draft-canvas-starters/tools/build.ts [--dump] [--verbose] <spec.json>...
 *
 * Each spec is a `create_diagram` request (see the app's agent schema) plus the `_` fields
 * described in tools/README.md. The starter is written beside its spec as `<folder>.draftcanvas`.
 *
 * The request is composed by the app's own `compose`, adjusted by the spec's `_` fields, read back
 * through `deserializeDocument` (any repair is an error) and written canonically. Ids the app would
 * mint at random are seeded from the starter id, so an unchanged spec writes the same bytes. Every
 * view is held to the gallery's check (tests/starter-files.test.ts): no overlaps, no kinks
 * Straighten would remove, every caption whole, every flow step on a connector.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

type DraftDocument = any;
type DraftNode = any;
type DraftEdge = any;

const APP = process.cwd();
if (!existsSync(join(APP, 'src', 'agent', 'compile.ts'))) {
  console.error('Run this from a Draft Canvas checkout (it loads src/agent/compile.ts from the current folder).');
  process.exit(2);
}
const app = (path: string) => import(join(APP, path));
const { compose } = await app('src/agent/compile.ts');
const { deserializeDocument, serializeDocument } = await app('src/export/project.ts');
const { categoryOf } = await app('src/document/connectorSemantics.ts');
const { relationshipCaptionLabel } = await app('src/document/edgeSemantics.ts');
const { connectorRoutes } = await app('src/edges/connectorRoutes.ts');
const { labelGroupPlan } = await app('src/edges/labelGroups.ts');
const { layoutConnectorCaption, layoutEdgeLabel } = await app('src/edges/labelLayout.ts');
const { straightenPositions } = await app('src/edges/straighten.ts');

/** The starters gallery's gate (tests/starter-files.test.ts), for one view. */
function gate(doc: DraftDocument, view: { nodes: DraftNode[]; edges: DraftEdge[]; flows: any[] }, where: string): string[] {
  const d = { ...doc, nodes: view.nodes, edges: view.edges, flows: view.flows } as DraftDocument;
  const problems: string[] = [];
  const byId = new Map(d.nodes.map((n) => [n.id, n]));
  const anc = (n: DraftNode) => { const ids = new Set<string>(); let p = n.parentId ? byId.get(n.parentId) : undefined; while (p && !ids.has(p.id)) { ids.add(p.id); p = p.parentId ? byId.get(p.parentId) : undefined; } return ids; };
  const shapes = d.nodes.filter((n) => n.type !== 'group');
  for (const [i, a] of shapes.entries()) for (const b of shapes.slice(i + 1)) {
    if (anc(a).has(b.id) || anc(b).has(a.id)) continue;
    if (a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height) problems.push(`${where}overlap ${a.id} ${b.id}`);
  }
  const sp = straightenPositions(d);
  if (sp.size) problems.push(`${where}kinks ${[...sp.entries()].map(([id, p]: any) => { const n = byId.get(id)!; return `${id}(dx=${Math.round(p.x - n.x)},dy=${Math.round(p.y - n.y)})`; }).join(',')}`);
  const groups = labelGroupPlan(d.nodes, d.edges);
  const fits = (l: { truncated: boolean; width: number }, room: number | undefined) => !l.truncated && (room === undefined || l.width * 1.15 <= room);
  for (const e of d.edges) {
    if (groups.groupFor(e.id)) continue;
    const route = connectorRoutes(e, d, 'canvas', byId)?.request;
    if (route?.labelRoom === 0) continue;
    if (!route) { problems.push(`${where}no route ${e.id}`); continue; }
    const label = e.label?.trim();
    if (label) { const l = layoutEdgeLabel(label, undefined, route.labelRoom); if (!fits(l, route.labelRoom)) problems.push(`${where}caption ${e.id} "${label}" ${Math.round(l.width * 1.15)}>${route.labelRoom}`); continue; }
    if (!e.semantic) continue;
    const cap = relationshipCaptionLabel(e.semantic, { hasResponse: e.hasResponse, source: categoryOf(byId.get(e.source)!), target: categoryOf(byId.get(e.target)!) });
    if (!cap) continue;
    const l = layoutConnectorCaption(cap, undefined, route.labelRoom);
    if (!fits(l, route.labelRoom)) problems.push(`${where}caption ${e.id} "${cap}" ${Math.round(l.width * 1.15)}>${route.labelRoom}`);
  }
  const edgeIds = new Set(d.edges.map((e) => e.id));
  if (view.flows.length === 0) problems.push(`${where}no flows`);
  for (const f of view.flows) for (const st of f.steps) if (!st.edgeId || !edgeIds.has(st.edgeId)) problems.push(`${where}flow "${f.title}" step without connector`);
  return problems;
}

function seed(text: string) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  let s = h >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  (globalThis.crypto as any).getRandomValues = (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(next() * 256);
    return arr;
  };
  Math.random = next;
}

type Graph = { nodes: DraftNode[]; edges: DraftEdge[] };
function* graphs(g: Graph): Generator<Graph> {
  yield g;
  for (const n of g.nodes) if (n.inside) yield* graphs(n.inside as Graph);
}

const STAMP = 1794441600000; // fixed, as before: the file's bytes change only when the diagram does


type Box = { x: number; y: number; width: number; height: number };
function boxOf(nodes: DraftNode[]): Box {
  const x = Math.min(...nodes.map((n) => n.x)), y = Math.min(...nodes.map((n) => n.y));
  return { x, y, width: Math.max(...nodes.map((n) => n.x + n.width)) - x, height: Math.max(...nodes.map((n) => n.y + n.height)) - y };
}
const r1 = (v: number) => Math.round(v * 10) / 10;

function placeAll(list: any[], doc: DraftDocument, byId: Map<string, DraftNode>) {
  for (const pl of list) {
    const node = byId.get(pl.id);
    if (!node) throw new Error(`_place: no ${pl.id}`);
    const others = doc.nodes.filter((n) => n.id !== pl.id && !(pl.exclude ?? []).includes(n.id));
    const target = pl.of === '@all' ? boxOf(others) : boxOf((Array.isArray(pl.of) ? pl.of : [pl.of]).map((id: string) => byId.get(id)!));
    const gap = pl.gap ?? 32;
    const align = pl.align ?? 'start';
    const along = (start: number, size: number, own: number) => (align === 'start' ? start : align === 'end' ? start + size - own : start + (size - own) / 2);
    if (pl.width) node.width = pl.width;
    if (pl.height) node.height = pl.height;
    if (pl.side === 'above') { node.y = target.y - gap - node.height; node.x = along(target.x, target.width, node.width); }
    if (pl.side === 'below') { node.y = target.y + target.height + gap; node.x = along(target.x, target.width, node.width); }
    if (pl.side === 'left') { node.x = target.x - gap - node.width; node.y = along(target.y, target.height, node.height); }
    if (pl.side === 'right') { node.x = target.x + target.width + gap; node.y = along(target.y, target.height, node.height); }
    node.x = Math.round(node.x + (pl.dx ?? 0)); node.y = Math.round(node.y + (pl.dy ?? 0));
  }
}

/** Patches, placements and sketches, applied to the composed document. Returns whether v29 is needed. */
function post(doc: DraftDocument, spec: any): boolean {
  const { _patch, _place, _ink, _openPoints } = spec;
  if (_openPoints) doc.openPoints = _openPoints;
  let needsV29 = false;
  if (spec._clearRoutes) for (const e of doc.edges) { if (spec._keepRoutes?.includes(e.id)) continue; delete e.sourceAnchor; delete e.targetAnchor; delete e.waypoints; }
  for (const g of graphs(doc)) {
    for (const e of g.edges as DraftEdge[]) { const p = _patch?.edges?.[e.id]; if (p) for (const [k, v] of Object.entries(p)) if (v === null) delete (e as any)[k]; else (e as any)[k] = v; }
    for (const n of g.nodes) {
      const p = _patch?.nodes?.[n.id];
      if (!p) continue;
      const { dx, dy, ...rest } = p;
      if (dx) n.x += dx;
      if (dy) n.y += dy;
      for (const [k, v] of Object.entries(rest)) if (v === null) delete (n as any)[k]; else (n as any)[k] = v;
    }
  }
  const byId0 = new Map(doc.nodes.map((n) => [n.id, n]));
  // Centres, so shapes on one line are exactly level and connectors between them run straight.
  for (const [id, [cx, cy]] of Object.entries(spec._centers ?? {}) as [string, [number, number]][]) {
    const n = doc.nodes.find((m) => m.id === id);
    if (!n) throw new Error(`_centers: no ${id}`);
    n.x = Math.round(cx - n.width / 2); n.y = Math.round(cy - n.height / 2);
  }
  placeAll((spec._place ?? []).filter((pl: any) => pl.early), doc, byId0);
  if (spec._fitGroups) {
    const groups = doc.nodes.filter((n) => n.type === 'group');
    const depth = (n: DraftNode): number => (n.parentId ? 1 + depth(doc.nodes.find((m) => m.id === n.parentId)!) : 0);
    groups.sort((a, b) => depth(b) - depth(a));
    const pad = spec._fitGroups.pad ?? 32, head = spec._fitGroups.header ?? 52;
    for (const g of groups) {
      const members = doc.nodes.filter((n) => n.parentId === g.id);
      if (!members.length) continue;
      const b = boxOf(members);
      g.x = b.x - pad; g.y = b.y - head; g.width = b.width + pad * 2; g.height = b.height + head + pad;
    }
    // Sibling boundaries that share a row (or a column) share their top and bottom (left and
    // right) edges, then every boundary holding boundaries is fitted again around them.
    const byGroup = new Map(groups.map((g) => [g.id, g]));
    for (const set of spec._alignRows ?? []) {
      const gs = set.map((id: string) => byGroup.get(id)!);
      const top = Math.min(...gs.map((g: DraftNode) => g.y)), bottom = Math.max(...gs.map((g: DraftNode) => g.y + g.height));
      for (const g of gs) { g.y = top; g.height = bottom - top; }
    }
    for (const set of spec._alignCols ?? []) {
      const gs = set.map((id: string) => byGroup.get(id)!);
      const left = Math.min(...gs.map((g: DraftNode) => g.x)), right = Math.max(...gs.map((g: DraftNode) => g.x + g.width));
      for (const g of gs) { g.x = left; g.width = right - left; }
    }
    if (spec._alignRows || spec._alignCols) {
      for (const g of groups) {
        const members = doc.nodes.filter((n) => n.parentId === g.id);
        if (!members.some((m) => m.type === 'group')) continue;
        const b = boxOf(members);
        g.x = b.x - pad; g.y = b.y - head; g.width = b.width + pad * 2; g.height = b.height + head + pad;
      }
    }
  }
  const byId = new Map(doc.nodes.map((n) => [n.id, n]));
  placeAll((_place ?? []).filter((pl: any) => !pl.early), doc, byId);
  let inkN = 0;
  const strokes: any[] = [];
  for (const k of _ink ?? []) {
    const b = boxOf((Array.isArray(k.of) ? k.of : [k.of]).map((id: string) => { const n = byId.get(id); if (!n) throw new Error(`_ink: no ${id}`); return n; }));
    const pts: [number, number][] = [];
    if (k.shape === 'ellipse') {
      const pad = k.pad ?? 18, cx = b.x + b.width / 2, cy = b.y + b.height / 2, rx = b.width / 2 + pad, ry = b.height / 2 + pad;
      const a0 = -2.2, a1 = a0 + Math.PI * 2 + 0.45;
      for (let i = 0; i <= 72; i++) {
        const a = a0 + ((a1 - a0) * i) / 72;
        const grow = 1 + 0.035 * (i / 72) + 0.012 * Math.sin(i / 5);
        pts.push([cx + Math.cos(a) * rx * grow, cy + Math.sin(a) * ry * grow]);
      }
    } else if (k.shape === 'underline') {
      const y = b.y + b.height + (k.pad ?? 6), x0 = b.x - 4, x1 = b.x + b.width + 4;
      for (let i = 0; i <= 24; i++) pts.push([x0 + ((x1 - x0) * i) / 24, y + 1.5 * Math.sin(i / 3) + (i / 24) * 3]);
    } else throw new Error(`_ink shape ${k.shape}`);
    const [x, y] = pts[0];
    strokes.push({ id: `ink_${++inkN}`, tool: k.tool ?? 'pen', color: k.color ?? 'red', size: k.size ?? 3, x: r1(x), y: r1(y), points: pts.flatMap(([px, py]) => [r1(px - x), r1(py - y)]) });
  }
  if (strokes.length) doc.ink = strokes;
  for (const g of graphs(doc)) if (g.edges.some((e) => e.portal) || g.nodes.some((n) => n.held)) needsV29 = true;
  return needsV29;
}

const args = process.argv.slice(2);
const dump = args.includes('--dump');
const verbose = args.includes('--verbose');
const specs = args.filter((a) => !a.startsWith('--'));
let failed = false;
for (const path of specs) {
  const spec = JSON.parse(readFileSync(path, 'utf8'));
  const request = Object.fromEntries(Object.entries(spec).filter(([k]) => !k.startsWith('_'))) as any;
  const dir = dirname(resolve(path));
  const _starter = { id: basename(dir) };
  const ladder = [...new Set([request.layout?.spacing ?? 'comfortable', 'spacious'])];
  let composed: any; let doc!: DraftDocument; let problems: string[] = []; let needsV29 = false;
  for (const spacing of ladder) {
    seed(_starter.id);
    try {
      composed = compose({ requestId: `starter-${_starter.id}`, ...request, layout: { ...request.layout, spacing } }, `starter-${_starter.id}`);
    } catch (error: any) {
      console.log(`✗ ${_starter.id} (${spacing}): ${error.message}`);
      if (error.details) console.log(JSON.stringify(error.details, null, 1).slice(0, 4000));
      if (error.hint) console.log(`  hint: ${error.hint}`);
      composed = undefined;
      continue;
    }
    const parsed = deserializeDocument(composed.text);
    if (!parsed.ok) throw new Error(parsed.error);
    doc = parsed.document as DraftDocument;
    needsV29 = post(doc, spec);
    problems = gate(doc, doc, '');
    if (problems.length === 0) break;
    console.log(`  ${spacing}: ${problems.join(' | ')}`);
  }
  if (!composed) { failed = true; continue; }
  for (const g of graphs(doc)) if (g !== (doc as any)) for (const p of gate(doc, g as any, 'room: ')) console.log(`  (room) ${p}`);
  if (problems.length) { failed = true; console.log(`✗ ${_starter.id}: gate fails: ${problems.join(' | ')}`); }
  if (dump) for (const n of doc.nodes) console.log(`  @ ${n.id} ${n.type} x=${Math.round(n.x)} y=${Math.round(n.y)} w=${Math.round(n.width)} h=${Math.round(n.height)}${n.parentId ? ` in ${n.parentId}` : ''}`);
  doc.metadata = { id: `starter-${_starter.id}`, title: request.title, createdAt: STAMP, updatedAt: STAMP };
  let text = serializeDocument(doc);
  // Files stay at the oldest format that can hold them, so apps people installed a while ago open
  // them: v29 only adds held shapes and portals.
  if (!needsV29) text = text.replace('"version": 29,', '"version": 28,');
  const again = deserializeDocument(text);
  if (!again.ok) throw new Error(again.error);
  const repairs = again.repairs.filter((line) => !line.startsWith('Upgraded document format'));
  if (repairs.length) {
    failed = true;
    console.log(`✗ ${_starter.id}: repairs ${JSON.stringify(repairs)}`);
  }
  writeFileSync(join(dir, `${_starter.id}.draftcanvas`), text);
  const r = composed.receipt as any;
  console.log(`✓ ${_starter.id} (format ${needsV29 ? 29 : 28})`);
  // What the app's layout said before the spec's own placement: often stale once `_centers` moves
  // things, so only on request. Advice and review lines are about the content and always shown.
  if (verbose) {
    console.log(`  compose: ${JSON.stringify(r.created)} ${JSON.stringify(r.layout)}${r.degraded ? ' (degraded before placement)' : ''}`);
    console.log(`  quality before placement: ${JSON.stringify(r.quality)}`);
    console.log(`  legibility before placement: ${JSON.stringify(r.legibility).slice(0, 600)}`);
  }
  if (r.advisories) for (const a of r.advisories) console.log(`  advice: ${a}`);
  if (r.review) for (const a of r.review) console.log(`  review: ${a.message}`);
}
if (failed) process.exitCode = 1;

#!/usr/bin/env node
/**
 * Builds `catalog.json`, the index Draft Canvas reads first, from each starter's folder and each
 * style pack's, and the gallery tables in README.md.
 *
 *   npm run catalog          # write catalog.json and the README table
 *   npm run catalog:check    # fail if either is out of date or a starter is invalid
 *
 * No dependencies: Node 20 or later.
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = join(ROOT, 'catalog.json');
const README = join(ROOT, 'README.md');
const SCHEMA = 1;
const MAX_BYTES = 512 * 1024;
/** Category → folder, in the order the gallery shows them. */
const CATEGORIES = { architecture: 'architectures', data: 'data', pattern: 'patterns', example: 'examples' };
const LABELS = { architecture: 'Architectures', data: 'Data architectures', pattern: 'Patterns', example: 'Examples' };
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const check = process.argv.includes('--check');

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);
const isStrings = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim() !== '');

const previous = existsSync(CATALOG) ? JSON.parse(readFileSync(CATALOG, 'utf8')) : { starters: [] };
const previousById = new Map(previous.starters.map((entry) => [entry.id, entry]));
const today = new Date().toISOString().slice(0, 10);

const entries = [];
const seen = new Set();
for (const [category, folder] of Object.entries(CATEGORIES)) {
  const dir = join(ROOT, 'starters', folder);
  if (!existsSync(dir)) continue;
  for (const id of readdirSync(dir).sort()) {
    const at = join(dir, id);
    if (!statSync(at).isDirectory()) continue;
    const where = relative(ROOT, at);
    const metaPath = join(at, 'starter.json');
    const filePath = join(at, `${id}.draftcanvas`);
    if (!existsSync(metaPath)) { fail(where, 'missing starter.json'); continue; }
    if (!existsSync(filePath)) { fail(where, `missing ${id}.draftcanvas`); continue; }
    let meta;
    try { meta = JSON.parse(readFileSync(metaPath, 'utf8')); } catch (error) { fail(where, `starter.json: ${error.message}`); continue; }
    if (meta.id !== id) fail(where, `starter.json id "${meta.id}" must match the folder name`);
    if (!ID.test(id)) fail(where, 'the id must be lowercase words joined by hyphens');
    if (seen.has(id)) fail(where, `id "${id}" is used twice`);
    seen.add(id);
    if (meta.category !== category) fail(where, `category "${meta.category}" must be "${category}" in starters/${folder}/`);
    if (typeof meta.name !== 'string' || !meta.name.trim() || meta.name.length > 60) fail(where, 'name: 1–60 characters');
    if (typeof meta.summary !== 'string' || !meta.summary.trim() || meta.summary.length > 120) fail(where, 'summary: 1–120 characters');
    if (meta.aliases !== undefined && !isStrings(meta.aliases)) fail(where, 'aliases: a list of words');
    if (meta.tags !== undefined && !isStrings(meta.tags)) fail(where, 'tags: a list of words');
    for (const key of ['useWhen', 'watchOutFor']) {
      const list = meta[key];
      if (list !== undefined && (!isStrings(list) || list.length > 4 || list.some((line) => line.length > 160))) fail(where, `${key}: up to 4 lines of up to 160 characters`);
    }
    if (meta.featured !== undefined && typeof meta.featured !== 'boolean') fail(where, 'featured: true or false');
    if (!Number.isInteger(meta.order)) fail(where, 'order: a whole number');

    const bytes = readFileSync(filePath);
    if (bytes.length > MAX_BYTES) fail(where, `${id}.draftcanvas is over ${MAX_BYTES / 1024} KB`);
    let file;
    try { file = JSON.parse(bytes.toString('utf8')); } catch (error) { fail(where, `${id}.draftcanvas: ${error.message}`); continue; }
    if (file.format !== 'draft-canvas' || !Number.isInteger(file.version)) {
      fail(where, `${id}.draftcanvas is not a Draft Canvas file`);
      continue;
    }
    for (const picture of ['preview.svg', 'preview-dark.svg', 'README.md']) {
      if (!existsSync(join(at, picture))) fail(where, `missing ${picture}`);
    }

    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const before = previousById.get(id);
    entries.push({
      id,
      name: meta.name,
      category,
      summary: meta.summary,
      aliases: meta.aliases ?? [],
      tags: meta.tags ?? [],
      useWhen: meta.useWhen ?? [],
      watchOutFor: meta.watchOutFor ?? [],
      featured: meta.featured ?? false,
      order: meta.order,
      path: `starters/${folder}/${id}/${id}.draftcanvas`,
      sha256,
      bytes: bytes.length,
      formatVersion: file.version,
      updated: before?.sha256 === sha256 && before.updated ? before.updated : today,
    });
  }
}

/* Style packs: a folder each under styles/, built by tools/styles/build.ts. */
const MAX_STYLE_BYTES = 512 * 1024;
const styles = [];
const previousStyles = new Map((previous.styles ?? []).map((entry) => [entry.id, entry]));
const stylesDir = join(ROOT, 'styles');
if (existsSync(stylesDir)) {
  for (const id of readdirSync(stylesDir).sort()) {
    const at = join(stylesDir, id);
    if (!statSync(at).isDirectory()) continue;
    const where = relative(ROOT, at);
    const metaPath = join(at, 'pack.json');
    const filePath = join(at, `${id}.draftstyle`);
    if (!existsSync(metaPath)) { fail(where, 'missing pack.json'); continue; }
    if (!existsSync(filePath)) { fail(where, `missing ${id}.draftstyle: build it with tools/styles/build.ts`); continue; }
    let meta;
    try { meta = JSON.parse(readFileSync(metaPath, 'utf8')); } catch (error) { fail(where, `pack.json: ${error.message}`); continue; }
    if (meta.id !== id) fail(where, `pack.json id "${meta.id}" must match the folder name`);
    if (!ID.test(id)) fail(where, 'the id must be lowercase words joined by hyphens');
    if (typeof meta.name !== 'string' || !meta.name.trim() || meta.name.length > 60) fail(where, 'name: 1–60 characters');
    if (typeof meta.summary !== 'string' || !meta.summary.trim() || meta.summary.length > 120) fail(where, 'summary: 1–120 characters');
    if (typeof meta.author !== 'string' || !meta.author.trim() || meta.author.length > 80) fail(where, 'author: who drew it, 1–80 characters');
    if (typeof meta.licence !== 'string' || !meta.licence.trim() || meta.licence.length > 40) fail(where, 'licence: what it may be used under, 1–40 characters');
    if (!Number.isInteger(meta.order)) fail(where, 'order: a whole number');

    const bytes = readFileSync(filePath);
    if (bytes.length > MAX_STYLE_BYTES) fail(where, `${id}.draftstyle is over ${MAX_STYLE_BYTES / 1024} KB`);
    let file;
    try { file = JSON.parse(bytes.toString('utf8')); } catch (error) { fail(where, `${id}.draftstyle: ${error.message}`); continue; }
    if (file.format !== 'draft-canvas-style' || !Number.isInteger(file.version)) {
      fail(where, `${id}.draftstyle is not a Draft Canvas style`);
      continue;
    }
    for (const picture of ['preview.svg', 'preview-dark.svg', 'sheet.svg', 'README.md']) {
      if (!existsSync(join(at, picture))) fail(where, `missing ${picture}`);
    }
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const before = previousStyles.get(id);
    styles.push({
      id,
      name: meta.name,
      summary: meta.summary,
      author: meta.author,
      licence: meta.licence,
      order: meta.order,
      path: `styles/${id}/${id}.draftstyle`,
      sha256,
      bytes: bytes.length,
      updated: before?.sha256 === sha256 && before.updated ? before.updated : today,
    });
  }
}
styles.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

const order = Object.keys(CATEGORIES);
entries.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.order - b.order || a.id.localeCompare(b.id));
const catalog = {
  $schema: './catalog.schema.json',
  schema: SCHEMA,
  updated: [...entries, ...styles].reduce((latest, entry) => (entry.updated > latest ? entry.updated : latest), ''),
  starters: entries,
  // An app from before style packs reads `starters` and ignores this.
  styles,
};
const catalogText = `${JSON.stringify(catalog, null, 2)}\n`;

// The README shows every starter as a picture: whole systems first, then the rest by category, two
// to a row. Each picture follows the reader's light or dark theme and links to the starter's folder.
const README_ORDER = ['example', ...order.filter((category) => category !== 'example')];
const README_LABELS = { ...LABELS, example: 'Whole systems and examples' };
// Whole systems are dense enough to need the full width; everything else reads two to a row.
const README_COLUMNS = { example: 1 };
const card = (entry, columns) => {
  const dir = dirname(entry.path);
  return [
    `<td width="${Math.round(100 / columns)}%" valign="top">`,
    `<a href="${dir}/">`,
    '<picture>',
    `  <source media="(prefers-color-scheme: dark)" srcset="${dir}/preview-dark.svg">`,
    `  <img width="100%" alt="${entry.name} starter" src="${dir}/preview.svg">`,
    '</picture>',
    '</a>',
    `<p><a href="${dir}/"><b>${entry.name}</b></a><br>`,
    `<sub>${entry.summary}</sub></p>`,
    '</td>',
  ].join('\n');
};
const table = README_ORDER
  .filter((category) => entries.some((entry) => entry.category === category))
  .map((category) => {
    const members = entries.filter((entry) => entry.category === category);
    const columns = README_COLUMNS[category] ?? 2;
    const rows = [];
    for (let at = 0; at < members.length; at += columns) {
      const cells = members.slice(at, at + columns).map((entry) => card(entry, columns));
      while (cells.length < columns) cells.push(`<td width="${Math.round(100 / columns)}%"></td>`);
      rows.push(['<tr>', ...cells, '</tr>'].join('\n'));
    }
    return [`### ${README_LABELS[category]}`, '', '<table>', ...rows, '</table>'].join('\n');
  })
  .join('\n\n');
const readme = readFileSync(README, 'utf8');
const START = '<!-- gallery:start -->';
const END = '<!-- gallery:end -->';
if (!readme.includes(START) || !readme.includes(END)) fail('README.md', `needs ${START} and ${END} markers`);
// Style packs, two to a row: a sample diagram drawn in each.
const packCard = (entry) => {
  const dir = dirname(entry.path);
  return [
    '<td width="50%" valign="top">',
    `<a href="${dir}/">`,
    '<picture>',
    `  <source media="(prefers-color-scheme: dark)" srcset="${dir}/preview-dark.svg">`,
    `  <img width="100%" alt="${entry.name} style pack" src="${dir}/preview.svg">`,
    '</picture>',
    '</a>',
    `<p><a href="${dir}/"><b>${entry.name}</b></a><br>`,
    `<sub>${entry.summary}</sub></p>`,
    '</td>',
  ].join('\n');
};
const packRows = [];
for (let at = 0; at < styles.length; at += 2) {
  const cells = styles.slice(at, at + 2).map(packCard);
  while (cells.length < 2) cells.push('<td width="50%"></td>');
  packRows.push(['<tr>', ...cells, '</tr>'].join('\n'));
}
const packTable = ['<table>', ...packRows, '</table>'].join('\n');
const STYLES_START = '<!-- styles:start -->';
const STYLES_END = '<!-- styles:end -->';
if (styles.length > 0 && (!readme.includes(STYLES_START) || !readme.includes(STYLES_END))) fail('README.md', `needs ${STYLES_START} and ${STYLES_END} markers`);
const readmeText = readme
  .replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n\n${table}\n\n${END}`)
  .replace(new RegExp(`${STYLES_START}[\\s\\S]*?${STYLES_END}`), `${STYLES_START}\n\n${packTable}\n\n${STYLES_END}`);

if (problems.length > 0) {
  console.error(problems.map((problem) => `✗ ${problem}`).join('\n'));
  process.exit(1);
}
if (check) {
  const stale = [];
  if (!existsSync(CATALOG) || readFileSync(CATALOG, 'utf8') !== catalogText) stale.push('catalog.json');
  if (readme !== readmeText) stale.push('README.md');
  if (stale.length > 0) {
    console.error(`✗ ${stale.join(' and ')} out of date: run npm run catalog and commit the result.`);
    process.exit(1);
  }
  console.log(`✓ ${entries.length} starters and ${styles.length} style packs, catalog current`);
} else {
  writeFileSync(CATALOG, catalogText);
  writeFileSync(README, readmeText);
  console.log(`wrote catalog.json (${entries.length} starters, ${styles.length} style packs)`);
}

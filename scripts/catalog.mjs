#!/usr/bin/env node
/**
 * Builds `catalog.json`, the index Draft Canvas reads first, from each starter's folder, and the
 * gallery table in README.md.
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

const order = Object.keys(CATEGORIES);
entries.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.order - b.order || a.id.localeCompare(b.id));
const catalog = {
  $schema: './catalog.schema.json',
  schema: SCHEMA,
  updated: entries.reduce((latest, entry) => (entry.updated > latest ? entry.updated : latest), ''),
  starters: entries,
};
const catalogText = `${JSON.stringify(catalog, null, 2)}\n`;

const table = order
  .filter((category) => entries.some((entry) => entry.category === category))
  .map((category) => [
    `### ${LABELS[category]}`,
    '',
    '| Starter | Shows |',
    '| --- | --- |',
    ...entries
      .filter((entry) => entry.category === category)
      .map((entry) => `| [${entry.name}](${dirname(entry.path)}/) | ${entry.summary} |`),
  ].join('\n'))
  .join('\n\n');
const readme = readFileSync(README, 'utf8');
const START = '<!-- gallery:start -->';
const END = '<!-- gallery:end -->';
if (!readme.includes(START) || !readme.includes(END)) fail('README.md', `needs ${START} and ${END} markers`);
const readmeText = readme.replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n\n${table}\n\n${END}`);

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
  console.log(`✓ ${entries.length} starters, catalog current`);
} else {
  writeFileSync(CATALOG, catalogText);
  writeFileSync(README, readmeText);
  console.log(`wrote catalog.json (${entries.length} starters)`);
}

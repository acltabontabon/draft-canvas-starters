/**
 * Draws starters' pictures with the app's own Use-in-docs renderer, in a real browser so text is
 * measured with real fonts. Run it from a Draft Canvas checkout:
 *
 *   cd ../draft-canvas
 *   npx tsx ../draft-canvas-starters/tools/render.ts [--port 5396] [--png <dir>] [--views] [id...]
 *
 * Writes `preview.svg` and `preview-dark.svg` beside each starter (all of them, or the ids given),
 * exactly as the app's scripts/starters/render.ts does. For review it can also write PNGs:
 * `--png <dir>` saves `<id>-light.png` and `<id>-dark.png`, and `--views` adds a light PNG of every
 * drill-down view, `<id>--<owner>.png`. Set CHROMIUM_PATH to use a browser other than Playwright's.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = process.cwd();
if (!existsSync(join(APP, 'src', 'export', 'docs', 'image.ts'))) {
  console.error('Run this from a Draft Canvas checkout (it renders with src/export/docs/image.ts).');
  process.exit(2);
}
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Playwright is the checkout's own, imported by path: its CommonJS exports arrive on `default`.
const playwright = await import(createRequire(join(APP, 'package.json')).resolve('@playwright/test'));
const { chromium } = playwright.default ?? playwright;

const args = process.argv.slice(2);
const flag = (name: string) => { const at = args.indexOf(`--${name}`); return at === -1 ? undefined : args.splice(at, 2)[1]; };
const PORT = Number(flag('port') ?? 5396);
const PNG = flag('png');
const VIEWS = args.includes('--views');
const only = args.filter((a) => !a.startsWith('--'));
const URL = `http://localhost:${PORT}`;

function starterFiles(): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith('.draftcanvas') && (only.length === 0 || only.includes(basename(name, '.draftcanvas')))) found.push(path);
    }
  };
  walk(join(REPO, 'starters'));
  return found.sort();
}

// A dev server on a port of its own, stopped by killing exactly the process group it started.
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: APP, stdio: 'ignore', detached: true });
const stop = () => { try { process.kill(-server.pid!, 'SIGTERM'); } catch { /* already gone */ } };
try {
  const deadline = Date.now() + 90_000;
  for (;;) {
    try { if ((await fetch(URL)).status < 500) break; } catch { /* not up yet */ }
    if (Date.now() > deadline) throw new Error(`No dev server at ${URL} after 90 s.`);
    await new Promise((done) => setTimeout(done, 300));
  }
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage();
  // tsx keeps function names with an `__name` helper the page doesn't have.
  await page.addInitScript({ content: 'globalThis.__name = (f) => f;' });
  await page.goto(URL);
  const shot = await browser.newPage({ deviceScaleFactor: 1 });
  if (PNG) mkdirSync(PNG, { recursive: true });
  const png = async (svg: string, background: string, path: string) => {
    await shot.setContent(`<html><body style="margin:0;background:${background}">${svg}</body></html>`);
    await (await shot.$('svg'))!.screenshot({ path });
  };
  for (const file of starterFiles()) {
    const id = basename(file, '.draftcanvas');
    const out = await page.evaluate(async ({ text, source, views }: { text: string; source: string; views: boolean }) => {
      const project = await import('/src/export/project.ts');
      const docs = await import('/src/export/docs/image.ts');
      const parsed = project.deserializeDocument(text);
      if (!parsed.ok) throw new Error(`${source}: ${parsed.error}`);
      const render = async (theme: 'light' | 'dark', view: string[] = []) => {
        const result = await docs.renderDocsImage(parsed.document, source, { view, theme, style: 'clean', sync: true });
        if (!result.ok) throw new Error(`${source}: ${result.reason}`);
        return result.svg as string;
      };
      const rooms: { owner: string; svg: string }[] = [];
      if (views) for (const node of parsed.document.nodes) if (node.inside) rooms.push({ owner: node.id, svg: await render('light', [node.id]) });
      return { light: await render('light'), dark: await render('dark'), rooms };
    }, { text: readFileSync(file, 'utf8'), source: basename(file), views: VIEWS && !!PNG });
    writeFileSync(join(dirname(file), 'preview.svg'), `${out.light}\n`);
    writeFileSync(join(dirname(file), 'preview-dark.svg'), `${out.dark}\n`);
    if (PNG) {
      await png(out.light, '#ffffff', join(PNG, `${id}-light.png`));
      await png(out.dark, '#0d1117', join(PNG, `${id}-dark.png`));
      for (const room of out.rooms) await png(room.svg, '#ffffff', join(PNG, `${id}--${room.owner}.png`));
    }
    console.log(`rendered ${id}`);
  }
  await browser.close();
} finally {
  stop();
}

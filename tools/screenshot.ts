/**
 * A screenshot of a starter open in the real editor, framed on the diagram, for a README or a
 * release note. Run it from a Draft Canvas checkout:
 *
 *   cd ../draft-canvas
 *   npx tsx ../draft-canvas-starters/tools/screenshot.ts <starter.draftcanvas> <out.png> \
 *     [--theme light|dark] [--size 1600x1100] [--no-sequences] [--port 5397]
 *
 * The file is imported through Home like a person would, then the camera is zoomed and panned (with
 * the editor's own Ctrl+wheel and scroll) until the diagram fills the window under the breadcrumb.
 * `--no-sequences` frames the architecture only. Saved at twice the window size.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, join } from 'node:path';

const APP = process.cwd();
if (!existsSync(join(APP, 'src', 'ui'))) {
  console.error('Run this from a Draft Canvas checkout.');
  process.exit(2);
}
// Playwright is the checkout's own, imported by path: its CommonJS exports arrive on `default`.
const playwright = await import(createRequire(join(APP, 'package.json')).resolve('@playwright/test'));
const { chromium, expect } = playwright.default ?? playwright;

const args = process.argv.slice(2);
const flag = (name: string) => { const at = args.indexOf(`--${name}`); return at === -1 ? undefined : args.splice(at, 2)[1]; };
const theme = flag('theme') === 'dark' ? 'dark' : 'light';
const [W, H] = (flag('size') ?? '1600x1100').split('x').map(Number);
const PORT = Number(flag('port') ?? 5397);
const noSequences = args.includes('--no-sequences');
const [file, out] = args.filter((a) => !a.startsWith('--'));
if (!file || !out) {
  console.error('Usage: screenshot.ts <starter.draftcanvas> <out.png> [--theme light|dark] [--size WxH] [--no-sequences]');
  process.exit(2);
}

const text = readFileSync(file, 'utf8');
const nodes = (JSON.parse(text).nodes as { type: string; x: number; y: number; width: number; height: number }[]).filter((n) => !(noSequences && n.type === 'sequence'));
const x0 = Math.min(...nodes.map((n) => n.x)), y0 = Math.min(...nodes.map((n) => n.y));
const x1 = Math.max(...nodes.map((n) => n.x + n.width)), y1 = Math.max(...nodes.map((n) => n.y + n.height));

const URL = `http://localhost:${PORT}`;
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
  const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, colorScheme: theme })).newPage();
  await page.goto(URL);
  await page.locator('input[type="file"]').first().setInputFiles({ name: basename(file), mimeType: 'application/json', buffer: Buffer.from(text) });
  await expect(page.locator('.dc-editor')).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(1200);
  const pane = (await page.locator('.react-flow__pane').boundingBox())!;
  const camera = async () => {
    const style = (await page.locator('.react-flow__viewport').getAttribute('style'))!;
    const m = style.match(/translate\(([-\d.]+)px, ([-\d.]+)px\) scale\(([\d.]+)\)/)!;
    return { tx: +m[1], ty: +m[2], s: +m[3] };
  };
  // Leave room for the Depth breadcrumb at the top of the pane.
  const top = 70, pad = 24;
  const want = Math.min((pane.width - pad * 2) / (x1 - x0), (pane.height - top - pad) / (y1 - y0));
  await page.mouse.move(pane.x + pane.width / 2, pane.y + pane.height / 2);
  for (let i = 0; i < 40; i++) {
    const { s } = await camera();
    if (Math.abs(s - want) / want < 0.015) break;
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, s < want ? -20 : 20);
    await page.keyboard.up('Control');
    await page.waitForTimeout(250);
  }
  for (let i = 0; i < 6; i++) {
    const { tx, ty, s } = await camera();
    const wantX = pane.width / 2 - (s * (x0 + x1)) / 2;
    const wantY = top + (pane.height - top) / 2 - (s * (y0 + y1)) / 2;
    if (Math.abs(wantX - tx) < 2 && Math.abs(wantY - ty) < 2) break;
    // A scroll pans the canvas by half its delta.
    await page.mouse.wheel(-2 * (wantX - tx), -2 * (wantY - ty));
    await page.waitForTimeout(400);
  }
  await page.mouse.move(W - 4, H / 2);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: out });
  console.log(`saved ${out}`);
  await browser.close();
} finally {
  stop();
}

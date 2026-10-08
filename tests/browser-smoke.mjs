// Optional desktop Chromium smoke test run by CI. NOT an iPhone or performance benchmark.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const mime = { '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript', '.js': 'text/javascript' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const safe = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = resolve(root, safe);
    if (!(file === root || file.startsWith(root + '/'))) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch { res.writeHead(404).end('not found'); }
});
await new Promise(resolveReady => server.listen(0, '127.0.0.1', resolveReady));
let browser;
try {
  const port = server.address().port;
  browser = await chromium.launch({ headless: true, args: [
    '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'
  ] });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5,
    isMobile: true, hasTouch: true, reducedMotion: 'reduce'
  });
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('http://127.0.0.1:' + port + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.openSkyReady === 'true', null, { timeout: 45000 });
  assert.ok(await page.evaluate(() => !!document.querySelector('canvas')?.getContext('webgl2')), 'WebGL2 context expected');
  await page.locator('#primary').click();
  await page.waitForSelector('#hud:not(.hidden)', { timeout: 20000 });
  const before = await page.locator('#altitude').innerText();
  await page.mouse.move(190, 570);
  await page.mouse.down();
  await page.mouse.move(190, 370, { steps: 7 });
  await page.waitForTimeout(1500);
  await page.mouse.up();
  const after = await page.locator('#altitude').innerText();
  assert.ok(parseInt(after,10) > parseInt(before,10), 'drag-up should increase AGL');
  await page.locator('#view-mode').click();
  assert.equal(await page.locator('#view-mode').innerText(), 'CHASE');
  await page.locator('#boost').click();
  assert.equal(await page.locator('#boost').innerText(), 'FAST');
  await page.locator('#pause').click();
  assert.ok(await page.locator('#overlay').isVisible());
  await page.locator('#primary').click();
  assert.ok(await page.locator('#hud').isVisible());
  await mkdir(join(root, 'artifacts'), { recursive: true });
  await page.screenshot({ path: join(root, 'artifacts', 'open-sky-webgl.png') });
  assert.deepEqual(errors, [], 'JavaScript page errors must be absent');
  console.log('PASS: WebGL scene initialized; climb, FPV, speed, pause, resume; screenshot captured');
} finally {
  if (browser) await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}

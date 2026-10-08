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
  const state0=await page.evaluate(() => window.__openSkySnapshot());
  await page.mouse.move(155, 560);
  await page.mouse.down();
  await page.mouse.move(290, 560, { steps: 8 });
  await page.waitForTimeout(900);
  await page.mouse.up();
  const stateRight=await page.evaluate(() => window.__openSkySnapshot());
  assert.ok(stateRight.x < state0.x-2, 'drag right must travel toward screen-right (world -X in this view)');
  assert.ok(Math.abs(stateRight.heading - state0.heading)<.001, 'direct movement must not yaw');
  await page.mouse.move(275, 570);
  await page.mouse.down();
  await page.mouse.move(60, 570, { steps: 8 });
  await page.waitForTimeout(900);
  await page.mouse.up();
  const stateLeft=await page.evaluate(() => window.__openSkySnapshot());
  assert.ok(stateLeft.x > stateRight.x+2, 'drag left must travel toward screen-left');
  // Explicit camera orbit is separate from steering. FACE then changes the travel bearing.
  await page.locator('#look-mode').click();
  const priorView=await page.evaluate(() => window.__openSkySnapshot());
  await page.mouse.move(150,520);
  await page.mouse.down();
  await page.mouse.move(270,580,{steps:10});
  await page.mouse.up();
  const orbited=await page.evaluate(() => window.__openSkySnapshot());
  assert.ok(orbited.cameraYaw>priorView.cameraYaw+.2,'LOOK should rotate camera horizontally');
  assert.ok(orbited.cameraPitch>priorView.cameraPitch+.1,'LOOK should tilt camera vertically');
  assert.ok(Math.abs(orbited.heading-priorView.heading)<.01,'Orbit alone must not change heading');
  await page.locator('#align-view').click();
  const aligned=await page.evaluate(() => window.__openSkySnapshot());
  assert.ok(Math.abs(aligned.heading-aligned.cameraYaw)<.001,'FACE must align route to current viewpoint');
  await page.locator('#look-mode').click();
  for (const expected of ['FAST','REVERSE','HOVER','CRUISE']) {
    await page.locator('#boost').click();
    assert.equal(await page.locator('#boost').innerText(),expected);
  }
  await page.locator('#view-mode').click();
  assert.equal(await page.locator('#view-mode').innerText(), 'CHASE');
  await page.locator('#boost').click();
  assert.equal(await page.locator('#boost').innerText(), 'FAST');
  await page.locator('#sound-toggle').click();
  assert.equal(await page.locator('#sound-toggle').innerText(), 'MUTED');
  await page.locator('#sound-toggle').click();
  assert.equal(await page.locator('#sound-toggle').innerText(), 'SOUND ON');
  await page.locator('#pause').click();
  assert.ok(await page.locator('#overlay').isVisible());
  await page.locator('#primary').click();
  assert.ok(await page.locator('#hud').isVisible());
  await mkdir(join(root, 'artifacts'), { recursive: true });
  await page.screenshot({ path: join(root, 'artifacts', 'open-sky-webgl.png') });
  assert.deepEqual(errors, [], 'JavaScript page errors must be absent');
  console.log('PASS: WebGL renders; camera-relative lateral, camera orbit/tilt, face bearing, throttle modes, mute, pause and resume');
} finally {
  if (browser) await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}

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
  // Nose-down attitude and gravity-driven acceleration are independent
  // of steering. The game remains an entertainment flight experience.
  await page.mouse.move(185,430);
  await page.mouse.down();
  await page.mouse.move(185,690,{steps:8});
  await page.waitForTimeout(1200);
  const noseDown = await page.evaluate(() => window.__openSkySnapshot());
  await page.mouse.up();
  assert.ok(noseDown.pitch > .7,'steep finger-down gesture should tilt nose down');
  assert.ok(noseDown.vy < -.5,'steep forward pitch must create downward velocity');
  assert.ok(noseDown.cameraPitch < -.3,'camera should follow the diving attitude');
  assert.match(await page.locator('#vertical-rate').innerText(),/↓/,'HUD should show descent');
  const initial = await page.evaluate(() => window.__openSkySnapshot());
  assert.equal(await page.locator('#look-mode').count(), 0, 'no LOOK button');
  assert.equal(await page.locator('#align-view').count(), 0, 'no FACE button');

  await page.mouse.move(150, 560);
  await page.mouse.down();
  await page.mouse.move(290, 560, { steps: 8 });
  await page.waitForTimeout(1300);
  const turnedRight = await page.evaluate(() => window.__openSkySnapshot());
  await page.mouse.up();
  assert.ok(turnedRight.heading < initial.heading-.75, 'right swipe turns aircraft right');
  assert.ok(turnedRight.x < initial.x-4, 'aircraft curves into screen-right world space');
  assert.ok(turnedRight.cameraYaw < initial.cameraYaw-.32, 'camera follows right-hand turn without LOOK');
  assert.ok(Math.abs(turnedRight.cameraYaw-turnedRight.heading)<.50,'chase camera remains behind heading');

  await page.mouse.move(290, 570);
  await page.mouse.down();
  await page.mouse.move(70, 570, { steps: 8 });
  await page.waitForTimeout(1250);
  const turnedLeft = await page.evaluate(() => window.__openSkySnapshot());
  await page.mouse.up();
  assert.ok(turnedLeft.heading > turnedRight.heading+.7, 'left swipe turns aircraft back left');
  assert.ok(turnedLeft.cameraYaw > turnedRight.cameraYaw+.5, 'camera automatically follows left turn');
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
  console.log('PASS: WebGL, nose-down/gravity dive, pitch-aware camera, single-finger steering, altitude, FPV, throttle, mute, pause/resume');
} finally {
  if (browser) await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}

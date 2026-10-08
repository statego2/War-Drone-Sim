// Desktop Chromium WebGL interaction smoke. Real iPhone feel remains a separate gate.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const mime={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript'};
const server=createServer(async(req,res)=>{
  try{
    const safe=decodeURIComponent(new URL(req.url||'/','http://localhost').pathname).replace(/^\/+/, '')||'index.html';
    const file=resolve(root,safe);
    if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});
    res.end(await readFile(file));
  }catch{res.writeHead(404).end('not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
  browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5,isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.openSkyReady==='true',null,{timeout:45000});
  await page.locator('#primary').click();
  await page.waitForSelector('#hud:not(.hidden)');
  await page.waitForTimeout(900);
  const running=await page.evaluate(()=>window.__openSkySnapshot());
  assert.equal(running.vehicles.length,3);
  assert.ok(running.speed>43,'cruise raises actual forward speed');
  await page.mouse.move(190,540);await page.mouse.down();
  await page.mouse.move(190,350,{steps:6});
  await page.waitForTimeout(900);
  const climbing=await page.evaluate(()=>window.__openSkySnapshot());
  await page.mouse.up();
  assert.ok(climbing.vy>0,'upward gesture produces climb');
  const beforeDiagonal=await page.evaluate(()=>window.__openSkySnapshot());
  await page.mouse.move(190,520);await page.mouse.down();
  await page.mouse.move(275,355,{steps:6});
  await page.waitForTimeout(1200);
  const diagonal=await page.evaluate(()=>window.__openSkySnapshot());
  await page.mouse.up();
  console.log('DIAGONAL SNAPSHOT',JSON.stringify({before:beforeDiagonal,after:diagonal}));
  assert.ok(diagonal.vx < beforeDiagonal.vx-9,'diagonal right drag must accelerate sideways despite existing forward inertia');
  assert.ok(diagonal.y > beforeDiagonal.y+2,'diagonal up drag must continue climbing');
  assert.ok(diagonal.bank<-.2,'lateral swipe banks the drone');
  await page.mouse.move(190,400);await page.mouse.down();
  await page.mouse.move(190,700,{steps:6});
  await page.waitForTimeout(900);
  const diving=await page.evaluate(()=>window.__openSkySnapshot());
  await page.mouse.up();
  assert.ok(diving.pitch>.7 && diving.vy<climbing.vy,'downward gesture pitches and falls');
  await page.locator('#sound-toggle').click();
  assert.equal(await page.locator('#sound-toggle').innerText(),'MUTED');
  await page.locator('#pause').click();
  assert.ok(await page.locator('#overlay').isVisible());
  await page.locator('#primary').click();
  assert.ok(await page.locator('#hud').isVisible());
  await mkdir(join(root,'artifacts'),{recursive:true});
  await page.screenshot({path:join(root,'artifacts','forest-encounter-webgl.png')});
  // Legacy Canvas fallback must also provide sound control and basic lifecycle.
  const fallback=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5,isMobile:true,hasTouch:true});
  fallback.on('pageerror',e=>errors.push('fallback: '+e.message));
  await fallback.goto(`http://127.0.0.1:${server.address().port}/legacy-canvas.html`,{waitUntil:'domcontentloaded'});
  await fallback.locator('#primary').click();
  await fallback.waitForSelector('#legacy-sound-toggle:not(.hidden)');
  await fallback.locator('#legacy-sound-toggle').click();
  assert.equal(await fallback.locator('#legacy-sound-toggle').innerText(),'MUTED');
  await fallback.locator('#pause').click();
  assert.ok(await fallback.locator('#overlay').isVisible());
  await fallback.locator('#primary').click();
  assert.ok(await fallback.locator('#hud').isVisible());
  await fallback.close();
  assert.deepEqual(errors,[],'no JavaScript page errors');
  console.log('PASS: portrait WebGL, vehicle encounter, cruise, diagonal lateral/climb, nose-dive, mute and pause');
}finally{
  if(browser)await browser.close();
  await new Promise(r=>server.close(r));
}

// Desktop Chromium WebGL interaction smoke. Real iPhone feel remains a separate gate.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { stagePages } from '../scripts/stage-pages.mjs';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const servingRoot=join(root,'public');
// The browser must test precisely the files uploaded to GitHub Pages, not the
// source tree (the vendor-path deployment regression escaped for this reason).
await stagePages({publicRoot:servingRoot});
const mime={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript'};
const server=createServer(async(req,res)=>{
  try{
    const safe=decodeURIComponent(new URL(req.url||'/','http://localhost').pathname).replace(/^\/+/, '')||'index.html';
    const file=resolve(servingRoot,safe);
    if(!file.startsWith(servingRoot+'/')){res.writeHead(403).end();return;}
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});
    res.end(await readFile(file));
  }catch{res.writeHead(404).end('not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
  browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5,isMobile:true,hasTouch:true});
  const errors=[],externalRequests=[];
  page.on('request',req=>{
    if(/^https?:/.test(req.url()) && !req.url().includes('127.0.0.1'))
      externalRequests.push(req.url());
  });
  // Test boot is entirely self-hosted, even when a popular CDN is unavailable.
  await page.route('https://cdn.jsdelivr.net/**',route=>route.abort());
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.openSkyReady==='true',null,{timeout:45000});
  await mkdir(join(root,'artifacts'),{recursive:true});
  assert.equal(await page.locator('#hint').isVisible(),false,'flight hints stay off the home screen');
  await page.screenshot({path:join(root,'artifacts','01-home-portrait.png')});
  await page.locator('#primary').click();
  await page.waitForSelector('#hud:not(.hidden)');
  await page.waitForTimeout(900);
  const hintBox=await page.locator('#hint').boundingBox();
  const hudBox=await page.locator('#hud').boundingBox();
  assert.ok(hintBox && hudBox && hintBox.y>hudBox.y+hudBox.height+80,
    'first-flight hint stays below the HUD instead of overlapping sector and altitude');
  assert.ok(hintBox.y>400,'first-flight hint stays in the lower third of portrait');
  await page.screenshot({path:join(root,'artifacts','02-flight-opening.png')});
  const running=await page.evaluate(()=>window.__openSkySnapshot());
  assert.equal(running.vehicles.length,16,'full forest level has sixteen persistent targets');
  assert.equal(running.scenicSites,3,'three distinct side-clearing environments accompany the route');
  assert.equal(running.total,16);
  assert.equal(running.moving,6,'six unoccupied fictional props patrol short arcade tracks');
  assert.ok(running.redOutlines>=1 && running.redOutlines<=5,
    'visible uncleared vehicles have a restrained red silhouette instead of a target-lock overlay');
  assert.ok(running.beacons>=1 && running.beacons<=5,
    'nearby uncleared targets get in-world glints without flooding the scene');
  assert.ok(running.nearbyTrees>0,'visually streamed near forest has physical obstacle candidates');
  assert.ok(running.target?.distance>0,'target guidance is available as soon as a run starts');
  assert.ok(running.dpr>=.85 && running.dpr<=1.6,'adaptive resolution starts in supported mobile bounds');
  assert.ok(running.renderCalls>0,'3D scene draws at least one call');
  assert.ok(running.primitiveGeometries>0 && running.primitiveGeometries<120,
    'target models share repeated GPU primitive geometries');
  assert.equal(running.points,0,'a new run starts with a clean score');
  assert.equal(await page.locator('#arcade-score').innerText(),'0 PTS');
  assert.match(await page.locator('#target-compass').innerText(),/M$/);
  assert.equal(await page.locator('#progress span:not(.hidden)').count(),5,'entry clearing has five goals');
  assert.ok(running.speed>43,'neutral flight maintains automatic forward cruise');
  assert.equal(await page.locator('#boost').count(),0,'one-finger flight must not show a speed-mode button');
  // A modest thumb movement should reach the intermediate near-hover band.
  await page.mouse.move(190,540); await page.mouse.down();
  await page.mouse.move(190,488,{steps:4});
  await page.waitForTimeout(650);
  const nearHover=await page.evaluate(()=>window.__openSkySnapshot());
  await page.mouse.up();
  assert.ok(nearHover.gesture.y>.7,'52px upward swipe reaches the direct brake/hover command');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(1950);
  const reversing=await page.evaluate(()=>window.__openSkySnapshot());
  await page.keyboard.up('ArrowUp');
  // Software-rendered WebGL may advance very little simulation time per wall-clock
  // second. Check initiation here; the full forward-to-backward transition is
  // covered by fixed-time pure flight tests on both CRUISE and FAST.
  assert.equal(reversing.gesture.y,1,'full-up keyboard or one-finger control reaches reverse command');
  assert.ok(reversing.brakeIntent>.2,'one rendered physics step registers the reverse braking intent');
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
  assert.ok(diving.pitch>.7 && diving.vy<diagonal.vy-3,'downward gesture pitches and decelerates the immediate prior climb');
  await page.locator('#sound-toggle').click();
  assert.equal(await page.locator('#sound-toggle').innerText(),'MUTED');
  await page.locator('#pause').click();
  assert.ok(await page.locator('#overlay').isVisible());
  assert.equal(await page.locator('#hint').isVisible(),false,'flight hints stay off pause menu');
  await page.screenshot({path:join(root,'artifacts','03-pause-menu.png')});
  await page.locator('#primary').click();
  assert.ok(await page.locator('#hud').isVisible());
  await page.locator('#pause').click();
  const preRedeploy=await page.evaluate(()=>window.__openSkySnapshot());
  await page.locator('#redeploy').click();
  const postRedeploy=await page.evaluate(()=>window.__openSkySnapshot());
  assert.equal(postRedeploy.drones,preRedeploy.drones+1,'manual recovery costs one drone');
  assert.equal(postRedeploy.hits,preRedeploy.hits,'manual recovery keeps progress');
  assert.equal(postRedeploy.points,preRedeploy.points,'manual recovery keeps earned score');
  assert.equal(postRedeploy.misses,preRedeploy.misses+1,'manual recovery breaks the combo');
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  assert.ok(await page.locator('#overlay').isVisible(),'app switch pauses the run');
  const suspended=await page.evaluate(()=>window.__openSkySnapshot());
  assert.equal(suspended.mode,'paused');
  assert.equal(suspended.resumeMode,'flying');
  await page.locator('#primary').click();
  assert.ok(await page.locator('#hud').isVisible(),'returning to game restores HUD');
  await page.screenshot({path:join(root,'artifacts','forest-encounter-webgl.png')});
  await page.locator('#pause').click();
  await page.locator('#restart-level').click();
  assert.equal(await page.locator('#restart-level').innerText(),'CONFIRM RESTART');
  assert.equal((await page.evaluate(()=>window.__openSkySnapshot())).drones,postRedeploy.drones,
    'first restart tap cannot erase a run');
  await page.locator('#restart-level').click();
  const fresh=await page.evaluate(()=>window.__openSkySnapshot());
  assert.equal(fresh.mode,'flying');
  assert.equal(fresh.drones,1,'confirmed restart uses the original first drone');
  assert.equal(fresh.points,0,'confirmed restart resets score');
  assert.equal(fresh.hits,0,'confirmed restart resets destroyed props');
  // Narrow phones must keep all essential pause/redeploy/restart controls
  // entirely inside the viewport, including minimum 44px touch hit areas.
  await page.setViewportSize({width:320,height:568});
  await page.locator('#pause').click();
  const layout=await page.evaluate(()=>{
    const ids=['primary','redeploy','restart-level'];
    return ids.map(id=>{
      const rect=document.getElementById(id).getBoundingClientRect();
      return {id,x:rect.x,y:rect.y,width:rect.width,height:rect.height};
    });
  });
  for(const button of layout){
    assert.ok(button.width>=44 && button.height>=44,'essential buttons have accessible hit areas: '+button.id);
    assert.ok(button.x>=0 && button.y>=0 && button.x+button.width<=321 &&
      button.y+button.height<=569,'button fits narrow iPhone: '+JSON.stringify(button));
  }
  await page.screenshot({path:join(root,'artifacts','04-pause-compact.png')});
  await page.locator('#primary').click();
  await page.setViewportSize({width:844,height:390});
  assert.equal(await page.locator('#landscape').isVisible(),true,'landscape displays portrait guidance');
  await page.setViewportSize({width:390,height:844});
  // Legacy Canvas fallback must also provide sound control and basic lifecycle.
  const fallback=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1.5,isMobile:true,hasTouch:true});
  fallback.on('pageerror',e=>errors.push('fallback: '+e.message));
  await fallback.goto(`http://127.0.0.1:${server.address().port}/legacy-canvas.html?classic=1`,{waitUntil:'domcontentloaded'});
  await fallback.locator('#primary').click();
  await fallback.waitForSelector('#legacy-sound-toggle:not(.hidden)');
  await fallback.locator('#legacy-sound-toggle').click();
  assert.equal(await fallback.locator('#legacy-sound-toggle').innerText(),'MUTED');
  await fallback.locator('#pause').click();
  assert.ok(await fallback.locator('#overlay').isVisible());
  await fallback.locator('#primary').click();
  assert.ok(await fallback.locator('#hud').isVisible());
  await fallback.close();
  // A broken module must produce a visible retry, not teleport the player
  // back to the discarded V0.1 after years of development.
  const failPage=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await failPage.route('**/vendor/three.core.min.js',route=>route.abort());
  await failPage.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'domcontentloaded'});
  await failPage.waitForFunction(()=>document.documentElement.dataset.openSkyBoot==='failed',null,{timeout:15000});
  assert.equal(await failPage.locator('#boot-error').isVisible(),true);
  assert.equal(await failPage.locator('#boot-retry').isVisible(),true);
  assert.match(await failPage.locator('#boot-error').innerText(),/3D/);
  assert.equal(new URL(failPage.url()).pathname,'/','a failed 3D boot stays on the current game URL');
  await failPage.close();
  // Old redirected bookmarks should return to the 3D game automatically.
  const staleBookmark=await browser.newPage({viewport:{width:390,height:844}});
  await staleBookmark.goto(`http://127.0.0.1:${server.address().port}/legacy-canvas.html`,{waitUntil:'domcontentloaded'});
  await staleBookmark.waitForURL('**/index.html',{timeout:10000});
  await staleBookmark.waitForFunction(()=>document.documentElement.dataset.openSkyReady==='true',null,{timeout:45000});
  await staleBookmark.close();
  assert.deepEqual(externalRequests,[],'3D build has no third-party runtime CDN dependencies');
  assert.deepEqual(errors,[],'no JavaScript page errors');
  console.log('PASS: one-finger no-mode flight, brake/hover gesture, reverse, diagonals, dive, mute and pause');
}finally{
  if(browser)await browser.close();
  await new Promise(r=>server.close(r));
}

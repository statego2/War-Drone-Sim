// Desktop Linux WebKit is a useful Safari-family boot regression floor,
// NEVER equivalent to a real iPhone Safari hardware playtest.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {join,resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {webkit} from 'playwright';
import {stagePages} from '../scripts/stage-pages.mjs';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const servingRoot=join(root,'public');
await stagePages({publicRoot:servingRoot});
const mime={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript'};
const server=createServer(async(req,res)=>{
  try{
    const safe=decodeURIComponent(new URL(req.url||'/','http://localhost').pathname)
      .replace(/^\/+/, '')||'index.html';
    const file=resolve(servingRoot,safe);
    if(!file.startsWith(servingRoot+'/')){res.writeHead(403).end();return;}
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});
    res.end(data);
  }catch{res.writeHead(404).end('not found');}
});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
let browser=null;
try{
  browser=await webkit.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},
    deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const pageErrors=[];
  page.on('pageerror',err=>pageErrors.push(err.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.documentElement.dataset.openSkyReady==='true'
    ||document.documentElement.dataset.openSkyBoot==='failed',null,{timeout:70000});
  const boot=await page.evaluate(()=>({
    ready:document.documentElement.dataset.openSkyReady,
    failed:document.documentElement.dataset.openSkyBoot,
    error:document.getElementById('boot-error-details')?.textContent
  }));
  assert.equal(boot.ready,'true',
    'Desktop WebKit must load genuine 3D; boot diagnostic: '+JSON.stringify(boot));
  await page.locator('#primary').click();
  await page.waitForSelector('#hud:not(.hidden)',{timeout:20000});
  const state=await page.evaluate(()=>window.__openSkySnapshot());
  assert.equal(state.vehicles.length,16);
  assert.equal(state.mode,'flying');
  assert.ok(state.renderCalls>0);
  assert.equal(await page.locator('#boot-error').isVisible(),false);
  assert.deepEqual(pageErrors,[],'no uncaught desktop WebKit JavaScript errors');
  await mkdir(join(root,'artifacts'),{recursive:true});
  await page.screenshot({path:join(root,'artifacts','webkit-portrait-gameplay.png')});
  // Visual regression captures all three actually rendered areas, not merely
  // a list of palette names. Freeze model time only on local test origin.
  const expected=['pine','valley','ridge'];
  for(let i=0;i<3;i++){
    const result=await page.evaluate(index=>window.__forestVisualQA(index),i);
    assert.equal(result.region,expected[i]);
    await page.waitForTimeout(950);
    const current=await page.evaluate(()=>window.__openSkySnapshot());
    assert.equal(current.biome,expected[i]);
    assert.equal(current.physicalArea,i,'progress HUD follows actual visited biome');
    assert.ok(current.cameraPitch<-.14 && current.cameraPitch>-.55,
      'QA cruise camera frames the trees instead of looking into empty sky');
    assert.match(await page.locator('#round-label').innerText(),
      new RegExp('AREA '+(i+1)+'/3'));
    assert.ok(current.renderCalls>0);
    await page.screenshot({path:join(root,'artifacts',
      'webkit-biome-'+(i+1)+'-'+expected[i]+'.png')});
  }
  console.log('PASS: desktop WebKit 3D, three rendered biomes, 16 targets');
}finally{
  if(browser)await browser.close();
  await new Promise(ok=>server.close(ok));
}

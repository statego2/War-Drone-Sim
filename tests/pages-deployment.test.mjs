import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,unlink,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {PROJECT_ROOT,stagePages,validatePages} from '../scripts/stage-pages.mjs';

test('real GitHub Pages artifact includes pinned local renderer dependencies',async()=>{
  const destination=await mkdtemp(join(tmpdir(),'war-drone-pages-'));
  try{
    const info=await stagePages({publicRoot:destination});
    assert.equal(info.ok,true);
    assert.equal(info.renderer,'local Three.js r180');
    const core=await stat(join(destination,'vendor/three.core.min.js'));
    const module=await stat(join(destination,'vendor/three.module.min.js'));
    assert.ok(core.size>300000 && module.size>300000);
    const page=await readFile(join(destination,'index.html'),'utf8');
    assert.ok(!page.includes("window.location.replace('./legacy-canvas.html')"),
      'modern game must not silently redirect the player to obsolete Canvas');
    assert.match(page,/id="boot-error"/);
    assert.match(page,/id="boot-retry"/);
    const legacy=await readFile(join(destination,'legacy-canvas.html'),'utf8');
    assert.match(legacy,/location\.replace\('\.\/index\.html'\)/,'stale legacy bookmarks return to 3D');
    assert.match(page,/legacy-canvas\.html\?classic=1/,'old prototype still available by explicit opt-in');
    await unlink(join(destination,'vendor/three.core.min.js'));
    await assert.rejects(validatePages(destination),/three.core.min.js: MISSING/);
  }finally{await rm(destination,{recursive:true,force:true});}
});

test('Pages deployment workflow uses the same verified staging script',async()=>{
  const action=await readFile(join(PROJECT_ROOT,'.github/workflows/deploy-pages.yml'),'utf8');
  assert.match(action,/node scripts\/stage-pages\.mjs/);
  assert.match(action,/path: public/);
  assert.doesNotMatch(action,/cp -R src public\/src/);
});

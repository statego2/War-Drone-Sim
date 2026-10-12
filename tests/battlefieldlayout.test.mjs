import test from 'node:test';
import assert from 'node:assert/strict';
import {battlefieldLayout} from '../src/battlefieldlayout.mjs';
import {roadCenter} from '../src/flight3d.mjs';
import {LEVEL_SECTORS,LEVEL_TARGETS} from '../src/encounter.mjs';

test('authored battlefield has two alternate forest routes in each clearing',()=>{
  const a=battlefieldLayout();
  assert.equal(a.trails.length,LEVEL_SECTORS.length*2);
  assert.equal(a.pads.length,LEVEL_TARGETS+6);
  assert.equal(new Set(a.trails.map(x=>x.id)).size,a.trails.length);
  for(const sector of [0,1,2]){
    const pair=a.trails.filter(x=>x.sector===sector);
    assert.deepEqual(pair.map(x=>x.side),[-1,1]);
    for(const t of pair){
      assert.equal(t.path.length,6);
      assert.ok(Math.abs(t.path[0].x-roadCenter(t.path[0].z))<.002);
      assert.ok(Math.abs(t.path.at(-1).x-roadCenter(t.path.at(-1).z))<.002);
      assert.ok(t.path.some(p=>Math.abs(p.x-roadCenter(p.z))>28),
        'forest route reaches well beyond the one main paved lane');
    }
  }
});
test('all fictional vehicles have a visible authored staging pad',()=>{
  const a=battlefieldLayout();
  for(let i=0;i<3;i++){
    const sites=a.pads.filter(x=>x.sector===i&&x.id.startsWith('vehicle-'));
    assert.equal(sites.length,LEVEL_SECTORS[i].targets.length);
    for(let j=0;j<sites.length;j++){
      const [z,offset]=LEVEL_SECTORS[i].targets[j];
      assert.equal(sites[j].z,z);
      assert.ok(Math.abs(sites[j].x-roadCenter(z)-offset)<.002);
      assert.ok(sites[j].rx>=10 && sites[j].rx<=12 && sites[j].rz>=12 && sites[j].rz<=16,
        'the narrower vehicle dirt staging area remains clearly visible');
    }
  }
});
test('layout is deterministic, finite and bounded to authored three-sector arena',()=>{
  const a=battlefieldLayout(),b=battlefieldLayout();assert.deepEqual(a,b);
  for(const track of a.trails)for(const p of track.path){
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.z));
    assert.ok(p.z>=100&&p.z<1350);
  }
  for(const p of a.pads)assert.ok(Number.isFinite(p.x)&&p.rx>0&&p.rz>0);
});

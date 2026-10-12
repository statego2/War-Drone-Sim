import test from 'node:test';
import assert from 'node:assert/strict';
import {FOREST_SITES,sideTrailPoint,scenicTrailClearance} from '../src/forestlayout.mjs';
import {roadCenter} from '../src/flight3d.mjs';

test('three decorative branches each lead away from the original one-road corridor',()=>{
  assert.equal(FOREST_SITES.length,3);
  assert.deepEqual(FOREST_SITES.map(s=>s.id),['pine-camp','bend-depot','final-camp']);
  for(const site of FOREST_SITES){
    const start=sideTrailPoint(site,0),middle=sideTrailPoint(site,.5),end=sideTrailPoint(site,1);
    assert.ok(Math.abs(start.x-roadCenter(site.z))<8);
    assert.ok(Math.abs(end.x-roadCenter(site.z))>=105);
    assert.ok(Math.abs(middle.x-roadCenter(site.z))>45);
    assert.equal(scenicTrailClearance(end.x,end.z),true);
    assert.equal(scenicTrailClearance(middle.x,middle.z),true);
  }
});
test('unrelated woodland remains thick, branch sites do not remove the entire forest',()=>{
  assert.equal(scenicTrailClearance(800,1900),false);
  for(const site of FOREST_SITES)
    assert.equal(scenicTrailClearance(roadCenter(site.z)+230,site.z),false);
});
test('geometry sampling is stable and bounded for all branch paths',()=>{
  for(const site of FOREST_SITES){
    for(let i=0;i<=40;i++){
      const p=sideTrailPoint(site,i/40);
      assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.z));
    }
    assert.deepEqual(sideTrailPoint(site,-7),sideTrailPoint(site,0));
    assert.deepEqual(sideTrailPoint(site,12),sideTrailPoint(site,1));
  }
});

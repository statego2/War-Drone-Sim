import test from 'node:test';
import assert from 'node:assert/strict';
import {LANDMARKS,landmarkPosition,landmarkClearance,landmarkAt} from '../src/landmarks.mjs';
import {roadCenter} from '../src/flight3d.mjs';

test('each distinct biome gains a real off-road natural anchor point',()=>{
  assert.equal(LANDMARKS.length,3);
  assert.deepEqual(LANDMARKS.map(x=>x.sector),[0,1,2]);
  assert.equal(new Set(LANDMARKS.map(x=>x.kind)).size,3);
  assert.ok(LANDMARKS.every(x=>Math.abs(x.offset)>90));
  for(const site of LANDMARKS){
    const position=landmarkPosition(site);
    assert.equal(position.x-roadCenter(site.z),site.offset);
    assert.equal(landmarkAt(position.x,position.z)?.id,site.id);
    assert.equal(landmarkClearance(position.x,position.z),true);
    assert.equal(landmarkClearance(position.x+250,position.z+250),false);
  }
});
test('natural sites stay distinct from the road so exploring has purpose',()=>{
  const points=LANDMARKS.map(landmarkPosition);
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
    assert.ok(Math.hypot(points[i].x-points[j].x,points[i].z-points[j].z)>200);
  }
  assert.equal(landmarkAt(-100000,-100000),null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {BIRD_COUNT,BIRDS_PER_LANDMARK,birdPosition} from '../src/wildlife3d.mjs';
import {LANDMARKS,landmarkPosition} from '../src/landmarks.mjs';

const anchors=LANDMARKS.map(site=>({...landmarkPosition(site),y:45}));
test('three six-bird flocks animate in the three distinct forest locations',()=>{
  assert.equal(BIRD_COUNT,18);
  assert.equal(BIRDS_PER_LANDMARK,6);
  const locations=new Set();
  for(let i=0;i<BIRD_COUNT;i++){
    const p=birdPosition(i,4,anchors);
    locations.add(Math.floor(i/6));
    for(const v of ['x','y','z','yaw','tilt','scale'])assert.ok(Number.isFinite(p[v]),v);
    const own=anchors[Math.floor(i/6)];
    assert.ok(Math.hypot(p.x-own.x,p.z-own.z)<60);
    assert.ok(Math.abs(p.y-own.y)<6);
  }
  assert.equal(locations.size,3);
});
test('flock movement is smooth, repeatable and independent of frame rate',()=>{
  const a=birdPosition(7,1.25,anchors),b=birdPosition(7,1.25,anchors);
  assert.deepEqual(a,b);
  const near=birdPosition(7,1.25+.016,anchors);
  assert.ok(Math.hypot(a.x-near.x,a.y-near.y,a.z-near.z)<.5);
  assert.notDeepEqual(a,birdPosition(7,2.25,anchors));
});
test('reduced motion freezes birds in pleasant stable silhouettes',()=>{
  const before=birdPosition(11,0,anchors,true),after=birdPosition(11,2000,anchors,true);
  assert.deepEqual(before,after);
  assert.equal(before.tilt,0);
  assert.throws(()=>birdPosition(-1,0,anchors),RangeError);
});

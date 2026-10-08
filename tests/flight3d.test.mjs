import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, hash, noise, roadCenter, groundHeight, makeFlight, stepFlight, advanceFlight } from '../src/flight3d.mjs';

test('world terrain is deterministic and finite across sectors', () => {
  for (const [x,z] of [[0,0],[-TILE, TILE],[32790,-8730],[.03,-.02],[-100000,100000]]) {
    assert.equal(groundHeight(x,z), groundHeight(x,z));
    assert.ok(Number.isFinite(groundHeight(x,z)));
    assert.ok(Number.isFinite(roadCenter(z)));
  }
  assert.equal(hash(33,-1), hash(33,-1));
  assert.notEqual(noise(1.234,4.567), noise(1.235,4.567));
});
test('seamless ground height at streamed tile edges', () => {
  for(const v of [-TILE,0,TILE,7*TILE]) {
    assert.ok(Math.abs(groundHeight(v - .0001, 42) - groundHeight(v + .0001, 42)) < .02);
    assert.ok(Math.abs(groundHeight(63,v - .0001) - groundHeight(63,v + .0001)) < .02);
  }
});
test('free flight has no arbitrary altitude limit or forced mission timer', () => {
  const f=makeFlight(), initial=f.y;
  for(let i=0;i<2200;i++) stepFlight(f,{x:0,y:1},.05);
  assert.ok(f.y > initial + 2000, 'flight climbs beyond 2km');
  assert.equal(f.groundContact,false);
  assert.ok(f.time > 100);
  assert.ok(Number.isFinite(f.distance));
});
test('low altitude prevents tunneling below terrain, without killing flight', () => {
  const f=makeFlight();
  f.y = -10000;
  stepFlight(f,{x:0,y:-1},.05);
  assert.equal(f.groundContact,true);
  assert.ok(f.y >= groundHeight(f.x,f.z)+2.2-0.001);
  stepFlight(f,{x:0,y:1},.05);
  assert.ok(f.y >= groundHeight(f.x,f.z)+2.2-0.001);
});
test('screen-space right input moves right without yaw rotation', () => {
  const f=makeFlight(); const x0=f.x, z0=f.z;
  for (let i=0;i<45;i++) advanceFlight(f,{x:1,y:0},1/60);
  assert.ok(f.x > x0+8);
  assert.equal(f.heading, 0);
  assert.ok(f.z > z0);
});
test('screen-space left input moves left; up climbs and down descends', () => {
  const left=makeFlight(),right=makeFlight(),vertical=makeFlight();
  for (let i=0;i<40;i++) { stepFlight(left,{x:-1,y:0},1/60); stepFlight(right,{x:1,y:0},1/60); }
  assert.ok(left.x < roadCenter(0)-5);
  assert.ok(right.x > roadCenter(0)+5);
  const initialY=vertical.y;
  for (let i=0;i<70;i++) stepFlight(vertical,{x:0,y:1},1/60);
  assert.ok(vertical.y > initialY + 15);
  const peak=vertical.y;
  for (let i=0;i<70;i++) stepFlight(vertical,{x:0,y:-1},1/60);
  assert.ok(vertical.y < peak - 10);
});
test('batched elapsed time approximates short frame time', () => {
  const slow=makeFlight(), fast=makeFlight();
  for(let i=0;i<60;i++) advanceFlight(slow,{x:.25,y:.4},1/30);
  for(let i=0;i<120;i++) advanceFlight(fast,{x:.25,y:.4},1/60);
  assert.ok(Math.abs(slow.x-fast.x)<1.2);
  assert.ok(Math.abs(slow.z-fast.z)<1.2);
  assert.ok(Math.abs(slow.y-fast.y)<1.2);
});

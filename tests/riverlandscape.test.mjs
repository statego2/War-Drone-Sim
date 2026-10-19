import test from 'node:test';
import assert from 'node:assert/strict';
import {RIVER,riverPoint,riverCrossing,riverStrip} from '../src/riverlandscape.mjs';
import {groundHeight,roadCenter} from '../src/flight3d.mjs';

test('Misty River has a real curved stream crossing the existing forest road',()=>{
  const a=riverPoint(0),b=riverPoint(1),cross=riverCrossing();
  assert.ok(a.x<roadCenter(RIVER.z)-200);
  assert.ok(b.x>roadCenter(RIVER.z)+200);
  assert.ok(Math.abs(cross.x-roadCenter(RIVER.z))<.001);
  assert.ok(Math.abs(cross.z-RIVER.z)<10);
  assert.equal(cross.span,37);
  assert.ok(Math.abs(riverPoint(.25).z-riverPoint(.75).z)>3);
});
test('stream is a feathered continuous terrain-following ribbon, not huge flat slabs',()=>{
  const g=riverStrip(groundHeight);
  assert.equal(g.positions.length,(RIVER.samples+1)*7*3);
  assert.equal(g.indices.length,RIVER.samples*6*6);
  assert.equal(g.alphas.length,(RIVER.samples+1)*7);
  assert.equal(Math.max(...g.alphas),.9);
  assert.equal(Math.min(...g.alphas),0);
  assert.ok(g.positions.every(Number.isFinite));
  assert.ok(g.indices.every(x=>x>=0&&x<g.positions.length/3));
});
test('river generation remains deterministic and bounded outside target gameplay',()=>{
  const a=riverStrip(()=>5),b=riverStrip(()=>5);
  assert.deepEqual(a,b);
  assert.ok(a.positions.some((v,i)=>i%3===2&&v>760));
  assert.ok(a.positions.every((v,i)=>i%3!==1||v===5.62));
});

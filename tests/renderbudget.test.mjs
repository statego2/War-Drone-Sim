import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrimitiveGeometryPool} from '../src/geometrypool.mjs';
import {createRenderBudget} from '../src/renderbudget.mjs';

test('identical target primitives share geometry, different sizes do not',()=>{
  let count=0,disposals=0;
  const pool=createPrimitiveGeometryPool({
    box:(...dimensions)=>({dimensions,dispose:()=>disposals++ ,userData:{},id:++count}),
    cylinder:(...dimensions)=>({dimensions,dispose:()=>disposals++,userData:{},id:++count})
  });
  const tank=pool.box(5,1,9);
  for(let i=0;i<100;i++)assert.equal(pool.box(5,1,9),tank);
  assert.notEqual(pool.box(5,2,9),tank);
  assert.equal(pool.cylinder(.5,.55,9),pool.cylinder(.5,.55,9));
  assert.equal(pool.stats.total,3);
  assert.equal(tank.userData.sharedPrimitive,true);
  assert.throws(()=>pool.box(0,1,1),RangeError);
  pool.dispose();assert.equal(disposals,3);
  assert.equal(pool.stats.total,0);
});
test('render budget decreases pixel cost after sustained slow frames',()=>{
  const q=createRenderBudget({initialDpr:1.4,maxDpr:1.6,minDpr:.85,sampleCount:8,cooldownWindows:1});
  let changed=null;for(let i=0;i<8;i++)changed=q.sample(37);
  assert.equal(changed,1.26);
  assert.equal(q.stats.p75,37);
  for(let i=0;i<8;i++)assert.equal(q.sample(45),null,'cooldown prevents oscillation');
  for(let i=0;i<8;i++)changed=q.sample(40);
  assert.equal(changed,1.12);
  assert.ok(q.dpr>=.85);
});
test('fast frames can recover sharpness but never exceed device cap',()=>{
  const q=createRenderBudget({initialDpr:1,maxDpr:1.15,minDpr:.85,sampleCount:8,cooldownWindows:0});
  for(let k=0;k<12;k++)for(let i=0;i<8;i++)q.sample(12);
  assert.equal(q.dpr,1.15);
  for(let i=0;i<8;i++)q.sample(23);
  assert.equal(q.dpr,1.15,'ordinary stable frames hold quality');
});
test('pause, background gaps and unbounded frame values do not reduce resolution',()=>{
  const q=createRenderBudget({initialDpr:1.2,sampleCount:8});
  for(let i=0;i<200;i++) {
    q.sample(33,false);q.sample(999);
    q.sample(NaN);q.sample(0);
  }
  assert.equal(q.stats.pending,0);
  assert.equal(q.dpr,1.2);
  q.sample(35);q.reset();
  assert.equal(q.stats.pending,0);
});

test('active software-WebGL 5fps frames can downscale resolution instead of being ignored',()=>{
  const q=createRenderBudget({initialDpr:1.4,sampleCount:8,cooldownWindows:0});
  let changed=null;
  for(let i=0;i<8;i++)changed=q.sample(200,true);
  assert.equal(changed,1.26);
  assert.equal(q.stats.p75,200);
  assert.equal(q.sample(500,true),null,'large suspended-frame gap is still discarded');
});

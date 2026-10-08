import test from 'node:test';
import assert from 'node:assert/strict';
import {TUNE,makeWorld,newRun,step,vehicleX} from '../src/model.mjs';

test('world layout is reproducible and keeps the road corridor open',()=>{
  assert.deepEqual(makeWorld(32),makeWorld(32));
  assert.notDeepEqual(makeWorld(32),makeWorld(33));
  assert.equal(makeWorld(32).trees.every(tree=>Math.abs(tree.x-(1.4*Math.sin(tree.z*.018)+.65*Math.sin(tree.z*.045)))>3.8),true);
});
test('flight is frame independent within practical render rates',()=>{
  const a=newRun(),b=newRun();for(let i=0;i<120;i++)step(a,{x:.3,y:-.25},1/60);for(let i=0;i<60;i++)step(b,{x:.3,y:-.25},1/30);
  assert.ok(Math.abs(a.x-b.x)<.18);assert.ok(Math.abs(a.y-b.y)<.18);assert.ok(Math.abs(a.z-b.z)<.01);
});
test('touch intent moves sideways and changes height inside safe bounds',()=>{
  const run=newRun();for(let i=0;i<70;i++)step(run,{x:1,y:-1},1/60);
  assert.ok(run.x>5);assert.equal(run.y,TUNE.minY);
});
test('vehicle contact resolves once, awards score, then freezes outcome',()=>{
  const run=newRun();run.z=TUNE.targetZ-2;run.x=vehicleX(run.time);run.y=2;run.world.trees=[];
  step(run,{x:0,y:0},.04);assert.equal(run.result,'hit');assert.ok(run.score>=100);
  const score=run.score,z=run.z;step(run,{x:1,y:1},.04);assert.equal(run.score,score);assert.equal(run.z,z);
});
test('tree and missed target have distinct failure outcomes',()=>{
  const tree=newRun();tree.world.trees=[{x:0,z:1,height:12,radius:1.5}];step(tree,{x:0,y:0},.05);assert.equal(tree.result,'tree');
  const miss=newRun();miss.world.trees=[];miss.z=TUNE.targetZ+11.5;miss.y=8;step(miss,{x:0,y:0},.05);assert.equal(miss.result,'miss');
});

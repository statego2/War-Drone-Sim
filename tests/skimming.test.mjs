import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSkimState,stepSkim} from '../src/skimming.mjs';

const valid={height:21,speed:55,gesture:.55};
function fly(state,frames,dt=1/60){
  const rewards=[];
  for(let i=0;i<frames;i++){
    const x=stepSkim(state,{...valid,dx:55*dt,dz:0},dt);
    if(x)rewards.push(x);
  }
  return rewards;
}
test('actively flying just over forest earns a few small positive flow rewards',()=>{
  const s=makeSkimState(),rewards=fly(s,900);
  assert.equal(rewards.length,5,'do not farm infinite points from repetitive circles');
  assert.deepEqual(rewards.map(r=>r.points),[15,15,20,20,20]);
  assert.equal(rewards[0].label,'TREELINE SKIM');
  assert.equal(rewards[2].label,'FOREST FLOW');
});
test('stationary, hands-off cruise, collision altitude and huge height get nothing',()=>{
  for(const patch of [{gesture:0},{height:4},{height:80},{speed:8},{dx:0,dz:0}]){
    const s=makeSkimState();
    for(let i=0;i<600;i++)stepSkim(s,{...valid,dx:.91,...patch},1/60);
    assert.equal(s.awards,0,JSON.stringify(patch));
  }
});
test('dropping out of flight band resets progress but never erases earned awards',()=>{
  const s=makeSkimState();
  const a=fly(s,200);
  assert.equal(a.length,2);
  assert.equal(stepSkim(s,{...valid,height:60},1/60),null);
  assert.equal(s.seconds,0);assert.equal(s.meters,0);assert.equal(s.awards,2);
  const b=fly(s,100);assert.equal(b.length,1);
  assert.equal(b[0].points,20);
});
test('reward tuning is sufficiently close across 30 and 60 frames per second',()=>{
  const a=fly(makeSkimState(),120,1/30);
  const b=fly(makeSkimState(),240,1/60);
  assert.deepEqual(a.map(x=>x.points),b.map(x=>x.points));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createFrameClock} from '../src/frameclock.mjs';

function runAtFps(fps) {
  const clock=createFrameClock();
  let elapsed=0;
  for(let i=0;i<fps*4;i++) elapsed+=clock.sample(1/fps,true);
  return elapsed;
}
test('60, 30 and 10fps keep the same elapsed game time over four seconds',()=>{
  for(const fps of [60,30,10]) assert.ok(Math.abs(runAtFps(fps)-4)<1e-8,String(fps));
});
test('low 5fps play is not dilated by the former 0.1-second render frame clamp',()=>{
  assert.ok(Math.abs(runAtFps(5)-4)<1e-8);
});
test('one brief render stall permits bounded recovery on subsequent frames',()=>{
  const clock=createFrameClock();
  const delayed=clock.sample(.5);
  assert.equal(delayed,.22);
  assert.ok(clock.backlog>0 && clock.backlog<=.14+1e-8);
  const follow=clock.sample(1/60);
  assert.ok(follow>.1 && follow<=.22);
  assert.ok(clock.backlog>=0 && clock.backlog<=.36);
});
test('repeated large WebGL frames cannot accumulate unbounded spiral-of-death work',()=>{
  const clock=createFrameClock();
  for(let i=0;i<100;i++){
    const dt=clock.sample(.3);
    assert.ok(dt<=.22 && clock.backlog<=.36);
  }
});
test('paused, invisible or invalid time cannot advance flight simulation on resume',()=>{
  const clock=createFrameClock();
  clock.sample(.6);
  assert.ok(clock.backlog>0);
  assert.equal(clock.sample(.02,false),.02);
  assert.equal(clock.backlog,0);
  assert.equal(clock.sample(20),0);
  assert.equal(clock.sample(Number.NaN),0);
  assert.equal(clock.sample(-1),0);
  assert.equal(clock.backlog,0);
  assert.equal(clock.sample(.016),.016);
});
test('invalid pacing configurations are rejected',()=>{
  assert.throws(()=>createFrameClock({maxStep:.5,maxBacklog:.3}),RangeError);
  assert.throws(()=>createFrameClock({maxStep:-1}),RangeError);
});

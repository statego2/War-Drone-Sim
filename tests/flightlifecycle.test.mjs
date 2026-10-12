import test from 'node:test';
import assert from 'node:assert/strict';
import {pauseFlightState,resumeFlightState} from '../src/flightlifecycle.mjs';

test('app switch pauses normal flight without spending a drone',()=>{
  const paused=pauseFlightState('flying');
  assert.deepEqual(paused,{mode:'paused',resumeMode:'flying'});
  assert.deepEqual(resumeFlightState(paused.mode,paused.resumeMode),{mode:'flying'});
});
test('app switch during the subsecond impact resumes the same unresolved effect',()=>{
  const paused=pauseFlightState('impact');
  assert.deepEqual(paused,{mode:'paused',resumeMode:'impact'});
  assert.deepEqual(resumeFlightState(paused.mode,paused.resumeMode),{mode:'impact'});
});
test('lost WebGL context blocks resume until graphics have recovered',()=>{
  assert.equal(resumeFlightState('paused','flying',false),null);
  assert.deepEqual(resumeFlightState('paused','flying',true),{mode:'flying'});
  assert.equal(pauseFlightState('paused'),null);
  assert.equal(pauseFlightState('complete'),null);
  assert.equal(resumeFlightState('complete','flying'),null);
});

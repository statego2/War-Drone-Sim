import test from 'node:test';
import assert from 'node:assert/strict';
import {forestChasePitch} from '../src/cameracomposition.mjs';
test('portrait chase scans the forest instead of leaving half of the screen as sky',()=>{
  const low=forestChasePitch({height:25,pitch:0});
  const high=forestChasePitch({height:110,pitch:0});
  assert.ok(low<-.16 && low>-.25);
  assert.ok(high<low-.04);
});
test('a steep dive points strongly down, while reverse recovers the horizon',()=>{
  const diving=forestChasePitch({height:60,pitch:1.35});
  const reversing=forestChasePitch({height:60,pitch:-1.1,pullback:1});
  assert.ok(diving<-.9);assert.ok(reversing>diving+.8);
  assert.ok(reversing<=.39);
});
test('sensible finite view at all tested attitudes and altitudes',()=>{
  for(const pitch of [-1.16,0,1.45])for(const height of [0,20,80,5000]){
    const angle=forestChasePitch({height,pitch,pullback:.2});
    assert.ok(Number.isFinite(angle)&&angle>=-1.04&&angle<=.39);
  }
});

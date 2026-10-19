import test from 'node:test';
import assert from 'node:assert/strict';
import {forestChasePitch} from '../src/cameracomposition.mjs';

test('portrait chase view favors trees, terrain and hidden clearings over sky',()=>{
  const low=forestChasePitch({height:25,pitch:0});
  const high=forestChasePitch({height:110,pitch:0});
  assert.ok(low<-.16&&low>-.25);
  assert.ok(high<low-.04,'higher altitude reveals more forest instead of empty sky');
});
test('a committed dive aims strongly down, reverse recovers horizon',()=>{
  const diving=forestChasePitch({height:60,pitch:1.35});
  const reverse=forestChasePitch({height:60,pitch:-1.1,pullback:1});
  assert.ok(diving<-.9);
  assert.ok(reverse>diving+.8);
  assert.ok(reverse<=.39);
});
test('camera composition remains finite across all legal flight attitudes',()=>{
  for(const pitch of [-1.16,0,1.45])
    for(const height of [0,20,80,5000]){
      const a=forestChasePitch({height,pitch,pullback:.2});
      assert.ok(Number.isFinite(a)&&a>=-1.04&&a<=.39);
    }
});

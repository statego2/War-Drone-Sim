import test from 'node:test';
import assert from 'node:assert/strict';
import {canopyWindStrength,canopyWindPhase} from '../src/canopywind.mjs';

test('three forest identities have gently different crown movement',()=>{
  const pine=canopyWindStrength(200),river=canopyWindStrength(720),ridge=canopyWindStrength(1150);
  assert.ok(river<pine&&ridge>pine);
  for(const z of [0,400,519,520,570,800,920,970,1100,2000])
    assert.ok(canopyWindStrength(z)>=0&&canopyWindStrength(z)<.04);
});
test('wind moves continuously between environments and honors reduced motion',()=>{
  for(let z=0;z<=1500;z+=.5){
    assert.ok(Math.abs(canopyWindStrength(z+.5)-canopyWindStrength(z))<.001);
    assert.equal(canopyWindStrength(z,true),0);
  }
  assert.equal(canopyWindPhase(-10),0);
  assert.equal(canopyWindPhase(NaN),0);
  assert.equal(canopyWindPhase(5),5);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {beaconAppearance} from '../src/targetreadability.mjs';

const target={id:2,x:0,y:5,z:120,sector:0,destroyed:false};
const player={x:0,y:25,z:0};
test('world objective glint appears near playable empty props, not everywhere',()=>{
  const near=beaconAppearance(target,player,0,0);
  assert.equal(near.visible,true);
  assert.ok(near.opacity>.4 && near.opacity<=.67);
  assert.ok(near.size>=15 && near.size<19);
  assert.equal(beaconAppearance({...target,z:800},player,0).visible,false);
  assert.equal(beaconAppearance({...target,y:25,z:4},player,0).visible,false);
});
test('completed and inactive sectors never show new in-world glints',()=>{
  assert.equal(beaconAppearance({...target,destroyed:true},player,0).visible,false);
  assert.equal(beaconAppearance({...target,sector:1},player,0).visible,false);
});
test('reduced-motion signal is stable and time-independent',()=>{
  const a=beaconAppearance(target,player,0,0,true);
  const b=beaconAppearance(target,player,0,88,true);
  assert.deepEqual(a,b);
  const c=beaconAppearance(target,player,0,88,false);
  assert.ok(c.opacity>=0&&c.opacity<=.67);
});

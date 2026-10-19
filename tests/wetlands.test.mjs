import test from 'node:test';
import assert from 'node:assert/strict';
import {inMistyWetland,channelPoint,channelWidth,channelClearance,tileHasWetland,STREAM_START,STREAM_END} from '../src/wetlands.mjs';
import {TILE,roadCenter} from '../src/flight3d.mjs';

test('the river biome has an actual continuous offroad creek, not just a palette',()=>{
  assert.ok(tileHasWetland(1,TILE)&&tileHasWetland(2,TILE)&&tileHasWetland(3,TILE));
  assert.equal(tileHasWetland(0,TILE),false);
  for(let z=STREAM_START;z<=STREAM_END;z+=2){
    const p=channelPoint(z);
    assert.ok(p.x-roadCenter(z)>100,'water never cuts straight across the game asphalt');
    assert.ok(channelWidth(z)>4&&channelWidth(z)<7);
    assert.equal(channelClearance(p.x,z),true);
    assert.equal(channelClearance(p.x+30,z),false);
  }
});
test('river bank route is smooth across tile boundaries and independent of frame rate',()=>{
  for(const z of [639.99,640,640.01,959.99,960,960.01]){
    const a=channelPoint(z),b=channelPoint(z+.01);
    assert.ok(Math.abs(a.x-b.x)<.5,'no stream geometry teleport at sector boundaries');
  }
  assert.equal(inMistyWetland(400),false);
  assert.equal(inMistyWetland(700),true);
  assert.equal(inMistyWetland(1100),false);
});

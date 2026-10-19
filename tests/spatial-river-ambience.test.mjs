import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveLandscapeMix,deriveFlightMix} from '../src/audio3d.mjs';
import {channelPoint} from '../src/wetlands.mjs';

test('flying near the hidden river is rewarded with gentle natural sound',()=>{
  const z=730,x=channelPoint(z).x;
  const near=deriveLandscapeMix(z,12,x);
  const road=deriveLandscapeMix(z,12,x-125);
  const air=deriveLandscapeMix(z,300,x);
  assert.ok(near.streamGain>.018&&near.streamGain<=.022);
  assert.equal(road.streamGain,0);
  assert.equal(air.streamGain,0);
  assert.ok(near.streamLowpass>road.streamLowpass);
});
test('forest sound is bounded and changes smoothly with distance',()=>{
  const z=710,center=channelPoint(z).x;
  let previous=deriveLandscapeMix(z,30,center).streamGain;
  for(let offset=1;offset<=140;offset++){
    const value=deriveLandscapeMix(z,30,center+offset);
    assert.ok(value.streamGain>=0&&value.streamGain<=.022);
    assert.ok(Math.abs(value.streamGain-previous)<.0015);
    previous=value.streamGain;
  }
  assert.equal(deriveLandscapeMix(220,18,0).streamGain,0);
  assert.equal(deriveLandscapeMix(1150,18,0).streamGain,0);
});
test('existing quiet rotor-free flight layer is unchanged',()=>{
  const mix=deriveFlightMix(55,30,{verticalSpeed:-4,throttle:.72});
  assert.ok(mix.windGain<.15&&mix.glideGain<.1);
  assert.ok(deriveLandscapeMix(720,20).streamGain>0,
    'existing landscape mixing calls remain backward compatible');
});

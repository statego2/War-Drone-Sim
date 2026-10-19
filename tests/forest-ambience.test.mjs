import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveLandscapeMix} from '../src/audio3d.mjs';

test('three forest environments have differentiated yet quiet natural sound beds',()=>{
  const pine=deriveLandscapeMix(280,25);
  const river=deriveLandscapeMix(710,25);
  const ridge=deriveLandscapeMix(1130,25);
  assert.equal(pine.streamGain,0);
  assert.ok(river.streamGain>.015&&river.streamGain<.04,'river is quiet, not an annoying constant tone');
  assert.equal(ridge.streamGain,0);
  assert.ok(ridge.highlandWind>.01);
  assert.ok(ridge.birdDelay>pine.birdDelay,'highland birds are more occasional');
  assert.ok(river.birdDelay<pine.birdDelay,'river woodland sounds lively');
});
test('audio environment crossfades smoothly and fades river wash at altitude',()=>{
  for(const z of [470,500,520,540,920,970,1000]){
    const a=deriveLandscapeMix(z,35),b=deriveLandscapeMix(z+.01,35);
    assert.ok(Math.abs(a.streamGain-b.streamGain)<.001);
    assert.ok(Math.abs(a.highlandWind-b.highlandWind)<.001);
  }
  assert.ok(deriveLandscapeMix(730,25).streamGain>deriveLandscapeMix(730,400).streamGain);
  assert.deepEqual(deriveLandscapeMix(NaN),deriveLandscapeMix(0));
});

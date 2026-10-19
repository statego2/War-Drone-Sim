import test from 'node:test';
import assert from 'node:assert/strict';
import {CLOUD_VISUAL} from '../src/atmosphere3d.mjs';
import {BIOMES} from '../src/biomes.mjs';

test('portrait sky clouds stay small, sparse and unobtrusive',()=>{
  assert.ok(CLOUD_VISUAL.count<=18);
  assert.ok(CLOUD_VISUAL.maxWidth<=600);
  assert.ok(CLOUD_VISUAL.aspect<=.3);
  assert.ok(CLOUD_VISUAL.opacity<.50);
  assert.ok(CLOUD_VISUAL.minAltitude>=400);
});
test('every biome still has distinctive sky colors to reveal new scenery',()=>{
  const keys=['horizon','zenith','fog'];
  for(const key of keys)assert.equal(new Set(BIOMES.map(b=>b[key])).size,3);
});

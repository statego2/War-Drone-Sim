import test from 'node:test';
import assert from 'node:assert/strict';
import {impactEnvelope,impactPalette} from '../src/impactfx3d.mjs';

test('vehicle impacts reward with warm color; misses remain muted',()=>{
  const hit=impactPalette('vehicle'),miss=impactPalette('ground');
  assert.notDeepEqual(hit,miss);
  assert.equal(hit.core,0xfff3c4);
  assert.equal(miss.outer,0x837862);
  assert.deepEqual(impactPalette('tree'),miss);
});

test('soft short flash never blocks the next one-second retry',()=>{
  const atStart=impactEnvelope(0,'vehicle');
  const later=impactEnvelope(.20,'vehicle');
  assert.ok(atStart.flash>later.flash);
  assert.equal(impactEnvelope(1,'vehicle').active,false);
  assert.equal(impactEnvelope(.99,'vehicle').flash,0);
  assert.equal(impactEnvelope(.99,'vehicle').cameraKick,0);
});

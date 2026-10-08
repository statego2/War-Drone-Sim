import test from 'node:test';
import assert from 'node:assert/strict';
import { impactEnvelope } from '../src/impactfx3d.mjs';

test('impact flash is immediate, decays and releases the pool within one second', () => {
  const start=impactEnvelope(0), middle=impactEnvelope(.17), end=impactEnvelope(1);
  assert.equal(start.active,true);
  assert.ok(start.flash>middle.flash && middle.flash>end.flash);
  assert.equal(end.active,false);
  assert.equal(end.cameraKick,0);
  assert.equal(end.sparks,0);
});

test('vehicle impacts have larger visual punch than ordinary ground contact', () => {
  const vehicle=impactEnvelope(.08,'vehicle');
  const ground=impactEnvelope(.08,'ground');
  assert.ok(vehicle.flash>ground.flash);
  assert.ok(vehicle.shock>ground.shock);
  assert.ok(vehicle.cameraKick>ground.cameraKick);
});

test('impact envelope remains finite and nonnegative for all frames', () => {
  for(let frame=-1;frame<=90;frame++){
    const v=impactEnvelope(frame/60);
    for(const n of Object.values(v))if(typeof n==='number'){
      assert.ok(Number.isFinite(n) && n>=0);
    }
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {forestTrace,explorationHint} from '../src/exploration.mjs';
import {makeEncounter} from '../src/encounter.mjs';

test('quiet, faint and nearby clues guide a search without an exact location',()=>{
  const e=makeEncounter(),v=e.vehicles[0];
  const position={x:v.x,y:v.y+30,heading:Math.PI/2};
  const distant=forestTrace(e,{...position,z:v.z-350});
  const faint=forestTrace(e,{...position,z:v.z-135});
  const near=forestTrace(e,{...position,z:v.z-65});
  assert.equal(distant.strength,'quiet');
  assert.equal(faint.strength,'trace');
  assert.equal(near.strength,'near');
  for(const hint of [distant,faint,near]){
    assert.match(hint.label,/PINES/);
    assert.doesNotMatch(hint.label,/\d+/,'no exact distance/coordinates escape');
    assert.ok(hint.label.length<25,'clues fit a compact portrait HUD');
  }
});
test('oblique and rear passes do not magically disclose direction',()=>{
  const e=makeEncounter(),v=e.vehicles[1];
  const a=forestTrace(e,{x:v.x,y:v.y+20,z:v.z-120,heading:0});
  const b=forestTrace(e,{x:v.x,y:v.y+20,z:v.z-120,heading:Math.PI});
  assert.deepEqual(a,b);
  assert.ok(['trace','near'].includes(a.strength));
});
test('a fully discovered area no longer claims unknown traces',()=>{
  const e=makeEncounter();
  for(const v of e.vehicles.filter(v=>v.sector===0))e.discovered.add(v.id);
  const hint=explorationHint(e,{x:0,y:60,z:200,heading:0});
  assert.equal(hint.signal.strength,'quiet');
  assert.equal(hint.revealed,5);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEncounter,spawnForNextTarget,activeSectorIndex,applyContact} from '../src/encounter.mjs';
import {discoverNearby,explorationHint} from '../src/exploration.mjs';
import {guidanceFor} from '../src/arcadeflow.mjs';

test('the player may explore river valley without first destroying every pine target',()=>{
  const e=makeEncounter(),v=e.vehicles.find(x=>x.sector===1);
  const view={x:v.x,y:v.y+16,z:v.z-36,heading:0};
  const spotted=discoverNearby(e,view);
  assert.ok(spotted.includes(v.id),'physically entering valley reveals local objects');
  assert.equal(activeSectorIndex(e),0,'unfinished first area remains part of the world');
  assert.equal(explorationHint(e,view).sector,1);
  const guide=guidanceFor(e,view,e.discovered,1);
  assert.ok(guide?.id===v.id||e.discovered.has(guide?.id));
});
test('off-route exploration checkpoints preserve the physical area on drone retry',()=>{
  const e=makeEncounter();
  const standard=spawnForNextTarget(e);
  const valley=spawnForNextTarget(e,1);
  assert.equal(valley.sector,1);
  assert.ok(valley.z>standard.z+300);
  const ridge=spawnForNextTarget(e,2);
  assert.equal(ridge.sector,2);
  for(const v of e.vehicles.filter(v=>v.sector===1))applyContact(e,{type:'vehicle',id:v.id});
  assert.equal(spawnForNextTarget(e,1).sector,0,
    'when preferred area is cleared, safely continue from oldest uncleared area');
});
test('landscape-specific clues still work if nothing in that area has been found',()=>{
  const e=makeEncounter();
  assert.match(explorationHint(e,{z:250}).clue,/PINES/);
  assert.match(explorationHint(e,{z:700}).clue,/RIVER/);
  assert.match(explorationHint(e,{z:1110}).clue,/RIDGE/);
  assert.equal(guidanceFor(e,{x:0,y:60,z:700,heading:0},e.discovered,1),null);
});

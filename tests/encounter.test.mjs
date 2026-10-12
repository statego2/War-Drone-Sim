import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEncounter, resolveContact, applyContact, nextDrone, LEVEL_SECTORS, LEVEL_TARGETS, activeSectorIndex, sectorProgress, levelComplete, clearingRadius } from '../src/encounter.mjs';

test('fast crossing produces exactly one persistent vehicle hit', () => {
  const e=makeEncounter(),v=e.vehicles[0];
  const crossing=resolveContact(e,{x:v.x,y:v.y,z:v.z-18},{x:v.x,y:v.y,z:v.z+18});
  assert.deepEqual({type:crossing.type,id:crossing.id},{type:'vehicle',id:0});
  assert.equal(applyContact(e,crossing),true);
  assert.equal(applyContact(e,crossing),false);
  assert.equal(e.hits,1);
  assert.equal(resolveContact(e,{x:v.x,y:v.y,z:v.z-18},{x:v.x,y:v.y,z:v.z+18}),null);
  nextDrone(e);
  assert.equal(e.vehicles[0].destroyed,true);
  assert.equal(e.drones,2);
});

test('ground contact gives a retry, all level vehicles remain persistent', () => {
  let e=makeEncounter();
  assert.deepEqual(resolveContact(e,{x:0,y:10,z:0},{x:0,y:0,z:1},true),{type:'ground'});
  nextDrone(e);assert.equal(e.drones,2);assert.equal(e.hits,0);
  for(const v of e.vehicles){assert.equal(applyContact(e,{type:'vehicle',id:v.id}),true);}
  nextDrone(e);
  assert.equal(e.round,1);assert.equal(e.hits,LEVEL_TARGETS);assert.equal(e.drones,3);
  assert.equal(levelComplete(e),true);
});

test('three distinct forest sectors advance as the authored level is cleared', () => {
  const e=makeEncounter();
  assert.equal(LEVEL_SECTORS.length,3);
  assert.equal(LEVEL_TARGETS,16);
  assert.equal(new Set(e.vehicles.map(v=>v.id)).size,16);
  assert.deepEqual(sectorProgress(e),{hits:0,total:5});
  assert.equal(activeSectorIndex(e),0);
  assert.equal(clearingRadius(700),69);
  assert.equal(clearingRadius(900),15);
  for(const v of e.vehicles.filter(v=>v.sector===0)) applyContact(e,{type:'vehicle',id:v.id});
  assert.equal(activeSectorIndex(e),1);
  assert.equal(sectorProgress(e).total,5);
  // A distant section can be visited early, without erasing prior wrecks.
  const last=e.vehicles.at(-1);
  applyContact(e,{type:'vehicle',id:last.id});
  assert.equal(activeSectorIndex(e),1);
  assert.equal(levelComplete(e),false);
  for(const v of e.vehicles.filter(v=>!v.destroyed)) applyContact(e,{type:'vehicle',id:v.id});
  assert.equal(levelComplete(e),true);
  assert.deepEqual(sectorProgress(e),{hits:6,total:6});
});

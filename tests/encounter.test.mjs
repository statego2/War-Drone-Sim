import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEncounter, resolveContact, applyContact, nextDrone } from '../src/encounter.mjs';

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

test('ground contact gives a retry, all three vehicles advance the encounter', () => {
  let e=makeEncounter();
  assert.deepEqual(resolveContact(e,{x:0,y:10,z:0},{x:0,y:0,z:1},true),{type:'ground'});
  nextDrone(e);assert.equal(e.drones,2);assert.equal(e.hits,0);
  for(const v of e.vehicles){assert.equal(applyContact(e,{type:'vehicle',id:v.id}),true);}
  e=nextDrone(e);
  assert.equal(e.round,2);assert.equal(e.hits,0);assert.equal(e.drones,1);
});

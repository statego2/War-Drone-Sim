import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEncounter, updateEncounter, spawnForNextTarget, resolveContact, applyContact,
  activeSectorIndex, levelComplete } from '../src/encounter.mjs';
import { makeScorecard, registerResult, guidanceFor } from '../src/arcadeflow.mjs';

test('moving empty props travel along short bounded authored paths', () => {
  const e = makeEncounter();
  const staticProp = e.vehicles.find(v => !v.moving);
  const moving = e.vehicles.find(v => v.moving);
  const original = { x: moving.x, z: moving.z };
  updateEncounter(e, .05);
  assert.equal(staticProp.x, staticProp.homeX);
  assert.ok(Math.abs(moving.x-moving.homeX) < 9);
  assert.ok(Math.abs(moving.z-moving.homeZ) < 13);
  assert.equal(moving.previousX, original.x);
  assert.equal(moving.previousZ, original.z);
  for(let i=0;i<200;i++) updateEncounter(e,.05);
  assert.ok(Math.abs(moving.x-moving.homeX) < 9);
  assert.ok(Math.abs(moving.z-moving.homeZ) < 13);
});

test('swept contact detects moving prop crossing the drone even at high frame speed', () => {
  const e=makeEncounter(), v=e.vehicles.find(v => v.moving);
  const x=v.x, y=v.y, z=v.z;
  v.previousX=x-16; v.previousY=y; v.previousZ=z;
  v.x=x+16;
  // Drone is hovering at x while the target passes through it.
  const contact=resolveContact(e,{x,y,z},{x,y,z});
  assert.equal(contact?.type,'vehicle');
  assert.equal(contact?.id,v.id);
  assert.equal(applyContact(e,contact),true);
  assert.equal(resolveContact(e,{x,y,z},{x,y,z}),null);
});

test('spawn moves closer to the earliest live target without spawning on it', () => {
  const e=makeEncounter();
  const before=spawnForNextTarget(e);
  assert.ok(before.z >= 80 && before.z < e.vehicles[0].z-70);
  for (const v of e.vehicles.filter(v=>v.sector===0)) applyContact(e,{type:'vehicle',id:v.id});
  assert.equal(activeSectorIndex(e),1);
  const after=spawnForNextTarget(e);
  assert.ok(after.z>before.z+340);
  const first=e.vehicles.find(v=>v.sector===1);
  assert.ok(first.z-after.z>70);
});

test('guidance follows surviving sector targets and points behind after overshooting', () => {
  const e=makeEncounter(), target=e.vehicles[0];
  let g=guidanceFor(e,{x:target.x,y:target.y+30,z:target.z-100,heading:0});
  assert.equal(g.sector,0);
  assert.equal(g.direction,'AHEAD');
  for(const v of e.vehicles.filter(v=>v.sector===0))applyContact(e,{type:'vehicle',id:v.id});
  const second=e.vehicles.find(v=>v.sector===1);
  g=guidanceFor(e,{x:second.x,y:second.y+30,z:second.z+120,heading:0});
  assert.equal(g.sector,1);
  assert.equal(g.direction,'BEHIND');
});

test('arcade score rewards dives and combos, miss resets chain but not score', () => {
  const c=makeScorecard();
  const fastDive={vx:0,vy:-24,vz:95,pitch:1.1};
  const ordinary={vx:0,vy:-2,vz:55,pitch:.2};
  const a=registerResult(c,true,ordinary);
  const b=registerResult(c,true,fastDive);
  assert.ok(b.points>a.points+100);
  assert.equal(c.combo,2);
  assert.equal(c.diveHits,1);
  const retained=c.points;
  registerResult(c,false,ordinary);
  assert.equal(c.points,retained);
  assert.equal(c.combo,0);
  assert.equal(c.misses,1);
  assert.equal(registerResult(c,true,ordinary).combo,1);
});

test('complete all targets including mobile units without changing level-clear semantics',()=>{
  const e=makeEncounter();
  for(let i=0;i<180;i++) updateEncounter(e,.05);
  for(const v of e.vehicles) assert.equal(applyContact(e,{type:'vehicle',id:v.id}),true);
  assert.equal(levelComplete(e),true);
});

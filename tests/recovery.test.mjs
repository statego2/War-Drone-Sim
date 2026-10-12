import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEncounter,applyContact,levelComplete} from '../src/encounter.mjs';
import {makeScorecard,registerResult} from '../src/arcadeflow.mjs';
import {redeployWithPenalty} from '../src/recovery.mjs';

test('manual redeploy consumes a drone but preserves wrecks and earned points',()=>{
  const e=makeEncounter(),s=makeScorecard();
  assert.equal(applyContact(e,{type:'vehicle',id:0}),true);
  registerResult(s,true,{vx:0,vy:-20,vz:70,pitch:1});
  const points=s.points;
  assert.ok(points>0&&s.combo===1);
  const out=redeployWithPenalty(e,s);
  assert.deepEqual(out,{ok:true,drones:2,hits:1,points});
  assert.equal(e.vehicles[0].destroyed,true);
  assert.equal(s.combo,0);
  assert.equal(s.misses,1);
});
test('cannot spend a drone after completing the level',()=>{
  const e=makeEncounter(),s=makeScorecard();
  for(const vehicle of e.vehicles)applyContact(e,{type:'vehicle',id:vehicle.id});
  assert.equal(levelComplete(e),true);
  assert.deepEqual(redeployWithPenalty(e,s),{ok:false,reason:'complete'});
  assert.equal(e.drones,1);
});
test('new playthrough can start without retaining manual redeployment',()=>{
  const e=makeEncounter(),s=makeScorecard();redeployWithPenalty(e,s);
  assert.equal(e.drones,2);
  const fresh=makeEncounter(),newScore=makeScorecard();
  assert.equal(fresh.drones,1);assert.equal(newScore.points,0);
  assert.equal(fresh.vehicles.every(v=>!v.destroyed),true);
});

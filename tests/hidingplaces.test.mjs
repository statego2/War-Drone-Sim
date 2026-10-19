import test from 'node:test';
import assert from 'node:assert/strict';
import {varyHidingPlace} from '../src/hidingplaces.mjs';
import {makeEncounter,resolveContact,applyContact,LEVEL_TARGETS} from '../src/encounter.mjs';
import {roadCenter,groundHeight} from '../src/flight3d.mjs';
test('first playable tank is fixed; all other props vary safely with the run seed',()=>{
  const baseline=makeEncounter(),e=makeEncounter(7871),f=makeEncounter(7872);
  assert.equal(e.vehicles.length,LEVEL_TARGETS);
  assert.deepEqual(e.vehicles[0],baseline.vehicles[0]);
  let changed=0,distinct=0;
  for(let i=1;i<LEVEL_TARGETS;i++){
    const v=e.vehicles[i],original=baseline.vehicles[i],other=f.vehicles[i];
    if(v.homeX!==original.homeX||v.homeZ!==original.homeZ)changed++;
    if(v.homeX!==other.homeX||v.homeZ!==other.homeZ)distinct++;
    assert.ok(Math.hypot(v.homeX-original.homeX,v.homeZ-original.homeZ)<11,
      'props stay within physically cleared staging pockets');
    assert.equal(v.kind,original.kind);
    assert.equal(v.sector,original.sector);
    assert.equal(v.id,original.id);
  }
  assert.ok(changed>=13 && distinct>=13);
});
test('fixed seeds reproduce the same scenario and all 16 impacts are reachable',()=>{
  const a=makeEncounter(38174),b=makeEncounter(38174);
  assert.deepEqual(a,b);
  for(const v of a.vehicles){
    const from={x:v.x,y:v.y,z:v.z-22},to={x:v.x,y:v.y,z:v.z+22};
    const contact=resolveContact(a,from,to);
    assert.equal(contact?.id,v.id);
    assert.equal(applyContact(a,contact),true);
  }
  assert.equal(a.hits,LEVEL_TARGETS);
});
test('placement helper has bounded offsets and never changes tutorial target',()=>{
  for(let seed=1;seed<33;seed++)for(let id=0;id<16;id++){
    const v=varyHidingPlace(id,seed);
    assert.ok(Math.abs(v.x)<=6.8&&Math.abs(v.z)<=7.8);
    if(id===0)assert.deepEqual(v,{x:0,z:0});
  }
  assert.deepEqual(varyHidingPlace(9),{x:0,z:0});
  assert.throws(()=>varyHidingPlace(-1,28),RangeError);
});

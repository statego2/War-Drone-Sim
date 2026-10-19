import test from 'node:test';
import assert from 'node:assert/strict';
import {roadCenter,groundHeight} from '../src/flight3d.mjs';
import {makeEncounter,LEVEL_TARGETS,LEVEL_SECTORS,objectiveApproachClearance,
  applyContact,levelComplete} from '../src/encounter.mjs';
import {canDiscover,discoverNearby} from '../src/exploration.mjs';
import {guidanceFor} from '../src/arcadeflow.mjs';

test('all 16 props in all three forest regions can be physically found and completed',()=>{
  const e=makeEncounter();
  let spotted=0;
  assert.equal(e.vehicles.length,LEVEL_TARGETS);
  for(const v of e.vehicles){
    const inClearing={x:v.x,y:v.y+8,z:v.z-13,heading:0};
    const fresh=discoverNearby(e,inClearing,groundHeight);
    assert.ok(fresh.includes(v.id),'player inside clearing must be able to spot prop '+v.id);
    assert.equal(e.discovered.has(v.id),true);
    const hint=guidanceFor(e,inClearing,e.discovered);
    assert.ok(hint?.distance>=0,'spotted vehicle may provide short-range gameplay guidance');
    assert.equal(applyContact(e,{type:'vehicle',id:v.id}),true);
    spotted++;
    assert.equal(e.hits,spotted);
  }
  assert.equal(levelComplete(e),true);
  assert.equal(e.discovered.size,LEVEL_TARGETS);
  assert.deepEqual(LEVEL_SECTORS.map(s=>s.targets.length),[5,5,6]);
});

test('15 optional deep locations remain genuinely hidden from straight road flyovers',()=>{
  const e=makeEncounter();
  for(const v of e.vehicles.slice(1)){
    assert.ok(Math.abs(v.offset)>=36,'later props must be in woods outside central corridor');
    for(const dz of [-55,-25,0,25]){
      const z=v.z+dz;
      const road={x:roadCenter(z),z,y:v.y+26,heading:0};
      assert.equal(canDiscover(v,road,groundHeight),false,
        'road should not grant clairvoyance for prop '+v.id);
    }
  }
  assert.equal(e.vehicles[0].offset,-12,'keep first learnable target approach');
});

test('all hidden clearings have an uninterrupted authored forest-entrance corridor',()=>{
  const e=makeEncounter();
  for(const v of e.vehicles){
    const startZ=v.homeZ-36;
    const startX=roadCenter(startZ)+Math.sign(v.offset)*7;
    for(let i=0;i<=24;i++){
      const a=i/24;
      const x=startX+(v.homeX-startX)*a;
      const z=startZ+(v.homeZ-startZ)*a;
      assert.equal(objectiveApproachClearance(x,z),true,
        'woodland entrance has planned tree clearance at prop '+v.id+' step '+i);
    }
  }
});

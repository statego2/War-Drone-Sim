import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEncounter, updateEncounter, resolveContact, applyContact, nextDrone,
  spawnForNextTarget, activeSectorIndex, sectorProgress, levelComplete, LEVEL_TARGETS} from '../src/encounter.mjs';
import {makeScorecard, registerResult, guidanceFor} from '../src/arcadeflow.mjs';
import {chooseContact, resolveTreeContact} from '../src/hazards.mjs';

test('scripted full forest playthrough: 16 impact successes, checkpoint route and one miss',()=>{
  const e=makeEncounter(), score=makeScorecard();
  const completed=[];
  let lastSector=0;
  for(let index=0;index<LEVEL_TARGETS;index++){
    const target=e.vehicles[index];
    const cp=spawnForNextTarget(e);
    assert.ok(target.z-cp.z>=68,'checkpoint gives enough room to approach');
    assert.ok(cp.z<=target.z,'checkpoint is not beyond next unbroken prop');

    // One deliberate failure tests the unbroken automatic replay loop.
    if(index===4){
      const miss=chooseContact(null,null,true);
      assert.equal(miss.type,'ground');
      registerResult(score,false);
      assert.equal(score.combo,0);
      nextDrone(e);
    }

    updateEncounter(e,.05);
    const from={x:target.x,y:target.y,z:target.z-18};
    const to={x:target.x,y:target.y,z:target.z+18};
    const collision=resolveContact(e,from,to,false);
    assert.equal(collision?.type,'vehicle');
    assert.equal(collision?.id,target.id);
    const trees=resolveTreeContact(from,to,[]);
    assert.equal(chooseContact(collision,trees)?.id,target.id);
    assert.equal(applyContact(e,collision),true);
    assert.equal(applyContact(e,collision),false,'no double-hit');
    const award=registerResult(score,true,{vx:0,vy:-21,vz:85,pitch:.96});
    assert.ok(award.points>=200 && award.cleanDive);
    completed.push(target.id);
    assert.equal(e.hits,index+1);
    assert.equal(e.vehicles.filter(v=>v.destroyed).length,index+1);
    const sector=activeSectorIndex(e);
    assert.ok(sector>=lastSector);
    lastSector=sector;
    const guidance=guidanceFor(e,{x:target.x,y:target.y+30,z:target.z,heading:0});
    if(index<LEVEL_TARGETS-1) assert.ok(guidance,'player always knows a surviving destination');
    if(!levelComplete(e))nextDrone(e);
  }
  assert.deepEqual(completed,Array.from({length:16},(_,i)=>i));
  assert.equal(levelComplete(e),true);
  assert.equal(e.hits,16);
  assert.equal(e.drones,17,'one drone per success and one extra ground miss');
  assert.equal(score.hits,16);
  assert.equal(score.misses,1);
  assert.equal(score.diveHits,16);
  assert.equal(score.bestCombo,6,'the arcade score deliberately caps the displayed combo multiplier');
  assert.ok(score.points>3000);
  assert.deepEqual(sectorProgress(e),{hits:6,total:6});
});

test('a separate replay resets all level and arcade scoring state',()=>{
  const a=makeEncounter(),b=makeEncounter();
  const scoreA=makeScorecard(),scoreB=makeScorecard();
  applyContact(a,{type:'vehicle',id:0});
  registerResult(scoreA,true,{vy:-18,vz:70,pitch:.9});
  assert.equal(a.hits,1);
  assert.equal(b.hits,0);
  assert.equal(b.drones,1);
  assert.equal(scoreB.points,0);
  assert.ok(scoreA.points>0);
  assert.notEqual(a.vehicles[0],b.vehicles[0],'playthroughs are independently allocated');
});

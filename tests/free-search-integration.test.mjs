import test from 'node:test';
import assert from 'node:assert/strict';
import {makeEncounter,resolveContact,applyContact,levelComplete} from '../src/encounter.mjs';
import {discoverNearby,explorationHint,forestTrace} from '../src/exploration.mjs';
import {makeScorecard,registerExploration,registerResult,guidanceFor} from '../src/arcadeflow.mjs';

test('scripted non-linear 16-target forest search can finish a varied hidden-world replay',()=>{
  const e=makeEncounter(730221),score=makeScorecard();
  const order=[8,0,15,2,11,4,7,12,1,14,6,3,13,5,10,9];
  assert.equal(new Set(order).size,16);
  for(const id of order){
    const v=e.vehicles[id];
    const player={x:v.x,y:v.y+8,z:v.z-12,heading:0};
    const clue=explorationHint(e,player);
    assert.equal(clue.sector,v.sector);
    if(!e.discovered.has(id)){
      const discovered=discoverNearby(e,player);
      assert.ok(discovered.includes(id),'close exploration finds concealed prop '+id);
      const scout=registerExploration(score,'vehicle',discovered.length);
      assert.ok(scout.points>=35);
    }
    const guide=guidanceFor(e,player,e.discovered,v.sector);
    assert.ok(guide,'known local props can be navigated to after sighting');
    const contact=resolveContact(e,{x:v.x,y:v.y,z:v.z-16},{x:v.x,y:v.y,z:v.z+16});
    assert.equal(contact?.id,id,'model contact matches the discovered location');
    assert.equal(applyContact(e,contact),true);
    registerResult(score,true,{vx:0,vy:-20,vz:74,pitch:1});
  }
  assert.equal(levelComplete(e),true);
  assert.equal(e.hits,16);
  assert.equal(e.discovered.size,16);
  assert.ok(score.scoutingPoints>=16*35);
  assert.ok(score.points>score.scoutingPoints);
  for(const z of [260,710,1160]){
    const search=explorationHint(e,{x:0,y:60,z,heading:0});
    assert.equal(search.remaining,0);
    assert.equal(search.signal.strength,'clear');
    assert.match(forestTrace(e,{x:0,z}).label,/AREA CLEAR/);
  }
});

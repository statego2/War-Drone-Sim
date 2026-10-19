import test from 'node:test';
import assert from 'node:assert/strict';
import {makeScorecard,registerExploration,registerResult} from '../src/arcadeflow.mjs';
import {FOREST_SITES,sideTrailPoint} from '../src/forestlayout.mjs';

test('first-time scout reports score for discovery without altering impact scoring',()=>{
  const score=makeScorecard();
  const scout=registerExploration(score,'vehicle',2);
  assert.equal(scout.points,70);
  assert.equal(score.points,70);
  assert.equal(score.discoveries,2);
  assert.equal(score.scoutingPoints,70);
  assert.equal(registerResult(score,true,{vx:0,vy:-30,vz:75,pitch:1}).points>100,true);
  assert.equal(score.discoveries,2);
});
test('off-route camp visit earns a distinct exploration reward',()=>{
  const card=makeScorecard();
  const a=registerExploration(card,'landmark');
  assert.equal(a.points,75);assert.equal(card.landmarks,1);
  assert.equal(card.scoutingPoints,75);
  assert.ok(FOREST_SITES.every(site=>{
    const end=sideTrailPoint(site,1);
    return Number.isFinite(end.x)&&Number.isFinite(end.z);
  }));
  assert.equal(FOREST_SITES.length,3);
});
test('bounded scout rewards never overflow from a malformed repeated count',()=>{
  const s=makeScorecard();
  assert.equal(registerExploration(s,'vehicle',Infinity).points,0);
  assert.equal(registerExploration(s,'vehicle',-99).points,0);
  assert.equal(registerExploration(s,'vehicle',1e9).points,560);
});

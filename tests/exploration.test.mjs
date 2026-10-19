import test from 'node:test';
import assert from 'node:assert/strict';
import {canDiscover,discoverNearby,explorationHint,DISCOVERY_RANGE} from '../src/exploration.mjs';
import {makeEncounter,applyContact} from '../src/encounter.mjs';
import {roadCenter} from '../src/flight3d.mjs';

test('a launch does not expose every target through trees',()=>{
  const encounter=makeEncounter();
  const v=encounter.vehicles[0];
  const far={x:v.x,y:v.y+30,z:v.z-125,heading:0};
  assert.equal(canDiscover(v,far),false);
  assert.deepEqual(discoverNearby(encounter,far),[]);
  assert.equal(encounter.discovered.size,0);
  assert.match(explorationHint(encounter).clue,/SEARCH/);
});
test('discovery requires actual local looking, not a long-range instant GPS',()=>{
  const v={id:0,x:0,y:10,z:0,sector:0,destroyed:false};
  const front={x:0,y:20,z:-65,heading:0};
  assert.equal(canDiscover(v,front),true);
  assert.equal(canDiscover(v,{...front,heading:Math.PI}),false);
  assert.equal(canDiscover(v,{...front,z:-DISCOVERY_RANGE-5}),false);
  assert.equal(canDiscover(v,{...front,x:25,z:8,heading:Math.PI/2}),false);
  assert.equal(canDiscover(v,{x:0,y:18,z:15,heading:0}),true,'close discovery works while orbiting');
});
test('a ridge can block distant visibility but cannot hide nearby objects',()=>{
  const v={id:0,x:0,y:10,z:0,destroyed:false};
  const camera={x:0,y:18,z:-65,heading:0};
  assert.equal(canDiscover(v,camera,()=>8),true);
  assert.equal(canDiscover(v,camera,()=>50),false);
  assert.equal(canDiscover(v,{...camera,z:-8},()=>50),true);
});
test('search discoveries persist through drone retries and advancing sectors',()=>{
  const e=makeEncounter(),first=e.vehicles[0];
  const flight={x:first.x,y:first.y+18,z:first.z-35,heading:0};
  assert.deepEqual(discoverNearby(e,flight).includes(0),true);
  assert.equal(e.discovered.has(0),true);
  assert.deepEqual(discoverNearby(e,flight),[],'no repeated spot notification');
  e.drones+=1;
  assert.equal(e.discovered.has(0),true);
  for(const v of e.vehicles.filter(v=>v.sector===0))applyContact(e,{type:'vehicle',id:v.id});
  assert.equal(explorationHint(e).sector,1);
  assert.equal(explorationHint(e).revealed,0);
  assert.equal(e.discovered.has(0),true);
});

test('hidden side-clearing props demand actual exploration, not straight asphalt cruising',()=>{
  const e=makeEncounter(),hidden=e.vehicles[1];
  assert.ok(Math.abs(hidden.offset)>36,'second prop belongs to a deep clearing');
  const road={x:roadCenter(hidden.z-30),y:hidden.y+19,z:hidden.z-30,heading:0};
  assert.equal(canDiscover(hidden,road),false,'a driver on the main road has no magical reveal');
  const near={x:hidden.x,y:hidden.y+9,z:hidden.z-12,heading:0};
  assert.equal(canDiscover(hidden,near),true,'actually entering the clearing reveals the prop');
  assert.equal(e.vehicles[0].offset,-12,'the accessible learning tank is unchanged');
});

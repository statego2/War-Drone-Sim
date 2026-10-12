import test from 'node:test';
import assert from 'node:assert/strict';
import {ARCADE_HIT_VOLUME,sweptPropIntersection} from '../src/contactvolume.mjs';
import {makeEncounter,resolveContact,applyContact} from '../src/encounter.mjs';

const p=(x,y,z)=>({x,y,z});
test('fast dives register an actual vehicle pass-through even at coarse frame rate',()=>{
  const e=makeEncounter(),tank=e.vehicles[0];
  const hit=resolveContact(e,p(tank.x,tank.y+5,tank.z-45),
    p(tank.x,tank.y-2,tank.z+45));
  assert.equal(hit?.type,'vehicle');assert.equal(hit.id,tank.id);
  assert.ok(hit.t>0&&hit.t<1,'first swept volume intersection falls inside frame');
});
test('near miss is forgiving horizontally but high-altitude flyovers are misses',()=>{
  const e=makeEncounter(),tank=e.vehicles[0];
  const close=resolveContact(e,p(tank.x+7.4,tank.y,tank.z-30),
    p(tank.x+7.4,tank.y,tank.z+30));
  assert.equal(close?.id,tank.id,'slight horizontal deviation remains satisfying');
  const far=resolveContact(e,p(tank.x+10.3,tank.y,tank.z-30),
    p(tank.x+10.3,tank.y,tank.z+30));
  assert.equal(far,null,'a visibly wide miss is not a hit');
  const high=resolveContact(e,p(tank.x,tank.y+15,tank.z-30),
    p(tank.x,tank.y+15,tank.z+30));
  assert.equal(high,null,'drone cannot hit while passing far above the prop');
});
test('moving vehicles are swept relative to stationary player',()=>{
  const volume=ARCADE_HIT_VOLUME.truck;
  const hit=sweptPropIntersection(p(0,0,0),p(0,0,0),
    p(-38,0,0),p(38,0,0),volume);
  assert.ok(hit!==null&&hit>.25&&hit<.5);
  assert.equal(sweptPropIntersection(p(0,20,0),p(0,20,0),
    p(-38,0,0),p(38,0,0),volume),null);
});
test('first contact fraction picks nearest target independently of enumeration',()=>{
  const e=makeEncounter();
  // Two test props intentionally share a path, one further along it.
  for(const v of e.vehicles.slice(2))v.destroyed=true;
  const first=e.vehicles[0],second=e.vehicles[1];
  second.x=first.x;second.y=first.y;second.z=first.z+25;
  second.previousX=second.x;second.previousY=second.y;second.previousZ=second.z;
  const hit=resolveContact(e,p(first.x,first.y,first.z-40),
    p(first.x,first.y,first.z+60));
  assert.equal(hit?.id,first.id);
  assert.equal(applyContact(e,hit),true);
  assert.equal(resolveContact(e,p(first.x,first.y,first.z-40),
    p(first.x,first.y,first.z+60))?.id,second.id);
});
test('contact solver rejects zero-scale shapes, null motion, and contact beyond segment',()=>{
  const volume=ARCADE_HIT_VOLUME.tank;
  assert.equal(sweptPropIntersection(p(0,0,0),p(0,0,0),
    p(0,0,0),p(0,0,0),volume),0);
  assert.equal(sweptPropIntersection(p(0,0,-30),p(0,0,-15),
    p(0,0,0),p(0,0,0),volume),null);
  assert.throws(()=>sweptPropIntersection(p(0,0,0),p(0,0,0),
    p(0,0,0),p(0,0,0),{x:0,y:1,z:1}),RangeError);
});

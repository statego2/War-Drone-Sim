import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVEL_TARGETS,LEVEL_SECTORS,makeEncounter,clearingRadius,
  resolveContact,applyContact,updateEncounter,spawnForNextTarget,levelComplete} from '../src/encounter.mjs';
import {roadCenter,groundHeight} from '../src/flight3d.mjs';

test('forest arenas have visible off-road target choices instead of one narrow straight line',()=>{
  const encounter=makeEncounter();
  assert.equal(LEVEL_TARGETS,16);
  assert.deepEqual(LEVEL_SECTORS.map(s=>s.targets.length),[5,5,6]);
  for(let sector=0;sector<3;sector++){
    const targets=encounter.vehicles.filter(v=>v.sector===sector);
    const offroad=targets.filter(v=>Math.abs(v.offset)>=23);
    assert.ok(offroad.length>=3,'multiple targets should be off the asphalt in every sector');
    const left=targets.some(v=>v.offset< -20),right=targets.some(v=>v.offset>20);
    assert.equal(left&&right,true,'both sides of the road have distinct game-space props');
    for(const v of targets){
      assert.ok(Math.abs(v.x-roadCenter(v.z))<clearingRadius(v.z)-15,
        'every spawn is inside an authored playable meadow instead of embedded in a tree');
      assert.ok(Math.abs(v.y-groundHeight(v.x,v.z)-2.2)<.001);
    }
  }
});
test('off-road stationary and moving targets preserve swept hit and wreck state',()=>{
  const e=makeEncounter();
  for(let k=0;k<120;k++) updateEncounter(e,1/60);
  for(const target of e.vehicles){
    const p={x:target.x,y:target.y,z:target.z};
    const hit=resolveContact(e,{...p,z:p.z-15},{...p,z:p.z+15});
    assert.equal(hit?.id,target.id);
    assert.equal(applyContact(e,hit),true);
    const next=spawnForNextTarget(e);
    assert.ok(Number.isFinite(next.x)&&Number.isFinite(next.y)&&Number.isFinite(next.z));
  }
  assert.equal(levelComplete(e),true);
});

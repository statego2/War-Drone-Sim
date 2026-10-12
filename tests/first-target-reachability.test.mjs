import test from 'node:test';
import assert from 'node:assert/strict';
import {makeFlight,advanceFlight,clamp} from '../src/flight3d.mjs';
import {makeEncounter,spawnForNextTarget,updateEncounter,resolveContact} from '../src/encounter.mjs';

// End-to-end deterministic gameplay physics — not a browser click that only
// checks whether the renderer started. We attempt first contact from the actual
// airborne checkpoint using ONLY continuous two-axis thumb commands.
function runFirstApproach({diveDelayFrames,diveStrength,steerGain}){
  const e=makeEncounter(),flight=makeFlight();
  const spawn=spawnForNextTarget(e);
  const first=e.vehicles[0];
  flight.x=spawn.x;flight.y=spawn.y;flight.z=spawn.z;
  flight.heading=.10;flight.vx=Math.sin(flight.heading)*43;
  flight.vz=Math.cos(flight.heading)*43;
  flight.vy=0;flight.throttle=.72;
  let closest=Infinity,hitTime=null;
  const dt=1/60;
  for(let i=0;i<300;i++){
    const before={x:flight.x,y:flight.y,z:flight.z};
    const steer=clamp((flight.x-first.x)*steerGain,-.80,.80);
    const dive=i>=diveDelayFrames?diveStrength:0;
    advanceFlight(flight,{x:steer,y:dive},dt);
    updateEncounter(e,dt);
    closest=Math.min(closest,Math.hypot(flight.x-first.x,
      flight.y-first.y,flight.z-first.z));
    const hit=resolveContact(e,before,flight,flight.groundContact);
    if(hit?.type==='vehicle'){
      if(hit.id===0)hitTime=(i+hit.t)/60;
      break;
    }
    if(flight.groundContact)break;
  }
  return {hitTime,closest,position:{x:flight.x,y:flight.y,z:flight.z}};
}

test('the first tank is reachable from real checkpoint by ordinary continuous swipe',()=>{
  const results=[];
  for(const diveDelayFrames of [0,6,12,18,24,30,40,50])
    for(const diveStrength of [-1,-.9,-.8])
      for(const steerGain of [0,.015,.035,.065]){
        const result=runFirstApproach({diveDelayFrames,diveStrength,steerGain});
        if(result.hitTime!==null)results.push({...result,diveDelayFrames,diveStrength,steerGain});
      }
  assert.ok(results.length>=8,
    'at least one simple, sustained one-finger dive/side gesture must strike the FIRST tank');
  const fastest=results.sort((a,b)=>a.hitTime-b.hitTime)[0];
  assert.ok(fastest.hitTime<4.2,'initial tank must be reachable in a short arcade flight');
  console.log('FIRST TARGET: '+JSON.stringify({successfulScripts:results.length,fastest}));
});

test('same scripted opening remains deterministic for reproducible balancing',()=>{
  const sequence={diveDelayFrames:14,diveStrength:-1,steerGain:.035};
  assert.deepEqual(runFirstApproach(sequence),runFirstApproach(sequence));
});

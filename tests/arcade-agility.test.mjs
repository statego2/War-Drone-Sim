import test from 'node:test';
import assert from 'node:assert/strict';
import {makeFlight,stepFlight,advanceFlight,TURN_RATE} from '../src/flight3d.mjs';

const run=(x,y,steps=120)=>{
  const f=makeFlight();f.y=300;
  for(let i=0;i<steps;i++)stepFlight(f,{x,y},1/60);
  return f;
};

test('arcade steering turns around a missed target in under two seconds',()=>{
  const f=makeFlight();f.y=300;
  let yaw=0,previous=f.heading;
  for(let i=0;i<105;i++){
    stepFlight(f,{x:1,y:0},1/60);
    yaw+=Math.atan2(Math.sin(f.heading-previous),Math.cos(f.heading-previous));
    previous=f.heading;
  }
  assert.ok(TURN_RATE>=1.6);
  assert.ok(yaw< -2.2,'full-right thumb turns at least 125 degrees in 1.75s');
  assert.ok(f.x<makeFlight().x-24,'turn translates through the game world');
});

test('deep upward pullback moves backwards while keeping a playable altitude',()=>{
  const reversed=run(0,1,120),gentle=run(0,.45,120);
  assert.ok(reversed.speed< -15,'full thumb up provides genuine reverse');
  assert.ok(Math.abs(reversed.y-300)<14,'reversing should stay near the current height');
  assert.ok(gentle.y>reversed.y+14,'gentle up climbs; deep up reverses');
  assert.ok(gentle.vy>5,'gentle up continues to climb on demand');
});

test('diagonal reverse keeps strafing without an unwanted altitude surge',()=>{
  for(const direction of [-1,1]){
    const f=run(direction,1,120);
    assert.ok(f.speed < -12);
    assert.ok(f.vx*direction < -3,'diagonal reverse has responsive sideways travel');
    assert.ok(Math.abs(f.y-300)<14,'diagonal reverse holds playable height');
  }
});

test('committed dive accelerates downward without deleting forward inertia',()=>{
  const dive=run(0,-1,82),cruise=run(0,0,82);
  assert.ok(dive.pitch>1.2);
  assert.ok(dive.vy < -14 && dive.vy<cruise.vy-12,'held dive builds descent rapidly');
  assert.ok(Math.hypot(dive.vx,dive.vz)>Math.hypot(cruise.vx,cruise.vz),
    'full dive preserves momentum for the cinematic impact');
});

test('combined reverse-to-dive release behaves similarly at 30 and 60 FPS',()=>{
  const a=makeFlight(),b=makeFlight();a.y=b.y=300;
  const inputs=[{x:.5,y:1,seconds:.75},{x:-.6,y:-1,seconds:.75},{x:0,y:0,seconds:.5}];
  for(const {x,y,seconds} of inputs){
    for(let i=0;i<Math.round(seconds*30);i++)advanceFlight(a,{x,y},1/30);
    for(let i=0;i<Math.round(seconds*60);i++)advanceFlight(b,{x,y},1/60);
  }
  for(const k of ['x','z','y','vx','vz','vy'])
    assert.ok(Math.abs(a[k]-b[k])<2,k+' diverges across FPS');
  assert.equal(a.groundContact,false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, hash, noise, roadCenter, groundHeight, makeFlight, stepFlight, advanceFlight, lakeProximity, LAKE } from '../src/flight3d.mjs';

test('world terrain is deterministic and finite across sectors', () => {
  for (const [x,z] of [[0,0],[-TILE, TILE],[32790,-8730],[.03,-.02],[-100000,100000]]) {
    assert.equal(groundHeight(x,z), groundHeight(x,z));
    assert.ok(Number.isFinite(groundHeight(x,z)));
    assert.ok(Number.isFinite(roadCenter(z)));
  }
  assert.equal(hash(33,-1), hash(33,-1));
  assert.notEqual(noise(1.234,4.567), noise(1.235,4.567));
});
test('seamless ground height at streamed tile edges', () => {
  for(const v of [-TILE,0,TILE,7*TILE]) {
    assert.ok(Math.abs(groundHeight(v - .0001, 42) - groundHeight(v + .0001, 42)) < .02);
    assert.ok(Math.abs(groundHeight(63,v - .0001) - groundHeight(63,v + .0001)) < .02);
  }
});
test('free flight has no arbitrary altitude limit or forced mission timer', () => {
  const f=makeFlight(), initial=f.y;
  for(let i=0;i<2200;i++) stepFlight(f,{x:0,y:1},.05);
  assert.ok(f.y > initial + 2000, 'flight climbs beyond 2km');
  assert.equal(f.groundContact,false);
  assert.ok(f.time > 100);
  assert.ok(Number.isFinite(f.distance));
});
test('ground contact clamps terrain penetration and exposes impact velocity', () => {
  const f=makeFlight();
  f.y = -10000;
  stepFlight(f,{x:0,y:-1},.05);
  assert.equal(f.groundContact,true);
  assert.ok(f.y >= groundHeight(f.x,f.z)+1.4-0.001);
  assert.ok(f.vy<0);
  stepFlight(f,{x:0,y:1},.05);
  assert.ok(f.y >= groundHeight(f.x,f.z)+1.4-0.001);
});
test('finger right turns aircraft toward screen right, left turns left', () => {
  // When the camera faces world +Z, screen right is world -X.
  const right=makeFlight(),left=makeFlight();
  const initialX=right.x;
  for(let i=0;i<105;i++){
    stepFlight(right,{x:1,y:0},1/60);
    stepFlight(left,{x:-1,y:0},1/60);
  }
  assert.ok(right.heading < -1.3,'right gesture must make yaw negative');
  assert.ok(left.heading > 1.3,'left gesture must make yaw positive');
  assert.ok(right.x < initialX-12,'right-turn flight path bends toward world -X');
  assert.ok(left.x > initialX+12,'left-turn flight path bends toward world +X');
});
test('sustained steering turns naturally beyond ninety degrees', () => {
  const right=makeFlight();
  let totalYaw=0, previousHeading=right.heading;
  for(let i=0;i<155;i++) {
    stepFlight(right,{x:1,y:0},1/60);
    totalYaw += Math.atan2(Math.sin(right.heading-previousHeading),Math.cos(right.heading-previousHeading));
    previousHeading=right.heading;
  }
  // Heading itself wraps at +/-PI; accumulate shortest differences to validate full rotation.
  assert.ok(totalYaw < -2.2,'sustained right gesture turns more than 125 degrees while banking and strafing');
});
test('upward gesture provides lift, downward gesture tips the nose and descends', () => {
  const vertical=makeFlight(),initialY=vertical.y;
  for(let i=0;i<90;i++)stepFlight(vertical,{x:0,y:1},1/60);
  assert.ok(vertical.y > initialY+2,'upward drag should produce positive climb');
  assert.ok(vertical.pitch<0,'nose pitches upward during climb');
  const risingVelocity = vertical.vy;
  // After a climb the aircraft must first cancel its upward momentum.
  vertical.y=300;
  for(let i=0;i<100;i++)stepFlight(vertical,{x:0,y:-1},1/60);
  assert.ok(vertical.pitch > 1.1,'full down command pitches steeply forward');
  assert.ok(vertical.vy < risingVelocity-7,'steep dive must aggressively reduce vertical velocity');
});
test('deep dive carries forward momentum while gaining descent speed, then recovers', () => {
  const dive=makeFlight(),neutral=makeFlight();
  dive.y=300;neutral.y=300;
  for(let i=0;i<85;i++) {
    stepFlight(dive,{x:0,y:-1},1/60);
    stepFlight(neutral,{x:0,y:0},1/60);
  }
  assert.ok(dive.pitch>1.2 && dive.pitch<Math.PI/2,'game supports near-vertical non-inverted dive');
  assert.ok(dive.vy<-5,'rapid dive acquires real downward momentum');
  assert.ok(dive.vy<neutral.vy-4,'tilt produces stronger descent than level flight');
  assert.ok(Math.hypot(dive.vx,dive.vz)>Math.hypot(neutral.vx,neutral.vz)*1.08,
    'full nose-down dive should retain and build forward travel instead of braking to zero');
  const atRelease=dive.vy;
  for(let i=0;i<10;i++) stepFlight(dive,{x:0,y:0},1/60);
  assert.ok(dive.vy<0 && atRelease<0,'downward inertia must continue briefly after release');
  for(let i=0;i<180;i++) stepFlight(dive,{x:0,y:1},1/60);
  assert.ok(dive.vy>0,'pulling up can recover from a dive if altitude allows');
});
test('batched elapsed time approximates short frame time', () => {
  const slow=makeFlight(), fast=makeFlight();
  for(let i=0;i<60;i++) advanceFlight(slow,{x:.25,y:.4},1/30);
  for(let i=0;i<120;i++) advanceFlight(fast,{x:.25,y:.4},1/60);
  assert.ok(Math.abs(slow.x-fast.x)<1.2);
  assert.ok(Math.abs(slow.z-fast.z)<1.2);
  assert.ok(Math.abs(slow.y-fast.y)<1.2);
});

test('handcrafted lake basin is deterministic and lies below the water plane', () => {
  assert.equal(lakeProximity(LAKE.x,LAKE.z), 0);
  assert.ok(groundHeight(LAKE.x,LAKE.z) < LAKE.level - 3);
  assert.ok(lakeProximity(roadCenter(LAKE.z),LAKE.z) > 1);
  assert.equal(groundHeight(LAKE.x,LAKE.z),groundHeight(LAKE.x,LAKE.z));
});

test('hover converges to stopped flight and reverse moves backward', () => {
  const f=makeFlight(); f.throttle=0;
  for(let i=0;i<180;i++)stepFlight(f,{x:0,y:0},1/60);
  assert.ok(Math.abs(f.speed)<.2);
  f.throttle=-.38;
  for(let i=0;i<180;i++)stepFlight(f,{x:0,y:0},1/60);
  assert.ok(f.speed < -10);
});

test('cruise actually accelerates and a sustained dive reaches ground with downward speed', () => {
  const f=makeFlight();f.throttle=.72;
  const initialSpeed=f.speed;
  for(let i=0;i<90;i++)stepFlight(f,{x:0,y:0},1/60);
  assert.ok(f.speed>initialSpeed+6,'cruise must increase world speed, not just camera FOV');
  f.y=groundHeight(f.x,f.z)+36;
  for(let i=0;i<300 && !f.groundContact;i++)stepFlight(f,{x:0,y:-1},1/60);
  assert.equal(f.groundContact,true,'full down eventually hits the terrain');
  assert.ok(f.vy<-6,'falling momentum remains available for terminal impact');
});

test('committed dive retains forward velocity; shallow pitch yields milder downward acceleration', () => {
  const full=makeFlight(), shallow=makeFlight(), cruise=makeFlight();
  for (const f of [full,shallow,cruise]) f.y=300;
  for(let i=0;i<90;i++) {
    stepFlight(full,{x:0,y:-1},1/60);
    stepFlight(shallow,{x:0,y:-.5},1/60);
    stepFlight(cruise,{x:0,y:0},1/60);
  }
  const horizontal=f=>Math.hypot(f.vx,f.vz);
  assert.ok(full.pitch>1.2 && full.vy<-5, 'full gesture commits to gravity-led fall');
  assert.ok(horizontal(full)>horizontal(cruise)+5, 'the nose-down dive does not trigger a hidden air brake');
  assert.ok(horizontal(shallow)>45 && horizontal(shallow)<horizontal(full), 'shallow input still advances, but with a gentler dive');
  assert.ok(horizontal(cruise)>48, 'neutral cruise stays fast');
  // Pulling out should recover forward travel continuously instead of snapping.
  const before=horizontal(full);
  stepFlight(full,{x:0,y:1},1/60);
  assert.ok(horizontal(full)>=before && horizontal(full)<before+3);
});

test('true lateral HOVER strafing does not force yaw and diagonal gestures combine axes', () => {
  const start=makeFlight(), right=makeFlight(), left=makeFlight();
  for(const f of [right,left]) {f.y=300;f.throttle=0;}
  for(let i=0;i<120;i++){
    stepFlight(right,{x:1,y:0},1/60);
    stepFlight(left,{x:-1,y:0},1/60);
  }
  assert.ok(right.x<start.x-12 && left.x>start.x+12,'hover supports real opposite lateral translations');
  assert.ok(Math.abs(right.heading)<.02 && Math.abs(left.heading)<.02,'hover strafing must not turn the aircraft');
  assert.ok(right.sideRate< -6 && left.sideRate>6,'side velocity is exposed to the renderer');

  const diagonals=[
    {input:{x:1,y:1},side:-1,vertical:1},
    {input:{x:-1,y:1},side:1,vertical:1},
    {input:{x:1,y:-1},side:-1,vertical:-1},
    {input:{x:-1,y:-1},side:1,vertical:-1}
  ];
  for(const {input,side,vertical} of diagonals){
    const f=makeFlight();f.y=300;
    const x=f.x,y=f.y;
    for(let i=0;i<120;i++)stepFlight(f,input,1/60);
    assert.ok(side*(f.x-x)>18,'diagonal drag must translate laterally');
    assert.ok(vertical*(f.y-y)>8,'diagonal drag must also translate vertically');
    assert.ok(Math.abs(f.bank)>.3,'lateral travel must have visible bank');
  }
});

test('rapid full dive keeps forward momentum and gains speed on both CRUISE and FAST', () => {
  for (const throttle of [.72,1]) {
    const dive=makeFlight(),level=makeFlight();
    for(const f of [dive,level]) {f.y=300;f.throttle=throttle;}
    const startZ=dive.z, startSpeed=dive.vz;
    // A steep initial pitch must NOT annihilate horizontal velocity within 0.5s.
    for(let i=0;i<30;i++){
      stepFlight(dive,{x:0,y:-1},1/60);
      stepFlight(level,{x:0,y:0},1/60);
    }
    assert.ok(dive.vz>startSpeed*1.05,'early nose-down speed does not collapse');
    for(let i=0;i<90;i++){
      stepFlight(dive,{x:0,y:-1},1/60);
      stepFlight(level,{x:0,y:0},1/60);
    }
    assert.ok(dive.z-startZ>110,'full dive continues traveling through the playable forest');
    assert.ok(dive.vy< -18,'steep input strongly builds downward velocity');
    assert.ok(dive.vz>level.vz+8,'nose-down dive builds forward drive');
  }
});

test('releasing diagonal drag preserves world velocity without instantly switching directions', () => {
  const f=makeFlight(); f.y=300;
  for(let i=0;i<75;i++)stepFlight(f,{x:1,y:1},1/60);
  const initial={vx:f.vx,vy:f.vy,vz:f.vz};
  stepFlight(f,{x:-1,y:-1},1/60);
  assert.ok(Math.abs(f.vx-initial.vx)<2,'opposite gesture cannot instantly reverse sideways momentum');
  assert.ok(Math.abs(f.vy-initial.vy)<2,'vertical momentum is continuous at reversal');
  assert.ok(Math.abs(f.vz-initial.vz)<2,'forward momentum is continuous');
});

test('combined steering and dive remains consistent across 30 and 60 FPS steps', () => {
  const slow=makeFlight(),fast=makeFlight();
  for(const f of [slow,fast]) f.y=300;
  for(let i=0;i<42;i++)advanceFlight(slow,{x:.8,y:-.75},1/30);
  for(let i=0;i<84;i++)advanceFlight(fast,{x:.8,y:-.75},1/60);
  for(const k of ['x','y','z','vx','vy','vz'])
    assert.ok(Math.abs(slow[k]-fast[k])<1.6,k+' varies too much with frame rate');
});

test('coarse browser frame ends at the FIRST ground contact rather than sliding along terrain', () => {
  const f=makeFlight();
  f.y=groundHeight(f.x,f.z)+1.55;
  f.vy=-20;
  advanceFlight(f,{x:0,y:-1},.25);
  assert.equal(f.groundContact,true);
  assert.ok(f.time<=.025001,'first substep contact ends the frame early');
  assert.ok(f.y>=groundHeight(f.x,f.z)+1.4-.001);
  assert.ok(f.vy<0,'the impact velocity is preserved');
});

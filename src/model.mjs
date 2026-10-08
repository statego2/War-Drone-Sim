export const TUNE=Object.freeze({speed:19,runSeconds:24,targetZ:196,startY:4.2,minY:1.05,maxY:12,steerX:13,steerY:7.5,treeRadius:1.55,carRadius:2.65});
export const clamp=(value,low,high)=>Math.max(low,Math.min(high,value));
export const roadX=z=>1.4*Math.sin(z*.018)+.65*Math.sin(z*.045);
export function seeded(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
export function makeWorld(seed=32){const rng=seeded(seed),trees=[];for(let z=17;z<260;z+=5.5){for(const side of [-1,1]){const x=roadX(z)+side*(6.3+rng()*4.2);trees.push({x,z:z+(rng()-.5)*4,height:9+rng()*8,radius:1.1+rng()*.6,tint:rng()});}}return{trees,seed};}
export function vehicleX(time,z=TUNE.targetZ){return roadX(z)+2.2*Math.sin(time*.87+.2);}
export function newRun(seed=32){return{phase:'playing',time:0,x:0,y:TUNE.startY,z:0,vx:0,vy:0,score:0,result:null,world:makeWorld(seed),seed};}
export function step(run,input,dt){if(run.phase!=='playing')return run;dt=clamp(dt,0,.05);run.time+=dt;const desiredX=clamp(input.x,-1,1)*TUNE.steerX,desiredY=clamp(input.y,-1,1)*TUNE.steerY;
  const response=1-Math.exp(-9*dt);run.vx+=(desiredX-run.vx)*response;run.vy+=(desiredY-run.vy)*response;
  run.x=clamp(run.x+run.vx*dt,-15,15);run.y=clamp(run.y+run.vy*dt,TUNE.minY,TUNE.maxY);run.z+=TUNE.speed*dt;
  // Swept z checks prevent tunnelling when the tab briefly skips frames.
  for(const tree of run.world.trees){if(Math.abs(tree.z-run.z)>TUNE.speed*dt+1.7)continue;if(Math.abs(run.x-tree.x)<tree.radius+0.55&&run.y<tree.height*.68){run.phase='result';run.result='tree';break;}}
  if(run.phase==='playing'&&Math.abs(run.z-TUNE.targetZ)<TUNE.speed*dt+2.2&&Math.abs(run.x-vehicleX(run.time))<TUNE.carRadius&&run.y<3.6){run.phase='result';run.result='hit';run.score=100+Math.round(Math.max(0,TUNE.runSeconds-run.time)*5);}
  if(run.phase==='playing'&&(run.z>TUNE.targetZ+12||run.time>TUNE.runSeconds)){run.phase='result';run.result='miss';}
  return run;
}

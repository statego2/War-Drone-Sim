import {TUNE,clamp,roadX,vehicleX,newRun,advance} from './model.mjs';

const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d',{alpha:false});
const overlay=document.querySelector('#overlay'),primary=document.querySelector('#primary');
const hud=document.querySelector('#hud'),hint=document.querySelector('#hint'),pause=document.querySelector('#pause');
const distance=document.querySelector('#distance'),bestEl=document.querySelector('#best');
let w=0,h=0,dpr=1,run=null,mode='home',last=0,ambient=0,burst=0,press=null,audio=null;
const keys=new Set();
let best=0;try{best=Math.max(0,Number(localStorage.getItem('war-drone-best-v1'))||0);}catch{}
bestEl.textContent=best;
function resize(){w=window.innerWidth>600?Math.min(window.innerWidth,530):window.innerWidth;h=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
window.addEventListener('resize',resize);resize();
const colors={skyTop:'#112c35',skyMid:'#668977',skyLight:'#d8bf91',ground:'#436449',road:'#534f43',roadEdge:'#a5946d'};
function polygon(points,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fill();}
function line(points,color,width){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.stroke();}
function circle(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,Math.PI*2);ctx.fill();}
function camera(state){return{x:state.x*.8,y:state.y+3.8,z:state.z-10};}
function project(x,y,z,cam){const depth=z-cam.z;if(depth<=.8)return null;const f=Math.min(w*1.25,h*.82);return{x:w*.5+(x-cam.x)*f/depth,y:h*.44-(y-cam.y)*f/depth,s:f/depth,depth};}
function drawSky(time,cam){const sky=ctx.createLinearGradient(0,0,0,h*.75);sky.addColorStop(0,colors.skyTop);sky.addColorStop(.6,colors.skyMid);sky.addColorStop(1,colors.skyLight);ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  circle(w*.72,h*.17,Math.min(w*.13,51),'#d8e3ba22');circle(w*.72,h*.17,Math.min(w*.055,21),'#e6e9c49a');
  for(let layer=0;layer<3;layer++){const base=h*(.48+layer*.047);ctx.beginPath();ctx.moveTo(0,h);for(let x=0;x<=w+10;x+=8){let n=Math.sin(x*.012+layer*1.9+cam.z*.0008)*16+Math.sin(x*.025+layer*3)*8;ctx.lineTo(x,base+n+layer*4);}ctx.lineTo(w,h);ctx.fillStyle=['#537267','#486a5d','#3d634e'][layer];ctx.fill();}
  ctx.fillStyle=colors.ground;ctx.fillRect(0,h*.59,w,h*.41);
}
function road(cam){let sections=[];for(let z=cam.z+4;z<cam.z+290;z+=6){const p1=project(roadX(z)-4.5,0,z,cam),p2=project(roadX(z)+4.5,0,z,cam);if(p1&&p2)sections.push([p1,p2,z]);}
  for(let i=sections.length-2;i>=0;i--){const a=sections[i],b=sections[i+1];polygon([[a[0].x,a[0].y],[a[1].x,a[1].y],[b[1].x,b[1].y],[b[0].x,b[0].y]],i%3===0?'#615c4c':'#585545');line([[a[0].x,a[0].y],[b[0].x,b[0].y]],'#a8976d',Math.max(1,a[0].s*.035));line([[a[1].x,a[1].y],[b[1].x,b[1].y]],'#a8976d',Math.max(1,a[0].s*.035));
    if(i%3===0){const q=project(roadX(a[2]),.03,a[2],cam),r=project(roadX(b[2]),.03,b[2],cam);if(q&&r)line([[q.x,q.y],[r.x,r.y]],'#c9bb8d99',Math.max(.7,q.s*.045));}}
}
function drawTree(tree,cam){const root=project(tree.x,0,tree.z,cam),top=project(tree.x,tree.height,tree.z,cam);if(!root||!top||root.depth>255)return;const k=root.s,far=clamp(1-root.depth/310,.28,1),spread=tree.height*.37*k;
  ctx.globalAlpha=far;polygon([[root.x-tree.radius*k*.55,root.y],[root.x+tree.radius*k*.55,root.y],[top.x+tree.radius*k*.22,top.y+tree.height*k*.38],[top.x-tree.radius*k*.22,top.y+tree.height*k*.38]],'#343629');
  polygon([[top.x,top.y-2],[top.x-spread*.8,top.y+tree.height*k*.48],[top.x+spread*.8,top.y+tree.height*k*.48]],tree.tint>.5?'#244d3b':'#30573e');
  polygon([[top.x,top.y+tree.height*k*.22],[top.x-spread,top.y+tree.height*k*.72],[top.x+spread,top.y+tree.height*k*.72]],tree.tint>.5?'#265542':'#345d43');
  polygon([[top.x,top.y+tree.height*k*.43],[top.x-spread*1.08,top.y+tree.height*k*.87],[top.x+spread*1.08,top.y+tree.height*k*.87]],tree.tint>.5?'#2d6047':'#3b694b');ctx.globalAlpha=1;
}
function drawVehicle(state,cam){const z=TUNE.targetZ;if(z<cam.z+2||z>cam.z+250)return;const x=vehicleX(state.time),p=project(x,0,z,cam);if(!p)return;const s=p.s;ctx.save();ctx.translate(p.x,p.y);const side=clamp((x-roadX(z))/4,-.6,.6);
  polygon([[-2.65*s,0],[-2.3*s,-1.65*s],[2.3*s,-1.65*s],[2.65*s,0]],'#9c663e');
  polygon([[-1.9*s,-1.65*s],[-1.15*s,-2.7*s],[1.25*s,-2.7*s],[2*s,-1.65*s]],'#c8945e');
  polygon([[-1.24*s,-2.55*s],[-1.65*s,-1.7*s],[1.54*s,-1.7*s],[1.03*s,-2.55*s]],'#294852');
  polygon([[-2.55*s,-.2*s],[2.55*s,-.2*s],[2.4*s,.38*s],[-2.4*s,.38*s]],'#3c3d34');
  circle(-1.7*s,-.06*s,.45*s,'#d9bea0');circle(1.7*s,-.06*s,.45*s,'#d9bea0');
  if(s>2){ctx.strokeStyle='#dfeeb1';ctx.lineWidth=Math.max(1,s*.09);ctx.strokeRect(-2.75*s,-3.1*s,5.5*s,3.65*s);}
  ctx.restore();return p;
}
function drawDrone(state,time){const x=w*.5+state.x*.15,y=h*.77+Math.sin(time*9)*2,tilt=clamp(state.vx/35,-.27,.27),size=clamp(w/390,.7,1.2);ctx.save();ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(size,size);
  ctx.shadowColor='#071917aa';ctx.shadowBlur=19;ctx.shadowOffsetY=10;
  line([[-46,-19],[46,19]],'#182726',10);line([[46,-19],[-46,19]],'#182726',10);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  for(const [rx,ry] of [[-50,-20],[50,-20],[-50,20],[50,20]]){circle(rx,ry,12,'#91af9c55');circle(rx,ry,7,'#172a28');line([[rx-16,ry],[rx+16,ry]],'#c7decbaa',2);}
  polygon([[-17,-15],[0,-23],[17,-15],[20,7],[0,19],[-20,7]],'#e0e4d5');polygon([[-10,-12],[0,-16],[10,-12],[11,0],[-11,0]],'#50736f');circle(0,9,4,'#d2aa69');ctx.restore();
}
function drawTargetCue(state,cam,p){if(state.z<62||!p)return;const left=Math.max(0,Math.round(TUNE.targetZ-state.z));const x=clamp(p.x,33,w-33),y=clamp(p.y-40,100,h*.61);ctx.save();ctx.textAlign='center';ctx.font='800 10px system-ui';ctx.letterSpacing='1px';ctx.fillStyle='#f1e9bb';ctx.fillText(left+' M TO VEHICLE',x,y-8);ctx.strokeStyle='#e8e4be';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x,y+7);ctx.lineTo(x+10,y);ctx.stroke();ctx.restore();}
function drawBurst(t,result){if(t<=0)return;const k=1-t/.75,x=w*.5,y=h*.62;ctx.save();ctx.globalAlpha=clamp(t/.75,0,1);for(let i=0;i<10;i++){const a=i*6.283/10+k*.35,dist=25+k*135;circle(x+Math.cos(a)*dist,y+Math.sin(a)*dist*.7,3+(1-k)*5,result==='hit'?'#e5c18a':'#dde0bb');}ctx.strokeStyle=result==='hit'?'#e7cf9a':'#f2e5c7';ctx.lineWidth=4*(1-k);ctx.beginPath();ctx.arc(x,y,18+k*145,0,Math.PI*2);ctx.stroke();ctx.restore();}
function draw(now){ambient+=Math.min((now-last)/1000||0,.05);const shown=run||{x:Math.sin(ambient*.27)*2,y:4.2,z:65+ambient*2,vx:0,time:ambient,world:demoWorld};const cam=camera(shown);drawSky(ambient,cam);road(cam);
  const visible=shown.world.trees.filter(t=>t.z>cam.z+1&&t.z<cam.z+255).sort((a,b)=>b.z-a.z);let target=null,carDrawn=false;
  for(const tree of visible){if(!carDrawn&&tree.z<TUNE.targetZ){target=drawVehicle(shown,cam);carDrawn=true;}drawTree(tree,cam);}
  if(!carDrawn)target=drawVehicle(shown,cam);if(mode==='playing')drawTargetCue(shown,cam,target);
  if(mode==='playing'||mode==='result')drawDrone(shown,ambient);
  if(burst>0){burst=Math.max(0,burst-Math.min((now-last)/1000||0,.05));drawBurst(burst,run.result);}
}
const demoWorld=newRun(32).world;
function sound(kind){try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type=kind==='hit'?'triangle':'sine';o.frequency.setValueAtTime(kind==='hit'?370:160,t);o.frequency.exponentialRampToValueAtTime(kind==='hit'?90:55,t+.35);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+.4);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.42);}catch{}}
function begin(){run=newRun(32);mode='playing';press=null;keys.clear();overlay.className='panel hidden';hud.classList.remove('hidden');pause.classList.remove('hidden');hint.style.opacity='1';primary.blur();}
function finish(){mode='result';burst=.75;sound(run.result);if(run.score>best){best=run.score;try{localStorage.setItem('war-drone-best-v1',String(best));}catch{}}bestEl.textContent=best;hud.classList.add('hidden');pause.classList.add('hidden');overlay.className='panel result';const title=run.result==='hit'?'DIRECT<br><em>CONTACT</em>':run.result==='tree'?'FOREST<br><em>CONTACT</em>':'TARGET<br><em>MISSED</em>';overlay.querySelector('h1').innerHTML=title;overlay.querySelector('.kicker').textContent=run.result==='hit'?'RUN COMPLETE':'FLIGHT ENDED';overlay.querySelector('p').textContent=run.result==='hit'?'Η τροχιά σου βρήκε το όχημα. Άλλη μία πτήση;':run.result==='tree'?'Ένα δέντρο έκοψε την πορεία. Ξαναδοκίμασε το πέρασμα.':'Το όχημα έμεινε πίσω. Δοκίμασε πιο χαμηλή προσέγγιση.';let score=overlay.querySelector('.result-score');if(!score){score=document.createElement('div');score.className='result-score';overlay.querySelector('p').after(score);}score.textContent=run.score?`+ ${run.score} POINTS`:`BEST ${best}`;primary.innerHTML='FLY AGAIN <span>↗</span>';}
primary.addEventListener('click',()=>{if(mode==='paused'){mode='playing';overlay.classList.add('hidden');hud.classList.remove('hidden');pause.classList.remove('hidden');}else begin();});
pause.addEventListener('click',()=>{if(mode!=='playing')return;mode='paused';overlay.className='panel paused';overlay.querySelector('.kicker').textContent='FLIGHT PAUSED';overlay.querySelector('h1').innerHTML='TAKE A<br><em>BREATH</em>';overlay.querySelector('p').textContent='Το δάσος θα περιμένει.';const score=overlay.querySelector('.result-score');if(score)score.remove();primary.innerHTML='RESUME <span>↗</span>';hud.classList.add('hidden');pause.classList.add('hidden');});
canvas.addEventListener('pointerdown',e=>{if(mode!=='playing'||press)return;press={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};canvas.setPointerCapture(e.pointerId);hint.style.opacity='0';});
canvas.addEventListener('pointermove',e=>{if(press?.id!==e.pointerId)return;press.dx=clamp((e.clientX-press.x)/75,-1,1);press.dy=clamp((press.y-e.clientY)/80,-1,1);});
function release(e){if(press?.id===e.pointerId)press=null;}canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(mode==='playing')hint.style.opacity='0';if(e.key===' '&&mode==='result')begin();});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{press=null;keys.clear();});document.addEventListener('visibilitychange',()=>{if(document.hidden){press=null;keys.clear();last=0;}});
function frame(now){const dt=Math.min((now-last)/1000||0,.5);if(mode==='playing'){const input={x:clamp((press?.dx||0)+(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0),-1,1),y:clamp((press?.dy||0)+(keys.has('arrowup')||keys.has('w')?1:0)-(keys.has('arrowdown')||keys.has('s')?1:0),-1,1)};advance(run,input,dt);distance.textContent=`${String(Math.round(run.z)).padStart(3,'0')} M`;if(run.phase==='result')finish();}draw(now);last=now;requestAnimationFrame(frame);}requestAnimationFrame(frame);

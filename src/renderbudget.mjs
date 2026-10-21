// Frame pacing-aware dynamic resolution for an arcade mobile WebGL game.
// Uses rendered-frame intervals, no device fingerprinting or external telemetry.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const percentile=(sorted,p)=>sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))];
export function createRenderBudget({
  initialDpr=1.3,maxDpr=1.6,minDpr=.85,
  sampleCount=120,cooldownWindows=2
}={}) {
  if(!Number.isInteger(sampleCount)||sampleCount<8)throw new RangeError('sampleCount >= 8');
  if(!Number.isFinite(minDpr)||minDpr<=0||maxDpr<minDpr)throw new RangeError('invalid DPR bounds');
  let dpr=clamp(initialDpr,minDpr,maxDpr),cooldown=0;
  let samples=[],last={p75:0,p95:0,frames:0};
  function sample(ms,active=true) {
    // Browser background throttling and Safari lifecycle jumps are not GPU load.
    // Slow but still actively rendered phones can exceed 120ms/frame.
// Paused or truly suspended frames are filtered by active and the gap cap.
    if(!active || !Number.isFinite(ms) || ms<1 || ms>360)return null;
    samples.push(ms);
    if(samples.length<sampleCount)return null;
    samples.sort((a,b)=>a-b);
    last={p75:percentile(samples,.75),p95:percentile(samples,.95),frames:samples.length};
    samples=[];
    if(cooldown>0){cooldown--;return null;}
    const slow=last.p75>27.5 || last.p95>42;
    const fast=last.p75<16.4 && last.p95<21.8;
    const next=slow?Math.max(minDpr,dpr-.14):
      fast?Math.min(maxDpr,dpr+.08):dpr;
    const rounded=Math.round(next*100)/100;
    if(Math.abs(rounded-dpr)<.01)return null;
    dpr=rounded;cooldown=cooldownWindows;
    return dpr;
  }
  function reset(){samples=[];cooldown=0;}
  return {sample,reset,get dpr(){return dpr;},
    get stats(){return {...last,pending:samples.length};}};
}

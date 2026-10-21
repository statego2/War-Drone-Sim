// Browser arcade simulation pacing, independent of expensive WebGL rendering.
// Retain a SMALL amount of missed wall time for catch-up, but bound each frame
// so tree/vehicle swept contacts remain well-behaved and mobile CPU load bounded.
export function createFrameClock({maxStep=.22,maxBacklog=.36,maxGap=.85,idleMax=.1}={}) {
  if (![maxStep,maxBacklog,maxGap,idleMax].every(v=>Number.isFinite(v)&&v>0) ||
      maxStep>maxBacklog || maxBacklog>maxGap)
    throw new RangeError('invalid simulation pacing bounds');
  let backlog=0;
  function sample(wallSeconds,active=true) {
    // Visibility changes, debugger pauses and suspended tabs are not play time.
    if(!Number.isFinite(wallSeconds)||wallSeconds<0 || wallSeconds>maxGap){
      backlog=0;return 0;
    }
    if(!active){backlog=0;return Math.min(wallSeconds,idleMax);}
    backlog=Math.min(maxBacklog,backlog+wallSeconds);
    const step=Math.min(maxStep,backlog);
    backlog=Math.max(0,backlog-step);
    return step;
  }
  return {sample,reset(){backlog=0;},get backlog(){return backlog;}};
}

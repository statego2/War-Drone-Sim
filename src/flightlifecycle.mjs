// Pure pause/resume state transitions for foreground interruptions and WebGL loss.
// The player must never spend a drone because the phone switched applications.
export function pauseFlightState(mode) {
  if(mode!=='flying' && mode!=='impact')return null;
  return {mode:'paused',resumeMode:mode};
}
export function resumeFlightState(mode,previousMode,graphicsReady=true) {
  if(mode!=='paused'||!graphicsReady)return null;
  return {mode:previousMode==='impact'?'impact':'flying'};
}

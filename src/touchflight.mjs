// One-finger portrait flight gestures. Small movement reaches useful authority
// without forcing the player's thumb to travel across the whole screen.
// This is fictional arcade input mapping, not real drone commands.
export const TOUCH_RANGE_X = 76;
export const TOUCH_RANGE_Y = 72;
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
function deadzone(v) { return Math.abs(v)<.025?0:v; }
export function gestureAxes(startX,startY,currentX,currentY) {
  return {
    x:deadzone(clamp((currentX-startX)/TOUCH_RANGE_X,-1,1)),
    y:deadzone(clamp((startY-currentY)/TOUCH_RANGE_Y,-1,1))
  };
}

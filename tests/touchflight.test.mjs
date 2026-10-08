import test from 'node:test';
import assert from 'node:assert/strict';
import { gestureAxes,TOUCH_RANGE_X,TOUCH_RANGE_Y } from '../src/touchflight.mjs';
test('short thumb travel reaches full reverse and full dive without a mode button', () => {
 assert.deepEqual(gestureAxes(100,200,100,200-TOUCH_RANGE_Y),{x:0,y:1});
 assert.deepEqual(gestureAxes(100,200,100,200+TOUCH_RANGE_Y),{x:0,y:-1});
 assert.equal(gestureAxes(100,200,100,200-52).y> .7,true,'thumb reaches braking/hover with a modest gesture');
});
test('diagonal gestures independently control two axes with both directions',()=>{
 const rightUp=gestureAxes(200,350,250,300),leftDown=gestureAxes(200,350,150,400);
 assert.ok(rightUp.x>.6 && rightUp.y>.6);
 assert.ok(leftDown.x<-.6 && leftDown.y<-.6);
 assert.deepEqual(gestureAxes(0,0,-10000,10000),{x:-1,y:-1});
});
test('very small touch jitter is ignored but directional reversal changes input immediately',()=>{
 assert.deepEqual(gestureAxes(300,300,301,299),{x:0,y:0});
 const forward=gestureAxes(300,300,300,365),reverse=gestureAxes(300,300,300,235);
 assert.ok(forward.y<-.85 && reverse.y>.85);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {outlineAppearance} from '../src/targetoutline.mjs';
const target={id:0,x:0,y:4,z:100,sector:0,destroyed:false};
const player={x:0,y:30,z:0};
test('red outline highlights intact nearby arcade props',()=>{
  const a=outlineAppearance(target,player,0,0);
  assert.equal(a.visible,true);assert.ok(a.opacity>.65&&a.opacity<.80);
  assert.equal(outlineAppearance({...target,z:1000},player,0).visible,false);
  assert.equal(outlineAppearance({...target,x:0,y:30,z:1},player,0).visible,false);
});
test('hidden when destroyed or from another clearing',()=>{
  assert.equal(outlineAppearance({...target,destroyed:true},player,0).visible,false);
  assert.equal(outlineAppearance({...target,sector:2},player,0).visible,false);
});
test('prefers-reduced-motion disables pulse, and distant visibility fades',()=>{
  const a=outlineAppearance(target,player,0,0,true);
  const b=outlineAppearance(target,player,0,100,true);
  assert.deepEqual(a,b);
  const far=outlineAppearance({...target,z:355},player,0,0,true);
  assert.ok(far.opacity<a.opacity && far.opacity>0);
});

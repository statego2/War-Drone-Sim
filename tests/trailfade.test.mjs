import test from 'node:test';
import assert from 'node:assert/strict';
import {trailAlpha,padAlpha} from '../src/trailfade.mjs';
import {battlefieldLayout} from '../src/battlefieldlayout.mjs';
test('scenic dirt trail fades at the edges into grass',()=>{
  assert.ok(trailAlpha(0)>.5);
  assert.ok(trailAlpha(-1)<.05&&trailAlpha(1)<.05);
});
test('staging pads fade from soil centre into terrain instead of hard polygons',()=>{
  assert.ok(padAlpha(0)>.55);
  assert.ok(padAlpha(.5)>padAlpha(.8));
  assert.ok(padAlpha(1)<.04);
  assert.ok(padAlpha(-100)<=1&&padAlpha(100)>=0);
});
test('the forest still has three complete areas, six paths and sixteen vehicle sites',()=>{
  const b=battlefieldLayout();
  assert.equal(b.trails.length,6);
  assert.equal(b.pads.length,22);
  assert.ok(b.trails.every(t=>t.width<3));
  assert.ok(b.pads.every(p=>p.rx<=12 && p.rz<=17));
});

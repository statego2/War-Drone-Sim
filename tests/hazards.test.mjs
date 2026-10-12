import test from 'node:test';
import assert from 'node:assert/strict';
import { treeHazard, segmentTreeContact, resolveTreeContact, chooseContact } from '../src/hazards.mjs';

test('forgiving tree hitbox lies visibly inside tall foliage',()=>{
  const h=treeHazard({id:7,x:0,z:50,ground:9,size:20,radius:5});
  assert.ok(h.top<9+20*1.34);
  assert.ok(h.radius<5);
  assert.ok(h.top>h.bottom);
});
test('high-altitude flight safely clears the canopy',()=>{
  const h=treeHazard({id:2,x:0,z:50,ground:0,size:20,radius:5});
  assert.equal(segmentTreeContact({x:0,y:45,z:0},{x:0,y:45,z:100},h),null);
});
test('fast horizontal flight through a visible tree registers contact',()=>{
  const h=treeHazard({id:3,x:0,z:50,ground:0,size:20,radius:5});
  const hit=segmentTreeContact({x:0,y:10,z:0},{x:0,y:10,z:100},h);
  assert.equal(hit?.type,'tree');
  assert.equal(hit?.id,3);
  assert.ok(hit.t>.35&&hit.t<.5);
});
test('committed steep dive intersects tree even if canopy is entered after the horizontal boundary',()=>{
  const h={id:4,x:0,z:50,bottom:1,top:20,radius:5};
  const hit=segmentTreeContact({x:0,y:26,z:0},{x:0,y:5,z:100},h);
  assert.equal(hit?.id,4);
  assert.ok(hit.y<=20 && hit.y>=1);
});
test('parallel edge miss and empty set do not cause phantom collisions',()=>{
  const h={id:4,x:0,z:50,bottom:0,top:20,radius:5};
  assert.equal(segmentTreeContact({x:5.5,y:10,z:0},{x:5.5,y:10,z:100},h),null);
  assert.equal(resolveTreeContact({x:0,y:0,z:0},{x:0,y:0,z:100},[]),null);
});
test('earliest of several obstacles wins, independent of array ordering',()=>{
  const near={id:'near',x:0,z:20,bottom:1,top:20,radius:5};
  const far={id:'far',x:0,z:70,bottom:1,top:20,radius:5};
  const a=resolveTreeContact({x:0,y:10,z:0},{x:0,y:10,z:100},[far,near]);
  assert.equal(a?.id,'near');
});
test('actual swept arrival order wins vehicle/tree contacts, terrain remains fallback',()=>{
  assert.deepEqual(chooseContact(null,null,true),{type:'ground'});
  assert.deepEqual(chooseContact({type:'vehicle',id:1,t:.35},{type:'tree',id:3,t:.45}),{type:'vehicle',id:1,t:.35});
  assert.deepEqual(chooseContact({type:'vehicle',id:1,t:.80},{type:'tree',id:3,t:.25}),{type:'tree',id:3,t:.25});
});

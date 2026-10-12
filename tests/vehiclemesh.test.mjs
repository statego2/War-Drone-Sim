import test from 'node:test';
import assert from 'node:assert/strict';
import {slopedHullSpec} from '../src/vehiclemesh.mjs';

test('six hard surfaces of low-poly armour have outward normals',()=>{
  const {positions,indices}=slopedHullSpec(6,2,10,.78,.8);
  assert.equal(positions.length,24);assert.equal(indices.length,36);
  const normals=[];
  for(let face=0;face<6;face++){
    const [a,b,c]=indices.slice(face*6,face*6+3).map(i=>positions.slice(i*3,i*3+3));
    const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);
    normals.push([u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]);
  }
  assert.ok(normals[0][1]<0&&normals[1][1]>0);
  assert.ok(normals[2][2]>0&&normals[3][2]<0);
  assert.ok(normals[4][0]<0&&normals[5][0]>0);
});
test('roof slopes inward rather than reproducing a featureless box',()=>{
  const {positions}=slopedHullSpec(6,2,10,.78,.8);
  assert.equal(positions[0],-3);assert.equal(positions[12],-3*.78);
  assert.equal(positions[2],-5);assert.equal(positions[14],-5*.8);
  assert.ok(positions.every(Number.isFinite));
});
test('invalid faces and impossible armour proportions are rejected',()=>{
  for(const args of [[0,2,10],[6,-2,10],[6,2,10,0],[6,2,10,.2,.8],[6,2,10,1.2,.8]]){
    assert.throws(()=>slopedHullSpec(...args),RangeError);
  }
});

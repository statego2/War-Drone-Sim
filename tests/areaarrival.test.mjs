import test from 'node:test';
import assert from 'node:assert/strict';
import {areaArrival} from '../src/areaarrival.mjs';
test('travel through three landscapes produces exactly two forward arrivals',()=>{
  let area=0,transitions=[];
  for(let z=100;z<=1300;z+=5){
    const next=areaArrival(area,z);
    if(next!==area)transitions.push(next);
    area=next;
  }
  assert.deepEqual(transitions,[1,2]);
  assert.equal(area,2);
});
test('near the area boundary the arrival sound must not flutter',()=>{
  let area=0,flips=0;
  for(let i=0;i<250;i++){
    const z=520+Math.sin(i*.41)*17;
    const next=areaArrival(area,z);
    if(next!==area)flips++;
    area=next;
  }
  assert.equal(flips,0);
  assert.equal(areaArrival(0,543),1);
  assert.equal(areaArrival(1,527),1);
  assert.equal(areaArrival(1,497),0);
  assert.equal(areaArrival(1,993),2);
  assert.equal(areaArrival(2,948),1);
});
test('invalid input is inert or rejected without hiding player progress',()=>{
  assert.equal(areaArrival(0,NaN),0);
  assert.equal(areaArrival(2,Infinity),2);
  assert.throws(()=>areaArrival(5,700),RangeError);
});

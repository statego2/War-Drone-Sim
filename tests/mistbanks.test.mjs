import test from 'node:test';
import assert from 'node:assert/strict';
import {MIST_STYLES,mistLayout} from '../src/mistbanks.mjs';
import {TILE,hash,groundHeight,roadCenter} from '../src/flight3d.mjs';

test('river valley gets dramatically richer ground mist than highland and pine forest',()=>{
  assert.equal(MIST_STYLES.length,3);
  assert.ok(MIST_STYLES[1].count>MIST_STYLES[0].count);
  assert.ok(MIST_STYLES[1].alpha>MIST_STYLES[2].alpha);
  let valley=0,pine=0,ridge=0;
  for(let cx=-2;cx<=2;cx++)for(let cz=0;cz<=4;cz++){
    const n=mistLayout(cx,cz,TILE,hash,groundHeight,roadCenter).length;
    if(cz===0)pine+=n;
    else if(cz===2)valley+=n;
    else if(cz===4)ridge+=n;
  }
  assert.ok(valley>pine*2);
  assert.ok(valley>ridge*2);
});
test('all fog planes are sparse, reproducible, off the road and near the ground',()=>{
  for(let cx=-2;cx<=2;cx++)for(let cz=0;cz<5;cz++){
    const result=mistLayout(cx,cz,TILE,hash,groundHeight,roadCenter);
    assert.deepEqual(result,mistLayout(cx,cz,TILE,hash,groundHeight,roadCenter));
    assert.ok(result.length<=5);
    for(const m of result){
      const x=cx*TILE+m.x,z=cz*TILE+m.z;
      assert.ok(Math.abs(x-roadCenter(z))>=24);
      assert.ok(m.y>=groundHeight(x,z)+2 && m.y<groundHeight(x,z)+6);
      assert.ok(m.width>=35&&m.width<=65&&m.length>=25&&m.length<=51);
      assert.ok(m.opacity>0&&m.opacity<.34);
      assert.ok(Number.isFinite(m.y)&&Number.isFinite(m.color));
    }
  }
});

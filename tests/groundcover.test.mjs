import test from 'node:test';
import assert from 'node:assert/strict';
import {COVER_STYLES,coverStyle,coverKind,coverColor} from '../src/groundcover.mjs';

test('three biomes have distinctive ground-level palettes, not one generic grass',()=>{
  assert.equal(COVER_STYLES.length,3);
  assert.deepEqual([coverStyle(200).name,coverStyle(700).name,coverStyle(1150).name],
    ['pine-understory','river-meadows','amber-heather']);
  assert.equal(new Set([200,700,1150].map(z=>coverColor(z,'grass',.35))).size,3);
  assert.equal(new Set([200,700,1150].map(z=>coverColor(z,'stone',.51))).size,3);
  assert.ok(COVER_STYLES.every(x=>x.count>=120&&x.count<=190));
});
test('wetland produces reeds and flowers, highlands produce rocky undergrowth',()=>{
  assert.equal(coverKind(700,9,true),'reed');
  assert.notEqual(coverKind(700,9,false),'reed');
  assert.equal(coverKind(1150,7,false),'stone');
  assert.equal(coverKind(700,13,false),'flower');
  assert.equal(coverKind(200,47,false),'flower');
});
test('color selection is bounded, reproducible, with small fixed asset palette',()=>{
  for(const z of [200,700,1150])for(const kind of ['stone','flower','grass','reed']){
    const color=coverColor(z,kind,.531);
    assert.equal(color,coverColor(z,kind,.531));
    assert.ok(Number.isInteger(color)&&color>=0&&color<=0xffffff);
  }
  assert.equal(coverColor(200,'grass',100),coverStyle(200).grasses.at(-1));
});

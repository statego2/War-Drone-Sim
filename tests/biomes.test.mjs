import test from 'node:test';
import assert from 'node:assert/strict';
import {BIOMES,biomeIndex,biomeBlend,biomePalette,biomeFoliage,biomeVegetation} from '../src/biomes.mjs';

test('all three forest landscapes have distinct visual signatures',()=>{
  assert.deepEqual([biomeIndex(200),biomeIndex(710),biomeIndex(1130)],[0,1,2]);
  assert.equal(new Set(BIOMES.map(x=>x.name)).size,3);
  assert.equal(new Set(BIOMES.map(x=>x.zenith)).size,3);
  assert.equal(new Set(BIOMES.map(x=>x.fog)).size,3);
  for(const p of BIOMES){
    assert.ok(p.terrain.length>=4);
    assert.ok(p.deciduous.length>=3&&p.evergreen.length>=3);
    assert.ok(p.fogFactor>.4&&p.fogFactor<2);
  }
});
test('atmospheric transitions are continuous rather than snapping at sector boundaries',()=>{
  for(const z of [469,470,499,519,520,550,569,570,919,920,969,970,1019,1020]){
    const current=biomeBlend(z);
    assert.ok(current.t>=0 && current.t<=1);
    const next=biomeBlend(z+.001);
    if(current.from!==next.from||current.to!==next.to){
      assert.ok(current.t<.00001||current.t>.99999);
    }else assert.ok(Math.abs(current.t-next.t)<.0001);
  }
  assert.deepEqual(biomeBlend(300),{from:0,to:0,t:0});
  assert.deepEqual(biomeBlend(725),{from:1,to:1,t:0});
});
test('different exploration zones favor different tree silhouettes and seasons',()=>{
  assert.notEqual(biomeFoliage(200,.38,true),biomeFoliage(1130,.38,true));
  assert.notEqual(biomeFoliage(710,.35,false),biomeFoliage(200,.35,false));
  assert.ok(biomeVegetation(710).deciduousEvery<biomeVegetation(200).deciduousEvery);
  assert.ok(biomeVegetation(1130).rocksEvery<biomeVegetation(710).rocksEvery);
  assert.equal(biomePalette(1130).name,'AMBER HIGHLANDS');
});

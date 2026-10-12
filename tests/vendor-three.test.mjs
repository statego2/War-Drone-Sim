import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(fileURLToPath(new URL(p,root)),'utf8');
test('local Three modules are pinned to v0.180 and retain MIT notices',()=>{
  const mod=read('vendor/three.module.min.js');
  const core=read('vendor/three.core.min.js');
  const license=read('vendor/THREE_LICENSE.txt');
  assert.match(mod,/SPDX-License-Identifier: MIT/);
  assert.match(core,/SPDX-License-Identifier: MIT/);
  assert.ok(mod.includes('three.core.min.js'),'module resolves core relative to itself');
  assert.ok(core.slice(0,200).includes('"180"'),'pinned major Three revision');
  assert.match(license,/The MIT License/);
  assert.match(read('src/game3d.mjs'),/import \* as THREE from '\.\.\/vendor\/three\.module\.min\.js'/);
});

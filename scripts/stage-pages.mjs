// The single source of truth for what GitHub Pages actually publishes.
// Never add a runtime import without also including it in this staged output.
import {cp,copyFile,mkdir,readFile,rm,stat} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

export const PROJECT_ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const REQUIRED=[
  'index.html','legacy-canvas.html','.nojekyll',
  'src/game3d.mjs','src/style3d.css','src/flight3d.mjs',
  'vendor/three.module.min.js','vendor/three.core.min.js',
  'vendor/THREE_LICENSE.txt'
];

export async function validatePages(publicRoot=join(PROJECT_ROOT,'public')){
  const issues=[];
  for(const path of REQUIRED){
    try{const entry=await stat(join(publicRoot,path));if(!entry.isFile())issues.push(path+': not a file');}
    catch{issues.push(path+': MISSING');}
  }
  if(issues.length)throw new Error('GitHub Pages release incomplete: '+issues.join(', '));

  const page=await readFile(join(publicRoot,'index.html'),'utf8');
  const game=await readFile(join(publicRoot,'src/game3d.mjs'),'utf8');
  const three=await readFile(join(publicRoot,'vendor/three.module.min.js'),'utf8');
  if(!page.includes("import('./src/game3d.mjs')"))issues.push('index has no 3D game entrypoint');
  if(!game.includes("from '../vendor/three.module.min.js'"))issues.push('game3d points to wrong Three.js module');
  if(!three.includes('from"./three.core.min.js"') && !three.includes("from'./three.core.min.js'"))
    issues.push('Three.js module cannot find matching local core module');
  if(issues.length)throw new Error('GitHub Pages release invalid: '+issues.join(', '));
  return {ok:true,files:REQUIRED.length,renderer:'local Three.js r180'};
}

export async function stagePages({sourceRoot=PROJECT_ROOT,publicRoot=join(sourceRoot,'public')}={}){
  await rm(publicRoot,{recursive:true,force:true});
  await mkdir(publicRoot,{recursive:true});
  for(const file of ['index.html','legacy-canvas.html','.nojekyll']){
    await mkdir(dirname(join(publicRoot,file)),{recursive:true});
    await copyFile(join(sourceRoot,file),join(publicRoot,file));
  }
  for(const directory of ['src','vendor']){
    await cp(join(sourceRoot,directory),join(publicRoot,directory),{recursive:true});
  }
  return validatePages(publicRoot);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const result=await stagePages();
  console.log('Pages staged and verified:',JSON.stringify(result));
}

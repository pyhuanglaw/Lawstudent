// 教學館變快（PERF-PATROL-ECON-1025，LAWWW2-B 2026-10-25；LAWWW-B 同意 ①②）——不需要瀏覽器。
//   博雅大廳往北看 SwiftShader 1.55 fps（往南 4.1）：同一頁一次藏一類，室內殼 GLB 改單面 →1.95、自習椅＋桌子藏起來 →2.15。
//   ① 博雅、普通的室內殼（teach_interior.py）除了玻璃都單面；家具模組 furniture_study.glb 單面（網格都是封閉的：方盒、Solidify 的夾板、有蓋的圓管）。
//   ② 自習椅 10 m 外換 study_chair_lod1（72 個三角形；完整版 1,020）：teach3d.js 的 chairLod，9.5 m 內換回來；真的照距離分兩組、數量對、有變動才重填。
//   ③ 燈：配置的燈當燈位，真的光源只有 3 盞（lightPool／lightStep），跟著玩家換到最近的 3 個燈位（3D 距離）、換的時候淡出淡入、白天晚上亮度照 on／off；光源數一直是 3。
// 修改前 FAIL。用法：node tests/teach_perf_econ_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const glb=f=>{ const b=fs.readFileSync(path.join(ROOT,f)), jl=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+jl).toString('utf8')); };
const tris=(J,name)=>{ const n=J.nodes.find(n=>n.name===name); if(!n||n.mesh==null) return 0; return J.meshes[n.mesh].primitives.reduce((s,p)=>s+J.accessors[p.indices!=null?p.indices:p.attributes.POSITION].count/3,0); };
// ① 單面
for(const set of ['boya','putong']){ const J=glb('assets/models/env/second_ai/'+set+'_interior.glb'); const ds=J.materials.filter(m=>m.doubleSided).map(m=>m.name);
  check('① '+set+'_interior.glb 只有玻璃是雙面（'+J.materials.length+' 個材質）', ds.length===1&&ds[0]==='tb_glass', '雙面：'+ds.join(' '));
  const blend=J.materials.filter(m=>m.alphaMode==='BLEND').map(m=>m.name); check('① '+set+' 玻璃照舊半透明', blend.length===1&&blend[0]==='tb_glass', blend.join(' ')); }
{ const J=glb('assets/models/env/second_ai/furniture_study.glb'); const m=J.materials.find(m=>m.name==='study_furn');
  check('① furniture_study.glb 的 study_furn 是單面', !!m&&!m.doubleSided);
  const a=tris(J,'study_chair'), b=tris(J,'study_chair_lod1'); check('② furniture_study.glb 有 study_chair_lod1，三角形 ≤ 完整版的 10%', a>0&&b>0&&b<=a*0.1, b+' / '+a); }
// ② teach3d.js 的 chairLod
const src=fs.readFileSync(path.join(ROOT,'src/teach3d.js'),'utf8');
check('② teach3d.js 放椅子時有 study_chair_lod1 那一組', /mk\('study_chair_lod1'\)/.test(src)&&/zone\.chairLods/.test(src));
const blk=/const CHAIR_LOD_D=[\s\S]*?\n  function chairLod\(zone,E\)\{[\s\S]*?\} \} \}\n/.exec(src);
check('② 找得到 chairLod', !!blk);
if(blk){ vm.runInThisContext(fs.readFileSync(path.join(ROOT,'lib/three.bundle.js'),'utf8').replace(/^const (\w+)\s*=/m,'globalThis.$1='),{filename:'three'});
  const f=vm.runInThisContext('(function(){ '+blk[0]+' return {chairLod,CHAIR_LOD_D,CHAIR_LOD_BACK}; })()');
  check('② 切換距離 10 m、換回來 9.5 m', f.CHAIR_LOD_D===10&&f.CHAIR_LOD_BACK===9.5, f.CHAIR_LOD_D+' / '+f.CHAIR_LOD_BACK);
  const geo=new THREE.BoxGeometry(0.4,0.8,0.4), mat=new THREE.MeshStandardMaterial(); const N=12, out=new THREE.Group();
  const mk=()=>{ const im=new THREE.InstancedMesh(geo,mat,N); im.count=0; out.add(im); return im; };
  const L={out,near:mk(),far:mk(),list:[...Array(N)].map((_,i)=>({x:i*2,z:0,m:new THREE.Matrix4().makeTranslation(i*2,0,0),near:true})),done:false}; const zone={chairLods:[L]};
  const cam=new THREE.PerspectiveCamera(); cam.position.set(0,0,0); const E={camera:cam};
  f.chairLod(zone,E);   // 0,2,4,…,22 m：10 m 以內 6 張（0～10）、以外 6 張
  check('② 10 m 內完整版、外面遠處版', L.near.count===6&&L.far.count===6, L.near.count+' / '+L.far.count);
  const v0=L.near.instanceMatrix.version; f.chairLod(zone,E); check('② 沒有變動不重填', L.near.instanceMatrix.version===v0);
  cam.position.set(0.3,0,0); f.chairLod(zone,E);   // 10 m 那張變成 9.7 m：照舊完整版；10.3 m 外那張（12 m 的 11.7）照舊遠處版
  check('② 9.5～10 m 之間不會來回換', L.near.count===6&&L.far.count===6, L.near.count+' / '+L.far.count);
  cam.position.set(-0.6,0,0); f.chairLod(zone,E);   // 10 m 那張變 10.6 m → 遠處版
  check('② 超過 10 m 換成遠處版', L.near.count===5&&L.far.count===7, L.near.count+' / '+L.far.count);
  cam.position.set(0.6,0,0); f.chairLod(zone,E);   // 10 m 那張 9.4 m → 完整版；12 m 那張 11.4 m 照舊遠處版
  check('② 9.5 m 內換回完整版', L.near.count===6&&L.far.count===6, L.near.count+' / '+L.far.count);
  const p=new THREE.Vector3(); const xs=[]; for(let i=0;i<L.near.count;i++){ L.near.getMatrixAt(i,new THREE.Matrix4()); const m=new THREE.Matrix4(); L.near.getMatrixAt(i,m); p.setFromMatrixPosition(m); xs.push(p.x); }
  check('② 完整版放的是近的那幾張', xs.join(',')==='0,2,4,6,8,10', xs.join(',')); }

// ③ 燈
const lb=/  const LIGHT_K=[\s\S]*?\n  function lightStep\(zone,dt,E\)\{[\s\S]*?sl\.l\.intensity=sl\.s\?sl\.k\*\(P\.on\?sl\.s\.on:sl\.s\.off\):0; \}\n/.exec(src);
check('③ teach3d.js 建燈的地方呼叫 lightPool', /lights\.push\(l\); \}\n    lightPool\(zone,g,lights\);/.test(src));
check('③ 找得到 lightPool／lightStep', !!lb);
if(lb){ const f=vm.runInThisContext('(function(){ '+lb[0]+' return {lightPool,lightStep,LIGHT_K,LIGHT_FADE}; })()');
  const BOYA=[[0,3.9,2,6,4],[0,3.9,-3,5,3],[-11.4,3.9,-3,6,3],[-11.4,3.9,5,6,3],[11.4,3.9,-3,6,3],[11.4,3.9,5,6,3],[0,8.2,1,6,4],[-11.4,8.2,-4.6,6,3],[11.4,8.2,-4.6,6,3]];
  const g=new THREE.Group(), lights=[]; for(const [x,y,z,on,off] of BOYA){ const l=new THREE.PointLight(0xfff4e6,off,16,2); l.position.set(x,y,z); l.userData.on=on; l.userData.off=off; g.add(l); lights.push(l); }
  const zone={group:g}; f.lightPool(zone,g,lights);
  const pls=()=>g.children.filter(o=>o.isPointLight);
  check('③ 博雅 9 盞 → 真的光源 3 盞', f.LIGHT_K===3&&pls().length===3, pls().length+' 盞');
  const pl={obj:{position:new THREE.Vector3(0,0,4)}}, E={player:pl};
  zone.onLamps(false); zone.update(1/30,E);
  const lit=()=>pls().filter(l=>l.intensity>0).map(l=>[l.position.x,l.position.y,l.position.z].join(',')+'@'+l.intensity.toFixed(2)).sort();
  check('③ 進來第一格就是最近的 3 盞、白天的亮度（大廳兩盞＋上面二樓中間那盞）', JSON.stringify(lit())===JSON.stringify(['0,3.9,-3@3.00','0,3.9,2@4.00','0,8.2,1@4.00']), lit().join(' '));
  zone.onLamps(true); check('③ 開燈（晚上）馬上換成 on 的亮度', JSON.stringify(lit())===JSON.stringify(['0,3.9,-3@5.00','0,3.9,2@6.00','0,8.2,1@6.00']), lit().join(' '));
  pl.obj.position.set(-11.4,0,1);   // 走進西邊的階梯教室
  zone.update(1/30,E); const mid=pls().map(l=>l.intensity);
  check('③ 換燈位不會一下子跳：下一格還在淡出（亮度在 0 和原本之間）', mid.some(v=>v>0&&v<6)&&pls().length===3, mid.map(v=>v.toFixed(2)).join(' '));
  for(let i=0;i<60;i++) zone.update(1/30,E);
  check('③ 淡完以後是教室裡的兩盞＋教室上面二樓那盞', JSON.stringify(lit())===JSON.stringify(['-11.4,3.9,-3@6.00','-11.4,3.9,5@6.00','-11.4,8.2,-4.6@6.00']), lit().join(' '));
  pl.obj.position.set(0,4.8,1); for(let i=0;i<60;i++) zone.update(1/30,E);   // 上二樓
  check('③ 上二樓：最近的是正下方大廳的兩盞＋二樓中間那盞', JSON.stringify(lit())===JSON.stringify(['0,3.9,-3@5.00','0,3.9,2@6.00','0,8.2,1@6.00']), lit().join(' '));
  pl.obj.position.set(-11.4,0,1); for(let i=0;i<60;i++) zone.update(1/30,E);
  check('③ 光源數一直是 3（shader 不重編）', pls().length===3&&g.children.filter(o=>o.isPointLight).length===3);
  zone.onLamps(false); check('③ 關燈（白天）回到 off 的亮度', JSON.stringify(lit())===JSON.stringify(['-11.4,3.9,-3@3.00','-11.4,3.9,5@3.00','-11.4,8.2,-4.6@3.00']), lit().join(' ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

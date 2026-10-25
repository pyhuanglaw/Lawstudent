// 停著的車遠處換低面數版本（US-COMMUNITY-EAST-PERF，LAWWW2-B 2026-10-25）——不需要瀏覽器，讀 GLB 和 us3d.js。
//   美國社區往東（停車場、公寓）SwiftShader 1.6～1.9 fps，量出來最貴的是停車場的 28 台車（藏起來 1.9 → 3.3）：每台約 5,800 個三角形，陰影那一輪再畫一次。
//   合併網格沒有用（draw call 少了、fps 一樣），慢的是三角形；把 15 m 外的車藏起來 1.9 → 2.6。
//   做法：us_cars.py 每款多匯出一個 <款式>_lod1（輪廓、比例、車窗、顏色一樣，只減細節）；us3d.js 放車時包 THREE.LOD，離鏡頭 CAR_LOD_D 以外換低面數。
//   1. 五款都有完整版和 _lod1；_lod1 的三角形 ≤ 完整版的 30%；
//   2. _lod1 的大小（長寬高）和完整版差 ≤ 3 cm（遠看輪廓一樣、不會跳一下）；材質一樣（車漆照樣上色、車燈照樣關）；
//   3. 完整版的三角形和改前一樣（近處的車一點都沒變）；
//   4. us3d.js 放車：有 _lod1 就包 THREE.LOD、切換距離 CAR_LOD_D ≥ 10 m（玩家身邊的車都是完整版）。
// 修改前 FAIL。用法：node tests/us_cars_lod_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/us_cars.glb')), jl=buf.readUInt32LE(12), J=JSON.parse(buf.slice(20,20+jl).toString('utf8'));
// 每個節點底下（含自己）的三角形、材質、範圍（節點只有平移：車的零件掛在款式節點下、位置 0）
function stat(ni){ let tris=0; const mats=new Set(), mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9];
  const walk=(k,off)=>{ const q=J.nodes[k], t=q.translation||[0,0,0], o=[off[0]+t[0],off[1]+t[1],off[2]+t[2]];
    if(q.mesh!=null) for(const p of J.meshes[q.mesh].primitives){ const a=J.accessors[p.attributes.POSITION]; tris+=(p.indices!=null?J.accessors[p.indices].count:a.count)/3; mats.add(J.materials[p.material].name);
      for(let i=0;i<3;i++){ mn[i]=Math.min(mn[i],a.min[i]+o[i]); mx[i]=Math.max(mx[i],a.max[i]+o[i]); } }
    (q.children||[]).forEach(c=>walk(c,o)); };
  walk(ni,[0,0,0]); return {tris,mats,size:[0,1,2].map(i=>mx[i]-mn[i])}; }
const KINDS=['car_sedan','car_suv','car_pickup','car_hatch','car_minivan'];
const BEFORE={car_sedan:5708,car_suv:5944,car_pickup:5684,car_hatch:5888,car_minivan:5964};   // 改前 us_cars.json 的 tris_per_car
for(const k of KINDS){ const a=J.nodes.findIndex(n=>n.name===k), b=J.nodes.findIndex(n=>n.name===k+'_lod1');
  check('1. '+k+' 有完整版和 _lod1', a>=0&&b>=0);
  if(a<0||b<0) continue;
  const A=stat(a), Bs=stat(b);
  check('1. '+k+'_lod1 的三角形 ≤ 完整版的 30%', Bs.tris<=A.tris*0.3, Bs.tris+' ／ '+A.tris);
  const d=Math.max(...[0,1,2].map(i=>Math.abs(A.size[i]-Bs.size[i])));
  check('2. '+k+'_lod1 的長寬高和完整版差 ≤ 3 cm', d<=0.03, '差 '+(d*100).toFixed(1)+' cm');
  const miss=[...A.mats].filter(m=>!Bs.mats.has(m)&&m!=='car_chrome');   // 門把（鍍鉻）遠處不做
  check('2. '+k+'_lod1 的材質和完整版一樣（車漆、車燈、玻璃、輪胎…）', miss.length===0, miss.join(' '));
  check('3. '+k+' 完整版的三角形和改前一樣（近處的車沒變）', A.tris===BEFORE[k], A.tris+'（改前 '+BEFORE[k]+'）'); }
const us=fs.readFileSync(path.join(ROOT,'src/us3d.js'),'utf8');
const D=us.match(/const CAR_LOD_D=([0-9.]+);/);
check('4. us3d.js 有切換距離 CAR_LOD_D ≥ 10 m', !!D&&+D[1]>=10, D?D[1]+' m':'找不到');
check('4. us3d.js 放車：找 <款式>_lod1、包 THREE.LOD（近：完整版，遠：_lod1）', /src\.getObjectByName\(car\.kind\+'_lod1'\)/.test(us)&&/q=new THREE\.LOD\(\); q\.addLevel\(prep\(node\),0\); q\.addLevel\(prep\(low\),CAR_LOD_D\);/.test(us));
check('4. 兩個版本都照原本上色、關車燈、投影子（同一個 prep）', /const prep=nd=>\{ const q=nd\.clone\(true\);[\s\S]*?r\.castShadow=true;[\s\S]*?car_paint[\s\S]*?GLOW_car[\s\S]*?return q; \};/.test(us));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

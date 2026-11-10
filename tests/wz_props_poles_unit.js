// 溫州街電線桿：遊戲的套件位置和正式模型（wz_props.glb）一樣（LAWWW2-C 2026-11-04）——不需要瀏覽器。
// 起因：ADE-PROPS-1104 把 A 側第二支電線桿從 x −9.2 挪到 −12.7，只改了 zones3d.js 的套件（導航阻擋、電線、路燈地面光圈都跟著套件），
//   wz_props.glb 裡的正式電線桿和路燈臂還在 −9.2。正式模型一載入就把套件藏起來，所以畫面上的桿子還擋在阿德的價目表前面、
//   −12.7 那裡有看不見的阻擋、電線接到半空中。
// 檢查：建出遊戲真正的溫州街（Z3.ZONES.wenzhou），套件的電線桿（userData.wzProp==='pole'）和 wz_props.glb 的 utility_pole（EXT_mesh_gpu_instancing）
//   一根對一根，差 ≤ 5 cm；有路燈的（userData.lamp）和 pole_lamp_arm 也一樣。
// 修改前（開發分支 effb5d9b3 的 wz_props.glb）：FAIL（−12.7 沒有正式桿、−9.2 多一根）。修改後（wz_props.py 的 POLES 改 −12.7、重建）：ALL PASS。
// 用法：node tests/wz_props_poles_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
// 載入 index.html 到 teach3d.js 為止的區域檔（不要人物、劇情），再加上 118 巷、溫州街小店、腳踏車
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const files=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; files.push(f); if(/teach3d\.js$/.test(f)) break; }
for(const f of ['src/lane118.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js','src/wzpark3d.js','src/wzshops3d.js','src/bike3d.js','src/bikeshop3d.js','src/mokuyobi_sys3d.js','src/offbeat_sys3d.js']) if(!files.includes(f)) files.push(f);
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
  const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null; return z; }
function instances(file, meshName){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8); const out=[];
  for(const nd of J.nodes){ const ext=nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing; if(!ext||nd.mesh==null||J.meshes[nd.mesh].name!==meshName) continue;
    const a=J.accessors[ext.attributes.TRANSLATION], v=J.bufferViews[a.bufferView], off=bin.byteOffset+(v.byteOffset||0)+(a.byteOffset||0); const f=new Float32Array(bin.buffer.slice(off,off+a.count*12));
    for(let i=0;i<a.count;i++) out.push([f[i*3],f[i*3+2]]); }
  return out; }
const z=loadZone('wenzhou'); z.group.updateMatrixWorld(true); const v=new THREE.Vector3();
const kitPoles=[], kitArms=[]; z.group.traverse(o=>{ const u=o.userData||{}; if(u.wzProp==='pole'&&o.getWorldPosition){ o.getWorldPosition(v); kitPoles.push([+v.x.toFixed(3),+v.z.toFixed(3)]); if(u.lamp) kitArms.push([+v.x.toFixed(3),+v.z.toFixed(3)]); } });
const GLB=path.join(ROOT,'assets/models/env/second_ai/wz_props.glb');
const glbPoles=instances(GLB,'utility_pole'), glbArms=instances(GLB,'pole_lamp_arm');
function match(A,B){ const miss=A.filter(p=>!B.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<=0.05)), extra=B.filter(q=>!A.some(p=>Math.hypot(p[0]-q[0],p[1]-q[1])<=0.05)); return {miss, extra}; }
const f=v=>JSON.stringify(v.map(p=>p.map(x=>+x.toFixed(2))));
const m1=match(kitPoles,glbPoles), m2=match(kitArms,glbArms);
check('① 套件的電線桿 '+kitPoles.length+' 根，正式模型的 '+glbPoles.length+' 根：一根對一根（差 ≤ 5 cm）',kitPoles.length>0&&!m1.miss.length&&!m1.extra.length,'套件有、正式模型沒有 '+f(m1.miss)+'；正式模型多的 '+f(m1.extra));
check('② 有路燈的電線桿 '+kitArms.length+' 根，正式模型的路燈臂 '+glbArms.length+' 支：一支對一支',kitArms.length>0&&!m2.miss.length&&!m2.extra.length,'套件有、正式模型沒有 '+f(m2.miss)+'；正式模型多的 '+f(m2.extra));
console.log(fails?('FAILS: '+fails):'ALL PASS'); process.exit(fails?1:0);

// 美國校園公車站候車亭（LAWWW2 10-22 美國巡場景重拍 j38b）——不需要瀏覽器。
// 看到的：鏡頭轉到候車亭那一側時，鏡頭在屋頂上方，屋頂（原本和柱子同一種深灰金屬 usu_steel，金屬度 0.45、遊戲沒有環境貼圖）是畫面左邊一整塊黑；
//   站牌柱剛好在鏡頭和人中間。
// 改法：①屋頂自己一個材質 usu_shelter_roof（淺灰烤漆鋁板，金屬度 0.1；tools/blender/env_second/us_campus.py）；
//   ②src/us3d.js 的 SEE_MATS 加 us_campus：候車亭的框、站牌柱（usu_steel）、玻璃、屋頂擋住人時網點透空（和超市街的站牌柱同一套）。
// 檢查：在 Node 建出美國校園（正式模型換成假的：每一種材質一個小網格），只有這三種材質標了 seeThrough；讀真的 GLB：屋頂是淺色、不是金屬，
//   屋頂的頂面在候車亭上方 2.62 m，站牌柱的頂點在 usu_steel 裡。
// 用法：node tests/us_campus_shelter_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const SEE=['usu_steel','usu_shelter_glass','usu_shelter_roof'], OTHER=['usu_bench_wood','usu_lamp_green','usu_line_white','usu_soil','usu_vc','usu_window_glass'];
function fakeModel(){ const g=new THREE.Group(); for(const n of SEE.concat(OTHER)){ const m=new THREE.MeshStandardMaterial({name:n}); const me=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),m); me.name=n; g.add(me); } return g; }
let pend=[]; ASSETS.loadOne=k=>{ if(k==='bldg.us_campus'){ const p=Promise.resolve({scene:fakeModel()}); pend.push(p); return p; } return new Promise(()=>{}); };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
global.GAME={G:{hour:15,weather:'clear',flags:{},zone:'us_campus'}};
(async()=>{
  check('有美國校園（US_CAMPUS_LAYOUT 配置）、E.patchSeeThrough',!!Z3.ZONES.us_campus&&typeof E.patchSeeThrough==='function');
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.us_campus.build(E); z.def=Z3.ZONES.us_campus; E.zone=z; await Promise.all(pend); await new Promise(r=>setTimeout(r,0));
  const mats={}; z.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name) mats[o.material.name]=o.material; });
  check('正式模型接上了（假的模型）',SEE.concat(OTHER).every(n=>!!mats[n]),Object.keys(mats).length+' 種材質');
  const no=SEE.filter(n=>!(mats[n]&&mats[n].userData.seeThrough&&mats[n].userData._st));
  check('候車亭的框和站牌柱（usu_steel）、玻璃、屋頂網點透空：標了 seeThrough、patch 過 shader',no.length===0,no.length?('沒有：'+no.join('、')):'');
  const others=OTHER.filter(n=>mats[n]&&mats[n].userData.seeThrough);
  check('其他材質不透空（長椅、路燈、地面、窗玻璃）',others.length===0,others.join('、'));
  /* 真的 GLB */
  const L=US_CAMPUS_LAYOUT, bs=L.bus, x0=bs.x-bs.w/2, x1=bs.x+bs.w/2, zb=bs.z-bs.d/2, zf=bs.z+bs.d/2, sp=x1+0.9;
  const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/us_campus.glb')), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), off=20+n, bin=b.slice(off+8,off+8+b.readUInt32LE(off));
  const roof=j.materials.find(m=>m.name==='usu_shelter_roof');
  const c=roof&&roof.pbrMetallicRoughness&&roof.pbrMetallicRoughness.baseColorFactor, lum=c?0.2126*c[0]+0.7152*c[1]+0.0722*c[2]:0, met=roof&&roof.pbrMetallicRoughness?(roof.pbrMetallicRoughness.metallicFactor==null?1:roof.pbrMetallicRoughness.metallicFactor):1;
  check('GLB：屋頂有自己的材質 usu_shelter_roof，淺色（線性亮度 ≥ 0.3）、不是金屬（≤ 0.2）',!!roof&&lum>=0.3&&met<=0.2,roof?('亮度 '+lum.toFixed(2)+'、金屬度 '+met):'沒有這個材質');
  const names=j.materials.map(m=>m.name); let top=0, pole=0;
  for(const nd of j.nodes){ if(nd.mesh==null) continue; const t=nd.translation||[0,0,0]; for(const pr of j.meshes[nd.mesh].primitives){ const nm=names[pr.material]; if(nm!=='usu_shelter_roof'&&nm!=='usu_steel') continue; const a=j.accessors[pr.attributes.POSITION], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12;
    for(let k=0;k<a.count;k++){ const x=bin.readFloatLE(o+k*st)+t[0], y=bin.readFloatLE(o+k*st+4)+t[1], zz=bin.readFloatLE(o+k*st+8)+t[2];
      if(nm==='usu_shelter_roof'&&Math.abs(y-2.62)<0.01&&x>x0-0.2&&x<x1+0.2&&zz>zb-0.2&&zz<zf+0.3) top++;
      if(nm==='usu_steel'&&Math.hypot(x-sp,zz-(zf+0.3))<0.06&&y>-0.01&&y<2.85) pole++; } } }
  check('GLB：屋頂的頂面（2.62 m）在 usu_shelter_roof 裡',top>=4,top+' 個頂點');
  check(`GLB：站牌柱 (${sp.toFixed(1)}, ${(zf+0.3).toFixed(1)}) 的頂點在 usu_steel 裡（網點透空的那一種）`,pole>=8,pole+' 個頂點');
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();

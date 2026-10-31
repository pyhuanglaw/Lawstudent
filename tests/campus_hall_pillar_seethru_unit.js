// 總圖、行政大樓、文學院、校史館的門廊、拱廊柱子擋住跟隨鏡頭（CAM-PILLAR-HALLS-1031，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// 總圖門口往旁邊 2.6 m，門廊的石柱把人切掉一半（tests/linze_pillar_seethru_unit.js 是霖澤館同一個問題）。四棟都是 tools/blender/env_second/campus_hall.py 匯出的正式模型，
//   柱子原本和收邊（ck_trim）、牆（ck_wall）合併在一起，不能整個材質標透視。
// 做法：門廊石柱（柱身、柱頭、柱礎）、拱廊柱墩的柱頭柱腳 → seethru_ck_col；拱廊的面磚柱墩 → seethru_ck_pier（同一張貼圖）；
//   zones3d.js 的 attachWenzhouModel 把 seethru_ 開頭的材質標 userData.seeThrough、E.patchSeeThrough（和騎樓柱子 wz_pillar_ 同一套）。
// 檢查：①真的 GLB：兩個柱子材質都在、只在一樓（柱子，不含簷口、屋頂）；收邊、牆照舊在、比柱子高 3 m 以上 ②在 Node 建出校園、四棟正式模型換成假的：
//   seethru_ 材質標了透視、patch 過 shader，收邊、牆、玻璃沒有。
// 用法：node tests/campus_hall_pillar_seethru_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }

let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
process.on('unhandledRejection',()=>{});
const SETS={library:'總圖',admin:'行政大樓',arts:'文學院',hist:'校史館'};
function yRange(j,bin,pred){ let lo=Infinity, hi=-Infinity, tri=0; const names=j.materials.map(m=>m.name);
  for(const nd of j.nodes){ if(nd.mesh==null) continue; const t=nd.translation||[0,0,0];
    for(const pr of j.meshes[nd.mesh].primitives){ if(!pred(names[pr.material])) continue; const a=j.accessors[pr.attributes.POSITION], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12;
      tri+=(pr.indices!=null?j.accessors[pr.indices].count:a.count)/3; for(let k=0;k<a.count;k++){ const y=bin.readFloatLE(o+k*st+4)+t[1]; if(y<lo) lo=y; if(y>hi) hi=y; } } }
  return {lo,hi,tri}; }
/* ① 真的 GLB */
for(const [k,nm] of Object.entries(SETS)){
  const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_'+k+'.glb')), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), off=20+n, bin=b.slice(off+8,off+8+b.readUInt32LE(off));
  const col=yRange(j,bin,x=>x==='seethru_ck_col'), pier=yRange(j,bin,x=>x==='seethru_ck_pier'), trim=yRange(j,bin,x=>x==='ck_trim'), wall=yRange(j,bin,x=>x==='ck_wall');
  check(`① ${nm}：門廊石柱（seethru_ck_col）、拱廊柱墩（seethru_ck_pier）都在，只在一樓（8 m 以下：柱子，不含簷口、屋頂）`,col.tri>0&&pier.tri>0&&col.hi<8&&pier.hi<8&&col.lo<0.05&&pier.lo<0.5,`柱子 ${col.tri} 個三角形、高 ${col.lo.toFixed(2)}～${col.hi.toFixed(2)} m；柱墩 ${pier.tri} 個、${pier.lo.toFixed(2)}～${pier.hi.toFixed(2)} m`);
  check(`① ${nm}：收邊（ck_trim）、牆（ck_wall）照舊在、比柱子高 3 m 以上（簷口、上面的樓層照舊不透視）`,trim.tri>0&&wall.tri>0&&trim.hi>col.hi+3&&wall.hi>pier.hi+3,`收邊到 ${trim.hi.toFixed(1)} m、牆到 ${wall.hi.toFixed(1)} m`);
  const st=j.materials.map(m=>m.name).filter(x=>/^seethru_/.test(x)).sort().join();
  check(`① ${nm}：seethru_ 開頭的只有這兩個材質`,st==='seethru_ck_col,seethru_ck_pier',st);
}
/* ② 校園：四棟正式模型換成假的（每一種材質一個小網格）*/
const MATS=['seethru_ck_col','seethru_ck_pier','ck_trim','ck_trim_win','ck_wall','ck_roof','ck_glass'];
function fakeModel(){ const g=new THREE.Group(); for(const nm of MATS){ const me=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),new THREE.MeshStandardMaterial({name:nm})); me.name=nm; g.add(me); } return g; }
const KEYS=Object.keys(SETS).map(k=>'bldg.campus_'+k), pend=[], got={};
ASSETS.loadOne=k=>{ if(KEYS.includes(k)){ const p=Promise.resolve({scene:fakeModel()}); pend.push(p); return p; } return new Promise(()=>{}); };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; E.ray=E.ray||new THREE.Raycaster();
global.GAME={G:{hour:14,weather:'clear',flags:{},zone:'campus'}};
(async()=>{
  const z=Z3.ZONES.campus.build(E); z.def=Z3.ZONES.campus; E.zone=z; await Promise.all(pend); await new Promise(r=>setTimeout(r,0));
  check('② 四棟的正式模型都接上了（假的模型）',pend.length===4,pend.length+' 棟');
  const bad=[], ok={}; z.group.traverse(o=>{ if(!o.isMesh||!o.material||!MATS.includes(o.material.name)) return; const m=o.material, see=/^seethru_/.test(m.name);
    if(see){ ok[m.name]=(ok[m.name]||0)+((m.userData.seeThrough&&m.userData._st)?1:0); if(!(m.userData.seeThrough&&m.userData._st)) bad.push(m.name); } else if(m.userData.seeThrough) bad.push(m.name); });
  check('② 柱子（seethru_ck_col、seethru_ck_pier）標了透視、patch 過 shader',(ok.seethru_ck_col||0)>=4&&(ok.seethru_ck_pier||0)>=4,JSON.stringify(ok));
  check('② 收邊、窗、牆、屋頂、玻璃不透；柱子沒有漏標',bad.length===0,bad.join('、'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();

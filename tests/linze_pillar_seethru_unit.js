// 霖澤館（法律系館A）穿堂的柱子擋住跟隨鏡頭（BUG-CAM-PILLAR-LAWA-1031，LAWWW2-B 2026-10-31）——不需要瀏覽器。
// BB-B 0eb633624 重現：從南邊 (34,−99) 走到穿堂門口 (34,−106.5)，跟隨鏡頭在後面（南），前排中柱（tools/blender/linze_exterior.py 的 pcol，花崗石 1.2×1.2）把人整個擋住。
//   柱子原本和台階、牆一起合併成 ext_granite，不能整個材質標透視（台階、牆也會網點）。
// 做法：模型的柱子另外一個材質 seethru_ext_granite_col；zones3d.js 的 attachExterior 把 seethru_ 開頭的材質標 userData.seeThrough、E.patchSeeThrough
//   （和行道樹樹幹、電線桿同一套 engine3d.js updateSeeThrough：擋在鏡頭和玩家之間時，玩家周圍網點透空）。
// 檢查：①真的 GLB：七根柱子（穿堂兩側各三、前排中柱）都在 seethru_ext_granite_col、台階和牆照舊在 ext_granite ②在 Node 建出校園、正式模型換成假的：
//   seethru_ 材質標了透視、patch 過 shader，其他材質沒有 ③門口 (34,−106.2) 鏡頭在南（yaw 0）：鏡頭線穿過前排中柱（重現 BB-B 看到的）。
// 用法：node tests/linze_pillar_seethru_unit.js
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
/* ① 真的 GLB：柱子的頂點都在 seethru_ext_granite_col（模型座標：穿堂寬 14、深 18，柱子 1.2×1.2；遊戲放在 (34, −112)、沒有轉）*/
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/linze_exterior.glb')), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), off=20+n, bin=b.slice(off+8,off+8+b.readUInt32LE(off));
const names=j.materials.map(m=>m.name), PW=14, D=18;
const COLS=[[0,D/2-0.6]]; for(const sx of [-1,1]) for(const zc of [D/2-0.6,0,-D/2+0.6]) COLS.push([sx*(PW/2-0.6),zc]);
const corners=COLS.map(()=>new Set()); let nCol=0, outside=0;   /* 柱子是方盒：頂點只在柱腳（穿堂地坪 0.9 m）、柱頂（大梁下緣），每根八個角 */
for(const nd of j.nodes){ if(nd.mesh==null) continue; const t=nd.translation||[0,0,0];
  for(const pr of j.meshes[nd.mesh].primitives){ if(names[pr.material]!=='seethru_ext_granite_col') continue; const a=j.accessors[pr.attributes.POSITION], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12; nCol+=a.count;
    for(let q=0;q<a.count;q++){ const x=bin.readFloatLE(o+q*st)+t[0], y=bin.readFloatLE(o+q*st+4)+t[1], zz=bin.readFloatLE(o+q*st+8)+t[2]; let any=false;
      COLS.forEach((c,ci)=>{ if(Math.abs(Math.abs(x-c[0])-0.6)<0.01&&Math.abs(Math.abs(zz-c[1])-0.6)<0.01){ corners[ci].add([Math.sign(x-c[0]),Math.round(y*10),Math.sign(zz-c[1])].join()); any=true; } }); if(!any) outside++; } } }
check('① GLB：七根柱子（穿堂兩側各三、前排中柱）都在 seethru_ext_granite_col（每根八個角）',corners.every(c=>c.size===8),JSON.stringify(corners.map(c=>c.size)));
check('① GLB：seethru_ext_granite_col 只有這七根柱子（沒有別的東西）',nCol>0&&outside===0,nCol+' 個頂點、柱子以外 '+outside+' 個');
check('① GLB：台階、牆照舊是 ext_granite／ext_granite_dark（沒有被改成透視）',names.includes('ext_granite')&&names.includes('ext_granite_dark')&&names.filter(x=>/^seethru_/.test(x)).join()==='seethru_ext_granite_col',names.filter(x=>/granite/.test(x)).join('、'));
/* ② 校園：正式模型換成假的（每一種材質一個小網格）*/
const MATS=['seethru_ext_granite_col','ext_granite','ext_granite_dark','ext_glass_lit','ext_ceiling','ext_brick'];
function fakeModel(){ const g=new THREE.Group(); for(const nm of MATS){ const me=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),new THREE.MeshStandardMaterial({name:nm})); me.name=nm; g.add(me); } return g; }
const pend=[]; ASSETS.loadOne=k=>{ if(k==='bldg.linze_exterior'){ const p=Promise.resolve({scene:fakeModel()}); pend.push(p); return p; } return new Promise(()=>{}); };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; E.ray=E.ray||new THREE.Raycaster();
global.GAME={G:{hour:17.4,weather:'clear',flags:{},zone:'campus'}};
(async()=>{
  const z=Z3.ZONES.campus.build(E); z.def=Z3.ZONES.campus; E.zone=z; await Promise.all(pend); await new Promise(r=>setTimeout(r,0)); z.group.updateMatrixWorld(true);
  const mats={}; z.group.traverse(o=>{ if(o.isMesh&&o.material&&MATS.includes(o.material.name)) mats[o.material.name]=o.material; });
  check('② 正式模型接上了（假的模型）',MATS.every(nm=>!!mats[nm]),Object.keys(mats).join('、'));
  const col=mats.seethru_ext_granite_col;
  check('② 柱子（seethru_ext_granite_col）網點透空：標了 seeThrough、patch 過 shader',!!(col&&col.userData.seeThrough&&col.userData._st));
  const others=MATS.filter(nm=>nm!=='seethru_ext_granite_col'&&mats[nm]&&mats[nm].userData.seeThrough);
  check('② 其他材質不透空（台階、牆、玻璃、天花板、紅磚）',others.length===0,others.join('、'));
  /* ③ 門口 (34, −106.2)、穿堂地坪 0.9 m；鏡頭 yaw 0（在南）、俯角 0.22、6 m：鏡頭到頭的線穿過前排中柱（世界座標 (34, −103.6)）*/
  const tgt=new THREE.Vector3(34,0.9+1.45,-106.2), cam=new THREE.Vector3(); E.followCam(tgt,0,0.22,6.0,0,cam);
  const cz=-112+D/2-0.6, t=(cz-tgt.z)/(cam.z-tgt.z), x=tgt.x+(cam.x-tgt.x)*t, y=tgt.y+(cam.y-tgt.y)*t;
  check('③ 門口 (34, −106.2)・鏡頭在南：鏡頭線穿過前排中柱（BB-B 看到的；鏡頭碰撞沒有柱子，鏡頭不會被拉近）',t>0&&t<1&&Math.abs(x-34)<0.6&&y>0.9&&y<4.4*2,`鏡頭 (${cam.x.toFixed(2)}, ${cam.y.toFixed(2)}, ${cam.z.toFixed(2)})；穿過 z ${cz} 時 x ${x.toFixed(2)}、高 ${y.toFixed(2)} m`);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();

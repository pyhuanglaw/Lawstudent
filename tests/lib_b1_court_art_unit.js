// LIB-B1-COURT-ART-1110（使用者 11-10 對 LAWWW：「總圖b1樓梯 是往地下走到一個中庭 中庭的部分，我現在看不出來 你請lawww2做」，X307；LAWWW2 帳號 A）——不需要瀏覽器。
// 總圖北側的露天下沉中庭（src/zones3d.js 的 B1C）換成正式模型 lib_b1_court.glb，檢查：
//   1 有 ASSETS 'bldg.lib_b1_court'，GLB 檔在；lib_b1_court.json 的尺寸（B1C）和 zones3d.js 的 B1C 一樣（改一邊沒改另一邊會 FAIL）
//   2 校園建好以後備用的方塊在 b1c_fallback 群組；正式模型載好（這裡給一個假的場景）以後：模型在場景裡、備用方塊藏起來、碰撞盒照舊在 E.colliders（擋鏡頭）
//   3 導航不動：從地面走樓梯到中庭、走到 B1 的門口（「進 B1」互動點）走得到（走路 30 fps、跑步＋低幀率）；門口出生點站得住
//   4 中庭裡新加的兩個樹槽、一張石凳擋住（站不進去），中庭中間、門前、樓梯底照舊站得住
// 修改前（開發分支 9202e2fab）：第 1、2、4 項 FAIL。用法：node tests/lib_b1_court_art_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const TREES=[]; { const orig=TK.tree; TK.tree=(...a)=>{ const t=orig(...a); TREES.push(t); return t; }; }   /* 記下校園上每一棵闊葉樹（檢查方案 A 留下的樹）*/
const glb=path.join(ROOT,'assets/models/env/second_ai/lib_b1_court.glb'), js=path.join(ROOT,'assets/models/env/second_ai/lib_b1_court.json');
const man=ASSETS.manifest['bldg.lib_b1_court'];
check('1 ASSETS 有 bldg.lib_b1_court、GLB 檔在',!!man&&fs.existsSync(glb),man?man.url:'沒有');
const C=Z3.B1C; let info=null; try{ info=JSON.parse(fs.readFileSync(js,'utf8')); }catch(e){}
check('1 lib_b1_court.json 的 B1C 和 zones3d.js 一樣（x0 x1 z0 z1 深）',!!info&&!!C&&JSON.stringify(info.B1C)===JSON.stringify([C.x0,C.x1,C.z0,C.z1,C.dep]),JSON.stringify([info&&info.B1C,C&&[C.x0,C.x1,C.z0,C.z1,C.dep]]));
const fake=new THREE.Group(); { const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial()); m.material.name='lbc_lit_lamp'; m.material.emissive=new THREE.Color(1,1,1); fake.add(m); }
const load0=ASSETS.loadOne; ASSETS.loadOne=k=>k==='bldg.lib_b1_court'?Promise.resolve({scene:fake}):new Promise(()=>{});
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const stand=(x,zz)=>E.canStand(x,zz,0.32,0);
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.6],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed:sp}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return {ok:true}; };
const fbg=z.group.children.find(o=>o.name==='b1c_fallback');
const colIn=fbg?E.colliders.filter(c=>{ let p=c; while(p&&p!==fbg) p=p.parent; return p===fbg; }).length:0;
check('2 備用的方塊在 b1c_fallback 群組裡（牆的碰撞盒也在裡面）',!!fbg&&fbg.children.length>20&&colIn>=5,fbg?`${fbg.children.length} 個、碰撞盒 ${colIn}`:'沒有');
(async()=>{ for(let i=0;i<5;i++) await new Promise(r=>setTimeout(r,0));
  const glbIn=z.group.children.find(o=>o.name==='lib_b1_court_glb');
  check('2 正式模型載好：在場景裡、備用方塊藏起來、碰撞盒照舊在 E.colliders',!!glbIn&&!!fbg&&fbg.visible===false&&colIn>=5&&E.colliders.filter(c=>{ let p=c; while(p&&p!==fbg) p=p.parent; return p===fbg; }).length===colIn,JSON.stringify({glb:!!glbIn,fb:fbg&&fbg.visible}));
  const lamp=glbIn&&glbIn.children[0]; check('2 燈的材質（lbc_lit_*）登記晚上亮（TK.addNight）',!!lamp&&!!lamp.material.userData.nightReg);
  const door=E.interactables.find(i=>/進 B1/.test(i.label||''));
  check('3 有「進 B1（24 小時自習室）」互動點',!!door,door?`(${door.x},${door.z})`:'');
  const TOP=[88.5,-40], BOT=[100.2,-40], DOOR=door?[door.x,door.z-0.3]:[98,-32];
  let r=walk(TOP,DOOR); check('3 從地面（樓梯口西邊）走樓梯下到中庭、走到 B1 門口（走路、跑步＋低幀率）',r.ok,JSON.stringify(r).slice(0,200));
  r=walk(DOOR,TOP); check('3 從門口走回地面',r.ok,JSON.stringify(r).slice(0,200));
  check('3 門口的出生點 (98, −32.8) 站得住',stand(C.spawn.x,C.spawn.z));
  const blocked=[[103.05,-31.95],[103.05,-38.05],[103.65,-35.1]].filter(q=>stand(q[0],q[1]));
  check('4 兩個樹槽、石凳擋住（站不進去）',!blocked.length,JSON.stringify(blocked));
  const free=[[98,-36],[98,-32.4],[100.2,-40.2],[95,-34],[102.5,-35.1]].filter(q=>!stand(q[0],q[1]));
  check('4 中庭中間、門前、樓梯底、西邊、石凳前照舊站得住',!free.length,JSON.stringify(free));
  ASSETS.loadOne=load0; console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0); })();

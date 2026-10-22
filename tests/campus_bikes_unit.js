// 校園停著的腳踏車分區合併＋距離開關（PERF-CAMPUS-SHADOW-1020，LAWWW2 2026-10-21）——不需要瀏覽器。
// 原本：校園約 120 台停著的車被進區域時的全區合併（P3.mergeStatic）併成橫跨 150×180 m 的幾塊，畫面外、很遠的車照樣每一幀畫
// （遊戲內量：大道上主畫面約 14 萬、陰影那一輪約 8 萬個三角形；`docs/art-rebuild/second_ai/test_shots/perf_campus_1021/`）。
// 做法（src/zones3d.js 的 parkedBikeChunks）：40 m 一區、同材質一塊、不參加全區合併；鏡頭 45 m 外整區不畫。
// 檢查：沒有橫跨全校園的車網格；三角形守恆；大道、霖澤館前、校門只畫附近的區；走到每一區旁邊那一區一定畫；停車架照舊擋路、旁邊照舊走得過。
// 用法：node tests/campus_bikes_unit.js
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
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
if(P3.mergeStatic&&!Z3.ZONES.campus.noMerge) P3.mergeStatic(z.group);   /* 和引擎進區域時一樣：全區照材質合併（engine3d.js enter）*/
z.group.updateMatrixWorld(true);
const tri=g=>(g.index?g.index.count:g.attributes.position.count)/3, BIKE=/^bike_|bikeWheel/;
const isBike=m=>{ const ms=Array.isArray(m.material)?m.material:[m.material]; return ms.some(x=>x&&(BIKE.test(x.name||'')||(x.map&&x.map.image&&false))); };
/* 停著的車：分區合併以後的網格（parked_bikes）＋全區合併裡還剩的車（材質名 bike_*：正式模型；程序化備用的車在 Node 裡沒有正式模型，用 parked_bikes 群組判斷）*/
const chunks=(z.parkedBikes&&z.parkedBikes.chunks)||[]; let bikeTris=0, maxSpan=0; for(const c of chunks){ c.o.traverse(m=>{ if(m.isMesh) bikeTris+=tri(m.geometry); }); const s=c.box.getSize(new THREE.Vector3()); maxSpan=Math.max(maxSpan,s.x,s.z); }
let wideBike=0, wideInfo=''; z.group.traverse(m=>{ if(!m.isMesh||!m.userData.merged) return; const ms=Array.isArray(m.material)?m.material:[m.material]; if(!ms.some(x=>x&&BIKE.test(x.name||''))) return; const b=new THREE.Box3().setFromObject(m), s=b.getSize(new THREE.Vector3()); if(Math.max(s.x,s.z)>60){ wideBike++; wideInfo=ms.map(x=>x.name).join('+')+' '+s.x.toFixed(0)+'×'+s.z.toFixed(0)+' m'; } });
check('停著的車分區合併（parked_bikes），沒有被全區合併成橫跨全校園的一塊',chunks.length>=4&&maxSpan<=60&&wideBike===0,`${chunks.length} 區、最大的一區 ${maxSpan.toFixed(0)} m、全區合併裡的車網格（>60 m）${wideBike} 塊 ${wideInfo}`);
/* 三角形守恆：重新建一次校園，數停著的車在合併前的三角形（每一處停車架、單台車）*/
{ const E2=Object.create(E); const saved={}; let before=0; const orig={rack:W3.bikeRack, any:W3.bikeAny}, made=[];
  W3.bikeRack=(...a)=>{ const r=orig.rack(...a); made.push(r); return r; }; W3.bikeAny=(...a)=>{ const b=orig.any(...a); made.push(b); return b; };
  E.interactables=[]; const z2=Z3.ZONES.campus.build(E); W3.bikeRack=orig.rack; W3.bikeAny=orig.any;
  /* 只算校園擺的（parkedRack／parkedBike 收的）：parked_bikes 群組的三角形應該＝這些物件合併前的三角形 */
  let after2=0; for(const c of z2.parkedBikes.chunks) c.o.traverse(m=>{ if(m.isMesh) after2+=tri(m.geometry); });
  const seen=new Set(); for(const o of made){ if(seen.has(o)) continue; seen.add(o); o.traverse(m=>{ if(m.isMesh) before+=tri(m.geometry); }); }
  check('分區合併沒有丟三角形（停車架＋單台車：合併前＝合併後）',before>0&&Math.abs(before-after2)<0.5,`合併前 ${before}、合併後 ${after2}`); E.interactables=[]; z.group.updateMatrixWorld(true); }
/* 鏡頭 45 m 外整區不畫：大道（玩家 (-40,0)、鏡頭在南 6 m）、霖澤館前、校門 */
const cam={position:new THREE.Vector3()}; const visTris=()=>{ let n=0; for(const c of chunks) if(c.o.visible) c.o.traverse(m=>{ if(m.isMesh) n+=tri(m.geometry); }); return n; };
for(const [name,x,zz] of [['椰林大道 (-40, 0)',-40,6],['霖澤館前 (34, -98)',34,-92],['校門 (-112, 0)',-112,6]]){ cam.position.set(x,4,zz); z.parkedBikes.update(1,cam);
  const near=chunks.filter(c=>c.box.distanceToPoint(cam.position)<45).length, vis=chunks.filter(c=>c.o.visible).length;
  check(name+'：只畫鏡頭 45 m 內的那幾區',vis===near&&visTris()<bikeTris,`看得到 ${vis}/${chunks.length} 區、三角形 ${visTris()}/${bikeTris}`); }
/* 走近每一處停車架：那一區一定畫（不會走到車旁邊車不見）*/
{ let miss=0; for(const c of chunks){ const ctr=c.box.getCenter(new THREE.Vector3()); cam.position.set(ctr.x,4,ctr.z+6); z.parkedBikes.update(1,cam); if(!c.o.visible) miss++; } check('站在每一區旁邊（鏡頭 6 m）：那一區看得到',miss===0,`沒畫的 ${miss} 區`); }
/* 導航不受影響：停車架的阻擋照舊（blockRect 和車分開寫）*/
check('停車架的位置照舊擋路（例：(-50, -16)、(12, 24)、(58, -102)）',[[-50,-16],[12,24],[58,-102]].every(([x,zz])=>!E.canStand(x,zz,0.32,0)));
check('停車架旁邊照舊走得過（例：(-50, -18.5)、(12, 26.6)、(12, 21.5)）',[[-50,-18.5],[12,26.6],[12,21.5]].every(([x,zz])=>E.canStand(x,zz,0.32,0)));   /* 全校園每 0.5 m 一點站得住的格子，修改前後都是 135,670 個（簽章相同；LAWWW2 交件時量）*/
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);

// 共同教學館 3F 考場（AA_399 第 9 節；LAWWW-B 10-24 任務 #82；LAWWW2-B 2026-10-24）——不需要瀏覽器。
//   1. 區域、正式模型登記了（Z3.ZONES.gongtong_3f、bldg.gongtong_3f）
//   2. 開放時段（Z3.roomGlbOpen）：只有 2029-02-03、2030-02-16 開（整天）；前一天、後一天、平常的日子都關
//   3. 共同教學館 2F 樓梯口：考試那天只有「上 3F（考場）」、其他日子只有原本的「往 3F」（鍊子、整修中）
//   4. 進去的落點＝配置的 spawn；「下樓（回 2F）」回到共同教學館 2F 樓梯口（lv 1），那裡站得住
//   5. 引擎真正的導航（E.simWalk）：24 個座位（走近點）、黑板、應考須知、放書包的地方、出口都從門口走得到；玩家的位子（spots.me）就是其中一個座位
// 修改前：沒有 gongtong_3f（第 1 項就失敗）。用法：node tests/gongtong_3f_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|ROOM_GLB_LAYOUTS|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }

const GAME_G={v:null}; global.GAME={get G(){ return GAME_G.v; }};   /* rooms_glb3d.js、wancai3d.js 的門讀 GAME.G */
const DAY=key=>{ for(let d=1;d<3000;d++) if(CALENDAR.dateOf(d).key===key) return d; return null; };
const L=ROOM_GLB_LAYOUTS.gongtong_3f;
check('1. 區域、正式模型登記了（gongtong_3f、bldg.gongtong_3f）', !!L&&!!Z3.ZONES.gongtong_3f&&!!ASSETS.manifest['bldg.gongtong_3f']&&/gongtong_3f\.glb$/.test(ASSETS.manifest['bldg.gongtong_3f'].url));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const G=(day,hour)=>({day,hour,flags:{},stage:'law'}); const op=(d,h)=>Z3.roomGlbOpen('gongtong_3f',G(d,h));
const A=DAY('2029-02-03'), B2=DAY('2030-02-16');
check('2. 考試那兩天開（07:30、10:00、16:00）', op(A,7.5)&&op(A,10)&&op(A,16)&&op(B2,10));
check('2. 前一天、後一天、平常的日子關', !op(A-1,10)&&!op(A+1,10)&&!op(B2-1,10)&&!op(DAY('2028-10-12'),10));
// 3. 2F 樓梯口
{ GAME_G.v=G(A,8.5); loadZone('gongtong'); const S=GONGTONG_LAYOUT.stair, x=(S.B.x0+S.B.x1)/2, z=S.B.z1+0.5;
  const its=E.interactables.filter(i=>Math.abs(i.x-x)<0.01&&Math.abs(i.z-z)<0.01&&(i.lv|0)===1); const vis=()=>its.filter(i=>!i.hidden).map(i=>i.label);
  const a=vis(); GAME_G.v=G(A+1,8.5); const b=vis();
  check('3. 考試那天只有「上 3F（考場）」', a.length===1&&a[0]==='上 3F（考場）', a.join('、'));
  check('3. 其他日子只有原本的「往 3F」（鍊子、整修中）', b.length===1&&b[0]==='往 3F'&&/整修中/.test(its.find(i=>i.label==='往 3F').look), b.join('、'));
  const up=its.find(i=>i.exit); check('4. 進去的落點＝配置的 spawn', !!up&&up.exit.to==='gongtong_3f'&&Math.abs(up.exit.spawn.x-L.spawn.x)<1e-6&&Math.abs(up.exit.spawn.z-L.spawn.z)<1e-6);
  const bs=L.back_spawn; check('4. 回 2F 的落點（back_spawn，lv 1）站得住', bs.lv===1&&E.canStand(bs.x,bs.z,0.3,1), JSON.stringify(bs)); }
// 5. 導航
{ GAME_G.v=G(A,8.5); const z=loadZone('gongtong_3f'); if(E.fitSeatRadius) E.fitSeatRadius(); const sp=[z.spawn.x,z.spawn.z];
  const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
  const reachNear=(x,zz,r)=>{ for(let rr=0;rr<=r;rr+=0.2) for(let k=0;k<12;k++){ const px=x+rr*Math.cos(k*Math.PI/6), pz=zz+rr*Math.sin(k*Math.PI/6); if(E.canStand(px,pz,0.3,0)&&walk(sp,[px,pz]).ok) return true; } return false; };
  const bad=[]; for(const s of L.seats){ const tg=s.ap; if(!(tg&&E.canStand(tg[0],tg[1],0.3,0)&&walk(sp,tg).ok)) bad.push('座位 '+s.no); }
  for(const q of L.interact) if(!reachNear(q.x,q.z,q.r)) bad.push(q.label);
  if(!reachNear(L.exits[0].x,L.exits[0].z,L.exits[0].r)) bad.push('出口');
  check('5. 24 個座位、黑板、應考須知、放書包的地方、出口都從門口走得到', L.seats.length===24&&!bad.length, bad.join('、'));
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='gongtong'); check('5. 「下樓（回 2F）」的落點＝back_spawn', !!ex&&ex.exit.spawn&&ex.exit.spawn.lv===1&&Math.abs(ex.exit.spawn.x-L.back_spawn.x)<1e-6, ex&&JSON.stringify(ex.exit.spawn));
  const me=L.spots.me; check('5. 玩家的位子（spots.me）是其中一個座位、座號一致', L.seats.some(s=>s.x===me.x&&s.z===me.z&&s.no===me.no), me.no);
  check('5. 監考老師的位置站得住', E.canStand(L.spots.proctor.x,L.spots.proctor.z,0.05,0)); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

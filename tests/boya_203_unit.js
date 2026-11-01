// 博雅 203 討論室：即興劇社的期末小演出（AA_399 第 10 節；SK07 ev_sk07_improv；LAWWW-B 10-24 任務 #82 第四間；LAWWW2-B 2026-10-24）——不需要瀏覽器。
//   1. 區域、正式模型登記了（Z3.ZONES.boya_203、bldg.boya_203）
//   2. 開放時段（Z3.roomGlbOpen）：只有 2026-05-27 18:30～21:30（open.dayHours）；那一天＝大一下第 14 週週三（SK07 排的那一晚）
//   3. 博雅教學館 2F 的 203 門：那一晚只有「進入 博雅 203」、其他時間只有原本的「之後開放」
//   4. 進去的落點＝配置的 spawn；回 2F 的落點＝門口的互動點（lv 1），站得住
//   5. 其他關著的房間（103 等）照舊
//   6. 引擎真正的導航（E.simWalk）：18 個座位（走近點）、看東西的點、出口都從門口走得到；spots 的人坐在座位上、站得住
// 修改前：沒有 boya_203（第 1 項就失敗）。用法：node tests/boya_203_unit.js
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
const L=ROOM_GLB_LAYOUTS.boya_203;
check('1. 區域、正式模型登記了（boya_203、bldg.boya_203）', !!L&&!!Z3.ZONES.boya_203&&!!ASSETS.manifest['bldg.boya_203']&&/boya_203\.glb$/.test(ASSETS.manifest['bldg.boya_203'].url));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const G=(day,hour)=>({day,hour,flags:{},stage:'law'}); const op=(d,h)=>Z3.roomGlbOpen('boya_203',G(d,h));
const A=DAY('2026-05-27'); const T=CALENDAR.termOf(A), q=CALENDAR.dateOf(A);
check('2. 2026-05-27＝大一下第 14 週週三（SK07 的 termDay(\'Y1S2\',14,3)）', !!T&&T.id==='Y1S2'&&T.week===14&&q.wd===3, JSON.stringify(T)+' wd '+q.wd);
check('2. 那一晚 18:30、19:00、21:00 開', op(A,18.5)&&op(A,19)&&op(A,21));
check('2. 同一天 12:00、18:00、21:30、23:00 關', !op(A,12)&&!op(A,18)&&!op(A,21.5)&&!op(A,23));
check('2. 前一天、後一天、隔週週三的 19:00 關', !op(A-1,19)&&!op(A+1,19)&&!op(A+7,19)&&!op(A-7,19));
// 3. 博雅 2F 的 203 門
{ const R=BOYA_LAYOUT.rooms.find(r=>r.id==='203'), x=(R.door[0]+R.door[1])/2, z=R.doorZ-0.9;
  GAME_G.v=G(A,19); loadZone('boya');
  const its=E.interactables.filter(i=>Math.abs(i.x-x)<0.01&&Math.abs(i.z-z)<0.01&&(i.lv|0)===1); const vis=()=>its.filter(i=>!i.hidden).map(i=>i.label);
  const a=vis(); GAME_G.v=G(A,15); const b=vis(); GAME_G.v=G(A+1,19); const c=vis();
  check('3. 那一晚只有「進入 博思 203」', a.length===1&&a[0]==='進入 博思 203', a.join('、'));
  check('3. 同一天下午、隔天只有原本的門（之後開放）', b.length===1&&b[0]===R.label&&c.length===1&&c[0]===R.label&&its.find(i=>i.label===R.label).look===R.look, b.join('、')+'／'+c.join('、'));
  const en=its.find(i=>i.exit); check('4. 進去的落點＝配置的 spawn', !!en&&en.exit.to==='boya_203'&&Math.abs(en.exit.spawn.x-L.spawn.x)<1e-6&&Math.abs(en.exit.spawn.z-L.spawn.z)<1e-6);
  const bs=L.back_spawn; check('4. 回 2F 的落點（back_spawn，lv 1）＝門口的互動點、站得住', bs.lv===1&&Math.abs(bs.x-x)<1e-6&&Math.abs(bs.z-z)<1e-6&&E.canStand(bs.x,bs.z,0.3,1), JSON.stringify(bs));
  const others=BOYA_LAYOUT.rooms.filter(r=>r.kind==='closed'&&r.id!=='203'&&!r.link).map(r=>{ const xx=(r.door[0]+r.door[1])/2, dz=r.doorZ!=null?r.doorZ:r.z0, zz=dz+(Math.abs(dz-r.z1)<1e-6?1:-1)*0.9; return E.interactables.filter(i=>Math.abs(i.x-xx)<0.01&&Math.abs(i.z-zz)<0.01&&(i.lv|0)===(r.lv|0)); });
  check('5. 其他關著的房間（103 等）照舊：一個門口說明、沒有時段', others.length>0&&others.every(l=>l.length===1&&!l[0].gate&&!l[0].hidden&&!!l[0].look), others.length+' 間'); }
// 6. 導航
{ GAME_G.v=G(A,19); const z=loadZone('boya_203'); if(E.fitSeatRadius) E.fitSeatRadius(); const sp=[z.spawn.x,z.spawn.z];
  const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
  const reachNear=(x,zz,r)=>{ for(let rr=0;rr<=r;rr+=0.2) for(let k=0;k<12;k++){ const px=x+rr*Math.cos(k*Math.PI/6), pz=zz+rr*Math.sin(k*Math.PI/6); if(E.canStand(px,pz,0.3,0)&&walk(sp,[px,pz]).ok) return true; } return false; };
  const bad=[]; L.seats.forEach((s,k)=>{ const tg=s.ap; if(!(tg&&E.canStand(tg[0],tg[1],0.3,0)&&walk(sp,tg).ok)) bad.push('座位 '+k); });
  for(const q of L.interact) if(!reachNear(q.x,q.z,q.r)) bad.push(q.label);
  if(!reachNear(L.exits[0].x,L.exits[0].z,L.exits[0].r)) bad.push('出口');
  check('6. 18 個座位、白板、畫架、簽到表、出口都從門口走得到', L.seats.length===18&&!bad.length, bad.join('、'));
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='boya'); check('6. 「離開 203」的落點＝back_spawn', !!ex&&ex.exit.spawn&&ex.exit.spawn.lv===1&&Math.abs(ex.exit.spawn.x-L.back_spawn.x)<1e-6&&Math.abs(ex.exit.spawn.z-L.back_spawn.z)<1e-6, ex&&JSON.stringify(ex.exit.spawn));
  const S=L.spots, isSeat=p=>L.seats.some(s=>Math.abs(s.x-p.x)<1e-6&&Math.abs(s.z-p.z)<1e-6);
  check('6. 品妤、玩家、阿哲、其他觀眾坐在座位上（第一排）', isSeat(S.pinyu)&&isSeat(S.me)&&isSeat(S.zhe)&&S.pinyu.x===S.me.x&&S.me.x===S.zhe.x&&S.audience.every(isSeat)&&new Set([S.pinyu,S.me,S.zhe,...S.audience].map(p=>p.x+','+p.z)).size===3+S.audience.length);
  const st=[S.tang,...S.member]; check('6. 唐睿、社員站的位置站得住、走得到', st.every(p=>E.canStand(p.x,p.z,0.05,0)&&reachNear(p.x,p.z,0.4)));
  check('6. 唐睿面向觀眾（+x）', Math.abs(Math.sin(S.tang.yaw)-1)<1e-3&&S.tang.x<Math.min(...L.seats.map(s=>s.x))); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

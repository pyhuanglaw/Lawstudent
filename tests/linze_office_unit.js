// 霖澤館 1F 法律學院辦公室（系辦；AA_399 第 7 節；LAWWW-B 10-24 任務 #82；LAWWW2-B 2026-10-24）——不需要瀏覽器。
//   1. 區域、正式模型登記了（Z3.ZONES.linze_office、bldg.linze_office）；霖澤館的 office 門有 to、gate，門上的辦公時間（closed）留著
//   2. 開放時段（Z3.roomGlbOpen）：平日 09:00～12:00、13:30～17:00 開；中午、17:00 以後、08:30、週六、國定假日關（和 closed2_3d.js CLOSED2.officeOpen 一樣）
//   3. 霖澤館 1F 的門：時段內只有「進入 法律學院辦公室」、時段外只有原本的門（看辦公時間），不會兩個一起出現
//   4. 引擎真正的導航（E.simWalk）：客人那一側（服務台、教師信箱、表格架、公告欄、兩張等候椅、出口）都從門口走得到；櫃台後面（職員那一側）走不到
//   5. closed2_3d.js：交換志願表改在裡面的「服務台」交（門在辦公時間變成出入口以後，門口那一個按鈕就看不到了）
// 修改前：沒有 linze_office（第 1 項就失敗）。用法：node tests/linze_office_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|ROOM_GLB_LAYOUTS|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }

const GAME_G={v:null}; global.GAME={get G(){ return GAME_G.v; }};   /* rooms_glb3d.js、wancai3d.js 的門讀 GAME.G */
const DAY=key=>{ for(let d=1;d<2000;d++) if(CALENDAR.dateOf(d).key===key) return d; return null; };
const L=ROOM_GLB_LAYOUTS.linze_office;
check('1. 區域、正式模型登記了（linze_office、bldg.linze_office）', !!L&&!!Z3.ZONES.linze_office&&!!ASSETS.manifest['bldg.linze_office']&&/linze_office\.glb$/.test(ASSETS.manifest['bldg.linze_office'].url));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const DO=LINZE_LAYOUT.doors.find(d=>d.id==='office');
check('1. office 的門：to＝linze_office、gate、spawn；門上的辦公時間（closed）留著', DO.to==='linze_office'&&DO.gate==='linze_office'&&!!DO.spawn&&typeof DO.closed==='string'&&/辦公時間/.test(DO.closed), JSON.stringify({to:DO.to,gate:DO.gate}));
// 2. 開放時段
const T=CALENDAR.termDays('Y2S1'); let mon=null; for(let d=T.from;d<=T.to&&mon==null;d++){ if(CALENDAR.dateOf(d).wd===1&&!CALENDAR.holiday(d)) mon=d; }
const G=(day,hour)=>({day,hour,flags:{},stage:'law'}); const op=(d,h)=>Z3.roomGlbOpen('linze_office',G(d,h));
check('2. 平日 10:00、14:00、16:50 開', op(mon,10)&&op(mon,14)&&op(mon,16.8), CALENDAR.dateOf(mon).key);
check('2. 平日 08:30、12:30、13:20、17:00、20:00 關', !op(mon,8.5)&&!op(mon,12.5)&&!op(mon,13.3)&&!op(mon,17)&&!op(mon,20));
check('2. 週六、週日 10:00 關', !op(mon+5,10)&&!op(mon+6,10));
{ let hol=null; for(let d=T.from;d<T.to+200&&hol==null;d++){ const w=CALENDAR.dateOf(d).wd; if(w>=1&&w<=5&&CALENDAR.holiday(d)) hol=d; } check('2. 平日的國定假日 10:00 關', hol!=null&&!op(hol,10), hol&&CALENDAR.dateOf(hol).key+' '+CALENDAR.holiday(hol)); }
// 3. 霖澤館 1F 的門
{ GAME_G.v=G(mon,10); loadZone('linze'); const its=E.interactables.filter(i=>Math.abs(i.x-DO.x)<0.01&&(i.lv|0)===(DO.lv|0)&&Math.abs(i.z-E.interactables.find(q=>q.exit&&q.exit.to==='linze_office').z)<0.01);
  const vis=()=>its.filter(i=>!i.hidden).map(i=>i.label);
  const a=vis(); GAME_G.v=G(mon,12.5); const b=vis(); GAME_G.v=G(mon+5,10); const c=vis();
  check('3. 辦公時間只有「進入 法律學院辦公室」', a.length===1&&a[0]==='進入 法律學院辦公室', a.join('、'));
  check('3. 中午、週六只有原本的門（看辦公時間）', b.length===1&&b[0]==='法律學院辦公室'&&c.length===1&&c[0]==='法律學院辦公室', b.join('、')+'／'+c.join('、'));
  const shut=its.find(i=>!i.exit); check('3. 原本的門還是寫辦公時間', !!shut&&/辦公時間/.test(shut.look||'')); }
// 4. 導航
{ GAME_G.v=G(mon,10); const z=loadZone('linze_office'); if(E.fitSeatRadius) E.fitSeatRadius(); const sp=[z.spawn.x,z.spawn.z];
  const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
  const reachNear=(x,zz,r)=>{ for(let rr=0;rr<=r;rr+=0.2) for(let k=0;k<12;k++){ const px=x+rr*Math.cos(k*Math.PI/6), pz=zz+rr*Math.sin(k*Math.PI/6); if(E.canStand(px,pz,0.3,0)&&walk(sp,[px,pz]).ok) return true; } return false; };
  const bad=[]; for(const q of L.interact) if(!reachNear(q.x,q.z,q.r)) bad.push(q.label);
  for(const s of L.seats){ const tg=s.ap||[s.x+Math.sin(s.yaw)*0.5,s.z+Math.cos(s.yaw)*0.5]; if(!(E.canStand(tg[0],tg[1],0.3,0)&&walk(sp,tg).ok)) bad.push('椅子('+s.x+','+s.z+')'); }
  if(!reachNear(L.exits[0].x,L.exits[0].z,L.exits[0].r)) bad.push('出口');
  check('4. 客人那一側：服務台、教師信箱、表格架、公告欄、兩張等候椅、出口都走得到', !bad.length, bad.join('、'));
  const staff=[[0.5,-0.2],[0.3,1.2],[2.3,1.2],[-1.0,2.0]].filter(p=>E.canStand(p[0],p[1],0.3,0)&&walk(sp,p).ok);
  check('4. 櫃台後面（職員那一側）走不到', !staff.length, staff.map(p=>p.join(',')).join(' '));
  const sb=[]; for(const [k,p] of Object.entries(L.spots)) if(!E.canStand(p.x,p.z,0.05,0)) sb.push(k);
  check('4. spots（系辦助理、職員、櫃台、玩家）的點都站得住（不在家具裡）', !sb.length, sb.join('、')); }
// 5. closed2
{ const src=fs.readFileSync(path.join(ROOT,'src/closed2_3d.js'),'utf8');
  check('5. closed2_3d.js：在 linze_office 的「服務台」也可以交志願表（門口那一個照舊）', /G\.zone==='linze_office'&&it\.label==='服務台'/.test(src)&&/G\.zone==='linze'&&it\.label==='法律學院辦公室'/.test(src));
  check('5. 「服務台」這個看東西的點在配置裡', L.interact.some(q=>q.label==='服務台')); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

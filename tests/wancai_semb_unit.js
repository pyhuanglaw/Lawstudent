// 萬才館研討室 B＝法服初談室（AA_399 第 5 節；LAWWW-B 10-24 任務 #82；LAWWW2-B 2026-10-24）——不需要瀏覽器。
//   1. 區域、正式模型登記了（Z3.ZONES.wancai_semb、bldg.wancai_semb）；萬才館的 seminarB 門有 to、gate，門上的字（closed）留著
//   2. 開放時段（Z3.roomGlbOpen）：學期單週的週六 09:00～12:00 開；雙週週六、12:00 以後、平日、寒暑假的週六關；2027-05-22、2028-10-26 整天開
//   3. 萬才館 2F 的門：時段內只有「進入 研討室 B」、時段外只有原本的門（看門上的紙），不會兩個一起出現
//   4. 兩套布置（Z3.roomGlbSet）：2028-10-26＝interview（推甄面試），其他日子＝consult（初談隔間）；建出來的區域導航照那一套
//   5. 用引擎真正的導航（E.simWalk）：兩套布置的每一個座位（走近點）、看東西的點、出口，都從門口走得到；spots 的點站得住
// 修改前：沒有 wancai_semb（第 1 項就失敗）。用法：node tests/wancai_semb_unit.js
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
const L=ROOM_GLB_LAYOUTS.wancai_semb;
check('1. 區域、正式模型登記了（wancai_semb、bldg.wancai_semb）', !!L&&!!Z3.ZONES.wancai_semb&&!!ASSETS.manifest['bldg.wancai_semb']&&/wancai_semb\.glb$/.test(ASSETS.manifest['bldg.wancai_semb'].url));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const DB=WANCAI_LAYOUT.doors.find(d=>d.id==='seminarB');
check('1. seminarB 的門：to＝wancai_semb、gate、spawn；門上的字（closed）留著', DB.to==='wancai_semb'&&DB.gate==='wancai_semb'&&!!DB.spawn&&typeof DB.closed==='string'&&DB.closed.length>0, JSON.stringify({to:DB.to,gate:DB.gate,closed:DB.closed}));
// 2. 開放時段
const T=CALENDAR.termDays('Y2S1'); const sats=[]; for(let d=T.from;d<=T.to;d++){ if(CALENDAR.dateOf(d).wd===6) sats.push(d); }
const odd=sats.find(d=>CALENDAR.termOf(d).week%2===1), even=sats.find(d=>CALENDAR.termOf(d).week%2===0);
const G=(day,hour)=>({day,hour,flags:{},stage:'law'}); const op=(d,h)=>Z3.roomGlbOpen('wancai_semb',G(d,h));
check('2. 學期單週的週六 10:00 開', !!odd&&op(odd,10)===true, odd&&CALENDAR.dateOf(odd).key+' 第 '+CALENDAR.termOf(odd).week+' 週');
check('2. 同一天 08:30、12:00、15:00 關', !!odd&&!op(odd,8.5)&&!op(odd,12)&&!op(odd,15));
check('2. 雙週週六 10:00 關', !!even&&!op(even,10), even&&CALENDAR.dateOf(even).key);
check('2. 平日（單週的週三）10:00 關', !!odd&&!op(odd-3,10));
{ let vac=null; for(let d=T.to+1;d<T.to+60&&vac==null;d++){ if(CALENDAR.dateOf(d).wd===6&&!CALENDAR.termOf(d)) vac=d; } check('2. 寒假的週六 10:00 關', vac!=null&&!op(vac,10), vac&&CALENDAR.dateOf(vac).key); }
{ const a=DAY('2027-05-22'), b=DAY('2028-10-26'); check('2. 事件那天整天開（2027-05-22 語彤阿姨、2028-10-26 推甄面試；8:00、15:00）', op(a,8)&&op(a,15)&&op(b,8)&&op(b,15)); }
// 3. 萬才館 2F 的門
{ GAME_G.v=G(odd,10); loadZone('wancai'); const its=E.interactables.filter(i=>Math.abs(i.x-DB.x)<0.01&&i.lv===DB.lv);
  const enter=its.find(i=>i.exit&&i.exit.to==='wancai_semb'), shut=its.find(i=>!i.exit);
  const vis=()=>its.filter(i=>!i.hidden).map(i=>i.label);
  const a=vis(); GAME_G.v=G(odd,15); const b=vis(); GAME_G.v=G(even,10); const c=vis();
  check('3. 時段內只有「進入 研討室 B」', !!enter&&!!shut&&a.length===1&&a[0]==='進入 研討室 B', a.join('、'));
  check('3. 時段外（同一天 15:00、雙週週六）只有原本的門', b.length===1&&b[0]==='研討室 B'&&c.length===1&&c[0]==='研討室 B', b.join('、')+'／'+c.join('、'));
  check('3. 進去的落點＝配置的 spawn', !!enter&&enter.exit.spawn&&Math.abs(enter.exit.spawn.x-L.spawn.x)<1e-6&&Math.abs(enter.exit.spawn.z-L.spawn.z)<1e-6); }
// 4、5. 兩套布置
const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
for(const [set,day] of [['consult',odd],['interview',DAY('2028-10-26')]]){
  GAME_G.v=G(day,10); check('4. '+CALENDAR.dateOf(day).key+'：Z3.roomGlbSet＝'+set, Z3.roomGlbSet('wancai_semb',GAME_G.v)===set);
  const z=loadZone('wancai_semb'); if(E.fitSeatRadius) E.fitSeatRadius(); const S=L.sets[set], sp=[z.spawn.x,z.spawn.z];
  check('4. '+set+'：區域照這一套（roomSet、座位數）', z.roomSet===set&&z.seats.length===S.seats.length, z.roomSet+' '+z.seats.length+'/'+S.seats.length);
  const bad=[];
  for(const s of S.seats){ const ap=GAME.seatApproach?GAME.seatApproach({x:s.x,z:s.z,yaw:s.yaw,ap:s.ap}):null; const tg=s.ap||(ap&&[ap.x,ap.z]); const cands=tg?[tg]:[[s.x+Math.sin(s.yaw)*0.5,s.z+Math.cos(s.yaw)*0.5],[s.x-Math.cos(s.yaw)*0.55,s.z+Math.sin(s.yaw)*0.55],[s.x+Math.cos(s.yaw)*0.55,s.z-Math.sin(s.yaw)*0.55]];
    if(!cands.some(c=>E.canStand(c[0],c[1],0.3,0)&&walk(sp,c).ok)) bad.push('座位('+s.x+','+s.z+')'); }
  for(const q of L.interact){ let ok=false; for(let r=0.2;r<=q.r&&!ok;r+=0.2) for(let k=0;k<12&&!ok;k++){ const x=q.x+r*Math.cos(k*Math.PI/6), zz=q.z+r*Math.sin(k*Math.PI/6); if(E.canStand(x,zz,0.3,0)&&walk(sp,[x,zz]).ok) ok=true; } if(!ok) bad.push(q.label); }
  { const X=L.exits[0]; let ok=false; for(let r=0;r<=X.r&&!ok;r+=0.2) for(let k=0;k<12&&!ok;k++){ const x=X.x+r*Math.cos(k*Math.PI/6), zz=X.z+r*Math.sin(k*Math.PI/6); if(E.canStand(x,zz,0.3,0)&&walk(sp,[x,zz]).ok) ok=true; } if(!ok) bad.push('出口'); }
  check('5. '+set+'：每個座位、看東西的點、出口都從門口走得到（引擎的 simWalk）', !bad.length, bad.join('、'));
  const sb=[]; for(const [k,v] of Object.entries(S.spots)) for(const p of [].concat(v)) if(!E.canStand(p.x,p.z,0.05,0)&&!S.seats.some(s=>Math.hypot(s.x-p.x,s.z-p.z)<0.05)) sb.push(k);
  check('5. '+set+'：spots（人的位置）站得住或就是座位', !sb.length, sb.join('、')); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

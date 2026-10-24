// 溫州街小公園的二手市集（ART-WZ-MARKET-1023；AA_420 12-2，wzlines3d.js 的 WZL.market；wz_market.glb，LAWWW2-B 2026-10-24）——不需要瀏覽器。
// 每月第一個週六 09:00～13:00（WZL.marketOn）：攤子顯示、擋住 WZ_PARK_LAYOUT.market.<晴雨>.blocks 的導航格；時段以外（同一天 14:00、別的週六）那幾格還原、照常走得過去。
// 市集的互動點（WZL.MARKET.at：晴天入口步道 (26, 12.6)、下雨老樹南邊 (26, 18.3)）從公園入口走得到；老樹下的三個圓椅照樣走得到、坐得到；入口步道沒有被擋住。
// 修改前：WZ_PARK_LAYOUT 沒有 market（第 1 項就失敗）。用法：node tests/wz_market_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
check('1. 公園配置有市集的攤位（WZ_PARK_LAYOUT.market：clear 三攤、rain 兩攤，各有 blocks、keeper）',!!(WZ_PARK_LAYOUT.market&&WZ_PARK_LAYOUT.market.clear&&WZ_PARK_LAYOUT.market.rain&&WZ_PARK_LAYOUT.market.clear.stalls.length===3&&WZ_PARK_LAYOUT.market.rain.stalls.length===2&&[].concat(WZ_PARK_LAYOUT.market.clear.stalls,WZ_PARK_LAYOUT.market.rain.stalls).every(s=>s.keeper)));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/wzlines3d.js'),'utf8').replace(/^const WZL\s*=/m,'globalThis.WZL='),{filename:'src/wzlines3d.js'});
const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
const nearStand=(x,z,R)=>{ for(let rr=0;rr<=R;rr+=0.1) for(let a=0;a<24;a++){ const tx=x+Math.cos(a/24*Math.PI*2)*rr, tz=z+Math.sin(a/24*Math.PI*2)*rr; if(E.canStand(tx,tz,0.32,0)) return [tx,tz]; } return null; };
let SAT=null, SAT2=null; for(let d=0;d<120&&SAT2==null;d++){ const q=CALENDAR.dateOf(d); if(q.wd===6&&q.d<=7&&SAT==null) SAT=d; else if(q.wd===6&&q.d>7&&SAT!=null) SAT2=d; }
check('2. 找到第一個週六（市集）和普通的週六',SAT!=null&&SAT2!=null,SAT+'／'+SAT2);
global.GAME={G:{flags:{},day:SAT,hour:10,weather:'sunny',stage:'law'}};
const ENT=[26,5.6], M=WZ_PARK_LAYOUT.market, AT=WZL.MARKET.at;
const inBlock=(st)=>st.blocks.map(r=>[r[0],r[1]]);
const tick=()=>E.zone.update(0.016,E);
{ GAME.G.day=SAT; GAME.G.hour=10; GAME.G.weather='sunny'; loadZone('wenzhou'); tick();
  check('3. 晴天 10:00：WZL.marketOn 是 true、市集開著（zone.market.on）',WZL.marketOn(GAME.G)&&E.zone.market.on===true);
  const blocked=inBlock(M.clear).filter(([x,z])=>E.canStand(x,z,0.05,0)); check('3. 晴天 10:00：每一攤（桌子、椅子、地攤布）都擋住了',!blocked.length,JSON.stringify(blocked));
  const p=nearStand(AT.clear[0],AT.clear[1],1.3), r=p&&walk(ENT,p); check('3. 晴天 10:00：「逛二手市集」('+AT.clear+') 從公園入口走得到',!!r&&r.ok,r?r.reason||'':'');
  const r2=walk(ENT,[26,16.8]); check('3. 晴天 10:00：入口步道（x 26）沒有被擋住，走得到老樹前',r2.ok,r2.reason||'');
  GAME.G.hour=14; tick(); const back=inBlock(M.clear).filter(([x,z])=>!E.canStand(x,z,0.05,0));
  check('4. 同一天 14:00：市集收了（on false），那幾格還原、走得過去',E.zone.market.on===false&&!back.length,JSON.stringify(back));
  GAME.G.hour=10; tick(); check('4. 再回到 10:00：又擋住（開關可以來回）',inBlock(M.clear).every(([x,z])=>!E.canStand(x,z,0.05,0))); }
{ GAME.G.day=SAT2; GAME.G.hour=10; GAME.G.weather='sunny'; loadZone('wenzhou'); tick();
  check('5. 普通的週六 10:00：沒有市集，攤位的地方照常走得到',!WZL.marketDay(GAME.G)&&E.zone.market.on===false&&inBlock(M.clear).every(([x,z])=>E.canStand(x,z,0.05,0))); }
{ GAME.G.day=SAT; GAME.G.hour=11; GAME.G.weather='rain'; loadZone('wenzhou'); tick();
  check('6. 下雨 11:00：用老樹下的那一組（zone.market.w＝rain），兩個雨棚擋住',E.zone.market.w==='rain'&&inBlock(M.rain).every(([x,z])=>!E.canStand(x,z,0.05,0)));
  check('6. 下雨：入口步道那兩攤的地方沒有擋（晴天那一組不用）',inBlock(M.clear).every(([x,z])=>E.canStand(x,z,0.05,0)));
  const p=nearStand(AT.rain[0],AT.rain[1],1.3), r=p&&walk(ENT,p); check('6. 下雨：「逛二手市集」('+AT.rain+') 從公園入口走得到',!!r&&r.ok,r?r.reason||'':'');
  const seats=WZ_PARK_LAYOUT.seats.filter(s=>/老樹/.test(s.label)); const bad=seats.filter(s=>{ const q=nearStand(s.x,s.z,1.0); return !q||!walk(ENT,q).ok; }).map(s=>'('+s.x+','+s.z+')');
  check('6. 下雨：老樹下的三個圓椅照樣走得到（雨棚沒有把環狀步道堵死）',!bad.length,bad.join('、')); }
const glb=f=>{ const b=fs.readFileSync(path.join(ROOT,f)); const l=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+l).toString('utf8')); };
{ const J=glb('assets/models/env/second_ai/wz_market.glb'), N=J.nodes.map(n=>n.name);
  check('7. 模型有 MARKET_CLEAR、MARKET_RAIN 兩個節點',N.includes('MARKET_CLEAR')&&N.includes('MARKET_RAIN'));
  check('7. 資產清單有 bldg.wz_market（lazy）',!!(ASSETS.manifest['bldg.wz_market']&&ASSETS.manifest['bldg.wz_market'].lazy)); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

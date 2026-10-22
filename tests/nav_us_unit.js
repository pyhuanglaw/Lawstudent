// 美國交換篇＋桃園機場的導航（不需要瀏覽器；LAWWW2-C 2026-10-17，src/us3d.js）：在 Node 裡建出遊戲真正的區域，
// 用引擎真正的找路＋移動碰撞（E.simWalk，dt=1/30 與 0.1，人物半徑 0.32 m；跑步 4.1 m/s）走每一段路：
//   每個區域：出生點、每個出入口的到達點站得住；從出生點走得到每一個互動點（互動範圍內離中心最近、站得住的位置）；「坐下」的走近點走得到
//   公寓：大門、臥室門、廚房門、陽台門走得過去（門 0.8 m、人的碰撞半徑 0.32：第一版卡在大門）；關著的房間（衛浴、衣物間）站不進去；牆不能穿
//   合租戶（C 棟 208）：共用廚房、客廳走得到，臥室 A、B 關著；社區：停著的車擋住；出生點附近沒有車；超市：貨架擋住；機場：車道（下車處以外）走不上去
// 這是模擬（證明路走得通），不是真實玩家流程；真實流程在 tests/flow_us_exchange.py。
// 用法：node tests/nav_us_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});   // 不載正式模型（導航、互動點和備用模型一樣）
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const R=0.32, stand=(x,z)=>E.canStand(x,z,R,0);
const both=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1}); return r.ok?{ok:true}:Object.assign({run:true},r); };
const fmt=(r)=>JSON.stringify(r).slice(0,200);
/* 互動範圍內站得住的位置（0.1 m 一格），照離中心的距離排；和 tests/reachability_all.py 一樣：一個一個試，有一個走得到就算 */
function spotsOf(it){ const r=(it.radius||1.2)-0.05, out=[]; for(let dz=-r;dz<=r+1e-6;dz+=0.1) for(let dx=-r;dx<=r+1e-6;dx+=0.1){ const d=Math.hypot(dx,dz); if(d>r) continue; if(stand(it.x+dx,it.z+dz)) out.push([d,it.x+dx,it.z+dz]); } return out.sort((a,b)=>a[0]-b[0]).map(q=>[q[1],q[2]]); }
/* GAME.seatApproach（game3d.js）的候選：指定的 ap 先，再來座位前面、後面、兩側……（第一個站得住、走得到的）*/
function apsOf(s){ const fx=Math.sin(s.yaw||0), fz=Math.cos(s.yaw||0); const c=[[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]].map(([dx,dz])=>[s.x+dx,s.z+dz]); return s.ap?[s.ap].concat(c):c; }
function firstReach(from,pts){ let last=null; for(const p of pts.slice(0,12)){ const r=both(from,p); if(r.ok) return {ok:true,at:p}; last=r; } return last||{ok:false,reason:'沒有站得住的位置'}; }
function allReach(id,from){ const bad=[]; for(const it of E.interactables){ const sp=spotsOf(it); if(!sp.length){ bad.push(it.label+'：範圍內站不住'); continue; } const r=firstReach(from,sp); if(!r.ok) bad.push(it.label+' '+fmt(r));
    if(it.seat){ const a=apsOf(it.seat).filter(p=>stand(p[0],p[1])); if(!a.length){ bad.push(it.label+'：坐下的走近點都站不住'); continue; } const r2=firstReach(from,a); if(!r2.ok) bad.push(it.label+'（走近點）'+fmt(r2)); } }
  check(`${id}：${E.interactables.length} 個互動點都站得到、從出生點走得到（座位的走近點也是）`,!bad.length,bad.slice(0,6).join('；')); }
const arrivals=[];   // 出入口的到達點：之後到那一區檢查
const MSL=typeof US_MARKET_STREET_LAYOUT!=='undefined'&&!!Z3.ZONES.us_market_street;   // 超市街（US-MARKET-STREET，LAWWW2 2026-10-21）：有的話社區、超市、亞洲超市的出入口接到超市街
function noteExits(id){ for(const it of E.interactables) if(it.exit&&it.exit.spawn) arrivals.push({from:id,to:it.exit.to,label:it.label,sp:it.exit.spawn}); }

/* ART-US2-FIX-1018（BB-C 10-18：站在冰箱前出「看爐子」）：冰箱門前（冰箱正面往東 0.36～0.62 m、冰箱寬度內）站得住的位置，最近的互動都要是冰箱；
   爐子東緣、水槽前站得住的位置最近的是爐子。合租戶同一套（下面） */
const kitchenSplit=(name,L,frIt,stIt)=>{ const near=(x,z)=>{ let b=null,bd=1e9; for(const i of E.interactables){ const d=Math.hypot(i.x-x,i.z-z); if(d<(i.radius||1.8)&&d<bd){ bd=d; b=i; } } return b; };
  const F=L.furniture.find(f=>f.type==='fridge'), Rg=L.furniture.find(f=>f.type==='range'); const front=[], east=[];
  for(let dx=0.36;dx<=0.62+1e-6;dx+=0.04) for(let dz=-0.32;dz<=0.32+1e-6;dz+=0.04){ const x=F.x+F.d/2+dx, z=F.z+dz; if(stand(x,z)) front.push([x,z]); }
  for(let x=Rg.x+0.45;x<=Rg.x+0.95+1e-6;x+=0.05) for(let z=1.7;z<=2.3+1e-6;z+=0.05) if(stand(x,z)) east.push([x,z]);
  const badF=front.filter(([x,z])=>near(x,z)!==frIt), badS=east.filter(([x,z])=>near(x,z)!==stIt);
  check(`${name}：站在冰箱門前（${front.length} 個站得住的位置）出冰箱；爐子東緣、水槽前（${east.length} 個）出爐子`,!!frIt&&!!stIt&&front.length>0&&east.length>0&&!badF.length&&!badS.length,
    badF.slice(0,3).map(p=>'冰箱前 '+p.map(v=>v.toFixed(2))+' → '+(near(...p)||{}).label).concat(badS.slice(0,3).map(p=>'爐子東 '+p.map(v=>v.toFixed(2))+' → '+(near(...p)||{}).label)).join('；')); };
// ---------- 公寓室內 ----------
{ const z=loadZone('us_apartment'), L=US_APARTMENT_LAYOUT, S=z.spawn;
  check('公寓：門外平台的出生點站得住',stand(S.x,S.z),`(${S.x},${S.z})`);
  check('公寓：早上起床的出生點（床尾）站得住',stand(L.spawns.bedroom.x,L.spawns.bedroom.z));
  check('公寓：一進門的出生點（走道）站得住',stand(L.spawns.entry.x,L.spawns.entry.z));
  const P=[S.x,S.z], hall=[-1.0,2.0], living=[-1.6,-1.0], bed=[2.4,-1.0], kit=[-3.0,1.8], bal=[-0.4,-4.0];
  let r=both(P,hall); check('公寓：平台 → 大門 → 走道（大門 0.8 m）',r.ok,fmt(r));
  r=both(hall,living); check('公寓：走道 → 客廳',r.ok,fmt(r));
  r=both(living,bed); check('公寓：客廳 → 臥室門 → 床尾',r.ok,fmt(r));
  r=both(hall,kit); check('公寓：走道 → 廚房門 → 廚房',r.ok,fmt(r));
  r=both(living,bal); check('公寓：客廳 → 陽台門 → 陽台',r.ok,fmt(r));
  check('公寓：關著的衛浴、衣物間、衣帽櫃、洗衣機櫃站不進去',!stand(1.6,2.0)&&!stand(4.0,2.0)&&!stand(0.2,1.4)&&!stand(0.2,2.4));
  check('公寓：客廳｜臥室的牆（臥室門以外）、客廳｜廚房（吧台的窗口）、客廳｜陽台的牆（陽台門以外）擋住',[[1.6,-2.4],[1.6,0.6],[-3.0,1.2],[-2.4,-3.2],[0.0,-3.2]].every(([x,zz])=>E.nav.blocked(...E.nav.toCell(x,zz))));
  check('公寓：平台東邊的樓梯走不下去（下樓是出口）',!stand(3.4,4.0));
  check('公寓：有「睡覺」（sleep:true）、「坐在書桌前」（deskStudy）、「出門」→ us_outside',!!E.interactables.find(i=>i.sleep&&i.label==='睡覺')&&!!E.interactables.find(i=>i.deskStudy)&&!!E.interactables.find(i=>i.label==='出門'&&i.exit&&i.exit.to==='us_outside'));
  check('公寓：US3.SPAWN 的出生點都站得住（交換系統用）',['us_apartment','us_apartment_bed'].every(k=>stand(US3.SPAWN[k].x,US3.SPAWN[k].z)));
  kitchenSplit('公寓',L,E.interactables.find(i=>i.label==='打開冰箱'),E.interactables.find(i=>i.label==='看爐子'));
  allReach('公寓',P); noteExits('us_apartment'); }
// ---------- 學姊她們的 C 棟 208（合租戶，US2 的共用廚房）----------
{ const z=loadZone('us_shared'), L=US_SHARED_LAYOUT, S=z.spawn;
  check('合租戶：門外平台的出生點、廚房的出生點站得住',stand(S.x,S.z)&&stand(L.spawns.kitchen.x,L.spawns.kitchen.z));
  let r=both([S.x,S.z],[L.spawns.kitchen.x,L.spawns.kitchen.z]); check('合租戶：平台 → 大門 → 走道 → 廚房',r.ok,fmt(r));
  r=both([S.x,S.z],[-1.6,-1.0]); check('合租戶：平台 → 客廳',r.ok,fmt(r));
  check('合租戶：臥室 A、B（門關著）、衛浴、衣物間站不進去',!stand(3.2,-2.0)&&!stand(3.2,0.0)&&!stand(1.6,2.0)&&!stand(4.0,2.0));
  check('合租戶：臥室裡的床、書桌沒有互動點（門關著）；「看冰箱上的輪值表」（usShared chores）、「看爐子」（usShared stove）、臥室 A／B 的門有說明',
    !E.interactables.some(i=>i.sleep||i.deskStudy)&&!!E.interactables.find(i=>i.usShared==='chores')&&!!E.interactables.find(i=>i.usShared==='stove')&&!!E.interactables.find(i=>i.label==='臥室 A'&&i.look)&&!!E.interactables.find(i=>i.label==='臥室 B'&&i.look));
  check('合租戶：「出門」→ us_outside（C 棟樓梯口）',!!E.interactables.find(i=>i.label==='出門'&&i.exit&&i.exit.to==='us_outside'&&Math.abs(i.exit.spawn.x-US3.C208.out.x)<1e-6));
  { const fr=E.interactables.find(i=>i.usShared==='chores'), st=E.interactables.find(i=>i.usShared==='stove'); const near=(x,z)=>{ let b=null,bd=1e9; for(const i of E.interactables){ const d=Math.hypot(i.x-x,i.z-z); if(d<i.radius&&d<bd){ bd=d; b=i; } } return b; };
    check('合租戶：冰箱（輪值表）和爐子的互動點分得開（站在哪一個的點上就出那一個）',!!fr&&!!st&&near(fr.x,fr.z)===fr&&near(st.x,st.z)===st&&Math.hypot(fr.x-st.x,fr.z-st.z)>0.4,fr&&st?`${Math.hypot(fr.x-st.x,fr.z-st.z).toFixed(2)} m`:''); }
  kitchenSplit('合租戶',L,E.interactables.find(i=>i.usShared==='chores'),E.interactables.find(i=>i.usShared==='stove'));
  allReach('合租戶',[S.x,S.z]); noteExits('us_shared'); }
// ---------- 公寓社區 ----------
{ const z=loadZone('us_outside'), L=US_COMMUNITY_LAYOUT, S=z.spawn;
  check('社區：出生點（B 棟樓梯間門口）站得住',stand(S.x,S.z),`(${S.x},${S.z})`);
  check('社區：入口（登機抵達、從超市回來的到達點）站得住',stand(US3.US_LINK.x,US3.US_LINK.z));
  const c=L.cars[0]; check('社區：停著的車擋住（車的中心站不住）',!stand(c.x,c.z),`${c.kind} (${c.x},${c.z})`);
  check('社區：出生點 3 m 內沒有車',!L.cars.some(q=>Math.hypot(q.x-S.x,q.z-S.z)<3));
  const r=both([S.x,S.z],[US3.US_LINK.x,US3.US_LINK.z]); check('社區：樓梯間門口 → 停車場 → 社區入口',r.ok,fmt(r));
  check('社區：C 棟有「上樓（C 棟 208）」→ us_shared',!!E.interactables.find(i=>i.usShared==='door'&&i.exit&&i.exit.to==='us_shared'));
  check('社區：有「回公寓」→ us_apartment、「出門（去超市）」（usGoOut）→ '+(MSL?'us_market_street（超市街的公車站）':'us_market'),!!E.interactables.find(i=>i.label==='回公寓'&&i.exit&&i.exit.to==='us_apartment')&&!!E.interactables.find(i=>i.usGoOut&&i.exit&&i.exit.to===(MSL?'us_market_street':'us_market')));
  { const H=L.clubhouse, it=H&&E.interactables.find(i=>i.usClub==='door');   /* 會所（BB_215「走到會所門口」）*/
    check('社區：會所門口有「會所」（usClub）、站得住，會所本體、門廊柱子站不住',!!it&&stand(it.x,it.z)&&!stand(H.cx,H.cz)&&!stand(H.cx+H.porch.w/2-0.3,H.cz-H.dep/2-H.porch.d+0.2),it?`(${it.x},${it.z})`:'沒有會所');
    check('社區：US3.SPAWN.us_clubhouse（會所門口的走道）站得住',!!US3.SPAWN.us_clubhouse&&stand(US3.SPAWN.us_clubhouse.x,US3.SPAWN.us_clubhouse.z));
    if(it){ const r2=both([S.x,S.z],[it.x,it.z]); check('社區：樓梯間門口 → 停車場 → 會所門口',r2.ok,fmt(r2)); } }
  allReach('社區',[S.x,S.z]); noteExits('us_outside'); }
// ---------- 超市 ----------
{ const z=loadZone('us_market'), L=US_MARKET_LAYOUT, S=z.spawn;
  check('超市：入口的出生點站得住',stand(S.x,S.z),`(${S.x},${S.z})`);
  check('超市：貨架、冷藏櫃擋住（走道中間站得住、貨架上站不住）',!stand(L.gondolas[0].x,-2)&&stand(L.aisle_signs[0].x,-2));
  check('超市：有「離開超市」→ '+(MSL?'us_market_street（OUT 門外）':'us_outside')+'、「牛奶、蛋」（US1）、八條走道',!!E.interactables.find(i=>i.exit&&i.exit.to===(MSL?'us_market_street':'us_outside'))&&!!E.interactables.find(i=>i.usMarket==='dairy')&&E.interactables.filter(i=>/^aisle_/.test(i.usMarket||'')).length===8);
  allReach('超市',[S.x,S.z]); noteExits('us_market'); }
// ---------- 大超市對面的小亞洲超市（使用者 2026-10-17 23:0x）----------
{ const z=loadZone('us_asian_market'), L=US_ASIAN_MARKET_LAYOUT, S=z.spawn;
  check('亞洲超市：門口的出生點站得住',stand(S.x,S.z),`(${S.x},${S.z})`);
  check('亞洲超市：貨架、米、結帳櫃台擋住（貨架上站不住、走道中間站得住）',!stand(L.gondolas[0].x,-1)&&!stand(-7.5,-1)&&!stand(-4.5,3.6)&&stand(-2.9,-1));
  if(MSL) check('亞洲超市：有「泡麵」（usMarket asia_noodles：US1 的台灣泡麵）、只有一個「出門」→ us_market_street（回大超市、搭公車都從外面走）',
    !!E.interactables.find(i=>i.usMarket==='asia_noodles')&&E.interactables.filter(i=>i.exit).length===1&&!!E.interactables.find(i=>i.exit&&i.exit.to==='us_market_street'));
  else check('亞洲超市：有「泡麵」（usMarket asia_noodles：US1 的台灣泡麵）、「過馬路（回大超市）」→ us_market、「回社區（搭公車）」→ us_outside',
    !!E.interactables.find(i=>i.usMarket==='asia_noodles')&&!!E.interactables.find(i=>i.exit&&i.exit.to==='us_market')&&!!E.interactables.find(i=>i.exit&&i.exit.to==='us_outside'));
  allReach('亞洲超市',[S.x,S.z]); noteExits('us_asian_market'); }
{ loadZone('us_market'); if(MSL) check('大超市：有超市街以後沒有「過馬路」直接跳到亞洲超市（走停車場、斑馬線過去）',!E.interactables.find(i=>i.exit&&i.exit.to==='us_asian_market'));
  else check('大超市：門口有「過馬路（對面的亞洲超市）」→ us_asian_market',!!E.interactables.find(i=>i.exit&&i.exit.to==='us_asian_market')); }
// ---------- 超市街（停車場、馬路；完整的檢查在 tests/us_market_street_unit.js）----------
if(MSL){ const z=loadZone('us_market_street'), S=z.spawn;
  check('超市街：公車站的出生點站得住',stand(S.x,S.z),`(${S.x},${S.z})`);
  allReach('超市街',[S.x,S.z]); noteExits('us_market_street'); }
// ---------- 機場 ----------
for(const k of ['dep','arr']){ const id='airport_'+k, z=loadZone(id), L=AIRPORT_T2_LAYOUT[k], S=z.spawn;
  check(`${id}：出生點站得住`,stand(S.x,S.z),`(${S.x},${S.z})`);
  if(k==='dep'){ check('airport_dep：車道（下車處以外）走不上去',!stand(4,23)&&!stand(-20,24));
    const r=both([S.x,S.z],[L.farewell.x,L.farewell.z+1.5]); check('airport_dep：下車處 → 自動門 → 大廳 → 安檢入口',r.ok,fmt(r));
    check('airport_dep：安檢入口有「出境（前往美國）」（usLink）→ us_outside',!!E.interactables.find(i=>i.usLink&&i.exit&&i.exit.to==='us_outside')); }
  else { const r=both([S.x,S.z],[L.exit.x,L.exit.z-1.0]); check('airport_arr：出關門 → 接機欄杆 → 出口',r.ok,fmt(r)); }
  allReach(id,[S.x,S.z]); noteExits(id); }
// ---------- 機場是通用的（使用者 2026-10-17 23:0x：寒暑假出國也用，不只交換）----------
{ const F=AIRPORT_T2_LAYOUT.dep.farewell, board=()=>E.interactables.find(i=>Math.hypot(i.x-F.x,i.z-F.z)<0.01);
  const had=typeof globalThis.EXCH!=='undefined', had2=typeof globalThis.GAME!=='undefined'; globalThis.EXCH=globalThis.EXCH||{SPAWN:{}};
  globalThis.GAME={G:{flags:{}}}; loadZone('airport_dep'); let b=board();
  check('airport_dep（寒暑假出國：沒有交換出發旗標）：安檢入口是通用的「登機」（airportBoard），不是飛往美國',!!b&&b.label==='登機'&&b.airportBoard&&!b.exchFly,b&&b.label);
  globalThis.GAME={G:{flags:{EXCHANGE_ROUTE:'US',US_DEPARTED:true}}}; loadZone('airport_dep'); b=board();
  check('airport_dep（交換出發那一趟：US_DEPARTED、還沒 US_ARRIVED）：「登機：飛往美國」（exchFly）',!!b&&b.exchFly&&b.label==='登機：飛往美國',b&&b.label);
  globalThis.GAME={G:{flags:{EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true}}}; loadZone('airport_dep'); b=board();
  check('airport_dep（交換已經抵達以後再來機場）：回到通用的「登機」',!!b&&b.airportBoard&&!b.exchFly,b&&b.label);
  if(!had) delete globalThis.EXCH; if(!had2) delete globalThis.GAME; }
// ---------- 美國校園（US-CAMPUS-WIRE-1018，LAWWW2-C）----------
{ const z=loadZone('us_campus'), L=US_CAMPUS_LAYOUT, S=z.spawn;
  check('美國校園：公車到站的出生點站得住、不在任何出口的範圍裡',stand(S.x,S.z)&&!E.interactables.some(i=>i.exit&&Math.hypot(i.x-S.x,i.z-S.z)<i.radius),`(${S.x},${S.z})`);
  for(const k of ['spawn_class_out','spawn_library_out','spawn_gate']){ const p=L[k]; check(`美國校園：${k} 站得住`,stand(p.x,p.z),`(${p.x},${p.z})`); }
  const cls=E.interactables.find(i=>i.usClass==='law'), co=L.spawn_class_out;
  check('美國校園：下課出來（spawn_class_out）不在「進教室」的範圍裡',!!cls&&Math.hypot(cls.x-co.x,cls.z-co.z)>=cls.radius,cls?`${Math.hypot(cls.x-co.x,cls.z-co.z).toFixed(2)} m`:'沒有進教室');
  check('美國校園：有「搭公車（回社區）」→ us_outside、「進圖書館」→ us_lawlib、「進教室」（usClass，沒有出口）、「往活動中心」（usGate，關著）',
    !!E.interactables.find(i=>i.exit&&i.exit.to==='us_outside')&&!!E.interactables.find(i=>i.exit&&i.exit.to==='us_lawlib')&&!!cls&&!cls.exit&&!!E.interactables.find(i=>i.usGate&&!i.exit));
  check('美國校園：高起來的草坪、校門後面（老校區）、馬路、西邊路口走不上去',!stand(20,0)&&!stand(-66,-20)&&!stand(0,27)&&!stand(-93,0));
  const r=both([S.x,S.z],[cls.x,cls.z+0.6]); check('美國校園：公車站 → 人行道 → 走道 → 台階下',r.ok,fmt(r));
  const r2=both([S.x,S.z],[-66,12.6]); check('美國校園：公車站 → 人行道 → 校門廣場',r2.ok,fmt(r2));
  check('美國校園、社區：區域不畫遠景剪影（noSkyline）',!!Z3.ZONES.us_campus.noSkyline&&!!Z3.ZONES.us_outside.noSkyline&&!Z3.ZONES.us_market.noSkyline);
  { const ex=fs.readFileSync(path.join(ROOT,'src/exchange3d.js'),'utf8').match(/const US_ZONES=\[([^\]]*)\]/); check('美國校園、圖書館算在美國（src/exchange3d.js 的 US_ZONES）',!!ex&&/'us_campus'/.test(ex[1])&&/'us_lawlib'/.test(ex[1]),ex&&ex[1]); }
  allReach('美國校園',[S.x,S.z]); noteExits('us_campus'); }
// ---------- 法學院圖書館（SCN-US-LIB）----------
{ const z=loadZone('us_lawlib'), L=US_LAWLIB_LAYOUT, S=z.spawn;
  check('法學院圖書館：門口的出生點站得住、不在「離開圖書館」的範圍裡',stand(S.x,S.z)&&!E.interactables.some(i=>i.exit&&Math.hypot(i.x-S.x,i.z-S.z)<i.radius),`(${S.x},${S.z})`);
  const st=L.stacks[0], tb=L.tables[0], sr=L.stairs_up[0];
  check('法學院圖書館：書架、長桌、樓梯（紅絨繩）擋住，中庭走道站得住',!stand((st.x0+st.x1)/2,st.z)&&!stand(tb.x,tb.z)&&!stand((sr.x0+sr.x1)/2,(sr.z0+sr.z1)/2)&&stand(0,3));
  check(`法學院圖書館：${L.seats.length} 個座位都可以坐，讀書桌（study）有「讀書」`,z.seats.length===L.seats.length&&E.interactables.filter(i=>i.seat&&i.study).length===L.seats.filter(q=>q.kind==='study').length);
  check('法學院圖書館：「離開圖書館」→ us_campus 的 spawn_library_out',!!E.interactables.find(i=>i.exit&&i.exit.to==='us_campus'&&i.exit.spawn.x===US_CAMPUS_LAYOUT.spawn_library_out.x&&i.exit.spawn.z===US_CAMPUS_LAYOUT.spawn_library_out.z));
  allReach('法學院圖書館',[S.x,S.z]); noteExits('us_lawlib'); }
{ loadZone('us_outside'); const b=E.interactables.find(i=>i.usBus==='campus'), g=E.interactables.find(i=>i.usGoOut);
  check('社區：有「搭公車（去學校）」（usBus）→ us_campus，和「出門（去超市）」的範圍不重疊、站得住',!!b&&b.exit&&b.exit.to==='us_campus'&&!!g&&Math.hypot(b.x-g.x,b.z-g.z)>=b.radius+g.radius&&stand(b.x,b.z),b?`(${b.x},${b.z})`:'沒有'); }
// ---------- 出入口的到達點 ----------
{ const bad=[]; for(const a of arrivals){ if(!Z3.ZONES[a.to]){ bad.push(`${a.label} → ${a.to}：沒有這個區域`); continue; } if(a.to==='gongguan') continue;   /* 公館的落點＝校園「走出校門」的落點（tests/zone_transitions.py 測過）*/
    loadZone(a.to); if(!stand(a.sp.x,a.sp.z)) bad.push(`${a.from}「${a.label}」→ ${a.to} (${a.sp.x},${a.sp.z}) 站不住`);
    const near=E.interactables.find(i=>i.exit&&Math.hypot(i.x-a.sp.x,i.z-a.sp.z)<(i.radius||1.2)); if(near) bad.push(`${a.from}「${a.label}」→ ${a.to}：一到就在「${near.label}」的範圍裡（會來回跳）`); }
  check(`出入口的 ${arrivals.length} 個到達點都站得住、不會一到就在另一個出口的範圍裡`,!bad.length,bad.join('；')); }
console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);

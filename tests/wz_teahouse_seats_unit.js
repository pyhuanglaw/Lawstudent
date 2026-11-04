// 一盞茶屋給語彤兩個場景的座位（YT-TEAHOUSE-SEATS；LAWWW 11-03 17:23；AA_630 C-001、C-015）——不需要瀏覽器。
// c510_3_2（2029 暑假顧店）：「她坐在吧檯最旁邊，考古題攤開。客人進來，她把書闔上，站起來。」——茶屋沒有吧檯，水屋的工作台就是吧檯：
//   水屋西南角旁邊加一張圓木凳（seats 的 (3.05, 3.35)，面向茶席），seatAt＝[3.05, 3.35]、standAt＝[2.3, 3.4]（客人進來站起來的地方，hcircle3d.js S.shopSeat 會讓她面向門口）。
// c506_3_3（2027 暑假上班前 12:30～13:00，阿伯坐她對面）：長桌面向院子那一側最東邊的位子 seatAt＝[-0.7, 0.95]，阿伯＝對面 [-0.7, 2.45]（現有的座位）。
// 檢查：座位在區域的 seats 裡、坐下前站的位置（crowd3d.js S.seatSide 的候選）站得住、從門口走得到；站的點站得住（半徑 0.32）、走得到、和木凳、打工的站位不疊在一起；木凳不擋住水屋前祐廷泡茶的位置。
// 修改前：沒有 (3.05, 3.35) 的座位（第 1 項失敗）。用法：node tests/wz_teahouse_seats_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
const T=WZ_SHOPS_LAYOUT.teahouse; loadZone('wz_teahouse'); if(E.fitSeatRadius) E.fitSeatRadius();
const sp=[E.zone.spawn.x,E.zone.spawn.z], seats=E.seats.length?E.seats:(E.zone.seats||[]);
const seatAt=(x,z)=>seats.find(s=>Math.hypot(s.x-x,s.z-z)<0.05);
/* 坐下前站的位置：和 crowd3d.js 的 S.seatSide（GAME.seatApproach 同一組候選）一樣——座位中心離桌子太近、本來就站不住（長桌原本的座位也是） */
const side=st=>{ const yaw=st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw); for(const [dx,dz] of [[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[fx*0.5,fz*0.5],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=st.x+dx, z=st.z+dz; if(E.canStand(x,z,0.3,0)) return [x,z]; } return null; };
const SEAT510=[3.05,3.35], STAND510=[2.3,3.4], SEAT506=[-0.7,0.95], OPP506=[-0.7,2.45];
check('1. c510_3_2：水屋旁的木凳 (3.05, 3.35) 在區域的座位裡，layout 也有 stool_round 這件家具',!!seatAt(...SEAT510)&&T.items.some(i=>i.kind==='stool_round'&&Math.hypot(i.x-SEAT510[0],i.z-SEAT510[1])<0.05),'座位 '+seats.length+' 個');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const s510=seatAt(...SEAT510); check('1. 木凳面向茶席（yaw −π/2＝面向 −x）',Math.abs(s510.yaw+Math.PI/2)<1e-6,String(s510.yaw));
for(const [nm,p] of [['c510_3_2 木凳',SEAT510],['c506_3_3 語彤',SEAT506],['c506_3_3 阿伯（對面）',OPP506]]){
  const st=seatAt(...p); const ap=st&&side(st); const r=ap?walk(sp,ap):{ok:false,reason:'沒有站得住的起身點'};
  check('2. '+nm+' ('+p+')：起身點 '+(ap?ap.map(v=>v.toFixed(2)):'—')+' 站得住、從門口走得到',!!st&&r.ok,r.reason||''); }
check('3. c510_3_2 standAt (2.3, 3.4) 站得住（半徑 0.32）',E.canStand(STAND510[0],STAND510[1],0.32,0));
const rs=walk(sp,STAND510); check('3. standAt 從門口走得到',rs.ok,rs.reason||'');
check('3. standAt 離木凳 ≥ 0.6 m（站起來走一步，不是站在凳子上）',Math.hypot(STAND510[0]-SEAT510[0],STAND510[1]-SEAT510[1])>=0.6,Math.hypot(STAND510[0]-SEAT510[0],STAND510[1]-SEAT510[1]).toFixed(2));
const W=T.work, near=[]; for(const s of ['a','b','c']) for(const [who,p] of Object.entries(W[s])) if(Math.hypot(p.x-SEAT510[0],p.z-SEAT510[1])<0.6) near.push(s+':'+who);
check('4. 木凳不和打工的站位疊在一起（≥ 0.6 m）',!near.length,near.join('、'));
const rb=walk(sp,[W.b.me.x,W.b.me.z]); check('4. 加了木凳以後，水屋前泡茶的位置照樣從門口走得到',rb.ok,rb.reason||'');
check('5. c506_3_3 兩個位子面對面（同一張長桌、x 相同、z 一前一後）',seatAt(...SEAT506)&&seatAt(...OPP506)&&Math.abs(seatAt(...SEAT506).yaw)<1e-6&&Math.abs(Math.abs(seatAt(...OPP506).yaw)-Math.PI)<1e-6);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

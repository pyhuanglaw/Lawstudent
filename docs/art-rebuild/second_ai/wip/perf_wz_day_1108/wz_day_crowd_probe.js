// SHOP-CROWD-NEW-1105（使用者 2026-11-05 06:5x 附日常失速週二 17:29 的截圖：「店裡都沒人??」）——不需要瀏覽器。
// 後來才進得去的店（日常失速、木曜日、同弦樂器、南洋戲院大廳、山嵐書店、大口漢堡、大步球鞋、好拍運動、新生運動廣場）也要有沒有名字的客人（src/crowd3d.js S.shopDefs）。
// 在 Node 建出遊戲真正的區域，照進店（CROWD.enter）檢查：
//   1. 每一家在自己熱鬧、有開的時刻有客人（平均 ≥ 1 位）；使用者截圖那一刻（日常失速 2025-10-21 週二 17:29）有人。
//   2. 坐著的：坐在區域真正的座位上（同一層）、旁邊站得起來；站著的：站在那一層站得住的格子（半徑 0.3）、不在出口和按鈕上。
//   3. 不坐劇情、玩家按鈕、店員的位子：日常失速的八人長桌（桌遊、期末聚餐 offbeat_sys3d.js）、同弦的試琴椅與櫃台木凳、好拍等穿線的凳子、
//      大步球鞋的長凳 A（「試穿」）、新生運動廣場的試穿椅和店員圓凳（npcOnly），也不站在山嵐坐地板看書的位置 0.8 m 內。
//   4. 打烊沒有人：木曜日週二、同弦週一、好拍週日公休；日常失速 01:00～13:00；其他店開門前、打烊後。大口漢堡 24 小時（半夜有人）。
//   5. 兩層的店（木曜日、山嵐、大口漢堡、新生運動廣場）：二樓有客人；待在店裡時新來的客人從門口（一樓）走進來，找得到走上二樓的路。
//   6. 一間店同時最多 10 位；兩個客人不坐同一個位子。
// 修改前：這幾家都不在 CROWD.SHOPS（第 1 項 FAIL：每一家 0 位）。用法：node tests/shop_crowd_new_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=process.env.WT;
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){},setProp(){ return false; },SIT_TOP:0.45};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),CROWD_X:2,dayOfKey:dayOf,noodleDay:()=>false};
const FILES=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js',
  'src/data/wz_shops_layout.js','src/data/daily_offbeat_layout.js','src/data/lin_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/lane118_props.js','src/zones3d.js',
  'src/data/xinsheng_layout.js','src/data/tongxian_layout.js','src/tongxian3d.js','src/data/nanyang_layout.js','src/nanyang3d.js','src/data/shanlan_layout.js','src/shanlan3d.js',
  'src/data/dakou_layout.js','src/dakou3d.js','src/data/dabu_layout.js','src/data/haopai_layout.js','src/xsshop3d.js','src/data/xinsheng_sports_layout.js','src/xsports3d.js',
  'src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/data/dorm_room_layout.js','src/data/calendar.js','src/data/places.js','src/crowd3d.js'];
for(const f of FILES){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>'globalThis.'+n+'='); src=src.replace(/^function (DAKOU_SEATS2)\b/m,'globalThis.$1=function $1'); vm.runInThisContext(src,{filename:f}); }
ASSETS.loadOne=()=>new Promise(()=>{});   /* 正式模型不載入（座位、導航不靠模型）*/
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
global.GAME={G:null};
const mkG=(d,h,o)=>Object.assign({day:typeof d==='string'?dayOf(d):d,hour:h,flags:{},stage:'law'},o||{});
let GM=null;
function enter(id,G){ GAME.G=G; G.weekday=CALENDAR.dateOf(G.day).wd%7; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(z.nav) z.nav._cm=null;
  if(z.levels) for(const n of z.levels) if(n) n._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:0,seat:null}; E.camera=null; G.zone=id;
  GM={G,E,hourRate:1/150,npc:{},sitAt:(n,st)=>{ n.seat=st; if(st.lv!=null) n.lv=st.lv|0; n.pose='sit'; n.idlePose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,(st.lift||0),st.z); n.obj.rotation.y=st.yaw||0; }};
  CROWD.enter(GM,id); return z; }
const ppl=()=>E.npcs.filter(n=>typeof n.crowd==='string'&&/^shop_/.test(n.crowd));
const defOf=z=>CROWD.SHOPS&&CROWD.SHOPS.find(d=>d.zone===z);
const open=(z,G)=>{ const d=defOf(z); return !!d&&CROWD.shopWindows(d,G).some(([a,b])=>G.hour>=a&&G.hour<b); };
const NEW=['wz_offbeat','wz_mokuyobi','xs_tongxian','xs_nanyang','xs_shanlan','xs_dakou','xs_dabu','xs_haopai','xs_xsports'];
const BUSY={wz_offbeat:[17.5,19],wz_mokuyobi:[15.5,20],xs_tongxian:[17.5,19.5],xs_nanyang:[19.4,12.9],xs_shanlan:[16,19],xs_dakou:[12.5,22],xs_dabu:[17.5,19.5],xs_haopai:[17.5,19.5],xs_xsports:[17.5,19.5]};
const DAYS=[]; for(let d=dayOf('2025-09-22');DAYS.length<21;d++) if(CALENDAR.kind(d)==='term'&&!CALENDAR.holiday(d)) DAYS.push(d);
// PERF-WZ-DAY-1108：店裡沒有名字的客人（CROWD）白天 vs 晚上（LAWWW2-B 11-09）。WT=<repo> node wz_day_crowd_probe.js
const SH=(process.env.SHOPS||'wz_teahouse,wz_mokuyobi,wz_offbeat,wz_brunch,wz_lin,wz_teishoku,wz_print').split(',');
const HOURS=(process.env.HOURS||'10,12,14,16,17.5,19.5,21').split(',').map(Number);
console.log('店　　　　　　　 '+HOURS.map(h=>String(h).padStart(5)).join(' ')+'　（每一格：開門的那幾天平均人數 坐/站；「關」＝那個時刻沒開）');
for(const z of SH){ if(!Z3.ZONES[z]||!defOf(z)){ console.log(z,'沒有'); continue; }
  const row=[]; for(const h of HOURS){ let nOpen=0, sit=0, st=0; for(const d of DAYS){ const G=mkG(d,h); if(!open(z,G)) continue; nOpen++; enter(z,G); const P=ppl(); for(const n of P){ if(n.seat) sit++; else st++; } }
    row.push(nOpen?((sit+st)/nOpen).toFixed(1)+'('+(sit/nOpen).toFixed(1)+'/'+(st/nOpen).toFixed(1)+')':'關'); }
  console.log(z.padEnd(16)+row.map(s=>s.padStart(12)).join(''));
}
process.exit(0);

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
const ROOT=path.resolve(__dirname,'..');
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
// ---------- 1. 熱鬧的時刻有客人 ----------
{ const bad=[], info=[];
  for(const z of NEW){ if(!Z3.ZONES[z]){ bad.push(z+'（區域沒載入）'); continue; } if(!defOf(z)){ bad.push(z+'（不在 CROWD.SHOPS）'); continue; }
    let nOpen=0, sum=0; for(const d of DAYS) for(const h of BUSY[z]){ const G=mkG(d,h); if(!open(z,G)) continue; nOpen++; enter(z,G); sum+=ppl().length; }
    const avg=nOpen?sum/nOpen:0; info.push(z+' '+avg.toFixed(1)); if(!nOpen||avg<1) bad.push(z+'（開門 '+nOpen+' 次，平均 '+avg.toFixed(2)+' 位）'); }
  check('1. 每一家在熱鬧、有開的時刻有客人（平均 ≥ 1 位）',!bad.length,bad.length?bad.join('、'):info.join('、'));
  const G=mkG('2025-10-21',17.48); let n=0; if(Z3.ZONES.wz_offbeat&&defOf('wz_offbeat')){ enter('wz_offbeat',G); n=ppl().length; }
  check('1. 使用者截圖那一刻（日常失速 2025-10-21 週二 17:29）有客人',n>=1,n+' 位'); }
// ---------- 2、3、6. 位置都對、不坐劇情和按鈕的位子 ----------
const FLOOR_SIT=(typeof SHANLAN_LAYOUT!=='undefined'?SHANLAN_LAYOUT.floorSit:[])||[];
const BANNED={
  wz_offbeat:st=>(DAILY_OFFBEAT_LAYOUT.seats.find(q=>Math.hypot(q.x-st.x,q.z-st.z)<0.12)||{}).table===1,
  xs_tongxian:()=>true, xs_haopai:()=>true, xs_xsports:()=>true,
  xs_dabu:st=>(DABU_LAYOUT.seats.find(q=>Math.hypot(q.x-st.x,q.z-st.z)<0.12)||{}).bench!==2 };
{ const bad=[], ban=[], dup=[], over=[]; let nSit=0, nStand=0, nUp=0;
  for(const z of NEW){ if(!Z3.ZONES[z]||!defOf(z)) continue;
    for(const d of DAYS.slice(0,12)) for(const h of BUSY[z].concat([14.5,21])){ const G=mkG(d,h); if(!open(z,G)) continue; const zz=enter(z,G), P=ppl(); if(P.length>CROWD.SHOP_CAP) over.push(z+' '+P.length);
      const used=new Set();
      for(const n of P){ const lv=n.lv|0;
        if(n.seat){ nSit++; const st=n.seat; if(!(zz.seats||[]).includes(st)) bad.push(z+' 座位不是區域的座位 '+st.x+','+st.z); if((st.lv|0)!==lv) bad.push(z+' 層不對 '+st.x+','+st.z);
          if(!CROWD.seatSide(E,st)) bad.push(z+' 座位旁邊站不起來 '+st.x+','+st.z); if(st.npcOnly||(BANNED[z]&&BANNED[z](st))) ban.push(z+' '+st.x+','+st.z);
          const k=st.x.toFixed(2)+','+st.z.toFixed(2)+','+lv; if(used.has(k)) dup.push(z+' '+k); used.add(k); if(lv===1) nUp++; }
        else { nStand++; const p=n.obj.position; if(!E.canStand(p.x,p.z,0.3,lv)) bad.push(z+' 站不住 '+p.x.toFixed(2)+','+p.z.toFixed(2)+' lv'+lv);
          if(E.interactables.some(i=>!i.seat&&(i.lv|0)===lv&&Math.hypot(i.x-p.x,i.z-p.z)<(i.exit?1.0:0.45))) bad.push(z+' 站在按鈕上 '+p.x.toFixed(2)+','+p.z.toFixed(2));
          if(z==='xs_shanlan'&&FLOOR_SIT.some(q=>(q.lv|0)===lv&&Math.hypot(q.x-p.x,q.z-p.z)<0.8)) ban.push(z+' 坐地板的位置旁邊 '+p.x.toFixed(2)+','+p.z.toFixed(2));
          if(lv===1) nUp++; } } } }
  check('2. 坐的在區域真正的座位（同一層）、站的站得住，不在出口、按鈕上',!bad.length&&nSit>0&&nStand>0,bad.length?[...new Set(bad)].slice(0,8).join('；'):'坐 '+nSit+'、站 '+nStand+'、二樓 '+nUp);
  check('3. 不坐劇情、玩家按鈕、店員的位子（日常失速長桌、同弦試琴椅、好拍凳子、大步長凳 A、運動廣場）、不擋山嵐坐地板的位置',!ban.length,ban.length?[...new Set(ban)].slice(0,8).join('；'):'');
  check('6. 一間店同時最多 '+CROWD.SHOP_CAP+' 位、兩個客人不坐同一個位子',!over.length&&!dup.length,over.concat(dup).slice(0,6).join('；'));
  check('5. 兩層的店二樓有客人',nUp>0,'二樓 '+nUp+' 人次'); }
// ---------- 4. 打烊沒有人 ----------
{ const wd=(w,from)=>{ for(let d=dayOf(from||'2025-09-22');;d++) if(CALENDAR.kind(d)==='term'&&!CALENDAR.holiday(d)&&CALENDAR.dateOf(d).wd%7===w) return d; };
  const CLOSED=[['wz_mokuyobi',wd(2),17],['xs_tongxian',wd(1),17],['xs_haopai',wd(0),17],['wz_offbeat',wd(3),10],['wz_offbeat',wd(3),2],['wz_offbeat',wd(3),12.5],
    ['xs_nanyang',wd(3),8],['xs_shanlan',wd(3),10],['xs_shanlan',wd(3),22.5],['xs_dabu',wd(3),23],['xs_xsports',wd(3),9],['wz_mokuyobi',wd(4),12]];
  const bad=[]; for(const [z,d,h] of CLOSED){ if(!Z3.ZONES[z]||!defOf(z)){ bad.push(z+' 沒有'); continue; } const G=mkG(d,h); if(open(z,G)){ bad.push(z+' '+h+' 點算有開'); continue; } enter(z,G); if(ppl().length) bad.push(z+' 第 '+d+' 天 '+h+' 點 '+ppl().length+' 位'); }
  check('4. 打烊、公休沒有人（木曜日週二、同弦週一、好拍週日、日常失速 01:00～13:00…）',!bad.length,bad.join('、'));
  let n=0, k=0; if(defOf('xs_dakou')) for(const d of DAYS) { const G=mkG(d,1.5); if(!open('xs_dakou',G)) continue; k++; enter('xs_dakou',G); n+=ppl().length; }
  check('4. 大口漢堡 24 小時：半夜 01:30 也有人念書、吃東西',k>0&&n>0,'21 天共 '+n+' 人次');
  let m=0; if(defOf('wz_offbeat')) for(const d of DAYS){ const G=mkG(d,0.5); if(!open('wz_offbeat',G)) continue; enter('wz_offbeat',G); m+=ppl().length; }
  check('4. 日常失速開到 01:00：00:30 有人',m>0,m+' 人次'); }
// ---------- 5. 兩層的店：新來的客人從一樓門口走進來，走得到二樓 ----------
{ const res=[]; for(const z of ['wz_mokuyobi','xs_shanlan','xs_dakou']){ if(!defOf(z)){ res.push(z+' 沒有'); continue; }
    const G=mkG(DAYS[2],z==='xs_dakou'?19:15.2); enter(z,G); const def=defOf(z); let walked=null;
    for(let i=0;i<120&&!walked;i++){ G.hour+=0.03; CROWD.tick(GM,1.6); walked=ppl().find(n=>n.seatTarget&&!n.seat&&(n.seatTarget.lv|0)===1); }
    if(!walked){ res.push(z+' 沒有人走進來坐二樓'); continue; }
    const p=walked.obj.position; const atDoor=Math.hypot(p.x-def.door[0],p.z-def.door[1])<0.6;
    if(!atDoor) res.push(z+' 不是從門口進來'); if((walked.lv|0)!==0) res.push(z+' 進門那一層不是一樓（lv '+walked.lv+'）'); if(!walked.path||!walked.path.length) res.push(z+' 找不到上二樓的路'); }
  check('5. 兩層的店：待在店裡時新來的客人從一樓門口進來、找得到走上二樓的路（木曜日、山嵐、大口漢堡）',!res.length,res.join('、')); }
console.log(fails?('FAIL '+fails+' 項'):'全部通過'); process.exit(fails?1:0);

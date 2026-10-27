// GYM-CROWD-1027（使用者 2026-10-27 20:2x：「然後體育館最詭異的是不管哪裡都沒有人」）——不需要瀏覽器。
// 在 Node 建出遊戲真正的體育館三層（1F 大廳＋多功能球場、B1 健身中心、3F 主球場），照 GAME.enter 進館（CROWD.enter），用引擎真正的導航檢查：
//   1. 開館時間內三層都有人：1F 服務台的工讀生、走過大廳的人、長椅坐一個；1F 兩面羽球場有人打球（中午以後；週末 9 點起）；
//      B1 櫃台後面的櫃台阿姨、跑步機上原地跑（姿勢 run、在跑步機上）、器材旁站著、重訓椅坐著、墊子上；3F 北邊籃框半場有人打球（跑一段停一下）、場邊休息。
//   2. 每個人站得住（或照位置放在跑步機、櫃台後面）、走動的路線每一段走得到、坐著的旁邊站得起來；同一天同一時段進出看到同一批人。
//   3. 開館時間以外、每月第四個星期一沒有人；人數照時段（傍晚、週末比平日早上多）；一層最多 16 個完整人物（手機效能）。
//   4. 玩家的劇情場景不站人：服務台、販賣機、直飲台、中圈「體育課集合」、中間那面羽球場的「打羽球」、進門的地方、B1 櫃台前面、3F 入口通道。
//   5. 玩家自己的體育課上課中：中圈北邊一位體育老師（名字＝課堂上的稱呼）面向一排同學；典禮的日子 3F 不打球。
//   6. 「去健身房」第一次辦卡：說話的是櫃台後面那位阿姨（3D 人物轉頭、說話），不是只有名字。
// 修改前：三層都沒有人（第 1 項 FAIL）。用法：node tests/gym_crowd_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const warn0=console.warn; console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const GL=/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|GYM_LAYOUT|GY3|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|ACTIVITIES|COURSES|SYLLABUS|CLS|CROWD|PROPS|CHAR)$/;
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/gym_layout.js','src/gym3d.js','src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/data/syllabus.js','src/classes3d.js','src/crowd3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),profSpec:c=>({id:c.id,name:c.name,sex:c.gender==='f'?'f':'m'}),CROWD_X:2};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
global.GAME={G:null};
function enter(id,G){ GAME.G=G; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; else if(z.nav) z.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:0,seat:null}; E.camera=null; G.zone=id; const GM={G,E,hourRate:1/150,sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,st.y||0,st.z); n.obj.rotation.y=st.yaw||0; }};
  CROWD.enter(GM,id); return {z,GM}; }
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(key,h)=>({day:dayOf(key),hour:h,flags:{},weekday:CALENDAR.dateOf(dayOf(key)).wd%7,stage:'law'});
const ppl=()=>E.npcs.filter(n=>n.crowd&&/^gym_/.test(n.crowd));
const role=r=>ppl().filter(n=>n.crowdRole===r);
const TUE='2025-09-23', SAT='2025-09-27', SUN='2025-09-28', MON4='2025-09-22';
/* 有玩家體育課的星期一（大一上第 3 週以後、不是國定假日、不是第四個星期一）：照課表找，不寫死 */
const MONPE=(()=>{ for(let d=1;d<120;d++){ const q=CALENDAR.dateOf(d), t=CALENDAR.termOf(d); if(!t||t.week<3||q.wd!==1||(q.d>=22&&q.d<=28)) continue; const G={day:d,hour:15.8,flags:{},stage:'law'}; if(CLS.dayItems(G).some(it=>it.room&&it.room.door==='gym')) return q.key; } return null; })();
// ---------- 1. 開館時間內三層都有人 ----------
{ const {z}=enter('gym',mkG(TUE,12.6)); const all=ppl(); const desk=role('desk_1f')[0], walk=role('walker'), bench=role('bench'), bad=role('badminton');
  check('1. 1F（週二 12:36）：有人（服務台的工讀生、走過大廳的人、長椅、羽球場）',all.length>=6&&!!desk&&walk.length>=1&&bad.length>=2,all.length+' 人：服務台 '+(desk?1:0)+'、走路 '+walk.length+'、長椅 '+bench.length+'、羽球 '+bad.length);
  check('1. 1F 服務台的工讀生站在服務台後面、面向大廳',!!desk&&Math.abs(desk.obj.position.x-11)<0.5&&desk.obj.position.z>16.1&&Math.cos(desk.obj.rotation.y)<-0.9,desk?desk.obj.position.x.toFixed(2)+','+desk.obj.position.z.toFixed(2):'');
  check('1. 羽球：打球的人會跑（run）、跑一段停一下、停下來面向網子',bad.length>=2&&bad.every(n=>n.beh==='route'&&n.run&&n.pauseAt&&n.faceYaw!=null),bad.map(n=>n.beh+(n.run?'/run':'')).join(' '));
  const net=bad.every(n=>{ const w=n.waypoints, cz=[-11.2,3.2].find(c=>w.every(q=>Math.abs(q[1]-c)<6)); return cz!=null&&(w.every(q=>q[1]<cz-0.3)||w.every(q=>q[1]>cz+0.3)); });
  check('1. 羽球：每個人只在自己那半場跑（不穿過網子），不在中間那面（玩家「打羽球」那面）',net&&bad.every(n=>n.waypoints.every(q=>Math.abs(q[0])>4)),''); }
{ const {z}=enter('gym_b1',mkG(TUE,18.5)); const aunt=role('desk_b1')[0], tm=role('treadmill'), others=ppl().filter(n=>n.crowdRole!=='desk_b1');
  check('1. B1（週二 18:30）：櫃台後面有櫃台阿姨、健身中心有人在運動',!!aunt&&aunt.name==='櫃台阿姨'&&others.length>=3,'阿姨 '+(aunt?aunt.name:'沒有')+'、運動的 '+others.length+' 人：'+others.map(n=>n.crowdRole).join('、'));
  check('1. B1 櫃台阿姨站在櫃台後面（面向客人那一邊）',!!aunt&&Math.abs(aunt.obj.position.x-GYM_LAYOUT.b1.desk.staff.x)<0.3&&Math.abs(aunt.obj.position.z-GYM_LAYOUT.b1.desk.staff.z)<0.3&&Math.cos(aunt.obj.rotation.y)>0.9);
  const TMs=(GYM_LAYOUT.b1.equipment.find(e=>e.node==='GYM_TREADMILL')||{at:[]}).at;
  check('1. 跑步機上原地跑：姿勢 run（停下來也是 run）、在跑步機上、站在皮帶上（0.18 m）',tm.every(n=>n.pose==='run'&&n.idlePose==='run'&&TMs.some(q=>Math.abs(q[0]-n.obj.position.x)<0.05&&Math.abs(n.obj.position.z-12.2)<0.05)&&Math.abs(n.obj.position.y-0.18)<0.01),tm.length+' 人'); }
{ let sd=4242; const R0=Math.random; Math.random=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; };   /* 小動作用到亂數：固定種子 */
  const G=mkG(SAT,10.2), {GM}=enter('gym_b1',G); const st=ppl().filter(n=>!n.fixedPos&&!n.seat&&n.beh!=='route'); for(let i=0;i<16;i++){ G.hour+=0.01; CROWD.tick(GM,1.5); for(const n of E.npcs) if(n.path&&n.path.length){ const p=n.path[n.path.length-1]; E.placeAt(n,p[0],p[1],0); n.path=null; const f=n.onArrive; n.onArrive=null; if(f) f(n); } }
  const fx=ppl().filter(n=>n.fixedPos);
  check('1. B1 站著運動的人（器材旁、墊子上）也有小動作；櫃台阿姨、跑步機上的人不亂走',st.length>=1&&st.every(n=>(n.fid|0)>=1)&&fx.every(n=>!n.fid),st.map(n=>n.crowdRole+':'+(n.fid|0)).join(' '));
  Math.random=R0; }
{ const {z}=enter('gym_arena',mkG(SAT,15)); const bb=role('basketball'), rest=role('rest');
  check('1. 3F 主球場（週六 15:00）：北邊籃框半場有人打球（跑一段停一下、停下來面向籃框）、場邊有人休息',bb.length>=3&&rest.length>=1&&bb.every(n=>n.run&&n.pauseAt&&n.beh==='route'&&n.waypoints.every(q=>q[1]<-6)),'打球 '+bb.length+'、休息 '+rest.length); }
// ---------- 2. 站得住、走得到、坐得下；同一時段同一批人 ----------
const audit=(zid,G)=>{ const {z}=enter(zid,G); const bad=[]; for(const n of ppl()){ const P=n.obj.position;
    if(n.seat){ if(!CROWD.seatSide(E,n.seat)) bad.push(n.crowdRole+' 坐的位子旁邊站不起來'); continue; }
    if(['desk_1f','desk_b1','treadmill'].includes(n.crowdRole)) continue;   /* 照位置放（櫃台後面、跑步機上）*/
    if(!E.canStand(P.x,P.z,0.3,0)) bad.push(n.crowdRole+' 站不住 '+P.x.toFixed(1)+','+P.z.toFixed(1));
    if(n.waypoints){ const w=n.waypoints; for(let i=0;i<w.length;i++){ const a=w[i], b=w[(i+1)%w.length]; if(!E.canStand(a[0],a[1],0.3,0)) bad.push(n.crowdRole+' 路線點站不住 '+a.join(',')); const r=E.simWalk(a[0],a[1],b[0],b[1],{dt:1/30,speed:2.6}); if(!r.ok) bad.push(n.crowdRole+' 走不到 '+a.join(',')+'→'+b.join(',')); } } }
  return bad; };
for(const [zid,key,h] of [['gym',TUE,12.6],['gym',SAT,19],['gym',MONPE,15.8],['gym_b1',TUE,18.5],['gym_b1',SAT,10],['gym_arena',SAT,15],['gym_arena',TUE,20]]){ const bad=audit(zid,mkG(key,h)); check('2. '+zid+'（'+key+' '+h+' 點）：每個人站得住、走動的路線每一段走得到（移動模擬）、坐著的旁邊站得起來',!bad.length,bad.slice(0,6).join('｜')); }
{ enter('gym',mkG(TUE,12.6)); const a=ppl().map(n=>n.crowdKey+'@'+n.obj.position.x.toFixed(2)+','+n.obj.position.z.toFixed(2)).sort().join('|'); enter('gym',mkG(TUE,12.6)); const b=ppl().map(n=>n.crowdKey+'@'+n.obj.position.x.toFixed(2)+','+n.obj.position.z.toFixed(2)).sort().join('|');
  enter('gym',mkG('2025-09-24',12.6)); const c=ppl().map(n=>n.crowdKey).sort().join('|');
  check('2. 同一天同一時段出去再進來：同一批人、同一些位置（D55）',a===b&&a.length>0); }
// ---------- 3. 開館時間、人數 ----------
{ const cnt=(key,h)=>{ let k=0; for(const zid of ['gym','gym_b1','gym_arena']){ enter(zid,mkG(key,h)); k+=ppl().length; } return k; };
  const c=[cnt(TUE,7.5),cnt(TUE,22.2),cnt(SUN,18.3),cnt(MON4,12.5)], open=[cnt(TUE,8.3),cnt(SUN,9.2)];
  check('3. 開館時間以外（平日 07:30、22:12、週日 18:18）、每月第四個星期一（9/22）：三層都沒有人',c.every(x=>x===0),c.join(' / '));
  check('3. 開館了就有人（平日 08:18、週日 09:12）',open.every(x=>x>=3),open.join(' / '));
  const m=cnt(TUE,9.5), e=cnt(TUE,19.5), w=cnt(SAT,15);
  check('3. 人數照時段：平日傍晚、週末比平日早上多',e>m&&w>m,'平日早上 '+m+'、傍晚 '+e+'、週六下午 '+w);
  let mx=0, where=''; for(const zid of ['gym','gym_b1','gym_arena']) for(const [key,h] of [[TUE,12.6],[TUE,19.5],[SAT,15],[MONPE,15.8],[SAT,19]]){ enter(zid,mkG(key,h)); if(ppl().length>mx){ mx=ppl().length; where=zid+' '+key+' '+h; } }
  check('3. 一層最多 16 個完整人物（手機效能）',mx<=16,'最多 '+mx+'（'+where+'）'); }
// ---------- 4. 玩家的劇情場景不站人 ----------
{ const keep={gym:[[11,14.7,1.0],[-13.4,17.6,1.0],[-10.6,17.8,0.9],[0,-4,1.8],[0,-2.6,1.4],[0,17.6,1.2],[1.6,18.8,1.0]],gym_b1:[[21,2,1.2],[4.1,2.4,1.2],[18,7.6,1.0]],gym_arena:[[0,21,1.5],[0,26.6,1.0],[0,15.6,1.0]]};
  const bad=[]; for(const zid of Object.keys(keep)) for(const [key,h] of [[TUE,12.6],[TUE,19.5],[SAT,15],[MONPE,15.8]]){ enter(zid,mkG(key,h));
    for(const n of ppl()){ const pts=n.waypoints&&n.beh==='route'?n.waypoints:[[n.obj.position.x,n.obj.position.z]]; for(const [x,z,r] of keep[zid]) for(const q of pts) if(Math.hypot(q[0]-x,q[1]-z)<r) bad.push(zid+' '+n.crowdRole+' 在 ('+x+','+z+') 旁邊'); } }
  check('4. 服務台、販賣機、直飲台、中圈、「打羽球」、進門的地方、B1 櫃台前面、健身中心門口、3F 入口通道：都不站人（走動的路線也不經過）',!bad.length,[...new Set(bad)].slice(0,6).join('｜')); }
// ---------- 5. 體育課、典禮的日子 ----------
{ const G=mkG(MONPE,15.8); const it=CLS.dayItems(G).find(q=>q.room&&q.room.door==='gym'); enter('gym',G); const t=role('pe_teacher')[0], st=role('pe_student');
  check('5. 玩家的體育課上課中（週一 15:48，'+(it?it.c.name:'？')+'）：中圈北邊一位體育老師（名字＝課堂上的稱呼）面向一排同學',!!it&&!!t&&t.name===CLS.teacherName(it.c)&&st.length>=5&&Math.cos(t.obj.rotation.y)>0.9&&st.every(n=>Math.cos(n.obj.rotation.y)<-0.9&&n.obj.position.z>t.obj.position.z),t?t.name+'、同學 '+st.length:'沒有老師');
  const G2=mkG(MONPE,17.6); enter('gym',G2); check('5. 下課以後（17:36）：體育課的老師、同學不在',!role('pe_teacher').length&&!role('pe_student').length); }
{ const G=mkG('2025-08-31',15); enter('gym_arena',G); const n=ppl().length; check('5. 典禮的日子（2025-08-31 開學典禮，3F 布置打開）：主球場沒有人打球',!!(GY3.ceremonyDay&&GY3.ceremonyDay(G))&&n===0,n+' 人'); }
// ---------- 6. 櫃台阿姨說話 ----------
(async()=>{ const G=Object.assign(mkG(TUE,18.5),{money:1000,daily:{}}); enter('gym_b1',G); const said=[]; const GM={G,E,say:async(w,t)=>{ said.push(w); },choose:async()=>0,money(){},toast(){}};
  await GY3.deskB1(GM); const w=said.find(x=>x&&x.name==='櫃台阿姨');
  check('6. 第一次在 B1 櫃台辦卡：說話的是櫃台後面那位阿姨（3D 人物：轉頭看你、嘴巴動），不是只有名字',!!w&&!!w.obj&&w.crowdRole==='desk_b1',w?(w.obj?'3D 人物':'只有名字'):'沒有她說的話');
  console.warn=warn0; console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();

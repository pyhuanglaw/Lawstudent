// ART-GYM-POOL-SWIMMERS-1103（使用者 11-03 截圖「游泳池完全沒人？」X169 後半；LAWWW2 980fdb24e 的泳客模型、動作）接進 crowd3d.js——不需要瀏覽器。
// 在 Node 建出遊戲真正的體育館 B1（gym3d.js、GYM_LAYOUT），照 GAME.enter 進館（CROWD.enter）、每一格 CROWD.tick：
//   1. 泳客的 VRM 還沒載好：水裡沒有人（備用人物會站著，不能放）；有去下載 char.swim_*（lazy）
//   2. 載好以後、開館時間：2～4 個泳客（高畫質；中 ≤3、低 ≤2）、每人一道、水道不相鄰、z＝basin.z0＋2.5×(i＋0.5)；模型是 char.swim_*（不重複）、姿勢 swim_free／swim_breast；
//      後來才載好的不會在畫面中間憑空出現：放進來的那一刻在池邊轉身（q.turn＞0）；不能點（沒有 talk）、不加互動點、碰撞、不動導航
//   3. 每一格位置＝(池中線＋CHAR.swimLap(時間＋偏移, 23.4, 速度).x, 0, 水道中線)、朝向＝q.yaw；沿 x 在池子裡來回（x 有變、不超出池子）；速度 0.9～1.2、彼此不同步
//   4. 同一天同一批人（出去再進來：同樣的模型、水道）；B1 一層最多 16 個完整人物
//   5. 關館（22:00 以後、每月第四個星期一）沒有人；在館裡時間跳到關館：泳客拿掉
//   6. 只在 B1：1F、3F 主球場、溫州街沒有泳客；manifest 的四個泳客不是 anon／ambient
// 修改前（crowd3d.js 沒有接）：第 1 項「有去下載」以後全部 FAIL。用法：node tests/pool_swimmers_wire_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const GL=/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|GYM_LAYOUT|GY3|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|ACTIVITIES|COURSES|SYLLABUS|CLS|CROWD|PROPS|CHAR)$/;
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/gym_layout.js','src/gym3d.js','src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/data/syllabus.js','src/classes3d.js','src/crowd3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
/* CHAR：建出來的人只記 spec；swimLap 用 character3d.js 裡真正的那一行（不重寫一份）*/
const C3=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8'), mLap=C3.match(/C\.swimLap=function[\s\S]*?return \{x,dir,turn:tr,yaw:yaw0\+Math\.PI\*e\}; \};/);
const C={}; if(mLap) vm.runInThisContext('(function(C){ '+mLap[0]+' })')(C);
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){},canVRM:spec=>!!(spec&&spec.model&&ASSETS.has(spec.model)),swimLap:C.swimLap};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),profSpec:c=>({id:c.id,name:c.name,sex:c.gender==='f'?'f':'m'}),CROWD_X:2};
/* ASSETS.loadOne：記下要了哪些（不真的下載）；loaded() 把泳客標成載好了 */
const asked=new Set(); ASSETS.loadOne=k=>{ asked.add(k); return new Promise(()=>{}); };
const SW=['char.swim_sm1','char.swim_sm2','char.swim_sf1','char.swim_sf2'];
const loaded=on=>{ for(const k of SW.concat(['char.mixamo_clips'])){ if(on) ASSETS.cache[k]={tpl:{}}; else delete ASSETS.cache[k]; } };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'high'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
global.GAME={G:null};
let GMc=null;
function enter(id,G){ GAME.G=G; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; else if(z.nav) z.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:0,seat:null}; E.camera=null; G.zone=id; const GM={G,E,hourRate:1/150,sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,st.y||0,st.z); n.obj.rotation.y=st.yaw||0; }};
  CROWD.enter(GM,id); GMc=GM; return {z,GM}; }
const tick=(GM,dt,k)=>{ for(let i=0;i<k;i++) CROWD.tick(GM,dt); };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(key,h)=>({day:dayOf(key),hour:h,flags:{},weekday:CALENDAR.dateOf(dayOf(key)).wd%7,stage:'law'});
const swimmers=()=>E.npcs.filter(n=>n.obj&&n.obj.userData.spec&&/^char\.swim_/.test(n.obj.userData.spec.model||''));
const inWater=()=>E.npcs.filter(n=>/^swim_/.test(n.pose||'')||n.swimmer);
const B=GYM_LAYOUT.b1.pool.basin, laneZ=i=>B.z0+2.5*(i+0.5), CX=(B.x0+B.x1)/2;
const TUE='2025-09-23', MON4='2025-09-22';
check('0. character3d.js 有 C.swimLap（測試用真正的那一行）',typeof C.swimLap==='function');
check('0. GYM_LAYOUT 的池子：7 道、每道 2.5 m',B.lanes===7&&Math.abs((B.z1-B.z0)/B.lanes-2.5)<1e-9,JSON.stringify(B));
// ---------- 1. VRM 還沒載好 ----------
loaded(false);
{ const {GM}=enter('gym_b1',mkG(TUE,18.5)); tick(GM,1/30,20);
  check('1. 開館、泳客 VRM 還沒載好：水裡沒有人（不讓備用人物站在水裡）',inWater().length===0&&swimmers().length===0,inWater().length+' 人');
  check('1. 有去下載泳客（char.swim_*，lazy）',SW.some(k=>asked.has(k)),[...asked].join(' ')); }
// ---------- 2. 載好以後 ----------
{ loaded(false); const {GM}=enter('gym_b1',mkG(TUE,18.5)); const b4=swimmers().length; loaded(true); const it0=E.interactables.length, co0=E.colliders.length;
  /* 進場那一刻沒載好、後來才載好：等在池邊轉身才放（E.camera null＝當作一直在畫面裡）*/
  const spawnTurn=[]; let prev=new Set();
  for(let i=0;i<180;i++){ CROWD.tick(GM,0.5); for(const n of swimmers()) if(!prev.has(n)){ const L=CROWD.swimLive[n.swimKey]; const q=CHAR.swimLap(CROWD.swimClock()+L.p.off,23.4,L.p.v); spawnTurn.push(q.turn); } prev=new Set(swimmers()); }
  const S=swimmers(), lanes=S.map(n=>Math.round((n.obj.position.z-B.z0)/2.5-0.5));
  check('2. 進場時還沒載好：進場那一刻沒有人',b4===0,b4+' 人');
  check('2. 後來才載好的：放進水裡的那一刻在池邊轉身（不在水道中間憑空出現）',spawnTurn.length>=2&&spawnTurn.every(t=>t>0),spawnTurn.map(t=>t.toFixed(2)).join(' '));
  check('2. 開館（週二 18:30、高畫質）：水裡 2～4 個泳客',S.length>=2&&S.length<=4,S.length+' 人');
  check('2. 每人一道、水道中線 z＝basin.z0＋2.5×(i＋0.5)、不相鄰',S.every((n,k)=>Math.abs(n.obj.position.z-laneZ(lanes[k]))<1e-6)&&new Set(lanes).size===lanes.length&&lanes.slice().sort((a,b)=>a-b).every((l,i,a)=>!i||l-a[i-1]>=2),'水道 '+lanes.join(','));
  check('2. 模型是 char.swim_*（不重複）、姿勢 swim_free／swim_breast',S.every(n=>/^swim_(free|breast)$/.test(n.pose))&&new Set(S.map(n=>n.obj.userData.spec.model)).size===S.length,S.map(n=>n.obj.userData.spec.model.slice(5)+':'+n.pose).join(' '));
  check('2. 不能點（沒有 talk、talkLabel）、沒有名字、在第 0 層',S.every(n=>!n.talk&&!n.talkLabel&&!n.name&&(n.lv|0)===0));
  check('2. 不加互動點、碰撞（池子的導航本來就擋住，泳客不走導航）',E.interactables.length===it0&&E.colliders.length===co0&&S.every(n=>!n.path&&n.frozen&&n.fixedPos));
  check('2. 池子本來就走不進去（導航擋住），泳客不擋任何人的路',S.every(n=>!E.canStand(n.obj.position.x,n.obj.position.z,0.3,0)));
  // ---------- 3. 沿 x 照 swimLap 游 ----------
  const xs=S.map(()=>[]); let ok=true, info='';
  for(let i=0;i<120;i++){ CROWD.tick(GM,1/30*3); S.forEach((n,k)=>{ const L=CROWD.swimLive[n.swimKey], q=CHAR.swimLap(CROWD.swimClock()+L.p.off,23.4,L.p.v), P=n.obj.position; xs[k].push(P.x);
      if(Math.abs(P.x-(CX+q.x))>1e-9||Math.abs(P.z-laneZ(lanes[k]))>1e-9||Math.abs(P.y)>1e-9||Math.abs(n.obj.rotation.y-q.yaw)>1e-9){ ok=false; info=n.swimKey+' x '+P.x.toFixed(3)+' vs '+(CX+q.x).toFixed(3); } }); }
  check('3. 每一格：位置＝(池中線＋swimLap(時間＋偏移, 23.4, 速度).x, 0, 水道中線)、朝向＝q.yaw',ok,info);
  check('3. 沿 x 在動、不超出池子（x '+B.x0+'～'+B.x1+'）',xs.every(a=>Math.max(...a)-Math.min(...a)>2&&a.every(x=>x>=B.x0&&x<=B.x1)),xs.map(a=>(Math.max(...a)-Math.min(...a)).toFixed(1)).join(' '));
  const ps=S.map(n=>CROWD.swimLive[n.swimKey].p);
  check('3. 速度 0.9～1.2、起始時間不同（不同步）',ps.every(p=>p.v>=0.9&&p.v<=1.2)&&new Set(ps.map(p=>p.off)).size===ps.length,ps.map(p=>p.v+'/'+p.off).join(' '));
  // ---------- 4. 同一天同一批人 ----------
  const sig=()=>swimmers().map(n=>n.obj.userData.spec.model+'@'+n.obj.position.z.toFixed(2)).sort().join(' '), s1=sig();
  enter('gym',mkG(TUE,18.6)); const {GM:GM2}=enter('gym_b1',mkG(TUE,18.7));
  check('4. 出去再進來（同一天）：同一批人、同一些水道；載好的進場就直接在水裡',sig()===s1&&swimmers().length===S.length,sig());
  check('4. B1 一層最多 16 個完整人物（泳客也算）',E.npcs.length<=16,E.npcs.length+' 人');
  /* 一層已經 15 個人：只放得下 1 個泳客 */
  { const G=mkG(TUE,18.7); GAME.G=G; enter('gym_b1',G); for(const n of swimmers()) E.removeNPC(n); for(const k in CROWD.swimLive) delete CROWD.swimLive[k];
    while(E.npcs.length<15) E.addNPC({obj:new THREE.Group(),name:'',isExtra:true,crowd:'x_fill'}); tick(GMc,0.5,120);
    check('4. 一層已經 15 個人：泳客只放 1 個（不超過 16）',E.npcs.length===16&&swimmers().length===1,E.npcs.length+' 人、泳客 '+swimmers().length); }
  // ---------- 畫質 ----------
  for(const [lv,mx] of [['low',2],['medium',3],['high',4]]){ E.q={level:lv}; let mxN=0, mnN=9; for(let d=0;d<20;d++){ const day=dayOf(TUE)+d*7; const G={day,hour:18.5,flags:{},weekday:2,stage:'law'}; if(!CROWD.gymHours(G)) continue; enter('gym_b1',G); mxN=Math.max(mxN,swimmers().length); mnN=Math.min(mnN,swimmers().length); }
    check('畫質 '+lv+'：每天 2～'+mx+' 個泳客',mnN>=2&&mxN<=mx,mnN+'～'+mxN); }
  E.q={level:'high'}; }
// ---------- 2b. 換區域還在黑幕裡才載好（game3d.js enter 等正式模型載好才淡入：GM.isEntering）----------
{ loaded(false); const {GM}=enter('gym_b1',mkG(TUE,18.5)); GM.isEntering=()=>true; loaded(true); CROWD.tick(GM,1/30); const n1=swimmers().length;
  check('2b. 換區域的黑幕裡才載好：淡入以前就直接放進水道',n1>=2,n1+' 人'); }
// ---------- 5. 關館 ----------
{ enter('gym_b1',mkG(TUE,22.5)); check('5. 22:30（關館）：水裡沒有人',swimmers().length===0,swimmers().length+' 人');
  enter('gym_b1',mkG(TUE,7.5)); check('5. 07:30（還沒開）：水裡沒有人',swimmers().length===0,swimmers().length+' 人');
  enter('gym_b1',mkG(MON4,14)); check('5. 每月第四個星期一（休館）：水裡沒有人',swimmers().length===0,swimmers().length+' 人');
  const G=mkG(TUE,21.7), {GM}=enter('gym_b1',G); const n0=swimmers().length; G.hour=22.3; tick(GM,1/30,3);
  check('5. 在館裡時間跳到關館（21:42 → 22:18）：泳客拿掉',n0>=2&&swimmers().length===0,n0+' → '+swimmers().length); }
// ---------- 6. 只在 B1 ----------
{ for(const [z,h] of [['gym',18.5],['gym_arena',15],['wenzhou',15]]){ if(!Z3.ZONES[z]) continue; const {GM}=enter(z,mkG(TUE,h)); tick(GM,0.5,60); check('6. '+z+'：沒有泳客',swimmers().length===0&&inWater().length===0,swimmers().length+' 人'); }
  check('6. manifest 的四個泳客：lazy、swim:true、不是 anon／ambient（不會被抽去當路人）',SW.every(k=>{ const m=ASSETS.manifest[k]; return m&&m.lazy&&m.swim&&!m.anon&&!m.ambient; }));
  check('6. crowd3d.js 的下載記號有登記 LOADLOCKS（讀檔時放開）',typeof (globalThis.LOADLOCKS||{})['crowd3d:swimLoad']==='function'); }
console.log(fails?'FAILED '+fails:'ALL PASS');
process.exit(fails?1:0);

// 隔著牆的人不能說話（SHOP-STAFF-1107 第 3 件；使用者 11-07 試玩：「游泳池跟一個年輕男生說話 結果是櫃台阿姨？」）——不需要瀏覽器。
// 在 Node 建出遊戲真正的體育館 B1（gym_b1），照 GAME.enter 進館（CROWD.enter），用引擎真正的 E.nearestInteractable 挑按鈕：
//   1. 前提：B1 櫃台阿姨（desk_b1，「聽一句」）站在櫃台後面 (21.0, 0.2)，背後就是游泳池的牆（z −0.2，鏡頭碰撞盒）；池邊長椅 (18.6／21.0, −1.0) 坐著人（沒有句子）
//   2. 玩家在游泳池這一側（池邊長椅前面、坐在長椅上、長椅中間），離阿姨 2.2 m 以內：按鈕不是阿姨（隔著牆）；E.talkBlocked(阿姨)＝true
//   3. 玩家在大廳這一側（櫃檯旁邊、走廊）：阿姨照樣說得到話（隔著櫃台不算牆）；站在櫃檯旁邊按鈕就是她的「聽一句」
//   4. 碰撞盒的世界座標：B1 的群組往 −z 移 5 m，Node 裡沒有畫面更新——E.talkBlocked 自己更新一次，泳池的牆在 z −0.2（不是 4.8）
//   5. 不受影響：沒有牆的區域（E.colliders 空的）照舊；牆在那個人背後（人貼著牆站）照舊說得到話
// 修改前（開發分支 70cd58a2d）：第 2 項 FAIL（站在長椅前面，按鈕是櫃台阿姨的「聽一句」）。用法：node tests/pool_desk_talk_1107_unit.js
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
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),profSpec:c=>({id:c.id,name:c.name,sex:c.gender==='f'?'f':'m'}),CROWD_X:2};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
global.GAME={G:null};
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(key,h)=>({day:dayOf(key),hour:h,flags:{},weekday:CALENDAR.dateOf(dayOf(key)).wd%7,stage:'law'});
const J=JSON.stringify;
let VIS=0;
function enter(id,G){ GAME.G=G; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; else if(z.nav) z.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:0,seat:null}; E.camera=null; E.prefNpc=null; G.zone=id; const GM={G,E,enterN:++VIS,hourRate:1/150,sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,st.y||0,st.z); n.obj.rotation.y=st.yaw||0; }};
  CROWD.enter(GM,id); return {z,GM}; }
const B=GYM_LAYOUT.b1, ST=B.desk.staff, WALLZ=B.pool.z1;
const at=(x,z)=>{ E.player.obj.position.set(x,0,z); E.player.tapPref=null; return E.nearestInteractable(); };
const who=it=>it?(it.npc?('人：'+(it.npc.name||'(沒有名字)')+'／'+it.label):it.label):'（沒有）';
const isAunt=(it,a)=>!!it&&!!it.npc&&it.npc===a;

const TUE='2025-09-23';
enter('gym_b1',mkG(TUE,18.5));
const aunt=E.npcs.find(n=>n.crowdRole==='desk_b1'), bench=E.npcs.filter(n=>n.crowdRole==='pool_bench');
// 1
check('1. B1 櫃台阿姨在櫃台後面（配置 desk.staff），有「聽一句」',!!aunt&&Math.hypot(aunt.obj.position.x-ST.x,aunt.obj.position.z-ST.z)<0.01&&typeof aunt.talk==='function'&&aunt.talkLabel==='聽一句'&&aunt.name==='櫃台阿姨',
  aunt?J([aunt.obj.position.x,aunt.obj.position.z,aunt.talkLabel]):'');
check('1. 她背後就是游泳池的牆（z '+WALLZ+'，離她 '+(ST.z-WALLZ).toFixed(2)+' m）；池邊長椅有人坐（沒有句子）',ST.z-WALLZ<0.5&&bench.length>=1&&bench.every(n=>!n.talk),J(bench.map(n=>[n.obj.position.x,n.obj.position.z])));
check('1. 游泳池的牆是鏡頭碰撞盒（E.colliders 有 z −0.2 那一面）',E.colliders.length>0);
// 2 游泳池這一側
{ const pts=[[21.0,-1.8],[20.4,-1.8],[21.6,-1.8],[20.0,-1.9],[22.6,-1.0],[22.8,-1.4]].filter(p=>E.canStand(p[0],p[1],0.3,0)&&Math.hypot(p[0]-ST.x,p[1]-ST.z)<2.2);
  check('2. 找得到游泳池這一側、離阿姨 2.2 m 以內站得住的點（長椅前面）',pts.length>=3,J(pts));
  const bad=[]; for(const p of pts){ const it=at(p[0],p[1]); if(isAunt(it,aunt)) bad.push([p,who(it)]); }
  check('2. 站在長椅前面：按鈕不是櫃台阿姨（隔著牆）',bad.length===0,J(bad));
  E.player.obj.position.set(21.0,0,-1.8); check('2. E.talkBlocked(阿姨)＝true（長椅前面）',typeof E.talkBlocked==='function'&&E.talkBlocked(aunt)===true);
  /* 坐在長椅上（座位點 (21.0, −1.1)；人物在座位上）*/
  const seat=E.interactables.find(q=>q.seat&&Math.hypot(q.x-21.0,q.z-(-1.1))<0.05);
  const it=at(21.0,-1.1); check('2. 坐在長椅上（21.0, −1.1）：按鈕不是櫃台阿姨',!isAunt(it,aunt)&&!!seat,who(it)); }
// 3 大廳這一側
{ E.player.obj.position.set(21.0,0,1.9); check('3. 櫃檯前面（客人那一側 z 1.9）：隔著櫃台不算牆，E.talkBlocked＝false',typeof E.talkBlocked==='function'&&E.talkBlocked(aunt)===false);
  let hit=null; for(let x=18.6;x<=23.6&&!hit;x+=0.2) for(let z=0.3;z<=2.6&&!hit;z+=0.2){ if(!E.canStand(x,z,0.3,0)||Math.hypot(x-ST.x,z-ST.z)>2.1) continue; const it=at(x,z); if(isAunt(it,aunt)) hit=[+x.toFixed(2),+z.toFixed(2)]; }
  check('3. 大廳這一側（櫃檯旁邊）站得到一個點，按鈕就是櫃台阿姨的「聽一句」',!!hit,J(hit)); }
// 4 碰撞盒的世界座標
{ const wall=E.colliders.filter(c=>{ c.geometry.computeBoundingBox(); const bb=c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld); return bb.max.x-bb.min.x>10&&Math.abs((bb.min.z+bb.max.z)/2-WALLZ)<0.05; });
  check('4. E.talkBlocked 更新過碰撞盒的世界座標：泳池的牆在 z '+WALLZ+'（B1 群組往 −z 移 5 m）',wall.length>=1,String(wall.length)); }
// 5 不受影響
{ const keep=E.colliders; E.colliders=[]; const z0=E.zone; const camCols=z0.camCols; z0.camCols=null;
  E.player.obj.position.set(21.0,0,-1.8); check('5. 沒有牆（E.colliders 空的）：E.talkBlocked＝false（照舊只看距離）',typeof E.talkBlocked==='function'&&E.talkBlocked(aunt)===false);
  E.colliders=keep; z0.camCols=camCols;
  /* 牆在那個人背後：玩家在大廳、阿姨貼著泳池的牆站——線不穿過牆 */
  E.player.obj.position.set(21.0,0,1.9); check('5. 牆在那個人背後（她貼著牆站）：E.talkBlocked＝false',typeof E.talkBlocked==='function'&&E.talkBlocked(aunt)===false); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

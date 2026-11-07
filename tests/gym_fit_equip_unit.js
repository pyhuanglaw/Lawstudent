// 健身中心的器材一件一件（GYM-FIT-1107，LAWWW2-B 2026-11-07；LAWWW-B c244ce20e 派工：玩家一台一台用器材）——不需要瀏覽器。
// gym_layout.js 的 b1.fitness.equip（22 件）。在 Node 建出遊戲真正的 B1（Z3.ZONES.gym_b1＋CROWD），用引擎的導航檢查：
//   1. 22 件、id 不重複；每一件對得到 b1.equipment 的同一台（node、at、ry 一樣，i＝在那一種裡的第幾台），22 台都有；
//   2. stand（走過去站的地方）：人站得下（半徑 0.32 m）、從 B1 的出生點走得到、面向器材（站著用的：面向鏡子）；
//   3. use（用的時候人在哪裡）：坐著的（飛輪、划船機、訓練椅）＝器材原點、朝向＝器材的 ry；跑步機在皮帶上（0.18 m）；站著用的（深蹲架、史密斯機、啞鈴架）站得下；
//      姿勢是 character3d.js 有的動作（run、walk、gym_*）；
//   4. 和路人現在的用法一樣：進館很多次，每一個在器材上的路人（crowd3d.js 的 fit 清單）都對得到某一件的某一個 use（位置 ±5 cm、姿勢一樣）。
// 修改前（開發分支 c244ce20e）：沒有 b1.fitness.equip（第 1 項 FAIL）。用法：node tests/gym_fit_equip_unit.js
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
const S_open=G=>!!CROWD.gymHours(G), TUE='2025-09-23', SAT='2025-09-27', SUN='2025-09-28', MON4='2025-09-22';
/* 有玩家體育課的星期一（大一上第 3 週以後、不是國定假日、不是第四個星期一）：照課表找，不寫死 */
const MONPE=(()=>{ for(let d=1;d<120;d++){ const q=CALENDAR.dateOf(d), t=CALENDAR.termOf(d); if(!t||t.week<3||q.wd!==1||(q.d>=22&&q.d<=28)) continue; const G={day:d,hour:15.8,flags:{},stage:'law'}; if(CLS.dayItems(G).some(it=>it.room&&it.room.door==='gym')) return q.key; } return null; })();
const B=GYM_LAYOUT.b1, EQ=(B.fitness&&B.fitness.equip)||[];
// ---------- 1. 22 件、對得到 equipment ----------
{ const ids=new Set(EQ.map(e=>e.id)), all=[]; for(const e of B.equipment) e.at.forEach((q,i)=>all.push({node:e.node,i,at:q,ry:e.ry}));
  const miss=all.filter(a=>!EQ.some(e=>e.node===a.node&&e.i===a.i&&Math.abs(e.at[0]-a.at[0])<1e-6&&Math.abs(e.at[1]-a.at[1])<1e-6&&Math.abs(e.ry-a.ry)<1e-6));
  check('1. b1.fitness.equip：22 件、id 不重複、每一件對得到 equipment 的同一台（node、at、ry、i），22 台都有',EQ.length===22&&ids.size===22&&all.length===22&&!miss.length,EQ.length+' 件；對不到 '+JSON.stringify(miss.map(a=>a.node+'#'+a.i))); }
const POSES=['run','walk','gym_squat','gym_curl','gym_press','gym_bike','gym_row','gym_stretch'], SEATED={bike:1,rower:1,bench:1}, STANDING={squat_rack:1,smith:1,db_rack:1};
// ---------- 2、3. 站位、使用位置 ----------
{ const {z}=enter('gym_b1',mkG(TUE,18.5)), nav=z.nav, sp=z.spawn; const bad2=[], bad3=[];
  for(const e of EQ){ const s=e.stand;
    if(!s||!nav.clear(s.x,s.z,0.32)) { bad2.push(e.id+' 站不下'); continue; }
    const p=nav.path(sp.x,sp.z,s.x,s.z); if(!p) bad2.push(e.id+' 走不到');
    const tgt=STANDING[e.kind]?null:[e.at[0]-s.x,e.at[1]-s.z], f=[Math.sin(s.yaw),Math.cos(s.yaw)];
    if(tgt){ const L=Math.hypot(tgt[0],tgt[1]); if((tgt[0]*f[0]+tgt[1]*f[1])/L<0.7) bad2.push(e.id+' 沒有面向器材'); } else if(Math.cos(s.yaw)<0.99) bad2.push(e.id+' 沒有面向鏡子');
    for(const u of e.use||[]){ if(!POSES.includes(u.pose)||(u.alt&&!POSES.includes(u.alt))) bad3.push(e.id+' 姿勢 '+u.pose);
      if(SEATED[e.kind]&&(Math.hypot(u.x-e.at[0],u.z-e.at[1])>1e-6||Math.abs(u.yaw-e.ry)>1e-6)) bad3.push(e.id+' 坐的位置不是器材原點／朝向');
      if(e.kind==='treadmill'&&!(Math.abs(u.y-0.18)<1e-6&&Math.abs(u.x-e.at[0])<1e-6&&Math.abs(u.z-e.at[1])<0.6)) bad3.push(e.id+' 不在皮帶上');
      if(STANDING[e.kind]&&!nav.clear(u.x,u.z,0.32)) bad3.push(e.id+' 站著用的地方站不下'); }
    if(!(e.use||[]).length) bad3.push(e.id+' 沒有 use'); }
  check('2. 走過去站的地方：22 件都站得下（0.32 m）、從出生點走得到、面向器材（站著用的面向鏡子）',EQ.length===22&&!bad2.length,bad2.join('；'));
  check('3. 用的時候：坐著的在器材原點、朝向對；跑步機在皮帶上；站著用的站得下；姿勢是遊戲有的動作',EQ.length===22&&!bad3.length,bad3.join('；')); }
// ---------- 4. 和路人的用法一樣 ----------
{ let seen=0, bad=[]; for(const key of [TUE,SAT,SUN]) for(const h of [8.5,10.2,12.6,15,17.4,18.5,19.6,21]){ enter('gym_b1',mkG(key,h));
    for(const n of ppl().filter(n=>n.crowdSpot==='gym_b1'&&n.crowdRole!=='desk_b1')){ seen++; const P=n.obj.position;
      const hit=EQ.some(e=>(e.use||[]).some(u=>Math.hypot(u.x-P.x,u.z-P.z)<0.05&&(u.pose===n.pose||u.alt===n.pose)));
      if(!hit) bad.push(n.crowdRole+'@'+P.x.toFixed(2)+','+P.z.toFixed(2)+'/'+n.pose); } }
  check('4. 路人在器材上的位置、姿勢都對得到某一件的 use（進館 24 次）',seen>=20&&!bad.length,seen+' 人次；對不到 '+[...new Set(bad)].join('、')); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);

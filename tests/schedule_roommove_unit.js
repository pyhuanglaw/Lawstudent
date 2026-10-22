// 同一區、下一個時段換到另一間（2026-10-14 flow_b4_lecture 在瀏覽器抓到：B4 演講 20:30 結束，以安、小語的作息換成博雅的圓桌（room:'round'），
// 兩個人卻一直坐在 101——refreshSchedule 原本只處理「走到某一點站著」（linger）和「離開」，沒有「起身走到同一區的另一間坐下」）。修正：story3d.js 的 roomMove。
// 不需要瀏覽器：載入真正的 calendar.js、characters.js、story3d.js、博雅的座位配置（boya_layout.js：101 的座位、兩張圓桌），其餘最小替身；
// 照 GAME.enter 進入博雅（STORY.populate），再像 S.tick 那樣呼叫 STORY.refreshSchedule。
// 修改前這個測試會失敗（第 2 項：20:30 以後兩個人還坐在 101、沒有往圓桌走）。用法：node tests/schedule_roommove_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
let GM=null; const ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'};
global.EVENTS={npcOf:id=>GM.npc[id]||GM.npc[ALIAS[id]]||null,onEnter(){},tick(){}};
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/places.js','src/data/boya_layout.js','src/story3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|BOYA_LAYOUT)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
// 博雅的座位：和 teach3d.js seatsOf 一樣（101 的座位 room:'101'；圓桌 room:'round'、table:'r1'/'r2'）
const L=BOYA_LAYOUT, SEATS=[];
for(const r of L.rooms) for(const s of (r.seats||[])) SEATS.push(Object.assign({kind:'lecture'},s));
for(const g of (L.groups||[])) for(const t of (g.tables||[])) for(const st of t.seats) SEATS.push(Object.assign({kind:g.kind,room:g.id,lv:g.lv},st));
const ROUND=SEATS.filter(s=>s.room==='round');
const THU=STORY.termDay('Y1S2',11,4);
const F0={afternoonDone:true,classDone:true,metAn:true,zheInvite:true,zheNoodleDone:true};
let moves=[];
function newGM(hour,seats){
  const E={npcs:[],q:{level:'high'},zone:{seats:seats.map(s=>Object.assign({},s)),spawn:{x:0,z:8.5,lv:0}},levels:null,navOf:null,nav:null,indoor:true,camera:null,
    player:{obj:{position:{x:0,y:0,z:8},rotation:{y:0}},busy:false,lv:0},addNPC(n){this.npcs.push(n);return n;}};
  E.moveTo=(n,x,z,cb,lv)=>{ moves.push({id:n.charId,x,z}); n.path=[[x,z]]; n._arrive=cb; return true; };
  const G={day:THU,weekday:4,hour,flags:Object.assign({},F0),social:{},zone:'boya',goal:''};
  const gm={E,G,npc:{},extras:[],D:{active:false},hourRate:1/150};
  gm.spawnNPC=(id,spec,x,z,opts)=>{opts=opts||{};const o=mkObj();o.position.set(x,0,z);const n=E.addNPC({obj:o,id,charId:opts.charId||id,name:spec.name||id,beh:opts.beh||'idle',seat:opts.seat,pose:opts.pose,waypoints:opts.waypoints,lv:opts.lv|0});gm.npc[id]=n;return n;};
  gm.spawnCharacter=(id,x,z,opts)=>{const c=CHARACTERS[id];if(!c)return null;if(gm.npc[id])return gm.npc[id];const n=gm.spawnNPC(id,{name:c.name},x,z,Object.assign({charId:id},opts)); n.charId=id; return n;};
  gm.removeNPC=id=>{ const n=gm.npc[id]; if(n){ E.npcs=E.npcs.filter(m=>m!==n); delete gm.npc[id]; } };
  gm.spawnExtra=()=>{E.addNPC({obj:mkObj(),isExtra:true});}; gm.spawnRider=()=>{};
  gm.sitAt=(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,0,st.z); };
  gm.standUp=n=>{ n.seat=null; n.pose='idle'; n.frozen=false; };
  gm.seatApproach=st=>[st.x,st.z+0.6];
  gm.knownIds=()=>Object.keys(CHARACTERS).filter(id=>CHARACTERS[id].social_layer!=='B');
  return gm; }
const arrive=id=>{ const n=EVENTS.npcOf(id); if(n&&n._arrive){ const cb=n._arrive; n._arrive=null; n.path=null; cb(n); } };
const room=id=>{ const n=EVENTS.npcOf(id); return n&&n.seat?n.seat.room:null; };
const info=ids=>JSON.stringify(ids.map(id=>{ const n=EVENTS.npcOf(id); return n?{id,seat:n.seat&&(n.seat.room+(n.seat.table?'/'+n.seat.table:'')),target:n.seatTarget&&(n.seatTarget.room+(n.seatTarget.table?'/'+n.seatTarget.table:'')),pose:n.pose,roomGo:!!n.roomGo}:{id,none:true}; }));
check('0. 前提：第 11 週週四是第 '+THU+' 天；博雅有 101 的座位和兩張圓桌（8 個位子）',!!THU&&SEATS.some(s=>s.room==='101')&&ROUND.length===8);
// 1) 20:20 走進博雅：以安、小語、阿哲照作息坐在 101
moves=[]; GM=newGM(20+20/60,SEATS); STORY.populate('boya',GM);
check('1. 20:20 進博雅：以安、小語、阿哲坐在 101',room('heroine_01')==='101'&&room('yu')==='101'&&room('zhe')==='101',info(['heroine_01','yu','zhe']));
// 2) 20:30 以後（refreshSchedule 每 3 秒）：以安、小語起身往圓桌走（不瞬移、不留在 101）；阿哲沒有下一個時段，不往圓桌走
GM.G.hour=20.5+1/60; moves=[]; STORY.refreshSchedule(GM);
const an=EVENTS.npcOf('heroine_01'), yu=EVENTS.npcOf('yu'), zhe=EVENTS.npcOf('zhe');
const walking=n=>!!n&&!n.seat&&!!n.seatTarget&&n.seatTarget.room==='round'&&n.roomGo===true;
check('2. 20:31：以安、小語起身、正走向圓桌的空位（seatTarget 在 round、不是瞬移過去）',walking(an)&&walking(yu)&&moves.some(m=>m.id==='heroine_01')&&moves.some(m=>m.id==='yu'),info(['heroine_01','yu']));
check('2. 走過去的終點是那個座位旁邊（seatApproach），不是座位上',[an,yu].every(n=>n&&n.seatTarget&&moves.some(m=>m.id===n.charId&&Math.abs(m.x-n.seatTarget.x)<1e-6&&Math.abs(m.z-(n.seatTarget.z+0.6))<1e-6)),JSON.stringify(moves));
check('2. 兩個人往同一張圓桌走（朋友坐一起）',!!(an&&yu&&an.seatTarget&&yu.seatTarget)&&an.seatTarget.table===yu.seatTarget.table&&an.seatTarget!==yu.seatTarget,info(['heroine_01','yu']));
check('2. 阿哲（作息沒有圓桌）不往圓桌走',!zhe||!(zhe.seatTarget&&zhe.seatTarget.room==='round'),info(['zhe']));
// 3) 再過幾次 refreshSchedule（還在路上）：不重複叫他們走、不換位子
const t1=an&&an.seatTarget, t2=yu&&yu.seatTarget; moves=[];
for(let i=0;i<5;i++){ GM.G.hour+=0.005; STORY.refreshSchedule(GM); }
check('3. 還在路上：refreshSchedule 不會再叫他們重新走、不換位子',!moves.some(m=>m.id==='heroine_01'||m.id==='yu')&&an.seatTarget===t1&&yu.seatTarget===t2,JSON.stringify(moves));
// 4) 走到了：坐下（圓桌、看書的姿勢）；之後不再被搬動
arrive('heroine_01'); arrive('yu'); moves=[];
for(let i=0;i<5;i++){ GM.G.hour+=0.01; STORY.refreshSchedule(GM); }
check('4. 走到圓桌：坐下（room round、同一張桌子、看書的姿勢）、之後不再被搬動',room('heroine_01')==='round'&&room('yu')==='round'&&an.seat.table===yu.seat.table&&an.pose==='read'&&yu.pose==='read'&&!an.roomGo&&!yu.roomGo&&!moves.some(m=>m.id==='heroine_01'||m.id==='yu'),info(['heroine_01','yu']));
// 5) 20:31 才走進博雅（不是待在裡面）：直接坐在圓桌（populate 照舊）
moves=[]; GM=newGM(20.5+1/60,SEATS); STORY.populate('boya',GM);
check('5. 20:31 才走進博雅：以安、小語已經坐在圓桌（進區域照舊）',room('heroine_01')==='round'&&room('yu')==='round'&&!moves.some(m=>m.id==='heroine_01'||m.id==='yu'),info(['heroine_01','yu']));
// 6) 圓桌全被坐滿（替身 taken）：留在 101，不一直重試
{ const full=SEATS.map(s=>s.room==='round'?Object.assign({},s,{taken:true}):s);
  moves=[]; GM=newGM(20+20/60,full); STORY.populate('boya',GM); GM.G.hour=20.5+1/60;
  for(let i=0;i<4;i++){ STORY.refreshSchedule(GM); GM.G.hour+=0.01; }
  check('6. 圓桌坐滿：以安、小語留在 101 的座位上，不一直重試走路',room('heroine_01')==='101'&&room('yu')==='101'&&!moves.some(m=>m.id==='heroine_01'||m.id==='yu'),info(['heroine_01','yu'])+' '+JSON.stringify(moves)); }
// 7) 走不到（E.moveTo 失敗）：坐回原來的位子，不會每 3 秒重試
{ moves=[]; GM=newGM(20+20/60,SEATS); STORY.populate('boya',GM); GM.G.hour=20.5+1/60; let tries=0;
  GM.E.moveTo=(n)=>{ if(n.charId==='heroine_01') tries++; return false; };
  for(let i=0;i<4;i++){ STORY.refreshSchedule(GM); GM.G.hour+=0.01; }
  const n=EVENTS.npcOf('heroine_01');
  check('7. 走不到圓桌：只試一次、不留下「正要去」的狀態、坐回 101 原來的位子（姿勢不變）',tries===1&&!!n&&!n.roomGo&&!n.seatTarget&&room('heroine_01')==='101'&&n.pose==='sit',JSON.stringify({tries,roomGo:n&&n.roomGo,seat:room('heroine_01'),pose:n&&n.pose})); }
// 8) 一般日子（不是第 11 週）：作息沒有 room 的人不受影響（總圖看書的人不會被搬）
{ const d=STORY.termDay('Y1S2',10,4); const seats=Array.from({length:20},(_,i)=>({x:i,z:0,yaw:0}));
  moves=[]; GM=newGM(16.2,seats); GM.G.zone='library'; GM.G.day=d; STORY.populate('library',GM); const before=GM.E.npcs.filter(n=>n.seat).length;
  for(let i=0;i<5;i++){ STORY.refreshSchedule(GM); GM.G.hour+=0.01; }
  const moved=GM.E.npcs.filter(n=>n.roomGo).length;
  check('8. 一般日子在總圖（座位沒有分間）：坐著的人不會被 roomMove 搬動',before>0&&moved===0,JSON.stringify({before,moved})); }
console.log(fails?('FAILED '+fails):'ALL PASS');
process.exit(fails?1:0);

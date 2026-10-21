// 學姊待在店裡也會走進來（X71，BUG-CAFE-NPC-1020；BB-C 2026-10-20：待在 Café 跳到 20:01，學姊沒來）——不需要瀏覽器。
//   學姊在 Café／總圖照作息（AA_284 1-2），原本只有走進區域那一刻才生（S.populate）；待在店裡、時段到了不會來。
//   1. 她的時段裡、她還不在：從門口（區域的出生點）走進來，坐到她的位子（Café 5 號），until＝時段結束；
//   2. 已經在了、位子被玩家坐了、時段剩不到 15 分鐘、不是她的時段：都不來；
//   3. refreshSchedule（待在區域裡每 3 秒）會呼叫它。
// 修改前 1、3 FAIL。用法：node tests/sis_walkin_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null; const seats=[0,1,2,3,4,5,6,7].map(i=>({x:i*1.5-5,z:0,yaw:0}));
const mkGM=()=>{ const E={zone:{seats,spawn:{x:0,z:5,yaw:Math.PI}},npcs:[],player:{seat:null,obj:{position:{x:0,z:4}}},moveTo:(n,x,z,cb)=>{ n.walkedFrom={x:n.obj.position.x,z:n.obj.position.z}; cb(); return true; }};
  const GM={get G(){ return G; },E,npc:{},spawnNPC(id,spec,x,z,o){ const n={id,charId:'heroine_05',obj:{position:{x,z}},talk:o&&o.talk}; GM.npc[id]=n; E.npcs.push(n); return n; },sitAt(n,st){ n.seat=st; },seatApproach:st=>[st.x,st.z+0.6]};
  EVENTS.bind(GM); return GM; };
const at=(day,h)=>{ G={day,hour:h,zone:'cafe',stage:'law',weekday:CALENDAR.dateOf(day).wd%7,flags:{introDone:true,afternoonDone:true,classDone:true},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null}; SOCIAL.bind(G); EVENTS.bind({get G(){ return G; },E:{player:{obj:{position:{x:0,z:0}}},npcs:[]},npc:{}}); };
// 找學姊在 Café 的時段（大一上第 2 週起，19:30 那一刻）
let D=null, ent=null; for(let d=6; d<20&&!D; d++){ at(d,19.5); const e=STORY.schedEnt(CHARACTERS.heroine_05,G); if(e&&e.zone==='cafe'){ D=d; ent=e; } }
check('0. 找得到學姊在 Café 的時段', !!D, D!=null?(CALENDAR.dateOf(D).key+' '+ent.from+'–'+ent.to):'沒有');
if(D!=null){ const ok=typeof STORY.sisWalkIn==='function';
  at(D,19.5); let GM=mkGM(); const r=ok&&STORY.sisWalkIn(GM,'cafe'); const n=GM.npc.sis;
  check('1. 她的時段、她還不在：從門口走進來、坐到 5 號、until＝時段結束', !!r&&!!n&&n.walkedFrom&&n.walkedFrom.x===0&&n.walkedFrom.z===5&&n.seat===seats[5]&&n.until===ent.to&&typeof n.talk==='function', n?JSON.stringify({from:n.walkedFrom,seat:n.seat===seats[5],until:n.until}):'沒有生');
  check('2. 已經在了：不再來一個', ok&&!STORY.sisWalkIn(GM,'cafe')&&GM.E.npcs.length===1);
  at(D,19.5); GM=mkGM(); GM.E.player.seat=seats[5]; check('2. 她的位子被玩家坐了：不來', ok&&!STORY.sisWalkIn(GM,'cafe')&&!GM.npc.sis);
  at(D,ent.to-0.1); GM=mkGM(); check('2. 時段剩不到 15 分鐘：不來', ok&&!STORY.sisWalkIn(GM,'cafe')&&!GM.npc.sis);
  at(D,10); GM=mkGM(); check('2. 不是她在 Café 的時段：不來', ok&&!STORY.sisWalkIn(GM,'cafe')&&!GM.npc.sis); }
{ const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); const m=s.match(/function refreshSchedule\(GM\)\{[\s\S]*?lingerMove\(GM,zoneId\);/);
  check('3. refreshSchedule（待在區域裡每 3 秒）先叫 sisWalkIn 再 populateSchedule（劇情的 sis 先來，作息不會再生一個 heroine_05）', !!m&&/sisWalkIn\(GM,zoneId\)[\s\S]*populateSchedule\(zoneId,GM,true\)/.test(m[0])); }
if(D!=null&&typeof STORY.refreshSchedule==='function'){ at(D,19.5); const GM=mkGM(); GM.D={active:false,busyDepth:0}; GM.removeNPC=id=>{ delete GM.npc[id]; }; GM.spawnCharacter=(id,x,z,o)=>GM.spawnNPC(id,null,x,z,o); GM.E.zone.indoor=true; GM.E.indoor=true;
  try{ STORY.refreshSchedule(GM); }catch(e){}
  check('4. 待在 Café、學姊的時段到了（refreshSchedule）：只來一個學姊（sis），沒有另外一個 heroine_05', !!GM.npc.sis&&!GM.npc.heroine_05, JSON.stringify(Object.keys(GM.npc))); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

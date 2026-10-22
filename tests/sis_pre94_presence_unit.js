// BUG-SIS-PRE94-PRESENCE-1022（BB 帳號 A 10-22 07:05 讀碼；AA_379 1-4，企劃線 19a4414e，AA 選 ①）：學姊開學（新局 9/1）起照作息出現，不等第二天下午的劇情——不需要瀏覽器。
//   原本 story3d.js 的 schedFor 對 LEGACY_IDS（以安、學姊、阿哲、Alison、阿凱、周教授）一律「afternoonDone 以前不照作息」：選 1 的新局（8/31 開始）要到 9/4 下午才解除，
//   8/31～9/4 中午學姊完全看不到，AA_279／AA_379 寫的「9/4 以前找她＝（她在看手機，沒有抬頭。）」玩家到不了。
//   1 新局 9/2（二）10:00：學姊在總圖閱覽室（whereIs、走進來 sisWalkIn 都有，坐到 2 號、until＝作息結束 17:00）
//   2 照舊：8/31 晚上（開學以前）不在；以安、阿哲、Alison、阿凱、周教授 afternoonDone 以前照舊不照作息；經濟系那一年照舊；afternoonDone 以後照舊
// 修改前（開發分支 809ea58b）：第 1 項 FAIL。用法：node tests/sis_pre94_presence_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
let G=null; const seats=[0,1,2,3,4,5,6,7].map(i=>({x:i*1.5-5,z:0,yaw:0}));
const mkGM=()=>{ const E={zone:{seats,spawn:{x:0,z:5,yaw:Math.PI}},npcs:[],player:{seat:null,obj:{position:{x:0,z:4}}},moveTo:(n,x,z,cb)=>{ cb(); return true; }};
  const GM={get G(){ return G; },E,npc:{},spawnNPC(id,spec,x,z,o){ const n={id,charId:'heroine_05',obj:{position:{x,z}},talk:o&&o.talk}; GM.npc[id]=n; E.npcs.push(n); return n; },sitAt(n,st){ n.seat=st; },seatApproach:st=>[st.x,st.z+0.6]};
  EVENTS.bind(GM); return GM; };
/* 選 1 的新局（AA_195、D91）：LAW_START_DAY −16（8/31）、MAIN_D1 −13（9/3）；第二天下午的劇情（9/4）還沒演＝afternoonDone 沒有值 */
const at=(key,h,flags,stage)=>{ const day=STORY.dayOfKey(key); G={day,hour:h,zone:'library',stage:stage||'law',weekday:CALENDAR.dateOf(day).wd%7,flags:Object.assign({introDone:true,LAW_START_DAY:-16,MAIN_D1:-13,KAI_MOVEIN:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null}; SOCIAL.bind(G); return mkGM(); };
const where=(GM,id)=>{ const w=STORY.whereIs(GM,id); return w?(w.zone||w.away||'?'):null; };
{ const GM=at('2025-09-02',10); const e=STORY.schedEnt(CHARACTERS.heroine_05,G);
  check('0. 作息：9/2（二）10:00 學姊在總圖閱覽室讀書（characters.js）',!!e&&e.zone==='library'&&e.act==='read',J(e));
  const w=where(GM,'heroine_05'), r=STORY.sisWalkIn(GM,'library'), n=GM.npc.sis;
  check('1. 新局 9/2 10:00、還沒演第二天下午：學姊在閱覽室（「現在大概在」照作息）',w==='library',J(w));
  check('1. 待在閱覽室：她從門口走進來、坐到 2 號、until＝作息結束',!!r&&!!n&&n.seat===seats[2]&&!!e&&n.until===e.to,n?J({seat:n.seat===seats[2],until:n.until}):'沒有生');
  check('1. 9/4 以前：是「還沒分直屬」那一句的時候（S.sisPreW1）',STORY.sisPreW1(G,'heroine_05')===true); }
{ const GM=at('2025-08-31',20);
  check('2. 8/31 晚上（開學以前）：學姊不在',where(GM,'heroine_05')===null&&!STORY.sisWalkIn(GM,'library'),J(where(GM,'heroine_05'))); }
{ const GM=at('2025-09-02',10), L=['heroine_01','zhe','yu','kai','prof_zhou'].map(id=>[id,where(GM,id)]);
  check('2. 以安、阿哲、Alison、阿凱、周教授：afternoonDone 以前照舊不照作息',L.every(x=>x[1]===null),J(L)); }
{ const GM=at('2025-09-02',10,{},'econ');
  check('2. 經濟系那一年：照舊（學姊不照作息出現）',where(GM,'heroine_05')===null,J(where(GM,'heroine_05'))); }
{ const GM=at('2025-09-09',10,{afternoonDone:true});
  check('2. afternoonDone 以後：照舊照作息（9/9 10:00 閱覽室）',where(GM,'heroine_05')==='library',J(where(GM,'heroine_05'))); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

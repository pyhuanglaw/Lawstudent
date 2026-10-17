// 校外單獨約會的預約與衝突檢查（DATE-S3；src/date3d.js 的 DATE.check／canAsk／menu／pickWhen／tick、invites3d.js 的「去校外…」）：AA_128 4-1、4-3。用法：node tests/date_book_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
GM.money=d=>{ G.money+=d; }; GM.toast=()=>{}; GM.caption=()=>{}; GM.updateHUD=()=>{};
const ADV2=global.ADV; ADV2.active=false;
(async()=>{
  const day=termDay('Y1S2',5,6);   // 週六
  OUT.BG.d13_base_sunset=OUT.BG.d13_base_sunset||{label:'淡水',image:'x'};   /* 有底圖才列（遊戲裡 D04、D06、D12、D13 有）*/
  // ---------- 1 誰約得到 ----------
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; R('heroine_03',...LV.FRI);
  let ca=DATE.canAsk(G,'heroine_03'); check('1. 第 5 階以前約不到（AA_126 4-1：第 5 階以後的私下約會），寫原因',!ca.ok&&/還沒熟/.test(ca.why),JSON.stringify(ca)+' stage '+DATE.stageNum('heroine_03'));
  G.flags.dating_heroine_03=true; ca=DATE.canAsk(G,'heroine_03'); check('1. 交往中不看階段',ca.ok,JSON.stringify(ca)); delete G.flags.dating_heroine_03;
  check('1. 不是七位女主角：不能約',!DATE.canAsk(G,'zhe').ok);
  delete G.contacts.heroine_03; check('1. 沒有聯絡方式：照 INV.whyNot 的原因',!DATE.canAsk(G,'heroine_03').ok); G.contacts.heroine_03=1;
  // ---------- 2 衝突檢查 ----------
  const base={who:'heroine_03',locs:['D13'],transport:'mrt'};
  let c=DATE.check(G,Object.assign({},base,{day,depart:15})); check('2. 週六 15:00 淡水：可以，算好回程、花費（車資來回＋門票）',c.ok&&c.plan.back>15&&c.cost===c.plan.fare+(DATE.loc('D13').admission|0),JSON.stringify(c));
  c=DATE.check(G,Object.assign({},base,{day,depart:8.5})); check('2. 現在 9:00，8:30 出發＝已經過了',!c.ok&&/過了/.test(c.why),c.why);
  c=DATE.check(G,Object.assign({},base,{day,depart:21})); check('2. 21:00 出發：回來超過 23:30 → 不能選、寫原因',!c.ok&&/23:30/.test(c.why),c.why);
  G.money=50; c=DATE.check(G,Object.assign({},base,{day,depart:15})); check('2. 錢不夠：寫預計花費',!c.ok&&/錢不夠/.test(c.why),c.why); G.money=5000;
  const t1=DATE.book(G,Object.assign({},base,{day,depart:13})); c=DATE.check(G,Object.assign({},base,{who:'heroine_01',day,depart:14}));
  check('2. 和已經約好的行程撞時間：寫跟誰、幾點',t1.ok&&!c.ok&&/撞時間/.test(c.why),c.why);
  c=DATE.check(G,Object.assign({},base,{day,depart:13,skip:t1})); check('2. 改時間時不和自己那一趟比',c.ok||!/撞時間/.test(c.why),c.why);
  const t2=DATE.book(G,{who:'heroine_01',locs:['D13'],transport:'mrt',day,depart:19-2.5-DATE.travel('D13').minutes/60*2>17?17:17}); 
  INV.accept(G,'heroine_02','cafe',day+1,14,{by:'player'}); c=DATE.check(G,Object.assign({},base,{day:day+1,depart:13}));
  check('2. 那天已經有校園邀約（同時段）：不能選',!c.ok&&/已經約了/.test(c.why),c.why);
  // 一天最多兩場
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; G.trips=[{trip:'T1',who:'heroine_01',locs:['D13'],day,depart:9,back:11,status:'booked'},{trip:'T2',who:'heroine_02',locs:['D13'],day,depart:11.5,back:13,status:'booked'}];
  c=DATE.check(G,Object.assign({},base,{day,depart:15})); check('2. 一天最多兩場（AA_126 7-2）',!c.ok&&/兩場/.test(c.why),c.why);
  G.trips=[{trip:'T1',who:'heroine_01',locs:['D24'],kind:'day',day,depart:8,back:12,status:'booked'}]; c=DATE.check(G,Object.assign({},base,{day:day,depart:15}));
  check('2. 那天已經有一日遊：不能再排',!c.ok&&/一日遊/.test(c.why),c.why);
  // 祐廷的課：可以排、提示
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; let wd=termDay('Y1S2',5,1), found=null;
  for(let d=wd; d<wd+5&&!found; d++){ for(const it of (CLS.dayItems(G,d)||[])){ if(it.t0>=9&&it.t1<=18){ found={d,it}; break; } } }
  if(found){ G.day=found.d-1; G.weekday=wdOf(G.day); G.hour=20; const h=Math.max(9,Math.floor(found.it.t0)); c=DATE.check(G,Object.assign({},base,{day:found.d,depart:h,who:'heroine_03'}));
    const busy=INV.busyAt(G,'heroine_03',found.d,h,c.plan?c.plan.back-h:3);
    check('3. 平日有課的時段：'+(busy?'她也有課（換一個人看提示）':'可以排，提示錯過哪一堂／少一次出席'),busy?true:(c.ok&&c.warns.some(w=>w.includes(found.it.c.name))),JSON.stringify({why:c.why,warns:c.warns,course:found.it.c.name})); }
  else check('3. 找不到平日白天的課（略過）',true);
  // 她的作息
  { let hit=null; for(let d=wd; d<wd+5&&!hit; d++) for(const h of [9,10,13,14,15]){ const P=DATE.plan(G,Object.assign({},base,{day:d,depart:h})); const e=INV.busyAt(G,'heroine_03',d,h,P.back-h); if(e){ hit={d,h,e}; break; } }
    if(hit){ G.day=hit.d-1; G.weekday=wdOf(G.day); G.hour=20; c=DATE.check(G,Object.assign({},base,{day:hit.d,depart:hit.h})); check('4. 她那時候有事（作息：'+hit.e.act+'）：不能選、寫原因',!c.ok&&/她那時候/.test(c.why),c.why); }
    else check('4. 語彤平日都沒有上課上班（略過）',true); }
  // ---------- 5 選單：地點 → 日期 → 時間 → 確認 → 排進行事曆 ----------
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; G.flags.dating_heroine_03=true;
  said=[]; opts=[]; picks=['淡水','明天','15:00','就這樣約'];
  const tb=await DATE.menu(GM,'heroine_03',null); const q=tb&&OUT.get(G,'date_'+tb.trip);
  check('5. 選單：只列有底圖的地點（淡水 D13）',opts[0].includes('淡水金色水岸')&&!opts[0].includes('九份老街'),opts[0].join('/'));
  check('5. 日期：今天起 7 天＋算了',opts[1].length===8&&/^今天/.test(opts[1][0])&&/^明天/.test(opts[1][1]),opts[1].join('/'));
  check('5. 時間：半日的出發時間（09:00～15:00）＋換一天＋算了',opts[2].includes('15:00 出發')&&opts[2].includes('換一天'),opts[2].join('/'));
  check('5. 確認的摘要寫：對象、地點、日期、出發、交通、預計花費、回程',said.some(s=>/和.*去淡水金色水岸：明天.*15:00 出發.*單程約.*預計花費.*回到台大/.test(s.t)),said.map(s=>s.t).join(' | '));
  check('5. 約好了：行程 booked、排進出遊（行事曆）、日期是明天',tb&&tb.ok&&tb.day===day+1&&!!q&&q.dateTrip===tb.trip,JSON.stringify(q));
  // 選了不能選的時間：提示、再選一次
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; G.flags.dating_heroine_03=true; G.money=30;
  said=[]; opts=[]; picks=['淡水','今天','15:00','算了']; let toasts=[]; GM.toast=t=>toasts.push(t);
  const tn=await DATE.menu(GM,'heroine_03',null); check('5. 錢不夠的時間灰掉；選了只提示、不會約成',!tn&&toasts.some(t=>/錢不夠/.test(t))&&!(G.trips||[]).length,JSON.stringify(toasts)); GM.toast=()=>{};
  // ---------- 6 出發前 60 分鐘提醒、daily ----------
  fresh(day,9,'dorm',{}); const tt=DATE.book(G,Object.assign({},base,{day,depart:15})); toasts=[]; GM.toast=t=>toasts.push(t);
  G.hour=13.9; DATE.tick(GM); check('6. 出發前 61 分鐘還不提醒',!toasts.length);
  G.hour=14.05; DATE.tick(GM); DATE.tick(GM); check('6. 出發前 60 分鐘：手機提醒一次「15:00，你約了…去淡水金色水岸。」',toasts.length===1&&/15:00，你約了.*淡水金色水岸/.test(toasts[0]),JSON.stringify(toasts));
  G.flags.FLAKED_heroine_03=day-40; DATE.log(G,'heroine_03').cancels=[day-40]; G.dateLog._daily=null; DATE.tick(GM); check('6. 每天一次 daily：30 天沒再取消就清掉 FLAKED',G.flags.FLAKED_heroine_03==null); GM.toast=()=>{};
  // ---------- 7 改時間：完整的日期時間選單 ----------
  fresh(day,9,'dorm',{}); const tm=DATE.book(G,Object.assign({},base,{day,depart:15})); const qm=OUT.get(G,'date_'+tm.trip); picks=['選別的日期和時間','明天','10:00'];
  const r7=await DATE.move(GM,qm,tm); check('7. 改時間「選別的日期和時間」→ 明天 10:00：行程與行事曆都更新、重新提醒',r7==='moved'&&tm.day===day+1&&tm.depart===10&&qm.day===day+1&&Math.abs(qm.h-(10+DATE.travel('D13').minutes/60))<1e-9&&tm.reminded===false,JSON.stringify(tm));
  // ---------- 8 INV.flow 的入口 ----------
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; opts=[]; picks=['算了'];
  await INV.flow(GM,'heroine_03',null,false); check('8. 約人的地點清單最後有「去校外…」（還沒到第 5 階＝灰掉）',opts[0].includes('去校外…'),opts[0].join('/'));
  fresh(day,9,'dorm',{}); G.contacts.zhe=1; opts=[]; picks=['算了']; await INV.flow(GM,'zhe',null,false); check('8. 男生（阿哲）沒有「去校外…」',!opts[0].includes('去校外…'),opts[0].join('/'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

// 校外單獨約會的預約與出發（DATE-S3～S5 第一版、半互動第一版；src/date3d.js＋outings3d.js 的 OUT）：AA_128 第 4、5 節。用法：node tests/date_trip_unit.js
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
  fresh(day,9,'dorm',{}); const money0=G.money;
  const b=DATE.book(G,{who:'heroine_03',locs:['D13'],day,depart:15});
  const q=OUT.get(G,'date_'+b.trip), tr=DATE.travel('D13');
  check('1. 預約成功：行程 booked、排進出遊（約好的時間＝出發＋車程、late 60 分鐘）',b.ok&&b.status==='booked'&&!!q&&Math.abs(q.h-(15+tr.minutes/60))<1e-9&&q.late===1&&q.dateTrip===b.trip,JSON.stringify(q));
  check('1. 回程時間＝出發＋去程＋停留（半日 2.5 小時）＋回程',Math.abs(b.back-(15+tr.minutes/60*2+2.5))<1e-9,b.back);
  G.hour=14.5; check('2. 出發前 30 分鐘還不會問',!OUT.due(G)); G.hour=15; check('2. 15:00 問「現在要出發嗎？」',OUT.due(G)===q);
  said=[]; opts=[]; picks=['出發','飲料攤','河邊欄杆','長椅','差不多了'];
  const R0={...SOCIAL.rel('heroine_03')}; const res=await OUT.prompt(GM,q);
  const t=DATE.trip(G,b.trip), L=DATE.log(G,'heroine_03'), R1=SOCIAL.rel('heroine_03');
  check('3. 三個選項：出發／改時間／今天不去了',JSON.stringify(opts[0])==='["出發","改時間","今天不去了"]',JSON.stringify(opts[0]));
  check('3. 出發 → 做了三個互動點 → 算一次、心願（淡水＝語彤）成立、DATED_1',res==='go'&&t.status==='done'&&t.spots.length===3&&L.count===1&&L.wish&&G.flags.DATED_1_heroine_03===true,JSON.stringify({res,status:t.status,spots:t.spots,count:L.count}));
  check('3. 結算：第一次去這個地點＋心願（她的戀愛 +5+4、祐廷 +4、信任 +2+3 以上）',R1.npcRom-R0.npcRom>=9&&R1.rom-R0.rom>=4&&R1.trust-R0.trust>=5,JSON.stringify({npcRom:R1.npcRom-R0.npcRom,rom:R1.rom-R0.rom,trust:R1.trust-R0.trust}));
  check('3. 扣錢：交通來回（地點資料的 fare 就是來回，BUG-DATE-FARE-DOUBLE-1021）＋互動點花費（飲料 60）',money0-G.money===tr.fare+60,money0-G.money);
  check('3. 回到台大的時間在 19:30 之前（傍晚行程）',G.day===day&&G.hour<19.6,G.hour);
  check('3. 出遊標 done（不會再問）',q.state==='done'&&!OUT.due(G));
  // 遲到超過 60 分鐘
  const b2=DATE.book(G,{who:'heroine_03',locs:['D01'],day:day+1,depart:14}); const q2=OUT.get(G,'date_'+b2.trip);
  G.day=day+1; G.hour=15.2; opts=[]; picks=['改時間','改到明天']; const r2=await DATE.prompt(GM,q2);
  check('4. 晚了 60 分鐘以上：只剩「改時間」「今天不去了」',JSON.stringify(opts[0])==='["改時間","今天不去了"]',JSON.stringify(opts[0]));
  check('4. 改到明天同一時間：行程、出遊都跟著改、不算次數',r2==='moved'&&DATE.trip(G,b2.trip).day===day+2&&q2.day===day+2&&q2.state==='planned'&&DATE.log(G,'heroine_03').count===1);
  // 反覆臨時取消
  const comf0=SOCIAL.rel('heroine_03').comf;
  G.day=day+2; G.hour=14; picks=['今天不去了']; await DATE.prompt(GM,q2);
  check('5. 第一次當天取消：沒有懲罰',!G.flags.FLAKED_heroine_03&&SOCIAL.rel('heroine_03').comf===comf0&&DATE.trip(G,b2.trip).status==='cancelled');
  const b3=DATE.book(G,{who:'heroine_03',locs:['D02'],day:day+5,depart:14}); const q3=OUT.get(G,'date_'+b3.trip); G.day=day+5; G.hour=14; picks=['今天不去了']; await DATE.prompt(GM,q3);
  check('5. 30 天內第二次當天取消：FLAKED、自在 -2（只扣這一次）',G.flags.FLAKED_heroine_03!=null&&SOCIAL.rel('heroine_03').comf===comf0-2);
  G.day=day+40; DATE.daily(G); check('5. 30 天沒有再取消：FLAKED 清掉',G.flags.FLAKED_heroine_03==null);
  // 一個互動點都沒做
  const b4=DATE.book(G,{who:'heroine_01',locs:['D01'],day:G.day,depart:10}); const q4=OUT.get(G,'date_'+b4.trip); G.hour=10; const fam0=SOCIAL.rel('heroine_01').fam;
  picks=['出發','就這樣回去']; await OUT.prompt(GM,q4);
  check('6. 做了 0 個就離開：不算次數、熟悉 +1、她說 leaveEarly 那一句（以安：AA_535b 1-3「……這樣就回去了？好。手帳上寫的，下次再用。」；沒有句子的人照舊旁白「……就這樣？」）',DATE.log(G,'heroine_01').count===0&&SOCIAL.rel('heroine_01').fam===fam0+1&&said.some(s=>s.t===(DATE.EXTRA_LINES&&DATE.EXTRA_LINES.heroine_01?DATE.EXTRA_LINES.heroine_01.leaveEarly[0]:'……就這樣？')));
  check('7. 不在地點表（公館）不能預約',!DATE.book(G,{who:'heroine_01',locs:['gongguan'],day:G.day+1,depart:10}).ok);
  console.log(fails?`\nFAILED ${fails}`:'\nALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

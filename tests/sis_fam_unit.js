// 學姊 W1 到社博之間的接觸（AA_218 17-6，使用者 10:2x 批准；SIS-176-1017）——不需要瀏覽器。用法：node tests/sis_fam_unit.js
//   ① 9/8（一）21:00 家族群組 Kevin「各位～這週五晚上家聚……」→ 出遊 9/12（五）19:00 家聚（公館巷子裡的簡餐店）
//   ② 9/10 刑總下課走廊（要 W1）「對，刑總。」；不在場延 9/11 民總下課「對，民總。」；只演一次
//   ③ 家聚：Kevin 介紹、憲法傳奇 95；去了記 SIS_FAM_DINNER；沒做過 W1 的在這裡算 W1
//   沒去：9/12 21:00 Kevin 群組照片、9/15 21:00「憲法有問題可以問書瑀學姊」；④ 9/16 21:00 私訊（去了或 9/15 那則之後）
// 修改前：沒有這些訊息和事件（全部失敗）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|VAC|VAC_DATA)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };
(async()=>{
  const d8=D('2025-09-08'), d10=D('2025-09-10'), d11=D('2025-09-11'), d12=D('2025-09-12'), d15=D('2025-09-15'), d16=D('2025-09-16');
  check('0. 9/8 週一、9/10 週三、9/11 週四、9/12 週五、9/16 週二',wdOf(d8)===1&&wdOf(d10)===3&&wdOf(d11)===4&&wdOf(d12)===5&&wdOf(d16)===2);
  const base=()=>{ fresh(d8,20.5,'dorm',{FAM_GROUP_SENT:true,LAW_START_DAY:D('2025-08-29'),introDone:true,classDone:true,afternoonDone:true}); G.stage='law'; PHONE.join(G,'family_law','法律系直屬家族'); };
  base(); run(20.5,20.9); check('1. 21:00 以前沒有',!PHONE.sent(G,'sis_fam_inv'));
  run(21,21.1); const K=TH('g:family_law').map(m=>m.text), q=OUT.get(G,'y1_fam_dinner');
  check('1. ① Kevin「各位～這週五晚上家聚，大一到大四都來，地點晚點貼。」',K.includes('各位～這週五晚上家聚，大一到大四都來，地點晚點貼。'),JSON.stringify(K));
  check('1. 出遊 9/12 19:00「家聚 19:00（公館巷子裡的簡餐店）」',!!q&&q.day===d12&&q.h===19&&q.ev==='ev_sis_fam_dinner',JSON.stringify(q));
  const snap=JSON.stringify(G); const back=()=>{ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; picks=[]; };
  // ② 走廊
  const h1=ev('ev_sis_fam_hall'), h2=ev('ev_sis_fam_hall2');
  G.day=d10; G.weekday=3; G.hour=12.2; check('2. 沒有 W1：不演',!EVENTS.check(h1,{trigger:'class',afterClass:'crim_gen1'}));
  G.flags.SIS_W1=true; G.flags.met_sis=true; check('2. W1：9/10 刑總下課會演',EVENTS.check(h1,{trigger:'class',afterClass:'crim_gen1'}));
  picks=['會啊']; await EVENTS.run(h1); let L=lines();
  check('2. 「學姊。」「喔，學弟。剛下課喔？」（AA_313 6-4：FAMILIAR 以前不叫名字）「對，刑總。」「週五家聚你會來嗎？」→「好，那週五見。」「我先去圖書館了，掰掰。」',L.some(t=>t.endsWith('喔，學弟。剛下課喔？'))&&L.some(t=>t.endsWith('對，刑總。'))&&L.some(t=>t.endsWith('好，那週五見。'))&&L[L.length-1].endsWith('我先去圖書館了，掰掰。')&&G.flags.SIS_FAM_HALL===true,JSON.stringify(L));
  G.day=d11; G.weekday=4; check('2. 演過了：9/11 民總下課不再演',!EVENTS.check(h2,{trigger:'class',afterClass:'civ_general'}));
  back(); G.flags.SIS_W1=true; G.flags.met_sis=true; G.day=d11; G.weekday=4; G.hour=15.2; check('2. 9/10 沒遇到：9/11 民總下課演「對，民總。」',EVENTS.check(h2,{trigger:'class',afterClass:'civ_general'}));
  picks=['還不確定']; await EVENTS.run(h2); L=lines(); check('2. 「對，民總。」→「可以的話就來啦，大家都會來。」',L.some(t=>t.endsWith('對，民總。'))&&L.some(t=>t.endsWith('可以的話就來啦，大家都會來。')));
  // ③ 家聚
  back(); G.day=d12; G.weekday=5; G.hour=19; said=[]; await EVENTS.run(ev('ev_sis_fam_dinner')); L=lines();
  check('3. 家聚：「（長桌坐了七八個人……）」Kevin 介紹、「書瑀學姊很厲害喔，憲法傳奇，張老師給她 95。」「我先回去了，你們慢慢聊。」',L[0]==='（長桌坐了七八個人，大一到大四都有。）'&&L.some(t=>t.endsWith('書瑀學姊很厲害喔，憲法傳奇，張老師給她 95。'))&&L[L.length-1].endsWith('我先回去了，你們慢慢聊。'),JSON.stringify(L));
  check('3. 沒做過 W1：祐廷先開口「學姊好，我是祐廷。我是妳的直屬。」→「我知道。名單上看過你的名字。」「我是溫書瑀。課的事可以問我。」（AA-C 15:59）',L.includes('祐廷：學姊好，我是祐廷。我是妳的直屬。')&&L.some(t=>t.endsWith('我知道。名單上看過你的名字。'))&&L.some(t=>t.endsWith('我是溫書瑀。課的事可以問我。')),JSON.stringify(L));
  check('3. 去了：SIS_FAM_DINNER；沒做過 W1 的在這裡算 W1（SIS_W1、met_sis、FIRST_MET）',G.flags.SIS_FAM_DINNER===true&&G.flags.SIS_W1===true&&G.flags.met_sis===true&&SOCIAL.has('heroine_05','FIRST_MET'));
  { const s2=JSON.stringify(G); back(); G.flags.SIS_W1=true; G.flags.met_sis=true; G.day=d12; G.weekday=5; G.hour=19; said=[]; await EVENTS.run(ev('ev_sis_fam_dinner')); check('3. 做過 W1：沒有自我介紹那三句',!lines().some(t=>/我是妳的直屬|名單上看過/.test(t))); G=JSON.parse(s2); SOCIAL.bind(G); EVENTS.bind(GM); }
  G.events.done.ev_sis_fam_dinner=1; run(21,21.1); check('3. 去了：當晚沒有 Kevin 的照片',!PHONE.sent(G,'sis_fam_photo'));
  G.day=d16; G.weekday=2; run(20.9,21.1); const S=TH('p:heroine_05').map(m=>m.from+':'+m.text);
  check('4. 9/16 21:00 私訊：問憲法怎麼準備、「解題書我推補習班那本……」「加油。」、SIS_FAM_MSG',S.includes('player:學姊，想問一下，妳憲法那時候怎麼準備的？')&&S.includes('heroine_05:解題書我推補習班那本，題目多，解得也清楚。')&&S[S.length-1]==='heroine_05:加油。'&&G.flags.SIS_FAM_MSG===true,JSON.stringify(S));
  // 沒去
  back(); G.day=d12; G.weekday=5; run(20.9,21.1); check('5. 沒去：9/12 21:00 Kevin「📷（照片：長桌，大家舉杯）今天大一只來一半，下次都要來喔！」',TH('g:family_law').some(m=>m.text==='📷（照片：長桌，大家舉杯）今天大一只來一半，下次都要來喔！'));
  G.day=d15; G.weekday=1; run(20.9,21.1); check('5. 沒去：9/15 21:00 Kevin「對了大一的，憲法有問題可以問書瑀學姊，她是張老師 95 分的傳奇。」',TH('g:family_law').some(m=>m.text==='對了大一的，憲法有問題可以問書瑀學姊，她是張老師 95 分的傳奇。'));
  G.day=d16; G.weekday=2; run(20.9,21.1); check('5. 沒去：9/16 21:00 私訊照樣演（強制）',PHONE.sent(G,'sis_fam_msg'));
  // 舊的第三週開局：不發
  fresh(d8,21.1,'dorm',{FAM_GROUP_SENT:true,LAW_START_DAY:D('2025-09-15')}); G.stage='law'; PHONE.join(G,'family_law','法律系直屬家族'); run(21,21.1);
  check('6. 開局在 9/8 以後的存檔：不發家聚',!PHONE.sent(G,'sis_fam_inv'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

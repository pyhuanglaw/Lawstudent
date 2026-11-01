// 誰知道祐廷和可昕在交往：朋友聊天傳開、子晴問阿凱（BB_191 9-3、9-7、9-8；AA_218 17-11；KNOWS-SPREAD-1017）——不需要瀏覽器。用法：node tests/knows_spread_unit.js
//   以安→沛珊：大二上第 6 週以後、以安知道以後的下一次公法讀書會週四（散會 21:30）；子晴⇄芷若：知道以後的下一個週五 14～16 兩人都在校園（芷若在英國的學期不算）
//   子晴問阿凱：子晴第 5 階以上、沒和祐廷交往、還不知道、祐廷和可昕交往中 → 第一個上課日 17:00；那晚睡覺時演（字卡 17:00 資工系館）
// 修改前：沒有 spreadTick／zqAskTick／ev_zq_ask_kai（全部失敗）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|VAC|VAC_DATA|ROM|DATE)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/vac_activities.js','src/vac3d.js','src/romance3d.js','src/date3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const k3=STORY.termDay('Y1S1',5,6), w6=STORY.termDay('Y2S1',6,4), y1s2t=STORY.termDay('Y1S2',3,4);
  check('0. 大二上第 6 週週四有公法讀書會、大一下第 3 週週四也有',!!ROM.meetOn({flags:{}},ROM.SPREAD[0],w6)&&!!ACTIVITIES.on(ACTIVITIES.list.find(a=>a.id==='public_law_group'),y1s2t,{flags:{}}));
  const law=(day,h,fl)=>{ fresh(day,h,'dorm',Object.assign({dating_kexin:true},fl||{})); G.stage='law'; };
  // 以安→沛珊
  law(k3,15); ROM.learn(G,'heroine_01','kexin','ev_mid_autumn_bbq');
  G.day=y1s2t; G.hour=22; ROM.spreadTick(G); check('1. 大一下的讀書會（大二上第 6 週以前）：不傳',!ROM.knowsGF(G,'classmate_peishan'));
  G.day=w6; G.hour=21; ROM.spreadTick(G); check('1. 大二上第 6 週週四 21:00（讀書會還沒散）：還不知道',!ROM.knowsGF(G,'classmate_peishan'));
  G.hour=21.5; ROM.spreadTick(G); let K=G.flags.knowsRel.classmate_peishan&&G.flags.knowsRel.classmate_peishan.kexin;
  check('1. 散會 21:30：沛珊知道（told_by:heroine_01，記那一天）',!!K&&K.source==='told_by:heroine_01'&&K.day===w6&&K.h===21.5,JSON.stringify(K));
  check('1. 祐廷不知道她知道（ytKnows 不變）',!ROM.ytKnows(G,'classmate_peishan','kexin'));
  law(k3,15); ROM.learn(G,'heroine_01','kexin','ev_mid_autumn_bbq'); G.day=STORY.termDay('Y3S1',3,2); G.hour=10; ROM.spreadTick(G); K=(G.flags.knowsRel.classmate_peishan||{}).kexin;
  check('1. 存檔很久以後才讀進來：補到正確的那一天（大二上第 6 週週四）',!!K&&K.day===w6,JSON.stringify(K));
  law(k3,15); G.day=STORY.termDay('Y3S1',3,2); ROM.spreadTick(G); check('1. 以安不知道：沛珊不會知道',!ROM.knowsGF(G,'classmate_peishan'));
  law(k3,15); ROM.learn(G,'heroine_01','kexin','ev_mid_autumn_bbq'); G.day=STORY.termDay('Y3S1',3,2); ROM.spreadTick(G); ROM.spreadTick(G);
  check('1. 一層：沛珊不再往下傳（語彤、芷若、子晴不會因此知道）',!ROM.knowsGF(G,'heroine_03')&&!ROM.knowsGF(G,'heroine_02')&&!ROM.knowsGF(G,'heroine_04'));
  // 子晴問阿凱
  const R=SOCIAL.rel.bind(SOCIAL), setZq=(fam,trust,comf,npcRom)=>{ const r=R('heroine_04'); r.fam=fam; r.trust=trust; r.comf=comf; r.npcRom=npcRom; };
  const wed=STORY.termDay('Y1S2',4,4);   /* 週四：子晴在校園的日子（二、四、五 14～17）*/
  law(wed,16.9); setZq(45,30,20,35); check('2. 子晴第 5 階',DATE.stageNum('heroine_04')===5,String(DATE.stageNum('heroine_04')));
  ROM.zqAskTick(G); check('2. 17:00 以前不問',G.flags.ZQ_ASK_KAI_D==null);
  G.hour=17; ROM.zqAskTick(G); K=(G.flags.knowsRel.heroine_04||{}).kexin;
  check('2. 上課日 17:00：子晴知道（told_by:kai）、記 ZQ_ASK_KAI_D、祐廷不知道她知道',G.flags.ZQ_ASK_KAI_D===wed&&!!K&&K.source==='told_by:kai'&&K.h===17&&!ROM.ytKnows(G,'heroine_04','kexin'),JSON.stringify(K));
  const zq=ev('ev_zq_ask_kai'); check('2. 那晚睡覺：演（睡覺觸發）',EVENTS.sleepEvent&&EVENTS.sleepEvent()===zq,String(EVENTS.sleepEvent()&&EVENTS.sleepEvent().id));
  said=[]; await EVENTS.run(zq); let L=lines();
  check('2. 三句照 AA_218 17-11：「欸，你室友……有女朋友嗎？」「有啊，木柵大學的。怎樣？」「沒有啊，問問。」',L.length===3&&L[0].endsWith('欸，你室友……有女朋友嗎？')&&L[1].endsWith('有啊，木柵大學的。怎樣？')&&L[2].endsWith('沒有啊，問問。'),JSON.stringify(L));
  check('2. 祐廷不在場：沒有因此認識子晴、阿凱（participants 空的）',!SOCIAL.has('heroine_04','FIRST_MET')&&!SOCIAL.has('kai','FIRST_MET')&&ev('ev_zq_ask_kai').participants.length===0);
  check('2. 字卡「17:00　資工系館」（不是凌晨三點）',JSON.stringify(zq.sleepCard)===JSON.stringify(['17:00','資工系館']));
  cards=[]; { const s0=G.hour; await STORY._v1.nightEvent(GM); check('2. 演過了：不再演',!EVENTS.sleepEvent()||EVENTS.sleepEvent().id!=='ev_zq_ask_kai'); }
  law(wed,17); setZq(45,30,20,25); ROM.zqAskTick(G); check('2. 第 4 階：不問',G.flags.ZQ_ASK_KAI_D==null);
  law(wed,17,{dating_heroine_04:true}); setZq(45,30,20,35); ROM.zqAskTick(G); check('2. 和子晴交往中：不問',G.flags.ZQ_ASK_KAI_D==null);
  law(wed,17,{dating_kexin:false}); setZq(45,30,20,35); ROM.zqAskTick(G); check('2. 沒和可昕交往：不問',G.flags.ZQ_ASK_KAI_D==null);
  { const wd3=STORY.termDay('Y1S2',4,3); law(wd3,17.5); setZq(45,30,20,35); ROM.zqAskTick(G); check('2. 週三（子晴下午不在校園）：不問',G.flags.ZQ_ASK_KAI_D==null); G.day=wd3+1; G.hour=17; ROM.zqAskTick(G); check('2. 隔天週四 17:00：問',G.flags.ZQ_ASK_KAI_D===wd3+1); }
  { const gone=STORY.dayOfKey('2027-01-07'); law(k3,15); ROM.learn(G,'heroine_01','kexin','ev_mid_autumn_bbq'); G.flags.knowsRel.heroine_01.kexin.day=STORY.dayOfKey('2026-12-20'); G.flags.knowsRel.heroine_01.kexin.h=10;
    G.day=STORY.dayOfKey('2027-08-01'); G.hour=12; ROM.spreadTick(G); check('1. 沛珊聯絡不到的那段（2026-12-18～2027-08-06）：讀書會她不在，不傳',!ROM.knowsGF(G,'classmate_peishan'));
    G.day=STORY.termDay('Y2S2',12,4)+400; G.hour=12; ROM.spreadTick(G); K=(G.flags.knowsRel.classmate_peishan||{}).kexin; check('1. 放榜以後她在台南、不回臺北，不來讀書會（AA_282 第 1 節；原本「回來以後的第一次讀書會照常傳」作廢）：讀書會不傳',!K,JSON.stringify(K)); }
  { const sat=STORY.termDay('Y1S2',4,6); law(sat,18); setZq(45,30,20,35); ROM.zqAskTick(G); check('2. 週六：不問（等上課日）',G.flags.ZQ_ASK_KAI_D==null); }
  { const brk=STORY.dayOfKey('2026-07-15'); law(brk,18); G.weekday=wdOf(brk); setZq(45,30,20,35); ROM.zqAskTick(G); check('2. 暑假：不問',G.flags.ZQ_ASK_KAI_D==null); }
  law(wed,17); setZq(45,30,20,35); ROM.learn(G,'heroine_04','kexin','ev_mid_autumn_bbq'); ROM.zqAskTick(G); check('2. 已經知道：不問',G.flags.ZQ_ASK_KAI_D==null);
  // 子晴⇄芷若
  law(wed,17); setZq(45,30,20,35); ROM.zqAskTick(G);
  const fri=wed+1; check('3. 隔天是週五',wdOf(fri)===5);
  G.day=fri; G.hour=15; ROM.spreadTick(G); check('3. 週五 15:00（還在 14～16 裡面）：芷若還不知道',!ROM.knowsGF(G,'heroine_02'));
  G.hour=16; ROM.spreadTick(G); K=(G.flags.knowsRel.heroine_02||{}).kexin;
  check('3. 週五 16:00：芷若知道（told_by:heroine_04，那一天）——大一下她 15～16 在校園',!!K&&K.source==='told_by:heroine_04'&&K.day===fri,JSON.stringify(K));
  { const w1=STORY.termDay('Y1S1',10,4); law(w1,17); setZq(45,30,20,35); ROM.zqAskTick(G); const f1=w1+1; G.day=f1; G.hour=16.5; ROM.spreadTick(G);
    check('3. 大一上的週五（芷若 13～17 在 Café 打工）：不傳',!ROM.knowsGF(G,'heroine_02')); }
  { const w2=STORY.termDay('Y3S1',4,4); law(w2,17); setZq(45,30,20,35); ROM.learn(G,'heroine_04','kexin','told_by:kai'); G.day=w2+1; G.hour=16.5; ROM.spreadTick(G);
    check('3. 芷若在英國的學期（大三上）：不傳',!ROM.knowsGF(G,'heroine_02')); }
  { law(wed,10); ROM.learn(G,'heroine_02','kexin','yt_told'); G.day=wed+1; G.hour=16.2; ROM.spreadTick(G); K=(G.flags.knowsRel.heroine_04||{}).kexin;
    check('3. 反過來：芷若先知道 → 下一個週五子晴知道（told_by:heroine_02）',!!K&&K.source==='told_by:heroine_02',JSON.stringify(K)); }
  { law(fri,15.5); ROM.learn(G,'heroine_04','kexin','told_by:kai'); G.hour=16.5; ROM.spreadTick(G); check('3. 週五 15:30 才知道：那天 14～16 不算（要下一次）',!ROM.knowsGF(G,'heroine_02')); G.day=fri+7; G.hour=16; ROM.spreadTick(G); check('3. 下一個週五才傳',(G.flags.knowsRel.heroine_02||{}).kexin&&G.flags.knowsRel.heroine_02.kexin.day===fri+7); }
  // 舊存檔（沒有 h）
  { law(k3,15); G.flags.knowsRel={heroine_01:{kexin:{state:'confirmed',source:'legacy',day:w6}}}; G.day=w6; G.hour=22; ROM.spreadTick(G); check('4. 舊存檔沒有 h、那天才知道：當成晚上才知道，那天的讀書會不算',!ROM.knowsGF(G,'classmate_peishan')); }
  // Alison→子晴不傳
  { law(wed,10); ROM.learn(G,'yu','kexin','ev_mid_autumn_bbq'); G.day=wed+30; G.hour=20; ROM.spreadTick(G); check('5. Alison 知道：子晴不會因此知道（BB 定以前不傳）',!ROM.knowsGF(G,'heroine_04')); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

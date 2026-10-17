// BB-B 2026-10-16 這一批（BB_97 4-4、4-7、第 5 節；20c81473、a3b9d427）＋ART-BG-COURT——不需要瀏覽器。
// 檢查：明軒系籃兩處；上榜聚餐 Kevin 一則（永康街／公館的日日定食）；P4b 小組每週五揪（三句輪流）；手機小事（子晴那封信、學姊 M2 之後、沛珊 42 頁）；ntu_court_night 背景有圖。用法：node tests/bb_batch_1016_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/romance3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const ev2=id=>STORY_EVENTS.find(e=>e.id===id), J=x=>JSON.stringify(x);
  const BG=ev2('ev_zhe_game_y2'); const t=J(BG.dialogue);
  check('1. 明軒：送水接「（接住水）哈哈，謝謝部長。」「這瓶 CP 值最高。……免費的。」；賽後兩句（三個選項都有）',/謝謝部長/.test(t)&&/這瓶 CP 值最高/.test(t)&&BG.dialogue.findIndex(l=>l.label==='end')<BG.dialogue.findIndex(l=>/我上場六分鐘，摸到球三次/.test(l.text||''))&&/以 CP 值來說，我今天賺很大/.test(t));
  const m3=D('2027-03-19'), dn=D('2027-03-26'), FAM='g:family_law';
  fresh(m3,20.9,'dorm'); meet('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); run(20.9,21.2);
  check('2. 沒有 FAMILY_DINNER：Kevin 一則「學姊上榜聚餐！下週五七點，公館的日日定食。全家族。」',txt(FAM).slice(-1)[0]==='kevin:學姊上榜聚餐！下週五七點，公館的日日定食。全家族。',J(txt(FAM).slice(-2)));
  PHONE.answer(G,'sis_m3_dinner',0); run(21.2,21.4);
  check('2. 出遊地點「公館的日日定食」',OUT.get(G,'sis_m3_dinner').place==='公館的日日定食');
  fresh(m3,20.9,'dorm'); meet('heroine_05'); SOCIAL.remember('heroine_05','FAMILY_DINNER',''); PHONE.join(G,'family_law','法律系直屬家族'); run(20.9,21.2);
  check('2. 有 FAMILY_DINNER：永康街那家咖哩',txt(FAM).slice(-1)[0]==='kevin:學姊上榜聚餐！下週五七點，永康街那家咖哩。全家族。');
  const f2=termDay('Y2S2',2,5); fresh(f2,20.9,'dorm'); meet('classmate_peishan'); SOCIAL.remember('classmate_peishan','MIRROR_PEISHAN',''); G.flags.dating_kexin=true; ROM.learn(G,'classmate_peishan','kexin','yt_told'); run(20.9,21.3);   /* 她知道（BB_191 9-4 #4）*/
  check('3. P4b 交往中、她知道＝小組；第 2 週週五 21:00 第一句',PHONE.inGroup(G,'ps_study')&&txt('g:ps_study').includes('classmate_peishan:明天總圖，老位子旁邊的長桌。想來的就來，不用回。'),J(txt('g:ps_study')));
  G.day=f2+7; G.weekday=5; run(20.9,21.2); G.day=f2+14; run(20.9,21.2); G.day=f2+21; run(20.9,21.2);
  const ps=txt('g:ps_study').filter(x=>x.startsWith('classmate_peishan:'));
  check('3. 每週五換一句、三句輪流',ps[1]==='classmate_peishan:這週末我在總圖。進度：債總第三章。……你們不用回，來就好。'&&ps[2]==='classmate_peishan:週末總圖。阿哲說要補債各，我先幫他占位。'&&ps[3]===ps[0],J(ps));
  const src=require('fs').readFileSync(require('path').join(ROOT,'src/story3d.js'),'utf8');
  check('4. 手機小事：學姊 M2 之後「今天讀了四章。一件事：腰很痛。」；沛珊 42 頁（你呢／你們呢）；子晴那封信先不改（AB-62 暫停）',/'我回信了'/.test(src)&&/今天讀了四章。一件事：腰很痛。/.test(src)&&/今天念了 42 頁。你們呢？'\}\]:\[P1\('classmate_peishan','今天念了 42 頁。你呢？'\)\]/.test(src));
  const out=require('fs').readFileSync(require('path').join(ROOT,'src/outings3d.js'),'utf8');
  check('5. ntu_court_night 有圖、檔案在',/ntu_court_night=\{label:'台大・新體育館旁的籃球場（晚上）',image:'assets\/bg\/ntu_court_night\.webp'\}/.test(out)&&require('fs').existsSync(require('path').join(ROOT,'assets/bg/ntu_court_night.webp')));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

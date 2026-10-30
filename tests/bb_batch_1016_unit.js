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
  check('1. 明軒：送水接「（接住水）謝啦。」（AA_374 第 16 項，原本「哈哈，謝謝部長。」）「這瓶 CP 值最高。……免費的。」；賽後一句「我上場六分鐘，摸到球三次。……賺很大。」（三個選項都有；AA_313 5-1 第 14 點：一場只用一次「CP 值」）',/（接住水）謝啦。/.test(t)&&!/謝謝部長/.test(t)&&/這瓶 CP 值最高/.test(t)&&BG.dialogue.findIndex(l=>l.label==='end')<BG.dialogue.findIndex(l=>/我上場六分鐘，摸到球三次。……賺很大。/.test(l.text||''))&&!/以 CP 值來說/.test(t));
  const m3=D('2027-03-19'), dn=D('2027-03-26'), FAM='g:family_law';
  // 2026-10-17 BB_205 第 4 節：M2、M3、上榜聚餐照新年級是祐廷大一下的事，大二不播（STORY.SIS_Y2_EXAM=false；大一下的版本等 AA_218 17-12）
  fresh(m3,20.9,'dorm'); meet('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); run(20.9,21.2); PHONE.answer(G,'sis_m3_dinner',0); run(21.2,21.4);
  check('2. 大二下 3/19 不發放榜、Kevin 不揪上榜聚餐、不排出遊',!PHONE.sent(G,'sis_m3')&&!PHONE.sent(G,'sis_m3_dinner_inv')&&!(typeof OUT!=='undefined'&&OUT.get(G,'sis_m3_dinner'))&&STORY.SIS_Y2_EXAM===false,J(txt(FAM).slice(-2)));
  fresh(D('2027-01-20'),20.9,'dorm'); meet('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); run(20.9,21.2);
  check('2. 大二寒假 1/20 不發 M2',!PHONE.sent(G,'sis_m2'));
  const f2=termDay('Y2S2',2,5); fresh(f2,20.9,'dorm'); meet('classmate_peishan'); SOCIAL.remember('classmate_peishan','MIRROR_PEISHAN',''); G.flags.dating_kexin=true; ROM.learn(G,'classmate_peishan','kexin','yt_told'); run(20.9,21.3);   /* 她知道（BB_191 9-4 #4）*/
  check('3. P4b 和「陪重考生念書」小組：大二下是沛珊的消失期（BB_205 第 3 節），交往中、她知道也不發、不開小組',!PHONE.inGroup(G,'ps_study')&&!PHONE.sent(G,'ps_p4b'),J(txt('g:ps_study')));
  G.day=f2+7; G.weekday=5; run(20.9,21.2); G.day=f2+14; run(20.9,21.2); G.day=f2+21; run(20.9,21.2);
  const ps=txt('g:ps_study').filter(x=>x.startsWith('classmate_peishan:'));
  check('3. 之後的週五也沒有小組訊息',!ps.length,J(ps));
  const src=require('fs').readFileSync(require('path').join(ROOT,'src/story3d.js'),'utf8');
  check('4. 手機小事：學姊 M2 之後那則大二不發（BB_205 第 4 節）；沛珊 42 頁 AA_328 刪掉；子晴那封信（AA_328：「實驗室那封信 我回了」）',/'實驗室那封信 我回了'/.test(src)&&!/今天讀了四章。一件事：腰很痛。/.test(src)&&!/y2_ps_42/.test(src));
  const out=require('fs').readFileSync(require('path').join(ROOT,'src/outings3d.js'),'utf8');
  check('5. ntu_court_night 有圖、檔案在',/ntu_court_night=\{label:'首都帝大・新體育館旁的籃球場（晚上）',image:'assets\/bg\/ntu_court_night\.webp'\}/.test(out)&&require('fs').existsSync(require('path').join(ROOT,'assets/bg/ntu_court_night.webp')));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

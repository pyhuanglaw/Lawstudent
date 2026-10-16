// 沛珊 P4b 換你陪我念（BB_97 4-4；AA_177 第 8 節②；任務 V3-B16）——不需要瀏覽器。
// 檢查：第 2 週週五 21:00 私訊兩版（知道重考／不知道）、選項 3 或 4 個；前置 MIRROR_PEISHAN 或朋友；交往中（別人）＝小組「陪重考生念書」＋阿哲；總圖見面的便條（你呢／你們呢）；4/17 12:30「總圖滿了」→ Café 13～15 點 ev_peishan_cafe_42（CG）；小組版沒有。用法：node tests/v3_p4b_unit.js
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
  const ps='classmate_peishan', PT='p:classmate_peishan';
  const f=termDay('Y2S2',2,5), c=D('2027-04-17');
  check('0. 第 2 週週五＝3/5；4/17 是第 8 週週六',D('2027-03-05')===f&&termDay('Y2S2',8,6)===c);
  const base=(day,h,o)=>{ o=o||{}; fresh(day,h,'dorm',o.flags); meet(ps); if(o.mirror) SOCIAL.remember(ps,'MIRROR_PEISHAN',''); if(o.friend) R(ps,...LV.FRI); else R(ps,...LV.FAM); if(o.dating) G.flags['dating_'+o.dating]=true; };
  base(f,20.5,{mirror:true}); run(20.5,20.95);
  check('1. 20:57 還沒有',!PHONE.sent(G,'ps_p4b'));
  run(21,21.2); let t=txt(PT), m=TH(PT).find(x=>x.ask&&x.ask.id==='ps_p4b');
  check('1. MIRROR_PEISHAN：「欸，問你一個重考的人才能回答的問題。」「你重考那一年，怎麼撐過來的？」；四個選項',t.join('｜')==='classmate_peishan:欸，問你一個重考的人才能回答的問題。｜classmate_peishan:你重考那一年，怎麼撐過來的？'&&!!m&&m.ask.opts.length===4&&m.ask.opts[3].t==='那時候有人陪我一起準備。',JSON.stringify(t));
  PHONE.answer(G,'ps_p4b',3);
  check('1. 第四個 →「……好。那我也找一個人。」',txt(PT).slice(-1)[0]==='classmate_peishan:……好。那我也找一個人。'&&G.flags.PS_P4B==='someone');
  base(f,20.5,{friend:true}); run(20.5,21.2); t=txt(PT); m=TH(PT).find(x=>x.ask&&x.ask.id==='ps_p4b');
  check('2. 朋友、不知道重考過：「欸，問你一個問題。」「你有沒有很想放棄、可是撐過來的事？」；三個選項',t.join('｜')==='classmate_peishan:欸，問你一個問題。｜classmate_peishan:你有沒有很想放棄、可是撐過來的事？'&&m.ask.opts.length===3,JSON.stringify(t));
  for(const [k,want] of [[0,'……好。我先試這個。'],[1,'我知道要去哪裡。那我應該撐得住。'],[2,'……這個答案好誠實。我收下了。']]){ base(f,20.9,{friend:true}); run(20.9,21.2); PHONE.answer(G,'ps_p4b',k); check('2. 選項 '+(k+1)+' →「'+want+'」',txt(PT).slice(-1)[0]==='classmate_peishan:'+want); }
  base(f,20.9,{friend:true,flags:{ECON_PAST_SHARED:'full'}}); run(20.9,21.2); m=TH(PT).find(x=>x.ask&&x.ask.id==='ps_p4b');
  check('2. 朋友＋ECON_PAST_SHARED full：知道的版本、四個選項',m.ask.opts.length===4&&TH(PT)[0].text==='欸，問你一個重考的人才能回答的問題。');
  base(f,20.9,{}); run(20.9,21.5);
  check('3. 有點熟、沒有 MIRROR_PEISHAN：沒有',!PHONE.sent(G,'ps_p4b'));
  base(f,20.9,{mirror:true,dating:'kexin'}); run(20.9,21.6);
  check('4. 交往中（別人）：私訊照樣、加入小組「陪重考生念書」、阿哲「我來補債各。」',PHONE.sent(G,'ps_p4b')&&PHONE.inGroup(G,'ps_study')&&txt('g:ps_study').slice(-1)[0]==='zhe:我來補債各。'&&G.flags.PS_P4B_GROUP===true);
  base(f,20.9,{mirror:true,dating:ps}); run(20.9,21.6);
  check('4. 和沛珊本人交往：兩個人的版本（沒有小組）',PHONE.sent(G,'ps_p4b')&&!PHONE.inGroup(G,'ps_study'));
  // 便條
  const AM=INVITE_DATA.people[ps].afterMeet; const sat=termDay('Y2S2',3,6);
  base(f,20.9,{mirror:true}); run(20.9,21.2); G.day=sat;
  check('5. 總圖見面之後：「（她遞過來一張便條：「今天念了 42 頁。你呢？」）」；Café 沒有',JSON.stringify(AM(G,{day:sat},'library'))==='["（她遞過來一張便條：「今天念了 42 頁。你呢？」）"]'&&AM(G,{day:sat},'cafe')==null);
  base(f,20.9,{mirror:true,dating:'kexin'}); run(20.9,21.6); G.day=sat;
  check('5. 小組版：「你們呢？」',/你們呢/.test(AM(G,{day:sat},'library')[0]));
  base(sat,10,{mirror:true});
  check('5. P4b 還沒發生：沒有便條',AM(G,{day:sat},'library')==null);
  // Café 那一次
  base(f,20.9,{mirror:true}); run(20.9,21.2); G.day=c; G.weekday=6; run(12,12.45);
  check('6. 4/17 12:27 還沒有',!PHONE.sent(G,'ps_p4b_cafe'));
  run(12.5,12.7);
  check('6. 12:30「總圖滿了。兩點半，靠窗。」',txt(PT).slice(-1)[0]==='classmate_peishan:總圖滿了。兩點半，靠窗。');
  const EV=ev('ev_peishan_cafe_42'); G.zone='cafe'; G.hour=13.5;
  check('6. 13:30 在 Café：會演；15:30 不演；4/24 不演',EVENTS.check(EV)&&(()=>{ G.hour=15.5; const a=EVENTS.check(EV); G.hour=13.5; G.day=c+7; const b=EVENTS.check(EV); G.day=c; return !a&&!b; })());
  const cg=[]; const c0=ADV.cg; ADV.cg=id=>{ cg.push(id); }; said=[]; try{ await EVENTS.run(EV); } finally { ADV.cg=c0; }
  check('6. CG cg_cafe_42pages_peishan＋便條那一句；CG 登記、圖檔在',cg.includes('cg_cafe_42pages_peishan')&&lines().slice(-1)[0]==='（她把便條推過來：「今天念了 42 頁。你呢？」）'&&/cg_cafe_42pages_peishan:\{file:'assets\/cg\/classmate_peishan\/cg_cafe_42pages\.webp'/.test(require('fs').readFileSync(require('path').join(ROOT,'src/adv3d.js'),'utf8'))&&require('fs').existsSync(require('path').join(ROOT,'assets/cg/classmate_peishan/cg_cafe_42pages.webp')));
  base(f,20.9,{mirror:true,dating:'kexin'}); run(20.9,21.6); G.day=c; G.weekday=6; run(12,13);
  check('6. 小組版：沒有「總圖滿了」、Café 不演',!PHONE.sent(G,'ps_p4b_cafe')&&(()=>{ G.zone='cafe'; G.hour=13.5; return !EVENTS.check(EV); })());
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

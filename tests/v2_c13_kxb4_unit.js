// V2-C13 交往中的可昕：大一下第 11 週週四 22:00「演講怎樣？」（AA_172 第 5 節；BB-B 4087b3b7）——第一個回覆照 B4 聽完／前半／沒去、三個回應、回覆開到隔天 18:00、沒交往沒有——不需要瀏覽器。
// 修改前沒有這兩則（全部失敗）。用法：node tests/v2_c13_kxb4_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  const thu=termDay('Y1S2',11,4); check('0. 大一下第 11 週週四找得到',!!thu);
  const setB4=st=>{ if(!st) return; ACTIVITIES.rec(G).att['B4@'+thu]=st==='full'?{h:19,end:'full'}:{h:19,end:'left',lh:19.5}; };
  const go=(st,dating)=>{ fresh(thu,21.8,'dorm',{introDone:true,dating_kexin:dating!==false}); G.stage='law'; setB4(st); run(21.8,21.95); const before=!PHONE.sent(G,'kx_b4_ask'); run(22,22.1); return {before,m:(G.msgs||[]).find(m=>m.th==='p:kexin'&&m.ask&&m.text==='我今天在系上被教授點名了，好丟臉。')}; };
  let r=go('full'); const T=TH('p:kexin').map(m=>m.text);
  check('1. 22:00 以前沒有；22:00「演講怎樣？」「我今天在系上被教授點名了，好丟臉。」',r.before&&T.includes('演講怎樣？')&&T.includes('我今天在系上被教授點名了，好丟臉。'),JSON.stringify(T));
  check('1. 回覆開到隔天 18:00',r.m&&r.m.ask.until===(thu+1)*24+18);
  const o=r.m.ask.opts.map(x=>x.t); check('2. 聽完 B4：第一個回覆＝「講者最後問：『被限制的那個人，最後可以去哪裡？』」；另外兩個',o[0]==='講者最後問：『被限制的那個人，最後可以去哪裡？』'&&o[1]==='被點名？妳答出來了嗎？'&&o[2]==='先說妳的。演講的事等一下說。',JSON.stringify(o));
  PHONE.answer(G,r.m.ask.id,0); let T2=TH('p:kexin').map(m=>m.text); check('2. →「這題我要偷走。」（AA_313 第 2 節第 27 列；AA_525 3-11 拿掉「下次出給你。」）',T2[T2.length-1]==='這題我要偷走。');
  r=go('left'); check('3. 只聽前半：「我只聽了前半。」→「前半也算。後半我幫你編一個結局。」',r.m.ask.opts[0].t==='我只聽了前半。'&&(PHONE.answer(G,r.m.ask.id,0),TH('p:kexin').map(m=>m.text).pop()==='前半也算。後半我幫你編一個結局。'));
  r=go(null); check('4. 沒去：「我沒去。」→「沒關係。我今天也很想沒去——我被點名了。」',r.m.ask.opts[0].t==='我沒去。'&&(PHONE.answer(G,r.m.ask.id,0),TH('p:kexin').map(m=>m.text).pop()==='沒關係。我今天也很想沒去——我被點名了。'));
  r=go('full'); PHONE.answer(G,r.m.ask.id,2); T2=TH('p:kexin').map(m=>m.text);
  check('5. 「先說妳的。」→「你先問我的喔。……好，那我先說。」＋被點名的三句（十七歲買機車、騙店員成年、卡住了）',T2.slice(-4).join('|')==='你先問我的喔。……好，那我先說。|答出來一半。民總老師問：一個十七歲的人自己去買機車，契約算不算數？|我說要看爸媽同不同意。老師說對，又問：那如果他騙店員說自己成年了呢？|……我就卡住了。全班都在看我。下次我要先查好再去上課。',JSON.stringify(T2.slice(-4)));
  r=go('full'); PHONE.answer(G,r.m.ask.id,1); T2=TH('p:kexin').map(m=>m.text); check('5. 「被點名？妳答出來了嗎？」→ 三句',T2.slice(-3)[0].startsWith('答出來一半。')&&T2[T2.length-1].startsWith('……我就卡住了。'));
  r=go('full',false); check('6. 沒交往：沒有這兩則',!PHONE.sent(G,'kx_b4_ask'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

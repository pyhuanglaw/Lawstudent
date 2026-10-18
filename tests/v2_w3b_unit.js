// 交接包 v2 W3b 不讓步的晚上（BB_96 2-4；文章 BB 137bf31）——不需要瀏覽器。修改前沒有 W3b（第 1 項失敗）。
// 檢查：ev_grad_debate 之後第 14 天 20:30 在讀書會群組（第一次的開頭依 W3_STANCE）；三個論點、三個反例；選了以後她的回應、「哪裡。」、折起來的長回覆、「那我換一個反例。」「……重點是，你的論點比上週好。」、記 ARGUED_GOOD；
//   三篇輪流；第四次「這篇你讀過了。」選第二點＝「對。」；不在讀書會群組＝沒有；大三以後沒有。
// 用法：node tests/v2_w3b_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const D0=termDay('Y1S2',6,3);
  const setup=(day,hour,stance)=>{ fresh(day,hour,'dorm',stance?{W3_STANCE:stance}:{}); G.events.last.ev_grad_debate=D0; G.events.done.ev_grad_debate=1; PHONE.join(G,'lawclub_study','法服讀書會'); };
  setup(D0+14,20,'no'); run(20,20.4); check('1. 第 14 天 20:30 以前沒有',!G.msgs.some(m=>m.tag==='w3b_0'));
  run(20.4,21,0.05); const T=txt('p:heroine_05');
  check('1. 20:30：開頭依 W3_STANCE（no）的那一句「取代」「這篇。三個論點。」（BB_161 ⑧）→ 校刊投書〈總圖應該全面禁止占位〉→ 一二三',T.slice(0,5).join('|')==='heroine_05:這篇作者沒跳步。你找找看他哪裡偷懶。|heroine_05:📄 校刊投書〈總圖應該全面禁止占位〉|heroine_05:一，座位是公共的，占著不用，別人就用不到。|heroine_05:二，規定要簡單：離開超過三十分鐘就清位，沒有例外。|heroine_05:三，禁止占位，考試週更多人用得到總圖。',JSON.stringify(T));
  const q=TH('p:heroine_05').find(m=>m.ask); check('2. 三個反例可以回',!!q&&q.ask.opts.length===3&&q.ask.opts[2].t==='三十分鐘，對吃飯的人太短，對午睡的人太長。');
  PHONE.answer(G,q.ask.id,2); const T2=txt('p:heroine_05').slice(5);
  check('2. 換角度 → 她「……這個角度我沒想過。但你漏了一步。」→「哪裡。」→ 長回覆 →「那我換一個反例。」→「……重點是，你的論點比上週好。」',T2.join('|')==='player:第二點有反例。三十分鐘，對吃飯的人太短，對午睡的人太長。|heroine_05:……這個角度我沒想過。但你漏了一步。|player:哪裡。|heroine_05:第二點的問題不在三十分鐘，在「沒有例外」。|player:那我換一個反例。|heroine_05:……重點是，你的論點比上週好。',JSON.stringify(T2));
  const lg=TH('p:heroine_05').find(m=>m.fold); check('2. 長回覆折起來（7 行，最後一行「你要反駁，就打「沒有例外」這四個字。」）',!!lg&&lg.fold.length===7&&lg.fold[6]==='你要反駁，就打「沒有例外」這四個字。');
  check('2. 記 ARGUED_GOOD',SOCIAL.has('heroine_05','ARGUED_GOOD'));
  // 第二、三、四次（AA_284 1-5：上一篇沒回就不發下一篇）
  const ansLast=()=>{ const qq=TH('p:heroine_05').filter(m=>m.ask&&m.ans==null).pop(); if(qq) PHONE.answer(G,qq.ask.id,0); };
  G.day=D0+28; run(20,21); const t2=txt('p:heroine_05').filter(t=>t.includes('校刊投書')); check('3. 第 28 天：第二篇〈期中考應該全部改成開書考〉，沒有第一次的開頭',t2[1]==='heroine_05:📄 校刊投書〈期中考應該全部改成開書考〉'&&txt('p:heroine_05').filter(t=>t.includes('偷懶')).length===1,JSON.stringify(t2));
  G.day=D0+42; run(20,21); check('3. 第二篇沒回：第 42 天第三篇不發（AA_284 1-5）',!txt('p:heroine_05').some(t=>t.includes('〈通識課應該取消點名〉'))&&(G.flags.W3B_N|0)===2);
  ansLast(); G.day=D0+56; run(20,21); ansLast(); G.day=D0+70; run(20,21); const t4=txt('p:heroine_05');
  check('3. 回了以後下一次照發：第三篇〈通識課應該取消點名〉、第四次回到第一篇＋「這篇你讀過了。這次換你先說三個論點。」',t4.some(t=>t.includes('〈通識課應該取消點名〉'))&&t4.slice(-2).join('|')==='heroine_05:📄 校刊投書〈總圖應該全面禁止占位〉|heroine_05:這篇你讀過了。這次換你先說三個論點。',JSON.stringify(t4.slice(-3)));
  const q4=TH('p:heroine_05').filter(m=>m.ask).pop(); PHONE.answer(G,q4.ask.id,1); check('3. 選「第二點有問題。」→「對。」',txt('p:heroine_05').slice(-1)[0]==='heroine_05:對。');
  check('3b. 私訊、不在讀書會群組發；沒有柏翰、沛珊的回話（AA_284 1-5）',!TH('g:lawclub_study').length&&!(G.msgs||[]).some(m=>/^w3b_/.test(m.tag||'')&&(m.from==='classmate_bohan'||m.from==='classmate_peishan')));
  // 沒演過不平／大三
  fresh(D0+14,20,'dorm',{}); run(20,21); check('4. 沒演過 ev_grad_debate：沒有',!G.msgs.some(m=>/^w3b_/.test(m.tag||'')));
  const y3=termDay('Y3S1',3,3); setup(y3,20); G.events.last.ev_grad_debate=y3-14; run(20,21); check('4. 大三上：沒有（只到大二）',!G.msgs.some(m=>/^w3b_/.test(m.tag||'')));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

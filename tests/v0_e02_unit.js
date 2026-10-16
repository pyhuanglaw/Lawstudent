// v0 ★E02 開學典禮與迎新（BB_104 第 8-1 節；AA_154 第 95 行）——不需要瀏覽器。
// 檢查：只在經濟系那一年、2024-09-02（一）12:15～17:00 自動（上午是經濟學原理；時段暫定、問 AA-B）；法律系、別天不演；兩個場景（大講堂、系上的教室）；BB_104 原文；三個選項各記 E02_WORD 和可昕的回答；認識可昕、品妤；演完 15:00、在社科院門口。
// 修改前：沒有 ev_y0_e02（第 1 項就失敗）。用法：node tests/v0_e02_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
let legalAsked=0, toasts=[]; global.LEGAL={ask:async()=>{ legalAsked++; },apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], titles=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ titles.push(a+(b?' '+b:'')); },enter:async(z)=>{ G.zone=z; },
  advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; titles=[]; legalAsked=0; toasts=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const lines=()=>said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
(async()=>{
  const e=ev('ev_y0_e02'); check('1. 事件存在：ev_y0_e02（stage econ、自動、Y0S1 第 1 週週一、12:15～17:00（上午是經濟學原理）、一次）',!!e&&e.stage==='econ'&&e.trigger==='auto'&&e.once&&JSON.stringify(e.term)==='["Y0S1"]');
  if(!e){ console.log('FAILED '+fails); process.exit(1); }
  const D=STORY.dayOfKey('2024-09-02'); check('1. 2024-09-02 是週一、Y0S1 第 1 週',CALENDAR.dateOf(D).wd===1&&CALENDAR.termOf(D).id==='Y0S1'&&CALENDAR.termOf(D).week===1);
  const can=(day,h,stage)=>{ fresh(day,h,'dorm'); G.stage=stage||'econ'; return EVENTS.check(e); };
  check('2. 經濟系 9/2 13:00 會演；上課時間 10:00、17:30、9/3、法律系同一天都不會',can(D,13)&&!can(D,10)&&!can(D,17.5)&&!can(D+1,13)&&!can(D,13,'law'));
  const BB=['規則很簡單。用一個經濟學名詞介紹自己。不會的就亂講。','我是……「供給」！我很多！什麼都很多！','我是「機會成本」。跟我說話，你就失去了做別的事的機會。','我是「沉沒成本」。我已經講了三分鐘，所以我不能停。','唐睿，你才講了五秒。','我是「邊際效用遞減」。','第一次見面最好玩，之後越來越普通。','……開玩笑的。我會越來越好玩。'];
  for(const [pick,word,reply] of [['外部性','externality','那我們要跟你收費。'],['均衡','equilibrium','均衡？你看起來很不穩定。'],['看不見的手','invisible_hand','所以你等一下拿零食，我們都看不到？']]){
    fresh(D,12.4,'dorm'); G.stage='econ'; picks=[pick]; await EVENTS.run(e); const L=lines();
    check('3. 選「'+pick+'」：BB_104 原文、可昕回「'+reply+'」、E02_WORD＝'+word+'、時間到 15:00、到社科院門口',JSON.stringify(L.slice(0,8))===JSON.stringify(BB)&&L[8]===reply&&L.length===9&&G.flags.E02_WORD===word&&Math.abs(G.hour-15)<1e-6&&G.zone==='campus',JSON.stringify([L.slice(-2),G.flags.E02_WORD,G.hour,G.zone]));
    check('3. 認識可昕、品妤（FIRST_MET）',SOCIAL.has('kexin','FIRST_MET')&&SOCIAL.has('econ_pinyu','FIRST_MET')); }
  { const sc=e.dialogue.filter(l=>l.scene!==undefined); check('4. 兩個場景：社科院大講堂（soc_hall，開學典禮）→ 系上的教室（soc_classroom，迎新）；兩張背景都有圖',sc.length===2&&sc[0].bg==='soc_hall'&&sc[1].bg==='soc_classroom'&&fs.existsSync(path.join(ROOT,'assets/bg/soc_hall.webp'))&&fs.existsSync(path.join(ROOT,'assets/bg/soc_classroom.webp'))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

// v0 ★E02 新生座談與迎新（BB_104 第 8-1 節；AA_154 第 95 行）——不需要瀏覽器。
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
  const BB=['系上的新生座談在社科院的大講堂。你坐在後面，旁邊的人在滑手機。','座談結束。門口有個學長舉著牌子：『經濟系新生，這邊。』','我是宋家豪，大二，今天帶你們這一組。','先輪一圈，講名字、從哪裡來就好。','邱韋綸，台中來的。我到現在還搞不清楚哪一棟是哪一棟。','等一下帶你們走一圈。……社科圖三樓靠窗那張桌子，學長姊說坐過的都考上研究所。','曾品妤。','（她講完就坐下了。下一個是你。）','{name}，臺北。','（一個一個輪下去。大部分的人講完名字和縣市就坐下。）','杜可昕。我是「邊際效用遞減」，早上經原老師講到的。','第一次見面最好玩，之後越來越普通。……不過我會越來越好玩啦。','（有幾個人笑了。）','好，差不多了。零食在前面，自己拿。公館要吃什麼，之後問我，我有一本筆記。','（學長在前面發零食。可昕拿了一包，坐到你旁邊。）','你剛剛只講名字喔？','不然你也挑一個。'];   /* BB_179 段 A E02 重寫（AA_203 2-1；AA_200 7-2、7-3；建議旁白全部採用）*/
  const TAIL=['（走過來）欸，{name}，你是 412 的吧？我早上去看過，床架上貼的名字有你。','我也是！我晚上才搬進去。','（從後面探頭）412？那我們同一間。我也是晚上。','要走一圈的，跟我來！','（可昕站起來，跟著大家往門口走。）'];
  for(const [pick,word,reply,extra] of [['外部性','externality','外部性還沒教欸。','（她翻開課本，在目錄找了一下。）'],['均衡','equilibrium','好，那你是均衡。','（她把零食撕開，分了你一半。）'],['看不見的手','invisible_hand','亞當斯密那個。這個我高中有聽過。',null]]){
    fresh(D,12.4,'dorm'); G.stage='econ'; picks=[pick]; await EVENTS.run(e); const L=lines(), nm=a=>a.map(t=>t.replace(/\{name\}/g,'祐廷'));
    check('3. 選「'+pick+'」：BB_179 段 A 新順序（只講名字和從哪裡來、祐廷「{name}，臺北。」、只有可昕用名詞、散場旁白）、可昕回「'+reply+'」、E02_WORD＝'+word+'、時間到 15:00、到社科院門口',JSON.stringify(L.slice(0,BB.length))===JSON.stringify(nm(BB))&&L[BB.length]===reply&&(extra?L[BB.length+1]===extra:true)&&JSON.stringify(L.slice(-TAIL.length))===JSON.stringify(nm(TAIL))&&L.length===BB.length+1+(extra?1:0)+TAIL.length&&G.flags.E02_WORD===word&&Math.abs(G.hour-15)<1e-6&&G.zone==='campus',JSON.stringify([L.slice(-2),G.flags.E02_WORD,G.hour,G.zone]));
    check('3. 認識可昕、品妤（FIRST_MET）',SOCIAL.has('kexin','FIRST_MET')&&SOCIAL.has('econ_pinyu','FIRST_MET')); }
  { const sc=e.dialogue.filter(l=>l.scene!==undefined); check('4. 兩個場景：社科院大講堂（soc_hall，新生座談）→ 系上的教室（soc_classroom，迎新）；兩張背景都有圖',sc.length===2&&sc[0].bg==='soc_hall'&&sc[1].bg==='soc_classroom'&&fs.existsSync(path.join(ROOT,'assets/bg/soc_hall.webp'))&&fs.existsSync(path.join(ROOT,'assets/bg/soc_classroom.webp'))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

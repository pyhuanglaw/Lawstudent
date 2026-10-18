// v0 C1 即興劇社的熱身（BB_110 第 3 節；AA_154 第 113 行）：第 6 週可昕邀、IMPROV_LINE、沒去版——不需要瀏覽器。用法：node tests/v0_c1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], picks=[], rels=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,endCinematic(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(id,d){ rels.push([id,d]); },walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags,stage)=>{ G={v:3,day,hour,zone,stage:stage||'econ',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; picks=[]; rels=[]; };
const run=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const at=(day,hour)=>{ G.day=day; G.hour=hour; G.weekday=wdOf(day); run(); };
const TH=th=>PHONE.thread(G,th).map(m=>m.text);
(async()=>{
  const K=k=>STORY.dayOfKey(k); const c1=STORY_EVENTS.find(e=>e.id==='ev_y0_c1');
  check('0. ev_y0_c1（出遊）在',!!c1&&c1.trigger==='outing'); if(!c1){ console.log('FAILED '+fails); process.exit(1); }
  fresh(K('2024-10-04'),16,'campus'); run(); check('1. 第 5 週沒有邀請',!PHONE.sent(G,'y0_c1_ask'));
  const snap0=()=>{ fresh(K('2024-10-07'),16,'campus'); run(); };
  snap0(); at(K('2024-10-07'),17.6); const m=PHONE.thread(G,'p:kexin').find(x=>x.text==='劇社今天練習，可以帶一個人。你當那個人。');
  check('1. 10/7（一）17:30 可昕私訊「劇社今天練習，可以帶一個人。你當那個人。」、好／今天不行',!!m&&m.ask.opts.map(o=>o.t).join('/')==='好。/今天不行。');
  const snap=JSON.stringify(G);
  G.flags.C1_GO='yes'; at(K('2024-10-07'),17.7); const q=OUT.get(G,'y0_c1'); check('2. 回好：排出遊 19:00 博雅',!!q&&q.h===19&&q.ev==='ev_y0_c1');
  const saves=[]; GM.autosave=()=>saves.push(JSON.stringify(G));
  picks=['欠我錢']; said=[]; G.hour=18.7; await OUT.go(GM,q); const L=said.map(x=>x.t);
  { const s0=saves[0]&&JSON.parse(saves[0]), s1=saves[1]&&JSON.parse(saves[1]); const q0=s0&&s0.outings.find(x=>x.id==='y0_c1'), q1=s1&&s1.outings.find(x=>x.id==='y0_c1');
    check('5. 出遊存檔（使用者 2026-10-16：去政大跳回標題、要一直重來）：出發前存一次（還沒演）、到了再存一次（到的時間、還沒演）、演完標 done',saves.length>=3&&q0&&q0.state==='planned'&&Math.abs(s0.hour-18.7)<1e-6&&q1&&q1.state==='planned'&&q1.arrived===true&&Math.abs(s1.hour-19)<1e-6&&OUT.get(G,'y0_c1').state==='done'&&!OUT.get(G,'y0_c1').arrived,JSON.stringify({n:saves.length,q0:q0&&q0.state,h0:s0&&s0.hour,q1:q1&&[q1.state,q1.arrived],h1:s1&&s1.hour}));
    const keep=G; G=s1; SOCIAL.bind(G); EVENTS.bind(GM); const qd=OUT.due(G); check('5. 讀「到了」那一份存檔：還是這一趟（可以重新演），不再加一次車程',!!qd&&qd.id==='y0_c1',JSON.stringify(qd&&qd.id));
    if(qd){ saves.length=0; said=[]; picks=['欠我錢']; await OUT.go(GM,qd); const r0=saves[0]&&JSON.parse(saves[0]); check('5. 重新演：時間從到的時間開始（19:00），演完 done',r0&&Math.abs(r0.hour-19)<1e-6&&OUT.get(G,'y0_c1').state==='done',r0&&String(r0.hour)); }
    G=keep; SOCIAL.bind(G); EVENTS.bind(GM); GM.autosave=()=>{}; }
  { let depth=0, maxD=0, minDuring=99, inEv=false; const sb=GM.sceneBegin, se=GM.sceneEnd; GM.sceneBegin=()=>{ depth++; maxD=Math.max(maxD,depth); }; GM.sceneEnd=()=>{ depth--; };
    const advBegins=[]; const ab=ADV.begin; ADV.begin=o=>{ advBegins.push(o||{}); }; const oldRun=EVENTS.run; EVENTS.run=async ev=>{ minDuring=Math.min(minDuring,depth); return oldRun(ev); }; const q2=OUT.get(G,'y0_c1'); q2.state='planned'; picks=['欠我錢']; said=[]; await OUT.go(GM,q2);
    EVENTS.run=oldRun; GM.sceneBegin=sb; GM.sceneEnd=se; ADV.begin=ab;
    check('7. 演完以後和可昕的幾句：重新打開 2D 畫面（可昕在右邊），不露出原本的 3D（使用者 2026-10-16：她人不在這、對話還在）',advBegins.length>=2&&advBegins.slice(1).some(o=>o.right&&o.right.charId==='kexin'),JSON.stringify(advBegins));
    check('6. 整趟出遊包在一段劇情裡（演的時候、回程轉場都不插校園的自動事件；使用者 2026-10-16：和可昕走完「回到台大」就卡住）',minDuring>=1&&depth===0,JSON.stringify({minDuring,depth,maxD})); }
  check('2. 原文：社長的規則、唐睿「我是一隻迷路的企鵝。」、祐廷「對，而且……」',L[0]==='熱身。規則只有一個：對方說什麼，你都說「對，而且——」。'&&L[1]==='（對祐廷）我是一隻迷路的企鵝。'&&L[2]==='對，而且……',JSON.stringify(L.slice(0,3)));
  check('2. 「而且……你欠我錢。」→ 唐睿「……等一下，我欠你多少？」全場笑；IMPROV_LINE 記這一句（BB_179 段 B #24）',L.includes('對，而且——（停住）——等一下，我欠你多少？')&&L.includes('全場笑。')&&G.flags.IMPROV_LINE==='而且……你欠我錢。');
  check('2. 可昕「（小聲）你接得比我想的好。」、社長「新來的，下次練習是週四晚上，可昕知道在哪。」（AA_200 7-2）',L.includes('（小聲）你接得比我想的好。')&&L.includes('新來的，下次練習是週四晚上，可昕知道在哪。'));
  at(G.day,22.5); check('2. 去了：沒有「你錯過了一隻企鵝」',!TH('p:kexin').includes('今天唐睿演了一隻企鵝。你錯過了一隻企鵝。'));
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.C1_GO='no'; at(K('2024-10-07'),22.2); check('3. 今天不行：22:00 可昕「今天唐睿演了一隻企鵝。大家笑到練不下去。」（BB_179 段 E M4）',TH('p:kexin').includes('今天唐睿演了一隻企鵝。大家笑到練不下去。'));
  fresh(K('2024-10-10'),16,'campus'); run(); check('4. 10/10 國慶不邀（10/11 才邀）',!PHONE.sent(G,'y0_c1_ask')&&(()=>{ at(K('2024-10-11'),10); return PHONE.sent(G,'y0_c1_ask'); })());
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

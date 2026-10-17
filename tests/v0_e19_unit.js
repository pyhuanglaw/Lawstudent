// v0 E22b 法律入門書、★E19 誤會（BB_104 8b-14、8-6；AA_154 A33、A34）：舊版綁期末的觸發（沒有休學時的計算）＋ 10/17 休學以後不再單獨排（AA_218 第 9～11 節）——不需要瀏覽器。用法：node tests/v0_e19_unit.js
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
  const K=k=>STORY.dayOfKey(k), J2=K('2024-12-19');   /* 16 週制：113 上期末週 12/16～12/20，最後一場（會計）週四 12/19（原本 1/2）*/
  const eb=STORY_EVENTS.find(e=>e.id==='ev_y0_e22b'), e19=STORY_EVENTS.find(e=>e.id==='ev_y0_e19'); check('0. E22b、E19 在',!!eb&&!!e19); if(!eb){ console.log('FAILED '+fails); process.exit(1); }
  { fresh(J2-3,10,'dorm'); const t0=Date.now(), fe=STORY.y0FinalEnd(G), dt=Date.now()-t0; const t1=Date.now(); STORY.y0FinalEnd(G); const dt2=Date.now()-t1;
    check('0. A34：最後一場期末考照課表算＝12/19（四）15:10（會計；16 週制）；第二次用記住的結果（'+dt+' ms → '+dt2+' ms）',!!fe&&fe.day===J2&&Math.abs(fe.h-(15+10/60))<1e-6&&dt2<=2);
    check('0. A34：上午考完的話 E22b 從 13:30 開始；下午考完＝考完 20 分鐘',STORY.e22bFrom({h:11})===13.5&&Math.abs(STORY.e22bFrom({h:15+10/60})-15.5)<1e-6); }
  const ck=(day,h,zone,lv)=>{ fresh(day,h,zone); E.player.lv=lv|0; global.GAME={E}; return EVENTS.check(eb); };
  /* （E22b 的舊觸發檢查拿掉：AA_224 3-7 改成 12/20 公館的咖啡店，新的測試在 tests/lifeline_g3_unit.js）*/
  fresh(J2,16,'library_hall'); picks=['法律的書']; said=[]; await EVENTS.run(eb); let L=said.map(x=>x.t);
  /* （E22b 的舊觸發檢查拿掉：AA_224 3-7 改成 12/20 公館的咖啡店，新的測試在 tests/lifeline_g3_unit.js）*/
  /* （E22b 的舊觸發檢查拿掉：AA_224 3-7 改成 12/20 公館的咖啡店，新的測試在 tests/lifeline_g3_unit.js）*/
  // E19 舊版（A33、A34：最後一場期末考那天）：AA_218 第 9～11 節、AA_154 0b-1 併進 10/17 車上那一段（KX_CAR，台詞等 BB_188）。10/17 休學以後期末考不排＝不再單獨排
  fresh(J2,15,'campus'); G.events.done.ev_y0_e02=1; at(J2,15.3); at(J2,19.3);
  check('2. E19 不再單獨排：休學（Y0_LEFT）以後沒有期末考（y0FinalEnd＝null）、1/2 沒有群組邀約、沒有出發選單、19:15 沒有電話',G.flags.Y0_LEFT===true&&STORY.y0FinalEnd(G)==null&&!PHONE.sent(G,'y0_e19_ask')&&!OUT.get(G,'y0_e19')&&STORY.coreCallAt(G)==null&&!said.some(x=>x.t==='你在哪？大家都到了。我們等你，快點！'));
  /* （E22b 的舊觸發檢查拿掉：AA_224 3-7 改成 12/20 公館的咖啡店，新的測試在 tests/lifeline_g3_unit.js）*/
  // 內容（舊存檔已經排好的出遊照演；之後改寫的參考）：直接跑事件
  const go=async pick=>{ fresh(J2,19,'campus'); picks=[pick]; said=[]; await EVENTS.run(e19); return said.map(x=>x.t); };
  L=await go('是不是喜歡');
  check('3. 直接問：「……你覺得呢？」…「……不是唐睿。」…「我要趕捷運了。寒假快樂。」→「誤會解開了一半。另一半，你沒有問。」、E19_ASK＝direct',L.includes('……不是唐睿。')&&L.includes('（她自己站起來）我要趕捷運了。寒假快樂。')&&L[L.length-1]==='誤會解開了一半。另一半，你沒有問。'&&G.flags.E19_ASK==='direct');
  await go('很會講話'); check('3. 開玩笑問：「對啊。比某些人會。」、joke',said[said.length-1].t==='對啊。比某些人會。'&&G.flags.E19_ASK==='joke');
  await go('不問'); check('3. 不問：E19_ASK＝none',G.flags.E19_ASK==='none');
  await new Promise(r=>setTimeout(r,30));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

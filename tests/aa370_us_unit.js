// AA_370「美國交換：時差、人在哪、重複的事件」修正稿（企劃線 a1dc3e61；任務 AA370-US-FIX-1021）——不需要瀏覽器。
//   第 1 節 H1、H3（H2 已經在 3a4c01cf 修好，tests/exch_min_unit.js 2b）、第 2 節 M1～M5、M7～M10、第 3 節 L1～L10：每一項至少一個檢查。
//   載入的檔照 index.html 的順序（美國路線會包住別人的函式：STORY.tzOffset、STORY.interact、MSG.replyAt……，順序要和遊戲一樣）。
// 修改前（開發分支 96ddcbcc）：H1、H3、M1～M5、M7～M10、L1～L10 都有 FAIL（每一項的檢查都寫在改之前的程式上跑過）。用法：node tests/aa370_us_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|PORTRAIT_ONLY|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|EXCH|R2Y4A|R2Y4A_EVENTS|R2Y4B|R2Y4B_EVENTS|R3|R3_EVENTS|R2Y3B_EVENTS|SYLLABUS|EXAM_BANK|QBANK|Y34B|USL|US_LIFE_EVENTS|HOLFF|VAC|VAC_DATA|DATE|DATE_LOCATIONS|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|PG|POSTGRAD_LINES|NOODLE_CLOSED|Y2B|Y2B_EVENTS|US_APARTMENT_LAYOUT|US_SHARED_LAYOUT|US_COMMUNITY_LAYOUT|US_MARKET_LAYOUT|US_ASIAN_MARKET_LAYOUT|US_CAMPUS_LAYOUT|US_LAWLIB_LAYOUT|AIRPORT_T2_LAYOUT)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
/* index.html 的順序（3D、畫面的檔不載入）*/
const FILES=['src/data/characters.js','src/data/legal_qbank.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/invites.js','src/data/rel_lines.js',
  'src/invites3d.js','src/phone3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/outings3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/exchange3d.js','src/data/us_layouts.js',
  'src/data/home_lines.js','src/data/needed_msgs.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js',
  'src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/holff3d.js','src/data/courses.js','src/data/syllabus.js','src/data/exam_bank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js','src/noodle_closed3d.js',
  'src/data/y2b_events.js','src/y2b3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/data/r3_events.js','src/r3_3d.js','src/data/us_life_events.js','src/us_life3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const warns=[]; { const w0=console.warn; console.warn=(...a)=>{ warns.push(a.map(String).join(' ')); w0.apply(console,a); }; }   /* 掛勾裡出錯會被 try/catch 吞掉：記下來，最後檢查 */
global.ADV={active:false,slots:{},preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(id){ return !!CG_REGISTRY[id]; },setBg(){},hide(){},narrate(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen'],study:()=>[]};
let said=[], opts=[], picks=[], G=null, caps=[], toasts=[], entered=[], cards=[];
const E={q:{level:'medium'},player:{busy:false,seat:null,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],spots:{}},npcs:[],interactables:[],levels:null,setWeather(w){ this.w=w; },hour:0,paused:false};
const GM={get G(){ return G; },E,D:{active:false},npc:{},running:true,
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(t){ G.goal=t; },toast:t=>{ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){ G.weekday=wdOf(G.day); },
  titleCard:async(a,b)=>{ cards.push(a+'｜'+(b||'')); },enter:async(z,sp)=>{ entered.push(z); G.zone=z; E.zone=Object.assign({roomAt:()=>null,seats:[],spots:{}},z==='us_shared'?{us2On:false,us2(on){ this.us2On=!!on; }}:{}); E.interactables=[]; },
  advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },studySession:async(c,h)=>{ G.hour+=h; },phoneThread:async()=>{},openPhone(){},
  spawnCharacter:(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z}},seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; return n; },removeNPC:id=>{ delete GM.npc[id]; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t:String(t).replace('{name}',(G&&G.name)||'祐廷')}); },
  choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
STORY._bindGM&&STORY._bindGM(GM);
const D=k=>STORY.dayOfKey(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const T=(d,h)=>d*24+h;
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,visited:{},flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0,study:0},contacts:{},msgs:[],outings:[],vac:{reg:{}},acts:{att:{}}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; caps=[]; toasts=[]; entered=[]; cards=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.seat=null; E.player.busy=false; E.zone={roomAt:()=>null,seats:[],spots:{}}; ADV.active=false; if(STORY._fy) STORY._fy.reset(); return G; };
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},f||{});
const TWF=f=>Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1,Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08'),ROOM_Y4:D('2028-09-03')},f||{});
const LV={FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const has=t=>said.some(s=>s.t===t), lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const txt=th=>(G.msgs||[]).filter(m=>m.th===th).map(m=>(m.from||m.name||'')+':'+m.text);
const at=(key,h)=>{ G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const runRules=(key,h0,h1,st)=>{ st=st||0.25; G.day=D(key); G.weekday=wdOf(G.day); for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); rules(); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const run=async(id,o)=>{ said=[]; opts=[]; await EVENTS.run(ev(id),o); };
const go=async id=>{ const q=OUT.get(G,id); said=[]; opts=[]; if(!q) return null; await OUT.go(GM,q); return q; };
const expire=()=>{ for(const q of OUT.expire(G)) OUT.onMissed(GM,q); };   /* 過了時間沒出發（不叫 OUT.tick：它會跳出「出發」的選單）*/
const uslTick=async()=>{ const r=USL.tick(GM,0.5); for(let i=0;i<80&&USL.isBusy&&USL.isBusy();i++) await new Promise(res=>setTimeout(res,2)); return r; };
const interact=async(o)=>{ said=[]; opts=[]; caps=[]; toasts=[]; return STORY.interact(Object.assign({x:0,z:0,radius:1,lv:0},o),GM); };
const msgOf=tag=>(G.msgs||[]).find(m=>m.tag===tag)||null;
(async()=>{
  check('0. 載入：USL、R2Y4A、R2Y4B、R3、Y34B、HOLFF、EXCH 都在', typeof USL!=='undefined'&&typeof R2Y4A!=='undefined'&&typeof R2Y4B!=='undefined'&&typeof R3!=='undefined'&&typeof Y34B!=='undefined'&&typeof HOLFF!=='undefined'&&typeof EXCH!=='undefined'&&!!USL.here);
  if(fails){ console.log('FAILED '+fails); process.exit(1); }

  // ======================= H1 可昕 K23（美國路線＋交往中）：視訊、改天那一場在當地早上 =======================
  fresh('2028-10-18',8.5,'us_apartment',US({Y4_PATH:'grad'})); date('kexin'); runRules('2028-10-18',8.5,9.25);
  { const k=(G.msgs||[]).filter(x=>x.tag==='y4_kx23_ask').map(x=>x.text), m=PHONE.byAsk(G,'y4_kx23');
    check('H1. 美國路線 10/18 當地 09:00（臺灣 21:00）：第三則「週五晚上七點，你那邊是早上。我們視訊，各自說。」（不約木柵大學）', JSON.stringify(k)===JSON.stringify(['你的那條路，現在走到哪了？不用現在說。','我的也想跟你說。','週五晚上七點，你那邊是早上。我們視訊，各自說。'])&&!!m&&Math.abs(m.h-9)<0.1, JSON.stringify(k)); }
  PHONE.answer(G,'y4_kx23',1); rules();
  { const q=OUT.get(G,'y4_kx23b');
    check('H1. 「改天。」→「好。那週六晚上九點，你那邊早上九點。」', txt('p:kexin').slice(-1)[0]==='kexin:好。那週六晚上九點，你那邊早上九點。', JSON.stringify(txt('p:kexin').slice(-2)));
    check('H1. 改天那一場：10/21（六）臺灣 21:00＝當地 09:00 視訊（原本臺灣 15:00＝當地 03:00）', !!q&&q.day===D('2028-10-21')&&Math.abs(q.h-9)<1e-6&&q.place==='視訊'&&q.verb==='接起來', q&&JSON.stringify({day:q.day-D('2028-10-21'),h:q.h})); }
  fresh('2028-10-18',8.5,'us_apartment',US({Y4_PATH:'grad'})); date('kexin'); runRules('2028-10-18',8.5,9.25); PHONE.answer(G,'y4_kx23',0); rules(); at('2028-10-20',8); expire(); rules();
  { const q=OUT.get(G,'y4_kx23b');
    check('H1. 答應了卻沒到（美國路線）：「我想好了。我們找一天，各自說。」「週六晚上九點。這次我等你。」→ 10/21 當地 09:00', txt('p:kexin').slice(-2).join('|')==='kexin:我想好了。我們找一天，各自說。|kexin:週六晚上九點。這次我等你。'&&!!q&&Math.abs(q.h-9)<1e-6, JSON.stringify(txt('p:kexin').slice(-2))); }
  fresh('2028-10-18',8.5,'us_apartment',US({Y4_PATH:'grad',KX23_GO:'later'})); date('kexin'); G.outings.push({id:'y4_kx23b',ev:'ev_kexin_own_paths',day:D('2028-10-21'),h:3,late:0.5,place:'視訊',title:'和可昕視訊',verb:'接起來',travelH:0,hours:1,state:'planned',ask:null});
  at('2028-10-19',12); rules(); check('H1. 舊存檔：已經排在當地 03:00 的改天那一場，改到當地 09:00', Math.abs(OUT.get(G,'y4_kx23b').h-9)<1e-6, String(OUT.get(G,'y4_kx23b').h));
  fresh('2028-10-18',20.5,'dorm',TWF()); date('kexin'); runRules('2028-10-18',20.5,21.25); PHONE.answer(G,'y4_kx23',1); rules();
  { const q=OUT.get(G,'y4_kx23b'); check('H1. 臺灣路線照舊：「週五晚上七點，木柵大學。……」「好。那週六下午三點，同一個地方。」→ 10/21 15:00 木柵大學', txt('p:kexin').includes('kexin:週五晚上七點，木柵大學。我們走一段路，各自說。')&&txt('p:kexin').slice(-1)[0]==='kexin:好。那週六下午三點，同一個地方。'&&!!q&&q.h===15&&q.place==='木柵大學'); }

  // ======================= H3 8/5 18:30 湖邊（交往中）=======================
  fresh('2028-08-05',18.5,'us_outside',US()); date('heroine_05'); picks=[1]; await run('ev_usl_lake1',{noTitle:true});
  check('H3. 湖邊：學姊「台灣這時候，大家在吃早餐了。」（當地 8/5 18:30＝臺灣 8/6 06:30；AA_450 1-2：不是「已經在吃宵夜了」、也不是「天快亮了」）', has('台灣這時候，大家在吃早餐了。')&&!has('台灣這時候，已經在吃宵夜了。')&&!has('台灣這時候，天快亮了。'), JSON.stringify(lines().slice(0,4)));

  // ======================= M1 芷若要地址只發一次（8/10；8/20 那則 y4_zr_addr 拿掉）=======================
  fresh('2028-08-10',8,'us_apartment',US()); R('heroine_02','FAM'); G.contacts.heroine_02=1; runRules('2028-08-10',8,10,0.5);
  for(let k=11;k<=25;k++) runRules('2028-08-'+String(k).padStart(2,'0'),8,10,0.5);
  { const n=txt('p:heroine_02').filter(t=>t==='heroine_02:給我你在那邊的地址。英國寄到美國要多久，我想試試看。').length;
    check('M1. 美國路線：芷若要地址只有 8/10 那一則（8/20 的 y4_zr_addr 拿掉）', n===1&&PHONE.sent(G,'usl_zr_0810')&&!PHONE.sent(G,'y4_zr_addr'), JSON.stringify(txt('p:heroine_02'))); }

  // ======================= M2 9/16 雞蛋只發一則（留 USL 那則，拿掉 R3 的 y4_sis_egg）=======================
  fresh('2028-09-16',9,'us_apartment',US({US2:'there'})); date('heroine_05'); G.contacts.heroine_05=1; runRules('2028-09-16',9,13,0.25);
  { const e=txt('p:heroine_05').filter(t=>t==='heroine_05:今天的雞蛋，日期是對的。'), m=msgOf('usl_sis_0916');
    check('M2. 交往中 9/16：「今天的雞蛋，日期是對的。」只有一則（12:10，USL）；R3 的 y4_sis_egg（10:00）沒有', e.length===1&&!!m&&Math.abs(m.h-12.17)<0.1&&!PHONE.sent(G,'r3_y4_sis_egg_0'), JSON.stringify(e)); }
  fresh('2028-09-16',9,'us_apartment',US({US1:'alone'})); R('heroine_05','FRI'); G.contacts.heroine_05=1; runRules('2028-09-16',9,13,0.25);
  check('M2. 挽回中：沒有雞蛋那則（AA_340 第 7 週只給交往中）', !txt('p:heroine_05').some(t=>/雞蛋/.test(t)), JSON.stringify(txt('p:heroine_05')));

  // ======================= M3 何俊朗：美國路線停用 R3 版 1～5，只跑 USL 版；MET_LONG 兩邊互相認 =======================
  fresh('2028-08-11',9,'us_apartment',US()); rules();
  check('M3. 新遊戲 8/11：行事曆只有 USL 的「國際學生迎新」（usl_long1），沒有 R3 的 r3_long_1', !!OUT.get(G,'usl_long1')&&!OUT.get(G,'r3_long_1'), JSON.stringify(OUT.rec(G).map(q=>q.id)));
  at('2028-09-06',9); rules(); check('M3. 9/6：只有 usl_long2a，沒有 r3_long_2a（9/8 不會有兩個同名出遊）', !!OUT.get(G,'usl_long2a')&&!OUT.get(G,'r3_long_2a'), JSON.stringify(OUT.rec(G).map(q=>q.id)));
  fresh('2028-09-06',9,'us_apartment',US()); G.outings.push({id:'r3_long_2a',ev:'ev_long_class',day:D('2028-09-08'),h:12,late:0.5,place:'法學院',title:'Legal Writing 下課',travel:'',travelH:1/6,state:'planned',ask:null}); rules();
  check('M3. 舊存檔（v9.10.3 兩版都排了）：R3 的 r3_long_2a 取消（cancelled），USL 的照排', OUT.get(G,'r3_long_2a').state==='cancelled'&&!!OUT.get(G,'usl_long2a'), OUT.get(G,'r3_long_2a').state);
  fresh('2028-09-08',11.8,'us_campus',US()); SOCIAL.remember('npc_long','MET_LONG',''); G.events.done.ev_long_orientation=1; rules();
  check('M3. 舊存檔：R3 版迎新演過（記憶 MET_LONG）＝旗標 MET_LONG 也有', G.flags.MET_LONG===true);
  await go('usl_long2a'); check('M3. 9/8 Legal Writing 下課：見過他（R3 版迎新）就不再自我介紹', !has('我叫何俊朗。叫我 Long 就好。')&&has('你考得怎麼樣？'), JSON.stringify(lines().slice(0,3)));
  fresh('2028-08-15',9,'us_apartment',US({MET_LONG:true,LONG_HAIHAO:true})); rules();
  check('M3. USL 版的旗標（MET_LONG、LONG_HAIHAO）也記成記憶（人物面板「在美國認識了香港來的 Long」）', SOCIAL.has('npc_long','MET_LONG')&&SOCIAL.has('npc_long','LONG_HAIHAO'));
  fresh('2028-08-11',9,'us_apartment',US()); G.events.done.ev_long_orientation=1; SOCIAL.remember('npc_long','MET_LONG',''); G.outings.push({id:'usl_long1',ev:'ev_usl_long1',day:D('2028-08-14'),h:10,late:1,place:'法學院',title:'國際學生迎新',travel:'',travelH:0,state:'planned',ask:null}); rules();
  check('M3. 舊存檔：R3 版的迎新已經演過＝USL 的迎新不再演（取消）', OUT.get(G,'usl_long1').state==='cancelled');
  fresh('2028-09-06',9,'us_apartment',US()); G.events.done.ev_long_class=1; SOCIAL.remember('npc_long','MET_LONG',''); rules(); at('2028-09-12',9); rules();
  check('M3. 舊存檔：R3 版 2a 演過＝USL 的 2a 不排、2b（9/15 新開的餐廳）照排', !OUT.get(G,'usl_long2a')&&!!OUT.get(G,'usl_long2b'), JSON.stringify(OUT.rec(G).map(q=>q.id+':'+q.state)));
  fresh('2028-10-04',21,'us_apartment',US({MET_LONG:true})); G.events.done.ev_long_bbq=1;
  check('M3. R3 版回公寓的筆記（ev_long_note）不再演（第 6 節第 9 題：資料刪掉）', !STORY_EVENTS.some(e=>e.id==='ev_long_note'));
  said=[]; await uslTick(); const note='（回到公寓，你在筆記本最後一頁寫了「誰都」和「誰也」。看了很久，還是聽不出來。）';   /* AA_452 1-6 換句 */
  check('M3. 舊存檔：R3 版會所自習室演過＝當晚回公寓演 USL 的筆記（一次）', has(note)&&G.flags.LONG_NOTE===true&&(said=[],0)===0, JSON.stringify(lines()));
  await uslTick(); check('M3. 筆記不重複', !has(note));
  fresh('2028-10-04',21,'us_apartment',US({MET_LONG:true,LONG_NOTE:true})); G.events.done.ev_usl_long3=1; said=[]; await uslTick();
  check('M3. 舊存檔：R3 版的筆記已經寫過（LONG_NOTE）＝USL 的筆記不再演', !has(note));
  fresh('2028-10-06',20.5,'us_outside',US({MET_LONG:true,LONG_PARTY:true})); said=[]; await uslTick();
  check('M3. 舊存檔：R3 版聚餐的旁白演過（LONG_PARTY）＝USL 的不再演', !said.some(s=>/秋假前的聚餐/.test(s.t))&&!STORY_EVENTS.some(e=>e.id==='ev_long_party'), JSON.stringify(lines()));
  fresh('2028-10-24',20.5,'us_apartment',US({MET_LONG:true})); G.msgs.push({day:D('2028-10-24'),h:21,th:'p:npc_long',who:'npc_long',from:'npc_long',text:'明天晚上去中餐館？我想吃白飯。',tag:'r3_long_5',ask:{id:'r3_long_5',opts:[{t:'好。'},{t:'明天不行。'}]}}); runRules('2028-10-24',20.5,21.5);
  check('M3. 舊存檔：R3 版 10/24 的約已經傳了＝USL 的不再傳（不會收到兩次「明天晚上去中餐館？」）', !PHONE.sent(G,'usl_long_1024')&&txt('p:npc_long').filter(t=>/中餐館/.test(t)).length===1);
  fresh('2028-10-25',9,'us_apartment',US({MET_LONG:true,LONG_MENU_DAY:'2028-10-25'})); G.outings.push({id:'r3_long_5',ev:'ev_long_menu',day:D('2028-10-25'),h:19,late:0.5,place:'中餐館',title:'中餐館',travel:'',travelH:1/6,state:'planned',ask:null}); rules();
  check('M3. 舊存檔：R3 版答應了 10/25 的中餐館＝改排 USL 的（usl_long5），R3 的取消', OUT.get(G,'r3_long_5').state==='cancelled'&&!!OUT.get(G,'usl_long5')&&OUT.get(G,'usl_long5').day===D('2028-10-25'), JSON.stringify(OUT.rec(G).map(q=>q.id+':'+q.state)));

  // ======================= M4 出發、飛行：07:00 到機場、09:30 起飛、舊金山轉機 19 小時、當地 16:30 落地 =======================
  fresh('2028-08-02',6.2,'campus',{EXCHANGE_ROUTE:'US',EXCH_RULE:1}); await EXCH.depart(GM);
  check('M4. 8/2 出發：07:00 到桃園機場出境大廳（原本一律 13:00）', entered.includes('airport_dep')&&Math.abs(G.hour-7)<1e-6, JSON.stringify({entered,h:G.hour}));
  G.hour=8; cards=[]; entered=[]; await EXCH.fly(GM);
  check('M4. 字卡「舊金山轉機到印第安納　約 19 小時」、「抵達｜美國印第安納　當地時間 16:30」', cards.includes('飛往美國｜舊金山轉機到印第安納　約 19 小時')&&cards.includes('抵達｜美國印第安納　當地時間 16:30')&&G.flags.US_ARRIVED===true, JSON.stringify(cards));
  fresh('2028-08-02',20.5,'airport_dep',{EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true}); cards=[]; await EXCH.fly(GM);
  check('M4. 舊存檔拖到 20:30 才登機：字卡不會寫「當地時間 25:00」這種時間', !cards.some(c=>/當地時間 (2[4-9]|[3-9]\d):/.test(c))&&cards.some(c=>/當地時間 \d\d:\d\d$/.test(c)), JSON.stringify(cards));

  // ======================= M5 12/23 回國（交往中、和學姊同一班）=======================
  fresh('2028-12-23',5.67,'airport_arr',US({US_RETURNED:D('2028-12-23'),SIS_SENDOFF:'together'})); date('heroine_05'); await run('ev_us_return');
  check('M5. 入境大廳：「（媽媽先看到你，再看到你旁邊的人。她笑了一下。）」學姊「阿姨好。……上次的鳳梨酥，很好吃。」（8/2 已經見過媽媽）', has('（媽媽先看到你，再看到你旁邊的人。她笑了一下。）')&&has('阿姨好。……上次的鳳梨酥，很好吃。')&&!has('伯母好。……我是書瑀。')&&!has('（媽媽先看到你，再看到你旁邊的人。）'), JSON.stringify(lines().slice(0,6)));
  fresh('2028-12-23',5.67,'airport_arr',US({US1:'alone',US_RESTART:D('2028-12-02'),US_RETURNED:D('2028-12-23')})); date('heroine_05'); await run('ev_us_return');
  check('M5. 8/2 出發那天還沒在交往（挽回中，初雪重新開始）：媽媽那天沒見過她（沒有鳳梨酥那一段）＝原句「伯母好。……我是書瑀。」', has('（媽媽先看到你，再看到你旁邊的人。）')&&has('伯母好。……我是書瑀。')&&!has('阿姨好。……上次的鳳梨酥，很好吃。'), JSON.stringify(lines().slice(0,4)));
  await run('ev_us_home'); { const s=said.find(x=>x.t==='（九點。廚房裡有粥的味道。你回來了。）');
    check('M5. 09:00 回到家：旁白「（九點。廚房裡有粥的味道。你回來了。）」（媽媽不再說「你回來了。」）', !!s&&s.who===null&&!said.some(x=>x.who==='媽媽'), JSON.stringify(lines())); }

  // ======================= M7 中秋（10/3）美國路線：沒見過麵店團的可昕不在群組說話 =======================
  const KXL='阿哲今年贏了。……你不在，我沒力氣講冷笑話。';
  fresh('2028-10-03',7,'us_apartment',US()); PHONE.join(G,'noodle_team','麵店團'); date('kexin'); runRules('2028-10-03',7,10.5);
  { const m=msgOf('y4_ma_us_kx'), d=D('2028-10-03'), want=d*24+22+STORY.tzOffset(G,d);
    check('第 6 節第 5 題. 私訊照臺灣版：臺灣 22:00（當地 '+((want%24+24)%24)+':00），不是跟著照片的臺灣 19:30', !!m&&Math.abs(m.day*24+m.h-want)<0.02&&!(G.msgs||[]).some(x=>x.tag==='y4_ma_us'&&x.from==='kexin'), m?JSON.stringify({day:m.day-d,h:m.h}):'沒有'); }
  check('M7. 和可昕交往、她沒見過麵店團：她那句改私訊（句子不改）；群組只有阿哲的照片', txt('p:kexin').includes('kexin:'+KXL)&&!txt('g:noodle_team').some(t=>t.indexOf(KXL)>=0)&&txt('g:noodle_team').includes('zhe:📷（河濱，兩個烤肉架，一支夾子插在玉米上。）'), JSON.stringify({p:txt('p:kexin'),g:txt('g:noodle_team')}));
  fresh('2028-10-03',7,'us_apartment',US({KX_MET_NOODLE_TEAM:true})); PHONE.join(G,'noodle_team','麵店團'); date('kexin'); runRules('2028-10-03',7,8);
  check('M7. 見過麵店團（KX_MET_NOODLE_TEAM）：照舊在群組說', txt('g:noodle_team').includes('kexin:'+KXL)&&!txt('p:kexin').some(t=>t.indexOf(KXL)>=0));
  fresh('2028-10-03',7,'us_apartment',US()); date('kexin'); runRules('2028-10-03',7,10.5);
  check('第 6 節第 5 題. 祐廷不在麵店團群組：沒見過麵店團的可昕照樣私訊（不看群組）', txt('p:kexin').includes('kexin:'+KXL)&&!msgOf('y4_ma_us'), JSON.stringify(txt('p:kexin')));

  // ======================= M8 子晴 Q14（10/11）× 和學姊的大峽谷（10/7～10/14）=======================
  const canyonDone=()=>{ G.flags.US_CANYON=true; G.outings.push({id:'y4_us_canyon',ev:'ev_us_canyon',day:D('2028-10-07'),h:6,late:1,must:true,place:'社區門口',title:'秋假：大峽谷',travel:'',travelH:0,state:'done',ask:null}); };
  fresh('2028-10-14',18,'us_outside',US()); date('heroine_05'); R('heroine_04','FRI'); canyonDone(); rules();
  { const m=PHONE.byAsk(G,'y4_q14');
    check('M8. 和學姊去大峽谷：10/14 18:00 回到印第安納，子晴 Q14 還收得到，期限延到回來隔天中午（10/15 12:00）', !!m&&m.ask.until===T(D('2028-10-15'),12)&&PHONE.askOpen(G,m), m?JSON.stringify({until:m.ask.until-T(D('2028-10-15'),12)}):'沒有 Q14');
    check('M8. 亞利桑那慢 15 小時：Q14 照當地時間顯示（臺灣 10/11 21:00＝亞利桑那 10/11 06:00）', !!m&&m.day===D('2028-10-11')&&Math.abs(m.h-6)<0.1, m?JSON.stringify({d:m.day-D('2028-10-11'),h:m.h}):'');
    at('2028-10-15',11.5); PHONE.answer(G,'y4_q14',0); check('M8. 回來隔天上午回覆：ZQ_CONTRACT 有值', G.flags.ZQ_CONTRACT==='lawyer', String(G.flags.ZQ_CONTRACT)); }
  check('M8. tzOffset：去了大峽谷的 10/7～10/14 −15；10/15 起 −12；10/6 −12', STORY.tzOffset(G,D('2028-10-07'))===-15&&STORY.tzOffset(G,D('2028-10-14'))===-15&&STORY.tzOffset(G,D('2028-10-15'))===-12&&STORY.tzOffset(G,D('2028-10-06'))===-12);
  fresh('2028-10-11',8.5,'us_apartment',US()); R('heroine_04','FRI'); runRules('2028-10-11',8.5,9.25);
  { const m=PHONE.byAsk(G,'y4_q14'); check('M8. 沒去大峽谷（人在印第安納）：照舊 10/11 當地 09:00、期限 10/12 中午；tzOffset −12', !!m&&m.ask.until===T(D('2028-10-13'),-12)&&STORY.tzOffset(G,D('2028-10-10'))===-12, m?String(m.ask.until-T(D('2028-10-12'),12)):''); }

  // ======================= M9 學姊的作息：芝加哥（11/11～12）、初雪那晚在小教堂台階等（12/2 20:00～21:30）=======================
  fresh('2028-11-11',15,'us_shared',US({US2:'there'})); date('heroine_05');
  { const a=USL.sisAt(G), w=STORY.whereIs(GM,'heroine_05'); USL.sisSync(GM);
    check('M9. 11/11（六）15:00：學姊在芝加哥——不在 C 棟 208（3D 不放人）、「現在大概在」寫芝加哥', !!a&&a.away==='芝加哥'&&!!w&&w.away==='芝加哥'&&!GM.npc.heroine_05, JSON.stringify({a,w})); }
  check('M9. 11/11 週末：208 的門關著（她不在）', !USL.c208Open(G));
  at('2028-11-12',16); check('M9. 11/12（日）16:00 也在芝加哥', USL.sisAt(G).away==='芝加哥');
  at('2028-11-18',15); check('M9. 11/18（六）15:00 照舊在 C 棟 208', USL.sisAt(G).zone==='us_shared'&&USL.c208Open(G));
  at('2028-12-02',20.5); { const a=USL.sisAt(G), w=STORY.whereIs(GM,'heroine_05'); check('M9. 12/2（六）20:30：在小教堂前的台階等（不在 208）', !!a&&a.away==='小教堂前的台階'&&!!w&&w.away==='小教堂前的台階', JSON.stringify({a,w})); }
  at('2028-12-02',19.5); check('M9. 12/2 19:30 照舊在 C 棟 208', USL.sisAt(G).zone==='us_shared');

  // ======================= M10 美國路線 7/25 退宿 =======================
  { const e=ev('ev_x1_moveout_us'); check('M10. 507 退宿的開頭：「（七月底。507 只剩你這半邊還有東西。柏翰白天在補習班，他的桌上堆滿了講義。）」', !!e&&e.dialogue[0].text==='（七月底。507 只剩你這半邊還有東西。柏翰白天在補習班，他的桌上堆滿了講義。）', e&&e.dialogue[0].text); }

  // ======================= L1 沒見過何俊朗：不出現「Long」「何俊朗」=======================
  fresh('2028-09-01',8.5,'us_apartment',US()); G.usLife={att:{us_writing:1}}; await interact({uslClass:true});
  check('L1. 沒見過他（沒去 8/14 迎新）：Legal Writing 第二句「坐你前面的交換生交出去的作業，被圈出三個『however』。」（AA_451 1-2：原本「同一組的交換生」）', has('坐你前面的交換生交出去的作業，被圈出三個『however』。')&&!said.some(s=>/Long|何俊朗/.test(s.t)), JSON.stringify(lines()));
  fresh('2028-09-01',8.5,'us_apartment',US({MET_LONG:true})); G.usLife={att:{us_writing:1}}; await interact({uslClass:true});
  check('L1. 見過他：照原句「Long 交出去的作業，被圈出三個『however』。」', has('Long 交出去的作業，被圈出三個『however』。'));
  fresh('2028-12-08',8.5,'us_apartment',US()); await interact({uslClass:true});
  check('L1. 沒見過他：12/8 最後一堂「（一個香港來的交換生念的那一句，沒有 however。全班拍手。）」（AA_451 1-2）', has('（一個香港來的交換生念的那一句，沒有 however。全班拍手。）')&&!has('（何俊朗念的那一句，沒有 however。全班拍手。）'), JSON.stringify(lines()));
  fresh('2028-12-08',8.5,'us_apartment',US({MET_LONG:true})); await interact({uslClass:true}); check('L1. 見過他：照原句「（何俊朗念的那一句……）」', has('（何俊朗念的那一句，沒有 however。全班拍手。）'));
  fresh('2028-11-11',7,'us_outside',US()); date('heroine_05'); await run('ev_us_chicago');
  check('L1. 沒見過他：芝加哥在巴士上認識他（AA_451 1-1，原本「同行的人」），之後「一路上，何俊朗說了好幾次……」', has('（巴士上，坐在你們前面的是一個戴圓框眼鏡的男生。車子一開，他就回頭。）')&&has('（一路上，何俊朗說了好幾次「還好」：巴士、披薩、湖邊的風。每一次聽起來都不一樣。）')&&!has('（一路上，同行的人說了好幾次「還好」：巴士、披薩、湖邊的風。每一次聽起來都不一樣。）'), JSON.stringify(lines()));
  fresh('2028-11-11',7,'us_outside',US({MET_LONG:true})); date('heroine_05'); await run('ev_us_chicago'); check('L1. 見過他：芝加哥照原句', has('（一路上，何俊朗說了好幾次「還好」：巴士、披薩、湖邊的風。每一次聽起來都不一樣。）'));

  // ======================= L2 阿哲 8/21「我回來了」（holff3d.js）：美國路線也照時差 =======================
  fresh('2028-08-21',6.5,'us_apartment',US()); PHONE.join(G,'noodle_team','麵店團'); runRules('2028-08-21',6.5,8);
  { const m=msgOf('hol_y3s_zhe_back'); check('L2. 美國路線：阿哲 8/21「我回來了」臺灣 19:00＝當地 07:00（原本當地 19:00 才收到＝臺灣隔天 07:00）', !!m&&m.day===D('2028-08-21')&&Math.abs(m.h-7)<0.05, m?String(m.h):'還沒收到'); }
  fresh('2028-08-21',18.5,'dorm',TWF()); PHONE.join(G,'noodle_team','麵店團'); runRules('2028-08-21',18.5,19.5);
  { const m=msgOf('hol_y3s_zhe_back'); check('L2. 臺灣路線照舊 19:00', !!m&&Math.abs(m.h-19)<0.05); }

  // ======================= L3 可昕 12/22（回臺灣的路上）照臺灣時間 =======================
  fresh('2028-12-23',6,'airport_arr',US({US_TRIP_MODE:'sf',US_TRIP_DONE:true,US_RETURNED:D('2028-12-23')})); date('kexin'); rules();
  { const m=msgOf('y4_kx_grades0'); check('L3. 美國路線（舊金山那一週回來）：可昕「成績出來那天，各說一科這學期最滿意的。」照臺灣 12/22 21:00 顯示', !!m&&m.day===D('2028-12-22')&&Math.abs(m.h-21)<0.02, m?JSON.stringify({d:m.day-D('2028-12-22'),h:m.h}):'沒有'); }
  fresh('2028-12-23',6,'airport_arr',US({US_TRIP_MODE:'sf',US_TRIP_DONE:true,US_RETURNED:D('2028-12-23')})); PHONE.join(G,'noodle_team','麵店團'); rules();
  { const m=msgOf('y4_xmas_photo'); check('第 6 節第 8 題. 阿哲 12/22 聖誕交換禮物的照片也照臺灣 12/22 21:30 顯示（原本換算成 12/22 早上）', !!m&&m.day===D('2028-12-22')&&Math.abs(m.h-21.5)<0.02, m?JSON.stringify({d:m.day-D('2028-12-22'),h:m.h}):'沒有'); }

  // ======================= L4 秋假（10/9～10/13）何俊朗在芝加哥：自習室沒有招呼 =======================
  fresh('2028-10-10',19.5,'us_outside',US({MET_LONG:true}));
  check('L4. 秋假 10/10（二）19:30：何俊朗不在會所自習室；10/16（一）照舊在', !USL.longHere(G)&&(at('2028-10-16',19.5),USL.longHere(G)));

  // ======================= L5 8/10 摘要日 =======================
  { const s=USL.SUM.find(x=>x.d==='2028-08-10'); check('L5. 8/10 摘要：「（第一次用美國的烘衣機。衣服出來，縮了一號。）」（自己那一戶有洗衣機）', !!s&&USL.sumLine(G,s)==='（第一次用美國的烘衣機。衣服出來，縮了一號。）', s&&String(s.t)); }

  // ======================= L6 學姊事務版「在這邊的圖書館。有事嗎？」：兩人都在布魯明頓時不用 =======================
  { const pickBiz=()=>{ const o=MSG.open(G,'heroine_05'); const e=MSG.pick(G,'heroine_05','chat',null,{}); return {mode:o.mode,e}; };
    fresh('2028-09-20',12.2,'us_apartment',US({US1:'alone'})); R('heroine_05','FAM'); G.contacts.heroine_05=1; let r=pickBiz();
    check('L6. 美國路線、人在布魯明頓（事務版）：不用「在這邊的圖書館。有事嗎？」', r.mode==='business'&&!(r.e&&r.e.msgs.includes('在這邊的圖書館。有事嗎？')), JSON.stringify({mode:r.mode,e:r.e&&r.e.msgs}));
    check('第 6 節第 3 題. 同一個情況改回「在圖書館。有事嗎？」，沒有後面的追問（原本沒有句子、只能回貼圖）', r.mode==='business'&&!!r.e&&JSON.stringify(r.e.msgs)==='["在圖書館。有事嗎？"]'&&!r.e.ask, JSON.stringify({mode:r.mode,e:r.e&&r.e.msgs,ask:r.e&&r.e.ask}));
    fresh('2028-09-20',12.2,'dorm',TWF()); R('heroine_05','FAM'); G.contacts.heroine_05=1; r=pickBiz();
    check('L6. 臺灣路線（她在美國、你在臺灣）照舊用', r.mode==='business'&&!!r.e&&r.e.msgs.includes('在這邊的圖書館。有事嗎？'), JSON.stringify({mode:r.mode,e:r.e&&r.e.msgs}));
    check('第 6 節第 3 題. 臺灣路線不用「在圖書館。有事嗎？」', !MSG_POOL.people.heroine_05.replies.filter(x=>x.msgs.includes('在圖書館。有事嗎？')).some(x=>MSG.tagOk(G,'heroine_05',x.tags[0]))); }

  // ======================= L7 8/3 05:10 學姊（交往中）=======================
  fresh('2028-08-03',4.5,'us_apartment',US()); date('heroine_05'); runRules('2028-08-03',4.5,5.5);
  check('L7. 8/3 05:10：「你也醒了吧。」「睡不著。外面還是黑的。……我的身體以為現在是下午。」（當地 05:10 天還黑）', JSON.stringify(txt('p:heroine_05').slice(0,2))===JSON.stringify(['heroine_05:你也醒了吧。','heroine_05:睡不著。外面還是黑的。……我的身體以為現在是下午。']), JSON.stringify(txt('p:heroine_05')));

  { const m=(G.msgs||[]).filter(x=>x.tag==='usl_sis_0803'&&x.ask).pop(), o=m?m.ask.opts:[];
    check('第 6 節第 1 題. 8/3 回覆選項「醒了。」「我也還醒著。」（原本「鳥在叫什麼？」，前面已經沒提到鳥）；選「我也還醒著。」→ 學姊「……那就一起醒著。」', JSON.stringify(o.map(x=>x.t))==='["醒了。","我也還醒著。"]'&&o[1].say[0].text==='……那就一起醒著。', JSON.stringify(o.map(x=>[x.t,(x.say||[]).map(y=>y.text)]))); }

  // ======================= L8 8/2 機場（一起出發）=======================
  fresh('2028-08-02',7,'airport_dep',{EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true}); date('heroine_05'); await run('ev_sis_depart_us');
  check('L8. 學姊「護照、簽證、學校的文件。……你的拿出來，我看一次。」（不寫死 I-20）', has('護照、簽證、學校的文件。……你的拿出來，我看一次。')&&!said.some(s=>/I-20|入學許可/.test(s.t)), JSON.stringify(lines().slice(0,2)));

  // ======================= L9 竹葉亞洲超市：10:00～21:00（第 6 節第 2 題：照 AA_291，原本 09:00），週日公休 =======================
  const toAsia={label:'過馬路（對面的亞洲超市）',exit:{to:'us_asian_market',spawn:{x:0,z:0,yaw:0}}};
  check('L9. 營業時間：週一～六 10:00～21:00（第 6 節第 2 題：週一 09:30 還沒開）、週日公休', !PLACES.isOpen('us_asian_market',10,D('2028-08-06'))&&PLACES.isOpen('us_asian_market',10,D('2028-08-07'))&&!PLACES.isOpen('us_asian_market',9.5,D('2028-08-07'))&&PLACES.isOpen('us_asian_market',20.9,D('2028-08-12'))&&!PLACES.isOpen('us_asian_market',21,D('2028-08-07'))&&!PLACES.isOpen('us_asian_market',8.9,D('2028-08-07')));
  fresh('2028-08-06',10,'us_market',US()); let r9=await interact(toAsia);
  check('L9. 8/6（日）10:00 在草原超市「過馬路（對面的亞洲超市）」：公休，過不去', r9===true&&toasts.some(t=>/公休/.test(t))&&G.zone==='us_market', JSON.stringify(toasts));
  at('2028-08-07',21.5); r9=await interact(toAsia); check('L9. 週一 21:30：關門了', r9===true&&toasts.some(t=>/沒有開|公休/.test(t)), JSON.stringify(toasts));
  at('2028-08-07',10); r9=await interact(toAsia); check('L9. 週一 10:00：照常過去（不擋）', r9!==true&&!toasts.length);

  // ======================= L10 12/23 拆箱（美國路線）=======================
  fresh('2028-12-23',19,'dorm',US({US_RETURNED:D('2028-12-23')})); picks=[0,0,0,0,0,0,0,0,'全部拿出來']; await STORY.unboxY4(GM);
  check('L10. 美國路線 12/23 拆箱最後一句：「（三年。這個房間，你只會住半年。）」', said.length&&said[said.length-1].t==='（三年。這個房間，你只會住半年。）', JSON.stringify(said.slice(-1)));
  fresh('2028-09-03',9,'dorm',TWF({ROOM_Y4:null})); delete G.flags.ROOM_Y4; picks=[0,0,0,0,0,0,0,0,'全部拿出來']; await STORY.unboxY4(GM);
  check('L10. 臺灣路線照舊：「（三年。這個房間，你只會住一年。）」', said.length&&said[said.length-1].t==='（三年。這個房間，你只會住一年。）', JSON.stringify(said.slice(-1)));

  check('掛勾沒有吞掉錯誤（console.warn）', !warns.length, warns.slice(0,3).join(' / '));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外：'+(e&&e.stack||e)); process.exit(1); });

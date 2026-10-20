// 事件包第 2 輪之三（前半）AA_327 2-Y4-01～29（src/data/r2y4a_events.js、src/r2y4a3d.js）——不需要瀏覽器。照 AA 給 BB 的驗收情境寫（每件至少一項）。
//   美國路線：U1～U2 抵達、V1～V2 US2、C1～C3 芝加哥、L1～L2 湖邊、N1～N4 初雪、D1～D2 會所晚餐、R1～R3 離開與回臺灣。
// 修改前：沒有這些事件（第 0 項 FAIL，之後全部不跑）。用法：node tests/r2y4a_events_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|EXCH|R2Y4A|R2Y4A_EVENTS|SYLLABUS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/exchange3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let cgs=[]; global.ADV={active:false,slots:{},preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(id){ if(!CG_REGISTRY[id]) return false; cgs.push(id); return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, caps=[], toasts=[], entered=[], cards=[];
const E={q:{level:'medium'},player:{busy:false,seat:null,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],spots:{}},npcs:[],interactables:[],levels:null,setWeather(w){ this.w=w; },hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast:t=>{ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){ const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; },
  titleCard:async(a,b)=>{ cards.push(a+'｜'+(b||'')); },enter:async(z,sp)=>{ entered.push(z); G.zone=z; E.zone=Object.assign({roomAt:()=>null,seats:[],spots:{}},z==='us_shared'?{us2On:false,us2(on){ this.us2On=!!on; }}:{}); },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
let room409=0; STORY.roomY4FromAirport=async()=>{ room409++; G.zone='dorm'; return true; };   /* 19:00 409 是 room_y4_unit.js 測的；這裡只看有沒有接上 */
const D=k=>STORY.dayOfKey(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,visited:{},flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cgs=[]; caps=[]; toasts=[]; entered=[]; cards=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.seat=null; E.zone={roomAt:()=>null,seats:[],spots:{}}; ADV.active=false; return G; };
const LV={FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const ct=id=>{ G.contacts[id]=1; };
const has=t=>said.some(s=>s.t===t), hasRe=re=>said.some(s=>re.test(s.t)), lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const txt=th=>(G.msgs||[]).filter(m=>m.th===th).map(m=>(m.from||m.name||'')+':'+m.text);
const at=(key,h)=>{ G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const run=async(id,o)=>{ said=[]; opts=[]; await EVENTS.run(ev(id),o); };
const answer=(id,k)=>PHONE.answer(G,id,k);
const tick=async()=>{ const r=R2Y4A.tick(GM,0.5); for(let i=0;i<60&&R2Y4A.isBusy();i++) await new Promise(res=>setTimeout(res,2)); return r; };
const outTick=async()=>{ const p=OUT.tick(GM); if(p&&p.then) await p; };
const US=(flags)=>Object.assign({EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',ROOM_Y4_MOVING:false},flags||{});
const sisSaid=()=>said.filter(s=>s.who&&/學姊|書瑀|溫書瑀/.test(s.who)).map(s=>s.t);
(async()=>{
  const IDS=['ev_us1_arrive','ev_us1_market','ev_us1_asian','ev_us1_door','ev_us1_mom','ev_us2_kitchen','ev_us2_repair','ev_us_chicago','ev_us_chicago2','ev_us3_lake','ev_us_first_snow','ev_us_snow_repair','ev_us_club_dinner','ev_us_leave','ev_sf1','ev_sf2','ev_sf3','ev_sf_photo17','ev_sf_photo19','ev_sf_photo21','ev_us_bloom16','ev_us_bloom18','ev_us_bloom20','ev_us_bus21','ev_us_return','ev_us_home'];
  check('0. 美國路線的事件都在、R2Y4A 掛上去了（PHONE_RULES、TICKS、WAKE_AT、ALARMS、STORY.interact、EXCH.onArrive／onLand）', typeof R2Y4A!=='undefined'&&IDS.every(id=>!!ev(id))&&STORY.TICKS.length>0&&STORY.PHONE_RULES.length>0&&STORY.WAKE_AT.length>0&&STORY.ALARMS.length>0&&!!STORY._r2y4aInteract&&typeof EXCH.onArrive==='function'&&typeof EXCH.onLand==='function', JSON.stringify(IDS.filter(id=>!ev(id))));
  if(fails){ console.log('FAILED '+fails); process.exit(1); }
  { const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=h.indexOf('src/group3d.js'), b=h.indexOf('src/data/r2y4a_events.js'), c=h.indexOf('src/r2y4a3d.js'), z=h.indexOf('GAME.boot()'), x=h.indexOf('src/exchange3d.js'), u=h.indexOf('src/us3d.js');
    check('0. index.html：exchange3d.js、us3d.js 之後，group3d.js → data/r2y4a_events.js → r2y4a3d.js → GAME.boot()', x>0&&u>x&&a>u&&b>a&&c>b&&z>c); }
  { const bad=[]; for(const e of R2Y4A_EVENTS){ const s=JSON.stringify(e.dialogue); if(/重點是/.test(s)) bad.push(e.id); } check('0. 學姊碩三：美國路線的台詞沒有「重點是」', !bad.length, bad.join(',')); }

  // ---------- 2-Y4-16 US1 抵達 ----------
  fresh('2028-08-02',13,'airport_dep',{EXCHANGE_ROUTE:'US',US_DEPARTED:true}); date('heroine_05'); await EXCH.fly(GM); await new Promise(r=>setTimeout(r,5));
  check('U1. 交往中：登機 → 巴士站「十九個小時。」→ 超市「雞蛋要自己看日期」→ 亞洲超市「這是鄉愁。」→ 公寓門口 → 21:30 打給媽媽', has('十九個小時。……我在飛機上把論文第三章看完了。')&&has('這裡的雞蛋要自己看日期。我出發前查過了。')&&has('……這個不算浪費。這是鄉愁。')&&has('……有事打給我。同一個社區，走路五分鐘。')&&has('（你打給媽媽。台灣是早上九點半，她說她剛好醒了。）'), JSON.stringify(lines().slice(0,4)));
  check('U1. 走過的區域：社區 → 草原超市 → 竹葉亞洲超市 → 公寓 214；時間 21:30；US1＝together；加入「交換生」群組', JSON.stringify(entered)===JSON.stringify(['us_outside','us_market','us_asian_market','us_apartment'])&&Math.abs(G.hour-21.5)<1e-6&&G.flags.US1==='together'&&PHONE.inGroup(G,'us_exchange'), JSON.stringify({entered,h:G.hour}));
  check('U1. 門口沒有「一，二，三」的條列（裁定第 6 點）；BCG-14 還沒重畫＝不放', !sisSaid().some(t=>/一，|二，|三，/.test(t))&&!cgs.includes('cg_bus_station_heroine05'));
  CG_REGISTRY.cg_bus_station_heroine05={file:'x.webp',title:'t'}; fresh('2028-08-02',13,'airport_dep',{EXCHANGE_ROUTE:'US',US_DEPARTED:true}); date('heroine_05'); await EXCH.fly(GM);
  const oldCG=cgs.includes('cg_bus_station_heroine05'); CG_REGISTRY.cg_bus_station_heroine05.redrawn=true; fresh('2028-08-02',13,'airport_dep',{EXCHANGE_ROUTE:'US',US_DEPARTED:true}); date('heroine_05'); await EXCH.fly(GM);
  check('U1. 舊的 BCG-14 登錄了也不放；標 redrawn 以後才放', !oldCG&&cgs.includes('cg_bus_station_heroine05')); delete CG_REGISTRY.cg_bus_station_heroine05;
  fresh('2028-08-02',13,'airport_dep',{EXCHANGE_ROUTE:'US',US_DEPARTED:true}); await EXCH.fly(GM);
  check('U2. 挽回中：「超市在那邊。……你自己會找吧。」；沒有超市、公寓那兩段；人在社區入口；還沒打給媽媽', has('超市在那邊。……你自己會找吧。')&&!has('十九個小時。……我在飛機上把論文第三章看完了。')&&JSON.stringify(entered)===JSON.stringify(['us_outside'])&&G.flags.US1==='alone'&&!G.events.done.ev_us1_mom&&toasts.includes('公寓在社區的另一頭。'), JSON.stringify(lines()));
  check('U2. 睡著也會在 21:30 醒來（打給媽媽）', STORY.lawWakeAt(G)===21.5);
  G.hour=21.6; said=[]; await tick();
  check('U2. 21:30：打給媽媽（所有美國路線）', has('（行李箱上貼著媽媽的便條：「到了打電話。不管幾點。」）')&&!!G.events.done.ev_us1_mom);
  fresh('2028-08-02',13,'airport_dep',{EXCHANGE_ROUTE:'TW',US_DEPARTED:true}); check('U. 台灣路線：沒有 US1', !R2Y4A.us1Due(G));

  // ---------- 2-Y4-17 US2 ----------
  fresh('2028-09-13',17.9,'us_apartment',US()); date('heroine_05'); rules(); check('V0. 17:54 還沒有訊息', !PHONE.sent(G,'us2_msg'));
  G.hour=18.05; rules(); check('V1. 18:00 私訊兩則', JSON.stringify(txt('p:heroine_05'))===JSON.stringify(['heroine_05:報告被退回來了。','heroine_05:……我在煮麵。C 棟，廚房。要不要吃。']), JSON.stringify(txt('p:heroine_05')));
  await GM.enter('us_shared'); G.hour=18.6; E.player.seat={x:0,z:0,lift:0.31}; await tick();
  check('V1. 坐到高腳椅＝開始；道具打開（z.us2）；「被說中了。」；第三個選項「書瑀，休息一下。」；US2＝there', E.zone.us2On===true&&has('（笑出來）……被說中了。')&&opts[0]&&opts[0][2]==='「書瑀，休息一下。」'&&G.flags.US2==='there', JSON.stringify(opts));
  at('2028-10-18',21.1); rules(); check('V1. 10/18 21:00「改過的報告拿了 A。」', txt('p:heroine_05').includes('heroine_05:改過的報告拿了 A。教授說：『這次我讀到妳了。』'));
  fresh('2028-09-13',18.1,'us_apartment',US()); date('heroine_05'); rules(); G.hour=19.6; rules(); G.hour=20.1; rules(); check('V1. 交往中、沒到：20:00「麵我吃完了。」', txt('p:heroine_05').includes('heroine_05:麵我吃完了。報告我自己再改一次。')&&G.flags.US2==='missed');
  fresh('2028-09-13',18.5,'us_shared',US()); E.player.seat={lift:0.31}; await tick(); check('V2. 挽回中 18:30 坐在高腳椅：不演交往中那一版', !has('（笑出來）……被說中了。'));
  fresh('2028-09-13',19.0,'us_outside',US()); picks=['還沒']; await tick();
  check('V2. 挽回中 19:00 人在社區＝帶到 C 棟：還鍋子；「你吃過了嗎？」；選「還沒。」＝REPAIR +1', entered.includes('us_shared')&&has('……你吃過了嗎？')&&has('（她把那一把麵放回鍋子裡。你在窗口外的高腳椅坐下。）')&&G.flags.US2==='repair'&&G.flags.REPAIR.heroine_05===1, JSON.stringify({entered,R:G.flags.REPAIR}));

  // ---------- 2-Y4-18 芝加哥 ----------
  fresh('2028-11-03',21.1,'us_apartment',US()); date('heroine_05'); rules();
  check('C0. 沒有 MET_LONG：「香港來的那個同學也去，我們一起認識他。」＋去／這週不行', txt('p:heroine_05').join('|')==='heroine_05:下週末去芝加哥。巴士早上七點出發，帶厚外套。|heroine_05:香港來的那個同學也去，我們一起認識他。'&&PHONE.byAsk(G,'us_chi').ask.opts.length===2);
  fresh('2028-11-03',21.1,'us_apartment',US({MET_LONG:true})); date('heroine_05'); rules(); answer('us_chi',0); rules();
  const qc=OUT.get(G,'us_chicago'); check('C1. 有 MET_LONG：「……我們去驗證。」；去＝11/11 07:00 出遊', txt('p:heroine_05').includes('heroine_05:何俊朗也去。他說他知道哪一家的披薩最好吃。……我們去驗證。')&&!!qc&&qc.day===D('2028-11-11')&&qc.h===7);
  at('2028-11-11',6.9); said=[]; await OUT.go(GM,qc);
  check('C1. 第一天「……今天不照表。」何俊朗「還好。」「……法律系的回答。」；第二天博物館「……我只是想讀完。」；回程她睡著了；CHICAGO_TRIP；回到 11/12 晚上', has('……今天不照表。')&&said.some(s=>s.who==='何俊朗'&&s.t==='還好。')&&has('……法律系的回答。')&&said.some(s=>s.who==='何俊朗'&&s.t==='妳每一塊都要讀？')&&has('……我只是想讀完。')&&has('（回程的巴士上，她睡著了。行程表還在她的外套口袋裡。）')&&SOCIAL.has('heroine_05','CHICAGO_TRIP')&&G.day===D('2028-11-12')&&G.hour>=21.5&&G.hour<23, JSON.stringify({d:CALENDAR.dateOf(G.day).key,h:G.hour}));
  check('C3. 沒有「一，二，三」的邀約、沒有「重點是」', !sisSaid().some(t=>/一，|重點是/.test(t))&&!txt('p:heroine_05').some(t=>/一，|重點是/.test(t)));
  fresh('2028-11-03',21.1,'us_apartment',US()); date('heroine_05'); rules(); answer('us_chi',1); rules(); at('2028-11-12',21.1); rules();
  check('C2. 這週不行：11/12 三張照片＋「下次一起。」；沒有 CHICAGO_TRIP', txt('p:heroine_05').slice(-4).join('|')==='heroine_05:📷（湖邊的風）|heroine_05:📷（博物館的恐龍）|heroine_05:📷（深盤披薩）|heroine_05:下次一起。'&&!SOCIAL.has('heroine_05','CHICAGO_TRIP'));
  fresh('2028-11-03',21.1,'us_apartment',US()); rules(); check('C. 挽回中：群組「下週末有人要去芝加哥嗎。巴士早上七點。」', txt('g:us_exchange').includes('heroine_05:下週末有人要去芝加哥嗎。巴士早上七點。'));
  answer('us_chi',1); rules(); check('C. 挽回中：在群組回了＝REPAIR +1', G.flags.REPAIR&&G.flags.REPAIR.heroine_05===1);

  // ---------- 2-Y4-19 US3 ----------
  fresh('2028-11-22',21.1,'us_apartment',US()); date('heroine_05'); SOCIAL.remember('heroine_05','CHICAGO_TRIP',''); rules(); const ql=OUT.get(G,'us3_lake');
  check('L1. 11/22 21:00 私訊「九點，會所門口。」；排 11/23 09:00 出遊', txt('p:heroine_05').includes('heroine_05:明天開始放感恩節。氣象說會下雪。我想去湖邊看。九點，會所門口。')&&!!ql&&ql.h===9);
  at('2028-11-23',8.8); said=[]; await OUT.go(GM,ql);
  check('L1. 交往中、去過芝加哥：「這次乾脆不寫。」；手機上的清單；「那是我的句型。」；「跟你。」', has('上次在芝加哥，我把行程表摺起來了。這次乾脆不寫。')&&has('（她把手機給你看。上面寫著：一，睡到自然醒。二，不看信。三，）')&&has('（愣住，然後笑出來）……那是我的句型。')&&has('（打字，停了一下，又加兩個字）跟你。')&&G.flags.US3==='two');
  fresh('2028-11-22',21.1,'us_apartment',US()); rules(); at('2028-11-23',8.8); picks=[0]; said=[]; await OUT.go(GM,OUT.get(G,'us3_lake'));
  check('L2. 挽回中：「分手那天，你沒有解釋。」二選一；「那妳想因為什麼？」＝REPAIR +1', has('分手那天，你沒有解釋。')&&opts[0].length===2&&has('……因為你在這裡這三個月的樣子。')&&G.flags.REPAIR.heroine_05===1&&G.flags.US3==='repair');
  fresh('2028-11-22',21.1,'us_apartment',US()); date('heroine_05'); rules(); at('2028-11-23',9.5); await outTick(); at('2028-11-23',10.1); rules();
  check('L. 交往中、09:15 沒到：10:00「我自己去了。……下雪了。拍給你。」', txt('p:heroine_05').includes('heroine_05:我自己去了。……下雪了。拍給你。')&&G.flags.US3==='missed');

  // ---------- 2-Y4-20 初雪 ----------
  fresh('2028-12-02',18.1,'us_apartment',US()); date('heroine_05'); rules(); const qs=OUT.get(G,'us_snow');
  check('N0. 交往中 18:00 兩則；排 20:00 小教堂台階', txt('p:heroine_05').join('|')==='heroine_05:今晚會下今年第一場真的會積起來的雪。|heroine_05:八點，小教堂前面的台階。'&&!!qs&&qs.h===20);
  at('2028-12-02',19.9); picks=[0]; said=[]; await OUT.go(GM,qs);
  check('N1. 再問一次：「你怎麼會問第二次。」；SIS_ASKED_TWICE；計畫本寫「雪」（回公寓以前）', has('……你怎麼會問第二次。')&&G.flags.SIS_ASKED_TWICE===true&&has('（她把計畫本闔起來。那一格寫的是「雪」。）')&&has('（回公寓以前，她翻開計畫本，在 12 月 2 日那一格寫了一個字。）')&&G.flags.US_SNOW==='together');
  fresh('2028-12-02',18.1,'us_apartment',US()); date('heroine_05'); rules(); at('2028-12-02',19.9); picks=[1]; await OUT.go(GM,OUT.get(G,'us_snow')); at('2028-12-03',8.3); rules();
  check('N1. 不問了：隔天 08:10「昨天你問我還好嗎。」；沒有 SIS_ASKED_TWICE', txt('p:heroine_05').includes('heroine_05:昨天你問我還好嗎。……其實不太好。回去再跟你說。')&&!G.flags.SIS_ASKED_TWICE);
  fresh('2028-12-02',18.1,'us_apartment',US()); date('heroine_05'); rules(); at('2028-12-02',20.3); picks=[1]; await outTick();
  check('N4. 交往中 20:15 沒到：20:30「我還在台階上。雪還沒停。」', OUT.get(G,'us_snow').state==='missed'&&!!OUT.get(G,'us_snow2'));
  at('2028-12-02',21.6); await outTick(); rules(); said=[]; await tick();
  check('N4. 21:30 還沒到＝帶到場：「你還是去了。」接原台詞', has('（你還是去了。雪下得很小，她坐在台階最上面一階。）')&&has('剛買的。……還燙。')&&G.flags.US_SNOW==='together'&&txt('p:heroine_05').includes('heroine_05:我還在台階上。雪還沒停。'), JSON.stringify(lines().slice(0,2)));
  fresh('2028-12-02',18.1,'us_apartment',US({REPAIR:{heroine_05:3}})); rules(); check('N2. 挽回中 18:00 群組「今晚會積雪」；睡著也會 20:00 醒來', txt('g:us_exchange').some(t=>/今晚會積雪$/.test(t))&&STORY.lawWakeAt(G)===20);
  at('2028-12-02',20.1); said=[]; await tick();
  check('N2. 挽回中、REPAIR 3：20:00 自動到場；「這次我先說。」→ 重新交往', has('如果你還想的話，我們重新開始。這次我先說。')&&G.flags.dating_heroine_05===true&&ROM.get(G,'heroine_05').status==='dating'&&G.flags.US_SNOW==='restart');
  fresh('2028-12-02',18.1,'us_apartment',US({REPAIR:{heroine_05:2}})); rules(); at('2028-12-02',20.1); said=[]; await tick();
  check('N3. 挽回中、REPAIR 2：前三句＋「……回去吧，會冷。」', has('……我在臺灣，從來沒看過雪。')&&has('……回去吧，會冷。')&&!has('如果你還想的話，我們重新開始。這次我先說。')&&!G.flags.dating_heroine_05&&G.flags.US_SNOW==='cold');

  // ---------- 2-Y4-21 會所晚餐 ----------
  fresh('2028-12-13',21.1,'us_apartment',US()); date('heroine_05'); rules(); check('D0. 12/13 21:00 群組；三選一帶什麼', txt('g:us_exchange').includes('heroine_05:明天晚上七點，會所。學期最後一頓。每個人帶一道菜。')&&PHONE.byAsk(G,'us_club').ask.opts.length===3);
  answer('us_club',0); at('2028-12-14',18.9); G.zone='us_outside'; said=[]; const hit=await STORY.interact({usClub:'door',label:'會所',look:'x'},GM);
  check('D1. 會所門口（usClub:door）：帶的菜一句（學姊的室友）；舉杯「……謝謝你們這一學期。」；沒有她說的條列', hit===true&&said.some(s=>s.who==='學姊的室友'&&s.t==='這是什麼？……好香。')&&has('……謝謝你們這一學期。')&&!sisSaid().some(t=>/一，|二，/.test(t))&&G.flags.US_CLUB_DINNER==='went');
  fresh('2028-12-13',21.1,'us_apartment',US()); rules(); at('2028-12-14',20.2); await outTick(); at('2028-12-14',21.6); rules();
  check('D2. 沒去：21:30 群組「你的那一份，有人幫你留了。」', txt('g:us_exchange').includes('heroine_05:你的那一份，有人幫你留了。')&&G.flags.US_CLUB_DINNER==='missed');

  // ---------- 2-Y4-22 離開、舊金山、回臺灣 ----------
  fresh('2028-12-15',23,'us_apartment',US()); date('heroine_05'); check('R0. 12/16 鬧鐘 06:30（07:00 社區門口）', STORY.wakeAlarms(G,D('2028-12-16')).some(a=>a.h===6.5));
  at('2028-12-16',7.05); room409=0; said=[]; await tick();
  check('R1. 交往中：社區門口 → SF1「這一週，你排。」→ SF2 霧裡的大橋 → SF3 老書店 → 照片三天', has('（天還沒亮。社區門口停著機場巴士。）')&&has('這一週，你排。')&&has('……走得過去嗎。')&&has('（她買了那本詩集。）')&&has('寄給家族了。Kevin 收到會說我終於寫超過三句。')&&G.flags.SF_DONE===true, JSON.stringify(lines().slice(0,3)));
  check('R1. 12/23 05:40 桃園：「伯母好。……我是書瑀。」沒有「伯父」；車上三句不編號；下車訊息「第二句是反的」；上午回家；接 409', has('伯母好。……我是書瑀。')&&!said.some(s=>/伯父/.test(s.t))&&has('……他在美國很照顧我。')&&txt('p:heroine_05').includes('heroine_05:……第二句是反的。是我照顧你。')&&has('你回來了。')&&G.flags.CAME_BACK_TOGETHER===true&&G.flags.US_RETURNED===D('2028-12-23')&&G.flags.US_RETURN===D('2028-12-23')&&room409===1, JSON.stringify({d:CALENDAR.dateOf(G.day).key,r:room409}));
  check('R3. 學姊沒有說出口的「一，二，三」', !sisSaid().some(t=>/一，|二，|三，/.test(t)));
  at('2028-12-23',20.1); rules(); check('R1. 20:00 阿凱「回來了？」三則＋兩個回覆', txt('p:kai').join('|')==='kai:回來了？|kai:所以時差調了沒|kai:宵夜 我在宿舍樓下'&&PHONE.byAsk(G,'msg_kai_back_us').ask.opts.length===2);
  fresh('2028-12-16',7.05,'us_outside',US()); room409=0; said=[]; await tick();
  check('R2. 挽回不成：布魯明頓三天（12/16、12/18、12/20）＋12/21 巴士；「你看見她先走了。」；沒有舊金山', has('（社區很安靜。你把冰箱裡剩下的東西煮成一鍋。）')&&has('（行李箱合上了。你坐在上面，才拉得上拉鍊。）')&&has('（學姊也在這一班，坐在前面。）')&&has('（你們同一班飛機回來。她坐在前面幾排，下飛機的時候，你看見她先走了。）')&&!has('這一週，你排。')&&!G.flags.CAME_BACK_TOGETHER&&room409===1);
  fresh('2028-12-16',7.05,'us_outside',US({MET_LONG:true})); date('heroine_05'); picks=[1]; said=[]; await tick();
  check('R. 有 MET_LONG：12/16 何俊朗「……香港見？」二選一（「還好。」→「……你又來了。」）', has('我的飛機比你早。……香港見？')&&has('……你又來了。'));

  // ================= 大四上（臺灣這邊）=================
  const TWF=f=>Object.assign({EXCHANGE_ROUTE:'TW'},f||{});
  const join=(g,n)=>PHONE.join(G,g,n);
  // ---------- 2-Y4-01 迎新 ----------
  fresh('2028-08-31',21.1,'dorm',TWF()); join('law_class','法律系（全班）'); rules(); const qw=OUT.get(G,'y4_welcome');
  check('W1. 8/31 21:00 系學會「禮拜六迎新，一點在社科院旁的草地集合。大四的學長姊有空也來。」；排 9/2 13:00', txt('g:law_class').includes('law_assoc:禮拜六迎新，一點在社科院旁的草地集合。大四的學長姊有空也來。')&&!!qw&&qw.h===13&&qw.day===D('2028-09-02'));
  at('2028-09-02',12.6); picks=[1]; said=[]; await OUT.go(GM,qw);
  check('W1. 去了：「學長，你帶他過去好了。」；三選一；「看你想做什麼。」→「那先念民總。」；萬才館門口', has('學長，你帶他過去好了。')&&opts[0].length===3&&has('那先念民總。')&&has('（萬才館門口。他說了謝謝，跑回草地。）')&&G.flags.WELCOME_Y4==='went');
  fresh('2028-08-31',21.1,'dorm',US({US1:'together'})); join('law_class','法律系（全班）'); rules(); check('W2. 美國路線：沒有邀約', !PHONE.sent(G,'y4_welcome_ask'));
  at('2028-09-02',9.6); rules(); check('W2. 美國路線：只有照片（臺灣 21:30＝當地 09:30）', txt('g:law_class').includes('law_assoc:📷（新生坐在第一排，手上拿著名牌。）')&&G.flags.WELCOME_Y4==='missed');
  // ---------- 2-Y4-02 颱風 ----------
  check('T0. calendar：2028-09-18 颱風假', CALENDAR.typhoon(D('2028-09-18'))===true);
  fresh('2028-09-17',20.1,'dorm',TWF({JOB_CVS:true})); join('law_class','法律系（全班）'); R('yu','FAM'); R('classmate_xinci','FAM'); R('classmate_bohan','FRI'); rules();
  check('T1. 9/17 20:00 停課公告', (G.msgs||[]).some(m=>m.text==='颱風假：明天（9/18）停班停課。'));
  at('2028-09-17',21.2); const ty=ev('ev_y4_typhoon_noodle'); check('T1. 21:00 以後人在 409：可以演 T4a', EVENTS.check(ty));
  picks=[0]; await run('ev_y4_typhoon_noodle');
  check('T1. 「熱水只剩這些。」；做過便利商店夜班：選便利商店 →「今年要三碗吧？」', has('熱水只剩這些。一人一碗。')&&has('今年要三碗吧？')&&G.flags.TYPHOON_Y4==='noodle');
  at('2028-09-18',8.1); rules();
  check('T3. 9/18 08:00：老師的信（9/17 21:30 寄的）＋群組「這是本學期最強制的一封信。」「颱風可以聲明異議嗎？」＋回覆', (G.msgs||[]).some(m=>m.text==='報告的期限不會停。照舊。'&&m.day===D('2028-09-17'))&&txt('g:law_class').includes('yu:這是本學期最強制的一封信。')&&!!PHONE.byAsk(G,'y4_ty_reply'));
  answer('y4_ty_reply',0); check('T3. 回「颱風不是當事人。」→ 芯慈「……這句可以寫進報告。」', txt('g:law_class').includes('classmate_xinci:……這句可以寫進報告。'));
  fresh('2028-09-17',21.2,'dorm',US()); rules(); check('T2. 美國路線：9/17、9/18 都沒有', !EVENTS.check(ev('ev_y4_typhoon_noodle'))&&!PHONE.sent(G,'y4_ty_notice'));
  // ---------- 2-Y4-03 中秋 ----------
  fresh('2028-10-02',21.1,'dorm',TWF()); join('noodle_team','麵店團'); R('yu','FAM'); R('heroine_01','FAM'); G.events.done.ev_y2_midautumn=1; rules(); const qm=OUT.get(G,'y4_midautumn');
  check('M0. 10/2 21:00 阿哲「明天中秋 河濱 六點」「烤肉架我借好了」；排 10/3 18:00', txt('g:noodle_team').join('|')==='zhe:明天中秋 河濱 六點|zhe:烤肉架我借好了'&&!!qm&&qm.h===18);
  at('2028-10-03',17.8); picks=[0]; said=[]; await OUT.go(GM,qm);
  check('M1. 大二中秋去過：「又來了。」；以安「……我贊成。」；「明年還是要回來烤。」二選一', has('又來了。')&&has('……我贊成。')&&!has('我贊成。理由：公平。')&&has('明年還是要回來烤。')&&opts[0].length===2&&has('說好了喔。')&&G.flags.MIDAUTUMN_Y4==='went');
  fresh('2028-10-03',17.8,'dorm',TWF({KX_MET_NOODLE_TEAM:true})); date('kexin'); said=[]; await run('ev_y4_midautumn');
  check('M2. 和可昕交往、見過麵店團：「……今年我認輸。我只想吃。」', has('……今年我認輸。我只想吃。')&&has('可昕認輸了！大家記下來！'));
  fresh('2028-10-02',21.1,'us_apartment',US()); join('noodle_team','麵店團'); date('kexin'); rules(); at('2028-10-03',7.6); rules();
  check('M3. 美國路線：19:30（當地 07:30）照片；可昕「阿哲今年贏了。」', txt('g:noodle_team').includes('zhe:📷（河濱，兩個烤肉架，一支夾子插在玉米上。）')&&txt('g:noodle_team').includes('kexin:阿哲今年贏了。……你不在，我沒力氣講冷笑話。')&&!PHONE.sent(G,'y4_ma_ask'));
  // ---------- 2-Y4-07 校慶 ----------
  fresh('2028-11-11',12,'campus',TWF({lawclub:true,GRANDMA_TREE_Y2:'asked'})); E.player.obj.position={x:-17.8,y:0,z:13.0};
  check('F1. 法服成員、11/11 中午在攤位：攤位裡那一版', EVENTS.check(ev('ev_fair_booth_y4'))&&!EVENTS.check(ev('ev_fair_booth_y4_pass')));
  picks=[0]; await run('ev_fair_booth_y4'); check('F1. 大二遇過阿嬤：「法律說是我的。給你們。」；二選一', has('法律說是我的。給你們。')&&has('有啦。掉過來的給我，樹枝他自己剪。')&&G.flags.GRANDMA_Y4==='booth');
  fresh('2028-11-11',12,'campus',TWF()); const fp=EVENTS.check(ev('ev_fair_booth_y4_pass'))&&!EVENTS.check(ev('ev_fair_booth_y4')); await run('ev_fair_booth_y4_pass'); check('F2. 不是成員、沒遇過：路過那一版；「給你們。不用登記。」；沒有選項', fp&&has('給你們。不用登記。')&&opts.length===0&&G.flags.GRANDMA_Y4==='pass');
  fresh('2028-11-11',12,'campus',US({lawclub:true})); check('F3. 美國路線：沒有', !EVENTS.check(ev('ev_fair_booth_y4'))&&!EVENTS.check(ev('ev_fair_booth_y4_pass')));
  // ---------- 2-Y4-08 讀書會交棒 ----------
  fresh('2028-11-30',20,'wancai',TWF()); R('yu','FAM'); R('heroine_01','FRI'); ACTIVITIES.rec(G); for(const k of [10,20,30]) G.acts.att['public_law_group@'+(G.day-k)]={h:20,end:'full'};
  const plg=ACTIVITIES.list.find(a=>a.id==='public_law_group'); check('H0. 公法讀書會大四上開到第 13 週（11/30）', ACTIVITIES.on(plg,G.day,G)&&!ACTIVITIES.on(plg,D('2028-12-07'),G));
  const ce=CLS.clubEvent(G,plg); check('H1. 去過 3 次、11/30 去讀書會：這一場就是交棒', !!ce&&ce.id==='ev_plg_handover', ce&&ce.id);
  picks=[0]; await run('ev_plg_handover'); check('H1. 白板只剩「說理由。」；「例外，要說理由。」；拍照＝PLG_LAST_RULE', has('（對學弟妹）規則只有一條。例外，要說理由。')&&has('妳以前有十條。')&&SOCIAL.has('heroine_01','PLG_LAST_RULE')&&G.flags.PLG_HANDOVER==='there');
  fresh('2028-11-30',22.1,'dorm',TWF()); join('noodle_team','麵店團'); R('yu','FAM'); R('heroine_01','FRI'); rules();
  check('H2. 沒去：22:00 小語的白板照片「以安交棒了。白板只剩一條。」', txt('g:noodle_team').join('|')==='yu:📷（白板，只剩一行字）|yu:以安交棒了。白板只剩一條。'&&G.flags.PLG_HANDOVER==='heard');
  // ---------- 2-Y4-10 聖誕 ----------
  fresh('2028-12-21',21.1,'dorm',TWF({XMAS_GIFT:'notebook'})); join('noodle_team','麵店團'); R('yu','FAM'); rules(); const qx=OUT.get(G,'y4_xmas');
  check('X0. 12/21 21:00「明天考完 聖誕交換禮物」「七點 麵店 一百五以內」；排 12/22 19:00', txt('g:noodle_team').join('|')==='zhe:明天考完 聖誕交換禮物|zhe:七點 麵店 一百五以內'&&!!qx&&qx.h===19);
  at('2028-12-22',18.8); said=[]; await OUT.go(GM,qx);
  check('X1. 大一送過筆記本：抽到一本幾乎一樣的筆記本；小語「這是詛咒吧。」；阿姨「考完了，吃好一點。」', has('（你抽到的是一本小筆記本。和你三年前帶來的那一個，幾乎一樣。）')&&has('（抱著一個巨大的玩偶）這是詛咒吧。')&&has('考完了，吃好一點。')&&G.flags.XMAS_Y4==='went', JSON.stringify(lines().slice(-5)));
  fresh('2028-12-21',21.1,'us_outside',US()); join('noodle_team','麵店團'); rules(); at('2028-12-22',8.6); rules();
  check('X2. 美國路線：沒有邀約；21:30（當地 08:30）照片', !PHONE.sent(G,'y4_xmas_ask')&&txt('g:noodle_team').includes('zhe:📷（每個人手上的禮物，都很眼熟。）'));

  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

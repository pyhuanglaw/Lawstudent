// 事件包第 2 輪之三（前半）AA_327 2-Y4-01～29（src/data/r2y4a_events.js、src/r2y4a3d.js）——不需要瀏覽器。照 AA 給 BB 的驗收情境寫（每件至少一項）。
//   美國路線：U1～U2 抵達、V1～V2 US2、C1～C3 芝加哥、L1～L2 湖邊、N1～N4 初雪、D1～D2 會所晚餐、R1～R3 離開與回臺灣、G 美國路線的 CG（登錄了才放）。
//   大四上：W 迎新、T 颱風、M 中秋、P 再問一次、E 語彤 15b、U／IV 推甄、F 校慶、H 交棒、S 語彤 16、X 聖誕、Z 芷若第二輪明信片、B 回來、K 可昕 K21／K22、I 可昕的實習。
//   寒假：A 學姊接機、XK 可昕聖誕、GR 期末成績、KH 高雄、EX 以安考前一晚＋筆試、Y 除夕、V 情人節。
// 修改前：沒有這些事件（第 0 項 FAIL，之後全部不跑）。用法：node tests/r2y4a_events_unit.js
// AA_370（企劃線 a1dc3e61，2026-10-21）改了期待的三項：R1 回國入境大廳（M5：見過媽媽的版本、九點是旁白）、M3 中秋（M7：可昕沒見過麵店團改私訊）、Z2（M1：8/20 不再要地址）——細測在 tests/aa370_us_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|EXCH|R2Y4A|R2Y4A_EVENTS|SYLLABUS|TERMEND|TERMEND_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/termend_lines.js','src/termend3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/exchange3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
const warns=[]; { const w0=console.warn; console.warn=(...a)=>{ warns.push(a.map(String).join(' ')); w0.apply(console,a); }; }   /* 掛勾裡出錯會被 try/catch 吞掉：記下來，最後檢查 */
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
const seq=(arr,exp)=>{ for(let i=0;i+exp.length<=arr.length;i++) if(exp.every((x,j)=>arr[i+j]===x)) return true; return false; };   /* exp 在 arr 裡連續出現 */
const sisSaid=()=>said.filter(s=>s.who&&/學姊|書瑀|溫書瑀/.test(s.who)).map(s=>s.t);
(async()=>{
  const IDS=['ev_us1_arrive','ev_us1_market','ev_us1_asian','ev_us1_door','ev_us1_mom','ev_us2_kitchen','ev_us2_repair','ev_us_chicago','ev_us_chicago2','ev_us3_lake','ev_us_first_snow','ev_us_snow_repair','ev_us_club_dinner','ev_us_leave','ev_sf1','ev_sf2','ev_sf3','ev_sf_photo17','ev_sf_photo19','ev_sf_photo21','ev_us_bloom16','ev_us_bloom18','ev_us_bloom20','ev_us_bus21','ev_us_return','ev_us_home'];
  check('0. 美國路線的事件都在、R2Y4A 掛上去了（PHONE_RULES、TICKS、WAKE_AT、ALARMS、STORY.interact、EXCH.onArrive／onLand）', typeof R2Y4A!=='undefined'&&IDS.every(id=>!!ev(id))&&STORY.TICKS.length>0&&STORY.PHONE_RULES.length>0&&STORY.WAKE_AT.length>0&&STORY.ALARMS.length>0&&!!STORY._r2y4aInteract&&typeof EXCH.onArrive==='function'&&typeof EXCH.onLand==='function', JSON.stringify(IDS.filter(id=>!ev(id))));
  check('AA_448 第 2 節：12/2 初雪兩場開頭不用白天秋景 us_chapel_steps（下雪的晚上那張圖來以前用 dark）', ['ev_us_first_snow','ev_us_snow_repair'].every(id=>{ const d=ev(id).dialogue[0]; return d.scene==='小教堂前的台階'&&d.bg==='dark'; }));
  if(fails){ console.log('FAILED '+fails); process.exit(1); }
  { const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=h.indexOf('src/group3d.js'), b=h.indexOf('src/data/r2y4a_events.js'), c=h.indexOf('src/r2y4a3d.js'), z=h.indexOf('GAME.boot()'), x=h.indexOf('src/exchange3d.js'), u=h.indexOf('src/us3d.js');
    check('0. index.html：exchange3d.js、us3d.js 之後，group3d.js → data/r2y4a_events.js → r2y4a3d.js → GAME.boot()', x>0&&u>x&&a>u&&b>a&&c>b&&z>c); }
  { const bad=[]; for(const e of R2Y4A_EVENTS){ const s=JSON.stringify(e.dialogue); if(/重點是/.test(s)) bad.push(e.id); } check('0. 學姊碩三：美國路線的台詞沒有「重點是」', !bad.length, bad.join(',')); }

  // ---------- 2-Y4-16 US1 抵達 ----------
  fresh('2028-08-02',13,'airport_dep',{EXCHANGE_ROUTE:'US',US_DEPARTED:true}); date('heroine_05'); await EXCH.fly(GM); await new Promise(r=>setTimeout(r,5));
  check('U1. 交往中：登機 → 巴士站「十九個小時。」→ 超市「雞蛋要自己看日期」→ 亞洲超市「……我在研究室常吃這一種。」（AA_450 1-1，原「這是鄉愁。」）→ 公寓門口 → 21:30 打給媽媽', has('十九個小時。……我在飛機上把論文第三章看完了。')&&has('這裡的雞蛋要自己看日期。我出發前查過了。')&&has('……我在研究室常吃這一種。')&&!has('……這個不算浪費。這是鄉愁。')&&has('……有事打給我。同一個社區，走路五分鐘。')&&has('（你打給媽媽。台灣是早上九點半，她說她剛好醒了。）'), JSON.stringify(lines().slice(0,4)));
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
  at('2028-10-15',21.1); rules(); const v1early=txt('p:heroine_05').includes('改過的報告拿了 A。'); at('2028-10-16',21.1); rules(); check('V1. 10/16 21:00「改過的報告拿了 A。」（AA_340 第 11 週：日子新；10/15 還沒有）', !v1early&&txt('p:heroine_05').includes('heroine_05:改過的報告拿了 A。教授說：『這次我讀到妳了。』'));
  fresh('2028-09-13',18.1,'us_apartment',US()); date('heroine_05'); rules(); G.hour=19.6; rules(); G.hour=20.1; rules(); check('V1. 交往中、沒到：20:00「麵我吃完了。」', txt('p:heroine_05').includes('heroine_05:麵我吃完了。報告我自己再改一次。')&&G.flags.US2==='missed');
  fresh('2028-09-13',18.5,'us_shared',US()); E.player.seat={lift:0.31}; await tick(); check('V2. 挽回中 18:30 坐在高腳椅：不演交往中那一版', !has('（笑出來）……被說中了。'));
  fresh('2028-09-13',19.0,'us_outside',US()); picks=['還沒']; await tick();
  check('V2. 挽回中 19:00 人在社區＝帶到 C 棟：還鍋子；「你吃過了嗎？」；選「還沒。」＝REPAIR +1', entered.includes('us_shared')&&has('……你吃過了嗎？')&&has('（她把那一把麵放回鍋子裡。你在窗口外的高腳椅坐下。）')&&G.flags.US2==='repair'&&G.flags.REPAIR.heroine_05===1, JSON.stringify({entered,R:G.flags.REPAIR}));

  // ---------- 2-Y4-18 芝加哥 ----------
  fresh('2028-11-03',21.1,'us_apartment',US()); date('heroine_05'); rules();
  check('C0. 沒有 MET_LONG：「香港來的那個同學也去，我們一起認識他。」＋去／這週不行', txt('p:heroine_05').join('|')==='heroine_05:下週末去芝加哥。巴士早上七點出發，帶厚外套。|heroine_05:香港來的那個同學也去，我們一起認識他。'&&PHONE.byAsk(G,'us_chi').ask.opts.length===2);
  fresh('2028-11-03',21.1,'us_apartment',US({MET_LONG:true})); date('heroine_05'); rules(); answer('us_chi',0); rules();
  const qc=OUT.get(G,'us_chicago'); check('C1. 有 MET_LONG：「……到了再看。」（AA_450 1-6，原「……我們去驗證。」是可昕的話）；去＝11/11 07:00 出遊', txt('p:heroine_05').includes('heroine_05:何俊朗也去。他說他知道哪一家的披薩最好吃。……到了再看。')&&!txt('p:heroine_05').some(t=>t.includes('我們去驗證'))&&!!qc&&qc.day===D('2028-11-11')&&qc.h===7);
  at('2028-11-11',6.9); said=[]; await OUT.go(GM,qc);
  { const HAI='（一路上，何俊朗說了好幾次「還好」：巴士、披薩、湖邊的風。每一次聽起來都不一樣。）', i=said.findIndex(s=>s.t===HAI);
    check('C1. AA_345 F10：何俊朗的「還好」是一句旁白（不是他的台詞），接學姊「『還好』是好還是不好？」', i>=0&&said[i].who===null&&said[i+1]&&said[i+1].t==='「還好」是好還是不好？'&&!said.some(s=>s.t==='還好。'), JSON.stringify(lines().slice(0,6))); }
  check('C1. 第一天「……今天不照表。」「……法律系的回答。」；第二天博物館「……我只是想讀完。」；回程她睡著了；CHICAGO_TRIP；回到 11/12 晚上', has('……今天不照表。')&&has('……法律系的回答。')&&said.some(s=>s.who==='何俊朗'&&s.t==='妳每一塊都要讀？')&&has('……我只是想讀完。')&&has('（回程的巴士上，她睡著了。行程表還在她的外套口袋裡。）')&&SOCIAL.has('heroine_05','CHICAGO_TRIP')&&G.day===D('2028-11-12')&&G.hour>=21.5&&G.hour<23, JSON.stringify({d:CALENDAR.dateOf(G.day).key,h:G.hour}));
  check('C3. 沒有「一，二，三」的邀約、沒有「重點是」', !sisSaid().some(t=>/一，|重點是/.test(t))&&!txt('p:heroine_05').some(t=>/一，|重點是/.test(t)));
  fresh('2028-11-03',21.1,'us_apartment',US()); date('heroine_05'); rules(); answer('us_chi',1); rules(); at('2028-11-12',21.1); rules();
  check('C2. 這週不行：11/12 只傳三張照片（AA_450 1-5：「下次一起。」拿掉、第一張「📷（密西根湖，浪很大）」）；沒有 CHICAGO_TRIP', txt('p:heroine_05').slice(-3).join('|')==='heroine_05:📷（密西根湖，浪很大）|heroine_05:📷（博物館的恐龍）|heroine_05:📷（深盤披薩）'&&!txt('p:heroine_05').some(t=>t.endsWith(':下次一起。'))&&!SOCIAL.has('heroine_05','CHICAGO_TRIP'));
  fresh('2028-11-03',21.1,'us_apartment',US()); rules(); check('C. 挽回中：群組「下週末有人要去芝加哥嗎。巴士早上七點。」（AA_450 1-8：沒見過何俊朗＝國際學生會傳）', txt('g:us_exchange').includes('us_isa:下週末有人要去芝加哥嗎。巴士早上七點。')&&!txt('g:us_exchange').some(t=>t.startsWith('heroine_05:')));
  answer('us_chi',1); rules(); check('C. 挽回中：在群組回了＝REPAIR +1', G.flags.REPAIR&&G.flags.REPAIR.heroine_05===1);

  // ---------- 2-Y4-19 US3 ----------
  fresh('2028-11-22',21.1,'us_apartment',US()); date('heroine_05'); SOCIAL.remember('heroine_05','CHICAGO_TRIP',''); rules(); const ql=OUT.get(G,'us3_lake');
  check('L1. 11/22 21:00 私訊「九點，會所門口。」；排 11/23 09:00 出遊', txt('p:heroine_05').includes('heroine_05:明天開始放感恩節。氣象說會下雪。我想去湖邊看。九點，會所門口。')&&!!ql&&ql.h===9);
  at('2028-11-23',8.8); said=[]; await OUT.go(GM,ql);
  check('L1. 交往中、去過芝加哥：「這次乾脆不寫。」；手機上的清單；「那是我的句型。」；「跟你。」', has('上次在芝加哥，我把行程表摺起來了。這次乾脆不寫。')&&has('（她把手機給你看。備忘錄上只有一行：「睡到自然醒」。）')&&has('（愣住，然後笑出來）……你在管我。')&&has('（打字，停了一下，又加兩個字）跟你。')&&G.flags.US3==='two');
  fresh('2028-11-22',21.1,'us_apartment',US()); rules(); at('2028-11-23',8.8); picks=[0]; said=[]; await OUT.go(GM,OUT.get(G,'us3_lake'));
  check('L2. 挽回中：「分手那天，你沒有解釋。」二選一；「那妳想因為什麼？」＝REPAIR +1', has('分手那天，你沒有解釋。')&&opts[0].length===2&&has('……因為你在這裡這三個月的樣子。')&&G.flags.REPAIR.heroine_05===1&&G.flags.US3==='repair');
  fresh('2028-11-22',21.1,'us_apartment',US()); date('heroine_05'); rules(); at('2028-11-23',9.5); await outTick(); at('2028-11-23',10.1); rules();
  check('L. 交往中、09:15 沒到：10:00「我自己去了。氣象說錯了，沒有下雪。」「📷（灰色的湖，岸邊沒有人）」（AA_450 1-9，原「……下雪了。拍給你。」）', txt('p:heroine_05').slice(-2).join('|')==='heroine_05:我自己去了。氣象說錯了，沒有下雪。|heroine_05:📷（灰色的湖，岸邊沒有人）'&&!txt('p:heroine_05').some(t=>t.includes('下雪了。拍給你'))&&G.flags.US3==='missed');

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
  fresh('2028-12-02',18.1,'us_apartment',US({REPAIR:{heroine_05:3}})); rules(); check('N2. 挽回中 18:00 交換生群組：何俊朗「今晚會積雪。」「上次那種落地就化了。這次會積起來。」（AA_345 F10；AA_452 1-2 換字；沒有沒名字的「同學」）；睡著也會 20:00 醒來', seq(txt('g:us_exchange'),['npc_long:今晚會積雪。','npc_long:上次那種落地就化了。這次會積起來。'])&&!(G.msgs||[]).some(m=>m.from==='us_classmate')&&(G.msgs||[]).filter(m=>m.from==='npc_long').every(m=>m.name==='何俊朗')&&STORY.lawWakeAt(G)===20, JSON.stringify(txt('g:us_exchange')));
  at('2028-12-02',20.1); said=[]; picks=[0]; await OUT.go(GM,OUT.get(G,'us_snow_r'));   /* AA_452 1-1：排進行程（19:45 問「出發：初雪」），不再只靠 20:00 自動到場 */
  check('N2. 挽回中、REPAIR 3：出發（行程 us_snow_r）；「這次我先說。」→ 重新交往', has('如果你還想的話，我們重新開始。這次我先說。')&&G.flags.dating_heroine_05===true&&ROM.get(G,'heroine_05').status==='dating'&&G.flags.US_SNOW==='restart');
  fresh('2028-12-02',18.1,'us_apartment',US({REPAIR:{heroine_05:2}})); rules(); at('2028-12-02',20.1); said=[]; await OUT.go(GM,OUT.get(G,'us_snow_r'));
  check('N3. 挽回中、REPAIR 2：前三句＋「……回去吧，會冷。」', has('……我在臺灣，從來沒看過雪。')&&has('……回去吧，會冷。')&&!has('如果你還想的話，我們重新開始。這次我先說。')&&!G.flags.dating_heroine_05&&G.flags.US_SNOW==='cold');

  // ---------- 2-Y4-21 會所晚餐 ----------
  fresh('2028-12-13',21.1,'us_apartment',US()); date('heroine_05'); rules(); check('D0. 12/13 21:00 群組（AA_450 1-8：沒見過何俊朗＝國際學生會傳兩則）；三選一帶什麼掛在最後一則', txt('g:us_exchange').slice(-2).join('|')==='us_isa:明天晚上七點，會所。學期最後一頓。|us_isa:每個人帶一道菜。泡麵也算。'&&PHONE.byAsk(G,'us_club').ask.opts.length===3&&PHONE.byAsk(G,'us_club').text==='每個人帶一道菜。泡麵也算。');
  answer('us_club',0); at('2028-12-14',18.9); G.zone='us_outside'; said=[]; const hit=await STORY.interact({usClub:'door',label:'會所',look:'x'},GM);
  check('D1. 會所門口（usClub:door）：帶的菜一句（學姊的室友）；舉杯「……謝謝你們這一學期。」；沒有她說的條列', hit===true&&said.some(s=>s.who==='學姊的室友'&&s.t==='這是什麼？……好香。')&&has('……謝謝你們這一學期。')&&!sisSaid().some(t=>/一，|二，/.test(t))&&G.flags.US_CLUB_DINNER==='went');
  fresh('2028-12-13',21.1,'us_apartment',US()); rules(); at('2028-12-14',20.2); await outTick(); at('2028-12-14',21.6); rules();
  check('D2. 沒去：21:30 群組「你的那一份，有人幫你留了。」（AA_450 1-8：沒見過何俊朗＝國際學生會）', txt('g:us_exchange').includes('us_isa:你的那一份，有人幫你留了。')&&G.flags.US_CLUB_DINNER==='missed');

  // ---------- 2-Y4-22 離開、舊金山、回臺灣 ----------
  fresh('2028-12-15',23,'us_apartment',US()); date('heroine_05'); check('R0. 12/16 鬧鐘 06:30（07:00 社區門口）', STORY.wakeAlarms(G,D('2028-12-16')).some(a=>a.h===6.5));
  at('2028-12-16',7.05); room409=0; said=[]; await tick();
  check('R1. 交往中：社區門口 → SF1「這一週，你排。」→ SF2 霧裡的大橋 → SF3 老書店 → 照片三天', has('（天還沒亮。社區門口停著機場巴士。）')&&has('這一週，你排。')&&has('……走得過去嗎。')&&has('（她買了那本詩集。）')&&has('寄給家族了。Kevin 收到會說我終於寫超過三句。')&&G.flags.SF_DONE===true, JSON.stringify(lines().slice(0,3)));
  check('R1. 12/23 05:40 桃園：8/2 一起出發見過媽媽＝「（……她笑了一下。）」「阿姨好。……上次的鳳梨酥，很好吃。」（AA_370 M5；不是「伯母好。……我是書瑀。」）、沒有「伯父」；車上三句不編號；下車訊息「第二句是反的」；上午回家（九點是旁白）；接 409', has('（媽媽先看到你，再看到你旁邊的人。她笑了一下。）')&&has('阿姨好。……上次的鳳梨酥，很好吃。')&&!has('伯母好。……我是書瑀。')&&!said.some(s=>/伯父/.test(s.t))&&has('……他在美國很照顧我。')&&txt('p:heroine_05').includes('heroine_05:……第二句是反的。是我照顧你。')&&said.some(s=>s.who===null&&s.t==='（九點。廚房裡有粥的味道。你回來了。）')&&G.flags.CAME_BACK_TOGETHER===true&&G.flags.US_RETURNED===D('2028-12-23')&&G.flags.US_RETURN===D('2028-12-23')&&room409===1, JSON.stringify({d:CALENDAR.dateOf(G.day).key,r:room409}));
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
  fresh('2028-10-02',21.1,'us_apartment',US()); join('noodle_team','麵店團'); date('kexin'); rules(); at('2028-10-03',7.6); rules(); at('2028-10-03',10.1); rules();
  check('M3. 美國路線：19:30（當地 07:30）照片；可昕沒見過麵店團＝「阿哲今年贏了。」改私訊（AA_370 M7，句子不改；第 6 節第 5 題：照臺灣版 22:00＝當地 10:00）', txt('g:noodle_team').includes('zhe:📷（河濱，兩個烤肉架，一支夾子插在玉米上。）')&&txt('p:kexin').includes('kexin:阿哲今年贏了。……你不在，我沒力氣講冷笑話。')&&!txt('g:noodle_team').some(t=>/阿哲今年贏了/.test(t))&&!PHONE.sent(G,'y4_ma_ask'));
  fresh('2028-10-02',21.1,'us_apartment',US({KX_MET_NOODLE_TEAM:true})); join('noodle_team','麵店團'); date('kexin'); rules(); at('2028-10-03',7.6); rules();
  check('M3. 美國路線、可昕見過麵店團：在群組說「阿哲今年贏了。」', txt('g:noodle_team').includes('kexin:阿哲今年贏了。……你不在，我沒力氣講冷笑話。')&&!txt('p:kexin').some(t=>/阿哲今年贏了/.test(t)));
  // ---------- 2-Y4-07 校慶 ----------
  fresh('2028-11-11',12,'campus',TWF({lawclub:true,GRANDMA_TREE_Y2:'asked'})); E.player.obj.position={x:-17.8,y:0,z:13.0};
  check('F1. 法服成員、11/11 中午在攤位：攤位裡那一版', EVENTS.check(ev('ev_fair_booth_y4'))&&!EVENTS.check(ev('ev_fair_booth_y4_pass')));
  picks=[0]; await run('ev_fair_booth_y4'); check('F1. 大二遇過阿嬤：「法律說是我的。給你們。」；二選一', has('法律說是我的。給你們。')&&has('有啦。掉過來的給我，樹枝他自己剪。')&&G.flags.GRANDMA_Y4==='booth');
  fresh('2028-11-11',12,'campus',TWF()); const fp=EVENTS.check(ev('ev_fair_booth_y4_pass'))&&!EVENTS.check(ev('ev_fair_booth_y4')); await run('ev_fair_booth_y4_pass'); check('F2. 不是成員、沒遇過：路過那一版；「給你們。不用登記。」；沒有選項', fp&&has('給你們。不用登記。')&&opts.length===0&&G.flags.GRANDMA_Y4==='pass');
  fresh('2028-11-11',12,'campus',US({lawclub:true})); check('F3. 美國路線：沒有', !EVENTS.check(ev('ev_fair_booth_y4'))&&!EVENTS.check(ev('ev_fair_booth_y4_pass')));
  // ---------- 2-Y4-08 讀書會交棒 ----------
  fresh('2028-11-30',20,'wancai',TWF()); R('yu','FAM'); R('heroine_01','FRI'); ACTIVITIES.rec(G); for(const k of [10,20,30]) G.acts.att['public_law_group@'+(G.day-k)]={h:20,end:'full'};
  const plg=ACTIVITIES.list.find(a=>a.id==='public_law_group'); check('H0. 公法讀書會大四上：第 13 週 11/30 有開；交棒以後學弟帶（第 14 週 12/7 照開）；第 15 週 12/14 停一次（AA_323 1B-20）', ACTIVITIES.on(plg,G.day,G)&&ACTIVITIES.on(plg,D('2028-12-07'),G)&&!ACTIVITIES.on(plg,D('2028-12-14'),G));
  const ce=CLS.clubEvent(G,plg); check('H1. 去過 3 次、11/30 去讀書會：這一場就是交棒', !!ce&&ce.id==='ev_plg_handover', ce&&ce.id);
  picks=[0]; await run('ev_plg_handover'); check('H1. 白板只剩「說理由。」；「例外，要說理由。」；拍照＝PLG_LAST_RULE', has('（對學弟妹）規則只有一條。例外，要說理由。')&&has('妳以前有十條。')&&SOCIAL.has('heroine_01','PLG_LAST_RULE')&&G.flags.PLG_HANDOVER==='there');
  fresh('2028-11-30',22.1,'dorm',TWF()); join('noodle_team','麵店團'); R('yu','FAM'); R('heroine_01','FRI'); rules();
  check('H2. 沒去：22:00 Alison 的白板照片「以安交棒了。白板只剩一條。」', txt('g:noodle_team').join('|')==='yu:📷（白板，只剩一行字）|yu:以安交棒了。白板只剩一條。'&&G.flags.PLG_HANDOVER==='heard');
  // ---------- 2-Y4-10 聖誕 ----------
  fresh('2028-12-21',21.1,'dorm',TWF({XMAS_GIFT:'notebook'})); join('noodle_team','麵店團'); R('yu','FAM'); rules(); const qx=OUT.get(G,'y4_xmas');
  check('X0. 12/21 21:00「明天考完 聖誕交換禮物」「七點 麵店 一百五以內」；排 12/22 19:00', txt('g:noodle_team').join('|')==='zhe:明天考完 聖誕交換禮物|zhe:七點 麵店 一百五以內'&&!!qx&&qx.h===19);
  at('2028-12-22',18.8); said=[]; await OUT.go(GM,qx);
  check('X1. 大一送過筆記本：抽到一本幾乎一樣的筆記本；Alison「這是詛咒吧。」；阿姨「考完了，吃好一點。」', has('（你抽到的是一本小筆記本。和你三年前帶來的那一個，幾乎一樣。）')&&has('（抱著一個巨大的玩偶）這是詛咒吧。')&&has('考完了，吃好一點。')&&G.flags.XMAS_Y4==='went', JSON.stringify(lines().slice(-5)));
  fresh('2028-12-21',21.1,'us_outside',US()); join('noodle_team','麵店團'); rules(); at('2028-12-22',21.6); rules();
  check('X2. 美國路線：沒有邀約；21:30 照片（AA_370 第 6 節第 8 題：照臺灣時間；那時人在回臺灣的路上，12/21 23:55 起飛）', !PHONE.sent(G,'y4_xmas_ask')&&txt('g:noodle_team').includes('zhe:📷（每個人手上的禮物，都很眼熟。）'));

  // ================= 美國路線的 CG（登錄了才放；BCG-32 要重畫的照 redrawn）=================
  { const ids=['cg_chicago_heroine05','cg_snow_steps_heroine05','cg_last_dinner_heroine05','cg_sf_bridge_fog_heroine05','cg_us_kitchen_heroine05']; for(const id of ids) CG_REGISTRY[id]={file:'x.webp',title:'t'};
    fresh('2028-11-11',7,'us_outside',US({MET_LONG:true})); date('heroine_05'); await run('ev_us_chicago'); const c1=cgs.includes('cg_chicago_heroine05');
    fresh('2028-12-02',20,'us_outside',US()); date('heroine_05'); picks=[0]; await run('ev_us_first_snow'); const n1=cgs.includes('cg_snow_steps_heroine05');
    fresh('2028-12-14',19,'us_outside',US({US_CLUB_DISH:'egg'})); await run('ev_us_club_dinner'); const d1=cgs.includes('cg_last_dinner_heroine05');
    fresh('2028-12-18',10,'us_outside',US()); date('heroine_05'); picks=[0]; await run('ev_sf2'); const r1=cgs.includes('cg_sf_bridge_fog_heroine05');
    fresh('2028-09-13',18.6,'us_shared',US()); date('heroine_05'); E.player.seat={lift:0.31}; picks=[0]; await run('ev_us2_kitchen'); const v0=cgs.includes('cg_us_kitchen_heroine05');
    CG_REGISTRY.cg_us_kitchen_heroine05.redrawn=true; fresh('2028-09-13',18.6,'us_shared',US()); date('heroine_05'); E.player.seat={lift:0.31}; picks=[0]; await run('ev_us2_kitchen'); const v1=cgs.includes('cg_us_kitchen_heroine05');
    check('G. 登錄了就放：C1 BCG-17 芝加哥、N1 BCG-09 台階、D1 BCG-33 會所晚餐、R1 BCG-48 霧裡的大橋；V1 BCG-32 舊圖不放、redrawn 以後才放', c1&&n1&&d1&&r1&&!v0&&v1, JSON.stringify({c1,n1,d1,r1,v0,v1}));
    for(const id of ids) delete CG_REGISTRY[id]; }

  // ---------- 2-Y4-04「大四要怎麼過？」再問一次 ----------
  fresh('2028-10-16',21.1,'dorm',TWF({Y4_PATH:'undecided',Y4_PATH_DAY:D('2028-06-02'),SISTER_TALK:'search'})); picks=['準備研究所']; said=[]; await STORY.y4Path(GM);
  check('P1. 10/16 21:00 宿舍：「便利貼還貼在檯燈旁邊。」；選②「推甄的面試在十月底。」；Y4_PATH grad、Y4_PATH_DAY＝10/16、Y4_PATH_ASK2；之後有推甄', has('（便利貼還貼在檯燈旁邊。四個選項，一個都沒劃掉。）')&&has('（大四，要怎麼過？）')&&has('（你打開系上的網頁。推甄的面試在十月底。）')&&G.flags.Y4_PATH==='grad'&&G.flags.Y4_PATH_DAY===D('2028-10-16')&&G.flags.Y4_PATH_ASK2===D('2028-10-16')&&R2Y4A.pushOn(G), JSON.stringify(lines()));
  at('2028-10-16',22); rules(); at('2028-10-17',9.1); rules();
  { const L=txt('p:sister'); check('P1. 隔天 09:00 姊姊只有一則（story3d.js 1A-08 那一則不重發）：「好。要念，就念你想問的那一題。」', L.filter(t=>/好。要念，就念你想問的那一題。/.test(t)).length===1&&L.filter(t=>/^sister:/.test(t)).length===1, JSON.stringify(L)); }
  fresh('2028-10-16',21.1,'dorm',TWF({Y4_PATH:'undecided',Y4_PATH_DAY:D('2028-06-02'),SISTER_TALK:'search'})); picks=['還沒決定']; said=[]; await STORY.y4Path(GM); at('2028-10-17',9.1); rules();
  check('P2. 兩次都選④：「你決定先不決定。」→ 照③（other）、Y4_PATH_TWICE；姊姊那一則照 undecided（上次說了，我二十六歲也還在找。）', has('（你決定先不決定。）')&&G.flags.Y4_PATH==='other'&&G.flags.Y4_PATH_TWICE===true&&txt('p:sister').includes('sister:上次說了，我二十六歲也還在找。你急什麼。'), JSON.stringify(txt('p:sister')));
  fresh('2028-10-16',21.1,'us_apartment',US({Y4_PATH:'undecided',Y4_PATH_DAY:D('2028-06-02')})); picks=['準備研究所']; said=[]; const p3due=STORY.y4Path2Due(G); await STORY.y4Path(GM);
  check('P3. 美國路線：公寓書桌、當地 21:00；「從臺北帶到這裡。」；選②＝交換回來要多念一學期（沒有推甄）', p3due&&has('（檯燈旁邊的便利貼，從臺北帶到這裡。四個選項，一個都沒劃掉。）')&&has('（你查了一下。交換回來要多念一學期，推甄趕不上。筆試在後年二月。）')&&!R2Y4A.pushOn(G));

  // ---------- 2-Y4-05 語彤 15b〈公館的時間〉 ----------
  fresh('2028-10-17',17.6,'noodle',TWF()); R('heroine_03','FAM'); const e1ok=EVENTS.check(ev('ev_yt_essay')); picks=[0]; await run('ev_yt_essay');
  check('E1. 10/17 麵店（她的班、FAMILIAR）：「不要在我面前讀」；當面讀＝三句旁白；YT_ESSAY front', e1ok&&has('最後一段寫的是一家麵店。你讀到的時候，不要在我面前讀。')&&has('（第一段是水源市場賣菜的阿嬤：「她五十年沒有放過假。」中間是續約那天，一個老客人說的話。）')&&has('（你抬頭的時候，她已經倒好水，站在別桌旁邊。）')&&G.flags.YT_ESSAY==='front');
  fresh('2028-10-24',18,'noodle',TWF()); R('heroine_03','FAM'); picks=[1]; await run('ev_yt_essay'); at('2028-10-25',21.1); rules(); const ask05=PHONE.byAsk(G,'y4_yt_essay'); answer('y4_yt_essay',0);
  check('E2. 回家讀：隔天 21:00「讀了嗎」→「讀了」→「嗯」', G.flags.YT_ESSAY==='home'&&!!ask05&&JSON.stringify(txt('p:heroine_03'))===JSON.stringify(['heroine_03:讀了嗎','player:讀了','heroine_03:嗯']), JSON.stringify(txt('p:heroine_03')));
  fresh('2028-10-17',17.6,'noodle',US()); R('heroine_03','FAM'); const e3a=!EVENTS.check(ev('ev_yt_essay'));
  fresh('2028-12-20',10,'library',US({US_RETURNED:D('2028-12-23')})); const e3b=!R2Y4A.shelfOn(G); at('2028-12-24',10); await tick(); const sh=E.interactables.find(it=>it.ytEssayShelf); said=[]; await R2Y4A.shelfLook(GM);
  check('E3. 美國路線：沒有她的那一場；12/24 起總圖三樓期刊架看得到：「（系刊。目錄第三篇：〈公館的時間〉。作者：陳語彤。）」；YT_ESSAY shelf', e3a&&e3b&&!!sh&&has('（系刊。目錄第三篇：〈公館的時間〉。作者：陳語彤。）')&&G.flags.YT_ESSAY==='shelf');
  fresh('2028-10-16',12,'library',TWF()); R('heroine_03','FAM'); await tick(); const shTW=!!E.interactables.find(it=>it.ytEssayShelf); await R2Y4A.shelfLook(GM); const hold0=STORY.LADDER_HOLD['Y7-L3']({flags:{},day:D('2028-10-20')});
  at('2028-10-17',17.6); G.zone='noodle';
  check('E. 台灣路線 10/16 起有期刊架；先翻了期刊架，10/17 她的班照樣演；Y7-L3 等這一場（或 10/24 以後）', shTW&&EVENTS.check(ev('ev_yt_essay'))&&hold0===false&&STORY.LADDER_HOLD['Y7-L3'](G)===true&&STORY.LADDER_HOLD['Y7-L3']({flags:{},day:D('2028-10-25')})===true);

  // ---------- 2-Y4-06 推甄 ----------
  const EXAMS=v=>{ const R0=CLS.rec(G); R0.exam={}; for(const t of ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2']) R0.exam[t+':c'+t+':final']={status:'done',correct:v}; };
  fresh('2028-10-25',21.1,'dorm',TWF({Y4_PATH:'grad'})); R('heroine_05','FRI'); rules();
  check('U0. 10/25 21:00 學姊的便條照片（FRIEND）；二選一', txt('p:heroine_05').includes('heroine_05:📷（一張手寫的便條）')&&!!PHONE.byAsk(G,'y4_push_note'));
  let goals=[]; GM.setGoal=(t,d)=>{ goals.push(t); };
  fresh('2028-10-26',7,'dorm',TWF({Y4_PATH:'grad'})); await tick(); const g06=goals.includes('10:00 萬才館二樓（推甄面試）');
  G.zone='wancai'; E.player.lv=1; G.hour=9.8; said=[]; await tick();
  check('IV. 10/26：早上目標「10:00 萬才館二樓（推甄面試）」；人在二樓 09:45 起就開始：柏翰（翰 4 沒有）「我喜歡這一科。」；黑幕十五分鐘；沒有「一路跑上二樓」', g06&&has('答完了。最後我多說了一句：我喜歡這一科。')&&has('（十五分鐘。最後一題是：你為什麼想研究這個？）')&&!has('（你一路跑上二樓。）')&&G.flags.PUSH_INTERVIEW===true, JSON.stringify(goals));
  E.player.lv=0; fresh('2028-10-26',9.9,'dorm',TWF({Y4_PATH:'grad',BH4_DONE:true})); said=[]; await tick();
  check('IV. 09:50 還沒到＝帶到場：「（你一路跑上二樓。）」；翰 4 有＝「我是真的想知道。」', entered.includes('wancai')&&has('（你一路跑上二樓。）')&&has('他們問我為什麼。……我說，我是真的想知道。')&&G.hour>=10.2);
  E.player.lv=0; GM.setGoal=()=>{};
  fresh('2028-11-23',15.2,'dorm',TWF({Y4_PATH:'grad'})); R('classmate_bohan','FRI'); join('noodle_team','麵店團'); EXAMS(5); rules(); answer('y4_push_bh',0);
  check('U1. 成績高：15:00「錄取。」；柏翰「我說好的時候是真的好。」；GRAD_ADMIT push', G.flags.Y4_PUSH==='pass'&&G.flags.GRAD_ADMIT==='push'&&(G.msgs||[]).some(m=>m.text==='推甄放榜：法律學研究所，錄取。')&&txt('p:classmate_bohan').includes('classmate_bohan:……所以研究所還要跟你同一班。好。我說好的時候是真的好。'));
  at('2028-11-23',21.6); rules(); answer('y4_bh_dinner',0); rules(); const qb=OUT.get(G,'y4_bh_dinner');
  check('U1. 21:00 群組「柏翰推甄上了！」；21:30「……阿哲知道的話，會叫我請全部人。」→ 11/24 18:30 麵店', txt('g:noodle_team').includes('yu:柏翰推甄上了！')&&txt('p:classmate_bohan').includes('classmate_bohan:……阿哲知道的話，會叫我請全部人。')&&!!qb&&qb.h===18.5&&qb.day===D('2028-11-24'));
  at('2028-11-24',18.3); picks=[0]; said=[]; await OUT.go(GM,qb);
  check('U1. 11/24 麵店：「最貴的是一百一。」；兩個都上了＝教授點頭那段；「下次換你請。」', has('……最貴的是一百一。我查過了。')&&has('面試的時候，我說完，有一個教授點頭。')&&has('……嗯。我也這樣想。只是想聽別人說。')&&G.flags.BH_DINNER==='went');
  fresh('2028-11-23',15.2,'dorm',TWF({Y4_PATH:'grad'})); R('classmate_bohan','FRI'); EXAMS(3); rules(); answer('y4_push_bh',0);
  check('U2. 成績中、沒有教授記得你：未錄取；「……二月還有考試。我陪你念。順便。」', G.flags.Y4_PUSH==='fail'&&!G.flags.GRAD_ADMIT&&(G.msgs||[]).some(m=>m.text==='推甄放榜：法律學研究所，未錄取。')&&txt('p:classmate_bohan').includes('classmate_bohan:……二月還有考試。我陪你念。順便。'));
  fresh('2028-11-23',15.05,'dorm',TWF({Y4_PATH:'grad'})); EXAMS(3); G.social.prof={prof_lin:{part:10,perf:10,office:0,research:0}}; rules(); const u2b=G.flags.Y4_PUSH;
  fresh('2028-11-23',21.1,'dorm',TWF({Y4_PATH:'bar'})); R('classmate_bohan','FRI'); join('noodle_team','麵店團'); rules();
  check('U3. 選①國考：只有 21:00 群組「柏翰推甄上了！」（沒有放榜、沒有私訊）；成績中＋教授記得你＝錄取', u2b==='pass'&&txt('g:noodle_team').includes('yu:柏翰推甄上了！')&&!(G.msgs||[]).some(m=>/推甄放榜/.test(m.text))&&!txt('p:classmate_bohan').length);
  { const src=fs.readFileSync(path.join(ROOT,'src/r2y4a3d.js'),'utf8')+fs.readFileSync(path.join(ROOT,'src/data/r2y4a_events.js'),'utf8'); check('U4. 沒有「不要跟阿哲說」', !/不要跟阿哲說/.test(src)); }
  fresh('2028-11-24',19.6,'dorm',TWF({Y4_PATH:'grad',BH_DINNER_GO:true})); OUT.plan(G,{id:'y4_bh_dinner',ev:'ev_bh_dinner',day:D('2028-11-24'),h:18.5,late:0.25,place:'阿鳳麵店',title:'x',travelH:0.25}); await outTick(); at('2028-11-24',19.6); rules();
  check('U. 沒去：19:30「我先吃了。……下次還是我請。」', G.flags.BH_DINNER==='missed'&&txt('p:classmate_bohan').includes('classmate_bohan:我先吃了。……下次還是我請。'));

  // ---------- 2-Y4-07 校慶：11/10 21:00 法服群組 ----------
  fresh('2028-11-10',21.1,'dorm',TWF({lawclub:true})); join('lawclub_study','法服讀書會'); rules();
  check('F0. 法服成員：11/10 21:00 學妹「明天校慶，攤位十點開。」「大四的學長姊有空回來坐。」', JSON.stringify(txt('g:lawclub_study'))===JSON.stringify(['fafu_jr:明天校慶，攤位十點開。','fafu_jr:大四的學長姊有空回來坐。']), JSON.stringify(txt('g:lawclub_study')));
  // 2-Y4-07 校慶的海報（AA_345 F1）：11/6～11/11 霖澤館公告欄，11/12 起撤掉
  { const POS='（公告欄上貼了一張校慶的海報：「11/11（六）校慶園遊會　椰林大道。法律服務社問答攤　10:00～16:00。租屋、打工、買賣，什麼都可以問。」）';
    fresh('2028-11-05',12,'campus',TWF()); await tick(); const p0=!E.interactables.find(it=>it.fairPosterY4);
    at('2028-11-06',9); await tick(); const pit=E.interactables.find(it=>it.fairPosterY4); said=[]; if(pit) await R2Y4A.posterLook(GM);
    check('F4. 11/6 起霖澤館公告欄（台階西端外面那一塊）有「看公告欄」＝校慶的海報（AA_345 F1）；11/5 還沒有', p0&&!!pit&&pit.label==='看公告欄'&&Math.hypot(pit.x-16.6,pit.z+100.6)<1.5&&said.length===1&&said[0].t===POS&&said[0].who===null, JSON.stringify(lines()));
    at('2028-11-11',15); await tick(); const p11=!!E.interactables.find(it=>it.fairPosterY4); at('2028-11-12',9); await tick(); const p12=!E.interactables.find(it=>it.fairPosterY4);
    G.zone='dorm'; at('2028-11-08',12); E.interactables=[]; await tick(); const pd=!E.interactables.find(it=>it.fairPosterY4);
    check('F4. 11/11 當天還在、11/12 起撤掉；不在校園不放', p11&&p12&&pd); }

  // ---------- 2-Y4-09 語彤事件 16 ----------
  fresh('2028-12-21',12.2,'dorm',TWF()); R('heroine_03','FRI'); ct('heroine_03'); rules();
  check('S0. 12/21 12:10「今天我在總圖三樓」「有東西想給你看」', JSON.stringify(txt('p:heroine_03'))===JSON.stringify(['heroine_03:今天我在總圖三樓','heroine_03:有東西想給你看']));
  CG_REGISTRY.cg_share_time_heroine03={file:'x.webp',title:'t'};
  at('2028-12-21',17.5); G.zone='library'; SOCIAL.remember('heroine_03','GIFT_NOTEBOOK_YT',''); const s1ok=EVENTS.check(ev('ev_yt_share_time')); picks=[0]; await run('ev_yt_share_time');
  check('S1. 朋友、大一抽到筆記本：「這本是聖誕節抽到的。……寫滿了。」；選「我想看下一本。」＝YT_NOTES_NEXT；S4 沒有 CG-12、沒有換位子', s1ok&&has('這本是聖誕節抽到的。……寫滿了。')&&has('……下一本還沒寫。')&&G.flags.YT_NOTES_NEXT===true&&G.flags.YT16==='seen'&&!cgs.includes('cg_share_time_heroine03')&&!has('（她把筆記收回去，換到你旁邊的位子坐。不是斜對面。）'));
  fresh('2028-12-21',17.5,'library',TWF()); R('heroine_03','FRI'); date('heroine_03'); picks=[1]; await run('ev_yt_share_time');
  check('S2. 和語彤交往：選完以後她換到旁邊的位子', has('畢業專題。老師說可以再寫長一點。')&&has('（她把筆記收回去，換到你旁邊的位子坐。不是斜對面。）'));
  delete CG_REGISTRY.cg_share_time_heroine03;
  fresh('2028-12-21',12.2,'dorm',TWF()); R('heroine_03','FRI'); ct('heroine_03'); rules(); at('2028-12-21',20.1); rules(); at('2028-12-28',12.2); rules();
  check('S. 12/21 沒到：20:00「今天沒看到你」「下禮拜四 一樣的地方」；12/28 12:10「今天也在三樓」', txt('p:heroine_03').includes('heroine_03:下禮拜四 一樣的地方')&&txt('p:heroine_03').includes('heroine_03:今天也在三樓'));
  at('2028-12-28',19); rules(); check('S. 12/28 也沒到＝YT16 missed（沒有 YT_NOTES_NEXT）', G.flags.YT16==='missed'&&!G.flags.YT_NOTES_NEXT);
  fresh('2028-12-21',12.2,'dorm',US({US_RETURNED:D('2028-12-23')})); R('heroine_03','FRI'); ct('heroine_03'); rules(); const s3a=!PHONE.sent(G,'y4_yt16_a'); at('2028-12-28',12.2); rules();
  check('S3. 美國路線：12/21 沒有；12/28 12:10 那兩則', s3a&&txt('p:heroine_03').includes('heroine_03:今天我在總圖三樓'));

  // ---------- 2-Y4-11 芷若第二輪明信片 ----------
  const pc=async(k,h,pk)=>{ at(k,h); await tick(); const it=E.interactables.find(x=>x.zrPostcard2); picks=pk||[]; said=[]; opts=[]; if(it) await R2Y4A.pc2Scene(GM); return !!it; };
  fresh('2028-09-21',12,'dorm',TWF()); R('heroine_02','FAM'); SOCIAL.remember('heroine_02','POSTCARDS',''); await tick(); const z0=!E.interactables.find(x=>x.zrPostcard2);
  const z9=await pc('2028-09-22',12.5,['（先不回）']);
  check('Z0. 9/22 中午以後宿舍有明信片（9/21 還沒有）；大三收過第一輪：「又開始寄來了。」；九月兩行；回寄三個選項（戲院那句三月以後才有）', z0&&z9&&has('（明信片又開始寄來了。這次的字比較小，寫得比較多。）')&&has('「到英國了。宿舍窗戶看出去，是一棵很大的樹。」')&&has('「我還不知道它叫什麼。」')&&opts[0].length===4&&!opts[0].some(t=>/戲院/.test(t))&&G.flags.ZR_POSTCARD2.includes(9), JSON.stringify(opts));
  const z10=await pc('2028-10-20',13,['台北也下雨了']); const z11=await pc('2028-11-17',13,['（先不回）']);
  check('Z1. 十月回寄「台北也下雨了。我帶了傘。」→ 十一月第一行「你說台北下雨。這裡也是。我們今天一樣。」；ZR_REPLY2', z10&&z11&&said[0]&&said[0].t==='「你說台北下雨。這裡也是。我們今天一樣。」'&&has('「又到四點就天黑的時候了。去年很不習慣，今年還好。」')&&JSON.stringify(G.flags.ZR_REPLY2)===JSON.stringify(['rain'])&&!opts[0].some(t=>/台北也下雨/.test(t)), JSON.stringify(lines().slice(0,2)));
  await pc('2028-12-15',13,['（先不回）']);
  check('Z3. 十二月那張：報告兩行＋（背面最後一行）「麵店生日快樂。」', has('「我在寫一篇關於『一個人看電影』的報告。」')&&has('（背面最後一行）')&&has('「麵店生日快樂。」')&&!has('「你也在國外。我們今天都不在家。」'));
  await pc('2029-01-05',13,['（先不回）']); await pc('2029-02-19',13,['（先不回）']); await pc('2029-03-16',13,['（先不回）']); const tk=opts[0]&&opts[0].some(t=>/妳的戲院，我要第一張票。/.test(t)); await pc('2029-04-20',13,[]);
  const FY='（四月那張的最後一行，是另一種筆跡：「這棵樹叫英國櫟。……他說的。」）';
  check('Z. 三月那張以後才有「妳的戲院，我要第一張票。」；沒走方奕廷那條路＝四月沒有另一種筆跡', tk&&has('「論文開始寫了。題目還是很小。」')&&!has(FY)&&!hasRe(/另一種筆跡/));
  fresh('2029-04-20',13,'dorm',TWF({ZR_FY:true})); R('heroine_02','FAM'); { const Rr=R2Y4A.pc2Rec(G); Rr.first=1; for(const k of ['2028-09-22','2028-10-20','2028-11-17','2028-12-15','2029-01-05','2029-02-19','2029-03-16']) Rr.read[k]=1; } await pc('2029-04-20',13,[]);
  const fy=said.some(s=>s.t===FY&&s.who===null)&&said.indexOf(said.find(s=>s.t===FY))>said.findIndex(s=>s.t==='「每天寫五百字，寫完去公園坐一下。」')&&!has('（另一種筆跡）')&&!has('「這棵樹叫英國櫟。……他說的。」');   /* AA_345 F3：一句旁白，接在四月那張的字後面 */
  fresh('2028-09-22',13,'dorm',TWF()); R('heroine_02','FAM'); date('heroine_02'); await pc('2028-09-22',13,['（先不回）']); const gf=has('「熱可可在這裡叫 hot chocolate。加濃縮，他們看我的表情很奇怪。」')&&has('（信箱裡有一張明信片。英國的郵戳。）');
  fresh('2028-09-22',13,'dorm',TWF()); R('heroine_02','FAM'); date('heroine_02'); ROM.get(G,'heroine_02').sinceDay=D('2028-08-26'); await pc('2028-09-22',13,['（先不回）']); const gf2=!has('「熱可可在這裡叫 hot chocolate。加濃縮，他們看我的表情很奇怪。」');
  check('Z. 方奕廷那條路：四月多一行另一種筆跡；沒收過第一輪＝「英國的郵戳。」；交往中九月多熱可可那一行（8/26 才交往的不加）', fy&&gf&&gf2);
  fresh('2028-08-20',9.2,'us_apartment',US()); R('heroine_02','FAM'); ct('heroine_02'); rules(); const zaddr=!PHONE.sent(G,'y4_zr_addr')&&!txt('p:heroine_02').includes('heroine_02:給我你在那邊的地址。英國寄到美國要多久，我想試試看。');   /* AA_370 M1：8/20 不再要地址（只在 8/10，us_life3d.js 的 usl_zr_0810）*/
  at('2028-12-15',13); G.zone='us_apartment'; await tick(); const zus=!!E.interactables.find(x=>x.zrPostcard2); said=[]; for(let i=0;i<4;i++){ picks=['（先不回）']; await R2Y4A.pc2Scene(GM); }
  check('Z2. 美國路線：8/20 不再要地址（AA_370 M1：8/10 那則在 us_life3d.js）；九～十二月寄到公寓 214；十二月多一行「你也在國外。我們今天都不在家。」', zaddr&&zus&&has('「你也在國外。我們今天都不在家。」')&&has('「麵店生日快樂。」'));
  at('2029-01-05',13); G.flags.US_RETURNED=D('2028-12-23'); G.zone='dorm'; E.interactables=[]; await tick(); check('Z2. 一月起照常寄回臺灣（宿舍）', !!E.interactables.find(x=>x.zrPostcard2));

  // ---------- 2-Y4-12 主線 8「回來」 ----------
  fresh('2028-09-05',15,'cafe',{EXCHANGE_ROUTE:'JP',CAFE_VISITS:4}); G.events.done.ev_zhiruo_no_sugar=1; const b1=EVENTS.check(ev('ev_back_home_cafe')); await run('ev_back_home_cafe');
  check('B1. 日本路線、常客、看過 Z11：9/4 以後第一次進 Café「熱拿鐵，不加糖？」「……芷若姊交代的。」「（半年。大家都還在。）」；BACK_HOME', b1&&has('熱拿鐵，不加糖？')&&!has('熱拿鐵，少糖？')&&has('……芷若姊交代的。她說你回來那天，第一杯一定要點對。')&&has('（半年。大家都還在。）')&&G.flags.BACK_HOME===G.day);
  fresh('2028-12-20',15,'cafe',US({US_RETURNED:D('2028-12-23')})); const b2a=!EVENTS.check(ev('ev_back_home_cafe')); at('2028-12-24',15); const b2b=EVENTS.check(ev('ev_back_home_cafe')); await run('ev_back_home_cafe');
  check('B2. 美國路線、不是常客：12/24 以後才有；「歡迎回來。」', b2a&&b2b&&has('芷若姊說，你回來的話要跟你說一聲：歡迎回來。')&&!has('熱拿鐵，少糖？'));
  fresh('2028-09-05',15,'cafe',TWF({CAFE_VISITS:4})); check('B. 台灣路線：沒有這一場', !EVENTS.check(ev('ev_back_home_cafe')));
  { const aug=(fl,days,z11)=>{ fresh('2028-09-05',15,'cafe',Object.assign({EXCHANGE_ROUTE:'JP'},fl||{})); if(z11) G.events.done.ev_zhiruo_no_sugar=1; G.habits={'place:cafe:afternoon':{n:days.length,first:days[0],last:days[days.length-1],days}}; };
    aug({CAFE_VISITS:1},[D('2028-08-20')],true); await run('ev_back_home_cafe');
    check('B3. 日本路線、8/6～9/2 進過 Café（AA_378 #4）：「熱拿鐵，不加糖？」→「……芷若姊走以前交代的。她說你的第一杯一定要點對。」→「（她已經去英國了。店裡其他的都還在。）」；沒有「回來那天」「歡迎回來」「半年」',
      has('熱拿鐵，不加糖？')&&has('……芷若姊走以前交代的。她說你的第一杯一定要點對。')&&has('（她已經去英國了。店裡其他的都還在。）')&&!has('……芷若姊交代的。她說你回來那天，第一杯一定要點對。')&&!has('芷若姊說，你回來的話要跟你說一聲：歡迎回來。')&&!has('（半年。大家都還在。）')&&!!G.flags.BACK_HOME);
    aug({CAFE_VISITS:4},[D('2028-08-20')],false); await run('ev_back_home_cafe');
    check('B3. 8 月進過、沒看過 Z11：「熱拿鐵，少糖？」（照現在的條件）', has('熱拿鐵，少糖？')&&!has('熱拿鐵，不加糖？')&&has('……芷若姊走以前交代的。她說你的第一杯一定要點對。'));
    aug({CAFE_VISITS:4},[D('2028-03-20'),D('2028-09-03')],true); await run('ev_back_home_cafe');
    check('B3. 8/6～9/2 沒進過（只有 3 月、9/3）＝照現在（「……芷若姊交代的。」「（半年。大家都還在。）」）', has('……芷若姊交代的。她說你回來那天，第一杯一定要點對。')&&has('（半年。大家都還在。）')&&!has('（她已經去英國了。店裡其他的都還在。）')); }

  // ---------- 2-Y4-13 可昕 K21 ----------
  fresh('2028-09-20',21.1,'dorm',TWF({E10_STUDY:'study'})); date('kexin'); rules();
  check('K0. 9/20 21:00 三則＋「政大。」「總圖。」', seq(txt('p:kexin'),['kexin:這學期，我們約讀書，就真的讀。','kexin:讀完才能聊天。','kexin:週六下午兩點。政大，還是總圖？'])&&PHONE.byAsk(G,'y4_kx21').ask.opts.length===2, JSON.stringify(txt('p:kexin')));
  answer('y4_kx21',0); rules(); const qk=OUT.get(G,'y4_kx21'); at('2028-09-23',13.2); picks=[2]; said=[]; await OUT.go(GM,qk);
  check('K1. 選政大：9/23 14:00；便條「先讀完。」；E10 讀了＝長頸鹿；三選一「你整頁都畫了。那等於沒畫。」；沒有「不公平」「騙你的」；KX_STUDY_PLAN', !!qk&&qk.h===14&&has('（兩個小時，沒有人說話。她只推過來一張便條：「先讀完。」）')&&has('大一那次在總圖，你有讀。我還在你筆記上畫了長頸鹿。')&&opts[0].length===3&&has('……你整頁都畫了。那等於沒畫。')&&!hasRe(/不公平|騙你的/)&&G.flags.KX_STUDY_PLAN==='went');
  fresh('2028-09-20',21.1,'dorm',TWF()); date('kexin'); rules(); answer('y4_kx21',1); rules(); const qlib=OUT.get(G,'y4_kx21'); at('2028-09-23',13.7); await OUT.go(GM,qlib);
  const libOk=entered.includes('library')&&EVENTS.check(ev('ev_kexin_study_really_lib')); picks=[0]; said=[]; await run('ev_kexin_study_really_lib'); await tick();
  check('K1. 選總圖：帶到 3D 總圖，到了就演（auto）；「可以。……先去吃東西，我餓了。」；演完不再問「出發」', !!qlib&&!!qlib.goto&&libOk&&has('可以。……先去吃東西，我餓了。')&&G.flags.KX_STUDY_PLAN==='went'&&qlib.state==='done');
  fresh('2028-09-20',21.1,'dorm',TWF()); date('kexin'); rules(); at('2028-09-23',14.3); rules(); at('2028-09-23',16.1); rules();
  check('K2. 沒回＝沒去：16:00「今天我自己讀完了。」「表格我開好了。下次你也要真的讀。」；記 KX_STUDY_PLAN', G.flags.KX_STUDY_PLAN==='missed'&&txt('p:kexin').includes('kexin:表格我開好了。下次你也要真的讀。'));
  fresh('2028-09-20',9.1,'us_apartment',US()); date('kexin'); rules(); const qv=OUT.get(G,'y4_kx21v');
  check('K3. 美國路線：9/20 當地 09:00「……時差也一樣。」「台灣晚上九點，你那邊早上九點。剛好。」；9/23 當地 09:00 視訊', txt('p:kexin').includes('kexin:台灣晚上九點，你那邊早上九點。剛好。')&&!PHONE.byAsk(G,'y4_kx21')&&!!qv&&qv.day===D('2028-09-23')&&Math.abs(qv.h-9)<1e-6&&qv.verb==='接起來');
  at('2028-09-23',8.9); picks=[2]; said=[]; await OUT.go(GM,qv);
  check('K3. 視訊版（AA_345 F3 定稿）：「（兩個小時，視訊開著，兩邊都沒有人說話。）」→ 可昕「（把便條舉到鏡頭前）先讀完。」；第三個選項「把自己畫滿重點的那一頁舉到鏡頭前」', said[0]&&said[0].t==='（兩個小時，視訊開著，兩邊都沒有人說話。）'&&said[0].who===null&&said[1]&&said[1].t==='（把便條舉到鏡頭前）先讀完。'&&said[1].who!==null&&opts[0][2]==='（把自己畫滿重點的那一頁舉到鏡頭前）'&&G.flags.KX_STUDY_PLAN==='went', JSON.stringify(lines().slice(0,2)));
  fresh('2028-09-20',9.1,'us_apartment',US()); date('kexin'); rules(); at('2028-09-23',9.6); await outTick(); at('2028-09-23',11.1); rules();
  check('K3. 美國路線沒接：「今天我自己讀完了。你那邊現在是早上吧。……下次你也要真的讀。」', txt('p:kexin').includes('kexin:今天我自己讀完了。你那邊現在是早上吧。……下次你也要真的讀。')&&G.flags.KX_STUDY_PLAN==='missed');

  // ---------- 2-Y4-14 可昕 K22 ----------
  fresh('2028-11-13',21.1,'dorm',TWF()); date('kexin'); rules(); const k22ask=txt('p:kexin').includes('kexin:明天晚上七點，讀書會。邵鈞也在。你來旁聽，不用說話。'); answer('y4_kx22',0); rules(); const q22=OUT.get(G,'y4_kx22');
  at('2028-11-14',18.2); picks=[0]; said=[]; await OUT.go(GM,q22);
  check('K4. 交往中、去了：11/14 19:00 政大；沒見過邵鈞＝「這是邵鈞，考古題有目錄的那個。」；「我比較想當那個幫人講話的人。」三選一；KX_DIRECTION', k22ask&&!!q22&&q22.h===19&&has('這是邵鈞，考古題有目錄的那個。')&&has('他想當那個判的人。')&&has('我比較想當那個幫人講話的人。')&&opts[0].length===3&&has('你每次都這樣說。……好啦，謝謝。')&&G.flags.KX_DIRECTION===true);
  fresh('2028-11-14',8.6,'us_apartment',US()); date('kexin'); rules();
  check('K5. 美國路線：一則「……今天想清楚了。」，沒有邀約、不算沒去', txt('p:kexin').includes('kexin:我比較想當那個幫人講話的人。今天想清楚了。')&&!PHONE.sent(G,'y4_kx22_ask')&&G.flags.KX_DIRECTION===true);
  fresh('2028-11-13',21.1,'dorm',TWF()); date('kexin'); rules(); answer('y4_kx22',1); at('2028-11-14',19.3); rules(); at('2028-11-14',21.6); rules();
  check('K. 「不去。」：21:30 那一則', txt('p:kexin').includes('kexin:我比較想當那個幫人講話的人。今天想清楚了。'));

  // ---------- 2-Y4-15 可昕：放榜那一週，她的實習 ----------
  fresh('2028-11-23',15.2,'dorm',TWF({Y4_PATH:'grad'})); date('kexin'); const R1x=CLS.rec(G); R1x.exam={}; for(const t of ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2']) R1x.exam[t+':c:final']={status:'done',correct:5};
  rules(); const qi=OUT.get(G,'y4_kx_intern'); picks=[0]; said=[]; if(qi) await OUT.go(GM,qi);
  check('I1. 推甄上了：15:30 她打來（電話）「結果出來了吧。你先說。」→「那今天宵夜誰請？」；KX_INTERN', !!qi&&Math.abs(qi.h-15.5)<1e-6&&qi.call===true&&has('結果出來了吧。你先說。')&&has('我事務所的實習也上了。那今天宵夜誰請？')&&has('好。山下那家。')&&G.flags.KX_INTERN===true);
  fresh('2028-11-23',15.2,'dorm',TWF({Y4_PATH:'grad'})); date('kexin'); rules(); const qi2=OUT.get(G,'y4_kx_intern'); said=[]; if(qi2) await OUT.go(GM,qi2); const i2a=has('你的，先說你的。')&&has('……好。二月還有一次。')&&!has('我事務所的實習也上了。那今天宵夜誰請？')&&!G.flags.KX_INTERN;
  at('2028-11-24',21.1); rules();
  check('I2. 推甄沒上：電話不提她的；隔天 21:00「我申請的那家事務所實習，上了。……不用恭喜，先吃飯。」', i2a&&txt('p:kexin').includes('kexin:我申請的那家事務所實習，上了。……不用恭喜，先吃飯。')&&G.flags.KX_INTERN===true);
  fresh('2028-11-22',21.1,'dorm',TWF({Y4_PATH:'bar'})); date('kexin'); rules();
  check('I3. 選國考（沒申請）：11/22 21:00「事務所的實習，我上了。……你要負責宵夜。」', txt('p:kexin').includes('kexin:事務所的實習，我上了。……你要負責宵夜。')&&!OUT.get(G,'y4_kx_intern'));
  fresh('2028-11-22',8.1,'us_apartment',US()); date('kexin'); rules();
  check('I3. 美國路線：台灣 11/22 21:00＝當地 08:00「……你回來要負責宵夜。」', txt('p:kexin').includes('kexin:事務所的實習，我上了。……你回來要負責宵夜。'));
  // AA_345 F9：推甄沒上、後來筆試的玩家，3/22 研究所放榜那一通（她的實習 11/24 已經說過）
  const I4F=r=>TWF({Y4_PATH:'grad',Y4_PUSH:'fail',GRAD_EXAM_2029:true,GRAD_EXAM_RESULT:r});
  fresh('2029-03-22',15.2,'dorm',Object.assign(I4F('pass'),{KX_INTERN_CALL:'fail',KX_INTERN_DAY:D('2028-11-23'),KX_INTERN:true})); date('kexin'); G.hour=15.6; rules(); const qi4=OUT.get(G,'y4_kx_intern2'); picks=[0]; said=[]; if(qi4) await OUT.go(GM,qi4);
  check('I4. 3/22 筆試上了：「結果出來了吧。你先說。」「（你說上了。）」「……好。這次換你的上了。那今天宵夜誰請？」→「好。山下那家。」；不再說「我事務所的實習也上了。」', !!qi4&&qi4.call===true&&has('結果出來了吧。你先說。')&&has('（你說上了。）')&&has('……好。這次換你的上了。那今天宵夜誰請？')&&has('好。山下那家。')&&!has('我事務所的實習也上了。那今天宵夜誰請？')&&opts[0]&&opts[0].join('|')==='「我請。」|「各付各的。」', JSON.stringify(lines()));
  fresh('2029-03-22',15.2,'dorm',I4F('fail')); date('kexin'); G.hour=15.6; rules(); const qi5=OUT.get(G,'y4_kx_intern2'); said=[]; if(qi5) await OUT.go(GM,qi5); at('2029-03-23',21.2); rules(); at('2029-03-25',21.2); rules();
  check('I4. 3/22 筆試也沒上：「你的，先說你的。」「（你說沒上。）」「……好。今天宵夜我請。不准說不要。」；沒有「二月還有一次」、沒有隔天那則（實習 11/24 說過了）', !!qi5&&has('你的，先說你的。')&&has('（你說沒上。）')&&has('……好。今天宵夜我請。不准說不要。')&&!has('……好。二月還有一次。')&&!txt('p:kexin').includes('kexin:我申請的那家事務所實習，上了。……不用恭喜，先吃飯。'), JSON.stringify([lines(),txt('p:kexin')]));

  // ================= 大四寒假 =================
  // ---------- 2-Y4-23 學姊 M7 接機 ----------
  CG_REGISTRY.cg_airport_pickup_heroine05={file:'x.webp',title:'我想吃滷肉飯。現在。'};
  const PK=f=>{ fresh('2028-12-20',21.1,'dorm',TWF(f)); join('family_law','家族'); };
  PK({REPLIED_US0:true}); R('heroine_05','FRI'); SOCIAL.remember('heroine_05','DROVE_HER',''); G.events.done.ev_sis_graduation=1; rules();
  const a1g=txt('g:family_law'), a1d=txt('p:heroine_05');
  check('A0. 12/20 21:00 家族群組「這週六晚上八點落地。」「……有人有空嗎。」；去過 G4＝「我畢業那天，謝謝你來。」；兩個人版＝私訊「……你有空嗎。」', JSON.stringify(a1g)===JSON.stringify(['heroine_05:這週六晚上八點落地。','heroine_05:……有人有空嗎。','heroine_05:我畢業那天，謝謝你來。'])&&JSON.stringify(a1d)===JSON.stringify(['heroine_05:……你有空嗎。'])&&!PHONE.byAsk(G,'y4_pickup'), JSON.stringify({a1g,a1d}));
  answer('y4_pickup_two',0); rules(); const qp=OUT.get(G,'y4_sis_pickup');
  check('A0. 接機排了 alarm（跳過時間、睡覺停在出發前；BUG-KAI-PICKUP-1022）',!!qp&&qp.alarm===true,JSON.stringify(qp&&{h:qp.h,alarm:qp.alarm}));
  at('2028-12-23',19.6); picks=[2]; said=[]; await OUT.go(GM,qp);
  check('A1. AA_345 F2：兩個人版入境大廳先一句旁白「（她推著行李推車走出來。看到你，停了一下。）」；登錄的 BCG-34 是夏天版（沒有 redrawn）＝不放', said[0]&&said[0].t==='（她推著行李推車走出來。看到你，停了一下。）'&&said[0].who===null&&!cgs.includes('cg_airport_pickup_heroine05')&&!has('（她一出來就看到你。推車停在原地，她走過來，抱住你。）'), JSON.stringify(lines().slice(0,2)));
  check('A1. 兩個人版：12/23 20:30 入境大廳；車上「我剛到美國那天，你回得很快。……謝謝。」「這次我一直講。」「美國的雞蛋，很難吃。圖書館的咖啡機，很難喝。」「我想吃滷肉飯。現在。」；「公館那家？」；PICKED_HER_UP', !!qp&&Math.abs(qp.h-20.5)<1e-6&&has('我剛到美國那天，你回得很快。……謝謝。')&&has('這次我一直講。你可以轉頭。')&&has('美國的雞蛋，很難吃。圖書館的咖啡機，很難喝。')&&has('我想吃滷肉飯。現在。')&&has('對。就那家。')&&!has('學姊妳今天話好多！')&&!has('……還有，我想你。')&&SOCIAL.has('heroine_05','PICKED_HER_UP')&&G.flags.SIS_PICKUP==='two');
  PK(); R('heroine_05','FRI'); date('heroine_05'); rules(); const a2g=txt('g:family_law'), a2d=txt('p:heroine_05'); const qp2=OUT.get(G,'y4_sis_pickup'); at('2028-12-23',19.6); picks=[1]; said=[]; await OUT.go(GM,qp2);
  check('A2. 戀人版：群組只說「這週六回來。」；私訊「這週六，晚上八點。你來。」；入境大廳兩句旁白「（她一出來就看到你。……抱住你。）」「（很久，她才放開。）」；夏天版 BCG-34 不放；最後「……還有，我想你。」', JSON.stringify(a2g)===JSON.stringify(['heroine_05:這週六回來。'])&&JSON.stringify(a2d)===JSON.stringify(['heroine_05:這週六，晚上八點。你來。'])&&!!qp2&&said[0]&&said[0].t==='（她一出來就看到你。推車停在原地，她走過來，抱住你。）'&&said[1]&&said[1].t==='（很久，她才放開。）'&&!cgs.includes('cg_airport_pickup_heroine05')&&has('……還有，我想你。')&&has('我一直講。你可以轉頭。')&&G.flags.SIS_PICKUP==='lover', JSON.stringify(lines().slice(0,3)));
  at('2028-12-24',11.1); rules(); check('A2. 「先回家睡覺。」→ 隔天「滷肉飯。今天。不要再說明天。」（私訊）', has('……好。明天。明天一定。')&&txt('p:heroine_05').includes('heroine_05:滷肉飯。今天。不要再說明天。'));
  { const cg0=ADV.cg; ADV.cg=function(id){ const r=cg0.call(this,id); if(r) said.push({who:'CG',t:id}); return r; }; CG_REGISTRY.cg_airport_pickup_heroine05.redrawn=true;
    PK(); R('heroine_05','FRI'); SOCIAL.remember('heroine_05','DROVE_HER',''); rules(); answer('y4_pickup_two',0); rules(); at('2028-12-23',19.6); picks=[2]; said=[]; await OUT.go(GM,OUT.get(G,'y4_sis_pickup')); const t1=said.slice(0,2).map(s=>s.t);
    PK(); R('heroine_05','FRI'); date('heroine_05'); rules(); at('2028-12-23',19.6); picks=[1]; said=[]; await OUT.go(GM,OUT.get(G,'y4_sis_pickup')); const t2=said.slice(0,4).map(s=>s.t);
    ADV.cg=cg0; delete CG_REGISTRY.cg_airport_pickup_heroine05.redrawn;
    check('A1／A2. 冬天版通過以後（CG_REGISTRY 那一列 redrawn:true）：兩個人版 BCG-34 接在第一句之後；戀人版第一句拆成兩句、CG 夾在中間（AA_350 N4）：「（她一出來就看到你。推車停在原地。）」→ CG →「（她走過來，抱住你。）」→「（很久，她才放開。）」', JSON.stringify(t1)===JSON.stringify(['（她推著行李推車走出來。看到你，停了一下。）','cg_airport_pickup_heroine05'])&&JSON.stringify(t2)===JSON.stringify(['（她一出來就看到你。推車停在原地。）','cg_airport_pickup_heroine05','（她走過來，抱住你。）','（很久，她才放開。）']), JSON.stringify([t1,t2])); }
  PK(); R('heroine_05','FAM'); rules(); const fq=PHONE.byAsk(G,'y4_pickup'); answer('y4_pickup',0); rules(); const qp3=OUT.get(G,'y4_sis_pickup'); at('2028-12-23',19.6); picks=[0]; said=[]; await OUT.go(GM,qp3);
  check('A. 家族共乘（不到 FRIEND）：群組按鈕「我去接。我有車。」；Kevin「學姊妳今天話好多！」；沒有 BCG-34', !!fq&&fq.ask.opts.length===1&&fq.ask.opts[0].t==='我去接。我有車。'&&has('學姊妳今天話好多！')&&!cgs.includes('cg_airport_pickup_heroine05')&&has('（交流道下面的小店，十點還開著。她吃得很快，一句話都沒說。）')&&G.flags.SIS_PICKUP==='family');
  PK(); R('heroine_05','FAM'); rules(); at('2028-12-23',21.6); rules();
  check('A. 沒有人說要去：21:30 群組「到了。捷運很快。」；SIS_PICKUP mrt、沒有 PICKED_HER_UP', txt('g:family_law').includes('heroine_05:到了。捷運很快。')&&G.flags.SIS_PICKUP==='mrt'&&!SOCIAL.has('heroine_05','PICKED_HER_UP'));
  PK(); R('heroine_05','FAM'); rules(); answer('y4_pickup',0); rules(); at('2028-12-23',20.9); await outTick(); at('2028-12-23',21.6); rules();
  check('A. 家族共乘答應了沒到：Kevin「司機呢？？」學姊「我搭捷運。到了。捷運很快。」；不記 PICKED_HER_UP', txt('g:family_law').includes('kevin:司機呢？？')&&txt('g:family_law').includes('heroine_05:我搭捷運。到了。捷運很快。')&&G.flags.SIS_PICKUP==='mrt'&&!SOCIAL.has('heroine_05','PICKED_HER_UP'));
  fresh('2028-12-20',9.1,'us_apartment',US()); join('family_law','家族'); R('heroine_05','FRI'); date('heroine_05'); rules(); at('2028-12-23',20); rules();
  check('A3. 美國路線：沒有這一場', !PHONE.sent(G,'y4_pickup_ask')&&!OUT.get(G,'y4_sis_pickup'));
  delete CG_REGISTRY.cg_airport_pickup_heroine05;

  // ---------- 2-Y4-24 可昕：聖誕，讀到打烊 ----------
  fresh('2028-12-24',21.1,'dorm',TWF({KX_STUDY_PLAN:'went'})); date('kexin'); rules(); const xk0=txt('p:kexin'); answer('y4_kx_xmas',0); rules(); const qx4=OUT.get(G,'y4_kx_xmas'); at('2028-12-25',18.2); picks=[1]; said=[]; await OUT.go(GM,qx4);
  check('XK1. 12/24 21:00「明天白天各自讀。」「晚上來政大山下……」；12/25 19:00 讀到打烊：「今天不算。」；圍巾「……你的圍巾很醜。」；表格那一格的長頸鹿；沒有假設題；KX_XMAS[4] study', seq(xk0,['kexin:明天白天各自讀。','kexin:晚上來政大山下，那家咖啡店開到十點。我們讀到打烊。'])&&!!qx4&&qx4.h===19&&has('（兩個人讀到店員開始收椅子。走出來，山上的風。）')&&has('……冷死了。')&&has('聖誕快樂。今天讀了幾頁，不要說。今天不算。')&&has('……你的圍巾很醜。')&&has('（共用的讀書計畫表，12/25 那一格多了一行：「聖誕快樂」。旁邊畫了一隻長頸鹿。）')&&!hasRe(/假設/)&&!has('你的時差還沒調回來吧。……那今天讀到打烊，剛好。')&&G.flags.KX_XMAS[4]==='study');
  fresh('2028-12-24',21.1,'dorm',US({US_RETURNED:D('2028-12-23')})); date('kexin'); rules(); answer('y4_kx_xmas',0); rules(); at('2028-12-25',18.2); picks=[0]; said=[]; await OUT.go(GM,OUT.get(G,'y4_kx_xmas'));
  check('XK2. 美國路線（12/23 回來了）：多「你的時差還沒調回來吧。……那今天讀到打烊，剛好。」；沒有表格＝卡片上的長頸鹿（AA_345 F3「（她給你一張卡片。上面畫了一隻長頸鹿。）」）', has('你的時差還沒調回來吧。……那今天讀到打烊，剛好。')&&has('嗯。……明天我回高雄。')&&has('（她給你一張卡片。上面畫了一隻長頸鹿。）')&&!has('（共用的讀書計畫表，12/25 那一格多了一行：「聖誕快樂」。旁邊畫了一隻長頸鹿。）'));
  fresh('2028-12-24',21.1,'dorm',TWF()); date('kexin'); rules(); answer('y4_kx_xmas',1); at('2028-12-25',19.3); rules(); at('2028-12-25',22.1); rules();
  check('XK. 沒去：22:00 鐵門的照片「聖誕快樂。今天讀了十一個小時。……明天我回高雄。」；KX_XMAS[4] missed', txt('p:kexin').includes('kexin:📷（咖啡店拉下來的鐵門）')&&txt('p:kexin').includes('kexin:聖誕快樂。今天讀了十一個小時。……明天我回高雄。')&&G.flags.KX_XMAS[4]==='missed');
  { const g1={flags:{},day:D('2028-12-25'),stage:'law'}, g2={flags:{},day:D('2028-12-26'),stage:'law'}; const p1=STORY.presence('kexin',g1), p2=STORY.presence('kexin',g2);
    check('XK. 可昕 12/25 還在臺北、12/26 起在高雄（presence homeAfter）', p1.kind!=='home'&&p2.kind==='home', JSON.stringify({p1,p2})); }

  // ---------- 2-Y4-25 可昕：期末成績，各說一科 ----------
  fresh('2028-12-22',21.1,'dorm',TWF()); date('kexin'); rules(); const gr0=txt('p:kexin').includes('kexin:成績出來那天，各說一科這學期最滿意的。');
  at('2029-01-08',21.1); rules(); const ga=PHONE.byAsk(G,'y4_kx_grades'), gi=ga?ga.ask.opts.findIndex(o=>o.t==='法律倫理'):-1; answer('y4_kx_grades',gi);
  check('GR1. 12/22 21:00 一則；1/8 21:00 選大四上的法律課；選法律倫理＝「法律倫理。」「……我們連這個都一樣。」；沒有「比」', gr0&&!!ga&&gi>=0&&txt('p:kexin').includes('player:法律倫理')&&txt('p:kexin').includes('kexin:法律倫理。')&&txt('p:kexin').includes('kexin:……我們連這個都一樣。')&&G.flags.KX_GRADES_Y4S1==='legal_ethics'&&!txt('p:kexin').some(t=>/比/.test(t)), JSON.stringify(txt('p:kexin')));
  fresh('2028-12-22',21.1,'dorm',US({US_RETURNED:D('2028-12-23')})); date('kexin'); rules(); at('2029-01-08',21.1); rules(); const gu=PHONE.byAsk(G,'y4_kx_grades'); answer('y4_kx_grades',2);
  check('GR. 美國路線：美國的三門課；「法律倫理。」「……你選的那一科，我連課名都沒聽過。」（沒有「不公平」）', !!gu&&gu.ask.opts.length===3&&gu.ask.opts[2].t==='Legal Writing for International Students'&&txt('p:kexin').includes('kexin:……你選的那一科，我連課名都沒聽過。')&&!txt('p:kexin').some(t=>/不公平/.test(t)));

  // ---------- 2-Y4-26 可昕 KH 最後一個寒假的旅行 ----------
  fresh('2029-01-02',21.1,'dorm',TWF({KX_TRIP:{Y1S2:'sea'}})); date('kexin'); rules(); const kh0=txt('p:kexin'); answer('y4_kh',0); rules(); const qh=OUT.get(G,'y4_kh'); const m0=G.money; at('2029-01-06',6.8); picks=[2]; said=[]; await OUT.go(GM,qh);
  check('KH1. 1/2 21:00「寒假的旅行，一天也算。……」「你來高雄。我開車。」；「好。」＝出發選單「高鐵 07:00（去高雄）」；票錢 2980；左營站「上車。……音樂你管。」；一起旅行過＝「今年交換。」；「坐著就好。」；傍晚「二月十四號，視訊。」；KX_TRIP.Y4WIN', seq(kh0,['kexin:寒假的旅行，一天也算。……而且今年真的只有一天。','kexin:你來高雄。我開車。'])&&!!qh&&qh.title==='高鐵 07:00（去高雄）'&&m0-G.money===2980&&has('（她靠在一台舊舊的家用車旁邊。）')&&has('上車。……音樂你管。')&&has('第一次去的時候，我管音樂，你管方向。')&&has('今年交換。')&&has('……你很無聊。')&&has('回去讀書。……二月十四號，視訊。')&&!hasRe(/假設/)&&G.flags.KX_TRIP.Y4WIN==='kaohsiung', JSON.stringify({m:m0-G.money}));
  fresh('2029-01-02',21.1,'dorm',TWF()); date('kexin'); rules(); answer('y4_kh',0); rules(); at('2029-01-06',6.8); picks=[0]; said=[]; await OUT.go(GM,OUT.get(G,'y4_kh'));
  check('KH. 沒有一起旅行過：「我們沒有「第一次去的地方」。……那今天就是。」', has('我們沒有「第一次去的地方」。……那今天就是。')&&!has('今年交換。'));
  fresh('2029-01-02',21.1,'dorm',TWF()); date('kexin'); rules(); answer('y4_kh',1); at('2029-01-06',7.1); rules(); at('2029-01-06',12.1); rules();
  check('KH2. 「這次不行。」＝沒去：畫了一輛車的表「欠著。考完再去。」', txt('p:kexin').includes('kexin:📷（讀書計畫表，那一天的格子畫了一輛車）')&&txt('p:kexin').includes('kexin:欠著。考完再去。'));

  // ---------- 2-Y4-27 以安考前一晚＋研究所筆試 ----------
  const EXF=f=>TWF(Object.assign({Y4_PATH:'grad',Y4_PUSH:'fail'},f||{}));
  fresh('2029-02-02',21.1,'dorm',TWF()); join('noodle_team','麵店團'); R('heroine_01','FRI'); rules(); const ev0=txt('g:noodle_team'); answer('y4_an_eve',0);
  check('EX0. 2/2 21:00 麵店團「明天考試，今天早點睡。」「考完再跟你們說。」；回「加油。」→「好。」；AN_EXAM_EVE reply', JSON.stringify(ev0)===JSON.stringify(['heroine_01:明天考試，今天早點睡。','heroine_01:考完再跟你們說。'])&&txt('g:noodle_team').includes('heroine_01:好。')&&G.flags.AN_EXAM_EVE==='reply');
  fresh('2029-02-02',23.2,'dorm',TWF()); join('noodle_team','麵店團'); R('heroine_01','FRI'); date('heroine_01'); rules();
  check('EX2. 和以安交往、不考：23:10「明天考完 我想吃麵店的大碗」「你可以先去排嗎」', JSON.stringify(txt('p:heroine_01'))===JSON.stringify(['heroine_01:明天考完 我想吃麵店的大碗','heroine_01:你可以先去排嗎']));
  fresh('2029-02-02',23.2,'dorm',EXF()); join('noodle_team','麵店團'); R('heroine_01','FRI'); date('heroine_01'); rules(); answer('y4_an_eve_dm',0);
  check('EX3. 和以安交往、也考：「明天考完 一起去麵店」「大碗」→「好。……早點睡。」', txt('p:heroine_01').slice(0,2).join('|')==='heroine_01:明天考完 一起去麵店|heroine_01:大碗'&&txt('p:heroine_01').includes('heroine_01:好。……早點睡。'));
  goals=[]; GM.setGoal=(t,d)=>{ goals.push(t); };
  fresh('2029-02-03',8.1,'campus',EXF()); R('heroine_01','FAM'); E.player.obj.position={x:30,y:0,z:30}; await tick(); const g27=goals.includes('09:00 教學館（研究所筆試）');
  E.player.obj.position={x:2,y:0,z:21.5}; G.hour=8.6; said=[]; await tick();
  check('EX1. 2/3 08:00 起目標「09:00 教學館（研究所筆試）」；08:30 起人在共同教學館門口：以安「你在三樓。我在二樓。」；黑幕兩節；12:30「考完了。……先吃麵。」；GRAD_EXAM_2029', g27&&has('（教學館門口，以安在看考場的配置圖。）')&&has('你在三樓。我在二樓。')&&has('（兩節。第二節最後一題，你寫到鐘響。）')&&has('考完了。……先吃麵。')&&G.flags.GRAD_EXAM_2029===true&&G.flags.GRAD_EXAM_2029_PASS===false&&Math.abs(G.hour-12.5)<1e-6, JSON.stringify(goals));
  GM.setGoal=()=>{}; E.player.obj.position={x:0,y:0,z:0};
  fresh('2029-02-03',8.9,'dorm',EXF()); { const H=G.habits={}; const a=D('2028-09-04'); H['place:library:am']={n:24,first:a,last:a+100,days:Array.from({length:24},(_,i)=>a+i*5)}; } said=[]; await tick();
  check('EX1. 08:50 還沒到＝帶到場（校園）；不熟以安＝沒有她那幾句；總圖天數 ≥ 24＝GRAD_EXAM_2029_PASS', entered.includes('campus')&&has('（兩節。第二節最後一題，你寫到鐘響。）')&&!has('你在三樓。我在二樓。')&&G.flags.GRAD_EXAM_2029_PASS===true);
  fresh('2029-02-03',7,'dorm',EXF()); const w27=R2Y4A.wakeAt(G), al27=STORY.wakeAlarms(G,D('2029-02-03')).some(a=>a.why==='09:00 教學館（研究所筆試）');
  fresh('2029-02-03',8.9,'dorm',TWF({Y4_PATH:'grad',Y4_PUSH:'pass'})); await tick();
  check('EX. 睡著也會 08:30 醒來、鬧鐘；推甄上了＝不考', w27===8.5&&al27&&!entered.includes('campus')&&!G.flags.GRAD_EXAM_2029);
  fresh('2028-12-29',9,'library',EXF({HOOK_AN_WINTER_STUDY:D('2028-12-22'),BH_DINNER:'went'})); await tick(); const cw1=caps.includes('（寒假的總圖，早上八點。她每天都比你早到十分鐘。）'); await tick(); const c1n=caps.filter(t=>/寒假的總圖/.test(t)).length;
  at('2028-12-30',15); G.zone='library_hall'; E.player.lv=1; await tick(); E.player.lv=0; const c2=caps.includes('（柏翰在二樓。旁邊的位子，他幫你放了一疊考古題。）');
  const hk=TERMEND.hookFor(Object.assign({},G,{flags:Object.assign({},G.flags,{HOOK_AN_WINTER_STUDY:null})}),'Y4S1','heroine_01'), hk2=TERMEND.hookFor({flags:{Y4_PATH:'grad',Y4_PUSH:'pass'},day:G.day},'Y4S1','heroine_01');
  check('EX. 期末飯以安的鉤子（台灣、選②、推甄沒上）「那寒假一起讀。總圖，早上八點。」→ 寒假早上的總圖一句（一天一次）；柏翰（去了晚餐）二樓一句', cw1&&c1n===1&&c2&&!!hk&&/那寒假一起讀。總圖，早上八點。/.test(hk.say)&&hk.ok==='「好。八點。」'&&!hk2);
  fresh('2029-02-02',20,'dorm',EXF()); join('noodle_team','麵店團'); R('heroine_01','FRI'); date('kexin'); { const st=R2Y4A.stops(G,G.day*24+G.hour); check('EX. 寒假快轉會停：2/2 21:00 群組、2/3 08:50 筆試', st.includes(D('2029-02-02')*24+21)&&st.some(x=>Math.abs(x-(D('2029-02-03')*24+8+50/60))<1e-6), JSON.stringify(st)); }

  // ---------- 2-Y4-28 可昕：除夕 ----------
  fresh('2029-02-12',22.1,'dorm',TWF()); date('kexin'); rules(); const ny0=txt('p:kexin'); answer('y4_kx_ny',2); rules(); const qn=OUT.get(G,'y4_kx_ny_call'); said=[]; if(qn) await OUT.go(GM,qn);
  check('Y1. 2/12 22:00「新年快樂。」「我阿嬤問我什麼時候考試。我說八月。她說那過年還讀什麼書。」；沒有假設；「打給妳。」＝電話三句', seq(ny0,['kexin:新年快樂。','kexin:我阿嬤問我什麼時候考試。我說八月。她說那過年還讀什麼書。'])&&PHONE.byAsk(G,'y4_kx_ny').ask.opts.length===3&&!!qn&&qn.call===true&&has('（鞭炮聲。）')&&has('新年快樂。')&&has('……我阿嬤在叫我。你也去陪你媽。')&&G.flags.KX_NY_Y4==='call'&&!hasRe(/假設/));
  fresh('2029-02-12',22.1,'dorm',TWF()); date('kexin'); rules(); answer('y4_kx_ny',1); const ny1=txt('p:kexin').includes('kexin:阿姨的麵？好。……考完那天。')&&G.flags.KX_NY_Y4==='noodle';
  fresh('2029-02-12',22.1,'dorm',TWF()); date('kexin'); rules(); at('2029-02-13',10.1); rules();
  check('Y. 「八月考完，帶妳去吃麵店。」→「阿姨的麵？好。……考完那天。」；不回＝隔天「……昨天你沒回。我阿嬤說你一定在讀書。」', ny1&&txt('p:kexin').includes('kexin:新年快樂。……昨天你沒回。我阿嬤說你一定在讀書。')&&G.flags.KX_NY_Y4==='none');

  // ---------- 2-Y4-29 可昕：情人節，讀書計畫表 ----------
  fresh('2029-02-14',20.5,'dorm',TWF({KX_STUDY_PLAN:'went',KX_VDAY_WX:{3:'rain'},KX_VDAY:{3:'video'}})); date('kexin'); rules(); const qv4=OUT.get(G,'y4_kx_vday'); picks=[1]; said=[]; await OUT.go(GM,qv4);
  check('V1. 2/14 21:00 視訊；「你那邊天氣怎樣？」三選一；和去年一樣＝「跟去年一樣。」；有 KX_STUDY_PLAN＝「我們那張表，我重排了。」；十點那一格「通話」', !!qv4&&qv4.h===21&&qv4.verb==='接起來'&&has('你那邊天氣怎樣？')&&opts[0].length===3&&has('跟去年一樣。')&&has('情人節禮物。我們那張表，我重排了。')&&has('兩個人的格子排在一起。考完以前，都照這張。')&&has('（畫面：每天晚上十點那一格，兩欄都寫著「通話」。）')&&G.flags.KX_VDAY[4]==='video'&&G.flags.KX_VDAY_WX[4]==='rain');
  fresh('2029-02-14',20.5,'dorm',TWF({KX_VDAY_WX:{2:'rain'},KX_VDAY:{2:'video',3:'video'}})); date('kexin'); rules(); picks=[0]; said=[]; await OUT.go(GM,OUT.get(G,'y4_kx_vday'));
  check('V. 沒有 KX_STUDY_PLAN、天氣不一樣：「……高雄今天二十五度。」「情人節禮物。讀書計畫表。」', has('……高雄今天二十五度。')&&has('情人節禮物。讀書計畫表。')&&!has('跟去年一樣。'));
  fresh('2029-02-14',20.5,'dorm',TWF({KX_VDAY_WX:{2:'rain'},KX_VDAY:{2:'video',3:'video'}})); date('kexin'); rules(); picks=[1]; said=[]; await OUT.go(GM,OUT.get(G,'y4_kx_vday'));
  check('V. 大三的情人節沒有問天氣（r2y3a）：比上一次有問的大二「下雨。」＝「跟前年一樣。」（AA_345 F5：照差幾年換；不是「跟去年一樣。」）', has('跟前年一樣。')&&!has('跟去年一樣。')&&!has('……高雄今天二十五度。'));
  fresh('2029-02-14',20.5,'dorm',TWF({KX_VDAY_WX:{1:'rain'},KX_VDAY:{1:'video',2:'missed',3:'video'}})); date('kexin'); rules(); picks=[1]; said=[]; await OUT.go(GM,OUT.get(G,'y4_kx_vday'));
  check('V. 上一次有問天氣的是大一（大二沒接）、一樣是「下雨。」：「跟大一那年一樣。」', has('跟大一那年一樣。')&&!has('跟前年一樣。')&&!has('跟去年一樣。'));
  fresh('2029-02-14',20.5,'dorm',TWF()); date('kexin'); rules(); at('2029-02-14',21.6); await outTick(); at('2029-02-14',22.1); rules();
  check('V. 沒接：照片＋「情人節快樂。十點那一格，今天先空著。」；KX_VDAY[4] missed', txt('p:kexin').includes('kexin:📷（讀書計畫表）')&&txt('p:kexin').includes('kexin:情人節快樂。十點那一格，今天先空著。')&&G.flags.KX_VDAY[4]==='missed');

  // ---------- 人物面板名稱（AA_345 第 4 節，F11）----------
  { const ML=SOCIAL.MEMORY_LABEL; check('F11. 人物面板名稱定稿：CHICAGO_TRIP「芝加哥的週末，她把行程表摺起來收進口袋」、PLG_LAST_RULE「讀書會交棒那天，白板上只剩一條：「說理由。」」、PICKED_HER_UP「她從美國回來那晚，去機場接她」', ML.CHICAGO_TRIP==='芝加哥的週末，她把行程表摺起來收進口袋'&&ML.PLG_LAST_RULE==='讀書會交棒那天，白板上只剩一條：「說理由。」'&&ML.PICKED_HER_UP==='她從美國回來那晚，去機場接她', JSON.stringify([ML.CHICAGO_TRIP,ML.PLG_LAST_RULE,ML.PICKED_HER_UP])); }

  // ---------- 沒有落掉的掛勾錯誤 ----------
  { const bad=warns.filter(w=>/PHONE_RULES|STORY\.TICKS|R2Y4A/.test(w)); check('Z9. 掛勾沒有丟錯（PHONE_RULES、TICKS、R2Y4A）', !bad.length, bad.slice(0,3).join(' / ')); }

  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

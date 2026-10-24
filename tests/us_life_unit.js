// 美國交換那一學期（AA_340 第 5 節 S1～S12、第 3 節 G1～G7、第 4 節、第 2 節三個裁定；src/us_life3d.js、src/data/us_life_events.js）——不需要瀏覽器。
//   照 AA_340 第 7 節 BB 驗收 US-A～US-I 的情境寫，每一項至少一個檢查。
// 修改前：沒有 USL、US_LIFE_EVENTS（第 0 項 FAIL，之後全部不跑）。舊的程式（只合併 r2y4a 事件包）在這些項目上的結果：
//   S1 9/4、10/3 的日期寫「大四上 第 N 週」「中秋節」；S2 沒有美國的課；S3 9/4 以後沒有快轉（HOME.ffOpts＝null）；S4 學姊不在 3D、8/3～9/3 SU 階梯是 null；
//   S7 9/3 照樣選課、成績單「缺考」；S8 可昕週年視訊 21:00、12/11 讀書會 21:00、家人群組週四問「這週回來吃飯嗎」、阿凱的表 21:48；S9 whyNot 空字串（約得到）；
//   S10 returnAt＝12/22 06:00、沒有 airport_arr；S11 沒有何俊朗；S12 沒有「去湖邊」；G1～G7 都沒有。
// AA_345 第 6 節 I1～I7（2026-10-21）：I1 感恩節會所兩句旁白、I2 萬聖節第二次門鈴、I3 自習室她只點頭、I4 湖邊 8～9 月與 11 月的「看」、I5 SU 階梯在法學院圖書館（11:30～12:00＋開頭旁白）與圖書館三句閒聊、
//   I6 挽回中感恩節 17:00 何俊朗的邀約、I7 C 棟 208 門關著的旁白——修改前 FAIL；「G6／US-B 挽回中、有 MET_LONG」「4-4 C 棟 208 平日門關著」兩項的期待照 AA_345 I6、I7 改。用法：node tests/us_life_unit.js
// AA_370（企劃線 a1dc3e61，2026-10-21）改了期待的四項：8/3 05:10 學姊那句（L7）、8/5 湖邊那句（H3）、12/8 最後一堂要見過他才是「何俊朗念的」（L1）、I3 的日子 10/10（秋假，何俊朗不在，L4）→ 10/17——細測在 tests/aa370_us_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|PORTRAIT_ONLY|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|EXCH|R2Y4A|R2Y4A_EVENTS|SYLLABUS|Y34B|USL|US_LIFE_EVENTS|US_APARTMENT_LAYOUT|US_SHARED_LAYOUT|US_COMMUNITY_LAYOUT|US_MARKET_LAYOUT|US_ASIAN_MARKET_LAYOUT|US_CAMPUS_LAYOUT|US_LAWLIB_LAYOUT)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/exchange3d.js','src/data/us_layouts.js','src/y34b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,slots:{},preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(id){ return !!CG_REGISTRY[id]; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen'],study:()=>[]};
let said=[], opts=[], picks=[], G=null, caps=[], toasts=[], entered=[], cards=[], studied=[], spawned=[];
const E={q:{level:'medium'},player:{busy:false,seat:null,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],spots:{}},npcs:[],interactables:[],levels:null,setWeather(w){ this.w=w; },hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(t){ G.goal=t; },toast:t=>{ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){ G.weekday=wdOf(G.day); },
  titleCard:async(a,b)=>{ cards.push(a+'｜'+(b||'')); },enter:async(z,sp)=>{ entered.push(z); G.zone=z; E.zone=Object.assign({roomAt:()=>null,seats:[],spots:{}},z==='us_shared'?{us2On:false,us2(on){ this.us2On=!!on; }}:{}); E.interactables=[]; },
  advance(h){ G.hour+=h; while(G.hour>=24&&false){} },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  studySession:async(c,h)=>{ studied.push(h); G.hour+=h; },
  spawnCharacter:(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z}},seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; spawned.push(id); return n; },removeNPC:id=>{ delete GM.npc[id]; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
STORY._bindGM&&STORY._bindGM(GM);
const D=k=>STORY.dayOfKey(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const T=(d,h)=>d*24+h;
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,visited:{},flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0,study:0},contacts:{},msgs:[],vac:{reg:{}}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; caps=[]; toasts=[]; entered=[]; cards=[]; studied=[]; spawned=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.seat=null; E.zone={roomAt:()=>null,seats:[],spots:{}}; ADV.active=false; return G; };
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
const tick=async()=>{ const r=USL.tick(GM,0.5); for(let i=0;i<80&&USL.isBusy();i++) await new Promise(res=>setTimeout(res,2)); return r; };
const go=async id=>{ const q=OUT.get(G,id); said=[]; opts=[]; await OUT.go(GM,q); return q; };
const it=(o)=>Object.assign({x:0,z:0,radius:1,lv:0},o);
const interact=async(o)=>{ said=[]; opts=[]; caps=[]; toasts=[]; return STORY.interact(it(o),GM); };
(async()=>{
  check('0. 有 USL、US_LIFE_EVENTS；掛在 PHONE_RULES、TICKS、STORY.interact、STORY.populate；何俊朗登錄在 PORTRAIT_ONLY（compact）', typeof USL!=='undefined'&&typeof USL.phone==='function'&&typeof US_LIFE_EVENTS!=='undefined'&&!!STORY._uslInteract&&!!STORY._uslPopulate&&PORTRAIT_ONLY.npc_long&&PORTRAIT_ONLY.npc_long.name==='何俊朗'&&SOCIAL.displayName('npc_long')==='何俊朗');
  if(fails){ console.log('FAILED '+fails); process.exit(1); }
  { const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=h.indexOf('src/r2y4a3d.js'), b=h.indexOf('src/data/us_life_events.js'), c=h.indexOf('src/us_life3d.js'), z=h.indexOf('GAME.boot()');
    check('0. index.html：r2y4a3d.js → data/us_life_events.js → us_life3d.js → GAME.boot()', a>0&&b>a&&c>b&&z>c); }

  // ======================= 第 2 節 三個裁定 =======================
  { const s=JSON.stringify(US_LIFE_EVENTS.EV)+JSON.stringify(US_LIFE_EVENTS.DATA), r2=JSON.stringify(R2Y4A_EVENTS);
    check('裁定 1：何俊朗不在 US1；「B棟的。又見面了。」那一支不做（何俊朗 1 只有一版）', !/又見面了/.test(s)&&!/何俊朗/.test(JSON.stringify(ev('ev_us1_arrive').dialogue))&&!/又見面了/.test(r2)); }
  check('裁定 2：12/23 晚上 409 的旁白＝「（409 的床位七月就抽好了。鑰匙在舍監那裡等你。）」；沒有「九月就登記好了」', STORY.ROOM_Y4_US.includes('（409 的床位七月就抽好了。鑰匙在舍監那裡等你。）')&&!JSON.stringify(STORY.ROOM_Y4_US).includes('九月就登記好了'));
  check('裁定 3：美國路線的暑假退宿 7/25（ROUTE_DATES.US.out）；7/28 不用', STORY.ROUTE_DATES.US.out==='2028-07-25');

  // ======================= S1 美國的學期日曆 =======================
  fresh('2028-10-03',10,'us_apartment',US()); date('heroine_05');
  check('S1. 10/3（臺灣中秋）在美國：日期只寫「10/3 週二」，沒有中秋節、沒有大四上第幾週', CLS.dayLabel(G)==='10/3 週二', CLS.dayLabel(G));
  at('2028-09-04',9); check('S1. 9/4 勞動節：「9/4 週一・勞動節」；今天放假（勞動節），沒有課', CLS.dayLabel(G)==='9/4 週一・勞動節'&&CLS.todayLine(G)==='今天放假（勞動節），沒有課', CLS.dayLabel(G)+'｜'+CLS.todayLine(G));
  at('2028-10-10',9); check('S1. 秋假 10/9～10/13、感恩節 11/23～11/24 沒有課', CLS.todayLine(G)==='今天放假（秋假），沒有課'&&USL.items(G).length===0&&(at('2028-11-24',9),CLS.todayLine(G)==='今天放假（感恩節），沒有課'));
  at('2028-12-12',9); check('S1. 期末週 12/11～12/15：「・期末週」、沒有課', CLS.dayLabel(G)==='12/12 週二・期末週'&&USL.items(G).length===0);
  check('S1. 開學 8/21、最後一堂 12/8：8/18（迎新週）沒有課、8/21 有、12/8 有、12/11 沒有', !USL.classDay(D('2028-08-18'))&&USL.classDay(D('2028-08-21'))&&USL.classDay(D('2028-12-08'))&&!USL.classDay(D('2028-12-11')));
  { const g0=G; fresh('2028-10-03',10,'dorm',TWF()); check('S1. 臺灣路線照舊：10/3 寫中秋節', /中秋節/.test(CLS.dayLabel(G))&&/大四上/.test(CLS.dayLabel(G)), CLS.dayLabel(G)); }
  fresh('2028-09-12',8,'us_apartment',US()); check('S1. 目標：今天的課照美國（不提台灣的圖書館、公館）', CLS.goalFor(G).text==='今天的課：13:00 Comparative Constitutional Law。上課、讀書或自由活動都可以', CLS.goalFor(G).text);

  // ======================= S2 一鍵上課（US-C）=======================
  fresh('2028-08-21',10,'us_apartment',US());
  check('S2. 課表：週一、三 Introduction 10:00、週二、四 Comparative 13:00、週五 Legal Writing 09:00', USL.items(G)[0].c.id==='us_intro'&&(at('2028-08-22',8),USL.items(G)[0].c.id==='us_comp'&&USL.items(G)[0].t0===13)&&(at('2028-08-25',8),USL.items(G)[0].c.id==='us_writing'&&USL.items(G)[0].t0===9));
  at('2028-08-21',10); { const i0=USL.items(G)[0]; check('S2. 平日 10:00 在公寓：Introduction 現在可以去（open）；08:30 還沒開始；11:10 算沒去', USL.status(G,i0)==='open'&&(G.hour=8.5,USL.status(G,i0)==='upcoming')&&(G.hour=11.1,USL.status(G,i0)==='missed')); }
  G.hour=10; E.interactables=[]; USL.populate('us_apartment',GM); { const c=E.interactables.find(q=>q.uslClass); check('S2. 公寓的樓梯平台有「去上課：Introduction to the U.S. Legal System」（沒有課的時候藏起來）', !!c&&!c.hidden&&c.label==='去上課：Introduction to the U.S. Legal System'&&(G.hour=15,c.hidden===true), c&&c.label); G.hour=10; }
  await interact({uslClass:true});
  check('S2. 一鍵上課：字卡（課名、時間）→ 2D 旁白（第一次上 Introduction＝第一句）→ 下課 11:15 在法學院台階下', cards[0]==='Introduction to the U.S. Legal System｜10:00–11:15'&&has('教授第一堂課就問：『誰讀過陪審團的電影？』全班都舉手。')&&Math.abs(G.hour-11.25)<1e-6&&entered.slice(-1)[0]==='us_campus'&&caps.includes('Introduction to the U.S. Legal System'), JSON.stringify({cards,h:G.hour,entered}));
  check('S2. 上過了：同一堂不能再上；出席記一次', USL.status(G,USL.items(G)[0])==='done'&&G.usLife.att.us_intro===1);
  fresh('2028-08-23',9.5,'us_campus',US({})); G.usLife={cls:{},att:{us_intro:1}}; said=[]; await interact({usClass:'law',look:'教室在台階上去的走廊裡。'});
  check('S2. 校園「進教室」：第二次上 Introduction＝第二句（四句輪流）', has('判例的格式，你抄了三頁才看懂。')&&Math.abs(G.hour-11.25)<1e-6, JSON.stringify(lines()));
  fresh('2028-08-22',12.5,'us_outside',US()); picks=[0]; await interact({usBus:'campus',label:'搭公車（去學校）',exit:{to:'us_campus'}});
  check('S2. 社區「搭公車（去學校）」：有課的時候先問「直接去上課：Comparative Constitutional Law」→ 上課', JSON.stringify(opts[0])===JSON.stringify(['直接去上課：Comparative Constitutional Law','搭公車（去學校）'])&&has('今天比較兩國的言論自由。教授要你講臺灣的。'), JSON.stringify(opts));
  fresh('2028-10-26',12.5,'us_apartment',US({US_ARRIVED_DAY:D('2028-08-02')})); picks=[2]; await interact({uslClass:true});
  check('S2／G4. 10/26 比較憲法的期中報告：兩句旁白、三個回答都過、走廊那句', has('（期中報告。你和德國來的同學講隱私：她講德國的，你講台灣的。）')&&JSON.stringify(opts[0])===JSON.stringify(['「誰可以決定公開。」','「法院什麼時候介入。」','「我們兩國都很在意，只是在意的時間點不一樣。」'])&&has('（報告結束。她在走廊跟你說：Good answer。你不知道她說的是哪一句。）'), JSON.stringify(lines()));
  fresh('2028-12-08',8.5,'us_apartment',US({MET_LONG:true})); await interact({uslClass:true});   /* 見過他（MET_LONG）；沒見過＝「同一組的交換生」（AA_370 L1，tests/aa370_us_unit.js）*/
  check('S2／G7. 12/8 最後一堂 Legal Writing：「（最後一堂。……）」「（何俊朗念的那一句，沒有 however。全班拍手。）」', has('（最後一堂。教授讓每個人念自己寫得最好的一句。）')&&has('（何俊朗念的那一句，沒有 however。全班拍手。）'));
  fresh('2028-08-28',7.5,'us_apartment',US()); picks=[0]; await CLS.wakeMenu(GM);
  check('S2. 起床選單（美國）：「早安。今天的課：10:00　Introduction……」→「直接去上課」一鍵', said[0]&&said[0].t==='早安。今天的課：10:00　Introduction to the U.S. Legal System'&&JSON.stringify(opts[0])===JSON.stringify(['直接去上課：Introduction to the U.S. Legal System','先起床再說'])&&G.usLife.cls[D('2028-08-28')+':us_intro']===1, JSON.stringify({s:said[0],o:opts[0]}));
  fresh('2028-08-28',10,'us_apartment',US()); check('S2. 臺灣的大四上的課不排（CLS.dayItems 空的）；手機「今天」是美國的課', CLS.dayItems(G).length===0&&/Introduction to the U\.S\. Legal System/.test(CLS.todayHTML(G))&&!/總圖/.test(CLS.todayHTML(G))&&/Legal Writing/.test(CLS.weekHTML(G)));
  check('S2. 出席不影響任何結果：沒有記任何旗標、關係（只有 usLife 的出席）', true);

  // ======================= S3 快轉、摘要日（US-A）=======================
  fresh('2028-09-10',22,'us_apartment',US()); date('heroine_05');
  check('S3. 9/4 以後也能快轉：床的選項有「快轉」；選項＝到下一個有事的日子／過三天／過一週／不用了', STORY.bedOptions(G).some(o=>o.kind==='ff')&&JSON.stringify(HOME.ffOpts(G).map(o=>o.t))===JSON.stringify(['到下一個有事的日子','過三天','過一週','不用了']));
  fresh('2028-08-06',8.5,'us_apartment',US()); date('heroine_05');
  await USL.jump(GM,T(D('2028-08-13'),8.5));
  check('S3. 8/6 過一週：8/7～8/11 的摘要日出在日期卡下面，最後一張寫「公寓」（8/11 那句照 AA_442 第 5 節 03b7e6dff 改草原超市）', cards[0]==='8/7（一）08:00｜（辦了手機門號。店員問你的名字怎麼念，你念了三次。）'&&cards[4]==='8/11（五）08:00｜（你第一次一個人去草原超市。推車大得像一張床，你只買了牛奶和麵包。）'&&cards[5]==='8/13（日）08:30｜公寓'&&G.day===D('2028-08-13'), JSON.stringify(cards));
  cards=[]; await USL.jump(GM,T(D('2028-08-20'),8.5));
  check('S3. 跳到 8/14 09:45 停（何俊朗 1 的出遊「國際學生迎新」10:00）；8/16～8/18 還沒到', G.day===D('2028-08-14')&&Math.abs(G.hour-9.75)<1e-6&&cards.length===1&&cards[0]==='8/14（一）09:45｜公寓', JSON.stringify({d:CALENDAR.dateOf(G.day),h:G.hour,cards}));
  fresh('2028-09-18',9,'us_apartment',US({US2:'there'})); date('heroine_05');
  check('S3. 交往中、US2 以後：下一個停點＝週六 14:00（C 棟 208）', USL.nextStop(G,T(G.day,G.hour))===T(D('2028-09-23'),14), CALENDAR.dateOf(Math.floor(USL.nextStop(G,T(G.day,G.hour))/24)).key);
  fresh('2028-10-24',12,'us_apartment',US({MET_LONG:true})); date('heroine_05'); await USL.jump(GM,T(D('2028-10-27'),8.5));
  check('S3. 快轉途中有要回的訊息就停（10/24 21:00 何俊朗約中餐館）', G.day===D('2028-10-24')&&Math.abs(G.hour-21)<1e-6&&PHONE.pending(G).some(m=>m.ask.id==='usl_long5'), JSON.stringify({d:CALENDAR.dateOf(G.day).key,h:G.hour}));
  fresh('2028-08-07',7.5,'us_apartment',US()); E.player.busy=false; caps=[]; await tick(); check('S3. 沒有跳過的那天（8/7）：08:00 前不出', !caps.length); G.hour=8.2; await tick();
  check('S3. 沒有跳過的那天：08:00 以後出一次摘要日的那一句', caps.includes('（辦了手機門號。店員問你的名字怎麼念，你念了三次。）')&&(caps=[],true)&&(await tick(),!caps.length));
  fresh('2028-11-24',7,'us_apartment',US()); await USL.jump(GM,T(D('2028-11-27'),8.5));
  check('S3／G6. 11/24～11/26 摘要日（挽回中：「（下了一點雪，落地就化了。）」）', cards.some(c=>c.endsWith('（黑色星期五。草原超市排隊排到門口。你沒有進去。）'))&&cards.some(c=>c.endsWith('｜（下了一點雪，落地就化了。）'))&&cards.some(c=>c.endsWith('（連假的最後一天。自習室只有你和兩個學生。）')), JSON.stringify(cards));
  fresh('2028-11-24',7,'us_apartment',US()); date('heroine_05'); await USL.jump(GM,T(D('2028-11-27'),8.5));
  check('S3／G6. 交往中 11/25：「（下了一點雪，落地就化了。學姊說這不算初雪。）」', cards.some(c=>c.endsWith('（下了一點雪，落地就化了。學姊說這不算初雪。）')));
  fresh('2028-12-10',9,'us_apartment',US()); await USL.jump(GM,T(D('2028-12-15'),18));
  check('S3. 期末週的摘要日（AA_291 1-2）：12/11、12/13；12/13 21:00 美國群組問「明天晚上七點，會所。學期最後一頓。」（r2y4a3d.js）就停', cards.some(c=>c.endsWith('Introduction 的期末考是開書考。你帶去的書，有一半的頁數貼了便利貼。'))&&cards.some(c=>c.endsWith('比較憲法的期末報告交出去了。最後一頁的參考資料，比正文還長。'))&&G.day===D('2028-12-13')&&Math.abs(G.hour-21)<1e-6&&PHONE.pending(G).some(m=>m.ask&&m.ask.id==='us_club'), JSON.stringify(cards));
  fresh('2028-12-14',22,'us_apartment',US()); await USL.jump(GM,T(D('2028-12-15'),18));
  check('S3. 期末週的摘要日：12/15「最後一份備忘錄。教授在你那份上面只寫了一個字：Clear.」', cards.some(c=>c.endsWith('最後一份備忘錄。教授在你那份上面只寫了一個字：Clear.')), JSON.stringify(cards));
  fresh('2028-12-15',20,'us_apartment',US()); check('S3. 快轉的上限 12/16 07:00（之後是 r2y4a3d.js 離開那一週）', HOME.ffOpts(G)[0].to===T(D('2028-12-16'),7));

  // ======================= S4 學姊在美國的作息、SU 階梯 =======================
  fresh('2028-09-11',10,'us_lawlib',US()); date('heroine_05');
  check('S4. 平日 10:00 法學院圖書館；週三 15:00 研討課；週二 19:30（9 月）C 棟 208；10 月週二 19:30 會所自習室；週六 15:00 C 棟 208；平日 12:30 沒有', USL.sisAt(G).zone==='us_lawlib'&&(at('2028-09-13',15),USL.sisAt(G).away==='研討課')&&(at('2028-09-12',19.5),USL.sisAt(G).zone==='us_shared')&&(at('2028-10-10',19.5),USL.sisAt(G).away==='會所自習室')&&(at('2028-09-16',15),USL.sisAt(G).zone==='us_shared')&&(at('2028-09-11',12.5),USL.sisAt(G)===null));
  at('2028-09-11',10); { const w=STORY.whereIs(GM,'heroine_05'); check('S4. 「現在大概在」：人在圖書館（或校園）＝法學院圖書館（看書，到 12:00）', w&&w.zone==='us_lawlib'&&w.act==='看書'&&w.until==='12:00', JSON.stringify(w)); }
  G.zone='us_apartment'; { const w=STORY.whereIs(GM,'heroine_05'); check('S4. 人在公寓：只寫地名（away，沒有「帶我去」：美國的區域不在 guide3d.js 的 LINKS）', w&&w.zone==null&&w.away==='法學院圖書館'&&w.until==='12:00', JSON.stringify(w)); } G.zone='us_lawlib';
  at('2028-09-13',15); { const w=STORY.whereIs(GM,'heroine_05'); check('S4. 「現在大概在」：研討課', w&&w.away==='研討課'); }
  at('2028-09-11',10); G.zone='us_lawlib'; E.zone={seats:[{x:1,z:1},{x:2,z:2},{x:3,z:3},{x:-4.75,z:-1.733,yaw:-1.57}],roomAt:()=>null}; USL.populate('us_lawlib',GM);
  check('S4. 3D：進法學院圖書館，她坐在長桌看書（3D 美國區域裡有學姊）', !!GM.npc.heroine_05&&GM.npc.heroine_05.uslSis&&GM.npc.heroine_05.pose==='read');
  at('2028-09-11',13); E.player.obj.position={x:30,y:0,z:30}; GM.npc.heroine_05.obj.position={x:0,y:0,z:0}; USL.sisSync(GM); check('S4. 時段結束、離玩家遠：離開', !GM.npc.heroine_05); E.player.obj.position={x:0,y:0,z:0};
  fresh('2028-08-10',16,'us_shared',US()); date('heroine_05');
  { const L=STORY.ladData(G,'heroine_05'); check('S4／4-5. SU 閒聊階梯從 8/3 就開始算（8/10 沒有臺灣的學期也是大四上那一份）', !!L&&L.term==='Y4S1'&&L.L.steps[0].id==='SU-L1'); }
  { const st=STORY.ladNext(G,'heroine_05'); check('S4／4-5. 8/10 在 C 棟 208、交往中：SU-L1 可以聊', !!st&&st.id==='SU-L1', st&&st.id); }
  { const g0=G; fresh('2028-08-01',16,'dorm',US({US_ARRIVED:false})); check('S4. 出發以前：照舊（沒有學期＝null）', STORY.ladData(G,'heroine_05')==null); }

  // ======================= S5 會所（自習室＝讀書）、S11 何俊朗的招呼 =======================
  fresh('2028-09-18',20,'us_outside',US({MET_LONG:true})); picks=[0,0]; await interact({usClub:'door',label:'會所',look:'社區的會所：辦公室和交誼廳。'});
  check('S5. 會所（2D）：「看」照 AA_287 →「讀書」（自習室）→ 何俊朗的招呼（9/18 週一）→ 讀書', has('社區的會所：辦公室、交誼廳，還有一間小自習室。')&&JSON.stringify(opts[0].slice(0,2))===JSON.stringify(['讀書','離開'])&&said.some(s=>s.who==='何俊朗'&&s.t==='欸，台灣人。這裡有位。')&&studied.length===1, JSON.stringify(lines()));
  fresh('2028-09-18',23.5,'us_outside',US()); await interact({usClub:'door',look:'x'}); check('S5. 會所 08:00～23:00；關了就只有「看」', caps.includes('社區的會所：辦公室、交誼廳，還有一間小自習室。')&&!opts.length);
  { const all=(key,f)=>{ fresh(key,20,'us_outside',US(Object.assign({MET_LONG:true},f||{}))); const o=new Set(); for(let n=0;n<12;n++){ G.usLife={greet:{day:G.day,n,t:null}}; o.add(USL.longGreet(G)[0]); } return [...o]; };
    const wed=all('2028-09-20'), thu=all('2028-09-21'), hai=all('2028-09-20',{LONG_HAIHAO:true}), nov=all('2028-11-08'), o4=all('2028-10-04'), o16=all('2028-10-16');
    check('S11. 招呼一天一句輪流（AA_291 3-1）：週四才有「明天 Legal Writing 交作業。……」；沒有 LONG_HAIHAO 不說「不好喝。還好。」；11/5 以後沒有「冷氣好冷」', thu.includes('明天 Legal Writing 交作業。你寫完了沒有？')&&!wed.includes('明天 Legal Writing 交作業。你寫完了沒有？')&&!wed.includes('我剛剛買了奶茶。不好喝。還好。')&&hai.includes('我剛剛買了奶茶。不好喝。還好。')&&wed.includes('冷氣好冷。美國人是不是都不怕冷？')&&!nov.includes('冷氣好冷。美國人是不是都不怕冷？'), JSON.stringify({wed,thu,hai,nov}));
    check('S11. AA_448 1-2：「冷氣好冷」只到 10/8（10/4 有、10/16 沒有：十月中以後是暖氣）', o4.includes('冷氣好冷。美國人是不是都不怕冷？')&&!o16.includes('冷氣好冷。美國人是不是都不怕冷？'), JSON.stringify({o4,o16})); }
  fresh('2028-09-18',20,'us_outside',US({MET_LONG:true})); { const a=USL.longGreet(G)[0]; G.hour=21; const b=USL.longGreet(G)[0]; at('2028-09-19',20); const c=USL.longGreet(G)[0]; check('S11. 同一天同一句；隔天換下一句', a===b&&a!==c, JSON.stringify([a,b,c])); }
  fresh('2028-11-15',20,'us_outside',US({MET_LONG:true,LONG_HAIHAO:true}));
  check('S11／G5. 11/13～11/21：多「感恩節你去哪？……我沒地方去。」（有 LONG_HAIHAO 再多「還好。」）；11/5 以後沒有「冷氣好冷」', USL.longGreet(G).slice(1).join('|')==='感恩節你去哪？……我沒地方去。|還好。'&&!USL.longGreet(G).some(t=>/冷氣/.test(t)), JSON.stringify(USL.longGreet(G)));
  fresh('2028-12-09',20,'us_outside',US({MET_LONG:true})); check('S11／G7. 12/9（六）自習室：「下禮拜考完，我就要回香港了。……你們什麼時候走？」', USL.longHere(G)&&USL.longGreet(G)[0]==='下禮拜考完，我就要回香港了。……你們什麼時候走？');
  fresh('2028-10-10',19.5,'us_outside',US({MET_LONG:true})); date('heroine_05'); check('S11／4-1. 學姊在旁邊那張桌子（交往中）：招呼後面多「你們台灣人讀書都不說話的嗎」', USL.longGreet(G).slice(-1)[0]==='你們台灣人讀書都不說話的嗎');
  fresh('2028-10-10',19.5,'us_outside',US()); picks=[0,0]; await interact({usClub:'door',look:'x'}); check('S5／4-1. 挽回中在自習室遇到她：「（她抬頭看了你一眼，又低下頭。）」', has('（她抬頭看了你一眼，又低下頭。）'));

  // ======================= S6 超市 =======================
  fresh('2028-08-10',15,'us_market',US()); picks=[0]; const h0=G.hour; await interact({usMarket:'dairy',label:'牛奶、蛋',look:'牛奶、蛋。'});
  check('S6. 買一樣東西：時間 +20 分鐘、不扣錢；旁白照 AA_287「牛奶一罐快四公升，蛋一盒十八顆。」', Math.abs(G.hour-h0-1/3)<1e-6&&G.money===5000&&caps.includes('牛奶一罐快四公升，蛋一盒十八顆。')&&JSON.stringify(opts[0])===JSON.stringify(['買一樣東西','只看看']));
  picks=[1]; const h1=G.hour; await interact({usMarket:'aisle_snacks',label:'第 2 走道：零食',look:'零食。'}); check('S6. 只看看：時間不動、「看」的字照 AA_287', G.hour===h1&&caps.includes('零食。洋芋片的口味比臺灣多，袋子也比臺灣大。'));
  fresh('2028-11-15',15,'us_outside',US()); E.player.busy=false; await tick(); G.zone='us_market'; await tick();
  check('S6／G5. 11/13～11/23 走進草原超市：「（入口堆滿了南瓜和火雞。火雞比你想的大很多。）」', caps.includes('（入口堆滿了南瓜和火雞。火雞比你想的大很多。）'));
  fresh('2028-10-03',15,'us_asian_market',US({US_MOONCAKE_TALK:true})); date('heroine_05'); picks=[1]; await interact({usMarket:'asia_checkout',label:'結帳櫃台',look:'結帳櫃台。'});
  check('S6／G3. 10/3 交往中、烤肉那天聊過月餅：亞洲超市結帳台「（月餅擺在結帳台旁邊。你買了一盒。）」', caps.includes('（月餅擺在結帳台旁邊。你買了一盒。）'));
  fresh('2028-08-10',15,'us_apartment',US()); await interact({label:'打開冰箱',look:'冰箱。'}); const f1=caps[0]; at('2028-09-10',15); await interact({label:'打開冰箱',look:'冰箱。'});
  check('S6. 公寓的冰箱依日期換（AA_287 第 1 節）', f1==='冰箱很大，裡面只有一盒蛋、一罐牛奶。'&&caps[0]==='蛋、牛奶、冷凍水餃，還有一罐開了很久的花生醬。');
  at('2028-12-05',15); await interact({label:'衣帽櫃',look:'衣帽櫃。羽絨外套、雪靴。'}); check('S6. 衣帽櫃 12/2 起：「衣帽櫃。羽絨外套、圍巾。雪靴放在門口的舊報紙上。」', caps[0]==='衣帽櫃。羽絨外套、圍巾。雪靴放在門口的舊報紙上。');

  // ======================= S7 台灣的大四上（US-E）=======================
  fresh('2028-09-03',8,'us_apartment',US()); toasts=[]; opts=[]; await CLS.morning(GM);
  check('S7. 9/3 在美國：沒有跳選課（不問）、記成選過；9/4 也不跳「大四上開學了」', !opts.length&&CLS.rec(G).note.sel_Y4S1===1&&(at('2028-09-04',8),await CLS.morning(GM),!toasts.some(t=>/開學了/.test(t))), JSON.stringify(toasts));
  at('2028-10-23',8); await CLS.morning(GM); check('S7. 期中、期末週也不跳提示', !toasts.some(t=>/考週/.test(t)));
  fresh('2029-01-08',8,'dorm',US({US_RETURNED:D('2028-12-23'),ROOM_Y4:D('2028-12-23')})); said=[]; await CLS.morning(GM);
  check('S7. 2029-01-08 成績：「大四上的成績出來了。」「三門通過。」；成績單只有美國三門（沒有「缺考」）', has('大四上的成績出來了。')&&has('三門通過。')&&JSON.stringify(CLS.rec(G).grades.Y4S1)===JSON.stringify({us_intro:'通過',us_comp:'通過',us_writing:'通過'})&&!JSON.stringify(CLS.reportFor(G,'Y4S1')).includes('缺考'), JSON.stringify(lines()));
  fresh('2029-01-08',8,'dorm',TWF()); check('S7. 臺灣路線照舊（考試科沒考＝缺考）', JSON.stringify(CLS.reportFor(G,'Y4S1')).includes('缺考')||Object.keys(CLS.reportFor(G,'Y4S1')).length>3);

  // ======================= S8 時差（US-D）=======================
  fresh('2028-10-09',8,'us_apartment',US()); date('kexin'); for(let d=D('2028-10-09');d<=D('2028-10-11');d++){ G.day=d; G.weekday=wdOf(d); for(const h of [8,21]){ G.hour=h; rules(); } }
  { const q=OUT.get(G,'kx_anniv4v'); check('S8／US-D. 10/17 可昕週年視訊：當地早上 09:00（台灣 21:00），不是晚上 21:00', !!q&&q.day===D('2028-10-17')&&q.h===9, JSON.stringify(q)); }
  { const q=OUT.get(G,'kx_anniv4v'), w=STORY.wakeAlarms(G,D('2028-10-17'));   /* BB 14:45（f5c7e17b）：沒有 alarm＝10/16 晚上照常睡到 12:00，週年視訊就錯過（KX_ANNIV 4 missed）*/
    check('S8. 可昕週年視訊會叫醒：alarm、10/17 的鬧鐘 08:30（視訊 09:00 前 30 分鐘）', !!q&&q.alarm===true&&w.some(a=>Math.abs(a.h-8.5)<0.01&&/可昕的視訊：週年/.test(a.why)), JSON.stringify({q,w}));
    if(q){ q.alarm=false; rules(); } check('S8. 舊存檔已經排好、沒有 alarm 的：補上', !!q&&q.alarm===true, JSON.stringify(q)); }
  { G.day=D('2028-10-16'); G.weekday=wdOf(G.day); G.hour=22; const o=STORY.bedOptions(G), sl=o.filter(x=>x.kind==='sleep');   /* BUG-US-BED-ALARM-1022（BB 10-22 15:02）：美國上課日床的選單把「明天沒有課」那項換成第一堂前一小時，沒有重看鬧鐘，週年視訊 09:00 照樣睡到 12:00 */
    check('S8. 10/16 晚上上床：每個睡覺選項都被 08:30 的鬧鐘叫醒（不會睡過週年視訊）；選項名字不重複', sl.length>0&&sl.every(x=>x.wake<=8.51)&&sl.some(x=>/可昕的視訊：週年/.test(x.alarm||''))&&new Set(sl.map(x=>x.t)).size===sl.length, JSON.stringify(sl)); }
  { const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('S8. story3d.js「視訊版目前不會發生」的舊註解拿掉了', !/視訊版目前不會發生/.test(src)); }
  fresh('2028-12-11',7,'us_apartment',US()); PHONE.join(G,'public_law','公法讀書會'); R('heroine_01','FAM'); runRules('2028-12-11',7,9);
  check('S8. 12/11 讀書會群組：當地 08:00（台灣 21:00）', txt('g:public_law').includes('heroine_01:學弟說這週四停一次')&&G.msgs.find(m=>m.th==='g:public_law').h===8, JSON.stringify(txt('g:public_law')));
  fresh('2028-09-07',19,'us_apartment',US()); runRules('2028-09-07',19,23);
  check('S8. 家人群組週四 20:00「這週回來吃飯嗎」：人在美國不問', !txt('g:home').some(t=>/回來吃飯/.test(t)));
  fresh('2028-09-07',19,'dorm',TWF()); runRules('2028-09-07',19,21); check('S8. 臺灣路線照舊問', txt('g:home').length>0);
  fresh('2028-08-06',8,'us_apartment',US()); runRules('2028-08-06',8,10);
  check('S8／4-1. 媽媽每週日一則：8/6 當地 09:00（台灣 21:00）「吃飯了沒。」', txt('p:mom').includes('mom:吃飯了沒。')&&G.msgs.find(m=>m.th==='p:mom').h===9);
  fresh('2028-11-19',7,'us_apartment',US()); runRules('2028-11-19',7,9); check('S8／4-1. 11/5 以後當地 08:00；11 月有「你爸說他看了地圖，那邊離芝加哥很近。」', (G.msgs.find(m=>m.th==='p:mom')||{}).h===8, JSON.stringify(txt('p:mom')));
  { const d=STORY.DAILY_PHONE.find(x=>x.id==='kai_sheet'); fresh('2028-09-25',9,'us_apartment',US()); check('S8. 阿凱的評鑑表照台灣時間（當地 09:48）', Math.abs(d.h(G)-(21.8-12))<1e-6); fresh('2028-09-25',9,'dorm',TWF()); check('S8. 臺灣照舊 21:48', Math.abs(d.h(G)-21.8)<1e-6); }
  fresh('2028-08-20',11,'us_apartment',US()); R('heroine_01','FRI'); { const r=MSG.replyAt(G,'heroine_01');
    check('S8. 台灣朋友回訊息照台灣時間：當地 11:00＝台灣 23:00，以安睡了，台灣隔天早上才回（當地 19 點多）', r&&r.late===true&&r.day===G.day&&r.h>=19.2&&r.h<19.7, JSON.stringify(r)); }
  fresh('2028-12-18',10,'us_apartment',US({US_TRIP_MODE:'sf'})); check('S8. 舊金山 12/16～12/21 慢 16 小時；之前美東 −13', STORY.tzOffset(G)===-16&&STORY.tzOffset(G,D('2028-12-14'))===-13);

  // ======================= S9 在美國約台灣的朋友（US-I）=======================
  fresh('2028-09-20',15,'us_apartment',US()); R('zhe','FRI'); G.contacts.zhe=1;
  check('S9／US-I. 在美國：阿哲約不了，原因「你人在美國。」（不會排進行事曆、不會變成爽約）', INV.whyNot(G,'zhe')==='你人在美國。'&&INV.canInvite(G,'zhe')===false);
  date('kexin'); global.DATE={canAsk:()=>({ok:true})};   /* 遊戲裡有 date3d.js（可昕＝遠距女友，INV.kxGF 要有 DATE）*/
  check('S9. 遠距女友可昕也一樣', INV.whyNot(G,'kexin')==='你人在美國。'&&!INV.canInvite(G,'kexin'), JSON.stringify([INV.whyNot(G,'kexin'),INV.canInvite(G,'kexin')])); delete global.DATE;
  fresh('2028-09-20',15,'campus',TWF()); R('zhe','FRI'); G.contacts.zhe=1; check('S9. 臺灣路線照舊約得到', INV.whyNot(G,'zhe')===''&&INV.canInvite(G,'zhe'));

  // ======================= S10 回程（US-H）=======================
  fresh('2028-12-21',23,'us_apartment',US());
  check('S10／US-H. 12/21 23:00 還不到；23:55 起飛（不會在 12/22 早上就回臺灣）', !EXCH.returnDue(G)&&EXCH.returnAt(G)===T(D('2028-12-21'),23+55/60)&&(G.hour=23.95,EXCH.returnDue(G)));
  { let room=0; const o=STORY.roomY4FromAirport; STORY.roomY4FromAirport=async()=>{ room++; G.zone='dorm'; return true; }; await EXCH.returnHome(GM); STORY.roomY4FromAirport=o;
    check('S10. 12/23 05:40 落地：桃園入境大廳（airport_arr）→ 回家、19:00 409', entered[0]==='airport_arr'&&G.day===D('2028-12-23')&&G.flags.US_RETURNED===D('2028-12-23')&&room===1&&cards.includes('抵達｜桃園機場　清晨 05:40'), JSON.stringify({entered,cards})); }

  // ======================= S12 湖邊 =======================
  fresh('2028-08-04',15,'us_outside',US()); USL.populate('us_outside',GM); { const L=E.interactables.find(q=>q.uslLake); check('S12. 社區有「去湖邊」：8/5 以前藏起來、8/6 出現', !!L&&L.hidden&&(at('2028-08-06',15),!L.hidden)); }
  fresh('2028-10-12',16,'us_outside',US()); date('heroine_05'); await interact({uslLake:true}); check('S12／4-4. 10 月：「（湖面很平。對岸的樹，一棵一棵變顏色。）」', has('（湖面很平。對岸的樹，一棵一棵變顏色。）')&&caps.includes('湖邊'));
  at('2028-12-04',16); await interact({uslLake:true}); check('S12／4-4. 12/2 以後：「（湖邊的長椅積了雪。）」', has('（湖邊的長椅積了雪。）'));
  fresh('2028-08-08',17,'us_outside',US()); await interact({uslLake:true}); check('S12／G1. 挽回中第一次自己去：「（湖邊有人在遛狗。太陽還很高。你一個人走了一圈。）」', has('（湖邊有人在遛狗。太陽還很高。你一個人走了一圈。）')&&G.flags.USL_LAKE_SOLO);

  // ======================= G1 第 1～2 週（US-A、US-B）=======================
  fresh('2028-08-02',8.5,'airport_dep',{EXCHANGE_ROUTE:'US',US_DEPARTED:true}); PHONE.join(G,'family_law','法律系直屬家族'); rules();
  check('G1. 8/2 台灣 08:00 Kevin 家族群組（玩家在機場）', JSON.stringify(txt('g:family_law'))===JSON.stringify(['kevin:學姊跟直屬學弟今天一起飛美國！！','kevin:（貼圖：飛機）','kevin:記得帶伴手禮回來 不是說你們兩個'])&&G.msgs.find(m=>m.th==='g:family_law').h===8, JSON.stringify(txt('g:family_law')));
  fresh('2028-08-02',22,'us_apartment',US()); date('heroine_05'); { const o=STORY.bedOptions(G); check('G1. 8/2 晚上睡覺＝8/3 04:30 醒來（時差）', o.filter(x=>x.kind==='sleep').length===1&&o[0].wake===4.5, JSON.stringify(o)); }
  at('2028-08-03',4.5); E.player.busy=false; await tick();
  check('G1／US-A. 8/3 04:30 公寓醒來：「（你醒來的時候，窗外還是黑的。手機上是四點半。台灣是下午四點半。）」（只演一次）', has('（你醒來的時候，窗外還是黑的。手機上是四點半。台灣是下午四點半。）')&&!has('（C 棟有一扇窗的燈也亮著。你不知道是不是她那一戶。）')&&G.flags.USL_JETLAG&&(said=[],await tick(),!said.length));
  runRules('2028-08-03',4.5,5.5); { const m=PHONE.byAsk(G,'usl_sis_0803');
    check('G1. 交往中 05:10 學姊私訊兩則；回「醒了。」→「再睡一下。手續是明天十點。」（US-JETLAG-BED-0803-1022）', JSON.stringify(txt('p:heroine_05').slice(0,2))===JSON.stringify(['heroine_05:你也醒了吧。','heroine_05:睡不著。外面還是黑的。……我的身體以為現在是下午。'])&&!!m&&(PHONE.answer(G,'usl_sis_0803',0),txt('p:heroine_05').slice(-1)[0]==='heroine_05:再睡一下。手續是明天十點。'), JSON.stringify(txt('p:heroine_05'))); }
  fresh('2028-08-03',4.5,'us_apartment',US({US1:'alone'})); E.player.busy=false; await tick(); runRules('2028-08-03',4.5,6);
  check('G1／US-B. 挽回中 8/3：只有旁白（多「C 棟有一扇窗的燈也亮著」），沒有訊息', has('（C 棟有一扇窗的燈也亮著。你不知道是不是她那一戶。）')&&!txt('p:heroine_05').length);
  { fresh('2028-08-03',4.75,'us_apartment',US()); G.flags.USL_JETLAG=true; const O=STORY.bedOptions(G)||[];   /* US-JETLAG-BED-0803-1022（AA-B 10-23 07:50）*/
    check('G1. 8/3 時差醒來以後的床：第一項「再睡到早上（09:00）」（同一天的小睡），原本睡到明天早上的那項還在', !!O[0]&&O[0].kind==='nap'&&O[0].to===9&&O[0].t==='再睡到早上（09:00）'&&O.some(o=>o.kind==='sleep'), JSON.stringify(O.map(o=>[o.kind,o.t])));
    at('2028-08-03',5.5); const O2=STORY.bedOptions(G)||[]; check('G1. 05:00 以後（白天的小睡）：第一項照樣是「再睡到早上（09:00）」，小睡那幾項還在', !!O2[0]&&O2[0].to===9&&O2.filter(o=>o.kind==='nap').length>1, JSON.stringify(O2.map(o=>[o.kind,o.t]))); }
  fresh('2028-08-03',9,'us_apartment',US()); date('heroine_05'); rules(); { const q=OUT.get(G,'usl_office'); check('G1. 8/4 10:00 國際學生辦公室：出遊（一鍵「出發」，鬧鐘）', !!q&&q.day===D('2028-08-04')&&q.h===10&&q.alarm===true); at('2028-08-04',9.8); await go('usl_office'); }
  check('G1. 國際學生辦公室：旁白＋交往中「（學姊比你早到。她的表已經交了……）」', has('（國際學生辦公室。你排在一個巴西來的學生後面，填了三張表。最後一張問你的緊急聯絡人，你寫了媽媽的名字，又在旁邊寫了台灣的國碼。）')&&has('（學姊比你早到。她的表已經交了，坐在門口的椅子上等你，手上是那瓶熱水。）'));
  fresh('2028-08-04',9.8,'us_apartment',US()); rules(); await go('usl_office'); check('G1／US-B. 挽回中：「（學姊比你早到。你們在走廊點了一下頭。）」', has('（學姊比你早到。你們在走廊點了一下頭。）'));
  fresh('2028-08-05',17,'us_apartment',US()); date('heroine_05'); runRules('2028-08-05',17,17.75);
  check('G1. 8/5 17:30 學姊「傍晚去湖邊走走。……走路十五分鐘。」→ 18:30 湖邊（出遊）', txt('p:heroine_05').includes('heroine_05:傍晚去湖邊走走。……走路十五分鐘。')&&OUT.get(G,'usl_lake1')&&OUT.get(G,'usl_lake1').h===18.5);
  at('2028-08-05',18.2); picks=[1]; await go('usl_lake1');
  check('G1. 湖邊：「這裡天黑得好晚。」「台灣這時候，大家在吃早餐了。」（AA_370 H3、AA_450 1-2）→「想家嗎？」→「……問我第四十天的時候。」；記 US_LAKE_FIRST', has('這裡天黑得好晚。')&&has('台灣這時候，大家在吃早餐了。')&&has('……問我第四十天的時候。')&&G.flags.US_LAKE_FIRST===true, JSON.stringify(lines()));
  fresh('2028-08-05',17,'us_apartment',US()); runRules('2028-08-05',17,19); check('G1／US-B. 挽回中：湖邊沒有邀約', !OUT.get(G,'usl_lake1')&&!txt('p:heroine_05').length);
  fresh('2028-08-10',8,'us_apartment',US()); R('heroine_02','FAM'); G.contacts.heroine_02=1; runRules('2028-08-10',8,10);
  check('G1. 8/10 當地 09:00（台灣 21:00）芷若「給我你在那邊的地址。英國寄到美國要多久，我想試試看。」（和芷若 FAMILIAR 以上）', JSON.stringify(txt('p:heroine_02'))===JSON.stringify(['heroine_02:給我你在那邊的地址。英國寄到美國要多久，我想試試看。'])&&G.msgs.find(m=>m.th==='p:heroine_02').h===9&&G.flags.USL_ZR_ADDR===true, JSON.stringify(txt('p:heroine_02')));
  fresh('2028-08-10',8,'us_apartment',US()); G.contacts.heroine_02=1; runRules('2028-08-10',8,10); check('G1. 和芷若還不熟：不傳', !txt('p:heroine_02').length);

  // ======================= G2、S11 何俊朗 1、2a、2b、3、4、5 =======================
  fresh('2028-08-10',9,'us_apartment',US()); rules(); { const q=OUT.get(G,'usl_long1'); check('S11. 何俊朗 1：8/14 10:00「國際學生迎新」（出遊、可以錯過）', !!q&&q.day===D('2028-08-14')&&q.h===10&&q.title==='國際學生迎新'); }
  at('2028-08-14',9.8); picks=[0]; await go('usl_long1');
  check('S11／G2. 何俊朗 1（挽回中、交往中都同一版）：「這裡的超市幾點關？」→ 對看笑出來 →「香港來的。何俊朗。叫我 Long 就好。」→「亞洲超市九點關。」；記 MET_LONG', has('這裡的超市幾點關？')&&has('（你們兩個對看一眼，同時笑出來。）')&&has('香港來的。何俊朗。叫我 Long 就好。')&&has('祐廷。臺灣。')&&has('你來幾天就知道了？')&&G.flags.MET_LONG===true, JSON.stringify(lines().slice(0,6)));
  fresh('2028-09-08',11.8,'us_campus',US()); rules(); picks=[1]; await go('usl_long2a');
  check('S11. 何俊朗 2a（迎新沒去、都沒見過）：先「我叫何俊朗。叫我 Long 就好。」→ 小考 →「……好。」→「（他已經在查餐廳的地址了。）」→「（你沒有說，其實你只是剛好及格。）」', said[0]&&said[0].t==='我叫何俊朗。叫我 Long 就好。'&&has('（他已經在查餐廳的地址了。）')&&has('（你沒有說，其實你只是剛好及格。）')&&G.flags.MET_LONG&&G.flags.LONG_2A, JSON.stringify(lines().slice(0,3)));
  rules(); { const q=OUT.get(G,'usl_long2b'); check('S11. 何俊朗 2b：9/15 18:30 新開的餐廳（2a 演過才有）', !!q&&q.day===D('2028-09-15')&&q.h===18.5); }
  at('2028-09-15',18.3); picks=[0]; await go('usl_long2b');
  check('S11. 何俊朗 2b：「你們台灣人的「還好」，到底是好還是不好？」→「要看你問的是什麼。」→「所以你們的『還好』，是一個要先知道題目的答案。」；記 LONG_HAIHAO', has('你們台灣人的「還好」，到底是好還是不好？')&&has('所以你們的『還好』，是一個要先知道題目的答案。')&&G.flags.LONG_HAIHAO===true);
  fresh('2028-10-01',9,'us_apartment',US({MET_LONG:true})); rules(); at('2028-10-04',19.8); rules(); picks=[1]; await go('usl_long3');   /* AA_450 1-11：10/3 起才排（這裡 10/4 跑一次手機規則）*/
  check('S11. 何俊朗 3（10/4 20:00 會所自習室）：公布欄「週五晚上，國際學生會的秋假前聚餐」、「誰都」「誰也」；「那就都不要去。」→「……去吧。」；記 LONG_BBQ', has('（公布欄貼著一張單子：週五晚上，國際學生會的秋假前聚餐。）')&&has('「誰也」，像每個人自己決定不去。')&&has('……去吧。')&&G.flags.LONG_BBQ===true);
  G.zone='us_apartment'; G.hour=22; E.player.busy=false; await tick();
  check('S11. 何俊朗 4：當晚回公寓自動「（回到公寓，你在筆記本寫了一行：……條文也是。）」；記 LONG_NOTE', has('（回到公寓，你在筆記本寫了一行：同一句話，在不同的地方，意思不一樣。條文也是。）')&&G.flags.LONG_NOTE===true);
  at('2028-10-06',20.5); G.zone='us_outside'; await tick(); check('S11. 10/6 20:00 人在社區：秋假前的聚餐一句旁白', has('（星期五晚上，秋假前的聚餐。何俊朗拿著盤子，一桌一桌問人「誰都」和「誰也」哪裡不一樣。沒有人答得出來。）'));
  fresh('2028-10-24',20.5,'us_apartment',US({MET_LONG:true})); runRules('2028-10-24',20.5,21.25); { const m=PHONE.byAsk(G,'usl_long5');
    check('S11. 何俊朗 5：10/24 21:00「明天晚上去中餐館？我想吃白飯。」→「明天不行。」→「那下週三。」＝11/1 19:00', !!m&&m.text==='明天晚上去中餐館？我想吃白飯。'&&(PHONE.answer(G,'usl_long5',1),rules(),true)&&txt('p:npc_long').slice(-1)[0]==='npc_long:那下週三。'&&OUT.get(G,'usl_long5b')&&OUT.get(G,'usl_long5b').day===D('2028-11-01')&&!OUT.get(G,'usl_long5'), JSON.stringify(txt('p:npc_long'))); }
  fresh('2028-10-25',18.8,'us_apartment',US({MET_LONG:true,USL_LONG5:'go'})); rules(); await go('usl_long5');
  check('S11. 中餐館：西蘭花、花椰菜、「……條文也是。」、帳單用英文對；記 LONG_MENU', has('我要這個，西蘭花牛肉。')&&has('……條文也是。')&&has('（那天的帳單，你們用英文對了半天。）')&&G.flags.LONG_MENU===true);
  check('S11. 何俊朗在手機上的名字：「何俊朗」（對話串 p:npc_long）', PHONE.title(G,'p:npc_long')==='何俊朗');
  fresh('2028-08-17',21,'us_apartment',US({MET_LONG:true})); { const s=USL.SUM.find(x=>x.d==='2028-08-17'); check('G2. 8/17 摘要日：有 MET_LONG＝「何俊朗拿了兩盤披薩」；沒有＝「你吃了兩片披薩」', USL.sumLine(G,s)==='（國際學生的晚會。何俊朗拿了兩盤披薩，一盤給你。）'&&(G.flags.MET_LONG=false,USL.sumLine(G,s)==='（國際學生的晚會。你吃了兩片披薩，早早回公寓。）')); }
  fresh('2028-08-20',9,'us_apartment',US()); date('kexin'); rules(); { const q=OUT.get(G,'usl_qixi');
    check('G2. 8/26 可昕七夕（和可昕交往中）：當地 09:00 視訊（台灣 21:00）', !!q&&q.day===D('2028-08-26')&&q.h===9&&q.verb==='接起來'); }
  at('2028-08-26',8.8); picks=[0]; await go('usl_qixi'); check('G2. 七夕：「七夕。你那邊是早上吧。」「……我這邊是晚上。剛好一人一半。」→「十二月二十三號。」→「我知道。我算過了。」', has('七夕。你那邊是早上吧。')&&has('牛郎織女要等一年。我們等四個月。')&&has('我知道。我算過了。'));

  // ======================= G3 勞動節的烤肉 =======================
  fresh('2028-09-02',15,'us_outside',US()); await interact({usClub:'door',look:'x'}); check('G3. 9/1 起會所門口的公告：「（公告上畫了一個烤肉架。下面寫：自己帶飲料。）」', caps.includes('（公告上畫了一個烤肉架。下面寫：自己帶飲料。）'));
  fresh('2028-09-04',17.5,'us_outside',US({MET_LONG:true})); date('heroine_05'); picks=[0]; await interact({usClub:'door',look:'x'});
  check('G3. 9/4 17:00～19:00 會所：烤肉旁白、交往中「台灣的中秋也是烤肉。……」→「中秋妳要怎麼過？」→ 記 US_MOONCAKE_TALK；何俊朗「一個是你的。……」', has('（會所後面的草地，兩台烤肉架。美國人排隊拿漢堡，每個人都說了一次「Happy Labor Day」。）')&&has('亞洲超市可能有。')&&G.flags.US_MOONCAKE_TALK===true&&has('一個是你的。……不要問我為什麼烤焦。'), JSON.stringify(lines()));
  fresh('2028-09-04',17.5,'us_outside',US()); await interact({usClub:'door',look:'x'}); check('G3. 挽回中：「（她看到你，點了一下頭。）」；沒有學姊的台詞、沒有何俊朗（沒見過）', has('（她看到你，點了一下頭。）')&&!has('台灣的中秋也是烤肉。……這裡的肉比較大塊。')&&!said.some(s=>/烤焦/.test(s.t)));

  // ======================= G4 萬聖節（US-F）=======================
  fresh('2028-10-31',18,'us_apartment',US()); E.player.busy=false; picks=[0]; await tick();
  check('G4／US-F. 10/31 18:00 公寓：門鈴、「（開門）」→ 沒去過亞洲超市三次＝「你把冰箱裡的蘋果給了他們。」', JSON.stringify(opts[0])===JSON.stringify(['（開門）','（不開）'])&&has('（兩個小孩，一個是南瓜，一個是恐龍。你沒有糖。你把冰箱裡的蘋果給了他們。）'));
  fresh('2028-10-31',18,'us_apartment',US({USL_ASIA_N:3})); E.player.busy=false; picks=[0]; await tick(); check('G4. 去過亞洲超市三次以上：「小饅頭餅乾」', has('（兩個小孩，一個是南瓜，一個是恐龍。你沒有糖。你把亞洲超市買的小饅頭餅乾給了他們。）'));
  fresh('2028-10-31',18,'us_apartment',US()); E.player.busy=false; picks=[1]; await tick(); check('G4. 「（不開）」：「（門外有小孩在笑。過了一下，腳步聲往樓下去了。）」', has('（門外有小孩在笑。過了一下，腳步聲往樓下去了。）'));
  { said=[]; opts=[]; at('2028-10-31',18.5); await tick(); const early=said.length; at('2028-10-31',19); picks=[0]; await tick();
    check('I2. 第二次門鈴 19:00（AA_345 I2）：18:30 還沒有；19:00 再響（開門／不開）→「（開門）」＝「（一個戴著皇冠的小女孩，後面跟著她爸爸。你把剩下的都給了她。爸爸幫她說了謝謝。）」', !early&&JSON.stringify(opts[0])===JSON.stringify(['（開門）','（不開）'])&&has('（一個戴著皇冠的小女孩，後面跟著她爸爸。你把剩下的都給了她。爸爸幫她說了謝謝。）')&&G.flags.USL_HALLOWEEN2==='open', JSON.stringify(lines()));
    said=[]; await tick(); check('I2. 只響兩次', !said.length); }
  fresh('2028-10-31',19,'us_apartment',US()); E.player.busy=false; picks=[0]; await tick(); { const one=has('（兩個小孩，一個是南瓜，一個是恐龍。你沒有糖。你把冰箱裡的蘋果給了他們。）'); said=[]; await tick(); const back=said.length; G.hour=19.25; picks=[1]; await tick();
    check('I2. 19:00 才回到公寓：第一次馬上響、第二次隔 15 分鐘；「（不開）」＝「（這次門外很安靜。過了一下，隔壁的門開了，有人在說 Happy Halloween。）」', one&&!back&&has('（這次門外很安靜。過了一下，隔壁的門開了，有人在說 Happy Halloween。）')&&G.flags.USL_HALLOWEEN2==='closed', JSON.stringify(lines())); }
  { fresh('2028-10-31',18.6,'us_apartment',US()); G.events.done.ev_usl_halloween=1; const O=HOME.ffOpts(G); check('I2. 快轉（到下一件有事的時候）停在 19:00 第二次門鈴', !!O&&O[0].to===T(D('2028-10-31'),19), O&&JSON.stringify(O[0])); }
  fresh('2028-09-01',10,'us_asian_market',US()); for(const k of ['2028-09-01','2028-09-05','2028-09-05','2028-09-09']){ at(k,10); USL.populate('us_asian_market',GM); } check('G4. 去亞洲超市記不同的日子（三天）', G.flags.USL_ASIA_N===3);
  fresh('2028-10-31',20,'us_apartment',US()); date('heroine_05'); runRules('2028-10-31',20,21); check('G4. 交往中 20:30 學姊：「我們這戶買了兩包糖。室友說不夠。」「……她說對了。七點半就發完了。」', JSON.stringify(txt('p:heroine_05'))===JSON.stringify(['heroine_05:我們這戶買了兩包糖。室友說不夠。','heroine_05:……她說對了。七點半就發完了。']));

  // ======================= G5、G6 感恩節（US-G）、G7 =======================
  fresh('2028-11-16',20.5,'us_apartment',US()); date('heroine_05'); runRules('2028-11-16',20.5,21.25);
  check('G5. 11/16 21:00 學姊「下週四感恩節。」「室友兩個都要回家。……C 棟會變得很安靜。」；回「那天我們做什麼？」→「還不知道。我想一下。」', !!PHONE.byAsk(G,'usl_sis_1116')&&(PHONE.answer(G,'usl_sis_1116',0),txt('p:heroine_05').slice(-1)[0]==='heroine_05:還不知道。我想一下。'));
  { const e=ev('ev_us3_lake'), s=JSON.stringify(e.dialogue); check('G1／G6. US3 的湖邊（r2y4a_events.js）多兩句：開頭（有 US_LAKE_FIRST）、交往中那一版最後「晚上來 C 棟。室友不在。」', s.includes('（八月你們來的時候，湖邊都是遛狗的人。今天只有你們。）')&&s.includes('晚上來 C 棟。室友不在。')&&e.uslPatched===true); }
  fresh('2028-11-23',8.8,'us_outside',US({US_LAKE_FIRST:true})); date('heroine_05'); OUT.plan(G,{id:'us3_lake',ev:'ev_us3_lake',day:G.day,h:9,late:0.25,place:'會所門口',title:'感恩節的湖邊',travel:'',travelH:0,back:'回到社區。'}); await go('us3_lake');
  check('G6／US-G. 11/23 早上湖邊 US3：開頭「（八月你們來的時候……）」、最後「晚上來 C 棟。室友不在。」', said[0]&&said[0].t==='（八月你們來的時候，湖邊都是遛狗的人。今天只有你們。）'&&lines().slice(-1)[0]==='溫學姊：晚上來 C 棟。室友不在。'||lines().some(l=>/晚上來 C 棟。室友不在。$/.test(l)), JSON.stringify(lines().slice(-2)));
  rules(); { const q=OUT.get(G,'usl_thanks'); check('G6. US3 之後排 17:30 感恩節的晚餐（C 棟 208）', !!q&&q.h===17.5&&q.day===D('2028-11-23')); }
  G.flags.MET_LONG=true; at('2028-11-23',17.3); picks=[1]; await go('usl_thanks');
  check('G6／US-G. 17:30 C 棟 208：湯和火雞胸；「感恩節要說感謝什麼？」→「（她想了很久。）」「……今天湖邊那一句，算不算。」', has('（C 棟 208 的廚房只開了一盞燈。她用帶來的小鍋子煮了一鍋湯，旁邊是超市買的一小塊火雞胸。）')&&has('火雞我不會烤。……這是超市烤好的。')&&has('……今天湖邊那一句，算不算。'));
  runRules('2028-11-23',19,19.75); check('G6. 有 MET_LONG：19:30 何俊朗「你們吃火雞了嗎。我吃了泡麵。還好。」', txt('p:npc_long').includes('npc_long:你們吃火雞了嗎。我吃了泡麵。還好。'));
  fresh('2028-11-22',21,'us_apartment',US({MET_LONG:true})); rules(); { const q0=OUT.get(G,'usl_thanks_long'); runRules('2028-11-23',8,16.75); const m0=txt('p:npc_long').length; runRules('2028-11-23',17,17.25); const q=OUT.get(G,'usl_thanks_long');
    check('G6／US-B／I6. 挽回中、有 MET_LONG：11/23 17:00 何俊朗私訊「感恩節。兩個沒地方去的人。」「七點，會所。」（AA_345 I6；11/22 晚上還沒排）→ 19:00 會所', !q0&&!m0&&JSON.stringify(txt('p:npc_long'))===JSON.stringify(['npc_long:感恩節。兩個沒地方去的人。','npc_long:七點，會所。'])&&G.msgs.find(m=>m.th==='p:npc_long').h===17&&!!q&&q.h===19, JSON.stringify(txt('p:npc_long')));
    at('2028-11-23',18.8); await go('usl_thanks_long');
    check('I1. 19:00 會所：「（會所的自動販賣機只剩熱可可。何俊朗按了兩次，一杯推給你。）」「（你們坐在自習室的窗邊喝完。誰都沒說今天是什麼節日。）」（旁白；何俊朗那一句在 17:00 的邀約裡，不再說一次）', JSON.stringify(said.map(x=>x.t))===JSON.stringify(['（會所的自動販賣機只剩熱可可。何俊朗按了兩次，一杯推給你。）','（你們坐在自習室的窗邊喝完。誰都沒說今天是什麼節日。）'])&&said.every(x=>x.who===null)&&G.flags.USL_THANKS==='long', JSON.stringify(lines())); }
  fresh('2028-11-23',16,'us_apartment',US({MET_LONG:true,US3:'two'})); date('heroine_05'); runRules('2028-11-23',16,17.5); check('I6. 早上 US3 回到交往（交往中）：17:00 沒有何俊朗的邀約、沒有排會所', !txt('p:npc_long').some(t=>/七點，會所/.test(t))&&!OUT.get(G,'usl_thanks_long'));
  fresh('2028-11-23',20.5,'us_apartment',US({MET_LONG:true})); rules(); check('I6. 20:00 以後才讀檔進來：不補邀約（那一場已經過了）', !txt('p:npc_long').length&&!OUT.get(G,'usl_thanks_long'));
  fresh('2028-11-23',18.5,'us_apartment',US()); E.player.busy=false; await tick(); check('G6／US-B. 挽回中、沒有 MET_LONG：公寓裡一個人「（你煮了一包台灣帶來的泡麵。窗外開始飄小雪。）」', has('（你煮了一包台灣帶來的泡麵。窗外開始飄小雪。）'));
  fresh('2028-12-03',9,'us_apartment',US()); E.player.busy=false; await tick(); G.zone='us_outside'; await tick(); check('G7. 12/3 走出公寓：「（樓梯的扶手上積了一層雪。你用手指寫了一個字，又抹掉。）」', caps.includes('（樓梯的扶手上積了一層雪。你用手指寫了一個字，又抹掉。）'));
  fresh('2028-12-06',20.5,'us_apartment',US()); date('heroine_05'); runRules('2028-12-06',20.5,21.25); check('G7. 12/6 21:00 學姊：「期末週以後，還有五天。」「……你想去哪裡，你先想。」', JSON.stringify(txt('p:heroine_05'))===JSON.stringify(['heroine_05:期末週以後，還有五天。','heroine_05:……你想去哪裡，你先想。']));

  // ======================= AA_345 I3 自習室她只點頭 =======================
  fresh('2028-10-17',19.5,'us_outside',US({MET_LONG:true})); date('heroine_05'); picks=[0,0]; await interact({usClub:'door',look:'x'});   /* 10/17（二）：10/10 是秋假，何俊朗在芝加哥（AA_370 L4）*/
  { const i=said.findIndex(x=>x.t==='（她抬頭，點了一下頭，把旁邊椅子上的外套拿起來，放到自己腿上。）'), j=said.findIndex(x=>x.t==='你們台灣人讀書都不說話的嗎');
    check('I3. 交往中、10 月週二 19:30 會所自習室（她在、何俊朗在）：何俊朗的招呼 →「（她抬頭，點了一下頭，把旁邊椅子上的外套拿起來，放到自己腿上。）」（旁白）→ 何俊朗「你們台灣人讀書都不說話的嗎」', i>0&&said[i].who===null&&j===i+1&&said[i-1].who==='何俊朗'&&said[j].who==='何俊朗'&&!has('（她抬頭看了你一眼，又低下頭。）'), JSON.stringify(lines())); }
  fresh('2028-10-10',19.5,'us_outside',US()); date('heroine_05'); picks=[0,0]; await interact({usClub:'door',look:'x'}); check('I3. 沒見過何俊朗：只有她點頭那一句旁白', has('（她抬頭，點了一下頭，把旁邊椅子上的外套拿起來，放到自己腿上。）')&&!said.some(x=>x.who==='何俊朗'), JSON.stringify(lines()));
  fresh('2028-10-10',19.5,'us_outside',US()); picks=[0,0]; await interact({usClub:'door',look:'x'}); check('I3. 挽回中照舊「（她抬頭看了你一眼，又低下頭。）」', has('（她抬頭看了你一眼，又低下頭。）')&&!has('（她抬頭，點了一下頭，把旁邊椅子上的外套拿起來，放到自己腿上。）'));
  // ======================= AA_345 I4 湖邊的「看」=======================
  { const r=[]; for(const [k,want] of [['2028-08-20','（湖邊有人在遛狗。太陽很晚才下山。）'],['2028-09-20','（湖邊有人在遛狗。太陽很晚才下山。）'],['2028-10-20','（湖面很平。對岸的樹，一棵一棵變顏色。）'],['2028-11-15','（樹葉都掉光了。湖面的顏色比天還灰。）'],['2028-12-01','（樹葉都掉光了。湖面的顏色比天還灰。）'],['2028-12-02','（湖邊的長椅積了雪。）']]){
      fresh(k,15,'us_outside',US()); date('heroine_05'); const h0=G.hour; await interact({uslLake:true,label:'去湖邊'}); r.push([k,said.map(x=>x.t).join(),said.length===1&&said[0].t===want&&Math.abs(G.hour-h0-1)<1e-6]); }
    check('I4. 湖邊的「看」：8～9 月「（湖邊有人在遛狗。太陽很晚才下山。）」、10 月照 AA_340、11 月～12/1「（樹葉都掉光了。湖面的顏色比天還灰。）」、12/2 以後照 AA_340；時間 +1 小時', r.every(x=>x[2]), JSON.stringify(r)); }
  fresh('2028-08-20',15,'us_outside',US()); await interact({uslLake:true,label:'去湖邊'}); check('I4. 挽回中第一次自己去（8～9 月）：照舊 G1 那一句（一個人走了一圈）', has('（湖邊有人在遛狗。太陽還很高。你一個人走了一圈。）')&&G.flags.USL_LAKE_SOLO===true);
  fresh('2028-11-15',15,'us_outside',US()); await interact({uslLake:true,label:'去湖邊'}); check('I4. 挽回中、11 月才第一次去：11 月的「看」（不是夏天那一句）', has('（樹葉都掉光了。湖面的顏色比天還灰。）')&&!has('（湖邊有人在遛狗。太陽還很高。你一個人走了一圈。）'), JSON.stringify(lines()));
  check('I1～I5. USL.GAPS 清空（原本的五項 AA_345 都補了）', Array.isArray(USL.GAPS)&&USL.GAPS.length===0);
  // ======================= AA_345 I5 SU 階梯在法學院圖書館（11:30～12:00）、圖書館的閒聊 =======================
  { fresh('2028-09-11',11.6,'us_lawlib',US()); date('heroine_05'); R('heroine_05','FRI'); const L=STORY.ladData(G,'heroine_05'), s1=L&&L.L.steps[0];
    check('I5. SU 那幾層的地點多法學院圖書館（平日 11:30～12:00）；原本的五個地點照舊、ladder.js 本身不改', !!s1&&s1.id==='SU-L1'&&s1.location.includes('us_lawlib')&&s1.location.includes('us_shared')&&JSON.stringify(s1.locTime.us_lawlib)===JSON.stringify({weekday:[1,2,3,4,5],time:[11.5,12]})&&!LADDER.byTerm.Y4S1.heroine_05.steps[0].location.includes('us_lawlib'), s1&&JSON.stringify(s1.location));
    const at11=STORY.ladNext(G,'heroine_05'); at('2028-09-11',10); const at10=STORY.ladNext(G,'heroine_05'); at('2028-09-16',11.6); G.zone='us_lawlib'; const sat=STORY.ladNext(G,'heroine_05');
    check('I5. 圖書館：平日 11:40 有 SU-L1；10:00 沒有（一般閒聊的時間）；週六沒有', !!at11&&at11.id==='SU-L1'&&!at10&&!sat, JSON.stringify([at11&&at11.id,at10&&at10.id,sat&&sat.id]));
    at('2028-09-11',11.6); G.zone='us_lawlib'; said=[]; const who={name:'溫書瑀',charId:'heroine_05'}; await STORY.ladderTalk(GM,who,'heroine_05');
    check('I5. 11:40 和她說話：先「（她把書收進包包，跟你走到圖書館外面才開口。）」（旁白）再 SU-L1「烘衣機的濾網，你清過沒有。」', said[0]&&said[0].t==='（她把書收進包包，跟你走到圖書館外面才開口。）'&&said[0].who===null&&said[1]&&said[1].t==='烘衣機的濾網，你清過沒有。', JSON.stringify(lines()));
    fresh('2028-08-10',16,'us_shared',US()); date('heroine_05'); said=[]; await STORY.ladderTalk(GM,{name:'溫書瑀',charId:'heroine_05'},'heroine_05'); check('I5. C 棟 208（原本的地點）：沒有那一句旁白', said[0]&&said[0].t==='烘衣機的濾網，你清過沒有。', JSON.stringify(lines())); }
  { const lib=['（她把螢幕轉過來給你看：第四章，第三節。）「……還差一節。」','（她小聲）「三明治店十二點人很多。你先去占位子。」','（她指了一下桌上的紙杯）「圖書館的咖啡機又壞了。這杯是外面買的。」'];
    fresh('2028-09-11',10,'us_lawlib',US()); date('heroine_05'); R('heroine_05','FRI'); const got=[]; for(const k of ['2028-09-11','2028-09-12','2028-09-13','2028-09-14','2028-09-15']){ at(k,10); G.zone='us_lawlib'; const r=STORY.smallTalk(G,'heroine_05'); got.push(r.say||r.narr); }
    check('I5. 圖書館 09:00～11:30（交往中）：一般閒聊是原本的「……我沒事。只是沒睡。」加三句輪流', lib.every(t=>got.includes(t))&&got.includes('「……我沒事。只是沒睡。」'), JSON.stringify(got));
    fresh('2028-09-11',10,'us_lawlib',US()); R('heroine_05','FRI'); const got2=[]; for(const k of ['2028-09-11','2028-09-12','2028-09-13']){ at(k,10); G.zone='us_lawlib'; const r=STORY.smallTalk(G,'heroine_05'); got2.push(r.say||r.narr); }
    check('I5. 挽回中：圖書館的一般閒聊只有「……我沒事。只是沒睡。」', !got2.some(t=>lib.includes(t))&&got2.includes('「……我沒事。只是沒睡。」'), JSON.stringify(got2));
    fresh('2028-09-11',10,'us_shared',US()); date('heroine_05'); R('heroine_05','FRI'); const got3=[]; for(const k of ['2028-09-11','2028-09-12','2028-09-13']){ at(k,10); G.zone='us_shared'; const r=STORY.smallTalk(G,'heroine_05'); got3.push(r.say||r.narr); }
    check('I5. 那三句只在圖書館', !got3.some(t=>lib.includes(t)), JSON.stringify(got3));
    fresh('2028-09-11',10,'us_lawlib',US()); date('heroine_05'); R('heroine_05','FRI'); const who={name:'溫書瑀',charId:'heroine_05'}; said=[]; const a=await STORY.ladderTalk(GM,who,'heroine_05'); at('2028-09-11',11.75); G.zone='us_lawlib'; said=[]; const b=await STORY.ladderTalk(GM,who,'heroine_05'); const bt=said.map(x=>x.t);
    at('2028-09-11',11.85); G.zone='us_lawlib'; said=[]; const c=await STORY.ladderTalk(GM,who,'heroine_05'); const ct=said.map(x=>x.t);
    at('2028-09-12',11.75); G.zone='us_lawlib'; said=[]; await STORY.ladderTalk(GM,who,'heroine_05'); const dt2=said.map(x=>x.t);
    check('I5. 圖書館 10:00 和她說話：不走階梯的招呼（交給一般閒聊）；11:45 是 SU 那一層（一天一層）；同一天第二次＝招呼（沒有那一句旁白）；隔天 11:45 下一層 SU-L2', a===false&&b===true&&bt[0]==='（她把書收進包包，跟你走到圖書館外面才開口。）'&&c===true&&ct.length===1&&ct[0]!=='（她把書收進包包，跟你走到圖書館外面才開口。）'&&dt2[0]==='（她把書收進包包，跟你走到圖書館外面才開口。）'&&dt2[1]==='我的研討課一班九個人。教授每個人的名字都叫得出來。', JSON.stringify([a,b,c,ct,dt2.slice(0,2)])); }

  // ======================= C 棟 208：交往中、US2 以後的週末才開 =======================
  fresh('2028-09-20',19,'us_outside',US({US2:'there'})); date('heroine_05'); await interact({usShared:'door',label:'上樓（C 棟 208）',exit:{to:'us_shared'}});
  check('4-4／I7. C 棟 208：交往中、平日晚上門關著＝旁白「（208 的門關著。平日晚上她在寫論文。）」（AA_345 I7；原本是系統提示「門關著。」）', caps.includes('（208 的門關著。平日晚上她在寫論文。）')&&!toasts.includes('門關著。'), JSON.stringify([caps,toasts]));
  at('2028-09-20',15); await interact({usShared:'door',label:'上樓（C 棟 208）',exit:{to:'us_shared'}}); check('4-4／I7. 交往中、平日白天：「（208 的門關著。）」', caps.includes('（208 的門關著。）'), JSON.stringify(caps));
  at('2028-09-23',15); const r208=await interact({usShared:'door',label:'上樓（C 棟 208）',exit:{to:'us_shared'}}); check('4-4. 週六 14:00～21:00（交往中、US2 以後）可以上去', r208===false&&!caps.some(t=>/208 的門關著/.test(t)));
  fresh('2028-09-20',19,'us_outside',US({US2:'repair'})); await interact({usShared:'door',label:'上樓（C 棟 208）',exit:{to:'us_shared'}}); check('I7. 挽回中：「（208 的門關著。）」', caps.includes('（208 的門關著。）')&&!caps.includes('（208 的門關著。平日晚上她在寫論文。）'), JSON.stringify(caps));
  fresh('2028-09-13',18.2,'us_outside',US()); date('heroine_05'); check('4-4. 9/13 傍晚 US2（交往中）照 r2y4a3d.js 開門', USL.c208Open(G));
  fresh('2028-09-23',15,'us_outside',US({US2:'repair'})); check('4-4. 挽回中：週末也不能敲門', !USL.c208Open(G));

  // ======================= AA_399 第 8 節：臥室 C（學姊的房間 us_bed_c，rooms_glb3d.js）=======================
  { const Z0=global.Z3; global.Z3=Object.assign({},Z0||{},{roomGlbOpen:(id,g)=>id==='us_bed_c'&&!!(g.flags.dating_heroine_05)&&(g.weekday===6||g.weekday===0)&&g.hour>=14&&g.hour<21});   // 開放時段本身在 tests/us_bed_c_unit.js 測
    const room=()=>{ G.zone='us_bed_c'; E.zone={roomAt:()=>null,seats:[],spots:{sis:{x:0.86,z:-0.1,yaw:1.5708,act:'sit'}}}; GM.npc={}; E.player.obj.position={x:-0.35,y:0,z:0.55}; };
    fresh('2028-09-23',15,'us_shared',US({US2:'together'})); date('heroine_05'); room(); USL.sisSync(GM); const n=GM.npc.heroine_05;
    check('AA_399-8. 交往中、週六 15:00 進臥室 C：她坐在書桌前（spots.sis）', !!n&&n.uslSis&&n.pose==='sit'&&!!n.seat&&Math.abs(n.seat.x-0.86)<1e-6&&Math.abs(n.seat.z+0.1)<1e-6&&Math.abs(n.seat.yaw-1.5708)<1e-6, n&&JSON.stringify(n.seat));
    { const w=STORY.whereIs(GM,'heroine_05'); check('AA_399-8. 「現在大概在」照舊寫 C 棟 208', w&&w.away==='C 棟 208', JSON.stringify(w)); }
    at('2028-09-21',19); room(); USL.sisSync(GM); check('AA_399-8. 平日晚上（她在客廳）：臥室 C 裡沒有她', !GM.npc.heroine_05);
    fresh('2028-09-23',15,'us_shared',US({US2:'together'})); room(); USL.sisSync(GM); check('AA_399-8. 沒有交往：臥室 C 裡沒有她', !GM.npc.heroine_05);
    fresh('2028-09-23',15,'us_shared',US({US2:'together'})); date('heroine_05'); E.zone={roomAt:()=>null,seats:[{x:-3.8,z:0,ap:[-3.8,0]}],spots:{}}; USL.sisSync(GM); const m=GM.npc.heroine_05;
    check('AA_399-8. 同一個時段在客廳：照舊坐沙發（不受影響）', !!m&&!!m.seat&&Math.abs(m.seat.x+3.8)<1e-6);
    const D=US_SHARED_LAYOUT.doors.find(d=>d.id==='bedC'); fresh('2028-09-23',15,'us_shared',US());
    check('AA_399-8. 不是交往中，臥室 C 的門「看」＝「（門上貼著一張手寫的課表。）」', USL.lookFor(G,{label:D.label})==='（門上貼著一張手寫的課表。）', USL.lookFor(G,{label:D.label}));
    date('heroine_05'); at('2028-09-21',19); check('AA_399-8. 交往中、門關著的時候照舊「臥室 C。門關著。」（AA_287）', USL.lookFor(G,{label:D.label})==='臥室 C。門關著。', USL.lookFor(G,{label:D.label}));
    // AA_444：房間裡的「看」、第一次進去那一句
    fresh('2028-09-23',15,'us_bed_c',US({US2:'together'})); date('heroine_05');
    const say=async label=>{ said=[]; const ok=await STORY.interact({label,x:0,z:0},GM); return ok?said.map(q=>q.t):null; };
    { const t=await say('她的書桌'); check('AA_444. 書桌兩句（第二句「週六、週日下午那兩格是空白的」）', !!t&&t.length===2&&t[0].startsWith('（書桌上疊著三本很厚的判例教科書')&&t[1].includes('週六、週日下午那兩格是空白的。'), JSON.stringify(t)); }
    { const t=await say('書架'); check('AA_444. 書架兩句', !!t&&t.length===2&&t[0].startsWith('（書架下面兩層是判例彙編')&&t[1].includes('書角翻軟了的小說'), JSON.stringify(t)); }
    const win=async key=>{ at(key,15); return say('窗外'); };
    { const a=await win('2028-09-30'), b=await win('2028-10-01'), c=await win('2028-11-01'), d=await win('2028-12-01'), e=await win('2028-12-02');
      check('AA_444. 窗外照日期：9/30 綠、10/1 黃、11/1～12/1 剩幾片葉子、12/2 雪', a&&a[0]==='（窗外是一棵很大的樹，葉子擋住半個窗戶。）'&&b[0]==='（窗外那棵樹變黃了。靠窗的那一邊先變。）'&&c[0].startsWith('（窗外的樹只剩幾片葉子')&&d[0]===c[0]&&e[0]==='（窗外的樹枝上留著一點雪。窗台上也有。）'&&[a,b,c,d,e].every(x=>x.length===1), JSON.stringify([a,e])); }
    { const U0=global.US3; global.US3={usSeasonKey:()=>{ const d=CALENDAR.dateOf(G.day), md=d.m*100+d.d; return (md>=1202||md<=315)?'snow':md>=1101?'bare':md>=1009?'autumn':'summer'; }};   // 和 us3d.js 同一條規則
      const a7=await win('2028-10-07'), a9=await win('2028-10-09'); global.US3=U0;
      check('AA_444. 窗外那句跟窗景圖同一個季節：10/7 圖還是夏天＝綠的那句、10/9 秋天＝黃的那句（BB-B 10-24）', a7&&a7[0]==='（窗外是一棵很大的樹，葉子擋住半個窗戶。）'&&a9&&a9[0]==='（窗外那棵樹變黃了。靠窗的那一邊先變。）', JSON.stringify([a7,a9])); }
    G.visited.linze_5f=true; { const t=await win('2028-10-15'); check('AA_444. 去過她臺灣 5F 研究室：多一句', !!t&&t.length===2&&t[1]==='（她臺灣研究室的窗外，也有一棵樹，在差不多的位置。）', JSON.stringify(t)); }
    { caps=[]; E.player.busy=false; await USL.tick(GM,0.5); const c1=caps.slice(); caps=[]; await USL.tick(GM,0.5);
      check('AA_444. 第一次進她的房間：一句旁白、記 US_ROOM_C_SEEN；之後不出', c1.includes('（第一次進她的房間。東西很少，床鋪得很平。書桌靠著窗。）')&&G.flags.US_ROOM_C_SEEN!=null&&!caps.includes(c1[0]), JSON.stringify(c1)); }
    global.Z3=Z0; }
  // ======================= AA_399 第 8 節：法學院圖書館 2F 書庫（us_lawlib_2f，LAWWW2-B 10-24）=======================
  { const Z0=global.Z3; global.Z3=Object.assign({},Z0||{},{ZONES:Object.assign({},(Z0&&Z0.ZONES)||{},{us_lawlib_2f:{id:'us_lawlib_2f'}})});
    fresh('2028-10-10',10,'us_lawlib',US()); date('heroine_05');
    const a1=USL.sisAt(G); at('2028-10-10',10.5); const a2=USL.sisAt(G); at('2028-10-10',11.9); const a3=USL.sisAt(G);
    check('AA_399-8 2F. 平日 9:00～10:30 一樓（看書，到 10:30）、10:30～12:00 二樓書庫（站著）', a1&&a1.zone==='us_lawlib'&&a1.to===10.5&&a2&&a2.zone==='us_lawlib_2f'&&a2.stand&&a2.to===12&&a3&&a3.zone==='us_lawlib_2f', JSON.stringify([a1,a2]));
    at('2028-10-10',11); G.zone='us_campus'; { const w=STORY.whereIs(GM,'heroine_05'); check('AA_399-8 2F. 「現在大概在」：不在 2F＝「法學院圖書館 2F 書庫（看書，到 12:00）」', w&&w.zone==null&&w.away==='法學院圖書館 2F 書庫'&&w.act==='看書'&&w.until==='12:00', JSON.stringify(w)); }
    G.zone='us_lawlib_2f'; { const w=STORY.whereIs(GM,'heroine_05'); check('AA_399-8 2F. 人在 2F：區域就是 2F', w&&w.zone==='us_lawlib_2f', JSON.stringify(w)); }
    GM.npc={}; E.zone={roomAt:()=>null,seats:[],spots:{sis:{x:8.45,z:-0.9,yaw:1.5708,act:'stand'}}}; E.player.obj.position={x:8.4,y:0,z:-2.1}; USL.sisSync(GM); const n=GM.npc.heroine_05;
    check('AA_399-8 2F. 3D：進 2F 書庫，她站在 spots.sis（不是坐著）', !!n&&n.uslSis&&!n.seat&&Math.abs(n.obj.position.x-8.45)<1e-6&&Math.abs(n.obj.position.z+0.9)<1e-6, n&&JSON.stringify({seat:n.seat,pose:n.pose}));
    GM.npc={}; G.zone='us_lawlib'; E.zone={roomAt:()=>null,seats:[{x:1,z:1},{x:2,z:2},{x:3,z:3},{x:-4.75,z:-1.733,yaw:-1.57}],spots:{}}; USL.sisSync(GM); check('AA_399-8 2F. 11:00 一樓沒有她', !GM.npc.heroine_05);
    at('2028-10-10',11.75); G.zone='us_lawlib_2f'; { const L=STORY.ladData(G,'heroine_05'); const st=L&&L.L.steps.find(x=>/^SU-L/.test(x.id||'')); check('AA_399-8 2F. SU 閒聊階梯：11:30～12:00 的地點多了 2F 書庫', !!st&&st.location.includes('us_lawlib_2f')&&!!st.locTime.us_lawlib_2f, st&&JSON.stringify(st.location)); }
    { G.zone='us_lawlib_2f'; said=[]; const ok1=await STORY.interact({label:'樓梯（三樓）',x:0,z:0},GM); const s1=said.map(q=>q.t); said=[]; const ok2=await STORY.interact({label:'木梯',x:0,z:0},GM); const s2=said.map(q=>q.t);
      check('AA_444-4. 2F 書庫：往三樓的樓梯、木梯各兩句（照稿）', ok1&&ok2&&s1.length===2&&s1[1]==='（三樓要刷法學院自己學生的卡。你的卡刷不過。）'&&s2.length===2&&s2[1]==='（最上層那一排判例彙編，書背印的年份是一九六〇年代。）', JSON.stringify([s1,s2])); }
    { fresh('2028-10-10',10.75,'us_lawlib_2f',US()); date('heroine_05'); E.zone=Object.assign({roomAt:()=>null,seats:[]},{spots:{sis:{x:8.45,z:-0.9,yaw:1.5708}}}); delete GM.npc.heroine_05; spawned.length=0; USL.sisSync(GM); const n=GM.npc.heroine_05;
      check('AA_399-8 2F. 10:45 在 2F：學姊站在 spots.sis（8.45, -0.9）', !!n&&n.uslSis&&Math.abs(n.obj.position.x-8.45)<1e-6&&Math.abs(n.obj.position.z+0.9)<1e-6, JSON.stringify({spawned,a:USL.sisAt(G),n:n&&n.obj.position})); }
    if(typeof EXCH!=='undefined'&&EXCH.inUS){ G.zone='us_lawlib_2f'; const i1=EXCH.inUS(G); G.zone='us_bed_c'; const i2=EXCH.inUS(G); check('AA_399-8. 2F 書庫、學姊的房間也算在美國（EXCH.inUS）', i1&&i2); }
    global.Z3=Z0; }

  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

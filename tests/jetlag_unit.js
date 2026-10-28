// 1A-10 R1「時差」（AA_318；台詞照 AA_318 第 2 節＋e75ebc69 芯慈兩句）——不需要瀏覽器。照 AA_318 第 7 節 R1～R4 寫：
//   1. 9/6 21:00 阿哲在麵店團群組兩句（不在群組、和阿哲 FAMILIAR 以上＝私訊；都不是＝沒有）；美國路線沒有邀約；排出遊「阿鳳麵店」19:00；
//   2. 9/7 18:45～19:15 人在麵店就演（2D noodle_table）：R1 台灣路線語彤「妳曬黑了」對以安、「這半年」四選一只出經歷過的；R2 日本路線「你曬黑了」對祐廷、沒有「這半年」；
//   3. R4 和子晴不熟＝沒有子晴晚到那段、沒有芷若那句；不熟的人的句子跳過；芯慈兩句只給 XINCI_FIRST＋芯慈 FAMILIAR（慈 6 還沒做＝不出現）；
//   4. 到場的人熟悉度 +1、R1_SEEN 'table'；19:30 沒到＝手機版（一定要回、R1_SEEN 'phone'；私訊版沒有 Alison 那句）；
//   5. R3 美國路線：當地 07:30（台灣 19:30）手機照片＋「你們在美國吃什麼」，一定要回、R1_SEEN 'us'。
// 修改前全部 FAIL。用法：node tests/jetlag_unit.js
// （2026-10-28 AA_519 1-3（企劃線 d75cd0228，NPC-STORY2-1028）：收尾的送小菜旁白是第五處——「（九點。阿姨把最後一盤小菜放在長桌中間，說是送的。）」拆成「（九點。）」＋第 4 句「（阿姨把滷蛋切成兩半，一人一半。）」）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|EXCH)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/exchange3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let bgs=[]; global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(b){ bgs.push(b); },hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,EXCH_RULE:1,EXCH_APPLIED_DAY:D('2027-11-18'),EXCHANGE_ROUTE:'TW',ROOM_Y4:D('2028-09-03'),Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0,study:0},vac:{reg:{}}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; bgs=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const FAM=id=>{ const r=SOCIAL.rel(id); r.fam=25; r.trust=10; r.comf=10; SOCIAL.remember(id,'FIRST_MET',''); };
const ALL=['zhe','heroine_01','yu','heroine_03','heroine_04','heroine_02'];
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th);
const txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const run=(day,h0,h1,st)=>{ st=st||0.25; G.day=day; G.weekday=wdOf(day); for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
(async()=>{
  const d6=D('2028-09-06'), d7=D('2028-09-07');
  check('0. 9/6 週三、9/7 週四（大四上第 1 週）；ev_r1_jetlag 不是 auto（S.y4Tick 叫）', CALENDAR.dateOf(d6).wd===3&&CALENDAR.dateOf(d7).wd===4&&CALENDAR.termOf(d7).id==='Y4S1'&&CALENDAR.termOf(d7).week===1&&STORY_EVENTS.find(e=>e.id==='ev_r1_jetlag').trigger==='manual');
  // 1. 邀約
  fresh(d6,20,'dorm'); PHONE.join(G,'noodle_team','麵店團'); run(d6,20,20.9); check('1. 9/6 21:00 以前沒有', !PHONE.sent(G,'y4_r1_ask'));
  run(d6,21,21.25); check('1. 9/6 21:00 麵店團群組：「明天七點 麵店」「暑假都沒見到人 全部給我來」', JSON.stringify(txt('g:noodle_team').slice(-2))===JSON.stringify(['zhe:明天七點 麵店','zhe:暑假都沒見到人 全部給我來']), JSON.stringify(txt('g:noodle_team')));
  run(d7,8,8); { const q=OUT.get(G,'y4_r1'); check('1. 排出遊：阿鳳麵店 19:00（late 0.25，帶到麵店）', !!q&&q.day===d7&&q.h===19&&q.late===0.25&&q.goto&&q.goto.zone==='noodle', JSON.stringify(q)); }
  fresh(d6,21,'dorm'); FAM('zhe'); run(d6,21,21.25); check('1. 不在群組、和阿哲 FAMILIAR 以上：私訊同一句', JSON.stringify(txt('p:zhe').slice(-2))===JSON.stringify(['zhe:明天七點 麵店','zhe:暑假都沒見到人 全部給我來']));
  fresh(d6,21,'dorm'); run(d6,21,21.5); check('1. 不在群組、和阿哲不熟：沒有', !PHONE.sent(G,'y4_r1_ask'));
  fresh(d6,21,'us_apartment',{EXCHANGE_ROUTE:'US',US_ARRIVED:true}); PHONE.join(G,'noodle_team','麵店團'); run(d6,8,22); check('1. 美國路線：沒有邀約（只有手機版）', !PHONE.sent(G,'y4_r1_ask'));
  // 2. 長桌
  const table=async(route,famIds,flags,pk)=>{ fresh(d7,19,'noodle',Object.assign({EXCHANGE_ROUTE:route},flags||{})); PHONE.join(G,'noodle_team','麵店團'); for(const id of famIds) FAM(id); run(d6,21,21); G.day=d7; G.hour=19; G.zone='noodle';
    const fam0={}; for(const id of ['zhe','heroine_01','yu','heroine_03','heroine_04','classmate_xinci']) fam0[id]=SOCIAL.rel(id).fam;
    picks=pk||[]; const ok=STORY.r1Due(G); await STORY.r1Table(GM); return {ok,T:lines(),fam0}; };
  let R=await table('TW',ALL,{YT_T1:true,ATTENDED_SHOW:true},['先聽']);
  check('2. 9/7 19:00 人在麵店：到期、演（R1_SEEN table）', R.ok&&G.flags.R1_SEEN==='table');
  check('2. 開場六句（阿哲、以安、Alison）', JSON.stringify(R.T.slice(0,7))===JSON.stringify(['阿哲：欸，你們回來了。','沈以安：阿哲，Alison 呢？她不是每次都坐你旁邊？','阿哲：她在看電影。一個人。','沈以安：……一個人？','阿哲：（很得意）她現在會一個人去看電影了。看完會打給我講劇情。講兩個小時。','Alison：（剛好進門）我聽到我的名字了。（坐到阿哲旁邊）那部超好看，你們都要去看。','陳語彤：妳曬黑了。']), JSON.stringify(R.T.slice(0,7)));
  check('2. R1 台灣路線：語彤「妳曬黑了。」對以安 → 以安「日本的夏天。」→「那就是吃太多。」', R.T.join('|').includes('陳語彤：妳曬黑了。|沈以安：日本的夏天。|陳語彤：那就是吃太多。')&&!R.T.includes('祐廷：日本的夏天。'));
  check('2. 以安問語彤四句', R.T.join('|').includes('沈以安：語彤，妳上學期都在幹嘛？|陳語彤：（從背包拿出一本很厚的筆記）訪問了二十三個老闆。……阿姨是第二十三個。|沈以安：給我看。|陳語彤：吃麵先。'));
  const half=opts.find(o=>o.includes('「（先聽大家講）」'))||[];
  check('2. R1「這半年」：Alison 問、四選一只出經歷過的（田野、Q12、芷若熟、先聽）', R.T.includes('Alison：欸，你一直在臺灣。這半年發生什麼事？')&&JSON.stringify(half)===JSON.stringify(['「語彤每個禮拜四都去市場訪問。我跟過幾次。」','「子晴的發表會，最後一關有人打過了。」','「芷若回來半年，九月又去英國了。這次是念研究所。」','「（先聽大家講）」'])&&R.T.includes('（你把筷子拿起來，讓別人先說。）'), JSON.stringify(half));
  check('2. 子晴晚到（以安、子晴都熟）、芷若那句「英國在下雨」（芷若也熟）', R.T.join('|').includes('（長桌還有一個空位。過了半小時，門口有人喘著氣。）|高子晴：欸不是，我下班了。（坐下，第一句就問以安）日本的貓胖嗎？|沈以安：……胖。|高子晴：（低頭看手機）喔對，芷若說英國在下雨。她每次都這樣說。'));
  check('2. 收尾：「（九點。）」「（阿姨把滷蛋切成兩半，一人一半。）」（AA_519 1-3 送小菜第五處）「下禮拜四，一樣。」；21:00；背景 noodle_table', R.T.slice(-3).join('|')==='（九點。）|（阿姨把滷蛋切成兩半，一人一半。）|阿哲：下禮拜四，一樣。'&&!R.T.some(t=>/最後一盤小菜/.test(t))&&Math.abs(G.hour-21)<0.01&&JSON.stringify(bgs[0]||'').includes('noodle_table'), G.hour);
  check('2. 到場的人熟悉度 +1（阿哲、以安、Alison、語彤、子晴）', ['zhe','heroine_01','yu','heroine_03','heroine_04'].every(id=>SOCIAL.rel(id).fam>R.fam0[id]), JSON.stringify(['zhe','heroine_01','yu','heroine_03','heroine_04'].map(id=>[R.fam0[id],SOCIAL.rel(id).fam])));
  check('2. 芯慈：XINCI_FIRST 沒有（慈 6 還沒做）＝沒有那兩句', !R.T.some(t=>/我跟妳說一部劇/.test(t)));
  R=await table('TW',ALL,{},['語彤']); check('2. 「這半年」沒有田野、沒有 Q12：只有芷若、先聽兩個', JSON.stringify((opts.find(o=>o.includes('「（先聽大家講）」'))||[]))===JSON.stringify(['「芷若回來半年，九月又去英國了。這次是念研究所。」','「（先聽大家講）」']));
  R=await table('TW',ALL,{YT_T1:true},['市場']); check('2. 選語彤那個：語彤「……你只會站在旁邊吃東西。」', R.T.includes('陳語彤：……你只會站在旁邊吃東西。'));
  R=await table('TW',ALL,{ATTENDED_SHOW:true},['發表會']); check('2. 選子晴那個：以安「誰？」→ 祐廷「……她自己講比較好。」', R.T.join('|').includes('沈以安：誰？|祐廷：……她自己講比較好。'));
  R=await table('TW',ALL,{},['芷若']); check('2. 選芷若那個：Alison「又？」→ 阿哲「她是去念書，不是去旅行。」', R.T.join('|').includes('Alison：又？|阿哲：她是去念書，不是去旅行。'));
  R=await table('JP',ALL,{YT_T1:true});
  check('2. R2 日本路線：語彤「你曬黑了。」對祐廷 → 祐廷「日本的夏天。」；沒有「這半年」', R.T.join('|').includes('陳語彤：你曬黑了。|祐廷：日本的夏天。|陳語彤：那就是吃太多。')&&!R.T.some(t=>/這半年/.test(t))&&!R.T.includes('陳語彤：妳曬黑了。'));
  // 3. 不熟的人
  R=await table('TW',['zhe','heroine_01','yu','heroine_03','heroine_02']);
  check('3. R4 和子晴不熟：沒有子晴晚到、沒有芷若那句；到場的人沒有子晴', !R.T.some(t=>/下班了|貓胖|英國在下雨|長桌還有一個空位/.test(t))&&SOCIAL.rel('heroine_04').fam===R.fam0.heroine_04);
  R=await table('TW',['zhe','heroine_01','yu','heroine_03','heroine_04']); check('3. 和芷若不熟：子晴照樣晚到、沒有芷若那句；「這半年」沒有芷若那個', R.T.some(t=>/下班了/.test(t))&&!R.T.some(t=>/英國在下雨/.test(t))&&!(opts.find(o=>o.includes('「（先聽大家講）」'))||[]).some(t=>/芷若/.test(t)));
  R=await table('TW',['zhe','yu']); check('3. 只熟阿哲、Alison：沒有以安、語彤的句子（以安問 Alison 那段、曬黑、筆記、子晴都跳過），「這半年」照樣問', R.T[0]==='阿哲：欸，你們回來了。'&&!R.T.some(t=>/^沈以安|^陳語彤/.test(t))&&R.T.includes('Alison：欸，你一直在臺灣。這半年發生什麼事？'), JSON.stringify(R.T));
  R=await table('TW',ALL.concat(['classmate_xinci']),{XINCI_FIRST:true});
  check('3. 芯慈（XINCI_FIRST＋FAMILIAR，e75ebc69）：「吃麵先。」之後三句，熟悉度 +1', R.T.join('|').includes('陳語彤：吃麵先。|（芯慈坐到以安旁邊，先開口。）|吳芯慈：我跟妳說一部劇。|沈以安：……好。妳說。')&&SOCIAL.rel('classmate_xinci').fam>R.fam0.classmate_xinci, JSON.stringify(R.T.slice(10,14)));
  R=await table('TW',ALL,{XINCI_FIRST:true}); check('3. XINCI_FIRST 但和芯慈不熟：沒有', !R.T.some(t=>/一部劇/.test(t)));
  // 4. 時間、沒到
  fresh(d7,18.7,'noodle'); PHONE.join(G,'noodle_team','麵店團'); run(d6,21,21); G.day=d7; G.hour=18.7; check('4. 18:42 還不演、18:45 起、19:15 以後不演', !STORY.r1Due(G)&&(G.hour=18.75,STORY.r1Due(G))&&(G.hour=19.25,!STORY.r1Due(G)));
  G.hour=18.8; G.zone='campus'; check('4. 不在麵店不演', !STORY.r1Due(G));
  run(d7,19,19.25); check('4. 19:30 以前沒有手機版', !PHONE.sent(G,'y4_r1_phone')); run(d7,19.5,19.75);
  check('4. 沒到（群組）：19:30 阿哲三則＋Alison「不要講！」；一定要回；R1_SEEN phone', JSON.stringify(txt('g:noodle_team').slice(-4))===JSON.stringify(['zhe:（照片：長桌，少一個人）','zhe:人呢','zhe:你錯過 Alison 一個人看電影的故事','yu:不要講！'])&&G.flags.R1_SEEN==='phone'&&PHONE.byAsk(G,'y4_r1_phone').ask.must===true, JSON.stringify(txt('g:noodle_team').slice(-4)));
  { const m=PHONE.byAsk(G,'y4_r1_phone'); check('4. 回覆兩個：「下禮拜一定到。」→「下禮拜四」；「（傳一張道歉的貼圖）」→「收到」', JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['下禮拜一定到。','（傳一張道歉的貼圖）'])&&m.ask.opts[0].say[0].text==='下禮拜四'&&m.ask.opts[1].say[0].text==='收到');
    PHONE.answer(G,'y4_r1_phone',1); check('4. 回了貼圖：阿哲「收到」', txt('g:noodle_team').slice(-1)[0]==='zhe:收到'); }
  G.zone='noodle'; G.hour=19.1; check('4. 手機版之後回到麵店：不再演', !STORY.r1Due(G));
  fresh(d6,21,'dorm'); FAM('zhe'); run(d6,21,21.25); run(d7,19,19.75); check('4. 私訊版：沒有 Alison 那句、照樣一定要回', JSON.stringify(txt('p:zhe').slice(-3))===JSON.stringify(['zhe:（照片：長桌，少一個人）','zhe:人呢','zhe:你錯過 Alison 一個人看電影的故事'])&&PHONE.byAsk(G,'y4_r1_phone').ask.must===true);
  // 5. 美國
  fresh(d7,7,'us_apartment',{EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true}); PHONE.join(G,'noodle_team','麵店團'); run(d7,7,7.25); check('5. R3 美國：當地 07:30 以前沒有', !PHONE.sent(G,'y4_r1_us')&&STORY.abroad(G)&&STORY.tzOffset(G)===-12);
  run(d7,7.5,7.75); check('5. R3 美國：當地 07:30（台灣 19:30）「（照片：長桌）」「你們在美國吃什麼」，一定要回；R1_SEEN us', JSON.stringify(txt('g:noodle_team').slice(-2))===JSON.stringify(['zhe:（照片：長桌）','zhe:你們在美國吃什麼'])&&PHONE.byAsk(G,'y4_r1_us').ask.must===true&&G.flags.R1_SEEN==='us');
  { const m=PHONE.byAsk(G,'y4_r1_us'); check('5. 回覆：「超市的冷凍水餃。」→ 阿哲「……回來請你吃麵」；照片 → Alison「好可憐」', JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['超市的冷凍水餃。','（傳一張照片：公寓廚房的一鍋泡麵）'])&&m.ask.opts[0].say[0].text==='……回來請你吃麵'&&m.ask.opts[1].say[0].from==='yu'&&m.ask.opts[1].say[0].text==='好可憐'); }
  G.zone='noodle'; G.hour=19; check('5. 美國路線：長桌不演', !STORY.r1Due(G));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

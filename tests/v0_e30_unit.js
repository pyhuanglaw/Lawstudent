// v0 ★E30 辦休學的那天（AA_169 完整稿）：2024-10-17 起休學（AA_218 第 11 節；原本 3/27）、14:40 自動、等下課／先走（群組 15:12）、15:10 以後只剩先走、當晚便利貼——不需要瀏覽器。
// 修改前沒有 ev_y0_e30（全部失敗）。用法：node tests/v0_e30_unit.js
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
  const D=STORY.dayOfKey('2024-10-17'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_e30'), note=STORY_EVENTS.find(e=>e.id==='ev_y0_e30_note'); check('0. E30、便利貼在；10/17 是週四、STORY.Y0_LEAVE_DAY＝2024-10-17',!!ev&&!!note&&CALENDAR.dateOf(D).wd===4&&STORY.Y0_LEAVE_DAY==='2024-10-17'); if(!ev||!note){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D-1,20,'dorm'); run(); check('1. 10/16：還沒休學',!G.flags.Y0_LEFT);
  fresh(D,8,'dorm'); run(); check('1. 10/17 起休學（Y0_LEFT）：那天的經濟系的課（英文、會計）都不排',G.flags.Y0_LEFT===true&&!CLS.dayItems(G,D).length,JSON.stringify(CLS.dayItems(G,D).map(i=>i.c.id)));
  { fresh(D-1,8,'dorm'); run(); const before=CLS.dayItems(G,D-1).map(i=>i.c.id); fresh(D+5,8,'dorm'); run(); let later=0; for(let d=D;d<D+120;d++) later+=CLS.dayItems(G,d).length;
    check('1. 休學前一天（10/16 週三）還有經濟系的課；10/17 以後四個月（含期中、期末考週）一堂都不排',before.includes('calc_y0s1')&&later===0,JSON.stringify(before)+' / '+later); }
  const ck=h=>{ fresh(D,h,'campus'); return EVENTS.check(ev); }; check('2. 14:40 起自動；14:30 不演',ck(14.7)&&!ck(14.5));
  /* AA_305 第 5 節（使用者：休學只告訴可昕）：窗外、等下課那段整段拿掉；10/17 22:30 便利貼拿掉（搬到 10/31 搬家那天） */
  fresh(D,14.7,'campus'); PHONE.join(G,'econ_friends','走啦'); let seen=null; const ch0=GM.choose; GM.choose=async o=>{ seen=o.map(q=>q.t); return 0; }; await EVENTS.run(ev); GM.choose=ch0; let L=said.map(x=>x.t);
  check('3. 行政大樓「星期四下午，行政大樓。你把申請書交出去。」→ 承辦人 →「手續比你想的快。十五分鐘。」→「（你沒有跟任何人說。）」→ 捷運上的電話（「捷運上。要回家跟我媽說。」）→「（她掛掉了。）」→ 回家跟媽媽說（AA_308 第 4 節：「……想好了？」…「鑰匙在老地方。開慢一點。」）；沒有窗外、等下課、選項',L[0]==='星期四下午，行政大樓。你把申請書交出去。'&&L.indexOf('（你沒有跟任何人說。）')===L.indexOf('手續比你想的快。十五分鐘。')+1&&L.includes('捷運上。要回家跟我媽說。')&&L[L.indexOf('（她掛掉了。）')+1]==='（臺北的家。媽媽坐在客廳的桌子前記帳。）'&&L.includes('……想好了？')&&L[L.length-1]==='鑰匙在老地方。開慢一點。'&&!L.some(t=>/窗外|舉了一下筆|等他們下課|下課鐘|那就不算走/.test(t))&&seen===null,JSON.stringify(L));
  check('3. LEAVE_WEEK＝6、E30_WAITED 不記、時間到 15:30（AA_296 電話）',G.flags.LEAVE_WEEK===6&&G.flags.E30_WAITED===undefined&&Math.abs(G.hour-15.5)<1e-6);
  G.hour=15.1; run(); G.hour=15.25; run(); check('5. 15:12 群組沒有阿勳「我在裡面舉筆了。你有看到嗎？」（他不知道）',!PHONE.thread(G,'g:econ_friends').some(x=>x.text==='我在裡面舉筆了。你有看到嗎？'));
  G.zone='dorm'; G.hour=22.2; check('4. 10/17 22:00 以後回房間：便利貼不演（AA_305：搬到 10/31 搬家那天）',!EVENTS.check(note)); G.day=D+1; G.hour=12; check('4. 隔天也不演',!EVENTS.check(note));
  /* AA_305 第 6 節：10/29（二）12:10 小福，唐睿問「你什麼時候才要跟我們說？」 */
  { const xf=STORY_EVENTS.find(e=>e.id==='ev_y0_xiaofu'); fresh(STORY.dayOfKey('2024-10-29'),12+10/60,'campus',{LEAVE_WEEK:6}); picks=['沒有說話']; await EVENTS.run(xf); const LX=said.map(x=>x.t);
    check('7. 10/29 小福：唐睿「我高中參加過聯校的社團……」「昨天他傳訊息問我：「你們系的祐廷，是不是休學了？」」→「……你什麼時候才要跟我們說？」→（沒有說話）→ 品妤「妳也知道？」可昕「……他叫我不要說。」→ 阿勳「（低頭吃飯）……月底。」；Y0_FRIENDS_KNOW、XF_ANSWER silent',!!xf&&xf.trigger==='econff'&&LX.includes('昨天他傳訊息問我：「你們系的祐廷，是不是休學了？」')&&LX.includes('……你什麼時候才要跟我們說？')&&LX.includes('（唐睿等了一下，才把筷子拆開。）')&&LX.indexOf('……他叫我不要說。')===LX.indexOf('（轉頭）妳也知道？')+1&&LX.includes('（低頭吃飯）……月底。')&&G.flags.Y0_FRIENDS_KNOW===true&&G.flags.XF_ANSWER==='silent',JSON.stringify(LX)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

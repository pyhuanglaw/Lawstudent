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
  fresh(D,14.7,'campus'); SOCIAL.meet('econ_zhengxun','x'); SOCIAL.meet('econ_pinyu','x'); const f0=SOCIAL.rel('econ_pinyu').fam; picks=['等他們下課']; await EVENTS.run(ev); let L=said.map(x=>x.t);
  check('3. 行政大樓「星期四下午，行政大樓。你把申請書交出去。」→ 承辦人 →…「阿勳在裡面，對你舉了一下筆。」→「等他們下課。」→ 阿勳「你在窗外站很久。我以為你要來上課。」… 唐睿「那就不算走。」',L[0]==='星期四下午，行政大樓。你把申請書交出去。'&&L.includes('阿勳在裡面，對你舉了一下筆。')&&L.includes('你在窗外站很久。我以為你要來上課。')&&L[L.length-1]==='那就不算走。',JSON.stringify(L));
  check('3. LEAVE_WEEK＝6、E30_WAITED、品妤熟悉 +1、時間到 15:10',G.flags.LEAVE_WEEK===6&&G.flags.E30_WAITED===true&&SOCIAL.rel('econ_pinyu').fam===f0+1&&Math.abs(G.hour-(15+10/60))<1e-6);
  G.zone='dorm'; G.hour=21.9; check('4. 22:00 以前沒有便利貼',!EVENTS.check(note)); G.hour=22.2; said=[]; await EVENTS.run(note); L=said.map(x=>x.t);
  check('4. 22:00 以後回房間：「檯燈上多了一張便利貼。阿勳的字。」「保齡球欠我一場。」＋等過的人多一行小字；Y0_STICKY',L.join('|')==='檯燈上多了一張便利貼。阿勳的字。|保齡球欠我一場。|下面還有一行小字：「今天的下課，算你有來。」'&&G.flags.Y0_STICKY===true,JSON.stringify(L));
  // 先走
  fresh(D,14.7,'campus'); PHONE.join(G,'econ_friends','走啦'); picks=['先走']; await EVENTS.run(ev); L=said.map(x=>x.t);
  check('5. 「先走。」→「你沒有等下課，先走了。」、E30_WAITED＝false',L[L.length-1]==='你沒有等下課，先走了。'&&G.flags.E30_WAITED===false);
  G.hour=15.1; run(); G.hour=15.25; run(); const m=PHONE.thread(G,'g:econ_friends').find(x=>x.text==='我在裡面舉筆了。你有看到嗎？');
  check('5. 15:12 群組阿勳「我在裡面舉筆了。你有看到嗎？」→「有。」→「好。那就算數。」',!!m&&(PHONE.answer(G,'y0_e30',0),TH('g:econ_friends').includes('好。那就算數。')));
  G.zone='dorm'; G.hour=22.5; said=[]; await EVENTS.run(note); check('5. 先走的人：便利貼沒有小字',said.length===2);
  // 15:10 以後才開始：只剩先走
  fresh(D,15.5,'campus'); let seen=[]; const ch0=GM.choose; GM.choose=async o=>{ seen=o.map(q=>q.t); return 0; }; await EVENTS.run(ev); GM.choose=ch0;
  check('6. 15:10 以後才開始（在別的事件裡）：選項只有「先走。」',seen.length===1&&seen[0]==='「先走。」',JSON.stringify(seen));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

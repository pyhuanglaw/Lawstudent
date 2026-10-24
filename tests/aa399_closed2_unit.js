// AA_399（企劃線 5d09bb725）第 5、7、12 節：還沒有 3D 房間、在門口做得到的部分（src/closed2_3d.js）——不需要瀏覽器。
//   1. 第 5 節　萬才館研討室 B 門上的紙：平常「法服初談：單週六上午」、2028-10-26「推甄面試，請在外面等候」；按門（classes3d.js 的 roomDoor，按下去的時候才讀 closed）看得到；其他門不變；
//   2. 第 7 節　系辦門口交換志願表：US 路線、11/15～截止旁白以前、辦公時間；助理一句逐字、EXCH_FORM_DESK、一次；TW、JP、經濟系、午休、週末、截止以後、旁白播過＝沒有；以安那一段還在＝Café 以後；
//      在門口交過＝11/18 旁白沒有「你把表交到系辦」那一句（沒交照舊）；
//   3. 第 12 節　總圖多媒體中心「看一部片」（60 分鐘）：旁白逐字、時間 +1；「算了」不動；21:00 以後（看完會過 22:00）照舊是門上的字。
// 修改前全部 FAIL（沒有 src/closed2_3d.js）。用法：node tests/aa399_closed2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|WANCAI_LAYOUT|CLOSED2)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/wancai_layout.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/closed2_3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], hints=[], picks=[], G=null, toasts=[], caps=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(n,t){ caps.push(t); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); hints.push(o.map(q=>q.hint||'')); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; hints=[]; picks=[]; toasts=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const LV={FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>m.text);
const d15=D('2027-11-15'), d16=D('2027-11-16'), d17=D('2027-11-17'), d18=D('2027-11-18');global.GAME=GM;
const has=typeof CLOSED2!=='undefined';
const SIGN='研討室 B。門上貼著一張紙：「法服初談：單週六上午」', SIGN_IV='研討室 B。門上貼著一張紙：「推甄面試，請在外面等候」';
const OFFICE_LOOK='學院辦公室。玻璃門上貼著辦公時間：週一至週五 9:00–17:00。';
const office=()=>({x:1.6,z:-6.25,radius:1.15,lv:0,label:'法律學院辦公室',look:OFFICE_LOOK});
const media=()=>({x:10.4,z:-8.8,lv:1,label:'多媒體中心',look:'多媒體中心。這學期整修，暫停開放。'});
const act=async(it,zone,p)=>{ G.zone=zone; said=[]; opts=[]; hints=[]; caps=[]; picks=p||[]; return !!(await STORY.interact(it,GM)); };
const semB=()=>WANCAI_LAYOUT.doors.find(d=>d.id==='seminarB');
(async()=>{
  check('0. 載入 src/closed2_3d.js（CLOSED2）', has);
  // 1. 研討室 B
  fresh(D('2027-05-22'),10,'wancai'); check('1. 平常：門上的紙「法服初談：單週六上午」', semB().closed===SIGN, JSON.stringify(semB().closed));
  await CLS.roomDoor(GM,'wancai','seminarB',{look:semB().closed}); check('1. 按門（roomDoor，按下去才讀 closed）：字幕是那張紙', caps.includes(SIGN), JSON.stringify(caps));
  fresh(D('2028-10-26'),9,'wancai'); check('1. 2028-10-26 推甄面試那天：「推甄面試，請在外面等候」', semB().closed===SIGN_IV, JSON.stringify(semB().closed));
  caps=[]; await CLS.roomDoor(GM,'wancai','seminarB',{look:semB().closed}); check('1. 推甄那天按門：字幕是面試那張紙', caps.includes(SIGN_IV));
  fresh(D('2028-10-27'),9,'wancai'); check('1. 隔天：換回平常那張', semB().closed===SIGN);
  check('1. 其他門不變（研討室 A、演講廳的字照 wancai_layout.js）', WANCAI_LAYOUT.doors.filter(d=>d.id!=='seminarB').every(d=>d.closed===undefined||typeof Object.getOwnPropertyDescriptor(d,'closed').value==='string'));
  check('1. JSON 照樣輸出得出來（Blender 讀檔案，不受影響）', JSON.parse(JSON.stringify(WANCAI_LAYOUT)).doors.find(d=>d.id==='seminarB').closed===SIGN);
  // 2. 系辦：US（和學姊交往、不認識以安）
  const d15=D('2027-11-15'), d16=D('2027-11-16'), d17=D('2027-11-17'), d18=D('2027-11-18');
  check('2. 前提：11/15 是週一', CALENDAR.dateOf(d15).wd===1);
  fresh(d15,10,'linze'); date('heroine_05'); check('2. US、11/15 10:00：在門口交得到', has&&CLOSED2.formDue(G)===true);
  let r=await act(office(),'linze',[0]);
  check('2. 選項「交志願表」「算了」', r&&JSON.stringify(opts[0])===JSON.stringify(['交志願表','算了']), JSON.stringify(opts));
  check('2. 系辦助理一句逐字', JSON.stringify(lines())===JSON.stringify(['系辦助理：交換志願表？放這裡。……第一志願寫好了嗎？好。']), JSON.stringify(lines()));
  check('2. 記 EXCH_FORM_DESK＝那一天；路線不在這裡定', G.flags.EXCH_FORM_DESK===d15&&!G.flags.EXCHANGE_ROUTE);
  r=await act(office(),'linze',[0]); check('2. 交過了：再按門照舊是辦公時間（一次）', r===false&&said.length===0);
  fresh(d15,10,'linze'); date('heroine_05'); r=await act(office(),'linze',[1]); check('2. 選「算了」：沒有記、沒有台詞', r===true&&G.flags.EXCH_FORM_DESK==null&&said.length===0);
  const no=async(name,setup)=>{ setup(); const ok=has&&CLOSED2.formDue(G)===false&&(await act(office(),'linze',[0]))===false&&G.flags.EXCH_FORM_DESK==null; check(name,ok); };
  await no('2. 午休 12:30：沒有（門上的辦公時間）',()=>{ fresh(d15,12.5,'linze'); date('heroine_05'); });
  await no('2. 17:00 以後：沒有',()=>{ fresh(d16,17,'linze'); date('heroine_05'); });
  await no('2. 08:50：沒有',()=>{ fresh(d16,8.84,'linze'); date('heroine_05'); });
  await no('2. 11/14：還沒開始',()=>{ fresh(D('2027-11-14'),10,'linze'); date('heroine_05'); });
  await no('2. 11/18 12:00：截止了',()=>{ fresh(d18,12,'linze'); date('heroine_05'); });
  await no('2. 11/18 截止旁白播過（ROUTE_NARR）：沒有',()=>{ fresh(d18,10,'linze',{ROUTE_NARR:d18}); date('heroine_05'); });
  await no('2. 單身（TW）：沒有（旁白「最後沒有交」）',()=>{ fresh(d16,10,'linze'); });
  await no('2. 和以安交往（JP）：沒有（11/16「我們一起填」、Café「明天早上一起交」）',()=>{ fresh(d16,10,'linze'); date('heroine_01'); });
  await no('2. 經濟系：沒有',()=>{ fresh(d16,10,'linze',{}); date('heroine_05'); G.stage='econ'; });
  await no('2. US、以安那一段還在（FAMILIAR）、Café 還沒：沒有（Café 上填表）',()=>{ fresh(d16,10,'linze'); date('heroine_05'); R('heroine_01','FAM'); });
  fresh(d17,16.25,'linze',{AN15_SEEN:d17}); date('heroine_05'); R('heroine_01','FAM'); check('2. US、Café 演過以後：交得到', has&&CLOSED2.formDue(G)===true&&(await act(office(),'linze',[0]))===true&&G.flags.EXCH_FORM_DESK===d17);
  r=await act(Object.assign(office(),{label:'101 教室'}),'linze',[0]); check('2. 別的門：不接', r===false);
  // 2b. 11/18 旁白
  fresh(d18,9,'dorm'); date('heroine_05'); const L0=STORY.routeNarrLines(G);
  check('2b. 沒在門口交：旁白照舊有「（你把表交到系辦。助理蓋了章，沒有抬頭。）」', L0.includes('（你把表交到系辦。助理蓋了章，沒有抬頭。）'), JSON.stringify(L0));
  fresh(d18,9,'dorm',{EXCH_FORM_DESK:d16}); date('heroine_05'); const L1=STORY.routeNarrLines(G);
  check('2b. 在門口交過：旁白沒有「你把表交到系辦」那一句、其他照舊', !L1.some(t=>/你把表交到系辦/.test(t))&&L1.length===L0.length-1&&L1.every(t=>L0.includes(t)), JSON.stringify(L1));
  said=[]; await STORY.routeNarr(GM); check('2b. 在門口交過：11/18 實際播的也沒有那一句', has&&!said.some(s=>/你把表交到系辦/.test(s.t))&&G.flags.ROUTE_NARR===d18, JSON.stringify(lines()));
  fresh(d18,9,'dorm',{EXCH_FORM_DESK:d16}); const L2=STORY.routeNarrLines(G); check('2b. 交過、後來變成 TW（分手）：TW 的旁白照舊（路線規則不改）', JSON.stringify(L2)===JSON.stringify(['（志願表你拿了一張，放在書包裡一個禮拜。最後沒有交。）','（你想，大四還沒開始。你想在這裡過。）']));
  // 3. 多媒體中心
  fresh(D('2026-03-10'),14,'library_hall'); r=await act(media(),'library_hall',[0]);
  check('3. 選項「看一部片」（小字「60 分鐘」）「算了」', r&&JSON.stringify(opts[0])===JSON.stringify(['看一部片','算了'])&&hints[0][0]==='60 分鐘', JSON.stringify(opts)+JSON.stringify(hints));
  check('3. 旁白逐字、時間 +1 小時', JSON.stringify(lines())===JSON.stringify(['（你借了一副耳機。片子很長，你看到一半睡著了。）'])&&G.hour===15, JSON.stringify(lines())+' '+G.hour);
  fresh(D('2026-03-10'),14,'library_hall'); r=await act(media(),'library_hall',[1]); check('3. 「算了」：時間不動、沒有旁白', r===true&&G.hour===14&&said.length===0);
  fresh(D('2026-03-10'),21,'library_hall'); r=await act(media(),'library_hall',[0]); check('3. 21:00 還可以（看完 22:00）', r===true&&G.hour===22);
  fresh(D('2026-03-10'),21.5,'library_hall'); r=await act(media(),'library_hall',[0]); check('3. 21:30：看完會過 22:00 關門，照舊是門上的字', r===false&&G.hour===21.5&&said.length===0);
  fresh(D('2026-03-10'),14,'library'); r=await act(media(),'library',[0]); check('3. 別的區域同名的東西：不接', r===false);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

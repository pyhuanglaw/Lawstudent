// VA-07 柏翰的週四總圖（AA_241 第 5、6 節）——不需要瀏覽器。用法：node tests/va07_bohan_unit.js
//   1. 大一暑假 6/27 起柏翰回新竹：週四 9:00～17:00 在總圖（library），其他時候不在；6/26 以前、大一下照舊；大二暑假不受影響
//   2. 第一次在暑假週四和他說話（ACQUAINTANCE 以上）：「新竹到這裡，一小時二十分。單程。」…兩個選項；「一起讀？」記 BOHAN_SUMMER_THU；只演一次
//   3. 同一天不再招呼；下一個週四：短招呼「（他抬頭點了一下，指了指旁邊的位子。）」，一週一次
//   4. 還不認識（STRANGER）不演；不是週四不演
// 修改前：沒有 STORY.bohanSummer、沒有 ev_va07_bohan_thu（全部失敗）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|VAC|VAC_DATA)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };
(async()=>{
  const B='classmate_bohan', th=D('2026-07-02'), fr=D('2026-07-03'), th2=D('2026-07-09'), j25=D('2026-06-25');
  check('0. 7/2、7/9 是週四；6/25 是週四',wdOf(th)===4&&wdOf(th2)===4&&wdOf(j25)===4);
  const where=(day,hour)=>{ fresh(day,hour,'library',{}); G.stage='law'; const e=STORY.schedEnt(CHARACTERS[B],G); return e?(e.zone||'out:'+(e.away||'')):null; };
  check('1. 暑假週四 10:00 在總圖、16:30 在總圖',where(th,10)==='library'&&where(th,16.5)==='library');
  check('1. 暑假週四 18:00、週五 10:00：回新竹了',where(th,18)==='out:回新竹了'&&where(fr,10)==='out:回新竹了',JSON.stringify([where(th,18),where(fr,10)]));
  check('1. 6/25（週四，還沒回新竹）照舊的作息',where(j25,9)==='library'&&where(D('2026-06-26'),9)==='library');
  check('1. 大二暑假（2027-07-01 週四）不受影響',(()=>{ fresh(D('2027-07-01'),10,'library',{}); G.stage='law'; return !STORY.bohanSummer(G); })());
  const e1=ev('ev_va07_bohan_thu'), e2=ev('ev_va07_bohan_thu_greet');
  check('0. 兩個事件都在',!!e1&&!!e2); if(!e1||!e2){ console.log('FAILED '+fails); process.exit(1); }
  fresh(th,10,'library',{}); G.stage='law'; meet(B); R(B,12,0,0);
  check('4. 不是週四不演',(()=>{ const g=G.day; G.day=fr; G.weekday=5; const r=EVENTS.check(e1,{trigger:'interact',npc:B}); G.day=g; G.weekday=4; return !r; })());
  check('2. 暑假週四、ACQUAINTANCE：會演',EVENTS.check(e1,{trigger:'interact',npc:B}));
  picks=['一起讀']; await EVENTS.run(e1); let L=lines();
  check('2. 台詞照 AA_241 第 5 節；「一起讀？」→ 計時器那句、BOHAN_SUMMER_THU',L[0]==='（總圖三樓，柏翰坐在靠窗的位子。桌上放著客運的票根。）'&&L.some(t=>t.endsWith('新竹到這裡，一小時二十分。單程。'))&&L.some(t=>t.endsWith('好。我的計時器五十分鐘響一次，你不要嚇到。'))&&G.flags.BOHAN_SUMMER_THU===true,JSON.stringify(L));
  check('2. 只演一次',!EVENTS.check(e1,{trigger:'interact',npc:B}));
  check('3. 同一天不招呼',!EVENTS.check(e2,{trigger:'interact',npc:B}));
  G.day=th2; G.weekday=4; said=[];
  check('3. 下一個週四：短招呼',EVENTS.check(e2,{trigger:'interact',npc:B}));
  await EVENTS.run(e2); check('3. 「（他抬頭點了一下，指了指旁邊的位子。）」',lines()[0]==='（他抬頭點了一下，指了指旁邊的位子。）',JSON.stringify(lines()));
  check('3. 同一週不再招呼',!EVENTS.check(e2,{trigger:'interact',npc:B}));
  // 另一個選項
  fresh(th,10,'library',{}); G.stage='law'; meet(B); R(B,12,0,0); picks=['每週都來']; await EVENTS.run(e1);
  check('2. 「每週都來？」→「每週四。九點到五點。」、沒有記號',lines().some(t=>t.endsWith('每週四。九點到五點。'))&&!G.flags.BOHAN_SUMMER_THU);
  fresh(th,10,'library',{}); G.stage='law'; R(B,0,0,0);
  check('4. 還不認識不演',!EVENTS.check(e1,{trigger:'interact',npc:B}));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

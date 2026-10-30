// BB_163：沛珊（大二下重考、大三起在別的學校）、子晴（大四在工作室）人在臺北、不在台大（presence kind taipei）——不需要瀏覽器。
// 檢查（BB_163 第 3 節的測試）：作息換成她們那一份（子晴平日工作、晚上 Café）；邀約不先擋、照各地點接受／改時間／婉拒＋句子；芷若、學姊照舊約不到；手機「約」照常。
// 2026-10-21（PS-TAINAN-AA282）：沛珊大三起的臺北作息（BB_163 1-2：溫州街課輔班、公館書店、美術館）作廢——AA_282 第 1 節她放榜以後在台南、不回臺北（kind city）；第 3～5 項改成檢查新的規則。用法：node tests/bb163_taipei_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const PS='classmate_peishan', ZQ='heroine_04';
  const at=(day,hour)=>{ G.day=day; G.hour=hour; G.weekday=wdOf(day); };
  const ent=(id)=>STORY.schedEnt(CHARACTERS[id],G);
  const ask=(id,pid,day,hh)=>INV.personal(G,id,INV.place(pid),day,hh,INV.decide(G,id,pid,day,hh));
  const L=r=>(r.lines||[]).join('｜');
  const Y2S2SAT=termDay('Y2S2',5,6), Y2S2SUN=termDay('Y2S2',5,7), Y2S2TUE=termDay('Y2S2',5,2), Y3TUE=termDay('Y3S1',5,2), Y3SAT=termDay('Y3S1',5,6), Y3SUN=termDay('Y3S1',5,7), Y4TUE=termDay('Y4S1',7,2),   /* AA_509 0-2 第 6 點：子晴國定假日休——第 5 週週二是 2028 中秋（10/3），改第 7 週週二 */ Y4SAT=termDay('Y4S1',5,6);
  const setup=(day,hour,flags)=>{ fresh(day,hour,'campus',flags||{}); for(const id of [PS,ZQ,'heroine_02','heroine_05']){ R(id,...LV.CLO); meet(id); G.contacts[id]=1; } };
  // 1～3. 大二下＝沛珊的重考消失期（BB_205 第 3 節 64aaaa82：2026-12-18～2027-08-06 聯絡不到；BB_163 1-1 的大二下作息、句子不再用）
  setup(Y2S2SAT,9); at(Y2S2SAT,10); let e=ent(PS), r=ask(PS,'library',Y2S2SAT,10);
  check('1. 大二下週六：沛珊不在總圖、約不到（聯絡不到）',!e&&r.res==='decline'&&r.why==='away',JSON.stringify([e,r]));
  check('1. 手機「約」：不能約、「沛珊沒有回覆。」',!INV.canInvite(G,PS)&&/沒有回覆/.test(INV.whyNot(G,PS)),INV.whyNot(G,PS));
  setup(Y2S2SUN,9,{dating_classmate_peishan:true}); at(Y2S2SUN,14.5); e=ent(PS);
  check('3. 交往中也一樣：週日下午不在小公園',!e);
  setup(D('2027-08-07'),9); at(D('2027-08-07'),10); check('3. 8/7 放榜以後：暑假還在台中老家（AA_276 第 1 節，使用者 23:4x：寒暑假沛珊回台中）',STORY.presence(PS,G).kind==='home');
  setup(D('2027-09-08'),9); at(D('2027-09-08'),10); check('3. 開學以後（9/8）：在台南（AA_282 第 1 節，kind city；不是「在臺北、不在台大」）',STORY.presence(PS,G).kind==='city'&&STORY.presence(PS,G).city==='台南');
  // 4. 大三：沒有溫州街課輔班、書店的作息；約臺北的地點一律「在台南，不在臺北」（AA_282 第 1、6 節：她不來臺北）
  const K={PS_BACK_FIRST:D('2027-08-12')};   /* 放榜後重新聯絡上（AA_282 第 2 節） */
  setup(Y3TUE,9,K); at(Y3TUE,17); e=ent(PS); const r4=ask(PS,'wenzhou',Y3TUE,17), r4b=ask(PS,'library',Y3TUE,14), r4c=ask(PS,'cafe',Y3TUE,17), r4d=ask(PS,'cafe',Y3TUE,13);
  { const w=STORY.whereIs({G,E:{}},PS); check('4. 大三週二 17:00：不在溫州街（課輔班）、不會照作息生出來（reachable false）；人物線索「在台南」',!STORY.reachable(PS,G)&&!!w&&w.zone==null&&w.away==='在台南',JSON.stringify([e&&e.zone,w])); }
  check('4. 約溫州街、總圖、Café：都不行（away）、「郭沛珊在台南，不在臺北。」',[r4,r4b,r4c,r4d].every(x=>x.res==='decline'&&x.why==='away')&&INV.reply(G,PS,'cafe',r4c)==='郭沛珊在台南，不在臺北。',JSON.stringify([r4,r4b,r4c,r4d].map(x=>x.res+(x.why||''))));
  setup(Y3SAT,9,K); at(Y3SAT,15); const r4e=ask(PS,'cafe',Y3SAT,15), w4=STORY.whereIs({G,E:{}},PS);
  check('4. 大三週六 15:00：不在公館的書店（她在台南學校附近的二手書店打工，AA_282 第 1 節，不排作息）',!STORY.reachable(PS,G)&&r4e.res==='decline'&&!!w4&&w4.zone==null&&w4.away==='在台南',JSON.stringify([r4e,w4]));
  const r4f=ask(PS,'noodle',Y3SAT,19); check('4. 大三起約麵店：也不行',r4f.res==='decline'&&r4f.why==='away',JSON.stringify(r4f));
  // 5. 大三起週日 10:00：沒有美術館（D06 偶遇拿掉，AA_282 第 5 節第 1 點）
  setup(Y3SUN,9,Object.assign({WISH_DONE_classmate_peishan:true},K)); at(Y3SUN,10); e=ent(PS);
  check('5. 大三起週日 10:00：沒有美術館（D06）的作息',!e||e.enc!=='D06',JSON.stringify(e));
  // 6. 子晴大四
  setup(Y4TUE,9); at(Y4TUE,18); e=ent(ZQ); const z1=ask(ZQ,'cafe',Y4TUE,18), z2=ask(ZQ,'library',Y4TUE,14); at(Y4TUE,21); const e2b=ent(ZQ);
  check('6. 子晴大四平日 18:00：在工作室；約 Café 改到 20:10「我八點才下班。……八點十分，兩點半。」；21:00 在 Café',e&&e.away==='在工作室上班'&&z1.res==='resched'&&Math.abs(z1.alt.h-(20+10/60))<1e-6&&L(z1)==='「我八點才下班。……八點十分，兩點半。」'&&e2b&&e2b.zone==='cafe',JSON.stringify([e,z1,e2b&&e2b.zone]));
  check('6. 約總圖：婉拒「我畢業了啦。總圖要辦校友證，我還沒辦。……兩點半？」',z2.res==='decline'&&L(z2)==='「我畢業了啦。總圖要辦校友證，我還沒辦。……兩點半？」',JSON.stringify(z2));
  { const wed=termDay('Y4S1',5,3); setup(wed,9); at(wed,10); const t1=ask(ZQ,'teahouse',wed,14);
    check('6. 平日（週三）下午約一盞：改到最近的週六下午「平日下午我在工作室。……週六下午可以嗎？」（BB-B 55509fe2）',t1.res==='resched'&&t1.alt&&wdOf(t1.alt.day)===6&&t1.alt.h>=14&&L(t1)==='「平日下午我在工作室。……週六下午可以嗎？」',JSON.stringify(t1)); }
  setup(Y4SAT,14); at(Y4SAT,14); const z3=ask(ZQ,'cafe',Y4SAT,16);
  check('6. 週末下午約 Café：接受',z3.res==='accept'||z3.res==='here',JSON.stringify(z3));
  // 7. 芷若大三上、學姊大三下照舊約不到
  setup(termDay('Y3S1',5,2),9); const a7=INV.decide(G,'heroine_02','cafe',termDay('Y3S1',5,2),19); setup(termDay('Y4S1',5,2),9); const b7=INV.decide(G,'heroine_05','cafe',termDay('Y4S1',5,2),19);
  check('7. 芷若大三上、學姊大四上（美國 2028-08-02～12-23，AA_260）：照舊「這學期不在學校」（國外）',a7.why==='away'&&b7.why==='away'&&!INV.canInvite(G,'heroine_05'));
  // 8. 大二上（還在台大）照原本的作息
  const y2s1=termDay('Y2S1',5,3); setup(y2s1,19.5); e=ent(PS); check('8. 大二上（休學前）照原本的作息（週三法服讀書會）',CALENDAR.termOf(y2s1).id==='Y2S1'&&(!e||e.taipei!==true),JSON.stringify(e));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

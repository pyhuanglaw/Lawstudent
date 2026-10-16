// BB_163：沛珊（大二下重考、大三起在別的學校）、子晴（大四在工作室）人在臺北、不在台大（presence kind taipei）——不需要瀏覽器。
// 檢查（BB_163 第 3 節的測試）：作息換成她們那一份（總圖週末、小公園週日一小時、課輔班、書店、美術館；子晴平日工作、晚上 Café）；邀約不先擋、照各地點接受／改時間／婉拒＋句子；芷若、學姊照舊約不到；手機「約」照常。用法：node tests/bb163_taipei_unit.js
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
  const Y2S2SAT=termDay('Y2S2',5,6), Y2S2SUN=termDay('Y2S2',5,7), Y2S2TUE=termDay('Y2S2',5,2), Y3TUE=termDay('Y3S1',5,2), Y3SAT=termDay('Y3S1',5,6), Y3SUN=termDay('Y3S1',5,7), Y4TUE=termDay('Y4S1',5,2), Y4SAT=termDay('Y4S1',5,6);
  const setup=(day,hour,flags)=>{ fresh(day,hour,'campus',flags||{}); for(const id of [PS,ZQ,'heroine_02','heroine_05']){ R(id,...LV.CLO); meet(id); G.contacts[id]=1; } };
  // 1. 大二下週六約沛珊去總圖：接受
  setup(Y2S2SAT,9); at(Y2S2SAT,10); let e=ent(PS), r=ask(PS,'library',Y2S2SAT,10);
  check('1. 大二下週六 10:00：沛珊在總圖（作息），約總圖＝接受「好。我在老位子。……你坐著就好，不用說話。」',e&&e.zone==='library'&&r.res==='accept'&&L(r)==='「好。我在老位子。……你坐著就好，不用說話。」',JSON.stringify([e&&e.zone,r]));
  check('1. 手機「約」照常：可以約、沒有「這學期不在學校」',INV.canInvite(G,PS)&&INV.whyNot(G,PS)==='',INV.whyNot(G,PS));
  // 2. 大二下平日：總圖改到週末；Café、麵店、散步婉拒
  setup(Y2S2TUE,9); at(Y2S2TUE,10);
  const rl=ask(PS,'library',Y2S2TUE,14), rc=ask(PS,'cafe',Y2S2TUE,14), rn=ask(PS,'noodle',Y2S2TUE,12+10/60), rw=ask(PS,'wenzhou',Y2S2TUE,15);
  check('2. 大二下平日約總圖：改到週末「平日我在家念，比較不會分心。……週末，總圖。」',rl.res==='resched'&&L(rl)==='「平日我在家念，比較不會分心。……週末，總圖。」'&&rl.alt&&wdOf(rl.alt.day)===6,JSON.stringify(rl));
  check('2. Café／麵店／散步：婉拒，句子照 BB_163 1-1',rc.res==='decline'&&L(rc)==='「Café 我會想跟你聊天。……現在不行。週末來總圖，坐我旁邊。」'&&rn.res==='decline'&&L(rn)==='「阿鳳阿姨的麵，考完我要吃兩碗。……現在我吃便當，十分鐘。」'&&rw.res==='decline'&&L(rw)==='「散步會讓我想很多事。現在不能想太多。……考完，我們走遠一點。」',JSON.stringify([rc,rn,rw].map(L)));
  e=ent(PS); const w=STORY.whereIs(GM,PS);
  check('2. 大二下平日上午：不在世界上（不跟課表進教室）；手機上寫「在家念書（重考）」',!e&&w&&w.away==='在家念書（重考）',JSON.stringify([e,w]));
  // 3. 交往中：週日 14:00 在小公園、不在總圖
  setup(Y2S2SUN,9,{dating_classmate_peishan:true}); at(Y2S2SUN,14.5); e=ent(PS); const rh=ask(PS,'wenzhou',Y2S2SUN,14);
  setup(Y2S2SUN,9,{}); at(Y2S2SUN,14.5); const e2=ent(PS);
  check('3. 大二下交往中：週日 14:00～15:00 在溫州街小公園、不在總圖；約散步＝「星期日下午本來就是你的。……不用約。」；沒交往＝在總圖',e&&e.zone==='wenzhou'&&rh.res==='here'&&L(rh)==='「星期日下午本來就是你的。……不用約。」'&&e2&&e2.zone==='library',JSON.stringify([e&&e.zone,rh,e2&&e2.zone]));
  // 4. 大三：課輔班、書店、總圖
  setup(Y3TUE,9); at(Y3TUE,17); e=ent(PS); const r4=ask(PS,'wenzhou',Y3TUE,17), r4b=ask(PS,'library',Y3TUE,14), r4c=ask(PS,'cafe',Y3TUE,17), r4d=ask(PS,'cafe',Y3TUE,13);
  check('4. 大三週二 17:00：沛珊在溫州街（課輔班）；約散步改到 19:00「課輔班下課，剛好在溫州街。……七點，門口等我。」',e&&e.zone==='wenzhou'&&r4.res==='resched'&&r4.alt&&Math.abs(r4.alt.h-19)<1e-6&&r4.alt.day===Y3TUE&&L(r4)==='「課輔班下課，剛好在溫州街。……七點，門口等我。」',JSON.stringify([e&&e.zone,r4]));
  check('4. 約總圖：婉拒「我現在進不去總圖了。……Café 好不好？我帶作業去改。」；課輔班時間約 Café 改到 19:30；有空的時候 Café 接受',r4b.res==='decline'&&L(r4b)==='「我現在進不去總圖了。……Café 好不好？我帶作業去改。」'&&r4c.res==='resched'&&Math.abs(r4c.alt.h-19.5)<1e-6&&L(r4c)==='「七點下課。……七點半，我走過去。」'&&r4d.res==='accept'&&L(r4d)==='「好。我帶作業去改，你念你的。」',JSON.stringify([r4b,r4c,r4d].map(x=>x.res+L(x))));
  setup(Y3SAT,9); at(Y3SAT,15); e=ent(PS); const r4e=ask(PS,'cafe',Y3SAT,15);
  check('4. 大三週六 15:00：沛珊在公館的書店（打工）；約 Café 改到 18:10「書店六點打烊。……六點十分，兩點半。」',e&&e.zone==='bookstore'&&r4e.res==='resched'&&Math.abs(r4e.alt.h-(18+10/60))<1e-6&&L(r4e)==='「書店六點打烊。……六點十分，兩點半。」',JSON.stringify([e&&e.zone,r4e]));
  const r4f=ask(PS,'noodle',Y3SAT,19); check('4. 大三起第一次約麵店：「好。阿鳳阿姨一定會問我現在念什麼。……我要講很久。」',r4f.res==='accept'&&L(r4f)==='「好。阿鳳阿姨一定會問我現在念什麼。……我要講很久。」',JSON.stringify(r4f));
  // 5. 大三起週日 10:00 美術館照舊
  setup(Y3SUN,9,{WISH_DONE_classmate_peishan:true}); at(Y3SUN,10); e=ent(PS);
  check('5. 大三起週日 10:00：美術館（D06 偶遇）照舊',e&&e.enc==='D06'&&e.away==='在美術館',JSON.stringify(e));
  // 6. 子晴大四
  setup(Y4TUE,9); at(Y4TUE,18); e=ent(ZQ); const z1=ask(ZQ,'cafe',Y4TUE,18), z2=ask(ZQ,'library',Y4TUE,14); at(Y4TUE,21); const e2b=ent(ZQ);
  check('6. 子晴大四平日 18:00：在工作室；約 Café 改到 20:10「欸不是，我八點才下班。……八點十分，兩點半。」；21:00 在 Café',e&&e.away==='在工作室上班'&&z1.res==='resched'&&Math.abs(z1.alt.h-(20+10/60))<1e-6&&L(z1)==='「欸不是，我八點才下班。……八點十分，兩點半。」'&&e2b&&e2b.zone==='cafe',JSON.stringify([e,z1,e2b&&e2b.zone]));
  check('6. 約總圖：婉拒「欸不是，我畢業了。總圖要辦校友證，我還沒辦。……兩點半？」',z2.res==='decline'&&L(z2)==='「欸不是，我畢業了。總圖要辦校友證，我還沒辦。……兩點半？」',JSON.stringify(z2));
  setup(Y4SAT,14); at(Y4SAT,14); const z3=ask(ZQ,'cafe',Y4SAT,16);
  check('6. 週末下午約 Café：接受',z3.res==='accept'||z3.res==='here',JSON.stringify(z3));
  // 7. 芷若大三上、學姊大三下照舊約不到
  setup(termDay('Y3S1',5,2),9); const a7=INV.decide(G,'heroine_02','cafe',termDay('Y3S1',5,2),19); setup(termDay('Y3S2',5,2),9); const b7=INV.decide(G,'heroine_05','cafe',termDay('Y3S2',5,2),19);
  check('7. 芷若大三上、學姊大三下：照舊「這學期不在學校」（國外）',a7.why==='away'&&b7.why==='away'&&!INV.canInvite(G,'heroine_05'));
  // 8. 大二上（還在台大）照原本的作息
  const y2s1=termDay('Y2S1',5,3); setup(y2s1,19.5); e=ent(PS); check('8. 大二上（休學前）照原本的作息（週三法服讀書會）',CALENDAR.termOf(y2s1).id==='Y2S1'&&(!e||e.taipei!==true),JSON.stringify(e));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

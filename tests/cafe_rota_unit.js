// 兩點半 Café 牆上的班表（BB_159 0b917af4；ART-WZ4）：互動點在吧檯前、四版照芷若的時間線（A 預設／B Z9 之後到大三上／C 大三下／D 大四以後）、可以看很多次——不需要瀏覽器。
// 修改前沒有「看班表」（全部失敗）。用法：node tests/cafe_rota_unit.js
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
(async()=>{
  const zsrc=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
  check('0. Café 有「看班表」的互動點（吧檯前 0.7,-3.7）',/\{x:0\.7,z:-3\.7,radius:0\.9,label:'看班表',cafeRota:true\}/.test(zsrc));
  if(!STORY.cafeRota){ console.log('FAILED '+(fails+1)); process.exit(1); }
  const look=async day=>{ fresh(day,15,'cafe'); G.stage=day<1?'econ':'law'; said=[]; await STORY.interact({cafeRota:true},GM); return said.map(s=>s.t); };
  const A=['（牆上的班表。夾板上一張紙，鉛筆寫的。）','（週一到週五晚上，每一格都是同一個名字：芷若。週一、三、五的中午也是。）','（週末那幾格是阿文、小婷。最下面一行：老闆——隨時。）'];
  let L=await look(termDay('Y1S1',3,6)); check('1. 大一上：A 版三句（逐字）',JSON.stringify(L)===JSON.stringify(A),JSON.stringify(L));
  L=await look(termDay('Y0S1',4,2)); check('1. 經濟系那一年：A 版',JSON.stringify(L)===JSON.stringify(A));
  const z9=termDay('Y2S2',15,4); L=await look(z9); check('1. 大二下第 15 週週四 15:00（Z9 那晚以前，AA_243 #62）：A 版',JSON.stringify(L)===JSON.stringify(A));
  fresh(z9,22.5,'cafe'); G.stage='law'; said=[]; await STORY.interact({cafeRota:true},GM); L=said.map(s=>s.t);
  check('2. Z9 那晚 22:30 以後：B 版',L[0]==='（牆上的班表。晚上那幾格，換成了小婷的名字。）'&&L[1]==='（最上面那一行還是「芷若」，格子是空的。旁邊多了一行小字：英國，一學期。）',JSON.stringify(L));
  L=await look(termDay('Y3S1',5,3)); check('2. 大三上：B 版',L[0]==='（牆上的班表。晚上那幾格，換成了小婷的名字。）');
  fresh(termDay('Y2S2',16,2),15,'cafe'); G.stage='law'; G.events.done.ev_zhiruo_last_shift=1; check('2. Z9 演過（ev_zhiruo_last_shift）：B 版',STORY.cafeRotaKey(G)==='B');
  L=await look(termDay('Y3S2',4,3)); check('3. 大三下：C 版',JSON.stringify(L)===JSON.stringify(['（牆上的班表。芷若的名字回到晚上的格子裡，只是比以前少。）','（空出來的那幾格，是小婷。）']),JSON.stringify(L));
  L=await look(termDay('Y4S1',2,3)); check('4. 大四上：D 版',JSON.stringify(L)===JSON.stringify(['（牆上的班表。最上面那一行還是「芷若」，後面的格子都是空的。）','（鉛筆寫的。沒有人擦。）']),JSON.stringify(L));
  L=await look(termDay('Y4S2',3,3)); check('4. 大四下：D 版',L[1]==='（鉛筆寫的。沒有人擦。）');
  fresh(termDay('Y4S2',3,3),15,'cafe'); G.stage='law'; const f0=JSON.stringify(G.flags), e0=JSON.stringify(G.events); let ok=true; for(let i=0;i<3;i++){ said=[]; await STORY.interact({cafeRota:true},GM); ok=ok&&said.length===2; } check('5. 可以看很多次、不記東西（旗標、事件不變）',ok&&JSON.stringify(G.flags)===f0&&JSON.stringify(G.events)===e0);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

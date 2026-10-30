// 校外約會：考試週不能排一日遊（BUG-DATE-EXAMWEEK-DAY-1021；企劃線 AA_126 1-1 第 41 行「考試週不能排過夜行程：一日遊和兩天一夜在考試週的日子不能選，行程表上直接標『考試週』」）。
// 半日、晚上照舊（只避開考試時段）。不需要瀏覽器。用法：node tests/date_examweek_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|DATE_LINES|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,400):'')); if(!ok) fails++; };
let opts=[], picks=[], toasts=[], G=null;
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},setBg(){}}; global.CHAR={setExpr(){}};
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},sceneBegin(){},sceneEnd(){},caption(){},sleep:()=>Promise.resolve(),autosave(){},titleCard:async()=>{},fade:()=>Promise.resolve(),advance(h){ G.hour+=h; },money(d){ G.money+=d; },toast(t){ toasts.push(t); },updateHUD(){},phoneBadge(){},
  say:async()=>{}, choose:async o=>{ const T=o.map(q=>q.t||q.text); opts.push(o); if(picks.length){ const w=picks[0]; const k=T.findIndex(x=>x.includes(w)); if(k>=0){ picks.shift(); return k; } const g=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(w))); if(g>=0) return g; /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層 */ } return 0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour)=>{ G={v:3,day,hour,zone:'dorm',weekday:wdOf(day),weather:'clear',energy:70,money:20000,flags:{KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,dating_heroine_03:true},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}}; SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); G.contacts.heroine_03=1; opts=[]; picks=[]; toasts=[]; };
const J=x=>JSON.stringify(x), T=d=>CALENDAR.termOf(d);
(async()=>{
  const w16=STORY.termDay('Y1S2',16,6), w15=STORY.termDay('Y1S2',15,6), w8=STORY.termDay('Y1S2',8,6);
  check('0. 日子：第 16 週六＝期末考週、第 8 週六＝期中考週、第 15 週六不是',!!T(w16).exam&&!!T(w8).exam&&!T(w15).exam,J([T(w16),T(w8),T(w15)]));
  fresh(w8-7,20); const C=o=>DATE.check(G,Object.assign({who:'heroine_03'},o));   /* 第 7 週六晚上：第 8、15、16 週都還沒到 */
  let c=C({locs:['D26'],day:w16,depart:9,transport:'hsr'}); check('1. 期末考週六：臺中一日遊不能選，寫「考試週」',!c.ok&&c.why==='考試週'&&c.plan&&c.plan.kind==='day',J({why:c.why,kind:c.plan&&c.plan.kind}));
  c=C({locs:['D24'],day:w8,depart:9,transport:'coach'}); check('1. 期中考週六：礁溪一日遊也不能選',!c.ok&&c.why==='考試週',c.why);
  c=C({locs:['D26'],day:w15,depart:9,transport:'hsr'}); check('1. 對照：第 15 週六的臺中一日遊可以',c.ok,c.why);
  c=C({locs:['D13'],day:w16,depart:15,transport:'mrt'}); check('2. 半日（淡水）不在這條規則裡：考試週六照樣可以（沒有撞到考試時段）',c.ok,c.why);
  c=C({locs:['D03'],day:w16,depart:18,transport:'mrt'}); check('2. 晚上（參創）也照舊可以',c.ok&&c.plan.kind==='evening',J({why:c.why,kind:c.plan&&c.plan.kind}));
  c=C({locs:['D26'],day:w16,depart:9,transport:'hsr',kind:'overnight'}); check('3. 兩天一夜照舊不能選（同一條規則）',!c.ok&&c.why==='考試週',c.why);
  // 選單：考試週那天的一日遊出發時間灰掉、小字寫考試週；選了只提示、約不成
  fresh(w16-6,7); picks=[DATE.loc('D26').name,'高鐵',DATE.dayLabel(G,w16).split('（')[0].trim(),'09:00','算了'];
  await DATE.menu(GM,'heroine_03',null); const tOpts=opts.find(o=>o.some(x=>/^09:00 出發/.test(x.t||'')))||[]; const o9=tOpts.find(x=>/^09:00 出發/.test(x.t||''));
  check('4. 選單：考試週六的「09:00 出發」灰掉、小字「考試週」；選了只提示、約不成',!!o9&&o9.dim===true&&o9.hint==='考試週'&&toasts.includes('考試週')&&!(G.trips||[]).length,J({o9,toasts}));
  console.log(fails?'\nFAILED '+fails:'\nALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

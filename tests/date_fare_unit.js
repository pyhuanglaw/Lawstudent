// 校外約會的車資（BUG-DATE-FARE-DOUBLE-1021）：地點資料的交通費已經是來回（AA_128 第 70 行「交通費：祐廷自己的來回交通」、date_locations.json _codes.fare「祐廷自己的來回交通費」），
// 預約、扣錢都照表，不再乘 2；一日、兩天一夜、D31＋D32 同一趟。舊存檔：還沒扣的照表、已經扣過的不退。不需要瀏覽器。用法：node tests/date_fare_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|DATE_LINES|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,500):'')); if(!ok) fails++; };
let said=[], opts=[], picks=[], G=null;
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){},setBg(){}}; global.CHAR={setExpr(){}};
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  money(d){ G.money+=d; }, toast(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ const T=o.map(q=>q.t||q.text); T.all=[].concat(...o.map(q=>q.sub||[q.t||q.text])); opts.push(T); if(picks.length){ const w=picks[0]; if(typeof w==='number'){ picks.shift(); return w; } const k=T.findIndex(x=>x.includes(w)); if(k>=0){ picks.shift(); return k; } const g=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(w))); if(g>=0){ if(o[g].dim) picks.shift(); return g; } /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層（那一類整個灰掉＝和原本選到灰掉的那一項一樣，用掉這個 pick）*/ } return 0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,flags)=>{ G={v:3,day,hour,zone:'dorm',weekday:wdOf(day),weather:'clear',energy:70,money:20000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; if(STORY._fy) STORY._fy.reset(); };
const S6={fam:60,trust:45,comf:40,npcRom:55,rom:30}, J=x=>JSON.stringify(x);
const fare=(loc,mode)=>((DATE_DATA.locations[loc].transport||[]).find(x=>x.mode===mode)||{}).fare;   /* 照資料：祐廷自己的來回交通費 */
const LODGE=DATE_DATA.lodging;
(async()=>{
  const sat=STORY.termDay('Y1S2',5,6);
  check('0. 資料寫的是來回：date_locations.js codes.fare「祐廷自己的來回交通費」、住宿 lodging 2500',/來回/.test((DATE_DATA.codes||{}).fare||'')&&LODGE===2500,(DATE_DATA.codes||{}).fare);
  // ===== 1. 預約時的車資、預計花費 =====
  fresh(sat-1,20,{}); Object.assign(SOCIAL.rel('heroine_03'),S6);
  const C=(o)=>DATE.check(G,Object.assign({who:'heroine_03',day:sat},o));
  const cases=[
    ['D13 淡水 捷運 半日',{locs:['D13'],depart:15,transport:'mrt'},fare('D13','mrt'),fare('D13','mrt')],
    ['D24 礁溪 開車 一日',{locs:['D24'],depart:9,transport:'car'},fare('D24','car'),fare('D24','car')],
    ['D26 臺中 高鐵 一日',{locs:['D26'],depart:9,transport:'hsr'},fare('D26','hsr'),fare('D26','hsr')],
    ['D26 臺中 高鐵 兩天一夜',{locs:['D26'],depart:9,transport:'hsr',kind:'overnight'},fare('D26','hsr'),fare('D26','hsr')+LODGE],
    ['D28 臺南 高鐵 兩天一夜（臺南只有兩天一夜）',{locs:['D28'],depart:9,transport:'hsr',kind:'overnight'},fare('D28','hsr'),fare('D28','hsr')+LODGE],
    ['D31＋D32 開車 兩天一夜（去日月潭、從清境回來＝各一半）',{locs:['D31','D32'],depart:9,transport:'car',kind:'overnight'},(fare('D31','car')+fare('D32','car'))/2,(fare('D31','car')+fare('D32','car'))/2+LODGE]];
  for(const [name,o,f,cost] of cases){ const c=C(o); check('1. '+name+'：車資 '+f+'、預計花費 '+cost,c.ok&&c.plan.fare===f&&c.cost===cost,J({ok:c.ok,why:c.why,fare:c.plan&&c.plan.fare,cost:c.cost})); }
  check('1. 數字：臺南高鐵兩天一夜 2800＋2500＝5300、臺中高鐵一日 1600、D31＋D32 (1000＋1200)÷2＋2500＝3600',C(cases[4][1]).cost===5300&&C(cases[2][1]).cost===1600&&C(cases[5][1]).cost===3600);
  // ===== 2. 走完一趟實際扣的錢（OUT.go 回程扣車資）=====
  const go=async(o,pk)=>{ const b=DATE.book(G,Object.assign({who:'heroine_03',day:sat},o)); const q=OUT.get(G,'date_'+b.trip); G.day=sat; G.weekday=wdOf(sat); G.hour=o.depart; said=[]; picks=['出發'].concat(pk); const m0=G.money; await OUT.prompt(GM,q); return {t:DATE.trip(G,b.trip),spent:m0-G.money,L:said.map(s=>s.t)}; };
  fresh(sat-1,20,{}); Object.assign(SOCIAL.rel('heroine_03'),S6); let r=await go({locs:['D13'],depart:15,transport:'mrt'},['飲料攤','差不多了']);
  check('2. 淡水半日（飲料 60）：扣 100＋60＝160，結算寫「花了 160 元（含來回車資）」',r.t.status==='done'&&r.spent===fare('D13','mrt')+60&&r.L.some(x=>/花了 160 元（含來回車資）/.test(x)),J({spent:r.spent,L:r.L.slice(-1)}));
  fresh(sat-1,20,{}); Object.assign(SOCIAL.rel('heroine_03'),S6); r=await go({locs:['D26'],depart:9,transport:'hsr'},['草悟道','國立臺灣美術館','差不多了']);
  check('2. 臺中高鐵一日（兩個點都 0 元）：扣 1600',r.t.status==='done'&&r.spent===fare('D26','hsr'),r.spent);
  fresh(sat-1,20,{}); Object.assign(SOCIAL.rel('heroine_03'),S6); r=await go({locs:['D28'],depart:9,transport:'hsr',kind:'overnight'},['文學館的大廳','安平的老巷','館前的圓環綠地','海堤的夕陽']);
  check('2. 臺南高鐵兩天一夜（老巷 60）：扣 2800＋2500＋60＝5360，結算寫「花了 5360 元（含來回車資、住宿）」',r.t.status==='done'&&r.spent===fare('D28','hsr')+LODGE+60&&r.L.some(x=>/花了 5360 元（含來回車資、住宿）/.test(x)),J({spent:r.spent,L:r.L.slice(-1)}));
  fresh(sat-1,20,{}); Object.assign(SOCIAL.rel('heroine_03'),S6); r=await go({locs:['D31','D32'],depart:9,transport:'car',kind:'overnight'},['湖邊步道','湖邊的茶葉蛋攤','高山步道','山上的小攤']);
  check('2. D31＋D32 開車（茶葉蛋 10、山上小攤 60）：扣 1100＋2500＋70＝3670',r.t.status==='done'&&r.spent===1100+LODGE+70,r.spent);
  // ===== 3. 預約畫面的交通選項寫「來回」=====
  { let hints=[]; const ch=GM.choose; GM.choose=async o=>{ if(o.some(q=>/^高鐵/.test(q.t||''))) hints=o.map(q=>q.hint); return ch(o); }; fresh(sat-1,20,{dating_heroine_03:true}); G.contacts.heroine_03=1; picks=['兩天一夜…',DATE.loc('D28').name,'高鐵','算了']; await DATE.menu(GM,'heroine_03',null); GM.choose=ch;
    check('3. 小字照表：高鐵「單程約 135 分、來回 2800 元」',hints.some(h=>h==='單程約 135 分、來回 2800 元'),J(hints)); }
  // ===== 4. 舊存檔：還沒扣的照表；已經扣過的不退 =====
  fresh(sat-1,20,{}); G.trips=[{trip:'T0001',who:'heroine_03',locs:['D13'],day:sat,depart:15,back:19.3,kind:'half',transport:'mrt',fare:200,by:'player',status:'booked',spots:[],departed:false,moves:0},
    {trip:'T0002',who:'heroine_03',locs:['D28'],day:sat+7,depart:9,back:21.25,kind:'overnight',nights:1,lodging:2500,leave:19,transport:'hsr',fare:5600,by:'player',status:'going',spots:[],departed:true,moves:0},
    {trip:'T0003',who:'heroine_03',locs:['D01'],day:sat-20,depart:13,back:17,kind:'half',transport:'mrt',fare:120,by:'player',status:'done',spots:['D01.expo'],departed:true,moves:0,counted:true}];
  const m0=G.money; DATE.rec(G); DATE.rec(G);
  check('4. 舊存檔：約好了、在路上的兩趟改成照表（200→100、5600→2800），走完的那一趟紀錄不改、錢不退；讀兩次結果一樣',G.trips[0].fare===100&&G.trips[1].fare===2800&&G.trips[2].fare===120&&G.money===m0&&G.trips.every(t=>t.fareV===2),J(G.trips.map(t=>[t.trip,t.status,t.fare,t.fareV])));
  fresh(sat-1,20,{}); Object.assign(SOCIAL.rel('heroine_03'),S6); const nb=DATE.book(G,{who:'heroine_03',locs:['D13'],day:sat,depart:15,transport:'mrt'}); DATE.rec(G);
  check('4. 新約的行程有 fareV 2，讀檔不會再減半',nb.fare===100&&DATE.trip(G,nb.trip).fare===100&&DATE.trip(G,nb.trip).fareV===2,J(DATE.trip(G,nb.trip)));
  console.log(fails?'\nFAILED '+fails:'\nALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

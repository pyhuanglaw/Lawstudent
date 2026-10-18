// 交換路線核心（SYS-10；AA_158）——不需要瀏覽器。檢查：路線值、在國外（出發日 ≦ 今天 ＜ 返台日）、退宿、國外週次、時差（日本 +1、美國 −13／3/12 起 −12）、舊存檔第 12 週起補 TW、以安 1/8～7/15 與學姊 1/5 起用日期算不在。用法：node tests/sys10_route_unit.js
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
  const D=k=>STORY.dayOfKey(k);
  const g=(day,flags)=>{ fresh(day,10,'campus',flags||{}); return G; };
  check('0. 2027-11-15 是大三上第 11 週、11-22 第 12 週',CALENDAR.termOf(D('2027-11-15')).week===11&&CALENDAR.termOf(D('2027-11-22')).week===12);
  g(D('2028-01-10'),{}); check('1. 未決定：route null、不在國外',STORY.route(G)===null&&!STORY.abroad(G));
  for(const [r,dep,ret,out] of [['JP','2028-03-25','2028-08-05','2028-02-20'],['US','2028-08-02','2028-12-23','2028-07-25']]){   /* AA_260 第 4 節第 1 點（9d00435c）：使用者改期 */
    g(D(dep)-1,{EXCHANGE_ROUTE:r}); const a0=STORY.abroad(G), m0=STORY.movedOut(G);
    g(D(out),{EXCHANGE_ROUTE:r}); const m1=STORY.movedOut(G), a1=STORY.abroad(G);
    g(D(dep),{EXCHANGE_ROUTE:r}); const a2=STORY.abroad(G), w2=STORY.routeWeek(G);
    g(D(dep)+14,{EXCHANGE_ROUTE:r}); const w3=STORY.routeWeek(G);
    g(D(ret)-1,{EXCHANGE_ROUTE:r}); const a4=STORY.abroad(G); g(D(ret),{EXCHANGE_ROUTE:r}); const a5=STORY.abroad(G), m5=STORY.movedOut(G);
    check('2. '+r+'：出發前一天不在國外、已退宿（'+out+' 退宿）；'+dep+' 出發＝在國外、第 1 週；兩週後第 3 週；'+ret+' 返台當天不在國外',!a0&&m0&&m1&&!a1&&a2&&w2===1&&w3===3&&a4&&!a5&&!m5,JSON.stringify({a0,m0,m1,a1,a2,w2,w3,a4,a5,m5}));
  }
  g(D('2028-04-01'),{EXCHANGE_ROUTE:'JP'}); check('3. 時差：日本 +1',STORY.tzOffset(G)===1);
  g(D('2028-11-04'),{EXCHANGE_ROUTE:'US'}); const u1=STORY.tzOffset(G); g(D('2028-11-05'),{EXCHANGE_ROUTE:'US'}); const u2=STORY.tzOffset(G);
  check('3. 時差：美國（印第安納）11/4 夏令 −12、11/5 起冬令 −13',u1===-12&&u2===-13,u1+' '+u2);
  g(D('2028-03-12'),{EXCHANGE_ROUTE:'TW'}); check('3. 台灣路線沒有時差、不在國外',STORY.tzOffset(G)===0&&!STORY.abroad(G));
  g(D('2027-11-21'),{}); const b0=STORY.routeBackfill(G); g(D('2027-11-22'),{}); const b1=STORY.routeBackfill(G), v1=G.flags.EXCHANGE_ROUTE;
  g(D('2028-03-01'),{EXCHANGE_ROUTE:'US'}); const b2=STORY.routeBackfill(G);
  check('4. 舊存檔：第 11 週還不補；第 12 週起沒有路線補 TW；已選的不動',!b0&&b1&&v1==='TW'&&!b2&&G.flags.EXCHANGE_ROUTE==='US');
  g(D('2028-03-24'),{}); const an0=STORY.presence('heroine_01',G).here; g(D('2028-03-25'),{}); const an1=STORY.presence('heroine_01',G); g(D('2028-08-05'),{}); const an2=STORY.presence('heroine_01',G).here;
  check('5. 以安（所有玩家）：3/24 在、3/25～8/4 在日本、8/5 回來（AA_260）',an0&&!an1.here&&an1.away==='日本'&&an2,JSON.stringify(an1));
  g(D('2028-08-01'),{}); const s0=STORY.presence('heroine_05',G).here; g(D('2028-08-02'),{}); const s1=STORY.presence('heroine_05',G); g(D('2028-03-01'),{}); const s2=STORY.presence('heroine_05',G); g(D('2028-12-23'),{}); const s3=STORY.presence('heroine_05',G).here;
  check('5. 學姊（BB_206、AA_260）：8/1 在、8/2～12/22 在美國、大三下在臺灣、12/23 回來',s0&&!s1.here&&s1.away==='美國'&&s2.here&&s3,JSON.stringify([s1,s2]));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

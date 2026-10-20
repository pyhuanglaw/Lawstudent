// 1A-02 交換路線依交往狀態分流（AA_315；BB_204 第 1、5 節、AA_253 第 2 節；使用者 2026-10-17 經 BB-C）——不需要瀏覽器。
//   志願表截止 2027-11-18（四）12:00 那一刻照「交往中」定：學姊＝US、以安＝JP、都沒有（只和可昕交往也算）＝TW；之後任何事都不改；
//   宿舍的舊選單選過、還沒截止的清掉重來；截止以後已經有路線的照原本的；2028-02-20 以後補的一律 TW；經濟系那一年不定。
//   對 AA_315 的驗收情境 E1、E2、E3、E6、E7、E8。修改前 1～6 FAIL。用法：node tests/route_decide_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const dl=D('2027-11-18'), date=(id)=>{ G.flags['dating_'+id]=true; ROM.rec(G); };
  const at=(day,h,flags)=>{ fresh(day,h,'campus',flags||{}); G.stage='law'; if(typeof ROM!=='undefined') ROM.rec(G); return G; };
  check('0. 有 STORY.routeDecide、routeFor、routeMigrate', typeof STORY.routeDecide==='function'&&typeof STORY.routeFor==='function'&&typeof STORY.routeMigrate==='function');
  at(dl,11.9); date('heroine_05'); const r0=STORY.routeDecide(G); G.hour=12; const r1=STORY.routeDecide(G);
  check('1. E1 和學姊交往：11/18 11:54 還不定；12:00 定成 US（EXCH_APPLIED_DAY＝那天）', r0===null&&r1==='US'&&G.flags.EXCHANGE_ROUTE==='US'&&G.flags.EXCH_APPLIED_DAY===dl, JSON.stringify([r0,r1]));
  at(dl,12.5); date('heroine_01'); check('1. E2 和以安交往：JP', STORY.routeDecide(G)==='JP');
  at(dl,12.5); date('kexin'); check('1. E3 只和可昕交往：TW', STORY.routeDecide(G)==='TW');
  at(dl,12.5); date('kexin'); date('heroine_01'); check('1. 和可昕、以安同時交往：照以安（可昕不決定路線）＝JP', STORY.routeDecide(G)==='JP');
  at(dl,12.5); check('1. 沒有交往：TW（不要英國）', STORY.routeDecide(G)==='TW');
  at(dl,12.5); date('heroine_01'); STORY.routeDecide(G); ROM.end(G,'heroine_01','apart_talk'); G.day=D('2027-11-20'); STORY.routeDecide(G); G.day=D('2028-03-01'); STORY.routeDecide(G);
  check('2. E6 和以安交往、11/20 分手：路線還是 JP（定了以後不改）', G.flags.EXCHANGE_ROUTE==='JP'&&STORY.route(G)==='JP');
  at(D('2027-12-20'),15,{EXCHANGE_ROUTE:'TW',EXCH_APPLIED_DAY:dl,EXCH_RULE:1}); date('heroine_01'); STORY.routeMigrate(G); STORY.routeDecide(G);
  check('3. E7 大三上學期末才和以安在一起：路線照截止時的 TW', G.flags.EXCHANGE_ROUTE==='TW');
  at(D('2027-11-01'),15,{EXCHANGE_ROUTE:'US',EXCH_APPLIED_DAY:D('2027-10-20')}); const mg=STORY.routeMigrate(G);
  const cleared=!G.flags.EXCHANGE_ROUTE&&G.flags.EXCH_APPLIED_DAY==null; G.day=dl; G.hour=12; STORY.routeDecide(G);
  check('4. E8 舊存檔 11/1、舊選單選過「美國」、沒和學姊交往：讀檔清掉，11/18 中午定成 TW', mg&&cleared&&G.flags.EXCHANGE_ROUTE==='TW', JSON.stringify({mg,cleared,r:G.flags.EXCHANGE_ROUTE}));
  at(D('2027-12-01'),15,{EXCHANGE_ROUTE:'JP',EXCH_APPLIED_DAY:D('2027-10-20')}); STORY.routeMigrate(G);
  check('4. 截止以後已經有路線（舊選單）的照原本的，不改', G.flags.EXCHANGE_ROUTE==='JP');
  at(D('2027-12-01'),15); date('heroine_05'); check('5. 截止以後、還沒有路線的舊存檔：照同一個規則補（和學姊交往＝US）', STORY.routeBackfill(G)===true&&G.flags.EXCHANGE_ROUTE==='US');
  at(D('2028-02-20'),15); date('heroine_05'); STORY.routeDecide(G); check('5. 2028-02-20（日本路線退宿日）以後才補：一律 TW（來不及準備）', G.flags.EXCHANGE_ROUTE==='TW');
  at(dl,12.5); G.stage='econ'; check('5. 經濟系那一年：不定路線', STORY.routeDecide(G)===null&&!G.flags.EXCHANGE_ROUTE);
  { const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), x=fs.readFileSync(path.join(ROOT,'src/exchange3d.js'),'utf8');
    check('6. S.tick：每一格先 routeMigrate、沒有路線就 routeDecide', /S\.routeMigrate\(G\); if\(!F\.EXCHANGE_ROUTE&&G\.day>=0\) S\.routeDecide\(G\);/.test(s));
    check("6. 宿舍沒有「交換申請（志願表）」：exchange3d.js 沒有 APPLY_OPTS、不推 exchApply、applyOpen 永遠是 false", !/APPLY_OPTS/.test(x)&&!/exchApply:true/.test(x)&&/S\.applyOpen=\(\)=>false;/.test(x)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

// 載妹墊（AA_137 第 5 節；使用者 2026-10-16 更正：「一開始腳踏車就有載妹墊不用加裝 學姊也要給我載」）——不需要瀏覽器。
// 誰願意坐後座（STORY.rideInfo／rideMode）：開局就有、不用買；學姊熟悉以上坐後座（不再走在旁邊）；以安熟悉以前不坐（AA 的台詞）；可昕交往中才坐；阿凱、阿哲跨坐。
// 上車的動畫（走到左後方、轉身、坐上，約 1.5 秒）在 engine3d.js，要瀏覽器看（還沒拍）。修改前 STORY.rideInfo 不存在（第 1 項失敗）。
// 用法：node tests/bike_seat_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  check('1. STORY.rideInfo／rideMode 存在',typeof STORY.rideInfo==='function'&&typeof STORY.rideMode==='function');
  if(typeof STORY.rideInfo!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  const D0=termDay('Y1S1',4,3); fresh(D0,15,'campus',{introDone:true,classDone:true,afternoonDone:true});
  STORY.prepare&&0; GM.E.npcs=[];
  // rideMode 要 GM_ref：走一次 talkCharacter 以外的方式——populate 會設；這裡直接用 rideInfo（rideMode＝rideInfo(...).mode）
  const md=id=>STORY.rideInfo(G,id).mode;
  meet('heroine_05'); R('heroine_05',12); check('2. 學姊：還不熟（ACQUAINTANCE）＝不坐',md('heroine_05')==='refuse');
  R('heroine_05',30,10,10); const s5=STORY.rideInfo(G,'heroine_05'); check('2. 學姊：熟悉以上＝坐後座（使用者 10-16：學姊也要給我載；不再走在旁邊）',s5.mode==='ride'&&!s5.astride,JSON.stringify(s5));
  check('3. 開局就有載妹墊：沒有任何購買旗標也坐得了',!G.flags.bikeSeat&&md('heroine_05')==='ride');
  meet('heroine_01'); R('heroine_01',12); const a1=STORY.rideInfo(G,'heroine_01'); check('4. 以安熟悉以前：不坐，說 AA 的那一句',a1.mode==='refuse'&&/煞車/.test(a1.decline||''),JSON.stringify(a1));
  R('heroine_01',30,10,10); check('4. 以安熟悉以上：坐（上車那一句）',STORY.rideInfo(G,'heroine_01').mode==='ride'&&/煞車/.test(STORY.rideInfo(G,'heroine_01').on||''));
  check('5. 可昕：沒有交往＝不坐；交往中＝坐',md('kexin')==='refuse'&&(G.flags.dating_kexin=true,md('kexin')==='ride'));
  const k=STORY.rideInfo(G,'kai'); check('6. 阿凱：不看熟不熟、跨坐、說「這個墊子是給我的嗎」',k.mode==='ride'&&k.astride&&/墊子/.test(k.on||''),JSON.stringify(k));
  meet('heroine_02'); R('heroine_02',30,10,10); check('7. 芷若熟悉以上：坐、BB-B 的上下車台詞',STORY.rideInfo(G,'heroine_02').mode==='ride'&&!!STORY.rideInfo(G,'heroine_02').on&&!!STORY.rideInfo(G,'heroine_02').off);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

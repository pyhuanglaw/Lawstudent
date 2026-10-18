// 模擬法庭（V3-D16）——2026-10-17 使用者刪除：檢查停用（AA_252）。用法：node tests/v3_moot_unit.js
// 檢查：公告、模 1（2/25 201、自我介紹、學姊三件事）／沒到的私訊與群組；三次邀約＋模 5 邀約；moot_2～4 活動（研討室 B、週四 19:00）；模 2 三選一與機車行；模 3 三選一（第三種兩版）；模 4；模 5 準時／09:45 打電話、結辯三選一（故事版要機車行）、準備分與輸贏、筆記；模 6 輸贏兩版、沒去的照片；MOOT_TOGETHER。用法：node tests/v3_moot_unit.js
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
  /* 2026-10-17 使用者刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252 改成大四專題討論的法院旁聽）：這裡改成檢查「停用」——
     事件 retired、三場小組討論不開、系上公告／小組群組／邀約／模 6 出遊／可昕的訊息都不送；舊存檔的旗標留著、不再讀 */
  const ids=['ev_moot_1','ev_moot_2','ev_moot_3','ev_moot_4','ev_moot_5','ev_moot_6'];
  check('1. 模 1～6 事件留著但都停用（retired）',ids.every(id=>{ const e=STORY_EVENTS.find(x=>x.id===id); return e&&!!e.retired; }));
  const acts=['moot_2','moot_3','moot_4'].map(id=>ACTIVITIES.list.find(a=>a.id===id));
  check('2. 小組討論三場不開（skip）',acts.every(a=>a&&!ACTIVITIES.on(a,termDay('Y2S2',a.weeks[0],a.weekday))));
  check('3. STORY.MOOT_OFF',STORY.MOOT_OFF===true);
  fresh(STORY.dayOfKey('2027-02-23'),8,'dorm',{dating_kexin:true}); PHONE.join(G,'noodle_team','麵店團');
  for(let d=STORY.dayOfKey('2027-02-23');d<=STORY.dayOfKey('2027-05-02');d++){ G.day=d; G.weekday=wdOf(d); run(8,23.5,0.5); }
  PHONE.tick(G); const bad=(G.msgs||[]).filter(m=>/^moot_|^kx_moot/.test(String(m.tag||''))||/模擬法庭/.test(m.text||''));
  check('4. 大二下整學期：沒有模擬法庭的公告、群組、邀約、可昕的訊息',!bad.length&&!PHONE.inGroup(G,'moot_seller'),JSON.stringify(bad.slice(0,3).map(m=>m.text)));
  G.flags.MOOT_TOGETHER=false; STORY.mootTogetherCheck(G,'plg'); check('5. 準備分不再累積（mootTogetherCheck 不動）',!G.flags.MOOT_TOGETHER);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

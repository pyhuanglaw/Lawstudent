// SK04 便利貼（BB_106 SK04；AA_154 A52）：大一英文第 3～5 週第一張三選一、之後兩張、第 15 週揭曉（沒來延到第 16 週）、不回就不再出現——不需要瀏覽器。
// 修改前沒有 ev_sk04_*（全部失敗）。用法：node tests/v1_sk04_unit.js
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
  const ids=['ev_sk04_note1','ev_sk04_note2','ev_sk04_note3','ev_sk04_reveal']; check('0. SK04 四個事件在、beforeClass english_y1',ids.every(i=>ev(i)&&ev(i).beforeClass==='english_y1')); if(!ids.every(i=>ev(i))){ console.log('FAILED '+fails); process.exit(1); }
  const it={c:{id:'english_y1'}}, thu=w=>termDay('Y1S1',w,4);
  const cls=async(w,pick)=>{ G.day=thu(w); G.weekday=wdOf(G.day); G.hour=9.1; said=[]; picks=pick==null?[]:[pick]; await CLS.beforeClassEvent(GM,it); return said.map(x=>x.t); };
  fresh(thu(3),9.1,'gongtong'); G.stage='law';
  let L=await cls(3,'已報修'); check('1. 第 3 週：「桌角貼著一張便利貼。」→ 便利貼「這個位子的插座是壞的。」→「已報修。——法律系」',L[0]==='桌角貼著一張便利貼。'&&L[1]==='這個位子的插座是壞的。'&&G.flags.SK04_REPLY==='law',JSON.stringify(L));
  L=await cls(3); check('1. 同一週不再有',!L.length);
  L=await cls(4,'英文也是'); check('2. 第 4 週：「統計好難。」',L[0]==='統計好難。'&&G.flags.SK04_N===2,JSON.stringify(L));
  L=await cls(5,'什麼都要考'); check('2. 第 5 週：「你們法律系也要考英文？」',L[0]==='你們法律系也要考英文？'&&G.flags.SK04_N===3,JSON.stringify(L));
  L=await cls(6); check('2. 第 6～14 週沒有新的',!L.length);
  const s0=JSON.stringify(G);
  L=await cls(15); check('3. 第 15 週揭曉：唐睿「……是你？」→「……是你？」→（沒玩經濟系）「唐睿。全系最會講話的那個。……你真的忘了我？」、STICKY_NOTES、KNOWS_TANG',L[0]==='……是你？'&&L[1]==='……是你？'&&L[2]==='唐睿。全系最會講話的那個。……你真的忘了我？'&&G.flags.STICKY_NOTES&&G.flags.KNOWS_TANG,JSON.stringify(L));
  G=JSON.parse(s0); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.PLAYED_Y0=true; L=await cls(16); check('3. 第 15 週沒來＝第 16 週揭曉；玩過經濟系的沒有自我介紹那句',L.length===2&&G.flags.STICKY_NOTES);
  fresh(thu(3),9.1,'gongtong'); G.stage='law'; L=await cls(3,'不回'); const L2=await cls(4), L3=await cls(15);
  check('4. 第一張選「不回」：之後沒有便利貼、不揭曉',G.flags.SK04_REPLY==='none'&&!L2.length&&!L3.length&&!G.flags.STICKY_NOTES);
  fresh(thu(4),9.1,'gongtong'); G.stage='law'; L=await cls(4,'椅子也是'); check('5. 第 3 週沒來：第 4 週才看到第一張',L[1]==='這個位子的插座是壞的。'&&G.flags.SK04_REPLY==='chair');
  /* AA_294 ②（企劃 b3ec8820）：第一張延到下一次出席英文，到第 12 週（原本第 6 週以後就沒有）*/
  fresh(thu(6),9.1,'gongtong'); G.stage='law'; L=await cls(6,'椅子也是'); check('5. 第 6 週才第一次來：照樣有第一張（AA_294 ②：到第 12 週）',L[1]==='這個位子的插座是壞的。'&&G.flags.SK04_REPLY==='chair',JSON.stringify(L));
  fresh(thu(12),9.1,'gongtong'); G.stage='law'; L=await cls(12,'椅子也是'); check('5. 第 12 週才第一次來：還有',L[1]==='這個位子的插座是壞的。',JSON.stringify(L));
  fresh(thu(13),9.1,'gongtong'); G.stage='law'; L=await cls(13); check('5. 第 13 週以後才第一次來：沒有（這條線沒有）',!L.length,JSON.stringify(L));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

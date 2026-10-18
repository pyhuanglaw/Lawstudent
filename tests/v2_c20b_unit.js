// 重訪日 1（交接包 v2 C20）——2026-10-17 使用者取消：檢查停用（AA_249）。用法：node tests/v2_c20b_unit.js
// 修改前沒有 ev_revisit_y1_noodle（第 1 項失敗）。檢查：誰走哪個版本（交往中＝可昕版、麵店團＝併桌、其他＝最親近的人）；17:00 群組揪人；併桌的回應與他們各說一件；
//   最親近的人（先看階段再看熟悉、至少有點熟；學姊、沛珊有伴侶不算；女生要有聯絡方式）；男生四人的台詞與阿凱好朋友前後；女生 18:00 的訊息（芷若、子晴的條件）；
//   都不到有點熟＝筆記本；記 REVISIT_Y1
// 用法：node tests/v2_c20b_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  /* 2026-10-17 使用者取消重訪日（AA_249：改成學期末聚餐與寒暑假邀約，跟 HOLIDAY-SYS 一起做）：這裡改成檢查「停用」 */
  const RD=STORY.revisitDay(), ids=['ev_revisit_y1_kexin','ev_revisit_y1_noodle','ev_revisit_y1_single'];
  check('1. 重訪日 1 的三個事件留著但停用（retired）',ids.every(id=>{ const e=STORY_EVENTS.find(x=>x.id===id); return e&&!!e.retired; }));
  check('2. STORY.REVISIT_OFF',STORY.REVISIT_OFF===true);
  for(const fl of [{dating_kexin:true},{}]){ fresh(RD,9,'dorm',fl); PHONE.join(G,'noodle_team','麵店團'); let goal=''; GM.setGoal=t=>{ goal=t; }; run(9,22);
    const bad=(G.msgs||[]).filter(m=>/revisit/.test(String(m.tag||'')));
    check('3. 6/12（'+(fl.dating_kexin?'交往中':'單身')+'）：沒有重訪日的訊息、沒有目標提醒',!bad.length&&!/兩點半|阿鳳麵店/.test(goal),JSON.stringify([bad.map(m=>m.text),goal])); }
  for(const [zone,fl] of [['cafe',{dating_kexin:true}],['noodle',{}]]){ fresh(RD,18.05,zone,fl); PHONE.join(G,'noodle_team','麵店團');
    check('4. 6/12 18:00 在'+zone+'：重訪日事件都不開始',ids.every(id=>!EVENTS.check(STORY_EVENTS.find(x=>x.id===id))),zone); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

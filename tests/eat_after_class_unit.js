// BUG-EAT-AFTER-CLASS-SCENE-1103（使用者 11-03：「上課完去吃飯居然扣錢和吃飽 場景都是教室」）：下課選單「先去吃飯」吃飯那一段要換到那家店（2D 背景＋地點字幕），不是停在教室。
// 修改前：ADV 沒有開、沒有地點字幕＝FAIL。用法：node tests/eat_after_class_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|SYLLABUS|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/syllabus.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js',
  'src/data/y2b_events.js','src/data/group_events.js','src/data/r2y3a_events.js','src/data/r2y3b_events.js','src/data/jp_events.js','src/data/r2y4a_events.js','src/data/r2y4b_events.js','src/data/r3_events.js','src/data/us_life_events.js','src/data/y1fill_events.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);   /* 後面那幾個事件包：R7 掃全部的事件 */
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], caps=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(w,t)=>caps.push(t),sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(n){ G.money+=n; },setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,stage:'law',day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,classDone:true,afternoonDone:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const advCalls=[]; ADV.begin=o=>{ advCalls.push(o); ADV.active=true; }; ADV.end=()=>{ ADV.active=false; };
(async()=>{
  const day=STORY.termDay('Y1S1',4,2);
  /* 2026-11-12（AA_853@f6aa917593 lawww_1112 燒臘第 4 點）：2D 下課吃飯「一盤叉燒飯加一顆滷蛋」改扣 105（叉燒飯 90＋加滷蛋 15）。舊期望：公館燒臘 100 */
  for(const [meal,img,price] of [['公館燒臘','noodle_table',105],['便利商店','cvs_table_day',75],['小松',null,90]]){
    fresh(day,12,'classroom',{}); advCalls.length=0; const m0=G.money, h0=G.hour; picks=[meal];
    const r=await CLS.lunchBreak(GM,meal); const bg=advCalls[0]&&advCalls[0].background;
    check(meal+'：吃飯那一段開了 ADV（換到店裡，不是停在教室的 3D）',r===true&&advCalls.length===1,JSON.stringify(advCalls));
    if(img) check(meal+'：背景是那家店的圖（'+img+'）',!!bg&&typeof bg==='object'&&String(bg.image||'').includes(img),JSON.stringify(bg));
    else check(meal+'：還沒有圖＝深色底（不是模糊的教室）',bg==='dark'||(bg&&typeof bg==='object'),JSON.stringify(bg));
    check(meal+'：地點字幕是店名',caps.includes(meal),JSON.stringify(caps));
    check(meal+'：吃完 ADV 關掉、扣錢、過 40 分鐘',ADV.active===false&&G.money===m0-price&&Math.abs(G.hour-h0-40/60)<1e-6,JSON.stringify({a:ADV.active,m:m0-G.money,h:G.hour-h0}));
  }
  fresh(STORY.termDay('Y1S1',4,2),19,'classroom',{}); advCalls.length=0; await CLS.lunchBreak(GM,'便利商店');
  check('晚上（19:00 以後）便利商店用夜晚的圖',String((advCalls[0]&&advCalls[0].background||{}).image||'').includes('cvs_table_night'),JSON.stringify(advCalls[0]));
  /* LUNCH-NO-ASK-1110（使用者 11-10）：不問吃哪家，直接挑一家；不連著同一家；錢不夠＝不吃 */
  { fresh(day,12,'classroom',{}); opts.length=0; advCalls.length=0; const r=await CLS.lunchBreak(GM); const a=G.flags.LUNCH_LAST;
    check('不問吃哪家（沒有選單）、直接吃一家',r===true&&opts.length===0&&!!a&&caps.includes(a),JSON.stringify({r,opts,a,caps}));
    G.day+=1; G.hour=12; caps.length=0; await CLS.lunchBreak(GM); check('下一次不是同一家',!!G.flags.LUNCH_LAST&&G.flags.LUNCH_LAST!==a,a+'→'+G.flags.LUNCH_LAST);
    G.money=10; opts.length=0; const r2=await CLS.lunchBreak(GM); check('錢都不夠：不吃、不問',r2===false&&opts.length===0&&G.money===10); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

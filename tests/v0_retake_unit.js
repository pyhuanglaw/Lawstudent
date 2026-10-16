// v0 重考期的起床選單（AA_154 A39）：期間、宿舍／在家醒來的選項、固定日期只有兩項、去博雅、在博雅讀滿兩小時——不需要瀏覽器。
// 修改前沒有 STORY.retakeWake（全部失敗）。用法：node tests/v0_retake_unit.js
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
  const K=k=>STORY.dayOfKey(k), D28=K('2025-03-28'), D31=K('2025-03-31'), D2=K('2025-04-02'), J10=K('2025-07-10');
  const eco=(d,h,z,f)=>{ fresh(d,h,z,f); G.stage='econ'; };
  eco(D28-1,9,'dorm'); check('1. 3/27：還不是重考期',!STORY.retakeOn(G)); G.day=D28; check('1. 3/28～7/10 是重考期',STORY.retakeOn(G)&&(G.day=J10,STORY.retakeOn(G))&&(G.day=J10+1,!STORY.retakeOn(G)));
  G.stage='law'; G.day=D31; check('1. 法律系：不是',!STORY.retakeOn(G));
  let menus=[], script=[]; const choose0=GM.choose; GM.choose=async o=>{ const t=o.map(q=>q.t||q.text); menus.push(t); const w=script.shift(); if(w==null) throw new Error('STOP'); const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
  // 宿舍醒來（3/28＝R1 那天）：只有兩項
  eco(D28,7.5,'dorm',{Y0_LEFT:true}); menus=[]; script=['去博雅']; const r=await CLS.wakeMenu(GM);
  check('2. 3/28 宿舍醒來：起床選單只有「去博雅，和可昕讀書」「先起床再說」（R1 是讀書日的事件）→ 去博雅＝讀書日、到博雅',JSON.stringify(menus[0])==='["去博雅，和可昕讀書","先起床再說"]'&&G.flags.RT_DAY.type==='study'&&G.zone==='boya'&&r===true,JSON.stringify(menus));
  // 在家醒來（3/31）：三項，從家出發有通勤
  eco(D31,8.5,'home',{Y0_LEFT:true,Y0_MOVED_OUT:true}); G.home={at:true,base:true,wakeAsk:D31}; menus=[]; script=['出去走走']; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; }
  check('3. 3/31 在家醒來：三項（讀書／出去走走／先起床再說）→ 玩樂日；回到在家的選單',JSON.stringify(menus[0])==='["去博雅，和可昕讀書","今天出去走走","先起床再說"]'&&G.flags.RT_DAY.type==='play'&&menus[1]&&menus[1].includes('去學校'),JSON.stringify(menus));
  eco(D31,8.5,'home',{Y0_LEFT:true,Y0_MOVED_OUT:true}); G.home={at:true,base:true,wakeAsk:D31}; menus=[]; script=['去博雅']; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; }
  check('3. 從家裡去博雅：先到學校（30 分鐘）再到博雅、不在家',!HOME.at(G)&&G.zone==='boya'&&G.flags.RT_DAY.type==='study');
  eco(D2,8.5,'home',{Y0_LEFT:true,Y0_MOVED_OUT:true}); G.home={at:true,base:true,wakeAsk:D2}; menus=[]; script=['先起床']; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; }
  check('3. 4/2（R5）在家：只有兩項',JSON.stringify(menus[0])==='["去博雅，和可昕讀書","先起床再說"]'&&G.flags.RT_DAY.type==='free');
  check('3. 同一天不再問',!(await STORY.retakeWake(GM)));
  // 在博雅讀滿兩小時＝retake:study
  eco(D31,10,'boya'); STORY.onStudy(GM,1); check('4. 在博雅讀一小時：不算',EVENTS.habitCount({key:'retake:study'})===0); STORY.onStudy(GM,2); check('4. 讀兩小時：retake:study +1',EVENTS.habitCount({key:'retake:study'})===1);
  eco(D31,10,'library'); STORY.onStudy(GM,3); check('4. 在別的地方讀：不算（博雅小桌才算；在家讀書另外算）',EVENTS.habitCount({key:'retake:study'})===0);
  GM.choose=choose0;
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

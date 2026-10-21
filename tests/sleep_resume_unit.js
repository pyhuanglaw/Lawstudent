// 選了「睡到明天早上」，被叫醒的那一段演完人卻醒著站在房間（BB-C 10-20，e7b96f70 重現 2 次）——不需要瀏覽器。
//   BB 的第二輪：2027-11-17 21:00 宿舍、和可昕交往 → 睡覺 → S.lawWakeAt 22:00 叫醒（可昕的電話，AA_315 2-6）→ 電話演完 → 醒著，要自己再走去床。
//   另外：sleepNow 醒來的字卡（2 秒）在劇情鎖之外，S.tick 會在換房間之前開新的事件（例：拆箱、畢業典禮早上）。
// 檢查：
//   1. 睡覺的整段 STORY._sleeping＝true（醒來字卡那時候也是），結束（包括 lawWakeAt 中途 return）放開
//   2. S.tick：STORY._sleeping 的時候不開新的事件（宿舍的拆箱到期也不開）；放開以後照舊開
//   3. 被 lawWakeAt 叫醒（11/17 22:00 可昕的電話）：記下 _resume；電話演完 1 秒以後床的選單自動再出來（S.resumeSleepTick）；選「睡到明天早上」就睡到 11/18
//   4. 選「再撐一下」、先去做別的事（S.interact）、走出房間、過了 03:00、換一天＝不再自動出
//   5. 經濟系的電話（coreCallAt：叫你出門）不記 _resume
//   6. 讀檔（game3d.js applySave）把 _sleeping、_resume 清掉
// 修改前：第 1 項 FAIL（沒有 _sleeping）、第 3 項 FAIL（電話完醒著）。用法：node tests/sleep_resume_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, cards=[], entered=[], during=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ cards.push([a,b]); during.push(STORY._sleeping); },enter:async(z)=>{ entered.push(z); G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cards=[]; entered=[]; during=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; STORY._resume=null; STORY._sleeping=false; return G; };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const tick=async(n,dt)=>{ for(let i=0;i<(n||1);i++){ STORY.tick(GM,dt==null?0.6:dt); await new Promise(r=>setImmediate(r)); await new Promise(r=>setImmediate(r)); } };
const d16=D('2027-11-16'), d17=D('2027-11-17'), d18=D('2027-11-18');
(async()=>{
  // 1. 睡覺的整段
  fresh(d16,21,'dorm'); const w=STORY.bedOptions(G).find(o=>o.kind==='sleep');
  const p=STORY.sleepNow(GM,w.wake,w.alarm); const mid=STORY._sleeping; await p;
  check('1. 睡覺的整段 STORY._sleeping＝true（醒來的字卡那時候也是），睡完放開', mid===true&&during.length>0&&during.every(x=>x===true)&&STORY._sleeping===false&&G.day===d17, 'mid='+mid+' cards='+JSON.stringify(during)+' after='+STORY._sleeping+' day='+CALENDAR.dateOf(G.day).key);
  // 2. S.tick 不開新的事件
  fresh(d16,21,'dorm',{ROOM_Y3:null}); let started=0; const o3=STORY.roomY3InDorm; STORY.roomY3InDorm=async()=>{ started++; return true; };
  STORY._sleeping=true; await tick(3); const a=started; STORY._sleeping=false; await tick(1); const b=started; STORY.roomY3InDorm=o3;
  check('2. S.tick：睡覺中（_sleeping）宿舍的拆箱到期也不開；放開以後照舊開', a===0&&b===1, a+'/'+b);
  // 3. 11/17 22:00 可昕的電話
  fresh(d17,21,'dorm'); date('kexin'); check('3. 前置：11/17 21:00 睡著會在 22:00 被叫醒', STORY.lawWakeAt(G)===22);
  const w3=STORY.bedOptions(G).find(o=>o.kind==='sleep'&&/早上/.test(o.t)); await STORY.sleepNow(GM,w3.wake,w3.alarm);
  check('3. 22:00 醒來：記下 _resume（同一天、宿舍）、_sleeping 放開', G.day===d17&&Math.abs(G.hour-22)<1e-6&&STORY._resume&&STORY._resume.day===d17&&STORY._resume.zone==='dorm'&&STORY._sleeping===false, JSON.stringify(STORY._resume)+' h='+G.hour);
  said=[]; opts=[]; picks=[1]; await tick(1);
  check('3. 電話來了（S.tick → exchFormTick）、演完', G.flags.KX_EXCH_TALK==='call'&&said.some(s=>s.who==='可昕（電話）'), G.flags.KX_EXCH_TALK);
  opts=[]; picks=['睡到明天早上']; await tick(1); const t0=opts.length; await tick(1);
  check('3. 電話演完 1 秒以後床的選單自動再出來（不用再走去床）', t0===0&&opts.length===1&&/睡到明天早上/.test(opts[0][0]), JSON.stringify(opts));
  check('3. 選「睡到明天早上」＝睡到 11/18 早上、_resume 清掉', G.day===d18&&G.hour<12&&STORY._resume===null, CALENDAR.dateOf(G.day).key+' '+G.hour);
  // 4. 不再出的情況
  const wake22=async(fl)=>{ fresh(d17,21,'dorm',fl); date('kexin'); const w=STORY.bedOptions(G).find(o=>o.kind==='sleep'); await STORY.sleepNow(GM,w.wake,w.alarm); picks=[1]; await tick(1); opts=[]; };
  await wake22(); picks=['再撐一下']; await tick(2); const n1=opts.length; await tick(3);
  check('4. 選「再撐一下」：之後不會一直跳出來', n1===1&&opts.length===1&&G.day===d17&&STORY._resume===null, JSON.stringify(opts));
  await wake22(); await STORY.interact({roomItems:true},GM); opts=[]; await tick(3);
  check('4. 先去做別的事（S.interact）：不自動出', opts.length===0&&STORY._resume===null, JSON.stringify(opts));
  await wake22(); G.zone='dorm_hall'; await tick(3);
  check('4. 走出房間：不自動出、_resume 清掉', opts.length===0&&STORY._resume===null);
  await wake22(); G.hour=27.2; STORY.resumeSleepTick(GM,5);
  check('4. 過了 03:00：不自動出', opts.length===0&&STORY._resume===null);
  await wake22(); G.day=d18; G.hour=9; STORY.resumeSleepTick(GM,5);
  check('4. 換了一天：不自動出', opts.length===0&&STORY._resume===null);
  // 5. 經濟系的電話
  { const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
    check('5. 經濟系的電話（coreCallAt：叫你出門）不記 _resume', /if\(cw==null\) S\._resume=\{day:G\.day,zone:G\.zone\};/.test(s)); }
  // 6. 讀檔
  { const s=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
    check('6. 讀檔清掉 _sleeping、_resume', /GM\.chooseReset\(\); if\(typeof STORY!=='undefined'\)\{ STORY\._sleeping=false; STORY\._resume=null; \}/.test(s)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

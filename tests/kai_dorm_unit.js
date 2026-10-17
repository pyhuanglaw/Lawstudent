// 室友阿凱的宿舍事件（BB_130 第 6 節；LADDER.kaiDorm K-D1～6；使用者 2026-10-15 試玩回報第 16 項：室友要有故事——打電動、吵架、和好）——不需要瀏覽器。
// 一週只打一次；第二次以上打到 23 點以後＝一場變三場（02:00、隔天早上精力 −10）；早八的鍵盤聲 → 吵架 → 兩天只說「嗯」→ 和解的飲料；沒回宿舍第 4 天一定和好（README：阿凱吵架後第 4 天一定和好）；室友模式。
// 修改前 STORY.kaiDormTalk 不存在（第 1 項失敗）。用法：node tests/kai_dorm_unit.js
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
  check('1. STORY.kaiDormTalk／kaiDormTick 存在',typeof STORY.kaiDormTalk==='function'&&typeof STORY.kaiDormTick==='function');
  if(typeof STORY.kaiDormTalk!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  const KAI={name:'阿凱',charId:'kai'}; const tickWait=async()=>{ STORY.kaiDormTick(GM); for(let i=0;i<20;i++) await new Promise(r=>setImmediate(r)); };
  const MON=termDay('Y1S1',3,1), MON2=termDay('Y1S1',4,1);
  fresh(MON,21.5,'dorm',{introDone:true,classDone:true,afternoonDone:true}); GM.npc.kai=KAI; const f0=SOCIAL.rel('kai').fam|0;
  picks=[0]; check('2. K-D1 週一 21:30 找阿凱說話：一起打一場（baa5c577 口語版）',await STORY.kaiDormTalk(GM,KAI)&&lines().join('').includes('一場就好啦，你上路，我中路。'),lines().join('｜'));
  check('2. 打完：KAI_GAMES 1、時間 +1 小時、阿凱熟悉 +3',G.flags.KAI_GAMES===1&&Math.abs(G.hour-22.5)<1e-6&&(SOCIAL.rel('kai').fam|0)>=f0+3,JSON.stringify({g:G.flags.KAI_GAMES,h:G.hour,fam:SOCIAL.rel('kai').fam}));
  said=[]; check('3. 同一週再找他：不再打（回 false，照舊閒聊）',!(await STORY.kaiDormTalk(GM,KAI))&&!said.length);
  G.day=MON2; G.weekday=1; G.hour=22.5; said=[]; picks=[0,0];
  await STORY.kaiDormTalk(GM,KAI); const t2=lines().join('｜');
  { const C1=CLS.dayItems(G,G.day+1).sort((a,b)=>a.t0-b.t0)[0]; const want=C1?(C1.t0>=12?'那還早啦。再一場就好。':STORY.cnClock(C1.t0)+'？那還可以睡好幾個小時啦。'):null;
  check('4. K-D2 第二次、打完 23:30：一場變三場（時間到 02:00）；選項①照隔天第一堂換字（「九點十分」這種說法；下午的課用 ifAfternoon；不會出現 {明天第一堂}）',t2.includes('一場變三場')&&t2.includes('你明天第一堂幾點')&&!t2.includes('{明天第一堂}')&&(!want||t2.includes(want))&&Math.abs(G.hour-26)<1e-6,t2.slice(-90)+' h='+G.hour+' want='+want); }
  check('4. 中文時間：9:10＝九點十分、13:20＝一點二十分、10:00＝十點',STORY.cnClock(9+10/60)==='九點十分'&&STORY.cnClock(13+20/60)==='一點二十分'&&STORY.cnClock(10)==='十點');
  check('4. 選「九點十分。」（BB-B b1884460 改版）：DL-02 拿掉體力以後，不再記隔天早上精力 −10（morningEnergyAdj 不用）',!G.flags.morningEnergyAdj);
  // K-D3：有早八的早上、昨晚沒一起打（30%：Math.random 固定 0）
  let D3=null; for(let d=termDay('Y1S1',5,1);d<termDay('Y1S1',6,1);d++){ G.day=d; if(CLS.dayItems(G,d).some(it=>it.t0<=9.25)){ D3=d; break; } }
  check('5. 找得到有早上第一堂課（9:10 以前）的日子',!!D3);
  const rnd=Math.random; Math.random=()=>0;
  fresh(D3,7.5,'dorm',{introDone:true,classDone:true,afternoonDone:true}); GM.npc.kai=KAI; picks=[2]; await tickWait();
  check('5. K-D3 早上的鍵盤聲 → 選「你到底要不要睡？」＝K-D4 吵架',lines().join('').includes('鍵盤聲很大')&&lines().join('').includes('你現在是在念我嗎')&&G.flags.KAI_FIGHT===true,lines().join('｜').slice(0,140));
  G.day=D3+1; G.hour=21; said=[]; await STORY.kaiDormTalk(GM,KAI); check('6. 吵架之後兩天：阿凱只說「嗯」',said.length===1&&said[0].t==='嗯',JSON.stringify(said));
  G.hour=21.2; said=[]; picks=[0]; await tickWait();
  check('7. K-D5 吵架後第 1 天在宿舍：和解的飲料 → 和好、訂規則（KAI_ROOM_RULES）',lines().join('').includes('和解的飲料')&&!G.flags.KAI_FIGHT&&SOCIAL.has('kai','KAI_ROOM_RULES'),lines().join('｜').slice(0,120));
  // 不說話累積到 3＝吵架
  fresh(D3,7.5,'dorm',{introDone:true,classDone:true,afternoonDone:true}); GM.npc.kai=KAI; G.flags.KAI_FRICTION=2; picks=[1]; await tickWait();
  check('8. 什麼都不說累積到 3：吵架',G.flags.KAI_FIGHT===true);
  // 沒回宿舍：第 4 天自己和好，下次見面他先說
  const fd=G.day; G.zone='campus'; G.day=fd+4; await tickWait();
  check('9. 吵架後沒回宿舍：第 4 天自己和好（不鎖線）',!G.flags.KAI_FIGHT&&SOCIAL.has('kai','KAI_ROOM_RULES'));
  G.zone='dorm'; G.hour=19; said=[]; await STORY.kaiDormTalk(GM,KAI); check('9. 下次見面他先說「上次的事，是我不對啦。」（baa5c577）',said.length===1&&said[0].t.includes('上次的事，是我不對'),JSON.stringify(said));
  Math.random=rnd;
  // K-D6：和好以後的週日晚上
  let SUN=G.day; while(wdOf(SUN)!==0) SUN++; G.day=SUN; G.weekday=0; G.hour=20.5; said=[]; picks=[0];
  await STORY.kaiDormTalk(GM,KAI); check('10. K-D6 和好以後的週日晚上：室友模式',lines().join('').includes('室友模式'),lines().join('｜'));
  said=[]; G.day=SUN+7; G.hour=20.5; check('10. 室友模式只一次',!(await STORY.kaiDormTalk(GM,KAI))||!lines().join('').includes('室友模式'));
  // 舊存檔（沒有 kaiDorm 欄位）不出錯
  fresh(MON,21.5,'dorm',{}); delete G.flags.kaiDorm; GM.npc.kai=KAI; let ok=true; try{ STORY.kaiDormTick(GM); }catch(e){ ok=false; } check('11. 舊存檔沒有 kaiDorm 欄位：不出錯',ok);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

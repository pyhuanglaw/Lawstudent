// 大二：子晴 Q7 實驗室的信（BB_97 3-1）、沛珊 P3 我要重考（4-2）、學姊 W7 研究室門口（2-2）——不需要瀏覽器。
// 修改前沒有這三件（全部失敗）。用法：node tests/v3_bb_w5_unit.js
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
  const ids=['ev_ziqing_lab_letter','ev_peishan_decision','ev_sis_prof_xu_door']; check('0. 三件在',ids.every(i=>ev(i))); if(!ids.every(i=>ev(i))){ console.log('FAILED '+fails); process.exit(1); }
  global.STORY.present=()=>true; global.GAME=GM; const at=(x,z)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; E.player.lv=0; }, tick=()=>{ said=[]; return EVENTS.tick(0.1); };
  const wait=async()=>{ for(let i=0;i<50&&EVENTS.running;i++) await new Promise(r=>setTimeout(r,0)); };
  const norm=a=>a.map(t=>t.replace(/^[^：（]*：/,''));
  // Q7
  const GA=ACTIVITIES.list.find(a=>a.id==='club_guitar'), mon3=termDay('Y2S1',3,1);
  check('1. 吉他社社課大二上第 3 週起（第 2 週沒有）',ACTIVITIES.on(GA,mon3)&&!ACTIVITIES.on(GA,termDay('Y2S1',2,1)));
  fresh(mon3,19,'wancai',{}); G.stage='law'; meet('heroine_04'); R('heroine_04',...LV.FAM);
  let e=CLS.clubEvent(G,GA); check('1. 第 3 週社課、有點熟：先演 Q7',!!e&&e.id==='ev_ziqing_lab_letter',e&&e.id);
  picks=['接妳爸']; said=[]; await EVENTS.run(e); let L=norm(lines());
  check('1. 逐字＋「接妳爸的電話。」→「不要。」旁白「她把手機調成靜音。」「……改天講給你聽。」、LAB_LETTER',L[0]==='（把手機蓋在桌上）教授寄信。叫我進他的實驗室。'&&L[4]==='……好，這題我不會。你是法律系的，你幫我判。'&&L[5]==='不要。'&&L[6]==='她把手機調成靜音。'&&L[7]==='……改天講給你聽。'&&SOCIAL.has('heroine_04','LAB_LETTER')&&G.flags.LAB_LETTER_DAD,JSON.stringify(L));
  fresh(mon3,19,'wancai',{}); G.stage='law'; meet('heroine_04'); R('heroine_04',...LV.ACQ); check('1. 只是認識不演',!CLS.clubEvent(G,GA));
  fresh(termDay('Y2S1',4,1),19,'wancai',{}); G.stage='law'; meet('heroine_04'); R('heroine_04',...LV.FAM); check('1. 第 4 週不演',!CLS.clubEvent(G,GA));
  // P3
  const tue5=termDay('Y2S1',5,2); fresh(tue5,12.2,'linze',{}); G.stage='law'; meet('classmate_peishan'); R('classmate_peishan',...LV.FAM); at(0,0);
  check('2. 沒有 P2／P2b 不演',!tick());
  G.events.done.ev_peishan_syllogism=1; SOCIAL.remember('classmate_peishan','NOT_FOR_ME',''); G.flags.SIS_ANSWERED_WHY=true; G.flags.ECON_PAST_SHARED='full';
  check('2. 沒交往：不演（AA_281 第 4 節 B-5：她什麼都不說，只有交往中的知道）',!tick());
  G.flags.dating_classmate_peishan=true;
  picks=['我念過一個多月經濟']; tick(); await wait(); L=norm(lines());
  check('2. 霖澤館 12:00～13:00：NOT_FOR_ME 開頭＋SIS_ANSWERED_WHY 那句＋三句；重考的選項（已經說過的玩家）「你說過你重考過。那你要教我。」、MIRROR_PEISHAN',L[0]==='你記得我說過框的事嗎？……我想了一年。'&&L[1]==='學姊那時候說她還在想。我想完了。'&&L[2]==='我決定了。我要重考。去念教育。'&&L[L.length-1]==='你說過你重考過。那你要教我。'&&SOCIAL.has('classmate_peishan','MIRROR_PEISHAN')&&G.flags.PEISHAN_RETAKE,JSON.stringify(L));
  fresh(tue5,12.2,'campus',{dating_classmate_peishan:true}); G.stage='law'; meet('classmate_peishan'); R('classmate_peishan',...LV.FAM); G.events.done.ev_peishan_doubt=1; at(80,0); check('2. 校園遠處不演',!tick());
  at(34,-95); picks=['妳想去就去']; tick(); await wait(); L=norm(lines());
  check('2. 備案：霖澤館前 25 m 內；沒有 NOT_FOR_ME 的開頭；「妳想去就去。」',L[0]==='我想了很久。我比較想知道框外面的人在想什麼。'&&L[1]==='我決定了。我要重考。去念教育。'&&L[L.length-1]==='難的是星期六回家，站在那張榜單前面。',JSON.stringify(L));
  fresh(tue5,12.2,'linze',{dating_classmate_peishan:true}); G.stage='law'; meet('classmate_peishan'); R('classmate_peishan',...LV.FAM); G.events.done.ev_peishan_doubt=1; at(0,0); picks=['我念過一個多月經濟']; tick(); await wait(); L=norm(lines());
  check('2. 還沒說過經濟系的玩家：「……你重考過？」→ 旁白 →「那你要教我。」',L.slice(-3).join('|')==='……你重考過？|她眼睛亮起來。|那你要教我。',JSON.stringify(L));
  fresh(tue5,14,'linze',{dating_classmate_peishan:true}); G.stage='law'; meet('classmate_peishan'); R('classmate_peishan',...LV.FAM); G.events.done.ev_peishan_doubt=1; at(0,0); check('2. 13:00 以後不演',!tick());
  // W7
  const w6=termDay('Y2S1',6,3); fresh(w6,15.5,'linze',{}); G.stage='law'; meet('heroine_05'); R('heroine_05',...LV.ACQ); at(0,0); check('3. 學姊只是認識不演',!tick());
  R('heroine_05',...LV.FAM); check('3. W7 許教授的門作廢（BB_207 第 1 節、AA_261 第 1 節：推甄整段取消）：retired、有點熟也不演',!!ev('ev_sis_prof_xu_door').retired&&!tick());
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

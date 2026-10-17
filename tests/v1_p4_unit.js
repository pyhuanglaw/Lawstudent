// P4 第二次大一＋P4c 坐過的位子＋P4b 你怎麼這麼熟（BB_105；AA_154 A51）：第一次上重修經原的對話（full 版本／三選一、ECON_PAST_SHARED 只升不降）、P4c 旁白、P4b 第 4、5、7 週 50%——不需要瀏覽器。
// 修改前沒有 ev_p4_retake、ev_p4b_familiar（全部失敗）。用法：node tests/v1_p4_unit.js
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
  const e=ev('ev_p4_retake'), b=ev('ev_p4b_familiar'); check('0. P4、P4b 在；P4 beforeClass econ_principles_1、P4b afterClass、都只在大一上',!!e&&!!b&&e.beforeClass==='econ_principles_1'&&b.afterClass==='econ_principles_1'&&JSON.stringify(e.term)==='["Y1S1"]'); if(!e||!b){ console.log('FAILED '+fails); process.exit(1); }
  const fri=termDay('Y1S1',3,5), it={c:{id:'econ_principles_1'}};
  const p4=async(flags,pick)=>{ fresh(fri,9.1,'putong',flags||{}); G.stage='law'; said=[]; picks=pick==null?[]:[pick]; await CLS.beforeClassEvent(GM,it); return said.map(x=>x.t); };
  let L=await p4({},'念過一年');
  check('1. P4c 旁白（沒有座位＝前半句）→ 阿哲「這門課你選的？經濟學原理？」→「……我得修。」→ 芯慈「你看起來好像來過這間教室。」→ ① 升 full、「所以你是留級生？」「是重修生。」「難怪。」',
    L[0]==='這間教室，你一年前坐過。'&&L[1]==='這門課你選的？經濟學原理？'&&L[2]==='……我得修。'&&L[3]==='你看起來好像來過這間教室。'&&L.includes('所以你是留級生？')&&L[L.length-1]==='難怪。'&&G.flags.ECON_PAST_SHARED==='full',JSON.stringify(L));
  L=await p4({Y0_P1_SEAT:'window'},'自學'); check('1. 座位 window：「……那時候你坐在靠窗。」；② none → half、「……自學的人不會知道這間教室的冷氣很冷。」',L[0]==='這間教室，你一年前坐過。那時候你坐在靠窗。'&&G.flags.ECON_PAST_SHARED==='half'&&L[L.length-1]==='……自學的人不會知道這間教室的冷氣很冷。');
  L=await p4({ECON_PAST_SHARED:'half'},'笑一笑'); check('1. ③ 笑一笑：「好神祕。我喜歡。」；half 不降',L[L.length-1]==='好神祕。我喜歡。'&&G.flags.ECON_PAST_SHARED==='half');
  L=await p4({ECON_PAST_SHARED:'full',Y0_P1_SEAT:'xun'}); check('2. 已經 full：不選，阿哲「對齁，你念過經濟。所以你是留級生？」「是重修生。」芯慈「那你來幫我看這題。」',L[0].endsWith('那時候你坐在阿勳旁邊。')&&!L.includes('你看起來好像來過這間教室。')&&L.includes('對齁，你念過經濟。所以你是留級生？')&&L[L.length-1]==='那你來幫我看這題。'&&G.flags.ECON_PAST_SHARED==='full',JSON.stringify(L));
  check('2. 只一次',(()=>{ const ok=EVENTS.check(e,{chain:true}); return !ok; })());
  // P4b
  const wk=w=>termDay('Y1S1',w,5);
  const p4b=async(w,flags,hit,pick)=>{ fresh(wk(w),12.2,'putong',flags||{}); G.stage='law'; G.flags.P4B_ROLL={wk:w,hit}; said=[]; picks=pick==null?['還好啦']:[pick]; const r=await CLS.afterClassEvent(GM,{c:{id:'econ_principles_1'},exam:null}); return {r,L:said.map(x=>x.t)}; };
  let r=await p4b(4,{ECON_PAST_SHARED:'none'},true); check('3. 第 4 週（中）：芯慈「你怎麼這麼熟？老師還沒講到的圖，你已經畫好了。」→「……還好啦。」none＝「你一定念過。……沒關係，不用說。」、P4B_SEEN',r.L[0]==='你怎麼這麼熟？老師還沒講到的圖，你已經畫好了。'&&r.L[r.L.length-1]==='你一定念過。……沒關係，不用說。'&&G.flags.P4B_SEEN&&G.flags.ECON_PAST_SHARED==='none',JSON.stringify(r.L));
  check('3. 同一週不再觸發',!EVENTS.check(b,{chain:true}));
  r=await p4b(5,{ECON_PAST_SHARED:'half'},true); check('3. 第 5 週阿哲「欸，你怎麼都知道老師下一句要講什麼？」；half＝「你不是自學的吧。……沒關係，不用說。」',r.L[0]==='欸，你怎麼都知道老師下一句要講什麼？'&&r.L[r.L.length-1]==='你不是自學的吧。……沒關係，不用說。');
  r=await p4b(7,{},true,'念過一年'); check('3. 第 7 週芯慈「期中考的範圍，你好像不用看。」→ 念過一年＝升 full、「……難怪。那你來幫我看這題。」',r.L[0]==='期中考的範圍，你好像不用看。'&&r.L.includes('……難怪。那你來幫我看這題。')&&G.flags.ECON_PAST_SHARED==='full');
  r=await p4b(4,{ECON_PAST_SHARED:'none'},false); check('4. 沒擲中（50%）：不演',!r.L.length);
  r=await p4b(5,{ECON_PAST_SHARED:'full'},true); check('4. 已經 full：不演',!r.L.length);
  r=await p4b(6,{},true); check('4. 第 6 週（國慶，沒有課）、第 8 週以後：不演',!r.L.length);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

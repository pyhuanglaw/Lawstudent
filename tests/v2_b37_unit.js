// v2 B37＋SYS-14：法律系班級群組 law_class（AA-B 2026-10-16，AA_140 第 4 節 B10）與沛珊「欠的，還了。」（BB_96 3-7；BB-B 2026-10-16 02:00）——不需要瀏覽器。
// 檢查：所有玩家（新遊戲第 1 天 21:00、舊存檔）都在 law_class、名稱「法律系（全班）」（AA_177 第 9 節，原本照年級）；大一下第 16 週週日 21:00 沛珊在 law_class 發一則（PS_CANCEL:'ok'＝「欠的，還了。」、其他＝「期末加油。」）；
//   只有沛珊說話；沒有沛珊聯絡方式的玩家沒有；21:00 以前沒有；回覆兩個選項（貼圖、謝謝）＋不回；只發一次。修改前沒有 law_class（第 1 項失敗）。
// 用法：node tests/v2_b37_unit.js
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
(async()=>{
  const sun=STORY.dayOfKey('2026-06-07');   // AA_198 第 5 節：第 16 週週日（6/14）已經考完，改 6/7（日）；和 story3d.js 同一天
  fresh(1,21,'dorm',{}); run(21,21.2);
  check('1. 新遊戲第 1 天 21:00：在 law_class，名稱「法律系（全班）」（AA_177 第 9 節：四年同一個名字）',PHONE.inGroup(G,'law_class')&&PHONE.title(G,'g:law_class')==='法律系（全班）',PHONE.title(G,'g:law_class'));
  fresh(termDay('Y2S1',3,2),9,'dorm',{}); run(9,9.2);
  check('2. 舊存檔（大二才讀檔、沒有群組）：補上，名稱「法律系（全班）」',PHONE.inGroup(G,'law_class')&&PHONE.title(G,'g:law_class')==='法律系（全班）',PHONE.title(G,'g:law_class'));
  fresh(termDay('Y2S1',3,2),9,'dorm',{}); PHONE.join(G,'law_class','法律系 大二（全班）'); run(9,9.2); check('2. 舊存檔照年級的名字改成「法律系（全班）」',PHONE.title(G,'g:law_class')==='法律系（全班）');
  const owed=(flags,contact)=>{ fresh(sun,20,'dorm',flags); if(contact) INV.addContact(G,'classmate_peishan'); run(20,20.9); const before=TH('g:law_class').length; run(21,21.3); return {before,msgs:TH('g:law_class')}; };
  let r=owed({PS_CANCEL:'ok'},true);
  check('3. 第 11 週選「沒關係」：21:00 以前沒有；21:00 沛珊「📄 刑總二重點。欠的，還了。」',r.before===0&&r.msgs.length===1&&r.msgs[0].from==='classmate_peishan'&&r.msgs[0].text==='📄 刑總二重點。欠的，還了。',JSON.stringify(r.msgs.map(m=>m.from+':'+m.text)));
  check('3. 回覆兩個選項（貼圖、「謝謝！」），不回也可以',!!(r.msgs[0].ask&&r.msgs[0].ask.opts.length===2&&r.msgs[0].ask.opts[1].t==='謝謝！'));
  r=owed({PS_CANCEL:'waited'},true); check('4. 其他選項（等十分鐘）：「📄 刑總二重點。期末加油。」',r.msgs.length===1&&r.msgs[0].text==='📄 刑總二重點。期末加油。',JSON.stringify(r.msgs.map(m=>m.text)));
  r=owed({},true); check('4. 沒去女舍（沒有 PS_CANCEL）：一樣「期末加油。」',r.msgs.length===1&&r.msgs[0].text==='📄 刑總二重點。期末加油。');
  r=owed({PS_CANCEL:'ok'},false); check('5. 沒有沛珊聯絡方式：沒有這一則',r.msgs.length===0);
  r=owed({PS_CANCEL:'ok'},true); run(21.3,23); G.day=sun+1; run(9,22); check('6. 只發一次、沒有別人接話',TH('g:law_class').length===1&&TH('g:law_class').every(m=>m.from==='classmate_peishan'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();

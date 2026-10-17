// V0-A1／A2 經濟系大一的日曆與課表（AA_154 第 1 節、第 6-1 節；AA_106 2-2）——不需要瀏覽器。
// 修改前：2024-09-30 不是颱風假、termDay 找不到 Y0 的日子、沒有 Y0 的課（第 2、3、4 項失敗）。
// 用法：node tests/v0_a1_unit.js
// 用法：node tests/v2_b10_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/syllabus.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
let caps=[]; GM.caption=(w,t)=>caps.push(t);
const after=async(day)=>{ G.day=day; G.weekday=wdOf(day); G.hour=12.17; G.zone='putong'; const it={c:{id:'econ_principles_2'}}; said=[]; opts=[]; caps=[]; return await CLS.afterClassEvent(GM,it); };
  const e=ev('ev_sk03_lunch'); check('1. ev_sk03_lunch 存在（afterClass econ_principles_2、大一下、週五）',!!e&&e.afterClass==='econ_principles_2'&&JSON.stringify(e.term)==='["Y1S2"]');
  if(!e){ console.log('FAILED '+fails); process.exit(1); }
  const F2=termDay('Y1S2',2,5), F3=termDay('Y1S2',3,5), F4=termDay('Y1S2',4,5), F5=termDay('Y1S2',5,5), F7=termDay('Y1S2',7,5), F9=termDay('Y1S2',9,5);
  fresh(F2,12.17,'putong',{introDone:true,classDone:true,afternoonDone:true});
(async()=>{

  const K=k=>STORY.dayOfKey(k), H=['2024-09-17','2024-09-27','2024-10-10','2024-12-25','2025-01-01','2025-01-27','2025-01-28','2025-01-29','2025-01-30','2025-01-31','2025-02-28','2025-04-03','2025-04-04','2025-05-01','2025-05-30'];
  const miss=H.filter(k=>!CALENDAR.holiday(K(k)));
  check('1. 國定假日（AA_154 6-1 第 1 項）都是假日',!miss.length,miss.join(' '));
  check('2. 2024-09-30 颱風假（Y0S1 第 5 週週一）',CALENDAR.typhoon(K('2024-09-30'))&&!CALENDAR.typhoon(K('2024-10-01')));
  const T=k=>{ const t=CALENDAR.termOf(K(k)); return t?t.id+'W'+t.week+(t.exam?':'+t.exam:''):'—'; };
  const exp={'2024-09-02':'Y0S1W1','2024-10-21':'Y0S1W8:mid','2024-12-22':'Y0S1W16:final','2024-12-23':'—','2025-02-17':'Y0S2W1','2025-06-08':'Y0S2W16:final','2025-06-09':'—','2025-09-01':'Y1S1W1'};   /* 16 週制（AA_197 1-6：113 上寒假 12/23 起、113 下 6/9 起）*/
  const bad=Object.entries(exp).filter(([k,v])=>T(k)!==v);
  check('3. termOf（6-1 第 2 項）；termDay 找得到 Y0 的日子（Y0S1 第 1 週週一＝2024-09-02）',!bad.length&&CALENDAR.dateOf(termDay('Y0S1',1,1)).key==='2024-09-02'&&CALENDAR.dateOf(termDay('Y0S2',6,4)).key==='2025-03-27',JSON.stringify(bad));
  const items=(k,flags)=>{ fresh(K(k),8,'dorm',flags||{}); return CLS.dayItems(G).map(it=>it.c.id); };
  const d0902=items('2024-09-02'), d0917=items('2024-09-17'), d0930=items('2024-09-30'), d1010=items('2024-10-10'), d0903=items('2024-09-03'), d0905=items('2024-09-05');
  check('4. Y0S1 課表：週一經原（博雅）、週二國文＋通識、週四英文＋會計（普通）',d0902.includes('econ_principles_y0')&&d0903.includes('chinese_y0')&&d0903.includes('ge_y0s1')&&d0905.includes('english_y0')&&d0905.includes('acct_y0'),JSON.stringify([d0902,d0903,d0905]));
  check('5. 9/17 中秋：通識、國文不開；9/30 颱風：經原不開；10/10 國慶：會計不開（6-1 第 3 項）',!d0917.includes('ge_y0s1')&&!d0917.includes('chinese_y0')&&!d0930.includes('econ_principles_y0')&&!d1010.includes('acct_y0'),JSON.stringify([d0917,d0930,d1010]));
  const s1=items('2025-02-18'), s2=items('2025-04-01',{Y0_LEFT:true}), s3=items('2025-02-17');
  check('6. Y0S2：週二有法學緒論（黃教授）；休學（Y0_LEFT）以後經濟系的課、法學緒論都不排',s1.includes('law_intro')&&s3.includes('econ_principles_y0_2')&&!s2.length,JSON.stringify([s1,s2]));
  const room=id=>COURSES.list.find(c=>c.id===id).room;
  check('7. 地點：經原＝博雅、會計＝普通（AA_106【已定案】）、微積分＝共同',room('econ_principles_y0')==='BOYA'&&room('acct_y0')==='PUTONG'&&room('calc_y0s1')==='GONGTONG');
  check('8. 法律系的課照舊（Y1S1 第 4 週週一有憲法；第 1～2 週在遊戲開始之前不排）',items('2025-09-22').includes('const_1')&&!items('2025-09-01').length);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

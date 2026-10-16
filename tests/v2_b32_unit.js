// V2-B32＋SYS-13 最小版：明軒介紹的家教（BB_96 3-2、AA_72 第 3 節）——不需要瀏覽器。修改前沒有 ev_mingxuan_tutor_intro（第 1 項失敗）。
// 用法：node tests/v2_b32_unit.js
// 用法：node tests/v2_b10_unit.js
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

  const e=ev('ev_mingxuan_tutor_intro'), les=ev('ev_tutor_lesson'); check('1. 事件在：ev_mingxuan_tutor_intro（校園、找明軒、大一下）、ev_tutor_lesson（出遊）',!!e&&!!les&&e.location==='campus'&&e.participants[0]==='classmate_mingxuan');
  const W3=termDay('Y1S2',3,2), at=(day,h,mem,stage)=>{ fresh(day,h,'campus',{}); SOCIAL.meet('classmate_mingxuan','campus'); if(mem) SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY','x'); return EVENTS.check(e); };
  const r={ok:at(W3,16,true),w2:at(termDay('Y1S2',2,2),16,true),noMem:at(W3,16,false),eve:at(W3,19,true),sat:at(termDay('Y1S2',3,6),16,true)};
  check('2. 第 3 週起、平日 15:30～18:00、SAW_HIM_STUDY 才有（第 2 週、沒記憶又不熟、晚上、週六沒有）',r.ok&&!r.w2&&!r.noMem&&!r.eve&&!r.sat,JSON.stringify(r));
  at(W3,16,true); picks=['好']; await EVENTS.run(e); const L=lines();
  check('3. 台詞照 BB_96 3-2 四句；「好。」＝JOB_TUTOR、「很好。第一堂我陪你去認門。」',/欸，你要不要接一個家教？$/.test(L[0])&&/我學生的弟弟，國中，要補公民。我排不下了。$/.test(L[1])&&L.some(t=>/時薪我幫你談好了。不能比我低。$/.test(t))&&/很好。第一堂我陪你去認門。$/.test(L[L.length-1])&&G.flags.JOB_TUTOR&&G.flags.tutorFromDay===W3,JSON.stringify(L));
  STORY.phoneRules(GM); const qs=OUT.rec(G).filter(q=>/^tutor_/.test(q.id)); const q1=qs[0];
  check('4. 接了：排下一個週二 19:00 的家教（可以「這週不去」）',!!q1&&q1.day===termDay('Y1S2',4,2)&&q1.h===19&&q1.no==='這週不去'&&q1.ev==='ev_tutor_lesson',JSON.stringify(q1));
  const lesson=async()=>{ const q=OUT.rec(G).filter(x=>/^tutor_/.test(x.id)&&x.state==='planned').sort((a,b)=>a.day-b.day)[0]; said=[]; G.day=q.day; G.hour=18.8; await OUT.go(GM,q); G.hour=22; STORY.phoneRules(GM); return lines(); };
  const l1=await lesson(), l2=await lesson(), l3=await lesson(), l4=await lesson();
  check('5. 第一堂：國中生「老師，課本寫的跟我家發生的事不一樣，那要聽誰的？」＋旁白；第二堂柳丁旁白；第三堂「你不吃，我媽會以為你不喜歡她。」；第四堂只有字幕',l1.includes('國中生：老師，課本寫的跟我家發生的事不一樣，那要聽誰的？')&&l1.includes('你想起自己小時候，也是這樣翻書找答案。')&&l2.includes('（學生的媽媽切了一盤柳丁。你不好意思吃。）')&&l3.includes('國中生：你不吃，我媽會以為你不喜歡她。')&&!l4.some(t=>/柳丁|課本/.test(t))&&G.flags.TUTOR_N===4,JSON.stringify([l1,l2,l3,l4]));
  /* 我先想想 */
  { at(W3,16,true); picks=['想想']; await EVENTS.run(e); const L2=lines(); const d0=CALENDAR.dateOf(W3); const mEnd=W3+([31,28,31,30,31,30,31,31,30,31,30,31][d0.m-1]-d0.d);
    check('6. 「我先想想。」：「好。名額幫你留到月底。」、沒有 JOB_TUTOR',/好。名額幫你留到月底。$/.test(L2[L2.length-1])&&!G.flags.JOB_TUTOR&&G.flags.tutorThinkDay===W3,JSON.stringify(L2));
    G.day=mEnd-7; G.hour=20.9; STORY.phoneRules(GM); G.hour=21.05; PHONE.tick(G); const M=G.msgs.filter(m=>m.th==='p:classmate_mingxuan'); const ask=M.find(m=>m.ask);
    check('7. 月底前一週 21:00 明軒私訊「家教的事，想好了嗎？」（可以回「好。」）',!!ask&&ask.text==='家教的事，想好了嗎？'&&ask.ask.opts[0].t==='好。',JSON.stringify(M.map(m=>m.text)));
    PHONE.answer(G,ask.ask.id,0); const wdAsk=G.msgs.find(m=>m.text==='你哪天方便？'&&m.ask); if(wdAsk) PHONE.answer(G,wdAsk.ask.id,1); STORY.phoneRules(GM);
    check('8. 回「好。」＝JOB_TUTOR →「你哪天方便？」（週二／週四，BB_161 ⑪）→ 選週四＝「很好。第一堂我陪你去認門。」、排週四的家教',G.flags.JOB_TUTOR&&!!wdAsk&&wdAsk.ask.opts.map(o=>o.t).join('／')==='週二。／週四。'&&G.flags.TUTOR_WD===4&&G.msgs.some(m=>m.text==='很好。第一堂我陪你去認門。')&&OUT.rec(G).some(q=>/^tutor_/.test(q.id)&&CALENDAR.dateOf(q.day).wd===4));
    at(W3,16,true); picks=['想想']; await EVENTS.run(e); G.day=mEnd+1; G.hour=12.5; STORY.phoneRules(GM); PHONE.tick(G);
    check('9. 沒回、過了月底：「名額給別人了。下次有，我再跟你說。」、TUTOR_GONE、沒有家教',G.msgs.some(m=>m.text==='名額給別人了。下次有，我再跟你說。')&&G.flags.TUTOR_GONE&&!G.flags.JOB_TUTOR&&!OUT.rec(G).some(q=>/^tutor_/.test(q.id))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

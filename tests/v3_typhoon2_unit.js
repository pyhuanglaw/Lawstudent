// 颱風假 T2（BB_110，大二上第 7 週週一 2026-10-19）：日曆、前一晚新聞、T2b 線上的自願討論（三個選項、XU_TYPHOON 兩週內的課前一句）、T2a 阿凱抱泡麵（宿舍房間 21:00 以後）——不需要瀏覽器。
// 修改前 10/19 不是颱風假、沒有這三件（全部失敗）。用法：node tests/v3_typhoon2_unit.js
// （2026-10-28 AA_519 5-3（企劃線 d75cd0228，NPC-STORY2-1028）：二十分鐘後的旁白「（二十分鐘後，阿凱全身濕，抱著一箱泡麵站在門口。）」改成「…站在門口，手上這次是一袋滷味。」（颱風夜不要三年同一個畫面）——第 4 項照新字查、舊字不在）
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
  const ty=STORY.dayOfKey('2026-10-19'); check('0. 2026-10-19 是颱風假（週一、大二上第 7 週）、停課',CALENDAR.typhoon(ty)&&!!CALENDAR.holiday(ty)&&CALENDAR.dateOf(ty).wd===1&&CALENDAR.termOf(ty).week===7);
  const ids=['ev_y2_typhoon_xu','ev_y2_xu_typhoon_front','ev_y2_typhoon_kai']; if(!ids.every(i=>ev(i))){ check('0. 三件在',false); console.log('FAILED '+fails); process.exit(1); }
  global.GAME=GM; const tick=()=>{ said=[]; return EVENTS.tick(0.1); }, wait=async()=>{ for(let i=0;i<50&&EVENTS.running;i++) await new Promise(r=>setTimeout(r,0)); };
  fresh(ty-1,20,'dorm',{ROOM_Y2:ty-43}); G.stage='law'; run(20,20.4); check('1. 前一晚 20:30 以前沒有新聞',!(G.msgs||[]).some(m=>m.text==='明天停止上班上課。'&&m.tag==='ty2_news'));
  run(20.5,20.6); check('1. 前一晚 20:30 新聞「明天停止上班上課。」',(G.msgs||[]).some(m=>m.text==='明天停止上班上課。'));
  // T2b
  G.day=ty; G.weekday=1; G.hour=8.5; check('2. 9:00 以前不演',!tick());
  G.hour=9.1; picks=['進去聽']; tick(); await wait(); let L=lines();
  check('2. 9:00：通知、許教授兩句、畫面；「進去聽」三句、XU_TYPHOON',L[0]==='（早上九點，線上會議的通知）'&&/今天停課，所以這不是上課。$/.test(L[1])&&/沒有。這就是重點。$/.test(L[L.length-1])&&SOCIAL.has('prof_xu','XU_TYPHOON'),JSON.stringify(L));
  said=[]; await CLS.beforeClassEvent(GM,{c:{id:'admin_law'},room:{zone:'classroom'}}); check('2. 同一天沒有課前那句（停課）',!said.length);
  G.day=ty+21; G.weekday=1; said=[]; await CLS.beforeClassEvent(GM,{c:{id:'admin_law'},room:{zone:'classroom'}}); check('2. 期中考後第一堂行政法（11/9；AA_374 第 13 項，原本 11/2 期中考那天）：「颱風那天來討論的同學，今天坐前面。」',/颱風那天來討論的同學，今天坐前面。$/.test((lines()[0]||'')),JSON.stringify(lines()));
  fresh(ty,9.5,'dorm',{}); G.stage='law'; picks=['私訊柏翰']; tick(); await wait(); const B=txt('p:classmate_bohan');
  check('3. 私訊柏翰：四則照稿（祐廷兩則、柏翰兩則；柏翰最後一則照 AB65-3／AA_211 附錄 A 柏翰一列「他也穿襯衫。」）',JSON.stringify(B)===JSON.stringify(['player:你為什麼穿襯衫','classmate_bohan:因為是上課。','player:教授說不是上課。','classmate_bohan:他也穿襯衫。']),JSON.stringify(B));
  fresh(ty,9.5,'dorm',{}); G.stage='law'; picks=['繼續睡']; tick(); await wait(); check('3. 不進去：柏翰「教授點名了，我說你可能在睡覺。」（AB65-3：AA_211 附錄 A 柏翰一列）',txt('p:classmate_bohan').includes('classmate_bohan:教授點名了，我說你可能在睡覺。'));
  fresh(ty+7,9.5,'dorm',{}); G.stage='law'; check('3. 別天不演',!tick());
  // T2a
  fresh(ty,20.5,'dorm',{ROOM_Y2:ty-43}); G.stage='law'; check('4. 21:00 以前不演',!tick());
  G.hour=21.2; picks=['遞毛巾']; tick(); await wait(); L=lines(); const K=txt('p:kai');
  check('4. 阿凱四則、祐廷兩則（照稿，進對話串；AB65-3：BB_167 SC4 #12＋AA_211 附錄 B P10「就當這週的宵夜提早」）',JSON.stringify(K)===JSON.stringify(['kai:我要過去','player:外面在下雨','kai:下雨又怎樣 泡麵我都買了','kai:就當這週的宵夜提早','player:今天是週一','kai:所以咧 颱風天誰管星期幾']),JSON.stringify(K));
  check('4. 二十分鐘後的旁白（AA_519 5-3：一袋滷味）＋遞毛巾「先擦箱子啦，泡麵濕掉就完了。」（SC4 #12）、最後旁白「（阿哲和柏翰也各分到一包。學弟說他不吃辣。）」（AA_211 第 2 節【室友】）',L.includes('（二十分鐘後，阿凱全身濕，站在門口，手上這次是一袋滷味。）')&&!L.includes('（二十分鐘後，阿凱全身濕，抱著一箱泡麵站在門口。）')&&/先擦箱子啦，泡麵濕掉就完了。$/.test(L[L.length-2])&&L[L.length-1]==='（阿哲和柏翰也各分到一包。學弟說他不吃辣。）',JSON.stringify(L));
  check('4. 不認識方奕廷：沒有拍照那個選項',JSON.stringify(opts[opts.length-1])===JSON.stringify(['（遞毛巾）','「你可以傳訊息就好。」']),JSON.stringify(opts));
  fresh(ty,21.2,'dorm',{ROOM_Y2:ty-43}); G.stage='law'; meet('npc_fangyt'); picks=['拍照']; tick(); await wait(); check('4. 認識方奕廷：拍照傳給他→「他真的出門了？」「颱風天欸」（AA_211 附錄 B P9；原本「他比颱風還堅持。」）',txt('p:npc_fangyt').includes('npc_fangyt:他真的出門了？')&&txt('p:npc_fangyt').includes('npc_fangyt:颱風天欸'));
  fresh(ty,21.2,'campus',{ROOM_Y2:ty-43}); G.stage='law'; check('4. 不在宿舍房間不演',!tick());
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

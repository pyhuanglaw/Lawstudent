// v0 P2b 門口有人在揪（AA_154 2-5a；BB_105 P2b，BB-B 6d59df01）：週四會計下課 40%、跟去的五種去處與結束時間、L5b、E13 三種散場——不需要瀏覽器。
// 修改前沒有 ev_y0_p2b（全部失敗）。用法：node tests/v0_p2b_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], picks=[], rels=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,endCinematic(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(id,d){ rels.push([id,d]); },walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags,stage)=>{ G={v:3,day,hour,zone,stage:stage||'econ',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; picks=[]; rels=[]; };
const run=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const at=(day,hour)=>{ G.day=day; G.hour=hour; G.weekday=wdOf(day); run(); };
const TH=th=>PHONE.thread(G,th).map(m=>m.text);
(async()=>{
  const K=k=>STORY.dayOfKey(k), T7=K('2024-10-17'), T8=K('2024-10-24'), T9=K('2024-10-31'), T11=K('2024-11-14'), T12=K('2024-11-21'), T13=K('2024-11-28'), T14=K('2024-12-05'), T15=K('2024-12-12'), T17=K('2024-12-26'), S5=K('2025-03-20'), S6=K('2025-03-27');
  const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_p2b'); check('0. P2b 在、放在事件表最後（同一堂會計課的固定事件先演）',!!ev&&STORY_EVENTS.indexOf(ev)>STORY_EVENTS.findIndex(e=>e.id==='ev_y0_p1b2')); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  STORY.P2B_P=1; GM.money=d=>{ G.money+=d; };
  fresh(T7,15.2,'putong'); check('1. P2 還沒演過：不揪',!EVENTS.check(ev));
  fresh(T7,15.2,'putong',{P2_PICK:'river'}); check('1. W7 週四會計下課：揪（擲中）',EVENTS.check(ev));
  STORY.P2B_P=0; fresh(T7,15.2,'putong',{P2_PICK:'river'}); check('1. 沒擲中：不揪',!EVENTS.check(ev)); STORY.P2B_P=1;
  const due=d=>{ fresh(d,15.2,'putong',{P2_PICK:'home'}); return EVENTS.check(ev); };
  check('2. 期中考週（W8、W9）、期末（W17）不揪；Y0S2 W5 揪、W6（休學後）不揪',!due(T8)&&!due(T9)&&!due(T17)&&due(S5)&&!due(S6));
  fresh(T7,15.2,'putong',{P2_PICK:'river'}); OUT.plan(G,{id:'x_other',day:T7,h:19,place:'公館',title:'別的約',travelH:0.25}); check('3. 那天已經約了別的出遊：不揪',!EVENTS.check(ev));
  // 跟去（第一次＝滷味攤 food）
  fresh(T7,15.2,'putong',{P2_PICK:'river'}); SOCIAL.meet('kexin','x'); SOCIAL.meet('econ_pinyu','x'); SOCIAL.meet('econ_zhengxun','x'); const f0=SOCIAL.rel('econ_pinyu').fam, m0=G.money;
  picks=['跟去']; await EVENTS.run(ev); const L=said.map(x=>x.t);
  check('4. 韋綸一句（4 句之一）→ 跟去：滷味攤、19:30 結束、−80 元、經濟系朋友熟悉度 +1、P2B_COUNT＝1',/走啦/.test(L[0])&&L.includes('公館的滷味攤。可昕每一樣都夾一點，阿勳只夾豆干。品妤：『你們兩個是需求曲線的兩個極端。』')&&Math.abs(G.hour-19.5)<1e-6&&G.money===m0-80&&SOCIAL.rel('econ_pinyu').fam===f0+1&&G.flags.P2B_COUNT===1,JSON.stringify(L));
  check('4. W7 是期中前：沒有 E13 的選擇',!L.some(t=>/紅燈九十秒/.test(t)));
  check('4. 同一週不再揪',!EVENTS.check(ev));
  const last=G.flags.P2B_LAST;
  // 第二次（river）：Y0S1 第一次 river 接 L5b
  const snapF=()=>Object.assign({},G.flags); let FL=snapF();
  fresh(T11,15.2,'putong',Object.assign(FL,{P2B_SEEN:false}));
  picks=['跟去','拍什麼']; await EVENTS.run(ev); let L2=said.map(x=>x.t);
  check('5. 韋綸的句子不連續重複',G.flags.P2B_LAST!==last);
  check('5. 第二次＝河濱 river：17:00 結束、接 L5b（溫州街牽車、韋綸／品妤／阿勳三句）、L5B_DONE',L2.some(t=>/^騎腳踏車到河濱/.test(t))&&L2.includes('這條巷子很適合拍電影。')&&L2.includes('機率上，總有人在這裡拍過。')&&Math.abs(G.hour-17)<1e-6&&G.flags.L5B_DONE===true&&G.flags.P2B_COUNT===2,JSON.stringify(L2));
  check('5. river 沒有花錢、沒有 E13③（韋綸的腳踏車還沒演）',G.money===5000&&!L2.some(t=>/河會記得/.test(t)));
  // 第三次（night：總圖讀到九點）W12 期中後：E13 ② 女舍門口
  FL=snapF(); fresh(T12,15.2,'putong',Object.assign(FL,{P2B_SEEN:false}));
  picks=['跟去','陪大家走到最後','順路而已']; await EVENTS.run(ev); let L3=said.map(x=>x.t);
  check('6. 第三次＝總圖讀到九點（21:00）→ 期中後多一個選擇 → ② 女舍門口「我到了。」…「男宿在另一邊。」、E13_NIGHT、invite:kexin +1、回宿舍',L3.some(t=>/^大家去總圖讀到九點/.test(t))&&L3.includes('我到了。')&&L3.includes('……我發現了。只是沒說。')&&L3.includes('男宿在另一邊。')&&G.flags.E13_NIGHT===true&&EVENTS.habitCount({key:'invite:kexin'})===1&&G.zone==='dorm'&&Math.abs(G.hour-21)<1e-6,JSON.stringify(L3));
  // 第四次（夜市，night）：② 已經演過，不再問
  FL=snapF(); fresh(T13,15.2,'putong',Object.assign(FL,{P2B_SEEN:false}));
  picks=['跟去']; await EVENTS.run(ev); let L4=said.map(x=>x.t);
  check('7. 第四次＝夜市（21:30、−80）；night 的 E13 演過了，不再問',L4.some(t=>/^先各自去讀書/.test(t))&&Math.abs(G.hour-21.5)<1e-6&&G.money===5000-80&&!L4.includes('我到了。'),JSON.stringify(L4));
  // 第六次（food，W15）：E13 ① 公館的路口
  FL=snapF(); FL.P2B_COUNT=5; fresh(T15,15.2,'putong',Object.assign(FL,{P2B_SEEN:false}));
  picks=['跟去','陪大家走到最後','現在']; await EVENTS.run(ev); let L6=said.map(x=>x.t);
  check('8. food（期中後）→ ① 公館的路口「紅燈九十秒。」→「現在已經在用了。」、E13_FOOD',L6.includes('紅燈九十秒。')&&L6.includes('現在已經在用了。')&&G.flags.E13_FOOD===true,JSON.stringify(L6));
  // 選「先回去了。」＝沒有 E13
  FL=snapF(); FL.P2B_COUNT=5; delete FL.E13_FOOD; fresh(T14,15.2,'putong',Object.assign(FL,{P2B_SEEN:false}));
  picks=['跟去','先回去了']; await EVENTS.run(ev); check('8. 選「先回去了。」：不演、E13_FOOD 沒記',!said.some(x=>x.t==='紅燈九十秒。')&&!G.flags.E13_FOOD);
  // 今天先回去
  FL=snapF(); fresh(T14,15.2,'putong',Object.assign(FL,{P2B_SEEN:false,P2B_WK:null})); const c0=G.flags.P2B_COUNT|0;
  picks=['今天先回去']; await EVENTS.run(ev); check('9. 「今天先回去。」→ 韋綸「那下次！」、次數不變、時間不跳',said.some(x=>x.t==='那下次！')&&(G.flags.P2B_COUNT|0)===c0&&Math.abs(G.hour-15.2)<1e-6&&!EVENTS.check(ev));
  // 存讀檔
  const snap=JSON.parse(JSON.stringify(G)); check('10. 存讀檔：P2B_COUNT、E13_* 都是一般旗標',snap.flags.P2B_COUNT===G.flags.P2B_COUNT&&snap.flags.P2B_SEEN===true);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

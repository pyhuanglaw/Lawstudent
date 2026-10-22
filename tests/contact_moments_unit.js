// 聯絡方式的劇情時刻（AA_124 1-7 第 1 點、AA_70 第 2 節；AA 2026-10-14 第②級）：在那個時刻對方說那一句、拿到聯絡方式（手機多一則「加了…的聯絡方式」）；
// 已經有聯絡方式的不再說。不需要瀏覽器：
//   1. 芯慈「借筆記」：借給她（兩個分支）→「筆記還你的時候要找你。」＋聯絡方式；不借＝沒有；
//   2. 柏翰「你考幾分」（期中放榜）：結尾「考古題我晚上傳給你。」＋聯絡方式（三個分支都有）；
//   3. Alison「傅鐘旁邊的早餐」：坐下來一起吃＝「欸你有沒有群組？沒有？我拉你。」＋聯絡方式；趕上課＝沒有；
//   4. 已經有聯絡方式：那一句不說。修正前（事件裡沒有這幾句）這個測試會失敗。
//   5. 語彤「雨天之後在麵店」：她把手機推過來「傘的事。……你的聯絡方式。」＋傘給她「我還你傘的時候要找你。」／其他「下次下雨的時候找你。」；沒有雨天、已經有的不說。用法：node tests/contact_moments_unit.js
// 用法：node tests/v1_batch6_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], caps=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,t)=>{ caps.push(t); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; };
const evOf=id=>STORY_EVENTS.find(e=>e.id===id);
async function play(id,pickList,pre){ fresh(30,10,'campus',{met_yu:true}); if(pre) pre(); picks=pickList.slice(); await EVENTS.runLines(evOf(id).dialogue,evOf(id)); return said.map(s=>s.t); }
(async()=>{
  // 1 芯慈
  let L=await play('ev_xinci_notes',[0]);
  check('1. 芯慈：借給她（「可以，給。」）→「筆記還你的時候要找你。」＋聯絡方式',L.includes('筆記還你的時候要找你。')&&INV.hasContact(G,'classmate_xinci'),L.join('｜'));
  L=await play('ev_xinci_notes',[1]);
  check('1. 芯慈：「我的筆記很亂」也借了 → 同一句＋聯絡方式',L.includes('筆記還你的時候要找你。')&&INV.hasContact(G,'classmate_xinci'),L.join('｜'));
  L=await play('ev_xinci_notes',[2]);
  check('1. 芯慈：不借 → 沒有那一句、沒有聯絡方式',!L.includes('筆記還你的時候要找你。')&&!INV.hasContact(G,'classmate_xinci'),L.join('｜'));
  // 2 柏翰
  for(const k of [0,1,2]){ L=await play('ev_bohan_score',[k]);
    check('2. 柏翰「你考幾分」第 '+(k+1)+' 個選項：結尾「考古題我晚上傳給你。」（AA_372 第 16 項，原本「你的聯絡方式。考古題要傳給你。」）＋聯絡方式',L[L.length-1]==='考古題我晚上傳給你。'&&INV.hasContact(G,'classmate_bohan'),L.slice(-2).join('｜')); }
  // 3 Alison
  L=await play('ev_yu_breakfast',[0]);
  check('3. Alison：坐下來一起吃 →「欸你有沒有群組？沒有？我拉你。」＋聯絡方式',L.includes('欸你有沒有群組？沒有？我拉你。')&&INV.hasContact(G,'yu'),L.join('｜'));
  L=await play('ev_yu_breakfast',[1]);
  check('3. Alison：趕上課 → 沒有那一句、沒有聯絡方式',!L.includes('欸你有沒有群組？沒有？我拉你。')&&!INV.hasContact(G,'yu'),L.join('｜'));
  // 5 語彤（AA_70 第 2 節）：雨天之後在麵店
  const rain=(tag)=>()=>{ G.events.done.ev_rain_library_door=1; SOCIAL.remember('heroine_03','FIRST_MET','雨天'); if(tag) SOCIAL.remember('heroine_03',tag,'雨天總圖門口'); };
  L=await play('ev_noodle_yutong',[0],rain('HELPED'));
  check('5. 語彤：雨天把傘給她（HELPED）→ 麵店「（她把手機推過來。）」「傘的事。……你的聯絡方式。」「我還你傘的時候要找你。」＋聯絡方式',L.indexOf('（她把手機推過來。）')>=0&&L[L.indexOf('（她把手機推過來。）')+1]==='傘的事。……你的聯絡方式。'&&L[L.indexOf('（她把手機推過來。）')+2]==='我還你傘的時候要找你。'&&!L.includes('下次下雨的時候找你。')&&INV.hasContact(G,'heroine_03'),L.join('｜'));
  check('5. 語彤：給過傘的人不會再被問「很少在這裡看到你。你都幾點吃飯？」（只給兩種傘的記憶都沒有的人）',!L.includes('很少在這裡看到你。你都幾點吃飯？'),L.join('｜'));
  L=await play('ev_noodle_yutong',[0],rain('SHARED_UMBRELLA'));
  check('5. 語彤：雨天一起撐傘 →「傘的事。……你的聯絡方式。」「下次下雨的時候找你。」＋聯絡方式',L.includes('傘的事。……你的聯絡方式。')&&L.includes('下次下雨的時候找你。')&&!L.includes('我還你傘的時候要找你。')&&INV.hasContact(G,'heroine_03'),L.join('｜'));
  L=await play('ev_noodle_yutong',[0],rain(null));
  check('5. 語彤：雨天其他選項（沒有傘的記憶）→「很少在這裡看到你。……」「下次下雨的時候找你。」＋聯絡方式',L.includes('很少在這裡看到你。你都幾點吃飯？')&&L.includes('下次下雨的時候找你。')&&INV.hasContact(G,'heroine_03'),L.join('｜'));
  L=await play('ev_noodle_yutong',[2],rain('HELPED'));
  check('5. 語彤：選「今天忙嗎？我改天再來。」也已經拿到（她先推過來）',L.includes('我還你傘的時候要找你。')&&INV.hasContact(G,'heroine_03'),L.join('｜'));
  L=await play('ev_noodle_yutong',[0],()=>{ SOCIAL.remember('heroine_03','FIRST_MET','麵店'); });
  check('5. 語彤：沒有雨天（先在別的地方認識）→ 不推手機、沒有聯絡方式',!L.includes('（她把手機推過來。）')&&!L.includes('傘的事。……你的聯絡方式。')&&!INV.hasContact(G,'heroine_03'),L.join('｜'));
  L=await play('ev_noodle_yutong',[0],()=>{ rain('HELPED')(); INV.rec(G); G.contacts.heroine_03=5; });
  check('5. 語彤：已經有聯絡方式 → 不推手機',!L.includes('（她把手機推過來。）')&&!L.includes('我還你傘的時候要找你。'),L.join('｜'));
  // 4 已經有聯絡方式
  L=await play('ev_bohan_score',[0],()=>{ INV.rec(G); G.contacts.classmate_bohan=5; });
  check('4. 已經有柏翰的聯絡方式：那一句不說',!L.includes('考古題我晚上傳給你。'),L.slice(-2).join('｜'));
  const msg=(await play('ev_xinci_notes',[0]),(G.msgs||[]).map(m=>m.text));
  check('4. 拿到聯絡方式時手機多一則「加了吳芯慈的聯絡方式。」',msg.some(t=>/加了.*的聯絡方式/.test(t)),msg.join('｜'));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });

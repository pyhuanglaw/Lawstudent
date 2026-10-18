// v0 E04 微積分初體驗、E07 社團博覽會、E09 小福的午餐（BB_104 8b-1～8b-3；AA_154 第 98、100、102 行）——不需要瀏覽器。
//   E04：第 2 週週三的微積分（課堂裡），三個選項；沒去就沒有。E07：9/18～9/20 10:00～17:00 走到椰林的攤位，Y0_CLUB；沒去＝9/21 12:30 可昕私訊選社團。
//   E09：第 4 週週一～週四中午在校園，切到小福。修改前：沒有 ev_y0_e07（第 0 項失敗）。用法：node tests/v0_e07_unit.js
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
  const D18=STORY.dayOfKey('2024-09-18'), D20=STORY.dayOfKey('2024-09-20'), D21=STORY.dayOfKey('2024-09-21'), D23=STORY.dayOfKey('2024-09-23'), D27=STORY.dayOfKey('2024-09-27'), D11=STORY.dayOfKey('2024-09-11');
  const e7=STORY_EVENTS.find(e=>e.id==='ev_y0_e07'), e9=STORY_EVENTS.find(e=>e.id==='ev_y0_e09');
  check('0. ev_y0_e07、ev_y0_e09、CLS.e04Due 都在',!!e7&&!!e9&&typeof CLS.e04Due==='function');
  if(!e7||!e9||typeof CLS.e04Due!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  const ck=(e,day,h)=>{ fresh(day,h,'campus'); return EVENTS.check(e); };
  check('1. E07：9/18（三）～9/20（五）10:00～17:00；9/17、9/21、9/18 09:30、17:30 不行；法律系不行',ck(e7,D18,11)&&ck(e7,D20,16.5)&&!ck(e7,D18-1,11)&&!ck(e7,D21,11)&&!ck(e7,D18,9.5)&&!ck(e7,D18,17.5)&&!(()=>{ fresh(D18,11,'campus',{},'law'); return EVENTS.check(e7); })());
  check('1. E07 要走到椰林的攤位那一排（near）',!!e7.near&&e7.near.r>=10);
  { fresh(D18,11,'campus'); picks=['經濟系的教室','羽球社']; await EVENTS.run(e7); const L=said.map(x=>x.t);
    check('1. E07 原文：韋綸六張傳單、品妤四十八小時、可昕探頭、劇社社員、「你說。」',L[0]==='（手上已經有六張傳單）我每一攤都要看。'&&L[1]==='（品妤在看每一攤貼的社費。）'&&L[4]==='（看你）你說。',JSON.stringify(L.slice(0,5)));
    check('1. 地點「經濟系的教室。」→「好，我們是兩條供給曲線。」全場安靜',L.includes('好，我們是兩條供給曲線。')&&L.includes('全場安靜。')&&!L.includes('一個社員演一隻鵝，追著另一個人跑。'));
    check('1. 選羽球社：Y0_CLUB＝badminton、可昕「羽球社好像都早上練。你要早起了。」',G.flags.Y0_CLUB==='badminton'&&L[L.length-1]==='羽球社好像都早上練。你要早起了。',L[L.length-1]);
    check('1. 每句 40 字以內',L.every(t=>t.length<=40));
    G.events.done.ev_y0_e07=1; at(D21,13); check('1. 去過博覽會：9/21 沒有「博覽會我每一攤都看了，一攤都沒加。你呢？」',!PHONE.sent(G,'y0_e07_missed')); }
  // 沒去
  { fresh(D20,18,'dorm'); run(); check('2. 沒去：9/20 晚上還沒有私訊（E06 她的第一則私訊在這之前或當晚）',!PHONE.sent(G,'y0_e07_missed'));
    at(D21,12.6); const m=PHONE.thread(G,'p:kexin').find(x=>x.text==='博覽會我每一攤都看了，一攤都沒加。你呢？');
    check('2. 9/21 12:30 可昕私訊「博覽會我每一攤都看了，一攤都沒加。你呢？」（AA_293 第 1 節：她不加社團）、四個選項',!!m&&m.ask&&m.ask.opts.map(o=>o.t).join('/')==='吉他社/登山社/羽球社/不參加',JSON.stringify(m&&m.ask&&m.ask.opts.map(o=>o.t)));
    check('2. 回「不參加」：Y0_CLUB＝none、她回「也好。那我們兩個下課都很閒。」',m.ask.opts[3].set.Y0_CLUB==='none'&&m.ask.opts[3].say[0].text==='也好。那我們兩個下課都很閒。'); }
  // E09
  check('3. E09：第 4 週週一～週四 12:10～13:15；週五（9/27 教師節連假）、第 5 週、11:30 不行',ck(e9,D23,12.3)&&ck(e9,D23+3,13)&&!ck(e9,D27,12.3)&&!ck(e9,D23+7,12.3)&&!ck(e9,D23,11.5));
  { fresh(D23,12.3,'campus'); picks=['妳吃什麼']; const m0=G.money; await EVENTS.run(e9); const L=said.map(x=>x.t);
    check('3. E09（BB_179 段A #58～#60）：品妤只算一次錢，沒有阿勳「四十元」、可昕「放棄了」',L[0]==='（看你的餐盤）雞腿便當加紅茶，九十五喔。隔壁的滷肉飯才五十五。'&&!L.some(t=>/四十元|你剛剛放棄了什麼|跟我們吃一樣的東西/.test(t)),JSON.stringify(L.slice(0,3)));
    check('3. 「妳吃什麼？」→ 我自己帶便當、可昕夾走一塊蛋（段A #62～#64：沒有「零元」「邊際成本是零」）',JSON.stringify(L.slice(-2))===JSON.stringify(['我自己帶便當。','（她打開便當盒。可昕伸筷子夾走一塊蛋，品妤沒說話，把便當往自己那邊移了一點。）']),JSON.stringify(L.slice(-3))); }
  // E04（課堂）
  { const itemFor=week=>{ for(let d=-400;d<0;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y0S1'||t.week!==week) continue; const it=CLS.dayItems({day:d,hour:8,stage:'econ',flags:{}},d).find(x=>x.c.id==='calc_y0s1'&&!x.exam); if(it) return it; } return null; };
    const w2=itemFor(2), w3=itemFor(3); check('4. 微積分第 2 週是 9/11（三）',!!w2&&w2.day===D11);
    fresh(w2.day,w2.t0-0.05,'campus'); picks=['回頭看阿勳']; GM.caption=()=>{}; await CLS.attend(GM,w2,{inScene:true}); const L=said.map(x=>x.t);
    check('4. E04：老師叫「靠窗第三排，穿灰色的。上來寫。」→ 選「回頭看阿勳」→ 筆記本 → 答案對 → 韋綸睡著、阿勳「這是天分。」',L.includes('老師：靠窗第三排，穿灰色的。上來寫。')&&L.includes('阿勳已經寫完了，把筆記本轉過來給你看。')&&L.includes('老師：……好，答案對。下去吧。')&&L.some(t=>t.endsWith('（小聲）他第一分鐘就睡了。')),JSON.stringify(L.slice(0,9)));
    check('4. 只有一個選項的結果',!L.includes('老師：「誠實。下課前我們一起會。」')&&!L.some(t=>t.startsWith('寫到一半卡住')));
    said=[]; G.day=w3.day; G.hour=w3.t0-0.05; await CLS.attend(GM,w3,{inScene:true}); check('4. 第 3 週沒有 E04（沒去就沒有，不補）',!said.some(x=>x.t.includes('上來寫')));
    fresh(w3.day,w3.t0-0.05,'campus'); check('4. 第 2 週沒去：第 3 週不補 E04',CLS.e04Due(G,w3)===false); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

// 交接包 v1（大一上）第 7 批：出遊（離開 3D 地圖的約）＋可昕 K1 導遊（BB_95 9-1）——不需要瀏覽器。
// 檢查（修改前都會失敗：沒有 OUT、沒有 K1 的邀約與事件）：
//   出遊：排進 G.outings、同一個 id 只排一次；約好的時間前 15 分鐘起、後 45 分鐘內問「出發」（之前、之後都不問）；「晚一點」20 分鐘後再問；
//     「不去了」、過了時間＝missed（不演、會呼叫事件的 outingMissed）；出發：轉場（標題卡）→ 約好的時間抵達 → 演事件（深色底）→ 時間照 hours 往後 → 「回到台大。」；
//     舊存檔沒有 outings 照常。
//   K1：第 3 週週五 19:30 可昕傳「週末來政大？我當導遊。」（兩個回覆）；答應＝排週六 14:00 去政大；週六下午才答應＝排下一個週六；不行＝不排；
//     演出：三個場景（政大・校門口、山下的小吃街、停車場，2D 背景還沒有圖＝深色底）、台詞照 BB_95 9-1 原文、影子三選項（不記憶）、小吃街三選項（K1_ORDER）、
//     NCCU_VISITED、記憶 OUR_SHOP_FIRST；只一次。
// 用法：node tests/v1_batch7_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|OUT|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let bgs=[]; global.ADV={active:false,preload(){},begin(o){ this.active=true; bgs.push('begin:'+(o&&o.background)); },end(){ this.active=false; },log(){},speaker(){},cg(){},setBg(m){ bgs.push(typeof m==='object'?'img':m); }};
global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], caps=[], titles=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,t)=>{ caps.push(t); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ titles.push(a+(b?'｜'+b:'')); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,dating_kexin:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; caps=[]; titles=[]; bgs=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const lines=()=>said.map(s=>s.t);
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const tickOut=async()=>{ const p=OUT.tick(GM); if(p) return await p; return null; };
(async()=>{
  const FRI3=STORY.termDay('Y1S1',3,5), SAT3=FRI3+1;
  check('日曆：第 3 週週五＝第 '+FRI3+' 天（9/19）、週六＝第 '+SAT3+' 天',FRI3===3&&CALENDAR.dateOf(SAT3).wd===6);
  /* ---------- 出遊的時間窗 ---------- */
  { fresh(10,9,'campus'); check('舊存檔沒有 outings：OUT.rec 建立空的、tick 不出錯',OUT.due(G)===null&&Array.isArray(G.outings)&&G.outings.length===0);
    const o={id:'t1',ev:'ev_kexin_tour_nccu',day:10,h:14,place:'政大',title:'測試',travelH:0.5};
    check('排一次；同一個 id 不會排第二次',OUT.plan(G,o)===true&&OUT.plan(G,o)===false&&G.outings.length===1);
    const at=h=>{ G.hour=h; return !!OUT.due(G); };
    check('該出發的時間（14:00 減車程 30 分鐘）前 15 分鐘起、約好的時間後 45 分鐘內才問（13:12 不問、13:15 問、14:44 問、14:46 不問）',!at(13.2)&&at(13.25)&&at(14.73)&&!at(14.77)); }
  /* ---------- 晚一點、不去了、過了時間 ---------- */
  { fresh(10,13.8,'campus'); OUT.plan(G,{id:'t2',ev:'ev_kexin_tour_nccu',day:10,h:14,place:'政大',title:'去政大找可昕',travel:'開車約 30 分鐘'}); picks=['晚一點'];
    const r=await tickOut(); const q=OUT.get(G,'t2');
    check('問的選項：「出發：去政大找可昕」（寫地點、時間、車程）、「晚一點」、「不去了」',r==='later'&&opts[0][0]==='出發：去政大找可昕'&&opts[0].length===3&&opts[0][1].startsWith('晚一點')&&opts[0][2]==='不去了',JSON.stringify(opts[0]));
    G.hour=14.0; const a=!!OUT.due(G); G.hour=14.14; const b=!!OUT.due(G);
    check('「晚一點」：20 分鐘內不再問，20 分鐘後再問',!a&&b,JSON.stringify({a,b,ask:q.ask}));
    picks=['不去了']; let missedCalled=0; const ev=STORY_EVENTS.find(e=>e.id==='ev_kexin_tour_nccu'); const keep=ev.outingMissed; ev.outingMissed=()=>{ missedCalled++; };
    const r2=await tickOut(); ev.outingMissed=keep;
    check('「不去了」＝missed、不演、呼叫 outingMissed（例如之後傳照片）',r2==='no'&&q.state==='missed'&&!G.events.done.ev_kexin_tour_nccu&&missedCalled===1&&said.length===0);
    fresh(10,13,'campus'); OUT.plan(G,{id:'t3',ev:'ev_kexin_tour_nccu',day:10,h:14,place:'政大',title:'x'}); G.hour=15.2; const r3=await tickOut();
    check('過了時間（睡過頭、在忙）：missed、沒有問、不演',r3===null&&OUT.get(G,'t3').state==='missed'&&opts.length===0&&!G.events.done.ev_kexin_tour_nccu); }
  /* ---------- K1 的邀約 ---------- */
  { fresh(FRI3,8,'campus'); run(8,21); const m=G.msgs.filter(x=>x.tag==='kx_tour_ask');
    check('K1：第 3 週週五 19:30 可昕傳「週末來政大？我當導遊。」，可以回（兩個選項）',m.length===1&&m[0].text==='週末來政大？我當導遊。'&&m[0].th==='p:kexin'&&Math.abs(m[0].h-19.5)<0.06&&m[0].ask&&m[0].ask.opts.length===2,JSON.stringify(m.map(x=>[x.day,x.h,x.text])));
    fresh(FRI3-1,20,'campus'); run(20,23); check('K1：週四還沒傳',!G.msgs||!G.msgs.some(x=>x.tag==='kx_tour_ask'));
    fresh(FRI3,8,'campus',{dating_kexin:false}); run(8,21); check('K1：沒有在交往的存檔不傳（大一上所有玩家都在交往，這是保險）',!G.msgs||!G.msgs.some(x=>x.tag==='kx_tour_ask'));
    fresh(FRI3,8,'campus'); run(8,20); const id=G.msgs.find(x=>x.tag==='kx_tour_ask').ask.id; PHONE.answer(G,id,0); run(20,20.2);
    const o=OUT.get(G,'kx_tour'); check('K1：回「好，週六下午過去。」＝排週六 14:00 去政大（開車約 30 分鐘）',!!o&&o.day===SAT3&&o.h===14&&o.place==='政大'&&o.ev==='ev_kexin_tour_nccu'&&o.state==='planned',JSON.stringify(o));
    fresh(FRI3,8,'campus'); run(8,20); const id2=G.msgs.find(x=>x.tag==='kx_tour_ask').ask.id; PHONE.answer(G,id2,1); run(20,20.2);
    check('K1：回「這週末不行。」＝不排',!OUT.get(G,'kx_tour')&&G.flags.KX_TOUR_NO===true);
    fresh(FRI3,8,'campus'); run(8,20); const m3=G.msgs.find(x=>x.tag==='kx_tour_ask'); const F0=G.flags, msgs=G.msgs, ph=G.phone; fresh(SAT3,15,'campus',F0); G.msgs=msgs; G.phone=ph; PHONE.answer(G,m3.ask.id,0); run(15,15.2);
    const o2=OUT.get(G,'kx_tour'); check('K1：週六下午才回「好」＝排下一個週六',!!o2&&o2.day===SAT3+7&&CALENDAR.dateOf(o2.day).wd===6,JSON.stringify(o2)); }
  /* ---------- K1 出發、演出 ---------- */
  { const play=async(pk)=>{ fresh(SAT3,13.5,'dorm'); OUT.plan(G,{id:'kx_tour',ev:'ev_kexin_tour_nccu',day:SAT3,h:14,place:'政大',title:'去政大找可昕',travel:'開車約 30 分鐘',travelH:0.5}); picks=['出發'].concat(pk); const r=await tickOut(); return r; };
    const r=await play(['影子不會講話','她推薦']); const L=lines();
    check('出發：轉場（標題卡「去政大找可昕｜開車約 30 分鐘」）、深色底開始',r==='go'&&titles[0]==='去政大找可昕｜開車約 30 分鐘'&&bgs[0]==='begin:dark',JSON.stringify({titles,bgs:bgs.slice(0,3)}));
    check('三個場景：政大・校門口 → 政大・山下的小吃街 → 政大・停車場（字幕；2D 背景還沒有圖＝深色底）',JSON.stringify(caps.filter(c=>c.startsWith('政大')))==='["政大・校門口","政大・山下的小吃街","政大・停車場"]'&&bgs.filter(b=>b==='dark').length>=3,JSON.stringify({caps,bgs}));
    const K1=['校門口。她在揮手，只戴一邊的耳環，今天是一顆小骰子。','歡迎來到政大。我是今天的導遊。','我在這裡念了三個禮拜，所以比你懂這裡三個禮拜。','她指了左邊、右邊、後面。','法學院。山。也是山。政大的地圖重點就是：山。','假設你的影子先到政大，它可以幫你點餐嗎？'];
    check('校門口：開場六句（BB_95 9-1 原文，舞台說明改旁白）',JSON.stringify(L.slice(0,6))===JSON.stringify(K1),JSON.stringify(L.slice(0,6)));
    check('影子三個選項（原文）',JSON.stringify(opts[1])===JSON.stringify(['「可以，它跟我點一樣的。」','「不行，影子不會講話。」','「它會先幫妳點。」']),JSON.stringify(opts[1]));
    check('選「不行」：「那它比你安靜。我考慮一下要帶哪一個。」',L.includes('那它比你安靜。我考慮一下要帶哪一個。'));
    check('小吃街三個選項；選她推薦的：「好，信任導遊。」＋「她點了兩碗酸辣湯餃。」、K1_ORDER=hers',JSON.stringify(opts[2])===JSON.stringify(['（吃她推薦的）','（自己挑一家）','「妳幫我點。」'])&&L.includes('好，信任導遊。')&&L.includes('她點了兩碗酸辣湯餃。')&&G.flags.K1_ORDER==='hers',JSON.stringify(opts[2]));
    check('停車場結尾：「以後你開車來找我，我負責選宵夜。」「……這是分工，不是命令。」',L.slice(-2).join('|')==='以後你開車來找我，我負責選宵夜。|……這是分工，不是命令。',JSON.stringify(L.slice(-2)));
    check('影響：NCCU_VISITED、可昕的記憶 OUR_SHOP_FIRST；影子的回答不記（沒有別的旗標）',G.flags.NCCU_VISITED===true&&SOCIAL.has('kexin','OUR_SHOP_FIRST')&&!Object.keys(G.flags).some(k=>/SHADOW|K1_SHADOW/.test(k)));
    check('時間：13:30 出發、14:00 抵達、演 3 小時 → 17:00；「回到台大。」',Math.abs(G.hour-17)<0.01&&caps[caps.length-1]==='回到台大。',JSON.stringify({h:G.hour,last:caps[caps.length-1]}));
    check('只一次（出遊 done、事件演過）',OUT.get(G,'kx_tour').state==='done'&&G.events.done.ev_kexin_tour_nccu===1);
    for(const [a,b,want,flag] of [['跟我點一樣','自己挑',['那它也要付錢。……好，影子請客。','你挑的那家，我還沒吃過。……好，今天換你當導遊。'],'mine'],['先幫妳點','幫我點',['……這題你答得太快了。','她先走進校門。','讓我點的人，第三次老闆就會記得你。'],'let_her']]){
      await play([a,b]); const Lx=lines(); check('選「'+a+'」「'+b+'」：'+JSON.stringify(want)+'、K1_ORDER='+flag,want.every(t=>Lx.includes(t))&&G.flags.K1_ORDER===flag,JSON.stringify(Lx.slice(6,10))); }
    fresh(SAT3,13.8,'dorm'); OUT.plan(G,{id:'kx_tour',ev:'ev_kexin_tour_nccu',day:SAT3,h:14,place:'政大',title:'去政大找可昕',travelH:0.5}); G.hour=14.5; picks=['出發']; await tickOut();
    check('晚一點才出發（14:30）：抵達 15:00、演完 18:00',Math.abs(G.hour-18)<0.01,String(G.hour)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

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
const ADV_CG_FILE=id=>{ const m=fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8').match(new RegExp(id+":\\{file:'([^']+)'")); return m&&m[1]; };   /* adv3d.js 的 CG_REGISTRY（不載入 adv3d，靜態讀）*/
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|OUT|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let bgs=[], cgs=[]; global.ADV={active:false,preload(){},begin(o){ this.active=true; bgs.push('begin:'+(o&&o.background)); },end(){ this.active=false; },log(){},speaker(){},cg(id){ cgs.push(id); },setBg(m){ bgs.push(typeof m==='object'?'img':m); }};
global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], caps=[], titles=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,t)=>{ caps.push(t); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ titles.push(a+(b?'｜'+b:'')); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,dating_kexin:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; caps=[]; titles=[]; bgs=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const lines=()=>said.map(s=>s.t);
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const tickOut=async()=>{ const p=OUT.tick(GM); if(p) return await p; return null; };
(async()=>{
  const FRI3=STORY.termDay('Y1S1',3,5), SAT3=FRI3+1;
  check('日曆：第 3 週週五＝第 '+FRI3+' 天（9/19）、週六＝第 '+SAT3+' 天',FRI3===3&&CALENDAR.dateOf(SAT3).wd===6);
  /* ---------- 出遊的時間窗 ---------- */
  { fresh(10,9,'campus'); check('舊存檔沒有 outings：OUT.rec 建立空的、tick 不出錯',OUT.due(G)===null&&Array.isArray(G.outings)&&G.outings.length===0);
    const o={id:'t1',ev:'ev_kexin_visits_ntu',day:10,h:14,place:'木柵大學',title:'測試',travelH:0.5};   /* 原本用 K1 導遊那一場（CANON-NO-ECON-1112 第三批拿掉），改用她來找你那一場 */
    check('排一次；同一個 id 不會排第二次',OUT.plan(G,o)===true&&OUT.plan(G,o)===false&&G.outings.length===1);
    const at=h=>{ G.hour=h; return !!OUT.due(G); };
    check('該出發的時間（14:00 減車程 30 分鐘）前 15 分鐘起、約好的時間後 45 分鐘內才問（13:12 不問、13:15 問、14:44 問、14:46 不問）',!at(13.2)&&at(13.25)&&at(14.73)&&!at(14.77)); }
  /* ---------- 晚一點、不去了、過了時間 ---------- */
  { fresh(10,13.8,'campus'); OUT.plan(G,{id:'t2',ev:'ev_kexin_visits_ntu',day:10,h:14,place:'木柵大學',title:'去木柵大學找可昕',travel:'開車約 30 分鐘'}); picks=['晚一點'];
    const r=await tickOut(); const q=OUT.get(G,'t2');
    check('問的選項：「出發：去木柵大學找可昕」（寫地點、時間、車程）、「晚一點」、「不去了」',r==='later'&&opts[0][0]==='出發：去木柵大學找可昕'&&opts[0].length===3&&opts[0][1].startsWith('晚一點')&&opts[0][2]==='不去了',JSON.stringify(opts[0]));
    G.hour=14.0; const a=!!OUT.due(G); G.hour=14.14; const b=!!OUT.due(G);
    check('「晚一點」：20 分鐘內不再問，20 分鐘後再問',!a&&b,JSON.stringify({a,b,ask:q.ask}));
    picks=['不去了']; let missedCalled=0; const ev=STORY_EVENTS.find(e=>e.id==='ev_kexin_visits_ntu'); const keep=ev.outingMissed; ev.outingMissed=()=>{ missedCalled++; };
    const r2=await tickOut(); ev.outingMissed=keep;
    check('「不去了」＝missed、不演、呼叫 outingMissed（例如之後傳照片）',r2==='no'&&q.state==='missed'&&!G.events.done.ev_kexin_visits_ntu&&missedCalled===1&&said.length===0);
    fresh(10,13,'campus'); OUT.plan(G,{id:'t3',ev:'ev_kexin_visits_ntu',day:10,h:14,place:'木柵大學',title:'x'}); G.hour=15.2; const r3=await tickOut();
    check('過了時間（睡過頭、在忙）：missed、沒有問、不演',r3===null&&OUT.get(G,'t3').state==='missed'&&opts.length===0&&!G.events.done.ev_kexin_visits_ntu); }
  /* ---------- K1 導遊、K1b 外校室友的宵夜（CANON-NO-ECON-1112 第三批：這一項拿掉）---------- */
  { fresh(FRI3,8,'campus'); run(8,21); check('K1：第 3 週週五不再傳導遊的邀約（CANON-NO-ECON-1112 第三批：這一項拿掉）',!G.msgs||!G.msgs.some(x=>x.tag==='kx_tour_ask'||x.tag==='kx_tour_ask2'));
    check('K1、K1b 那兩場（CANON-NO-ECON-1112 第三批：這一項拿掉）',!STORY_EVENTS.some(e=>e.id==='ev_kexin_tour_nccu'||e.id==='ev_kexin_yule_pass'));
    check('數字：3→三、4→四、10→十、12→十二、20→二十',[3,4,10,12,20].map(STORY.zhNum).join(',')==='三,四,十,十二,二十'); }
  /* ---------- 中秋烤肉（A13）＋可昕 K3（BB_95 9-4）---------- */
  { const WED=STORY.termDay('Y1S1',5,3), SAT=STORY.termDay('Y1S1',5,6);
    check('中秋烤肉：第 5 週週六＝2025-10-04',CALENDAR.dateOf(SAT).key==='2025-10-04');
    fresh(WED,8,'campus'); run(8,22); const m=G.msgs.find(x=>x.tag==='bbq_ask');
    check('烤肉：第 5 週週三 21:00 阿哲揪（沒有桌遊團群組＝私訊）、兩個回覆',!!m&&m.th==='p:zhe'&&m.from==='zhe'&&Math.abs(m.h-21)<0.06&&m.ask.opts.length===2,JSON.stringify(m&&[m.th,m.text]));
    fresh(WED,8,'campus'); PHONE.join(G,'noodle_team','桌遊團'); run(8,22); const mg=G.msgs.find(x=>x.tag==='bbq_ask');
    check('烤肉：有桌遊團群組＝在群組揪',!!mg&&mg.th==='g:noodle_team');
    { const G0=G; G=JSON.parse(JSON.stringify(G0)); const m2=G.msgs.find(x=>x.tag==='bbq_ask'); G.day=SAT; G.hour=18.9; const open1=PHONE.askOpen(G,m2); G.hour=19.1; const open2=PHONE.askOpen(G,m2); G.day=SAT+100; const open3=PHONE.askOpen(G,m2); G=G0;
      check('烤肉的揪：週六 19:00 開始以前可以回（AA ace533a43「中秋烤肉，河濱，七點。」＝19:00）、之後就關（BB-C 10-21 P3：原本隔年一月還是「待回覆」）',open1&&!open2&&!open3); }
    PHONE.answer(G,mg.ask.id,0); run(22,22.2); const o=OUT.get(G,'bbq');
    check('烤肉：回「去。」＝排週六 19:00 河濱（「七點」）',!!o&&o.day===SAT&&o.h===19&&o.place==='河濱'&&o.ev==='ev_mid_autumn_bbq',JSON.stringify(o));
    const F1=Object.assign({},G.flags), msgs=G.msgs, ph=G.phone; fresh(SAT-1,8,'campus',F1); G.msgs=msgs; G.phone=ph; G.outings=[o]; run(8,20.5); const k=G.msgs.find(x=>x.tag==='kx_bbq_ask');
    check('K3：前一天（週五）20:00 可昕問「我們系也有烤肉。……你們的比較好玩嗎？」、兩個回覆（原文）',!!k&&k.day===SAT-1&&Math.abs(k.h-20)<0.06&&k.text==='我們系也有烤肉。……你們的比較好玩嗎？'&&JSON.stringify(k.ask.opts.map(q=>q.t))==='["來我們這邊。","妳去妳們系的。"]');
    { const F2=Object.assign({},G.flags), ms=G.msgs.slice(), p2=JSON.parse(JSON.stringify(G.phone)); PHONE.answer(G,k.ask.id,1); fresh(SAT,8,'campus',Object.assign({},G.flags)); G.msgs=ms; G.phone=p2; G.flags.KX_BBQ_NO=true; run(8,21); const c=G.msgs.filter(x=>x.tag==='kx_bbq_corn').map(x=>x.text);
      check('K3：「妳去妳們系的。」＝不再私訊烤玉米的照片（AA_503 9-3：改成可昕的動態第 2 則「我們的玉米比較好。」，去沒去都出，tests/aa503_feed_unit.js 第 9 段）',c.length===0,JSON.stringify(c)); }
    const playBBQ=async(flags,setup,pk)=>{ fresh(SAT,14.5,'campus',Object.assign({ZHE_CALLS_GE:true},flags||{}));   /* 已經有「哥」：不問「你幾年次的」（v1_batch12 測）*/ if(setup) setup(); OUT.plan(G,{id:'bbq',ev:'ev_mid_autumn_bbq',day:SAT,h:15,place:'河濱',title:'中秋烤肉',travel:'走過去約 15 分鐘',travelH:0.25}); picks=['出發'].concat(pk||[]); await tickOut(); return lines(); };
    let L=await playBBQ({},null,[]);
    check('烤肉（只認識阿哲）：河濱、「阿哲負責烤。」，以安、語彤、柏翰、方奕廷、可昕都不在',caps.includes('河濱')&&L.includes('阿哲負責烤。')&&!L.some(t=>/以安|語彤|柏翰|方奕廷|可昕來了|菜單/.test(t)),JSON.stringify(L));
    L=await playBBQ({met_yu:true},()=>{ for(const id of ['heroine_01','heroine_03','classmate_bohan','npc_fangyt']) SOCIAL.remember(id,'FIRST_MET',''); },[]);
    check('烤肉（大家都認識）：Alison 負責吃、以安的烤肉時間表、語彤阿姨醃的肉（YT-BBQ-WHY-1027 起一句換三行，AA_486 第 2 節）、柏翰的考古題被沒收、方奕廷講植物；阿哲「可以叫秀琴姨開一個烤肉的菜單嗎？」語彤「不行。她會真的開。」',['阿哲負責烤，Alison 負責吃。','以安帶了一張「烤肉時間表」。','語彤也來了，提著一盒秀琴姨醃的肉。前一個週末在茶屋，你跟她說過今天要烤肉。','秀琴姨叫我拿來的。她說人多的地方要有肉。','秀琴姨醃的肉，全場最好吃。','柏翰帶了考古題，被沒收了。','可以叫秀琴姨開一個烤肉的菜單嗎？','不行。她會真的開。'].every(t=>L.includes(t))&&L.some(t=>/方奕廷/.test(t)),JSON.stringify(L));
    L=await playBBQ({KX_BBQ_COME:true},null,['我女朋友','阿哲贏']);
    check('K3 介紹「這是可昕，我女朋友。」：阿哲「哪間學校的？」可昕「木柵大學的。考古題可以交換。」；之後比冷笑話、阿哲贏→「好，我回去練。」；不透露經濟系',L.includes('哪間學校的？')&&L.includes('木柵大學的。考古題可以交換。')&&L.includes('好，我回去練。')&&G.flags.ECON_PAST_SHARED===undefined&&G.flags.KX_MET_NOODLE_TEAM===true,JSON.stringify(L.slice(-6)));
    L=await playBBQ({KX_BBQ_COME:true},null,['出題','可昕贏']);
    check('K3 介紹「她會出題考你們。」：「刑總第一題。準備好了嗎？」「我拒絕回答。」（AA_295）；可昕贏沒有「我回去練」；不透露經濟系',L.includes('刑總第一題。準備好了嗎？')&&L.includes('我拒絕回答。')&&!L.includes('好，我回去練。')&&G.flags.ECON_PAST_SHARED===undefined);
    L=await playBBQ({KX_BBQ_COME:true},()=>SOCIAL.remember('heroine_01','FIRST_MET',''),['怎麼認識','阿哲贏']);
    check('K3「讓她說我們怎麼認識的。」（原本不是 full）：可昕的介紹＋阿哲「等一下。經濟系？重考？」＋你「……嗯。念了一個多月。」（AA_236 A5）→ full、以安（認識）記 KNOWS_ECON_YEAR',L.includes('杜可昕。木柵大學法律。我們以前是經濟系的同學。……後來一起重考。')&&L.includes('等一下。經濟系？重考？')&&L.includes('……嗯。念了一個多月。')&&G.flags.ECON_PAST_SHARED==='full'&&SOCIAL.has('heroine_01','KNOWS_ECON_YEAR'));
    L=await playBBQ({KX_BBQ_COME:true,ECON_PAST_SHARED:'full'},null,['怎麼認識','阿哲贏']);
    check('K3「讓她說」（原本就是 full）：阿哲「喔——就是那一年。」，不再問',L.includes('喔——就是那一年。')&&!L.includes('等一下。經濟系？重考？'));
    L=await playBBQ({KX_BBQ_COME:true,ECON_PAST_SHARED:'half'},null,['怎麼認識','阿哲贏']);
    check('K3「讓她說」（原本 half）：升成 full；以安不認識就不記',G.flags.ECON_PAST_SHARED==='full'&&!SOCIAL.has('heroine_01','KNOWS_ECON_YEAR')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

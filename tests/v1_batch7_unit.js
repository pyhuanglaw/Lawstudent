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
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
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
    const r=await play(['妳推薦哪一家','她推薦']); const L=lines();
    check('出發：轉場（標題卡「去政大找可昕｜開車約 30 分鐘」）、深色底開始',r==='go'&&titles[0]==='去政大找可昕｜開車約 30 分鐘'&&bgs[0]==='begin:dark',JSON.stringify({titles,bgs:bgs.slice(0,3)}));
    check('三個場景：政大・校門口 → 政大・山下的小吃街 → 政大・校門口（字幕；AA_137 7-1：停車場改成校門；校門、小吃街有 2D 背景（LAWWW2-B 825c038））',JSON.stringify(caps.filter(c=>c.startsWith('政大')))==='["政大・校門口","政大・山下的小吃街","政大・校門口"]'&&JSON.stringify(bgs.slice(2,5))==='["img","img","img"]',JSON.stringify({caps,bgs}));   /* 最後多一個 begin:dark＝演完和可昕的那幾句留在 2D 畫面（BUG-OUTING-STUCK，使用者 2026-10-16：她人不在、對話還在），是刻意的 */
    const K1=['校門口。她在揮手，只戴一邊的耳環，今天是一隻小長頸鹿。',   /* 2026-10-16 BB_95 9-1：所有玩家都是長頸鹿（BCG-27）*/
      '上次是搬東西，不算。今天才是真的政大。我是今天的導遊。',   /* 第二句 2026-10-16 照 AA_140 3-5 F 改（BB-B 的句子）；AA_313 第 2 節第 5 列改「上次是搬東西」（原本「暑假那次學校沒人」）*/
      '我在這裡念了三個禮拜，所以比你懂這裡三個禮拜。','她指了左邊、右邊、後面。','法學院。山。也是山。政大的地圖重點就是：山。','山下那條街，你想吃哪一家？……先說，每一家我都吃過了。'];   /* AA_295 */
    check('校門口：開場六句（BB_95 9-1 原文，舞台說明改旁白）',JSON.stringify(L.slice(0,6))===JSON.stringify(K1),JSON.stringify(L.slice(0,6)));
    check('BCG-27「我是今天的導遊」：旁白之後、「我是今天的導遊」那一句之前換成 CG（圖檔在、有登錄）',cgs.includes('cg_tour_guide_kexin')&&(()=>{ const D=STORY_EVENTS.find(e=>e.id==='ev_kexin_tour_nccu').dialogue, i=D.findIndex(l=>l.cg==='cg_tour_guide_kexin'); return i>0&&/我是今天的導遊/.test(D[i+1].text)&&/長頸鹿/.test(D[i-1].text); })()&&fs.existsSync(path.join(ROOT,'assets/cg/kexin/cg_tour_guide.webp'))&&ADV_CG_FILE('cg_tour_guide_kexin')==='assets/cg/kexin/cg_tour_guide.webp',JSON.stringify(cgs));
    check('山下那條街三個選項（AA_295）',JSON.stringify(opts[1])===JSON.stringify(['「跟妳點一樣的。」','「妳推薦哪一家？」','「妳先點，我請。」']),JSON.stringify(opts[1]));
    check('選「妳推薦哪一家？」：「山下那家酸辣湯餃。開學到現在，我已經吃到老闆認得我了。」（AA_372 第 7 項：她才開學兩個禮拜）',L.includes('山下那家酸辣湯餃。開學到現在，我已經吃到老闆認得我了。'));
    check('小吃街三個選項；選她推薦的：「好，信任導遊。」＋「（她點了兩碗。和搬宿舍那天同一家。）」（AA_313 第 2 節第 5 列）、K1_ORDER=hers',JSON.stringify(opts[2])===JSON.stringify(['（吃她推薦的）','（自己挑一家）','「妳幫我點。」'])&&L.includes('好，信任導遊。')&&L.includes('（她點了兩碗。和搬宿舍那天同一家。）')&&!L.includes('她點了兩碗酸辣湯餃。')&&G.flags.K1_ORDER==='hers',JSON.stringify(opts[2]));
    check('memo「開學後第一次去政大」（AA_313 第 2 節第 5 列：8/30 搬宿舍是第一次）',STORY_EVENTS.find(e=>e.id==='ev_kexin_tour_nccu').consequences.memo==='開學後第一次去政大');
    check('停車場結尾：最後一句「下次你來，我們吃山下那家。」（AA_372 第 7 項：「選宵夜」8/30 講過；AA_525 3-5「山上」→「山下」）；「……這是分工，不是命令。」拿掉（AA_372 第 6 節第 7 題，企劃線 7fca0df5）',L[L.length-1]==='下次你來，我們吃山下那家。'&&!L.includes('……這是分工，不是命令。'),JSON.stringify(L.slice(-2)));
    check('影響：NCCU_VISITED、可昕的記憶 OUR_SHOP_FIRST；影子的回答不記（沒有別的旗標）',G.flags.NCCU_VISITED===true&&SOCIAL.has('kexin','OUR_SHOP_FIRST')&&!Object.keys(G.flags).some(k=>/SHADOW|K1_SHADOW/.test(k)));
    check('時間：13:30 出發、14:00 抵達、演 3 小時 → 17:00；「回到台大。」',Math.abs(G.hour-17)<0.01&&caps[caps.length-1]==='回到台大。',JSON.stringify({h:G.hour,last:caps[caps.length-1]}));
    check('只一次（出遊 done、事件演過）',OUT.get(G,'kx_tour').state==='done'&&G.events.done.ev_kexin_tour_nccu===1);
    for(const [a,b,want,flag] of [['跟妳點一樣','自己挑',['那你要吃很辣喔。……好，等一下下山就去。','你挑的那家，我還沒吃過。……好，今天換你當導遊。'],'mine'],['妳先點','幫我點',['……你答得太快了。我會點很多喔。','她先走進校門。','讓我點的人，第三次老闆就會記得你。'],'let_her']]){
      await play([a,b]); const Lx=lines(); check('選「'+a+'」「'+b+'」：'+JSON.stringify(want)+'、K1_ORDER='+flag,want.every(t=>Lx.includes(t))&&G.flags.K1_ORDER===flag,JSON.stringify(Lx.slice(6,10))); }
    fresh(SAT3,13.8,'dorm'); OUT.plan(G,{id:'kx_tour',ev:'ev_kexin_tour_nccu',day:SAT3,h:14,place:'政大',title:'去政大找可昕',travelH:0.5}); G.hour=14.5; picks=['出發']; await tickOut();
    check('晚一點才出發（14:30）：抵達 15:00、演完 18:00',Math.abs(G.hour-18)<0.01,String(G.hour)); }
  /* ---------- K1「念了幾個禮拜」照實際的週數（AA 審 9-1 第 2 點）---------- */
  { check('數字：3→三、4→四、10→十、12→十二、20→二十',[3,4,10,12,20].map(STORY.zhNum).join(',')==='三,四,十,十二,二十');
    fresh(FRI3,8,'campus'); run(8,20); const m=G.msgs.find(x=>x.tag==='kx_tour_ask'); const F0=G.flags, ms=G.msgs, ph=G.phone; fresh(SAT3+3,10,'campus',F0); G.msgs=ms; G.phone=ph; PHONE.answer(G,m.ask.id,0); run(10,10.2);
    const o=OUT.get(G,'kx_tour'); check('K1 延後到第 4 週週六：記下「四」',!!o&&CALENDAR.termOf(o.day).week===4&&G.flags.kxTourWeeks==='四',JSON.stringify({o,w:G.flags.kxTourWeeks}));
    G.day=o.day; G.hour=13.5; picks=['出發','妳推薦哪一家','她推薦']; said=[]; await tickOut(); check('K1 延後：「我在這裡念了四個禮拜，所以比你懂這裡四個禮拜。」',lines().includes('我在這裡念了四個禮拜，所以比你懂這裡四個禮拜。'),JSON.stringify(lines().slice(0,3))); }
  /* ---------- K1b 予樂說：及格（BB_95 9-2）---------- */
  { const W5MON=STORY.termDay('Y1S1',5,1); let W6MON=STORY.termDay('Y1S1',6,1); const hol=CALENDAR.holiday(W6MON); while(CALENDAR.holiday(W6MON)||CALENDAR.dateOf(W6MON).wd>5) W6MON++;   /* 第 6 週週一 10/6 中秋放假：第一個上課的平日 */
    check('K1b：第 6 週週一（10/6）放假（'+hol+'），第一個平日是第 '+W6MON+' 天（'+CALENDAR.dateOf(W6MON).key+'）',!!hol&&CALENDAR.dateOf(W6MON).key==='2025-10-07');
    fresh(W6MON,8,'campus'); run(8,16); check('K1b：還沒去過政大（K1 之前）不傳',!G.msgs||!G.msgs.some(x=>x.tag==='kx_yule_ask'));
    fresh(W5MON,8,'campus',{NCCU_VISITED:true}); run(8,16); check('K1b：第 5 週不傳',!G.msgs||!G.msgs.some(x=>x.tag==='kx_yule_ask'));
    const ask=(pick)=>{ fresh(W6MON,8,'campus',{NCCU_VISITED:true}); run(8,16); const m=G.msgs.find(x=>x.tag==='kx_yule_ask'); if(pick!=null) PHONE.answer(G,m.ask.id,pick); run(16,16.2); return m; };
    const m=ask(null);
    check('K1b：第 6 週第一個平日 15:30 可昕傳「明天晚上有空嗎？我們系上有人揪宵夜，予樂一直說要看你本人。」，三個回覆（原文）',!!m&&m.text==='明天晚上有空嗎？我們系上有人揪宵夜，予樂一直說要看你本人。'&&Math.abs(m.h-15.5)<0.06&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["好，我開車過去。","我明天七點有事，晚一點可以嗎？","這週不行，下週換我請。"]',JSON.stringify(m&&m.ask.opts.map(o=>o.t)));   /* AA_207 附錄 §2：沒加入麵店團（或隔天不是麵店日）＝「我明天七點有事，晚一點可以嗎？」 */
    { let dN=STORY.termDay('Y1S1',6,1); while(!(CALENDAR.dateOf(dN).wd>=1&&CALENDAR.dateOf(dN).wd<=5&&!CALENDAR.holiday(dN)&&STORY.noodleDay(dN+1))) dN++;   /* 第 6 週起第一個「隔天是麵店日」的平日 */
      fresh(dN,8,'campus',{NCCU_VISITED:true}); PHONE.join(G,'noodle_team','麵店團'); run(8,16); const mg=G.msgs.find(x=>x.tag==='kx_yule_ask');
      check('K1b：在麵店團群組、隔天是麵店日＝第二個回覆「我七點跟麵店團吃飯，晚一點可以嗎？」（AA_207 附錄 §2）',CALENDAR.termOf(dN).week<=8&&!!mg&&mg.ask.opts[1].t==='我七點跟麵店團吃飯，晚一點可以嗎？',JSON.stringify(mg&&mg.ask.opts.map(o=>o.t))); }
    ask(0); let o=OUT.get(G,'kx_yule'); check('K1b：「好，我開車過去。」＝隔天 19:30 去政大',!!o&&o.day===W6MON+1&&o.h===19.5,JSON.stringify(o));
    ask(1); o=OUT.get(G,'kx_yule'); const r1=G.msgs.filter(x=>x.th==='p:kexin'&&x.from==='kexin').map(x=>x.text);
    check('K1b：「晚一點可以嗎？」＝她回「那九點？你來吃第二輪。」、隔天 21:00',!!o&&o.h===21&&o.day===W6MON+1&&r1.includes('那九點？你來吃第二輪。'),JSON.stringify(o));
    ask(2); const r2=G.msgs.filter(x=>x.th==='p:kexin'&&x.from==='kexin').map(x=>x.text); const F2=Object.assign({},G.flags), msgs=G.msgs, ph=G.phone; fresh(W6MON+2,8,'campus',F2); G.msgs=msgs; G.phone=ph; run(8,13);
    const crown=G.msgs.filter(x=>x.tag==='kx_yule_crown');
    check('K1b：「這週不行」＝她回「好。」（AA_525 3-11：原「好，那下週換你請。」）、不排出遊；予樂戴紙巾皇冠的照片不再私訊（AA_503 9-3：改成可昕的動態第 3 則，去沒去都出，tests/aa503_feed_unit.js 第 9 段）',r2.includes('好。')&&!r2.includes('好，那下週換你請。')&&!OUT.get(G,'kx_yule')&&crown.length===0,JSON.stringify(crown.map(x=>[x.day,x.text])));
    /* 演出 */
    fresh(W6MON+1,19,'dorm',{NCCU_VISITED:true}); OUT.plan(G,{id:'kx_yule',ev:'ev_kexin_yule_pass',day:W6MON+1,h:19.5,place:'政大',title:'去政大見予樂',travel:'開車約 30 分鐘',travelH:0.5}); picks=['出發','所以我來政大','哪一科','週末換妳'];
    await tickOut(); const L=lines();
    check('K1b 演出：五個場景（AA_137 7-1：校門口、小吃街、校園裡的路、宿舍樓下、校門口）',JSON.stringify(caps.filter(c=>c.startsWith('政大')))==='["政大・校門口","政大・山下的小吃街","政大・校園裡的路","政大・宿舍樓下","政大・校門口"]',JSON.stringify(caps));
    check('K1b：校門「停車場只剩最邊邊的一格。」＋她的訊息「再十分鐘！你先去山下那間，幫我點酸辣湯餃。」（手機）',L[0]==='停車場只剩最邊邊的一格。'&&L[1]==='再十分鐘！你先去山下那間，幫我點酸辣湯餃。'&&said[1].who==='可昕（手機）',JSON.stringify(said.slice(0,2)));
    check('K1b：予樂的第一句（原文）、三個選項（第三個帶玩家的名字）、選「是。所以我來政大聊。」→「……可以，你很老實。」、YL_IMPRESSION=honest',L[2]==='你就是那個……開車的？'&&L[3]==='我問你，台大法律系是不是都很難聊？'&&said[2].who==='予樂'&&JSON.stringify(opts[1])==='["「司機兼男朋友。」","「是。所以我來政大聊。」","「妳好，我是祐廷。」"]'&&L.includes('……可以，你很老實。')&&G.flags.YL_IMPRESSION==='honest',JSON.stringify({o:opts[1],L:L.slice(2,6)}));
    check('K1b：校園裡的路「予樂說要借你的筆記。我說要先問你。」＋三個回應（AA_295）：「好啊，哪一科？」→「民總。……她說你的字比我的好認。」',L.includes('予樂說要借你的筆記。我說要先問你。')&&JSON.stringify(opts[2])==='["「好啊，哪一科？」","「借吧，反正她看不懂。」","（笑）"]'&&L.includes('民總。……她說你的字比我的好認。')&&!L.includes('……這句我會轉告她。'),JSON.stringify(opts[2]));
    check('K1b：圖書館「你翻頁好大聲。」、停車場兩個選項（「週末換妳來台大？」記 KX_NTU_ASKED、她回「好。我先問品妤那天在不在。」——AA_313 第 2 節第 7 列）',L.includes('你翻頁好大聲。')&&JSON.stringify(opts[3])==='["「週末換妳來台大？」","「報告寫完傳訊息給我。」"]'&&G.flags.KX_NTU_ASKED===true&&L[L.length-1]==='好。我先問品妤那天在不在。'&&!L.includes('好。我先去找品妤，再去抓你。')&&!L.includes('好。寫不完也會跟你說。'),JSON.stringify({o:opts[3],last:L[L.length-1]}));
    { fresh(W6MON+1,19,'dorm',{NCCU_VISITED:true}); G.events.done.ev_kexin_visits_ntu=1; OUT.plan(G,{id:'kx_yule',ev:'ev_kexin_yule_pass',day:W6MON+1,h:19.5,place:'政大',title:'去政大見予樂',travel:'開車約 30 分鐘',travelH:0.5}); picks=['出發','所以我來政大','哪一科','報告寫完'];
      await tickOut(); check('K1b：K2（ev_kexin_visits_ntu）演過以後「週末換妳來台大？」不出（AA_313 第 2 節第 7 列）',JSON.stringify(opts[3])==='["「報告寫完傳訊息給我。」"]'&&!G.flags.KX_NTU_ASKED,JSON.stringify(opts[3])); }
    for(const [k,pick,want] of [[1,'借吧','……這句我會轉告她。'],[2,'（笑）','你笑了。我當你答應了。']]){ fresh(W6MON+1,19,'dorm',{NCCU_VISITED:true}); OUT.plan(G,{id:'kx_yule',ev:'ev_kexin_yule_pass',day:W6MON+1,h:19.5,place:'政大',title:'去政大見予樂',travel:'開車約 30 分鐘',travelH:0.5}); picks=['出發','所以我來政大',pick,'報告寫完'];
      await tickOut(); const L2=lines(); check('K1b：河堤選「'+pick+'」→「'+want+'」；停車場「報告寫完傳訊息給我。」→「好。寫不完也會跟你說。」（AA_207 附錄 §2：原本「明天考完……」「考爛了也要傳」，前面沒提考試）',L2.includes(want)&&L2[L2.length-1]==='好。寫不完也會跟你說。'&&!G.flags.KX_NTU_ASKED,JSON.stringify(L2.slice(-4))); }
    const F3=Object.assign({},G.flags), msgs3=G.msgs, ph3=G.phone; fresh(W6MON+2,8,'campus',F3); G.msgs=msgs3; G.phone=ph3; run(8,13); const pass=G.msgs.filter(x=>x.tag==='kx_yule_pass');
    check('K1b：隔天中午她傳予樂的紙條照片「及格。」',pass.length===1&&pass[0].day===W6MON+2&&pass[0].text==='📷（予樂寫的紙條：「及格。」）'); }
  /* ---------- 中秋烤肉（A13）＋可昕 K3（BB_95 9-4）---------- */
  { const WED=STORY.termDay('Y1S1',5,3), SAT=STORY.termDay('Y1S1',5,6);
    check('中秋烤肉：第 5 週週六＝2025-10-04',CALENDAR.dateOf(SAT).key==='2025-10-04');
    fresh(WED,8,'campus'); run(8,22); const m=G.msgs.find(x=>x.tag==='bbq_ask');
    check('烤肉：第 5 週週三 21:00 阿哲揪（沒有麵店團群組＝私訊）、兩個回覆',!!m&&m.th==='p:zhe'&&m.from==='zhe'&&Math.abs(m.h-21)<0.06&&m.ask.opts.length===2,JSON.stringify(m&&[m.th,m.text]));
    fresh(WED,8,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(8,22); const mg=G.msgs.find(x=>x.tag==='bbq_ask');
    check('烤肉：有麵店團群組＝在群組揪',!!mg&&mg.th==='g:noodle_team');
    { const G0=G; G=JSON.parse(JSON.stringify(G0)); const m2=G.msgs.find(x=>x.tag==='bbq_ask'); G.day=SAT; G.hour=14.9; const open1=PHONE.askOpen(G,m2); G.hour=15.1; const open2=PHONE.askOpen(G,m2); G.day=SAT+100; const open3=PHONE.askOpen(G,m2); G=G0;
      check('烤肉的揪：週六 15:00 開始以前可以回、之後就關（BB-C 10-21 P3：原本隔年一月還是「待回覆」）',open1&&!open2&&!open3); }
    PHONE.answer(G,mg.ask.id,0); run(22,22.2); const o=OUT.get(G,'bbq');
    check('烤肉：回「去。」＝排週六 15:00 河濱',!!o&&o.day===SAT&&o.h===15&&o.place==='河濱'&&o.ev==='ev_mid_autumn_bbq',JSON.stringify(o));
    const F1=Object.assign({},G.flags), msgs=G.msgs, ph=G.phone; fresh(SAT-1,8,'campus',F1); G.msgs=msgs; G.phone=ph; G.outings=[o]; run(8,20.5); const k=G.msgs.find(x=>x.tag==='kx_bbq_ask');
    check('K3：前一天（週五）20:00 可昕問「我們系也有烤肉。……你們的比較好玩嗎？」、兩個回覆（原文）',!!k&&k.day===SAT-1&&Math.abs(k.h-20)<0.06&&k.text==='我們系也有烤肉。……你們的比較好玩嗎？'&&JSON.stringify(k.ask.opts.map(q=>q.t))==='["來我們這邊。","妳去妳們系的。"]');
    { const F2=Object.assign({},G.flags), ms=G.msgs.slice(), p2=JSON.parse(JSON.stringify(G.phone)); PHONE.answer(G,k.ask.id,1); fresh(SAT,8,'campus',Object.assign({},G.flags)); G.msgs=ms; G.phone=p2; G.flags.KX_BBQ_NO=true; run(8,21); const c=G.msgs.filter(x=>x.tag==='kx_bbq_corn').map(x=>x.text);
      check('K3：「妳去妳們系的。」＝不再私訊烤玉米的照片（AA_503 9-3：改成可昕的動態第 2 則「我們的玉米比較好。」，去沒去都出，tests/aa503_feed_unit.js 第 9 段）',c.length===0,JSON.stringify(c)); }
    const playBBQ=async(flags,setup,pk)=>{ fresh(SAT,14.5,'campus',Object.assign({ZHE_CALLS_GE:true},flags||{}));   /* 已經有「哥」：不問「你幾年次的」（v1_batch12 測）*/ if(setup) setup(); OUT.plan(G,{id:'bbq',ev:'ev_mid_autumn_bbq',day:SAT,h:15,place:'河濱',title:'中秋烤肉',travel:'走過去約 15 分鐘',travelH:0.25}); picks=['出發'].concat(pk||[]); await tickOut(); return lines(); };
    let L=await playBBQ({},null,[]);
    check('烤肉（只認識阿哲）：河濱、「阿哲負責烤。」，以安、語彤、柏翰、方奕廷、可昕都不在',caps.includes('河濱')&&L.includes('阿哲負責烤。')&&!L.some(t=>/以安|語彤|柏翰|方奕廷|可昕來了|菜單/.test(t)),JSON.stringify(L));
    L=await playBBQ({met_yu:true},()=>{ for(const id of ['heroine_01','heroine_03','classmate_bohan','npc_fangyt']) SOCIAL.remember(id,'FIRST_MET',''); },[]);
    check('烤肉（大家都認識）：Alison 負責吃、以安的烤肉時間表、語彤阿姨醃的肉（YT-BBQ-WHY-1027 起一句換三行，AA_486 第 2 節）、柏翰的考古題被沒收、方奕廷講植物；阿哲「可以叫阿姨開一個烤肉的菜單嗎？」語彤「不行。她會真的開。」',['阿哲負責烤，Alison 負責吃。','以安帶了一張「烤肉時間表」。','語彤也來了，提著一盒阿姨醃的肉。阿哲在麵店揪人那天，阿姨在旁邊聽到了。','阿姨叫我拿來的。她說常來吃麵的，都算自己人。','阿姨醃的肉，全場最好吃。','柏翰帶了考古題，被沒收了。','可以叫阿姨開一個烤肉的菜單嗎？','不行。她會真的開。'].every(t=>L.includes(t))&&L.some(t=>/方奕廷/.test(t)),JSON.stringify(L));
    L=await playBBQ({KX_BBQ_COME:true},null,['我女朋友','阿哲贏']);
    check('K3 介紹「這是可昕，我女朋友。」：阿哲「哪間學校的？」可昕「政大的。考古題可以交換。」；之後比冷笑話、阿哲贏→「好，我回去練。」；不透露經濟系',L.includes('哪間學校的？')&&L.includes('政大的。考古題可以交換。')&&L.includes('好，我回去練。')&&G.flags.ECON_PAST_SHARED===undefined&&G.flags.KX_MET_NOODLE_TEAM===true,JSON.stringify(L.slice(-6)));
    L=await playBBQ({KX_BBQ_COME:true},null,['出題','可昕贏']);
    check('K3 介紹「她會出題考你們。」：「刑總第一題。準備好了嗎？」「我拒絕回答。」（AA_295）；可昕贏沒有「我回去練」；不透露經濟系',L.includes('刑總第一題。準備好了嗎？')&&L.includes('我拒絕回答。')&&!L.includes('好，我回去練。')&&G.flags.ECON_PAST_SHARED===undefined);
    L=await playBBQ({KX_BBQ_COME:true},()=>SOCIAL.remember('heroine_01','FIRST_MET',''),['怎麼認識','阿哲贏']);
    check('K3「讓她說我們怎麼認識的。」（原本不是 full）：可昕的介紹＋阿哲「等一下。經濟系？重考？」＋你「……嗯。念了一個多月。」（AA_236 A5）→ full、以安（認識）記 KNOWS_ECON_YEAR',L.includes('杜可昕。政大法律。我們以前是經濟系的同學。……後來一起重考。')&&L.includes('等一下。經濟系？重考？')&&L.includes('……嗯。念了一個多月。')&&G.flags.ECON_PAST_SHARED==='full'&&SOCIAL.has('heroine_01','KNOWS_ECON_YEAR'));
    L=await playBBQ({KX_BBQ_COME:true,ECON_PAST_SHARED:'full'},null,['怎麼認識','阿哲贏']);
    check('K3「讓她說」（原本就是 full）：阿哲「喔——就是那一年。」，不再問',L.includes('喔——就是那一年。')&&!L.includes('等一下。經濟系？重考？'));
    L=await playBBQ({KX_BBQ_COME:true,ECON_PAST_SHARED:'half'},null,['怎麼認識','阿哲贏']);
    check('K3「讓她說」（原本 half）：升成 full；以安不認識就不記',G.flags.ECON_PAST_SHARED==='full'&&!SOCIAL.has('heroine_01','KNOWS_ECON_YEAR')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

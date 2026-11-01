// ★主線 3 第二個房間（AA_12 主線 3、AA_177 第 7 節、AA_176 R8）：9/6 以後、還沒搬；物件只有大一經歷過的才出現；拆箱一件一件拿；在家＝旁白＋字卡＋回宿舍；阿凱搬走、舊《民法》換大二那句——不需要瀏覽器。
// 修改前沒有 STORY.unboxY2（全部失敗）。用法：node tests/v3_room2_unit.js
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
  if(!STORY.unboxY2||!STORY.roomY2Items){ console.log('FAIL 0. 沒有 STORY.unboxY2'); console.log('FAILED 1'); process.exit(1); }
  const d6=STORY.dayOfKey('2026-09-06'); check('0. 9/6 是週日、大二上開學前一天',CALENDAR.dateOf(d6).wd===7&&CALENDAR.termOf(d6+1).id==='Y2S1'&&CALENDAR.termOf(d6+1).week===1);
  fresh(d6-1,20,'dorm',{}); G.stage='law'; check('1. 9/5 還沒到',!STORY.roomY2Due(G)); G.day=d6; check('1. 9/6 到了',STORY.roomY2Due(G)); G.stage='econ'; check('1. 經濟系那年不算',!STORY.roomY2Due(G)); G.stage='law';
  /* BUG-ROOMY2-LATE-1031（BB-B n20_y2late）：只在 9/6、9/7 演；9/8 以後才讀進來、還沒搬的直接記（不演）；修改前 FAIL */
  fresh(d6+1,20,'dorm',{}); G.stage='law'; check('1b. 9/7（開學那天）還照演；旁白不說「明天開學」',STORY.roomY2Due(G)&&STORY.roomY2Line(G)===null&&(G.day=d6,STORY.roomY2Line(G))==='明天開學。今天搬進新的房間。');
  for(const k of ['2026-10-15','2027-10-13']){ fresh(STORY.dayOfKey(k),20,'dorm',{}); G.stage='law'; const due0=STORY.roomY2Due(G), r=STORY.roomY2Late(G);
    check('1b. '+k+' 才讀進來、沒有 ROOM_Y2：不演（roomY2Due false），S.roomY2Late 直接記 ROOM_Y2＝9/6',!due0&&r===true&&G.flags.ROOM_Y2===d6&&!STORY.roomY2Due(G),JSON.stringify({due0,r,R:G.flags.ROOM_Y2})); }
  fresh(d6+2,20,'dorm',{ROOM_Y2_MOVING:true}); G.stage='law'; check('1b. 已經開始搬（ROOM_Y2_MOVING，拆箱拆到一半）：9/8 照舊算到期、roomY2Late 不動',STORY.roomY2Due(G)&&STORY.roomY2Late(G)===false&&!G.flags.ROOM_Y2);
  fresh(d6+1,20,'dorm',{}); G.stage='law'; check('1b. 9/7 roomY2Late 不動（留給拆箱）',STORY.roomY2Late(G)===false&&!G.flags.ROOM_Y2);
  // 2. 什麼都沒經歷過的玩家
  let L=STORY.roomY2Items(G), ks=L.map(r=>r[0]);
  check('2. 最少：民總課本、阿凱的泡麵＋大一房間的五件（沒有票根、彈片、報告、值班表、黃金葛、螢光筆、便利貼）',JSON.stringify(ks)===JSON.stringify(['civ','noodle','y1_0','y1_1','y1_2','y1_3','y1_4']),JSON.stringify(ks));
  check('2. 舊《民法》用大二那句',JSON.stringify(L[2][2])===JSON.stringify(['現在知道，要先問是誰、向誰、依據什麼、要什麼。'])&&L[3][2][0]==='念了一個多月的課本。前六章有畫線，後面是新的。',JSON.stringify(L[2]));
  check('2. 泡麵的便條',L[1][2][0]==='紙箱裡夾著一張便條：「宵夜基金。過期前吃完。——凱」');
  // 3. 經歷過全部的玩家
  SOCIAL.remember('heroine_02','WATCHED_FILM',''); ACTIVITIES.markAttended(G,ACTIVITIES.list.find(a=>a.id==='club_guitar')); G.events.done.ev_an_report_feedback=1; G.flags.cafeView='B'; G.flags.LAWCLUB_SAT_VISITS=2;
  G.flags.POTHOS=true; G.flags.pothosWaterN=3; G.flags.GREEN_HIGHLIGHTER=true; SOCIAL.remember('classmate_xinci','LENT_NOTES','');
  L=STORY.roomY2Items(G); ks=L.map(r=>r[0]); const tx=k=>JSON.stringify((L.find(r=>r[0]===k)||[])[2]);
  check('3. 全部：票根、彈片、課本、報告、泡麵、值班表、黃金葛、螢光筆、便利貼＋五件',JSON.stringify(ks)===JSON.stringify(['film','pick','civ','report','noodle','duty','pothos','green','sticky','y1_0','y1_1','y1_2','y1_3','y1_4']),JSON.stringify(ks));
  check('3. 票根「票根上的日期，是星期六早上十點。」',tx('film')===JSON.stringify(['票根上的日期，是星期六早上十點。']));
  check('3. 報告影本照 cafeView B＋「不是寫給你的，可是你留著。」',tx('report')===JSON.stringify(['『反方意見比正方精彩。』','不是寫給你的，可是你留著。']));
  check('3. 黃金葛澆過水「比去年長了一點。」',tx('pothos')===JSON.stringify(['比去年長了一點。']));
  G.flags.pothosWaterN=0; check('3. 黃金葛沒澆過「他說忘記澆也不會死。他說對了。」',JSON.stringify(STORY.roomY2Items(G).find(r=>r[0]==='pothos')[2])===JSON.stringify(['他說忘記澆也不會死。他說對了。']));
  G.flags.cafeView='C'; check('3. cafeView C＝「『無過失的判斷標準寫得好。』」',STORY.roomY2Items(G).find(r=>r[0]==='report')[2][0]==='『無過失的判斷標準寫得好。』');
  G.flags.ZR_MATINEE_SEEN=true; check('3. 看的是午場（父親的午後）＝沒有《進城的那一週》票根',!STORY.roomY2Items(G).some(r=>r[0]==='film')); G.flags.ZR_MATINEE_SEEN=false;
  SOCIAL.remember('heroine_02','WATCHED_FILM_GROUP',''); check('3. 兩人、三人都看過＝一張票根',STORY.roomY2Items(G).filter(r=>r[0]==='film').length===1);
  { const g0=G; fresh(G.day,G.hour,'dorm',{}); G.stage='law'; SOCIAL.remember('heroine_02','WATCHED_FILM_GROUP',''); check('3. 只有三個人看早場（WATCHED_FILM_GROUP）＝也有《進城的那一週》票根（AA_177 第 10 節）',STORY.roomY2Items(G).some(r=>r[0]==='film'));
    G.flags.ZR_MATINEE_SEEN=true; check('3. 三個人、看的是午場＝沒有',!STORY.roomY2Items(G).some(r=>r[0]==='film')); G=g0; SOCIAL.bind(G); }
  G.flags.LAWCLUB_SAT_VISITS=0; check('3. 沒參加過法服＝沒有值班表',!STORY.roomY2Items(G).some(r=>r[0]==='duty'));
  // 4. 拆箱流程（宿舍房間）
  fresh(d6,10,'dorm',{GREEN_HIGHLIGHTER:true}); G.stage='law'; const n0=STORY.roomY2Items(G).length; picks=[]; for(let i=0;i<30;i++) picks.push(0); said=[]; opts=[];
  check('4. 搬之前阿凱同房',STORY.kaiRoommate(G)===true);
  const ok=await STORY.unboxY2(GM); L=lines();
  check('4. 一件一件拿（選單每次少一項，最後一次只剩一項）',ok&&opts.length===n0&&opts[0].length===n0&&opts[opts.length-1].length===1&&opts[0][0]==='（拿出一本只讀了三分之一的民總課本）',JSON.stringify(opts.map(o=>o.length)));
  check('4. 每件的旁白、最後「一年。房間比去年滿一點。」',L.includes('這本還有三分之二，跟去年九月一樣新。')&&L.includes('你的螢光筆本來只有一種顏色。')&&L[L.length-1]==='一年。房間比去年滿一點。',JSON.stringify(L));
  check('4. ROOM_Y2＝這一天；不再到期；阿凱不同房；房間的舊《民法》換大二那句',G.flags.ROOM_Y2===d6&&!STORY.roomY2Due(G)&&STORY.kaiRoommate(G)===false&&STORY.roomItemList(G)[0][1]==='現在知道，要先問是誰、向誰、依據什麼、要什麼。');
  check('4. 再呼叫一次＝不演',!(await STORY.unboxY2(GM)));
  // 4b. 9/6 人在宿舍（暑假留在宿舍的舊存檔）：旁白＋字卡 → 新的房間 → 拆箱（AA_177 第 10 節）
  fresh(d6,10,'dorm',{}); G.stage='law'; { let card=null, entered=null; const tc=GM.titleCard, en=GM.enter; GM.titleCard=async(a,b)=>{ card=[a,b]; }; GM.enter=async(z)=>{ entered=z; G.zone=z; }; picks=[]; for(let i=0;i<30;i++) picks.push(0); said=[];
    const ok2=await STORY.roomY2InDorm(GM); GM.titleCard=tc; GM.enter=en; L=lines();
    check('4b. 在宿舍：先「明天開學。今天搬進新的房間。」→ 字卡「搬到新的房間」「三樓 312 號房」（AA_208 7-1）→ 房間 → 拆箱',ok2&&L[0]==='明天開學。今天搬進新的房間。'&&JSON.stringify(card)===JSON.stringify(['搬到新的房間','三樓 312 號房'])&&entered==='dorm'&&!!G.flags.ROOM_Y2&&L[L.length-1]==='一年。房間比去年滿一點。',JSON.stringify([L.slice(0,2),card,entered]));
    check('4b. 再呼叫一次＝不演',!(await STORY.roomY2InDorm(GM))); }
  check('4b. S.tick 宿舍那條路走 roomY2InDorm（不是直接拆箱）',/roomY2Due\(G\)&&!roomY2Busy\)\{ roomY2Busy=true; S\.roomY2InDorm\(GM\)/.test(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8')));
  // 5. 在臺北的家（週末回家）：下一輪選單之前先旁白＋字卡＋回宿舍＋拆箱
  fresh(d6,9,'campus',{}); G.stage='law'; { const H=HOME.rec(G); H.at=true; H.day=d6-1; H.base=false; }
  let card=null, entered=null; const tc=GM.titleCard, en=GM.enter; GM.titleCard=async(a,b)=>{ card=[a,b]; }; GM.enter=async(z)=>{ entered=z; G.zone=z; };
  picks=[]; for(let i=0;i<30;i++) picks.push(0); said=[];
  await HOME.loop(GM); GM.titleCard=tc; GM.enter=en; L=lines();
  check('5. 在家：「明天開學。今天搬進新的房間。」→ 字卡「回宿舍」「捷運＋公車 約 40 分鐘」→ 宿舍房間 → 拆箱',L[0]==='明天開學。今天搬進新的房間。'&&JSON.stringify(card)===JSON.stringify(['回宿舍','捷運＋公車 約 40 分鐘'])&&entered==='dorm'&&!HOME.at(G)&&!!G.flags.ROOM_Y2&&L[L.length-1]==='一年。房間比去年滿一點。',JSON.stringify([L.slice(0,2),card,entered]));
  check('5. 時間走了 40 分鐘以上（回宿舍）',G.hour>=9.7);
  // 6. 存讀檔
  const s0=JSON.stringify(G); G=JSON.parse(s0); SOCIAL.bind(G); check('6. 存讀檔：ROOM_Y2 留著、不再到期',!!G.flags.ROOM_Y2&&!STORY.roomY2Due(G));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

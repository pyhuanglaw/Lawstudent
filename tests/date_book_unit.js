// 校外單獨約會的預約與衝突檢查（DATE-S3；src/date3d.js 的 DATE.check／canAsk／menu／pickWhen／tick、invites3d.js 的「出去玩…」）：AA_128 4-1、4-3。用法：node tests/date_book_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|DATE_LINES|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(Object.assign(o.map(q=>q.t||q.text),{all:[].concat(...o.map(q=>q.sub||[q.t||q.text]))})); const want=picks.shift(); if(typeof want==='string'){ let k=o.findIndex(q=>(q.t||q.text).includes(want)); if(k<0){ k=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(want))); if(k>=0&&!o[k].dim) picks.unshift(want); } /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層（那一類整個灰掉＝和原本選到灰掉的那一項一樣，用掉這個 pick）*/ return k<0?0:k; } return want||0; }};
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
GM.money=d=>{ G.money+=d; }; GM.toast=()=>{}; GM.caption=()=>{}; GM.updateHUD=()=>{};
const ADV2=global.ADV; ADV2.active=false;
(async()=>{
  const day=termDay('Y1S2',5,6);   // 週六
  OUT.BG.d13_base_sunset=OUT.BG.d13_base_sunset||{label:'淡水',image:'x'};   /* 有底圖才列（遊戲裡 D04、D06、D12、D13 有）*/
  // ---------- 1 誰約得到 ----------
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; R('heroine_03',...LV.FRI);
  let ca=DATE.canAsk(G,'heroine_03'); check('1. 第 5 階以前約不到（AA_126 4-1：第 5 階以後的私下約會），寫原因',!ca.ok&&/還沒熟/.test(ca.why),JSON.stringify(ca)+' stage '+DATE.stageNum('heroine_03'));
  G.flags.dating_heroine_03=true; ca=DATE.canAsk(G,'heroine_03'); check('1. 交往中不看階段',ca.ok,JSON.stringify(ca)); delete G.flags.dating_heroine_03;
  check('1. 不是七位女主角：不能約',!DATE.canAsk(G,'zhe').ok);
  delete G.contacts.heroine_03; check('1. 沒有聯絡方式：照 INV.whyNot 的原因',!DATE.canAsk(G,'heroine_03').ok); G.contacts.heroine_03=1;
  // 學姊：筆試（2026-02-02）以前告白會被婉拒、不鎖線（使用者 2026-10-17 P0：她一開始就沒有男朋友；BB_122 ★-1、★-2）
  { const r5=SOCIAL.rel('heroine_05'); Object.assign(r5,{fam:70,trust:55,comf:50,npcRom:60,rom:35}); const L5=DATE.log(G,'heroine_05'); L5.count=4; L5.wish=true; const d0=G.day, w0=G.weekday, exam=STORY.dayOfKey('2026-02-02');
    G.day=exam-10; const a=DATE.canConfess(G,'heroine_05'); G.day=exam+1; const b=DATE.canConfess(G,'heroine_05'); G.day=STORY.dayOfKey('2026-03-23'); const c=DATE.canConfess(G,'heroine_05'); G.day=d0; G.weekday=w0;
    check('1. 學姊：沒有伴侶（canAsk 不會說她有交往的對象）',!/交往的對象/.test(DATE.canAsk(G,'heroine_05').why||''),JSON.stringify(DATE.canAsk(G,'heroine_05')));
    check('1. 學姊：筆試以前＝婉拒（preexam）；筆試後、放榜前＝也婉拒（prerank，AA_223 @8dac7e49）；放榜（3/23）以後照一般條件；都不鎖線',a.ok&&a.decline==='preexam'&&b.ok&&b.decline==='prerank'&&c.ok&&!c.decline,JSON.stringify([a,b,c])); }
  { const exam=STORY.dayOfKey('2026-02-02'), d0=G.day, h0=G.hour; G.day=exam; G.hour=12; DATE.tick(GM); const a=!!G.flags.SIS_EXAM_DONE; G.hour=17.5; G.dateLog._daily=null; DATE.tick(GM); const b=!!G.flags.SIS_EXAM_DONE; G.day=d0; G.hour=h0; delete G.flags.SIS_EXAM_DONE;
    check('1. 學姊筆試考完：2/2 中午還沒、2/2 17:00 以後設 SIS_EXAM_DONE（學姊心願 D15 的條件，BB-C 68f18538）',!a&&b,JSON.stringify([a,b])); }
  // ---------- 2 衝突檢查 ----------
  const base={who:'heroine_03',locs:['D13'],transport:'mrt'};
  let c=DATE.check(G,Object.assign({},base,{day,depart:15})); check('2. 週六 15:00 淡水：可以，算好回程、花費（車資來回＋門票）',c.ok&&c.plan.back>15&&c.cost===c.plan.fare+(DATE.loc('D13').admission|0),JSON.stringify(c));
  c=DATE.check(G,Object.assign({},base,{day,depart:8.5})); check('2. 現在 9:00，8:30 出發＝已經過了',!c.ok&&/過了/.test(c.why),c.why);
  c=DATE.check(G,Object.assign({},base,{day,depart:21})); check('2. 21:00 出發：回來超過 23:30 → 不能選、寫原因',!c.ok&&/23:30/.test(c.why),c.why);
  G.money=50; c=DATE.check(G,Object.assign({},base,{day,depart:15})); check('2. 錢不夠：寫預計花費',!c.ok&&/錢不夠/.test(c.why),c.why); G.money=5000;
  const t1=DATE.book(G,Object.assign({},base,{day,depart:13})); c=DATE.check(G,Object.assign({},base,{who:'heroine_01',day,depart:14}));
  check('2. 和已經約好的行程撞時間：寫跟誰、幾點',t1.ok&&!c.ok&&/撞時間/.test(c.why),c.why);
  c=DATE.check(G,Object.assign({},base,{day,depart:13,skip:t1})); check('2. 改時間時不和自己那一趟比',c.ok||!/撞時間/.test(c.why),c.why);
  const t2=DATE.book(G,{who:'heroine_01',locs:['D13'],transport:'mrt',day,depart:19-2.5-DATE.travel('D13').minutes/60*2>17?17:17}); 
  INV.accept(G,'heroine_02','cafe',day+1,14,{by:'player'}); c=DATE.check(G,Object.assign({},base,{day:day+1,depart:13}));
  check('2. 那天已經有校園邀約（同時段）：不能選',!c.ok&&/已經約了/.test(c.why),c.why);
  // 一天最多兩場
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; G.trips=[{trip:'T1',who:'heroine_01',locs:['D13'],day,depart:9,back:11,status:'booked'},{trip:'T2',who:'heroine_02',locs:['D13'],day,depart:11.5,back:13,status:'booked'}];
  c=DATE.check(G,Object.assign({},base,{day,depart:15})); check('2. 一天最多兩場（AA_126 7-2）',!c.ok&&/兩場/.test(c.why),c.why);
  G.trips=[{trip:'T1',who:'heroine_01',locs:['D24'],kind:'day',day,depart:8,back:12,status:'booked'}]; c=DATE.check(G,Object.assign({},base,{day:day,depart:15}));
  check('2. 那天已經有一日遊：不能再排',!c.ok&&/一日遊/.test(c.why),c.why);
  // 祐廷的課：可以排、提示
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; let wd=termDay('Y1S2',5,1), found=null;
  for(let d=wd; d<wd+5&&!found; d++){ for(const it of (CLS.dayItems(G,d)||[])){ if(it.t0>=9&&it.t1<=18){ found={d,it}; break; } } }
  if(found){ G.day=found.d-1; G.weekday=wdOf(G.day); G.hour=20; const h=Math.max(9,Math.floor(found.it.t0)); c=DATE.check(G,Object.assign({},base,{day:found.d,depart:h,who:'heroine_03'}));
    const busy=INV.busyAt(G,'heroine_03',found.d,h,c.plan?c.plan.back-h:3);
    check('3. 平日有課的時段：'+(busy?'她也有課（換一個人看提示）':'可以排，提示錯過哪一堂／少一次出席'),busy?true:(c.ok&&c.warns.some(w=>w.includes(found.it.c.name))),JSON.stringify({why:c.why,warns:c.warns,course:found.it.c.name})); }
  else check('3. 找不到平日白天的課（略過）',true);
  // 她的作息
  { let hit=null; for(let d=wd; d<wd+5&&!hit; d++) for(const h of [9,10,13,14,15]){ const P=DATE.plan(G,Object.assign({},base,{day:d,depart:h})); const e=INV.busyAt(G,'heroine_03',d,h,P.back-h); if(e){ hit={d,h,e}; break; } }
    if(hit){ G.day=hit.d-1; G.weekday=wdOf(G.day); G.hour=20; c=DATE.check(G,Object.assign({},base,{day:hit.d,depart:hit.h})); check('4. 她那時候有事（作息：'+hit.e.act+'）：不能選、寫原因',!c.ok&&/她那時候/.test(c.why),c.why); }
    else check('4. 語彤平日都沒有上課上班（略過）',true); }
  // ---------- 5 選單：地點 → 日期 → 時間 → 確認 → 排進行事曆 ----------
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; G.flags.dating_heroine_03=true;
  said=[]; opts=[]; picks=['淡水','明天','15:00','就這樣約'];
  const tb=await DATE.menu(GM,'heroine_03',null); const q=tb&&OUT.get(G,'date_'+tb.trip);
  check('5. 選單：只列有底圖、有台詞的地點（淡水 D13、九份 D18、動物園 D08、烏來 D20 有；陽明山夜景 D15、石門水庫 D22 的底圖 10-23 補進來＝也列；2026-10-21 32 個地點台詞全部匯入以後）',opts[0].all.includes('淡水金色水岸')&&opts[0].all.includes('九份老街')&&opts[0].all.includes('臺北市立動物園')&&opts[0].all.includes('烏來')&&opts[0].all.includes('陽明山夜景')&&opts[0].all.includes(DATE.loc('D22').name),opts[0].all.join('/'));   /* 分層（INVITE-MENU-1030）：all＝每一類展開；opts[1]＝海邊那一類 */
  check('5. 日期：今天起 7 天＋算了',opts[2].length===8&&/^今天/.test(opts[2][0])&&/^明天/.test(opts[2][1]),opts[2].join('/'));
  check('5. 時間：半日的出發時間（09:00～15:00）＋換一天＋算了',opts[3].includes('15:00 出發')&&opts[3].includes('換一天'),opts[3].join('/'));
  check('5. 確認的摘要寫：對象、地點、日期、出發、交通、預計花費、回程',said.some(s=>/和.*去淡水金色水岸：明天.*15:00 出發.*單程約.*預計花費.*回到台大/.test(s.t)),said.map(s=>s.t).join(' | '));
  check('5. 約好了：行程 booked、排進出遊（行事曆）、日期是明天',tb&&tb.ok&&tb.day===day+1&&!!q&&q.dateTrip===tb.trip,JSON.stringify(q));
  // 選了不能選的時間：提示、再選一次
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; G.flags.dating_heroine_03=true; G.money=30;
  said=[]; opts=[]; picks=['淡水','今天','15:00','算了']; let toasts=[]; GM.toast=t=>toasts.push(t);
  const tn=await DATE.menu(GM,'heroine_03',null); check('5. 錢不夠的時間灰掉；選了只提示、不會約成',!tn&&toasts.some(t=>/錢不夠/.test(t))&&!(G.trips||[]).length,JSON.stringify(toasts)); GM.toast=()=>{};
  // ---------- 6 出發前 60 分鐘提醒、daily ----------
  fresh(day,9,'dorm',{}); const tt=DATE.book(G,Object.assign({},base,{day,depart:15})); toasts=[]; GM.toast=t=>toasts.push(t);
  G.hour=13.9; DATE.tick(GM); check('6. 出發前 61 分鐘還不提醒',!toasts.length);
  G.hour=14.05; opts=[]; picks=['到時間再說']; const p6=DATE.tick(GM); if(p6&&p6.then) await p6; DATE.tick(GM); check('6. 出發前 60 分鐘：手機提醒一次「15:00，你約了…去淡水金色水岸。」',toasts.length===1&&/15:00，你約了.*淡水金色水岸/.test(toasts[0]),JSON.stringify(toasts));
  const q6=OUT.get(G,'date_'+tt.trip); check('6. 提醒的時候可以提早出發（UX-INV-GO-1023）：「現在出發」／「到時間再說」；選到時間再說＝照舊還沒出發、不再問',!!(p6&&p6.then)&&JSON.stringify(opts[0])===JSON.stringify(['現在出發','到時間再說'])&&q6.state==='planned'&&!tt.departed,JSON.stringify(opts));
  { fresh(day,9,'dorm',{}); const te=DATE.book(G,Object.assign({},base,{day,depart:15})), qe=OUT.get(G,'date_'+te.trip); G.hour=14.05; opts=[]; said=[]; picks=['現在出發','就這樣回去']; let hourAtScene=null; const sc0=DATE.scene; DATE.scene=async(GMx,q)=>{ hourAtScene=G.day*24+G.hour; return sc0(GMx,q); };
    const r=await OUT.tick(GM); DATE.scene=sc0; const tr=DATE.trip(G,te.trip)||{};
    check('6. 選「現在出發」：直接去，到的時候是約好的時間（15:00＋車程），中間的時間直接過去；行程算出發了',r!==null&&tr.departed===true&&hourAtScene!=null&&Math.abs(hourAtScene-(qe.day*24+qe.h))<1e-6&&said.some(s=>/15:00，你約了/.test(s.t)),JSON.stringify({r,hourAtScene,qh:qe.day*24+qe.h,st:tr.status,said:said.slice(0,3)})); }
  G.flags.FLAKED_heroine_03=day-40; DATE.log(G,'heroine_03').cancels=[day-40]; G.dateLog._daily=null; DATE.tick(GM); check('6. 每天一次 daily：30 天沒再取消就清掉 FLAKED',G.flags.FLAKED_heroine_03==null); GM.toast=()=>{};
  // ---------- 7 改時間：完整的日期時間選單 ----------
  fresh(day,9,'dorm',{}); const tm=DATE.book(G,Object.assign({},base,{day,depart:15})); const qm=OUT.get(G,'date_'+tm.trip); picks=['選別的日期和時間','明天','10:00'];
  const r7=await DATE.move(GM,qm,tm); check('7. 改時間「選別的日期和時間」→ 明天 10:00：行程與行事曆都更新、重新提醒',r7==='moved'&&tm.day===day+1&&tm.depart===10&&qm.day===day+1&&Math.abs(qm.h-(10+DATE.travel('D13').minutes/60))<1e-9&&tm.reminded===false,JSON.stringify(tm));
  // ---------- 8 INV.flow 的入口 ----------
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; opts=[]; picks=['算了'];
  await INV.flow(GM,'heroine_03',null,false); check('8. 約人的地點清單最後有「出去玩…」（還沒到第 5 階＝灰掉）',opts[0].includes('出去玩…'),opts[0].join('/'));
  fresh(day,9,'dorm',{}); G.contacts.zhe=1; opts=[]; picks=['算了']; await INV.flow(GM,'zhe',null,false); check('8. 男生（阿哲）沒有「出去玩…」',!opts[0].includes('出去玩…'),opts[0].join('/'));
  // ---------- 9 她的句子（DATE-S6；date_lines.js 白名單匯入）----------
  check('9. date_lines.js 來自匯入白名單（BB_128＠ab9d70fe0（10-27 AA_475 第 1、3 節；之前 a1bc53f4c 10-24 AA_447 芷若「是A，不是B」；之前 a5b936a69 AA_439 禁用句；之前 efe575813 AA_436 學姊數東西四句；之前 1ced2f8b3 AA_432 可昕出發句、e78814663 AA_426 第 6 節「……開玩笑的」重訪句改掉；之前 967b4273a AA_426 心願改稿、ffd7eef8 AA_398 學姊不數件數、3229ad05）、AA_127＠482c7f6e9（10-27 AA_475 第 1 節；之前 967b4273a AA_426 以安「理由：」歸零；之前 345234b3）——10-22 換版 10816dd5、10-23 AA_389 第 7 點改放鴿子兩句再換，舊版 741e94f1／5e910dd2 會把 AA_295、AA_313 改過的句子蓋回；date_prefs 兩個檔＠5e910dd2）',/白名單/.test(DATE_LINES.source)&&/BB_128[^＋]*@ab9d70fe0/.test(DATE_LINES.source)&&/AA_127[^＋]*@482c7f6e9/.test(DATE_LINES.source)&&DATE_LINES.source.includes('date_prefs_bb.json@5e910dd2')&&Object.keys(DATE_LINES.lines).length===7,DATE_LINES.source);
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; G.flags.dating_heroine_03=false; R('heroine_03',...LV.CLO);
  { const st=DATE.stageNum('heroine_03'); if(st<5){ const r=SOCIAL.rel('heroine_03'); r.npcRom=60; r.rom=40; r.fam=70; r.trust=60; r.comf=60; } }
  said=[]; opts=[]; picks=['淡水','明天','15:00','就這樣約']; await DATE.menu(GM,'heroine_03',null);
  const ln=lines(); check('9. 約成：語彤的「答應」（手機、連發兩則：「好。」「我跟阿姨說那天不顧店。」）；麵店沒公休那天不說「店裡公休」',ln.some(x=>/（手機）：好。$/.test(x))&&ln.some(x=>/我跟阿姨說那天不顧店。/.test(x))&&!ln.some(x=>/公休/.test(x)),ln.join(' | '));
  check('9. 句子也寫進手機的對話串',(G.msgs||[]).some(m=>m.th==='p:heroine_03'&&/不顧店/.test(m.text)),JSON.stringify((G.msgs||[]).slice(-3)));
  said=[]; picks=['淡水',DATE.dayLabel(G,day+2).split('（')[0],'15:00','就這樣約']; await DATE.menu(GM,'heroine_03',null);
  check('9. 第二次約：沒有別句可以輪（公休那句今天不能用）→ 還是同一句',lines().some(x=>/不顧店/.test(x)),lines().join(' | '));
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; G.flags.dating_heroine_03=true; said=[]; picks=['淡水','明天','15:00','就這樣約']; await DATE.menu(GM,'heroine_03',null);
  check('9. 和她交往中：「答應（和她交往中）」那一句',lines().some(x=>/阿姨說，那天她自己顧。/.test(x)),lines().join(' | '));
  // 交通偏好：語彤 D09 想搭捷運 → 預設選、排第一；改開車她說一句
  { const b22=OUT.BG.d22_base_afternoon; delete OUT.BG.d22_base_afternoon; const no22=!DATE.listable('D22'); OUT.BG.d22_base_afternoon=b22;   /* 10-23 起 D22 有底圖了：暫時拿掉底圖測「有台詞、沒底圖＝不列」這條規則 */
  check('9. 有台詞、沒底圖的地點（D22 暫時拿掉底圖）不列在約會清單；放回去＝列；烏來 D20 有底圖、有台詞＝列（32 個地點台詞全部匯入以後，2026-10-21）',!!DATE_LINES.loc.D22&&no22&&!!b22&&DATE.listable('D22')&&!!DATE_LINES.loc.D20&&DATE.listable('D20')); }
  DATE_LINES.loc.D09={lines:{}};   /* 測交通偏好用：假裝貓空的台詞到了 */
  fresh(day,9,'dorm',{}); G.contacts.heroine_03=1; G.flags.dating_heroine_03=true; said=[]; opts=[]; picks=['貓空','開車','明天','14:00','就這樣約']; const tc=await DATE.menu(GM,'heroine_03',null);
  check('9. 交通：她的偏好（捷運）排第一、寫「（她想這樣去）」',opts[2]&&/（她想這樣去）/.test(opts[2][0])&&/捷運/.test(opts[2][0]),JSON.stringify(opts[2]));   /* opts[1]＝「山・溫泉・夜景」那一類（INVITE-MENU-1030）*/
  check('9. 玩家改開車：約成、她說「改交通」那一句（不扣分）',tc&&tc.transport==='car'&&lines().some(x=>/坐你的車也可以/.test(x)),lines().join(' | '));
  // 改時間、第三次、取消、放鴿子
  fresh(day,9,'dorm',{}); const tm2=DATE.book(G,{who:'heroine_01',locs:['D13'],transport:'mrt',day,depart:15}); const tr2=DATE.trip(G,tm2.trip), qm2=OUT.get(G,'date_'+tm2.trip);
  said=[]; picks=['改到明天同一個時間']; await DATE.move(GM,qm2,tr2); check('9. 改時間：以安「改時間」那一句（輪流第 1 句）',lines().some(x=>/新的時間我改好了/.test(x)),lines().join(' | '));
  said=[]; picks=['改到明天同一個時間']; await DATE.move(GM,qm2,tr2); check('9. 再改一次：輪到第 2 句',lines().some(x=>/下午我空得出來/.test(x)),lines().join(' | '));
  said=[]; picks=['改到明天同一個時間']; await DATE.move(GM,qm2,tr2); check('9. 同一個行程改到第三次：「第三次了。」那一句',tr2.moves===3&&lines().some(x=>/第三次了。/.test(x)),lines().join(' | '));
  said=[]; picks=['改到明天同一個時間']; await DATE.move(GM,qm2,tr2); check('9. 第四次：照一般改時間（第三次那句只說一次）',!lines().some(x=>/第三次了/.test(x))&&lines().some(x=>/新的時間|空得出來/.test(x)),lines().join(' | '));
  said=[]; await DATE.drop(GM,qm2,tr2); check('9. 今天不去了：以安「取消」那一句（連發：「好。理由？」「……好。下次你要說理由。」）、還沒有 FLAKED',!G.flags.FLAKED_heroine_01&&lines().some(x=>/好。理由？/.test(x))&&lines().some(x=>/下次你要說理由/.test(x)),lines().join(' | '));
  const tm3=DATE.book(G,{who:'heroine_01',locs:['D13'],transport:'mrt',day:day+1,depart:15}); said=[]; await DATE.drop(GM,OUT.get(G,'date_'+tm3.trip),DATE.trip(G,tm3.trip));
  check('9. 30 天內第二次取消：FLAKED、放鴿子那一句（AA_389 第 7 點：「第二次了。我在手帳上記了一筆。」「……下次證明我記錯。」）',G.flags.FLAKED_heroine_01!=null&&lines().some(x=>/第二次了。我在手帳上記了一筆。/.test(x))&&lines().some(x=>/下次證明我記錯。/.test(x))&&!lines().some(x=>/他會臨時取消/.test(x)),lines().join(' | '));
  check('9. 輪流的位置存在 dateLog（存檔裡；讀檔補預設）',!!DATE.log(G,'heroine_01').lineIdx&&DATE.log(G,'heroine_01').lineIdx.move===3&&DATE.log(G,'heroine_01').lineIdx.move3===1,JSON.stringify(DATE.log(G,'heroine_01').lineIdx));
  // ---------- 10 睡覺的鬧鐘、跳過時間的停點（DATE-S4；AA_128 4-1）----------
  { fresh(day,22,'dorm',{dating_heroine_03:true}); G.contacts.heroine_03=1; const t=DATE.book(G,{who:'heroine_03',locs:['D13'],transport:'mrt',day:day+1,depart:11});
    const A=STORY.wakeAlarms(G,day+1).find(a=>/淡水/.test(a.why)); check('10. 明天 11:00 的約會：鬧鐘 10:30（出發前 30 分鐘）',!!A&&Math.abs(A.h-10.5)<1e-6,JSON.stringify(A));
    const noon=STORY.bedOptions(G).find(o=>o.kind==='sleep'&&/中午/.test(o.t)); check('10. 晚上上床「睡到明天中午」：鬧鐘 10:30 叫醒、提示寫約會',!!noon&&Math.abs(noon.wake-10.5)<1e-6&&/淡水/.test(noon.hint)&&/10:30/.test(noon.hint),JSON.stringify(noon));
    G.day=day+1; G.weekday=(G.weekday+1)%7; G.hour=9;
    const nap=STORY.napOptions(G,2).find(o=>o.t==='小睡 2 小時'); check('10. 當天 09:00 小睡 2 小時：10:30 叫醒（不是 11:00）',!!nap&&Math.abs(nap.to-10.5)<1e-6&&/出發前 30 分鐘/.test(nap.hint),JSON.stringify(nap));
    const eve=STORY.bedOptions(G).find(o=>/睡到傍晚/.test(o.t)); check('10. 「睡到傍晚（不設鬧鐘）」：提示會錯過約會',!!eve&&/會錯過：11:00 和/.test(eve.hint),eve&&eve.hint);
    const st=CLS.skipStops(GM,14); check('10. 跳過時間到 14:00：停在 10:50（出發前 10 分鐘）',st.length&&Math.abs(st[0].h-(11-1/6))<1e-6&&/出發時間/.test(st[0].why),JSON.stringify(st));
    DATE.trip(G,t.trip).status='cancelled'; check('10. 取消以後：沒有鬧鐘、不停',!STORY.wakeAlarms(G,day+1).some(a=>/淡水/.test(a.why))&&!CLS.skipStops(GM,14).some(q=>/出發時間/.test(q.why))); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

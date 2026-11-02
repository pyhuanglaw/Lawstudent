// DL-04B 劇情保護剩的兩項（AA_160 第 3 節 R1、R2；1-3 第 3 點、1-5、1-8 第 8 點）——不需要瀏覽器。
// 檢查：
//   R2 路上的事件：一鍵上課「直接去上課」從宿舍到 201，中間經過的區域（男生宿舍 → 校園 → 法律系館A）有到達時就會演的【固】【必】事件＝停在那一區，
//      照常進去讓事件演，演完出「繼續去上課」（S.oneTick），選了照 1-3 接著走、時間照實際的算；沒有這種事件＝照舊直接到；【延】【約】、要走近的、隨機的不停；
//      真實資料：ev_almost_late（快遲到，週二校園 enter）照 AA_160 3-4 C 是【延】，路上不攔。
//   1-5 翹課確認：這一堂課裡（上課前 beforeClass、下課後 afterClass）有【固】【必】事件時多一行「你會錯過：○○」（一般的說法、最多三件）；沒有＝只有原本那句。
//      真實資料：大一上第 4 週週四翹民總 →「你會錯過：同學的報告分組…」（ev_an_report_split，規格的例子）。
// 修改前（開發分支 885010347，2026-11-01 實際跑過）：一鍵上課直接瞬移到 201，不停在校園（第 1 項 FAIL）；翹課確認只有「翹掉○○？記「沒去」，不扣分。」（第 5 項 FAIL）——FAILED 24。修改後 ALL PASS。
// 用法：node tests/dl04b_class_stops_unit.js
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
let said=[], menus=[], picks=[], caps=[], enters=[], seatCalls=[], G=null;
const E={q:{level:'medium'},player:{busy:false,riding:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,paused:false};
/* 進區域：記下區域和落點；進 201 時放 3 排 × 4 的座位（同 dl01_oneclick_unit）*/
const seats=()=>{ const its=[]; for(let r=0;r<3;r++) for(let c=0;c<4;c++){ const seat={x:c*0.8,z:r*1.2,yaw:Math.PI,lv:0,row:r+1,col:c+1}; its.push({x:seat.x,z:seat.z,seat}); } return its; };
const GM={get G(){ return G; },E,D:{active:false},npc:{},S:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(w,t)=>caps.push(t),sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  enter:async(z,sp)=>{ enters.push({z,sp:sp||null}); G.zone=z; E.npcs=[]; E.interactables=z==='classroom'?seats():[]; const p=E.player.obj.position; if(sp){ p.x=sp.x; p.z=sp.z; } else { p.x=0; p.z=0; } },
  seatMenu:async(it,so)=>{ seatCalls.push({seat:it.seat,so}); },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ menus.push(o.map(q=>(q.t||q.text)+(q.hint?'〔'+q.hint+'〕':''))); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const FL={introDone:true,classDone:true,afternoonDone:true,campusIntro:true};
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},FL,flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},courses:{},invites:[],visited:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; menus=[]; picks=[]; caps=[]; enters=[]; seatCalls=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; if(CLS.clearPending) CLS.clearPending(); };
const hm=h=>CLS.hhmm(h);
const flush=async()=>{ for(let i=0;i<20;i++) await new Promise(r=>setImmediate(r)); };
/* S.oneTick 要連續空下來 1.5 秒、至少 3 次 tick 才出待出的選單：把時鐘往前撥 */
const realNow=Date.now; let fake=realNow();
const tickUntilMenu=async(n)=>{ Date.now=()=>(fake+=600); try{ for(let i=0;i<(n||12);i++){ CLS.oneTick(GM); await flush(); if(menus.length) break; } } finally { Date.now=realNow; } await flush(); };
const THU=STORY.termDay('Y1S1',4,4);   /* 大一上第 4 週週四：13:20 民法總則（201）*/
const civ=()=>CLS.dayItems(G).find(q=>q.c.id==='civ_general'&&!q.exam);
const TEST_ID='ev_test_dl04b_campus';
const addTest=(o)=>{ const e=Object.assign({ id:TEST_ID, title:'（測試）路上的事', participants:[], location:'campus', trigger:'enter', term:['Y1S1'], weekday:[4], once:true, background:'blur', dialogue:[{speaker:null,text:'（測試）校園上的事。'}] },o||{}); STORY_EVENTS.unshift(e); return e; };
const dropTest=()=>{ for(let i=STORY_EVENTS.length-1;i>=0;i--) if(/^ev_test_dl04b/.test(STORY_EVENTS[i].id)) STORY_EVENTS.splice(i,1); };
(async()=>{
  /* ---------- 0. 前提 ---------- */
  fresh(THU,12,'dorm'); const it0=civ();
  check('0. 前提：大一上第 4 週週四有 13:20 民法總則（201），可以一鍵上課',!!it0&&Math.abs(it0.t0-(13+20/60))<1e-6&&it0.room.zone==='classroom'&&CLS.canGo(GM)==='',JSON.stringify({it:it0&&it0.c.id,why:CLS.canGo(GM)}));
  check('0. 路線：宿舍房間 → 男生宿舍 → 校園 → 法律系館A → 201（中間三區）',JSON.stringify(CLS.routeVia&&CLS.routeVia('dorm','classroom'))===JSON.stringify(['dorm_hall','campus','linze']),JSON.stringify(CLS.routeVia&&CLS.routeVia('dorm','classroom')));
  check('0. 路線：法律系館A → 201 中間沒有別的區；兩點半 → 溫州街 → 公館 → 校園 → 法律系館A；國外的區域不知道路線（不停）',
    CLS.routeVia&&CLS.routeVia('linze','classroom').length===0&&JSON.stringify(CLS.routeVia('cafe','classroom'))===JSON.stringify(['wenzhou','gongguan','campus','linze'])&&CLS.routeVia('us_apartment','classroom').length===0);
  check('0. 3-1 的分類：keep 照寫；沒寫的有 weeks／time／afterClass／beforeClass＝【固】、其他＝【延】',CLS.evKeep&&CLS.evKeep({keep:'must'})==='must'&&CLS.evKeep({time:[9,10]})==='fixed'&&CLS.evKeep({afterClass:'x'})==='fixed'&&CLS.evKeep({weeks:[1]})==='fixed'&&CLS.evKeep({})==='defer'&&CLS.evKeep({keep:'defer',time:[9,10]})==='defer');

  /* ---------- 1. 【必】的 enter 事件在校園（1-8 第 8 點）：停在校園演完，再「繼續去上課」 ---------- */
  { fresh(THU,12,'dorm'); const ev=addTest({keep:'must'}); const it=civ(); const pl=CLS.goPlan(GM,it); G.hour=pl.depart;
    const ok=await CLS.goClass(GM,it);
    check('1. 一鍵上課停在校園（沒有直接進 201）',enters.length===1&&enters[0].z==='campus',JSON.stringify(enters));
    const sp=enters[0]&&enters[0].sp; check('1. 站在法律系館A前（要走進去的那一棟門口）',!!sp&&sp.x===34&&sp.z===-98,JSON.stringify(sp));
    check('1. 到校園的時間＝出門＋（全程−校園到 201 的路程）：'+hm(pl.depart)+' 出門、'+hm(pl.depart+(pl.mins-8)/60)+' 到校園',Math.abs(G.hour-(pl.depart+(pl.mins-8)/60))<1e-6,hm(G.hour)+'（全程 '+pl.mins+' 分）');
    check('1. 旁白「走路往法律系館A去。」；goClass 回 false、排了「繼續去上課」',caps.includes('走路往法律系館A去。')&&ok===false&&!!(CLS.pending().cont&&CLS.pending().cont.key===it.key),JSON.stringify({caps,cont:CLS.pending().cont}));
    // 照常進去：STORY.onEnter → EVENTS.onEnter（這裡直接叫）
    said=[]; EVENTS.onEnter('campus'); await flush();
    check('1. 進校園時這個【必】事件照常演（EVENTS.onEnter）',!!G.events.done[TEST_ID]&&said.some(s=>s.t==='（測試）校園上的事。'),JSON.stringify(said.map(s=>s.t)));
    const hEv=G.hour; menus=[]; picks=[0]; await tickUntilMenu();
    check('1. 演完出「繼續去上課：民法總則」（S.oneTick）',(menus[0]||[])[0]&&/^繼續去上課：民法總則/.test(menus[0][0])&&/先不去了/.test(menus[0][1]||''),JSON.stringify(menus[0]));
    check('1. 選了以後接著走：校園 → 201，坐下自動上課（seatMenu autoClass）',enters.map(q=>q.z).join('>')==='campus>classroom'&&seatCalls.length===1&&seatCalls[0].so&&seatCalls[0].so.autoClass===true,JSON.stringify({enters:enters.map(q=>q.z),seat:seatCalls.length}));
    const rest=CLS.goPlan({G:Object.assign({},G,{zone:'campus'}),E:{player:{obj:{position:{x:34,z:-98}}}}},it).mins;
    check('1. 時間照實際的算：校園那一段 '+rest+' 分鐘，'+hm(hEv)+' → '+hm(G.hour)+'（事件沒花時間＝準時 13:10）',Math.abs(G.hour-(hEv+rest/60))<1e-6&&Math.abs(G.hour-(it.t0-1/6))<1e-6,hm(G.hour));
    check('1. 事件只演一次（沒有在 201 再停）',G.events.done[TEST_ID]===1);
    dropTest(); }

  /* ---------- 1b. 事件花了時間：照實際的算、可能遲到（遲到照現有規則，CLS.attend 記）---------- */
  { fresh(THU,12,'dorm'); addTest({keep:'must',dialogue:[{speaker:null,text:'（測試）花了二十分鐘。',advance:20/60}]}); const it=civ(); const pl=CLS.goPlan(GM,it); G.hour=pl.depart;
    await CLS.goClass(GM,it); EVENTS.onEnter('campus'); await flush(); menus=[]; picks=[0]; await tickUntilMenu();
    check('1b. 事件演了 20 分鐘：「繼續去上課」的提示寫會遲到',/會遲到 \d+ 分鐘/.test((menus[0]||[])[0]||''),JSON.stringify(menus[0]));
    check('1b. 到 201 的時間＝事件結束＋校園到 201 的路程（13:30，遲到 10 分鐘）',enters.map(q=>q.z).join('>')==='campus>classroom'&&Math.abs(G.hour-(13.5))<1e-6,hm(G.hour));
    dropTest(); }

  /* ---------- 2. 沒有這種事件：照舊直接到 ---------- */
  { fresh(THU,12,'dorm'); const it=civ(); const pl=CLS.goPlan(GM,it); G.hour=pl.depart; await CLS.goClass(GM,it);
    check('2. 沒有要停的事件（真實資料，大一上第 4 週週四中午）：直接到 201、13:10、坐下自動上課',enters.map(q=>q.z).join('>')==='classroom'&&Math.abs(G.hour-(it.t0-1/6))<1e-6&&seatCalls.length===1&&!(CLS.pending().cont),JSON.stringify({enters:enters.map(q=>q.z),h:hm(G.hour),caps})); }

  /* ---------- 3. 不停的：【延】【約】、要走近的、隨機的、只要人在場的；有 time 沒寫 keep 的照 3-1 算【固】＝停 ---------- */
  const goOnce=async(o)=>{ fresh(THU,12,'dorm'); addTest(o); const it=civ(); const pl=CLS.goPlan(GM,it); G.hour=pl.depart; await CLS.goClass(GM,it); const z=enters.map(q=>q.z).join('>'); dropTest(); return z; };
  check('3. 【延】（keep defer）：不停，直接到 201',await goOnce({keep:'defer'})==='classroom');
  check('3. 沒寫 keep、沒有日期週次時段＝【延】：不停',await goOnce({term:undefined})==='classroom');
  check('3. 【約】（keep promise）：不停',await goOnce({keep:'promise'})==='classroom');
  check('3. 沒寫 keep、有時段（12:00～14:00）＝【固】：停在校園',await goOnce({time:[12,14]})==='campus');
  check('3. 【固】但時段已經過了（11:00～12:00）：到校園時條件不成立，不停',await goOnce({keep:'fixed',time:[11,12]})==='classroom');
  check('3. 【必】但是隨機的（random_weight）：不停',await goOnce({keep:'must',random_weight:0.5})==='classroom');
  check('3. 【必】但要走近某人（auto＋near）、要人在旁邊（npcNear）：不停',await goOnce({keep:'must',trigger:'auto',near:{npc:'heroine_01',r:4}})==='classroom'&&await goOnce({keep:'must',trigger:'auto',npcNear:'heroine_01'})==='classroom');
  check('3. 【必】的 auto（不用走近、不是隨機）在校園：也停（到了就會演）',await goOnce({keep:'must',trigger:'auto'})==='campus');
  check('3. 【必】但地點是 any（不是這一區的事）：不停',await goOnce({keep:'must',location:'any'})==='classroom');
  check('3. 【必】在法律系館A大廳（第三段）：停在法律系館A、出生點照大廳',await goOnce({keep:'must',location:'linze'})==='linze');
  { fresh(THU,12,'dorm'); addTest({keep:'must'}); const it=civ(); const pl=CLS.goPlan(GM,it); G.hour=it.t0-3/60; G.flags.examForced=1; await CLS.goClass(GM,it,{forced:true}); check('3. 考試帶進考場（forced）不停',enters.map(q=>q.z).join('>')==='classroom'); dropTest(); }

  /* ---------- 4. 真實資料：ev_almost_late（快遲到，週二 9:54～10:15 校園 enter）是【延】（AA_160 3-4 C）---------- */
  { const A=STORY_EVENTS.find(e=>e.id==='ev_almost_late'); check('4. ev_almost_late 標 keep defer（有 time，沒寫會被當成【固】）',!!A&&!!CLS.evKeep&&CLS.evKeep(A)==='defer');
    const TUE=STORY.termDay('Y1S1',6,2); fresh(TUE,9,'dorm'); const base=CLS.dayItems({day:THU,hour:7,flags:{},courses:{}}).find(q=>q.c.id==='civ_general'&&!q.exam);
    const fake={...base,day:TUE,key:'fake_tue',t0:10+20/60,t1:12};   /* 週二 10:20 在 201 的課（真的課表沒有，只用來算路上的時間）*/
    const pl=CLS.goPlan(GM,fake); G.hour=pl.depart; const st=CLS.routeStop&&CLS.routeStop(GM,fake,pl);
    const arr=pl.depart+(pl.mins-8)/60; check('4. 前提：到校園的時間（'+hm(arr)+'）在快遲到的時段裡',arr>=9.9&&arr<10.25);
    check('4. 【延】：路上不停',st===null,JSON.stringify(st));
    const k=A.keep; delete A.keep; const st2=CLS.routeStop&&CLS.routeStop(GM,fake,pl); A.keep=k;
    check('4. 對照：拿掉 keep（照 3-1 算【固】）就會停在校園（表示上面的「不停」是 keep 造成的）',!!st2&&st2.zone==='campus'&&st2.ev==='ev_almost_late',JSON.stringify(st2)); }

  /* ---------- 5. 翹課確認（1-5）：這一堂課裡的【固】【必】 ---------- */
  { fresh(THU,8,'dorm'); const it=civ(); const done0=JSON.stringify(G.events.done), h0=G.hour, z0=G.zone; picks=['翹']; await CLS.skipClass(GM,it); const L=said.map(s=>s.t);
    check('5. 第一行照舊：「翹掉民法總則？記「沒去」，不扣分。」',L[0]==='翹掉民法總則？記「沒去」，不扣分。',L[0]);
    check('5. 大一上第 4 週週四翹民總：多一行「你會錯過：同學的報告分組…」（ev_an_report_split，以安在場當作會在）',/^你會錯過：/.test(L[1]||'')&&(L[1]||'').includes('同學的報告分組')&&/。$/.test(L[1]||''),L[1]);
    check('5. 只寫一般的說法（沒有人名、沒有事件標題原文「民總的報告」）',!/以安|阿哲|學姊|民總的報告/.test(L[1]||''),L[1]);
    check('5. 預告不改任何狀態（事件紀錄、時間、地點照舊）；翹了照記 plan_skip',JSON.stringify(G.events.done)===done0&&G.hour===h0&&G.zone===z0&&CLS.planSkip(G,it),JSON.stringify(G.events.done));
    check('5. 選項照舊只有兩個：翹／還是去',JSON.stringify(menus[0])===JSON.stringify(['翹','還是去']),JSON.stringify(menus[0])); }
  { fresh(THU,8,'dorm'); G.events.done.ev_an_report_split=1; const it=civ(); const got=CLS.classMissList?CLS.classMissList(G,it):null;
    check('5. 分組演過了：不再列「同學的報告分組」',Array.isArray(got)&&!got.includes('同學的報告分組'),JSON.stringify(got)); }
  /* 沒有事件的課：只有原本那一句 */
  const plainItem=()=>{ for(let d=THU-3;d<=THU+1;d++){ fresh(d,7,'dorm'); const q=CLS.dayItems(G).find(q=>!q.exam&&q.c.kind!=='service'&&CLS.classEvs&&!CLS.classEvs(G,q).length); if(q) return q; } return null; };
  { const it=plainItem();
    check('5. 前提：第 4 週有一堂沒有課前、下課事件的課',!!it,it&&(it.c.id+'@'+it.day));
    if(it){ picks=['翹']; await CLS.skipClass(GM,it); const L=said.map(s=>s.t); check('5. 沒有【固】【必】：只有原本那一句，沒有「你會錯過」',L.length===1&&!L.some(t=>/你會錯過/.test(t)),JSON.stringify(L)); } }
  /* 最多三件、【延】不列、同樣的說法只寫一次、沒有說法的寫「上課前的事／下課後的事」*/
  { const it=plainItem();
    if(it){ const cid=it.c.id;
      STORY_EVENTS.unshift({id:'ev_test_dl04b_b1',title:'某某的秘密',participants:[],location:'any',trigger:'class',beforeClass:cid,once:true,keep:'must',dialogue:[]},
                           {id:'ev_test_dl04b_a1',title:'下課',participants:[],location:'any',trigger:'class',afterClass:cid,once:true,keep:'fixed',dialogue:[]},
                           {id:'ev_test_dl04b_a2',title:'也演',participants:[],location:'any',trigger:'class',afterClass:cid,classAlso:true,once:true,dialogue:[]});
      CLS.MISS_TEXT.ev_test_dl04b_a1='同學的報告分組';
      const got=CLS.classMissList(G,it);
      check('5. 上課前【必】＋下課後【固】＋接著演的（沒寫 keep、afterClass＝【固】）＝三件；沒有說法的寫「上課前的事」「下課後的事」，不寫標題原文',JSON.stringify(got)===JSON.stringify(['上課前的事','同學的報告分組','下課後的事']),JSON.stringify(got));
      STORY_EVENTS.find(e=>e.id==='ev_test_dl04b_a2').keep='defer'; const got2=CLS.classMissList(G,it);
      check('5. 【延】不列',JSON.stringify(got2)===JSON.stringify(['上課前的事','同學的報告分組']),JSON.stringify(got2));
      CLS.MISS_TEXT.ev_test_dl04b_b1='同學的報告分組'; const got3=CLS.classMissList(G,it);
      check('5. 同樣的說法只寫一次',JSON.stringify(got3)===JSON.stringify(['同學的報告分組']),JSON.stringify(got3));
      delete CLS.MISS_TEXT.ev_test_dl04b_a1; delete CLS.MISS_TEXT.ev_test_dl04b_b1; dropTest(); } }
  /* 下課選單的「下一堂不去」也走同一個確認 */
  { fresh(THU,10.2,'gongtong'); const en=CLS.dayItems(G).find(q=>q.c.id==='english_y1'); if(en) CLS.rec(G).done[en.key]=1; picks=['下一堂不去','翹']; await CLS.afterMenu(GM,en&&en.key); const L=said.map(s=>s.t);
    check('5. 下課選單選「下一堂不去」（民總）：確認一樣列「你會錯過：同學的報告分組」',L.some(t=>t==='翹掉民法總則？記「沒去」，不扣分。')&&L.some(t=>/^你會錯過：.*同學的報告分組/.test(t)),JSON.stringify(L)); }

  /* 6 遲到要記下來（BB-B 11-01 讀碼：CLS.attend 原本快轉到下課才問 S.isLate＝lateMin 整堂課、永遠記不進 R.late；DL-04B 以前就有）*/
  { const plain=CLS.dayItems({day:THU,hour:7,flags:{},courses:{}}).find(q=>q.c.id==='civ_general'&&!q.exam);
    fresh(THU,plain.t0+5/60,'classroom'); const it=civ(); await CLS.attend(GM,it,{inScene:true}); const R=CLS.rec(G);
    fresh(THU,plain.t0-2/60,'classroom'); const it2=civ(); await CLS.attend(GM,it2,{inScene:true}); const R2=CLS.rec(G);
    check('6. 開始後 5 分鐘進教室：上完記遲到（R.late）、出席照算；準時進教室：不記遲到',!!R.late[it.key]&&(R.attend[it.c.id]|0)>=1&&!R2.late[it2.key]&&R2.done[it2.key]===1,JSON.stringify({late:R.late,late2:R2.late})); }
  /* 7 經濟系事件接事件（ECONFF.on）：路上不停（S.oneTick 不跑，停了「繼續去上課」出不來；BB-B 11-01 讀碼）*/
  { const had=typeof ECONFF!=='undefined'?ECONFF:undefined; let off=null, on='x';
    try{ addTest({keep:'must'}); fresh(THU,7,'dorm'); const it=civ(); const pl=CLS.goPlan(GM,it); G.hour=pl.depart; global.ECONFF={on:()=>false}; off=CLS.routeStop(GM,it,pl); global.ECONFF={on:()=>true}; on=CLS.routeStop(GM,it,pl); }
    finally { dropTest(); if(had===undefined) delete global.ECONFF; else global.ECONFF=had; }
    check('7. 同一個校園【必】事件：平常會停；ECONFF.on（經濟系事件接事件）＝不停',!!off&&on===null,JSON.stringify({off:!!off,on})); }

  /* 8 門口上課（法圖櫃台的服務學習）：「直接去上課」到了就報到（BB-B 11-01 BUG-DL04B-SERVICE-RESUME：destOf 有 zone 就把 door 丟掉＝走選座位、沒有座位停住；在路上停過、沒停過都一樣）*/
  { const WED=STORY.dayOfKey('2025-10-08'); fresh(WED,13.53,'wancai'); const it=CLS.dayItems(G).find(q=>q.c.kind==='service'); const pl=it&&CLS.goPlan(GM,it);
    const r=it?await CLS.goClass(GM,it):null; const R=CLS.rec(G);
    check('8. 服務學習（一）從萬才館「直接去上課」：路線有 door（lawlib_desk）、到法圖報到、記第 1 次、done',!!it&&!!pl&&pl.d.door==='lawlib_desk'&&r===true&&!!R.done[it.key]&&G.zone==='lawlib'&&(R.attend[it.c.id]|0)===1&&said.some(s=>/第一次報到/.test(s.t)),JSON.stringify({d:pl&&pl.d,r,done:it&&R.done[it.key],said:said.map(s=>s.t).slice(0,2)})); }
  /* 8 有 room 的（共同 102、普通 101、博思 101）照舊選座位：路線不帶 door */
  { fresh(THU,7,'dorm'); const it={c:{id:'x'},room:{zone:'gongtong',room:'102',door:'common'},t0:13.3,day:G.day,key:'x'}; const pl=CLS.goPlan(GM,it);
    check('8. 有 room 的教室（共同 102）：路線不帶 door（照舊選座位）',!!pl&&!pl.d.door,JSON.stringify(pl&&pl.d)); }

  /* 9 快速前往（手機「地點」）的 R2：CLS.routeStopTo——路上的【必】到達事件停在那一區；約好的地方（force）、經濟系事件接事件不停；沒有事件不停；game3d.js quickGo 接上 */
  { let a=null,f=null,e=null,n=null; const had=typeof ECONFF!=='undefined'?ECONFF:undefined;
    try{ addTest({keep:'must'}); fresh(THU,7,'dorm'); a=CLS.routeStopTo(GM,'linze',12); f=CLS.routeStopTo(GM,'linze',12,{force:true}); global.ECONFF={on:()=>true}; e=CLS.routeStopTo(GM,'linze',12); }
    finally { dropTest(); if(had===undefined) delete global.ECONFF; else global.ECONFF=had; }
    fresh(THU,7,'dorm'); n=CLS.routeStopTo(GM,'linze',12);
    const gs=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), wire=/CLS\.routeStopTo\(GM,z,st\.mins,\{bike:st\.bike,force:!!\(o&&o\.force\)\}\)/.test(gs);
    check('9. 快速前往宿舍→霖澤館：路上校園有【必】的到達事件＝停在校園；force、經濟系事件接事件、沒有事件＝不停；quickGo 接上',!!a&&a.zone==='campus'&&f===null&&e===null&&n===null&&wire,JSON.stringify({a,f,e,n,wire})); }

  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

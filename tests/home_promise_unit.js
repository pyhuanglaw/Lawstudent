// 答應媽媽回家（HOME-PROMISE-1027，使用者 X116「答應媽媽放假回家結果假日還在宿舍?周末跟可昕有約」；AA_488 第 1、2、3、5 節，AA-C 961a3a8a0）——不需要瀏覽器。
//   1. 週四家人群組回「會回去」→ 記下約定（那個週末：週五 17:00～週日 21:30）；考試週、舊存檔（週末已過）不記
//   2. 週六 07:00～11:00 在宿舍：提醒「（這週末答應媽媽要回家。）」回家／晚一點／這次不回去；回家＝HOME.go、回到家＝kept
//   3. 這次不回去＝群組祐廷「這週回不去了」＋媽媽那一週「這週不回」那一句、told、下一個週四照平常；晚一點＝16:00 以後再一次（回家／這次不回去）
//   4. 都沒理：週六 18:30「回來了沒」（現在回去／這週回不去了）→ 週日 21:30「菜冰起來了」、missed → 下一個週四媽媽那一句前面多「上禮拜煮多了 吃了三天」（只有一次）
//   5. 「回來了沒」回現在回去：空下來就回家；過了 20:00 才到＝晚餐換「（媽媽把菜熱了一次。）」；回這週回不去了＝told
//   6. 姊姊：first_sis 那一週沒說沒回去＝週六 21:00「我等到九點」；母親節那一週＝週日 21:00「媽今天一直看手機」
//   7. 颱風假：提醒不出、told、不發訊息
// 修改前（c3d003d0b）：第 0 項 FAIL（沒有 HPROM）。用法：node tests/home_promise_unit.js
const H=require('./pg_harness.js'); const {check,GM}=H; const fs=require('fs'), vm=require('vm'), path=require('path');
let loaded=false; try{ let src=fs.readFileSync(path.join(H.ROOT,'src/homepromise3d.js'),'utf8'); src=src.replace(/^const HPROM\s*=/m,'globalThis.HPROM='); vm.runInThisContext(src,{filename:'homepromise3d.js'}); loaded=typeof HPROM!=='undefined'; }catch(e){ console.log(String(e)); }
check('0. 載入 homepromise3d.js（HPROM，掛在 STORY.PHONE_RULES、STORY.TICKS）',loaded&&STORY.PHONE_RULES.some(f=>/S\.rules/.test(String(f)))&&STORY.TICKS.some(f=>/S\.tick/.test(String(f))));
if(!loaded) H.done();
const J=JSON.stringify, K=d=>CALENDAR.dateOf(d).key;
const goes=[]; HOME.go=async()=>{ goes.push([K(H.G.day),+H.G.hour.toFixed(2)]); HOME.rec(H.G).at=true; return true; };   /* 回家的流程（轉場、到家、家裡的選單）不在這裡測：記下來、當作到家 */
const at=(d,h,zone)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) G.zone=zone; };
const step=()=>{ HOME.phoneRules(GM); HPROM.rules(H.G); PHONE.tick(H.G); };
const thursdays=(tid)=>{ const out=[]; for(let d=-60;d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===tid&&CALENDAR.dateOf(d).wd===4) out.push(d); } return out; };
const kindOn=(d,fl)=>{ H.fresh(K(d),20,'dorm',fl); const g=HOME.grpPick(H.G,d); return g&&g.k; };
/* 一個平常的週四（第 4 週以後、這週末沒有國定假日）*/
const TH=thursdays('Y1S1').find(d=>CALENDAR.termOf(d).week>=4&&/^(p1|p3|old)$/.test(kindOn(d)||'')&&!CALENDAR.holiday(d+1)&&!CALENDAR.holiday(d+4));
const ask=(d,ans,fl)=>{ H.fresh(K(d),19.9,'dorm',fl); at(d,20.05); step(); const m=PHONE.byAsk(H.G,'home_ask_'+d); if(m&&ans!=null) PHONE.answer(H.G,'home_ask_'+d,ans); HPROM.rules(H.G); return m; };
const tick=()=>{ const r=HPROM.tick(GM); return r; };
const flush=()=>new Promise(r=>setTimeout(r,5));
const grp=()=>(H.G.msgs||[]).filter(m=>m.th==='g:home').map(m=>(m.from==='player'?'祐廷':m.name||m.from)+'：'+m.text);
(async()=>{
  check('前提：找得到平常的週四',TH!=null,TH!=null?K(TH):'');
  // 1
  { const m=ask(TH,0); const p=HPROM.get(H.G);
    check('1. 週四回「會回去」→ 記下約定：那個週末（週五 17:00～週日 21:30）、open、媽媽「這週不回」那幾句',!!m&&!!p&&p.st==='open'&&p.ask===TH&&p.from===(TH+1)*24+17&&p.to===(TH+3)*24+21.5&&p.rd===TH+2&&p.no.length>0,J(p));
    H.fresh(K(TH),19.9,'dorm'); at(TH,20.05); step(); PHONE.answer(H.G,'home_ask_'+TH,1); HPROM.rules(H.G); check('1. 回「這週不回」：沒有約定',!HPROM.get(H.G));
    const EX=thursdays('Y1S1').find(d=>kindOn(d)==='exam'); if(EX!=null){ ask(EX,0); check('1. 考試週（exam「考完再回來」）：不算約定',!HPROM.get(H.G),K(EX)); }
    ask(TH,0); H.G.home.promise=null; at(TH+4,10); HPROM.rules(H.G); check('1. 舊存檔：答應的週末已經過了才讀進來＝不補',!HPROM.get(H.G)); }
  // 2
  { ask(TH,0); at(TH+2,7.5,'dorm'); H.said=[]; H.opts=[]; H.picks=['回家']; goes.length=0; const r=tick(); await flush(); await flush();
    check('2. 週六 07:30 在宿舍：提醒「（這週末答應媽媽要回家。）」，三個選項',r===true&&H.has(HPROM.REMIND)&&J(H.opts[0])===J(['回家','晚一點','這次不回去']),J(H.opts));
    check('2. 選「回家」：照回家的流程（HOME.go）',goes.length===1,J(goes)); HPROM.rules(H.G);
    check('2. 回到家＝kept',HPROM.get(H.G).st==='kept'); H.said=[]; at(TH+2,9,'dorm'); HOME.rec(H.G).at=false; check('2. 提醒只出一次',tick()===false); }
  { ask(TH,0); at(TH+2,6.5,'dorm'); check('2. 07:00 以前不提醒',tick()===false); at(TH+2,8,'campus'); check('2. 不在宿舍不提醒',tick()===false); at(TH+2,8,'dorm'); HOME.rec(H.G).at=true; HPROM.rules(H.G); check('2. 已經回到家（kept）不提醒',tick()===false); }
  // 3
  { ask(TH,0); at(TH+2,8,'dorm'); H.picks=['這次不回去']; tick(); await flush(); await flush(); PHONE.tick(H.G); const p=HPROM.get(H.G), g=grp();
    check('3. 這次不回去：群組祐廷「這週回不去了」＋媽媽那一週的「這週不回」那一句、told',p.st==='told'&&g.includes('祐廷：這週回不去了')&&p.no.every(t=>g.includes('媽媽：'+t)),J(g.slice(-3)));
    at(TH+7,20.05); step(); const g2=grp(); check('3. 說了不回去：下一個週四照平常（沒有多的那一則）',!g2.some(t=>/上禮拜煮多了/.test(t)),J(g2.slice(-2))); }
  { ask(TH,0); at(TH+2,8,'dorm'); H.picks=['晚一點']; H.opts=[]; tick(); await flush(); await flush(); at(TH+2,12,'dorm'); const r1=tick(); at(TH+2,16.2,'dorm'); H.picks=['這次不回去']; const r2=tick(); await flush(); await flush();
    check('3. 晚一點：16:00 以後在宿舍再一次，只有「回家」「這次不回去」',r1===false&&r2===true&&J(H.opts[1])===J(['回家','這次不回去'])&&HPROM.get(H.G).st==='told',J(H.opts)); }
  // 4
  { ask(TH,0); for(const h of [8,12,18.6]){ at(TH+2,h,'campus'); step(); } const m=PHONE.byAsk(H.G,'home_ask_back_'+(TH+2));
    check('4. 都沒理：週六 18:30 媽媽「回來了沒」，選項 現在回去／這週回不去了',!!m&&m.text==='回來了沒'&&J(m.ask.opts.map(o=>o.t))===J(['現在回去','這週回不去了']),J(m&&m.text));
    at(TH+2,20.6,'campus'); step(); check('4. 兩小時沒回：爸爸「？」（home3d.js 照 home_ask_ 的規則）',grp().some(t=>/^爸爸：？/.test(t)),J(grp().slice(-2)));
    at(TH+3,21.6,'campus'); step(); const p=HPROM.get(H.G); check('4. 週日 21:30 還是沒回去、也沒回：missed、媽媽「菜冰起來了」',p.st==='missed'&&grp().includes('媽媽：菜冰起來了'),J(grp().slice(-2)));
    at(TH+7,20.05,'dorm'); step(); const g=grp(), i=g.indexOf('媽媽：上禮拜煮多了 吃了三天');
    check('4. 下一個週四：媽媽那一句前面多「上禮拜煮多了 吃了三天」',i>=0&&i===g.length-2,J(g.slice(-3)));
    at(TH+14,20.05,'dorm'); step(); check('4. 只有那一次',grp().filter(t=>t==='媽媽：上禮拜煮多了 吃了三天').length===1); }
  // 5
  { ask(TH,0); at(TH+2,18.6,'campus'); step(); at(TH+2,19.5,'campus'); PHONE.answer(H.G,'home_ask_back_'+(TH+2),0); HPROM.rules(H.G); goes.length=0; const r=tick(); await flush();
    check('5. 回「現在回去」：空下來就回家',r===true&&goes.length===1,J(goes));
    check('5. 19:30 回、到家 20:12（過了 20:00）：晚餐換「（媽媽把菜熱了一次。）」，只有一次',HOME.lateDinner(H.G)===HPROM.LATE&&HOME.lateDinner(H.G)===null); }
  { ask(TH,0); at(TH+2,18.6,'campus'); step(); PHONE.answer(H.G,'home_ask_back_'+(TH+2),1); HPROM.rules(H.G); check('5. 回「這週回不去了」：told',HPROM.get(H.G).st==='told'); }
  { const src=fs.readFileSync(path.join(H.ROOT,'src/home3d.js'),'utf8'); check('5. home3d.js 晚餐：有 lateDinner 就不說「（晚餐。媽媽煮了一桌。）」',/const late=S\.lateDinner\?S\.lateDinner\(G\):null; if\(late\) await GM\.say\(null,late\); else \{/.test(src)); }
  // 6
  { ask(TH,0); HPROM.get(H.G).k='first_sis';   /* first_sis 只在大一上第一個週四、週六在 1～7 號（「禮拜六回來吃飯 你姊也回來」）；2025 年兩種開局都碰不到，直接把那一週的種類換掉測規則 */
    for(const h of [8,18.6,21.1]){ at(TH+2,h,'campus'); step(); } check('6. first_sis 那一週沒說沒回去：週六 21:00 姊姊「我等到九點」',(H.G.msgs||[]).some(m=>m.th==='p:sister'&&m.text==='我等到九點'));
    const MO=thursdays('Y1S2').find(d=>kindOn(d)==='mom'); if(MO!=null){ ask(MO,0); for(const [dd,h] of [[2,18.6],[3,21.1]]){ at(MO+dd,h,'campus'); step(); } check('6. 母親節那一週沒說沒回去：週日 21:00 姊姊「媽今天一直看手機」',(H.G.msgs||[]).some(m=>m.th==='p:sister'&&m.text==='媽今天一直看手機'),K(MO));
      at(MO+7,20.05,'dorm'); step(); check('6. 母親節那一週：下一個週四不加媽媽那一則',!grp().some(t=>/上禮拜煮多了|還在冰箱/.test(t))); } else check('6. 找得到母親節那一週',false); }
  // 7
  { ask(TH,0); const ty0=CALENDAR.typhoon; CALENDAR.typhoon=d=>d===TH+2||(ty0?ty0(d):false); HPROM.rules(H.G); const p=HPROM.get(H.G); at(TH+2,8,'dorm'); const r=tick(); CALENDAR.typhoon=ty0;
    check('7. 颱風假：told、提醒不出、不發訊息',p.st==='told'&&p.ty===true&&r===false&&!grp().includes('祐廷：這週回不去了')); }
  H.done();
})();

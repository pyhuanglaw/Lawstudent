// E08（USER_WANTS：「3d做機場 旅館 街景 這種都我給妳CG」「機場的也是阿」，10-16 21:49、10-17 00:0x）：3D 桃園機場出境大廳用在寒暑假出國、日本路線出發——不需要瀏覽器。
// 原本只有美國交換（exchange3d.js）會進 3D 的 airport_dep；寒暑假出國（vac3d.js：出國活動、C13 自己排的出國旅遊、VA10）、日本路線 3/25 和以安一起出發（y34b3d.js）是 2D 的機場圖。
// 現在照美國那一趟：字卡 → 3D 出境大廳（一起出發的人跟著）→ 安檢入口「登機」（或一小時以後自動登機）→ 原本的流程接著演 → 回到出發前的地方。
//   E1 從 3D（宿舍）出發的 C13：進大廳、等登機（OUT 不再問、不算沒去、不能回家、「搭車離開」拿掉）→「登機」→「飛往〇〇」字卡、深色底（AA_478 第 1 節，2026-10-27 改：原本是模糊的大廳）→ 整趟照演、只出一次「去機場」字卡 → 回宿舍
//   （AA_478 的其他項目：tests/e08_hall_unit.js）
//   E2 一小時以後自動登機；E3 人不在大廳了＝直接登機；E4 在大廳存檔、讀檔（JSON）以後照樣登機；舊存檔沒有 AIR_DEP＝「登機」照舊只是告示
//   E5 放假住家裡從家裡「出發」：家裡的選單收起來、到大廳；演完回臺北的家（字卡「回臺北的家」）
//   E6 一起出發的人：C13 和誰去、C05 阿凱、VA10 麵店團；C11、C12 的以安（到了才遇到）不算；跟著走、不能搭話
//   E7 日本路線 3/25：出境大廳演報到櫃台那一段（地點字幕、不換 2D 背景）→「登機」→ 登機口（2D＋CG-22）→ 飛往日本 → 抵達、進據點；當天紀錄一筆
//   E8 沒有 3D 機場＝照原本（2D 一口氣演完）
// 修改前（7dacc9463）：E1～E7 FAIL（沒有 EXCH.airGo；OUT.go 直接演整趟、departJP 直接飛）。用法：node tests/e08_airport_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
if(typeof VAC!=='undefined'&&VAC.airReg) VAC.airReg();   /* 單元測試的載入順序（vac3d.js 在 exchange3d.js 前面）：補登記；遊戲裡照 index.html exchange3d.js 在前 */
const {check,GM,E}=H;
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, now=()=>T(H.G.day,H.G.hour);
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
GM.memo=t=>{ (H.G.memo||(H.G.memo=[])).push(t&&typeof t==='object'?Object.assign({day:H.G.day},t):{day:H.G.day,t}); };   /* 同 game3d.js 的 memo（當天的紀錄）*/
const spawned=[]; GM.spawnCharacter=(id,x,z,o)=>{ const n={id,obj:{position:{x,y:0,z},rotation:{y:0}},beh:o&&o.beh,talk:o&&o.talk,talkLabel:o&&o.talkLabel,greet:o&&o.greet,followOff:o&&o.extra&&o.extra.followOff}; GM.npc[id]=n; spawned.push(n); return n; };
const settle=async(ok)=>{ for(let i=0;i<400&&!(ok&&ok());i++) await new Promise(r=>setImmediate(r)); };
const hall=()=>{ E.interactables=[{x:0,z:-13.8,radius:2.5,label:'登機',airportBoard:true,look:'今天沒有要搭的飛機。'},{x:-4,z:18.6,radius:1.4,label:'搭車離開（回台北）',exit:{to:'gongguan',spawn:{x:-2.5,z:-29,yaw:0}}}]; };   /* us3d.js 出境大廳的兩個互動點（單元測試沒有 3D 區域）*/
const board=()=>STORY.interact({x:0,z:-13.8,radius:2.5,label:'登機',airportBoard:true,look:'今天沒有要搭的飛機。'},GM);
const tick=()=>typeof EXCH.airTick==='function'?EXCH.airTick(GM):null, pending=G=>typeof EXCH.airPending==='function'?EXCH.airPending(G):false;   /* 修改前沒有這些：照樣跑完、每一項各自 FAIL */
const goCards=()=>H.cards.filter(c=>c[1]==='去機場 約 1 小時').length;
const plan=async(key,h,who)=>{ H.fresh(key,h,'dorm'); spawned.length=0; caps.length=0; if(who) H.FAMILIAR(who); H.picks=['韓國',who?'和'+SOCIAL.displayName(who):'自己去','5 天',0]; await VAC.plan13(GM); const r=(VAC.rec(H.G).t13||[])[0], q=OUT.get(H.G,'vac_t13_1'); return {r,q}; };
const atDue=q=>{ H.G.day=q.day; H.G.weekday=CALENDAR.dateOf(q.day).wd%7; H.G.hour=q.h-1; };
(async()=>{
  check('0. 接線：EXCH.airGo／airBoard／airTick、S.AIR 有 vac 和 jp；story3d.js 的安檢入口「登機」轉給 EXCH；OUT.go 的包裝、OUT.STAGE；OUT.go 有 noCard',
    typeof EXCH!=='undefined'&&typeof EXCH.airGo==='function'&&typeof EXCH.airBoard==='function'&&typeof EXCH.airTick==='function'&&!!(EXCH.AIR&&EXCH.AIR.vac&&EXCH.AIR.jp)
    &&/it\.airportBoard&&typeof EXCH!=='undefined'&&EXCH\.interact/.test(fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'))&&!!OUT._vacAir&&OUT.STAGE.includes(VAC.airStage)&&/o&&o\.noCard/.test(fs.readFileSync(path.join(H.ROOT,'src/outings3d.js'),'utf8')));

  /* ===================== E1 從宿舍出發的 C13 ===================== */
  { const {r,q}=await plan('2026-07-01',10); atDue(q); hall(); H.entered=[]; H.cards=[]; H.bgs=[];
    const ok=await OUT.go(GM,q); const A=H.G.flags.AIR_DEP;
    check('E1. 出發：原本那張字卡（標題＋「去機場 約 1 小時」）→ 進 3D 出境大廳（airport_dep）；還沒演旅程',ok===false&&H.entered.join()==='airport_dep'&&H.G.zone==='airport_dep'&&goCards()===1&&!r.done&&!H.G.flags.BACK_FROM_T13,JSON.stringify([ok,H.entered,H.cards]));
    check('E1. 等登機：G.flags.AIR_DEP＝{k:vac, q}、那一趟出遊 airport（OUT 不再問「出發」、過了時間也不算沒去）、記得從宿舍出發',!!A&&A.k==='vac'&&A.q===q.id&&q.state==='airport'&&!!q.airFrom&&q.airFrom.zone==='dorm'&&!q.airHome&&!OUT.due(H.G),JSON.stringify([A,q.state,q.airFrom]));
    { const h0=H.G.hour; H.G.hour=h0+3; const ex=OUT.expire(H.G); H.G.hour=h0; check('E1. 等登機的時候過了出發時間：不會被當成沒去',!ex.includes(q)&&q.state==='airport'); }
    check('E1. 等登機的時候不能回臺北的家（手機「地點」沒有「回臺北的家」）',!HOME.canGo(H.G));
    hall(); const t1=tick();
    check('E1. 大廳：「搭車離開（回台北）」拿掉、「登機」還在；還不到一小時不自動登機',t1===false&&!E.interactables.some(it=>it.exit)&&E.interactables.some(it=>it.airportBoard),JSON.stringify(E.interactables.map(it=>it.label)));
    H.cards=[]; H.bgs=[]; const b=await board();
    check('E1. 安檢入口「登機」：照原本整趟演完（done、BACK_FROM_T13）；登機以後不再出「去機場」字卡，第一張是「飛往韓國｜首爾　約 2 小時半」（AA_478 1-1）；接著是深色底（人在飛機上，不是模糊的大廳）',b===true&&r.done===true&&H.G.flags.BACK_FROM_T13===r.to&&goCards()===0&&JSON.stringify(H.cards[0])===JSON.stringify(['飛往韓國','首爾\u3000約 2 小時半'])&&H.bgs[0]==='dark'&&!H.G.flags.AIR_DEP&&q.state==='done',JSON.stringify([b,r.done,H.cards.slice(0,3),H.bgs.slice(0,2)]));
    check('E1. 演完回到出發前的地方（宿舍）、不是留在機場',H.G.zone==='dorm'&&H.entered[H.entered.length-1]==='dorm',JSON.stringify(H.entered)); }

  /* ===================== E2 一小時以後自動登機 ===================== */
  { const {r,q}=await plan('2026-07-01',10); atDue(q); hall(); await OUT.go(GM,q); const at0=(H.G.flags.AIR_DEP||{}).at||now();
    H.G.hour+=0.5; const a=tick(); H.G.hour=at0-H.G.day*24+1.01; const b=tick(); await settle(()=>q.state==='done');
    check('E2. 進大廳 30 分鐘還在等；一小時以後自動登機（同美國那一趟），整趟照演、回宿舍',a===false&&b===true&&r.done===true&&q.state==='done'&&H.G.zone==='dorm'&&!H.G.flags.AIR_DEP,JSON.stringify([a,b,q.state,H.G.zone])); }

  /* ===================== E3 人不在大廳了 ===================== */
  { const {r,q}=await plan('2026-07-01',10); atDue(q); hall(); await OUT.go(GM,q); H.G.zone='campus';
    const a=tick(); await settle(()=>q.state==='done');
    check('E3. 等登機的時候人不在大廳了（手機「地點」走了）：直接登機、整趟照演',a===true&&r.done===true&&q.state==='done'&&!H.G.flags.AIR_DEP,JSON.stringify([a,q.state])); }

  /* ===================== E4 存檔、讀檔 ===================== */
  { const {q}=await plan('2026-07-01',10); atDue(q); hall(); await OUT.go(GM,q);
    const saved=JSON.stringify(H.G); H.G=JSON.parse(saved); SOCIAL.bind(H.G); EVENTS.bind(GM); hall();   /* 讀檔：區域重蓋（互動點又是兩個）*/
    const q2=OUT.get(H.G,q.id), r2=VAC.rec(H.G).t13[0]; const a=tick();
    check('E4. 讀檔以後還在大廳等登機（AIR_DEP、airport 都在存檔裡）：「搭車離開」照樣拿掉',a===false&&pending(H.G)&&q2.state==='airport'&&!E.interactables.some(it=>it.exit));
    const before=!r2.done&&H.G.zone==='airport_dep'; await board(); check('E4. 讀檔以後按「登機」照樣整趟演完、回宿舍（登機以前還沒演）',before&&r2.done===true&&q2.state==='done'&&H.G.zone==='dorm',JSON.stringify([before,r2.done,q2.state,H.G.zone])); }
  { H.fresh('2026-07-06',10,'airport_dep'); hall(); const pend=pending(H.G), b=await board();
    check('E4. 舊存檔（沒有 AIR_DEP）在出境大廳：沒有要搭的飛機——「登機」照舊只是告示（STORY.interact 不接）；可以回家',!pend&&b===false&&tick()===false&&E.interactables.some(it=>it.exit)); }

  /* ===================== E5 放假住家裡，從家裡出發 ===================== */
  { const {r,q}=await plan('2026-07-01',10); atDue(q); const Hm=HOME.rec(H.G); Hm.at=true; Hm.day=H.G.day; const B=HOME.lawBreak(H.G); Hm.lbreak=B.key; Hm.brk=B.key; Hm.bskip={key:B.key,n:0,last:-1};
    H.entered=[]; H.cards=[]; let menus=[]; const ch=GM.choose; GM.choose=async o=>{ const L=o.map(x=>x.t||x.text); menus.push(L); const k=L.findIndex(t=>/^出發：出國旅遊/.test(t)); if(k>=0) return k; const j=L.indexOf('回宿舍住'); return j>=0?j:0; };
    try{ await HOME.loop(GM); } finally{ GM.choose=ch; }
    check('E5. 放假住家裡：家裡的選單「出發」→ 字卡 → 出境大廳；家裡的選單收起來（不在家、沒有被送回家）',menus.some(L=>L.some(t=>/^出發：出國旅遊/.test(t)))&&!HOME.at(H.G)&&H.G.zone==='airport_dep'&&q.state==='airport'&&q.airHome===true&&goCards()===1,JSON.stringify([H.entered,q.state,HOME.at(H.G)]));
    hall(); H.cards=[]; await board();
    check('E5. 登機、整趟演完：回臺北的家（字卡「回臺北的家」、人在家、放假模式還在）',r.done===true&&HOME.at(H.G)&&HOME.breakMode(H.G)&&H.cards.some(c=>c[0]==='回臺北的家')&&!pending(H.G),JSON.stringify([r.done,HOME.at(H.G),H.cards.slice(-2)])); }

  /* ===================== E6 一起出發的人 ===================== */
  { const {q}=await plan('2026-07-01',10,'zhe'); atDue(q); hall(); await OUT.go(GM,q); const A=H.G.flags.AIR_DEP||{}, n=GM.npc.zhe;
    check('E6. C13 和阿哲去：大廳裡阿哲跟著你（follow、不能搭話、不揮手）',JSON.stringify(A.with)===JSON.stringify(['zhe'])&&!!n&&n.beh==='follow'&&n.talk===null&&n.talkLabel===null&&n.greet===false,JSON.stringify([A.with,n&&{beh:n.beh,talk:n.talk,greet:n.greet}])); }
  { H.fresh('2026-07-20',10,'dorm'); H.FAMILIAR('kai'); H.FAMILIAR('heroine_01'); H.FAMILIAR('zhe'); H.FAMILIAR('yu'); H.FAMILIAR('classmate_bohan');
    const w=(key,k)=>VAC.airWith?VAC.airWith(H.G,{vac:{key,k}}):[];
    check('E6. 一起出發的人：C05 阿凱、VA10 麵店團（阿哲、Alison、柏翰）；C11、C12 大二的以安是到了才遇到（不算）；C08 首爾（系上的團）沒有',
      JSON.stringify(w('C05@Y1','trip'))===JSON.stringify(['kai'])&&JSON.stringify(w('VA10','va10'))===JSON.stringify(['zhe','yu','classmate_bohan'])&&w('C12@Y2','trip').length===0&&w('C11@Y2','trip').length===0&&w('C08@Y1','trip').length===0,
      JSON.stringify([w('C05@Y1','trip'),w('VA10','va10'),w('C12@Y2','trip'),w('C08@Y1','trip')]));
    check('E6. 哪幾趟走出境大廳：出國活動（C05、C08、C10…）、C13、VA10；營隊、上班日、海邊、出國活動的前置不走',!!VAC.abroadTrip&&VAC.abroadTrip({vac:{key:'C05@Y1',k:'trip'}})&&VAC.abroadTrip({vac:{key:'C08@Y1',k:'trip'}})&&VAC.abroadTrip({vac:{key:'T13#1',k:'trip'}})&&VAC.abroadTrip({vac:{key:'VA10',k:'va10'}})
      &&!VAC.abroadTrip({vac:{key:'C02@Y1',k:'trip'}})&&!VAC.abroadTrip({vac:{key:'C16@Y2',k:'w'}})&&!VAC.abroadTrip({vac:{key:'C01#Y2',k:'c01'}})&&!VAC.abroadTrip({vac:{key:'C08@Y1',k:'pre0'}})&&!VAC.abroadTrip({id:'x'})); }

  /* ===================== E7 日本路線 3/25 一起出發 ===================== */
  { H.fresh('2028-03-25',8,'dorm',{EXCHANGE_ROUTE:'JP',EXCH_RULE:1,X1_JP:D('2028-02-20')}); H.G.acts={att:{}}; H.G.outings=[]; H.G.visited={}; GM.npc={}; HOME.rec(H.G).at=true; H.FAMILIAR('heroine_01'); H.date('heroine_01'); H.FAMILIAR('zhe'); PHONE.join(H.G,'noodle_team','麵店團');
    H.said=[]; H.cgs=[]; H.cards=[]; H.bgs=[]; H.entered=[]; caps.length=0; H.G.memo=[];
    const r=await Y34B.departJP(GM); const A=H.G.flags.AIR_DEP||null, img=b=>b&&typeof b==='object'&&/airport_departure/.test(b.image||'');
    check('E7. 出發：字卡「出發｜桃園機場第二航廈」→ 進 3D 出境大廳（還沒飛、還沒進日本）；離開臺北的家；以安跟著',r===true&&H.entered.join()==='airport_dep'&&H.G.zone==='airport_dep'&&H.cards.some(c=>c[1]==='出發｜桃園機場第二航廈')&&H.G.flags.JP_DEPARTED==null&&!HOME.at(H.G)&&!!A&&A.k==='jp'&&JSON.stringify(A.with)===JSON.stringify(['heroine_01'])&&H.G.flags.AN_SENDOFF==='together',JSON.stringify([H.entered,A]));
    check('E7. 大廳那一段（台詞照舊）：「行李我量過了，二十二公斤。……你的呢？」、麵店團、「好。走吧。」；地點字幕「桃園機場・出境大廳」但不換 2D 機場圖（背景是模糊的 3D 大廳）；登機口那一段還沒演',
      H.has('行李我量過了，二十二公斤。……你的呢？')&&H.has('兩個人都要傳照片')&&H.has('好。走吧。')&&caps.includes('桃園機場・出境大廳')&&H.bgs.includes('blur')&&!H.bgs.some(img)&&!H.has('（她靠著窗，把手帳翻到四月那一頁。）')&&!H.cgs.length,JSON.stringify([H.bgs,caps]));
    check('E7. 等登機：不能回家、不會再出發一次',!HOME.canGo(H.G)&&!Y34B.sendoffJPDue(H.G));
    hall(); H.entered=[]; await board();
    check('E7. 安檢入口「登機」：登機口那一段（2D 機場圖、CG-22「她靠著窗」）→ 字卡「飛往日本」「抵達」→ 進日本的據點（jp_hub）、JP_DEPARTED',
      H.bgs.some(img)&&H.cgs.includes('cg_depart_together_heroine01')&&H.has('（她靠著窗，把手帳翻到四月那一頁。）')&&H.cards.some(c=>c[0]==='飛往日本')&&H.cards.some(c=>c[0]==='抵達')&&H.G.flags.JP_DEPARTED===D('2028-03-25')&&H.entered.includes('jp_hub')&&STORY.inJapan(H.G)&&!pending(H.G),JSON.stringify([H.entered,H.cards.map(c=>c[0])]));
    check('E7. 同一件事切成兩段演，當天紀錄只有一筆「一起出發」',H.G.memo.filter(m=>m&&m.t==='一起出發').length===1,JSON.stringify(H.G.memo)); }
  { H.fresh('2028-03-25',8,'dorm',{EXCHANGE_ROUTE:'JP',EXCH_RULE:1,X1_JP:D('2028-02-20')}); H.G.acts={att:{}}; H.G.outings=[]; GM.npc={}; H.FAMILIAR('heroine_01'); H.said=[];
    await Y34B.departJP(GM); const A=H.G.flags.AIR_DEP; H.G.hour+=1.01; tick(); await settle(()=>H.G.flags.JP_DEPARTED!=null);
    check('E7. 挽回中：沒有人跟著；一小時以後自動登機；「到了再說。」「（座位分開。）」都有',!!A&&A.with.length===0&&H.G.flags.JP_DEPARTED!=null&&H.has('到了再說。')&&H.has('（座位分開。）')&&H.G.zone==='jp_hub',JSON.stringify([A&&A.with,H.G.zone])); }

  /* ===================== E8 沒有 3D 機場＝照原本 ===================== */
  { const z0=EXCH.airZoneOk; EXCH.airZoneOk=()=>false;   /* 修改前沒有這個函式：設了也沒人看，照原本 */
    try{ const {r,q}=await plan('2026-07-01',10); atDue(q); H.entered=[]; await OUT.go(GM,q);
      const a=r.done===true&&!H.entered.includes('airport_dep')&&!pending(H.G);
      H.fresh('2028-03-25',8,'dorm',{EXCHANGE_ROUTE:'JP',EXCH_RULE:1,X1_JP:D('2028-02-20')}); H.G.acts={att:{}}; H.G.outings=[]; GM.npc={}; H.FAMILIAR('heroine_01'); H.date('heroine_01'); H.entered=[]; await Y34B.departJP(GM);
      check('E8. 沒有 3D 機場（EXCH.airZoneOk 為否）：C13 直接整趟演完、日本路線直接飛到據點（照原本）',a&&H.entered.join()==='jp_hub'&&H.G.flags.JP_DEPARTED!=null,JSON.stringify([a,H.entered])); }
    finally{ EXCH.airZoneOk=z0; } }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

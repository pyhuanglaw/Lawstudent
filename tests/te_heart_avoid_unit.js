// TE-HEART-AVOID-1104（BB-C 2026-11-04 20:17，只改條件、不改台詞；TE-HEART-EXEMPT-1104 的後續）：還沒回的一般期末邀約排日子時，避開語彤那一頓那一整晚，往後排到別的晚上。不需要瀏覽器。
//   a  週四考完的學期（大一上：最後一科 12/18 週四，三則同一晚傳來）：以安、子晴本來都排在 12/20（六）晚上＝現在避開語彤那一晚、排到 12/21；
//      語彤＋以安、語彤＋子晴都接得到（先接哪一個都一樣），兩頓在不同的晚上；一般的那一個名額照舊只能接一個（第三則照原本自動婉拒）
//   b  那一整晚：子晴 22:00 的宵夜和語彤 17:30 那一頓時間不重疊，也不排在她那一晚（第 1 點「同一天的晚上都不排」）；她那一頓答應了、或她那一則到了還沒回都算；
//      她那一則回了「那天有約了。」＝不避開；別人的邀約傳來的時間不動（第 2 點）
//   c  找不到別的晚上（期末週的窗口排滿）：照字面互斥——撞到的自動婉拒、console.info 記一筆「TE-HEART-AVOID 找不到別的晚上…」；不撞到的同一晚照樣排（22:00 宵夜）
//   d  第 5 點：語彤那一則到以前已經接了同一個週六的一般邀約、兩頓時間不重疊＝兩頓都留、不婉拒（重疊的照字面，tests/te_heart_exempt_unit.js c3）
//   e  舊存檔：這學期的名單沒有 exempt＝照原本（以安照舊排在 12/20、語彤那一則不發；沒有避開這件事）；新版的存檔已經排好的出遊不重排、讀檔以後照舊
//   f  第 3、4、6 點照原本：自己約語彤佔一般名額（te_heart_exempt c5）、阿凱的保底不經這裡、自己約的吃飯撞到照邀約系統原本（te_heart_exempt c4）
// 修改前（e25149ef0）：FAILED 16（a、b、c 照舊的做法；e、f 沒有 S.exEvening）；用法：node tests/te_heart_avoid_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify, YT='heroine_03', AN='heroine_01', ZQ='heroine_04', XC='classmate_xinci';
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const DK=k=>STORY.dayOfKey(k), K=d=>d==null?null:CALENDAR.dateOf(d).key, WD=d=>CALENDAR.dateOf(d).wd%7;
const at=(k,h)=>{ const d=typeof k==='number'?k:DK(k); H.G.day=d; H.G.hour=h; H.G.weekday=WD(d); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const EXID=(t,who)=>'te_ex_'+t+'_'+who;
const tag=(t,who)=>'te_'+t+'_'+who, ask=(t,who)=>PHONE.byAsk(H.G,tag(t,who));
const isOpen=(t,who)=>{ const m=ask(t,who); return !!m&&PHONE.askOpen(H.G,m); };
const ans=(t,who)=>{ const m=ask(t,who); return m?m.ans:undefined; };
const thread=who=>(H.G.msgs||[]).filter(m=>m.th==='p:'+who).map(m=>(m.from||'')+':'+m.text);
const outOf=id=>OUT.get(H.G,id), dayH=q=>q?[K(q.day),WD(q.day),q.h]:null;
const setup=(term,hearts,friends,flags)=>{ const w=TERMEND.windowOf(term); H.fresh('2025-09-01',9,'campus',flags); at(w.from,9); H.G.stage='law';
  for(const id of hearts){ H.rel(id,70,50,45); SOCIAL.rel(id).npcRom=40; DATE.log(H.G,id).count=4; DATE.log(H.G,id).wish=true; }
  const C={}; for(const id of friends){ H.rel(id,30,10,5); C[id]={pts:9,k:{}}; } H.G.termend={contact:{[term]:C},think:{}}; return w; };
let adj=[]; { const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ adj.push([id,J(d||{})]); return a0.apply(this,arguments); }; }
const negAdj=()=>adj.filter(([id,d])=>Object.values(JSON.parse(d)).some(v=>typeof v==='number'&&v<0));
/* console.info 收起來看（「TE-HEART-AVOID …」那幾筆）*/
let infos=[]; { const i0=console.info; console.info=function(){ const s=Array.from(arguments).map(String).join(' '); if(/^TE-HEART-AVOID /.test(s)) infos.push(s); else i0.apply(console,arguments); }; }
const FB=()=>infos.filter(s=>/^TE-HEART-AVOID 找不到別的晚上/.test(s));
/* 把時段裡其他晚上都排滿（別的出遊，17:00 以後；S.eveningBusy）：留下的那幾天不排 */
const fill=(w,keep)=>{ const K0=new Set(keep.map(DK)); for(let d=w.from;d<=w.to;d++) if(!K0.has(d)) OUT.plan(H.G,{id:'x_busy_'+d,ev:'ev_none',day:d,h:18,late:0.25,place:'別的地方',title:'別的約',travel:'',travelH:0.25}); };
const Y1=()=>H.G.termend.Y1S1;

(async()=>{
await sec(0,()=>{ check('0. 載得到 TERMEND、PHONE、OUT；有 S.exEvening、S.genDay、S.avInfo（TE-HEART-AVOID-1104）',typeof TERMEND!=='undefined'&&typeof TERMEND.exEvening==='function'&&typeof TERMEND.genDay==='function'&&typeof TERMEND.avInfo==='function'&&TERMEND_LINES.HEART[YT].examDay===true); });

/* ---------- a 週四考完（大一上）：三則都接得到（語彤＋一般的那一個），兩頓在不同的晚上 ---------- */
const aSetup=()=>{ const w=setup('Y1S1',[YT,AN,ZQ],[]); TERMEND.plan(H.G,w); at('2025-12-18',20); run(20,21); return w; };
await sec('a',async()=>{
  { const w=aSetup(), sYT=TERMEND.exNatural(H.G,w,YT), sAN=TERMEND.askSlot(H.G,w,AN,'heart'), sZQ=TERMEND.askSlot(H.G,w,ZQ,'heart');
    check('a. 前置：最後一科 12/18（四）＝時段第一天，三則同一晚傳來、都還沒回（傳來的時間照舊：20:30 起，第 2 點）',isOpen('Y1S1',YT)&&isOpen('Y1S1',AN)&&isOpen('Y1S1',ZQ)&&[AN,YT,ZQ].every(id=>K(ask('Y1S1',id).day)==='2025-12-18'&&ask('Y1S1',id).h>=20.5&&ask('Y1S1',id).h<21),J([AN,YT,ZQ].map(id=>ask('Y1S1',id)&&[K(ask('Y1S1',id).day),ask('Y1S1',id).h])));
    check('a. 會排在哪裡：語彤 12/20（六）17:30（考完以後的第一個週六）；以安、子晴避開她那一晚＝12/21（日）19:00、22:00（原本都在 12/20）',
      !!(sYT&&sAN&&sZQ)&&J([K(sYT.day),sYT.h])===J(['2025-12-20',17.5])&&J([K(sAN.day),sAN.h])===J(['2025-12-21',19])&&J([K(sZQ.day),sZQ.h])===J(['2025-12-21',22])&&!sAN.fb&&!sZQ.fb&&K(TERMEND.exEvening(H.G,w))==='2025-12-20',J([sYT,sAN,sZQ].map(s=>s&&[K(s.day),s.h,s.fb]))); }
  { aSetup(); adj=[]; infos=[]; PHONE.answer(H.G,tag('Y1S1',YT),0); rules();
    check('a. 先答應語彤：以安、子晴都還可以回（沒有自動婉拒）',!!Y1().heartPick&&isOpen('Y1S1',AN)&&isOpen('Y1S1',ZQ),J([ans('Y1S1',AN),ans('Y1S1',ZQ)]));
    PHONE.answer(H.G,tag('Y1S1',AN),0); rules(); const qx=outOf(EXID('Y1S1',YT)), qa=outOf('te_Y1S1');
    check('a. 再接以安：語彤 12/20（六）17:30、以安 12/21（日）19:00——兩頓都排、在不同的晚上；子晴照原本「只能接一個」自動婉拒（那天有約了）',
      !!qx&&J(dayH(qx))===J(['2025-12-20',6,17.5])&&!!qa&&qa.te.who===AN&&J(dayH(qa))===J(['2025-12-21',0,19])&&qa.day!==qx.day&&ans('Y1S1',ZQ)===1&&Y1().picked.who===AN,J({qx:dayH(qx),qa:dayH(qa),zq:ans('Y1S1',ZQ)}));
    check('a. 沒有扣任何數值；沒有「找不到別的晚上」那一筆',!negAdj().length&&!FB().length,J([negAdj(),infos])); }
  { aSetup(); adj=[]; infos=[]; PHONE.answer(H.G,tag('Y1S1',AN),0); rules();
    check('a. 先接以安（語彤那一則還沒回）：以安排在 12/21（日）19:00；語彤那一則還可以回',!!outOf('te_Y1S1')&&J(dayH(outOf('te_Y1S1')))===J(['2025-12-21',0,19])&&isOpen('Y1S1',YT),J([dayH(outOf('te_Y1S1')),ans('Y1S1',YT)]));
    PHONE.answer(H.G,tag('Y1S1',YT),0); rules();
    check('a. 再答應語彤：她那一頓 12/20（六）17:30；以安那一頓照舊；沒有扣任何數值',!!Y1().heartPick&&J(dayH(outOf(EXID('Y1S1',YT))))===J(['2025-12-20',6,17.5])&&outOf('te_Y1S1').te.who===AN&&!negAdj().length,J(dayH(outOf(EXID('Y1S1',YT))))); }
  { aSetup(); PHONE.answer(H.G,tag('Y1S1',ZQ),0); rules(); PHONE.answer(H.G,tag('Y1S1',YT),0); rules();
    check('a. 先接子晴、再答應語彤：子晴 12/21（日）22:00、語彤 12/20（六）17:30；以安自動婉拒',J(dayH(outOf('te_Y1S1')))===J(['2025-12-21',0,22])&&J(dayH(outOf(EXID('Y1S1',YT))))===J(['2025-12-20',6,17.5])&&ans('Y1S1',AN)===1,J([dayH(outOf('te_Y1S1')),dayH(outOf(EXID('Y1S1',YT)))])); }
  /* 朋友的邀約（最後一科在週五的大二下：原本隔天才傳來；TE-FRI-SAME-NIGHT-1104 起接在語彤那一則後面、同一個週五晚上到）也一樣避開 */
  { const w=setup('Y2S2',[YT],[XC]); TERMEND.plan(H.G,w); at('2027-06-11',20); run(20,21); PHONE.answer(H.G,tag('Y2S2',YT),0); rules(); at('2027-06-12',10); rules();
    const sx=TERMEND.askSlot(H.G,w,XC,'friend'); at('2027-06-12',20); run(20,21);
    check('a. 大二下（最後一科 6/11 週五）：語彤 6/12（六）17:30；芯慈的朋友邀約 6/11（五）20:39 接在語彤那一則後面到（TE-FRI-SAME-NIGHT-1104，原本 6/12 才到），排日子避開 6/12＝6/13 以後',K(outOf(EXID('Y2S2',YT)).day)==='2027-06-12'&&isOpen('Y2S2',XC)&&K(ask('Y2S2',XC).day)==='2027-06-11'&&ask('Y2S2',XC).h===20.65&&!!sx&&sx.day>DK('2027-06-12'),J([sx&&[K(sx.day),sx.h],ask('Y2S2',XC)&&K(ask('Y2S2',XC).day)]));
    PHONE.answer(H.G,tag('Y2S2',XC),0); rules();
    check('a. 接芯慈：排在 6/13 以後（不在語彤那一晚）',!!outOf('te_Y2S2')&&outOf('te_Y2S2').day>DK('2027-06-12'),J(dayH(outOf('te_Y2S2')))); }
});

/* ---------- b 那一整晚、什麼時候算她那一晚 ---------- */
await sec('b',async()=>{
  { const w=aSetup(); const sZQ=TERMEND.askSlot(H.G,w,ZQ,'heart'), nat=TERMEND.dinnerDay(H.G,w,Object.assign({},TERMEND.heart(ZQ,'Y1S1'),{h:22,teMode:'nat'}),ZQ);
    check('b. 子晴 22:00 的宵夜：照原本會排 12/20（六）、和語彤 17:30 那一頓時間不重疊——還是避開那一整晚（12/21）',K(nat)==='2025-12-20'&&!TERMEND.overlap(TERMEND.exNatural(H.G,w,YT),TERMEND.span(nat,22,0.25,0.25))&&!!sZQ&&K(sZQ.day)==='2025-12-21',J([K(nat),sZQ&&K(sZQ.day)])); }
  { const w=aSetup(); PHONE.answer(H.G,tag('Y1S1',YT),1); rules();
    check('b. 語彤那一則回了「那天有約了。」＝沒有她那一晚（不避開）：以安照原本排 12/20（六）19:00',TERMEND.exEvening(H.G,w)==null&&K(TERMEND.askSlot(H.G,w,AN,'heart').day)==='2025-12-20');
    PHONE.answer(H.G,tag('Y1S1',AN),0); rules(); check('b. 接以安＝12/20（六）19:00',J(dayH(outOf('te_Y1S1')))===J(['2025-12-20',6,19]),J(dayH(outOf('te_Y1S1')))); }
  { const w=setup('Y1S1',[YT,AN],[]); TERMEND.plan(H.G,w); at('2025-12-18',20); run(20,20.55);
    check('b. 語彤那一則還沒到（20:33，只有以安那一則到了）＝沒有她那一晚：以安照原本 12/20（六）',!ask('Y1S1',YT)&&TERMEND.exEvening(H.G,w)==null&&K(TERMEND.askSlot(H.G,w,AN,'heart').day)==='2025-12-20'); }
  { const w=aSetup(); PHONE.answer(H.G,tag('Y1S1',YT),0); rules();
    check('b. 她那一頓答應了＝排好的那一天（12/20）',K(TERMEND.exEvening(H.G,w))==='2025-12-20'&&!!outOf(EXID('Y1S1',YT))); }
});

/* ---------- c 找不到別的晚上：照字面互斥、console.info ---------- */
await sec('c1',async()=>{
  /* 時段 12/18～12/28 的晚上，除了 12/20（語彤那一晚）都排滿：她先答應 → 以安 19:00 只剩她那一晚、時間撞到＝自動婉拒＋記一筆；子晴 22:00 不撞到＝同一晚照樣排（照字面）*/
  const w=setup('Y1S1',[YT,AN,ZQ],[]); TERMEND.plan(H.G,w); fill(w,['2025-12-20']); at('2025-12-18',20); run(20,21);
  const sAN=TERMEND.askSlot(H.G,w,AN,'heart'), sZQ=TERMEND.askSlot(H.G,w,ZQ,'heart');
  check('c1. 前置：其他晚上都排滿；以安、子晴找不到別的晚上（fb）＝照字面算在 12/20（19:00、22:00）；三則都還沒回',!!sAN&&!!sZQ&&sAN.fb&&sZQ.fb&&K(sAN.day)==='2025-12-20'&&K(sZQ.day)==='2025-12-20'&&isOpen('Y1S1',YT)&&isOpen('Y1S1',AN)&&isOpen('Y1S1',ZQ),J([sAN,sZQ].map(s=>s&&[K(s.day),s.h,s.fb])));
  adj=[]; infos=[]; PHONE.answer(H.G,tag('Y1S1',YT),0); rules();
  check('c1. 答應語彤：以安（19:00，撞到）照字面自動婉拒——「那天有約了。」＋「好。那開學見。」；子晴（22:00，不撞到）還可以接',
    ans('Y1S1',AN)===1&&thread(AN).slice(-2).join('|')==='player:那天有約了。|'+AN+':'+TERMEND_LINES.HEART[AN].decline&&isOpen('Y1S1',ZQ),J([thread(AN).slice(-2),ans('Y1S1',ZQ)]));
  check('c1. console.info 記了一筆「TE-HEART-AVOID 找不到別的晚上：自動婉拒」（以安、12/20）',FB().length===1&&/找不到別的晚上：自動婉拒/.test(FB()[0])&&/heroine_01/.test(FB()[0])&&/2025-12-20/.test(FB()[0]),J(infos));
  infos=[]; PHONE.answer(H.G,tag('Y1S1',ZQ),0); rules(); const qz=outOf('te_Y1S1');
  check('c1. 接子晴：照字面排在同一晚 12/20（六）22:00（時間不撞到）＋記一筆「找不到別的晚上：一般的那一頓照字面排」；語彤那一頓照舊',!!qz&&qz.te.who===ZQ&&J(dayH(qz))===J(['2025-12-20',6,22])&&J(dayH(outOf(EXID('Y1S1',YT))))===J(['2025-12-20',6,17.5])&&FB().length===1&&/照字面排/.test(FB()[0])&&!TERMEND.overlap(TERMEND.span(qz.day,qz.h,0.25,0.25),TERMEND.exPlanned(H.G,w)),J({qz:dayH(qz),infos}));
  check('c1. 沒有扣任何數值',!negAdj().length,J(negAdj()));
});
await sec('c2',async()=>{
  /* 語彤那一則還沒回、先接以安、其他晚上都排滿：以安照字面排在她那一晚 19:00＋記一筆；她那一則和它撞到＝照「改天」（自動回「那天有約了。」「好。那我去上班。」）*/
  const w=setup('Y1S1',[YT,AN],[]); TERMEND.plan(H.G,w); fill(w,['2025-12-20']); at('2025-12-18',20); run(20,21);
  adj=[]; infos=[]; PHONE.answer(H.G,tag('Y1S1',AN),0); rules(); const qa=outOf('te_Y1S1');
  check('c2. 接以安：只剩 12/20＝照字面排在 12/20（六）19:00；記一筆「找不到別的晚上：一般的那一頓照字面排」',!!qa&&J(dayH(qa))===J(['2025-12-20',6,19])&&FB().length===1&&/照字面排/.test(FB()[0])&&!!Y1().avFb&&Y1().avFb[AN]!=null,J({qa:dayH(qa),infos}));
  check('c2. 語彤那一則和它撞到＝照「改天」：自動「那天有約了。」＋「好。那我去上班。」，不能再答應；另記一筆（不算「找不到別的晚上」那一筆）',
    ans('Y1S1',YT)===1&&thread(YT).slice(-2).join('|')==='player:那天有約了。|'+YT+':'+TERMEND_LINES.HEART[YT].decline&&PHONE.answer(H.G,tag('Y1S1',YT),0)===null&&infos.some(s=>/語彤那一則照「改天」（一般那一頓找不到別的晚上/.test(s))&&FB().length===1,J({yt:thread(YT).slice(-2),infos}));
  check('c2. 沒有扣任何數值',!negAdj().length,J(negAdj()));
});
await sec('c3',async()=>{
  /* 對照：其他晚上沒有排滿＝不記「找不到別的晚上」*/
  aSetup(); infos=[]; PHONE.answer(H.G,tag('Y1S1',YT),0); rules(); PHONE.answer(H.G,tag('Y1S1',AN),0); rules();
  check('c3. 對照：窗口沒有排滿＝不走照字面、沒有記任何一筆',!infos.length,J(infos));
});

/* ---------- d 第 5 點：她那一則到以前已經接了同一個週六的一般邀約，時間不重疊＝兩頓都留 ---------- */
await sec('d',async()=>{
  const HA=TERMEND_LINES.HEART[AN], h0=HA.h; HA.h=22;   /* 測試用：以安那一頓改到 22:00（和語彤 17:30 不重疊），測完改回來 */
  try{ const w=setup('Y1S1',[YT,AN],[]); TERMEND.plan(H.G,w); at('2025-12-18',20); run(20,20.55);
    check('d. 前置：20:33 只有以安那一則到了',isOpen('Y1S1',AN)&&!ask('Y1S1',YT));
    adj=[]; infos=[]; PHONE.answer(H.G,tag('Y1S1',AN),0); rules(); const qa=outOf('te_Y1S1');
    check('d. 先接以安：她那一則還沒到＝不避開，照原本排 12/20（六）22:00',!!qa&&J(dayH(qa))===J(['2025-12-20',6,22]),J(dayH(qa)));
    H.G.hour=20.7; STORY.phoneRules(GM); PHONE.tick(H.G); run(20.75,21);
    check('d. 語彤那一則 20:39 照樣傳到；和以安那一頓（22:00）時間不重疊＝不婉拒、還可以答應',!!ask('Y1S1',YT)&&isOpen('Y1S1',YT)&&!infos.length,J({yt:ans('Y1S1',YT),infos}));
    PHONE.answer(H.G,tag('Y1S1',YT),0); rules(); const qx=outOf(EXID('Y1S1',YT));
    check('d. 答應語彤：兩頓都留，同一個週六 12/20——語彤 17:30、以安 22:00（第 5 點）；沒有扣任何數值',!!qx&&J(dayH(qx))===J(['2025-12-20',6,17.5])&&!!outOf('te_Y1S1')&&J(dayH(outOf('te_Y1S1')))===J(['2025-12-20',6,22])&&!negAdj().length,J({qx:dayH(qx),qa:dayH(outOf('te_Y1S1'))})); }
  finally{ HA.h=h0; }
});

/* ---------- e 舊存檔 ---------- */
await sec('e',async()=>{
  { const w=setup('Y1S1',[YT,AN],[]); H.G.termend.Y1S1={plan:{back:DK('2025-12-18'),heart:[AN,YT],friend:[],fallback:null,gf:[],nope:{},kx:false}};   /* 舊版排的名單（沒有 exempt）*/
    H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G); at('2025-12-18',20); run(20,21);
    check('e. 舊版名單（沒有 exempt）：沒有她那一晚（S.exEvening＝null），以安照原本排 12/20',TERMEND.exEvening(H.G,w)==null&&K(TERMEND.askSlot(H.G,w,AN,'heart').day)==='2025-12-20');
    infos=[]; PHONE.answer(H.G,tag('Y1S1',AN),0); rules();
    check('e. 接以安＝12/20（六）19:00，語彤那一則照原本自動婉拒（只能接一個）；沒有記任何一筆',J(dayH(outOf('te_Y1S1')))===J(['2025-12-20',6,19])&&ans('Y1S1',YT)===1&&!infos.length&&!H.G.termend.Y1S1.avFb,J({qa:dayH(outOf('te_Y1S1')),yt:ans('Y1S1',YT),infos})); }
  { /* 新版（有 exempt）的存檔、已經排好的兩頓在同一晚（舊的程式在她那一則到以前先接了 22:00 那一頓）：讀檔以後不重排、不婉拒 */
    const w=setup('Y1S1',[YT,ZQ],[]); TERMEND.plan(H.G,w); at('2025-12-18',21); run(21,21.1);
    const R=H.G.termend.Y1S1; R.picked={who:ZQ,kind:'heart',day:DK('2025-12-18')}; R.heartPick={who:YT,kind:'heart',day:DK('2025-12-18')};
    OUT.plan(H.G,{id:'te_Y1S1',ev:'ev_termend_dinner',day:DK('2025-12-20'),h:22,late:0.25,place:'公館宵夜',title:'學期末的飯：子晴（公館宵夜）',travel:'走過去約 15 分鐘',travelH:0.25,te:{term:'Y1S1',who:ZQ,kind:'heart'}});
    OUT.plan(H.G,{id:EXID('Y1S1',YT),ev:'ev_termend_dinner',day:DK('2025-12-20'),h:17.5,late:0.25,place:'一盞茶屋',title:'學期末的飯：語彤（一盞茶屋）',travel:'走過去約 15 分鐘',travelH:0.25,te:{term:'Y1S1',who:YT,kind:'heart',ex:true}});
    H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G); infos=[]; at('2025-12-19',20); run(20,21);
    check('e. 已經排好的兩頓（12/20 17:30 語彤、22:00 子晴）讀檔以後照舊：不重排、不婉拒、沒有記任何一筆',J(dayH(outOf('te_Y1S1')))===J(['2025-12-20',6,22])&&J(dayH(outOf(EXID('Y1S1',YT))))===J(['2025-12-20',6,17.5])&&outOf('te_Y1S1').state==='planned'&&outOf(EXID('Y1S1',YT)).state==='planned'&&!infos.length,J({a:dayH(outOf('te_Y1S1')),b:dayH(outOf(EXID('Y1S1',YT))),infos})); }
});

/* ---------- f 第 3、4、6 點照原本 ---------- */
await sec('f',async()=>{
  { const w=setup('Y1S1',[],[]); const P=TERMEND.plan(H.G,w); at('2025-12-18',20); H.G.zone='dorm';
    check('f. 第 4 點：阿凱的保底照原本（名單沒有心意、朋友＝阿凱；宿舍 20:00 以後問）；沒有不佔名額的那一則＝沒有她那一晚',P.fallback==='kai'&&TERMEND.kaiDue(H.G)===true&&TERMEND.exEvening(H.G,w)==null); }
  { const src=fs.readFileSync(path.join(H.ROOT,'src/termend3d.js'),'utf8'), body=(src.match(/S\.kaiAsk=async function[\s\S]*?\n  \/\* ---- 飯/)||[''])[0], pp=(src.match(/S\.playerPicked=function[\s\S]*?\n  \/\* ---- TE-HEART-EXEMPT/)||[''])[0];
    check('f. 第 4、6 點：阿凱當面的宵夜、自己約的吃飯（S.playerPicked）不經 S.genDay（照原本；自己約的撞到照邀約系統原本，tests/te_heart_exempt_unit.js c4）',!!body&&!/genDay/.test(body)&&!!pp&&!/genDay/.test(pp)); }
  { const w=setup('Y1S1',[YT,AN],[]); TERMEND.plan(H.G,w); at('2025-12-18',21);
    check('f. 第 3 點：自己約語彤（期末的飯）＝照原本用一般名額（TERMEND.playerInvite 回 kind heart，不是不佔名額的那一頓）',J((TERMEND.playerInvite(H.G,YT,INVITE_DATA.places.find(p=>p.id==='noodle'),{day:DK('2025-12-20'),h:12+10/60})||{}).kind)===J('heart')); }
});

H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

// TE-HEART-EXEMPT-1104（BB-C 2026-11-04 19:15，只改條件、不改台詞）：語彤的心意邀約（HEART.heroine_03 寫 examDay 的那一則，AA_684 第 6 項）不佔「期末邀約只能接一個」的名額。不需要瀏覽器。
//   a  最後一科在週五的學期（大二下）：先答應語彤 → 別人的邀約照樣在隔天傳來、照樣可以接，兩頓都排；她那一頓吃完記 heartDone、一般名額的 done 不動
//   b  先接了別人（朋友的邀約、自己約的吃飯）→ 語彤那一則照樣傳來（不再不發）、照樣可以答應
//   c  撞到＝兩頓時間重疊（大一上：都在那個週六晚上）：兩則都先傳到、玩家選一個，另一個照「改天」（自動回「那天有約了。」＋她原本的婉拒句；玩家自己約的照「這次我有約了，開學見。」），不扣數值；
//      按「好。」的當下就處理（手機開著也一樣）、後到的那一則照樣傳到才回；22:00 的宵夜沒撞到＝照樣可以接
//   d  沒寫 examDay 的心意邀約照原本「只能接一個」；把語彤的 examDay 拿掉也一樣
//   e  舊存檔：這學期的名單沒有 exempt、已經有 picked＝照原本（語彤那一則照舊不發、答應她照舊佔名額）；新的欄位讀檔以後還在
//   f  y2r2_3d.js 的 yt11b（語彤的期末飯排在 6/17 就往後一天）也看得到不佔名額的那一頓
// 修改前（81b00d2e9）這些檢查有 FAIL；用法：node tests/te_heart_exempt_unit.js
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
const EXID=(t,who)=>'te_ex_'+t+'_'+who;   /* 不佔名額的那一頓的出遊 id（TERMEND.exId）；一般名額照舊 te_<學期> */
const tag=(t,who)=>'te_'+t+'_'+who, ask=(t,who)=>PHONE.byAsk(H.G,tag(t,who));
const isOpen=(t,who)=>{ const m=ask(t,who); return !!m&&PHONE.askOpen(H.G,m); };
const ans=(t,who)=>{ const m=ask(t,who); return m?m.ans:undefined; };
const thread=who=>(H.G.msgs||[]).filter(m=>m.th==='p:'+who).map(m=>(m.from||'')+':'+m.text);
const outOf=id=>OUT.get(H.G,id), dayH=q=>q?[K(q.day),WD(q.day),q.h]:null;
/* 這學期條件到齊的心意邀約（她的戀愛 40、4 次正式約會含心願地點）＋朋友的邀約（contact 9、FAMILIAR）*/
const setup=(term,hearts,friends,flags)=>{ const w=TERMEND.windowOf(term); H.fresh('2025-09-01',9,'campus',flags); at(w.from,9); H.G.stage='law';
  for(const id of hearts){ H.rel(id,70,50,45); SOCIAL.rel(id).npcRom=40; DATE.log(H.G,id).count=4; DATE.log(H.G,id).wish=true; }
  const C={}; for(const id of friends){ H.rel(id,30,10,5); C[id]={pts:9,k:{}}; } H.G.termend={contact:{[term]:C},think:{}}; return w; };
/* 記錄 SOCIAL.adjust（「改天」不扣數值）*/
let adj=[]; { const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ adj.push([id,J(d||{})]); return a0.apply(this,arguments); }; }
const negAdj=()=>adj.filter(([id,d])=>Object.values(JSON.parse(d)).some(v=>typeof v==='number'&&v<0));
const hookFor0=TERMEND.hookFor;

(async()=>{
await sec(0,()=>{ check('0. 載得到 TERMEND、PHONE、OUT、INV、Y2R2；語彤的 HEART 寫 examDay、以安和子晴沒有',typeof TERMEND!=='undefined'&&typeof PHONE!=='undefined'&&typeof OUT!=='undefined'&&typeof INV!=='undefined'&&typeof Y2R2!=='undefined'&&TERMEND_LINES.HEART[YT].examDay===true&&!TERMEND_LINES.HEART[AN].examDay&&!TERMEND_LINES.HEART[ZQ].examDay); });

/* ---------- a 大二下（最後一科 6/11 週五）：先答應語彤，別人的邀約照樣隔天傳來、照樣可以接 ---------- */
await sec('a',async()=>{
  const w=setup('Y2S2',[YT,AN],[XC]); const P=TERMEND.plan(H.G,w), R=()=>H.G.termend.Y2S2;
  check('a. 名單：心意＝語彤、以安；朋友＝芯慈；不佔名額的（plan.exempt）只有語彤',P.heart.includes(YT)&&P.heart.includes(AN)&&P.friend.includes(XC)&&J(P.exempt)===J([YT]),J({heart:P.heart,friend:P.friend,exempt:P.exempt}));
  at('2027-06-11',20); run(20,21);
  check('a. 前置：語彤那一則 6/11（五）20:30 傳來（AA_684）；以安、芯慈的還沒（隔天）',isOpen('Y2S2',YT)&&K(ask('Y2S2',YT).day)==='2027-06-11'&&!ask('Y2S2',AN)&&!ask('Y2S2',XC));
  adj=[]; PHONE.answer(H.G,tag('Y2S2',YT),0); rules(); const qx=outOf(EXID('Y2S2',YT));
  check('a. 答應語彤：記 heartPick、不佔名額（R.picked 沒有）；晚餐是另一場出遊 te_ex_Y2S2_heroine_03＝6/12（六）17:30 一盞茶屋、te.ex；一般名額那一場（te_Y2S2）沒有',
    !!R().heartPick&&R().heartPick.who===YT&&!R().picked&&!!qx&&J(dayH(qx))===J(['2027-06-12',6,17.5])&&qx.place==='一盞茶屋'&&qx.te&&qx.te.ex===true&&qx.te.who===YT&&qx.te.kind==='heart'&&!outOf('te_Y2S2'),J({heartPick:R().heartPick,picked:R().picked,qx:dayH(qx),te:qx&&qx.te}));
  at('2027-06-12',20); run(20,21);
  check('a. 隔天 6/12（六）20:30 起以安、芯慈的邀約照樣傳來、可以回（原本答應語彤以後就不再發）',isOpen('Y2S2',AN)&&isOpen('Y2S2',XC)&&K(ask('Y2S2',AN).day)==='2027-06-12',J([ans('Y2S2',AN),ans('Y2S2',XC)]));
  PHONE.answer(H.G,tag('Y2S2',AN),0); rules(); const qa=outOf('te_Y2S2');
  check('a. 接以安：一般名額（R.picked＝以安、te_Y2S2 排了）；芯慈照原本自動「那天有約了。」（一般的那一個名額照舊只能接一個）；語彤那一頓還在',
    !!R().picked&&R().picked.who===AN&&!!qa&&qa.te.who===AN&&qa.state==='planned'&&ans('Y2S2',XC)===1&&thread(XC).includes('player:那天有約了。')&&!!outOf(EXID('Y2S2',YT))&&outOf(EXID('Y2S2',YT)).state==='planned',J({picked:R().picked,qa:dayH(qa),xc:ans('Y2S2',XC)}));
  check('a. 兩頓都排了、時間不重疊（語彤 6/12 17:30；以安在那天以後）',!!qa&&!!qx&&qa.day>qx.day&&!TERMEND.overlap(TERMEND.span(qa.day,qa.h,0.25,0.25),TERMEND.span(qx.day,qx.h,0.25,0.25)),J([dayH(qx),dayH(qa)]));
  check('a. 沒有扣任何數值（自動婉拒、答應都沒有 SOCIAL.adjust 減分）',!negAdj().length,J(negAdj()));
  TERMEND.hookFor=()=>null; H.picks=[3,1]; await TERMEND.dinner(GM,outOf(EXID('Y2S2',YT)));
  check('a. 語彤那一頓吃完：記 heartDone（R.done 不動）',!!R().heartDone&&R().heartDone.who===YT&&!R().done,J({heartDone:R().heartDone,done:R().done}));
  H.picks=[3,1]; await TERMEND.dinner(GM,outOf('te_Y2S2')); TERMEND.hookFor=hookFor0;
  check('a. 以安那一頓吃完：一般名額的 done＝以安（heartDone 還是語彤）',!!R().done&&R().done.who===AN&&R().heartDone.who===YT,J({done:R().done,heartDone:R().heartDone}));
});

/* ---------- b1 大二下：語彤那一則先到、還沒回；先接朋友的邀約 → 她那一則不自動婉拒、照樣可以答應 ---------- */
await sec('b1',async()=>{
  const w=setup('Y2S2',[YT,AN],[XC]), R=()=>H.G.termend.Y2S2; TERMEND.plan(H.G,w);
  at('2027-06-11',20); run(20,21); at('2027-06-12',20); run(20,21);
  check('b1. 前置：三則都到了、都還沒回',isOpen('Y2S2',YT)&&isOpen('Y2S2',AN)&&isOpen('Y2S2',XC));
  adj=[]; PHONE.answer(H.G,tag('Y2S2',XC),0); rules(); const qf=outOf('te_Y2S2');
  check('b1. 接芯慈（朋友）：R.picked＝芯慈、以安照原本自動婉拒；語彤那一則沒有被自動婉拒、還可以回（原本一起婉拒）',!!R().picked&&R().picked.who===XC&&!!qf&&ans('Y2S2',AN)===1&&isOpen('Y2S2',YT)&&ans('Y2S2',YT)==null,J({picked:R().picked,an:ans('Y2S2',AN),yt:ans('Y2S2',YT),qf:dayH(qf)}));
  at('2027-06-12',20.75); PHONE.answer(H.G,tag('Y2S2',YT),0); rules(); const qx=outOf(EXID('Y2S2',YT));
  check('b1. 再答應語彤：她那一頓也排了（6/12 已經過了 17:00＝下一個週六 6/19 17:30）；芯慈那一頓還在',!!R().heartPick&&!!qx&&WD(qx.day)===6&&K(qx.day)==='2027-06-19'&&qx.h===17.5&&!!qf&&qf.state==='planned'&&R().picked.who===XC,J({qx:dayH(qx),qf:dayH(qf)}));
  check('b1. 沒有扣任何數值',!negAdj().length,J(negAdj()));
});

/* ---------- b2 大二下：最後一科那天中午先自己約芯慈吃飯（期末的飯）→ 語彤那一則晚上照樣傳來、照樣可以答應 ---------- */
await sec('b2',async()=>{
  const P=INVITE_DATA.places, nIdx=P.findIndex(p=>p.id==='noodle');
  const w=setup('Y2S2',[YT],[]), R=()=>H.G.termend.Y2S2; Object.assign(SOCIAL.rel(XC),{fam:30,trust:20,comf:15}); SOCIAL.remember(XC,'FIRST_MET',''); INV.rec(H.G); H.G.contacts[XC]=H.G.day-30; TERMEND.plan(H.G,w);
  at('2027-06-11',10); H.said=[]; H.picks=[P[nIdx].verb,0]; const iv=await INV.flow(GM,XC,null,false);
  check('b2. 前置：6/11（五）上午、語彤那一則傳來以前，自己約芯慈吃麵＝期末的飯（R.picked by player、記那一場邀約；她那個時間沒空，照她說的改到時段裡的另一個中午）',!!iv&&!!iv.te&&iv.te.kind==='friend'&&!!R().picked&&R().picked.who===XC&&R().picked.by==='player'&&R().picked.iv===iv.id&&iv.day>=w.from&&iv.day<=w.to&&iv.h<14&&!ask('Y2S2',YT),J({iv:iv&&[K(iv.day),iv.h,iv.te],picked:R().picked}));
  at('2027-06-11',20); run(20,21);
  check('b2. 語彤那一則 6/11 20:30 照樣傳來、可以回（原本自己約了別人就不發）',isOpen('Y2S2',YT),J(thread(YT)));
  PHONE.answer(H.G,tag('Y2S2',YT),0); rules(); const qx=outOf(EXID('Y2S2',YT));
  check('b2. 答應語彤：6/12（六）17:30（AA_684：考完那天以後的第一個週六）',!!R().heartPick&&!!qx&&J(dayH(qx))===J(['2027-06-12',6,17.5]),J(dayH(qx)));
  check('b2. 已經答應她：再自己約她吃飯＝照一般的吃飯（不會變成第二頓心意的飯）；約別人、時間和她那一頓撞到也照一般的吃飯',TERMEND.playerInvite(H.G,YT,P[nIdx],{day:DK('2027-06-13'),h:12+10/60})===null&&TERMEND.playerInvite(H.G,'yu',P[nIdx],{day:DK('2027-06-12'),h:17.5})===null);
});

/* ---------- c 撞到（大一上：最後一科 12/18 週四，三則同一晚傳來，都排在 12/20 週六晚上）---------- */
const cSetup=()=>{ const w=setup('Y1S1',[YT,AN,ZQ],[]); TERMEND.plan(H.G,w); at('2025-12-18',20); run(20,21); return w; };
await sec('c1',async()=>{
  const w=cSetup(), R=()=>H.G.termend.Y1S1;
  const sYT=TERMEND.exNatural(H.G,w,YT), sAN=TERMEND.askSlot(H.G,w,AN,'heart'), sZQ=TERMEND.askSlot(H.G,w,ZQ,'heart');
  check('c1. 前置：三則都到了、都還沒回（兩個都先讓玩家看到）；本來的時間：語彤 12/20（六）17:30、以安 12/20 19:00（撞到）、子晴 12/20 22:00 宵夜（沒撞到）',
    isOpen('Y1S1',YT)&&isOpen('Y1S1',AN)&&isOpen('Y1S1',ZQ)&&J([K(sYT.day),sYT.h])===J(['2025-12-20',17.5])&&J([K(sAN.day),sAN.h])===J(['2025-12-20',19])&&J([K(sZQ.day),sZQ.h])===J(['2025-12-20',22])&&TERMEND.overlap(sYT,sAN)&&!TERMEND.overlap(sYT,sZQ),
    J([sYT,sAN,sZQ].map(s=>s&&[K(s.day),s.h])));
  adj=[]; PHONE.answer(H.G,tag('Y1S1',YT),0);
  check('c1. 選語彤（按「好。」的當下，手機還開著）：以安那一則立刻照「改天」——自動「那天有約了。」＋她原本的婉拒句「好。那開學見。」（TE_NO），不能再答應',
    ans('Y1S1',AN)===1&&thread(AN).slice(-2).join('|')==='player:那天有約了。|'+AN+':'+TERMEND_LINES.HEART[AN].decline&&PHONE.answer(H.G,tag('Y1S1',AN),0)===null,J(thread(AN).slice(-2)));
  rules();
  check('c1. 子晴 22:00 的宵夜沒撞到：還沒回、還可以接；以安記在 R.no（改天）',isOpen('Y1S1',ZQ)&&R().no&&R().no[AN]!=null&&!!R().heartPick&&!R().picked,J({zq:ans('Y1S1',ZQ),no:R().no}));
  PHONE.answer(H.G,tag('Y1S1',ZQ),0); rules(); const qz=outOf('te_Y1S1'), qx=outOf(EXID('Y1S1',YT));
  check('c1. 再接子晴：兩頓都排了（語彤 12/20 17:30；子晴不排在同一個晚上＝隔天 12/21 22:00）',!!qx&&J(dayH(qx))===J(['2025-12-20',6,17.5])&&!!qz&&qz.te.who===ZQ&&J(dayH(qz))===J(['2025-12-21',0,22])&&R().picked.who===ZQ,J({qx:dayH(qx),qz:dayH(qz)}));
  check('c1. 沒有扣任何數值',!negAdj().length,J(negAdj()));
});
await sec('c2',async()=>{
  const w=cSetup(), R=()=>H.G.termend.Y1S1;
  adj=[]; PHONE.answer(H.G,tag('Y1S1',AN),0);
  check('c2. 選以安（按「好。」的當下）：語彤那一則立刻照「改天」——自動「那天有約了。」＋她的婉拒句「好。那我去上班。」，不能再答應',
    ans('Y1S1',YT)===1&&thread(YT).slice(-2).join('|')==='player:那天有約了。|'+YT+':'+TERMEND_LINES.HEART[YT].decline&&PHONE.answer(H.G,tag('Y1S1',YT),0)===null,J(thread(YT).slice(-2)));
  rules(); const qa=outOf('te_Y1S1');
  check('c2. 以安排在 12/20（六）19:00；子晴（一般名額）照原本自動婉拒；語彤沒有 heartPick、沒有她那一頓；R.no 記了語彤',!!qa&&qa.te.who===AN&&J(dayH(qa))===J(['2025-12-20',6,19])&&ans('Y1S1',ZQ)===1&&!R().heartPick&&!outOf(EXID('Y1S1',YT))&&R().no&&R().no[YT]!=null,J({qa:dayH(qa),zq:ans('Y1S1',ZQ),no:R().no}));
  check('c2. 沒有扣任何數值',!negAdj().length,J(negAdj()));
});
await sec('c3',async()=>{
  /* 後到的那一則：以安 20:30 先到、玩家馬上接了；語彤 20:39 才到——照樣傳到（玩家看得到），傳到的當下照「改天」回（不等下一次手機規則、不會先自動打開手機） */
  const w=setup('Y1S1',[YT,AN],[]), R=()=>H.G.termend.Y1S1; TERMEND.plan(H.G,w); at('2025-12-18',20); run(20,20.55);
  check('c3. 前置：20:33 只有以安那一則到了',isOpen('Y1S1',AN)&&!ask('Y1S1',YT));
  PHONE.answer(H.G,tag('Y1S1',AN),0); rules(); H.G.hour=20.7; STORY.phoneRules(GM); PHONE.tick(H.G);   /* 手機規則把她那一則排進去（20:39）→ 這一次 PHONE.tick 傳到；中間不再跑手機規則 */
  const m=ask('Y1S1',YT);
  check('c3. 語彤那一則 20:39 照樣傳到（原本以安接了就不發）；傳到的那一次 PHONE.tick 裡就照「改天」回：「那天有約了。」「好。那我去上班。」',
    !!m&&m.ans===1&&thread(YT).includes(YT+':'+TERMEND_LINES.HEART[YT].invite)&&thread(YT).slice(-2).join('|')==='player:那天有約了。|'+YT+':'+TERMEND_LINES.HEART[YT].decline,J(thread(YT)));
  check('c3. 以安那一頓照舊（12/20 19:00）',!!outOf('te_Y1S1')&&outOf('te_Y1S1').te.who===AN&&!R().heartPick);
});
await sec('c4',async()=>{
  /* 自己約的吃飯：約在 12/20（六）17:30＝和語彤那一頓同一個時段（撞到）→ 她那一則照 S.playerPicked 原本那一條回；約在 12/19 中午（沒撞到）→ 她那一則還在 */
  const noodle=INVITE_DATA.places.find(p=>p.id==='noodle');
  for(const [k,h,hit] of [['2025-12-20',17.5,true],['2025-12-19',12+10/60,false]]){
    const w=cSetup(), R=()=>H.G.termend.Y1S1; at('2025-12-18',21); adj=[];
    const iv=INV.accept(H.G,'yu','noodle',DK(k),h,{by:'player'}); iv.te={term:'Y1S1',kind:'friend'}; TERMEND.playerPicked(H.G,iv);
    if(hit) check('c4. 自己約 Alison 12/20（六）17:30 吃麵（和語彤那一頓撞到）：語彤那一則照「改天」——「這次我有約了，開學見。」＋「好。那我去上班。」；以安、子晴照原本婉拒',
      ans('Y1S1',YT)!=null&&thread(YT).slice(-2).join('|')==='player:'+TERMEND_LINES.AUTO_ME+'|'+YT+':'+TERMEND_LINES.HEART[YT].decline&&ans('Y1S1',AN)!=null&&ans('Y1S1',ZQ)!=null&&R().picked.who==='yu'&&R().picked.iv===iv.id&&!negAdj().length,J(thread(YT).slice(-2)));
    else check('c4. 自己約 Alison 12/19 中午（沒撞到）：以安、子晴照原本婉拒；語彤那一則還在、還可以答應（12/20 17:30）',
      ans('Y1S1',AN)!=null&&ans('Y1S1',ZQ)!=null&&isOpen('Y1S1',YT)&&(PHONE.answer(H.G,tag('Y1S1',YT),0),rules(),!!outOf(EXID('Y1S1',YT))&&J(dayH(outOf(EXID('Y1S1',YT))))===J(['2025-12-20',6,17.5])),J({yt:ans('Y1S1',YT),q:dayH(outOf(EXID('Y1S1',YT)))}));
    void noodle; }
});

/* ---------- d 沒寫 examDay 的心意邀約照原本「只能接一個」---------- */
await sec('d',async()=>{
  { const w=setup('Y1S1',[AN,ZQ],[XC]), R=()=>H.G.termend.Y1S1; const P=TERMEND.plan(H.G,w); at('2025-12-18',20); run(20,21);
    check('d. 以安、子晴（沒寫 examDay）：plan.exempt 是空的',Array.isArray(P.exempt)&&!P.exempt.length&&P.heart.includes(AN)&&P.heart.includes(ZQ),J(P.exempt));
    PHONE.answer(H.G,tag('Y1S1',AN),0); rules();
    check('d. 接以安＝子晴（心意，22:00 沒撞到也一樣）、芯慈自動「那天有約了。」；R.picked＝以安、沒有 heartPick',R().picked&&R().picked.who===AN&&ans('Y1S1',ZQ)===1&&ans('Y1S1',XC)===1&&!R().heartPick,J({zq:ans('Y1S1',ZQ),xc:ans('Y1S1',XC)})); }
  { const H0=TERMEND_LINES.HEART[YT], ed=H0.examDay; delete H0.examDay;
    try{ const w=setup('Y1S1',[YT,AN,ZQ],[]), R=()=>H.G.termend.Y1S1; const P=TERMEND.plan(H.G,w); at('2025-12-18',20); run(20,21); PHONE.answer(H.G,tag('Y1S1',YT),0); rules();
      check('d. 語彤的 examDay 拿掉（測試用）：不在 exempt；答應她＝佔名額（R.picked、te_Y1S1），以安、子晴都自動婉拒',!P.exempt.length&&R().picked&&R().picked.who===YT&&!!outOf('te_Y1S1')&&!outOf(EXID('Y1S1',YT))&&ans('Y1S1',AN)===1&&ans('Y1S1',ZQ)===1,J({exempt:P.exempt,picked:R().picked})); }
    finally{ H0.examDay=ed; } }
});

/* ---------- e 舊存檔 ---------- */
await sec('e',async()=>{
  const old=(picked)=>{ const w=setup('Y2S2',[YT,AN],[XC]); H.G.termend.Y2S2={plan:{back:DK('2027-06-12'),heart:[YT,AN],friend:[XC],fallback:null,gf:[],nope:{},kx:false}};   /* 舊版排的名單（沒有 exempt）*/
    if(picked) H.G.termend.Y2S2.picked={who:XC,kind:'friend',day:DK('2027-06-10'),by:'player'};
    H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G); return w; };
  { old(true); const R=()=>H.G.termend.Y2S2; at('2027-06-11',20); run(20,21); at('2027-06-12',20); run(20,21);
    check('e. 舊存檔（名單沒有 exempt、已經接了芯慈）讀進來：照原本——語彤、以安的邀約都不發；沒有 heartPick；自己再約吃飯照一般的吃飯',!ask('Y2S2',YT)&&!ask('Y2S2',AN)&&!R().heartPick&&!R().heartDone&&R().picked.who===XC&&TERMEND.playerInvite(H.G,AN,INVITE_DATA.places.find(p=>p.id==='noodle'),{day:DK('2027-06-13'),h:12+10/60})===null&&!TERMEND.isExempt(H.G,'Y2S2',YT),J(Object.keys(R()))); }
  { old(false); const R=()=>H.G.termend.Y2S2; at('2027-06-11',20); run(20,21); PHONE.answer(H.G,tag('Y2S2',YT),0); rules(); at('2027-06-12',20); run(20,21);
    check('e. 舊版名單的學期，答應語彤＝照原本佔名額（R.picked、te_Y2S2），以安、芯慈的不發',R().picked&&R().picked.who===YT&&!R().heartPick&&!!outOf('te_Y2S2')&&outOf('te_Y2S2').te.who===YT&&!outOf(EXID('Y2S2',YT))&&!ask('Y2S2',AN)&&!ask('Y2S2',XC),J({picked:R().picked}));
    TERMEND.hookFor=()=>null; H.picks=[3,1]; await TERMEND.dinner(GM,outOf('te_Y2S2')); TERMEND.hookFor=hookFor0;
    check('e. 那一頓吃完照原本記 R.done（沒有 heartDone）',R().done&&R().done.who===YT&&!R().heartDone,J({done:R().done})); }
  { const w=setup('Y2S2',[YT,AN],[XC]); TERMEND.plan(H.G,w); at('2027-06-11',20); run(20,21); PHONE.answer(H.G,tag('Y2S2',YT),0); rules();
    H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G); const R=()=>H.G.termend.Y2S2;
    check('e. 新的欄位存讀檔以後還在：plan.exempt、heartPick、te_ex 那一場；R.picked 照舊沒有',J(R().plan.exempt)===J([YT])&&R().heartPick&&R().heartPick.who===YT&&!R().picked&&!!outOf(EXID('Y2S2',YT))&&TERMEND.isExempt(H.G,'Y2S2',YT),J(Object.keys(R())));
    at('2027-06-12',20); run(20,21); check('e. 讀檔以後別人的邀約照樣傳來',isOpen('Y2S2',AN)&&isOpen('Y2S2',XC)); }
});

/* ---------- f y2r2_3d.js 的 yt11b：語彤的期末飯排在 6/17＝往後一天（也看 te_ex 那一場）---------- */
await sec('f',async()=>{
  setup('Y2S2',[YT],[]); const b=DK('2027-06-17');
  OUT.plan(H.G,{id:EXID('Y2S2',YT),ev:'ev_termend_dinner',day:b,h:17.5,late:0.25,place:'一盞茶屋',title:'學期末的飯：語彤（一盞茶屋）',travel:'走過去約 15 分鐘',travelH:0.25,te:{term:'Y2S2',who:YT,kind:'heart',ex:true}});
  check('f. 不佔名額的那一頓排在 6/17：Y2R2.yt11bDay＝6/18（和 te_Y2S2、te_gf 那兩個一樣）',K(Y2R2.yt11bDay(H.G))==='2027-06-18',K(Y2R2.yt11bDay(H.G)));
});

H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

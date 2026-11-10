// TE-FRI-SAME-NIGHT-1104（BB-C 2026-11-04 22:09「週五考完的學期：改」）：週五考完的學期（大二下 6/11、大四上 12/22），其他人的期末邀約也在語彤那一則（examDay）的同一個週五晚上到；
//   TE-SAME-TIME-1104（BB-C 22:33 選①）：同一晚的期末邀約全部 20:30 一起到（原本一則隔 9 分鐘；手機打開時遊戲時間停住），手機裡的順序照原本（週五學期她排第一）。
//   晚餐的日子照各自原本的排法（TE-HEART-AVOID 照舊）；週四考完的學期也是 20:30 一起到。不需要瀏覽器。
//   a  大二下，語彤是朋友那一則（佔「只能接一個」，照舊）＋以安：兩則 6/11（五）20:30 一起到（原本以安 6/12（六）才到），語彤那一則排在前面；兩則都看得到、都還沒回
//   b  大二下，語彤是心意那一則（不佔名額）＋以安心意＋芯慈朋友：三則 20:30 一起到，順序語彤、以安、芯慈（照原本的先後：心意、朋友）；同一晚都還沒回
//   c  大四上：語彤、以安 12/22（五）20:30 一起到；學姊（S.FROM 12/24：12/23 才從美國回來）照原本 12/24 到（「我昨天回來的」）
//   d  晚餐的日子照原本：週五晚上答應以安＝排在原本那一天（6/14、12/25 18:30，和原本週六晚上答應一樣）；語彤那一頓照舊隔天週六；
//      語彤心意那一則開著的時候，芯慈那一頓照舊避開她那一晚（TE-HEART-AVOID：不排 6/12）
//   e  週四考完的學期（大三上 12/23）同一晚 20:30 一起到、照名單的先後；照原本的：語彤這學期沒有那一則（沒有約她、交往中）＝其他人照原本隔天（週六）到；
//      當天才約的（芯慈心意 sameDay）照原本當天 12:00；邀約的字沒有改
//   f  舊存檔（舊版程式存的）：週五晚上語彤那一則已經到、以安還沒傳的存檔＝讀檔以後以安那一則當晚就到、不重複；週六已經傳過的不再傳
// 修改前（7991976b6）：FAILED 11——a、b、c 別人隔天（週六）才到，她那一則也不是第一則（名單排在她前面的人先用掉 20:30，她 20:39）；d、e、f 要在週五晚上答應或讀以安那一則的跟著 FAIL；
//   照原本的（她這學期沒有那一則、當天才約、舊版已經排好的）兩邊都過。TE-SAME-TIME（22:33）改 20:30 一起到：ce3462d4b 跑這一版 FAILED（20:39、20:48 那幾項）。修改後 ALL PASS；用法：node tests/te_fri_same_night_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify, YT='heroine_03', AN='heroine_01', XC='classmate_xinci', SIS='heroine_05';
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
const tag=(t,who)=>'te_'+t+'_'+who, ask=(t,who)=>PHONE.byAsk(H.G,tag(t,who));
const isOpen=(t,who)=>{ const m=ask(t,who); return !!m&&PHONE.askOpen(H.G,m); };
const when=(t,who)=>{ const m=ask(t,who); return m?[K(m.day),+(+m.h).toFixed(2)]:null; };
const outOf=id=>OUT.get(H.G,id), dayH=q=>q?[K(q.day),WD(q.day),q.h]:null;
/* hearts＝心意邀約（沒說過、npcRom 夠）；friends＝朋友的一對一邀約（常接觸 9 分、FAMILIAR 以上）*/
const setup=(term,hearts,friends,flags)=>{ const w=TERMEND.windowOf(term); H.fresh('2025-09-01',9,'campus',flags); at(w.from,9); H.G.stage='law';
  for(const id of hearts){ H.rel(id,70,50,45); SOCIAL.rel(id).npcRom=40; DATE.log(H.G,id).count=4; DATE.log(H.G,id).wish=true; }
  const C={}; for(const id of friends){ H.rel(id,30,10,5); C[id]={pts:9,k:{}}; } H.G.termend={contact:{[term]:C},think:{}}; const P=TERMEND.plan(H.G,w); return {w,P}; };
/* 每一天 19:54～21:30 跑手機規則（不回任何一則）*/
const nights=(w,k0,k1)=>{ for(let d=DK(k0);d<=DK(k1);d++){ at(d,19.9); run(19.9,21.5); } };
const TL=TERMEND_LINES;
/* 手機裡的先後（G.msgs 的位置）：tags 照傳來的先後排 */
const pos=(t,who)=>(H.G.msgs||[]).findIndex(m=>m.tag===tag(t,who));
const inOrder=(t,ids)=>ids.every((id,i)=>pos(t,id)>=0&&(i===0||pos(t,ids[i-1])<pos(t,id)));

(async()=>{
await sec(0,()=>{ const w2=TERMEND.windowOf('Y2S2'), w4=TERMEND.windowOf('Y4S1');
  check('0. 載得到 TERMEND、PHONE、OUT；語彤的心意、朋友那一則都寫 examDay；大二下、大四上的時段第一天是週四（6/10、12/21）',typeof TERMEND!=='undefined'&&TL.HEART[YT].examDay===true&&TL.FRIEND[YT].examDay===true&&K(w2.from)==='2027-06-10'&&K(w4.from)==='2028-12-21',J([K(w2.from),K(w4.from)])); });

/* ---------- a 大二下：語彤朋友那一則＋以安 ---------- */
await sec('a',()=>{ const {w,P}=setup('Y2S2',[],[YT,AN]);
  check('a. 前置：大二下最後一科 6/11（五）——語彤那一則照 examDay 在 6/11、一般的邀約原本從 6/12（P.back）；名單裡有語彤、以安（朋友）',K(TERMEND.examDay(H.G,w))==='2027-06-11'&&K(P.back)==='2027-06-12'&&P.friend.includes(YT)&&P.friend.includes(AN)&&!P.heart.length,J({back:K(P.back),friend:P.friend,heart:P.heart}));
  nights(w,'2027-06-10','2027-06-11');
  check('a. 6/11（五）20:30 語彤、以安兩則一起到（原本以安 6/12（六）才到）；手機裡語彤那一則在前面',J(when('Y2S2',YT))===J(['2027-06-11',20.5])&&J(when('Y2S2',AN))===J(['2027-06-11',20.5])&&inOrder('Y2S2',[YT,AN]),J([when('Y2S2',YT),when('Y2S2',AN),pos('Y2S2',YT),pos('Y2S2',AN)]));
  check('a. 同一晚兩則都看得到、都還沒回（玩家自己選；語彤那一則照舊佔「只能接一個」）',isOpen('Y2S2',YT)&&isOpen('Y2S2',AN)&&!TERMEND.isExempt(H.G,'Y2S2',YT),J({yt:isOpen('Y2S2',YT),an:isOpen('Y2S2',AN)}));
  nights(w,'2027-06-12','2027-06-12');
  check('a. 隔天 6/12（六）不再傳一次（同一則一學期一次）',(H.G.msgs||[]).filter(m=>m.tag===tag('Y2S2',AN)).length===1,J((H.G.msgs||[]).filter(m=>m.th==='p:'+AN).map(m=>[K(m.day),m.h,m.text]))); });

/* ---------- b 大二下：語彤心意那一則（不佔名額）＋以安心意＋芯慈朋友 ---------- */
await sec('b',()=>{ const {w,P}=setup('Y2S2',[YT,AN],[XC]);
  check('b. 前置：心意的名單有語彤、以安，語彤不佔名額（exempt）；朋友那一則是芯慈',P.heart.includes(YT)&&P.heart.includes(AN)&&J(P.exempt)===J([YT])&&J(P.friend)===J([XC]),J({heart:P.heart,friend:P.friend,ex:P.exempt}));
  nights(w,'2027-06-10','2027-06-11');
  const ws=[when('Y2S2',YT),when('Y2S2',AN),when('Y2S2',XC)];
  check('b. 6/11（五）：三則 20:30 一起到；手機裡的順序語彤、以安、芯慈（她先，其他照原本的先後：心意、朋友）',J(ws)===J([['2027-06-11',20.5],['2027-06-11',20.5],['2027-06-11',20.5]])&&inOrder('Y2S2',[YT,AN,XC]),J({ws,pos:[YT,AN,XC].map(id=>pos('Y2S2',id))}));
  check('b. 同一晚三則都還沒回',isOpen('Y2S2',YT)&&isOpen('Y2S2',AN)&&isOpen('Y2S2',XC)); });

/* ---------- c 大四上：語彤＋以安＋學姊（12/24 才到） ---------- */
await sec('c',()=>{ const {w,P}=setup('Y4S1',[],[YT,AN]);
  check('c. 前置：大四上最後一科 12/22（五）——語彤那一則 12/22、一般的原本 12/23（六）',K(TERMEND.examDay(H.G,w))==='2028-12-22'&&K(P.back)==='2028-12-23'&&P.friend.includes(YT)&&P.friend.includes(AN),J({back:K(P.back),friend:P.friend}));
  nights(w,'2028-12-21','2028-12-22');
  check('c. 12/22（五）20:30 語彤、以安一起到（語彤在前面）',J(when('Y4S1',YT))===J(['2028-12-22',20.5])&&J(when('Y4S1',AN))===J(['2028-12-22',20.5])&&inOrder('Y4S1',[YT,AN])&&isOpen('Y4S1',YT)&&isOpen('Y4S1',AN),J([when('Y4S1',YT),when('Y4S1',AN)]));
  /* 學姊：朋友那一則「我昨天回來的」——S.FROM 12/24（照原本，不提早到 12/22）*/
  { const {w:w4,P:P4}=setup('Y4S1',[],[YT,SIS]); nights(w4,'2028-12-21','2028-12-24');
    const sx=ask('Y4S1',SIS);
    check('c. 學姊（S.FROM：12/23 從美國回來）照原本 12/24 才到、不提早到週五；「我昨天回來的」那一句照舊',P4.friend.includes(SIS)&&!!sx&&K(sx.day)==='2028-12-24'&&J(when('Y4S1',YT))===J(['2028-12-22',20.5])&&/我昨天回來的/.test(sx.text||''),J({friend:P4.friend,sis:when('Y4S1',SIS),yt:when('Y4S1',YT),t:sx&&sx.text})); } });

/* ---------- d 晚餐的日子照原本 ---------- */
await sec('d',()=>{
  { const {w}=setup('Y2S2',[],[YT,AN]); nights(w,'2027-06-10','2027-06-11'); at('2027-06-11',21.5); PHONE.answer(H.G,tag('Y2S2',AN),0); rules();
    const q=outOf('te_Y2S2');
    check('d. 大二下：週五晚上答應以安＝6/14（一）18:30（和原本週六晚上答應排的同一天：P.back 6/12 以後第二天）；語彤那一則照「只能接一個」自動婉拒',!!q&&J(dayH(q))===J(['2027-06-14',1,18.5])&&q.te.who===AN&&!isOpen('Y2S2',YT),J({q:dayH(q),yt:isOpen('Y2S2',YT)})); }
  { const {w}=setup('Y4S1',[],[YT,AN]); nights(w,'2028-12-21','2028-12-22'); at('2028-12-22',21.5); PHONE.answer(H.G,tag('Y4S1',AN),0); rules();
    const q=outOf('te_Y4S1');
    check('d. 大四上：週五晚上答應以安＝12/25（一）18:30（原本那一天）',!!q&&J(dayH(q))===J(['2028-12-25',1,18.5]),J(dayH(q))); }
  { const {w}=setup('Y2S2',[],[YT,AN]); nights(w,'2027-06-10','2027-06-11'); at('2027-06-11',21.5); PHONE.answer(H.G,tag('Y2S2',YT),0); rules();
    const q=outOf('te_Y2S2');
    check('d. 答應語彤（朋友那一則）：照舊隔天 6/12（六）18:00 小路；以安那一則照「只能接一個」自動婉拒',!!q&&J(dayH(q))===J(['2027-06-12',6,18])&&q.te.who===YT&&!isOpen('Y2S2',AN),J({q:dayH(q),an:isOpen('Y2S2',AN)})); }
  { const {w}=setup('Y2S2',[YT],[XC]); nights(w,'2027-06-10','2027-06-11'); at('2027-06-11',21.5);
    const sx=TERMEND.askSlot(H.G,w,XC,'friend');
    check('d. 語彤心意那一則開著（還沒回）：芯慈那一頓照舊避開語彤那一晚（6/12），排在 6/13 以後（TE-HEART-AVOID）',isOpen('Y2S2',YT)&&isOpen('Y2S2',XC)&&!!sx&&sx.day>DK('2027-06-12'),J({sx:sx&&[K(sx.day),sx.h]}));
    PHONE.answer(H.G,tag('Y2S2',XC),0); rules(); const q=outOf('te_Y2S2');
    check('d. 答應芯慈：排在 6/13 以後（不在語彤那一晚）；語彤那一則不佔名額、照樣開著',!!q&&q.day>DK('2027-06-12')&&q.te.who===XC&&isOpen('Y2S2',YT),J({q:dayH(q),yt:isOpen('Y2S2',YT)})); } });

/* ---------- e 照原本的 ---------- */
await sec('e',()=>{
  /* 週四考完的學期：大三上 12/23（四）＝時段第一天，本來就同一晚到 */
  { const {w,P}=setup('Y3S1',[],[YT,AN]); const ex=K(TERMEND.examDay(H.G,w)); nights(w,'2027-12-23','2027-12-23');
    const a=when('Y3S1',YT), b=when('Y3S1',AN), order=P.friend.map(id=>when('Y3S1',id));
    check('e. 週四考完（大三上 12/23＝時段第一天）：兩則照原本 12/23 同一晚，20:30 一起到（TE-SAME-TIME），手機裡照名單的先後',ex==='2027-12-23'&&K(P.back)==='2027-12-23'&&J(order)===J([['2027-12-23',20.5],['2027-12-23',20.5]])&&inOrder('Y3S1',P.friend)&&!!a&&!!b,J({ex,back:K(P.back),friend:P.friend,order})); }
  /* 語彤這學期沒有那一則：交往中（女朋友那一則另外排）＝其他人照原本隔天 */
  { const {w,P}=setup('Y2S2',[],[AN],{dating_heroine_03:true}); nights(w,'2027-06-10','2027-06-12');
    check('e. 語彤這學期沒有 examDay 那一則（交往中，在女朋友的名單）：以安照原本 6/12（六）20:30 到',!P.friend.includes(YT)&&!P.heart.includes(YT)&&P.gf.includes(YT)&&J(when('Y2S2',AN))===J(['2027-06-12',20.5]),J({friend:P.friend,heart:P.heart,gf:P.gf,an:when('Y2S2',AN)})); }
  { const {w,P}=setup('Y2S2',[],[AN]); nights(w,'2027-06-10','2027-06-12');
    check('e. 沒有約語彤（她不在名單）：以安照原本 6/12（六）20:30 到',!P.friend.includes(YT)&&!P.heart.includes(YT)&&J(when('Y2S2',AN))===J(['2027-06-12',20.5]),J({friend:P.friend,an:when('Y2S2',AN)})); }
  /* 當天才約的（芯慈心意 sameDay）照原本：保留日那天 12:00 */
  { const {w,P}=setup('Y2S2',[YT],[]); P.heart.push(XC);   /* 芯慈的心意要另外的前置（S.cond），這裡直接放進這學期的名單（只看 send 怎麼排）*/ nights(w,'2027-06-10','2027-06-11'); for(let d=DK('2027-06-12');d<=DK('2027-06-16');d++){ at(d,11.9); run(11.9,12.3); }
    const m=ask('Y2S2',XC), RH=(H.G.termend.Y2S2.heartDay||{})[XC];
    check('e. 芯慈心意（當天才約）照原本：不在週五晚上到，保留日那一天 12:00 傳（不排在語彤那一晚 6/12）',P.heart.includes(XC)&&!!m&&m.h===12&&K(m.day)===K(RH)&&RH!==DK('2027-06-11')&&RH!==DK('2027-06-12'),J({heart:P.heart,m:m&&[K(m.day),m.h],RH:K(RH)})); }
  /* 字沒有改：以安朋友那一則大二下照原本的句子 */
  { const {w}=setup('Y2S2',[],[YT,AN]); nights(w,'2027-06-10','2027-06-11'); const m=ask('Y2S2',AN), f=TL.FRIEND[AN], exp=(f.genByTerm&&f.genByTerm.Y2S2)||(f.genBySem&&f.genBySem.S2)||f.gen;
    check('e. 邀約的字沒有改（以安大二下「'+exp+'」）',!!m&&m.text===exp,J(m&&m.text)); } });

/* ---------- f 舊存檔 ---------- */
await sec('f',()=>{
  /* 舊版程式週五 20:35 存的檔：語彤那一則已經到、以安那一則還沒傳（舊版要隔天 20:30）——讀檔以後當晚就到 */
  { const {w}=setup('Y2S2',[],[YT,AN]); const tY=tag('Y2S2',YT);
    PHONE.at(H.G,DK('2027-06-11'),20.5,[{th:'p:'+YT,from:YT,text:'（舊版）',ask:{id:tY,until:24*w.to+18,opts:[{t:'好。',set:{TE_PICK:'Y2S2|'+YT+'|friend'}},{t:'那天有約了。',set:{TE_NO:'Y2S2|'+YT}}]}}],tY); { const RR=TERMEND.rec(H.G,'Y2S2'); (RR.asks||(RR.asks={}))[YT]=tY; }
    at('2027-06-11',20.55); PHONE.tick(H.G); const before=!!ask('Y2S2',YT)&&!ask('Y2S2',AN); H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G);
    let err=null; try{ at('2027-06-11',20.6); run(20.6,21.5); }catch(e){ err=String(e); } const wa=when('Y2S2',AN);
    check('f. 舊版週五晚上語彤那一則到了以後存的檔：讀檔以後以安那一則當晚就到（6/11）、只有一則、語彤那一則不重複、不出錯',before&&!err&&!!wa&&wa[0]==='2027-06-11'&&wa[1]>=20.5&&wa[1]<=20.7&&(H.G.msgs||[]).filter(m=>m.tag===tag('Y2S2',AN)).length===1&&(H.G.msgs||[]).filter(m=>m.tag===tY).length===1&&isOpen('Y2S2',AN),J({before,err,an:wa})); }
  /* 舊版程式週六 21:00 存的檔：語彤那一則週五、以安那一則週六 20:30 都已經傳過了——讀檔以後不再傳第二次 */
  { const {w}=setup('Y2S2',[],[YT,AN]); const RR=TERMEND.rec(H.G,'Y2S2'); RR.asks=RR.asks||{}; const tY=tag('Y2S2',YT), t=tag('Y2S2',AN);
    const OPT=who=>({until:24*w.to+18,opts:[{t:'好。',set:{TE_PICK:'Y2S2|'+who+'|friend'}},{t:'那天有約了。',set:{TE_NO:'Y2S2|'+who}}]});
    PHONE.at(H.G,DK('2027-06-11'),20.5,[{th:'p:'+YT,from:YT,text:'（舊版語彤）',ask:Object.assign({id:tY},OPT(YT))}],tY); RR.asks[YT]=tY; at('2027-06-11',20.55); PHONE.tick(H.G);
    PHONE.at(H.G,DK('2027-06-12'),20.5,[{th:'p:'+AN,from:AN,text:'（舊版）',ask:Object.assign({id:t},OPT(AN))}],t); RR.asks[AN]=t; at('2027-06-12',20.55); PHONE.tick(H.G);
    H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G); let err=null; try{ at('2027-06-12',21); run(21,21.5); at('2027-06-13',19.9); run(19.9,21.5); }catch(e){ err=String(e); }
    const all=(H.G.msgs||[]).filter(m=>m.th==='p:'+AN).map(m=>[K(m.day),m.h,m.text]);
    check('f. 舊版週六已經傳過的那一則：讀檔以後不再另外傳一則（以安那一串只有舊版那一則）',!err&&all.length===1&&all[0][2]==='（舊版）'&&all[0][0]==='2027-06-12'&&(H.G.msgs||[]).filter(m=>m.tag===tag('Y2S2',YT)).length===1,J({err,all})); } });

H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

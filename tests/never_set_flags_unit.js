// 「程式讀了、卻沒有地方設」的機制缺口（LAWWW-C 派的子代理，2026-10-21）——不需要瀏覽器。
//   1. BB194-YTFLAGS（BB_194 §24）：她問到祐廷的感情狀態，選項標 yt → YT_HONEST／YT_DODGED／YT_LIED；期末飯的知情門檻（TERMEND.KNOWS_OK）因此過得了。
//   2. U_COPYRIGHT／U_CONTRACT（AA_337 第 6 題）：討論課的「理解」旗標（原本已做：classes3d.js discuss；這裡留回歸）→ 子晴 Q14「三件事」。
//   3. AA294-SKIPCLASS-1018（AA_294）：①考試（期中、期末）帶進考場、不能翹、跳過時間停在考試前；開學第二天民總 12:30 帶到 201；
//      ②課堂事件延到下一次出席（事件的 carryTo）：柏翰你考幾分到第 15 週、便利貼第一張到第 12 週、P4d 第一次出席、沛珊的表到第 14 週＋信箱版；③「你不在」的兩處回想。
//   4. VAC-ZR-UK-1017（AA_276 第 2 節、BB_178 1-E）：芷若在英國照交情聯絡。
//   5. CALLED_SHUYU（AA_243 第 5 節第 6 題、AA_262 第 5 節第 3 件、AA_327）：學姊開始交往那天就記；讀它＝對話框、按鈕上她的名字叫「書瑀」。
// 修改前：ROM.ytAnswer、CLS.day2Due、事件的 carryTo、…都沒有（第 1、3、4、5 節失敗；第 2 節原本就通過）。用法：node tests/never_set_flags_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ if(!fs.existsSync(path.join(H.ROOT,f))) return; let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
load('src/exchange3d.js'); load('src/data/msg_pool.js'); load('src/data/msg2_pool.js'); load('src/msg3d.js'); load('src/y34b3d.js');   // index.html 的順序：msg3d.js 在 y34b3d.js 前面
const {check,GM,E}=H;
const D=k=>STORY.dayOfKey(k), wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone,flags); G.acts={att:{}}; G.outings=[]; G.weekday=wdOf(G.day); GM.npc={}; E.player.obj.position.x=0; E.player.obj.position.z=0; E.player.busy=false; E.paused=false; GM.D.active=false; return G; };
const setDay=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); };
const lines=()=>H.lines();
const has=t=>H.said.some(s=>s.t===t||String(s.t).endsWith(t));
const itemOf=(term,w,cid)=>{ for(let wd=1;wd<=5;wd++){ const d=STORY.termDay(term,w,wd); if(d==null) continue; const it=CLS.dayItems(H.G,d).find(q=>q.c.id===cid); if(it) return it; } return null; };
let caps=[], toasts=[]; GM.caption=(a,b)=>{ caps.push(b); }; GM.toast=t=>{ toasts.push(t); };
/* 修改前沒有的函式：叫不到就當作沒有，每一項照樣算 FAIL（不在中途丟例外）*/
const YT=(...a)=>typeof ROM.ytAnswer==='function'?ROM.ytAnswer(...a):undefined;
const D2=G=>typeof CLS.day2Due==='function'?CLS.day2Due(G):false;
const ONCE=G=>{ const R=MSG.rec(G); return R.once||(R.once={}); };
const ZKEY=G=>typeof MSG.zrUkKey==='function'?MSG.zrUkKey(G):'x';
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.message||e).slice(0,200)); } };
(async()=>{
  /* ======================= 1. BB194-YTFLAGS ======================= */
  await sec('1',async()=>{
  { const G=fresh('2026-06-11',9,'campus'); ROM.rec(G);
    check('1-0. 有 ROM.ytAnswer、EVENTS.yt（選項的 yt 標記）',typeof ROM.ytAnswer==='function'&&typeof EVENTS.yt==='function');
    G.flags.dating_kexin=true; ROM.rec(G); ROM.learn(G,'heroine_04','kexin','test');
    H.rel('heroine_04',70,50,45); SOCIAL.rel('heroine_04').npcRom=40; const lg=DATE.log(G,'heroine_04'); lg.count=4; lg.wish=true;
    const w0=TERMEND.willing(G,'heroine_04');
    check('1-1. 前提：子晴知道祐廷和可昕交往、沒有 YT_HONEST＝期末飯的知情門檻不過（why knows）',!w0.ok&&w0.why==='knows',JSON.stringify(w0));
    const ask={id:'t_yt_ask',participants:['heroine_04'],dialogue:[{speaker:'heroine_04',text:'（測試）'},{choice:[{text:'（照實）',yt:'honest'},{text:'（岔開）',yt:'dodge'},{text:'（不標）'}]}]};
    H.picks=[2]; await EVENTS.runLines(ask.dialogue,ask);
    check('1-2. 條件不成立不設：選了沒有標 yt 的選項，三個旗標都沒有',!G.flags.YT_HONEST&&!G.flags.YT_DODGED&&!G.flags.YT_LIED,JSON.stringify([G.flags.YT_HONEST,G.flags.YT_DODGED,G.flags.YT_LIED]));
    H.picks=[0]; await EVENTS.runLines(ask.dialogue,ask);
    check('1-3. 選了標 honest 的選項：YT_HONEST.heroine_04（問的那一位＝事件的第一位人物）',!!G.flags.YT_HONEST&&G.flags.YT_HONEST.heroine_04===true,JSON.stringify(G.flags.YT_HONEST));
    const w1=TERMEND.willing(G,'heroine_04');
    check('1-4. 讀的地方因此改變：子晴的知情門檻過了（KNOWS_OK）、她願意（期末飯心意邀約照發）',!!TERMEND.KNOWS_OK.heroine_04&&TERMEND.KNOWS_OK.heroine_04(G)===true&&w1.ok,JSON.stringify(w1));
    H.picks=[1]; await EVENTS.runLines(ask.dialogue,ask);
    check('1-5. 之後又被問、選了 dodge：YT_DODGED.heroine_04 → 子晴的門檻又不過（BB_194 §6）',!!G.flags.YT_DODGED&&G.flags.YT_DODGED.heroine_04===true&&!TERMEND.KNOWS_OK.heroine_04(G)&&TERMEND.willing(G,'heroine_04').why==='knows');
    /* claimEnded／claimNone 和事實比 */
    const r1=YT(G,'heroine_01','claimEnded','kexin');
    check('1-6. 「說已經分了」可是可昕還在交往中＝YT_LIED.heroine_01.kexin，不記 YT_HONEST',r1==='lied'&&!!G.flags.YT_LIED&&!!G.flags.YT_LIED.heroine_01&&G.flags.YT_LIED.heroine_01.kexin===true&&!(G.flags.YT_HONEST||{}).heroine_01,JSON.stringify(G.flags.YT_LIED));
    ROM.learn(G,'classmate_peishan','kexin','test'); H.rel('classmate_peishan',70,50,45); SOCIAL.rel('classmate_peishan').npcRom=75;
    YT(G,'classmate_peishan','honest');
    const okPs=TERMEND.KNOWS_OK.classmate_peishan(G); YT(G,'classmate_peishan','claimNone');
    check('1-7. 沛珊：照實過一次（門檻過）→ 之後說「沒有女朋友」＝說謊（YT_LIED.classmate_peishan.kexin）→ 門檻不過（!YT_LIED）',okPs===true&&G.flags.YT_LIED.classmate_peishan.kexin===true&&TERMEND.KNOWS_OK.classmate_peishan(G)===false);
    ROM.end(G,'kexin','apart_talk'); const r2=YT(G,'heroine_01','claimEnded','kexin');
    check('1-8. 分手以後再說「分了」＝照實：YT_HONEST.heroine_01；之前的說謊紀錄留著',r2==='honest'&&G.flags.YT_HONEST.heroine_01===true&&G.flags.YT_LIED.heroine_01.kexin===true);
    const r3=YT(G,'heroine_05','claimNone');
    check('1-9. 都沒有在交往時說「沒有女朋友」＝照實（YT_HONEST.heroine_05）',r3==='honest'&&G.flags.YT_HONEST.heroine_05===true&&!(G.flags.YT_LIED.heroine_05));
    ROM.cleanup(G); ROM.start(G,'heroine_03'); ROM.start(G,'heroine_02'); const r4=YT(G,'heroine_01','claimNone');
    check('1-10. 和兩個人交往中說「沒有女朋友」：兩個都記（YT_LIED.heroine_01.heroine_03、.heroine_02）',r4==='lied'&&G.flags.YT_LIED.heroine_01.heroine_03===true&&G.flags.YT_LIED.heroine_01.heroine_02===true,JSON.stringify(G.flags.YT_LIED.heroine_01));
    const fixed={id:'t_yt_line',participants:['heroine_01'],dialogue:[{speaker:'heroine_01',text:'（測試）'},{speaker:'player',text:'（測試：劇本固定照實的那一句）',yt:'honest',ytHer:'heroine_03'}]};
    await EVENTS.runLines(fixed.dialogue,fixed);
    check('1-11. 劇本固定照實的那一句（行上的 yt、ytHer）直接記 YT_HONEST',G.flags.YT_HONEST.heroine_03===true);
    const before=JSON.stringify([G.flags.YT_HONEST,G.flags.YT_DODGED,G.flags.YT_LIED]); const bad=YT(G,'heroine_04','maybe'); check('1-12. 認不得的標記不記',bad===null&&JSON.stringify([G.flags.YT_HONEST,G.flags.YT_DODGED,G.flags.YT_LIED])===before);
    const snap=JSON.parse(JSON.stringify(G.flags)); check('1-13. 存檔：三個旗標都是一般物件（JSON 來回不變）',JSON.stringify(snap.YT_LIED)===JSON.stringify(G.flags.YT_LIED)&&snap.YT_HONEST.heroine_04===true); }
  });

  /* ======================= 2. U_COPYRIGHT／U_CONTRACT（原本已做）======================= */
  await sec('2',async()=>{
  { const G=fresh('2025-12-04',13.3,'classroom'); const it=itemOf('Y1S1',14,'civ_general'); let ok=false;
    if(it){ setDay(it.day,it.t0); H.picks=[0,0,0,0,0,0]; try{ await CLS.attend(GM,it,{door:true}); ok=true; }catch(e){ console.log(e); } }
    check('2-1. 民總第 14 週的討論課（網拍標錯價）去了＝U_CONTRACT（AA_337 第 6 題）',ok&&G.flags.U_CONTRACT===true&&!G.flags.U_COPYRIGHT); }
  { const G=fresh('2028-09-27',9,'campus'); const it=itemOf('Y4S1',4,'ip_law'); let ok=false;
    if(it){ setDay(it.day,it.t0); H.picks=[0,0,0,0,0,0]; try{ await CLS.attend(GM,it,{door:true}); ok=true; }catch(e){ console.log(e); } }
    check('2-2. 大四上智財法第 4 週的討論課（合理使用）去了＝U_COPYRIGHT',ok&&G.flags.U_COPYRIGHT===true); }
  { const G=fresh('2028-09-27',9,'campus'); const it=itemOf('Y4S1',4,'ip_law'); setDay(it.day,it.t1+0.5); const n=CLS.skipNotes(GM);
    check('2-3. 條件不成立不設：沒去那一堂（下課後只有翹課的轉述）＝沒有 U_COPYRIGHT',n>=0&&!G.flags.U_COPYRIGHT&&!CLS.rec(G).done[it.key]); }
  const q14=flags=>{ const G=fresh('2028-10-11',21,'dorm',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1},flags||{})); H.FRIEND('heroine_04'); H.at('2028-10-11',21); G.zone='dorm'; Y34B.phone(G); PHONE.tick(G); const m=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='y4_q14'); return m?m.ask.opts.map(o=>o.t):null; };
  { const both=q14({U_COPYRIGHT:true,U_CONTRACT:true}), one=q14({U_COPYRIGHT:true});
    check('2-4. 讀的地方：兩個都有＝子晴 Q14 多「先看權利歸誰…」（AA_398 第 33 列）；只有一個＝沒有',!!both&&both.some(t=>/^先看權利歸誰/.test(t))&&!!one&&!one.some(t=>/^先看權利歸誰/.test(t)),JSON.stringify([both,one])); }
  });

  /* ======================= 3. AA294-SKIPCLASS-1018 ======================= */
  await sec('3',async()=>{
  /* ① 期中考：起床選單只有兩個、不能翹、到時間帶進考場、跳過時間停在考試前 */
  { const G=fresh('2025-10-23',7.5,'dorm'); const c=COURSES.list.find(x=>x.id==='civ_general'), ed=CLS.examDay(G,c,'Y1S1','mid');
    check('3-0. 有 CLS.day2Due、CLS.goDay2、CLS.examName',typeof CLS.day2Due==='function'&&typeof CLS.goDay2==='function'&&typeof CLS.examName==='function');
    setDay(ed.day,7.5); const it=CLS.dayItems(G).find(q=>q.c.id==='civ_general');
    check('3-1. 前提：民總期中考那一堂（mc5，exam mid）',!!it&&it.exam==='mid'&&it.examMain===true,JSON.stringify(it&&{exam:it.exam,main:it.examMain}));
    CLS.clearPending(); H.opts=[]; H.picks=[1]; const list=CLS.goList(G); let wk=false; if(list[0]===it||list[0].exam){ wk=await CLS.wakeMenu(GM); }
    const m=H.opts[0]||[];
    check('3-2. 期中考那天起床選單：只有「直接去考場」「先起床」，沒有翹（原本只有期末）',wk&&m.length===2&&/^直接去考場：/.test(m[0])&&!m.some(t=>t.includes('翹')),JSON.stringify(H.opts));
    toasts=[]; const sk=await CLS.skipClass(GM,it);
    check('3-3. 期中考不能翹：skipClass 回 false、不記 plan_skip、提示「期中考不能翹。」',sk===false&&!CLS.planSkip(G,it)&&toasts.includes('期中考不能翹。'),JSON.stringify(toasts));
    setDay(ed.day,10); const st=CLS.skipStops(GM,17);
    check('3-4. 跳過時間停在考試前 10 分鐘（「考試：民法總則」）',st.some(s=>/^考試：/.test(s.why)&&Math.abs(s.h-(it.t0-1/6))<1e-6),JSON.stringify(st));
    setDay(ed.day,it.t0-1/6+0.02); G.zone='dorm'; H.entered=[]; caps=[]; const real=Date.now; let T=1e12; Date.now=()=>T; CLS.clearPending();
    try{ for(let i=0;i<5;i++){ CLS.oneTick(GM); T+=600; } await new Promise(r=>setTimeout(r,30)); } finally { Date.now=real; CLS.clearPending(); }
    check('3-5. 期中考前 10 分鐘玩家空下來＝帶進考場（「期中考快開始了。你收拾東西往考場走。」）',H.entered.includes('classroom')&&caps.includes('期中考快開始了。你收拾東西往考場走。'),JSON.stringify({entered:H.entered,caps}));
    toasts=[]; setDay(ed.day,it.t0-0.1); G.zone='dorm'; const okSkip=await CLS.skipTo(GM,17);
    check('3-6. 考試前 10 分鐘以後不能用跳過時間跳過去',okSkip===false&&toasts.includes('期中考快開始了。'),JSON.stringify(toasts)); }
  /* ① 開學第二天的民總：12:30 帶過去（先霖澤館前那一段，再 201）*/
  { const G=fresh('2025-09-18',12.6,'dorm');
    check('3-7. 前提：法律系主線第 2 天（週四）',STORY.mainDay(G)===2&&G.weekday===4&&STORY.opening(G));
    const due=D2(G); G.hour=12.4; const early=D2(G); G.hour=15.3; const late=D2(G); G.hour=12.6; G.flags.classDone=true; const done=D2(G); delete G.flags.classDone;
    check('3-8. 第 2 天 12:30～15:12、還沒上＝要帶；12:30 以前、15:12 以後、上過了＝不帶',due&&!early&&!late&&!done,JSON.stringify([due,early,late,done]));
    H.entered=[]; caps=[]; const real=Date.now; let T=1e12; Date.now=()=>T; CLS.clearPending();
    try{ for(let i=0;i<5;i++){ CLS.oneTick(GM); T+=600; } await new Promise(r=>setTimeout(r,30));
      const first=H.entered.slice(); G.flags.campusIntro=true;   /* 霖澤館前那一段（story3d.js onEnter 的 campusMorning）演完 */
      for(let i=0;i<5;i++){ CLS.oneTick(GM); T+=600; } await new Promise(r=>setTimeout(r,30));
      check('3-9. 玩家空下來：先帶到校園（霖澤館前那一段：阿哲）、演完再帶進 201（字幕「走路到霖澤館。」）',first[0]==='campus'&&H.entered[H.entered.length-1]==='classroom'&&caps.includes('走路到法律系館A。'),JSON.stringify({first,entered:H.entered,caps}));
    } finally { Date.now=real; CLS.clearPending(); }
    const G2=fresh('2025-09-25',12.6,'dorm'); check('3-10. 第 9 天（下一個週四）不帶',!D2(G2));
    const G3=fresh('2025-09-18',12.6,'dorm'); G3.stage='econ'; check('3-11. 經濟系那一年不帶（AA_292 不適用本表）',!D2(G3)); }
  /* ② 延到下一次出席：柏翰你考幾分（第 10～11 週 → 到第 15 週）*/
  { const run=async(w,flags)=>{ const G=fresh('2025-11-13',13.3,'classroom',flags); const it=itemOf('Y1S1',w,'civ_general'); setDay(it.day,it.t1); H.said=[]; H.picks=[1]; await CLS.afterClassEvent(GM,it); return G; };
    let G=await run(13); check('3-12. 第 10～11 週沒去民總：第 13 週去了照樣演「你考幾分」（carryTo 15）',has('你民總幾分？')&&!!G.events.done.ev_bohan_score,JSON.stringify(lines()));
    G=await run(15); check('3-13. 第 15 週第一次去也演',has('你民總幾分？'));
    G=await run(7); check('3-14. 條件不成立不演：第 7 週（還沒到第 10 週）',!has('你民總幾分？'));
    const e=STORY_EVENTS.find(x=>x.id==='ev_bohan_score'); check('3-15. 事件資料：weeks [10,11]、carryTo 15',JSON.stringify(e.weeks)==='[10,11]'&&e.carryTo===15); }
  /* ② 便利貼第一張：到第 12 週 */
  { const run=async w=>{ const G=fresh('2025-11-06',9,'gongtong'); const d=STORY.termDay('Y1S1',w,4); setDay(d,9.1); H.said=[]; H.picks=['椅子也是']; await CLS.beforeClassEvent(GM,{c:{id:'english_y1'}}); return G; };
    let G=await run(10); check('3-16. 便利貼第一張：第 10 週才第一次來照樣有（原本第 3～5 週以後就沒有）',has('這個位子的插座是壞的。')&&G.flags.SK04_REPLY==='chair');
    G=await run(13); check('3-17. 第 13 週以後才第一次來：沒有（這條線沒有）',!has('這個位子的插座是壞的。')&&!G.flags.SK04_REPLY); }
  /* ② P4d：這學期第一次出席經原下就演；10-3 先見過阿勳的走 SK03 */
  { const run=async(w,flags)=>{ const G=fresh('2026-05-08',9,'putong',Object.assign({introDone:true,classDone:true,afternoonDone:true},flags||{})); const it=itemOf('Y1S2',w,'econ_principles_2'); setDay(it.day,it.t1); H.said=[]; H.picks=['「重修。」']; await CLS.afterClassEvent(GM,it); return G; };
    let G=await run(11); check('3-18. 第 2～7 週都沒去：第 11 週第一次去演 P4d「你怎麼又在這裡？」、記 P4D_ANSWER（原本不演）',has('……你怎麼又在這裡？')&&G.flags.P4D_ANSWER==='retake',JSON.stringify(lines()));
    G=await run(11,{MET_XUN:true,XUN_DAY:STORY.termDay('Y1S2',11,4),XUN_NIGHT:true}); check('3-19. 前一天 10-3 已經見過阿勳：照 SK03 的 10-4（「昨天那題我想通了。」），不演 P4d',has('昨天那題我想通了。')&&!has('……你怎麼又在這裡？'),JSON.stringify(lines())); }
  /* ② 沛珊的那張表：上債總一前，第 12 週沒去延到第 14 週；之後走信箱 */
  { const ek=STORY_EVENTS.find(e=>e.id==='ev_peishan_table_later_class'), em=STORY_EVENTS.find(e=>e.id==='ev_peishan_table_mail');
    const run=async w=>{ const G=fresh('2026-05-21',13.3,'classroom',{PS_CANCEL:'later'}); const it=itemOf('Y1S2',w,'oblig_gen1'); setDay(it.day,it.t0); H.said=[]; await CLS.beforeClassEvent(GM,it); return G; };
    let G=await run(13); check('3-20. 「改天再給我。」第 12 週沒去債總一：第 13 週上課前給（「給你。上次說的改天，就是今天。」）',has('給你。上次說的改天，就是今天。')&&G.flags.PS_TABLE_GOT===true,JSON.stringify(lines()));
    G=await run(15); check('3-21. 第 15 週：不給（期限第 14 週）',!has('給你。上次說的改天，就是今天。')&&!G.flags.PS_TABLE_GOT);
    const mail=d=>{ const G=fresh('2026-05-21',10,'dorm_hall',{PS_CANCEL:'later'}); setDay(d,10); G.zone='dorm_hall'; PHONE.post(G,{th:'p:classmate_peishan',from:'classmate_peishan',text:'今天下不去了。',tag:'ps_table_cancel'}); return EVENTS.check(em); };
    const t14=STORY.termDay('Y1S2',14,4); check('3-22. 第 14 週週四過了還沒拿到＝信箱版（改天的也走信箱）；第 14 週週四當天還不是',mail(t14+1)&&!mail(t14),JSON.stringify([mail(t14+1),mail(t14)])); }
  /* ③「你不在」的兩處回想 */
  { const G=fresh('2028-09-20',9,'campus'); const r1={record:'B_Y1S2_crim_gen2_w3',said:'x',listened:'y'}, r2={record:'B_Y1S1_const_1_w11',said:'x',listened:'y'}, r3={record:'B_Y4S1_public_judgment_sem_w3',said:'x',listened:'y'};
    const a=CLS.recallText(G,r1,{c:{id:'crim_judgment_sem'},week:3}), b=CLS.recallText(G,r2,{c:{id:'legal_research'},week:11}), c3=CLS.recallText(G,r3,{c:{id:'legal_research'},week:11});
    check('3-23. 大一那一堂沒去：刑事判決研討第 3 週、法學研究第 11 週（引用大一憲法）回想「（大一那一堂，你不在。老師講的那一題，你是第一次聽。）」（AA_294）',a==='（大一那一堂，你不在。老師講的那一題，你是第一次聽。）'&&b===a,JSON.stringify([a,b]));
    check('3-24. 法學研究第 11 週引用大四上的那一題：AA_350 R5 補了句子（沒選路線＝其他沒去的那一句；美國路線那一句在 tests/aa350_r_unit.js）',c3==='（大四上那一堂，你不在。老師講的那一題，你是第一次聽。）',c3);
    CLS.rec(G).disc.B_Y1S2_crim_gen2_w3=0; const d=CLS.recallText(G,r1,{c:{id:'crim_judgment_sem'},week:3}); check('3-25. 去過、有紀錄：照原本的回想（不出「你不在」）',d==='x'||d!==a,d); }
  });

  /* ======================= 4. VAC-ZR-UK-1017 芷若在英國照交情 ======================= */
  await sec('4',async()=>{
  { const ZR='heroine_02', thZ='p:heroine_02';
    check('4-0. 有 MSG.inUK、MSG.ukRow、MSG.ukReplyAt、MSG.ukDaily',typeof MSG.inUK==='function'&&typeof MSG.ukRow==='function'&&typeof MSG.ukReplyAt==='function'&&typeof MSG.ukDaily==='function');
    const monOf=k=>{ let d=STORY.dayOfKey(k); while(CALENDAR.dateOf(d).wd%7!==1) d++; return d; };
    const zr=(d,h,lv,flags)=>{ const G=fresh('2027-10-18',h,'dorm',flags); setDay(d,h); INV.addContact(G,ZR); SOCIAL.remember(ZR,'FIRST_MET',''); const r=SOCIAL.rel(ZR); r.fam=lv>=3?45:25; r.trust=lv>=3?30:0; r.comf=0; r.npcRom=lv>=5?35:0; return G; };
    const q=G=>(PHONE.rec(G).q||[]).filter(x=>x.items.some(it=>it.th===thZ));
    const M1=monOf('2027-10-18');
    /* 1. 開不開 */
    { const G=zr(M1,20,2); const o=MSG.open(G,ZR);
      check('4-1. 前提：大三上（2027-10）芷若在英國；有點熟＝不開（「她在英國，只寄明信片」）',MSG.inUK&&MSG.inUK(G,ZR)&&!o.ok&&o.why==='她在英國，只寄明信片',JSON.stringify(o)); }
    { const G=zr(M1,20,3); const o=MSG.open(G,ZR), T=MSG.topics(G,ZR).map(x=>x.k);
      check('4-2. 朋友＝開（原本一律不開）；話題：在幹嘛、分享，沒有問課、晚安',o.ok&&o.mode==='uk'&&o.uk==='friend'&&T.includes('chat')&&T.includes('share')&&!T.includes('course')&&!T.includes('night'),JSON.stringify({o,T})); }
    /* 2. 朋友：一週回一兩次、只回最新一則、前面加「抱歉，這週比較忙。」*/
    { const G=zr(M1,10,3); const r1=MSG.send(G,ZR,'chat'); const Q1=q(G);
      check('4-3. 朋友：週一傳 → 回覆排在週三台灣 22:00 以後（她那邊的下午），第一則「抱歉，這週比較忙。」、接著是「在英國」那一組',r1.ok&&Q1.length===1&&Q1[0].day===M1+2&&Q1[0].h>=22&&Q1[0].items[0].text==='抱歉，這週比較忙。'&&Q1[0].items.length>=2,JSON.stringify(Q1));
      setDay(M1+1,10); const r2=MSG.send(G,ZR,'share','cat'); const Q2=q(G);
      check('4-4. 週二又傳：這一段只回最新一則（週一那則排好的回覆拿掉），回的是貓那句「這邊的貓都不給摸。」',r2.ok&&Q2.length===1&&Q2[0].items.some(it=>it.text==='這邊的貓都不給摸。'),JSON.stringify(Q2));
      setDay(M1+2,23); PHONE.tick(G); const got=(G.msgs||[]).filter(m=>m.th===thZ&&m.from===ZR).map(m=>m.text);
      check('4-5. 週三晚上收到：「抱歉，這週比較忙。」「這邊的貓都不給摸。」（週一那則不回）',JSON.stringify(got)===JSON.stringify(['抱歉，這週比較忙。','這邊的貓都不給摸。']),JSON.stringify(got)); }
    /* 3. 好朋友、曖昧：當天回；她那邊半夜傳的，起床先回「我剛起床。」*/
    { const G=zr(M1,10,5); const o=MSG.open(G,ZR); MSG.send(G,ZR,'chat'); const Q=q(G);
      check('4-6. 好朋友、曖昧（第 5 階、兩人都單身）：她那邊半夜（夏令：台灣 06:00～15:00）傳的，15:00 以後她起床回，先「我剛起床。」',o.uk==='close'&&Q.length===1&&Q[0].day===M1&&Q[0].h>=15&&Q[0].h<16&&Q[0].items[0].text==='我剛起床。',JSON.stringify(Q)); }
    { const G=zr(M1,22,5); const T=MSG.topics(G,ZR).map(x=>x.k); const r=MSG.send(G,ZR,'night'); const Q=q(G);
      check('4-7. 好朋友：台灣 22:00 有晚安（她那邊下午）；回的是「這邊才下午。」或「晚安。我還有一堂課。」、當天就回',T.includes('night')&&r.ok&&Q.length===1&&Q[0].day===M1&&Q[0].h<23&&['這邊才下午。','晚安。我還有一堂課。'].includes(Q[0].items[0].text),JSON.stringify({T,Q})); }
    { const G=zr(M1,20,5); let cafe=0; for(let i=0;i<12;i++){ const e=MSG.pick(G,ZR,'chat'); if(!e||e.variant!=='在英國') cafe++; if(e&&(e.tags||[]).includes('交往中')) cafe++; }
      check('4-8. 好朋友：只用「在英國」那一組（朋友那一組也用），不出交往中才有的句子、不用 Café 的句子',cafe===0); }
    /* 4. 交往中：每週一則（AA_457 第 1 節改的；原本每天一則。英國 23:00 她睡前＝台灣 07:00，夏令 06:00）*/
    { const W=STORY.dayOfKey('2028-11-14'); const G=zr(W,6,5,{dating_heroine_02:true}); ROM.rec(G);
      check('4-9. 交往中＝mode uk、dating',MSG.open(G,ZR).uk==='dating');
      setDay(W,7.2); STORY.phoneRules(GM); PHONE.tick(G); const d1=(G.msgs||[]).filter(m=>m.th===thZ&&m.day===W).map(m=>[m.h,m.text]);
      check('4-10. 大四（2028-11，冬令）：台灣 07:00 收到這一週那一則（AA_457：先用這個月的新句子，11 月第一句「（照片：放映室的最後一排）」「今天的片三個小時。我沒有睡著。」）',d1.length===2&&d1.every(x=>x[0]>=7&&x[0]<7.25)&&JSON.stringify(d1.map(x=>x[1]))===JSON.stringify(['（照片：放映室的最後一排）','今天的片三個小時。我沒有睡著。']),JSON.stringify(d1));
      STORY.phoneRules(GM); PHONE.tick(G); check('4-11. 同一天不再有第二則',new Set((G.msgs||[]).filter(m=>m.th===thZ&&m.day===W).map(m=>m.tag)).size===1);
      setDay(W+1,7.2); STORY.phoneRules(GM); PHONE.tick(G); const d0=(G.msgs||[]).filter(m=>m.th===thZ&&m.day===W+1).map(m=>m.text);
      setDay(W+5,7.2); STORY.phoneRules(GM); PHONE.tick(G); const d2=(G.msgs||[]).filter(m=>m.th===thZ&&m.day===W+5).map(m=>m.text);
      check('4-12. 每週一則（AA_457）：隔天沒有；下一週（11/19）輪 11 月第二句「室友問我臺灣的冬天冷不冷。我說會下雨。」',!d0.length&&JSON.stringify(d2)===JSON.stringify(['室友問我臺灣的冬天冷不冷。我說會下雨。']),JSON.stringify([d0,d2]));
      const K=MSG.rec(G).ukWk.Y4; K.used.push('uk2_11c','d0','d1','d2','d3','d4','d5','d6'); MSG.rec(G).ukAff='2028-11'; setDay(W+12,7.2); STORY.phoneRules(GM); PHONE.tick(G);
      K.used.push('uk2_12a','uk2_12b','uk2_12c'); setDay(W+19,7.2); STORY.phoneRules(GM); PHONE.tick(G);
      const a=(G.msgs||[]).filter(m=>m.th===thZ&&m.day===W+12).map(m=>m.text), b=(G.msgs||[]).filter(m=>m.th===thZ&&m.day===W+19).map(m=>m.text);
      check('4-13. 第 8 則「今天沒什麼事。只是想跟你說晚安。」一個月最多一次照舊（AA_457：這個月的用完、原本前七句發過；11 月已經發過＝換下一則，12 月才發）',b[0]==='今天沒什麼事。只是想跟你說晚安。'&&a[0]==='學校的咖啡今天比較好喝。換了一個人煮。',JSON.stringify([a,b]));
      const T=MSG.topics(G,ZR).map(x=>x.k); check('4-14. 交往中的「在幹嘛」會出現交往中那兩則（照好朋友那一組再加）',T.includes('chat')&&(()=>{ let hit=false; for(let i=0;i<20;i++){ const e=MSG.pick(G,ZR,'chat'); if(e&&(e.tags||[]).includes('交往中')) hit=true; } return hit; })()); }
    { const W=STORY.dayOfKey('2028-11-14'); const G=zr(W,7.2,5); STORY.phoneRules(GM); PHONE.tick(G);
      check('4-15. 條件不成立不發：沒有交往＝沒有每天那一則',!(G.msgs||[]).some(m=>m.th===thZ)); }
    /* 5. 前任、回台中 */
    { const G=zr(M1,20,5,{EX_heroine_02:true}); const o=MSG.open(G,ZR); check('4-16. 前任：不開（只有寄到 Café 的明信片，BB_119 2-3）',!o.ok,JSON.stringify(o)); }
    { const H8=STORY.dayOfKey('2029-08-27'); const G=zr(H8,20,3); const pr=STORY.presence(ZR,G), o=MSG.open(G,ZR);
      check('4-17. 2029-08-25 回國後在台中（presence home）：照常傳（不是「她在英國」）',pr.kind==='home'&&o.ok&&o.mode!=='uk',JSON.stringify({pr,o})); }
    /* 6. 子晴「芷若在英國」那一句：認識芷若、一段期間只播一次 */
    { const G=zr(M1,23,3); INV.addContact(G,'heroine_04'); SOCIAL.remember('heroine_04','FIRST_MET',''); const r=SOCIAL.rel('heroine_04'); r.fam=45; r.trust=30; G.events.done.ev_ziqing_secret_game=1;
      let n=0; for(let i=0;i<8;i++){ const e=MSG.pick(G,'heroine_04','chat',null,{}); if(e&&e.variant==='芷若在英國'){ n++; ONCE(G)['heroine_04:zr_uk:'+ZKEY(G)]=G.day; } }
      const first=MSG.pick(G,'heroine_04','chat',null,{});
      check('4-18. 子晴：芷若在英國、祐廷認識芷若＝「芷若發了一張下雨的照片」那一句（一段期間只播一次）',n===1&&!(first&&first.variant==='芷若在英國'),String(n)); }
    { const G=zr(STORY.dayOfKey('2027-08-16'),23,3); INV.addContact(G,'heroine_04'); SOCIAL.remember('heroine_04','FIRST_MET',''); const r=SOCIAL.rel('heroine_04'); r.fam=45; r.trust=30; G.events.done.ev_ziqing_secret_game=1;
      let n=0; for(let i=0;i<8;i++){ const e=MSG.pick(G,'heroine_04','chat',null,{}); if(e&&e.variant==='芷若在英國') n++; }
      check('4-19. 芷若不在英國：子晴沒有那一句',n===0); }
  }
  });

  /* ======================= 5. CALLED_SHUYU：學姊交往那天起叫「書瑀」 ======================= */
  await sec('5',async()=>{
  { const S5='heroine_05';
    { const G=fresh('2026-04-10',20,'dorm'); H.rel(S5,45,30,0); ROM.rec(G);
      check('5-1. 前提：還沒交往＝沒有 CALLED_SHUYU、對話框的名字「溫書瑀」',!G.flags.CALLED_SHUYU&&SOCIAL.displayName(S5)==='溫書瑀',SOCIAL.displayName(S5));
      const ok=ROM.start(G,S5);
      check('5-2. 和學姊開始交往（ROM.start，期末飯、大峽谷都走這裡）那天就記 CALLED_SHUYU（原本只有大峽谷那一場記）',ok&&G.flags.CALLED_SHUYU===true);
      check('5-3. 讀的地方：交往中對話框、按鈕上她的名字＝「書瑀」（原本「溫書瑀」）；聯絡人、她的訊息照舊「書瑀」',SOCIAL.displayName(S5)==='書瑀'&&SOCIAL.contactName(S5)==='書瑀'&&PHONE.who({from:S5,name:'溫學姊'})==='書瑀',SOCIAL.displayName(S5));
      const ev={id:'t_sis_line',participants:[S5],dialogue:[{speaker:S5,text:'（測試）'}]}; H.said=[]; await EVENTS.runLines(ev.dialogue,ev);
      check('5-4. 劇情事件裡她說話：名字框「書瑀」',H.said.length===1&&H.said[0].who==='書瑀',JSON.stringify(H.said));
      SOCIAL.feel[S5]={fam:2}; const ft=SOCIAL.takeFeel(2);
      check('5-5. 交往中的「熟了一點」提示也叫書瑀（「和書瑀熟了一點。」）',ft.includes('和書瑀熟了一點。'),JSON.stringify(ft));
      ROM.end(G,S5,'apart_talk');
      check('5-6. 分手以後：CALLED_SHUYU 留著（叫過）；名字回到「溫書瑀」（分手以後怎麼叫等 BB 定）',G.flags.CALLED_SHUYU===true&&SOCIAL.displayName(S5)==='溫書瑀'); }
    { const G=fresh('2026-04-10',20,'dorm'); H.rel(S5,45,30,0); H.rel('heroine_01',45,30,0); ROM.start(G,'heroine_01');
      check('5-7. 條件不成立不設：和別人（以安）交往＝沒有 CALLED_SHUYU、學姊照原本的名字',!G.flags.CALLED_SHUYU&&SOCIAL.displayName(S5)==='溫書瑀'&&SOCIAL.displayName('heroine_01')==='沈以安'); }
    { const G=fresh('2026-04-10',20,'dorm',{dating_heroine_05:true}); H.rel(S5,45,30,0); delete G.flags.CALLED_SHUYU;
      check('5-8. 舊存檔還沒記：交往中的「書瑀」要等 CALLED_SHUYU（datingName 讀它）',SOCIAL.displayName(S5)==='溫書瑀'&&!G.flags.CALLED_SHUYU,SOCIAL.displayName(S5));
      ROM.rec(G); check('5-9. 舊存檔：讀檔（ROM.rec）時和學姊交往中＝補記 CALLED_SHUYU',G.flags.CALLED_SHUYU===true&&SOCIAL.displayName(S5)==='書瑀'); }
    { const G=fresh('2026-04-10',20,'dorm',{EX_heroine_05:true,romance:{heroine_05:{status:'ex',since:null,knows:[],suspicion:0,history:[{ev:'start',at:'Y1S2W5'},{ev:'end',at:'Y1S2W8'}]}}}); ROM.rec(G);
      check('5-10. 舊存檔：交往過（歷史有開始）也補記',G.flags.CALLED_SHUYU===true); }
  }
  });

  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

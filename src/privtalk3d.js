/* ===== 旁邊有她的人時，私密的東西不出、等她一個人（COMPANY-PRIV-1028）=====
   AA（劇情總監）2026-10-28 06:14 定案（AA_503 第 13 節第 3 點，企劃線 b88b35db2）：旁邊有人時不出的「私密」——
     告白；心意邀約、約會（「約她去…」）；交往中才有的互動；坦白有別人（ROM.tellBy）、多段感情的分開談話（AA_346）、她知情以後那幾場；
     問她自己還沒公開的事：子晴爸爸的事（Q8 一類）、沛珊重考（AA_281，她什麼都不說那段）、芷若交換申請（5/11 錄取以前）、語彤媽媽回診、學姊口試結果（5/29 當天）。
     一般閒聊、課業、讀書會、群組裡的事，不算私密。
   「旁邊有人」＝STORY.COMPANY（女主角的圈子：她那一列的同伴在她 3.2 m 內，src/hcircle3d.js HCIRCLE.company）。
   ■ 共用的判斷：STORY.privNow(G,id,n,GM)（story3d.js；true＝現在可以）。各入口一律走 PRIVTALK.ok(G,id,清單的 key,GM)：查這份清單（until：那天以後不算私密）再問 STORY.privNow。
   ■ 旁邊有人的時候：選項不出；說話前接演的、閒聊階梯那一層、說話（或走到她旁邊）觸發的事件這一次不演、不前進（照常閒聊），等下次她一個人再演。
   ■ 清單 S.LIST（一筆一個入口；gate＝怎麼接）：
       offerInvite＝story3d.js S.offerInvite 自己問（「約她去…」、TALK_OPTS 標 priv:true 的一次性選項）；priv＝那個選項標 priv:true（offerInvite 擋）；
       wrap＝這個檔包一層（MREL.meetAction、MREL.FLOW.heroine_02.meet、STORY.twoHeartsEcho、STORY.neededMissFor）；edit＝那個檔自己呼叫 PRIVTALK.ok（multirel3d.js 的 PRE_TALK）；
       hold＝閒聊階梯那一層（STORY.LADDER_HOLD；alt＝只有 linesIf／extraIf 換進私密那一版的句子時才擋）；choiceIf＝階梯那一層的一個選項（STORY.LADDER_CHOICE_IF）；
       prereq＝事件（STORY_EVENTS 的 prereq.custom）；evChoice＝事件裡的一個選項（那個選項的 if.custom）；none＝3D 說話裡沒有入口（寫明在哪裡）。
     沒有期限的，等到她一個人就演；有期限的寫在 defer（期限內一直有人＝照那一筆寫的）。
   ■ S.ASK_AA＝清單沒寫到、判斷不了算不算私密的（這一輪不擋，列給 AA）。
   ■ 不存檔：S.held 只記最近幾次擋下來的（除錯、測試用）。測試：node tests/company_priv_unit.js */
'use strict';
const PRIVTALK=(function(){
  const S={};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const MR=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  S.LIST=[
    /* ---- 約會（「約她去…」）＋各檔標 priv 的一次性選項 ---- */
    {key:'invite',cat:'約會',who:'*',kind:'opt',gate:'offerInvite',at:'src/story3d.js S.offerInvite「約她去…」（交往中的可昕＝「約會：選地點、日期、時間」）',
      defer:'這一次選單沒有「約她去…」；交換聯絡方式照常；她一個人的時候照常有'},
    {key:'opt_priv',cat:'各檔的私密選項',who:'*',kind:'opt',gate:'offerInvite',at:'src/story3d.js S.offerInvite（STORY.TALK_OPTS 回傳的選項標 priv:true）',
      defer:'這一次不出，選項的條件還在，她一個人的時候出'},
    /* ---- 坦白有別人（ROM.tellBy）---- */
    {key:'tell_now',cat:'坦白有別人',who:['heroine_01','classmate_peishan'],kind:'opt',gate:'priv',at:'src/multirel3d.js STORY.TALK_OPTS（S.confessAny：「我有件事要跟妳講。」／「那我也跟妳講一件事。」→ ROM.tellBy）',
      defer:'選項不出；沒有期限（她一個人的時候出）'},
    {key:'tell_later',cat:'坦白有別人',who:['heroine_05','heroine_04','heroine_02','heroine_03','kexin'],kind:'opt',gate:'priv',at:'src/multirel3d.js STORY.TALK_OPTS（S.confLaterFor：「（下次見面，自己跟她講…的事）」；交往中才有）',
      defer:'選項不出；沒有期限'},
    /* ---- 她知情以後那幾場 ---- */
    {key:'knows_talk',cat:'她知情以後',who:MR,kind:'pre',gate:'wrap',at:'src/multirel3d.js 包 STORY.talkCharacter 的那一層：MREL.meetAction（kind talk／noodle）＝和她說話時演的發現、冷靜、挽回、結果',
      defer:'這一次不演、不前進（學姊「正常見面」的紀錄 MREL.sisMet 照記），照常說話；流程沒有期限，下次她一個人時演'},
    {key:'knows_cafe',cat:'她知情以後',who:'heroine_02',kind:'pre',gate:'wrap',at:'src/multirel3d.js：吧檯的芷若（MREL.FLOW.heroine_02.meet kind cafe）',
      defer:'這一次不演（照常點餐）；冷靜期一天一次，下一次她一個人時演'},
    {key:'knows_echo',cat:'她知情以後',who:['heroine_01','heroine_05'],kind:'pre',gate:'wrap',at:'src/story3d.js S.twoHeartsEcho（1A-02 攤牌以後第一次說話那一句）',
      defer:'這一次不說；只要還在交往，下次她一個人時說'},
    {key:'ps_bterm',cat:'她知情以後',who:'classmate_peishan',kind:'pre',gate:'edit',at:'src/multirel3d.js STORY.PRE_TALK（沛珊結果 B：每學期第一週「這學期還可以嗎？我們講好的那些。」）',
      defer:'有期限：那學期第一週裡她一個人時才問；第一週每次都有人＝這學期不問（同第一週沒遇到她；要不要延到第二週列給 AA）'},
    /* ---- 問她自己還沒公開的事：子晴爸爸（Q8 一類）---- */
    {key:'zq_dad_pre',cat:'還沒公開',topic:'子晴爸爸',who:'heroine_04',kind:'pre',gate:'edit',at:'src/multirel3d.js STORY.PRE_TALK（Q8 河堤沒遇到、說「改天講」：下一次見面她第一句「我爸那天說，做遊戲是在浪費時間。」）',
      defer:'這一次不說；沒有期限（ZQ_DAD_SAID 沒記），下次她一個人時說'},
    {key:'zq_dad_miss',cat:'還沒公開',topic:'子晴爸爸',who:'heroine_04',kind:'pre',gate:'wrap',msg:'zq_dad',at:'src/story3d.js S.neededMiss（zq_dad 沒回的那一句「我爸要來那則，你沒回。」）',
      defer:'這一次不說（不記說過）；沒回那一句本來的期限照舊（關閉後 14 天、Q8 以前）'},
    {key:'zq_dad_q8',cat:'還沒公開',topic:'子晴爸爸',who:'heroine_04',kind:'event',gate:'prereq',ev:'ev_ziqing_dad_visit',at:'src/data/y2b_events.js Q8「爸爸來了」（公館，走到她那裡就演）',
      defer:'有期限（大二下第 13～14 週平日 22～23 點）：有人＝等；都沒碰到照原本的 6/4 22:00 私訊（y2b3d.js）'},
    {key:'zq_dad_q8b',cat:'還沒公開',topic:'子晴爸爸',who:'heroine_04',kind:'event',gate:'prereq',ev:'ev_ziqing_dad_stuck',at:'src/data/r2y3a_events.js Q8b「爸爸卡關了」（10/6～10/8 公館，走到她旁邊才演）',
      defer:'有期限（10/6～10/8 22:00～23:30）：有人＝等；三天都沒演照原本的 10/8 23:00 三則（ZQ_Q8B_PHONE）'},
    /* ---- 沛珊重考（AA_281，她什麼都不說那段）---- */
    {key:'ps_retake_ev',cat:'還沒公開',topic:'沛珊重考',who:'classmate_peishan',kind:'event',gate:'prereq',ev:'ev_peishan_decision',at:'src/data/events.js P3「我要重考」（交往中；她走過來）',
      defer:'有期限（大二上第 5 週平日 12～13 點）：有人＝等；整週都有人＝這一場沒有（同沒碰到；現在的圈子資料沒有和這段重疊的列，tests/company_priv_unit.js 第 5 段會查）'},
    {key:'ps_retake_lad',cat:'還沒公開',topic:'沛珊重考',who:'classmate_peishan',kind:'ladder',gate:'hold',steps:{'P3-L3':['linesIf',0],'P3-L4':['linesIf',0],'P3-L6':['linesIf',0],'P3-L8':['linesIf',0]},
      at:'閒聊階梯大二上（P3 以後的 linesIf：旁聽教育系、跟爸媽說了、重考的那一份、下學期會休學）',defer:'這一層這一次不播、不前進；下次她一個人時播（階梯照原本：學期結束還沒播到的就沒有）'},
    {key:'ps_plan_miss',cat:'還沒公開',topic:'沛珊重考',who:'classmate_peishan',kind:'pre',gate:'wrap',msg:'ps_plan',at:'src/story3d.js S.neededMiss（ps_plan 沒回的那一句「重考計畫那則你沒回。」）',
      defer:'這一次不說（不記說過）；期限照舊'},
    /* ---- 芷若交換申請（5/11 錄取以前）---- */
    {key:'zr_exch_ev',cat:'還沒公開',topic:'芷若交換申請',who:'heroine_02',kind:'event',gate:'prereq',ev:'ev_zhiruo_secret',until:'2027-05-11',at:'src/data/events.js Z4「十點的電話」（溫州街，和她說話觸發）',
      defer:'有期限（大一下第 11～15 週週六 14～18 點）：有人＝這一次照常說話，下次她一個人時演'},
    {key:'zr_exch_applied',cat:'還沒公開',topic:'芷若交換申請',who:'heroine_02',kind:'event',gate:'prereq',ev:'ev_zhiruo_applied',until:'2027-05-11',at:'src/data/events.js Z7「她交件了」（Café，看到你就說）',
      defer:'有期限（2026-12-11 以後到大二上結束 12/27，11～22 點，Café）：有人（吧檯旁邊的同事）＝等；都沒演照原本寒假第一天的私訊、Z7b（events.js）'},
    {key:'zr_exch_ask',cat:'還沒公開',topic:'芷若交換申請',who:'heroine_02',kind:'evChoice',gate:'evChoice',ev:'ev_zhiruo_bell',choice:'「妳的交換申請交了嗎？」',until:'2027-05-11',at:'src/data/events.js 傅鐘旁邊的那一個選項',
      defer:'這一次選項不出（其他兩個照常）'},
    {key:'zr_exch_lad',cat:'還沒公開',topic:'芷若交換申請',who:'heroine_02',kind:'ladder',gate:'hold',until:'2027-05-11',steps:{'Z2-L6':['extraIf',0],'Z2-L8':['linesIf',0],'Z3-L6':['linesIf',0],'Z4-L4':['linesIf',0]},
      at:'閒聊階梯（知道她申請的玩家才換進來的那一版：交換的申請也是一直拖、還沒交、送出去以後、英國那邊的信）',defer:'這一層這一次不播、不前進；下次她一個人時播'},
    /* ---- 語彤媽媽回診 ---- */
    {key:'yt_mom_lad',cat:'還沒公開',topic:'語彤媽媽回診',who:'heroine_03',kind:'ladder',gate:'hold',steps:{'Y-L7':null,'Y7-L8':null},at:'閒聊階梯 Y-L7（大一上「我媽每個月要回診一次」）、Y7-L8（大四上「期末考完，我要陪我媽去回診」）',
      defer:'這一層這一次不播、不前進；下次她一個人時播'},
    {key:'yt_mom_ask',cat:'還沒公開',topic:'語彤媽媽回診',who:'heroine_03',kind:'ladderChoice',gate:'choiceIf',step:'Y4-L6',choice:'「妳媽媽身體還好嗎？」',at:'閒聊階梯 Y4-L6 的第二個選項',
      defer:'這一次只出第一個選項'},
    /* ---- 3D 說話裡沒有入口的（寫明在哪裡；之後加入口就用這個 key 問 PRIVTALK.ok）---- */
    {key:'sis_oral',cat:'還沒公開',topic:'學姊口試結果',who:'heroine_05',kind:'none',gate:'none',from:'2029-05-29',until:'2029-05-30',
      at:'沒有 3D 入口：結果在 5/29 16:00～18:00 研究室走廊的出遊（y34b3d.js M9，2D）、家族群組、電話（ev_sis_defense_call）；她 5/29 08～18 點不在 3D（characters.js）'},
    {key:'dating',cat:'交往中才有的互動',who:'*',kind:'none',gate:'none',
      at:'3D 說話裡交往中才有的都在上面各筆：「（下次見面，自己跟她講…的事）」（tell_later）、知情以後那幾場（knows_talk、knows_cafe、knows_echo、ps_bterm）、交往中的可昕「約會：選地點、日期、時間」（invite）；閒聊、沒回訊息那一句的「交往中版本」列給 AA（ASK_AA）'},
    {key:'confess',cat:'告白',who:'*',kind:'none',gate:'none',at:'沒有 3D 入口：告白在學期末的飯回家的路上（termend3d.js）、正式校外約會的結尾（date3d.js，現在只有學姊重新開始那一次）、特別場景（出遊），都是 2D'},
    {key:'heart',cat:'心意邀約',who:'*',kind:'none',gate:'none',at:'沒有 3D 入口：心意邀約是手機（termend3d.js，時段第一天 20:30 起），飯和回家的路是出遊（2D）'},
    {key:'apart',cat:'分開談話（AA_346）',who:'*',kind:'none',gate:'none',at:'沒有 3D 入口：選一個人以後的分開談話是出遊（r2y4b3d.js OUT.plan，2D，旁白「只剩你們兩個」）和電話'}];
  S.byKey={}; for(const e of S.LIST) S.byKey[e.key]=e;
  /* 清單沒寫到、判斷不了的（這一輪不擋，列給 AA）*/
  S.ASK_AA=[
    {what:'芷若×子晴交往中、祐廷還不知道：其中一人自己告訴他（src/zrzq3d.js ZRZQ.preTalk，AA_385 第 4 節；ev_zz_f3_told「我跟子晴在一起。」）',q:'她們自己的事還沒公開；旁邊是對方（子晴在芷若旁邊）以外的人（小婷、工讀生、晨希…）要不要等'},
    {what:'子晴、芷若分開以後第一次說話（src/multirel3d.js zzPreTalk、ZZ_AFTER）',q:'算不算私密'},
    {what:'學姊說要去美國交換（src/sis_y2y3_3d.js ev_sis_us_told，大三上 11/1～11/9 說話前接演）',q:'清單只有芷若的交換申請；學姊的要不要一樣'},
    {what:'沛珊說和柏翰分開了（events.js ev_peishan_split，霖澤館走過來）',q:'她自己的感情，算不算私密'},
    {what:'以安「明軒的事……」（src/y2r2_3d.js TALK_OPTS）',q:'明軒向她告白的事，算不算私密'},
    {what:'語彤麵店租約「幫她」三個選項（src/y2r2_3d.js TALK_OPTS：問打工、先借妳、找資料），阿姨就在旁邊',q:'她家裡的錢的事，算不算私密'},
    {what:'閒聊階梯、沒回訊息那一句的「交往中版本」（linesIf／extraIf 的 dating_、needed_msgs.js 的 missDating：例 A5-L8、A7-L1、Y8-L0、Y8-L4、S7-L2、Z2-L8 的 extraIf）',q:'是同一段閒聊的交往版，不是另外的互動；要不要也算「交往中才有的互動」'},
    {what:'子晴講爸爸的閒聊階梯（Q-L6、Q2-L1、Q2-L8、Q3-L1、Q3-L6、Q4-L6、Q5-L3、Q5-L8、Q6-L1…）',q:'她自己隨口提的，不是 Q8 那一類；要不要擋'},
    {what:'子晴 Q7「實驗室的信」（ev_ziqing_lab_letter，吉他社）、「那天」（ev_ziqing_dad_sorry，Q8 選「他一定會懂」以後兩週內的吉他社）',q:'場景本來就排在社課（旁邊有社員）；要不要等她一個人（社課以外沒有地方演）'},
    {what:'前任第一次見面那一句（src/v6ex3d.js preLine：以安、語彤知道你之後又和別人交往…）',q:'算不算「她知情以後」'},
    {what:'到場就演的知情場景（MREL.dueAuto：語彤顧店時來麵店、芷若的班要結束時在 Café、以安／沛珊讀書會散會）、裂縫談話（cracktalk3d.js：語彤「人到三樓就演」）',q:'AA 原本就排在她工作、讀書會的地方（阿姨、同事在旁邊）；這一輪只擋「和她說話」那一條，到場就演的沒擋'},
    {what:'旁邊的人本來就知道的（語彤和阿姨談媽媽、芷若和子晴談交換申請）',q:'照規則一樣不出（凡是她圈子裡的人在 3.2 m 內都算「旁邊有人」）；要不要例外'}];
  S.held=[];
  const hold=(G,id,key)=>{ S.held.push({key,id,day:G&&G.day,h:G&&G.hour}); if(S.held.length>40) S.held.splice(0,S.held.length-40); };
  /* 共用：這一筆現在可以嗎（清單上的 from／until 以外不算私密）*/
  S.ok=function(G,id,key,GM){ const e=S.byKey[key]; if(!e) console.warn('PRIVTALK 清單沒有',key);
    if(!G||!id) return true;
    if(e){ if(e.until){ const u=DK(e.until); if(u!=null&&G.day>=u) return true; } if(e.from){ const f=DK(e.from); if(f!=null&&G.day<f) return true; } }
    const ok=typeof STORY==='undefined'||!STORY.privNow||STORY.privNow(G,id,null,GM);
    if(!ok) hold(G,id,key); return ok; };

  /* ---------- 閒聊階梯 ---------- */
  S.ladStep=function(G,who,sid){ if(typeof STORY==='undefined'||!STORY.ladData) return null; const D=STORY.ladData(G,who); return (D&&D.L&&(D.L.steps||[]).find(s=>s.id===sid))||null; };
  /* 那一版私密的句子（linesIf／extraIf 第幾套；和原本 lines 一樣的不算）*/
  S.privText=function(st,v){ if(!st||!v) return []; const x=((st[v[0]])||[])[v[1]]; if(!x) return []; const base=new Set(st.lines||[]); return (x.lines||[]).filter(t=>!base.has(t)); };
  /* 這一次會說的句子裡有沒有私密那一版（v＝null：整層都是私密的）*/
  S.ladPriv=function(G,who,sid,v){ if(!v) return true; const st=S.ladStep(G,who,sid); if(!st||!STORY.ladLines) return false; const P=S.privText(st,v); if(!P.length) return false;
    return STORY.ladLines(st,G,who).some(l=>P.includes(typeof l==='string'?l:(l&&l.t))); };
  S.wireLadder=function(e){ if(typeof STORY==='undefined'||!STORY.LADDER_HOLD) return false; let n=0;
    for(const sid in e.steps){ const v=e.steps[sid], h0=STORY.LADDER_HOLD[sid];
      STORY.LADDER_HOLD[sid]=function(G){ if(h0&&!h0.apply(this,arguments)) return false; if(!S.ladPriv(G,e.who,sid,v)) return true; return S.ok(G,e.who,e.key); }; n++; }
    return n>0; };
  S.wireLadChoice=function(e){ if(typeof STORY==='undefined'||!STORY.LADDER_CHOICE_IF) return false; const R=STORY.LADDER_CHOICE_IF[e.step]||(STORY.LADDER_CHOICE_IF[e.step]={}); const c0=R[e.choice]||{}, f0=c0.custom;
    R[e.choice]=Object.assign({},c0,{custom:function(G,GM){ return (typeof f0!=='function'||f0.apply(this,arguments))&&S.ok(G,e.who,e.key,GM); }}); return true; };

  /* ---------- 事件 ---------- */
  S.evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(q=>q&&q.id===id)||null:null;
  S.wireEvent=function(e){ const ev=S.evOf(e.ev); if(!ev) return false; const p=ev.prereq||(ev.prereq={}), f0=p.custom;
    p.custom=function(G,GM){ return (typeof f0!=='function'||f0.apply(this,arguments))&&S.ok(G,e.who,e.key,GM); }; ev.privKey=e.key; return true; };
  S.wireEvChoice=function(e){ const ev=S.evOf(e.ev); if(!ev) return false; for(const l of (ev.dialogue||[])){ const ch=l&&Array.isArray(l.choice)&&l.choice.find(c=>c&&c.text===e.choice); if(!ch) continue;
      const c=ch.if||(ch.if={}), f0=c.custom; c.custom=function(G,GM){ return (typeof f0!=='function'||f0.apply(this,arguments))&&S.ok(G,e.who,e.key,GM); }; return true; }
    return false; };

  /* ---------- 包一層的（gate:'wrap'）---------- */
  S.wireWrap=function(e){
    if(e.key==='knows_talk'){ if(typeof MREL==='undefined'||!MREL.meetAction) return false; if(MREL._privMeet) return true; const m0=MREL.meetAction;
      MREL.meetAction=function(G,x,kind){ if((kind==='talk'||kind==='noodle')&&G&&!S.ok(G,x,e.key)){ if(x==='heroine_05'&&kind==='talk'&&MREL.sisMet&&!(MREL.rec(G).pend||{})[x]) MREL.sisMet(G); return null; } return m0.apply(this,arguments); };   /* 學姊的「正常見面」照記（AA_474 1-2，知情版第二次的條件；有還沒演的發現就不算，同原本）*/
      MREL._privMeet=true; return true; }
    if(e.key==='knows_cafe'){ const F=typeof MREL!=='undefined'&&MREL.FLOW&&MREL.FLOW.heroine_02; if(!F||!F.meet) return false; if(F._priv) return true; const f0=F.meet;
      F.meet=function(G,st,kind){ if(kind==='cafe'&&G&&!S.ok(G,'heroine_02',e.key)) return null; return f0.apply(this,arguments); }; F._priv=true; return true; }
    if(e.key==='knows_echo'){ if(typeof STORY==='undefined'||!STORY.twoHeartsEcho) return false; if(STORY._privEcho) return true; const f0=STORY.twoHeartsEcho;
      STORY.twoHeartsEcho=async function(GM,id){ if(GM&&GM.G&&!S.ok(GM.G,id,e.key,GM)) return false; return f0.apply(this,arguments); }; STORY._privEcho=true; return true; }
    if(e.msg){ if(typeof STORY==='undefined'||!STORY.neededMissFor) return false; S.MISS=S.MISS||{}; S.MISS[e.msg]=e;
      if(!STORY._privMiss){ const f0=STORY.neededMissFor; STORY.neededMissFor=function(G,m,who){ const r=f0.apply(this,arguments); const q=r&&m&&S.MISS[m.id]; if(q&&!S.ok(G,q.who,q.key)) return null; return r; }; STORY._privMiss=true; }   /* null＝這一次不說、不記說過（neededMissLine 照原本往下找）*/
      return true; }
    return false; };

  /* ---------- 接線（載入時一次）---------- */
  S.wire=function(){ for(const e of S.LIST){ if(e._wired) continue; let ok=false;
      try{ if(e.gate==='hold') ok=S.wireLadder(e); else if(e.gate==='choiceIf') ok=S.wireLadChoice(e); else if(e.gate==='prereq') ok=S.wireEvent(e); else if(e.gate==='evChoice') ok=S.wireEvChoice(e); else if(e.gate==='wrap') ok=S.wireWrap(e);
        else ok=true;   /* offerInvite、priv、edit：那個檔自己問；none：沒有入口 */ }catch(err){ console.warn('PRIVTALK wire',e.key,err); ok=false; }
      e._wired=ok; if(!ok) console.warn('PRIVTALK 接不上',e.key); }
    return S.LIST.filter(e=>!e._wired).map(e=>e.key); };
  S.wire();
  return S;
})();
if(typeof window!=='undefined') window.PRIVTALK=PRIVTALK;

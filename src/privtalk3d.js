/* ===== 旁邊有她的人時，私密的東西不出、等她一個人（COMPANY-PRIV-1028；第三輪 PRIV-AAFIX-1028）=====
   AA（劇情總監）2026-10-28 06:14 定案（AA_503 第 13 節第 3 點，企劃線 b88b35db2）：旁邊有人時不出的「私密」——
     告白；心意邀約、約會（「約她去…」）；交往中才有的互動；坦白有別人（ROM.tellBy）、多段感情的分開談話（AA_346）、她知情以後那幾場；
     問她自己還沒公開的事：子晴爸爸的事（Q8 一類）、沛珊重考（AA_281，她什麼都不說那段）、芷若交換申請（5/11 錄取以前）、語彤媽媽回診、學姊口試結果（5/29 當天）。
     一般閒聊、課業、讀書會、群組裡的事，不算私密。
   第三輪：AA 2026-10-28 定第一輪問的 12 項＋共同的保底（AA_503 第 14 節，企劃線 6bc3cd784；記錄在 S.DECIDED）；後補 4 點（第 14 節後補，企劃線 0e46fdc7e；記錄在 S.LATER）。原則：她不會當著別人說的才擋——
     感情、她自己還沒說出去的事、講到祐廷現在和誰在一起；場景本來就排在有那個人的地方、那個人就是當事人或已經知道的，不擋；她自己隨口講的，不擋。
   「旁邊有人」＝STORY.COMPANY（女主角的圈子：她那一列的同伴在她 3.2 m 內，src/hcircle3d.js HCIRCLE.withNow 回傳旁邊那幾個人的 id）。
   ■ 共用的判斷：各入口一律走 PRIVTALK.ok(G,id,清單的 key,GM,sub)：查這份清單（from／until：那段以外不算私密；except：不算「旁邊有人」的人），再問 STORY.crowdNow。
   ■ 共同的保底（AA_503 第 14 節；第 13 節第 3 點的清單也適用；第 14 節後補第 3、4 項，企劃線 0e46fdc7e，S.LATER）：
       沒有期限的：等了 7 天（遊戲日）還等不到她一個人，第 8 天起照演，開頭一句旁白 S.NARR「（她跟旁邊的人說了一聲，走到你這邊。）」；
       有期限的（清單的 due：日期、'ev'＝那個事件自己的學期週次星期算出來的最後一天、或函式）：到期那天照這樣演。她一個人＝照常，沒有旁白。
     怎麼記（存檔 G.flags.PRIVWAIT＝{'key|她|sub': 第一次因為旁邊有人擋下來的那一天}；舊存檔沒有＝第一次擋下來才建）：
       S.ok 擋下來（旁邊有人、還沒到）的那一刻記第一天（已經有就不動）；第一天＋7 天（due 有寫的：到 due 那天）起 S.ok 放行（旁邊還有人也一樣）。
       那一段真的開始演＝S.lead(GM,key,她,sub)：旁邊還有人（例外的人不算）＝先說旁白，然後清掉等待（下一次再擋從頭算）。
       只有真的演了才清（後補第 4 項）：選項出來了、玩家沒選，下次又被擋＝不重新算——照舊從這一項第一次被擋那天算，第 8 天照出。
       各入口只在那一段真的要演的時候問 S.ok（事件：其他條件都過了、prereq 的 custom 最後問；閒聊階梯：情境對了〔story3d.js ladNext 先看情境再問 LADDER_HOLD〕；
       知情那幾場：MREL 先算出這一次要演的、要算的次數，有才問；1A-02 那一句：STORY.twoHeartsEchoDue）——擋下來的那一天才是「第一天」。
     每一種入口怎麼接旁白、什麼時候清：
       offerInvite／priv（選單的選項）：S.ok 放行＝選項出來（不清）；選了那一個＝S.lead（story3d.js S.privLead）再演（清掉）；
       wrap：知情那幾場（MREL.meetAction、FLOW.heroine_02.meet）＝回傳的 run 包一層先 S.lead；1A-02 那一句、沒回訊息那一句、前任那兩句＝S.leadGM（第一次說話以前先 S.lead）；
         知情那幾場的次數（後補第 3 項：擋下來沒演的不算，只有真的演出來的才算一次）：MREL 算的時候動到的她那一段流程（MREL.st：學姊一般見面 meets、語彤被打擾 dist／distant、
           語彤的結果 C、可昕收回以後的 w…）和學姊一般見面的紀錄（MREL.sm，sisMet）——擋下來＝還原成算以前（S.mrelSnap／S.mrelBack）；
           只有次數、沒有場景的那一次（學姊一般見面、語彤第一次被打擾）也是知情的一次見面：旁邊有人＝擋（不算、記等待），她一個人＝算；等了 7 天＝算，開頭旁白（回傳只有旁白的 run，abort false，接著照常說話）；
           只動到學姊一般見面那一筆（她沒有知情的流程要動）：旁邊有人＝不記，不擋、不記等待（沒有要演的）；
         芷若×子晴自己告訴祐廷、學姊的美國交換＝ZRZQ.preTalk、SISY23.preTalkEv 擋，那一場的第一句前面接一行 call（S.wireLead）；
       edit：那個檔自己問 PRIVTALK.ok、演之前叫 PRIVTALK.lead（multirel3d.js：子晴爸爸那一句、沛珊「對一次」、分開以後那幾段）；
       hold：閒聊階梯那一層（STORY.LADDER_HOLD 擋；STORY.ladPlay 包一層，播之前 S.lead，sub＝那一層的 id）；choiceIf：階梯那一層的一個選項（出來了不清，選了那一個才 S.lead）；
       prereq：事件（STORY_EVENTS 的 prereq.custom 擋；dialogue 第一行接 call＝S.lead）；evChoice：事件裡的一個選項（那個選項要跳去的 label 後面接 call＝S.lead）。
   ■ 不擋、換一般版的（第 7 項）：閒聊階梯、沒回訊息那一句的交往中那一版——旁邊有她的人時說一般版（STORY.DATING_QUIET，S.dateVar）；沒有一般版的照說；不等、不記。
   ■ 不擋、開頭加旁白的（第 9 項）：S.SCENE_LEAD（子晴 Q7 兩場，載入時接在對話最前面，不管旁邊有沒有人）。
   ■ 清單 S.LIST（一筆一個入口；gate＝怎麼接）：
       offerInvite＝story3d.js S.offerInvite 自己問（「約她去…」、TALK_OPTS 標 priv 的一次性選項：privKey＝清單的 key，沒寫＝opt_priv）；priv＝那個選項標 priv:true＋privKey（offerInvite 擋）；
       wrap＝這個檔包一層；edit＝那個檔自己呼叫 PRIVTALK.ok；hold＝閒聊階梯那一層（STORY.LADDER_HOLD；alt＝只有 linesIf／extraIf 換進私密那一版的句子時才擋）；
       choiceIf＝階梯那一層的一個選項（STORY.LADDER_CHOICE_IF）；prereq＝事件（STORY_EVENTS 的 prereq.custom）；evChoice＝事件裡的一個選項（那個選項的 if.custom）；none＝3D 說話裡沒有入口（寫明在哪裡）。
     每一筆：desc＝入口在哪；note＝旁邊有人時怎麼辦、期限（desc、note 是給人看的說明，不進遊戲）；due＝期限（有寫的照到期那天，沒寫的照 7 天）；except＝本來就知道的人（第 12 項、第 1 項）。
     選項的「等了 7 天照出」都從這一項第一次被擋那天算：出來了玩家沒選、下次又被擋，不重新算（後補第 4 項）。
   ■ S.held、S.passed、S.narrated：最近幾次擋下來、放行、說了旁白的（除錯、測試用，不存檔）。測試：node tests/company_priv_unit.js */
'use strict';
const PRIVTALK=(function(){
  const S={};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const MR=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  S.REF='AA_503 第 14 節（企劃線 claude/magical-albattani-bk7b4n 6bc3cd784，AA-C 2026-10-28）';
  S.NARR='（她跟旁邊的人說了一聲，走到你這邊。）';   /* 共同的保底：等了 7 天、到期那天照演時的第一句（AA_503 第 14 節，一字不差）*/
  S.WAIT=7;   /* 第一次擋下來那一天算第 1 天：第 8 天（＋7）起照演 */
  /* 旁邊的人本來就知道的（第 12 項：只限這三組）：語彤和阿姨（媽媽的事）、芷若和子晴（交換申請）、第 1 項的對方本人（各筆的 except）*/
  const KNOW={ytMom:['hc_ayi'],zrExch:['heroine_04']};
  /* 期限算法 */
  const evDue='ev';   /* 那個事件自己的學期、週次、星期：最後一個可以演的日子（S.evDue）*/
  const missDue=mid=>(G,id)=>S.missDue(G,mid,id);   /* 沒回訊息那一句：關閉以後 14 天的最後一天（story3d.js neededMissLine 的期限）*/
  const btermDue=G=>{ if(typeof CALENDAR==='undefined'||!CALENDAR.termOf) return null; const T=CALENDAR.termOf(G.day); if(!T||T.week!==1) return null; let d=G.day; for(let k=0;k<8;k++){ const T2=CALENDAR.termOf(d+1); if(!T2||T2.id!==T.id||T2.week!==1) break; d++; } return d; };   /* 那學期第一週的最後一天 */
  const f3Due=G=>{ if(typeof ZRZQ==='undefined'||!ZRZQ.f3Away||!ZRZQ.f3Away(G)) return null; const W=(typeof R2Y3B!=='undefined'&&R2Y3B.F3_JP)||ZRZQ.F3_JP; return W?DK(W.to):null; };   /* 日本路線回國以後 8/5～9/1 當面說（AA_385 第 7 項）：9/1；臺灣沒有期限 */
  const anEnd=()=>(typeof Y2R2!=='undefined'&&Y2R2.D&&Y2R2.D.an_end)||'2027-09-05';
  S.LIST=[
    /* ---- 約會（「約她去…」）＋各檔標 priv 的一次性選項 ---- */
    {key:'invite',cat:'約會',who:'*',kind:'opt',gate:'offerInvite',desc:'src/story3d.js S.offerInvite「約她去…」（交往中的可昕＝「約會：選地點、日期、時間」）',
      note:'這一次選單沒有「約她去…」；交換聯絡方式照常；她一個人的時候照常有；沒有期限：等了 7 天照出（選了先一句旁白）'},
    {key:'opt_priv',cat:'各檔的私密選項',who:'*',kind:'opt',gate:'offerInvite',desc:'src/story3d.js S.offerInvite（STORY.TALK_OPTS 回傳的選項標 priv:true、沒有寫 privKey 的）',
      note:'這一次不出，選項的條件還在，她一個人的時候出；等了 7 天照出'},
    /* ---- 坦白有別人（ROM.tellBy）---- */
    {key:'tell_now',cat:'坦白有別人',who:['heroine_01','classmate_peishan'],kind:'opt',gate:'priv',desc:'src/multirel3d.js STORY.TALK_OPTS（S.confessAny：「我有件事要跟妳講。」／「那我也跟妳講一件事。」→ ROM.tellBy；privKey tell_now）',
      note:'選項不出；沒有期限（她一個人的時候出；等了 7 天照出）'},
    {key:'tell_later',cat:'坦白有別人',who:['heroine_05','heroine_04','heroine_02','heroine_03','kexin'],kind:'opt',gate:'priv',desc:'src/multirel3d.js STORY.TALK_OPTS（S.confLaterFor：「（下次見面，自己跟她講…的事）」；交往中才有；privKey tell_later）',
      note:'選項不出；沒有期限'},
    /* ---- 她知情以後那幾場 ---- */
    {key:'knows_talk',cat:'她知情以後',who:MR,kind:'pre',gate:'wrap',desc:'src/multirel3d.js 包 STORY.talkCharacter 的那一層：MREL.meetAction（kind talk／noodle）＝和她說話時演的發現、冷靜、挽回、結果',
      note:'這一次不演、不前進、不算次數（AA_503 第 14 節後補第 3 項：學姊一般見面〔meets、MREL.sisMet〕、語彤被打擾〔dist〕，擋下來沒演的不算），照常說話；流程沒有期限，下次她一個人時演、算；等了 7 天照演、照算（開頭旁白）'},
    {key:'knows_cafe',cat:'她知情以後',who:'heroine_02',kind:'pre',gate:'wrap',desc:'src/multirel3d.js：吧檯的芷若（MREL.FLOW.heroine_02.meet kind cafe）',
      note:'這一次不演（照常點餐）；冷靜期一天一次，下一次她一個人時演；等了 7 天照演'},
    {key:'knows_echo',cat:'她知情以後',who:['heroine_01','heroine_05'],kind:'pre',gate:'wrap',desc:'src/story3d.js S.twoHeartsEcho（1A-02 攤牌以後第一次說話那一句；只在 S.twoHeartsEchoDue 的時候問）',
      note:'這一次不說；只要還在交往，下次她一個人時說；等了 7 天照說'},
    {key:'ps_bterm',cat:'她知情以後',who:'classmate_peishan',kind:'pre',gate:'edit',due:btermDue,desc:'src/multirel3d.js STORY.PRE_TALK（沛珊結果 B：每學期第一週「這學期還可以嗎？我們講好的那些。」）',
      note:'有期限：那學期第一週；第一週裡她一個人時才問，第一週每次都有人＝第一週的最後一天照問（開頭一句旁白）'},
    /* ---- 問她自己還沒公開的事：子晴爸爸（Q8 一類）---- */
    {key:'zq_dad_pre',cat:'還沒公開',topic:'子晴爸爸',who:'heroine_04',kind:'pre',gate:'edit',desc:'src/multirel3d.js STORY.PRE_TALK（Q8 河堤沒遇到、說「改天講」：下一次見面她第一句「我爸那天說，做遊戲是在浪費時間。」）',
      note:'這一次不說；沒有期限（ZQ_DAD_SAID 沒記），下次她一個人時說；等了 7 天照說'},
    {key:'zq_dad_miss',cat:'還沒公開',topic:'子晴爸爸',who:'heroine_04',kind:'pre',gate:'wrap',msg:'zq_dad',due:missDue('zq_dad'),desc:'src/story3d.js S.neededMiss（zq_dad 沒回的那一句「我爸要來那則，你沒回。」）',
      note:'這一次不說（不記說過）；有期限：沒回那一句本來的期限（關閉後 14 天、Q8 以前），最後一天照說'},
    {key:'zq_dad_q8',cat:'還沒公開',topic:'子晴爸爸',who:'heroine_04',kind:'event',gate:'prereq',ev:'ev_ziqing_dad_visit',due:evDue,desc:'src/data/y2b_events.js Q8「爸爸來了」（公館，走到她那裡就演）',
      note:'有期限（大二下第 13～14 週平日 22～23 點）：有人＝等；第 14 週的週五照演；都沒碰到照原本的 6/4 22:00 私訊（y2b3d.js）'},
    {key:'zq_dad_q8b',cat:'還沒公開',topic:'子晴爸爸',who:'heroine_04',kind:'event',gate:'prereq',ev:'ev_ziqing_dad_stuck',due:'2027-10-08',desc:'src/data/r2y3a_events.js Q8b「爸爸卡關了」（10/6～10/8 公館，走到她旁邊才演）',
      note:'有期限（10/6～10/8 22:00～23:30）：有人＝等；10/8 照演；三天都沒演照原本的 10/8 23:00 三則（ZQ_Q8B_PHONE）'},
    /* ---- 沛珊重考（AA_281，她什麼都不說那段）---- */
    {key:'ps_retake_ev',cat:'還沒公開',topic:'沛珊重考',who:'classmate_peishan',kind:'event',gate:'prereq',ev:'ev_peishan_decision',due:evDue,desc:'src/data/events.js P3「我要重考」（交往中；她走過來）',
      note:'有期限（大二上第 5 週平日 12～13 點）：有人＝等；第 5 週的週五照演（現在的圈子資料沒有和這段重疊的列，tests/company_priv_unit.js 第 5 段會查）'},
    {key:'ps_retake_lad',cat:'還沒公開',topic:'沛珊重考',who:'classmate_peishan',kind:'ladder',gate:'hold',steps:{'P3-L3':['linesIf',0],'P3-L4':['linesIf',0],'P3-L6':['linesIf',0],'P3-L8':['linesIf',0]},
      desc:'閒聊階梯大二上（P3 以後的 linesIf：旁聽教育系、跟爸媽說了、重考的那一份、下學期會休學）',note:'這一層這一次不播、不前進；下次她一個人時播；沒有期限：等了 7 天照播（階梯照原本：學期結束還沒播到的就沒有）'},
    {key:'ps_plan_miss',cat:'還沒公開',topic:'沛珊重考',who:'classmate_peishan',kind:'pre',gate:'wrap',msg:'ps_plan',due:missDue('ps_plan'),desc:'src/story3d.js S.neededMiss（ps_plan 沒回的那一句「重考計畫那則你沒回。」）',
      note:'這一次不說（不記說過）；有期限：本來的期限，最後一天照說'},
    /* ---- 芷若交換申請（5/11 錄取以前；旁邊是子晴不算，第 12 項）---- */
    {key:'zr_exch_ev',cat:'還沒公開',topic:'芷若交換申請',who:'heroine_02',kind:'event',gate:'prereq',ev:'ev_zhiruo_secret',until:'2027-05-11',due:evDue,except:KNOW.zrExch,desc:'src/data/events.js Z4「十點的電話」（溫州街，和她說話觸發）',
      note:'有期限（大一下第 11～15 週週六 14～18 點）：有人＝這一次照常說話；第 15 週的週六照演；旁邊只有子晴＝照演'},
    {key:'zr_exch_applied',cat:'還沒公開',topic:'芷若交換申請',who:'heroine_02',kind:'event',gate:'prereq',ev:'ev_zhiruo_applied',until:'2027-05-11',due:evDue,except:KNOW.zrExch,desc:'src/data/events.js Z7「她交件了」（Café，看到你就說）',
      note:'有期限（2026-12-11 以後到大二上結束，11～22 點，Café）：有人（吧檯旁邊的同事）＝等；大二上最後一天照演；都沒演照原本寒假第一天的私訊、Z7b（events.js）'},
    {key:'zr_exch_ask',cat:'還沒公開',topic:'芷若交換申請',who:'heroine_02',kind:'evChoice',gate:'evChoice',ev:'ev_zhiruo_bell',choice:'「妳的交換申請交了嗎？」',until:'2027-05-11',except:KNOW.zrExch,desc:'src/data/events.js 傅鐘旁邊的那一個選項',
      note:'這一次選項不出（其他兩個照常）；沒有期限：等了 7 天照出（選了先一句旁白）'},
    {key:'zr_exch_lad',cat:'還沒公開',topic:'芷若交換申請',who:'heroine_02',kind:'ladder',gate:'hold',until:'2027-05-11',except:KNOW.zrExch,steps:{'Z2-L6':['extraIf',0],'Z2-L8':['linesIf',0],'Z3-L6':['linesIf',0],'Z4-L4':['linesIf',0]},
      desc:'閒聊階梯（知道她申請的玩家才換進來的那一版：交換的申請也是一直拖、還沒交、送出去以後、英國那邊的信）',note:'這一層這一次不播、不前進；下次她一個人時播；等了 7 天照播'},
    /* ---- 語彤媽媽回診（旁邊是阿姨不算，第 12 項）---- */
    {key:'yt_mom_lad',cat:'還沒公開',topic:'語彤媽媽回診',who:'heroine_03',kind:'ladder',gate:'hold',except:KNOW.ytMom,steps:{'Y-L7':null,'Y7-L8':null},desc:'閒聊階梯 Y-L7（大一上「我媽每個月要回診一次」）、Y7-L8（大四上「期末考完，我要陪我媽去回診」）',
      note:'這一層這一次不播、不前進；下次她一個人時播；等了 7 天照播；旁邊只有阿姨＝照播'},
    {key:'yt_mom_ask',cat:'還沒公開',topic:'語彤媽媽回診',who:'heroine_03',kind:'ladderChoice',gate:'choiceIf',step:'Y4-L6',choice:'「妳媽媽身體還好嗎？」',except:KNOW.ytMom,desc:'閒聊階梯 Y4-L6 的第二個選項',
      note:'這一次只出第一個選項；等了 7 天照出（選了先一句旁白）；旁邊只有阿姨＝照出'},
    /* ---- 第三輪（AA_503 第 14 節）：第 1 項 芷若×子晴交往中、其中一人自己告訴祐廷（旁邊是對方本人不算）---- */
    {key:'zz_told_zr',cat:'還沒公開',topic:'芷若×子晴',who:'heroine_02',kind:'pre',gate:'wrap',ev:'ev_zz_told_zr',except:['heroine_04'],desc:'src/zrzq3d.js ZRZQ.preTalk（AA_385 第 4 節：她們交往中、祐廷還不知道，芷若自己告訴他；說話前接演，吧檯上班時也一樣）',
      note:'這一次不演（照常說話、點餐）；旁邊只有子晴＝照演；沒有期限：等了 7 天照演'},
    {key:'zz_told_zq',cat:'還沒公開',topic:'芷若×子晴',who:'heroine_04',kind:'pre',gate:'wrap',ev:'ev_zz_told_zq',except:['heroine_02'],desc:'src/zrzq3d.js ZRZQ.preTalk（同上，子晴自己告訴他）',
      note:'這一次不演（照常說話）；旁邊只有芷若＝照演；等了 7 天照演'},
    {key:'zz_f3_told',cat:'還沒公開',topic:'芷若×子晴',who:'heroine_02',kind:'event',gate:'prereq',ev:'ev_zz_f3_told',due:f3Due,except:['heroine_04'],desc:'src/data/zrzq_events.js「很老的那部」（F3 婉拒以後第一次在 Café 找她說話：「我跟子晴在一起。」）',
      note:'有人＝這一次照常說話（點餐）；旁邊只有子晴＝照演；臺灣沒有期限（等了 7 天照演），日本路線（回國以後 8/5～9/1）9/1 照演'},
    /* ---- 第 2 項 子晴、芷若分開以後第一次說話 ---- */
    {key:'zz_after',cat:'感情',topic:'子晴、芷若分開以後',who:['heroine_04','heroine_02'],kind:'pre',gate:'edit',desc:'src/multirel3d.js S.zzPreTalk（子晴第一次「嗨。」、之後各一句、可以重新開始那一天她先說；sub＝first／chat／restart）、吧檯的芷若第一句「你要點什麼？」（ZZ_AFTER.first）',
      note:'這一次不演（照常說話、點餐）；沒有期限：等了 7 天照演'},
    /* ---- 第 3 項 學姊說要去美國交換（同芷若的交換申請；期限 11/9）---- */
    {key:'sis_us_told',cat:'還沒公開',topic:'學姊美國交換',who:'heroine_05',kind:'pre',gate:'wrap',ev:'ev_sis_us_told',due:'2027-11-09',desc:'src/sis_y2y3_3d.js SISY23.preTalkEv（大三上 11/1～11/9 晚上在法圖、Café 第一次找她說話，說話前接演）',
      note:'有人＝這一次照常說話；有期限 11/9：那天照演；都沒演照原本 11/11 私訊、11/12 總圖門口的台階'},
    /* ---- 第 4 項 沛珊說和柏翰分開了 ---- */
    {key:'ps_split',cat:'感情',topic:'沛珊和柏翰',who:'classmate_peishan',kind:'event',gate:'prereq',ev:'ev_peishan_split',due:evDue,desc:'src/data/events.js「我們上週分開了」（大二上第 6 週平日 12:10～12:40 霖澤館，走到她旁邊就演）',
      note:'有人＝等；有期限：第 6 週的週五照演'},
    /* ---- 第 5 項 以安「明軒的事……」---- */
    {key:'an_mx',cat:'感情',topic:'明軒的事',who:'heroine_01',kind:'opt',gate:'priv',due:()=>DK(anEnd()),desc:'src/y2r2_3d.js STORY.TALK_OPTS 以安「明軒的事……」（聽說以後到 9/5、一次；privKey an_mx）',
      note:'選項不出；有期限 9/5：那天照出（選了先一句旁白）'},
    /* ---- 第 10 項 前任第一次見面：講到祐廷現在的人的兩句 ---- */
    {key:'ex_an_other',cat:'講到祐廷現在的人',topic:'前任第一次見面',who:'heroine_01',kind:'pre',gate:'wrap',flag:'V6EX_AN_OTHER',desc:'src/v6ex3d.js V6EX.preLine anOther「理由我懂。不用解釋。」（祐廷之後和別人交往，以安只說一次）',
      note:'這一次不說；沒有期限：等了 7 天照說。其他第一次見面的招呼（zqFirst、zrFirst、sisLaw／sisRA、kxFirst）不擋'},
    {key:'ex_yt_an',cat:'講到祐廷現在的人',topic:'前任第一次見面',who:'heroine_03',kind:'pre',gate:'wrap',flag:'V6EX_YT_AN',desc:'src/v6ex3d.js V6EX.preLine ytAfterAn「嗯。……她會讓你說理由的。」（之後和以安交往，語彤只說一次）',
      note:'這一次不說；等了 7 天照說'},
    /* ---- 3D 說話裡沒有入口的（寫明在哪裡；之後加入口就用這個 key 問 PRIVTALK.ok）---- */
    {key:'sis_oral',cat:'還沒公開',topic:'學姊口試結果',who:'heroine_05',kind:'none',gate:'none',from:'2029-05-29',until:'2029-05-30',
      desc:'沒有 3D 入口：結果在 5/29 16:00～18:00 研究室走廊的出遊（y34b3d.js M9，2D）、家族群組、電話（ev_sis_defense_call）；她 5/29 08～18 點不在 3D（characters.js）'},
    {key:'dating',cat:'交往中才有的互動',who:'*',kind:'none',gate:'none',
      desc:'3D 說話裡交往中才有的都在上面各筆：「（下次見面，自己跟她講…的事）」（tell_later）、知情以後那幾場（knows_talk、knows_cafe、knows_echo、ps_bterm）、交往中的可昕「約會：選地點、日期、時間」（invite）；閒聊、沒回訊息那一句的「交往中版本」＝第 7 項（S.DATING_QUIET：旁邊有人說一般版）'},
    {key:'confess',cat:'告白',who:'*',kind:'none',gate:'none',desc:'沒有 3D 入口：告白在學期末的飯回家的路上（termend3d.js）、正式校外約會的結尾（date3d.js，現在只有學姊重新開始那一次）、特別場景（出遊），都是 2D'},
    {key:'heart',cat:'心意邀約',who:'*',kind:'none',gate:'none',desc:'沒有 3D 入口：心意邀約是手機（termend3d.js，時段第一天 20:30 起），飯和回家的路是出遊（2D）'},
    {key:'apart',cat:'分開談話（AA_346）',who:'*',kind:'none',gate:'none',desc:'沒有 3D 入口：選一個人以後的分開談話是出遊（r2y4b3d.js OUT.plan，2D，旁白「只剩你們兩個」）和電話'}];
  S.byKey={}; for(const e of S.LIST) S.byKey[e.key]=e;
  /* 第一輪問 AA 的 12 項（原本的 S.ASK_AA）：AA 2026-10-28 定（S.REF）。decided＝AA 定的、impl＝怎麼做 */
  S.DECIDED=[
    {n:1,desc:'芷若×子晴交往中、祐廷還不知道：其中一人自己告訴他（ZRZQ.preTalk；ev_zz_f3_told「我跟子晴在一起。」）',decided:'擋。旁邊是對方本人（芷若或子晴）不算，照演。',impl:'清單 zz_told_zr、zz_told_zq、zz_f3_told（except＝對方本人）'},
    {n:2,desc:'子晴、芷若分開以後第一次說話（multirel3d.js zzPreTalk、ZZ_AFTER）',decided:'擋。',impl:'清單 zz_after（multirel3d.js S.zzPreDue 算出這一次要演的才問；吧檯的芷若第一句也是）'},
    {n:3,desc:'學姊說要去美國交換（sis_y2y3_3d.js ev_sis_us_told，大三上 11/1～11/9 說話前接演）',decided:'擋，同芷若的交換申請；期限 11/9。',impl:'清單 sis_us_told（due 2027-11-09）'},
    {n:4,desc:'沛珊說和柏翰分開了（events.js ev_peishan_split，大二上第 6 週中午霖澤館）',decided:'擋。',impl:'清單 ps_split（期限＝第 6 週的週五）'},
    {n:5,desc:'以安「明軒的事……」（y2r2_3d.js TALK_OPTS；她回「他問了，我答了。我們還是朋友。」）',decided:'擋。',impl:'清單 an_mx（選項標 priv、privKey an_mx；期限 9/5）'},
    {n:6,desc:'語彤麵店租約「幫她」三個選項（y2r2_3d.js TALK_OPTS），阿姨就在旁邊',decided:'不擋。租約是阿姨的事，阿姨就是當事人。',impl:'不改（那三個選項沒有標 priv）'},
    {n:7,desc:'閒聊階梯、沒回訊息那一句的「交往中版本」（linesIf／extraIf 的 dating_、needed_msgs.js 的 missDating）',decided:'當面的：旁邊有人時改說一般版，沒有一般版的照演。手機（missDating）不受影響。',
      impl:'STORY.DATING_QUIET（S.dateVar）：閒聊階梯 linesIf／extraIf、招呼（greet.when）、選項的回覆（LADDER_REPLY_IF）裡條件要 dating_ 的那一套，和見面時沒回訊息那一句的 missDating（story3d.js S.neededMiss，遊戲裡只在當面說），旁邊有她的人＝說一般版（沒有一般版的照說）；不擋、不等、不記'},
    {n:8,desc:'子晴講爸爸的閒聊階梯（Q-L6、Q2-L1、Q2-L8、Q3-L1、Q3-L6、Q4-L6、Q5-L3、Q5-L8、Q6-L1…；不是 Q8 那一類）',decided:'不擋。她自己隨口講的。',impl:'不改'},
    {n:9,desc:'子晴 Q7「實驗室的信」（ev_ziqing_lab_letter，吉他社）、「那天」（ev_ziqing_dad_sorry，吉他社社課）',decided:'不擋，開頭加一句旁白，把場景移到走廊：（她把吉他放下，朝門外偏了一下頭。你們走到社辦外面的走廊。）',impl:'S.SCENE_LEAD（兩場對話最前面加這一句旁白，不管旁邊有沒有人）'},
    {n:10,desc:'前任第一次見面那一句（v6ex3d.js preLine）',decided:'講到祐廷現在的人的兩句擋：anOther「理由我懂。不用解釋。」、ytAfterAn「嗯。……她會讓你說理由的。」；其他第一次見面的招呼不擋：zqFirst、zrFirst、sisLaw／sisRA、kxFirst。',impl:'清單 ex_an_other、ex_yt_an'},
    {n:11,desc:'到場就演的知情場景（MREL.dueAuto）、裂縫談話（cracktalk3d.js：語彤「人到三樓就演」）',decided:'不改。地點本來就排在有阿姨、同事的地方。',impl:'不改'},
    {n:12,desc:'旁邊的人本來就知道的（語彤和阿姨談媽媽、芷若和子晴談交換申請）',decided:'例外，照出。只限這幾組：語彤和阿姨（媽媽的事）、芷若和子晴（交換申請）、第 1 項的對方本人。',
      impl:'清單的 except：yt_mom_lad、yt_mom_ask＝阿姨（hc_ayi）；zr_exch_ev、zr_exch_applied、zr_exch_ask、zr_exch_lad＝子晴；zz_told_*、zz_f3_told＝對方本人（STORY.COMPANY 回傳旁邊那幾個人的 id：HCIRCLE.withNow）'}];
  /* 第 14 節後補（AA 2026-10-28 09:03 回 LAWWW-C 問的 4 點，企劃線 0e46fdc7e）：1、2 照現在；3、4 改 */
  S.REF2='AA_503 第 14 節後補（企劃線 claude/magical-albattani-bk7b4n 0e46fdc7e，AA-C 2026-10-28）';
  S.LATER=[
    {n:1,desc:'第 7 項：交往中版本的「沒回訊息那一句」（missDating）只在當面說',decided:'旁邊有人時改說一般版，照 LAWWW 現在的做法；「手機不受影響」那半句可以忽略。',impl:'不改（STORY.DATING_QUIET）'},
    {n:2,desc:'第 2 項：芷若在 Café 櫃台的第一句「你要點什麼？」',decided:'一起擋，照 LAWWW；旁邊有人，這次照常點餐，不演。',impl:'不改（清單 zz_after，sub first）'},
    {n:3,desc:'知情場景的次數（學姊一般見面、語彤被打擾）',decided:'擋下來沒演的不算。只有真的演出來的才算一次。',
      impl:'清單 knows_talk、knows_cafe：擋下來＝MREL 算的時候動到的她那一段流程（MREL.st）、學姊一般見面的紀錄（MREL.sm）還原（S.mrelSnap／S.mrelBack）；只有次數的那一次也算知情的見面（旁邊有人＝擋、記等待，等了 7 天照算＋開頭旁白）；只動到學姊一般見面那一筆＝旁邊有人不記'},
    {n:4,desc:'選項出現了玩家沒選，下次又被擋',decided:'不重新算。7 天從這一項第一次被擋那天起算，到第 8 天照演。',impl:'S.ok 放行時不清等待（選項出來了不算演）；只有 S.lead（選了那一個、那一段開始演）才清'}];
  /* 第 9 項：不擋，對話最前面加一句旁白（載入時接上，不管旁邊有沒有人）*/
  S.SCENE_LEAD=[{ev:'ev_ziqing_lab_letter',text:'（她把吉他放下，朝門外偏了一下頭。你們走到社辦外面的走廊。）'},{ev:'ev_ziqing_dad_sorry',text:'（她把吉他放下，朝門外偏了一下頭。你們走到社辦外面的走廊。）'}];

  /* ---------- 等待的紀錄（存檔 G.flags.PRIVWAIT）---------- */
  S.held=[]; S.passed=[]; S.narrated=[];
  const note=(L,o)=>{ L.push(o); if(L.length>40) L.splice(0,L.length-40); };
  S.wk=(key,id,sub)=>key+'|'+id+(sub?'|'+sub:'');
  S.rec=function(G){ const F=G.flags||(G.flags={}); let W=F.PRIVWAIT; if(!W||typeof W!=='object'||Array.isArray(W)) W=F.PRIVWAIT={}; return W; };
  S.waitOf=(G,key,id,sub)=>{ const W=G&&G.flags&&G.flags.PRIVWAIT; const v=W&&W[S.wk(key,id,sub)]; return typeof v==='number'?v:null; };
  S.clear=function(G,key,id,sub){ const W=G&&G.flags&&G.flags.PRIVWAIT; if(W&&typeof W==='object') delete W[S.wk(key,id,sub)]; };
  const prune=(W,G)=>{ for(const k in W){ if(typeof W[k]!=='number'||G.day-W[k]>400) delete W[k]; } };   /* 太舊的（沒演到就過了期限的）拿掉 */
  /* 那一段算不算私密（清單上的 from／until）*/
  S.privAt=function(G,e){ if(!e) return true; if(e.until){ const u=DK(e.until); if(u!=null&&G.day>=u) return false; } if(e.from){ const f=DK(e.from); if(f!=null&&G.day<f) return false; } return true; };
  /* 旁邊有她的人（except 的人不算）*/
  S.crowd=function(G,id,e,GM){ if(typeof STORY==='undefined') return false; const ex=(e&&e.except)||null; if(STORY.crowdNow) return !!STORY.crowdNow(G,id,null,GM,ex); return !!(STORY.privNow&&!STORY.privNow(G,id,null,GM)); };
  /* 期限（第幾天；沒有＝null）*/
  S.evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(q=>q&&q.id===id)||null:null;
  S._evDue={};
  S.evDue=function(ev){ if(!ev||!ev.term||typeof CALENDAR==='undefined'||!CALENDAR.termDays||!CALENDAR.termOf) return null; if(ev.id in S._evDue) return S._evDue[ev.id]; let last=null;
    for(const t of [].concat(ev.term)){ const r=CALENDAR.termDays(t); if(!r) continue; for(let d=r.from;d<=r.to;d++){ const T=CALENDAR.termOf(d); if(!T||T.id!==t) continue; if(ev.weeks&&!ev.weeks.includes(T.week)) continue; if(ev.weekday&&!ev.weekday.includes(CALENDAR.dateOf(d).wd%7)) continue; if(last==null||d>last) last=d; } }
    return (S._evDue[ev.id]=last); };
  S.missDue=function(G,mid,who){ if(typeof STORY==='undefined'||!STORY.neededRec||!G||!G.needed) return null; const N=STORY.neededRec(G);
    for(let i=N.batches.length-1;i>=0;i--){ const b=N.batches[i]; if(!b||!(b.ids||[]).some(x=>x[0]===mid&&x[1]===who)) continue; const close=b.closedAt!=null?b.closedAt:(b.d+7)*24+21; return Math.ceil((close+14*24)/24)-1; }   /* neededMissLine：now＜close＋14 天 */
    return null; };
  S.dueOf=function(G,e,id){ const d=e&&e.due; if(d==null) return null; let v=null; try{ v=typeof d==='function'?d(G,id,e):(d===evDue?S.evDue(S.evOf(e.ev)):DK(d)); }catch(err){ v=null; } return typeof v==='number'?v:null; };

  /* ---------- 共用：這一筆現在可以嗎 ---------- */
  S.ok=function(G,id,key,GM,sub){ const e=S.byKey[key]; if(!e) console.warn('PRIVTALK 清單沒有',key);
    if(!G||!id) return true;
    if(e&&!S.privAt(G,e)) return true;   /* from／until 以外不算私密 */
    if(!S.crowd(G,id,e,GM)) return true;   /* 她一個人（或旁邊只有本來就知道的人）：照常（等待不清：選項出來了玩家沒選＝不算演，後補第 4 項）*/
    const W=S.rec(G), k=S.wk(key,id,sub); if(typeof W[k]!=='number'){ W[k]=G.day; prune(W,G); }
    const due=e?S.dueOf(G,e,id):null, pass=due!=null?G.day>=due:G.day-W[k]>=S.WAIT;
    if(pass){ note(S.passed,{key,id,sub:sub||null,day:G.day,from:W[k],due}); return true; }   /* 等了 7 天／到期那天：照演（開頭的旁白、清掉等待都在 S.lead＝真的演了才清；選項出來了沒選、下次又被擋＝照舊從第一天算，後補第 4 項）*/
    note(S.held,{key,id,sub:sub||null,day:G.day,h:G.hour,from:W[k],due}); return false; };
  /* 那一段開始演：旁邊還有她的人＝先一句旁白；清掉等待（下一次再擋從頭算）*/
  S.lead=async function(GM,key,id,sub){ const G=GM&&GM.G; if(!G||!id) return false; const e=S.byKey[key]; S.clear(G,key,id,sub);
    if(!e||!S.privAt(G,e)||!S.crowd(G,id,e,GM)) return false;
    note(S.narrated,{key,id,sub:sub||null,day:G.day}); await GM.say(null,S.NARR); return true; };
  /* 包一層 GM：第一次說話（或選項）以前先 S.lead（get()＝現在要 lead 的那一筆 {key,id,sub}；null＝不用）*/
  S.leadGM=function(GM,get){ if(!GM) return GM; let done=false; const P=Object.create(GM);
    const go=async()=>{ if(done) return; done=true; const q=get&&get(); if(q) await S.lead(GM,q.key,q.id,q.sub); };
    P.say=async function(){ await go(); return GM.say.apply(GM,arguments); }; P.choose=async function(){ await go(); return GM.choose.apply(GM,arguments); }; return P; };
  /* 回傳的 action（{run}）包一層：run 之前先 S.lead */
  S.leadRun=function(a,key,id){ if(!a||typeof a.run!=='function') return a; const r0=a.run; a.run=async function(GM2){ await S.lead(GM2,key,id); return r0.apply(this,arguments); }; return a; };

  /* ---------- 第 7 項：交往中的那一版，旁邊有人說一般版（STORY.DATING_QUIET）---------- */
  S.datingCond=x=>{ const fl=[].concat((x&&x.flags)||[],(x&&x.if&&x.if.flags)||[]); return fl.some(f=>/^dating_/.test(String(f))); };   /* 條件要「和誰交往中」的那一套（notFlags 的不算）*/
  S.dateVar=function(x,kind,ctx){ if(kind==='miss') return true;   /* 沒回訊息那一句：story3d.js 只在有一般版的時候問 */
    if(!S.datingCond(x)) return false;
    if(kind==='linesIf') return !!(ctx&&Array.isArray(ctx.lines)&&ctx.lines.length);   /* 一般版＝那一層原本的 lines；沒有＝照演 */
    if(kind==='greet') return !!(ctx&&(((ctx.base||[]).length>0)||(ctx.when||[]).some(w=>w!==x&&!S.datingCond(w))));
    if(kind==='reply') return !!(ctx&&ctx.reply!=null);
    return true; };   /* extraIf：一般版＝不多說那幾句 */
  S.wireDating=function(){ if(typeof STORY==='undefined'||!Array.isArray(STORY.DATING_QUIET)) return false; if(STORY._privDate) return true;
    STORY.DATING_QUIET.push((G,x,id,ctx,kind)=>S.dateVar(x,kind,ctx)&&S.crowd(G,id,null)); STORY._privDate=true; return true; };

  /* ---------- 閒聊階梯 ---------- */
  S.ladStep=function(G,who,sid){ if(typeof STORY==='undefined'||!STORY.ladData) return null; const D=STORY.ladData(G,who); return (D&&D.L&&(D.L.steps||[]).find(s=>s.id===sid))||null; };
  /* 那一版私密的句子（linesIf／extraIf 第幾套；和原本 lines 一樣的不算）*/
  S.privText=function(st,v){ if(!st||!v) return []; const x=((st[v[0]])||[])[v[1]]; if(!x) return []; const base=new Set(st.lines||[]); return (x.lines||[]).filter(t=>!base.has(t)); };
  /* 這一次會說的句子裡有沒有私密那一版（v＝null：整層都是私密的）*/
  S.ladPriv=function(G,who,sid,v){ if(!v) return true; const st=S.ladStep(G,who,sid); if(!st||!STORY.ladLines) return false; const P=S.privText(st,v); if(!P.length) return false;
    return STORY.ladLines(st,G,who).some(l=>P.includes(typeof l==='string'?l:(l&&l.t))); };
  S.HOLD_BY={}; S.CHOICE_BY={};
  S.wireLadder=function(e){ if(typeof STORY==='undefined'||!STORY.LADDER_HOLD) return false; let n=0;
    for(const sid in e.steps){ const v=e.steps[sid], h0=STORY.LADDER_HOLD[sid]; S.HOLD_BY[sid]=e;
      STORY.LADDER_HOLD[sid]=function(G){ if(h0&&!h0.apply(this,arguments)) return false; if(!S.ladPriv(G,e.who,sid,v)) return true; return S.ok(G,e.who,e.key,null,sid); }; n++; }
    return n>0&&S.wireLadPlay(); };
  S.wireLadChoice=function(e){ if(typeof STORY==='undefined'||!STORY.LADDER_CHOICE_IF) return false; const R=STORY.LADDER_CHOICE_IF[e.step]||(STORY.LADDER_CHOICE_IF[e.step]={}); const c0=R[e.choice]||{}, f0=c0.custom;
    R[e.choice]=Object.assign({},c0,{custom:function(G,GM){ return (typeof f0!=='function'||f0.apply(this,arguments))&&S.ok(G,e.who,e.key,GM); }}); S.CHOICE_BY[e.step]=e; return S.wireLadPlay(); };
  /* STORY.ladPlay 包一層（一次）：擋下來的那一層播之前、私密的那個選項選了以後 S.lead */
  S.wireLadPlay=function(){ if(typeof STORY==='undefined'||!STORY.ladPlay) return false; if(STORY._privLad) return true; const lp=STORY.ladPlay;
    STORY.ladPlay=async function(GM,who,id,st){ const G=GM&&GM.G; let P=GM;
      if(G&&st&&st.id){ const h=S.HOLD_BY[st.id]; if(h&&h.who===id&&S.ladPriv(G,id,st.id,h.steps[st.id])) await S.lead(GM,h.key,id,st.id);
        const c=S.CHOICE_BY[st.id]; if(c&&c.who===id){ P=Object.create(GM); P.choose=async function(o){ const k=await GM.choose.apply(GM,arguments); const q=Array.isArray(o)?(o[k]||o[0]):null; if(q&&q.t===c.choice) await S.lead(GM,c.key,id); return k; }; } }
      return lp.call(this,P,who,id,st); };
    STORY._privLad=true; return true; };

  /* ---------- 事件 ---------- */
  /* 那一場對話的第一行接一個 call：開始演＝S.lead（旁邊還有人＝先一句旁白）*/
  S.wireLead=function(e){ const ev=S.evOf(e.ev); if(!ev||!Array.isArray(ev.dialogue)) return false; if(ev._privLead) return ev._privLead===e.key;
    ev.dialogue.unshift({call:async(G,GM)=>{ await S.lead(GM,e.key,e.who); }}); ev._privLead=e.key; return true; };
  S.wireEvent=function(e){ const ev=S.evOf(e.ev); if(!ev) return false; const p=ev.prereq||(ev.prereq={}), f0=p.custom;
    p.custom=function(G,GM){ return (typeof f0!=='function'||f0.apply(this,arguments))&&S.ok(G,e.who,e.key,GM); }; ev.privKey=e.key; return S.wireLead(e); };
  S.wireEvChoice=function(e){ const ev=S.evOf(e.ev); if(!ev) return false; const D=ev.dialogue||[]; for(const l of D){ const ch=l&&Array.isArray(l.choice)&&l.choice.find(c=>c&&c.text===e.choice); if(!ch) continue;
      const c=ch.if||(ch.if={}), f0=c.custom; c.custom=function(G,GM){ return (typeof f0!=='function'||f0.apply(this,arguments))&&S.ok(G,e.who,e.key,GM); };
      const i=ch.goto!=null?D.findIndex(q=>q&&q.label===ch.goto):-1; if(i<0) return false;   /* 選了那一個：跳去的 label 後面接 call＝S.lead */
      if(!(D[i+1]&&D[i+1]._privKey===e.key)) D.splice(i+1,0,{call:async(G,GM)=>{ await S.lead(GM,e.key,e.who); },_privKey:e.key}); return true; }
    return false; };

  /* ---------- 知情那幾場的次數（後補第 3 項：擋下來沒演的不算）----------
     S.mrelSnap：MREL 算以前，她那一段流程（G.flags.MREL.st[她]：學姊 meets、語彤 dist／distant、結果 C、可昕的 w…）和學姊一般見面的紀錄（.sm[學姊]，sisMet）；只讀，不建 MREL。
     S.mrelBack：擋下來＝還原成算以前（st 照原本那個物件改回去，別的地方拿著的參考照樣有效；本來沒有的拿掉）*/
  const MSIS='heroine_05';
  const mraw=G=>{ const M=G&&G.flags&&G.flags.MREL; return M&&typeof M==='object'?M:null; };
  const js=v=>v===undefined||v===null?null:JSON.stringify(v);
  S.mrelSnap=function(G,x){ const M=mraw(G); return {st:js(M&&M.st&&M.st[x]),sm:x===MSIS?js(M&&M.sm&&M.sm[x]):undefined,smObj:!!(M&&M.sm)}; };
  S.mrelMoved=(G,x,s)=>{ const M=mraw(G); return js(M&&M.st&&M.st[x])!==s.st; };   /* 她那一段流程（次數、階段）動了 */
  S.mrelMet=(G,x,s)=>{ if(s.sm===undefined) return false; const M=mraw(G); return js(M&&M.sm&&M.sm[x])!==s.sm; };   /* 學姊一般見面那一筆記了 */
  S.mrelBack=function(G,x,s){ const M=mraw(G); if(!M) return;
    if(s.st==null){ if(M.st) delete M.st[x]; } else { const cur=M.st&&M.st[x], o=JSON.parse(s.st); if(cur&&typeof cur==='object'){ for(const k of Object.keys(cur)) delete cur[k]; Object.assign(cur,o); } else (M.st||(M.st={}))[x]=o; }
    if(s.sm!==undefined){ if(s.sm==null){ if(M.sm){ delete M.sm[x]; if(!s.smObj&&!Object.keys(M.sm).length) delete M.sm; } } else (M.sm||(M.sm={}))[x]=JSON.parse(s.sm); } };

  /* ---------- 包一層的（gate:'wrap'）---------- */
  S.wireWrap=function(e){
    if(e.key==='knows_talk'){ if(typeof MREL==='undefined'||!MREL.meetAction) return false; if(MREL._privMeet) return true; const m0=MREL.meetAction;
      MREL.meetAction=function(G,x,kind){ if(!G||!(kind==='talk'||kind==='noodle')) return m0.apply(this,arguments);
        const s=S.mrelSnap(G,x), a=m0.apply(this,arguments), moved=S.mrelMoved(G,x,s);   /* 先算出這一次要演的、要算的次數：有才問旁邊有沒有人（擋下來的那一天才記）*/
        if(!a&&!moved){ if(S.mrelMet(G,x,s)&&S.crowd(G,x,e)) S.mrelBack(G,x,s); return a; }   /* 只動到學姊一般見面那一筆（她沒有知情的流程要動）：旁邊有人＝不記；不擋、不記等待（後補第 3 項）*/
        if(!S.ok(G,x,e.key)){ S.mrelBack(G,x,s); return null; }   /* 擋下來：不演、不算次數（學姊一般見面、語彤被打擾…都還原，後補第 3 項）*/
        if(a) return S.leadRun(a,e.key,x);
        if(S.crowd(G,x,e)) return {abort:false,run:async GM2=>{ await S.lead(GM2,e.key,x); }};   /* 只有次數、等了 7 天照算：開頭旁白，接著照常說話 */
        S.clear(G,e.key,x); return null; };   /* 只有次數、她一個人：照算（等待清掉）*/
      MREL._privMeet=true; return true; }
    if(e.key==='knows_cafe'){ const F=typeof MREL!=='undefined'&&MREL.FLOW&&MREL.FLOW.heroine_02; if(!F||!F.meet) return false; if(F._priv) return true; const f0=F.meet;
      F.meet=function(G,st,kind){ if(kind!=='cafe'||!G) return f0.apply(this,arguments); const s=S.mrelSnap(G,'heroine_02'), a=f0.apply(this,arguments); if(!a) return a;
        if(!S.ok(G,'heroine_02',e.key)){ S.mrelBack(G,'heroine_02',s); return null; }   /* 擋下來：不演、她的流程不動（後補第 3 項）*/
        return S.leadRun(a,e.key,'heroine_02'); }; F._priv=true; return true; }
    if(e.key==='knows_echo'){ if(typeof STORY==='undefined'||!STORY.twoHeartsEcho) return false; if(STORY._privEcho) return true; const f0=STORY.twoHeartsEcho;
      STORY.twoHeartsEcho=async function(GM,id){ const G=GM&&GM.G; if(G){ const due=STORY.twoHeartsEchoDue?STORY.twoHeartsEchoDue(G,id):true; if(due){ if(!S.ok(G,id,e.key,GM)) return false; if(STORY.twoHeartsEchoDue) await S.lead(GM,e.key,id); } } return f0.apply(this,arguments); }; STORY._privEcho=true; return true; }
    if(e.msg){ if(typeof STORY==='undefined'||!STORY.neededMissFor) return false; S.MISS=S.MISS||{}; S.MISS[e.msg]=e;
      if(!STORY._privMiss){ const f0=STORY.neededMissFor; STORY.neededMissFor=function(G,m,who){ const r=f0.apply(this,arguments); const q=r&&m&&S.MISS[m.id]; if(q){ if(!S.ok(G,who,q.key)) return null; S._miss={key:q.key,id:who}; } return r; };   /* null＝這一次不說、不記說過（neededMissLine 照原本往下找）*/
        const n0=STORY.neededMiss; if(n0) STORY.neededMiss=async function(GM,who,id){ S._miss=null; try{ return await n0.call(this,S.leadGM(GM,()=>S._miss&&S._miss.id===id?S._miss:null),who,id); } finally{ S._miss=null; } };
        STORY._privMiss=true; }
      return true; }
    if(e.key==='zz_told_zr'||e.key==='zz_told_zq'){ if(typeof ZRZQ==='undefined'||!ZRZQ.preTalk||!ZRZQ.toldDue) return false; S.TOLD=S.TOLD||{}; S.TOLD[e.who]=e; if(!S.wireLead(e)) return false; if(ZRZQ._privTold) return true; const p0=ZRZQ.preTalk;
      ZRZQ.preTalk=async function(GM,id){ const G=GM&&GM.G, q=S.TOLD[id]; if(G&&q&&ZRZQ.toldDue(G,id)&&!S.ok(G,id,q.key,GM)) return false; return p0.apply(this,arguments); };   /* 開頭的旁白：那一場第一行的 call（S.wireLead）*/
      ZRZQ._privTold=true; return true; }
    if(e.key==='sis_us_told'){ if(typeof SISY23==='undefined'||!SISY23.preTalkEv) return false; if(!S.wireLead(e)) return false; if(SISY23._privUs) return true; const p0=SISY23.preTalkEv;
      SISY23.preTalkEv=function(G){ const r=p0.apply(this,arguments); if(r===e.ev&&G&&!S.ok(G,e.who,e.key)) return null; return r; }; SISY23._privUs=true; return true; }
    if(e.flag){ if(typeof V6EX==='undefined'||!V6EX.preLine||!V6EX.preTalk) return false; S.EX=S.EX||{}; S.EX[e.flag]=e; if(V6EX._priv) return true; const p0=V6EX.preLine, t0=V6EX.preTalk;
      V6EX.preLine=function(G,id){ const p=p0.apply(this,arguments); const q=p&&S.EX[p[0]]; if(q&&G){ if(!S.ok(G,id,q.key)) return null; S._ex={key:q.key,id}; } return p; };
      V6EX.preTalk=async function(GM,who,id){ S._ex=null; try{ return await t0.call(this,S.leadGM(GM,()=>S._ex&&S._ex.id===id?S._ex:null),who,id); } finally{ S._ex=null; } };
      V6EX._priv=true; return true; }
    return false; };

  /* ---------- 第 9 項：對話最前面加一句旁白 ---------- */
  S.wireScenes=function(){ const miss=[]; for(const q of S.SCENE_LEAD){ const ev=S.evOf(q.ev); if(!ev||!Array.isArray(ev.dialogue)){ miss.push(q.ev); continue; } if(ev._privScene) continue;
      ev.dialogue.unshift({speaker:null,text:q.text}); ev._privScene=true; }
    return miss; };

  /* ---------- 接線（載入時一次）---------- */
  S.wire=function(){ for(const e of S.LIST){ if(e._wired) continue; let ok=false;
      try{ if(e.gate==='hold') ok=S.wireLadder(e); else if(e.gate==='choiceIf') ok=S.wireLadChoice(e); else if(e.gate==='prereq') ok=S.wireEvent(e); else if(e.gate==='evChoice') ok=S.wireEvChoice(e); else if(e.gate==='wrap') ok=S.wireWrap(e);
        else ok=true;   /* offerInvite、priv、edit：那個檔自己問；none：沒有入口 */ }catch(err){ console.warn('PRIVTALK wire',e.key,err); ok=false; }
      e._wired=ok; if(!ok) console.warn('PRIVTALK 接不上',e.key); }
    S.wireDating(); const sm=S.wireScenes(); for(const id of sm) console.warn('PRIVTALK 第 9 項接不上',id);
    return S.LIST.filter(e=>!e._wired).map(e=>e.key); };
  S.wire();
  return S;
})();
if(typeof window!=='undefined') window.PRIVTALK=PRIVTALK;

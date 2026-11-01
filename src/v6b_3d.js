/* ===== 多段感情交接包 v6（BB 人物）還沒進遊戲的幾場（V6-B2、V6-B5；任務 feat-v6b-1101）=====
   規格：企劃線 claude/cool-heisenberg-o8kuqx 的 BB_119（1c-1、3-1、3-3、9-2、9-3；第 3 節開頭「2026-10-17 BB-C（BB_203）」的改法）、BB_165 5-2、
         BB_203（告白只在學期末）、AA_262 附錄 B（大四上口語定稿）、AA_258 第 4 節、AA_282（沛珊放榜後在台南）。台詞照稿一字不改（D100、D109）。
   一、芷若「英國的雨」ev_zhiruo_uk_visit（BB_119 1c-1＋9-2；BCG-25）
     - 給誰：和她交往中（Z13 之後、8/26 出發前的最後一場交往的都算；挽回中 paused 不算）、她人在英國（MSG.inUK）。
     - 邀約：2028-12-18（一）臺灣 21:00 她私訊兩句＋兩個回覆（「我去。」／「這個寒假不行。」）；回覆到 12/19 18:00（R7）。
       沒回＝照「這個寒假不行」那一列的結果（ZR_UK_GO 'none'；她不另外回話——那一列「她」的那句是回玩家的，技術預設不發，見 S.ASK_AA）。
       2-3 談話選了「寒假我去英國找妳。」（CRACKTALK 的 commit zr_trip）、邀約還沒回：12/19 12:00 她多傳一則。
       美國路線那天人在美國：照臺灣時間傳（遊戲時鐘照 STORY.tzOffset 換算）。
     - 那一趟（「我去。」）：2029-01-15（一）晚上出發（出遊 OUT，21:00 到機場、去機場約 1 小時；寒假在家的快轉照 OUT 停在出發前）→
       1/16 到（旁白＋三張手機照片）→ 1/20（六）最後一晚 19:30 老戲院（BCG-25，CG_REGISTRY 有才放）→ 散場那一句 → 1/22（一）早上回到臺北。
       中間的日子用 VAC.jump 跳（同寒暑假出國：途中收到訊息就停、日期卡）；時鐘照 AA_478 第 7 節換英國時間（冬令＝臺灣 −8，VAC 的 clock），回來那一刻換回臺灣時間。
       途中芷若自己的每週私訊、每週視訊（MSG.ukDaily → ZRUK）不發（兩個人在一起）；VAC.abroadOn 那幾天（1/16～1/21）算人在國外（摘要日、打工……照它跳過）。
       演完：記憶 UK_VISIT、ZR_UK_VISIT（cracktalk3d.js 的修補承諾 zr_trip 讀這兩個）、ZR_UK_TRIP 'done'。沒去（「不去了」、過了時間）＝ZR_UK_TRIP 'missed'，沒有訊息（稿沒寫）。
     - 2-3「寒假我去英國找妳。」這個選項（cracktalk3d.js 的 CT_ZR_TRIP_OK）：這一趟在遊戲裡以後才出；另外加：邀約的回覆期限（12/19 18:00）過了、又沒有回「我去。」＝不出
       （去不了的承諾不給選；包住 CRACKTALK.prep）。
   二、沛珊 5-2「她的紅筆」剩下的兩樣（BB_165 5-2；V6-B5「同一條線」）——5-1 的 PS_WAITED 尾聲那一句已經在 postgrad3d.js（tests/aa360_unit.js 15-1b）
     - 短版的視訊那一種：5-2 沒到（PS_RED_PEN_SHORT）以後，下一次是交往中的視訊（hometown3d.js HV.video）＝閒聊階梯以前演短版、記 PS_RED_PEN
       （同 rom1016_3d.js 當面那一種：ROM1016.redPenShort；包住 HV.ladder 的 'video'）。
     - 紅筆以後摘要日的照片：PS_RED_PEN 以後、交往中，每天的手機小事（STORY.DAILY_PHONE）多一則「📷（便利貼上一個紅筆笑臉）」「今天的」，一個（自然）月最多一次；
       時間 23:10（她 23:00 以後最常傳，BB_165 5-1；技術預設）。
     - BB_119 1b-1「考完再說」ev_peishan_wait：作廢，不做（AA_281 第 67 行、BB_119 1b-3 檔內 BB-C 10-21 標註：PEISHAN_WAIT 永遠到不了；告白只在學期末 BB_203）。
   三、沛珊「她的第一堂試教」ev_peishan_first_lesson（BB_119 3-1、9-3；台灣、日本路線，2028-11-08（三））
     - 照 BB_119 第 3 節開頭：當天照演、沒有告白，演到她試教結束；她的心意邀約在大四上的學期末（termend_lines.js HEART classmate_peishan 的 Y4S1 已經有：
       「先不說」＝3-1 的兩句、回答「從今天開始認識。」／「……讓我想一下。」，地點台南），這裡不重做。美國路線＝r2y4a3d.js 11/08 23:10 的訊息版（已做）。
     - 給誰（3-1「給誰」，同 r2y4a3d.js 美國路線那一版的簡化）：沒和她交往、不是前任、認識、朋友以上、有聯絡方式、放榜後重新聯絡上（R2Y4B.psReconnected）；
       她那天在台南；祐廷那天在臺灣。她有沒有對象遊戲沒有紀錄，不看。
     - 地點：9-3 寫「溫州街的課輔班」，和 AA_282（大三起她在台南，不來臺北；課輔班在台南）、遊戲現在的 presence 衝突——技術預設照現行：在台南，
       去法同 BB_165 5-1（高鐵當天來回，票錢照 hometown3d.js 台南那一組扣；那一天算一次正式校外約會 AA_349 K3、推進一層閒聊階梯 AA_349 K4）。日子照稿 11/08 18:30～19:30、19:30 在課輔班門口等她。
     - 11/7（二）21:00 她私訊兩句（9-3）；回覆到 11/8 18:00（R6）；回覆的兩個按鈕「好」「不行」（9-3 只寫「回『好』」「回不行」，技術預設照這兩個字）。
       回「好」＝排 11/8 19:30 台南（18:00 以前要出發＝19:45 前到）；回「好」但沒到＝19:45、20:30 兩則；回「不行」＝她回一句、20:00 一則；沒回＝18:00 她回同一句、20:00 一則。
     - 場面（技術預設，見 S.ASK_AA）：（她第一次站上課輔班的講台試教。）＋她這學期那一句（AA_262 附錄 B (a) 1-3、AA_258 第 4 節的原句）。存檔 PS_FIRST_LESSON（met／missed／no）。
   四、子晴「工作室的深夜」ev_ziqing_studio_night（BB_119 3-3、9-3；台灣、日本路線，2028-11-10（五）21:00）
     - 照 BB_119 第 3 節開頭：當天照演、沒有告白，演到試玩新關卡。她大四上學期末「回工作室玩完那一關、他在那裡說」那一版（AA_262 (b) 第 9 條）不在這一件。美國路線＝r2y4a3d.js 11/10 23:40（已做）。
     - 給誰（3-3「給誰」；前置鏈 10-18 作廢 AA_215／BB_185）：Q15 沒有發生（ZQ_Q15 沒有值）、沒和她交往、不是前任、認識、朋友以上、有聯絡方式、Q14 回過（ZQ_CONTRACT，
       她才知道他是「看得懂四十頁合約的人」，9-3 3-3 的說明）、她單身（不是 ZRZQ.dating）、她那天在臺北、祐廷那天在臺灣。
     - 當天 18:00 她私訊兩句（AA_262 定稿 ZQ5 的字）；回覆到 20:30；按鈕「好」「不行」（同上）。回「好」＝21:00 工作室（2D ziqing_studio，OUT.BG 沒有＝深色底＋地點字幕；
       捷運＋公車約 30 分鐘，同 r2y4b3d.js 工作室樓下）；沒到＝21:30 一則；不行、沒回＝她回一句。場面（技術預設）：（她請你試玩新關卡。）。存檔 ZQ_STUDIO（met／missed／no）。
   接線：STORY.PHONE_RULES（邀約、回覆、排出遊）、STORY_EVENTS（三場）、STORY.DAILY_PHONE（紅筆照片）、包住 HV.ladder、MSG.ukDaily、VAC.abroadOn、CRACKTALK.prep。
   index.html 接在 rom1016_3d.js 後面（要在 vac3d、msg3d、zr_uk3d、hometown3d、cracktalk3d、rom1016_3d、r2y4b3d 之後；不能放在 bbpack3d.js 和 GAME.boot() 中間：tests/bbpack_unit.js、aa498_pool_unit.js 查那一段只有 AA_497、AA_524 的檔）。
   測試：node tests/v6b_unit.js */
'use strict';
const V6B=(function(){
  const S={}, ZR='heroine_02', PS='classmate_peishan', ZQ='heroine_04';
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const romR=(G,id)=>((G&&G.flags&&G.flags.romance)||{})[id]||null;   /* 只讀（不替沒有紀錄的人建一筆）*/
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=romR(G,id); return F['dating_'+id]===true||!!(R&&R.status==='dating'); };
  const paused=(G,id)=>{ const R=romR(G,id); return !!R&&R.status==='paused'; };
  const isEx=(G,id)=>{ const F=(G&&G.flags)||{}, R=romR(G,id); return !dating(G,id)&&(F['EX_'+id]===true||!!(R&&R.status==='ex')); };
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&!!SOCIAL.stage&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const contact=(G,id)=>typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,id);
  const onDay=(G,d)=>Object.assign({},G,{day:d});
  const abroadOn=(G,d)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(onDay(G,d));   /* 交換在國外（美國路線 2028-08-02～12-23）*/
  const tz=(G,d)=>typeof STORY!=='undefined'&&STORY.tzOffset?(+STORY.tzOffset(G,d==null?G.day:d)||0):0;
  S.twNow=G=>now(G)-tz(G,G.day);
  S.toGame=(G,d,h)=>{ const a=T(d,h)+tz(G,d), dd=Math.floor(a/24+1e-9); return {day:dd,h:+(a-dd*24).toFixed(4)}; };
  const dm=id=>t=>({th:'p:'+id,from:id,text:t});
  const outGet=(G,id)=>typeof OUT!=='undefined'&&OUT.get?OUT.get(G,id):null;
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const cg=id=>({if:{custom:()=>hasCG(id)},cg:id});   /* CG 登錄了才放（同 rom1016_events.js）*/
  const N=t=>({speaker:null,text:t});

  /* ---------------- 台詞（照稿，一字不改）---------------- */
  S.L={
    /* 一、BB_119 1c-1（邀約、那五天、最後一晚）、9-2（12/19 12:00 那一則）*/
    zrAsk:['這裡的寒假很冷。雨一直下。','……你要來嗎？不來也沒關係，真的。'],
    zrYes:['我去。','……好。那我先排好要看的片。'], zrNo:['這個寒假不行。','好。那我寄一張下雨的明信片給你。'],
    zrNudge:'機票我先不幫你看。……你回我，我再看。',
    ukTown:'英國的一座小城。雨一直下。',
    ukPhotos:['📷（她指給你看的書店櫥窗）','📷（兩杯熱可可，一杯加了濃縮）','📷（雨中的紅磚街）'],   /* 1c-1「手機照片：她指給你看的書店櫥窗、兩杯熱可可（一杯加了濃縮）、雨中的紅磚街。」；照片＝「📷（…）」（同 r2y4a_events.js 的 PHOTO）*/
    ukLast:'（她穿雨衣、撐傘，在一間老戲院門口等，手上兩張票。）',
    ukTwo:'這次，兩張是本來就買的。',   /* CG 放這一句（BCG-25）*/
    ukAfter:'這間只有六十個位子。……我以後的，要再小一點。',   /* 散場後 */
    /* 二、BB_165 5-2 */
    rpPhoto:['📷（便利貼上一個紅筆笑臉）','今天的'],
    /* 三、BB_119 9-3 3-1（AA_262 C10 以後的版本）；她這學期那一句＝AA_262 附錄 B (a) 1-3、AA_258 第 4 節 */
    psAsk:['明天傍晚六點半，我第一次站上講台。課輔班。','……下課以後，可以陪我走去小公園嗎？'],
    psMiss1:'下課了。……他們都有舉手。', psMiss2:'我自己走了一圈。第一堂課，下次再跟你說。',
    psNo:'好。那我下課再跟你說。', psNoAfter:'他們都有舉手。',
    psLesson:'（她第一次站上課輔班的講台試教。）',   /* 3-1 流程「她第一次站上課輔班的講台試教。」當旁白（技術預設）*/
    psLine:'有一個小朋友舉了六次手。……這次我有看到他。',
    /* 四、BB_119 9-3 3-3（AA_262 定稿 ZQ5 的字）*/
    zqAsk:['今天晚上九點 來工作室','新關卡要人試玩 你是測試員'],
    zqMiss:'我自己測了。……第三關還是太難。', zqNo:'好 那我自己測',
    zqPlay:'（她請你試玩新關卡。）',   /* 3-3 流程「她請他晚上來工作室試玩新關卡」當旁白（技術預設，他→你）*/
    /* 回覆的按鈕：9-3 只寫「回『好』」「回不行」（技術預設照這兩個字）*/
    yes:'好', no:'不行' };

  /* =====================================================================
     一、芷若：英國的雨（BB_119 1c-1、9-2）
     ===================================================================== */
  S.UK={ask:'2028-12-18',askH:21,until:'2028-12-19',untilH:18,nudgeH:12,dep:'2029-01-15',depH:21,arr:'2029-01-16',arrH:14,last:'2029-01-20',lastH:19.5,back:'2029-01-22',backH:8,tz:-8};
  /* 到的時間（1/16 14:00 英國）、戲院的時間（19:30，同 3-2 二輪戲院）、回到臺北的時間（1/22 08:00）：稿只寫日子與「晚上」「最後一晚」「早上」，時刻是技術預設 */
  S.ASK_TAG='v6b_zr_uk_ask'; S.NUDGE_TAG='v6b_zr_uk_nudge'; S.UK_OUT='v6b_zr_uk'; S.UK_EV='ev_zhiruo_uk_visit';
  S.zrInUK=(G,d)=>typeof MSG!=='undefined'&&!!MSG.inUK&&MSG.inUK(d==null?G:onDay(G,d),ZR);
  S.zrGo=G=>law(G)&&dating(G,ZR)&&!paused(G,ZR);   /* 還在交往（挽回中不算）*/
  S.zrOk=G=>S.zrGo(G)&&S.zrInUK(G);
  const ctCommit=G=>{ if(typeof CRACKTALK==='undefined'||!CRACKTALK.pr) return null; try{ const c=CRACKTALK.pr(G,ZR).commit; return c&&c.kind==='zr_trip'?c:null; }catch(e){ return null; } };
  S.ukDeadline=G=>{ const d=D(S.UK.until); return d==null?null:T(d,S.UK.untilH); };   /* 臺灣時間 */
  S.tripClosed=G=>{ const F=G.flags||{}, u=S.ukDeadline(G); if(F.ZR_UK_GO==='yes') return false; if(F.ZR_UK_GO==='no'||F.ZR_UK_GO==='none') return true; return u!=null&&S.twNow(G)>=u; };   /* 這一趟已經不可能成行 */
  S.zrPhone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; const F=G.flags, da=D(S.UK.ask), du=D(S.UK.until); if(da==null||du==null) return; const tw=S.twNow(G), at=T(da,S.UK.askH), u=T(du,S.UK.untilH);
    if(!sent(G,S.ASK_TAG)){ if(tw<at||tw>=u||F.ZR_UK_GO!=null||!S.zrOk(G)) return;
      const c=S.toGame(G,da,S.UK.askH), cu=S.toGame(G,du,S.UK.untilH), M=S.L.zrAsk.map(dm(ZR)), d0=tw>at?{day:G.day,h:+G.hour}:c;
      M[M.length-1].ask={id:S.ASK_TAG,until:T(cu.day,cu.h),opts:[{t:S.L.zrYes[0],set:{ZR_UK_GO:'yes'},say:[{from:ZR,text:S.L.zrYes[1]}]},{t:S.L.zrNo[0],set:{ZR_UK_GO:'no'},say:[{from:ZR,text:S.L.zrNo[1]}]}]};
      PHONE.at(G,d0.day,d0.h,M,S.ASK_TAG); return; }
    if(F.ZR_UK_GO==null){ const m=PHONE.byAsk?PHONE.byAsk(G,S.ASK_TAG):null;
      if(m&&m.ans==null&&tw>=T(du,S.UK.nudgeH)&&tw<u&&!sent(G,S.NUDGE_TAG)&&ctCommit(G)){ const c=S.toGame(G,du,S.UK.nudgeH), d0=tw>T(du,S.UK.nudgeH)+0.25?{day:G.day,h:+G.hour}:c; PHONE.at(G,d0.day,d0.h,[dm(ZR)(S.L.zrNudge)],S.NUDGE_TAG); }   /* 2-3 承諾過要去的玩家（9-2）*/
      if(tw>=u&&(!m||m.ans==null)) F.ZR_UK_GO='none'; }   /* 12/19 18:00 還是沒回＝照「這個寒假不行」那一列的結果；2-3 承諾過的＝沒做到（cracktalk3d.js 寒假結束 2/19 判斷）*/
    /* 答應了以後、出發以前分開（或挽回中）：這一趟取消（稿沒寫；技術預設，見 S.ASK_AA）*/
    { const q=outGet(G,S.UK_OUT); if(q&&q.state==='planned'&&!q.arrived&&!S.zrGo(G)){ q.state='skipped'; F.ZR_UK_TRIP='cancelled'; } }
    if(F.ZR_UK_GO==='yes'&&F.ZR_UK_TRIP==null&&S.zrGo(G)&&typeof OUT!=='undefined'&&!outGet(G,S.UK_OUT)){ const d=D(S.UK.dep); if(d!=null&&now(G)<T(d,S.UK.depH)+0.5)
      OUT.plan(G,{id:S.UK_OUT,ev:S.UK_EV,day:d,h:S.UK.depH,late:0.5,place:'英國',title:'去英國找'+nm(ZR)+'（1/15～1/22）',travel:'去機場 約 1 小時',travelH:1,back:'回到臺北。',alarm:true}); } };   /* 同 vac3d.js 出國的那一趟（去機場 約 1 小時、late 0.5）；alarm：睡覺、快轉停在出發前 */
  /* 那一趟途中（beforeOuting 到演完）：時鐘換英國時間（AA_478 第 7 節的 VAC clock；冬令 −8：比臺灣慢＝出發那一刻時鐘不動、回來那一刻往後撥）*/
  S.ukEnd=()=>{ const d=D(S.UK.back); return d==null?null:T(d,S.UK.backH); };
  S.going=G=>!!(G&&G.flags&&G.flags.ZR_UK_TRIP==='going');
  S.fly=function(GM,q){ const G=GM.G; G.flags.ZR_UK_TRIP='going'; const end=S.ukEnd();
    if(typeof VAC!=='undefined'&&VAC.rec&&VAC.clock&&!VAC.clock(G)&&end!=null) VAC.rec(G).clock={q:q?q.id:S.UK_OUT,tz:S.UK.tz,end,with:[ZR]}; };
  S.jumpTo=async function(GM,key,h,place){ const G=GM.G, d=D(key); if(d==null) return; const t=T(d,h); if(t<=now(G)) return;
    if(typeof VAC!=='undefined'&&VAC.jump) return VAC.jump(GM,t,place);   /* 中間的日子不演、手機照時間收、收到訊息就停（X58）、日期卡 */
    G.day=d; G.hour=h; if(typeof CALENDAR!=='undefined') G.weekday=CALENDAR.dateOf(d).wd%7; };
  S.flyBack=async function(GM){ const G=GM.G, end=S.ukEnd(); if(end==null) return; const C=typeof VAC!=='undefined'&&VAC.clock?VAC.clock(G):null;
    const t=C&&typeof VAC.clockEnd==='function'?VAC.clockEnd(G,end):end; if(t>now(G)){ if(typeof VAC!=='undefined'&&VAC.jump) await VAC.jump(GM,t,'英國'); else { const d=Math.floor(t/24+1e-9); G.day=d; G.hour=+(t-d*24).toFixed(4); } }
    if(C&&VAC.clockBack) VAC.clockBack(GM); G.flags.ZR_UK_TRIP='done'; };
  S.visited=G=>{ const F=G.flags; F.ZR_UK_VISIT=true; if(typeof SOCIAL!=='undefined'&&SOCIAL.remember&&!(SOCIAL.has&&SOCIAL.has(ZR,'UK_VISIT'))) SOCIAL.remember(ZR,'UK_VISIT',''); };
  /* 沒去：「不去了」、過了出發時間＝missed（稿沒有沒到的訊息）。到了以後才被算成沒去（途中讀檔、出發時間過了）＝當作去過（人已經出發了）*/
  S.ukMissed=function(G,GM,q){ if(q&&q.arrived){ if(GM&&typeof VAC!=='undefined'&&VAC.clock&&VAC.clock(G)&&VAC.clockBack) VAC.clockBack(GM); S.visited(G); G.flags.ZR_UK_TRIP='done'; return; } G.flags.ZR_UK_TRIP='missed'; };
  const ZRL=t=>({speaker:ZR,text:t});
  S.UK_EVENT={ id:S.UK_EV, title:'英國的雨', participants:[ZR], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    beforeOuting:(G,GM,q)=>S.fly(GM,q),
    outingMissed:(G,GM,q)=>S.ukMissed(G,GM,q),
    dialogue:[ {call:(G,GM)=>S.jumpTo(GM,S.UK.arr,S.UK.arrH,'英國')},
      {scene:'英國',bg:'dark'},
      N(S.L.ukTown),
      ...S.L.ukPhotos.map(N),
      {call:(G,GM)=>S.jumpTo(GM,S.UK.last,S.UK.lastH,'英國')},
      N(S.L.ukLast),
      cg('cg_uk_rain_heroine02'),
      ZRL(S.L.ukTwo),
      {advance:2},   /* 散場（稿：「散場後她說」，沒有旁白）*/
      ZRL(S.L.ukAfter),
      {call:G=>S.visited(G)},
      {call:(G,GM)=>S.flyBack(GM)} ] };   /* ZR_UK_TRIP 回到臺北那一刻才改 done（回程那一天半還在途中：她的每週視訊照樣不打）*/
  /* 途中：她自己在英國的每週私訊、每週視訊不發（MSG.ukDaily → ZRUK.phone 那一串都包在裡面；zr_uk3d.js 包在 msg3d.js 外面，這裡再包一層）*/
  if(typeof MSG!=='undefined'&&typeof MSG.ukDaily==='function'&&!MSG._v6b){ const u0=MSG.ukDaily; MSG.ukDaily=function(G){ if(S.going(G)) return false; return u0.apply(this,arguments); }; MSG._v6b=true; }
  /* 那幾天人在國外（VAC.abroadOn：摘要日、打工、別人的邀約照它跳過）：答應了、還沒被算成沒去，1/16～1/21 */
  S.abroadDay=(G,d)=>{ const F=(G&&G.flags)||{}; if(F.ZR_UK_GO!=='yes'||F.ZR_UK_TRIP==='missed'||F.ZR_UK_TRIP==='cancelled') return false; const a=D(S.UK.arr), b=D(S.UK.back); return a!=null&&b!=null&&d>=a&&d<b; };
  if(typeof VAC!=='undefined'&&typeof VAC.abroadOn==='function'&&!VAC._v6b){ const a0=VAC.abroadOn; VAC.abroadOn=function(G,d){ return a0.apply(this,arguments)||S.abroadDay(G,d); }; VAC._v6b=true; }
  /* 2-3「寒假我去英國找妳。」：這一趟已經不可能成行（邀約期限過了、沒有回「我去。」）就不出 */
  if(typeof CRACKTALK!=='undefined'&&typeof CRACKTALK.prep==='function'&&!CRACKTALK._v6b){ const p0=CRACKTALK.prep; CRACKTALK.prep=function(G,id){ const r=p0.apply(this,arguments); try{ if(id===ZR&&G&&G.flags&&G.flags.CT_ZR_TRIP_OK&&S.tripClosed(G)) G.flags.CT_ZR_TRIP_OK=false; }catch(e){ console.warn('V6B prep',e); } return r; }; CRACKTALK._v6b=true; }

  /* =====================================================================
     二、沛珊 5-2 她的紅筆：短版的視訊那一種、摘要日的照片（BB_165 5-2）
     ===================================================================== */
  /* 視訊（HV.video）的閒聊階梯以前：5-2 沒到的短版（ROM1016.redPenShort 照它自己的條件：PS_RED_PEN 還沒有、PS_RED_PEN_SHORT 有、比沒到那天晚）*/
  if(typeof HV!=='undefined'&&typeof HV.ladder==='function'&&!HV._v6b){ const l0=HV.ladder; HV.ladder=async function(GM,id,mode){ try{ if(mode==='video'&&id===PS&&GM&&GM.G&&typeof ROM1016!=='undefined'&&ROM1016.redPenShort) await ROM1016.redPenShort(GM,{hv:{id:PS},day:GM.G.day,place:'視訊'}); }catch(e){ console.warn('V6B redPenShort',e); } return l0.apply(this,arguments); }; HV._v6b=true; }
  const ym=d=>{ if(typeof CALENDAR==='undefined') return ''; const x=CALENDAR.dateOf(d); return x.y+'-'+x.m; };
  S.RP_ID='v6b_ps_redpen';
  S.rpOk=(G,day)=>{ const F=G.flags||{}; if(!law(G)||!dating(G,PS)||!F.PS_RED_PEN) return false; const last=(F.dpDayOf||{})[S.RP_ID]; if(last!=null&&ym(last)===ym(day)) return false; return contact(G,PS); };   /* 一個月最多一次（自然月）*/
  S.DP=[{id:S.RP_ID,term:t=>!!t&&(t.id==='Y4S1'||t.id==='Y4S2'),max:()=>99,h:()=>23+10/60,ok:(G,day)=>S.rpOk(G,day),items:()=>S.L.rpPhoto.map((t,k)=>Object.assign(dm(PS)(t),{dt:k/60}))}];   /* 5-2 在大四上 11/17；之後到畢業的學期中 */
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.DAILY_PHONE)&&!STORY._v6bdp){ for(const d of S.DP) if(!STORY.DAILY_PHONE.some(x=>x.id===d.id)) STORY.DAILY_PHONE.push(d); STORY._v6bdp=true; }

  /* =====================================================================
     三、沛珊：她的第一堂試教（BB_119 3-1、9-3）——台灣、日本路線
     ===================================================================== */
  S.PSL={ask:'2028-11-07',askH:21,day:'2028-11-08',until:18,h:19.5,missBy:19.75,miss1H:19.75,miss2H:20.5,noAfterH:20};
  S.PSL_ASK='v6b_ps_lesson_ask'; S.PSL_OUT='v6b_ps_lesson'; S.PSL_EV='ev_peishan_first_lesson';
  const TN=()=>(typeof HOMETOWN_LINES!=='undefined'&&HOMETOWN_LINES[PS+'@台南'])||{travel:'高鐵約一小時四十分鐘',travelH:1.75,fare:2700};
  const inTainan=(G,day)=>{ if(typeof DATE!=='undefined'&&DATE.whereOn) return (DATE.whereOn(G,PS,day)||{}).city==='台南'; return false; };
  S.psReconnected=G=>{ if(typeof R2Y4B!=='undefined'&&R2Y4B.psReconnected) return !!R2Y4B.psReconnected(G); const F=G.flags||{}; return !!F.PS_RECONNECT||F.PS_BACK_FIRST!=null||typeof F.PS_BACK_READ==='number'; };
  S.psCond=function(G,day){ if(!law(G)||day==null) return false; if(abroadOn(G,day)) return false;
    if(dating(G,PS)||isEx(G,PS)||!knows(PS,G)||!stageAt(PS,'FRIEND')||!contact(G,PS)||!S.psReconnected(G)) return false;
    return inTainan(G,day); };
  S.psLate=()=>S.PSL.missBy-TN().travelH-S.PSL.h;   /* OUT 的 late：19:45 以前要到＝18:00 以前出發（同 rom1016_3d.js S.lateOf）*/
  S.psPhone=function(G){ if(typeof PHONE==='undefined') return; const F=G.flags, da=D(S.PSL.ask), d=D(S.PSL.day); if(da==null||d==null) return; const t=now(G), at=T(da,S.PSL.askH), u=T(d,S.PSL.until);
    if(!sent(G,S.PSL_ASK)){ if(t<at||t>=u||F.PS_FIRST_LESSON_GO!=null||!S.psCond(G,d)) return;
      const M=S.L.psAsk.map(dm(PS)); M[M.length-1].ask={id:S.PSL_ASK,until:u,opts:[{t:S.L.yes,set:{PS_FIRST_LESSON_GO:'yes'}},{t:S.L.no,set:{PS_FIRST_LESSON_GO:'no'},say:[{from:PS,text:S.L.psNo}]}]};
      PHONE.at(G,t>at?G.day:da,t>at?+G.hour:S.PSL.askH,M,S.PSL_ASK); return; }
    if(F.PS_FIRST_LESSON_GO==null&&t>=u){ F.PS_FIRST_LESSON_GO='none'; PHONE.at(G,d,S.PSL.until,[dm(PS)(S.L.psNo)],'v6b_ps_lesson_none'); }   /* 沒回＝18:00 她回這一句 */
    if((F.PS_FIRST_LESSON_GO==='no'||F.PS_FIRST_LESSON_GO==='none')&&F.PS_FIRST_LESSON==null){ F.PS_FIRST_LESSON='no'; PHONE.at(G,d,S.PSL.noAfterH,[dm(PS)(S.L.psNoAfter)],'v6b_ps_lesson_after'); }   /* 20:00「他們都有舉手。」*/
    if(F.PS_FIRST_LESSON_GO==='yes'&&F.PS_FIRST_LESSON==null&&typeof OUT!=='undefined'&&!outGet(G,S.PSL_OUT)&&t<T(d,S.PSL.h)+S.psLate()){ const C=TN();
      OUT.plan(G,{id:S.PSL_OUT,ev:S.PSL_EV,day:d,h:S.PSL.h,late:S.psLate(),place:'台南',title:'去台南找'+nm(PS),travel:C.travel,travelH:C.travelH,back:'回到臺北。',alarm:true}); } };
  S.psMissed=function(G){ if(typeof PHONE==='undefined') return; const d=D(S.PSL.day); if(d==null) return; G.flags.PS_FIRST_LESSON='missed';
    PHONE.at(G,d,S.PSL.miss1H,[dm(PS)(S.L.psMiss1)],'v6b_ps_lesson_miss1'); PHONE.at(G,d,S.PSL.miss2H,[dm(PS)(S.L.psMiss2)],'v6b_ps_lesson_miss2'); };
  const R16=()=>typeof ROM1016!=='undefined'?ROM1016:null;
  S.PS_EVENT={ id:S.PSL_EV, title:'她的第一堂試教', participants:[PS], location:'any', trigger:'outing', once:true, background:'dark', hours:2,   /* 送到車站以後的高鐵（同 ev_peishan_waited 的 1 小時 45 分，加走到車站）*/
    beforeOuting:(G,GM,q)=>{ const x=R16(); if(x&&x.fare) x.fare(GM); },   /* 高鐵來回（同 BB_165 5-1）*/
    outingMissed:(G,GM,q)=>S.psMissed(G),
    dialogue:[ {scene:'台南・課輔班',bg:'cram_class'},   /* 2D：cram_class 借用（同 ev_peishan_waited）*/
      N(S.L.psLesson),
      {speaker:PS,text:S.L.psLine},
      {call:(G,GM)=>{ const x=R16(); return x&&x.ladder?x.ladder(GM):null; }},   /* 當面見到她的那一天推進一層閒聊階梯（AA_349 K4）*/
      {set:{PS_FIRST_LESSON:'met'}} ],
    after:G=>{ const x=R16(); if(x&&x.visit) x.visit(G); } };   /* 去台南那一天＝一次正式校外約會（AA_349 K3）*/

  /* =====================================================================
     四、子晴：工作室的深夜（BB_119 3-3、9-3）——台灣、日本路線
     ===================================================================== */
  S.ZQS={day:'2028-11-10',askH:18,until:20.5,h:21,missH:21.5};
  S.ZQS_ASK='v6b_zq_studio_ask'; S.ZQS_OUT='v6b_zq_studio'; S.ZQS_EV='ev_ziqing_studio_night';
  const zqHere=(G,day)=>{ if(typeof STORY==='undefined'||!STORY.presence) return true; const p=STORY.presence(ZQ,onDay(G,day)); return !!p&&(p.here!==false||p.kind==='taipei'); };
  S.zqCond=function(G,day){ if(!law(G)||day==null) return false; if(abroadOn(G,day)) return false; const F=G.flags;
    if(F.ZQ_Q15!=null||F.ZQ_CONTRACT==null) return false;
    if(dating(G,ZQ)||isEx(G,ZQ)||!knows(ZQ,G)||!stageAt(ZQ,'FRIEND')||!contact(G,ZQ)) return false;
    if(typeof ZRZQ!=='undefined'&&ZRZQ.dating&&ZRZQ.dating(G)) return false;   /* 她和芷若在一起（4-4）＝她不單身 */
    return zqHere(G,day); };
  S.zqPhone=function(G){ if(typeof PHONE==='undefined') return; const F=G.flags, d=D(S.ZQS.day); if(d==null) return; const t=now(G), at=T(d,S.ZQS.askH), u=T(d,S.ZQS.until);
    if(!sent(G,S.ZQS_ASK)){ if(t<at||t>=u||F.ZQ_STUDIO_GO!=null||!S.zqCond(G,d)) return;
      const M=S.L.zqAsk.map(dm(ZQ)); M[M.length-1].ask={id:S.ZQS_ASK,until:u,opts:[{t:S.L.yes,set:{ZQ_STUDIO_GO:'yes'}},{t:S.L.no,set:{ZQ_STUDIO_GO:'no'},say:[{from:ZQ,text:S.L.zqNo}]}]};
      PHONE.at(G,t>at?G.day:d,t>at?+G.hour:S.ZQS.askH,M,S.ZQS_ASK); return; }
    if(F.ZQ_STUDIO_GO==null&&t>=u){ F.ZQ_STUDIO_GO='none'; PHONE.at(G,d,S.ZQS.until,[dm(ZQ)(S.L.zqNo)],'v6b_zq_studio_none'); }   /* 沒回＝20:30 她回這一句 */
    if((F.ZQ_STUDIO_GO==='no'||F.ZQ_STUDIO_GO==='none')&&F.ZQ_STUDIO==null) F.ZQ_STUDIO='no';
    if(F.ZQ_STUDIO_GO==='yes'&&F.ZQ_STUDIO==null&&typeof OUT!=='undefined'&&!outGet(G,S.ZQS_OUT)&&t<T(d,S.ZQS.h)+0.25)
      OUT.plan(G,{id:S.ZQS_OUT,ev:S.ZQS_EV,day:d,h:S.ZQS.h,late:0.25,place:'子晴的工作室',title:'子晴的工作室：試玩新關卡',travel:'捷運＋公車 約 30 分鐘',travelH:0.5,alarm:true}); };   /* 開始前後 15 分鐘（R4）*/
  S.zqMissed=function(G){ const d=D(S.ZQS.day); if(d==null) return; G.flags.ZQ_STUDIO='missed'; if(typeof PHONE!=='undefined') PHONE.at(G,d,S.ZQS.missH,[dm(ZQ)(S.L.zqMiss)],'v6b_zq_studio_miss'); };
  S.ZQ_EVENT={ id:S.ZQS_EV, title:'工作室的深夜', participants:[ZQ], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    outingMissed:(G,GM,q)=>S.zqMissed(G),
    dialogue:[ {scene:'子晴的工作室',bg:'ziqing_studio'},   /* OUT.BG 沒有 ziqing_studio＝深色底（OUT.bg）*/
      N(S.L.zqPlay),
      {advance:1},
      {set:{ZQ_STUDIO:'met'}} ] };

  /* ---------------- 接線 ---------------- */
  S.EVENTS=[S.UK_EVENT,S.PS_EVENT,S.ZQ_EVENT];
  S.phone=function(G){ if(!G||!G.flags) return; for(const f of [S.zrPhone,S.psPhone,S.zqPhone]){ try{ f(G); }catch(e){ console.warn('V6B phone',e); } } };
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x&&x.id===e.id)) STORY_EVENTS.push(e);
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._v6b){ STORY.PHONE_RULES.push(G=>S.phone(G)); STORY._v6b=true; }

  /* 稿沒寫清楚、和現有程式衝突、用技術預設的（回報 AA）*/
  S.ASK_AA=[
    '3-1 地點：BB_119 9-3 寫溫州街的課輔班、走到小公園；AA_282（她大三起在台南、不來臺北、課輔班在台南）和遊戲的 presence 都是台南——照台南做（高鐵當天來回、票錢、算一次正式約會、推進一層階梯），日子照 11/08（三）19:30',
    '3-1、3-3 當天沒有告白以後，場面只剩旁白：3-1「（她第一次站上課輔班的講台試教。）」＋她這學期那一句（AA_258 第 4 節訊息版的原句「有一個小朋友舉了六次手。……這次我有看到他。」）；3-3「（她請你試玩新關卡。）」——都是從稿的流程句改的，請 AA 給當面那一場的字',
    '3-1、3-3 邀約的回覆按鈕：9-3 只寫「回『好』」「回不行」，按鈕照這兩個字（「好」「不行」）',
    '1c-1 沒回邀約：9-2「沒回＝照『這個寒假不行』那一列」——只照結果（ZR_UK_GO none），她那句「好。那我寄一張下雨的明信片給你。」不發（那是回玩家的話）；下雨的明信片本身遊戲沒有寄',
    '1c-1 那一趟的機票錢：稿沒寫，不扣',
    '1c-1 答應了以後、1/15 出發以前分開或挽回中：這一趟取消（ZR_UK_TRIP cancelled），稿沒寫',
    '1c-1 1/16 到的時刻（英國 14:00）、老戲院 19:30、1/22 回到臺北 08:00：稿只寫日子與「晚上出發」「最後一晚」「早上回到臺北」',
    '1c-1 散場那一句前面沒有旁白（稿「散場後她說」），只把時間往後兩個小時',
    '5-2 短版的視訊那一種：「把本子推回來」那一句在視訊裡照原文（同當面的短版四句）',
    '5-2 紅筆照片的時間 23:10（她 23:00 以後最常傳，BB_165 5-1）；只在學期中（每天的手機小事的規則）'];
  return S;
})();

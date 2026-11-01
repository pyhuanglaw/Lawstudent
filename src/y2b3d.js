/* ===== 1B 大二～大三上的人物事件：手機、時間窗、明信片、法服 5/22、債各第 6 週的課堂段、沛珊放榜後（AA_316 1B-01～07、AA_321 1B-08～11；AA-C 定稿，台詞照原文）=====
   事件（出遊、在場景裡碰到的、下課後）在 src/data/y2b_events.js。這裡用 STORY.PHONE_RULES（手機）、STORY.TICKS（9/14 下雨、明信片放在桌上／Café 牆上）、
   CLS.IN_CLASS（債各第 6 週那一堂的劇情段）掛進去；法服 5/22 包住 STORY.fafuShift、沛珊放榜後第一次的回覆包住 MSG.send（不改那兩個檔）。
   1B-11 只做了訊息（8/7、第一次回覆；8/7 那一則 AA_296 2-3-1 ④ 起是她打來的電話，沒接才是訊息）：沛珊大三起在台南（presence、臺北作息、邀約去台南、期末心意邀約、閒聊階梯 context:'date'）屬 AA_282 第 5 節，見 S.PS_TAINAN 的說明。
   AA_349（2026-10-21）：K1 第一次回覆分台中／台南兩句；K9 大三上第 6 週 10/15 21:00 二手書店那兩則；K3 她主動約「台南・美術館」的手機規則（HV.museumPhone）也從這裡叫。
   AA_350 P1（2026-10-21）：第一次回覆照她那天在哪（STORY.presence）——寒暑假在台中＝台中那一句，學期中＝台南那一句（S.psTaichung）。
   測試：node tests/y2b_events_unit.js、tests/peishan_tainan_unit.js（第 8 節）*/
'use strict';
const Y2B=(function(){
  const S={};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(day,h)=>day*24+h, now=G=>G.day*24+G.hour;
  const past=(G,key,h)=>{ const d=D(key); return d!=null&&now(G)>=T(d,h); };
  const hh=G=>((G.hour%24)+24)%24;
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const mark=(G,id)=>{ const E=G.events||(G.events={done:{},last:{},count:0}); E.done=E.done||{}; E.last=E.last||{}; E.done[id]=(E.done[id]||0)+1; E.last[id]=G.day; };
  const LOVE=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const datingAny=G=>LOVE.some(x=>dating(G,x));
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const contact=(G,id)=>typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,id);
  const law=G=>(G.stage||'law')==='law';
  const who=id=>({name:typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id,charId:id});
  const M=(id,text,o)=>Object.assign({th:'p:'+id,from:id,text},o||{});
  const K=t=>M('kexin',t), Y=t=>M('heroine_03',t), Z=t=>M('heroine_04',t), R=t=>M('heroine_02',t), P=t=>M('classmate_peishan',t);

  /* ===================== 手機（STORY.PHONE_RULES：每 0.5 秒）===================== */
  S.phone=function(G,GM){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; const F=G.flags;
    /* ---- 1B-01 可昕 K10c：11/18 21:00 → 答應＝11/19 20:30 出遊（19:50 出發）；沒去、婉拒、沒回＝11/22 22:00；去了的 12/2 21:00；三種都有的 12/5 ---- */
    { const d18=D('2026-11-18'), d19=D('2026-11-19'), d22=D('2026-11-22'), d02=D('2026-12-02'), d05=D('2026-12-05');
      if(d18!=null&&G.day>=d18&&G.day<=d05+2){ const until=T(d19,19+50/60);
        if(dating(G,'kexin')&&past(G,'2026-11-18',21)&&now(G)<until&&!PHONE.sent(G,'y2_kx_bad_exam'))
          PHONE.at(G,d18,21,[K('物權。'),K('我考壞了。'),Object.assign(K('……不要安慰我。'),{ask:{id:'y2_kx_bad_exam',until,opts:[{t:'明天晚上我過去。不安慰。',say:[K('……好。八點半，樓下。')],set:{KX_BAD_EXAM_GO:true}},{t:'好。不安慰。',say:[K('嗯。')],set:{KX_BAD_EXAM:'self'}}]}})],'y2_kx_bad_exam');
        if(F.KX_BAD_EXAM_GO===true&&typeof OUT!=='undefined'&&!OUT.get(G,'y2_kx_bad_exam')) OUT.plan(G,{id:'y2_kx_bad_exam',ev:'ev_kexin_bad_exam',day:d19,h:20.5,late:0.25,place:'木柵大學・宿舍樓下',title:'木柵大學・宿舍樓下 20:30',travel:'開車 約 40 分鐘',travelH:2/3});
        { const m=PHONE.byAsk(G,'y2_kx_bad_exam'); if(m&&m.ans==null&&now(G)>until&&!F.KX_BAD_EXAM) F.KX_BAD_EXAM='self'; }   /* 不回 */
        if(F.KX_BAD_EXAM==='self'&&dating(G,'kexin')&&!PHONE.sent(G,'y2_kx_bad_self')) PHONE.at(G,d22,22,[K('解決了。不用安慰我。')],'y2_kx_bad_self');
        if(dating(G,'kexin')&&past(G,'2026-12-02',21)&&!PHONE.sent(G,'y2_kx_bad_1202')){ const v=F.KX_BAD_EXAM;
          const L=v==='quiz'?[K('你上次出的太簡單。下次我出。')]:v==='study'?[K('（照片：那一章畫滿重點）'),K('這一章現在是我的。')]:v==='joke'?[K('你那句不動產，我在讀書會講了。'),K('只有予樂笑。')]:null;   /* 照片圖沒有：先用文字（AA_316 第 5 節）*/
          if(L) PHONE.at(G,d02,21,L,'y2_kx_bad_1202'); }
        if(F.KX_BAD_EXAM&&dating(G,'kexin')&&past(G,'2026-12-05',21+10/60)&&!PHONE.sent(G,'y2_kx_bad_1205')) PHONE.at(G,d05,21+10/60,[K('物權考壞的那一章，我講給予樂聽，講到她懂。')],'y2_kx_bad_1205'); } }   /* 12/5 摘要日 21:10（可昕手機小事的慣例時間，AA_336 B4）*/
    /* ---- 1B-02 語彤事件 8：傳了訊息的那天 21:30 ---- */
    { const dL=F.YT_LEASE_TEXT_DAY; if(typeof dL==='number'&&!PHONE.sent(G,'y2_yt_lease_2130')&&now(G)>=T(dL,21.5)) PHONE.at(G,dL,21.5,[Y('我拿給阿姨看了'),Y('她叫我把那一頁影印給她')].concat(dating(G,'heroine_03')?[Y('謝謝你')]:[]),'y2_yt_lease_2130'); }
    /* ---- 1B-03 語彤事件 9：都沒遇到＝6/12（六）21:00 私訊三句 ---- */
    { const d=D('2027-06-12'); if(d!=null&&G.day>=d&&G.day<=d+7&&past(G,'2027-06-12',21)&&!done(G,'ev_yt_aunt_consult')&&!has('heroine_03','RENT_CONSULTATION')&&knows('heroine_03',G)&&contact(G,'heroine_03')&&!PHONE.sent(G,'y2_yt_aunt_msg')){
        PHONE.at(G,d,21,[Y('前陣子我陪阿姨去法服。'),Y('裡面的人說，租約到期以前，他不能趕我們。'),Y('阿姨出來的時候在笑。')],'y2_yt_aunt_msg'); if(SOCIAL.remember) SOCIAL.remember('heroine_03','RENT_CONSULTATION','她傳訊息說陪阿姨去法服'); } }
    /* ---- 1B-05 子晴 Q8：沒碰到、或沒看過 Q6＝6/4（五）22:00（FRIEND 以上）---- */
    { const d=D('2027-06-04'); if(d!=null&&G.day>=d&&G.day<=d+7&&past(G,'2027-06-04',22)&&!done(G,'ev_ziqing_dad_visit')&&stageAt('heroine_04','FRIEND')&&contact(G,'heroine_04')&&!PHONE.sent(G,'y2_zq_dad_msg')){
        /* AA_255 第 7 節（C10，AA 定稿；AA_375 第 4 節提醒還沒進程式）：四則版——看過 Q6＝「他問我遊戲做好了沒」、沒看過（不提遊戲）＝「他問我最近在忙什麼 我說寫程式」；
           和子晴交往中最後多一則；回覆兩個。芷若×子晴交往中照用 */
        const q6=done(G,'ev_ziqing_secret_game')||has('heroine_04','PLAYTESTED');
        const L=[Z('我爸上禮拜來過'),Z('搭計程車來 搭計程車回去'),Z(q6?'他問我遊戲做好了沒':'他問我最近在忙什麼 我說寫程式'),Z('……我跟芷若去河堤走了一圈 沒事')].concat(dating(G,'heroine_04')?[Z('下次他來 你要不要在')]:[]);
        L[L.length-1]=Object.assign(L[L.length-1],{ask:{id:'y2_zq_dad_msg',opts:[{t:'沒事就好。',say:[Z('嗯'),Z('……其實有一點事 改天講')]},{t:'要不要出來走走？',say:[Z('今天不要'),Z('明天宵夜')]}]}});
        PHONE.at(G,d,22,L,'y2_zq_dad_msg'); F.ZQ_DAD_HEARD=true; } }
    /* ---- 1B-06 芷若 Z9：錯過最後一班＝9/2 出發那天 10:00 三則（FAMILIAR 以上、有聯絡方式）；TICKET_STUB 照樣有 ---- */
    { const d=D('2027-09-02'); if(d!=null&&G.day>=d&&G.day<=d+21&&past(G,'2027-09-02',10)&&!done(G,'ev_zhiruo_last_shift')&&!F.ZR_LAST_SHIFT&&stageAt('heroine_02','FAMILIAR')&&contact(G,'heroine_02')&&!PHONE.sent(G,'y2_zr_depart')){
        const L=!dating(G,'heroine_02')&&datingAny(G)?[R('今天出發去英國了。'),R('櫃台有一疊電影票根，常客一人一張，跟老闆拿。'),R('看完寫一句話，寄到店裡。我會回。')]:[R('今天出發去英國了。'),R('櫃台有一張電影票根，給你的，跟老闆拿。'),R('我不在的時候，去看一部電影。看完寫一句話給我。')];   /* 一疊票根那一版只給和別人交往中的（AA_338 第 0 節）；和芷若交往中、單身＝給你的那一張 */
        PHONE.at(G,d,10,L,'y2_zr_depart'); F.ZR_LAST_SHIFT='missed'; if(SOCIAL.remember) SOCIAL.remember('heroine_02','TICKET_STUB','她出發那天，櫃台的電影票根'); } }
    /* ---- 1B-07 可昕 K12：3/21（日）21:00 邀約；不回＝3/23（二）21:00 再一則；答應＝3/25（四）18:00 麵店（出遊）---- */
    { const d21=D('2027-03-21'), d23=D('2027-03-23'), d25=D('2027-03-25');
      if(d21!=null&&G.day>=d21&&G.day<=d25){ const until=T(d25,17.75);
        if(dating(G,'kexin')&&past(G,'2027-03-21',21)&&now(G)<until&&!PHONE.sent(G,'y2_kx_circles'))
          PHONE.at(G,d21,21,[K('兩邊的朋友該見面了。'),K('週四晚上六點，你們的麵店。'),Object.assign(K('我負責予樂，你負責阿哲。'),{ask:{id:'y2_kx_circles',until,opts:[{t:'好。',say:[K('好。我先跟予樂說，她會穿得很像要去面試。')],set:{KX_CIRCLES_GO:true}},{t:'那天不行。',say:[K('……好。那下次。')],set:{KX_CIRCLES_GO:false}}]}})],'y2_kx_circles');
        { const m=PHONE.byAsk(G,'y2_kx_circles'); if(m&&m.ans==null&&past(G,'2027-03-23',21)&&now(G)<until&&!PHONE.sent(G,'y2_kx_circles2')) PHONE.at(G,d23,21,[K('週四。六點。你還沒回。')],'y2_kx_circles2'); }
        if(F.KX_CIRCLES_GO===true&&typeof OUT!=='undefined'&&!OUT.get(G,'y2_kx_circles')) OUT.plan(G,{id:'y2_kx_circles',ev:'ev_kexin_two_circles',day:d25,h:18,late:0.25,place:'阿鳳麵店',title:'阿鳳麵店 18:00',travel:'走過去 約 10 分鐘',travelH:1/6}); } }
    /* ---- 1B-08 語彤事件 12：9/14（二）12:10 她私訊（FRIEND 以上）；18:30 以前沒到總圖門口＝20:00 兩則 ---- */
    { const d=D('2027-09-14'); if(d!=null&&(G.day===d||G.day===d+1)){
        if(G.day===d&&stageAt('heroine_03','FRIEND')&&contact(G,'heroine_03')&&past(G,'2027-09-14',12+10/60)&&hh(G)<17.5&&!PHONE.sent(G,'y3_yt_umb_noon'))
          PHONE.at(G,d,12+10/60,[Y('今天下午第一次上台'),Object.assign(Y('氣象說傍晚會下雨'),{ask:{id:'y3_yt_umb_noon',until:T(d,17.5),opts:[{t:'加油！！！',set:{YT12_CHEER:true}},{t:'講完跟我說。',say:[Y('嗯')]}]}})],'y3_yt_umb_noon');
        if(past(G,'2027-09-14',18.5)&&!done(G,'ev_yt_umbrella_y3')&&!F.YT_UMBRELLA_Y3&&stageAt('heroine_03','FRIEND')){ F.YT_UMBRELLA_Y3='missed'; if(contact(G,'heroine_03')) PHONE.at(G,d,20,[Y('今天講完了'),Y('……傘我自己有帶')],'y3_yt_umb_missed'); } } }
    /* ---- 1B-09 子晴 Q10：11/8（一）21:00 她私訊（FRIEND 以上）＋出發提醒（11/9 19:30 兩點半）；20:00 以前沒到＝21:00「我自己選了。」---- */
    { const d8=D('2027-11-08'), d9=D('2027-11-09'); if(d8!=null&&G.day>=d8&&G.day<=d9+1){
        if(stageAt('heroine_04','FRIEND')&&contact(G,'heroine_04')&&past(G,'2027-11-08',21)&&now(G)<T(d9,19.25)&&!PHONE.sent(G,'y3_zq_q10')){
          PHONE.at(G,d8,21,[Z('我有兩個專題，只能交一個。'),Z('明天晚上七點半，兩點半。你來幫我看一下。')],'y3_zq_q10');
          if(typeof OUT!=='undefined') OUT.plan(G,{id:'y3_zq_q10',day:d9,h:19.5,late:0.5,early:0.25,place:'兩點半 Café',title:'兩點半 Café 19:30',travel:'走過去 約 10 分鐘',travelH:1/6,goto:{zone:'cafe',x:0,z:5,yaw:Math.PI}}); }
        if(past(G,'2027-11-09',20)&&!done(G,'ev_ziqing_capstone')&&!F.ZQ_Q10&&stageAt('heroine_04','FRIEND')){ F.ZQ_Q10='self'; F.ZQ_MUSIC_CREDIT=true; if(contact(G,'heroine_04')) PHONE.at(G,d9,21,[Z('我自己選了。……其實本來就差不多決定了。')],'y3_zq_q10_self'); } } }
    /* ---- 1B-11 沛珊：消失期傳過訊息的（沒交往）＝2027-08-07 21:00 她打來（AA_296 2-3-1 ④，企劃線 3f406dbc；原本是回兩則私訊）；沒接＝原本那兩則（S.psBackPhone）---- */
    { const d=D('2027-08-07'); if(d!=null&&G.day>=d&&G.day<=d+60&&now(G)>=T(d,S.PS_CALL.h-S.PS_CALL.lead)&&F.PS_BACK_READ==null&&!dating(G,'classmate_peishan')){
        const a=D('2026-12-18'), b=D('2027-08-06'); const sentAbs=(G.msgs||[]).some(m=>m.th==='p:classmate_peishan'&&m.from==='player'&&m.day>=a&&m.day<=b);
        if(sentAbs) S.psBackPhone(G,d); else if(past(G,'2027-08-07',21)) F.PS_BACK_READ=false; } }   /* false＝看過了、她沒有要回的（不再每次掃訊息）*/
    /* ---- 沛珊大三上第 6 週的私訊（AA_349 K9、AA_312 第 1 點；BB_98 第 12 點的時間 10/15（五）21:00）：已經重新聯絡上的玩家（交往中也算；presence 不是 lost）；第二句留 ---- */
    { const d=D('2027-10-15'), id='classmate_peishan'; if(d!=null&&G.day>=d&&G.day<=d+2&&past(G,'2027-10-15',21)&&!PHONE.sent(G,'ps_y3_bookstore')&&contact(G,id)&&typeof STORY!=='undefined'&&STORY.presence&&!STORY.presence(id,G).lost)
        PHONE.at(G,d,21,[P('我在學校附近的二手書店打工了。週末都在。'),P('……你不用特地來，我只是說一聲。')],'ps_y3_bookstore'); }
    if(typeof HV!=='undefined'&&HV.museumPhone) HV.museumPhone(G);   /* 沛珊大三起：她主動約「台南・美術館」（AA_349 K3，hometown3d.js）*/
  };

  /* ===================== 1B-11 沛珊回來：2027-08-07 21:00 她打來（AA_296 2-3-1 ④，企劃線 3f406dbc）=====================
     消失期（2026-12-18～2027-08-06）傳過訊息、沒交往的玩家：原本是兩則私訊「……這半年我都沒看手機。對不起。」「我現在很好。」——她消失半年以後第一次出現，改成她打來（ev_peishan_back_call）。
     電話照 r2y3b3d.js 那幾通的寫法（OUT：接起來、沒有「不去了」）；前 2 小時才排（手機「今天」不會一早就寫著她要打來；放假在家快轉每小時跑一次規則也停得到），不跳「排進行程」。
     沒接（睡著、在忙、在出遊或劇情中，過了 30 分鐘）＝原本那兩則私訊。接了、沒接都記 PS_BACK_READ＝那一天（放榜以後重新聯絡上：r2y4b3d.js psReconnected 讀）*/
  S.PS_CALL={id:'y3_ps_back_call',ev:'ev_peishan_back_call',h:21,late:0.5,lead:2};
  /* 跳過時間停在她打來的時間（AA 10-22 08:41；睡覺照舊算沒接）：條件同上面 1B-11 那一段（消失期傳過訊息、沒交往、還沒回）*/
  if(typeof CLS!=='undefined'&&CLS.STOP_FNS) CLS.STOP_FNS.push(G=>{ const F=G.flags||{}, d=D('2027-08-07'); if(d==null||G.day!==d||F.PS_BACK_READ!=null||dating(G,'classmate_peishan')) return []; const a=D('2026-12-18'), b=D('2027-08-06'); if(!(G.msgs||[]).some(m=>m.th==='p:classmate_peishan'&&m.from==='player'&&m.day>=a&&m.day<=b)) return []; const q=typeof OUT!=='undefined'?OUT.get(G,S.PS_CALL.id):null; if(q&&q.state!=='planned') return []; return [{h:S.PS_CALL.h,why:'手機響了'}]; });
  S.psBackPhone=function(G,d){ const C=S.PS_CALL, O=typeof OUT!=='undefined'?OUT:null, t=T(d,C.h), q=O?O.get(G,C.id):null;
    if(!q){ if(O&&G.day===d&&now(G)>=t-C.lead&&now(G)<t+C.late) O.plan(G,{id:C.id,ev:C.ev,day:d,h:C.h,late:C.late,must:true,place:'電話',title:'沛珊打電話來',verb:'接起來',call:true,travel:'',travelH:0,back:'電話掛了。',silent:true});
      else if(now(G)>=t+C.late) S.psBackMissed(G); return; }   /* 那一段沒跑到規則（讀檔、整段在別的劇情裡）＝照原本那兩則 */
    if(q.state==='missed'||(q.state==='planned'&&now(G)>t+C.late)){ q.state='missed'; S.psBackMissed(G); } };   /* 人在家的時候 OUT.tick 不跑：過了時間這裡自己記沒接 */
  S.psBackMissed=function(G){ const F=G.flags, d=D('2027-08-07'); if(!F||F.PS_BACK_READ!=null||d==null||typeof PHONE==='undefined') return; PHONE.at(G,d,21,[P('……這半年我都沒看手機。對不起。'),P('我現在很好。')],'ps_back_read'); F.PS_BACK_READ=d; };
  S.psBackAnswered=function(G){ const F=G.flags, d=D('2027-08-07'); if(F&&F.PS_BACK_READ==null&&d!=null) F.PS_BACK_READ=d; };
  /* ===================== 1B-11 沛珊：放榜以後，玩家第一次傳訊息給她（沒交往）＝「好久不見。……我現在在台南。」「你要來的話，跟我說。」（包住 MSG.send）=====================
     AA_349 K1：分開寫——她在台中＝「好久不見。……我現在在台中，開學以後在台南。」；在台南＝原文。兩種都接「你要來的話，跟我說。」（看她回的那一天）
     AA_350 P1（2026-10-21）：不只 8/7～9/3——之後的寒暑假（她在台中）第一次回也是台中那一句；學期中照原文。在哪照 STORY.presence（手機「現在大概在」、去找她同一套：city／home 是台中）*/
  S.psTaichung=(G,day)=>{ if(typeof STORY==='undefined'||!STORY.presence) return false; const p=STORY.presence('classmate_peishan',Object.assign({},G,{day}))||{}; return (p.city||p.home)==='台中'; };
  S.psFirstDue=G=>!!G&&!!G.flags&&law(G)&&!G.flags.PS_BACK_FIRST&&D('2027-08-07')!=null&&G.day>=D('2027-08-07')&&!dating(G,'classmate_peishan');
  S.psFirst=function(G,id,topic,sub){ if(typeof MSG==='undefined'||typeof PHONE==='undefined') return null; if(!MSG.canSend(G,id)||!MSG.topics(G,id).some(q=>q.k===topic)) return null;
    const text=MSG.playerText(G,id,topic,sub), th='p:'+id; PHONE.post(G,{th,from:'player',who:null,text}); const Rc=MSG.rec(G); Rc.sent[id]=G.day;
    const at=MSG.replyAt?MSG.replyAt(G,id):{day:G.day,h:G.hour%24+0.25}, tc=S.psTaichung(G,at.day);
    PHONE.at(G,at.day,at.h,[P(tc?'好久不見。……我現在在台中，開學以後在台南。':'好久不見。……我現在在台南。'),P('你要來的話，跟我說。')],'ps_back_first'); G.flags.PS_BACK_FIRST=G.day; return {ok:true,text,at}; };
  /* 去台南的那一天（AA_282 3-1，原文）：presence 改台南、邀約目的地台南要一起做（AA_282 第 5 節）——2026-10-21 已接：presence「在台南」在 characters.js，演出照 hometown3d.js 的結構（PS_TAINAN_VISITS）；AA_507 0-2 第 8 點更新註解 */
  S.PS_TAINAN={ first:[{narr:'（台南車站。她站在出口，兩手各拿一杯飲料。）'},'{name}！這杯你的。這邊的紅茶很甜喔，你先喝一口。',{scene:'台南・她的學校'},'這是我們學校。很小吧？走一圈十分鐘。','欸，你覺得我有沒有哪裡不一樣？'],
    firstOpts:[{t:'曬黑了。',say:['對！這裡的太陽跟台中不一樣。']},{t:'頭髮剪短了？',say:['上個月剪的。我室友到現在都還沒發現。']}],
    send:{narr:'（傍晚，她陪你坐車到高鐵站。）',dating:['下次待久一點。末班車太早了。'],other:['謝謝你跑這麼遠！到臺北傳給我喔。']},
    again:[{key:'books',scene:'台南・她打工的二手書店',lines:['這一區是我排的。你看得出來照什麼排的嗎？','……照書背的顏色。老闆說隨便我。']},{key:'food',scene:'台南・老街',lines:['我室友說這攤一定要吃。……其實我也是第一次來。']},{key:'canal',scene:'台南・運河邊',lines:['欸，那艘船是不是一直停在那裡？','它在等什麼啊？']}] };

  /* ===================== 1B-02 語彤事件 8：債各第 6 週（2027-03-29）那一堂，第 6 週的課堂那一句後面、下課之前（CLS.IN_CLASS）===================== */
  S.leaseClass=async function(GM,it,prof,ct){ const G=GM.G; if(!it||!it.c||it.c.id!=='oblig_spec'||it.exam||!law(G)||typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day); if(!t||t.id!=='Y2S2'||t.week!==6||done(G,'ev_yt_lease_class')) return false;
    const pre=prof?'':((ct&&ct.prof)||(typeof CLS!=='undefined'&&CLS.profName?CLS.profName(it.c):'葉教授'))+'：';
    await GM.say(prof||null,pre+'房子賣了，房客怎麼辦？法律說：住進去了，租約就跟著房子走。新屋主要接著當房東。');
    await GM.say(prof||null,pre+'換句話說，法律給了房客一樣東西：時間。');
    if(knows('heroine_03',G)) await GM.say(null,has('heroine_03','RENT_RUMOR')?'（你想起去年在麵店，那個拿捲尺量店面的人。）':'（坐在前兩排的語彤，忽然低頭寫筆記，寫了很久。）');
    mark(G,'ev_yt_lease_class'); G.flags.Y2B_LEASE_DAY=G.day; return true; };   /* 下課後的傳訊息：y2b_events.js 的 ev_yt_lease_text（afterClass）*/

  /* ===================== 1B-03 語彤事件 9 在場版：2027-05-22（六）法服值班（包住 STORY.fafuShift：那天值班那一段換成這一場，其他的值班旁白不演）===================== */
  /* 阿姨知道（大一下事件 4 演的是交往版）：YT_AUNT_KNOWS（events.js 的 ev_yutong_absent 交往版設）；舊存檔看那條記憶的備註 */
  S.auntKnows=G=>{ if(G.flags&&G.flags.YT_AUNT_KNOWS) return true; const L=G.social&&G.social.mem&&G.social.mem.heroine_03; return !!(L&&L.some(m=>/阿姨說她怕你來幫忙/.test(m.note||''))); };
  S.auntDue=G=>{ const d=D('2027-05-22'); return d!=null&&G.day===d&&law(G)&&typeof STORY!=='undefined'&&!!STORY.fafuShiftable&&STORY.fafuShiftable(G)&&!done(G,'ev_yt_aunt_consult')&&knows('heroine_03',G); };
  S.auntConsult=async function(GM){ const G=GM.G, F=G.flags; if(!S.auntDue(G)) return false;
    F.LAWCLUB_SAT_LAST=G.day; F.LAWCLUB_SAT_VISITS=(F.LAWCLUB_SAT_VISITS|0)+1; F.FAFU_SHIFT_N=(F.FAFU_SHIFT_N|0)+1; mark(G,'ev_yt_aunt_consult');   /* 值班照樣算一次（同 S.fafuShift）*/
    const yt=who('heroine_03'), bh=who('classmate_bohan'), aunt={name:'阿姨'}, me={name:G.name||'祐廷'}, dt=dating(G,'heroine_03'), aK=dt&&S.auntKnows(G);
    GM.sceneBegin(); try{ if(typeof ADV!=='undefined'&&ADV.begin){ if(ADV.preload) ADV.preload(['heroine_03','classmate_bohan']); ADV.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg('wancai_seminar'):'blur',right:{charId:'heroine_03',expression:'neutral'},left:{charId:'classmate_bohan',expression:'serious'}}); }
      await GM.say(null,'（法律系館B的諮詢室。門開了，進來的是阿鳳阿姨，後面跟著語彤。）');
      await GM.say(yt,'（看到你，停了一下）……嗯。我陪阿姨來的。');
      await GM.say(bh,'你們認識？');
      if(aK){ await GM.say(aunt,'認識啊，我們語彤的男朋友。'); await GM.say(yt,'阿姨。'); await GM.say(bh,'……喔。那這件你不要做紀錄，坐旁邊聽就好。紀錄我自己來。'); await GM.say(null,'（你把筆放下。語彤沒有看你，耳朵有點紅。）');
        if(typeof ROM!=='undefined'&&ROM.learn) ROM.learn(G,'classmate_bohan','heroine_03','aunt_consult'); }   /* 柏翰知道了（不往下傳，AA_218 17-10）*/
      else { await GM.say(me,'我常去她們店裡吃麵。'); await GM.say(bh,'好。那紀錄你照做，意見我來講。'); }
      await GM.say(bh,'阿姨，先跟您說，我們都是學生。今天講的，之後會請指導律師再看一次。');
      await GM.say(aunt,'學生好啊。學生比較有耐心。');
      await GM.say(null,'（阿姨把租約攤在桌上。語彤把它轉過來，對著柏翰。）');
      await GM.say(bh,'（翻到最後一頁）書面的，五年，還有……快兩年。您一直住在店裡、做生意，對吧？');
      await GM.say(aunt,'每天。過年也開。');
      await GM.say(bh,'那這樣。房子賣了，租約跟著房子走。新屋主要接著當房東，到期以前，他不能叫你們搬。');
      await GM.say(aunt,'仲介說他要租給連鎖店。');
      await GM.say(bh,'那是到期以後的事。到期以前，他要等。');
      await GM.say(bh,'這快兩年，可以拿來準備怎麼跟他談續約。');
      await GM.say(aunt,'談？跟屋主談？我煮麵的耶。');
      await GM.say(yt,'阿姨，所以才要準備。');
      await GM.say(null,'（阿姨看了她一眼，笑出來。第一次。）');
      await GM.say(aunt,'好啦，聽妳們的。');
      if(typeof ADV!=='undefined'&&ADV.hide) ADV.hide('left'); if(GM.caption) GM.caption('','法律系館B門口',2400);   /* 散會。萬才館門口，阿姨先去騎車 */
      await GM.say(yt,'剛剛他講的那個，我這學期也在上。');
      await GM.say(yt,'在課本上看的時候，覺得好整齊。坐在阿姨旁邊聽，就不整齊了。');
      const k=await GM.choose([{t:'「整齊的部分，我可以再講給妳聽。」'},{t:'「阿姨會沒事的。」'},{t:'「妳要不要先陪阿姨回去？」'}]);
      if(k===0){ await GM.say(yt,'今天先不要。'); await GM.say(yt,'今天我只想陪阿姨。'); if(SOCIAL.remember) SOCIAL.remember('heroine_03','IMPORTANT_CONVERSATION','陪阿姨來法服那天'); if(dt) await GM.say(yt,'晚上再講。打給我。'); }
      else if(k===1){ await GM.say(yt,'你又不知道。'); await GM.say(null,'（停了一下。）'); await GM.say(yt,'……不過她剛剛在笑。所以應該是好消息。'); if(dt) await GM.say(yt,'……你陪我送她回店裡。'); }
      else { await GM.say(yt,'她叫我去念書。說今天不用顧店。'); await GM.say(yt,'我現在念不下去。……陪我走一段。'); await GM.say(null,'（你們走到公館的路口，她都沒有再說話。）'); if(dt) await GM.say(null,'（她的手碰了一下你的手背，又收回去。）'); }
      if(SOCIAL.remember) SOCIAL.remember('heroine_03','RENT_CONSULTATION','陪阿姨來法服諮詢的那天'); }
    finally { if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); }
    if(GM.advance) GM.advance(1); if(GM.memo) GM.memo('陪阿姨來法服'); if(GM.autosave) GM.autosave(); return true; };

  /* ===================== 1B-10 芷若 Z10 明信片（她在英國的那一學期；刻意不用手機）===================== */
  /* 9/24、10/22、11/19、12/17（週五）中午以後：一般＝宿舍書桌上（她 FAMILIAR 以上）；和別人交往中＝寄到 Café、抬頭「兩點半的常客們」、貼在吧檯旁的牆上；和她交往中＝寄給你，12/17 背面多一行 → 12/25 20:00 視訊。
     每張可以回一次（四個選項各用一次）；期限到下一張寄到以前，12/17 那張到 1/7。記 ZR_CARDS_SENT＝[選項…]；兩張以上記憶 POSTCARDS（寄到 Café 的寫了一句＝POSTCARDS_GROUP）。明信片插畫沒有＝文字 */
  S.PC=[ {key:'2027-09-24',text:['倫敦一直下雨。今天在一間十二個座位的戲院看《慢車到海邊》。全場只有我是台灣人。我哭了。不要笑。'],missed:['到倫敦了。這學期在這裡交換。','櫃台那張票根，是要你去看一部電影，看完寫一句話給我。'],back:'9/28，台灣晚上十點。打給我。'},   /* back：背面多一行（AA_336 B6；寄給他本人的版本才有，寄到 Café 的常客版沒有）*/
    {key:'2027-10-22',text:['這裡的同學問我最喜歡哪部電影。我說了我自己的那一部。他們都沒看過。']},
    {key:'2027-11-19',text:['我媽改成下午三點打給我。她說，台中十一點，剛好收店。']},
    {key:'2027-12-17',text:['你看了什麼？你還沒寄給我。'],group:['你們看了什麼？還沒有人寄給我。'],gfBack:'12/25，台灣晚上八點。打給我。',until:'2028-01-07'} ];
  S.PC_OPTS=[ {id:'film',t:'我去看了《進城的那一週》。散場的時候，想到妳說的落差。',ok:()=>has('heroine_02','WATCHED_FILM')||has('heroine_02','WATCHED_FILM_GROUP')},   /* 「妳說的落差」是早場那一次說的 */
    {id:'slow',t:'《慢車到海邊》妳說妳哭了。我沒哭。第二次看才哭。'},
    {id:'loud',t:'票根我用了。是一部很吵的片。妳一定會討厭。',alt:{id:'quiet',t:'我看了妳明信片上那部。好安靜。'},useAlt:()=>!has('heroine_02','TICKET_STUB')},
    {id:'blank',t:'我還沒看。先寄一張空白的。'} ];
  S.pcRec=G=>{ const F=G.flags; if(!F.ZR_PC||typeof F.ZR_PC!=='object') F.ZR_PC={ver:{},read:{},sent:{}}; return F.ZR_PC; };
  S.pcVer=G=>dating(G,'heroine_02')?'gf':(datingAny(G)?'cafe':'dorm');
  /* 寄到了的明信片（到了那天中午；FAMILIAR 以上）：第一次寄到的時候定版本 */
  S.pcCards=function(G){ if(!law(G)||!stageAt('heroine_02','FAMILIAR')) return []; const Rr=S.pcRec(G), out=[];
    S.PC.forEach((c,i)=>{ const d=D(c.key); if(d==null||now(G)<T(d,12)) return; if(!Rr.ver[c.key]){ const v=S.pcVer(G); if(c.key==='2027-12-17'&&v==='dorm'&&(G.flags.ZR_CARDS_SENT||[]).length) return; Rr.ver[c.key]=v; }   /* 12/17：一般版只在還沒回寄的時候寄 */
      const nx=S.PC[i+1], end=c.until?T(D(c.until),24):T(D(nx.key),12); out.push(Object.assign({},c,{day:d,ver:Rr.ver[c.key],end})); });
    return out; };
  S.pcOpts=function(G){ const used=G.flags.ZR_CARDS_SENT||[]; const out=[]; for(const o of S.PC_OPTS){ const x=o.useAlt&&o.useAlt()?o.alt:o; if(used.includes(o.id)||used.includes(x.id)) continue; if(o.ok&&!o.ok()) continue; out.push(x); } return out; };
  S.pcCanReply=(G,c)=>!S.pcRec(G).sent[c.key]&&now(G)<c.end&&S.pcOpts(G).length>0;
  S.pcLines=function(G,c){ const L=[]; if(c.ver!=='cafe'&&c.key==='2027-09-24'&&G.flags.ZR_LAST_SHIFT==='missed') L.push(...c.missed);
    if(c.key==='2027-12-17'){ if(c.ver==='cafe') L.push(...c.group); else if(!(G.flags.ZR_CARDS_SENT||[]).length) L.push(...c.text); if(c.ver==='gf') L.push(c.gfBack); }
    else { L.push(...c.text); if(c.back&&c.ver!=='cafe') L.push(c.back); } return L; };
  S.pcPending=function(G){ const Rr=S.pcRec(G); return S.pcCards(G).filter(c=>!Rr.read[c.key]||S.pcCanReply(G,c)); };
  const PC_ZONE={dorm:'dorm',gf:'dorm',cafe:'cafe'};
  S.pcPlace=function(GM){ const G=GM.G, E=GM.E; if(!E||!E.interactables) return; const P=S.pcPending(G).filter(c=>PC_ZONE[c.ver]===G.zone), k=E.interactables.findIndex(it=>it.zrPostcard);
    if(!P.length){ if(k>=0) E.interactables.splice(k,1); return; } if(k>=0) return;
    let x=0.7, z=-2.3; if(G.zone==='cafe'){ const c=E.interactables.find(it=>it.counter==='cafe'); if(c){ x=c.x-1.2; z=c.z; } else { x=0; z=2; } }
    else { const d=E.interactables.find(it=>it.deskStudy), sp=E.zone&&E.zone.spots&&E.zone.spots.pothos; if(d){ x=d.x+0.35; z=d.z+0.35; } else if(sp){ x=sp[0]-0.4; z=sp[1]; } }
    E.interactables.push({x,z,radius:0.7,label:G.zone==='cafe'?'牆上的明信片':'明信片',zrPostcard:true,onInteract:()=>{ S.pcScene(GM).catch(e=>console.warn('Y2B postcard',e)); }}); };
  S.pcScene=async function(GM){ const G=GM.G, F=G.flags, Rr=S.pcRec(G); const P=S.pcPending(G).filter(c=>PC_ZONE[c.ver]===G.zone); const c=P.find(q=>!Rr.read[q.key])||P[P.length-1]; if(!c) return false;
    const card={name:c.ver==='cafe'?'明信片（兩點半的常客們）':'明信片'};
    GM.sceneBegin(); try{ if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'blur'});
      for(const t of S.pcLines(G,c)) await GM.say(card,'「'+t+'」');
      Rr.read[c.key]=G.day;
      if(c.ver==='gf'&&c.key==='2027-12-17'&&typeof OUT!=='undefined'){ const d=D('2027-12-25'); OUT.plan(G,{id:'y3_zr_xmas_video',ev:'ev_zhiruo_xmas_video',day:d,h:20,late:0.5,place:'視訊',verb:'接起來',no:'今天先不要',back:'視訊結束。',title:'和芷若視訊（倫敦中午 12:00）',travel:'',travelH:0}); }
      if(S.pcCanReply(G,c)){ const O=S.pcOpts(G); const k=await GM.choose(O.map(o=>({t:'「'+o.t+'」'})).concat([{t:'（先不回）'}]));
        if(k>=0&&k<O.length){ const o=O[k]; Rr.sent[c.key]=o.id; (F.ZR_CARDS_SENT||(F.ZR_CARDS_SENT=[])).push(o.id);
          if(c.ver==='cafe'){ if(!has('heroine_02','POSTCARDS_GROUP')&&SOCIAL.remember) SOCIAL.remember('heroine_02','POSTCARDS_GROUP','寫了一句，寄到英國的大明信片'); }
          else if(F.ZR_CARDS_SENT.length>=2&&!has('heroine_02','POSTCARDS')&&SOCIAL.remember) SOCIAL.remember('heroine_02','POSTCARDS','回寄了明信片');
          if(GM.toast) GM.toast('寄出了。',2200); } } }
    finally { if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); }
    S.pcPlace(GM); if(GM.autosave) GM.autosave(); return true; };

  /* ===================== 1B-10 芷若英國的生日（AA_336 B6；BB_124 第 1 節「她在國外」2027）=====================
     9/24 那張明信片背面「9/28，台灣晚上十點。打給我。」（S.PC 的 back）：只有收到明信片的人有＝讀過 9/24 那張、而且是寄給他本人的版本（宿舍／交往；寄到 Café 的「兩點半的常客們」沒有）。
     9/28 21:55 系統字＋「打給她。」「不打。」（到 22:30 都還會問；在家、在劇情裡、睡著了＝這一通沒有）；打了＝22:00 視訊（倫敦 15:00，y2b_events.js 的 ev_zhiruo_bday_video 三句）。
     記 ZR_BDAY_CALL={2027:true}（不打＝false，不再問）；不打、或沒收到明信片：沒有這一通，不另外補 */
  S.BDAY={key:'2027-09-28',card:'2027-09-24',h:21+55/60,until:22.5,year:2027};
  S.bdayCard=G=>{ const Rr=S.pcRec(G), k=S.BDAY.card; return !!Rr.read[k]&&!!Rr.ver[k]&&Rr.ver[k]!=='cafe'; };
  S.bdayDue=G=>{ if(!G||!G.flags||!law(G)) return false; const d=D(S.BDAY.key); if(d==null||G.day!==d) return false; const hr=hh(G); if(hr<S.BDAY.h||hr>=S.BDAY.until) return false;
    const C=G.flags.ZR_BDAY_CALL; if(C&&typeof C==='object'&&C[S.BDAY.year]!=null) return false; return S.bdayCard(G); };
  S.bdayCall=async function(GM){ const G=GM.G, F=G.flags; let k=1;
    GM.sceneBegin(); try{ await GM.say(null,'（明信片背面寫著：台灣晚上十點。）'); k=await GM.choose([{t:'打給她。'},{t:'不打。'}]); } finally { GM.sceneEnd(); }
    F.ZR_BDAY_CALL=Object.assign({},F.ZR_BDAY_CALL&&typeof F.ZR_BDAY_CALL==='object'?F.ZR_BDAY_CALL:{},{[S.BDAY.year]:k===0});
    if(k!==0||typeof OUT==='undefined') return false;
    OUT.plan(G,{id:'y3_zr_bday_call',ev:'ev_zhiruo_bday_video',day:D(S.BDAY.key),h:22,late:0.5,place:'視訊',verb:'接起來',no:'今天先不要',back:'視訊結束。',title:'和芷若視訊（倫敦下午 3:00）',travel:'',travelH:0});
    const q=OUT.get(G,'y3_zr_bday_call'); if(q&&q.state==='planned') await OUT.go(GM,q);   /* 自己打過去：不再問「接起來」，直接到 22:00 演 */
    return true; };
  let bdayBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['y2b3d:bdayBusy']=()=>{ bdayBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */

  /* ===================== 每 0.5 秒（STORY.TICKS；只有芷若生日那一通會開劇情＝回傳 true，其他回傳 false）===================== */
  S.tick=function(GM,dt){ const G=GM&&GM.G; if(!G||!G.flags||!law(G)) return false;
    { const d=D('2027-09-14'); if(d!=null&&G.day===d&&hh(G)>=17&&G.weather!=='rain'){ G.weather='rain'; if(GM.E&&GM.E.setWeather) GM.E.setWeather('rain'); } }   /* 1B-08 事件 12：那天傍晚一定下雨（AA_321 第 6 節）*/
    { const d=D('2027-11-09'); if(d!=null&&G.day===d&&G.zone==='cafe'&&typeof OUT!=='undefined'){ const q=OUT.get(G,'y3_zq_q10'); if(q&&q.state==='planned') q.state='done'; } }   /* 1B-09：自己走到 Café 了，不用再問「出發」*/
    if(G.zone==='dorm'||G.zone==='cafe') S.pcPlace(GM);   /* 1B-10 明信片 */
    if(!bdayBusy&&S.bdayDue(G)&&!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))){ bdayBusy=true; S.bdayCall(GM).catch(e=>console.warn('Y2B 芷若生日',e)).finally(()=>{ bdayBusy=false; }); return true; }   /* 1B-10 芷若英國的生日（AA_336 B6）*/
    return false; };

  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push((G,GM)=>S.phone(G,GM));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));
    if(STORY.fafuShift&&!STORY._y2bFafu){ const orig=STORY.fafuShift; STORY.fafuShift=async function(GM){ if(S.auntDue(GM.G)) return S.auntConsult(GM); return orig.apply(this,arguments); }; STORY._y2bFafu=true; } }
  if(typeof CLS!=='undefined'&&Array.isArray(CLS.IN_CLASS)){ const f=(GM,it,prof,ct)=>S.leaseClass(GM,it,prof,ct); f.due=(G,it)=>!!it&&!!it.c&&it.c.id==='oblig_spec'&&!it.exam&&law(G)&&it.term==='Y2S2'&&it.week===6&&!done(G,'ev_yt_lease_class'); CLS.IN_CLASS.push(f); }   /* due：學期中的快轉（src/semff3d.js）停在這一堂前面 */
  if(typeof MSG!=='undefined'&&MSG.send&&!MSG._y2b){ const orig=MSG.send; MSG.send=function(G,id,topic,sub){ if(id==='classmate_peishan'&&S.psFirstDue(G)){ const r=S.psFirst(G,id,topic,sub); if(r) return r; } return orig.apply(this,arguments); }; MSG._y2b=true; }
  return S;
})();

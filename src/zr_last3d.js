/* ===== 芷若：出國前的最後一場（2028-08-26；AA_387 定稿，企劃線 608b9adc；任務 BB119-Y4-1017、USER_WANTS D53）：接線 =====
   台詞、事件在 src/data/zr_last_events.js（照稿不改字）。使用者 10-17 選甲：這一場是「告白只在學期末」的例外，可以告白；10-18 選「美國路線不做」。這個檔：
   - 條件（第 1 節，S.cond）：不是美國路線、8/26 祐廷在臺灣（日本路線 8/5 回國，照常）；她的心意條件＝ZRZQ.heartOk（學期末心意邀約的 TERMEND.cond＋C8；C7 國外不看，她 9/2 才走）；
     她單身（不是 ZZ_DATING、不是 ZR_FY）；杯子那一場沒有演過（ZR_CUP 沒有值）；只演一次、錯過不補（ZR_LAST 沒有值、邀約還沒傳過）。在 8/24 21:00 傳邀約的那一刻算。
   - 手機（STORY.PHONE_RULES，S.phone）：第 2 節 8/24（四）21:00 她私訊 →「好。」＝記 ZR_LAST_GO、排出遊；「那天不行。」＝ZR_LAST 'no'；回覆到 8/25（五）18:00，沒回＝18:00 她傳「不行」那一句、ZR_LAST 'no'。
     第 7 節：回「好」但 19:45 還沒到（出遊系統 late 0.25＝19:45 以後不能出發；「不去了」也算）＝ZR_LAST 'missed'，19:45、22:00 兩則；不延、不補、沒有房間物件。兩種都不扣關係。
     第 5 節：演過第 4 節（wait／keep）＝當晚 23:00 兩則（兩版）；交往的（wait，9/1 那時還在交往）多 9/1（五）21:00 兩則。先收著的不另外傳。
   - 出遊（OUT，第 3 節）：8/26（六）19:30 公館二輪戲院，從宿舍走過去約 15 分鐘，2.5 小時；暑假在臺北的家＝出遊系統照家裡出發算（OUT.trip，捷運＋公車）。alarm：跳過時間、睡覺停在出發前。
   - 結果（第 4 節；事件的 after → S.result）：「我等妳回來。」＝交往，照學期末心意邀約「說出來」答應那一欄（termend3d.js walkHome 的 start：ROM.start（交往那天＝8/26）、
     她知道祐廷和別人交往還約了＝OPEN_OK、confessed、清掉讓我想想）；英國那一年照現有的「交往中」（msg3d.js ukRow／ukDaily、r2y4a3d.js 明信片的 zrLate），這裡不另做。
     「我先收著。」＝學期末心意邀約的「讓我想想」那一欄（TERMEND.rec(G).think.heroine_02＝大三下；她回國以後的學期末用第二次的邀約 invite2）。
     關係數值：學期末心意邀約「說出來」那一套（答應、讓我想想）程式裡沒有加減，這裡也不加（第 4 節「不另訂數字」）。
   - 房間物件「她的票根」（第 6 節）：演過第 4 節（ZR_LAST wait／keep）＝宿舍書桌「看看房間裡的東西」多一件（STORY.ROOM_EXTRA）。
     分開以後的「收拾」（BB_119 9-4）照她現有的那一項；收拾的三選一還沒做（V6-S4），這一張不另外處理、留在房間。
   存檔：G.flags.ZR_LAST（wait／keep／missed／no）、ZR_LAST_GO（回了「好。」，出遊排好了沒到才看得出 missed）；記憶 ZR_LAST_SCREENING（social3d.js MEMORY_LABEL）。
   方奕廷那一段（第 8 節：F3 那天她心裡是祐廷＝拒絕，ZR_F3_NO）在 src/zrzq3d.js 的 S.f3Sync、src/data/r2y3b_events.js 的 ev_zhiruo_f3_cafe。
   測試：node tests/aa387_zr_last_unit.js */
'use strict';
const ZRLAST=(function(){
  const S={}, ZR='heroine_02', L=typeof ZRLAST_LINES!=='undefined'?ZRLAST_LINES:null;
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const abroadOn=(G,d)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d}));   /* 祐廷交換人在國外（美國路線 8/2～12/23）*/
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=t=>({th:'p:'+ZR,from:ZR,text:t});
  const romR=G=>((G&&G.flags&&G.flags.romance)||{})[ZR]||null;   /* 只讀 */
  const dating=G=>{ const F=(G&&G.flags)||{}, R=romR(G); return F['dating_'+ZR]===true||!!(R&&R.status==='dating'); };
  S.DAYS={ask:'2028-08-24',until:'2028-08-25',day:'2028-08-26',fly:'2028-09-01',back:'2029-09-01'};
  S.ASK='zr_last_ask'; S.OUT_ID='zr_last_screening'; S.H=19.5; S.LATE=0.25;   /* 19:30 開演；19:45 以後不能出發＝沒到 */
  S.TAGS={no:'zr_last_noreply',late:'zr_last_late',after:'zr_last_after',night:'zr_last_night',fly:'zr_last_fly',fang:'zr_f3_fang'};
  /* 祐廷單身（第 1 節第 5 點，第 10 節 A2）：沒有交往中的人；剛分開的要收拾過（ROM.canStart 的那一條，不另外建她的戀愛紀錄）*/
  const single=G=>{ if(typeof ROM==='undefined') return true; if(ROM.partners&&ROM.partners(G).length) return false; return G.flags.CLEANUP_DONE!==false||!!(ROM.cleanupLate&&ROM.cleanupLate(G)); };
  const zzBusy=G=>{ const Z=(G&&G.flags||{}).ZZ; return !!Z&&(Z.state==='dating'||Z.state==='mutual_interest'||Z.state==='held'); };   /* 她和子晴在一起、曖昧（第 1 節第 6 點，第 10 節 A3）*/
  const lt=(G,d,h)=>typeof R2Y3B!=='undefined'&&R2Y3B.lt?R2Y3B.lt(G,d,h):h;   /* 臺灣時間 → 玩家手機的時間（人在日本 +1）*/

  /* ---------- 第 1 節：條件（why＝回傳 {ok, why}，測試、除錯用）---------- */
  S.cond=function(G,why){ const out=r=>why?{ok:r===true,why:r===true?'':r}:r===true; if(!law(G)) return out('不是法律系'); const F=G.flags;
    if(F.ZR_LAST!=null||sent(G,S.ASK)) return out('只演一次');
    if(route(G)==='US') return out('美國路線');
    const d=D(S.DAYS.day); if(d==null||abroadOn(G,d)) return out('8/26 祐廷不在臺灣');
    if(F.ZZ_DATING===true||(typeof ZRZQ!=='undefined'&&ZRZQ.dating&&ZRZQ.dating(G))) return out('她和子晴在一起');
    if(F.ZR_FY===true) return out('她和方奕廷在一起');
    if(zzBusy(G)) return out('她和子晴曖昧或在一起（ZZ '+G.flags.ZZ.state+'）');
    if(!single(G)) return out('祐廷有交往對象（或剛分開還沒收拾）');
    if(F.ZR_CUP!=null) return out('杯子那一場演過了（'+F.ZR_CUP+'）');
    if(typeof ZRZQ==='undefined'||!ZRZQ.heartOk||!ZRZQ.heartOk(G)) return out('她的心意條件沒到（TERMEND.cond／C8）');
    return out(true); };

  /* ---------- 手機（第 2、5、7 節）---------- */
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined'||!L) return; const F=G.flags, d24=D(S.DAYS.ask), d25=D(S.DAYS.until), d26=D(S.DAYS.day), d91=D(S.DAYS.fly); if(d24==null||d25==null||d26==null||d91==null) return; const t=now(G);
    if(t<T(d24,21)||G.day>d91+1) return;   /* 8/24 21:00 以前、9/2 以後沒有要做的（手機規則每一輪都跑）*/
    /* 第 2 節：8/24（四）21:00 她私訊；回覆到 8/25（五）18:00 */
    if(t>=T(d24,21)&&t<T(d25,18)&&!sent(G,S.ASK)&&S.cond(G)){ const M=L.ask.map(dm);
      M[M.length-1].ask={id:S.ASK,until:T(d25,18),opts:[{t:L.yesT,say:[{from:ZR,text:L.yes}],set:{ZR_LAST_GO:true}},{t:L.noT,say:[{from:ZR,text:L.no}],set:{ZR_LAST:'no'}}]};
      PHONE.at(G,d24,21,M,S.ASK); }
    if(!sent(G,S.ASK)) return;
    /* 沒回＝「不行」那一句（18:00 傳）*/
    if(F.ZR_LAST==null&&F.ZR_LAST_GO!==true&&t>T(d25,18)){ F.ZR_LAST='no'; PHONE.at(G,d25,18,[dm(L.no)],S.TAGS.no); }
    /* 第 3 節：回了「好。」＝排出遊（8/26 19:30）*/
    if(F.ZR_LAST_GO===true&&F.ZR_LAST==null&&typeof OUT!=='undefined'){ const q=OUT.get(G,S.OUT_ID);
      if(!q&&t<T(d26,S.H+S.LATE)) OUT.plan(G,{id:S.OUT_ID,ev:'ev_zhiruo_last_screening',day:d26,h:S.H,late:S.LATE,place:'公館二輪戲院',title:'和芷若：公館二輪戲院',travel:'走過去約 15 分鐘',travelH:0.25,alarm:true});
      else if(q?(q.state==='missed'||(q.state==='planned'&&!q.arrived&&t>T(q.day,q.h+S.LATE))):t>T(d26,S.H+S.LATE)) F.ZR_LAST='missed'; }   /* 第 7 節：19:45 還沒到（出遊系統還沒標 missed 的，例如人在家、那一段沒跑到出遊的規則）*/
    if(F.ZR_LAST==='missed'){ if(!sent(G,S.TAGS.late)) PHONE.at(G,d26,S.H+S.LATE,[dm(L.late)],S.TAGS.late); if(!sent(G,S.TAGS.after)) PHONE.at(G,d26,22,[dm(L.after)],S.TAGS.after); }
    /* 第 5 節：當晚 23:00；交往的多 9/1（五）21:00（那時還在交往）*/
    if((F.ZR_LAST==='wait'||F.ZR_LAST==='keep')&&!sent(G,S.TAGS.night)) PHONE.at(G,d26,23,(F.ZR_LAST==='wait'?L.nightWait:L.nightKeep).map(dm),S.TAGS.night);
    if(F.ZR_LAST==='wait'&&dating(G)&&t>=T(d91,21)&&G.day<=d91+1&&!sent(G,S.TAGS.fly)) PHONE.at(G,d91,21,L.fly.map(dm),S.TAGS.fly); };
  /* 出遊沒到（「不去了」、過了 19:45；OUT 的 outingMissed）：記 missed，那兩則照上面的時間傳 */
  S.missed=function(G){ if(G&&G.flags&&G.flags.ZR_LAST==null) G.flags.ZR_LAST='missed'; };

  /* ---------- 第 10 節 A4：方奕廷兩則（她因為祐廷拒絕＝ZR_F3_NO；F3＋2 天 21:00；接到他電話的 FANG_F3 direct／bought／self，nocall 不傳；4-2b、「她跟我說了」照舊不傳）---------- */
  S.fangPhone=function(G){ const F=(G&&G.flags)||{}; if(!law(G)||typeof PHONE==='undefined'||!L||!L.fang||F.ZR_F3_NO==null||!['direct','bought','self'].includes(F.FANG_F3)||sent(G,S.TAGS.fang)) return;
    const d=F.ZR_F3_NO+2; PHONE.at(G,d,lt(G,d,21),L.fang.map(t=>({th:'p:npc_fangyt',from:'npc_fangyt',text:t})),S.TAGS.fang); };

  /* ---------- 第 10 節 A1：「我先收著」的第二次（ev_zhiruo_ticket_again；旗標 ZR_LAST2 wait／back／closed，只演一次）---------- */
  S.againDue=G=>{ const F=(G&&G.flags)||{}, d=D(S.DAYS.back); return law(G)&&F.ZR_LAST==='keep'&&F.ZR_LAST2==null&&d!=null&&G.day>=d&&G.zone==='cafe'&&!dating(G); };
  S.againOk=G=>{ const F=(G&&G.flags)||{}; return F.ZZ_DATING!==true&&F.ZR_FY!==true&&!zzBusy(G)&&single(G); };   /* 第 1 節第 3、5、6 點照當時算 */
  S.againResult=function(G){ const F=G&&G.flags, k=F&&F.ZR_LAST2; if(k!=='back'&&k!=='closed') return null; const Rt=typeof TERMEND!=='undefined'&&TERMEND.rec?TERMEND.rec(G):null;
    if(k==='back'&&!S.start(G)) return 'blocked'; if(Rt) delete Rt.think[ZR]; return k; };   /* 交往＝ROM.start；還給她＝朋友、照一般規則（讓我想想清掉）*/

  /* ---------- 第 4 節：結果（事件演完，after）---------- */
  S.TERM='Y3S2';   /* 8/26 是大三暑假（寒暑假算前一個學期）*/
  /* 交往：照 termend3d.js walkHome 的 start（答應那一欄）——她知道祐廷和別人交往還約了＝她同意（OPEN_OK）；記 confessed */
  S.start=function(G){ const F=G.flags, K=typeof TERMEND!=='undefined'&&TERMEND.knownOthers?TERMEND.knownOthers(G,ZR):[]; const ok=typeof ROM!=='undefined'&&ROM.start?ROM.start(G,ZR):((F['dating_'+ZR]=true),true);
    if(ok&&K.length){ const O=F.OPEN_OK||(F.OPEN_OK={}), M=O[ZR]||(O[ZR]={}); for(const y of K) M[y]=true; }
    if(ok) (F.confessed||(F.confessed={}))[ZR]=G.day; return ok; };
  S.result=function(G){ const F=G&&G.flags, k=F&&F.ZR_LAST; if(k!=='wait'&&k!=='keep') return null; const Rt=typeof TERMEND!=='undefined'&&TERMEND.rec?TERMEND.rec(G):null;
    if(k==='wait'){ if(!S.start(G)) return 'blocked'; if(Rt) delete Rt.think[ZR]; return 'wait'; }   /* 還不能開始（例：剛分手還沒收拾）＝照學期末那一套的 blocked，不另外處理 */
    if(Rt) Rt.think[ZR]=(typeof STORY!=='undefined'&&STORY.termAt&&STORY.termAt(G.day))||S.TERM; return 'keep'; };

  /* ---------- 第 6 節：房間物件「她的票根」（宿舍書桌「看看房間裡的東西」）---------- */
  S.roomExtra=function(G,Lst){ const F=(G&&G.flags)||{}; if((F.ZR_LAST==='wait'||F.ZR_LAST==='keep')&&F.ZR_LAST2!=='closed'&&L&&Array.isArray(L.room)&&!Lst.some(r=>r&&r[0]===L.room[0])) Lst.push(L.room.slice()); };

  /* ---------- 掛上去 ---------- */
  if(typeof STORY!=='undefined'&&!STORY._zrLast){
    if(Array.isArray(STORY.PHONE_RULES)){ STORY.PHONE_RULES.push(G=>S.phone(G)); STORY.PHONE_RULES.push(G=>S.fangPhone(G)); }
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,Lst)=>S.roomExtra(G,Lst));
    STORY._zrLast=true; }
  return S;
})();

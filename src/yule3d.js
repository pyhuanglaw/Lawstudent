/* ===== 予樂自己的線：辦活動的人不在照片裡（AA_520，企劃線 481dd8238；AA-C 定稿 D109；任務 NPC-STORY2-1028、USER_WANTS X119）：接線 =====
   台詞、事件在 src/data/yule_lines.js（YULE_LINES、YULE_EVENTS，照稿一字不差）。第 2 節（原有八則）照舊在 src/data/heard_lines.js 由 HEARD 送：
     h503_yule 後面兩句（同一組、同樣的條件）；h509_yule 第二則的選項（heard3d.js 的 ask；選項只給 S.kxOk 的玩家：HEARD.COND.yuleOwn）。
   ■ 第 1 節 誰收得到（第 3～6 節新的都照這個；原有八則照原本的 HEARD.COND.yule）：S.ownOk＝法律系、HEARD.COND.yule（見過她或手機裡有她）＋S.kxOk（和可昕沒有鬧翻）：
       被抓包（對質過：romance.kexin 是 friend_after_catch／paused、有一次分開是被發現的那幾種〔同 MREL.caughtBefore 的判斷〕、舊存檔 EX_kexin_REASON 'caught'）＝一律不傳（之後重新交往也一樣）；
       交往中、沒交往過（朋友）＝照傳；分開了（ROM.end：EX_kexin）＝從分開那天起不傳——慢慢分手以後已經照朋友的（KXDRIFT.frOn）從照朋友的下一學期第一天起照傳
       （照朋友那天在寒暑假＝前一學期的下一個，同 KXDRIFT.r7From；照朋友那天在大四下＝沒有下一學期，不傳）。可昕的那一則（第 6 節）：手機裡有可昕＋S.kxOk。
       見過她（S.yuleCond）：HEARD.COND.yule，或她傳過的那幾則（YL_PH、HEARD 的 p:yule）送出過——手機只留 200 則，擠掉了也算手機裡有她。
       已經在進行的（演講邀請以後的出遊和 21:40、11/7 選①以後的 1/12 報告）只再看 S.kxOk（見過她在那時已經成立）。
   ■ 第 3 節 她自己的事（YULE_LINES.own，十三則＋第 5 節 1/12 的報告）：到了時間（臺灣時間；人在國外換當地時間，HEARD.loc）就送一次；晚三天以上不補（同 HEARD.LATE）；
       到的時候條件不成立＝這一則不送（記 x:原因，之後條件成立也不補）。{if:鍵} 那幾則照 S.IF。
   ■ 第 4 節 演講那一晚：10/14（四）22:00 邀請（回覆期限 10/20 18:00；記 YL_LEC）→ ①'listen' 10/20（三）18:50 霖澤館 201、②'eat' 20:15 阿鳳麵店（OUT.plan，出遊 ADV
       ev_yule_lecture；演完記 YL_ROOM、記憶 YL_LECTURE）；③、沒回（期限過了記 'no'）＝10/20 21:40 私訊四則；①②沒到（OUT 的 missed、21:40 還沒出發）＝同一則、第一則換掉。
       那之前和可昕鬧翻了＝排好的出遊取消、21:40 那一則不送。見面要人在臺灣：大三上三條路線都在臺灣（稿第 1 節），不另外擋。
   ■ 第 5 節 11/7：h509_yule 的選項記 YL_RPT（'ask'／'up'／'night'，期限 23:54）；23:55 三則（有選項的那一版才有，不管回了沒有；'up' 多一則）；'ask' 的 2029-01-12 22:00 報告（第 3 節 yl_report）。
   ■ 第 7 節：YL_LEC、YL_ROOM、YL_RPT、記憶 YL_LECTURE（SOCIAL.remember('yule',…)）。另外兩個記帳用的：G.flags.YL_PH＝{訊息 id:'sent'|'x:原因'}；
       KX_YULE_REPLIED＝回過 needed_msgs.js kx_yule（PHONE.ON_ANSWER 記；舊存檔沒有＝看手機裡那一則、STORY 的 needed 紀錄）。舊存檔沒有這些＝從那時起照常。
   不用 3D（予樂沒有 3D 模型）；這一批沒有 3D 當面的入口（全部是私訊、私訊約好的 2D 出遊），PRIVTALK 不用登記。
   2D 背景：霖澤館 201 沒有圖＝深色底（這裡登記 OUT.BG.linze_201 image:null；tests/scene_bg_keys_unit.js 的 PENDING，BB 要圖）；阿鳳麵店用現有的 noodle_table。
   測試：node tests/aa520_yule_unit.js */
'use strict';
const YULE=(function(){
  const S={}, KX='kexin', YL='yule', L=typeof YULE_LINES!=='undefined'?YULE_LINES:{own:[]};
  S.L=L;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const abs=(d,h)=>d*24+h, now=G=>abs(G.day,+G.hour||0);
  const HR=()=>typeof HEARD!=='undefined'?HEARD:null;
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  S.LATE=72;   /* 晚三天以上就不補（同 HEARD.LATE）*/
  /* 'YYYY-MM-DD HH:MM'（臺灣時間）→ {day, h} */
  S.when=function(t){ const m=/^(\d{4}-\d\d-\d\d) (\d\d):(\d\d)$/.exec(String(t||'')); if(!m) return null; const d=DK(m[1]); return d==null?null:{day:d,h:+m[2]+(+m[3])/60}; };
  /* 臺灣時間 → 遊戲時鐘（人在國外是當地時間）：同 HEARD.loc */
  S.loc=(G,w)=>{ const H=HR(); return H&&H.loc?H.loc(G,w):w; };
  /* 到了沒：null＝還沒到；'late'＝晚三天以上；{day,h,tw}＝當地的時間（tw：臺灣時間那一天）。一天以後的先不算時差（同 HEARD.phone）*/
  S.due=function(G,at){ const w0=S.when(at); if(!w0||abs(w0.day,w0.h)>now(G)+24) return null; const w=S.loc(G,w0), t0=abs(w.day,w.h); if(now(G)<t0) return null;
    if(now(G)-t0>S.LATE) return 'late'; return {day:w.day,h:w.h,tw:w0.day}; };
  S.rec=G=>{ const F=G.flags||(G.flags={}); let R=F.YL_PH; if(!R||typeof R!=='object') R=F.YL_PH={}; return R; };

  /* ---------------- 第 1 節 誰收得到 ---------------- */
  const romR=G=>{ const F=G.flags||{}; return (F.romance&&F.romance[KX])||null; };
  S.CAUGHT_HOW=['two_hearts','mrel','zq_zr','caught','told'];   /* 被發現的那幾種分開（同 multirel3d.js MREL.CAUGHT_HOW；那邊有就用那邊的）*/
  /* 被抓包過（同 MREL.caughtBefore，不叫 ROM.get：手機規則每 0.5 秒跑，不順手改存檔）：退回朋友／等你說清楚、或任何一次分開是被發現的；舊存檔 EX_kexin_REASON 'caught'（v6ex3d.js）。之後重新交往也算 */
  S.caught=function(G){ const F=G.flags||{}, R=romR(G); if(R&&(R.status==='friend_after_catch'||R.status==='paused')) return true;
    const how=typeof MREL!=='undefined'&&Array.isArray(MREL.CAUGHT_HOW)?MREL.CAUGHT_HOW:S.CAUGHT_HOW;
    if(R&&Array.isArray(R.history)&&R.history.some(e=>e&&e.ev==='end'&&how.includes(e.how))) return true;
    return F['EX_'+KX+'_REASON']==='caught'; };
  /* 慢慢分手以後照朋友的：照朋友的下一學期第一天（沒有＝null）*/
  S.frFrom=function(G){ if(typeof KXDRIFT==='undefined'||!KXDRIFT.frOn||!KXDRIFT.r7From||!Array.isArray(KXDRIFT.TERMS)||typeof CALENDAR==='undefined'||!CALENDAR.termDays) return null;
    if(!KXDRIFT.frOn(G)) return null; const i=KXDRIFT.r7From(G), t=i!=null?KXDRIFT.TERMS[i]:null, R=t?CALENDAR.termDays(t):null; return R?R.from:null; };
  /* 和可昕沒有鬧翻（d：那一則的日子，沒給＝今天）*/
  S.kxOk=function(G,d){ if(!G||!G.flags) return false; const F=G.flags, R=romR(G); if(S.caught(G)) return false;
    if(F['dating_'+KX]===true) return true;
    if(!(F['EX_'+KX]||(R&&R.status==='ex'))) return true;   /* 沒交往過（朋友）*/
    const f=S.frFrom(G); return f!=null&&(d!=null?d:G.day)>=f; };
  /* 見過她或手機裡有她（HEARD.COND.yule）；她自己的事、原有八則傳過一則以上也算手機裡有她（那幾則被手機 200 則的上限擠掉也一樣）*/
  S.yuleCond=G=>{ const H=HR(); if(H&&H.COND&&H.COND.yule&&H.COND.yule(G)) return true; const F=G.flags||{};
    if(F.YL_PH&&typeof F.YL_PH==='object'&&Object.values(F.YL_PH).includes('sent')) return true;
    const P=F.HEARD&&F.HEARD.ph; return !!(P&&H&&H.L&&(H.L.phone||[]).some(e=>e.th==='p:'+YL&&P[e.id]==='sent')); };
  S.ownOk=(G,d)=>law(G)&&S.yuleCond(G)&&S.kxOk(G,d);

  /* ---------------- 條件那幾則（YULE_LINES 的 {if:鍵}）---------------- */
  S.glasses=function(G){ const F=G.flags||{}; if(F.KX_YULE_REPLIED===true) return true;
    if((G.msgs||[]).some(m=>m&&m.ask&&/(^|_)kx_yule$/.test(String(m.ask.id||''))&&m.ans!=null)) return true;   /* 舊存檔：手機裡那一則回過 */
    const N=G.needed; return !!(N&&Array.isArray(N.batches)&&N.batches.some(b=>b&&Array.isArray(b.ans)&&b.ans.includes('kx_yule'))); };
  S.IF={
    film:G=>{ const D=(G.events&&G.events.done)||{}; return !!D.ev_kexin_film_night||(G.flags||{}).KX_FILM_NIGHT==='went'; },   /* 去了電影夜 */
    glasses:G=>S.glasses(G),   /* 回過 kx_yule「說要陪妳去配眼鏡。」*/
    room:G=>(G.flags||{}).YL_ROOM===true, noRoom:G=>(G.flags||{}).YL_ROOM!==true,   /* 聽過八歲那個房間 */
    up:G=>(G.flags||{}).YL_RPT==='up' };   /* 11/7 選「貼高一點。」*/
  S.NEED={ rpt:G=>(G.flags||{}).YL_RPT==='ask' };   /* 11/7 選「報告寫什麼？」*/
  S.texts=(G,list)=>(list||[]).filter(x=>typeof x==='string'||(x&&S.IF[x.if]&&S.IF[x.if](G))).map(x=>typeof x==='string'?x:x.t);
  const YM=t=>({th:'p:'+YL,from:YL,name:'予樂',text:t}), KM=t=>({th:'p:'+KX,from:KX,text:t});

  /* ---------------- 第 3 節（＋第 5 節 1/12）她自己的事 ---------------- */
  S.own=function(G){ const R=S.rec(G); let n=0;
    for(const e of L.own||[]){ if(R[e.id]) continue; const w=S.due(G,e.at); if(!w) continue; if(w==='late'){ R[e.id]='x:late'; continue; }
      if(!(e.need?law(G)&&S.kxOk(G,w.tw):S.ownOk(G,w.tw))){ R[e.id]='x:cond'; continue; } if(e.need&&!(S.NEED[e.need]&&S.NEED[e.need](G))){ R[e.id]='x:'+e.need; continue; }   /* need（1/12 報告）：選項是她傳的，見過她已經成立，只看和可昕 */
      PHONE.at(G,w.day,w.h,S.texts(G,e.t).map(YM),e.id); R[e.id]='sent'; n++; }
    return n; };

  /* ---------------- 第 4 節 演講那一晚 ---------------- */
  S.OUTS={   /* 出遊（OUT.plan）：①霖澤館 201、②阿鳳麵店；車程照現有的霖澤館、麵店出遊；alarm＝跳過時間停在該出發的時候 */
    listen:{id:'yl_lecture',ev:'ev_yule_lecture',h:18+50/60,late:0.5,place:'霖澤館 201',title:'家事調查官的演講（霖澤館 201）',travel:'走過去約 10 分鐘',travelH:1/6,alarm:true},
    eat:{id:'yl_lecture',ev:'ev_yule_lecture',h:20.25,late:0.5,place:'阿鳳麵店',title:'阿鳳麵店（予樂）',travel:'走過去約 15 分鐘',travelH:0.25,alarm:true} };
  S.untilAbs=function(G){ const A=L.lecture, u=A&&S.when(A.until); if(!u) return null; const w=S.loc(G,u); return abs(w.day,w.h); };
  S.lecture=function(G){ const A=L.lecture, B=L.lectureAfter; if(!A||!B) return; const R=S.rec(G), F=G.flags;
    if(!R[A.id]){ const w=S.due(G,A.at); if(!w) return; if(w==='late'){ R[A.id]='x:late'; return; } if(!S.ownOk(G,w.tw)){ R[A.id]='x:cond'; return; }
      const M=A.t.map(YM), u=S.untilAbs(G); M[M.length-1].ask=Object.assign({id:'yl_lec',opts:A.opts.map(o=>({t:o.t,say:(o.r||[]).map(text=>({from:YL,name:'予樂',text})),set:Object.assign({},o.set)}))},u!=null?{until:u}:{});
      PHONE.at(G,w.day,w.h,M,A.id); R[A.id]='sent'; }
    if(R[A.id]!=='sent') return;
    const u=S.untilAbs(G); if(F.YL_LEC==null&&u!=null&&now(G)>u) F.YL_LEC='no';   /* 沒回＝同③ */
    const o=S.OUTS[F.YL_LEC], d=S.when(B.at), day=d?d.day:null; let q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'yl_lecture'):null;
    if(o&&!q&&day!=null&&typeof OUT!=='undefined'&&OUT.plan&&now(G)<abs(day,o.h+o.late)&&S.kxOk(G)){ OUT.plan(G,Object.assign({day},o)); q=OUT.get(G,'yl_lecture'); }
    if(q&&q.state==='planned'&&!S.kxOk(G)) q.state='cancelled';   /* 那之前和可昕鬧翻了＝不演（見過她：邀請送出的時候已經成立，之後不再看）*/
    /* 4-4 21:40 */
    if(R[B.id]) return; const w=S.due(G,B.at); if(!w) return; if(w==='late'){ R[B.id]='x:late'; return; }
    let first=B.t[0];
    if(o){ if(q&&q.state==='done'){ R[B.id]='x:went'; return; } if(q&&q.state==='cancelled'){ R[B.id]='x:cancelled'; return; }
      if(q&&q.state==='planned') q.state='missed';   /* 21:40 還沒出發（人在家 OUT.tick 不跑的時候）＝沒到 */
      first=B.miss[F.YL_LEC]; }
    else if(F.YL_LEC!=='no') return;
    if(!S.kxOk(G,w.tw)){ R[B.id]='x:cond'; return; }
    PHONE.at(G,w.day,w.h,[first].concat(B.t.slice(1)).map(YM),B.id); R[B.id]='sent'; };

  /* ---------------- 第 5 節 11/7 23:55 ---------------- */
  S.askSent=(G,id)=>(G.msgs||[]).some(m=>m&&m.ask&&m.ask.id===id)||(typeof PHONE!=='undefined'&&PHONE.rec(G).q.some(q=>(q.items||[]).some(it=>it&&it.ask&&it.ask.id===id)));
  S.rptAfter=function(G){ const A=L.rptAfter; if(!A) return; const R=S.rec(G); if(R[A.id]) return; const w=S.due(G,A.at); if(!w) return; if(w==='late'){ R[A.id]='x:late'; return; }
    if(!S.askSent(G,'yl_rpt')){ const H=HR(), hr=H&&H.rec?H.rec(G).ph.h509_yule:null; if(hr) R[A.id]='x:noask'; return; }   /* h509_yule 送了、沒有選項（條件不成立）或沒送＝沒有；HEARD 還沒跑到＝等它 */
    PHONE.at(G,w.day,w.h,S.texts(G,A.t).map(YM),A.id); R[A.id]='sent'; };

  /* ---------------- 第 6 節 可昕 9/16 21:10 ---------------- */
  S.kexin=function(G){ const A=L.kexin; if(!A) return; const R=S.rec(G); if(R[A.id]) return; const w=S.due(G,A.at); if(!w) return; if(w==='late'){ R[A.id]='x:late'; return; }
    const has=typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,KX); if(!law(G)||!has||!S.kxOk(G,w.tw)){ R[A.id]='x:cond'; return; }
    PHONE.at(G,w.day,w.h,A.t.map(KM),A.id); R[A.id]='sent'; };

  /* ---------------- 手機規則、掛勾 ---------------- */
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; for(const f of [S.own,S.lecture,S.rptAfter,S.kexin]){ try{ f(G); }catch(e){ console.warn('YULE phone',e); } } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._yule){ STORY.PHONE_RULES.push(G=>S.phone(G)); STORY._yule=true; }
  /* 回過 kx_yule（大二下第 2～4 週「這週的訊息」，可昕：予樂的生日要辦驚喜……）：3/27 生日那則後面三則 */
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER._yule){ PHONE.ON_ANSWER.push((G,m,o)=>{ if(o&&o.need==='kx_yule'&&G&&G.flags) G.flags.KX_YULE_REPLIED=true; }); PHONE.ON_ANSWER._yule=true; }
  /* 2D 背景：霖澤館 201 沒有圖＝深色底（BB 要圖；tests/scene_bg_keys_unit.js 的 PENDING）*/
  if(typeof OUT!=='undefined'&&OUT.BG&&!OUT.BG.linze_201) OUT.BG.linze_201={label:'霖澤館 201',image:null};
  return S;
})();

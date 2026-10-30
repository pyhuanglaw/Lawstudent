/* 吳芯慈可以交往（很難）：XINCI-ROMANCE-1030（使用者 2026-10-30 X139「芯慈可攻略 但要很難達成 請AA規劃」；AA_537 企劃線 2f523e21a、AA_537b 5ba143d2c）。
   這一支管：門檻 G1～G10（S.gates）、心意邀約發不發（S.heartOk：學期末 termend3d.js S.cond 問）、告白那一刻有沒有別的交往對象（S.othersNow）、她接不接受多段（S.acceptsOpen）。
   - 告白只在學期末（TERMEND.ON）：心意邀約 → 期末飯 → 回家的路上（termend_lines.js HEART.classmate_xinci，AA_537b 第 7 節）。
   - 「跟以安交往過就不開」（G10）、「不接受多段」（AA_537 5-5）是 AA 的建議，使用者 05:4x 還沒回（AA-B 16:18）：各做成一個開關，集中在 S.CFG。
   - 新的時刻（3-1～3-6）、半夜訊息（G5 XC_NIGHT）、交往以後（第 5、6 節）在後面幾段加（同一支）。 */
'use strict';
const XCROM=(()=>{
  const S={};
  const XC='classmate_xinci', AN='heroine_01';
  S.XC=XC;
  /* 使用者還沒定的兩條（AA_537 第 2 節、5-5）：改這裡就好 */
  S.CFG={noAnEx:true,noOpen:true};
  const F=G=>(G&&G.flags)||{};
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const mem=(G,tag)=>!!(G&&G.social&&G.social.mem&&(G.social.mem[XC]||[]).some(m=>m.tag===tag));
  const rel=()=>typeof SOCIAL!=='undefined'&&SOCIAL.rel?SOCIAL.rel(XC):{};
  const n=v=>+v||0;
  /* G10 以安那一條：跟以安交往過（現在交往中、或分開過）＝這條線不開（只看這一個判斷）*/
  S.anDated=G=>{ const f=F(G); return f['dating_'+AN]===true||!!f['EX_'+AN]; };
  /* 多段那一條：她接不接受祐廷同時和別人交往（termend3d.js 的 KNOWS_OK、告白那一刻的 others 都問這裡）*/
  S.acceptsOpen=G=>!S.CFG.noOpen;
  /* G9：交往前第 6 階、她的戀愛 ≥ 70、信任 ≥ 60（一般 55／45）、正式約會 ≥ 6 次（一般 4）、去過她的心願地點 */
  S.NUM={npcRom:70,trust:60,count:6};
  S.numbers=function(G){ if(typeof DATE==='undefined'||!DATE.stageNum||!DATE.log) return false; const r=rel(), L=DATE.log(G,XC);
    return DATE.stageNum(XC)>=6&&n(r.npcRom)>=S.NUM.npcRom&&n(r.trust)>=S.NUM.trust&&(L.count|0)>=S.NUM.count&&!!L.wish; };
  /* 門檻（AA_537 第 1 節的表）*/
  S.gates=function(G){ const f=F(G), l118=G&&G.l118&&G.l118.once;
    return {
      G1:done(G,'ev_xinci_notes')&&typeof INV!=='undefined'&&!!INV.hasContact&&!!INV.hasContact(G,XC),   /* 慈 1 筆記，拿到聯絡方式 */
      G2:mem(G,'TALKED_FAMILY')||mem(G,'ECON_TOGETHER'),   /* 慈 2 雙主修（3-1 補問也記 TALKED_FAMILY）*/
      G3:!!(l118&&l118.H7c!=null),   /* 「她今天要換。」（lane118.js H7c）*/
      G4:mem(G,'XINCI_SECOND')&&(f.XC_FIX!=='yes'||!!f.XC_CALL1),   /* 慈 3 半夜的便利商店；走 Café 補演（XC_FIX）的要多過 3-3 那通電話（XC_CALL1）*/
      G5:(f.XC_NIGHT|0)>=6,   /* 半夜回她訊息 6 次（她傳的 30 分鐘內）*/
      G6:!!f.XC5_RECONCILE,   /* 慈 5 她跟以安和好 */
      G7:!!f.XC_SAMEDAY,   /* 「沒有提前一天」：她第一次當天約你，你答應 */
      G8:(done(G,'ev_xinci_first_place')||done(G,'ev_xinci_first_place_video'))&&!!f.XC_BLANK,   /* 慈 6＋「空白的週三下午」選「那我來填。」*/
      G9:S.numbers(G),
      G10:!(S.CFG.noAnEx&&S.anDated(G)) }; };
  S.allGates=G=>{ const g=S.gates(G); return Object.keys(g).every(k=>g[k]); };
  /* 心意邀約發不發（AA_537b 第 7 節：G1～G8 都過、G9 數值、G10；人在國外那一學期沒有）——termend3d.js S.cond 一開始問；沒過＝不發、也不傳 NOPE 那一句 */
  S.heartOk=function(G){ if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G)) return false; return S.allGates(G); };
  /* 告白那一刻祐廷正在交往的別人（她接受多段＝不算）：有＝她問完「你現在有在跟誰交往嗎。」接 others、不交往（AA_537 第 4 節、AA_537b 第 7 節）*/
  S.othersNow=function(G,who){ if(S.acceptsOpen(G)) return []; const f=F(G); return Object.keys(f).filter(k=>/^dating_/.test(k)&&f[k]===true).map(k=>k.slice(7)).filter(id=>id!==(who||XC)); };
  /* 她問過（5-5 被發現那一句「告白那天，我問過你」的來由）*/
  S.asked=G=>{ const f=F(G); if(f.XC_ASKED==null) f.XC_ASKED=G.day; };
  return S;
})();

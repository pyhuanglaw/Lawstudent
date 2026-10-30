/* ===== 學姊重讀（AA_539，企劃線 c9f6dd6cb → 90d0a41d0；SIS-LEAD-1021、D111、USER_WANTS C25）第 3 節：補空白（第②級）——接線 =====
   台詞在 src/data/sis_aa539_lines.js（照稿不改字）。STORY.PHONE_RULES：
   - 3-1 朋友版六則私訊（2026-07-20、12-20、2028-02-27、04-12、06-20、2029-02-14）：認識她（met_sis）、朋友以上、有她的聯絡方式、沒在和她交往、不是前任；
       21:00（人在日本、美國、寒暑假出國＝當地時間，同 sis_b12_3d.js tzH）。那一天晚兩天以上才讀到的不補（同 SISB12）。
       2026-07-20 那一則照 5-1（90d0a41d0）：14:00 傳（LAWWW-B 子代理原本的時間，AA 照用）。
         12-1（AA_470「學生證」，sis_b12 的 ev_sis_borrowed_card）還沒演：兩則＋選項——
           「我在附近。」＝她「好。三樓靠窗。」，約當天 15:30 總圖（INV 的總圖邀約，by:'npc'）；見面那一次直接演 12-1（INV 的 iv.ev，同 sup497_3d.js），不演一般的總圖見面；
           「今天不行。」＝她「好。」；12-1 照原規則（7/31 以前平日在總圖找她照樣演）。回覆期限 15:15。
         12-1 演過了：「你借我的那三本，第一本讀完了。」一則、不用回。排好還沒送到以前 12-1 演了＝換成這一則（S.fixQueued）。
         人在國外照收；12-1 還沒演的只收前兩則，沒有選項。
         約好以後、見面以前 12-1 自己先演了（在總圖找她說話）＝那一次照一般的總圖見面（拿掉 iv.ev）；從見面演的，補記 SIS_CARD_DAY（12-1 第 21 天的私訊照 sis_b12_3d.js S.cardBack）。
   - 3-2 沒認識的玩家也收到的家族群組三則（2026-07-05 20:00、12-24 21:00、2027-07-15 20:00）：在家族群組（family_law）就收到、不用回；朋友版、交往中也一樣。
   存檔：G.flags.SIS539_SR＝7/20 約到的 INV 邀約 id（'none'＝沒約到）；訊息照 PHONE 的 tag（sis539_*）。測試：node tests/aa539_sis_reread_unit.js */
'use strict';
const SIS539=(function(){
  const S={}, ID='heroine_05', L=typeof SIS539_LINES!=='undefined'?SIS539_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>((G.hour%24)+24)%24;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const tzH=(G,d,h)=>h+(typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0);   /* 臺灣時間 → 手機的當地時間 */
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  S.isEx=G=>!S.dating(G)&&!!(G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  const contact=G=>typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,ID);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const inGrp=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'family_law');
  const WHO={k:{from:'kevin',name:'Kevin'},s:{from:ID,name:'溫學姊'}};   /* 同 sis_b12_3d.js */
  const g=([w,t])=>Object.assign({th:'g:family_law',text:t},WHO[w]);
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  S.friendOk=G=>law(G)&&!!G.flags.met_sis&&!S.dating(G)&&!S.isEx(G)&&stageOk('FRIEND')&&contact(G);   /* 3-1：朋友以上、有聯絡方式；交往中的不發 */
  S.dmTag=i=>'sis539_fdm_'+i; S.grpTag=i=>'sis539_grp_'+i;
  S.SR_UNTIL=15.25;   /* 7/20 回覆期限（來得及 15:30 總圖）*/
  const CARD_EV='ev_sis_borrowed_card';
  S.cardDone=G=>!!(G&&((G.events&&G.events.done&&G.events.done[CARD_EV])||(G.flags&&G.flags.SIS_CARD_DAY!=null)))||(typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(ID,'SIS_BORROWED_CARD'));   /* 12-1 演過了（事件、SISB12 記的那一天、記憶）*/
  S.away=(G,d)=>(typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d})))||(typeof VAC!=='undefined'&&!!VAC.abroadOn&&VAC.abroadOn(G,d));

  /* ---------------- 3-1 朋友版私訊 ---------------- */
  S.friendDm=function(G){ const A=L.friendDm||[];
    for(let i=0;i<A.length;i++){ const a=A[i], d=D(a.day), tag=S.dmTag(i); if(d==null||G.day<d||G.day>d+2||sent(G,tag)||!S.friendOk(G)) continue;
      if(a.card&&S.cardDone(G)){ PHONE.at(G,d,tzH(G,d,a.h),a.card.map(dm),tag); continue; }   /* 7/20：12-1 演過了＝那一則（不用回）*/
      const ask=!!a.yes&&!S.away(G,d);   /* 人在國外：照收、沒有選項（5-1）*/
      if(ask&&now(G)>=T(d,tzH(G,d,S.SR_UNTIL))) continue;   /* 有選項的那一則：過了回覆期限才讀到的不補 */
      const M=a.L.map(dm); if(ask) M[M.length-1].ask={id:tag,until:T(d,tzH(G,d,S.SR_UNTIL)),opts:[{t:a.yes,say:[{from:ID,text:a.yesRe}]},{t:a.noT,say:[{from:ID,text:a.no}]}]};
      PHONE.at(G,d,tzH(G,d,a.h),M,tag); } };
  /* 排好、還沒送到（14:00 以前）12-1 先演了：換成「演過了」的那一則 */
  S.fixQueued=function(G){ const a=(L.friendDm||[])[0]; if(!a||!a.card||!S.cardDone(G)) return; const P=PHONE.rec?PHONE.rec(G):null; const q=P&&Array.isArray(P.q)?P.q.find(x=>x&&x.tag===S.dmTag(0)):null;
    if(q&&q.items&&q.items[0]&&q.items[0].text===a.L[0]) q.items=a.card.map(dm); };
  /* 「我在附近。」：約當天 15:30 總圖，見面直接演 12-1（PHONE.ON_ANSWER；回的當下就約）*/
  S.SR_H=15.5;
  S.SR_UP='（你走上三樓。她坐在靠窗的位子。）';   /* AA-B 10-30 09:11（AA_539 第 5 節第 4 點的退路）：INV 的總圖在大廳那一層，見面前這一句旁白再演 12-1 */
  S.onAsk=function(G,m,o,k){ const id=m&&m.ask&&m.ask.id; if(id!==S.dmTag(0)||k!==0||!G||!G.flags||G.flags.SIS539_SR!=null||typeof INV==='undefined'||!INV.accept) return;
    const d=D((L.friendDm||[])[0].day), P=INV.place?INV.place('library'):null;
    if(d==null||!P||(INV.freeAt&&!INV.freeAt(G,ID,P,d,S.SR_H))){ G.flags.SIS539_SR='none'; return; }   /* 那個時間你已經約了別人、考試：不約（不另外寫句子）*/
    const iv=INV.accept(G,ID,'library',d,S.SR_H,{by:'npc'}); if(iv&&!S.cardDone(G)){ iv.ev=CARD_EV; iv.preNarr=S.SR_UP; } G.flags.SIS539_SR=iv?iv.id:'none'; };
  /* 約好的那一次：見面以前 12-1 自己先演了＝拿掉 iv.ev（照一般的見面）；從見面演完的＝補記 SIS_CARD_DAY（第 21 天的私訊）*/
  S.srFix=function(G){ const F=G.flags, ivId=F.SIS539_SR; if(!ivId||ivId==='none'||typeof INV==='undefined'||!INV.byId) return; const iv=INV.byId(G,ivId); if(!iv) return;
    if(iv.ev===CARD_EV&&iv.state==='accepted'&&S.cardDone(G)){ delete iv.ev; delete iv.preNarr; }
    if(iv.ev===CARD_EV&&iv.state==='done'&&F.SIS_CARD_DAY==null){ const R=G.events&&G.events.last; F.SIS_CARD_DAY=R&&R[CARD_EV]!=null?R[CARD_EV]:iv.day; } };

  /* ---------------- 3-2 家族群組 ---------------- */
  S.famGrp=function(G){ if(!inGrp(G)) return; const A=L.famGrp||[];
    for(let i=0;i<A.length;i++){ const a=A[i], d=D(a.day), tag=S.grpTag(i); if(d==null||G.day<d||G.day>d+2||sent(G,tag)) continue; PHONE.at(G,d,tzH(G,d,a.h),a.L.map(g),tag); } };

  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.srFix,S.fixQueued,S.friendDm,S.famGrp]){ try{ f(G); }catch(e){ console.warn('SIS539 phone',e); } } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)) PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAsk(G,m,o,k));
  return S;
})();

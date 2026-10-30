/* ===== 學姊重讀（AA_539，企劃線 c9f6dd6cb；SIS-LEAD-1021、D111、USER_WANTS C25）第 3 節：補空白（第②級）——接線 =====
   台詞在 src/data/sis_aa539_lines.js（照稿不改字）。STORY.PHONE_RULES：
   - 3-1 朋友版六則私訊（2026-07-20、12-20、2028-02-27、04-12、06-20、2029-02-14）：認識她（met_sis）、朋友以上、有她的聯絡方式、沒在和她交往、不是前任；
       21:00（人在日本、美國、寒暑假出國＝當地時間，同 sis_b12_3d.js tzH）。那一天晚兩天以上才讀到的不補（同 SISB12）。
       2026-07-20 那一則有回覆選項：「我在附近。」＝照一般邀約，約當天下午到慢讀（INV 的邀約，by:'npc'；見面照 AA_535 學姊慢讀的句子＝invites.js 的 slowreadLines）；
       「今天不行。」＝她「好。」。
       【稿上不清楚、照最接近的做法】稿的表頭寫 21:00，可是這一則說「我在慢讀」、回「我在附近。」要「約當天下午到慢讀」，慢讀 18:00 關——
       這一則改成下午 14:00 傳（2026-07-20 週一），約的時間照慢讀平日的時段（INVITE_DATA 的 timesBy：12:10、15:30）挑還來得及、兩個人都空的第一個（15:30）；
       回覆期限 15:15（來得及 15:30）；那時候都不行＝照 INV.nextFree 當天慢讀還開著的下一個半點（最晚 16:30 開始）；還是沒有＝不約（不另外寫句子）。
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
  S.SR_UNTIL=15.25;   /* 7/20 回覆期限（來得及 15:30）*/
  S.away=(G,d)=>(typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d})))||(typeof VAC!=='undefined'&&!!VAC.abroadOn&&VAC.abroadOn(G,d));

  /* ---------------- 3-1 朋友版私訊 ---------------- */
  S.friendDm=function(G){ const A=L.friendDm||[];
    for(let i=0;i<A.length;i++){ const a=A[i], d=D(a.day), tag=S.dmTag(i); if(d==null||G.day<d||G.day>d+2||sent(G,tag)||!S.friendOk(G)) continue;
      if(a.yes&&now(G)>=T(d,tzH(G,d,S.SR_UNTIL))) continue;   /* 有選項的那一則（7/20）：過了回覆期限才讀到的不補 */
      const M=a.L.map(dm); if(a.yes&&!S.away(G,d)) M[M.length-1].ask={id:tag,until:T(d,tzH(G,d,S.SR_UNTIL)),opts:[{t:a.yes},{t:a.noT,say:[{from:ID,text:a.no}]}]};   /* 那天人在國外（寒暑假出國）：照收、沒有選項（同 sis_b12_3d.js 12-6b 的做法）*/
      PHONE.at(G,d,tzH(G,d,a.h),M,tag); } };
  /* 「我在附近。」：照一般邀約，約當天下午到慢讀（PHONE.ON_ANSWER；回的當下就約）*/
  S.srSlot=function(G,d){ if(typeof INV==='undefined'||!INV.place||!INV.freeAt) return null; const P=INV.place('slowread'); if(!P) return null; const t0=hh(G)+0.25;
    const wd=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).wd%7:G.weekday, L0=(P.timesBy?((wd===0||wd===6)?P.timesBy.we:P.timesBy.wk):P.times)||[];
    for(const h of L0) if(h>=t0&&INV.freeAt(G,ID,P,d,h)) return h;
    const n=INV.nextFree?INV.nextFree(G,ID,P,d,t0):null; return n&&n.day===d?n.h:null; };
  S.onAsk=function(G,m,o,k){ const id=m&&m.ask&&m.ask.id; if(id!==S.dmTag(0)||k!==0||!G||!G.flags||G.flags.SIS539_SR!=null) return;
    const d=D((L.friendDm||[])[0].day), h=d==null?null:S.srSlot(G,d);
    if(h==null){ G.flags.SIS539_SR='none'; return; }
    const iv=INV.accept(G,ID,'slowread',d,h,{by:'npc'}); G.flags.SIS539_SR=iv?iv.id:'none'; };

  /* ---------------- 3-2 家族群組 ---------------- */
  S.famGrp=function(G){ if(!inGrp(G)) return; const A=L.famGrp||[];
    for(let i=0;i<A.length;i++){ const a=A[i], d=D(a.day), tag=S.grpTag(i); if(d==null||G.day<d||G.day>d+2||sent(G,tag)) continue; PHONE.at(G,d,tzH(G,d,a.h),a.L.map(g),tag); } };

  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.friendDm,S.famGrp]){ try{ f(G); }catch(e){ console.warn('SIS539 phone',e); } } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)) PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAsk(G,m,o,k));
  return S;
})();

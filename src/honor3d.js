/* 書卷獎（D44；AA_126 第 2 節）、看出席的課第 12 週提醒（D43；AA_126 1-4）
   - 書卷獎：只算法律課（CLS.isExamCourse）。當學期法律科期末考答對題數的平均 ≥ 4（缺考算 0、題庫不足沒開考的不算）＝那一學期的書卷獎。
     下學期第 2 週週一 09:00 系上公告（手機系統提醒；旗標 HONOR_<學期>）。好感照 AA_126 第 2 節的表，每次公告只算一次、不受每天上限：
     以安 熟悉 +4、信任 +6、她的戀愛 +6；學姊 +2、+4、+3；其他認識的女主角和朋友 熟悉 +2、信任 +1。
     公告以後第一次找以安、柏翰說話先一句（AA_124 2-5：以安「名單上有你。理由？」；柏翰把名單拍下來「……好。」）。
     成績單多一行「書卷獎」（classes3d.js showGrades 問 HONOR.won）。
   - 看出席的課：第 12 週週一 09:00 還有課不到三堂＝手機提醒一次（每學期一次）。 */
const HONOR=(function(){
  const S={};
  const LAW_TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const T=d=>typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  S.prev=id=>{ const i=LAW_TERMS.indexOf(id); return i>0?LAW_TERMS[i-1]:null; };
  /* 那一學期的法律科平均答對題數（沒有法律科、全部沒開考＝null）*/
  S.avg=function(G,termId){ if(typeof CLS==='undefined') return null; const R=CLS.rec(G); let n=0, sum=0;
    for(const c of CLS.termCourses(G,termId)){ if(!CLS.isExamCourse(c)) continue; const e=(R.exam||{})[termId+':'+c.id+':final'];
      if(e&&e.status==='insufficient') continue; const p=CLS.examPool?CLS.examPool(c.id,termId,'final'):null; if(!e&&p&&p.cls.length+p.bank.length+p.ai.length<5) continue;   /* 題庫不足沒開考：不算 */
      n++; sum+=e&&e.status==='done'?(e.correct|0):0; }   /* 缺考算 0 */
    return n?sum/n:null; };
  S.won=(G,termId)=>{ const a=S.avg(G,termId); return a!=null&&a>=4; };
  S.REL={ heroine_01:{fam:4,trust:6,npcRom:6}, heroine_05:{fam:2,trust:4,npcRom:3} };
  S.OTHERS=['heroine_02','heroine_03','heroine_04','classmate_peishan','kexin','zhe','yu','classmate_bohan','classmate_xinci','kai'];
  S.announce=function(G,termId){ const F=G.flags, k='HONOR_'+termId; if(F[k]!=null) return false; F[k]=S.won(G,termId); if(!F[k]) return false;
    F.HONOR_LAST=termId; const nm=typeof CLS!=='undefined'&&CLS.termName?CLS.termName(termId):termId;
    if(typeof PHONE!=='undefined') PHONE.post(G,{th:'sys',text:'系上公告：'+nm+'書卷獎名單。名單上有你。'});
    if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ for(const id in S.REL) SOCIAL.adjust(id,S.REL[id],'honor');
      for(const id of S.OTHERS) if(SOCIAL.has&&SOCIAL.has(id,'FIRST_MET')) SOCIAL.adjust(id,{fam:2,trust:1},'honor'); }
    return true; };
  /* 手機規則（每個整點，跳日期的時候也跑）*/
  S.phone=function(G){ if(!law(G)) return; const t=T(G.day); if(!t) return; const wd=G.weekday;
    /* 書卷獎：下學期第 2 週週一 09:00 以後 */
    if(t.week>=2&&!(t.week===2&&(wd===0||(wd===1&&G.hour<9)))){ const pv=S.prev(t.id); if(pv&&G.flags['HONOR_'+pv]==null) S.announce(G,pv); }
    /* 看出席的課：第 12 週週一 09:00 起，這學期還有不到三堂的課 */
    if(t.week===12&&!(wd===1&&G.hour<9)&&wd!==0&&typeof CLS!=='undefined'&&CLS.attCourse){ const tag='att_warn_'+t.id; if(sent(G,tag)) return;
      const R=CLS.rec(G), low=CLS.termCourses(G,t.id).filter(c=>CLS.attCourse(c)&&(R.attend[c.id]||0)<CLS.ATT_PASS);
      if(low.length&&typeof PHONE!=='undefined') PHONE.at(G,G.day,Math.max(9,G.hour),[{th:'sys',text:'第 12 週提醒：'+low.map(c=>c.name+' 出席 '+(R.attend[c.id]||0)+' 堂').join('、')+'。看出席的課要三堂才及格。'}],tag); } };
  /* 公告以後第一次見面（AA_124 2-5）*/
  S.preTalk=async function(GM,who,id){ const G=GM.G, F=G.flags, tm=F.HONOR_LAST; if(!tm||!F['HONOR_'+tm]) return;
    if(id==='heroine_01'&&F['HONOR_AN_'+tm]==null){ F['HONOR_AN_'+tm]=G.day; await GM.say(who,'名單上有你。理由？'); }
    else if(id==='classmate_bohan'&&F['HONOR_BH_'+tm]==null){ F['HONOR_BH_'+tm]=G.day; await GM.say(null,'（柏翰把名單拍下來。）'); await GM.say(who,'……好。'); } };
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push(S.preTalk); }
  return S;
})();
if(typeof window!=='undefined') window.HONOR=HONOR;

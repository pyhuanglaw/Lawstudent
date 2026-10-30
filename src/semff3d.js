/* ===== 學期中的快轉（FF-SEMESTER-1023；使用者 10-23 08:0x「能不能有一個跳過整個禮拜的選項 自動會去上課之類的? 劇情強制撥放 不然要玩好久」「或者跳到下一個事件的選項」；
   10-23 12:2x 選擇題「我自己直接做」）=====
   法律系、學期中（寒暑假照舊用 home3d.js 的快轉）：宿舍的床多一個「快轉」→「到下一個有事的時候」／「過一週」／「不用了」。
   - 跳的方式：每 15 分鐘一步（照 home3d.js y0Jump）；每過一個整點跑一次手機規則（訊息照時間收進來）、月初的生活費。
   - 自動上課：沒有劇情的課＝照常記出席（和真的上完一堂記的一樣：done、attend、prep；不演課堂、沒有課堂提問）。
   - 停下來、照常演（劇情不跳過）：
     · 有劇情的課（考試、特殊課堂、課前／課後的人物事件、課堂那一句後面的段落 CLS.IN_CLASS 有 due 的、週層級回想句 recall 有字的）：上課前 20 分鐘；
     · 有人物事件的活動（加入過的社課的人物事件、活動本身是劇情、活動結束後的事件）：活動前 20 分鐘；
     · 床的鬧鐘那些時間（STORY.wakeAlarms：考試前 1 小時、答應的當面約前 30 分鐘、校外約會、標 alarm 的出遊、事件包的 ALARMS）、
       睡著也會醒來的時間（STORY.lawWakeAt）、跳過時間的停點（CLS.STOP_FNS：她打來的電話）；
     · 該出發的出遊（OUT.due）、新冒出來的一定要演的事件（trigger auto、不用走近、只演一次；人在宿舍的房間也算）；
     · 收到要回的訊息、當面約的邀請：停在那一刻打開手機，關掉以後接著跳到原本選的時間（照寒暑假的快轉，D103）。
   - 晚上 23:30 有睡著以後才演的事件（trigger sleep）：跳的途中照睡覺那樣演完再接著跳（STORY.nightEvent）。
   - 上限：「到下一個有事的時候」最多 21 天、不超過學期最後一天 20:00；「過一週」＝7 天後 07:30。快轉期間不會有偶遇、不會自己去找人（AA_109 7-1）。
   - 停下來以後：日期字卡（地點寫停下來的原因或「宿舍」）、跨日照早上那一套（CLS.morning：成績、選課）、目標照下一堂課、自動存檔。系統字，不是台詞。
   測試：node tests/semff_unit.js */
'use strict';
const SEMFF=(function(){
  const S={};
  const T=(d,h)=>d*24+h;
  const now=G=>T(G.day,+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
  const dayOf=t=>Math.floor(t/24+1e-9);
  const hhmm=x=>{ const m=Math.round(((x%24)+24)%24*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  const dateLabel=t=>{ const d=dayOf(t), q=CALENDAR.dateOf(d); return q.m+'/'+q.d+'（'+'日一二三四五六日'[q.wd%7]+'）'+hhmm(t-d*24); };
  S.PRE=1/3;   /* 有劇情的課、活動：前 20 分鐘停 */
  S.NIGHT=23.5;   /* 睡著以後才演的事件：照 23:30 上床問一次 */
  S.MAX_DAYS=21;
  /* 能不能快轉：法律系、學期中、不在開場的兩天、不在寒暑假（home3d 的快轉）、不在國外、不在畢業後篇 */
  S.on=function(G){ if(!law(G)||typeof CALENDAR==='undefined'||typeof CLS==='undefined') return false;
    if(typeof STORY!=='undefined'){ if(STORY.opening&&STORY.opening(G)) return false; if(STORY.abroad&&STORY.abroad(G)) return false; }
    if(typeof HOME!=='undefined'&&((HOME.lawBreak&&HOME.lawBreak(G))||(HOME.at&&HOME.at(G)))) return false;
    if(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G)) return false; if(typeof EXCH!=='undefined'&&EXCH.inUS&&EXCH.inUS(G)) return false;
    if(typeof PG!=='undefined'&&PG.on&&PG.on(G)) return false;
    return !!CALENDAR.termOf(G.day)&&S.end(G)>now(G)+0.5; };
  S.end=function(G){ const t=CALENDAR.termOf(G.day), r=t&&CALENDAR.termDays?CALENDAR.termDays(t.id):null; if(!r) return now(G); return Math.min(T(r.to,20),T(G.day+S.MAX_DAYS,8)); };
  S.opts=function(G){ if(!S.on(G)) return null; const e=S.end(G), w=Math.min(T(G.day+7,7.5),e);
    return [{t:'到下一個有事的時候',hint:'有劇情、要回的訊息、約好的事就停（最多到 '+dateLabel(e)+'）；沒有劇情的課自動去上',to:e},
      {t:'過一週',hint:'到 '+dateLabel(w)+'（中間有事會先停；沒有劇情的課自動去上）',to:w},{t:'不用了',to:null}]; };

  /* ---------- 這堂課、這個活動有沒有劇情：把時間、地點暫時放到那一刻檢查，檢查完放回去 ---------- */
  const at=(G,day,h,zone,f)=>{ const k={day:G.day,hour:G.hour,weekday:G.weekday,zone:G.zone}; G.day=day; G.hour=h; G.weekday=wdOf(day); if(zone) G.zone=zone; try{ return f(); } catch(e){ console.warn('SEMFF check',e); return false; } finally { G.day=k.day; G.hour=k.hour; G.weekday=k.weekday; G.zone=k.zone; } };
  const evOk=e=>typeof EVENTS!=='undefined'&&!!EVENTS.check&&!!EVENTS.check(e,{chain:true});
  S.classEventful=function(G,it){ if(!it||!it.c) return false; if(it.exam) return 'exam'; const c=it.c;
    return at(G,it.day,it.t0,it.room&&it.room.zone,()=>{
      if(CLS.storyClass&&CLS.storyClass(G,it)) return 'story';
      if((c.specials||[]).some(q=>q.w===it.week&&q.content)) return 'special';
      if(CLS.SPECIAL_PRE&&CLS.SPECIAL_PRE[c.id+'|'+it.week]) return 'special';
      if(typeof STORY_EVENTS!=='undefined'&&c.kind!=='service'){
        if(STORY_EVENTS.some(e=>(e.beforeClass===c.id||(typeof e.beforeClass==='function'&&e.beforeClass(it)))&&evOk(e))) return 'before';
        G.hour=it.t1; const af=STORY_EVENTS.some(e=>(e.afterClass===c.id||(typeof e.afterClass==='function'&&e.afterClass(it)))&&(e.afterExam?e.afterExam===it.exam:!it.exam)&&evOk(e)); G.hour=it.t0; if(af) return 'after'; }   /* afterClass 函式（同 classes3d.js afterClassEvent）*/
      if(c.kind==='service') return false;
      const ct=CLS.content?CLS.content(it):null;
      if(ct&&CLS.recallText&&(ct.recall||[]).some(r=>(!r.after||r.after==='line')&&CLS.recallText(G,r,it))) return 'recall';
      if((CLS.IN_CLASS||[]).some(f=>typeof f.due==='function'&&f.due(G,it,ct))) return 'inclass';   /* 掛進 CLS.IN_CLASS 的劇情段：函式上掛 due(G,it,ct)＝這一堂會演 */
      return false; }); };
  S.actEventful=function(G,a,day){ const club=a.kind==='club';
    return at(G,day,a.t0,a.zone,()=>{ if(club&&G.flags['CLUB_'+a.id]&&CLS.clubEvent&&CLS.clubEvent(G,a)) return 'club';
      if(a.event&&CLS.actEvent&&CLS.actEvent(G,a)) return 'event';
      if((!club||G.flags['CLUB_'+a.id])&&CLS.afterActEvent){ G.hour=a.t1; if(CLS.afterActEvent(G,a)) return 'after'; }
      return false; }); };
  /* 自動上課：和真的上完一堂記的一樣（classes3d.js S.attend 結尾；服務學習只記次數）*/
  S.autoAttend=function(G,it){ const R=CLS.rec(G), c=it.c; if(R.done[it.key]) return false; R.done[it.key]=1; R.attend[c.id]=(R.attend[c.id]||0)+1; if(c.kind!=='service') R.prep[c.id]=(R.prep[c.id]||0)+1; return true; };

  /* ---------- 那一天的停點：鬧鐘、電話；課和活動在 S.stopIn 到那一刻才判斷（跳的途中條件可能會變）---------- */
  S.dayStops=function(G,d){ const out=[], push=(h,why)=>{ if(h!=null&&isFinite(h)) out.push({t:T(d,h),why:why||'有事'}); };
    if(typeof STORY!=='undefined'&&STORY.wakeAlarms) at(G,d,0,null,()=>{ for(const a of STORY.wakeAlarms(G,d)) push(a.h,a.why); });
    if(CLS.STOP_FNS) at(G,d,0,null,()=>{ for(const f of CLS.STOP_FNS){ try{ for(const a of (f(G,0,24)||[])) if(a) push(a.h,a.why); }catch(e){ console.warn('SEMFF STOP_FNS',e); } } });
    return out; };
  /* (a,b] 之間第一個停點；沒有劇情的課記進 plain（下課那一刻自動上）*/
  S.stopIn=function(G,a,b,plain,cache){ let best=null; const c=(t,why,x)=>{ if(t>a+1e-6&&t<=b+1e-6&&(!best||t<best.t)) best={t,why,x}; };
    for(let d=dayOf(a);d<=dayOf(b+S.PRE);d++){
      if(CALENDAR.termOf(d)){
        for(const it of CLS.dayItems(G,d)){ const st=T(d,it.t0)-S.PRE; if(st<=a+1e-6||st>b+1e-6||CLS.rec(G).done[it.key]||plain.has(it.key)) continue; const k=S.classEventful(G,it); if(k) c(st,(k==='exam'?'考試：':'')+it.c.name,{class:it.key,kind:k}); else plain.add(it.key); }
        if(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list) for(const q of ACTIVITIES.list){ const st=T(d,q.t0)-S.PRE; if(st<=a+1e-6||st>b+1e-6||!ACTIVITIES.on(q,d,G)||(ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,q.id,d))) continue; const k=S.actEventful(G,q,d); if(k) c(st,q.title||'活動',{act:q.id,kind:k}); } }
      if(!cache.has(d)) cache.set(d,S.dayStops(G,d)); for(const s of cache.get(d)) c(s.t,s.why,{alarm:true}); }
    if(typeof STORY!=='undefined'&&STORY.lawWakeAt){ const w=STORY.lawWakeAt(G); if(w!=null) c(T(G.day,w),'手機響了',{wake:true}); }
    return best; };

  /* 一定要演的事件（trigger auto、不用走近、只演一次；地點照事件寫的，人在宿舍房間）：跳之前先記下已經成立的，途中「新成立」的才停 */
  S.mustEvs=function(G){ if(typeof STORY_EVENTS==='undefined'||typeof EVENTS==='undefined'||!EVENTS.check) return []; const done=(G.events&&G.events.done)||{}, out=[];
    for(const e of STORY_EVENTS){ if(e.trigger!=='auto'||!e.once||done[e.id]||e.retired||e.off||e.near||e.spawn||e.random_weight!==undefined) continue; let ok=false; try{ ok=!!EVENTS.check(e); }catch(err){ ok=false; } if(ok) out.push(e.id); } return out; };
  S.snap=G=>({asks:new Set(typeof PHONE!=='undefined'&&PHONE.pending?PHONE.pending(G):[]),inv:new Set((G.invites||[]).filter(iv=>iv.state==='offered'||iv.state==='changed').map(iv=>iv.id)),evs:new Set(S.mustEvs(G))});
  S.newThing=function(G,w){ if(typeof PHONE!=='undefined'&&PHONE.pending&&PHONE.pending(G).some(m=>!w.asks.has(m))) return 'msg'; if((G.invites||[]).some(iv=>(iv.state==='offered'||iv.state==='changed')&&!w.inv.has(iv.id))) return 'msg';
    return S.mustEvs(G).some(id=>!w.evs.has(id))?'event':null; };
  const setTime=(G,E,tt)=>{ const d=dayOf(tt); if(d>G.day){ G.day=d; G.weekday=wdOf(d); G.energy=100; G.flags.companion=null; G.flags.nightKai=false; G.weather=(CALENDAR.typhoon&&CALENDAR.typhoon(d))?'rain':(Math.random()<0.7?'clear':'cloudy'); } G.hour=tt-G.day*24; if(E) E.hour=G.hour; };   /* 和 home3d.js 的 setTime 一樣（DL-02：體力固定 100）*/
  /* 睡著以後才演的事件（trigger sleep；EVENTS.sleepEvent 照上床的時間判斷）*/
  const sleepDue=G=>typeof EVENTS!=='undefined'&&EVENTS.sleepEvent?EVENTS.sleepEvent():null;

  /* 跳到 to（中間的停點先停）：回傳 {why:'stop'|'out'|'msg'|'event'|'end'|'now', stop, auto, msgs} */
  S.jump=async function(GM,to){ const G=GM.G, E=GM.E, t0=now(G); if(to<=t0+1e-6) return {why:'end',auto:0,msgs:0};
    const plain=new Set(), cache=new Map();
    /* 現在已經在課前 20 分鐘以內的課：有劇情就不跳（先去上），沒有就照樣自動上 */
    for(const it of CLS.dayItems(G,G.day)){ if(CLS.rec(G).done[it.key]||T(G.day,it.t0)<=t0+1e-6||T(G.day,it.t0)-S.PRE>t0+1e-6) continue; const k=S.classEventful(G,it); if(k) return {why:'now',stop:{t:t0,why:(k==='exam'?'考試：':'')+it.c.name},auto:0,msgs:0}; plain.add(it.key); }
    const w0=S.snap(G); let tt=t0, n=0, mo=null, why=null, st=null, auto=0;
    if(GM.fade) await GM.fade(true);
    try{
      while(tt<to-1e-6){ const nt=Math.min(to,(Math.floor(tt*4+1e-6)+1)/4);
        st=S.stopIn(G,tt,nt,plain,cache); const te=st?st.t:nt;
        /* 這一步經過的、沒有劇情的課：下課那一刻記出席 */
        for(let d=dayOf(tt);d<=dayOf(te);d++){ if(!CALENDAR.termOf(d)) continue; for(const it of CLS.dayItems(G,d)){ const e=T(d,it.t1); if(e<=tt+1e-6||e>te+1e-6||!plain.has(it.key)) continue; if(S.autoAttend(G,it)) auto++; } }
        const night=dayOf(tt)*24+S.NIGHT, crossN=night>tt+1e-6&&night<=te+1e-6;
        const hPrev=Math.floor(tt+1e-6); tt=te; setTime(G,E,tt);
        if(Math.floor(tt+1e-6)>hPrev){
          if(typeof STORY!=='undefined'&&STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f){ if(GM.money) GM.money(f.amount); mo=STORY.fundsJoin?STORY.fundsJoin(mo,f):f; } }
          if(typeof PHONE!=='undefined'){ try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); PHONE.tick(G,out=>{ n+=out.length; }); }catch(e){ console.warn('SEMFF phone',e); } } }
        if(st){ why='stop'; break; }
        if(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G)){ why='out'; break; }
        { const nw=S.newThing(G,w0); if(nw){ why=nw; break; } }
        if(crossN&&sleepDue(G)&&typeof STORY!=='undefined'&&STORY.nightEvent){ const d0=G.day; try{ await STORY.nightEvent(GM); }catch(e){ console.warn('SEMFF nightEvent',e); } const tn=Math.max(now(G),T(d0,27)); setTime(G,E,tn); tt=tn; }   /* 演完（03:00，或事件自己的時間）接著跳 */
      }
      if(!why) why='end';
    } finally {
      if(E&&E.setWeather) E.setWeather(G.weather); if(GM.updateHUD) GM.updateHUD();
      if(GM.titleCard) await GM.titleCard(dateLabel(now(G)),why==='stop'&&st?st.why:(why==='out'?'該出發了':'宿舍'),2400);
      if(GM.fade) await GM.fade(false); }
    if(mo&&GM.toast) GM.toast(mo.text,3800); if(n&&GM.phoneBadge) GM.phoneBadge();
    return {why,stop:why==='stop'?st:null,auto,msgs:n}; };

  /* 床的選單「快轉」（story3d.js bedScene）*/
  S.menu=async function(GM){ const G=GM.G, O=S.opts(G); if(!O) return false; GM.sceneBegin();
    try{ const o=O[await GM.choose(O.map(x=>({t:x.t,hint:x.hint})),{menu:true})]; if(!o||o.to==null) return false;
      const d0=G.day; let r=null, auto=0;
      for(let k=0;k<40;k++){ r=await S.jump(GM,o.to); auto+=r.auto|0; if(r.why!=='msg') break;
        const opened=typeof HOME!=='undefined'&&HOME.ffPhone?await HOME.ffPhone(GM,true):false; if(!opened||now(G)>=o.to-1e-6||!S.on(G)||(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G))) break; }   /* 要回的訊息：停在那一刻打開手機，關掉以後接著跳（D103）*/
      if(r&&r.why==='now'){ if(GM.toast) GM.toast(r.stop.why+'快開始了，先去上課。',3200); return r; }
      if(auto&&GM.toast) GM.toast('快轉的這幾天，你照常去上了 '+auto+' 堂課。',3200);
      if(G.day>d0&&CLS.morning){ try{ await CLS.morning(GM); }catch(e){ console.warn('SEMFF CLS.morning',e); } }
      if(CLS.refreshGoal) CLS.refreshGoal(GM); if(GM.autosave) GM.autosave(); return r; }
    finally { GM.sceneEnd(); } };
  return S;
})();

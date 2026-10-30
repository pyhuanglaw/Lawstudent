/* ===== 她們主動約你（HEROINE-ASKS-1028；AA_494 b3ecc563c；使用者 2026-10-28 00:0x「為什麼都要我主動約女生 如果變熟好感度高 他們不能自己約我嗎 戶外景點也可阿」「超沒有互動感」，USER_WANTS X118★）=====
   熟了、好感高的女主角（七位）自己用手機約你：
   - 日常（INV 的 8 處）：前一天晚上照她的時間傳 → INV 的邀約（手機上「答應／改天／不了」），答應以後時間到兩人都在就開始（INV 原本的見面、地點記憶、對方約的又赴約信任 +1）。
     她本來就在那裡的（語彤顧店的麵店、週六的溫州街，here）＝只問一聲；答應了玩家直接去（INV 的 here，AA_494 第 3 節）。
   - 週末校外（DATE 的地點）：週三晚上傳，約週六或週日；答應＝DATE.book（by:'npc'，算一次正式校外約會）。
   規則（門檻、頻率、不約的時候、優先順序）照 AA_494 第 0 節；地點、時間、台詞照第 1～7 節（src/data/heroine_asks.js）。
   流程：每天 12:00 以後第一次（S.phone，STORY.PHONE_RULES）決定今天要不要傳、傳哪一則（S.plan），到了她傳訊息的時間才真的傳（S.fire；睡過頭、跳時間照原本的時間補在手機裡）。
   回覆：INV.ON_ANSWER（日常）、PHONE.ON_ANSWER（校外、here）→ 她回那一句（S.onInv、S.onAsk）。
   存檔：G.flags.HASK＝{sent:[{sid,id,k:'d'|'o',place|loc,v:'pre'|'dat',day,h|depart,kind,send:{day,h},redo,state,iv|ask}], st:{人物:{d,o,last,places:{},no,pause}}, redo:[{id,k,place|loc,due,sid}], plan:決定過的那一天, seq}；
   舊存檔沒有＝從那一天開始算（AA_494 第 8 節第 4 點）。測試：node tests/heroine_asks_unit.js
   AA_532（企劃線 ade80d22f，任務 AA532-VAC-FIX-1030）：除夕前一天～初三不約（S.cny）；寒暑假用放假版的句子（data 的 vac，sent 記 vac:true）；芷若校外答應 yesOut。測試：node tests/aa532_vac_unit.js */
'use strict';
const HASK=(function(){
  const S={};
  const D=()=>typeof HASK_DATA!=='undefined'?HASK_DATA:{people:{}};
  const P=id=>(D().people||{})[id]||null;
  S.rec=function(G){ const F=G.flags||(G.flags={}); const R=F.HASK&&typeof F.HASK==='object'?F.HASK:(F.HASK={}); if(!Array.isArray(R.sent)) R.sent=[]; if(!R.st||typeof R.st!=='object') R.st={}; if(!Array.isArray(R.redo)) R.redo=[]; return R; };
  const st=(G,id)=>{ const R=S.rec(G); const s=R.st[id]||(R.st[id]={}); if(!s.places) s.places={}; return s; };
  const wdOf=(G,day)=>((G.weekday+(day-G.day))%7+7)%7;
  const dk=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const abs=(day,h)=>day*24+h;
  const nameOf=id=>(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(id):id;
  const dating=(G,id)=>!!(G.flags&&G.flags['dating_'+id]===true);
  S.stage=(G,id)=>{ const n=typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):0; return typeof INV!=='undefined'&&INV.capStage?INV.capStage(G,id,n):n; };   /* 分手後的冷淡期照朋友的階段（INV.capStage）*/
  const termOf=day=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(day):null;
  /* 考試週和考前一週（AA_494 0-4：期中第 8～9 週、期末最後兩週，加考前一週＝第 7 週、倒數第三週）*/
  S.examish=function(day){ const T=termOf(day); if(!T) return false; const W=((typeof CALENDAR!=='undefined'&&CALENDAR.TERMS||[]).find(x=>x.id===T.id)||{}).weeks||16; return (T.week>=7&&T.week<=9)||T.week>=W-2; };
  /* 各人自己的期間（AA_494 第 1～7 節）：寫在日期上的；在國外、回老家、出隊照 STORY.presence（S.block）*/
  S.PERIOD={
    heroine_05:(G,day)=>{ const a=dk('2026-02-02'), b=dk('2029-05-22'), c=dk('2029-05-29'); if(a!=null&&day<a) return 'sisExam'; if(b!=null&&c!=null&&day>=b&&day<=c) return 'sisOral';   /* 筆試以前只回事務（AA_284）、口試前一週 */
      { const n0=dk('2029-02-12'), n1=dk('2029-02-16'); if(n0!=null&&n1!=null&&day>=n0&&day<=n1) return 'sisCny'; }   /* AA_523 6-8（企劃線 0d7b5388b）：2029 春節 2/12～2/16 她在家，不主動約（原本除夕約初一）*/
      if(typeof SISB4!=='undefined'&&SISB4.brokeUp&&SISB4.brokeUp(G)){ const rb=SISB4.rebuild?SISB4.rebuild(G):null; if(!(rb&&rb.done)) return 'sisEx'; }   /* AA_523 6-9：分開過的（前任、被發現退回朋友）不收，等「4-1 她要的時間」這一次分開演過（SISB4.rebuild().done）才收（原本照朋友版收）*/
      return ''; },
    classmate_peishan:(G,day)=>{ const a=dk('2026-12-18'), b=dk('2027-08-06'); return a!=null&&b!=null&&day>=a&&day<=b?'psGone':''; }   /* 重考消失期 */
  };
  /* 那一週她已經有劇情的邀約（對方約你、不是這一份）：這一份那一週不發（AA_494 0-5）。以安的公法讀書會（INV.anAsk）只算她那一週的日常 */
  const weekStart=(G,day)=>day-((wdOf(G,day)+6)%7);
  const isAnAsk=iv=>iv.who==='heroine_01'&&typeof INV!=='undefined'&&!!INV.AN_ASK&&iv.place===INV.AN_ASK.place;
  /* AA_523 6-7（企劃線 0d7b5388b；技術修正）：也看 OUT 的出遊——那一週有她的劇情出遊（事件的 participants 有她；校外約會 dateTrip 不算，DATE 自己會擋），
     或她已經排好、傳了要你回的劇情私訊（回覆期限在那一週；HASK 自己的不算）：例 美國路線交往中 1/3 21:00 伴手禮那則（1/6 11:30 家裡的中飯，sis_b13_3d.js）*/
  const evHas=(evId,id)=>{ const ev=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===evId):null; return !!ev&&Array.isArray(ev.participants)&&ev.participants.includes(id); };
  S.OUT_SKIP=new Set(['ev_sis_y4_desks']);   /* AA_523 第 10 節（企劃線 28c56dfdc）：大四下每週三的書桌夜（2/28～5/23，r3_3d.js r3_desk_*）每週固定、可以不去，不算——算進去的話她整整十三週都不主動約 */
  S.storyOut=(G,id,w)=>(G.outings||[]).some(q=>q&&!q.dateTrip&&q.state!=='cancelled'&&q.day!=null&&weekStart(G,q.day)===w&&!S.OUT_SKIP.has(q.ev)&&evHas(q.ev,id));
  S.storyDm=(G,id,w)=>{ const ok=it=>!!it&&!!it.ask&&it.from===id&&it.th==='p:'+id&&String(it.ask.id||'').indexOf('hask_')!==0&&it.ask.until!=null&&weekStart(G,Math.floor((it.ask.until-0.01)/24))===w;
    const P=typeof PHONE!=='undefined'&&PHONE.rec?PHONE.rec(G):null; if(P&&Array.isArray(P.q)&&P.q.some(q=>(q.items||[]).some(ok))) return true; return (G.msgs||[]).some(ok); };
  S.storyAsk=function(G,id,day,k){ const w=weekStart(G,day); return (G.invites||[]).some(iv=>iv.who===id&&iv.by==='npc'&&!iv.hask&&weekStart(G,iv.day)===w&&(k==='d'||!isAnAsk(iv)))||S.storyOut(G,id,w)||S.storyDm(G,id,w); };
  /* 你約過她、見到面（INV 的 by:'player' done；DATE 的 by:'player' done）：交往前 5 天、交往中 3 天她不約 */
  S.lastMet=function(G,id){ let d=-1e9; for(const iv of (G.invites||[])) if(iv.who===id&&iv.by==='player'&&iv.state==='done') d=Math.max(d,iv.day); for(const t of (G.trips||[])) if(t.who===id&&(t.by||'player')==='player'&&t.status==='done') d=Math.max(d,t.day); return d; };
  /* 這一天整個不約的原因（空字串＝可以）*/
  /* AA_532 第 1 節（企劃線 ade80d22f；第①級）：過年——除夕前一天～初三，七位都不主動約（約的那一天在 S.block、送出的那一天在 S.candidates；除夕照 calendar.js）。節日邀約（情人節）不受影響 */
  S.cny=function(day){ if(typeof CALENDAR==='undefined'||!CALENDAR.holiday) return false; for(let x=day-3;x<=day+1;x++) if(CALENDAR.holiday(x)==='除夕') return true; return false; };
  /* AA_532 第 3 節：寒暑假（HOME.breakOf：兩學期中間的放假）用放假版的句子（data 的 vac：{line, h}）*/
  S.vacDay=day=>typeof HOME!=='undefined'&&!!HOME.breakOf&&!!HOME.breakOf(day);
  S.vOf=(v,vac)=>vac&&v&&v.vac?Object.assign({},v,v.vac):v;
  S.block=function(G,id,day){ if(!P(id)) return 'nodata'; if(G.stage==='econ') return 'econ';   /* AA_529 第 1 點（企劃線 881029f98）：經濟系那一年不約——台詞、地點是政大那一套，她在高雄、衝刺班時也會約，回程還出「回到台大」 */
    if(S.cny(day)) return 'cny';   /* AA_532 第 1 節 */
    if(typeof INV!=='undefined'){ if(INV.cool&&INV.cool(G,id)) return 'cool'; if(INV.hasContact&&!INV.hasContact(G,id)) return 'contact'; }
    if(typeof SOCIAL!=='undefined'&&SOCIAL.stage&&SOCIAL.stage(id)==='STRANGER') return 'stranger';
    if(typeof MREL!=='undefined'){ if(MREL.zzRefusing&&MREL.zzRefusing(G,id)) return 'mrel'; if(id==='kexin'&&MREL.kxOdPaused&&MREL.kxOdPaused(G)) return 'kxPaused'; }
    { const c=(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])||{}; if(c.partner&&!dating(G,id)&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))) return 'herPartner'; }   /* 她自己有伴侶（C5）*/
    { const s=S.rec(G).st[id]; if(s&&s.pause!=null&&day<s.pause) return 'pause'; }
    if(S.examish(day)) return 'exam';
    if(typeof TERMEND!=='undefined'&&TERMEND.window&&TERMEND.window(Object.assign({},G,{day}))) return 'termend';   /* 學期末心意邀約的窗口（期末考完到放假）：都不發 */
    if(typeof DATE!=='undefined'){ if(DATE.playerAbroad&&DATE.playerAbroad(G,day)) return 'abroad'; const last=DATE.lastDay?DATE.lastDay():null; if(last!=null&&day>last) return 'graduated'; }
    { const pr=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,Object.assign({},G,{day,hour:12})):{here:true}; if(!pr.here&&pr.kind!=='taipei') return 'away'; }   /* 在臺北、不在台大（BB_163）照約 */
    { const f=S.PERIOD[id]; const w=f?f(G,day):''; if(w) return w; }
    return ''; };
  /* 芷若那一天有沒有咖啡廳的班（句子說「明天沒班」的那幾則；傳訊息的時間：上班的日子 22:40、沒班 20:00）*/
  S.works=function(G,id,day){ if(typeof INV==='undefined'||!INV.busyAt) return false; for(let h=8;h<=22;h+=1){ const e=INV.busyAt(G,id,day,h,1); if(e&&e.act==='barista') return true; } return false; };
  S.sendH=(G,id,day)=>{ const p=P(id); return p.sendOff!=null&&!S.works(G,id,day)?p.sendOff:p.send; };
  /* 日常的一則在那個時間行不行（她的作息、地點開不開、你有沒有約、各人的規則）*/
  S.dailyOk=function(G,id,e,v,day,h){ const Q=typeof INV!=='undefined'&&INV.place?INV.place(e.place):null; if(!Q) return false; const wd=wdOf(G,day), T=termOf(day);
    if(e.here){ if(INV.mineAt&&INV.mineAt(G,day,h,Q.stay)) return false; const en=INV.entAt?INV.entAt(G,id,day,h):null; if(!en||(en.zone||en.z)!==Q.zone) return false; }   /* 她本來就在那裡：那時候照作息在那裡、你那時候沒有約 */
    else if(!INV.freeAt(G,id,Q,day,h)) return false;
    if(INV.partnerBlock&&INV.partnerBlock(G,id,Q)) return false;   /* 祐廷和別人交往、她知道：吃飯、散步、一盞不約（AA_494 0-4；INV.partnerBlock）*/
    if(v.off&&S.works(G,id,day)) return false;
    if(id==='heroine_04'){ if((wd===0||wd===6)&&h<14) return false; if(T&&/^Y4/.test(T.id)&&wd>=1&&wd<=5&&h<20) return false; }   /* 子晴：週末兩點以前在睡覺；大四平日 20:00 以前在工作室 */
    if(id==='heroine_05'&&wd>=1&&wd<=5&&h>=9&&h<17) return false;   /* 學姊：平日 9～17 在研究室、法圖 */
    if(id==='heroine_01'&&wd===4&&T&&!/^Y1/.test(T.id)&&h<21.5&&h+Q.stay>20) return false;   /* 以安：大二起週四 20:00～21:30 公法讀書會 */
    if(id==='classmate_peishan'&&T&&T.id==='Y2S2'&&!(e.place==='library'&&(wd===0||wd===6))) return false;   /* 沛珊大二下重考：只約週末總圖 */
    return true; };
  /* 校外的地點交往前約不約：半日、晚上；臺北、新北；不用開車（AA_494 0-1）*/
  const LOCAL=['臺北市','新北市'];
  S.outKindOk=function(G,id,e,kind){ const L=typeof DATE!=='undefined'&&DATE.loc?DATE.loc(e.loc):null; if(!L) return false; if(kind==='overnight') return false;
    if(dating(G,id)) return kind==='half'||kind==='evening'||kind==='day';
    return (kind==='half'||kind==='evening')&&LOCAL.includes(L.area)&&!L.needsCar&&(L.transport||[]).some(t=>t.mode!=='car'); };
  const wishLocs=()=>{ const out=new Set(); if(typeof DATE!=='undefined'&&DATE.HEROINES&&DATE.wishOf) for(const h of DATE.HEROINES){ const w=DATE.wishOf(h); if(w) out.add(w); } return out; };   /* 心願地點（誰的都一樣）永遠不主動約（AA_494 0-1）*/
  /* 今天（day0）可以傳的那幾則 */
  S.candidates=function(G,day0,redo){ const out=[], R=S.rec(G), W=wishLocs(), now=abs(G.day,G.hour%24);   /* redo＝{id,k}：改天的那一次不看「多久約一次」*/
    if(typeof TERMEND!=='undefined'&&TERMEND.window&&TERMEND.window(Object.assign({},G,{day:day0}))) return out;   /* 心意邀約的窗口裡：傳的那一天也不傳（約的那一天在 S.block 擋）*/
    if(S.cny(day0)) return out;   /* AA_532 第 1 節：除夕前一天～初三，送出的那一天也不落在這幾天 */
    for(const id of ((typeof DATE!=='undefined'&&DATE.HEROINES)||[])){ const p=P(id); if(!p) continue; const dat=dating(G,id), sn=S.stage(G,id), s=R.st[id]||{};
      if(!dat&&sn<3) continue;
      if(redo&&redo.id!==id) continue; const rd=k=>!!redo&&redo.k===k;
      if(day0-S.lastMet(G,id)<(dat?3:5)) continue;
      const sendH=S.sendH(G,id,day0);
      /* 週末校外：週三晚上傳 */
      if(wdOf(G,day0)===3&&(dat||sn>=6)&&(rd('o')||s.o==null||day0-s.o>=(dat?(id==='kexin'?28:14):28))&&(!redo||rd('o'))&&typeof DATE!=='undefined'){
        const ca=DATE.canAskCore?DATE.canAskCore(G,id):{ok:true};
        if(ca.ok) for(const e of p.out){ const v0=dat?e.dat:e.pre; if(!v0||W.has(e.loc)) continue; const day=day0+(v0.d==='sun'?4:3), vac=S.vacDay(day)&&!!v0.vac, v=S.vOf(v0,vac), kind=e.kind||(v.depart>=17?'evening':'half');
          if(!S.outKindOk(G,id,e,kind)||S.block(G,id,day)||S.storyAsk(G,id,day,'o')) continue;
          const c=DATE.check(G,{who:id,locs:[e.loc],day,depart:v.depart,kind}); if(!c.ok||(c.warns||[]).length) continue;
          out.push({id,k:'o',e,v,vk:dat?'dat':'pre',vac,loc:e.loc,day,depart:v.depart,kind,send:{day:day0,h:sendH}}); } }
      /* 日常：前一天晚上傳（沛珊的「今天晚上」那天 17:00）*/
      if(!(id==='kexin'&&dat)&&(!redo||rd('d'))&&(rd('d')||s.d==null||day0-s.d>=(dat?7:14))) for(const e of p.daily){ if(!dat&&e.th>sn) continue; const v0=dat?e.dat:e.pre; if(!v0) continue;
        const day=day0+(v0.d==='today'?0:1), wd=wdOf(G,day); if((v0.d==='sat'&&wd!==6)||(v0.d==='sun'&&wd!==0)) continue;
        const vac=S.vacDay(day)&&!!v0.vac, v=S.vOf(v0,vac);   /* AA_532 第 3 節：放假版（句子、學姊的時間）*/
        if(S.block(G,id,day)||S.storyAsk(G,id,day,'d')) continue;
        const sh=v.d==='today'?17:sendH; if(v.d==='today'&&now>abs(day0,18)) continue;   /* 「今天晚上」那則（沛珊）：那天 17:00 傳；已經過了 18:00 就不傳 */
        for(const h of v.h){ if(abs(day,h)<=Math.max(now,abs(day0,sh))+0.5) continue; if(!S.dailyOk(G,id,e,v,day,h)) continue;
          out.push({id,k:'d',e,v,vk:dat?'dat':'pre',vac,place:e.place,day,h,send:{day:day0,h:sh}}); break; } } }
    return out; };
  /* 一週最多 3 則、一天最多 1 則；女朋友的排第一，其他人照「最久沒約」的先（AA_494 0-2）；同一個人校外先、日常照最久沒約的地點 */
  S.pick=function(G,day0,cands){ const R=S.rec(G); if(!cands.length) return null;
    if(R.sent.some(x=>x.send.day===day0)) return null; if(R.sent.filter(x=>x.send.day>day0-7&&x.send.day<=day0&&x.state!=='dropped').length>=3) return null;
    const lastOf=id=>{ const s=R.st[id]||{}; return s.last!=null?s.last:-1e9; }, placeLast=(id,pl)=>{ const s=R.st[id]||{}; return (s.places||{})[pl]!=null?s.places[pl]:-1e9; };
    const ord=cands.map((c,i)=>({c,i})).sort((a,b)=>(dating(G,b.c.id)-dating(G,a.c.id))||(lastOf(a.c.id)-lastOf(b.c.id))||((a.c.k==='o'?0:1)-(b.c.k==='o'?0:1))||(placeLast(a.c.id,a.c.place||a.c.loc)-placeLast(b.c.id,b.c.place||b.c.loc))||(a.i-b.i));
    return ord[0].c; };
  /* 改天：3 天後同一個地點再約一次（只再一次；校外照週三才傳＝3 天後的那個週三起）*/
  S.redoCands=function(G,day0){ const R=S.rec(G), out=[]; for(const r of R.redo){ if(r.done||day0<r.due) continue; const all=S.candidates(G,day0,{id:r.id,k:r.k}).filter(c=>(c.place||c.loc)===(r.place||r.loc)); if(all.length) out.push(Object.assign(all[0],{redo:r.sid})); else if(day0>r.due+10) r.done=true; } return out; };   /* 10 天內一直約不成＝這一次的改天作廢 */
  S.plan=function(G){ const R=S.rec(G), day0=G.day; if(R.plan===day0) return null; R.plan=day0;
    const rc=S.redoCands(G,day0); const x=S.pick(G,day0,rc.length?rc:S.candidates(G,day0)); if(!x) return null;
    R.seq=(R.seq|0)+1; const rec={sid:R.seq,id:x.id,k:x.k,vk:x.vk,day:x.day,send:x.send,state:'planned'}; if(x.vac) rec.vac=true;   /* AA_532 第 3 節：放假版（舊存檔沒有＝學期中那一句）*/ if(x.k==='o') Object.assign(rec,{loc:x.loc,depart:x.depart,kind:x.kind}); else Object.assign(rec,{place:x.place,h:x.h,here:!!x.e.here}); if(x.redo){ rec.redo=x.redo; const r=R.redo.find(q=>q.sid===x.redo); if(r) r.done=true; }
    R.sent.push(rec); const s=st(G,x.id); s.last=day0; if(x.k==='o') s.o=day0; else s.d=day0; s.places[x.place||x.loc]=day0;
    if(R.sent.length>60) R.sent.splice(0,R.sent.length-60); return rec; };
  S.entryOf=function(rec){ const p=P(rec.id); if(!p) return null; const list=rec.k==='o'?p.out:p.daily; const e=list.find(q=>(q.place||q.loc)===(rec.place||rec.loc)); return e?{e,v:S.vOf(e[rec.vk],!!rec.vac)}:null; };
  /* 到了她傳訊息的時間：真的傳（訊息時間＝原本排的時間；睡過、跳過也一樣）。那時候已經不行了（約的時間過了、有人先約了）＝這次不傳 */
  S.fire=function(G,rec){ const ev=S.entryOf(rec); if(!ev||!ev.v){ rec.state='dropped'; return false; } const at=rec.send, line=ev.v.line;
    if(S.storyAsk(G,rec.id,rec.day,rec.k)){ rec.state='dropped'; return false; }   /* AA_523 6-7：排好以後那一週多了她的劇情出遊、私訊（例 1/3 中午排、21:00 伴手禮那則）＝這次不傳 */
    if(rec.k==='d'&&!rec.here){ if(abs(rec.day,rec.h)<=abs(G.day,G.hour%24)+0.25||!S.dailyOk(G,rec.id,ev.e,ev.v,rec.day,rec.h)){ rec.state='dropped'; return false; }
      const iv=INV.offer(G,rec.id,rec.place,rec.day,rec.h,line,at); if(!iv){ rec.state='dropped'; return false; } iv.hask=rec.sid; rec.iv=iv.id; rec.state='sent'; return true; }
    const until=rec.k==='o'?abs(rec.day-1,23.98):abs(rec.day,rec.h);
    if(abs(G.day,G.hour%24)>=until){ rec.state='dropped'; return false; }
    rec.ask='hask_'+rec.sid; rec.state='sent';
    PHONE.postAt(G,{th:'p:'+rec.id,from:rec.id,text:line,ask:{id:rec.ask,until,opts:[{t:'答應',post:false},{t:'改天',post:false},{t:'不了',post:false}]}},at.day,at.h);
    return true; };
  S.phone=function(G){ if(!G||typeof PHONE==='undefined'||typeof INV==='undefined'||typeof DATE==='undefined') return; if((G.hour%24)>=12) S.plan(G);
    const now=abs(G.day,G.hour%24); for(const rec of S.rec(G).sent) if(rec.state==='planned'&&now>=abs(rec.send.day,rec.send.h)) S.fire(G,rec); };
  /* ---------- 回覆 ---------- */
  const say=(G,id,text)=>{ if(text&&typeof PHONE!=='undefined') PHONE.post(G,{th:'p:'+id,from:id,text}); };
  const note=(G,text)=>{ if(typeof PHONE!=='undefined') PHONE.post(G,{th:'sys',text}); };
  S.byId=(G,sid)=>S.rec(G).sent.find(x=>x.sid===sid)||null;
  /* 玩家回了：yes／later／no（AA_494 0-2：改天＝3 天後同一個地點再約一次；連續兩次「不了」暫停 4 週，交往中 2 週；不扣任何數值）*/
  S.answered=function(G,rec,ans){ const p=P(rec.id), s=st(G,rec.id); rec.ans=ans; rec.state='answered';
    if(ans==='yes'){ s.no=0; say(G,rec.id,(p.yesBy&&p.yesBy[rec.place||rec.loc])||(rec.k==='o'&&p.yesOut)||p.yes); return; }   /* yesOut：校外那一種換一句（AA_532 第 3 節：芷若週三約週六，不說「明天見」）*/
    if(ans==='later'){ s.no=0; say(G,rec.id,p.later); if(!rec.redo){ const R=S.rec(G), due=rec.k==='o'?G.day+3+((3-wdOf(G,G.day+3)+7)%7):G.day+3; R.redo.push({sid:rec.sid,id:rec.id,k:rec.k,place:rec.place,loc:rec.loc,due}); } return; }
    say(G,rec.id,p.no); s.no=(s.no|0)+1; if(s.no>=2){ s.pause=G.day+(dating(G,rec.id)?14:28); s.no=0; } };
  /* INV.ON_ANSWER：日常（INV 的邀約）的回覆。改天不打開「自己選時間」（她 3 天後會再約）*/
  S.onInv=function(G,iv,ans,res){ if(!iv||!iv.hask) return null; const rec=S.byId(G,iv.hask); if(!rec) return null;
    if(ans==='yes'&&(!res||res.res!=='accept')) return null;   /* 那個時間你已經約了別人：照舊（還可以回）*/
    S.answered(G,rec,ans); return ans==='later'?{noFlow:true}:null; };
  /* PHONE.ON_ANSWER：校外、她本來就在那裡（here）的回覆（opts：0 答應、1 改天、2 不了）*/
  S.onAsk=function(G,m,o,k){ const id=m&&m.ask&&m.ask.id; if(!id||id.indexOf('hask_')!==0) return; const rec=S.byId(G,+id.slice(5)); if(!rec||rec.state!=='sent') return;
    const ans=['yes','later','no'][k]||'no';
    if(ans==='yes'&&rec.k==='o'){ const o2={who:rec.id,locs:[rec.loc],day:rec.day,depart:rec.depart,kind:rec.kind}; const c=DATE.check(G,o2); const t=c.ok?DATE.book(G,Object.assign(o2,{by:'npc'})):c;
      if(!t||!t.ok){ rec.state='answered'; rec.ans='fail'; note(G,'和'+nameOf(rec.id)+'的校外約會排不進行程：'+((t&&t.why)||'時間不行')+'。'); return; } rec.trip=t.trip; }
    S.answered(G,rec,ans); };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof INV!=='undefined'&&Array.isArray(INV.ON_ANSWER)) INV.ON_ANSWER.push((G,iv,ans,res)=>S.onInv(G,iv,ans,res));
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)) PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAsk(G,m,o,k));
  return S;
})();

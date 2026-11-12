/* ===== 故事線的「下次帶你去」變成真的約（AA_716，src/data/arc_invites.js；STUDY-DATE-PROGRESS-1107、USER_WANTS X263）=====
   使用者 11-07 05:1x 對 BB-B：「他有他的故事……有人想健身、有人想旅遊」——故事線那一拍她說「下次帶你去」，這裡讓它真的發生。
   流程：故事線演完那一拍（ARCS.done 記 G.flags.ARC_INVITE[人][拍]＝那天）→ 照 CFG 的時間她傳訊息（PHONE.at；最後一則可以回：三個選項）
     → 回 this／next／late＝排進行程（OUT.plan，時間到了跳「出發」、轉場、演那一場、回來；和期末的飯、跨年一樣）；none＝不排；
     一直沒回（過了回覆期限）＝她回 skip 那一句、不排。
   - 那一場（STORY_EVENTS 的 ev_arcinv_*，trigger:'outing'）：照稿一行一行，（…）是旁白、「…」是她；@early／@late 照你選的班次；@fit／@unfit 照體能（結實以上＝fit，FIT.stageIx）；
     by：那一拍你選過那個（ARCS 的答案）＝訊息（msgs）、開頭幾句（scene0）換、結尾（end）多一句。演完記 set 旗標。
   - dateLoc（語彤淡水 D13、沛珊外澳 D25）：照校外約會算一次（DATE.countVisit；語彤 D13 是她的心願地點＝心願也算）。
   - 可昕買外套：結帳以前她塞給你的襯衫，錢夠就買（扣 cost 元；AA 說數字 LAWWW 定）。
   - 沒排成（none、skip、時間到沒去）：之後見面的中途可以說一次 noPlan（ARCS.rotPick 問 S.np）；沛珊的 noPlan 是那個週六她一個人去傳的照片（noPlanMsg）。
   存檔：G.flags.ARCINV＝{'人:拍':{st:'wait'|'offer'|'planned'|'none'|'skip'|'missed'|'done'|'na', sc:{offer,this,next,late}, until, mode, plan, npUsed}}；舊存檔沒有＝沒演過的拍照常。
   測試：node tests/arc_invites_unit.js */
'use strict';
const ARCINV=(function(){
  const S={};
  const D=()=>(typeof ARC_INV!=='undefined'&&ARC_INV.list)||[];
  const F=G=>G.flags||(G.flags={});
  const T=(d,h)=>d*24+h, now=G=>T(G.day,G.hour);
  S.rec=G=>{ const f=F(G); if(!f.ARCINV||typeof f.ARCINV!=='object') f.ARCINV={}; return f.ARCINV; };
  S.get=key=>D().find(e=>e.key===key)||null;
  S.evId=key=>'ev_arcinv_'+String(key).replace(':','_');
  const beatDay=(G,e)=>{ const I=F(G).ARC_INVITE, m=I&&I[e.who]; return m&&m[e.n]!=null?m[e.n]:null; };
  const wd=d=>CALENDAR.dateOf(d).wd;   /* 1＝週一 … 7＝週日 */
  const nextWd=(d0,w,min)=>{ for(let d=d0+(min|0);d<d0+(min|0)+7;d++) if(wd(d)===w) return d; return null; };
  const ans=(G,e,mem)=>typeof ARCS!=='undefined'&&ARCS.rec?!!ARCS.rec(G,e.who).ans[mem]:false;
  const dk=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  S.DIS=['2026-12-18','2027-08-06'];   /* 沛珊的消失期（AA_716 notes）*/
  /* 下一個寒暑假的第一天（學期第 16 週週日的隔天）*/
  S.breakStart=function(d0){ let best=null; for(const t of (CALENDAR.TERMS||[])){ const r=CALENDAR.termDays&&CALENDAR.termDays(t.id); if(!r) continue; const b=r.to+1; if(b>d0&&(best==null||b<best)) best=b; } return best; };
  /* 什麼時候傳、約哪一天：{offer:{d,h}, this:{d,h}, next|late:{d,h}}；排不出來＝null */
  S.schedule=function(G,e,bd){
    if(e.offer==='break'){ const B=S.breakStart(bd); if(B==null) return null; let sat=nextWd(B,6,0), od=Math.max(B-3,bd+1); const ds=dk(S.DIS[0]), de=dk(S.DIS[1]);
      if(ds!=null&&de!=null&&sat>=ds&&sat<=de){ od=bd+1; sat=nextWd(od,6,1); if(sat>=ds) return null; }   /* 下一個假期在她消失期裡：改成最近的週六 */
      return {offer:{d:od,h:21},this:{d:sat,h:e.h},late:{d:sat,h:e.hLate!=null?e.hLate:e.h}}; }
    const od=bd+(e.offer.dd|0), oh=e.offer.h; let a=null, b=null;
    if(e.day==='sat'){ a=nextWd(od,6,1); b=a+7; }
    else if(e.day==='nextwed'){ const mon=od-(wd(od)-1); a=mon+9; b=a+1; }   /* 下週三（next＝下週四）*/
    else if(e.day==='same'){ a=od; b=od+1; }
    else if(e.day==='fri'){ a=nextWd(od,5,1); b=a+1; }
    else if(e.day==='satsun'){ a=nextWd(od,6,1); b=a+1; }
    if(a==null) return null;
    return {offer:{d:od,h:oh},this:{d:a,h:e.h},next:{d:b,h:e.h}}; };
  const dm=(e,t)=>({th:'p:'+e.who,from:e.who,text:t});
  S.msgsOf=(G,e)=>{ for(const [mem,b] of Object.entries(e.by||{})) if(b.msgs&&ans(G,e,mem)) return b.msgs; return e.msgs; };
  /* 傳訊息（拍演完以後，時間照 CFG；睡過去照原本的時間補）*/
  S.offer=function(G,e,r){ if(typeof PHONE==='undefined'||!PHONE.at) return false; const sc=r.sc, o=T(sc.offer.d,sc.offer.h), t0=Math.max(o,now(G));
    let th=sc.this, th2=sc.next||sc.late;   /* 這次那個時間已經來不及了（拍演得很晚）：this 換成 next */
    if(sc.next&&T(th.d,th.h)-(e.travelH||0)<t0+0.5){ const step=sc.next.d-sc.this.d; sc.this=th=sc.next; sc.next=th2={d:sc.next.d+step,h:sc.next.h}; }
    const U=Math.max(t0+0.5,Math.min(t0+24,T(th.d,th.h)-(e.travelH||0)-0.5)); r.until=U;
    const M=S.msgsOf(G,e).map(t=>dm(e,t)); M[M.length-1].ask={id:'arcinv:'+e.key,until:U,opts:e.opts.map(o=>({t:o.t,say:o.say.map(t=>({from:e.who,text:t})),arcPlan:o.plan,arcRel:o.rel}))};
    const d=Math.floor(t0/24); PHONE.at(G,d,t0-d*24,M,'arcinv_'+e.key); r.st='offer'; return true; };
  /* 沒回、過了期限的那一句（skip）什麼時候傳：一般＝過期那時；下面三則是過去式（「我一個人去了喔！」「週六我在校門口等了一下。」「我自己去買了。」），
     改成約好的那一天（sc.this）的這個時間才傳，文字不動（UX-WEEKEND-ASK-EXPIRE-1108，AA-B 11-08 09:39：約好的時間＋1～2 小時）。已經過了那個時間＝現在傳 */
  S.SKIP_AT={'classmate_peishan:6':7.5,'kexin:6':17.5};   /* kexin:4：CANON-NO-ECON-1112 第三批拿掉 */
  S.skipAt=(G,e,r)=>{ const h=S.SKIP_AT[e.key], th=r&&r.sc&&r.sc.this; if(h==null||!th) return {d:G.day,h:G.hour}; const t=Math.max(T(th.d,h),now(G)), d=Math.floor(t/24); return {d,h:t-d*24}; };
  /* 每次 STORY.phoneRules：拍演完的排訊息；回覆期限過了沒回＝skip */
  S.tick=function(G){ if(!G||!G.flags) return false; const R=S.rec(G); let did=false;
    for(const e of D()){ const bd=beatDay(G,e); if(bd==null) continue; let r=R[e.key];
      if(!r){ const sc=S.schedule(G,e,bd); r=R[e.key]=sc?{st:'wait',sc}:{st:'na'}; }
      if(r.st==='wait'){ did=S.offer(G,e,r)||did; continue; }
      if(r.st==='offer'&&r.until!=null&&now(G)>r.until){ r.st='skip'; if(e.skip.length&&typeof PHONE!=='undefined'&&PHONE.at){ const at=S.skipAt(G,e,r); PHONE.at(G,at.d,at.h,e.skip.map(t=>dm(e,t)),'arcinv_skip_'+e.key); } S.npMsg(G,e,r); did=true; } }
    return did; };
  /* 回了：她回那一句（PHONE 的 say）、好感照選項；this／next／late＝排進行程 */
  S.onAnswer=function(G,m,o){ const id=m&&m.ask&&m.ask.id; if(!G||!id||String(id).indexOf('arcinv:')!==0) return; const key=String(id).slice(7), e=S.get(key), R=S.rec(G), r=R[key]; if(!e||!r||r.st!=='offer') return;
    if(o&&o.arcRel&&Object.keys(o.arcRel).length&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ const d=Object.assign({},o.arcRel); if(!(typeof SOCIAL!=='undefined'&&SOCIAL.romOk&&SOCIAL.romOk(e.who))) delete d.npcRom; SOCIAL.adjust(e.who,d); }
    const p=o&&o.arcPlan; if(!p||p==='none'){ r.st='none'; S.npMsg(G,e,r); return; }
    const slot=p==='next'?r.sc.next:(p==='late'?r.sc.late:r.sc.this); if(!slot){ r.st='none'; return; }
    r.mode=p; r.plan=slot; r.st='planned';
    if(typeof OUT!=='undefined'&&OUT.plan) OUT.plan(G,Object.assign({id:'arcinv_'+key.replace(':','_'),ev:S.evId(key),day:slot.d,h:slot.h,late:0.5,place:e.place,title:e.title,travel:e.travel,travelH:e.travelH||0.25,arcinv:key},e.end&&e.end.back?{back:e.end.back}:null)); };
  /* 沛珊：沒排成＝那個週六早上她一個人去，傳照片 */
  S.npMsg=function(G,e,r){ if(!e.noPlanMsg||!e.noPlan.length||typeof PHONE==='undefined'||!PHONE.at) return; const d=r.sc&&r.sc.this?r.sc.this.d:G.day, t=Math.max(T(d,7.5),now(G)), dd=Math.floor(t/24); PHONE.at(G,dd,t-dd*24,e.noPlan.map(x=>dm(e,x)),'arcinv_np_'+e.key); };
  /* 見面的中途（ARCS.rotPick）：沒排成的那一次，她說一次 noPlan */
  S.np=function(G,who){ const R=S.rec(G); for(const e of D()){ if(e.who!==who||e.noPlanMsg||!e.noPlan.length) continue; const r=R[e.key]; if(r&&['none','skip','missed'].includes(r.st)&&r.npUsed==null&&G.day>(r.npFrom!=null?r.npFrom:-1e9)) return {key:e.key,lines:e.noPlan}; } return null; };
  S.npDone=function(G,key){ const r=S.rec(G)[key]; if(r) r.npUsed=G.day; };
  /* 那一場（2D；OUT.go 演）*/
  const strip=t=>/^「[^「」]*」$/.test(t)?t.slice(1,-1):t;
  const fitOk=G=>{ const f=(G.daily&&G.daily.gym&&+G.daily.gym.fit)||0; return typeof FIT!=='undefined'&&FIT.stageIx?FIT.stageIx(f)>=2:f>=50; };
  const C=f=>({custom:f});
  S.event=function(e){ const key=e.key, R=G=>S.rec(G)[key]||{}, line=t=>{ let c=null; const m=/^@(early|late|fit|unfit)/.exec(t); if(m){ t=t.slice(m[0].length); const k=m[1]; c=k==='early'?G=>R(G).mode!=='late':k==='late'?G=>R(G).mode==='late':k==='fit'?fitOk:G=>!fitOk(G); }
      const it=/^[（📷]/.test(t)?{speaker:null,text:t}:{speaker:e.who,text:strip(t)}; if(c) it.if=C(c); return it; };
    const dlg=[Object.assign({scene:e.bg[0]},e.bg[1]?{bg:e.bg[1]}:{})], s0=Object.entries(e.by||{}).filter(([,b])=>b.scene0), n0=s0.length?Math.max(...s0.map(([,b])=>b.scene0.length)):0, anyS0=G=>s0.some(([mem])=>ans(G,e,mem));
    for(const [mem,b] of s0) for(const t of b.scene0){ const it=line(t); const c0=it.if&&it.if.custom; it.if=C(G=>ans(G,e,mem)&&s0.find(([m])=>ans(G,e,m))[0]===mem&&(!c0||c0(G))); dlg.push(it); }
    const done=new Set(); e.scene.forEach((t,i)=>{ for(const [k,lab,bg] of e.bgAt){ if(!done.has(k)&&t.indexOf(k)>=0){ done.add(k); dlg.push(Object.assign({scene:lab},bg?{bg}:{})); } }
      const it=line(t); if(i<n0){ const c0=it.if&&it.if.custom; it.if=C(G=>!anyS0(G)&&(!c0||c0(G))); } dlg.push(it); });
    for(const [mem,b] of Object.entries(e.by||{})) for(const t of b.end||[]){ const it=line(t); it.if=C(G=>ans(G,e,mem)); dlg.push(it); }
    dlg.push({call:async(G,GM)=>{ S.finish(G,GM,e); }});
    return {id:S.evId(key),title:e.title,participants:[e.who],location:'any',trigger:'outing',once:true,background:'dark',hours:e.hours,dialogue:dlg,
      afterBack:(G,GM)=>S.placeAfter(GM,e),   /* 演完人在哪（BB-B 11-07：原本回到出發前的地方＝學姊騎車演完 23:00 回到已經閉館的總圖大廳）*/
      outingMissed:(G)=>{ const r=S.rec(G)[key]; if(r&&r.st==='planned'){ r.st='missed'; r.npFrom=G.day; S.npMsg(G,e,r); } }}; };
  S.finish=function(G,GM,e){ const r=S.rec(G)[e.key]||(S.rec(G)[e.key]={}); r.st='done'; r.doneDay=G.day; const f=F(G); if(e.set&&f[e.set]==null) f[e.set]=G.day;
    if(e.dateLoc&&typeof DATE!=='undefined'&&DATE.countVisit){ const w=DATE.wishOf?DATE.wishOf(e.who):null; const c=DATE.countVisit(G,e.who,e.place,{wish:w===e.dateLoc}); if(c&&c.counted){ const L=DATE.log(G,e.who); L.byLoc[e.dateLoc]=(L.byLoc[e.dateLoc]|0)+1; } }
    if(e.cost&&(G.money|0)>=e.cost){ G.money=(G.money|0)-e.cost; r.paid=e.cost; if(GM&&GM.toast) GM.toast('買了襯衫（－'+e.cost+' 元）'); }   /* 可昕塞給你的那件襯衫：錢夠就買 */
    if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(e.who,'walk'); };   /* 一起出去一整段：和一起散步同一級（social3d.js ACT）*/
  /* 演完把人放到那一場最後的地方：校園、公館、體育館（PLACES.quickList 的落點，tests/quick_travel_unit.js 驗過站得住）；遠的（淡水、外澳、木柵）＝回家／回宿舍 */
  S.enterSpot=async function(GM,label){ const L=typeof PLACES!=='undefined'&&PLACES.quickList?PLACES.quickList():[], p=L.find(q=>q[1]===label); if(!p||!GM.enter) return false; await GM.fade(true); await GM.enter(p[0],p[2]||undefined); await GM.fade(false); return true; };
  S.placeAfter=async function(GM,e){ const G=GM&&GM.G, E=e&&e.end; if(!G||!E||!GM.enter) return false;
    if(E.home){ if(typeof HOME!=='undefined'&&HOME.livesHome&&HOME.livesHome(G)&&HOME.arriveQuiet){ await HOME.arriveQuiet(GM); return true; } return S.enterSpot(GM,'宿舍'); }
    if(E.spot) return S.enterSpot(GM,E.spot);
    if(E.zone){ await GM.fade(true); await GM.enter(E.zone,{x:E.x,z:E.z,yaw:E.yaw||0,lv:E.lv|0}); await GM.fade(false); return true; }
    return false; };
  S.install=function(){ if(typeof STORY_EVENTS!=='undefined') for(const e of D()){ const ev=S.event(e); if(!STORY_EVENTS.some(x=>x&&x.id===ev.id)) STORY_EVENTS.push(ev); }
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY.PHONE_RULES.includes(S.tick)) STORY.PHONE_RULES.push(S.tick);
    if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER.includes(S.onAnswer)) PHONE.ON_ANSWER.push(S.onAnswer); };
  S.install();
  return S;
})();

/* ===== 一起念書第 6 次解鎖的「她那一格」（AA_722，src/data/study_slots.js；INVITE-PLACES-1107、STUDY-DATE-PROGRESS-1107）=====
   AA_706 第 1 節第 3 點：「第 6 次還會解鎖她下一個想帶你去的地方（邀約選單多一個她那一格）」。原本只記了旗標（studyn3d.js 的 set），選單沒有那一格：
   她說「週六。九點四十，戲院門口。」以後什麼都不會發生（LAWWW-B 11-07 盤點）。
   - 那一格：INVITE_DATA.places 多一個 slot_<id>，只有她（show(G,id)：id＝她）、解鎖以後（G.flags[flag]）、要的旗標都有（req）、還沒過期限（until）、
     一次性的（repeat:false）演過就不再出現（以安的小路：演完記 AN_SHOP1_DONE＝她故事線第 7 拍的 after）、已經約好還沒去的不重複列。答應句照 AA 的 acc。
   - 有 3D 店的（mode:'zone'：小路、南洋、一盞）：照一般的約（到店裡見面），見面那一段（P.scene）演那一場：第一次 first，之後 rot 輪流（rotIf：要那個旗標才用）。
     錢：小路 200（LAWWW 定）；南洋的票照 INV.buyTicket（150 元）。
   - 沒有場景的（mode:'out'：公館滷味、課輔班、外校圖書館）：約好以後排進行程（OUT.plan，和 AA_716 故事線的約一樣），時間到了「出發」→ 2D 背景演那一場
     → 演完到 end（ARCINV.placeAfter：公館商圈、溫州街；外校＝回家／宿舍）。滷味第一次她請、之後 120。
   - 你和別人交往、她知道（AA_722 897ddd17e）：小路、滷味不出現；以安解鎖以後第一次見面說兩句、記 AN_SHOP1_DONE＝'alone'（S.blockSay：INV.meetOpen 之後、STORY.PRE_TALK）。
   存檔：G.flags.STUDYSLOT＝{<id>:{n:演過幾次, last:上一次的 rot 組, day}}；舊存檔沒有＝一次都沒演過。
   測試：node tests/study_slots_unit.js */
'use strict';
const STUDYSLOT=(function(){
  const S={};
  const D=()=>(typeof STUDY_SLOTS!=='undefined'&&STUDY_SLOTS.slots)||[];
  const F=G=>G.flags||(G.flags={});
  const wdOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:0;   /* 0＝週日（和 invites3d 一樣）*/
  const dk=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const hh=h=>{ const H=Math.floor(h+1e-6), M=Math.round((h-H)*60); return (H<10?'0':'')+H+':'+(M<10?'0':'')+M; };
  S.pid=sl=>'slot_'+sl.id;
  S.get=id=>D().find(s=>s.id===id)||null;
  S.byPlace=pid=>D().find(s=>S.pid(s)===pid)||null;
  S.rec=G=>{ const f=F(G); if(!f.STUDYSLOT||typeof f.STUDYSLOT!=='object') f.STUDYSLOT={}; return f.STUDYSLOT; };
  S.n=(G,sl)=>{ const r=G&&G.flags&&G.flags.STUDYSLOT&&G.flags.STUDYSLOT[sl.id]; return r?r.n|0:0; };
  /* 這一格開著嗎（day：約的那一天；沒給＝今天）*/
  S.open=function(G,sl,day){ const f=(G&&G.flags)||{}; if(f[sl.flag]==null) return false; if(!sl.repeat&&(S.n(G,sl)>0||(sl.set&&f[sl.set]!=null))) return false;
    if(sl.req&&sl.req.some(k=>!f[k])) return false; if(sl.until){ const u=dk(sl.until); if(u!=null&&(day==null?G.day:day)>u) return false; } return true; };
  /* 已經約好、還沒去的（邀約或排好的出遊）：不重複列 */
  S.pending=function(G,sl){ const pid=S.pid(sl); if((G.invites||[]).some(iv=>iv&&iv.place===pid&&(iv.state==='accepted'||iv.state==='pending'))) return true;
    const L=typeof OUT!=='undefined'&&OUT.rec?OUT.rec(G):[]; return L.some(q=>q&&q.slot===sl.id&&q.state==='planned'); };
  /* 約的時間：之後 7 天裡可以的那幾個（今天的要還沒過）*/
  S.when=function(G,sl){ const out=[], h=G.hour%24; for(let d=G.day;d<=G.day+7&&out.length<4;d++){ if(!sl.days.includes(wdOf(d))||!S.open(G,sl,d)) continue; for(const t of sl.times) if(d>G.day||t>h+0.4) out.push({day:d,h:t}); } return out.slice(0,4); };
  /* 這一次演哪一組：第一次 first；之後 rot 輪流（rotIf 的那一組要有旗標），不連續兩次同一組 */
  S.pick=function(G,sl){ const n=S.n(G,sl); if(n===0||!sl.rot.length) return {k:'first',lines:sl.first}; const f=F(G), ok=sl.rot.map((_,i)=>i).filter(i=>{ const c=(sl.rotIf||{})[i]; return !c||!!f[c]; });
    const r=S.rec(G)[sl.id]||{}, last=r.last; let i=ok.find(j=>j>(last==null?-1:last)); if(i==null) i=ok[0]; if(i==null) return {k:'first',lines:sl.first}; return {k:'r'+i,i,lines:sl.rot[i]}; };
  /* 演完：記次數、旗標、錢 */
  S.finish=function(G,GM,sl,pk){ const r=S.rec(G)[sl.id]||(S.rec(G)[sl.id]={n:0}); const first=(r.n|0)===0; r.n=(r.n|0)+1; r.day=G.day; if(pk&&pk.i!=null) r.last=pk.i;
    const f=F(G); if(sl.set&&f[sl.set]==null) f[sl.set]=G.day;
    const c=sl.cost|0; if(c&&!(sl.firstFree&&first)&&(G.money|0)>=c){ if(GM&&GM.money) GM.money(-c,sl.costLabel||sl.name); else G.money=(G.money|0)-c; r.paid=(r.paid|0)+c; } };
  const strip=t=>/^「[^「」]*」$/.test(t)?t.slice(1,-1):t;
  const line=(sl,t)=>/^[（📷]/.test(t)?{speaker:null,text:t}:{speaker:sl.who,text:strip(t)};
  /* 有 3D 店的那一場（INV.meet 的 P.scene：開場、時間往後、記憶照一般的約）*/
  S.scene=async function(GM,iv,who,sl){ const G=GM.G, pk=S.pick(G,sl); for(const t of pk.lines){ const it=line(sl,t); await GM.say(it.speaker?who:null,it.text); } S.finish(G,GM,sl,pk); };
  /* 沒有場景的那一場（OUT 演；第一次、每一組 rot 各一個事件）*/
  S.evId=(sl,k)=>'ev_slot_'+sl.id+'_'+k;
  S.event=function(sl,k,lines){ const dlg=[Object.assign({scene:sl.bg[0]},sl.bg[1]?{bg:sl.bg[1]}:{})].concat(lines.map(t=>line(sl,t)));
    dlg.push({call:async(G,GM)=>{ const i=k==='first'?null:+k.slice(1); S.finish(G,GM,sl,{k,i}); }});
    return {id:S.evId(sl,k),title:sl.label,participants:[sl.who],location:'any',trigger:'outing',once:false,background:'dark',hours:sl.stay,dialogue:dlg,
      afterBack:(G,GM)=>typeof ARCINV!=='undefined'&&ARCINV.placeAfter?ARCINV.placeAfter(GM,{end:sl.end}):false}; };
  /* 約好了（mode:'out'）：這次的邀約改成排好的出遊（不在店裡等她）*/
  S.toOut=function(G,iv,sl){ if(typeof OUT==='undefined'||!OUT.plan) return false; const pk=S.pick(G,sl);
    const ok=OUT.plan(G,{id:'slot_'+sl.id+'_'+iv.day+'_'+Math.round(iv.h*60),ev:S.evId(sl,pk.k),day:iv.day,h:iv.h,late:0.5,place:sl.name,title:sl.label,travel:sl.travel,travelH:sl.travelH||0.25,slot:sl.id,who:sl.who});
    if(ok){ const L=G.invites||[], j=L.indexOf(iv); if(j>=0) L.splice(j,1); iv.state='out'; } return ok; };
  /* 你和別人交往、她知道（AA_722 897ddd17e；10-14 的規則，INV.partnerBlock 當吃飯算）：小路、滷味那一格不出現。
     以安的小路有 say：擋著的時候，解鎖以後第一次見面（約好的見面、當面說話）她說那兩句，記 AN_SHOP1_DONE＝'alone'——她故事線第 7 拍照常能演 */
  S.blocked=(G,sl)=>!!sl.partnerBlock&&typeof INV!=='undefined'&&!!INV.partnerBlock&&!!INV.partnerBlock(G,sl.who,{kind:'meal',id:S.pid(sl)});
  S.blockDue=function(G,id){ const f=(G&&G.flags)||{}; return D().find(sl=>sl.who===id&&sl.partnerBlock&&sl.partnerBlock.say&&f[sl.flag]!=null&&!(sl.set&&f[sl.set]!=null)&&S.n(G,sl)===0&&!S.pending(G,sl)&&S.blocked(G,sl))||null; };
  S.blockSay=async function(GM,who,id){ const G=GM&&GM.G, sl=G?S.blockDue(G,id):null; if(!sl) return false; for(const t of sl.partnerBlock.say){ const it=line(sl,t); await GM.say(it.speaker?who:null,it.text); } const f=F(G); if(sl.set&&f[sl.set]==null) f[sl.set]='alone'; return true; };
  S.placeOf=function(sl){ const P={id:S.pid(sl),zone:sl.mode==='zone'?sl.zone:null,name:sl.name,verb:sl.verb,kind:sl.kind||'reason',minStage:'FRIEND',stay:sl.stay,memory:sl.memory,
      sitAct:sl.sitAct||'sit',cats:sl.cats.slice(),days:sl.days.slice(),hours:sl.hours.slice(),times:sl.times.slice(),slot:sl.id,
      show:(G,id)=>id!=null&&id===sl.who&&S.open(G,sl)&&!S.pending(G,sl)&&!S.blocked(G,sl),
      avail:(G,day)=>S.open(G,sl,day),
      when:(G)=>S.when(G,sl)};
    if(sl.seatPose) P.seatPose=sl.seatPose;
    if(sl.mode==='zone') P.scene=(GM,iv,who)=>S.scene(GM,iv,who,sl);
    return P; };
  S.install=function(){
    if(typeof INVITE_DATA!=='undefined'&&Array.isArray(INVITE_DATA.places)){ const PP=INVITE_DATA.people||(INVITE_DATA.people={});
      for(const sl of D()){ if(!INVITE_DATA.places.some(p=>p.id===S.pid(sl))) INVITE_DATA.places.push(S.placeOf(sl));
        const p=PP[sl.who]||(PP[sl.who]={}); (p.acc||(p.acc={}))[S.pid(sl)]=sl.acc.slice(); } }
    if(typeof STORY_EVENTS!=='undefined') for(const sl of D()){ if(sl.mode!=='out') continue; const L=[['first',sl.first]].concat(sl.rot.map((r,i)=>['r'+i,r]));
      for(const [k,lines] of L){ const ev=S.event(sl,k,lines); if(!STORY_EVENTS.some(x=>x&&x.id===ev.id)) STORY_EVENTS.push(ev); } }
    if(typeof INV!=='undefined'&&INV.meetOpen&&!INV.meetOpen._slot){ const M0=INV.meetOpen; const M1=async function(GM,iv,who,o){ const r=await M0.apply(this,arguments); try{ await S.blockSay(GM,who,iv&&iv.who); }catch(e){ console.warn('STUDYSLOT.blockSay',e); } return r; }; M1._slot=true; INV.meetOpen=M1; }   /* 約好的見面：開場以後 */
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.PRE_TALK)&&!STORY.PRE_TALK.includes(S.blockSay)) STORY.PRE_TALK.push(S.blockSay);   /* 當面說話（偶遇）：說話以前 */
    if(typeof INV!=='undefined'&&INV.accept&&!INV.accept._slot){ const A0=INV.accept; const A1=function(G,id,pid,day,h,o){ const iv=A0.apply(this,arguments); const sl=S.byPlace(pid); if(iv&&sl&&sl.mode==='out') S.toOut(G,iv,sl); return iv; }; A1._slot=true; INV.accept=A1; } };
  S.install();
  S.hh=hh;
  return S;
})();

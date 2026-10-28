/* ===== 學姊第十批：交往中的跨年、除夕；前任；畢業以後的朋友（AA_396；任務 SIS-B10-L-1023；D111）：接線 =====
   台詞、事件在 src/data/sis_b10_events.js（照稿不改字）。這個檔：
   - 第 1 節 交往中的跨年（大二～大四）：12/24（大四 12/26）21:00 她私訊兩個選項（排在 AA_210 頂樓的群組以前）；去找她＝OUT（醉月湖 23:30／總圖前 23:15／她家巷口 23:40），
     頂樓就不排（story3d.js 的 nyeY2～Y4 問 STORY.sisNyeDate）；頂樓＝零點她打來（大四是祐廷打過去，ev_sis_nye_call）；
     12/31 21:00 以前沒回＝頂樓；電話沒接＝00:05「新年快樂。」；答應了沒去＝00:05「新年快樂。……我先回去了。」。SIS_NYE[年]＝date／call／missed。
   - 第 2 節 交往中的除夕電話：2027-02-05、2028-01-25、2029-02-12 21:30（OUT「接起來」）；沒接＝21:40。SIS_CNY[年]＝call／missed；自在 +1、她的戀愛 +1（事件裡）。
   - 第 3 節 前任（isEx）四場，照順序、和上一場隔 3 週、第一場在分手滿 3 週以後，過了 2028-08-01 沒演到的不補（S.tick）：
     3-1 法圖週三 19:00～21:00 她在；3-2 Café 週一二四 19:00～22:00 她在（之後 SIS_EX_CAFE：招呼只點頭）；3-3 霖澤館一樓大廳週一～四 13:55～14:20（5F 研究室還沒做好）；
     3-4 2028-08-01 21:00 私訊（美國路線也收；分手滿 3 週）。SIS_EX_SEEN＝演到第幾場、SIS_EX_LAST＝哪一天。
   - 第 4 節 畢業以後的朋友：四季的窗口裡，週一二四 19:30～21:30 在 Café 找她說話＝說話前接演（熟悉以上、不是前任、沒和她交往；和別人交往也有）；窗口過了不補。
   測試：node tests/aa396_sis_b10_unit.js */
'use strict';
const SISB10=(function(){
  const S={}, ID='heroine_05', L=typeof SISB10_LINES!=='undefined'?SISB10_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>((G.hour%24)+24)%24;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  S.route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  S.isEx=G=>!S.dating(G)&&!!(G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id):null;
  const wd=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).wd:0;
  const rec=(G,k)=>{ const F=G.flags; if(!F[k]||typeof F[k]!=='object') F[k]={}; return F[k]; };

  /* ---------------- 第 1 節 跨年 ---------------- */
  S.sisNyeDate=(G,y)=>!!G&&!!G.flags&&!!G.flags.SIS_NYE_PICK&&G.flags.SIS_NYE_PICK[y]==='date';   /* 去找她的：不排頂樓（story3d.js nyeY2～Y4）*/
  S.callYear=G=>{ const q=typeof OUT!=='undefined'?OUT.rec(G).filter(x=>/^sisb10_nye_call_/.test(x.id)).sort((a,b)=>b.day-a.day).find(x=>x.day<=G.day):null; return q?+q.id.slice(-1):4; };
  S.nye=function(G){ if(!S.dating(G)) return; const F=G.flags, P=rec(G,'SIS_NYE_PICK'), R=rec(G,'SIS_NYE');
    for(const y of [2,3,4]){ const C=(L.nye||{})[y]; if(!C) continue; const a=D(C.ask), n=D(C.nye); if(a==null||n==null||G.day<a||G.day>n+1) continue; const tag='sisb10_nye_ask_y'+y;
      if(!sent(G,tag)&&now(G)<T(n,21)&&(G.day>a||hh(G)>=21)){ const M=C.L.map(dm); M[M.length-1].ask={id:tag,until:T(n,21),opts:C.opts.map(o=>({t:o.t,set:{['SIS_NYE_K'+y]:o.k},say:[{from:ID,text:o.r}]}))};
        PHONE.at(G,G.day===a?a:G.day,G.day===a?21:hh(G),M,tag); }
      if(F['SIS_NYE_K'+y]){ P[y]=F['SIS_NYE_K'+y]; delete F['SIS_NYE_K'+y]; }
      if(sent(G,tag)&&!P[y]&&now(G)>=T(n,21)) P[y]='roof';   /* 21:00 以前沒回：當作頂樓 */
      if(P[y]==='date'&&R[y]==null&&now(G)<T(n,C.out.h+0.25)) plan(G,Object.assign({id:'sisb10_nye_y'+y,ev:'ev_sis_nye_y'+y,day:n,late:0.25,back:'回到住的地方。'},C.out));
      if(P[y]==='date'&&R[y]==null&&done(G,'ev_sis_nye_y'+y)) R[y]='date';
      if(P[y]==='roof'&&R[y]==null&&G.day===n&&hh(G)>=21){ const me=y===4;   /* 零點：大二、大三她打來；大四祐廷打過去 */
        plan(G,{id:'sisb10_nye_call_y'+y,ev:'ev_sis_nye_call',day:n+1,h:0,late:0.75,place:'電話',verb:me?'打過去':'接起來',no:'先不接',title:me?'打給書瑀':'書瑀打電話來',call:true,travel:'',travelH:0,back:'電話掛了。',alarm:false}); }
      if(P[y]==='roof'&&R[y]==null&&done(G,'ev_sis_nye_call')&&(OUT.get(G,'sisb10_nye_call_y'+y)||{}).state==='done') R[y]='call'; } };
  S.nyeDateMissed=function(G,y){ const R=rec(G,'SIS_NYE'), n=D(L.nye[y].nye); if(R[y]==null) R[y]='missed'; PHONE.at(G,n+1,5/60,L.nyeDateMissed.map(dm),'sisb10_nye_dmiss_y'+y); };
  S.nyeCallMissed=function(G,q){ const y=+q.id.slice(-1), R=rec(G,'SIS_NYE'), n=D(L.nye[y].nye); if(R[y]==null) R[y]='missed'; PHONE.at(G,n+1,5/60,[dm(L.nyeCallMissed)],'sisb10_nye_cmiss_y'+y); };
  /* ---------------- 第 2 節 除夕 ---------------- */
  S.CNY={2027:'2027-02-05',2028:'2028-01-25',2029:'2029-02-12'};
  S.cnyYear=G=>{ const q=typeof OUT!=='undefined'?OUT.rec(G).filter(x=>/^sisb10_cny_/.test(x.id)).sort((a,b)=>b.day-a.day).find(x=>x.day<=G.day):null; return q?+q.id.slice(-4):2027; };
  S.cny=function(G){ if(!S.dating(G)) return; const R=rec(G,'SIS_CNY');
    for(const y in S.CNY){ const d=D(S.CNY[y]); if(d==null||G.day!==d||R[y]!=null) continue; if(now(G)<T(d,21.5+0.25)) plan(G,{id:'sisb10_cny_'+y,ev:'ev_sis_cny_call',day:d,h:21.5,late:1/6,place:'電話',verb:'接起來',no:'先不接',title:'書瑀打電話來',call:true,travel:'',travelH:0,back:'電話掛了。'});
      const q=OUT.get(G,'sisb10_cny_'+y); if(q&&q.state==='done') R[y]='call'; } };
  S.cnyMissed=function(G,q){ const y=q.id.slice(-4), R=rec(G,'SIS_CNY'); if(R[y]==null) R[y]='missed'; PHONE.at(G,q.day,21+40/60,L.cnyMissed.map(dm),'sisb10_cny_miss_'+y); };
  /* ---------------- 第 3 節 前任 ---------------- */
  S.exDay=G=>{ const R=typeof ROM!=='undefined'&&ROM.get?ROM.get(G,ID):null, h=R&&R.history?R.history.filter(x=>x.ev==='end'):[]; return h.length?h[h.length-1].day:null; };
  S.EX_END='2028-08-01';
  S.exNext=G=>{ const F=G.flags; if(!law(G)||!S.isEx(G)||!F.met_sis) return 0; const n=(F.SIS_EX_SEEN|0)+1; if(n>3) return 0; const end=D(S.EX_END), x=S.exDay(G);
    if(end==null||G.day>end||abroad(G)) return 0; if(x!=null&&G.day<x+21) return 0; if(F.SIS_EX_LAST!=null&&G.day<F.SIS_EX_LAST+21) return 0; return n; };
  const herHere=GM=>!!(GM&&GM.npc&&GM.npc[ID]);
  S.exDue=GM=>{ const G=GM.G, n=S.exNext(G); if(!n) return null; const h=hh(G), w=wd(G);
    if(n===1&&G.zone==='lawlib'&&w===3&&h>=19&&h<21&&herHere(GM)) return 'ev_sis_ex_1';
    if(n===2&&G.zone==='cafe'&&[1,2,4].includes(w)&&h>=19&&h<22&&herHere(GM)) return 'ev_sis_ex_2';
    if(n===3&&G.zone==='linze'&&(GM.E&&GM.E.player?(GM.E.player.lv|0)===0:true)&&w>=1&&w<=4&&h>=13+55/60&&h<14+20/60) return 'ev_sis_ex_3';
    return null; };
  S.exLast=function(G){ const d=D(S.EX_END), F=G.flags; if(d==null||G.day<d||G.day>d+1||!S.isEx(G)||sent(G,'sisb10_ex_last')||now(G)<T(d,21)) return; const x=S.exDay(G); if(x!=null&&d<x+21) return;
    const tz=typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0, M=L.exLast.L.map(dm); M[M.length-1].ask={id:'sisb10_ex_last',opts:L.exLast.opts.map(o=>({t:o.t,say:[{from:ID,text:o.r}]}))};
    PHONE.at(G,d,21+tz,M,'sisb10_ex_last'); F.SIS_EX_SEEN=Math.max(F.SIS_EX_SEEN|0,4); };
  /* ---------------- 第 4 節 畢業以後 ---------------- */
  S.PG=[['2029-10-01','2029-10-31'],['2030-01-02','2030-01-31'],['2030-04-01','2030-04-30'],['2030-09-01','2030-09-30']];
  const SIS_PRE=/^ev_sis_(adv_|three_conditions|lab_desk|seminar|topic|us_told|db_taught|ta_papers|econ_|old_notes|hot_water_back|jp_note|which_book|y3s2_rain|pg_q)/;
  const preToday=G=>{ const R=G.events&&G.events.last; if(!R) return false; return Object.keys(R).some(id=>SIS_PRE.test(id)&&R[id]===G.day); };
  S.pgEv=G=>{ if(!G||!law(G)||G.zone!=='cafe'||!G.flags.met_sis||S.dating(G)||S.isEx(G)||!stageOk('FAMILIAR')) return null; const gd=D('2029-06-03'); if(gd==null||G.day<gd) return null;
    const h=hh(G); if(![1,2,4].includes(wd(G))||h<19.5||h>=21.5||preToday(G)) return null;
    for(let i=0;i<S.PG.length;i++){ const a=D(S.PG[i][0]), b=D(S.PG[i][1]); if(a!=null&&b!=null&&G.day>=a&&G.day<=b&&!done(G,'ev_sis_pg_q'+(i+1))) return 'ev_sis_pg_q'+(i+1); }
    return null; };
  S.preTalk=async function(GM){ const G=GM&&GM.G, id=S.pgEv(G); if(!id||typeof EVENTS==='undefined'||!EVENTS.runLines) return false; const ev=evOf(id); if(!ev) return false;
    const R=G.events||(G.events={done:{},last:{},count:0}); R.done=R.done||{}; R.last=R.last||{}; R.done[id]=(R.done[id]|0)+1; R.last[id]=G.day;
    await EVENTS.runLines(ev.dialogue,ev); return true; };

  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['sis_b10_3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const go=f=>{ busy=true; Promise.resolve().then(f).catch(e=>console.warn('SISB10',e)).finally(()=>{ busy=false; }); return true; };
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!G||!G.flags||!law(G)) return false; const id=S.exDue(GM); if(!id) return false; const ev=evOf(id); if(!ev) return false;
    G.flags.SIS_EX_SEEN=(G.flags.SIS_EX_SEEN|0)+1; G.flags.SIS_EX_LAST=G.day; return go(()=>EVENTS.run(ev)); };
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.nye,S.cny,S.exLast]){ try{ f(G); }catch(e){ console.warn('SISB10 phone',e); } } };
  if(typeof STORY!=='undefined'){ STORY.sisNyeDate=S.sisNyeDate; if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM)); }
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._sisb10){ const p0=SISY23.preTalk;
    SISY23.preTalk=async function(GM){ const r=await p0.apply(this,arguments); return r||await S.preTalk(GM); }; Object.assign(SISY23.preTalk,{_sisb10:true,_sisb4:p0._sisb4,_sisjp:p0._sisjp,_sisb8:p0._sisb8,_sisb9:p0._sisb9}); }
  return S;
})();

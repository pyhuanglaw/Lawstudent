/* ===== 答應媽媽回家：記下約定、當天提醒、沒回去（HOME-PROMISE-1027）=====
   使用者 2026-10-27 20:5x（USER_WANTS X116，附存檔：第 25 天週六 19:01 在宿舍）：「答應媽媽放假回家結果假日還在宿舍?周末跟可昕有約」。
   規則、句子：AA_488（企劃線 961a3a8a0，AA-C 定稿，第②級），照抄。這個檔做第 1、2、3、5 節；
     第 4 節（答應以後別人約那個週末的三選一）和第 2 節「那個週末已經排了別的約」那一版另外接（invites3d.js、outings3d.js）。
   G.home.promise＝{ask:那個週四, k, from, to（絕對小時）, rd:提醒那一天, sat, sun, st, no:[媽媽「這週不回」那幾句]}，st：
     'open' 還沒到／'kept' 回去了／'told' 說了不回去／'missed' 沒說、沒回去。同一時間一筆，下一個週四的「會回去」蓋過去。
   舊存檔：答應的週末已經過了＝不補（沒有 G.home.promise＝沒有約定）。不扣任何數值（AA_134 第 3 節「不懲罰」），只有媽媽、姊姊的反應。
   掛勾：STORY.PHONE_RULES（記約定、週六 18:30「回來了沒」、週日 21:30「菜冰起來了」、姊姊兩則）、STORY.TICKS（週六早上的提醒、16:00 再一次、「現在回去」）、
     home3d.js 的 phoneRules（下一個週四媽媽那一句前面多一則：HOME.grpPre）、dinner（過了 20:00 才到：HOME.lateDinner）。測試：node tests/home_promise_unit.js */
const HPROM=(function(){
  const S={}, MOM=t=>({th:'g:home',from:'mom',name:'媽媽',text:t}), ME=t=>({th:'g:home',from:'player',who:null,text:t}), SIS=t=>({th:'p:sister',from:'sister',name:'姊姊',text:t});
  S.KIND=/^(first|first_sis|moon|dz|mom|dragon|lj[0-2]|cool|hot|dad_\w+|p1|p3|old)$/;   /* 算答應（第 1 節）；考試週 exam、fin2（說的是考完以後）、畢業典禮 grad（不問）不算 */
  S.REMIND='（這週末答應媽媽要回家。）';
  S.LATE='（媽媽把菜熱了一次。）';
  /* 下一個週四媽媽那一句前面多的那一則（第 3-2 節表；母親節不加，改姊姊那一則）*/
  const MORE={moon:'月餅還在冰箱',dz:'湯圓還在冰箱',dragon:'粽子還在冰箱',mom:null};
  S.more=k=>k in MORE?MORE[k]:(/^dad_/.test(k)?'你爸問你吃到了沒':'上禮拜煮多了 吃了三天');   /* 平常、第一週、天氣、連假＝上禮拜煮多了 */
  const T=(d,h)=>d*24+h, now=G=>T(G.day,G.hour);
  const rec=G=>typeof HOME!=='undefined'&&HOME.rec?HOME.rec(G):(G.home||(G.home={}));
  S.get=G=>{ const p=rec(G).promise; return p&&typeof p==='object'?p:null; };
  const C=()=>typeof CALENDAR!=='undefined'?CALENDAR:null;
  const nat=d=>{ const c=C(); if(!c||!c.holiday) return false; const n=c.holiday(d), sch=Object.values(c.SCHOOL||{}); return !!n&&n!=='颱風假'&&!sch.includes(n); };   /* 國定假日（含補假），同 home3d.js 的 grpPlan */
  const typh=d=>{ const c=C(); return !!(c&&(c.typhoon?c.typhoon(d):(c.holiday&&c.holiday(d)==='颱風假'))); };   /* 颱風假（CALENDAR.typhoon，HOME.canGo 也是看這個）*/
  /* 答應的是「那個週末」（第 1 節）：週五 17:00～週日 21:30；週五放假＝從週四 17:00 起，週一放假＝到週一 21:30。提醒＝第一個不用上課的早上（第 2 節：週五放假＝週五，不然週六）*/
  S.span=function(d){ const fri=nat(d+1), mon=nat(d+4); return {from:fri?T(d,17):T(d+1,17),to:mon?T(d+4,21.5):T(d+3,21.5),rd:fri?d+1:d+2,sat:d+2,sun:d+3}; };
  /* 週四家人群組回了「會回去」→ 記下（第 1 節）。看最新的週四那一則（home_ask_<日>；週六那一則是 home_ask_back_<日>）*/
  S.scan=function(G){ const M=G.msgs||[]; for(let i=M.length-1;i>=0;i--){ const m=M[i]; if(!m||!m.ask||!/^home_ask_-?\d+$/.test(m.ask.id||'')) continue;
      const p=S.get(G); if(p&&p.ask>=m.day) return p; if(m.ans!==0||!S.KIND.test(m.ask.k||'')) return p;
      const sp=S.span(m.day); if(now(G)>sp.to) return p;   /* 週末已經過了（舊存檔讀進來）＝不補（第 5 節）*/
      const no=(((m.ask.opts||[])[1]||{}).say||[]).map(x=>x.text);
      const np={ask:m.day,k:m.ask.k,from:sp.from,to:sp.to,rd:sp.rd,sat:sp.sat,sun:sp.sun,st:'open',no}; rec(G).promise=np; return np; } return S.get(G); };
  /* 說了不回去（第 3-1 節）：祐廷一則、媽媽回那一週原本「這週不回」的那一句 */
  S.tell=function(G){ const p=S.get(G); if(!p||p.st!=='open') return; p.st='told'; if(typeof PHONE!=='undefined') PHONE.at(G,G.day,G.hour,[ME('這週回不去了')].concat(p.no.map(MOM)),'hp_told_'+p.ask); };
  /* 每次 phoneRules（STORY.PHONE_RULES）：做到了、颱風假、週六 18:30「回來了沒」、姊姊兩則、週日 21:30 沒回去（第 3-2、5 節）*/
  S.rules=function(G){ if(typeof PHONE==='undefined'||typeof HOME==='undefined') return; const p=S.scan(G); if(!p||p.st!=='open') return; const t=now(G);
    if(HOME.at(G)&&t>=p.from&&t<=p.to){ p.st='kept'; return; }   /* 這段時間裡回到家一次＝做到了 */
    for(let d=Math.floor(p.from/24);d<=Math.floor(p.to/24);d++) if(typh(d)){ p.st='told'; p.ty=true; return; }   /* 颱風假：提醒不出、記 told、不發任何訊息 */
    const bid='home_ask_back_'+p.sat, bm=PHONE.byAsk?PHONE.byAsk(G,bid):null;
    if(bm&&bm.ans===1){ p.st='told'; return; }   /* 「回來了沒」回了「這週回不去了」：媽媽那一句在選項裡 */
    if(bm&&bm.ans===0) p.goNow=true;   /* 「現在回去」：空下來就回家（S.tick）*/
    if(t>=T(p.sat,18.5)&&t<p.to&&!HOME.at(G)) PHONE.at(G,p.sat,18.5,[Object.assign(MOM('回來了沒'),{ask:{id:bid,until:T(p.sat,20.5),k:'back',opts:[{t:'現在回去'},{t:'這週回不去了',say:p.no.map(MOM)}]}})],'hp_back_'+p.sat);   /* 兩小時沒回：home3d.js 照 home_ask_ 的規則爸爸傳「？」*/
    const quiet=!bm||bm.ans==null;
    if(p.k==='first_sis'&&quiet&&t>=T(p.sat,21)&&!HOME.at(G)) PHONE.at(G,p.sat,21,[SIS('我等到九點')],'hp_sis_wait_'+p.sat);
    if(p.k==='mom'&&quiet&&t>=T(p.sun,21)&&!HOME.at(G)) PHONE.at(G,p.sun,21,[SIS('媽今天一直看手機')],'hp_sis_mom_'+p.sun);
    if(t>=p.to){ p.st='missed'; if(quiet) PHONE.at(G,Math.floor(p.to/24),p.to%24,[MOM('菜冰起來了')],'hp_missed_'+p.ask); } };   /* 回了「現在回去」卻沒回去也算 missed，但媽媽不再傳 */
  /* 下一個週四：媽媽那一句前面多一則（只有這一次；home3d.js 的 phoneRules 送出週四那一則時問）*/
  S.grpPre=function(G){ const p=S.get(G); if(!p||p.st!=='missed'||p.pre||G.day<=p.ask) return null; return S.more(p.k); };
  S.grpPreSent=function(G){ const p=S.get(G); if(p) p.pre=true; };
  /* 過了 20:00 才到家（「回來了沒」→ 現在回去）：晚餐那一段換成「（媽媽把菜熱了一次。）」，沒有晚餐旁白 */
  S.lateDinner=function(G){ const p=S.get(G); if(!p||p.late!==G.day||p.lateUsed) return null; p.lateUsed=true; return S.LATE; };
  const idle=GM=>/^dorm/.test(GM.G.zone||'')&&!GM.E.player.busy&&!(GM.D&&GM.D.active)&&!(typeof ADV!=='undefined'&&ADV.active);   /* 人在宿舍、空下來 */
  S.goHome=async function(GM){ const G=GM.G, p=S.get(G); if(typeof HOME==='undefined'||!HOME.canGo(G)||HOME.at(G)) return false; if(p) p.late=(G.hour%24)+(HOME.livesHome&&HOME.livesHome(G)?0.5:0.7)>=20?G.day:null; return HOME.go(GM); };
  /* 第 2 節：那個週末第一個不用上課的早上 07:00～11:00 一次（「回家」「晚一點」「這次不回去」）；「晚一點」→ 16:00 以後再一次（「回家」「這次不回去」）*/
  S.remind=async function(GM,n){ const G=GM.G, p=S.get(G); if(!p) return; const opts=n===1?['回家','晚一點','這次不回去']:['回家','這次不回去']; let k=null; GM.sceneBegin();
    try{ await GM.say(null,S.REMIND); const i=await GM.choose(opts.map(t=>({t}))); k=opts[i]||opts[0]; if(k==='晚一點') p.r2=true; else if(k==='這次不回去') S.tell(G); }
    finally { GM.sceneEnd(); }
    if(k==='回家') await S.goHome(GM); };
  S.tick=function(GM){ const G=GM.G, p=S.get(G); if(!p||p.st!=='open'||typeof HOME==='undefined'||HOME.at(G)) return false; const t=now(G), h=G.hour%24;
    if(p.goNow&&!p.goDone&&HOME.canGo(G)&&!GM.E.player.busy&&!(GM.D&&GM.D.active)){ p.goDone=true; void S.goHome(GM).catch(e=>console.warn('HPROM.go',e)); return true; }
    if(t<p.from||t>=p.to||!idle(GM)) return false;
    if(G.day===p.rd&&h>=7&&h<11&&!p.r1){ p.r1=true; void S.remind(GM,1).catch(e=>console.warn('HPROM.remind',e)); return true; }
    if(p.r2&&!p.r2done&&G.day===p.rd&&h>=16&&t<T(p.sat,18.5)){ p.r2done=true; void S.remind(GM,2).catch(e=>console.warn('HPROM.remind2',e)); return true; }
    return false; };
  if(typeof HOME!=='undefined'){ HOME.grpPre=S.grpPre; HOME.grpPreSent=S.grpPreSent; HOME.lateDinner=S.lateDinner; }
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.rules(G)); if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM)); }
  return S;
})();

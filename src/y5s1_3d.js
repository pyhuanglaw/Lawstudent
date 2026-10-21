/* ===== 大五上（交換延畢；AA_357，AA-C 2026-10-21 定稿 d07eb988）=====
   誰：日本、美國路線（延畢一學期，STORY.routeAbroadRoute）。學期 Y5S1＝CALENDAR.termOfDelayed（2029-09-03～12-23，16 週），只有延畢的玩家用；
   照原設計不開放自由時間（畢業後篇「跳到下一件事」帶過，src/postgrad3d.js），可是要有學期的樣子（AA_357 1-1）：
   - 日期標籤（CLS.dayLabel）：「大五上 第 N 週」（照其他學期的格式；沒有期中、期末考週）。12/24～1/20 照原本寫「寒假」，1/21 以後照畢業後篇。
   - 今日頁（CLS.todayLine／todayHTML）：週二「法律實習　10:00（法扶）」；美國路線週一「補修：強制執行法」、週三「補修：法律倫理」（一鍵上課，AA_327 2-Y4-52、AA_291 第 6 節：
     和學弟妹同堂、上午兩堂、課堂內容重播大四上那兩門的 syllabus）；其他日子照 9/3 的選擇（Y5_DAYS）：總圖／家教／在家讀書。課表（CLS.weekHTML）列同樣的東西。
   - 一鍵上課：今日頁的「直接去上課」（game3d.js data-y5go）→ 2D 的一堂課（字卡、教授一句：CLS.content 照大四上那一門那一週，未審查的週照一般句子）→ 時間到下課；人在哪裡就回到哪裡。
     出席不影響任何結果（只記 G.y5.cls）。
   台詞照 AA 稿；AA 稿沒有的字只有介面用字（按鈕、標題），見 AA_357 回報。存檔：G.y5＝{cls:{日:課:1}}（舊存檔沒有＝空）。
   測試：node tests/y5_delay_unit.js */
'use strict';
const Y5=(function(){
  const S={};
  const law=G=>!!G&&(G.stage||'law')==='law';
  S.delayed=G=>law(G)&&typeof STORY!=='undefined'&&!!STORY.routeAbroadRoute&&!!STORY.routeAbroadRoute(G);
  S.us=G=>S.delayed(G)&&STORY.routeAbroadRoute(G)==='US';
  /* 延畢的玩家這一天在大五上：{id:'Y5S1',week,…}；不是＝null */
  S.term=(G,day)=>{ if(!S.delayed(G)||typeof CALENDAR==='undefined'||!CALENDAR.termOfDelayed) return null; return CALENDAR.termOfDelayed(day==null?G.day:day); };
  S.on=G=>!!S.term(G);
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>((G.hour%24)+24)%24;
  const hm=x=>typeof CLS!=='undefined'&&CLS.hhmm?CLS.hhmm(x):String(x);
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  const wdOf=d=>CALENDAR.dateOf(d).wd;   /* 1＝週一 … 7＝週日 */
  S.rec=G=>{ if(!G.y5||typeof G.y5!=='object') G.y5={}; if(!G.y5.cls||typeof G.y5.cls!=='object') G.y5.cls={}; return G.y5; };
  /* ---------- 這一天的事（AA_357 1-1）---------- */
  S.INTERN_TEXT='法律實習　10:00（法扶）';
  S.MAKEUP=[{wd:1,id:'enforcement',label:'補修：強制執行法',bg:'classroom_small'},{wd:3,id:'legal_ethics',label:'補修：法律倫理',bg:'wancai_seminar'}];   /* 美國路線：週一、週三上午（AA_291 第 6 節）*/
  S.DAYS_TEXT={study:'總圖',work:'家教',bar:'在家讀書'};
  const course=id=>typeof COURSES!=='undefined'&&COURSES.list?COURSES.list.find(c=>c.id===id)||null:null;
  const am=()=>(typeof COURSES!=='undefined'&&COURSES.blocks&&COURSES.blocks.am)||{t0:9+10/60,t1:12+10/60};
  /* 補修的那一堂：{key, c（大四上那一門）, label, t0, t1, day, week, slot, bg} */
  S.classItems=function(G,day){ const d=day==null?G.day:day, t=S.term(G,d); if(!t||!S.us(G)||typeof CALENDAR==='undefined'||CALENDAR.holiday(d)) return []; const wd=wdOf(d), B=am(), out=[];
    for(const m of S.MAKEUP){ if(m.wd!==wd) continue; const c=course(m.id); if(!c) continue; out.push({key:d+':'+m.id,c,label:m.label,t0:B.t0,t1:B.t1,day:d,week:t.week,term:'Y5S1',slot:{wd,block:'am'},bg:m.bg}); } return out; };
  /* done 上過了／open 現在去來得及（開始前 1 小時起、下課前 15 分鐘以前）／upcoming／missed（同 us_life3d.js）*/
  S.status=(G,it)=>{ const R=S.rec(G); if(R.cls[it.key]) return 'done'; if(it.day<G.day||(it.day===G.day&&G.hour>=24)) return 'missed'; if(it.day>G.day) return 'upcoming'; const h=hh(G); if(h>=it.t1-0.25) return 'missed'; return h>=it.t0-1?'open':'upcoming'; };
  /* 今日頁那一行：放假 → 補修 → 週二實習 → 9/3 的選擇（週一～週五）*/
  S.dayLine=function(G,day){ const d=day==null?G.day:day; if(!S.term(G,d)) return null; const hol=CALENDAR.holiday(d); if(hol) return '今天放假（'+hol+'），沒有課';
    const its=S.classItems(G,d); if(its.length) return '今天的課：'+its.map(it=>hm(it.t0)+' '+it.label).join('、');
    const wd=wdOf(d); if(wd===2) return '今天：'+S.INTERN_TEXT;
    const dt=S.DAYS_TEXT[G.flags&&G.flags.Y5_DAYS]; if(wd<=5&&dt) return '今天：'+dt;
    return '今天沒有課'; };
  /* ---------- 包住課表系統（只在延畢的大五上改結果）---------- */
  if(typeof CLS!=='undefined'){
    const lab0=CLS.dayLabel, line0=CLS.todayLine, today0=CLS.todayHTML, week0=CLS.weekHTML;
    if(lab0) CLS.dayLabel=function(G,day){ const d=day==null&&G?G.day:day, t=G?S.term(G,d):null; if(!t) return lab0.apply(this,arguments); const x=CALENDAR.dateOf(d), hol=CALENDAR.holiday(d);
      return x.m+'/'+x.d+' '+CLS.WD[x.wd]+(hol?'・'+hol:'')+'・'+CLS.termName(t.id)+' 第 '+t.week+' 週'; };   /* 大五上沒有期中、期末考（AA_357 第 4 節「這一次，沒有期末考」）*/
    if(line0) CLS.todayLine=function(G){ const L=G?S.dayLine(G):null; return L!=null?L:line0.apply(this,arguments); };
    if(today0) CLS.todayHTML=function(G){ const h=today0.apply(this,arguments); if(!G||!S.on(G)) return h; const its=S.classItems(G); if(!its.length) return h;
      const ST={done:'上過了',missed:'沒去',open:'現在可以去',upcoming:'還沒開始'}, home=typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G); let add='';   /* 人在家：按鈕在家裡的選單（Y5.homeOpts），手機不放（家裡的選單正在等選項）*/
      for(const it of its){ const s=S.status(G,it); add+='<div class="item phrow"><div><b>'+hm(it.t0)+'–'+hm(it.t1)+'</b> '+esc(it.label)+'<div class="muted">'+esc((it.c&&typeof CLS.roomName==='function'?CLS.roomName(it.c):'')||'')+(it.c?'・'+esc(CLS.profName(it.c)):'')+'・'+ST[s]+'</div></div>'+((s==='open'||s==='upcoming')&&!home?'<button class="btn" data-y5go="'+esc(it.key)+'">直接去上課</button>':'')+'</div>'; }
      const line='<div class="item">'+esc(CLS.todayLine(G))+'</div>', i=h.indexOf(line); return i>=0?h.slice(0,i)+add+h.slice(i+line.length):h+add; };   /* 「今天的課」那一行換成補修的那一堂＋「直接去上課」*/
    if(week0) CLS.weekHTML=function(G){ const t=G?S.term(G):null; if(!t) return week0.apply(this,arguments);
      let h='<div class="item"><b>'+esc(CLS.termName(t.id))+'</b>・第 '+t.week+' 週</div><div class="item"><b>'+esc(S.INTERN_TEXT)+'</b><div class="muted">'+esc(CLS.WD[2])+'</div></div>';
      if(S.us(G)) for(const m of S.MAKEUP){ const c=course(m.id); if(!c) continue; const B=am(); h+='<div class="item"><b>'+esc(m.label)+'</b><div class="muted">'+esc(CLS.WD[m.wd])+' '+hm(B.t0)+'–'+hm(B.t1)+(typeof CLS.roomName==='function'?'・'+esc(CLS.roomName(c)):'')+'</div></div>'; }
      return h; }; }
  /* ---------- 一鍵上課（美國路線的補修）---------- */
  S.find=(G,key)=>S.classItems(G).find(it=>it.key===key)||null;
  S.attend=async function(GM,it){ const G=GM.G, R=S.rec(G); if(!it||R.cls[it.key]) return false; const st=S.status(G,it); if(st!=='open'&&!(st==='upcoming'&&it.day===G.day)) return false;
    const home=typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G), A=typeof ADV!=='undefined'?ADV:null, wasAdv=!!(A&&A.active);
    GM.sceneBegin();
    try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard(it.label,hm(it.t0)+'–'+hm(it.t1),2200);
      const arrive=Math.max(now(G)+(home?0.5:0.25),T(it.day,it.t0)); if(arrive>now(G)) GM.advance(arrive-now(G));   /* 從家裡：捷運＋公車約 30 分鐘；早到就等到上課 */
      R.cls[it.key]=1;
      if(A&&A.begin) A.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg(it.bg):'dark'}); await GM.fade(false);
      let ct=null; try{ ct=CLS.content({c:it.c,week:it.week,day:it.day,slot:it.slot,key:it.key,t0:it.t0,t1:it.t1}); }catch(e){ console.warn('Y5 content',e); }
      if(ct&&ct.line) await GM.say(null,(ct.prof||CLS.profName(it.c))+'：'+ct.line);   /* 課堂內容重播大四上那一門那一週（CLS.content：審查過的週照 BB 的課堂、其他週照一般句子）*/
      if(ct&&ct.react) await GM.say(null,ct.react);
      await GM.fade(true); const end=T(it.day,it.t1)+(home?0.5:0); if(now(G)<end) GM.advance(end-now(G));
      if(A){ if(wasAdv&&home&&A.begin&&typeof HOME!=='undefined'&&HOME.bgNow) A.begin({background:HOME.bgNow()}); else if(!wasAdv&&A.active&&A.end) A.end(); }
      await GM.fade(false); if(GM.caption) GM.caption('','下課了。',2400); }
    finally{ GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };
  S.goClass=async function(GM,key){ const G=GM&&GM.G; if(!G) return false; const it=S.find(G,key); if(!it) return false; return S.attend(GM,it); };
  /* 家裡的選單（home3d.js 的 loop）：今天的補修還來得及＝「直接去上課：補修：…」（照在家的「直接去上課」那一行的寫法）*/
  S.homeOpts=function(G){ if(!S.on(G)) return []; return S.classItems(G).filter(it=>{ const s=S.status(G,it); return s==='open'||s==='upcoming'; }).map(it=>({t:'直接去上課：'+it.label,hint:hm(it.t0)+'–'+hm(it.t1)+'　捷運＋公車 約 30 分鐘',k:'y5cls',it})); };
  return S;
})();

/* 活動與演講（D55；設計：docs/campus/PUBLIC_BUILDINGS_DESIGN.md 第 5 節）。
   **內容由 AA、BB 提供**（使用者 2026-10-13：「尚未確認的演講故事」不能先做）——遊戲裡先是空的清單；系統用 tests/activities_unit.js 的測試資料驗證。
   一筆活動：
     { id, title, kind:'lecture'|'club'|'exam'|…, zone, room, term:[學期代號…], weeks:[第幾週…] 或 dates:['2025-10-21',…], weekday:1–5（週一＝1）,
       t0, t1（小時，例如 18.5＝18:30）, poster:{ daysBefore, text }, crowd:{ n }, story:false }
   story:true（牽涉人物劇情）的活動要使用者批准才放。
   用到的地方：公告欄（看公告：今天、這幾天的活動）、手機「今天」、條件事件的 activity／attended／missed 條件（src/events3d.js）、大教室的人流（坐到指定人數）、
   坐下時的「聽演講」（src/game3d.js 的 seatMenu → classes3d.js 的 attendActivity，記下到場）。 */
const ACTIVITIES={
  list:[],
  /* 第 day 天有沒有這個活動（學期、週次或日期、星期都對得上）*/
  on(a,day){ if(typeof CALENDAR==='undefined') return false; const d=CALENDAR.dateOf(day);
    if(a.dates) return a.dates.includes(d.key);
    if(CALENDAR.holiday(day)&&!a.holidays) return false;   /* 照學期、週次、星期排的活動：放假那天不辦（2026-10-13 審查；真的要在假日辦的寫 holidays:true 或用 dates）*/
    if(a.weekday&&d.wd!==a.weekday) return false; const t=CALENDAR.termOf(day); if(a.term&&(!t||!a.term.includes(t.id))) return false; if(a.weeks&&(!t||!a.weeks.includes(t.week))) return false; return !!(a.term||a.weeks||a.weekday); },
  /* 活動的時段（AA_110 第 5 節）：'before'（今天還沒開始）／'during'（進行中）／'justEnded'（結束後 20 分鐘內：「散場後的走廊」）／'after'（更晚）；今天沒有這個活動＝null */
  phaseOf(G,id){ const a=ACTIVITIES.list.find(q=>q.id===id); if(!a||!ACTIVITIES.on(a,G.day)) return null; const h=G.hour%24; return h<a.t0?'before':(h<a.t1?'during':(h<a.t1+1/3?'justEnded':'after')); },
  /* 現在進行中（before：開始前幾小時也算，給人流用）；justEnded：**只算結束後 20 分鐘內**（2026-10-13 ChatGPT 審查：原本從開始一直算到結束後 20 分鐘，演講進行中也會觸發「散場後」的事件）*/
  active(G,opt){ opt=opt||{}; const h=G.hour%24; return ACTIVITIES.list.filter(a=>ACTIVITIES.on(a,G.day)&&(opt.justEnded?(h>=a.t1&&h<a.t1+1/3):(h>=a.t0-(opt.before||0)&&h<a.t1))); },
  isActive(G,id,opt){ return ACTIVITIES.active(G,opt).some(a=>a.id===id); },
  /* 公告欄、手機：今天起 n 天內的活動（照海報貼出的天數）*/
  upcoming(G,n){ const out=[]; for(let k=0;k<(n||7);k++){ for(const a of ACTIVITIES.list){ if(!ACTIVITIES.on(a,G.day+k)) continue; const pd=(a.poster&&a.poster.daysBefore!=null)?a.poster.daysBefore:3; if(k>pd) continue; if(k===0&&G.hour%24>=a.t1) continue; out.push({a,k}); } } return out; },
  hhmm(h){ const m=Math.round(h*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); },
  /* 到場紀錄（AA_107 第 10-1 節第 5 項：沒去演講，就不能觸發聽完才合理的後續）：G.acts.att['活動id@第幾天']={h:坐下來聽的時間}。
     玩家坐在活動的那一間、選「聽演講」才算到場（src/classes3d.js 的 attendActivity）；只是路過、站在門口不算。
     條件事件用 prereq.attended（聽過任何一場）／notAttended（一場都沒聽過）／missed（最近結束的那一場沒去）——src/events3d.js。舊存檔沒有 G.acts：第一次用到時補上。 */
  rec(G){ if(!G.acts||typeof G.acts!=='object') G.acts={}; if(!G.acts.att||typeof G.acts.att!=='object') G.acts.att={}; return G.acts; },
  attended(G,id,day){ const A=(G.acts&&G.acts.att)||{}; if(day!=null) return !!A[id+'@'+day]; const p=id+'@'; for(const k in A) if(k.startsWith(p)) return true; return false; },
  markAttended(G,a){ ACTIVITIES.rec(G).att[a.id+'@'+G.day]={h:+(G.hour%24).toFixed(2)}; },
  /* 最近一場已經結束的是第幾天（今天的已經結束也算）；還沒辦過就 null。往回找到第 1 天（四年約 1500 天；每個活動記住上一次的答案）*/
  lastEnded(G,id){ const a=ACTIVITIES.list.find(q=>q.id===id); if(!a) return null; const h=G.hour%24, k=G.day+'|'+(h>=a.t1?1:0); if(a._last&&a._last.k===k) return a._last.v;
    let v=null; for(let d=G.day; d>=1; d--){ if(d===G.day&&h<a.t1) continue; if(ACTIVITIES.on(a,d)){ v=d; break; } } a._last={k,v}; return v; },
  missed(G,id){ const d=ACTIVITIES.lastEnded(G,id); return d!=null&&!ACTIVITIES.attended(G,id,d); },
  /* 坐在這一間的位子上，現在可以聽的活動：開始前 15 分鐘起、過了一半以前（之後進去不算聽過）；今天這一場已經聽過的不再列 */
  atSeat(G,zone,room){ if(!room) return null; const h=G.hour%24; return ACTIVITIES.list.find(a=>a.zone===zone&&a.room===room&&ACTIVITIES.on(a,G.day)&&h>=a.t0-0.25&&h<(a.t0+a.t1)/2&&!ACTIVITIES.attended(G,a.id,G.day))||null; },
  /* 公告欄的文字（沒有活動時寫清楚「目前沒有」，不留空）*/
  posterText(G,zone){ const up=ACTIVITIES.upcoming(G,7).filter(q=>!zone||q.a.zone===zone); if(!up.length) return '目前沒有公告的演講或活動。';
    const W=['日','一','二','三','四','五','六']; return up.map(({a,k})=>{ const d=CALENDAR.dateOf(G.day+k); return (k===0?'今天':k===1?'明天':d.m+'/'+d.d+'（'+W[d.wd%7]+'）')+' '+ACTIVITIES.hhmm(a.t0)+'–'+ACTIVITIES.hhmm(a.t1)+'　'+a.title+(a.roomName?'（'+a.roomName+'）':''); }).join('；'); }
};

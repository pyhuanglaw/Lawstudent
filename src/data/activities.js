/* 活動與演講（D55；設計：docs/campus/PUBLIC_BUILDINGS_DESIGN.md 第 5 節）。
   **內容由 AA、BB 提供**（使用者 2026-10-13：「尚未確認的演講故事」不能先做）——遊戲裡先是空的清單；系統用 tests/activities_unit.js 的測試資料驗證。
   一筆活動：
     { id, title, kind:'lecture'|'club'|'exam'|…, zone, room, term:[學期代號…], weeks:[第幾週…] 或 dates:['2025-10-21',…], weekday:1–5（週一＝1）,
       t0, t1（小時，例如 18.5＝18:30）, poster:{ daysBefore, text }, crowd:{ n }, story:false }
   story:true（牽涉人物劇情）的活動要使用者批准才放。
   用到的地方：公告欄（看公告：今天、這幾天的活動）、手機「今天」、條件事件的 activity 條件（src/events3d.js）、之後的人流（大教室坐到指定人數）。 */
const ACTIVITIES={
  list:[],
  /* 第 day 天有沒有這個活動（學期、週次或日期、星期都對得上）*/
  on(a,day){ if(typeof CALENDAR==='undefined') return false; const d=CALENDAR.dateOf(day);
    if(a.dates) return a.dates.includes(d.key);
    if(a.weekday&&d.wd!==a.weekday) return false; const t=CALENDAR.termOf(day); if(a.term&&(!t||!a.term.includes(t.id))) return false; if(a.weeks&&(!t||!a.weeks.includes(t.week))) return false; return !!(a.term||a.weeks||a.weekday); },
  /* 現在進行中（justEnded：結束後 20 分鐘內也算，給「演講結束後的走廊」用）*/
  active(G,opt){ opt=opt||{}; const h=G.hour%24; return ACTIVITIES.list.filter(a=>ACTIVITIES.on(a,G.day)&&h>=a.t0-(opt.before||0)&&h<a.t1+(opt.justEnded?1/3:0)); },
  isActive(G,id,opt){ return ACTIVITIES.active(G,opt).some(a=>a.id===id); },
  /* 公告欄、手機：今天起 n 天內的活動（照海報貼出的天數）*/
  upcoming(G,n){ const out=[]; for(let k=0;k<(n||7);k++){ for(const a of ACTIVITIES.list){ if(!ACTIVITIES.on(a,G.day+k)) continue; const pd=(a.poster&&a.poster.daysBefore!=null)?a.poster.daysBefore:3; if(k>pd) continue; if(k===0&&G.hour%24>=a.t1) continue; out.push({a,k}); } } return out; },
  hhmm(h){ const m=Math.round(h*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); },
  /* 公告欄的文字（沒有活動時寫清楚「目前沒有」，不留空）*/
  posterText(G,zone){ const up=ACTIVITIES.upcoming(G,7).filter(q=>!zone||q.a.zone===zone); if(!up.length) return '目前沒有公告的演講或活動。';
    const W=['日','一','二','三','四','五','六']; return up.map(({a,k})=>{ const d=CALENDAR.dateOf(G.day+k); return (k===0?'今天':k===1?'明天':d.m+'/'+d.d+'（'+W[d.wd%7]+'）')+' '+ACTIVITIES.hhmm(a.t0)+'–'+ACTIVITIES.hhmm(a.t1)+'　'+a.title+(a.roomName?'（'+a.roomName+'）':''); }).join('；'); }
};

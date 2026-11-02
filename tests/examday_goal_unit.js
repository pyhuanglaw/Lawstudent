// UX-EXAMDAY-GOAL（BB 2026-11-02 14:30）：考試日還沒考＝目標欄寫「09:10 期末考：刑法總則（一）（教室）」；劇情結束目標是「—」時 CLS 的 tick 補上
const H=require('./pg_harness.js'); const {check}=H, J=JSON.stringify;
(async()=>{
  let day=null, it=null;
  for(let d=-200; d<400 && !it; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y1S1') continue; const G=H.fresh('2025-09-01',7,'dorm'); G.day=d; G.weekday=((CALENDAR.dateOf(d).wd)%7); const x=CLS.dayItems(G).find(q=>q.exam==='final'); if(x){ day=d; it=x; } }
  check('0. 找得到大一上的期末考日',!!it,J(day));
  const G=H.fresh('2025-09-01',7,'dorm'); G.day=day; G.weekday=CALENDAR.dateOf(day).wd%7; G.hour=Math.max(6.5,it.t0-2);
  const nx=CLS.next(G); const g=CLS.goalFor(G);
  const hm=h=>String(Math.floor(h)).padStart(2,'0')+':'+String(Math.round((h%1)*60)).padStart(2,'0');
  check('1. 考試日早上：目標＝「'+hm(nx.t0)+' 期末考：'+nx.c.name+'（教室）」',!!nx&&nx.exam==='final'&&g.text.startsWith(hm(nx.t0)+' 期末考：'+nx.c.name),J(g.text));
  check('2. 目的地照舊指向考場',!!g.dest&&!!g.dest.zone,J(g.dest));
  const G2=H.fresh('2025-09-01',7,'dorm'); G2.day=day-1; G2.weekday=CALENDAR.dateOf(day-1).wd%7;
  const nx2=CLS.next(G2); const g2=CLS.goalFor(G2);
  check('3. 不是考試的日子：照舊（今天的課／自由活動）',!(nx2&&nx2.exam)?!/期末考：/.test(g2.text):true,J(g2.text));
  const src=require('fs').readFileSync(H.ROOT+'/src/classes3d.js','utf8');
  check('4. oneTick：目標是空的或「—」、今天還有考試＝S.setGoal（靜態）',/if\(!G\.goal\|\|G\.goal==='—'\)\{ const nx=S\.next\(G\); if\(nx&&nx\.exam\) S\.setGoal\(GM\); \}/.test(src));
  H.done();
})();

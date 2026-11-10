// 手機「課表」的出席：一門課一行（ATTEND-TIDY-1110，使用者 2026-11-10 X292「太亂了」；截圖 docs/handoff/user_shots/1110_attendance_messy.png：
// 「出席：憲法（上） 2 次、體育 點過 2 次名、…」一長串）——不需要瀏覽器（D131）。src/classes3d.js S.weekHTML。
//   1 出席那一塊有標題「出席」，這學期每一門課各一行（attRow），不再是用頓號接起來的一長串
//   2 每一行左邊課名、右邊次數：點名的課「點過 n 次名（缺 m 次）」、有週數的（服務學習）「n／N 次」、其他「去過 n 次」
// 修改前 1、2 FAIL。用法：node tests/attend_tidy_unit.js
const H=require('./pg_harness.js'); const {check}=H; const J=JSON.stringify;
const G=H.fresh('2025-10-23',10,'dorm'); G.stage='law';
const t=CALENDAR.termOf(G.day), cs=CLS.termCourses(G,t.id), R=CLS.rec(G);
for(const c of cs) R.attend[c.id]=2;
const h=CLS.weekHTML(G), i=h.indexOf('<b>出席</b>'), blk=i>=0?h.slice(i,h.indexOf('<div class="item">',i+1)>0?h.indexOf('<div class="item">',i+1):undefined):'';
const rows=[...blk.matchAll(/<div class="phrow attRow"[^>]*><span>([^<]*)<\/span><span[^>]*>([^<]*)<\/span><\/div>/g)].map(m=>[m[1],m[2]]);
check('1. 出席有標題「出席」，每一門課一行（'+cs.length+' 門）',i>=0&&rows.length===cs.length&&!/出席：/.test(h),J({n:rows.length,want:cs.length,rows:rows.slice(0,3)}));
const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
const okRow=c=>{ const r=rows.find(x=>x[0]===esc(c.name)); if(!r) return false; if(CLS.attCourse(c)) return /^點過 \d+ 次名(（缺 \d+ 次）)?$/.test(r[1]); if(c.weeks) return r[1]==='2／'+c.weeks.length+' 次'; return r[1]==='去過 2 次'; };
check('2. 每一行：課名＋次數（點名的課「點過 n 次名（缺 m 次）」、服務學習「n／N 次」、其他「去過 n 次」）',cs.every(okRow),J(rows));
H.done();

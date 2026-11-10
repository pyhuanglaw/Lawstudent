// 學期還沒開始的課表：出席不算缺、標題寫「還沒開學」（BB-B 11-07 BUG-LAW830-ATTEND-CARRY-1107：8/30 進法律系，課表寫「缺 4 次」、標題「大一上（下學期）」）——不需要瀏覽器。
// CLS.rollStat 在學期以外的日子原本把 4 個點名週全算成「已經點過」（past＝W）。修改前 FAIL。用法：node tests/attend_preterm_unit.js
const H=require('./pg_harness.js'); const {check}=H; const J=JSON.stringify;
const G=H.fresh('2025-08-30',10,'dorm'); G.stage='law';
const cs=CLS.termCourses(G,'Y1S1'), att=cs.filter(c=>CLS.attCourse(c));
const st=att.map(c=>CLS.rollStat(G,c,'Y1S1',G.day));
check('8/30（大一上還沒開始）：看出席的課一次都還沒點、沒有缺',att.length>0&&st.every(s=>s.past===0&&s.missed===0),J(st));
const h=CLS.weekHTML(G);
check('課表標題寫「大一上（還沒開學）」，出席沒有「缺」',/大一上<\/b>（還沒開學）/.test(h)&&!/（缺 \d+ 次）/.test(h),h.slice(0,200));
const end=CLS.termStartDay('Y1S2'); const G2=H.fresh('2025-08-30',10,'dorm'); G2.stage='law'; G2.day=end+3;
const st2=att.map(c=>CLS.rollStat(G2,c,'Y1S1',G2.day));
check('大一上結束以後看大一上：4 個點名週都算過去了（沒去＝缺）',st2.every(s=>s.past===s.weeks.length),J(st2.map(s=>[s.past,s.weeks.length])));
H.done();

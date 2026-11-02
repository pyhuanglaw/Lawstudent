// D118-B1-1102（D118_PLAN.md 第 4 節 B1）：卡死與考試例外修正——不需要瀏覽器。
//   a 重考的人（2029 一試沒過）或交換延畢的人錯過 2030 一試：尾聲照常觸發（BB baseline career_recheck N1、N2）
// 修改前（開發分支 53d976664）：a FAIL。用法：node tests/d118_b1_unit.js
'use strict';
const H=require('./pg_harness.js');
const {check}=H;
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
(async()=>{
  /* a1 重考：2029 報名、一試沒過（stage none）、2030 那天沒去 */
  { const G=H.fresh('2030-08-03',8,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none'}); graduated(G); PG.rec(G).done.exam_2029=1; PG.rec(G).done.r1_2029=1;
    const sits=PG.sits(G,2030); H.at('2030-08-04',12); PG.pending(G);
    G.flags.FIRST_DAY_SEEN=true; PG.rec(G).done.first=1; H.at('2034-06-03',19); PG.pending(G); const d=PG.due(G);
    check('a1. 重考的人錯過 2030 一試：2034-06-03 19:00 輪到尾聲',sits&&PG.rec(G).done.exam_2030==='missed'&&!PG.pendingExam(G)&&!!d&&d.id==='epi',JSON.stringify({sits,ex:PG.rec(G).done.exam_2030,pend:PG.pendingExam(G),due:d&&d.id})); }
  /* a2 交換延畢：2030 報名了、那天沒去 */
  { const G=H.fresh('2030-08-03',8,'dorm',{EXCHANGE_ROUTE:'US',BAR_REG_2030:true}); graduated(G);
    const sits=PG.sits(G,2030); H.at('2030-08-04',12); PG.pending(G);
    G.flags.FIRST_DAY_SEEN=true; PG.rec(G).done.first=1; H.at('2034-06-03',19); PG.pending(G); const d=PG.due(G);
    check('a2. 交換延畢錯過 2030 一試：輪到尾聲',sits&&!PG.pendingExam(G)&&!!d&&d.id==='epi',JSON.stringify({sits,delayed:PG.delayed(G),ex:PG.rec(G).done.exam_2030,pend:PG.pendingExam(G),due:d&&d.id})); }
  /* a3 對照：2030 有去考、還沒放榜 → 尾聲照舊等它 */
  { const G=H.fresh('2030-12-13',10,'dorm',{EXCHANGE_ROUTE:'US',BAR_REG_2030:true,BAR_SIT_2030:true,BAR_SCORE_2030:8,BAR_STAGE_2030:'lawyer'}); graduated(G); G.flags.FIRST_DAY_SEEN=true; PG.rec(G).done.exam_2030=1;
    check('a3. 2030 有考、還沒放榜：尾聲照舊等',PG.pendingExam(G)&&!PG.byId('epi').cond(G)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

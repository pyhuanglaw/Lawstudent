// D118-B1-1102（D118_PLAN.md 第 4 節 B1）：卡死與考試例外修正——不需要瀏覽器。
//   b 沒有期中考（使用者 05:0x）：期中週照常上課（日曆上的期中週照舊給時間系統用）、法律課不考試（不是考試）、只有第 16 週期末考；黑板不寫期中考
//   c 考試週只有考五題的法律課是考試
//   d 日本補修兩門考原課五題
//   e 專題、實習、經濟系那一年的成績不看讀書次數
//   a 重考的人（2029 一試沒過）或交換延畢的人錯過 2030 一試：尾聲照常觸發（BB baseline career_recheck N1、N2）
// 修改前（開發分支 53d976664）：a FAIL；b 在 c3036bc90 FAIL。用法：node tests/d118_b1_unit.js
'use strict';
const H=require('./pg_harness.js');
const {check}=H;
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
(async()=>{
  /* b 沒有期中考 */
  { let d8=null,d16=null; for(let d=H.D('2025-09-01');d<H.D('2026-02-01');d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===8&&d8==null&&!CALENDAR.holiday(d)&&CALENDAR.dateOf(d).wd<=5) d8=d; if(t&&t.id==='Y1S1'&&t.week===16&&d16==null) d16=d; }
    const t8=CALENDAR.termOf(d8), t16=CALENDAR.termOf(d16);
    const G=H.fresh('2025-09-01',8,'dorm',{}); let items=[]; for(let d=d8;d<d8+14;d++) items=items.concat(CLS.dayItems(G,d));
    const ex=items.filter(it=>it.exam); const law=items.filter(it=>CLS.isExamCourse&&CLS.isExamCourse(it.c));
    check('b1. 大一上第 8 週：日曆上照舊是期中週（給劇情、約會、打工的時間系統用）、考試清單沒有期中考；第 16 週期末考',t8&&t8.exam==='mid'&&t16&&t16.exam==='final'&&!CLS.examList(G,'Y1S1').some(e=>e.kind==='mid')&&CLS.examList(G,'Y1S1').length>0,JSON.stringify({t8,t16,list:CLS.examList(G,'Y1S1').map(e=>e.c.id+':'+e.kind)}));
    check('b2. 第 8～9 週兩週的課都不是考試（法律課照常上課）',law.length>0&&!ex.length,JSON.stringify({law:law.length,ex:ex.map(i=>i.c.id+':'+i.exam)}));
    check('b3. 期中週黑板不寫「期中考」（S.topic 用第 7 週的主題）',!items.some(it=>CLS.content(it).board.join('').includes('期中考'))&&CLS.topic(items[0].c,8)===CLS.topic(items[0].c,7)); }
  /* c 考試週只有考五題的法律課是考試；國文那一堂照常上課 */
  { let d16=null; for(let d=H.D('2025-12-01');d<H.D('2026-02-01');d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===16){ d16=d; break; } }
    const G=H.fresh('2025-09-01',8,'dorm',{}); let items=[]; for(let d=d16;d<d16+7;d++) items=items.concat(CLS.dayItems(G,d));
    const nonLaw=items.filter(it=>!CLS.isExamCourse(it.c)), lawEx=items.filter(it=>CLS.isExamCourse(it.c));
    check('c1. 期末週：不考五題的課（國文、英文、通識、體育）不是考試',nonLaw.length>0&&nonLaw.every(it=>!it.exam),JSON.stringify(nonLaw.map(i=>i.c.id+':'+i.exam)));
    check('c2. 期末週：考五題的法律課照舊是期末考',lawEx.length>0&&lawEx.every(it=>it.exam==='final'),JSON.stringify(lawEx.map(i=>i.c.id+':'+i.exam))); }
  /* d 日本路線補修兩門考原課的五題，分數只看答題 */
  { const re=COURSES.list.find(c=>c.id==='civpro_2_re'), ins=COURSES.list.find(c=>c.id==='insurance_re');
    const p=CLS.examPool('civpro_2_re','Y4S2','final'), p0=CLS.examPool('civpro_2','Y3S2','final'); const n=x=>x.cls.length+x.bank.length+x.ai.length;
    check('d1. civpro_2_re、insurance_re 是考五題的課；抽題池＝原課（大三下）的期末範圍',CLS.isExamCourse(re)&&CLS.isExamCourse(ins)&&n(p)>=5&&n(p)===n(p0),JSON.stringify({re:CLS.isExamCourse(re),ins:CLS.isExamCourse(ins),n:n(p),n0:n(p0)}));
    const G=H.fresh('2029-01-01',8,'dorm',{EXCHANGE_ROUTE:'JP'}); const R=CLS.rec(G); R.prep.civpro_2_re=50;
    const g=CLS.reportFor(G,'Y4S2');
    check('d2. 成績單：補修課沒考＝缺考（不是照讀書次數的「很好」）',g.civpro_2_re==null||!/很好|不錯|過了/.test(g.civpro_2_re),JSON.stringify(g)); }
  /* e 專題研究、實習＝通過；經濟系那一年＝及格；都不看讀書次數 */
  { const G=H.fresh('2029-03-01',8,'dorm',{}); const R=CLS.rec(G); R.prep.legal_research=0; const g=CLS.reportFor(G,'Y4S2'); R.prep.legal_research=99; const g2=CLS.reportFor(G,'Y4S2');
    check('e1. 法律專題研究、法律實習：固定「通過」，讀書次數 0 和 99 一樣',(g.legal_research==null||g.legal_research==='通過')&&JSON.stringify(g)===JSON.stringify(g2),JSON.stringify({g,g2}));
    } // CANON-NO-ECON-1112：經濟系那一年拿掉（e2 經濟系那一年的必修固定「及格」）
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

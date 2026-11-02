const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js'); const GM=H.GM;
const grad=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
(async()=>{
  // N1：2029 不到 12 題的重考生，2030-08-03 一試整段錯過
  { const G=H.fresh('2030-08-03',7,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none',LAWCLUB_SAT_VISITS:10,FAIL_DELAY_COURSES:[]}); grad(G);
    const r=PG.rec(G); ['exam_2029','r1_2029'].forEach(k=>r.done[k]=1);
    H.at('2030-08-05',7); PG.pending(G);
    console.log('N1 exam_2030 done=',r.done.exam_2030,'BAR_SIT_2030=',G.flags.BAR_SIT_2030,'sits2030=',PG.sits(G,2030));
    G.flags.FIRST_DAY_SEEN=true; r.done.first=1; H.at('2034-06-03',20); const p=PG.pending(G).map(x=>x.s.id);
    console.log('N1 2034-06-03 20:00 pendingExam=',PG.pendingExam(G),'epi cond=',PG.byId('epi').cond(G),'due=',PG.due(G)&&PG.due(G).id,'pending=',p.join(','),'r2_2030 done=',r.done.r2_2030);
    H.at('2040-01-01',12); console.log('N1 2040 epi cond=',PG.byId('epi').cond(G),'PG.on=',PG.on(G),'nextStop=',PG.nextStop(G)); }
  // N2：交換延畢、2030 報了名、一試錯過
  { const G=H.fresh('2030-08-03',7,'dorm',{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true,LAWCLUB_SAT_VISITS:10}); grad(G);
    H.at('2030-08-05',7); PG.pending(G); const r=PG.rec(G); G.flags.FIRST_DAY_SEEN=true; r.done.first=1; H.at('2034-06-03',20);
    console.log('N2 delayed=',PG.delayed(G),'sits2030=',PG.sits(G,2030),'pendingExam=',PG.pendingExam(G),'epi cond=',PG.byId('epi').cond(G)); }
  // N3：二試兩天都錯過（e2a、e2b missed）→ 12/14 放榜照樣錄取？
  { const G=H.fresh('2029-10-20',7,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer',LAWCLUB_SAT_VISITS:10}); grad(G); const r=PG.rec(G); r.done.exam_2029=1; r.done.r1_2029=1;
    H.at('2029-10-23',7); PG.pending(G); console.log('N3 e2a=',r.done.e2a_2029,'e2b=',r.done.e2b_2029);
    H.at('2029-12-14',15.2); const d=PG.due(G); console.log('N3 12/14 due=',d&&d.id); if(d) await PG.runStep(GM,d); console.log('N3 BAR_YEAR=',G.flags.BAR_YEAR,'said=',JSON.stringify(H.said.slice(-3).map(s=>s.t))); }
  // N4：一試答對 16 但 12/14 錯過（BAR_STAGE both、BAR_YEAR 缺）
  { const G=H.fresh('2029-12-14',14,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:17,BAR_STAGE_2029:'both',LAWCLUB_SAT_VISITS:10}); grad(G); const r=PG.rec(G); ['exam_2029','r1_2029','e2a_2029','e2b_2029'].forEach(k=>r.done[k]=1);
    H.at('2029-12-16',16); PG.pending(G); console.log('N4 BAR_YEAR=',G.flags.BAR_YEAR,'sits2030=',PG.sits(G,2030),'path=',PG.path(G)); }
  process.exit(0);
})().catch(e=>{ console.log('EXC',e&&e.stack); process.exit(1); });

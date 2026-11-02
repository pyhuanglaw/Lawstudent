const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js');
const pool=PG.pool(); const st={}; for(const q of EXAM_BANK.questions){ st[q.status]=(st[q.status]||0)+1; }
console.log('EXAM_BANK status counts',JSON.stringify(st));
console.log('QBANK total',QBANK.length,'complete!==false',QBANK.filter(q=>q.complete!==false).length);
const src={}; for(const q of pool){ const k=(q.status||'QBANK')+'|'+(q.course||q.subject||q.term||''); src[q.status||'QBANK']=(src[q.status||'QBANK']||0)+1; }
console.log('bar pool size',pool.length,JSON.stringify(src));
const byC={}; for(const q of pool){ const c=q.course||q.subject||'qbank'; byC[c]=(byC[c]||0)+1; } console.log('by course',JSON.stringify(byC));
// determinism: same seed same questions
const G=H.fresh('2029-08-04',7,'dorm',{BAR_REG:true}); const a=PG.draw(G,2029).map(q=>q.id); const b=PG.draw(G,2029).map(q=>q.id); const c=PG.draw(G,2030).map(q=>q.id);
console.log('2029 draw stable',JSON.stringify(a)===JSON.stringify(b),'2030 overlap with 2029',c.filter(x=>a.includes(x)).length, 'sample',a.slice(0,5).join(','));
console.log('tier table', [0,11,12,15,16,20].map(k=>k+':'+PG.tier(2029,k)+'/'+PG.tier(2030,k)).join(' '));

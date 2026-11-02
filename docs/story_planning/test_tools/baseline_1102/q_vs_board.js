require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/alison.js');
const H=require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/pg_harness.js');
const G=H.fresh('2025-12-01',9,'classroom');
for(const cid of ['civ_general','const_1','crim_gen1']){
  const r=CLS.drawExam(G,cid,'Y1S1','final'); const syl=SYLLABUS.courses[cid]||[];
  console.log('== '+cid+' 期末抽到：');
  for(const q of r.qs){ const wk=q.scopeWeek!=null?+q.scopeWeek:null; const w=syl.find(x=>x.w===wk); const ans=q.options?q.answer+' '+q.options[q.answer]:q.answer;
    const inClass=syl.some(x=>(x.ask&&x.ask.qid===q.id)||(x.obs&&x.obs.disc&&x.obs.disc.qid===q.id));
    console.log('- '+q.id+'（'+q.status+'，第'+wk+'週，課堂公布答案:'+(inClass?'是':'否')+'）'+q.q.slice(0,50)+' ｜答案 '+ans+' ｜考點 '+(q.core||'')+' ｜該週黑板（自習筆記）：'+(w?(w.board||[]).join(' / '):'無')); }
}
process.exit(0);

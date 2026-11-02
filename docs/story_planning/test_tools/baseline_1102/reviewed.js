require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/alison.js');
const H=require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/pg_harness.js');
const rev=new Set(SYLLABUS.reviewed||[]); const out=[];
for(const c of COURSES.list){ if(!CLS.isExamCourse(c)) continue; const syl=SYLLABUS.courses[c.id]||[]; const tw=syl.filter(w=>![8,9,16].includes(w.w));
  const r=tw.filter(w=>rev.has(c.id+'|'+w.w)).length; out.push(c.term+' '+c.id+' 教學週 '+tw.length+'，審查過（自習筆記有黑板內容）'+r); }
console.log(out.join('\n'));
// 刑訴 QBANK：多少題有 core（說明）
console.log('QBANK 題數',QBANK.length,'有 core',QBANK.filter(q=>q.core).length,'complete!==false',QBANK.filter(q=>q.complete!==false).length);
process.exit(0);

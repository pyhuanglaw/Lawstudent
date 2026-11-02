require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/alison.js');
const H=require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/pg_harness.js');
// 每門考五題的課：題庫裡有幾題、幾題有 askedIn（課堂提問會在那堂課公布答案）、syllabus 的 ask/disc 指到幾題、那一週有沒有通過審查（自習筆記才有內容）
const rows=[]; let tot={q:0,asked:0,shownInClass:0,boardHasAns:0,expl:0,reviewedWeek:0};
const rev=new Set(SYLLABUS.reviewed||[]);
for(const c of COURSES.list){ if(!CLS.isExamCourse(c)) continue;
  const pool=CLS.examPool(c.id,c.term,'final'); const all=pool.cls.concat(pool.bank,pool.ai);
  const syl=(SYLLABUS.courses[c.id]||[]);
  const askIds=new Set(); for(const w of syl){ if(w.ask&&w.ask.qid) askIds.add(w.ask.qid); if(w.obs&&w.obs.disc&&w.obs.disc.qid) askIds.add(w.obs.disc.qid); }
  let shown=0, boardAns=0, expl=0, revW=0;
  for(const q of all){ if(askIds.has(q.id)) shown++; if(q.explanation) expl++;
    const wk=q.scopeWeek!=null?+q.scopeWeek:(q.askedIn&&q.askedIn.week);
    const w=syl.find(x=>x.w===wk); if(w&&rev.has(c.id+'|'+wk)) revW++;
    const ansText=q.options?q.options[q.answer]:q.answer; const bt=w&&rev.has(c.id+'|'+wk)?(w.board||[]).join(' '):'';
    if(bt&&ansText&&ansText.length>=2&&bt.includes(ansText.replace(/[。．]$/,''))) boardAns++; }
  rows.push([c.term,c.id,'題庫'+all.length,'課堂題'+pool.cls.length,'題庫題'+pool.bank.length,'AI'+pool.ai.length,'課堂公布答案'+shown,'有解析'+expl,'該週審查過'+revW,'黑板含答案字樣'+boardAns].join('\t'));
  tot.q+=all.length; tot.shownInClass+=shown; tot.expl+=expl; tot.boardHasAns+=boardAns; tot.reviewedWeek+=revW; tot.asked+=pool.cls.length; }
console.log(rows.join('\n')); console.log(tot);

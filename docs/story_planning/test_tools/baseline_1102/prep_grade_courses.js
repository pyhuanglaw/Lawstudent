// 唯讀：哪些課的成績單用 gradeOf(prep)（讀書／上課次數）而不是答題或出席
require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/alison.js');
const H=require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/pg_harness.js');
const out=[];
for(const c of COURSES.list){ if(!/^Y[1-5]S[12]$/.test(c.term||'')) continue; if(c.kind==='service') continue; if(CLS.isExamCourse(c)||CLS.attCourse(c)) continue; out.push(c.term+' '+c.id+' '+c.name+' kind='+c.kind+' noExam='+CLS.noExam(c)); }
console.log('用 prep 次數給「很好／不錯／過了」的課：'+out.length); for(const s of out) console.log('  '+s);
console.log('gradeOf(0)=',CLS.gradeOf(0),' gradeOf(5)=',CLS.gradeOf(5),' gradeOf(10)=',CLS.gradeOf(10));

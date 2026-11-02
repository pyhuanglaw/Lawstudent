require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/alison.js');
const H=require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/pg_harness.js');
const G=H.fresh('2027-12-01',9,'classroom');
const r=CLS.drawExam(G,'crimpro','Y3S1','final');
for(const q of r.qs) console.log('- '+q.id+'（'+(q.section||'')+'）'+q.q.slice(0,60)+'｜答案 '+(q.options?q.answer+' '+q.options[q.answer]:q.answer)+'｜core:'+(q.core||'（無）'));
console.log('刑訴教學週黑板：'); for(const w of (SYLLABUS.courses.crimpro||[])) if(![8,9,16].includes(w.w)) console.log(' 第'+w.w+'週 '+(w.board||[]).join(' / '));
process.exit(0);

const fs=require('fs'), vm=require('vm');
const ROOT='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
global.window=global;
vm.runInThisContext(fs.readFileSync(ROOT+'/src/data/syllabus.js','utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='));
vm.runInThisContext(fs.readFileSync(ROOT+'/src/data/exam_bank.js','utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='));
const [course,...kws]=process.argv.slice(2);
const rev=new Set(SYLLABUS.reviewed);
for(const w of (SYLLABUS.courses[course]||[])){ let s=JSON.stringify(w); const ask=w.ask&&w.ask.qid?EXAM_BANK.questions.find(q=>q.id===w.ask.qid):null; const disc=w.obs&&w.obs.disc&&w.obs.disc.qid?EXAM_BANK.questions.find(q=>q.id===w.obs.disc.qid):null; if(ask) s+=' ASK:'+ask.q+JSON.stringify(ask.options)+ask.core+ask.explanation; if(disc) s+=' DISC:'+disc.q+JSON.stringify(disc.options)+disc.core;
  const hit=kws.filter(k=>s.includes(k)); if(hit.length) console.log(course,'w'+w.w,'rev='+rev.has(course+'|'+w.w),'hits='+hit.join(','),'|',(w.board||[]).join(' / ').slice(0,120), ask?'| ASK '+ask.id:'', disc?'| DISC '+disc.id:''); }
// also check second / pools

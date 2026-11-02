const fs=require('fs'), vm=require('vm');
const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
const ctx={console}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(LW+'/src/data/exam_bank.js','utf8')+';this.EXAM_BANK=EXAM_BANK;',ctx);
vm.runInContext(fs.readFileSync(LW+'/src/data/legal_qbank.js','utf8')+';this.QBANK=QBANK;',ctx);
const EB=ctx.EXAM_BANK;
console.log('keys',Object.keys(EB));
console.log('questions',EB.questions.length);
console.log('sample q', JSON.stringify(EB.questions[0]).slice(0,800));
const by={};
for(const q of EB.questions){ const k=q.term+' '+q.course; by[k]=by[k]||{n:0,st:{},expl:0,core:0,asked:0,scope:0,src:{}}; const b=by[k]; b.n++; b.st[q.status]=(b.st[q.status]||0)+1; if(q.explanation) b.expl++; if(q.core) b.core++; if(q.askedIn||q.source==='CLASS_DISC') b.asked++; if(q.scopeWeek!=null) b.scope++; b.src[q.source]=(b.src[q.source]||0)+1;}
for(const k of Object.keys(by).sort()) console.log(k, JSON.stringify(by[k]));
console.log('courseMap', JSON.stringify(EB.courseMap));
console.log('QBANK',ctx.QBANK.length, JSON.stringify(ctx.QBANK[0]).slice(0,600));

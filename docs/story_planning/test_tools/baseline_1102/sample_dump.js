const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js']) load(f);
const ids=process.argv.slice(2);
const rev=new Set(SYLLABUS.reviewed||[]);
const txt=w=>{ if(!w) return '(無該週 syllabus)'; const p=[]; p.push('board='+JSON.stringify(w.board)); if(w.line) p.push('line='+w.line); if(w.react) p.push('react='+JSON.stringify(w.react.map(r=>r.text))); if(w.obs) p.push('obs='+JSON.stringify({prompt:w.obs.prompt,opts:(w.obs.options||[]).map(o=>o.text+(o.result?'→'+o.result:'')),kind:w.obs.kind,close:w.obs.close||w.obs.wrap})); if(w.call) p.push('call='+JSON.stringify(w.call)); if(w.ask) p.push('ask='+JSON.stringify(w.ask)); return p.join('\n     '); };
for(const id of ids){ const q=EXAM_BANK.questions.find(x=>x.id===id); if(!q){ console.log('NO',id); continue; }
  const syl=(SYLLABUS.courses[q.course]||[]); const w=syl.find(x=>x.w===+q.scopeWeek);
  const asks=[]; for(const x of syl){ if(x.ask&&x.ask.qid===id) asks.push('w'+x.w+' ask'); if(x.obs&&x.obs.disc&&x.obs.disc.qid===id) asks.push('w'+x.w+' disc'); }
  console.log('=== '+id+' '+q.term+' '+q.course+' w'+q.scopeWeek+' '+q.status+' asked='+JSON.stringify(q.askedIn||q.source)+' classAsk='+JSON.stringify(asks)+' reviewed='+rev.has(q.course+'|'+q.scopeWeek));
  console.log('  Q: '+q.q); if(q.options) console.log('  opts: '+JSON.stringify(q.options)); console.log('  ANS: '+q.answer+'  core: '+q.core+'  expl: '+(q.explanation||'(無)'));
  console.log('  SYL w'+q.scopeWeek+': '+txt(w));
}

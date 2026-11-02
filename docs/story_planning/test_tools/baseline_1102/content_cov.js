const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js']) load(f);
const askMap={}; // qid -> [course|week|kind]
for(const cid in SYLLABUS.courses) for(const w of SYLLABUS.courses[cid]){ if(w.ask&&w.ask.qid) (askMap[w.ask.qid]=askMap[w.ask.qid]||[]).push(cid+'|w'+w.w+'|ask'); if(w.obs&&w.obs.disc&&w.obs.disc.qid) (askMap[w.obs.disc.qid]=askMap[w.obs.disc.qid]||[]).push(cid+'|w'+w.w+'|disc'); }
const rev=new Set(SYLLABUS.reviewed||[]);
const out={}; const rows=[];
for(const q of EXAM_BANK.questions){ const c=COURSES.list.find(x=>x.id===q.course); const k=q.term+' '+q.course; const o=out[k]=out[k]||{n:0,ask:0,revWeek:0,expl:0,none:0,mid:0};
  o.n++; const a=askMap[q.id]; if(a) o.ask++; const rw=rev.has(q.course+'|'+q.scopeWeek); if(rw) o.revWeek++; if(q.explanation) o.expl++; if(q.scopeWeek<=7) o.mid++; if(!a&&!q.explanation) o.none++;
  rows.push({id:q.id,course:q.course,term:q.term,w:q.scopeWeek,st:q.status,ask:a||null,rev:rw,expl:!!q.explanation}); }
console.log('course  n  ask(課堂提問/討論題)  該週課堂內容已審查  有解析  期中範圍(w<=7)  既非課堂題也無解析');
for(const k of Object.keys(out).sort()) console.log(k.padEnd(26), JSON.stringify(out[k]));
// crimpro QBANK
console.log('QBANK crimpro questions:',QBANK.length,'all scope=全學期; askMap hits:',QBANK.filter(q=>askMap[q.id]).length);
fs.writeFileSync(__dirname+'/cov_rows.json',JSON.stringify(rows,null,0));
console.log('reviewed count',rev.size);

const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js']) load(f);
const askSet=new Set(); for(const cid in SYLLABUS.courses) for(const w of SYLLABUS.courses[cid]){ if(w.ask&&w.ask.qid) askSet.add(w.ask.qid); if(w.obs&&w.obs.disc&&w.obs.disc.qid) askSet.add(w.obs.disc.qid); }
const N=300;
console.log('course term | pool cls/bank/ai(final) | mid pool | 平均：期末5題中「課堂提問逐字教過」題數 | 期末題在期中出現過 | 有 explanation');
for(const [cid,cm] of Object.entries(EXAM_BANK.courseMap)){ if(cm.exam!=='mc5') continue; const t=cm.term; const pf=CLS.examPool(cid,t,'final'), pm=CLS.examPool(cid,t,'mid');
  let a=0,inMid=0,ex=0,minA=9; for(let s=0;s<N;s++){ const G={day:1,hour:9,flags:{examSeed:s*7919+13},courses:null}; CLS.drawExam(G,cid,t,'mid'); const r=CLS.drawExam(G,cid,t,'final'); if(!r.ok) continue; const mid=new Set((CLS.rec(G).exam[t+':'+cid+':mid']||{}).qs||[]); const k=r.qs.filter(q=>askSet.has(q.id)).length; a+=k; minA=Math.min(minA,k); inMid+=r.qs.filter(q=>mid.has(q.id)).length; ex+=r.qs.filter(q=>q.explanation).length; }
  console.log((cid+' '+t).padEnd(28), [pf.cls.length,pf.bank.length,pf.ai.length].join('/').padEnd(9), [pm.cls.length,pm.bank.length,pm.ai.length].join('/').padEnd(8), (a/N).toFixed(2)+' (min '+minA+')', (inMid/N).toFixed(2), (ex/N).toFixed(2)); }

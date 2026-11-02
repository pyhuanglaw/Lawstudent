const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK|HONOR|GRADES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js','src/honor3d.js','src/grades3d.js']) load(f);
const mk=(day)=>({day,hour:8,flags:{},stage:'law'});
// 1) 期末考週（Y1S1 第 16 週）每天的課：哪些是 exam
const r=CALENDAR.termDays('Y1S1'); const ex=[];
for(let d=r.from; d<=r.to; d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y1S1'||!t.exam) continue; for(const it of CLS.dayItems(mk(d),d)) ex.push(CALENDAR.dateOf(d).key+' w'+t.week+' '+it.c.id+' exam='+it.exam+' mc5='+CLS.isExamCourse(it.c)); }
console.log('Y1S1 考試週的課：'); ex.forEach(x=>console.log('  '+x));
// 2) gradeOf(prep) 的課：prep 0 / 5 / 10
for(const [t,ids] of [['Y4S2',['legal_research','legal_practice']],['Y0S1',['econ_principles_y0','acct_y0','calc_y0s1']]]){ for(const p of [0,5,10]){ const G=mk(1); G.stage=t.startsWith('Y0')?'econ':'law'; const R=CLS.rec(G); for(const id of ids) R.prep[id]=p; const rep=CLS.reportFor(G,t); console.log(t+' prep='+p+'：'+ids.map(id=>id+'='+rep[id]).join('、')); } }

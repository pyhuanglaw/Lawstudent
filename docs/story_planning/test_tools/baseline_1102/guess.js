const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js']) load(f);
const N=300; let tot=0,cnt=0; const rows=[];
for(const [cid,cm] of Object.entries(EXAM_BANK.courseMap)){ if(cm.exam!=='mc5') continue; let p0=0; for(let s=0;s<N;s++){ const G={day:1,hour:9,flags:{examSeed:s*31+7}}; CLS.drawExam(G,cid,cm.term,'mid'); const r=CLS.drawExam(G,cid,cm.term,'final'); let p=1; for(const q of r.qs){ const k=q.type==='tf'||!q.options?2:Object.keys(q.options).length; p*= (k-1)/k; } p0+=p; } rows.push([cid,(p0/N*100).toFixed(1)]); tot+=p0/N; cnt++; }
console.log('完全用猜（不懂法律）期末 0 題＝被當的機率（%）：'); console.log(rows.map(r=>r.join(' ')).join('、')); console.log('平均 '+(tot/cnt*100).toFixed(1)+'%');

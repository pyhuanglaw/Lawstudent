const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js']) load(f);
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const d=dayOf('2025-12-14'); const G={day:d,hour:9,flags:{},stage:'law'}; console.log('termOf', JSON.stringify(CALENDAR.termOf(d)), 'examWeek='+CLS.examWeek(G), 'study slot cap am/pm/ev=', ['am','pm','ev'].map(p=>CLS.slotCap(G,p,'study')).join('/'));
for(const cid of ['const_1','crim_gen1','civ_general']){ const notes=new Set(); let n=0, st; while((st=CLS.studyTopic(G,CLS.byId(cid),id=>notes.has(id)))&&n<40){ notes.add(st.id); n++; if(n<=2||n===14) console.log('  '+cid+' #'+n+' '+st.id+'：'+st.title+' ｜ '+st.body); } console.log(cid+'：考前一天可以一次補完的筆記份數＝'+n+'（每小時一份）'); }
// 期中週（第 8 週）前一天
const d2=dayOf('2025-10-19'); const G2={day:d2,hour:9,flags:{},stage:'law'}; for(const cid of ['civ_general']){ const notes=new Set(); let n=0; while(CLS.studyTopic(G2,CLS.byId(cid),id=>notes.has(id))&&n<40){ const st=CLS.studyTopic(G2,CLS.byId(cid),id=>notes.has(id)); notes.add(st.id); n++; } console.log('期中週前一天 '+cid+'：可補筆記 '+n+' 份（第 '+CALENDAR.termOf(d2).week+' 週）'); }

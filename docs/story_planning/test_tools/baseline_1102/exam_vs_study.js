require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/alison.js');
const H=require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/pg_harness.js');
const fs=require('fs'),vm=require('vm'),path=require('path');
const ld=f=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(/^const (HONOR|GRADES)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
ld('src/honor3d.js'); ld('src/grades3d.js');
const GM=H.GM;
// 找大一上民法總則的期末考日
const c=CLS.byId('civ_general');
function setup(prepN,studyHours){ const G=H.fresh('2025-12-01',9,'classroom'); const R=CLS.rec(G); R.prep.civ_general=prepN; G.stats.study=studyHours; return G; }
async function take(G,mode){ const R=CLS.rec(G); const d=CLS.examDay(G,c,'Y1S1','final'); G.day=d.day; const r=CLS.drawExam(G,'civ_general','Y1S1','final');
  const opt=q=>q.type==='tf'||!q.options?['對','錯']:Object.keys(q.options);
  let i=0; GM.choose=async o=>{ const q=r.qs[Math.min(i,4)]; const keys=opt(q); const ai=keys.indexOf(String(q.answer)); i++; if(mode==='right') return ai; if(mode==='wrong') return ai===0?1:0; return 0; };
  const it={c,exam:'final',term:'Y1S1',key:d.day+':civ_general:x'};
  const res=await CLS.runExam(GM,it); return res; }
(async()=>{
  for(const [prep,st,mode] of [[0,0,'right'],[60,200,'right'],[0,0,'wrong'],[60,200,'wrong']]){
    const G=setup(prep,st); const res=await take(G,mode); const rep=CLS.reportFor(G,'Y1S1');
    console.log('prep='+prep+' stats.study='+st+' 作答='+mode+' → 答對 '+res.correct+'/5、'+res.score+' 分；成績單 民法總則：'+rep.civ_general+'；HONOR.avg='+HONOR.avg(G,'Y1S1')+'；GRADES.lv='+GRADES.lv(G,'Y1S1'));
  }
  // 不參加期末考（缺考）
  { const G=setup(60,200); const rep=CLS.reportFor(G,'Y1S1'); console.log('讀很多但缺考 → 成績單 民法總則：'+rep.civ_general+'；failedIn 含民總：'+CLS.failedIn(G,'Y1S1').some(x=>x.id==='civ_general')); }
  // gradeOf(prep) 的課：法律專題研究（Y4S2，NO_EXAM）
  for(const p of [0,4,12]){ const G=H.fresh('2029-06-20',9,'dorm'); CLS.rec(G).prep.legal_research=p; console.log('legal_research prep='+p+' → 成績單：'+CLS.reportFor(G,'Y4S2').legal_research); }
  process.exit(0);
})().catch(e=>{ console.error(e); process.exit(1); });

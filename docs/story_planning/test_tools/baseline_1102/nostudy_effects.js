require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/alison.js');
const H=require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/pg_harness.js');
const fs=require('fs'),vm=require('vm'),path=require('path');
const ld=f=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(/^const (HONOR|GRADES)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
ld('src/honor3d.js'); ld('src/grades3d.js');
// careerLean：自習時數只進 B（研究），不鎖東西
for(const st of [0,30,100]){ const G=H.fresh('2029-03-01',10,'dorm'); G.flags.STUDY_AT_LAW=0; G.stats.study=st; console.log('stats.study='+st+' careerLean=',JSON.stringify(STORY.careerLean(G))); }
// 芷若成績出來那段：Café 讀書次數 0 vs 5
(async()=>{ for(const n of [0,5]){ const G=H.fresh('2026-02-10',15,'cafe'); G.flags.GR_STUDY={Y1S1:{cafe:n}}; H.said=[]; await GRADES.FACE.heroine_02(H.GM,{name:'芷若'},G,'Y1S1','mid'); console.log('Café 讀書 '+n+' 次 → 芷若：'+H.said.map(s=>s.t).join(' ／ ')); }
 process.exit(0); })();

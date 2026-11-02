const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js');
const G=H.fresh('2029-02-03',8,'campus',{Y4_PATH:'grad',GRAD_EXAM_2029:true});
const fs=require('fs'),vm=require('vm');
for(const f of ['src/r2y4a3d.js','src/r2y4b3d.js']){ let src=fs.readFileSync(LW+'/'+f,'utf8'); src=src.replace(/^const (R2Y4[AB])\s*=/m,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ console.log('load',f,e.message); } }
const DK=k=>STORY.dayOfKey(k); const a=DK('2028-09-04');
function test(name,setup){ const g=JSON.parse(JSON.stringify(G)); setup(g); delete g.flags.GRAD_EXAM_2029_PASS;
 console.log(name,'r2y4a.gradExamPass=',R2Y4A.gradExamPass(g),'r2y4b.gradPass2029=',R2Y4B.gradPass2029(g),'libA=',R2Y4A.libDays(g,a,DK('2029-02-02')),'libB=',R2Y4B.libDays(g,'2028-09-04','2029-02-02')); }
const days=n=>Array.from({length:n},(_,i)=>a+i*3);
test('0天',g=>{g.habits={};g.flags.R2Y4B_LIB=[];});
test('seat 24天',g=>{g.habits={'seat:library:x':{n:24,days:days(24)}};g.flags.R2Y4B_LIB=[];});
test('place 24天',g=>{g.habits={'place:library:x':{n:24,days:days(24)}};g.flags.R2Y4B_LIB=[];});
test('R2Y4B_LIB 24天',g=>{g.habits={};g.flags.R2Y4B_LIB=days(24);});

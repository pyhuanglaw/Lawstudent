require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/alison.js');
const H=require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/pg_harness.js');
let G=H.fresh('2030-10-01',9,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:18,BAR_YEAR:2029});
G.vac={reg:{'C08@2027':'done','C11@2028':'done'}};
console.log('寒暑假語言課兩次 BAR_YEAR=2029 lean',JSON.stringify(STORY.careerLean(G)),'path',PG.path(G));
const L=POSTGRAD_LINES; console.log('FIRST.me.C =',L.FIRST.me.C); console.log('EPI last.C =',(L.EPI&&L.EPI.last&&L.EPI.last.C)||'(n/a)');

const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js'); const GM=H.GM;
const grad=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
(async()=>{
  // E1：報了名、8/4 一試的場景整段錯過（例：在家一直按「休息」）
  { const G=H.fresh('2029-08-04',7,'dorm',{BAR_REG:true,LAWCLUB_SAT_VISITS:10}); grad(G); PHONE.join(G,'noodle_team','桌遊團');
    H.at('2029-08-05',7); PG.pending(G); const d=PG.rec(G).done;
    console.log('E1 exam_2029 done=',d.exam_2029,'BAR_SIT_2029=',G.flags.BAR_SIT_2029,'sits2029=',PG.sits(G,2029),'retaker=',PG.retaker(G),'sits2030=',PG.sits(G,2030));
    H.at('2029-09-07',16); H.tick(); console.log('E1 9/7 群組 msgs:',JSON.stringify(H.msgs('g:noodle_team')),'r1 due?',!!PG.due(G));
    G.flags.FIRST_DAY_SEEN=true; console.log('E1 path at end:',PG.path(G),'| no retake step for 2030:',!PG.STEPS.filter(s=>/_2030$/.test(s.id)&&s.id.startsWith('exam')).some(s=>s.cond(G))); }
  // E2：二試考完、12/14 放榜的場景錯過（48 小時內沒空下來）
  { const G=H.fresh('2029-12-14',14,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer',LAWCLUB_SAT_VISITS:10}); grad(G); const r=PG.rec(G); r.done.exam_2029=1; r.done.r1_2029=1; r.done.e2a_2029=1; r.done.e2b_2029=1;
    H.at('2029-12-16',16); PG.pending(G); console.log('E2 r2_2029 done=',r.done.r2_2029,'BAR_YEAR=',G.flags.BAR_YEAR,'path=',PG.path(G),'firstDay me line=',POSTGRAD_LINES.FIRST.me[PG.path(G)]); }
  // E3：BAR_REG 沒問到（5/10 那一場錯過）＝沒報名？
  { const G=H.fresh('2029-05-10',20,'dorm',{}); H.at('2029-05-12',1); PG.pending(G); console.log('E3 reg done=',PG.rec(G).done.reg,'BAR_REG=',G.flags.BAR_REG,'sits2029=',PG.sits(G,2029)); }
  // E4：Y4_PATH bar 沒被問、5/10 21:00 自動報名
  { const G=H.fresh('2029-05-10',21.1,'dorm',{Y4_PATH:'bar'}); PG.rules(GM); console.log('E4 Y4_PATH bar → BAR_REG=',G.flags.BAR_REG,'reg step cond=',PG.byId('reg').cond(G)); }
  // E5：司法官二試未錄取以後，有沒有任何 2030 再考司法官的入口
  { const G=H.fresh('2029-12-15',10,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:18,BAR_STAGE_2029:'both',BAR_YEAR:2029}); grad(G);
    const st2030=PG.STEPS.filter(s=>/2030/.test(s.id)).map(s=>{ let c=false; try{ c=!!s.cond(G); }catch(e){} return s.id+':'+c; });
    console.log('E5 sits2030=',PG.sits(G,2030),'retaker=',PG.retaker(G),'2030 steps cond:',st2030.join(' ')); }
  // E6：2030 舊序章 0 題也錄取律師
  console.log('E6 tier(2030,0)=',PG.tier(2030,0),'tier(2029,11)=',PG.tier(2029,11));
  // E7：S.path 六種＋judge
  { const P=(f)=>{ const G=H.fresh('2034-06-03',18,'dorm',f); grad(G); return PG.path(G); };
    console.log('E7 paths: A_bar',P({LAWCLUB_SAT_VISITS:5,BAR_YEAR:2029}),'| A_none',P({LAWCLUB_SAT_VISITS:5}),'| B_grad',P({Y4_PATH:'grad',GRAD_ADMIT:'push'}),'| B_quit',P({Y4_PATH:'grad'}),'| B with bar but not grad',P({BAR_YEAR:2029}),'| grad admitted + lawyer',P({Y4_PATH:'grad',GRAD_ADMIT:'exam',BAR_YEAR:2029}));
    console.log('E7 EPI.last keys',Object.keys(POSTGRAD_LINES.EPI.last).join(','),'FIRST.me keys',Object.keys(POSTGRAD_LINES.FIRST.me).join(',')); }
  process.exit(0);
})().catch(e=>{ console.log('EXC',e&&e.stack); process.exit(1); });

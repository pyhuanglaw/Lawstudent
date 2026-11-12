// BB 基準盤點（修改前）：國考六條路線＋職涯結局，用遊戲自己的「跳到下一件事」從 2029-06-02 一路跑到尾聲。不改任何遊戲檔。
const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js');
const GM=H.GM; GM.spawnCharacter=()=>null;
{ const fs=require('fs'), vm=require('vm'), path=require('path'); global.CG_REGISTRY=global.CG_REGISTRY||{};
  const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|FD|MSG|MSG_POOL|MSG2_POOL|ZRUK)$/;
  const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
  for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
  console.log('extra modules loaded: R2Y4B',typeof R2Y4B,'FD',typeof FD,'Y5',typeof Y5); }
const warns=[]; console.warn=(...a)=>warns.push(a.map(String).join(' '));
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
const FRIENDS=['zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan','classmate_peishan','npc_fangyt','heroine_01','heroine_03','heroine_05'];
const y4=async GM=>{ const G=GM.G; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return null;
  if(STORY.packDue(G)){ await STORY.packY4(GM); return 'pack'; } if(STORY.gradMorningDue(G)){ await STORY.gradFamily(GM); return 'family'; } if(STORY.gradLunchDue(G)){ await STORY.gradLunch(GM); return 'lunch'; }
  if(G.zone==='dorm'&&STORY.gradEnvelopeDue(G)){ await STORY.gradEnvelope(GM); return 'envelope'; } if(STORY.moveOutDue(G)){ await STORY.moveOutY4(GM); return 'moveout'; } return null; };
const sim=async(name,flags,setup,sc)=>{ sc=sc||{}; const G=H.fresh('2029-06-02',8,'dorm',Object.assign({PACKED_Y4:PG.gradDay()-1},flags)); FRIENDS.forEach(H.FRIEND); if(setup) setup(G);
  PHONE.join(G,'noodle_team','桌遊團'); PHONE.join(G,'home','家人'); warns.length=0;
  const order=[]; let it=0, err=null, stuck=null; const allSaid=[]; const orun=PG.runStep;
  PG.runStep=async function(GM,s){ const r=await orun.call(PG,GM,s); if(r) order.push(s.id); return r; };
  const osay=GM.say; GM.say=async(w,t)=>{ allSaid.push(String(t)); return osay(w,t); };
  try{ for(it=0; it<150&&!G.flags.EPILOGUE_DONE; it++){
      for(const y of [2029,2030]){ const ex=PG.byId('exam_'+y), ns=PG.nextStop(G); if(sc[y]!=null&&!PG.done(G,'exam_'+y)&&ex.cond(G)&&(PG.due(G)===ex||(ns!=null&&Math.abs(ns-ex.at(G))<1e-6))) H.picks=answerK(PG.draw(G,y),sc[y]); }
      const y=await y4(GM); if(y){ order.push('y4:'+y); continue; }
      if(OUT.due(G)){ H.picks=[0]; await OUT.tick(GM); continue; }
      const s=PG.due(G); if(s){ await PG.runStep(GM,s); continue; }
      if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)){ if(!await PG.sleepJump(GM)){ await HOME.sleep(GM); } continue; }
      if(!await PG.advance(GM)){ stuck=PG.dateLabel(G.day,G.hour); break; } }
  }catch(e){ err=e; } finally { PG.runStep=orun; GM.say=osay; }
  const F=G.flags, pick=k=>F[k]===undefined?'-':JSON.stringify(F[k]);
  const lw=Object.keys(F).filter(k=>/^(BAR_REG|BAR_REG_2030|BAR_SIT_\d+|BAR_SCORE_\d+|BAR_STAGE_\d+|BAR_YEAR|Y4_PATH|RETAKE_STYLE|GRAD_ADMIT|FAIL_DELAY|EPILOGUE_DONE|FIRST_DAY_SEEN)$/.test(k)).map(k=>k+'='+pick(k)).join(' ');
  const judgeFlags=Object.keys(F).filter(k=>/JUDGE|PROSEC|司法/.test(k));
  const lean=PG.lean(G);
  console.log('\n=== '+name);
  console.log('  iterations',it,'stuck',stuck,'err',err&&err.stack&&err.stack.split('\n')[0],'warns',warns.length);
  console.log('  order:',order.filter(x=>/^(exam|r1|e2|r2|first|epi|r2y4b_rt|r2y4b_retake|r2y4b_y5|late_|reg|fd_)/.test(x)).join(' → '));
  console.log('  flags:',lw,'| judge-like flags:',JSON.stringify(judgeFlags));
  console.log('  lean',JSON.stringify(lean),'path',PG.path(G));
  const sys=allSaid.filter(t=>/一試：|二試：|職前訓練|司法官|明年|再考|重考/.test(t)); console.log('  system/related lines:',JSON.stringify([...new Set(sys)]));
  const fd=(G.msgs||[]).filter(m=>m.tag==='pg_first_day'&&m.from==='player').map(m=>m.text); console.log('  first-day photo:',JSON.stringify(fd));
  const last=Object.values(POSTGRAD_LINES.EPI.last).find(t=>allSaid.includes(t)); console.log('  epilogue last line:',last);
  const kai=Object.entries(POSTGRAD_LINES.EPI.kai).find(([k,v])=>v.every(t=>allSaid.includes(t))); console.log('  kai epi key:',kai&&kai[0]);
  const choices=H.opts.filter(o=>o.some(t=>/重考|再考|司法官|不考了|律師/.test(t))); console.log('  choices mentioning retake/judge/lawyer:',JSON.stringify(choices.map(o=>[...o])));
  return G; };
(async()=>{
  const A={LAWCLUB_SAT_VISITS:10};
  const noFail=G=>{ const R=CLS.rec(G); R.grades=R.grades||{}; R.grades.Y4S2=R.grades.Y4S2||{}; };   /* [前置] 大四下成績單已發、沒有被當（FAIL_DELAY_COURSES:[]）*/
  await sim('X3 (+r2y4b/FD) 2029 一試 5 題 → 2030 重考 5 題（落點 A）',Object.assign({BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},A),noFail,{2029:5,2030:5});
  await sim('X5 (+r2y4b/FD) 2029 一試 5 題 → 2030 重考 18 題',Object.assign({BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},A),noFail,{2029:5,2030:18});
  await sim('X2 (+r2y4b/FD) 2029 17 題（律師＋司法官二試未錄取）',Object.assign({BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},A),noFail,{2029:17});
  if(0) await sim('X9 (+r2y4b/FD) 被當延畢、2030 報名 18 題',Object.assign({BAR_REG:false,FAIL_DELAY:true,FAIL_DELAY_COURSES:['maritime'],BAR_REG_2030:true},A),null,{2030:18});
  process.exit(0);
})().catch(e=>{ console.log('EXC',e&&e.stack); process.exit(1); });

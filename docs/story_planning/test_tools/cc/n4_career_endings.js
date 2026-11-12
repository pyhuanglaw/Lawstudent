// CC N4：六條職涯結局的條件表＋極端存檔實跑（唯讀；不改任何遊戲檔、不開瀏覽器）。
// 用法：node n4_career_endings.js [工作樹路徑]
//   工作樹預設＝環境變數 LW，或 /tmp/.../scratchpad/wt_mk（開發分支 checkout，唯讀）。
// 做法：
//   Part 1 極端存檔：用 tests/pg_harness.js 載入遊戲系統，另外載 r2y4a/r2y4b/faildelay/y5s1/noodle_closed。
//     每份存檔先用遊戲自己的函式算「大四以前」的結果（STORY.careerLean、R2Y4A.pushLevel/letter/pushPass/gradExamPass、R2Y4B.gradPass2029），
//     把推甄／研究所筆試的結果寫成旗標（=【前置】），再從 2029-06-02 08:00 用遊戲的「跳到下一件事」（PG.due/PG.runStep/PG.advance/OUT.tick）
//     一路推進到尾聲（照 baseline_1102/routes3.js 的 sim），國考照指定題數作答。記錄 path、第一份工作照片、尾聲最後一句。
//   Part 2 窮舉：BAR_SCORE_2029 0～20 × 2030 舊序章考試 0/20 × 傾向 A/B/C × 研究所（未報／錄取／落榜）× 子晴線 × 延畢 → 直接呼叫 PG.stage/PG.tier/PG.path，檢查不變量。
const path=require('path');
const LW=path.resolve(process.argv[2]||process.env.LW||'/tmp/claude-0/-home-user-Lawstudent/d06332e2-ec70-5e42-a15c-5a4b27dbdb56/scratchpad/wt_mk');
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js');
const GM=H.GM; GM.spawnCharacter=()=>null;
{ const fs=require('fs'), vm=require('vm'); global.CG_REGISTRY=global.CG_REGISTRY||{};
  const NAMES=/^(NOODLE_CLOSED|R2Y4A|R2Y4A_EVENTS|R2Y4B|R2Y4B_EVENTS|Y5|FD|MSG|MSG_POOL|MSG2_POOL|ZRUK)$/;
  const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
  for(const f of ['src/noodle_closed3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f); }
const warns=[]; console.warn=(...a)=>warns.push(a.map(String).join(' '));
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
const FRIENDS=['zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan','classmate_peishan','npc_fangyt','heroine_01','heroine_03','heroine_05'];
const y4=async GM=>{ const G=GM.G; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return null;
  if(STORY.packDue(G)){ await STORY.packY4(GM); return 'pack'; } if(STORY.gradMorningDue(G)){ await STORY.gradFamily(GM); return 'family'; } if(STORY.gradLunchDue(G)){ await STORY.gradLunch(GM); return 'lunch'; }
  if(G.zone==='dorm'&&STORY.gradEnvelopeDue(G)){ await STORY.gradEnvelope(GM); return 'envelope'; } if(STORY.moveOutDue(G)){ await STORY.moveOutY4(GM); return 'moveout'; } return null; };
/* ---- 在校紀錄（極端存檔的輸入）---- */
const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'];
function school(G,o){ const R=CLS.rec(G); R.exam=R.exam||{}; if(o.finals!=null) for(const t of TERMS) for(const c of ['civil','crim','const']) R.exam[t+':'+c+':final']={status:'done',correct:o.finals};
  G.stats=G.stats||{}; G.stats.study=o.study||0; G.stats.classes=o.classes||0; G.flags.STUDY_AT_LAW=0;
  if(o.lawclub) G.flags.LAWCLUB_SAT_VISITS=o.lawclub;
  if(o.vacC) { G.vac=G.vac||{}; G.vac.reg=G.vac.reg||{}; for(let i=0;i<o.vacC;i++) G.vac.reg['C08@'+(2026+i)]='done'; }
  if(o.libDays){ G.habits=G.habits||{}; const a=PG.DK('2028-09-04'); G.habits['place:library:day']={n:o.libDays,days:Array.from({length:o.libDays},(_,i)=>a+i*3)}; }
  if(o.prof){ G.social=G.social||{}; G.social.prof=G.social.prof||{}; G.social.prof.prof_x={part:10,perf:10,office:2,research:2}; }
  if(o.date) H.date(o.date);
}
/* 大四以前的研究所結果：用遊戲自己的函式算，寫成旗標（【前置】）*/
function preGrad(G){ const F=G.flags, o={}; o.lean=STORY.careerLean(G); o.pushLevel=R2Y4A.pushLevel(G); o.letter=R2Y4A.letter(G); o.pushPass=R2Y4A.pushPass(G); o.examPass2029=R2Y4A.gradExamPass(G);
  if(F.Y4_PATH==='grad'&&R2Y4A.pushOn(G)){ F.Y4_PUSH=o.pushPass?'pass':'fail'; if(o.pushPass) F.GRAD_ADMIT='push'; else { F.GRAD_EXAM_2029=true; F.GRAD_EXAM_2029_PASS=o.examPass2029; F.GRAD_EXAM_RESULT=o.examPass2029?'pass':'fail'; if(o.examPass2029) F.GRAD_ADMIT='exam'; else F.GRAD_QUIT=true; } }
  return o; }
async function sim(name,flags,sch,sc){ sc=sc||{}; const G=H.fresh('2029-06-02',8,'dorm',Object.assign({PACKED_Y4:PG.gradDay()-1},flags)); FRIENDS.forEach(H.FRIEND);
  if(sch.zq){ H.FRIEND('heroine_04'); G.flags.ZQ_CONTRACT='lawyer'; }
  school(G,sch); const R=CLS.rec(G); R.grades=R.grades||{}; R.grades.Y4S2=R.grades.Y4S2||{};
  const pre=preGrad(G);
  PHONE.join(G,'noodle_team','桌遊團'); PHONE.join(G,'home','家人'); warns.length=0;
  const order=[]; let it=0, err=null, stuck=null; const allSaid=[]; const orun=PG.runStep;
  PG.runStep=async function(GM,s){ const r=await orun.call(PG,GM,s); if(r) order.push(s.id); return r; };
  const osay=GM.say; GM.say=async(w,t)=>{ allSaid.push(String(t)); return osay(w,t); };
  try{ for(it=0; it<200&&!G.flags.EPILOGUE_DONE; it++){
      for(const y of [2029,2030]){ const ex=PG.byId('exam_'+y), ns=PG.nextStop(G); if(!PG.done(G,'exam_'+y)&&ex.cond(G)&&(PG.due(G)===ex||(ns!=null&&Math.abs(ns-ex.at(G))<1e-6))){ if(sc[y]==='miss'){ /* 錯過：一試窗口內一直不空閒 */ PG.rec(G).done['exam_'+y]='missed'; continue; } H.picks=answerK(PG.draw(G,y),sc[y]==null?10:sc[y]); } }
      const y=await y4(GM); if(y){ order.push('y4:'+y); continue; }
      if(OUT.due(G)){ H.picks=[0]; await OUT.tick(GM); continue; }
      const s=PG.due(G); if(s){ await PG.runStep(GM,s); continue; }
      if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)){ if(!await PG.sleepJump(GM)){ await HOME.sleep(GM); } continue; }
      if(!await PG.advance(GM)){ stuck=PG.dateLabel(G.day,G.hour); break; } }
  }catch(e){ err=e; } finally { PG.runStep=orun; GM.say=osay; }
  const F=G.flags, lean=PG.lean(G);
  const fd=(G.msgs||[]).filter(m=>m.tag==='pg_first_day'&&m.from==='player').map(m=>m.text)[0]||'-';
  const last=Object.entries(POSTGRAD_LINES.EPI.last).find(([k,t])=>allSaid.includes(t));
  const res={name,pre:{lean:pre.lean,pushLevel:pre.pushLevel,letter:pre.letter,pushPass:pre.pushPass,examPass2029:pre.examPass2029},
    end:{lean,path:PG.path(G),epiKey:last&&last[0],epiLine:last&&last[1],firstPhoto:fd},
    flags:Object.fromEntries(Object.keys(F).filter(k=>/^(BAR_REG|BAR_REG_2030|BAR_SIT_\d+|BAR_SCORE_\d+|BAR_STAGE_\d+|BAR_YEAR|Y4_PATH|Y4_PUSH|RETAKE_STYLE|GRAD_ADMIT|GRAD_EXAM_RESULT|FAIL_DELAY|EXCHANGE_ROUTE|EPILOGUE_DONE|FIRST_DAY_SEEN)$/.test(k)||/JUDGE/.test(k)).map(k=>[k,F[k]])),
    order:order.filter(x=>/^(reg|exam|r1|e2b|r2_|first|epi)/.test(x)), done:F.EPILOGUE_DONE===true, it, stuck, err:err&&String(err.stack).split('\n')[0],
    judgeNo:allSaid.includes(POSTGRAD_LINES.R2.judgeNo), warns:warns.length};
  console.log('\n=== '+name); console.log(JSON.stringify(res,null,1)); return res; }
const SAVES=[
  ['S01 全部答對（期末 5/5、國考 20/20、Y4_PATH bar）',{BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:5,study:300,classes:400},{2029:20}],
  ['S02 全部答錯、沒被當（期末 0/5、國考 2029 0 題 → 2030 0 題）',{BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:0,study:0,classes:400},{2029:0,2030:0}],
  ['S03 全部答錯＋2030 一試錯過',{BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:0,study:0,classes:400},{2029:0,2030:'miss'}],
  ['S04 只上課不讀書（期末 2/5、自習 0、國考 8 → 重考 8）',{BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:2,study:0,classes:600},{2029:8,2030:8}],
  ['S05 只約會（和以安交往、自習 0、法服 0、沒報國考 Y4_PATH other）',{BAR_REG:false,Y4_PATH:'other',FAIL_DELAY_COURSES:[]},{finals:1,study:0,classes:100,date:'heroine_01'},{}],
  ['S06 只約會但報了國考、國考 0 題 → 2030 0 題',{BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:1,study:0,classes:100,date:'heroine_01'},{2029:0,2030:0}],
  ['S07 只自習（自習 3000h、期末 5/5、Y4_PATH bar、國考 20）',{BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:5,study:3000,classes:100,libDays:120},{2029:20}],
  ['S08 只自習但國考 12 題（剛好律師）',{BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:5,study:3000,libDays:120},{2029:12}],
  ['S09 法服常去（LAWCLUB 200）、國考 3 → 2030 0',{BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:2,study:0,lawclub:200},{2029:3,2030:0}],
  ['S10 法服常去、國考 20（both）',{BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:5,study:0,lawclub:200},{2029:20}],
  ['S11 研究所路線：推甄上（期末 5/5＋推薦信）、沒報國考',{BAR_REG:false,Y4_PATH:'grad',FAIL_DELAY_COURSES:[]},{finals:5,study:600,prof:true},{}],
  ['S12 研究所路線：推甄、筆試都沒上（期末 1/5、總圖 0 天）＋報國考 20',{BAR_REG:true,Y4_PATH:'grad',FAIL_DELAY_COURSES:[]},{finals:1,study:600},{2029:20}],
  ['S13 研究所＋國考都上（推甄上＋國考 20）',{BAR_REG:true,Y4_PATH:'grad',FAIL_DELAY_COURSES:[]},{finals:5,study:600,prof:true},{2029:20}],
  ['S14 出國路線（JP 交換延畢）、2030 報名、國考 0 題',{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:3,study:50},{2030:0}],
  ['S15 出國路線（US）、2030 報名、國考 20 題',{EXCHANGE_ROUTE:'US',BAR_REG_2030:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:5,study:50},{2030:20}],
  ['S16 傾向 C（暑期 C08×3）＋國考 20、沒有子晴線',{BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:5,vacC:3},{2029:20}],
  ['S17 傾向 C＋子晴線（FRIEND、ZQ_CONTRACT）＋國考 14',{BAR_REG:true,Y4_PATH:'bar',FAIL_DELAY_COURSES:[]},{finals:4,vacC:3,zq:true},{2029:14}],
  ['S18 傾向 C＋子晴線、沒報國考',{BAR_REG:false,Y4_PATH:'other',FAIL_DELAY_COURSES:[]},{finals:4,vacC:3,zq:true},{}],
];
(async()=>{
  const only=process.env.ONLY?new RegExp(process.env.ONLY):null; const out=[];
  for(const [n,f,s,sc] of SAVES){ if(only&&!only.test(n)) continue; out.push(await sim(n,f,s,sc)); }
  console.log('\n##### 摘要表'); for(const r of out) console.log([r.name,'path='+r.end.path,'top='+r.end.lean.top+'(A'+r.end.lean.A+' B'+r.end.lean.B+' C'+r.end.lean.C+')','BAR_YEAR='+r.flags.BAR_YEAR,'stage29='+r.flags.BAR_STAGE_2029,'stage30='+r.flags.BAR_STAGE_2030,'score='+r.flags.BAR_SCORE_2029+'/'+r.flags.BAR_SCORE_2030,'GRAD_ADMIT='+r.flags.GRAD_ADMIT,'judgeNo='+r.judgeNo,'epi='+r.end.epiKey,'done='+r.done,'stuck='+r.stuck,'err='+r.err,'photo='+r.end.firstPhoto].join(' | '));
  /* ---- Part 2 窮舉（直接呼叫判定函式）---- */
  if(!process.env.NO_ENUM){ console.log('\n##### Part 2 窮舉'); const bad={}; let n=0; const pathsSeen={};
    const leanStub=c=>{ STORY.careerLean=()=>c; };
    const orig=STORY.careerLean;
    const LEANS={A:{A:5,B:0,C:0,top:'A'},B:{A:0,B:5,C:0,top:'B'},C:{A:0,B:0,C:5,top:'C'},Bc:{A:0,B:5,C:3,top:'B'}};
    for(const ln in LEANS) for(const grad of ['none','admit','fail']) for(const zq of [false,true]) for(const dly of [false,true]) for(let k=-1;k<=20;k++) for(const k2 of [null,0,20]){
      const G=H.fresh('2030-12-20',12,'dorm',{FAIL_DELAY_COURSES:[]}); if(zq){ H.FRIEND('heroine_04'); G.flags.ZQ_CONTRACT='lawyer'; } leanStub(LEANS[ln]);
      const F=G.flags; if(grad!=='none'){ F.Y4_PATH='grad'; if(grad==='admit') F.GRAD_ADMIT='exam'; else { F.GRAD_EXAM_RESULT='fail'; F.GRAD_QUIT=true; } }
      if(dly){ F.EXCHANGE_ROUTE='JP'; }
      // 照 PG 的規則推出國考旗標：k=-1＝沒報名
      if(!dly){ if(k>=0){ F.BAR_REG=true; F.BAR_SIT_2029=true; F.BAR_SCORE_2029=k; F.BAR_STAGE_2029=PG.tier(2029,k); if(PG.stage2(G,2029)) F.BAR_YEAR=2029; else if(k2!=null&&PG.sits(G,2030)){ F.BAR_SIT_2030=true; F.BAR_SCORE_2030=k2; F.BAR_STAGE_2030=PG.tier(2030,k2); if(PG.stage2(G,2030)) F.BAR_YEAR=2030; } } else F.BAR_REG=false; }
      else { if(k>=0){ F.BAR_REG_2030=true; F.BAR_SIT_2030=true; F.BAR_SCORE_2030=k; F.BAR_STAGE_2030=PG.tier(2030,k); if(PG.stage2(G,2030)) F.BAR_YEAR=2030; } else F.BAR_REG_2030=false; }
      const p=PG.path(G); n++; pathsSeen[p]=(pathsSeen[p]||0)+1;
      const lic=F.BAR_YEAR!=null, tag=(t)=>{ (bad[t]=bad[t]||[]).push([ln,grad,zq?'zq':'-',dly?'dly':'-',k,k2,p].join('/')); };
      if(lic&&!['A_bar','C_zq','B_grad','L_firm','J_judge','J_pros'].includes(p)) tag('有律師資格卻不是律師家族結局（D118 路線(a)）');
      if(!lic&&p==='A_bar') tag('沒有律師資格卻是 A_bar');
      if(dly&&k>=0&&k<12&&lic) tag('2030 不到 12 題也錄取律師（tier 2030 一律 lawyer）');
      if(!dly&&k>=0&&k<12&&k2===0&&lic) tag('舊序章考試 0 題也錄取律師');
      if((F.BAR_STAGE_2029==='both'||F.BAR_STAGE_2030==='both')){
        if(typeof PG.judgeVerdict!=='function'){ tag('both（司法官二試資格）→ 司法官一律未錄取，沒有 J 結局'); }   /* 舊版（沒有 judgeVerdict）：照舊記錄，當對照 */
        else {   /* LAWWW 改版（D118-B8 以後，BB 11:09）：both 而且舊序章考試二試答對 10 題＝走得到 J 結局才算通過；另加反向：舊序章考試只答對 4 題不能是 J */
          const keep=JSON.stringify(F), y=F.BAR_STAGE_2029==='both'?2029:2030;
          /* 5ce715c51（AA_582 補充二）起：畢業那一年一定沒上（gradYear），之後看題數；JUDGE_YEAR＝錄取那一年（考試的隔年）。
             舊規則（judgeSatBefore：第一次一定沒上）的版本照舊走「舊序章考試」那條 */
          const gy=typeof PG.gradYear==='function'?PG.gradYear(G):null, first=PG.judgeVerdict(G,y,10);
          F['JUDGE_SCORE2_'+y]=10; F['JUDGE_PASS_'+y]=first; let ok;
          if(gy!=null&&y>gy){ ok=first; if(ok) F.JUDGE_YEAR=y+1; }
          else { if(first!==false) tag('both 畢業那一年（或舊版第一次）卻判錄取'); F.JUDGE_RETAKE=true; F.JUDGE_RETAKE_Y=y+1; ok=PG.judgeVerdict(G,y+1,10); if(ok) F.JUDGE_YEAR=gy!=null?y+2:y+1; }
          const pj=PG.path(G);
          if(!ok||!/^J_/.test(pj)) tag('both（司法官二試資格）→ 司法官一律未錄取，沒有 J 結局');
          for(const k0 of Object.keys(F)) delete F[k0]; Object.assign(F,JSON.parse(keep));
          F['JUDGE_SCORE2_'+y]=4; F['JUDGE_PASS_'+y]=PG.judgeVerdict(G,y,4); F.JUDGE_RETAKE=true; F.JUDGE_RETAKE_Y=y+1;
          const lo=PG.judgeVerdict(G,y+1,4); if(lo){ F.JUDGE_YEAR=y+1; } const pl=PG.path(G);
          if(lo||/^J_/.test(pl)) tag('both＋低分 → 不該錄取（舊序章考試二試 4 題卻是 J 結局或判錄取）');
          for(const k0 of Object.keys(F)) delete F[k0]; Object.assign(F,JSON.parse(keep)); }
      }
      if(p==null||p==='undefined'||!POSTGRAD_LINES.EPI.last[p]||!POSTGRAD_LINES.FIRST.me[p]) tag('path 沒有對應台詞');
    }
    STORY.careerLean=orig;
    console.log('組合數',n,'path 分布',JSON.stringify(pathsSeen));
    for(const t in bad) console.log('[不變量違反] '+t+'：'+bad[t].length+' 組；例 '+bad[t].slice(0,4).join('  '));
  }
  process.exit(0);
})().catch(e=>{ console.log('EXC',e&&e.stack); process.exit(1); });

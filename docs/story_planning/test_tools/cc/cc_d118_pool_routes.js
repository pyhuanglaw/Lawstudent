#!/usr/bin/env node
/* CC-C（帳號 C）11-04：D118_B7 的 Node 那一支（BB-C 23:46）——法律系四年三種路線（臺灣、日本、美國），一試的題池分別收了哪幾科。只列、不判（判定歸 BB）。
   做法：照 tests/d118_b7_unit.js 的 transcripts（每一學期、不在國外的，期末考照 CLS.drawExam 抽、成績單照 CLS.reportFor 發＝和遊戲裡學期結束一樣），
     臺灣＝2029-07-10（BAR_REG）、日本＝2030-07-10（EXCHANGE_ROUTE JP、BAR_REG_2030）、美國＝2030-07-10（EXCHANGE_ROUTE US、BAR_REG_2030）；
     列 CLS.takenCourses、PG.poolFor 每一科幾題、一試不考的（PG.POOL_EXCLUDE_COURSES）、哪幾學期人在國外（CLS.termAway）、那一年的 20 題來自哪幾科。
   美國路線大五上補修的強制執行法（enforcement）、法律倫理（legal_ethics）：BB-C 判「有上課內容就算修過」，LAWWW-C 改好以後再驗——這一輪照實記。
   【前置／捷徑】pg_harness 的假 GM；成績單照遊戲自己的函式發（不是玩一遍）。
   用法：LW_ROOT=<checkout> [SHA=…] node cc_d118_pool_routes.js */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.env.LW_ROOT||path.join(__dirname,'..','..','..','..'));
const H=require(path.join(ROOT,'tests','pg_harness.js'));
const {GM}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/jp3d.js']) load(f);
GM.addNote=()=>true; GM.caption=()=>{}; GM.toast=()=>{};
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
const wrongOf=q=>q.type==='tf'||!q.options?(q.answer==='對'?'錯':'對'):Object.keys(q.options).find(k=>String(k)!==String(q.answer));
const transcripts=G=>{ const R=CLS.rec(G); R.exam=R.exam||{}; const away=[];
  for(const t of CLS.LAW_TERMS){ if(CLS.termAway(G,t)){ away.push(t); continue; }
    for(const c of CLS.termCourses(G,t)){ if(!CLS.isExamCourse(c)) continue; const r=CLS.drawExam(G,c.id,t,'final'); if(!r.ok) continue;
      R.exam[r.key]={qs:r.qs.map(q=>q.id),ans:r.qs.map((q,i)=>i<3?q.answer:wrongOf(q)),correct:3,score:CLS.scoreOf(3),status:'done'}; }
    R.grades[t]=CLS.reportFor(G,t); }
  return away; };
const nm=id=>{ const c=(COURSES.list||[]).find(x=>x.id===id); return c?(c.name||c.title||id):id; };
const ROUTES=[['臺灣','2029-07-10',{BAR_REG:true},2029],['日本','2030-07-10',{EXCHANGE_ROUTE:'JP',BAR_REG:false,BAR_REG_2030:true},2030],['美國','2030-07-10',{EXCHANGE_ROUTE:'US',BAR_REG:false,BAR_REG_2030:true},2030]];
const out={sha:process.env.SHA||'?',exclude:PG.POOL_EXCLUDE_COURSES||null,routes:{}};
console.log('cc_d118_pool_routes　LW_ROOT='+ROOT+'　SHA='+out.sha);
for(const [label,key,flags,yr] of ROUTES){
  const G=H.fresh(key,10,'library_b1',Object.assign({examSeed:4242},flags)); graduated(G); G.stats={classes:0,study:0};
  const away=transcripts(G), tk=CLS.takenCourses(G).map(c=>c.id), pool=PG.poolFor(G)||[], byC={};
  for(const q of pool){ const k=q.course||'(QBANK 刑訴)'; byC[k]=(byC[k]||0)+1; }
  const qs=PG.draw(G,yr), drawn={}; for(const q of qs){ const k=q.course||'(QBANK 刑訴)'; drawn[k]=(drawn[k]||0)+1; }
  const r={away, taken:tk, poolN:pool.length, pool:byC, drawYear:yr, drawn, enforcement:{taken:tk.includes('enforcement'),inPool:!!byC.enforcement}, legal_ethics:{taken:tk.includes('legal_ethics'),inPool:!!byC.legal_ethics}};
  out.routes[label]=r;
  console.log('\n===== '+label+'（'+key+'，'+yr+' 一試）');
  console.log('人在國外的學期：'+J(away));
  console.log('修過的課（CLS.takenCourses，'+tk.length+' 門）：'+tk.map(id=>id+' '+nm(id)).join('、'));
  console.log('一試題池（PG.poolFor）'+pool.length+' 題：'+Object.entries(byC).map(([k,n])=>k+(k.startsWith('(')?'':' '+nm(k))+' '+n).join('、'));
  console.log(yr+' 一試抽到的 20 題來自：'+J(drawn));
  console.log('強制執行法 enforcement：修過 '+r.enforcement.taken+'、在題池 '+r.enforcement.inPool+'；法律倫理 legal_ethics：修過 '+r.legal_ethics.taken+'、在題池 '+r.legal_ethics.inPool+(label==='美國'?'（BB-C：大五上補修「有上課內容就算修過」，LAWWW-C 改好以後再驗；這一輪照實記）':''));
}
const all=new Set([].concat(...Object.values(out.routes).map(r=>Object.keys(r.pool))));
console.log('\n===== 三條路線比較（題池裡每一科：臺灣／日本／美國 幾題）');
for(const k of [...all].sort()) console.log(k+(k.startsWith('(')?'':' '+nm(k))+'：'+ROUTES.map(([l])=>out.routes[l].pool[k]||0).join('／'));
console.log('一試不考、不收的科（PG.POOL_EXCLUDE_COURSES）：'+J(out.exclude));
if(process.env.OUT_JSON) fs.writeFileSync(process.env.OUT_JSON,J(out,null,1));
console.log('\nDONE（只列、不判）');

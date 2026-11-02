// CC #19（BB 10:48，D124 待實作）：大四下「海商法與海洋法」改選修——選了、故意被當：只記成績，不延畢、不排補考、國考報名照舊
// 用法：WT=<受測資料夾> node n19_maritime_elective.js     （現在的 head 應 FAIL；LAWWW 實作 D124 以後應 PASS）
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
GM.caption=()=>{}; GM.toast=()=>{};
(async()=>{
  const G=H.fresh('2029-06-18',9,'dorm',{BAR_REG:true,Y4_PATH:'bar',GRADUATED:PG.gradDay()}); PG.rec(G).done.grad=1; H.FRIEND('zhe');
  const R=CLS.rec(G); R.exam=R.exam||{};
  const tc=CLS.termCourses(G,'Y4S2'), mar=tc.find(c=>c.id==='maritime');
  const cdef=(typeof COURSES!=='undefined'&&COURSES.list?COURSES.list.find(c=>c.id==='maritime'):null)||{};
  console.log('海商法定義：kind='+cdef.kind+' group='+(cdef.group||cdef.grp||'')+' elective='+!!(cdef.elective||cdef.opt)+'；大四下課表有沒有它：'+!!mar+'；大四下課表 '+tc.map(c=>c.id).join(','));
  check('0. 前置：大四下課表裡有海商法（選了它）',!!mar,'【前置】若 D124 實作後要先選修，這裡要改成照選課流程選它');
  for(const c of tc){ if(!CLS.isExamCourse(c)) continue; const d=CLS.drawExam(G,c.id,'Y4S2','final'); R.exam['Y4S2:'+c.id+':final']={qs:d.qs.map(q=>q.id),ans:[],status:'done',correct:c.id==='maritime'?0:4,score:c.id==='maritime'?0:90}; }
  for(const c of tc) if(CLS.attCourse&&CLS.attCourse(c)) R.attend[c.id]=3;
  await CLS.showGrades(GM,'Y4S2'); PG.pending(G);
  const F=G.flags, gr=(R.grades||{}).Y4S2||{};
  console.log('結果：',J({grade:gr.maritime,FD_MAKEUP:F.FD_MAKEUP,FAIL_DELAY:F.FAIL_DELAY,FAIL_DELAY_COURSES:F.FAIL_DELAY_COURSES,BAR_REG:F.BAR_REG,failedIn:(CLS.failedIn(G,'Y4S2')||[]).map(c=>c.id)}));
  check('1. 成績單記海商法不及格（只記成績）',/不及格/.test(String(gr.maritime||'')),J(gr.maritime));
  check('2. 不排補考（沒有 FD_MAKEUP pending）',!(F.FD_MAKEUP&&F.FD_MAKEUP.status==='pending'),J(F.FD_MAKEUP));
  check('3. 不延畢（沒有 FAIL_DELAY、FAIL_DELAY_COURSES 不含 maritime）',!F.FAIL_DELAY&&!((F.FAIL_DELAY_COURSES||[]).includes('maritime')),J({FAIL_DELAY:F.FAIL_DELAY,C:F.FAIL_DELAY_COURSES}));
  check('4. 國考報名照舊（BAR_REG true）',F.BAR_REG===true,J(F.BAR_REG));
  /* 6/26 以後 */
  PG.setT(G,H.E,PG.DK('2029-06-29'),9); PG.pending(G); const s=PG.due(G); if(s) await PG.runStep(GM,s);
  check('5. 6/29 以後也沒有延畢（FAIL_DELAY 沒被補記）',!G.flags.FAIL_DELAY,J({FAIL_DELAY:G.flags.FAIL_DELAY,step:s&&s.id}));
  H.done();
})();

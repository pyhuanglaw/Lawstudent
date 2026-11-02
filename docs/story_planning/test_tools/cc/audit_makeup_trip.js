// CC（BB 09:25 插隊 ①）：自由出行 TRIP.wouldMiss 的「這一趟會錯過」要列 6/26 補考；附邊界：當天已有 3 件會錯過的事時補考會不會被 slice(0,3) 擠掉
// 用法：WT=<工作樹根目錄> node audit_makeup_trip.js
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
if(typeof TRIP==='undefined') load('src/freetrip3d.js');   /* index.html：freetrip3d 在 faildelay3d 之前（faildelay 載入時包 TRIP.wouldMiss）*/
for(const f of ['src/data/study_units.js','src/study3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
const D=k=>PG.DK(k);
GM.caption=()=>{}; GM.toast=()=>{};
const y4s2=(G)=>{ const R=CLS.rec(G); R.exam=R.exam||{}; let first=null;
  for(const c of CLS.termCourses(G,'Y4S2')){ if(!CLS.isExamCourse(c)) continue; if(!first) first=c; const d=CLS.drawExam(G,c.id,'Y4S2','final'); R.exam['Y4S2:'+c.id+':final']={qs:d.qs.map(q=>q.id),ans:[],status:'done',correct:3,score:80}; }
  Object.assign(R.exam['Y4S2:'+first.id+':final'],{correct:0,score:0}); return first; };
const planned=async()=>{ const G=H.fresh('2029-06-18',9,'dorm',{BAR_REG:true,Y4_PATH:'bar',GRADUATED:PG.gradDay()}); PG.rec(G).done.grad=1; H.FRIEND('zhe'); const c=y4s2(G); await CLS.showGrades(GM,'Y4S2'); return {G,c}; };
(async()=>{
  console.log('前置：TRIP 有包裝',typeof TRIP!=='undefined'&&!!TRIP._fdMiss||'(看 faildelay3d.js:185)');
  for(const [h,to,want,lab] of [[8.5,13,true,'F1. 6/26 08:30 自由出行到 13:00'],[9.75,12,true,'F2. 6/26 09:45 出行到 12:00'],[11.5,15,false,'F3. 6/26 11:30（補考已過）出行'],[6.5,9,false,'F4. 6/26 06:30 出行到 09:00（補考前回來）']]){
    const {G}=await planned(); PG.setT(G,H.E,D('2029-06-26'),h); G.zone='gongguan';
    const wm=TRIP.wouldMiss(G,to); check(lab+(want?' 應該':' 不該')+'列補考',wm.some(t=>/補考/.test(t))===want,J(wm)); }
  /* 邊界：同一天已有 3 件會錯過的事（3 個約好的見面）——補考在包裝裡是接在後面再 slice(0,3) */
  { const {G}=await planned(); PG.setT(G,H.E,D('2029-06-26'),8.5); G.zone='gongguan'; G.invites=G.invites||[];
    for(const [i,hh] of [[1,9],[2,9.5],[3,10]]) G.invites.push({id:'cc'+i,who:'zhe',place:'cafe',day:G.day,h:hh,state:'accepted',accepted:true,label:'約好的見面'+i});
    const wm=TRIP.wouldMiss(G,13); check('F5. 邊界：已有 3 件會錯過＋補考，補考仍要列出',wm.some(t=>/補考/.test(t)),J(wm)); }
  H.done();
})();

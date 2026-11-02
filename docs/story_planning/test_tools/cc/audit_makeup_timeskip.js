// CC 稽核（4174ffe89 以後）：補考 6/26 09:30～11:00 這一段，會跳時間的一般動作（3D 自習、在家休息）沒有「會錯過補考」的預告，跳過 11:00 就靜靜記成缺考＝延畢
// 用法：WT=<工作樹根目錄> node audit_makeup_timeskip.js
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
const D=k=>PG.DK(k);
GM.caption=()=>{}; GM.toast=()=>{};
const y4s2=(G)=>{ const R=CLS.rec(G); R.exam=R.exam||{}; let first=null;
  for(const c of CLS.termCourses(G,'Y4S2')){ if(!CLS.isExamCourse(c)) continue; if(!first) first=c; const d=CLS.drawExam(G,c.id,'Y4S2','final'); R.exam['Y4S2:'+c.id+':final']={qs:d.qs.map(q=>q.id),ans:[],status:'done',correct:3,score:80}; }
  Object.assign(R.exam['Y4S2:'+first.id+':final'],{correct:0,score:0}); return first; };
const planned=async()=>{ const G=H.fresh('2029-06-18',9,'dorm',{BAR_REG:true,Y4_PATH:'bar',GRADUATED:PG.gradDay()}); PG.rec(G).done.grad=1; H.FRIEND('zhe'); const c=y4s2(G); await CLS.showGrades(GM,'Y4S2'); return {G,c}; };
(async()=>{
  /* A：3D 世界，6/26 08:30 在總圖自習——選讀幾小時的選項 */
  { const {G}=await planned(); PG.setT(G,H.E,D('2029-06-26'),8.5); G.zone='library';
    const L=CLS.studyLengths(GM), fx=CLS.nextFixed(GM), sc=CLS.spanCheck(G,3);
    console.log('A0 前置：補考 pending',G.flags.FD_MAKEUP&&G.flags.FD_MAKEUP.status);
    console.log('A1 讀書選項',J(L.map(x=>[x.t,x.dim,x.hint])));
    console.log('A2 nextFixed',J(fx),' spanCheck(3h)',J(sc));
    check('A3. 6/26 08:30 在總圖「讀 3 小時」應該提示會錯過補考（或變灰）',L.some(x=>x.hours===3&&(x.dim||/補考/.test(x.hint))),J(L.find(x=>x.hours===3)));
    check('A4. 「讀到…前」應該有一項停在補考前',!!fx&&/補考/.test(fx.label||''),J(fx));
    GM.advance(3); PG.pending(G);   /* 讀完 3 小時：11:30 */
    console.log('A5 讀完 3 小時以後：',J({hour:G.hour,mk:G.flags.FD_MAKEUP.status,FAIL_DELAY:G.flags.FAIL_DELAY,BAR_REG:G.flags.BAR_REG,done:PG.rec(G).done.fd_makeup})); }
  /* B：在家（HOME.at），6/26 10:30 選「在家休息一下」 */
  { const {G}=await planned(); PG.setT(G,H.E,D('2029-06-26'),10.5); G.home=Object.assign(G.home||{},{at:true});
    const o=FD.homeMakeupOpt(G), wm=HOME.wouldMiss(G,G.hour+1);
    console.log('B0 前置：家裡選單有補考',!!o&&o.t);
    check('B1. 10:30 在家「休息一小時」的 R1 預告應該列補考',wm.some(t=>/補考/.test(t)),J(wm));
    GM.advance(1); PG.pending(G);
    console.log('B2 休息完：',J({hour:G.hour,mk:G.flags.FD_MAKEUP.status,FAIL_DELAY:G.flags.FAIL_DELAY,BAR_REG:G.flags.BAR_REG})); }
  /* D：跳過時間（座位「待到中午」、床上小睡＝CLS.skipTo）：停點有沒有補考（對照 postgrad3d.js:371 可昕電話有登記 CLS.STOP_FNS）*/
  { const {G}=await planned(); PG.setT(G,H.E,D('2029-06-26'),8.5); G.zone='library';
    const st=CLS.skipStops(GM,12);
    check('D1. 6/26 08:30 跳到 12:00 的停點應該有補考（09:30 或出發前）',st.some(a=>/補考/.test(a.why||'')),J(st));
    const ok=await CLS.skipTo(GM,12); PG.pending(G);
    console.log('D2 跳過以後：',J({skipTo:ok,hour:G.hour,mk:G.flags.FD_MAKEUP.status,FAIL_DELAY:G.flags.FAIL_DELAY,BAR_REG:G.flags.BAR_REG})); }
  /* E：補考沒去，但 PG.pending 第一次跑已經過了 6/28 24:00（fd_mk_missed 的 until）——旁白會不會被跳過（玩家路徑未確認，只看邏輯）*/
  { const {G}=await planned(); PG.setT(G,H.E,D('2029-06-29'),9); H.said=[]; const p=PG.pending(G); const s=PG.due(G); if(s) await PG.runStep(GM,s);
    console.log('E1 6/29 才第一次算：',J({mk:G.flags.FD_MAKEUP.status,said:G.flags.FD_MAKEUP.said||null,narrDone:PG.rec(G).done.fd_mk_missed,FAIL_DELAY:G.flags.FAIL_DELAY,due:s&&s.id,lines:H.lines()})); }
  /* C：對照——總複習（一鍵三小時）有擋 */
  { const {G}=await planned(); PG.setT(G,H.E,D('2029-06-26'),8.5); G.zone='library';
    console.log('C1 對照：總複習的 reviewCheck',J(STUDY.reviewCheck(G,{}))); }
  H.done();
})();

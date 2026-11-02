// AA_586（企劃線 080f81a45；BB_230 口氣審 PASS）：事務所工讀「上次沒去」——下一班開始時一句（x.office.miss）——不需要瀏覽器。
//   1. 一般日子真的沒去：JOBS.track 記 missPend，下一班（JOBS.runShiftX）開頭演 AA_586 的一句，之後 missPend 清掉、第二次換下一句
//   2. 考試那天自動請假（BUG-JOBS-OFFICE-EXAM-1102）：不算沒去，下一班不演 miss
// 修改前（int/next1102 8e813e58f 以前）：第 1 項 FAIL（事務所沒有 miss）。用法：node tests/office_miss_unit.js
'use strict';
const path=require('path'); const H=require(path.join(__dirname,'pg_harness_jobs.js'))(path.resolve(__dirname,'..'));
const {check,GM}=H, J=JSON.stringify; GM.caption=()=>{}; GM.toast=()=>{};
const D=k=>PG.DK(k), M=(WZ_JOBS_DATA.x.office||{}).miss||[], ML=M.map(v=>v[0][1]);
(async()=>{
  check('0. x.office.miss 有 AA_586 的三句',M.length===3&&ML[1]==='上週沒看到你。有事的話先講，班可以換。',J(ML));
  const setup=async()=>{ const G=H.fresh('2027-09-13',10,'dorm',{}); H.picks=['週二和週四']; await JOBS.apply(GM,'office'); return G; };
  /* 1. 2027-10-05（週二）沒去 → 10-07（週四）上班 */
  { const G=await setup(), j=JOBS.job(G,'office'); Object.assign(j,{since:D('2027-10-04'),chk:D('2027-10-04'),missPend:false,missN:0,worked:[],wk:{},shifts:3});
    PG.setT(G,H.E,D('2027-10-06'),9); JOBS.track(G);
    check('1. 10/5（週二、沒有考試）沒去：missPend',j.missPend===true&&!JOBS.excused(G,'office',D('2027-10-05')),J({mp:j.missPend,ex:JOBS.excused(G,'office',D('2027-10-05'))}));
    PG.setT(G,H.E,D('2027-10-07'),13.5); H.said=[]; await JOBS.runShiftX(GM,'office');
    const said=H.said.map(x=>x.t); check('1. 下一班（10/7）開頭演 AA_586 第一句，之後 missPend 清掉',said[0]===ML[0]&&!j.missPend&&j.missN===1,J(said.slice(0,2)));
    j.missPend=true; PG.setT(G,H.E,D('2027-10-12'),13.5); H.said=[]; await JOBS.runShiftX(GM,'office'); check('1. 第二次沒去：換第二句',H.said[0]&&H.said[0].t===ML[1],J(H.said.slice(0,1))); }
  /* 2. 2027-12-23（週四 13:20 證交法期末考）自動請假 → 12-28（週二）上班不演 miss */
  { const G=await setup(), j=JOBS.job(G,'office'), d=D('2027-12-23'); Object.assign(j,{chk:d-1,missPend:false,missedRun:0,wk:{},missN:0});
    check('2. 12/23 有期末考：自動請假（exam）',JOBS.excused(G,'office',d)==='exam');
    PG.setT(G,H.E,d+1,9); JOBS.track(G); check('2. 自動請假不算沒去',!j.missPend);
    PG.setT(G,H.E,D('2027-12-28'),13.5); H.said=[]; await JOBS.runShiftX(GM,'office'); check('2. 下一班不演 miss',!H.said.some(x=>ML.includes(x.t)),J(H.said.slice(0,2).map(x=>x.t))); }
  H.done();
})();

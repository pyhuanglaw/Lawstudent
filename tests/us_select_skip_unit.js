// BUG-US-Y4S1-SELECT-1102（BB 11:20，K1 子代理留下的）：人在國外的學期不跳選課畫面——美國路線的大四上、日本路線的大三下；留在台灣的照常
// 修改前（classes3d.js 的 skipT 只認 JP.skipTerm）：美國大四上會跳選課 → FAIL。用法：node tests/us_select_skip_unit.js
'use strict';
const H=require('./pg_harness.js'); const {check,GM}=H, J=JSON.stringify;
const sel=async(term,route)=>{ const d0=STORY.termDay(term,1,1)-1; H.fresh(CALENDAR.dateOf(d0).key,8,'dorm',route?{EXCHANGE_ROUTE:route}:{}); H.said=[]; H.picks=[0,0,0,0,0];
  const R=CLS.rec(H.G); delete R.note['sel_'+term]; await CLS.morning(GM); return {asked:H.said.some(x=>/^選課結果出來了/.test(x.t)),noted:!!R.note['sel_'+term],route:STORY.route?STORY.route(H.G):null}; };
(async()=>{
  const groups=CLS.choiceGroups('Y4S1').length; check('0. 大四上有選修要選（'+groups+' 組）',groups>0);
  let r=await sel('Y4S1','US'); check('1. 美國路線大四上（人在美國）：不跳選課、記成選過',r.route==='US'&&!r.asked&&r.noted,J(r));
  r=await sel('Y4S1',null); check('2. 台灣路線大四上：照常跳選課',r.asked,J(r));
  r=await sel('Y4S1','JP'); check('3. 日本路線大四上（已經回台灣）：照常跳選課',r.asked,J(r));
  if(CLS.choiceGroups('Y3S2').length){ r=await sel('Y3S2','JP'); check('4. 日本路線大三下（人在日本）：不跳選課',!r.asked&&r.noted,J(r)); }
  H.done();
})();

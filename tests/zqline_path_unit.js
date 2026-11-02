// BB 09:02 ②（CC N4）：落點 B 但四年沒報考研究所 → 改成 C 的人，子晴線（FRIEND＋Q14 有回）要落在 C_zq，不是 C。
// PG.pathTop 是 path、zqLine 共用的落點。修改前（85aef74d7）：zqLine 看調整前的 top（B）→ FAIL。用法：node tests/zqline_path_unit.js
'use strict';
const H=require('./pg_harness.js'); const {check}=H, J=JSON.stringify;
const G=H.fresh('2029-06-03',10,'dorm',{ZQ_CONTRACT:'lawyer'}); const lean0=PG.lean, at0=PG.at;
PG.lean=()=>({top:'B',A:1,B:3,C:2}); PG.at=(g,id,lv)=>id==='heroine_04';
try{
  check('1. 前置：沒報考研究所（gradApplied false）',!PG.gradApplied(G));
  check('2. pathTop：B 沒報考研究所、C>A → C',PG.pathTop&&PG.pathTop(G)==='C',PG.pathTop&&PG.pathTop(G));
  check('3. 子晴線：zqLine 成立、path＝C_zq',PG.zqLine(G)===true&&PG.path(G)==='C_zq',J({zq:PG.zqLine(G),path:PG.path(G)}));
  PG.lean=()=>({top:'B',A:3,B:4,C:2}); check('4. A>C 的 B 改成 A：不是子晴線',PG.zqLine(G)===false&&/^A_/.test(PG.path(G)),PG.path(G));
} finally { PG.lean=lean0; PG.at=at0; }
H.done();

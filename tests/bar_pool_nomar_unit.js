// 律師一試不考海商法、智財、勞社、財稅（使用者 2026-11-02 10:2x，經 BB；LEGAL_REVIEW_REQUIRED）——不需要瀏覽器。
//   1. PG.pool() 沒有 Y4MAR_；PG.pool(true)（讀舊存檔用）有
//   2. 2029～2033 每一年抽的 20 題都沒有 Y4MAR_（幾個不同的 examSeed）
//   3. 舊存檔已經抽好、裡面有 Y4MAR_ 的那一年：照舊（不重抽）
//   （10:2x 使用者「智財勞社財稅也拿掉」：Y4IP_、Y4LSO_、Y4TAX_ 一起排除）
// 修改前（bd0a32c19）：1、2 FAIL。用法：node tests/bar_pool_nomar_unit.js
const H=require('./pg_harness.js'); const {check}=H, J=JSON.stringify;
(async()=>{
  H.fresh('2029-06-30',10,'dorm',{});
  const XR=/^(Y4MAR_|Y4IP_|Y4LSO_|Y4TAX_)/; const mar=EXAM_BANK.questions.filter(q=>XR.test(q.id)).length;
  check('0. 題庫裡有海商法、智財、勞社、財稅的題目（'+mar+' 題）',mar>0);
  const p=PG.pool(), pa=PG.pool(true);
  check('1. 一試題庫沒有這四組；全部（讀舊存檔用）有（一試題庫 '+p.length+' 題，五年各 20 題要 100 題）',!p.some(q=>XR.test(q.id))&&pa.filter(q=>XR.test(q.id)).length===mar&&p.length>=5*PG.N_Q,J({p:p.length,pa:pa.length}));
  let bad=[]; for(const seed of [1,7,12345,987654321,42424242,5]){ H.fresh('2029-06-30',10,'dorm',{examSeed:seed}); for(const y of [2029,2030,2031,2032,2033]){ const qs=PG.draw(H.G,y); if(qs.length!==PG.N_Q||new Set(qs.map(q=>q.id)).size!==PG.N_Q||qs.some(q=>XR.test(q.id))) bad.push([seed,y,qs.length]); } const all=[2029,2030,2031,2032,2033].flatMap(y=>PG.rec(H.G).exam[y].qs); if(new Set(all).size!==all.length) bad.push([seed,'五年有重複']); }
  check('2. 2029～2033、6 個 examSeed：每一年 20 題不重複、五年之間也不重複、沒有這四組',!bad.length,J(bad));
  H.fresh('2029-06-30',10,'dorm',{examSeed:3}); const R=PG.rec(H.G); R.exam=R.exam||{}; const old=pa.filter(q=>/^Y4MAR_/.test(q.id)).slice(0,2).concat(p.slice(0,18)).map(q=>q.id); R.exam[2029]={qs:old.slice()};
  const got=PG.draw(H.G,2029).map(q=>q.id); check('3. 舊存檔已經抽好（含 2 題 Y4MAR_）：照舊不重抽',J(got)===J(old),J(got.slice(0,3)));
  H.done();
})();

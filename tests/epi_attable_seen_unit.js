// 尾聲那一桌（PG.atTable）要「熟悉度到門檻而且見過」（BB 2026-11-02 CC_34）：只靠搭話把熟悉度累積到 20、沒有 FIRST_MET／GREETED／met_ 的人不上桌。用法：node tests/epi_attable_seen_unit.js
// 修改前：1 FAIL。
const H=require('./pg_harness.js'); const {check}=H;
(async()=>{
  const G=H.fresh('2034-06-03',18,'dorm',{});
  { const r=SOCIAL.rel('heroine_03'); r.fam=25; r.trust=0; r.comf=0; }   /* 熟悉度到了，但沒有任何見過的紀錄 */
  check('1. 只有熟悉度、沒見過（沒有 FIRST_MET／GREETED／met_）：不上桌',!PG.atTable(G,'heroine_03'));
  SOCIAL.remember('heroine_03','GREETED','');
  check('2. 有 GREETED（relabelFirstMet 遷移過的舊存檔）：上桌',PG.atTable(G,'heroine_03'));
  { const r=SOCIAL.rel('heroine_04'); r.fam=25; } G.flags.met_heroine_04=true;
  check('3. met_ 旗標（SOCIAL.metD）也算見過：上桌',PG.atTable(G,'heroine_04'));
  H.FAMILIAR('heroine_02');
  check('4. 一般的（H.FAMILIAR 會記 FIRST_MET）照舊上桌',PG.atTable(G,'heroine_02'));
  { const r=SOCIAL.rel('kexin'); r.fam=5; } SOCIAL.remember('kexin','FIRST_MET','');
  check('5. 見過但熟悉度不到：照舊不上桌',!PG.atTable(G,'kexin'));
  H.done();
})();

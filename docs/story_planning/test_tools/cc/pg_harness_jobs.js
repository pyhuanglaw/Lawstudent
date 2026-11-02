// CC（BB 10:52，P3）：tests/pg_harness.js 加上打工模組（JOBS）的版本。原 harness 沒載 src/jobs3d.js＝所有打工判定走 typeof JOBS==='undefined' 分支、沒測到。
// 用法：const H=require('<這個檔>')(WT)；WT＝受測資料夾（含 tests/pg_harness.js、src/）。回傳原本的 H，另外有 H.loaded（補載的檔）、H.loadErr（載入例外）。
// 補載順序照 index.html：wz_shops_layout（JOBS.goto 讀）→ study（CLS 的自習）→ r2y4b／y5s1／faildelay（FD 補考、延畢）→ wz_jobs → jobs3d → wz_events → wzlines3d（JOBS.EXCUSE、SHIFT_EV 的登記）。
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
module.exports=function(WT){
  const H=require(path.join(WT,'tests/pg_harness.js'));
  H.loaded=[]; H.loadErr=[];
  const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ H.loadErr.push(f+'：檔案不存在'); return; } const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); H.loaded.push(f); };
  const EXTRA=['src/data/wz_shops_layout.js','src/data/study_units.js','src/study3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js',
    'src/data/wz_jobs.js','src/jobs3d.js','src/data/wz_events.js','src/wzlines3d.js','src/faildelay3d.js'];
  for(const f of EXTRA){ try{ load(f); }catch(e){ H.loadErr.push(f+'：'+(e&&e.stack||e)); } }
  return H;
};

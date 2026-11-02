// CC（BB 10:49，BUG-FAFU-DOUBLE）：同一個週六先坐圓桌（STORY.fafuShift）再演溫州街線值班事件（WZL.lineAt）→ FAFU_SHIFT_N 加幾次（現在 head 預期 +2；修好 +1）
// 用法：WT=<受測資料夾> node n20_fafu_double.js
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/wz_events.js','src/jobs3d.js','src/wzlines3d.js']) try{ if(f==='src/wzlines3d.js'&&typeof WZL!=='undefined') continue; load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
GM.caption=()=>{}; GM.toast=()=>{};
(async()=>{
  /* 找一個法服值班週六（大二上 Y2S1 第 11 週以後） */
  let d0=null; const G=H.fresh('2026-11-14',9.5,'wancai',{ROOM_Y2:true,lawclub:true,CLUB_lawclub:true}); for(let d=G.day;d<G.day+60;d++){ G.day=d; if(STORY.fafuDuty&&STORY.fafuDuty(G)){ d0=d; break; } }
  check('0. 前置：找到值班週六',d0!=null,String(d0)); if(d0==null){ H.done(); return; }
  G.day=d0; G.weekday=6; G.hour=9.5; G.zone='wancai';
  console.log('fafuMember',STORY.fafuMember&&STORY.fafuMember(G),'fafuShiftable',STORY.fafuShiftable&&STORY.fafuShiftable(G));
  const F=G.flags; const n0=F.FAFU_SHIFT_N|0, v0=F.LAWCLUB_SAT_VISITS|0;
  /* 1. 坐圓桌 */ let a=false; try{ a=await STORY.fafuShift(GM); }catch(e){ console.log('fafuShift 例外',e.message); }
  const n1=F.FAFU_SHIFT_N|0, v1=F.LAWCLUB_SAT_VISITS|0;
  /* 2. 同一天、溫州街線值班事件（【前置】WZ_LINE_L 指到今天）*/
  G.hour=10; F.WZ_LINE_L={k:'lease3',day:G.day}; let b=false; try{ b=WZL.lineAt(GM); }catch(e){ console.log('lineAt 例外',e.message); }
  for(let i=0;i<200&&WZL.playing;i++) await new Promise(r=>setTimeout(r,10));
  const n2=F.FAFU_SHIFT_N|0, v2=F.LAWCLUB_SAT_VISITS|0;
  console.log(J({fafuShift:a,lineAt:b,N:[n0,n1,n2],VISITS:[v0,v1,v2]}));
  check('1. 坐圓桌：FAFU_SHIFT_N +1、VISITS +1',n1-n0===1&&v1-v0===1,J({N:[n0,n1],V:[v0,v1]}));
  check('2. 同一天再演溫州街線值班：VISITS 不再加（有用 LAWCLUB_SAT_LAST 擋）',v2===v1,J({V:[v1,v2],lineAt:b}));
  check('3. 同一天再演溫州街線值班：FAFU_SHIFT_N 不再加（BUG-FAFU-DOUBLE：現在 head 預期 FAIL＝+2）',n2===n1,J({N:[n0,n1,n2],lineAt:b}));
  H.done();
})();

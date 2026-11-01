// 大三暑假摘要日的小場景（AA_549 3-1，src/r2y3b3d.js R2Y3B.playSumScene）：18:30 在宿舍／家裡演、說話的是白天的人——那一段背景改模糊，演完換回原本的背景（BB-B 11-01 n40）。不需要瀏覽器。
//   1 原本是 3D 宿舍（freeze）：小場景演的時候是 blur，演完回 freeze；原本是家裡的底圖（物件）也換得回去
//   2 原本就是 blur：不動；ADV 沒開：不出錯、照演
// 修改前（開發分支 a31835f63）：小場景不換背景——第 1 項 FAIL。用法：node tests/r2y3b_sumbg_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
for(const f of ['src/holff3d.js','src/r2y3b3d.js']) vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),{filename:f});
GM.toast=()=>{}; GM.caption=()=>{};
const mkADV=bg=>{ const A={active:true,bgMode:bg,log:[],during:[],setBg(m){ this.log.push(m); this.bgMode=m; }}; global.ADV=Object.assign(global.ADV||{},A); return global.ADV; };
(async()=>{
  const run=async(bg)=>{ H.fresh('2028-06-26',18.5,'dorm',{SUMMER_Y3:'intern'}); const A=mkADV(bg); const say0=GM.say; GM.say=async(w,t)=>{ A.during.push(A.bgMode); return say0(w,t); }; H.picks=['一半'];
    try{ await R2Y3B.playSumScene(GM,0); } finally { GM.say=say0; } return A; };
  { const a=await run('freeze'); check('1. 原本 3D 宿舍（freeze）：說話的時候都是 blur，演完回 freeze',a.during.length>0&&a.during.every(m=>m==='blur')&&a.bgMode==='freeze',J({during:a.during,end:a.bgMode,log:a.log})); }
  { const img={image:'assets/bg/home_room.webp'}; const a=await run(img); check('1. 原本是家裡的底圖（物件）：演完換回同一個物件',a.during.every(m=>m==='blur')&&a.bgMode===img,J({end:a.bgMode})); }
  { const a=await run('blur'); check('2. 原本就是 blur：不呼叫 setBg',a.log.length===0&&a.bgMode==='blur',J(a.log)); }
  { H.fresh('2028-06-26',18.5,'dorm',{SUMMER_Y3:'intern'}); global.ADV.active=false; global.ADV.log=[]; H.picks=['一半']; H.said=[]; let ok=true; try{ await R2Y3B.playSumScene(GM,0); }catch(e){ ok=false; }
    check('2. ADV 沒開：不出錯、照演、不換背景',ok&&H.said.length>0&&global.ADV.log.length===0); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

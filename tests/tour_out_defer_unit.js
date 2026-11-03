// 總圖新生導覽進行中，出遊（例：大一第 1 週 15:55 系學會合照）的出發選單先不跳，導覽結束再跳（BB 11-03 CC 導覽探針）。不需要瀏覽器。用法：node tests/tour_out_defer_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.document={getElementById:()=>null,addEventListener(){}};
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8').replace(/^const OUT\s*=/m,'globalThis.OUT='),{filename:'outings3d.js'});
const src=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8');
(async()=>{
  let prompted=0; OUT.expire=()=>[]; OUT.due=()=>({id:'q'}); OUT.prompt=async()=>{ prompted++; };
  const GM={G:{flags:{},day:1,hour:15.9}};
  global.CLS={touring:true}; const r1=OUT.tick(GM);
  global.CLS={touring:false}; const r2=OUT.tick(GM); if(r2&&r2.then) await r2;
  check('1. 導覽進行中（CLS.touring）不跳出發選單；結束以後跳',r1===null&&prompted===1,JSON.stringify([r1,prompted]));
  check('2. classes3d.js：runLibTour 包一層設 CLS.touring、finally 放開，讀檔也放開（LOADLOCKS）',/S\.touring=true; try\{ return await run0\(GM,a\); \} finally \{ S\.touring=false; \}/.test(src)&&/LOADLOCKS[^\n]*'classes3d:touring'/.test(src));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

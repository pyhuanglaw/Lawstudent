// PHONE-GO-PROMPT-1111（BB 11-11 V25_L118_C5）：手機「今天約好的」按「前往」＝先收手機；畫面上有選單在等（goPrompt「直接過去／自己走過去」）＝提示「先選完畫面上的選項」、不呼叫 INV.goNow。
// 不需要瀏覽器：把 game3d.js 那一個 handler 抽出來，用假的 DOM／GM 跑。修改前 1、2、3 FAIL。用法：node tests/phone_go_prompt_1111_unit.js
const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fail=0; const check=(n,ok,x)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||x===undefined?'':'　'+JSON.stringify(x))); if(!ok) fail++; };
const i=src.indexOf("body.querySelectorAll('[data-invgo]')"), j=src.indexOf("body.querySelectorAll(",i+10); const code=src.slice(i,j);
check('0. 找得到 data-invgo 的 handler',i>0&&j>i);
async function run({busy,picking,mOpen}){ const log=[]; const btn={dataset:{invgo:'7'},onclick:null};
  const body={querySelectorAll:()=>({forEach:f=>f(btn)})}, document={getElementById:id=>id==='choices'?{classList:{contains:()=>!picking}}:null};
  const G={invites:[{id:7}]}, E={player:{busy}}, GM={}, INV={goNow:async(g,iv)=>{ log.push('goNow:'+iv.id); }};
  const closePhone=()=>log.push('closePhone'), closeMenu=()=>log.push('closeMenu'), toast=t=>log.push('toast:'+t); let menuOpen=!!mOpen;
  new Function('body','document','G','E','GM','INV','closePhone','closeMenu','toast','menuOpen',code)(body,document,G,E,GM,INV,closePhone,closeMenu,toast,menuOpen); await btn.onclick(); return log; }
(async()=>{
  let L=await run({busy:false,picking:false}); check('1. 平常按「前往」：先收手機，再 INV.goNow',JSON.stringify(L)===JSON.stringify(['closePhone','goNow:7']),L);
  L=await run({busy:true,picking:true}); check('2. 畫面上有選單在等：收手機、提示「先選完畫面上的選項」、不呼叫 goNow',JSON.stringify(L)===JSON.stringify(['closePhone','toast:先選完畫面上的選項']),L);
  L=await run({busy:true,picking:false}); check('3. 劇情中（沒有選單）：收手機、提示「現在不能移動」、不呼叫 goNow',JSON.stringify(L)===JSON.stringify(['closePhone','toast:現在不能移動']),L);
  L=await run({busy:false,picking:false,mOpen:true}); check('4. 選單頁開著也一起收',L[0]==='closePhone'&&L[1]==='closeMenu'&&L[2]==='goNow:7',L);
  console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0); })();

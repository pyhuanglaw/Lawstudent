// 小地圖上「永遠走不到的黃點」（X77，BUG-MAP-YELLOWDOT-1020；使用者 2026-10-20：「遊戲中地圖應該是南方一直有一個黃色的點永遠走不到」）——不需要瀏覽器。
//   BB-C 查過：校園 43 個互動點、地圖上的人都走得到；最可能是 ①小地圖邊上的「北」（深色圓＋黃字，看起來像黃點，鏡頭轉到哪都在邊上）
//   ②目的地太遠時固定在小地圖邊上的金點（看起來像一個走過去也到不了的點）。
//   1. 「北」改白字白框（黃色只留給認識的人和目的地）；
//   2. 目的地在小地圖外：邊上畫往外指的箭頭（三角形），不畫圓點；在小地圖內照舊畫圓點。
// 修改前 1、2 都 FAIL。用法：node tests/minimap_yellowdot_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
{ const m=g.match(/\/\* 北方標示[^\n]*/); const s=m?m[0]:'';
  check('1. 小地圖的「北」白字白框（不是黃字）', /fillText\('北'/.test(s)&&/x\.fillStyle='#ffffff'; x\.fillText\('北'/.test(s)&&!/#ffd88a/.test(s), s.slice(0,160)); }
const src=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8');
const m=src.match(/function drawMini\(x,nav,cx,cz,scale\)\{[\s\S]*?x\.fill\(\); x\.stroke\(\); \}/);
check('2. guide3d.js 找得到 drawMini', !!m);
if(m){ const mk=()=>{ const calls=[]; const x={canvas:{width:120,height:120},set fillStyle(v){ calls.push('fill='+v); },set strokeStyle(v){},set lineWidth(v){},set lineJoin(v){},setLineDash(){},beginPath(){ calls.push('begin'); },moveTo(){ calls.push('moveTo'); },lineTo(){ calls.push('lineTo'); },closePath(){ calls.push('close'); },arc(u,v){ calls.push('arc'); },fill(){ calls.push('fillDraw'); },stroke(){} }; return {x,calls}; };
  const run=(tx,tz)=>{ const ctx={st:{tgt:{x:tx,z:tz},route:null},on:()=>true,Math}; vm.createContext(ctx); vm.runInContext(m[0]+'\nthis.drawMini=drawMini;',ctx); const c=mk(); ctx.drawMini(c.x,{ox:0,oz:0,cell:1},0,0,1); return c.calls; };
  const far=run(0,500), near=run(0,10);
  check('2. 目的地在小地圖外：畫三角形箭頭（moveTo＋兩次 lineTo＋closePath），不畫圓點', far.includes('moveTo')&&far.filter(c=>c==='lineTo').length>=2&&far.includes('close')&&!far.includes('arc'), JSON.stringify(far));
  check('2. 目的地在小地圖內：照舊畫圓點', near.includes('arc')&&!near.includes('close'), JSON.stringify(near)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

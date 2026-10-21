// 入口名牌疊在一起（LAWWW-C 10-20 美術巡檢截圖：118 巷兩排九間店，往巷子裡看名牌疊成一排、互相蓋住字）——不需要瀏覽器。
//   guide3d.js 的 declutter：畫面上會疊在一起的名牌只留近的，金色（導航目的地）優先；不疊的都留著。updateMarkers 每一幀最後跑 hideOverlaps。
// 修改前：沒有 declutter（第 0 項 FAIL）。用法：node tests/guide_declutter_unit.js
const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src/guide3d.js'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const m=src.match(/\n  function declutter\(L\)\{[^\n]*\n/);
check('0. guide3d.js 有 declutter、updateMarkers 最後跑 hideOverlaps', !!m&&/hideOverlaps\(p\); \}\n/.test(src)&&/declutter \};/.test(src));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const declutter=new Function(m[0]+'; return declutter;')();
const R=(id,d,x,y,w,h,gold)=>({id,d,gold:!!gold,x0:x-w/2,x1:x+w/2,y0:y-h,y1:y});
{ const L=declutter([R('far',20,400,100,160,30),R('near',8,420,110,160,30)]); const v=Object.fromEntries(L.map(r=>[r.id,!r.hide]));
  check('1. 兩個疊在一起：留近的', v.near===true&&v.far===false, JSON.stringify(v)); }
{ const L=declutter([R('gold',25,400,100,160,30,true),R('near',6,410,105,160,30)]); const v=Object.fromEntries(L.map(r=>[r.id,!r.hide]));
  check('2. 金色（導航目的地）比較遠也留', v.gold===true&&v.near===false, JSON.stringify(v)); }
{ const L=declutter([R('a',10,200,100,160,30),R('b',12,600,100,160,30),R('c',14,400,220,160,30)]); 
  check('3. 不疊的都留著', L.every(r=>!r.hide)); }
{ const row=[0,1,2,3,4,5,6,7,8].map(i=>R('s'+i,6+i*3,420+(i%2?14:-14),120-i*4,170,30)); const L=declutter(row); const vis=L.filter(r=>!r.hide).map(r=>r.id);
  check('4. 118 巷：九個名牌疊成一排，只剩一個（最近的）', vis.length===1&&vis[0]==='s0', JSON.stringify(vis)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

// 舟山路晚上不是整條黑的（LAWWW2-B 2026-10-24，巡查表第 3 節 P3「大一女舍門口 20:00 馬路幾乎全黑」）——不需要瀏覽器。
//   原本 zones3d.js 校園的舟山路（z 42.5～51.5、x −110～110）沒有一盞路燈，只有大一女舍長椅旁那一盞（燈臂朝長椅）。
//   1. 舟山路南側有一排路燈：x −97～70 約 22 m 一盞（往男生宿舍的路兩側各一盞）、z 52.6（路緣外）、燈臂朝馬路（rotation π）、有 roadPool、導航擋 0.5 m；
//   2. 相鄰間距 ≤ 25 m；女舍長椅後面那段馬路（x −93）、往男生宿舍的路口（x 20）都在某一盞的路面光圈裡（光圈半徑 6.5 m×1.3 沿路＝8.45 m）；
//   3. 不擋往男生宿舍的路（x 17～23）、不擋大一女舍 A、B 門口（x −108、−78 ±2 m）、離女舍長椅那一盞（−91.2, 53.5）≥ 5 m；
//   4. 路面光圈有深度偏移，比任何路面層級（stripLayer）都前面：舟山路和步道交疊、被往上推一層，原本斜看時光圈整個被柏油蓋掉（遊戲內量到光圈在、畫面上看不到）。
// 修改前 FAIL。用法：node tests/zhoushan_lamps_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const zs=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
const m=zs.match(/for\(const x of \[([-0-9,]+)\]\)\{ const l=W3\.lampPost\(\); place\(g,l,x,([0-9.]+),Math\.PI\); l\.userData\.roadPool=true; lamps\.push\(l\); nav\.blockCircle\(x,\2,0\.5\); \}/);
check('1. 舟山路南側有一排路燈（燈臂朝馬路、有路面光圈、導航擋 0.5 m）', !!m);
if(m){ const xs=m[1].split(',').map(Number), z=+m[2]; const dx=Math.max(...xs.slice(1).map((x,i)=>x-xs[i]));
  check('1. 在路緣外（z 52～53.5，路面 z 42.5～51.5）', z>52&&z<53.5, 'z '+z);
  check('2. 相鄰間距 ≤ 25 m（由西往東排）', dx<=25&&xs.every((x,i)=>i===0||x>xs[i-1]), '最大 '+dx+' m');
  check('2. 女舍長椅後面的馬路（x −93）、往男生宿舍的路口（x 17～23）都在路面光圈裡（離燈 ≤ 8 m）', xs.some(x=>Math.abs(x+93)<=8)&&[17,20,23].every(px=>xs.some(x=>Math.abs(x-px)<=8)), JSON.stringify(xs));
  check('3. 不擋往男生宿舍的路（x 17～23，留 1 m）', xs.every(x=>x<16||x>24));
  check('3. 不擋大一女舍 A、B 門口（±2 m）', xs.every(x=>Math.abs(x+108)>2&&Math.abs(x+78)>2));
  check('3. 離女舍長椅那一盞 ≥ 5 m', xs.every(x=>Math.hypot(x+91.2,z-53.5)>=5)); }
{ const rp=zs.match(/rp\.position\.set\(0,0\.035,4\.5\); rp\.material\.polygonOffset=true; rp\.material\.polygonOffsetFactor=(-\d+); rp\.material\.polygonOffsetUnits=(-\d+);/);
  check('4. 路面光圈有深度偏移（factor ≤ −6，比路面層級前面）', !!rp&&+rp[1]<=-6&&+rp[2]<=2*+rp[1], rp?rp[1]+'／'+rp[2]:'沒有'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

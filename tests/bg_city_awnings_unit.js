// 醉月湖北邊（辛亥路對面）那一排遠景店面不像舞台布景（LAWWW2-B 2026-10-24，路線巡查③ P3，LAWWW-B 派工）——不需要瀏覽器。
//   原本 zones3d.js 校園背景北側第一排（z −171，x −260～262）每一棟一樓都是店面，townkit3d.js 的 bgGroundTex('city') 每家一塊滿版的正紅、正綠、正黃、正藍招牌：
//   從醉月湖看過去是一條 500 m 長、一直重複的彩色帶子。
//   1. 北側第一排只有一部分有店面（用同一個 H 雜湊，30%～50%），其他一樓也是窗；
//   2. 店面貼圖的招牌顏色（白天、晚上同一組）彩度 ≤ 0.45（HSL），而且至少有一塊是米白底；
//   3. 拉下鐵捲門那一家（第 3 塊）的招牌不是滿版。
// 修改前 FAIL。用法：node tests/bg_city_awnings_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const zs=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'), tk=fs.readFileSync(path.join(ROOT,'src/townkit3d.js'),'utf8');
const H=(a,b)=>{ const v=Math.sin(a*12.9898+b*78.233)*43758.5453; return v-Math.floor(v); };   // 和 zones3d.js 校園背景的 H 一樣
{ const m=zs.match(/for\(let x=-260;x<262;\)\{ const w=10\+Math\.round\(H\(x,7\)\*8\); city\.push\(\{x:x\+w\/2,z:-171,[^\n]*?\}\); x\+=w; \}/);
  check('1. 找得到北側第一排（z −171）', !!m);
  if(m){ const sm=m[0].match(/shop:H\(x,(\d+)\)<([0-9.]+)/); let n=0, s=0;
    for(let x=-260;x<262;){ const w=10+Math.round(H(x,7)*8); n++; if(sm?H(x,+sm[1])<+sm[2]:true) s++; x+=w; }
    check('1. 北側第一排只有一部分有店面（30%～50%），其他一樓也是窗', s/n>=0.3&&s/n<=0.5, s+'/'+n+' 棟有店面'); } }
const f=tk.match(/function bgGroundTex\(style,night\)\{[\s\S]*?\n  \/\/ 方盒的 UV/);
check('2. 找得到 bgGroundTex', !!f);
if(f){ const hm=f[0].match(/const hue=\[(\[[^\]]*\](?:,\[[^\]]*\])*)\]/); const cols=hm?[...hm[1].matchAll(/\['(#[0-9a-f]{6})','(#[0-9a-f]{6})'\]/gi)].map(q=>q[1]):[];
  const sat=h=>{ const r=parseInt(h.slice(1,3),16)/255, g=parseInt(h.slice(3,5),16)/255, b=parseInt(h.slice(5,7),16)/255, mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; return mx===mn?0:(mx-mn)/(1-Math.abs(2*l-1)); };
  const lum=h=>{ const r=parseInt(h.slice(1,3),16), g=parseInt(h.slice(3,5),16), b=parseInt(h.slice(5,7),16); return (0.299*r+0.587*g+0.114*b)/255; };
  check('2. 招牌四種顏色的彩度都 ≤ 0.45', cols.length===4&&cols.every(c=>sat(c)<=0.45), cols.map(c=>c+' '+sat(c).toFixed(2)).join('、'));
  check('2. 至少一塊是米白底（亮度 ≥ 0.75、彩度 ≤ 0.3）', cols.some(c=>lum(c)>=0.75&&sat(c)<=0.3));
  check('3. 鐵捲門那一家的招牌不是滿版（b===2 另外給寬度）', /sw=b===2\?\d+:116/.test(f[0])&&/x\.fillRect\(sx,4,sw,26\)/.test(f[0])); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

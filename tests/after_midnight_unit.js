// 半夜不會突然變亮（AFTER-MIDNIGHT-1024，LAWWW2-B 2026-10-24，路線巡查截圖發現）——不需要瀏覽器。
//   原本 engine3d.js 的 applyTime：h<5.5 一律用 05:30 那一列（清晨的藍天、霧、路面），所以 23:50 是夜晚、00:30（G.hour 24.5）天空就突然變亮。
//   1. engine3d.js 有 nightPre、KEY0N、KEYGN，applyTime 用 KEYGN／KEY0N；
//   2. 00:30、02:00、04:00 和 24:00 那一列一樣（天空、環境光、曝光、路燈亮）；
//   3. 23:59 → 00:00 接得上（不會跳）；
//   4. 05:30 以後和原本的表完全一樣；
//   5. 04:30～05:30 從夜晚接到清晨：太陽亮度不倒退；太陽方位在 70°～80°（東北），不會從西邊繞過南邊。
// 修改前 FAIL。用法：node tests/after_midnight_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
const grab=re=>{ const m=src.match(re); return m?m[0]:null; };
const K0=grab(/const KEY0=\[[\s\S]*?\n  \];/), KG=grab(/const KEY_GOLDEN=\[[\s\S]*?\]\];/), KGG=grab(/const KEYG=[^\n]*\n/), NP=grab(/const nightPre=[^\n]*\n  const KEY0N=nightPre\(KEY0\), KEYGN=nightPre\(KEYG\);/), fA=grab(/function sunAng\(KEY,h\)\{[^\n]*\}/);
check('1. engine3d.js 有 nightPre、KEY0N、KEYGN', !!NP);
check('1. applyTime 用 KEYGN／KEY0N', /E\.applyTime=function\(hour\)\{[^\n]*const KEY=E\.grade==='golden'\?KEYGN:KEY0N;/.test(src));
const ctx={Math}; vm.createContext(ctx);
vm.runInContext([K0,KG,KGG,NP||'const KEY0N=null, KEYGN=null;',fA].join('\n')+'\nthis.KEYG=KEYG; this.KEYGN=KEYGN; this.KEY0=KEY0; this.KEY0N=KEY0N; this.sunAng=sunAng;',ctx);
const NEW=ctx.KEYGN||ctx.KEYG, OLD=ctx.KEYG;   // 修改前：applyTime 用 KEYG、h<5.5 夾到第一列
const at=(K,h,col)=>{ if(h<K[0][0]) h=K[0][0]; let i=0; while(i<K.length-2&&K[i+1][0]<=h) i++; const A=K[i], B=K[i+1], t=Math.max(0,Math.min(1,(h-A[0])/(B[0]-A[0]))); const a=A[col], b=B[col];
  if(typeof a==='string'){ const pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16); return [16,8,0].map(s=>((pa>>s)&255)+(((pb>>s)&255)-((pa>>s)&255))*t); } return a+(b-a)*t; };
const COLS={'太陽亮度':2,'環境光':7,'曝光':9,'天空上方':10,'天空中段':11,'霧':8,'路燈':13};
const same=(K,h1,K2,h2)=>Object.values(COLS).every(c=>{ const a=at(K,h1,c), b=at(K2,h2,c); return Array.isArray(a)?a.every((v,i)=>Math.abs(v-b[i])<0.5):Math.abs(a-b)<1e-3; });
for(const h of [0.5,2,4]) check('2. '+String(Math.floor(h)).padStart(2,'0')+':'+(h%1?'30':'00')+' 和 24:00 那一列一樣（天空、環境光、曝光、霧、路燈）', same(NEW,h,OLD,24), 'sky top '+JSON.stringify(at(NEW,h,10).map(Math.round)));
check('3. 23:59 → 00:00 接得上', same(NEW,23.99,NEW,0));
{ let ok=true; for(let h=5.5;h<24;h+=0.05) if(!same(NEW,h,OLD,h)) { ok=false; break; } check('4. 05:30 以後和原本的表完全一樣', ok); }
{ let ok=true, prev=-1; for(let h=4.5;h<=5.5;h+=0.05){ const v=at(NEW,h,2); if(v<prev-1e-9) ok=false; prev=v; } check('5. 04:30～05:30 太陽亮度只增不減', ok); }
{ let ok=true; for(let h=4.5;h<=5.5;h+=0.05){ const az=ctx.sunAng(NEW,h)[1]*180/Math.PI; if(az<69.9||az>80.1) ok=false; } check('5. 04:30～05:30 太陽方位在東北（70°～80°），不會繞過南邊', ok); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

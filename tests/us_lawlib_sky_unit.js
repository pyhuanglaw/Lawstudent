// 美國法學院圖書館的天窗、彩色玻璃晚上要暗（LAWWW2-B 2026-10-24 美國路線巡查②）——不需要瀏覽器。
//   us_lawlib.glb 的 usll_stained_glass（自發光 0.9）、usll_skylight（0.74～0.85）是「外面透進來的天光」，原本整天一樣亮：21:00 和 15:00 一模一樣。
//   1. us3d.js 有 vtAt、skyTint；us_lawlib 的 applyTime 呼叫 skyTint；正式模型載入後收 usll_skylight、usll_stained_glass；
//   2. 15:00 原樣（顏色、自發光都和模型一樣）；21:00 自發光、顏色都乘 VT 晚上那一格的平方（≤ 0.13；只乘一次：遊戲裡 21:00 還有下午的 58%）；18:2x 黃昏偏暖（紅 > 藍）；
//   3. 來回換時段不會越乘越暗（21:00 → 15:00 → 21:00 和第一次 21:00 相同；15:00 回到原樣）；
//   4. 窗外的景 viewTint 照舊（12:00 白、21:00 是 VT 晚上那一格）；
//   5. us_lawlib.glb 真的有這兩個材質、而且有自發光（名字對得上 skyTint 收的那一條）。
// 修改前 1 FAIL。用法：node tests/us_lawlib_sky_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/us3d.js'),'utf8');
const grab=re=>{ const m=src.match(re); return m?m[0]:null; };
const VT=grab(/const VT=\[[^\n]*\];/), vtAt=grab(/function vtAt\(h\)\{[\s\S]*?return VT\[0\]\[1\]; \}\n/), viewTint=grab(/function viewTint\(mats,h\)\{[\s\S]*?\} \}\n/), skyTint=grab(/function skyTint\(mats,h\)\{[\s\S]*?\} \}\n/);
check('1. us3d.js 有 vtAt、viewTint、skyTint', !!(VT&&vtAt&&viewTint&&skyTint));
check('1. us_lawlib 的 applyTime 呼叫 skyTint(sky,h)', /setGlow\(glow,1\); skyTint\(sky,h\); \};/.test(src));
check('1. 正式模型載入後收 usll_skylight、usll_stained_glass', /sky=glowMats\(root,\/\^usll_\(skylight\|stained_glass\)\/\);/.test(src));
const col=(r,g,b)=>({r,g,b,setRGB(a,b2,c){ this.r=a; this.g=b2; this.b=c; return this; },clone(){ return col(this.r,this.g,this.b); }});
const mat=(c,e)=>({color:col(...c),emissive:col(...e),userData:{}});
const near=(a,b)=>Math.abs(a-b)<1e-6, same=(c,ref)=>near(c.r,ref[0])&&near(c.g,ref[1])&&near(c.b,ref[2]);
if(VT&&vtAt&&viewTint&&skyTint){
  const ctx={}; vm.createContext(ctx); vm.runInContext(VT+'\n'+vtAt+viewTint+skyTint+'this.vtAt=vtAt; this.viewTint=viewTint; this.skyTint=skyTint; this.VT=VT;',ctx);
  const nightC=ctx.VT[0][1];
  const glass=mat([1,1,1],[0.9,0.9,0.9]), sky=mat([0.8,0.85,0.9],[0.74,0.81,0.85]), M=[glass,sky];
  ctx.skyTint(M,15);
  check('2. 15:00：彩色玻璃、天窗原樣', same(glass.emissive,[0.9,0.9,0.9])&&same(glass.color,[1,1,1])&&same(sky.emissive,[0.74,0.81,0.85])&&same(sky.color,[0.8,0.85,0.9]));
  ctx.skyTint(M,21); const g21=[glass.emissive.r,glass.emissive.g,glass.emissive.b], s21=[sky.emissive.r,sky.emissive.g,sky.emissive.b];
  const n2=nightC.map(v=>v*v);
  check('2. 21:00：自發光乘晚上那一格的平方（≤ 0.13 倍）', same(glass.emissive,[0.9*n2[0],0.9*n2[1],0.9*n2[2]])&&same(sky.emissive,[0.74*n2[0],0.81*n2[1],0.85*n2[2]])&&Math.max(...n2)<=0.13, JSON.stringify(g21.map(v=>+v.toFixed(3))));
  check('2. 21:00：顏色也乘平方（屋裡的燈照到的玻璃不會還有下午的六成亮）', same(glass.color,n2), JSON.stringify([glass.color.r,glass.color.g,glass.color.b].map(v=>+v.toFixed(3))));
  ctx.skyTint(M,18.6); check('2. 18:36 黃昏：偏暖（紅 > 藍）、比白天暗', glass.emissive.r>glass.emissive.b&&glass.emissive.b<0.9, JSON.stringify([glass.emissive.r,glass.emissive.b].map(v=>+v.toFixed(3))));
  ctx.skyTint(M,15); const back=same(glass.emissive,[0.9,0.9,0.9])&&same(sky.emissive,[0.74,0.81,0.85]);
  ctx.skyTint(M,21); check('3. 來回換時段不會越乘越暗（回到 15:00 原樣、再到 21:00 和第一次一樣）', back&&same(glass.emissive,g21)&&same(sky.emissive,s21));
  const v=mat([0.5,0.5,0.5],[0.5,0.5,0.5]); ctx.viewTint([v],12); const v12=same(v.color,[1,1,1])&&same(v.emissive,[1,1,1]); ctx.viewTint([v],21);
  check('4. 窗外的景 viewTint 照舊（12:00 白、21:00 晚上那一格）', v12&&same(v.color,nightC)&&same(v.emissive,nightC));
}
{ const assets=fs.readFileSync(path.join(ROOT,'src/assets3d.js'),'utf8'); const m=assets.match(/'bldg\.us_lawlib':\{url:'([^']+)'/);
  let names=[]; if(m){ const b=fs.readFileSync(path.join(ROOT,m[1])); const n=b.readUInt32LE(12); const j=JSON.parse(b.slice(20,20+n).toString('utf8')); names=(j.materials||[]).filter(q=>q.emissiveFactor&&q.emissiveFactor.some(x=>x>0)).map(q=>q.name); }
  const re=/^usll_(skylight|stained_glass)/; const hit=names.filter(n=>re.test(n));
  check('5. us_lawlib.glb 有自發光的 usll_skylight、usll_stained_glass', hit.includes('usll_skylight')&&hit.includes('usll_stained_glass'), JSON.stringify(hit)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

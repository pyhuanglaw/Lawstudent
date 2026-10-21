// 影子不閃（X79，PERF-CAMPUS-SHADOW-1020；使用者 2026-10-20：「地圖蠻卡的 有些建築旁邊影子也一直在閃爍」）——不需要瀏覽器。
//   BB-C 量到：engine3d.js 的太陽陰影相機每 5 格＝玩家位置＋太陽方向×60，沒有對齊陰影貼圖的格子（1024 蓋 44 m，一格約 4.3 cm），
//   玩家一走動、時間一流動，建築影子的邊緣就跟著跳（shadow shimmering）。
//   1. shadowSnap：陰影相機的中心在光的平面（右、上兩軸）對齊到整格；走不到一格不動，走 n 格剛好動 n 格；沿著光的方向不動；離原本的點不超過半格；
//   2. 太陽很高（幾乎垂直）也不會壞；
//   3. sunAng：太陽方向每 3 遊戲分鐘才換（同一段 3 分鐘內一樣、跨段才變）；
//   4. applyTime 用 sunAng、shadowSnap（陰影相機的中心＝對齊後的點）。
// 修改前 1～4 都 FAIL。用法：node tests/shadow_snap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
const grab=re=>{ const m=src.match(re); return m?m[0]:null; };
const fS=grab(/function shadowSnap\(t,d,texel\)\{[\s\S]*?return \{x:rx\*r2\+ux\*u2\+d\.x\*f, y:uy\*u2\+d\.y\*f, z:rz\*r2\+uz\*u2\+d\.z\*f\}; \}/), fA=grab(/function sunAng\(KEY,h\)\{[^\n]*\}/);
check('1. engine3d.js 有 shadowSnap、sunAng', !!fS&&!!fA);
if(fS&&fA){ const ctx={Math}; vm.createContext(ctx); vm.runInContext(fS+'\n'+fA+'\nthis.shadowSnap=shadowSnap; this.sunAng=sunAng;',ctx);
  const norm=v=>{ const l=Math.hypot(v.x,v.y,v.z); return {x:v.x/l,y:v.y/l,z:v.z/l}; };
  const basis=d=>{ let rx=d.z, rz=-d.x; const rl=Math.hypot(rx,rz); rx/=rl; rz/=rl; return {r:{x:rx,y:0,z:rz},u:{x:d.y*rz,y:d.z*rx-d.x*rz,z:-d.y*rx}}; };
  const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z, texel=44/1024;
  for(const [nm,d0] of [['下午斜射',{x:0.5,y:0.7,z:-0.5}],['傍晚低角度',{x:-0.9,y:0.15,z:0.3}]]){ const d=norm(d0), B=basis(d);
    let same=true, inHalf=true, integer=true, alongOK=true; const p0={x:12.34,y:0,z:-56.78}, s0=ctx.shadowSnap(p0,d,texel);
    for(let k=0;k<200;k++){ const p={x:p0.x+k*0.0021,y:0,z:p0.z-k*0.0013}, s=ctx.shadowSnap(p,d,texel);   // 每步不到一格
      const dr=dot(s,B.r)-dot(p,B.r), du=dot(s,B.u)-dot(p,B.u); if(Math.abs(dr)>texel/2+1e-9||Math.abs(du)>texel/2+1e-9) inHalf=false;
      const nr=dot(s,B.r)/texel, nu=dot(s,B.u)/texel; if(Math.abs(nr-Math.round(nr))>1e-6||Math.abs(nu-Math.round(nu))>1e-6) integer=false;
      if(Math.abs(dot(s,d)-dot(p,d))>1e-9) alongOK=false; }
    { const g=s0, g2=ctx.shadowSnap(g,d,texel); let ok=Math.hypot(g2.x-g.x,g2.y-g.y,g2.z-g.z)<1e-9;   // 格子上的點：走不到半格（0.6 cm～1.5 cm，各個方向）都回到同一點
      for(const [mx,mz] of [[0.01,0.008],[-0.012,0.006],[0.004,-0.013],[-0.009,-0.009]]){ const s1=ctx.shadowSnap({x:g.x+mx,y:g.y,z:g.z+mz},d,texel); if(Math.abs(dot(s1,B.r)-dot(g,B.r))>1e-9||Math.abs(dot(s1,B.u)-dot(g,B.u))>1e-9) ok=false; } same=ok; }   // 只看光的平面（右、上）：沿著光的方向移動不影響影子貼圖
    check('1. '+nm+'：走不到半格，陰影相機在光的平面上不動', same);
    check('1. '+nm+'：對齊到整格（右、上兩軸都是一格的整數倍）、離原本的點不超過半格、沿著光的方向不動', integer&&inHalf&&alongOK, JSON.stringify({integer,inHalf,alongOK})); }
  { const s=ctx.shadowSnap({x:3,y:1,z:4},{x:0,y:1,z:0},texel); check('2. 太陽幾乎垂直也不會壞（不是 NaN、離原點不超過一格）', [s.x,s.y,s.z].every(Number.isFinite)&&Math.hypot(s.x-3,s.z-4)<texel, JSON.stringify(s)); }
  const KEY=[[5,0,0,0,60],[12,0,0,70,180],[18,0,0,5,270],[24,0,0,0,300]];
  const a=ctx.sunAng(KEY,14.01), b=ctx.sunAng(KEY,14.02), c=ctx.sunAng(KEY,14.06);
  check('3. 太陽方向每 3 遊戲分鐘才換：14:00.6 和 14:01.2 一樣、14:03.6 不一樣', a[0]===b[0]&&a[1]===b[1]&&(c[0]!==a[0]||c[1]!==a[1]), JSON.stringify([a,b,c])); }
{ const m=grab(/E\.applyTime=function\(hour\)\{[\s\S]*?E\.sun\.target\.updateMatrixWorld\(\);/);
  check('4. applyTime 用 sunAng 算太陽方向、陰影相機的中心用 shadowSnap 對齊', !!m&&/const \[el,az\]=sunAng\(KEY,h\);/.test(m)&&/const T=shadowSnap\(target,/.test(m)&&/E\.sun\.target\.position\.set\(T\.x,T\.y,T\.z\)/.test(m)&&!/E\.sun\.target\.position\.copy\(target\)/.test(m)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

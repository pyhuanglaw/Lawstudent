// 幀率上限（BUG-RUN-STUTTER-1112）：使用者的外接螢幕 300 Hz，rAF 每 3.3 ms 一次；遊戲最多每秒 60 幀、而且落在固定間隔上。
// 把 src/game3d.js 裡 GM.frameDue 那一段抽出來跑（不載入整個遊戲）。修改前（沒有 GM.frameDue）＝這支 FAIL。
const fs=require('fs'); let fail=0; const check=(n,ok,x)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'　'+JSON.stringify(x))); if(!ok) fail++; };
const src=fs.readFileSync(__dirname+'/../src/game3d.js','utf8');
const m=/GM\.fpsCap=[\s\S]*?let nextAt=0; GM\.frameDue=function\(now\)\{[\s\S]*?return true; \};/.exec(src);
check('0 game3d.js 有 GM.fpsCap、GM.frameDue，frame() 一開始就問 frameDue',!!m&&/if\(!GM\.frameDue\(now\)\) return;/.test(src));
if(m){ const mk=(search)=>{ const GM={}, location={search}; eval(m[0]); return GM; };
  const run=(GM,hz,sec,jit)=>{ const out=[]; let t=1000; const n=Math.round(hz*sec); for(let i=0;i<n;i++){ t+=1000/hz+(jit?((i*7919)%7-3)*jit:0); if(GM.frameDue(t)) out.push(t); } return out; };
  const gaps=a=>a.slice(1).map((x,i)=>x-a[i]);
  { const g=gaps(run(mk(''),60,5,0.02)); check('1 60 Hz（間隔有 ±0.06 ms 的抖動）：每一次 rAF 都過，和以前一樣（300 次）',g.length===299&&g.every(x=>x>16&&x<17.5),[g.length,Math.max(...g)]); }
  { const a=run(mk(''),300,5), g=gaps(a); check('2 300 Hz：每秒 60 幀左右（5 秒 295～305 幀），間隔都是 16.67 ms（每 5 個垂直同步一幀），沒有忽長忽短',a.length>=295&&a.length<=305&&g.every(x=>Math.abs(x-16.667)<0.05),[a.length,Math.min(...g),Math.max(...g)]); }
  for(const hz of [120,144,240]){ const a=run(mk(''),hz,5), g=gaps(a), mx=Math.max(...g), mn=Math.min(...g); check('3 '+hz+' Hz：每秒 55～62 幀，間隔最多差一個垂直同步',a.length>=275&&a.length<=310&&mx-mn<=1000/hz+0.05,[a.length,mn,mx]); }
  { const a=run(mk('?fps=0'),300,1); check('4 ?fps=0＝不設上限（300 Hz 一秒 300 幀，對照用）',a.length===300,a.length); }
  { const a=run(mk('?x=1&fps=30'),300,5), g=gaps(a); check('4 ?fps=30＝每秒 30 幀、間隔 33.3 ms',a.length>=148&&a.length<=152&&g.every(x=>Math.abs(x-33.333)<0.05),[a.length]); }
  { const GM=mk(''); let t=1000, n=0; for(let i=0;i<600;i++){ t+=1000/300; if(i===300) t+=2000; if(GM.frameDue(t)) n++; } check('5 中間卡 2 秒（切分頁、載入）以後不會連續補畫：恢復後照 60 幀的節奏',n>=115&&n<=125,n); }
}
console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0);

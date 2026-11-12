// 幀率上限 v2（BUG-RUN-STUTTER-1112）：使用者的外接螢幕 300 Hz（筆電 60 Hz 不頓）。遊戲最多每秒約 60 幀，而且每一幀都落在固定的第幾個垂直同步上。
// 把 src/game3d.js 裡 GM.fpsCap／GM.frameDue 那一段抽出來跑（不載入整個遊戲）。
// v1（累加時間表、容許 1 ms）在 60.05 Hz 的螢幕上約 1.2 秒掉一幀——第 2 項就是抓這個（改之前的 v1 這一項 FAIL）。
const fs=require('fs'); let fail=0; const check=(n,ok,x)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'　'+JSON.stringify(x))); if(!ok) fail++; };
const src=fs.readFileSync(__dirname+'/../src/game3d.js','utf8');
const m=/GM\.fpsCap=[\s\S]*?GM\.frameInfo=[^\n]*\n?/.exec(src);
check('0 game3d.js 有 GM.fpsCap、GM.frameDue、GM.frameInfo，frame() 一開始就問 frameDue',!!m&&/if\(!GM\.frameDue\(now\)\) return;/.test(src));
if(m){ const mk=(search)=>{ const GM={}, location={search}; eval(m[0].replace(/\/\*[\s\S]*?\*\//g,'')); return GM; };
  /* 螢幕每 1000/hz ms 一次垂直同步（±jit 的計時抖動）；cost(畫的那一幀要多久)：畫完以前的垂直同步瀏覽器不會叫 rAF */
  const run=(GM,hz,sec,jit,cost)=>{ const out=[]; let busyUntil=0; const n=Math.round(hz*sec); for(let i=1;i<=n;i++){ const v=1000+i*1000/hz, t=v+(jit?(((i*7919)%7)-3)*jit:0); if(v<busyUntil) continue; if(GM.frameDue(t)){ out.push(t); busyUntil=v+(cost||0); } } return out; };
  const gaps=a=>a.slice(1).map((x,i)=>x-a[i]); const tail=(a,k)=>a.slice(Math.floor(a.length*k));   /* 前面一小段在量螢幕，不算 */
  { const a=run(mk(''),60,10,0.05), g=gaps(a); check('1 60 Hz（有計時抖動）：每一次 rAF 都畫（10 秒 600 幀），沒有任何一次隔一幀',a.length===600&&Math.max(...g)<17.5,[a.length,Math.max(...g)]); }
  for(const hz of [59.94,60.05,60.5,61]){ const a=run(mk(''),hz,60,0.03), g=gaps(a); check('2 '+hz+' Hz 的螢幕跑 60 秒：每一次 rAF 都畫、沒有掉幀（v1 會每一兩秒掉一幀）',a.length===Math.round(hz*60)&&Math.max(...g)<1000/hz+1,[a.length,Math.round(hz*60),Math.max(...g)]); }
  for(const [hz,div] of [[75,1],[90,1],[120,2],[144,2],[165,3],[180,3],[240,4],[280,5],[300,5],[360,6]]){ const GM=mk(''), a=run(GM,hz,10,0.02), g=tail(gaps(a),0.2), want=div*1000/hz;
    check('3 '+hz+' Hz：每 '+div+' 個垂直同步畫一幀（'+(hz/div).toFixed(1)+' fps），間隔都是 '+want.toFixed(2)+' ms、不忽長忽短',g.every(x=>Math.abs(x-want)<0.3)&&GM.frameInfo().div===div,[GM.frameInfo(),Math.min(...g),Math.max(...g)]); }
  { const GM=mk(''), a=run(GM,300,10,0.02,8), g=tail(gaps(a),0.3); check('4 300 Hz、每一幀要畫 8 ms：還是每 5 個垂直同步一幀（16.67 ms），不會因為畫得久就亂掉',g.every(x=>Math.abs(x-16.667)<0.3),[GM.frameInfo(),Math.min(...g),Math.max(...g)]); }
  { const GM=mk(''), a=run(GM,300,10,0.02,20), g=tail(gaps(a),0.3); const mx=Math.max(...g), mn=Math.min(...g); check('4 300 Hz、每一幀要畫 20 ms（電腦跟不上）：畫完下一個垂直同步就畫，不多等',mx-mn<3.5&&mx<24,[mn,mx]); }
  { const a=run(mk('?fps=0'),300,1); check('5 ?fps=0＝不設上限（300 Hz 一秒 300 幀，對照用）',a.length===300,a.length); }
  { const GM=mk('?x=1&fps=30'), a=run(GM,300,10), g=tail(gaps(a),0.2); check('5 ?fps=30＝每 10 個垂直同步一幀、間隔 33.3 ms',g.every(x=>Math.abs(x-33.333)<0.3),[GM.frameInfo(),Math.min(...g),Math.max(...g)]); }
  { const GM=mk(''); let t=1000, n=0, first=null; for(let i=0;i<900;i++){ t+=1000/300; if(i===600){ t+=2000; } const r=GM.frameDue(t); if(i===600) first=r; if(i>=600&&r) n++; } check('6 中間卡 2 秒（切分頁、載入）：回來的第一個 rAF 就畫、之後照 60 幀的節奏，不連續補畫',first===true&&n>=58&&n<=62,[first,n]); }
  { const GM=mk(''); run(GM,60,3); const a=run(GM,300,10), g=tail(gaps(a),0.5); check('7 視窗從 60 Hz 的螢幕拖到 300 Hz 的螢幕：幾秒內改成每 5 個垂直同步一幀',g.every(x=>Math.abs(x-16.667)<0.3)&&GM.frameInfo().div===5,[GM.frameInfo(),Math.min(...g),Math.max(...g)]); }
  { const GM=mk(''); run(GM,300,3); const a=run(GM,60,10), g=tail(gaps(a),0.5); check('7 從 300 Hz 拖回 60 Hz：改回每一次都畫',g.every(x=>Math.abs(x-16.667)<0.3)&&GM.frameInfo().div===1,[GM.frameInfo(),Math.min(...g),Math.max(...g)]); }
}
console.log(fail?'FAILED '+fail:'ALL PASS'); process.exit(fail?1:0);

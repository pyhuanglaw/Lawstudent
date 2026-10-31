// 換場景量測小面板（src/perfpanel3d.js，PERF-ZONE-ENTER-1018，LAWWW-B 2026-10-30）——不需要瀏覽器。
//   1  沒有 ?perf：mark 什麼都不做（不記、不畫）
//   2  有 ?perf：start → loaded → warmed → shown，淡入以後 10 秒的格子量最長一格和卡的次數、shader 數，記一筆、文字照格式
//   3  game3d.js 的 enter() 照順序叫四個 mark；index.html 在 game3d.js 後面、GAME.boot() 前面載入
// 用法：node tests/perfpanel_unit.js
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.join(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||info===undefined?'':'　'+info)); if(!ok) fails++; };
const load=(search,doc)=>{ let t=0; const q=[]; const progs=[];
  const ctx={ location:{search}, performance:{now:()=>t}, requestAnimationFrame:f=>{ q.push(f); return q.length; }, navigator:{userAgent:'test'},
    GAME:{E:{renderer:{info:{programs:progs}}}}, document:doc, innerWidth:844, innerHeight:390, WeakSet, console };
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(ROOT,'src/perfpanel3d.js'),'utf8')+'\nthis.P=PERFPANEL;',ctx);
  const step=(dt,addProgs)=>{ t+=dt; for(let i=0;i<(addProgs|0);i++) progs.push({}); const f=q.shift(); if(f) f(t); };
  return {P:ctx.P, step, setT:v=>{ t=v; }, add:n=>{ for(let i=0;i<n;i++) progs.push({}); }, drop:n=>{ progs.splice(0,n); }, queue:q}; };

{ const X=load(''); X.P.mark('start','cafe'); X.P.mark('loaded'); X.P.mark('warmed'); X.P.mark('shown');
  check('1. 沒有 ?perf：on false、mark 不記、不排格子',X.P.on===false&&X.P.log.length===0&&X.queue.length===0); }

{ const X=load('?perf&turbo'); X.P.mark('start','cafe'); X.setT(1200); X.add(3); X.P.mark('loaded'); X.setT(3400); X.add(2); X.P.mark('warmed'); X.setT(4000); X.P.mark('shown');
  check('2. 有 ?perf：shown 以後才開始量格子（排了一格）、還沒記',X.P.on===true&&X.queue.length===1&&X.P.log.length===0);
  X.step(16); X.step(16); X.step(450,2); X.step(16); X.step(130); for(let i=0;i<700;i++) X.step(16);
  const c=X.P.log[0];
  check('2. 10 秒以後記一筆：黑畫面 4.0 秒（建區域 1.2、預熱 2.2）、最長一格 0.45 秒、卡 2 次、shader 黑畫面 +5、淡入後 +2',X.P.log.length===1&&c.zone==='cafe'&&Math.abs(c.maxGap-450)<1e-6&&c.gaps===2&&X.P.line(c)==='cafe：黑畫面 4.0 秒（建區域 1.2、預熱 2.2）；淡入後 10 秒最長一格 0.45 秒、卡 2 次；shader 黑畫面 +5、淡入後 +2',X.P.line(c||{}));
  check('2. 複製的文字：第一行瀏覽器、接最近的紀錄',X.P.text()==='test\n'+X.P.line(c));
  for(let k=0;k<9;k++){ X.P.mark('start','z'+k); X.P.mark('shown'); for(let i=0;i<700;i++) X.step(16); }
  check('2. 只留最近 8 次（新的在前）',X.P.log.length===8&&X.P.log[0].zone==='z8'&&X.P.log[7].zone==='z1'); }

{ const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), i=g.indexOf('async function enter('), body=g.slice(i,g.indexOf('GM.isEntering=',i));
  const at=k=>body.indexOf("PERFPANEL.mark('"+k+"'");
  check('3. game3d.js enter()：start → loaded → warmed（Z3.prewarm 之後）→ shown（淡入之後）',at('start')>0&&at('loaded')>at('start')&&at('warmed')>body.indexOf('Z3.prewarm(E')&&at('warmed')>at('loaded')&&at('shown')>body.indexOf('await fade(false)')&&at('shown')>at('warmed'));
  const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=h.indexOf('src/perfpanel3d.js');
  check('3. index.html：perfpanel3d.js 在 game3d.js 後面、GAME.boot() 前面',a>h.indexOf('src/game3d.js')&&a<h.indexOf('GAME.boot()')); }

{ const X=load('?perf'); X.add(9); X.P.mark('start','dorm_hall'); X.drop(9); X.add(3); X.P.mark('loaded'); X.P.mark('warmed'); X.P.mark('shown'); X.add(2); for(let i=0;i<700;i++) X.step(16);
  const c=X.P.log[0], ln=X.P.line(c||{});
  check('4. 換區域丟掉舊區域 9 個 shader、新編 3 個：黑畫面 +3、淡入後 +2（不是 +-6）',!!c&&/shader 黑畫面 \+3、淡入後 \+2$/.test(ln)&&!/\+-/.test(ln),ln); }
{ const mk=tag=>({tagName:tag,style:{},children:[],textContent:'',appendChild(x){ this.children.push(x); return x; },set id(v){ this._id=v; els[v]=this; },get id(){ return this._id; }}); const els={};
  const doc={body:mk('body'),createElement:mk,getElementById:k=>els[k]||null}; doc.body.appendChild=function(x){ this.children.push(x); return x; };
  const X=load('?perf',doc); for(let k=0;k<5;k++){ X.P.mark('start','z'+k); X.P.mark('shown'); for(let i=0;i<700;i++) X.step(16); }
  const d=els.perfPanel, b=els.perfPanelCopy, t=els.perfPanelText, css=(d&&d.style.cssText)||'';
  check('5. 小框不吃點擊（pointer-events:none）、「複製」可以按、在小地圖下面（橫向 top+142 px）',!!d&&/pointer-events:none/.test(css)&&!!b&&/pointer-events:auto/.test(b.style.cssText)&&/\+ 142px/.test(d.style.top||''),JSON.stringify({css,top:d&&d.style.top}));
  const lines=(t&&t.textContent||'').split('\n').filter(x=>/：黑畫面/.test(x));
  check('5. 畫面上最多 3 筆（共 5 筆＝多一行「按複製拿全部」）；複製的文字照舊 5 筆',lines.length===3&&/共 5 筆/.test(t.textContent)&&X.P.text().split('\n').length===6,t&&t.textContent); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

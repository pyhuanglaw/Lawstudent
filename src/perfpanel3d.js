/* 換場景卡頓的量測小面板（PERF-ZONE-ENTER-1018，LAWWW-B 2026-10-30）：網址加 ?perf 才有。
   給使用者在自己的電腦、手機上開一次，回報到底卡在哪裡（LAWWW2 第三輪：SwiftShader 模擬量不準，要實機數字）。
   每次換區域記：黑畫面多久（開始 → 淡入）、裡面兩段（建區域、預熱 shader）、淡入以後 10 秒內最長的一格與卡（> 0.1 秒）的次數、
   黑畫面裡和淡入以後各新編幾個 shader。最近 8 次記下來，小地圖下面的小框列最近 3 次，按「複製」拿全部（第一行是瀏覽器）；小框不吃點擊。
   game3d.js 的 enter() 在四個時間點叫 PERFPANEL.mark：start、loaded、warmed、shown。沒有 ?perf 時 mark 直接回去，什麼都不做。 */
'use strict';
const PERFPANEL=(()=>{
  const S={ on:typeof location!=='undefined'&&/[?&]perf\b/.test(location.search||''), log:[], cur:null, MAX:8, WATCH:10000 };
  const now=()=>(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
  const raf=f=>(typeof requestAnimationFrame==='function'?requestAnimationFrame(f):setTimeout(()=>f(now()),16));
  /* 新編了幾個 shader：數「沒看過的 program」（照物件本身記），只會增加（BB-B 10-31 n26：原本拿 renderer.info.programs 的長度相減，換區域時舊區域的 shader 被丟掉，黑畫面那一欄算出 +-6）*/
  const seen=typeof WeakSet==='function'?new WeakSet():null; let made=0;
  const progs=()=>{ const R=typeof GAME!=='undefined'&&GAME&&GAME.E&&GAME.E.renderer, L=R&&R.info&&R.info.programs; if(!L) return made; for(const p of L){ if(p&&typeof p==='object'&&seen){ if(!seen.has(p)){ seen.add(p); made++; } } } return made; };
  S.mark=function(k,zone){ if(!S.on) return; const t=now();
    if(k==='start'){ S.cur={zone:zone||'?',t0:t,p0:progs()}; return; }
    const c=S.cur; if(!c) return; c[k]=t;
    if(k!=='shown') return;
    S.cur=null; c.pShown=progs(); c.maxGap=0; c.gaps=0; const end=t+S.WATCH; let last=t;
    const tick=ts=>{ const g=ts-last; last=ts; if(g>c.maxGap) c.maxGap=g; if(g>100) c.gaps++; progs(); if(ts<end) raf(tick); else { c.pEnd=progs(); S.push(c); } };   /* 每格都數一次：編了又丟掉的也算到 */
    raf(tick); };
  S.push=function(c){ S.log.unshift(c); if(S.log.length>S.MAX) S.log.length=S.MAX; S.draw(); };
  const sec=ms=>((ms||0)/1000).toFixed(1);
  S.line=c=>c.zone+'：黑畫面 '+sec(c.shown-c.t0)+' 秒（建區域 '+sec((c.loaded||c.t0)-c.t0)+'、預熱 '+sec((c.warmed||c.loaded||c.t0)-(c.loaded||c.t0))+'）；'
    +'淡入後 10 秒最長一格 '+((c.maxGap||0)/1000).toFixed(2)+' 秒、卡 '+(c.gaps|0)+' 次；shader 黑畫面 +'+((c.pShown|0)-(c.p0|0))+'、淡入後 +'+((c.pEnd|0)-(c.pShown|0));
  S.text=()=>[typeof navigator!=='undefined'?navigator.userAgent:''].concat(S.log.map(S.line)).join('\n');
  S.SHOW=3;   /* 畫面上只列最近 3 筆（橫向的手機高度只有 390 px），按「複製」拿全部 */
  S.draw=function(){ if(typeof document==='undefined'||!document.body) return; let d=document.getElementById('perfPanel'), t, b;
    /* 放在小地圖下面、不吃點擊（BB-B 10-31 n26：原本在右上角 (318,6)～(838,98)，橫向時蓋住手機鈕、選單鈕，按不到）；只有「複製」那一小塊可以按 */
    const port=typeof innerHeight==='number'&&typeof innerWidth==='number'&&innerHeight>innerWidth;
    if(!d){ d=document.createElement('div'); d.id='perfPanel';
      d.style.cssText='position:fixed;right:max(10px,env(safe-area-inset-right));z-index:60;max-width:min(46vw,380px);background:rgba(20,24,30,.78);color:#fff;font:10px/1.4 monospace;padding:4px 6px;border-radius:6px;white-space:pre-wrap;pointer-events:none';
      t=document.createElement('div'); t.id='perfPanelText'; d.appendChild(t);
      b=document.createElement('button'); b.id='perfPanelCopy'; b.textContent='複製'; b.style.cssText='pointer-events:auto;margin-top:3px;font:11px sans-serif;padding:2px 8px;border-radius:4px;border:1px solid #888;background:#333;color:#fff';
      b.onclick=()=>{ try{ navigator.clipboard.writeText(S.text()); b.textContent='已複製'; setTimeout(()=>{ b.textContent='複製'; },900); }catch(e){} };
      d.appendChild(b); document.body.appendChild(d); }
    d.style.top='calc(max(8px,env(safe-area-inset-top)) + '+(port?200:142)+'px)';   /* 小地圖：橫向 top+54、直向 top+112，高 80 px（index.html #minimap）*/
    t=t||document.getElementById('perfPanelText')||d; const sh=S.log.slice(0,S.SHOW).map(S.line);
    t.textContent='換場景量測（?perf）\n'+sh.join('\n')+(S.log.length>S.SHOW?'\n（共 '+S.log.length+' 筆，按複製拿全部）':''); };
  return S;
})();

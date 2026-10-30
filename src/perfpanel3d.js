/* 換場景卡頓的量測小面板（PERF-ZONE-ENTER-1018，LAWWW-B 2026-10-30）：網址加 ?perf 才有。
   給使用者在自己的電腦、手機上開一次，回報到底卡在哪裡（LAWWW2 第三輪：SwiftShader 模擬量不準，要實機數字）。
   每次換區域記：黑畫面多久（開始 → 淡入）、裡面兩段（建區域、預熱 shader）、淡入以後 10 秒內最長的一格與卡（> 0.1 秒）的次數、
   黑畫面裡和淡入以後各新編幾個 shader。最近 8 次列在右上角的小框，按一下複製成文字（第一行是瀏覽器）。
   game3d.js 的 enter() 在四個時間點叫 PERFPANEL.mark：start、loaded、warmed、shown。沒有 ?perf 時 mark 直接回去，什麼都不做。 */
'use strict';
const PERFPANEL=(()=>{
  const S={ on:typeof location!=='undefined'&&/[?&]perf\b/.test(location.search||''), log:[], cur:null, MAX:8, WATCH:10000 };
  const now=()=>(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
  const raf=f=>(typeof requestAnimationFrame==='function'?requestAnimationFrame(f):setTimeout(()=>f(now()),16));
  const progs=()=>{ const R=typeof GAME!=='undefined'&&GAME&&GAME.E&&GAME.E.renderer; return R&&R.info&&R.info.programs?R.info.programs.length:0; };
  S.mark=function(k,zone){ if(!S.on) return; const t=now();
    if(k==='start'){ S.cur={zone:zone||'?',t0:t,p0:progs()}; return; }
    const c=S.cur; if(!c) return; c[k]=t;
    if(k!=='shown') return;
    S.cur=null; c.pShown=progs(); c.maxGap=0; c.gaps=0; const end=t+S.WATCH; let last=t;
    const tick=ts=>{ const g=ts-last; last=ts; if(g>c.maxGap) c.maxGap=g; if(g>100) c.gaps++; if(ts<end) raf(tick); else { c.pEnd=progs(); S.push(c); } };
    raf(tick); };
  S.push=function(c){ S.log.unshift(c); if(S.log.length>S.MAX) S.log.length=S.MAX; S.draw(); };
  const sec=ms=>((ms||0)/1000).toFixed(1);
  S.line=c=>c.zone+'：黑畫面 '+sec(c.shown-c.t0)+' 秒（建區域 '+sec((c.loaded||c.t0)-c.t0)+'、預熱 '+sec((c.warmed||c.loaded||c.t0)-(c.loaded||c.t0))+'）；'
    +'淡入後 10 秒最長一格 '+((c.maxGap||0)/1000).toFixed(2)+' 秒、卡 '+(c.gaps|0)+' 次；shader 黑畫面 +'+((c.pShown|0)-(c.p0|0))+'、淡入後 +'+((c.pEnd|0)-(c.pShown|0));
  S.text=()=>[typeof navigator!=='undefined'?navigator.userAgent:''].concat(S.log.map(S.line)).join('\n');
  S.draw=function(){ if(typeof document==='undefined'||!document.body) return; let d=document.getElementById('perfPanel');
    if(!d){ d=document.createElement('div'); d.id='perfPanel';
      d.style.cssText='position:fixed;right:6px;top:calc(6px + env(safe-area-inset-top));z-index:60;max-width:min(92vw,520px);background:rgba(20,24,30,.84);color:#fff;font:11px/1.45 monospace;padding:6px 8px;border-radius:6px;white-space:pre-wrap;cursor:pointer';
      d.onclick=()=>{ try{ navigator.clipboard.writeText(S.text()); d.style.outline='2px solid #8f8'; setTimeout(()=>{ d.style.outline=''; },600); }catch(e){} };
      document.body.appendChild(d); }
    d.textContent='換場景量測（?perf，按一下複製）\n'+S.log.map(S.line).join('\n'); };
  return S;
})();

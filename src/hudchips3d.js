/* ===== 左上角那幾條（HUD-LANDSCAPE-COMPACT-1112）=====
   使用者 2026-11-12：「手機上玩 左上角的那幾個都快擋住一半」。版面在 index.html（橫向：@media (orientation:landscape) and (max-height:500px)；直向：@media (orientation:portrait)）。
   這裡只做兩件事：
     1. 目標（#goal）在手機上只留一行，被省略的字點一下展開成完整幾行；再點一下、或 4 秒後收回（加減 .open，樣式在 index.html）。
     2. 直向時金額在第一列右邊、按鈕在第二列右邊：量金額那一顆的寬（--moneyW）和按鈕那一排的寬（--hudRw），左邊的時間、下一堂照這兩個數字讓位。
        金額變了、轉向都重量（ResizeObserver；沒有就退回預設值，index.html 的 var(--moneyW,84px)、var(--hudRw,200px)）。
   不碰遊戲狀態、不寫任何玩家看得到的字。*/
const HUDCHIPS=(function(){ 'use strict';
  const S={ OPEN_MS:4000, timer:null };
  const $=id=>typeof document!=='undefined'&&document.getElementById?document.getElementById(id):null;
  S.isOpen=function(){ const g=$('goal'); return !!(g&&g.classList&&g.classList.contains('open')); };
  S.close=function(){ if(S.timer){ clearTimeout(S.timer); S.timer=null; } const g=$('goal'); if(g&&g.classList) g.classList.remove('open'); };
  S.open=function(){ const g=$('goal'); if(!g||!g.classList) return false; g.classList.add('open'); if(S.timer) clearTimeout(S.timer); S.timer=setTimeout(S.close,S.OPEN_MS); return true; };
  S.toggle=function(){ if(S.isOpen()){ S.close(); return false; } return S.open(); };
  /* 量右上角：金額那一顆、按鈕那一排（寬度 0＝還沒顯示，不寫） */
  S.measure=function(){ const ui=$('ui'), r=$('hudR'), m=$('money'); if(!ui||!ui.style||!ui.style.setProperty) return null; const out={};
    const chip=m&&m.parentNode; const mw=chip?chip.offsetWidth:0; if(mw>0){ ui.style.setProperty('--moneyW',mw+'px'); out.moneyW=mw; }
    const rw=r?r.offsetWidth:0; if(rw>0){ ui.style.setProperty('--hudRw',rw+'px'); out.hudRw=rw; } return out; };
  S.bind=function(){ const g=$('goal'); if(!g||!g.addEventListener||S.bound) return false; S.bound=true;
    g.addEventListener('click',ev=>{ if(ev&&ev.stopPropagation) ev.stopPropagation(); S.toggle(); });
    g.addEventListener('pointerup',ev=>{ if(ev&&ev.stopPropagation) ev.stopPropagation(); });   /* 劇情對話中點這一條不要順便翻下一句（同 💾、一鍵）*/
    try{ S.measure();
      if(typeof ResizeObserver!=='undefined'){ const ro=new ResizeObserver(()=>S.measure()); const m=$('money'); if(m&&m.parentNode) ro.observe(m.parentNode); const r=$('hudR'); if(r) ro.observe(r); S.ro=ro; }
      if(typeof window!=='undefined'&&window.addEventListener){ window.addEventListener('resize',()=>S.measure()); window.addEventListener('orientationchange',()=>setTimeout(S.measure,60)); }
    }catch(e){ console.warn('HUDCHIPS.measure',e); }
    return true; };
  if(typeof document!=='undefined'&&document.getElementById&&document.getElementById('goal')) S.bind();
  return S;
})();

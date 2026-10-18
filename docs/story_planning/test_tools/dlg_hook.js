// BB 台詞對照：記下遊戲裡實際出現的每一句對話與選項（只在 BB 本機測試用，不進遊戲）
(function(){
  let last='';
  function meta(){ try{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {d:d.key,h:Math.round(G.hour*100)/100,z:G.zone,ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null}; }catch(e){ return {}; } }
  function grab(){ try{
    if(typeof GAME==='undefined'||!GAME.D||!GAME.D.active) return;
    const full=GAME.D.full||''; const nm=(document.getElementById('dlgName')||{}).textContent||'';
    const k=nm+'|'+full; if(!full||k===last) return; last=k;
    console.log('BBDLG '+JSON.stringify(Object.assign({who:nm,t:full},meta())));
  }catch(e){} }
  function grabCh(){ try{ const bs=[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim()); if(!bs.length) return; const k='CH|'+bs.join('|'); if(k===last) return; last=k; console.log('BBDLG '+JSON.stringify(Object.assign({who:'(選項)',t:bs.join(' ／ ')},meta()))); }catch(e){} }
  document.addEventListener('DOMContentLoaded',()=>{
    const t=document.getElementById('dlgText'), c=document.getElementById('choices');
    if(t) new MutationObserver(grab).observe(t,{childList:true,characterData:true,subtree:true});
    if(c) new MutationObserver(grabCh).observe(c,{childList:true,subtree:true});
  });
})();

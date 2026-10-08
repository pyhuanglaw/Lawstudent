/* ===== ADV MODE（2D Visual Novel 演出層）
   3D EXPLORATION → EVENT TRIGGER → ADV.begin() → 背景（freeze / blur / image）→ 立繪（左右）→ 對話／選項（共用 GM.say / GM.choose）→ ADV.end() → 回到 3D
   立繪由 PortraitRegistry（data/characters.js 的 PORTRAITS）解析；圖片不存在時 fallback：expression → 同服裝 neutral → default → PLACEHOLDER_2D_PORTRAIT（名稱＋輪廓＋表情名）。
   正式立繪未來由外部圖片資產提供（見 CHARACTER_ART_SPEC.md），不修改此引擎。 ===== */
'use strict';
const ADV = (function(){
  const A={active:false,slots:{left:null,right:null},history:[],bgMode:null,cache:{},missing:{}};
  const $=id=>document.getElementById(id);
  function el(tag,cls,parent){ const e=document.createElement(tag); if(cls) e.className=cls; if(parent) parent.appendChild(e); return e; }
  A.init=function(){ if(A.root) return; const css=document.createElement('style'); css.textContent=`
#adv{position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;transition:opacity .35s}
#adv.on{opacity:1}
#advBg{position:absolute;inset:0;background:rgba(10,12,18,.28);backdrop-filter:blur(0px);-webkit-backdrop-filter:blur(0px);transition:backdrop-filter .4s,background .4s}
#adv.blur #advBg{backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);background:rgba(10,12,18,.38)}
#adv.image #advBg{background-size:cover;background-position:center}
#adv.freeze #advBg{background:rgba(0,0,0,0)}
.advSlot{position:absolute;bottom:0;height:min(88%,calc(100% - 20px));width:42%;display:flex;align-items:flex-end;justify-content:center;transition:filter .3s,opacity .3s,transform .35s;transform:translateY(12px);opacity:0}
.advSlot.show{transform:translateY(0);opacity:1}
.advSlot.dim{filter:brightness(.55) saturate(.8)}
#advL{left:2%}#advR{right:2%}
.advSlot img{height:100%;max-width:100%;object-fit:contain;object-position:top;transition:opacity .18s;filter:drop-shadow(0 6px 14px rgba(0,0,0,.35))}
#advDev{position:absolute;right:max(10px,env(safe-area-inset-right));top:calc(max(8px,env(safe-area-inset-top)) + 44px);background:rgba(233,185,106,.9);color:#1c1a17;font:10px/1.35 ui-monospace,monospace;padding:4px 7px;border-radius:6px;display:none;pointer-events:none}
#adv.dev.compact #advDev{display:block}
.ph{height:78%;aspect-ratio:3/5;max-width:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;position:relative;padding-top:8%}
.ph .sil{position:absolute;left:14%;right:14%;bottom:0;top:14%;background:#2a2d36;border-radius:46% 46% 8% 8%/28% 28% 6% 6%;opacity:.72}
.ph .sil:before{content:"";position:absolute;left:50%;top:0;width:36%;aspect-ratio:1/1.15;transform:translate(-50%,-38%);background:#2a2d36;border-radius:50% 50% 46% 46%;opacity:.95}
.ph.f .sil:before{width:38%}
.ph .tag{position:relative;z-index:1;background:rgba(233,185,106,.92);color:#1c1a17;font:10px/1.35 ui-monospace,monospace;padding:5px 7px;border-radius:8px;margin-top:6px;text-align:center;letter-spacing:.02em}
.ph .name{position:relative;z-index:1;color:#f4efe6;font-size:15px;text-shadow:0 2px 6px rgba(0,0,0,.6)}
#advTop{position:absolute;left:50%;top:max(8px,env(safe-area-inset-top));transform:translateX(-50%);display:flex;gap:8px;pointer-events:auto}
#advTop button{min-height:34px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(20,22,28,.75);color:#e8e2d6;font-size:12px}
#advHist{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,calc(100% - 28px));max-height:70%;overflow:auto;background:rgba(20,22,28,.96);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:12px 16px;color:#f4efe6;font-size:14px;line-height:1.6;pointer-events:auto;display:none}
#advHist b{color:#e9b96a;font-weight:500;margin-right:6px}
.adv-on #choices{right:auto;left:max(14px,env(safe-area-inset-left));bottom:calc(max(14px,env(safe-area-inset-bottom)) + 118px)}
.adv-on.spriteLeft #choices{left:auto;right:max(14px,env(safe-area-inset-right))}
.adv-on #dlg{z-index:6}
@media (orientation:portrait){.advSlot{width:100%;height:calc(100% - 150px - max(8px,env(safe-area-inset-top)));top:calc(max(8px,env(safe-area-inset-top)) + 40px);bottom:auto;align-items:flex-start}#advL{left:0}#advR{right:0}.adv-on #choices{bottom:calc(max(14px,env(safe-area-inset-bottom)) + 130px);width:calc(100% - 28px)}}
@media (orientation:landscape){.advSlot{height:100%;bottom:0;align-items:flex-start;padding-top:6px;overflow:hidden}.advSlot img{height:132%}}`;
    document.head.appendChild(css); const root=el('div','',document.body); root.id='adv'; A.root=root; const bg=el('div','',root); bg.id='advBg'; A.bg=bg; const L=el('div','advSlot',root); L.id='advL'; const R=el('div','advSlot',root); R.id='advR'; A.L=L; A.R=R; const top=el('div','',root); top.id='advTop'; const bh=el('button','',top); bh.textContent='紀錄'; bh.onclick=()=>A.toggleHistory(); const bs=el('button','',top); bs.textContent='略過對話'; bs.onclick=()=>{ A.skip=true; if(window.GAME&&GAME.dlgAdvance) GAME.dlgAdvance(); }; const hist=el('div','',root); hist.id='advHist'; A.hist=hist; hist.onclick=()=>A.toggleHistory(); const dev=el('div','',root); dev.id='advDev'; A.dev=dev; A.devMode=/[?&](dev|mdbg|debug)\b/.test(location.search); // dlg 要在 adv 之上
    const dlg=$('dlg'); if(dlg) dlg.style.zIndex=6; const ch=$('choices'); if(ch) ch.style.zIndex=6; };
  // ---- 立繪解析（fallback 鏈）----
  // ---- Portrait coverage：只有實際存在（PORTRAIT_FILES manifest）的檔案才算 production ----
  const FILES=()=>(typeof PORTRAIT_FILES!=='undefined')?PORTRAIT_FILES:{};
  A.hasProductionPortrait=function(charId){ const f=FILES()[charId]; if(!f) return false; for(const o in f){ if(f[o]&&f[o].length) return true; } return false; };
  A.portraitQuality=function(charId){ if(A.hasProductionPortrait(charId)) return 'production'; if(typeof PORTRAIT_TEMP!=='undefined'&&PORTRAIT_TEMP[charId]) return 'temporary'; return 'missing'; };
  A.resolve=function(charId,outfit,expression){ const P=(typeof PORTRAITS!=='undefined')&&PORTRAITS[charId]; if(!P) return {placeholder:true,charId,expression,quality:'missing',chain:[]}; outfit=outfit||P.defaultOutfit; const f=FILES()[charId]||{}; const has=(o,e)=>!!(f[o]&&f[o].includes(e)); const chain=[]; const base='assets/portraits/'+charId+'/';
    if(has(outfit,expression)) chain.push(base+outfit+'/'+expression+'.webp'); if(has(outfit,'neutral')) chain.push(base+outfit+'/neutral.webp'); if(outfit!==P.defaultOutfit){ if(has(P.defaultOutfit,expression)) chain.push(base+P.defaultOutfit+'/'+expression+'.webp'); if(has(P.defaultOutfit,'neutral')) chain.push(base+P.defaultOutfit+'/neutral.webp'); } for(const o in f){ if(f[o].includes('neutral')&&!chain.includes(base+o+'/neutral.webp')) chain.push(base+o+'/neutral.webp'); }
    return {chain,charId,expression,outfit,placeholder:chain.length===0,quality:chain.length?'production':A.portraitQuality(charId),P}; };
  function loadImage(url){ if(A.cache[url]) return A.cache[url]; if(A.missing[url]) return Promise.reject(new Error('missing')); const p=new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>{ A.missing[url]=true; delete A.cache[url]; rej(new Error('404 '+url)); }; im.src=url; }); A.cache[url]=p; return p; }
  A.preload=function(charIds){ for(const id of charIds||[]){ const r=A.resolve(id,null,'neutral'); if(r.chain) for(const u of r.chain){ if(!A.missing[u]) loadImage(u).catch(()=>{}); } } };
  async function render(slot,charId,expression,outfit){ const box=slot==='left'?A.L:A.R; const r=A.resolve(charId,outfit,expression); let name=(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(charId):((CHARACTERS[charId]||{}).name||charId); const cc=CHARACTERS[charId]; if(cc&&cc.nickname&&name===cc.name) name=cc.nickname;
    let img=null; if(!r.placeholder){ for(const u of r.chain){ if(A.missing[u]) continue; try{ img=await loadImage(u); break; }catch(e){ if(!A.warned) console.warn('portrait missing → fallback',u); } } }
    if(A.slots[slot]&&A.slots[slot].charId!==charId) box.innerHTML='';
    if(img){ let cur=box.querySelector('img'); if(!cur){ box.innerHTML=''; cur=el('img','',box); } if(cur.src!==img.src){ cur.style.opacity=0; setTimeout(()=>{ cur.src=img.src; cur.style.opacity=1; },120); } }
    else { // 沒有正式立繪：compact 對話模式（模糊 3D 背景＋姓名＋對話框），不顯示灰色 silhouette；dev 模式才顯示 missing 標籤
      box.innerHTML=''; box.classList.remove('show'); A.slots[slot]={charId,expression,outfit,compact:true}; const anyShown=['left','right'].some(k=>A.slots[k]&&!A.slots[k].compact); A.root.classList.toggle('compact',!anyShown); if(A.devMode){ A.root.classList.add('dev'); A.dev.textContent='MISSING_PORTRAIT '+charId+' · '+(outfit||'campus')+' · '+(expression||'neutral'); } return; }
    A.slots[slot]={charId,expression,outfit}; box.classList.add('show'); A.root.classList.remove('compact'); }
  // ---- 進入／離開 ----
  A.begin=function(opts){ opts=opts||{}; A.init(); A.active=true; A.skip=false; const bgMode=opts.background||'blur'; A.bgMode=bgMode; A.root.className='on '+(typeof bgMode==='object'?'image':bgMode); if(typeof bgMode==='object'&&bgMode.image){ A.bg.style.backgroundImage='url('+bgMode.image+')'; loadImage(bgMode.image).catch(()=>{ A.root.className='on blur'; A.bg.style.backgroundImage=''; }); } else A.bg.style.backgroundImage=''; document.body.classList.add('adv-on'); document.body.classList.toggle('spriteLeft',opts.mainSide==='left'); A.root.classList.remove('compact'); A.root.classList.remove('dev'); A.L.classList.remove('show'); A.R.classList.remove('show'); A.L.innerHTML=''; A.R.innerHTML=''; A.slots={left:null,right:null}; if(opts.left) A.show('left',opts.left.charId||opts.left,opts.left.expression,opts.left.outfit); if(opts.right) A.show('right',opts.right.charId||opts.right,opts.right.expression,opts.right.outfit); if(opts.cg&&typeof CG_REGISTRY!=='undefined'&&CG_REGISTRY[opts.cg]){ A.cg(opts.cg); } };
  A.end=function(){ if(!A.active) return; A.active=false; A.root.className=''; if(A.dev) A.dev.textContent=''; document.body.classList.remove('adv-on'); document.body.classList.remove('spriteLeft'); A.L.classList.remove('show'); A.R.classList.remove('show'); A.hist.style.display='none'; setTimeout(()=>{ if(!A.active){ A.L.innerHTML=''; A.R.innerHTML=''; A.bg.style.backgroundImage=''; } },400); };
  A.show=function(slot,charId,expression,outfit){ if(!A.active) return; render(slot,charId,expression||'neutral',outfit); };
  A.hide=function(slot){ const box=slot==='left'?A.L:A.R; box.classList.remove('show'); A.slots[slot]=null; };
  // 說話者高亮：另一側變暗
  A.speaker=function(charId,expression,outfit){ if(!A.active) return; let slot=null; for(const s of ['left','right']){ if(A.slots[s]&&A.slots[s].charId===charId) slot=s; } if(!slot&&charId&&charId!=='player'&&charId!=='narrator'){ slot=A.slots.right?(A.slots.left?'right':'left'):'right'; render(slot,charId,expression||'neutral',outfit); } else if(slot){ render(slot,charId,expression||A.slots[slot].expression||'neutral',outfit||A.slots[slot].outfit); } for(const s of ['left','right']){ const box=s==='left'?A.L:A.R; box.classList.toggle('dim',!!(A.slots[s]&&slot&&s!==slot)); if(!slot) box.classList.remove('dim'); } };
  A.log=function(name,text){ A.history.push({name,text}); if(A.history.length>60) A.history.shift(); };
  A.toggleHistory=function(){ const h=A.hist; if(h.style.display==='block'){ h.style.display='none'; return; } h.innerHTML=A.history.map(x=>'<div>'+(x.name?'<b>'+x.name+'</b>':'')+x.text+'</div>').join('')||'<div>（還沒有對話）</div>'; h.style.display='block'; h.scrollTop=h.scrollHeight; };
  // Event CG：稀有；不存在時自動退回一般 ADV
  A.cg=function(cgId){ const reg=(typeof CG_REGISTRY!=='undefined')?CG_REGISTRY[cgId]:null; if(!reg) return false; loadImage(reg.file).then(()=>{ A.root.className='on image'; A.bg.style.backgroundImage='url('+reg.file+')'; A.L.classList.remove('show'); A.R.classList.remove('show'); if(window.GAME&&GAME.G){ GAME.G.cg=GAME.G.cg||{unlocked:[]}; if(!GAME.G.cg.unlocked.includes(cgId)) GAME.G.cg.unlocked.push(cgId); } }).catch(()=>{ /* fallback：維持一般 ADV */ }); return true; };
  return A;
})();
// Event CG 登錄（檔案尚未提供；解鎖狀態存於 G.cg.unlocked）
const CG_REGISTRY={ cg_library_rain_heroine03:{file:'assets/cg/heroine_03/event_rain_library.webp',title:'雨天的總圖門口'}, cg_cafe_dusk_heroine01:{file:'assets/cg/heroine_01/event_cafe_dusk.webp',title:'兩點半的黃昏'} };

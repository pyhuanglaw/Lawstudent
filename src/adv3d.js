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
#adv.dark #advBg{background:#15171d;backdrop-filter:none;-webkit-backdrop-filter:none}   /* 出遊（離開 3D 地圖的地方）：2D 背景還沒有圖時的深色底（MISSING_EXTERNAL_ART）*/
#advCg{position:absolute;inset:0;display:none;background-repeat:no-repeat;background-position:center;background-size:cover}
#adv.cg #advCg{display:block}
#adv.cg #advBg{filter:blur(18px) brightness(.6);transform:scale(1.1)}
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
#advTop{position:fixed;left:50%;top:max(8px,env(safe-area-inset-top));transform:translateX(-50%);display:flex;gap:8px;pointer-events:auto;z-index:7}body:not(.adv-on) #advTop{display:none}
#advTop button{min-height:34px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(20,22,28,.75);color:#e8e2d6;font-size:12px}
#advHist{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,calc(100% - 28px));max-height:70%;overflow:auto;background:rgba(20,22,28,.96);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:12px 16px;color:#f4efe6;font-size:14px;line-height:1.6;pointer-events:auto;display:none}
#advHist b{color:#e9b96a;font-weight:500;margin-right:6px}
.adv-on #choices{right:auto;left:max(14px,env(safe-area-inset-left));bottom:calc(max(14px,env(safe-area-inset-bottom)) + 118px);max-height:calc(100% - 118px - max(14px,env(safe-area-inset-bottom)) - 58px - env(safe-area-inset-top))}
.adv-on.spriteLeft #choices{left:auto;right:max(14px,env(safe-area-inset-right))}
.adv-on #dlg{z-index:6}
.adv-on:has(#dlg.hide) #choices{bottom:calc(max(14px,env(safe-area-inset-bottom)) + 8px);max-height:calc(100% - max(14px,env(safe-area-inset-bottom)) - 8px - 58px - env(safe-area-inset-top))}
@media (orientation:portrait){#adv.cg #advCg{background-size:contain;background-position:center 40%}.advSlot{width:100%;height:calc(100% - 150px - max(8px,env(safe-area-inset-top)));top:calc(max(8px,env(safe-area-inset-top)) + 40px);bottom:auto;align-items:flex-start}#advL{left:0}#advR{right:0}.adv-on #choices{bottom:calc(max(14px,env(safe-area-inset-bottom)) + 130px);width:calc(100% - 28px)}}
@media (orientation:landscape){.adv-on #choices:has(button:nth-child(4)){display:grid;grid-template-columns:1fr 1fr;align-content:end;width:calc(100% - 28px);max-width:860px}.advSlot{height:100%;bottom:0;align-items:flex-start;padding-top:6px;overflow:hidden}.advSlot img{height:132%}}`;
    document.head.appendChild(css); const root=el('div','',document.body); root.id='adv'; A.root=root; const bg=el('div','',root); bg.id='advBg'; A.bg=bg; const cgEl=el('div','',root); cgEl.id='advCg'; A.cgEl=cgEl; const L=el('div','advSlot',root); L.id='advL'; const R=el('div','advSlot',root); R.id='advR'; A.L=L; A.R=R; const top=el('div','',root); top.id='advTop'; const bh=el('button','',top); bh.textContent='紀錄'; bh.onclick=()=>A.toggleHistory(); const bs=el('button','',top); bs.textContent='略過對話'; bs.onclick=()=>{ A.skip=true; if(window.GAME&&GAME.dlgAdvance) GAME.dlgAdvance(); }; document.body.appendChild(top);   /* 2026-10-18 使用者：「略過對話沒辦法按」——按鈕原本在 #adv（z-index 5）裡面，壓在對話框、選項（6）底下；而且 A.skip 沒有人讀，按了只翻一句。改成放在最上層，game3d.js 的 say 讀 A.skip 一路翻到下一個選項 */ const hist=el('div','',root); hist.id='advHist'; A.hist=hist; hist.onclick=()=>A.toggleHistory(); const dev=el('div','',root); dev.id='advDev'; A.dev=dev; A.devMode=/[?&](dev|mdbg|debug)\b/.test(location.search); // dlg 要在 adv 之上
    const dlg=$('dlg'); if(dlg) dlg.style.zIndex=6; const ch=$('choices'); if(ch) ch.style.zIndex=6; };
  // ---- 立繪解析（fallback 鏈）----
  // ---- Portrait coverage：只有實際存在（PORTRAIT_FILES manifest）的檔案才算 production ----
  const FILES=()=>(typeof PORTRAIT_FILES!=='undefined')?PORTRAIT_FILES:{};
  A.hasProductionPortrait=function(charId){ const f=FILES()[charId]; if(!f) return false; for(const o in f){ if(f[o]&&f[o].length) return true; } return false; };
  A.portraitQuality=function(charId){ if(A.hasProductionPortrait(charId)) return 'production'; if(typeof PORTRAIT_TEMP!=='undefined'&&PORTRAIT_TEMP[charId]) return 'temporary'; return 'missing'; };
  /* characters.js 只登錄有 portrait 欄位的人（五位女主角）；其他人有立繪檔（PORTRAIT_FILES，BB_131 對照的 10/14 確認圖，LAWWW2-B 去背 8fbe1e1）就照檔案補登錄 */
  const regFromFiles=id=>{ if(typeof PORTRAITS==='undefined'||PORTRAITS[id]||!FILES()[id]||typeof CHARACTERS==='undefined'||!CHARACTERS[id]) return; const c=CHARACTERS[id]; const o={}; for(const of in FILES()[id]){ o[of]={}; for(const ex of FILES()[id][of]) o[of][ex]='assets/portraits/'+id+'/'+of+'/'+ex+'.webp'; } PORTRAITS[id]={characterId:id,displayName:c.name,tier:c.visual_tier||1,defaultOutfit:'campus',defaultPortrait:'assets/portraits/'+id+'/campus/neutral.webp',outfits:o,silhouette:c.gender==='f'?'f':'m'}; };
  A.resolve=function(charId,outfit,expression){ regFromFiles(charId); if(!outfit&&charId==='heroine_02'&&typeof STORY!=='undefined'&&STORY.schedEnt&&typeof GAME!=='undefined'&&GAME.G&&typeof CHARACTERS!=='undefined'){ try{ const e=STORY.schedEnt(CHARACTERS.heroine_02,GAME.G); if(e&&e.act==='barista') outfit='cafe'; }catch(err){} }   /* 芷若在兩點半當班：圍裙版立繪（LAWWW2-B 212c4aa，BB-B 驗收後的修改）*/ const P=(typeof PORTRAITS!=='undefined')&&PORTRAITS[charId]; if(!P) return {placeholder:true,charId,expression,quality:'missing',chain:[]}; outfit=outfit||P.defaultOutfit; const f=FILES()[charId]||{}; const has=(o,e)=>!!(f[o]&&f[o].includes(e)); const chain=[]; const base='assets/portraits/'+charId+'/';
    if(has(outfit,expression)) chain.push(base+outfit+'/'+expression+'.webp'); if(has(outfit,'neutral')) chain.push(base+outfit+'/neutral.webp'); if(outfit!==P.defaultOutfit){ if(has(P.defaultOutfit,expression)) chain.push(base+P.defaultOutfit+'/'+expression+'.webp'); if(has(P.defaultOutfit,'neutral')) chain.push(base+P.defaultOutfit+'/neutral.webp'); } for(const o in f){ if(f[o].includes('neutral')&&!chain.includes(base+o+'/neutral.webp')) chain.push(base+o+'/neutral.webp'); }
    return {chain,charId,expression,outfit,placeholder:chain.length===0,quality:chain.length?'production':A.portraitQuality(charId),P}; };
  /* 立繪、背景、CG 的快取有上限（P0 BUG-IOS-RELOAD：原本每張看過的圖都留在記憶體，玩久了 iPhone 被踢回標題）：最近用過的 16 張，超過就丟最舊的（畫面上正在顯示的不受影響，要用時重新載） */
  const CACHE_MAX=16, cacheOrder=[];
  function touchCache(url){ const i=cacheOrder.indexOf(url); if(i>=0) cacheOrder.splice(i,1); cacheOrder.push(url); while(cacheOrder.length>CACHE_MAX){ const old=cacheOrder.shift(); delete A.cache[old]; } }
  function loadImage(url){ if(A.cache[url]){ touchCache(url); return A.cache[url]; } if(A.missing[url]) return Promise.reject(new Error('missing')); const p=new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=()=>{ A.missing[url]=true; delete A.cache[url]; const i=cacheOrder.indexOf(url); if(i>=0) cacheOrder.splice(i,1); rej(new Error('404 '+url)); }; im.src=url; }); A.cache[url]=p; touchCache(url); return p; }
  A._cacheSize=()=>cacheOrder.length;
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
  A.end=function(){ if(!A.active) return; A.active=false; A.root.className=''; if(A.dev) A.dev.textContent=''; document.body.classList.remove('adv-on'); document.body.classList.remove('spriteLeft'); A.L.classList.remove('show'); A.R.classList.remove('show'); A.hist.style.display='none'; setTimeout(()=>{ if(!A.active){ A.L.innerHTML=''; A.R.innerHTML=''; A.bg.style.backgroundImage=''; if(A.cgEl) A.cgEl.style.backgroundImage=''; } },400); };
  A.show=function(slot,charId,expression,outfit){ if(!A.active) return; render(slot,charId,expression||'neutral',outfit); };
  A.hide=function(slot){ const box=slot==='left'?A.L:A.R; box.classList.remove('show'); A.slots[slot]=null; };
  // 說話者高亮：另一側變暗
  A.speaker=function(charId,expression,outfit){ if(!A.active) return; let slot=null; for(const s of ['left','right']){ if(A.slots[s]&&A.slots[s].charId===charId) slot=s; } if(!slot&&charId&&charId!=='player'&&charId!=='narrator'){ slot=A.slots.right?(A.slots.left?'right':'left'):'right'; render(slot,charId,expression||'neutral',outfit); } else if(slot){ render(slot,charId,expression||A.slots[slot].expression||'neutral',outfit||A.slots[slot].outfit); } for(const s of ['left','right']){ const box=s==='left'?A.L:A.R; box.classList.toggle('dim',!!(A.slots[s]&&slot&&s!==slot)); if(!slot) box.classList.toggle('dim',!!(A.slots[s]&&charId==='player')); } };   /* 說話的人沒有立繪（祐廷、櫃台、媽媽…）：台上的人都變暗，不會看起來像旁邊的人在講（2026-10-18 使用者：「柏翰的圖，但說話的是我欸」）；旁白照舊都亮 */
  A.log=function(name,text){ A.history.push({name,text}); if(A.history.length>60) A.history.shift(); };
  A.toggleHistory=function(){ const h=A.hist; if(h.style.display==='block'){ h.style.display='none'; return; } h.innerHTML=A.history.map(x=>'<div>'+(x.name?'<b>'+x.name+'</b>':'')+x.text+'</div>').join('')||'<div>（還沒有對話）</div>'; h.style.display='block'; h.scrollTop=h.scrollHeight; };
  // Event CG：稀有；不存在時自動退回一般 ADV
  /* 手機直向（BB 2026-10-14 同意）：整張 CG 縮小放進畫面（contain），人物不會被裁；上下的空白是同一張 CG 放大模糊（#advBg）。橫向照舊 cover。
     CG 一律 16:9（docs/CHARACTER_ART_SPEC.md）；直向時圖放在畫面 40% 的高度，下面留給對話框與選項 */
  /* 演到一半換背景（出遊的場景，src/outings3d.js）：mode＝'blur'／'freeze'／'dark'／{image}；圖載不到就用深色底 */
  A.setBg=function(mode){ if(!A.active) return; mode=mode||'blur'; A.bgMode=mode; for(const c of ['blur','freeze','dark','image','cg']) A.root.classList.remove(c); if(A.cgEl) A.cgEl.style.backgroundImage='';   /* 換場景＝離開 CG 那一拍（例：芷若 Z5 戲院門口 BCG-21 → 豆漿店）；之後說話的人照常出現 */
    if(typeof mode==='object'&&mode.image){ A.root.classList.add('image'); A.bg.style.backgroundImage='url('+mode.image+')'; loadImage(mode.image).catch(()=>{ A.root.classList.remove('image'); A.root.classList.add('dark'); A.bg.style.backgroundImage=''; }); }
    else { A.root.classList.add(typeof mode==='object'?'dark':mode); A.bg.style.backgroundImage=''; } };
  A.cg=function(cgId){ const reg=(typeof CG_REGISTRY!=='undefined')?CG_REGISTRY[cgId]:null; if(!reg) return false; loadImage(reg.file).then(()=>{ A.root.className='on image cg'; A.bg.style.backgroundImage='url('+reg.file+')'; A.cgEl.style.backgroundImage='url('+reg.file+')'; A.L.classList.remove('show'); A.R.classList.remove('show'); if(window.GAME&&GAME.G){ GAME.G.cg=GAME.G.cg||{unlocked:[]}; if(!GAME.G.cg.unlocked.includes(cgId)) GAME.G.cg.unlocked.push(cgId); } }).catch(()=>{ /* fallback：維持一般 ADV */ }); return true; };
  return A;
})();
// Event CG 登錄（檔案尚未提供；解鎖狀態存於 G.cg.unlocked）
/* cg_econ_camp：使用者 01:2x 通過（BB-B d073885f，ART_APPROVED；01:37 換統一光線版 ddae6f9c）；E15 經濟系宿營 CG 帶過（AA_154 A54）。cg_class_photo_y1：BCG-46 期末合照，使用者 01:2x「就用這張」（BB-B 3cdb2c60，ART_APPROVED）。（這一行要保持單行結尾是 };——tests 用正則讀）*/
/* CG_REGISTRY 要保持一行（tests 用 /^const CG_REGISTRY=(\{.*\});$/ 讀）。最後三張 cg_peishan_decision、cg_plg_rules、cg_ferris_wheel_kexin：BB 已通過（D59，2026-10-14）、事件早就留了位置（ART-BB-READY-1017；企劃線 cg_approved/），標題用那一幕的台詞。
   再後面三張（USER_WANTS X02，2026-10-18）：CG-11 以安理由欄、CG-12 語彤分一點時間（termend_lines.js 早就呼叫）、BCG-29 可昕春假回程（events.js K8）；同樣 BB 10-14 通過、企劃線 cg_approved/ 原檔 */
const CG_REGISTRY={ cg_cafe_42pages_peishan:{file:'assets/cg/classmate_peishan/cg_cafe_42pages.webp',title:'今天念了 42 頁。你呢？'}, cg_hot_water_heroine05:{file:'assets/cg/heroine_05/cg_hot_water.webp',title:'好。今天就喝這個。'}, cg_two_tickets_heroine02:{file:'assets/cg/heroine_02/cg_two_tickets.webp',title:'早。……票我先買了。'}, cg_tour_guide_kexin:{file:'assets/cg/kexin/cg_tour_guide.webp',title:'我是今天的導遊'}, cg_birthday_tassel_kexin:{file:'assets/cg/kexin/cg_birthday_0424.webp',title:'風很大。你點，我擋。'}, cg_birthday_kexin:{file:'assets/cg/kexin/cg_dec3.webp',title:'你怎麼知道我幾點下課？'}, cg_own_drink_heroine02:{file:'assets/cg/heroine_02/cg_own_drink.webp',title:'妳自己喝什麼'}, cg_bug_fix_heroine04:{file:'assets/cg/heroine_04/cg_bug_fix.webp',title:'這個 bug 我下次修'}, cg_library_rain_heroine03:{file:'assets/cg/heroine_03/event_rain_library.webp',title:'雨天的總圖門口'}, cg_typhoon_noodles:{file:'assets/cg/kai/event_typhoon_noodles.webp',title:'颱風夜的泡麵'}, cg_midautumn_riverside:{file:'assets/cg/zhe/event_midautumn_riverside.webp',title:'中秋的河濱'}, cg_nye_rooftop:{file:'assets/cg/zhe/event_nye_rooftop.webp',title:'頂樓的跨年'}, cg_econ_camp:{file:'assets/cg/econ/cg_econ_camp.webp',title:'經濟系宿營'}, cg_class_photo_y1:{file:'assets/cg/class/cg_class_photo_y1.webp',title:'大一上，期末考完'}, cg_peishan_decision:{file:'assets/cg/classmate_peishan/cg_decision.webp',title:'我決定了。我要重考。去念教育。'}, cg_plg_rules:{file:'assets/cg/heroine_01/cg_study_group_rules.webp',title:'好。開始。每人十分鐘。'}, cg_ferris_wheel_kexin:{file:'assets/cg/kexin/cg_ferris_wheel.webp',title:'最高點'}, cg_reason_column_heroine01:{file:'assets/cg/heroine_01/cg_reason_column.webp',title:'你不說的話，我寫了。'}, cg_share_time_heroine03:{file:'assets/cg/heroine_03/cg_share_time.webp',title:'……你要不要試試看，被我分一點時間？'}, cg_dont_sleep_kexin:{file:'assets/cg/kexin/cg_dont_sleep.webp',title:'我不睡。我要陪你開車。'} };

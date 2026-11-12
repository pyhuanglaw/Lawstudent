/* ===== 說明頁、第一次提示（HELP-GUIDE-1110；USER_WANTS X268）=====
   使用者 2026-11-10：「遊戲中應該要有說明?簡單說明如何約人一天可以做幾件事情這些??」（選擇題：說明頁＋第一次遇到時的提示）。
   字全部在 src/data/help_text.js（HELP_TEXT），這裡只有程式。
   1. 說明頁：S.renderHelp() 把 HELP_TEXT.sections、credits 畫進 index.html 的 #helpBox（選單「說明」）。
   2. 第一次提示：每一種情況第一次遇到時，用畫面上方的通知條（GM.toast）出一行；不擋操作、不開對話框。
      - 每一種每份存檔一次：G.flags.HINT_SEEN={種類:1}（舊存檔沒有＝讀到時補）。
      - 舊存檔不會一次跳一串：沒有 HINT_SEEN、看得出來已經玩了一陣子的存檔（S.pastStart），基本的幾種（S.BASIC）直接記成看過，不顯示。
      - 一次一則，兩則之間至少隔 S.GAP_MS（真實時間）；剛讀檔、剛開新遊戲先等 S.FIRST_MS。
      - 劇情、對話、換場、標題畫面的時候不出（S.busy）；當下不能出的排在 pend，空下來再出（S.tick，game3d.js 每 30 格叫一次）。
      - 設定「提示」關掉（GM.S.hints===false；和其他設定一樣存在 fatiao3d_settings）＝都不出、也不記成看過（之後打開還會出）。
   哪些情況：S.COND（每次 tick 看存檔的狀態）＋別的程式直接叫 HINTS.fire(GM,種類)（打開手機 phone、花錢 buy、存檔 save；game3d.js）。
   存檔那一種用 fire(GM,'save',{later:true})：存之前先記成看過（存進去的檔才不會再出一次），字排著、選單關掉以後出。
   模組層的狀態只有 pend（排著的種類）、lastAt（上一則的時間）、seenG（這一局第一次 tick 的時間）；讀檔時 pend、lastAt 放開（LOADLOCKS）。
   測試：node tests/help_guide_1110_unit.js */
'use strict';
const HINTS=(function(){
  const S={};
  const T=()=>typeof HELP_TEXT!=='undefined'&&HELP_TEXT?HELP_TEXT:{sections:[],credits:[],hints:{}};
  S.GAP_MS=45000; S.FIRST_MS=4000; S.SHOW_MS=6500; S.MONEY_LOW=300;
  S._now=()=>Date.now();
  /* 基本的幾種：玩了一陣子的舊存檔直接當作看過 */
  S.BASIC=['free','slot','cls','phone','invite','invited','travel','buy','save'];
  S.kinds=()=>Object.keys(T().hints||{});
  S.on=GM=>!(GM&&GM.S&&GM.S.hints===false);
  const pend=new Set();
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['hints3d:pend']=()=>{ pend.clear(); };   /* 讀檔、開新遊戲：上一局排著的提示不帶過去 */
  let lastAt=0;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['hints3d:lastAt']=()=>{ lastAt=0; };
  const seenG=new WeakMap();   /* 這一局（G）第一次 tick 的時間：剛讀檔先等一下再出 */
  S._pending=()=>[...pend];
  /* 看得出來已經玩了一陣子：去過好幾個地方、走了不少路、上過課、約過人、有訊息往來 */
  S.pastStart=function(G){ if(!G) return false; const st=G.stats||{};
    return Object.keys(G.visited||{}).length>=5||(st.steps|0)>=2500||(st.classes|0)>=2||(Array.isArray(G.invites)&&G.invites.length>0)||(Array.isArray(G.notes)&&G.notes.length>=3); };
  /* 這份存檔看過哪些（讀到時補；舊存檔在這裡補基本的幾種）*/
  S.rec=function(G){ if(!G) return {}; if(!G.flags||typeof G.flags!=='object') G.flags={}; let R=G.flags.HINT_SEEN;
    if(!R||typeof R!=='object'||Array.isArray(R)){ R=G.flags.HINT_SEEN={}; if(S.pastStart(G)) for(const k of S.BASIC) R[k]=1; }
    return R; };
  S.seen=(G,k)=>!!S.rec(G)[k];
  /* 現在不能出：標題畫面、劇情、對話、選單、換場、2D 畫面 */
  S.busy=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.player||GM.titleIdle) return true;
    if(E.player.busy||(GM.D&&(GM.D.active||GM.D.busyDepth>0))) return true;
    if(GM.sceneDepth&&GM.sceneDepth()>0) return true;
    if(GM.isEntering&&GM.isEntering()) return true;
    if(typeof ADV!=='undefined'&&ADV&&ADV.active) return true;
    return false; };
  const slotsOn=G=>typeof CLS!=='undefined'&&CLS.slotsOn?!!CLS.slotsOn(G):true;
  const safe=f=>{ try{ return !!f(); }catch(e){ return false; } };
  /* 每一種「現在遇到了嗎」（只看存檔的狀態；phone、buy、save 由別的程式叫 fire）*/
  S.COND={
    free:G=>slotsOn(G),
    slot:G=>slotsOn(G)&&!!G.slots&&G.slots.day===G.day&&!!G.slots.used&&['am','pm','ev'].some(p=>(G.slots.used[p]|0)>0),
    cls:G=>{ if(typeof CLS==='undefined'||!CLS.next||!slotsOn(G)||G.hour>=24) return false; const it=CLS.next(G); if(!it||it.day!==G.day) return false; const d=it.t0-(G.hour%24); return d>0&&d<=0.75; },
    invite:G=>{ if(typeof INV==='undefined'||typeof INVITE_DATA==='undefined'||!slotsOn(G)) return false; const ids=(INVITE_DATA.contacts0||[]).concat(Object.keys(G.contacts||{})); return ids.some(id=>INV.hasContact(G,id)&&INV.canInvite(G,id)); },
    invited:G=>(G.invites||[]).some(v=>v&&(v.state==='offered'||v.state==='changed')),
    travel:G=>slotsOn(G)&&Object.keys(G.visited||{}).length>=3,
    exam:G=>typeof STUDY!=='undefined'&&!!STUDY.reviewOpt&&!!STUDY.reviewOpt(G),
    money:G=>typeof G.money==='number'&&G.money<S.MONEY_LOW&&slotsOn(G)
  };
  function canShow(GM){ if(S.busy(GM)) return false; const now=S._now(), G=GM.G; let t0=seenG.get(G); if(t0==null){ t0=now; seenG.set(G,t0); }
    if(now-t0<S.FIRST_MS) return false; if(lastAt&&now-lastAt<S.GAP_MS) return false; return true; }
  function show(GM,k){ const txt=(T().hints||{})[k]; if(!txt) return false; S.rec(GM.G)[k]=1; pend.delete(k); lastAt=S._now(); if(GM.toast) GM.toast(txt,S.SHOW_MS); return true; }
  /* 別的程式遇到了某一種情況：能出就出，不能出（劇情中、剛出過一則）就排著 */
  S.fire=function(GM,k,o){ const G=GM&&GM.G; if(!G||!S.on(GM)||!(T().hints||{})[k]) return false; if(S.seen(G,k)) return false;
    if(o&&o.later){ S.rec(G)[k]=1; pend.add(k); return true; }   /* later：現在就記成看過（接著要存檔），字排著、等一下出 */
    if(canShow(GM)) return show(GM,k); pend.add(k); return false; };
  /* 每 30 格（game3d.js）：排著的先出；沒有排著的就照順序看存檔的狀態。一次最多一則 */
  S.tick=function(GM){ const G=GM&&GM.G; if(!G) return false; if(!S.on(GM)){ pend.clear(); return false; }
    const R=S.rec(G); if(!canShow(GM)) return false;
    for(const k of [...pend]) return show(GM,k);
    for(const k of S.kinds()){ if(R[k]||!S.COND[k]) continue; if(safe(()=>S.COND[k](G,GM))) return show(GM,k); }
    return false; };
  /* ---------- 說明頁 ---------- */
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  S.helpHTML=function(){ const D=T(); let h='';
    for(const s of D.sections||[]) h+='<div class="item'+(s.muted?' muted':'')+'" data-help="'+esc(s.id)+'"><b>'+esc(s.title)+'</b><br>'+(s.body||[]).map(esc).join('<br>')+'</div>';
    if((D.credits||[]).length) h+='<div class="item muted" data-help="licences"><b>'+esc(D.creditsTitle||'')+'</b><br>'+D.credits.map(esc).join('<br>')+'</div>';
    return h; };
  S.renderHelp=function(){ if(typeof document==='undefined'||!document.getElementById) return false; const box=document.getElementById('helpBox'); if(box){ const h=S.helpHTML(); if(h) box.innerHTML=h; }
    const lb=document.getElementById('setHintsLabel'); if(lb&&T().settingLabel) lb.textContent=T().settingLabel; return !!box; };
  try{ S.renderHelp(); }catch(e){ if(typeof console!=='undefined') console.warn('HINTS.renderHelp',e); }
  return S;
})();
if(typeof module!=='undefined'&&module.exports) module.exports=HINTS;

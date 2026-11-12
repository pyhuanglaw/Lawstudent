/* ===== 日文班群組三則（AA_521 第 4 節，企劃線 0f4b48f20；AA-C 定稿 D109；任務 NPC-STORY2-1028、USER_WANTS X119）：接線 =====
   CANON-NO-ECON-1112 第四批（AA-C 18:37 裁定：第 4 節是法律系那幾年的內容，要留）：第三批連同 AA_521 其他節一起拿掉的那個模組裡，
   第 4 節的部分原樣搬回來（cfc0fd04bf 那一版的 S.jp、S.jpAsk、S.photoDone、JP.SCH 那一列、S.send 和它用到的 S.rec／S.when／S.loc／S.due、inGrp、S.inJapan）。
   台詞在 src/data/jpclass_lines.js（JPCLASS_LINES，照稿一字不差）。
   ■ 日文班三則（g:jp_class，在日文班群組裡的才收到；4-3 只有日本路線、人在日本）：
       到了時間（臺灣時間；人在國外照當地時間，同 heard3d.js 的 HEARD.loc）就送一次；晚三天以上不補；到的時候條件不成立＝不送（記 x:原因）。
     4-3 回「好。」＝CZ_VET_PHOTO 'yes'：4/22（六）白天日本的摘要一句（JP.SCH 加一列 cz_vet_photo）；那一句演過以後，當晚 21:00（臺灣）采蓁兩則。「這週沒空。」＝'no'，她回一句；不回＝沒有後續。
   存檔：旗標 CZ_VET_PHOTO（'yes'／'no'）；記帳 G.flags.EF_PH＝{訊息 id:'sent'|'x:原因'}（和原本同一個欄位：舊存檔送過的不會再送）。
   測試：node tests/jpclass_1112_unit.js */
'use strict';
const JPCLASS=(function(){
  const S={}, L=typeof JPCLASS_LINES!=='undefined'?JPCLASS_LINES:{jp:[]};
  S.L=L;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const abs=(d,h)=>d*24+h, now=G=>abs(G.day,+G.hour||0);
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  S.LATE=72;   /* 晚三天以上就不補（同 HEARD.LATE）*/

  /* ---------------- 群組 ---------------- */
  S.rec=G=>{ const F=G.flags||(G.flags={}); let R=F.EF_PH; if(!R||typeof R!=='object') R=F.EF_PH={}; return R; };
  S.when=function(t){ const m=/^(\d{4}-\d\d-\d\d) (\d\d):(\d\d)$/.exec(String(t||'')); if(!m) return null; const d=DK(m[1]); return d==null?null:{day:d,h:+m[2]+(+m[3])/60}; };
  S.loc=(G,w)=>{ const H=typeof HEARD!=='undefined'?HEARD:null; return H&&H.loc?H.loc(G,w):w; };   /* 臺灣時間 → 遊戲時鐘（人在國外是當地時間）*/
  S.due=function(G,at){ const w0=S.when(at); if(!w0||abs(w0.day,w0.h)>now(G)+24) return null; const w=S.loc(G,w0), t0=abs(w.day,w.h); if(now(G)<t0) return null;
    if(now(G)-t0>S.LATE) return 'late'; return w; };
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  S.inJapan=G=>typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)==='JP'&&typeof JP!=='undefined'&&!!JP.inJapan&&JP.inJapan(G);
  const M=th=>([from,name,text])=>({th,from,name,text});
  /* 一則（cond 不成立＝不送）；ask：最後一則可以回 */
  S.send=function(G,e,th,cond,ask){ const R=S.rec(G); if(R[e.id]) return false; const w=S.due(G,e.at); if(!w) return false; if(w==='late'){ R[e.id]='x:late'; return false; }
    if(!cond(G)){ R[e.id]='x:cond'; return false; } const items=e.t.map(M(th)); if(ask) items[items.length-1].ask=ask(G);
    PHONE.at(G,w.day,w.h,items,e.id); R[e.id]='sent'; return true; };
  S.jpAsk=(G,e)=>{ const u=S.when(e.until), ul=u?S.loc(G,u):null, o={id:'cz_vet_photo',opts:(e.opts||[]).map(x=>({t:x.t,say:(x.r||[]).map(([from,name,text])=>({from,name,text})),set:Object.assign({},x.set)}))}; if(ul) o.until=abs(ul.day,ul.h); return o; };
  S.jp=function(G){ for(const e of L.jp||[]) S.send(G,e,'g:jp_class',g=>inGrp(g,'jp_class')&&(!e.jpOnly||S.inJapan(g)),e.opts?g=>S.jpAsk(g,e):null);
    const P=L.vetThanks; if(P&&G.flags.CZ_VET_PHOTO==='yes'&&S.photoDone(G)) S.send(G,P,'g:jp_class',g=>inGrp(g,'jp_class')); };
  /* 4-3 回「好。」：4/22（六）白天的摘要一句（JP.SCH，日本的時間）；演過了沒（JP 的 done 紀錄）*/
  S.photoDone=G=>{ const V=L.vetPhoto; if(!V||typeof JP==='undefined'||!JP.rec) return false; const R=JP.rec(G); return !!(R&&R.done&&R.done[V.k]!=null); };
  S.addPhotoStop=function(){ const V=L.vetPhoto; if(!V||typeof JP==='undefined'||!Array.isArray(JP.SCH)||JP.SCH.some(s=>s.k===V.k)) return;
    JP.SCH.push({k:V.k,d:V.d,h:V.h,w:'jp',if:G=>!!G&&!!G.flags&&G.flags.CZ_VET_PHOTO==='yes',sum:V.t}); };

  /* ---------------- 手機規則、掛勾 ---------------- */
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; try{ S.jp(G); }catch(e){ console.warn('JPCLASS phone',e); } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._jpclass){ STORY.PHONE_RULES.push(G=>S.phone(G)); STORY._jpclass=true; }
  S.addPhotoStop();
  return S;
})();

/* ===== 約會選互動點的 2D 圖層（DATE-S6；使用者要的 I07、I08）=====
   原本選互動點是一列文字選單（date3d.js 的 S.scene、S.dayRound）。這裡換成：地點的 2D 底圖上，每個互動點一個可以點的標記（名字＋時間、花費，和選單同一份字），
   她的去背人物站在一邊（assets/date/<人物>/H1.webp；做完咖啡館、長椅這類互動點以後回來是坐姿 H4），下面一顆結束的按鈕（字和選單最後一項一樣）。
   規則和選單一樣：時間不夠、下雨停用、休館的互動點灰掉、按不下去。回傳值＝選單的第幾項（date3d.js 照原本的流程往下走，挑的點、扣的錢、推的時間完全一樣）。
   資料：src/data/date_hotspots.js（DATE_HOTSPOTS）。這一個地點只要有一個互動點沒有位置、底圖或資料缺、網址有 ?nodatelayer、2D 畫面（ADV）沒開、
   圖載不到、或中途出錯＝照原本的文字選單（date3d.js 的 S.pickChoose）。不存檔、不加存檔欄位（D20）。不顯示任何除錯字（D8、?dev 也不加）。
   手機直向：底圖照高度放滿、左右可以滑；橫向：照寬度放滿、上下裁掉的部分標記往內收。safe-area 照 env(safe-area-inset-*)。測試：node tests/date_layer_s6_unit.js */
'use strict';
const DATELAYER=(function(){
  const S={};
  S.GUARD=350;   /* 圖層出現後這麼多毫秒內按下去的那一下不算（同 game3d.js 選單的 TAP_GUARD：對話點太快時標記一出現就在手指底下）*/
  S.lastDown=0;
  const data=()=>typeof DATE_HOTSPOTS!=='undefined'?DATE_HOTSPOTS:null;
  S.disabled=function(){ try{ return /[?&]nodatelayer\b/.test((typeof location!=='undefined'&&location.search)||''); }catch(e){ return true; } };
  S.entry=bgKey=>{ const D=data(); return D&&D.bg&&bgKey&&Object.prototype.hasOwnProperty.call(D.bg,bgKey)?D.bg[bgKey]:null; };
  const okXY=p=>Array.isArray(p)&&p.length===2&&p.every(v=>typeof v==='number'&&v>=0&&v<=1);
  /* 這一張底圖能不能用圖層：這個地點「所有」互動點都有位置（缺一個＝整個地點照文字選單），而且這一次要列的也都在 */
  S.covers=function(bgKey,pts,all){ const e=S.entry(bgKey); if(!e||!e.pts||!Array.isArray(e.wh)||!(e.wh[0]>0&&e.wh[1]>0)||!Array.isArray(pts)||!pts.length) return false;
    const need=(all&&all.length?all:pts); return need.concat(pts).every(p=>p&&p.id&&String(p.id).split('.')[0]===e.loc&&okXY(e.pts[p.id])); };
  S.bgOf=bgKey=>{ if(typeof OUT==='undefined'||!OUT.BG||!OUT.BG[bgKey]||!OUT.BG[bgKey].image) return null; const b=OUT.BG[bgKey]; return {image:b.image,night:!!b.night}; };
  S.can=function(bgKey,pts,all){ try{ return !S.disabled()&&typeof document!=='undefined'&&!!document.createElement&&!!document.body&&typeof ADV!=='undefined'&&!!ADV.active&&!!ADV.root&&S.covers(bgKey,pts,all)&&!!S.bgOf(bgKey); }catch(e){ return false; } };
  /* 她的姿勢：剛做完的那一個互動點是坐著的（咖啡館、茶館、長椅、泡腳池…，DATE_HOTSPOTS.seated）＝H4，其他＝H1 */
  S.pose=function(spots){ const D=data(), last=Array.isArray(spots)&&spots.length?spots[spots.length-1]:null; return last&&D&&Array.isArray(D.seated)&&D.seated.includes(last)?'H4':'H1'; };
  S.figOf=function(who,pose){ const D=data(), F=D&&D.fig&&who?D.fig[who]:null; if(!F||!F.H1||!(F.H1.h>0)) return null; const p=F[pose]?pose:'H1', a=F[p]; if(!a||(p==='H4'&&!(a.seatY>0))) return null; return {pose:p,a,h1:F.H1,src:'assets/date/'+who+'/'+p+'.webp'}; };
  if(typeof document!=='undefined'&&document.addEventListener) document.addEventListener('pointerdown',()=>{ S.lastDown=(typeof performance!=='undefined'?performance.now():Date.now()); },true);
  const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
  let cur=null;   /* 現在開著的那一個 {root,…}；一次只有一個 */
  const CSS=`
#dateLayer{position:absolute;inset:0;pointer-events:auto;z-index:6;opacity:0;transition:opacity .25s;background:#15171d}
#dateLayer.on{opacity:1}
#dateLayer .dlScroll{position:absolute;inset:0;overflow:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
#dateLayer .dlScroll.pan{overflow-x:auto;overflow-y:hidden;scrollbar-width:none}#dateLayer .dlScroll.pan::-webkit-scrollbar{display:none}
#dateLayer .dlStage{position:relative;overflow:hidden;background-size:100% 100%;background-repeat:no-repeat}
#dateLayer.night .dlStage{filter:brightness(.42) saturate(.6)}
#dateLayer .dlHer{position:absolute;pointer-events:none;user-select:none;-webkit-user-select:none;filter:drop-shadow(0 6px 14px rgba(0,0,0,.35))}
#dateLayer .dlHot{position:absolute;width:44px;height:44px;margin:0;padding:0;border:0;background:none;color:#f4efe6;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
#dateLayer .dlHot .dot{position:absolute;left:7px;top:7px;width:30px;height:30px;border-radius:50%;box-sizing:border-box;border:3px solid #e9b96a;background:rgba(20,22,28,.45);box-shadow:0 0 0 2px rgba(0,0,0,.35),0 0 14px rgba(233,185,106,.55);animation:dlPulse 1.8s ease-in-out infinite}
#dateLayer .dlHot .dot:after{content:'';position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#e9b96a}
#dateLayer .dlHot .lab{position:absolute;left:50%;top:44px;transform:translateX(-50%);white-space:nowrap;max-width:44vw;overflow:hidden;text-overflow:ellipsis;padding:4px 9px;border-radius:10px;background:rgba(20,22,28,.78);border:1px solid rgba(255,255,255,.18);font-size:13px;line-height:1.3;text-align:center}
#dateLayer .dlHot.up .lab{top:auto;bottom:44px}
#dateLayer .dlHot .lab small{display:block;font-size:11px;opacity:.75}
#dateLayer .dlHot.dim{cursor:default;pointer-events:none}#dateLayer .dlHot.dim .dot{border-color:#8b8f99;box-shadow:none;animation:none;opacity:.6}#dateLayer .dlHot.dim .dot:after{background:#8b8f99}#dateLayer .dlHot.dim .lab{opacity:.6}
#dateLayer .dlEnd{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(max(14px,env(safe-area-inset-bottom)));min-height:44px;min-width:44px;padding:0 18px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(20,22,28,.82);color:#e8e2d6;font-size:14px;touch-action:manipulation}
#dateLayer .dlEdge{position:absolute;top:0;bottom:0;width:22px;pointer-events:none;opacity:0;transition:opacity .2s}#dateLayer .dlEdge.l{left:0;background:linear-gradient(90deg,rgba(0,0,0,.45),transparent)}#dateLayer .dlEdge.r{right:0;background:linear-gradient(270deg,rgba(0,0,0,.45),transparent)}#dateLayer .dlEdge.show{opacity:1}
#dateLayer .dlProbe{position:absolute;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)}
#adv.dlayer .advSlot{opacity:0!important;visibility:hidden}
@keyframes dlPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}`;
  function css(){ if(S.cssDone||!document.head) return; const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st); S.cssDone=true; }
  function el(tag,cls,parent){ const e=document.createElement(tag); if(cls) e.className=cls; if(parent) parent.appendChild(e); return e; }
  const px=n=>Math.round(n)+'px';
  function insets(probe){ const r={t:0,r:0,b:0,l:0}; try{ const cs=getComputedStyle(probe); r.t=parseFloat(cs.paddingTop)||0; r.r=parseFloat(cs.paddingRight)||0; r.b=parseFloat(cs.paddingBottom)||0; r.l=parseFloat(cs.paddingLeft)||0; }catch(e){} return r; }
  /* 標記、她的位置照現在的畫面大小算（轉向、改視窗大小都重算）。底圖：照 cover（和 ADV 的背景一樣）；直向寬出來的部分可以左右滑，橫向上下裁掉的部分不滑、標記往內收 */
  function layout(c,first){ const vw=Math.max(1,innerWidth||c.root.clientWidth||1), vh=Math.max(1,innerHeight||c.root.clientHeight||1), iw=c.e.wh[0], ih=c.e.wh[1];
    const s=Math.max(vw/iw,vh/ih), W=iw*s, H=ih*s, offY=Math.max(0,(H-vh)/2), pan=W>vw+1, ins=insets(c.probe);
    c.stage.style.width=px(W); c.stage.style.height=px(H); c.stage.style.top=px(-offY); c.scroll.classList.toggle('pan',pan);
    const top=offY+ins.t+52, bot=offY+Math.min(vh,H)-ins.b-(14+44+12);   /* 上面留給「紀錄／略過對話」（ADV 的 #advTop），下面留給結束的按鈕 */
    const xl=pan?28:(W-vw)/2+ins.l+28, xr=pan?W-28:(W+vw)/2-ins.r-28;
    const items=c.hots.map(h=>{ const p=c.e.pts[h.pid]; let x=p[0]*W, y=p[1]*H; x=Math.min(xr,Math.max(xl,x)); y=Math.min(bot-44,Math.max(top+22,y)); return {h,x,y}; }).sort((a,b)=>a.x-b.x);
    const LW=130, LH=46; const placed=[];   /* 名字標籤放標記下面；和左邊已經放好的標籤擠在一起＝改放上面 */
    for(const it of items){ let up=false; const clash=u=>placed.some(q=>Math.abs(q.x-it.x)<LW&&(q.up===u)&&Math.abs(q.y-it.y)<LH);
      if(clash(false)&&!clash(true)&&it.y-22-LH>top) up=true; placed.push({x:it.x,y:it.y,up}); it.h.btn.classList.toggle('up',up); it.h.btn.style.left=px(it.x-22); it.h.btn.style.top=px(it.y-22); }
    if(c.her&&c.fig){ const e=c.e.her||{}, a=c.fig.a, hh=(e.h>0?e.h:(data().figH||0.55)), k=hh*H/c.fig.h1.h, X=(e.x>=0&&e.x<=1?e.x:0.5)*W;
      c.her.style.width=px(a.w*k); c.her.style.height=px(a.hpx*k); c.her.style.left=px(X-a.footX*k);
      const visBot=offY+Math.min(vh,H), fy=e.y>0?e.y:0.985, foot=fy>1?fy*H:Math.min(fy*H,visBot-4);   /* 橫向下緣被裁掉的部分：腳往上收到看得到的地方；y>1（D10、D14 前景）照寫的放在畫面外 */
      c.her.style.top=px(c.fig.pose==='H4'?visBot-a.seatY*k:foot-a.footY*k); c.herX=X; }
    if(pan&&first){ const want=(c.herX!=null?c.herX:W/2)-vw/2; c.scroll.scrollLeft=Math.max(0,Math.min(W-vw,want)); }
    edges(c); }
  function edges(c){ const sc=c.scroll, max=(sc.scrollWidth||0)-(sc.clientWidth||0); c.edgeL.classList.toggle('show',sc.classList.contains('pan')&&sc.scrollLeft>4); c.edgeR.classList.toggle('show',sc.classList.contains('pan')&&sc.scrollLeft<max-4); }
  S.close=function(){ const c=cur; cur=null; if(!c) return; try{ if(typeof removeEventListener==='function') removeEventListener('resize',c.onResize); }catch(e){} try{ if(c.root&&c.root.parentNode) c.root.parentNode.removeChild(c.root); }catch(e){} try{ if(typeof ADV!=='undefined'&&ADV.root) ADV.root.classList.remove('dlayer'); }catch(e){} };
  S.isOpen=()=>!!cur;
  function loadImg(src,ms){ return new Promise((res,rej)=>{ if(typeof Image==='undefined') return rej(new Error('no Image')); const im=new Image(); let done=false; const t=setTimeout(()=>{ if(!done){ done=true; rej(new Error('timeout '+src)); } },ms||4000);
    im.onload=()=>{ if(done) return; done=true; clearTimeout(t); res(im); }; im.onerror=()=>{ if(done) return; done=true; clearTimeout(t); rej(new Error('missing '+src)); }; im.src=src; }); }
  /* 選一個互動點：opts＝和文字選單完全一樣的那一列（前面 ctx.pts.length 項是互動點、{t,hint,dim}；最後一項是結束），回傳第幾項。
     底圖載不到、資料不對＝丟錯（date3d.js 的 S.pickChoose 收掉圖層、改出文字選單）。 */
  S.choose=async function(GM,opts,ctx){ ctx=ctx||{}; const pts=ctx.pts||[], e=S.entry(ctx.bg), bg=S.bgOf(ctx.bg);
    if(!e||!bg||!Array.isArray(opts)||opts.length!==pts.length+1||!S.covers(ctx.bg,pts,ctx.all)) throw new Error('DATELAYER: 資料不完整');
    S.close(); await loadImg(bg.image,4000);   /* ADV 已經載過同一張（快取），通常馬上好 */
    if(typeof ADV==='undefined'||!ADV.active||!ADV.root) throw new Error('DATELAYER: ADV 沒開');
    css(); if(typeof ADV!=='undefined') ADV.skip=false;   /* 「略過對話」停在選擇（同 GM.choose）*/
    return new Promise((res,rej)=>{ try{
      const root=el('div',bg.night?'night':''); root.id='dateLayer'; const scroll=el('div','dlScroll',root), stage=el('div','dlStage',scroll); stage.style.backgroundImage='url("'+bg.image+'")';
      const probe=el('div','dlProbe',root), edgeL=el('div','dlEdge l',root), edgeR=el('div','dlEdge r',root);
      const c={root,scroll,stage,probe,edgeL,edgeR,e,hots:[],her:null,fig:null,herX:null,shownAt:Infinity}; let settled=false;
      const pick=i=>{ if(settled) return; settled=true; S.close(); res(i); };
      const tapOK=b=>{ const t=now(); if(!(t>=c.shownAt)) return false; const d=S.lastDown; if(d&&t-d<1500&&d<c.shownAt+S.GUARD) return false; return !(b&&b._down&&b._down<c.shownAt+S.GUARD); };   /* 程式直接按（測試、探針、鍵盤）照常算 */
      const fig=S.figOf(ctx.who,S.pose(ctx.spots));
      if(fig){ const im=el('img','dlHer',stage); im.alt=''; im.draggable=false; im.onerror=()=>{ try{ if(im.parentNode) im.parentNode.removeChild(im); }catch(_){ } c.her=null; }; im.src=fig.src; c.her=im; c.fig=fig; }   /* 沒有去背圖的人（芯慈…）＝不放人（D8：不畫代替的）*/
      pts.forEach((p,i)=>{ const o=opts[i]||{}; const b=el('button','dlHot'+(o.dim?' dim':''),stage); b.type='button'; b.setAttribute('data-pid',p.id); if(o.dim){ b.disabled=true; b.setAttribute('aria-disabled','true'); }
        el('span','dot',b); const lab=el('span','lab',b); lab.textContent=String(o.t==null?'':o.t); if(o.hint){ const sm=el('small','',lab); sm.textContent=String(o.hint); }
        b.setAttribute('aria-label',String(o.t==null?'':o.t)+(o.hint?'　'+o.hint:''));
        if(b.addEventListener) b.addEventListener('pointerdown',()=>{ b._down=now(); });
        b.onclick=ev=>{ if(ev&&ev.stopPropagation) ev.stopPropagation(); if(o.dim||b.disabled) return; if(!tapOK(b)) return; pick(i); };
        c.hots.push({pid:p.id,btn:b,i}); });
      const end=el('button','dlEnd',root); end.type='button'; end.textContent=String(opts[opts.length-1].t||''); if(end.addEventListener) end.addEventListener('pointerdown',()=>{ end._down=now(); });
      end.onclick=ev=>{ if(ev&&ev.stopPropagation) ev.stopPropagation(); if(!tapOK(end)) return; pick(opts.length-1); }; c.end=end;
      c.onResize=()=>{ try{ layout(c,false); }catch(err){ console.warn('DATELAYER layout',err); } };
      scroll.onscroll=()=>edges(c);
      ADV.root.appendChild(root); ADV.root.classList.add('dlayer'); cur=c; c.fail=err=>{ if(settled) return; settled=true; S.close(); rej(err); };
      layout(c,true); if(typeof addEventListener==='function') addEventListener('resize',c.onResize);
      c.shownAt=now(); const show=()=>root.classList.add('on'); if(typeof requestAnimationFrame==='function') requestAnimationFrame(show); else show();
    }catch(err){ S.close(); rej(err); } }); };
  /* 測試用：現在開著的圖層（按鈕、她的圖）；正式畫面不用 */
  S._cur=()=>cur;
  return S;
})();

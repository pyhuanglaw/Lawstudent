/* 日誌月曆（JOURNAL-CALENDAR-1103；使用者 11-03：「日誌跟筆記同一頁太亂了 我希望日誌以月曆出現 發生什麼事就寫在當天日期那一格 可以查詢」）
   選單多一個「日誌」分頁（筆記頁不再列日誌）：
   - 月曆：一個月一頁（‹ › 換月，「今天」回到現在這個月），一週從週一開始；那一天發生的事寫在那一格（最多兩行，其他寫「＋N」）；今天那一格框起來。
   - 點一格：下面列出那一天的全部紀錄。
   - 查詢：上面的搜尋框打字，列出所有符合的紀錄（日期＋內容），點一筆跳到那個月、選那一天。
   資料：G.memo（GM.memo 寫的），顯示用 STORY.memoShown／STORY.memoText（不顯示 ev_ 代號、舊存檔換新校名）；存檔格式不變。
   測試：node tests/journal_calendar_unit.js */
const JOURNAL=(function(){
  const S={};
  const C=()=>typeof CALENDAR!=='undefined'?CALENDAR:null;
  const DAYMS=86400000;
  /* 遊戲日 ↔ 日期 */
  S.dayOfYMD=function(y,m,d){ const c=C(); if(!c) return null; return Math.round((Date.UTC(y,m-1,d)-c.tOf(1))/DAYMS)+1; };
  S.ymd=function(day){ const c=C(); return c?c.dateOf(day):null; };
  /* 全部紀錄（照時間）：{day,t,i} */
  S.entries=function(G){ const L=(typeof STORY!=='undefined'&&STORY.memoShown)?STORY.memoShown(G):((G&&G.memo)||[]);
    return L.map((m,i)=>({day:m.day|0,t:(typeof STORY!=='undefined'&&STORY.memoText)?STORY.memoText(G,m):m.t,i})).filter(e=>typeof e.t==='string'&&e.t); };
  S.byDay=function(G){ const M={}; for(const e of S.entries(G)) (M[e.day]||(M[e.day]=[])).push(e); return M; };
  /* 查詢：空白分開的字都要有（不分大小寫）；照時間由新到舊 */
  S.search=function(G,q){ const w=String(q||'').trim().toLowerCase().split(/\s+/).filter(Boolean); if(!w.length) return [];
    return S.entries(G).filter(e=>{ const t=e.t.toLowerCase(), dl=S.label(e.day); return w.every(x=>t.includes(x)||dl.includes(x)); }).reverse(); };
  S.label=function(day){ const x=S.ymd(day); return x?x.m+'/'+x.d:String(day); };
  /* 一個月的格子：weeks＝[[{y,m,d,day,inMonth,items}×7]…]；一週從週一開始 */
  S.month=function(G,y,m){ const first=S.dayOfYMD(y,m,1); if(first==null) return null; const x=S.ymd(first), lead=(x.wd+6)%7, M=S.byDay(G);
    const dim=new Date(Date.UTC(y,m,0)).getUTCDate(), cells=Math.ceil((lead+dim)/7)*7, weeks=[];
    for(let k=0;k<cells;k++){ const day=first-lead+k, z=S.ymd(day), c={y:z.y,m:z.m,d:z.d,day,inMonth:z.m===m&&z.y===y,items:M[day]||[]}; if(k%7===0) weeks.push([]); weeks[weeks.length-1].push(c); }
    return {y,m,weeks}; };
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  /* 畫面（選單「日誌」分頁）：view＝{y,m,sel,q} 記在模組裡（不進存檔）*/
  let view=null;
  S.reset=()=>{ view=null; };
  S.view=()=>view;
  S.html=function(G){ const now=S.ymd(G.day); if(!view) view={y:now.y,m:now.m,sel:G.day,q:''};
    const M=S.month(G,view.y,view.m); if(!M) return '<div class="muted">日曆讀不到。</div>';
    let h='<div class="jrTop"><button class="jrNav" data-jr="prev" aria-label="上個月">‹</button><b class="jrTitle">'+view.y+' 年 '+view.m+' 月</b><button class="jrNav" data-jr="next" aria-label="下個月">›</button><button class="jrToday" data-jr="today">今天</button></div>';
    h+='<input class="jrQ" type="search" placeholder="查詢（例：宿營、沛珊、8/23）" value="'+esc(view.q)+'">';
    if(view.q.trim()){ const R=S.search(G,view.q); h+='<div class="jrRes">'+(R.length?R.map(e=>'<button class="jrHit" data-jrday="'+e.day+'"><span class="muted">'+S.label(e.day)+'</span>　'+esc(e.t)+'</button>').join(''):'<div class="muted">找不到。</div>')+'</div>'; return h; }
    h+='<div class="jrGrid">'+['一','二','三','四','五','六','日'].map(w=>'<div class="jrWd">'+w+'</div>').join('');
    for(const wk of M.weeks) for(const c of wk){ const cls=['jrCell',c.inMonth?'':'jrOut',c.day===G.day?'jrNow':'',c.day===view.sel?'jrSel':'',c.items.length?'jrHas':''].filter(Boolean).join(' ');
      h+='<button class="'+cls+'" data-jrday="'+c.day+'"><span class="jrD">'+c.d+'</span>'+c.items.slice(0,2).map(e=>'<span class="jrIt">'+esc(e.t)+'</span>').join('')+(c.items.length>2?'<span class="jrMore">＋'+(c.items.length-2)+'</span>':'')+'</button>'; }
    h+='</div>';
    const sel=S.byDay(G)[view.sel]||[]; h+='<div class="jrDay"><b>'+S.label(view.sel)+'</b>'+(sel.length?sel.map(e=>'<div>· '+esc(e.t)+'</div>').join(''):'<div class="muted">這一天沒有紀錄。</div>')+'</div>';
    return h; };
  /* 動作（點擊）：回傳 true＝要重畫 */
  S.act=function(G,a,arg){ if(!view) S.html(G); const now=S.ymd(G.day);
    if(a==='prev'){ view.m--; if(view.m<1){ view.m=12; view.y--; } return true; }
    if(a==='next'){ view.m++; if(view.m>12){ view.m=1; view.y++; } return true; }
    if(a==='today'){ view.y=now.y; view.m=now.m; view.sel=G.day; view.q=''; return true; }
    if(a==='day'){ const z=S.ymd(arg|0); view.sel=arg|0; view.y=z.y; view.m=z.m; view.q=''; return true; }
    if(a==='q'){ view.q=String(arg||''); return true; }
    return false; };
  S.render=function(box,G){ if(!box||!G) return; box.innerHTML=S.html(G);
    box.onclick=ev=>{ const b=ev.target&&ev.target.closest?ev.target.closest('[data-jr],[data-jrday]'):null; if(!b) return; const re=b.dataset.jr?S.act(G,b.dataset.jr):S.act(G,'day',+b.dataset.jrday); if(re) S.render(box,G); };
    const q=box.querySelector('.jrQ'); if(q) q.oninput=()=>{ S.act(G,'q',q.value); const pos=q.selectionStart; S.render(box,G); const q2=box.querySelector('.jrQ'); if(q2){ q2.focus(); try{ q2.setSelectionRange(pos,pos); }catch(e){} } }; };
  return S;
})();

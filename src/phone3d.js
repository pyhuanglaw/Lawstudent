/* ===== 手機的對話：一對一、群組、置頂、可以回的訊息、排定時間送達（交接包 v1；AA_70 1-1、1-2、1-8；BB_95 4-1、9-0）=====
   訊息照舊存在 G.msgs（invites3d.js：最新的在最後、最多 200 則），舊訊息不用改；新訊息多幾個欄位：
     th：對話串（'p:人物 id'＝和那個人的一對一；'g:群組 id'＝群組）。舊訊息沒有：有 who＝和 who 的一對一，沒有＝通知（'sys'）
     from：誰說的（人物 id；'player'＝祐廷）；name：手機上顯示的名字（只在手機上出現的人，例如 Kevin 學長；或群組裡的帳號名稱「溫學姊」）
     pin：群組的置頂；ask：可以回的訊息 {id, grp, max, until, opts:[{t, post, say:[{from,name,text}], set:{旗標:值}, mem:[{npc,tag,note}]}]}（post：貼到對話裡的字，沒寫＝t；例：選項「（貼一張「OK」的貼圖）」貼出去是「（貼圖：OK）」）；ans：回了第幾個（回過就不能再回）
     tag：同一則內容只送一次（PHONE.at 的 tag）
   G.phone＝{groups:{群組 id:{name, day}}, seen:{對話串:看過的最後一則的時間}, q:[{day,h,items,tag}], n}（舊存檔沒有就從空的開始）
   排定時間（PHONE.at）：時間到了才出現（PHONE.tick，story3d.js 每 0.5 秒；劇情、對話進行中先不送）；睡覺、跳過時間跨過去的，照原本的時間補進去（不會跑到未來）。
   回覆（PHONE.answer）：祐廷那一句、對方的回覆接在後面（時間是回的當下）；set、mem 照事件引擎的寫法。
   不做「已讀不回」的懲罰（AA_70 1-9）：不回就只是沒回。
   測試：node tests/v1_batch2_unit.js（群組、排定時間、回覆）、tests/v1_batch5_unit.js（每天的手機小事） */
'use strict';
const PHONE=(function(){
  const S={};
  const FAM_NM={mom:'媽媽',dad:'爸爸',sister:'姊姊',yule:'予樂'};   /* yule：可昕的室友予樂（不在 CHARACTERS；AA_325 2-Y2-15 她私訊祐廷）*/   /* 家人（不在 CHARACTERS 裡）：一對一對話串的名字（p:mom；1A-06 姊姊的私訊 p:sister，AA_317）*/
  const nm=id=>{ if(FAM_NM[id]&&!(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])) return FAM_NM[id]; const cn=typeof SOCIAL!=='undefined'&&SOCIAL.contactName?SOCIAL.contactName(id):null;   /* 手機聯絡人的名字跟著關係（AA_124 1-6、BB_120：到「朋友」時改叫法）——
      名字已經知道了才用（還沒見過的女主角照舊「不認識的女生」，不能因為聯絡人名稱提前露出名字）*/
    if(cn&&SOCIAL.displayName&&typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&(SOCIAL.displayName(id)===CHARACTERS[id].name||(SOCIAL.contactKnown&&SOCIAL.contactKnown(id)))) return cn;   /* contactKnown：手機上已經知道名字（學姊 9/3 接受交友邀請起，AA_372 第 6 節第 10 題）*/
    const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(c&&c.phoneName) return c.phoneName; return (typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(id):((c&&c.name)||id); };   /* phoneName：手機上的名字（可昕）*/
  S.rec=function(G){ if(typeof INV!=='undefined') INV.rec(G); else if(!Array.isArray(G.msgs)) G.msgs=[];
    if(!G.phone||typeof G.phone!=='object') G.phone={}; const P=G.phone; if(!P.groups||typeof P.groups!=='object') P.groups={}; if(!P.seen||typeof P.seen!=='object') P.seen={}; if(!Array.isArray(P.q)) P.q=[]; if(typeof P.n!=='number') P.n=0;
    if(!P.filmRen){ P.filmRen=1; const fr=typeof SOCIAL!=='undefined'&&SOCIAL.filmRename; if(fr){ for(const k in P.groups){ const g=P.groups[k]; if(g&&typeof g.name==='string'&&/東京物語|晚春/.test(g.name)) g.name=fr(g.name).replace(/[《》]/g,''); } for(const m of (G.msgs||[])) if(m&&typeof m.text==='string'&&/東京物語|晚春/.test(m.text)) m.text=fr(m.text); for(const m of P.q) if(m&&typeof m.text==='string'&&/東京物語|晚春/.test(m.text)) m.text=fr(m.text); } }   /* 舊存檔：手機裡的真實片名換成虛構的（AA_313 6-2，D77；只做一次）*/
    if(!P.worldRen){ P.worldRen=1; const wn=typeof SOCIAL!=='undefined'&&SOCIAL.worldName, ws=typeof SOCIAL!=='undefined'&&SOCIAL.worldSpoken; if(wn&&ws){ for(const k in P.groups){ const g=P.groups[k]; if(g&&typeof g.name==='string') g.name=wn(g.name); }
      const fix=m=>{ if(m&&typeof m.text==='string') m.text=((m.from||m.who)&&(m.th||'')!=='sys'?ws:wn)(m.text); }; for(const m of (G.msgs||[])) fix(m); for(const m of P.q) fix(m); } }   /* 舊存檔：手機裡的真實校名、館名換成虛構的（WORLD-RENAME-1030，D115；人物傳的＝口語 A館、系統＝正式；只做一次）*/
    return P; };
  S.th=m=>m.th||(m.who?'p:'+m.who:'sys');
  const abs=(day,h)=>day*24+h;
  S.join=function(G,gid,name){ const P=S.rec(G); if(!P.groups[gid]) P.groups[gid]={name,day:G.day}; return P.groups[gid]; };
  S.inGroup=(G,gid)=>!!S.rec(G).groups[gid];
  S.title=function(G,th){ if(th.startsWith('g:')){ const g=S.rec(G).groups[th.slice(2)]; return g?g.name:th.slice(2); } if(th.startsWith('p:')) return nm(th.slice(2)); return '通知'; };
  S.who=m=>m.from==='player'?'你':((m.from&&typeof SOCIAL!=='undefined'&&SOCIAL.datingName&&SOCIAL.datingName(m.from))||m.name||(m.from?nm(m.from):''));   /* 交往中：她的訊息顯示交往中的叫法（學姊＝「書瑀」，AA_313 6-5 第 8 點）*/
  const mk=(G,it,day,h)=>{ const hh=((h%24)+24)%24, dd=day+Math.floor(h/24); const th=it.th||(it.who?'p:'+it.who:'sys');
    const m={day:dd,h:+hh.toFixed(2),who:it.who!==undefined?it.who:(th.startsWith('p:')&&it.from!=='player'?th.slice(2):null),text:it.text,iv:null,th};
    if(it.from) m.from=it.from; if(it.name) m.name=it.name; if(it.pin) m.pin=true; if(it.tag) m.tag=it.tag; if(Array.isArray(it.fold)) m.fold=it.fold.slice();   /* fold：折起來的長訊息（手機上點開看全文；W3b）*/
    if(it.quiet) m.quiet=true;   /* quiet：不用回、快轉不停在這一則（收進手機、有紅點；經濟系社團群組三則，AA_529 第⑦點）。各個快轉的「收到訊息就停」都不算它（PHONE.loud）*/
    if(it.play) m.play=true;   /* play：錄音（宥辰的週五的歌，AA_497 1-4）——折起來的是點開聽到的那一句旁白，手機上寫「（點開聽）」*/
    if(it.ask){ const P=S.rec(G); P.n++; m.ask=Object.assign({},it.ask,{id:it.ask.id||('a'+P.n)}); }
    if(it.cg){ m.cg=it.cg; G.cg=G.cg||{unlocked:[]}; G.cg.unlocked=G.cg.unlocked||[]; if(!G.cg.unlocked.includes(it.cg)) G.cg.unlocked.push(it.cg); }   /* 照片是一張 CG（例：CG-2b Alison 傳的讀書會白板，AA_343 E2）：訊息下面顯示那張圖（game3d.js threadHTML），送出就收進相簿 */
    return m; };
  const put=(G,m)=>{ let i=G.msgs.length; while(i>0&&abs(G.msgs[i-1].day,G.msgs[i-1].h)>abs(m.day,m.h)) i--; G.msgs.splice(i,0,m);
    if(G.msgs.length>200){ const gone=G.msgs.splice(0,G.msgs.length-200), P=S.rec(G), C=P.cut||(P.cut=[]); for(const x of gone) if(x&&x.tag&&!C.includes(x.tag)) C.push(x.tag); }   /* 超過 200 則刪最舊的：刪掉的 tag 記進 cut，PHONE.sent 才記得傳過——不然條件只寫 !PHONE.sent 的訊息會再排一次（AA_460 第 1 節，例 guitar_grp1）*/
    return m; };
  /* 現在送出（時間＝現在）；postAt：補在過去的時間（照時間排進去）*/
  S.post=function(G,it){ S.rec(G); return put(G,mk(G,it,G.day,G.hour)); };
  S.postAt=function(G,it,day,h){ S.rec(G); return put(G,mk(G,it,day,h)); };
  /* 排定時間：day 第幾天、h 幾點（24 以上＝隔天凌晨）；items 依序；tag：同一個 tag 已經排過或送過就不再排（讀檔、重進區域不會重複）*/
  S.sent=(G,tag)=>!!tag&&(S.rec(G).q.some(q=>q.tag===tag)||G.msgs.some(m=>m.tag===tag)||(S.rec(G).cut||[]).includes(tag));
  S.at=function(G,day,h,items,tag){ const P=S.rec(G); if(S.sent(G,tag)) return false; if(tag&&typeof ECONFF!=='undefined'&&ECONFF.cutMsg&&ECONFF.cutMsg(G,tag)){ (P.cut=P.cut||[]).push(tag); return false; }   /* AA_300 第 7 節：經濟系那一年不傳的邀約（記成傳過，條件不會再來）*/ P.q.push({day,h,items:[].concat(items),tag:tag||null}); return true; };
  /* 送出時間到了的（notify：每一批送完呼叫一次，給畫面提示）。15 分鐘以上前就該送的（睡覺、跳過時間）照原本的時間補進去 */
  S.tick=function(G,notify){ const P=S.rec(G); if(!P.q.length) return 0; const now=abs(G.day,G.hour); let n=0;
    for(const q of P.q.slice().sort((a,b)=>abs(a.day,a.h)-abs(b.day,b.h))){ const t=abs(q.day,q.h); if(t>now) continue; P.q.splice(P.q.indexOf(q),1); const late=now-t>0.25; const out=[];
      q.items.forEach((it,k)=>{ const it2=Object.assign({},it); if(q.tag) it2.tag=q.tag; out.push(late?S.postAt(G,it2,q.day,q.h+k*0.01):S.post(G,it2)); n++; });
      if(notify) notify(out,q); }
    return n; };
  /* 這一批裡會讓快轉停下來的（quiet 的不算；AA_529 第⑦點）*/
  S.loud=out=>(out||[]).filter(m=>!(m&&m.quiet));
  /* 可以回的訊息 */
  /* 回覆的期限（ask.until＝絕對時間 day*24+h；例：12/3 可昕「祐廷的草稿」當天 23:59 前可以傳，BB_95 9-6）：過了就不能回、按鈕不顯示 */
  /* ask.grp＋ask.max：同一組最多回幾則（主線 4「這週的訊息」：四則裡回得了兩則，AA_179 第 1 節）；回滿了，同組其他的就不能回 */
  S.grpUsed=(G,grp)=>G.msgs.reduce((n,x)=>n+(x.ask&&x.ask.grp===grp&&x.ans!=null?1:0),0);
  S.askOpen=(G,m)=>!!(m&&m.ask&&m.ans==null&&!(m.ask.until!=null&&abs(G.day,G.hour)>m.ask.until)&&!(m.ask.grp&&m.ask.max!=null&&S.grpUsed(G,m.ask.grp)>=m.ask.max));
  S.pending=G=>{ S.rec(G); return G.msgs.filter(m=>S.askOpen(G,m)); };
  S.mustOpen=(G,th)=>S.pending(G).some(m=>m.ask.must&&(!th||S.th(m)===th));   /* ask.must：一定要回才關得掉手機（v0 E12 的手機版，AA_154 A32）*/
  S.byAsk=(G,id)=>{ S.rec(G); return G.msgs.find(m=>m.ask&&m.ask.id===id)||null; };
  /* 選項的 post:false＝不替玩家傳出那一句（選項是動作，例：「（去總圖查完再回）」「（不回）」，之後的訊息由劇情規則補；v0 韋綸的腳踏車，AA_154 2-5b）*/
  S.optBlocked=(G,o)=>!!(o&&o.need&&o.need.money!=null&&(G.money|0)<o.need.money);   /* need：{money, why}＝錢不夠就不能選（例：去高雄跨年的高鐵票，AA_210 5-2）*/
  S.answer=function(G,id,k){ const m=S.byAsk(G,id); if(!m||!S.askOpen(G,m)) return null; const o=m.ask.opts[k]; if(!o||S.optBlocked(G,o)) return null; m.ans=k; const th=S.th(m);
    const out=o.post===false?[]:[S.post(G,{th,from:'player',who:null,text:o.post||o.t})]; for(const r of (o.say||[])) out.push(S.post(G,Object.assign({th},r)));
    if(o.set) for(const f in o.set) G.flags[f]=o.set[f]; if(o.mem&&typeof SOCIAL!=='undefined') for(const q of o.mem) SOCIAL.remember(q.npc,q.tag,q.note);
    if(o.contact&&typeof INV!=='undefined') for(const c of [].concat(o.contact)) INV.addContact(G,c);
    if(o.need&&typeof STORY!=='undefined'&&STORY.neededAnswered) STORY.neededAnswered(G,m,o);   /* 主線 4：回了的那個人信任 +1、記次數 */
    for(const f of S.ON_ANSWER){ try{ f(G,m,o,k); }catch(e){ console.warn('PHONE.ON_ANSWER',e); } }   /* 回了以後（她主動約你的校外約會：答應＝排進行程、她回一句，src/heroine_asks3d.js）*/
    return {m,o,out}; };
  S.ON_ANSWER=[];
  /* 對話串：最新的排前面；unread＝別人說的、在上次看過之後、而且是最近 UNREAD_DAYS 天的（BB218-P3 ⑤：快轉到 11/11 時列表還掛著 9/1 媽媽、8/25 第三小隊的紅點——兩個月前的舊訊息不算未讀；要回的照舊算 pending）*/
  S.UNREAD_DAYS=14;
  S.threads=function(G,o){ const P=S.rec(G); const by=new Map(), old=G.day!=null?abs(G.day,G.hour||0)-S.UNREAD_DAYS*24:-1e9;   /* o.sys：通知（sys）也算一串（手機訊息頁的 LINE 式列表，PHONE-LINE-UI-1018）*/
    for(const m of G.msgs){ const th=S.th(m); if(th==='sys'&&!(o&&o.sys)) continue; let r=by.get(th); if(!r){ r={th,title:S.title(G,th),last:null,n:0,unread:0,pending:0}; by.set(th,r); } r.last=m; r.n++;
      if(m.from!=='player'&&abs(m.day,m.h)>(P.seen[th]!=null?P.seen[th]:-1e9)&&abs(m.day,m.h)>old&&!m.pin) r.unread++; if(S.askOpen(G,m)) r.pending++; }   /* 待回覆＝還回得了的（askOpen：沒回、沒過期、群組次數沒用完）。原本只看「有 ask、沒回」：過期的（例：週四家人群組 22:00 過了，爸爸「？」）一直掛著「待回覆」、點進去沒有選項（使用者 10-28 01:1x，PHONE-PENDING-STALE-1028）*/
    return [...by.values()].sort((a,b)=>abs(b.last.day,b.last.h)-abs(a.last.day,a.last.h)); };
  S.thread=(G,th)=>{ S.rec(G); return G.msgs.filter(m=>S.th(m)===th); };
  S.markSeen=function(G,th){ const P=S.rec(G); const L=S.thread(G,th); if(L.length){ const m=L[L.length-1]; P.seen[th]=abs(m.day,m.h); } };
  S.unread=G=>S.threads(G).reduce((s,r)=>s+r.unread,0);
  /* 通知文字（toast）：「可昕：今天的假設題。」／「法律系直屬家族｜Kevin：第三週了……」*/
  S.notice=function(G,m){ if(!m) return ''; const th=S.th(m), w=S.who(m); const t=String(m.text||''); const s=(th.startsWith('g:')?S.title(G,th)+'｜':'')+(w?w+'：':'')+t; return s.length>40?s.slice(0,39)+'…':s; };
  return S;
})();

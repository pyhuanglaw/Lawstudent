// 交往中約會後的動態（AA_515，企劃線 aa9bbc46f；FEED-DATES-1028，HEROINE-LIFE-1028，X122）——不需要瀏覽器。
//   src/data/feed_dates.js（照片、七位的一句、留言、私訊）、src/feed3d.js（FEED.dateDone／datePost：排、貼、上限）、src/date3d.js（S.settle、S.settleOvernight 算完次數以後叫 FEED.dateDone，帶 DATE.backAt）。
//   約會都是真的走一趟：DATE.book → OUT.prompt「出發」→ OUT.go → DATE.scene（心願那一趟是 WISH.scene）→ 結算 → 回程（回到臺北）；動態照時間跑 FEED.tick。
//   0  載得到、index.html（feed_pg.js → feed_dates.js → feed3d.js）、白名單 AA_515＝aa9bbc46f；對稿兩個方向——①遊戲裡每一句都在稿裡（一字不差）②稿的時間表 7 列、照片 32 列（D07 不貼）、
//      七位各 6 句＋又來、留言私訊各兩組（子晴回的兩則）都和遊戲一樣；語彤一句都空著；子晴沒有句號；每一張照片都有你
//   1  （BB 第 1 條）和以安交往，約 D01：當晚 21:30 出一則（21:29 還沒有）、照片、第 1 句、留言私訊第 1 組；動態頁籤的小點
//   2  （BB 第 2 條）再約 D01＝「又來」那一句；輪替：八趟（D01、D01、D02～D06、D08）＝第 1 句、又來、第 2～6 句、第 1 句（又來不佔順序、第 7 次回到第 1 句）；單數第 1 組、雙數第 2 組
//   3  （BB 第 3 條）約 D07 不出（以安的心願地點：WISH.scene 那一趟、第二次一般的也不出）；心願那一趟也走 S.settle：芷若 D05 心願照出
//   4  （BB 第 4 條）同一週她已經貼過兩則自己的動態，約會那一則照出；約會那一則不算在七天兩則裡（她自己的第二則照出）
//   5  （BB 第 5 條）語彤：一句是空的（只有照片）；子晴：00:30（隔天凌晨）、沒有句號、她回的拆成兩則（留言、私訊）
//   6  七位的時間（真的約會）；分開（回到臺北）的時候已經過了她的時間＝回到家 30 分鐘後（分開那一刻＝OUT.go 的回程走完，DATE.backAt 一樣）；剛好、差一分鐘
//   7  一趟一則：兩天一夜 D31＋D32（照片用清境、回到臺北那一晚貼）、兩天一夜一個地點；同一趟再叫不再排；當天兩個地點用最後一個
//   8  同一天最多一則約會動態：兩位交往中的同一天、同一位同一天兩趟、子晴凌晨那一則（照貼出來的那一天算）
//   9  一天四則：前面已經四則照樣貼（優先）；排好以後那一天別人的動態先算它的位子（往後擠；沒有約會時那一則照出）；貼了以後照算
//   10 沒交往不貼（第 6 階也不貼）；排好以後、貼出來以前分開了不貼；經濟系不排；舊存檔以前的約會不補
//   11 回應：按愛心她不回、留言她回（進私訊、標「動態「…」」）、私訊問一句她答；一則只回一次；熟悉 +1（同一個人一天一次）
//   12 只留七天；十五天以後動態頁的 items 清掉、私訊對話串還認得那一則；舊存檔（FEED 沒有 dq、dt、dtTrip）；排好還沒貼的存讀檔以後照貼；畢業以後篇跳時間的途中貼的記 tr＝'pg'
// 修改前（開發分支 53c13dcc0：沒有 src/data/feed_dates.js、FEED.dateDone，date3d.js 結算不叫 FEED；src、tests、index.html、白名單用 git archive 53c13dcc0 拿出來，
//   把這支測試放進去、SPEC_GIT_DIR 指這個 repo 實際跑過）：FAILED 15、PASS 2——第 0 段「載得到、index.html 順序」「?v=」2 項，第 0～12 段各 1 項（沒有 FEED.dateDone／FEED_DATES 就停）；
//   當時就過的 2 項是白名單 AA_515（LAWWW-C 53c13dcc0 已登記）、讀得到稿。修改後 ALL PASS（87 項，約 1 秒）。
//   另外在同一份程式上各拿掉一條規則實際跑過（測試抓得到）：七天兩則照數 dt_ → 第 4 段 1 項 FAIL；一天四則不先佔位子（S.dtHold）→ 第 9 段 1 項 FAIL；同一天不擋第二則 → 第 8 段 5 項 FAIL。
// 用法：node tests/aa515_feed_dates_unit.js（證明修改前會失敗時，舊程式放在別的資料夾，SPEC_GIT_DIR＝這個 repo）
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const GIT=process.env.SPEC_GIT_DIR||H.ROOT, SHA='aa9bbc46f', SPEC='docs/story_planning/AA_515_交往中約會後的動態.md';
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); return true; };
const errs=[]; for(const f of ['src/data/date_wish.js','src/wish3d.js','src/data/feed_dates.js','src/feed3d.js']){ try{ if(!load(f)) errs.push('沒有 '+f); }catch(e){ errs.push(f+'：'+(e&&e.message||e)); } }
const sec=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' | ').slice(0,260)); } };
const doc=(()=>{ try{ return cp.execSync('git show '+SHA+':"'+SPEC+'"',{cwd:GIT,encoding:'utf8',maxBuffer:1<<24,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');

/* ---------- 共用 ---------- */
const AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', KX='kexin', PS='classmate_peishan';
const ALL=[AN,ZR,YT,ZQ,SIS,KX,PS], NAME={以安:AN,芷若:ZR,語彤:YT,子晴:ZQ,學姊:SIS,可昕:KX,沛珊:PS};
const FD=()=>typeof FEED_DATES!=='undefined'?FEED_DATES:null;
const HAS=()=>typeof FEED!=='undefined'&&typeof FEED.dateDone==='function'&&!!FD();
const need=()=>{ if(!HAS()) throw new Error('沒有 FEED.dateDone／FEED_DATES'); };
const DK=k=>PG.DK(k), T=(d,h)=>d*24+h;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wdOf(d); };
const R=()=>FEED.rec(H.G);
const tickAt=(d,h)=>{ at(d,h); FEED.tick(H.G); };
const dts=()=>R().items.filter(i=>/^dt_/.test(i.id));
const item=id=>R().items.find(i=>i.id===id)||null;
const P=id=>FEED.post(id,H.G);
const hh=h=>Math.round(h*60);   /* 比到分鐘 */
/* 回應那一則：回傳這一次新增的訊息（約會出發時她傳的那一則也在同一個對話串，所以只看新增的）*/
const resp=(id,kind)=>{ const n0=(H.G.msgs||[]).length, r=FEED.respond(H.G,id,kind); const L=(H.G.msgs||[]).slice(n0); return {r,txt:L.map(m=>m.text),m:L.find(m=>m.fd===id)||null}; };
GM.money=d=>{ H.G.money+=d; };
/* 選單：picks 的下一個字串在選項裡＝選它；其他照第一個沒灰掉的（互動點一個一個做，時間不夠的灰掉、最後一個是「回去」）。防無限迴圈 */
let nC=0; GM.choose=async o=>{ if(++nC>800) throw new Error('選單無限迴圈：'+J(o.map(x=>x.t))); const TT=o.map(q=>q.t||q.text); H.opts.push(TT); const w=H.picks[0];
  if(typeof w==='string'){ const k=TT.findIndex(x=>String(x).includes(w)); if(k>=0){ H.picks.shift(); return k; } } const k=o.findIndex(q=>!q.dim); return k<0?o.length-1:k; };
/* 七位都很熟（第 6 階）、有聯絡方式；dt＝交往中的；FEED 從這一天開始 */
const setup=(key,h,dt,o)=>{ o=o||{}; const G=H.fresh(key,h,'dorm',o.flags||{}); G.outings=[]; G.contacts={}; G.money=80000; if(o.stage) G.stage=o.stage;
  for(const id of ALL){ H.rel(id,65,50,45); Object.assign(SOCIAL.rel(id),{npcRom:60,rom:35}); G.contacts[id]=G.day-30; }
  for(const id of dt||[]) G.flags['dating_'+id]=true; if(typeof FEED!=='undefined') FEED.rec(G); return G; };
/* 真的走一趟：預約 → 出發時間到了「出發」→ 演完 → 回程。end＝回到臺北那一刻（兩個人分開的時候）*/
const goDate=async(id,locs,day,depart,o)=>{ o=o||{}; const G=H.G, L0=DATE.loc(locs[0]); const tr=o.tr||(locs.some(l=>(DATE.loc(l)||{}).needsCar)?'car':((L0.transport||[])[0]||{}).mode);
  const b=DATE.book(G,{who:id,locs,day,depart,kind:o.kind,transport:tr}); if(!b||!b.ok) throw new Error('約不成：'+J(b));
  const q=OUT.get(G,'date_'+b.trip); at(day,depart); H.said=[]; H.opts=[]; H.picks=['出發'].concat(o.picks||[]); nC=0; await OUT.prompt(GM,q);
  const t=DATE.trip(G,b.trip); return {trip:b.trip,t,end:T(G.day,G.hour),said:H.said.map(s=>s.t)}; };
const dq=trip=>R().dq.find(e=>e.trip===trip)||null;
const herH=id=>{ const m=/^(\d\d):(\d\d)$/.exec(FD().at[id]); const h=+m[1]+(+m[2])/60; return h<12?h+24:h; };
/* 要貼的時間（稿第 1 節）：她的時間；分開的時候已經過了＝分開＋30 分鐘 */
const expect=(id,base,end)=>{ const her=T(base,herH(id)); return end>her+1e-6?end+0.5:her; };
/* 時間到了才出：前一分鐘沒有、那一刻有 */
const postAt=(abs,id)=>{ const d=Math.floor(abs/24+1e-9), h=abs-d*24; tickAt(d,h-1/60); const before=item(id); tickAt(d,h); const it=item(id); return {before,it,d,h}; };
/* 假的學期動態（她自己的、別人的；測七天兩則、一天四則）：FEED.SETS 讀全域 FEED_Y1S1 */
const fakeSet=posts=>{ globalThis.FEED_Y1S1={term:'Y1S1',posts:posts.map(p=>Object.assign({st:'認識',pic:'（測試）'+p.id,say:'',cm:null,dm:null},p)),dms:[]}; };
const noSet=()=>{ globalThis.FEED_Y1S1=undefined; };

(async()=>{
/* ======================= 0 資料、接線、對稿 ======================= */
await sec('0',async()=>{
  const sc=f=>html.indexOf('<script src="'+f), iP=sc('src/data/feed_pg.js'), iD=sc('src/data/feed_dates.js'), iF=sc('src/feed3d.js'), iT=sc('src/date3d.js');
  check('0. 載得到；index.html：feed_pg.js → feed_dates.js → feed3d.js（date3d.js 在前面，到時候才叫 FEED）',!errs.length&&iP>0&&iD>iP&&iF>iD&&iT>0&&iT<iF,J(errs));
  { const v=/src\/data\/feed_pg\.js\?v=([^"]+)"/.exec(html), w=/src\/data\/feed_dates\.js\?v=([^"]+)"/.exec(html); check('0. index.html 的 ?v= 和旁邊一樣',!!v&&!!w&&v[1]===w[1],J([v&&v[1],w&&w[1]])); }
  const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files, A=allow.find(e=>e.path===SPEC)||{};
  check('0. 白名單：AA_515＝'+SHA+'（approved、approvedBy、FEED-DATES-1028）',A.sha===SHA&&A.status==='approved'&&!!A.approvedBy&&A.task==='FEED-DATES-1028',J(A));
  check('0. 讀得到稿（git show '+SHA+'）',doc.length>3000&&/交往中約會後的動態/.test(doc),'git fetch origin（企劃線）');
  const D=FD(); need();
  check('0. FEED_DATES.src 寫稿的版本',D.src==='AA_515 @ '+SHA,D.src);
  /* ---- 稿 → 資料（第二個方向）：照表格讀出來，整份比 ---- */
  const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
  const rows=s=>s.split('\n').filter(l=>/^\s*\|/.test(l)&&!/^\s*\|[-| :]+\|\s*$/.test(l)).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
  const SP={at:{},pic:{},who:{}};
  for(const r of rows(part('## 1.','## 2.'))){ const m=/（([a-z_0-9]+)）/.exec(r[0]), t=/^(\d\d:\d\d)/.exec(r[1]||''); if(m&&t) SP.at[m[1]]=t[1]; }
  for(const r of rows(part('## 2.','## 3.'))){ const m=/^(D\d\d)\s/.exec(r[0]); if(m) SP.pic[m[1]]=r[1]==='（不貼）'?null:r[1]; }
  const s3=part('## 3.','## 4.'), subs=s3.split(/^### 3-\d　/m).slice(1);
  const quotes=s=>(String(s).match(/「[^「」]*」/g)||[]).map(x=>x.slice(1,-1));
  const groups=(seg,key)=>{ const L=seg.split('\n'), i=L.findIndex(l=>new RegExp('^- '+key).test(l)); if(i<0) return null; const out=[];
    for(let j=i+1;j<L.length&&!/^- /.test(L[j]);j++){ const m=/第 ([12]) 組：(.*)$/.exec(L[j]); if(!m) continue; const [a,b]=m[2].split('→'); out[+m[1]-1]=quotes(a).concat(quotes(b)); } return out; };
  for(const seg of subs){ const nm=Object.keys(NAME).find(k=>seg.indexOf(k)===0); if(!nm) continue; const id=NAME[nm], w={say:[],again:null,cm:groups(seg,'留言'),dm:groups(seg,'私訊')};
    for(const r of rows(seg)){ if(/^[1-6]$/.test(r[0])) w.say[+r[0]-1]=r[1]; else if(r[0]==='又來') w.again=r[1]; }
    if(!w.say.length&&/say:''/.test(seg)&&/「又來」也一樣/.test(seg)){ w.say=['','','','','','']; w.again=''; }   /* 語彤：她的一句都空著（「又來」也一樣）*/
    SP.who[id]=w; }
  const eq=(a,b)=>J(Object.keys(a).sort())===J(Object.keys(b).sort())&&Object.keys(a).every(k=>J(a[k])===J(b[k]));
  check('0. 稿 → 遊戲：第 1 節時間表 7 列一樣（以安 21:30、芷若 22:07、語彤 23:00、子晴 00:30、學姊 22:00、可昕 23:30、沛珊 23:10）',Object.keys(SP.at).length===7&&eq(SP.at,D.at),J([SP.at,D.at]));
  const dk=Object.keys(SP.pic);
  check('0. 稿 → 遊戲：第 2 節照片 32 列一樣（D01～D32；D07「（不貼）」＝null）',dk.length===32&&dk.every((k,i)=>k==='D'+String(i+1).padStart(2,'0'))&&SP.pic.D07===null&&eq(SP.pic,D.pic),J(dk.filter(k=>SP.pic[k]!==D.pic[k])));
  const shape=w=>({say:w.say,again:w.again,cm:w.cm,dm:w.dm});
  const bad=ALL.filter(id=>!SP.who[id]||!D.who[id]||J(shape(SP.who[id]))!==J(shape(D.who[id])));
  check('0. 稿 → 遊戲：第 3 節七位各 6 句＋又來、留言兩組、私訊兩組一樣',Object.keys(SP.who).length===7&&Object.keys(D.who).length===7&&!bad.length&&ALL.every(id=>SP.who[id].say.length===6&&SP.who[id].cm.length===2&&SP.who[id].dm.length===2),J(bad.map(id=>[id,SP.who[id]&&shape(SP.who[id]),D.who[id]&&shape(D.who[id])])).slice(0,600));
  /* ---- 遊戲 → 稿（第一個方向）：每一句都在稿裡 ---- */
  const L=[]; for(const k in D.pic) if(D.pic[k]) L.push(D.pic[k]); for(const id in D.who){ const w=D.who[id]; for(const x of w.say) if(x) L.push(x); if(w.again) L.push(w.again); for(const g of w.cm.concat(w.dm)) for(const x of g) L.push(x); }
  check('0. 遊戲 → 稿：每一句都在 AA_515 裡（一字不差；'+L.length+' 句）',L.length===133&&L.every(t=>doc.includes(t)),J(L.filter(t=>!doc.includes(t))));
  check('0. id 前綴照其他動態（dt_an、dt_zr、dt_yt、dt_zq、dt_sis、dt_kx、dt_ps）',J(ALL.map(id=>D.who[id].pre))===J(['an','zr','yt','zq','sis','kx','ps']));
  check('0. 語彤：6 句、又來都空著（say:\'\'，只有照片）',D.who[YT].say.length===6&&D.who[YT].say.every(x=>x==='')&&D.who[YT].again==='');
  const zq=D.who[ZQ], zqHer=zq.say.concat([zq.again]).concat(zq.cm.flatMap(g=>g.slice(1))).concat(zq.dm.flatMap(g=>g.slice(1)));
  check('0. 子晴：她的一句、又來、她回的都沒有句號；回的拆成兩則（每組她兩句）',zqHer.length===15&&zqHer.every(x=>!/。/.test(x))&&zq.cm.concat(zq.dm).every(g=>g.length===3),J(zqHer.filter(x=>/。/.test(x))));
  check('0. 其他六位回的都是一則（每組＝你一句、她一句）',ALL.filter(id=>id!==ZQ).every(id=>D.who[id].cm.concat(D.who[id].dm).every(g=>g.length===2)));
  check('0. 每一張照片都有你（寫「你」，或兩個人的影子、倒影）；D07 不貼',Object.keys(D.pic).every(k=>k==='D07'?D.pic[k]===null:/你|兩個人/.test(D.pic[k])),J(Object.keys(D.pic).filter(k=>D.pic[k]&&!/你|兩個人/.test(D.pic[k]))));
  check('0. 只有臺灣的 D01～D32：約會地點表和照片表同一組',J(Object.keys(DATE_DATA.locations).sort())===J(Object.keys(D.pic).sort()));
});

/* ======================= 1 以安 D01（BB 第 1 條）======================= */
await sec('1',async()=>{ need(); setup('2025-10-04',8,[AN]); const d=H.G.day;
  const r=await goDate(AN,['D01'],d,13), e=dq(r.trip);
  check('1. 和以安（交往中）約 D01：走完、算一次；排了一則（D01、不是又來、當天 21:30）',r.t.status==='done'&&r.t.counted&&!!e&&e.who===AN&&e.loc==='D01'&&e.again===false&&e.day===d&&hh(e.h)===hh(21.5),J(e));
  check('1. 分開的那一刻＝回到臺北（OUT.go 的回程走完；DATE.backAt 算的一樣）',!!e&&Math.abs(e.part-r.end)<1e-6&&r.end<T(d,21.5),J([e&&e.part,r.end]));
  const x=postAt(T(d,21.5),'dt_an_1');
  check('1. 21:29 還沒有、21:30 動態頁出一則 dt_an_1',!x.before&&!!x.it&&x.it.day===d&&hh(x.it.h)===hh(21.5),J(R().items));
  const p=P('dt_an_1'), D=FD();
  check('1. 照片是 D01 那一張（有你：兩個人的影子並排）、一句是第 1 句、留言私訊第 1 組',!!p&&p.who===AN&&p.pic===D.pic.D01&&p.say==='手帳上劃掉一個。'&&J(p.cm)===J(['今天很開心。','我也是。……你剛剛已經說過了。'])&&J(p.dm)===J(['手帳上寫了什麼？','日期和地點。還有一句，不給你看。']),J(p));
  check('1. 動態頁籤亮小點（新的）',FEED.newCount(H.G)===1);
  const h=FEED.html(H.G);
  check('1. 動態頁：她的名字、今天 21:30、（照片：紅磚牆前，兩個人的影子並排）、手帳上劃掉一個。、三個按鈕（按愛心、留言、私訊問一句）',
    h.includes('今天 21:30')&&h.includes('（照片：紅磚牆前，兩個人的影子並排）')&&h.includes('<div>手帳上劃掉一個。</div>')&&h.includes('data-fd="dt_an_1|heart"')&&h.includes('>今天很開心。</button>')&&h.includes('（私訊問一句）')&&h.includes('手帳上寫了什麼？'),h.slice(0,400));
  check('1. 看過就熄',FEED.newCount(H.G)===0);
  check('1. 約會動態不在 G.msgs（不是私訊、不算未讀）',!(H.G.msgs||[]).some(m=>m.fd==='dt_an_1'||/手帳上劃掉一個/.test(m.text||'')));
  check('1. 存檔：R.dt 記第幾句、第幾組、地點、行程、約會的那一天；R.dtTrip 那一趟＝dt_an_1；dq 清掉',J(R().dt.dt_an_1)===J({who:AN,loc:'D01',s:0,g:1,trip:r.trip,b:d})&&R().dtTrip[r.trip]==='dt_an_1'&&!R().dq.length,J([R().dt,R().dtTrip,R().dq]));
});

/* ======================= 2 又來、輪替、單雙數（BB 第 2 條）======================= */
await sec('2',async()=>{ need(); setup('2025-10-04',8,[AN]); const d0=H.G.day, D=FD().who[AN];
  const LOCS=['D01','D01','D02','D03','D04','D05','D06','D08'], got=[];
  for(let i=0;i<LOCS.length;i++){ const d=d0+3*i, r=await goDate(AN,[LOCS[i]],d,10); const e=dq(r.trip); const x=postAt(expect(AN,d,r.end),'dt_an_'+(i+1)); got.push({loc:LOCS[i],again:e&&e.again,id:x.it&&x.it.id,dt:R().dt['dt_an_'+(i+1)]||null}); }
  check('2. 再約 D01＝第二則用「又來」那一句（第二次來。這次走得比較慢。）',got[1].again===true&&!!got[1].dt&&got[1].dt.s===-1&&P('dt_an_2').say===D.again,J(got[1]));
  const S=got.map(g=>g.dt?g.dt.s:null);
  check('2. 八趟：第 1 句、又來、第 2～6 句、第 1 句（又來不佔順序；第 7 次「不是又來」回到第 1 句）',J(S)===J([0,-1,1,2,3,4,5,0]),J(S));
  check('2. 動態頁上的一句照那個順序',J(got.map((g,i)=>P('dt_an_'+(i+1))&&P('dt_an_'+(i+1)).say))===J([D.say[0],D.again,D.say[1],D.say[2],D.say[3],D.say[4],D.say[5],D.say[0]]),J(got.map((g,i)=>P('dt_an_'+(i+1))&&P('dt_an_'+(i+1)).say)));
  check('2. id 照她第幾則約會動態（又來也算）：dt_an_1～dt_an_8',J(got.map(g=>g.id))===J(LOCS.map((l,i)=>'dt_an_'+(i+1))),J(got.map(g=>g.id)));
  check('2. 留言、私訊：單數第 1 組、雙數第 2 組',J(got.map(g=>g.dt&&g.dt.g))===J([1,2,1,2,1,2,1,2])&&P('dt_an_2').cm[0]==='照片好看。'&&P('dt_an_2').dm[0]==='下一個去哪？'&&P('dt_an_3').cm[0]==='今天很開心。',J(got.map(g=>g.dt&&g.dt.g)));
  check('2. 照片照那一趟的地點（第二則也是 D01、最後一則 D08）',P('dt_an_2').pic===FD().pic.D01&&P('dt_an_8').pic===FD().pic.D08&&P('dt_an_5').pic===FD().pic.D04);
});

/* ======================= 3 D07 不出（BB 第 3 條）；心願那一趟也走結算 ======================= */
await sec('3',async()=>{ need(); setup('2025-10-04',8,[AN,ZR]); const d=H.G.day;
  const r=await goDate(AN,['D07'],d,10);
  check('3. 和以安約 D07（她的心願地點：整趟是心願事件 WISH.scene）：走完、算一次、心願成立',r.t.status==='done'&&r.t.counted&&DATE.log(H.G,AN).wish===true&&DATE.log(H.G,AN).byLoc.D07===1,J([r.t.status,r.t.counted,DATE.log(H.G,AN)]));
  tickAt(d,21.5); tickAt(d+1,8);
  check('3. D07 不貼：沒有排、當晚和隔天都沒有約會動態',!dq(r.trip)&&!dts().length&&R().dtTrip[r.trip]==null,J([R().dq,R().items]));
  const r2=await goDate(AN,['D07'],d+3,10); tickAt(d+3,21.5); tickAt(d+4,8);
  check('3. 第二次 D07（一般的約會）也不貼',r2.t.counted&&!dq(r2.trip)&&!dts().length);
  check('3. FEED.dateDone 直接叫 D07 也不排',FEED.dateDone(H.G,r2.t,T(d+3,15))===null&&!R().dq.length);
  const r3=await goDate(ZR,['D05'],d+6,14), e=dq(r3.trip);
  check('3. 心願那一趟也走 S.settle：芷若（交往中）第一次 D05＝心願事件，排了（當晚 22:07）',r3.t.counted&&DATE.log(H.G,ZR).wish===true&&!!e&&e.loc==='D05'&&r3.end<T(d+6,22+7/60)&&Math.abs(T(e.day,e.h)-T(d+6,22+7/60))<1e-3,J([e,DATE.log(H.G,ZR),r3.end-T(d+6,0)]));
  const x=postAt(expect(ZR,d+6,r3.end),'dt_zr_1');
  check('3. 芷若那一則：照片 D05、第 1 句',!x.before&&!!x.it&&P('dt_zr_1').pic===FD().pic.D05&&P('dt_zr_1').say===FD().who[ZR].say[0],J(R().items));
});

/* ======================= 4 七天兩則（BB 第 4 條）======================= */
await sec('4',async()=>{ need(); setup('2025-10-19',8,[AN]);
  fakeSet([{id:'tw1',who:AN,t:'2025-10-20 20:00'},{id:'tw2',who:AN,t:'2025-10-21 20:00'},{id:'tw3',who:AN,t:'2025-10-24 20:00'},
    {id:'tw4',who:AN,t:'2025-11-03 20:00'},{id:'tw5',who:AN,t:'2025-11-05 20:00'}]);
  try{
    tickAt(DK('2025-10-20'),20); tickAt(DK('2025-10-21'),20);
    check('4. 前置：這一週她已經貼了兩則自己的（10/20、10/21）',!!item('tw1')&&!!item('tw2'),J(R().items));
    const d=DK('2025-10-22'), r=await goDate(AN,['D02'],d,13), x=postAt(expect(AN,d,r.end),'dt_an_1');
    check('4. 10/22 約會：約會那一則照出（不算在「女主角七天最多兩則」裡）',!x.before&&!!x.it,J(R().items.map(i=>i.id)));
    tickAt(DK('2025-10-24'),20);
    check('4. 10/24 她自己的第三則照舊不出（七天兩則只數她自己的：10/20、10/21）',R().done.tw3==='x:week'&&!item('tw3'),R().done.tw3);
    tickAt(DK('2025-11-03'),20); const d2=DK('2025-11-04'), r2=await goDate(AN,['D03'],d2,13); postAt(expect(AN,d2,r2.end),'dt_an_2'); tickAt(DK('2025-11-05'),20);
    check('4. 約會那一則不佔她的名額：11/3 自己的、11/4 約會、11/5 自己的第二則照出',!!item('tw4')&&!!item('dt_an_2')&&!!item('tw5')&&R().done.tw5==='p',J([R().done.tw5,R().items.map(i=>i.id)]));
  } finally { noSet(); }
});

/* ======================= 5 語彤、子晴（BB 第 5 條）======================= */
await sec('5',async()=>{ need(); setup('2025-10-04',8,[YT,ZQ]); const d=H.G.day;
  const r=await goDate(YT,['D02'],d,13), x=postAt(expect(YT,d,r.end),'dt_yt_1'), p=P('dt_yt_1');
  check('5. 語彤：當晚 23:00 出一則、一句是空的（只有照片）',!x.before&&!!x.it&&hh(x.h)===hh(23)&&!!p&&p.say===''&&p.pic===FD().pic.D02,J([x.it,p]));
  const card=FEED.card(H.G,x.it);
  check('5. 語彤：動態頁照片下面直接是按鈕（沒有她的字）',/feedPic">（照片：生態池邊的長椅，你的背影，手上拿著兩杯飲料）<\/div><div class="row2"/.test(card),card.slice(0,300));
  const a=resp('dt_yt_1','cm'), lab='照片：'+FD().pic.D02;
  check('5. 語彤：留言她回「嗯。」；私訊對話串標「動態「照片：…」」（沒有字的照舊）',J(a.txt)===J(['好看。','嗯。'])&&!!a.m&&FEED.refLabel(H.G,a.m)===' · 動態「'+lab.slice(0,13)+'…」',J([a.txt,a.m&&FEED.refLabel(H.G,a.m)]));
  const d2=d+2, r2=await goDate(ZQ,['D15'],d2,19), e=dq(r2.trip);
  check('5. 子晴：晚上的約會（D15）回到臺北 22 點多，還沒到 00:30＝隔天凌晨 00:30',!!e&&r2.end<T(d2,24.5)&&e.day===d2+1&&hh(e.h)===hh(0.5),J([e,r2.end-T(d2,0)]));
  const y=postAt(T(d2+1,0.5),'dt_zq_1'), q=P('dt_zq_1');
  check('5. 子晴：00:29 還沒有、00:30 出（隔天的動態）；一句「存檔」沒有句號',!y.before&&!!y.it&&y.it.day===d2+1&&!!q&&q.say==='存檔'&&!/。/.test(q.say),J([y.it,q]));
  const b=resp('dt_zq_1','cm');
  check('5. 子晴：留言她回的拆成兩則（「嗯」「怕忘記」：三則訊息）',J(b.txt)===J(['存檔？','嗯','怕忘記']),J(b.txt));
  const d3=d2+3, r3=await goDate(ZQ,['D02'],d3,15); postAt(expect(ZQ,d3,r3.end),'dt_zq_2'); const c=resp('dt_zq_2','dm');
  check('5. 子晴：第二則用第 2 組；私訊問一句她答的也拆成兩則（「好」「選難一點的」）',J(c.txt)===J(['下次換妳選地方','好','選難一點的'])&&P('dt_zq_2').say==='今天的存檔點',J(c.txt));
});

/* ======================= 6 七位的時間、過時間回家 30 分鐘 ======================= */
await sec('6',async()=>{ need(); const got=[];
  for(const id of ALL){ setup('2025-10-04',8,[id]); const d=H.G.day, r=await goDate(id,['D02'],d,13), pre=FD().who[id].pre, want=expect(id,d,r.end), x=postAt(want,'dt_'+pre+'_1');
    got.push({id,ok:!x.before&&!!x.it&&hh(T(x.it.day,x.it.h))===hh(want)&&r.end<T(d,herH(id)),when:x.it&&[x.it.day-d,FEED.whenText(H.G,x.it.day,x.it.h)]}); }
  check('6. 七位（交往中、下午的約會）：照她的時間——以安 21:30、芷若 22:07、語彤 23:00、子晴隔天 00:30、學姊 22:00、可昕 23:30、沛珊 23:10',got.every(g=>g.ok)&&J(got.map(g=>g.when&&g.when[0]))===J([0,0,0,1,0,0,0]),J(got));
  /* 晚上的約會：回到臺北已經過了她的時間 */
  setup('2025-10-04',8,[AN]); const d=H.G.day, r=await goDate(AN,['D15'],d,19), e=dq(r.trip);
  check('6. 以安晚上約 D15（陽明山夜景）：回到臺北已經過了 21:30＝回到家 30 分鐘後（分開那一刻＋30 分鐘）',!!e&&r.end>T(d,21.5)&&Math.abs(T(e.day,e.h)-(r.end+0.5))<1e-3,J([e,r.end-T(d,0)]));
  { const dd=Math.floor(r.end/24+1e-9); tickAt(dd,r.end-dd*24); } const atBack=item('dt_an_1'), x=postAt(r.end+0.5,'dt_an_1');
  check('6. 回到臺北的那一刻還沒有、30 分鐘後的前一分鐘也沒有、那一刻才有',!atBack&&!x.before&&!!x.it,J(R().items));
  /* 剛好、差一分鐘（S.dtWhen） */
  const W=(id,part)=>{ const w=FEED.dtWhen(id,d,part); return w&&hh(T(w.day,w.h)-T(d,0)); };
  check('6. 分開的時候剛好是她的時間＝那個時間；早一分鐘＝那個時間；晚一分鐘＝分開＋30 分鐘',W(AN,T(d,21.5))===hh(21.5)&&W(AN,T(d,21.5)-1/60)===hh(21.5)&&W(AN,T(d,21.5)+1/60)===hh(21.5+1/60+0.5),J([W(AN,T(d,21.5)),W(AN,T(d,21.5)-1/60),W(AN,T(d,21.5)+1/60)]));
  check('6. 子晴：分開在 00:30 以前＝00:30；過了午夜一點＝分開＋30 分鐘',W(ZQ,T(d,23.9))===hh(24.5)&&W(ZQ,T(d,25))===hh(25.5),J([W(ZQ,T(d,23.9)),W(ZQ,T(d,25))]));
});

/* ======================= 7 一趟一則：兩天一夜、兩個地點 ======================= */
await sec('7',async()=>{ need(); setup('2025-10-04',8,[KX,AN]); const d=H.G.day;
  const r=await goDate(KX,['D31','D32'],d,9,{kind:'overnight'}), e=dq(r.trip);
  check('7. 可昕兩天一夜 D31＋D32：走完（兩天）、排一則——照片用最後一個地點（清境 D32）、回到臺北那一天（第二天）',r.t.counted&&r.t.kind==='overnight'&&!!e&&e.loc==='D32'&&e.day===d+1&&Math.abs(T(e.day,e.h)-expect(KX,d+1,r.end))<1e-3,J([e,r.end-T(d,0)]));
  tickAt(d,23.5);
  check('7. 第一天晚上（23:30）不貼',!dts().length);
  const x=postAt(expect(KX,d+1,r.end),'dt_kx_1');
  check('7. 回到臺北那一晚貼一則：照片「雲海，觀景台的欄杆上是你的手」',!x.before&&!!x.it&&P('dt_kx_1').pic===FD().pic.D32&&P('dt_kx_1').say==='我排的。',J([x.it,P('dt_kx_1')]));
  check('7. 一趟只有一則（R.dtTrip 記那一趟＝dt_kx_1）；同一趟再叫 FEED.dateDone 不再排',dts().filter(i=>i.who===KX).length===1&&R().dtTrip[r.trip]==='dt_kx_1'&&FEED.dateDone(H.G,r.t,r.end)===null&&!R().dq.length,J(R().dtTrip));
  const r2=await goDate(AN,['D26'],d+4,9,{kind:'overnight'}), e2=dq(r2.trip);
  check('7. 以安兩天一夜 D26：回到臺北那一天、照片 D26',!!e2&&e2.loc==='D26'&&e2.day===d+5,J(e2));
  postAt(expect(AN,d+5,r2.end),'dt_an_1');
  check('7. 那一則在回到臺北那一晚',!!item('dt_an_1')&&item('dt_an_1').day===d+5&&P('dt_an_1').pic===FD().pic.D26);
  /* 當天兩個地點（同一趟）：用最後一個（DATE.complete 兩個地點都記）*/
  const t={trip:'TX1',who:AN,locs:['D13','D14'],day:d+9,depart:10,back:18,transport:'mrt',departed:true,status:'done',spots:['D13.walk']};
  DATE.complete(H.G,t); const e3=FEED.dateDone(H.G,DATE.trip(H.G,'TX1'),T(d+9,17));
  check('7. 當天同一趟兩個地點（D13＋D14）：照片用 D14',!!e3&&e3.loc==='D14'&&e3.day===d+9,J(e3));
});

/* ======================= 8 同一天最多一則約會動態 ======================= */
await sec('8',async()=>{ need(); setup('2025-10-04',8,[AN,ZR,ZQ]); const d=H.G.day;
  const a=await goDate(AN,['D02'],d,9), b=await goDate(ZR,['D03'],d,15);
  check('8. 同一天兩位交往中各約一趟：兩則都排了（以安 21:30、芷若 22:07）',!!dq(a.trip)&&!!dq(b.trip),J(R().dq));
  tickAt(d,23.9);
  check('8. 同一天最多一則：以安那一則出、芷若那一則不出（x:dateday）',!!item('dt_an_1')&&!item('dt_zr_1')&&R().dtTrip[b.trip]==='x:dateday'&&dts().filter(i=>i.day===d).length===1,J([R().dtTrip,dts()]));
  const c=await goDate(AN,['D04'],d+2,9), e=await goDate(AN,['D06'],d+2,15); tickAt(d+2,23.9);
  check('8. 同一位同一天兩趟：一則（第一趟），第二趟 x:dateday',!!item('dt_an_2')&&R().dtTrip[c.trip]==='dt_an_2'&&R().dtTrip[e.trip]==='x:dateday'&&dts().filter(i=>i.day===d+2).length===1,J(R().dtTrip));
  check('8. 沒貼出來的不記（R.dt 以安只有兩則）',Object.keys(R().dt).filter(k=>R().dt[k].who===AN).length===2&&!R().dt.dt_zr_1,J(R().dt));
  const f=await goDate(ZQ,['D02'],d+4,15), g=await goDate(AN,['D03'],d+5,9); tickAt(d+5,23.9);
  check('8. 「同一天」照約會的那一天：子晴 00:30 那一則是前一天那一場的；隔天和以安的約會照出（dt_an_3、第 3 句：前面沒貼出來的不佔序號、輪替）',
    !!item('dt_zq_1')&&item('dt_zq_1').day===d+5&&R().dtTrip[f.trip]==='dt_zq_1'&&R().dtTrip[g.trip]==='dt_an_3'&&R().dt.dt_an_3.s===2&&R().dt.dt_zq_1.b===d+4&&R().dt.dt_an_3.b===d+5,J([R().dtTrip,R().dt.dt_an_3]));
  /* 晚上的約會過了午夜才回來（改時間「晚一個小時」最晚 24:30）：那一則貼在隔天凌晨，還是前一天的；隔天另一場照出 */
  const tl={trip:'TL1',who:AN,locs:['D06'],day:d+7,depart:18,back:23.5,transport:'mrt',departed:true,status:'done',spots:['D06.lawn']};
  DATE.complete(H.G,tl); const el=FEED.dateDone(H.G,DATE.trip(H.G,'TL1'),T(d+7,24.1)); const h=await goDate(AN,['D08'],d+8,13); tickAt(d+8,23.9);
  check('8. 過了午夜才分開：那一則 00:36 貼在隔天、算前一天的；隔天下午的約會那一則 21:30 照出',!!el&&el.base===d+7&&el.day===d+8&&hh(el.h)===hh(0.6)&&R().dtTrip.TL1==='dt_an_4'&&R().dtTrip[h.trip]==='dt_an_5'&&dts().filter(i=>i.day===d+8).length===2,J([el,R().dtTrip]));
});

/* ======================= 9 一天四則：這一則優先，別人的往後擠 ======================= */
await sec('9',async()=>{ need();
  /* (a) 前面已經四則 */
  setup('2025-10-04',8,[AN]); const d=H.G.day, K='2025-10-04 ';
  fakeSet([{id:'q1',who:ZR,t:K+'08:30'},{id:'q2',who:YT,t:K+'08:40'},{id:'q3',who:ZQ,t:K+'08:50'},{id:'q4',who:SIS,t:K+'09:00'}]);
  try{
    tickAt(d,9.5); check('9. 前置：那一天早上已經出了四則（別人的）',['q1','q2','q3','q4'].every(id=>!!item(id)),J(R().items));
    const r=await goDate(AN,['D02'],d,13); postAt(expect(AN,d,r.end),'dt_an_1');
    check('9. 一天已經四則：約會那一則照樣出（優先；那一天五則）',!!item('dt_an_1')&&R().items.filter(i=>i.day===d).length===5,J(R().items.map(i=>i.id)));
  } finally { noSet(); }
  /* (b) 排好以後、貼出來以前：那一天別人的先算它的位子 */
  const run=async withDate=>{ setup('2025-10-04',8,[AN]); fakeSet([{id:'q1',who:ZR,t:K+'08:30'},{id:'q2',who:YT,t:K+'08:40'},{id:'q3',who:ZQ,t:K+'08:50'},{id:'q5',who:PS,t:K+'21:00'},{id:'q6',who:KX,t:K+'22:30'}]);
    try{ tickAt(d,9.5); let r=null; if(withDate) r=await goDate(AN,['D02'],d,13); tickAt(d,21); const q5=R().done.q5; tickAt(d,21.5); tickAt(d,22.5); return {q5,q6:R().done.q6,dt:!!item('dt_an_1'),n:R().items.filter(i=>i.day===d).length,r}; } finally { noSet(); } };
  const w=await run(true), o=await run(false);
  check('9. 三則以後約會（17:00 前回來、21:30 才貼）：21:00 沛珊那一則往後擠（x:day），21:30 約會那一則出，那一天四則',w.q5==='x:day'&&w.dt&&w.n===4,J(w));
  check('9. 對照：沒有約會的同一天，21:00 沛珊那一則照出（是約會那一則佔了位子）',o.q5==='p'&&o.n===4,J(o));
  check('9. 約會那一則貼了以後照算：22:30 可昕那一則不出（x:day）',w.q6==='x:day'&&o.q6==='x:day',J([w.q6,o.q6]));
});

/* ======================= 10 沒交往、分開、經濟系、以前的約會 ======================= */
await sec('10',async()=>{ need(); setup('2025-10-04',8,[]); const d=H.G.day;
  check('10. 前置：以安第 6 階（很熟、她的戀愛 60），沒有交往',DATE.stageNum(AN)===6&&!H.G.flags.dating_heroine_01);
  const r=await goDate(AN,['D01'],d,13); tickAt(d,23.9);
  check('10. 沒有交往：約會照算，不排、不貼',r.t.counted&&!dq(r.trip)&&!dts().length,J(R().dq));
  H.G.flags.dating_heroine_01=true; const r2=await goDate(AN,['D02'],d+2,13);
  check('10. 交往中約會：排了',!!dq(r2.trip));
  at(d+2,20); H.G.flags.dating_heroine_01=false; tickAt(d+2,21.5); tickAt(d+2,23.9);
  check('10. 排好以後、21:30 以前分開了：不貼（x:dating）',!dts().length&&R().dtTrip[r2.trip]==='x:dating',J(R().dtTrip));
  setup('2025-10-04',8,[KX],{stage:'econ'}); const t={trip:'TE1',who:KX,locs:['D02'],day:H.G.day,depart:13,back:17,transport:'mrt',departed:true,status:'done',spots:['D02.pond']};
  DATE.complete(H.G,t);
  check('10. 經濟系那一年不排（動態頁只在法律系）',FEED.dateDone(H.G,DATE.trip(H.G,'TE1'),T(H.G.day,17))===null);
  /* 以前的約會（讀檔以前、舊版走完的）不補 */
  setup('2025-10-04',8,[AN]); const d3=H.G.day, old={trip:'T0009',who:AN,locs:['D01'],day:d3,depart:10,back:15,transport:'mrt',departed:true,status:'done',spots:['D01.wall']};
  DATE.complete(H.G,old); tickAt(d3,21.5); tickAt(d3+1,8);
  check('10. 舊存檔：以前走完的約會（沒有經過新的結算）不補',!dts().length&&!R().dq.length);
});

/* ======================= 11 回應 ======================= */
await sec('11',async()=>{ need(); setup('2025-10-04',8,[AN]); const d=H.G.day;
  for(let i=0;i<3;i++){ const dd=d+2*i, r=await goDate(AN,['D0'+(i+1)],dd,13); postAt(expect(AN,dd,r.end),'dt_an_'+(i+1)); }
  at(d+4,23.9); const f0=SOCIAL.rel(AN).fam; const a=resp('dt_an_1','heart');
  check('11. 按愛心：她不回（沒有新訊息）、熟悉 +1',!!a.r&&!a.txt.length&&SOCIAL.rel(AN).fam===f0+1,J([a.txt,SOCIAL.rel(AN).fam-f0]));
  check('11. 一則只回一次',FEED.respond(H.G,'dt_an_1','cm')===null);
  const b=resp('dt_an_2','cm');
  check('11. 留言（第 2 則＝第 2 組）：你「照片好看。」→ 她「你站得很好。」，進私訊對話串、標「動態「（她那一則的一句，超過十四個字截短）」」',J(b.txt)===J(['照片好看。','你站得很好。'])&&!!b.m&&b.m.fk==='cm'&&(H.G.msgs||[]).filter(m=>m.text==='你站得很好。').every(m=>m.th==='p:'+AN)&&FEED.refLabel(H.G,b.m)===' · 動態「今天沒有照計畫走。……也很…」',J([b.txt,b.m&&FEED.refLabel(H.G,b.m)]));
  check('11. 同一個人一天只加一次熟悉（留言那一次不再加）',SOCIAL.rel(AN).fam===f0+1);
  const c=resp('dt_an_3','dm');
  check('11. 私訊問一句（第 3 則＝第 1 組）：「手帳上寫了什麼？」→「日期和地點。還有一句，不給你看。」',J(c.txt)===J(['手帳上寫了什麼？','日期和地點。還有一句，不給你看。'])&&!!c.m&&c.m.fk==='dm',J(c.txt));
  check('11. 回過的：按鈕換成結果（看私訊）',/你留言：照片好看。/.test(FEED.card(H.G,item('dt_an_2')))&&/♥ 你按了愛心/.test(FEED.card(H.G,item('dt_an_1'))));
});

/* ======================= 12 七天、十五天、舊存檔、存讀檔、畢業以後篇 ======================= */
await sec('12',async()=>{ need(); setup('2025-10-04',8,[AN]); const d=H.G.day;
  const r=await goDate(AN,['D01'],d,13); postAt(T(d,21.5),'dt_an_1'); const m=resp('dt_an_1','cm').m;
  tickAt(d+7,21.49); const in7=FEED.visible(H.G).some(i=>i.id==='dt_an_1'); tickAt(d+7,21.51);
  check('12. 只留七天（同其他動態）',in7&&!FEED.visible(H.G).some(i=>i.id==='dt_an_1'));
  tickAt(d+16,12);
  check('12. 十五天以後 items 清掉；私訊對話串還認得那一則（R.dt 不刪）',!item('dt_an_1')&&!!R().dt.dt_an_1&&FEED.refLabel(H.G,m)===' · 動態「手帳上劃掉一個。」',FEED.refLabel(H.G,m));
  /* 舊存檔：FEED 是上一版的樣子（沒有 dq、dt、dtTrip）*/
  setup('2025-10-04',8,[AN]); const d2=H.G.day; H.G.flags.FEED={start:d2-40,items:[],done:{an1:'p'},dm:{},seen:-1e9};
  const r2=await goDate(AN,['D01'],d2,13); postAt(expect(AN,d2,r2.end),'dt_an_1');
  check('12. 舊存檔（FEED 沒有 dq、dt、dtTrip）：補成空的，讀檔以後的約會照貼',Array.isArray(R().dq)&&!!item('dt_an_1')&&R().done.an1==='p',J(H.G.flags.FEED).slice(0,300));
  /* 排好還沒貼的，存讀檔以後照貼 */
  const r3=await goDate(AN,['D02'],d2+2,13); const G2=JSON.parse(JSON.stringify(H.G)); H.G=G2; SOCIAL.bind(G2);
  postAt(expect(AN,d2+2,r3.end),'dt_an_2');
  check('12. 存讀檔（JSON）以後，排好還沒貼的照時間貼',!!item('dt_an_2')&&R().dtTrip[r3.trip]==='dt_an_2'&&P('dt_an_2').say===FD().who[AN].say[1]);
  /* 畢業以後篇跳時間的途中貼的：照 AA_511 記 tr＝'pg'（停下來以後再留七天）*/
  const r4=await goDate(AN,['D03'],d2+4,13); const w4=expect(AN,d2+4,r4.end), dd=Math.floor(w4/24); FEED.pgJumping=1; try{ tickAt(dd,w4-dd*24); } finally { FEED.pgJumping=0; }
  check('12. 畢業以後篇跳時間的途中貼的：記 tr＝\'pg\'（同 S.decide）',!!item('dt_an_3')&&item('dt_an_3').tr==='pg',J(item('dt_an_3')));
});

H.done();
})();

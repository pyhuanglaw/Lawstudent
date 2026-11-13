// 校外約會的心願事件（DATE-C4、DATE-C5；src/wish3d.js、src/data/date_wish.js＝tools/date/import_wish.py；企劃線 AA_127 第 1、2 節、BB_128 第 3 節、date_system/wish/）。不需要瀏覽器。
// 檢查：0 資料（白名單版本、和企劃線的 wish_aa.json@967b4273a／wish_bb.json@a1bc53f4c（AA_447 芷若「是A，不是B」；之前 a5b936a69 AA_439 芷若心願句；之前 1ced2f8b3 AA_432 學姊 18:30）逐欄相同、每一句在 AA_127@967b4273a／BB_128@1ced2f8b3、以安大一收尾照 AA_127 1-5、AA_426 改稿以後沒有 hold、七位都沒有違反人物規則的字、接線、沒有 CG）
//   1 以安 D07  2 語彤 D13  3 芷若 D05  4 沛珊 D06：每一位——聊天提到（INV.meet）、她主動約（手機：訊息、答應＝訂下那一趟 by:'her'、這週不行、每學期一次、她不在不約）、
//     玩家約她（她回 known／unknown）、那一天在心願地點（抵達、互動點、收尾、記旗標記憶相簿、算一次、心願完成）、只有第一次（第二次照一般約會）
//   5 子晴 D03  6 學姊 D15  7 可昕 D25（AA_426 改稿，企劃線 967b4273a：原本 hold 的三位）：聊天提到、她主動約、玩家約她、那一天、學姊 closing.after 的學期、學姊沒有數東西的句子
// 修改前（開發分支 bd52bab8b）：沒有 src/wish3d.js、src/data/date_wish.js——第 0 節以後全部 FAIL。用法：node tests/date_wish_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let ok1=false, ok2=false, err=''; try{ ok1=load('src/data/date_wish.js'); ok2=load('src/wish3d.js'); }catch(e){ err=String(e); }
const X=()=>typeof WISH!=='undefined'?WISH:null;
const git=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const AA127=git('482c7f6e9','AA_127_以安語彤_心願約會與邀約變化.md'), BB128=git('9aa8ec40c','BB_128_校外單獨約會_心願地點與淡水示範規格.md');   /* AA_475（10-27）：白名單換版；11-08 AA_593 學姊①b 換 9aa8ec40c */
const AA593=git('6cbb0b4ab','AA_593_學姊改稿_1b_手機與其他系統.md'), FIX593=AA593.includes('| 好。那我先把那一格擦掉。……下次再寫回來。 | 好。……那下次。 |')?['好。……那下次。']:[];   /* AA_593 第 82 列：學姊 herInvite.decline（wish_bb.json@9aa8ec40c 已改；BB_128 原稿沒有這一句，對 AA_593 的表）*/
const AA626=git('9ba14498e','AA_626_語彤D13淡水_新背景改寫.md');   /* YT-REWRITE-1103：語彤 D13 照 AA_626（取代 AA_127 第 2 節衝突的句子），wish_aa.json 白名單 9ba14498e */
const WAA=(()=>{ try{ return JSON.parse(git('9ba14498e','date_system/wish/wish_aa.json')); }catch(e){ return null; } })(), WBB=(()=>{ try{ return JSON.parse(git('9aa8ec40c','date_system/wish/wish_bb.json')); }catch(e){ return null; } })();
/* 2026-11-11（X327 沛珊重寫）：沛珊 D06 的心願事件照 AA_757_peishan_wish_hometown.json@052644c58（import_wish.py 的 1f：wish_rows 69 列疊在 wish_bb.json 上，換完＝稿的 wish_event）——沛珊那一位改對這份稿 */
const AA757=(()=>{ try{ return JSON.parse(git('8d3bec48be','AA_757_peishan_wish_hometown.json')); }catch(e){ return null; } })();   /* 2026-11-13（AA_944 第 3 節）：白名單換 8d3bec48be（到達 high 那一句換字），稿跟著讀這一版。舊：052644c58 */
/* 2026-11-11（X324 學姊約會台詞重寫，AA 82c946ad7）：學姊 D15 的心願事件照 AA_764_sis_wish.json@82c946ad7（import_wish.py 的 1g：rows 32 列疊在 wish_bb.json 上——AA_595、AA_593 兩層照舊先套——換完＝稿的 wish_event）——學姊那一位改對這份稿 */
const AA764=(()=>{ try{ return JSON.parse(git('82c946ad7','AA_764_sis_wish.json')); }catch(e){ return null; } })();
/* 2026-11-11（X324 語彤約會台詞重寫，AA 0a2136911）：語彤 D13 的心願事件照 AA_768_yt_wish.json@0a2136911 收字（import_wish.py 的 1h：rows 34 列照 path 疊在 wish_aa.json 語彤那一段上；內容、選項、條件不動）——語彤那一位改對這份稿 */
const AA768=(()=>{ try{ return JSON.parse(git('0a2136911','AA_768_yt_wish.json')); }catch(e){ return null; } })();
/* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）：可昕 D25 的心願事件照 AA_770_kx_wish.json@f9c1a2b80 收字（import_wish.py 的 1i：rows 23 列照 path 疊在 wish_bb.json 可昕那一段上；內容不動，她開口約的那句改用 {出發時間}）——可昕那一位改對這份稿 */
const AA770=(()=>{ try{ return JSON.parse(git('f9c1a2b80','AA_770_kx_wish.json')); }catch(e){ return null; } })();
/* 2026-11-11（X324 芷若約會台詞重寫，AA_774_zr_wish.json@e8a33995c）：芷若 D05 的心願事件照 AA_774_zr_wish.json 收字（import_wish.py 的 1j：rows 27 列照 path 疊在 wish_bb.json 芷若那一段上；內容、選項、條件、時間不動）——芷若那一位改對這份稿。SHA 讀 tests/date_src_sha.js */
const SHA776=require('./date_src_sha.js').ZQ_WISH_SHA, AA776=(()=>{ try{ return JSON.parse(git(SHA776,'AA_776_zq_wish.json')); }catch(e){ return null; } })();   /* 2026-11-11（X324 子晴約會台詞重寫，AA_776_zq_wish.json@26e72fd51）：子晴 D03 心願事件 30 列 */
const SHA778=require('./date_src_sha.js').AN_WISH_SHA, AA778=(()=>{ try{ return JSON.parse(git(SHA778,'AA_778_an_wish.json')); }catch(e){ return null; } })();   /* 2026-11-11（X324 以安約會台詞重寫，AA_778_an_wish.json@1f88da7cc）：以安 D07 心願事件 16 列（import_wish.py 的 1l：照 path 疊在 wish_aa.json＋AA_594 第 2-13 節上面；內容、選項、條件、時間、分年級的分支不動）*/
const SHA774=require('./date_src_sha.js').ZR_WISH_SHA, AA774=(()=>{ try{ return JSON.parse(git(SHA774,'AA_774_zr_wish.json')); }catch(e){ return null; } })();
const ANREV=require('./an_rev_doc.js');   /* 以安改稿①b、④b 改過的句子（逐列核對在 tests/aa592_an_1b_unit.js、aa594_an_4b_unit.js）*/
const J=JSON.stringify, AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
const norm=t=>String(t).replace(/[\s　]/g,'').replace(/『/g,'「').replace(/』/g,'」');
const inMd=(t,md)=>{ const n=norm(md); return [t,t.replace(/^（|）$/g,''),t.replace(/[。：]$/,''),t.replace(/^她/,''),t.replace(/^她/,'').replace(/[。：]$/,'')].some(x=>x&&n.includes(norm(x))); };
GM.money=d=>{ H.G.money+=d; };
{ const ch=GM.choose; let n=0; GM.choose=async o=>{ if(++n>3000) throw new Error('選單無限迴圈：'+J(o.map(x=>x.t))+' '+J(H.said.slice(-3))); return ch(o); }; GM._resetChoose=()=>{ n=0; }; }   /* 測試保護：選到灰掉的選項會一直重問 */
const lv=(id,n)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:n>=4?65:(n>=3?45:25),trust:n>=4?50:(n>=3?30:0),comf:n>=4?45:0,npcRom:n>=6?60:(n>=5?35:0),rom:n>=6?35:0}); SOCIAL.remember(id,'FIRST_MET',''); };
const setup=(key,h,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'dorm',o.flags||{}); G.outings=[]; G.contacts=G.contacts||{}; G.money=8000;
  for(const [id,n] of Object.entries(o.lv||{})){ lv(id,n==='dt'?6:n); if(n==='dt') ROM.start(G,id); G.contacts[id]=G.day-60; } for(const e of (o.ev||[])) G.events.done[e]=true; if(STORY._bindGM) STORY._bindGM(GM); return G; };
const at=(key,h)=>{ const G=H.G; G.day=H.D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
const said=()=>H.said.map(s=>s.t);
const sp=(id,arr)=>(arr||[]).filter(l=>l.who===id).map(l=>l.text);   /* 她說的那幾句 */
const allSay=arr=>(arr||[]).filter(l=>l.who!=='note').map(l=>l.who==='narr'?(/^（/.test(l.text)?l.text:'（'+l.text+'）'):l.text);
const has=(L,arr)=>arr.every(t=>L.includes(t));
const meet=async(id,place,want)=>{ const G=H.G; G.zone=INV.place(place).zone; const iv=INV.accept(G,id,place,G.day,G.hour,{by:'player'}); H.said=[]; H.opts=[]; H.picks=[0,0,0,0,0,0];
  const ch=GM.choose; if(want) GM.choose=async o=>{ const k=o.findIndex(q=>String(q.t||q.text||'').includes(want)); if(k>=0){ H.opts.push(o.map(q=>q.t||q.text)); return k; } return ch(o); };   /* want：選單裡有這個選項就選它（見面那一段前面可能先有別的選項）*/
  try{ await INV.meet(GM,iv,null); } finally { GM.choose=ch; } return {L:said(),O:H.opts.slice()}; };
const phone=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const msgs=id=>H.msgs('p:'+id);
const goDate=async(id,loc,depart,picks,o)=>{ o=o||{}; const G=H.G; GM._resetChoose(); const b=DATE.book(G,{who:id,locs:[loc],transport:o.tr||((DATE.loc(loc).transport||[])[0]||{}).mode,day:G.day,depart}); if(!b.ok) return {b,L:[],O:[]};
  const q=OUT.get(G,'date_'+b.trip); G.hour=depart; H.said=[]; H.opts=[]; H.cgs=[]; H.picks=['出發'].concat(picks||[]); await OUT.prompt(GM,q); return {b,t:DATE.trip(G,b.trip),L:said(),O:H.opts.slice()}; };
const E_=id=>X()&&X().ev(id);

(async()=>{
  /* ======================= 0 資料與接線 ======================= */
  check('0. src/data/date_wish.js、src/wish3d.js 載得到',ok1&&ok2&&!!X(),err);
  if(!X()){ H.done(); return; }
  const DW=require('./aa959_map.js').unmapDeep(DATE_WISH,'date_wish.js')/* AA_959（DLG-FULL-REVIEW-1110）：和企劃線的稿逐格比——匯入最後一步照覆寫表換的字先換回來 */, CS921=require('./date_src_sha.js'), DW0=CS921.unWish921(JSON.parse(JSON.stringify(DATE_WISH)),true)/* 2026-11-13：unWish921 預設也會還原 AA_944 沛珊那一格（WISH944_1113）；這支比的是 AA_757@8d3bec48be，那一格不還原（keep944） */;   /* DW0＝第五批（wish_bb.json 6dbfe10d7e）那 29 格還原成上一版的字（tests/date_src_sha.js WISH921_1112） */
  check('0. 來源＝白名單版本：wish_aa.json@9ba14498e（AA_626 語彤 D13；之前 482c7f6e9）、AA_127@482c7f6e9（AA_475 第 1 節以安心願；之前 967b4273a AA_426）、wish_bb.json@9aa8ec40c、BB_128@9aa8ec40c（11-08 AA_593 學姊①b；之前 ab9d70fe0 AA_475 第 1、3 節沛珊、芷若心願；之前 cb5caad65 AA_459／460 三句改進原稿）',/wish_aa\.json@9ba14498/.test(DW.source)&&/wish_bb\.json@6dbfe10d/.test(DW.source)/* 2026-11-12（CANON-NO-ECON-1112 第五批）：wish_bb.json 換到 6dbfe10d7e（AA_921 第 2 節可昕換主題）；舊期望 9aa8ec40 */&&/AA_127[^＋]*@482c7f6e/.test(DW.source)&&/BB_128[^＋]*@9aa8ec40/.test(DW.source)&&/AA_593[^＋]*@6cbb0b4ab/.test(DW.source),DW.source);
  check('0. 匯入時逐句對原稿：對不到 0 句（「你來過一次」13 句是 AA_271、BB_213 後來加的，另外列）',(DW.verify.miss||[]).length===0&&(DW.verify.freeVisited||[]).length===13,J(DW.verify));
  /* AA_459 第 5 節、AA_460 第 6 節的換字（tools/date/import_wish.py 的 REPLACE；wish_bb.json 還沒跟著改）：比對 JSON 時換回原句、對原稿時不算 */
  const REP=[['你可以說不。我只是問問看。','你可以說不。不是叫你說不，是問你。'],['你的，你自己買。……這樣才算約好。','你的，你自己買。這樣比較像約好，不像我請你。'],['好。兩點半，光典門口。……兩點半是巧合。跟店名沒關係。','好。兩點半，光典門口。……兩點半是巧合，不是店名。']];
  check('0. 三句已經改進原稿（wish_bb.json@cb5caad65）：不再有暫代換字（verify.replaced 沒有）、原稿對不到 0 句',!(DW.verify.replaced||[]).length&&(DW.verify.miss||[]).length===0,J([DW.verify.replaced,DW.verify.miss]));
  { const unrep=s=>ANREV.ROWS.filter(r=>/^date_wish\.js/.test(r.where)).reduce((a,r)=>a.split(J(r.nw)).join(J(r.old)).split(J('（'+r.nw+'）')).join(J('（'+r.old+'）')),s.split('"那座橋，我回去要畫一次。"').join('"那座橋，我回去要畫一次。……畫好再給你看。"')),   /* 以安改稿（AA_592 第 53 列、AA_594 第 2-13 節，import_wish.py 疊的）：比對企劃線的 JSON 以前換回原句（逐列核對在 tests/aa592_an_1b、aa594_an_4b）*/   /* REP 三句 cb5caad65 起已經改進企劃線的 JSON，比對的版本（ab9d70fe0）就是新句：不用換回；AA_525 1-5（6081f725f，tools/date/import_wish.py 疊的）子晴結尾換回原句再比 */ strip=e=>{ const x=JSON.parse(unrep(J(e))); delete x.src; if(x.closing&&x.id==='wish_heroine_01') delete x.closing.linesIf; return x; };
    /* AA_595（AA595-LIB-NOD-THERMOS-1102，「AA 處理決定」第 3 節 3-14）：學姊 D15 的選項「妳的保溫瓶今天是滿的。」跟著空保溫瓶那條線拿掉（import_wish.py 刪的）——企劃線的 JSON 也刪掉那一個（剛好一個）再比 */
    const T595='「妳的保溫瓶今天是滿的。」'; let n595=0; const drop595=o=>{ const x=JSON.parse(J(o)); const w=v=>{ if(Array.isArray(v)){ for(let i=v.length-1;i>=0;i--){ if(v[i]&&v[i].t===T595){ v.splice(i,1); n595++; } } v.forEach(w); } else if(v&&typeof v==='object') Object.values(v).forEach(w); }; w(x); return x; };
    /* 2026-11-11（X324 以安約會台詞重寫，AA_778_an_wish.json@1f88da7cc）：以安的事件不再和 wish_aa.json 逐欄相同——照 AA_778 收字 16 格。改成：strip 把 AA_594 疊的字換回原句以後，和 wish_aa.json 不一樣的剛好是 AA_778 的 16 格、都是她說的台詞的 text，
       每一格現在＝new；那一格在 wish_aa.json 的字＝AA_778 的 old，或 old 是 AA_594 改過的字（那一列的原句＝wish_aa.json 的字）。舊期望：J(strip(以安))===J(wish_aa 以安)。讀不到 AA_778＝照舊比（會紅） */
    { const lv=(x,q,o)=>{ if(Array.isArray(x)) x.forEach((v,k)=>lv(v,q+'/'+k,o)); else if(x&&typeof x==='object') for(const k in x) lv(x[k],q+'/'+k,o); else o[q]=x; return o; };
      const a=WAA?lv(strip(DW.events[AN]),'',{}):{}, b=WAA?lv(WAA.events[AN],'',{}):{}, d=Object.keys(a).filter(k=>a[k]!==b[k]), R4=ANREV.ROWS.filter(r=>/^date_wish\.js/.test(r.where));
      const key=r=>'/'+r.path.replace(/\["([^"]+)"\]/g,'.$1').replace(/\[(\d+)\]/g,'.$1').split('.').join('/').replace('D07/','D07.');   /* hotspots 的 key 本身有點（D07.court）；AA_778 的 path 自己帶 .text */
      const okOld=r=>b[key(r)]===r.old||R4.some(x=>x.nw===r.old&&x.old===b[key(r)]);
      if(AA778) check('0. 以安的事件和企劃線的 JSON（wish_aa@9ba14498e）比：格子一樣多（只多大一的收尾），不一樣的剛好 16 格、都是她說的台詞的 text＝AA_778_an_wish.json@'+SHA778+' 的 rows（path 那一格換成 new；旁白、選項的字、note、條件、時間、地點沒動）；沛珊、學姊對 AA_757、AA_764，語彤對 AA_768、可昕對 AA_770、芷若對 AA_774、子晴對 AA_776（下面六條）',!!WAA&&J(Object.keys(a).sort())===J(Object.keys(b).sort())&&d.length===16&&d.every(k=>/\/text$/.test(k)&&a[k.replace(/text$/,'who')]===AN)&&AA778.rows.length===16&&AA778.rows.every(r=>a[key(r)]===r.new&&okOld(r))&&J(AA778.rows.map(key).sort())===J(d.slice().sort())&&DW.source.includes('AA_778@'+SHA778+'（以安 D07 心願 16 列，換了 16 列）')&&Object.keys(DW.events).length===7,J([d.length,n595,AA778.rows.filter(r=>!(a[key(r)]===r.new&&okOld(r))).map(r=>r.path)]));
      else check('0. 以安的事件和企劃線的 JSON（wish_aa@9ba14498e）逐欄相同（讀不到 AA_778@'+SHA778+'：照舊比）',!!WAA&&J(strip(DW.events[AN]))===J(WAA.events[AN])&&Object.keys(DW.events).length===7,J({n595})); }
    if(AA776&&WBB){ const lv6=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>lv6(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) lv6(x[k],p+'/'+k,o); else o[p]=x; return o; };
      const a=lv6(strip(DW.events[ZQ]),'',{}), b=lv6(WBB.events[ZQ],'',{}), d=Object.keys(a).filter(k=>a[k]!==b[k]);   /* strip 把 AA_525 1-5 那一句換回原句（那一格不在 AA_776 的 30 列裡）*/
      const key=r=>'/'+r.path.replace(/\["([^"]+)"\]/g,'.$1').replace(/\[(\d+)\]/g,'.$1').split('.').join('/').replace('D03/','D03.');   /* hotspots 的 key 本身有點（D03.demo）；AA_776 的 path 自己帶 .text */
      check('0. 子晴的事件和 wish_bb.json@9aa8ec40c 比：格子一樣多，不一樣的剛好 30 格、都是她說的台詞的 text＝AA_776_zq_wish.json@'+SHA776+' 的 rows（path 那一格從 old 換成 new；旁白、選項的字、note、條件、時間、地點沒動）',J(Object.keys(a).sort())===J(Object.keys(b).sort())&&d.length===30&&d.every(k=>/\/text$/.test(k)&&a[k.replace(/text$/,'who')]===ZQ)&&AA776.rows.length===30&&AA776.rows.every(r=>b[key(r)]===r.old&&a[key(r)]===r.new)&&DW.source.includes('AA_776@'+SHA776+'（子晴 D03 心願 30 列，換了 30 列）'),J([d.length,AA776.rows.filter(r=>!(b[key(r)]===r.old&&a[key(r)]===r.new)).map(r=>r.path)]));
      const dots=[]; const wd=o=>{ if(Array.isArray(o)) o.forEach(wd); else if(o&&typeof o==='object'){ if(typeof o.text==='string'&&o.who&&o.who!=='note'&&o.text.includes('……')) dots.push(o.text); for(const k in o) wd(o[k]); } }; wd(DW.events[ZQ]);
      check('0. 子晴的事件刪節號只剩 AA 說要留的三處：她主動約「……你要來嗎？」、窗邊「以前。……之後再說。」、收尾「……你過橋的時候，我沒在看畫面。」',J(dots.slice().sort())===J(['……你要來嗎？','以前。……之後再說。','……你過橋的時候，我沒在看畫面。'].sort()),J(dots)); }
    else console.log('（讀不到 AA_776@'+SHA776+' 或 wish_bb.json：子晴的事件不比稿）');
    /* 2026-11-11（X324 芷若約會台詞重寫，AA_774_zr_wish.json@e8a33995c）：芷若＝wish_bb.json 那一段照 AA_774 的 rows 27 列換字（照 path）；格子一樣多，不一樣的剛好 27 格、都是台詞的 text */
    if(AA774&&WBB){ const lv5=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>lv5(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) lv5(x[k],p+'/'+k,o); else o[p]=x; return o; };
      const a=lv5(strip(DW.events[ZR]),'',{}), b=lv5(WBB.events[ZR],'',{}), d=Object.keys(a).filter(k=>a[k]!==b[k]);
      const key=r=>'/'+r.path.replace(/\["([^"]+)"\]/g,'.$1').replace(/\[(\d+)\]/g,'.$1').split('.').join('/').replace('D05/','D05.');   /* AA_774 的 path 自己帶 .text */
      check('0. 芷若的事件和 wish_bb.json@9aa8ec40c 比：格子一樣多，不一樣的剛好 27 格、都是台詞的 text＝AA_774_zr_wish.json@'+SHA774+' 的 rows（path 那一格從 old 換成 new；選項的字、條件、時間、地點沒動）',J(Object.keys(a).sort())===J(Object.keys(b).sort())&&d.length===27&&d.every(k=>/\/text$/.test(k))&&AA774.rows.length===27&&AA774.rows.every(r=>b[key(r)]===r.old&&a[key(r)]===r.new)&&DW.source.includes('AA_774@'+SHA774),J([d.length,AA774.rows.filter(r=>!(b[key(r)]===r.old&&a[key(r)]===r.new)).map(r=>r.path)]));
      const zr=Object.keys(a).filter(k=>/\/text$/.test(k)&&a[k.replace(/text$/,'who')]===ZR).map(k=>a[k]);
      check('0. 芷若的事件裡她說的句子：刪節號只留三句（「……今天放不了。旁邊有人。」「……再說。」「下次的票……再說。」）；沒有佔位符；她主動約的時間照舊 14.5（「兩點半，光典門口」）',J(zr.filter(t=>/……/.test(t)).sort())===J(['……今天放不了。旁邊有人。','……再說。','下次的票……再說。'].sort())&&!Object.values(a).some(v=>typeof v==='string'&&/[{}]/.test(v))&&DW.events[ZR].herInvite.dateTime===14.5&&DW.events[ZR].herInvite.accept[0].text==='好。兩點半出發，光典門口見。兩點半是巧合，跟店名沒關係。',J(zr.filter(t=>/……/.test(t)))); }
    else console.log('（讀不到 AA_774@'+SHA774+' 或 wish_bb.json：芷若的事件不比稿）');
    /* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）：可昕＝wish_bb.json 那一段照 AA_770 的 rows 23 列換字（照 path）；格子一樣多，不一樣的剛好 23 格、都是台詞的 text */
    if(AA770&&WBB){ const lv4=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>lv4(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) lv4(x[k],p+'/'+k,o); else o[p]=x; return o; };
      const a=lv4(strip(DW0.events[KX]),'',{})/* 2026-11-12（CANON-NO-ECON-1112 第五批）：換主題那 25 格先還原（DW0）再和 9aa8ec40c 比；新字另外驗（下面「第五批」那幾條） */, b=lv4(WBB.events[KX],'',{}), d=Object.keys(a).filter(k=>a[k]!==b[k]);
      const key=r=>'/'+r.path.replace(/\["([^"]+)"\]/g,'.$1').replace(/\[(\d+)\]/g,'.$1').split('.').join('/').replace('D25/','D25.')+'/text';
      check('0. 可昕的事件和 wish_bb.json@9aa8ec40c 比：格子一樣多，不一樣的剛好 23 格、都是台詞的 text＝AA_770_kx_wish.json@f9c1a2b80 的 rows（path 那一格從 old 換成 new；選項的字、條件、時間、交通沒動）',J(Object.keys(a).sort())===J(Object.keys(b).sort())&&d.length===23&&d.every(k=>/\/text$/.test(k))&&AA770.rows.length===23&&AA770.rows.every(r=>b[key(r)]===r.old&&a[key(r)]===r.new)&&/AA_770@f9c1a2b80/.test(DW.source),J([d.length,AA770.rows.filter(r=>!(b[key(r)]===r.old&&a[key(r)]===r.new)).map(r=>r.path)]));
      const kx=Object.keys(a).filter(k=>/\/text$/.test(k)&&a[k.replace(/text$/,'who')]===KX).map(k=>a[k]);
      check('0. 可昕的事件裡她說的句子（換主題以前那一版，DW0）：刪節號只留五句（「……我想去外澳。只看海。」「……外澳？」「……我還活著。」「……今天是真的沒有。」「……今天的海，跟以前一樣。」）；佔位符只有 herInvite.accept[1] 的 {出發時間}',J(kx.filter(t=>/……/.test(t)).sort())===J(['……我想去外澳。只看海。','……外澳？','……我還活著。','……今天是真的沒有。','……今天的海，跟以前一樣。'].sort())&&J(Object.values(a).filter(v=>typeof v==='string'&&/[{}]/.test(v)))===J(['不行，火車有時間。{出發時間}，車站見。'])&&DW.events[KX].herInvite.accept[1].text==='不行，火車有時間。{出發時間}，車站見。',J(kx.filter(t=>/……/.test(t)))); }
    else console.log('（讀不到 AA_770@f9c1a2b80 或 wish_bb.json：可昕的事件不比稿）');
    { const W6=(()=>{ try{ return JSON.parse(git('6dbfe10d7e','date_system/wish/wish_bb.json')); }catch(e){ return null; } })(); if(AA770&&W6){ const lv5=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>lv5(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) lv5(x[k],p+'/'+k,o); else o[p]=x; return o; };
      const a=lv5(strip(DW.events[KX]),'',{}), b=lv5(W6.events[KX],'',{}), d=Object.keys(a).filter(k=>a[k]!==b[k]), K=CS921.WISH921_1112.filter(r=>r.p.startsWith('/events/kexin/'));
      check('0. 第五批：可昕的事件和 wish_bb.json@6dbfe10d7e（AA_921 第 2 節「手機關掉的一天」）比：格子一樣多，不一樣的剛好 19 格＝AA_770 照舊換的那幾列（另外 4 列源稿重寫、照源稿）；換主題那 25 格＝源稿的字',J(Object.keys(a).sort())===J(Object.keys(b).sort())&&d.length===19&&d.every(k=>/\/text$/.test(k))&&K.length===25&&K.every(r=>a[r.p.replace('/events/kexin','')]===r.new&&b[r.p.replace('/events/kexin','')]===r.new)&&DW.events[KX].title==='手機關掉的一天',J([d.length,K.filter(r=>a[r.p.replace('/events/kexin','')]!==r.new).map(r=>r.p)]));
      check('0. 第五批：可昕的事件裡沒有「行程表」「我排」「不排」（AA_921：她不排表、不記帳）',!J(DW.events[KX]).replace(/"(wish|note|rule)":"[^"]*"/g,'').match(/行程表|我排|不排/),J(DW.events[KX]).match(/.{0,12}(行程表|我排|不排).{0,12}/g)); } }

    /* 2026-11-11（X324 語彤約會台詞重寫，AA 0a2136911）：語彤＝wish_aa.json 那一段照 AA_768 的 rows 34 列換字（照 path）；格子一樣多，不一樣的剛好 34 格、都是台詞的 text——選項的字、條件、旗標、時間、結構都沒動 */
    if(AA768&&WAA){ const lv3=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>lv3(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) lv3(x[k],p+'/'+k,o); else o[p]=x; return o; };
      const a=lv3(strip(DW.events[YT]),'',{}), b=lv3(WAA.events[YT],'',{}), d=Object.keys(a).filter(k=>a[k]!==b[k]);
      const key=r=>'/'+r.path.replace(/\["([^"]+)"\]/g,'.$1').replace(/\[(\d+)\]/g,'.$1').split('.').join('/').replace('D13/','D13.')+'/text';   /* hotspots["D13.drink"].lines[2] → /hotspots/D13.drink/lines/2/text；replace["……不用趕回去。"] 的 key 本身有句號，下面另外對 */
      const byPath=AA768.rows.filter(r=>!/replace\[/.test(r.path)), rp=AA768.rows.filter(r=>/replace\[/.test(r.path));
      check('0. 語彤的事件和 wish_aa.json@9ba14498e 比：格子一樣多，不一樣的剛好 34 格、都是台詞的 text＝AA_768_yt_wish.json@0a2136911 的 rows（path 那一格從 old 換成 new）',J(Object.keys(a).sort())===J(Object.keys(b).sort())&&d.length===34&&d.every(k=>/\/text$/.test(k))&&AA768.rows.length===34&&byPath.length===33&&byPath.every(r=>b[key(r)]===r.old&&a[key(r)]===r.new)&&/AA_768@0a2136911/.test(DW.source),J([d.length,byPath.filter(r=>!(b[key(r)]===r.old&&a[key(r)]===r.new)).map(r=>r.path)]));
      const tl=DW.events[YT].closing.timeline[0].replace, tl0=WAA.events[YT].closing.timeline[0].replace;
      check('0. 語彤收尾 closing.lines[5]「……不用趕回去。」和 timeline replace 的 key 都沒動；key 底下第一句照 AA_768 換成「今天我跟蘇姨換了班。」、第二句照舊',DW.events[YT].closing.lines[5].text==='……不用趕回去。'&&J(Object.keys(tl))===J(['……不用趕回去。'])&&rp.length===1&&tl0['……不用趕回去。'][0].text===rp[0].old&&tl['……不用趕回去。'][0].text===rp[0].new&&tl['……不用趕回去。'][1].text==='我其實有一點不習慣。',J(tl));
      const dots=Object.values(a).filter(v=>typeof v==='string'&&/……/.test(v)), yt=Object.keys(a).filter(k=>/\/text$/.test(k)&&a[k.replace(/text$/,'who')]===YT).map(k=>a[k]);
      check('0. 語彤的事件裡她說的句子：刪節號只留四句（「……週六，你有空嗎。」「我點……跟你一樣的。」「……不用趕回去。」「……原來是這樣。」）；沒有「嗯。」開頭的',J(yt.filter(t=>/……/.test(t)).sort())===J(['……週六，你有空嗎。','我點……跟你一樣的。','……不用趕回去。','……原來是這樣。'].sort())&&!yt.some(t=>/^(……)?嗯。/.test(t)),J(yt.filter(t=>/……/.test(t)||/^(……)?嗯。/.test(t)))); }
    else console.log('（讀不到 AA_768@0a2136911 或 wish_aa.json：語彤的事件不比稿）');
    /* 2026-11-11（X324 學姊約會台詞重寫，AA 82c946ad7）：學姊＝AA_764 的 wish_event（逐欄相同）；和 wish_bb.json 那一段（刪掉 AA_595 那一個保溫瓶選項以後）比，只有字不一樣、剛好 32 格 */
    if(AA764&&WBB){ const sJ=o=>J(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((a,x)=>(a[x]=v[x],a),{}):v), nS=e=>{ const x=JSON.parse(J(e)); delete x.src; return x; };
      const lv2=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>lv2(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) lv2(x[k],p+'/'+k,o); else o[p]=x; return o; };
      const a=lv2(nS(DW.events[SIS]),'',{}), b=lv2(nS(drop595(WBB.events[SIS])),'',{}), d=Object.keys(a).filter(k=>a[k]!==b[k]);
      check('0. 學姊的事件＝AA_764_sis_wish.json@82c946ad7 的 wish_event（逐欄相同）；AA_595 的保溫瓶選項照舊少一個',sJ(nS(DW.events[SIS]))===sJ(nS(AA764.wish_event))&&n595===1&&/AA_764@82c946ad7/.test(DW.source),DW.source.slice(-80));
      check('0. 學姊的事件和 wish_bb.json@9aa8ec40c 比：格子一樣多，不一樣的剛好 32 格、都是字的欄位（text、where）＝稿的 rows',J(Object.keys(a).sort())===J(Object.keys(b).sort())&&d.length===32&&d.every(k=>/\/(text|where)$/.test(k))&&AA764.rows.length===32,J([d.length,d.filter(k=>!/\/(text|where)$/.test(k))])); }
    else console.log('（讀不到 AA_764@82c946ad7 或 wish_bb.json：學姊的事件不比稿）');
    /* 2026-11-11（X327 沛珊重寫）：沛珊＝AA_757 的 wish_event（逐欄相同）；和 wish_bb.json 那一段比，只有字（text、t、title、wish、note、costNote）不一樣，剛好 69 格——條件、旗標、記憶、相簿、時間、花費、選項數都沒動 */
    const sortJ=o=>J(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((a,x)=>(a[x]=v[x],a),{}):v), noSrc=e=>{ const x=JSON.parse(J(e)); delete x.src; return x; };
    const lv_=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>lv_(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) lv_(x[k],p+'/'+k,o); else o[p]=x; return o; };
    if(AA757&&WBB){ const a=lv_(noSrc(DW0.events[PS]),'',{})/* 第五批：說明欄四格先還原（DW0） */, b=lv_(noSrc(WBB.events[PS]),'',{}), d=Object.keys(a).filter(k=>a[k]!==b[k]);
      check('0. 沛珊的事件（說明欄四格照源稿 6dbfe10d7e，還原再比）＝AA_757_peishan_wish_hometown.json@8d3bec48be 的 wish_event（逐欄相同）',sortJ(noSrc(DW0.events[PS]))===sortJ(noSrc(AA757.wish_event))&&/AA_757@8d3bec48be/.test(DW.source),DW.source.slice(-80));
      check('0. 沛珊的事件和 wish_bb.json@9aa8ec40c 比：格子一樣多，不一樣的剛好 69 格、都是字的欄位（text、t、title、wish、note、costNote）＝稿的 wish_rows',J(Object.keys(a).sort())===J(Object.keys(b).sort())&&d.length===69&&d.every(k=>/\/(text|t|title|wish|note|costNote)$/.test(k))&&AA757.wish_rows.length===69&&AA757.wish_rows.every(r=>Object.values(a).includes(r.new)),J([d.length,d.filter(k=>!/\/(text|t|title|wish|note|costNote)$/.test(k))])); }
    else console.log('（讀不到 AA_757@8d3bec48be 或 wish_bb.json：沛珊的事件不比稿）'); }
  { const li=(DW.events[AN].closing.linesIf||[])[0], two=li?sp(AN,li.lines):[];
    check('0. 以安大一的收尾照 AA_127 1-5「大一的版本：前三句換成」：「上憲法講第八條那天，我只覺得它很長。」「今天才知道，那些都是真的發生過的事。」（旁白照用；大二以後照原本三句）',J(two)===J(['上憲法講第八條那天，我只覺得它很長。','今天才知道，那些都是真的發生過的事。'])&&two.every(t=>AA127.includes(t)||ANREV.has(t))&&J(li.if)===J({unless:{termFrom:'Y2S1'}})&&li.lines[0].text===DW.events[AN].closing.lines[0].text&&li.lines[3].text===DW.events[AN].closing.lines[4].text,J(li)); }
  { let n=0, bad=[]; const walk=(o,src)=>{ if(Array.isArray(o)) return o.forEach(x=>walk(x,src)); if(!o||typeof o!=='object') return; if(typeof o.text==='string'&&o.who&&o.who!=='note'){ n++; if(!inMd(o.text,src)&&!REP.some(r=>r[0]===o.text)&&!ANREV.has(o.text)&&!FIX593.includes(o.text)) bad.push(o.text); return; } for(const k in o) if(!['wish','rule','note','record','where','source','title','scene','repeat','costNote','likeNote','code','memory','name','context','hotspotsTitle'].includes(k)) walk(o[k],src); };
    walk(DW.events[AN],AA778?AA127+'\n'+AA778.rows.map(r=>r.new).join('\n'):AA127);   /* 2026-11-11（X324 以安約會台詞重寫，AA_778_an_wish.json@1f88da7cc）：以安換上去的句子對 AA_778 的 rows */ walk(DW.events[YT],[...AA626.matchAll(/「([^」]+)」改成「([^」]+)」/g)].reduce((d,m)=>d.split(m[1]).join(m[2]),AA127)+'\n'+AA626+(AA768?'\n'+AA768.rows.map(r=>r.new).join('\n'):''));   /* 2026-11-11（X324）：語彤換上去的句子對 AA_768 的 rows */   /* 語彤：AA_626 改過的句子在 AA_626；「X」改成「Y」的那幾句先在 AA_127 換好再比（例：「這張可以傳給阿姨。」→「這張可以傳給秀琴姨。」）*/ for(const id of [ZR,ZQ,SIS,PS,KX]) walk(DW.events[id],id===ZQ&&AA776?BB128+'\n'+AA776.rows.map(r=>r.new).join('\n'):   /* 2026-11-11（X324 子晴約會台詞重寫，AA_776_zq_wish.json@26e72fd51）：子晴換上去的句子對 AA_776 的 rows */ id===ZR&&AA774?BB128+'\n'+AA774.rows.map(r=>r.new).join('\n'):id===KX&&AA770?   /* 2026-11-11（X324 芷若約會台詞重寫，AA_774_zr_wish.json@e8a33995c）：芷若換上去的句子對 AA_774 的 rows */ BB128+'\n'+AA770.rows.map(r=>r.new).join('\n')+'\n'+CS921.WISH921_1112.filter(r=>r.p.startsWith('/events/kexin/')).map(r=>r.new).join('\n')/* 2026-11-12 第五批：AA_921 第 2 節源稿新寫的句子（wish_bb.json@6dbfe10d7e；WISH921_1112） */:id===PS&&AA757?BB128+'\n'+AA757.wish_rows.map(r=>r.new).join('\n'):(id===SIS&&AA764?BB128+'\n'+AA764.rows.map(r=>r.new).join('\n'):BB128));   /* 2026-11-11（X324）：學姊換上去的句子對 AA_764 的 rows */   /* 2026-11-11（X327）：沛珊換上去的句子對 AA_757 的 wish_rows */
    const free=(DW.verify.freeVisited||[]).map(s=>s.replace(/^[^：]*：/,''));
    check('0. 每一句台詞、旁白都在原稿（AA_127／BB_128；「你來過一次」那幾句除外）',n>400&&bad.filter(t=>!free.includes(t)).length===0,n+' 句；對不到：'+J(bad.filter(t=>!free.includes(t)).slice(0,5))); }
  { const HD=DW.hold||{};
    check('0. AA_426 改稿以後沒有 hold：七位都照做（子晴、學姊、可昕原本 hold 的句子都改掉了）',Object.keys(HD).length===0&&[AN,YT,ZR,ZQ,SIS,PS,KX].every(id=>X().live(id)),J(Object.keys(HD)));
    const txt=id=>{ const out=[]; const walk=o=>{ if(Array.isArray(o)) o.forEach(walk); else if(o&&typeof o==='object'){ if(typeof o.text==='string'&&o.who&&o.who!=='note') out.push(o.text); if(typeof o.t==='string') out.push(o.t); for(const k in o) if(!['note','wish','rule','where','record','repeat','costNote','likeNote','source','title','scene','context','memory','name'].includes(k)) walk(o[k]); } }; walk(DW.events[id]); return out.join('\n'); };
    check('0. 子晴沒有「欸不是」「這不是問句」類、「存檔」「這是規則」；學姊沒有「重點是」、不數東西、不叫「學弟」；可昕沒有「假設」「這是告知」「我輸了」；以安沒有說出口的「理由：」（AA_426）',!/欸不是|這不是問句|這是問句|這是陳述句|存檔|這是規則/.test(txt(ZQ))&&!/重點是|學弟|數到|[一二兩三四五六七八九十]顆|兩次|兩章|三件事/.test(txt(SIS))&&!/假設|這是告知|我輸了/.test(txt(KX))&&!/理由：/.test(txt(AN)),J([txt(SIS).match(/重點是|數到|[一二兩三四五六七八九十]顆|兩次|兩章/),txt(AN).match(/理由：/)])); }
  { const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), d3=fs.readFileSync(path.join(H.ROOT,'src/date3d.js'),'utf8'), i3=fs.readFileSync(path.join(H.ROOT,'src/invites3d.js'),'utf8');
    check('0. index.html：data/date_wish.js、wish3d.js 接在 sideq3d.js 後面（?v= 一樣）',/src\/sideq3d\.js\?v=([^"]+)"><\/script>\n<script src="src\/data\/date_wish\.js\?v=\1"><\/script>\n<script src="src\/wish3d\.js\?v=\1"><\/script>/.test(html));
    check('0. 接線：DATE.scene 開頭轉 WISH.scene、DATE.menu 訂好以後說 WISH.playerLines、INV.meet 叫 WISH.meetMention、手機規則登記在 STORY.PHONE_RULES',/WISH\.due\(G,t\)\) return WISH\.scene\(GM,q,t\)/.test(d3)&&/WISH\.playerLines\(G,id,loc\)/.test(d3)&&/WISH\.meetMention\(GM,iv,who\)/.test(i3)&&STORY.PHONE_RULES.some(f=>/S\.phone\(G\)/.test(String(f))));
    check('0. 心願事件沒有 CG（資料裡沒有 cg 欄位；記的是 Life Album 的那一頁）',!/"cg"\s*:/.test(J(DW.events))); }

  /* ======================= 1 以安 D07 ======================= */
  { const ev=E_(AN);
    setup('2025-09-30',15,{lv:{[AN]:4}}); let r=await meet(AN,'cafe');
    check('1. 憲法（上）第 6 週以前：見面不提',!r.L.includes('憲法第八條，是本文裡最長的一條。你知道為什麼嗎？')&&!X().known(H.G,AN));
    setup('2025-10-14',15,{lv:{[AN]:4}}); H.picks=[]; r=await meet(AN,'cafe');
    const M=ev.mention, want=sp(AN,M.lines).concat([M.choices[0].reply[0].text]).concat(sp(AN,M.after));
    check('1. 聊天提到（第 6 週上過、第 4 階、Café 見面）：「憲法第八條……」→ 選項 → 「新店有一個地方……」三句（註記不顯示）；知道心願（DATE wishKnown：人物頁的提示改成「她提過想去……」）',has(r.L,want)&&r.O.some(o=>J(o)===J(M.choices.map(c=>c.t)))&&!r.L.some(t=>/官網/.test(t))&&DATE.log(H.G,AN).wishKnown===true,J(r.L));
    at('2025-10-16',15); r=await meet(AN,'library');
    check('1. 只說一次：下一次見面不再提',!r.L.includes(M.lines[0].text));
    setup('2027-03-10',15,{lv:{[AN]:4}}); r=await meet(AN,'cafe');
    check('1. 大二下以後：整段換成「我們學訴願、行政訴訟……」三句、沒有選項',has(r.L,sp(AN,M.linesIf[0].lines))&&!r.L.includes(M.lines[0].text)&&!r.O.some(o=>o.includes(M.choices[0].t)),J(r.L));
    // 她主動約
    const I=ev.herInvite;
    setup('2026-11-18',20,{lv:{[AN]:5}}); phone();
    check('1. 她主動約：大二上行政法第 12 週（「我要改我的答案」）以前不約',msgs(AN).length===0);
    setup('2026-11-25',20,{lv:{[AN]:5}}); phone(); const tag='wish_ask_'+AN+'_Y2S1';
    check('1. 她主動約（週三 20:00、第 5 階、第 12 週上過）：手機三則「週六下午有空嗎。」「景美那裡，我想去一次。」「理由：我一個人去，會一直寫筆記。」；收到就算知道心願',J(msgs(AN))===J(sp(AN,I.lines))&&!!PHONE.byAsk(H.G,tag)&&DATE.log(H.G,AN).wishKnown,J(msgs(AN)));
    PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===AN);
    check('1. 答應：她回「好。13:30 出發。週一休館……」；訂下週六 13:30 去景美（by:her、wish）',msgs(AN).slice(-1)[0]===sp(AN,I.accept)[0]&&!!tr&&tr.locs[0]==='D07'&&tr.by==='her'&&tr.wish===true&&tr.depart===13.5&&tr.day===H.D('2026-11-28')&&!!OUT.get(H.G,'date_'+tr.trip),J(tr));
    setup('2026-11-25',20,{lv:{[AN]:5}}); phone(); PHONE.answer(H.G,tag,1); phone();
    check('1. 這週不行：她回「好。理由收到。……下次換你約。」；不扣分、沒有行程',msgs(AN).slice(-1)[0]===sp(AN,I.decline)[0]&&!H.G.trips.length&&DATE.log(H.G,AN).wishAsk.state==='no');
    at('2026-12-02',20); phone(); at('2026-12-23',20); phone();
    check('1. 每學期最多一次：同一學期不再問',msgs(AN).filter(t=>t===I.lines[0].text).length===1);
    setup('2028-04-12',20,{lv:{[AN]:5},ev:[]}); phone();
    check('1. 大三下在日本（2028-03-25～08-05）：不約',msgs(AN).length===0&&!X().here(H.G,AN));
    // 玩家約她
    setup('2026-10-03',9,{lv:{[AN]:5}});
    check('1. 玩家約她去 D07：還不知道＝「景美？我一直想去。你怎麼知道？」「好。」（AA_778 拿掉刪節號）；知道了＝「……景美？」「你記得。」「好。理由：你記得。」',J(sp(AN,X().playerLines(H.G,AN,'D07')))===J(sp(AN,ev.playerInvite.unknown))&&(X().learn(H.G,AN),J(sp(AN,X().playerLines(H.G,AN,'D07')))===J(sp(AN,ev.playerInvite.known)))&&X().playerLines(H.G,AN,'D06')===null);
    // 那一天（大一、交往中）
    setup('2026-04-11',9,{lv:{[AN]:'dt'}}); r=await goDate(AN,'D07',13,['看守所',0,'小路',0,'法庭',1,'名字',2,0]);
    const P=ev.hotspots, C=ev.closing;
    check('1. 那一天：抵達旁白＋兩句＋交往中那一句（「我想講話的人是你。理由：你會反駁我。」），沒有第 6 階單身那一句',has(r.L,['（'+ev.arrive.narr+'）'].concat(sp(AN,ev.arrive.lines),sp(AN,ev.arrive.extraIf[1].lines)))&&!r.L.includes(ev.arrive.extraIf[0].lines[0].text),J(r.L.slice(0,8)));
    check('1. 大一去的版本：走廊「上課的時候，我只把它們背起來。」、讀書會開以前的小路「上課分組的時候……」＋選項「班上的人都在聽。」→「有幾個吧。」',r.L.includes('上課的時候，我只把它們背起來。')&&!r.L.includes('大一的時候，我只把它們背起來。')&&r.L.includes('上課分組的時候，我常叫別人講完。')&&r.L.includes('有幾個吧。')&&r.O.some(o=>o.includes('「班上的人都在聽。」')),J(r.L));
    check('1. 法庭選②：「好，那你說理由。」「規則寫了，就一定對嗎？……」（AA_778 拿掉句首的刪節號）；名字的牆選③',has(r.L,sp(AN,P['D07.court'].choices[1].reply))&&has(r.L,sp(AN,P['D07.wall'].choices[2].reply)));
    check('1. 收尾（大一）：旁白、「上憲法講第八條那天，我只覺得它很長。」「我到現在才知道，那些都是真的發生過的事。」、手帳旁白；選①「『想到人』。」；大一的結尾「回去吧。我想回去再讀一次第八條。」；沒有「我大一說」',has(r.L,['（園區裡的大樹下，有一張長椅。）','上憲法講第八條那天，我只覺得它很長。','我到現在才知道，那些都是真的發生過的事。','（她拿出筆記本，寫了一行，沒有給你看。）','『想到人』。','回去吧。我想回去再讀一次第八條。'])&&!r.L.includes('我大一的時候，覺得規則寫了就要照做。')&&!r.L.includes('回去吧。行政法的報告，我想改一個例子。'),J(r.L.slice(-10)));
    check('1. 「我選公法研究所……」AA_426 第 4 節作廢：資料裡沒有、不播',!r.L.includes('我選公法研究所，有一個原因在這裡。')&&!J(ev).includes('公法研究所'));
    const G=H.G;
    check('1. 記：WISH_DONE_heroine_01、記憶 AN_JINGMEI（人物頁「和她去過景美……」）、相簿「她拍的樹」；算一次正式約會、心願完成',G.flags.WISH_DONE_heroine_01===true&&SOCIAL.has(AN,'AN_JINGMEI')&&SOCIAL.MEMORY_LABEL.AN_JINGMEI===ev.record.memory.text&&(G.album||[]).some(a=>a.id==='wish_heroine_01'&&a.title===ev.record.album)&&DATE.log(G,AN).wish===true&&DATE.log(G,AN).count===1&&r.t.status==='done'&&H.cgs.length===0,J(DATE.log(G,AN)));
    G.day+=1; r=await goDate(AN,'D07',13,[0,0,0]);
    check('1. 只有第一次：第二次去景美照一般約會（沒有心願的抵達、收尾）',r.t&&r.t.status==='done'&&!r.L.includes(ev.arrive.lines[1].text)&&!r.L.includes('『想到人』。'),J(r.L.slice(0,5)));
    // 大二、不知道、第 5 階：選不用給我看＝記 AN_REASON_HIDDEN；大二的結尾
    setup('2026-10-03',9,{lv:{[AN]:5}}); r=await goDate(AN,'D07',13,['法庭',2,'差不多',0]);
    check('1. 大二：收尾照原本三句（「我大一的時候，覺得規則寫了就要照做。」）、結尾「回去吧。行政法的報告……」；只做一個點也播收尾',r.L.includes('我大一的時候，覺得規則寫了就要照做。')&&r.L.includes('回去吧。行政法的報告，我想改一個例子。')&&!r.L.includes('而且你會反駁我。') /* 2026-11-11（X324 以安約會台詞重寫，AA_778_an_wish.json@1f88da7cc）：這一句拿掉句首的刪節號，「沒播」跟著對新字（舊：'……而且你會反駁我。'）*/&&H.G.flags.WISH_DONE_heroine_01===true,J(r.L.slice(-8)));
    setup('2026-10-03',9,{lv:{[AN]:5}}); r=await goDate(AN,'D07',13,['法庭',2,'差不多',1]);
    check('1. 收尾選「不用給我看。」：「嗯。下次再給你看。」、記 AN_REASON_HIDDEN',r.L.includes('嗯。下次再給你看。')&&SOCIAL.has(AN,'AN_REASON_HIDDEN'));   /* 2026-11-11（X324 以安約會台詞重寫，AA_778_an_wish.json@1f88da7cc）：這一句只拿掉刪節號（舊期望「嗯。……下次再給你看。」；約定有後續——告白「理由欄」會回聲，照留）*/
    setup('2026-10-03',9,{lv:{[AN]:5}}); r=await goDate(AN,'D07',13,['就這樣回去']);
    check('1. 一個點都沒做就走：不算、心願還沒完成（下次去還是心願事件）',r.t.status==='cancelled'&&!H.G.flags.WISH_DONE_heroine_01&&!DATE.log(H.G,AN).wish&&X().due(H.G,Object.assign({},r.t,{status:'booked'})));
  }

  /* ======================= 2 語彤 D13 ======================= */
  { const ev=E_(YT), M=ev.mention;
    setup('2026-10-08',20,{lv:{[YT]:4}}); H.picks=[]; let r=await meet(YT,'noodle');
    check('2. 聊天提到（第 4 階、麵店）：「你去過淡水嗎。」……「到現在還不知道，淡水的夕陽最後長什麼樣子。」→ 選項 → 「……嗯。」；團體淡水那一句 AA_426 第 4 節作廢（資料裡沒有）',has(r.L,sp(YT,M.lines).concat([M.choices[0].reply[0].text]))&&X().known(H.G,YT)&&!M.extraIf&&!r.L.includes('上次大家去，我五點就先回去了。'),J(r.L));
    const I=ev.herInvite;
    setup('2027-10-13',21,{lv:{[YT]:5}}); phone();
    check('2. 她主動約：事件 13（空出來的週四）以前不約',msgs(YT).length===0);
    setup('2027-10-13',21,{lv:{[YT]:5},ev:['ev_yt_thursday_free']}); phone(); const tag='wish_ask_'+YT+'_Y3S1', A=DATE.log(H.G,YT).wishAsk||{};
    const ss=DATE.sunset(H.D('2027-10-16')), dep=Math.floor((+ss.slice(0,2)+ +ss.slice(3)/60-2)*2)/2;
    check('2. 她主動約（週三 21:00、事件 13 以後）：「……週六，你有空嗎。」「我想去淡水。」「看到最後。」；約的時間＝那天淡水日落前兩小時（取半點）',J(msgs(YT))===J(sp(YT,I.lines))&&A.date===H.D('2027-10-16')&&A.depart===dep,J({m:msgs(YT),A,ss}));
    PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===YT);
    /* 2026-11-11（X324 語彤約會台詞重寫，AA_768_yt_wish.json@0a2136911）：這一場的句子照新稿（刪節號、「嗯。」開頭拿掉；答應句、還不知道的「好。我帶路。」、長椅和河那兩句），下面幾條的期望跟著換 */
    check('2. 答應：「那就{出發時間}。」填上出發時間；訂下那一趟（by:her）',msgs(YT).slice(-1)[0]==='那就'+INV.hhmm(dep)+'。'&&!!tr&&tr.by==='her'&&tr.depart===dep&&tr.locs[0]==='D13',J(msgs(YT).slice(-2)));
    setup('2026-10-08',20,{lv:{[YT]:5}}); const pl=X().playerLines(H.G,YT,'D13');
    check('2. 玩家約她（還不知道、事件 13 以前）：「淡水？」「好。我帶路。」＋「我跟蘇姨換班。她說好。」（AA_626 2-2；字照 AA_768）',J(sp(YT,pl))===J(['淡水？','好。我帶路。','我跟蘇姨換班。她說好。'])&&J(sp(YT,ev.playerInvite.unknown))===J(['淡水？','好。我帶路。']),J(sp(YT,pl)));
    X().learn(H.G,YT); H.said=[]; await X().sayInvite(GM,YT,X().playerLines(H.G,YT,'D13'),null);
    check('2. 知道了：「淡水？」「你記得。」（她停了很久。）「好。」——旁白不傳到手機',J(said().slice(0,4))===J(['淡水？','你記得。','（她停了很久。）','好。'])&&!msgs(YT).includes('她停了很久。'),J(said()));
    // 那一天：第 6 階單身、事件 13 以前
    setup('2026-10-10',9,{lv:{[YT]:6}}); let r2=await goDate(YT,'D13',15,['飲料','欄杆',0,'拍照',1,'長椅',0]);
    const C=ev.closing;
    check('2. 那一天（AA_626 2-3）：「（捷運的終點站。河的另一邊是一座山。）」「跟小時候一樣。」「我媽的診所在那邊。我們不要往那裡走。」',has(r2.L,['（捷運的終點站。河的另一邊是一座山。）','跟小時候一樣。','我媽的診所在那邊。我們不要往那裡走。'])&&!r2.L.includes('……跟小時候一樣。')&&!r2.L.includes('人比較多。'),J(r2.L.slice(0,5)));
    check('2. 飲料攤：「我點……跟你一樣的。」（她喝了一口。）「太甜了。」；記 TASTE_heroine_03；欄杆「這條河，跟學校旁邊那條，是同一條嗎。」選①「所以它一直在走。從學校旁邊，走回我家。」、第 6 階多「我以前很想走遠一點。現在反而想走回來看看。」（AA_626 2-4）；合照第 6 階＝「一張。」「我媽一定會問這是誰。」；長椅「這張椅子，我國中放假回來坐過。」「可能不是同一張。椅子應該換過了。」',has(r2.L,['我點……跟你一樣的。','（她喝了一口。）','太甜了。','但是可以。','這條河，跟學校旁邊那條，是同一條嗎。','所以它一直在走。從學校旁邊，走回我家。','我以前很想走遠一點。現在反而想走回來看看。','不要拍我。','一張。','我媽一定會問這是誰。','這張椅子，我國中放假回來坐過。','可能不是同一張。椅子應該換過了。'])&&!r2.L.some(t=>/公館那條|那時候我們坐的/.test(t))&&SOCIAL.has(YT,'TASTE_heroine_03'),J(r2.L));
    check('2. 收尾：夕陽的旁白……事件 13 以前「……不用趕回去。」換成「今天我跟蘇姨換了班。」「我其實有一點不習慣。」；選①「好。」「這次先不要。這次是我的。」；多「回去以後，我要跟秀琴姨說……」（AA_626 2-5）；第 6 階單身的結尾兩句（第二句「原來有空是自己留的。」）',has(r2.L,['（太陽慢慢往河對岸的山落下去。河面變成橘色。）','以前回淡水，都是直接回家。','從來沒有人陪我在這裡坐到天黑。','這次只有兩個人。','今天我跟蘇姨換了班。','我其實有一點不習慣。','……原來是這樣。','最後長這樣。','好。','這次先不要。這次是我的。','回去以後，我要跟秀琴姨說，淡水的夕陽最後長這樣。','我以前覺得，這種事要等有空。','原來有空是自己留的。'])&&J(sp(YT,C.ending[1].lines))===J(['我以前覺得，這種事要等有空。','原來有空是自己留的。'])&&!r2.L.includes('……不用趕回去。'),J(r2.L.slice(-12)));
    check('2. 記：WISH_DONE、YT_TAMSUI_SUNSET、相簿；心願完成',H.G.flags.WISH_DONE_heroine_03===true&&SOCIAL.has(YT,'YT_TAMSUI_SUNSET')&&DATE.log(H.G,YT).wish===true&&H.cgs.length===0);
    setup('2026-10-10',9,{lv:{[YT]:5}}); r2=await goDate(YT,'D13',15,['拍照',1,'差不多',2]);
    check('2. 第 5 階：合照「下次。」；收尾選③「這樣剛好。」；結尾「下次，換我約你。」',has(r2.L,['下次。','這樣剛好。','下次，換我約你。'])&&!r2.L.some(t=>/^……(下次|嗯)/.test(t)),J(r2.L.slice(-6)));
    setup('2027-10-10',9,{lv:{[YT]:'dt'},ev:['ev_yt_thursday_free']}); r2=await goDate(YT,'D13',15,['長椅','差不多',0]);
    check('2. 事件 13 以後、交往中：照原本「……不用趕回去。」、沒有蘇姨、秀琴姨那兩句；結尾「我們拍一張。」「這次，我要在照片裡。」',r2.L.includes('……不用趕回去。')&&!r2.L.includes('今天我跟蘇姨換了班。')&&!r2.L.includes('我其實有一點不習慣。')&&!r2.L.includes('回去以後，我要跟秀琴姨說，淡水的夕陽最後長這樣。')&&has(r2.L,['我們拍一張。','這次，我要在照片裡。']),J(r2.L.slice(-6)));
  }

  /* ======================= 3 芷若 D05 ======================= */
  { const ev=E_(ZR), M=ev.mention;
    setup('2026-10-08',20,{lv:{[ZR]:4}}); H.picks=[]; let r=await meet(ZR,'cafe');
    check('3. 聊天提到：「下個月光典有影展。都是很老的片，修復過的。」（AA_426 第 4 節：不寫導演；不套 zrzq 的片名替換表）……「國中到現在，每一頁都只有一張。」',J(sp(ZR,M.lines).slice(0,1))===J(['下個月光典有影展。都是很老的片，修復過的。'])&&has(r.L,sp(ZR,M.lines).concat([M.choices[0].reply[0].text]))&&!r.L.some(t=>/小津|秋天的晚飯/.test(t))&&X().known(H.G,ZR),J(r.L));
    setup('2027-10-13',23,{lv:{[ZR]:5}}); r=await meet(ZR,'cafe'); phone();
    check('3. 大三上在英國：不提、不約',!r.L.includes(M.lines[1].text)&&msgs(ZR).length===0&&!X().here(H.G,ZR));
    setup('2028-10-11',23,{lv:{[ZR]:5}}); phone();
    check('3. 2028-09 起（英國念研究所）：不約',msgs(ZR).length===0);
    const I=ev.herInvite;
    setup('2026-10-14',23,{lv:{[ZR]:5}}); phone(); const tag='wish_ask_'+ZR+'_Y2S1';
    /* 2026-11-11（X324 芷若約會台詞重寫，AA_774_zr_wish.json@e8a33995c）：這一場的句子照新稿（刪節號 30 處留 3 處、「嗯。」開頭兩處拿掉、對祐廷下命令或嫌他的三句改掉），下面幾條的期望跟著換。
       舊期望：邀約第三句「你的，你自己買。……這樣才算約好。」、答應「好。兩點半，光典門口。……兩點半是巧合。跟店名沒關係。」、院子「我在申請交換。……去看別人的電影院。」、書店「……你挑的？」、沒選到的「想。很想。……講出來好像就要負責。」、收尾「票根。……你的，給我。」「……今天很好。這句話我很少說。」 */
    check('3. 她主動約（週三打烊後 23:00）：「光典的影展，週六下午那一場。」「我買好我的票了。」「你的，你自己買。這樣才算約好。」',I.lines[2].text==='你的，你自己買。這樣才算約好。'&&J(msgs(ZR))===J(sp(ZR,I.lines))&&!!PHONE.byAsk(H.G,tag),J(msgs(ZR)));
    PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===ZR);
    check('3. 答應：「好。兩點半出發，光典門口見。兩點半是巧合，跟店名沒關係。」（AA_460 第 6 節換字、AA_774 收字）；週六 14:30 光典（by:her）',I.accept[0].text==='好。兩點半出發，光典門口見。兩點半是巧合，跟店名沒關係。'&&msgs(ZR).slice(-1)[0]===sp(ZR,I.accept)[0]&&!!tr&&tr.locs[0]==='D05'&&tr.depart===14.5&&tr.day===H.D('2026-10-17'),J(tr));
    setup('2026-10-17',9,{lv:{[ZR]:6}}); SOCIAL.remember(ZR,'WATCHED_FILM',''); const m0=H.G.money; r=await goDate(ZR,'D05',13,['院子',1,'書店',1,'片單',0,'咖啡',1,0]);
    check('3. 那一天：抵達「這裡以前住的是外交官。現在住的是電影。」……第 6 階單身「今天我不坐走道。……」；看電影（固定，不算互動點）兩句旁白',has(r.L,sp(ZR,ev.arrive.lines).concat(sp(ZR,ev.arrive.extraIf[1].lines),allSay(ev.fixed.lines))),J(r.L.slice(0,9)));
    check('3. 院子選②大二＝「我在申請交換。去看別人的電影院。」；書店選②買明信片（扣 30）；片單選①第 6 階＝「好。我先買我的。」',has(r.L,['我在申請交換。去看別人的電影院。','你挑的？','這張我會貼在店裡的吧檯後面。不告訴任何人。','好。我先買我的。'])&&!r.L.includes('想。很想。講出來好像就要負責。')&&!r.L.includes('想。很想。……講出來好像就要負責。'),J(r.L));
    check('3. 收尾：Z5 兩個人看過（WATCHED_FILM）＝第 2 行後面插入「翻頁時你看到《進城的那一週》那一頁……」三行（片名照 SOCIAL.filmRename）；選項；第 6 階單身結尾',(()=>{ const i=r.L.indexOf('票根。你的，可以給我嗎？'); return i>0&&r.L[i+1]==='（翻頁時你看到《進城的那一週》那一頁，只有她的那一張。）'&&r.L[i+2]==='《進城的那一週》那張，你還留著嗎？'&&r.L[i+3]==='嗯。'; })()&&has(r.L,['這次留兩張。','今天很好。這句話我很少說。'])&&!r.L.some(t=>/東京物語/.test(t)),J(r.L.slice(-12)));
    check('3. 記：WISH_DONE_heroine_02、ZR_STUB_BOOK；錢：交通、咖啡、明信片、電影票 260（地點資料的 fixed，SYS-03）照扣',H.G.flags.WISH_DONE_heroine_02===true&&SOCIAL.has(ZR,'ZR_STUB_BOOK')&&m0-H.G.money===130+30+50+260,String(m0-H.G.money));
  }

  /* ======================= 4 沛珊 D06 ======================= */
  { const ev=E_(PS), M=ev.mention;
    setup('2025-10-14',17,{lv:{[PS]:4}}); H.picks=[]; let r=await meet(PS,'library');
    /* 2026-11-11（X327 沛珊重寫，AA_757@052644c58）：第 4 節寫死的句子照新稿改（原本：「……我沒有。考試考不到的地方，我都沒去過。」「我想去一次。看畫，不用寫答案。」、「美術館。我想要一天，沒有標準答案。」、「好。……我會準備。不對，我什麼都不準備。」、「這裡好安靜。像考場。」「……可是沒有人在寫字。」、「〈無題〉。……它連題目都沒有。」「好。這是一個答案。」「今天，我什麼都沒寫。」）*/
    check('4. 聊天提到：「你去過美術館嗎？」「我沒去過。我媽逛那種地方都在問這幅多少錢，我就不想跟。」「我想自己去一次。聽說裡面不能大聲講話，我想知道我能撐多久。」→ 選項',has(r.L,sp(PS,M.lines).concat([M.choices[0].reply[0].text]))&&J(sp(PS,M.lines))===J(['你去過美術館嗎？','我沒去過。我媽逛那種地方都在問這幅多少錢，我就不想跟。','我想自己去一次。聽說裡面不能大聲講話，我想知道我能撐多久。'])&&X().known(H.G,PS),J(r.L));
    setup('2026-12-20',15,{lv:{[PS]:4}});
    check('4. 2026-12-17～2027-08-06 聯絡不到：不提、不約；大三起不上來（同一個心願在台南・美術館，hometown3d.js）',!X().here(H.G,PS)&&!X().mentionDue(H.G,PS)&&(at('2026-12-17',15),!X().here(H.G,PS))&&(at('2027-09-15',15),!X().here(H.G,PS)&&!X().mentionDue(H.G,PS)));
    const I=ev.herInvite;
    setup('2025-10-09',21.5,{lv:{[PS]:5}}); phone(); const tag='wish_ask_'+PS+'_Y1S1';
    check('4. 她主動約（週日下午那一趟、前三天週四 21:30）：「週日下午你有空嗎？」「美術館。我想找一天不用負責好笑。」「不行也沒關係，問問看。」',J(msgs(PS))===J(sp(PS,I.lines))&&J(msgs(PS))===J(['週日下午你有空嗎？','美術館。我想找一天不用負責好笑。','不行也沒關係，問問看。'])&&!!PHONE.byAsk(H.G,tag),J(msgs(PS)));
    PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===PS);
    check('4. 答應：「好。那我要想一下穿什麼。算了，不想了，隨便穿。」；週日 14:00 北美館',msgs(PS).slice(-1)[0]===sp(PS,I.accept)[0]&&msgs(PS).slice(-1)[0]==='好。那我要想一下穿什麼。算了，不想了，隨便穿。'&&!!tr&&tr.locs[0]==='D06'&&tr.depart===14&&tr.day===H.D('2025-10-12'),J(tr));
    setup('2026-05-07',21.5,{lv:{[PS]:5}}); phone();
    check('4. 她有交往的對象（大一下第 7 週起和柏翰）：不約（AA_128 4-5）',msgs(PS).length===0);
    setup('2025-10-12',9,{lv:{[PS]:5},ev:['ev_peishan_syllogism']}); const m0=H.G.money; r=await goDate(PS,'D06',13,['畫框',1,'展廳',0,'差不多',0]);
    check('4. 那一天：門票 30 照扣；「這裡好安靜，我講話都自動變小聲了。」「我第一次知道我可以這麼小聲。」；空畫框選②「框外面，是看框的人。」（AA_685 A6-2：拿掉「……今天是我們。」）＋看過三段論多「你記得我說過。」；收尾〈無題〉、第 5 階結尾',has(r.L,sp(PS,ev.arrive.lines).concat(['這裡好安靜，我講話都自動變小聲了。','我第一次知道我可以這麼小聲。','框外面，是看框的人。','你記得我說過。','〈無題〉。連題目都沒有。','這一幅，我接不上。','好，早上。','我居然不想跟你爭。這也是第一次。','今天我講的話大概只有平常的一半。很舒服。']))&&!r.L.some(t=>/今天是我們|標準答案|考場|沙漏/.test(t))&&m0-H.G.money===30+60,J(r.L)+' '+(m0-H.G.money));
    check('4. 記：WISH_DONE_classmate_peishan、PS_UNTITLED；大一沒有 after 那一句（大二上、大二下、大三以後才有）',H.G.flags.WISH_DONE_classmate_peishan===true&&SOCIAL.has(PS,'PS_UNTITLED')&&!r.L.some(t=>/認真想一件事|又是一週一小時|學怎麼教書/.test(t))&&J(ev.closing.after.map(a=>a.lines.map(l=>l.text)))===J([['下禮拜開始我要認真想一件事了，想好再跟你說。','今天先不想。'],['明天開始又是一週一小時。今天是一整天。'],['我現在在學怎麼教書。以後學生問我這幅在畫什麼，我要說老師也不知道。']]));
  }

  /* ======================= 5 子晴 D03（AA_426 改稿，企劃線 967b4273a）======================= */
  { const ev=E_(ZQ), M=ev.mention, I=ev.herInvite;
    setup('2026-10-08',20,{lv:{[ZQ]:4}}); let r=await meet(ZQ,'cafe',['「妳一定做得出來。」']);
    /* 2026-11-11（X324 子晴約會台詞重寫，AA_776_zq_wish.json@26e72fd51）：第 5 節的期望照新稿換（只換她的句子；舊期望寫在每一條後面） */
    check('5. 聊天提到（第 4 階、Café）：「參創這個月有獨立遊戲的試玩區。十幾個小團隊。」……→ 選②「你又沒看過我做的東西。好啦，謝謝。」（舊：「……好啦，謝謝。」）',has(r.L,sp(ZQ,M.lines).concat(['你又沒看過我做的東西。好啦，謝謝。']))&&X().known(H.G,ZQ),J(r.L));
    setup('2026-10-14',21.5,{lv:{[ZQ]:5}}); phone(); const tag='wish_ask_'+ZQ+'_Y2S1';
    check('5. 她主動約（週三晚上）：「週六下午三點。參創。」「……你要來嗎？」',J(msgs(ZQ))===J(['週六下午三點。參創。','……你要來嗎？'])&&!!PHONE.byAsk(H.G,tag)&&X().known(H.G,ZQ),J(msgs(ZQ)));
    PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===ZQ);
    check('5. 答應：「好。三點門口。遲到我先進去。」；訂下週六 15:00 參創（by:her）',msgs(ZQ).slice(-1)[0]==='好。三點門口。遲到我先進去。'&&!!tr&&tr.locs[0]==='D03'&&tr.depart===15&&tr.day===H.D('2026-10-17')&&tr.by==='her',J(tr));
    setup('2026-10-03',9,{lv:{[ZQ]:5}});
    check('5. 玩家約她去參創：還不知道「參創？你也知道參創？」「好。這次我帶路。」；知道了「參創？你還記得喔。」「好。下午，早上我不存在。」（舊：「參創？法律系的也會去參創？」「……好。這次我帶路。」／「……好。下午。早上我不存在。」）',J(sp(ZQ,X().playerLines(H.G,ZQ,'D03')))===J(['參創？你也知道參創？','好。這次我帶路。'])&&(X().learn(H.G,ZQ),J(sp(ZQ,X().playerLines(H.G,ZQ,'D03')))===J(['參創？你還記得喔。','好。下午，早上我不存在。'])));
    setup('2026-10-10',9,{lv:{[ZQ]:5}}); const m0=H.G.money; r=await goDate(ZQ,'D03',15,['試玩',1,'機台',0,'扭蛋',2,'休息',1,0]);
    check('5. 那一天：「（光華商場旁的大樓，電梯一層一層停）」「人好多。」「我很興奮。看不出來嗎？」；試玩「好到我想馬上回去改我的。」②「你又在鼓勵我。好，我收下，我回去會改。」（D116；舊：「……好到我有點不爽。」「你又在鼓勵我。……我的會更好。」）；舊機台「這台我國中每天放學都去打，打到店員認得我。」「臺中的店。這裡的機台比較新，按鍵沒那麼鬆。」①「你的手跟不上眼睛。可是你沒有放棄，這點我尊重。」（舊：全國第三十二名／地區排行／你很爛）；扭蛋③「你很掃興耶。一次就好。」；休息區②「甜才要喝啊。不甜我幹嘛點。」',has(r.L,['（光華商場旁的大樓，電梯一層一層停）','人好多。','我很興奮。看不出來嗎？','好到我想馬上回去改我的。','你又在鼓勵我。好，我收下，我回去會改。','這台我國中每天放學都去打，打到店員認得我。','臺中的店。這裡的機台比較新，按鍵沒那麼鬆。','你的手跟不上眼睛。可是你沒有放棄，這點我尊重。','你很掃興耶。一次就好。','甜才要喝啊。不甜我幹嘛點。'])&&!r.L.some(t=>/有點不爽|我的會更好|第三十二名|地區排行|你很爛/.test(t)),J(r.L));
    check('5. 收尾：「最後一關換你。」→ 選①「我知道，剛剛看過了。打。」；Q12 以前「我自己的遊戲，最後一關還沒做。」「我現在比較知道要怎麼做了。」；第 5 階「今天不錯。下個月試玩區會換一批。」（舊：「我知道。剛剛看過了。……打。」「……我現在比較知道要怎麼做了。」「今天不錯。……下個月試玩區會換一批。」）',has(r.L,['最後一關換你。','我知道，剛剛看過了。打。','我自己的遊戲，最後一關還沒做。','我現在比較知道要怎麼做了。','今天不錯。下個月試玩區會換一批。']),J(r.L.slice(-10)));
    check('5. 記：WISH_DONE_heroine_04、ZQ_LAST_STAGE、相簿；錢：機台 60、扭蛋 100、休息區 60、車資 60',H.G.flags.WISH_DONE_heroine_04===true&&SOCIAL.has(ZQ,'ZQ_LAST_STAGE')&&(H.G.album||[]).some(a=>a.id==='wish_heroine_04')&&DATE.log(H.G,ZQ).wish===true&&m0-H.G.money===60+100+60+60&&H.cgs.length===0,String(m0-H.G.money));
    setup('2026-10-10',9,{lv:{[ZQ]:'dt'}}); r=await goDate(ZQ,'D03',15,['試玩',0,'差不多',2]);
    check('5. 交往中：抵達多「人很多，手給我。我是怕我自己走丟。」（舊：「人很多。手給我。……我是怕我自己走丟。」）；Q12 以前的結尾「那座橋，我回去要畫一次。」（AA_525 1-5 改句，原「……畫好再給你看。」）',has(r.L,['人很多，手給我。我是怕我自己走丟。','那座橋，我回去要畫一次。'])&&!r.L.includes('那座橋，我回去要畫一次。……畫好再給你看。'),J(r.L.slice(-6)));
  }

  /* ======================= 6 學姊 D15（AA_426 改稿）======================= */
  /* 2026-11-11（X324 學姊約會台詞重寫，AA 82c946ad7）：學姊的心願事件照 AA_764_sis_wish.json@82c946ad7 順一次（拿掉多的刪節號、車裡不用保溫瓶、玩家約她那一句、第 6 階結尾）——這一節寫死的句子照新稿改期望 */
  { const ev=E_(SIS), M=ev.mention, noCount=L=>!L.some(t=>/重點是|學弟|數到|[一二兩三四五六七八九十]顆|兩次|兩章|三件事/.test(t));
    setup('2026-01-20',15,{lv:{[SIS]:4},flags:{met_sis:true}}); let r=await meet(SIS,'library',['（聽她說完）']);
    check('6. 聊天提到（筆試前也可以）：「我想從上面看台北晚上的樣子。」……（聽她說完）「只是想而已。走吧。」（沒有「重點是」「學弟」）',has(r.L,sp(SIS,M.lines).concat(['只是想而已。走吧。']))&&noCount(r.L)&&X().known(H.G,SIS),J(r.L));
    setup('2026-03-10',15,{lv:{[SIS]:4},flags:{met_sis:true,SIS_EXAM_DONE:true}}); r=await meet(SIS,'library',['（聽她說完）']);
    check('6. 筆試考完以後第一次提：最後一句換成「以前的計畫本裡，從來沒有這一格。」',r.L.includes('以前的計畫本裡，從來沒有這一格。')&&!r.L.includes('只是想而已。走吧。'),J(r.L));
    setup('2027-03-10',15,{lv:{[SIS]:5},flags:{SIS_EXAM_DONE:true}});
    check('6. 玩家約她去陽明山（筆試考完）：還不知道「陽明山？晚上？」「好。我一直想去。你怎麼知道？」；筆試以前不說',J(sp(SIS,X().playerLines(H.G,SIS,'D15')))===J(['陽明山？晚上？','好。我一直想去。你怎麼知道？'])&&(H.G.flags.SIS_EXAM_DONE=false,X().playerLines(H.G,SIS,'D15')===null));
    { const I=ev.herInvite; setup('2027-03-09',21,{lv:{[SIS]:5},flags:{SIS_EXAM_DONE:true}}); const c=DATE.check(H.G,{who:SIS,locs:['D15'],day:H.D('2027-03-12'),depart:18.5,transport:'car'}); phone(); const tag='wish_ask_'+SIS+'_Y2S2', A=DATE.log(H.G,SIS).wishAsk||{};
      check('6. 她主動約（AA_432：週五 18:30 萬才館出發，回來不超過 23:30）：週二 21:00 傳「週五晚上有空嗎。」「陽明山。你有車。」「要做什麼，我還沒想好。這次不想好。」',c.ok&&I.dateTime===18.5&&J(msgs(SIS))===J(sp(SIS,I.lines))&&A.date===H.D('2027-03-12')&&A.depart===18.5,J({why:c.why,m:msgs(SIS),A}));
      PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===SIS);
      check('6. 答應：「好。六點半，B館前面。其他的我不排了。」；訂下週五 18:30 開車上陽明山（by:her）',msgs(SIS).slice(-1)[0]==='好。六點半，B館前面。其他的我不排了。'&&!!tr&&tr.by==='her'&&tr.depart===18.5&&tr.locs[0]==='D15'&&tr.day===H.D('2027-03-12')&&tr.back<=23.5,J({m:msgs(SIS).slice(-2),tr})); }
    const go=async(key,picks)=>{ setup(key,9,{lv:{[SIS]:5},flags:{SIS_EXAM_DONE:true}}); return goDate(SIS,'D15',18,picks||['欄杆',0,'車裡',0,'便利',0,'草地',0,0]); };
    let m0; r=await go('2026-03-13');
    check('6. 那一天（大一下）：「那一片是我們學校。」……欄杆「我本來想查這裡看得到哪幾棟。忍住了。」；草地「那顆很亮的，是星星嗎？」→「那是飛機。」「真的在動。」；收尾、第 5 階結尾；大一沒有時間點那一句',has(r.L,['那一片是我們學校。','我本來想查這裡看得到哪幾棟。忍住了。','那顆很亮的，是星星嗎？','真的在動。','我第一次，讓它空著。','下次我也不排。'])&&!r.L.some(t=>/研究計畫|去美國|論文/.test(t))&&H.G.flags.WISH_DONE_heroine_05===true&&SOCIAL.has(SIS,'SIS_THIRD_EMPTY'),J(r.L));
    check('6. 學姊整場沒有數東西、沒有「重點是」「學弟」',noCount(r.L),J(r.L.filter(t=>/顆|兩/.test(t))));
    m0=null; setup('2026-03-13',9,{lv:{[SIS]:5},flags:{SIS_EXAM_DONE:true}}); m0=H.G.money; r=await goDate(SIS,'D15',18,['便利',0,'差不多',0]);
    check('6. 便利商店「茶葉蛋我買。」：另外扣 15（自己的 60＋茶葉蛋 15＋開車 150）',r.L.includes('好。那茶葉蛋還是有，是你的。')&&m0-H.G.money===60+15+150,String(m0-H.G.money));
    r=await go('2027-03-12'); const a1=r.L.includes('下週要開始寫研究計畫。今天先不想。');
    r=await go('2027-10-15'); const a2=r.L.includes('下週要開始寫研究計畫。今天先不想。');
    r=await go('2028-03-10'); const a3=r.L.includes('八月我就去美國了。這裡，回來再來一次。')&&!r.L.includes('下週要開始寫研究計畫。今天先不想。');
    r=await go('2029-03-09'); const a4=r.L.includes('論文快寫完了。下禮拜開始，晚上都在研究室。')&&!r.L.some(t=>/去美國/.test(t));
    check('6. closing.after 照學期（AA_426）：研究計畫那句＝大二下、大三上；「八月我就去美國了。這裡，回來再來一次。」＝大三下；論文那句＝大四以後',a1&&a2&&a3&&a4,J([a1,a2,a3,a4]));
  }

  /* ======================= 7 可昕 D25（AA_426 改稿）======================= */
  { const ev=E_(KX), M=ev.mention, I=ev.herInvite;
    setup('2026-04-01',20,{lv:{[KX]:'dt'}}); let r=await meet(KX,'cafe');
    check('7. 聊天提到：春假那一趟（K8）以前不提',!r.L.includes(M.lines[0].text));
    setup('2026-04-15',20,{lv:{[KX]:'dt'},ev:['ev_kexin_trip_spring_y1']}); r=await meet(KX,'cafe');
    /* 2026-11-11（X324 可昕約會台詞重寫，AA_770_kx_wish.json@f9c1a2b80）：這一場的句子照新稿（刪節號 28 處留 5 處；她開口約、玩家答應以後那一句改用出發時間），下面幾條的期望跟著換 */
    check('7. 聊天提到（K8 以後）：「我想要有一天，手機關掉。」「……我想去外澳。只看海。」「群組、報告、我媽，全部等明天。」→ 選①「你這什麼意思。好啦，我也不確定。」（2026-11-12 CANON-NO-ECON-1112 第五批：AA_921 第 2 節換主題「手機關掉的一天」，wish_bb.json@6dbfe10d7e；舊期望是「行程表」那一版）',has(r.L,['我想要有一天，手機關掉。','……我想去外澳。只看海。','群組、報告、我媽，全部等明天。','你這什麼意思。好啦，我也不確定。'])&&!r.L.some(t=>/假設/.test(t))&&X().known(H.G,KX),J(r.L));
    setup('2026-08-20',20,{lv:{[KX]:'dt'},flags:{KX_TRIP_DEFERRED:'summer'}}); const b1=X().mentionDue(H.G,KX); at('2026-09-08',20); const b2=X().mentionDue(H.G,KX);
    check('7. 春假延到暑假（KX_TRIP_DEFERRED）：那個暑假過了才提（KX_TRIP_DEFERRED_DONE 照這樣算：AA_432 確認）',!b1&&b2,J([b1,b2]));
    setup('2026-04-29',21.5,{lv:{[KX]:'dt'},ev:['ev_kexin_trip_spring_y1']}); phone(); const tag='wish_ask_'+KX+'_Y1S2';   /* 4/15 那一週的週六是期中考週（一日遊不能排）*/
    check('7. 她主動約（週三晚上；那個週六不是考試週）：「這個週六。」「手機我要關掉一天。」「……外澳？」（2026-11-12 CANON-NO-ECON-1112 第五批：AA_921 第 2 節換主題「手機關掉的一天」，wish_bb.json@6dbfe10d7e；舊期望是「行程表」那一版）',J(msgs(KX))===J(['這個週六。','手機我要關掉一天。','……外澳？'])&&!!PHONE.byAsk(H.G,tag),J(msgs(KX)));
    PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===KX);
    check('7. 答應：「好。那我們連集合時間都不要約。」「不行，火車有時間。09:00，車站見。」（{出發時間} 換成那一趟的出發時間，畫面沒有大括號）；週六 9:00 搭火車去外澳',J(msgs(KX).slice(-2))===J(['好。那我們連集合時間都不要約。','不行，火車有時間。09:00，車站見。'])&&!msgs(KX).some(t=>/[{}]/.test(t))&&!!tr&&tr.locs[0]==='D25'&&tr.depart===9&&tr.transport==='rail'&&tr.day===H.D('2026-05-02'),J(tr));
    setup('2026-04-18',8,{lv:{[KX]:'dt'},flags:{KX_TRIP_Y1S2:'sea'},ev:['ev_kexin_trip_spring_y1']}); const m0=H.G.money; r=await goDate(KX,'D25',9,['浪邊',0,'咖啡',2,'堤防',0,'月台',0,0]);
    check('7. 那一天：「到了。」……浪邊「好冰！」；K8 去過海邊＝多選項「上次水也很冰。」→「你還記得喔。」「那這次你先下來。」；咖啡館「這杯我請。」→「好。那回程的便當我買。」（扣她那一份 150）',has(r.L,['到了。','好冰！','你還記得喔。','那這次你先下來。','好。那回程的便當我買。'])&&!r.L.includes('……到了。')&&m0-H.G.money===150+150+400&&!r.L.some(t=>/假設|這是告知|我輸了/.test(t)),J(r.L)+' '+(m0-H.G.money));
    check('7. 收尾：「今天真的一則訊息都沒看。」「……我還活著。」……交往中的結尾「回去的火車，我想坐靠海那一邊。」；記 WISH_DONE_kexin、KX_NO_PLAN（旗標名照留）（2026-11-12 CANON-NO-ECON-1112 第五批：AA_921 第 2 節換主題「手機關掉的一天」，wish_bb.json@6dbfe10d7e；舊期望是「行程表」那一版）',has(r.L,['今天真的一則訊息都沒看。','……我還活著。','回去的火車，我想坐靠海那一邊。'])&&H.G.flags.WISH_DONE_kexin===true&&SOCIAL.has(KX,'KX_NO_PLAN'),J(r.L.slice(-8)));
  }
  H.done();
})();

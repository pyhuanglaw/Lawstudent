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
const AA127=git('482c7f6e9','AA_127_以安語彤_心願約會與邀約變化.md'), BB128=git('ab9d70fe0','BB_128_校外單獨約會_心願地點與淡水示範規格.md');   /* AA_475（10-27）：白名單換版 */
const WAA=(()=>{ try{ return JSON.parse(git('482c7f6e9','date_system/wish/wish_aa.json')); }catch(e){ return null; } })(), WBB=(()=>{ try{ return JSON.parse(git('ab9d70fe0','date_system/wish/wish_bb.json')); }catch(e){ return null; } })();
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
  const DW=DATE_WISH;
  check('0. 來源＝白名單版本：wish_aa.json@482c7f6e9、AA_127@482c7f6e9（AA_475 第 1 節以安心願；之前 967b4273a AA_426）、wish_bb.json@ab9d70fe0、BB_128@ab9d70fe0（AA_475 第 1、3 節沛珊、芷若心願；之前 cb5caad65 AA_459／460 三句改進原稿）',/wish_aa\.json@482c7f6e/.test(DW.source)&&/wish_bb\.json@ab9d70fe/.test(DW.source)&&/AA_127[^＋]*@482c7f6e/.test(DW.source)&&/BB_128[^＋]*@ab9d70fe/.test(DW.source),DW.source);
  check('0. 匯入時逐句對原稿：對不到 0 句（「你來過一次」13 句是 AA_271、BB_213 後來加的，另外列）',(DW.verify.miss||[]).length===0&&(DW.verify.freeVisited||[]).length===13,J(DW.verify));
  /* AA_459 第 5 節、AA_460 第 6 節的換字（tools/date/import_wish.py 的 REPLACE；wish_bb.json 還沒跟著改）：比對 JSON 時換回原句、對原稿時不算 */
  const REP=[['你可以說不。我只是問問看。','你可以說不。不是叫你說不，是問你。'],['你的，你自己買。……這樣才算約好。','你的，你自己買。這樣比較像約好，不像我請你。'],['好。兩點半，光典門口。……兩點半是巧合。跟店名沒關係。','好。兩點半，光典門口。……兩點半是巧合，不是店名。']];
  check('0. 三句已經改進原稿（wish_bb.json@cb5caad65）：不再有暫代換字（verify.replaced 沒有）、原稿對不到 0 句',!(DW.verify.replaced||[]).length&&(DW.verify.miss||[]).length===0,J([DW.verify.replaced,DW.verify.miss]));
  { const unrep=s=>s.split('"那座橋，我回去要畫一次。"').join('"那座橋，我回去要畫一次。……畫好再給你看。"'),   /* REP 三句 cb5caad65 起已經改進企劃線的 JSON，比對的版本（ab9d70fe0）就是新句：不用換回；AA_525 1-5（6081f725f，tools/date/import_wish.py 疊的）子晴結尾換回原句再比 */ strip=e=>{ const x=JSON.parse(unrep(J(e))); delete x.src; if(x.closing&&x.id==='wish_heroine_01') delete x.closing.linesIf; return x; };
    const same=[AN,YT].every(id=>WAA&&J(strip(DW.events[id]))===J(WAA.events[id]))&&[ZR,ZQ,SIS,PS,KX].every(id=>WBB&&J(strip(DW.events[id]))===J(WBB.events[id]));
    check('0. 七位的事件和企劃線的 JSON（wish_aa@482c7f6e9、wish_bb@ab9d70fe0）逐欄相同（一字不改；只多以安大一的收尾、AA_525 1-5 子晴結尾一句）',same&&Object.keys(DW.events).length===7); }
  { const li=(DW.events[AN].closing.linesIf||[])[0], two=li?sp(AN,li.lines):[];
    check('0. 以安大一的收尾照 AA_127 1-5「大一的版本：前三句換成」：「上憲法講第八條那天，我只覺得它很長。」「今天比較知道，每一句後面都有人。」（旁白照用；大二以後照原本三句）',J(two)===J(['上憲法講第八條那天，我只覺得它很長。','今天比較知道，每一句後面都有人。'])&&two.every(t=>AA127.includes(t))&&J(li.if)===J({unless:{termFrom:'Y2S1'}})&&li.lines[0].text===DW.events[AN].closing.lines[0].text&&li.lines[3].text===DW.events[AN].closing.lines[4].text,J(li)); }
  { let n=0, bad=[]; const walk=(o,src)=>{ if(Array.isArray(o)) return o.forEach(x=>walk(x,src)); if(!o||typeof o!=='object') return; if(typeof o.text==='string'&&o.who&&o.who!=='note'){ n++; if(!inMd(o.text,src)&&!REP.some(r=>r[0]===o.text)) bad.push(o.text); return; } for(const k in o) if(!['wish','rule','note','record','where','source','title','scene','repeat','costNote','likeNote','code','memory','name','context','hotspotsTitle'].includes(k)) walk(o[k],src); };
    for(const id of [AN,YT]) walk(DW.events[id],AA127); for(const id of [ZR,ZQ,SIS,PS,KX]) walk(DW.events[id],BB128);
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
    check('1. 玩家約她去 D07：還不知道＝「景美？……我一直想去。你怎麼知道？」「好。」；知道了＝「……景美？」「你記得。」「好。理由：你記得。」',J(sp(AN,X().playerLines(H.G,AN,'D07')))===J(sp(AN,ev.playerInvite.unknown))&&(X().learn(H.G,AN),J(sp(AN,X().playerLines(H.G,AN,'D07')))===J(sp(AN,ev.playerInvite.known)))&&X().playerLines(H.G,AN,'D06')===null);
    // 那一天（大一、交往中）
    setup('2026-04-11',9,{lv:{[AN]:'dt'}}); r=await goDate(AN,'D07',13,['看守所',0,'小路',0,'法庭',1,'名字',2,0]);
    const P=ev.hotspots, C=ev.closing;
    check('1. 那一天：抵達旁白＋兩句＋交往中那一句（「我想講話的人是你。理由：你會反駁我。」），沒有第 6 階單身那一句',has(r.L,['（'+ev.arrive.narr+'）'].concat(sp(AN,ev.arrive.lines),sp(AN,ev.arrive.extraIf[1].lines)))&&!r.L.includes(ev.arrive.extraIf[0].lines[0].text),J(r.L.slice(0,8)));
    check('1. 大一去的版本：走廊「上課的時候，我只把它們背起來。」、讀書會開以前的小路「上課分組的時候……」＋選項「班上的人都在聽。」→「有幾個吧。」',r.L.includes('上課的時候，我只把它們背起來。')&&!r.L.includes('大一的時候，我只把它們背起來。')&&r.L.includes('上課分組的時候，我常叫別人講理由。')&&r.L.includes('有幾個吧。')&&r.O.some(o=>o.includes('「班上的人都在聽。」')),J(r.L));
    check('1. 法庭選②：「好，那你說理由。」「……規則寫了，就一定對嗎？……」；名字的牆選③',has(r.L,sp(AN,P['D07.court'].choices[1].reply))&&has(r.L,sp(AN,P['D07.wall'].choices[2].reply)));
    check('1. 收尾（大一）：旁白、「上憲法講第八條那天，我只覺得它很長。」「今天比較知道，每一句後面都有人。」、手帳旁白；選①「『想到人』。」；大一的結尾「回去吧。我想回去再讀一次第八條。」；沒有「我大一說」',has(r.L,['（園區裡的大樹下，有一張長椅。）','上憲法講第八條那天，我只覺得它很長。','今天比較知道，每一句後面都有人。','（她打開手帳的理由欄，寫了一行，沒有給你看。）','『想到人』。','回去吧。我想回去再讀一次第八條。'])&&!r.L.includes('我大一說，例外要說得出理由。')&&!r.L.includes('回去吧。行政法的報告，我想改一個例子。'),J(r.L.slice(-10)));
    check('1. 「我選公法研究所……」AA_426 第 4 節作廢：資料裡沒有、不播',!r.L.includes('我選公法研究所，有一個原因在這裡。')&&!J(ev).includes('公法研究所'));
    const G=H.G;
    check('1. 記：WISH_DONE_heroine_01、記憶 AN_JINGMEI（人物頁「和她去過景美……」）、相簿「她拍的樹」；算一次正式約會、心願完成',G.flags.WISH_DONE_heroine_01===true&&SOCIAL.has(AN,'AN_JINGMEI')&&SOCIAL.MEMORY_LABEL.AN_JINGMEI===ev.record.memory.text&&(G.album||[]).some(a=>a.id==='wish_heroine_01'&&a.title===ev.record.album)&&DATE.log(G,AN).wish===true&&DATE.log(G,AN).count===1&&r.t.status==='done'&&H.cgs.length===0,J(DATE.log(G,AN)));
    G.day+=1; r=await goDate(AN,'D07',13,[0,0,0]);
    check('1. 只有第一次：第二次去景美照一般約會（沒有心願的抵達、收尾）',r.t&&r.t.status==='done'&&!r.L.includes(ev.arrive.lines[1].text)&&!r.L.includes('『想到人』。'),J(r.L.slice(0,5)));
    // 大二、不知道、第 5 階：選不用給我看＝記 AN_REASON_HIDDEN；大二的結尾
    setup('2026-10-03',9,{lv:{[AN]:5}}); r=await goDate(AN,'D07',13,['法庭',2,'差不多',0]);
    check('1. 大二：收尾照原本三句（「我大一說，例外要說得出理由。」）、結尾「回去吧。行政法的報告……」；只做一個點也播收尾',r.L.includes('我大一說，例外要說得出理由。')&&r.L.includes('回去吧。行政法的報告，我想改一個例子。')&&!r.L.includes('……而且你會反駁我。')&&H.G.flags.WISH_DONE_heroine_01===true,J(r.L.slice(-8)));
    setup('2026-10-03',9,{lv:{[AN]:5}}); r=await goDate(AN,'D07',13,['法庭',2,'差不多',1]);
    check('1. 收尾選「不用給我看。」：「嗯。……下次再給你看。」、記 AN_REASON_HIDDEN',r.L.includes('嗯。……下次再給你看。')&&SOCIAL.has(AN,'AN_REASON_HIDDEN'));
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
    check('2. 答應：「嗯。{出發時間}。」填上出發時間；訂下那一趟（by:her）',msgs(YT).slice(-1)[0]==='嗯。'+INV.hhmm(dep)+'。'&&!!tr&&tr.by==='her'&&tr.depart===dep&&tr.locs[0]==='D13',J(msgs(YT).slice(-2)));
    setup('2026-10-08',20,{lv:{[YT]:5}}); const pl=X().playerLines(H.G,YT,'D13');
    check('2. 玩家約她（還不知道、事件 13 以前）：「……淡水？」「……好。」＋「我跟阿姨講一下。……她說好。」',J(sp(YT,pl))===J(sp(YT,ev.playerInvite.unknown).concat(['我跟阿姨講一下。……她說好。'])));
    X().learn(H.G,YT); H.said=[]; await X().sayInvite(GM,YT,X().playerLines(H.G,YT,'D13'),null);
    check('2. 知道了：「……淡水？」「你記得。」（她停了很久。）「……好。」——旁白不傳到手機',J(said().slice(0,4))===J(['……淡水？','你記得。','（她停了很久。）','……好。'])&&!msgs(YT).includes('她停了很久。'),J(said()));
    // 那一天：第 6 階單身、事件 13 以前
    setup('2026-10-10',9,{lv:{[YT]:6}}); let r2=await goDate(YT,'D13',15,['飲料','欄杆',0,'拍照',1,'長椅',0]);
    const C=ev.closing;
    check('2. 那一天：「（捷運的終點站。河的另一邊是一座山。）」「……跟小時候一樣。」「人比較多。」',has(r2.L,['（捷運的終點站。河的另一邊是一座山。）','……跟小時候一樣。','人比較多。']),J(r2.L.slice(0,5)));
    check('2. 飲料攤：「我點……跟你一樣的。」（她喝了一口。）……；記 TASTE_heroine_03；欄杆選①第 6 階多「……我也想走這麼遠一次。」；合照第 6 階＝「……一張。」「我媽一定會問這是誰。」',has(r2.L,['我點……跟你一樣的。','（她喝了一口。）','……太甜了。','但是可以。','……所以它一直在走。從我家旁邊，走到這裡。','……我也想走這麼遠一次。','……一張。','我媽一定會問這是誰。'])&&SOCIAL.has(YT,'TASTE_heroine_03'),J(r2.L));
    check('2. 收尾：夕陽的旁白……事件 13 以前「……不用趕回去。」換成「……今天阿姨說，店她自己顧。」「我其實有一點不習慣。」；多「回去以後，我要跟阿姨說……」；第 6 階單身的結尾兩句',has(r2.L,['（太陽慢慢往河對岸的山落下去。河面變成橘色。）','這次只有兩個人。','……今天阿姨說，店她自己顧。','我其實有一點不習慣。','……原來是這樣。','最後長這樣。','……嗯。','這次先不要。這次是我的。','回去以後，我要跟阿姨說，淡水的夕陽最後長這樣。'].concat(sp(YT,C.ending[1].lines)))&&!r2.L.includes('……不用趕回去。'),J(r2.L.slice(-12)));
    check('2. 記：WISH_DONE、YT_TAMSUI_SUNSET、相簿；心願完成',H.G.flags.WISH_DONE_heroine_03===true&&SOCIAL.has(YT,'YT_TAMSUI_SUNSET')&&DATE.log(H.G,YT).wish===true&&H.cgs.length===0);
    setup('2026-10-10',9,{lv:{[YT]:5}}); r2=await goDate(YT,'D13',15,['拍照',1,'差不多',2]);
    check('2. 第 5 階：合照「……下次。」；收尾選③「……嗯。這樣剛好。」；結尾「……下次，換我約你。」',has(r2.L,['……下次。','……嗯。這樣剛好。','……下次，換我約你。']),J(r2.L.slice(-6)));
    setup('2027-10-10',9,{lv:{[YT]:'dt'},ev:['ev_yt_thursday_free']}); r2=await goDate(YT,'D13',15,['長椅','差不多',0]);
    check('2. 事件 13 以後、交往中：照原本「……不用趕回去。」、沒有阿姨那兩句；結尾「……我們拍一張。」「這次，我要在照片裡。」',r2.L.includes('……不用趕回去。')&&!r2.L.includes('我其實有一點不習慣。')&&!r2.L.includes('回去以後，我要跟阿姨說，淡水的夕陽最後長這樣。')&&has(r2.L,['……我們拍一張。','這次，我要在照片裡。']),J(r2.L.slice(-6)));
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
    check('3. 她主動約（週三打烊後 23:00）：「光典的影展，週六下午那一場。」「我買好我的票了。」「你的，你自己買。……」',J(msgs(ZR))===J(sp(ZR,I.lines))&&!!PHONE.byAsk(H.G,tag),J(msgs(ZR)));
    PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===ZR);
    check('3. 答應：「好。兩點半，光典門口。……兩點半是巧合。跟店名沒關係。」（AA_460 第 6 節換字）；週六 14:30 光典（by:her）',msgs(ZR).slice(-1)[0]===sp(ZR,I.accept)[0]&&!!tr&&tr.locs[0]==='D05'&&tr.depart===14.5&&tr.day===H.D('2026-10-17'),J(tr));
    setup('2026-10-17',9,{lv:{[ZR]:6}}); SOCIAL.remember(ZR,'WATCHED_FILM',''); const m0=H.G.money; r=await goDate(ZR,'D05',13,['院子',1,'書店',1,'片單',0,'咖啡',1,0]);
    check('3. 那一天：抵達「這裡以前住的是外交官。現在住的是電影。」……第 6 階單身「今天我不坐走道。……」；看電影（固定，不算互動點）兩句旁白',has(r.L,sp(ZR,ev.arrive.lines).concat(sp(ZR,ev.arrive.extraIf[1].lines),allSay(ev.fixed.lines))),J(r.L.slice(0,9)));
    check('3. 院子選②大二＝「我在申請交換。……去看別人的電影院。」；書店選②買明信片（扣 30）；片單選①第 6 階＝「好。我先買我的。」',has(r.L,['我在申請交換。……去看別人的電影院。','……你挑的？','這張我會貼在店裡的吧檯後面。不告訴任何人。','好。我先買我的。'])&&!r.L.includes('想。很想。……講出來好像就要負責。'),J(r.L));
    check('3. 收尾：Z5 兩個人看過（WATCHED_FILM）＝第 2 行後面插入「翻頁時你看到《進城的那一週》那一頁……」三行（片名照 SOCIAL.filmRename）；選項；第 6 階單身結尾',(()=>{ const i=r.L.indexOf('票根。……你的，給我。'); return i>0&&r.L[i+1]==='（翻頁時你看到《進城的那一週》那一頁，只有她的那一張。）'&&r.L[i+2]==='《進城的那一週》那張，你還留著嗎？'&&r.L[i+3]==='嗯。'; })()&&has(r.L,['這次留兩張。','……今天很好。這句話我很少說。'])&&!r.L.some(t=>/東京物語/.test(t)),J(r.L.slice(-12)));
    check('3. 記：WISH_DONE_heroine_02、ZR_STUB_BOOK；錢：交通、咖啡、明信片、電影票 260（地點資料的 fixed，SYS-03）照扣',H.G.flags.WISH_DONE_heroine_02===true&&SOCIAL.has(ZR,'ZR_STUB_BOOK')&&m0-H.G.money===130+30+50+260,String(m0-H.G.money));
  }

  /* ======================= 4 沛珊 D06 ======================= */
  { const ev=E_(PS), M=ev.mention;
    setup('2025-10-14',17,{lv:{[PS]:4}}); H.picks=[]; let r=await meet(PS,'library');
    check('4. 聊天提到：「你去過美術館嗎？」「……我沒有。考試考不到的地方，我都沒去過。」「我想去一次。看畫，不用寫答案。」→ 選項',has(r.L,sp(PS,M.lines).concat([M.choices[0].reply[0].text]))&&X().known(H.G,PS),J(r.L));
    setup('2026-12-20',15,{lv:{[PS]:4}});
    check('4. 2026-12-17～2027-08-06 聯絡不到：不提、不約；大三起不上來（同一個心願在台南・美術館，hometown3d.js）',!X().here(H.G,PS)&&!X().mentionDue(H.G,PS)&&(at('2026-12-17',15),!X().here(H.G,PS))&&(at('2027-09-15',15),!X().here(H.G,PS)&&!X().mentionDue(H.G,PS)));
    const I=ev.herInvite;
    setup('2025-10-09',21.5,{lv:{[PS]:5}}); phone(); const tag='wish_ask_'+PS+'_Y1S1';
    check('4. 她主動約（週日下午那一趟、前三天週四 21:30）：「週日下午，你有空嗎？」「美術館。我想要一天，沒有標準答案。」「你可以說不。……」',J(msgs(PS))===J(sp(PS,I.lines))&&!!PHONE.byAsk(H.G,tag),J(msgs(PS)));
    PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===PS);
    check('4. 答應：「好。……我會準備。不對，我什麼都不準備。」；週日 14:00 北美館',msgs(PS).slice(-1)[0]===sp(PS,I.accept)[0]&&!!tr&&tr.locs[0]==='D06'&&tr.depart===14&&tr.day===H.D('2025-10-12'),J(tr));
    setup('2026-05-07',21.5,{lv:{[PS]:5}}); phone();
    check('4. 她有交往的對象（大一下第 7 週起和柏翰）：不約（AA_128 4-5）',msgs(PS).length===0);
    setup('2025-10-12',9,{lv:{[PS]:5},ev:['ev_peishan_syllogism']}); const m0=H.G.money; r=await goDate(PS,'D06',13,['畫框',1,'展廳',0,'差不多',0]);
    check('4. 那一天：門票 30 照扣；「這裡好安靜。像考場。」「……可是沒有人在寫字。」；空畫框選②＋看過三段論多「你記得我說過。」；收尾〈無題〉、第 5 階結尾',has(r.L,sp(PS,ev.arrive.lines).concat(['框外面，是看框的人。……今天是我們。','你記得我說過。','〈無題〉。……它連題目都沒有。','好。這是一個答案。','今天，我什麼都沒寫。']))&&m0-H.G.money===30+60,J(r.L)+' '+(m0-H.G.money));
    check('4. 記：WISH_DONE_classmate_peishan、PS_UNTITLED；大一沒有 after 那一句（大二上、大二下、大三以後才有）',H.G.flags.WISH_DONE_classmate_peishan===true&&SOCIAL.has(PS,'PS_UNTITLED')&&!r.L.some(t=>/標準答案了|又是一小時|學怎麼教書/.test(t)));
  }

  /* ======================= 5 子晴 D03（AA_426 改稿，企劃線 967b4273a）======================= */
  { const ev=E_(ZQ), M=ev.mention, I=ev.herInvite;
    setup('2026-10-08',20,{lv:{[ZQ]:4}}); let r=await meet(ZQ,'cafe',['「妳一定做得出來。」']);
    check('5. 聊天提到（第 4 階、Café）：「參創這個月有獨立遊戲的試玩區。十幾個小團隊。」……→ 選②「你又沒看過我做的東西。……好啦，謝謝。」',has(r.L,sp(ZQ,M.lines).concat(['你又沒看過我做的東西。……好啦，謝謝。']))&&X().known(H.G,ZQ),J(r.L));
    setup('2026-10-14',21.5,{lv:{[ZQ]:5}}); phone(); const tag='wish_ask_'+ZQ+'_Y2S1';
    check('5. 她主動約（週三晚上）：「週六下午三點。參創。」「……你要來嗎？」',J(msgs(ZQ))===J(['週六下午三點。參創。','……你要來嗎？'])&&!!PHONE.byAsk(H.G,tag)&&X().known(H.G,ZQ),J(msgs(ZQ)));
    PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===ZQ);
    check('5. 答應：「好。三點門口。遲到我先進去。」；訂下週六 15:00 參創（by:her）',msgs(ZQ).slice(-1)[0]==='好。三點門口。遲到我先進去。'&&!!tr&&tr.locs[0]==='D03'&&tr.depart===15&&tr.day===H.D('2026-10-17')&&tr.by==='her',J(tr));
    setup('2026-10-03',9,{lv:{[ZQ]:5}});
    check('5. 玩家約她去參創：還不知道「參創？法律系的也會去參創？」「……好。這次我帶路。」；知道了「參創？你還記得喔。」「……好。下午。早上我不存在。」',J(sp(ZQ,X().playerLines(H.G,ZQ,'D03')))===J(['參創？法律系的也會去參創？','……好。這次我帶路。'])&&(X().learn(H.G,ZQ),J(sp(ZQ,X().playerLines(H.G,ZQ,'D03')))===J(['參創？你還記得喔。','……好。下午。早上我不存在。'])));
    setup('2026-10-10',9,{lv:{[ZQ]:5}}); const m0=H.G.money; r=await goDate(ZQ,'D03',15,['試玩',1,'機台',0,'扭蛋',2,'休息',1,0]);
    check('5. 那一天：「（光華商場旁的大樓，電梯一層一層停）」「人好多。」「……我很興奮。看不出來嗎？」；試玩②「你又在鼓勵我。……我的會更好。」；扭蛋③「你很掃興耶。……一次就好。」；休息區②「甜才要喝啊。不甜我幹嘛點。」',has(r.L,['（光華商場旁的大樓，電梯一層一層停）','人好多。','……我很興奮。看不出來嗎？','你又在鼓勵我。……我的會更好。','你很掃興耶。……一次就好。','甜才要喝啊。不甜我幹嘛點。']),J(r.L));
    check('5. 收尾：「最後一關換你。」→ 選①「我知道。剛剛看過了。……打。」；Q12 以前「我自己的遊戲，最後一關還沒做。」；第 5 階「今天不錯。……下個月試玩區會換一批。」',has(r.L,['最後一關換你。','我知道。剛剛看過了。……打。','我自己的遊戲，最後一關還沒做。','……我現在比較知道要怎麼做了。','今天不錯。……下個月試玩區會換一批。']),J(r.L.slice(-10)));
    check('5. 記：WISH_DONE_heroine_04、ZQ_LAST_STAGE、相簿；錢：機台 60、扭蛋 100、休息區 60、車資 60',H.G.flags.WISH_DONE_heroine_04===true&&SOCIAL.has(ZQ,'ZQ_LAST_STAGE')&&(H.G.album||[]).some(a=>a.id==='wish_heroine_04')&&DATE.log(H.G,ZQ).wish===true&&m0-H.G.money===60+100+60+60&&H.cgs.length===0,String(m0-H.G.money));
    setup('2026-10-10',9,{lv:{[ZQ]:'dt'}}); r=await goDate(ZQ,'D03',15,['試玩',0,'差不多',2]);
    check('5. 交往中：抵達多「人很多。手給我。……我是怕我自己走丟。」；Q12 以前的結尾「那座橋，我回去要畫一次。」（AA_525 1-5 改句，原「……畫好再給你看。」）',has(r.L,['人很多。手給我。……我是怕我自己走丟。','那座橋，我回去要畫一次。'])&&!r.L.includes('那座橋，我回去要畫一次。……畫好再給你看。'),J(r.L.slice(-6)));
  }

  /* ======================= 6 學姊 D15（AA_426 改稿）======================= */
  { const ev=E_(SIS), M=ev.mention, noCount=L=>!L.some(t=>/重點是|學弟|數到|[一二兩三四五六七八九十]顆|兩次|兩章|三件事/.test(t));
    setup('2026-01-20',15,{lv:{[SIS]:4},flags:{met_sis:true}}); let r=await meet(SIS,'library',['（聽她說完）']);
    check('6. 聊天提到（筆試前也可以）：「我想從上面看台北晚上的樣子。」……（聽她說完）「……只是想而已。走吧。」（沒有「重點是」「學弟」）',has(r.L,sp(SIS,M.lines).concat(['……只是想而已。走吧。']))&&noCount(r.L)&&X().known(H.G,SIS),J(r.L));
    setup('2026-03-10',15,{lv:{[SIS]:4},flags:{met_sis:true,SIS_EXAM_DONE:true}}); r=await meet(SIS,'library',['（聽她說完）']);
    check('6. 筆試考完以後第一次提：最後一句換成「以前的計畫本裡，從來沒有這一格。」',r.L.includes('以前的計畫本裡，從來沒有這一格。')&&!r.L.includes('……只是想而已。走吧。'),J(r.L));
    setup('2027-03-10',15,{lv:{[SIS]:5},flags:{SIS_EXAM_DONE:true}});
    check('6. 玩家約她去陽明山（筆試考完）：還不知道「陽明山？晚上？」「……好。我一直想去。你怎麼知道？」；筆試以前不說',J(sp(SIS,X().playerLines(H.G,SIS,'D15')))===J(['陽明山？晚上？','……好。我一直想去。你怎麼知道？'])&&(H.G.flags.SIS_EXAM_DONE=false,X().playerLines(H.G,SIS,'D15')===null));
    { const I=ev.herInvite; setup('2027-03-09',21,{lv:{[SIS]:5},flags:{SIS_EXAM_DONE:true}}); const c=DATE.check(H.G,{who:SIS,locs:['D15'],day:H.D('2027-03-12'),depart:18.5,transport:'car'}); phone(); const tag='wish_ask_'+SIS+'_Y2S2', A=DATE.log(H.G,SIS).wishAsk||{};
      check('6. 她主動約（AA_432：週五 18:30 萬才館出發，回來不超過 23:30）：週二 21:00 傳「週五晚上有空嗎。」「陽明山。你有車。」「……要做什麼，我還沒想好。」',c.ok&&I.dateTime===18.5&&J(msgs(SIS))===J(sp(SIS,I.lines))&&A.date===H.D('2027-03-12')&&A.depart===18.5,J({why:c.why,m:msgs(SIS),A}));
      PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===SIS);
      check('6. 答應：「好。六點半，B館前面。……其他的，我不排了。」；訂下週五 18:30 開車上陽明山（by:her）',msgs(SIS).slice(-1)[0]==='好。六點半，B館前面。……其他的，我不排了。'&&!!tr&&tr.by==='her'&&tr.depart===18.5&&tr.locs[0]==='D15'&&tr.day===H.D('2027-03-12')&&tr.back<=23.5,J({m:msgs(SIS).slice(-2),tr})); }
    const go=async(key,picks)=>{ setup(key,9,{lv:{[SIS]:5},flags:{SIS_EXAM_DONE:true}}); return goDate(SIS,'D15',18,picks||['欄杆',0,'車裡',0,'便利',0,'草地',0,0]); };
    let m0; r=await go('2026-03-13');
    check('6. 那一天（大一下）：「……那一片是我們學校。」……欄杆「我本來想查這裡看得到哪幾棟。……忍住了。」；草地「……那顆很亮的，是星星嗎？」→「那是飛機。」「……真的在動。」；收尾、第 5 階結尾；大一沒有時間點那一句',has(r.L,['……那一片是我們學校。','我本來想查這裡看得到哪幾棟。……忍住了。','……那顆很亮的，是星星嗎？','……真的在動。','我第一次，讓它空著。','下次……我也不排。'])&&!r.L.some(t=>/研究計畫|去美國|論文/.test(t))&&H.G.flags.WISH_DONE_heroine_05===true&&SOCIAL.has(SIS,'SIS_THIRD_EMPTY'),J(r.L));
    check('6. 學姊整場沒有數東西、沒有「重點是」「學弟」',noCount(r.L),J(r.L.filter(t=>/顆|兩/.test(t))));
    m0=null; setup('2026-03-13',9,{lv:{[SIS]:5},flags:{SIS_EXAM_DONE:true}}); m0=H.G.money; r=await goDate(SIS,'D15',18,['便利',0,'差不多',0]);
    check('6. 便利商店「茶葉蛋我買。」：另外扣 15（自己的 60＋茶葉蛋 15＋開車 150）',r.L.includes('……好。那茶葉蛋還是有。是你的。')&&m0-H.G.money===60+15+150,String(m0-H.G.money));
    r=await go('2027-03-12'); const a1=r.L.includes('下週要開始寫研究計畫。……今天先不想。');
    r=await go('2027-10-15'); const a2=r.L.includes('下週要開始寫研究計畫。……今天先不想。');
    r=await go('2028-03-10'); const a3=r.L.includes('八月我就去美國了。……這裡，回來再來一次。')&&!r.L.includes('下週要開始寫研究計畫。……今天先不想。');
    r=await go('2029-03-09'); const a4=r.L.includes('論文快寫完了。下禮拜開始，晚上都在研究室。')&&!r.L.some(t=>/去美國/.test(t));
    check('6. closing.after 照學期（AA_426）：研究計畫那句＝大二下、大三上；「八月我就去美國了。……這裡，回來再來一次。」＝大三下；論文那句＝大四以後',a1&&a2&&a3&&a4,J([a1,a2,a3,a4]));
  }

  /* ======================= 7 可昕 D25（AA_426 改稿）======================= */
  { const ev=E_(KX), M=ev.mention, I=ev.herInvite;
    setup('2026-04-01',20,{lv:{[KX]:'dt'}}); let r=await meet(KX,'cafe');
    check('7. 聊天提到：春假那一趟（K8）以前不提',!r.L.includes(M.lines[0].text));
    setup('2026-04-15',20,{lv:{[KX]:'dt'},ev:['ev_kexin_trip_spring_y1']}); r=await meet(KX,'cafe');
    check('7. 聊天提到（K8 以後）：「我想要有一天，出門不帶行程表。」「……我想去外澳。只看海。」「我已經查好火車了。——不對，這樣就不算。」→ 選①「你這什麼意思。……好啦，我也不確定。」',has(r.L,['我想要有一天，出門不帶行程表。','……我想去外澳。只看海。','我已經查好火車了。——不對，這樣就不算。','你這什麼意思。……好啦，我也不確定。'])&&!r.L.some(t=>/假設/.test(t))&&X().known(H.G,KX),J(r.L));
    setup('2026-08-20',20,{lv:{[KX]:'dt'},flags:{KX_TRIP_DEFERRED:'summer'}}); const b1=X().mentionDue(H.G,KX); at('2026-09-08',20); const b2=X().mentionDue(H.G,KX);
    check('7. 春假延到暑假（KX_TRIP_DEFERRED）：那個暑假過了才提（KX_TRIP_DEFERRED_DONE 照這樣算：AA_432 確認）',!b1&&b2,J([b1,b2]));
    setup('2026-04-29',21.5,{lv:{[KX]:'dt'},ev:['ev_kexin_trip_spring_y1']}); phone(); const tag='wish_ask_'+KX+'_Y1S2';   /* 4/15 那一週的週六是期中考週（一日遊不能排）*/
    check('7. 她主動約（週三晚上；那個週六不是考試週）：「這個週六。」「我沒有做行程表。」「……外澳？」',J(msgs(KX))===J(['這個週六。','我沒有做行程表。','……外澳？'])&&!!PHONE.byAsk(H.G,tag),J(msgs(KX)));
    PHONE.answer(H.G,tag,0); phone(); const tr=H.G.trips.find(t=>t.who===KX);
    check('7. 答應：「好。那我們連集合時間都不要約。」「……不行，火車有時間。九點，台北車站。」；週六 9:00 搭火車去外澳',J(msgs(KX).slice(-2))===J(['好。那我們連集合時間都不要約。','……不行，火車有時間。九點，台北車站。'])&&!!tr&&tr.locs[0]==='D25'&&tr.depart===9&&tr.transport==='rail'&&tr.day===H.D('2026-05-02'),J(tr));
    setup('2026-04-18',8,{lv:{[KX]:'dt'},flags:{KX_TRIP_Y1S2:'sea'},ev:['ev_kexin_trip_spring_y1']}); const m0=H.G.money; r=await goDate(KX,'D25',9,['浪邊',0,'咖啡',2,'堤防',0,'月台',0,0]);
    check('7. 那一天：「……到了。」……浪邊「好冰！」；K8 去過海邊＝多選項「上次水也很冰。」→「……你還記得喔。」「那這次你先下來。」；咖啡館「這杯我請。」→「好。……那回程的便當我買。」（扣她那一份 150）',has(r.L,['……到了。','好冰！','……你還記得喔。','那這次你先下來。','好。……那回程的便當我買。'])&&m0-H.G.money===150+150+400&&!r.L.some(t=>/假設|這是告知|我輸了/.test(t)),J(r.L)+' '+(m0-H.G.money));
    check('7. 收尾：「今天真的什麼都沒排。」「……我還活著。」……交往中的結尾「回去的火車，我想坐靠海那一邊。」；記 WISH_DONE_kexin、KX_NO_PLAN',has(r.L,['今天真的什麼都沒排。','……我還活著。','回去的火車，我想坐靠海那一邊。'])&&H.G.flags.WISH_DONE_kexin===true&&SOCIAL.has(KX,'KX_NO_PLAN'),J(r.L.slice(-8)));
  }
  H.done();
})();

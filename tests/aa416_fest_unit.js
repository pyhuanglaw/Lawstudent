// AA_416（企劃線 ed80edb71，原 4f4da5ad；AA-B 2026-10-23）：節日總規格——七位女主角的三個情人節、生日、聖誕（＋子晴的跨年），第 6 階／交往中／視訊，
// 一天最多兩場、她約、老家開車、國外視訊、禮物、好感。不需要瀏覽器。台詞一字照稿（D109）。
// 檢查：0 讀稿（每一句都在稿裡；學姊、子晴、可昕的禁用字）、index.html、人物頁記憶、CG 代號
//   1 日子、誰約得到（第 4 階婉拒、第 5 階生日聖誕、第 6 階情人節、學姊筆試前、可昕只有交往中、和可昕交往中七夕只有可昕）、專屬場次優先
//   2 一天最多兩場（中午、晚上各一位；同一個時段第二位擋；同一個人兩場擋；開車去台中那天臺北擋；和別的約重疊擋）
//   3～9 七位：玩家約（AA_415 節日句、地點、到了先演節日那一段）、她約（前一天 21:00）、老家開車（油錢、背景）、視訊（時差）、CG
//   10 禮物（四樣各送、錢有扣、沒有準備不扣分、送過不列、錢不夠不能選、不合適只加信任）
//   11 AA_414 的 2/14 第 6 階也演（以安、語彤）、以安 1-4 第 6 階的換字、2029 的 CG 補救
//   12 校外約會（date3d.js）約在她的節日：到了先演節日那一段
//   1b 約不到的不列（學姊筆試前、可昕沒交往、和可昕交往中別人的七夕）；只有關係階段還不到照列、選了婉拒（1-3）
//   13 invites3d.js 接上的三處（實際的檔案）：INV.flow 的「約她過節」選項（手機、當面都有；約好了灰掉、說原因再選）、INV.meet 先演節日那一段
// 修改前（開發分支 f4804619）：沒有 src/fest3d.js、src/data/fest_events.js——全部 FAIL。用法：node tests/aa416_fest_unit.js
// 2026-10-28 AA_523 第 6-14 點改的（企劃線 0d7b5388b，SIS-B16-1028）：學姊交往中白色情人節的便條，2029 年那一張「明年也要。上班以後也要。」——
//   帶 aa523 的那一句：「」裡那句對 AA_523 第 6 節 6-14 那一列、「」外面（背面寫著：）照舊對 AA_416（換回「明年也要。」要一字不差在 AA_416 裡）；其他每一句照舊對 AA_416／BB_122／BB_124
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let okR=false; try{ okR=load('src/data/invite_replies.js'); }catch(e){ console.log('（載入 invite_replies.js 失敗：'+e.message+'）'); }   /* AA_415 的節日句（另一個工作階段在改；讀得到才檢查那幾句）*/
try{ load('src/data/an_yt_hol_events.js'); load('src/an_yt_hol3d.js'); }catch(e){ console.log('（載入 an_yt_hol 失敗：'+e.message+'）'); }
let ok1=false, ok2=false, err=''; try{ ok1=load('src/data/fest_events.js'); ok2=load('src/fest3d.js'); }catch(e){ err=String(e); }
const X=()=>typeof FEST!=='undefined'?FEST:null;
const git=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ return ''; } };
const doc=git('2af5f4899','AA_416_節日總規格_三個情人節生日聖誕_七位.md')   /* 2af5f4899：第 11 節（10-23 19:2x）學姊禮物價錢、送花那一句 */, doc122=git('5788b1cb4','BB_122_溫學姊戀愛線v2_分手前後與重新開始.md'), doc124=git('968473469','BB_124_節日開車約會與健身_BB人物.md');
let doc523=''; try{ doc523=cp.execSync('git show bfede0a62:"docs/story_planning/AA_523_學姊第十六批_回臺灣以後的最後半年.md"',{cwd:process.env.AA523_DOCREPO||H.ROOT,encoding:'utf8'}); }catch(e){ doc523=''; }
const row614=(doc523.split('\n').find(l=>l.startsWith('| 6-14 |'))||'');   /* AA_523 第 6 節 6-14 那一列 */
const norm=t=>String(t).replace(/^（/,'').replace(/）$/,'').replace(/[。：]$/,'');   /* 稿裡沒有括號的動作描寫：演成旁白、加（）*/
const inDoc=(t,d)=>(d||doc).indexOf(t)>=0||(d||doc).indexOf(norm(t))>=0;
const J=JSON.stringify, AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin', ALL=[AN,ZR,YT,ZQ,SIS,PS,KX];
const D=k=>H.D(k);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lv=(id,n)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:n>=4?65:(n>=3?45:25),trust:n>=4?50:(n>=3?30:0),comf:n>=4?45:0,npcRom:n>=6?60:(n>=5?35:0),rom:n>=6?35:0}); SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ H.G.flags['dating_'+id]=true; ROM.get(H.G,id).status='dating'; };
const setup=(key,h,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'dorm',o.flags||{}); G.outings=[]; G.contacts=G.contacts||{};
  for(const [id,n] of Object.entries(o.lv||{})){ lv(id,n==='dt'?6:n); if(n==='dt') date(id); G.contacts[id]=G.day-60; } if(STORY._bindGM) STORY._bindGM(GM); return G; };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
const rules=()=>{ const x=X(); if(x) x.phone(H.G); if(typeof ANYTHOL!=='undefined') ANYTHOL.phone(H.G); PHONE.tick(H.G); };
const dms=id=>H.msgs('p:'+id);
const relOf=id=>Object.assign({},SOCIAL.rel(id));
const dRel=(id,a)=>{ const b=relOf(id), o={}; for(const k of ['fam','trust','comf','npcRom','rom']) if((b[k]|0)!==(a[k]|0)) o[k]=(b[k]|0)-(a[k]|0); return J(o); };
const said=()=>H.said.map(s=>s.t);
const ask=async(id,picks,n)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r=await X().ask(GM,id,n||null); return {r,L:said(),O:H.opts.slice()}; };
const play=async(c,picks)=>{ H.said=[]; H.opts=[]; H.cgs=[]; H.bgs=[]; H.picks=(picks||[]).slice(); const ok=await X().play(GM,c); return {ok,L:said(),O:H.opts.slice()}; };
const goOut=async(qid,picks)=>{ const q=OUT.get(H.G,qid); H.said=[]; H.opts=[]; H.bgs=[]; H.cgs=[]; H.cards=[]; H.picks=(picks||[]).slice(); await OUT.go(GM,q); return {q,L:said()}; };
const img=b=>b&&b.image?b.image.replace('assets/bg/','').replace('.webp',''):b;
const accRows=(id,st)=>((typeof INVITE_REPLIES!=='undefined'&&INVITE_REPLIES.people&&INVITE_REPLIES.people[id])||[]).filter(r=>r.k==='acc'&&(r.tags||[]).includes('節日')&&st>=r.st[0]&&st<=r.st[1]).map(r=>r.lines.join(''));
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
let money=[]; GM.money=n=>{ money.push(n); H.G.money+=n; };
const REG=o=>{ global.CG_REGISTRY=o||{}; };

(async()=>{
  /* ======================= 0 讀稿、接線 ======================= */
  check('0. 讀稿（企劃線 ed80edb71 AA_416：沛珊 3/14 只放醉月湖那一版；BB_122 3-7；BB_124 第 1 節明信片）',doc.length>5000&&inDoc('台南的年份不放（BB-B 18:09）')&&doc122.indexOf('### 3-7.')>=0&&doc124.indexOf('這裡沒有白色情人節。所以我畫了一杯。')>=0);
  check('0. 新檔載得到：FEST、FEST_DATA、FEST_EVENTS（七位各一個出遊事件 ev_fest_<人物>）',ok1&&ok2&&!!X()&&FEST_EVENTS.length===7&&ALL.every(id=>!!ev('ev_fest_'+id)&&ev('ev_fest_'+id).trigger==='outing'),err);
  if(!X()){ H.done(); return; }
  await sec('0',async()=>{
  { const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
    check('0. index.html：fest_events.js、fest3d.js 接在 an_yt_hol3d.js 後面（?v= 照舊）',/src\/an_yt_hol3d\.js\?v=([^"]+)"><\/script>\n<script src="src\/data\/fest_events\.js\?v=\1"><\/script>\n<script src="src\/fest3d\.js\?v=\1"><\/script>/.test(html)); }
  check('0. STORY.PHONE_RULES、STORY.TICKS、OUT.BEFORE（校外約會）、OUT.AFTER（子晴跨年）都接了',STORY.PHONE_RULES.length>0&&STORY.TICKS.length>0&&OUT.BEFORE.length>0&&OUT.AFTER.length>0);
  { const ML=SOCIAL.MEMORY_LABEL||{}; check('0. 人物頁記憶 HOL_<節日>_<年>（1-7：「<年> 的情人節，和她一起過」照節日換字）',ML.HOL_VDAY_2027==='2027 的情人節，和她一起過'&&ML.HOL_WHITE_2026==='2026 的白色情人節，和她一起過'&&ML.HOL_QIXI_2028==='2028 的七夕，和她一起過'&&ML.HOL_BDAY_2026==='2026 的生日，和她一起過'&&ML.HOL_XMAS_2025==='2025 的聖誕節，和她一起過'&&ML.HOL_NYE_2026==='2026 的跨年，和她一起過'&&inDoc('「<年> 的情人節，和她一起過」')); }
  { const bad=[], normed=[]; const T=(t,d)=>{ if(typeof t!=='string') return; if((d||doc).indexOf(t)>=0) return; if(inDoc(t,d)){ normed.push(t); return; } bad.push(t); };
    const T523=t=>{ const q=(/「[^」]+」/.exec(t)||[''])[0]; if(!(q&&row614.includes(q)&&doc.indexOf(t.replace(q,'「明年也要。」'))>=0)) bad.push('（AA_523 6-14）'+t); };
    const lines=(L,d)=>{ for(const l of (L||[])){ if(l.aa523){ T523(l.text); continue; } if(l.text!==undefined) T(l.text,d); if(l.scene!==undefined) T(l.scene,d); for(const c of (l.choice||[])) T(c.text,d); } };
    for(const id of ALL){ const P=FEST_DATA.PEOPLE[id];
      for(const k in P.fest){ const c=P.fest[k]; for(const v of ['s5','s6','dt']) lines(c[v]); if(c.vid) lines(c.vid.lines); if(c.noonDm) c.noonDm.forEach(t=>T(t)); }
      if(P.ask){ (P.ask.lines||[]).forEach(t=>T(t)); (P.ask.homeLines||[]).forEach(t=>T(t)); (P.ask.no||[]).forEach(t=>T(t)); T(P.ask.place); }
      for(const g of (P.gifts||[])){ const d=id===SIS?doc122:null; if(id===SIS&&g.id==='flowers'){ T(g.name,d); lines(g.lines); } else { T(g.name,d); lines(g.lines,d); } }
      lines(P.none); for(const k in (P.noneBy||{})) lines(P.noneBy[k]);
      if(P.card){ lines(P.card.lines,doc124); T(P.card.narr,doc124); (P.card.dm||[]).forEach(t=>T(t)); } }
    check('0. 每一句台詞、選項、私訊、禮物、地點都在稿裡（一字不差；學姊的禮物照 BB_122 3-7、芷若的明信片照 BB_124 第 1 節）',!bad.length,J(bad));
    check('0. 稿裡沒有括號的動作描寫演成旁白（加（）、字照稿）：'+normed.length+' 句',normed.length>0&&normed.every(t=>/^（.*）$/.test(t)),J(normed)); }
  { const txt=id=>{ const P=FEST_DATA.PEOPLE[id], out=[]; const add=L=>{ for(const l of (L||[])){ if(l.text) out.push(l.text); for(const c of (l.choice||[])) out.push(c.text); } };
      for(const k in P.fest){ const c=P.fest[k]; add(c.s5); add(c.s6); add(c.dt); if(c.vid) add(c.vid.lines); } (P.gifts||[]).forEach(g=>add(g.lines)); add(P.none); for(const k in (P.noneBy||{})) add(P.noneBy[k]); ((P.ask||{}).lines||[]).forEach(t=>out.push(t)); ((P.ask||{}).no||[]).forEach(t=>out.push(t)); return out.join('｜'); };
    check('0. 學姊沒有件數、編號、「重點是」；子晴沒有「欸不是」「這不是問句」「存檔」；可昕沒有「假設」（第 10 節）',!/件事|重點是|第[一二三四]|[一二三]、/.test(txt(SIS))&&!/欸不是|這不是問句|存檔/.test(txt(ZQ))&&!/假設/.test(txt(KX)),J([txt(SIS).match(/件事|重點是/),txt(ZQ).match(/存檔/),txt(KX).match(/假設/)])); }
  { const src=fs.readFileSync(path.join(H.ROOT,'src/data/fest_events.js'),'utf8');
    check('0. CG 代號：芷若 cg_one_cup_heroine02、沛珊 cg_last_page_peishan、子晴 cg_savefile_heroine04、可昕七夕用新的 cg_our_car_kh_kexin（舊的政大後山 cg_our_car_kexin 不用）',/cg\('cg_one_cup_heroine02'\)/.test(src)&&/cg\('cg_last_page_peishan'/.test(src)&&/cg\('cg_savefile_heroine04'\)/.test(src)&&/cg\('cg_our_car_kh_kexin'\)/.test(src)&&!/cg_our_car_kexin['"]/.test(src)); }
  });

  /* ======================= 1 日子、誰約得到、專屬場次 ======================= */
  await sec('1',async()=>{ const x=X();
  check('1. 日子：子晴 2/10 生日、以安 2027 七夕 8/8、子晴 2025 跨年 12/31、學姊 2028 生日 6/2',J(x.festsOn(ZQ,D('2026-02-10')).map(f=>f.k))===J(['bday'])&&x.festsOn(AN,D('2027-08-08'))[0].k==='qixi'&&x.festsOn(ZQ,D('2025-12-31'))[0].k==='nye'&&x.festsOn(SIS,D('2028-06-02'))[0].k==='bday');
  { setup('2026-03-13',10,{lv:{[ZQ]:4}}); const a=x.eligible(H.G,ZQ,'white',2026); lv(ZQ,5); const b=[x.eligible(H.G,ZQ,'white',2026),x.eligible(H.G,ZQ,'xmas',2026),x.eligible(H.G,ZQ,'bday',2026)]; lv(ZQ,6); const c=x.eligible(H.G,ZQ,'white',2026); lv(ZQ,4); date(ZQ); const d=x.eligible(H.G,ZQ,'white',2026);
    check('1. 1-3：第 4 階約不到；第 5 階生日、聖誕可以、情人節不行；第 6 階情人節可以；交往中可以',!a&&J(b)===J([false,true,true])&&c&&d,J({a,b,c,d})); }
  { setup('2025-12-23',10,{lv:{[SIS]:6}}); const a=x.eligible(H.G,SIS,'xmas',2025), b=x.eligible(H.G,SIS,'vday',2026);
    check('1. 學姊：筆試（2026-02-02）以前不約節日（2025 聖誕不行、2026 情人節可以）',!a&&b); }
  { setup('2026-03-13',10,{lv:{[KX]:6}}); const a=x.eligible(H.G,KX,'white',2026); date(KX); const b=x.eligible(H.G,KX,'white',2026); lv(ZQ,6); const c=x.eligible(H.G,ZQ,'qixi',2026), d=x.eligible(H.G,ZQ,'white',2026);
    check('1. 可昕只有交往中；和可昕交往中，七夕只有可昕的（子晴第 6 階的七夕不行、白色情人節照常）',!a&&b&&!c&&d,J({a,b,c,d})); }
  { const chk=[];
    setup('2027-02-13',10,{lv:{[SIS]:'dt'}}); chk.push(['學姊 2027 情人節（交往中）',x.applies(H.G,SIS,'vday',2027,D('2027-02-14'))===null]);
    setup('2026-02-13',10,{lv:{[SIS]:'dt'}}); chk.push(['學姊 2026 情人節（交往中，沒有專屬＝照第 6 階）',!!x.applies(H.G,SIS,'vday',2026,D('2026-02-14'))]);
    setup('2026-06-01',10,{lv:{[SIS]:6}}); chk.push(['學姊 2026 生日（ev_sis_bday_*）',x.applies(H.G,SIS,'bday',2026,D('2026-06-02'))===null]);
    setup('2026-02-13',10,{lv:{[KX]:'dt'}}); chk.push(['可昕 2026 情人節',x.applies(H.G,KX,'vday',2026,D('2026-02-14'))===null]);
    setup('2027-08-07',10,{lv:{[KX]:'dt'}}); chk.push(['可昕 2027 七夕',x.applies(H.G,KX,'qixi',2027,D('2027-08-08'))===null]);
    setup('2027-09-27',10,{lv:{[ZR]:6}}); chk.push(['芷若 2027 生日（英國：ev_zhiruo_bday_video）',x.applies(H.G,ZR,'bday',2027,D('2027-09-28'))===null]);
    setup('2026-02-13',10,{lv:{[AN]:6}}); chk.push(['以安的 2/14（AA_414）',x.applies(H.G,AN,'vday',2026,D('2026-02-14'))===null]);
    setup('2028-03-13',10,{lv:{[AN]:'dt'}}); chk.push(['以安 2028 3/14（ev_an_white_day，年份不在表上）',x.festsOn(AN,D('2028-03-14')).length===0]);
    check('1. 專屬場次優先（第 0 節）：有專屬的那一年通用版不演',chk.every(c=>c[1]),J(chk.filter(c=>!c[1]).map(c=>c[0]))); }
  { setup('2026-03-13',10,{lv:{[ZQ]:6}}); const fo=x.flowOpt(H.G,ZQ,null,false), fo2=x.flowOpt(H.G,ZQ,null,true); at('2026-03-10',10); const fo3=x.flowOpt(H.G,ZQ,null,false);
    check('1. 邀約選單：前一天起多一項「約她過節：白色情人節」（手機、當面都有：1-4 ①「用現有的邀約（當面或手機）」）；還沒到前一天沒有',!!fo&&fo.t==='約她過節：白色情人節'&&!fo.dim&&!!fo2&&fo2.t===fo.t&&!fo3,J({fo,fo2,fo3})); }
  /* 1b. 約不到的不列（BB 10-23：學姊 2025-12-23 手機清單有「約她過節：聖誕節」，選了才婉拒）；只有關係階段還不到照 1-3 的表：照列、選了婉拒 */
  { setup('2025-12-23',10,{lv:{[SIS]:6}}); const a=x.flowOpt(H.G,SIS,null,false), b=x.flowOpt(H.G,SIS,{obj:null},true), aq=x.askable(H.G,SIS).length; at('2026-02-13',10); const c=x.flowOpt(H.G,SIS,null,false);
    check('1b. 學姊筆試以前：清單不列「約她過節：聖誕節」（手機、當面都沒有）；2026 情人節前一天照列',!a&&!b&&aq===0&&!!c&&c.t==='約她過節：情人節',J({a,b,aq,c})); }
  { setup('2026-08-18',10,{lv:{[ZQ]:6,[KX]:6}}); date(KX); const a=x.flowOpt(H.G,ZQ,null,false), k=x.flowOpt(H.G,KX,null,false); at('2026-03-13',10); const w=x.flowOpt(H.G,ZQ,null,false);
    check('1b. 和可昕交往中：子晴的七夕不列（只有可昕的）；子晴的白色情人節照列',!a&&!!w&&w.t==='約她過節：白色情人節',J({a,k,w})); }
  { setup('2026-03-13',10,{lv:{[KX]:6}}); const a=x.flowOpt(H.G,KX,null,false);
    check('1b. 可昕沒有交往：不列',!a,J(a)); }
  { setup('2026-03-13',10,{lv:{[AN]:4}}); const a=x.flowOpt(H.G,AN,null,false);
    check('1b. 關係階段還不到（以安第 4 階）照 1-3：照列、選了她婉拒（下一項）',!!a&&a.t==='約她過節：白色情人節'&&!a.dim,J(a)); }
  { setup('2026-03-13',10,{lv:{[AN]:4}}); const {r,L}=await ask(AN,[]); const want=okR&&accRows(AN,6).length?'「那天我排了讀書會。不是藉口，是真的排了。」':null;
    check('1. 第 4 階約節日：婉拒（AA_415 標「節日」的婉拒句，以安：「那天我排了讀書會。不是藉口，是真的排了。」）、沒有排',r===null&&!x.rec(H.G).bk.length&&(!want||L.includes(want)),J(L)); }
  });

  /* ======================= 2 一天最多兩場 ======================= */
  await sec('2',async()=>{ const x=X();
  { setup('2026-03-13',10,{lv:{[ZQ]:6,[AN]:6,[YT]:6}});
    const a=await ask(ZQ,[0,0]); const iv=a.r;
    check('2. 中午場約子晴：選中午場、晚上場 → 地點（Café、總圖、麵店、溫州街、半熟、一盞）；她照 AA_415 的節日句答應；排進邀約（iv.fest）',!!iv&&iv.fest&&iv.fest.slot==='noon'&&iv.h===12&&iv.day===D('2026-03-14')&&J(a.O[0].slice(0,2))===J(['中午場（11:30～14:30）','晚上場（18:00～21:30）'])&&J(a.O[1].slice(0,-1))===J(['兩點半 Café','總圖','阿鳳麵店','溫州街','半熟','一盞'])&&(!okR||accRows(ZQ,6).some(t=>a.L.some(l=>l.indexOf(t)>=0))),J({O:a.O,L:a.L}));
    const b=await ask(AN,[0,1,0]); const bk=x.rec(H.G).bk;
    check('2. 同一個時段第二位擋（「中午場已經約了高子晴。」）、晚上場約以安可以；兩場兩個不同的人',!!b.r&&b.r.fest.slot==='eve'&&b.L.includes('中午場已經約了高子晴。')&&bk.length===2&&bk[0].who===ZQ&&bk[1].who===AN&&bk[1].slot==='eve',J({L:b.L,bk}));
    const c=await ask(YT,[0,1,2]);
    check('2. 第三位：兩個時段都滿了，約不到',c.r===null&&x.rec(H.G).bk.length===2&&c.L.includes('中午場已經約了高子晴。')&&c.L.some(t=>/晚上場已經約了/.test(t)),J(c.L));
    const d=await ask(ZQ,[]); check('2. 同一個人兩場擋（「那天已經和高子晴約好了。」）',d.r===null&&d.L.includes('那天已經和高子晴約好了。'),J(d.L)); }
  { setup('2026-02-13',10,{lv:{[ZR]:6,[ZQ]:6}}); const a=await ask(ZR,[0]); const q=a.r; const b=await ask(ZQ,[0,1,2]);
    check('2. 芷若在台中：開車去台中（一整天）；那一天臺北的中午、晚上都擋（中午在台中，晚上就不能在臺北）',!!q&&q.fest.day===true&&x.rec(H.G).bk[0].slot==='day'&&b.r===null&&b.L.every(t=>!/約好/.test(t))&&b.L.some(t=>/開車去外縣市/.test(t)),J({q,L:b.L})); }
  { setup('2026-02-13',10,{lv:{[ZR]:6,[ZQ]:6}}); await ask(ZQ,[0,0]); const b=await ask(ZR,[0,1]);
    check('2. 反過來：中午先約了子晴，芷若的開車去台中擋',b.r===null&&b.L.some(t=>/已經約了高子晴/.test(t)),J(b.L)); }
  { setup('2026-03-13',10,{lv:{[ZQ]:6}}); OUT.plan(H.G,{id:'t_other',ev:null,day:D('2026-03-14'),h:12.5,late:0.25,place:'別的地方',title:'別的約',travel:'',travelH:0.25});
    const a=await ask(ZQ,[0,1,0]); check('2. 和別的約時間重疊（12:30 別的出遊）：中午場擋（「那段時間已經有別的約了。」），晚上場可以',!!a.r&&a.r.fest.slot==='eve'&&a.L.includes('那段時間已經有別的約了。'),J(a.L)); }
  });

  /* ======================= 3 以安 ======================= */
  await sec('3',async()=>{ const x=X();
  { setup('2026-03-13',10,{lv:{[AN]:6},flags:{AN_VDAY_Y1:'went'}}); const a=await ask(AN,[1,0]); at('2026-03-14',18.5); const r0=relOf(AN); const m=await play({id:AN,k:'white',y:2026,mode:'meet'},[0]);
    check('3. 以安 3/14 第 6 階、2/14 她送過東西：「白色情人節。日本是收到東西的人要回禮。」「……所以今天是你。我查過了。」→（給她一盒手工餅乾）「……你自己做的？」「焦的那一塊我吃。」',J(m.L)===J(['白色情人節。日本是收到東西的人要回禮。','……所以今天是你。我查過了。','……你自己做的？','焦的那一塊我吃。'])&&J(m.O[0])===J(['（給她一盒手工餅乾）','「我忘了。」']),J(m));
    check('3. 情人節（第 6 階）熟悉 +4、自在 +5、她的戀愛 +6；記憶 HOL_WHITE_2026；不受每天上限',dRel(AN,r0)===J({fam:4,comf:5,npcRom:6})&&SOCIAL.has(AN,'HOL_WHITE_2026'),dRel(AN,r0)); }
  { setup('2026-03-14',10,{lv:{[AN]:6},flags:{AN_VDAY_Y1:'went'}}); const m=await play({id:AN,k:'white',y:2026,mode:'meet'},[1]);
    setup('2027-03-14',10,{lv:{[AN]:'dt'},flags:{AN_CRACK:2}}); const r0=relOf(AN); const n=await play({id:AN,k:'white',y:2027,mode:'meet'});
    check('3. 「我忘了。」→「我知道你會忘，所以先說了。」「下次不准忘。」；2027 沒一起過 2/14：「白色情人節。……我們都沒送東西。」「那今天就是出來走走。」',J(m.L.slice(2))===J(['我知道你會忘，所以先說了。','下次不准忘。'])&&J(n.L)===J(['白色情人節。……我們都沒送東西。','那今天就是出來走走。']),J({m,n}));
    check('3. 交往中的情人節 +3／+6／+5、這學期的裂縫 -1（2→1）',dRel(AN,r0)===J({fam:3,comf:6,npcRom:5})&&H.G.flags.AN_CRACK===1,dRel(AN,r0)); }
  { setup('2026-03-13',20,{lv:{[AN]:'dt'}}); rules(); const pre=dms(AN).length; at('2026-03-13',21.05); rules(); const m=PHONE.byAsk(H.G,'fest_ask_heroine_01_white_2026');
    check('3. 她約（交往中）：前一天 21:00「明天是白色情人節。」「晚上六點半，總圖門口。手帳上這一格，我先寫了。」（AA_460 4-2 照節日換整組）；回覆「好。」「那天不行。」',pre===0&&J(dms(AN))===J(['明天是白色情人節。','晚上六點半，總圖門口。手帳上這一格，我先寫了。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','那天不行。']),J(dms(AN)));
    PHONE.answer(H.G,'fest_ask_heroine_01_white_2026',0); rules(); const q=OUT.get(H.G,'fest_heroine_01_white_2026'); at('2026-03-14',18.1); const r0=relOf(AN); const g=await goOut(q.id);
    check('3. 「好。」＝出遊 3/14 18:30 總圖門口（library_gate_night），到了演交往中那一段',!!q&&q.h===18.5&&q.place==='總圖門口'&&img(H.bgs.find(b=>b&&b.image))==='library_gate_night'&&g.L.includes('白色情人節。……我們都沒送東西。')&&dRel(AN,r0)===J({fam:3,comf:6,npcRom:5})&&H.G.hour===20.5,J({q,L:g.L,h:H.G.hour}));
    setup('2026-03-13',21.05,{lv:{[AN]:'dt'}}); rules(); PHONE.answer(H.G,'fest_ask_heroine_01_white_2026',1); rules();
    check('3. 「那天不行。」→「好。那我讀書。」、不排',dms(AN).slice(-1)[0]==='好。那我讀書。'&&!OUT.get(H.G,'fest_heroine_01_white_2026'));
    setup('2026-03-13',20,{lv:{[AN]:'dt',[ZQ]:6}}); await ask(AN,[0,0]); at('2026-03-13',21.05); rules(); check('3. 玩家前一天 21:00 以前已經約了她：她不約',!PHONE.byAsk(H.G,'fest_ask_heroine_01_white_2026')); }
  { setup('2026-08-18',10,{lv:{[AN]:6}}); const a=await play({id:AN,k:'qixi',y:2026,mode:'meet'}); setup('2028-08-25',10,{lv:{[AN]:'dt'},flags:{EXCHANGE_ROUTE:'JP'}}); const b=await play({id:AN,k:'qixi',y:2028,mode:'meet'});
    check('3. 七夕：第 6 階「七夕的故事，我一直覺得規定很怪。一年只能見一次，是誰定的。」「……我們不要照那個規定。」；交往中 2028 日本路線多一句「七月在日本過過一次。今天是台灣的。」',J(a.L)===J(['七夕的故事，我一直覺得規定很怪。一年只能見一次，是誰定的。','……我們不要照那個規定。'])&&J(b.L)===J(['今天你決定去哪裡。我只負責準時。','七月在日本過過一次。今天是台灣的。']),J({a,b})); }
  { setup('2027-08-08',9,{lv:{[AN]:'dt'}}); rules(); const q=OUT.get(H.G,'fest_heroine_01_qixi_2027_video');
    check('3. 2027 七夕（她在台中，隔天去京都）：交往中、沒約＝21:00 她打電話來',!!q&&q.h===21&&q.place==='電話'&&q.verb==='接起來'&&q.call===true,J(q));
    at('2027-08-08',20.95); const r0=relOf(AN); const g=await goOut(q.id);
    check('3. 電話：「七夕。我記得。」「明天我就在京都了。……那邊的七夕，是七月過的。」；視訊版 +2／+3／+3',J(g.L)===J(['七夕。我記得。','明天我就在京都了。……那邊的七夕，是七月過的。'])&&dRel(AN,r0)===J({fam:2,comf:3,npcRom:3}),J(g.L)); }
  { setup('2027-09-14',10,{lv:{[AN]:'dt'}}); const a=await ask(AN,[]); const m=await play({id:AN,k:'bday',y:2027,mode:'meet'},[4]);
    check('3. 2027 生日（中秋，晚上麵店團）：只排中午場；交往中「晚上大家要幫我過。……中午這一頓，只有你知道。」',J(a.O[0])===J(['中午場（11:30～14:30）','算了'])&&m.L[0]==='晚上大家要幫我過。……中午這一頓，只有你知道。',J({O:a.O,L:m.L})); }
  { setup('2028-09-14',10,{lv:{[AN]:6},flags:{EXCHANGE_ROUTE:'US'}}); const a=await ask(AN,[0]); const q=a.r;
    check('3. 2028 生日美國路線：視訊（臺灣 21:00＝美國 09:00，手機上是 09:00）',!!q&&q.fest.mode==='video'&&q.h===9&&J(a.O[0])===J(['視訊（09:00）','算了']),J({q,O:a.O}));
    at('2028-09-15',8.9); const g=await goOut(q.id); check('3. 「你那邊是早上吧。我這邊快睡了。」「……生日還剩三個小時。你剛好趕上。」（視訊沒有禮物）',J(g.L)===J(['你那邊是早上吧。我這邊快睡了。','……生日還剩三個小時。你剛好趕上。'])&&!H.opts.length,J(g.L)); }
  { setup('2025-12-24',10,{lv:{[AN]:'dt'}}); const m=await play({id:AN,k:'xmas',y:2025,mode:'meet'},[4]); setup('2026-12-24',10,{lv:{[AN]:5}}); const n=await play({id:AN,k:'xmas',y:2026,mode:'meet'},[4]);
    check('3. 聖誕：交往中（她遞過來一張卡片）「字很少。回去再看。」旁白（卡片上只有一行……）；第 5 階「聖誕節。……我手帳上這一天本來是空的。」「現在不是了。」；接禮物',J(m.L.slice(0,3))===J(['（她遞過來一張卡片）','字很少。回去再看。','（卡片上只有一行：「明年也一起過。——以安」）'])&&J(n.L.slice(0,2))===J(['聖誕節。……我手帳上這一天本來是空的。','現在不是了。'])&&J(n.O[0])===J(['一支好寫的鋼筆','一本空白的手帳','一本商事法的書','一束花','（沒有準備）'])&&n.L.slice(-1)[0]==='你人來了就好。',J({m:m.L,n})); }
  });

  /* ======================= 4 芷若 ======================= */
  await sec('4',async()=>{ const x=X();
  { setup('2026-02-13',10,{lv:{[ZR]:6}}); const a=await ask(ZR,[0]); const q=a.r;
    check('4. 2/14 她在台中：「開車去台中找她（一整天）」；開車照 date3d.js（D26 單程 150 分；寒假從臺北的家出發，不加回家取車的 30 分，DATE-C7；油錢 900）',!!q&&q.fest.day&&q.travelH===2.5&&q.fest.fare===900&&q.travel==='開車到台中約 2 小時 30 分鐘'&&q.title==='情人節（開車去台中找'+SOCIAL.displayName(ZR)+'）'&&a.O[0][0]==='開車去台中找她（一整天）',J({q,O:a.O}));
    at('2026-02-14',8.8); money=[]; const m0=H.G.money, r0=relOf(ZR); const g=await goOut(q.id);
    check('4. 出發扣油錢、背景台中（tc_cafe）；「你開車來台中？……我家的店今天沒開。」「我帶你去看一部老電影。」',m0-H.G.money===900&&img(H.bgs.find(b=>b&&b.image))==='tc_cafe'&&J(g.L)===J(['你開車來台中？……我家的店今天沒開。','我帶你去看一部老電影。'])&&dRel(ZR,r0)===J({fam:4,comf:5,npcRom:6}),J({m:m0-H.G.money,L:g.L,b:H.bgs.map(img)})); }
  { setup('2029-02-14',9,{lv:{[ZR]:'dt'}}); rules(); const q=OUT.get(H.G,'fest_heroine_02_vday_2029_video');
    check('4. 2029 情人節（她在倫敦）：交往中＝她打視訊來，臺灣 21:00（倫敦 13:00）',!!q&&q.h===21&&q.place==='視訊'&&x.herOff(H.G,ZR,H.G.day)===-8,J(q));
    at('2029-02-14',20.95); const g=await goOut(q.id); check('4. 「這裡下午一點。外面在下雨。」「……倫敦的情人節也在下雨。」',J(g.L)===J(['這裡下午一點。外面在下雨。','……倫敦的情人節也在下雨。'])&&img(H.bgs.find(b=>b&&b.image))==='video',J(g.L)); }
  { setup('2026-03-14',10,{lv:{[ZR]:6}}); const a=await play({id:ZR,k:'white',y:2026,mode:'meet'}); setup('2028-03-14',10,{lv:{[ZR]:'dt'}}); const b=await play({id:ZR,k:'white',y:2028,mode:'meet'});
    check('4. 3/14：第 6 階「白色情人節要回禮。……我回你一杯不在菜單上的。」；交往中「今天的拉花，我練了一個月。……不要拍。」',J(a.L)===J(['白色情人節要回禮。……我回你一杯不在菜單上的。'])&&J(b.L)===J(['今天的拉花，我練了一個月。……不要拍。'])); }
  { setup('2029-03-14',11,{lv:{[ZR]:'dt'}}); H.said=[]; const t0=x.cardTick(GM); at('2029-03-14',12.1); const t1=x.cardTick(GM); await new Promise(r=>setTimeout(r,20)); const L=said(); at('2029-03-14',21.05); rules();
    check('4. 2029 3/14（她在英國）：中午以後明信片（BB_124 第 1 節）、當晚 21:00 她傳「明信片到了嗎？……拍了也沒關係。」',!t0&&t1&&J(L)===J(['（收到一張明信片，畫了一杯拿鐵。）','這裡沒有白色情人節。所以我畫了一杯。','拉花是我練了一個月的那個。……畫得比較好。不要拍。'])&&dms(ZR).slice(-1)[0]==='明信片到了嗎？……拍了也沒關係。'&&SOCIAL.has(ZR,'HOL_WHITE_2029'),J({t0,t1,L,d:dms(ZR)})); }
  { setup('2028-08-25',10,{lv:{[ZR]:'dt'}}); const a=await play({id:ZR,k:'qixi',y:2028,mode:'meet'}); setup('2027-08-07',10,{lv:{[ZR]:6}}); const b=await play({id:ZR,k:'qixi',y:2027,mode:'meet'});
    check('4. 七夕：交往中 2028「下個月我就走了。今天的特調還沒取名。」「……你取。」；第 6 階「七夕我們店有一款特調。很甜。我不喝，可是想做給你。」',J(a.L)===J(['下個月我就走了。今天的特調還沒取名。','……你取。'])&&J(b.L)===J(['七夕我們店有一款特調。很甜。我不喝，可是想做給你。'])); }
  { setup('2025-12-23',10,{lv:{[ZR]:6}}); REG({cg_one_cup_heroine02:{file:'x',title:'今年只做一杯'}}); const a=await ask(ZR,[1,0]);
    check('4. 聖誕只約在 Café（打烊以後）',J(a.O[1])===J(['兩點半 Café','算了'])&&a.r&&a.r.place==='cafe',J(a.O));
    at('2025-12-24',18.5); const m=await play({id:ZR,k:'xmas',y:2025,mode:'meet'},[4]);
    check('4. 聖誕第 6 階（單身也可以）：旁白「（打烊後只剩吧檯的燈……）」「今年只做一杯。」放 CG cg_one_cup_heroine02「……給你的。」；接禮物',J(m.L.slice(0,3))===J(['（打烊後只剩吧檯的燈，她做了一杯拉花是聖誕樹的拿鐵。）','今年只做一杯。','……給你的。'])&&J(H.cgs)===J(['cg_one_cup_heroine02'])&&J(m.O[0])===J(['一本絕版的電影書','一張老電影的海報','一個新的馬克杯','一包咖啡豆','（沒有準備）']),J({m,cgs:H.cgs}));
    setup('2025-12-24',10,{lv:{[ZR]:5}}); const n=await play({id:ZR,k:'xmas',y:2025,mode:'meet'},[4]);
    check('4. 第 5 階：「聖誕夜我有班。……打烊以後，你可以來。」旁白（打烊後，她做了兩杯，一杯給自己。）；沒有 CG',J(n.L.slice(0,2))===J(['聖誕夜我有班。……打烊以後，你可以來。','（打烊後，她做了兩杯，一杯給自己。）'])&&!H.cgs.length,J(n.L)); REG(); delete global.CG_REGISTRY; }
  { setup('2026-09-28',10,{lv:{[ZR]:5}}); const m=await play({id:ZR,k:'bday',y:2026,mode:'meet'},[4]);
    check('4. 生日（2025、2026）：「你怎麼知道？……我沒有跟店裡的人說。」「生日我都一個人看一部電影。今年兩個人。」；沒有準備＝「沒關係。我請你喝一杯，就當你送我了。」',J(m.L)===J(['你怎麼知道？……我沒有跟店裡的人說。','生日我都一個人看一部電影。今年兩個人。','沒關係。我請你喝一杯，就當你送我了。']),J(m.L)); }
  });

  /* ======================= 5 語彤 ======================= */
  await sec('5',async()=>{ const x=X();
  { setup('2026-03-14',11,{lv:{[YT]:6}}); rules(); const pre=dms(YT).length; at('2026-03-14',12.05); rules();
    check('5. 3/14 第 6 階：中午 12:00 她先傳「（照片：麵店今天的小菜）」「這碗是你的。」',pre===0&&J(dms(YT))===J(['（照片：麵店今天的小菜）','這碗是你的。']),J(dms(YT)));
    const m=await play({id:YT,k:'white',y:2026,mode:'meet'}); check('5. 當面：「回禮。……我不知道要送什麼。」旁白（她把一個保鮮盒推過來，裡面是兩顆滷蛋。）',J(m.L)===J(['回禮。……我不知道要送什麼。','（她把一個保鮮盒推過來，裡面是兩顆滷蛋。）'])); }
  { setup('2028-03-13',10,{lv:{[YT]:'dt'}}); const a=await ask(YT,[1,0]); const m=await play({id:YT,k:'white',y:2028,mode:'meet'}); setup('2027-03-14',10,{lv:{[YT]:'dt'}}); const n=await play({id:YT,k:'white',y:2027,mode:'meet'});
    check('5. 交往中 2028（週二，她顧店）：只約在麵店（她在店裡上班也可以）、「今天我在店裡。你來，我留一顆。」；2027「……我做了滷蛋。阿姨教的。第一次做。」',J(a.O[1])===J(['阿鳳麵店','算了'])&&a.r&&a.r.fest.slot==='eve'&&J(m.L)===J(['今天我在店裡。你來，我留一顆。'])&&J(n.L)===J(['……我做了滷蛋。阿姨教的。第一次做。']),J({O:a.O,m:m.L,n:n.L})); }
  { setup('2026-08-19',10,{lv:{[YT]:'dt'}}); const a=await play({id:YT,k:'qixi',y:2026,mode:'meet'}); setup('2026-08-19',10,{lv:{[YT]:6}}); const b=await play({id:YT,k:'qixi',y:2026,mode:'meet'});
    check('5. 七夕：交往中「我跟阿姨請假了。」旁白（她說完就低頭看菜單。）；第 6 階「七夕……麵店照常開。」「……可是我晚上沒班。」',J(a.L)===J(['我跟阿姨請假了。','（她說完就低頭看菜單。）'])&&J(b.L)===J(['七夕……麵店照常開。','……可是我晚上沒班。'])); }
  { setup('2026-07-08',10,{lv:{[YT]:5}}); const a=await ask(YT,[0,0]); at('2026-07-09',12); const m=await play({id:YT,k:'bday',y:2026,mode:'meet'},[0]);
    check('5. 生日 7/9 第 5 階：只約在麵店；「……你怎麼知道。」「阿姨說的？……嗯。」「今天麵店。你來就好。」→ 禮物（一條髮圈 120：「……舊的那條鬆了。你有看到。」）',J(a.O[1])===J(['阿鳳麵店','算了'])&&J(m.L)===J(['……你怎麼知道。','阿姨說的？……嗯。','今天麵店。你來就好。','……舊的那條鬆了。你有看到。']),J({O:a.O,L:m.L}));
    setup('2028-07-08',10,{lv:{[YT]:'dt'},flags:{EXCHANGE_ROUTE:'JP'}}); const b=await ask(YT,[0]); const q=b.r; at('2028-07-09',21.9); const g=q?await goOut(q.id):{L:[]};
    check('5. 2028 生日日本路線：視訊（臺灣 21:00＝日本 22:00）「麵店今天好吵。阿姨在後面煮麵線。」「……你那邊幾點？」',!!q&&q.h===22&&J(g.L)===J(['麵店今天好吵。阿姨在後面煮麵線。','……你那邊幾點？']),J({q,L:g.L})); }
  { setup('2026-12-24',10,{lv:{[YT]:'dt'}}); const a=await play({id:YT,k:'xmas',y:2026,mode:'meet'},[4]); setup('2027-12-24',10,{lv:{[YT]:'dt'}}); const b=await play({id:YT,k:'xmas',y:2027,mode:'meet'},[4]);
    check('5. 聖誕交往中：「今天打烊早。阿姨說，聖誕節要給年輕人。」；麵店團交換禮物的年份（2026）多「交換禮物我抽到一條圍巾。……我換給你了。阿哲不知道。」、2027 沒有',J(a.L.slice(0,2))===J(['今天打烊早。阿姨說，聖誕節要給年輕人。','交換禮物我抽到一條圍巾。……我換給你了。阿哲不知道。'])&&b.L[0]==='今天打烊早。阿姨說，聖誕節要給年輕人。'&&!b.L.includes('交換禮物我抽到一條圍巾。……我換給你了。阿哲不知道。'),J({a:a.L,b:b.L})); }
  });

  /* ======================= 6 子晴 ======================= */
  await sec('6',async()=>{ const x=X();
  { setup('2026-02-14',10,{lv:{[ZQ]:'dt'}}); const a=await play({id:ZQ,k:'vday',y:2026,mode:'meet'}); setup('2026-02-14',10,{lv:{[ZQ]:6}}); const b=await play({id:ZQ,k:'vday',y:2026,mode:'meet'});
    check('6. 2/14：交往中小關卡（旁白：插座貓走到終點……）；第 6 階「情人節？……你是認真的？」「好。我請你吃巧克力。超商的。」',J(a.L)===J(['我做了一個情人節的小關卡。最後一關有一句話。','……玩。','（插座貓走到終點，畫面跳出一行字：「下次換你做一關給我。」）'])&&J(b.L)===J(['情人節？……你是認真的？','好。我請你吃巧克力。超商的。'])); }
  { setup('2026-02-10',10,{lv:{[ZQ]:'dt'},flags:{ZQ_TB_PLAYED:1}}); const m=await play({id:ZQ,k:'bday',y:2026,mode:'meet'},[2]);
    check('6. 生日交往中「今天我生日。……你說要送什麼？」→ 禮物（玩過測試版才有「測試報告」0 元：「三十二個 bug？」「……這是我收過最好的禮物。」）',J(m.L)===J(['今天我生日。……你說要送什麼？','三十二個 bug？','……這是我收過最好的禮物。'])&&J(m.O[0])===J(['插座貓圖案的鍵帽','一組吉他彈片','測試報告','一本程式設計的書','（沒有準備）']),J(m));
    setup('2026-12-24',10,{lv:{[ZQ]:5}}); const n=await play({id:ZQ,k:'xmas',y:2026,mode:'meet'},[3]);
    check('6. 沒玩過測試版：沒有「測試報告」；聖誕沒有準備＝「沒差。測試版先欠著。」',J(n.O[0])===J(['插座貓圖案的鍵帽','一組吉他彈片','一本程式設計的書','（沒有準備）'])&&n.L.slice(-1)[0]==='沒差。測試版先欠著。',J(n)); }
  { setup('2025-12-31',23.4,{lv:{[ZQ]:'dt'}}); REG({cg_savefile_heroine04:{file:'x',title:'t'}}); OUT.plan(H.G,{id:'nye',ev:'ev_nye_roof',day:H.G.day,h:23+40/60,place:'宿舍頂樓',title:'跨年：宿舍頂樓',travel:'',travelH:0,back:'回到房間。'});
    const r0=relOf(ZQ); const g=await goOut('nye');
    check('6. 跨年交往中：頂樓的倒數以後接著演（OUT.AFTER）——筆電的煙火、CG cg_savefile_heroine04、「新年快樂。……這一關我做了一個月。」；+4／+4／+4、記憶 HOL_NYE_2025',g.L.slice(-3).join('｜')==='（她打開筆電：插座貓走到最後一關，最後一關是煙火。）｜（十二點，真的煙火和螢幕上的一起亮。）｜新年快樂。……這一關我做了一個月。'&&H.cgs.includes('cg_savefile_heroine04')&&SOCIAL.has(ZQ,'HOL_NYE_2025')&&dRel(ZQ,r0)===J({fam:4,comf:4,npcRom:4}),J({L:g.L.slice(-4),cgs:H.cgs})); delete global.CG_REGISTRY;
    setup('2025-12-31',10,{lv:{[ZQ]:6}}); const a=await ask(ZQ,[]); check('6. 跨年第 6 階：約她＝「跨年？好。我帶筆電。不要問為什麼。」',a.r==='nye'&&a.L.includes('跨年？好。我帶筆電。不要問為什麼。')&&H.G.flags.ZQ_NYE_2025==='s6',J(a.L)); }
  { setup('2026-08-18',21.05,{lv:{[ZQ]:'dt'}}); rules(); check('6. 她約（七夕；AA_445 1-2 照節日換整組）：「明天七夕」「下午一點 公園 我設了三個鬧鐘」',J(dms(ZQ))===J(['明天七夕','下午一點 公園 我設了三個鬧鐘']),J(dms(ZQ)));
    PHONE.answer(H.G,'fest_ask_heroine_04_qixi_2026',1); check('6. 「那天不行。」→「好 那我睡覺」',dms(ZQ).slice(-1)[0]==='好 那我睡覺');
    setup('2026-02-09',21.05,{lv:{[ZQ]:'dt'}}); rules(); check('6. 生日不會由她約（2/9 21:00 沒有私訊）',!dms(ZQ).length); }
  });

  /* ======================= 7 學姊 ======================= */
  await sec('7',async()=>{ const x=X();
  { setup('2026-02-14',10,{lv:{[SIS]:6}}); const a=await play({id:SIS,k:'vday',y:2026,mode:'meet'}); setup('2027-02-14',10,{lv:{[SIS]:6}}); const b=await play({id:SIS,k:'vday',y:2027,mode:'meet'});
    check('7. 2/14 第 6 階：2026「筆試考完了。……今天我什麼都沒排。」；2027「情人節。……我今年沒排別的事。」',J(a.L)===J(['筆試考完了。……今天我什麼都沒排。'])&&J(b.L)===J(['情人節。……我今年沒排別的事。'])); }
  { setup('2026-03-14',10,{lv:{[SIS]:'dt'}}); const a=await play({id:SIS,k:'white',y:2026,mode:'meet'});
    check('7. 3/14 交往中：「回禮。」旁白（一張便條，背面也有字。）「背面，回去再看。」旁白（背面寫著：「明年也要。」）；說話框是「書瑀」',J(a.L)===J(['回禮。','（一張便條，背面也有字。）','背面，回去再看。','（背面寫著：「明年也要。」）'])&&H.said[0].who===SOCIAL.displayName(SIS),J({L:a.L,who:H.said[0].who})); }
  { setup('2026-08-18',10,{lv:{[SIS]:6}}); const a=await ask(SIS,[1,0]); const q=a.r;
    check('7. 七夕第 6 階：開車上陽明山（D15 開車 40 分；暑假從臺北的家出發，不加取車的 30 分，DATE-C7；油錢 150）、晚上場（只有這個地方）',!!q&&a.O.length===1&&q.title==='七夕（開車上陽明山）'&&q.fest.bg==='d15_base_night'&&Math.abs(q.travelH-40/60)<1e-9&&q.fest.fare===150&&q.h===19,J({q,O:a.O}));
    at('2026-08-19',17.7); money=[]; const g=await goOut(q.id); check('7. 「一年見一次，很辛苦吧。」「我以前覺得，排好的話，一年一次也可以。」（油錢有扣）',J(g.L)===J(['一年見一次，很辛苦吧。','我以前覺得，排好的話，一年一次也可以。'])&&J(money)===J([-150]),J({L:g.L,money})); }
  { setup('2028-06-02',10,{lv:{[SIS]:'dt'},flags:{EXCHANGE_ROUTE:'TW'}}); H.G.money=500; money=[]; const m=await play({id:SIS,k:'bday',y:2028,mode:'meet'},[0]);
    check('7. 2028 生日（沒有專屬的那一年）交往中＝第 6 階的兩句＋「……我把計畫本那一天塗掉了。」；禮物照 BB_122 3-7（W8 以後才有「今天先不改了」券）；螢光筆「實用。……謝謝。這週就會用完。」',J(m.L)===J(['生日？期末考前。我從來沒有好好過過。','……今年讓你排。我不看時間。','……我把計畫本那一天塗掉了。','實用。……謝謝。這週就會用完。'])&&J(m.O[0])===J(['一盒綠色螢光筆','一本空白筆記本','期末考前的蜂蜜檸檬','手寫的「今天先不改了」券','一束花','（沒有準備）']),J(m));
    setup('2028-06-01',10,{lv:{[SIS]:6},flags:{EXCHANGE_ROUTE:'JP'}}); const a=await ask(SIS,[0]); at('2028-06-02',21.9); const g=a.r?await goOut(a.r.id):{L:[]};
    check('7. 2028 生日日本路線：視訊 22:00「研究室沒有蛋糕。……我買了一個布丁。」「你看，蠟燭插不進去。」',!!a.r&&a.r.h===22&&J(g.L)===J(['研究室沒有蛋糕。……我買了一個布丁。','你看，蠟燭插不進去。']),J({q:a.r,L:g.L})); }
  { setup('2026-12-24',10,{lv:{[SIS]:6}}); H.G.money=1000; money=[]; const m=await play({id:SIS,k:'xmas',y:2026,mode:'meet'},[4]);
    check('7. 聖誕第 6 階「聖誕節。今天家族沒有聚餐。」「……所以只有我們兩個。」；一束花 500 元＝「花喔。……我要去找一個瓶子。」（AA_416 第 11 節第 6 點）',J(m.L)===J(['聖誕節。今天家族沒有聚餐。','……所以只有我們兩個。','花喔。……我要去找一個瓶子。'])&&J(money)===J([-500]),J({L:m.L,money})); }
  { setup('2027-03-13',21.05,{lv:{[SIS]:'dt'}}); rules(); check('7. 她約（沒有專屬的 3/14；AA_445 1-2）：「明天是三月十四。」「晚上七點，法圖門口。」',J(dms(SIS))===J(['明天是三月十四。','晚上七點，法圖門口。']),J(dms(SIS)));
    PHONE.answer(H.G,'fest_ask_heroine_05_white_2027',1); check('7. 「那天不行。」→「好。那我寫論文。」',dms(SIS).slice(-1)[0]==='好。那我寫論文。');
    setup('2027-02-13',21.05,{lv:{[SIS]:'dt'}}); rules(); check('7. 2027 情人節（交往中有專屬 S.HOL）：通用版不約',!PHONE.byAsk(H.G,'fest_ask_heroine_05_vday_2027')); }
  });

  /* ======================= 8 沛珊 ======================= */
  await sec('8',async()=>{ const x=X();
  { setup('2026-02-13',10,{lv:{[PS]:6}}); const a=await ask(PS,[0]); at('2026-02-14',8.8); const g=await goOut(a.r.id);
    check('8. 2/14 寒假在台中：開車去（背景 tc_eatery）「情人節？我在台中。早餐店情人節也開。」「你要來吃蛋餅嗎？」',img(H.bgs.find(b=>b&&b.image))==='tc_eatery'&&J(g.L)===J(['情人節？我在台中。早餐店情人節也開。','你要來吃蛋餅嗎？']),J({L:g.L,b:H.bgs.map(img)})); }
  { setup('2027-02-14',9,{lv:{[PS]:'dt'}}); rules(); const q=OUT.get(H.G,'fest_classmate_peishan_vday_2027_video');
    at('2027-02-14',20.95); const g=q?await goOut(q.id):{L:[]};
    check('8. 2027 消失期、交往中：21:00 她打電話「情人節。我在讀書。」「……可是我想聽你的聲音。五分鐘就好。」',!!q&&q.h===21&&q.place==='電話'&&J(g.L)===J(['情人節。我在讀書。','……可是我想聽你的聲音。五分鐘就好。']),J({q,L:g.L}));
    setup('2027-02-13',10,{lv:{[PS]:6}}); check('8. 消失期、沒交往：不演',!x.flowOpt(H.G,PS,null,false)&&x.applies(H.G,PS,'vday',2027,D('2027-02-14'))===null);
    setup('2027-03-13',10,{lv:{[PS]:'dt'}}); const w=x.applies(H.G,PS,'white',2027,D('2027-03-14')); setup('2027-03-14',10,{lv:{[PS]:'dt'}}); const a=await ask(PS,[0]);
    check('8. 消失期的生日（交往中）：玩家打電話「今天生日。我還是在讀書。」「……你打來，就算過了。」；白色情人節 2027 不演',!!a.r&&a.r.place==='電話'&&a.O[0][0]==='打電話給她（21:00）'&&w===null,J({O:a.O,w}));
    at('2027-03-15',20.95); const g2=await goOut(a.r.id); check('8. 電話照稿',J(g2.L)===J(['今天生日。我還是在讀書。','……你打來，就算過了。']),J(g2.L)); }
  { setup('2026-03-13',10,{lv:{[PS]:6}}); REG({cg_last_page_peishan:{file:'x',title:'t'}}); const a=await ask(PS,[1]);
    check('8. 2026 3/14：醉月湖邊（晚上 19:00）',!!a.r&&a.r.place==='醉月湖邊'&&a.r.h===19&&J(a.O[0].slice(0,2))===J(['中午場（11:30～14:30）','晚上場（18:00～21:30）']),J({q:a.r,O:a.O}));
    at('2026-03-14',18.7); const g=await goOut(a.r.id);
    check('8. 醉月湖那一場放 CG cg_last_page_peishan（在「最後一頁是空的」那一句）',J(g.L)===J(['（她拿出一本筆記本。）','這一年我問你的問題，我自己的答案都寫在這裡。','最後一頁是空的。……那一題，你來回答。'])&&J(H.cgs)===J(['cg_last_page_peishan'])&&H.G.flags.PS_WHITE_CG===true,J({L:g.L,cgs:H.cgs}));
    setup('2028-03-13',10,{lv:{[PS]:6},flags:{PS_RECONNECT:true}}); const b=await ask(PS,[0]); at('2028-03-14',7); const g2=await goOut(b.r.id);
    check('8. 2028 在台南：開車去台南（D28 單程 240 分＋學期中從宿舍出發先回家取車 30 分）、運河邊（tn_canal）、多「這裡沒有醉月湖。……運河也可以。」、不放 CG',!!b.r&&Math.abs(b.r.travelH-4.5)<1e-9&&img(H.bgs.find(x=>x&&x.image))==='tn_canal'&&g2.L[0]==='這裡沒有醉月湖。……運河也可以。'&&!H.cgs.length,J({q:b.r,L:g2.L,cgs:H.cgs,b:H.bgs.map(img)})); delete global.CG_REGISTRY; }
    { const dorm=x.drive('D28','台南',H.G,D('2028-03-14')), home=x.drive('D28','台南',H.G,D('2028-07-14'));
      check('8. 開車的算法（DATE-C7）：學期中＝去回各多 30 分、寫「回家取車約 30 分鐘，再開車到台南約 4 小時」；寒暑假從臺北的家＝不加、不寫那一句',dorm.travelH===4.5&&dorm.backH===4.5&&dorm.travel==='回家取車約 30 分鐘，再開車到台南約 4 小時'&&!dorm.home&&home.travelH===4&&home.backH===4&&home.travel==='開車到台南約 4 小時'&&home.home===true,J({dorm,home})); }
  { setup('2028-02-13',21.05,{lv:{[PS]:'dt'}}); rules(); const m=PHONE.byAsk(H.G,'fest_ask_classmate_peishan_vday_2028');
    check('8. 她約、她在台中（2028 情人節）：「明天情人節。……你要下來台中嗎？不用勉強。」（AA_457 3-1 節①換字；原本「明天你要下來嗎？……不用勉強。」）',J(dms(PS))===J(['明天情人節。……你要下來台中嗎？不用勉強。'])&&!!m,J(dms(PS)));
    PHONE.answer(H.G,'fest_ask_classmate_peishan_vday_2028',0); rules(); const q=OUT.get(H.G,'fest_classmate_peishan_vday_2028');
    check('8. 「好。」＝開車去台中（一整天）',!!q&&q.fest.day&&q.place==='台中',J(q));
    setup('2026-03-13',21.05,{lv:{[PS]:'dt'}}); const m2=x.herLines(PS,'xmas'); check('8. 她約的第一句照節日換：「明天是聖誕節！！」「晚上六點半，溫州街口，可以嗎？」（AA_460 4-3 的臺北版照第 9 節當作沒有）',J(m2)===J(['明天是聖誕節！！','晚上六點半，溫州街口，可以嗎？'])); }
  { setup('2026-08-19',10,{lv:{[PS]:'dt'}}); const a=await play({id:PS,k:'qixi',y:2026,mode:'meet'}); setup('2028-03-15',10,{lv:{[PS]:6},flags:{PS_RECONNECT:true}}); H.G.money=200; const b=await play({id:PS,k:'bday',y:2028,mode:'meet'},[3,2]);
    check('8. 七夕交往中「我查到了。……不告訴你。明年再問我。」；生日第 6 階＋禮物（錢不夠的那一樣不能選：「錢不夠。」）',J(a.L)===J(['我查到了。……不告訴你。明年再問我。'])&&J(b.L)===J(['你怎麼知道？……我只在讀書會說過一次。','我們家的生日蛋糕是蛋餅疊起來的，三層。我爸的發明。','錢不夠。','我的問題都是用筆想的。……這支我會寫很多問題。'])&&H.G.money===0,J({a:a.L,b:b.L,m:H.G.money})); }
  });

  /* ======================= 9 可昕 ======================= */
  await sec('9',async()=>{ const x=X();
  { setup('2026-03-13',21.05,{lv:{[KX]:'dt'}}); rules(); check('9. 3/14 她約（AA_445 1-2）：「明天三月十四 晚上六點半 公館」「回禮我準備好了」',J(dms(KX))===J(['明天三月十四 晚上六點半 公館','回禮我準備好了']),J(dms(KX)));
    PHONE.answer(H.G,'fest_ask_kexin_white_2026',0); rules(); const q=OUT.get(H.G,'fest_kexin_white_2026'); at('2026-03-14',18.1); const g=await goOut(q.id);
    check('9. 公館（gongguan）「白色情人節。我記得你上個月送什麼。」「……這是回禮。拆開以前不准猜。」',img(H.bgs.find(b=>b&&b.image))==='gongguan'&&g.L.slice(0,2).join('｜')==='白色情人節。我記得你上個月送什麼。｜……這是回禮。拆開以前不准猜。',J(g.L)); }
  { setup('2026-08-18',10,{lv:{[KX]:'dt'}}); REG({cg_our_car_kexin:{file:'old',title:'我們有車'}}); const a=await ask(KX,[0]); const q=a.r;
    check('9. 七夕（她在高雄）：開車去高雄（D29 單程 270 分；暑假從臺北的家出發，不加取車的 30 分，DATE-C7）或視訊',!!q&&Math.abs(q.travelH-4.5)<1e-9&&q.h===19.5&&J(a.O[0])===J(['開車去高雄找她（一整天）','視訊（21:00）','算了']),J({q,O:a.O}));
    at('2026-08-19',14.2); const g=await goOut(q.id);
    check('9. 高雄的山上（kh_sizihwan）：旁白、「牛郎織女如果有車，就不用等一年了。」「……我們有車。」；舊的政大後山 CG 不放、新的還沒登錄就不放',img(H.bgs.find(b=>b&&b.image))==='kh_sizihwan'&&J(g.L)===J(['（晚上，山上的停車處，看得到港口的燈。）','牛郎織女如果有車，就不用等一年了。','……我們有車。'])&&!H.cgs.length,J({L:g.L,cgs:H.cgs}));
    REG({cg_our_car_kh_kexin:{file:'new',title:'我們有車'}}); setup('2028-08-26',10,{lv:{[KX]:'dt'}}); const m=await play({id:KX,k:'qixi',y:2028,mode:'meet'}); check('9. 高雄那一張 CG 畫好登錄以後才放（cg_our_car_kh_kexin）',J(H.cgs)===J(['cg_our_car_kh_kexin'])); delete global.CG_REGISTRY; }
  { setup('2026-08-19',9,{lv:{[KX]:'dt'}}); rules(); const q=OUT.get(H.G,'fest_kexin_qixi_2026_video'); at('2026-08-19',20.95); const g=q?await goOut(q.id):{L:[]};
    check('9. 沒約她：21:00 她打視訊來「七夕。……你不來，我就自己看港口。」',!!q&&q.verb==='接起來'&&J(g.L)===J(['七夕。……你不來，我就自己看港口。']),J({q,L:g.L})); }
  /* BB-B 10-23：可昕交往中 2026-08-19 排了兩通 21:00 視訊（r2y3a3d.js 的 kx_qixi_2026＋這裡的 fest_kexin_qixi_2026_video）——r2y3a 的七夕視訊是專屬場次，FEST 不再自動打（「專屬場次優先」）*/
  { const R0=globalThis.R2Y3A; globalThis.R2Y3A={QIXI:[{key:'2026-08-19',ok:()=>true},{key:'2027-08-08',ok:()=>false},{key:'2028-08-26',ok:()=>true}]};
    try{ setup('2026-08-19',9,{lv:{[KX]:'dt'}}); rules(); const q=OUT.get(H.G,'fest_kexin_qixi_2026_video');
      check('9b. r2y3a3d.js 有那一年的七夕視訊（2026、2028）＝FEST 不另外打（一天只有一通 21:00 視訊）',!q&&x.dedicated(H.G,KX,'qixi',2026)&&x.dedicated(H.G,KX,'qixi',2028),J(q)); }
    finally{ if(R0===undefined) delete globalThis.R2Y3A; else globalThis.R2Y3A=R0; } }
  { setup('2025-12-24',10,{lv:{[KX]:'dt'}}); const m=await play({id:KX,k:'xmas',y:2025,mode:'meet'});
    check('9. 2025 聖誕：「聖誕節。……我從山上下來了。你要請客。」（沒有禮物：照現有）',J(m.L)===J(['聖誕節。……我從山上下來了。你要請客。'])&&!m.O.length,J(m)); }
  { setup('2026-03-13',21.05,{lv:{[KX]:6}}); rules(); check('9. 沒交往（分開以後只能當朋友）：不約、不演',!dms(KX).length&&!x.flowOpt(H.G,KX,null,false)); }
  });

  /* ======================= 10 禮物 ======================= */
  await sec('10',async()=>{ const x=X();
  { setup('2026-09-15',10,{lv:{[AN]:6}}); H.G.money=5000; money=[]; const r0=relOf(AN); const a=await play({id:AN,k:'bday',y:2026,mode:'meet'},[0]); const d1=dRel(AN,r0);
    check('10. 送鋼筆（合適）：錢扣 800、她的戀愛 +2、信任 +3（加上生日 +4／+4／+4）；送過的記下來',J(money)===J([-800])&&d1===J({fam:4,trust:3,comf:4,npcRom:6})&&J(x.rec(H.G).gifts[AN])===J(['pen']),J({money,d1}));
    H.G.day=D('2026-12-24'); const b=await play({id:AN,k:'xmas',y:2026,mode:'meet'},[2]); const r1=relOf(AN);
    check('10. 送過的不再列（聖誕的禮物沒有鋼筆）；一束花（不合適）只加信任 +3：「……謝謝。」旁白（她拿著花……）「宿舍沒有花瓶。」',J(b.O[0])===J(['一本空白的手帳','一本商事法的書','一束花','（沒有準備）'])&&J(b.L.slice(-3))===J(['……謝謝。','（她拿著花，不知道要放哪裡。）','宿舍沒有花瓶。'])&&dRel(AN,r0)===J({fam:8,trust:6,comf:8,npcRom:10}),J({O:b.O,L:b.L,r:dRel(AN,r0)}));
    setup('2028-09-15',10,{lv:{[AN]:6},flags:{AN_VDAY_GIFT:'pen'}}); const c=await play({id:AN,k:'bday',y:2028,mode:'meet'},[4]); const r2=relOf(AN);
    check('10. 2028 情人節送過鋼筆的不列；「（沒有準備）」不扣分（照樣 +4／+4／+4）、「你人來了就好。」',J(c.O[0])===J(['一本空白的手帳','一本商事法的書','一束花','（沒有準備）'])&&c.L.slice(-1)[0]==='你人來了就好。'); }
  { setup('2026-07-09',10,{lv:{[YT]:6}}); H.G.money=2000; money=[]; const r0=relOf(YT); const a=await play({id:YT,k:'bday',y:2026,mode:'meet'},[3]);
    check('10. 語彤的香水（不合適，1,500）：錢照扣、只加信任：「……太貴了。我不能收。」「……我收一半。」旁白（她真的把盒子裡的試用瓶留下……）',J(money)===J([-1500])&&J(a.L.slice(-3))===J(['……太貴了。我不能收。','……我收一半。','（她真的把盒子裡的試用瓶留下，正瓶推回來給你。）'])&&dRel(YT,r0)===J({fam:4,trust:3,comf:4,npcRom:4}),J({money,L:a.L,r:dRel(YT,r0)})); }
  });

  /* ======================= 11 AA_414 的 2/14 第 6 階也演 ======================= */
  await sec('11',async()=>{ const A=typeof ANYTHOL!=='undefined'?ANYTHOL:null;
  { setup('2026-02-12',21.05,{lv:{[AN]:6},flags:{AN_CRACK:2}}); rules(); check('11. 以安第 6 階（沒交往）：2/12 21:00 照樣約「十四號那天，你在臺北嗎？」',J(dms(AN))===J(['十四號那天，你在臺北嗎？']),J(dms(AN)));
    REG({cg_valentine_taichung_heroine01:{file:'x',title:'t'}}); PHONE.answer(H.G,'anyt_an_y1_ask',0); rules(); at('2026-02-14',10.8); const r0=relOf(AN); await goOut('anyt_an_vday_y1',[0]);
    check('11. 台中那一場：放 CG cg_valentine_taichung_heroine01（「開了兩個多小時……」那一拍）；第 6 階 +4／+5／+6、裂縫不動',J(H.cgs)===J(['cg_valentine_taichung_heroine01'])&&H.G.flags.AN_VDAY_CG===true&&dRel(AN,r0)===J({fam:4,comf:5,npcRom:6})&&H.G.flags.AN_CRACK===2,J({cgs:H.cgs,r:dRel(AN,r0)})); delete global.CG_REGISTRY;
    setup('2026-02-13',21.05,{lv:{[YT]:6}}); rules(); check('11. 語彤第 6 階：2/13 21:00 照樣約「明天店休。」',dms(YT)[0]==='明天店休。');
    setup('2026-09-24',21.05,{lv:{[YT]:6}}); rules(); check('11. 中秋照 AA_414 只有交往中',!dms(YT).length); }
  { setup('2029-02-14',9,{lv:{[AN]:6}}); rules(); const q=OUT.get(H.G,'anyt_an_vday_y4'); H.said=[]; H.opts=[]; H.picks=[1]; await EVENTS.run(ev('ev_an_vday_y4')); const L=said();
    check('11. 2029 電話第 6 階：「外婆家好玩嗎？」→「表妹問我有沒有男朋友。我說沒有。」「……她說那就是快有了。」；沒拿過 CG 的多一個選項「我明天開車下去。」',!!q&&J(H.opts[0])===J(['「十八號回來？」','「外婆家好玩嗎？」','「我明天開車下去。」'])&&L.includes('表妹問我有沒有男朋友。我說沒有。')&&L.includes('……她說那就是快有了。')&&!L.includes('……她說那就是有。'),J({O:H.opts,L}));
    setup('2029-02-14',9,{lv:{[AN]:'dt'}}); rules(); H.said=[]; H.opts=[]; H.picks=[2]; await EVENTS.run(ev('ev_an_vday_y4')); const L2=said(); rules(); const qr=OUT.get(H.G,'anyt_an_vday_tc');
    check('11. 選「我明天開車下去。」→「……初三。下午兩點，公園門口。」「我只能出來兩個小時。」→ 2/15 14:00 開車去台中（照 1-1）',L2.includes('……初三。下午兩點，公園門口。')&&L2.includes('我只能出來兩個小時。')&&!!qr&&qr.day===D('2029-02-15')&&qr.h===14&&qr.travelH===2.5,J({L2,qr}));   /* 2/15 在寒假：從臺北的家出發（DATE-C7）*/
    REG({cg_valentine_taichung_heroine01:{file:'x',title:'t'}}); at('2029-02-15',10.9); const g=await goOut('anyt_an_vday_tc',[0]);
    check('11. 補救那一場：台中的公園、紙袋、休息站，放 CG；記 AN_VDAY_Y4B went（3/14 算她 2/14 送過東西）',g.L.includes('（休息站，你打開紙袋。是一盒太陽餅，盒子上貼著一張便利貼，寫著你的名字。）')&&J(H.cgs)===J(['cg_valentine_taichung_heroine01'])&&H.G.flags.AN_VDAY_Y4B==='went',J({L:g.L,cgs:H.cgs})); delete global.CG_REGISTRY;
    setup('2029-02-14',9,{lv:{[AN]:'dt'},flags:{AN_VDAY_CG:true}}); rules(); H.opts=[]; H.picks=[0]; await EVENTS.run(ev('ev_an_vday_y4'));
    check('11. 拿過 CG 的沒有這個選項',J(H.opts[0])===J(['「十八號回來？」','「外婆家好玩嗎？」']),J(H.opts)); }
  });

  /* ======================= 12 校外約會約在她的節日 ======================= */
  await sec('12',async()=>{ const x=X();
  { setup('2026-03-14',10,{lv:{[ZQ]:6}}); H.G.trips=[{trip:'T9001',who:ZQ,locs:['D13'],day:H.G.day,depart:13,back:19,kind:'half',status:'going',spots:[]}]; H.said=[]; const r=await x.dateBefore(GM,{id:'date_T9001',dateTrip:'T9001'});
    check('12. 校外約會（date3d.js）約在 3/14：到了先演節日那一段（OUT.BEFORE）、記一場',r===true&&said()[0]==='白色情人節要回禮。我回你一首歌。……很短。'&&x.rec(H.G).bk.some(b=>b.who===ZQ&&b.ref==='T9001'),J(said())); }
  });

  /* ======================= 13 invites3d.js 接上的三處（實際的檔案：INV.flow 的「約她過節」選項、INV.meet 的 FEST.meet）======================= */
  await sec('13',async()=>{
  const src=fs.readFileSync(path.join(H.ROOT,'src/invites3d.js'),'utf8');
  /* INVITE-MENU-1030：清單分層以後，「約她過節」放在「特別的」那一類（只有一個就直接列）；灰掉的說原因留在同一層（S.STAY_MENU）、選了走 FEST.ask */
  const hooks=[["if(fsO) sp.push(Object.assign({},fsO,{go:'fest'}));","nodes.push({t:'特別的',items:sp});"],
    ["if(x.go==='fest'&&x.dim){ await GM.say(null,x.hint+'。'); return S.STAY_MENU; }","if(x.go==='fest') return FEST.ask(GM,id,n);"],
    ["if(iv.fest&&typeof FEST!=='undefined'&&FEST.meet) await FEST.meet(GM,iv,who);",null]];
  const hk=hooks.map(([h,before])=>{ const i=src.indexOf(h); return i>=0&&src.indexOf(h,i+1)<0&&(!before||src.indexOf(before,i)>i); });
  const iAsk=src.indexOf('if(iv.ask) await S.walkAsk(GM,iv,who);'), iFm=src.indexOf(hooks[2][0]), iUp=src.indexOf('if(SO.playUp) await SO.playUp(');
  check('13. invites3d.js 接上三處：選項迴圈「算了」前面加 FEST.flowOpt、選了走 FEST.ask（灰掉的說原因再選一次）、S.meet 在 walkAsk 後、playUp 前 FEST.meet',hk.every(Boolean)&&iAsk>=0&&iAsk<iFm&&iFm<iUp,J(hk));
  const INVH=typeof INV!=='undefined'?INV:null; if(!INVH) return;
  setup('2026-03-13',10,{lv:{[ZQ]:6}}); H.said=[]; H.opts=[]; H.picks=['約她過節',0,0]; const iv=await INVH.flow(GM,ZQ,null,false); const O=H.opts.slice();
  check('13. 手機約子晴：清單最後多「約她過節：白色情人節」→ 中午場 → 兩點半 Café；排進邀約（iv.fest）',!!iv&&!!iv.fest&&iv.place==='cafe'&&O[0].includes('約她過節：白色情人節'),J({O,iv}));
  H.said=[]; H.opts=[]; H.picks=['約她過節','算了']; const iv2=await INVH.flow(GM,ZQ,null,false); const L2=said(), O2=H.opts.slice();
  check('13. 約好以後再約一次：那一項灰掉（「已經約好了」），選了說「已經約好了。」、回到清單再選（選「算了」結束，沒有多一筆邀約）',iv2==null&&L2.includes('已經約好了。')&&O2.length===2&&O2[0].some(o=>/約她過節/.test(o))&&(H.G.invites||[]).filter(q=>q.fest).length===1,J({L2,O2}));
  at('2026-03-14',12); H.said=[]; await INVH.meet(GM,iv,null); const L=said();
  check('13. 見面：先演節日那一段（「白色情人節要回禮。我回你一首歌。……很短。」），再照 Café 原本的內容；記一起過了',L[0]==='白色情人節要回禮。我回你一首歌。……很短。'&&L.length>1&&X().rec(H.G).done['heroine_04:white:2026']==='meet'&&iv.state==='done',J(L));
  setup('2026-03-13',10,{lv:{[ZQ]:6}}); H.said=[]; H.opts=[]; H.picks=['約她過節',0,0]; const ivF=await INVH.flow(GM,ZQ,{obj:null},true); const OF=H.opts.slice();
  check('13. 當面約子晴（story3d.js offerInvite 的 INV.flow(…,true)）：清單也有「約她過節：白色情人節」→ 中午場 → Café；排進邀約（iv.fest）',!!ivF&&!!ivF.fest&&ivF.place==='cafe'&&OF[0].includes('約她過節：白色情人節'),J({OF,ivF}));
  H.said=[]; H.opts=[]; H.picks=['約她過節','算了']; const ivF2=await INVH.flow(GM,ZQ,{obj:null},true); const LF2=said(), OF2=H.opts.slice();
  check('13. 當面再約一次：一樣灰掉、說「已經約好了。」、回到清單',ivF2==null&&LF2.includes('已經約好了。')&&OF2.length===2&&(H.G.invites||[]).filter(q=>q.fest).length===1,J({LF2,OF2}));
  });

  /* AA_445 1-2（企劃線 fd200c2c6）：芷若、語彤、子晴、學姊、可昕的節日邀約照節日換整組，逐字對稿裡的表 */
  { const d445=git('fd200c2c6','AA_445_寒暑假讀過一遍_麵店開兩次_五位節日邀約分節日.md'), NM={'芷若':ZR,'語彤':YT,'子晴':ZQ,'學姊':SIS,'可昕':KX}, KS=['vday','white','qixi','bday','xmas'];
    const bad=[]; let n=0; for(const line of d445.split('\n')){ const m=/^\|\s*(芷若|語彤|子晴|學姊|可昕)\s*\|(.+)\|\s*$/.exec(line); if(!m) continue; const cells=m[2].split('|').map(c=>c.trim().split('<br>'));
      KS.forEach((k,i)=>{ n++; const got=X().herLines(NM[m[1]],k,false); if(J(got)!==J(cells[i])) bad.push(m[1]+' '+k+'：'+J(got)+' ≠ '+J(cells[i])); }); }
    check('AA_445 1-2. 五位 × 五個節日的邀約和稿一字不差（25 組）',n===25&&!bad.length,bad.slice(0,3).join('；')||n);
    check('AA_445 1-2. 以安、沛珊照舊（第一句換節日名）',X().herLines(AN,'xmas',false)[0]==='明天是聖誕節。'&&X().herLines(PS,'vday',false)[0]==='明天是情人節！！'); }

  H.done();
})();

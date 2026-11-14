// AA_414（企劃線 b1fc4bf30；AA-B 2026-10-23）：以安、語彤交往中的節日・第一批——四年情人節（八場）、語彤的中秋（三年）、2027-02-14 桌遊團群組。不需要瀏覽器。
// 台詞一字照稿（D109）。做法照學姊的 S.HOL（src/sis_b4_3d.js）：前一天 21:00 她私訊約 → 回覆 → 出遊（OUT）→ 那一場 → 答應了沒到＝她再傳。
// 檢查：0 讀稿（每一句台詞、選項、地點字幕、私訊都在稿裡）、index.html 接線、人物頁記憶 10 個、noodle_table_window 背景
//   1 以安 1-1 2026 開車去台中（寒假從家出發不用取車、學期中從宿舍要先回家取車（DATE-C7）、油錢有扣；背景 car_morning → tc_park → car_night；回「在臺北。」20:00 照片；答應了沒到 15:00、17:00；沒回）
//   2 以安 1-2 2027 大安森林公園（第二個回覆有沒有 2026 兩版）　3 以安 1-3 2028 總圖門口（AN_VDAY_GIFT → 3/14 ev_an_white_day「一個月前你送的」那一版）
//   4 以安 1-4 2029 21:00 電話（沒有前一天的私訊；先不接＝21:30、21:31 兩則）
//   5 語彤 2-1 2026 店休（幫忙的 16:00 版）　6 語彤 2-2 2027 麵店的紅紙＋第 3 節群組　7 語彤 2-3 2028 寶藏巖　8 語彤 2-4 2029 年糕（有沒有 2026 兩版）
//   9 中秋 2026～2028（第一次去的那一年有 CG；2027 以安生日那一句、2027 是第一次的也有 CG；2028 阿姨那兩句；2028 美國路線不演）
//   10 沒交往、在國外、沒有聯絡方式：一場都不演；關係＝情人節 +3／+6／+5（裂縫 -1）、電話 +2／+3／+3、中秋 +4／+4／+4
// 修改前（開發分支 888f3e17）：沒有 src/an_yt_hol3d.js、src/data/an_yt_hol_events.js——全部 FAIL。用法：node tests/aa414_hol_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let okNC=false, okWD=false; try{ okNC=load('src/noodle_closed3d.js'); }catch(e){ console.log('（載入 noodle_closed3d.js 失敗：'+e.message+'）'); }
try{ okWD=load('src/data/r2y3b_events.js'); }catch(e){ console.log('（載入 r2y3b_events.js 失敗：'+e.message+'）'); }   /* 3/14 ev_an_white_day */
let ok1=false, ok2=false, err=''; try{ ok1=load('src/data/an_yt_hol_events.js'); ok2=load('src/an_yt_hol3d.js'); }catch(e){ err=String(e); }
const X=()=>typeof ANYTHOL!=='undefined'?ANYTHOL:null;
let doc=''; try{ doc=cp.execSync('git show 5c139cc49:"docs/story_planning/AA_414_以安語彤_交往中的節日_第一批_情人節與中秋.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
let doc416=''; try{ doc416=cp.execSync('git show ed80edb71:"docs/story_planning/AA_416_節日總規格_三個情人節生日聖誕_七位.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc416=''; }   /* AA_416 第 3 節：第 6 階的換字、2029 的 CG 補救 */
const ANREV=require('./an_rev_doc.js');   /* 以安改稿（AA_587 第 23、38 列、AA_589 第 48～53 列）改過的句子：在改成欄也算（逐列核對在 tests/aa587_b3_unit.js、aa589_an_b4_unit.js）*/
const inDoc=t=>doc.indexOf(t)>=0||doc416.indexOf(t)>=0||ANREV.has(t);
const J=JSON.stringify, AN='heroine_01', YT='heroine_03';
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const VDAY=J({fam:3,comf:6,npcRom:5}), CALL=J({fam:2,comf:3,npcRom:3}), MOON=J({fam:4,comf:4,npcRom:4});
const setup=(key,h,id,flags,o)=>{ const G=H.fresh(key,h,(o&&o.zone)||'dorm',flags||{}); H.FRIEND(AN); H.FRIEND(YT);
  if(id&&!(o&&o.notDating)){ G.flags['dating_'+id]=true; ROM.get(G,id).status='dating'; }
  G.contacts=G.contacts||{}; if(id&&!(o&&o.noContact)) G.contacts[id]=G.day-30; G.outings=[]; if(STORY._bindGM) STORY._bindGM(GM); return G; };
const rules=()=>{ const x=X(); if(x) x.phone(H.G); PHONE.tick(H.G); };
const at=(key,h)=>{ const G=H.G; G.day=H.D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
const dms=id=>H.msgs('p:'+id);
const optsOf=tag=>{ const m=PHONE.byAsk(H.G,tag); return m?m.ask.opts.map(o=>o.t):null; };
const relOf=id=>Object.assign({},SOCIAL.rel(id));
const dRel=(id,a)=>{ const b=relOf(id), o={}; for(const k of ['fam','trust','comf','npcRom','rom']) if((b[k]|0)!==(a[k]|0)) o[k]=(b[k]|0)-(a[k]|0); return J(o); };
const said=()=>H.said.map(s=>s.t);
const play=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return said(); };
const goOut=async(qid,picks)=>{ const q=OUT.get(H.G,qid); H.said=[]; H.opts=[]; H.bgs=[]; H.cards=[]; H.picks=(picks||[]).slice(); await OUT.go(GM,q); return {q,L:said()}; };
const expire=()=>{ for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); };
const img=b=>b&&b.image?b.image.replace('assets/bg/','').replace('.webp',''):b;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
let money=[]; GM.money=(n,why)=>{ money.push([n,why]); H.G.money+=n; };

(async()=>{
  /* ======================= 0 讀稿、接線 ======================= */
  check('0. 讀稿（企劃線 b1fc4bf30 AA_414：2026 開車去台中、白色情人節照舊）',doc.length>5000&&inDoc('照 `date3d.js` 開車去台中的算法')&&inDoc('2028-03-14 以安那一場（`ev_an_white_day`）照舊'));
  const IDS=['ev_an_vday_y1','ev_an_vday_y2','ev_an_vday_y3','ev_an_vday_y4','ev_yt_vday_y1','ev_yt_vday_y2','ev_yt_vday_y3','ev_yt_vday_y4','ev_yt_moon','ev_an_vday_tc'];
  check('0. 新檔載得到：ANYTHOL、ANYTHOL_LINES、ANYTHOL_EVENTS（十個事件：以安四場＋AA_416 的 CG 補救、語彤四場、中秋一個事件演三年）',ok1&&ok2&&!!X()&&Array.isArray(ANYTHOL_EVENTS)&&ANYTHOL_EVENTS.length===10&&IDS.every(id=>!!ev(id)&&ev(id).trigger==='outing'),err||J({ok1,ok2}));
  if(!X()){ H.done(); return; }
  await sec('0',async()=>{
  { const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
    check('0. index.html：an_yt_hol_events.js、an_yt_hol3d.js 接在 sis_b4_3d.js 後面（?v= 照舊）',/src\/sis_b4_3d\.js\?v=([^"]+)"><\/script>\n<script src="src\/data\/an_yt_hol_events\.js\?v=\1"><\/script>\n<script src="src\/an_yt_hol3d\.js\?v=\1"><\/script>/.test(html)); }
  check('0. STORY.PHONE_RULES 有接；noodle_closed3d.js、r2y3b_events.js 載得到（店休、3/14）',STORY.PHONE_RULES.length>0&&okNC&&okWD&&!!ev('ev_an_white_day'));
  { const ML=SOCIAL.MEMORY_LABEL||{}, W={AN_VDAY_TC:'情人節去台中找她',AN_VDAY_OMAMORI:'她從東京帶回來一個學業御守',AN_VDAY_PEN:'送她一支鋼筆',AN_VDAY_CHOCO:'送她一盒巧克力',AN_VDAY_CALL:'初二那天，她躲到陽台打給你',
      YT_VDAY_RIVER:'情人節她下班，蘇姨叫你們去別的地方',YT_VDAY_SHOP:'情人節，她五點下班以後',YT_VDAY_FIELD:'她帶你去看她做田野的地方',YT_VDAY_NIANGAO:'她把媽媽買的年糕多拿一袋給你',YT_MOON:'中秋烤肉前，在河濱剝柚子'};
    const NEW630=['YT_VDAY_RIVER','YT_VDAY_SHOP','YT_VDAY_NIANGAO'];   /* AA_630 H-025～H-027：面板名稱照新稿 */ const bad=Object.keys(W).filter(k=>ML[k]!==W[k]||(!NEW630.includes(k)&&!inDoc('`'+k+'`「'+W[k]+'」')));
    check('0. 人物頁記憶 10 個（稿裡「`代號`「名稱」」，social3d.js MEMORY_LABEL）',!bad.length,J(bad)); }
  { const bad=[]; const T=t=>{ if(typeof t==='string'&&!inDoc(t)) bad.push(t); };
    for(const k in ANYTHOL_LINES){ const v=ANYTHOL_LINES[k]; if(k==='grp') v.forEach(x=>T(x[1])); else if(Array.isArray(v)) v.forEach(T); else T(v); }
    for(const e of ANYTHOL_EVENTS) for(const l of e.dialogue){ if(l.text!==undefined) T(l.text); if(l.scene!==undefined) T(l.scene); if(l.name!==undefined) T(l.name); for(const c of (l.choice||[])) T(c.text); }
    for(const a of X().HOL) T(a.out.title);
    { const A524=new Set(['（指了一下對岸）去年想帶你去的地方，在那邊。','山坡上那一排房子。','……今年從這裡看就好。']); for(let i=bad.length-1;i>=0;i--) if(A524.has(bad[i])) bad.splice(i,1); }   /* 2026-10-30 AA_524 Y4（企劃線 8fd10848d）在 2029 河濱加的三句：tests/aa524_promises_unit.js 對 AA_524 的稿 */
    { const A630=(()=>{ try{ return require('child_process').execFileSync('git',['-C',H.ROOT,'show','bb4401fd3:docs/story_planning/AA_630_語彤台詞改寫.md'],{encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } })();   /* 短的選項（tests/alison.js 的語料只收 4 字以上）：直接對 AA_630 H-017「選項：「謝謝。」」、H-018「「同事？」→ b」*/
      const SHORT=[['「謝謝。」','選項：「謝謝。」→'],['「同事？」','／「同事？」→ b']], AA1103=new Set(['嗯。四點半，河濱見。']);   /* moonYes：AA 2026-11-03 回 LAWWW（中秋 16:30 河濱；還沒有企劃線的 commit）*/
      for(let i=bad.length-1;i>=0;i--){ const sh=SHORT.find(x=>x[0]===bad[i]); if((sh&&A630.includes(sh[1]))||AA1103.has(bad[i])) bad.splice(i,1); } }
    check('0. 每一句台詞、選項、地點字幕、私訊、群組、出遊標題都在稿裡（一字不差）',!bad.length,J(bad)); }
  { const bad=[]; for(const e of ANYTHOL_EVENTS){ const Ls=new Set(e.dialogue.filter(l=>l.label).map(l=>l.label)); for(const l of e.dialogue){ if(l.goto&&!Ls.has(l.goto)) bad.push(e.id+':'+l.goto); for(const c of (l.choice||[])) if(c.goto&&!Ls.has(c.goto)) bad.push(e.id+':'+c.goto); } }
    check('0. 每一個 goto 都有 label',!bad.length,J(bad)); }
  { const src=fs.readFileSync(path.join(H.ROOT,'src/an_yt_hol3d.js'),'utf8')+fs.readFileSync(path.join(H.ROOT,'src/data/an_yt_hol_events.js'),'utf8');
    check('0. 新檔沒有舊名字（Alison 改名，alison_unit）',src.indexOf('小語')<0); }
  { const B=OUT.BG.noodle_table_window; check('0. 2-2 的背景 noodle_table_window 登記了、圖在 repo 裡（其他背景 car_morning、tc_park、car_night、daan_park、ntu_avenue、noodle_table、riverside 都有圖）',!!B&&fs.existsSync(path.join(H.ROOT,B.image))&&['car_morning','tc_park','car_night','daan_park','ntu_avenue','noodle_table','riverside'].every(k=>OUT.bg(k)&&OUT.bg(k).image)); }
  { const bad=X().HOL.filter(a=>a.shop&&NOODLE_CLOSED.closed({stage:'law'},H.D(a.out.day))!==(a.shop==='closed')).map(a=>a.k);
    check('0. 語彤的店休照 noodle_closed3d.js：2026、2029 的 2/14 店休，2027、2028 照常',!bad.length&&NOODLE_CLOSED.closed({stage:'law'},H.D('2026-02-14'))&&NOODLE_CLOSED.closed({stage:'law'},H.D('2029-02-14'))&&!NOODLE_CLOSED.closed({stage:'law'},H.D('2027-02-14'))&&!NOODLE_CLOSED.closed({stage:'law'},H.D('2028-02-14')),J(bad)); }
  });

  /* ======================= 1 以安 1-1 2026-02-14 開車去台中 ======================= */
  await sec('1',async()=>{
  { setup('2026-02-12',20,AN,{AN_CRACK:2}); rules(); const before=dms(AN).length; at('2026-02-12',21.05); rules();
    check('1-1. 2/12（四）21:00 以安私訊「十四號那天，你在臺北嗎？」（20:00 還沒到）；回覆「我去台中找妳。」「在臺北。」',before===0&&J(dms(AN))===J(['十四號那天，你在臺北嗎？'])&&J(optsOf('anyt_an_y1_ask'))===J(['我去台中找妳。','在臺北。']),J(dms(AN)));
    PHONE.answer(H.G,'anyt_an_y1_ask',0); rules(); const q=OUT.get(H.G,'anyt_an_vday_y1');
    check('1-1. 「我去台中找妳。」→「……好。」「十四號下午兩點。我把我家附近那個公園的地址傳給你。」「上午我陪我媽去市場，不要太早到。」、AN_VDAY_Y1_GO',J(dms(AN).slice(-4))===J(['我去台中找妳。','……好。','十四號下午兩點。我把我家附近那個公園的地址傳給你。','上午我陪我媽去市場，不要太早到。'])&&H.G.flags.AN_VDAY_Y1_GO===true,J(dms(AN)));
    check('1-1. 出遊：2/14 14:00、late 0.5、標題「情人節（開車去台中找以安）」；開車照 date3d.js（D26 單程 150 分；2/14 在寒假、從家出發，不加回家取車的 30 分＝2.5 小時，DATE-C7；來回 900 元）',!!q&&q.day===H.D('2026-02-14')&&q.h===14&&q.late===0.5&&q.title==='情人節（開車去台中找以安）'&&q.travelH===DATE.travel('D26','car').minutes/60&&q.travelH===2.5&&q.fare===900&&q.travel==='開車到台中約 2 小時 30 分鐘',J(q));
    { const dorm=ANYTHOL.drive(H.G,H.D('2026-03-14')), home=ANYTHOL.drive(H.G,H.D('2026-02-14'));
      check('1-1. 開車的算法（DATE-C7）：學期中從宿舍出發＝直接開（AA_599 更正：不加取車 30 分，2.5 小時、字「開車到台中約 2 小時 30 分鐘」）；寒暑假從家裡＝2.5 小時、沒有取車那一句',dorm.travelH===2.5&&dorm.travel==='開車到台中約 2 小時 30 分鐘'&&home.travelH===2.5&&home.travel==='開車到台中約 2 小時 30 分鐘'&&dorm.fare===900,J({dorm,home})); }
    at('2026-02-14',11.3); const due=OUT.due(H.G); const a=relOf(AN), m0=H.G.money; money=[];
    const {L}=await goOut('anyt_an_vday_y1',[0]);
    check('1-1. 11:15 就問出發（14:00 減 2.5 小時再早 15 分；寒假從家出發不用取車，DATE-C7）',!!due&&due.id==='anyt_an_vday_y1');
    check('1-1. 油錢有扣（出發的時候 -900 交通）',m0-H.G.money===900&&J(money)===J([[-900,'交通']]),J(money));
    check('1-1. 背景：car_morning → tc_park（公園門口、公園）→ car_night（國道・休息站）',J(H.bgs.map(img).filter((b,i,A)=>typeof b==='string'&&b!=='dark'&&A.indexOf(b)===i))===J(['car_morning','tc_park','car_night']),J(H.bgs.map(img)));
    check('1-1. 那一場照稿（「我想來。」）',J(L)===J(['（她站在公園門口，圍巾圍到下巴。看到你下車，先看了一下手錶。）','你出門的時候傳了訊息。我算你兩點到。','開了兩個多小時，就為了這個？你可以不用來的。','……嗯。','（她把圍巾拉下來一點。）',
      '（公園裡只有幾個遛狗的人。你們走了兩圈。她一直在講寒假讀的公司法，講到一半停下來。）','我在講公司法。今天是情人節。','……你不要笑。','（傍晚，她送你到車子旁邊。你要上車的時候，她把一個紙袋塞給你。）','回去再打開。開車不要看手機。','（休息站，你打開紙袋。是一盒太陽餅，盒子上貼著一張便利貼，寫著你的名字。）']),J(L));
    check('1-1. AN_VDAY_Y1 went、記憶 AN_VDAY_TC、熟悉 +3、自在 +6、她的戀愛 +5、裂縫 -1（2→1）、回到臺北 20:00',H.G.flags.AN_VDAY_Y1==='went'&&SOCIAL.has(AN,'AN_VDAY_TC')&&dRel(AN,a)===VDAY&&H.G.flags.AN_CRACK===1&&H.G.hour===20&&H.G.day===H.D('2026-02-14'),dRel(AN,a)+' crack '+H.G.flags.AN_CRACK+' h '+H.G.hour);
    at('2026-02-14',20.5); rules(); check('1-1. 有來的：沒有 15:00／17:00／20:00 那幾則',!dms(AN).some(t=>/公園門口。兩點|夜市的烤玉米攤/.test(t))); }
  { setup('2026-02-12',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y1_ask',0); rules(); const L=await play('ev_an_vday_y1',[1]);
    check('1-1. 「路上不塞。」→「不是塞不塞的問題。」旁白「（她看了你一下，沒有再說。）」',L[3]==='不是塞不塞的問題。'&&L[4]==='（她看了你一下，沒有再說。）'&&!L.includes('……嗯。'),J(L)); }
  { setup('2026-02-12',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y1_ask',1); rules(); const r=dms(AN).slice(-2); at('2026-02-14',19.9); rules(); const n19=dms(AN).length; at('2026-02-14',20.05); rules();
    check('1-1. 「在臺北。」→「好。我只是問問。」、AN_VDAY_Y1 no、沒有出遊；2/14 20:00「（照片：夜市的烤玉米攤）」「我媽說這一攤開了三十年。」',J(r)===J(['在臺北。','好。我只是問問。'])&&H.G.flags.AN_VDAY_Y1==='no'&&!OUT.get(H.G,'anyt_an_vday_y1')&&J(dms(AN).slice(n19))===J(['（照片：夜市的烤玉米攤）','我媽說這一攤開了三十年。'])&&!dms(AN).some(t=>/公園門口/.test(t)),J(dms(AN))); }
  { setup('2026-02-12',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y1_ask',0); rules(); const a=relOf(AN); at('2026-02-14',14.55); expire(); const f=H.G.flags.AN_VDAY_Y1; rules(); const n=dms(AN).length;
    at('2026-02-14',15.05); rules(); const m1=dms(AN).slice(n); at('2026-02-14',17.05); rules(); const m2=dms(AN).slice(n);
    check('1-1. 答應了沒到（過了 14:30）：記 missed、15:00「我在公園門口。兩點到現在。」、17:00「我回家了。你沒事就好。」；不扣關係；沒有 20:00 的照片',f==='missed'&&J(m1)===J(['我在公園門口。兩點到現在。'])&&J(m2)===J(['我在公園門口。兩點到現在。','我回家了。你沒事就好。'])&&dRel(AN,a)==='{}'&&(at('2026-02-14',20.5),rules(),!dms(AN).some(t=>/烤玉米/.test(t))),J({f,m1,m2})); }
  { setup('2026-02-12',21.05,AN); rules(); at('2026-02-14',14.1); rules(); at('2026-02-14',20.5); rules();
    check('1-1. 沒回：記 noreply、沒有出遊、沒有後續的私訊',H.G.flags.AN_VDAY_Y1==='noreply'&&!OUT.get(H.G,'anyt_an_vday_y1')&&J(dms(AN))===J(['十四號那天，你在臺北嗎？']),J({f:H.G.flags.AN_VDAY_Y1,d:dms(AN)})); }
  { setup('2026-02-12',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y1_ask',0); rules(); at('2026-02-14',14.1);
    check('1-1. 那一天在台中（STORY.presence home 台中）：S.herOk 有 where 才算',X().herOk(H.G,AN,H.G.day,['台中'])&&!X().herOk(H.G,AN,H.G.day,null)); }
  });

  /* ======================= 2 以安 1-2 2027-02-14 大安森林公園 ======================= */
  await sec('2',async()=>{
  { setup('2027-02-12',21.05,AN,{AN_VDAY_Y1:'went',AN_CRACK:1}); rules();
    check('1-2. 2/12（五）21:00「十四號我上去臺北一天。」「下午兩點，大安森林公園的捷運站出口。我坐五點的高鐵回台中。」；回覆三個',J(dms(AN))===J(['十四號我上去臺北一天。','下午兩點，大安森林公園的捷運站出口。我坐五點的高鐵回台中。'])&&J(optsOf('anyt_an_y2_ask'))===J(['好。','妳特地上來？','那天我不行。']),J(dms(AN)));
    PHONE.answer(H.G,'anyt_an_y2_ask',1); rules(); const r=dms(AN).slice(-3), q=OUT.get(H.G,'anyt_an_vday_y2');
    check('1-2. 去年去過台中：「妳特地上來？」→「嗯。去年你來了。」「今年換我。」、AN_VDAY_Y2_GO',J(r)===J(['妳特地上來？','嗯。去年你來了。','今年換我。'])&&H.G.flags.AN_VDAY_Y2_GO===true,J(r));
    check('1-2. 出遊：2/14 14:00、捷運約 15 分鐘（0.25）、late 0.25、標題「情人節（大安森林公園）」',!!q&&q.day===H.D('2027-02-14')&&q.h===14&&q.travel==='捷運約 15 分鐘'&&q.travelH===0.25&&q.late===0.25&&q.title==='情人節（大安森林公園）',J(q));
    at('2027-02-14',13.6); const a=relOf(AN); const {L}=await goOut('anyt_an_vday_y2',[1]);
    check('1-2. 背景 daan_park；「巧克力。」→「巧克力太簡單了。」旁白「（她從紙袋裡拿出一個學業御守。）」；照稿',img(H.bgs[0])==='daan_park'&&J(L)===J(['（她從東京回來兩個禮拜了。手上提著一個紙袋，上面都是日文。）','東京買的。你猜。','巧克力太簡單了。','（她從紙袋裡拿出一個學業御守。）','你今年要考很多試。','（你們在公園裡走了兩個多小時。她看了兩次手錶，第三次沒有看。）','四點半了。我要去搭車。','下次換你來。']),J({bg:img(H.bgs[0]),L}));
    check('1-2. AN_VDAY_Y2 went、記憶 AN_VDAY_OMAMORI、+3／+6／+5、裂縫 1→0、16:30 結束',H.G.flags.AN_VDAY_Y2==='went'&&SOCIAL.has(AN,'AN_VDAY_OMAMORI')&&dRel(AN,a)===VDAY&&H.G.flags.AN_CRACK===0&&H.G.hour===16.5,dRel(AN,a)+' h '+H.G.hour); }
  { setup('2027-02-12',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y2_ask',1); const r=dms(AN).slice(-2); const L=await play('ev_an_vday_y2',[0]);
    check('1-2. 2026 沒去台中：「妳特地上來？」→「……嗯。我想上來。」；「御守。」→「……你怎麼知道。」',J(r)===J(['妳特地上來？','……嗯。我想上來。'])&&L[2]==='……你怎麼知道。'&&L[3]==='你今年要考很多試。',J({r,L})); }
  { setup('2027-02-12',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y2_ask',0); const r=dms(AN).slice(-1)[0]; rules(); at('2027-02-14',14.3); expire(); rules(); const n=dms(AN).length; at('2027-02-14',14.7); rules(); at('2027-02-14',16.55); rules();
    check('1-2. 「好。」→「我五點要走。……所以不要遲到。」；答應了沒到：14:40「我在出口。」、16:30「我去搭車了。」',r==='我五點要走。……所以不要遲到。'&&H.G.flags.AN_VDAY_Y2==='missed'&&J(dms(AN).slice(n))===J(['我在出口。','我去搭車了。']),J(dms(AN))); }
  { setup('2027-02-12',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y2_ask',2); rules(); const r=dms(AN).slice(-1)[0]; at('2027-02-14',16.6); rules();
    check('1-2. 「那天我不行。」→「好。那開學見。」、AN_VDAY_Y2 no、沒有出遊、沒有「我在出口。」',r==='好。那開學見。'&&H.G.flags.AN_VDAY_Y2==='no'&&!OUT.get(H.G,'anyt_an_vday_y2')&&!dms(AN).includes('我在出口。'),J(dms(AN))); }
  });

  /* ======================= 3 以安 1-3 2028-02-14 總圖門口；AN_VDAY_GIFT → 3/14 ======================= */
  await sec('3',async()=>{
  { setup('2028-02-13',21.05,AN); rules();
    check('1-3. 2/13（日）21:00「明天下午兩點，總圖門口。」「寒假人少。我們走走就好。」；回覆「好。」「明天我不行。」',J(dms(AN))===J(['明天下午兩點，總圖門口。','寒假人少。我們走走就好。'])&&J(optsOf('anyt_an_y3_ask'))===J(['好。','明天我不行。']),J(dms(AN)));
    PHONE.answer(H.G,'anyt_an_y3_ask',0); rules(); const r=dms(AN).slice(-1)[0], q=OUT.get(H.G,'anyt_an_vday_y3');
    check('1-3. 「好。」→「嗯。不要遲到。」；出遊 2/14 14:00 走路、late 0.25、標題「情人節（總圖門口）」',r==='嗯。不要遲到。'&&!!q&&q.h===14&&q.travel==='走路'&&q.late===0.25&&q.title==='情人節（總圖門口）'&&q.day===H.D('2028-02-14'),J(q));
    at('2028-02-14',13.7); const a=relOf(AN); const {L}=await goOut('anyt_an_vday_y3',[0]);
    check('1-3. 背景 ntu_avenue；「（給她一支鋼筆）」→「……你知道我的筆快沒水了。」「去日本帶這支。」；最後「三月十四號那天，你不要排別的。」',img(H.bgs[0])==='ntu_avenue'&&J(L)===J(['（寒假的椰影大道，腳踏車比平常少一半。）','再一個多月就去日本了。','行李我列好了。衣服帶太少，書帶太多。','……你知道我的筆快沒水了。','去日本帶這支。','三月十四號那天，你不要排別的。'])&&J(H.opts[0])===J(['（給她一支鋼筆）','（給她一盒巧克力）']),J(L));
    check('1-3. AN_VDAY_GIFT pen、AN_VDAY_Y3 went、記憶 AN_VDAY_PEN、+3／+6／+5',H.G.flags.AN_VDAY_GIFT==='pen'&&H.G.flags.AN_VDAY_Y3==='went'&&SOCIAL.has(AN,'AN_VDAY_PEN')&&!SOCIAL.has(AN,'AN_VDAY_CHOCO')&&dRel(AN,a)===VDAY,dRel(AN,a));
    at('2028-03-14',18); const W=await play('ev_an_white_day',[0]);
    check('1-3. 接 3/14：ev_an_white_day 演「（她拿出一個小紙袋）一個月前你送的。這是回禮。」那一版（不改 r2y3b_events.js）',W.includes('（她拿出一個小紙袋）一個月前你送的。這是回禮。')&&!W.includes('二月十四號那天，我在讀書。你也沒說什麼。'),J(W)); }
  { setup('2028-02-13',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y3_ask',0); const L=await play('ev_an_vday_y3',[1]);
    check('1-3. 「（給她一盒巧克力）」→「……好。」旁白「（她當場拆開，吃了一顆。）」「我以為我會留到日本再吃。」、AN_VDAY_GIFT choco、記憶 AN_VDAY_CHOCO',J(L.slice(3,6))===J(['……好。','（她當場拆開，吃了一顆。）','我以為我會留到日本再吃。'])&&H.G.flags.AN_VDAY_GIFT==='choco'&&SOCIAL.has(AN,'AN_VDAY_CHOCO'),J(L));
    at('2028-03-14',18); const W=await play('ev_an_white_day',[0]); check('1-3. 巧克力也算送過（AN_VDAY_GIFT 有值）：3/14 是回禮那一版',W.includes('（她拿出一個小紙袋）一個月前你送的。這是回禮。'),J(W)); }
  { setup('2028-02-13',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y3_ask',1); rules(); const r=dms(AN).slice(-1)[0]; at('2028-03-14',18); const W=await play('ev_an_white_day',[0]);
    check('1-3. 「明天我不行。」→「好。那三月再說。」、AN_VDAY_Y3 no、沒有 AN_VDAY_GIFT＝3/14 沒送過那一版，而且是「你有事」那一句（AA_508 0-2 第 8 點：她約過、你拒絕）＋「回禮要先收到才算。」',r==='好。那三月再說。'&&H.G.flags.AN_VDAY_Y3==='no'&&H.G.flags.AN_VDAY_GIFT==null&&W.includes('二月十四號那天，你有事。我在讀書。')&&!W.includes('二月十四號那天，我在讀書。你也沒說什麼。')&&W.includes('（她拿出一個小紙袋）回禮要先收到才算。這個是我自己想送的。'),J({r,W})); }
  { setup('2028-02-13',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y3_ask',0); rules(); at('2028-02-14',13.6); H.picks=[2]; await OUT.prompt(GM,OUT.get(H.G,'anyt_an_vday_y3')); rules(); const n=dms(AN).length; at('2028-02-14',15.05); rules(); at('2028-02-14',17.05); rules();
    check('1-3. 「不去了」：記 missed、15:00「我在總圖門口。」、17:00「我先回去了。行李還沒收。」',H.G.flags.AN_VDAY_Y3==='missed'&&J(dms(AN).slice(n))===J(['我在總圖門口。','我先回去了。行李還沒收。']),J(dms(AN))); }
  });

  /* ======================= 4 以安 1-4 2029-02-14 21:00 電話 ======================= */
  await sec('4',async()=>{
  { setup('2029-02-13',20,AN); rules(); at('2029-02-13',21.5); rules(); const pre=dms(AN).length; at('2029-02-14',9); rules(); const q=OUT.get(H.G,'anyt_an_vday_y4');
    check('1-4. 沒有前一天的私訊；2/14（三，初二）21:00 她打來（那一天一開始就排好；電話、接起來／先不接、late 0.25）',pre===0&&!!q&&q.day===H.D('2029-02-14')&&q.h===21&&q.call===true&&q.verb==='接起來'&&q.no==='先不接'&&q.place==='電話'&&q.late===0.25,J(q));
    at('2029-02-14',20.95); const a=relOf(AN); const {L}=await goOut('anyt_an_vday_y4',[0]);
    check('1-4. 電話（{scene:\'電話\'}）照稿；「十八號回來？」→「十八號。高鐵三點到臺北。」「我只是跟你說一聲。」',J(L)===J(['（電話。那頭很吵，有人在喊「碰」。）','今天初二。我在外婆家。','十幾個人在客廳打牌。我躲到陽台。','……今天是情人節。我記得。','十八號。高鐵三點到臺北。','我只是跟你說一聲。','（那頭有人叫她的名字。）','我要進去了。晚安。'])&&ev('ev_an_vday_y4').dialogue[0].scene==='電話',J(L));
    check('1-4. AN_VDAY_Y4 called、記憶 AN_VDAY_CALL、熟悉 +2、自在 +3、她的戀愛 +3',H.G.flags.AN_VDAY_Y4==='called'&&SOCIAL.has(AN,'AN_VDAY_CALL')&&dRel(AN,a)===CALL,dRel(AN,a));
    at('2029-02-14',21.6); rules(); check('1-4. 接了：沒有 21:30 那兩則',!dms(AN).includes('打給你，沒接。')); }
  { setup('2029-02-14',9,AN); rules(); const L=await play('ev_an_vday_y4',[1]);
    check('1-4. 「外婆家好玩嗎？」→「表妹問我有沒有男朋友。我說有。」「她問了二十分鐘。」',J(L.slice(4,6))===J(['表妹問我有沒有男朋友。我說有。','她問了二十分鐘。']),J(L)); }
  { setup('2029-02-14',9,AN); rules(); at('2029-02-14',20.95); H.picks=[2]; const r=await OUT.prompt(GM,OUT.get(H.G,'anyt_an_vday_y4')); rules(); const n=dms(AN).length; at('2029-02-14',21.51); rules(); const m1=dms(AN).slice(n); at('2029-02-14',21.6); rules();
    check('1-4. 先不接：記 missed、21:30「打給你，沒接。」、21:31「外婆家很吵。明天再說。」',r==='no'&&H.G.flags.AN_VDAY_Y4==='missed'&&J(m1)===J(['打給你，沒接。'])&&J(dms(AN).slice(n))===J(['打給你，沒接。','外婆家很吵。明天再說。']),J({r,d:dms(AN)})); }
  { setup('2029-02-14',9,AN); rules(); at('2029-02-14',21.3); rules(); at('2029-02-14',21.6); rules();
    check('1-4. 21:15 以前沒接（沒按）：一樣記 missed、兩則',H.G.flags.AN_VDAY_Y4==='missed'&&J(dms(AN))===J(['打給你，沒接。','外婆家很吵。明天再說。']),J(dms(AN))); }
  });

  /* ======================= 5～9 語彤（AA_630 第 5 節取代 AA_414 第 2 節，YT-REWRITE-1103；AA 定稿 D109）=======================
     2026 那一年拿掉（第 10 節第 4 點，寒假她在淡水）；2027 她 13～17 有班＝17:30，交往中她家、沒交往茶屋門口；2028 校門口 → 寶藏巖；2029 她家／她家樓下、年糕；中秋改河濱 16:30（AA_623）*/
  await sec('5',async()=>{
  { setup('2026-02-13',21.05,YT,{YT_CRACK:1}); rules();
    check('2-1. AA_630 第 10 節第 4 點：2026-02-14 這一年拿掉——2/13 21:00 不約、沒有出遊；ev_yt_vday_y1 retired',dms(YT).length===0&&!optsOf('anyt_yt_y1_ask')&&!OUT.get(H.G,'anyt_yt_vday_y1')&&ev('ev_yt_vday_y1').retired===true,J(dms(YT))); }
  });
  await sec('6',async()=>{
  { setup('2027-02-13',21.05,YT); rules();
    check('2-2. 交往中：2/13 21:00「明天我五點下班。」「秀琴姨放假。……我煮。你要不要來吃。」；回覆三個',J(dms(YT))===J(['明天我五點下班。','秀琴姨放假。……我煮。你要不要來吃。'])&&J(optsOf('anyt_yt_y2_ask'))===J(['好。','不去別的地方？','明天不行。']),J(dms(YT)));
    PHONE.answer(H.G,'anyt_yt_y2_ask',1); rules(); const r=dms(YT).slice(-1)[0], q=OUT.get(H.G,'anyt_yt_vday_y2');
    check('2-2. 「不去別的地方？」→「家裡就好。今天外面人多，我會累。」；出遊 17:30、late 0.5、她家',r==='家裡就好。今天外面人多，我會累。'&&!!q&&q.h===17.5&&q.late===0.5&&q.place==='新生南路・她家'&&q.title==='情人節（她家）',J(q));   /* 2026-11-11（X324 G 區，AA_802_sis_b4_anyt.json@f2a55c1e7）：an_yt_hol_events.js 句首「……」拿掉、遊戲照新句。舊期望：「……家裡就好。今天外面人多，我會累。」 */
    at('2027-02-14',17.1); const a=relOf(YT); const {L}=await goOut('anyt_yt_vday_y2',[0]);
    check('2-2. 交往中、還沒去過她家：開頭「（新生南路、學校對面的大樓。電梯到七樓。兩房一廳。）」、記 YT_HOME_SEEN；「謝謝。」→「先喝再謝。」；蘇姨問她去哪',L[0]==='（新生南路、學校對面的大樓。電梯到七樓。兩房一廳。）'&&H.G.flags.YT_HOME_SEEN===true&&L.includes('先喝再謝。')&&L.includes('……我說回家煮飯。她笑了很久。'),J(L));
    check('2-2. YT_VDAY_Y2 went、記憶 YT_VDAY_SHOP、+3／+6／+5',H.G.flags.YT_VDAY_Y2==='went'&&SOCIAL.has(YT,'YT_VDAY_SHOP')&&dRel(YT,a)===VDAY,dRel(YT,a)); }
  { setup('2027-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y2_ask',0); rules(); at('2027-02-14',17.9); expire(); rules(); const n=dms(YT).length; at('2027-02-14',18.05); rules();
    check('2-2. 答應了沒到（交往中）：18:00「（照片：桌上兩副碗筷，一鍋湯）」、18:01「湯我留著。」',H.G.flags.YT_VDAY_Y2==='missed'&&J(dms(YT).slice(n))===J(['（照片：桌上兩副碗筷，一鍋湯）','湯我留著。']),J(dms(YT))); }
  { setup('2027-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y2_ask',2); const r=dms(YT).slice(-1)[0]; rules(); check('2-2. 「明天不行。」→「嗯。」、YT_VDAY_Y2 no',r==='嗯。'&&H.G.flags.YT_VDAY_Y2==='no'); }
  { const G=setup('2027-02-14',20,null); PHONE.join(G,'noodle_team','桌遊團'); rules(); const pre=H.msgs('g:noodle_team').length; at('2027-02-14',21.05); rules(); const M=(G.msgs||[]).filter(m=>m.th==='g:noodle_team').map(m=>m.from+':'+m.text);
    check('第 3 節. 2027-02-14（日）21:00 群組：阿哲「今天情人節 我在高雄」…（沒交往也看得到，一次）',pre===0&&M.length===4&&M[0]==='zhe:今天情人節 我在高雄',J(M)); }
  });
  await sec('7',async()=>{
  { setup('2028-02-13',21.05,YT); rules();
    check('2-3. 2/13（日）21:00「明天下午有空嗎」「想帶你去一個地方」',J(dms(YT))===J(['明天下午有空嗎','想帶你去一個地方'])&&J(optsOf('anyt_yt_y3_ask'))===J(['好。去哪裡？','明天不行。']),J(dms(YT)));
    PHONE.answer(H.G,'anyt_yt_y3_ask',0); rules(); const r=dms(YT).slice(-2), q=OUT.get(H.G,'anyt_yt_vday_y3');
    check('2-3. 「好。去哪裡？」→「去了就知道。」「兩點，校門口。走過去。」（AA_630 H-011、H-022）；出遊 14:00',J(r)===J(['去了就知道。','兩點，校門口。走過去。'])&&!!q&&q.h===14&&q.place==='校門口',J(q)); }
  });
  await sec('8',async()=>{
  { setup('2029-02-13',21.05,YT,{YT_VDAY_Y1:'went'}); rules();
    check('2-4. 交往中：2/13（初一）21:00「明天晚上我回台北。」「七點。……來我家。」',J(dms(YT))===J(['明天晚上我回台北。','七點。……來我家。'])&&J(optsOf('anyt_yt_y4_ask'))===J(['好。','明天不行。']),J(dms(YT)));
    PHONE.answer(H.G,'anyt_yt_y4_ask',0); rules(); const q=OUT.get(H.G,'anyt_yt_vday_y4');
    check('2-4. 出遊 19:00、她家',!!q&&q.h===19&&q.place==='新生南路・她家'&&q.title==='情人節（她家）',J(q));
    at('2029-02-14',18.6); const a=relOf(YT); const {L}=await goOut('anyt_yt_vday_y4',[1]);
    check('2-4. 她家煎年糕；舊存檔 2026 去過＝「上次跟你過情人節，是大一。」；「同事？」→（交往中）「……過完年我再跟她說。」',L[0]==='（她家。廚房的燈亮著，平底鍋裡煎著兩片年糕。）'&&L.includes('上次跟你過情人節，是大一。')&&L.includes('我多拿了一袋。她問我要給誰。……我說給茶屋的同事。')&&L.includes('……過完年我再跟她說。'),J(L));
    check('2-4. YT_VDAY_Y4 went、記憶 YT_VDAY_NIANGAO、+3／+6／+5',H.G.flags.YT_VDAY_Y4==='went'&&SOCIAL.has(YT,'YT_VDAY_NIANGAO')&&dRel(YT,a)===VDAY,dRel(YT,a)); }
  { setup('2029-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y4_ask',0); rules(); at('2029-02-14',19.3); expire(); rules(); const n=dms(YT).length; at('2029-02-14',19.6); rules();
    check('2-4. 答應了沒到：19:30「（照片：一袋年糕）」、19:31「放冰箱了。開學給你。」',H.G.flags.YT_VDAY_Y4==='missed'&&J(dms(YT).slice(n))===J(['（照片：一袋年糕）','放冰箱了。開學給你。']),J(dms(YT))); }
  });
  await sec('9',async()=>{
  const CG='cg_moon_pomelo_heroine03';
  const moon=async(y,askKey,dayKey,flags,picks,o)=>{ setup(askKey,21.05,YT,Object.assign({YT_MET_JOB:true},flags||{}),o); if(o&&o.cg) global.CG_REGISTRY={[CG]:{file:'assets/cg/heroine_03/cg_moon_pomelo.webp',title:'月亮。'}}; else delete global.CG_REGISTRY;
    rules(); const d=dms(YT).slice(), op=optsOf('anyt_yt_moon_'+y+'_ask'); if(!op) return {d,op,q:null};
    PHONE.answer(H.G,'anyt_yt_moon_'+y+'_ask',(o&&o.ans)||0); rules(); const q=OUT.get(H.G,'anyt_yt_moon_'+y); if(!q) return {d,op,q};
    at(dayKey,16.1); const a=relOf(YT); const r=await goOut('anyt_yt_moon_'+y,picks); return {d,op,q,L:r.L,a,cgs:H.cgs.slice(),said:H.said.slice()}; };
  { const r=await moon(2026,'2026-09-24','2026-09-25',{},[0],{cg:1});
    check('2-5. 2026-09-24 21:00「明天烤肉 明軒叫我先去河濱占位子」「你要不要一起」（AA_630 H-014）',J(r.d)===J(['明天烤肉 明軒叫我先去河濱占位子','你要不要一起'])&&J(r.op)===J(['好。','明天不行。']),J(r.d));   /* 2026-11-11（X324 G 區，AA_802_sis_b4_anyt.json@f2a55c1e7）：an_yt_hol_events.js 句首「……」拿掉、遊戲照新句。舊期望：「……你要不要一起」 */
    check('2-5. 出遊 9/25 16:30、河濱、標題「中秋（河濱）」；背景 riverside',!!r.q&&r.q.h===16.5&&r.q.place==='河濱'&&r.q.title==='中秋（河濱）'&&img(H.bgs[0])==='riverside',J(r.q));
    check('2-5. 第一次：河濱占位子、剝柚子、「月亮。」放 CG、「明軒他們到了。……走吧。」',r.L[0]==='（河濱的草地，烤肉的人還沒到。語彤鋪了一塊野餐墊，說明軒叫她先來占位子。）'&&J(r.cgs)===J([CG])&&r.L.includes('明軒他們到了。……走吧。'),J(r.L));
    check('2-5. YT_MOON_2026 went、記憶 YT_MOON',H.G.flags.YT_MOON_2026==='went'&&SOCIAL.has(YT,'YT_MOON')&&dRel(YT,r.a)===MOON,dRel(YT,r.a)); }
  { const r=await moon(2028,'2028-10-02','2028-10-03',{EXCHANGE_ROUTE:'TW',YT_MOON_2026:'went'},[0],{cg:1}); const w=r.said.find(s=>s.t==='明年你們還來不來占位子？');
    check('2-5. 2028：明軒（提著烤肉架走過來）「明年你們還來不來占位子？」、語彤「來啊。」；沒有 CG',!!w&&r.L.includes('來啊。')&&!r.cgs.length,J(r.said.slice(0,12))); }   /* 2026-11-11（X324 G 區，AA_802_sis_b4_anyt.json@f2a55c1e7）：an_yt_hol_events.js 句首「……」拿掉、遊戲照新句。舊期望：「……來啊。」 */
  delete global.CG_REGISTRY;
  });

  /* ======================= 10 沒交往、在國外、沒有聯絡方式 ======================= */
  await sec('10',async()=>{
  const ASK=[['an_y1','2026-02-12'],['an_y2','2027-02-12'],['an_y3','2028-02-13'],['yt_y2','2027-02-13'],['yt_y3','2028-02-13'],['yt_y4','2029-02-13'],['yt_moon_2026','2026-09-24'],['yt_moon_2027','2027-09-14'],['yt_moon_2028','2028-10-02']];   /* yt_y1（2026）AA_630 第 10 節第 4 點拿掉 */
  const who=k=>k.indexOf('an_')===0?AN:YT;
  const none=(o,flags)=>ASK.filter(([k,key])=>{ setup(key,21.05,who(k),flags,o); rules(); return !!PHONE.byAsk(H.G,'anyt_'+k+'_ask')||dms(who(k)).length>0; }).map(x=>x[0]);
  const call=(o,flags)=>{ setup('2029-02-14',9,AN,flags,o); rules(); return !!OUT.get(H.G,'anyt_an_vday_y4'); };
  { const all=ASK.filter(([k,key])=>{ setup(key,21.05,who(k)); rules(); return !!PHONE.byAsk(H.G,'anyt_'+k+'_ask'); }).map(x=>x[0]);
    check('10. 交往中（臺灣路線、有聯絡方式）：九場私訊約都有（語彤 2026 拿掉）、2029 電話有',all.length===ASK.length&&call({}),J(all)); }
  { const a=none({notDating:true}); check('10. 沒交往：十一場一場都不演（沒有私訊、沒有電話）',!a.length&&!call({notDating:true}),J(a)); }
  { const a=none({noContact:true}); check('10. 沒有她的聯絡方式：不約、不打',!a.length&&!call({noContact:true}),J(a)); }
  { const ab=STORY.abroad; STORY.abroad=()=>true; let a, c; try{ a=none({}); c=call({}); } finally { STORY.abroad=ab; }
    check('10. 祐廷在國外（STORY.abroad）：十一場都不演',!a.length&&!c,J(a)); }
  { setup('2026-02-12',21.05,AN,{},{}); H.G.stage='econ'; rules(); check('10. 經濟系那一年（stage econ）：不演',!PHONE.byAsk(H.G,'anyt_an_y1_ask')); }
  { setup('2026-02-12',21.05,AN,{},{}); H.G.flags['dating_'+AN]=false; ROM.get(H.G,AN).status='ex'; H.G.flags['dating_'+YT]=true; ROM.get(H.G,YT).status='dating'; rules();
    check('10. 只看那一位：和語彤交往、不是以安＝以安那一場不演',!PHONE.byAsk(H.G,'anyt_an_y1_ask')); }
  { setup('2026-02-10',21.05,AN); rules(); at('2026-02-14',9); rules(); check('10. 約的那天（2/12～2/13）以後才第一次跑手機規則：不補約',!PHONE.byAsk(H.G,'anyt_an_y1_ask')&&!dms(AN).length); }
  });

  H.done();
})();

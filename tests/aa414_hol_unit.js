// AA_414（企劃線 b1fc4bf30；AA-B 2026-10-23）：以安、語彤交往中的節日・第一批——四年情人節（八場）、語彤的中秋（三年）、2027-02-14 麵店團群組。不需要瀏覽器。
// 台詞一字照稿（D109）。做法照學姊的 S.HOL（src/sis_b4_3d.js）：前一天 21:00 她私訊約 → 回覆 → 出遊（OUT）→ 那一場 → 答應了沒到＝她再傳。
// 檢查：0 讀稿（每一句台詞、選項、地點字幕、私訊都在稿裡）、index.html 接線、人物頁記憶 10 個、noodle_table_window 背景
//   1 以安 1-1 2026 開車去台中（寒假從臺北的家出發不用取車、學期中從宿舍要先回家取車（DATE-C7）、油錢有扣；背景 car_morning → tc_park → car_night；回「在臺北。」20:00 照片；答應了沒到 15:00、17:00；沒回）
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
const inDoc=t=>doc.indexOf(t)>=0||doc416.indexOf(t)>=0;
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
      YT_VDAY_RIVER:'店休那天，阿姨叫你們去別的地方',YT_VDAY_SHOP:'阿姨在門口貼了情人節的紅紙',YT_VDAY_FIELD:'她帶你去看她做田野的地方',YT_VDAY_NIANGAO:'阿姨叫她拿年糕給你',YT_MOON:'中秋在麵店門口剝柚子'};
    const bad=Object.keys(W).filter(k=>ML[k]!==W[k]||!inDoc('`'+k+'`「'+W[k]+'」'));
    check('0. 人物頁記憶 10 個（稿裡「`代號`「名稱」」，social3d.js MEMORY_LABEL）',!bad.length,J(bad)); }
  { const bad=[]; const T=t=>{ if(typeof t==='string'&&!inDoc(t)) bad.push(t); };
    for(const k in ANYTHOL_LINES){ const v=ANYTHOL_LINES[k]; if(k==='grp') v.forEach(x=>T(x[1])); else if(Array.isArray(v)) v.forEach(T); else T(v); }
    for(const e of ANYTHOL_EVENTS) for(const l of e.dialogue){ if(l.text!==undefined) T(l.text); if(l.scene!==undefined) T(l.scene); if(l.name!==undefined) T(l.name); for(const c of (l.choice||[])) T(c.text); }
    for(const a of X().HOL) T(a.out.title);
    { const A524=new Set(['（指了一下對岸）去年想帶你去的地方，在那邊。','山坡上那一排房子。','……今年從這裡看就好。']); for(let i=bad.length-1;i>=0;i--) if(A524.has(bad[i])) bad.splice(i,1); }   /* 2026-10-30 AA_524 Y4（企劃線 8fd10848d）在 2029 河濱加的三句：tests/aa524_promises_unit.js 對 AA_524 的稿 */
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
    check('1-1. 出遊：2/14 14:00、late 0.5、標題「情人節（開車去台中找以安）」；開車照 date3d.js（D26 單程 150 分；2/14 在寒假、從臺北的家出發，不加回家取車的 30 分＝2.5 小時，DATE-C7；來回 900 元）',!!q&&q.day===H.D('2026-02-14')&&q.h===14&&q.late===0.5&&q.title==='情人節（開車去台中找以安）'&&q.travelH===DATE.travel('D26','car').minutes/60&&q.travelH===2.5&&q.fare===900&&q.travel==='開車到台中約 2 小時 30 分鐘',J(q));
    { const dorm=ANYTHOL.drive(H.G,H.D('2026-03-14')), home=ANYTHOL.drive(H.G,H.D('2026-02-14'));
      check('1-1. 開車的算法（DATE-C7）：學期中從宿舍出發＝先回家取車 30 分（3 小時、「回家取車約 30 分鐘，再開車到台中約 2 小時 30 分鐘」）；寒暑假從家裡＝2.5 小時、沒有取車那一句',dorm.travelH===3&&dorm.travel==='回家取車約 30 分鐘，再開車到台中約 2 小時 30 分鐘'&&home.travelH===2.5&&home.travel==='開車到台中約 2 小時 30 分鐘'&&dorm.fare===900,J({dorm,home})); }
    at('2026-02-14',11.3); const due=OUT.due(H.G); const a=relOf(AN), m0=H.G.money; money=[];
    const {L}=await goOut('anyt_an_vday_y1',[0]);
    check('1-1. 11:15 就問出發（14:00 減 2.5 小時再早 15 分；寒假從臺北的家出發不用取車，DATE-C7）',!!due&&due.id==='anyt_an_vday_y1');
    check('1-1. 油錢有扣（出發的時候 -900 交通）',m0-H.G.money===900&&J(money)===J([[-900,'交通']]),J(money));
    check('1-1. 背景：car_morning → tc_park（公園門口、公園）→ car_night（國道・休息站）',J(H.bgs.map(img).filter((b,i,A)=>typeof b==='string'&&b!=='dark'&&A.indexOf(b)===i))===J(['car_morning','tc_park','car_night']),J(H.bgs.map(img)));
    check('1-1. 那一場照稿（「我想來。」）',J(L)===J(['（她站在公園門口，圍巾圍到下巴。看到你下車，先看了一下手錶。）','你出門的時候傳了訊息。我算你兩點到。','開了兩個多小時，就為了這個？……你可以不用來的。','……嗯。','（她把圍巾拉下來一點。）',
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
    check('1-2. 背景 daan_park；「巧克力。」→「巧克力太簡單了。」旁白「（她從紙袋裡拿出一個學業御守。）」；照稿',img(H.bgs[0])==='daan_park'&&J(L)===J(['（她從東京回來兩個禮拜了。手上提著一個紙袋，上面都是日文。）','東京買的。你猜。','巧克力太簡單了。','（她從紙袋裡拿出一個學業御守。）','你今年要考很多試。','（你們在公園裡走了兩個多小時。她看了兩次手錶，第三次沒有看。）','四點半了。我要去搭車。','……下次換你來。']),J({bg:img(H.bgs[0]),L}));
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
    check('1-3. 接 3/14：ev_an_white_day 演「（她拿出一個小紙袋）一個月前你送的。這是回禮。」那一版（不改 r2y3b_events.js）',W.includes('（她拿出一個小紙袋）一個月前你送的。這是回禮。')&&!W.includes('二月十四號那天，我在讀書。……你也沒說什麼。'),J(W)); }
  { setup('2028-02-13',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y3_ask',0); const L=await play('ev_an_vday_y3',[1]);
    check('1-3. 「（給她一盒巧克力）」→「……好。」旁白「（她當場拆開，吃了一顆。）」「我以為我會留到日本再吃。」、AN_VDAY_GIFT choco、記憶 AN_VDAY_CHOCO',J(L.slice(3,6))===J(['……好。','（她當場拆開，吃了一顆。）','我以為我會留到日本再吃。'])&&H.G.flags.AN_VDAY_GIFT==='choco'&&SOCIAL.has(AN,'AN_VDAY_CHOCO'),J(L));
    at('2028-03-14',18); const W=await play('ev_an_white_day',[0]); check('1-3. 巧克力也算送過（AN_VDAY_GIFT 有值）：3/14 是回禮那一版',W.includes('（她拿出一個小紙袋）一個月前你送的。這是回禮。'),J(W)); }
  { setup('2028-02-13',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y3_ask',1); rules(); const r=dms(AN).slice(-1)[0]; at('2028-03-14',18); const W=await play('ev_an_white_day',[0]);
    check('1-3. 「明天我不行。」→「好。那三月再說。」、AN_VDAY_Y3 no、沒有 AN_VDAY_GIFT＝3/14 沒送過那一版，而且是「你有事」那一句（AA_508 0-2 第 8 點：她約過、你拒絕）＋「回禮要先收到才算。」',r==='好。那三月再說。'&&H.G.flags.AN_VDAY_Y3==='no'&&H.G.flags.AN_VDAY_GIFT==null&&W.includes('二月十四號那天，你有事。我在讀書。')&&!W.includes('二月十四號那天，我在讀書。……你也沒說什麼。')&&W.includes('（她拿出一個小紙袋）回禮要先收到才算。……這個，是我自己想送。'),J({r,W})); }
  { setup('2028-02-13',21.05,AN); rules(); PHONE.answer(H.G,'anyt_an_y3_ask',0); rules(); at('2028-02-14',13.6); H.picks=[2]; await OUT.prompt(GM,OUT.get(H.G,'anyt_an_vday_y3')); rules(); const n=dms(AN).length; at('2028-02-14',15.05); rules(); at('2028-02-14',17.05); rules();
    check('1-3. 「不去了」：記 missed、15:00「我在總圖門口。」、17:00「我先回去了。行李還沒收。」',H.G.flags.AN_VDAY_Y3==='missed'&&J(dms(AN).slice(n))===J(['我在總圖門口。','我先回去了。行李還沒收。']),J(dms(AN))); }
  });

  /* ======================= 4 以安 1-4 2029-02-14 21:00 電話 ======================= */
  await sec('4',async()=>{
  { setup('2029-02-13',20,AN); rules(); at('2029-02-13',21.5); rules(); const pre=dms(AN).length; at('2029-02-14',9); rules(); const q=OUT.get(H.G,'anyt_an_vday_y4');
    check('1-4. 沒有前一天的私訊；2/14（三，初二）21:00 她打來（那一天一開始就排好；電話、接起來／先不接、late 0.25）',pre===0&&!!q&&q.day===H.D('2029-02-14')&&q.h===21&&q.call===true&&q.verb==='接起來'&&q.no==='先不接'&&q.place==='電話'&&q.late===0.25,J(q));
    at('2029-02-14',20.95); const a=relOf(AN); const {L}=await goOut('anyt_an_vday_y4',[0]);
    check('1-4. 電話（{scene:\'電話\'}）照稿；「十八號回來？」→「十八號。高鐵三點到臺北。」「……我只是跟你說一聲。」',J(L)===J(['（電話。那頭很吵，有人在喊「碰」。）','今天初二。我在外婆家。','十幾個人在客廳打牌。我躲到陽台。','……今天是情人節。我記得。','十八號。高鐵三點到臺北。','……我只是跟你說一聲。','（那頭有人叫她的名字。）','我要進去了。……晚安。'])&&ev('ev_an_vday_y4').dialogue[0].scene==='電話',J(L));
    check('1-4. AN_VDAY_Y4 called、記憶 AN_VDAY_CALL、熟悉 +2、自在 +3、她的戀愛 +3',H.G.flags.AN_VDAY_Y4==='called'&&SOCIAL.has(AN,'AN_VDAY_CALL')&&dRel(AN,a)===CALL,dRel(AN,a));
    at('2029-02-14',21.6); rules(); check('1-4. 接了：沒有 21:30 那兩則',!dms(AN).includes('打給你，沒接。')); }
  { setup('2029-02-14',9,AN); rules(); const L=await play('ev_an_vday_y4',[1]);
    check('1-4. 「外婆家好玩嗎？」→「表妹問我男朋友是誰。我說你不認識。」「……她說那就是有。」',J(L.slice(4,6))===J(['表妹問我男朋友是誰。我說你不認識。','……她說那就是有。']),J(L)); }
  { setup('2029-02-14',9,AN); rules(); at('2029-02-14',20.95); H.picks=[2]; const r=await OUT.prompt(GM,OUT.get(H.G,'anyt_an_vday_y4')); rules(); const n=dms(AN).length; at('2029-02-14',21.51); rules(); const m1=dms(AN).slice(n); at('2029-02-14',21.6); rules();
    check('1-4. 先不接：記 missed、21:30「打給你，沒接。」、21:31「外婆家很吵。明天再說。」',r==='no'&&H.G.flags.AN_VDAY_Y4==='missed'&&J(m1)===J(['打給你，沒接。'])&&J(dms(AN).slice(n))===J(['打給你，沒接。','外婆家很吵。明天再說。']),J({r,d:dms(AN)})); }
  { setup('2029-02-14',9,AN); rules(); at('2029-02-14',21.3); rules(); at('2029-02-14',21.6); rules();
    check('1-4. 21:15 以前沒接（沒按）：一樣記 missed、兩則',H.G.flags.AN_VDAY_Y4==='missed'&&J(dms(AN))===J(['打給你，沒接。','外婆家很吵。明天再說。']),J(dms(AN))); }
  });

  /* ======================= 5 語彤 2-1 2026-02-14 店休、大掃除、河濱 ======================= */
  await sec('5',async()=>{
  { setup('2026-02-13',21.05,YT,{YT_CRACK:1}); rules();
    check('2-1. 2/13（五）21:00 語彤「明天店休。」「下午大掃除。……五點以後可以。」；回覆三個',J(dms(YT))===J(['明天店休。','下午大掃除。……五點以後可以。'])&&J(optsOf('anyt_yt_y1_ask'))===J(['五點，麵店門口。','我去幫忙掃。','明天不行。']),J(dms(YT)));
    PHONE.answer(H.G,'anyt_yt_y1_ask',1); rules(); const r=dms(YT).slice(-3), q=OUT.get(H.G,'anyt_yt_vday_y1');
    check('2-1. 「我去幫忙掃。」→「……阿姨會很高興。」「四點。穿舊衣服。」、YT_VDAY_Y1_GO、YT_VDAY_Y1_HELP；出遊 16:00、走路約 10 分鐘、late 0.25、標題「情人節（麵店門口）」',J(r)===J(['我去幫忙掃。','……阿姨會很高興。','四點。穿舊衣服。'])&&H.G.flags.YT_VDAY_Y1_GO===true&&H.G.flags.YT_VDAY_Y1_HELP===true&&!!q&&q.h===16&&q.help===true&&q.travel==='走路約 10 分鐘'&&q.late===0.25&&q.title==='情人節（麵店門口）'&&q.day===H.D('2026-02-14'),J(q));
    at('2026-02-14',12); check('2-1. 那天麵店店休，有約在麵店＝鐵門照常開（noodle_closed3d.js storyDue）',NOODLE_CLOSED.closed(H.G)&&NOODLE_CLOSED.storyDue(H.G));
    at('2026-02-14',15.6); const a=relOf(YT); const {L}=await goOut('anyt_yt_vday_y1',[1]);
    check('2-1. 幫忙的先演；阿姨兩句（說話框「阿姨」）；字幕「河濱」換 riverside；「下次店休也出來。」→「下次店休是明年。」「……那明年也出來。」',J(L)===J(['（鐵門拉下來一半。你彎腰鑽進去，語彤蹲在地上刷椅子腳。）','手套在那邊。','（你們把最後幾張椅子刷完。阿姨從廚房出來，看了一下時鐘。）','今天情人節耶，你們兩個還在這裡。','去去去，去別的地方。店我來關。','……阿姨叫我們去別的地方。','（河濱的風很大。跑步的人一個一個從旁邊過去。）','我很少這個時間出來。平常這時候在店裡。','下次店休是明年。','……那明年也出來。'])&&H.said[3].who==='阿姨',J(L));
    check('2-1. 背景 noodle_table → riverside',J(H.bgs.map(img).filter((b,i,A)=>typeof b==='string'&&b!=='dark'&&A.indexOf(b)===i))===J(['noodle_table','riverside']),J(H.bgs.map(img)));
    check('2-1. YT_VDAY_Y1 went、記憶 YT_VDAY_RIVER、+3／+6／+5、裂縫 1→0；幫忙的 16:00～18:30',H.G.flags.YT_VDAY_Y1==='went'&&SOCIAL.has(YT,'YT_VDAY_RIVER')&&dRel(YT,a)===VDAY&&H.G.flags.YT_CRACK===0&&H.G.hour===18.5,dRel(YT,a)+' h '+H.G.hour); }
  { setup('2026-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y1_ask',0); rules(); const r=dms(YT).slice(-1)[0], q=OUT.get(H.G,'anyt_yt_vday_y1'); at('2026-02-14',16.7); const {L}=await goOut('anyt_yt_vday_y1',[0]);
    check('2-1. 「五點，麵店門口。」→「嗯。」、17:00；沒有幫忙那三句，直接阿姨；「冷嗎？」→「……有一點。」旁白「（她把手縮進袖子。你們又走了一段。）」；17:00～18:30',r==='嗯。'&&q.h===17&&!q.help&&L[0]==='今天情人節耶，你們兩個還在這裡。'&&J(L.slice(-2))===J(['……有一點。','（她把手縮進袖子。你們又走了一段。）'])&&H.G.hour===18.5,J({q,L,h:H.G.hour})); }
  { setup('2026-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y1_ask',0); rules(); at('2026-02-14',17.3); expire(); rules(); const n=dms(YT).length; at('2026-02-14',17.55); rules(); at('2026-02-14',19.05); rules();
    check('2-1. 答應了沒到：17:30「（照片：拉下來的鐵門）」、19:00「我回家了。」',H.G.flags.YT_VDAY_Y1==='missed'&&J(dms(YT).slice(n))===J(['（照片：拉下來的鐵門）','我回家了。']),J(dms(YT))); }
  { setup('2026-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y1_ask',2); rules(); const r=dms(YT).slice(-1)[0]; at('2026-02-14',19.1); rules();
    check('2-1. 「明天不行。」→「嗯。沒關係。」、YT_VDAY_Y1 no、沒有出遊、沒有鐵門照片',r==='嗯。沒關係。'&&H.G.flags.YT_VDAY_Y1==='no'&&!OUT.get(H.G,'anyt_yt_vday_y1')&&!dms(YT).includes('（照片：拉下來的鐵門）'),J(dms(YT))); }
  });

  /* ======================= 6 語彤 2-2 2027-02-14 中午麵店；第 3 節群組 ======================= */
  await sec('6',async()=>{
  { setup('2027-02-13',21.05,YT); rules();
    check('2-2. 2/13（六）21:00「明天中午，麵店。」「我沒班。」；回覆「好。」「不去別的地方？」「明天不行。」',J(dms(YT))===J(['明天中午，麵店。','我沒班。'])&&J(optsOf('anyt_yt_y2_ask'))===J(['好。','不去別的地方？','明天不行。']),J(dms(YT)));
    PHONE.answer(H.G,'anyt_yt_y2_ask',1); rules(); const r=dms(YT).slice(-1)[0], q=OUT.get(H.G,'anyt_yt_vday_y2');
    check('2-2. 「不去別的地方？」→「……麵店就好。今天外面人多，我會累。」；出遊 12:00、走路、late 0.5、標題「情人節（阿鳳麵店）」',r==='……麵店就好。今天外面人多，我會累。'&&H.G.flags.YT_VDAY_Y2_GO===true&&!!q&&q.h===12&&q.late===0.5&&q.travel==='走路'&&q.title==='情人節（阿鳳麵店）',J(q));
    at('2027-02-14',11.6); const a=relOf(YT), n0=(H.G.dateLog&&H.G.dateLog[YT]&&H.G.dateLog[YT].count)|0; const {L}=await goOut('anyt_yt_vday_y2',[0]);
    check('2-2. 背景 noodle_table_window（最裡面靠窗那一桌）；紅紙、滷蛋；「謝謝阿姨。」→阿姨「謝什麼。吃。」；「今天我沒班。」「……是我自己想在這裡吃的。」',img(H.bgs[0])==='noodle_table_window'&&J(L)===J(['（麵店門口貼了一張紅紙，是阿姨的字：「情人節：兩碗乾麵，送一顆滷蛋」。）','阿姨自己寫的。……我叫她不要貼。','（店裡坐滿了。阿姨把最裡面靠窗的那一桌留給你們，桌上已經放了兩顆滷蛋。）','送的。一人一顆。不是一桌一顆。','……阿姨。','謝什麼。吃。','今天我沒班。','……是我自己想在這裡吃的。']),J({b:img(H.bgs[0]),L}));
    check('2-2. YT_VDAY_Y2 went、記憶 YT_VDAY_SHOP、+3／+6／+5；不是正式校外約會（dateLog 次數不加）',H.G.flags.YT_VDAY_Y2==='went'&&SOCIAL.has(YT,'YT_VDAY_SHOP')&&dRel(YT,a)===VDAY&&((H.G.dateLog&&H.G.dateLog[YT]&&H.G.dateLog[YT].count)|0)===n0,dRel(YT,a)); }
  { setup('2027-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y2_ask',0); const r=dms(YT).slice(-1)[0]; const L=await play('ev_yt_vday_y2',[1]);
    check('2-2. 「好。」→「嗯。」；「（先吃）」→旁白「（你們吃得很慢。語彤一直沒有看手機。）」',r==='嗯。'&&L[5]==='（你們吃得很慢。語彤一直沒有看手機。）'&&!L.includes('謝什麼。吃。')&&J(H.opts[0])===J(['「謝謝阿姨。」','（先吃）']),J(L)); }
  { setup('2027-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y2_ask',0); rules(); at('2027-02-14',12.6); expire(); rules(); const n=dms(YT).length; at('2027-02-14',13.05); rules();
    check('2-2. 答應了沒到：13:00「（照片：桌上兩碗麵、兩顆滷蛋）」、13:01「阿姨說留到兩點。」',H.G.flags.YT_VDAY_Y2==='missed'&&J(dms(YT).slice(n))===J(['（照片：桌上兩碗麵、兩顆滷蛋）','阿姨說留到兩點。']),J(dms(YT))); }
  { setup('2027-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y2_ask',2); const r=dms(YT).slice(-1)[0]; rules(); check('2-2. 「明天不行。」→「嗯。」、YT_VDAY_Y2 no',r==='嗯。'&&H.G.flags.YT_VDAY_Y2==='no'); }
  { const G=setup('2027-02-14',20,null); PHONE.join(G,'noodle_team','麵店團'); rules(); const pre=H.msgs('g:noodle_team').length; at('2027-02-14',21.05); rules(); const M=(G.msgs||[]).filter(m=>m.th==='g:noodle_team').map(m=>m.from+':'+m.text); at('2027-02-14',22); rules();
    check('第 3 節. 2027-02-14（日）21:00 麵店團群組（AA_446 第 5 節：阿哲在高雄）：阿哲「今天情人節 我在高雄」「跟 Alison 視訊了兩個小時」、Alison「你不用跟大家報告！！」、阿哲「我要讓大家知道」（沒交往也看得到，一次）',pre===0&&J(M)===J(['zhe:今天情人節 我在高雄','zhe:跟 Alison 視訊了兩個小時','yu:你不用跟大家報告！！','zhe:我要讓大家知道'])&&H.msgs('g:noodle_team').length===4,J(M));
    setup('2027-02-14',21.05,null); rules(); check('第 3 節. 不在群組：沒有',!(H.G.msgs||[]).some(m=>m.th==='g:noodle_team')); }
  });

  /* ======================= 7 語彤 2-3 2028-02-14 寶藏巖 ======================= */
  await sec('7',async()=>{
  { setup('2028-02-13',21.05,YT); rules();
    check('2-3. 2/13（日）21:00「明天下午有空嗎」「想帶你去一個地方」；回覆「好。去哪裡？」「明天不行。」',J(dms(YT))===J(['明天下午有空嗎','想帶你去一個地方'])&&J(optsOf('anyt_yt_y3_ask'))===J(['好。去哪裡？','明天不行。']),J(dms(YT)));
    PHONE.answer(H.G,'anyt_yt_y3_ask',0); rules(); const r=dms(YT).slice(-2), q=OUT.get(H.G,'anyt_yt_vday_y3');
    check('2-3. 「好。去哪裡？」→「去了就知道。」「兩點，麵店門口。走過去。」；出遊 14:00、走路約 15 分鐘、late 0.25、標題「情人節（語彤要帶你去的地方）」',J(r)===J(['去了就知道。','兩點，麵店門口。走過去。'])&&!!q&&q.h===14&&q.travel==='走路約 15 分鐘'&&q.travelH===0.25&&q.late===0.25&&q.title==='情人節（語彤要帶你去的地方）',J(q));
    at('2028-02-14',13.6); const a=relOf(YT); const {L}=await goOut('anyt_yt_vday_y3',[0]);
    check('2-3. 寶藏巖沒有底圖（深色底＋字幕「寶藏巖」）；「他講了什麼？」→「他年輕的時候怎麼搬來的。」「我寫了很多頁。報告只能用三頁。」',H.bgs.every(b=>b==='dark')&&ev('ev_yt_vday_y3').dialogue[0].scene==='寶藏巖'&&J(L)===J(['（河邊的老聚落，房子一層一層疊在山坡上。巷子窄到兩個人要側身才過得去。）','上學期的田野，我在這裡做訪談。','有一個阿公，每天下午坐在那張椅子上。他跟我講了三個下午。','（她指的那張椅子是空的。）','……今天他不在。','他年輕的時候怎麼搬來的。','我寫了很多頁。報告只能用三頁。','（下坡的時候，她走在前面。走到巷口，才回頭看你有沒有跟上。）']),J({b:H.bgs,L}));
    check('2-3. YT_VDAY_Y3 went、記憶 YT_VDAY_FIELD、+3／+6／+5',H.G.flags.YT_VDAY_Y3==='went'&&SOCIAL.has(YT,'YT_VDAY_FIELD')&&dRel(YT,a)===VDAY,dRel(YT,a)); }
  { setup('2028-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y3_ask',0); const L=await play('ev_yt_vday_y3',[1]);
    check('2-3. 「為什麼帶我來？」→「……我想讓你看一次。」「我在做的事。」',J(L.slice(5,7))===J(['……我想讓你看一次。','我在做的事。']),J(L)); }
  { setup('2028-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y3_ask',0); rules(); at('2028-02-14',14.3); expire(); rules(); const n=dms(YT).length; at('2028-02-14',15.05); rules();
    check('2-3. 答應了沒到：15:00「（照片：一張空的塑膠椅）」、15:01「下次。」',H.G.flags.YT_VDAY_Y3==='missed'&&J(dms(YT).slice(n))===J(['（照片：一張空的塑膠椅）','下次。']),J(dms(YT))); }
  { setup('2028-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y3_ask',1); const r=dms(YT).slice(-1)[0]; rules(); at('2028-02-14',15.1); rules();
    check('2-3. 「明天不行。」→「嗯。下次。」、no、沒有椅子的照片',r==='嗯。下次。'&&H.G.flags.YT_VDAY_Y3==='no'&&!dms(YT).includes('（照片：一張空的塑膠椅）')); }
  });

  /* ======================= 8 語彤 2-4 2029-02-14 店休、河濱、年糕 ======================= */
  await sec('8',async()=>{
  { setup('2029-02-13',21.05,YT,{YT_VDAY_Y1:'went'}); rules();
    check('2-4. 2/13（二，初一）21:00「明天晚上，河濱。」「七點。」；回覆「好。」「明天不行。」',J(dms(YT))===J(['明天晚上，河濱。','七點。'])&&J(optsOf('anyt_yt_y4_ask'))===J(['好。','明天不行。']),J(dms(YT)));
    PHONE.answer(H.G,'anyt_yt_y4_ask',0); rules(); const q=OUT.get(H.G,'anyt_yt_vday_y4');
    check('2-4. 「好。」→「嗯。」；出遊 19:00、走路約 15 分鐘、late 0.25、標題「情人節（河濱）」',dms(YT).slice(-1)[0]==='嗯。'&&!!q&&q.h===19&&q.travel==='走路約 15 分鐘'&&q.late===0.25&&q.title==='情人節（河濱）',J(q));
    at('2029-02-14',18.6); const a=relOf(YT); const {L}=await goOut('anyt_yt_vday_y4',[0]);
    check('2-4. 背景 riverside（晚上）；2026 有去的多「上次店休碰到情人節，是大一。」；「替我謝謝阿姨。」→「你自己謝。初四開門，你來。」',img(H.bgs[0])==='riverside'&&J(L)===J(['（過年的河濱，跑步的人比平常少。對岸的燈一排一排亮著。）','上次店休碰到情人節，是大一。','阿姨叫我拿年糕給你。','她說你太瘦了。','你自己謝。初四開門，你來。','（她把裝年糕的袋子交給你，手沒有馬上收回去。）']),J(L));
    check('2-4. YT_VDAY_Y4 went、記憶 YT_VDAY_NIANGAO、+3／+6／+5',H.G.flags.YT_VDAY_Y4==='went'&&SOCIAL.has(YT,'YT_VDAY_NIANGAO')&&dRel(YT,a)===VDAY,dRel(YT,a)); }
  { setup('2029-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y4_ask',0); const L=await play('ev_yt_vday_y4',[1]);
    check('2-4. 2026 沒去：沒有「上次店休」那句；「妳也很瘦。」→「……我吃很多。只是你沒看到。」',!L.includes('上次店休碰到情人節，是大一。')&&L[3]==='……我吃很多。只是你沒看到。',J(L)); }
  { setup('2029-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y4_ask',0); rules(); at('2029-02-14',19.3); expire(); rules(); const n=dms(YT).length; at('2029-02-14',19.6); rules();
    check('2-4. 答應了沒到：19:30「（照片：一袋年糕）」、19:31「初四來店裡拿。」',H.G.flags.YT_VDAY_Y4==='missed'&&J(dms(YT).slice(n))===J(['（照片：一袋年糕）','初四來店裡拿。']),J(dms(YT))); }
  { setup('2029-02-13',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_y4_ask',1); const r=dms(YT).slice(-1)[0]; rules(); check('2-4. 「明天不行。」→「嗯。」、no、沒有出遊',r==='嗯。'&&H.G.flags.YT_VDAY_Y4==='no'&&!OUT.get(H.G,'anyt_yt_vday_y4')); }
  });

  /* ======================= 9 中秋 2026～2028 ======================= */
  await sec('9',async()=>{
  const CG='cg_moon_pomelo_heroine03';
  const moon=async(y,askKey,dayKey,flags,picks,o)=>{ setup(askKey,21.05,YT,flags,o); if(o&&o.cg) global.CG_REGISTRY={[CG]:{file:'assets/cg/heroine_03/cg_moon_pomelo.webp',title:'月亮。'}}; else delete global.CG_REGISTRY;
    rules(); const d=dms(YT).slice(), op=optsOf('anyt_yt_moon_'+y+'_ask'); if(!op) return {d,op,q:null};
    PHONE.answer(H.G,'anyt_yt_moon_'+y+'_ask',(o&&o.ans)||0); rules(); const q=OUT.get(H.G,'anyt_yt_moon_'+y); if(!q) return {d,op,q};
    at(dayKey,14.6); const a=relOf(YT); const r=await goOut('anyt_yt_moon_'+y,picks); return {d,op,q,L:r.L,a,cgs:H.cgs.slice(),said:H.said.slice()}; };
  const BASE=(mid)=>['（麵店三點就收了。阿姨在裡面準備晚上烤肉的東西，叫你們去外面坐。）','（語彤搬了兩張塑膠椅到店門口，腿上放著一顆柚子。）','你會剝嗎？'].concat(mid);
  { const r=await moon(2026,'2026-09-24','2026-09-25',{},[0],{cg:1});
    check('2-5. 2026-09-24 21:00「明天麵店三點收」「……阿姨說你可以來」；回覆「好。」「明天不行。」；「好。」→「嗯。三點。」',J(r.d)===J(['明天麵店三點收','……阿姨說你可以來'])&&J(r.op)===J(['好。','明天不行。'])&&dms(YT).slice(-1)[0]==='嗯。三點。'&&H.G.flags.YT_MOON_2026_GO===true,J(r.d));
    check('2-5. 出遊 9/25 15:00、走路、late 0.5、標題「中秋（麵店門口）」；背景 noodle_table；15:00～17:30',!!r.q&&r.q.day===H.D('2026-09-25')&&r.q.h===15&&r.q.late===0.5&&r.q.travel==='走路'&&r.q.title==='中秋（麵店門口）'&&img(H.bgs[0])==='noodle_table'&&H.G.hour===17.5,J({q:r.q,h:H.G.hour}));
    check('2-5. 2026（第一次）：「會。」→旁白「（你剝了一半，皮斷成好幾塊。）」「……我來。」；「月亮。」那一句放 CG；沒有 2027、2028 的句子',J(r.L)===J(BASE(['（你剝了一半，皮斷成好幾塊。）','……我來。','（她把剝好的一瓣放到你手上。巷口開始有人在烤肉，煙飄過來。）','（快五點半的時候，語彤忽然抬頭。）','……欸。月亮。','（東邊的樓頂上，月亮剛出來，還是淡淡的白色。）','阿哲在群組叫了。……走吧。']))&&J(r.cgs)===J([CG]),J({L:r.L,cgs:r.cgs}));
    const idx=ev('ev_yt_moon').dialogue.findIndex(l=>l.cg===CG); check('2-5. CG 接在「……欸。月亮。」那一句（前一行）',idx>0&&ev('ev_yt_moon').dialogue[idx+1].text==='……欸。月亮。');
    check('2-5. YT_MOON_2026 went、記憶 YT_MOON、熟悉 +4、自在 +4、她的戀愛 +4',H.G.flags.YT_MOON_2026==='went'&&SOCIAL.has(YT,'YT_MOON')&&dRel(YT,r.a)===MOON,dRel(YT,r.a)); }
  { const r=await moon(2026,'2026-09-24','2026-09-25',{},[1],{});
    check('2-5. CG 還沒有圖（CG_REGISTRY 沒登錄）：照對話演、不放 CG；「不會。」→「看。」旁白「（她用指甲在柚子頂上劃了一圈，整片皮完整地剝了下來。）」',!r.cgs.length&&J(r.L.slice(3,5))===J(['看。','（她用指甲在柚子頂上劃了一圈，整片皮完整地剝了下來。）']),J(r)); }
  { const r=await moon(2027,'2027-09-14','2027-09-15',{},[0],{cg:1});
    check('2-5. 2027 是第一次的：有 CG＋「今天以安生日。這顆柚子，晚上帶去。」（在剝好那句之後）',J(r.cgs)===J([CG])&&r.L[6]==='今天以安生日。這顆柚子，晚上帶去。'&&r.L[5]==='（她把剝好的一瓣放到你手上。巷口開始有人在烤肉，煙飄過來。）'&&H.G.flags.YT_MOON_2027==='went',J(r.L)); }
  { const r=await moon(2027,'2027-09-14','2027-09-15',{YT_MOON_2026:'went'},[0],{cg:1});
    check('2-5. 2027、2026 去過：只有對話、沒有 CG；以安生日那一句照有',!r.cgs.length&&r.L.includes('今天以安生日。這顆柚子，晚上帶去。'),J(r)); }
  { const r=await moon(2028,'2028-10-02','2028-10-03',{EXCHANGE_ROUTE:'TW',YT_MOON_2026:'went'},[0],{cg:1}); const w=r.said.find(s=>s.t==='明年你們還來不來剝？');
    check('2-5. 2028（臺灣路線）：阿姨（從店裡）「明年你們還來不來剝？」、語彤「……來啊。」；沒有以安生日那句、沒有 CG',!!w&&w.who==='阿姨（從店裡）'&&r.L[6]==='明年你們還來不來剝？'&&r.L[7]==='……來啊。'&&!r.L.includes('今天以安生日。這顆柚子，晚上帶去。')&&!r.cgs.length,J(r.L)); }
  { const r=await moon(2028,'2028-10-02','2028-10-03',{EXCHANGE_ROUTE:'US'},[0],{cg:1});
    check('2-5. 2028 美國路線（在美國）：不演（沒有私訊、沒有出遊）',!r.op&&!r.d.length&&!OUT.get(H.G,'anyt_yt_moon_2028'),J(r)); }
  { const r=await moon(2028,'2028-10-02','2028-10-03',{EXCHANGE_ROUTE:'JP'},[0],{});
    check('2-5. 2028 日本路線（8/5 回來了）：照演',!!r.q&&r.L.includes('……來啊。')); }
  { setup('2026-09-24',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_moon_2026_ask',0); rules(); at('2026-09-25',15.6); expire(); rules(); const n=dms(YT).length; at('2026-09-25',16.05); rules();
    check('2-5. 答應了沒到：16:00「（照片：剝好的柚子，放在塑膠椅上）」',H.G.flags.YT_MOON_2026==='missed'&&J(dms(YT).slice(n))===J(['（照片：剝好的柚子，放在塑膠椅上）']),J(dms(YT))); }
  { setup('2026-09-24',21.05,YT); rules(); PHONE.answer(H.G,'anyt_yt_moon_2026_ask',1); const r=dms(YT).slice(-1)[0]; rules(); at('2026-09-25',16.1); rules();
    check('2-5. 「明天不行。」→「嗯。晚上烤肉見。」、YT_MOON_2026 no、沒有出遊、沒有柚子照片',r==='嗯。晚上烤肉見。'&&H.G.flags.YT_MOON_2026==='no'&&!OUT.get(H.G,'anyt_yt_moon_2026')&&!dms(YT).includes('（照片：剝好的柚子，放在塑膠椅上）')); }
  { const r1=await moon(2026,'2026-09-24','2026-09-25',{},[0],{}); const mem1=(H.G.social.mem[YT]||[]).filter(m=>m.tag==='YT_MOON').length;
    H.G.day=H.D('2027-09-14'); H.G.hour=21.05; rules(); PHONE.answer(H.G,'anyt_yt_moon_2027_ask',0); rules(); at('2027-09-15',14.6); await goOut('anyt_yt_moon_2027',[0]);
    const mem2=(H.G.social.mem[YT]||[]).filter(m=>m.tag==='YT_MOON').length;
    check('2-5. 同一個存檔兩年都去：YT_MOON_2026、YT_MOON_2027 各記 went；記憶 YT_MOON 只記一次',H.G.flags.YT_MOON_2026==='went'&&H.G.flags.YT_MOON_2027==='went'&&mem1===1&&mem2===1,J({mem1,mem2})); }
  delete global.CG_REGISTRY;
  });

  /* ======================= 10 沒交往、在國外、沒有聯絡方式 ======================= */
  await sec('10',async()=>{
  const ASK=[['an_y1','2026-02-12'],['an_y2','2027-02-12'],['an_y3','2028-02-13'],['yt_y1','2026-02-13'],['yt_y2','2027-02-13'],['yt_y3','2028-02-13'],['yt_y4','2029-02-13'],['yt_moon_2026','2026-09-24'],['yt_moon_2027','2027-09-14'],['yt_moon_2028','2028-10-02']];
  const who=k=>k.indexOf('an_')===0?AN:YT;
  const none=(o,flags)=>ASK.filter(([k,key])=>{ setup(key,21.05,who(k),flags,o); rules(); return !!PHONE.byAsk(H.G,'anyt_'+k+'_ask')||dms(who(k)).length>0; }).map(x=>x[0]);
  const call=(o,flags)=>{ setup('2029-02-14',9,AN,flags,o); rules(); return !!OUT.get(H.G,'anyt_an_vday_y4'); };
  { const all=ASK.filter(([k,key])=>{ setup(key,21.05,who(k)); rules(); return !!PHONE.byAsk(H.G,'anyt_'+k+'_ask'); }).map(x=>x[0]);
    check('10. 交往中（臺灣路線、有聯絡方式）：十場私訊約都有、2029 電話有',all.length===ASK.length&&call({}),J(all)); }
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

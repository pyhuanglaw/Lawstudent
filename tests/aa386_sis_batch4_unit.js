// AA_386（企劃線 e848154a；任務 AA386-SIS-BATCH4-1022）：學姊第四批——直屬學姊替你看路、交往中的節日、重新開始。不需要瀏覽器。
// 使用者 10-21 22:5x（經 AA）：「學姊才是真正的女主角」。台詞一字照稿（D100、D109）。
// 檢查：0 讀稿（每一句台詞都在稿裡）、index.html 接線、talkSis／talkCharacter 在 SISY23.preTalk 沒演時問 SISB4.preTalk、人物頁記憶 10 個
//   1 第 1 節四場（說話前接演；熟悉以上；一般、交往中；時段；日本路線 1-4 不演；不熟、分開過的不演；演一次；talkSis 實際接演、SISY23 那一段先演）
//   2 第 2 節：AA_379 2-6 一般版那一句——聽過她提美國的（階梯大二下過了 S4-Lx、記憶 SIS5_EXCHANGE_APP、SIS_ADV_EXCH go）換兩句；都沒聽過照原句；交往中不動
//   3 第 3 節（只有交往中）：3-1 聖誕 Café 門口、3-2 研究室、3-3 學姊大四上那一頓固定 2028-12-24＋3-2 有來多兩句、那晚有別的約＝往後讓＋21:00 私訊（d0468be4）、學姊交往版期末約會避開 12/24、3-4 植物園、3-5 公車到終點站、3-6 電話；沒來的私訊；不交往的都沒有
//   4 第 4 節：分開過的玩家滿 6 週才演三件事（前任／被發現退回朋友兩種第一句）；沒演三件事沒有告白；演過以後兩次正式校外約會、第二次結尾告白＝答應（BB_122 9-2 的台詞）；期末心意邀約不給分開過的
//   5 閒聊階梯（白名單 5ef4e291 匯入）：大三上 S5-L8 交往中 extraIf、大三下 S6-L1 skipIf SIS_VDAY_Y3:went
// 修改前（開發分支 8a99f2ed）：沒有 SISB4、階梯沒有那兩個欄位（第 0 項起大多 FAIL）。用法：node tests/aa386_sis_batch4_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
const ok0=load('src/data/sis_y2y3_events.js')&&load('src/sis_y2y3_3d.js'), ok1=load('src/data/sis_b4_events.js'), ok2=load('src/sis_b4_3d.js');
let doc=''; try{ doc=cp.execSync('git show d0468be4:"docs/story_planning/AA_386_學姊第四批_直屬學姊替你看路_節日_重新開始.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
let doc398=''; try{ doc398=cp.execSync('git show e81a1afe:"docs/story_planning/AA_398_學姊不再說三件事_全遊戲替換表.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc398=''; }   /* AA_398（使用者 10-23：學姊不數件數）的替換句也算稿 */
let doc406=''; try{ doc406=cp.execSync('git show 895496a7:"docs/story_planning/AA_406_家族的聖誕交換禮物_直屬送直屬.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc406=''; }   /* AA_406 第 4 節：大二聖誕夜她先拿紙袋那一句 */
let doc392=''; try{ doc392=cp.execSync('git show e81a1afe1:"docs/story_planning/AA_392_學姊第六批_說了沒發生與每週視訊.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc392=''; }   /* AA_392 第 6 節荷花池也接在這兩個檔 */
const SPLIT=['（她拿出一個紙袋。）','（她把螢光筆收進大衣口袋，沒有放進包包。）'];   /* AA_406 第 4 節「LAWWW 照這句調順序」：原本一行旁白拆成兩半 */
/* 2026-10-28 AA_512 第 6 節（企劃線 c444f0757）：6-3 4-1「還有，我要時間。不是一週，是我說好的那天。」改「還有，我要時間。等到我說好的那天。」（禁用句型）；6-2 重新開始那一次「……我也想好了。」後面多「其他的，想了很久。……沒有了。」——
   新句子的稿是 AA_512（tests/aa512_sis_b13_unit.js 逐字對），這裡的 4-1、4-2 照新的寫 */
let doc512=''; try{ doc512=cp.execSync('git show c444f0757:"docs/story_planning/AA_512_學姊第十三批_她自己的事當面演_說了沒發生九件.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc512=''; }
const AA512_41='還有，我要時間。等到我說好的那天。';
const inDoc=t=>doc.indexOf(t)>=0||doc398.indexOf(t)>=0||doc392.indexOf(t)>=0||doc406.indexOf(t)>=0||SPLIT.includes(t)||(t===AA512_41&&doc512.indexOf('→「'+t+'」')>=0);
const J=JSON.stringify, ID='heroine_05', X=()=>typeof SISB4!=='undefined'?SISB4:null;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const setup=(key,h,zone,lv,flags)=>{ const G=H.fresh(key,h,zone||'dorm',Object.assign({met_sis:true,SIS_W1:true},flags||{})); if(lv) H[lv](ID); G.contacts=G.contacts||{}; G.contacts[ID]=G.day-30; G.outings=[]; if(STORY._bindGM) STORY._bindGM(GM); return G; };
const rules=()=>{ const x=X(); if(x) x.phone(H.G); PHONE.tick(H.G); };
const at=(key,h)=>{ const G=H.G; G.day=H.D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
const dms=()=>H.msgs('p:'+ID);
const said=()=>H.said.map(s=>s.t);
const play=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return said(); };
const pre=async picks=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const x=X(); const r=x?await x.preTalk(GM):false; return {r,L:said(),O:H.opts.slice()}; };
const dateSis=()=>{ H.G.flags['dating_'+ID]=true; ROM.get(H.G,ID).status='dating'; };
const relOf=()=>Object.assign({},SOCIAL.rel(ID));
const dRel=(a,b)=>{ const o={}; for(const k of ['fam','trust','comf','npcRom','rom']) if((b[k]|0)!==(a[k]|0)) o[k]=(b[k]|0)-(a[k]|0); return J(o); };
const ev1=k=>{ const x=X(); return x?x.preTalkEv(H.G):null; };
const sisN={id:'sis',charId:ID,name:'溫學姊',obj:{position:{x:1,y:0,z:1}},seat:null};
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).slice(0,300)); } };
(async()=>{
  /* ======================= 0 讀稿、接線 ======================= */
  check('0. 讀稿（企劃線 d0468be4 AA_386：3-4 是臺北植物園；第 6 節 AA 回十個解讀；3-3 那一頓固定 12/24＋備援私訊）',doc.length>5000&&inDoc('## 4. 重新開始：她的三件事')&&inDoc('2/14 14:00 臺北植物園')&&inDoc('固定排 2028-12-24（日）18:30')&&inDoc('當晚 21:00 改成她私訊三則'));
  check('0. 新檔載得到：SISB4、SISB4_LINES、SISB4_EVENTS（第 3 節五場出遊＋說話前接演五段＝10 筆；AA_392 第 6 節荷花池＝11）',ok0&&ok1&&ok2&&!!X()&&Array.isArray(SISB4_EVENTS)&&SISB4_EVENTS.length===11&&['ev_sis_adv_grad','ev_sis_adv_exch','ev_sis_adv_pick','ev_sis_adv_y4','ev_sis_xmas_y2','ev_sis_xmas_y3','ev_sis_vday_y2','ev_sis_vday_y3','ev_sis_vday_y4','ev_sis_three_conditions'].every(id=>!!ev(id)),J({ok0,ok1,ok2,n:typeof SISB4_EVENTS!=='undefined'&&SISB4_EVENTS.length}));
  await sec('0',async()=>{   /* 修改前沒有 SISB4：每一節照樣跑、照樣算 FAIL（不在第 0 項就停）*/
  { const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
    check('0. index.html：sis_b4_events.js、sis_b4_3d.js 接在 sis_y2y3_3d.js 後面（?v= 照舊）',/src\/sis_y2y3_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/sis_b4_events\.js\?v=[^"]+"><\/script>\n<script src="src\/sis_b4_3d\.js\?v=[^"]+"><\/script>/.test(html));
    const tc=st.slice(st.indexOf('S.talkCharacter=async function'),st.indexOf('let GM_ref=null')), ts=st.slice(st.indexOf('async function talkSis(GM,n)'),st.indexOf('async function talkSis(GM,n)')+3000);
    check('0. talkCharacter、talkSis（本來就問 SISY23.preTalk）＋SISB4 包住 SISY23.preTalk：那一段沒演才問 SISB4.preTalk（她有別的事件要先演，這一場等下一次）',/SISY23\.preTalk\) await SISY23\.preTalk\(GM\)/.test(tc)&&/SISY23\.preTalk\) await SISY23\.preTalk\(GM\)/.test(ts)&&typeof SISY23!=='undefined'&&!!SISY23.preTalk._sisb4); }
  { const ML=SOCIAL.MEMORY_LABEL||{}, W={SIS_ADV_GRAD:'她說準備研究所準備得太早',SIS_ADV_EXCH:'她問：晚半年會怎樣',SIS_ADV_PICK:'她看了你的志願表',SIS_ADV_Y4:'她說：你的大四，你自己排',SIS_XMAS_Y2:'聖誕夜，Café 門口的熱水',SIS_XMAS_Y3:'研究室的小聖誕樹',SIS_VDAY_Y2:'情人節，植物園的荷花池',SIS_VDAY_Y3:'寒假那一天的假，公車坐到終點站',SIS_VDAY_Y4:'情人節的電話，她在陽台',SIS_REBUILD:'她說：等她說好的那天'};
    const bad=Object.keys(W).filter(k=>ML[k]!==W[k]||!(inDoc('`'+k+'`「'+W[k]+'」')||(doc398.includes('`'+k+'`')&&doc398.includes('「'+W[k]+'」'))));   /* SIS_ADV_PICK、SIS_REBUILD 照 AA_398 第 27、48 列改名 */
    check('0. 人物頁記憶 10 個（第 5 節的名稱，social3d.js MEMORY_LABEL）',!bad.length,J(bad)); }
  { const bad=[]; const T=t=>{ if(typeof t==='string'&&!inDoc(t)) bad.push(t); };
    for(const k in SISB4_LINES){ const v=SISB4_LINES[k]; if(Array.isArray(v)) v.forEach(T); else T(v); }
    for(const e of SISB4_EVENTS) for(const l of e.dialogue){ if(l.text!==undefined) T(l.text); if(l.scene!==undefined) T(l.scene); for(const c of (l.choice||[])) T(c.text); }
    check('0. 每一句台詞、選項、地點字幕都在稿裡（一字不差）',!bad.length,J(bad)); }
  { const labels=[]; for(const e of SISB4_EVENTS){ const L=new Set(e.dialogue.filter(l=>l.label).map(l=>l.label)); for(const l of e.dialogue){ if(l.goto&&!L.has(l.goto)) labels.push(e.id+':'+l.goto); for(const c of (l.choice||[])) if(c.goto&&!L.has(c.goto)) labels.push(e.id+':'+c.goto); } }
    check('0. 每一個 goto 都有 label',!labels.length,J(labels)); }
  });

  /* ======================= 1 直屬學姊替你看路 ======================= */
  await sec('1',async()=>{
  /* 1-1 */
  { setup('2026-04-06',10,'library','FAMILIAR'); const e=ev1(); const a=relOf(); const {L,O}=await pre([0]); const b=relOf(), e2=ev1();
    check('1-1. 大一下第 7 週（4/6）在閱覽室找她說話（熟悉以上）＝接在前面演 ev_sis_adv_grad',e==='ev_sis_adv_grad',J(e));
    check('1-1. 一般版：祐廷「學姊是什麼時候開始準備研究所的？」「大三。」…「研究所會等你。」；選項「那學姊後悔嗎？」／「我還沒想那麼遠。」；「不後悔。」「……可是如果重來，我會留幾格空的。」；沒有交往中那一段',
      J(L)===J(['學姊是什麼時候開始準備研究所的？','大三。','……現在想起來，太早了。大三那一年，我的計畫本上沒有一格是空的。','重點是，先把大學念完。研究所會等你。','不後悔。','……可是如果重來，我會留幾格空的。'])&&J(O[0])===J(['「那學姊後悔嗎？」','「我還沒想那麼遠。」']),J({L,O}));
    check('1-1. 記憶 SIS_ADV_GRAD、熟悉 +2、信任 +1；演過一次就不再',SOCIAL.has(ID,'SIS_ADV_GRAD')&&dRel(a,b)===J({fam:2,trust:1})&&e2===null,dRel(a,b)+' '+e2); }
  { setup('2026-04-08',20,'cafe','FAMILIAR'); dateSis(); const {L,O}=await pre([1]);
    check('1-1. 交往中：「妳是什麼時候開始準備研究所的？」、選項「妳後悔嗎？」；「我還沒想那麼遠。」→「嗯。這樣很好。」「想好了再來問我。」，接著旁白「（她翻開計畫本……只寫了你的名字。）」「以前這一格，我會排滿。」（AA_398 第 22 列）',
      L[0]==='妳是什麼時候開始準備研究所的？'&&J(O[0])===J(['「妳後悔嗎？」','「我還沒想那麼遠。」'])&&J(L.slice(-4))===J(['嗯。這樣很好。','想好了再來問我。','（她翻開計畫本給你看。這個禮拜六那一格，只寫了你的名字。）','以前這一格，我會排滿。']),J({L,O})); }
  { const r=[]; for(const [k,z] of [['2026-03-29','library'],['2026-05-18','library'],['2026-04-06','campus'],['2026-04-06','gym']]){ setup(k,10,z,'FAMILIAR'); r.push(ev1()); }
    const ok=[]; for(const z of ['cafe','lawlib','library','library_hall']){ setup('2026-05-17',15,z,'FAMILIAR'); ok.push(ev1()); }
    setup('2026-04-06',10,'library'); H.rel(ID,10,0,0); r.push(ev1());
    check('1-1. 時段：第 5 週（3/29）、第 13 週（5/18）、不在她讀書的地方、不熟（認識）都不演；第 12 週（5/17）在 Café、法圖、閱覽室、大廳自習區都演',r.every(x=>x===null)&&ok.every(x=>x==='ev_sis_adv_grad'),J({r,ok})); }
  /* 1-2 */
  { setup('2026-12-01',20,'cafe','FAMILIAR'); const e=ev1(); const a=relOf(); const {L,O}=await pre([1]); const b=relOf();
    check('1-2. 大二上第 13 週（12/1）Café：傳單旁白、「學姊大學有去交換嗎？」…「……現在想想，晚半年會怎樣？」「（她問完，自己也沒有回答。）」；選項「好像也不會怎樣。」／「學姊現在還可以去啊。」；後者→「研究生也可以申請。……我查過。」「只是查過。」→「傳單收好。大三上就要填志願了。」',
      e==='ev_sis_adv_exch'&&J(L)===J(['（你的包包裡露出一張傳單：「交換學生甄選說明會」。她看到了。）','學姊大學有去交換嗎？','沒有。我算過，會晚半年。','晚半年畢業，晚半年考研究所。後面每一件事，都晚半年。','……現在想想，晚半年會怎樣？','（她問完，自己也沒有回答。）','研究生也可以申請。……我查過。','只是查過。','傳單收好。大三上就要填志願了。'])&&J(O[0])===J(['「好像也不會怎樣。」','「學姊現在還可以去啊。」']),J({e,L,O}));
    check('1-2. 旗標 SIS_ADV_EXCH go、記憶 SIS_ADV_EXCH、熟悉 +2、信任 +1',H.G.flags.SIS_ADV_EXCH==='go'&&SOCIAL.has(ID,'SIS_ADV_EXCH')&&dRel(a,b)===J({fam:2,trust:1}),dRel(a,b)); }
  { setup('2026-11-23',10,'library','FAMILIAR'); const {L}=await pre([0]); const f=H.G.flags.SIS_ADV_EXCH;
    setup('2026-12-17',19.5,'lawlib','FAMILIAR'); dateSis(); const d=await pre([1]), fd=H.G.flags.SIS_ADV_EXCH;
    const r=[]; for(const k of ['2026-11-22','2026-12-21']){ setup(k,10,'library','FAMILIAR'); r.push(ev1()); }
    check('1-2. 「好像也不會怎樣。」→「嗯。」「……我那時候覺得，會怎樣。」、旗標 same；交往中「妳大學有去交換嗎？」、選項「妳現在還可以去啊。」（go）；第 11 週、第 16 週不演',
      J(L.slice(6))===J(['嗯。','……我那時候覺得，會怎樣。','傳單收好。大三上就要填志願了。'])&&f==='same'&&d.L[1]==='妳大學有去交換嗎？'&&J(d.O[0])===J(['「好像也不會怎樣。」','「妳現在還可以去啊。」'])&&fd==='go'&&r.every(x=>x===null),J({L,f,d:d.L,fd,r})); }
  /* 1-3 */
  { setup('2027-11-15',10,'library','FAMILIAR'); const e=ev1(), y23=SISY23.preTalkEv(H.G); const a=relOf(); const {L,O}=await pre([0]); const b=relOf();
    check('1-3. 2027-11-15（志願表 11/18 截止以前）一般版：「志願表，寫了嗎？」「還沒。禮拜四中午截止。」「選你想學的地方。」「……選了，就不要一直回頭看。」（AA_398 第 23 列）；「學姊自己呢？做到了嗎？」→「前面那句做到了。」「後面那句，我還在練。」',
      e==='ev_sis_adv_pick'&&y23===null&&J(L)===J(['志願表，寫了嗎？','還沒。禮拜四中午截止。','選你想學的地方。','……選了，就不要一直回頭看。','前面那句做到了。','後面那句，我還在練。'])&&J(O[0])===J(['「學姊自己呢？做到了嗎？」','「如果我選了留在臺灣呢？」']),J({e,L,O}));
    check('1-3. 記憶 SIS_ADV_PICK、熟悉 +2、信任 +2',SOCIAL.has(ID,'SIS_ADV_PICK')&&dRel(a,b)===J({fam:2,trust:2}),dRel(a,b)); }
  { setup('2027-11-17',19.5,'lawlib','FAMILIAR'); const n=await pre([1]);
    setup('2027-11-13',10,'cafe','FAMILIAR'); dateSis(); const d1=await pre([0]);
    setup('2027-11-16',20,'cafe','FAMILIAR'); dateSis(); const d2=await pre([1]);
    const r=[]; for(const k of ['2027-11-12','2027-11-18']){ setup(k,10,'library','FAMILIAR'); r.push(ev1()); }
    check('1-3. 「如果我選了留在臺灣呢？」→「那也是選。」「……一樣，不要回頭看。」；第 13 天、第 17 天都演；11/12、11/18 不演',J(n.L.slice(-2))===J(['那也是選。','……一樣，不要回頭看。'])&&r.every(x=>x===null),J({n:n.L,r}));
    check('1-3. 交往中：「志願表，寫了嗎？」旁白「（你把手機上的志願表給她看。……）」「……嗯。」「那計畫本上，飛機畫一架就好。」；「本來要畫幾架？」→「兩架。你的，我的。」「……我畫飛機很醜。一架就夠了。」；「三件事呢？」→「一，選你想學的。二，選你以後會想念的。」「三……你已經選了。不用說。」；沒有一般版的三件事',
      J(d1.L)===J(['志願表，寫了嗎？','（你把手機上的志願表給她看。第一志願，是她要去的那間學校。）','……嗯。','那計畫本上，飛機畫一架就好。','兩架。你的，我的。','……我畫飛機很醜。一架就夠了。'])&&J(d1.O[0])===J(['「本來要畫幾架？」','「妳沒有要交代我什麼？」'])&&J(d2.L.slice(-2))===J(['本來有。……選你想學的，選了不要回頭看。','可是你已經選了。不用說。'])&&!d2.L.includes('三，選了就不要回頭看。'),J({d1:d1.L,d2:d2.L})); }
  /* 1-4 */
  { setup('2028-05-02',10,'library','FAMILIAR',{EXCHANGE_ROUTE:'TW'}); const e=ev1(); const a=relOf(); const {L,O}=await pre([1]); const b=relOf();
    check('1-4. 大三下第 11 週（5/2）一般版：「你大四要做什麼，想了嗎？」；「大概知道。」→「嗯。不用跟我說。先跟自己說。」；「你的大四，你自己排。我只幫你看。」一、二、「……三，不要讓別人替你寫。」旁白看自己的計畫本；沒有交往中那句',
      e==='ev_sis_adv_y4'&&J(L)===J(['你大四要做什麼，想了嗎？','嗯。不用跟我說。先跟自己說。','你的大四，你自己排。我只幫你看。','排之前先睡飽。排好的，一個禮拜看一次就好。','……不要讓別人替你寫。','（她說這句的時候，看的是自己的計畫本。）'])&&J(O[0])===J(['「還在想。」','「大概知道。」']),J({e,L,O}));
    check('1-4. 記憶 SIS_ADV_Y4、熟悉 +2、信任 +1（選項只是聊，不記路線）',SOCIAL.has(ID,'SIS_ADV_Y4')&&dRel(a,b)===J({fam:2,trust:1})&&H.G.flags.EXCHANGE_ROUTE==='TW',dRel(a,b)); }
  { setup('2028-04-24',10,'library','FAMILIAR',{EXCHANGE_ROUTE:'US'}); dateSis(); const us=await pre([0]);
    setup('2028-05-28',15,'cafe','FAMILIAR',{EXCHANGE_ROUTE:'TW'}); dateSis(); const tw=await pre([0]);
    const r=[]; for(const [k,rt] of [['2028-05-02','JP'],['2028-04-23','TW'],['2028-05-29','TW']]){ setup(k,10,'library','FAMILIAR',{EXCHANGE_ROUTE:rt}); r.push(ev1()); }
    check('1-4. 交往中多一句：美國路線「到了那邊，拿給我看。」、臺灣路線「八月以後，拍照傳給我。我在那邊也看得到。」；「還在想。」→「還在想，也是一種排法。」',us.L[1]==='還在想，也是一種排法。'&&us.L[us.L.length-1]==='到了那邊，拿給我看。'&&!us.L.includes('八月以後，拍照傳給我。我在那邊也看得到。')&&tw.L[tw.L.length-1]==='八月以後，拍照傳給我。我在那邊也看得到。',J({us:us.L,tw:tw.L}));
    check('1-4. 日本路線（這時在日本）、第 9 週（4/23）、第 15 週（5/29）不演',r.every(x=>x===null),J(r)); }
  /* 不熟、分開過的 */
  { const r=[]; for(const k of ['2026-04-06','2026-12-01','2027-11-15','2028-05-02']){ setup(k,10,'library',null,{EXCHANGE_ROUTE:'TW'}); H.rel(ID,10,0,0); r.push(ev1()); }
    for(const k of ['2026-12-01','2027-11-15']){ setup(k,10,'library','FRIEND'); dateSis(); ROM.end(H.G,ID,'apart_talk'); r.push(ev1()); }
    setup('2027-11-15',10,'library','FAMILIAR',{met_sis:false}); r.push(ev1());
    check('1. 四場：不熟（認識）、分開過的（同 AA_379 2-9）、還沒認識她的都不演',r.every(x=>x===null),J(r)); }
  /* talkSis 實際接演；她有別的事件要先演（SISY23 的 2-3／2-6）＝這一場等下一次 */
  { setup('2026-04-06',10,'library','FAMILIAR'); H.said=[]; H.picks=[0]; await STORY._v1.talkSis(GM,sisN); const L1=said();
    setup('2026-04-07',20,'cafe','FAMILIAR'); const p0=SISY23.preTalkEv; SISY23.preTalkEv=()=>'ev_sis_topic'; H.said=[]; H.picks=[0]; try{ await STORY._v1.talkSis(GM,sisN); } finally { SISY23.preTalkEv=p0; } const L2=said(), stillDue=ev1();
    H.said=[]; H.picks=[0]; await STORY._v1.talkSis(GM,sisN); const L3=said();
    check('1. talkSis：閱覽室找她說話，先演 1-1（第一句「學姊是什麼時候開始準備研究所的？」）',L1[0]==='學姊是什麼時候開始準備研究所的？'&&L1.includes('……可是如果重來，我會留幾格空的。'),J(L1));
    check('1. 同一次說話 SISY23 有別的一段要演（2-3）＝先演那一段、這一場等下一次；下一次說話才演 1-1',L2[0]==='我想寫的東西，找到了。'&&!L2.includes('學姊是什麼時候開始準備研究所的？')&&stillDue==='ev_sis_adv_grad'&&L3[0]==='學姊是什麼時候開始準備研究所的？',J({L2:L2.slice(0,2),stillDue,L3:L3.slice(0,1)})); }
  });

  /* ======================= 2 AA_379 2-6 那一句 ======================= */
  await sec('2',async()=>{
  const OLD='計畫本上寫了很久。今天才決定要跟人說。', N1='之前跟你提過。', N2='……申請送出去了。今天才覺得是真的。';
  const go=async(setupF,picks)=>{ setup('2027-11-03',19.5,'lawlib','FAMILIAR'); if(setupF) setupF(H.G); H.said=[]; H.picks=(picks||[0]).slice(); await SISY23.preTalk(GM); return said(); };
  const a=await go(), b=await go(G=>{ G.social.ladder={[ID+'@Y2S2']:3}; }), c=await go(G=>{ G.social.ladder={[ID+'@Y2S2']:2}; }), d=await go(()=>SOCIAL.remember(ID,'SIS5_EXCHANGE_APP','')),
    e=await go(G=>{ G.flags.SIS_ADV_EXCH='go'; }), f=await go(G=>{ G.flags.SIS_ADV_EXCH='same'; }), g=await go(G=>{ G.social.ladder={[ID+'@Y2S2']:3}; dateSis(); });
  const hasNew=L=>{ const i=L.indexOf(N1); return i>0&&L[i+1]===N2&&L[i-1]==='八月走，十二月回來。論文的第四章，要在那邊寫。'&&!L.includes(OLD); }, hasOld=L=>L.includes(OLD)&&!L.includes(N1)&&!L.includes(N2);   /* 前一句「第四章」：AA_509 0-2 第 4 點（28f981438）改的，原本「第三章」（tests/aa379_sis_y2y3_unit.js 對稿）*/
  check('2. 都沒聽過（沒有階梯進度、記憶、1-2 的 go）：照原句「計畫本上寫了很久。今天才決定要跟人說。」',hasOld(a),J(a));
  check('2. 大二下階梯已經過了 S4-Lx（進度 3）：換成「之前跟你提過。」「……申請送出去了。今天才覺得是真的。」；進度 2（S4-Lx 還沒說）照原句',hasNew(b)&&hasOld(c),J({b,c}));
  check('2. 有記憶 SIS5_EXCHANGE_APP（大三上 S5-L1）、1-2 選了「學姊現在還可以去啊。」（go）＝換兩句；1-2 選另一個（same）照原句',hasNew(d)&&hasNew(e)&&hasOld(f),J({d,e,f}));
  check('2. 交往中那一版不動（本來就沒有這句）',!g.includes(OLD)&&!g.includes(N1)&&g.includes('你如果去，我們同一班飛機。'),J(g));
  { setup('2027-11-12',12.4,'campus','FAMILIAR'); H.G.social.ladder={[ID+'@Y2S2']:4}; H.said=[]; H.picks=[0]; await EVENTS.run(ev('ev_sis_us_told_steps')); const L=said();
    check('2. 台階那一版（11/12 總圖門口的台階）同一套',hasNew(L),J(L)); }
  check('2. 兩句都在稿裡（AA_386 第 2 節）',inDoc('學姊「'+N1+'」')&&inDoc('學姊「'+N2+'」')&&inDoc('都沒聽過的照原句'));
  });

  /* ======================= 3 交往中的節日 ======================= */
  await sec('3',async()=>{
  /* 3-1 */
  { setup('2026-12-23',20,'dorm','FRIEND'); dateSis(); rules(); const a=dms().length; at('2026-12-23',21.05); rules(); const m=PHONE.byAsk(H.G,'sisb4_xmas_y2_ask');
    check('3-1. 2026-12-23（三）21:00 私訊「明天晚上十點，Café 門口。」「十五分鐘就好。」；回覆「好。」「明天晚上不行。」（20:00 還沒有）',a===0&&J(dms())===J(['明天晚上十點，Café 門口。','十五分鐘就好。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','明天晚上不行。']),J(dms()));
    PHONE.answer(H.G,'sisb4_xmas_y2_ask',0); rules(); const q=OUT.get(H.G,'sisb4_xmas_y2');
    check('3-1. 「好。」＝12/24 22:00 兩點半 Café 門口（出遊；不算正式校外約會）',!!q&&q.day===H.D('2026-12-24')&&q.h===22&&q.ev==='ev_sis_xmas_y2'&&q.place==='兩點半 Café 門口'&&!q.dateTrip,J(q));
    const c0=(H.G.dateLog&&H.G.dateLog[ID]&&H.G.dateLog[ID].count)|0, r0=relOf(); const L=await play('ev_sis_xmas_y2',[0]); const r1=relOf();
    check('3-1. Café 門口：紙杯的熱水、綠色螢光筆、明年的計畫本；「（現在打開）」→「（第一頁只有一行：「1/1　早上不要排事情。睡飽。」）」「……我說回去再看。」→「十五分鐘到了。」「（她說十五分鐘到了，可是沒有走。）」',
      J(L)===J(['（Café 的燈一盞一盞關掉。她站在門口，手上拿著兩個紙杯。）','熱水。加了一點蜂蜜。','……今天聖誕節，算特別的。','（你把準備好的禮物給她。一盒綠色螢光筆。）','……你怎麼知道我的用完了。','（她把螢光筆收進大衣口袋，沒有放進包包。然後拿出一個紙袋。）','明年的計畫本。第一頁我寫了。回去再看。','（第一頁只有一行：「1/1　早上不要排事情。睡飽。」）','……我說回去再看。','十五分鐘到了。','（她說十五分鐘到了，可是沒有走。）'])&&J(H.opts[0])===J(['（現在打開）','（收好，回去再看）']),J(L));
    check('3-1. SIS_XMAS_Y2 there、記憶 SIS_XMAS_Y2、聖誕單獨見面 熟悉／自在／她的戀愛 +4；不進 dateLog',H.G.flags.SIS_XMAS_Y2==='there'&&SOCIAL.has(ID,'SIS_XMAS_Y2')&&dRel(r0,r1)===J({fam:4,comf:4,npcRom:4})&&(((H.G.dateLog&&H.G.dateLog[ID]&&H.G.dateLog[ID].count)|0)===c0),dRel(r0,r1));
    at('2026-12-24',22.5); rules(); check('3-1. 去了：22:20 沒有「熱水我喝完了。兩杯。」',!dms().includes('熱水我喝完了。兩杯。')); }
  { setup('2026-12-23',21.05,'dorm','FRIEND'); dateSis(); rules(); PHONE.answer(H.G,'sisb4_xmas_y2_ask',0); const L=await play('ev_sis_xmas_y2',[1]);
    check('3-1. 「（收好，回去再看）」→「嗯。」；最後多一句旁白「（回到宿舍，你打開第一頁。只有一行：……）」',J(L.slice(-4))===J(['嗯。','十五分鐘到了。','（她說十五分鐘到了，可是沒有走。）','（回到宿舍，你打開第一頁。只有一行：「1/1　早上不要排事情。睡飽。」）'])&&!L.includes('……我說回去再看。'),J(L)); }
  { setup('2026-12-23',21.05,'dorm','FRIEND'); dateSis(); rules(); PHONE.answer(H.G,'sisb4_xmas_y2_ask',1); rules(); const a=dms().slice(-1)[0], q=OUT.get(H.G,'sisb4_xmas_y2'); at('2026-12-24',22.4); rules();
    check('3-1. 「明天晚上不行。」→「好。」、沒有出遊、記 no；12/24 22:20「📷（Café 門口，兩個紙杯）」「熱水我喝完了。兩杯。」',a==='好。'&&!q&&H.G.flags.SIS_XMAS_Y2==='no'&&J(dms().slice(-2))===J(['📷（Café 門口，兩個紙杯）','熱水我喝完了。兩杯。']),J(dms())); }
  { setup('2026-12-23',21.05,'dorm','FRIEND'); dateSis(); rules(); at('2026-12-24',22.4); rules(); const nr=H.G.flags.SIS_XMAS_Y2, nm=dms().slice(-1)[0];
    setup('2026-12-23',21.05,'dorm','FRIEND'); dateSis(); rules(); PHONE.answer(H.G,'sisb4_xmas_y2_ask',0); rules(); at('2026-12-24',22.3); for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); rules(); at('2026-12-24',22.4); rules();
    check('3-1. 沒回、說好了沒到：記 missed、22:20 那兩則',nr==='missed'&&nm==='熱水我喝完了。兩杯。'&&H.G.flags.SIS_XMAS_Y2==='missed'&&dms().slice(-1)[0]==='熱水我喝完了。兩杯。',J({nr,nm,f:H.G.flags.SIS_XMAS_Y2})); }
  /* 3-2 */
  { setup('2027-12-24',19,'dorm','FRIEND',{EXCHANGE_ROUTE:'US',SIS_XMAS_Y2:'there'}); dateSis(); rules(); const a=dms().length; at('2027-12-24',20.55); rules(); const m=PHONE.byAsk(H.G,'sisb4_xmas_y3_ask');
    check('3-2. 2027-12-24（五）20:30 私訊「九點，研究室。」「……今天只有我。」；回覆「好。」「今天晚上不行。」',a===0&&J(dms())===J(['九點，研究室。','……今天只有我。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','今天晚上不行。']),J(dms()));
    PHONE.answer(H.G,'sisb4_xmas_y3_ask',0); rules(); const q=OUT.get(H.G,'sisb4_xmas_y3'); const r0=relOf(); const L=await play('ev_sis_xmas_y3',[0]); const r1=relOf();
    check('3-2. 21:00 霖澤館・研究室（研究室的走廊底圖）：小聖誕樹、「（把大燈關掉，只留樹的燈）」→「這樣看不到字。」「……好。五分鐘。」；去年 Café 有來＝「去年是 Café 門口。今年是研究室。」；美國路線「……明年的今天，我們剛回來一天。」；「十二月二十三號的飛機。……我先查好了。」',
      !!q&&q.h===21&&q.day===H.D('2027-12-24')&&H.bgs.some(b=>b&&b.image==='assets/bg/linze_prof_hall.webp')&&J(L)===J(['（研究室只剩她一個人。門口她那張桌上，放著一棵手掌大的聖誕樹，燈一閃一閃。）','隔壁的學妹放的。她回家了，叫我幫她顧。','……樹要怎麼顧。','這樣看不到字。','……好。五分鐘。','去年是 Café 門口。今年是研究室。','……明年的今天，我們剛回來一天。','十二月二十三號的飛機。……我先查好了。','（你要走的時候，她沒有關那棵樹的燈。）']),J({q,L}));
    check('3-2. SIS_XMAS_Y3 there、記憶 SIS_XMAS_Y3、+4／+4／+4',H.G.flags.SIS_XMAS_Y3==='there'&&SOCIAL.has(ID,'SIS_XMAS_Y3')&&dRel(r0,r1)===J({fam:4,comf:4,npcRom:4}),dRel(r0,r1)); }
  { setup('2027-12-24',20.55,'dorm','FRIEND',{EXCHANGE_ROUTE:'TW'}); dateSis(); rules(); PHONE.answer(H.G,'sisb4_xmas_y3_ask',0); const L=await play('ev_sis_xmas_y3',[1]);
    check('3-2. 臺灣路線、去年沒來：「（坐在她旁邊，看她寫論文）」→旁白「（她寫了三行，刪了兩行。）」「你在旁邊，我刪得比較快。」；「如果三月的信是好消息，明年的今天，我剛回來一天。」；沒有「去年是 Café 門口。」',
      L.includes('（她寫了三行，刪了兩行。）')&&L.includes('你在旁邊，我刪得比較快。')&&L.includes('如果三月的信是好消息，明年的今天，我剛回來一天。')&&!L.includes('……明年的今天，我們剛回來一天。')&&!L.includes('去年是 Café 門口。今年是研究室。'),J(L)); }
  { setup('2027-12-24',20.55,'dorm','FRIEND'); dateSis(); rules(); PHONE.answer(H.G,'sisb4_xmas_y3_ask',1); rules(); const a=dms().slice(-1)[0]; at('2027-12-24',21.6); rules();
    check('3-2. 「今天晚上不行。」→「好。」；21:30「📷（研究室門口的桌上，一棵很小的聖誕樹）」「學妹的。我幫她顧。」',a==='好。'&&J(dms().slice(-2))===J(['📷（研究室門口的桌上，一棵很小的聖誕樹）','學妹的。我幫她顧。'])&&H.G.flags.SIS_XMAS_Y3==='no',J(dms())); }
  /* 3-3（企劃線 d0468be4，AA 14:2x 定案 A＋備援）：學姊交往版大四上那一頓固定 2028-12-24 18:30（兩條路線）；3-2 有來＝那一頓多兩句；
     12/24 晚上已經有別的約（排日子以前或以後才有）＝照現有規則往後讓，當晚 21:00 她私訊三則（3-2 有來才有）*/
  { const X3=['今天是二十四號。','去年在研究室說的。……剛回來一天。'], B=['時差還沒調好。我現在很想睡。','……可是這頓我不想錯過。'], E=['去年在研究室說的。剛回來一天。'];
    for(const x of X3.concat(E,['我做到了。','我們做到了。','……我做到了。','……我們做到了。'])) if(!inDoc(x)) check('3-3. 稿裡有「'+x+'」',false);
    const d24=H.D('2028-12-24');
    const flow=(route,there,busy)=>{ const G=setup('2028-12-23',9,'dorm','CLOSE',{EXCHANGE_ROUTE:route,SIS_XMAS_Y3:there?'there':'missed'}); dateSis();
      const other=()=>OUT.plan(G,{id:'t_other',ev:null,day:d24,h:19,late:0.25,place:'別的地方',title:'別的約',travel:'',travelH:0});   /* [前置] 12/24 19:00 別的出遊 */
      const tk=()=>{ STORY.phoneRules(GM); PHONE.tick(G); }; if(busy==='before') other(); tk(); at('2028-12-24',0.5); tk(); const day0=(TERMEND.rec(G,'Y4S1').gfDay||{})[ID];
      if(busy==='after') other(); at('2028-12-24',12.1); tk(); const inv=PHONE.sent(G,'te_gf_Y4S1_'+ID), day1=(TERMEND.rec(G,'Y4S1').gfDay||{})[ID]; at('2028-12-24',21.1); tk();
      return {day0,day1,inv,dm:dms().filter(t=>X3.includes(t)||/做到了/.test(t))}; };
    const tw=flow('TW',1), us=flow('US',1), nx=flow('TW',0);
    check('3-3. 學姊交往版大四上那一頓排在 2028-12-24（臺灣、美國路線一樣；12:00 她傳邀約）；21:00 沒有備援私訊',[tw,us,nx].every(r=>r.day0===d24&&r.day1===d24&&r.inv&&!r.dm.length),J({tw,us,nx}));
    const din=async(key,flags)=>{ H.fresh(key,18.5,'campus',Object.assign({met_sis:true},flags||{})); H.CLOSE(ID); dateSis(); if(STORY._bindGM) STORY._bindGM(GM); H.said=[]; H.picks=[0,0,0]; await TERMEND.dinner(GM,{id:'te_gf_Y4S1_'+ID,te:{term:'Y4S1',who:ID,kind:'gf'}}); return said(); };
    const after=(L,x)=>{ const i=L.indexOf(B[1]); return i>0&&L[i-1]===B[0]&&J(L.slice(i+1,i+1+x.length))===J(x)&&!L.slice(i+1+x.length).some(t=>/剛回來一天|做到了/.test(t)); };
    const dus=await din('2028-12-24',{SIS_XMAS_Y3:'there',EXCHANGE_ROUTE:'US'}), dtw=await din('2028-12-24',{SIS_XMAS_Y3:'there',EXCHANGE_ROUTE:'TW'}), dnx=await din('2028-12-24',{SIS_XMAS_Y3:'missed',EXCHANGE_ROUTE:'US'}), d26=await din('2028-12-26',{SIS_XMAS_Y3:'there',EXCHANGE_ROUTE:'US'});
    check('3-3. 12/24 那一頓、3-2 有來：兩句後面多「去年在研究室說的。剛回來一天。」「……我們做到了。」（美國）／「……我做到了。」（臺灣）',after(dus,[E[0],'……我們做到了。'])&&after(dtw,[E[0],'……我做到了。']),J({dus,dtw}));
    check('3-3. 3-2 沒來、往後讓到別天吃的：照原本兩句，不加',after(dnx,[])&&after(d26,[]),J({dnx,d26}));
    const bb=flow('TW',1,'before'), ba=flow('TW',1,'after'), bu=flow('US',1,'after'), bn=flow('TW',0,'before');
    check('3-3 備援. 12/24 晚上已經有別的約（排日子以前有、排好以後才有）：那一頓往後讓（12/24 不傳邀約），21:00 她私訊「今天是二十四號。」「去年在研究室說的。……剛回來一天。」＋「我做到了。」／美國路線「我們做到了。」',
      [bb,ba,bu].every(r=>r.day1>d24&&!r.inv)&&J(bb.dm)===J(X3.concat(['我做到了。']))&&J(ba.dm)===J(X3.concat(['我做到了。']))&&J(bu.dm)===J(X3.concat(['我們做到了。'])),J({bb,ba,bu}));
    check('3-3 備援. 3-2 沒來的：往後讓也沒有私訊',bn.day1>d24&&!bn.dm.length,J(bn)); }
  { const w=TERMEND.windowOf('Y3S1'); H.fresh('2027-12-23',9,'dorm',{}); const x=H.D('2027-12-24');
    const gf=TERMEND.dinnerDay(H.G,w,{h:18.5,wd:5,gf:true},ID), plain=TERMEND.dinnerDay(H.G,w,{h:18.5,wd:5},ID), zr=TERMEND.dinnerDay(H.G,w,{h:18.5,wd:5,gf:true},'heroine_02');
    check('3. 學期末那頓（學姊交往版）挑日子避開 12/24：大三上排在週五的話跳過 12/24 改下週五；不是女朋友版、別人照舊；表上是大二上、大三上',gf!==x&&gf===x+7&&plain===x&&zr===x&&J((TERMEND.XMAS_GF||{})[ID])===J({Y2S1:'2026-12-24',Y3S1:'2027-12-24'}),J({gf,plain,zr,x})); }
  /* 3-4 */
  { setup('2027-02-13',20,'dorm','FRIEND'); dateSis(); H.G.flags.SIS_CRACK=2; at('2027-02-13',21.05); rules(); const m=PHONE.byAsk(H.G,'sisb4_vday_y2_ask');
    check('3-4. 2027-02-13（六）21:00 私訊「明天下午兩點，植物園門口。」「我想走一走。不讀書的那種。」；回覆「好。」「明天不行。」',J(dms())===J(['明天下午兩點，植物園門口。','我想走一走。不讀書的那種。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','明天不行。']),J(dms()));
    PHONE.answer(H.G,'sisb4_vday_y2_ask',0); rules(); const q=OUT.get(H.G,'sisb4_vday_y2'); const r0=relOf(); const L=await play('ev_sis_vday_y2',[1]); const r1=relOf();
    check('3-4. 2/14 14:00 臺北植物園（深色底＋字幕）：「一區一分鐘。」「……這樣才走得完。」；「妳最喜歡哪一區？」→「荷花池。」「二月沒有荷花，只有水。」「……我喜歡看什麼都還沒長出來的時候。」；最後計畫本「兩個人」',
      !!q&&q.h===14&&q.day===H.D('2027-02-14')&&J(L)===J(['（植物園分成很多區，每一區門口都有一塊說明牌。她每一塊都停下來讀，大概一分鐘。）','一區一分鐘。','……這樣才走得完。','荷花池。','二月沒有荷花，只有水。','……我喜歡看什麼都還沒長出來的時候。','（出來的時候天已經暗了。她在計畫本二月十四號那一格寫了「植物園」，後面又加了三個字：「兩個人」。）'])&&J(H.opts[0])===J(['（在一棵樹下面停了很久）','「妳最喜歡哪一區？」']),J({q,L}));
    check('3-4. SIS_VDAY_Y2 went、記憶 SIS_VDAY_Y2、情人節（交往中）熟悉 +3、自在 +6、她的戀愛 +5、裂縫 -1（2→1）',H.G.flags.SIS_VDAY_Y2==='went'&&SOCIAL.has(ID,'SIS_VDAY_Y2')&&dRel(r0,r1)===J({fam:3,comf:6,npcRom:5})&&H.G.flags.SIS_CRACK===1,dRel(r0,r1)+' crack '+H.G.flags.SIS_CRACK); }
  { setup('2027-02-13',21.05,'dorm','FRIEND'); dateSis(); rules(); PHONE.answer(H.G,'sisb4_vday_y2_ask',0); const L=await play('ev_sis_vday_y2',[0]);
    setup('2027-02-13',21.05,'dorm','FRIEND'); dateSis(); rules(); PHONE.answer(H.G,'sisb4_vday_y2_ask',1); rules(); const a=dms().slice(-1)[0]; at('2027-02-14',17.05); rules();
    check('3-4. 「（在一棵樹下面停了很久）」→旁白「（她走到下一區，又走回來，站在你旁邊。）」「……超過一分鐘了。」「沒關係。今天不算時間。」；「明天不行。」→「好。我自己去。」、17:00「📷（荷花池，只有水）」「走完了。荷花池，下次再看。」',
      J(L.slice(3,7))===J(['（她走到下一區，又走回來，站在你旁邊。）','……超過一分鐘了。','沒關係。今天不算時間。','（出來的時候天已經暗了。她在計畫本二月十四號那一格寫了「植物園」，後面又加了三個字：「兩個人」。）'])&&a==='好。我自己去。'&&J(dms().slice(-2))===J(['📷（荷花池，只有水）','走完了。荷花池，下次再看。'])&&H.G.flags.SIS_VDAY_Y2==='no',J({L,d:dms()})); }
  /* 3-5 */
  { setup('2028-02-13',20,'dorm','FRIEND'); dateSis(); at('2028-02-13',21.05); rules(); const m=PHONE.byAsk(H.G,'sisb4_vday_y3_ask');
    check('3-5. 2028-02-13（日）21:00 私訊「明天是我寒假那一天的假。」「早上十點，公館捷運站二號出口。其他的沒排。」；回覆「好。」「明天不行。」',J(dms())===J(['明天是我寒假那一天的假。','早上十點，公館捷運站二號出口。其他的沒排。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','明天不行。']),J(dms()));
    PHONE.answer(H.G,'sisb4_vday_y3_ask',0); rules(); const q=OUT.get(H.G,'sisb4_vday_y3'); H.bgs=[]; const r0=relOf(); const L=await play('ev_sis_vday_y3',[1]); const r1=relOf(), E=ev('ev_sis_vday_y3');
    check('3-5. 2/14 10:00 公館捷運站（走路約 15 分鐘）：底圖 gongguan → 公車上（深色底）→ 終點站（country_road）；「（陪她看窗外）」→「（過了一個隧道，她的頭靠在你肩膀上。）」；湯圓、「回去以後，那一格，我要畫一個勾。」；時間推到 15:00 左右（hours 5）',
      !!q&&q.h===10&&q.travelH===0.25&&E.hours===5&&J(L)===J(['（她站在出口，手上沒有計畫本。）','今天沒帶。放在家裡了。','第一班來的公車，我們就上去。坐到最後一站。','（她一開始看著窗外，小聲念站名。念到第七站，就不念了。）','（過了一個隧道，她的頭靠在你肩膀上。）','（終點站在山腳下。站牌旁邊有一家賣湯圓的小店，只有兩張桌子。）','……情人節吃湯圓。','我記一下。明年不要再這樣排。','（她說不要再這樣排，可是一直在笑。）','回去以後，那一格，我要畫一個勾。'])
      &&J(H.bgs.slice(-3))===J([{image:'assets/bg/gongguan.webp'},'dark',{image:'assets/bg/country_road.webp'}]),J({q,L,bgs:H.bgs}));
    check('3-5. SIS_VDAY_Y3 went、記憶 SIS_VDAY_Y3、+3／+6／+5、裂縫已經是 0 不變',H.G.flags.SIS_VDAY_Y3==='went'&&SOCIAL.has(ID,'SIS_VDAY_Y3')&&dRel(r0,r1)===J({fam:3,comf:6,npcRom:5})&&!(H.G.flags.SIS_CRACK<0),dRel(r0,r1)); }
  { setup('2028-02-13',21.05,'dorm','FRIEND'); dateSis(); rules(); PHONE.answer(H.G,'sisb4_vday_y3_ask',0); const L=await play('ev_sis_vday_y3',[0]);
    setup('2028-02-13',21.05,'dorm','FRIEND'); dateSis(); rules(); PHONE.answer(H.G,'sisb4_vday_y3_ask',1); rules(); const a=dms().slice(-1)[0]; at('2028-02-14',15.05); rules();
    check('3-5. 「（拿出手機查終點站）」→「不要查。」「……今天不要查。」；「明天不行。」→「好。那一格先空著。」、15:00「📷（一碗湯圓）」「坐到終點站了。有湯圓。」',
      J(L.slice(4,6))===J(['不要查。','……今天不要查。'])&&a==='好。那一格先空著。'&&J(dms().slice(-2))===J(['📷（一碗湯圓）','坐到終點站了。有湯圓。']),J({L,d:dms()})); }
  /* 3-6 */
  { setup('2029-02-14',9,'dorm','CLOSE',{SIS_VDAY_Y3:'went'}); dateSis(); rules(); const q=OUT.get(H.G,'sisb4_vday_y4'); const r0=relOf(); const L=await play('ev_sis_vday_y4',[1]); const r1=relOf();
    check('3-6. 2029-02-14（三）22:30 她打來（那一天一開始就排好；電話、接起來）',!!q&&q.h===22.5&&q.call===true&&q.verb==='接起來'&&q.place==='電話'&&q.day===H.D('2029-02-14'),J(q));
    check('3-6. 「我爸剛去睡。我在陽台。」「……情人節快樂。」；去年有去的多「去年那家湯圓，我前幾天又想到。」「……想不起來那一站叫什麼。」；「（陪她在電話裡待著）」→旁白「（她沒有掛。……她才說：）」「好。我進去了。」',
      J(L)===J(['我爸剛去睡。我在陽台。','……情人節快樂。','去年那家湯圓，我前幾天又想到。','……想不起來那一站叫什麼。','今年的二月十四號，我什麼都沒排。','……過年，一直在吃。','（她沒有掛。你聽著她那邊的風聲，和客廳沒關的電視。過了五分鐘，她才說：）','好。我進去了。'])&&J(H.opts[0])===J(['「開學以後，我們再補一天。」','（陪她在電話裡待著）']),J(L));
    check('3-6. SIS_VDAY_Y4 call、記憶 SIS_VDAY_Y4、熟悉 +2、自在 +3、她的戀愛 +3',H.G.flags.SIS_VDAY_Y4==='call'&&SOCIAL.has(ID,'SIS_VDAY_Y4')&&dRel(r0,r1)===J({fam:2,comf:3,npcRom:3}),dRel(r0,r1)); }
  { setup('2029-02-14',9,'dorm','CLOSE'); dateSis(); rules(); const L=await play('ev_sis_vday_y4',[0]);
    setup('2029-02-14',9,'dorm','CLOSE'); dateSis(); rules(); at('2029-02-14',22.5); const q=OUT.get(H.G,'sisb4_vday_y4'); q.state='missed'; OUT.onMissed(GM,q); rules(); const early=dms().length; at('2029-02-14',22.7); rules();
    check('3-6. 去年沒去的沒有湯圓那兩句；「開學以後，我們再補一天。」→「嗯。……那一天我來寫。」',!L.includes('去年那家湯圓，我前幾天又想到。')&&L[L.length-1]==='嗯。……那一天我來寫。',J(L));
    check('3-6. 沒接（先不接）：記 missed、22:40 她傳「情人節快樂。」「我在陽台吹風。……你早點睡。」',H.G.flags.SIS_VDAY_Y4==='missed'&&early===0&&J(dms())===J(['情人節快樂。','我在陽台吹風。……你早點睡。']),J(dms())); }
  /* 沒交往的都沒有 */
  { const r=[]; for(const [k,h] of [['2026-12-23',21.05],['2027-12-24',20.55],['2027-02-13',21.05],['2028-02-13',21.05]]){ setup(k,h,'dorm','CLOSE'); rules(); r.push(dms().length===0); }
    setup('2029-02-14',9,'dorm','CLOSE'); rules(); r.push(!OUT.get(H.G,'sisb4_vday_y4'));
    setup('2026-12-23',21.05,'dorm','FRIEND'); dateSis(); ROM.end(H.G,ID,'apart_talk'); rules(); r.push(dms().length===0);   /* 交往過、現在分開了 */
    check('3. 沒交往的存檔（含分開了的）：五場都沒有（私訊、電話）',r.every(x=>x),J(r)); }
  });

  /* ======================= 4 重新開始：她的三件事 ======================= */
  await sec('4',async()=>{
  const stage6=()=>{ H.CLOSE(ID); const r=SOCIAL.rel(ID); r.npcRom=60; r.rom=40; };
  const brk=(how,flags)=>{ setup('2028-03-01',10,'library','CLOSE',Object.assign({EXCHANGE_ROUTE:'TW'},flags||{})); ROM.start(H.G,ID); const Lg=DATE.log(H.G,ID); Lg.count=5; Lg.wish=true;
    if(how==='catch'){ const R=ROM.get(H.G,ID); H.G.flags['dating_'+ID]=false; R.status='friend_after_catch'; R.restartDay=H.G.day+21; R.history.push({ev:'end',at:ROM.when(H.G),day:H.G.day,how:'told'}); }
    else ROM.end(H.G,ID,'apart_talk'); return H.G.day; };
  let tn=0; const date=async(G)=>{ const t={trip:'T9'+String(++tn).padStart(3,'0'),who:ID,locs:['D15'],day:G.day,depart:18,back:22,transport:'car',departed:true,status:'booked',spots:['D15.view']};
    H.opts=[]; return DATE.settle(GM,t,['D15.view'],[{id:'D15.view',name:'夜景'}],1,G.money|0); };
  { const d0=brk('ex'); at('2028-04-11',10); const a=ev1(); at('2028-04-12',10); const b=ev1(); const r0=relOf(); const {L,O}=await pre([1]); const r1=relOf(), c=ev1();
    check('4-1. 一般分開（前任）：滿 6 週前（41 天）找她不演；滿 6 週（42 天，閱覽室）演三件事',a===null&&b==='ev_sis_three_conditions',J({a,b}));
    check('4-1. 「三件事。」「一，有事先跟我說。不要讓我自己猜。」「二，我要時間。不是一週，是我說好的那天。」「三，……三我還沒想好。想好了告訴你。」；「第三件，我等妳。」→「……不要說得那麼好聽。等就是了。」（AA_512 6-3：第二句改「還有，我要時間。等到我說好的那天。」）',
      J(L)===J(['有事先跟我說。不要讓我自己猜。',AA512_41,'……其他的，我還沒想好。想好了告訴你。','……不要說得那麼好聽。等就是了。'])&&J(O[0])===J(['「好。」','「我等妳。」']),J({L,O}));
    check('4-1. 記 SIS_REBUILD（那天）、記憶 SIS_REBUILD、不改關係數值；只演一次',H.G.flags.SIS_REBUILD===H.D('2028-04-12')&&SOCIAL.has(ID,'SIS_REBUILD')&&dRel(r0,r1)===J({})&&c===null&&d0===H.D('2028-03-01'),J({R:H.G.flags.SIS_REBUILD,d:dRel(r0,r1),c})); }
  { brk('catch'); at('2028-04-12',20); H.G.zone='cafe'; const {L}=await pre([0]);
    check('4-1. 被發現退回朋友的：「一，我不要再從別人那裡聽到你的事。」；「好。」→「嗯。」（第二句照 AA_512 6-3）',J(L)===J(['我不要再從別人那裡聽到你的事。',AA512_41,'……其他的，我還沒想好。想好了告訴你。','嗯。']),J(L)); }
  { const r=[];
    brk('ex'); at('2028-04-12',10); H.G.flags.dating_kexin=true; r.push(ev1());   /* 祐廷現在在和別人交往 */
    brk('ex'); at('2028-04-12',10); H.rel(ID,30,5,0); r.push(ev1());   /* 只有熟悉，不到朋友 */
    brk('ex'); at('2028-04-12',10); H.G.zone='campus'; r.push(ev1());   /* 不在她讀書的地方 */
    setup('2028-04-12',10,'library','CLOSE'); r.push(ev1());   /* 沒分開過 */
    check('4-1. 祐廷在和別人交往、她不到朋友、不在她讀書的地方、沒分開過：都不演',r.every(x=>x===null),J(r)); }
  /* 4-2：沒演三件事沒有告白；演過以後兩次正式校外約會、第二次結尾告白＝答應 */
  { brk('ex'); at('2028-04-12',10); stage6(); H.G.zone='dorm'; const c0=DATE.canConfess(H.G,ID); await date(H.G); H.G.day++; await date(H.G); const O1=H.opts.flat(), c1=DATE.canConfess(H.G,ID);
    check('4-2. 分開以後沒演三件事：告白的條件不成立（why rebuild），正式約會兩次以後結尾也沒有「（告訴她）」',c0.ok===false&&c0.why==='rebuild'&&c1.why==='rebuild'&&!O1.includes('（告訴她）')&&!H.G.flags.dating_heroine_05,J({c0,c1,O1})); }
  { brk('ex'); at('2028-04-12',10); await pre([0]); stage6(); H.G.zone='dorm'; const c0=DATE.canConfess(H.G,ID);
    H.said=[]; await date(H.G); const O1=H.opts.flat(), c1=DATE.canConfess(H.G,ID);
    H.G.day+=3; H.said=[]; H.picks=[0,0]; await date(H.G); const O2=H.opts.flat(), L=said();
    check('4-2. 三件事以後：第一次正式校外約會的結尾沒有告白（不要求四次：次數從三件事那天起算）',c0.ok===false&&c0.why==='count'&&c0.count===0&&!O1.includes('（告訴她）')&&c1.why==='count'&&c1.count===1,J({c0,c1,O1}));
    check('4-2. 第二次那一趟的結尾：「（告訴她）」→ 答應：「你做到了。」「……我也想好了。」「其他的，想了很久。……沒有了。」（AA_512 6-2 加的）「這次，我選你。」（AA_398 第 47 列）（不是第一次的「考試那時候就有一點了」）；交往中',
      O2.includes('（告訴她）')&&L.includes('你做到了。')&&L[L.indexOf('你做到了。')+1]==='……我也想好了。'&&L[L.indexOf('你做到了。')+2]==='其他的，想了很久。……沒有了。'&&doc512.includes('> 學姊：其他的，想了很久。……沒有了。')&&L[L.indexOf('你做到了。')+3]==='這次，我選你。'&&!L.includes('其實我也是。考試那時候就有一點了，只是那時候不想想這個。')&&H.G.flags.dating_heroine_05===true&&ROM.get(H.G,ID).status==='dating',J({O2,L})); }
  { brk('ex'); at('2028-04-12',10); await pre([0]); stage6(); H.G.zone='dorm'; await date(H.G); H.G.day+=3; H.picks=[0,0]; await date(H.G); const back=H.G.flags.dating_heroine_05===true, dB=H.G.day;   /* 重新開始了 */
    ROM.end(H.G,ID,'apart_talk'); H.G.zone='library'; at(CALENDAR.dateOf(dB+41).key,10); const a=ev1(), rb=X()&&X().rebuild(H.G), c=DATE.canConfess(H.G,ID); at(CALENDAR.dateOf(dB+42).key,10); const b=ev1();
    check('4-1. 重新開始以後又分開：上一次的三件事不算這一次——沒有告白（why rebuild），滿 6 週再演一次三件事（BB_122 9-5：她永遠保留攻略可能）',back&&a===null&&!!rb&&rb.done===false&&c.why==='rebuild'&&b==='ev_sis_three_conditions',J({back,a,rb,c,b})); }
  { setup('2028-04-12',10,'dorm','CLOSE'); stage6(); const Lg=DATE.log(H.G,ID); Lg.count=2; Lg.wish=true; const a=DATE.canConfess(H.G,ID); Lg.count=4; const b=DATE.canConfess(H.G,ID);
    check('4-2. 沒分開過的照一般條件（四次、心願、第 6 階）',a.why==='count'&&a.count===2&&b.ok===true,J({a,b})); }
  { brk('ex'); at('2028-04-12',10); stage6(); const w=TERMEND.windowOf('Y3S2'); const h0=TERMEND.heartWhy(H.G,ID,w); await pre([0]); const h1=TERMEND.heartWhy(H.G,ID,w);
    setup('2028-04-12',10,'dorm','CLOSE'); stage6(); const Lg=DATE.log(H.G,ID); Lg.count=4; Lg.wish=true; const h2=TERMEND.heartWhy(H.G,ID,w);
    check('4-2. 期末的心意邀約（第一次的台詞）不給分開過的玩家（演三件事前後都不發）；沒分開過的照舊',h0===false&&h1===false&&h2===true,J({h0,h1,h2})); }
  /* AA_386 第 6 節（AA 10-22 13:4x 回十個解讀）：植物園 4 小時；演過三件事、還沒重新交往＝人物頁提示「她在等她說好的那一天」；分開以後又重新交往的，第 1 節窗口還在照常演 */
  check('6. 3-4 植物園 4 小時（14:00～18:00，「出來的時候天已經暗了」）',ev('ev_sis_vday_y2').hours===4&&inDoc('植物園 3.5 小時改 4 小時'),String(ev('ev_sis_vday_y2').hours));
  { brk('ex'); at('2028-04-12',10); const h0=DATE.hint(H.G,ID); await pre([0]); const h1=DATE.hint(H.G,ID); stage6(); H.G.zone='dorm'; await date(H.G); H.G.day+=3; H.picks=[0,0]; await date(H.G); const h2=DATE.hint(H.G,ID), back=H.G.flags.dating_heroine_05===true;
    check('6. 人物頁提示：演過三件事、還沒重新交往＝「她在等她說好的那一天」；演之前、重新交往以後不是這一句',h1==='她在等她說好的那一天'&&h0!=='她在等她說好的那一天'&&back&&h2!=='她在等她說好的那一天'&&inDoc('她在等她說好的那一天'),J({h0,h1,h2,back}));
    H.G.zone='library'; at('2028-05-02',10); const e=ev1();
    check('6. 分開以後又重新交往（現在交往中）：第 1 節的窗口還在＝照常演（大三下第 11 週 1-4）',back&&e==='ev_sis_adv_y4',J({back,e})); }
  check('4-2. 答應的三句在稿裡（AA_386 4-2；AA_398 第 47 列改字）',doc398.includes('「你做到了。」「……我也想好了。」「這次，我選你。」'));
  });

  /* ======================= 5 閒聊階梯（白名單 ladder_bb_y3s1／y3s2 @5ef4e291）======================= */
  await sec('5',async()=>{
  const st=(t,id)=>(((LADDER.byTerm||{})[t]||{})[ID]||{steps:[]}).steps.find(s=>s.id===id);
  const s58=st('Y3S1','S5-L8'), s61=st('Y3S2','S6-L1');
  check('5. ladder.js 從白名單 5ef4e291 匯入（source 有 5ef4e291）',/5ef4e291/.test(LADDER.source||''),LADDER.source);
  { setup('2027-12-13',20,'cafe','FRIEND'); const a=STORY.ladLines(s58,H.G,ID); dateSis(); const b=STORY.ladLines(s58,H.G,ID);
    check('5. 大三上 S5-L8：交往中的多一句（extraIf）「……哪一天，到時候傳訊息給你。」；其他人照舊',!!s58&&J(a)===J(['寒假我想把論文寫到第三章。然後放一天假。','那一天我已經寫進計畫本了。'])&&J(b)===J(a.concat(['……哪一天，到時候傳訊息給你。'])),J({a,b})); }
  { const d=CALENDAR.termDays('Y3S2').from+1, key=CALENDAR.dateOf(d).key; setup(key,10,'library','FRIEND'); const a=STORY.ladNext(H.G,ID); setup(key,10,'library','FRIEND',{SIS_VDAY_Y3:'went'}); const b=STORY.ladNext(H.G,ID);
    check('5. 大三下 S6-L1：2/14 坐公車到終點站的（SIS_VDAY_Y3 went）直接算過（skipIf）；其他人照舊從 S6-L1 開始',!!s61&&J(s61.skipIf)===J({flagIs:{SIS_VDAY_Y3:'went'}})&&!!a&&a.id==='S6-L1'&&(!b||b.id!=='S6-L1'),J({a:a&&a.id,b:b&&b.id})); }
  });
  H.done(); })().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });

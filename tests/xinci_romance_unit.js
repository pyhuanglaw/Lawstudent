// 吳芯慈可以交往（很難）：XINCI-ROMANCE-1030（使用者 2026-10-30 X139「芯慈可攻略 但要很難達成 請AA規劃」；AA_537 企劃線 2f523e21a、AA_537b 86659bbc1）——不需要瀏覽器。
//   第 1 段（告白）＋第 4 段（一）（AA_537b 約會台詞）：
//   0  src/xcrom3d.js 載得到、index.html；兩個開關（G10 以安、多段）在 XCROM.CFG；DATE.HEROINES、YES_LINE 75、心願 D04（晚上場）、告白要 6 次；confess_lines、termend_lines 的字照稿
//   1  門檻 G1～G10：每一道單獨拿掉＝心意邀約不發（也不傳 NOPE）；全過＝發；最早大三下（慈 6 以後）；跟以安交往過＝不發（開關關掉＝發）
//   2  學期末回家的路上：玩家先說——她先問「你現在有在跟誰交往嗎。」→ 祐廷「沒有。」→ 戀愛 ≥ 75 答應（交往）、不到＝notYet（下學期第二次）；
//      有別的交往對象（她不知道）＝others 後兩行、不交往；她先說（先不說）——she 最後一句就是問題，有對象＝others、沒有＝「沒有。」再出好／讓我想想
//   3  她知道你有別人＝心意邀約不發、時段第一天傳 NOPE.knows；多段的開關打開＝照一般的知情條件
//   4  AA_537b 第 1～3 節（date_lines.js）：十一個 key、128 點喜好、15 句不喜歡、八個常去地點，逐字對稿
//   5  （拿掉）3-5、3-6 加在慈 6 那一場的兩段：使用者 10-30 否決「第一名／第二名」劇情，r2y3b_events.js 還原
//   6  第 2 段：3-1 大二上麵店補問（G2）、3-2 大二下半夜提醒（G3）、3-5 後補（大四上第 6 週週三）
//  11  心願午夜場：DATE_WISH 登記、22:30 出發 02:30 回來（只這一場）、只有午夜場算心願、她週五 00:40 主動約、那一場照稿、隔天睡到十點
//  10  G5 半夜訊息：十六則逐字、每週一則（週三／週日輪流、00:30～01:30）、A→B、B3／B8、30 分鐘內回才算、mention、線關上不傳、交往換 L、大二下第 6 週那一則
//   9  第 2 節：和以安分開那晚那一則拿掉（使用者選照樣可以開、AA-B 17:18 不換）
//   8  第 2 段：3-3 G4b 補演的玩家大二下第 8 週週三 00:30 的電話（接＝XC_CALL1、不接＝隔天早上「打錯了。」）
//   7  第 2 段：3-4 G7 當天約（慈 5 以後第一個週三、答應＝18:00 家常菜、不答應＝大三下第 6 週再一次、日本路線改大四上第 2 週）
// 用法：node tests/xinci_romance_unit.js（稿用 git show 讀：在沒有 .git 的目錄跑時，設環境變數 XC_GIT_DIR＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,100)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{};
const XC='classmate_xinci', AN='heroine_01', ZQ='heroine_04';
const X=()=>typeof XCROM!=='undefined'?XCROM:null;
const D=k=>STORY.dayOfKey(k);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const T=()=>H.said.map(s=>s.t);
const doc=(sha,file)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+file+'"',{cwd:process.env.XC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const DOC537=doc('2f523e21a','AA_537_吳芯慈可攻略_很難_路線企劃.md'), DOC537b=doc('86659bbc1','AA_537b_吳芯慈_第二份_約會台詞_校外地點_期末飯_節日.md');
const DOC548=doc('8e0de1663','AA_548_芯慈戀愛線重寫_門檻與半夜訊息.md');   /* AA_548（芯慈新個性以後重寫：門檻、新時刻、半夜訊息八則、others 一句）取代 AA_537 第 1～3 節、AA_537b 第 9 節靠「第二名」的部分 */
/* 全部門檻都過的存檔（大三下期末 2028-06-10，時段 6/8～6/18）*/
const full=(over,key)=>{ const G=H.fresh(key||'2028-06-10',20,'campus',{introDone:true,XC_NIGHT:6,XC5_RECONCILE:true,XC_SAMEDAY:true,XC_BLANK:true});
  G.events.done.ev_xinci_notes=1; G.events.done.ev_xinci_first_place=1; (G.contacts||(G.contacts={}))[XC]=D('2025-10-20');
  SOCIAL.remember(XC,'FIRST_MET','camp'); SOCIAL.remember(XC,'TALKED_FAMILY','雙主修是家裡要的'); SOCIAL.remember(XC,'XINCI_SECOND','');
  (G.l118||(G.l118={})); G.l118.once={H7c:D('2025-10-02')};
  const r=SOCIAL.rel(XC); r.fam=70; r.trust=62; r.comf=50; r.npcRom=76; r.rom=40;
  const L=DATE.log(G,XC); L.count=6; L.wish=true; L.wishKnown=true;
  if(over) over(G); return G; };
const heart=()=>TERMEND.heartWhy(H.G,XC,TERMEND.windowOf('Y3S2'));
const walk=async(picks,term)=>{ H.said=[]; H.opts=[]; H.picks=picks.slice(); return TERMEND.walkHome(GM,XC,term||'Y3S2'); };

(async()=>{
  await sec('00',()=>{ X().setOn(false); check('00. 開關關掉的時候（XCROM.setOn(false)；遊戲預設 2026-10-31 起是打開，見第 12 節）：DATE.HEROINES 沒有芯慈、沒有心願事件、事件沒進 STORY_EVENTS',!!X()&&X().ON===false&&!DATE.HEROINES.includes(XC)&&!DATE_WISH.events[XC]&&!STORY_EVENTS.some(e=>['ev_xc_g2_dad','ev_xc_sameday','ev_xc_call1'].includes(e.id)));
    const G=H.fresh('2028-06-10',20,'campus',{introDone:true,XC_NIGHT:9,XC5_RECONCILE:true,XC_SAMEDAY:true,XC_BLANK:true}); G.events.done.ev_xinci_notes=1; G.events.done.ev_xinci_first_place=1; (G.contacts||(G.contacts={}))[XC]=1;
    SOCIAL.remember(XC,'TALKED_FAMILY',''); SOCIAL.remember(XC,'XINCI_SECOND',''); G.l118={once:{H7c:1}}; Object.assign(SOCIAL.rel(XC),{fam:70,trust:62,comf:50,npcRom:76,rom:40}); Object.assign(DATE.log(G,XC),{count:6,wish:true,wishKnown:true});
    check('00. 關著的時候：門檻全過的存檔也不發心意邀約、告白選項藏著、半夜訊息不傳',TERMEND.heartWhy(G,XC,TERMEND.windowOf('Y3S2'))===false&&CONFESS_LINES[XC].hideIf(G)===true&&(STORY.phoneRules(GM),PHONE.tick(G),!(G.msgs||[]).some(m=>/^xcn_|^xc_/.test(m.tag||''))));
    { const IDS=['ev_xinci_second','ev_xinci_second_b1','ev_xinci_an_answers','ev_xinci_an_answers_far','ev_xinci_first_place'], E=id=>STORY_EVENTS.find(e=>e.id===id);
      const txt=JSON.stringify(IDS.map(id=>E(id)&&E(id).dialogue));
      check('00. 慈 3、慈 5、慈 6 照 AA_547 新稿打開（XCROM.OLD true；使用者 10-30 19:2x 點選）：慈 3「凌晨的便利商店」、慈 6「暑期實習」；慈 4 ev_xinci_bad_line 拿掉；台詞裡沒有「第二名」「第一名」「補習班」「排名」',
        X().OLD===true&&IDS.every(id=>!!E(id))&&!E('ev_xinci_bad_line')&&E('ev_xinci_second').title==='凌晨的便利商店'&&E('ev_xinci_first_place').title==='暑期實習'&&!/第二名|第一名|補習班|排名/.test(txt),
        JSON.stringify(IDS.map(id=>[id,!!E(id),E(id)&&E(id).title]))); }
    X().setOn(true); });   /* 下面測關著的程式本身（AA 重寫以前照舊能用）*/
  await sec(0,()=>{ check('0. 全部的檔載入沒有錯誤；XCROM 載得到；setOn(true) 以後 DATE.HEROINES 有芯慈、心願事件、事件都在',!loadErr.length&&!!X()&&X().ON===true&&DATE.HEROINES.includes(XC)&&!!DATE_WISH.events[XC]&&STORY_EVENTS.some(e=>e.id==='ev_xc_sameday'),J(loadErr));
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), a=s=>html.indexOf(s);
    check('0. index.html：xcrom3d.js 在 date3d.js、termend3d.js、story3d.js 以後、GAME.boot() 以前',a('src/xcrom3d.js')>Math.max(a('src/date3d.js'),a('src/termend3d.js'),a('src/story3d.js'))&&a('src/xcrom3d.js')<a('GAME.boot()'));
    check('0. 開關集中在 XCROM.CFG：G10 拿掉（noAnEx false 已經沒有用）；只要沒騙她就接受＝noOpen false（使用者 10-31 00:0x 點選，AA_548 第 7 節）',J(X().CFG)===J({noAnEx:false,noOpen:false}));
    check('0. DATE.HEROINES 有芯慈；YES_LINE 75；心願地點 D04、要午夜場（DATE.MIDNIGHT）；告白要 6 次正式約會',DATE.HEROINES.includes(XC)&&DATE.YES_LINE[XC]===75&&DATE.wishOf(XC)==='D04'&&!!DATE.MIDNIGHT[XC]&&DATE.MIDNIGHT[XC].loc==='D04'&&DATE.COUNT_NEED[XC]===6);
    const C=CONFESS_LINES[XC];
    check('0. confess_lines（AA_537 第 4 節）：say、三句、yes、notYet、unwilling 照稿、others 拿掉（AA_548 第 7 節）；notYetFlag XC_NOT_YET',!!C&&C.notYetFlag==='XC_NOT_YET'&&[].concat(C.say,C.yes,C.notYet,C.unwilling).every(x=>{ const t=typeof x==='string'?x:x.text; return DOC537.includes(t)||DOC548.includes(t); })&&C.others===undefined&&C.yes.length===4&&C.choice.length===3,'');
    const Hx=TERMEND_LINES.HEART[XC];
    const strs=[Hx.invite,Hx.decline,Hx.table,Hx.think,Hx.invite2].concat(Hx.walk,Hx.she,Hx.she2,Hx.yes2);   /* askFirst／noOther／othersTail 拿掉（AA_548 第 7 節：她不問）*/
    check('0. termend_lines HEART.classmate_xinci（AA_537b 第 7 節；othersTail 照 AA_548 第 4 節）：每一句都在稿裡；巷口家常菜 18:00、羅斯福路・往公館站',!!Hx&&strs.every(t=>DOC537b.includes(t)||DOC537.includes(t)||DOC548.includes(t))&&Hx.placeName==='巷口家常菜'&&Hx.h===18&&Hx.walkPlace==='羅斯福路・往公館站',J(strs.filter(t=>!DOC537b.includes(t)&&!DOC537.includes(t)&&!DOC548.includes(t))));
    check('0. NOPE 只留 low（AA_548 第 7 節：knows 拿掉）；舊的「今天的我排好了」作廢＝遊戲裡沒有',!TERMEND_LINES.NOPE.knows[XC]&&TERMEND_LINES.NOPE.low[XC]==='期末考完，我想先一個人待幾天。……下學期。'&&!TERMEND_LINES.NOPE.partner[XC]&&!fs.readFileSync(path.join(H.ROOT,'src/data/termend_lines.js'),'utf8').includes('今天的我排好了')); });

  /* ===== 第 1 節：門檻 ===== */
  await sec(1,()=>{ full(); const g=X().gates(H.G);
    check('1. 全部門檻都過的存檔：G1～G10 都 true、心意邀約發（heartWhy true）',Object.values(g).every(Boolean)&&heart()===true,J(g));
    const OFF={G1:G=>{ delete G.contacts[XC]; },G2:G=>{ G.social.mem[XC]=G.social.mem[XC].filter(m=>m.tag!=='TALKED_FAMILY'); },G3:G=>{ G.l118.once={}; },G4:G=>{ G.flags.XC_FIX='yes'; },
      G5:G=>{ G.flags.XC_NIGHT=5; },G6:G=>{ delete G.flags.XC5_RECONCILE; },G7:G=>{ delete G.flags.XC_SAMEDAY; },G8:G=>{ delete G.flags.XC_BLANK; },
      G9a:G=>{ SOCIAL.rel(XC).npcRom=69; },G9b:G=>{ SOCIAL.rel(XC).trust=59; },G9c:G=>{ DATE.log(G,XC).count=5; },G9d:G=>{ DATE.log(G,XC).wish=false; }};
    const bad=[]; for(const k of Object.keys(OFF)){ full(null); OFF[k](H.G); if(heart()!==false) bad.push(k); H.G.flags.NOPE_SENT=0; }
    check('1. 每一道單獨拿掉＝不發、也不傳 NOPE（heartWhy false）：G1 聯絡方式、G2、G3 H7c、G4（補演沒接電話）、G5 5 次、G6、G7、G8、G9 戀愛 69／信任 59／5 次／沒去心願',bad.length===0,J(bad));
    full(); H.G.flags.XC_FIX='yes'; H.G.flags.XC_CALL1=true; check('1. G4：補演的玩家接了 3-3 那通電話（XC_CALL1）＝過',X().gates(H.G).G4===true&&heart()===true);
    full(G=>{ G.flags.EX_heroine_01=true; }); check('1. G10 拿掉（AA_548 第 1 節；使用者選照樣可以開）：門檻只有 G1～G9；跟以安交往過（分開了）照樣可以開',!('G10' in X().gates(H.G))&&J(Object.keys(X().gates(H.G)))===J(['G1','G2','G3','G4','G5','G6','G7','G8','G9'])&&heart()===true);
    full(); STORY._abroadT=STORY.abroad; STORY.abroad=()=>true; const ab=heart(); STORY.abroad=STORY._abroadT;
    check('1. 人在國外那一學期沒有（AA_537 1-1）',ab===false);
    full(); check('1. hideIf（confess_lines）：全過＝不藏；G7 沒過＝藏',CONFESS_LINES[XC].hideIf(H.G)===false&&(delete H.G.flags.XC_SAMEDAY,CONFESS_LINES[XC].hideIf(H.G)===true));
    full(); const L=DATE.log(H.G,XC); L.count=4; const p4=DATE.progress(H.G,XC); L.count=6; const p6=DATE.progress(H.G,XC);
    check('1. 人物頁的進度條：芯慈要 6 次（4 次時還寫「再多一些兩個人出去的時間」）',p4&&p4.rom&&p4.rom.hint===DATE.PROG_HINT.count&&p6&&p6.rom&&p6.rom.hint==='',J([p4,p6])); });

  /* ===== 第 2 節：回家的路上 ===== */
  await sec(2,async()=>{ const Hx=TERMEND_LINES.HEART[XC], C=CONFESS_LINES[XC];
    /* AA_548 第 7 節（使用者 10-31 點選）：她不問——沒有「你現在有在跟誰交往嗎。」「沒有。」，也沒有 others */
    const YES=C.yes.map(x=>typeof x==='string'?x:x.text);
    full(); let r=await walk(['我喜歡妳。']);
    check('2. 玩家先說（戀愛 76 ≥ 75）：她不問，直接 AA_537 第 4 節 yes → 交往',r==='yes'&&H.G.flags['dating_'+XC]===true&&J(T().slice(-YES.length))===J(YES)&&!T().includes('你現在有在跟誰交往嗎。')&&!T().includes('沒有。'),J(T()));
    full(G=>{ SOCIAL.rel(XC).npcRom=72; }); r=await walk(['我喜歡妳。']);
    check('2. 玩家先說、戀愛 72（< 75）：notYet「我還沒想好……」「這不是拒絕……」；不交往、這學期記 think（下學期第二次）、XC_NOT_YET',r==='notYet'&&!H.G.flags['dating_'+XC]&&J(T().slice(-2))===J(C.notYet)&&!!H.G.flags.XC_NOT_YET&&(H.G.termend.think||{})[XC]==='Y3S2',J(T()));
    full(G=>{ G.flags['dating_'+ZQ]=true; }); r=await walk(['我喜歡妳。']);
    check('2. 有別的交往對象、她不知道、你沒先說：照常（她不問、沒有 others）→ 交往',r==='yes'&&H.G.flags['dating_'+XC]===true&&!T().some(t=>/一對一|你現在有在跟誰交往/.test(t)),J(T()));
    full(); r=await walk(['先不說','好']);
    check('2. 她先說（先不說）：she 三句 → 好／讓我想想 →「好。」＝交往',r==='sheSaid'&&H.G.flags['dating_'+XC]===true&&J(T().slice(-3))===J(Hx.she),J(T()));
    full(G=>{ G.flags['dating_'+ZQ]=true; }); r=await walk(['先不說','先告訴她','好']);
    check('2. 她先說、你有別的交往對象：答案的選項多「（先告訴她，你在跟誰交往）」→ 你的三句 → 再選「好」＝交往、記 XC_TOLD',r==='sheSaid'&&H.G.flags['dating_'+XC]===true&&!!H.G.flags.XC_TOLD&&H.opts[1].slice(-1)[0]===X().TELL_OPT&&T().includes('好。知道了，我才排得出來。'),J([T(),H.opts]));
    full(); r=await walk(['先不說','讓我想想']); const th=H.G.termend.think[XC];
    check('2. 她先說、選「讓我想想」：「好。我把它排進下學期。……不要讓我排到畢業。」',r==='think'&&T().slice(-1)[0]===Hx.think&&th==='Y3S2',J(T()));
    r=await walk(['先不說','好'],'Y4S1'); check('2. 第二次（上學期讓我想想）：she2「上次那件事，我的答案沒變。」「……你的呢。」→ 好',r==='sheSaid'&&J(T().slice(-2))===J(Hx.she2),J(T()));
    { const D85=doc('b3df9c4e9','AA_537b_吳芯慈_第二份_約會台詞_校外地點_期末飯_節日.md'), WA=['這學期，我每個禮拜都留了一天。','……你應該知道是哪一天。'];   /* AA_537b 8-5（AA-B 10-31，BB-B n27 觀察：第二次回家路上和第一次一字不差）；修改前 FAIL */
      check('2. 第二次的回家路上換 walkAgain（8-5）兩句、不是第一次那兩句；接 she2',J(Hx.walkAgain)===J(WA)&&J(T().slice(0,2))===J(WA)&&!T().includes(Hx.walk[0])&&(!D85||WA.every(t=>D85.includes(t))),J(T().slice(0,3))); } });

  /* ===== 第 3 節：她知道你有別人 ===== */
  await sec(3,()=>{ full(G=>{ G.flags['dating_'+ZQ]=true; ROM.learn(G,XC,ZQ,'test'); }); const h=heart();
    check('3. 她從別的地方知道祐廷在和子晴交往（不是你說的）＝不發（{nope:knows}）；NOPE.knows 沒有她的句子＝也不傳（AA_548 第 7 節）',!!h&&h.nope==='knows'&&!TERMEND_LINES.NOPE.knows[XC],J(h));
    full(G=>{ G.flags['dating_'+ZQ]=true; ROM.tellBy(G,XC,ZQ); }); const h2=heart();
    check('3. 你親口跟她說的（ROM.tellBy）：只要沒騙她就接受＝知情條件（KNOWS_OK）過、照發（使用者 10-31 點選）',h2===true,J(h2)); });

  /* ===== 第 3b 節：交往中的期末飯（AA_537b 8-1）、學期末飯桌換句（8-0）===== */
  await sec('3b',()=>{ const DOC8=doc('86659bbc1','AA_537b_吳芯慈_第二份_約會台詞_校外地點_期末飯_節日.md'), g=TERMEND_LINES.GF[XC], Hx=TERMEND_LINES.HEART[XC];
    check('3b. 8-0：心意那一頓的飯桌換「我今天點了一道沒吃過的。……你不要笑。」（舊的「我今天沒帶書出門」不在）',Hx.table==='我今天點了一道沒吃過的。……你不要笑。'&&DOC8.includes('> 芯慈：我今天點了一道沒吃過的。……你不要笑。')&&!fs.readFileSync(path.join(H.ROOT,'src/data/termend_lines.js'),'utf8').includes('我今天沒帶書出門'));
    check('3b. 8-1 GF：巷口家常菜 18:00、table 兩句連著說、提前一天 21:00；邀約一般版「明天晚上吃飯。……我提前一天約了。」（AA-B 16:31 換）／美國路線大四上版照稿',!!g&&g.placeName==='巷口家常菜'&&g.h===18&&g.inviteDayBefore===21&&J(g.table)===J(['下學期的週三下午，我先空著。','你不用回答。我只是先說。'])&&g.table.every(t=>DOC8.includes('> 芯慈：'+t))&&g.invite({day:D('2028-06-10'),flags:{}})==='明天晚上吃飯。……我提前一天約了。'&&DOC8.includes('> 芯慈：你回來了。明天晚上吃飯。……我提前一天約了。'));
    full(G=>{ G.flags['dating_'+XC]=true; }, '2028-06-08'); H.G.hour=0; const w=TERMEND.windowOf('Y3S2'); TERMEND.plan(H.G,w);
    let sentAt=null; for(let d=w.from;d<=w.to&&sentAt==null;d++) for(const h of [12,20.9,21.05,23]){ H.G.day=d; H.G.hour=h; TERMEND.phone(GM); PHONE.tick(H.G); const m=(H.G.msgs||[]).find(x=>x.tag==='te_gf_Y3S2_'+XC); if(m){ sentAt=[d,h,m.text]; break; } }
    const dd=((H.G.termend.Y3S2||{}).gfDay||{})[XC];
    check('3b. 交往中：期末飯那天的前一天 21:00 收到她的邀約（不是當天 12:00）',!!sentAt&&dd!=null&&sentAt[0]===dd-1&&sentAt[1]>=21&&sentAt[2]==='明天晚上吃飯。……我提前一天約了。',J([sentAt,dd])); });

  /* ===== 第 4 節：AA_537b 第 1～3 節 ===== */
  await sec(4,()=>{ const L=DATE_LINES.lines[XC], K=['accept','acceptDating','cancel','flaked','move','move3','transport','depart','enough','leaveEarly','noPair'];
    check('4. 約會一般台詞十一個 key，每一句都在稿裡',!!L&&K.every(k=>Array.isArray(L[k])&&L[k].length&&L[k].every(t=>DOC537b.includes('「'+t+'」'))),J(L&&K.filter(k=>!L[k])));
    let nl=0, nd=0; const badD=[]; for(const loc in DATE_LINES.loc){ const lk=(DATE_LINES.loc[loc].likes||{})[XC]||{}; nl+=Object.keys(lk).length; const dl=(DATE_LINES.loc[loc].dislikeLine||{})[XC]||{};
      for(const p in lk) if(lk[p]==='dislike'){ nd++; if(!dl[p]||!DOC537b.includes('| '+p+' | '+dl[p]+' |')) badD.push(p); } }
    check('4. 128 點喜好、15 個不喜歡的點各有一句（照稿）',nl===128&&nd===15&&!badD.length,J([nl,nd,badD]));
    const locs=Object.keys(DATE_LINES.loc).filter(l=>((DATE_LINES.loc[l].lines||{})[XC]));
    check('4. 八個常去地點（D02、D04、D05、D06、D07、D12、D15、D18）有到達／收尾；D04 第一次到「西門町。我週六晚上常來。……都是一個人。」「今天不是。」',J(locs.sort())===J(['D02','D04','D05','D06','D07','D12','D15','D18'])&&J(DATE_LINES.loc.D04.lines[XC].arrive.first.lines.map(x=>x.text))===J(['西門町。我週六晚上常來。……都是一個人。','今天不是。']),J(locs)); });

  /* ===== 第 6 節：第 2 段 3-1、3-2、3-5 後補 ===== */
  await sec(6,async()=>{ const E=STORY_EVENTS.find(e=>e.id==='ev_xc_g2_dad');
    /* AA_548 3-1：大二上第 3 週，巷口家常菜（l118_home），她那一週平日 18:00～19:30 在那裡吃飯（XCROM.SCHED）*/
    const nd=STORY.termDay('Y2S1',3,2);
    H.fresh(CALENDAR.dateOf(nd).key,18.2,'l118_home',{introDone:true}); SOCIAL.remember(XC,'FIRST_MET','camp');
    const pre=E&&E.prereq.custom(H.G), wk=E&&E.term[0]==='Y2S1'&&J(E.weeks)===J([3])&&E.location==='l118_home'&&E.npcPresent===XC, sch=STORY.schedEnt(CHARACTERS[XC],H.G);
    H.said=[]; H.picks=['我想聽']; await EVENTS.run(E);
    check('6. 3-1（AA_548）：大二上第 3 週平日傍晚巷口家常菜（她的作息在那裡）、慈 2 兩個都沒記＝「我昨天又在幫我媽對帳。……」→「我想聽。」＝兩句、記 TALKED_FAMILY（G2 過）',!!E&&pre===true&&wk&&!!sch&&sch.zone==='l118_home'&&J(T())===J(['我昨天又在幫我媽對帳。……算了，你不會想聽。','我爸媽都是律師。事務所的帳，我從國中就在對。','……所以我雙主修財金。是我自己要的。'])&&X().gates(H.G).G2===true&&T().every(t=>DOC548.includes(t)),J([T(),sch&&sch.zone]));
    check('6. 3-1：記過 TALKED_FAMILY（或 ECON_TOGETHER）的不演、她也不排在巷口家常菜',E.prereq.custom(H.G)===false&&((STORY.schedEnt(CHARACTERS[XC],H.G)||{}).zone!=='l118_home'||!!STORY.schedEnt(CHARACTERS[XC],H.G).weeks===false));
    H.fresh(CALENDAR.dateOf(nd).key,18.2,'l118_home',{introDone:true}); H.said=[]; H.picks=['不問']; await EVENTS.run(E); check('6. 3-1：「（不問）」＝不記',J(T())===J(['我昨天又在幫我媽對帳。……算了，你不會想聽。'])&&!X().gates(H.G).G2);
    const d=STORY.termDay('Y2S2',10,4); const msgs=()=>(H.G.msgs||[]).filter(m=>m.tag==='xc_g3_remind').map(m=>m.text);
    H.fresh(CALENDAR.dateOf(d).key,0.5,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; STORY.phoneRules(GM); PHONE.tick(H.G); const before=msgs().length; H.G.hour=0.7; STORY.phoneRules(GM); PHONE.tick(H.G);
    check('6. 3-2：大二下第 10 週週四 00:40（還沒過 G3、有聯絡方式）三則照稿；00:40 以前沒有',before===0&&J(msgs())===J(X().G3_REMIND)&&X().G3_REMIND.every(t=>DOC537.includes('> 芯慈：'+t)),J(msgs()));
    H.fresh(CALENDAR.dateOf(d).key,0.7,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; H.G.l118={once:{H7c:3}}; STORY.phoneRules(GM); PHONE.tick(H.G); check('6. 3-2：已經選過「她今天要換。」＝不傳',msgs().length===0);
    /* AA_548 3-5：慈 6 那天沒選「我可以一起嗎？」＝大四上第 6 週週六 14:00「今天晚上七點，西門町。……我還是一個人。」→「我也去。」記 XC_BLANK、那天 19:00 排 D04 約會 */
    const d4=STORY.termDay('Y4S1',6,6); H.fresh(CALENDAR.dateOf(d4).key,14.1,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_first_place=1; STORY.phoneRules(GM); PHONE.tick(H.G);
    const m=(H.G.msgs||[]).find(x=>x.tag==='xc_blank_again'); const r=m&&PHONE.answer(H.G,'xc_blank_again',0); const trip=(H.G.trips||[]).find(t=>t.who===XC&&t.day===d4);
    check('6. 3-5 後補（AA_548）：大四上第 6 週週六 14:00「今天晚上七點，西門町。……我還是一個人。」→ 回「我也去。」記 XC_BLANK、那天排 D04 約會（約 19:00 到）',!!m&&m.text==='今天晚上七點，西門町。……我還是一個人。'&&DOC548.includes('今天晚上七點，西門町。……我還是一個人。')&&!!r&&H.G.flags.XC_BLANK===true&&!!trip&&J(trip.locs)===J(['D04'])&&trip.depart<19&&trip.depart>=18,J([m&&m.text,trip&&[trip.locs,trip.depart,trip.kind]]));
    { const ev6=STORY_EVENTS.find(e=>e.id==='ev_xinci_first_place'); H.fresh('2028-05-04',19.2,'noodle',{introDone:true}); H.said=[]; H.picks=[0,'我可以一起']; await EVENTS.run(ev6);
      check('6. 3-5（AA_548）：線打開時慈 6「暑期實習」最後多「實習是週一到週五。」「週六晚上，我還是會去西門町，看七點那一場。」→「我可以一起嗎？」→「……可以。不要遲到。」、記 XC_BLANK',J(T().slice(-3))===J(['實習是週一到週五。','週六晚上，我還是會去西門町，看七點那一場。','……可以。不要遲到。'])&&H.G.flags.XC_BLANK===true,J(T())); } });

  /* ===== 第 7 節：第 2 段 3-4 G7「沒有提前一天」===== */
  await sec(7,async()=>{ const wed=(()=>{ for(let k=1;k<=7;k++){ const d=STORY.termDay('Y3S1',14,k); if(CALENDAR.dateOf(d).wd%7===3) return d; } return null; })();
    const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; STORY.phoneRules(GM); PHONE.tick(H.G); };
    const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+XC).map(m=>m.text);
    H.fresh(CALENDAR.dateOf(wed).key,14,'dorm',{introDone:true,XC5_RECONCILE:true}); H.G.contacts={[XC]:1}; at(wed,14.5); const b=th().length; at(wed,15.05);
    check('7. 慈 5 以後第一個週三（大三上第 14 週）15:00 三則照稿（15:00 以前沒有）',b===0&&J(th())===J(X().G7_MSG)&&X().G7_MSG.every(t=>DOC537.includes('> 芯慈：'+t)),J(th()));
    PHONE.answer(H.G,'xc_g7_1',0); at(wed,15.2); const q=OUT.get(H.G,'xc_g7_1');
    check('7. 回「有。去哪？」＝她「巷口家常菜。六點。」、排好 18:00 的出遊（ev_xc_sameday）',th().slice(-1)[0]==='巷口家常菜。六點。'&&!!q&&q.ev==='ev_xc_sameday'&&q.h===18&&q.day===wed,J([th().slice(-2),q]));
    H.said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_xc_sameday'));
    const W=['妹妹今天也是番茄炒蛋？','……排骨飯。','喔！又換！','（她看你一眼，好像在說：你看，我自己換了。）','今天沒有排讀書。是我自己沒有排。'];
    check('7. 那一頓照稿（老闆娘、排骨飯、她看你一眼、今天沒有排讀書）、記 XC_SAMEDAY（G7 過）',J(T())===J(W)&&H.G.flags.XC_SAMEDAY===true&&X().gates(H.G).G7===true&&W.every(t=>DOC537.includes(t)),J(T()));
    H.fresh(CALENDAR.dateOf(wed).key,15.05,'dorm',{introDone:true,XC5_RECONCILE:true}); H.G.contacts={[XC]:1}; at(wed,15.05); PHONE.answer(H.G,'xc_g7_1',1);
    check('7. 回「今天不行。」＝「好。那我還是提前一天。」、不排出遊',th().slice(-1)[0]==='好。那我還是提前一天。'&&!OUT.get(H.G,'xc_g7_1'));
    const d2=STORY.termDay('Y3S2',6,3); at(d2,15.05); const m2=(H.G.msgs||[]).filter(m=>m.tag==='xc_g7_2').map(m=>m.text);
    check('7. 第一次沒答應：大三下第 6 週週三 15:00 再約一次，第三則「……再破例一次。」',CALENDAR.dateOf(d2).wd%7===3&&J(m2)===J(X().G7_MSG2)&&DOC537.includes('……再破例一次。'),J(m2));
    PHONE.answer(H.G,'xc_g7_2',1); at(STORY.termDay('Y4S1',2,3),15.05); check('7. 兩次都沒答應：不再約（線關上，G7 不過）',!(H.G.msgs||[]).some(m=>/^xc_g7_3/.test(m.tag||''))&&X().gates(H.G).G7===false);
    STORY._rr=STORY.routeAbroadRoute; STORY.routeAbroadRoute=()=>'JP'; const jd=X().g7Day2(H.G); STORY.routeAbroadRoute=STORY._rr;
    check('7. 日本路線（大三下在日本）：第二次改大四上第 2 週週三',jd===STORY.termDay('Y4S1',2,3)&&CALENDAR.dateOf(jd).wd%7===3); });

  /* ===== 第 8 節：第 2 段 3-3 G4b 那通電話 ===== */
  await sec(8,async()=>{ const d=X().callDay(), at=(dd,h)=>{ H.G.day=dd; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(dd).wd%7; STORY.phoneRules(GM); PHONE.tick(H.G); };
    H.fresh(CALENDAR.dateOf(d-1).key,20,'dorm',{introDone:true,XC_FIX:'yes'}); SOCIAL.remember(XC,'XINCI_SECOND',''); at(d-1,20); const q=OUT.get(H.G,'xc_call1');
    check('8. 3-3：走 Café 補演（XC_FIX yes）＝大二下第 8 週週三 00:30 她打電話來（出遊的電話：接起來／先不接）',CALENDAR.dateOf(d).wd%7===3&&!!q&&q.call===true&&q.day===d&&q.h===0.5&&q.verb==='接起來'&&q.no==='先不接',J(q));
    H.said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_xc_call1')); const W=['……你還沒睡。','我在看一部劇。女主角一個人把整間公司的帳對完，哭了一整集。','我覺得很蠢。可是我也哭了。','你不用說什麼。我只是想講出來。'];   /* AA_548 3-3 */
    check('8. 接起來（AA_548 3-3）：照稿四句（劇的內容換成「女主角一個人把整間公司的帳對完」）＋旁白「（她講到一點半。掛電話的時候……又說了一次。）」、記 XC_CALL1（G4 過）',J(T().slice(0,4))===J(W)&&T()[4]==='（她講到一點半。掛電話的時候，她說了「晚安」，又說了一次。）'&&H.G.flags.XC_CALL1===true&&X().gates(H.G).G4===true&&W.every(t=>DOC548.includes('> 芯慈：'+t))&&DOC548.includes('> （她講到一點半。掛電話的時候，她說了「晚安」，又說了一次。）'),J(T()));
    H.fresh(CALENDAR.dateOf(d-1).key,20,'dorm',{introDone:true,XC_FIX:'yes'}); SOCIAL.remember(XC,'XINCI_SECOND',''); at(d-1,20); STORY_EVENTS.find(e=>e.id==='ev_xc_call1').outingMissed(H.G); at(d,8.6);
    const m=(H.G.msgs||[]).find(x=>x.tag==='xc_call1_miss');
    check('8. 不接：隔天早上「打錯了。」，G4 沒過',!!m&&m.text==='打錯了。'&&X().gates(H.G).G4===false&&DOC537.includes('「打錯了。」'));
    H.fresh(CALENDAR.dateOf(d-1).key,20,'dorm',{introDone:true}); at(d-1,20); check('8. 慈 3 照常演過的（沒有 XC_FIX）：沒有這通電話',!OUT.get(H.G,'xc_call1')); });

  /* ===== 第 9 節：和以安分開那晚那一則（AA-B 17:18 拿掉）===== */
  await sec(9,()=>{ const d=D('2027-11-10'); H.fresh('2027-11-10',20,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; H.G.l118={once:{H7c:1}}; SOCIAL.remember(XC,'XINCI_SECOND','');
    ROM.start(H.G,AN); ROM.end(H.G,AN,'apart_talk'); H.G.day=d+1; H.G.hour=1.2; STORY.phoneRules(GM); PHONE.tick(H.G);
    check('9. 和以安分開那晚不傳「今天的劇很難看。我看完了。」（AA-B 17:18 拿掉不換）；G10 已經拿掉（AA_548）',!(H.G.msgs||[]).some(x=>x.tag==='xc_an_break'||x.text==='今天的劇很難看。')&&!('G10' in X().gates(H.G))&&!X().anBreak); });

  /* ===== 第 10 節：G5 半夜訊息（AA_537b 第 9 節 8acf3b308）===== */
  await sec(10,()=>{ const DOC9=doc('8acf3b308','AA_537b_吳芯慈_第二份_約會台詞_校外地點_期末飯_節日.md'), N=X();
    const all=N.NIGHT_A.concat(N.NIGHT_B), bad=[];
    const NEW548=['A3','A4','A5','A7','A8','B1','B3','B8'];   /* AA_548 第 5 節換的八則（其他八則照 AA_537b 第 9 節）*/
    for(const x of all){ const src=NEW548.includes(x.k)?DOC548:DOC9; const row=src.split('\n').find(l=>l.startsWith('| '+x.k+' ')||l.startsWith('| '+x.k+'（')); if(!row){ bad.push(x.k+' 沒有這一列'); continue; } const c=row.split('|').map(z=>z.trim());
      if(c[2]!==x.m.join('／')) bad.push(x.k+' 她傳：'+x.m.join('／')); const want=x.o.map(([t,r])=>'「'+t+'」→ '+r).join('<br>'); if(c[3]!==want) bad.push(x.k+' 選項'); }
    check('10. 十六則（A 八、B 八）逐字對稿：她傳的泡泡、三個選項、她回的一句（A3、A4、A5、A7、A8、B1、B3、B8 照 AA_548 第 5 節）',all.length===16&&!bad.length&&!JSON.stringify(all).match(/第二名|第一名|補習班|輔系/),J(bad));
    check('10. L 層八句（AA_537 5-2）、mention（8-2）、「你應該睡了吧。」照稿',N.NIGHT_L.length===8&&N.NIGHT_L.every(t=>DOC537.includes('「'+t+'」'))&&N.MENTION.o.slice(0,2).every(([t,r])=>DOC537b.includes('「'+t+'」→ 芯慈：'+r))&&DOC537b.includes('> 芯慈：'+N.MENTION.m[0])&&DOC537.includes('「'+N.WAKE+'」'));
    /* 跑一段時間：每天看那一週的時段 */
    const run=(from,to,ans)=>{ const got=[]; for(let d=from;d<=to;d++){ const sl=N.nightSlot(d); if(sl.day!==d) continue; H.G.day=d; H.G.hour=sl.h+0.02; H.G.weekday=CALENDAR.dateOf(d).wd%7; STORY.phoneRules(GM); PHONE.tick(H.G);
        const m=(H.G.msgs||[]).filter(x=>x.day===d&&x.th==='p:'+XC&&x.ask&&/^xcn_/.test(x.ask.id)).pop(); if(m){ got.push([CALENDAR.dateOf(d).wd%7,m.text]); if(ans){ H.G.hour=sl.h+ans; PHONE.answer(H.G,m.ask.id,0); } } } return got; };
    const d0=D('2026-12-14'); H.fresh('2026-12-14',12,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.flags.XCN_START=d0;
    const g=run(d0+1,d0+28,0.25);
    check('10. 慈 3 以後每週一則：A1、A2、A3、A4 照順序；週三、週日一週一週輪流；00:30～01:30',g.length===4&&J(g.map(x=>x[1]))===J(N.NIGHT_A.slice(0,4).map(x=>x.m[x.m.length-1]))&&g.every(x=>x[0]===3||x[0]===0)&&g[0][0]!==g[1][0],J(g));
    check('10. 每一則都在 30 分鐘內回＝XC_NIGHT 4',(H.G.flags.XC_NIGHT|0)===4,H.G.flags.XC_NIGHT);
    run(d0+29,d0+36,0.75); check('10. 超過 30 分鐘才回＝不算（XC_NIGHT 還是 4）',(H.G.flags.XC_NIGHT|0)===4,H.G.flags.XC_NIGHT);
    { /* 遊戲裡過了半夜不換日（G.hour 加到 24 以上、睡覺才換 G.day；BB-B 10-31 讀程式找到）：前一天熬夜到那個時段也要收到 */
      H.fresh('2026-12-14',12,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.flags.XCN_START=d0;
      let sd=null, sh=0; for(let d=d0+2;d<d0+16&&sd==null;d++){ const sl=N.nightSlot(d); if(sl.day===d){ sd=d; sh=sl.h; } }
      H.G.day=sd-1; H.G.hour=24+sh+0.02; STORY.phoneRules(GM); PHONE.tick(H.G); const m=(H.G.msgs||[]).filter(x=>x.th==='p:'+XC&&x.ask&&/^xcn_/.test(x.ask.id)).pop();
      check('10. 熬夜：G.day 還是前一天、G.hour＝24＋時段（遊戲裡真正的狀態）＝照樣收到那一則、時間戳是那一天（修改前收不到）',!!m&&m.day===sd&&Math.abs(m.h-(sh+0.02))<0.05,J(m&&[m.day,m.h,sd,sh])); }
    H.fresh('2027-10-04',12,'dorm',{introDone:true,XC5_RECONCILE:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.flags.XCN_START=D('2027-10-03');
    const gb=run(D('2027-10-04'),D('2027-10-04')+20); check('10. 慈 5 以後換 B：B1、B2、B3',J(gb.map(x=>x[1]))===J(N.NIGHT_B.slice(0,3).map(x=>x.m[x.m.length-1])),J(gb));
    H.fresh('2028-05-10',12,'dorm',{introDone:true,XC5_RECONCILE:true,XCN:{a:0,b:2,l:0}}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.events.done.ev_xinci_first_place=1; H.G.flags.XCN_START=D('2028-05-09');
    const g6=run(D('2028-05-10'),D('2028-05-10')+48); check('10. 慈 6 以後：B3、B8 都照傳（AA_548：B3 不再看改輔系、B8 慈 5 以後就可以）',g6.some(x=>x[1]===N.NIGHT_B[2].m.slice(-1)[0])&&g6.some(x=>x[1]===N.NIGHT_B[7].m.slice(-1)[0]),J(g6.map(x=>x[1])));
    H.fresh('2027-10-04',12,'dorm',{introDone:true,XC5_RECONCILE:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.flags.XCN_START=D('2027-10-03'); const r=SOCIAL.rel(XC); r.fam=62; r.trust=46; r.comf=41; r.npcRom=10;
    const gm=run(D('2027-10-04'),D('2027-10-04')+13); const wm=(H.G.msgs||[]).find(x=>x.tag==='xcn_wish');
    check('10. mention：大三上起、交往前第 4 階以上的第一則＝「我想看一次午夜場。一個人去好像有點怪。」（三個選項），那一週代替、知道心願（wishKnown）；下一週接 B1',!!wm&&wm.text===N.MENTION.m[0]&&J(wm.ask.opts.map(o=>o.t))===J(['我陪妳。','哪一部？','（不回）'])&&DATE.log(H.G,XC).wishKnown===true&&gm[1]&&gm[1][1]===N.NIGHT_B[0].m.slice(-1)[0],J(gm));
    H.G.hour=wm.h+0.1; PHONE.answer(H.G,'xcn_wish',2); check('10. mention 選「（不回）」＝不貼玩家的話、不算 XC_NIGHT',!(H.G.flags.XC_NIGHT|0));
    H.fresh('2027-10-04',12,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.flags.XCN_START=D('2027-10-03');
    check('10. 大三上第 14 週過了慈 5 還沒演（G6 還沒過）：照樣傳 A（AA_548：舊的「沒和好就關線」拿掉，G6 另外補一次）',run(STORY.termDay('Y3S1',14,1),STORY.termDay('Y3S1',14,1)+20).length>0);
    H.fresh('2028-07-10',12,'dorm',{introDone:true,XC5_RECONCILE:true,dating_classmate_xinci:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.flags.XCN_START=D('2028-07-09');
    let L0=[]; for(let d=D('2028-07-10');d<=D('2028-07-24');d++){ const sl=N.nightSlot(d); if(sl.day!==d) continue; H.G.day=d; H.G.hour=sl.h+0.02; STORY.phoneRules(GM); PHONE.tick(H.G); }
    L0=(H.G.msgs||[]).filter(x=>/^xcn_/.test(x.tag||'')).map(x=>x.text);
    check('10. 交往以後換 L 層（「我在看劇。你要不要也打開……」起照順序）',L0.length>=2&&L0[0]===N.NIGHT_L[0]&&L0[1]===N.NIGHT_L[1],J(L0));
    const dw=STORY.termDay('Y2S2',6,3); H.fresh(CALENDAR.dateOf(dw).key,0.5,'dorm',{introDone:true,XC_NIGHT:1}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.hour=0.8; STORY.phoneRules(GM); PHONE.tick(H.G);
    check('10. 大二下第 6 週還不到 2 次：週三 00:45「你應該睡了吧。」（不用回）',(H.G.msgs||[]).some(x=>x.tag==='xcn_wake'&&x.text===N.WAKE&&!x.ask)); });

  /* ===== 第 11 節：心願那一場＝午夜場（AA_537b 8-2；AA-B 16:31 同意擴充約會系統到 02:30）===== */
  await sec(11,async()=>{ const DOC8=doc('86659bbc1','AA_537b_吳芯慈_第二份_約會台詞_校外地點_期末飯_節日.md'), E=DATE_WISH.events[XC];
    const strs=[]; const w=x=>{ if(Array.isArray(x)) x.forEach(w); else if(x&&typeof x==='object'){ if(typeof x.text==='string') strs.push(x.text); if(typeof x.narr==='string') strs.push(x.narr); for(const k in x) if(k!=='text'&&k!=='narr') w(x[k]); } };
    w([E.herInvite.lines,E.herInvite.accept,E.herInvite.decline,E.playerInvite,E.arrive,E.hotspots,E.closing]);
    const bad=strs.filter(t=>!DOC8.includes(t.replace(/^（|）$/g,'')));
    check('11. 心願事件登記進 DATE_WISH（wish_classmate_xinci，D04，「午夜場」）；herInvite、playerInvite、arrive、兩個點、closing 每一句都在稿裡；record 照稿',!!E&&E.loc==='D04'&&E.title==='午夜場'&&strs.length>=20&&!bad.length&&E.record.flag==='WISH_DONE_classmate_xinci'&&E.record.memory.tag==='XC_MIDNIGHT'&&DOC8.includes(E.record.memory.text)&&!E.mention,J(bad));
    const sat=D('2028-05-20'); H.fresh('2028-05-19',12,'dorm',{introDone:true,XC_BLANK:true}); H.G.contacts={[XC]:1}; SOCIAL.remember(XC,'FIRST_MET','camp'); Object.assign(SOCIAL.rel(XC),{fam:65,trust:50,comf:45,npcRom:40,rom:20});
    const c19=DATE.check(H.G,{who:XC,locs:['D04'],day:sat,depart:18,transport:'mrt'}), c22=DATE.check(H.G,{who:XC,locs:['D04'],day:sat,depart:22.5,transport:'mrt'}), cp=DATE.check(H.G,{who:'classmate_peishan',locs:['D04'],day:sat,depart:22.5,transport:'mrt'});
    check('11. 約得出來：芯慈 D04 22:30 出發、02:30 回來（一般人 22:30 照舊「回來會超過 23:30」）',c22.ok&&c22.plan.back===26.5&&c19.ok&&!cp.ok,J([c22.why,c22.plan&&c22.plan.back,cp.why]));
    check('11. 只有午夜場才是心願那一場：18:00 那一趟不是（WISH.due false）、22:30 是',WISH.due(H.G,{who:XC,locs:['D04'],depart:22.5,kind:'evening'})===true&&WISH.due(H.G,{who:XC,locs:['D04'],depart:18,kind:'evening'})===false);
    /* 她主動約：週五 00:40 */
    H.G.day=D('2028-05-19'); H.G.hour=0.7; H.G.weekday=5; WISH.phone(H.G); PHONE.tick(H.G); const m=(H.G.msgs||[]).filter(x=>/^wish_ask_classmate_xinci/.test(x.tag||''));
    check('11. 她主動約（第 5 階以上＋XC_BLANK、兩個人都單身）：週五 00:40「明天晚上，西門町的午夜場。」「……我提前一天問了。你可以說不。」',J(m.map(x=>x.text))===J(['明天晚上，西門町的午夜場。','……我提前一天問了。你可以說不。'])&&!!m[1].ask,J(m.map(x=>[x.h,x.text])));
    PHONE.answer(H.G,m[1].ask.id,0); WISH.phone(H.G); const tr=(H.G.trips||[]).find(t=>t.who===XC&&t.status==='booked');
    check('11. 答應＝「好。我買票。你不要遲到，午夜場不等人。」、排好週六 22:30 出發的那一趟',(H.G.msgs||[]).some(x=>x.text==='好。我買票。你不要遲到，午夜場不等人。')&&!!tr&&tr.day===sat&&tr.depart===22.5&&tr.back===26.5,J(tr));
    H.fresh('2028-05-19',0.7,'dorm',{introDone:true,XC_BLANK:true,dating_heroine_04:true}); H.G.contacts={[XC]:1}; SOCIAL.remember(XC,'FIRST_MET','camp'); Object.assign(SOCIAL.rel(XC),{fam:65,trust:50,comf:45,npcRom:40,rom:20}); H.G.weekday=5; WISH.phone(H.G); PHONE.tick(H.G);
    check('11. 你在跟別人交往：她不約（她只接受一對一）',!(H.G.msgs||[]).some(x=>/^wish_ask_classmate_xinci/.test(x.tag||'')));
    /* 那一場 */
    H.fresh('2028-05-20',22.75,'campus',{introDone:true,XC_BLANK:true}); SOCIAL.remember(XC,'FIRST_MET','camp'); Object.assign(SOCIAL.rel(XC),{fam:65,trust:50,comf:45,npcRom:40,rom:20});
    const t={trip:9,who:XC,locs:['D04'],day:sat,depart:22.5,back:26.5,kind:'evening',transport:'mrt',status:'going',spots:[],departed:true};
    H.said=[]; H.picks=['選午夜場的片','看沒聽過的那部','先買宵夜','我請','下次再來']; H.G.money=5000; const r=await WISH.scene(GM,{dateTrip:9},t);
    const T2=T(); check('11. 演出來：開場旁白「（十一點半的西門町……）」、兩句、選片、宵夜、電影以後散場「（午夜場散場，捷運已經沒了……）」「電影普通。」「……可是我會記得。」→「下次再來。」',T2.includes('（十一點半的西門町。店都還亮著，街上的人比白天少一半。）')&&T2.includes('午夜場只有兩部。一部恐怖片，一部我沒聽過。')&&T2.includes('好。不知道結局的比較好看。……我以前不會這樣說。')&&T2.includes('好。下次換我。……我會記得是哪一次。')&&T2.indexOf('（午夜場散場，捷運已經沒了。你們走到西門站外面等計程車。）')>T2.indexOf('好。下次換我。……我會記得是哪一次。')&&T2.indexOf('好。下次不是午夜場也可以。')>T2.indexOf('……可是我會記得。'),J(T2));
    check('11. 時間：互動點 40 分＋電影 120 分＝散場在凌晨一點多（G.hour > 25）；記 WISH_DONE、XC_MIDNIGHT、XC_MIDNIGHT_DAY（隔天睡到十點：STORY.lateWake）',H.G.hour>25&&H.G.hour<26.5&&H.G.flags.WISH_DONE_classmate_xinci===true&&SOCIAL.has(XC,'XC_MIDNIGHT')&&H.G.flags.XC_MIDNIGHT_DAY===sat&&STORY.lateWake(H.G)===true,J([H.G.hour,H.G.flags.XC_MIDNIGHT_DAY]));
    const bo=STORY.bedOptions(H.G), mo=bo.find(o=>o.kind==='morning'||/明天/.test(o.t));
    check('11. 床的選單：「睡到明天…」是十點（hint 有 10:00）',!!mo&&/10:00/.test(J(mo)),J(bo.slice(0,2))); });

  /* ===== 第 12 節：AA_548 第 7 節（使用者 10-31 00:0x 點選：告白時她不問、只要沒騙她就接受）===== */
  await sec(12,async()=>{ const DOC7=doc('8e0de1663','AA_548_芯慈戀愛線重寫_門檻與半夜訊息.md'), Hx=TERMEND_LINES.HEART[XC], ZQ_='heroine_04';
    check('12. 開關：XCROM.ON true（AA-B 00:25 可以打開）、noOpen false（接受）',X().ON===true&&X().CFG.noOpen===false&&X().acceptsOpen(H.G)===true);
    check('12. 回家的路上：she 三句（最後的問句拿掉）、she2「……你的呢。」；沒有 askFirst、sheAsks、othersTail；台詞在稿裡',J(Hx.she)===J(['……你不說，那我說。','我排了一個晚上要講這個。講稿寫了三版，都很爛。','我喜歡你。'])&&J(Hx.she2)===J(['上次那件事，我的答案沒變。','……你的呢。'])&&!Hx.askFirst&&!Hx.sheAsks&&!Hx.othersTail&&[].concat(Hx.she,Hx.she2).every(t=>DOC7.includes(t)),J([Hx.she,Hx.she2]));
    full(G=>{ G.flags['dating_'+ZQ_]=true; }); let r=await walk(['先告訴她','我喜歡妳。']);
    check('12. 交往中、她不知道：選項多「（先告訴她，你在跟誰交往）」→「……我要知道是誰。」「（你說了。）」「好。知道了，我才排得出來。」→ 再選一次（沒有那一個）→ 答應；記 XC_TOLD、ROM 記她知道（你說的）',r==='yes'&&H.opts[0].slice(-1)[0]===X().TELL_OPT&&!H.opts[1].includes(X().TELL_OPT)&&J(T().slice(2,5))===J(['……我要知道是誰。','（你說了。）','好。知道了，我才排得出來。'])&&H.G.flags['dating_'+XC]===true&&H.G.flags.XC_TOLD===H.G.day&&ROM.knowsOf(H.G,XC,ZQ_)&&X().toldOf(H.G,ZQ_)&&!T().includes('你現在有在跟誰交往嗎。'),J([H.opts,T()]));
    full(G=>{ G.flags['dating_'+ZQ_]=true; }); r=await walk(['我喜歡妳。']);
    check('12. 不說也可以：她不知道、照常答應（不問、沒有 others）',r==='yes'&&H.G.flags['dating_'+XC]===true&&!H.G.flags.XC_TOLD&&!T().includes('你現在有在跟誰交往嗎。')&&!T().some(t=>/一對一/.test(t)),J(T()));
    full(G=>{ G.flags['dating_'+ZQ_]=true; ROM.tellBy(G,XC,ZQ_); }); const hk=heart(); r=await walk(['我喜歡妳。']);
    check('12. 她之前就知道（你說過）：心意邀約照發；答應時多「你跟她的事，我知道。……我排得出來。」；選項沒有「先告訴她」',hk===true&&r==='yes'&&T().includes(X().KNOWN_LINE)&&DOC7.includes(X().KNOWN_LINE)&&!H.opts[0].includes(X().TELL_OPT),J(T()));
    full(G=>{ G.flags['dating_'+ZQ_]=true; ROM.learn(G,XC,ZQ_,'seen'); });
    check('12. 她從別的地方知道、你沒說過：心意邀約不發（KNOWS_OK）、NOPE.knows 沒有她（不傳）',(h=>h===false||(!!h&&h.nope==='knows'))(heart())&&!TERMEND_LINES.NOPE.knows[XC]&&!!TERMEND_LINES.NOPE.low[XC]);
    full(); r=await walk(['先不說','好']); check('12. 她先說：三句以後直接「好／讓我想想」，好＝交往',r==='sheSaid'&&J(T().slice(-3))===J(Hx.she)&&H.G.flags['dating_'+XC]===true,J(T()));
    /* 交往以後 */
    full(G=>{ G.flags['dating_'+XC]=true; G.flags['dating_'+ZQ_]=true; (G.flags.confessed||(G.flags.confessed={}))[XC]=G.day-10; });
    const opt=()=>[].concat(...STORY.TALK_OPTS.map(f=>{ try{ return f(H.G,XC,GM)||[]; }catch(e){ return []; } })).find(o=>o&&/自己跟她講/.test(o.t||''));
    const o1=opt(); H.said=[]; if(o1) await o1.run(GM);
    check('12. 交往以後自己跟她講：和她說話的選單「（自己跟她講子晴的事）」→「我要知道是誰。……知道了，我才排得出來。」「你跟她約的那幾天，先告訴我。我排別的。」；記 XC_TOLD；之後選單沒有這一個',!!o1&&/子晴/.test(o1.t)&&J(T())===J(X().TELL_AFTER)&&X().TELL_AFTER.every(t=>DOC7.includes(t))&&!!H.G.flags.XC_TOLD&&!opt(),J([o1&&o1.t,T()]));
    full(G=>{ G.flags['dating_'+XC]=true; G.flags['dating_'+ZQ_]=true; (G.flags.confessed||(G.flags.confessed={}))[XC]=G.day-10; ROM.learn(G,XC,ZQ_,'seen'); });
    const FE=STORY_EVENTS.find(e=>e.id==='ev_xc_found'); const due=!!FE&&FE.prereq.custom(H.G); H.said=[]; await EVENTS.run(FE);
    check('12. 她自己發現、你沒說過：下次走到她旁邊「我沒有問你，是因為我以為你會說。」「……我們到這裡就好。」→ 分手、XC_FOUND 第 1 次；沒有「我問過你」',due&&J(T())===J(X().FOUND)&&X().FOUND.every(t=>DOC7.includes(t))&&H.G.flags['dating_'+XC]!==true&&H.G.flags.XC_FOUND&&H.G.flags.XC_FOUND.n===1&&!FE.prereq.custom(H.G),J(T()));
    /* 以安那一則（5-3） */
    full(G=>{ G.flags['dating_'+XC]=true; (G.flags.confessed||(G.flags.confessed={}))[XC]=G.day-1; G.contacts[AN]=1; }); H.G.hour=21.2; STORY.phoneRules(GM); PHONE.tick(H.G);
    const an=(H.G.msgs||[]).filter(m=>m.tag==='xc_an_knows').map(m=>m.text);
    full(G=>{ G.flags['dating_'+XC]=true; G.flags['dating_'+AN]=true; (G.flags.confessed||(G.flags.confessed={}))[XC]=G.day-1; G.contacts[AN]=1; }); H.G.hour=21.2; STORY.phoneRules(GM); PHONE.tick(H.G);
    check('12. 5-3 以安：交往後第一週 21:00 以後一則「芯慈跟我說了。她自己來跟我說的。」「我很高興。是真的。」；以安自己在跟祐廷交往＝不傳（AA_548 第 8 節同意）',J(an)===J(X().AN_KNOWS)&&!(H.G.msgs||[]).some(m=>m.tag==='xc_an_knows'),J(an)); });

  /* ===== 第 12c 節：巷口家常菜期末飯的開場、收尾（AA_537b 8-4，企劃線 18795bc0c；心意那一頓、交往後那一頓共用；深色底＋字幕「巷口家常菜」）===== */
  await sec('12c',async()=>{ const D84=doc('18795bc0c','AA_537b_吳芯慈_第二份_約會台詞_校外地點_期末飯_節日.md'), PL=TERMEND_LINES.PLACE.l118_home||{};
    const OPEN='（傍晚的巷口家常菜。菜擺在玻璃櫃裡，用手指一指，老闆娘就幫你夾。）', CLOSE='（老闆娘開始收玻璃櫃裡的菜。你們走出巷口，路燈剛亮。）';
    check('12c. 地點表：l118_home 開場、收尾逐字照 8-4、沒有底圖（深色底）、字幕「巷口家常菜」；芯慈心意、交往後兩頓都用它',PL.open===OPEN&&PL.close===CLOSE&&!PL.bg&&PL.caption==='巷口家常菜'&&TERMEND_LINES.HEART[XC].place==='l118_home'&&TERMEND_LINES.GF[XC].place==='l118_home'&&(!D84||(D84.includes(OPEN)&&D84.includes(CLOSE))),J(PL));
    for(const kind of ['heart','gf']){ full(kind==='gf'?(G=>{ G.flags['dating_'+XC]=true; }):null); H.said=[]; H.picks=[]; await TERMEND.dinner(GM,{te:{term:'Y3S2',who:XC,kind}});
      const ci=T().indexOf(CLOSE), wi=T().indexOf(TERMEND_LINES.HEART[XC].walk[0]);   /* 心意那一頓：收尾以後接回家的路（walkHome） */
      check('12c. 演出來（'+kind+'）：第一句是開場；收尾在飯桌之後'+(kind==='heart'?'、回家的路之前':'、是最後一句'),T()[0]===OPEN&&ci>1&&(kind==='heart'?wi>ci:ci===T().length-1),J(T())); } });
  await sec('12d',async()=>{ const caps=[], c0=GM.caption; GM.caption=(a,b)=>{ caps.push(b); }; full(); H.said=[]; H.picks=['我喜歡妳。'];   /* BB-B 10-31 n27：芯慈回家的路沒有底圖、沒有字幕（walkPlace 不出字幕）→ walkCaption（修改前 FAIL）*/
    try{ await TERMEND.walkHome(GM,XC,'Y3S2'); } finally { GM.caption=c0; }
    check('12d. 回家的路上：沒有底圖＝深色底＋字幕「羅斯福路・往公館站」（walkCaption）',caps[0]==='羅斯福路・往公館站'&&!TERMEND_LINES.HEART[XC].walkBg,J(caps)); });

  /* ===== 第 12b 節：心意邀約當天才約（BB-B 10-31：原本時段第一天 20:30 傳、飯排兩天後，「今天晚上有空嗎。……我沒有提前一天。」的「今天」不對）===== */
  await sec('12b',async()=>{ full(null,'2028-06-07'); H.G.hour=0; const w=TERMEND.windowOf('Y3S2'), tag='te_Y3S2_'+XC; let m=null;
    for(let d=w.from;d<=w.to&&!m;d++) for(const h of [9,12.05,15,20.6,21]){ H.G.day=d; H.G.hour=h; TERMEND.phone(GM); PHONE.tick(H.G); m=(H.G.msgs||[]).find(x=>x.tag===tag&&x.ask); if(m) break; }
    const R=H.G.termend.Y3S2||{}, dd=(R.heartDay||{})[XC];
    let q=null; if(m){ H.G.hour=Math.max(H.G.hour,12.2); PHONE.answer(H.G,tag,0); TERMEND.pickCheck(GM); q=OUT.get(H.G,'te_Y3S2'); }
    check('12b. 芯慈的心意邀約（HEART.sameDay）：那一天 12:00 才傳「考完了。今天晚上有空嗎。……我沒有提前一天。」、回覆到 17:30；答應＝飯就在那天 18:00',!!m&&dd!=null&&m.day===dd&&m.h>=12&&m.h<17.5&&m.text===TERMEND_LINES.HEART[XC].invite&&m.ask.until===dd*24+17.5&&!!q&&q.day===dd&&q.h===18,J([m&&[m.day,m.h,m.text],dd,q&&[q.day,q.h]])); });

  /* 12b 續（BB-B 10-31 疑點 1、2）：那天 12:00～17:30 手機規則都沒跑到＝不傳過期的、改排下一個晚上；別人的期末飯已經佔了那一晚＝她排別天 */
  await sec('12b2',async()=>{ full(null,'2028-06-07'); const w=TERMEND.windowOf('Y3S2'), tag='te_Y3S2_'+XC;
    let dd=null; for(let d=w.from;d<=w.to&&dd==null;d++){ H.G.day=d; H.G.hour=9; TERMEND.phone(GM); const R=(H.G.termend||{}).Y3S2||{}; if(R.heartDay&&R.heartDay[XC]!=null) dd=R.heartDay[XC]; }
    H.G.day=dd; H.G.hour=19; TERMEND.phone(GM); PHONE.tick(H.G); const R=H.G.termend.Y3S2, d2=R.heartDay[XC], m0=(H.G.msgs||[]).find(x=>x.tag===tag);
    H.G.day=d2; H.G.hour=12.1; TERMEND.phone(GM); PHONE.tick(H.G); const m=(H.G.msgs||[]).find(x=>x.tag===tag&&x.ask);
    check('12b2. 疑點 1：排好的那天（第 '+dd+' 天）19:00 才第一次跑手機規則＝那天不傳（不傳過期的）、改排下一個晚上；那天 12:00 傳、回覆到 17:30',dd!=null&&!m0&&d2>dd&&!!m&&m.day===d2&&m.ask.until===d2*24+17.5,J({dd,d2,m0:!!m0,m:m&&[m.day,m.h]}));
    full(null,'2028-06-07'); let d1=null; for(let d=w.from;d<=w.to&&d1==null;d++){ H.G.day=d; H.G.hour=9; TERMEND.phone(GM); const RR=(H.G.termend||{}).Y3S2||{}; if(RR.heartDay&&RR.heartDay[XC]!=null) d1=RR.heartDay[XC]; }
    full(null,'2028-06-07'); H.G.day=w.from; H.G.hour=9; OUT.plan(H.G,{id:'te_gf_Y3S2_heroine_04',ev:'ev_termend_dinner',day:d1,h:22,place:'公館宵夜',title:'學期末的飯：子晴',te:{term:'Y3S2',who:'heroine_04',kind:'gf'}});
    let d3=null; for(let d=w.from;d<=w.to&&d3==null;d++){ H.G.day=d; H.G.hour=9; TERMEND.phone(GM); const RR=(H.G.termend||{}).Y3S2||{}; if(RR.heartDay&&RR.heartDay[XC]!=null) d3=RR.heartDay[XC]; }
    check('12b2. 疑點 2：那一晚已經排了子晴的期末宵夜（te_gf_）＝芯慈的心意飯排別天（TERMEND.teBusy）',d1!=null&&d3!=null&&d3!==d1&&TERMEND.teBusy(H.G,w,d1,XC)===true&&TERMEND.teBusy(H.G,w,d1,'heroine_04')===false,J({d1,d3})); });

  /* ===== 第 13 節：AA_548 第 8 節（她爸爸、挽回、冷落）===== */
  await sec(13,async()=>{ const DOC8=doc('8e0de1663','AA_548_芯慈戀愛線重寫_門檻與半夜訊息.md'), ZQ_='heroine_04';
    const fri=(()=>{ for(let d=D('2029-04-01');d<=D('2029-04-30');d++) if(CALENDAR.dateOf(d).wd%7===5) return d; return null; })();
    const DE=STORY_EVENTS.find(e=>e.id==='ev_xc_dad2');
    full(G=>{ G.flags['dating_'+XC]=true; },CALENDAR.dateOf(fri).key); H.G.hour=17.6; H.G.zone='campus'; const ok=DE.prereq.custom(H.G), sch=STORY.schedEnt(CHARACTERS[XC],H.G);
    H.said=[]; H.picks=['她去哪']; await EVENTS.run(DE);
    check('13. 8-1 她爸爸：2029-04 的週五 17:30 交往中、她在法律系館A門口；四句、「她去哪，我都會在台北。」→ 旁白＋「……好。」、最後「……走吧。……我會說。」；沒有「誰最強」',ok&&!!sch&&sch.zone==='campus'&&T()[0]==='這是上次那位同學？'&&J(T().slice(-3))===J(['（芯慈看了你一眼，耳朵有點紅。）','……好。','……走吧。他等一下會問你喜歡吃什麼。我會說。'])&&!J(DE.dialogue).includes('誰最強')&&T().filter(t=>!/^（/.test(t)).every(t=>DOC8.includes(t)),J(T()));
    full(G=>{ G.flags['dating_'+XC]=false; },CALENDAR.dateOf(fri).key); H.G.hour=17.6; check('13. 8-1 沒在交往不演',DE.prereq.custom(H.G)===false);
    /* 8-2 挽回 */
    const d0=D('2028-10-05');
    full(G=>{ G.flags.XC_FOUND={n:1,day:d0}; G.flags.EX_classmate_xinci=true; ROM.start(G,ZQ_); },CALENDAR.dateOf(d0).key); ROM.end(H.G,ZQ_,'apart_talk');
    const ro=()=>[].concat(...STORY.TALK_OPTS.map(f=>{ try{ return f(H.G,XC,GM)||[]; }catch(e){ return []; } })).find(o=>o&&o.t===X().REPAIR_OPT);
    H.G.day=d0+29; const before=!!ro(); H.G.day=d0+30; const o2=ro(); H.said=[]; if(o2) await o2.run(GM);
    check('13. 8-2 挽回：和另一位結束、單身滿 30 天才有「（跟她說，你已經結束了那一段）」→「……我知道。以安說了。」「我需要時間。我會自己決定要多久。」；XC_REPAIR wait',!before&&!!o2&&J(T())===J(X().REPAIR_OPEN)&&X().REPAIR_OPEN.every(t=>DOC8.includes(t))&&H.G.flags.XC_REPAIR&&H.G.flags.XC_REPAIR.state==='wait',J(T()));
    DATE.log(H.G,XC).count+=3; H.G.flags.XC_NIGHT=(H.G.flags.XC_NIGHT|0)+1; H.said=[]; await X().repairClose(GM,{who:XC},{counted:true}); const a1=H.G.flags['dating_'+XC]===true;
    H.G.flags.XC_NIGHT+=1; await X().repairClose(GM,{who:XC},{counted:true});   /* 接在 DATE.settle 之後（count 已經算進第三次）*/
    check('13. 8-2 第三次約會結束時（DATE.settle 之後：一般、快速、心願都經過），兩樣都滿（約會 3、半夜訊息回 2）＝「我排好了。」「……這次，你什麼都先告訴我。」→ 回到交往；只滿一樣不行',!a1&&J(T())===J(X().REPAIR_YES)&&X().REPAIR_YES.every(t=>DOC8.includes(t))&&H.G.flags['dating_'+XC]===true&&H.G.flags.XC_REPAIR.state==='done',J(T()));
    full(G=>{ G.flags.XC_FOUND={n:1,day:d0}; G.flags.XC_REPAIR={state:'wait',day:d0,d0:0,n0:0}; },CALENDAR.dateOf(d0+60).key); H.G.hour=21.1; STORY.phoneRules(GM); PHONE.tick(H.G);
    check('13. 8-2 60 天沒滿＝「我想好了。我們當朋友就好。」、之後不能再挽回',(H.G.msgs||[]).some(m=>m.tag==='xc_repair_no'&&m.text===X().REPAIR_NO)&&H.G.flags.XC_REPAIR.state==='friend'&&!ro()&&DOC8.includes(X().REPAIR_NO));
    full(G=>{ G.flags.XC_FOUND={n:2,day:d0}; },CALENDAR.dateOf(d0+40).key); check('13. 第二次被發現不能挽回',!ro());
    /* 8-3 冷落 */
    const c0=D('2028-10-10'); full(G=>{ G.flags['dating_'+XC]=true; (G.flags.confessed||(G.flags.confessed={}))[XC]=c0; DATE.log(G,XC).last={trip:'T',day:c0}; },CALENDAR.dateOf(c0+28).key); H.G.hour=0.7; STORY.phoneRules(GM); PHONE.tick(H.G);
    const cm=(H.G.msgs||[]).filter(m=>/^xc_cold_/.test(m.tag||'')); H.G.day+=1; H.G.hour=0.7; STORY.phoneRules(GM); PHONE.tick(H.G);
    check('13. 8-3 冷落：交往中 28 天沒有正式約會＝00:40「你最近很忙。……免得我自己亂想。」（不用回）；同一學期只一次；不分手',cm.length===1&&cm[0].text===X().COLD&&!cm[0].ask&&DOC8.includes(X().COLD)&&(H.G.msgs||[]).filter(m=>/^xc_cold_/.test(m.tag||'')).length===1&&H.G.flags['dating_'+XC]===true,J(cm.map(m=>m.text)));
    full(G=>{ G.flags['dating_'+XC]=true; (G.flags.confessed||(G.flags.confessed={}))[XC]=c0; DATE.log(G,XC).last={trip:'T',day:c0+20}; G.flags.XCN_MISS=5; },CALENDAR.dateOf(c0+28).key); H.G.hour=0.7; STORY.phoneRules(GM); PHONE.tick(H.G);
    check('13. 8-3 半夜訊息連續 5 則沒回也算',(H.G.msgs||[]).some(m=>/^xc_cold_/.test(m.tag||''))); });

  H.done();
})();

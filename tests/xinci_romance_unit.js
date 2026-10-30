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
//   9  第 2 節：和以安分開那晚 01:10（過了 G3、G4）「今天的劇很難看。」「我看完了。」
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
  await sec('00',()=>{ check('00. 遊戲預設：這條線關著（XCROM.ON false；使用者 10-30 否決「第一名／第二名」劇情，等 AA 重寫）：DATE.HEROINES 沒有芯慈、沒有心願事件、事件沒進 STORY_EVENTS',!!X()&&X().ON===false&&!DATE.HEROINES.includes(XC)&&!DATE_WISH.events[XC]&&!STORY_EVENTS.some(e=>['ev_xc_g2_dad','ev_xc_sameday','ev_xc_call1'].includes(e.id)));
    const G=H.fresh('2028-06-10',20,'campus',{introDone:true,XC_NIGHT:9,XC5_RECONCILE:true,XC_SAMEDAY:true,XC_BLANK:true}); G.events.done.ev_xinci_notes=1; G.events.done.ev_xinci_first_place=1; (G.contacts||(G.contacts={}))[XC]=1;
    SOCIAL.remember(XC,'TALKED_FAMILY',''); SOCIAL.remember(XC,'XINCI_SECOND',''); G.l118={once:{H7c:1}}; Object.assign(SOCIAL.rel(XC),{fam:70,trust:62,comf:50,npcRom:76,rom:40}); Object.assign(DATE.log(G,XC),{count:6,wish:true,wishKnown:true});
    check('00. 關著的時候：門檻全過的存檔也不發心意邀約、告白選項藏著、半夜訊息不傳',TERMEND.heartWhy(G,XC,TERMEND.windowOf('Y3S2'))===false&&CONFESS_LINES[XC].hideIf(G)===true&&(STORY.phoneRules(GM),PHONE.tick(G),!(G.msgs||[]).some(m=>/^xcn_|^xc_/.test(m.tag||''))));
    X().setOn(true); });   /* 下面測關著的程式本身（AA 重寫以前照舊能用）*/
  await sec(0,()=>{ check('0. 全部的檔載入沒有錯誤；XCROM 載得到；setOn(true) 以後 DATE.HEROINES 有芯慈、心願事件、事件都在',!loadErr.length&&!!X()&&X().ON===true&&DATE.HEROINES.includes(XC)&&!!DATE_WISH.events[XC]&&STORY_EVENTS.some(e=>e.id==='ev_xc_sameday'),J(loadErr));
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), a=s=>html.indexOf(s);
    check('0. index.html：xcrom3d.js 在 date3d.js、termend3d.js、story3d.js 以後、GAME.boot() 以前',a('src/xcrom3d.js')>Math.max(a('src/date3d.js'),a('src/termend3d.js'),a('src/story3d.js'))&&a('src/xcrom3d.js')<a('GAME.boot()'));
    check('0. 兩個開關集中在 XCROM.CFG：G10 跟以安交往過＝使用者 10-30 選「照樣可以開」（noAnEx false）；不接受多段＝還在討論，照 AA 的建議（noOpen true）',J(X().CFG)===J({noAnEx:false,noOpen:true}));
    check('0. DATE.HEROINES 有芯慈；YES_LINE 75；心願地點 D04、要午夜場（DATE.MIDNIGHT）；告白要 6 次正式約會',DATE.HEROINES.includes(XC)&&DATE.YES_LINE[XC]===75&&DATE.wishOf(XC)==='D04'&&!!DATE.MIDNIGHT[XC]&&DATE.MIDNIGHT[XC].loc==='D04'&&DATE.COUNT_NEED[XC]===6);
    const C=CONFESS_LINES[XC];
    check('0. confess_lines（AA_537 第 4 節）：say、三句、yes、notYet、unwilling、others 照稿；notYetFlag XC_NOT_YET',!!C&&C.notYetFlag==='XC_NOT_YET'&&[].concat(C.say,C.yes,C.notYet,C.unwilling,C.others).every(x=>DOC537.includes(typeof x==='string'?x:x.text))&&C.yes.length===4&&C.others.length===3&&C.choice.length===3,'');
    const Hx=TERMEND_LINES.HEART[XC];
    const strs=[Hx.invite,Hx.decline,Hx.table,Hx.think,Hx.invite2,Hx.askFirst,Hx.noOther].concat(Hx.walk,Hx.she,Hx.she2,Hx.yes2,Hx.othersTail.map(x=>typeof x==='string'?x:x.narr));
    check('0. termend_lines HEART.classmate_xinci（AA_537b 第 7 節）：每一句都在稿裡；巷口家常菜 18:00、羅斯福路・往公館站',!!Hx&&strs.every(t=>DOC537b.includes(t)||DOC537.includes(t))&&Hx.placeName==='巷口家常菜'&&Hx.h===18&&Hx.walkPlace==='羅斯福路・往公館站',J(strs.filter(t=>!DOC537b.includes(t)&&!DOC537.includes(t))));
    check('0. NOPE knows／low（第 7 節）；舊的「今天的我排好了」作廢＝遊戲裡沒有',TERMEND_LINES.NOPE.knows[XC]==='考完了。這學期我先回家。……下學期見。'&&TERMEND_LINES.NOPE.low[XC]==='期末考完，我想先一個人待幾天。……下學期。'&&!TERMEND_LINES.NOPE.partner[XC]&&!fs.readFileSync(path.join(H.ROOT,'src/data/termend_lines.js'),'utf8').includes('今天的我排好了')); });

  /* ===== 第 1 節：門檻 ===== */
  await sec(1,()=>{ full(); const g=X().gates(H.G);
    check('1. 全部門檻都過的存檔：G1～G10 都 true、心意邀約發（heartWhy true）',Object.values(g).every(Boolean)&&heart()===true,J(g));
    const OFF={G1:G=>{ delete G.contacts[XC]; },G2:G=>{ G.social.mem[XC]=G.social.mem[XC].filter(m=>m.tag!=='TALKED_FAMILY'); },G3:G=>{ G.l118.once={}; },G4:G=>{ G.flags.XC_FIX='yes'; },
      G5:G=>{ G.flags.XC_NIGHT=5; },G6:G=>{ delete G.flags.XC5_RECONCILE; },G7:G=>{ delete G.flags.XC_SAMEDAY; },G8:G=>{ delete G.flags.XC_BLANK; },
      G9a:G=>{ SOCIAL.rel(XC).npcRom=69; },G9b:G=>{ SOCIAL.rel(XC).trust=59; },G9c:G=>{ DATE.log(G,XC).count=5; },G9d:G=>{ DATE.log(G,XC).wish=false; }};
    const bad=[]; for(const k of Object.keys(OFF)){ full(null); OFF[k](H.G); if(heart()!==false) bad.push(k); H.G.flags.NOPE_SENT=0; }
    check('1. 每一道單獨拿掉＝不發、也不傳 NOPE（heartWhy false）：G1 聯絡方式、G2、G3 H7c、G4（補演沒接電話）、G5 5 次、G6、G7、G8、G9 戀愛 69／信任 59／5 次／沒去心願',bad.length===0,J(bad));
    full(); H.G.flags.XC_FIX='yes'; H.G.flags.XC_CALL1=true; check('1. G4：補演的玩家接了 3-3 那通電話（XC_CALL1）＝過',X().gates(H.G).G4===true&&heart()===true);
    full(G=>{ G.flags.EX_heroine_01=true; }); check('1. G10：跟以安交往過（分開了）＝照樣可以開（使用者 10-30）',X().gates(H.G).G10===true&&heart()===true);
    X().CFG.noAnEx=true; check('1. G10 的開關打開（AA 原本的建議）＝跟以安交往過就不開',X().gates(H.G).G10===false&&heart()===false); X().CFG.noAnEx=false;
    full(); STORY._abroadT=STORY.abroad; STORY.abroad=()=>true; const ab=heart(); STORY.abroad=STORY._abroadT;
    check('1. 人在國外那一學期沒有（AA_537 1-1）',ab===false);
    full(); check('1. hideIf（confess_lines）：全過＝不藏；G7 沒過＝藏',CONFESS_LINES[XC].hideIf(H.G)===false&&(delete H.G.flags.XC_SAMEDAY,CONFESS_LINES[XC].hideIf(H.G)===true));
    full(); const L=DATE.log(H.G,XC); L.count=4; const p4=DATE.progress(H.G,XC); L.count=6; const p6=DATE.progress(H.G,XC);
    check('1. 人物頁的進度條：芯慈要 6 次（4 次時還寫「再多一些兩個人出去的時間」）',p4&&p4.rom&&p4.rom.hint===DATE.PROG_HINT.count&&p6&&p6.rom&&p6.rom.hint==='',J([p4,p6])); });

  /* ===== 第 2 節：回家的路上 ===== */
  await sec(2,async()=>{ const Hx=TERMEND_LINES.HEART[XC], C=CONFESS_LINES[XC];
    full(); let r=await walk(['我喜歡妳。']);
    check('2. 玩家先說（戀愛 76 ≥ 75）：她先問「你現在有在跟誰交往嗎。」→ 祐廷「沒有。」→ AA_537 第 4 節 yes → 交往',r==='yes'&&H.G.flags['dating_'+XC]===true&&J(T().slice(T().indexOf(Hx.askFirst)))===J([Hx.askFirst,'沒有。'].concat(C.yes.map(x=>typeof x==='string'?x:x.text)))&&H.G.flags.XC_ASKED===H.G.day,J(T()));
    full(G=>{ SOCIAL.rel(XC).npcRom=72; }); r=await walk(['我喜歡妳。']);
    check('2. 玩家先說、戀愛 72（< 75）：「沒有。」以後 notYet「我還沒想好……」「這不是拒絕……」；不交往、這學期記 think（下學期第二次）、XC_NOT_YET',r==='notYet'&&!H.G.flags['dating_'+XC]&&J(T().slice(-2))===J(C.notYet)&&!!H.G.flags.XC_NOT_YET&&(H.G.termend.think||{})[XC]==='Y3S2',J(T()));
    full(G=>{ G.flags['dating_'+ZQ]=true; }); r=await walk(['我喜歡妳。']);
    check('2. 有別的交往對象（她不知道）：問完接 others 後兩行「（她沒等你回答。）」「我不想當第二個……」；不交往、沒有「沒有。」',r==='others'&&!H.G.flags['dating_'+XC]&&J(T().slice(-3))===J([Hx.askFirst,'（她沒等你回答。）','我不想當第二個。這句話很爛，可是是真的。'])&&!T().includes('沒有。'),J(T()));
    full(); r=await walk(['先不說','好']);
    check('2. 她先說（先不說）：she 四句（最後一句是問題）→「沒有。」→ 好／讓我想想 →「好。」＝交往',r==='sheSaid'&&H.G.flags['dating_'+XC]===true&&J(T().slice(-5))===J(Hx.she.concat(['沒有。'])),J(T()));
    full(G=>{ G.flags['dating_'+ZQ]=true; }); r=await walk(['先不說']);
    check('2. 她先說、你有別的交往對象：問完接 others 後兩行，不出好／讓我想想',r==='others'&&!H.G.flags['dating_'+XC]&&J(T().slice(-3))===J([Hx.she[3],'（她沒等你回答。）','我不想當第二個。這句話很爛，可是是真的。'])&&!H.opts.some(o=>o.includes('「好。」')),J([T(),H.opts]));
    full(); r=await walk(['先不說','讓我想想']); const th=H.G.termend.think[XC];
    check('2. 她先說、選「讓我想想」：「好。我把它排進下學期。……不要讓我排到畢業。」',r==='think'&&T().slice(-1)[0]===Hx.think&&th==='Y3S2',J(T()));
    r=await walk(['先不說','好'],'Y4S1'); check('2. 第二次（上學期讓我想想）：she2「上次那件事，我的答案沒變。」「……你現在有在跟誰交往嗎。」→「沒有。」→ 好',r==='sheSaid'&&J(T().slice(-3))===J(Hx.she2.concat(['沒有。'])),J(T())); });

  /* ===== 第 3 節：她知道你有別人 ===== */
  await sec(3,()=>{ full(G=>{ G.flags['dating_'+ZQ]=true; ROM.learn(G,XC,ZQ,'test'); }); const h=heart();
    check('3. 她知道祐廷在和子晴交往（knowsRel）＝不發、傳 NOPE.knows（{nope:knows}）',!!h&&h.nope==='knows',J(h));
    X().CFG.noOpen=false; const h2=heart(); X().CFG.noOpen=true;
    check('3. 多段的開關打開（使用者如果說可以）：她的知情條件（KNOWS_OK）過＝照發',h2===true,J(h2)); });

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
    const nd=(()=>{ for(let k=1;k<=5;k++){ const d=STORY.termDay('Y2S1',3,k); if(STORY.noodleDay(d)) return d; } return null; })();
    H.fresh(CALENDAR.dateOf(nd).key,18,'noodle',{introDone:true}); SOCIAL.remember(XC,'FIRST_MET','camp');
    const pre=E&&E.prereq.custom(H.G), wk=E&&E.term[0]==='Y2S1'&&J(E.weeks)===J([3])&&E.ndlDay===true&&E.npcPresent===XC;
    H.said=[]; H.picks=['妳爸怎麼了']; await EVENTS.run(E);
    check('6. 3-1：大二上第 3 週麵店日、她在，慈 2 兩個都沒記＝「我爸是會計師。……算了，沒什麼。」→「妳爸怎麼了？」＝兩句、記 TALKED_FAMILY（G2 過）',!!E&&pre===true&&wk&&J(T())===J(['我爸是會計師。……算了，沒什麼。','他說，法律系畢業沒有第二專長會餓死。','……所以我有第二專長。'])&&X().gates(H.G).G2===true&&T().every(t=>DOC537.includes('> 芯慈：'+t)),J(T()));
    check('6. 3-1：記過 TALKED_FAMILY（或 ECON_TOGETHER）的不演',E.prereq.custom(H.G)===false);
    H.fresh(CALENDAR.dateOf(nd).key,18,'noodle',{introDone:true}); H.said=[]; H.picks=['不問']; await EVENTS.run(E); check('6. 3-1：「（不問）」＝不記',J(T())===J(['我爸是會計師。……算了，沒什麼。'])&&!X().gates(H.G).G2);
    const d=STORY.termDay('Y2S2',10,4); const msgs=()=>(H.G.msgs||[]).filter(m=>m.tag==='xc_g3_remind').map(m=>m.text);
    H.fresh(CALENDAR.dateOf(d).key,0.5,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; STORY.phoneRules(GM); PHONE.tick(H.G); const before=msgs().length; H.G.hour=0.7; STORY.phoneRules(GM); PHONE.tick(H.G);
    check('6. 3-2：大二下第 10 週週四 00:40（還沒過 G3、有聯絡方式）三則照稿；00:40 以前沒有',before===0&&J(msgs())===J(X().G3_REMIND)&&X().G3_REMIND.every(t=>DOC537.includes('> 芯慈：'+t)),J(msgs()));
    H.fresh(CALENDAR.dateOf(d).key,0.7,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; H.G.l118={once:{H7c:3}}; STORY.phoneRules(GM); PHONE.tick(H.G); check('6. 3-2：已經選過「她今天要換。」＝不傳',msgs().length===0);
    const d4=STORY.termDay('Y4S1',6,3); H.fresh(CALENDAR.dateOf(d4).key,14.1,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_first_place=1; STORY.phoneRules(GM); PHONE.tick(H.G);
    const m=(H.G.msgs||[]).find(x=>x.tag==='xc_blank_again'); const r=m&&PHONE.answer(H.G,'xc_blank_again',0);
    check('6. 3-5 後補：大四上第 6 週週三 14:00「週三下午還是空的。」→ 回「我來填。」記 XC_BLANK',!!m&&m.text==='週三下午還是空的。'&&!!r&&H.G.flags.XC_BLANK===true&&DOC537.includes('> 芯慈：週三下午還是空的。')); });

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
    H.said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_xc_call1')); const W=['……你還沒睡。','我在看一部劇。女主角考了第二名，哭了一整集。','我覺得很蠢。可是我也哭了。','你不用說什麼。我只是想講出來。'];
    check('8. 接起來：照稿四句＋旁白「（她講到一點半……又說了一次。）」、記 XC_CALL1（G4 過）',J(T().slice(0,4))===J(W)&&T()[4]==='（她講到一點半。你們掛電話的時候，她說了「晚安」，又說了一次。）'&&H.G.flags.XC_CALL1===true&&X().gates(H.G).G4===true&&W.every(t=>DOC537.includes('> 芯慈：'+t)),J(T()));
    H.fresh(CALENDAR.dateOf(d-1).key,20,'dorm',{introDone:true,XC_FIX:'yes'}); SOCIAL.remember(XC,'XINCI_SECOND',''); at(d-1,20); STORY_EVENTS.find(e=>e.id==='ev_xc_call1').outingMissed(H.G); at(d,8.6);
    const m=(H.G.msgs||[]).find(x=>x.tag==='xc_call1_miss');
    check('8. 不接：隔天早上「打錯了。」，G4 沒過',!!m&&m.text==='打錯了。'&&X().gates(H.G).G4===false&&DOC537.includes('「打錯了。」'));
    H.fresh(CALENDAR.dateOf(d-1).key,20,'dorm',{introDone:true}); at(d-1,20); check('8. 慈 3 照常演過的（沒有 XC_FIX）：沒有這通電話',!OUT.get(H.G,'xc_call1')); });

  /* ===== 第 9 節：第 2 節 和以安分開以後那一則 ===== */
  await sec(9,()=>{ const d=D('2027-11-10'); X().CFG.noAnEx=true; H.fresh('2027-11-10',20,'dorm',{introDone:true});   /* 這一則只在 G10 開關打開時傳（使用者 10-30 選「照樣可以開」＝現在不傳，最後一項查）*/ H.G.contacts={[XC]:1}; H.G.l118={once:{H7c:1}}; SOCIAL.remember(XC,'XINCI_SECOND','');
    ROM.start(H.G,AN); ROM.end(H.G,AN,'apart_talk'); STORY.phoneRules(GM); PHONE.tick(H.G); const before=(H.G.msgs||[]).filter(m=>m.tag==='xc_an_break').length; H.G.day=d+1; H.G.hour=1.2; STORY.phoneRules(GM); PHONE.tick(H.G);
    const m=(H.G.msgs||[]).filter(x=>x.tag==='xc_an_break');
    check('9. 和以安分開那晚 01:10（過了 G3、G4）：「今天的劇很難看。」「我看完了。」；G10 不過',before===0&&!!m[0]&&m[0].day===d+1&&m[0].h>=1.16&&J(m.map(x=>x.text))===J(X().AN_BREAK)&&X().AN_BREAK.every(t=>DOC537.includes('> 芯慈：'+t))&&X().gates(H.G).G10===false,J(m.map(x=>[x.day,x.h,x.text])));
    H.fresh('2027-11-10',20,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; ROM.start(H.G,AN); ROM.end(H.G,AN,'apart_talk'); H.G.day=d+1; H.G.hour=1.2; STORY.phoneRules(GM); PHONE.tick(H.G);
    check('9. 還沒過 G3、G4 的：不傳',!(H.G.msgs||[]).some(x=>x.tag==='xc_an_break')); X().CFG.noAnEx=false;
    H.fresh('2027-11-10',20,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; H.G.l118={once:{H7c:1}}; SOCIAL.remember(XC,'XINCI_SECOND',''); ROM.start(H.G,AN); ROM.end(H.G,AN,'apart_talk'); H.G.day=d+1; H.G.hour=1.2; STORY.phoneRules(GM); PHONE.tick(H.G);
    check('9. 使用者 10-30 選「照樣可以開」（開關關著）：分開那晚不傳這一則、G10 照樣過',!(H.G.msgs||[]).some(x=>x.tag==='xc_an_break')&&X().gates(H.G).G10===true); });

  /* ===== 第 10 節：G5 半夜訊息（AA_537b 第 9 節 8acf3b308）===== */
  await sec(10,()=>{ const DOC9=doc('8acf3b308','AA_537b_吳芯慈_第二份_約會台詞_校外地點_期末飯_節日.md'), N=X();
    const all=N.NIGHT_A.concat(N.NIGHT_B), bad=[];
    for(const x of all){ const row=DOC9.split('\n').find(l=>l.startsWith('| '+x.k+' ')||l.startsWith('| '+x.k+'（')); if(!row){ bad.push(x.k+' 沒有這一列'); continue; } const c=row.split('|').map(z=>z.trim());
      if(c[2]!==x.m.join('／')) bad.push(x.k+' 她傳：'+x.m.join('／')); const want=x.o.map(([t,r])=>'「'+t+'」→ '+r).join('<br>'); if(c[3]!==want) bad.push(x.k+' 選項'); }
    check('10. 十六則（A 八、B 八）逐字對稿：她傳的泡泡、三個選項、她回的一句',all.length===16&&!bad.length,J(bad));
    check('10. L 層八句（AA_537 5-2）、mention（8-2）、「你應該睡了吧。」照稿',N.NIGHT_L.length===8&&N.NIGHT_L.every(t=>DOC537.includes('「'+t+'」'))&&N.MENTION.o.slice(0,2).every(([t,r])=>DOC537b.includes('「'+t+'」→ 芯慈：'+r))&&DOC537b.includes('> 芯慈：'+N.MENTION.m[0])&&DOC537.includes('「'+N.WAKE+'」'));
    /* 跑一段時間：每天看那一週的時段 */
    const run=(from,to,ans)=>{ const got=[]; for(let d=from;d<=to;d++){ const sl=N.nightSlot(d); if(sl.day!==d) continue; H.G.day=d; H.G.hour=sl.h+0.02; H.G.weekday=CALENDAR.dateOf(d).wd%7; STORY.phoneRules(GM); PHONE.tick(H.G);
        const m=(H.G.msgs||[]).filter(x=>x.day===d&&x.th==='p:'+XC&&x.ask&&/^xcn_/.test(x.ask.id)).pop(); if(m){ got.push([CALENDAR.dateOf(d).wd%7,m.text]); if(ans){ H.G.hour=sl.h+ans; PHONE.answer(H.G,m.ask.id,0); } } } return got; };
    const d0=D('2026-12-14'); H.fresh('2026-12-14',12,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.flags.XCN_START=d0;
    const g=run(d0+1,d0+28,0.25);
    check('10. 慈 3 以後每週一則：A1、A2、A3、A4 照順序；週三、週日一週一週輪流；00:30～01:30',g.length===4&&J(g.map(x=>x[1]))===J(N.NIGHT_A.slice(0,4).map(x=>x.m[x.m.length-1]))&&g.every(x=>x[0]===3||x[0]===0)&&g[0][0]!==g[1][0],J(g));
    check('10. 每一則都在 30 分鐘內回＝XC_NIGHT 4',(H.G.flags.XC_NIGHT|0)===4,H.G.flags.XC_NIGHT);
    run(d0+29,d0+36,0.75); check('10. 超過 30 分鐘才回＝不算（XC_NIGHT 還是 4）',(H.G.flags.XC_NIGHT|0)===4,H.G.flags.XC_NIGHT);
    H.fresh('2027-10-04',12,'dorm',{introDone:true,XC5_RECONCILE:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.flags.XCN_START=D('2027-10-03');
    const gb=run(D('2027-10-04'),D('2027-10-04')+20); check('10. 慈 5 以後換 B：B1、B2、B3',J(gb.map(x=>x[1]))===J(N.NIGHT_B.slice(0,3).map(x=>x.m[x.m.length-1])),J(gb));
    H.fresh('2028-05-10',12,'dorm',{introDone:true,XC5_RECONCILE:true,XCN:{a:0,b:2,l:0}}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.events.done.ev_xinci_first_place=1; H.G.flags.XCN_START=D('2028-05-09');
    const g6=run(D('2028-05-10'),D('2028-05-10')+48); check('10. 慈 6 以後：B3 不傳（改輔系了）、B8 會傳',!g6.some(x=>x[1]===N.NIGHT_B[2].m.slice(-1)[0])&&g6.some(x=>x[1]===N.NIGHT_B[7].m.slice(-1)[0]),J(g6.map(x=>x[1])));
    H.fresh('2027-10-04',12,'dorm',{introDone:true,XC5_RECONCILE:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.flags.XCN_START=D('2027-10-03'); const r=SOCIAL.rel(XC); r.fam=62; r.trust=46; r.comf=41; r.npcRom=10;
    const gm=run(D('2027-10-04'),D('2027-10-04')+13); const wm=(H.G.msgs||[]).find(x=>x.tag==='xcn_wish');
    check('10. mention：大三上起、交往前第 4 階以上的第一則＝「我想看一次午夜場。一個人去好像有點怪。」（三個選項），那一週代替、知道心願（wishKnown）；下一週接 B1',!!wm&&wm.text===N.MENTION.m[0]&&J(wm.ask.opts.map(o=>o.t))===J(['我陪妳。','哪一部？','（不回）'])&&DATE.log(H.G,XC).wishKnown===true&&gm[1]&&gm[1][1]===N.NIGHT_B[0].m.slice(-1)[0],J(gm));
    H.G.hour=wm.h+0.1; PHONE.answer(H.G,'xcn_wish',2); check('10. mention 選「（不回）」＝不貼玩家的話、不算 XC_NIGHT',!(H.G.flags.XC_NIGHT|0));
    H.fresh('2027-10-04',12,'dorm',{introDone:true}); H.G.contacts={[XC]:1}; H.G.events.done.ev_xinci_second=1; H.G.flags.XCN_START=D('2027-10-03');
    check('10. 線關上（大三上第 14 週過了還沒和以安和好＝G6 沒過）：之後不傳',run(STORY.termDay('Y3S1',14,1),STORY.termDay('Y3S1',14,1)+20).length===0);
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

  H.done();
})();

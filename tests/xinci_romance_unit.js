// 吳芯慈可以交往（很難）：XINCI-ROMANCE-1030（使用者 2026-10-30 X139「芯慈可攻略 但要很難達成 請AA規劃」；AA_537 企劃線 2f523e21a、AA_537b 86659bbc1）——不需要瀏覽器。
//   第 1 段（告白）＋第 4 段（一）（AA_537b 約會台詞）：
//   0  src/xcrom3d.js 載得到、index.html；兩個開關（G10 以安、多段）在 XCROM.CFG；DATE.HEROINES、YES_LINE 75、心願 D04（晚上場）、告白要 6 次；confess_lines、termend_lines 的字照稿
//   1  門檻 G1～G10：每一道單獨拿掉＝心意邀約不發（也不傳 NOPE）；全過＝發；最早大三下（慈 6 以後）；跟以安交往過＝不發（開關關掉＝發）
//   2  學期末回家的路上：玩家先說——她先問「你現在有在跟誰交往嗎。」→ 祐廷「沒有。」→ 戀愛 ≥ 75 答應（交往）、不到＝notYet（下學期第二次）；
//      有別的交往對象（她不知道）＝others 後兩行、不交往；她先說（先不說）——she 最後一句就是問題，有對象＝others、沒有＝「沒有。」再出好／讓我想想
//   3  她知道你有別人＝心意邀約不發、時段第一天傳 NOPE.knows；多段的開關打開＝照一般的知情條件
//   4  AA_537b 第 1～3 節（date_lines.js）：十一個 key、128 點喜好、15 句不喜歡、八個常去地點，逐字對稿
//   5  第 2 段：慈 6 那一場最後「空白的週三下午」（3-5，G8 XC_BLANK）、沒和以安和好多一句（3-6）
//   6  第 2 段：3-1 大二上麵店補問（G2）、3-2 大二下半夜提醒（G3）、3-5 後補（大四上第 6 週週三）
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
  await sec(0,()=>{ check('0. 全部的檔載入沒有錯誤；XCROM 載得到',!loadErr.length&&!!X(),J(loadErr));
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), a=s=>html.indexOf(s);
    check('0. index.html：xcrom3d.js 在 date3d.js、termend3d.js、story3d.js 以後、GAME.boot() 以前',a('src/xcrom3d.js')>Math.max(a('src/date3d.js'),a('src/termend3d.js'),a('src/story3d.js'))&&a('src/xcrom3d.js')<a('GAME.boot()'));
    check('0. 兩個開關集中在 XCROM.CFG（使用者還沒回：G10 跟以安交往過就不開、不接受多段＝照 AA 的建議先開著）',J(X().CFG)===J({noAnEx:true,noOpen:true}));
    check('0. DATE.HEROINES 有芯慈；YES_LINE 75；心願地點 D04、要晚上場；告白要 6 次正式約會',DATE.HEROINES.includes(XC)&&DATE.YES_LINE[XC]===75&&DATE.wishOf(XC)==='D04'&&DATE.WISH_KIND[XC]==='evening'&&DATE.COUNT_NEED[XC]===6);
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
      G9a:G=>{ SOCIAL.rel(XC).npcRom=69; },G9b:G=>{ SOCIAL.rel(XC).trust=59; },G9c:G=>{ DATE.log(G,XC).count=5; },G9d:G=>{ DATE.log(G,XC).wish=false; },G10:G=>{ G.flags.EX_heroine_01=true; }};
    const bad=[]; for(const k of Object.keys(OFF)){ full(null); OFF[k](H.G); if(heart()!==false) bad.push(k); H.G.flags.NOPE_SENT=0; }
    check('1. 每一道單獨拿掉＝不發、也不傳 NOPE（heartWhy false）：G1 聯絡方式、G2、G3 H7c、G4（補演沒接電話）、G5 5 次、G6、G7、G8、G9 戀愛 69／信任 59／5 次／沒去心願、G10 跟以安分開過',bad.length===0,J(bad));
    full(); H.G.flags.XC_FIX='yes'; H.G.flags.XC_CALL1=true; check('1. G4：補演的玩家接了 3-3 那通電話（XC_CALL1）＝過',X().gates(H.G).G4===true&&heart()===true);
    full(); H.G.flags['dating_'+AN]=true; check('1. G10：正在跟以安交往＝不開',X().gates(H.G).G10===false&&heart()===false);
    X().CFG.noAnEx=false; check('1. G10 的開關關掉（使用者如果說可以）＝跟以安交往過也照常算',X().gates(H.G).G10===true); X().CFG.noAnEx=true;
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

  /* ===== 第 5 節：第 2 段 3-5、3-6（慈 6 那一場）===== */
  await sec(5,async()=>{ const ev=id=>STORY_EVENTS.find(e=>e.id===id);
    const play=async(fl,picks)=>{ H.fresh('2028-05-04',19.2,'noodle',Object.assign({introDone:true},fl)); const r=SOCIAL.rel(XC); r.fam=30; SOCIAL.remember(XC,'FIRST_MET','camp'); H.said=[]; H.opts=[]; H.picks=picks.slice(); await EVENTS.run(ev('ev_xinci_first_place')); return T(); };
    const B=['週三下午，原本是經濟系的課。','現在空出來了。','我第一次有一個不知道要做什麼的下午。'];
    let t=await play({XC5_RECONCILE:true},[0,'那我來填']);
    check('5. 3-5：慈 6 最後「週三下午，原本是經濟系的課。」「現在空出來了。」「我第一次有一個不知道要做什麼的下午。」→「那我來填。」＝「……好。不要填太滿。」、XC_BLANK',J(t.slice(-4))===J(B.concat(['……好。不要填太滿。']))&&H.G.flags.XC_BLANK===true&&B.concat(['……好。不要填太滿。']).every(x=>DOC537.includes('> 芯慈：'+x)),J(t.slice(-5)));
    t=await play({XC5_RECONCILE:true},[0,'休息']); const t2=await play({XC5_RECONCILE:true},[0,'以安念的']);
    check('5. 3-5：另外兩個「休息。……我試試看。」「不要。……謝謝。」，不記 XC_BLANK',t.slice(-1)[0]==='休息。……我試試看。'&&t2.slice(-1)[0]==='不要。……謝謝。'&&!H.G.flags.XC_BLANK,J([t.slice(-1),t2.slice(-1)]));
    t=await play({},[0,'那我來填']); const i=t.indexOf('一點都不好玩。');
    check('5. 3-6：沒和以安和好（沒有 XC5_RECONCILE）＝「一點都不好玩。」後面多「我還是想知道她考幾分。……很爛吧。」；和好的沒有',t[i+1]==='我還是想知道她考幾分。……很爛吧。'&&DOC537.includes('> 芯慈：我還是想知道她考幾分。……很爛吧。')&&!(await play({XC5_RECONCILE:true},[0,'那我來填'])).includes('我還是想知道她考幾分。……很爛吧。'),J(t.slice(i,i+2)));
    check('5. 視訊版（日本路線）同一份台詞（XC_LINES）',J(ev('ev_xinci_first_place_video').dialogue.slice(1))===J(ev('ev_xinci_first_place').dialogue)); });

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

  H.done();
})();

// AA_727（企劃線 2e81aac12；任務 Y0-E05-BIKE-LOCATION-1107；BB_255 CC 試玩：可昕的立繪出現在男舍前面）——不需要瀏覽器（D131）。
// ev_y0_e05「鏈子掉了」原本 location:'any'＋background:'blur'：9/20 17:00 人在哪裡就在哪裡演。改成：
//   1 E05 在普通教學館前（zone putong）演、背景用 3D（不模糊）
//   2 P2 選公館（9/19，人已經在 putong）：P2 演完直接接 E05，在 putong、不模糊
//   3 9/20（五）17:00 她傳兩則「我的腳踏車鏈子掉了。」「……你在學校嗎？普通教學館前面。」＋兩個回覆（AA_727 原句，讀稿對字）；之前不傳；P2 已經演過 E05 的不傳
//   4 回「我過去。」＝10 分鐘後、「等我一下，我騎過去。」＝20 分鐘後在 putong 見面；到了才演（人在宿舍不演；沒回之前在 putong 也不演）；
//     回的時候人就在 putong＝現在就演；在家＝照路程 30 分鐘
//   5 經濟系事件接事件（ECONFF）：從 9/19 往後跳，停在 17:00 那兩則（打開她的對話）；回了以後跳到見面的時間、帶到 putong、演；快轉不會跳過去
//   6 一直沒回：快轉停在 19:00「沒事了。路過的人幫我裝好了。」「制服我洗好了。下次上課拿給你。」、E05 不演、E05_OPEN 'self'、下一步是 9/21 系烤；之後 putong 也不演、P2 選公館不補
//   7 E06／D2：fix＝22:30 照舊；self＝E06 不發、D2 照發（她那一則以後、當天）；可昕大一上的手機小事（kx1）self 也開；9/20 晚上「洗手上的油」那張卡只有 9/20 演過才出
//   8 ?nofastecon 舊流程：回了＝出發選單（只有「出發」）→ 帶到 putong、到了演；自己先走到也演、演完出發選單收掉
//   9 不能回家（homeHold）：沒回到 19:00、回了到演完；self 不擋；舊存檔（E05 演過）照舊
//   以下 AA_727 第二版（企劃線 85ce68113，讀稿對字）：
//   10 回了、約好的時間過了 30 分鐘還沒到 putong（兩種流程）：「你不用來了。」「我牽去車行了。……制服下次上課拿給你。」、self（D2 照發、E06 不發）；人在 putong 不傳
//   11 制服：self 以後下一堂和她一起的經濟系課——快轉自動出席＝之後第一張日期卡下面兩句；舊流程真的去上＝下課演；一次；fix 不出
//   12 之後的 P2（9/26）選公館、E05 演過或 self：p2LaterGongguan 兩句、時間往後 1.5 小時；第一次照舊接 E05
// 修改前（f186ad035 的 src，第一版）：FAILED 33、PASS 10（當時 45 項）。
// 第二版修改前（e647887c7 的 src；git archive 出來沒有 .git＝兩項讀稿只印 NOTE）：FAILED 13、PASS 49（第 6 節第二則、第 7 節 D2、第 10～12 節）；修改後 ALL PASS（64 項，含兩項讀稿）。用法：node tests/e05_putong_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa529_econ_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ /* 載不進來的（要瀏覽器的）略過 */ } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.syncWeekday=()=>{ const G=H.G; G.weekday=((CALENDAR.dateOf(G.day).wd%7)+7)%7; };
const phoneOpened=[]; GM.phoneThread=async th=>{ phoneOpened.push(th); };
const entered=[]; GM.enter=async(z,at)=>{ entered.push([z,at?{x:at.x,z:at.z}:null]); H.G.zone=z; };
GM.titleCard=async(a,b)=>{ H.cards.push([a,b]); };
const D=k=>STORY.dayOfKey(k), d19=D('2024-09-19'), d20=D('2024-09-20'), d21=D('2024-09-21');
const setAt=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=((CALENDAR.dateOf(d).wd%7)+7)%7; E.hour=h; };
const econ=(key,h,flags,zone)=>{ const G=H.fresh(key,h,zone||'dorm',Object.assign({E01_MORNING:true,LEAVE_WEEK:6,KX_FIRST_MSG:true,PLAYED_Y0:false},flags||{}));
  G.stage='econ'; G.outings=[]; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G); G.events.done.ev_y0_e02=1;
  E.player.busy=false; E.paused=false; E.player.lv=0; E.player.seat=null; E.player.path=null; E.player.obj.position={x:0,y:0,z:0}; E.npcs.length=0; GM.npc={}; ADV.active=false; if(STORY._bindGM) STORY._bindGM(GM); setAt(G.day,h); phoneOpened.length=0; entered.length=0; return G; };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const runPh=(h0,h1,st)=>{ st=st||0.25; for(let x=h0;x<=h1+1e-9;x+=st){ H.G.hour=+x.toFixed(4); E.hour=H.G.hour; ph(); } };
const KX=()=>(H.G.msgs||[]).filter(m=>m.th==='p:kexin');
const kxT=()=>KX().map(m=>(m.from==='player'?'我：':'')+m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null, e5=ev('ev_y0_e05'), p2=ev('ev_y0_p2');
const done5=()=>!!(H.G.events&&H.G.events.done&&H.G.events.done.ev_y0_e05);
const settle=async()=>{ for(let i=0;i<80;i++){ await new Promise(r=>setTimeout(r,5)); if(!EVENTS.running) return; } };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const E05L1='（可昕的腳踏車鏈子掉了，她蹲在路邊研究。車籃裡放著一件折好的制服。你的。）';
const played=()=>H.said.some(s=>s.t===E05L1);
const selfF=G=>Object.assign(G.flags,{E05_OPEN:'self',E05_SELF_DAY:d20,E05_SELF_H:19});   /* 9/20 19:00 沒回＝self（同 STORY.e05Self）*/
const uW=(G,t)=>!!(ECONFF.uniWant&&ECONFF.uniWant(G,t)), uA=(G,l)=>ECONFF.uniAdd?ECONFF.uniAdd(G,l):'(沒有 ECONFF.uniAdd)';   /* 修改前沒有這兩個：照 FAIL 算、不丟例外 */
const bgOfE05=()=>{ /* E05 那一段 ADV.begin 的背景：最後一個 begin（P2 選公館：第一個是 P2 的） */ return H.bgs[H.bgs.length-1]; };
/* AA_727（企劃線 2e81aac12）的原句；讀得到那個 commit（本機 repo 有企劃線）就逐字對稿，讀不到（GitHub Actions 的淺 clone、git archive 出來的目錄）只印一行說明 */
const MSGS=['我的腳踏車鏈子掉了。','……你在學校嗎？普通教學館前面。'], OPTS=['我過去。','等我一下，我騎過去。'], SAYS=['好。我在停車架這邊。','嗯。不用急。……我也修不好。'], SKIPMSG='沒事了。路過的人幫我裝好了。';
/* AA_727 第二版（企劃線 85ce68113）：self 19:00 的第二則、制服、沒到（noShow）、之後的 P2 選公館 */
const SKIP2='制服我洗好了。下次上課拿給你。', NOSHOW=['你不用來了。','我牽去車行了。……制服下次上課拿給你。'], UNI=['（下課的時候，她把一個紙袋塞給你。裡面是那件制服，摺得很整齊。）','「洗好了。」'],
  P2L=['（你們六個人擠在公館一間小吃店。品妤點了最便宜的那一份，阿勳把湯喝光了。）','（散場的時候，可昕騎在最前面，回頭喊了一聲：「下次換河濱！」）'];
let SPEC2=null; try{ SPEC2=JSON.parse(cp.execSync('git -c core.quotepath=false show 85ce68113:"docs/story_planning/AA_727_E05地點.json"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']})).location; }catch(e){ SPEC2=null; }
let SPEC=null; try{ SPEC=JSON.parse(cp.execSync('git -c core.quotepath=false show 2e81aac12:"docs/story_planning/AA_727_E05地點.json"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']})).location; }catch(e){ SPEC=null; }
(async()=>{
  if(SPEC) check('0. 讀稿：遊戲用的句子和 AA_727（2e81aac12）一字不差（兩則、兩個回覆、她的兩句、19:00 那一則）',J(SPEC.msgs)===J(MSGS)&&J(SPEC.opts.map(o=>o.t))===J(OPTS)&&J(SPEC.opts.map(o=>o.say[0]))===J(SAYS)&&(/「([^」]+)」/.exec(SPEC.skip)||[])[1]===SKIPMSG);
  else console.log('NOTE 0. 讀不到 AA_727（2e81aac12 不在這個 checkout）：用測試裡抄的原句');
  if(SPEC2) check('0. 讀稿：第二版（85ce68113）self 19:00 兩則、制服兩句、noShow 兩則、之後的 P2 選公館兩句，和遊戲用的一字不差',J(SPEC2.self.msgAfter19)===J([SKIPMSG,SKIP2])&&J(SPEC2.self.uniform.lines)===J(UNI)&&J(SPEC2.noShow.msgs)===J(NOSHOW)&&J(SPEC2.p2LaterGongguan.lines)===J(P2L));
  else console.log('NOTE 0. 讀不到 AA_727 第二版（85ce68113 不在這個 checkout）：用測試裡抄的原句');
  check('0. 9/20 是 Y0S1 第 3 週的週五',STORY.termDay('Y0S1',3,5)===d20&&CALENDAR.dateOf(d20).wd===5);

  await sec('1',async()=>{
    check('1. ev_y0_e05：location putong（普通教學館前的腳踏車停放區）、背景不是 blur（3D 不模糊：freeze）',!!e5&&e5.location==='putong'&&e5.background!=='blur'&&e5.background==='freeze',e5&&J({loc:e5.location,bg:e5.background}));
    const G=econ('2024-09-20',17.5,{P2_PICK:'river'},'dorm'); check('1. 9/20 17:30 人在宿舍：不演（原本照演＝男舍前面看到她）',!EVENTS.check(e5));
    G.zone='putong'; check('1. 9/20 17:30 在普通教學館、還沒回她：也不演（要先回訊息）',!EVENTS.check(e5));
  });

  await sec('2',async()=>{
    const G=econ('2024-09-19',15.2,{},'putong'); H.picks=['公館','妳真的洗了']; await EVENTS.run(p2); await settle();
    check('2. P2 選公館（9/19，人在 putong）：P2 演完直接接 E05（同一天）、E05_OPEN fix、E05_DAY 9/19',played()&&G.flags.E05_OPEN==='fix'&&G.flags.E05_DAY===d19&&G.zone==='putong',J(H.lines().slice(4,7)));
    check('2. E05 那一段的背景：3D 的 putong、不模糊（freeze）；P2 照舊 blur',H.bgs.length>=2&&H.bgs[0]==='blur'&&bgOfE05()==='freeze',J(H.bgs));
    setAt(d20,17); runPh(17,19.5); check('2. 9/19 演過：9/20 17:00 不再傳訊息、19:00 也沒有「沒事了」',!PHONE.sent(G,'y0_e05_ask')&&!KX().some(m=>m.text===SKIPMSG)&&!kxT().includes(MSGS[0]),J(kxT()));
  });

  await sec('3',async()=>{
    const G=econ('2024-09-20',16.5,{P2_PICK:'river'},'dorm'); runPh(16.5,16.75); const before=kxT().length;
    setAt(d20,17); ph(); const L=KX(), last=L[L.length-1];
    check('3. 16:59 以前不傳；9/20（五）17:00 她傳兩則（AA_727 原句）',before===0&&J(L.map(m=>m.text))===J(MSGS),J(L.map(m=>m.text)));
    check('3. 第二則可以回：兩個回覆（AA_727 原句）',!!last&&!!last.ask&&J(last.ask.opts.map(o=>o.t))===J(OPTS),last&&last.ask&&J(last.ask.opts.map(o=>o.t)));
    check('3. 訊息送到的時間＝17:00',L.length===2&&L.every(m=>m.day===d20&&Math.abs(m.h-17)<0.02),J(L.map(m=>[m.day,m.h])));
  });

  /* 4、5：經濟系事件接事件（預設，ECONFF.on） */
  const meetCase=async(k,mins,zone)=>{ const G=econ('2024-09-20',17,{P2_PICK:'river'},zone||'dorm'); ph(); const r=PHONE.answer(G,'y0_e05_ask',k);
    const reply=KX().filter(m=>m.from==='kexin').map(m=>m.text).pop(), meetAt=d20*24+17+mins/60, x=STORY.e05Step?STORY.e05Step(G):null;
    check('4. 回「'+OPTS[k]+'」：她回「'+SAYS[k]+'」；見面排在 '+mins+' 分鐘後、普通教學館（putong）',!!r&&reply===SAYS[k]&&!!x&&Math.abs(x.t-meetAt)<1e-3&&x.zone==='putong',J({reply,x}));
    check('4. 回了、人還在宿舍：不演；到 putong 才演',!EVENTS.check(e5)&&(()=>{ const z=G.zone; G.zone='putong'; const ok=EVENTS.check(e5); G.zone=z; return ok; })());
    const s9=ECONFF.next(G); check('5. 快轉的下一步還是第 9 步（E05），時間＝見面的時間',!!s9&&s9.n===9&&Math.abs(ECONFF.tOf(G,s9)-meetAt)<1e-3,s9&&J([s9.n,ECONFF.tOf(G,s9)]));
    H.picks=['妳真的洗了']; H.bgs.length=0; H.cards.length=0; await ECONFF.advance(GM); await settle();
    check('5. 快轉：跳到 '+mins+' 分鐘後（不是跳過）、帶到 putong（一樓門口）、演 E05；字卡＝地點＋路程',played()&&entered.some(e=>e[0]==='putong')&&G.zone==='putong'&&H.cards.some(c=>c[0]==='普通教學館前'&&/約 \d+ 分鐘/.test(c[1]||''))&&G.flags.E05_DAY===d20&&Math.abs((G.flags.E05_END)-(17+mins/60+1.5))<0.02,J({ent:entered,cards:H.cards,end:G.flags.E05_END}));
    check('5. 背景不模糊（freeze）；E05_OPEN fix；第 9 步記做完、下一步 9/21 系烤',bgOfE05()==='freeze'&&G.flags.E05_OPEN==='fix'&&!!ECONFF.rec(G).done[9]&&(ECONFF.next(G)||{}).ev==='ev_y0_e08',J({bgs:H.bgs,nx:(ECONFF.next(G)||{}).ev}));
    return G; };
  await sec('4',async()=>{ await meetCase(0,10); await meetCase(1,20);
    { const G=econ('2024-09-20',17,{P2_PICK:'river'},'putong'); ph(); PHONE.answer(G,'y0_e05_ask',0); const x=STORY.e05Step(G); H.picks=['妳真的洗了']; H.cards.length=0; await ECONFF.advance(GM); await settle();
      check('4. 回的時候人就在普通教學館：現在就演（不跳 10 分鐘、不換區域、不出字卡）',!!x&&Math.abs(x.t-(d20*24+17))<1e-3&&played()&&entered.length===0&&H.cards.length===0&&G.flags.E05_DAY===d20,J({x,ent:entered,cards:H.cards})); }
    { const G=econ('2024-09-20',17,{P2_PICK:'river'},'dorm'); ph(); G.zone='home'; const R=HOME.rec(G); R.at=true; PHONE.answer(G,'y0_e05_ask',0); const x=STORY.e05Step(G); R.at=false;
      check('4. 回的時候在家（不在校內）：照路程（捷運＋公車 30 分鐘）',!!x&&Math.abs(x.t-(d20*24+17.5))<1e-3&&x.card[1]==='捷運＋公車 約 30 分鐘',J(x)); }
  });

  await sec('5',async()=>{
    /* 從 9/19 P2（選河濱）以後往後跳：停在 9/20 17:00 那兩則 */
    const G=econ('2024-09-19',17,{P2_PICK:'river'},'putong'); const R=ECONFF.rec(G); for(const s of ECONFF.STEPS){ const t=ECONFF.tOf(G,s); if(t!=null&&t<d19*24+17) R.done[s.n]=1; }
    let n=0; while(n++<12&&!PHONE.sent(G,'y0_e05_ask')){ await ECONFF.advance(GM); }
    check('5. 快轉從 9/19 往後跳：停在 9/20 17:00、打開她的對話；第 9 步還沒做完、E05 還沒演',G.day===d20&&Math.abs(G.hour-17)<1e-6&&phoneOpened[phoneOpened.length-1]==='p:kexin'&&!R.done[9]&&!done5()&&KX().some(m=>m.text===MSGS[1]),J({day:G.day-d20,h:G.hour,ph:phoneOpened}));
    PHONE.answer(G,'y0_e05_ask',0); H.picks=['下次再借妳穿']; await ECONFF.advance(GM); await settle();
    check('5. 回了以後下一跳＝17:10 普通教學館、演 E05（快轉沒有跳過見面）',played()&&G.zone==='putong'&&G.flags.E05_DAY===d20&&!!R.done[9],J({z:G.zone,ent:entered}));
  });

  await sec('6',async()=>{
    const G=econ('2024-09-19',17,{P2_PICK:'river'},'putong'); const R=ECONFF.rec(G); for(const s of ECONFF.STEPS){ const t=ECONFF.tOf(G,s); if(t!=null&&t<d19*24+17) R.done[s.n]=1; }
    let n=0; while(n++<12&&!PHONE.sent(G,'y0_e05_ask')){ await ECONFF.advance(GM); }
    const at17=G.day===d20&&Math.abs(G.hour-17)<1e-6; phoneOpened.length=0;
    await ECONFF.advance(GM);   /* 沒回、關掉手機 */
    const sk=KX().filter(m=>m.text===SKIPMSG), sk2=KX().filter(m=>m.text===SKIP2);
    check('6. 一直沒回：下一跳停在 19:00、她傳「'+SKIPMSG+'」、打開她的對話',at17&&G.day===d20&&Math.abs(G.hour-19)<1e-6&&sk.length===1&&Math.abs(sk[0].h-19)<0.02&&phoneOpened[phoneOpened.length-1]==='p:kexin',J({h:G.hour,kx:kxT(),ph:phoneOpened}));
    check('6. 接著第二則「'+SKIP2+'」（AA_727 self.msgAfter19，85ce68113）',sk2.length===1&&KX().indexOf(sk2[0])===KX().indexOf(sk[0])+1&&Math.abs(sk2[0].h-19)<0.05,J(kxT()));
    check('6. E05 不演；E05_OPEN self；19:00 以後不能再回她的訊息',!played()&&!done5()&&G.flags.E05_OPEN==='self'&&PHONE.answer(G,'y0_e05_ask',0)===null);
    check('6. 第 9 步算做完、下一步是 9/21 系烤',ECONFF.stepDone(G,ECONFF.STEPS.find(s=>s.n===9))&&(ECONFF.next(G)||{}).ev==='ev_y0_e08',J((ECONFF.next(G)||{}).ev));
    G.zone='putong'; G.hour=19.25; check('6. 之後在 putong 也不演',!EVENTS.check(e5));
    { const g=econ('2024-09-26',15.2,{P2_PICK:'home',E05_OPEN:'self'},'putong'); H.picks=['公館']; await EVENTS.run(p2); await settle(); check('6. 9/26 P2 選公館（9/20 沒演）：不補演 E05',!played()&&!done5(),J(H.lines().slice(-3))); }
  });

  await sec('7',async()=>{
    { const G=econ('2024-09-20',22.6,{E05_OPEN:'fix',E05_DAY:d20,E05_END:18.8,E05_MEET:'walk'},'dorm'); G.events.done.ev_y0_e05=1; ph();
      check('7. fix（9/20 在 putong 演完）：22:30 E06「今天謝謝你。」「我洗了三次手……」照舊',kxT().includes('今天謝謝你。')&&kxT().includes('我洗了三次手，還是有鏈條油的味道。……你的呢？')&&G.flags.E06_DONE==='e06',J(kxT())); }
    { const G=econ('2024-09-20',19,{P2_PICK:'river'},'dorm'); G.msgs=[]; PHONE.rec(G).q=[]; setAt(d20,17); ph(); runPh(17.25,19.5); const sk=PHONE.sent(G,'y0_e05_skip');
      setAt(d20,20.5); G.zone='campus'; E.player.obj.position={x:-93,y:0,z:56}; ph(); setAt(d20,22.6); G.zone='dorm'; ph(); setAt(d21,9); ph();
      check('7. self（沒回）：19:00 那一則有；20:30 經過女舍門口＝D2 照發（AA_727 self.rule，85ce68113：沒提修車）；22:30／隔天都不發 E06',sk&&G.flags.E05_OPEN==='self'&&PHONE.sent(G,'y0_d2')&&kxT().includes('我剛剛在三樓，看到一個很像你的人經過我們宿舍。')&&G.flags.E06_DONE==='d2'&&!PHONE.sent(G,'y0_e06')&&!kxT().includes('今天謝謝你。'),J(kxT()));
      { const g=econ('2024-09-20',19,{P2_PICK:'river'},'dorm'); setAt(d20,17); ph(); runPh(17.25,19.5); setAt(d20,22.6); ph(); setAt(d21,9); ph(); setAt(d21,20.5); g.zone='campus'; E.player.obj.position={x:-93,y:0,z:56}; ph();
        check('7. self、那晚沒經過女舍：22:30／隔天都沒有 E06，隔天經過女舍也不發 D2',g.flags.E05_OPEN==='self'&&!PHONE.sent(g,'y0_e06')&&!PHONE.sent(g,'y0_d2')&&!g.flags.E06_DONE,J(kxT())); }
      { const g=econ('2024-09-20',18.5,{P2_PICK:'river'},'dorm'); setAt(d20,17); ph(); setAt(d20,18.5); g.zone='campus'; E.player.obj.position={x:-93,y:0,z:56}; ph();
        check('7. 還沒到她那一則（18:30 經過女舍、還能回）：不發 D2',!PHONE.sent(g,'y0_d2')&&!g.flags.E05_OPEN); E.player.obj.position={x:0,y:0,z:0}; }
      const kx=STORY.DAILY_PHONE&&STORY.DAILY_PHONE.find(x=>x.id==='y0_kx_luroufan'); const w4=STORY.termDay('Y0S1',4,2);
      check('7. self：可昕大一上的手機小事（kx1，例：小松滷肉飯）照開；什麼都沒有（沒 E06、沒 self）＝不開',!!kx&&kx.ok(G,w4)&&!kx.ok(Object.assign({},G,{flags:{}}),w4)); }
    { const N='（晚上，你在宿舍洗手上的油。洗了三次，指甲縫還是黑的。）';
      const g1=econ('2024-09-20',19,{E05_OPEN:'self'}); g1.flags.ECONFF={done:{},lines:[]}; const a=ECONFF.cardLine(g1,d20,d20,19,23);
      const g2=econ('2024-09-20',19,{E05_OPEN:'fix',E05_DAY:d20}); g2.events.done.ev_y0_e05=1; g2.flags.ECONFF={done:{},lines:[]}; const b=ECONFF.cardLine(g2,d20,d20,19,23);
      const g3=econ('2024-09-20',19,{E05_OPEN:'fix',E05_DAY:d19}); g3.events.done.ev_y0_e05=1; g3.flags.ECONFF={done:{},lines:[]}; const c=ECONFF.cardLine(g3,d20,d20,19,23);
      check('7. 9/20 晚上跳到 23:00 的卡「洗手上的油」：E05 9/20 演過才出（沒演＝不出；P2 選公館 9/19 就演了＝9/20 晚上不出）',a===null&&b===N&&c===null,J([a,b,c])); }
  });

  await sec('8',async()=>{
    const loc0=global.location; global.location={search:'?nofastecon'};
    try{
      { const G=econ('2024-09-20',17,{P2_PICK:'river'},'dorm'); check('8. ?nofastecon：經濟系事件接事件關掉',!ECONFF.on(G)); ph(); PHONE.answer(G,'y0_e05_ask',1); const q=OUT.get(G,'y0_e05');
        check('8. 舊流程：回「等我一下，我騎過去。」＝排出發選單（goto putong、20 分鐘後、只有「出發」）',!!q&&q.state==='planned'&&q.goto&&q.goto.zone==='putong'&&q.must===true&&Math.abs(q.day*24+q.h-(d20*24+17+20/60))<1e-3,q&&J({goto:q.goto,h:q.h,must:q.must}));
        const due=OUT.due(G); H.picks=[]; H.opts=[]; const res=due?await OUT.prompt(GM,due):null;
        check('8. 回了馬上問「出發」（只有一個選項）→ 到 putong、時間 17:20',due===q&&res==='go'&&H.opts.length===1&&H.opts[0].length===1&&/^出發/.test(H.opts[0][0])&&G.zone==='putong'&&Math.abs(G.hour-(17+20/60))<1e-3,J({opts:H.opts,z:G.zone,h:G.hour}));
        H.picks=['妳真的洗了']; check('8. 到了：E05 的條件成立（events.js auto）',EVENTS.check(e5)); await EVENTS.run(e5); await settle();
        check('8. 演完：E05_OPEN fix、背景 freeze',played()&&G.flags.E05_OPEN==='fix'&&bgOfE05()==='freeze'); }
      { const G=econ('2024-09-20',17,{P2_PICK:'river'},'campus'); ph(); PHONE.answer(G,'y0_e05_ask',0); const q=OUT.get(G,'y0_e05'); setAt(d20,17+5/60); G.zone='putong'; H.picks=['妳真的洗了'];
        const ok=EVENTS.check(e5); if(ok){ await EVENTS.run(e5); await settle(); }
        check('8. 自己先走到 putong（17:05，比約好的 17:10 早）：也演；演完出發選單收掉',ok&&played()&&!!q&&q.state==='done',q&&q.state); }
    } finally { global.location=loc0; }
  });

  await sec('9',async()=>{
    const G=econ('2024-09-20',17.5,{P2_PICK:'river'},'campus'); ph();
    check('9. 9/20 17:30 還沒回：不能回家（homeHold e05）',STORY.homeHold(G)==='e05'&&!HOME.canGo(G));
    G.hour=19.2; check('9. 19:00 以後還沒回（她說沒事了）：可以回家',!STORY.homeHold(G));
    const g2=econ('2024-09-20',18.8,{P2_PICK:'river'},'campus'); setAt(d20,18.8); ph(); PHONE.answer(g2,'y0_e05_ask',1); g2.hour=19.1;
    check('9. 18:48 回了、還沒演：19:00 以後也不能回家（等 19:08 的見面）',STORY.homeHold(g2)==='e05');
    g2.flags.E05_OPEN='self'; check('9. self：不擋',!STORY.homeHold(g2));
    const g3=econ('2024-09-20',17,{P2_PICK:'gongguan',E05_OPEN:'fix',E05_DAY:d19,E05_END:17}); g3.events.done.ev_y0_e05=1; ph();
    check('9. 舊存檔（E05 已經演過）：不擋、9/20 不傳訊息、快轉不停第 9 步',!STORY.homeHold(g3)&&!PHONE.sent(g3,'y0_e05_ask')&&ECONFF.stepDone(g3,ECONFF.STEPS.find(s=>s.n===9)));
  });

  /* ---------- AA_727 第二版（企劃線 85ce68113）---------- */
  await sec('10',async()=>{
    { const G=econ('2024-09-20',17,{P2_PICK:'river'},'dorm'); ph(); PHONE.answer(G,'y0_e05_ask',0); runPh(17.25,17.5,1/12);
      const before=PHONE.sent(G,'y0_e05_noshow'); setAt(d20,17+40/60); ph(); const L=KX().filter(m=>NOSHOW.includes(m.text));
      check('10. 回了「我過去。」（17:10 見面）、17:40 還沒到 putong：她傳「你不用來了。」「我牽去車行了。……制服下次上課拿給你。」（時間 17:40）；17:30 還沒',!before&&J(L.map(m=>m.text))===J(NOSHOW)&&L.every(m=>Math.abs(m.h-(17+40/60))<0.05),J(kxT()));
      check('10. noShow 以後＝self：E05_OPEN self、之後到 putong 也不演、快轉第 9 步算做完、不擋回家',G.flags.E05_OPEN==='self'&&(()=>{ G.zone='putong'; const ok=!EVENTS.check(e5); G.zone='dorm'; return ok; })()&&ECONFF.stepDone(G,ECONFF.STEPS.find(s=>s.n===9))&&!STORY.homeHold(G));
      setAt(d20,20.5); G.zone='campus'; E.player.obj.position={x:-93,y:0,z:56}; ph(); setAt(d20,22.6); G.zone='dorm'; ph();
      check('10. noShow 的 self 也照 self：D2 照發、E06 不發',PHONE.sent(G,'y0_d2')&&!PHONE.sent(G,'y0_e06'),J(kxT())); E.player.obj.position={x:0,y:0,z:0}; }
    { const G=econ('2024-09-20',17,{P2_PICK:'river'},'dorm'); ph(); PHONE.answer(G,'y0_e05_ask',0); setAt(d20,17+40/60); G.zone='putong'; ph();
      check('10. 30 分鐘到了人在 putong（到了、還沒演）：不傳 noShow',!PHONE.sent(G,'y0_e05_noshow')&&!G.flags.E05_OPEN); }
    { const loc0=global.location; global.location={search:'?nofastecon'};
      try{ const G=econ('2024-09-20',17,{P2_PICK:'river'},'dorm'); ph(); PHONE.answer(G,'y0_e05_ask',1); const q=OUT.get(G,'y0_e05'); setAt(d20,17+50/60); ph();
        check('10. ?nofastecon 也一樣：「等我一下，我騎過去。」（17:20）17:50 還沒到＝noShow 兩則、self、出發選單收掉（不再問「出發」）',PHONE.sent(G,'y0_e05_noshow')&&G.flags.E05_OPEN==='self'&&!!q&&q.state==='missed'&&!OUT.due(G),q&&q.state); }
      finally { global.location=loc0; } }
  });

  await sec('11',async()=>{
    const d23=D('2024-09-23'), N='（下課的時候', UL=UNI.join('<br>');
    { /* 快轉：9/20 19:00 self → 跳到之後的事，跨過 9/23（一）的經濟學原理（自動算出席）→ 之後第一張日期卡下面兩句 */
      const G=econ('2024-09-20',19.1,{P2_PICK:'river'},'dorm'); G.flags.ECONFF={done:{},lines:[]}; selfF(G); const R=ECONFF.rec(G); for(const s of ECONFF.STEPS){ const t=ECONFF.tOf(G,s); if(t!=null&&t<d20*24+19.1) R.done[s.n]=1; }
      check('11. 9/20 19:00 以前的課不算（還沒 self）；之後的經濟學原理算',!uW(G,d20*24+10)&&uW(G,d23*24+9));
      H.cards.length=0; let n=0; while(n++<15&&typeof G.flags.E05_UNIFORM!=='number'&&G.day<d23+10){ const ok=await ECONFF.advance(GM); if(!ok) break; }
      const withU=H.cards.filter(c=>(c[1]||'').includes(N));
      check('11. 快轉跨過 9/23 的經濟學原理（自動出席）以後，第一張日期卡下面加制服那兩句（照抄，85ce68113）；記 E05_UNIFORM',withU.length===1&&withU[0][1].endsWith(UL)&&typeof G.flags.E05_UNIFORM==='number'&&G.flags.E05_UNIFORM>=d23&&!!CLS.rec(G).done[(CLS.dayItems(G,d23).find(it=>it.c&&it.c.id==='econ_principles_y0')||{}).key],J({cards:H.cards.map(c=>c[0]+'｜'+c[1]),u:G.flags.E05_UNIFORM}));
      check('11. 只出一次（之後的卡沒有）',uA(G,'x')==='x'); }
    { const G=econ('2024-09-23',8,{E05_OPEN:'fix',E05_DAY:d20,E05_END:19}); G.events.done.ev_y0_e05=1; G.flags.ECONFF={done:{},lines:[]}; ECONFF.attendBetween(G,d23*24+13,d23);
      check('11. fix（E05 演過）：跨過課也不出制服',!G.flags.E05_UNIFORM&&uA(G,'x')==='x'); }
    { /* 舊流程：真的去上 9/23 的經濟學原理，下課演 ev_y0_e05_uniform */
      const loc0=global.location; global.location={search:'?nofastecon'};
      try{ const G=econ('2024-09-23',11.9,{P2_PICK:'river'},'boya'); selfF(G); const it=CLS.dayItems(G,d23).find(x=>x.c&&x.c.id==='econ_principles_y0');
        H.said.length=0; await CLS.afterClassEvent(GM,it); await settle();
        check('11. 舊流程：self 以後下一堂經濟學原理下課＝旁白「（下課的時候，她把一個紙袋塞給你……）」＋可昕「洗好了。」；記 E05_UNIFORM',!!it&&H.lines().includes(UNI[0])&&H.said.some(s=>s.t==='洗好了。'&&/可昕/.test(s.who||''))&&typeof G.flags.E05_UNIFORM==='number',J(H.lines()));
        H.said.length=0; const it2=CLS.dayItems(G,D('2024-09-26')).find(x=>x.c&&x.c.id==='acct_y0'); G.day=D('2024-09-26'); await CLS.afterClassEvent(GM,it2); await settle();
        check('11. 只一次（9/26 會計下課不再演）',!H.lines().includes(UNI[0]),J(H.lines()));
        const g2=econ('2024-09-23',11.9,{E05_OPEN:'fix',E05_DAY:d20}); g2.events.done.ev_y0_e05=1; H.said.length=0; await CLS.afterClassEvent(GM,it); await settle();
        check('11. fix（E05 演過）：下課不演制服',!H.lines().includes(UNI[0])); }
      finally { global.location=loc0; } }
  });

  await sec('12',async()=>{
    const run=async(flags,done)=>{ const g=econ('2024-09-26',15.2,Object.assign({P2_PICK:'home'},flags),'putong'); if(done) g.events.done.ev_y0_e05=1; H.picks=['公館']; const h0=g.hour; await EVENTS.run(p2); await settle(); return {g,L:H.lines(),dh:g.hour-h0}; };
    { const {L,dh}=await run({E05_OPEN:'fix',E05_DAY:d20},true); const i=L.indexOf(P2L[0]);
      check('12. 9/26 P2 選公館、E05 已經演過：接 p2LaterGongguan 兩句（照抄，85ce68113），不接 E05；時間往後 1.5 小時',i>=0&&L[i+1]===P2L[1]&&!L.includes(E05L1)&&Math.abs(dh-1.5)<1e-6,J({L:L.slice(-3),dh})); }
    { const {L}=await run({E05_OPEN:'self',E05_SELF_DAY:d20,E05_SELF_H:19},false);
      check('12. 9/26 P2 選公館、self：也是那兩句',L.includes(P2L[0])&&L.includes(P2L[1])&&!L.includes(E05L1),J(L.slice(-3))); }
    { const g=econ('2024-09-19',15.2,{},'putong'); H.picks=['公館','妳真的洗了']; await EVENTS.run(p2); await settle(); const L=H.lines();
      check('12. 第一次（E05 還沒演）選公館：照舊接 E05，沒有那兩句',L.includes(E05L1)&&!L.includes(P2L[0])); }
  });
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

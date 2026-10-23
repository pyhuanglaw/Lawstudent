// AA_387（企劃線 608b9adc；任務 BB119-Y4-1017、USER_WANTS D53）：芷若「出國前的最後一場」（2028-08-26）＋方奕廷 F3 的拒絕版——不需要瀏覽器。
// 台詞一字照稿（D100、D109）。src/data/zr_last_events.js、src/zr_last3d.js（ZRLAST）；F3：src/zrzq3d.js（S.heartOk、S.ytHeart、S.f3Sync）、src/data/r2y3b_events.js（ev_zhiruo_f3_cafe）。
//   0 讀稿（每一句台詞、選項、手機、房間物件都在稿裡）、index.html 接線、人物頁記憶名稱
//   1 第 1 節條件：一般（臺灣路線）、日本路線＝有邀約；美國路線、ZR_CUP 有值、和子晴交往中（ZZ_DATING）、ZR_FY、心意條件沒到（戀愛 <30／約會 <4 次／沒去心願地點）、和祐廷交往中、演過＝沒有
//   2 第 2 節：8/24（四）21:00 兩則、回覆兩個（到 8/25 18:00）；「好。」→她回、排 8/26 19:30 出遊；「那天不行。」→她回、ZR_LAST no；沒回＝18:00「不行」那一句、ZR_LAST no
//   3 第 3、4 節：出遊（公館二輪戲院、底圖 gongguan_cinema、走過去 15 分鐘、2.5 小時；在臺北的家照家裡出發）、逐句、背面兩行說話人空白、ASKED_HER_DRINK 兩種旁白；
//     「我等妳回來。」＝ROM 交往（8/26）、「我先收著。」＝學期末心意邀約的「讓我想想」（think）；ZR_LAST、記憶 ZR_LAST_SCREENING；關係數值不變；英國那一年照現有的「交往中」
//   5 第 5 節：23:00 兩版；交往的 9/1（五）21:00（先收著、交往後分開的沒有）
//   6 第 6 節：房間物件「她的票根」（兩個選項都有；沒到、不行沒有）
//   7 第 7 節：說好了沒到（過了 19:45、「不去了」、出遊規則沒跑到）＝19:45、22:00 兩則、missed、沒有房間物件；不行／沒回＝只有那一句；都不扣關係
//   8 第 8 節：F3 那天她心裡是祐廷（ZR_CUP 沒值、沒交往、心意條件 ok）＝拒絕方奕廷（fy declined、ZR_F3_NO、沒有 ZR_FY、電話照演、不演 4-2b）；Café 拒絕版（臺灣路線兩句＋選項、日本路線過去式）；
//     照現在：杯子選了「這杯我不能喝」、和子晴交往中（AA_385 那一版）、心意條件沒到、舊存檔 F3 已經過了
// 修改前（開發分支 3acfadbb）：沒有 ZRLAST、ZR_F3_NO（大部分 FAIL；第 8 節「照現在」那幾項 PASS）。用法：node tests/aa387_zr_last_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/zrzq_events.js','src/zrzq3d.js']) load(f);
const okNew=load('src/data/zr_last_events.js')&&load('src/zr_last3d.js');
let doc=''; for(const r of ['021ffe76','608b9adc','origin/claude/story-planning']){ try{ doc=cp.execSync('git show '+r+':"docs/story_planning/AA_387_芷若出國前的最後一場_定稿.md"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); if(doc) break; }catch(e){ doc=''; } }
const inDoc=t=>doc.indexOf(t)>=0;
const J=JSON.stringify, ZR='heroine_02', X=()=>typeof ZRLAST!=='undefined'?ZRLAST:null;
const T=(d,h)=>d*24+h, D=k=>STORY.dayOfKey(k);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).slice(0,300)); } };
/* ---- 台詞（照 AA_387 原文抄；比對遊戲實際說出來的）---- */
const ASK=['週六晚上七點半，二輪戲院。我出國前的最後一場。','……票的事你不用管。'], YES='嗯。……不要遲到。片頭很短。', NO='好。……那我一個人看完它。';
const SEC3=['（二輪戲院的最後一場。觀眾不到十個人。她坐在第七排靠走道，旁邊的位子放著她的外套。）','（把外套拿起來）……你的。','（今天放的是一部很老的片子，《候鳥》。燈暗下來以前，她一直在看手上的兩張票根。）',
  '（片子演到最後一段，她小聲說了一句。）','這一段，我看過四次。每次都在這裡哭。','……今天不會。','（燈亮的時候，她在擦眼睛。）','……我說了今天不會。'];
const SEC4A=['（散場了。騎樓下，她把兩張票根分開，一張放進自己的口袋，一張遞給你。）','這張是你的。','（票根背面有字。她的字，鉛筆寫的。）','熱可可＋濃縮。','先寄放在你這裡。'];
const ASKED_N='（是她自己的點法。）', NOASK_N='（是她的點法。她在吧檯後面做給自己喝的那一杯。）';
const SEC4B=['（你抬頭的時候，她看著騎樓外面，沒有看你。）','……一年。'];
const WAIT=['（她轉過來，把口袋裡那一張票根拿出來，和你那張對在一起。）','一年。……你說的喔。'], KEEP=['好。……那就先收著。','（她笑了一下，把自己那一張放回口袋。）'];
const CLOSE='（她往捷運站走。走到路口，回頭揮了一下手。）';
const N_WAIT=['到家了。','票根不要弄丟。……寄放的，要還。'], N_KEEP=['到家了。','今天謝謝你。……片子很好看。'], FLY=['明天早上的飛機。','……到了打給你。一年，從明天開始算。'];
const LATE='要開演了。……我先進去。', AFTER='散場了。票根我先收著。';
const ROOM=['她的票根','（二輪戲院的票根。《候鳥》，最後一場。背面是她的鉛筆字：「熱可可＋濃縮。」「先寄放在你這裡。」）'];
const F3_TW=['奕廷約我去看電影。很老的那部，《秋天的晚飯》。','……我說不行。'], F3_TW_OPTS=['「為什麼？」','「他一定很失望。」'], F3_TW_A='……你不要問。', F3_TW_B='他說「好」，然後跟我講了十分鐘那部電影的導演。……他人很好。';
const F3_JP=['你不在的時候，奕廷約我去看一部很老的電影。','……我說不行。','你不要問為什麼。'];
const F3_YES_TW=['奕廷約我去看電影。很老的那部，《秋天的晚飯》。','他連我高中看過哪幾部都記得。……我說好。'];
/* ---- 前置 ---- */
/* [前置] 她的心意條件到齊（TERMEND.cond：她的戀愛 ≥30、正式校外約會 4 次、去過她的心願地點；朋友）——遊戲裡要一整年的約會，這裡直接寫數值 */
const heart=G=>{ H.FRIEND(ZR); SOCIAL.rel(ZR).npcRom=40; const Lg=DATE.log(G,ZR); Lg.count=4; Lg.wish=true; };
const setup=(key,h,zone,flags,o)=>{ const G=H.fresh(key,h,zone||'dorm',flags||{}); G.contacts={}; G.outings=[]; if(STORY._bindGM) STORY._bindGM(GM); if(!(o&&o.cold)) heart(G); return G; };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const her=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+ZR&&m.from===ZR);
const herT=()=>her().map(m=>m.text);
const has=t=>herT().includes(t);
const said=()=>H.said.map(s=>s.t);
const seq=(got,want)=>{ for(let i=0;i+want.length<=got.length;i++) if(want.every((w,k)=>got[i+k]===w)) return true; return false; };
const relOf=()=>{ const r=SOCIAL.rel(ZR); return J(['fam','trust','comf','npcRom','rom'].map(k=>+r[k]||0)); };
const asked=()=>PHONE.byAsk(H.G,'zr_last_ask');
const q0=()=>typeof OUT!=='undefined'?OUT.get(H.G,'zr_last_screening'):null;
const invite=(flags,o)=>{ setup('2028-08-24',20.5,'dorm',flags,o); if(o&&o.pre) o.pre(H.G); rules(); const early=!!asked(); at('2028-08-24',21.05); rules(); return {early,m:asked()}; };
/* 8/24 的邀約回「好。」→ 8/26 出遊（OUT.go）；pick：0＝「我等妳回來。」、1＝「我先收著。」*/
const play=async(pick,o)=>{ o=o||{}; invite(o.flags,o); PHONE.answer(H.G,'zr_last_ask',0); rules(); at('2028-08-26',o.h!=null?o.h:19.2); if(o.home){ HOME.rec(H.G).at=true; } rules(); const q=q0(); const due=OUT.due(H.G);
  H.said=[]; H.opts=[]; H.picks=[pick]; H.bgs=[]; H.cards=[]; const r0=relOf(); if(q) await OUT.go(GM,q,o.home?{fromHome:true}:undefined); return {q,due,r0,r1:relOf()}; };   /* 修改前沒有這一場：q＝null，下面照樣逐項 FAIL */
const roomList=()=>STORY.roomItemList(H.G).filter(r=>r&&r[0]===ROOM[0]);

(async()=>{
  /* ======================= 0 讀稿、接線 ======================= */
  check('0. 讀稿（企劃線 608b9adc AA_387 定稿）',doc.length>3000&&inDoc('## 8. 一定要一起改：方奕廷那一段（F3）')&&inDoc('《候鳥》'));
  check('0. 新檔載得到：ZRLAST、ZRLAST_LINES、ev_zhiruo_last_screening（出遊、2.5 小時、只演一次）',okNew&&!!X()&&typeof ZRLAST_LINES!=='undefined'&&!!ev('ev_zhiruo_last_screening')&&ev('ev_zhiruo_last_screening').trigger==='outing'&&ev('ev_zhiruo_last_screening').hours===2.5&&ev('ev_zhiruo_last_screening').once===true);
  await sec('0',async()=>{
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
    check('0. index.html：data/zr_last_events.js、zr_last3d.js 接在 zrzq3d.js 後面（?v= 和旁邊一樣）',/src\/zrzq3d\.js\?v=([^"]+)"><\/script>\n<script src="src\/data\/zr_last_events\.js\?v=\1"><\/script>\n<script src="src\/zr_last3d\.js\?v=\1"><\/script>/.test(html));
    check('0. 人物頁記憶 ZR_LAST_SCREENING「出國前的最後一場，二輪戲院」（social3d.js MEMORY_LABEL；稿第 4 節）',(SOCIAL.MEMORY_LABEL||{}).ZR_LAST_SCREENING==='出國前的最後一場，二輪戲院'&&inDoc('記憶 `ZR_LAST_SCREENING`「出國前的最後一場，二輪戲院」'));
    const bad=[]; const T_=t=>{ if(typeof t==='string'&&!inDoc(t)) bad.push(t); };
    if(typeof ZRLAST_LINES==='undefined'||!ev('ev_zhiruo_last_screening')) bad.push('沒有 ZRLAST_LINES／ev_zhiruo_last_screening');
    else { for(const k in ZRLAST_LINES){ const v=ZRLAST_LINES[k]; if(Array.isArray(v)) v.forEach(T_); else if(v&&typeof v==='object') Object.values(v).forEach(T_); else T_(v); }
      for(const id of ['ev_zhiruo_last_screening','ev_zhiruo_ticket_again']) for(const l of ((ev(id)||{}).dialogue||[])){ if(l.text!==undefined) T_(l.text); for(const c of (l.choice||[])) T_(c.text); } }
    const f3=ev('ev_zhiruo_f3_cafe').dialogue, i=f3.findIndex(l=>l.label==='no'); if(i<0) bad.push('ev_zhiruo_f3_cafe 沒有拒絕版');
    for(const l of f3.slice(i<0?f3.length:i)){ if(l.text!==undefined) T_(l.text); for(const c of (l.choice||[])) T_(c.text); }
    check('0. 每一句台詞、選項、手機、房間物件的說明都在稿裡（一字不差；含 F3 拒絕版）',!bad.length,J(bad));
    const want=ASK.concat([YES,NO],SEC3,SEC4A,[ASKED_N,NOASK_N],SEC4B,WAIT,KEEP,[CLOSE],N_WAIT,N_KEEP,FLY,[LATE,AFTER],ROOM,F3_TW,F3_TW_OPTS,[F3_TW_A,F3_TW_B],F3_JP,['「我等妳回來。」','「我先收著。」']);
    check('0. 這個測試抄的台詞也都在稿裡（下面逐句比對用）',want.every(inDoc),J(want.filter(t=>!inDoc(t))));
    const labels=[]; for(const e of [ev('ev_zhiruo_last_screening'),ev('ev_zhiruo_f3_cafe')]){ const L=new Set(e.dialogue.filter(l=>l.label).map(l=>l.label)); for(const l of e.dialogue){ if(l.goto&&!L.has(l.goto)) labels.push(e.id+':'+l.goto); for(const c of (l.choice||[])) if(c.goto&&!L.has(c.goto)) labels.push(e.id+':'+c.goto); } }
    check('0. 每一個 goto 都有 label',!labels.length,J(labels));
  });

  /* ======================= 1 條件 ======================= */
  await sec('1',async()=>{
    { setup('2028-08-24',20.5,'dorm'); const c=X()?X().cond(H.G,true):null; const r=invite(); check('1. 臺灣路線、心意條件到齊、單身、沒有杯子那一場：條件 ok；8/24 21:00 有邀約（20:30 還沒有）',!!c&&c.ok&&!r.early&&!!r.m,J(c)); }
    { const r=invite({EXCHANGE_ROUTE:'JP'}); check('1. 日本路線（8/5 已經回國）：照常有邀約',!!r.m); }
    const none=[];
    const tryNo=(name,flags,o)=>{ const r=invite(flags,o); if(r.m) none.push(name); };
    tryNo('美國路線',{EXCHANGE_ROUTE:'US'});
    tryNo('ZR_CUP declined（這杯我不能喝）',{ZR_CUP:'declined'});
    tryNo('ZR_CUP steps',{ZR_CUP:'steps'});
    tryNo('和子晴交往中（ZZ dating＝ZZ_DATING）',{},{pre:G=>{ const Z=ZRZQ.rec(G); Z.state='dating'; Z.datingDay=D('2027-06-04'); }});
    tryNo('ZR_FY（和方奕廷在一起）',{ZR_FY:true});
    tryNo('ZZ.fy seeing（mirror 記 ZR_FY）',{},{pre:G=>{ ZRZQ.rec(G).fy='seeing'; }});
    tryNo('她的戀愛 25（C1）',{},{pre:G=>{ SOCIAL.rel(ZR).npcRom=25; }});
    tryNo('正式約會 3 次（C2）',{},{pre:G=>{ DATE.log(G,ZR).count=3; }});
    tryNo('沒去過心願地點（C2）',{},{pre:G=>{ DATE.log(G,ZR).wish=false; }});
    tryNo('和祐廷交往中（C4）',{dating_heroine_02:true});
    tryNo('演過了（ZR_LAST 有值）',{ZR_LAST:'no'});
    check('1. 這些都沒有邀約：美國路線、ZR_CUP 有值、和子晴交往中、ZR_FY、戀愛 <30、約會 <4 次、沒去心願地點、和祐廷交往中、演過了',!none.length,J(none));
    { invite(); const a=!!asked(); rules(); at('2028-08-25',10); rules(); const n=her().filter(m=>m.text===ASK[0]).length; check('1. 只演一次：邀約只傳一次',a&&n===1,J(n)); }
  });

  /* ======================= 2 邀約 ======================= */
  await sec('2',async()=>{
    { const r=invite(), m=r.m; check('2. 8/24（四）21:00 她私訊兩則（照稿）；回覆「好。」「那天不行。」；回覆到 8/25（五）18:00',!!m&&J(herT())===J(ASK)&&J(m.ask.opts.map(o=>o.t))===J(['好。','那天不行。'])&&m.ask.until===T(D('2028-08-25'),18)&&her()[0].day===D('2028-08-24'),J({t:herT(),o:m&&m.ask.opts.map(o=>o.t),u:m&&m.ask.until}));
      PHONE.answer(H.G,'zr_last_ask',0); rules(); const q=q0();
      check('2. 「好。」→ 她回「嗯。……不要遲到。片頭很短。」；ZR_LAST_GO；排 8/26（六）19:30 公館二輪戲院（走過去約 15 分鐘、late 0.25、跳過時間停在出發前）',has(YES)&&H.G.flags.ZR_LAST_GO===true&&H.G.flags.ZR_LAST==null&&!!q&&q.day===D('2028-08-26')&&q.h===19.5&&q.late===0.25&&q.place==='公館二輪戲院'&&q.travel==='走過去約 15 分鐘'&&q.travelH===0.25&&q.alarm===true&&q.ev==='ev_zhiruo_last_screening',J({t:herT(),q})); }
    { invite(); PHONE.answer(H.G,'zr_last_ask',1); rules(); at('2028-08-26',19.3); rules();
      check('2. 「那天不行。」→ 她回「好。……那我一個人看完它。」；ZR_LAST no；沒有出遊',has(NO)&&H.G.flags.ZR_LAST==='no'&&!q0(),J(herT())); }
    { invite(); at('2028-08-25',17.9); rules(); const b=H.G.flags.ZR_LAST, nb=has(NO); at('2028-08-25',18.1); rules(); const m=her().find(x=>x.text===NO), a=asked();
      check('2. 沒回：8/25 18:00 以前沒事；過了 18:00＝她傳「好。……那我一個人看完它。」（18:00）、ZR_LAST no、不能再回',b==null&&!nb&&!!m&&m.day===D('2028-08-25')&&m.h>=18&&m.h<18.25&&H.G.flags.ZR_LAST==='no'&&!PHONE.askOpen(H.G,a)&&!q0(),J({b,nb,m})); }
  });

  /* ======================= 3、4 戲院、票根 ======================= */
  await sec('3',async()=>{
    { const r=await play(0,{pre:G=>{ SOCIAL.remember(ZR,'ASKED_HER_DRINK',''); }}); const L=said(), R=ROM.get(H.G,ZR);
      check('3. 8/26 19:15 起問「出發」（從宿舍走過去 15 分鐘）；字卡「和芷若：公館二輪戲院」；底圖 gongguan_cinema；演完 22:00（2.5 小時）',r.due===r.q&&H.cards.some(c=>c[0]==='和芷若：公館二輪戲院'&&c[1]==='走過去約 15 分鐘')&&H.bgs.some(b=>b&&b.image==='assets/bg/gongguan_cinema.webp')&&Math.abs(H.G.hour-22)<1e-6&&r.q.state==='done',J({h:H.G.hour,cards:H.cards,bgs:H.bgs}));
      check('3. 戲院八句照稿、照順序',seq(L,SEC3),J(L));
      check('4. 票根：散場、「這張是你的。」、背面兩行（說話人空白）、問過她喝什麼＝「（是她自己的點法。）」、「……一年。」；選項只有「我等妳回來。」「我先收著。」（沒有「還沒」）',seq(L,SEC4A.concat([ASKED_N],SEC4B))&&!L.includes(NOASK_N)&&H.said.filter(s=>s.t===SEC4A[3]||s.t===SEC4A[4]).every(s=>s.who===null)&&J(H.opts[H.opts.length-1])===J(['「我等妳回來。」','「我先收著。」']),J({L,o:H.opts}));
      check('4. 「我等妳回來。」→「（她轉過來，……對在一起。）」「一年。……你說的喔。」→ 收尾「（她往捷運站走。……）」',seq(L,WAIT.concat([CLOSE]))&&!L.includes(KEEP[0]),J(L));
      check('4. 交往：ROM dating、交往那天＝8/26、dating_heroine_02、confessed；ZR_LAST wait；記憶 ZR_LAST_SCREENING；關係數值不變（學期末「說出來」那一套沒有加減）',R.status==='dating'&&R.sinceDay===D('2028-08-26')&&H.G.flags.dating_heroine_02===true&&(H.G.flags.confessed||{})[ZR]===D('2028-08-26')&&H.G.flags.ZR_LAST==='wait'&&SOCIAL.has(ZR,'ZR_LAST_SCREENING')&&r.r0===r.r1,J({R,ZR_LAST:H.G.flags.ZR_LAST,r0:r.r0,r1:r.r1}));
      at('2028-09-10',8); H.G.zone='dorm'; const row=MSG.ukRow?MSG.ukRow(H.G,ZR):null; const d0=her().length; const sentD=MSG.ukDaily?MSG.ukDaily(H.G):false; PHONE.tick(H.G); at('2028-09-10',10); PHONE.tick(H.G);
      check('4. 英國那一年照現有的「交往中」（AA_276 第 2 節／BB_178 1-E：msg3d.js ukRow dating、每天一則 ukDaily）',row==='dating'&&sentD===true&&her().length>d0,J({row,sentD})); }
    { const r=await play(1); const L=said(), R=ROM.get(H.G,ZR), th=TERMEND.rec(H.G).think;
      check('4. 沒問過她喝什麼＝「（是她的點法。她在吧檯後面做給自己喝的那一杯。）」',L.includes(NOASK_N)&&!L.includes(ASKED_N),J(L));
      check('4. 「我先收著。」→「好。……那就先收著。」「（她笑了一下，……）」→ 收尾',seq(L,KEEP.concat([CLOSE]))&&!L.includes(WAIT[1]),J(L));
      check('4. 先收著＝學期末心意邀約的「讓我想想」：TERMEND think.heroine_02（大三下）、不交往；ZR_LAST keep；記憶；關係數值不變',th[ZR]==='Y3S2'&&R.status!=='dating'&&!H.G.flags.dating_heroine_02&&H.G.flags.ZR_LAST==='keep'&&SOCIAL.has(ZR,'ZR_LAST_SCREENING')&&r.r0===r.r1,J({th,st:R.status,r0:r.r0,r1:r.r1})); }
    { invite(); PHONE.answer(H.G,'zr_last_ask',0); rules(); TERMEND.rec(H.G).think[ZR]='Y3S2'; at('2028-08-26',19.2); rules(); H.picks=[0]; if(q0()) await OUT.go(GM,q0());   /* [前置] 大三下的學期末選過「讓我想想」*/
      check('4. 先前選過「讓我想想」、這次「我等妳回來。」＝交往、清掉 think（同學期末答應那一欄）',TERMEND.rec(H.G).think[ZR]==null&&H.G.flags.dating_heroine_02===true); }
    { setup('2028-08-24',20.5,'dorm'); HOME.rec(H.G).at=true; at('2028-08-24',21.05); rules(); PHONE.answer(H.G,'zr_last_ask',0); rules(); at('2028-08-26',18.8); const q=q0(), dueHome=OUT.due(H.G)===q, tr=OUT.trip(H.G,q,true); HOME.rec(H.G).at=false; const dueDorm=OUT.due(H.G);
      check('3. 暑假在臺北的家：照出遊系統從家裡出發（捷運＋公車 約 30 分鐘；18:45 起問「出發」，宿舍要到 19:00）',dueHome&&tr.travelH===0.5&&/捷運/.test(tr.travel)&&!dueDorm,J({dueHome,tr,dueDorm:!!dueDorm})); }
  });

  /* ======================= 5 當晚、出發前的手機 ======================= */
  await sec('5',async()=>{
    { await play(0); rules(); at('2028-08-26',22.9); rules(); const b=her().some(m=>m.text===N_WAIT[1]); at('2028-08-26',23.05); rules(); const night=her().filter(m=>m.day===D('2028-08-26')&&m.h>=23).map(m=>m.text);
      at('2028-09-01',20.9); rules(); const bf=FLY.some(has); at('2028-09-01',21.05); rules(); const fly=her().filter(m=>m.day===D('2028-09-01')).map(m=>m.text);
      check('5. 交往：8/26 23:00「到家了。」「票根不要弄丟。……寄放的，要還。」（22:54 還沒有）',!b&&J(night)===J(N_WAIT),J(night));
      check('5. 交往：9/1（五）21:00「明天早上的飛機。」「……到了打給你。一年，從明天開始算。」（20:54 還沒有）',!bf&&J(fly)===J(FLY),J(fly)); }
    { await play(1); rules(); at('2028-08-26',23.05); rules(); const night=her().filter(m=>m.day===D('2028-08-26')&&m.h>=23).map(m=>m.text); at('2028-09-01',21.05); rules(); at('2028-09-02',9); rules();
      check('5. 先收著：8/26 23:00「到家了。」「今天謝謝你。……片子很好看。」；9/1 沒有飛機那則',J(night)===J(N_KEEP)&&!FLY.some(has),J({night,all:herT()})); }
    { await play(0); rules(); at('2028-08-30',12); ROM.end(H.G,ZR,'apart_talk'); at('2028-09-01',21.05); rules(); at('2028-09-02',9); rules();   /* [前置] 8/30 分開 */
      check('5. 交往了、9/1 以前分開：沒有飛機那則',!FLY.some(has),J(herT())); }
  });

  /* ======================= 6 房間物件 ======================= */
  await sec('6',async()=>{
    { setup('2028-08-24',20,'dorm'); const before=roomList().length; await play(0); const L=roomList(); H.said=[]; H.picks=[STORY.roomItemList(H.G).findIndex(r=>r[0]===ROOM[0]),99]; await STORY._v1.roomItems(GM);
      check('6. 演過第 4 節（交往）：宿舍書桌「看看房間裡的東西」多「她的票根」，說明照稿（演之前沒有）',before===0&&L.length===1&&J(L[0])===J(ROOM)&&said().includes(ROOM[1]),J({L,s:said()})); }
    { await play(1); check('6. 先收著也有',roomList().length===1); }
    { invite(); PHONE.answer(H.G,'zr_last_ask',1); rules(); check('6. 回「不行」：沒有',!roomList().length); }
  });

  /* ======================= 7 沒到、不行 ======================= */
  await sec('7',async()=>{
    { invite(); PHONE.answer(H.G,'zr_last_ask',0); rules(); const r0=relOf(); at('2028-08-26',19.7); rules(); const b=H.G.flags.ZR_LAST; at('2028-08-26',19.8); OUT.tick(GM); rules();
      const m1=her().find(m=>m.text===LATE), b2=has(AFTER); at('2028-08-26',22.05); rules(); const m2=her().find(m=>m.text===AFTER);
      check('7. 回「好」但 19:45 還沒到（19:42 還算）：ZR_LAST missed；19:45「要開演了。……我先進去。」、22:00「散場了。票根我先收著。」（22:00 以前沒有第二則）',b==null&&H.G.flags.ZR_LAST==='missed'&&!!m1&&m1.day===D('2028-08-26')&&m1.h>=19.75&&m1.h<20&&!b2&&!!m2&&m2.h>=22&&m2.h<22.25&&(q0()||{}).state==='missed',J({b,ZR_LAST:H.G.flags.ZR_LAST,m1,m2,q:q0()}));
      check('7. 沒到：沒有房間物件、沒有 23:00 那兩則、不交往、沒有記憶；不扣關係',!roomList().length&&!N_WAIT.concat(N_KEEP).slice(1).some(has)&&!H.G.flags.dating_heroine_02&&!SOCIAL.has(ZR,'ZR_LAST_SCREENING')&&relOf()===r0,J(herT())); }
    { invite(); PHONE.answer(H.G,'zr_last_ask',0); rules(); at('2028-08-26',19.1); H.picks=['不去了']; const k=q0()?await OUT.prompt(GM,q0()):null; rules(); const now1=has(LATE); at('2028-08-26',19.8); rules();
      check('7. 出發選單選「不去了」：missed；19:45 才傳那一則',k==='no'&&H.G.flags.ZR_LAST==='missed'&&!now1&&has(LATE),J({k,ZR_LAST:H.G.flags.ZR_LAST})); }
    { invite(); PHONE.answer(H.G,'zr_last_ask',0); rules(); HOME.rec(H.G).at=true; at('2028-08-26',20.5); rules();   /* 人在家、出遊的規則還沒跑到（OUT 還是 planned）*/
      check('7. 出遊的規則沒跑到（還是 planned、沒出發）：手機規則照樣記 missed、傳 19:45 那一則',H.G.flags.ZR_LAST==='missed'&&has(LATE),J({ZR_LAST:H.G.flags.ZR_LAST,q:q0()})); }
    { invite(); const r0=relOf(); PHONE.answer(H.G,'zr_last_ask',1); rules(); at('2028-08-26',22.5); rules();
      check('7. 回「不行」：只有第 2 節那一句（沒有 19:45、22:00 那兩則）；ZR_LAST no；不扣關係',H.G.flags.ZR_LAST==='no'&&has(NO)&&!has(LATE)&&!has(AFTER)&&relOf()===r0,J(herT())); }
  });

  /* ======================= 8 方奕廷 F3 ======================= */
  await sec('8',async()=>{
    const f3TW=(flags,o)=>{ setup('2028-05-29',21.1,'dorm',flags,o); H.FAMILIAR('npc_fangyt'); if(o&&o.pre) o.pre(H.G); rules(); const delay=H.G.flags.FANG_F3_DELAY===true&&H.G.flags.FANG_F3_DAY==null; at('2028-06-19',21.05); rules(); return delay; };
    { const delay=f3TW(); const F=H.G.flags, Z=F.ZZ||{}, q=OUT.get(H.G,'y3_fang_f3');
      check('8. 臺灣路線：5/29 心意條件已到＝延到 6/19；6/19 方奕廷的電話照演（他還不知道）',delay&&F.FANG_F3_DAY===D('2028-06-19')&&!!q&&q.day===D('2028-06-19'),J({delay,d:F.FANG_F3_DAY,q}));
      check('8. 她心裡是祐廷（ZR_CUP 沒值、沒交往、心意條件 ok）＝拒絕：ZZ fy declined、f3 yt、ZR_F3_NO＝那天；沒有 ZR_FY；不演 4-2b',Z.fy==='declined'&&Z.f3==='yt'&&F.ZR_F3_NO===D('2028-06-19')&&F.ZR_FY!==true&&ZRZQ.mindSlot(H.G)===null,J({fy:Z.fy,f3:Z.f3,no:F.ZR_F3_NO,fy2:F.ZR_FY}));
      H.picks=['剛好有兩張']; await EVENTS.run(ev('ev_fangyt_tickets')); const fang=H.G.flags.FANG_F3;
      H.G.zone='cafe'; at('2028-06-21',19.5); const ok=EVENTS.check(ev('ev_zhiruo_f3_cafe')), zz=EVENTS.check(ev('ev_zz_f3_told')); H.said=[]; H.opts=[]; H.picks=[0]; await EVENTS.run(ev('ev_zhiruo_f3_cafe')); const L=said();
      check('8. 臺灣路線 Café（ev_zhiruo_f3_cafe 拒絕版）：「奕廷約我去看電影。很老的那部，《秋天的晚飯》。」「……我說不行。」；選項「為什麼？」「他一定很失望。」；「為什麼？」→「……你不要問。」；沒有「我說好」',fang==='bought'&&ok&&!zz&&J(L)===J(F3_TW.concat([F3_TW_A]))&&J(H.opts[0])===J(F3_TW_OPTS),J({fang,ok,zz,L,o:H.opts}));
      H.G.zone='dorm'; at('2028-08-24',20.5); rules(); const early=!!asked(); at('2028-08-24',21.05); rules();
      check('8. 同一個存檔接下去：8/24 21:00 照樣有最後一場的邀約（F3 拒絕了，沒有 ZR_FY）',!early&&!!asked()&&H.G.flags.ZR_FY!==true,J(X()?X().cond(H.G,true):null)); }
    { f3TW(); H.picks=[0]; await EVENTS.run(ev('ev_fangyt_tickets')); H.G.zone='cafe'; at('2028-06-21',19.5); H.said=[]; H.picks=[1]; await EVENTS.run(ev('ev_zhiruo_f3_cafe')); const L=said();
      check('8. 「他一定很失望。」→「他說「好」，然後跟我講了十分鐘那部電影的導演。……他人很好。」',J(L)===J(F3_TW.concat([F3_TW_B])),J(L)); }
    { setup('2028-05-29',22.1,'jp_dorm',{EXCHANGE_ROUTE:'JP'}); rules(); const delay=H.G.flags.FANG_F3_DELAY===true; at('2028-06-19',22.1); rules(); const F=H.G.flags, Z=F.ZZ||{};   /* 日本路線：人在日本（遊戲時鐘＝日本時間，臺灣 21:00＝22:00）；和方奕廷不熟＝沒有電話（nocall）*/
      H.G.zone='cafe'; at('2028-08-04',15); const b4=EVENTS.check(ev('ev_zhiruo_f3_cafe')); at('2028-08-05',19); const on=EVENTS.check(ev('ev_zhiruo_f3_cafe')); H.said=[]; H.opts=[]; await EVENTS.run(ev('ev_zhiruo_f3_cafe')); const L=said();
      check('8. 日本路線：3/25 出發前條件已到的存檔＝6/19 拒絕（ZR_F3_NO）；8/5 回國以後第一次進 Café＝過去式三句（「你不在的時候，……」「……我說不行。」「你不要問為什麼。」），沒有選項',delay&&F.FANG_F3==='nocall'&&Z.fy==='declined'&&F.ZR_F3_NO===D('2028-06-19')&&!b4&&on&&J(L)===J(F3_JP)&&!H.opts.length,J({delay,F3:F.FANG_F3,fy:Z.fy,no:F.ZR_F3_NO,b4,on,L}));
      at('2028-08-24',21.05); H.G.zone='dorm'; rules(); check('8. 日本路線：8/26 照演（8/24 有邀約）',!!asked()); }
    /* ---- 照現在 ---- */
    { f3TW({ZR_CUP:'declined'}); const F=H.G.flags, Z=F.ZZ||{};   /* [前置] 6/15 杯子選「這杯我不能喝」（Z13）*/
      H.picks=[0]; await EVENTS.run(ev('ev_fangyt_tickets')); H.G.zone='cafe'; at('2028-06-21',19.5); H.said=[]; await EVENTS.run(ev('ev_zhiruo_f3_cafe')); const L=said();
      check('8. 照現在：杯子選了「這杯我不能喝」＝6/19 F3 照常，她答應（seeing、ZR_FY；不記 ZR_F3_NO）；Café 照原本「……我說好。」',Z.fy==='seeing'&&F.ZR_FY===true&&F.ZR_F3_NO==null&&J(L)===J(F3_YES_TW),J({fy:Z.fy,ZR_FY:F.ZR_FY,no:F.ZR_F3_NO,L}));
      at('2028-08-24',21.05); H.G.zone='dorm'; rules(); check('8. 照現在：杯子那一場演過＝8/24 沒有邀約',!asked()); }
    { setup('2028-05-29',21.1,'dorm'); H.FAMILIAR('npc_fangyt'); H.FRIEND('heroine_04'); const Z0=ZRZQ.rec(H.G); Object.assign(Z0,{state:'dating',since:0,lastDay:D('2027-06-04'),datingDay:D('2027-06-04'),datingTerm:'Y2S2'}); rules(); const F=H.G.flags, Z=F.ZZ;
      check('8. 照現在：她和子晴在一起（ZZ_DATING）＝心意條件不 ok（她有交往的對象），5/29 F3、AA_385 那一版（f3 dating、婉拒）；不記 ZR_F3_NO',F.ZZ_DATING===true&&F.FANG_F3_DAY===D('2028-05-29')&&Z.fy==='declined'&&Z.f3==='dating'&&F.ZR_F3_NO==null&&!(X()&&X().cond(H.G)),J({d:F.FANG_F3_DAY,fy:Z.fy,f3:Z.f3,no:F.ZR_F3_NO})); }
    { const delay=f3TW({},{pre:G=>{ const Z=ZRZQ.rec(G); Object.assign(Z,{state:'mutual_interest',since:0,lastDay:D('2028-03-09')}); }}); const F=H.G.flags, Z=F.ZZ;   /* [前置] 她和子晴曖昧（4-3 演過）*/
      check('8. 照現在（解讀，待 AA）：她和子晴曖昧（mutual_interest，原本就因為子晴婉拒）又同時心意條件 ok＝照原本 ZZ 那一版（f3 mutual、4-4 一律 B、4-2b 照演）；不記 ZR_F3_NO',delay&&Z.fy==='declined'&&Z.f3==='mutual'&&Z.forceB===true&&F.ZR_F3_NO==null&&!!ZRZQ.mindSlot(H.G),J({fy:Z.fy,f3:Z.f3,no:F.ZR_F3_NO})); }
    { setup('2028-05-29',21.1,'dorm',{},{cold:true}); H.FAMILIAR('npc_fangyt'); H.FAMILIAR(ZR); rules(); const F=H.G.flags, Z=F.ZZ;
      check('8. 照現在：心意條件沒到＝5/29 F3，她答應（seeing、ZR_FY）；不記 ZR_F3_NO',F.FANG_F3_DAY===D('2028-05-29')&&Z.fy==='seeing'&&F.ZR_FY===true&&F.ZR_F3_NO==null,J({fy:Z.fy,no:F.ZR_F3_NO})); }
    { setup('2028-06-25',12,'dorm',{FANG_F3:'direct',FANG_F3_DAY:D('2028-06-19')}); const Z=ZRZQ.rec(H.G); rules(); const F=H.G.flags;   /* [前置] 這一版以前的存檔：F3 已經過了（ZZ 建起來 fy seeing、f3Day＝那天），心意條件現在 ok */
      check('8. 舊存檔 F3 已經過了：不回頭改（fy seeing、ZR_FY、不記 ZR_F3_NO）',Z.fy==='seeing'&&Z.f3Day===D('2028-06-19')&&F.ZR_FY===true&&F.ZR_F3_NO==null,J({fy:Z.fy,f3Day:Z.f3Day,no:F.ZR_F3_NO})); }
  });

  /* ======================= 10 第 10 節（AA 2026-10-22 回六題，企劃線 021ffe76）======================= */
  // 修改前（開發分支 36ff04ed8）：沒有 ev_zhiruo_ticket_again、ZR_LAST2、方奕廷兩則、A2／A3 條件（這一節大部分 FAIL）
  const A2={n0:'（她在吧檯後面。看到你，停了一下。）',hi:'……好久不見。',ask:'票根，還在嗎？',me:'還在。',take:'寄放的，要拿回來了。……還是，你要一直收著？',keepT:'「我一直收著。」',giveT:'「還給妳。」',
    keepN:'（她做了一杯熱可可，加了一份濃縮，推到你面前。）',keep:'……那這杯，也是你的。',giveN:'（你把票根放在吧檯上。她把它夾進牆上班表的夾板裡。）',give:'……謝謝你幫我收了一年。',hiNo:'好久不見。',no:'……票根，你留著就好。'};
  const FANG2=['她說不行。','我一個人去看了。……片子很好。'];
  await sec('10',async()=>{
    check('10. 讀稿第 10 節（021ffe76）：A1 台詞、A4 兩則都在稿裡',inDoc('## 10. 回 LAWWW 14:5x 六題')&&Object.values(A2).every(t=>inDoc(t.replace(/^「|」$/g,'')))&&FANG2.every(inDoc));
    /* A2：祐廷單身 */
    { const r=invite({dating_heroine_03:true}); check('10. A2 祐廷和別人交往中（dating_heroine_03）＝8/24 沒有邀約（8/26 是七夕，只給單身）',!r.m&&!(X()&&X().cond(H.G)),J(X()?X().cond(H.G,true):null)); }
    /* A3：她和子晴 mutual_interest、held(uk) */
    for(const [st,held] of [['mutual_interest',null],['held','uk']]){ const r=invite({},{pre:G=>{ const Z=ZRZQ.rec(G); Object.assign(Z,{state:st,held,since:0,lastDay:D('2028-03-09')}); }});
      check('10. A3 她和子晴 '+st+(held?'('+held+')':'')+'＝最後一場不演（8/24 沒有邀約）',!r.m,J(X()?X().cond(H.G,true):null)); }
    /* A1：先收著的，2029-09-01 起第一次進 Café */
    const again=()=>ev('ev_zhiruo_ticket_again');
    const cafeAt=(key,h)=>{ at(key,h); H.G.zone='cafe'; };
    { await play(1); const k=H.G.flags.ZR_LAST; cafeAt('2029-08-31',15); const b4=!!again()&&EVENTS.check(again()); cafeAt('2029-09-01',15); const on=!!again()&&EVENTS.check(again());
      H.said=[]; H.opts=[]; H.picks=[0]; if(again()) await EVENTS.run(again()); const L=said(), R=(H.G.flags.romance||{})[ZR]||{};
      check('10. A1 先收著（ZR_LAST keep）：8/31 沒有、2029-09-01 第一次進 Café 才有（ev_zhiruo_ticket_again，只演一次）',k==='keep'&&!b4&&on&&!!again()&&again().once===true,J({k,b4,on}));
      check('10. A1 逐句：旁白「（她在吧檯後面。……）」「……好久不見。」「票根，還在嗎？」祐廷「還在。」「寄放的，要拿回來了。……」；選項「我一直收著。」「還給妳。」',seq(L,[A2.n0,A2.hi,A2.ask,A2.me,A2.take])&&J(H.opts[0])===J([A2.keepT,A2.giveT]),J({L,o:H.opts}));
      check('10. A1「我一直收著。」＝交往（ROM、dating_heroine_02）；熱可可那兩句；ZR_LAST2 back；清掉讓我想想',seq(L,[A2.keepN,A2.keep])&&H.G.flags.ZR_LAST2==='back'&&H.G.flags.dating_heroine_02===true&&R.status==='dating'&&TERMEND.rec(H.G).think[ZR]==null,J({L,f:H.G.flags.ZR_LAST2,R}));
      check('10. A1 演過一次就不再出現',!!again()&&!EVENTS.check(again())); }
    { await play(1); cafeAt('2029-09-02',10); H.said=[]; H.opts=[]; H.picks=[1]; if(again()) await EVENTS.run(again()); const L=said();
      check('10. A1「還給妳。」＝朋友：票根夾進班表那兩句、ZR_LAST2 closed、不交往、房間物件「她的票根」拿掉、清掉讓我想想',seq(L,[A2.giveN,A2.give])&&H.G.flags.ZR_LAST2==='closed'&&!H.G.flags.dating_heroine_02&&!roomList().length&&TERMEND.rec(H.G).think[ZR]==null,J({L,f:H.G.flags.ZR_LAST2,room:roomList().length})); }
    { await play(1); H.G.flags.dating_heroine_03=true; cafeAt('2029-09-01',15); const on=!!again()&&EVENTS.check(again()); H.said=[]; H.opts=[]; if(again()) await EVENTS.run(again()); const L=said();   /* [前置] 那時祐廷和別人交往中 */
      check('10. A1 條件不到（祐廷有交往對象）：「好久不見。」「……票根，你留著就好。」、沒有選項、ZR_LAST2 wait、票根留在房間',on&&J(L)===J([A2.hiNo,A2.no])&&!H.opts.length&&H.G.flags.ZR_LAST2==='wait'&&roomList().length===1,J({on,L,o:H.opts,f:H.G.flags.ZR_LAST2})); }
    { await play(0); cafeAt('2029-09-01',15); check('10. A1 交往的（ZR_LAST wait）沒有這一場',!(again()&&EVENTS.check(again()))); }
    /* A4：方奕廷兩則（F3＋2 天 21:00；接到電話的才傳）*/
    const f3=(flags,o)=>{ setup('2028-05-29',21.1,'dorm',flags,o); H.FAMILIAR('npc_fangyt'); if(o&&o.pre) o.pre(H.G); rules(); at('2028-06-19',21.05); rules(); };
    const fangT=()=>(H.G.msgs||[]).filter(m=>m.th==='p:npc_fangyt'&&m.from==='npc_fangyt').map(m=>m.text);
    { f3(); H.picks=['剛好有兩張']; await EVENTS.run(ev('ev_fangyt_tickets')); const fang=H.G.flags.FANG_F3; rules(); at('2028-06-21',20.9); rules(); const early=FANG2.some(t=>fangT().includes(t)); at('2028-06-21',21.05); rules();
      check('10. A4 她因為祐廷拒絕（ZR_F3_NO）、接到他電話的（'+fang+'）：F3＋2 天 21:00 方奕廷兩則「她說不行。」「我一個人去看了。……片子很好。」（21:00 以前沒有）',['direct','bought','self'].includes(fang)&&!early&&seq(fangT(),FANG2),J({fang,early,m:fangT()})); }
    { setup('2028-05-29',22.1,'jp_dorm',{EXCHANGE_ROUTE:'JP'}); rules(); at('2028-06-19',22.1); rules(); at('2028-06-23',12); rules();
      check('10. A4 沒有接到電話的（nocall，日本路線和他不熟）不傳',H.G.flags.FANG_F3==='nocall'&&H.G.flags.ZR_F3_NO!=null&&!FANG2.some(t=>fangT().includes(t)),J({f:H.G.flags.FANG_F3,m:fangT()})); }
    /* A5：美國路線 */
    { f3({EXCHANGE_ROUTE:'US'}); const F=H.G.flags, Z=F.ZZ||{};
      check('10. A5 美國路線：F3 照現在（她答應方奕廷：seeing、ZR_FY；不記 ZR_F3_NO）',Z.fy==='seeing'&&F.ZR_FY===true&&F.ZR_F3_NO==null,J({fy:Z.fy,FY:F.ZR_FY,no:F.ZR_F3_NO})); }
    { f3({dating_heroine_03:true}); const F=H.G.flags, Z=F.ZZ||{};
      check('10. 第 8 節第 4 條：祐廷有交往對象＝F3 照現在（不記 ZR_F3_NO）',F.ZR_F3_NO==null,J({fy:Z.fy,no:F.ZR_F3_NO})); }
    /* AA_389 第 1 點：ZR_UK_BACK（2028-02-19 回臺北那天記；淡水 D13 交換回來版）*/
    { setup('2028-02-18',22,'dorm'); rules(); const b4=H.G.flags.ZR_UK_BACK; at('2028-02-19',9); rules();
      check('10. AA_389 第 1 點：2/18 還沒有 ZR_UK_BACK，2/19 記那天（不用 ZR_BACK）',b4==null&&H.G.flags.ZR_UK_BACK===D('2028-02-19')&&H.G.flags.ZR_BACK==null,J({b4,f:H.G.flags.ZR_UK_BACK})); }
  });
  H.done();
})();

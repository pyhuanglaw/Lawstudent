// AA_474（企劃線 020f695a3，claude/magical-albattani-bk7b4n；使用者 2026-10-27 回答 C＝七位各自決定接不接受同時交往）——不需要瀏覽器。
//   1 開關（第 4 節第 1 點）：ROM.PARAMS.acceptsOpen 七位都打開
//   2 知情版心意邀約（第 1 節、第 4 節第 2 點）：開關打開以後照樣照各人的 S.KNOWS_OK（以安戀愛 50＝不發、只傳那一句）；條件到＝當場接受（以安）
//   3 學姊（1-2、第 5 節）：「她說可以。」第一次一律讓我想想；第二次（下學期）知情條件＋沒說謊＋中間至少兩次 L1／L2 才「……嗯。」「這學期我一直在想這件事。」「……好。我們試試看。」
//   4 芷若（1-5）：約會 5 次不發；6 次＋Z5＋三問都照實＝第三問接受
//   5 子晴＋芷若同時被發現（第 2 節）：開關打開也照樣兩段都結束；沛珊（1-7）：玩家答「不行」＝沒有 PS_MUTUAL；「可以」＝7 天後談界線、PS_MUTUAL
//   6 第 4 節第 4 點：已經同意（OPEN_OK）的那一段不再被當成「被發現」演一次
//   7 可昕收回（第 3 節）：①又說謊、②又和第三個人交往她從別人那裡先知道、③學期末戀愛 < 80；≥ 70 回 B（我們的日子暫停）、< 70 分手；國外／她在高雄＝視訊；回 B 以後「我說過了。」、Y 結束＝A；每段只一次
//   8 第 4 節 3b：開始交往的那一刻她知道祐廷有別人＝先演知情對話——以安七夕、七月最後一次（學姊算第二次）、芷若 8/26（三問）、學姊大峽谷（第一次＝讓我想想）、學姊重新開始的告白；
//     Z13（含「你點的那一杯」）、Q15＝不演特別版、演一般的知情版；照實＝交往＋OPEN_OK、說會講清楚＝不交往＋承諾
//   9 第 5 節三句（學姊 Byes 第三句、沛珊知情心意邀約的接受、學姊第二次的 then／yes）照稿
//   10 舊存檔：讀檔不多欄位、以前演過的不倒回去重演
// 修改前（開發分支 d5ce20a40）：開關七位都 false、沒有 MREL.knowGate／kxWithdraw——大部分 FAIL。用法：node tests/aa474_acceptsopen_unit.js
// 第二輪（10-30，企劃線 187584ca8）照 AA_481、AA_483 改的期望值：七夕她先說只說兩句（8-1）、大峽谷她先說只說前兩句（8-6）、七月 promise 不接朋友那一句（8-2）、
//   可昕收回 ①「你又騙我一次。」②「我是聽別人講的。」開頭、「我說過了。」前的旁白（7）、第 9 節對 AA_474＋AA_483（24 句）。其他第二輪的檢查在 tests/aa481_483_aopen_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.ZRUK={W_FROM:'2028-09-01',playW:async()=>'orig'};
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let ok=true, err=''; try{   /* 照 index.html 的順序：r2y3b3d、zr_last3d、r2y4b3d、kxod3d、sis_b4_3d 在 multirel3d.js 前面，rom1016_3d.js 在後面（multirel3d.js 包在最外層）*/
  for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/zrzq_events.js','src/zrzq3d.js','src/data/zr_last_events.js','src/zr_last3d.js',
    'src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/kxod3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js','src/data/multirel_lines.js','src/multirel3d.js','src/data/rom1016_events.js','src/rom1016_3d.js']) load(f); }catch(e){ ok=false; err=String(e&&e.stack||e); }
const X=()=>typeof MREL!=='undefined'?MREL:null, Lm=()=>MULTIREL_LINES;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const A1='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
const D=k=>STORY.dayOfKey(k);
const setT=(key,h)=>{ H.G.day=D(key); H.G.hour=h; H.G.weekday=CALENDAR.dateOf(H.G.day).wd%7; };
const setD=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; };
const T=()=>H.said.map(s=>s.t);
const seq=arr=>{ const t=T(); let i=0; for(const a of arr){ const k=t.indexOf(a,i); if(k<0) return false; i=k+1; } return true; };   /* 這幾句照順序出現 */
const clr=()=>{ H.said=[]; H.opts=[]; };
const fresh=(key,h,zone,fl)=>{ H.fresh(key,h,zone||'campus',Object.assign({},fl||{})); if(X()) X()._gm=GM; return H.G; };
const learn=(x,y,src,at)=>ROM.learn(H.G,x,y,src||'test',at);
const walk=async(who,term,picks)=>{ H.picks=picks.slice(); return TERMEND.walkHome(GM,who,term); };
const play=async a=>{ if(a) await X().play(GM,a); return a; };
const due=()=>X().dueAuto(H.G);
const st=x=>X().st(H.G,x);
const setRom=(id,v)=>{ SOCIAL.rel(id).npcRom=v; };
const runOut=async id=>{ const q=OUT.get(H.G,id); if(!q) return null; X().OUTEV.beforeOuting(H.G,GM,q); await EVENTS.run(X().OUTEV); return q; };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); clr(); H.picks=(picks||[]).slice(); if(!q) return false; await OUT.go(GM,q); return true; };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const ON=()=>!!ROM.PARAMS&&Object.keys(ROM.PARAMS.acceptsOpen).length===7&&Object.values(ROM.PARAMS.acceptsOpen).every(v=>v===true);   /* 遊戲裡的開關（使用者 10-27 回答 C）*/
const KNOWL=x=>Lm().KNOW[x];
const okOpen=(x,y)=>!!(H.G.flags.OPEN_OK&&H.G.flags.OPEN_OK[x]&&H.G.flags.OPEN_OK[x][y]);
const W=()=>Lm().KX_WITHDRAW||{};

(async()=>{
check('0. 檔案都載得到（multirel3d.js 包在 r2y3b3d.js 外面，同 index.html）',ok&&!!X()&&!!TERMEND._mrel&&!!TERMEND._r2y3bSP,err);
if(!X()){ H.done(); return; }

/* ---------------- 1. 開關 ---------------- */
await sec(1,async()=>{
  check('1. ROM.PARAMS.acceptsOpen 七位都是 true（AA_474 第 4 節第 1 點；開關只表示「有可能」）',ON(),J(ROM.PARAMS.acceptsOpen));
});

/* ---------------- 2. 知情版心意邀約：條件照 S.KNOWS_OK ---------------- */
await sec(2,async()=>{
  const w=TERMEND.windowOf('Y2S1');
  const anSet=rom=>{ fresh('2027-01-02',12,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX); setRom(A1,rom); const L=DATE.log(H.G,A1); L.count=4; L.wish=true; H.G.flags.YT_HONEST={heroine_01:true}; };
  anSet(50); const r50=TERMEND.heartWhy(H.G,A1,w);
  check('2. 開關打開、以安知道祐廷有別人、照實說過、戀愛 50（< 77）＝不發心意邀約、只傳那一句（S.KNOWS_OK，開關不影響）',ON()&&r50&&r50.nope==='knows',J(r50));
  anSet(80); const r80=TERMEND.heartWhy(H.G,A1,w);
  clr(); const r=await walk(A1,'Y2S1',['我喜歡妳。','我還是跟她在一起']);
  check('2. 戀愛 80＋照實＝發；「我還是跟她在一起。」→「……所以你要我跟她一起。」「你知道你在說什麼嗎？」→「我不知道我為什麼會答應。」「……可是我想答應。」＝交往、OPEN_OK（當場接受）',
    r80===true&&seq(['……所以你要我跟她一起。','你知道你在說什麼嗎？','我不知道我為什麼會答應。','……可是我想答應。'])&&r==='yes'&&H.G.flags.dating_heroine_01===true&&okOpen(A1,KX),J(T()));
});

/* ---------------- 3. 學姊：第一次一律讓我想想；第二次要中間兩次 L1／L2 ---------------- */
await sec(3,async()=>{
  const sisSet=(rom)=>{ fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(SIS); learn(SIS,KX); learn(KX,SIS); setRom(SIS,rom); };
  const first=async()=>{ clr(); return walk(SIS,'Y2S1',['我喜歡妳。','她知道','她說可以']); };
  const second=async()=>{ setT('2027-06-18',21); clr(); return walk(SIS,'Y2S2',['我喜歡妳。','她知道','她說可以']); };
  const meet=n=>{ for(let i=0;i<n;i++){ setT(i?'2027-03-10':'2027-03-03',15); X().meetAction(H.G,SIS,'talk'); } };
  sisSet(90); let r=await first();
  check('3. 第一次「她知道。」→「她說可以。」→「……好。我想一下。」就停＝讓我想想（開關打開、戀愛 90 也不接「我們試試看」、也不說「我還沒準備好。」）',
    ON()&&seq(['……她怎麼說？','……好。我想一下。'])&&!H.has('我們試試看。')&&!H.has('我還沒準備好。')&&r==='think'&&!H.G.flags.dating_heroine_05&&H.G.termend.think[SIS]==='Y2S1'&&!!(H.G.flags.MREL.sk||{})[SIS],J(T()));
  meet(2); r=await second();
  check('3. 第二次（下學期）、中間兩次正常的見面、戀愛 90、照實、沒說謊：「……嗯。」→「這學期我一直在想這件事。」「……好。我們試試看。」＝交往、OPEN_OK（AA_474 第 5 節改的 then／yes）',
    seq(['……她怎麼說？','……嗯。','這學期我一直在想這件事。','……好。我們試試看。'])&&!H.has('……好。我想一下。')&&r==='yes'&&H.G.flags.dating_heroine_05===true&&okOpen(SIS,KX)&&!(H.G.flags.MREL.sk||{})[SIS],J(T()));
  sisSet(90); await first(); meet(1); r=await second();
  check('3. 第二次、中間只見面一次＝「……嗯。」→「我還沒準備好。」（不接受；這學期讓我想想）',seq(['……嗯。','我還沒準備好。'])&&!H.has('……好。我們試試看。')&&r==='think'&&!H.G.flags.dating_heroine_05,J(T()));
  sisSet(90); await first(); meet(2); H.G.flags.YT_LIED={heroine_05:{kexin:true}}; r=await second();
  check('3. 第二次、見面兩次、但說過謊＝「我還沒準備好。」',seq(['……嗯。','我還沒準備好。'])&&!H.G.flags.dating_heroine_05);
  sisSet(70); await first(); meet(2); r=await second();
  check('3. 第二次、見面兩次、戀愛 70（< 75，她的知情條件沒到）＝「我還沒準備好。」',seq(['……嗯。','我還沒準備好。'])&&!H.G.flags.dating_heroine_05);
  sisSet(90); await first(); setT('2027-01-10',23); X().meetAction(H.G,SIS,'talk'); X().meetAction(H.G,SIS,'talk'); r=await second();
  check('3. 見面要在上一次邀約那天以後才算（同一天的兩次不算）',seq(['……嗯。','我還沒準備好。'])&&!H.G.flags.dating_heroine_05);
});

/* ---------------- 4. 芷若：共同經歷（約會 6 次＋Z5／Z7）＋三問都照實 ---------------- */
await sec(4,async()=>{
  const w=TERMEND.windowOf('Y2S1');
  fresh('2027-01-02',12,'campus',{dating_kexin:true,ZR_ASKED_GF:1}); H.CLOSE(ZR); learn(ZR,KX); setRom(ZR,60); H.G.flags.YT_HONEST={heroine_02:true}; const L=DATE.log(H.G,ZR); L.count=5; L.wish=true;
  const r5=TERMEND.heartWhy(H.G,ZR,w); L.count=6; const r6a=TERMEND.heartWhy(H.G,ZR,w); H.G.events.done.ev_zhiruo_film_night=1; const r6=TERMEND.heartWhy(H.G,ZR,w);
  setT('2027-01-10',21); clr(); let r=await walk(ZR,'Y2S1',['先不說','兩個都在一起']);
  const q1=seq(['那你打算怎麼辦？','（她停下腳步。）','……我要想很久。'])&&r==='think';
  setT('2027-03-01',14); clr(); H.picks=['不知道']; await X().dateOpen(GM,{who:ZR}); const q2=X().rec(H.G).zr.q2&&X().rec(H.G).zr.q2.ok===true;
  setT('2027-06-20',21); clr(); r=await walk(ZR,'Y2S2',['先不說','是。']);
  check('4. 芷若知道、照實、約會 5 次＝不發（只傳那一句）；6 次但沒看過 Z5／Z7＝不發；6 次＋Z5＝發；三問（第一問、第二問照實）→ 第三問「是。」＝「……好。」（她把手伸過來，握了一下你的手，又放開。）交往、OPEN_OK',
    ON()&&r5&&r5.nope==='knows'&&r6a&&r6a.nope==='knows'&&r6===true&&q1&&q2&&seq(['你是真的想跟我在一起嗎？','……好。','（她把手伸過來，握了一下你的手，又放開。）'])&&r==='yes'&&H.G.flags.dating_heroine_02===true&&okOpen(ZR,KX),J([r5,r6a,r6,r,T()]));
});

/* ---------------- 5. 子晴＋芷若同時、沛珊的雙向協議 ---------------- */
await sec(5,async()=>{
  fresh('2026-10-01',12,'campus',{}); H.CLOSE(ZQ); H.CLOSE(ZR); setRom(ZQ,95); setRom(ZR,95); ROM.start(H.G,ZQ); setT('2026-10-10',12); ROM.start(H.G,ZR); setT('2026-10-23',16.1); await play(due()); setT('2026-10-24',19.6); H.picks=[2]; await play(due());
  check('5. 開關打開（七位都 true）、戀愛 95：子晴、芷若同時被發現照樣兩段都結束（使用者 10-17 定案，S.excluded 不鬆）、沒有 OPEN_OK',ON()&&!H.G.flags.dating_heroine_04&&!H.G.flags.dating_heroine_02&&H.G.flags.ZQ_ZR_ENDED_DAY!=null&&!okOpen(ZQ,ZR)&&!okOpen(ZR,ZQ));
  { const w=TERMEND.windowOf('Y2S1'); fresh('2027-01-02',12,'campus',{YT_HONEST:{heroine_04:true}}); H.CLOSE(ZR); ROM.start(H.G,ZR); H.CLOSE(ZQ); learn(ZQ,ZR); setRom(ZQ,90); const L=DATE.log(H.G,ZQ); L.count=4; L.wish=true;
    const hw=TERMEND.heartWhy(H.G,ZQ,w); setT('2027-01-10',21); clr(); const r=await walk(ZQ,'Y2S1',['我喜歡妳。','對。']);
    fresh('2027-01-10',21,'campus',{}); H.CLOSE(ZQ); ROM.start(H.G,ZQ); H.CLOSE(ZR); learn(ZR,ZQ); setRom(ZR,90); { const Z=X().rec(H.G).zr; Z.q1={term:'Y2S1',day:H.G.day-30,y:ZQ}; Z.q2={day:H.G.day-10,y:ZQ,ok:true}; }
    setT('2027-06-20',21); clr(); const r2=await walk(ZR,'Y2S2',['先不說','是。']);
    check('5. 開關打開、子晴知道的是芷若（Y＝芷若）＝知情條件不到（不發、只傳那一句），走到「對。」也不接受；芷若反過來（Y＝子晴）第三問也不接受（AA_474 1-4、1-5、第 2 節）',
      ON()&&hw&&hw.nope==='knows'&&r!=='yes'&&!H.G.flags.dating_heroine_02&&H.G.flags.dating_heroine_04===true&&!okOpen(ZR,ZQ)&&r2!=='yes'&&H.has('……我沒辦法。'),J([hw,r,r2])); }
  const pd=async()=>{ fresh('2026-09-20',12,'campus',{dating_kexin:true}); H.CLOSE(PS); setRom(PS,90); ROM.start(H.G,PS); setT('2026-10-20',12); learn(PS,KX); H.G.hour=13; await X().meet(GM,PS,'talk'); clr(); };
  await pd(); setT('2026-10-23',15); H.picks=['我不太能接受','對。不公平','還是想兩邊']; await X().meetAction(H.G,PS,'talk').run(GM); setT('2026-10-26',15); await X().meetAction(H.G,PS,'talk').run(GM);
  const noA=H.has('那這樣對我不太公平吧？')&&!H.G.flags.PS_MUTUAL&&!okOpen(PS,KX);
  await pd(); setT('2026-10-23',15); H.picks=['我不太能接受','我需要想一下']; await X().meetAction(H.G,PS,'talk').run(GM); for(const d of ['2026-10-26','2026-11-05','2026-11-20']){ setT(d,15); const a=X().meetAction(H.G,PS,'talk'); if(a) await a.run(GM); }
  check('5. 沛珊：她問「如果我也跟別人在一起，你可以嗎？」玩家答「不行」＝永遠沒有 PS_MUTUAL（她不退讓「那這樣對我不太公平吧？」；開關打開也一樣）',ON()&&noA&&!H.G.flags.PS_MUTUAL&&!okOpen(PS,KX));
  await pd(); setT('2026-10-23',15); H.picks=['可以。我們可以慢慢談']; await X().meetAction(H.G,PS,'talk').run(GM); setT('2026-10-31',15); clr(); H.picks=['有人不舒服']; await X().meetAction(H.G,PS,'talk').run(GM);
  check('5. 沛珊答「可以。我們可以慢慢談。」→ 7 天以後談界線（psBounds，開關打開以後才走得到）＝PS_MUTUAL、OPEN_OK',H.has('我想了幾件事。')&&!!H.G.flags.PS_MUTUAL&&okOpen(PS,KX));
});

/* ---------------- 6. 已經同意的那一段不再被當成「被發現」 ---------------- */
await sec(6,async()=>{
  fresh('2026-04-01',12,'campus',{dating_kexin:true}); H.CLOSE(SIS); ROM.start(H.G,SIS); setT('2026-04-20',12); learn(SIS,KX); H.G.hour=13; await X().meet(GM,SIS,'talk');
  Object.assign(st(SIS),{phase:'talked',intent:'both',meets:2}); setRom(SIS,80); clr(); await X().meetAction(H.G,SIS,'talk').run(GM);
  const accepted=okOpen(SIS,KX)&&H.G.flags.dating_heroine_05===true;
  delete H.G.flags.knowsRel.heroine_05.kexin; learn(SIS,KX,'told_by:heroine_01'); setT('2026-05-10',21.5); X().scan(H.G);
  check('6. 學姊接受以後（OPEN_OK）再從別人那裡聽到可昕＝不再演發現（S.scan 不排、knownOthers 不算她）',accepted&&!X().rec(H.G).pend[SIS]&&X().knownOthers(H.G,SIS).length===0);
});

/* ---------------- 7. 可昕收回 ---------------- */
await sec(7,async()=>{
  /* 可昕和祐廷交往中、沛珊是 Y：發現 → 挽回 → 結果 B 接受（AA_423 第 3 節）＝OPEN_OK.kexin.classmate_peishan */
  const kxAccept=async(key,fl)=>{ fresh('2026-09-10',12,'dorm',Object.assign({dating_kexin:true,KX_MET_NOODLE_TEAM:true,KX_OUR_DAY:{day:'sat',mode:'mid'}},fl||{})); H.CLOSE(PS); ROM.start(H.G,PS); setT(key,19); learn(KX,PS,'slip:zhe@x'); H.G.hour=21.6; H.picks=['是我的錯']; await play(due());
    Object.assign(st(KX),{done:{self:1,back:1,n4:H.G.day-3,hug:H.G.day-2},b1:H.G.day-1}); setRom(KX,90); clr(); await X().meetAction(H.G,KX,'out').run(GM); return okOpen(KX,PS); };
  const kwId=key=>'mrel_kexin_withdraw_'+D(key);
  /* ① 又說謊 → 隔天 20:00 公館捷運出口 → ≥ 70 回 B */
  let acc=await kxAccept('2026-10-05'); const odDay=D('2026-10-10'); OUT.plan(H.G,{id:'kx_od_'+odDay,ev:'ev_kexin_our_day_wk',day:odDay,h:14,place:'公館',title:'我們的日子：約在公館',travelH:1/6,odPlace:'gongguan',kxod:'Y2S1'});
  const onBefore=KXOD.on(H.G);
  setT('2026-10-07',12); X().phone(H.G,GM); const noLie=!X().rec(H.G).kwp;
  ROM.ytAnswer(H.G,KX,'claimNone'); X().phone(H.G,GM); const p1=X().rec(H.G).kwp, q1=OUT.get(H.G,kwId('2026-10-08'));
  check('7. 接受以後（OPEN_OK.kexin.沛珊）沒事＝不收回；又說謊（YT_LIED.kexin 又記一筆）＝她約隔天 20:00 公館捷運出口（出遊）',acc&&noLie&&!!p1&&p1.why===1&&!!q1&&q1.h===20&&q1.place==='公館捷運出口'&&q1.mrel&&q1.mrel.kind==='withdraw',J([p1,q1]));
  setT('2026-10-08',20); clr(); await runOut(kwId('2026-10-08'));
  check('7. ①（他沒做到她的條件；AA_483 第 2-1 節 BB-C 審稿後的定稿）：「你又騙我一次。」「我那時候開的條件，你還記得嗎？」「她的事你自己講。我問你，你不准騙我。」（她沒有等你回答。）「我答應的時候是想清楚的。」「……我不行了。」→ 戀愛 ≥ 70：「我們的日子先停。」「吃飯還是可以。你不要因為這樣就不敢找我。」',
    seq(['你又騙我一次。','我那時候開的條件，你還記得嗎？','她的事你自己講。我問你，你不准騙我。','（她沒有等你回答。）','我答應的時候是想清楚的。','……我不行了。','我們的日子先停。','吃飯還是可以。你不要因為這樣就不敢找我。'])&&!H.has('我們分開吧。')&&!H.has('現在也想清楚了。我不行了。'),J(T()));
  const W1=H.G.flags.KX_WITHDREW||{};
  check('7. 記錄：清掉 OPEN_OK.kexin.沛珊、KX_WITHDREW {why 1}、回 B（thinking）、還在交往；我們的日子暫停（排好的那一格 skipped、之後不排）',!okOpen(KX,PS)&&W1.why===1&&W1.y===PS&&st(KX).phase==='thinking'&&H.G.flags.dating_kexin===true&&onBefore&&!KXOD.on(H.G)&&OUT.get(H.G,'kx_od_'+odDay).state==='skipped'&&X().knownOthers(H.G,KX).includes(PS));
  ROM.ytAnswer(H.G,KX,'claimNone'); setT('2026-10-08',23); X().phone(H.G,GM); X().scan(H.G);
  check('7. 每段交往只演一次：收回過以後又說謊也不再收回、也不當成「被發現」再演一次',!!H.G.flags.KX_WITHDREW&&!X().rec(H.G).kwp&&!X().rec(H.G).pend[KX]);
  setT('2026-10-08',23.5); clr(); const a0=X().meetAction(H.G,KX,'out');
  setT('2026-10-09',15); clr(); const a1=X().meetAction(H.G,KX,'out'); if(a1) await a1.run(GM); const told=J(T())===J(['（你還沒開口，她先搖了一下頭。）','我說過了。']);
  setT('2026-10-10',15); const a2=X().meetAction(H.G,KX,'out');
  check('7. 回 B 以後、沛珊還在：當天不再演；之後第一次見面祐廷再提兩個都要＝（你還沒開口，她先搖了一下頭。）「我說過了。」（一次；不再走一次接受；旁白照 AA_483 第 1 節第 2 點）',!a0&&told&&!a2&&!okOpen(KX,PS),J(T()));
  const wasB=st(KX).phase==='thinking'; ROM.end(H.G,PS,'t'); setT('2026-10-12',15); clr(); const a3=X().meetAction(H.G,KX,'out'); if(a3) await a3.run(GM);
  check('7. 回 B 以後沛珊真的結束了＝照 5-6 的 A「你真的跟她分了？」「分了。」「……好。」「我不會每次約會都翻舊帳。可是你要是再一次，我就真的走了。」；我們的日子恢復',
    wasB&&J(T())===J(['你真的跟她分了？','分了。','……好。','我不會每次約會都翻舊帳。可是你要是再一次，我就真的走了。'])&&st(KX).phase==='done'&&KXOD.on(H.G),J(T()));
  await kxAccept('2026-10-05'); setT('2026-10-07',12); ROM.ytAnswer(H.G,KX,'claimNone'); X().phone(H.G,GM); setT('2026-10-08',20); await runOut(kwId('2026-10-08'));
  const inB=st(KX).phase==='thinking'&&!KXOD.on(H.G); ROM.end(H.G,KX,'apart_talk'); ROM.cleanup(H.G); setT('2027-03-01',12); ROM.start(H.G,KX);
  check('7. 回 B 以後祐廷和可昕分開、之後重新交往：上一段的 B 不帶過來（我們的日子照常）',inB&&st(KX).phase==='ended'&&!X().kxOdPaused(H.G)&&KXOD.on(H.G));
  /* ② 又和第三個人開始交往，她從別人那裡先知道 → < 70 分手 */
  await kxAccept('2026-10-05'); setRom(KX,60); setT('2026-10-07',12); H.CLOSE(ZQ); ROM.start(H.G,ZQ); learn(KX,ZQ,'told_by:zhe',{day:H.G.day,h:12}); X().scan(H.G); X().phone(H.G,GM);
  const p2=X().rec(H.G).kwp;
  check('7. ② 接受以後又和子晴交往、她從阿哲那裡先知道＝收回（不另外演「被發現」）',!!p2&&p2.why===2&&p2.z===ZQ&&!X().rec(H.G).pend[KX]&&(X().rec(H.G).disc[KX]||{})[ZQ].ver==='withdraw',J(p2));
  setT('2026-10-08',20); clr(); await runOut(kwId('2026-10-08'));
  check('7. ② 第一句「我是聽別人講的。」、其他同①（AA_483 第 2-1 節）→ 戀愛 < 70：「我們分開吧。」「……你不用送我。」＝她提分手（ended、by her）',seq(['我是聽別人講的。','我那時候開的條件，你還記得嗎？','……我不行了。','我們分開吧。','……你不用送我。'])&&!H.has('你又騙我一次。')&&!H.has('我們的日子先停。')&&!H.G.flags.dating_kexin&&ROM.get(H.G,KX).by==='her'&&(H.G.flags.KX_WITHDREW||{}).why===2&&!H.has('你上次跟我講的時候，就已經有她了嗎？'),J(T()));
  acc=await kxAccept('2026-10-05'); setT('2026-10-07',12); H.CLOSE(ZQ); ROM.start(H.G,ZQ); ROM.tellBy(H.G,KX,ZQ); X().scan(H.G); X().phone(H.G,GM);
  check('7. 接受以後、祐廷自己先跟她講子晴（yt_told）＝不是收回（照一般的那一套）',acc&&!X().rec(H.G).kwp&&!H.G.flags.KX_WITHDREW);
  /* ③ 學期末她的戀愛 < 80（她自己改變想法）*/
  await kxAccept('2027-03-10'); setRom(KX,85); setT('2027-06-10',12); X().phone(H.G,GM); const p3a=X().rec(H.G).kwp;
  await kxAccept('2027-03-10'); setRom(KX,75); setT('2027-06-09',23); X().phone(H.G,GM); const p3b=X().rec(H.G).kwp; setT('2027-06-10',12); X().phone(H.G,GM); const p3=X().rec(H.G).kwp;
  check('7. ③ 接受以後的學期末（期末飯那個時段的第一天）看一次：戀愛 85＝不收回；75＝收回（她自己改變想法），時段以前不看',!p3a&&!p3b&&!!p3&&p3.why===3,J([p3a,p3b,p3]));
  setT('2027-06-11',20); clr(); await runOut(kwId('2027-06-11'));
  check('7. ③：「你沒做錯什麼。你都有講。」「可是你每講一次，我就要自己消化好幾天。」「我以為我可以。……我不行了。」→ 75 ≥ 70：我們的日子先停',
    seq(['你沒做錯什麼。你都有講。','可是你每講一次，我就要自己消化好幾天。','我以為我可以。……我不行了。','我們的日子先停。'])&&!H.has('我那時候開的條件，你還記得嗎？')&&st(KX).phase==='thinking',J(T()));
  /* 她在高雄（寒暑假）＝演出來的視訊 */
  await kxAccept('2026-10-05'); setRom(KX,65); setT('2026-12-30',12); X().phone(H.G,GM); const p4=X().rec(H.G).kwp; const noOut=!OUT.rec(H.G).some(q=>q.mrel&&q.mrel.kind==='withdraw');
  setT('2026-12-30',21.5); const d4=due(); setT('2026-12-31',20.5); const e4=due(); setT('2026-12-31',21.5); const f4=due(); clr(); if(f4) await play(f4);
  check('7. 她寒暑假在高雄（③，戀愛 65）：不排出遊；隔天她那邊 21:00～23:30 演出來的視訊 → 「我們分開吧。」（不只用手機文字）',!!p4&&p4.why===3&&noOut&&!d4&&!e4&&!!f4&&f4.bg==='video'&&seq(['你沒做錯什麼。你都有講。','我們分開吧。'])&&!H.G.flags.dating_kexin,J([p4,d4&&d4.k,f4&&f4.k]));
});

/* ---------------- 8. 第 4 節 3b：開始交往的那一刻她知道祐廷有別人 ---------------- */
/* 8-1 以安七夕（2028-07-07，臺灣路線；她在日本）*/
await sec('8-1',async()=>{
  const tana=async picks=>{ fresh('2028-07-06',7.5,'dorm',{dating_kexin:true,EXCHANGE_ROUTE:'TW'}); H.CLOSE(A1); learn(A1,KX); setRom(A1,80); R2Y3B.abTripPlan(H.G); clr(); H.picks=picks.slice(); const q=OUT.get(H.G,'y3_an_tanabata'); if(q) await OUT.go(GM,q); return q; };
  let q=await tana([0,'我還是跟她在一起']);
  check('8-1. 以安七夕、她知道祐廷和可昕交往：玩家先說「以安，我喜歡妳。」→「……我知道。」接 KNOW.say「你先講完。」「你們現在還在一起？」→ 三個選項（沒有原本的「好。」）',
    !!q&&seq(['你要寫一張嗎？','……我知道。','你先講完。','你們現在還在一起？'])&&!H.has('……我知道。我等你說，等了三個月。')&&J(H.opts[1])===J(KNOWL(A1).opts.map(o=>o.t)),J([T(),H.opts]));
  check('8-1. 「我還是跟她在一起。」＝「我不知道我為什麼會答應。」「……可是我想答應。」＝交往＋OPEN_OK（照原本的交往：AN_TANABATA confess、行程照算兩次約會＋心願地點）；之後 d3～d5 照演',
    seq(['我不知道我為什麼會答應。','……可是我想答應。','（她排的行程表上，每一格都有時間。你們只走完一半。）','八月五號，你來接我。'])&&H.G.flags.dating_heroine_01===true&&okOpen(A1,KX)&&H.G.flags.AN_TANABATA==='confess'&&(H.G.flags.confessed||{})[A1]!=null&&(X().rec(H.G).gate[A1]||{}).at==='tanabata');
  q=await tana([1,'我會跟她講清楚','跟她分手']);
  check('8-1. 她先說（把短冊掛上去）、她知道＝只說「你不說，那我說。」「我喜歡你。」就接 KNOW.she「你們現在還在一起？」（AA_481 第 1 節：沒有「理由我寫在手帳裡，回臺灣再給你看。」「……你不准賴。」）；「我會跟她講清楚。」→「跟她分手。」＝不交往、記承諾（exclusive）、AN_TANABATA knows、d3～d5 照舊、不排手帳那一場',
    seq(['你不說，那我說。','我喜歡你。','你們現在還在一起？','講清楚是什麼意思？','好。那你分完，再來找我。','八月五號，你來接我。'])&&!H.has('我喜歡你。理由我寫在手帳裡，回臺灣再給你看。')&&!H.has('……你不准賴。')&&!H.has('你先講完。')&&!H.G.flags.dating_heroine_01&&!okOpen(A1,KX)&&H.G.flags.YT_PROMISED[A1]==='exclusive'&&H.G.flags.AN_TANABATA==='knows'&&DATE.log(H.G,A1).count>=2&&(R2Y3B.anBackPhone(Object.assign(H.G,{day:D('2028-08-05'),hour:12})),!OUT.get(H.G,'y3_an_notebook')),J(T()));
  q=await tana([1,'我還是跟她在一起']); const nb=(R2Y3B.anBackPhone(Object.assign(H.G,{day:D('2028-08-05'),hour:12})),OUT.get(H.G,'y3_an_notebook'));
  check('8-1. 她先說、她知道、「我還是跟她在一起。」＝「你不說，那我說。」「我喜歡你。」→ 知情對話 → 交往＋OPEN_OK；照原本排手帳那一場（AA_481 第 1 節：手帳第一頁「理由欄。空著，給你。」接得上）',
    seq(['你不說，那我說。','我喜歡你。','你們現在還在一起？','我不知道我為什麼會答應。'])&&!H.has('我喜歡你。理由我寫在手帳裡，回臺灣再給你看。')&&H.G.flags.dating_heroine_01===true&&okOpen(A1,KX)&&H.G.flags.AN_TANABATA==='confess'&&!!nb,J([T(),nb]));
  fresh('2028-07-06',7.5,'dorm',{EXCHANGE_ROUTE:'TW'}); H.CLOSE(A1); setRom(A1,80); R2Y3B.abTripPlan(H.G); clr(); H.picks=[0]; await OUT.go(GM,OUT.get(H.G,'y3_an_tanabata'));
  check('8-1. 她不知道（祐廷沒有別人）＝照原本「……我知道。我等你說，等了三個月。」「好。」交往',H.has('……我知道。我等你說，等了三個月。')&&H.G.flags.dating_heroine_01===true&&H.G.flags.AN_TANABATA==='confess'&&!H.has('你先講完。'));
});

/* 8-2 七月最後一次的心意邀約（2029-07-14，2-Y4-46）*/
await sec('8-2',async()=>{
  const GD={GRADUATED:D('2029-06-02'),dating_kexin:true};
  const july=async(id,picks,o)=>{ fresh('2029-07-14',18.3,'dorm',Object.assign({},GD,(o&&o.fl)||{})); H.CLOSE(id); learn(id,KX); if(id===SIS) learn(KX,SIS); setRom(id,(o&&o.rom)||80); const L=DATE.log(H.G,id); L.count=4; L.wish=true; TERMEND.rec(H.G).think[id]='Y4S2';
    if(o&&o.pre) o.pre(); OUT.plan(H.G,{id:'y4_july',ev:'ev_heart_july',day:D('2029-07-14'),h:18.5,place:'x',title:'t',travelH:0.25,july:{id}}); setT('2029-07-14',18.3); return goOut('y4_july',picks); };
  await july(A1,[0,'我還是跟她在一起']);
  check('8-2. 以安、她知道祐廷和可昕交往：說出來＝接 KNOW.say「你先講完。」「你們現在還在一起？」→「我還是跟她在一起。」→ 接受＝交往＋OPEN_OK（沒有原本的「……嗯。這次換你先說了。」）',
    seq(['你先講完。','你們現在還在一起？','……所以你要我跟她一起。','我不知道我為什麼會答應。','……可是我想答應。'])&&!H.has('……嗯。這次換你先說了。')&&H.G.flags.dating_heroine_01===true&&okOpen(A1,KX)&&H.G.flags.HEART_JULY.res==='yes',J(T()));
  await july(A1,[3,'我會跟她講清楚','跟她分手'],{fl:{BAR_REG:true}});
  check('8-2. 先不說＝她七月那幾句（手帳寫滿了、「你回答。」）接 KNOW.she「你們現在還在一起？」；「我會跟她講清楚。」→「跟她分手。」＝不交往：演完她那一句「好。那你分完，再來找我。」就結束、不接朋友那一句（AA_481 4-2）、HEART_LAST（最後一次）、HEART_FRIEND、記承諾',
    seq(['（她把手帳翻到最後一頁，推到你面前。那一行字的下面，寫滿了。）','我寫完了。這次我不等下一次。','你回答。','你們現在還在一起？','好。那你分完，再來找我。'])&&!H.said.some(s=>/八月四號，你考試加油。/.test(s.t))&&!H.opts.some(o=>J(o)===J(['「好。」','「我們還是朋友。」']))&&!H.G.flags.dating_heroine_01&&H.G.flags.HEART_LAST_heroine_01===true&&H.G.flags.HEART_FRIEND_heroine_01===true&&H.G.flags.YT_PROMISED[A1]==='exclusive'&&H.G.flags.HEART_JULY.res==='friend'&&TERMEND.rec(H.G).think[A1]==null,J(T()));
  await july(SIS,[0,'她知道','她說可以'],{rom:80,fl:{YT_HONEST:{heroine_05:true}},pre:()=>{ setT('2029-06-20',15); X().meetAction(H.G,SIS,'talk'); setT('2029-06-27',15); X().meetAction(H.G,SIS,'talk'); }});
  check('8-2. 學姊七月算第二次：中間兩次見面、照實、戀愛 80＝「……嗯。」「這學期我一直在想這件事。」「……好。我們試試看。」交往＋OPEN_OK',seq(['……她怎麼說？','……嗯。','這學期我一直在想這件事。','……好。我們試試看。'])&&H.G.flags.dating_heroine_05===true&&okOpen(SIS,KX),J(T()));
  await july(SIS,[0,'她知道','她說可以'],{rom:80,fl:{YT_HONEST:{heroine_05:true}}});
  check('8-2. 學姊七月、中間沒有見面＝「我還沒準備好。」→ 朋友那一句、HEART_LAST',seq(['……嗯。','我還沒準備好。'])&&!H.G.flags.dating_heroine_05&&H.G.flags.HEART_LAST_heroine_05===true,J(T()));
});

/* 8-3 芷若 8/26 出國前的最後一場（2028-08-26）*/
await sec('8-3',async()=>{
  const last=async(picks,pre)=>{ fresh('2028-08-26',19.5,'dorm',{dating_kexin:true}); H.CLOSE(ZR); setRom(ZR,60); learn(ZR,KX,'test',{day:D('2028-08-25'),h:12}); if(pre) pre(); clr(); H.picks=picks.slice(); await EVENTS.run(ev('ev_zhiruo_last_screening')); };
  await last(['我會跟她講']);
  check('8-3. 她知道祐廷和可昕交往（8/24 以後）、沒問過第一問：「……一年。」之後先演第一問「那你打算怎麼辦？」→「我會跟她講。」＝不交往、記承諾（handle）→ 原本的 keep「好。……那就先收著。」（沒有「我等妳回來。」那兩個選項）',
    seq(['……一年。','那你打算怎麼辦？','……好。','好。……那就先收著。','（她往捷運站走。走到路口，回頭揮了一下手。）'])&&!H.opts.some(o=>o.includes('「我等妳回來。」'))&&H.G.flags.ZR_LAST==='keep'&&!H.G.flags.dating_heroine_02&&H.G.flags.YT_PROMISED[ZR]==='handle:kexin'&&TERMEND.rec(H.G).think[ZR]!=null&&!!X().rec(H.G).zr.q1,J([T(),H.opts]));
  await last(['是。'],()=>{ const Z=X().rec(H.G).zr; Z.q1={term:'Y3S1',day:D('2028-01-10'),y:KX}; Z.q2={day:D('2028-03-01'),y:KX,ok:true}; });
  check('8-3. 問過第一、二問（都照實）＝第三問「你是真的想跟我在一起嗎？」→「是。」＝「……好。」（握手）交往＋OPEN_OK → 原本的 wait「一年。……你說的喔。」',
    seq(['……一年。','你是真的想跟我在一起嗎？','……好。','（她把手伸過來，握了一下你的手，又放開。）','一年。……你說的喔。'])&&H.G.flags.ZR_LAST==='wait'&&H.G.flags.dating_heroine_02===true&&okOpen(ZR,KX)&&!H.has('好。……那就先收著。'),J(T()));
  fresh('2028-08-26',19.5,'dorm',{}); H.CLOSE(ZR); clr(); H.picks=[0]; await EVENTS.run(ev('ev_zhiruo_last_screening'));
  check('8-3. 她不知道（祐廷單身）＝照原本「我等妳回來。」／「我先收著。」',J(H.opts[0])===J(['「我等妳回來。」','「我先收著。」'])&&H.G.flags.ZR_LAST==='wait'&&H.G.flags.dating_heroine_02===true&&!H.has('那你打算怎麼辦？'));
});

/* 8-4 芷若 Z13（大三下學期末特別版）、「你點的那一杯」 */
await sec('8-4',async()=>{
  const zrSet=knows=>{ fresh('2028-06-08',20.6,'dorm',{CAFE_VISITS:3,dating_kexin:true,YT_HONEST:{heroine_02:true},ZR_GAVE_HER_ORDER:true}); H.CLOSE(ZR); setRom(ZR,40); H.G.contacts[ZR]=1; const L=DATE.log(H.G,ZR); L.count=6; L.wish=true;
    for(const t of ['ASKED_HER_DRINK','REMEMBERED_HER','WATCHED_FILM','POSTCARDS']) SOCIAL.remember(ZR,t,''); H.G.events.done.ev_zhiruo_film_night=1; if(knows) learn(ZR,KX,'test',{day:D('2028-06-01'),h:12}); };
  const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
  const zt='te_Y3S2_heroine_02', inv=()=>(H.G.msgs||[]).filter(m=>m.th==='p:heroine_02').map(m=>m.text);
  zrSet(true); rules(); const P=TERMEND.rec(H.G,'Y3S2').plan||{};
  H.G.zone='cafe'; const hisO=ROM1016.hisOrderDue(H.G);
  check('8-4. Z13 的條件都到、她知道祐廷和可昕交往：這學期不演 Z13 特別版（邀約是一般版、不是「畢業以後我還有幾個班。」）；也沒有「（點一杯熱可可加濃縮）」',(P.heart||[]).includes(ZR)&&!(P.special&&P.special[ZR])&&inv().length>0&&!inv().includes('畢業以後我還有幾個班。')&&!hisO,J([P,inv(),hisO]));
  PHONE.answer(H.G,zt,0); rules(); let q=OUT.get(H.G,'te_Y3S2'); if(q){ setD(q.day,q.h-0.1); } await goOut('te_Y3S2',['先不說','我會跟她講']);
  check('8-4. 一般的飯 → 回家路上走知情版（芷若第一問「那你打算怎麼辦？」）；沒有杯子',!!q&&!q.te.special&&seq(['那你打算怎麼辦？'])&&!H.has('（是她自己的點法：「熱可可＋濃縮」。）')&&H.G.flags.ZR_CUP==null&&!H.G.flags.dating_heroine_02,J([q,T()]));
  zrSet(false); rules(); PHONE.answer(H.G,zt,0); rules(); q=OUT.get(H.G,'te_Y3S2'); const sp=q&&q.te&&q.te.special; learn(ZR,KX,'test',{day:D('2028-06-10'),h:12}); if(q) setD(q.day,q.h-0.1); await goOut('te_Y3S2',['先不說','我會跟她講']);
  check('8-4. 排好 Z13 以後她才知道：那頓飯不演杯子，改走一般的飯＋知情版心意邀約',sp==='z13'&&H.has('那你打算怎麼辦？')&&!H.has('（是她自己的點法：「熱可可＋濃縮」。）')&&H.G.flags.ZR_CUP==null,J(T()));
});

/* 8-5 子晴 Q15（大三下學期末特別版）＋回答.exe */
await sec('8-5',async()=>{
  const zqSet=knows=>{ fresh('2028-06-08',20.6,'dorm',{ZQ_DAD_HEARD:true,ATTENDED_SHOW:true,dating_kexin:true,YT_HONEST:{heroine_04:true},ZQ_ASK_KAI_D:knows?null:0});   /* 不知道的那一版：阿凱那一條（子晴問阿凱，ROM.zqAskTick）先關掉 */ H.CLOSE(ZQ); setRom(ZQ,40); H.G.contacts[ZQ]=1; const L=DATE.log(H.G,ZQ); L.count=4; L.wish=true;
    for(const t of ['CLAPPED','PLAYTESTED','TOLD_HER_CHANGE']) SOCIAL.remember(ZQ,t,''); if(knows) learn(ZQ,KX,'test',{day:D('2028-06-01'),h:12}); };
  const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
  const qt='te_Y3S2_heroine_04', inv=()=>(H.G.msgs||[]).filter(m=>m.th==='p:heroine_04').map(m=>m.text);
  zqSet(true); rules(); const P=TERMEND.rec(H.G,'Y3S2').plan||{};
  check('8-5. Q15 的條件都到、她知道祐廷和可昕交往：這學期不演 Q15 特別版（plan.special 沒有她）',R2Y3B.q15Ready(H.G)&&(P.heart||[]).includes(ZQ)&&!(P.special&&P.special[ZQ])&&inv().length>0,J([P,inv()]));
  PHONE.answer(H.G,qt,0); rules(); let q=OUT.get(H.G,'te_Y3S2'); if(q) setD(q.day,q.h-0.1); await goOut('te_Y3S2',[0,'對。']);
  check('8-5. 一般的飯（沒有 Q15 的飯桌一句）→ 回家路上走一般的知情版：「所以你是認真的喔？」「可昕呢？」「你現在是想同時跟我們兩個在一起？」→「對。」＝「……我居然在考慮。」「好。可是你不准瞞我任何事。」交往＋OPEN_OK（沒有 Q15 的三句）',
    seq(['所以你是認真的喔？','可昕呢？','你現在是想同時跟我們兩個在一起？','……我居然在考慮。','好。可是你不准瞞我任何事。'])&&!H.has('發表會那天的錄影，我爸看了三遍。……第三遍他在做筆記。')&&!H.opts.some(o=>o.some(t=>/第一個玩的/.test(t)))&&H.G.flags.dating_heroine_04===true&&okOpen(ZQ,KX)&&H.G.flags.ZQ_Q15==null,J([T(),H.opts]));
  zqSet(false); rules(); PHONE.answer(H.G,qt,0); rules(); q=OUT.get(H.G,'te_Y3S2'); if(q) setD(q.day,q.h-0.1); await goOut('te_Y3S2',[0]);
  const Q=H.G.flags.ZQ_Q15; learn(ZQ,KX,'test',{day:Q?Q.day:H.G.day,h:23}); if(Q) setD(Q.day+1,12.1); rules(); const sent=PHONE.sent(H.G,'y3_zq_exe');
  check('8-5. Q15 演完、回答.exe 以前她才知道：不傳檔案、不交往；這學期算「讓我想想」（下學期一般的知情版）',!!Q&&Q.res==='knows'&&!sent&&!R2Y3B.exeDue(H.G)&&!H.G.flags.dating_heroine_04&&TERMEND.rec(H.G).think[ZQ]==='Y3S2',J([Q,sent]));
});

/* 8-6 學姊大峽谷（臺灣路線，2028-10-13）*/
await sec('8-6',async()=>{
  const canyon=async(picks,pre)=>{ fresh('2028-10-07',7,'dorm',{EXCHANGE_ROUTE:'TW',dating_kexin:true,YT_HONEST:{heroine_05:true}}); H.CLOSE(SIS); learn(SIS,KX); learn(KX,SIS); setRom(SIS,80); const L=DATE.log(H.G,SIS); L.count=4; if(pre) pre(); clr(); H.picks=picks.slice(); await EVENTS.run(ev('ev_sis_canyon')); };
  await canyon([0,'她知道','她說可以']);
  check('8-6. 她知道祐廷和可昕交往：告白「學姊，我喜歡妳。」那一刻接 KNOW.heroine_05「可昕知道嗎？」→「她知道。」→「她說可以。」→「……好。我想一下。」（第一次＝讓我想想）；沒有原本的「好。」',
    seq(['可昕知道嗎？','……她怎麼說？','……好。我想一下。','十二月二十三號，晚上八點落地。你來接我。'])&&!H.has('……我以為我要先說。')&&!H.has('我們試試看。'),J(T()));
  check('8-6. 不交往：行程照算兩次約會＋心願地點、SIS_GF_CANYON 不記、不叫書瑀（SIS_CANYON knows）',!H.G.flags.dating_heroine_05&&H.G.flags.SIS_CANYON==='knows'&&H.G.flags.SIS_GF_CANYON==null&&!H.G.flags.CALLED_SHUYU&&DATE.log(H.G,SIS).count===6&&DATE.log(H.G,SIS).wish===true);
  await canyon([1,'我會跟她說','說我們分手']);
  check('8-6. 她先說（看著峽谷）、她知道：只說前兩句就接「可昕知道嗎？」（AA_481 第 2 節：沒有「你要說好，還是要我再說一次。」）；「我會跟她說。」→「說我們分手。」＝不交往、記承諾（exclusive）',seq(['那我先說。','我喜歡你。……我想了很久，要不要在這裡說。','可昕知道嗎？','那等你說完。'])&&!H.has('你要說好，還是要我再說一次。')&&!H.G.flags.dating_heroine_05&&H.G.flags.YT_PROMISED[SIS]==='exclusive'&&H.G.flags.SIS_CANYON==='knows',J(T()));
  await canyon([0,'她知道','她說可以'],()=>{ TERMEND.rec(H.G).think[SIS]='Y3S2'; H.G.termend.Y3S2=Object.assign(H.G.termend.Y3S2||{},{done:{who:SIS,kind:'heart',day:D('2028-06-12')}}); setT('2028-09-02',15); X().meetAction(H.G,SIS,'talk'); setT('2028-09-20',15); X().meetAction(H.G,SIS,'talk'); setT('2028-10-07',7); });
  check('8-6. 上學期心意邀約讓我想想過、中間兩次見面、照實、戀愛 80＝第二次：「……嗯。」「這學期我一直在想這件事。」「……好。我們試試看。」交往＋OPEN_OK、SIS_GF_CANYON、叫書瑀',
    seq(['可昕知道嗎？','……嗯。','這學期我一直在想這件事。','……好。我們試試看。'])&&H.G.flags.dating_heroine_05===true&&okOpen(SIS,KX)&&H.G.flags.SIS_GF_CANYON!=null&&H.G.flags.CALLED_SHUYU===true&&H.G.flags.SIS_CANYON==='confess',J(T()));
});

/* 8-7 學姊分開過以後重新開始，第二次約會結尾的告白（date3d.js S.confess；AA_386 4-2）*/
await sec('8-7',async()=>{
  const conf=async(picks,pre)=>{ fresh('2027-03-20',17,'dorm',{dating_kexin:true}); H.CLOSE(SIS); learn(SIS,KX); learn(KX,SIS); setRom(SIS,80); if(pre) pre(); clr(); H.picks=picks.slice(); return DATE.confess(GM,SIS,{ok:true},{who:SIS,locs:['D07'],day:H.G.day,trip:'T9'}); };
  let r=await conf([0,'她知道','她說可以']);
  check('8-7. 告白、她知道祐廷和可昕交往（第一次）：接 KNOW.heroine_05 →「……好。我想一下。」＝不交往、走 L.notYet（她的「還沒」）',
    seq(['時間差不多了。……你剛剛好像一直想講什麼。','可昕知道嗎？','……好。我想一下。','……謝謝你。可是我還沒想好。'])&&r==='notYet'&&!H.G.flags.dating_heroine_05&&!!DATE.log(H.G,SIS).notYet&&!H.has('……我知道。'),J([r,T()]));
  r=await conf([0,'她知道','她說可以'],()=>{ const M=X().rec(H.G); (M.sk||(M.sk={}))[SIS]={day:D('2027-01-10'),term:'Y2S1'}; setT('2027-02-20',15); X().meetAction(H.G,SIS,'talk'); setT('2027-03-01',15); X().meetAction(H.G,SIS,'talk'); setT('2027-03-20',17); H.G.flags.YT_HONEST={heroine_05:true}; });
  check('8-7. 第二次（之前演過知情對話、中間兩次見面、照實）＝接受：交往＋OPEN_OK（「這學期我一直在想這件事。」「……好。我們試試看。」）',r==='yes'&&seq(['……嗯。','這學期我一直在想這件事。','……好。我們試試看。'])&&H.G.flags.dating_heroine_05===true&&okOpen(SIS,KX),J([r,T()]));
});

/* ---------------- 9. 台詞照稿（第 3 節、第 5 節；企劃線 020f695a3）---------------- */
await sec(9,async()=>{
  const cp=require('child_process'); let doc='';
  for(const r of ['187584ca8','origin/claude/cool-heisenberg-o8kuqx']){ try{ doc=['AA_474_acceptsOpen使用者回答C_七位各自的條件','AA_483_回LAWWW_AA474子代理八題_BB審稿定稿_美國秋假自習室提示'].map(f=>cp.execSync('git show '+r+':"docs/story_planning/'+f+'.md"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']})).join('\n'); if(doc) break; }catch(e){ doc=''; } }   /* AA_474（第 3、5 節）＋AA_483（第 1 節第 1、2 點、第 2-1、2-2 節取代 ①② 與視訊的字）*/
  const inDoc=t=>doc.indexOf(t)>=0, K5=KNOWL(SIS).opts.find(o=>o.t==='「她知道。」').sub.find(q=>q.t==='「她說可以。」');
  check('9. 第 5 節三處：學姊 Byes 第三句「……你去見她那天，出門前傳一句給我就好。」；沛珊知情心意邀約的接受「好。可是她那邊也要知道喔。兩邊都不要偷偷的。」；學姊「她說可以。」第二次 then「……嗯。」、yes「這學期我一直在想這件事。」「……好。我們試試看。」（第一次照原本「……好。我想一下。」）',
    Lm().REPAIR.heroine_05.result.Byes[2]==='……你去見她那天，出門前傳一句給我就好。'&&J(KNOWL(PS).opts.find(o=>o.t==='「我想跟妳們都在一起。」').accept.yes)===J(['好。可是她那邊也要知道喔。兩邊都不要偷偷的。'])
    &&J(K5.then)===J(['……好。我想一下。'])&&K5.first==='think'&&J(K5.again.then)===J(['……嗯。'])&&J(K5.again.accept.yes)===J(['這學期我一直在想這件事。','……好。我們試試看。'])&&J(K5.again.accept.no)===J(['我還沒準備好。']));
  const all=[].concat(W().broke,W().heard,W().self,W().pause,W().end,W().endVideo,W().told,W().videoOpen).filter(x=>x!=null).map(x=>typeof x==='string'?x:String(x.n).replace(/^（|）$/g,''));
  check('9. 可昕收回的台詞（AA_474 第 3 節＋AA_483 第 1 節第 1、2 點、第 2-1、2-2 節，24 句）、第 5 節改的句子都在企劃線的稿裡（一字不改）',!!doc&&all.length===24&&all.every(inDoc)&&['……你去見她那天，出門前傳一句給我就好。','好。可是她那邊也要知道喔。兩邊都不要偷偷的。','這學期我一直在想這件事。','……好。我們試試看。'].every(inDoc),doc?J(all.filter(t=>!inDoc(t))):'讀不到企劃線 187584ca8（先 git fetch origin claude/cool-heisenberg-o8kuqx）');
  check('9. 七位「接受」的說法都不一樣（第 5 節：改過以後沒有撞句）',(()=>{ const ys=[Lm().REPAIR.heroine_05.result.Byes,Lm().REPAIR.kexin.result.Byes,Lm().REPAIR.heroine_04.result.Byes,Lm().REPAIR.heroine_02.result.Byes,Lm().REPAIR.heroine_03.result.B,Lm().REPAIR.heroine_01.result.C,
      KNOWL(PS).opts.find(o=>o.t==='「我想跟妳們都在一起。」').accept.yes,KNOWL(YT).opts.find(o=>o.accept).accept.yes].map(x=>J(x)); return new Set(ys).size===ys.length&&!ys.some(y=>/她的事，你要自己跟我講/.test(y)); })());
});

/* ---------------- 10. 舊存檔 ---------------- */
await sec(10,async()=>{
  fresh('2027-03-01',12,'campus',{dating_kexin:true}); H.G.flags.MREL={v:1,st:{heroine_05:{y:KX,n:1,day:10,phase:'ended',result:'Bno',endedDay:20}}}; ROM.rec(H.G); X().rec(H.G);
  const keys=Object.keys(H.G.flags.MREL).sort();
  check('10. 舊存檔讀檔：MREL 不多 AA_474 的欄位（sk、sm、lc、gate、kxo、kwp 用到才建）、沒有 KX_WITHDREW',!keys.some(k=>['sk','sm','lc','gate','kxo','kwp'].includes(k))&&H.G.flags.KX_WITHDREW==null,J(keys));
  H.CLOSE(SIS); const a=X().meetAction(H.G,SIS,'talk');
  check('10. 以前已經演過「不接受」（學姊 Bno、分開）的：結果照舊，不倒回去重演',!a&&X().st(H.G,SIS).result==='Bno'&&!H.G.flags.dating_heroine_05);
  fresh('2027-01-10',21,'campus',{dating_kexin:true,YT_HONEST:{heroine_05:true}}); H.CLOSE(SIS); learn(SIS,KX); learn(KX,SIS); setRom(SIS,90); TERMEND.rec(H.G).think[SIS]='Y2S1';   /* 舊存檔：上學期知情版讓我想想過（這個版本以前沒有 sk、sm）*/
  setT('2027-06-18',21); clr(); let r=await walk(SIS,'Y2S2',['我喜歡妳。','她知道','她說可以']); const noMeet=r==='think'&&H.has('我還沒準備好。');
  fresh('2027-01-10',21,'campus',{dating_kexin:true,YT_HONEST:{heroine_05:true}}); H.CLOSE(SIS); learn(SIS,KX); learn(KX,SIS); setRom(SIS,90); TERMEND.rec(H.G).think[SIS]='Y2S1';
  setT('2027-03-03',15); X().meetAction(H.G,SIS,'talk'); setT('2027-03-10',15); X().meetAction(H.G,SIS,'talk'); setT('2027-06-18',21); clr(); r=await walk(SIS,'Y2S2',['我喜歡妳。','她知道','她說可以']);
  check('10. 舊存檔的學姊（讓我想想過、沒有見面紀錄）：第二次要讀檔以後再見兩次面才接受',noMeet&&r==='yes'&&H.G.flags.dating_heroine_05===true);
});

H.done();
})();

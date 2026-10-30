// ACCEPTSOPEN-C-1027 第二輪（企劃線 187584ca8，claude/cool-heisenberg-o8kuqx；AA-C 10-27 定稿，D109）——不需要瀏覽器。
//   AA_481（AA_474 實作讀後，特別場景的知情對話接不上的五處）：
//     1 以安七夕她先說、她知道＝只說「你不說，那我說。」「我喜歡你。」就接 KNOW.she；答應的照原本排手帳那一場
//     2 學姊大峽谷她先說、她知道＝只說前兩句就接知情對話（沒有「你要說好，還是要我再說一次。」）
//     3 芷若 8/26：知情對話答應以後祐廷自動說「我等妳回來。」才接「一年。……你說的喔。」；騎樓下換旁白（她轉過來看你／又看回騎樓外面）
//     4 七月最後一次：知情對話沒答應＝朋友那一句拿掉開頭的「好。」「好啦。」；說要分手、說要跟她講（promise）＝不接朋友那一句；學姊她先說只說第一句
//     5 可昕收回：當面＝排出遊那一刻她傳兩則（今天／明天晚上八點，公館捷運出口。我有事要講。不會很久。）；視訊＝當天 19:00 一則、接通先一句旁白
//   AA_483 第 1～2 節：①「你又騙我一次。」②「我是聽別人講的。」開頭（BB-C 審稿後）；視訊版 D「……我先掛了。」；「我說過了。」前的旁白；
//     Q15 回答.exe 傳了、回了貼紙之後她才知道＝改傳兩則；告白選項她知道、知情條件過了＝照樣出（七位一樣）；沛珊 S.TELL（第 2-3 節）
//   AA_482（2-Y4-54 照使用者 C）：坦白照她們自己的條件（S.TELL 收尾換成「要想一下」、不退回朋友、記成祐廷先坦白＋冷靜期）；說的對象只排還沒都同意的；
//     都同意＝2030-05-25 沒有選擇那一場、尾聲兩位都在祐廷旁邊（右手邊＝在一起最久的、CG 共通圖、桌上每一位的東西、新的一句旁白）；對話框照人數；子晴＋芷若照樣兩人都離開
// 修改前（開發分支 9bc01f480）：這些都還是第一輪的樣子——大部分 FAIL。用法：node tests/aa481_483_aopen_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
global.ZRUK={W_FROM:'2028-09-01',playW:async()=>'orig'};
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let ok=true, err=''; try{   /* 照 index.html 的順序（同 tests/aa474_acceptsopen_unit.js）*/
  for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/zrzq_events.js','src/zrzq3d.js','src/data/zr_last_events.js','src/zr_last3d.js',
    'src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/kxod3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js','src/data/multirel_lines.js','src/multirel3d.js','src/data/rom1016_events.js','src/rom1016_3d.js']) load(f); }catch(e){ ok=false; err=String(e&&e.stack||e); }
const X=()=>typeof MREL!=='undefined'?MREL:null, Lm=()=>MULTIREL_LINES, RB=()=>typeof R2Y4B!=='undefined'?R2Y4B:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const A1='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
const D=k=>STORY.dayOfKey(k);
const setT=(key,h)=>{ H.G.day=D(key); H.G.hour=h; H.G.weekday=CALENDAR.dateOf(H.G.day).wd%7; };
const setD=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; };
const T=()=>H.said.map(s=>s.t);
const seq=arr=>{ const t=T(); let i=0; for(const a of arr){ const k=t.indexOf(a,i); if(k<0) return false; i=k+1; } return true; };
const iOf=t=>T().indexOf(t);
const clr=()=>{ H.said=[]; H.opts=[]; H.cgs=[]; };
const fresh=(key,h,zone,fl)=>{ H.fresh(key,h,zone||'campus',Object.assign({},fl||{})); if(X()) X()._gm=GM; return H.G; };
const learn=(x,y,src,at)=>ROM.learn(H.G,x,y,src||'test',at);
const play=async a=>{ if(a) await X().play(GM,a); return a; };
const due=()=>X().dueAuto(H.G);
const st=x=>X().st(H.G,x);
const setRom=(id,v)=>{ SOCIAL.rel(id).npcRom=v; };
const runOut=async id=>{ const q=OUT.get(H.G,id); if(!q) return null; X().OUTEV.beforeOuting(H.G,GM,q); await EVENTS.run(X().OUTEV); return q; };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); clr(); H.picks=(picks||[]).slice(); if(!q) return false; await OUT.go(GM,q); return true; };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const okOpen=(x,y)=>!!(H.G.flags.OPEN_OK&&H.G.flags.OPEN_OK[x]&&H.G.flags.OPEN_OK[x][y]);
const setOpen=(x,y)=>{ const O=H.G.flags.OPEN_OK||(H.G.flags.OPEN_OK={}); (O[x]||(O[x]={}))[y]=true; };
const W=()=>Lm().KX_WITHDRAW||{};
const msgs=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const GD={GRADUATED:D('2029-06-02')};
/* 企劃線的稿（逐字對）*/
const SPEC='187584ca8', SPEC_OF={a483:'9c4152899'}, FILES={a474:'AA_474_acceptsOpen使用者回答C_七位各自的條件',a481:'AA_481_AA474實作讀後_特別場景的知情對話接不上的五處',a482:'AA_482_多段感情2-Y4-54照使用者C更新_坦白照她們的條件_都同意的尾聲',a483:'AA_483_回LAWWW_AA474子代理八題_BB審稿定稿_美國秋假自習室提示'};
const DOC={}; for(const k in FILES){ for(const r of [SPEC_OF[k]||SPEC,'origin/claude/cool-heisenberg-o8kuqx']){ try{ DOC[k]=cp.execSync('git show '+r+':"docs/story_planning/'+FILES[k]+'.md"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); if(DOC[k]) break; }catch(e){ DOC[k]=''; } } }
const inDoc=(t,...ks)=>(ks.length?ks:Object.keys(DOC)).some(k=>(DOC[k]||'').indexOf(t)>=0);

(async()=>{
check('0. 檔案都載得到（multirel3d.js 包在 r2y3b3d.js 外面，同 index.html）；讀得到企劃線 '+SPEC+' 的 AA_474、481、482、483',ok&&!!X()&&!!RB()&&Object.values(DOC).every(Boolean),err||J(Object.keys(DOC).filter(k=>!DOC[k])));
if(!X()){ H.done(); return; }
{ const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_4(74|81|82|83)_/.test(e.path));
  check('0. 劇情匯入白名單：AA_474、AA_481、AA_482、AA_483 都是 '+SPEC+'（AA_483 是 '+SPEC_OF.a483+'）、approved、AA-C 定稿、任務 ACCEPTSOPEN-C-1027（這支測試對同一版的稿）',A.length===4&&A.every(e=>e.sha===(/AA_483_/.test(e.path)?SPEC_OF.a483:SPEC)&&e.status==='approved'&&/AA-C/.test(e.approvedBy||'')&&e.task==='ACCEPTSOPEN-C-1027'),J(A.map(e=>[e.path.slice(19,25),e.sha]))); }

/* ================= AA_481 第 1 節：以安七夕，她先說的那一條 ================= */
await sec('481-1',async()=>{
  const tana=async(picks,kx)=>{ fresh('2028-07-06',7.5,'dorm',Object.assign({EXCHANGE_ROUTE:'TW'},kx===false?{}:{dating_kexin:true})); H.CLOSE(A1); if(kx!==false) learn(A1,KX); setRom(A1,80); R2Y3B.abTripPlan(H.G); clr(); H.picks=picks.slice(); const q=OUT.get(H.G,'y3_an_tanabata'); if(q) await OUT.go(GM,q); return q; };
  const nb=()=>{ R2Y3B.anBackPhone(Object.assign(H.G,{day:D('2028-08-05'),hour:12})); return OUT.get(H.G,'y3_an_notebook'); };
  await tana([1,'我會跟她講清楚','跟她分手']);
  const i1=iOf('你不說，那我說。');
  check('481-1. 她知道、沒答應：「你不說，那我說。」「我喜歡你。」→ 緊接 KNOW.she「你們現在還在一起？」；沒有「我喜歡你。理由我寫在手帳裡，回臺灣再給你看。」「……你不准賴。」；手帳那一場不排',
    i1>=0&&T()[i1+1]==='我喜歡你。'&&T()[i1+2]==='你們現在還在一起？'&&!H.has('我喜歡你。理由我寫在手帳裡，回臺灣再給你看。')&&!H.has('……你不准賴。')&&!nb(),J(T().slice(i1,i1+4)));
  await tana([1,'我還是跟她在一起']); const q=nb();
  check('481-1. 她知道、答應（「我還是跟她在一起。」→「我不知道我為什麼會答應。」）＝交往＋OPEN_OK；照原本排手帳那一場（ev_an_notebook）',seq(['你不說，那我說。','我喜歡你。','你們現在還在一起？','我不知道我為什麼會答應。'])&&H.G.flags.dating_heroine_01===true&&okOpen(A1,KX)&&!!q&&q.ev==='ev_an_notebook',J(q));
  await tana([1],false);
  check('481-1. 她不知道（祐廷沒有別人）＝照原本三句「你不說，那我說。」「我喜歡你。理由我寫在手帳裡，回臺灣再給你看。」「……你不准賴。」',seq(['你不說，那我說。','我喜歡你。理由我寫在手帳裡，回臺灣再給你看。','……你不准賴。'])&&H.G.flags.dating_heroine_01===true);
  check('481-1. 兩句照稿（企劃線 AA_481 第 1 節）',inDoc('以安：你不說，那我說。','a481')&&inDoc('以安：我喜歡你。','a481'));
});

/* ================= AA_481 第 2 節：學姊大峽谷，她先說的那一條 ================= */
await sec('481-2',async()=>{
  const canyon=async(picks,kx)=>{ fresh('2028-10-07',7,'dorm',Object.assign({EXCHANGE_ROUTE:'TW',YT_HONEST:{heroine_05:true}},kx===false?{}:{dating_kexin:true})); H.CLOSE(SIS); if(kx!==false){ learn(SIS,KX); learn(KX,SIS); } setRom(SIS,80); const L=DATE.log(H.G,SIS); L.count=4; clr(); H.picks=picks.slice(); await EVENTS.run(ev('ev_sis_canyon')); };
  await canyon([1,'她知道','她說可以']); const i=iOf('那我先說。');
  check('481-2. 她知道、她先說：「那我先說。」「我喜歡你。……我想了很久，要不要在這裡說。」→ 緊接「可昕知道嗎？」；沒有「你要說好，還是要我再說一次。」（第一次＝讓我想想、不交往）',
    i>=0&&T()[i+1]==='我喜歡你。……我想了很久，要不要在這裡說。'&&T()[i+2]==='可昕知道嗎？'&&!H.has('你要說好，還是要我再說一次。')&&H.has('……好。我想一下。')&&!H.G.flags.dating_heroine_05&&H.G.flags.SIS_CANYON==='knows',J(T().slice(i,i+4)));
  check('481-2. 之後鳳凰城機場「十二月二十三號，晚上八點落地。你來接我。」照舊（沒交往也接得上）',H.has('十二月二十三號，晚上八點落地。你來接我。'));
  await canyon([1],false);
  check('481-2. 她不知道＝照原本三句、交往（SIS_CANYON confess）',seq(['那我先說。','我喜歡你。……我想了很久，要不要在這裡說。','你要說好，還是要我再說一次。'])&&H.G.flags.SIS_CANYON==='confess'&&H.G.flags.dating_heroine_05===true);
  check('481-2. 稿（企劃線 AA_481 第 2 節）',inDoc('學姊：那我先說。','a481')&&inDoc('學姊：我喜歡你。……我想了很久，要不要在這裡說。','a481'));
});

/* ================= AA_481 第 3 節：芷若 8/26（騎樓下）================= */
await sec('481-3',async()=>{
  const last=async(picks,pre,kx)=>{ fresh('2028-08-26',19.5,'dorm',kx===false?{}:{dating_kexin:true}); H.CLOSE(ZR); setRom(ZR,60); if(kx!==false) learn(ZR,KX,'test',{day:D('2028-08-25'),h:12}); if(pre) pre(); clr(); H.picks=picks.slice(); await EVENTS.run(ev('ev_zhiruo_last_screening')); };
  const q12=()=>{ const Z=X().rec(H.G).zr; Z.q1={term:'Y3S1',day:D('2028-01-10'),y:KX}; Z.q2={day:D('2028-03-01'),y:KX,ok:true}; };
  await last(['是。'],q12); const iw=iOf('我等妳回來。'), iy=iOf('一年。……你說的喔。');
  check('481-3-1. 知情對話答應（第三問「是。」）：跳 w 以前祐廷自動說「我等妳回來。」（祐廷說的、不是選項），接「（她轉過來，把口袋裡那一張票根拿出來…）」「一年。……你說的喔。」',
    iw>=0&&iy>iw&&H.said[iw].who!==SOCIAL.displayName(ZR)&&H.said[iw].who!=null&&!H.opts.some(o=>o.includes('「我等妳回來。」'))&&H.G.flags.ZR_LAST==='wait'&&H.G.flags.dating_heroine_02===true,J({said:H.said.slice(iw-1,iy+1),opts:H.opts}));
  await last(['我想跟妳們兩個都在一起']);
  check('481-3-2. 騎樓下：「我想跟妳們兩個都在一起。」＝「（她轉過來看你。）」「……我要想很久。」（不是回家路上的「（她停下腳步。）」）；沒答應＝原本的 k「好。……那就先收著。」',
    seq(['那你打算怎麼辦？','（她轉過來看你。）','……我要想很久。','好。……那就先收著。'])&&!H.has('（她停下腳步。）')&&!H.has('我等妳回來。'),J(T()));
  await last(['我不知道']);
  check('481-3-2. 騎樓下：「我不知道。」＝「（她點了一下頭，又看回騎樓外面。）」（不是「（她點了一下頭，繼續走。）」）',H.has('（她點了一下頭，又看回騎樓外面。）')&&!H.has('（她點了一下頭，繼續走。）'),J(T()));
  await last(['我會跟她講']);
  check('481-3-2. 「（她低頭看了一下手機，又放回口袋。）」站著也成立，不換',H.has('（她低頭看了一下手機，又放回口袋。）'));
  { fresh('2027-01-02',12,'campus',{dating_kexin:true,ZR_ASKED_GF:1}); H.CLOSE(ZR); learn(ZR,KX); setRom(ZR,60); H.G.flags.YT_HONEST={heroine_02:true}; const L=DATE.log(H.G,ZR); L.count=6; L.wish=true; H.G.events.done.ev_zhiruo_film_night=1;
    setT('2027-01-10',21); clr(); H.picks=['先不說','兩個都在一起']; await TERMEND.walkHome(GM,ZR,'Y2S1');
    check('481-3-2. 學期末回家路上的知情版心意邀約照原本「（她停下腳步。）」（只有 8/26 那一場換）',H.has('（她停下腳步。）')&&!H.has('（她轉過來看你。）'),J(T())); }
  await last([0],null,false);
  check('481-3. 她不知道（祐廷單身）＝照原本兩個選項、沒有自動的「我等妳回來。」',J(H.opts[0])===J(['「我等妳回來。」','「我先收著。」'])&&!H.has('我等妳回來。')&&H.G.flags.ZR_LAST==='wait');
  check('481-3. 稿（企劃線 AA_481 第 3 節的表）',['（她轉過來看你。）','（她點了一下頭，又看回騎樓外面。）','祐廷：我等妳回來。'].every(t=>inDoc(t,'a481'))&&J(Lm().KNOW_AT.zr_last)===J({'（她停下腳步。）':'（她轉過來看你。）','（她點了一下頭，繼續走。）':'（她點了一下頭，又看回騎樓外面。）'}));
});

/* ================= AA_481 第 4 節：七月最後一次（2029-07-14）================= */
await sec('481-4',async()=>{
  const july=async(id,picks,o)=>{ fresh('2029-07-14',18.3,'dorm',Object.assign({},GD,{dating_kexin:true},(o&&o.fl)||{})); H.CLOSE(id); learn(id,KX); if(id===SIS) learn(KX,SIS); setRom(id,(o&&o.rom)||80); const L=DATE.log(H.G,id); L.count=4; L.wish=true; TERMEND.rec(H.G).think[id]='Y4S2';
    if(o&&o.pre) o.pre(); OUT.plan(H.G,{id:'y4_july',ev:'ev_heart_july',day:D('2029-07-14'),h:18.5,place:'x',title:'t',travelH:0.25,july:{id}}); setT('2029-07-14',18.3); return goOut('y4_july',picks); };
  await july(A1,[3,'我不知道'],{fl:{BAR_REG:true}});
  check('481-4-1. 以安、她知道、知情對話沒答應（「我不知道。」）、國考有報名：朋友那一句拿掉開頭的「好。」＝「……八月四號，你考試加油。」；HEART_LAST、HEART_FRIEND',
    seq(['你回答。','你們現在還在一起？','那你想清楚再回答我。','……八月四號，你考試加油。'])&&!H.has('好。……八月四號，你考試加油。')&&H.G.flags.HEART_LAST_heroine_01===true&&H.G.flags.HEART_FRIEND_heroine_01===true&&!H.G.flags.dating_heroine_01,J(T()));
  await july(SIS,[0,'她知道','她說可以'],{rom:80,fl:{YT_HONEST:{heroine_05:true}}});
  check('481-4-1. 學姊、她知道、中間沒有見面（「我還沒準備好。」）、沒報國考：「有什麼事，再告訴我。」（沒有「好。」）',seq(['我還沒準備好。','有什麼事，再告訴我。'])&&!H.has('好。有什麼事，再告訴我。')&&H.G.flags.HEART_LAST_heroine_05===true,J(T()));
  await july(A1,[3,'我會跟她講清楚','跟她分手'],{fl:{BAR_REG:true}});
  check('481-4-2. 以安、說要分手（promise）：演完「好。那你分完，再來找我。」就結束，不接朋友那一句；HEART_LAST、HEART_FRIEND 照記；YT_PROMISED exclusive',
    T()[T().length-1]==='好。那你分完，再來找我。'&&!H.said.some(s=>/八月四號/.test(s.t))&&H.G.flags.HEART_LAST_heroine_01===true&&H.G.flags.HEART_FRIEND_heroine_01===true&&H.G.flags.YT_PROMISED[A1]==='exclusive',J(T().slice(-3)));
  await july(ZQ,[0,'我會跟她分'],{fl:{YT_HONEST:{heroine_04:true}}});
  check('481-4-2. 子晴、說要分（promise）：「那你去分。」就結束，沒有「那下次宵夜我請，朋友那種。」',T()[T().length-1]==='那你去分。'&&!H.said.some(s=>/宵夜我請/.test(s.t))&&H.G.flags.HEART_LAST_heroine_04===true,J(T().slice(-3)));
  await july(SIS,[3,'我會跟她說','說我們分手'],{rom:80,fl:{YT_HONEST:{heroine_05:true}}}); const i=iOf('六月那天說的，我不想再往後排了。');
  check('481-4-3. 學姊她先說（先不說）、她知道：只說「六月那天說的，我不想再往後排了。」就接「可昕知道嗎？」（沒有「你說吧。我聽。」）；說要分手＝不接朋友那一句',
    i>=0&&T()[i+1]==='可昕知道嗎？'&&!H.has('你說吧。我聽。')&&T()[T().length-1]==='那等你說完。',J(T().slice(i)));
  await july(A1,[3,'我們還是朋友'],{fl:{dating_kexin:false,BAR_REG:true}});
  check('481-4. 她不知道（祐廷單身）、選「我們還是朋友。」＝照原句「好。……八月四號，你考試加油。」',H.has('好。……八月四號，你考試加油。')&&H.has('你回答。'),J(T()));
  { const S=RB().JULY, row={heroine_01:['……八月四號，你考試加油。','……九月見。'],heroine_03:['考完來吃麵，算我的。','下次來吃麵，算我的。'],heroine_05:['考完告訴我結果。','有什麼事，再告訴我。'],heroine_04:['那你考完我請宵夜，朋友那種。','那下次宵夜我請，朋友那種。'],classmate_peishan:['……那我以後還可以問你別的問題嗎？',null]};
    check('481-4-1. 五位拿掉「好。」的那一句照 AA_481 4-1 的表（逐字、在稿裡）',Object.keys(row).every(id=>S[id].friendK===row[id][0]&&(row[id][1]==null||S[id].friendNoK===row[id][1])&&row[id].filter(Boolean).every(t=>inDoc(t,'a481')))&&J(S.heroine_05.lastK)===J(['六月那天說的，我不想再往後排了。'])); }
});

/* ================= AA_481 第 5 節＋AA_483 第 1 節第 1、2 點、第 2-1、2-2 節：可昕收回 ================= */
await sec('481-5',async()=>{
  const kxAccept=async(key,fl)=>{ fresh('2026-09-10',12,'dorm',Object.assign({dating_kexin:true,KX_MET_NOODLE_TEAM:true,KX_OUR_DAY:{day:'sat',mode:'mid'}},fl||{})); H.CLOSE(PS); ROM.start(H.G,PS); setT(key,19); learn(KX,PS,'slip:zhe@x'); H.G.hour=21.6; H.picks=['是我的錯']; await play(due());
    Object.assign(st(KX),{done:{self:1,back:1,n4:H.G.day-3,hug:H.G.day-2},b1:H.G.day-1}); setRom(KX,90); clr(); await X().meetAction(H.G,KX,'out').run(GM); return okOpen(KX,PS); };
  const kwId=key=>'mrel_kexin_withdraw_'+D(key);
  const kt=()=>msgs('p:kexin').map(m=>m.text);
  /* ① 又說謊 → 排出遊那一刻她傳兩則（明天）*/
  let acc=await kxAccept('2026-10-05'); setT('2026-10-07',12); const n0=kt().length; ROM.ytAnswer(H.G,KX,'claimNone'); X().phone(H.G,GM); PHONE.tick(H.G);
  const m1=msgs('p:kexin').slice(n0), q1=OUT.get(H.G,kwId('2026-10-08'));
  check('481-5. 當面（公館捷運出口 20:00）：排出遊（隔天）那一刻她傳兩則「明天晚上八點，公館捷運出口。」「我有事要講。不會很久。」（不用回：沒有 ask）',
    acc&&!!q1&&q1.day===D('2026-10-08')&&J(m1.map(m=>m.text))===J(['明天晚上八點，公館捷運出口。','我有事要講。不會很久。'])&&m1.every(m=>!m.ask&&m.from===KX),J(m1));
  setT('2026-10-08',20); clr(); await runOut(kwId('2026-10-08'));
  check('481-5／483 2-1. ①（又說謊）：「你又騙我一次。」「我那時候開的條件，你還記得嗎？」「她的事你自己講。我問你，你不准騙我。」（她沒有等你回答。）「我答應的時候是想清楚的。」「……我不行了。」→ ≥ 70 回 B',
    seq(['你又騙我一次。','我那時候開的條件，你還記得嗎？','她的事你自己講。我問你，你不准騙我。','（她沒有等你回答。）','我答應的時候是想清楚的。','……我不行了。','我們的日子先停。'])&&!H.has('我答應的時候是想清楚才答應的。')&&!H.has('現在也想清楚了。我不行了。')&&!H.has('（視訊接通。她那邊只開了一盞燈，沒有先打招呼。）'),J(T()));
  setT('2026-10-09',15); clr(); { const a=X().meetAction(H.G,KX,'out'); if(a) await a.run(GM); }
  check('483 1-2. 回 B 以後隔天起第一次見面：「（你還沒開口，她先搖了一下頭。）」「我說過了。」',J(T())===J(['（你還沒開口，她先搖了一下頭。）','我說過了。']),J(T()));
  /* 今天：她約的那一天就是今天 */
  await kxAccept('2026-10-05'); setT('2026-10-07',23); X().kwQueue(H.G,1,PS); setT('2026-10-08',12); const n1=kt().length; X().kwPlan(H.G); PHONE.tick(H.G); const m2=kt().slice(n1), q2=OUT.get(H.G,kwId('2026-10-08'));
  check('481-5. 排到的那一天就是今天＝「今天晚上八點，公館捷運出口。」（照排到的那一天換）',!!q2&&q2.h===20&&J(m2)===J(['今天晚上八點，公館捷運出口。','我有事要講。不會很久。']),J(m2));
  /* ② 從別人那裡先知道第三個人 */
  await kxAccept('2026-10-05'); setRom(KX,75); setT('2026-10-07',12); H.CLOSE(ZQ); ROM.start(H.G,ZQ); learn(KX,ZQ,'told_by:zhe',{day:H.G.day,h:12}); X().scan(H.G); X().phone(H.G,GM); setT('2026-10-08',20); clr(); await runOut(kwId('2026-10-08'));
  check('483 2-1. ②：第一句「我是聽別人講的。」、其他和 ① 一樣（沒有「你又騙我一次。」）',seq(['我是聽別人講的。','我那時候開的條件，你還記得嗎？','她的事你自己講。我問你，你不准騙我。','（她沒有等你回答。）','我答應的時候是想清楚的。','……我不行了。'])&&!H.has('你又騙我一次。'),J(T()));
  /* 視訊：她寒暑假在高雄 */
  await kxAccept('2026-10-05'); setRom(KX,65); setT('2026-12-30',12); X().phone(H.G,GM); const p4=X().rec(H.G).kwp; const nV=kt().length;
  setT('2026-12-31',18); X().phone(H.G,GM); PHONE.tick(H.G); const before=kt().slice(nV);
  setT('2026-12-31',19.5); X().phone(H.G,GM); X().phone(H.G,GM); PHONE.tick(H.G); const mv=msgs('p:kexin').slice(nV);
  setT('2026-12-31',21.5); const f4=due(); clr(); if(f4) await play(f4);
  check('481-5. 視訊（她寒暑假在高雄）：當天 19:00 她傳一則「今天晚上視訊。我有事要講。」（18:00 還沒有；一次）；沒有當面那兩則',!!p4&&!before.length&&mv.length===1&&mv[0].text==='今天晚上視訊。我有事要講。'&&mv[0].h===19&&!kt().some(t=>/公館捷運出口/.test(t)),J(mv));
  check('483 2-2／1-1. 接通以後先一句旁白「（視訊接通。她那邊只開了一盞燈，沒有先打招呼。）」再接 ③；D 的視訊版最後一句「……我先掛了。」（不說「……你不用送我。」）',
    !!f4&&T()[0]==='（視訊接通。她那邊只開了一盞燈，沒有先打招呼。）'&&seq(['（視訊接通。她那邊只開了一盞燈，沒有先打招呼。）','你沒做錯什麼。你都有講。','我們分開吧。','……我先掛了。'])&&!H.has('……你不用送我。')&&!H.G.flags.dating_kexin,J(T()));
  await kxAccept('2026-10-05'); setT('2026-12-30',12); ROM.ytAnswer(H.G,KX,'claimNone'); X().phone(H.G,GM); setT('2026-12-31',21.5); const f5=due(); clr(); if(f5) await play(f5);
  check('481-5. 視訊、①、戀愛 ≥ 70：旁白 →「你又騙我一次。」…→「我們的日子先停。」（回 B 不是結尾，沒有「……我先掛了。」）',!!f5&&seq(['（視訊接通。她那邊只開了一盞燈，沒有先打招呼。）','你又騙我一次。','我們的日子先停。'])&&!H.has('……我先掛了。'),J(T()));
  check('481-5／483. 訊息、旁白都在稿裡（AA_481 第 5 節、AA_483 第 1 節第 1、2 點、第 2-1、2-2 節）',['明天晚上八點，公館捷運出口。','我有事要講。不會很久。','今天晚上視訊。我有事要講。','（視訊接通。她那邊只開了一盞燈，沒有先打招呼。）','……我先掛了。','（你還沒開口，她先搖了一下頭。）','你又騙我一次。','我是聽別人講的。','我答應的時候是想清楚的。'].every(t=>inDoc(t,'a481','a483'))&&/今天／明天／後天晚上八點，公館捷運出口。/.test(DOC.a481||''));
});

/* ================= AA_483 第 1 節第 6 點：Q15，回了貼紙之後她才知道 ================= */
await sec('483-6',async()=>{
  const zqSet=knows=>{ fresh('2028-06-08',20.6,'dorm',{ZQ_DAD_HEARD:true,ATTENDED_SHOW:true,dating_kexin:true,YT_HONEST:{heroine_04:true},ZQ_ASK_KAI_D:knows?null:0}); H.CLOSE(ZQ); setRom(ZQ,40); H.G.contacts[ZQ]=1; const L=DATE.log(H.G,ZQ); L.count=4; L.wish=true;
    for(const t of ['CLAPPED','PLAYTESTED','TOLD_HER_CHANGE']) SOCIAL.remember(ZQ,t,''); if(knows) learn(ZQ,KX,'test',{day:D('2028-06-01'),h:12}); };
  const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
  const qt='te_Y3S2_heroine_04', zt=()=>msgs('p:heroine_04').map(m=>m.text), KM=['我才知道'+X().nameFor(H.G,ZQ,KX)+'的事','電話先不打了 我要想一下'];
  const q15=async()=>{ zqSet(false); rules(); PHONE.answer(H.G,qt,0); rules(); const q=OUT.get(H.G,'te_Y3S2'); if(q) setD(q.day,q.h-0.1); await goOut('te_Y3S2',[0]); return H.G.flags.ZQ_Q15; };
  let Q=await q15(); setD(Q.day+1,12.1); rules(); const sent=PHONE.sent(H.G,'y3_zq_exe');
  learn(ZQ,KX,'test',{day:H.G.day,h:12.5}); setD(Q.day+1,13); const ans=PHONE.answer(H.G,'y3_zq_exe',0); rules(); const z=zt();
  const call=(H.G.outings||[]).find(q=>q.id==='y3_zq_exe_call'&&q.state==='planned');
  check('483 1-6. 回答.exe 傳了、玩家回了貼紙，之後她才知道（交往以前）：不交往、不打來；原本她打來的時間改傳兩則「我才知道可昕的事」「電話先不打了 我要想一下」（不加句號）',
    sent&&ans!=null&&H.G.flags.ZQ_EXE_REPLY===true&&Q.res==='knows'&&!H.G.flags.dating_heroine_04&&!call&&J(z.slice(-2))===J(KM),J([z.slice(-3),Q,!!call]));
  rules(); rules(); check('483 1-6. 兩則只傳一次',zt().filter(t=>t===KM[1]).length===1);
  Q=await q15(); learn(ZQ,KX,'test',{day:Q.day,h:23}); setD(Q.day+1,12.1); rules();
  check('483 1-6. 回答.exe 還沒傳就知道的：不傳檔案、也不補那兩則（玩家不知道有這個檔案）',!PHONE.sent(H.G,'y3_zq_exe')&&Q.res==='knows'&&!zt().includes(KM[1]),J(zt()));
  Q=await q15(); setD(Q.day+1,12.1); rules(); setD(Q.day+1,13); PHONE.answer(H.G,'y3_zq_exe',0); rules();
  check('483 1-6. 她不知道（照原本）：回貼紙＝交往、她打來；沒有那兩則',H.G.flags.dating_heroine_04===true&&Q.res==='sticker'&&!zt().includes(KM[1]));
  check('483 1-6. 兩則照稿',inDoc('子晴：我才知道{她}的事','a483')&&inDoc('子晴：電話先不打了 我要想一下','a483'));
});

/* ================= AA_483 第 1 節第 7 點：告白選項，她知道的時候（七位一樣）================= */
await sec('483-7',async()=>{
  const w=(id,fl,rom)=>{ fresh('2028-03-10',15,'campus',Object.assign({dating_kexin:true},fl||{})); H.CLOSE(id); learn(id,KX); setRom(id,rom); return DATE.willing(H.G,id); };
  const a=w(A1,{YT_HONEST:{heroine_01:true}},80), b=w(A1,{YT_HONEST:{heroine_01:true}},50), c=w(ZQ,{YT_HONEST:{heroine_04:true}},40), d=w(ZQ,{YT_HONEST:{heroine_04:true},YT_DODGED:{heroine_04:true}},90),
    e=w(YT,{YT_HONEST:{heroine_03:true}},73), f=w(SIS,{},90);
  check('483 1-7. DATE.willing：她知道祐廷有別人、她的知情條件（TERMEND.KNOWS_OK）過了＝照樣可以（以安照實＋80、子晴照實沒閃避、語彤照實＋73）；沒過＝照舊 why knows（以安 50、子晴閃避過、學姊沒照實說）',
    a.ok&&c.ok&&e.ok&&b.why==='knows'&&d.why==='knows'&&f.why==='knows',J([a,b,c,d,e,f]));
  fresh('2028-03-10',15,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX); setRom(A1,30); setOpen(A1,KX);
  check('483 1-7. 她已經接受（OPEN_OK）的那一位不算「她知道」',DATE.willing(H.G,A1).ok);
  /* 學姊分開以後重新開始的告白：選項出得來，進去走知情對話（第一次＝讓我想想）*/
  fresh('2027-03-20',17,'dorm',{dating_kexin:true,YT_HONEST:{heroine_05:true}}); H.CLOSE(SIS); learn(SIS,KX); learn(KX,SIS); setRom(SIS,80);
  const cw=DATE.willing(H.G,SIS); clr(); H.picks=[0,'她知道','她說可以']; const r=await DATE.confess(GM,SIS,{ok:true},{who:SIS,locs:['D07'],day:H.G.day,trip:'T9'});
  check('483 1-7. 學姊（照實＋75 以上）：告白的選項照樣出（willing ok）；進去接 KNOW.heroine_05，第一次＝「……好。我想一下。」（讓我想想、不交往）',cw.ok&&H.has('可昕知道嗎？')&&H.has('……好。我想一下。')&&r==='notYet'&&!H.G.flags.dating_heroine_05,J([cw,r,T()]));
});

/* ================= AA_482 第 4 節＋AA_483 第 2-3 節：S.TELL 收尾那一句 ================= */
await sec('482-4',async()=>{
  const S=RB().TELL, last=id=>S[id].lines[S[id].lines.length-1];
  const want={heroine_01:'我要想一下。這個禮拜先不要約。',heroine_03:'……我要想。你先回去。',heroine_04:'我要想一下啦。想完我會找你。',heroine_05:'我需要時間。口試完再說。'};
  check('482-4. 以安、語彤、子晴、學姊的最後一句照 AA_482 第 4 節的表（2030 同左；學姊 2030＝「我需要時間。……我會再找你。」）',Object.keys(want).every(id=>last(id)===want[id]&&inDoc(want[id],'a482'))&&S.heroine_05.last30==='我需要時間。……我會再找你。'&&inDoc('我需要時間。……我會再找你。','a482'),J(Object.keys(want).map(last)));
  check('483 2-3. 沛珊：第二句「……所以你現在是兩邊都要？」、第三句「我可以想一下嗎？想完我打給你。」（BB-C 審稿後，取代 AA_482 的「……所以你現在是兩邊都要。」「我會想一下。想完再打給你。」）',
    S.classmate_peishan.lines[1]==='……所以你現在是兩邊都要？'&&S.classmate_peishan.lines[2]==='我可以想一下嗎？想完我打給你。'&&inDoc('……所以你現在是兩邊都要？','a483')&&inDoc('我可以想一下嗎？想完我打給你。','a483'));
  check('482-4. 可昕第三句「……我要想。」（第四句「今天你先走。」照舊）；芷若不改（「我先掛了。……我會寫一張明信片給你。寫完才寄。」、2030「……今天先這樣。我收店了。」）',
    S.kexin.lines[2]==='……我要想。'&&S.kexin.lines[3]==='今天你先走。'&&last(ZR)==='我先掛了。……我會寫一張明信片給你。寫完才寄。'&&S.heroine_02.last30==='……今天先這樣。我收店了。');
  check('482-4. 七位都沒有「先當朋友」「先回到朋友」「先不要了」「還是朋友」（當場不決定）',Object.values(S).every(c=>c.lines.concat([c.last30||'']).every(x=>typeof x!=='string'||!/先當朋友|回到朋友|先不要了|還是朋友|不是這樣/.test(x))));
});

/* ================= AA_482 第 2 節：坦白照她們自己的條件 ================= */
await sec('482-2',async()=>{
  /* 以安和子晴都是伴侶；以安知道子晴、也接受了（OPEN_OK）；子晴不知道以安 */
  fresh('2029-05-21',22,'dorm',{}); H.CLOSE(A1); H.CLOSE(ZQ); setT('2029-01-10',12); ROM.start(H.G,A1); setT('2029-02-10',12); ROM.start(H.G,ZQ); learn(A1,ZQ); setOpen(A1,ZQ); setT('2029-05-21',22);
  const pre=RB().multiPreDue(H.G); clr(); H.picks=[0]; await H.run('r2y4b_multi_pre'); const L=H.G.flags.MULTI_TELL29;
  check('482-2. 5/21「先跟她們說清楚。」：說的對象只排還沒和每一位別的伴侶都 OPEN_OK 的（子晴）；以安已經都同意＝不用再說一次',pre&&H.G.flags.MULTI_PRE==='tell'&&!!L&&J(L.list)===J([ZQ]),J(L));
  H.at('2029-05-22',21); const d0=H.G.day; clr(); await H.run('r2y4b_tell29_0'); const s=st(ZQ)||{}, R=X().rec(H.G);
  check('482-2. 子晴那一場：開頭照舊、最後一句「我要想一下啦。想完我會找你。」；演完還在交往（不退回朋友、不是 friend_after_catch）',
    seq(['……你是來跟我說，你還有別人。','……我還以為你要問社課的事。','我要想一下啦。想完我會找你。'])&&H.G.flags.dating_heroine_04===true&&ROM.get(H.G,ZQ).status==='dating'&&!H.has('我不要這樣。我們先當朋友。'),J(T()));
  check('482-2. 記成「祐廷先坦白」：ROM.tellBy（她知道以安、來源 yt_told）、YT_CONFESSED[子晴][以安]＝那一天、MREL.disc ver confess、冷靜期開始（cool、confessed）＋onDisc（她一週後的訊息 msgAt）；不演 DISC 的坦白句',
    ROM.knowsOf(H.G,ZQ,A1)&&(H.G.flags.knowsRel[ZQ][A1]||{}).source==='yt_told'&&H.G.flags.YT_CONFESSED[ZQ][A1]===d0&&(R.disc[ZQ]||{})[A1].ver==='confess'&&s.y===A1&&s.phase==='cool'&&s.confessed===true&&s.ver==='confess'&&s.msgAt===(d0+7)*24+21.5&&!H.has(((Lm().DISC[ZQ]||{}).confess||[])[0]),J(s));
  X().scan(H.G); check('482-2. 之後不會再被當成「被發現」演一次（沒有 pend）',!R.pend[ZQ]);
  check('482-2. 第二位不在名單裡＝沒有第二場',!H.G.flags.MULTI_TELL29.list[1]);
  X().agree(H.G,ZQ,A1);
  check('482-2. 之後她接受（結果 B／C：MREL.agree）＝OPEN_OK；兩位都同意了',okOpen(ZQ,A1)&&RB().allAgree(H.G));
  /* 三位伴侶：一場說兩位＝冷靜期記第一位、st.ys 記兩位；接受的時候兩位都 OPEN_OK */
  fresh('2029-05-21',22,'dorm',{}); for(const id of [A1,YT,ZQ]){ H.CLOSE(id); ROM.start(H.G,id); }
  const list=RB().tellList(H.G); RB().tellRec(H.G,A1,list); const s3=st(A1);
  check('482-2. 三位伴侶、都還不知道：名單三位都排；以安那一場記兩位（YT_CONFESSED 兩筆、冷靜期 st.ys）',J(list)===J([A1,YT,ZQ])&&!!H.G.flags.YT_CONFESSED[A1][YT]&&!!H.G.flags.YT_CONFESSED[A1][ZQ]&&s3.y===YT&&J(s3.ys)===J([YT,ZQ]),J(s3));
  X().agree(H.G,A1,YT); check('482-2. 以安接受＝兩位都 OPEN_OK（她接受的是那一場說的每一位）',okOpen(A1,YT)&&okOpen(A1,ZQ));
  /* 2030-05-25「跟她們說實話。」：學姊 2030 的收尾 */
  fresh('2030-05-25',22,'dorm',GD); H.CLOSE(A1); H.CLOSE(SIS); ROM.start(H.G,A1); ROM.start(H.G,SIS); clr(); H.picks=[1]; await H.run('r2y4b_multi_y5'); const L30=H.G.flags.MULTI_TELL30;
  H.at('2030-05-27',21); clr(); await H.run('r2y4b_tell30_1');
  check('482-2／4. 2030「跟她們說實話。」＝名單兩位；學姊那一場「……你特地在樓下等我，就是要講這個。」「我需要時間。……我會再找你。」；還在交往、冷靜期開始',
    !!L30&&J(L30.list)===J([A1,SIS])&&J(T())===J(['……你特地在樓下等我，就是要講這個。','我需要時間。……我會再找你。'])&&H.G.flags.dating_heroine_05===true&&(st(SIS)||{}).confessed===true,J([L30,T()]));
});

/* ================= AA_482 第 3 節：都同意的玩家、對話框、尾聲 ================= */
await sec('482-3',async()=>{
  const y5=(ids,open)=>{ fresh('2030-05-25',22,'dorm',GD); for(const id of ids){ H.CLOSE(id); ROM.start(H.G,id); } for(const [x,y] of open) setOpen(x,y); return RB().multiY5Due(H.G); };
  const allA=y5([A1,ZQ],[[A1,ZQ],[ZQ,A1]]), oneA=y5([A1,ZQ],[[A1,ZQ]]);
  check('482-3. 2030-05-25：兩位都同意＝沒有這一場（multiY5Due false、不記 MULTI_Y5／EPI_SEAT_EMPTY）；還沒都同意（子晴還沒接受）＝照演',!allA&&oneA&&H.G.flags.MULTI_Y5==null);
  y5([A1,YT,ZQ],[]); clr(); H.picks=[2]; await H.run('r2y4b_multi_y5');
  check('482-3. 對話框照伴侶人數換：三位＝「（畢業快一年了。手機裡，三個對話框都停在「晚安」。）」',H.has('（畢業快一年了。手機裡，三個對話框都停在「晚安」。）')&&inDoc('（畢業快一年了。手機裡，三個對話框都停在「晚安」。）','a482'),J(T()));
  y5([A1,ZQ],[]); clr(); H.picks=[2]; await H.run('r2y4b_multi_y5');
  check('482-3. 兩位＝「兩個對話框」（照舊）',H.has('（畢業快一年了。手機裡，兩個對話框都停在「晚安」。）'));
  /* 尾聲 */
  const epi=async(setup,flags)=>{ const G=fresh('2034-06-03',18,'dorm',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1},GD,flags||{})); G.acts={att:{}}; G.outings=[]; H.at('2034-06-03',18); G.zone='dorm';
    PG.rec(G).done.grad=1; G.flags.FIRST_DAY_SEEN=true; PG.rec(G).done.first=1; setup(G); clr(); H.cards=[]; GM.running=true; await H.run('epi'); return G; };
  const both='（你左右兩邊都有人。她們隔著你說話，像認識很久了。）', EP=POSTGRAD_LINES.EPI_PARTNER, EI=POSTGRAD_LINES.EPI.items;
  let G=await epi(G=>{ H.FRIEND(A1); H.FRIEND(ZQ); setT('2027-03-01',12); ROM.start(G,ZQ); setT('2028-03-01',12); ROM.start(G,A1); setOpen(A1,ZQ); setOpen(ZQ,A1); });
  const iZ=iOf(EP.heroine_04), iA=iOf(EP.heroine_01), seats=RB().epiSeats(G);
  check('482-3. 尾聲都同意（子晴比較早開始）：右手邊＝子晴（在一起最久）、左手邊＝以安；CG-10 只放共通圖；CG-10 之後「（你左右兩邊都有人。她們隔著你說話，像認識很久了。）」；沒有空座位那一句',
    !!seats&&seats.right===ZQ&&seats.left===A1&&PG.epiPartner(G)===ZQ&&H.cgs.includes('cg_reunion_window_table')&&!H.cgs.some(c=>/_heroine|_kai/.test(c))&&H.has(both)&&!H.has(RB().SEAT_EMPTY)&&inDoc(both,'a482'),J([seats,H.cgs]));
  check('482-3. 桌上每一位伴侶的那一樣都放（右、左的順序：插座貓貼紙、讀書會那張紙）＋每一位一句 EPI_PARTNER（子晴在以安前面）；她們各自說伴侶版那一句',
    J(G.flags.EPI_ITEMS.slice(1))===J([EI.heroine_04,EI.heroine_01])&&iZ>=0&&iA>iZ&&H.has(POSTGRAD_LINES.EPI.an.partner[0]),J([G.flags.EPI_ITEMS,iZ,iA]));
  G=await epi(G=>{ H.FRIEND(A1); H.FRIEND(ZQ); ROM.start(G,ZQ); ROM.start(G,A1); setOpen(A1,ZQ); setOpen(ZQ,A1); });
  check('482-3. 同一天開始＝照 PG.PARTNER_ORDER（以安在子晴前面）',RB().epiSeats(G).right===A1&&RB().epiSeats(G).left===ZQ);
  G=await epi(G=>{ H.FRIEND(A1); H.FRIEND(ZQ); H.FRIEND(YT); setT('2027-03-01',12); ROM.start(G,YT); setT('2027-09-01',12); ROM.start(G,ZQ); setT('2028-03-01',12); ROM.start(G,A1); for(const x of [A1,YT,ZQ]) for(const y of [A1,YT,ZQ]) if(x!==y) setOpen(x,y); });
  check('482-3. 三位都同意：右＝語彤、左＝子晴、第三位（以安）坐在對面；桌上三樣照右、左、對面',J(RB().epiSeats(G))===J({right:YT,left:ZQ,across:[A1]})&&J(G.flags.EPI_ITEMS.slice(1))===J([EI.heroine_03,EI.heroine_04,EI.heroine_01]),J([RB().epiSeats(G),G.flags.EPI_ITEMS]));
  G=await epi(G=>{ H.FRIEND(A1); H.FRIEND(ZQ); ROM.start(G,A1); ROM.start(G,ZQ); setOpen(A1,ZQ); });
  check('482-3. 還沒都同意（不選以前的舊做法照舊）：照固定順序一位在旁邊（以安的圖層）、沒有那一句、桌上一樣',!RB().epiSeats(G)&&H.cgs.includes('cg_reunion_window_table_heroine01')&&!H.has(both)&&G.flags.EPI_ITEMS.length===2);
  G=await epi(G=>{ H.FRIEND(A1); ROM.start(G,A1); });
  check('482-3. 只有一位伴侶＝照現在',PG.epiPartner(G)===A1&&H.cgs.includes('cg_reunion_window_table_heroine01')&&!H.has(both));
});

/* ================= 子晴＋芷若都是伴侶：照樣兩人都離開（AA_474 第 2 節、AA_482 第 2 節）================= */
await sec('482-zz',async()=>{
  fresh('2029-05-21',22,'dorm',{}); H.CLOSE(ZR); H.CLOSE(ZQ); ROM.start(H.G,ZR); ROM.start(H.G,ZQ); clr(); H.picks=[0]; await H.run('r2y4b_multi_pre'); const L=H.G.flags.MULTI_TELL29;
  H.at('2029-05-22',21); await H.run('r2y4b_tell29_0'); const zr=!H.G.flags.dating_heroine_02; H.at('2029-05-23',21); await H.run('r2y4b_tell29_1');
  check('482-2. 子晴＋芷若都是伴侶、「先跟她們說清楚。」：兩場都演、演完兩人都離開（照原本的退回朋友）',J(L.list)===J([ZR,ZQ])&&zr&&!H.G.flags.dating_heroine_04&&ROM.get(H.G,ZQ).status==='friend_after_catch'&&ROM.get(H.G,ZR).status==='friend_after_catch',J(L));
});

/* ================= 舊存檔 ================= */
await sec('old',async()=>{
  fresh('2029-05-21',22,'dorm',{MULTI_PRE:'tell',MULTI_TELL29:{list:[A1,ZQ],from:D('2029-05-22')}}); H.CLOSE(A1); H.CLOSE(ZQ); ROM.start(H.G,A1); ROM.start(H.G,ZQ); RB().toFriend(H.G,A1);
  check('old. 已經演過「先跟她們說清楚」、已經退回朋友的：照舊（不倒回去；5/21 那一場不再出）',!RB().multiPreDue(H.G)&&ROM.get(H.G,A1).status==='friend_after_catch'&&!H.G.flags.dating_heroine_01);
  const G=fresh('2034-06-03',18,'dorm',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1,EPI_SEAT_EMPTY:true},GD)); ROM.start(G,A1); ROM.start(G,ZQ); setOpen(A1,ZQ); setOpen(ZQ,A1);
  check('old. 已經記了 EPI_SEAT_EMPTY 的：照舊（旁邊空著、不算都同意的座位）',RB().epiSeats(G)===null&&PG.epiPartner(G)===null&&PG.epiCg(G)==='cg_reunion_window_table');
  fresh('2027-03-01',12,'campus',{dating_kexin:true}); H.G.flags.MREL={v:1,st:{}}; X().rec(H.G);
  check('old. 讀檔：MREL 不多新欄位（tellQuiet 用原本的 disc／st）',!Object.keys(H.G.flags.MREL).some(k=>['tell','ys','kwo','kwv'].includes(k)));
});

H.done();
})();

// AA_614 同學也在打工：約了會說「我要上班」＋AA_615 南洋戲院剩下的（企劃線 claude/cool-heisenberg-o8kuqx：AA_614 a0b8a3e40、AA_615 ba26f7f7d；
// 2026-11-11（X327 沛珊重寫，AA_761_peishan_events_1.json@dbfc596a5）：這支裡寫死的沛珊在 events.js 的句子照新稿改期望（逐字對稿在 tests/peishan_events_1111_unit.js）。
//   任務 AA614-CLASSMATE-JOBS-1103、AA615-ALISON-CINEMA-1103；src/aa614_3d.js）——不需要瀏覽器（D131）。
//   0 讀稿、模組、index.html 的順序、白名單、每一句都在稿裡（一字不差）、說的人照稿
//   1 沛珊作息：每週三 18:00～21:00 溫州街（大一上第 3 週起～2026-12-17）；週二、四 16～18 不在溫州街了（AA-B 11-07）
//   1 ev_peishan_tutoring：週三 20:45～21:15、標題「課輔班的晚上」、週次學期照舊；兩句照 AA-B 11-07 改（舊句子不在了）、其他句子不變
//   2 第 2 節邀約撞到上班：明軒、沛珊、阿凱、語彤（兩種說法）、Alison（AA_615）的句子與改約的時間；對照（不撞的時間、Café／總圖／燒臘店照 BB_172、交往中的語彤照 AA_627）
//   3 第 3 節五則：時間、群組、條件（不在群組、不認識＝沒有；第 1 列不在系上朋友群組＝阿哲私訊）；第 3 列「好。」＝19:30 南洋戲院（出遊）、那天 Alison 在櫃檯＝「三位？……」
//   4 第 4 節路上遇到：沛珊週三 18:20 溫州街（第一次那一句、之後旁白；一天一次）、阿凱週六 17:50 新生南路
//   5 第 5 節閒聊：阿凱（大一上第 4 週起，一次）、沛珊（閒聊階梯前面，一次）
//   6 AA_615：1 廳坐下來看（有票、今天還沒看＝時間過去、三句隨機一句；拿到爆米花＝多一句）；Alison 人物頁「打工：南洋戲院（週五、週六晚上）」（第一次櫃檯以後）
// 修改前（開發分支 d3adb529c）：模組不存在、沛珊作息還是週二四——FAIL。用法：node tests/aa614_jobs_unit.js（先 git fetch origin claude/cool-heisenberg-o8kuqx）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const VER=((fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8').match(/版本 v([0-9.]+)（/)||[])[1]||'?');   /* ?v= 和標題的版號一樣：不寫死 9.10.22（發布樹會換版號，同 bike_shop_park_unit.js）*/
const {check,GM,E}=H, J=JSON.stringify;
const loadErr=[];
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
for(const f of ['src/data/shop_npc.js','src/data/heroine_circle.js','src/whois3d.js','src/aa614_3d.js']){ if(!fs.existsSync(path.join(H.ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ loadG(f); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); } }
const git=(ref,p)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+ref+':"'+p+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const SHA614='32a5f7e12', DOC614='docs/story_planning/AA_614_同學也在打工_約了不能來.md', SHA615='ba26f7f7d', DOC615='docs/story_planning/AA_615_新生南路那一側_公館二輪戲院_爆米花.md';
const doc=git(SHA614,DOC614), doc5=git(SHA615,DOC615);
const A=()=>typeof AA614!=='undefined'&&AA614&&AA614.L?AA614:null;
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7, key=d=>CALENDAR.dateOf(d).key, TD=(t,w,w7)=>STORY.termDayIn(t,w,w7);
const ZHE='zhe', MX='classmate_mingxuan', PS='classmate_peishan', BH='classmate_bohan', XC='classmate_xinci', YT='heroine_03', YU='yu', KAI='kai';
const NM={[ZHE]:'阿哲',[MX]:'明軒',[PS]:'沛珊',[BH]:'柏翰',[XC]:'芯慈',[YT]:'語彤',[YU]:'Alison',[KAI]:'阿凱'};
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); E.hour=h; };
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const runAt=(d,h)=>{ at(d,h); phone(); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const know=ids=>{ for(const id of ids) H.FRIEND(id); };
let TEA={}; global.JOBS={scheduled:(G,k,d)=>k==='tea'&&!!TEA[d],active:(G,k)=>k==='tea'&&TEA.active!==false};   /* 祐廷一盞茶屋的班表（jobs3d.js 的 JOBS.scheduled／active）*/
const fresh=(d,h,zone,fl)=>{ const G=H.fresh(key(d),h,zone||'dorm',fl||{}); G.contacts=G.contacts||{}; G.acts=G.acts||{att:{}}; TEA={}; return G; };
const ask=(id,pid,h,day)=>{ const G=H.G; day=day==null?G.day:day; const P=INV.place(pid); const d=INV.decide(G,id,pid,day,h); return INV.personal(G,id,P,day,h,d); };
const evOf=id=>STORY_EVENTS.find(e=>e.id===id);
const evText=id=>{ const e=evOf(id); return e?e.dialogue.filter(l=>typeof l.text==='string').map(l=>l.text):[]; };
(async()=>{
  /* ================= 0 ================= */
  check('0. AA_614（32a5f7e12）、AA_615（ba26f7f7d）讀得到',doc.length>1500&&doc.includes('## 2. 玩家約他們，撞到上班時間')&&doc5.length>1500&&doc5.includes('## 4. 在戲院打工的同學：Alison'),doc?'':'git fetch origin claude/cool-heisenberg-o8kuqx');
  check('0. AA_615 ba26f7f7d 和白名單上的 ebea3a2b0 內容一樣',doc5===git('ebea3a2b0',DOC615));
  check('0. 模組都載得到（AA614、WHOIS、SHOP_NPC）',!loadErr.length&&!!A()&&typeof WHOIS!=='undefined',J(loadErr));
  if(!A()){ H.done(); return; }
  const L=A().L;
  { const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), sc=[...html.matchAll(/<script src="([^"?]+)\?v=([^"]+)"/g)].map(m=>m[1]), ia=sc.indexOf('src/aa614_3d.js');
    check('0. index.html：aa614_3d.js（?v=和標題同一版）緊接在 aa613_3d.js 後面，在 invites3d、phone3d、story3d、outings3d、jobs3d 之後',ia>0&&html.includes('<script src="src/aa614_3d.js?v='+VER+'"></script>')&&sc[ia-1]==='src/aa613_3d.js'&&['src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/outings3d.js','src/jobs3d.js','src/whois3d.js'].every(f=>sc.indexOf(f)>=0&&sc.indexOf(f)<ia),J(ia)); }
  { let W=null; try{ W=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')); }catch(e){}
    const e=W&&W.files&&W.files.find(x=>x.path===DOC614), e5=W&&W.files&&W.files.find(x=>x.path===DOC615);
    check('0. 劇情匯入白名單：AA_614＝32a5f7e12、approved、AA（D109）、AA614-CLASSMATE-JOBS-1103；AA_615 那一列記了 AA615-ALISON-CINEMA-1103',!!e&&e.sha===SHA614&&e.status==='approved'&&/^AA（D109）/.test(e.approvedBy)&&e.task==='AA614-CLASSMATE-JOBS-1103'&&e.kind==='text'&&!!e5&&e5.status==='approved'&&e5.note.includes('AA615-ALISON-CINEMA-1103'),J(e&&{sha:e.sha,st:e.status,by:e.approvedBy})); }
  /* 每一句都在稿裡 */
  { const all=[], add=x=>{ if(x==null) return; if(typeof x==='string'){ all.push(x); return; } if(Array.isArray(x)){ if(x.length===2&&typeof x[0]==='string'&&typeof x[1]==='string'&&NM[x[0]]){ all.push(x[1]); return; } for(const y of x) add(y); return; } if(typeof x==='object') for(const k of Object.keys(x)) add(x[k]); };
    const L614=Object.assign({},L); delete L614.watch; delete L614.three; const i5=Object.assign({},L.inv); delete i5.yu; L614.inv=i5;
    /* 2026-11-11（X327 沛珊重寫，AA_763_peishan_misc3.json@62460ea75）：溫州街課輔班窗外看到她那一句換字（原本 AA_614 的「你怎麼在這？……我在這裡當助教。教國小的小朋友。」）——這一句對 AA_763（tests/peishan_misc3_1111_unit.js），AA_614 稿上找的是原句 */
    const PSDOOR_OLD='你怎麼在這？……我在這裡當助教。教國小的小朋友。', PSDOOR_NEW='你怎麼在這？我在這裡當助教，教國小的小朋友。';
    /* 2026-11-11（X327 漏改，AA_807@551786903／AA_808@0806059b7）：沛珊群組那一句「我在課輔班，九點下課。明天可以！」句尾「～」改掉（AA_808 aa614_3d 第 43 列）——遊戲字先換回 AA_808 的舊句（line_rows_expect.js toOldS）再在 AA_614 找；說的人照稿那一項也一樣。舊期望：遊戲字本身在 AA_614 */
    const LR=require('./line_rows_expect.js'), o808=t=>LR.toOldS(t,'src/aa614_3d.js');
    add(L614); const bad=all.filter(t=>!doc.includes(o808(t))&&t!==PSDOOR_NEW);
    check('0. AA614.L（AA_614 的 '+all.length+' 句）都在 AA_614 稿裡、一字不差',all.length>=25&&!bad.length,J(bad));
    const L5=[L.inv.yu,L.three].concat(L.watch), bad5=L5.filter(t=>!doc5.includes(t));
    check('0. AA_615 的 '+L5.length+' 句（邀約、三位、1 廳三句旁白）都在 AA_615 稿裡',!bad5.length,J(bad5));
    const rowOk=(rows)=>rows.every(([id,t])=>doc.includes(NM[id]+'：「'+o808(t)+'」'));   /* o808：見上（舊期望：t 原樣）*/
    check('0. 第 3 節群組、私訊：說的人照稿（「阿哲：「宵夜？公館。」」這樣的寫法）',rowOk(L.g1)&&rowOk(L.g2)&&rowOk(L.g3)&&rowOk(L.g4)&&rowOk(L.g5),J([L.g1,L.g3].map(r=>r.map(x=>x[0]))));
    check('0. 第 3 列選項「好。」／「我不去了。」、旁白照稿',J(L.g3opts)===J(['好。','我不去了。'])&&doc.includes('玩家可以回「好。」／「我不去了。」')&&doc.includes('旁白帶過：「'+L.g3movie+'」'));
    /* 改時間的回覆（S.invRule → INV.playLines，有名字說的）不加外面的「」（TEXT-QUOTE-UNIFY-1108 第五批，AA-B 2026-11-08 11:05）；稿上有：加回那一對再找（Q）*/
    const Q=t=>'「'+t+'」';
    check('0. 第 2 節五種說法都在那一列（明軒、沛珊、阿凱、語彤兩種；遊戲裡沒有外面的「」）',Object.keys(L.inv).every(k=>typeof L.inv[k]==='string'&&!/^「|」$/.test(L.inv[k]))&&doc.includes('| 明軒 | 週二、週四 19:00～21:30 | '+Q(L.inv.mx))&&doc.includes('| 沛珊 | 週三 18:00～21:30（大一、大二） | '+Q(L.inv.ps))&&doc.includes('| 阿凱 | 週六 12:30～18:30 | '+Q(L.inv.kai))&&doc.includes('她說'+Q(L.inv.ytBoth))&&doc.includes('（祐廷沒排班的那一天：'+Q(L.inv.ytOff)+'）'));
    check('0. 第 4、5 節照稿（沛珊第一次那一句、第二次以後的旁白、阿凱的旁白、兩句閒聊）',L.psDoor===PSDOOR_NEW&&doc.includes('「'+PSDOOR_OLD+'」第二次以後：「'+L.psDoorAgain+'」')&&doc.includes('「'+L.kaiDoor+'」')&&doc.includes('阿凱閒聊（大一上第 4 週起）：「'+L.talk.kai+'」')&&doc.includes('沛珊閒聊（大一上第 4 週起）：「'+L.talk.ps+'」'));
    check('0. AA_615：1 廳三句旁白、「三位？……」、邀約那一句、人物頁那一行照稿',doc5.includes('旁白一句（隨機）：「'+L.watch[0]+'」「'+L.watch[1]+'」「'+L.watch[2]+'」')&&doc5.includes('Alison「'+L.three+'」')&&doc5.includes('玩家約她撞到時：'+Q(L.inv.yu))&&doc5.includes('她的人物頁加一行「打工：南洋戲院（週五、週六晚上）」'));
    check('0. 阿凱閒聊進 SMALLTALK（閒聊是有名字說的：不加外面的「」，TEXT-QUOTE-UNIFY-1108 第四批）',(SMALLTALK.kai||[]).some(e=>e&&e.t===L.talk.kai&&e.once===true)&&!(SMALLTALK.kai||[]).some(e=>e&&e.t==='「'+L.talk.kai+'」')); }

  /* ================= 1 沛珊作息、ev_peishan_tutoring ================= */
  { const ps=CHARACTERS[PS], z=(d,h)=>{ fresh(d,h,'wenzhou'); return (STORY.schedEnt(ps,H.G)||{}).zone||null; };
    const W=[[TD('Y1S1',3,3),18.2],[TD('Y1S1',10,3),20.5],[TD('Y1S2',5,3),19],[TD('Y1S2',12,3),18],[TD('Y2S1',15,3),20.9]].map(([d,h])=>z(d,h));
    check('1. 沛珊：每週三 18:00～21:00 在溫州街（大一上第 3、10 週、大一下第 5、12 週、大二上第 15 週 12/16）',W.every(x=>x==='wenzhou')&&key(TD('Y2S1',15,3))==='2026-12-16',J(W));
    const N=[[TD('Y1S2',5,2),17],[TD('Y1S2',9,4),16.6],[TD('Y1S1',10,3),17.5],[TD('Y1S1',10,3),21.2]].map(([d,h])=>z(d,h));
    check('1. 對照：大一下週二、四 16～18 不在溫州街了（AA-B 11-07）；週三 17:30、21:12 不在溫州街',N.every(x=>x!=='wenzhou'),J(N));
    const e=ps.daily_schedule.find(x=>x.job==='ps_tutor');
    check('1. 那一筆：週三 18～21、大一上～大二上、2025-09-15～2026-12-17、noHoliday、註解寫 AA_614 a0b8a3e40／AA-B 11-07',!!e&&J(e.days)===J([3])&&e.from===18&&e.to===21&&J(e.terms)===J(['Y1S1','Y1S2','Y2S1'])&&J(e.dates)===J([['2025-09-15','2026-12-17']])&&e.noHoliday===true&&/AA_614/.test(e.note)&&/a0b8a3e40/.test(e.note)&&/AA-B 2026-11-07/.test(e.note),J(e&&e.days));
    check('1. 舊的那一筆（週二、四 16:00～18:00）不在了',!ps.daily_schedule.some(x=>x.zone==='wenzhou'&&J(x.days)===J([2,4])&&x.from===16));
    const E7=ps.daily_schedule.filter(x=>/^AA_320 E7/.test(x.note||'')), X=[[TD('Y1S1',8,3),19.5],[TD('Y1S2',16,3),20],[TD('Y2S1',9,3),19.2]].map(([d,h])=>z(d,h));
    const Y=[[TD('Y1S1',8,4),19.5],[TD('Y1S2',16,4),20],[TD('Y2S1',9,4),19.2]].map(([d,h])=>z(d,h));
    check('1. 考試週：週三在課輔班；AA_320 E7（法律系館A 3F）搬到週四 19:00～21:30（AA-B 接線時補的 73ee9256d），兩列都沒有 notDates',E7.length===2&&E7.every(x=>J(x.days)===J([4])&&x.from===19&&x.to===21.5&&!x.notDates)&&X.every(x=>x==='wenzhou')&&Y.every(x=>x==='linze_3f')&&doc.includes('從週三搬到**週四** 19:00～21:30'),J({X,Y}));
    const c3=(HCIRCLE_DATA.ROWS||[]).find(r=>r.id==='c504_6_3');
    check('1. 女主角的圈子 c504_6_3（AA_504 6-1「週二、四 課輔班（現有）」，小朋友那兩句）跟著搬到週三 18:00～21:00、句子不變',!!c3&&J(c3.days)===J([3])&&c3.from===18&&c3.to===21&&c3.zone==='wenzhou'&&c3.heard==='小朋友：老師！這題我會了！／沛珊：好棒！……那下一題呢？',J(c3&&[c3.days,c3.from,c3.to]));
    const p=evOf('ev_peishan_tutoring'), t=evText('ev_peishan_tutoring');
    check('1. ev_peishan_tutoring：週三 20:45～21:15、標題「課輔班的晚上」、大一下第 5～15 週（照舊）、走進溫州街、P2 之後',!!p&&J(p.weekday)===J([3])&&J(p.time)===J([20.75,21.25])&&p.title==='課輔班的晚上'&&J(p.term)===J(['Y1S2'])&&J(p.weeks)===J([5,6,7,8,9,10,11,12,13,14,15])&&p.trigger==='enter'&&p.location==='wenzhou'&&J(p.prereq)===J({events:['ev_peishan_doubt']}),J(p&&[p.weekday,p.time,p.title]));
    check('1. 兩句照 AA-B 11-07 改：開頭旁白、「每個禮拜三。」',t[0]==='她帶著一群國小生從課輔班走出來。門口有幾個家長在等，她手上還拿著一疊作業本。'&&t[1]==='喔，是你。我在這裡當助教。每個禮拜三。',J(t.slice(0,2)));
    check('1. 舊的兩句不在了',!t.includes('她帶著一群國小生從課輔班走出來，手上拿著一疊作業本。')&&!t.includes('喔，是你。我在這裡當志工。一週兩天。')&&!t.some(x=>/一週兩天/.test(x)));
    check('1. 其他句子照舊',t[2]==='一個小孩拉她的衣角。她蹲下來聽他講完，站起來。'&&t[3]==='我在這裡都不會看時間。上課的時候我五分鐘看一次。'&&t.includes('有嗎。')&&t.includes('……有。'),J(t.slice(2,4)));
    const ok=(d,h)=>{ fresh(d,h,'wenzhou'); H.G.events.done.ev_peishan_doubt=1; return EVENTS.check(p); };
    const r={wed:ok(TD('Y1S2',5,3),21),wed2:ok(TD('Y1S2',15,3),20.8),early:ok(TD('Y1S2',5,3),20.5),late:ok(TD('Y1S2',5,3),21.3),tue:ok(TD('Y1S2',5,2),17),w4:ok(TD('Y1S2',4,3),21)};
    check('1. 週三 21:00、20:48 走進溫州街就演；20:30、21:18、週二 17:00、第 4 週都不演',r.wed&&r.wed2&&!r.early&&!r.late&&!r.tue&&!r.w4,J(r)); }

  /* ================= 2 第 2 節：邀約撞到上班 ================= */
  { const go=(id,d,pid,h,fl,o)=>{ fresh(d,10,'dorm',fl); know([id]); H.G.contacts[id]=1; if(o) o(); return ask(id,pid,h); };
    const tx=r=>J(r.lines||null);
    /* 明軒 */
    let r=go(MX,TD('Y1S1',6,2),'wenzhou',19.5);
    check('2. 明軒週二 19:30 散步：「我那時候家教。……九點半以後可以，公館？」→ 當天 21:30',r.res==='resched'&&tx(r)===J([L.inv.mx])&&r.alt&&r.alt.day===H.G.day&&r.alt.h===21.5,J(r));
    r=go(MX,TD('Y1S1',6,4),'wenzhou',21); check('2. 明軒週四 21:00（21:30 以前）一樣',r.res==='resched'&&tx(r)===J([L.inv.mx])&&r.alt.h===21.5,J(r));
    r=go(MX,TD('Y1S1',6,1),'wenzhou',19.5); check('2. 對照：明軒週一 19:30 照舊答應（不是這一句）',r.res==='accept'&&tx(r)!==J([L.inv.mx]),J(r));
    r=go(MX,TD('Y1S1',6,2),'wenzhou',21.5); check('2. 對照：明軒週二 21:30 照舊答應',r.res==='accept',J(r));
    r=go(MX,TD('Y1S1',6,2),'cafe',19.5); check('2. 對照：Café 照 BB_172 M10「那時候我在家教 九點以後可以」（手機版）',tx(r)===J(['那時候我在家教 九點以後可以']),J(r));
    /* 沛珊 */
    r=go(PS,TD('Y1S1',6,3),'wenzhou',18.5);
    check('2. 沛珊週三 18:30：「禮拜三我在課輔班，九點才下課。……禮拜四好不好？」→ 隔天同一個時間',r.res==='resched'&&tx(r)===J([L.inv.ps])&&r.alt&&r.alt.day===H.G.day+1&&r.alt.h===18.5&&wd(r.alt.day)===4,J(r));
    r=go(PS,TD('Y2S1',14,3),'cafe',20.5); check('2. 沛珊大二上週三 20:30 Café（21:30 以前）一樣',r.res==='resched'&&tx(r)===J([L.inv.ps])&&r.alt.h===20.5,J(r));
    r=go(PS,TD('Y1S1',6,3),'wenzhou',17); check('2. 對照：沛珊週三 17:00 散步（17:45 結束）照舊答應',r.res==='accept'&&tx(r)!==J([L.inv.ps]),J(r));
    r=go(PS,TD('Y1S1',6,2),'wenzhou',18.5); check('2. 對照：沛珊週二 18:30 照舊答應',r.res==='accept',J(r));
    /* 阿凱 */
    r=go(KAI,TD('Y1S1',6,6),'wenzhou',14);
    check('2. 阿凱週六 14:00：「禮拜六下午我在上班。……晚上？我六點半回宿舍。」→ 當天 19:00',r.res==='resched'&&tx(r)===J([L.inv.kai])&&r.alt&&r.alt.day===H.G.day&&r.alt.h===19,J(r));
    r=go(KAI,TD('Y1S2',6,6),'cafe',12.5); check('2. 阿凱大一下週六 12:30 Café 一樣',r.res==='resched'&&tx(r)===J([L.inv.kai]),J(r));
    r=go(KAI,TD('Y1S1',6,6),'wenzhou',19); check('2. 對照：阿凱週六 19:00 照舊答應',r.res==='accept'&&tx(r)!==J([L.inv.kai]),J(r));
    r=go(KAI,TD('Y1S1',6,0===0?7:7),'wenzhou',14); check('2. 對照：阿凱週日 14:00 照舊答應',r.res==='accept',J(r));
    /* 語彤 */
    r=go(YT,TD('Y1S1',6,6),'wenzhou',14);
    check('2. 語彤週六 14:00（祐廷沒排班）：「我在茶屋。……五點以後可以。」→ 當天 17:30',r.res==='resched'&&tx(r)===J([L.inv.ytOff])&&r.alt&&r.alt.day===H.G.day&&r.alt.h===17.5,J(r));
    r=go(YT,TD('Y1S1',6,7),'cafe',15.5,{},()=>{ TEA[H.G.day]=true; });
    check('2. 語彤週日 15:30（祐廷也在班表上）：「我們兩個都在上班啊。」→ 當天 17:30',r.res==='resched'&&tx(r)===J([L.inv.ytBoth])&&r.alt&&r.alt.h===17.5,J(r));
    r=go(YT,TD('Y1S1',6,6),'cafe',17.5); check('2. 對照：語彤週六 17:30 不是這兩句',tx(r)!==J([L.inv.ytOff])&&tx(r)!==J([L.inv.ytBoth]),J(r));
    r=go(YT,TD('Y1S1',6,6),'cafe',15.5,{dating_heroine_03:true}); { const c={pid:'cafe',P:INV.place('cafe'),day:H.G.day,h:15.5,wd:6,r:{res:'accept'}};
      check('2. 對照：和語彤交往中＝不換成這兩句（照 AA_627 P-27～P-29 那幾句，tests/aa415_invite_replies_unit.js 第 11 節）',A().invRule(YT,H.G,c,INV)===null&&tx(r)!==J([L.inv.ytOff])&&tx(r)!==J([L.inv.ytBoth])&&r.res!=='resched',J(r)); }
    /* Alison（AA_615）*/
    r=go(YU,TD('Y1S1',6,5),'wenzhou',19);
    check('2. Alison 週五 19:00：「禮拜五晚上我在戲院。……禮拜天下午？」→ 那個週日 14:00',r.res==='resched'&&tx(r)===J([L.inv.yu])&&r.alt&&r.alt.day===H.G.day+2&&wd(r.alt.day)===0&&r.alt.h===14,J(r));
    r=go(YU,TD('Y1S1',6,6),'wenzhou',19); check('2. Alison 週六 19:00：「週六我在南洋上班，到很晚。……禮拜天下午可以嗎？」→ 週日 14:00（接線時補的 73ee9256d）',r.res==='resched'&&tx(r)===J([L.inv.yuSat])&&L.inv.yuSat==='週六我在南洋上班，到很晚。……禮拜天下午可以嗎？'&&r.alt&&wd(r.alt.day)===0&&r.alt.day===H.G.day+1&&r.alt.h===14,J(r));
    check('2. 接線時補的：「教國小的小朋友」「五年級的」（國小課輔班，32a5f7e12 說法統一）',L.psDoor==='你怎麼在這？我在這裡當助教，教國小的小朋友。'&&L.talk.ps==='課輔班有一個五年級的，每次都說數學沒用。……我也這樣想過。'&&!J(L).includes('國中生')&&!J(L).includes('國二的'));
    r=go(YU,TD('Y1S1',3,5),'wenzhou',19); check('2. 對照：大一上第 3 週週五（第 4 週才開始打工）照舊答應',r.res==='accept',J(r));
    r=go(YU,TD('Y1S1',6,5),'wenzhou',17); check('2. 對照：Alison 週五 17:00（17:45 結束）照舊答應',r.res==='accept',J(r)); }

  /* ================= 3 第 3 節：群組、私訊 ================= */
  const G1='noodle_team', SQ='camp_squad_y1', RM='r203';
  /* 第 1 列 */
  { const d=TD('Y1S1',6,4); fresh(d-1,20); know([ZHE,MX]); PHONE.join(H.G,G1,'桌遊團'); runAt(d,21.5); const pre=byTag('aa614_r1').length; runAt(d,21+41/60); const m=byTag('aa614_r1');
    check('3-1. 大一上第 6 週週四 21:40 系上朋友（桌遊團）：阿哲、明軒、阿哲三則（21:30 還沒到）',pre===0&&J(m.map(x=>[x.th,x.from,x.text]))===J(L.g1.map(([id,t])=>['g:'+G1,id,t]))&&m.every(x=>x.h>=21.66&&x.h<=21.7),J(m.map(x=>[x.from,x.text,x.h])));
    fresh(d-1,20); know([ZHE,MX]); runAt(d-1,20.5); runAt(d,22); const p=byTag('aa614_r1');
    check('3-1. 還不在系上朋友的群組（AA_606 第 13 週以前）＝阿哲私訊「宵夜？公館。」一則',J(p.map(x=>[x.th,x.text]))===J([['p:'+ZHE,L.g1[0][1]]]),J(p.map(x=>[x.th,x.text]))); }
  /* 第 2 列 */
  { const d=TD('Y1S1',8,3); fresh(d,12); know([XC,PS]); PHONE.join(H.G,SQ,'第七小隊'); runAt(d,12); runAt(d,19.1); const m=byTag('aa614_r2');
    check('3-2. 大一上第 8 週週三 19:00 第七小隊：芯慈、沛珊',J(m.map(x=>[x.th,x.from,x.text]))===J(L.g2.map(([id,t])=>['g:'+SQ,id,t]))&&m[0].h>=19&&m[0].h<=19.11,J(m.map(x=>[x.from,x.text])));
    fresh(d,12); know([XC,PS]); runAt(d,12); runAt(d,19.1); check('3-2. 對照：不在第七小隊群組＝沒有',!byTag('aa614_r2').length); }
  /* 第 3 列＋出遊 */
  { const d=TD('Y1S1',9,6); fresh(d,9); know([BH,KAI,YU]); PHONE.join(H.G,RM,'203'); runAt(d,9); runAt(d,12.1); const m=byTag('aa614_r3');
    check('3-3. 大一上第 9 週週六 12:00 宿舍 203：柏翰、阿凱、柏翰；最後一則可以回「好。」／「我不去了。」',J(m.map(x=>[x.th,x.from,x.text]))===J(L.g3.map(([id,t])=>['g:'+RM,id,t]))&&!!m[2].ask&&J(m[2].ask.opts.map(o=>o.t))===J(L.g3opts)&&m[2].ask.until===T(d,19),J(m.map(x=>[x.from,x.text])));
    PHONE.answer(H.G,'aa614_r3',0); runAt(d,12.2); const q=OUT.get(H.G,'aa614_movie');
    check('3-3. 回「好。」＝當天 19:30 南洋戲院（出遊 ev_aa614_movie）',H.G.flags.AA614_MOVIE===d&&!!q&&q.day===d&&q.h===19.5&&q.ev==='ev_aa614_movie'&&q.place==='南洋戲院',J(q));
    const ev=evOf('ev_aa614_movie'); at(d,19.5); H.said=[]; await EVENTS.run(ev);
    check('3-3. 那一場：Alison 在櫃檯（週六 18～23、認識她）「三位？……你們三個看同一部喔。」→ 旁白「（電影不好看。……）」',J(H.lines())===J(['Alison：'+L.three,L.g3movie])&&ev.trigger==='outing'&&J(ev.participants)===J([KAI,BH]),J(H.lines()));
    fresh(d,19.5); know([BH,KAI]); H.said=[]; await EVENTS.run(ev); check('3-3. 對照：不認識 Alison＝只有旁白',J(H.lines())===J([L.g3movie]),J(H.lines()));
    fresh(d,9); know([BH,KAI]); PHONE.join(H.G,RM,'203'); runAt(d,9); runAt(d,12.1); PHONE.answer(H.G,'aa614_r3',1); runAt(d,12.2);
    check('3-3. 回「我不去了。」＝沒有出遊',!OUT.get(H.G,'aa614_movie')&&H.G.flags.AA614_MOVIE==null);
    fresh(d,9); know([BH,KAI]); runAt(d,9); runAt(d,12.1); check('3-3. 對照：不在 203 群組＝沒有',!byTag('aa614_r3').length); }
  /* 第 4 列 */
  { const d=TD('Y1S2',3,2); fresh(d,12); know([YU,MX]); PHONE.join(H.G,G1,'桌遊團'); runAt(d,19.2); const pre=byTag('aa614_r4').length; runAt(d,19.4); const m=byTag('aa614_r4');
    check('3-4. 大一下第 3 週週二 19:20 系上朋友：Alison、明軒、Alison',pre===0&&J(m.map(x=>[x.th,x.from,x.text]))===J(L.g4.map(([id,t])=>['g:'+G1,id,t])),J(m.map(x=>[x.from,x.text])));
    fresh(d,12); know([YU,MX]); runAt(d,19.4); check('3-4. 對照：不在群組＝沒有（沒有私訊代替）',!byTag('aa614_r4').length); }
  /* 第 5 列 */
  const r5=(d,o)=>{ runAt(d,10); if(o) o(); runAt(d,14.1); return byTag('aa614_r5'); };
  { const d=TD('Y1S1',12,7); fresh(d,10); know([YT]); H.G.contacts[YT]=1; const m=r5(d);
    check('3-5. 大一上第 12 週週日 14:00（祐廷那天沒排茶屋的班）語彤私訊「今天茶屋好多人。……」',J(m.map(x=>[x.th,x.text]))===J([['p:'+YT,L.g5[0][1]]]),J(m.map(x=>[x.th,x.text])));
    fresh(d,10); know([YT]); H.G.contacts[YT]=1; TEA[d]=true; check('3-5. 對照：祐廷那天有排班＝沒有',!r5(d).length);
    fresh(d,10); know([YT]); H.G.contacts[YT]=1; TEA.active=false; check('3-5. 對照：沒在一盞茶屋打工＝沒有',!r5(d).length);
    fresh(d,10,'dorm',{YT_MET_JOB:false}); H.G.contacts[YT]=1; check('3-5. 對照：還不認識語彤（YT_MET_JOB）＝沒有',!r5(d).length); }

  /* ================= 4 第 4 節：路上遇到 ================= */
  { const ev=evOf('ev_aa614_ps_door'), d=TD('Y1S1',5,3); fresh(d,18+21/60,'wenzhou'); know([PS]);
    check('4. 沛珊：週三 18:20 走在溫州街＝遇到（trigger auto）',!!ev&&ev.trigger==='auto'&&ev.location==='wenzhou'&&EVENTS.check(ev));
    H.said=[]; await EVENTS.run(ev); check('4. 第一次：「你怎麼在這？……我在這裡當助教。國中生。」',J(H.lines())===J(['沛珊：'+L.psDoor]),J(H.lines()));
    check('4. 同一天不再一次',!EVENTS.check(ev));
    at(d+7,18.5); check('4. 下一個週三 18:30 再遇到',EVENTS.check(ev)); H.said=[]; await EVENTS.run(ev); check('4. 第二次以後：「（課輔班的窗戶裡，沛珊在白板前面講題目。）」',J(H.lines())===J([L.psDoorAgain]),J(H.lines()));
    at(d+14,18.1); const a=EVENTS.check(ev); at(d+14,18.9); const b=EVENTS.check(ev); at(d+13,18.5); const c=EVENTS.check(ev);
    check('4. 對照：18:06、18:54、週二都沒有',!a&&!b&&!c,J([a,b,c]));
    fresh(D('2026-12-23'),18.5,'wenzhou'); know([PS]); check('4. 對照：2026-12-17 以後（課輔班做到那天）沒有',!EVENTS.check(ev));
    fresh(d,18.5,'gongguan'); know([PS]); check('4. 對照：在公館沒有',!EVENTS.check(ev)); }
  { const ev=evOf('ev_aa614_kai_door'), d=TD('Y1S1',5,6); fresh(d,17+51/60,'xinsheng'); know([KAI]);
    check('4. 阿凱：週六 17:50 走在新生南路＝遇到',!!ev&&ev.trigger==='auto'&&ev.location==='xinsheng'&&EVENTS.check(ev));
    H.said=[]; await EVENTS.run(ev); check('4. 「（阿凱站在門口，一個一個看家長來接。看到你，他比了一個累的手勢。）」',J(H.lines())===J([L.kaiDoor]),J(H.lines()));
    check('4. 同一天不再一次',!EVENTS.check(ev)); at(d+1,17.9); check('4. 對照：週日沒有',!EVENTS.check(ev)); }

  /* ================= 5 第 5 節：閒聊 ================= */
  { const say=()=>{ const r=STORY.smallTalk(H.G,KAI); return r.say||r.narr; };
    fresh(TD('Y1S1',3,4),15,'campus'); know([KAI]); const pre=say();
    fresh(TD('Y1S1',4,2),15,'campus'); know([KAI]); const s1=say(); H.G.day++; const s2=say();
    check('5. 阿凱：大一上第 4 週起，閒聊「我禮拜六去教小學生寫程式。……其實還不會。」（第 3 週還沒有；說過就不再說）',pre!==L.talk.kai&&s1===L.talk.kai&&s2!==L.talk.kai,J([pre,s1,s2])); }
  { const who={name:'沛珊',charId:PS}; fresh(TD('Y1S1',3,4),15,'campus'); know([PS]); H.said=[]; await STORY.ladderTalk(GM,who,PS); const pre=H.lines();
    fresh(TD('Y1S1',5,2),15,'campus'); know([PS]); H.said=[]; const ok1=await STORY.ladderTalk(GM,who,PS); const s1=H.lines(); H.G.day++; H.said=[]; await STORY.ladderTalk(GM,who,PS); const s2=H.lines();
    check('5. 沛珊：大一上第 4 週起第一次說話「課輔班有一個國二的，每次都說數學沒用。……我也這樣想過。」（閒聊階梯前面；第 3 週沒有；之後照階梯）',ok1===true&&J(s1)===J(['沛珊：'+L.talk.ps])&&!pre.includes('沛珊：'+L.talk.ps)&&!s2.includes('沛珊：'+L.talk.ps)&&!!(H.G.flags.AA614_TALK&&H.G.flags.AA614_TALK.ps!=null),J([pre,s1,s2]));
    fresh(D('2026-12-23'),15,'campus'); know([PS]); check('5. 對照：2026-12-17 以後不說',!A().talkOn(H.G,'ps')); }

  /* ================= 6 AA_615：1 廳坐下來看、人物頁 ================= */
  { let TICKET=true, POP=false; global.NYS={hasTicket:()=>TICKET,PRICE:150}; global.SHOPNPC={popcorn:()=>POP}; const R0=Math.random; let k=0; Math.random=()=>[0.1,0.5,0.9][k++%3];
    const d=TD('Y1S1',6,5); fresh(d,19.5,'xs_nanyang_hall'); H.said=[]; await STORY.onSeat(GM,{kind:'cinema',row:3});
    const t1=H.lines(), h1=H.G.hour;
    check('6. 1 廳坐下（有今天的票）：時間過去（兩部約 4 小時）、旁白一句（隨機）',J(t1)===J([L.watch[0]])&&Math.abs(h1-23.5)<1e-6&&H.G.flags.NY_WATCHED===d,J([t1,h1]));
    H.said=[]; await STORY.onSeat(GM,{kind:'cinema',row:3}); check('6. 同一天再坐下＝不再演（一張票一場）',!H.lines().length);
    fresh(d,13,'xs_nanyang_hall'); POP=true; H.said=[]; await STORY.onSeat(GM,{kind:'cinema',row:1});
    check('6. 今天拿到爆米花＝多一句「（爆米花吃到第二部就沒了。）」',J(H.lines())===J([L.watch[1],SHOP_NPC.alison.movieLine])&&SHOP_NPC.alison.movieLine==='（爆米花吃到第二部就沒了。）'&&doc5.includes('看電影時旁白多一句「'+SHOP_NPC.alison.movieLine+'」'),J(H.lines()));
    fresh(d,13,'xs_nanyang_hall'); POP=false; H.said=[]; await STORY.onSeat(GM,{kind:'cinema',row:1}); check('6. 三句輪得到第三句',J(H.lines())===J([L.watch[2]]),J(H.lines()));
    fresh(d,13,'xs_nanyang_hall'); TICKET=false; H.said=[]; await STORY.onSeat(GM,{kind:'cinema',row:1}); check('6. 對照：沒有票＝只坐下、不演',!H.lines().length&&H.G.hour===13);
    fresh(d,13,'xs_nanyang'); TICKET=true; H.said=[]; await STORY.onSeat(GM,{kind:'shop',nanyang:'bench'}); check('6. 對照：大廳的長椅不演',!H.lines().length);
    fresh(d,22.5,'xs_nanyang_hall'); H.said=[]; await STORY.onSeat(GM,{kind:'cinema',row:1}); check('6. 22:30 坐下：24:00 打烊以前散場',Math.abs(H.G.hour-24)<1e-6,String(H.G.hour));
    Math.random=R0; delete global.NYS; delete global.SHOPNPC; }
  { fresh(TD('Y1S1',6,5),20,'xs_nanyang'); H.G.flags.met_yu=true; const before=WHOIS.lines(H.G,YU); H.G.flags.NY_ALISON={first:H.G.day,terms:{},sis:{}}; const after=WHOIS.lines(H.G,YU);
    check('6. Alison 人物頁：第一次在櫃檯遇到以後多一行「打工：南洋戲院（週五、週六晚上）」',!before.includes('打工：南洋戲院（週五、週六晚上）')&&after.includes('打工：南洋戲院（週五、週六晚上）')&&after.indexOf('打工：南洋戲院（週五、週六晚上）')===1,J(after)); }
  /* 7 接線時補的（73ee9256d）：閒聊階梯的招呼、P2-L3、人物頁「打工：」 */
  { const B=(typeof LADDER!=='undefined'&&LADDER.byTerm)||{}, gw=t=>(((B[t]||{})[PS]||{}).greet||{}).when||[], st=t=>((B[t]||{})[PS]||{}).steps||[];
    /* 2026-11-11 改期望（X327 沛珊重寫，AA_753_peishan_ladder_Y1S2_Y2S1@c5094495d）：這一則招呼的字換成「…等一下！我在上班！」（原本「……等一下！」），搬到週三 20:50～21:10 的條件跟著新句子走（aa614_3d.js 的 PS_CROSS）；
       P2-L3 整層重寫成「我在溫州街的課輔班帶小朋友。一個禮拜兩天。」——aa614 原本把「當志工。一週兩天。」換成「當助教。每個禮拜三。」，新稿的句子對不到、不再換（稿的字不動）；「兩天」和課輔班改週三對不起來，已列給 AA 定 */
    const cross=['Y1S2','Y2S1'].map(t=>gw(t).find(w=>w.t==='（她帶著一排小孩過馬路，對你點頭）等一下！我在上班！')||null);
    /* 2026-11-11（BB_326 第 4 節，企劃線 8abb761bd；BB 定、LAWWW 同意）：這一則的出現條件改成溫州街、週三 18:00～21:00（寫在 ladder.js 的資料裡）；aa614_3d.js 載入時搬到 20:50～21:10 的那一段拿掉（原本這裡期望 20:50～21:10） */
    check('7. 階梯招呼「（她帶著一排小孩過馬路，對你點頭）等一下！我在上班！」（大一下、大二上）＝溫州街、週三 18:00～21:00（BB_326 第 4 節；aa614 載入時不再搬到 20:50～21:10）、字照新稿',typeof LADDER!=='undefined'&&cross.every(w=>w&&J(w.weekday)===J([3])&&J(w.time)===J([18,21])&&J(w.location)===J(['wenzhou']))&&!/w\.time=\[20\+50\/60/.test(fs.readFileSync(path.join(H.ROOT,'src/aa614_3d.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'')),J(cross));
    const p23=st('Y1S2').find(x=>x&&x.id==='P2-L3');
    /* 2026-11-11（X327 沛珊重寫，AA 補稿 b59a8f9de）：AA 把新稿這一句更正成「每個禮拜三」（源稿 AA_753_peishan_ladder_Y1S2_Y2S1.json@b59a8f9de 直接改好，不靠 aa614 載入時換字） */
    check('7. P2-L3：「我在溫州街的課輔班帶小朋友，每個禮拜三。」（AA_614 的「一週兩天。」→「每個禮拜三。」落在新稿上）',!!p23&&p23.lines[0]==='我在溫州街的課輔班帶小朋友，每個禮拜三。'&&doc.includes('P2-L3「一週兩天。」→「每個禮拜三。」'),J(p23&&p23.lines));
    const rows=id=>((typeof WHOIS!=='undefined'&&WHOIS.R)||{})[id]||[], job=id=>rows(id).find(r=>r.id==='job');
    const jk=job(KAI), jp=job(PS);
    fresh('2025-10-04',10); const k0=!!(jk&&jk.if(H.G)), p0=!!(jp&&jp.if(H.G));
    H.G.flags.AA614_KAIDOOR=H.G.day; H.G.flags.AA614_PSDOOR_N=1; const k1=!!(jk&&jk.if(H.G)), p1=!!(jp&&jp.if(H.G));
    fresh('2025-10-04',10); H.G.social=H.G.social||{}; H.G.social.small=Object.assign({},H.G.social.small,{[KAI]:{once:{[AA614.KAI_SMALL.t]:true}}}); H.G.flags.AA614_TALK={ps:H.G.day}; const k2=!!(jk&&jk.if(H.G)), p2=!!(jp&&jp.if(H.G));
    check('7. 人物頁：阿凱「打工：新生南路的兒童程式教室（助教）」、沛珊「打工：溫州街的國小課輔班（助教）」，聽過閒聊那句或在上班的地方遇到以後才出現',!!jk&&!!jp&&jk.t==='打工：新生南路的兒童程式教室（助教）'&&jp.t==='打工：溫州街的國小課輔班（助教）'&&doc.includes('阿凱「'+jk.t+'」')&&doc.includes('沛珊「'+jp.t+'」')&&!k0&&!p0&&k1&&p1&&k2&&p2,J({k0,p0,k1,p1,k2,p2})); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

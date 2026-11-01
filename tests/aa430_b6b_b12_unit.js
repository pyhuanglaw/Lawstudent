// AA_430（企劃線 7525db6a5，白名單 2eb3041f0）：BB 事件包缺字——B6b 公共政策的講座、B12 同一個議題再聽一次（src/data/bbpack_events.js、src/bbpack3d.js）。不需要瀏覽器。
//   0 讀稿、每一句都在 AA_430（補的列在 COMPOSED）  1 活動的日子、教室  2 B6b 邀約、講座、散場三個選項、沒去
//   3 B12 邀約、講座（以安先舉手、玩家的四個問題照 B4 的狀態換、B12_ASK）  4 B12 散場 A（有／沒有 B5_THOUGHT）、B、C、收尾多一句、Alison 版  5 B12 沒去／中途離開的群組
// 修改前（開發分支 730b72072）：沒有 B6b；B12 是週二 18:30、只有一則邀約、沒有講座、散場只有兩句——FAIL。用法：node tests/aa430_b6b_b12_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let err=''; try{ load('src/data/bbpack_events.js'); load('src/bbpack3d.js'); }catch(e){ err=String(e); }
const git=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const A430=git('7525db6a5','AA_430_BB事件包缺字_B6b講座_B12再聽一次.md');
const J=JSON.stringify, ev=id=>STORY_EVENTS.find(e=>e.id===id), X=()=>typeof BBPACK!=='undefined'?BBPACK:null, act=id=>ACTIVITIES.list.find(q=>q.id===id);
const AN='heroine_01', BH='classmate_bohan';
const TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const setDay=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; };
const fresh=(d,h,zone,know,flags)=>{ const G=H.fresh('2026-01-01',h,zone||'campus',flags||{}); setDay(d,h); G.outings=[]; G.contacts=G.contacts||{}; for(const id of (know||[])) H.FAMILIAR(id); H.E.zone.roomAt=()=>null; EVENTS.zoneChanged(); return G; };
const said=()=>H.said.map(s=>s.t);
const msgs=th=>H.msgs(th);
const rules=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const B4D=TD('Y1S2',11,4), b4=(G,end)=>{ ACTIVITIES.rec(G).att['B4@'+B4D]={h:19,end}; };
/* 稿上沒有字、這裡補的（理由寫在 bbpack_events.js 的註解）*/
const COMPOSED=new Set(['掌聲。','（以安靠在走廊的窗邊，還在看她的筆記。）','你大一寫的是「{flag:B12_B5_TEXT}」。現在呢？']);
const norm=t=>String(t).replace(/^[「]/,'').replace(/[」]$/,'');
const lecture=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await CLS.attendActivity(GM,act(id)); return said(); };

(async()=>{
  check('0. 讀稿（企劃線 AA_430 @7525db6a5）',A430.indexOf('## 1. B6b')>=0&&A430.indexOf('### 2-4.')>=0,String(A430.length));
  check('0. 檔案載得到',!!X()&&!err,err);
  if(!X()){ H.done(); return; }
  await sec('0',async()=>{
    const IDS=['ev_b6b_lecture','ev_b6b_after','ev_b12_lecture','ev_b12_after'], bad=[], seen=new Set();
    for(const id of IDS){ const e=ev(id); if(!e){ bad.push('沒有 '+id); continue; } for(const l of e.dialogue||[]){ const T=[]; if(l.text!==undefined) T.push(l.text); for(const c of (l.choice||[])) T.push(c.text);
      for(const t of T){ seen.add(t); if(COMPOSED.has(t)) continue; if(A430.indexOf(t)<0&&A430.indexOf(norm(t))<0) bad.push(t); } } }
    check('0. 四個事件的每一句台詞、旁白、選項都在 AA_430（補的 '+COMPOSED.size+' 句列在 COMPOSED）',bad.length===0,bad.slice(0,6).join('｜'));
    check('0. COMPOSED 每一句都真的用到',[...COMPOSED].every(t=>seen.has(t)),[...COMPOSED].filter(t=>!seen.has(t)).join('｜'));
    const src=fs.readFileSync(path.join(H.ROOT,'src/data/bbpack_events.js'),'utf8');
    check('0. 沒有「小語」',src.indexOf('小語')<0);
  });

  /* ===== 1 活動 ===== */
  await sec('1',async()=>{
    const on=(id,t,w,wd)=>ACTIVITIES.on(act(id),TD(t,w,wd),{flags:{}});
    check('1. B6b：大二上第 10 週（期中考第 8～9 週以後）週三 19:00～20:30、博思 102、聽演講＝ev_b6b_lecture（AA_430「週三晚上七點，博思 102」）',
      !!act('B6b')&&on('B6b','Y2S1',10,3)&&!on('B6b','Y2S1',10,2)&&act('B6b').room==='102'&&act('B6b').zone==='boya'&&act('B6b').kind==='lecture'&&act('B6b').t0===19&&act('B6b').event==='ev_b6b_lecture'&&!CALENDAR.termOf(TD('Y2S1',10,3)).exam,J(act('B6b')));
    check('1. B12：大三上第 10 週週四 19:00～20:30、博思 101（AA_430 2-1；原本週二 18:30）、聽演講＝ev_b12_lecture',on('B12','Y3S1',10,4)&&!on('B12','Y3S1',10,2)&&act('B12').room==='101'&&act('B12').t0===19&&act('B12').t1===20.5&&act('B12').event==='ev_b12_lecture',J(act('B12')));
  });

  /* ===== 2 B6b ===== */
  await sec('2',async()=>{
    const mon=TD('Y2S1',10,1), wed=TD('Y2S1',10,3);
    let G=fresh(mon,20.9,'dorm',[AN,BH]); PHONE.join(G,'noodle_team','麵店團'); rules(); check('2. B6b 週一 21:00 以前沒有邀約',!msgs('g:noodle_team').some(t=>/博思 102/.test(t)));
    setDay(mon,21.05); rules();
    check('2. B6b 邀約（麵店團群組，前兩天 21:00）：以安「週三晚上七點，博思 102。「一條法律是怎麼被寫出來的」。」「這場我一定去。」、柏翰「我去。國考會考立法程序。」；沒有回覆選項',
      J((G.msgs||[]).filter(m=>m.th==='g:noodle_team').map(m=>m.from+':'+m.text))===J([AN+':週三晚上七點，博思 102。「一條法律是怎麼被寫出來的」。',AN+':這場我一定去。',BH+':我去。國考會考立法程序。'])&&!(G.msgs||[]).some(m=>m.th==='g:noodle_team'&&m.ask),J(msgs('g:noodle_team')));
    G=fresh(wed,18.9,'boya',[AN,BH]); let L=await lecture('B6b',['「會議紀錄很長喔。」']);
    const LECT=['講者以前在立法機關當過很多年的助理。投影片很少，大部分時間他在講故事。','一條條文，從草案到通過，常常改了十幾次。','有時候只改一個字。「得」改成「應」。','一個字改了，就有一群人的生活跟著不一樣。','你們以後讀到的每一條，都有人在會議室裡吵過。去找那些紀錄來看。','掌聲。以安在筆記本上寫了一行字，畫了兩條線。'];
    check('2. B6b 講座（逐字、順序）',J(L.slice(0,6))===J(LECT),J(L));
    const f0=SOCIAL.rel(AN).fam;
    check('2. B6b 散場（聽完、認識以安和柏翰）：柏翰「三讀的順序，跟課本一樣。我先回總圖。」、旁白、以安兩句、三個選項；「會議紀錄很長喔。」→「我知道。我已經下載了一份。」「公司法那次修的。我想看他們吵什麼。」→「好，我講完了。我回宿舍讀書。」',
      J(L.slice(6).filter(t=>!/演講結束了/.test(t)))===J(['三讀的順序，跟課本一樣。我先回總圖。','（柏翰走了。以安靠在走廊的窗邊，還在看她的筆記。）','「得」改成「應」，就有一群人要多做一件事。','……我想知道那一群人是誰。','我知道。我已經下載了一份。','公司法那次修的。我想看他們吵什麼。','好，我講完了。我回宿舍讀書。'])
      &&J(H.opts[0])===J(['「妳以後想寫法條？」','「會議紀錄很長喔。」','（聽她說）'])&&G.flags.B6B_PICK==='minutes'&&ACTIVITIES.attended(G,'B6b'),J([L,H.opts]));
    G=fresh(wed,18.9,'boya',[AN]); const fa=SOCIAL.rel(AN).fam; L=await lecture('B6b',['「妳以後想寫法條？」']);
    check('2. B6b 不認識柏翰：沒有他那句，旁白只留以安那半句；「妳以後想寫法條？」→「我想先看懂。……寫是很久以後的事。」；以安熟悉 +1',!L.includes('三讀的順序，跟課本一樣。我先回總圖。')&&L.includes('（以安靠在走廊的窗邊，還在看她的筆記。）')&&L.includes('我想先看懂。……寫是很久以後的事。')&&SOCIAL.rel(AN).fam===fa+1,J([L,fa,SOCIAL.rel(AN).fam]));
    G=fresh(wed,18.9,'boya',[AN]); L=await lecture('B6b',['（聽她說）']);
    check('2. B6b（聽她說）→旁白「（她講了十分鐘。中間停下來兩次，問你有沒有在聽。）」→「好，我講完了。…」',L[L.length-2]==='（她講了十分鐘。中間停下來兩次，問你有沒有在聽。）'&&L[L.length-1]==='好，我講完了。我回宿舍讀書。',J(L.slice(-3)));
    G=fresh(wed,18.9,'boya',[]); L=await lecture('B6b',[]); check('2. B6b 不認識以安：講座最後一句只有「掌聲。」、沒有散場',L.includes('掌聲。')&&!L.some(t=>/以安/.test(t))&&!L.includes('好，我講完了。我回宿舍讀書。'),J(L));
    G=fresh(wed,21.4,'dorm',[AN,BH]); PHONE.join(G,'noodle_team','麵店團'); rules(); check('2. B6b 沒去：21:30 以前沒有',!msgs('g:noodle_team').includes('講義我多拿了一份。要的話明天給你。'));
    setDay(wed,21.6); rules(); check('2. B6b 沒去（missed）：21:30 柏翰在群組「講義我多拿了一份。要的話明天給你。」',msgs('g:noodle_team').includes('講義我多拿了一份。要的話明天給你。'),J(msgs('g:noodle_team')));
    G=fresh(wed,18.9,'boya',[AN,BH]); PHONE.join(G,'noodle_team','麵店團'); await lecture('B6b',[0]); setDay(wed,21.6); rules(); check('2. B6b 聽完的玩家沒有那一句',!msgs('g:noodle_team').includes('講義我多拿了一份。要的話明天給你。'));
  });

  /* ===== 3 B12 邀約、講座 ===== */
  await sec('3',async()=>{
    const mon=TD('Y3S1',10,1), thu=TD('Y3S1',10,4);
    let G=fresh(mon,21.05,'dorm',[AN,'yu']); PHONE.join(G,'noodle_team','麵店團'); rules();
    check('3. B12 邀約（前三天 21:00）：以安「大一那場「政府可以為了大家，限制一個人嗎」，同一個講者又來了。」「週四晚上七點，博思 101。」、Alison「我要去！！這次我要聽懂」、阿哲「我也去 散場有宵夜嗎」',
      J((G.msgs||[]).filter(m=>m.th==='g:noodle_team').map(m=>m.from+':'+m.text))===J([AN+':大一那場「政府可以為了大家，限制一個人嗎」，同一個講者又來了。',AN+':週四晚上七點，博思 101。','yu:我要去！！這次我要聽懂','zhe:我也去 散場有宵夜嗎']),J(msgs('g:noodle_team')));
    const HEAD=['還是那位頭髮花白的老師。他說話還是很慢。','幾年前我在這裡問過一個問題。有些人可能聽過。','今天我想先聽你們問。','（以安第一個舉手。）','如果被限制的人，連要去哪裡問都不知道呢？','……這個問題，比我上次那一題好。','（教室裡有人笑。以安沒有笑，在等他講下去。）','所以制度要讓人找得到門。找不到門，有理由也沒用。'];
    const TAIL=['今天的最後一題，跟上次一樣。','被限制的那個人，最後可以去哪裡？','掌聲。這次以安沒有抄。'];
    const Q1='「『最小的手段』，要由誰說明？」', Q2='「被限制的人，可以先被問一次意見嗎？」', Q3='「您上次最後問的那一題，有答案了嗎？」', Q4='「如果限制是暫時的，多久算暫時？」', NO='（不舉手）';
    G=fresh(thu,18.9,'boya',[]); b4(G,'full'); let L=await lecture('B12',[Q3]);
    check('3. B12 講座：開頭八句（以安先舉手「…連要去哪裡問都不知道呢？」「找不到門」）、聽完 B4＝四個選項（含「上次最後那一題」）；問「上次」→（他笑了。）「沒有。所以我又來了。」、最後三句；B12_ASK last',
      J(L.slice(0,8))===J(HEAD)&&J(H.opts[0])===J([Q1,Q2,Q3,NO])&&L[8]==='（他笑了。）'&&L[9]==='沒有。所以我又來了。'&&J(L.slice(10,13))===J(TAIL)&&H.G.flags.B12_ASK==='last',J([L,H.opts]));
    G=fresh(thu,18.9,'boya',[]); b4(G,'left'); L=await lecture('B12',[Q4]);
    check('3. B12 B4 中途離開：「上次」換成「多久算暫時」→「要看限制的是什麼。……你們以後會寫很多書狀在吵這個。」；B12_ASK time',J(H.opts[0])===J([Q1,Q2,Q4,NO])&&L.includes('要看限制的是什麼。……你們以後會寫很多書狀在吵這個。')&&H.G.flags.B12_ASK==='time',J(H.opts));
    G=fresh(thu,18.9,'boya',[]); L=await lecture('B12',[Q1]);
    check('3. B12 沒去 B4、也沒看過群組轉述：只有兩個問題＋不舉手；問「誰說明」→「做出限制的人，要說得出理由。說不出來，就不該限制。」',J(H.opts[0])===J([Q1,Q2,NO])&&L.includes('做出限制的人，要說得出理由。說不出來，就不該限制。')&&H.G.flags.B12_ASK==='who',J(H.opts));
    G=fresh(thu,18.9,'boya',[]); PHONE.join(G,'noodle_team','麵店團'); PHONE.at(G,B4D,21.5,[{th:'g:noodle_team',from:'yu',text:'講者最後問了一題超難的'}],'b4_missed'); L=await lecture('B12',[Q2]);
    check('3. B12 沒去 B4、在群組看過轉述（b4_missed）：有「上次最後那一題」；問「先被問一次意見」→「可以，也應該。……這一題留給你。」',J(H.opts[0])===J([Q1,Q2,Q3,NO])&&L.includes('可以，也應該。……可是問了以後他說不要，怎麼辦？這一題留給你。')&&H.G.flags.B12_ASK==='ask',J(H.opts));
    G=fresh(thu,18.9,'boya',[]); L=await lecture('B12',[NO]); check('3. B12 不舉手：不記 B12_ASK，直接最後三句',H.G.flags.B12_ASK==null&&J(L.slice(8,11))===J(TAIL),J(L));
  });

  /* ===== 4 B12 散場 ===== */
  await sec('4',async()=>{
    const thu=TD('Y3S1',10,4), STICKY='（她把今天的便利貼，貼在大一那一頁的旁邊。兩張的字不一樣大。）', BUY='（阿哲和 Alison 說要去買雞排，先走了。小桌子只剩以安。）';
    const after=L=>L.slice(L.indexOf(BUY));
    let G=fresh(thu,18.9,'boya',[AN,'yu']); b4(G,'full'); G.flags.B5_THOUGHT='trade'; const f0=SOCIAL.rel(AN).fam; let L=after(await lecture('B12',['「『最小的手段』','「現在會先問']));
    check('4. A 聽完 B4、有 B5_THOUGHT（trade）：買雞排旁白、舊筆記旁白、「大一那天，我只抄得下這一句。」「今天我知道要問什麼了。」「你大一寫的是「最小，要看大家換到了什麼」。現在呢？」、三個選項；「現在會先問是誰被限制。」→「……嗯。這個我也是最近才會問。」；問過 who＝「你今天問的那一題，我本來也想問。」；便利貼；熟悉 +1、B12_DONE',
      J(L)===J([BUY,'（以安從包包拿出一本舊的筆記本，翻到中間。最後那一句抄了兩次，字比現在的小。）','大一那天，我只抄得下這一句。','今天我知道要問什麼了。','你大一寫的是「最小，要看大家換到了什麼」。現在呢？','……嗯。這個我也是最近才會問。','你今天問的那一題，我本來也想問。',STICKY])
      &&J(H.opts[1])===J(['「還是一樣。」','「現在會先問是誰被限制。」','「我現在比較不確定。」'])&&SOCIAL.rel(AN).fam===f0+1&&H.G.flags.B12_DONE===true,J([L,H.opts,f0,SOCIAL.rel(AN).fam]));
    G=fresh(thu,18.9,'boya',[AN,'yu']); b4(G,'full'); G.flags.B5_THOUGHT='where'; L=after(await lecture('B12',['（不舉手）','「還是一樣']));
    check('4. A B5_THOUGHT where：「你大一寫的是「我還不知道。我想知道他最後去了哪裡」。現在呢？」→「好。那你大一就想對方向了。」；沒舉手＝收尾沒有多的那一句',L.includes('你大一寫的是「我還不知道。我想知道他最後去了哪裡」。現在呢？')&&L.includes('好。那你大一就想對方向了。')&&L[L.length-2]==='好。那你大一就想對方向了。'&&L[L.length-1]===STICKY,J(L));
    G=fresh(thu,18.9,'boya',[AN,'yu']); b4(G,'full'); L=after(await lecture('B12',['「您上次','「不太記得']));
    check('4. A 聽完 B4、沒有 B5_THOUGHT：「大一那場，你記得最後一題嗎？」兩個選項；「不太記得了。」→「我抄了兩次。……給你看。」（她把筆記本轉過來給你。）；問過 last 的那一句',
      L.includes('大一那場，你記得最後一題嗎？')&&J(H.opts[1])===J(['「被限制的人可以去哪裡。」','「不太記得了。」'])&&L.includes('我抄了兩次。……給你看。')&&L.includes('（她把筆記本轉過來給你。）')&&L.includes('你問他有沒有答案。……他說沒有的時候，我鬆了一口氣。'),J([L,H.opts]));
    G=fresh(thu,18.9,'boya',[AN,'yu']); L=after(await lecture('B12',['「被限制的人，可以先','「要讓他找得到門']));
    check('4. B 沒去 B4：「大一那場你沒來。…你現在答得出來嗎？」「（她把筆記本轉過來。最後那一句抄了兩次。）」三個選項；「要讓他找得到門。」（今天聽到的）→「……那是今天的。你自己的呢？」「好，下次再講。」；問過 ask＝「你問『他說不要怎麼辦』那一題，我回去想。」',
      J(L)===J([BUY,'大一那場你沒來。我把我的筆記給你看——你現在答得出來嗎？','（她把筆記本轉過來。最後那一句抄了兩次。）','……那是今天的。你自己的呢？','好，下次再講。','你問『他說不要怎麼辦』那一題，我回去想。',STICKY])
      &&J(H.opts[1])===J(['「要讓他找得到門。」','「要先問他本人。」','「答不出來。」']),J([L,H.opts]));
    G=fresh(thu,18.9,'boya',[AN,'yu']); b4(G,'left'); L=after(await lecture('B12',['「如果限制','「我那天先走']));
    check('4. C B4 中途離開：「大一那場你沒聽完。後半場在這裡。」（她把筆記本翻到後半，推過來。）「最後一題，是今天那一題。」；「我那天先走，有點可惜。」→「今天補到了。」；問過 time＝「多久算暫時，我們下次讀書會可以吵。」',
      J(L)===J([BUY,'大一那場你沒聽完。後半場在這裡。','（她把筆記本翻到後半，推過來。）','最後一題，是今天那一題。','今天補到了。','多久算暫時，我們下次讀書會可以吵。',STICKY]),J(L));
    G=fresh(thu,18.9,'boya',['yu']); SOCIAL.meet&&SOCIAL.meet(AN,'boya'); SOCIAL.rel(AN).fam=5; b4(G,'left'); const fy=SOCIAL.rel(AN).fam; L=await lecture('B12',['（不舉手）','「以安問得很好']);
    const i=L.indexOf('（以安和阿哲去買宵夜了。小桌子只剩 Alison。）');
    check('4. 和以安不到 FAMILIAR：Alison 版（「欸，大一那場我也有去。…」「今天聽懂比較多了！！…」、兩個選項；「以安問得很好。」→「她每次都這樣。……她一定會說『還好』。」）；沒有筆記本、便利貼；不記以安熟悉',
      i>=0&&J(L.slice(i))===J(['（以安和阿哲去買宵夜了。小桌子只剩 Alison。）','欸，大一那場我也有去。那時候我只聽懂一半。','今天聽懂比較多了！！……以安問的那一題我就沒想到。','她每次都這樣。……我要去跟她說，她一定會說『還好』。'])
      &&J(H.opts[1])===J(['「我也只聽懂一半。」','「以安問得很好。」'])&&!L.some(t=>/便利貼|筆記本/.test(t))&&SOCIAL.rel(AN).fam===fy,J([L,H.opts]));
    G=fresh(thu,18.9,'boya',[]); L=await lecture('B12',['（不舉手）']); check('4. 以安、Alison 都不認識：沒有散場',!L.includes(BUY)&&!L.some(t=>/小桌子只剩/.test(t)),J(L));
  });

  /* ===== 5 B12 沒去、中途離開 ===== */
  await sec('5',async()=>{
    const thu=TD('Y3S1',10,4), M='以安今天有舉手！！問得超好';
    let G=fresh(thu,21.4,'dorm',[AN,'yu']); PHONE.join(G,'noodle_team','麵店團'); rules(); check('5. B12 沒去：21:30 以前沒有',!msgs('g:noodle_team').includes(M));
    setDay(thu,21.6); rules(); check('5. B12 沒去：21:30 Alison「以安今天有舉手！！問得超好」',msgs('g:noodle_team').includes(M),J(msgs('g:noodle_team')));
    G=fresh(thu,21.6,'dorm',[AN,'yu']); PHONE.join(G,'noodle_team','麵店團'); ACTIVITIES.rec(G).att['B12@'+thu]={h:19,end:'left',lh:19.6}; rules(); check('5. B12 中途離開：同一則',msgs('g:noodle_team').includes(M));
    G=fresh(thu,21.6,'dorm',[AN,'yu']); PHONE.join(G,'noodle_team','麵店團'); ACTIVITIES.rec(G).att['B12@'+thu]={h:19,end:'full'}; rules(); check('5. B12 聽完：沒有',!msgs('g:noodle_team').includes(M));
  });
  H.done();
})();

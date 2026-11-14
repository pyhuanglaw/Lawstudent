// BULLETIN-BOARD-1110（USER_WANTS X295；使用者 11-10「公告欄要看的到社團社課時間 特殊活動?學生會迎新派對? 社團徵人?」）——不需要瀏覽器（D131）。
// AA 定稿：企劃線 3630810aa 的 docs/story_planning/AA_737_bulletin_board.json（D109，照稿接、不改字）。這支測試用 git show 讀那個 commit，逐字比對。
//   2026-11-12：法服那一張招生海報改照 AA_701 第 3 節第 6 點（企劃線 a21a9ddc6；遊戲 7e404a6220 改的，這支從那一筆起紅到這一次改期望）——見下面 LAW701。
//   0. 台詞、文字逐字對 AA_737：本週公告標題、empty、五張招生海報（text／textLater）、lateJoin 五句＋系籃兩處換字＋第 6 週那句、四個特殊活動（標題、說明、旁白、地點名稱、時間、海報天數、按鈕的字、捐血那句、吉他社社員那句）。
//   1. 本週公告分三區：副標「m/d（週）～m/d（週）」；社課一行「{社團}　每週{星期們} {t0}–{t1}　{地點}」（同一社團一週好幾天合成一行；系籃加「（下雨改新體育館一樓走廊）」）；
//      演講・活動一行「{今天／明天／m/d（週）} {t0}–{t1}　{標題}　{地點}」；這週沒有的那一區整區不顯示；三區都沒有＝「這週沒有新的公告。」（原本的「目前沒有公告的演講或活動。」不再出現）。
//   2. 招生海報：大一上第 1～6 週都貼（大一上的全文有「第 5 週開始」）、第 7 週撤；大二上第 3 週貼 textLater；大一下沒有；經濟系那一年沒有；博思的講座資訊螢幕（只列博思的）不貼招生、也不列別棟的社課。
//   3. 四個特殊活動在對的週次與時間出現在公告欄（且只在那幾天有）：迎新派對 9/11（四）19:00–21:30 新體育館（大二 9/17）（AA_737 7079841a7：原本第 2 週週五 9/12，撞大一家聚，改週四）；捐血車第 7 週週二三 10:00–16:00（上下學期）；
//      期中電影夜第 10 週週四 19:00–21:00 博思 101；校慶園遊會 11/15（六）10:00–16:00 椰影大道（別的週六沒有）。全部 story:false。
//   4. lateJoin（真的 classes3d.js＋clubfair3d.js 的參加流程）：大一上第 5 週社課結束時問、選「填」＝CLUB_<id>；系籃顯示「系籃隊長」「隊費下次再收」、開頭不演「你在門口填了表」那段；
//      第 5 週「先不要」＝不是社員、最後一句「沒關係，下禮拜還可以來。」；第 6 週再問、「先不要」＝「好，那有空再來玩。」；第 7 週去＝不再問、不自動入社（旁聽）；
//      第 7 週以後才第一次去（沒被問過）＝照舊第一次去就入社（AA_485 3-4 的門口那句）；社博已經填過的不問。
//   5. 特殊活動參加：迎新派對大一＝三句旁白、快轉到 21:30、不說「你找了位子坐下」；大二、大三各一句 narrLater、大四只有「派對結束了。」；
//      校慶園遊會不開社博的十五攤選單、吉他社社員第 2 句換句；捐血車捐過以後隔天「上次捐血還不到兩個月。」、下學期第 7 週可以再捐；期中電影夜坐在博思 101 可以聽（atSeat）。
//   6. 舊存檔：沒有 G.acts、沒有 G.flags 也不出錯（公告欄、lateJoin 判斷、特殊活動旁白）。
// 修改前（dcc9276f8）跑這支：見 commit 訊息（BB_ROOT=<舊版的資料夾> 可以指定程式從哪裡讀）。
// 用法：node tests/bulletin_board_1110_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=process.env.BB_ROOT?path.resolve(process.env.BB_ROOT):path.resolve(__dirname,'..'), REPO=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const tryv=(f,d)=>{ try{ return f(); }catch(e){ return d; } }, run=async f=>{ try{ await f(); }catch(e){} };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const J=JSON.stringify;

// ---------- AA_737（git show）----------
let AA=null; try{ AA=JSON.parse(cp.execSync('git show 3630810aa:docs/story_planning/AA_737_bulletin_board.json',{cwd:REPO,encoding:'utf8',stdio:['ignore','pipe','ignore']})); }catch(e){ AA=null; }
check('0. 讀得到 AA_737（企劃線 3630810aa；沒有就先 git fetch origin claude/story-planning）',!!AA);
if(!AA){ console.log('FAILED '+fails); process.exit(1); }
const q=(s,re)=>{ const m=String(s).match(re); return m?m[1]:null; };
/* 2026-11-12：法服那一張招生海報不再照 AA_737。AA_701 第 3 節第 6 點（企劃線 a21a9ddc6，AA-C 回 LAWWW-C：「`activities.js` 法服海報完整新句」——法服不是隔週，是有民眾預約的週六）給了 text、textLater 兩句完整新句，
   遊戲 7e404a6220（2026-11-12 10:22 UTC）照它改了 src/data/activities.js 的 RECRUIT.posters（lawclub_study）；AA_737 那一份 JSON（3630810aa）沒有跟著改，還是「隔週週六上午…」。
   所以這裡的期望＝AA_737 的五張，法服那一張換成 AA_701@a21a9ddc6 第 3 節第 6 點的兩句（git show 逐字讀，不在測試裡另外寫一份）。其他四張照舊逐字對 AA_737。
   舊期望（到 7e404a6220 以前）：五張全部照 AA_737（法服「法律服務社（法服）招新｜隔週週六上午在法律系館B一樓接民眾諮詢，大一跟著學長姊做接待。報名：…」）。*/
const AA701_SHA='a21a9ddc6', AA701_DOC='docs/story_planning/AA_701_社團布告欄_活動時間與怎麼加入.md';
let LAW701=null; try{ const doc=cp.execSync('git show '+AA701_SHA+':'+AA701_DOC,{cwd:REPO,encoding:'utf8',stdio:['ignore','pipe','ignore']}), i=doc.indexOf('6. `activities.js` 法服海報完整新句'), sec=i>=0?doc.slice(i):'';
  const t=q(sec,/^\s*- text：(.+)$/m), tl=q(sec,/^\s*- textLater：(.+)$/m); if(t&&tl) LAW701={text:t.trim(),textLater:tl.trim()}; }catch(e){ LAW701=null; }
check('0. 讀得到 AA_701 第 3 節第 6 點的法服海報兩句（企劃線 '+AA701_SHA+'；沒有就先 git fetch origin claude/magical-albattani-bk7b4n）',!!LAW701);
if(!LAW701){ console.log('FAILED '+fails); process.exit(1); }
const POSTERS=AA.recruit.posters.map(p=>p.club==='lawclub_study'?Object.assign({},p,LAW701):p);   /* 這支測試拿來比的五張 */
check('0. AA_737 的五張裡法服是最後一張、舊句寫「隔週」；AA_701 的新句不寫「隔週」、兩句只差報名的地方（其他四張 AA_701 沒有動）',AA.recruit.posters.length===5&&AA.recruit.posters[4].club==='lawclub_study'&&/隔週/.test(AA.recruit.posters[4].text)&&!/隔週/.test(LAW701.text+LAW701.textLater)&&LAW701.text.startsWith('法律服務社（法服）招新｜')&&LAW701.text.split('報名：')[0]===LAW701.textLater.split('報名：')[0]);

// ---------- 載入（真的 story3d、classes3d、clubfair3d）----------
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''}; console.warn=()=>{};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|COURSES|CLS|ACTIVITIES|CLUB_FAIR|CLUBFAIR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js','src/classes3d.js','src/data/club_fair.js','src/clubfair3d.js']) load(f);
const A=id=>ACTIVITIES.list.find(a=>a.id===id);
const pages=(G,zone)=>tryv(()=>ACTIVITIES.boardPages(G,zone),null)||[tryv(()=>ACTIVITIES.posterText(G,zone),'')];   /* 修改前沒有 boardPages：用 posterText 比 */
const text=(G,zone)=>tryv(()=>ACTIVITIES.posterText(G,zone),'');
const gB=(k,h,o)=>Object.assign({day:dayOf(k),hour:h==null?9:h,flags:{},stage:'law'},o||{});

// ---------- 0. 逐字 ----------
{ const B=ACTIVITIES.BOARD||{}; check('0. 本週公告：標題「'+AA.board.title+'」、三區區名、empty「'+AA.board.empty+'」',B.title===AA.board.title&&B.empty===AA.board.empty&&!!B.heads&&J([B.heads.clubs,B.heads.events,B.heads.recruit])===J(AA.board.sections.map(s=>s.head)),J(B));
  const R=ACTIVITIES.RECRUIT||{posters:[]}; check('0. 招生海報五張（text、textLater）逐字、順序同 AA_737；法服那一張照 AA_701 第 3 節第 6 點（'+AA701_SHA+'）（舊期望：五張全照 AA_737）',J((R.posters||[]).map(p=>[p.club,p.text,p.textLater]))===J(POSTERS.map(p=>[p.club,p.text,p.textLater])),J((R.posters||[]).map(p=>p.text).filter((t,i)=>t!==(POSTERS[i]||{}).text)));
  const L=ACTIVITIES.LATE_JOIN||{}, LL=AA.recruit.lateJoin.lines, note=AA.recruit.lateJoin.note;
  check('0. lateJoin 五句逐字（旁白、社長、選項「填／先不要」、填了、先不要）',L.narr===LL[0].text&&L.who===LL[1].who&&L.ask===LL[1].text&&J(L.opts)===J(LL[2].choice)&&L.yes===LL[3].text&&L.no===LL[4].text,J(L));
  const ballYes=LL[3].text.replace('社費下次再收',q(note,/「社費下次再收」系籃改「(.+?)」/));
  check('0. lateJoin 系籃：說話的人「'+q(note,/顯示成「(.+?)」/)+'」、「'+ballYes+'」；第 6 週「先不要」：「'+q(note,/最後一句改：「(.+?)」/)+'」',!!L.by&&!!L.by.dept_basketball&&L.by.dept_basketball.who===q(note,/顯示成「(.+?)」/)&&L.by.dept_basketball.yes===ballYes&&L.no6===q(note,/最後一句改：「(.+?)」/),J(L.by)+' '+L.no6);
  check('0. lateJoin 的四個社團、大一上第 5、6 週',J(L.clubs)===J(['club_guitar','club_debate','club_hiking','dept_basketball'])&&L.term==='Y1S1'&&J(L.weeks)===J([5,6]));
  const bad=[]; for(const e of AA.specialEvents.events){ const a=A(e.id); if(!a){ bad.push(e.id+' 沒有'); continue; }
    for(const k of ['title','kind','zone','roomName','verb','desc']) if(e[k]!=null&&a[k]!==e[k]) bad.push(e.id+'.'+k+'='+a[k]);
    if(e.room&&a.room!==e.room) bad.push(e.id+'.room'); if(J(a.narr)!==J(e.narr)) bad.push(e.id+'.narr'); if(e.narrLater&&J(a.narrLater)!==J(e.narrLater)) bad.push(e.id+'.narrLater');
    if(!a.poster||a.poster.daysBefore!==e.poster.daysBefore) bad.push(e.id+'.poster'); if(a.story!==false) bad.push(e.id+'.story');
    const tm=q(e.when,/(\d{2}:\d{2})–(\d{2}:\d{2})/), t1=q(e.when,/\d{2}:\d{2}–(\d{2}:\d{2})/); if(tm&&ACTIVITIES.hhmm(a.t0)!==tm) bad.push(e.id+'.t0'); if(t1&&ACTIVITIES.hhmm(a.t1)!==t1) bad.push(e.id+'.t1'); }
  check('0. 四個特殊活動：id、標題、類別、區域、地點名稱、按鈕的字、說明、旁白、海報天數、時間逐字對 AA_737、story:false',!bad.length,bad.join('｜'));
  const pe=AA.specialEvents.events.find(e=>e.id==='su_welcome_party'), bd=AA.specialEvents.events.find(e=>e.id==='blood_drive'), sf=AA.specialEvents.events.find(e=>e.id==='school_fair');
  check('0. 派對用完那句「'+q(pe.noteNarr,/只顯示「(.+?)」/)+'」、捐血那句「'+q(bd.rule,/按鈕旁說「(.+?)」/)+'」、吉他社社員那句',!!A('su_welcome_party')&&A('su_welcome_party').endLater===q(pe.noteNarr,/只顯示「(.+?)」/)&&!!A('blood_drive')&&A('blood_drive').gapText===q(bd.rule,/按鈕旁說「(.+?)」/)&&A('blood_drive').gapMonths===2&&!!A('school_fair')&&!!A('school_fair').narrAlt&&A('school_fair').narrAlt[1].text===q(sf.noteClub,/換成「(.+?)」/)&&A('school_fair').narrAlt[1].flag==='CLUB_club_guitar'); }

// ---------- 1. 三區格式 ----------
{ const P=pages(gB('2025-11-03'));
  check('1. 第一頁：「本週公告　11/3（一）～11/9（日）」',P[0]==='本週公告　11/3（一）～11/9（日）',P[0]);
  const cl=P.find(p=>p.startsWith('【社課】'))||'';
  check('1. 社課一區：「吉他社　每週一、三 19:00–21:00　法律系館B 多功能教室」（同 AA_737 clubExample，一週兩天合成一行）',cl.split(/[】；]/).includes(AA.board.lineFormat.clubExample),cl);
  check('1. 社課一區：辯論社、登山社各一行；系籃那一行後面加「（下雨改新體育館一樓走廊）」',cl.includes('辯論社　每週二 19:00–21:00　博思 201')&&cl.includes('登山社　每週四 19:30–21:00　普通 201')&&/系籃（系學會）　每週五 17:30–19:00　籃球場（映月湖東側）（下雨改新體育館一樓走廊）/.test(cl),cl);
  check('1. 社課只列一般社團（story:false）：公法讀書會（以安的劇情）、停用的法服讀書會不列',!/公法讀書會|法服讀書會/.test(cl),cl);
  const ev=pages(gB('2025-09-08')).find(p=>p.startsWith('【演講・活動】'))||'';
  check('1. 演講・活動一行：「'+AA.board.lineFormat.eventExample+'」（同 AA_737 eventExample；3630810aa 改成 9/11（四））',ev.split(/[】；]/).includes(AA.board.lineFormat.eventExample),ev);
  const tm=pages(gB('2025-10-13')).find(p=>p.startsWith('【演講・活動】'))||''; check('1. 「明天」的寫法：10/13 看＝「明天 10:00–16:00　捐血車　學活前」',tm.split(/[】；]/).includes('明天 10:00–16:00　捐血車　學活前'),tm);
  const P2=pages(gB('2025-12-01')); check('1. 這週沒有演講、活動、招生（12/1）：那兩區整區不顯示、只有社課',P2.length===2&&P2[1].startsWith('【社課】')&&!P2.some(p=>/【演講・活動】|【社團招生】/.test(p)),J(P2));
  { const src=fs.readFileSync(path.join(ROOT,'src/teach3d.js'),'utf8'); check('1. 教學館的公告欄按下去＝一頁一頁看本週公告（teach3d.js 的公告欄 onInteract 讀 ACTIVITIES.boardPages；原本只有 4.6 秒的字幕）',/board:true[\s\S]{0,400}onInteract:async\(\)=>[\s\S]{0,400}ACTIVITIES\.boardPages\(GM\.G/.test(src)); }
  const e1=text(gB('2026-01-26')), e2=text(gB('2025-12-22'));
  check('1. 三區都沒有（寒假 1/26、期末後 12/22）：只有「'+AA.board.empty+'」；原本那句「目前沒有公告的演講或活動。」不再出現',e1===AA.board.empty&&e2===AA.board.empty&&!/目前沒有公告的演講或活動/.test(e1+e2),e1+' / '+e2); }

// ---------- 2. 招生海報 ----------
{ const has=(G,z)=>pages(G,z).some(p=>p.includes('吉他社招新｜')), full=t=>t.includes('第 5 週開始');
  const wk=['2025-09-01','2025-09-08','2025-09-15','2025-09-22','2025-09-29','2025-10-06'].map(k=>pages(gB(k)));
  check('2. 大一上第 1～6 週（9/1～10/6 的週一）：五張招生海報都貼、照大一上的全文（有「第 5 週開始」）',wk.every(P=>{ const i=P.findIndex(p=>p.startsWith('【社團招生】')); return i>0&&P.slice(i).length===5&&P[i]==='【社團招生】'+POSTERS[0].text&&P.slice(i+1).every((p,j)=>p===POSTERS[j+1].text); }),J(wk[0].slice(-5)));   /* 2026-11-12：法服那一張照 AA_701（POSTERS）；舊期望 AA.recruit.posters */
  check('2. 第 7 週（10/13）、第 7 週週日（10/19）：海報撤了',!has(gB('2025-10-13'))&&!has(gB('2025-10-19')));
  const y2=pages(gB('2026-09-21')); check('2. 大二上第 3 週（9/21）：貼 textLater（沒有「第 5 週開始」）；法服那一張是 AA_701 的 textLater（報名只剩法服桌）',y2.some(p=>p.endsWith(AA.recruit.posters[0].textLater))&&!y2.some(full)&&y2.some(p=>p===LAW701.textLater)&&!y2.some(p=>p===LAW701.text),J(y2.slice(-5)));
  check('2. 大一下第 2 週（3/2）沒有招生海報；經濟系那一年（2024-09-09）沒有',!has(gB('2026-03-02'))&&!has(gB('2024-09-09',9,{stage:'econ'})));
  const scr=pages(gB('2025-09-29'),'boya').join('｜'); check('2. 博思的講座資訊螢幕（zone＝boya）：不貼招生、社課只列博思的（辯論社），不列別棟的吉他社',!scr.includes('招新｜')&&scr.includes('辯論社　每週二')&&!scr.includes('吉他社　'),scr); }

// ---------- 3. 特殊活動在公告欄 ----------
{ const evs=k=>(pages(gB(k)).find(p=>p.startsWith('【演講・活動】'))||'');
  check('3. 學生會迎新派對（AA_737 7079841a7 改期望：原本第 2 週週五 9/12，撞大一家聚 → 週四）：大一上第 2 週週四 9/11 19:00–21:30 新體育館（9/8 那週的公告）；大二 9/17（9/14 看）；9/12 週五、第 3 週週四 9/18 沒有',evs('2025-09-08').includes('9/11（四） 19:00–21:30　學生會迎新派對　新體育館')&&evs('2026-09-14').includes('9/17（四） 19:00–21:30　學生會迎新派對　新體育館')&&!!A('su_welcome_party')&&!ACTIVITIES.on(A('su_welcome_party'),dayOf('2025-09-12'),{flags:{}})&&!ACTIVITIES.on(A('su_welcome_party'),dayOf('2025-09-18'),{flags:{}}),evs('2025-09-08')+' / '+evs('2026-09-14'));
  check('3. 捐血車：大一上第 7 週週二三（10/14、10/15）10:00–16:00 學活前；下學期第 7 週（4/7、4/8）也有；海報提前 5 天（10/8 看不到、10/9 看得到）',evs('2025-10-10').includes('10/14（二） 10:00–16:00　捐血車　學活前')&&evs('2025-10-10').includes('10/15（三） 10:00–16:00　捐血車　學活前')&&evs('2026-04-03').includes('4/7（二） 10:00–16:00　捐血車　學活前')&&!evs('2025-10-08').includes('捐血車')&&evs('2025-10-09').includes('捐血車'),evs('2025-10-10'));
  check('3. 學生會電影夜（AA_737 f02917295 改名；原期望「期中電影夜」）：大一上第 10 週週四 11/6 19:00–21:00 博思 101',evs('2025-11-03').includes('11/6（四） 19:00–21:00　學生會電影夜　博思 101'),evs('2025-11-03'));
  check('3. 校慶園遊會：11/15（六）10:00–16:00 椰影大道（11/10 看）；11/8（六）沒有',evs('2025-11-10').includes('11/15（六） 10:00–16:00　校慶園遊會　椰影大道')&&!!A('school_fair')&&!ACTIVITIES.on(A('school_fair'),dayOf('2025-11-08'),{flags:{}}),evs('2025-11-10'));
  check('3. 當天結束以後公告欄不再列（9/11 21:40 看不到迎新派對）',evs('2025-09-11').includes('今天 19:00–21:30　學生會迎新派對')&&!pages(gB('2025-09-11',21.7)).join('').includes('學生會迎新派對'),pages(gB('2025-09-11',21.7)).join('｜')); }

// ---------- 4、5. 參加流程（真的 classes3d.js、clubfair3d.js）----------
let G; const log=[], chose=[], caps=[]; let answers=[];
const GM={get G(){ return G; },E:{zone:null,interactables:[],npcs:[],player:{busy:false,obj:{position:{x:0,z:0}}}},D:{active:false},S:{},npc:{},
  sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.push([n?(n.name||n):null,t]); },toast(){},caption:(a,t)=>{ caps.push(t); },autosave(){},setGoal(){},
  choose:async o=>{ chose.push(o.map(x=>x.t)); return answers.length?answers.shift():0; },fade:async()=>{},sleep:async()=>{},advance(h){ G.hour+=h; },energy(){},money(){}};
const mkG=(key,h,o)=>{ const d=dayOf(key); G=Object.assign({day:d,hour:h,weekday:CALENDAR.dateOf(d).wd%7,stage:'law',zone:'campus',weather:'clear',flags:{introDone:true,afternoonDone:true,classDone:true,MET_ZHE:true},choices:{},events:{done:{},last:{},count:0},social:null,rel:{},energy:80,goal:'',goalDest:null},o||{}); SOCIAL.bind(G); EVENTS.bind(GM); return G; };
const reset=a=>{ log.length=0; chose.length=0; caps.length=0; answers=a||[]; };
const texts=()=>log.map(x=>x[1]), whoSaid=t=>{ const r=log.find(x=>x[1]===t); return r?r[0]:undefined; };
const LL=AA.recruit.lateJoin.lines, NO6='好，那有空再來玩。', BALL_YES='好，名字寫這裡。隊費下次再收。', DOORS=(CLUB_FAIR.DOOR_SAY_BY||{}).dept_basketball||[];
(async()=>{
  const ball=A('dept_basketball'), deb=A('club_debate');
  // 4a. 系籃第 5 週（10/3 週五）17:45：去練球 → 社課結束時問 → 填
  { mkG('2025-10-03',17.75); reset([0,0]); await run(()=>CLS.spotInteract(GM,ball));
    const T=texts(); check('4. 系籃第 5 週（10/3）還不是社員：社課結束時問（旁白、系籃隊長「'+LL[1].text+'」、選項「填／先不要」）',T.includes(LL[0].text)&&whoSaid(LL[1].text)==='系籃隊長'&&J(chose[1])===J(['填','先不要']),J([chose,log]));
    check('4. 選「填」＝CLUB_dept_basketball、系籃隊長「'+BALL_YES+'」；開頭不演門口那段（「'+(DOORS[1]||[])[1]+'」）',G.flags.CLUB_dept_basketball===true&&whoSaid(BALL_YES)==='系籃隊長'&&!T.includes((DOORS[1]||[])[1])&&G.flags.CLUB_LATE_dept_basketball===5,J(log));
    check('4. 問在社課結束時：旁白在「社課結束了。」的字幕之前、時間已經到 19:00',caps[caps.length-1]==='社課結束了。'&&Math.abs(G.hour-19)<0.01); }
  // 4b. 辯論社第 5 週「先不要」→ 第 6 週再問「先不要」→ 第 7 週旁聽
  { mkG('2025-09-30',18.9,{zone:'boya'}); reset([1]); await run(()=>CLS.attendActivity(GM,deb));
    check('4. 辯論社第 5 週（9/30）：社長問、選「先不要」＝不是社員、社長「'+LL[4].text+'」',whoSaid(LL[1].text)==='社長'&&!G.flags.CLUB_club_debate&&whoSaid(LL[4].text)==='社長'&&G.flags.CLUB_LATE_club_debate===5,J([chose,log]));
    const flags=G.flags, acts=G.acts; mkG('2025-10-07',18.9,{zone:'boya'}); G.flags=Object.assign(flags,{}); G.acts=acts; reset([1]); await run(()=>CLS.attendActivity(GM,deb));
    check('4. 第 6 週（10/7）再去：再問一次；「先不要」＝「'+NO6+'」',texts().includes(LL[0].text)&&whoSaid(NO6)==='社長'&&!G.flags.CLUB_club_debate&&G.flags.CLUB_LATE_club_debate===6,J(log));
    const f2=G.flags, a2=G.acts; mkG('2025-10-14',18.9,{zone:'boya'}); G.flags=f2; G.acts=a2; reset([]); await run(()=>CLS.attendActivity(GM,deb));
    /* 2026-11-10 改期望（AA_737 f02917295 第 3 點：選「先不要」不鎖）：原本「第 7 週再去＝旁聽、不自動入社、不演門口那句」；現在跟從沒去過的人一樣照 AA_485 3-4 一去就入社＋門口那句，不再問 */
    check('4. 第 7 週（10/14）再去：不再問；照 AA_485 3-4 一去就入社（CLUB_）、演「你在門口填了表」',!texts().includes(LL[0].text)&&!!G.flags.CLUB_club_debate&&texts().includes(CLUB_FAIR.DOOR_LINE)&&chose.length===0,J([chose,log])); }
  // 4c. 第 7 週以後才第一次去（沒被問過）：照舊第一次去就入社（門口那句）
  { mkG('2025-10-14',18.9,{zone:'boya'}); reset([]); await run(()=>CLS.attendActivity(GM,deb));
    check('4. 第 7 週才第一次去（沒被問過）：照舊入社（CLUB_club_debate）、門口那句「'+CLUB_FAIR.DOOR_LINE+'」、不問',G.flags.CLUB_club_debate===true&&texts().includes(CLUB_FAIR.DOOR_LINE)&&!texts().includes(LL[0].text),J(log)); }
  // 4d. 社博填過的不問；同一週第二次不問
  { mkG('2025-09-30',18.9,{zone:'boya'}); G.flags.CLUB_club_debate=true; reset([]); await run(()=>CLS.attendActivity(GM,deb));
    check('4. 社博已經填過辯論社：第 5 週去不問',!texts().includes(LL[0].text)&&chose.length===0,J(log)); }
  // 5a. 迎新派對
  { mkG('2025-09-11',18.9,{zone:'gym'}); const pa=A('su_welcome_party'); reset([0]); await run(()=>CLS.spotInteract(GM,pa));
    const T=texts(); check('5. 迎新派對大一（9/11 18:54 在新體育館按集合點）：「去參加：學生會迎新派對」→ 快轉到 21:30 → 三句旁白照順序 → 活動結束了',(chose[0]||[])[0]==='去參加：學生會迎新派對'&&!!pa&&J(T.filter(t=>pa.narr.includes(t)))===J(pa.narr)&&Math.abs(G.hour-21.5)<0.01&&caps[caps.length-1]==='活動結束了。',J([chose,log,caps]));
    check('5. 站著的活動不說「你找了位子坐下」',!T.some(t=>/找了位子|輕輕坐下/.test(t)),J(T));
    const later=[]; for(const k of ['2026-09-17','2027-09-16','2028-09-14']){ const acts=G.acts; mkG(k,18.9,{zone:'gym'}); G.acts=acts; reset([0]); await run(()=>CLS.spotInteract(GM,pa)); later.push([texts().filter(t=>t.startsWith('（')),caps[caps.length-1]]); }
    check('5. 大二、大三：各一句 narrLater（照順序）；大四：沒有旁白、只顯示「派對結束了。」',!!pa&&J(later[0][0])===J([pa.narrLater[0]])&&J(later[1][0])===J([pa.narrLater[1]])&&later[2][0].length===0&&later[2][1]==='派對結束了。',J(later)); }
  // 5b. 校慶園遊會
  { const sf=A('school_fair'); const menu0=typeof CLUBFAIR!=='undefined'?CLUBFAIR.menu:null; let menuN=0; if(typeof CLUBFAIR!=='undefined') CLUBFAIR.menu=async()=>{ menuN++; return 0; };
    mkG('2025-11-15',10.2); reset([0]); await run(()=>CLS.spotInteract(GM,sf));
    check('5. 校慶園遊會（11/15 10:12）：「去逛：校慶園遊會」照一般活動參加（不開社博的十五攤選單）、三句旁白、快轉到 16:00',menuN===0&&(chose[0]||[])[0]==='去逛：校慶園遊會'&&!!sf&&J(texts().filter(t=>t.startsWith('（')))===J(sf.narr)&&Math.abs(G.hour-16)<0.01,J([menuN,chose,log]));
    mkG('2025-11-15',10.2); G.flags.CLUB_club_guitar=true; reset([0]); await run(()=>CLS.spotInteract(GM,sf));
    const alt=q(AA.specialEvents.events.find(e=>e.id==='school_fair').noteClub,/換成「(.+?)」/);
    check('5. 吉他社社員：第 2 句換成「'+alt+'」',!!sf&&texts().includes(alt)&&!texts().includes(sf.narr[1])&&texts().includes(sf.narr[0]),J(log));
    if(typeof CLUBFAIR!=='undefined') CLUBFAIR.menu=menu0; }
  // 5c. 捐血車兩個月
  { const bdv=A('blood_drive'); mkG('2025-10-14',10.5); reset([0]); await run(()=>CLS.spotInteract(GM,bdv));
    check('5. 捐血車（10/14 10:30）：「去捐血：捐血車」→ 兩句旁白',(chose[0]||[])[0]==='去捐血：捐血車'&&!!bdv&&J(texts().filter(t=>t.startsWith('（')))===J(bdv.narr),J([chose,log]));
    const acts=G.acts; mkG('2025-10-15',10.5); G.acts=acts; reset([0]); await run(()=>CLS.spotInteract(GM,bdv));
    check('5. 隔天（10/15）再按：不能參加、寫「捐血車：上次捐血還不到兩個月。」',chose.length===0&&caps[0]==='捐血車：上次捐血還不到兩個月。'&&!ACTIVITIES.canJoin(G,bdv),J([chose,caps]));
    mkG('2026-04-07',10.5); G.acts=acts; check('5. 下學期第 7 週（4/7）：隔了快六個月，可以再捐',!!bdv&&ACTIVITIES.canJoin(G,bdv)); }
  // 5d. 期中電影夜：坐在博思 101
  { mkG('2025-11-06',18.85,{zone:'boya'}); const m=tryv(()=>ACTIVITIES.atSeat(G,'boya','101'),null); check('5. 期中電影夜（11/6 18:51）：坐在博思 101 的位子上可以看（atSeat）',!!m&&m.id==='su_movie_night',m&&m.id); }
  // 6. 舊存檔
  { const old={day:dayOf('2025-10-03'),hour:17.75,stage:'law'}; let ok=true; try{ ACTIVITIES.boardPages(old); ACTIVITIES.posterText(old); ok=ACTIVITIES.lateJoinDue(old,ball)===true&&ACTIVITIES.noAutoJoin(old,ball)===true&&ACTIVITIES.lateDeclined(old,ball)===false; CLS.specialNarr(old,A('su_welcome_party')); ok=ok&&!!old.acts&&!!old.acts.narr; }catch(e){ ok=false; }
    check('6. 舊存檔（沒有 G.acts、沒有 G.flags）：公告欄、lateJoin 判斷、特殊活動旁白都不出錯（G.acts.narr 第一次用到時補上）',ok); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 參加流程出錯　'+String(e&&e.stack||e).split('\n').slice(0,3).join(' ')); process.exit(1); });

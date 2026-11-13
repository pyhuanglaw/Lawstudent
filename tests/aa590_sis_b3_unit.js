// AA_590 學姊（溫書瑀）改稿第三批：大一、大二事件（企劃線 68ceea665；AA 第 9 節審查、BB_235 口氣審 PASS、使用者 2026-11-02 18:2x 選擇題 11 題確認，第 10 節）——不需要瀏覽器。
//   0  讀稿：AA_590@68ceea665 讀得到；白名單 approved
//   1  表上每一列（數字列＋使用者改過的保104、保147）：「改成」一字不差在遊戲裡（第 57 列跟著第 55 列整段拿掉）；換掉的原句不在遊戲裡（retired 的兩場、別的句子的一部分、別的系統的同一句除外）
//   2  整場拿掉的兩場：空的保溫瓶（ev_sis_empty_flask，第 16 列）、等放榜看小說（ev_sis15_novel，第 28、29 列）＝retired、原本的那一天也不演；
//      舊存檔演過的：事件定義、記憶、flaskCoffeeDay 照留，熱水 W5「又遇到你了。」照演
//   3  第一次見面（第 71～77 列）：原句「喔，hi。」「開學還習慣嗎？」……，沒有新1；語尾三句改
//   4  成績那一則（第 55、56 列）：「放假了。有什麼打算？」四個選項依序回；不問成績、不記 TOLD_SCORE；下學期開學以後不演；沒有「回臺北」
//   5  選課（第 35 列、保147）：「這樣排可以。」、「那堂很好過。」→「好。」
//   6  研究所（保104、第 31 列）：新句、「研究所會等你」刪、事件標題「什麼時候開始」
//   7  畢業典禮（第 78、79 列）：「九月開學？」說話人「學姊的媽媽」、「來，拍一張。」刪過（AA_609 改給學姊的奶奶）、沒有爸爸
//   8  期末飯告白（第 80～82 列）：「（她笑了。）你確定？」→ BCG-44 →「我很難相處喔。」→「（她把便條收進口袋，把手伸給你。）走吧。」
// 修改前（int/next1102 48918ca20）：第 0 項白名單、第 1～8 項 FAIL。用法：node tests/aa590_sis_b3_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const A590=require('./aa590_doc.js');
const {check,GM}=H, ID='heroine_05', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa518_sis_b15_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ /* 和這一批無關的檔載不進來就略過 */ } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
/* 遊戲的原始碼（字串常數；註解拿掉）*/
const SRCS=ORDER.concat(['src/grades3d.js']).filter((f,i,a)=>a.indexOf(f)===i&&fs.existsSync(path.join(H.ROOT,f)));
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1');
const ALL=SRCS.map(f=>strip(fs.readFileSync(path.join(H.ROOT,f),'utf8'))).join('\n');
/* 閒聊（SMALLTALK，GM.say(who,…) 有名字說的）不加外面的「」（TEXT-QUOTE-UNIFY-1108 第四批，AA-B 11-08 05:31）：稿上「…」那一列，SMALLTALK 有拿掉外面那一對的那一句也算 */
const SMT=new Set(); if(typeof SMALLTALK!=='undefined') for(const id of Object.keys(SMALLTALK)) for(const e of SMALLTALK[id]) SMT.add(typeof e==='string'?e:e&&e.t);
const inGame=t=>ALL.includes("'"+t+"'")||ALL.includes('"'+t+'"')||(/^「[^「」]*」$/.test(t)&&SMT.has(t.slice(1,-1)));
/* 表的列 */
const ROWS=[]; for(const line of A590.DOC.split('\n')){ const m=line.match(/^\|\s*([0-9]+|保[0-9]+)\s*\|(.*)$/); if(!m) continue; const c=m[2].split('|').map(s=>s.trim()); if(c.length<4) continue; ROWS.push({n:m[1],where:c[0],who:c[1],old:c[2],nw:c[3],why:c[4]||''}); }
const keyOf=d=>CALENDAR.dateOf(d).key, wk=(t,w,wd)=>STORY.termDay(t,w,wd);

(async()=>{
await sec(0,()=>{ check('0. 讀得到 AA_590@68ceea665（第 10 節使用者確認）',A590.DOC.length>40000&&A590.DOC.includes('## 10. 使用者確認（2026-11-02 18:2x，選擇題 11 題）'));
  const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===A590.P);
  check('0. 白名單：AA_590@68ceea665 approved',A.length===1&&A[0].sha===A590.SHA&&A[0].status==='approved'&&!!A[0].approvedBy,J(A)); });

/* ---------- 1 表上每一列 ---------- */
await sec(1,()=>{
  const num=ROWS.filter(r=>/^[0-9]+$/.test(r.n)), del=num.filter(r=>r.nw.startsWith('（刪')), keep=num.filter(r=>!r.nw.startsWith('（刪'));
  check('1. 表：數字列 82 列（第 1～70 列＋第 71～82 列；其中刪句 5 列：第 16、28、29、31、79 列）',num.length===82&&J(del.map(r=>+r.n).sort((a,b)=>a-b))===J([16,28,29,31,79]),J([num.length,del.map(r=>r.n)]));
  /* 選項在遊戲裡帶「」或括號；她的話、旁白就是字串 */
  /* 第 57 列「好。有翻開就好。」：使用者 11-02 第 55 列改成不問成績，照級別回的那幾句（第 57 列、保289～保291）整段不再演，不在遊戲裡 */
  /* 第 24 列「又遇到你了。」（熱水 HELPED 那一句）：AA_595 跟著空保溫瓶那條線拿掉；第 66 列（期末飯她先說）：AA_591 第 11 節第 13 點「學姊不會先說」整支拿掉，第 8 節驗不在 */
  const miss=keep.filter(r=>r.n!=='57'&&r.n!=='24'&&r.n!=='66'&&!inGame(r.nw)&&!inGame(require('./aa959_map.js').map(r.nw,null,'heroine_05'))/* AA_959：之後又照覆寫表拿掉開頭「……」*/).map(r=>'#'+r.n+' '+r.nw);
  check('1. 每一列「改成」一字不差在遊戲裡（字串常數；第 57 列跟著第 55 列整段拿掉；第 24 列 AA_595 拿掉；第 66 列 AA_591 拿掉）',!miss.length&&!inGame('好。有翻開就好。')&&!inGame('下學期，我出難一點的題目給你。')&&!inGame('又遇到你了。'),J(miss));
  const P104='……其實一點都不早。真的想準備的人，有的大一就開始了。';
  const P104G=require('./line_rows_expect.js').fwd(P104,'src/data/sis_b4_events.js');   /* 2026-11-11（X324 G 區，AA_802_sis_b4_anyt.json@f2a55c1e7）：sis_b4_events.js 第 45 列拿掉句首「……」——表上（AA_590）照舊是 P104，遊戲裡是 AA_802 那一列的 new。舊期望：inGame(P104) */
  check('1. 保104、保147（使用者 11-02 選擇題改的兩列）：「'+P104G+'」（表上「'+P104+'」，X324 G 區拿掉句首「……」）「好。」在遊戲裡、表上一字不差',inGame(P104G)&&P104G!==P104&&ROWS.some(r=>r.n==='保104'&&r.nw===P104)&&ROWS.some(r=>r.n==='保147'&&r.nw==='好。')&&/\{label:'a'\},SIS\('好。'\)/.test(ALL));
  /* 原句不在遊戲裡：retired 的兩場（第 15、16、28、29 列）、原句是別的句子的一部分（第 7、15、17、73 列、第 71～74 列原句不改）、出現在別處的（第 53、54 列互相）除外 */
  /* 第 81 列的原句另在 confess_lines.js（另一套告白，不在 AA_590 範圍）、第 82 列「好。」到處都有 */
  const EXC=new Set(['7','15','16','17','28','29','71','72','73','74','78','79','80','81','82']);   /* 79：「來，拍一張。」AA_609（使用者 2026-11-03）改給學姊的奶奶、恢復 */
  const still=num.filter(r=>!EXC.has(r.n)&&r.old!==r.nw&&!r.nw.includes(r.old)&&inGame(r.old)).map(r=>'#'+r.n+' '+r.old);
  check('1. 換掉的原句不在遊戲裡（註解除外）',!still.length,J(still));
  check('1. 第 80 列「……我知道。」：期末飯 yes（學姊）不再用',!J(TERMEND_LINES.HEART.heroine_05.yes).includes('"……我知道。"'));
  check('1. 第 7 列：社博合併版「你好。」；第一次見面（第 71 列）照原句「（抬頭）喔，hi。」',ev('ev_sis_club_expo').dialogue.some(l=>l.speaker===ID&&l.text==='你好。')&&!ev('ev_sis_club_expo').dialogue.some(l=>l.text==='喔，hi。')&&ev('ev_sis_w1').dialogue.some(l=>l.text==='（抬頭）喔，hi。'));
  check('1. 第 17 列：一起念書的日常②「可以念給我聽嗎？」（阿嬤、芷若的「念給我聽」照舊）',/\[ID,'可以念給我聽嗎？'\]/.test(ALL)&&!/\[ID,'念給我聽。'\]/.test(ALL)&&ALL.includes('我孫子念給我聽。')); });

/* ---------- 2 整場拿掉的兩場 ---------- */
await sec(2,async()=>{
  const ef=ev('ev_sis_empty_flask'), nv=ev('ev_sis15_novel');
  check('2. 空的保溫瓶、等放榜：還在 STORY_EVENTS（舊存檔）但 retired（寫了 AA_590 和原因）',!!ef&&!!nv&&/AA_590/.test(String(ef.retired))&&/AA_590/.test(String(nv.retired)),J([ef&&ef.retired,nv&&nv.retired]));
  /* 原本會演的那一刻 */
  H.fresh(keyOf(wk('Y1S1',8,2)),15,'lawlib'); H.FAMILIAR(ID); const a=EVENTS.check(ef);
  H.fresh('2026-03-04',19.5,'lawlib',{met_sis:true,SIS_W1:true}); H.FAMILIAR(ID); const b=EVENTS.check(nv);
  check('2. 大一上第 8 週週二 15:00 法圖有點熟（空的保溫瓶原本的時段）、2026-03-04 19:30 法圖（等放榜那一天）：都不演',a===false&&b===false,J([a,b]));
  check('2. 定義留給舊存檔：空的保溫瓶的選項與記憶、flaskCoffeeDay 照舊（「已裝滿」AA_595 3-13 也 retired，定義照留）',J(ef.dialogue).includes('flaskCoffeeDay')&&J(ef.dialogue).includes('HELPED')&&!!ev('ev_sis_flask_full')&&/AA_595/.test(String(ev('ev_sis_flask_full').retired)));
  /* 舊存檔：演過空的保溫瓶、選黑咖啡（HELPED）→ 熱水那一場照演，可是 W5「又遇到你了。」（原「上次是黑咖啡」）AA_595 第 3 節跟著那條線拿掉 */
  H.fresh(keyOf(wk('Y1S1',14,2)),21.6,'lawlib',{SIS_STUDY:true}); H.FAMILIAR(ID); H.G.events.done.ev_sis_empty_flask=1; SOCIAL.remember(ID,'HELPED','空的保溫瓶，買了黑咖啡');
  H.said=[]; H.picks=[0]; await EVENTS.run(ev('ev_sis_hot_water')); const L=H.said.map(s=>s.t);
  check('2. 舊存檔（演過、選了黑咖啡）：熱水「我陪妳等熱水。」→ 陪她等 →「謝謝。明天八點，一樣的位子？」；沒有「又遇到你了。」（AA_595）',J(H.opts[0])===J(['「我陪妳等熱水。」','「我請妳喝一罐。」'])&&L.includes('（她按了下去。飲水機的熱水出得很慢，你站在旁邊陪她等。）')&&L.indexOf('又遇到你了。')<0&&L.includes('謝謝。明天八點，一樣的位子？')&&H.G.flags.HOT_WATER===true,J([L,H.opts]));
  H.fresh(keyOf(wk('Y1S1',14,2)),21.6,'lawlib',{SIS_STUDY:true}); H.FAMILIAR(ID); H.said=[]; H.picks=[0]; await EVENTS.run(ev('ev_sis_hot_water'));
  check('2. 新存檔（沒有那一場）：熱水沒有「又遇到你了。」',!H.has('又遇到你了。')&&H.has('謝謝。明天八點，一樣的位子？'));
  let threw=null; try{ SOCIAL.noteShown(ID,{tag:'HELPED',note:'空的保溫瓶，買了黑咖啡'}); }catch(e){ threw=String(e); }
  check('2. 舊存檔的記憶在人物面板照常處理（retired 的備註只顯示標籤，不丟例外）',threw===null,threw); });

/* ---------- 3 第一次見面 ---------- */
await sec(3,()=>{ const T=ev('ev_sis_w1').dialogue.filter(l=>l.text).map(l=>l.text);
  const want=['（抬頭）喔，hi。','開學還習慣嗎？','還可以。','民法你選哪個老師？','周老師。','周老師很熱門。位置要很早去佔。','真的，前一堂課就要去佔了。'];
  const i=T.indexOf(want[0]);
  check('3. 第 71～75 列：照原句（使用者 11-02 選「第一次見面用原句」），沒有新1「（她又低下頭。過了一下才抬頭。）」「……有什麼事嗎？」；第 75 列語尾拿掉',i>=0&&J(T.slice(i,i+want.length))===J(want)&&!T.some(t=>/有什麼事嗎|又低下頭/.test(t)),J(T));
  check('3. 第 76、77 列：「（笑了一下）對。我要去圖書館了。有問題再私訊我。」（台階、Café）、「（笑了一下）對。有問題再私訊我。」（閱覽室、大廳自習區）',T.includes('（笑了一下）對。我要去圖書館了。有問題再私訊我。')&&T.includes('（笑了一下）對。有問題再私訊我。')&&!T.some(t=>/就是這樣/.test(t))); });

/* ---------- 4 成績那一則 ---------- */
await sec(4,async()=>{ const OPTS=['在家讀書。','出去玩。','還沒想。','不說。'], REP=['好。','好啊。','那就先睡飽。','好。那不問了。'];
  check('4. 稿：第 55 列「放假了。有什麼打算？」、選項與依序的回覆一字不差在 AA_590 第 55 列備註',A590.has('放假了。有什麼打算？')&&A590.DOC.includes('選項換成「'+OPTS.join('／')+'」，她依序回'+REP.map(t=>'「'+t+'」').join('')));
  const setScore=(G,t,n)=>{ const R=CLS.rec(G); R.exam=R.exam||{}; for(const c of CLS.termCourses(G,t)){ if(CLS.isExamCourse(c)) R.exam[t+':'+c.id+':final']={status:'done',correct:n}; if(CLS.attCourse(c)) R.attend[c.id]=3; } };
  const got=[]; for(let k=0;k<4;k++){ const G=H.fresh('2026-01-06',15,'library',{}); setScore(G,'Y1S1',k===3?0:5); H.FAMILIAR(ID); H.said=[]; H.opts=[]; H.picks=[k]; await GRADES.preTalk(GM,{name:ID},ID); got.push([H.said.map(s=>s.t),H.opts[0],SOCIAL.has(ID,'TOLD_SCORE')]); }
  check('4. 四個選項依序回「好。」「好啊。」「那就先睡飽。」「好。那不問了。」；不問成績、不記 TOLD_SCORE（成績高、被當都一樣）',got.every((g,k)=>J(g[0])===J(['放假了。有什麼打算？',REP[k]])&&J(g[1])===J(OPTS)&&g[2]===false),J(got));
  const G=H.fresh(keyOf(CALENDAR.termDays('Y1S2').from+3),15,'library',{}); setScore(G,'Y1S1',5); H.FAMILIAR(ID); H.said=[]; H.picks=[0]; await GRADES.preTalk(GM,{name:ID},ID);
  check('4. 下學期開學以後（大一下第 1 週週四）：她不問「放假了」',!H.has('放假了。有什麼打算？')&&GRADES.windowTerm(G)==='Y1S1',J(H.said));
  const gsrc=fs.readFileSync(path.join(H.ROOT,'src/grades3d.js'),'utf8');
  check('4. 不寫「回臺北」（使用者 11-02：祐廷和學姊都住臺北、學校也在臺北）；舊句「成績出來了。三個字以內。」「好。不說也是一種答案。」不在遊戲',!/回臺北|回台北/.test(gsrc)&&!inGame('成績出來了。三個字以內。')&&!inGame('好。不說也是一種答案。')); });

/* ---------- 5 選課 ---------- */
await sec(5,async()=>{ const e=ev('ev_sis_course_y2'); H.fresh('2026-08-14',15,'cafe'); H.FAMILIAR(ID); H.said=[]; H.picks=[0]; await EVENTS.run(e); const L=H.said.map(s=>s.t);
  check('5. 第 35 列、保147：「這樣排可以。」→ 選項「債總一定要周老師那班嗎？」（AA 2026-11-02 20:26 改，原「那堂很好過。」）→「不一定。可是你會想上他的課。」（不提那堂通識、不提出席紀錄；祐廷「……沒有。」刪）',L.includes('這樣排可以。')&&L[L.indexOf('這樣排可以。')+1]==='不一定。可是你會想上他的課。'&&!L.includes('……沒有。')&&J(H.opts[0])===J(['「債總一定要周老師那班嗎？」','「妳大二修了什麼？」'])&&!L.some(t=>/通識|出席|起不來/.test(t)),J(L)); });

/* ---------- 6 研究所 ---------- */
await sec(6,async()=>{ const e=ev('ev_sis_adv_grad'); H.fresh(keyOf(wk('Y1S2',8,3)),15,'cafe'); H.FAMILIAR(ID); H.said=[]; H.picks=[1]; await EVENTS.run(e); const L=H.said.map(s=>s.t);
  check('6. 保104、第 31 列：「大三。」→「其實一點都不早。真的想準備的人，有的大一就開始了。」→ 選項；沒有「研究所會等你」「太早了」',L[L.indexOf('大三。')+1]==='其實一點都不早。真的想準備的人，有的大一就開始了。'&&!L.some(t=>/研究所會等你|太早了|重點是/.test(t)),J(L));   /* 2026-11-11（X324 G 區，AA_802_sis_b4_anyt.json@f2a55c1e7）：sis_b4_events.js 句首「……」拿掉、遊戲照新句。舊期望：「……其實一點都不早。真的想準備的人，有的大一就開始了。」 */
  check('6. 事件標題「什麼時候開始」（使用者 11-02）',e.title==='什麼時候開始'&&A590.DOC.includes('事件標題「研究所會等你」改成「什麼時候開始」')); });

/* ---------- 7 畢業典禮 ---------- */
await sec(7,()=>{ const e=ev('ev_sis_graduation'), D=e.dialogue.filter(l=>l.text);
  check('7. 第 78、79 列（決2 乙；AA_609 第 6 節）：「九月開學？」說話人「學姊的媽媽」、「（媽媽笑了。）」接在她回答後面、「來，拍一張。」改給「學姊的奶奶」；整場沒有爸爸',D[0].speaker==='學姊的媽媽'&&D[0].text==='九月開學？'&&D[1].text==='九月。……開學前，我想先睡一個禮拜。'&&D[2].text==='（媽媽笑了。）'&&D[3].speaker==='學姊的奶奶'&&D[3].text==='來，拍一張。'&&!D.some(l=>/爸/.test(String(l.speaker))),J(D.map(l=>[l.speaker,l.text]))); });

/* ---------- 8 期末飯告白 ---------- */
await sec(8,()=>{ const Y=TERMEND_LINES.HEART.heroine_05.yes, s=Y.map(x=>typeof x==='string'?x:(x.cg?'CG:'+x.cg:(x.narr?'N:'+x.narr:J(x))));
  check('8. 第 80～82 列（決3 乙）：便條旁白 →「（她笑了。）你確定？」→ BCG-44 →「我很難相處喔。」→「（她把便條收進口袋，把手伸給你。）走吧。」→ 便條旁白；不加祐廷「我確定。」',
    J(s)===J(['N:（她手上拿著一張摺過的小便條。從吃飯的時候就一直拿著。）','（她笑了。）你確定？','CG:cg_three_things_heroine05','我很難相處喔。','（她把便條收進口袋，把手伸給你。）走吧。','N:（便條上寫的字，她一句都沒有念。）']),J(s));
  check('8. 她主動說的那一版（第 66 列）：AA_591 第 11 節第 13 點（使用者「學姊不會先說」）整支拿掉——沒有 she、she2，「我原本想講得比較好。」「……我喜歡你。」都不在',TERMEND_LINES.HEART.heroine_05.she===undefined&&TERMEND_LINES.HEART.heroine_05.she2===undefined&&!inGame('我原本想講得比較好。')&&!J(TERMEND_LINES.HEART.heroine_05).includes('……我喜歡你。')); });

H.done();
})();

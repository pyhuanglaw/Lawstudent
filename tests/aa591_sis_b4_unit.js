// AA_591 學姊（溫書瑀）改稿第四批：大三、大四、畢業以後（企劃線 6b35748c7；AA 第 9 節審查、BB_237 口氣審 PASS、使用者 2026-11-02 18:5x 起選擇題 14 題確認，第 11 節）
//   ＋AA 對 AA_584 的補充（2026-11-02 19:19：交往中「林{name}」、sis3h、208 剪報、修正本私訊、family_context）——不需要瀏覽器。
//   0  讀稿：AA_591@6b35748c7 讀得到、第 11 節在；白名單 approved（task AA591-SIS-B4-1102）
//   1  表上每一列：數字列的「改成」一字不差在遊戲裡（刪句除外）；換掉的原句不在遊戲裡（別人的句子、retired 的定義、別的系統的同一句除外）；
//      第 11 節改過的保71（情人節「沒照計畫走。……可是這樣很好。」）、第 108 列（討親親）、第 115 列（「厲害吧。」）、第 183 列（照原句）
//   2  retired：你的大四你自己排（ev_sis_adv_y4，第 23～25 列）、她爸爸的晚餐（ev_sis_y4_father，決1）、208 剪報（ev_us208_clipping，決2；七場變六場）——
//      定義留著（舊存檔）、不再觸發；3/14 書桌夜沒有爸爸那一段、3/14 21:00 不傳爸爸的邀約；畢業典禮沒有她爸爸；出來走一圈沒有剪報段
//   3  場景：樓梯間（第 191、192 列：只剩「（她看到你，點了一下頭，就上樓了。）」）、第二次訪談交往中靠肩膀（決6）、口試（決5，沒有「手在抖」）、
//      畢業典禮交往中先抱一下（決9）、大峽谷祐廷先說（決4）
//   4  學姊不先告白（第 11 節第 13 點）：大峽谷不說話＝什麼都沒發生、不交往；期末飯（AA_590）、畢業那天（保630、631）祐廷「（先不說）」＝什麼都沒發生；
//      重新開始那一版沒有「這次，我選你。」；多段感情 Byes 沒有「我還是喜歡你。」；這幾句都不在遊戲裡
//   5  林{name}：只有她說、只有交往中；分手以後、沒交往、別人說照舊；不重複加姓；對話框（game3d.js showLine）、手機（她的訊息）都接
//   6  AA 對 AA_584 的補充：sis3h、修正本私訊、family_context、us208 沒有 heardClip
//   7  AA 2026-11-02 20:26 定稿：選課分支 a、告白「收進口袋」不重複、confess_lines 拿掉「你上次說的，我有記得。」、爸爸（THERMOS.father／fatherGrad）舊存檔旗標不壞、sis_no_three 例外
// 修改前（int/m590 0e11c43a3，實測）：46 項 FAIL、7 項 PASS（讀稿、表的列數、沒改的第 183 列、照舊的兩條路線：訪談沒交往／選原子筆、祐廷先說的期末飯與大峽谷交往）。用法：node tests/aa591_sis_b4_unit.js
// AA_609（使用者 2026-11-03：學姊的爸爸改成奶奶）：第 2 節的她爸爸的晚餐、208 剪報、出來走一圈的剪報段、第 7 節的 fatherGrad 改成她奶奶恢復——這裡改成驗「不 retired、沒有爸」，細節在 tests/aa609_sis_grandma_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const A591=require('./aa591_doc.js');
const {check,GM}=H, ID='heroine_05', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ /* 和這一批無關的檔載不進來就略過 */ } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
if(typeof PG!=='undefined'&&PG.patchTermend) PG.patchTermend();
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
/* 遊戲的原始碼（字串常數；註解拿掉）*/
const SRCS=ORDER.filter((f,i,a)=>a.indexOf(f)===i&&fs.existsSync(path.join(H.ROOT,f)));
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1');
const RAW={}; for(const f of SRCS) RAW[f]=strip(fs.readFileSync(path.join(H.ROOT,f),'utf8'));
const ALL=Object.values(RAW).join('\n');
/* 字串常數裡（含 JSON 的 "…"、整句或句子的一段）：q＝整句、sub＝句子的一部分 */
const inGame=t=>ALL.includes("'"+t+"'")||ALL.includes('"'+t+'"');
const inAny=t=>ALL.includes(t);
const ROWS=[]; for(const line of A591.DOC.split('\n')){ const m=line.match(/^\|\s*([0-9]+|保[0-9]+|新[0-9]+)\s*\|(.*)$/); if(!m) continue; const c=m[2].split('|').map(s=>s.trim()); if(c.length<4) continue; ROWS.push({n:m[1],where:c[0],who:c[1],old:c[2],nw:c[3],why:c[4]||''}); }
const row=n=>ROWS.find(r=>r.n===String(n));
const said=()=>H.said.map(s=>s.t);
const setup=(key,h,zone,lv,flags)=>{ const G=H.fresh(key,h,zone||'dorm',Object.assign({met_sis:true,SIS_W1:true},flags||{})); if(lv) H[lv](ID); G.contacts=G.contacts||{}; G.contacts[ID]=G.day-30; G.outings=[]; if(STORY._bindGM) STORY._bindGM(GM); return G; };
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return said(); };
/* 選項：遊戲裡帶「」；表上有的抄了「」、有的沒抄 */
const OPT=new Set(['193','56','217']);

(async()=>{
await sec(0,()=>{ check('0. 讀得到 AA_591@6b35748c7（第 11 節使用者確認；最後一行「照第 11 節可以交 LAWWW」）',A591.DOC.length>100000&&A591.DOC.includes('## 11. 使用者確認')&&A591.DOC.includes('照第 11 節可以交 LAWWW'));
  const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===A591.P);
  /* AA_591 整合九件（AA 11-02 21:25）在同一個檔的最後一節（企劃線 43d27cd80）：白名單換到 43d27cd80，6b35748c7 留在 history */
  check('0. 白名單：AA_591@43d27cd80（history 有 6b35748c7）approved、task AA591-SIS-B4-1102',A.length===1&&A[0].sha==='43d27cd80'&&(A[0].history||[]).some(h=>h.sha===A591.SHA)&&A[0].status==='approved'&&!!A[0].approvedBy&&A[0].task==='AA591-SIS-B4-1102',J(A)); });

/* ---------- 1 表上每一列 ---------- */
await sec(1,()=>{
  const num=ROWS.filter(r=>/^[0-9]+$/.test(r.n)), del=num.filter(r=>r.nw.startsWith('（刪')), keep=num.filter(r=>!r.nw.startsWith('（刪'));
  check('1. 表：數字列 225 列；刪句 30 列（決1 第 206～216、222～225 列、決2 第 199～203 列、決3 第 194～198 列、第 23～25、191、192 列）',num.length===225&&del.length===30,J([num.length,del.length,del.map(r=>r.n)]));
  /* 「改成」在遊戲裡：選項帶「」（表上的選項也帶「」）；heard（第 heroine_circle 的整條字串）、地點字幕、人物近況是字串的一部分 */
  /* AA_600（企劃線 031414cad）再改過的兩列：第 68 列初雪「回去吧，會冷。」→ AA_600 3-5 的「……回去吧，會冷。」；第 171 列總圖門口的回覆＝AA_600 B6 整場只剩旁白 */
  const SUP600=new Set(['68','171']);
  /* 2026-11-11（X324 G 區，AA_802_sis_b4_anyt.json@f2a55c1e7 等逐行改稿）：「改成」那一句後來又被逐行改稿換過（第 7 列「……下次還坐這一班。」→ sis_b4_events.js 拿掉句首「……」）＝稿的 new 在遊戲裡也算（tests/line_rows_expect.js fwd）。舊期望：r.nw 本身在遊戲裡 */
  const LR=require('./line_rows_expect.js');
  const miss=keep.filter(r=>!SUP600.has(r.n)).filter(r=>!(inGame(r.nw)||(LR.fwd(r.nw)!==r.nw&&inGame(LR.fwd(r.nw)))||(OPT.has(r.n)&&inAny("'"+r.nw+"'"))||(/／/.test(r.nw)?r.nw.split('／').every(p=>inAny(p.trim())):false)||(/heroine_circle|social3d|loc30|APART|TELL/.test(r.where)&&inAny(r.nw)))).map(r=>'#'+r.n+' '+r.nw);
  check('1. 每一列「改成」一字不差在遊戲裡',!miss.length,J(miss));
  /* 換掉的原句不在遊戲裡：原句是別人的句子、到處都有的短句（「……好。」「好。」「過了。」「……謝謝。」等）、原句是改成的一部分、retired 的定義留著的除外 */
  /* 194～198、222～225：AA_609（使用者 2026-11-03）改成她奶奶恢復，原句（不含爸的那幾句）回到遊戲 */
  const RET=new Set(['194','195','196','197','198','222','223','224','225','23','24','25','199','200','201','202','203','206','207','208','209','210','211','212','213','214','215','216','193']);
  const shortOrShared=r=>r.old.length<=6||['9','17','22','37','52','53','57','58','75','78','85','86','95','103','117','126','142','154','172','175','205','218'].includes(r.n);
  const still=num.filter(r=>!SUP600.has(r.n)&&!RET.has(r.n)&&!shortOrShared(r)&&r.old!==r.nw&&!r.nw.includes(r.old)&&inGame(r.old)).map(r=>'#'+r.n+' '+r.old);
  check('1. 換掉的原句不在遊戲裡（註解、retired 的定義、到處都有的短句除外）',!still.length,J(still));
  /* 人工列逐一：只換表上那一處 */
  check('1. 第 193 列（決7）兩個人都喜歡：交往中選項「貝貝。」、沒交往「學姊。」；第 56 列美國廚房「貝貝，休息一下。」；第 217 列（決8）「對不起，我沒趕上。」',
    RAW['src/data/events.js'].includes("{text:'「貝貝。」',if:{flags:['dating_heroine_05']}")&&RAW['src/data/events.js'].includes("{text:'「學姊。」',unless:{flags:['dating_heroine_05']}")&&!RAW['src/data/events.js'].includes("{text:'「書瑀。」'")
    &&RAW['src/data/r2y4a_events.js'].includes("{text:'「貝貝，休息一下。」'")&&inAny("'「對不起，我沒趕上。」'")&&!inAny('對不起，我忘了時間。'));
  check('1. 第 52、53 列送機兩版「回到家，傳訊息給我。」、第 103 列接機兩版「剛好。」、第 117 列空白的一月兩處、第 142 列地點兩處：舊句都不在',
    !RAW['src/y34b3d.js'].includes("'……回到家，傳訊息給我。'")&&(RAW['src/y34b3d.js'].match(/'回到家，傳訊息給我。'/g)||[]).length===2&&!RAW['src/data/r2y4a_events.js'].includes("sis('……剛好。')")&&!inAny('回來以後開始看。……還沒看完。')&&!inAny('她上班的研究單位樓下'));
  check('1. 第 172 列人物近況「大學研究中心（助理）」、第 154 列事件標題「研究中心的回信」',RAW['src/social3d.js'].includes("heroine_05:[['2029-09-01','大學研究中心（助理）']]")&&ev('ev_sis16_job').title==='研究中心的回信');
  check('1. 保71（使用者 11-02）：情人節「沒照計畫走。……可是這樣很好。」，「我記一下。明年不要再這樣排。」不在；第 7 列「……下次還坐這一班。」',row('保71').nw==='沒照計畫走。……可是這樣很好。'&&inGame('沒照計畫走。……可是這樣很好。')&&!inAny('我記一下。明年不要再這樣排。')&&inGame('下次還坐這一班。')&&!inGame('……下次還坐這一班。'));   /* 2026-11-11（X324 G 區，AA_802_sis_b4_anyt.json@f2a55c1e7）：sis_b4_events.js 第 179 列拿掉句首「……」。舊期望：inGame('……下次還坐這一班。') */
  check('1. 第 108 列接機（使用者「討親親」）：「……還有。（她轉過頭看著你。）親一下。」只有戀人版；「……還有，我想你。」不在',/IF\(PV\('lover'\),sis\('……還有。（她轉過頭看著你。）親一下。'\)\)/.test(RAW['src/data/r2y4a_events.js'])&&!inAny('……還有，我想你。'));
  check('1. 第 115 列除夕（使用者：拍照說「厲害吧」；AA 11-02 21:25 九件第 2 件：照片開頭已經有，只留「厲害吧。」）：「厲害吧。」在、「（她傳來一張照片：一盤水餃。）厲害吧。」不在；「明年，你來包一顆。」不在',inAny("SIS('厲害吧。')")&&!inAny('（她傳來一張照片：一盤水餃。）厲害吧。')&&!inAny('明年，你來包一顆。'));
  check('1. 第 183 列 Café 改報告（使用者選原句）：「單位裡來了一個新人。他的報告我在改。」照舊',row(183).nw==='單位裡來了一個新人。他的報告我在改。'&&inGame('單位裡來了一個新人。他的報告我在改。'));
  check('1. 第 175 列：THERMOS「恭喜畢業。」（「畢業快樂。」只留在 ex 那一句）',POSTGRAD_LINES.THERMOS.lines.some(x=>x[0]===ID&&x[1]==='恭喜畢業。')&&!POSTGRAD_LINES.THERMOS.lines.some(x=>x[1]==='畢業快樂。')&&POSTGRAD_LINES.THERMOS.ex==='畢業快樂。');
  check('1. 第 17 列：十分鐘（日本）「你那邊十點了吧。」；第 37 列兩處（句子＋註解）',inGame('你那邊十點了吧。')&&!RAW['src/data/sis_b13_events.js'].includes("SIS('你那邊幾點？')")&&!inAny('很晚了。……明天中午，研究室。'));
});

/* ---------- 2 retired ---------- */
await sec(2,async()=>{
  const y4=ev('ev_sis_adv_y4'), fa=ev('ev_sis_y4_father'), cl=ev('ev_us208_clipping');
  /* AA_609（使用者 2026-11-03「學姊的爸爸可以都用奶奶取代嗎？」）：她爸爸的晚餐（決1）、208 剪報（決2）、出來走一圈的剪報段（決3）、畢業典禮的 fatherGrad 改成她奶奶、恢復——
     那幾場的驗法搬到 tests/aa609_sis_grandma_unit.js；這裡只留「你的大四」retired，和她奶奶那幾場的 retired 拿掉、沒有「爸」 */
  check('2. 你的大四 retired（寫了 AA_591）、定義留給舊存檔；她奶奶的晚餐、208 剪報 AA_609 恢復（不 retired）',!!y4&&!!fa&&!!cl&&/AA_591/.test(String(y4.retired))&&!fa.retired&&!cl.retired,J([y4&&y4.retired,fa&&fa.retired,cl&&cl.retired]));
  /* 你的大四：原本大三下第 11 週（5/2）在總圖跟她說話（熟悉）＝接演 */
  setup('2028-05-02',10,'library','FAMILIAR',{EXCHANGE_ROUTE:'TW'});
  const p=typeof SISB4!=='undefined'&&SISB4.preTalkEv?SISB4.preTalkEv(H.G):'(no SISB4)';
  check('2. 你的大四：大三下第 11 週在總圖找她說話不再接演（preTalkEv 不回 ev_sis_adv_y4）',p!=='ev_sis_adv_y4'&&p!=='(no SISB4)',J(p));
  check('2. 你的大四：EVENTS.check 也不演',EVENTS.check(y4)===false);
  check('2. 她奶奶的晚餐、208 剪報、出來走一圈（AA_609）：台詞沒有「爸」',![fa,cl,ev('ev_sis13_walk')].some(e=>/爸/.test(J(e.dialogue))));
  { const D=ev('ev_sis13_walk').dialogue, T=D.filter(l=>l.text).map(l=>l.text), i=T.indexOf('咖哩的「適量」，我改成兩匙了。我自己決定的。');
    check('2. 出來走一圈（決3 第 194～198 列，AA_609 第 5 節恢復成她奶奶）：咖哩那一句後面接「我奶奶寄了一份剪報給我。……」；沒有「他在關心妳。」',i>=0&&/^我奶奶寄了一份剪報給我。/.test(T[i+1])&&!J(D).includes('他在關心妳'),J(T.slice(i,i+3)));
    check('2. 私密話題名稱不提爸爸（privtalk3d.js sis13_walk）',/topic:'學姊論文卡住出來走一圈'/.test(RAW['src/privtalk3d.js']||fs.readFileSync(path.join(H.ROOT,'src/privtalk3d.js'),'utf8'))&&!/學姊爸爸的剪報/.test(fs.readFileSync(path.join(H.ROOT,'src/privtalk3d.js'),'utf8'))); }
});

/* ---------- 3 場景 ---------- */
await sec(3,async()=>{
  { const D=ev('ev_sis_ex_3').dialogue.filter(l=>l.text||l.choice);
    /* AA 九件第 3 件（11-02 21:25）：方向的兩句確認拿掉；再套 AA_600 B4（祐廷先問「最近好嗎？」，她「（點了一下頭）嗯。」）——原本「只有一句旁白」的期望照 AA 換 */
    check('3. 樓梯間（第 191、192 列、第 11 節第 6 點＋AA_600 B4）：祐廷「最近好嗎？」→ 她「（點了一下頭）嗯。」；她不問你好不好、沒有「不太好。」、沒有方向的兩句',D.length===2&&D[0].speaker==='player'&&D[0].text==='最近好嗎？'&&D[1].speaker===ID&&D[1].text==='（點了一下頭）嗯。'&&!J(D).includes('樓上下來')&&!J(D).includes('往下走')&&!inAny('要吃飯，要睡覺。')&&!inAny('……不要學我以前那樣。'),J(D)); }
  { setup('2027-11-27',10,'dorm','CLOSE'); H.date(ID); const L=await runEv('ev_sis_interview2',[0]);
    check('3. 第二次訪談（決6）交往中選「他太太那段。」：「可是我要記得。」→「（她沒有回答，把頭靠在你肩膀上一下。）」→「好了。吃飯。」；沒有咖啡那兩句',J(L.slice(L.indexOf('可是我要記得。')))===J(['可是我要記得。','（她沒有回答，把頭靠在你肩膀上一下。）','好了。吃飯。'])&&H.G.flags.SIS_INTERVIEW2==='went',J(L)); }
  { setup('2027-11-27',10,'dorm','FRIEND'); const L=await runEv('ev_sis_interview2',[0]);
    check('3. 第二次訪談沒交往：照舊咖啡「今天的工資。」，沒有靠肩膀',L.includes('今天的工資。')&&!L.includes('好了。吃飯。'),J(L)); }
  { setup('2027-11-27',10,'dorm','CLOSE'); H.date(ID); const L=await runEv('ev_sis_interview2',[1]);
    check('3. 第二次訪談交往中選「他的原子筆。」：照舊咖啡',L.includes('今天的工資。')&&!L.includes('好了。吃飯。'),J(L)); }
  for(const dt of [false,true]){ setup('2029-05-29',16,'linze','CLOSE'); if(dt) H.date(ID); const L=await runEv('ev_sis_defense',[]);
    const want=['許老師問我第四章為什麼那麼長。','我說因為我寫得很開心。','許老師怎麼說？','他說過了。'], i=L.indexOf(want[0]);
    check('3. 口試（決5）'+(dt?'交往中':'沒交往')+'：「許老師問我第四章為什麼那麼長。」「我說因為我寫得很開心。」祐廷「許老師怎麼說？」「他說過了。」'+(dt?'':'「好。我請大家喝飲料。販賣機的。」')+'；沒有「手在抖」、沒有「過了。」「你們怎麼都還在？」',
      i>=0&&J(L.slice(i,i+4))===J(want)&&(dt||L[i+4]==='好。我請大家喝飲料。販賣機的。')&&!L.some(t=>/手一直在抖|你們怎麼都還在|^過了。$/.test(t)),J(L)); }
  for(const dt of [true,false]){ const G=setup('2029-06-02',12,'campus','CLOSE'); if(dt) H.date(ID); H.said=[]; H.picks=[]; await PG.thermos(GM); const L=said(), i=L.indexOf('恭喜畢業。');
    check('3. 祐廷畢業典禮的保溫瓶（決9）'+(dt?'交往中：「（她沒說話，先抱了你一下。）」在「恭喜畢業。」前面':'沒交往：沒有抱一下'),i>0&&(dt?L[i-1]==='（她沒說話，先抱了你一下。）':!L.includes('（她沒說話，先抱了你一下。）')),J(L)); }
  { setup('2028-10-07',7,'dorm','CLOSE',{EXCHANGE_ROUTE:'TW'}); const L=await runEv('ev_sis_canyon',[0]);
    const i=L.indexOf('（她笑了。）你確定？');
    check('3. 大峽谷祐廷先說（決4）：「（她笑了。）你確定？」「我很難相處喔。」「（她把手伸給你。）」「走吧。」；沒有「好。」「我以為我要先說」',i>=0&&J(L.slice(i,i+4))===J(['（她笑了。）你確定？','我很難相處喔。','（她把手伸給你。）','走吧。'])&&!L.some(t=>/我以為我要先說/.test(t))&&H.G.flags.SIS_CANYON==='confess',J(L.slice(i-1,i+5)));
    if(typeof R2Y4B!=='undefined') R2Y4B.canyonAfter(H.G,'tw');
    check('3. 大峽谷祐廷先說：之後交往（canyonAfter）',!!(H.G.flags.dating_heroine_05||(H.G.flags.romance&&H.G.flags.romance[ID]&&H.G.flags.romance[ID].status==='dating'))); }
});

/* ---------- 4 學姊不先告白 ---------- */
await sec(4,async()=>{
  const GONE=['那我先說。','我喜歡你。……我想了很久，要不要在這裡說。','你要說好，還是要我再說一次。','我以前把喜歡的東西都排在計畫後面。','這次計畫做完了。……後面排你。','你不講，那我講。','這件事我想了一個禮拜。','……我喜歡你。','我原本想講得比較好。','上學期那件事，我到現在還是一樣。……你呢？','這次，我選你。','我還是喜歡你。這個我不想騙自己。','好。我也是想了很久才說的。你慢慢想。'];
  /* 「你不講，那我講。」別人也有（以安等），只看學姊的資料 */
  /* 「那我先說。」別人也有（story3d.js 可昕的私訊），只看大峽谷那一場 */
  /* AA 九件第 4、5 件（11-02 21:25）：「這次，我選你。」（restartYes）、「我還是喜歡你。這個我不想騙自己。」（multirel Byes）是祐廷先說以後她的回答，放回——不在這張「她先說」的表上 */
  const sisOnly=['我喜歡你。……我想了很久，要不要在這裡說。','你要說好，還是要我再說一次。','我以前把喜歡的東西都排在計畫後面。','這次計畫做完了。……後面排你。','這件事我想了一個禮拜。','我原本想講得比較好。','上學期那件事，我到現在還是一樣。……你呢？','好。我也是想了很久才說的。你慢慢想。'];
  const left=sisOnly.filter(t=>inAny(t));
  if(J(ev('ev_sis_canyon').dialogue).includes('那我先說。')) left.push('ev_sis_canyon：那我先說。');
  check('4. 她先說的句子都不在遊戲裡（大峽谷保467～469、畢業那天保630、631、AA_590 期末飯）',!left.length,J(left));
  const h=TERMEND_LINES.HEART[ID];
  check('4. 期末飯（AA_590 那一支）：學姊的心意邀約沒有 she、she2、think（祐廷先說的 yes 照 AA_590）',h&&h.she===undefined&&h.she2===undefined&&h.think===undefined&&Array.isArray(h.yes)&&J(h.yes).includes('我很難相處喔。'),J(Object.keys(h||{})));
  const h4=TERMEND.heart(ID,'Y4S2');
  check('4. 畢業那天（保630、631）：Y4S2 合起來的心意邀約也沒有 she',!!h4&&!h4.she&&!h4.she2&&!J(h4).includes('後面排你'),J(Object.keys(h4||{})));
  for(const term of ['Y3S1','Y4S2']){ setup(term==='Y3S1'?'2028-01-20':'2029-06-02',20,'dorm','CLOSE'); H.said=[]; H.opts=[]; H.picks=[3];
    const r=await TERMEND.walkHome(GM,ID,term); const L=said();
    check('4. '+term+' 回家路上祐廷選「（先不說）」：什麼都沒發生（silent）、不交往、不記「讓我想想」；她只說回家路上那一句',r==='silent'&&!H.G.flags.dating_heroine_05&&TERMEND.rec(H.G).think[ID]==null&&!L.some(t=>GONE.includes(t))&&H.opts[0]&&H.opts[0].includes('（先不說）'),J({r,L,o:H.opts[0]})); }
  { setup('2028-01-20',20,'dorm','CLOSE'); H.said=[]; H.opts=[]; H.picks=[0]; const r=await TERMEND.walkHome(GM,ID,'Y3S1'); const L=said();
    check('4. 祐廷先說：照 AA_590「（她笑了。）你確定？」……交往',r==='yes'&&L.includes('（她笑了。）你確定？')&&L.includes('我很難相處喔。'),J({r,L})); }
  { setup('2028-10-07',7,'dorm','CLOSE',{EXCHANGE_ROUTE:'TW'}); const L=await runEv('ev_sis_canyon',[1]); const i=L.indexOf('（太陽慢慢沉到峽谷另一邊。風很大，她把外套拉鍊拉到最上面。）');
    if(typeof R2Y4B!=='undefined') R2Y4B.canyonAfter(H.G,'tw');
    check('4. 大峽谷祐廷不說話：她不先說（下一句直接是回程的機場），SIS_CANYON silent、canyonAfter 以後不交往',i>=0&&L[i+1]==='十二月二十三號，晚上八點落地。你來接我。'&&H.G.flags.SIS_CANYON==='silent'&&!H.G.flags.dating_heroine_05&&!(H.G.flags.romance&&H.G.flags.romance[ID]&&H.G.flags.romance[ID].status==='dating'),J({L:L.slice(i,i+3),c:H.G.flags.SIS_CANYON})); }
  { const rs=SISB4.restartYes; SISB4.restartYes=()=>true; let a=null; try{ a=CONFESS_LINES[ID].yes({flags:{}}); } finally { SISB4.restartYes=rs; }
    check('4. 重新開始那一版（restartYes，AA 九件第 4 件放回）：「你做到了。」「……我也想好了。」「其他的，想了很久。……沒有了。」「這次，我選你。」',J(a)===J(['你做到了。','……我也想好了。','其他的，想了很久。……沒有了。','這次，我選你。']),J(a)); }
  { const W=['我想過了。','我還是喜歡你。這個我不想騙自己。','……你去見她那天，出門前發一句給我就好。'];
    check('4. 多段感情 Byes（AA 九件第 5 件放回）：「我想過了。」「我還是喜歡你。這個我不想騙自己。」「……你去見她那天，出門前發一句給我就好。」',J(MULTIREL_LINES.heroine_05&&MULTIREL_LINES.heroine_05.result.Byes||(MULTIREL_LINES.REL||{}))===J(W)||J(Object.values(MULTIREL_LINES).map(v=>v&&v.heroine_05&&v.heroine_05.result&&v.heroine_05.result.Byes).filter(Boolean))===J([W])); }
});

/* ---------- 5 林{name} ---------- */
await sec(5,()=>{
  const G=setup('2028-03-01',12,'dorm','CLOSE'); G.name='祐廷';
  check('5. 常數 YT_SURNAME＝「林」',SOCIAL.YT_SURNAME==='林');
  check('5. 沒交往：她的 {name}／名字照舊',SOCIAL.ytNameT('{name}。坐。',ID)==='{name}。坐。'&&SOCIAL.ytNameT('祐廷。坐。',ID)==='祐廷。坐。');
  H.date(ID);
  check('5. 交往中：她說的 {name}、已經換成名字的都變「林祐廷」；不重複加姓',SOCIAL.ytNameT('{name}。坐。',ID)==='林祐廷。坐。'&&SOCIAL.ytNameT('祐廷。……沒事。叫一下。',ID)==='林祐廷。……沒事。叫一下。'&&SOCIAL.ytNameT('林祐廷。',ID)==='林祐廷。');
  /* 2026-11-11（BB；AA 學姊約會新稿寫「林{name}」）：稿已經寫了林的不再補一個（原本直接拿到還沒換名字的字會變「林林祐廷」）*/
  check('5. 交往中：稿寫「林{name}」＝只有一個林（還沒換名字、已經換名字的都一樣）；同一句裡「林{name}」和單獨的「{name}」各自對',SOCIAL.ytNameT('林{name}，今天走慢一點。',ID)==='林祐廷，今天走慢一點。'&&SOCIAL.ytNameT('林祐廷，今天走慢一點。',ID)==='林祐廷，今天走慢一點。'&&SOCIAL.ytNameT('林{name}。{name}，等一下。',ID)==='林祐廷。林祐廷，等一下。',SOCIAL.ytNameT('林{name}，今天走慢一點。',ID));
  check('5. 交往中：別人說的照舊（以安、旁白）',SOCIAL.ytNameT('祐廷，你來了。','heroine_01')==='祐廷，你來了。'&&SOCIAL.ytNameT('祐廷。',null)==='祐廷。');
  G.name='阿翔'; check('5. 玩家改名字也一樣（林阿翔）',SOCIAL.ytNameT('{name}。','heroine_05')==='林阿翔。'&&SOCIAL.ytNameT('阿翔，等一下。','heroine_05')==='林阿翔，等一下。'); G.name='祐廷';
  if(typeof ROM!=='undefined'&&ROM.end) ROM.end(G,ID); else { G.flags.dating_heroine_05=false; if(G.flags.romance&&G.flags.romance[ID]) G.flags.romance[ID].status='ended'; }
  check('5. 分手以後：照舊',SOCIAL.ytNameT('{name}。',ID)==='{name}。'&&SOCIAL.ytNameT('祐廷。',ID)==='祐廷。');
  const g3=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
  check('5. 接線：對話框（game3d.js showLine，說話的人＝charId 或交往中的名字）、手機她的訊息（sysT）都過 SOCIAL.ytNameT',/D\.full=subst\(text\); if\(who&&typeof SOCIAL!=='undefined'&&SOCIAL\.ytNameT\) D\.full=SOCIAL\.ytNameT\(D\.full,who\.charId/.test(g3)&&/const ytT=m=>m&&m\.from==='heroine_05'&&!m\.ytFix&&typeof SOCIAL!=='undefined'&&SOCIAL\.ytNameT\?SOCIAL\.ytNameT\(m\.text,'heroine_05'\):m\.text;/.test(g3)&&/m\.text=SOCIAL\.ytNameT\(m\.text,'heroine_05'\); m\.ytFix=1;/.test(fs.readFileSync(path.join(H.ROOT,'src/phone3d.js'),'utf8'))   /* AA 九件第 8 件：手機訊息送出時就定字（phone3d.js mk 記 ytFix），有 ytFix 的不再顯示時換 */&&/SOCIAL\.shuyuT\(m\.text\):ytT\(m\);/.test(g3));
});

/* ---------- 6 AA 對 AA_584 的補充 ---------- */
await sec(6,()=>{
  const s3=FEED_Y4S2&&(FEED_Y4S2.posts||FEED_Y4S2.items||[]).find?((FEED_Y4S2.posts||FEED_Y4S2.items||[]).find(p=>p.id==='sis3h')):null;
  const src=fs.readFileSync(path.join(H.ROOT,'src/data/feed_y4s2.js'),'utf8');
  check('6. 動態 sis3h：祐廷「恭喜。最後幾頁？」、她「一百二十二頁。指導教授要我刪二十頁，刪了。」；「刪了二十頁？」不在',src.includes("dm:['恭喜。最後幾頁？','一百二十二頁。指導教授要我刪二十頁，刪了。']")&&!src.includes('刪了二十頁？')&&(!s3||J(s3.dm)===J(['恭喜。最後幾頁？','一百二十二頁。指導教授要我刪二十頁，刪了。'])));
  check('6. 修正本私訊：「修正本印好了。」「多印了一本。……你說過要的。」；沒有「一本給我爸了」',J(SISB13_LINES.thesisMsg)===J(['修正本印好了。','多印了一本。……你說過要的。'])&&!inAny('一本給我爸了'),J(SISB13_LINES.thesisMsg));
  /* AA_661 第 21 列（AA_611 #6，2026-11-03 學姊和 Alison 是姊妹、爸爸在她國小時過世）：取代 AA 對 AA_584 補充的「媽媽是公務員，期待她考司法官」（不寫爸爸）*/
  check('6. 人物卡 family_context：AA_661 第 21 列「爸爸在她國小時過世；小時候跟阿公奶奶住，奶奶很開明；媽媽是公務員，比較會問考試和工作；妹妹 Alison（從母姓，同校法律系）」',CHARACTERS.heroine_05.family_context==='爸爸在她國小時過世；小時候跟阿公奶奶住，奶奶很開明；媽媽是公務員，比較會問考試和工作；妹妹 Alison（從母姓，同校法律系）',CHARACTERS.heroine_05.family_context);
  check('6. us208：3-3 剪報 AA_609 恢復成她奶奶（七場）、heardClip 回來；驗法在 tests/aa609_sis_grandma_unit.js',US208.SCENES.length===7&&typeof US208.heardClip==='function');
});

/* ---------- 7 AA 2026-11-02 20:26 定稿（LAWWW 追加）---------- */
await sec(7,async()=>{
  { setup('2026-08-14',15,'cafe','FAMILIAR'); const L=await runEv('ev_sis_course_y2',[0]);
    check('7. 選課分支 a：選項「債總一定要周老師那班嗎？」→「不一定。可是你會想上他的課。」→ 接 c；祐廷「……沒有。」、「那堂很好過。」都不在',J(H.opts[0])===J(['「債總一定要周老師那班嗎？」','「妳大二修了什麼？」'])&&L[L.indexOf('這樣排可以。')+1]==='不一定。可是你會想上他的課。'&&L[L.indexOf('不一定。可是你會想上他的課。')+1]==='（她把紅筆蓋起來，課表推回給你。）'&&!L.includes('……沒有。')&&!inAny('那堂很好過。'),J(L)); }
  { setup('2026-08-14',15,'cafe','FAMILIAR'); const L=await runEv('ev_sis_course_y2',[1]);
    check('7. 選課分支 b 不動',L.includes('跟你差不多。……我大二的課表比你滿，我那時候不知道要留時間給自己。'),J(L)); }
  { const Y=TERMEND_LINES.HEART.heroine_05.yes, s=Y.map(x=>typeof x==='string'?x:(x.cg?'CG:'+x.cg:'N:'+x.narr));
    check('7. 告白「收進口袋」不重複：第 82 列「（她把便條收進口袋，把手伸給你。）走吧。」留、最後旁白「（便條上寫的字，她一句都沒有念。）」',s[s.length-2]==='（她把便條收進口袋，把手伸給你。）走吧。'&&s[s.length-1]==='N:（便條上寫的字，她一句都沒有念。）'&&(J(Y).match(/收進口袋/g)||[]).length===1,J(s)); }
  { const a=CONFESS_LINES[ID].yes({flags:{SIS_DECLINED_PREEXAM:{day:1}}}), b=CONFESS_LINES[ID].yes({flags:{}});
    check('7. confess_lines 學姊答應：婉拒過的也沒有「你上次說的，我有記得。」（照 AA_254 第 3 節作廢）；三句照 AA_593 決5 乙（企劃線 6cbb0b4ab，第 114、115、117 列：和期末飯告白同一套共創句）',J(a)===J(['（她笑了。）你確定？','我很難相處喔。','（她把手伸給你。）走吧。'])&&J(a)===J(b)&&!inAny('你上次說的，我有記得。'),J(a)); }
  for(const fl of [{MET_SIS_FATHER:'grad'},{MET_SIS_FATHER:true},{SIS_FATHER_ASKED:'msg',SIS_FATHER_GO:false},{SIS_FATHER_ASKED:'face',SIS_FATHER_GO:true}]){ setup('2029-06-02',12,'campus','CLOSE',fl); H.date(ID); H.said=[]; H.picks=[0,0]; let err=null; try{ await PG.thermos(GM); }catch(e){ err=String(e); }
    const L=said(); check('7. 舊存檔旗標 '+J(fl)+'：畢業典禮保溫瓶照演、沒有她爸爸、不丟例外；SIS_THERMOS 照記（AA_609：MET_SIS_FATHER true＋交往中＝她奶奶先來說畢業快樂；THERMOS.father 照舊沒有）',!err&&!L.some(x=>/爸/.test(x))&&L.includes('恭喜畢業。')&&H.G.flags.SIS_THERMOS===true&&POSTGRAD_LINES.THERMOS.father===undefined&&(L[0]==='（典禮結束，學姊身邊站著她奶奶。）')===(fl.MET_SIS_FATHER===true),J({err,L})); }
  { const src=fs.readFileSync(path.join(H.ROOT,'tests/sis_no_three_unit.js'),'utf8');
    check('7. sis_no_three 例外：第 65 列「這學期，還有一件事沒做完。」、第 69 列「還有一件事。」在允許清單（AA_590 收的，AA 20:26 確認）',src.includes("'還有一件事。':'學姊（AA_590 第 69 列")&&src.includes("'這學期，還有一件事沒做完。':'學姊（AA_590 第 65 列")); }
});

H.done();
})();

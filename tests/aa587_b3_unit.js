// AA_587 以安改稿第三批（大一、大二事件）：企劃線 1cf992d66 的表逐列核對（AA587-AN-B3-1102）——不需要瀏覽器。
// 第 13 節（期末飯 HEART、第 58～71 列）先前已經整合（c9aa5f3ad 等），這支只核對第 2 節第 1～57 列、新1～新10、第 14 節使用者確認的幾處：
//   1  稿讀得到（git show 1cf992d66）；白名單有這一份（sha 1cf992d66、approved、task AA587-AN-B3-1102）
//   2  表上第 1～57 列（數字列；第 58 列以後是第 13 節、已整合）：「改成」在位置欄那個檔裡找得到、「原句」在 src 裡找不到（原句＝改成的第 17 列除外）；
//      刪掉的列（第 46～49、51～55 列）原句不在；一句變四句的第 41 列照四句
//   3  第 14 節使用者確認：跨年隔天（第 19、20 列、保61）、咖啡豆原句（第 17 列）、地圖（第 40 列）、日文小考（第 29 列＋前提換成祐廷）、民總考完刪「……我寫引誘。」（保51）、書卷獎「……卷哥。」（第 27 列）
//   4  第 7-2 節 S4（新1～新9）、第 7-3 節 S3（第 57 列）、第 10 節新10「我在查訴願怎麼寫。」、訴願書（第 69 列）
// 修改前（d7a468868 的 src、白名單放進這支測試實際跑，AA587_ROOT）：FAIL 19、PASS 3（稿讀得到、表 57 列、刪掉的是哪幾列）；修改後 ALL PASS（22 項）。
// 用法：node tests/aa587_b3_unit.js
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(process.env.AA587_ROOT||path.join(__dirname,'..'));
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||info===undefined?'':'　'+info)); if(!ok) fails++; };
const J=JSON.stringify, R=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const SHA='1cf992d66', SPEC='docs/story_planning/AA_587_以安改稿_第三批_大一大二事件.md';
const {fwd:FWD789}=require('./aa789_fwd.js');   /* AA_789／788 換過的句子：稿換成新字再比 */
const DOC=(()=>{ try{ return FWD789(cp.execSync('git show '+SHA+':"'+SPEC+'"',{cwd:path.join(__dirname,'..'),encoding:'utf8',maxBuffer:1<<24})); }catch(e){ return ''; } })();
const SRC={}; (function walk(d){ for(const f of fs.readdirSync(path.join(ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)&&!/chars3d/.test(f)) SRC[p]=R(p); } })('src');
const stripC=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/mg,'');   /* 註解裡引用原句不算 */
const CODE={}; for(const p in SRC) CODE[p]=stripC(SRC[p]);
const inCode=t=>Object.keys(CODE).filter(p=>CODE[p].includes(t));
const fileOf=where=>{ const m=where.match(/^`?([\w.]+\.js)/); if(!m) return null; return Object.keys(SRC).find(p=>p.endsWith('/'+m[1]))||null; };
// 表上的列
const rows=[]; for(const line of DOC.split('\n')){ const m=line.match(/^\|\s*([0-9]+|保[0-9]+|新[0-9]+)\s*\|(.*)\|\s*$/); if(!m) continue; const c=m[2].split('|').map(x=>x.trim()); if(c.length<5) continue; rows.push({n:m[1],where:c[0],who:c[1],old:c[2],nw:c[3],why:c[4]}); }
const row=n=>rows.find(r=>r.n===String(n));
// ---------- 1 ----------
check('1. 讀得到稿（AA_587 @'+SHA+'：第 2 節逐句表、第 7-2 節、第 14 節使用者確認）',DOC.length>30000&&/## 14\. 使用者確認/.test(DOC)&&/### 7-2｜S4/.test(DOC),String(DOC.length));
{ const A=JSON.parse(R('docs/handoff/story_import_allow.json')).files.filter(e=>e.path===SPEC);
  check('1. 白名單有 AA_587（sha '+SHA+'、approved、AA587-AN-B3-1102）',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].task==='AA587-AN-B3-1102',J(A)); }
// ---------- 2 ----------
const num=rows.filter(r=>/^[0-9]+$/.test(r.n)&&+r.n<=57);
check('2. 表上第 1～57 列都讀到（57 列）',num.length===57&&new Set(num.map(r=>r.n)).size===57,num.length);
const DEL=num.filter(r=>/^（刪/.test(r.nw)), SPLIT=num.filter(r=>/／/.test(r.nw)), PLAIN=num.filter(r=>!DEL.includes(r)&&!SPLIT.includes(r));
check('2. 刪掉的列＝第 46～49、51～55 列（S4）；一句變多句＝第 41 列',J(DEL.map(r=>+r.n))===J([46,47,48,49,51,52,53,54,55])&&J(SPLIT.map(r=>+r.n))===J([41]),J({d:DEL.map(r=>r.n),s:SPLIT.map(r=>r.n)}));
{ const bad=[]; for(const r of PLAIN){ const f=fileOf(r.where), nw=r.nw.replace(/^「(.*)」$/,'$1'), old=r.old.replace(/^「(.*)」$/,'$1');
    if(!f||!SRC[f].includes(nw)) bad.push('#'+r.n+' 改成不在 '+f+'：'+nw);
    /* 2026-11-11（X327 沛珊重寫，AA_759_peishan_misc2.json@987845b7c）：沛珊出發前電話的新句「六點？那時候我一定還在睡。」（src/aa667_3d.js）開頭剛好有第 20 列的原句「六點？」這三個字——那是沛珊的句子，不是以安那一句還在；拿掉這一句再找 */
    const still=inCode(old).filter(f=>!(old==='六點？'&&f==='src/aa667_3d.js'&&!SRC[f].split('六點？那時候我一定還在睡。').join('').includes(old)));
    if(old!==nw&&!nw.includes(old)&&still.length) bad.push('#'+r.n+' 原句還在 '+still.join('、')+'：'+old); }
  check('2. 一般列（'+PLAIN.length+' 列）：改成在位置欄的檔裡、原句不在 src（程式碼，不算註解）',!bad.length,J(bad)); }
{ const bad=DEL.filter(r=>inCode(r.old).length).map(r=>'#'+r.n+'：'+r.old);
  check('2. 刪掉的 9 列（「為什麼念法律」那一段）原句都不在 src',!bad.length,J(bad)); }
{ const y=SRC['src/y2r2_3d.js']; const m=y.match(/privKey:'an_mx'[\s\S]*?try\{([\s\S]*?)\}\s*finally/);
  check('2. 第 41 列（明軒的事……）：「他還好嗎？」→ 祐廷「他今天還跟阿哲去打球。」→「嗯。」→「……你今天晚餐吃什麼。」，原句不在',!!m&&/GM\.say\(who,'他還好嗎？'\);\s*await GM\.say\(\{name:G\.name\},'他今天還跟阿哲去打球。'\);\s*await GM\.say\(who,'嗯。'\);\s*await GM\.say\(who,'……你今天晚餐吃什麼。'\);/.test(m[1])&&!inCode('他問了，我答了。我們還是朋友。').length,m&&m[1]); }
// ---------- 3 第 14 節 ----------
const EV=SRC['src/data/events.js'];
check('3-1 跨年隔天（第 19、20 列、保61）：「明天大家都會睡很晚。……午餐一起吃？」→ 祐廷選項「幾點？」→「中午。睡飽再說。」；舊的「跑步」「六點？」「七點。元旦」都不在',
  /明天大家都會睡很晚。……午餐一起吃？'[\s\S]{0,400}「幾點？」[\s\S]{0,300}text:'中午。睡飽再說。'/.test(EV)&&!inCode('明天早上我要去跑步').length&&!/「六點？」/.test(EV)&&!inCode('七點。元旦，晚一點。').length&&row('保61').nw==='中午。睡飽再說。');
check('3-2 交換禮物：卡片「字比我想的整齊。……謝謝。」（第 18 列）、咖啡豆照原句「我在 Café 都點茶。開學以後會用到。謝謝。」（第 17 列）',EV.includes("'字比我想的整齊。……謝謝。'")&&EV.includes('我在 Café 都點茶。開學以後會用到。謝謝。')&&!inCode('字很工整。我收著。').length&&!inCode('我室友每天喝兩杯').length);
check('3-3 地圖（第 40 列）：「嗯。我畫了三次。」；BB 版「我怕畫錯」、原句「畫錯一條路」都不在',SRC['src/data/y2b_events.js'].includes('嗯。我畫了三次。')&&!inCode('畫錯一條路，人家就走錯。').length&&!inCode('我怕畫錯，人家會走錯路。').length);
{ const V=SRC['src/data/vac_activities.js']; const q=stripC(V).slice(stripC(V).indexOf("title:'小考',bg:'classroom_small'"),stripC(V).indexOf("title:'最後一堂',bg:'classroom_small'"));
  check('3-4 日文小考（第 29 列＋第 14 節第 5 點）：寫反ツ和シ的是祐廷（旁白），她不說「九十二。片假名寫錯一個。」「ツ跟シ。我每次都分不清楚。」；她回「嗯。多寫幾次就分得出來。」；十遍是祐廷寫（「（你在筆記本上…」）',
    q.length>0&&q.includes("{narr:'（小考發回來。你把ツ跟シ寫反了。）'}")&&!/九十二|我每次都分不清楚|很像不是理由|她在筆記本上把兩個字/.test(q)&&q.includes("'嗯。多寫幾次就分得出來。'},{narr:'（你在筆記本上把兩個字各寫了十遍。）'}"),q.slice(0,300)); }
{ const w=EV.slice(EV.indexOf("id:'ev_midterm_walkout'"),EV.indexOf("id:'ev_midterm_walkout'")+6000);
  check('3-5 民總考完（保51、第 14 列）：以安「（從教室出來，把筆收進筆袋）對答案又不會加分。」；「……我寫引誘。」刪掉（芯慈「（小聲）我寫引誘，…」照留）',w.includes('對答案又不會加分。')&&!w.includes("text:'……我寫引誘。'")&&w.includes('（小聲）我寫引誘，然後補了一段反對意見。')&&row('保51').nw==='（刪）'); }
check('3-6 書卷獎（第 27 列）：「名單上有你。……卷哥。」；「理由？」不在（台詞、註解都換）',SRC['src/honor3d.js'].includes("await GM.say(who,'名單上有你。……卷哥。');")&&!Object.values(SRC).some(s=>s.includes('名單上有你。理由？')));
check('3-7 家教補助（第 32、34 列）：「我想幫忙。可是我又不是律師，不能亂講。」、「我知道。我是怕我講錯。」兩處',EV.includes('我想幫忙。可是我又不是律師，不能亂講。')&&(EV.match(/text:'我知道。我是怕我講錯。'/g)||[]).length===2);
// ---------- 4 S4、S3、新10 ----------
const ST=SRC['src/story3d.js'], meet=ST.slice(ST.indexOf('async function meetAn('),ST.indexOf('// 一起走的路上'));
check('4-1 新1～新4（追出來）：classAnswer 那句後面、邀約前面「老師說報告兩人一組。我還沒有組。你呢？」→ 祐廷 ME(G)「那我們一組？」→「好。」→ CG-28 →「LINE。」→ anContactDay2、REPORT_PARTNER',
  /F\.flags_met_an=true;[\s\S]*?GM\.say\(an,'老師說報告兩人一組。我還沒有組。你呢？'\); await GM\.say\(ME\(G\),'那我們一組？'\); await GM\.say\(an,'好。',\{expr:'smile'\}\);\s*if\(typeof ADV!=='undefined'&&ADV\.cg\) ADV\.cg\('cg_line_qr_heroine01'\); await GM\.say\(an,'LINE。'\);[\s\S]*?anContactDay2\(G\); SOCIAL\.remember\('heroine_01','REPORT_PARTNER','開學第二天她追出來分組'\);\s*GM\.cine\('ots',P\.obj,an\.obj\); await GM\.say\(an,'我等一下要去溫州街/.test(meet));
check('4-2 新9（婉拒）：「好。那明天見。」後面「題目出來我傳你。」',meet.includes("await GM.say(an,'好。那明天見。'); await GM.say(an,'題目出來我傳你。');"));
{ const cafe=ST.slice(ST.indexOf('async function cafeScene('),ST.indexOf('function anContactDay2(')), lib=ST.slice(ST.indexOf('async function libraryScene('),ST.indexOf("GM.memo('和小安在總圖待到黃昏')"));
  check('4-3 新5、新6（Café）：cafeView 三句＋「其他的我來。題目一公布就開始。」；沒有 whyLaw 的選項、結尾不再 anContactDay2',/F\.cafeView==='B'\?'那反方你寫。':F\.cafeView==='C'\?'那判斷標準你寫，你比我會講。':'那結論你寫。'/.test(cafe)&&cafe.includes("'其他的我來。題目一公布就開始。'")&&!/翻民法|whyLaw/.test(stripC(cafe))&&!/anContactDay2\(G\)/.test(cafe));
  check('4-4 新7、新8（總圖小聲版）：「（小聲）那結論你寫。／（小聲）那反方你寫。／（小聲）那判斷標準你寫。」＋「（小聲）其他的我來。」；沒有 whyLaw、不再 anContactDay2',/F\.cafeView==='B'\?'（小聲）那反方你寫。':F\.cafeView==='C'\?'（小聲）那判斷標準你寫。':'（小聲）那結論你寫。'/.test(lib)&&lib.includes("'（小聲）其他的我來。'")&&!/翻民法|whyLaw/.test(stripC(lib))&&!/anContactDay2\(G\)/.test(lib));
  check('4-5 記憶備註「聊了報告和為什麼念法律」→「聊了報告」（Café、總圖）',!ST.includes('聊了報告和為什麼念法律')&&(ST.match(/_AFTERNOON','聊了報告'\)/g)||[]).length===2); }
check('4-6 ev_an_report_split 條件多 notMemory REPORT_PARTNER（新玩家第二天就同組）',/id:'ev_an_report_split',[^\n]*\n\s*prereq:\{flags:\['afternoonDone'\],notEvents:\['ev_an_report_followup'\],notMemory:\[\{npc:'heroine_01',tag:'REPORT_PARTNER'\}\]\}/.test(EV));
{ const t=EV.slice(EV.indexOf("id:'ev_an_tutor_family_1'"),EV.indexOf("id:'ev_an_tutor_family_1'")+3000);
  check('4-7 第 57 列（S3）＋新10：「我家教的學生家裡，媽媽生病，這學期沒辦法上班。申請了補助，被駁回了。」→「我在查訴願怎麼寫。」；檔頭寫「救濟程序：訴願（BB_232…」',
    /text:'我家教的學生家裡，媽媽生病，這學期沒辦法上班。申請了補助，被駁回了。'\},\{speaker:'heroine_01',expression:'neutral',text:'我在查訴願怎麼寫。'\}/.test(t)&&EV.includes('救濟程序：訴願（BB_232')&&!EV.includes('救濟程序都不說'));
  check('4-8 第 69 列（大二下媽媽的地圖）：「申覆」→「訴願書」；src 沒有「申覆」',SRC['src/data/y2b_events.js'].includes('我後來陪他們寫了訴願書。')&&!inCode('申覆').length); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

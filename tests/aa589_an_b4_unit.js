// AA_589 以安改稿第四批（大三、大四、畢業後）：企劃線 2e4439756 的表逐列核對（AA589-AN-B4-1102）——不需要瀏覽器。
//   1  稿讀得到；白名單有這一份（sha 2e4439756、approved、task AA589-AN-B4-1102）
//   2  表上第 1～97 列（第 9 節：原決1～決22＝第 76～97 列）：第 56～58 列（為什麼念法律，等使用者選高中以前的理由，第 11、12 節）原句照留、改成不在；
//      其他一般列「改成」在位置欄那個檔、「原句」不在 src 程式碼（原句＝改成的第 86、87、92 列、原句在別處合法出現的「……好。」「理由呢？」另外驗）
//   3  第 11 節：第 10 列「我知道了。」；第 27 列轉述宿舍管理員阿姨兩句；第 28、29 列祐廷先問「要幫忙嗎？」、選項「（不再多說）」／「那我們可以談一下嗎？」、REPAIR 條件照舊
//   4  第 10 節「想去的店」四個地方：看過那一頁（AN_SHOP_PAGE）換承接的寫法、第一次看到才記；③ TE.HEART she 前兩拍、② 七夕告白、② 日本的手帳、④ 七月最後一次的邀約（實際跑）
//   5  第 7-5 節 S6：國考放榜祐廷自己查到（旁白＋祐廷的訊息＋她回）、群組阿哲先貼；不是她打來（實際跑 anCall 的資料）
//   6  CG-23：河堤她直接說「櫻花只開一個禮拜。」、說話人「手帳」那一行刪掉；圖換成企劃線 62395d7da 那張；LICENSES 不再寫「暫不換」
// 修改前（d7a468868 的 src、白名單、LICENSES、CG-23 圖放進這支測試實際跑，AA589_ROOT）：FAIL 23、PASS 3；修改後 ALL PASS（26 項）。
// 用法：node tests/aa589_an_b4_unit.js
const fs=require('fs'), path=require('path'), cp=require('child_process'), crypto=require('crypto'), vm=require('vm');
const GITDIR=path.join(__dirname,'..'), ROOT=path.resolve(process.env.AA589_ROOT||GITDIR);
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||info===undefined?'':'　'+info)); if(!ok) fails++; };
const J=JSON.stringify, R=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const SHA='2e4439756', SPEC='docs/story_planning/AA_589_以安改稿_第四批_大三大四畢業後.md';
const gshow=(sha,p,enc)=>{ try{ return cp.execSync('git show '+sha+':"'+p+'"',{cwd:GITDIR,encoding:enc||'utf8',maxBuffer:1<<26}); }catch(e){ return enc==='buffer'?Buffer.alloc(0):''; } };
const DOC=gshow(SHA,SPEC);
const SRC={}; (function walk(d){ for(const f of fs.readdirSync(path.join(ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)&&!/chars3d/.test(f)) SRC[p]=R(p); } })('src');
const stripC=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/mg,'');
const CODE={}; for(const p in SRC) CODE[p]=stripC(SRC[p]);
const inCode=t=>Object.keys(CODE).filter(p=>CODE[p].includes(t));
const fileOf=where=>{ const m=where.match(/^`?([\w.]+\.js)/); if(!m) return null; return Object.keys(SRC).find(p=>p.endsWith('/'+m[1]))||null; };
const rows=[]; for(const line of DOC.split('\n')){ const m=line.match(/^\|\s*([0-9]+)\s*\|(.*)\|\s*$/); if(!m) continue; const c=m[2].split('|').map(x=>x.trim()); if(c.length<5) continue; rows.push({n:+m[1],where:c[0],who:c[1],old:c[2],nw:c[3],why:c[4]}); }
const row=n=>rows.find(r=>r.n===n);
// ---------- 1 ----------
check('1. 讀得到稿（AA_589 @'+SHA+'：第 9～12 節）',DOC.length>30000&&/## 12\. 樣 5～10/.test(DOC)&&/第 56～58 列先照原句不動/.test(DOC),String(DOC.length));
{ const A=JSON.parse(R('docs/handoff/story_import_allow.json')).files.filter(e=>e.path===SPEC);
  check('1. 白名單有 AA_589（sha '+SHA+'、approved、AA589-AN-B4-1102）',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].task==='AA589-AN-B4-1102',J(A)); }
// ---------- 2 ----------
check('2. 表上第 1～97 列都讀到',rows.length===97&&new Set(rows.map(r=>r.n)).size===97,rows.length);
const HOLD=[56,57,58], SPECIAL=[16,72,67,27,28,29,30,82,90,91,93,94,95,96];   /* 第 30 列（a 的旁白「收進口袋」）和第 29 列（第 11 節後來改寫整條 a：「收進包包」）衝突：照第 29 列，3-4 驗 */
{ const bad=HOLD.filter(n=>{ const r=row(n), f=fileOf(r.where); return !f||!SRC[f].includes(r.old)||SRC[f].includes(r.nw); });
  check('2. 第 56～58 列（為什麼念法律，等使用者選）照原句、沒有換成改成欄',!bad.length,J(bad)); }
{ const bad=[]; for(const r of rows){ if(HOLD.includes(r.n)||SPECIAL.includes(r.n)) continue; const f=fileOf(r.where);
    if(!f||!SRC[f].includes(r.nw)) bad.push('#'+r.n+' 改成不在 '+f+'：'+r.nw);
    if(r.old!==r.nw&&!r.nw.includes(r.old)&&inCode(r.old).length) bad.push('#'+r.n+' 原句還在 '+inCode(r.old).join('、')+'：'+r.old); }
  check('2. 一般列（'+(97-HOLD.length-SPECIAL.length)+' 列）：改成在位置欄的檔、原句不在 src 程式碼',!bad.length,J(bad)); }
check('2. 第 16 列：TEAM 那一句（Alison 給紙袋以後）「好。」；第 72 列：紐約送機兩處（朋友版、交往版）「好。」',
  /speaker:'yu',text:'（把一個小紙袋塞給她）路上吃。'\},\{if:C\(\(\)=>met\('yu'\)\),speaker:'heroine_01',text:'好。'\}/.test(SRC['src/y34b3d.js'])&&(SRC['src/data/r2y4b_events.js'].match(/text:'上次你也知道我們會來。'\},\n\s*\{speaker:'heroine_01',text:'好。'\}/g)||[]).length===2);
check('2. 第 67 列：選一個人以後她不知道的時候問「為什麼？」（APART ask；其他人物的「理由呢？」不動）',/ask:\['為什麼？'\]/.test(SRC['src/r2y4b3d.js'])&&!/ask:\['理由呢？'\]/.test(SRC['src/r2y4b3d.js']));
check('2. 第 68 列：APART last 旁白「（她低下頭，把東西收進包包。）」、電話版的鍵 S.APART_HEAR 跟著換',/last:\[\{narr:'（她低下頭，把東西收進包包。）'\}/.test(SRC['src/r2y4b3d.js'])&&/'（她低下頭，把東西收進包包。）':'（翻紙的聲音。）'/.test(SRC['src/r2y4b3d.js'])&&!inCode('（她翻開手帳，寫了一行，沒有給你看。）').length);
// ---------- 3 第 11 節 ----------
const B=SRC['src/data/r2y3b_events.js'];
check('3-1 第 10 列：攤牌「（站起來，把椅子推回去）我知道了。」',SRC['src/data/events.js'].includes("text:'（站起來，把椅子推回去）我知道了。'")&&!inCode('理由我不用聽了。').length);
check('3-2 第 27 列：町公所 c「我問過宿舍的管理員阿姨。她說大家照做，是因為隔壁也照做。」→「（停一下）她沒有提到町公所。」；「抄進手帳」不在',
  /\{label:'c'\},\{speaker:'heroine_01',text:'我問過宿舍的管理員阿姨。她說大家照做，是因為隔壁也照做。'\},\{speaker:'heroine_01',text:'（停一下）她沒有提到町公所。'\}/.test(B)&&!inCode('那我想研究的，就是這兩個中間的線。').length);
{ const s=stripC(B), i=s.indexOf("id:'ev_an_town_notice_repair'"), r=s.slice(i,s.indexOf('};',i));
  check('3-3 第 28 列：挽回中那一場她不先開口——旁白「（晚上的宿舍大廳。她拿著一張通知，查字典查了很久。）」→ 祐廷「要幫忙嗎？」→「（她停了一下，把通知推過來，指著一個字。）」→ 祐廷翻譯 →「……謝謝。」',
    /\{speaker:null,text:'（晚上的宿舍大廳。她拿著一張通知，查字典查了很久。）'\},\s*\{speaker:'player',text:'要幫忙嗎？'\},\s*\{speaker:null,text:'（她停了一下，把通知推過來，指著一個字。）'\},\s*\{speaker:'player',text:'（看了一下）這是「截止日」。後面那個是「本人到場」。'\},\s*\{speaker:'heroine_01',text:'……謝謝。'\},/.test(r)&&!r.includes('……你看得懂這個字嗎？'),r.slice(0,300));
  check('3-4 第 29 列：「我不是在跟你和好。」刪掉；選項「（不再多說）」→（她把通知折好，收進包包。）「晚安。」＝AN_NOTICE_REPAIR_OK；「那我們可以談一下嗎？」→「……我只是看不懂這個字。」（她拿起字典走了。）；b 原句「我說了，我只是看不懂。」刪掉；REPAIR 條件照舊（after 讀 AN_NOTICE_REPAIR_OK）',
    !r.includes('我不是在跟你和好')&&!r.includes('我說了，我只是看不懂。')&&/\{choice:\[\{text:'（不再多說）',goto:'a'\},\{text:'「那我們可以談一下嗎？」',goto:'b'\}\]\}/.test(r)&&/\{label:'a'\},\{speaker:null,text:'（她把通知折好，收進包包。）'\},\{speaker:'heroine_01',text:'晚安。'\},\{set:\{AN_NOTICE_REPAIR_OK:true\}\}/.test(r)&&/\{label:'b'\},\{speaker:'heroine_01',text:'……我只是看不懂這個字。'\},\{speaker:null,text:'（她拿起字典走了。）'\}/.test(r)&&/after:G=>\{ const x=X\(\); if\(x&&G\.flags\.AN_NOTICE_REPAIR_OK\) x\.repairAdd\(G,'heroine_01'\); \}/.test(s)); }
// ---------- 4 第 10 節「想去的店」 ----------
const mkSOCIAL=seen=>({has:(id,t)=>id==='heroine_01'&&t==='AN_SHOP_PAGE'&&seen.v,remember:(id,t)=>{ if(id==='heroine_01'&&t==='AN_SHOP_PAGE'){ seen.n=(seen.n||0)+1; seen.v=true; } }});
{ const ctx={window:{}}; ctx.window=ctx; vm.createContext(ctx); vm.runInContext(SRC['src/data/postgrad_lines.js'].replace(/^const (\w+)\s*=/m,'var $1='),ctx); const PL=ctx.POSTGRAD_LINES, H=PL&&PL.TE&&PL.TE.HEART&&PL.TE.HEART.heroine_01;
  const res=(seen)=>{ ctx.SOCIAL=mkSOCIAL({v:seen}); return H.she.slice(0,2).map(x=>{ const v=typeof x==='function'?x({}):x; return v&&v.narr; }); };
  check('4-1 ③ 畢業那天 TE.HEART：沒看過＝第 63、64 列第一次揭曉（翻到最後面那一頁／「想去的店」…和你）',!!H&&J(res(false))===J(['（她從包包拿出手帳，翻到最後面那一頁，推到你面前。）','（那一頁的標題是「想去的店」。一行一家，前面的都打了勾，今天這一家也勾了。最下面一行沒有店名，只寫著：和你。）']),J(H&&res(false)));
  check('4-2 ③ 看過那一頁（AN_SHOP_PAGE）＝第 10 節承接的兩拍',!!H&&J(res(true))===J(['（她從包包拿出手帳，翻到「想去的店」那一頁，推到你面前。）','（最下面那一行還是「和你」。旁邊沒有勾。）']),J(H&&res(true)));
  check('4-3 ③ sheMem＝AN_SHOP_PAGE（第一次看到才記；termend3d 記之前先問有沒有）；invite2 第二句＝第 62 列；think＝第 65 列',!!H&&H.sheMem==='AN_SHOP_PAGE'&&H.invite2[1]==='上次那一頁，最下面那一行還沒勾。'&&H.think==='好。這一行我先不劃掉。'&&/if\(!again&&h\.sheMem&&typeof SOCIAL!=='undefined'&&SOCIAL\.remember&&!\(SOCIAL\.has&&SOCIAL\.has\(who,h\.sheMem\)\)\)/.test(SRC['src/termend3d.js'])); }
{ const s=stripC(B);
  check('4-4 ② 七夕告白（第 79 列＋第 10 節）：沒看過「我喜歡你。回臺灣，我有東西給你。」、看過「我喜歡你。……回臺灣，那一行我想勾掉。」；SHOP_SEEN 讀 AN_SHOP_PAGE',
    s.includes("{unless:SHOP_SEEN,speaker:'heroine_01',text:'我喜歡你。回臺灣，我有東西給你。'},{if:SHOP_SEEN,speaker:'heroine_01',text:'我喜歡你。……回臺灣，那一行我想勾掉。'}")&&/const SHOP_SEEN=\{custom:G=>typeof SOCIAL!=='undefined'&&!!SOCIAL\.has&&SOCIAL\.has\('heroine_01','AN_SHOP_PAGE'\)\}/.test(s));
  const i=s.indexOf('const AN_NOTEBOOK='), nb=s.slice(i,s.indexOf('};',i));
  check('4-5 ② 日本的手帳（第 80 列＋第 10 節）：標題「日本的手帳」；沒看過＝新手帳「想去的店」…和你、記 AN_SHOP_PAGE；看過＝「是那一本舊手帳…空的勾勾格」、不再記',
    nb.includes("title:'日本的手帳'")&&nb.includes("{unless:SHOP_SEEN,speaker:null,text:'（第一頁的標題是「想去的店」。上面還沒有店名，最下面一行只寫著：和你。）',consequences:{mem:[{npc:'heroine_01',tag:'AN_SHOP_PAGE',note:''}]}}")&&nb.includes("{if:SHOP_SEEN,speaker:null,text:'（是那一本舊手帳。翻到「想去的店」，最下面還是「和你」。旁邊多畫了一個空的勾勾格。）'}")&&!nb.includes('理由欄'),nb.slice(0,200)); }
{ // ④ 七月最後一次的邀約：r2y4b3d.js 的 play 讀函式、{remember}
  const s=SRC['src/r2y4b3d.js'], i=s.indexOf('const play=async(GM,id,arr)=>'), pf=s.slice(i,s.indexOf('\n',i));
  const seen={v:false}, said=[]; const GM={G:{name:'祐廷'},say:async(w,t)=>said.push(t)}; const who=()=>({});
  const ctxPlay=vm.runInNewContext('(function(SOCIAL,who){ '+pf+' return play; })')(mkSOCIAL(seen),who);
  const m=s.match(/last:\[(G=>[\s\S]*?),\{remember:'AN_SHOP_PAGE'\},'這一行，我想今天勾掉。','你回答。'\]/);
  const LAST=m?vm.runInNewContext('(function(SOCIAL){ return ['+m[1]+",{remember:'AN_SHOP_PAGE'},'這一行，我想今天勾掉。','你回答。']; })")(mkSOCIAL(seen)):null;
  (async()=>{ if(LAST){ await ctxPlay(GM,'heroine_01',LAST); } const first=said.slice(), n1=seen.n||0; said.length=0; if(LAST) await ctxPlay(GM,'heroine_01',LAST);
    check('4-6 ④ 七月最後一次的邀約（第 88、89 列＋第 10 節）：沒看過＝「…最下面一行沒有店名，只寫著「和你」。」、記 AN_SHOP_PAGE 一次；看過＝「…最下面那一行，還是只有「和你」。」、不重記；「這一行，我想今天勾掉。」',
      !!LAST&&J(first)===J(['（她把手帳翻到「想去的店」那一頁，推到你面前。最下面一行沒有店名，只寫著「和你」。）','這一行，我想今天勾掉。','你回答。'])&&n1===1&&J(said)===J(['（她把手帳翻到「想去的店」那一頁，推到你面前。最下面那一行，還是只有「和你」。）','這一行，我想今天勾掉。','你回答。'])&&seen.n===1,J({first,said,n:seen.n}));
    rest(); })().catch(e=>{ check('4-6 例外',false,e&&e.stack); rest(); });
}
function rest(){
// ---------- 5 S6 ----------
{ const ctx={}; ctx.window=ctx; vm.createContext(ctx); vm.runInContext(SRC['src/data/postgrad_lines.js'].replace(/^const (\w+)\s*=/m,'var $1='),ctx); const A=ctx.POSTGRAD_LINES.AN;
  check('5-1 S6 資料（第 7-5 節）：二試＝旁白「（你又打開考選部的網頁。…找到她的名字。）」、祐廷「看到妳的名字了。」、她「謝謝。一月面試。」、交往中多「我還寄了一份申請。美國的。……我只跟你講了。」（第 92 列）',
    A.see1==='（你又打開考選部的網頁。司法官二試的榜單，你往下拉，找到她的名字。）'&&A.me1==='看到妳的名字了。'&&J(A.call1)===J(['謝謝。一月面試。'])&&A.call1Dating==='我還寄了一份申請。美國的。……我只跟你講了。');
  check('5-2 錄取：旁白「（司法官考試的錄取名單公布了。你找到她的名字。）」；選項「恭喜！」／交往中「美國那份呢？」、不是交往中「看到妳的名字了。」；她「謝謝。」「但我不去。」＋不是交往中「……我申請了美國的學校，等結果。」／交往中「……美國那份，三月出來。」',
    A.see2==='（司法官考試的錄取名單公布了。你找到她的名字。）'&&J(A.call2Opts)===J([{t:'「恭喜！」'},{t:'「美國那份呢？」',tNot:'「看到妳的名字了。」'}])&&J(A.call2)===J(['謝謝。','但我不去。'])&&A.call2Not==='……我申請了美國的學校，等結果。'&&A.call2Dating==='……美國那份，三月出來。');
  check('5-3 群組由阿哲先貼（他的寫法不加句號）：「以安上了 司法官」→ 以安「謝謝。」；前任二試「以安二試過了」→「一月面試。」',J(A.group)===J(['以安上了 司法官','謝謝。'])&&J(A.exGroup1)===J(['以安二試過了','一月面試。'])&&/items:G=>\[GR\('zhe',L\(\)\.AN\.group\[0\]\),GR\('heroine_01',L\(\)\.AN\.group\[1\]\)\]/.test(SRC['src/postgrad3d.js'])&&/items:G=>\[GR\('zhe',L\(\)\.AN\.exGroup1\[0\]\),GR\('heroine_01',L\(\)\.AN\.exGroup1\[1\]\)\]/.test(SRC['src/postgrad3d.js']));
  const p=SRC['src/postgrad3d.js'], i=p.indexOf('async function anCall('), f=p.slice(i,p.indexOf('\n  /*',i));
  check('5-4 anCall 不是電話：沒有「手機響了」「（電話）」；先旁白、祐廷的訊息、她回',!/手機響了|（電話）/.test(f)&&/await GM\.say\(null,A_\.see1\); await GM\.say\(me,A_\.me1\);/.test(f)&&/await GM\.say\(null,A_\.see2\); const k=await GM\.choose/.test(f),f.slice(0,200));
  check('5-5 舊句子不在：「司法官上了。」「二試過了。一月面試。」「嗯。……三月還有一個結果。」「……先不要問。」',!inCode("'司法官上了。'").length&&!inCode('二試過了。一月面試。').length&&!inCode('三月還有一個結果').length&&!inCode('美國的。……先不要問。').length); }
// ---------- 6 CG-23 ----------
{ const s=stripC(B), i=s.indexOf("id:'ev_an_sakura_riverbank'"), r=s.slice(i,s.indexOf('};',i));
  check('6-1 河堤（第 81、82 列）：CG-23 之後她直接說「櫻花只開一個禮拜。」；說話人「手帳」那一行、「（在手帳寫一行…）」都不在',/cg\('cg_sakura_riverbank_heroine01'\),\s*\{speaker:'heroine_01',text:'櫻花只開一個禮拜。'\},\s*\{speaker:'heroine_01',text:'……所以這週的讀書會，改在這裡。'\}/.test(r)&&!/speaker:'手帳'|在手帳寫一行/.test(r),r.slice(0,300)); }
{ const want=gshow('62395d7da','docs/story_planning/cg_approved/cg_sakura_riverbank_heroine01.webp','buffer'), have=fs.readFileSync(path.join(ROOT,'assets/cg/heroine_01/cg_sakura_riverbank.webp'));
  const md=b=>crypto.createHash('md5').update(b).digest('hex');
  check('6-2 CG-23 換圖：assets/cg/heroine_01/cg_sakura_riverbank.webp＝企劃線 62395d7da 的新圖',want.length>1000&&md(want)===md(have),md(have));
  const lic=R('LICENSES.md'); check('6-3 LICENSES：CG-23 寫「換圖」、不再寫「暫不換」',/CG-23 春天的河堤（換圖/.test(lic)&&!/暫不換/.test(lic)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}

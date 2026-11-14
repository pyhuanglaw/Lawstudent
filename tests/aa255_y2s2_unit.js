// AA_255（企劃線 52900eb23；AA-C 定稿：檔首「AA 人物：照附錄 A 的改法定稿」）大二下審稿第 4 節給 LAWWW 的程式清單——收尾（任務 AA255-Y2S2）。不需要瀏覽器。
//   1 春假群組 y2_spring_plan（第 4 節第 3 點：照附錄 A 群組列，芯慈已讀不回、拿掉 P5 註解）：3/23 21:00 桌遊團七則
//   2 課堂 admin_remedy 第 7 週以安（第 4 節第 7 點：「如果……」不用「假設」開頭；附錄 A 以安表）
//   3 課堂 family_law 第 11 週阿哲（第 4 節第 7 點：刪後半；附錄 A 阿哲表）
//   2、3 由 tools/syllabus/import_syllabus.py 疊在 BB_102 的 JSON 上匯入（白名單 AA_255 附錄@52900eb23）；1 照字手動放進 story3d.js
// 修改前（開發分支 369d9d03d）：0-2（白名單沒有附錄）、1-1、1-2、1-4、1-6、2-1、3-1、4-1、4-2 FAIL（實際跑過，9 項）；0-1、1-0、2-0（讀稿）和標「對照」的照樣通過。用法：node tests/aa255_y2s2_unit.js
const fs=require('fs'), path=require('path'), cp=require('child_process');
const H=require('./pg_harness');
const {check}=H, J=JSON.stringify;
const PDOC='docs/story_planning/AA_255_附錄_審稿原文.md', SHA='52900eb23';
let MD=''; try{ MD=cp.execSync('git show '+SHA+':"'+PDOC+'"',{cwd:process.env.PG_DOC_REPO||H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ MD=''; }
const inMD=t=>MD.indexOf(t)>=0;

// ---- 0 稿、白名單 ----
check('0-1. 讀得到稿（企劃線 52900eb23 AA_255 附錄，含附錄 A 群組表）',MD.length>3000&&inMD('## AA_255 附錄 A')&&inMD('### 群組（多人）'));
{ const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(f=>f.path===PDOC);
  check('0-2. 匯入白名單：AA_255 附錄@52900eb23（approved，一個版本，approvedBy 寫明）',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&!!A[0].approvedBy,J(A)); }

// ---- 1 春假群組 ----
const SPRING=[['zhe','春假四天，要不要去哪'],['yu','海邊！！'],['classmate_bohan','要去的話要先訂車 誰會開車'],['zhe','@祐廷'],['yu','@語彤 妳可以嗎'],['heroine_03','我問蘇姨能不能排休'],['zhe','好啦那下週再排']];   /* AA_630 Z-079：語彤那一句「我問阿姨」→「我問蘇姨能不能排休」（YT-REWRITE-1103）*/
check('1-0. 讀稿：附錄 A 群組列的改法（七句、芯慈那句刪掉、P5 的註解拿掉）在稿裡',inMD('阿哲「春假四天，要不要去哪」／小語「海邊！！」／柏翰「要去的話要先訂車 誰會開車」／阿哲「@祐廷」／小語「@語彤 妳可以嗎」／語彤「我問阿姨」／阿哲「好啦那下週再排」')&&inMD('芯慈那句刪掉（她已讀，沒回）；P5 的註解拿掉'));
const spring=(name,inGroup)=>{ const d=STORY.dayOfKey('2027-03-23'); H.fresh('2027-03-23',20,'campus'); H.G.name=name||'祐廷'; if(inGroup!==false) PHONE.join(H.G,'noodle_team','法二吃飯');
  for(let h=20;h<=21.3+1e-9;h+=0.05){ H.G.hour=+h.toFixed(3); STORY.phoneRules(H.GM); PHONE.tick(H.G); }
  return {d,T:(H.G.msgs||[]).filter(m=>m.tag==='y2_spring_plan').map(m=>[m.from,m.text,m.th])}; };
{ const {T}=spring();
  check('1-1. 3/23 21:00 桌遊團七則，照附錄 A 群組列一字不差（說話的人、順序）',J(T.map(x=>[x[0],x[1]]))===J(SPRING),J(T));
  check('1-2. 芯慈已讀不回：群組裡沒有她的句子（原本「住哪裡要先決定。」）',!T.some(x=>x[0]==='classmate_xinci'),J(T));
  check('1-3. 對照：沒有人 @ 沛珊、沛珊沒有回；全部在桌遊團群組',!T.some(x=>/沛珊/.test(x[1])||x[0]==='classmate_peishan')&&T.every(x=>x[2]==='g:noodle_team'),J(T)); }
{ const {T}=spring('小明'); check('1-4. 七則的第 4 則 @ 的是玩家取的名字',T.length===7&&T[3][1]==='@小明',J(T)); }
{ const {T}=spring('祐廷',false); check('1-5. 對照：不在群組＝不發',T.length===0,J(T)); }
{ const src=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'); check('1-6. P5 的註解拿掉（story3d.js 不再寫「P5 的鋪陳」）',!src.includes('P5 的鋪陳'));}

// ---- 2、3 課堂（SYLLABUS，匯入工具疊上去的）----
const wk=(c,w)=>(SYLLABUS.courses[c]||[]).find(x=>x.w===w);
const rep=(c,w,who)=>{ const x=wk(c,w); return x&&x.obs&&x.obs.replies?x.obs.replies.filter(r=>r.who===who).map(r=>r.text):null; };
const AN7='如果申請的是一個不知道『處分』是什麼的家呢？處分書上寫了三十天，他們看得懂嗎？', ZHE11='就像系籃選隊長，大家投票，最後還是教練決定。';
check('2-0. 讀稿：以安 admin_remedy w7、阿哲 family_law w11 的改法在稿裡',inMD('「'+AN7+'」')&&inMD('「'+ZHE11+'」'));
check('2-1. 行政救濟第 7 週以安：「如果……呢？」開頭，不用「假設」（可昕的習慣）',J(rep('admin_remedy',7,'heroine_01'))===J([AN7]),J(rep('admin_remedy',7,'heroine_01')));
check('2-2. 對照：同一週芯慈、柏翰的句子照舊；那一週還是開 BB 內容（reviewed）',J(rep('admin_remedy',7,'classmate_xinci'))===J(['拒絕申請，看起來是行政處分。要件我都對過了。……可是補助如果是用契約給的呢？'])&&J(rep('admin_remedy',7,'classmate_bohan'))===J(['這題考的是第一步：審判權。法院選錯了，後面寫得再好都是零分。'])&&SYLLABUS.reviewed.includes('admin_remedy|7'));
check('3-1. 親屬第 11 週阿哲：刪後半「……可是投的人知道有人在聽。」',J(rep('family_law',11,'zhe'))===J([ZHE11]),J(rep('family_law',11,'zhe')));
check('3-2. 對照：同一週 Alison（AA_313 5-4 已改「……我十二歲也很笨啦。」）、芯慈照舊；那一週還是開 BB 內容',J(rep('family_law',11,'yu'))===J(['孩子自己的意見呢？十二歲已經很懂了好不好。……我十二歲也很笨啦。'/* RC2-PORT-DEV-1114：AA_959 第 605 列（AA_1000）拿掉開頭「欸，」 */])&&J(rep('family_law',11,'classmate_xinci'))===J(['如果孩子說了算，爸媽就會開始討好孩子。……那也不一定是壞事？'])&&SYLLABUS.reviewed.includes('family_law|11'));
check('4-1. syllabus.js 的來源寫上 AA_255 附錄（白名單版本）',/AA_255@52900eb23/.test(SYLLABUS.source),SYLLABUS.source);
check('4-2. 課表裡已經沒有舊句（「假設申請的是…」、阿哲那句的後半）',!J(SYLLABUS.courses).includes('假設申請的是')&&!J(SYLLABUS.courses).includes('可是投的人知道有人在聽'));
H.done();

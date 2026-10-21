// 普通課堂內容（BB 的 syllabus → src/data/syllabus.js；AA_104 第 1 節）＋課程代號同步（AA_110）——不需要瀏覽器。
// 檢查：每一門課都有內容（syllabus 或台詞池）、沒有多出來對不上的內容；黑板每行 ≤30 字、台詞 ≤40 字（BB 的規則）；
//       上課時用 BB 的黑板三行、教授一句、同學反應（照人物顯示名字；heroine_06 和遊戲裡還沒有的人物略過）；B 有觀察選項、C 有點名選項與收尾；
//       國文、英文、體育照台詞池；不講案號（黑板與台詞裡沒有「台上」「憲判」「釋字」＋數字）。
// 用法：node tests/syllabus_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'); global.window=global;
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/courses.js','src/data/syllabus.js','src/classes3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|COURSES|SYLLABUS|CLS)$/.test(n)?'global.'+n+'=':m),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const ids=COURSES.list.filter(c=>c.kind!=='service').map(c=>c.id);   /* 服務學習沒有課堂內容（每次一句，在 courses.js 的 serviceLines；AA_110 6-1）*/ const has=id=>{ const c=COURSES.list.find(x=>x.id===id), k=(c&&c.redo)||id; return !!(SYLLABUS.courses[k]||SYLLABUS.pools[k]); };   /* 補修（redo，AA_144 X4）＝重播原本那一門的內容 */
check('每一門課（'+ids.length+' 門）都有普通課堂內容（BB 的 syllabus 或台詞池）',ids.every(has),ids.filter(i=>!has(i)).join(','));
const extra=[...Object.keys(SYLLABUS.courses),...Object.keys(SYLLABUS.pools)].filter(i=>!ids.includes(i)&&!(SYLLABUS.y0||[]).includes(i)); check('內容的課程代號都對得上 courses.js（AA_103 第 8 節；經濟系那一年 y0 的課遊戲裡還沒有，先不算）',!extra.length,extra.join(','));
{ const long=[]; const caseNo=[]; const re=/(台上|憲判|釋字|台再|消上)\s*\d|\d+\s*(台上|憲判)/;
  for(const id in SYLLABUS.courses) for(const w of SYLLABUS.courses[id]){ for(const b of (w.board||[])){ if([...b].length>30) long.push(id+' W'+w.w+' 黑板 '+[...b].length); if(re.test(b)) caseNo.push(id+' W'+w.w+' '+b); } if(w.line&&[...w.line].length>40) long.push(id+' W'+w.w+' 台詞 '+[...w.line].length); if(w.line&&re.test(w.line)) caseNo.push(id+' W'+w.w+' '+w.line); }
  check('黑板每行 ≤30 字、教授台詞 ≤40 字（BB 的規則）',!long.length,long.length+'：'+long.slice(0,6).join('；'));
  check('黑板與台詞不講案號（AA_103 第 5 節）',!caseNo.length,caseNo.slice(0,3).join('；')); }
// 上課時的內容
const itOf=(day,cid)=>CLS.dayItems({day,hour:8,flags:{}}).find(it=>it.c.id===cid);
// 法律審查（AA_122 第 0a 節，使用者 2026-10-14 同意）：還沒審查的週不用 BB 的內容。reviewed 由 tools/syllabus/import_syllabus.py 照 BB_115 產生：
// 那一週的審查項目全部通過、或那一週沒有項目才開（AA 2026-10-14）。其他週只用寫主題的一般句子
{ const allKeys=[]; for(const id in SYLLABUS.courses) for(const w of SYLLABUS.courses[id]) allKeys.push(id+'|'+w.w); let R=SYLLABUS.reviewed||[];
  check('法律審查：reviewed 照 BB_115 產生（'+R.length+'／'+allKeys.length+' 週開；每一筆都對得上課表的週）',R.length>0&&R.length<=allKeys.length&&R.every(k=>allKeys.includes(k)),R.filter(k=>!allKeys.includes(k)).slice(0,3).join(','));
  /* 2026-10-16 BB_115 第 22 批以後 608 週全部通過：沒有關著的週時，拿掉每 7 週一週，確認「沒審查的週不用 BB 內容」這條規則本身還在 */
  if(R.length===allKeys.length){ R=allKeys.filter((k,i)=>i%7!==3); SYLLABUS.reviewed=R; }
  const shown=[], hidden=[]; let n=0, m=0; for(let d=1;d<1500;d++){ for(const it of CLS.dayItems({day:d,hour:8,flags:{}})){ if(it.exam||it.c.kind==='service') continue; const sy=(SYLLABUS.courses[it.c.id]||[]).find(q=>q.w===it.week); if(!sy) continue; const ct=CLS.content(it); if(ct.second) continue;
      const bb=(!!sy.line&&ct.line===sy.line)||(sy.board||[]).slice(1).some(b=>b&&ct.board.includes(b));
      if(!R.includes(it.c.id+'|'+it.week)){ n++; if(bb||ct.tpl||ct.obs||ct.call) shown.push(d+' '+it.c.id+' W'+it.week); } else { m++; if(!bb&&(sy.line||(sy.board||[]).slice(1).some(Boolean))) hidden.push(d+' '+it.c.id+' W'+it.week); } } }
  check('沒審查過的週：黑板、教授一句、觀察／點名都不用 BB 的內容（大一到大四 '+n+' 堂）',n>0&&!shown.length,shown.slice(0,4).join(' | '));
  check('審查過的週：用 BB 的黑板、教授一句（大一到大四 '+m+' 堂）',m>0&&!hidden.length,hidden.slice(0,4).join(' | '));
  SYLLABUS.reviewed=allKeys; }   /* 下面檢查「審查過的週」怎麼顯示：先當作全部審查過 */
{ const it=itOf(dayOf('2025-09-18'),'civ_general');   /* 第 3 週週四 */ const ct=CLS.content(it);
  check('民法總則第 3 週：BB 的黑板三行、周教授一句（開學改 9/1 以後是「權利主體」，BB_170 第 31 列 d3c04223）',it.week===3&&ct.board[0]==='民法總則：權利主體'&&/不完全一樣/.test(ct.line),JSON.stringify(ct).slice(0,200));
  { const w1=(SYLLABUS.courses.civ_general||[]).find(q=>q.w===1)||{}; check('民法總則第 1 週＝課程說明＋相機暖身（special），周教授「今天不教，先問你們的直覺」',w1.special===true&&(w1.board||[]).some(b=>/網拍相機/.test(b))&&/直覺/.test(w1.line||''),JSON.stringify(w1).slice(0,200)); }
  check('民法總則第 3 週沒有同學發言（BB 2026-10-13：A 類課堂最多四成有同學發言）',ct.react==='',ct.react); }
{ const it=itOf(dayOf('2025-10-02'),'civ_general'); const ct=CLS.content(it);   /* 第 5 週：C，小語、阿哲各一句（顯示其中一句）*/
  check('同學反應照人物顯示名字（阿哲／小語／不認識的同學照揭露規則）、用引號',/^.+：「.+」$/.test(ct.react)||/^.+（.+）$/.test(ct.react),ct.react); }
{ const it=itOf(dayOf('2025-11-13'),'civ_general');   /* 第 11 週（11/10 那一週）的週四：B 觀察 */ const ct=CLS.content(it); check('民法總則第 11 週是 B：有觀察的三個選項、每個有一行結果',ct.tpl==='B'&&ct.obs.options.length===3&&ct.obs.options.every(o=>o.result),JSON.stringify(ct.obs).slice(0,160)); }
{ const it=itOf(dayOf('2025-10-02'),'civ_general');   /* 第 5 週：C 被點到 */ const ct=CLS.content(it); check('民法總則第 5 週是 C：被點到的三個選項＋共用收尾',ct.tpl==='C'&&ct.call.options.length===3&&ct.call.follow.length>=1,JSON.stringify(ct.call).slice(0,160)); }
{ const it=itOf(dayOf('2025-09-23'),'chinese_y1'); const ct=CLS.content(it); check('大一國文（上）：台詞池的一句、老師叫「國文老師」',ct.line&&SYLLABUS.pools.chinese_y1.lines.includes(ct.line)&&ct.prof==='國文老師',ct.line); }
{ let bad=[]; for(let d=1;d<200;d++){ for(const it of CLS.dayItems({day:d,hour:8,flags:{}})){ if(it.exam) continue; const ct=CLS.content(it); if(/heroine_06|jp_|econ_/.test(ct.react)) bad.push(d+' '+it.c.id+' '+ct.react); if(!ct.line) bad.push(d+' '+it.c.id+' 沒有台詞'); } }
  check('大一整年每一堂課都有台詞；同學反應不會出現還沒確認的人物（heroine_06、日文班、經濟系）',!bad.length,bad.slice(0,4).join(' | ')); }
/* 一週兩格的課（大三上的民訴甲上、刑訴；AA_103）：第二格是 BB 的短片段（second_slot_lines）；第一格碰到國定假日，那一週的主要內容改在同一週的第二格（AA_110 5-6）。
   AA 的例子：民訴甲上第 6 週週一 2027-10-11（國慶補假）的「訴訟標的」→ 週四；刑訴第 4 週週二 2027-09-28（教師節）的「搜索」→ 週五。修改前第二格和第一格一樣、短片段沒有匯入 */
{ const wk=(id,w)=>(SYLLABUS.courses[id]||[]).find(q=>q.w===w)||{}; const sec=id=>(SYLLABUS.second||{})[id]||[];
  check('BB 的第二格短片段有匯入（民訴甲上、刑訴各 6 句）',sec('civpro_1').length===6&&sec('crimpro').length===6);
  const m5=itOf(dayOf('2027-10-04'),'civpro_1'), t5=itOf(dayOf('2027-10-07'),'civpro_1'); const cm5=m5&&CLS.content(m5), ct5=t5&&CLS.content(t5);
  check('民訴甲上第 5 週：週一是那一週的主要內容、週四是第二格的短片段',!!cm5&&cm5.line===wk('civpro_1',5).line&&!!ct5&&ct5.second===true&&sec('civpro_1').includes(ct5.line),(cm5&&cm5.line)+' ／ '+(ct5&&ct5.line));
  const m6=itOf(dayOf('2027-10-11'),'civpro_1'), t6=itOf(dayOf('2027-10-14'),'civpro_1'); const ct6=t6&&CLS.content(t6);
  check('民訴甲上第 6 週：週一（國慶補假）停課，主要內容（訴訟標的）改在週四播',!m6&&!!ct6&&!ct6.second&&ct6.line===wk('civpro_1',6).line&&/訴訟標的/.test(JSON.stringify(wk('civpro_1',6).board)),(ct6&&ct6.line)+' '+JSON.stringify(wk('civpro_1',6).board));
  const tu4=itOf(dayOf('2027-09-28'),'crimpro'), f4=itOf(dayOf('2027-10-01'),'crimpro'); const cf4=f4&&CLS.content(f4);
  check('刑訴第 4 週：週二（教師節）停課，主要內容（搜索）改在週五播',!tu4&&!!cf4&&!cf4.second&&cf4.line===wk('crimpro',4).line&&/搜索/.test(JSON.stringify(wk('crimpro',4).board)),(cf4&&cf4.line)+' '+JSON.stringify(wk('crimpro',4).board)); }
// 特殊課堂的週次：courses.js 的 specials 和 BB 的課堂內容（syllabus 的 special）一致（BB 2026-10-13：「週次以課堂內容所在的週為準」）
{ const bad=[]; for(const c of COURSES.list){ const a=(c.specials||[]).map(s=>s.w).sort((x,y)=>x-y), ws=(SYLLABUS.courses[c.id]||[]).filter(w=>w.special).map(w=>w.w).sort((x,y)=>x-y); if(JSON.stringify(a)!==JSON.stringify(ws)) bad.push(c.id+' '+JSON.stringify(a)+'≠'+JSON.stringify(ws)); }
  check('每一門課的特殊課堂週次＝BB 課堂內容標 special 的週次（經原第 3 週第一次走進這門課、第 4 週分組、法理學第 6 週、國際公法第 15 週、智財第 5 週、專題研究第 10 週）',!bad.length,bad.join(' | ')); }
// 經濟系那一年（G.day 是負的）：每一堂的老師一句、同學反應都要是字串（BB_218：2024-09-04 微積分、體育顯示「老師：undefined」——輪流序號 (day+week)%n 變負的）
{ const d0=dayOf('2024-09-01'), d1=dayOf('2025-06-30'), bad=[]; let n=0;
  for(let d=d0; d<=d1; d++) for(const it of CLS.dayItems({day:d,hour:8,flags:{},stage:'econ'})){ if(it.exam) continue; const ct=CLS.content(it); n++; if(typeof ct.line!=='string'||!ct.line||ct.react==null||String(ct.react).includes('undefined')) bad.push(d+' '+it.c.id+' W'+it.week+' '+String(ct.line)); }
  check('經濟系那一年 '+n+' 堂：老師一句都是字串、沒有 undefined',n>0&&!bad.length,bad.slice(0,4).join(' | ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

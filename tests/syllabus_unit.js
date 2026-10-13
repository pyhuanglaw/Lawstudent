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
const ids=COURSES.list.map(c=>c.id); const has=id=>!!(SYLLABUS.courses[id]||SYLLABUS.pools[id]);
check('每一門課（'+ids.length+' 門）都有普通課堂內容（BB 的 syllabus 或台詞池）',ids.every(has),ids.filter(i=>!has(i)).join(','));
const extra=[...Object.keys(SYLLABUS.courses),...Object.keys(SYLLABUS.pools)].filter(i=>!ids.includes(i)); check('內容的課程代號都對得上 courses.js（AA_103 第 8 節）',!extra.length,extra.join(','));
{ const long=[]; const caseNo=[]; const re=/(台上|憲判|釋字|台再|消上)\s*\d|\d+\s*(台上|憲判)/;
  for(const id in SYLLABUS.courses) for(const w of SYLLABUS.courses[id]){ for(const b of (w.board||[])){ if([...b].length>30) long.push(id+' W'+w.w+' 黑板 '+[...b].length); if(re.test(b)) caseNo.push(id+' W'+w.w+' '+b); } if(w.line&&[...w.line].length>40) long.push(id+' W'+w.w+' 台詞 '+[...w.line].length); if(w.line&&re.test(w.line)) caseNo.push(id+' W'+w.w+' '+w.line); }
  check('黑板每行 ≤30 字、教授台詞 ≤40 字（BB 的規則）',!long.length,long.length+'：'+long.slice(0,6).join('；'));
  check('黑板與台詞不講案號（AA_103 第 5 節）',!caseNo.length,caseNo.slice(0,3).join('；')); }
// 上課時的內容
const itOf=(day,cid)=>CLS.dayItems({day,hour:8,flags:{}}).find(it=>it.c.id===cid);
{ const it=itOf(dayOf('2025-09-18'),'civ_general');   /* 第 3 週週四 */ const ct=CLS.content(it);
  check('民法總則第 3 週：BB 的黑板三行、周教授一句',it.week===3&&ct.board[1]==='案例：網拍相機 1,000 元'&&/直覺/.test(ct.line),JSON.stringify(ct).slice(0,200));
  check('同學反應照人物顯示名字（阿哲／小語／不認識的同學照揭露規則）、用引號',/^.+：「.+」$/.test(ct.react)||/^.+（.+）$/.test(ct.react),ct.react); }
{ const it=itOf(dayOf('2025-11-13'),'civ_general');   /* 第 11 週（11/10 那一週）的週四：B 觀察 */ const ct=CLS.content(it); check('民法總則第 11 週是 B：有觀察的三個選項、每個有一行結果',ct.tpl==='B'&&ct.obs.options.length===3&&ct.obs.options.every(o=>o.result),JSON.stringify(ct.obs).slice(0,160)); }
{ const it=itOf(dayOf('2025-10-02'),'civ_general');   /* 第 5 週：C 被點到 */ const ct=CLS.content(it); check('民法總則第 5 週是 C：被點到的三個選項＋共用收尾',ct.tpl==='C'&&ct.call.options.length===3&&ct.call.follow.length>=1,JSON.stringify(ct.call).slice(0,160)); }
{ const it=itOf(dayOf('2025-09-23'),'chinese_y1'); const ct=CLS.content(it); check('大一國文（上）：台詞池的一句、老師叫「國文老師」',ct.line&&SYLLABUS.pools.chinese_y1.lines.includes(ct.line)&&ct.prof==='國文老師',ct.line); }
{ let bad=[]; for(let d=1;d<200;d++){ for(const it of CLS.dayItems({day:d,hour:8,flags:{}})){ if(it.exam) continue; const ct=CLS.content(it); if(/heroine_06|jp_|econ_/.test(ct.react)) bad.push(d+' '+it.c.id+' '+ct.react); if(!ct.line) bad.push(d+' '+it.c.id+' 沒有台詞'); } }
  check('大一整年每一堂課都有台詞；同學反應不會出現還沒確認的人物（heroine_06、日文班、經濟系）',!bad.length,bad.slice(0,4).join(' | ')); }
// 特殊課堂的週次：courses.js 的 specials 和 BB 的課堂內容（syllabus 的 special）一致（BB 2026-10-13：「週次以課堂內容所在的週為準」）
{ const bad=[]; for(const c of COURSES.list){ const a=(c.specials||[]).map(s=>s.w).sort((x,y)=>x-y), ws=(SYLLABUS.courses[c.id]||[]).filter(w=>w.special).map(w=>w.w).sort((x,y)=>x-y); if(JSON.stringify(a)!==JSON.stringify(ws)) bad.push(c.id+' '+JSON.stringify(a)+'≠'+JSON.stringify(ws)); }
  check('每一門課的特殊課堂週次＝BB 課堂內容標 special 的週次（經原第 4 週分組、法理學第 6 週、國際公法第 15 週、智財第 5 週、專題研究第 10 週）',!bad.length,bad.join(' | ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

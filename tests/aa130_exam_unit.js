// 期末考（使用者 2026-10-14 16:15、17:10；企劃分支 AA_126 1-5、AA_130 第 3 節，AA 轉達）——不需要瀏覽器。AA_130 第 6 節第 4～7 項＋課堂題優先：
//   4. 刑訴期末考：抽 5 題、不重複、題目選項答案和 QBANK 一模一樣、讀檔再考是同一份；
//   5. 題庫夠的課（民法身分法）：5 題都出自這門課、這學期；
//   6. 不足 5 題（行政救濟法 4 題、憲法（上）0 題）：不開考、顯示題庫不足的訊息、錯誤碼、成績單「未開考（題庫不足）」、沒有任何補題、不算被當；
//   7. 一門課一學期只考一次；大一上民法總則（週四的兩堂都放假）排在 1/2 週五下午一；
//   另外：課堂題（askedIn／CLASS_DISC）優先（3_2 已拿掉）、期中練習只抽第 1～7 週、答對題數的分數、交卷後答錯的題目顯示考點。
// 修改前：EXAM_BANK、CLS.drawExam 都不存在（第 0 項就失敗）。用法：node tests/aa130_exam_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const errs=[]; const cerr=console.error; console.error=(...a)=>{ errs.push(a.join(' ')); };
const load=f=>{ if(!fs.existsSync(path.join(ROOT,f))) return; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(day,hour)=>({day,hour,flags:{},weekday:CALENDAR.dateOf(day).wd%7,zone:'dorm'});
function mkGM(G,answer){ const log=[]; return {G,log,D:{active:false},E:{player:{busy:false}},sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.push(t); },toast(){},choose:async o=>{ log.push('choose:'+o.map(q=>q.t).join(' / ')); return answer?answer(o,log):0; },fade:async()=>{},advance(){},sleep:async()=>{},caption(){},autosave(){},setGoal(){} }; }
(async()=>{
  check('0. 題庫資料檔已載入、有抽題函式',typeof EXAM_BANK!=='undefined'&&typeof CLS.drawExam==='function'&&typeof CLS.runExam==='function');
  if(typeof EXAM_BANK==='undefined'||typeof CLS.drawExam!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  check('0. 題庫只有使用者確認的正式題目、交叉審通過的 AI 補題（大一～大三，source AI_Y1Y3）與交叉審通過的題目（大四）；沒有 AI 草稿、沒有刪掉的課',EXAM_BANK.questions.every(q=>(/^Y4/.test(q.term)?q.status==='Y4_CROSS_REVIEWED':(q.status==='USER_CONFIRMED'||(q.status==='AI_CROSS_REVIEWED'&&q.source==='AI_Y1Y3'))))&&!EXAM_BANK.files.some(f=>/封存/.test(f.path))&&!EXAM_BANK.questions.some(q=>['law_society','juris','intl_public','legal_history','fair_trade','conflict_laws','law_society_2'].includes(q.course)),EXAM_BANK.source);
  // 4. 刑訴
  { const G=mkG(dayOf('2027-12-28'),9); const r=CLS.drawExam(G,'crimpro','Y3S1','final'); const ids=(r.qs||[]).map(q=>q.id);
    check('4. 刑訴期末考：抽 5 題、不重複',r.ok&&ids.length===5&&new Set(ids).size===5,JSON.stringify(ids));
    const same=r.qs&&r.qs.every(q=>{ if(q.source==='CLASS_DISC') return q.course==='crimpro'&&q.status==='USER_CONFIRMED'; const o=QBANK.find(x=>x.id===q.id); return o&&o.q===q.q&&JSON.stringify(o.options)===JSON.stringify(q.options)&&o.answer===q.answer&&o.core===q.core; });   /* 2026-10-15 起刑訴多一題討論課題目（BB-B 64406c8，使用者確認）*/
    check('4. 題目、選項、答案、考點和 QBANK 一模一樣（討論課題目是使用者確認的刑訴題）',!!same);
    const back=JSON.parse(JSON.stringify(G)); const r2=CLS.drawExam(back,'crimpro','Y3S1','final');
    check('4. 讀檔（JSON 來回）再考是同一份',r2.ok&&JSON.stringify(r2.qs.map(q=>q.id))===JSON.stringify(ids),JSON.stringify(r2.qs&&r2.qs.map(q=>q.id)));
    const G3=mkG(dayOf('2027-12-28'),9); G3.flags.examSeed=G.flags.examSeed+1; const r3=CLS.drawExam(G3,'crimpro','Y3S1','final');
    check('4. 不同的存檔（種子不同）抽到的不一定一樣（84 題抽 5 題）',r3.ok&&JSON.stringify(r3.qs.map(q=>q.id))!==JSON.stringify(ids)); }
  // 5. 題庫夠的課
  { const G=mkG(dayOf('2027-06-20'),9); const pool=CLS.examPool('family_law','Y2S2','final'); const r=CLS.drawExam(G,'family_law','Y2S2','final');
    check('5. 民法身分法：5 題都出自這門課、這學期（題庫 '+(pool.cls.length+pool.bank.length)+' 題）',r.ok&&r.qs.length===5&&r.qs.every(q=>q.course==='family_law'&&q.term==='Y2S2')); }
  // 6. AI 補題（exam_ai 91 題，使用者 2026-10-16 授權、10-18「下一個版本就要放進去」，AA-C 7e00eaa4）：抽題順序 課堂題 → 正式題庫 → AI 題補到 5 題（exam_ai/README.md 第 3 節）
  { const G=mkG(dayOf('2025-12-22'),9); const n=CLS.examPool('const_1','Y1S1','final'); const off=n.cls.concat(n.bank);
    const it={c:CLS.byId('const_1'),exam:'final',term:'Y1S1',key:'x'}; const GM=mkGM(G); errs.length=0; const res=await CLS.runExam(GM,it); const r=CLS.drawExam(G,'const_1','Y1S1','final');
    check('6. 憲法（上）（正式 '+off.length+' 題＋AI '+n.ai.length+' 題）：開考，5 題',off.length<5&&n.ai.length>0&&res.held!==false&&r.ok&&r.qs.length===5,GM.log.slice(0,2).join(' | '));
    check('6. 正式題排在前面、AI 題只補剩下的',r.qs.slice(0,off.length).every(q=>q.status==='USER_CONFIRMED')&&r.qs.slice(off.length).every(q=>q.status==='AI_CROSS_REVIEWED'),JSON.stringify(r.qs.map(q=>q.status)));
    check('6. 考卷不顯示題目來源（AI_Y1Y3、AI、出題者）',!GM.log.some(t=>/AI_Y1Y3|AI_CROSS|author|來源/.test(t)));
    const rep=CLS.reportFor(G,'Y1S1'); check('6. 成績單：憲法（上）有分數，不是「未開考」',/分$/.test(rep.const_1||''),JSON.stringify(rep));
    const G0=mkG(dayOf('2026-06-15'),9); const r0=CLS.drawExam(G0,'const_2','Y1S2','final'); check('6. 憲法（下）沒有正式題目：5 題都是 AI 補題，開考',r0.ok&&r0.qs.every(q=>q.status==='AI_CROSS_REVIEWED'));
    const G1=mkG(dayOf('2025-12-22'),9); const p1=CLS.examPool('civ_general','Y1S1','final'), r1=CLS.drawExam(G1,'civ_general','Y1S1','final');
    check('6. 民法總則（正式 '+(p1.cls.length+p1.bank.length)+' 題、AI '+p1.ai.length+' 題）：正式題夠，不用 AI 題',p1.ai.length>0&&r1.ok&&r1.qs.every(q=>q.status==='USER_CONFIRMED'));
    for(const [c,t,d] of [['civpro_1','Y3S1','2027-12-28'],['civpro_2','Y3S2','2028-06-12'],['company_law','Y3S1','2027-12-28'],['insurance','Y3S2','2028-06-12'],['negotiable','Y3S2','2028-06-12'],['labor_law','Y3S2','2028-06-12']]){ const rr=CLS.drawExam(mkG(dayOf(d),9),c,t,'final'); check('6. '+c+'（'+t+'）可以開考',rr.ok&&rr.qs.length===5,JSON.stringify(rr.n)); } }
  { const G=mkG(dayOf('2026-01-20'),9); const rep=CLS.reportFor(G,'Y1S1'), bad=Object.entries(rep).filter(([k,v])=>/題庫不足/.test(v));
    check('6. GRADE-NOBANK：期末考沒考的課＝「缺考」（題數算進 AI 補的題）；成績單沒有「題庫不足」；缺考算被當（D42：「缺考（不及格，下學期重修）」）',!bad.length&&/^缺考（不及格，下學期重修）$/.test(rep.const_1),JSON.stringify(rep)); }
  // 6. 不足 5 題（現在沒有這種課了：暫時把憲法（下）的題庫減到 3 題，確認不開考的路照舊）
  { const keep=EXAM_BANK.questions.slice(); let k=0; EXAM_BANK.questions=EXAM_BANK.questions.filter(q=>!(q.course==='const_2'&&q.term==='Y1S2')||(k++<3));
    const G=mkG(dayOf('2026-06-15'),9); const it={c:CLS.byId('const_2'),exam:'final',term:'Y1S2',key:'x'}; const GM=mkGM(G); errs.length=0; const res=await CLS.runExam(GM,it);
    check('6. 只有 3 題：不開考，顯示「這一科的期末考題庫還沒準備好（題目 3／5）。這學期不舉行期末考。」',res.held===false&&GM.log.includes('這一科的期末考題庫還沒準備好（題目 3／5）。這學期不舉行期末考。'),GM.log.join(' | '));
    check('6. 錯誤碼 EXAM_BANK_INSUFFICIENT const_2',errs.some(e=>e.startsWith('EXAM_BANK_INSUFFICIENT const_2')),errs.join(' | '));
    check('6. 沒有任何補題（沒有出現選項）',!GM.log.some(t=>t.startsWith('choose:')));
    const rep=CLS.reportFor(G,'Y1S2'); check('6. 成績單：憲法（下）「未開考」（不算被當；「題庫不足」是開發用語，玩家版不顯示，BB 退件 GRADE-NOBANK）',rep.const_2==='未開考',JSON.stringify(rep));
    const sh=CLS.examShort(G,'Y1S2'); check('6. ?dev 清單（CLS.examShort）列出不到 5 題的課',sh.some(e=>e.id==='const_2'&&e.n===3),JSON.stringify(sh));
    EXAM_BANK.questions=keep; }
  { const G=mkG(dayOf('2025-12-15'),9); const sh=typeof CLS.examShort==='function'?CLS.examShort(G,'Y1S1'):null;   /* 16 週制：12/15 是期末週 */
    check('6. ?dev 清單（CLS.examShort）：大一上沒有不開考的課（憲法（上）有 AI 補題）',!!sh&&!sh.some(e=>e.id==='const_1'),JSON.stringify(sh));
    const sh2=typeof CLS.examShort==='function'?CLS.examShort(G):null; check('6. 不給學期就用今天的學期（2025-12-15＝大一上）',JSON.stringify(sh2)===JSON.stringify(sh)); }
  { const G=mkG(dayOf('2027-06-20'),9); const r=CLS.drawExam(G,'admin_remedy','Y2S2','final'); check('6. 行政救濟法（BB-B cd62e99 補到 5 題）：可以開考',r.ok&&r.qs.length===5); }
  // 7. 一門課一學期只考一次；考試那天放假＝同一週補考（16 週制：期末只有第 16 週）
  { const G=mkG(dayOf('2025-12-15'),8); const d=CLS.examDay(G,CLS.byId('civ_general'),'Y1S1','final'); const dt=d&&CALENDAR.dateOf(d.day);
    check('7. 大一上民法總則：期末考在第 16 週週四 12/18 下午一（16 週制以後 12/25、1/1 在寒假，不用補考）',!!d&&!d.makeup&&dt.m===12&&dt.d===18&&d.block==='pm1',JSON.stringify({d,dt}));
    const it=CLS.dayItems(G,d.day).find(x=>x.c.id==='civ_general'); check('7. 12/18 那天的課表有民法總則（考試）',!!it&&it.exam==='final'&&it.examMain===true&&it.slot.block==='pm1');
    let n=0; for(let day=dayOf('2025-12-15');day<=dayOf('2025-12-21');day++) n+=CLS.dayItems(G,day).filter(x=>x.c.id==='crim_gen1').length;
    check('7. 刑法總則（一）在期末考週只考一次（不是每一堂都考）',n===1,'次數 '+n);
    let m=0; for(let day=dayOf('2027-11-01');day<=dayOf('2028-02-20');day++){ const t=CALENDAR.termOf(day); if(!t||t.id!=='Y3S1'||t.week!==16) continue; m+=CLS.dayItems(mkG(day,8),day).filter(x=>x.c.id==='crimpro').length; }
    check('7. 刑事訴訟法（一週兩堂）在期末考週（第 16 週）只考一次',m===1,'次數 '+m);
    /* 放假補考：期末週有國定假日的學期（AA_197 1-6：115 上 12/25、115 下端午 6/9、116 上 12/24），找一門考試那天剛好放假的課 */
    let mk=null; for(const T of ['Y2S1','Y2S2','Y3S1']) for(const c of CLS.termCourses(mkG(CALENDAR.termDays(T).from,8),T)){ if(mk||!CLS.isExamCourse(c)) continue; const e=CLS.examDay(mkG(CALENDAR.termDays(T).from,8),c,T,'final'); if(e&&e.makeup) mk={c:c.id,T,e}; }
    check('7. 考試那堂放假：補在同一週（第 16 週）沒有衝堂、不是假日的平日'+(mk?'（'+mk.c+' '+mk.T+'）':'（這幾個學期沒有遇到，照規則檢查）'),!mk||(CALENDAR.termOf(mk.e.day).week===16&&!CALENDAR.holiday(mk.e.day)&&CALENDAR.dateOf(mk.e.day).wd<=5),JSON.stringify(mk)); }
  // 課堂題優先（假資料：只在這個測試裡把兩題標成課堂上問過）
  { const qs=EXAM_BANK.questions.filter(q=>q.course==='family_law'&&q.term==='Y2S2'); const real=new Map(qs.filter(q=>q.askedIn).map(q=>[q,q.askedIn])); for(const q of real.keys()) delete q.askedIn;   /* 2026-10-15 起題庫有真的課堂題（BB 排的 ask）：這一段只看兩題假資料，先拿掉、最後放回 */
    const a=qs[qs.length-1], b=qs[qs.length-2]; a.askedIn={term:'Y2S2',course:'family_law',week:3}; b.source='CLASS_DISC';
    const G=mkG(dayOf('2027-06-20'),9); const r=CLS.drawExam(G,'family_law','Y2S2','final'); const ids=r.qs.map(q=>q.id);
    check('課堂題優先（class_first）：課堂上問過的兩題一定在考卷上',ids.includes(a.id)&&ids.includes(b.id),JSON.stringify(ids));
    /* EXAM_MIX 3_2 已拿掉（AA_126 1-5 方案一定案，2026-10-15）：課堂題夠 5 題就全部是課堂題 */
    delete a.askedIn; delete b.source; for(const [q,v] of real) q.askedIn=v; { const G3=mkG(dayOf('2027-06-20'),9); G3.flags.examSeed=11; const pool=CLS.examPool('family_law','Y2S2','final'); const r3=CLS.drawExam(G3,'family_law','Y2S2','final'); check('課堂題 '+pool.cls.length+' 題（≥5）：考卷 5 題全是課堂上問過的',pool.cls.length>=5&&r3.ok&&r3.qs.every(q=>pool.cls.includes(q)),JSON.stringify(r3.qs&&r3.qs.map(q=>q.id))); } }
  // 期中練習只抽第 1～7 週
  { const G=mkG(dayOf('2027-04-12'),9); const p=CLS.examPool('family_law','Y2S2','mid'); check('期中練習：只收第 1～7 週範圍的題目',p.cls.concat(p.bank).every(q=>q.scopeWeek==null||q.scopeWeek<=7)); }
  // 作答與分數
  { check('分數：答對 5～0 題＝100、90、80、70、60、0',[5,4,3,2,1,0].map(CLS.scoreOf).join(',')==='100,90,80,70,60,0');
    const G=mkG(dayOf('2027-12-28'),9); const r=CLS.drawExam(G,'crimpro','Y3S1','final'); let i=0;
    const GM=mkGM(G,(o)=>{ const q=r.qs[i++]; const vals=q.type==='tf'||!q.options?['對','錯']:Object.keys(q.options); const k=vals.indexOf(q.answer); return i===1?(k===0?1:0):k; });   /* 第 1 題故意答錯，其他答對 */
    const res=await CLS.runExam(GM,{c:CLS.byId('crimpro'),exam:'final',term:'Y3S1'});
    check('五題答完才交卷：答對 4 題＝90 分，記進存檔',res.held&&res.correct===4&&res.score===90&&CLS.rec(G).exam['Y3S1:crimpro:final'].score===90,JSON.stringify(res));
    const q1=r.qs[0]; check('交卷後答錯的那一題顯示答案'+(q1.core?'與使用者給的考點':'（這一題使用者沒有給考點，就不顯示）'),GM.log.some(t=>t.startsWith('第 1 題的答案：')&&(q1.core?t.includes('考點：'+q1.core):!t.includes('考點：'))),GM.log.slice(-3).join(' | '));
    check('只有答錯的題目顯示答案（答對的 4 題不顯示）',GM.log.filter(t=>/^第 \d 題的答案：/.test(t)).length===1);
    check('成績單：刑事訴訟法「90 分」',CLS.reportFor(G,'Y3S1').crimpro==='90 分',JSON.stringify(CLS.reportFor(G,'Y3S1'))); }
  // 交卷後的法條（AA 2026-10-14 17:4x）：大一～大三的 basis／mapBasis 是 AA、BB 對週次自己標的、不是使用者給的——不顯示；大四（AI 出題、使用者授權）照顯示
  { check('題庫資料：大一～大三（USER_CONFIRMED）的題目沒有 basis、mapBasis 欄位',EXAM_BANK.questions.filter(q=>q.status==='USER_CONFIRMED').every(q=>!('basis' in q)&&!('mapBasis' in q)));
    const wrong=qs=>{ let i=0; return ()=>{ const q=qs[i++]; const vals=q.type==='tf'||!q.options?['對','錯']:Object.keys(q.options); return vals.indexOf(q.answer)===0?1:0; }; };
    const fam=EXAM_BANK.questions.filter(q=>q.course==='family_law'&&q.term==='Y2S2'); const keep=fam.map(q=>[q,q.basis,q.mapBasis]); fam.forEach(q=>{ q.basis='民法 §9999（測試）'; q.mapBasis='民法 §8888（測試）'; });   /* 就算資料裡有（舊格式），畫面也不顯示 */
    const G=mkG(dayOf('2027-06-20'),9); const r=CLS.drawExam(G,'family_law','Y2S2','final'); const GM=mkGM(G,wrong(r.qs)); const res=await CLS.runExam(GM,{c:CLS.byId('family_law'),exam:'final',term:'Y2S2'});
    const rev=GM.log.filter(t=>/^第 \d 題的答案：/.test(t));
    check('大一～大三交卷後：答錯的 5 題都顯示答案與考點，不顯示 basis／mapBasis',res.correct===0&&rev.length===5&&rev.every(t=>t.includes('考點：')&&!t.includes('§9999')&&!t.includes('§8888')),rev.join(' | '));
    keep.forEach(([q,b,m])=>{ if(b===undefined) delete q.basis; else q.basis=b; if(m===undefined) delete q.mapBasis; else q.mapBasis=m; });
    const y4={}; EXAM_BANK.questions.filter(q=>q.status==='Y4_CROSS_REVIEWED').forEach(q=>{ const k=q.course+'|'+q.term; y4[k]=(y4[k]||0)+1; }); const [c4,t4]=Object.keys(y4).sort((a,b)=>y4[b]-y4[a])[0].split('|');
    const G4=mkG(dayOf('2028-12-20'),9); const r4=CLS.drawExam(G4,c4,t4,'final'); const GM4=mkGM(G4,wrong(r4.qs)); await CLS.runExam(GM4,{c:CLS.byId(c4),exam:'final',term:t4});
    const rev4=GM4.log.filter(t=>/^第 \d 題的答案：/.test(t)), withB=r4.qs.filter(q=>q.basis);
    check('大四（'+c4+'）交卷後：有法條的題目顯示法條',rev4.length===5&&withB.length>0&&withB.every(q=>rev4.some(t=>t.includes('（'+q.basis+'）'))),rev4.slice(0,2).join(' | ')); }
  // 非法律課不考五題
  { check('非法律課（大一國文、體育）不考五題',!CLS.isExamCourse(CLS.byId('chinese_y1'))&&!CLS.isExamCourse(CLS.byId('pe_y1s1'))); }
  console.error=cerr; console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error=cerr; console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

// D118-B3-1102（docs/handoff/D118_PLAN.md 第 2 節第四點、第 4 節 D118-B3、第 1 節 ②-3～②-5；使用者 05:0x「沒有期中考」＝只有 'final'）：一鍵總複習（期末）——不需要瀏覽器。
//   a 沒讀過書的存檔在期末考前一晚做一次總複習 → 每一科 drawExam 會抽到的 5 題，對到的卡都是「讀過」以上（跳過、提早結束也算讀過）
//   b 做總複習前後，drawExam 抽到的題號完全相同（R.exam、examSeed 不動；成績公式不動）
//   c 時段次數用完也能做（不呼叫 slotUse）；耗 3 小時、G.stats.study +3、照常觸發 STORY.onStudy（地點照實際讀書的地方）；21:00 以後不給（不跨天）
//   d 有重修課的學期：範圍包含重修課（題庫照原本那一學期，CLS.rtTerm）
//   e 開放期間外沒有這個選項（期末週的前一週起～這學期的期末考考完；大四下只有 15 週也照日曆算）；入口：讀書座位、Café、宿舍書桌、家裡的選單
//   f 考試週前一週的週日 20:00 系統提醒：只發一次（PHONE.at，th:'sys'，tag review_<學期>）
//   g 21 天前做過的總複習，狀態不下降
//   h 翻頁閱讀：一科一節、答錯過的卡排最前面、白話空的時候用 fallback（黑板＋教授那一句＋重點）、課堂提問的題目／答案／考點；可以「下一張」「跳到下一科」「結束」；結束字幕每科一行 STUDY.line
// 修改前（開發分支 a1c1d9a59）：STUDY.review 不存在，全部 FAIL。用法：node tests/d118_b3_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
for(const f of ['src/data/study_units.js','src/study3d.js']){ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) continue; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const HAS=typeof STUDY!=='undefined'&&typeof STUDY.review==='function'&&typeof STUDY.reviewInfo==='function';
check('0. STUDY.review、STUDY.reviewInfo 存在（src/study3d.js）',HAS);   /* 修改前：不存在——下面每一節都會丟例外（FAIL）*/
let caps=[], toasts=[], picks=[];
GM.addNote=(id,title,body)=>{ const G=H.G; G.notes=G.notes||[]; if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); return true; };
GM.hasNote=id=>!!(H.G.notes||[]).find(n=>n.id===id);
GM.caption=(who,t)=>{ caps.push(String(t)); };
GM.toast=t=>{ toasts.push(String(t)); };
GM.choose=async o=>{ H.opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(want){ const k=o.findIndex(q=>String(q.t||q.text).includes(want)); if(k>=0) return k; } return 0; };
const clone=o=>JSON.parse(JSON.stringify(o));
const wd=d=>CALENDAR.dateOf(d).wd;   /* 1～7（7＝週日）*/
const setDay=(G,d,h)=>{ G.day=d; G.hour=h; G.weekday=wd(d)%7; };
const termDays=id=>{ const out=[]; for(let d=PG.DK('2025-08-01');d<PG.DK('2029-08-01');d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id) out.push(d); } return out; };
const weekDay=(id,w,wdx)=>termDays(id).find(d=>CALENDAR.termOf(d).week===w&&wd(d)===(wdx||1));
const examCourses=(G,id)=>CLS.examList(G,id).filter(e=>{ const p=CLS.examPool(e.c.id,id,'final'); return p.cls.length+p.bank.length+p.ai.length>=5; });
const draws=(G,id)=>{ const G2=clone(G); return examCourses(G2,id).map(e=>[e.c.id,CLS.drawExam(G2,e.c.id,id,'final').qs.map(q=>q.id)]); };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const freshAt=(d,h,zone)=>{ const G=H.fresh('2025-09-01',9,zone||'library_hall',{}); setDay(G,d,h); G.notes=[]; delete G.study; G.stats={classes:0,study:0}; caps=[]; toasts=[]; picks=[]; return G; };
(async()=>{
  const ex1=CLS.examList(H.fresh('2025-09-01',9,'dorm',{}),'Y1S1'); const d1=ex1.length?ex1[0].day:null;   /* 大一上第一場期末考 */
  /* a 期末考前一晚，沒讀過書 */
  await sec('a',async()=>{ const G=freshAt(d1-1,20,'dorm');   /* 宿舍書桌（總圖 22:00 閉館：20:00 開始讀不完，見 a4）*/
    const info=STUDY.reviewInfo(G,'final'); const ids=info?info.courses.map(x=>x.c.id):[];
    check('a1. 大一上期末考前一晚：開放；範圍＝這學期全部要期末考的法律課（憲法、刑總、民總）',!!info&&['const_1','crim_gen1','civ_general'].every(id=>ids.includes(id))&&ids.length===examCourses(G,'Y1S1').length,J(ids));
    const before=examCourses(G,'Y1S1').map(e=>STUDY.progress(G,e.c,'final','Y1S1'));
    picks=['結束'];   /* 第一張卡就結束：跳過也算讀過 */
    const r=await STUDY.review(GM,'final');
    const bad=[]; for(const [cid,qs] of draws(G,'Y1S1')) for(const q of qs) for(const u of STUDY.unitsOfQ(q)) if(STUDY.rank(G,u)<2) bad.push(cid+':'+q+':'+u.id);
    check('a2. 做一次總複習（第一張就按結束）以後：每一科 drawExam 會抽到的 5 題，對到的卡都是「讀過」以上',!!r&&!bad.length,J({r:!!r,bad:bad.slice(0,6)}));
    const after=examCourses(G,'Y1S1').map(e=>STUDY.progress(G,e.c,'final','Y1S1'));
    check('a3. 每一科的「讀過」＝範圍內全部的卡（之前是 0）',before.every(p=>p.read===0)&&after.every(p=>p.read===p.total&&p.total>0),J({before,after}));
    const G2=freshAt(d1-1,20,'library_hall'); const o=STUDY.reviewOpt(G2); toasts=[]; const r2=await STUDY.review(GM,'final');
    check('a4. 總圖 20:00（22:00 閉館）：變灰「閉館前讀不完」，不耗時間',!!o&&o.dim&&/閉館/.test(o.hint)&&r2===false&&G2.hour===20,J({o,r2})); });
  /* b drawExam 前後相同 */
  await sec('b',async()=>{ const G=freshAt(d1-1,19,'library_hall'); G.flags.examSeed=777; const R=CLS.rec(G); const ex0=J(R.exam||{}), d0=draws(G,'Y1S1');
    picks=['結束']; await STUDY.review(GM,'final'); const dA=draws(G,'Y1S1');
    check('b1. 做總複習前後，每一科 drawExam 抽到的題號完全相同',J(d0)===J(dA)&&d0.length>=3,J({d0,dA}));
    check('b2. 總複習不動 R.exam、examSeed、prep（成績公式 CLS.scoreOf 照舊）',J(CLS.rec(G).exam||{})===ex0&&G.flags.examSeed===777&&J(CLS.rec(G).prep)==='{}'&&CLS.scoreOf(3)===80); });
  /* c 時段次數用完也能做、3 小時、不跨天 */
  await sec('c',async()=>{ const G=freshAt(d1-2,14,'library_hall'); G.slots={day:G.day,used:{am:3,pm:3,ev:3}}; const sl=J(G.slots);
    let calls=[]; const on0=STORY.onStudy; STORY.onStudy=function(GM2,hrs){ calls.push([hrs,GM2.G.zone]); };
    try{ const opt=STUDY.reviewOpt(G);
      check('c1. 時段次數用完：選項照樣可以選（不變灰）',!!opt&&!opt.dim&&opt.t==='考前總複習',J(opt));
      picks=['結束']; const h0=G.hour, day0=G.day, s0=G.stats.study; const r=await STUDY.review(GM,'final');
      check('c2. 耗 3 小時（14:00 → 17:00）、同一天、時段次數不扣、G.stats.study +3',!!r&&Math.abs(G.hour-h0-3)<1e-9&&G.day===day0&&J(G.slots)===sl&&G.stats.study===s0+3,J({h:G.hour,day:G.day,slots:G.slots,study:G.stats.study}));
      check('c3. 照常觸發 STORY.onStudy（讀 3 小時，地點＝實際讀書的地方）',calls.length===1&&calls[0][0]===3&&calls[0][1]==='library_hall',J(calls));
      /* 晚上在宿舍：21:30 不給（不跨天）；21:00 以前可以 */
      setDay(G,d1-1,21.5); G.zone='dorm'; const o2=STUDY.reviewOpt(G); calls=[]; toasts=[]; const r2=await STUDY.review(GM,'final');
      check('c4. 21:30：選項變灰（寫原因），按了不耗時間（不讀過午夜）',!!o2&&o2.dim&&/21:00/.test(o2.hint)&&r2===false&&G.hour===21.5&&calls.length===0&&toasts.some(t=>/21:00/.test(t)),J({o2,r2,h:G.hour,toasts}));
      setDay(G,d1-1,20.5); picks=['結束']; const r3=await STUDY.review(GM,'final');
      check('c5. 20:30 在宿舍：做完 23:30、同一天；onStudy 的地點是宿舍',!!r3&&G.hour===23.5&&G.day===d1-1&&calls.length===1&&calls[0][1]==='dorm',J({h:G.hour,calls}));
      /* 家裡（週末回家，2D 選單）：地點記「家」，不算宿舍 */
      setDay(G,d1-2,15); G.zone='dorm'; G.home={at:true}; calls=[]; const ho=HOME.MENU_OPTS.map(f=>f(G)).find(x=>x&&x.t==='考前總複習');
      picks=['結束']; if(ho) await ho.run(GM);
      check('c6. 家裡的選單有「考前總複習」；做完地點記「家」（onStudy 那一下 G.zone＝home，之後恢復）',!!ho&&calls.length===1&&calls[0][1]==='home'&&G.zone==='dorm'&&G.hour===18,J({ho:!!ho,calls,zone:G.zone,h:G.hour})); delete G.home;
    } finally { STORY.onStudy=on0; } });
  /* d 重修課 */
  await sec('d',async()=>{ const G=freshAt(d1+10,10,'dorm'); const R=CLS.rec(G); R.exam=R.exam||{};
    for(const e of CLS.examList(G,'Y1S1')) R.exam['Y1S1:'+e.c.id+':final']={qs:[],ans:[],correct:e.c.id==='crim_gen1'?0:5,score:0,status:'done'};   /* 刑總（上）答對 0 題＝被當 */
    CLS.planRetakes(G,'Y1S1'); R.retake=R.retake.filter(r=>r.id==='crim_gen1');
    const f2=termDays('Y1S2').find(d=>CALENDAR.termOf(d).exam==='final'); setDay(G,f2-3,10);   /* 大一下期末週的前一週週五 */
    const info=STUDY.reviewInfo(G,'final'); const rt=info&&info.courses.find(x=>x.c.id==='crim_gen1');
    check('d1. 大一下有重修「刑法總則（上）（重修）」：總複習的範圍包含它（卡＝原本大一上那一學期的）',!!rt&&!!rt.c.rt&&rt.units.length>0&&rt.units.every(u=>u.term==='Y1S1'),J({ids:info&&info.courses.map(x=>x.c.name),n:rt&&rt.units.length}));
    picks=['結束']; await STUDY.review(GM,'final');
    const qs=CLS.drawExam(clone(G),'crim_gen1','Y1S2','final').qs||[]; const bad=qs.filter(q=>STUDY.unitsOfQ(q.id).some(u=>STUDY.rank(G,u)<2)).map(q=>q.id);
    check('d2. 重修的期末考（照大一上的題庫抽）5 題對到的卡都讀過',qs.length===5&&!bad.length,J({qs:qs.map(q=>q.id),bad}));
    check('d3. 這學期本來的課（刑法總則（下））也在範圍內',info.courses.some(x=>x.c.id==='crim_gen2'),J(info.courses.map(x=>x.c.id))); });
  /* e 開放期間 */
  await sec('e',async()=>{ const G=freshAt(weekDay('Y1S1',14,7),20,'library_hall');
    check('e1. 大一上第 14 週週日：還沒開放（沒有選項）',STUDY.reviewInfo(G,'final')===null&&STUDY.reviewOpt(G)===null&&!HOME.MENU_OPTS.some(f=>{ const x=f(Object.assign({},G,{home:{at:true}})); return x&&x.t==='考前總複習'; }));
    setDay(G,weekDay('Y1S1',15,1),9); check('e2. 第 15 週週一（期末週的前一週）起開放',!!STUDY.reviewInfo(G,'final')&&!!STUDY.reviewOpt(G));
    setDay(G,weekDay('Y1S1',3,2),15); check('e3. 學期中（第 3 週）、期中週（第 8 週）沒有',STUDY.reviewInfo(G,'final')===null&&(setDay(G,weekDay('Y1S1',8,2),15),STUDY.reviewInfo(G,'final')===null));
    check('e4. 沒有期中考：STUDY.review(GM,\'mid\')、reviewInfo(G,\'mid\') 都不開',STUDY.reviewInfo(Object.assign({},G,{day:d1-1}),'mid')===null&&(await STUDY.review(GM,'mid'))===false);
    /* 考完：全部考完＝關 */
    setDay(G,d1+12,10); const R=CLS.rec(G); R.exam=R.exam||{}; for(const e of CLS.examList(G,'Y1S1')) R.exam['Y1S1:'+e.c.id+':final']={qs:[],ans:[],correct:4,score:90,status:'done'};
    check('e5. 這學期的期末考全部考完：關（到期末考結束為止）',STUDY.reviewInfo(G,'final')===null);
    /* 考了一部分：範圍只剩還沒考的 */
    const G2=freshAt(d1,8,'library_hall'); const L=examCourses(G2,'Y1S1'); const R2=CLS.rec(G2); R2.exam=R2.exam||{}; R2.exam['Y1S1:'+L[0].c.id+':final']={qs:[],ans:[],correct:3,score:80,status:'done'};
    const i2=STUDY.reviewInfo(G2,'final'); check('e6. 考完一科：範圍只剩還沒考的科目',!!i2&&!i2.courses.some(x=>x.c.id===L[0].c.id)&&i2.courses.length===L.length-1,J(i2&&i2.courses.map(x=>x.c.id)));
    /* 大四下：15 週，期末週＝第 15 週 → 第 14 週起開放 */
    const G4=freshAt(weekDay('Y4S2',14,1),10,'library_hall'); const y4=examCourses(G4,'Y4S2');
    check('e7. 大四下只有 15 週：第 14 週週一開放、第 13 週週日沒有（照日曆，不寫死週次）',y4.length>0&&!!STUDY.reviewInfo(G4,'final')&&(setDay(G4,weekDay('Y4S2',13,7),20),STUDY.reviewInfo(G4,'final')===null),J({n:y4.length}));
    /* 經濟系那一年：沒有（不是法律系的學期）*/
    const G0=freshAt(termDays('Y0S1').find(d=>CALENDAR.termOf(d).exam==='final'),10,'dorm'); G0.stage='econ';
    check('e8. 經濟系那一年的期末週：沒有',STUDY.reviewInfo(G0,'final')===null&&STUDY.reviewOpt(G0)===null);
    /* 入口（程式碼）：讀書座位、Café 桌、宿舍書桌、家裡的選單 */
    const gs=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'), ss=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
    check('e9. 讀書座位、Café 桌（seatMenu）有 STUDY.reviewOpt；選了跑 STUDY.review',/if\(\(it\.study\|\|it\.deskStudy\|\|it\.cafeTable\)&&typeof STUDY!=='undefined'&&STUDY\.reviewOpt\)\{ const rv=STUDY\.reviewOpt\(G\); if\(rv\) opts\.push\(rv\); \}/.test(gs)&&/opts\[i\]\.review\)\{[^}]*STUDY\.review\(GM,'final'\)/.test(gs));
    check('e10. 宿舍書桌（deskScene）有 STUDY.reviewOpt、STUDY.review',/async function deskScene[\s\S]{0,3000}STUDY\.reviewOpt\(G\)[\s\S]{0,1500}STUDY\.review\(GM,'final'\)/.test(ss)); });
  /* f 提醒只發一次 */
  await sec('f',async()=>{ const G=freshAt(weekDay('Y1S1',14,1),8,'dorm'); G.msgs=[];
    const reg=STORY.PHONE_RULES.some(f=>/STUDY|remind/.test(String(f)));
    const sun=weekDay('Y1S1',15,7); for(let d=G.day;d<=d1+2;d++) for(const h of [8,12,19,20,20.5,23]){ setDay(G,d,h); STUDY.remind(G); PHONE.tick(G); }
    const m=(G.msgs||[]).filter(x=>x.tag==='review_Y1S1');
    check('f1. 考試週前一週的週日 20:00：一則系統提醒（th sys、tag review_Y1S1）；一直跑規則也只有一則',m.length===1&&m[0].th==='sys'&&m[0].day===sun&&m[0].h===20&&/期末/.test(m[0].text),J(m));
    check('f2. 註冊在 STORY.PHONE_RULES（每個整點、跳日期都跑）',reg);
    const G2=freshAt(d1,9,'dorm'); G2.msgs=[]; STUDY.remind(G2); PHONE.tick(G2);
    check('f3. 那個週日以後才讀到的存檔（考試週）：不補發',!(G2.msgs||[]).some(x=>x.tag==='review_Y1S1')&&!PHONE.sent(G2,'review_Y1S1'));
    const G3=freshAt(weekDay('Y1S1',15,7),20,'dorm'); G3.msgs=[]; const st0=J(G3.study||null), sl0=J(G3.slots||null); STUDY.remind(G3); PHONE.tick(G3);
    check('f4. 提醒不扣任何東西（不動學習狀態、時段次數、錢）',(G3.msgs||[]).filter(x=>x.tag==='review_Y1S1').length===1&&J(G3.study||null)===st0&&J(G3.slots||null)===sl0&&G3.money===5000); });
  /* g 21 天不下降 */
  await sec('g',async()=>{ const G=freshAt(d1-1,15,'library_hall'); picks=['結束']; await STUDY.review(GM,'final'); const s0=J(G.study); const cs=examCourses(G,'Y1S1').map(e=>e.c); const p0=cs.map(c=>STUDY.progress(G,c,'final','Y1S1'));
    for(let i=0;i<21;i++){ G.day++; G.hour=10; STUDY.rec(G); STUDY.remind(G); }
    const p1=cs.map(c=>STUDY.progress(G,c,'final','Y1S1'));
    check('g1. 21 天後：G.study 原封不動、每一科的進度不下降',J(G.study)===s0&&J(p0)===J(p1),J({p0,p1}));
    /* 答對過的卡不降回讀過 */
    const G2=freshAt(d1-1,15,'library_hall'); const u=STUDY.units(G2,'const_1','Y1S1')[0]; STUDY.mark(G2,u.id,'got','test'); picks=['結束']; await STUDY.review(GM,'final');
    check('g2. 總複習只升不降：答對過的卡還是答對過',STUDY.status(G2,u)==='got',STUDY.status(G2,u)); });
  /* h 翻頁閱讀 */
  await sec('h',async()=>{ const G=freshAt(d1-1,14,'library_hall'); const info=STUDY.reviewInfo(G,'final'); const c0=info.courses[0], c1=info.courses[1];
    const us=c0.units, last=us[us.length-1]; STUDY.miss(G,last.id);   /* 答錯過的卡 */
    H.said=[]; caps=[]; picks=['下一張','跳到下一科','結束'];
    await STUDY.review(GM,'final');
    const L=H.said.map(s=>s.t); const cards=L.filter(t=>/^【/.test(t));
    check('h1. 第一張是答錯過的那張（排最前面）',cards.length>=3&&cards[0].includes(c0.c.name)&&cards[0].includes(STUDY.view(last).title),J(cards.slice(0,3)));
    const v1=STUDY.view(us[0]); const idx=L.findIndex(t=>t.startsWith('【')&&t.includes(v1.title)); const body=idx>=0?L[idx+1]:'';
    /* 大一上的卡有 AA 的白話（cards_y1s1.json，tests/cards_import_unit.js）：標題下一句＝白話＋例子；還沒有白話的（大二下以後）照 fallback */
    { const want=STUDY.cardLines(us[0]); check('h2. 有白話的卡：標題下面＝STUDY.cardLines（短卡＝白話＋「　例子：」一則；長卡照句號分段、例子另一則）、第一則是白話的開頭',idx>=0&&!!v1.plain&&body===want[0]&&want[0].startsWith(v1.plain.slice(0,10))&&want.join('').replace(/　?例子：/,'').indexOf(v1.plain.slice(-10))>=0,J(body)); }
    const ue=STUDY_UNITS.units.find(u=>!u.plain&&STUDY.view(u).board[1]), ve=ue&&STUDY.view(ue), le=ue?STUDY.cardLines(ue):[];
    check('h2b. 白話還沒有的卡（'+(ue&&ue.id)+'）：第一句＝黑板第二、三行＋教授那一句（fallback）',!!ve&&!!le[0]&&le[0].includes(ve.board[1])&&(!ve.line||le[0].includes(ve.prof+'：'+ve.line)),J(le[0]));
    check('h3. 「跳到下一科」：第三張卡是下一科的第一張',!!c1&&cards[2].includes(c1.c.name)&&cards[2].includes('1／'),J(cards[2]));
    const menu=H.opts.slice(-3); check('h4. 每張卡下面：下一張、跳到下一科、結束總複習',menu.every(o=>o.includes('下一張')&&o.some(t=>t.startsWith('結束')))&&menu[0].some(t=>t.startsWith('跳到下一科')),J(menu));
    check('h5. 結束字幕：每科一行 STUDY.line',info.courses.every(x=>caps.some(t=>t.includes(STUDY.line(G,x.c,info.term)))),J(caps));
    /* 課堂提問：有 askQid 的卡顯示題目、答案、考點 */
    const ua=STUDY_UNITS.units.find(u=>u.askQid&&u.term==='Y1S1'&&EXAM_BANK.questions.find(q=>q.id===u.askQid&&q.core)); const q=EXAM_BANK.questions.find(x=>x.id===ua.askQid);
    const lines=STUDY.cardLines(ua); const s=lines.join('｜');
    check('h6. 有課堂提問的卡：顯示題目、答案（題庫原文）、考點',s.includes('課堂提問：'+q.q)&&s.includes('答案：'+(q.type==='tf'||!q.options?q.answer:'（'+q.answer+'）'+q.options[q.answer]))&&s.includes('考點：'+q.core),s.slice(0,400));
    const G2=freshAt(d1-1,14,'library_hall'); H.said=[]; picks=[]; const n=STUDY.reviewInfo(G2,'final').courses.reduce((a,x)=>a+x.units.length,0);
    for(let i=0;i<400;i++) picks.push('下一張'); await STUDY.review(GM,'final'); picks=[];
    check('h7. 一直按「下一張」：每一張卡都看得到（一共 '+n+' 張），最後一張以後自己結束',H.said.filter(s=>/^【/.test(s.t)).length===n,String(H.said.filter(s=>/^【/.test(s.t)).length)); });
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

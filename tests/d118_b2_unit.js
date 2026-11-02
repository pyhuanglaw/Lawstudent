// D118-B2-1102（docs/handoff/D118_PLAN.md 第 2 節第一～三點、第 4 節 D118-B2）：觀念卡資料層＋「法律」頁的學習進度——不需要瀏覽器。
//   a 舊存檔（只有 notes、R.done、R.ask、R.exam，沒有 G.study）backfill 以後，STUDY.progress 和這些紀錄一致；再跑一次結果相同
//   b 21 天不讀書（只過日子），進度不下降（D118：沒有任何會隨時間下降的數值）
//   c 課堂提問答完，筆記裡有那一題的題目、答案、考點；答對＝那張卡答對過、答錯＝進 miss（狀態不降）
//   d 在法律系館A 202（linze_202，沒有 3D 黑板）上課，字幕出現黑板第一行；那一週的卡＝上過課
//   e 每一題 EXAM_BANK（考五題的課）都對得到恰好一張卡（課、週一致）；刑訴 QBANK 每一題也有卡
//   f 自習讀到那一週＝讀過（筆記收黑板三行＋教授那一句）；期末考逐題回寫答對過／miss；成績照舊只看答對題數
//   g 「法律」頁、讀書結束字幕用 STUDY 的進度那一行
// 修改前（開發分支 94c89e8e6）：STUDY 不存在，全部 FAIL。用法：node tests/d118_b2_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
for(const f of ['src/data/study_units.js','src/study3d.js']){ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) continue; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const HAS=typeof STUDY!=='undefined'&&typeof STUDY_UNITS!=='undefined';
check('0. STUDY、STUDY_UNITS 存在（src/study3d.js、src/data/study_units.js）',HAS);   /* 修改前：不存在——下面每一節都會丟例外（FAIL）*/
/* 假 GM：筆記真的記進 G.notes；字幕記下來；選項照文字挑 */
let caps=[], want=null;
GM.addNote=(id,title,body)=>{ const G=H.G; G.notes=G.notes||[]; if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); return true; };
GM.hasNote=id=>!!(H.G.notes||[]).find(n=>n.id===id);
GM.caption=(who,t)=>{ caps.push((who?who+'｜':'')+String(t)); };
GM.choose=async o=>{ H.opts.push(o.map(q=>q.t||q.text)); if(want){ const k=o.findIndex(q=>String(q.t||q.text).includes(want)); if(k>=0) return k; } return 0; };
const Q={}; for(const q of EXAM_BANK.questions) Q[q.id]=q; for(const q of QBANK) Q[q.id]=Q[q.id]||q;
const mc5=id=>!!EXAM_BANK.courseMap[id]&&EXAM_BANK.courseMap[id].exam==='mc5';
/* 某門課第 w 週那一堂（不是考試、第一格）*/
const itemFor=(cid,w,later)=>{ const c=CLS.byId(cid); for(let d=PG.DK('2025-08-01');d<PG.DK('2029-07-01');d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==c.term||(later?t.week<w||t.week>15:t.week!==w)) continue; const it=CLS.dayItems(H.G,d).find(x=>x.c.id===cid&&!x.exam&&CLS.slotOrder(x).i<1); if(it) return it; } return null; };
const dayOfWeek=(term,w)=>{ for(let d=PG.DK('2025-08-01');d<PG.DK('2029-07-01');d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===w&&CALENDAR.dateOf(d).wd<=5) return d; } return null; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
(async()=>{
  /* e 每一題都有卡 */
  await sec('e',async()=>{ const bad=[]; let n=0;
    for(const q of EXAM_BANK.questions){ if(!mc5(q.course)) continue; n++; const us=STUDY.unitsOfQ(q.id); if(us.length!==1||us[0].course!==q.course||us[0].week!==+q.scopeWeek||us[0].id!==q.course+'_w'+q.scopeWeek) bad.push(q.id+':'+us.map(u=>u.id)); }
    check('e1. 每一題 EXAM_BANK（考五題的課）都對得到恰好一張卡（<課>_w<週>，課、週和題目一致）',n>=399&&!bad.length,'題數 '+n+' 對不到 '+J(bad.slice(0,8)));
    const qb=QBANK.filter(q=>q.complete!==false).filter(q=>{ const us=STUDY.unitsOfQ(q.id); return us.length!==1||us[0].course!=='crimpro'; });
    const qu=STUDY_UNITS.units.filter(u=>u.src==='qbank');
    check('e2. 刑訴 QBANK 每一題都在一張刑訴卡（照章分約 10 張）',!qb.length&&qu.length>=6&&qu.length<=14,J({miss:qb.map(q=>q.id),cards:qu.length}));
    const wk=STUDY_UNITS.units.filter(u=>u.src!=='qbank'); const noTitle=wk.filter(u=>!u.title||!Array.isArray(u.qids)||!u.qids.length||!('plain' in u)||!('cue' in u));
    const sylOk=wk.every(u=>{ const sy=(SYLLABUS.courses[u.course]||[]).find(w=>w.w===u.week); return sy&&sy.board&&sy.board[0]===u.title; });
    check('e3. 週卡 252 張（30 門課）、標題＝那一週的黑板第一行、plain／cue 欄位先空著',wk.length===252&&new Set(wk.map(u=>u.course)).size===30&&!noTitle.length&&sylOk,J({n:wk.length,noTitle:noTitle.map(u=>u.id).slice(0,5),sylOk})); });
  /* a 舊存檔 backfill */
  await sec('a',async()=>{ const G=H.fresh('2026-03-02',9,'dorm',{}); delete G.study; G.notes=[];
    const R=CLS.rec(G); R.exam=R.exam||{}; const k=(term,w,cid)=>dayOfWeek(term,w)+':'+cid+':am';
    for(const w of [1,2,3,4,5]) R.done[k('Y1S1',w,'const_1')]=1;          /* 憲法（上）上過第 1～5 週 */
    for(const w of [5,12]) R.done[k('Y1S1',w,'civ_general')]=1;            /* 民總上過第 5、12 週 */
    G.notes.push({id:'const_1_w2',title:'x',body:'',day:1},{id:'const_1_w9',title:'x',body:'',day:1},{id:'law_154',title:'民總',body:'',day:1});   /* 讀過憲法第 2 週；const_1_w9 不是卡（沒有考題的週）；law_154 不是卡 */
    R.ask['Y1S1:CIVS_01']='B'; R.ask['Y1S1:CIVS_07']='B';                  /* CIVS_01 答對（B）、CIVS_07 答錯（答案 A）*/
    const ex=CLS.examPool('const_1','Y1S1','final'); const qs=ex.cls.concat(ex.bank,ex.ai).slice(0,5); const ans=qs.map((q,i)=>i<3?q.answer:(q.type==='tf'||!q.options?(q.answer==='對'?'錯':'對'):Object.keys(q.options).find(x=>x!==q.answer)));
    R.exam['Y1S1:const_1:final']={qs:qs.map(q=>q.id),ans,correct:3,score:80,status:'done'};
    R.exam['Y1S1:const_1:mid']={qs:[qs[4].id],ans:[qs[4].answer],correct:1,score:0,status:'done'};   /* 舊的期中練習：保留不讀 */
    const s=STUDY.rec(G);
    /* 期望值：直接從紀錄算 */
    const W=new Map(); const up=(id,r)=>{ if(!STUDY.unit(id)) return; W.set(id,Math.max(W.get(id)||0,r)); };
    for(const key in R.done){ const p=key.split(':'), t=CALENDAR.termOf(+p[0]); up(p[1]+'_w'+t.week,1); }
    for(const n of G.notes) up(n.id,2);
    for(const kk in R.ask){ const qid=kk.split(':')[1]; for(const u of STUDY.unitsOfQ(qid)) up(u.id,R.ask[kk]===Q[qid].answer?3:1); }
    qs.forEach((q,i)=>{ if(String(ans[i])===String(q.answer)) for(const u of STUDY.unitsOfQ(q.id)) up(u.id,3); });
    const exp=cid=>{ const us=STUDY.units(G,cid,CLS.byId(cid).term,'final'); const o={total:us.length,heard:0,read:0,got:0}; for(const u of us){ const r=W.get(u.id)||0; if(r>=1) o.heard++; if(r>=2) o.read++; if(r>=3) o.got++; } return o; };
    const pc=STUDY.progress(G,'const_1','final'), pv=STUDY.progress(G,'civ_general','final');
    check('a1. 憲法（上）：backfill 以後 progress 和紀錄一致（上過、讀過、答對過）',J(pc)===J(exp('const_1'))&&pc.heard>0&&pc.read>0&&pc.got>0,J({got:pc,exp:exp('const_1')}));
    check('a2. 民法總則：課堂提問答對的那張＝答對過、答錯的那張＝上過課＋進 miss',J(pv)===J(exp('civ_general'))&&STUDY.status(G,'civ_general_w5')==='got'&&STUDY.status(G,'civ_general_w12')==='heard'&&s.miss.includes('civ_general_w12'),J({pv,exp:exp('civ_general'),miss:s.miss}));
    const midOnly=STUDY.unitsOfQ(qs[4].id)[0]; const midSt=STUDY.status(G,midOnly);
    check('a3. 舊的期中練習（:mid）不讀：只在期中答對的那題不算答對過',midSt!=='got'||qs.slice(0,3).some(q=>STUDY.unitsOfQ(q.id)[0]===midOnly),J({unit:midOnly.id,st:midSt}));
    const snap=J(G.study); s.bf=0; STUDY.rec(G); const again=J(Object.assign({},G.study,{bf:1}));
    check('a4. 再 backfill 一次結果相同；舊欄位（notes、courses）沒有被改',again===snap&&G.notes.length===3&&Object.keys(R.done).length===7&&R.ask['Y1S1:CIVS_07']==='B',J({same:again===snap}));
    check('a5. G.study 的格式：{v:1,u:{},miss:[]}',s.v===1&&typeof s.u==='object'&&Array.isArray(s.miss)); });
  /* b 21 天不讀書 */
  await sec('b',async()=>{ const G=H.fresh('2025-09-15',9,'dorm',{}); G.notes=[];
    const cw=STUDY.units(G,'const_1','Y1S1').map(u=>u.week); let it=null; for(const w of cw){ it=itemFor('const_1',w); if(it) break; } G.day=it.day; G.hour=it.t0+0.1; await CLS.attend(GM,it,{inScene:true});   /* 上一堂有卡的課 */
    for(let i=0;i<20;i++){ const st=CLS.studyTopic(G,CLS.byId('const_1'),id=>GM.hasNote(id)); if(!st) break; GM.addNote(st.id,st.title,st.body); if(STUDY.unit(st.id)&&st.id!=='const_1_w'+it.week) break; }   /* 自習讀到一張別週的卡 */
    const cs=['const_1','crim_gen1','civ_general']; const before=cs.map(c=>STUDY.progress(G,c,'final')); const s0=J(G.study);
    for(let i=0;i<21;i++){ G.day++; G.hour=10; STUDY.rec(G); }
    const after=cs.map(c=>STUDY.progress(G,c,'final'));
    check('b1. 21 天只過日子不讀書：每一科的進度（上過、讀過、答對過）都沒有下降',before.every((p,i)=>after[i].heard>=p.heard&&after[i].read>=p.read&&after[i].got>=p.got)&&before[0].heard>=1&&before[0].read>=1,J({before,after}));
    check('b2. 21 天後 G.study 原封不動（沒有衰退、沒有打卡紀錄）',J(G.study)===s0); });
  /* c 課堂提問 */
  await sec('c',async()=>{ const G=H.fresh('2025-10-06',9,'dorm',{}); G.notes=[];
    const it=itemFor('civ_general',5); G.day=it.day; G.hour=it.t0+0.1; want='滿十八歲之成年人'; caps=[]; H.said=[];
    await CLS.attend(GM,it,{inScene:true}); want=null; const q=Q.CIVS_01; const n=(G.notes||[]).find(x=>x.id==='ask_CIVS_01');
    check('c1. 課堂提問答完：筆記有那一題的題目、答案（B）、考點（題庫原文）',!!n&&n.body.includes(q.q)&&n.body.includes('（B）'+q.options.B)&&n.body.includes('考點：'+q.core),J(n));
    check('c2. 答對＝那張卡答對過；R.ask 照舊記玩家選的',STUDY.status(G,'civ_general_w5')==='got'&&CLS.rec(G).ask['Y1S1:CIVS_01']==='B',J({st:STUDY.status(G,'civ_general_w5'),ask:CLS.rec(G).ask}));
    check('c3. 台詞照舊：「答案是（B）。考點：…」',H.said.some(s=>s.t.startsWith('答案是（B）。考點：'+q.core)),J(H.lines().slice(-4)));
    const it2=itemFor('civ_general',12); G.day=it2.day; G.hour=it2.t0+0.1; want='一律有效'; await CLS.attend(GM,it2,{inScene:true}); want=null; const q2=Q.CIVS_07, n2=G.notes.find(x=>x.id==='ask_CIVS_07');
    check('c4. 答錯：筆記照樣記正確答案（A）和考點；卡片只是上過課、進 miss（不扣東西）',!!n2&&n2.body.includes('（A）'+q2.options.A)&&n2.body.includes('考點：'+q2.core)&&STUDY.status(G,'civ_general_w12')==='heard'&&G.study.miss.includes('civ_general_w12'),J({n2,st:STUDY.status(G,'civ_general_w12'),miss:G.study.miss})); });
  /* d 法律系館A 202 上課：字幕顯示黑板 */
  await sec('d',async()=>{ const G=H.fresh('2027-09-13',9,'linze_202',{}); G.notes=[];
    const w=(SYLLABUS.courses.securities||[]).find(x=>x.w>=2&&x.w<=7&&x.board&&x.board[0]&&CLS.sylReviewed(CLS.byId('securities'),x.w)&&STUDY.unit('securities_w'+x.w));
    const it=w&&itemFor('securities',w.w); check('d0. 找到證券交易法（法律系館A 202）有黑板、有卡的那一週',!!it&&it.room.zone==='linze_202',J({w:w&&w.w,room:it&&it.room}));
    G.day=it.day; G.hour=it.t0+0.1; G.zone='linze_202'; const z0=H.E.zone; H.E.zone={roomAt:()=>null,seats:[]}; caps=[];
    try{ await CLS.attend(GM,it,{inScene:true}); } finally { H.E.zone=z0; }
    check('d1. 在 linze_202 上課（沒有 3D 黑板）：字幕出現黑板第一行',caps.some(t=>t.includes(w.board[0])),J(caps));
    check('d2. 那一週的觀念卡＝上過課',STUDY.status(G,'securities_w'+w.w)==='heard',STUDY.status(G,'securities_w'+w.w));
    /* 對照：201（有 setBoard）不出黑板字幕 */
    const it2=itemFor('crimpro',2); const G2=H.fresh('2027-09-13',9,'classroom',{}); G2.day=it2.day; G2.hour=it2.t0+0.1; let board=null; H.E.zone={roomAt:()=>null,seats:[],setBoard:(a,b,c)=>{ board=[a,b,c]; }}; caps=[];
    try{ await CLS.attend(GM,it2,{inScene:true}); } finally { H.E.zone=z0; }
    check('d3. 對照：有 3D 黑板的教室照舊寫在黑板上，不另外出黑板字幕',!!board&&!caps.some(t=>t.startsWith('黑板｜')),J({board,caps})); });
  /* f 自習、期末考回寫 */
  await sec('f',async()=>{ const G=H.fresh('2025-10-20',20,'dorm',{}); G.notes=[]; const c=CLS.byId('const_1');
    let st=null; for(let i=0;i<20;i++){ st=CLS.studyTopic(G,c,id=>GM.hasNote(id)); if(!st||STUDY.unit(st.id)) break; GM.addNote(st.id,st.title,st.body); } const sy=(SYLLABUS.courses.const_1||[]).find(x=>st&&st.id==='const_1_w'+x.w);
    check('f1. 自習：筆記收黑板三行（標題＝第一行）＋教授那一句',!!st&&!!sy&&st.title===sy.board[0]&&st.body.includes(sy.board[1])&&(!sy.line||st.body.includes(sy.line)),J({st,line:sy&&sy.line}));
    check('f2. 自習讀到那一週＝那張卡讀過（有卡的週）',!!STUDY.unit(st.id)&&STUDY.status(G,st.id)==='read',J({id:st.id,st:STUDY.status(G,st.id)}));
    let d16=null; for(let d=PG.DK('2025-12-15');d<PG.DK('2026-02-01');d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===16){ d16=d; break; } }
    G.day=d16; G.hour=10; const it={c,exam:'final',term:'Y1S1',week:16}; const pool=CLS.drawExam(G,'const_1','Y1S1','final');
    const picks=pool.qs.map((q,i)=>i%2===0?q.answer:null); let qi=0; const ch0=GM.choose; GM.choose=async o=>{ const q=pool.qs[qi++]; const opts=q.type==='tf'||!q.options?['對','錯']:Object.keys(q.options); const want=picks[qi-1]; const k=want!=null?opts.indexOf(want):opts.findIndex(x=>x!==q.answer); return k<0?0:k; };
    let res; try{ res=await CLS.runExam(GM,it); } finally { GM.choose=ch0; }
    const e=CLS.rec(G).exam['Y1S1:const_1:final']; const got=pool.qs.filter((q,i)=>i%2===0), bad=pool.qs.filter((q,i)=>i%2===1);
    check('f3. 期末考：答對的題那張卡＝答對過；答錯的進 miss',got.every(q=>STUDY.status(G,STUDY.unitsOfQ(q.id)[0])==='got')&&bad.every(q=>G.study.miss.includes(STUDY.unitsOfQ(q.id)[0].id)||got.some(g=>STUDY.unitsOfQ(g.id)[0]===STUDY.unitsOfQ(q.id)[0])),J({e,u:G.study.u,miss:G.study.miss}));
    check('f4. 成績照舊只看答對題數（3 題＝80 分）',res&&res.correct===3&&e.score===CLS.scoreOf(3)&&e.score===80,J(res)); });
  /* g 顯示 */
  await sec('g',async()=>{ const gs=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'), html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
    check('g1. 「法律」頁每一科「期末範圍：學過 x／y・答對過 z」（BB 06:20：上課也算學過）（STUDY.progress）；讀書結束字幕用 STUDY.line',/function renderLegal\(\)[\s\S]{0,4000}const ST=typeof STUDY!=='undefined'\?STUDY:null;[\s\S]{0,3000}ST\.progress\(G,e\.c,'final',e\.term\)/.test(gs)&&/期末範圍：學過 /.test(gs)&&/STUDY\.line\(G,course\)/.test(gs));
    const G=H.fresh('2025-10-20',20,'dorm',{}); const ln=STUDY.line(G,CLS.byId('const_1'));
    check('g2. STUDY.line 的格式：「憲法（上）　期末範圍：學過 0／y・答對過 0」',/^憲法（上）　期末範圍：學過 0／\d+・答對過 0$/.test(ln),ln);
    { const G=H.fresh('2025-10-01',9,'dorm',{}); const c=COURSES.list.find(x=>x.id==='const_1'); const u=STUDY.units(G,c,'Y1S1','final')[0]; STUDY.mark(G,u.id,'heard','attend'); const ln2=STUDY.line(G,c,'Y1S1');
      check('g2b. 只上過課（沒自習）也算學過：「學過 1／y」（BB 06:20：不暗示要去刷自習）',/期末範圍：學過 1／\d+・答對過 0$/.test(ln2),ln2); }
    const i1=html.indexOf('src/classes3d.js?'), i2=html.indexOf('src/data/study_units.js?'), i3=html.indexOf('src/study3d.js?'), iB=html.indexOf('GAME.boot');
    check('g3. index.html：data/study_units.js、study3d.js 在 classes3d.js 之後、GAME.boot() 之前（build.py 照 index.html 內嵌）',i1>0&&i2>i1&&i3>i2&&(iB<0||i3<iB),J({i1,i2,i3,iB}));
    const cs=STUDY.courses(G).map(e=>e.c.id); check('g4. 「法律」頁要列的課：這學期考五題的法律課（還沒上也列）',cs.includes('const_1')&&cs.includes('civ_general')&&cs.includes('crim_gen1'),J(cs)); });
  { const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');   /* BB 07:15：手機直向「答對過 n」被擠到下一行 */
    check('g5. 法律頁那一行：「期末範圍：學過 x／y」「・答對過 z」各自 nowrap（要換行只在「・」前面）',/white-space:nowrap\\?">期末範圍：學過 '\+pr\.heard\+'／'\+pr\.total\+'<\/span><span style=\\?"white-space:nowrap\\?">・答對過 '\+pr\.got\+'<\/span>/.test(g)); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

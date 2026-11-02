// CC M6「學過 x／y 一致性」——不需要瀏覽器（Node）。
// 用法：
//   nice -n 19 node docs/story_planning/test_tools/cc/m6_studied_xy.js <受測版本根目錄> [種子數，預設 6] [--no-mut]
//   （根目錄＝有 src/、tests/pg_harness.js 的乾淨 checkout，例：git worktree add --detach <dir> <SHA>）
// 「學過 x／y」的來源（全部是 src/study3d.js 的 STUDY.progress：x＝heard（上過課以上）、y＝total（期末範圍的觀念卡）、z＝got）：
//   顯示 A：手機「法律」頁　game3d.js renderLegal → ST.progress(G,e.c,'final',e.term)（這裡把 renderLegal 原始碼抽出來執行，DOM 用假的）
//   顯示 B：自習結束字幕　game3d.js studySession → STUDY.line(G,course)（沒有傳學期）
//   顯示 C：一鍵總複習結束字幕　study3d.js S.review → S.line(G,x.c,info.term)
//   「課表」（CLS.weekHTML／todayHTML）沒有顯示學過 x／y（只有出席次數、考試時間）——報告寫明。
// 動作（全部呼叫遊戲真的函式）：上課＝CLS.attend（會自己跑課堂提問 CLS.classAsk）；自習＝CLS.studyTopic＋game3d.js 抽出的 addNote；
//   總複習＝STUDY.review；期末考＝CLS.runExam；學期末＝CLS.showGrades（真的排重修）。讀書會＝直接寫 G.legal.q 的狀態（harness 的 LEGAL 是假的，標明）。
// 檢查：
//   1 x ≤ y（每天、每門顯示中的課，三處都檢查）
//   2 三處一致：A（法律頁那一列）＝D（STUDY.progress 直接呼叫）＝B（STUDY.line 不帶學期）＝C（STUDY.line 帶學期）
//   3 獨立模型：從存檔紀錄（R.done、筆記 id、R.ask、R.exam、總複習記下的卡、G.legal.q）自己推每張卡的等級，x／y／z 要和 STUDY.progress 相同
//   4 換學期：新學期第一天（還沒做任何事）這學期的課 x＝0（重修課、日本補修課、刑訴題庫卡另外列）；上學期的課學期結束後數字不再變（刑訴題庫、重修除外）
//   5 重修、日本補修怎麼算：列出實際數字（x 帶不帶過來、法律頁放在哪一區）
//   MUT 故意改壞，上面的檢查必須 FAIL
'use strict';
const path=require('path'), fs=require('fs'), vm=require('vm');
const SRC=path.resolve(process.argv[2]||'.');
const NSEED=+(process.argv.slice(3).find(a=>/^\d+$/.test(a))||6);
const NOMUT=process.argv.includes('--no-mut');
const H=require(path.join(SRC,'tests/pg_harness.js'));
const {GM}=H;
const load=f=>{ const p=path.join(SRC,f); if(!fs.existsSync(p)){ console.log('（沒有 '+f+'）'); return; } const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/jp3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e.message); }
GM.caption=()=>{}; GM.toast=()=>{};
CLS.attPass=()=>true;   /* 出席制的課不在 M6 範圍 */
const J=JSON.stringify;

/* ---- game3d.js 抽出：addNote、renderLegal ---- */
const g3=fs.readFileSync(path.join(SRC,'src/game3d.js'),'utf8');
const grab=(src,name)=>{ const i=src.indexOf('function '+name+'('); if(i<0) return null; let d=0; for(let j=src.indexOf('{',i);j<src.length;j++){ if(src[j]==='{') d++; else if(src[j]==='}'){ d--; if(!d) return src.slice(i,j+1); } } return null; };
const mAdd=g3.match(/function addNote\(id,title,body\)\{[\s\S]*?return true; \}/);
GM.addNote=new Function('H','toast','A3','return function(id,title,body){ const G=H.G; return ('+mAdd[0]+')(id,title,body); };')(H,()=>{},{blip(){}});
GM.hasNote=id=>!!H.G.notes.find(n=>n.id===id);
const RL_SRC0=grab(g3,'renderLegal');
if(!RL_SRC0){ console.log('FAIL 0 找不到 game3d.js renderLegal'); process.exit(1); }
global.document.createElement=()=>({className:'',innerHTML:'',style:{}});
const LEGAL_STUB={summary:()=>({bySec:{},misc:[]})};
let RL_SRC=RL_SRC0;
function legalRows(G){ const box={innerHTML:'',kids:[],appendChild(d){ this.kids.push(d); }};
  const fn=new Function('G','$','CLS','STUDY','LEGAL','EXAM_BANK',RL_SRC+'\nreturn renderLegal;')(G,id=>id==='legalList'?box:null,CLS,STUDY,LEGAL_STUB,EXAM_BANK);
  fn(); const rows=[]; let sec=null;
  for(const k of box.kids){ const h=k.innerHTML; if(/^<b>(這學期|之前的學期)<\/b>$/.test(h)){ sec=h.includes('這學期')?'cur':'prev'; continue; }
    const m=/^<b>([^<]*)<\/b>(?:　<span[^>]*>期末範圍：學過 (\d+)／(\d+)<\/span><span[^>]*>・答對過 (\d+)<\/span>)?<div class="muted">([^<・]*)/.exec(h);
    if(m) rows.push({name:m[1],sec,x:m[2]==null?null:+m[2],y:m[3]==null?null:+m[3],z:m[4]==null?null:+m[4],tn:m[5]}); }
  return rows; }

/* ---- 紀錄 ---- */
let fails=0, quiet=false; const FAILS=[];
const check=(name,ok,info)=>{ if(!ok){ fails++; FAILS.push(name+(info?'　'+info:'')); } if(!quiet&&(!ok||!/^\s/.test(name))) console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); return ok; };
const say=t=>{ if(!quiet) console.log(t); };
const rngOf=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
let rnd=Math.random;
GM.choose=async o=>{ H.opts.push(o.map(q=>q.t)); const idx=o.map((q,i)=>q.dim?-1:i).filter(i=>i>=0); return idx.length?idx[Math.floor(rnd()*idx.length)]:0; };

/* ---- 獨立模型（不呼叫 STUDY 的計算；只用 STUDY_UNITS 原始資料）---- */
const UNITS=STUDY_UNITS.units, UB={}; for(const u of UNITS) UB[u.id]=u;
const UQ={}; for(const u of UNITS) for(const q of u.qids||[]) (UQ[q]||(UQ[q]=[])).push(u);
const QPOOL={}; for(const q of EXAM_BANK.questions) QPOOL[q.id]=q; for(const q of (typeof QBANK!=='undefined'?QBANK:[])) QPOOL[q.id]=QPOOL[q.id]||q;
const COURSE=id=>COURSES.list.find(c=>c.id===id);
const baseCid=id=>{ const c=COURSE(id); return c&&c.redo?c.redo:id; };
function rangeOf(G,c,term){ const cid=baseCid(c.id); let base=term;
  if(COURSE(c.id)&&COURSE(c.id).redo) base=COURSE(COURSE(c.id).redo).term;
  else { const r=(G.courses.retake||[]).find(x=>x.id===c.id&&x.term===term); if(r) base=r.base||r.from; }
  const all=UNITS.filter(u=>u.course===cid&&(u.week==null||u.week<=15)); const t=all.filter(u=>u.term===base); return t.length?t:all; }
let REVIEWED=new Set();
function modelRank(G){ const rk={}; const up=(id,r)=>{ if(UB[id]&&(rk[id]||0)<r) rk[id]=r; };
  const R=G.courses;
  for(const k in R.done){ const p=k.split(':'); const t=CALENDAR.termOf(+p[0]); if(!t||!t.week) continue; up(baseCid(p[1])+'_w'+t.week,1); }
  for(const n of G.notes||[]){ const m=/^(.+)_w(\d+)$/.exec(n.id||''); if(m) up(baseCid(m[1])+'_w'+m[2],2); }   /* 日本補修（insurance_re_w5）的筆記＝原課那張卡（STUDY.weekUnit 照 redoOf）*/
  for(const id of REVIEWED) up(id,2);
  for(const k in R.ask||{}){ const qid=k.slice(k.indexOf(':')+1), q=QPOOL[qid]; if(!q) continue; for(const u of UQ[qid]||[]){ up(u.id,1); if(String(R.ask[k])===String(q.answer)) up(u.id,3); } }
  for(const k in R.exam||{}){ const e=R.exam[k]; if(!e||e.status!=='done'||!Array.isArray(e.qs)) continue; e.qs.forEach((qid,i)=>{ const q=QPOOL[qid]; if(q&&String(e.ans[i])===String(q.answer)) for(const u of UQ[qid]||[]) up(u.id,3); }); }
  const LQ=G.legal&&G.legal.q||{}; const LR={learned:2,understood:2,mastered:3};
  for(const u of UNITS) if(u.src==='qbank') for(const q of u.qids){ const e=LQ[q]; if(e&&LR[e.state]) up(u.id,LR[e.state]); }
  return rk; }
function modelProg(G,c,term,rk){ const us=rangeOf(G,c,term); const o={total:us.length,heard:0,read:0,got:0}; for(const u of us){ const r=rk[u.id]||0; if(r>=1) o.heard++; if(r>=2) o.read++; if(r>=3) o.got++; } return o; }

/* ---- 每一個檢查點：這學期的課＋法律頁列出的全部課 ---- */
const stripRt=n=>n.replace(/（重修）$/,'');
let STAT=null;
function inspect(G,tag,termId){ const rows=legalRows(G), rk=modelRank(G); const out={};
  const cur=termId?CLS.termCourses(G,termId).filter(c=>CLS.isExamCourse(c)&&STUDY.units(G,c,termId).length):[];
  for(const c of cur){ const D=STUDY.progress(G,c,'final',termId), M=modelProg(G,c,termId,rk), lnB=STUDY.line(G,c), lnC=STUDY.line(G,c,termId);
    const pl=s=>{ const m=/學過 (\d+)／(\d+)・答對過 (\d+)/.exec(s||''); return m?{x:+m[1],y:+m[2],z:+m[3]}:null; };
    const B=pl(lnB), C=pl(lnC); const As=rows.filter(r=>r.name===stripRt(c.name)||r.name===c.name);
    STAT.points++;
    check('  '+tag+' 1 x≤y '+c.id,D.heard<=D.total&&(!B||B.x<=B.y)&&(!C||C.x<=C.y)&&As.every(a=>a.x==null||a.x<=a.y),J({D,B,C,As}));
    check('  '+tag+' 2 三處一致 '+c.id,!!B&&!!C&&As.length>0&&[B,C].concat(As).every(v=>v.x===D.heard&&v.y===D.total&&v.z===D.got),J({D,B,C,A:As.map(a=>[a.sec,a.x,a.y,a.z])}));
    check('  '+tag+' 3 獨立模型 '+c.id,M.total===D.total&&M.heard===D.heard&&M.got===D.got&&M.read===D.read,J({D,M}));
    out[c.id]={c,D,A:As}; }
  /* 法律頁「之前的學期」那幾列：也拿模型對（照列出來的學期）*/
  for(const r of rows){ if(r.x==null) continue; check('  '+tag+' 1 x≤y（法律頁）'+r.name,r.x<=r.y,J(r)); }
  return {rows,cur:out}; }

/* ---- 模擬 ---- */
const TERMS=CLS.LAW_TERMS.slice();
async function sim(seed,opt){ opt=opt||{}; rnd=rngOf(seed*977+3); REVIEWED=new Set();
  const fl={examSeed:2000+seed}; if(opt.route) fl.EXCHANGE_ROUTE=opt.route;
  const G=H.fresh('2025-09-01',8,'dorm',fl); G.notes=[]; G.memo=[]; CLS.rec(G); G.courses.rollSince=-9999;
  const pAtt=opt.pAtt!=null?opt.pAtt:0.45+rnd()*0.5, pStudy=opt.pStudy!=null?opt.pStudy:rnd()*0.25, pRev=opt.pRev!=null?opt.pRev:rnd()*0.6, pLegal=opt.pLegal!=null?opt.pLegal:rnd()*0.03;
  const failSet=new Set(opt.fail||[]);
  const log={reset:[],frozen:[],retake:[],redo:[],actions:{attend:0,study:0,review:0,exam:0,legal:0,ask:0},crimproStart:null};
  const frozenAt={};   /* 學期結束時記下的數字：termId → {cid:progress} */
  for(const T of TERMS){
    if(CLS.termAway(G,T)){ say('  （'+T+' 在國外，不上台灣的課）'); continue; }
    const r=CALENDAR.termDays(T); const exams=CLS.examList(G,T).slice().sort((a,b)=>a.day-b.day||a.t0-b.t0);
    const lastDay=exams.length?exams[exams.length-1].day:r.to;
    let first=true;
    for(let d=Math.max(r.from,1);d<=lastDay;d++){ G.day=d; G.hour=8; G.weekday=CALENDAR.dateOf(d).wd%7;
      if(first){ first=false; const ins=inspect(G,'['+seed+' '+T+' 第一天]',T);
        for(const id in ins.cur){ const {c,D}=ins.cur[id]; const rt=!!c.rt, redo=!!COURSE(c.id).redo, qb=baseCid(c.id)==='crimpro';
          if(rt||redo||qb){ (rt?log.retake:redo?log.redo:log.reset).push({T,cid:c.id,name:c.name,x:D.heard,y:D.total,z:D.got,kind:rt?'重修':redo?'日本補修':'刑訴（含題庫卡）',sec:(ins.cur[id].A[0]||{}).sec,tn:(ins.cur[id].A[0]||{}).tn,rows:ins.cur[id].A.length}); if(qb) log.crimproStart={x:D.heard,y:D.total}; continue; }
          check('  [seed '+seed+' '+T+'] 4a 新學期第一天 x＝0 '+c.id,D.heard===0&&D.got===0,J(D)); STAT.resetChecks++; } }
      /* 讀書會（直接寫 G.legal.q） */
      if(rnd()<pLegal){ G.legal=G.legal||{}; G.legal.q=G.legal.q||{}; const qs=Object.keys(UQ).filter(q=>/^Q\d+$/.test(q)); const q=qs[Math.floor(rnd()*qs.length)]; const st=['seen','learned','understood','mastered'][Math.floor(rnd()*4)]; const e=G.legal.q[q]; const R4={seen:0,learned:1,understood:1,mastered:2}; if(!e||R4[st]>R4[e.state]) G.legal.q[q]={state:st}; log.actions.legal++; }
      for(const it of CLS.dayItems(G,d)){ if(it.exam) continue; if(rnd()>=pAtt) continue; G.hour=it.t0; const a0=Object.keys(G.courses.ask).length;
        try{ const ok=await CLS.attend(GM,it,{inScene:true}); if(ok!==false) log.actions.attend++; }catch(e){ check('[seed '+seed+'] attend 例外 '+it.key,false,String(e).slice(0,160)); }
        log.actions.ask+=Object.keys(G.courses.ask).length-a0; }
      /* 自習：這學期的一門課 */
      if(rnd()<pStudy){ const cs=CLS.termCourses(G,T).filter(c=>CLS.isExamCourse(c)); if(cs.length){ const c=cs[Math.floor(rnd()*cs.length)]; const st=CLS.studyTopic(G,c,id=>GM.hasNote(id)); if(st){ GM.addNote(st.id,st.title,st.body); log.actions.study++; }
        inspect(G,'[seed '+seed+' '+CALENDAR.dateOf(d).key+' 自習後]',T); } }
      /* 總複習 */
      if(rnd()<pRev){ const info=STUDY.reviewInfo(G,'final'); if(info){ G.hour=9; const ids=[]; for(const x of info.courses) for(const u of x.units) ids.push(u.id); const res=await STUDY.review(GM,'final',{home:true}); if(res&&res.ok){ ids.forEach(i=>REVIEWED.add(i)); log.actions.review++; } inspect(G,'[seed '+seed+' '+CALENDAR.dateOf(d).key+' 總複習後]',T); } }
      /* 期末考 */
      for(const e of exams.filter(e=>e.day===d)){ G.hour=e.t0; const wrongAll=failSet.has(T+':'+e.c.id);
        const save=GM.choose; if(wrongAll){ GM.choose=async o=>{ const last=H.said[H.said.length-1]; const m=last&&/^(\d)／5　/.exec(last.t); if(!m) return save(o); const d2=CLS.drawExam(G,e.c.id,T,'final'); const q=d2.ok?d2.qs[+m[1]-1]:null; if(!q) return 0; const k=o.findIndex(x=>{ const t=x.t||x.text; return !(t===String(q.answer)||t.startsWith('（'+q.answer+'）')); }); return k<0?0:k; }; }
        try{ await CLS.runExam(GM,{c:e.c,exam:'final',term:T}); log.actions.exam++; } finally { GM.choose=save; } }
      inspect(G,'[seed '+seed+' '+CALENDAR.dateOf(d).key+']',T);
    }
    G.day=lastDay+1; G.hour=9; await CLS.showGrades(GM,T,{inScene:true});
    frozenAt[T]={}; for(const c of CLS.termCourses(G,T).filter(c=>CLS.isExamCourse(c))) frozenAt[T][c.id]={c,p:STUDY.progress(G,c,'final',T)};
    /* 之前的學期：數字不再變（刑訴題庫、之後又重修的課除外）*/
    for(const T0 in frozenAt){ if(T0===T) continue; for(const id in frozenAt[T0]){ const {c,p}=frozenAt[T0][id]; if(baseCid(id)==='crimpro') continue; const rtLater=(G.courses.retake||[]).some(x=>x.id===id&&TERMS.indexOf(x.term)>TERMS.indexOf(T0)); if(rtLater) continue;
      const now=STUDY.progress(G,c,'final',T0); STAT.frozenChecks++; check('  [seed '+seed+' '+T+' 結束] 4b 上學期的課數字不變 '+T0+':'+id,J(now)===J(p),J({then:p,now})); } }
  }
  return {G,log}; }

(async()=>{
  const SHA=(()=>{ try{ return require('child_process').execSync('git -C '+J(SRC)+' rev-parse --short HEAD').toString().trim(); }catch(e){ return '?'; } })();
  console.log('受測：'+SRC+'（'+SHA+'）　種子數 '+NSEED);
  STAT={points:0,resetChecks:0,frozenChecks:0};
  const UNITS_BY_TERM={}; for(const u of UNITS){ UNITS_BY_TERM[u.course+'@'+u.term]=(UNITS_BY_TERM[u.course+'@'+u.term]||0)+1; }
  const runs=[]; const f0=fails;
  for(let s=1;s<=NSEED;s++) runs.push(['TW 一般 種子 '+s,await sim(s)]);
  runs.push(['TW 全勤＋每次總複習（x 應該到滿）',await sim(91,{pAtt:1,pStudy:0.3,pRev:1,pLegal:0.02})]);
  runs.push(['TW 只上課、不自習（BB 06:20：上課也算學過）',await sim(92,{pAtt:1,pStudy:0,pRev:0,pLegal:0})]);
  runs.push(['TW 重修（大一上民總、大二上行政法、大三上刑訴全錯）',await sim(93,{fail:['Y1S1:civ_general','Y2S1:admin_law','Y3S1:crimpro'],pAtt:0.8})]);
  runs.push(['JP 交換',await sim(94,{route:'JP',pAtt:0.8,pRev:0.5})]);
  runs.push(['US 交換',await sim(95,{route:'US',pAtt:0.8,pRev:0.5})]);
  console.log('—— 各路線摘要 ——');
  for(const [name,{G,log}] of runs){ console.log('  '+name+'：動作 '+J(log.actions)+'；retake='+J((G.courses.retake||[]).map(r=>r.id+':'+r.from+'→'+r.term)));
    for(const x of log.retake.concat(log.redo,log.reset)) console.log('    INFO 新學期第一天 '+x.kind+' '+x.T+' '+x.name+'：學過 '+x.x+'／'+x.y+'・答對過 '+x.z+'；法律頁 '+x.rows+' 列、放在「'+(x.sec==='cur'?'這學期':x.sec==='prev'?'之前的學期':'?')+'」（學期標示 '+x.tn+'）'); }
  /* 只上課的玩家：期末時每一門課的 x＝上過的週有卡的數量（不應該是 0） */
  { const {G}=runs.find(r=>r[0].startsWith('TW 只上課'))[1]; const rows=legalRows(G); console.log('  只上課路線 大四下結束時法律頁：'+rows.filter(r=>r.x!=null).map(r=>r.name+' '+r.x+'／'+r.y).join('、'));
    check('5a 只上課不自習：每一門考五題的課學過 x > 0（上課也算學過）',rows.filter(r=>r.x!=null&&r.name!=='刑事訴訟法').every(r=>r.x>0),J(rows.filter(r=>r.x===0))); }
  { const {G}=runs.find(r=>r[0].startsWith('TW 全勤'))[1]; const rows=legalRows(G); check('5b 全勤＋每學期總複習：每一門課 x＝y（讀滿）',rows.filter(r=>r.x!=null).every(r=>r.x===r.y),J(rows.filter(r=>r.x!==r.y))); }
  /* 刑訴題庫卡：大一就能讓「刑事訴訟法」出現在法律頁 */
  { rnd=rngOf(7); const G=H.fresh('2025-10-01',9,'dorm',{examSeed:1}); G.notes=[]; G.legal={q:{Q002:{state:'learned'}}}; const rows=legalRows(G); const cp=rows.find(r=>r.name==='刑事訴訟法');
    console.log('  INFO 大一上（2025-10-01）讀書會讀到 Q002（learned）以後，法律頁：'+J(rows));
    check('6 大一上只有讀書會碰過刑訴題庫：法律頁不應出現未來學期（大三上）的「刑事訴訟法」在「之前的學期」',!cp||cp.sec!=='prev',J(cp)); }
  /* 日本補修的筆記 id 不是卡片 id：舊存檔第一次讀到時的 backfill（STUDY.backfill 用 S.unit(筆記 id)）會漏掉 */
  { const {G}=runs.find(r=>r[0]==='JP 交換')[1]; const redoNotes=(G.notes||[]).filter(n=>/_re_w\d+$/.test(n.id)); const C=JSON.parse(JSON.stringify(G)); delete C.study; C.courses=JSON.parse(JSON.stringify(G.courses));
    const cs=['civpro_2_re','insurance_re'].map(COURSE); const live=cs.map(c=>STUDY.progress(G,c,'final','Y4S2'));
    const H0=H.G; H.G=C; STUDY.rec(C); const bf=cs.map(c=>STUDY.progress(C,c,'final','Y4S2')); H.G=H0;
    console.log('  INFO JP 補修的自習筆記 '+redoNotes.length+' 則（例 '+(redoNotes[0]||{}).id+'）；即時 read='+J(live.map(p=>p.read))+'，刪掉 G.study 重跑 backfill 後 read='+J(bf.map(p=>p.read))+'（backfill 只認「筆記 id＝卡片 id」；總複習本來就不留紀錄、backfill 推不回）'); }
  const realFails=fails-f0;
  console.log('檢查點：'+STAT.points+' 次（每次 1/2/3 三項）、新學期歸零 '+STAT.resetChecks+' 項、上學期不變 '+STAT.frozenChecks+' 項；FAIL '+realFails);
  if(realFails) console.log('FAIL 清單（前 15）：\n  '+FAILS.slice(0,15).join('\n  '));
  if(!NOMUT){
    console.log('—— 突變測試（每一種都應該被抓到；這一段的 FAIL 不算進總數）——');
    const MUT=[
      ['M1 progress 把答錯過（miss）的卡也算學過（x 會超過 y）',()=>{ const o=STUDY.progress; STUDY.progress=function(G,c,k,t){ const p=o.apply(this,arguments); const s=STUDY.rec(G); p.heard+=s.miss.length; return p; }; return ()=>{ STUDY.progress=o; }; }],
      ['M2 法律頁顯示 read（讀過）而不是 heard（學過）',()=>{ RL_SRC=RL_SRC0.replace("學過 '+pr.heard","學過 '+pr.read"); return ()=>{ RL_SRC=RL_SRC0; }; }],
      ['M3 上課不記「上過課」（attend 不呼叫 STUDY.heard）',()=>{ const o=STUDY.heard; STUDY.heard=()=>false; return ()=>{ STUDY.heard=o; }; }],
      ['M4 mark 不是只升不降（低的蓋掉高的）',()=>{ const o=STUDY.mark; STUDY.mark=function(G,id,st){ if(!STUDY.unit(id)) return false; STUDY.rec(G).u[id]=st; return true; }; return ()=>{ STUDY.mark=o; }; }],
      ['M5 換學期沒歸零（同週次的上學期卡也算進來）',()=>{ const o=STUDY.rank; STUDY.rank=function(G,u){ if(typeof u==='string') u=STUDY.unit(u); let r=o.call(this,G,u); if(u&&u.week!=null){ for(const id in STUDY.rec(G).u){ const v=STUDY.unit(id); if(v&&v.week===u.week&&v.term!==u.term) r=Math.max(r,o.call(this,G,v)); } } return r; }; return ()=>{ STUDY.rank=o; }; }],
      ['M6 自習字幕 STUDY.line（不帶學期）把「讀過」當成學過',()=>{ const o=STUDY.line; STUDY.line=function(G,c,term){ if(term) return o.apply(this,arguments); const p=STUDY.progress(G,c,'final'); return (c.name||'')+'　期末範圍：學過 '+p.read+'／'+p.total+'・答對過 '+p.got; }; return ()=>{ STUDY.line=o; }; }],
      ['M7 y 少算一張（total−1）',()=>{ const o=STUDY.progress; STUDY.progress=function(){ const p=o.apply(this,arguments); if(p.total) p.total--; return p; }; return ()=>{ STUDY.progress=o; }; }]];
    for(const [name,patch] of MUT){ const undo=patch(); const fb=fails, nb=FAILS.length; quiet=true; let err='';
      try{ await sim(3); await sim(91,{pAtt:1,pStudy:0.3,pRev:1,pLegal:0.02}); }catch(e){ err=String(e).slice(0,120); } finally { undo(); quiet=false; }
      const caught=FAILS.slice(nb).map(s=>s.replace(/^\s*\[[^\]]*\]\s*/,'').split('　')[0].replace(/ \S+$/,'')); const kinds=[...new Set(caught)].slice(0,4);
      fails=fb; FAILS.length=nb; const ok=caught.length>0||!!err;
      console.log((ok?'PASS ':'FAIL ')+'突變 '+name+' → '+(ok?'被抓到（'+caught.length+' 次）：'+kinds.join('；')+(err?' 例外 '+err:''):'沒被抓到')); if(!ok) fails++; }
  }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

/* ===== 觀念卡與學習進度（D118-B2-1102；docs/handoff/D118_PLAN.md 第 2 節第二、三點、第 4 節 D118-B2）
   D118（使用者 2026-11-02）：不是讀書打卡遊戲——每一科的「觀念」看得到讀過、答對過多少；不強迫每天讀，沒有任何會隨時間下降的數值。
   觀念卡資料：src/data/study_units.js（tools/study/build_units.py 產生）。每門考五題的法律課每個有考題的週一張卡（id＝<課>_w<週>，和筆記 id 一樣）＋刑訴題庫照章分卡。
   存檔：G.study={v:1,u:{卡片id:狀態},miss:[卡片id…],bf:1}——讀到時才補預設（STORY、CLS 的舊欄位都不改）。
   狀態只會往上：（未讀）→ heard（上過那一週的課）→ read（自習、總複習讀過）→ got（課堂提問、考試答對過這張卡的一題）。
   答錯只把卡片 id 推進 miss（之後的總複習排前面），不扣任何東西。刑訴題庫的卡另外照 LEGAL 的狀態算（learned 以上＝read、mastered＝got；LEGAL 不動）。
   接點：CLS.attend → heard；CLS.studyTopic → read；CLS.classAsk → 答對 got（筆記記題目、答案、考點）；CLS.runExam → 逐題 got／miss。
   成績照舊只看答題（CLS.scoreOf），這裡的狀態不進任何計分。 ===== */
'use strict';
const STUDY=(function(){
  const S={};
  const RANK={heard:1,read:2,got:3}; S.RANK=RANK;
  S.LABEL={heard:'上過課',read:'讀過',got:'答對過'};
  let IDX=null;
  const list=()=>typeof STUDY_UNITS!=='undefined'&&STUDY_UNITS&&Array.isArray(STUDY_UNITS.units)?STUDY_UNITS.units:[];
  function index(){ if(IDX) return IDX; IDX={byId:{},byQ:{},byCourse:{}};
    for(const u of list()){ IDX.byId[u.id]=u; (IDX.byCourse[u.course]||(IDX.byCourse[u.course]=[])).push(u); for(const q of (u.qids||[])) (IDX.byQ[q]||(IDX.byQ[q]=[])).push(u); }
    return IDX; }
  S.unit=id=>index().byId[id]||null;
  S.unitsOfQ=qid=>index().byQ[qid]||[];
  const courseId=c=>{ const id=c&&typeof c==='object'?c.id:c; const rd=typeof CLS!=='undefined'&&CLS.redoOf?CLS.redoOf(id):null; return rd?rd.id:id; };   /* 日本路線的補修（civpro_2_re…）＝原課的卡 */
  /* 讀到時補預設（舊存檔、新遊戲都一樣）；第一次讀到就從舊紀錄推回一次（backfill，bf 標記，重跑結果相同）*/
  S.rec=function(G){ if(!G) return null; let s=G.study; if(!s||typeof s!=='object'||Array.isArray(s)) s=G.study={v:1,u:{},miss:[]};
    if(!s.u||typeof s.u!=='object'||Array.isArray(s.u)) s.u={}; if(!Array.isArray(s.miss)) s.miss=[]; if(s.v==null) s.v=1;
    if(!s.bf){ s.bf=1; S.backfill(G); } return s; };
  S.stateOf=function(G,id){ const s=S.rec(G); const v=s&&s.u[id]; return RANK[v]?v:null; };
  /* 只升不降：新狀態比現在高才寫 */
  S.mark=function(G,unitId,state,src){ if(!G||!RANK[state]) return false; const u=S.unit(unitId); if(!u) return false; const s=S.rec(G); const cur=s.u[unitId];
    if((RANK[cur]||0)>=RANK[state]) return false; s.u[unitId]=state; return true; };   /* src（attend／study／ask／exam／backfill）只是呼叫端的說明，不存 */
  S.miss=function(G,unitId){ const s=S.rec(G); if(!s||!S.unit(unitId)) return; const i=s.miss.indexOf(unitId); if(i>=0) s.miss.splice(i,1); s.miss.push(unitId); if(s.miss.length>300) s.miss.splice(0,s.miss.length-300); };
  /* 某一門課某一週的卡（沒有考題的週沒有卡）*/
  S.weekUnit=function(c,week){ return S.unit(courseId(c)+'_w'+week); };
  /* 上過那一週的課 */
  S.heard=function(G,c,week){ const u=S.weekUnit(c,week); return u?S.mark(G,u.id,'heard','attend'):false; };
  /* 回答了一題（題號＝EXAM_BANK 或 QBANK）：答對＝那張卡 got；答錯＝推進 miss（狀態不變）*/
  S.answer=function(G,qid,ok,src){ let n=0; for(const u of S.unitsOfQ(qid)){ if(ok){ if(S.mark(G,u.id,'got',src)) n++; } else S.miss(G,u.id); } return n; };
  /* 考試範圍內的卡：和 CLS.examPool 的期末範圍一樣（第 15 週以前；D118 起沒有期中考）。重修照 CLS.rtTerm（原本那一學期）、日本補修照 CLS.redoOf（原課）*/
  S.units=function(G,course,term,kind){ const id0=course&&typeof course==='object'?course.id:course, cid=courseId(id0); const all=index().byCourse[cid]||[];
    let base=term||null; if(base&&typeof CLS!=='undefined'){ const rd=CLS.redoOf?CLS.redoOf(id0):null; if(rd) base=rd.term; else if(CLS.rtTerm) base=CLS.rtTerm(id0,term); }
    const maxW=kind==='all'?99:15; let out=all.filter(u=>u.week==null||u.week<=maxW); if(base){ const t=out.filter(u=>u.term===base); if(t.length) out=t; } return out; };
  /* 刑訴題庫卡：照 LEGAL 的狀態（G.legal.q）——learned 以上＝read、mastered＝got（不改 LEGAL）*/
  const LEGAL_RANK={learned:2,understood:2,mastered:3};
  const legalRank=(G,u)=>{ if(u.src!=='qbank'||!G||!G.legal||!G.legal.q) return 0; let r=0; for(const q of u.qids){ const e=G.legal.q[q]; if(e&&LEGAL_RANK[e.state]>r) r=LEGAL_RANK[e.state]; } return r; };
  S.rank=function(G,u){ if(typeof u==='string') u=S.unit(u); if(!u) return 0; const s=S.rec(G); return Math.max(RANK[s.u[u.id]]||0,legalRank(G,u)); };
  S.status=function(G,u){ const r=S.rank(G,u); return r>=3?'got':r>=2?'read':r>=1?'heard':null; };
  /* 一科的進度：total＝範圍內的卡；heard＝上過課以上；read＝讀過以上（答對過的也算讀過）；got＝答對過 */
  S.progress=function(G,course,kind,term){ const us=S.units(G,course,term,kind||'final'); const o={total:us.length,heard:0,read:0,got:0};
    for(const u of us){ const r=S.rank(G,u); if(r>=1) o.heard++; if(r>=2) o.read++; if(r>=3) o.got++; } return o; };
  /* 「法律」頁、讀書結束字幕的那一行 */
  S.line=function(G,c,term){ const p=S.progress(G,c,'final',term); if(!p.total) return ''; return (c&&c.name?c.name:'')+'　期末範圍：讀過 '+p.read+'／'+p.total+'・答對過 '+p.got; };
  /* 顯示用的內容：AA 的白話稿到之前用 fallback＝那一週的黑板三行＋教授那一句＋題目的考點／解析（題目原文、答案不動）*/
  S.view=function(u){ if(typeof u==='string') u=S.unit(u); if(!u) return null; const c=typeof CLS!=='undefined'&&CLS.byId?CLS.byId(u.course):null;
    const syl=typeof SYLLABUS!=='undefined'&&SYLLABUS.courses&&SYLLABUS.courses[u.course]?SYLLABUS.courses[u.course].find(w=>w.w===u.week):null;
    const board=syl&&Array.isArray(syl.board)?syl.board.filter(Boolean):[];
    const qs=u.qids.map(id=>(typeof EXAM_BANK!=='undefined'?EXAM_BANK.questions.find(q=>q.id===id):null)||(typeof QBANK!=='undefined'?QBANK.find(q=>q.id===id):null)).filter(Boolean);
    const cores=[]; for(const q of qs){ for(const t of [q.core,q.explanation]) if(t&&!cores.includes(t)) cores.push(t); }
    return {title:u.title,plain:u.plain||'',example:u.example||'',cue:u.cue||'',board,line:syl&&syl.line?syl.line:'',prof:c&&typeof CLS!=='undefined'&&CLS.profName?CLS.profName(c):'老師',cores}; };
  /* 「法律」頁要列的課：這學期考五題的法律課（還沒上也列，看得到範圍有多少），加上之前的學期有任何紀錄的課 */
  S.courses=function(G){ if(typeof CLS==='undefined'||typeof CALENDAR==='undefined'||!G) return []; const cur=(CALENDAR.termOf(G.day)||{}).id||null, out=[], seen={};
    const add=(c,term,current)=>{ if(!c||seen[c.id]) return; seen[c.id]=1; out.push({c,term,current}); };
    if(cur) for(const c of CLS.termCourses(G,cur)) if(CLS.isExamCourse(c)&&S.units(G,c,cur).length) add(c,cur,true);
    const s=S.rec(G); const touched={}; for(const id in s.u){ const u=S.unit(id); if(u) touched[u.course]=1; }
    for(const cid in index().byCourse){ if(seen[cid]) continue; const qb=cid==='crimpro'&&index().byCourse[cid].some(u=>legalRank(G,u)>0); if(!touched[cid]&&!qb) continue; const c=CLS.byId(cid); if(c) add(c,c.term,c.term===cur); }
    return out; };
  /* 舊存檔：從 G.notes、G.courses 的 done／ask／exam 推回狀態（只跑一次；失敗就用空的狀態，不擋讀檔）*/
  S.backfill=function(G){ const s=G&&G.study; if(!s) return 0; let n=0;
    try{
      const R=G.courses&&typeof G.courses==='object'?G.courses:{};
      /* 上過的課（R.done 的 key＝日:課:節；考試那一堂是第 16 週，沒有卡）*/
      if(R.done&&typeof R.done==='object'&&typeof CALENDAR!=='undefined') for(const k in R.done){ const p=k.split(':'); if(p.length<3) continue; const t=CALENDAR.termOf(+p[0]); if(!t||!t.week) continue; if(S.heard(G,p[1],t.week)) n++; }
      /* 讀過的筆記（筆記 id＝<課>_w<週>＝卡片 id）*/
      if(Array.isArray(G.notes)) for(const nt of G.notes){ if(nt&&nt.id&&S.unit(nt.id)&&S.mark(G,nt.id,'read','backfill')) n++; }
      /* 課堂提問（R.ask['學期:題號']＝玩家選的）：答對 got；答錯是有上那堂課（heard）＋miss */
      if(R.ask&&typeof R.ask==='object'&&typeof EXAM_BANK!=='undefined') for(const k in R.ask){ const qid=k.slice(k.indexOf(':')+1), q=EXAM_BANK.questions.find(x=>x.id===qid); if(!q) continue;
        const ok=String(R.ask[k])===String(q.answer); for(const u of S.unitsOfQ(qid)){ if(S.mark(G,u.id,'heard','backfill')) n++; } n+=S.answer(G,qid,ok,'backfill'); }
      /* 考過的試（R.exam[學期:課:種類] 的 qs／ans）*/
      let pool=null;
      if(R.exam&&typeof R.exam==='object') for(const k in R.exam){ const e=R.exam[k]; if(!e||e.status!=='done'||!Array.isArray(e.qs)||!Array.isArray(e.ans)||/:mid$/.test(k)) continue;   /* 舊存檔的期中練習（:mid）保留不讀（D118 沒有期中考，使用者 05:0x）*/
        if(!pool){ pool={}; if(typeof EXAM_BANK!=='undefined') for(const q of EXAM_BANK.questions) pool[q.id]=q; if(typeof QBANK!=='undefined') for(const q of QBANK) pool[q.id]=pool[q.id]||q; }
        e.qs.forEach((id,i)=>{ const q=pool[id]; if(q) n+=S.answer(G,id,String(e.ans[i])===String(q.answer),'backfill'); }); }
    }catch(err){ if(typeof console!=='undefined') console.warn('STUDY.backfill',err); s.u={}; s.miss=[]; return 0; }
    return n; };
  return S;
})();

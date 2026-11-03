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
  S.line=function(G,c,term){ const p=S.progress(G,c,'final',term); if(!p.total) return ''; return (c&&c.name?c.name:'')+'　期末範圍：學過 '+p.heard+'／'+p.total+'・答對過 '+p.got; };   /* BB 06:20 判定：上課也算學過（只上課不自習的玩家不該看到「讀過 0」——那等於暗示去刷自習）；x＝上過課、自習、總複習、答對過任一種 */
  /* 顯示用的內容：AA 的白話稿到之前用 fallback＝那一週的黑板三行＋教授那一句＋題目的考點／解析（題目原文、答案不動）*/
  S.view=function(u){ if(typeof u==='string') u=S.unit(u); if(!u) return null; const c=typeof CLS!=='undefined'&&CLS.byId?CLS.byId(u.course):null;
    const syl=typeof SYLLABUS!=='undefined'&&SYLLABUS.courses&&SYLLABUS.courses[u.course]?SYLLABUS.courses[u.course].find(w=>w.w===u.week):null;
    const board=syl&&Array.isArray(syl.board)?syl.board.filter(Boolean):[];
    const qs=u.qids.map(id=>(typeof EXAM_BANK!=='undefined'?EXAM_BANK.questions.find(q=>q.id===id):null)||(typeof QBANK!=='undefined'?QBANK.find(q=>q.id===id):null)).filter(Boolean);
    const cores=[]; for(const q of qs){ for(const t of [q.core,q.explanation]) if(t&&!cores.includes(t)) cores.push(t); }
    return {title:u.title,plain:u.plain||'',example:u.example||'',cue:u.cue||'',board,line:syl&&syl.line?syl.line:'',prof:c&&typeof CLS!=='undefined'&&CLS.profName?CLS.profName(c):'老師',cores}; };
  /* 「法律」頁要列的課：這學期考五題的法律課（還沒上也列，看得到範圍有多少），加上之前的學期有任何紀錄的課 */
  /* BUG-LEGALPAGE-RETAKE-ROW-1102（CC M6 P3）：只在讀書會碰過刑訴題庫、還沒修到刑訴＝不建「刑事訴訟法」那一列；修過（那學期的課表有、那學期已經到了）才算 */
  const tOrd=id=>{ const m=/^Y(\d)S(\d)$/.exec(id||''); return m?(+m[1])*2+(+m[2]):-1; };
  const enrolled=(G,c,cur)=>{ if(!c||!c.term||tOrd(c.term)<0||tOrd(cur)<tOrd(c.term)) return false; try{ return CLS.termCourses(G,c.term).some(x=>x.id===c.id); }catch(e){ return false; } };
  S.courses=function(G){ if(typeof CLS==='undefined'||typeof CALENDAR==='undefined'||!G) return []; const cur=(CALENDAR.termOf(G.day)||{}).id||null, out=[], seen={};
    const add=(c,term,current)=>{ if(!c||seen[c.id]) return; seen[c.id]=1; out.push({c,term,current}); };
    if(cur) for(const c of CLS.termCourses(G,cur)) if(CLS.isExamCourse(c)&&S.units(G,c,cur).length) add(c,cur,true);
    const s=S.rec(G); const touched={}; for(const id in s.u){ const u=S.unit(id); if(u) touched[u.course]=1; }
    for(const cid in index().byCourse){ if(seen[cid]) continue; const c=CLS.byId(cid); if(!c) continue; const qb=cid==='crimpro'&&enrolled(G,c,cur)&&index().byCourse[cid].some(u=>legalRank(G,u)>0); if(!touched[cid]&&!qb) continue; add(c,c.term,c.term===cur); }
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

  /* ===== 一鍵總複習（D118-B3-1102；D118_PLAN 第 2 節第四點、第 1 節 ②-3～②-5；使用者 05:0x「沒有期中考」＝只有 'final'）=====
     開放：這學期期末週的前一週起（照日曆 CALENDAR.termOf(day).exam==='final' 的第一天往前 7 天；大四下只有 15 週也一樣，不寫死週次）～這學期的期末考考完為止。
     範圍：這學期還沒考、題庫夠 5 題的考五題法律課（CLS.examList；含重修 CLS.rtTerm、日本補修 CLS.redoOf——S.units 照原本那一學期的卡），不受 studyPick 的 slice 限制。
     按一次：先過 3 小時（GM.advance；不呼叫 slotUse，時段次數用完也能做）、G.stats.study +3、照常 STORY.onStudy（地點照實際讀書的地方；家裡記 'home'）；
       範圍內全部的卡設成「讀過」（只升不降，答對過的不動）——先設好再開閱讀，跳過、提早結束也算讀過（D118：讓玩家「有機會」讀完，不是逼他點完）；
       翻頁閱讀（GM.say／GM.choose，不新做 DOM）：一科一節、答錯過的卡（miss）排最前面；每張卡＝標題、白話（AA 的稿還沒到＝黑板＋教授那一句＋重點）、課堂提問的題目／答案／考點；
       「下一張」「跳到下一科」「先讀到這裡」；結束時字幕每科一行（S.line）。
     不跨天：開始時間 +3 小時會到午夜（21:00 以後）就不給——選項變灰、寫原因（選「直接不給」，不做「只讀到 23:59」：讀不滿三小時的總複習要另外定效果，D118 沒有要）。
       閉館前讀不完、會錯過今天還沒考的期末考：也變灰；會錯過一般的課：只寫在提示裡（和自習的長度選單一樣）。
     可以重複做，沒有次數限制；不存任何新欄位（狀態只寫進 G.study.u）。成績照舊只看答題（CLS.scoreOf、HONOR、GRADES、pushLevel 都不動；drawExam 抽到的題號不變）。
     介面字照 AA_638（企劃線 3271973c6）定稿。 ===== */
  S.REVIEW_HRS=3;
  S.REVIEW_LABEL='考前總複習';   /* AA_638 定稿（企劃線 3271973c6）*/
  S.REMIND_TEXT='【期末】下週開始期末考。坐到書桌或讀書的位子，可以把這學期一次讀過一遍。';   /* AA_638 定稿 */
  const lawStage=G=>!!G&&(G.stage||'law')==='law';
  const finalMemo={};
  /* 這學期期末週的第一天（日曆 exam==='final'）；沒有＝null */
  S.finalStart=function(termId){ if(termId in finalMemo) return finalMemo[termId]; let res=null, in0=false;
    if(typeof CALENDAR!=='undefined') for(let d=-420;d<2400;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===termId){ in0=true; if(t.exam==='final'){ res=d; break; } } else if(in0) break; }
    return finalMemo[termId]=res; };
  /* 考試週前一週的週日（提醒的那一天）*/
  S.remindDay=function(termId){ const f0=S.finalStart(termId); if(f0==null||typeof CALENDAR==='undefined') return null; for(let d=f0-1;d>=f0-7;d--) if(CALENDAR.dateOf(d).wd===7) return d; return null; };
  const poolN=(cid,termId)=>{ const p=CLS.examPool(cid,termId,'final'); return p.cls.length+p.bank.length+p.ai.length; };
  /* 現在開不開、範圍是哪些課：null＝不開；{kind,term,courses:[{c,exam,units}]}（照考試日排）*/
  /* 學期外的總複習（別的模組加：G=>info|null；info 和下面一樣，多 what＝提示裡「這學期還要考的」換成的字）：這學期的期末沒有可以總複習的才看。
     D118 大四下補考（src/faildelay3d.js）：6/18 成績單到補考開始以前，補考那幾科的期末範圍可以總複習 */
  S.REVIEW_EXTRA=[];
  S.REVIEW_CHECKS=[];   /* G=>原因｜null：總複習不能開始的另外原因（例：會錯過補考）*/
  S.reviewInfo=function(G,kind){ const r=reviewTerm(G,kind); if(r) return r; if((kind||'final')!=='final'||!lawStage(G)) return null;
    for(const f of S.REVIEW_EXTRA){ let x=null; try{ x=f(G); }catch(e){ console.warn('STUDY.REVIEW_EXTRA',e); } if(x&&x.courses&&x.courses.length) return x; } return null; };
  const reviewTerm=function(G,kind){ if((kind||'final')!=='final') return null;   /* D118：沒有期中考（'mid' 取消，使用者 05:0x）*/
    if(!lawStage(G)||typeof CALENDAR==='undefined'||typeof CLS==='undefined'||!CLS.examList) return null; const t=CALENDAR.termOf(G.day); if(!t) return null;
    if(CLS.termAway&&CLS.termAway(G,t.id)) return null; const f0=S.finalStart(t.id); if(f0==null||G.day<f0-7) return null;
    const R=CLS.rec(G), out=[];
    for(const e of CLS.examList(G,t.id)){ const st=((R.exam||{})[t.id+':'+e.c.id+':final']||{}).status; if(st==='done'||st==='insufficient') continue;   /* 考過的、沒開考的 */
      if(e.day<G.day||(e.day===G.day&&G.hour>=e.t1)) continue;   /* 考試時間已經過了 */
      if(poolN(e.c.id,t.id)<5) continue; const us=S.units(G,e.c,t.id,'final'); if(!us.length) continue; out.push({c:e.c,exam:e,units:us}); }
    return out.length?{kind:'final',term:t.id,courses:out}:null; };
  /* 現在按下去能不能做：{dim,why,warn}（o.home：在家，不看閉館）*/
  S.reviewCheck=function(G,o){ o=o||{}; const h=G.hour, hh=S.REVIEW_HRS; if(h+hh>24-1e-6) return {dim:true,why:'要讀三個小時。21:00 以後開始就太晚了。'};
    for(const f of S.REVIEW_CHECKS){ let w=null; try{ w=f(G,hh); }catch(e){ console.warn('STUDY.REVIEW_CHECKS',e); } if(w) return {dim:true,why:w}; }
    const sc=CLS.spanCheck?CLS.spanCheck(G,hh,{noClose:!!o.home}):{closed:false,miss:[],exam:[]};
    if(sc.closed) return {dim:true,why:'快閉館了，讀不完三個小時。'};
    if(sc.hard&&sc.hard.length) return {dim:true,why:'會錯過：'+sc.hard.join('、')+'。'};   /* CLS.HARD_FNS（補考）*/
    if(sc.exam.length) return {dim:true,why:'會錯過'+sc.exam.join('、')+'的期末考。'};
    return {dim:false,why:'',warn:sc.miss.length?'會錯過：'+sc.miss.join('、'):''}; };
  /* 選單的那一項（座位、書桌、Café、家裡）：不開＝null */
  S.reviewOpt=function(G,o){ const info=S.reviewInfo(G,'final'); if(!info) return null; const ck=S.reviewCheck(G,o); const n=info.courses.reduce((a,x)=>a+x.units.length,0);
    return {t:S.REVIEW_LABEL,review:true,dim:ck.dim,hint:ck.dim?ck.why:(info.what||'這學期還要考的')+' '+info.courses.length+' 科，'+n+' 張觀念卡。要三個小時，今天其他的事照常可以做。'+(ck.warn?ck.warn:'')}; };   /* 提示：暫定字 */
  const askQ=u=>{ if(!u||!u.askQid||typeof EXAM_BANK==='undefined') return null; return EXAM_BANK.questions.find(q=>q.id===u.askQid)||null; };
  const ansText=q=>q.type==='tf'||!q.options?q.answer:'（'+q.answer+'）'+q.options[q.answer];
  /* 一張卡要說的幾句（不含標題列）：白話（＋例子）或 fallback（黑板第二三行＋教授那一句、重點）、課堂提問 */
  S.CARD_CHUNK=220;   /* 一則最多約幾個字（超過就照句號分段）*/
  S.cardLines=function(u){ if(typeof u==='string') u=S.unit(u); const v=S.view(u); if(!v) return []; const out=[], q=askQ(u);
    if(v.plain){ const one=v.plain+(v.example?'　例子：'+v.example:'');
      if(one.length<=S.CARD_CHUNK) out.push(one);
      else { let cur=''; for(const sen of (v.plain.match(/[^。！？]+[。！？]?/g)||[v.plain])){ if(cur&&(cur+sen).length>S.CARD_CHUNK){ out.push(cur); cur=''; } cur+=sen; } if(cur) out.push(cur); if(v.example) out.push('例子：'+v.example); } }   /* 長卡（AA 11:46：securities_w5 1238 字）：白話照句號分成幾則、例子另一則；不拆卡（卡 id 不動）*/
    else { const b=[v.board.slice(1).filter(Boolean).join('　'),v.line?v.prof+'：'+v.line:''].filter(Boolean).join('　'); if(b) out.push(b);
      const cores=v.cores.filter(t=>!(q&&(t===q.core||t===q.explanation))); if(cores.length){ const all=cores.join('　'); if(all.length<=140) out.push('重點：'+all); else cores.forEach((t,i)=>out.push((i?'':'重點：')+t)); } }
    if(q) out.push('課堂提問：'+q.q+'　答案：'+ansText(q)+(q.core?'　考點：'+q.core:'')+(q.explanation&&q.explanation!==q.core?'　'+q.explanation:''));
    return out; };
  /* 一科的卡照順序：答錯過的（最近答錯的先）→ 其他照週次 */
  const ordered=(G,us)=>{ const s=S.rec(G), mi=s.miss; const m=us.filter(u=>mi.includes(u.id)).sort((a,b)=>mi.indexOf(b.id)-mi.indexOf(a.id)); const rest=us.filter(u=>!mi.includes(u.id)).sort((a,b)=>(a.week==null?99:a.week)-(b.week==null?99:b.week)); return {cards:m.concat(rest),miss:new Set(m.map(u=>u.id))}; };
  /* 按一次。o.home：在家裡的選單（STORY.onStudy 的地點記 'home'、不看閉館）。回傳 false＝沒做；{ok,term,courses,cards,shown} */
  S.review=async function(GM,kind,o){ o=o||{}; const G=GM.G; const info=S.reviewInfo(G,kind||'final'); if(!info) return false;
    const ck=S.reviewCheck(G,o); if(ck.dim){ if(GM.toast) GM.toast(ck.why,3000); return false; }
    await GM.fade(true); GM.advance(S.REVIEW_HRS); G.stats=G.stats||{}; G.stats.study=(G.stats.study||0)+S.REVIEW_HRS;
    if(typeof STORY!=='undefined'&&STORY.onStudy){ const z0=G.zone; if(o.home) G.zone='home'; try{ STORY.onStudy(GM,S.REVIEW_HRS); }catch(e){ console.warn('STORY.onStudy',e); } finally { G.zone=z0; } }   /* 家裡（2D 選單）的 G.zone 是出門前的區域：那一下記成 home，不算宿舍、不算圖書館 */
    let total=0; for(const x of info.courses) for(const u of x.units){ total++; try{ S.mark(G,u.id,'read','review'); }catch(e){ console.warn('STUDY.mark',e); } }
    await GM.fade(false);
    let shown=0; const L=info.courses.map(x=>Object.assign({c:x.c},ordered(G,x.units)));
    await GM.say(null,'（你把這學期的筆記攤開。'+(info.what||'這學期還要考的')+' '+L.length+' 科，一共 '+total+' 張觀念卡。）');   /* AA_638 定稿（開始字幕）*/
    outer: for(let ci=0;ci<L.length;ci++){ const X=L[ci], N=X.cards.length;
      for(let k=0;k<N;k++){ const u=X.cards[k], v=S.view(u); shown++;
        await GM.say(null,'【'+X.c.name+'　'+(k+1)+'／'+N+'】'+v.title+(X.miss.has(u.id)?'（之前答錯過）':''));
        for(const t of S.cardLines(u)) await GM.say(null,t);
        const lastAll=ci===L.length-1&&k===N-1; if(lastAll) break outer;
        const opts=[{t:'下一張',hint:k===N-1?'下一科：'+L[ci+1].c.name:(k+2)+'／'+N}]; if(ci<L.length-1&&k<N-1) opts.push({t:'跳到下一科',hint:L[ci+1].c.name}); opts.push({t:'先讀到這裡',hint:'沒翻到的，也算讀過一遍',end:true});   /* AA_638 定稿 */
        const j=await GM.choose(opts), po=(opts[j]||opts[0]), pick=po.t; if(po.end) break outer;   /* AA_638：選項字改成「先讀到這裡」，用 end 判斷 */ if(pick.startsWith('跳到下一科')) continue outer; } }
    const lines=info.courses.map(x=>S.line(G,x.c,info.term)).filter(Boolean); if(lines.length&&GM.caption) GM.caption('',lines.join('<br>'),2400+1200*lines.length);   /* 每科一行（和「法律」頁同一行）*/
    return {ok:true,term:info.term,courses:info.courses.map(x=>x.c.id),cards:total,shown}; };
  /* 考試週前一週的週日 20:00 系統提醒（只發一次；只在那一週排——之後才讀到的存檔不補發；不提醒也不扣任何東西）*/
  S.remind=function(G){ if(!lawStage(G)||typeof PHONE==='undefined'||typeof CALENDAR==='undefined'||typeof CLS==='undefined'||!CLS.examList) return false; const t=CALENDAR.termOf(G.day); if(!t) return false;
    const tag='review_'+t.id; if(PHONE.sent(G,tag)) return false; if(CLS.termAway&&CLS.termAway(G,t.id)) return false;
    const sun=S.remindDay(t.id); if(sun==null||G.day<sun-6||G.day>sun) return false;
    if(!CLS.examList(G,t.id).some(e=>poolN(e.c.id,t.id)>=5)) return false;
    return PHONE.at(G,sun,20,[{th:'sys',text:S.REMIND_TEXT}],tag); };
  /* D118-B4：考試裡的 cue——那一題的觀念卡讀過以上（read、got）才出一行提醒（只提醒觀念、不點出選項）；cue 是 AA 的稿，空的時候先用卡片標題（黑板第一行）。不影響計分 */
  S.CUE_PREFIX='（你想起筆記上寫的：';   /* AA_638 定稿（照留）*/
  /* BUG-B4-CUE-LEAK-1102（BB 07:28）：提示的字出現在正確選項、卻沒有出現在任何錯誤選項＝等於指答案，這一題不出提示（例：CRIM45_34「因果關係」只在 (B)）*/
  /* BUG-B4-CUE-LEAK-1102 第二輪（BB 08:54，CC N3 掃描 cc-testing b9a6f885）：只比整段字串擋不到「標題裡某個術語只出現在正確選項」。
     改成看詞（和 CC 的 test_tools/cc/n3_cue_leak_scan.js 同一套切法）：提示字串（cue，和卡片標題）切成 2 字以上的連續片段、去掉虛詞與泛用詞；
     只出現在正確選項、沒出現在任何錯誤選項的片段＝命中；最長命中 ≥3 字、或命中字數占正確選項 1/4 以上（CC 的 A、B 級）＝這一題不出提示。是非題一律不出（標題常常就是那條規則）。*/
  const CUE_STOP_CH=new Set('的之與及法和或是在有不為而了誰何其於以由對者所也就都被把將從向這那各該此其等即並且但若如則可能會要什麼怎麼哪些個一二三四五六七八九十'.split(''));
  const CUE_STOP_W=new Set(['什麼','可以','自己','怎麼','時候','問題','哪些','一個','是否','如何','為何','什麼時候','誰可以','法律','規定','原則','民法','刑法','憲法','刑事','訴訟','刑事訴訟','事訴訟法','刑事訴訟法','訴訟法','事訴','訟法','行為','權利','效力','效果','關係','概念','基本','一般','意義','條文','制度','以上','皆是','皆非','有效','無效','應該','須有','（一）','（二）','（三）','（四）']);
  const CUE_EDGE=new Set('的之與及和或是在而了其於以對者所也並且但若則'.split(''));
  const cueGrams=t=>{ const out=new Set(); for(const seg of (String(t).match(/[一-鿿A-Za-z0-9§\-]+/g)||[])){ const a=[...seg]; for(let n=2;n<=a.length;n++) for(let i=0;i+n<=a.length;i++){ const g=a.slice(i,i+n).join('');
      if(CUE_STOP_W.has(g)||[...g].every(ch=>CUE_STOP_CH.has(ch))||/^[0-9\-]+$/.test(g)||CUE_EDGE.has(a[i])||CUE_EDGE.has(a[i+n-1])) continue; out.add(g); } } return [...out]; };
  S.cueHits=function(q,texts){ if(!q||!q.options) return []; const keys=Object.keys(q.options), R=keys.filter(k=>String(k)===String(q.answer)).map(k=>String(q.options[k])).join(' '), W=keys.filter(k=>String(k)!==String(q.answer)).map(k=>String(q.options[k]));
    let hits=[]; for(const t of [].concat(texts||[])) if(t) for(const g of cueGrams(t)) if(R.includes(g)&&!W.some(w=>w.includes(g))) hits.push(g);
    hits=[...new Set(hits)]; hits=hits.filter(g=>!hits.some(h=>h!==g&&h.includes(g))); const maxL=hits.reduce((m,g)=>Math.max(m,[...g].length),0), cover=hits.length?Math.round(100*hits.reduce((a,g)=>a+[...g].length,0)/Math.max(1,[...R].length)):0;
    return {hits,maxL,cover,tier:!hits.length?'-':(maxL>=4||cover>=50)?'A':(maxL>=3||cover>=25)?'B':'C'}; };
  S.cueLeaks=function(q,t,title){ if(!q||!t) return false; if(q.type==='tf'||!q.options) return true;   /* 是非題一律不出提示（BB 08:54 ②）*/
    const keys=Object.keys(q.options); const right=keys.filter(k=>String(k)===String(q.answer)), wrong=keys.filter(k=>String(k)!==String(q.answer));
    const has=k=>String(q.options[k]||'').includes(t); if(right.some(has)&&!wrong.some(has)) return true;   /* 整段字串（第一輪）*/
    const h=S.cueHits(q,[t,title]); return h.tier==='A'||h.tier==='B'; };
  S.cueFor=function(G,qOrId){ const qid=typeof qOrId==='object'&&qOrId?qOrId.id:qOrId; const q=typeof qOrId==='object'&&qOrId?qOrId:((typeof EXAM_BANK!=='undefined'?EXAM_BANK.questions.find(x=>x.id===qid):null)||(typeof QBANK!=='undefined'?QBANK.find(x=>x.id===qid):null)||null); if(!q) return null;
    for(const u of S.unitsOfQ(qid)){ const st=S.stateOf(G,u.id); if(st==='read'||st==='got'){ const cue=(u.cue||'').trim(), t=cue||(S.view(u)||{}).title||u.title; if(t&&!S.cueLeaks(q,t)) return S.CUE_PREFIX+t+'）';   /* AA 10:26：有 cue＝只看 cue 會不會洩題（卡片標題是黑板第一行、常常就是答案術語，不算進去）；沒有 cue＝標題本身當提示、就檢查標題 */ } } return null; };
  /* D118-B4：考後訂正——答錯的題寫成一則筆記（同一科同一次考試一則；miss 已經在 STUDY.answer 記了）*/
  S.FIX_TITLE=(n,key)=>{ const p=String(key||'').split(':'), tn=p[0]&&typeof CLS!=='undefined'&&CLS.termName?CLS.termName(p[0]):''; return n+'・'+(tn||'')+(p[2]==='makeup'?'補考訂正':'期末考訂正'); };   /* 暫定字；加學期（BB 09:31，CC M2：重修又被當、四年以後同名找不到）、補考另一個名字；舊存檔已有的筆記標題不動 */
  S.fixNote=function(GM,c,key,wrong){ if(!wrong.length||!GM.addNote) return false;
    const body=wrong.map(w=>'第 '+w.n+' 題　'+w.q.q+'\n答案：'+w.a+(w.q.core?'\n考點：'+w.q.core:'')+(w.q.explanation&&w.q.explanation!==w.q.core?'\n'+w.q.explanation:'')).join('\n\n');
    return GM.addNote('examfix_'+key,S.FIX_TITLE(c.name,key),body); };
  /* 家裡的選單（週末回家、HOME.MENU_OPTS）*/
  S.homeOpt=function(G){ const o=S.reviewOpt(G,{home:true}); if(!o) return null; return {t:o.t,hint:o.hint,run:async GM=>{ await S.review(GM,'final',{home:true}); }}; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.remind(G));
  if(typeof HOME!=='undefined'&&Array.isArray(HOME.MENU_OPTS)&&!HOME.MENU_OPTS.includes(S.homeOpt)) HOME.MENU_OPTS.push(S.homeOpt);
  return S;
})();

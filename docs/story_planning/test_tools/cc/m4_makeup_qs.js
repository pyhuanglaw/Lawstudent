// CC M4「補考題目」——不需要瀏覽器（Node）。
// 用法：
//   cd /home/user/Lawstudent && git archive <SHA> src tests index.html | tar -x -C <資料夾>
//   nice -n 19 node docs/story_planning/test_tools/cc/m4_makeup_qs.js <資料夾> [種子數，預設 12]
//   （資料夾＝有 src/、tests/pg_harness.js 的受測版本根目錄）
// 做什麼：
//   A 真實流程（一般路線、台灣交換路線＝不是國外交換，遊戲裡會排補考）：Y3S2、Y4S1、Y4S2 每一門考五題的課都用真的 CLS.runExam 考期末、全部答錯，
//     學期末真的 CLS.showGrades（planRetakes 把 Y3S2→Y4S1→Y4S2 的重修鏈、Y4S1→Y4S2 的重修排進大四下），6/18 真的 FD.check 排補考、6/26 真的 FD.makeup
//     （runExam kind='makeup'）。比對每一科 R.exam['Y4S2:課:final'].qs 和 ['Y4S2:課:makeup'].qs，以及補考時實際唸出來的題幹。
//   B 國外交換路線（JP、US）：遊戲裡 FD.check 不排補考（faildelay3d.js 的 exch）；這裡期末照真的 runExam 考，補考題「直接呼叫 CLS.drawExam(...,'makeup')」看抽題結果（標明是直接呼叫）。
//   C 題庫不到 10 題：A 裡面就有真的（Y4S1 的強制執行法、法律倫理、刑事判決研討各 8 題，重修排到大四下）；另外在模擬裡把海商法題庫縮成 4～10 題（構造情境）逐一示範。
//   D 同一份存檔重抽：①補考考完存檔→JSON→讀檔→再 drawExam；②補考前（6/18 以後）的存檔→JSON→讀檔→再跑 FD.makeup；③換一個 examSeed 對照（應該不同）。
//   E 突變測試：故意把抽題改壞，上面的檢查必須 FAIL（證明檢查不是空的）。
// 出席制的課不在 M4 範圍：CLS.attPass 一律及格（免得點名讓 FD.check 不排補考）。
'use strict';
const path=require('path'), fs=require('fs'), vm=require('vm');
const SRC=path.resolve(process.argv[2]||'.');
const NSEED=+(process.argv[3]||12);
const H=require(path.join(SRC,'tests/pg_harness.js'));
const {GM}=H;
const load=f=>{ const p=path.join(SRC,f); if(!fs.existsSync(p)){ console.log('（沒有 '+f+'）'); return; } const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/jp3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
GM.caption=()=>{}; GM.toast=()=>{}; GM.addNote=()=>true; GM.hasNote=()=>false;
CLS.attPass=()=>true;
const J=JSON.stringify;
let fails=0;
const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; return ok; };
const rngOf=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };

/* 作答：期末一律答錯（被當才有補考），補考照種子亂數 */
let curKind=null, curQs=null, rnd=Math.random;
const QRE=/^(\d)／5　/;
GM.choose=async o=>{ const last=H.said[H.said.length-1]; const m=last&&QRE.exec(last.t); if(!m||!curQs) return 0; const q=curQs[+m[1]-1];
  const ok=x=>{ const t=x.t||x.text; return t===String(q.answer)||t.startsWith('（'+q.answer+'）'); };
  if(curKind==='final'){ const k=o.findIndex(x=>!ok(x)); return k<0?0:k; }
  return Math.floor(rnd()*o.length); };
const origRun=CLS.runExam; let ASKED={};
CLS.runExam=async function(gm,it){ curKind=it.exam; const d=CLS.drawExam(gm.G,it.c.id,it.term,it.exam); curQs=d.ok?d.qs:null; const s0=H.said.length;
  const r=await origRun.call(this,gm,it); curQs=null;
  ASKED[it.term+':'+it.c.id+':'+it.exam]=H.said.slice(s0).map(x=>QRE.test(x.t)?x.t.replace(QRE,''):null).filter(x=>x!=null); return r; };

const poolN=(G,cid,T)=>{ CLS.termCourses(G,T); const p=CLS.examPool(cid,T,'final'); return p.cls.length+p.bank.length+p.ai.length; };
const qOf=id=>EXAM_BANK.questions.find(q=>q.id===id)||(typeof QBANK!=='undefined'&&QBANK.find(q=>q.id===id))||null;

async function runTerm(G,T){ const ex=CLS.examList(G,T).slice().sort((a,b)=>a.day-b.day||a.t0-b.t0);
  for(const e of ex){ G.day=e.day; G.hour=e.t0; await CLS.runExam(GM,{c:e.c,exam:'final',term:T}); }
  G.day=(ex.length?ex[ex.length-1].day:G.day)+1; G.hour=9; if(T==='Y4S2') G.day=PG.DK('2029-06-18');
  await CLS.showGrades(GM,T,{inScene:true}); return ex; }

/* A：真實流程。回傳每一科的比對 */
async function realFlow(seed,route,{stopBeforeMakeup,terms}={}){
  rnd=rngOf(seed*7919+13); ASKED={};
  const fl={examSeed:1000+seed}; if(route) fl.EXCHANGE_ROUTE=route;
  const G=H.fresh('2028-02-20',8,'dorm',fl); G.notes=[]; G.memo=[];
  for(const T of (terms||['Y3S2','Y4S1','Y4S2'])) await runTerm(G,T);
  let planned=false;
  if(typeof FD!=='undefined'){ await FD.check(GM,{inScene:true}); planned=!!(FD.mkPending&&FD.mkPending(G)); }
  if(stopBeforeMakeup) return {G,planned};
  if(planned){ G.day=FD.mkDay(); G.hour=9.5; await FD.makeup(GM); }
  return {G,planned};
}
function compare(G,T,direct){ const R=CLS.rec(G), out=[];
  for(const c of CLS.termCourses(G,T).filter(CLS.isExamCourse)){
    const fin=(R.exam||{})[T+':'+c.id+':final']||{}; let mk=(R.exam||{})[T+':'+c.id+':makeup'];
    if(direct&&!mk){ const d=CLS.drawExam(G,c.id,T,'makeup'); mk=d.ok?{qs:d.qs.map(q=>q.id),direct:true}:{status:'insufficient',n:d.n}; }
    const fq=fin.qs||[], mq=(mk&&mk.qs)||[]; const ov=mq.filter(id=>fq.includes(id));
    out.push({id:c.id,name:c.name,rt:c.rt?c.rt.base:null,n:poolN(G,c.id,T),fin:fq,mk:mq,ov,mkStatus:mk?(mk.status||(mk.direct?'direct':'drawn')):'none',finStatus:fin.status||'none',uniq:new Set(mq).size===mq.length}); }
  return out; }

(async()=>{
  console.log('受測：'+SRC+'　種子數 '+NSEED);
  /* ---------- A ---------- */
  console.log('\n== A 真實流程（期末全錯 → 6/18 FD.check → 6/26 FD.makeup）==');
  const table={}; let totalMk=0, realOverlapCases=[];
  for(const route of [null,'TW']) for(let s=1;s<=NSEED;s++){
    const {G,planned}=await realFlow(s,route); const rows=compare(G,'Y4S2',false); const tag='['+(route||'一般')+' seed '+s+']';
    check(tag+' A0 6/18 有排補考（大四下考五題的課全被當＝'+rows.length+' 科）',planned&&G.flags.FD_MAKEUP&&G.flags.FD_MAKEUP.courses.length===rows.length,J(G.flags.FD_MAKEUP&&G.flags.FD_MAKEUP.courses));
    const bad=[], short=[], said=[];
    for(const r of rows){ const k=r.id+(r.rt?'(重修:'+r.rt+')':''); const t=table[k]=table[k]||{name:r.name,n:r.n,runs:0,ovMax:0,ovMin:9,ovSum:0}; t.runs++; t.ovMax=Math.max(t.ovMax,r.ov.length); t.ovMin=Math.min(t.ovMin,r.ov.length); t.ovSum+=r.ov.length; totalMk++;
      if(r.mk.length!==5||!r.uniq||r.fin.length!==5) short.push(k+' 期末'+r.fin.length+'題／補考'+r.mk.length+'題'+(r.uniq?'':'（補考內重複）'));
      const exp=Math.max(0,10-r.n); if(r.ov.length!==exp) bad.push(k+'：題庫 '+r.n+'、重複 '+r.ov.length+'（最少可以是 '+exp+'）'+J(r.ov));
      if(r.ov.length) realOverlapCases.push(tag+' '+k+' 題庫 '+r.n+' 重複 '+r.ov.join(','));
      const asked=ASKED['Y4S2:'+r.id+':makeup']||[]; const expT=r.mk.map(id=>(qOf(id)||{}).q); if(J(asked)!==J(expT)) said.push(k); }
    check(tag+' A1 每科期末 5 題、補考 5 題、補考內不重複',!short.length,J(short));
    check(tag+' A2 補考和期末的重複題數＝最少可能值 max(0,10−題庫)（題庫≥10 ⇒ 0 重複）',!bad.length,J(bad));
    check(tag+' A3 補考實際唸出來的題幹＝R.exam 記的那五題（依序）',!said.length,J(said));
    const strict=rows.filter(r=>r.ov.length); check(tag+' A4 【嚴格】補考五題都不和期末重複（任務第 1 點字面要求）',!strict.length,J(strict.map(r=>r.id+'：題庫 '+r.n+'，重複 '+r.ov.length+' 題 '+r.ov.join(','))));
  }
  console.log('\n—— A 每科表（一般＋TW，共 '+(NSEED*2)+' 份存檔）——');
  console.log('課 id｜課名｜題庫（期末範圍）｜跑幾次｜補考與期末重複題數 最少／平均／最多');
  for(const [k,t] of Object.entries(table)) console.log('  '+k+'｜'+t.name+'｜'+t.n+'｜'+t.runs+'｜'+t.ovMin+'／'+(t.ovSum/t.runs).toFixed(2)+'／'+t.ovMax);

  /* ---------- B 國外交換 ---------- */
  console.log('\n== B 國外交換路線（遊戲裡不排補考；補考題直接呼叫 drawExam）==');
  const tableB={};
  for(const route of ['JP','US']) for(let s=1;s<=Math.max(3,NSEED>>1);s++){
    const {G,planned}=await realFlow(100+s,route); const rows=compare(G,'Y4S2',true); const tag='['+route+' seed '+s+']';
    check(tag+' B0 國外交換：FD.check 不排補考（faildelay3d.js exch；照舊延畢）',!planned&&!G.flags.FD_MAKEUP,J({FD_MAKEUP:G.flags.FD_MAKEUP,FAIL_DELAY_COURSES:G.flags.FAIL_DELAY_COURSES}));
    const bad=[]; for(const r of rows){ const k=route+':'+r.id+(r.rt?'(重修:'+r.rt+')':''); const t=tableB[k]=tableB[k]||{name:r.name,n:r.n,runs:0,ovMax:0}; t.runs++; t.ovMax=Math.max(t.ovMax,r.ov.length);
      if(r.mk.length!==5||!r.uniq||r.ov.length!==Math.max(0,10-r.n)) bad.push(k+' 題庫'+r.n+' 補考'+r.mk.length+'題 重複'+r.ov.length); }
    check(tag+' B1 （直接呼叫）每科補考 5 題、重複題數＝max(0,10−題庫)',!bad.length,J(bad)); }
  console.log('—— B 每科表 ——'); for(const [k,t] of Object.entries(tableB)) console.log('  '+k+'｜'+t.name+'｜題庫 '+t.n+'｜'+t.runs+' 次｜最多重複 '+t.ovMax);

  /* ---------- C 題庫縮小（構造情境）---------- */
  console.log('\n== C 構造情境：模擬裡把海商法（maritime）期末範圍縮成 k 題（不改 src）==');
  const allQ=EXAM_BANK.questions.slice(); const mar=allQ.filter(q=>q.course==='maritime'&&q.term==='Y4S2');
  for(const k of [4,5,6,7,8,9,10,11]){
    const keep=new Set(mar.slice(0,k)); EXAM_BANK.questions.length=0; for(const q of allQ) if(q.course!=='maritime'||keep.has(q)) EXAM_BANK.questions.push(q);
    let info={}; try{
      const {G,planned}=await realFlow(300+k,null,{terms:['Y4S2']});   /* 只考大四下：不讓重修的課混進補考 */ const R=CLS.rec(G); const fin=R.exam['Y4S2:maritime:final']||{}, mk=R.exam['Y4S2:maritime:makeup']||null;
      const fq=fin.qs||[], mq=(mk&&mk.qs)||[]; const ov=mq.filter(id=>fq.includes(id)); const nn=poolN(G,'maritime','Y4S2');
      const g=(R.grades.Y4S2||{}).maritime;
      info={題庫:nn,期末狀態:fin.status,期末題數:fq.length,排補考:planned,補考狀態:mk&&mk.status,補考題數:mq.length,補考內不重複:new Set(mq).size===mq.length,重複:ov.length,成績單:g,FAIL_DELAY:!!G.flags.FAIL_DELAY};
      console.log('  k='+k+' '+J(info));
      if(nn<5) check('C k='+k+' 題庫不足 5：期末不開考（insufficient）、不算被當、不排補考、沒有例外',fin.status==='insufficient'&&!planned&&!mk&&!G.flags.FAIL_DELAY,J(info));
      else check('C k='+k+' 有補考、補考 5 題不重複、重複題數＝max(0,10−k)＝'+Math.max(0,10-nn)+'、期末沒考過的題全部用上',planned&&mq.length===5&&info.補考內不重複&&ov.length===Math.max(0,10-nn)&&mar.slice(0,k).every(q=>fq.includes(q.id)||mq.includes(q.id)||nn>10),J(info));
    }catch(e){ check('C k='+k+' 沒有例外',false,String(e&&e.stack||e).slice(0,300)); }
  }
  EXAM_BANK.questions.length=0; for(const q of allQ) EXAM_BANK.questions.push(q);
  /* C2 構造情境：期末有開考（13 題）、被當、排了補考，之後題庫變成 4 題（例：改版刪題）才進補考 */
  { const pre=await realFlow(400,null,{stopBeforeMakeup:true,terms:['Y4S2']}); const keep=new Set(mar.slice(0,4)); EXAM_BANK.questions.length=0; for(const q of allQ) if(q.course!=='maritime'||keep.has(q)) EXAM_BANK.questions.push(q);
    let info; try{ const G=pre.G; G.day=FD.mkDay(); G.hour=9.5; H.said=[]; await FD.makeup(GM); const R=CLS.rec(G); info={補考紀錄:R.exam['Y4S2:maritime:makeup'],補考結果:G.flags.FD_MAKEUP.status,res:G.flags.FD_MAKEUP.res,成績單:(R.grades.Y4S2||{}).maritime,FAIL_DELAY:!!G.flags.FAIL_DELAY,台詞:H.lines().slice(0,4)}; }catch(e){ info={例外:String(e)}; }
    console.log('  C2（資訊，不計 PASS/FAIL）期末後題庫縮成 4 題才補考：'+J(info));
    EXAM_BANK.questions.length=0; for(const q of allQ) EXAM_BANK.questions.push(q); }

  /* ---------- D 重抽固定 ---------- */
  console.log('\n== D 同一份存檔重抽 ==');
  for(let s=1;s<=Math.max(3,NSEED>>1);s++){
    const tag='[seed '+s+']';
    /* ② 補考前的存檔 */
    const pre=await realFlow(s,null,{stopBeforeMakeup:true}); const snap=JSON.stringify(pre.G);
    const runMk=async(json)=>{ const G=JSON.parse(json); H.G=G; SOCIAL.bind(G); G.day=FD.mkDay(); G.hour=9.5; ASKED={}; await FD.makeup(GM); const R=CLS.rec(G); const o={}; for(const id of G.flags.FD_MAKEUP.courses) o[id]=(R.exam['Y4S2:'+id+':makeup']||{}).qs; return {G,o}; };
    const a=await runMk(snap), b=await runMk(snap);
    check(tag+' D2 補考前的存檔讀兩次、各進一次補考：每科五題相同（同順序）',J(a.o)===J(b.o)&&Object.values(a.o).every(x=>x&&x.length===5),J(Object.keys(a.o).filter(k=>J(a.o[k])!==J(b.o[k]))));
    /* ① 補考後的存檔 */
    const after=JSON.stringify(a.G); const L=JSON.parse(after); H.G=L; SOCIAL.bind(L); const diff=[];
    for(const id of L.flags.FD_MAKEUP.courses){ const d=CLS.drawExam(L,id,'Y4S2','makeup'); if(!d.ok||J(d.qs.map(q=>q.id))!==J(a.o[id])) diff.push(id); }
    check(tag+' D1 補考考完的存檔讀檔後再 drawExam：題目和當時考的相同',!diff.length,J(diff));
    /* ③ 換 examSeed 對照 */
    const C=JSON.parse(snap); C.flags.examSeed=C.flags.examSeed+777777; H.G=C; SOCIAL.bind(C); const same=[];
    for(const id of C.flags.FD_MAKEUP.courses){ if(poolN(C,id,'Y4S2')<11) continue; const d=CLS.drawExam(C,id,'Y4S2','makeup'); if(J(d.qs.map(q=>q.id))===J(a.o[id])) same.push(id); }
    console.log('   '+tag+' D3 對照：換 examSeed 以後補考仍完全相同的科（題庫 ≥11 的才看）：'+J(same));
  }

  /* ---------- E 突變 ---------- */
  console.log('\n== E 突變測試（每一種都應該被抓到；這一段的 FAIL 不算進總數）==');
  const quiet=async fn=>{ const f0=fails, lg=console.log, lw=console.warn, le=console.error, lines=[]; console.log=(...a)=>lines.push(a.join(' ')); console.warn=console.error=()=>{}; try{ await fn(); }catch(e){ lines.push('FAIL 例外 '+e); } finally{ console.log=lg; console.warn=lw; console.error=le; } const c=lines.filter(l=>l.startsWith('FAIL ')); fails=f0; return c; };
  const D0=CLS.drawExam;
  const MUT=[
    ['M1 補考不排除期末考過的題（照自己的種子亂抽）',()=>{ CLS.drawExam=function(G,cid,T,kind){ if(kind!=='makeup') return D0.apply(this,arguments); const R=CLS.rec(G), k=T+':'+cid+':final', f=R.exam[k]; const sv=f&&f.qs; if(f) delete f.qs; try{ return D0.apply(this,arguments); } finally{ if(f&&sv) f.qs=sv; } }; },
      async()=>{ for(let s=1;s<=4;s++){ const {G}=await realFlow(s,null); const rows=compare(G,'Y4S2',false); check('m A2',rows.every(r=>r.ov.length===Math.max(0,10-r.n))); } }],
    ['M2 補考只抽期末沒考過的題、不夠也不補（題庫 <10 會不到 5 題）',()=>{ CLS.drawExam=function(G,cid,T,kind){ const r=D0.apply(this,arguments); if(kind!=='makeup'||!r.ok) return r; const f=(CLS.rec(G).exam[T+':'+cid+':final']||{}).qs||[]; const qs=r.qs.filter(q=>!f.includes(q.id)); CLS.rec(G).exam[r.key].qs=qs.map(q=>q.id); return Object.assign({},r,{qs}); }; },
      async()=>{ const {G}=await realFlow(1,null); const rows=compare(G,'Y4S2',false); check('m A1',rows.every(r=>r.mk.length===5)); }],
    ['M3 補考每次重抽（不看存檔裡的紀錄、不用存檔種子）',()=>{ CLS.drawExam=function(G,cid,T,kind){ if(kind!=='makeup') return D0.apply(this,arguments); const R=CLS.rec(G); delete R.exam[T+':'+cid+':makeup']; const s0=G.flags.examSeed; G.flags.examSeed=Math.floor(Math.random()*1e9); try{ return D0.apply(this,arguments); } finally{ G.flags.examSeed=s0; } }; },
      async()=>{ const pre=await realFlow(2,null,{stopBeforeMakeup:true}); const snap=JSON.stringify(pre.G); const o=[]; for(let i=0;i<2;i++){ const G=JSON.parse(snap); H.G=G; SOCIAL.bind(G); G.day=FD.mkDay(); G.hour=9.5; await FD.makeup(GM); o.push(J(G.flags.FD_MAKEUP.courses.map(id=>CLS.rec(G).exam['Y4S2:'+id+':makeup'].qs))); } check('m D2',o[0]===o[1]); }],
    ['M4 補考內有重複題（最後一題換成第一題）',()=>{ CLS.drawExam=function(G,cid,T,kind){ const r=D0.apply(this,arguments); if(kind!=='makeup'||!r.ok) return r; const qs=r.qs.slice(); qs[4]=qs[0]; CLS.rec(G).exam[r.key].qs=qs.map(q=>q.id); return Object.assign({},r,{qs}); }; },
      async()=>{ const {G}=await realFlow(3,null); const rows=compare(G,'Y4S2',false); check('m A1',rows.every(r=>r.uniq)); }]];
  for(const [name,patch,run] of MUT){ patch(); let caught; try{ caught=await quiet(run); } finally{ CLS.drawExam=D0; }
    const ok=caught.length>0; console.log((ok?'PASS ':'FAIL ')+'突變 '+name+' → '+(ok?'被抓到（'+caught.length+' 項 FAIL）':'沒被抓到（檢查是空的）')); if(!ok) fails++; }

  console.log('\n重複題實例（A，前 8 筆）：'); realOverlapCases.slice(0,8).forEach(x=>console.log('  '+x));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

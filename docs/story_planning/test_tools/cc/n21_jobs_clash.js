// CC #21（BB 10:52，P3 後備）：打工排班 × 考試日（期末考、大四下補考 6/26、國考）——打工的請假／衝突會不會擋住考試、考試會不會被跳過、打工有沒有被算成去上班
// 用法：WT=<受測資料夾> nice -n 19 node n21_jobs_clash.js        （WT 要有 tests/pg_harness.js、src/；只用 Node，不開瀏覽器）
// 用 pg_harness_jobs.js（同資料夾）：原 harness＋補載 src/data/wz_jobs.js、src/jobs3d.js 等（原 harness 沒有 JOBS＝打工判定全部走 typeof JOBS==='undefined'）。
// 【前置／捷徑】：除了 B 段用 JOBS.apply（選班表的真實流程）以外，打工紀錄是直接寫 G.jobs（標【前置】）；時間用 PG.setT 直接設。考試結果用 CLS.status、補考用 FD.makeup 的存檔欄位判。
// 有 bug 時 FAIL：A1、B1～B5、B7、B8（事務所 classOk 連考試都不請假）在 b1b249873 FAIL；把 jobs3d.js S.excused 的 classOk 改成只略過一般課（考試照樣請假）的副本上全 PASS（B3～B5 只在有排出門提醒時才跑）。
'use strict';
const WT=process.env.WT||process.cwd();
const path=require('path');
const H=require(path.join(__dirname,'pg_harness_jobs.js'))(WT);
const {check,GM}=H, J=JSON.stringify;
GM.caption=()=>{}; H.toasts=[]; GM.toast=t=>{ H.toasts.push(String(t)); };
const D=k=>PG.DK(k), key=d=>{ const x=CALENDAR.dateOf(d); return x.key+'('+'日一二三四五六日'[x.wd]+')'; };
const hm=h=>{ const H0=Math.floor(h+1e-6), m=Math.round((h-H0)*60); return String(H0).padStart(2,'0')+':'+String(m).padStart(2,'0'); };
/* 【前置】直接寫一份打工紀錄（已經上過 3 班＝有老闆的聯絡方式）*/
const mkJob=(G,k,days,since,brkGo)=>{ const Jr=JOBS.rec(G); Jr[k]={since,from:since*24,day:days.slice(),shifts:3,skill:3,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:since-1,wk:{},brk:{},ot:{}}; return Jr[k]; };
const brkGo=(G,d)=>{ const b=JOBS.breakAt(G,d); if(!b) return null; for(const k of JOBS.KEYS){ const j=JOBS.job(G,k); if(j) j.brk[b.key]='go'; } return b.key; };
const exams=(G,d)=>CLS.dayItems(G,d).filter(it=>it.exam);
const ov=(a0,a1,b0,b1)=>a0<b1-1e-6&&b0<a1-1e-6;
(async()=>{
  console.log('受測：'+WT);
  /* ===== 0. harness ===== */
  check('0a. 補載的檔沒有例外',!H.loadErr.length,J(H.loadErr));
  check('0b. JOBS 載入（物件、KEYS 8 家、EXCUSE／SHIFT_EV 有登記）',typeof JOBS==='object'&&JOBS.KEYS.length===8&&JOBS.EXCUSE.length>=1&&JOBS.SHIFT_EV.length>=1,J({t:typeof JOBS,keys:JOBS.KEYS,exc:JOBS.EXCUSE.length,sev:JOBS.SHIFT_EV.length}));
  check('0c. JOBS.EV2D：補習班、事務所的 2D 事件四個都在 STORY_EVENTS',['ev_job2d_cram','ev_job2d_cram_iv','ev_job2d_office','ev_job2d_office_iv'].every(id=>STORY_EVENTS.some(e=>e.id===id)));
  check('0d. JOBS 有接上 OUT.prompt／STORY.TICKS',!!OUT._jobs&&STORY.TICKS.includes(JOBS.tick));

  /* ===== A. 全掃：每學期期末考 × 每一家（班表排滿那一家所有的天）：班表那一天有班、時段撞到考試＝一定要自動請假 ===== */
  const clashes=[], seen=[];
  const sweep=(route,terms)=>{ for(const t of terms){ const r=CALENDAR.termDays(t); if(!r) continue; const G=H.fresh(CALENDAR.dateOf(r.from).key,8,'dorm',route?{EXCHANGE_ROUTE:route}:{});
      for(const k of JOBS.KEYS) mkJob(G,k,WZ_JOBS_DATA.shops[k].days,r.from);   /* 【前置】八家全部排滿（不管一週兩班的上限：只看撞時段的判定）*/
      for(let d=r.from;d<=r.to;d++){ for(const it of exams(G,d)){ seen.push(t+' '+key(d)+' '+it.slot.block+' '+it.c.id);
        for(const k of JOBS.KEYS){ const fr=WZ_JOBS_DATA.shops[k].from; if(fr&&CLS.LAW_TERMS.indexOf(t)<CLS.LAW_TERMS.indexOf(fr)) continue;   /* 補習班大二起、事務所大三起才能應徵（AA_433）：之前的學期不算 */
          if(!JOBS.scheduled(G,k,d)) continue; const h=JOBS.hrs(k,d); if(!ov(h[0],h[1],it.t0,it.t1)) continue;
          clashes.push({route:route||'TW',term:t,day:key(d),k,job:hm(h[0])+'～'+hm(h[1]),exam:it.c.id+' '+hm(it.t0)+'～'+hm(it.t1),excused:JOBS.excused(G,k,d)}); } } } } };
  sweep(null,['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2']); sweep('US',['Y4S2','Y5S1']); sweep('JP',['Y3S1','Y4S1','Y4S2','Y5S1']);
  console.log('A0 期末考 '+seen.length+' 場；班表撞到考試時段 '+clashes.length+' 次：'); clashes.forEach(c=>console.log('   '+J(c)));
  const bad=clashes.filter(c=>!c.excused);
  check('A1. 撞到期末考時段的班全部自動請假（JOBS.excused 有原因）',!bad.length,'沒有請假 '+bad.length+' 次：'+J(bad.map(c=>c.route+' '+c.day+' '+c.k+' × '+c.exam)));
  check('A2. 撞到的只有事務所（其他七家的時段本來就碰不到考試：考試在 09:10～17:20，晚班 18:00 起、週末沒有考試）',clashes.every(c=>c.k==='office'),J([...new Set(clashes.map(c=>c.k))]));

  /* ===== B. 事務所（大三上 2027-12-23 週四 13:20 證交法期末考）：真實流程 ===== */
  const officeG=async(exKey)=>{ const G=H.fresh('2027-09-13',10,'dorm',{}); H.picks=['週二和週四']; const ok=await JOBS.apply(GM,'office');   /* 選班表（真實流程；【捷徑】跳過公布欄、面試）*/
    const d=D(exKey); PG.setT(G,H.E,d,12); return {G,d,ok,j:JOBS.job(G,'office'),ex:exams(G,d)}; };
  { const {G,d,ok,j,ex}=await officeG('2027-12-23');
    console.log('B0 前置：選班表 '+ok+' '+J(j.day)+'；'+key(d)+' 的考試：'+J(ex.map(i=>i.c.id+' '+hm(i.t0)+'～'+hm(i.t1)))+'；clashLine '+J(JOBS.clashLine(G,'office',j.day)));
    const why=JOBS.excused(G,'office',d);
    check('B1. 考試那一格撞到事務所的班：JOBS.excused＝"exam"（AA_420 第 9 條：那天自動請假）',why==='exam',J({excused:why,due:JOBS.due(G,'office',d),classOk:WZ_JOBS_DATA.shops.office.classOk}));
    JOBS.plan(G); const q=OUT.get(G,'job_office_'+d);
    check('B2. 考試那天不排「事務所的班」出門提醒',!q,J(q&&{id:q.id,h:q.h,title:q.title}));
    if(q){ PG.setT(G,H.E,d,13); const due=OUT.due(G); H.opts=[]; H.picks=[]; H.said=[];
      console.log('B3 前置：13:00 OUT.due＝'+(due&&due.id)+'（考試 13:20；CLS 帶進考場是 13:10＝開考前 10 分鐘，出門提醒先跳出來）');
      const r=await OUT.prompt(GM,q); const o0=H.opts[0]||[];
      console.log('B3 出門提醒：'+J(o0)+'；選第一個 → '+r+'；回來 '+hm(G.hour)+'；事務所的台詞 '+H.said.length+' 句');
      check('B3. 出門提醒有提到會錯過考試（或沒有提醒）',o0.some(t=>/考|會錯過/.test(t)),J(o0));
      check('B4. 選「出發」以後，期末考沒有被跳過（CLS.status 不是 missed）',ex.every(i=>CLS.status(G,i)!=='missed'),J(ex.map(i=>[i.c.id,CLS.status(G,i)])));
      check('B5. 考試那天沒有被算成去上班（worked 不含那一天、沒有發薪）',!j.worked.includes(d),J({worked:j.worked.map(key),shifts:j.shifts,toast:H.toasts.filter(t=>/事務所/.test(t)).slice(-1)})); } }
  /* B6～B7：玩家選「這週請假」去考試——第 9 條的自動請假不算沒去；現在是玩家自己請假＝算沒去（下一班老闆說「上週沒去」）*/
  { const {G,d,j,ex}=await officeG('2027-12-23'); Object.assign(j,{chk:d-1,missPend:false,missedRun:0,wk:{}});   /* 【前置】考試那天以前的班都算過、沒有欠（只看考試那一天）*/ JOBS.plan(G); const q=OUT.get(G,'job_office_'+d);
    if(q){ PG.setT(G,H.E,d,13); H.picks=['這週請假']; const r=await OUT.prompt(GM,q); console.log('B6 前置：出門提醒選「這週請假」→ '+r); }
    const R=CLS.rec(G); for(const i of ex) R.done[i.key]=true;   /* 【前置】考完了 */
    PG.setT(G,H.E,d+1,9); JOBS.track(G);
    check('B6. 考試這一格的狀態：考完（done）',ex.every(i=>CLS.status(G,i)==='done'));
    check('B7. 去考試的那一班不算「沒去」（missPend false；第 6 條「上週沒去」那一句不該出現）',!j.missPend,J({missPend:j.missPend,missedRun:j.missedRun})); }
  /* B8：大四上 2028-12-19（二）、12-21（四）下午的期末考 */
  for(const k0 of ['2028-12-19','2028-12-21']){ const G=H.fresh('2028-09-04',10,'dorm',{}); H.picks=['週二和週四']; await JOBS.apply(GM,'office'); const d=D(k0); PG.setT(G,H.E,d,12);
    const ex=exams(G,d), why=JOBS.excused(G,'office',d); JOBS.plan(G); const q=OUT.get(G,'job_office_'+d);
    check('B8. 大四上 '+key(d)+' '+ex.map(i=>i.c.id+' '+hm(i.t0)).join('、')+'：事務所自動請假、不排出門提醒',why==='exam'&&!q,J({excused:why,planned:!!q})); }
  /* C. 對照：事務所撞「一般的課」照樣可以排（AA_433 第 3 節「撞到必修課的班照樣可以選（玩家自己決定翹課或不選）」＝設計）；影印店撞考試日（晚上）照常排 */
  { const G=H.fresh('2027-09-13',10,'dorm',{}); H.picks=['週二和週四']; await JOBS.apply(GM,'office'); let d=null; for(let x=G.day+1;x<G.day+60;x++){ const it=CLS.dayItems(G,x).find(i=>!i.exam&&ov(13.5,17.5,i.t0,i.t1)); if(it&&JOBS.scheduled(G,'office',x)){ d=x; break; } }
    check('C1. 對照（設計）：事務所撞一般的課＝不自動請假（classOk）',d!=null&&JOBS.excused(G,'office',d)==null,d==null?'找不到撞課的日子':key(d)); }
  { const G=H.fresh('2027-09-13',10,'dorm',{}); mkJob(G,'copy',[2],G.day); const d=D('2027-12-21'); PG.setT(G,H.E,d,17);   /* 【前置】影印週二；12/21 上午刑訴期末考 */
    JOBS.plan(G); const q=OUT.get(G,'job_copy_'+d);
    check('C2. 對照：影印店週二 18:00（同一天上午有刑訴期末考）照常排班、不請假',!!q&&JOBS.excused(G,'copy',d)==null,J({planned:!!q,excused:JOBS.excused(G,'copy',d),exams:exams(G,d).map(i=>i.c.id+' '+hm(i.t0))})); }

  /* ===== D. 大四下補考 6/26（臺灣路線；大四上強制執行法被當 → 大四下重修 → 又沒過 → 6/26 10:00 補考）===== */
  { const G=H.fresh('2029-01-10',10,'dorm',{}); const R=CLS.rec(G); R.exam=R.exam||{};
    for(const c of CLS.termCourses(G,'Y4S1')){ if(!CLS.isExamCourse(c)) continue; const x=CLS.drawExam(G,c.id,'Y4S1','final'); const f=c.id==='enforcement'; R.exam['Y4S1:'+c.id+':final']={qs:x.qs.map(q=>q.id),ans:[],status:'done',correct:f?0:3,score:f?0:80}; }
    await CLS.showGrades(GM,'Y4S1'); const rt=(R.retake||[]).find(r=>r.id==='enforcement'&&r.term==='Y4S2');
    const r2=CALENDAR.termDays('Y4S2'); PG.setT(G,H.E,r2.from,8);
    mkJob(G,'office',[2,4],r2.from); mkJob(G,'copy',[2],r2.from); mkJob(G,'cvs',[2,5],r2.from); mkJob(G,'cram',[1,3],r2.from); mkJob(G,'brunch',[6,7],r2.from); mkJob(G,'tea',[6,7],r2.from);   /* 【前置】大四下還在做的班（上限不管）*/
    const exY4S2=CLS.examList(G,'Y4S2');
    console.log('D0 前置：重修 '+J(rt)+'；大四下期末考 '+J(exY4S2.map(x=>key(x.day)+' '+x.block+' '+x.c.id)));
    /* 大四下期末考（含重修的那一場）有沒有撞班 */
    const hit=[]; for(const x of exY4S2) for(const k of JOBS.KEYS){ if(!JOBS.scheduled(G,k,x.day)) continue; const h=JOBS.hrs(k,x.day); if(ov(h[0],h[1],x.t0,x.t1)&&!JOBS.excused(G,k,x.day)) hit.push(key(x.day)+' '+k+' × '+x.c.id); }
    check('D1. 大四下期末考（含強制執行法重修）沒有撞到沒請假的班',!hit.length,J(hit));
    for(const c of CLS.termCourses(G,'Y4S2')){ if(!CLS.isExamCourse(c)) continue; const x=CLS.drawExam(G,c.id,'Y4S2','final'); const f=c.id==='enforcement'; R.exam['Y4S2:'+c.id+':final']={qs:x.qs.map(q=>q.id),ans:[],status:'done',correct:f?0:3,score:f?0:80}; }
    Object.assign(G.flags,{BAR_REG:true,Y4_PATH:'bar'}); PG.setT(G,H.E,D('2029-06-18'),9); await CLS.showGrades(GM,'Y4S2');
    const M=G.flags.FD_MAKEUP; console.log('D2 前置：6/18 成績單以後 FD_MAKEUP＝'+J(M)+'；FAIL_DELAY '+G.flags.FAIL_DELAY);
    check('D2. 前置成立：強制執行法（重修）沒過 → 6/26 補考 pending',!!M&&M.status==='pending'&&J(M.courses)===J(['enforcement']),J(M));
    const mk=D('2029-06-26'); PG.setT(G,H.E,mk,8); try{ JOBS.phone(G); }catch(e){ console.log('JOBS.phone 例外',e.message); } JOBS.plan(G);
    const sch=JOBS.KEYS.filter(k=>JOBS.scheduled(G,k,mk)), jobQ=OUT.rec(G).filter(q=>q.day===mk&&/^job_/.test(q.id||''));
    console.log('D3 6/26：endDay＝'+key(JOBS.endDay(G))+'；各家 gone＝'+J(JOBS.KEYS.filter(k=>JOBS.job(G,k)).map(k=>k+':'+JOBS.job(G,k).gone))+'；JOBS.any＝'+JOBS.any(G));
    check('D3. 6/26（補考 10:00～11:00）沒有任何一家排班（大四下最後一班 6/03 以後就結束）',!sch.length&&!jobQ.length,J({sch,jobQ:jobQ.map(q=>q.id)}));
    check('D4. 補考那天不會跳打工的出門提醒、JOBS.any 是 null',JOBS.any(G)==null&&!(OUT.due(G)&&/^job_/.test(OUT.due(G).id||'')));
    /* 對照：就算還沒跑過手機規則（gone 還沒標 grad），照 endDay 也不排 */
    const G2=H.fresh('2029-06-26',8,'dorm',{}); mkJob(G2,'office',[2,4],r2.from); mkJob(G2,'copy',[2],r2.from); brkGo(G2,mk);
    check('D5. 對照：6/26 沒標 gone、寒暑假選了「來。」也不排（endDay）',!JOBS.KEYS.some(k=>JOBS.scheduled(G2,k,mk)),J(JOBS.KEYS.filter(k=>JOBS.scheduled(G2,k,mk)))); }

  /* ===== E. 國考（PG.Y 的一試 exam、二試 e2a／e2b）：三種路線 ===== */
  const routes=[['TW 應屆（2029 考）',{BAR_REG:true,Y4_PATH:'bar',GRADUATED:D('2029-06-09')}],['TW 被當延畢（2030 考）',{FAIL_DELAY:true,FAIL_DELAY_V:2,BAR_REG_2030:true,Y4_PATH:'bar'}],['US 交換延畢（2030 考）',{EXCHANGE_ROUTE:'US',BAR_REG_2030:true,Y4_PATH:'bar'}],['JP 交換延畢（2030 考）',{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true,Y4_PATH:'bar'}]];
  for(const [lab,fl] of routes){ const bad=[], info=[];
    for(const y of ['2029','2030']) for(const f of ['exam','e2a','e2b']){ const dk=PG.Y[y]&&PG.Y[y][f]; if(!dk) continue; const d=D(dk);
      const G=H.fresh(dk,6,'dorm',Object.assign({},fl)); const from=CALENDAR.termDays('Y4S2').from;
      for(const k of JOBS.KEYS) mkJob(G,k,WZ_JOBS_DATA.shops[k].days,from); brkGo(G,d);   /* 【前置】八家都在做、寒暑假都選「來。」*/
      const sits=PG.sits(G,+y), sch=JOBS.KEYS.filter(k=>JOBS.scheduled(G,k,d)&&!JOBS.excused(G,k,d));
      info.push(dk+' '+f+' sits='+sits+' 有班='+J(sch));
      if(sits&&sch.length) bad.push(dk+' '+f+'：'+sch.join('、')); }
    console.log('E0 '+lab+'：'+info.join('；'));
    check('E1. '+lab+'：要考的國考日（一試、二試）沒有排到任何一家的班',!bad.length,J(bad)); }

  H.done();
})().catch(e=>{ console.log('例外',e&&e.stack||e); process.exit(2); });

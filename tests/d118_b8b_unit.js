// D118-B8 司法官二試、三試、重考：第二支（r9～r11；拆開是為了平行跑不超過 300 秒；舊存檔、CC_25 在 d118_b8d_unit.js）（docs/handoff/D118_PLAN.md 第 4 節 B8、第 12 節 A1／A2／A5／A6；台詞 AA_582 企劃線 14ce865f0；題池 AA_583 b76dd619e）——不需要瀏覽器。
//   規則（AA_582 補充二）：畢業那一年（2029；延畢 2030）的司法官二試一定沒上（A1「應屆」），之後每一年看實力；JUDGE_YEAR＝錄取那一年（考試隔年 1 月），受訓兩年：2031 錄取＝2033 春天選、2032＝2034-05-01 選、2033 以後＝尾聲受訓中（J_trainee）；二試＝10 題爭點題作答＋四年法律科期末平均（PG.basis）輔助：答對 ≥7，或 ≥6 而且平均答對 ≥4；
//   有律師證照的第一次落榜＝當晚二選一（再考／就當律師）；重考那一年自動報名、只考一試＋司法官二試（BAR_YEAR 不動）；錄取＝12 月放榜→1 月三試→1 月下旬錄取（JUDGE_YEAR）→結業前選法官／檢察官。
//   (p) 題池：EXAM_BANK 三種已核對＋QBANK、mc、四類科目、題幹有甲乙丙且 ≥45 字；每年 民3 刑3 公2 訴2；不和當年一試重複；重考年換題。
//   (r1)～(r6) 六條路線從 2029-08-04 一路「跳到下一件事」到尾聲：沒有卡死、BAR_YEAR 一定有值、落點對；全對全錯結果不同；讀書天數不影響；
//   (o) 舊存檔：BAR_STAGE_2029 both、二試放榜演過＝隔年 5/9 以前補演二選一、之後＝路線 d；不丟例外。
//   修改前 FAIL（沒有 PG.drawJudge、JUDGE_*、J 結局）。用法：node tests/d118_b8b_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const warns=[]; console.warn=(...a)=>{ warns.push(a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join(' / '):String(x)).join(' ')); };
const rej=[]; process.on('unhandledRejection',e=>rej.push(String(e&&e.stack||e)));
const GM=H.GM; GM.spawnCharacter=()=>null;
const J=POSTGRAD_LINES.JUDGE||{}, EL=POSTGRAD_LINES.EPI.last;
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; if(G.flags.MOVED_OUT==null) G.flags.MOVED_OUT=PG.DK('2029-06-28'); };
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
const FRIENDS=['zhe','yu','classmate_bohan','heroine_01','heroine_03','classmate_peishan'];
const FAMILY=['A_bar','C_zq','B_grad','L_firm'];
const AUTO=[];   /* 說到 epiAuto 的每一次：律師家族＋真的考過一次司法官二試 */
/* 從 key 一路跳到尾聲。plan：{exam:{年:一試答對}, judge:{年:二試答對}, retake:true/false（二選一）, reg:{年:false＝不報}, role:'pros'} */
async function sim(key,hour,flags,plan,setup){ const G=H.fresh(key,hour,'dorm',Object.assign({BAR_REG:true,Y4_PATH:'bar'},flags||{})); graduated(G); FRIENDS.forEach(H.FRIEND); if(setup) setup(G);
  PHONE.join(G,'noodle_team','桌遊團'); PHONE.join(G,'home','家人'); warns.length=0; rej.length=0; H.said=[];
  const order=[], stops=[]; let it=0, err=null, mono=true;
  const orun=PG.runStep; PG.runStep=async function(GM,s){ let set=false, m;
    if((m=/^(exam|r2)_(\d{4})$/.exec(s.id))&&plan.miss&&plan.miss[s.id]){ const K=PG.Y[+m[2]], d=PG.DK(m[1]==='exam'?K.exam:K.r2); PG.setT(G,GM.E,d+2,7); return false; }   /* 錯過：一直沒空，時間直接到窗口過了（下一次 PG.pending 標 missed、跑 onMiss）*/
    if(!PG.done(G,s.id)){
      if((m=/^exam_(\d{4})$/.exec(s.id))){ H.picks=answerK(PG.draw(G,+m[1]),(plan.exam||{})[m[1]]|0); set=true; }
      else if((m=/^e2b_(\d{4})$/.exec(s.id))&&PG.stage(G,+m[1])==='both'){ H.picks=answerK(PG.drawJudge(G,+m[1]),(plan.judge||{})[m[1]]|0); set=true; }
      else if((m=/^jretake_(\d{4})$/.exec(s.id))){ H.picks=[plan.retake?0:1]; set=true; }
      else if((m=/^j?reg_(\d{4})$/.exec(s.id))){ H.picks=[(plan.reg&&plan.reg[m[1]]===false)?'不報名':'報名']; set=true; }
      else if(s.id==='jrole'){ H.picks=[plan.role==='pros'?1:0]; set=true; } }
    const r=await orun.call(PG,GM,s); if(set) H.picks=[]; if(r) order.push(s.id); return r; };
  try{ for(it=0; it<220&&!G.flags.EPILOGUE_DONE; it++){ const before=G.day*24+G.hour;
      if(OUT.due(G)){ H.picks=[0]; await OUT.tick(GM); H.picks=[]; }
      else { const s=PG.due(G); if(s) await PG.runStep(GM,s);
        else if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)){ if(!await PG.sleepJump(GM)){ const t0=G.day*24+G.hour; await HOME.sleep(GM); if(G.day*24+G.hour<=t0){ stops.push('sleep none'); break; } } }
        else if(!await PG.advance(GM)){ stops.push('none '+PG.dateLabel(G.day,G.hour)); break; } }
      if(G.day*24+G.hour<before-1e-6) mono=false; }
  }catch(e){ err=e; } finally { PG.runStep=orun; }
  await new Promise(r=>setTimeout(r,30));
  const lastKey=Object.keys(EL).find(k=>H.has(EL[k]));
  if(H.has(J.epiAuto)){ const F=G.flags; let n=0; for(let y=2029;y<=2033;y++) if(F['JUDGE_SCORE2_'+y]!=null||(F['BAR_STAGE_'+y]==='both'&&PG.done(G,'r2_'+y))) n++; AUTO.push({ok:FAMILY.includes(PG.path(G))&&F.BAR_YEAR!=null&&n===1&&F.JUDGE_RETAKE_AUTO===true,info:PG.path(G)+' n='+n}); }   /* AA_582 補充三②的前提 */
  return {G,order,stops,it,err,mono,lastKey,photo:((G.msgs||[]).find(m=>m.tag==='pg_first_day'&&m.from==='player')||{}).text||'',said:H.said.map(x=>x.t)}; }
const okRun=(name,R)=>check(name+'：沒有卡死、不丟例外、時間只往前、演完尾聲（'+R.it+' 步）',!R.err&&!warns.length&&!rej.length&&R.mono&&R.G.flags.EPILOGUE_DONE===true&&R.it<220,
  (R.err&&R.err.stack||'')+warns.slice(0,3).join('｜')+rej.slice(0,2).join('｜')+'　'+R.stops.join(' ')+'　'+R.order.join(' → '));
const sameLast=(R)=>R.lastKey===PG.path(R.G);
(async()=>{
  check('0. 有 PG.drawJudge、PG.judgePool、PG.basis、POSTGRAD_LINES.JUDGE',typeof PG.drawJudge==='function'&&typeof PG.judgePool==='function'&&typeof PG.basis==='function'&&!!POSTGRAD_LINES.JUDGE);
  if(typeof PG.drawJudge!=='function'){ console.log('FAILED'); process.exit(1); }
  // ---- (r9) A1 改版：2029 一試沒過、2030 第一次考二試就看實力 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:5,2030:17},judge:{2030:8}}); okRun('r9 2029 一試沒過、2030 第一次二試就上',R); const F=R.G.flags;
    check('r9. 2030 二試 8 題＝錄取（不是畢業那一年）、沒有二選一、BAR_YEAR 2030、JUDGE_YEAR 2031、J 結局',F.BAR_YEAR===2030&&F.JUDGE_PASS_2030===true&&!R.order.some(id=>/^jretake_/.test(id))&&F.JUDGE_YEAR===2031&&/^J_/.test(PG.path(R.G))&&R.order.includes('j3_2030'),JSON.stringify({by:F.BAR_YEAR,p30:F.JUDGE_PASS_2030,jy:F.JUDGE_YEAR})+' '+R.order.join(' ')); }
  // ---- (r10) 2032 錄取：2034-05-01 選，檢察官保留「剛結訓」----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:18,2030:17,2031:17},judge:{2029:4,2030:3,2031:9},retake:true,role:'pros'}); okRun('r10 2031 考上（2032 錄取）',R); const F=R.G.flags;
    check('r10. JUDGE_YEAR 2032、2034-05-01 選檢察官、尾聲「我在地檢署，剛結訓。……」',F.JUDGE_YEAR===2032&&R.order.includes('jrole')&&PG.path(R.G)==='J_pros'&&R.said.includes(EL.J_pros)&&!R.said.includes(J.prosServing),JSON.stringify({jy:F.JUDGE_YEAR})+' '+R.order.join(' ')); }
  // ---- (r11) 2033 錄取：尾聲還在受訓（J_trainee），不演結業前的選擇 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:18,2030:17,2031:17,2032:17},judge:{2029:4,2030:3,2031:3,2032:9},retake:true},G=>{ H.FRIEND('heroine_03'); H.date('heroine_03'); }); okRun('r11 2032 考上（2033 錄取＝受訓中）',R); const F=R.G.flags;
    check('r11. JUDGE_YEAR 2033、J_trainee、沒有結業前的選擇；尾聲祐廷「我還在司法官學院受訓。……」、阿凱、沛珊受訓中那兩句、交往中遠距那一句',F.JUDGE_YEAR===2033&&PG.path(R.G)==='J_trainee'&&!R.order.includes('jrole')&&F.JUDGE_ROLE==null&&R.lastKey==='J_trainee'&&R.said.includes(J.trainee.kai)&&R.said.includes(J.trainee.peishan)&&R.said.includes(J.distance),JSON.stringify({jy:F.JUDGE_YEAR,p:PG.path(R.G),k:R.lastKey})+' '+R.order.join(' ')); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

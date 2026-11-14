// D118-B8 司法官二試、三試、重考：第三支（r5～r8；拆開是為了平行跑不超過 300 秒）（docs/handoff/D118_PLAN.md 第 4 節 B8、第 12 節 A1／A2／A5／A6；台詞 AA_582 企劃線 14ce865f0；題池 AA_583 b76dd619e）——不需要瀏覽器。
//   規則（AA_582 補充二）：畢業那一年（2029；延畢 2030）的司法官二試一定沒上（A1「應屆」），之後每一年看實力；JUDGE_YEAR＝錄取那一年（考試隔年 1 月），受訓兩年：2031 錄取＝2033 春天選、2032＝2034-05-01 選、2033 以後＝尾聲受訓中（J_trainee）；二試＝10 題爭點題作答＋四年法律科期末平均（PG.basis）輔助：答對 ≥7，或 ≥6 而且平均答對 ≥4；
//   有律師證照的第一次落榜＝當晚二選一（再考／就當律師）；重考那一年自動報名、只考一試＋司法官二試（BAR_YEAR 不動）；錄取＝12 月放榜→1 月三試→1 月下旬錄取（JUDGE_YEAR）→結業前選法官／檢察官。
//   (p) 題池：EXAM_BANK 三種已核對＋QBANK、mc、四類科目、題幹有甲乙丙且 ≥45 字；每年 民3 刑3 公2 訴2；不和當年一試重複；重考年換題。
//   (r1)～(r6) 六條路線從 2029-08-04 一路「跳到下一件事」到尾聲：沒有卡死、BAR_YEAR 一定有值、落點對；全對全錯結果不同；讀書天數不影響；
//   (o) 舊存檔：BAR_STAGE_2029 both、二試放榜演過＝隔年 5/9 以前補演二選一、之後＝路線 d；不丟例外。
//   修改前 FAIL（沒有 PG.drawJudge、JUDGE_*、J 結局）。用法：node tests/d118_b8c_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const warns=[]; console.warn=(...a)=>{ warns.push(a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join(' / '):String(x)).join(' ')); };
const rej=[]; process.on('unhandledRejection',e=>rej.push(String(e&&e.stack||e)));
const GM=H.GM; GM.spawnCharacter=()=>null;
const J=POSTGRAD_LINES.JUDGE||{}, EL=POSTGRAD_LINES.EPI.last;
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; if(G.flags.MOVED_OUT==null) G.flags.MOVED_OUT=PG.DK('2029-06-28'); };
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
const FRIENDS=['zhe','yu','classmate_bohan','heroine_01','heroine_03','classmate_peishan'];
const FAMILY=['A_bar','C_zq','B_grad','L_firm'];
/* 從 key 一路跳到尾聲。plan：{exam:{年:一試答對}, judge:{年:二試答對}, retake:true/false（二選一）, reg:{年:false＝不報}, role:'pros'} */
async function sim(key,hour,flags,plan,setup){ const G=H.fresh(key,hour,'dorm',Object.assign({BAR_REG:true,Y4_PATH:'bar'},flags||{})); graduated(G); FRIENDS.forEach(H.FRIEND); if(setup) setup(G);
  PHONE.join(G,'noodle_team','桌遊團'); PHONE.join(G,'home','家人'); warns.length=0; rej.length=0; H.said=[];
  const order=[], stops=[]; let it=0, err=null, mono=true;
  const orun=PG.runStep; PG.runStep=async function(GM,s){ let set=false, m;
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
  return {G,order,stops,it,err,mono,lastKey,photo:((G.msgs||[]).find(m=>m.tag==='pg_first_day'&&m.from==='player')||{}).text||'',said:H.said.map(x=>x.t)}; }
const okRun=(name,R)=>check(name+'：沒有卡死、不丟例外、時間只往前、演完尾聲（'+R.it+' 步）',!R.err&&!warns.length&&!rej.length&&R.mono&&R.G.flags.EPILOGUE_DONE===true&&R.it<220,
  (R.err&&R.err.stack||'')+warns.slice(0,3).join('｜')+rej.slice(0,2).join('｜')+'　'+R.stops.join(' ')+'　'+R.order.join(' → '));
const sameLast=(R)=>R.lastKey===PG.path(R.G);
(async()=>{
  check('0. 有 PG.drawJudge、PG.judgePool、PG.basis、POSTGRAD_LINES.JUDGE',typeof PG.drawJudge==='function'&&typeof PG.judgePool==='function'&&typeof PG.basis==='function'&&!!POSTGRAD_LINES.JUDGE);
  if(typeof PG.drawJudge!=='function'){ console.log('FAILED'); process.exit(1); }
  // ---- (r5) f：重考 2030、2031 都沒上，2032 不報 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:18,2030:17,2031:16},judge:{2029:4,2030:3,2031:2},retake:true,reg:{2032:false}}); okRun('r5 重考兩次都沒上、2032 不報（路線 f）',R); const F=R.G.flags;
    check('r5. 2031 報名問題（年份字卡「還在考。」）、JUDGE_REG_2031 true、JUDGE_REG_2032 false、JUDGE_RETAKE done、JUDGE_TRIES 2',F.JUDGE_REG_2031===true&&F.JUDGE_REG_2032===false&&F.JUDGE_RETAKE==='done'&&F.JUDGE_TRIES===2&&H.cards.some(c=>c[0]==='2031 年'&&c[1]==='還在考。'),JSON.stringify({r31:F.JUDGE_REG_2031,r32:F.JUDGE_REG_2032,rt:F.JUDGE_RETAKE,tr:F.JUDGE_TRIES})+' '+R.order.join(' '));
    check('r5. 律師家族＋(i) f「司法官考了幾次，最後沒有上……」；BAR_YEAR 2029 不變',FAMILY.includes(PG.path(R.G))&&R.said.includes(J.epiF)&&F.BAR_YEAR===2029&&sameLast(R)); }
  // ---- (r6) f：重考一路到 2033 都沒上；中間有一年一試沒到司法官 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:16,2030:13,2031:16,2032:16,2033:16},judge:{2029:2,2031:1,2032:1,2033:1},retake:true}); okRun('r6 重考到 2033（2030 一試只到律師）',R); const F=R.G.flags;
    check('r6. 2030 一試 13＝「【考選部】司法官一試：未通過。」、沒有二試；2031～2033 都考、JUDGE_TRIES 4、JUDGE_RETAKE done、律師家族＋(i) f',R.said.includes('【考選部】司法官一試：未通過。')&&!R.said.includes('司法官一試：未通過。')&&!R.order.includes('e2b_2030')&&F.JUDGE_TRIES===4&&F.JUDGE_RETAKE==='done'&&R.said.includes(J.epiF)&&FAMILY.includes(PG.path(R.G))&&F.BAR_YEAR===2029,JSON.stringify({tr:F.JUDGE_TRIES,rt:F.JUDGE_RETAKE})+' '+R.order.join(' ')); }
  // ---- 讀書天數不影響：r3 同樣的作答、自習 9999 小時＋總圖 300 天 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:17,2030:16},judge:{2029:4,2030:8},retake:true},G=>{ G.stats.study=9999; G.habits={'place:library:day':{n:300,days:Array.from({length:300},(_,i)=>PG.DK('2029-01-01')+i)}}; });
    check('r7. 讀書天數不影響：同樣的作答一樣錄取（JUDGE_YEAR 2031）',R.G.flags.JUDGE_YEAR===2031&&R.G.flags.EPILOGUE_DONE===true); }
  // ---- 交換延畢：第一次考在 2030 也一定沒上，2031 重考才可能 ----
  { const R=await sim('2030-08-03',7,{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true,BAR_REG:false},{exam:{2030:20,2031:20},judge:{2030:10,2031:9},retake:true}); okRun('r8 交換延畢 2030 第一次→2031 重考上',R); const F=R.G.flags;
    check('r8. 2030（交換延畢的畢業那一年）全對也沒上、BAR_YEAR 2030；2031 重考上（2032 錄取＝JUDGE_YEAR 2032，2034-05-01 選）',F.BAR_YEAR===2030&&F.JUDGE_PASS_2030===false&&F.JUDGE_YEAR===2032&&PG.path(R.G)==='J_judge'&&PG.roleDay(R.G)===PG.DK('2034-05-01')&&R.order.includes('jrole'),JSON.stringify({by:F.BAR_YEAR,p30:F.JUDGE_PASS_2030,jy:F.JUDGE_YEAR})+' '+R.order.join(' ')); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

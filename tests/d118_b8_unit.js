// D118-B8 司法官二試、三試、重考：六條路線（docs/handoff/D118_PLAN.md 第 4 節 B8、第 12 節 A1／A2／A5／A6；台詞 AA_582 企劃線 14ce865f0；題池 AA_583 b76dd619e）——不需要瀏覽器。
//   規則：第一次考司法官二試一定沒上（A1，應屆不能）；二試＝10 題爭點題作答＋四年法律科期末平均（PG.basis）輔助：答對 ≥7，或 ≥6 而且平均答對 ≥4；
//   有律師證照的第一次落榜＝當晚二選一（再考／就當律師）；重考那一年自動報名、只考一試＋司法官二試（BAR_YEAR 不動）；錄取＝12 月放榜→1 月三試→1 月下旬錄取（JUDGE_YEAR）→結業前選法官／檢察官。
//   (p) 題池：EXAM_BANK 三種已核對＋QBANK、mc、四類科目、題幹有甲乙丙且 ≥45 字；每年 民3 刑3 公2 訴2；不和當年一試重複；重考年換題。
//   (r1)～(r6) 六條路線從 2029-08-04 一路「跳到下一件事」到尾聲：沒有卡死、BAR_YEAR 一定有值、落點對；全對全錯結果不同；讀書天數不影響；
//   (o) 舊存檔：BAR_STAGE_2029 both、二試放榜演過＝隔年 5/9 以前補演二選一、之後＝路線 d；不丟例外。
//   修改前 FAIL（沒有 PG.drawJudge、JUDGE_*、J 結局）。用法：node tests/d118_b8_unit.js
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
  PHONE.join(G,'noodle_team','麵店團'); PHONE.join(G,'home','家人'); warns.length=0; rej.length=0; H.said=[];
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
  // ---- (p) 題池（AA_583）----
  { const pool=PG.judgePool(), OK=['USER_CONFIRMED','AI_CROSS_REVIEWED','Y4_CROSS_REVIEWED'];
    const all=EXAM_BANK.questions.filter(q=>OK.includes(q.status)&&q.type==='mc'&&PG.judgeGroup(q)).concat(QBANK.filter(q=>q.type==='mc'&&q.complete!==false));
    const want=all.filter(q=>/[甲乙丙]/.test(q.q)&&q.q.length>=45);
    check('p1. 題池＝已核對的 mc、四類科目、題幹有甲乙丙而且 ≥45 字（程式篩，'+pool.length+' 題）',pool.length===want.length&&pool.every(q=>/[甲乙丙]/.test(q.q)&&q.q.length>=45&&(q.course==null||OK.includes(q.status))&&q.type==='mc'),pool.length+' vs '+want.length);
    check('p1. 沒有短題、沒有不含甲乙丙的題',!pool.some(q=>q.q.length<45||!/[甲乙丙]/.test(q.q)));
    const G=H.fresh('2029-10-21',8,'dorm',{BAR_REG:true}); graduated(G); const q1=PG.draw(G,2029); const j=PG.drawJudge(G,2029);
    const cnt={}; for(const q of j) cnt[PG.judgeGroup(q)]=(cnt[PG.judgeGroup(q)]||0)+1;
    check('p2. 每年 10 題：民法 3、刑法 3、公法 2、訴訟法 2',j.length===10&&cnt.civ===3&&cnt.crim===3&&cnt.pub===2&&cnt.proc===2,JSON.stringify(cnt));
    const s1=new Set(q1.map(q=>q.id)); check('p3. 不和當年一試抽到的題重複',j.every(q=>!s1.has(q.id)));
    check('p3. 題目、答案照題庫（同一個物件）',j.every(q=>EXAM_BANK.questions.includes(q)||QBANK.includes(q)));
    const again=PG.drawJudge(G,2029); check('p4. 同一年再抽＝同一組（讀檔不重抽）',again.map(q=>q.id).join()===j.map(q=>q.id).join());
    PG.draw(G,2030); const j2=PG.drawJudge(G,2030); const sj=new Set(j.map(q=>q.id)), s2=new Set(PG.rec(G).exam[2030].qs);
    check('p5. 重考年換一組（和去年的二試不重複、也不和當年一試重複）',j2.length===10&&j2.every(q=>!sj.has(q.id)&&!s2.has(q.id)));
    const G2=H.fresh('2029-10-21',8,'dorm',{BAR_REG:true,examSeed:999}); graduated(G2); PG.draw(G2,2029); check('p6. 不同存檔（examSeed）抽到不同的題',PG.drawJudge(G2,2029).map(q=>q.id).join()!==j.map(q=>q.id).join()); }
  // ---- 判定 ----
  { const G=H.fresh('2030-12-13',15,'dorm',{BAR_STAGE_2029:'both',JUDGE_SCORE2_2029:9}); const C=CLS.rec(G); C.exam=C.exam||{};
    check('v1. 第一次考（之前沒考過二試）10 題全對也不上（A1）',!PG.judgeVerdict(G,2029,10));
    check('v2. 重考：7 題上、6 題（在校平均沒有紀錄）不上、0 題不上',PG.judgeVerdict(G,2030,7)&&!PG.judgeVerdict(G,2030,6)&&!PG.judgeVerdict(G,2030,0));
    for(const t of ['Y1S1','Y2S1','Y3S1']) C.exam[t+':civ:final']={status:'done',correct:5};
    check('v3. 在校平均答對 ≥4（PG.basis）：6 題就上；5 題不上（不保證）',PG.basis(G)===5&&PG.judgeVerdict(G,2030,6)&&!PG.judgeVerdict(G,2030,5));
    for(const t of ['Y1S1','Y2S1','Y3S1']) C.exam[t+':civ:final']={status:'done',correct:1};
    check('v4. 在校平均低：6 題不上、7 題上',!PG.judgeVerdict(G,2030,6)&&PG.judgeVerdict(G,2030,7));
    G.stats.study=9999; G.habits={'place:library:day':{n:300,days:Array.from({length:300},(_,i)=>i)}}; check('v5. 讀書天數、自習時數不影響判定',!PG.judgeVerdict(G,2030,6)&&PG.judgeVerdict(G,2030,7)); }
  // ---- (r1) 律師（一試 14）----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:14}}); okRun('r1 一試 14＝律師',R);
    check('r1. BAR_YEAR 2029、沒有司法官旗標、落點在律師家族、第一份工作照片和尾聲同一個落點',R.G.flags.BAR_YEAR===2029&&R.G.flags.JUDGE_YEAR==null&&FAMILY.includes(PG.path(R.G))&&sameLast(R)&&R.photo.includes(POSTGRAD_LINES.FIRST.me[PG.path(R.G)]),PG.path(R.G)+' '+R.lastKey+' '+R.photo); }
  // ---- (r2) 應屆全對也沒上（A1）→ 再考 → 2030 全對 → 錄取 → 檢察官 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:20,2030:20},judge:{2029:10,2030:10},retake:true,role:'pros'}); okRun('r2 應屆全對→重考全對→錄取（檢察官）',R); const F=R.G.flags;
    check('r2. 2029 司法官未通過（A1）、BAR_YEAR 2029；二選一「再考一次司法官。」',F.JUDGE_PASS_2029===false&&F.BAR_YEAR===2029&&R.said.includes('（'+J.no+'）')&&R.said.includes(J.retake.opts[0].say),R.order.join(' '));
    check('r2. 2030：(g) 日期卡、一試、司法官二試（沒有律師二試第一天）、12/13 通過「三試（口試）：1 月 11 日」、(b) 旁白',F.BAR_SIT_2030===true&&F.JUDGE_SCORE2_2030===10&&F.JUDGE_PASS_2030===true&&!R.order.includes('e2a_2030')&&R.said.includes(J.pass.sys.replace('{月日}','1 月 11 日'))&&R.said.includes(J.pass.narr[0])&&H.cards.some(c=>c[0]==='【2030 年 3 月】'),R.order.join(' '));
    check('r2. 2031-01 三試（口試）、錄取（b2＋h）→ JUDGE_YEAR 2030；結業前選「檢察官。」→ J_pros；BAR_YEAR 不動',R.order.includes('j3_2030')&&R.order.includes('jb2_2030')&&F.JUDGE_YEAR===2030&&F.JUDGE_ROLE==='pros'&&PG.path(R.G)==='J_pros'&&F.BAR_YEAR===2029&&R.said.includes(J.oral.open)&&R.said.includes(J.admit.sys)&&R.said.includes(J.role.narr));
    check('r2. 第一份工作（2030-10-01 還在重考）＝事務所名牌＋考古題；尾聲＝檢察官那一句；阿凱、沛珊的 J 台詞（檢察官）',R.photo.includes(POSTGRAD_LINES.FIRST.judgeRetake)&&R.lastKey==='J_pros'&&R.said.includes(J.kai.replace('{job}','檢察官'))&&R.said.includes(J.peishan.replace('{job}','檢察官')),R.photo+' '+R.lastKey); }
  // ---- (r3) c→e：應屆二試 4 → 重考 → 2030 二試 8 → 法官；交往中＝遠距那一句 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:17,2030:16},judge:{2029:4,2030:8},retake:true,role:'judge'},G=>{ H.FRIEND('heroine_03'); H.date('heroine_03'); }); okRun('r3 重考上司法官（法官）',R); const F=R.G.flags;
    check('r3. JUDGE_YEAR 2030、J_judge、尾聲「我在地方法院當候補法官……」、交往中多一句「（你們說好，這個月輪到你回臺北。）」',F.JUDGE_YEAR===2030&&PG.path(R.G)==='J_judge'&&R.lastKey==='J_judge'&&R.said.includes(J.distance)&&F.BAR_YEAR===2029); }
  // ---- 全錯：同一條路線重考 0 題＝沒上 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:17,2030:16},judge:{2029:4,2030:0},retake:true,reg:{2031:false}}); okRun('r3x 重考二試全錯',R); const F=R.G.flags;
    check('r3x. 全對、全錯結果不同：0 題＝JUDGE_PASS_2030 false、沒有 JUDGE_YEAR、仍落榜那幾句、律師家族',F.JUDGE_PASS_2030===false&&F.JUDGE_YEAR==null&&R.said.includes(J.still[0])&&FAMILY.includes(PG.path(R.G))&&F.BAR_YEAR===2029); }
  // ---- (r4) d：應屆二試 4 → 就當律師 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:18},judge:{2029:4},retake:false}); okRun('r4 不重考（路線 d）',R); const F=R.G.flags;
    check('r4. JUDGE_RETAKE false、BAR_YEAR 2029、律師家族、尾聲多 (i) d「司法官那一年沒考上……」、照片和尾聲同一個落點',F.JUDGE_RETAKE===false&&F.BAR_YEAR===2029&&FAMILY.includes(PG.path(R.G))&&R.said.includes(J.epiD)&&!R.said.includes(J.epiF)&&sameLast(R)&&!R.order.includes('exam_2030'),PG.path(R.G)+' '+R.lastKey); }
  // ---- (r5) f：重考 2030、2031 都沒上，2032 不報 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:18,2030:17,2031:16},judge:{2029:4,2030:3,2031:2},retake:true,reg:{2032:false}}); okRun('r5 重考兩次都沒上、2032 不報（路線 f）',R); const F=R.G.flags;
    check('r5. 2031 報名問題（年份字卡「還在考。」）、JUDGE_REG_2031 true、JUDGE_REG_2032 false、JUDGE_RETAKE done、JUDGE_TRIES 2',F.JUDGE_REG_2031===true&&F.JUDGE_REG_2032===false&&F.JUDGE_RETAKE==='done'&&F.JUDGE_TRIES===2&&H.cards.some(c=>c[0]==='2031 年'&&c[1]==='還在考。'),JSON.stringify({r31:F.JUDGE_REG_2031,r32:F.JUDGE_REG_2032,rt:F.JUDGE_RETAKE,tr:F.JUDGE_TRIES})+' '+R.order.join(' '));
    check('r5. 律師家族＋(i) f「司法官考了幾次，最後沒有上……」；BAR_YEAR 2029 不變',FAMILY.includes(PG.path(R.G))&&R.said.includes(J.epiF)&&F.BAR_YEAR===2029&&sameLast(R)); }
  // ---- (r6) f：重考一路到 2033 都沒上；中間有一年一試沒到司法官 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:16,2030:13,2031:16,2032:16,2033:16},judge:{2029:2,2031:1,2032:1,2033:1},retake:true}); okRun('r6 重考到 2033（2030 一試只到律師）',R); const F=R.G.flags;
    check('r6. 2030 一試 13＝「司法官一試：未通過。」、沒有二試；2031～2033 都考、JUDGE_TRIES 4、JUDGE_RETAKE done、律師家族＋(i) f',R.said.includes('司法官一試：未通過。')&&!R.order.includes('e2b_2030')&&F.JUDGE_TRIES===4&&F.JUDGE_RETAKE==='done'&&R.said.includes(J.epiF)&&FAMILY.includes(PG.path(R.G))&&F.BAR_YEAR===2029,JSON.stringify({tr:F.JUDGE_TRIES,rt:F.JUDGE_RETAKE})+' '+R.order.join(' ')); }
  // ---- 讀書天數不影響：r3 同樣的作答、自習 9999 小時＋總圖 300 天 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:17,2030:16},judge:{2029:4,2030:8},retake:true},G=>{ G.stats.study=9999; G.habits={'place:library:day':{n:300,days:Array.from({length:300},(_,i)=>PG.DK('2029-01-01')+i)}}; });
    check('r7. 讀書天數不影響：同樣的作答一樣錄取（JUDGE_YEAR 2030）',R.G.flags.JUDGE_YEAR===2030&&R.G.flags.EPILOGUE_DONE===true); }
  // ---- 交換延畢：第一次考在 2030 也一定沒上，2031 重考才可能 ----
  { const R=await sim('2030-08-03',7,{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true,BAR_REG:false},{exam:{2030:20,2031:20},judge:{2030:10,2031:9},retake:true}); okRun('r8 交換延畢 2030 第一次→2031 重考上',R); const F=R.G.flags;
    check('r8. 2030 全對也沒上（第一次）、BAR_YEAR 2030；2031 重考上（JUDGE_YEAR 2031）',F.BAR_YEAR===2030&&F.JUDGE_PASS_2030===false&&F.JUDGE_YEAR===2031&&PG.path(R.G).startsWith('J_'),JSON.stringify({by:F.BAR_YEAR,p30:F.JUDGE_PASS_2030,jy:F.JUDGE_YEAR})+' '+R.order.join(' ')); }
  // ---- (o) 舊存檔 ----
  { const OLD={BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:18,BAR_STAGE_2029:'both',BAR_YEAR:2029};
    const pre=G=>{ const d=PG.rec(G).done; for(const id of ['exam_2029','r1_2029','e2a_2029','e2b_2029','r2_2029','an1','kx_bar_2029']) d[id]=1; };
    const G=H.fresh('2030-02-01',10,'dorm',Object.assign({},OLD)); graduated(G); pre(G); let s=null, e=null; try{ s=PG.due(G); }catch(x){ e=x; }
    check('o1. 舊存檔（both、二試放榜演過、這一版以前沒有司法官旗標），2030-02 讀檔：補演二選一',!e&&s&&s.id==='jretake_2029',s&&s.id);
    const R=await sim('2030-06-01',10,Object.assign({},OLD),{},pre); okRun('o2 舊存檔 2030-06 讀檔（過了 5/9）',R);
    check('o2. 不補演二選一、JUDGE_RETAKE false（路線 d）、BAR_YEAR 2029 照舊、律師家族',!R.order.includes('jretake_2029')&&R.G.flags.JUDGE_RETAKE===false&&R.G.flags.BAR_YEAR===2029&&FAMILY.includes(PG.path(R.G))&&R.said.includes(J.epiD));
    const G3=H.fresh('2029-12-14',15.1,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:18,BAR_STAGE_2029:'both'}); graduated(G3); const d3=PG.rec(G3).done; for(const id of ['exam_2029','r1_2029','e2a_2029','e2b_2029']) d3[id]=1;
    let ex=null; try{ await H.run('r2_2029'); }catch(x){ ex=x; }
    check('o3. 二試考完、沒有二試作答紀錄的舊存檔（e2b 這一版以前演過）：12/14 放榜不丟例外、律師錄取、司法官未通過',!ex&&G3.flags.BAR_YEAR===2029&&G3.flags.JUDGE_PASS_2029===false); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

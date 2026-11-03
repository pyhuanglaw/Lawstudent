// D118-B8 司法官二試、三試、重考：第四支（舊存檔 o、CC_25 ①～③：二試放榜錯過、2033 第一次到司法官、重考年錯過一試）（docs/handoff/D118_PLAN.md 第 4 節 B8、第 12 節 A1／A2／A5／A6；台詞 AA_582 企劃線 14ce865f0；題池 AA_583 b76dd619e）——不需要瀏覽器。
//   規則（AA_582 補充二）：畢業那一年（2029；延畢 2030）的司法官二試一定沒上（A1「應屆」），之後每一年看實力；JUDGE_YEAR＝錄取那一年（考試隔年 1 月），受訓兩年：2031 錄取＝2033 春天選、2032＝2034-05-01 選、2033 以後＝尾聲受訓中（J_trainee）；二試＝10 題爭點題作答＋四年法律科期末平均（PG.basis）輔助：答對 ≥7，或 ≥6 而且平均答對 ≥4；
//   有律師證照的第一次落榜＝當晚二選一（再考／就當律師）；重考那一年自動報名、只考一試＋司法官二試（BAR_YEAR 不動）；錄取＝12 月放榜→1 月三試→1 月下旬錄取（JUDGE_YEAR）→結業前選法官／檢察官。
//   (p) 題池：EXAM_BANK 三種已核對＋QBANK、mc、四類科目、題幹有甲乙丙且 ≥45 字；每年 民3 刑3 公2 訴2；不和當年一試重複；重考年換題。
//   (r1)～(r6) 六條路線從 2029-08-04 一路「跳到下一件事」到尾聲：沒有卡死、BAR_YEAR 一定有值、落點對；全對全錯結果不同；讀書天數不影響；
//   (o) 舊存檔：BAR_STAGE_2029 both、二試放榜演過＝隔年 5/9 以前補演二選一、之後＝路線 d；不丟例外。
//   修改前 FAIL（沒有 PG.drawJudge、JUDGE_*、J 結局）。用法：node tests/d118_b8d_unit.js
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
  PHONE.join(G,'noodle_team','麵店團'); PHONE.join(G,'home','家人'); warns.length=0; rej.length=0; H.said=[];
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
  // ---- (o) 舊存檔 ----
  { const OLD={BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:18,BAR_STAGE_2029:'both',BAR_YEAR:2029};
    const pre=G=>{ const d=PG.rec(G).done; for(const id of ['exam_2029','r1_2029','e2a_2029','e2b_2029','r2_2029','an1','kx_bar_2029']) d[id]=1; };
    const G=H.fresh('2030-02-01',10,'dorm',Object.assign({},OLD)); graduated(G); pre(G); let s=null, e=null; try{ s=PG.due(G); }catch(x){ e=x; }
    check('o1. 舊存檔（both、二試放榜演過、這一版以前沒有司法官旗標），2030-02 讀檔：補演二選一',!e&&s&&s.id==='jretake_2029',s&&s.id);
    const R=await sim('2030-06-01',10,Object.assign({},OLD),{},pre); okRun('o2 舊存檔 2030-06 讀檔（過了 5/9）',R);
    check('o2. 不補演二選一、JUDGE_RETAKE false＋JUDGE_RETAKE_AUTO（沒有選過）、BAR_YEAR 2029 照舊、律師家族；尾聲 epiAuto 不是「我後來沒有再考」（CC_25）',!R.order.includes('jretake_2029')&&R.G.flags.JUDGE_RETAKE===false&&R.G.flags.JUDGE_RETAKE_AUTO===true&&R.G.flags.BAR_YEAR===2029&&FAMILY.includes(PG.path(R.G))&&R.said.includes(J.epiAuto)&&!R.said.includes(J.epiD));
    const G3=H.fresh('2029-12-14',15.1,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:18,BAR_STAGE_2029:'both'}); graduated(G3); const d3=PG.rec(G3).done; for(const id of ['exam_2029','r1_2029','e2a_2029','e2b_2029']) d3[id]=1;
    let ex=null; try{ await H.run('r2_2029'); }catch(x){ ex=x; }
    check('o3. 二試考完、沒有二試作答紀錄的舊存檔（e2b 這一版以前演過）：12/14 放榜不丟例外、律師錄取、司法官未通過',!ex&&G3.flags.BAR_YEAR===2029&&G3.flags.JUDGE_PASS_2029===false); }
  // ---- CC_25 ① BUG-BAR-MISS-NOYEAR：二試放榜那一場錯過＝結果照正常放榜記（BAR_YEAR），下一個停點一句旁白 ----
  { const pre=(G,st,k)=>{ const d=PG.rec(G).done; for(const id of ['exam_2029','r1_2029','e2a_2029','e2b_2029']) d[id]=1; Object.assign(G.flags,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:k,BAR_STAGE_2029:st}); };
    const G=H.fresh('2029-12-16',16,'dorm',{}); graduated(G); pre(G,'lawyer',14); PG.pending(G); const s=PG.due(G); H.said=[]; if(s) await PG.runStep(GM,s);
    check('m1. 一試 14、二試放榜錯過（12/16 才空下來）：BAR_YEAR 2029（原本沒有＝A_none）、r2_2029 missed、下一個停點「（放榜那天你沒有去看。……律師，錄取。）」',G.flags.BAR_YEAR===2029&&PG.rec(G).done.r2_2029==='missed'&&s&&s.id==='r2miss_2029'&&H.has(POSTGRAD_LINES.MISSED.r2)&&FAMILY.includes(PG.path(G)),s&&s.id);
    const R=await sim('2029-12-14',10,{},{retake:false,miss:{r2_2029:true}},G=>{ pre(G,'both',18); G.flags.JUDGE_SCORE2_2029=3; }); okRun('m2 一試 18、二試放榜錯過→二選一→尾聲',R);
    check('m2. BAR_YEAR 2029、司法官未通過、錄取那一句在二選一之前、律師家族、尾聲「我後來沒有再考」（自己選的）',R.G.flags.BAR_YEAR===2029&&R.G.flags.JUDGE_PASS_2029===false&&R.order.indexOf('r2miss_2029')>=0&&R.order.indexOf('r2miss_2029')<R.order.indexOf('jretake_2029')&&FAMILY.includes(PG.path(R.G))&&R.said.includes(J.epiD),R.order.join(' ')); }
  // ---- CC_25 ② 2033 第一次到司法官、沒上：沒有選過＝epiAuto ----
  { const LATE0={BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none',BAR_SIT_2030:true,BAR_SCORE_2030:5,BAR_STAGE_2030:'none',FIRST_DAY_SEEN:true};
    const R=await sim('2031-05-01',10,LATE0,{exam:{2031:5,2032:5,2033:17},judge:{2033:3}},G=>{ const d=PG.rec(G).done; for(const id of ['exam_2029','r1_2029','exam_2030','r1_2030','first','reg_2030']) d[id]=1; }); okRun('a1 2033 第一次到司法官、二試沒上',R); const F=R.G.flags;
    check('a1. BAR_YEAR 2033、JUDGE_RETAKE false＋JUDGE_RETAKE_AUTO、沒有二選一；尾聲 epiAuto、不是 epiD',F.BAR_YEAR===2033&&F.JUDGE_RETAKE===false&&F.JUDGE_RETAKE_AUTO===true&&!R.order.some(id=>/^jretake_/.test(id))&&R.said.includes(J.epiAuto)&&!R.said.includes(J.epiD),R.order.join(' ')); }
  check('a2. 前提：說到 epiAuto 的每一個人都在律師家族、而且真的考過一次司法官二試（'+AUTO.length+' 人）',AUTO.length>=2&&AUTO.every(x=>x.ok),JSON.stringify(AUTO));
  // ---- CC_25 ③ 選了重考、重考那一年錯過一試、隔年不報 ----
  { const R=await sim('2029-08-04',7,{},{exam:{2029:18},judge:{2029:4},retake:true,miss:{exam_2030:true},reg:{2031:false}}); okRun('t1 重考年錯過一試、隔年不報',R); const F=R.G.flags;
    check('t1. 錯過那天司法官版旁白（不是律師版）、JUDGE_TRIES 1、2031 不報＝done、尾聲 (i) f',R.said.includes(POSTGRAD_LINES.MISSED.judgeExam)&&!R.said.includes(POSTGRAD_LINES.MISSED.exam2030)&&F.JUDGE_TRIES===1&&F.JUDGE_REG_2031===false&&F.JUDGE_RETAKE==='done'&&R.said.includes(J.epiF),JSON.stringify({tr:F.JUDGE_TRIES,rt:F.JUDGE_RETAKE})+' '+R.order.join(' ')); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

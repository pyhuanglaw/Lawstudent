// 國考年份與門檻（使用者 2026-11-02 09:1x，經 AA 轉述；企劃線 751ebf171 AA_572 第 5 節末 A3、A4；src/postgrad3d.js S.tier、S.LATE_YEARS）——不需要瀏覽器。
//   A4：取消 2030 保底——2030 和 2029 同一套門檻（一試答對 ≥12 進律師二試、≥16 律師和司法官都進；不到 12＝那年沒有二試）。BUG-BAR2030-TIER-1102（BB／CC N4：0 題也會 BAR_YEAR=2030）。
//   A3：可以考到 2033——2030 沒過以後，2031～2033 每年：5 月報名（年份字卡＋報名／不報名）→ 8 月一試真的作答 20 題 → 9 月一試放榜 → 10 月二試字卡 → 12 月二試放榜；
//       不報名＝停在那一年；到 2033 都沒過＝「兩邊都沒上」，尾聲照常演完。台詞是暫定字（POSTGRAD_LINES.LATE，AA 定稿後換）。
//   (a) 2030 一試 0、11 題＝沒有二試（修改前 FAIL：保底一律 lawyer）；12＝律師、16＝both；交換延畢第一次考也一樣
//   (b) 2030 沒過 → 2031 考過 → BAR_YEAR 2031、律師家族的尾聲；(c) 2031～2033 都沒過 → 「兩邊都沒上」演完、不丟例外；(d) 中途不報名 → 停止；報名那晚錯過＝不報名
//   (e) 舊存檔：BAR_YEAR 2030 保留、已經放榜記了 BAR_STAGE_2030 的照記的、還沒放榜的照新門檻；(f) 2030-09-01～2034-06-04 每天掃一遍，2031～2033 的停點、手機規則不丟例外。
//   用法：node tests/bar_years_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const warns=[]; console.warn=(...a)=>{ warns.push(a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join(' / '):String(x)).join(' ')); };
const rej=[]; process.on('unhandledRejection',e=>rej.push(String(e&&e.stack||e)));
const GM=H.GM; GM.spawnCharacter=()=>null;
const LT=POSTGRAD_LINES.LATE;
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; if(G.flags.MOVED_OUT==null) G.flags.MOVED_OUT=PG.DK('2029-06-28'); };   /* [前置] 畢業、6/28 搬出宿舍（AA_318 那一批在 postgrad_days_unit 測）*/
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
const RETAKER={BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none',LAWCLUB_SAT_VISITS:10};   /* [前置] 2029 一試答對 5 題（沒過）、傾向 A */
const FRIENDS=['zhe','yu','classmate_bohan','heroine_01','heroine_03'];
/* 從某一天一路「跳到下一件事」到尾聲；plan：{2030:答對題數, 2031:…, reg:{2031:false}＝那年選不報名}。一試、報名在 PG.runStep 開始前照 plan 放好選項 */
async function sim(key,hour,flags,plan,setup){ const G=H.fresh(key,hour,'dorm',Object.assign({},flags)); graduated(G); FRIENDS.forEach(H.FRIEND); if(setup) setup(G);
  PHONE.join(G,'noodle_team','麵店團'); PHONE.join(G,'home','家人'); warns.length=0; rej.length=0;
  const order=[], stops=[]; let it=0, err=null, mono=true; const said=[];
  const orun=PG.runStep; PG.runStep=async function(GM,s){ const m=/^(exam|reg)_(\d{4})$/.exec(s.id); let set=false;
    if(m&&!PG.done(G,s.id)){ const y=+m[2]; if(m[1]==='exam'){ H.picks=answerK(PG.draw(G,y),plan[y]|0); set=true; } else { H.picks=[(plan.reg&&plan.reg[y]===false)?'不報名':'報名']; set=true; } }
    const n0=H.said.length; const r=await orun.call(PG,GM,s); if(set) H.picks=[]; if(r) order.push(s.id); return r; };
  try{ for(it=0; it<160&&!G.flags.EPILOGUE_DONE; it++){ const before=G.day*24+G.hour;
      if(OUT.due(G)){ H.picks=[0]; await OUT.tick(GM); H.picks=[]; }
      else { const s=PG.due(G); if(s) await PG.runStep(GM,s);
        else if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)){ if(!await PG.sleepJump(GM)){ const t0=G.day*24+G.hour; await HOME.sleep(GM); if(G.day*24+G.hour<=t0){ stops.push('sleep none'); break; } } }
        else if(!await PG.advance(GM)){ stops.push('none '+PG.dateLabel(G.day,G.hour)); break; } }
      if(G.day*24+G.hour<before-1e-6) mono=false; }
  }catch(e){ err=e; } finally { PG.runStep=orun; }
  await new Promise(r=>setTimeout(r,30));
  return {G,order,stops,it,err,mono}; }
const okRun=(name,R)=>check(name+'：不丟例外、沒有警告、時間只往前、'+R.it+' 次就演完尾聲（EPILOGUE_DONE）',!R.err&&!warns.length&&!rej.length&&R.mono&&R.G.flags.EPILOGUE_DONE===true&&R.it<160,
  (R.err&&R.err.stack||'')+warns.slice(0,3).join('｜')+rej.slice(0,2).join('｜')+'　'+R.stops.join(' ')+'　'+R.order.join(' → '));
const before=(o,a,b)=>o.indexOf(a)>=0&&o.indexOf(b)>=0&&o.indexOf(a)<o.indexOf(b);
(async()=>{
  // ---- (a) 2030 一試的門檻：和 2029 同一套 ----
  check('a. PG.tier(2030,…)：0、11＝none；12、15＝lawyer；16、20＝both（和 2029 一樣）',['none','none','lawyer','lawyer','both','both'].every((w,i)=>PG.tier(2030,[0,11,12,15,16,20][i])===w&&PG.tier(2029,[0,11,12,15,16,20][i])===w),
    [0,11,12,15,16,20].map(k=>k+':'+PG.tier(2030,k)).join(' '));
  const y30=async(k,flags)=>{ const G=H.fresh('2030-08-03',8,'dorm',Object.assign({FIRST_DAY_SEEN:true},flags||RETAKER)); graduated(G); PG.rec(G).done.first=1;   /* [前置] 第一份工作演過（10/1 那一段不擋 10/19）*/ const s=PG.due(G); const qs=PG.draw(G,2030); H.picks=answerK(qs,k); if(s) await PG.runStep(GM,s);
    H.at('2030-09-06',15.1); H.said=[]; const r=PG.due(G); if(r) await PG.runStep(GM,r); const sys=H.said.map(x=>x.t);
    H.at('2030-10-19',8.5); const e2=PG.due(G); return {G,s,r,e2,sys}; };
  for(const k of [0,11]){ const {G,s,r,e2,sys}=await y30(k);
    check('a. 2029 沒過的重考、2030 一試答對 '+k+' 題：放榜「律師、司法官一試：未通過。」＋暫定那一句、BAR_STAGE_2030 none、10/19 沒有二試',s&&s.id==='exam_2030'&&r&&r.id==='r1_2030'&&G.flags.BAR_SCORE_2030===k&&G.flags.BAR_STAGE_2030==='none'&&sys.includes('律師、司法官一試：未通過。')&&sys.includes(LT.fail2030)&&!(e2&&/^e2/.test(e2.id)),
      JSON.stringify([s&&s.id,r&&r.id,G.flags.BAR_STAGE_2030,sys,e2&&e2.id]));
    H.at('2030-12-13',15.2); const r2=PG.due(G); check('a. '+k+' 題：12/13 沒有二試放榜、沒有 BAR_YEAR',!(r2&&/^r2/.test(r2.id))&&G.flags.BAR_YEAR==null&&!PG.byId('r2_2030').cond(G)); }
  { const {G,e2,sys}=await y30(12); check('a. 12 題＝「律師一試：通過。司法官一試：未通過。」、10/19 律師二試',G.flags.BAR_STAGE_2030==='lawyer'&&sys.includes('律師一試：通過。司法官一試：未通過。')&&!sys.includes(LT.fail2030)&&e2&&e2.id==='e2a_2030'); }
  { const {G,e2,sys}=await y30(16); check('a. 16 題＝「律師、司法官一試：通過。」（both）',G.flags.BAR_STAGE_2030==='both'&&sys.includes('律師、司法官一試：通過。')&&e2&&e2.id==='e2a_2030'); }
  { const {G,sys}=await y30(0,{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true}); check('a. 交換延畢第一次考（2030）0 題＝一樣沒過（不再保底）',G.flags.BAR_STAGE_2030==='none'&&sys.includes('律師、司法官一試：未通過。')); }
  // ---- (b) 2030 沒過 → 2031 考上 ----
  { const R=await sim('2030-08-02',22,RETAKER,{2030:3,2031:13}); const {G,order}=R; okRun('b. 2030 答 3 題、2031 答 13 題',R);
    check('b. 順序：2030 一試 → 放榜 → 第一份工作 → 2031 報名 → 一試 → 放榜 → 二試兩天 → 12/12 放榜 → 尾聲；2030 沒有二試',
      ['exam_2030','r1_2030','first','reg_2031','exam_2031','r1_2031','e2a_2031','e2b_2031','r2_2031','epi'].every((id,i,a)=>i===0||before(order,a[i-1],id))&&!order.includes('e2a_2030')&&!order.includes('reg_2032'),order.join(' → '));
    check('b. BAR_REG_2031、BAR_SCORE_2031＝13、BAR_STAGE_2031 lawyer、BAR_YEAR 2031',G.flags.BAR_REG_2031===true&&G.flags.BAR_SCORE_2031===13&&G.flags.BAR_STAGE_2031==='lawyer'&&G.flags.BAR_YEAR===2031);
    check('b. 2031 報名那晚：年份字卡（暫定字）、報名的系統字',H.cards.some(c=>c[0]===LT.card[2031][0])&&(G.msgs||[]).some(m=>m.tag==='pg_reg_sys_2031'));
    const X=PG.rec(G).exam, s29=new Set(X[2029]?X[2029].qs:[]), s30=new Set(X[2030].qs), q31=X[2031].qs;
    check('b. 2031 一試真的作答 20 題（換一組，和 2030 不重複）',q31.length===20&&new Set(q31).size===20&&q31.every(id=>!s30.has(id)&&!s29.has(id))&&Array.isArray(X[2031].ans)&&X[2031].ans.length===20);
    check('b. 放榜訊息：12/12 系統字「律師二試：錄取。」進手機、暫定那一句',(G.msgs||[]).some(m=>m.tag==='pg_r2sys_2031'&&m.text==='律師二試：錄取。')&&H.has(LT.r2pass[2031]));
    check('b. 尾聲：律師家族（傾向 A＝A_bar「我在法扶。這禮拜開了三個庭。」）、阿凱「……喔對，你現在是律師。」、多一句 2031 拿到證書（暫定字）',PG.path(G)==='A_bar'&&H.has('我在法扶。這禮拜開了三個庭。')&&H.has('……喔對，你現在是律師。')&&H.has(LT.epi.pass[2031])&&!H.has(LT.epi.none)&&!H.has(LT.epi.stop));
    check('b. 2030-12-13 阿哲群組：2030 沒過＝不是「我們兩個都上了 宵夜走」',!H.msgs('g:noodle_team').includes('我們兩個都上了 宵夜走')&&H.msgs('g:noodle_team').includes('國考上了'),JSON.stringify(H.msgs('g:noodle_team').slice(-6))); }
  // ---- (c) 2031～2033 都沒過 ＝ 兩邊都沒上 ----
  { const R=await sim('2030-08-02',22,RETAKER,{2030:0,2031:0,2032:11,2033:4}); const {G,order}=R; okRun('c. 2030～2033 都沒過',R);
    check('c. 每一年都有報名、一試、放榜，沒有二試；2033 之後沒有下一年；最後是尾聲',[2031,2032,2033].every(y=>before(order,'reg_'+y,'exam_'+y)&&before(order,'exam_'+y,'r1_'+y)&&!order.includes('e2a_'+y))&&before(order,'r1_2033','epi')&&!order.some(id=>/2034/.test(id)),order.join(' → '));
    check('c. 沒有 BAR_YEAR；每年的分數照實際作答（0、11、4）',G.flags.BAR_YEAR==null&&G.flags.BAR_SCORE_2031===0&&G.flags.BAR_SCORE_2032===11&&G.flags.BAR_SCORE_2033===4&&G.flags.BAR_STAGE_2033==='none');
    check('c. 放榜那一句（暫定字）：2030（fail2030）、2031、2032、2033 各一句；2033 的系統字進手機',H.said.filter(x=>x.t===LT.fail2030).length===1&&[2031,2032,2033].every(y=>H.said.filter(x=>x.t===LT.r1none[y]).length===1)&&(G.msgs||[]).some(m=>m.tag==='pg_r1sys_2033'&&m.text==='律師、司法官一試：未通過。'));
    check('c. 尾聲：落點照舊（傾向 A、沒有執照＝A_none「我在 NGO 做法律服務。…」）＋「兩邊都沒上」那一句（暫定字）；不是失敗結局、照常回標題',PG.path(G)==='A_none'&&H.has('我在 NGO 做法律服務。不用執照的那一半，我做。')&&H.has(LT.epi.none)&&!H.has(LT.epi.stop)&&!H.has('……喔對，你現在是律師。'));
    check('c. 尾聲的時間 2034-06-03 19:00、在 2033 那一輪以後',G.day===PG.DK('2034-06-03')&&PG.done(G,'r1_2033')); }
  // ---- (d) 中途不報名＝停止 ----
  { const R=await sim('2030-08-02',22,RETAKER,{2030:5,2031:8,reg:{2032:false}}); const {G,order}=R; okRun('d. 2032 選不報名',R);
    check('d. 2031 照考；2032 報名選「不報名」＝BAR_REG_2032 false、沒有 2032 一試、沒有 2033 報名',order.includes('exam_2031')&&order.includes('reg_2032')&&G.flags.BAR_REG_2032===false&&!order.includes('exam_2032')&&!order.includes('reg_2033')&&before(order,'reg_2032','epi'),order.join(' → '));
    check('d. 不報名那一句（暫定字）；尾聲「中途不考了」那一句（暫定字）',H.has(LT.stop[2032])&&H.has(LT.epi.stop)&&!H.has(LT.epi.none)&&G.flags.BAR_YEAR==null); }
  { const R=await sim('2030-08-02',22,RETAKER,{2030:5,reg:{2031:false}}); const {G,order}=R; okRun('d. 2031 就不報名',R);
    check('d. 2031 不報名：之後一年都不再問',G.flags.BAR_REG_2031===false&&!order.some(id=>/^(exam|reg)_203[23]|exam_2031/.test(id)),order.join(' → ')); }
  { const G=H.fresh('2031-05-08',20.9,'dorm',Object.assign({},RETAKER,{BAR_SIT_2030:true,BAR_SCORE_2030:4,FIRST_DAY_SEEN:true})); graduated(G); for(const k of ['first','exam_2030','r1_2030']) PG.rec(G).done[k]=1;
    check('d. 報名那晚（5/8 21:00～5/10 00:00）時間到了：等報名、尾聲的條件不成立（pendingExam）',PG.pendingExam(G)&&!PG.byId('epi').cond(G));
    H.at('2031-05-10',0.5); PG.pending(G); check('d. 報名那晚一直沒空（時間過了）＝不報名（BAR_REG_2031 false），尾聲不卡',G.flags.BAR_REG_2031===false&&PG.rec(G).done.reg_2031==='missed'&&!PG.pendingExam(G)); }
  { const G=H.fresh('2031-08-04',7,'dorm',Object.assign({},RETAKER,{BAR_SIT_2030:true,BAR_SCORE_2030:4,BAR_REG_2031:true,FIRST_DAY_SEEN:true})); graduated(G); for(const k of ['first','exam_2030','r1_2030','reg_2031']) PG.rec(G).done[k]=1;
    PG.pending(G); check('d. 2031 一試錯過（8/3 06:00 以後才讀檔）＝那一年沒考：不卡尾聲、不再問 2032',PG.rec(G).done.exam_2031==='missed'&&!PG.pendingExam(G)&&!PG.lateAsk(G,2032)&&PG.lateEpi(G)===LT.epi.stop); }
  // ---- (e) 舊存檔 ----
  { const G=H.fresh('2031-05-08',21,'dorm',Object.assign({},RETAKER,{BAR_SIT_2030:true,BAR_SCORE_2030:3,BAR_STAGE_2030:'lawyer',BAR_YEAR:2030,FIRST_DAY_SEEN:true})); graduated(G); for(const k of ['first','exam_2030','r1_2030','e2a_2030','e2b_2030','r2_2030']) PG.rec(G).done[k]=1;
    check('e. 舊存檔（舊規則保底拿到的）BAR_YEAR 2030＋BAR_STAGE_2030 lawyer（3 題）：保留，不問 2031、尾聲沒有多的那一句',G.flags.BAR_YEAR===2030&&PG.stage(G,2030)==='lawyer'&&!PG.lateAsk(G,2031)&&!PG.due(G)&&!PG.pendingExam(G)&&PG.lateEpi(G)==null&&PG.path(G)==='A_bar'); }
  { const G=H.fresh('2030-10-19',8.5,'dorm',Object.assign({},RETAKER,{BAR_SIT_2030:true,BAR_SCORE_2030:6,BAR_STAGE_2030:'lawyer',FIRST_DAY_SEEN:true})); graduated(G); for(const k of ['exam_2030','r1_2030','first']) PG.rec(G).done[k]=1;
    const e=PG.due(G); check('e. 舊存檔：9/6 已經照舊規則放榜（記了 BAR_STAGE_2030 lawyer、6 題）＝不收回，10/19 照考律師二試',e&&e.id==='e2a_2030'&&PG.stage2(G,2030)); }
  { const G=H.fresh('2030-09-06',15.1,'dorm',Object.assign({},RETAKER,{BAR_SIT_2030:true,BAR_SCORE_2030:6})); graduated(G); PG.rec(G).done.exam_2030=1; PG.rec(G).exam={2030:{qs:[]}};
    H.said=[]; const r=PG.due(G); if(r) await PG.runStep(GM,r);
    check('e. 舊存檔：一試考完、還沒放榜（6 題、沒有 BAR_STAGE_2030）＝照新門檻 none',r&&r.id==='r1_2030'&&G.flags.BAR_STAGE_2030==='none'&&H.has('律師、司法官一試：未通過。')); }
  { const G=H.fresh('2030-08-03',8,'dorm',Object.assign({},RETAKER)); graduated(G);
    check('e. 舊存檔：還在 2030 一試以前＝照新門檻（PG.tier 沒有 2030 例外）',PG.due(G)&&PG.due(G).id==='exam_2030'&&PG.tier(2030,9)==='none'); }
  // ---- (f) 2030-09-01～2034-06-04 每一天：2031～2033 的停點、手機規則、床的選項不丟例外 ----
  { const G=H.fresh('2030-09-01',0.5,'dorm',Object.assign({},RETAKER,{BAR_SIT_2030:true,BAR_SCORE_2030:4,BAR_REG_2031:true,BAR_SIT_2031:true,BAR_SCORE_2031:2,FIRST_DAY_SEEN:true})); graduated(G);
    FRIENDS.forEach(H.FRIEND); H.FRIEND('kexin'); H.date('kexin'); PHONE.join(G,'noodle_team','麵店團'); PHONE.join(G,'home','家人'); warns.length=0;
    const d0=PG.DK('2030-09-01'), d1=PG.DK('2034-06-04'), HOURS=[0.5,8,15.1,21]; let errs=[], stopsIn=new Set(), off=[];
    for(let d=d0; d<=d1; d++) for(const h of HOURS){ PG.setT(G,H.E,d,h); H.E.player.busy=false;
      try{ STORY.tick(GM,0.5); PHONE.tick(G); PG.rules(GM); const t=PG.nextStop(G); if(t!=null) stopsIn.add(PG.dateLabel(Math.floor(t/24),t%24)); PG.due(G); PG.pending(G); STORY.bedOptions(G); PG.bedOptions(G); PG.cardLine(G,d-3,d); }
      catch(e){ errs.push(PG.dateLabel(d,h)+' '+(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); }
      if(d<PG.DK('2034-06-03')&&!PG.on(G)) off.push(PG.dateLabel(d,h)); }
    await new Promise(r=>setTimeout(r,30));
    check('f. 2030-09-01～2034-06-04 每天四個時間：STORY.tick、手機規則、PG 的停點、床、日期卡都不丟例外、沒有警告',!errs.length&&!warns.length,errs.slice(0,3).join('｜')+warns.slice(0,3).join('｜'));
    check('f. 一直到尾聲那天都是畢業後篇（PG.on）',!off.length,off.slice(0,3).join('、'));
    check('f. 2031 一試（8/2 08:00）、2032 報名（5/13 21:00）在停點裡出現過',[...stopsIn].some(x=>x.startsWith('5/13（四）21:00'))&&[...stopsIn].some(x=>x.startsWith('8/2（六）08:00')),[...stopsIn].filter(x=>/^(5|8)\//.test(x)).slice(0,8).join(' ')); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

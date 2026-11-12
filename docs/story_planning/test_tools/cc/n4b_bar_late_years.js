// CC N4b：國考年份與門檻（2a36d3446「取消 2030 保底、可以考到 2033」）獨立驗證。唯讀、不開瀏覽器、不改遊戲檔。
// 用法：nice -n 19 node n4b_bar_late_years.js [工作樹路徑]
//   工作樹＝含 src/、tests/pg_harness.js 的資料夾（預設環境變數 WT）。對照修改前：
//     mkdir <dir> && cd /home/user/Lawstudent && git archive 188412f3b src tests index.html | tar -x -C <dir>
//     nice -n 19 node n4b_bar_late_years.js <dir>      ← 項目 1、2（還有 3、4 的新功能）應該 FAIL
// 做法：用 tests/pg_harness.js 載入遊戲系統（假的 GM），從【前置】存檔（2029 一試 5 題沒過＝重考生、已畢業、2030-08-02 22:00）開始，
//   只用遊戲自己的「下一件事」機制推時間（OUT.due/OUT.tick、PG.due/PG.runStep、PG.sleepJump、PG.advance），一路到 2034-06-03 尾聲。
//   一試真的作答（照計畫答對 k 題）、報名問題照計畫選；不直接寫 BAR_STAGE／BAR_YEAR。每一個場景記下開始的遊戲時間、那一場的旁白／系統字、字卡、手機系統訊息。
//   日期另外用 JS Date（UTC）獨立算星期幾，和 PG.Y 與遊戲的 dateLabel 互相比對。
//   「時間過了沒回答」＝報名那一晚玩家一直在別的地方（模擬：時間直接放到報名截止以後，標【模擬錯過】），之後照常用遊戲機制推。
'use strict';
const path=require('path');
const WT=path.resolve(process.argv[2]||process.env.WT||process.cwd());
const H=require(WT+'/tests/pg_harness.js');
const {GM}=H, J=JSON.stringify; GM.spawnCharacter=()=>null;
const warns=[]; console.warn=(...a)=>warns.push(a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,2).join(' / '):String(x)).join(' '));
const rej=[]; process.on('unhandledRejection',e=>rej.push(String(e&&e.stack||e)));
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info&&!ok?'\n      '+info:(info&&process.env.V?'　'+info:''))); if(!ok) fails++; };
const LT=(POSTGRAD_LINES.LATE)||{}; const L=POSTGRAD_LINES;
const LATE_YEARS=PG.LATE_YEARS||[];
console.log('工作樹',WT,' PG.LATE_YEARS=',J(PG.LATE_YEARS),' LATE 文案',!!POSTGRAD_LINES.LATE);
const WDN=['日','一','二','三','四','五','六'];
const dateOfDay=day=>{ /* 獨立：從 PG.DK('2030-01-01') 推回日曆（不用 CALENDAR.dateOf）*/ const base=PG.DK('2030-01-01'); const t=Date.UTC(2030,0,1)+(day-base)*86400000; const d=new Date(t); return {y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate(),wd:d.getUTCDay()}; };
const fmt=(day,h)=>{ const D=dateOfDay(day), m=Math.round(h*60); return D.y+'-'+String(D.m).padStart(2,'0')+'-'+String(D.d).padStart(2,'0')+'（'+WDN[D.wd]+'）'+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; if(G.flags.MOVED_OUT==null) G.flags.MOVED_OUT=PG.DK('2029-06-28'); };
const RETAKER={BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none',LAWCLUB_SAT_VISITS:10};   /* 【前置】2029 一試 5 題沒過 */
const FRIENDS=['zhe','yu','classmate_bohan','heroine_01','heroine_03'];
const isYearStep=id=>/^(reg|exam|r1|e2a|e2b|r2)_(\d{4})$/.exec(id);

/* plan：{2030:k, 2031:k, …, reg:{2032:'no'|'miss'}}。setup(G)：額外的【前置】。start：[日期, 時] */
async function sim(plan,o){ o=o||{}; const st=o.start||['2030-08-02',22];
  const G=o.G||H.fresh(st[0],st[1],'dorm',Object.assign({},RETAKER,o.flags||{})); if(!o.G){ graduated(G); FRIENDS.forEach(H.FRIEND); PHONE.join(G,'noodle_team','桌遊團'); PHONE.join(G,'home','家人'); }
  if(o.setup) o.setup(G);
  warns.length=0; rej.length=0; const log=[]; let it=0, err=null, mono=true, stuck=null;
  const orun=PG.runStep;
  PG.runStep=async function(gm,s){ const m=isYearStep(s.id); const done0=PG.done(G,s.id);
    if(m&&!done0&&m[1]==='reg'&&plan.reg&&plan.reg[+m[2]]==='miss'){   /* 【模擬錯過】報名那一晚玩家一直在別的地方：不演，時間放到截止以後，讓遊戲自己記 missed */
      const u=s.until(G)+0.5, d=Math.floor(u/24); PG.setT(G,H.E,d,u-d*24); PG.pending(G); log.push({id:'(錯過)'+s.id,day:d,h:u-d*24,when:fmt(d,u-d*24),said:[],cards:[],sys:[]}); return false; }
    if(m&&!done0){ const y=+m[2]; if(m[1]==='exam') H.picks=answerK(PG.draw(G,y),plan[y]|0); if(m[1]==='reg') H.picks=[(plan.reg&&plan.reg[y]==='no')?'不報名':'報名']; }
    const t0={day:G.day,h:G.hour}, s0=H.said.length, c0=H.cards.length, m0=(G.msgs||[]).length;
    const r=await orun.call(PG,gm,s); if(m) H.picks=[];
    if(r) log.push({id:s.id,day:t0.day,h:t0.h,when:fmt(t0.day,t0.h),end:fmt(G.day,G.hour),label:PG.dateLabel(t0.day,t0.h),said:H.said.slice(s0).map(x=>x.t).filter(t=>!/^\d+／\d+　/.test(t)),qn:H.said.slice(s0).filter(x=>/^\d+／\d+　/.test(x.t)).length,cards:H.cards.slice(c0),sys:(G.msgs||[]).slice(m0).filter(x=>x.th==='sys').map(x=>x.text)});
    return r; };
  try{ for(it=0; it<400&&!G.flags.EPILOGUE_DONE; it++){ const before=G.day*24+G.hour;
      /* 【模擬錯過】報名那一晚一直沒空：時間放到截止以後 */
      const due=PG.due(G); const mm=due&&/^reg_(\d{4})$/.exec(due.id);
      if(mm&&plan.reg&&plan.reg[+mm[1]]==='miss'){ const y=+mm[1]; const u=due.until(G)+0.5, d=Math.floor(u/24); PG.setT(G,H.E,d,u-d*24); PG.pending(G); log.push({id:'(錯過)reg_'+y,day:d,h:u-d*24,when:fmt(d,u-d*24),said:[],cards:[],sys:[]}); continue; }
      if(OUT.due(G)){ H.picks=[0]; await OUT.tick(GM); H.picks=[]; }
      else if(due) await PG.runStep(GM,due);
      else if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)){ if(!await PG.sleepJump(GM)){ const t0=G.day*24+G.hour; await HOME.sleep(GM); if(G.day*24+G.hour<=t0){ stuck='sleep '+fmt(G.day,G.hour); break; } } }
      else if(!await PG.advance(GM)){ stuck='沒有下一件事 '+fmt(G.day,G.hour); break; }
      if(G.day*24+G.hour<before-1e-6) mono=false; }
  }catch(e){ err=e; } finally { PG.runStep=orun; }
  await new Promise(r=>setTimeout(r,30));
  return {G,log,ids:log.map(x=>x.id),it,err,mono,stuck,warns:warns.slice(),rej:rej.slice()}; }
const okRun=(n,R)=>check(n+'：不丟例外、沒有警告、時間只往前、尾聲演完（EPILOGUE_DONE，'+R.it+' 次）',!R.err&&!R.warns.length&&!R.rej.length&&R.mono&&R.G.flags.EPILOGUE_DONE===true&&!R.stuck,
  [R.err&&R.err.stack,R.warns.slice(0,3).join('｜'),R.rej.slice(0,2).join('｜'),R.stuck,R.ids.join(' → ')].filter(Boolean).join('　'));
const said=R=>[].concat(...R.log.map(x=>x.said));
const step=(R,id)=>R.log.find(x=>x.id===id);
const yearSteps=y=>['reg_'+y,'exam_'+y,'r1_'+y,'e2a_'+y,'e2b_'+y,'r2_'+y];
/* 期望的日期規格（任務說明）：月、星期幾、時刻 */
const SPEC={reg:{m:5,wd:4,h:21},exam:{m:8,wd:6,h:8},r1:{m:9,wd:5,h:15+5/60},e2a:{m:10,wd:6,h:8.5},e2b:{m:10,wd:0,h:17.5},r2:{m:12,wd:5,h:15+5/60}};
const printYear=(R,y)=>{ for(const x of R.log.filter(x=>new RegExp('_'+y+'$').test(x.id))){ console.log('    '+x.id.padEnd(10)+x.when+'　遊戲顯示 '+(x.label||'')+(x.cards.length?'　字卡 '+J(x.cards):'')+(x.sys.length?'　手機系統 '+J(x.sys):'')+(x.qn?'　出題 '+x.qn+' 題':'')); if(x.said.length) console.log('              旁白／系統字 '+J(x.said)); } };

(async()=>{
  // ===== 0. 日期表（PG.Y）獨立核對 =====
  console.log('\n== 0. 日期表 PG.Y（JS Date 獨立算星期）==');
  for(const y of [2030,2031,2032,2033]){ const K=PG.Y&&PG.Y[y]; if(!K){ check('0. PG.Y['+y+'] 存在',false); continue; }
    const row=[]; let ok=true;
    for(const k of ['reg','exam','r1','e2a','e2b','r2']){ if(!K[k]){ if(y>2030||k!=='reg'){ ok=false; row.push(k+':缺'); } continue; } const [Y,M,D]=K[k].split('-').map(Number), wd=new Date(Date.UTC(Y,M-1,D)).getUTCDay(); row.push(k+' '+K[k]+'（'+WDN[wd]+'）'); if(Y!==y||M!==SPEC[k].m||wd!==SPEC[k].wd) ok=false; }
    if(y>2030&&K.e2a&&K.e2b&&PG.DK(K.e2b)-PG.DK(K.e2a)!==1) ok=false;
    console.log('  '+y+'　'+row.join('　')); if(y>2030) check('0. '+y+' 的日期：報名 5 月週四、一試 8 月週六、放榜 9 月週五、二試 10 月週六＋隔天週日、二試放榜 12 月週五',ok,row.join(' ')); }

  // ===== 1. 2030 門檻（玩家流程：2030-08-02 22:00 起）=====
  console.log('\n== 1. 2030 一試門檻 ==');
  for(const k of [0,11,12,16]){ const plan={2030:k,2031:k,2032:k,2033:k}; const R=await sim(plan); const F=R.G.flags, x=step(R,'r1_2030');
    const want=k>=16?'both':(k>=12?'lawyer':'none');
    console.log('  2030 答對 '+k+'：'+R.ids.filter(i=>/2030|first|epi/.test(i)).join(' → ')+'　r1 '+(x?x.when+' '+J(x.said):'-')+'　BAR_STAGE_2030='+F.BAR_STAGE_2030+' BAR_YEAR='+F.BAR_YEAR);
    okRun('1. 2030 答對 '+k,R);
    check('1. 2030 答對 '+k+' 題：實際作答 20 題、BAR_SCORE_2030='+k+'、放榜 BAR_STAGE_2030='+want,step(R,'exam_2030')&&step(R,'exam_2030').qn===20&&F.BAR_SCORE_2030===k&&F.BAR_STAGE_2030===want,J({qn:step(R,'exam_2030')&&step(R,'exam_2030').qn,score:F.BAR_SCORE_2030,stage:F.BAR_STAGE_2030}));
    const sys={none:'律師、司法官一試：未通過。',lawyer:'律師一試：通過。司法官一試：未通過。',both:'律師、司法官一試：通過。'}[want];
    check('1. 2030 答對 '+k+' 題：放榜系統字「'+sys+'」（畫面＋手機）',!!x&&x.said.includes(sys)&&x.sys.includes(sys),x&&J([x.said,x.sys]));
    if(want==='none'){
      check('1. 2030 答對 '+k+' 題：沒有 10 月二試、沒有 12 月二試放榜、這一年沒有 BAR_YEAR',!R.ids.some(i=>/^(e2a|e2b|r2)_2030$/.test(i))&&F.BAR_YEAR!==2030,R.ids.join(' → '));
      check('1. 2030 答對 '+k+' 題：放榜後那一句（LATE.fail2030）',!!x&&!!LT.fail2030&&x.said.includes(LT.fail2030),x&&J(x.said));
    } else {
      const ok=['e2a_2030','e2b_2030','r2_2030'].every(i=>R.ids.includes(i))&&F.BAR_YEAR===2030;
      check('1. 2030 答對 '+k+' 題：10/19、10/20 律師二試、12/13 放榜錄取、BAR_YEAR=2030；之後不再有 2031 報名',ok&&!R.ids.some(i=>/_203[123]$/.test(i)),R.ids.join(' → '));
      const r2=step(R,'r2_2030'); check('1. 2030 答對 '+k+' 題：12/13 放榜字'+(want==='both'?'（含「司法官二試：未錄取。」）':''),!!r2&&r2.said.includes('律師二試：錄取。')&&(want!=='both'||r2.said.includes('司法官二試：未錄取。')),r2&&J(r2.said));
    } }

  // ===== 2＋4. 2031～2033 每年一輪；一路沒過＝兩邊都沒上 =====
  console.log('\n== 2. 2030 沒過 → 2031～2033 每年（0、0、11、4 題，都沒過）==');
  const RN=await sim({2030:0,2031:0,2032:11,2033:4});
  okRun('2. 2030～2033 都沒過',RN);
  for(const y of LATE_YEARS.length?LATE_YEARS:[2031,2032,2033]){ console.log('  --- '+y+' ---'); printYear(RN,y);
    const got=['reg','exam','r1'].map(k=>step(RN,k+'_'+y));
    const bad=[]; ['reg','exam','r1'].forEach((k,i)=>{ const x=got[i]; if(!x){ bad.push(k+' 沒有觸發'); return; } const D=dateOfDay(x.day), want=PG.Y&&PG.Y[y]&&PG.Y[y][k];
      if(D.m!==SPEC[k].m||D.wd!==SPEC[k].wd||Math.abs(x.h-SPEC[k].h)>1e-6) bad.push(k+' '+x.when+' 不符規格（'+SPEC[k].m+' 月 星期'+WDN[SPEC[k].wd]+'）');
      if(want&&PG.DK(want)!==x.day) bad.push(k+' 實際 '+x.when+' ≠ 日期表 '+want);
      if(x.label&&!x.label.includes('（'+WDN[D.wd]+'）')) bad.push(k+' 遊戲顯示的星期 '+x.label+' ≠ '+WDN[D.wd]); });
    check('2. '+y+'：報名、一試、一試放榜都觸發，日期時間＝日期表＝規格（星期幾一致）',!bad.length,bad.join('；'));
    const rg=got[0], ex=got[1], r1=got[2];
    check('2. '+y+' 報名：年份字卡「'+(LT.card&&LT.card[y]&&LT.card[y][0])+'」＋「'+L.REG.text+'」＋手機系統訊息',!!rg&&!!LT.card&&rg.cards.some(c=>c[0]===LT.card[y][0])&&rg.said.includes(L.REG.text)&&rg.sys.includes(L.REG.text),rg&&J([rg.cards,rg.said,rg.sys]));
    check('2. '+y+' 一試：考場字卡、真的出 20 題、交卷；分數照作答（BAR_SCORE_'+y+'='+({2031:0,2032:11,2033:4}[y])+'）',!!ex&&ex.qn===20&&ex.said.includes('交卷。')&&ex.cards.some(c=>c[0]===L.EXAM.card)&&RN.G.flags['BAR_SCORE_'+y]==={2031:0,2032:11,2033:4}[y],ex&&J({qn:ex.qn,cards:ex.cards,score:RN.G.flags['BAR_SCORE_'+y]}));
    check('2. '+y+' 一試放榜：「律師、司法官一試：未通過。」＋ LATE.r1none['+y+']；沒有二試',!!r1&&r1.said.includes('律師、司法官一試：未通過。')&&!!LT.r1none&&r1.said.includes(LT.r1none[y])&&!RN.ids.some(i=>i==='e2a_'+y||i==='r2_'+y),r1&&J(r1.said));
    const X=PG.rec(RN.G).exam||{}, prev=new Set([].concat(...Object.keys(X).filter(k=>+k<y).map(k=>X[k].qs||[])));
    check('2. '+y+' 一試的 20 題不和前幾年重複',!!X[y]&&X[y].qs.length===20&&X[y].qs.every(q=>!prev.has(q)),X[y]&&J(X[y].qs)); }
  check('4. 一路考到 2033 都沒過：BAR_YEAR 沒有；尾聲有「兩邊都沒上」（LATE.epi.none），沒有 stop／pass 那句',RN.G.flags.BAR_YEAR==null&&!!LT.epi&&said(RN).includes(LT.epi.none)&&!said(RN).includes(LT.epi.stop),J({BAR_YEAR:RN.G.flags.BAR_YEAR}));
  { const e=step(RN,'epi'); check('6. 尾聲演完時遊戲時間在 2034-06-03（六）19:00 以後，在 r1_2033 之後；之後沒有 2034 的國考步驟',!!e&&e.end>='2034-06-03（六）19:00'&&e.end.startsWith('2034-06-03')&&RN.ids.indexOf('r1_2033')>=0&&RN.ids.indexOf('r1_2033')<RN.ids.indexOf('epi')&&!RN.ids.some(i=>/2034$/.test(i)),e&&[e.when,e.end]); console.log('  尾聲：從 '+(e&&e.when)+' 呼叫，演完時 '+(e&&e.end)); }
  { const lines=said(RN).filter(t=>/^（/.test(t)&&RN.log.some(x=>/_(203[0-3])$/.test(x.id)&&x.said.includes(t))); console.log('  2030～2033 國考步驟裡的旁白：'+J([...new Set(lines)]));
    const ph=(RN.G.msgs||[]).filter(m=>m.day>=PG.DK('2031-01-01')&&m.day<PG.DK('2034-01-01')).map(m=>fmt(m.day,m.h||0)+' '+(m.th)+' '+(m.text||'').slice(0,30)); console.log('  2031～2033 手機訊息 '+ph.length+' 則：'+J(ph.slice(0,40))); }

  // 二試放榜（2031／2032／2033 各自考上）
  console.log('\n== 2／4. 各自考上 ==');
  for(const [y,k] of [[2031,12],[2032,16],[2033,13]]){ const plan={2030:3,2031:5,2032:5,2033:5}; plan[y]=k; const R=await sim(plan); okRun('4. '+y+' 答對 '+k+' 考上',R);
    console.log('  --- '+y+' 考上（答對 '+k+'）---'); printYear(R,y);
    const bad=[]; for(const s of ['reg','exam','r1','e2a','e2b','r2']){ const x=step(R,s+'_'+y); if(!x){ bad.push(s+' 沒有'); continue; } const D=dateOfDay(x.day); if(D.m!==SPEC[s].m||D.wd!==SPEC[s].wd||Math.abs(x.h-SPEC[s].h)>1e-6||(PG.Y[y]&&PG.DK(PG.Y[y][s])!==x.day)) bad.push(s+' '+x.when); }
    check('2. '+y+' 考上那年：報名→一試→放榜→二試兩天→二試放榜六步都照日期表與規格（星期幾）',!bad.length,bad.join('；'));
    const want=k>=16?'both':'lawyer', F=R.G.flags, r2=step(R,'r2_'+y);
    check('2. '+y+'：BAR_STAGE_'+y+'='+want+'、二試放榜「律師二試：錄取。」＋ LATE.r2pass、BAR_YEAR='+y,F['BAR_STAGE_'+y]===want&&F.BAR_YEAR===y&&!!r2&&r2.said.includes('律師二試：錄取。')&&!!LT.r2pass&&r2.said.includes(LT.r2pass[y])&&(want!=='both'||r2.said.includes('司法官二試：未錄取。')),J({stage:F['BAR_STAGE_'+y],BAR_YEAR:F.BAR_YEAR,r2:r2&&r2.said}));
    check('4. '+y+' 考上：之後的年份不再報名／考試；尾聲有 LATE.epi.pass['+y+']，沒有 none／stop',!R.ids.some(i=>{ const m=isYearStep(i); return m&&+m[2]>y; })&&!!LT.epi&&said(R).includes(LT.epi.pass[y])&&!said(R).includes(LT.epi.none)&&!said(R).includes(LT.epi.stop),R.ids.join(' → ')); }

  // ===== 3. 不報名／沒回答＝停 =====
  console.log('\n== 3. 不報名 ==');
  for(const [y,how] of [[2031,'no'],[2032,'no'],[2033,'no'],[2031,'miss'],[2032,'miss']]){ const plan={2030:2,2031:2,2032:2,2033:2,reg:{[y]:how}}; const R=await sim(plan); okRun('3. '+y+(how==='no'?' 選不報名':' 報名那晚沒回答【模擬錯過】'),R);
    const F=R.G.flags, rg=step(R,'reg_'+y);
    const after=R.ids.filter(i=>{ const m=isYearStep(i); return m&&(+m[2]>y||(+m[2]===y&&m[1]!=='reg')); });
    const lateSys=(R.G.msgs||[]).filter(m=>m.th==='sys'&&/^pg_(reg|r1|r2)sys_(\d{4})$/.test(m.tag||'')&&+m.tag.slice(-4)>=y&&!(m.tag==='pg_reg_sys_'+y&&how==='no'));
    console.log('  '+y+' '+how+'：'+R.ids.filter(i=>/_203[1-3]$|epi/.test(i)).join(' → ')+'　BAR_REG_'+y+'='+F['BAR_REG_'+y]);
    check('3. '+y+' '+how+'：BAR_REG_'+y+'=false；之後不再問、不再考（沒有之後年份的報名／一試、沒有對應手機系統訊息）',F['BAR_REG_'+y]===false&&!after.length&&!lateSys.length,J({after,lateSys:lateSys.map(m=>m.tag)}));
    if(how==='no') check('3. '+y+' 選不報名：那一句 LATE.stop['+y+']',!!rg&&!!LT.stop&&rg.said.includes(LT.stop[y]),rg&&J(rg.said));
    check('3. '+y+' '+how+'：尾聲用 stop 那句（LATE.epi.stop），沒有 none／pass',!!LT.epi&&said(R).includes(LT.epi.stop)&&!said(R).includes(LT.epi.none),J(said(R).filter(t=>/國考|考上|證書/.test(t)))); }

  // ===== 5. 舊存檔 =====
  console.log('\n== 5. 舊存檔 ==');
  const reload=G=>{ const s=JSON.parse(JSON.stringify(G)); H.G=s; SOCIAL.bind(s); EVENTS.bind(GM); INV.rec(s); return s; };   /* 讀檔：序列化再讀回 */
  { /* 5a：舊規則下 2030 一試 3 題就保底進律師二試、12/13 錄取的存檔，2031-03-01 讀進來 */
    const G0=H.fresh('2031-03-01',10,'dorm',Object.assign({},RETAKER,{BAR_SIT_2030:true,BAR_SCORE_2030:3,BAR_STAGE_2030:'lawyer',BAR_YEAR:2030,FIRST_DAY_SEEN:true})); graduated(G0); FRIENDS.forEach(H.FRIEND); PHONE.join(G0,'noodle_team','桌遊團');
    for(const k of ['first','exam_2030','r1_2030','e2a_2030','e2b_2030','r2_2030']) PG.rec(G0).done[k]=1;
    const G=reload(G0); const R=await sim({2031:20,2032:20,2033:20},{G}); okRun('5a. 舊存檔 BAR_YEAR 2030（3 題保底錄取）',R);
    check('5a. 讀進來不收回：BAR_YEAR 仍 2030、BAR_STAGE_2030 仍 lawyer；不問 2031 報名；尾聲沒有 LATE 那幾句',G.flags.BAR_YEAR===2030&&G.flags.BAR_STAGE_2030==='lawyer'&&!R.ids.some(i=>/_203[123]$/.test(i))&&!said(R).some(t=>t===LT.epi?.none||t===LT.epi?.stop),R.ids.join(' → ')); }
  { /* 5b：舊規則下 9/6 已放榜（3 題記成 lawyer），還沒考二試，2030-10-01 讀進來 */
    const G0=H.fresh('2030-09-20',10,'dorm',Object.assign({},RETAKER,{BAR_SIT_2030:true,BAR_SCORE_2030:3,BAR_STAGE_2030:'lawyer'})); graduated(G0); FRIENDS.forEach(H.FRIEND); PHONE.join(G0,'noodle_team','桌遊團');
    for(const k of ['exam_2030','r1_2030']) PG.rec(G0).done[k]=1;
    const G=reload(G0); const R=await sim({2031:20},{G}); okRun('5b. 舊存檔：已放榜 lawyer、未考二試',R);
    check('5b. 已放榜的不收回：10/19 照考律師二試、12/13 錄取、BAR_YEAR 2030',['e2a_2030','e2b_2030','r2_2030'].every(i=>R.ids.includes(i))&&G.flags.BAR_YEAR===2030,R.ids.join(' → ')); }
  { /* 5c：2030 一試考完（6 題）、還沒放榜，2030-08-20 讀進來 → 照新門檻 */
    const G0=H.fresh('2030-08-20',10,'dorm',Object.assign({},RETAKER,{BAR_SIT_2030:true,BAR_SCORE_2030:6})); graduated(G0); FRIENDS.forEach(H.FRIEND); PHONE.join(G0,'noodle_team','桌遊團');
    PG.rec(G0).done.exam_2030=1; PG.rec(G0).exam={2030:{qs:[],ans:[]}};
    const G=reload(G0); const R=await sim({2031:2,2032:2,2033:2},{G}); okRun('5c. 舊存檔：一試考完未放榜（6 題）',R);
    const x=step(R,'r1_2030');
    check('5c. 照新門檻：9/6 放榜「未通過」、BAR_STAGE_2030 none、沒有 2030 二試、接著 2031 報名',!!x&&x.when.startsWith('2030-09-06')&&x.said.includes('律師、司法官一試：未通過。')&&G.flags.BAR_STAGE_2030==='none'&&!R.ids.includes('e2a_2030')&&R.ids.includes('reg_2031'),J({r1:x&&[x.when,x.said],ids:R.ids})); }

  // ===== 6. 2033 一試錯過（讀檔太晚）不卡尾聲 =====
  { const G0=H.fresh('2033-08-07',10,'dorm',Object.assign({},RETAKER,{BAR_SIT_2030:true,BAR_SCORE_2030:1,BAR_STAGE_2030:'none',BAR_REG_2031:true,BAR_SIT_2031:true,BAR_SCORE_2031:1,BAR_STAGE_2031:'none',BAR_REG_2032:true,BAR_SIT_2032:true,BAR_SCORE_2032:1,BAR_STAGE_2032:'none',BAR_REG_2033:true,FIRST_DAY_SEEN:true})); graduated(G0); FRIENDS.forEach(H.FRIEND);
    for(const k of ['first','exam_2030','r1_2030','reg_2031','exam_2031','r1_2031','reg_2032','exam_2032','r1_2032','reg_2033']) PG.rec(G0).done[k]=1;
    const R=await sim({},{G:G0}); okRun('6. 2033 報了名、一試那天錯過（8/7 才讀檔）',R);
    check('6. 一試錯過＝那年沒考，尾聲照演（2034-06-03 19:00）',PG.rec(R.G).done.exam_2033==='missed'&&!!step(R,'epi')&&step(R,'epi').end.startsWith('2034-06-03')&&R.G.flags.EPILOGUE_DONE===true,J({ex:PG.rec(R.G).done.exam_2033,ids:R.ids,epi:step(R,'epi')})); }

  console.log(fails?('\nFAILED '+fails):'\nALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

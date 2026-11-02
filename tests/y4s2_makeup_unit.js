// D118 大四下被當 → 6 月底補考一次（使用者 2026-11-02 05:0x 選擇題 Q4；docs/handoff/D118_PLAN.md 第 10 節）——不需要瀏覽器。src/faildelay3d.js＋classes3d.js／study3d.js
//   a 大四下一門考五題的課被當 → 6/18 不延畢、排補考（6/26 10:00）；6/18～補考之間 PG.delayed 不成立、BAR_REG 不動、日期卡照一般畢業生；補考答對 → 照常畢業、BAR_REG 保持、成績單「及格（補考）」
//   b 補考沒過 → 延畢（FAIL_DELAY、BAR_REG false、延畢那幾句、22:00 阿哲私訊）
//   c 補考那天沒去（11:00 以前沒開始）→ 延畢（旗標當下記好、旁白下一個停點）
//   d 被當的是看出席的課（點名制，沒有考試可以補）→ 照舊 6/18 直接延畢、不排補考（和考試課一起被當也一樣）
//   e 舊存檔（6/18 已經判延畢、沒有 FD_MAKEUP）：讀檔時還在 6/26 09:30 以前、全部是考五題的課、不是交換＝改給補考（BB 08:59 ⑤；BAR_REG 被延畢取消的恢復、通知照發、冪等）；
//     6/26 09:30 以後讀檔、有點名制的課、交換路線＝照舊延畢；已經延畢的存檔 FD.check 不再判
//   f 補考題和期末題不完全相同（題庫 10 題以上＝完全不重複）；同一份存檔重抽是同一份
//   g 補考期間的總複習：6/18～補考前可以總複習補考那一科（學期外 STUDY 原本不開）；讀到一半會錯過補考＝不給
//   h 成績單補考那天以後才發（放假很久才醒來）＝來不及補考，照舊直接延畢
//   i 補考那天人在家：家裡的選單列「出發：補考」，按了就考（BUG-MAKEUP-HOME-1102，修改前 i1、i2 FAIL）
//   j BB 08:59 第二輪（CC_audit_4174）：① 座位讀書跨過 10:00 變灰＋「讀到補考前（09:50）」、一鍵總複習在外面也擋 ② 待到中午／小睡停在 09:30、停下來坐著也接得到補考、09:30～11:00 不能再跳
//     ③ 在家「會錯過」列補考 ④ 6/28 以後才第一次算缺考，旁白照演（修改前（d2716c89e）：e1～e4、j1～j4 FAIL）
// 修改前（開發分支 dad4935cf）：a、b、c、f（不重複那一項）、g、h 的「補考」項目 FAIL；d、e 照舊 PASS。用法：node tests/y4s2_makeup_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
const D=k=>PG.DK(k), T=(k,h)=>D(k)*24+h;
const clone=o=>JSON.parse(JSON.stringify(o));
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
GM.caption=()=>{}; GM.toast=()=>{};
/* 考試：照目前 say 的題號答對（right）或答錯（wrong）——補考的五題先 drawExam 好（runExam 會用存下來的那一份）*/
let mode='right', QS=[];
const choose0=GM.choose;
GM.choose=async o=>{ const last=[...H.said].reverse().find(s=>/^\d／5　/.test(s.t)); if(!last||!QS.length) return choose0(o); const q=QS[+last.t[0]-1]; const ok=x=>{ const t=x.t||x.text; return t===String(q.answer)||t.startsWith('（'+q.answer+'）'); };
  const k=o.findIndex(x=>mode==='right'?ok(x):!ok(x)); return k<0?0:k; };
/* 大四下：考五題的課照 fail 決定；fail 的那一門期末答對 0 題（qs 照 drawExam 存著）*/
const y4s2=(G,failExam)=>{ const R=CLS.rec(G); R.exam=R.exam||{}; let first=null;
  for(const c of CLS.termCourses(G,'Y4S2')){ if(!CLS.isExamCourse(c)) continue; if(!first) first=c; const d=CLS.drawExam(G,c.id,'Y4S2','final'); R.exam['Y4S2:'+c.id+':final']={qs:d.qs.map(q=>q.id),ans:[],status:'done',correct:3,score:80}; }
  if(failExam&&first) Object.assign(R.exam['Y4S2:'+first.id+':final'],{correct:0,score:0}); return first; };
const fresh=(key,h,fl)=>{ const G=H.fresh(key,h,'dorm',Object.assign({BAR_REG:true,Y4_PATH:'bar',GRADUATED:PG.gradDay()},fl||{})); PG.rec(G).done.grad=1; H.FRIEND('zhe'); return G; };
const hasMk=typeof FD!=='undefined'&&!!FD.MK_LINES;
const L=hasMk?FD.MK_LINES:{};
const planned=async()=>{ const G=fresh('2029-06-18',9); const c=y4s2(G,true); await CLS.showGrades(GM,'Y4S2'); return {G,c}; };
const runMakeup=async(G,c,m)=>{ PG.setT(G,H.E,D('2029-06-26'),9.5); const s=PG.due(G); mode=m; QS=CLS.drawExam(G,c.id,'Y4S2','makeup').qs; H.said=[]; if(s) await PG.runStep(GM,s); QS=[]; return s; };

(async()=>{
check('0. FD.MK_LINES、FD.makeup 存在（src/faildelay3d.js）',hasMk&&typeof FD.makeup==='function');

await sec('a',async()=>{ const {G,c}=await planned(); const nm=FD.cname(c.id), M=G.flags.FD_MAKEUP;
  check('a1. 6/18 考五題的課（'+nm+'）被當：不延畢、排補考',!G.flags.FAIL_DELAY&&!!M&&M.status==='pending'&&J(M.courses)===J([c.id])&&J(G.flags.FAIL_DELAY_COURSES)===J([]),J({F:G.flags.FAIL_DELAY,M,C:G.flags.FAIL_DELAY_COURSES}));
  check('a2. 6/18 旁白：「（'+nm+'，不及格。）」＋補考通知；延畢的「證書要等下學期」不說',H.has('（'+nm+'，不及格。）')&&H.has(L.notice)&&!H.has(FD.LINES.cert),J(H.lines().slice(-3)));
  check('a3. 補考結果出來以前：PG.delayed 不成立、BAR_REG 不動、2029 國考照考',!PG.delayed(G)&&G.flags.BAR_REG===true&&PG.sits(G,2029));
  check('a4. 手機：教務處補考通知（現在）＋前一天 20:00 的提醒（排好）',H.msgs('sys').some(t=>t===FD.fillIds([c.id],L.sys))&&PHONE.rec(G).q.some(q=>q.tag==='fd_mk_remind'&&q.day===D('2029-06-25')&&q.h===20),J(H.msgs('sys')));
  const cl=PG.cardLine(clone(G),D('2029-06-18'),D('2029-06-25'));
  check('a5. 6/18～6/25 的日期卡照一般畢業生（不是「九月再回學校」）',!/九月再回學校/.test(cl||''),cl);
  const st=PG.pending(G).find(x=>x.s.id==='fd_makeup'); check('a6. 停點：6/26（二）09:30「補考」',!!st&&st.t===T('2029-06-26',9.5)&&CALENDAR.dateOf(D('2029-06-26')).wd===2,J(st&&st.t));
  const s=await runMakeup(G,c,'right');
  check('a7. 6/26 09:30 演補考（同一科五題）',!!s&&s.id==='fd_makeup'&&H.said.filter(x=>/^\d／5　/.test(x.t)).length===5&&H.has(L.open)&&H.said.some(x=>x.t==='考卷發下來。'+c.name+'補考。五題。'),J(H.lines().slice(0,3)));
  check('a8. 補考答對：照常畢業（不延畢）、BAR_REG 保持、PG.delayed false',G.flags.FD_MAKEUP.status==='pass'&&!G.flags.FAIL_DELAY&&G.flags.BAR_REG===true&&!PG.delayed(G)&&PG.sits(G,2029)&&!G.flags.FAIL_DELAY_BARCANCEL);
  check('a9. 旁白：「（'+nm+'，補考過了。）」「（這樣，就真的畢業了。）」「（今年的國考，照常考。）」',H.has(FD.fillIds([c.id],L.pass))&&H.has(L.passAll)&&H.has(L.passBar),J(H.lines().slice(-4)));
  check('a10. 成績單改「及格（補考）」、CLS.failedIn 不再算它、reportFor 重算也一樣',CLS.rec(G).grades.Y4S2[c.id]===L.gradePass&&!CLS.failedIn(G,'Y4S2').length&&CLS.reportFor(G,'Y4S2')[c.id]===L.gradePass);
  check('a11. 時間帶到 10:00 考、考完 11:00；沒去的旁白不排、阿哲不傳',G.day===D('2029-06-26')&&Math.abs(G.hour-11)<1e-6&&!PG.pending(G).some(x=>x.s.id==='fd_mk_missed')&&!PHONE.rec(G).q.some(q=>q.tag==='fd_zhe'));
  check('a12. 全部補考過：大五上沒有重修（FD.courses 空、Y5.delayed 不成立）',!FD.courses(G).length&&!(typeof Y5!=='undefined'&&Y5.delayed&&Y5.delayed(G))); });

await sec('b',async()=>{ const {G,c}=await planned(); const nm=FD.cname(c.id); await runMakeup(G,c,'wrong');
  check('b1. 補考沒過：延畢（FAIL_DELAY、FAIL_DELAY_COURSES＝那一門、PG.delayed）',G.flags.FD_MAKEUP.status==='fail'&&G.flags.FAIL_DELAY===true&&J(G.flags.FAIL_DELAY_COURSES)===J([c.id])&&PG.delayed(G)&&G.flags.FAIL_DELAY_DAY===D('2029-06-26'));
  check('b2. 國考取消：BAR_REG false、FAIL_DELAY_BARCANCEL、2029 不考',G.flags.BAR_REG===false&&G.flags.FAIL_DELAY_BARCANCEL===true&&!PG.sits(G,2029));
  check('b3. 旁白：「（'+nm+'的補考，沒有過。）」＋延畢原句（證書、國考）',H.has(FD.fillIds([c.id],L.fail))&&H.has(FD.LINES.cert)&&H.has(FD.LINES.bar),J(H.lines().slice(-4)));
  check('b4. 成績單「不及格（補考未過）」',CLS.rec(G).grades.Y4S2[c.id]===L.gradeFail);
  G.hour=22; PHONE.tick(G); check('b5. 22:00 阿哲私訊兩則（照原句）',J(H.msgs('p:zhe').slice(-2))===J(FD.LINES.zhe),J(H.msgs('p:zhe')));
  check('b6. 大五上重修那一門（FD.courses）',J(FD.courses(G))===J([c.id])); });

await sec('c',async()=>{ const {G,c}=await planned(); const nm=FD.cname(c.id); PG.setT(G,H.E,D('2029-06-26'),11.25); H.said=[];
  const p=PG.pending(G);
  check('c1. 11:00 以前沒開始＝沒去：補考標 missed、當下記延畢（PG.delayed、BAR_REG false）',PG.rec(G).done.fd_makeup==='missed'&&G.flags.FD_MAKEUP.status==='missed'&&G.flags.FAIL_DELAY===true&&J(G.flags.FAIL_DELAY_COURSES)===J([c.id])&&G.flags.BAR_REG===false&&PG.delayed(G));
  const s=PG.due(G); if(s) await PG.runStep(GM,s);
  check('c2. 下一個停點：「（補考的時間過了。'+nm+'，你沒有去考。）」＋延畢原句',!!s&&s.id==='fd_mk_missed'&&H.has(FD.fillIds([c.id],L.missed))&&H.has(FD.LINES.cert)&&H.has(FD.LINES.bar),J(H.lines()));
  check('c3. 成績單「不及格（補考缺考）」；旁白只演一次',CLS.rec(G).grades.Y4S2[c.id]===L.gradeMissed&&!PG.due(G));
  G.hour=22; PHONE.tick(G); check('c4. 22:00 阿哲私訊',J(H.msgs('p:zhe').slice(-2))===J(FD.LINES.zhe)); });

await sec('d',async()=>{ /* 點名制的課：大四下沒有，用一門排在大四下的重修（日文二，看出席）*/
  const mkRt=G=>{ const R=CLS.rec(G); R.retake=[{id:'japanese_2',from:'Y3S2',base:'Y2S2',term:'Y4S2',slots:[{wd:3,block:'pm1'}],alt:false}]; R.attend.japanese_2=0; };
  let G=fresh('2029-06-18',9); y4s2(G,false); mkRt(G); const att=CLS.termCourses(G,'Y4S2').find(c=>c.id==='japanese_2');
  const f0=CLS.failedIn(G,'Y4S2').map(c=>c.id);
  check('d0. 前置：重修日文二排在大四下、是看出席的課、沒去＝被當',!!att&&CLS.attCourse(att)&&J(f0)===J(['japanese_2']),J(f0));
  await CLS.showGrades(GM,'Y4S2');
  check('d1. 只有點名制的課被當：照舊 6/18 直接延畢、不排補考',G.flags.FAIL_DELAY===true&&J(G.flags.FAIL_DELAY_COURSES)===J(['japanese_2'])&&!G.flags.FD_MAKEUP&&G.flags.BAR_REG===false&&H.has(FD.LINES.cert));
  G=fresh('2029-06-18',9); const c=y4s2(G,true); mkRt(G); await CLS.showGrades(GM,'Y4S2');
  check('d2. 考試課＋點名制的課一起被當：照舊直接延畢（兩門都記）、不排補考',G.flags.FAIL_DELAY===true&&J([...G.flags.FAIL_DELAY_COURSES].sort())===J([c.id,'japanese_2'].sort())&&!G.flags.FD_MAKEUP&&!PG.pending(G).some(x=>x.s.id==='fd_makeup'),J(G.flags.FAIL_DELAY_COURSES)); });

await sec('e',async()=>{
  /* 舊存檔：6/18 用舊規則判了延畢（BARCANCEL、22:00 阿哲還沒送）*/
  const old=(key,h,fl,setup)=>{ const G=fresh(key,h,Object.assign({FAIL_DELAY:true,FAIL_DELAY_COURSES:['maritime'],FAIL_DELAY_V:2,BAR_REG:false,FAIL_DELAY_BARCANCEL:true,FAIL_DELAY_DAY:D('2029-06-18')},fl||{}));
    y4s2(G,true); CLS.rec(G).grades.Y4S2={maritime:'0 分（不及格）',legal_research:'通過',legal_practice:'通過'}; if(setup) setup(G); return G; };
  { const G=old('2029-06-20',9,{},G=>PHONE.at(G,G.day,22,FD.LINES.zhe.map(t=>({th:'p:zhe',from:'zhe',text:t})),'fd_zhe')); const s=clone(G); const ch=FD.migrate(s); const F=s.flags, M=F.FD_MAKEUP;
    check('e1. 6/20 讀檔（6/26 09:30 以前、全部是考五題的課）：改給補考——FD_MAKEUP pending、取消延畢、BAR_REG 恢復（被延畢取消的）',ch&&!!M&&M.status==='pending'&&J(M.courses)===J(['maritime'])&&!F.FAIL_DELAY&&J(F.FAIL_DELAY_COURSES)===J([])&&F.BAR_REG===true&&!F.FAIL_DELAY_BARCANCEL,J(F));
    check('e1. 22:00 阿哲那兩則還沒送的拿掉',!((s.phone&&s.phone.q)||[]).some(q=>q.tag==='fd_zhe'));
    const s2=clone(s); check('e1. 冪等：再跑一次不變',FD.migrate(s2)===false&&J(s2.flags)===J(s.flags));
    H.G=s; SOCIAL.bind(s); H.said=[]; STORY.phoneRules(GM);
    check('e2. 讀檔以後：手機補考通知（sys）＋6/25 20:00 提醒',H.msgs('sys').includes(FD.fillIds(['maritime'],L.sys))&&PHONE.rec(s).q.some(q=>q.tag==='fd_mk_remind'),J(H.msgs('sys')));
    const st=PG.due(s); if(st) await PG.runStep(GM,st);
    check('e2. 下一個停點補一句：「'+FD.fillIds(['maritime'],L.migNotice)+'」＋補考通知；只演一次',!!st&&st.id==='fd_mk_notice'&&H.has(FD.fillIds(['maritime'],L.migNotice))&&H.has(L.notice)&&!(PG.due(s)&&PG.due(s).id==='fd_mk_notice'),J(H.lines()));
    check('e2. 之後照新規則：PG.delayed 不成立、2029 國考照考、6/26 補考停點',!PG.delayed(s)&&PG.sits(s,2029)&&PG.pending(s).some(x=>x.s.id==='fd_makeup')); }
  { const G=old('2029-06-26',9.75); const s=clone(G); const ch=FD.migrate(s);
    check('e3. 6/26 09:45 才讀檔（補考停點已經到了）：照舊延畢',!ch&&s.flags.FAIL_DELAY===true&&!s.flags.FD_MAKEUP&&s.flags.BAR_REG===false); }
  { const G=old('2029-06-20',9,{FAIL_DELAY_COURSES:['maritime','japanese_2']},G=>{ const R=CLS.rec(G); R.retake=[{id:'japanese_2',from:'Y3S2',base:'Y2S2',term:'Y4S2',slots:[{wd:3,block:'pm1'}],alt:false}]; }); const s=clone(G); const ch=FD.migrate(s);
    check('e3. 有點名制的課（日文二重修）：照舊延畢',!ch&&s.flags.FAIL_DELAY===true&&!s.flags.FD_MAKEUP); }
  { const G=old('2029-06-20',9,{EXCHANGE_ROUTE:'JP'}); const s=clone(G); const ch=FD.migrate(s);
    check('e3. 交換路線：照舊',!ch&&s.flags.FAIL_DELAY===true&&!s.flags.FD_MAKEUP); }
  { const G=old('2029-06-20',9,{FAIL_DELAY_BARCANCEL:undefined}); delete G.flags.FAIL_DELAY_BARCANCEL; const s=clone(G); FD.migrate(s);
    check('e4. 報名不是被延畢取消的（沒有 BARCANCEL）：給補考、BAR_REG 不動',!!s.flags.FD_MAKEUP&&s.flags.BAR_REG===false); }
  { const G=old('2029-06-26',9.75); const r=await FD.check(GM,{inScene:true});
    check('e5. 已經延畢的存檔：FD.check 不再判、不給補考、沒有補考的總複習',r===false&&!G.flags.FD_MAKEUP&&G.flags.FAIL_DELAY===true&&!PG.pending(G).some(x=>x.s.id==='fd_makeup')&&!STUDY.reviewInfo(G,'final')); }
  { const G=old('2029-06-20',9); delete G.flags.FAIL_DELAY_V; G.day=D('2029-06-27'); const s=clone(G); const ch=FD.migrate(s);
    check('e6. FD.migrate 照舊：真的考了 0 題、6/26 以後讀檔＝延畢照舊',!ch&&s.flags.FAIL_DELAY===true&&!s.flags.FD_MAKEUP); } });

await sec('f',async()=>{ const G=fresh('2029-06-18',9); const c=y4s2(G,true); const fin=CLS.rec(G).exam['Y4S2:'+c.id+':final'].qs;
  const p=CLS.examPool(c.id,'Y4S2','makeup'), n=p.cls.length+p.bank.length+p.ai.length;
  const mk=CLS.drawExam(G,c.id,'Y4S2','makeup').qs.map(q=>q.id), same=mk.filter(id=>fin.includes(id));
  check('f1. 補考題（'+J(mk)+'）和期末（'+J(fin)+'）不完全相同',mk.length===5&&J([...mk].sort())!==J([...fin].sort()));
  check('f2. 題庫 '+n+' 題（10 題以上）：補考題和期末一題都不重複',n<10||same.length===0,J(same));
  check('f3. 同一份存檔再抽：同一份補考題',J(CLS.drawExam(G,c.id,'Y4S2','makeup').qs.map(q=>q.id))===J(mk));
  check('f4. 期末的題號不動',J(CLS.drawExam(G,c.id,'Y4S2','final').qs.map(q=>q.id))===J(fin)); });

await sec('g',async()=>{ const {G,c}=await planned(); PG.setT(G,H.E,D('2029-06-25'),19);
  const info=typeof STUDY!=='undefined'?STUDY.reviewInfo(G,'final'):null;
  check('g1. 6/25 19:00：可以總複習補考那一科（範圍＝大四下期末的卡）',!!info&&J(info.courses.map(x=>x.c.id))===J([c.id])&&info.courses[0].units.length===STUDY.units(G,c,'Y4S2','final').length&&info.courses[0].units.length>0,J(info&&info.courses.map(x=>x.c.id)));
  const o=STUDY.reviewOpt(G,{home:true}); check('g2. 選項提示：「補考的 1 科」',!!o&&!o.dim&&o.hint.indexOf(L.reviewWhat+' 1 科')===0,o&&o.hint);
  PG.setT(G,H.E,D('2029-06-26'),8); check('g3. 6/26 08:00：讀三小時會過了補考 10:00＝不給',STUDY.reviewCheck(G,{home:true}).dim&&STUDY.reviewCheck(G,{home:true}).why===L.reviewBlock);
  PG.setT(G,H.E,D('2029-06-25'),19); const r=await STUDY.review(GM,'final',{home:true});
  check('g4. 做了：那一科的卡都「讀過」以上',!!r&&STUDY.units(G,c,'Y4S2','final').every(u=>['read','got'].includes(STUDY.status(G,u))));
  await runMakeup(G,c,'right'); PG.setT(G,H.E,D('2029-06-26'),12); check('g5. 補考考完：不再有補考的總複習',!STUDY.reviewInfo(G,'final')); });

await sec('h',async()=>{ const G=fresh('2029-06-26',9); y4s2(G,true); await CLS.showGrades(GM,'Y4S2');
  check('h1. 成績單補考那天才發（來不及補考）：照舊直接延畢',G.flags.FAIL_DELAY===true&&!G.flags.FD_MAKEUP); });

await sec('i',async()=>{ /* BUG-MAKEUP-HOME-1102（BB 08:34 P1）：6/26 人在家（HOME.at）時 PG.tick 不跑 → 原本會一直到 11:00 被算缺考 */
  const {G,c}=await planned(); G.home=Object.assign(G.home||{},{at:true});
  const reg=typeof HOME!=='undefined'&&Array.isArray(HOME.MENU_OPTS)&&HOME.MENU_OPTS.includes(FD.homeMakeupOpt);
  PG.setT(G,H.E,D('2029-06-25'),21); const o0=FD.homeMakeupOpt(G);
  PG.setT(G,H.E,D('2029-06-26'),8.5); G.home.at=true; const o1=FD.homeMakeupOpt(G);
  check('i1. 家裡的選單（HOME.MENU_OPTS）6/26 早上有「'+(L.homeOpt||'出發：補考')+'」；前一天沒有',reg&&!o0&&!!o1&&o1.t===L.homeOpt&&o1.hint.includes(FD.cname(c.id)),J({reg,o0,o1:o1&&o1.t}));
  mode='right'; QS=CLS.drawExam(G,c.id,'Y4S2','makeup').qs; H.said=[]; if(o1) await o1.run(GM); QS=[];
  check('i2. 在家按「出發：補考」＝演補考（五題）、答對照常畢業、時間到 11:00',G.flags.FD_MAKEUP.status==='pass'&&!G.flags.FAIL_DELAY&&H.said.filter(x=>/^\d／5　/.test(x.t)).length===5&&Math.abs(G.hour-11)<1e-6,J({st:G.flags.FD_MAKEUP.status,h:G.hour}));
  check('i3. 考完以後選單不再列補考',!FD.homeMakeupOpt(G));
  const {G:G2}=await planned(); G2.home=Object.assign(G2.home||{},{at:true}); PG.setT(G2,H.E,D('2029-06-26'),11.25); check('i4. 11:00 以後在家：不再列（照沒去處理）',!FD.homeMakeupOpt(G2)); });
await sec('j',async()=>{ const wait=async()=>{ for(let k=0;k<200&&PG.busy;k++) await new Promise(r=>setImmediate(r)); };
  /* ① 6/26 08:30 在總圖坐下讀書 */
  { const {G}=await planned(); PG.setT(G,H.E,D('2029-06-26'),8.5); G.zone='library';
    const Ls=CLS.studyLengths(GM), l3=Ls.find(x=>x.hours===3), l2=Ls.find(x=>x.hours===2), fx=Ls.find(x=>/^讀到/.test(x.t));
    check('j1. ① 08:30「讀 2、3 小時」變灰、提示「會錯過：補考」',!!l3&&l3.dim&&/會錯過：補考/.test(l3.hint)&&!!l2&&l2.dim,J(Ls.map(x=>[x.t,x.dim,x.hint])));
    check('j1. ① 有「讀到補考前（09:50）」可選；「讀 1 小時」（到 09:30）照常',!!fx&&fx.t==='讀到'+L.fixLabel+'前（09:50）'&&!fx.dim&&!Ls.find(x=>x.hours===1).dim,J(fx));
    const rc=STUDY.reviewCheck(G,{}); check('j1. ① 一鍵總複習（人在總圖、不是在家）也不給',rc.dim&&/補考/.test(rc.why),J(rc));
    PG.setT(G,H.E,D('2029-06-25'),8.5); check('j1. ① 前一天同一時間不受影響',!CLS.studyLengths(GM).some(x=>/補考/.test(x.hint)||/補考/.test(x.t))); }
  /* ② 待到中午／小睡 */
  { const {G,c}=await planned(); PG.setT(G,H.E,D('2029-06-26'),8.5); G.zone='library';
    const st=CLS.skipStops(GM,12); check('j2. ② 08:30 跳到 12:00：停點有 09:30「補考：{課名}」',st.length>0&&Math.abs(st[0].h-9.5)<1e-6&&st[0].why===FD.fillIds([c.id],L.missItem),J(st));
    const ok=await CLS.skipTo(GM,12); check('j2. ② 待到中午停在 09:30、補考還在',ok!==false&&Math.abs(G.hour-9.5)<1e-6&&G.flags.FD_MAKEUP.status==='pending',J({h:G.hour}));
    check('j2. ② 09:30～11:00 之間不能再跳（「'+L.noSkip+'」）',CLS.canSkip(GM)===L.noSkip&&(await CLS.skipTo(GM,12))===false&&Math.abs(G.hour-9.5)<1e-6);
    const P=H.E.player; P.seat={}; mode='right'; QS=CLS.drawExam(G,c.id,'Y4S2','makeup').qs; H.said=[]; PG.tick(GM); await wait(); P.seat=null; QS=[];
    check('j2. ② 停下來還坐著：PG.tick 照樣接到補考那一場（seatOk）→ 答對照常畢業',G.flags.FD_MAKEUP.status==='pass'&&H.said.filter(x=>/^\d／5　/.test(x.t)).length===5,J({st:G.flags.FD_MAKEUP.status,said:H.lines().slice(0,2)})); }
  { const {G}=await planned(); PG.setT(G,H.E,D('2029-06-26'),7); G.zone='dorm'; const ok=await CLS.skipTo(GM,13,{nap:true});
    check('j2. ② 床上小睡（07:00 睡到 13:00）也停在 09:30',ok!==false&&Math.abs(G.hour-9.5)<1e-6&&G.flags.FD_MAKEUP.status==='pending',J({h:G.hour})); }
  /* ③ 在家的「會錯過」*/
  { const {G,c}=await planned(); PG.setT(G,H.E,D('2029-06-26'),10.5); const wm=HOME.wouldMiss(G,11.5);
    check('j3. ③ 10:30 在家休息一小時：「會錯過」列「10:00 補考：{課名}」',wm.includes('10:00 '+FD.fillIds([c.id],L.missItem)),J(wm));
    PG.setT(G,H.E,D('2029-06-26'),7); check('j3. ③ 07:00 休息到 08:00：不列（還來得及）',!HOME.wouldMiss(G,8).some(t=>/補考/.test(t)));
    PG.setT(G,H.E,D('2029-06-25'),22); check('j3. ③ 前一晚在家睡到隔天中午（toH 36）：列',HOME.wouldMiss(G,36).some(t=>/補考/.test(t)));
    /* BB 09:27（CC F5）：已經有 3 件會錯過的事（約好的見面），補考排第一個、不會被 confirmMiss 的前三件擠掉 */
    PG.setT(G,H.E,D('2029-06-26'),9); G.invites=G.invites||[]; for(const [who,h] of [['heroine_01',9.5],['heroine_02',10],['heroine_03',10.5]]) G.invites.push({id:'ivF5'+who,who,place:'cafe',zone:'cafe',day:D('2029-06-26'),h,state:'accepted',accepted:true,by:'player'});
    const w5=HOME.wouldMiss(G,12), top3=w5.slice(0,3);
    check('j3. ③ 已經有 3 件會錯過的見面：補考排第一個、前三件裡有補考（BB 09:27，CC F5）',w5.length>=4&&/補考/.test(top3[0]||''),J(w5)); }
  /* ④ 6/28 以後才第一次算缺考 */
  { const {G,c}=await planned(); PG.setT(G,H.E,D('2029-06-29'),9); H.said=[]; PG.pending(G); const s=PG.due(G); if(s) await PG.runStep(GM,s);
    check('j4. ④ 6/29 才第一次算：缺考、旁白照演（不是 missed 掉）',G.flags.FD_MAKEUP.status==='missed'&&!!s&&s.id==='fd_mk_missed'&&H.has(FD.fillIds([c.id],L.missed))&&PG.rec(G).done.fd_mk_missed===1,J({due:s&&s.id,done:PG.rec(G).done.fd_mk_missed})); } });

/* BUG-MAKEUP-BG-1102（BB 10:14）：補考整場都是法律系館A 201 的考場背景（在家、在校園、坐在座位上都一樣）；開頭字幕「法律系館A」；考完回原本的地方 */
await sec('k',async()=>{ const bgId=x=>x&&typeof x==='object'?x.image||'obj':x; const want=bgId(OUT.bg('linze_201'));
  const b0=ADV.begin, s0=ADV.setBg, e0=ADV.end, say0=GM.say, cap0=GM.caption; let cur=null; const seen=[], caps=[];
  ADV.begin=function(o){ cur=o&&o.background; return b0.apply(this,arguments); }; ADV.setBg=function(b){ cur=b; return s0.apply(this,arguments); }; ADV.end=function(){ cur=null; return e0.apply(this,arguments); };
  GM.say=async function(w,t){ if(/^\d／5　/.test(String(t))||t===L.open) seen.push(ADV.active?bgId(cur):'(沒有 ADV)'); return say0.apply(this,arguments); }; GM.caption=(a,b)=>caps.push(b);
  try{
    const run=async(setup)=>{ const {G,c}=await planned(); seen.length=0; caps.length=0; cur=null; ADV.active=false; setup(G); mode='right'; QS=CLS.drawExam(G,c.id,'Y4S2','makeup').qs; H.said=[]; await FD.makeup(GM); QS=[]; return G; };
    const homeBg={image:'home.webp'}; const hb0=typeof HOME!=='undefined'?HOME.bgNow:null; if(typeof HOME!=='undefined') HOME.bgNow=()=>homeBg;
    const G1=await run(G=>{ G.home=Object.assign(G.home||{},{at:true}); PG.setT(G,H.E,D('2029-06-26'),9.5); ADV.begin({background:homeBg}); });
    check('k1. 在家：補考開場、五題都在考場背景（linze_201）；開頭字幕「法律系館A」；考完回到家裡的背景',seen.length===6&&seen.every(x=>x===want)&&caps[0]==='法律系館A'&&ADV.active&&bgId(cur)==='home.webp',J({seen,caps,cur:bgId(cur)}));
    await run(G=>{ G.home=Object.assign(G.home||{},{at:false}); G.zone='campus'; PG.setT(G,H.E,D('2029-06-26'),9.5); });
    check('k2. 在校園（原本沒有 ADV）：整場考場背景、考完收掉 ADV',seen.length===6&&seen.every(x=>x===want)&&!ADV.active,J({seen,active:ADV.active}));
    await run(G=>{ G.home=Object.assign(G.home||{},{at:false}); G.zone='library'; H.E.player=H.E.player||{}; H.E.player.seat={x:0,z:0}; PG.setT(G,H.E,D('2029-06-26'),9.5); });
    check('k3. 坐在總圖的座位：整場考場背景',seen.length===6&&seen.every(x=>x===want),J(seen));
    if(hb0) HOME.bgNow=hb0;
  } finally { ADV.begin=b0; ADV.setBg=s0; ADV.end=e0; GM.say=say0; GM.caption=cap0; ADV.active=false; if(H.E.player) delete H.E.player.seat; } });

H.done();
})();

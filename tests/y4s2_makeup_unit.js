// D118 大四下被當 → 6 月底補考一次（使用者 2026-11-02 05:0x 選擇題 Q4；docs/handoff/D118_PLAN.md 第 10 節）——不需要瀏覽器。src/faildelay3d.js＋classes3d.js／study3d.js
//   a 大四下一門考五題的課被當 → 6/18 不延畢、排補考（6/26 10:00）；6/18～補考之間 PG.delayed 不成立、BAR_REG 不動、日期卡照一般畢業生；補考答對 → 照常畢業、BAR_REG 保持、成績單「及格（補考）」
//   b 補考沒過 → 延畢（FAIL_DELAY、BAR_REG false、延畢那幾句、22:00 阿哲私訊）
//   c 補考那天沒去（11:00 以前沒開始）→ 延畢（旗標當下記好、旁白下一個停點）
//   d 被當的是看出席的課（點名制，沒有考試可以補）→ 照舊 6/18 直接延畢、不排補考（和考試課一起被當也一樣）
//   e 舊存檔已經 FAIL_DELAY → 不給補考；FD.migrate 照舊
//   f 補考題和期末題不完全相同（題庫 10 題以上＝完全不重複）；同一份存檔重抽是同一份
//   g 補考期間的總複習：6/18～補考前可以總複習補考那一科（學期外 STUDY 原本不開）；讀到一半會錯過補考＝不給
//   h 成績單補考那天以後才發（放假很久才醒來）＝來不及補考，照舊直接延畢
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

await sec('e',async()=>{ const G=fresh('2029-06-20',9,{FAIL_DELAY:true,FAIL_DELAY_COURSES:['maritime'],FAIL_DELAY_V:2,BAR_REG:false,FAIL_DELAY_BARCANCEL:true,FAIL_DELAY_DAY:D('2029-06-18')});
  y4s2(G,true); CLS.rec(G).grades.Y4S2={maritime:'0 分（不及格）',legal_research:'通過',legal_practice:'通過'};
  const r=await FD.check(GM,{inScene:true});
  check('e1. 舊存檔已經 FAIL_DELAY：FD.check 不再判、不給補考',r===false&&!G.flags.FD_MAKEUP&&G.flags.FAIL_DELAY===true&&!PG.pending(G).some(x=>x.s.id==='fd_makeup'));
  PG.setT(G,H.E,D('2029-06-25'),19); check('e2. 也沒有補考的總複習',!(typeof STUDY!=='undefined'&&STUDY.reviewInfo(G,'final')));
  const s=clone(G); delete s.flags.FAIL_DELAY_V; const ch=FD.migrate(s);
  check('e3. FD.migrate 照舊：真的考了 0 題的舊存檔＝延畢照舊、不加 FD_MAKEUP',!ch&&s.flags.FAIL_DELAY===true&&!s.flags.FD_MAKEUP); });

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

H.done();
})();

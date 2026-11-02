// CC M3「隨機點名」——不需要瀏覽器（Node）。
// 用法：
//   cd /home/user/Lawstudent && git archive <SHA> src tests index.html | tar -x -C <資料夾>
//   nice -n 19 node docs/story_planning/test_tools/cc/m3_rollcall.js <資料夾> [種子數，預設 8] [--no-mut]
//   （資料夾＝有 src/、tests/pg_harness.js 的受測版本根目錄；--no-mut＝不跑「故意改壞」的自我檢查）
// 受測的程式（src/classes3d.js）：S.ROLL_N／ROLL_FAIL／ROLL_WEEKS、S.rollWeeks（examSeed＋學期＋課 → FNV hash → 洗牌取 4 週，只在「那門課那一週真的有上」的週）、
//   S.rollStat（R.done 有去、R.abs 遲到算缺）、S.attPass（缺 < ROLL_FAIL 及格；舊存檔 rollSince 保底：出席 ≥ ATT_PASS）。
// 檢查（每一項都在有 bug 時 FAIL，最後的 MUT 段故意改壞程式證明抓得到）：
//   1a 每學期每門看出席的課剛好 ROLL_N(=4) 個點名週、不重複、遞增、都在 ROLL_WEEKS
//   1b 同一個種子：兩份獨立存檔結果相同；存進 R.roll 的和回傳的相同；刪掉 R.roll 重算相同
//   1c 不同種子：同一門課在 N 個種子下不會全部一樣
//   1d 真正的新遊戲（game3d.js defaults() 沒有 examSeed）：兩個不同玩家的大一上點名週應該不同
//   2  點名週那一週至少有一堂「真的有上」的課：獨立模型（不呼叫 dayItems）：不是國定／校定假日、颱風假、不在國外、不在開局以前、
//      不是期末考週（termOf.exam==='final'，含大四下第 15 週）、不是學期最後一週；Y1S1～Y4S2、多個種子、兩種開局
//   2m 模型一致性：獨立模型判定的上課日＝CLS.dayItems 排出的那門課（不一致＝模型或程式有一邊錯，列出）
//   3  重修（真的 planRetakes 排的重修課）、交換路線 JP／US 同樣照 1a、2；US 大四上整學期在國外時 reportFor 與 failedIn 一致
//   4  attPass 邊界：缺 0～4 次（點名日去／不去；也測缺的是後面幾次）、遲到算缺、舊存檔保底（出席 2／3 次）、重修課缺 2／3 次
'use strict';
const path=require('path'), fs=require('fs'), vm=require('vm');
const SRC=path.resolve(process.argv[2]||'/tmp/claude-0/-home-user-Lawstudent/d06332e2-ec70-5e42-a15c-5a4b27dbdb56/scratchpad/mhead');
const NSEED=+(process.argv.slice(3).find(a=>/^\d+$/.test(a))||8);
const NOMUT=process.argv.includes('--no-mut');
const H=require(path.join(SRC,'tests/pg_harness.js'));
const load=f=>{ const p=path.join(SRC,f); if(!fs.existsSync(p)){ console.log('（沒有 '+f+'）'); return; } const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/jp3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e.message); }
const J=JSON.stringify;
console.log('受測：'+SRC+'　種子數 '+NSEED+'　JP.skipTerm '+(typeof JP!=='undefined'&&!!JP.skipTerm));

/* ---------- 記錄 ---------- */
let quiet=false, fails=0; const FAILS=[];
const check=(name,ok,info)=>{ if(!ok){ fails++; FAILS.push(name+(info?'　'+info:'')); } if(!quiet) console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); return ok; };
const info=t=>{ if(!quiet) console.log('INFO '+t); };

const TERMS=CLS.LAW_TERMS.slice();
const TDEF=id=>CALENDAR.TERMS.find(t=>t.id===id);
const SEEDS=[777,12345,1,2,99991,424242,31337,8080,5,600613,13,271828].slice(0,Math.max(2,NSEED));
const BT=COURSES.blocks;
const WANT_N=4;   /* 期望值寫死：classes3d.js 註解「看出席的課每學期 4 個點名週」（ATTEND-ROLLCALL-1102／AA_574 末節）；不讀 CLS.ROLL_N，免得程式改壞時跟著改 */

/* ---------- 存檔 ---------- */
function mk(seed,route,startB){ const fl={examSeed:seed}; if(route) fl.EXCHANGE_ROUTE=route; if(startB){ fl.LAW_START_DAY=STORY.LAW_D0; fl.MAIN_D1=STORY.MAIN_D1_NEW; }
  const G=H.fresh('2025-09-01',8,'dorm',fl); CLS.rec(G); G.courses.rollSince=-9999; return G; }

/* ---------- 獨立模型：這門課這一天這一格是不是「真的有上課」（不呼叫 CLS.dayItems）---------- */
function slotDayOK(G,c,termId,d,slot){ const why=[]; const t=CALENDAR.termOf(d);
  if(!t||t.id!==termId) why.push('不在學期');
  const hol=CALENDAR.holiday(d); if(hol) why.push((CALENDAR.typhoon(d)?'颱風假:':'假日:')+hol);
  if(STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d}))) why.push('在國外');
  const ls=STORY.lawStart(G), m1=STORY.mainD1(G); if(d<ls||(d===m1&&ls===m1)) why.push('開局以前');
  if(d===m1+1&&ls===m1&&BT[slot.block].t0<CLS.DAY2_START) why.push('第二天早上（睡過去）');
  if(t&&t.exam==='final') why.push('期末考週');
  if(t&&t.week>=TDEF(termId).weeks) why.push('學期最後一週');
  if(c.weeks&&t&&!c.weeks.includes(t.week)) why.push('不在 c.weeks');
  if(typeof JP!=='undefined'&&JP.skipTerm&&JP.skipTerm(G,termId)) why.push('日本路線不修這學期');
  return why; }
function weekDays(termId,w){ const r=CALENDAR.termDays(termId); const out=[]; for(let d=r.from+(w-1)*7;d<r.from+w*7;d++) out.push(d); return out; }
function weekVerdict(G,c,termId,w){ const rs=[]; for(const d of weekDays(termId,w)){ const wd=CALENDAR.dateOf(d).wd; for(const s of c.slots){ if(s.wd!==wd) continue; const why=slotDayOK(G,c,termId,d,s); if(!why.length) return {ok:true}; rs.push(CALENDAR.dateOf(d).key+' '+why.join('/')); } } return {ok:false,why:rs.length?rs:['那一週沒有這門課的時段']}; }
function validWeeks(G,c,termId){ return CLS.ROLL_WEEKS.filter(w=>weekVerdict(G,c,termId,w).ok); }
/* 模型一致：模型的上課日 vs dayItems（只看非考試週，考試週的期末判定 dayItems 照常上課，模型故意排除）*/
function modelMismatch(G,c,termId){ const r=CALENDAR.termDays(termId), out=[];
  for(let d=r.from;d<=r.to;d++){ const t=CALENDAR.termOf(d); if(t.exam==='final'||t.week>=TDEF(termId).weeks) continue; const wd=CALENDAR.dateOf(d).wd;
    const want=c.slots.some(s=>s.wd===wd&&!slotDayOK(G,c,termId,d,s).length); const got=CLS.dayItems(G,d).some(it=>it.c.id===c.id&&it.term===termId);
    if(want!==got) out.push(CALENDAR.dateOf(d).key+(want?' 模型有課、dayItems 沒有':' 模型沒課、dayItems 有')); }
  return out; }

/* ---------- 跑一份存檔的 8 學期 ---------- */
function runSave(G,opt){ opt=opt||{}; const res={}; for(const T of TERMS){ const cs=CLS.termCourses(G,T).filter(CLS.attCourse); res[T]={};
    for(const c of cs){ const W=CLS.rollWeeks(G,c,T); res[T][c.id]={W,rt:!!c.rt,c}; }
    if(opt.chain){ /* 單科一路重修：這學期只讓 opt.chain 那一門（含它的重修）被當，其他課都過（考五題的課記一場答對 3 題、看出席的課每堂都去）*/
      const R=CLS.rec(G); R.exam=R.exam||{};
      for(const c of CLS.termCourses(G,T)){ if(c.id===opt.chain) continue; if(CLS.isExamCourse(c)) R.exam[T+':'+c.id+':final']={status:'done',correct:3,score:60};
        else if(CLS.attCourse(c)){ const r=CALENDAR.termDays(T); for(let d=r.from;d<=r.to;d++) for(const it of CLS.dayItems(G,d)) if(it.c===c||it.c.id===c.id&&it.term===T) R.done[it.key]=1; } } }
    if(opt.retake||opt.chain) CLS.planRetakes(G,T); }   /* 都沒去：看出席的課被當 → 真的排進下一學期重修 */
  return res; }

/* ================= 1、2、3：點名週 ================= */
function suiteWeeks(){ const scen=[]; for(const s of SEEDS){ scen.push({seed:s,route:null,startB:false,retake:false,tag:'TW 9/17 開局'}); scen.push({seed:s,route:null,startB:true,retake:true,tag:'TW 8/29 開局＋重修'}); scen.push({seed:s,route:'JP',startB:true,retake:false,tag:'JP'}); scen.push({seed:s,route:'US',startB:true,retake:false,tag:'US'}); scen.push({seed:s,route:'JP',startB:true,retake:true,tag:'JP＋重修'}); scen.push({seed:s,route:'US',startB:true,retake:true,tag:'US＋重修'}); for(const r of [null,'JP','US']) scen.push({seed:s,route:r,startB:true,retake:false,chain:'chinese_y1',tag:(r||'TW')+' 國文一路重修'}); }
  const bySeed={}, perTerm={}; let y4s2N=0, nCourse=0, nRt=0, bad1a=[], bad2=[], badMis=[], awayRoll=[]; const shortCand=[]; const awayInfo=[];
  for(const sc of scen){ const G=mk(sc.seed,sc.route,sc.startB); const res=runSave(G,{retake:sc.retake,chain:sc.chain});
    for(const T of TERMS) for(const id in res[T]){ const {W,rt,c}=res[T][id]; nCourse++; if(rt) nRt++;
      const lab=sc.tag+' 種子'+sc.seed+' '+T+' '+id+(rt?'（重修）':''); if(sc.seed===SEEDS[0]){ const pk=sc.tag+' '+T; (perTerm[pk]=perTerm[pk]||[]).push(id+(rt?'(重修)':'')+J(W)); }
      const away=CLS.termAway(G,T); if(T==='Y4S2') y4s2N++;
      if(!(W.length===WANT_N&&new Set(W).size===W.length&&W.every((x,i)=>i===0||W[i-1]<x)&&W.every(x=>CLS.ROLL_WEEKS.includes(x)))) bad1a.push(lab+' '+J(W));
      const vw=validWeeks(G,c,T); if(vw.length<WANT_N) shortCand.push(lab+' 可點名的週只有 '+J(vw));
      for(const w of W){ const v=weekVerdict(G,c,T,w); if(!v.ok){ (away?awayRoll:bad2).push(lab+' 第 '+w+' 週：'+v.why.join('；')); } }
      if(away) awayInfo.push(lab+' W='+J(W)+' stored='+J(((G.courses.roll||{})[T+':'+id])||null));
      if(sc.seed===SEEDS[0]&&!away){ const mm=modelMismatch(G,c,T); if(mm.length) badMis.push(lab+'：'+mm.slice(0,3).join('、')+(mm.length>3?'…共 '+mm.length:'')); }
      /* 1b：存進 R.roll 的＝回傳的；刪掉 R.roll 重算一樣 */
      const st=(G.courses.roll||{})[T+':'+id]; if(st&&J(st)!==J(W)) bad1a.push(lab+' 存檔 R.roll '+J(st)+' ≠ 回傳 '+J(W));
      if(!rt&&sc.tag!=='US'){ const k=sc.tag+'|'+T+'|'+id; (bySeed[k]=bySeed[k]||{})[sc.seed]=J(W); } }
    /* 1b：同一個種子、另一份獨立存檔 */
    if(sc.retake===false&&!sc.chain){ const G2=mk(sc.seed,sc.route,sc.startB); const r2=runSave(G2); for(const T of TERMS) for(const id in res[T]) if(!res[T][id].rt){ const a=J(res[T][id].W), b=J(((r2[T]||{})[id]||{}).W); if(a!==b) bad1a.push('1b '+sc.tag+' 種子'+sc.seed+' '+T+' '+id+' 第二份存檔不同 '+a+' vs '+b); }
      for(const T of TERMS) for(const id in res[T]){ if(res[T][id].rt) continue; const c=res[T][id].c; delete G2.courses.roll; const w3=J(CLS.rollWeeks(G2,c,T)); if(w3!==J(res[T][id].W)) bad1a.push('1b 刪掉 R.roll 重算不同 '+sc.tag+' '+T+' '+id); } } }
  info('看過的（存檔×學期×課）共 '+nCourse+'，其中重修課 '+nRt); if(!quiet) for(const k in perTerm) console.log('     種子'+SEEDS[0]+' '+k+'：'+perTerm[k].join(' '));
  check('1a/1b 每學期每門看出席的課剛好 '+WANT_N+' 個點名週（不重複、遞增、在 ROLL_WEEKS）；同種子兩份存檔／刪 R.roll 重算都一樣',bad1a.length===0,bad1a.slice(0,6).join('｜')+(bad1a.length>6?'…共 '+bad1a.length:''));
  check('1a′ 每門課可點名的週（獨立模型）至少 '+WANT_N+' 個（不足時程式只能抽到較少週）',shortCand.length===0,shortCand.slice(0,5).join('｜')+(shortCand.length>5?'…共 '+shortCand.length:''));
  /* 1c：不同種子 */
  const same=[]; let tot=0; for(const k in bySeed){ const v=Object.values(bySeed[k]); if(v.length<2) continue; tot++; if(new Set(v).size===1) same.push(k+' '+v[0]); }
  check('1c 不同種子會變：'+tot+' 組（路線×學期×課），在 '+SEEDS.length+' 個種子下沒有一組全部相同',tot>0&&same.length===0,same.slice(0,5).join('｜'));
  check('2  點名週都落在「那門課真的有上」的週（非假日／颱風假／國外／開局前／期末考週／學期最後一週）——台灣的學期、含重修',bad2.length===0,bad2.slice(0,8).join('｜')+(bad2.length>8?'…共 '+bad2.length:''));
  { const y4=bad2.filter(x=>/ Y4S2 .*第 15 週/.test(x)).length; info('其中「大四下第 15 週（期末考週）」'+y4+' 筆／'+bad2.length+' 筆；大四下有看出席的課（重修）的存檔共 '+y4s2N+' 份'); }
  check('2m 獨立模型＝CLS.dayItems（非考試週）',badMis.length===0,badMis.slice(0,5).join('｜'));
  check('3  人在國外的學期（CLS.termAway）不應該抽出點名週（或抽出的週要能上課）',awayRoll.length===0,awayRoll.slice(0,3).join('｜')+(awayRoll.length>3?'…共 '+awayRoll.length:''));
  if(awayInfo.length) info('國外學期的 rollWeeks（舉例）：'+awayInfo.slice(0,3).join('｜'));
  return {bad2,awayRoll}; }

/* 1d：真正的新遊戲沒有 examSeed */
function suiteNoSeed(){ const a=mk(1,null,true), b=mk(2,null,true); delete a.flags.examSeed; delete b.flags.examSeed;
  const c=CLS.byId('chinese_y1'); const wa=CLS.rollWeeks(a,c,'Y1S1'), wb=CLS.rollWeeks(b,c,'Y1S1');
  const cs=CLS.termCourses(a,'Y1S1').filter(CLS.attCourse); const sameAll=cs.every(x=>J(CLS.rollWeeks(a,x,'Y1S1'))===J(CLS.rollWeeks(b,x,'Y1S1')));
  /* 之後才有 examSeed（第一次 drawExam）：已經存進 R.roll 的不會變 */
  a.flags.examSeed=987654; const wa2=CLS.rollWeeks(a,c,'Y1S1');
  /* 大一上第一次 drawExam（期末考）在哪一天 vs 第一堂看出席的課 */
  const ex=CLS.examList(a,'Y1S1').map(e=>e.day).sort((x,y)=>x-y)[0]; let first=null; const r=CALENDAR.termDays('Y1S1'); for(let d=r.from;d<=r.to&&first==null;d++) if(CLS.dayItems(a,d).some(it=>CLS.attCourse(it.c))) first=d;
  const g3=fs.readFileSync(path.join(SRC,'src/game3d.js'),'utf8'); const mDef=g3.match(/function defaults\(name\)\{[^\n]*?\}; \}/); const defHas=mDef?/examSeed/.test(mDef[0]):null;
  info('game3d.js defaults() 有沒有 examSeed：'+defHas+'；src 裡設定 examSeed 的地方只有 CLS.drawExam、postgrad');
  info('新遊戲 8/29 開局：第一堂看出席的課 '+(first!=null?CALENDAR.dateOf(first).key:'?')+'，第一次期末考（第一次 drawExam、才設 examSeed）'+(ex!=null?CALENDAR.dateOf(ex).key:'?'));
  info('沒有 examSeed：玩家甲 國文（上）'+J(wa)+'、玩家乙 '+J(wb)+'；之後補上 examSeed 再問：'+J(wa2)+'（照 R.roll）');
  check('1d 真正的新遊戲（flags 沒有 examSeed）：兩個玩家的大一上點名週不同',!sameAll,'大一上 '+cs.length+' 門看出席的課全部相同（種子落到 0）');
  return {wa,wb,first,ex,defHas}; }

/* ================= 4：attPass 邊界 ================= */
const itemsOf=(G,cid,term)=>{ const out=[]; const r=CALENDAR.termDays(term); for(let d=r.from;d<=r.to;d++) for(const it of CLS.dayItems(G,d)) if(it.c.id===cid&&it.term===term) out.push(it); return out; };
const go=(G,its,late)=>{ const R=CLS.rec(G); for(const it of its){ R.done[it.key]=1; R.attend[it.c.id]=(R.attend[it.c.id]||0)+1; if(late) R.abs[it.key]=1; } };
function suiteAttPass(){ const out={}; const c=CLS.byId('chinese_y1'), T='Y1S1';
  for(const seed of SEEDS.slice(0,3)) for(const order of ['前','後']) for(let k=0;k<=4;k++){ const G=mk(seed,null,true); const W=CLS.rollWeeks(G,c,T); const its=itemsOf(G,c.id,T);
      const miss=order==='前'?W.slice(0,k):W.slice(W.length-k); go(G,its.filter(it=>!miss.includes(it.week)));   /* 非點名週全去（出席很多次，舊規則會過）；點名週缺 k 次 */
      const st=CLS.rollStat(G,c,T), pass=CLS.attPass(G,c,T), rep=CLS.reportFor(G,T)[c.id], fl=CLS.failedIn(G,T).some(x=>x.id===c.id);
      const want=k<3; out[k]=out[k]||[]; out[k].push(pass);
      check('4  種子'+seed+' 缺'+order+' '+k+' 次（出席 '+CLS.rec(G).attend[c.id]+' 次）→ '+(want?'及格':'不及格'),pass===want&&st.missed===k&&(rep==='及格')===want&&fl===!want,J({missed:st.missed,pass,rep,failedIn:fl})); }
  /* 遲到算缺：點名週都去了，但其中 3 次遲到超過 15 分鐘（R.abs）*/
  { const G=mk(777,null,true); const W=CLS.rollWeeks(G,c,T); const its=itemsOf(G,c.id,T); go(G,its.filter(it=>!W.slice(0,3).includes(it.week))); go(G,its.filter(it=>W.slice(0,3).includes(it.week)),true);
    const st=CLS.rollStat(G,c,T); check('4  點名週 3 次遲到超過 15 分鐘（R.abs）＝缺 3 次＝不及格',st.missed===3&&!CLS.attPass(G,c,T),J(st)); }
  /* 舊存檔保底：rollSince 在學期開始之後 */
  for(const n of [2,3]){ const G=mk(777,null,true); G.courses.rollSince=PG.DK('2025-11-01'); const W=CLS.rollWeeks(G,c,T); const its=itemsOf(G,c.id,T); go(G,its.filter(it=>!W.includes(it.week)).slice(0,n));
    const pass=CLS.attPass(G,c,T); check('4  舊存檔（這學期在改規則前開始）、點名全缺、出席 '+n+' 次 → '+(n>=CLS.ATT_PASS?'及格（舊規則保底）':'不及格'),pass===(n>=CLS.ATT_PASS),J({pass,missed:CLS.rollStat(G,c,T).missed})); }
  /* 新存檔（rollSince 在學期之前）不吃保底 */
  { const G=mk(777,null,true); G.courses.rollSince=PG.DK('2025-08-29'); const W=CLS.rollWeeks(G,c,T); const its=itemsOf(G,c.id,T); go(G,its.filter(it=>!W.includes(it.week)));
    check('4  新遊戲（rollSince＝8/29，學期開始前）點名全缺、出席 '+CLS.rec(G).attend[c.id]+' 次 → 不及格（不吃舊規則保底）',!CLS.attPass(G,c,T)); }
  /* 重修課：真的 planRetakes */
  for(const k of [2,3]){ const G=mk(12345,null,true); CLS.planRetakes(G,T); const rc=CLS.termCourses(G,'Y1S2').find(x=>x.rt&&x.id===c.id);
    if(!check('4  國文（上）沒去 → 大一下排重修',!!rc)) break; const W=CLS.rollWeeks(G,rc,'Y1S2'); const its=itemsOf(G,c.id,'Y1S2'); go(G,its.filter(it=>!W.slice(0,k).includes(it.week)));
    const pass=CLS.attPass(G,rc,'Y1S2'); check('4  重修（大一下）缺 '+k+' 次 → '+(k<3?'及格':'不及格'),pass===(k<3)&&CLS.rollStat(G,rc,'Y1S2').missed===k,J({W,pass})); }
  /* 3：US 路線大四上（整學期在國外）的成績單 vs failedIn */
  { const G=mk(777,'US',true); const cs=CLS.termCourses(G,'Y4S1').filter(CLS.attCourse); const rep=CLS.reportFor(G,'Y4S1'), fl=CLS.failedIn(G,'Y4S1');
    const bad=cs.filter(x=>/不及格/.test(rep[x.id]||'')&&!fl.includes(x));
    info('US 大四上看出席的課：'+cs.map(x=>x.id).join('、')+'；reportFor='+J(cs.map(x=>rep[x.id]))+'；failedIn='+J(fl.map(x=>x.id))+'；retake 排出 '+J(CLS.planRetakes(G,'Y4S1')));
    check('3  US 路線大四上（人在美國，CLS.termAway）：reportFor 不應寫「不及格（下學期重修）」而 failedIn 說沒被當',bad.length===0,bad.map(x=>x.id+'='+rep[x.id]).join('、')); }
  /* 3：JP 路線大三下沒有台灣的看出席的課 */
  { const G=mk(777,'JP',true); const cs=CLS.termCourses(G,'Y3S2').filter(CLS.attCourse); check('3  JP 路線大三下（JP.skipTerm）：台灣的看出席的課 0 門',cs.length===0,cs.map(x=>x.id).join('、')); }
  return out; }

/* ================= 執行 ================= */
const t0=Date.now();
console.log('\n== 程式常數 ==');
info('ROLL_N='+CLS.ROLL_N+' ROLL_FAIL='+CLS.ROLL_FAIL+' ATT_PASS='+CLS.ATT_PASS+' ROLL_WEEKS='+J(CLS.ROLL_WEEKS));
info('各學期週數：'+TERMS.map(t=>t+'='+TDEF(t).weeks).join(' ')+'；颱風假：'+(()=>{ const out=[]; for(let d=-600;d<1500;d++) if(CALENDAR.typhoon(d)) out.push(CALENDAR.dateOf(d).key+'('+((CALENDAR.termOf(d)||{}).id||'-')+' W'+((CALENDAR.termOf(d)||{}).week||'-')+')'); return out.join(' '); })());
console.log('\n== 1d 新遊戲沒有 examSeed ==');
const nos=suiteNoSeed();
console.log('\n== 1、2、3 點名週 ==');
const wk=suiteWeeks();
console.log('\n== 4 attPass 邊界 ==');
suiteAttPass();
const realFails=fails, realList=FAILS.slice();
console.log('\n本體：'+(realFails?('FAIL '+realFails+' 項'):'全部 PASS')+'（'+((Date.now()-t0)/1000).toFixed(1)+' 秒）');

/* ================= MUT：故意改壞，證明檢查抓得到 ================= */
if(!NOMUT){ console.log('\n== MUT 故意改壞（每一種都應該讓對應的檢查 FAIL）==');
  const save={RW:CLS.ROLL_WEEKS,RN:CLS.ROLL_N,RF:CLS.ROLL_FAIL,rw:CLS.rollWeeks,rs:CLS.rollStat,hol:CALENDAR.holiday};
  const restore=()=>{ CLS.ROLL_WEEKS=save.RW; CLS.ROLL_N=save.RN; CLS.ROLL_FAIL=save.RF; CLS.rollWeeks=save.rw; CLS.rollStat=save.rs; CALENDAR.holiday=save.hol; };
  const SEED_BAK=SEEDS.slice();
  /* 同樣 4 個種子、沒改壞時的 FAIL 清單（本體已經有的 FAIL 不算「抓到」：改壞以後要多出新的 FAIL 字串才算）*/
  const runQ=(setup,suite)=>{ SEEDS.length=0; SEED_BAK.slice(0,4).forEach(s=>SEEDS.push(s)); fails=0; FAILS.length=0; quiet=true; setup(); let err=null; try{ suite(); }catch(e){ err=e; } restore(); quiet=false; SEEDS.length=0; SEED_BAK.forEach(s=>SEEDS.push(s)); return {err,list:FAILS.slice()}; };
  const base=new Map(); for(const su of [suiteWeeks,suiteAttPass]) base.set(su,new Set(runQ(()=>{},su).list));
  const mut=(name,setup,suite)=>{ const r=runQ(setup,suite); const nw=r.list.filter(x=>!base.get(suite).has(x));
    const caught=nw.length>0||!!r.err; console.log((caught?'PASS ':'FAIL ')+'MUT '+name+' → '+(r.err?'例外 '+r.err.message:(caught?'多出 '+nw.length+' 項 FAIL：'+nw.slice(0,2).map(s=>s.slice(0,110)).join('｜'):'沒有多出新的 FAIL（沒抓到）'))); if(!caught) mutMiss++; };
  let mutMiss=0;
  mut('ROLL_WEEKS 加入 8、9、16（期中週、期末考週）',()=>{ CLS.ROLL_WEEKS=save.RW.concat([8,9,16]); },suiteWeeks);
  mut('抽週時不排除假日（CALENDAR.holiday 在 rollWeeks 裡當作沒有）',()=>{ CLS.rollWeeks=function(){ CALENDAR.holiday=()=>null; try{ return save.rw.apply(this,arguments); } finally { CALENDAR.holiday=save.hol; } }; },suiteWeeks);
  mut('ROLL_N=3',()=>{ CLS.ROLL_N=3; },suiteWeeks);
  mut('種子沒用到（examSeed 一律當 0）',()=>{ CLS.rollWeeks=function(G,c,t){ const s=G.flags.examSeed; G.flags.examSeed=0; try{ return save.rw.call(this,G,c,t); } finally { G.flags.examSeed=s; } }; },suiteWeeks);
  mut('不存 R.roll、每次照當下狀態重抽（第二次呼叫換一組）',()=>{ let n=0; CLS.rollWeeks=function(G,c,t){ const r=save.rw.call(this,G,c,t); if(G.courses.roll) delete G.courses.roll[t+':'+c.id]; return (n++%2)?r.slice().reverse():r; }; },suiteWeeks);
  mut('ROLL_FAIL=4（缺 3 次還及格）',()=>{ CLS.ROLL_FAIL=4; },suiteAttPass);
  mut('ROLL_FAIL=2（缺 2 次就不及格）',()=>{ CLS.ROLL_FAIL=2; },suiteAttPass);
  mut('rollStat 忽略遲到（R.abs）',()=>{ CLS.rollStat=function(G){ const R=CLS.rec(G), a=R.abs; R.abs={}; try{ return save.rs.apply(this,arguments); } finally { R.abs=a; } }; },suiteAttPass);
  console.log('MUT：'+(mutMiss?('有 '+mutMiss+' 種沒抓到'):'每一種都抓到'));
}
fails=realFails;
console.log('\n總結：本體 '+(realFails?('FAIL '+realFails+' 項：\n  - '+realList.map(s=>s.slice(0,300)).join('\n  - ')):'全部 PASS')+'\n（'+((Date.now()-t0)/1000).toFixed(1)+' 秒）');
process.exit(realFails?1:0);

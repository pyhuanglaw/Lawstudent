// CC K1「交換路線（JP、US）的核心玩法」——只用 Node，不開瀏覽器、不改 src/。
// 用法：
//   cd /home/user/Lawstudent && git archive <SHA> src tests index.html | tar -x -C <資料夾>
//   nice -n 19 node docs/story_planning/test_tools/cc/k1_exchange.js <資料夾> [種子數，預設 3] [--no-mut] [--v]
//   （<資料夾>＝有 src/、index.html 的受測版本根目錄；載入照 index.html 的順序，game3d.js 除外：test_tools/cc/n56_loadall.js）
// 做什麼（全部呼叫遊戲真的函式；假的只有 GM 的畫面）：
//   新遊戲放在 2027-09-01（大三上開學前），EXCHANGE_ROUTE＝TW／JP／US，一路走到大五上（Y5S1）結束：
//   - 每學期：每天 CLS.dayItems（課表、考試）、考前一週週日 20:00 STUDY.remind、STUDY.reviewInfo（總複習）、學期中 STUDY.courses（手機「法律」頁的「這學期」）、
//     期末週照 dayItems 的考試真的 CLS.runExam（答對幾題照情境）、成績公布日早上 CLS.morning（真的發成績單、真的 planRetakes；國外那幾天發不到的，回國隔天早上發）。
//   - JP 大三下：照 JP.classesOn 的日本課表真的 JP.attend（每科上 0／5／全部 次，照種子），成績單由 CLS.morning → JP.showGrades（JP.report／CLS.gradeOf）。
//   - US 大四上：8/2 起 US_DEPARTED／US_ARRIVED、12/23 US_RETURNED（exchange3d.js 的旗標），成績單由 CLS.morning → us_life3d.js 的 showGrades。
//   - 6/18 大四下成績單：CLS.showGrades 包著 FD.check（faildelay3d.js）。大五上：Y5.classItems（y5s1_3d.js）、FD.items、FD.result。
// 情境（每條路線 × 每個種子）：
//   pass   全部及格（每科答對 1～5 題，照種子）
//   mid    國外學期前一學期被當一科（TW、JP＝大三上；US＝大三下），重修要跳過國外學期；JP 另外大四上也當一科（重修排進有日本補修的大四下）
//   y4s2   大四下被當一科（TW＝海商法；JP 照種子輪：海商法／民訴甲下補修／保險法補修；US＝海商法）
//   y4s2b  （JP、US）國外學期前一學期被當一科、重修那一學期又被當（被當的重修課進 FAIL_DELAY_COURSES）
// 檢查（FAIL 計數；每一項寫了壞掉時哪裡會 FAIL）：
//   A 國外學期：台灣的課 0 堂、考試 0 場（dayItems）、沒有 R.exam 紀錄、STUDY.remind 不發、reviewInfo＝null、failedIn＝[]、不排重修、「法律」頁「這學期」沒有台灣的課
//   B 前後學期（含回國那一學期）正常：dayItems 的考試＝examList、每科都考到、提醒有發、總複習開得了、答錯有訂正筆記（examfix_<學期:課:final>）、學過 x≤y 且 y＞0
//   C 成績單：JP 大三下＝日本兩門、等第＝出席次數照 10／5 門檻（獨立算）；US 大四上＝三門「通過」；其他學期照 reportFor
//   D 重修：排到的學期不是國外學期、等於「下一個不在國外的學期」（JP 大三上→大四上、US 大三下→大四下、TW 大三上→大三下），排進去的學期時段不重疊
//   E 大四下被當：TW＝排補考（FD_MAKEUP pending）；JP／US＝不排補考、FAIL_DELAY_COURSES＝被當的那幾門、FAIL_DELAY 不設、PG.delayed／exchDelayed／Y5.delayed 成立
//   F 大五上：US 有補修強制執行法（週一）、法律倫理（週三）；被當的課（FD）在 Y5.classItems 每週都排得到（≥3 堂）
//   G 畢業判定：全部及格的 TW＝不延畢；JP／US＝交換延畢（PG.exchDelayed）；全部及格的 FAIL_DELAY_COURSES＝[]
//   INFO（不計 PASS/FAIL，交 BB 判定）：交換路線又被當的重修沒去（FD.result）、FD.clsStop、examList 對國外學期回傳的東西、法律頁在國外學期名下列出的課
//   MUT 突變測試：故意改壞（termAway 不認國外、重修不跳國外、FD 對交換也排補考、日本成績等第、FD.items 空），上面的檢查必須 FAIL
'use strict';
const path=require('path');
const argv=process.argv.slice(2);
const ROOT=path.resolve(argv[0]&&!argv[0].startsWith('--')?argv[0]:'.');
const NSEED=+(argv.slice(1).find(a=>/^\d+$/.test(a))||3);
const NOMUT=argv.includes('--no-mut'), VERB=argv.includes('--v');
const LD=require(path.join(__dirname,'n56_loadall.js'))(ROOT);
console.log('受測 ROOT：'+ROOT+'　載入 '+LD.loaded.length+' 檔、失敗 '+LD.failed.length+(LD.failed.length?'（'+LD.failed.map(f=>f[0].replace('src/','')).join('、')+'）':'')+'　種子數 '+NSEED);
const need=['CLS','STUDY','JP','FD','Y5','PG','USL','EXCH','STORY','CALENDAR','PHONE','SOCIAL','EVENTS','INV','HONOR','GRADES','EXAM_BANK'];
{ const miss=need.filter(n=>typeof global[n]==='undefined'); if(miss.length){ console.log('FAIL 缺模組：'+miss.join('、')); process.exit(2); } }
const LOG=console.log; console.warn=()=>{}; console.error=()=>{};
const J=JSON.stringify;

/* ---------- 假的 GM ---------- */
const H={G:null,said:[]};
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0,speed:0,pose:'idle'},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,paused:false};
let answer=null;   /* (ts)=>index：考試作答 */
const GM={get G(){ return H.G; },E,D:{active:false},npc:{},running:true,
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},energy(){},money(){},setGoal(){},updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){},standUp(){},toast(){},
  addNote(id,title,body){ const G=H.G; G.notes=G.notes||[]; if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); return true; },
  hasNote(id){ return !!(H.G.notes||[]).find(n=>n.id===id); },
  titleCard:async()=>{},enter:async(z)=>{ H.G.zone=z; },advance(h){ H.G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},
  phoneThread:async()=>{}, openPhone(){},
  say:async(who,t)=>{ H.said.push(String(t)); if(H.said.length>3000) H.said.splice(0,1500); },
  choose:async o=>{ const ts=o.map(q=>String(q.t||q.text||'')); return answer?answer(ts):0; }};
const DK=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const RD=STORY.ROUTE_DATES;
function routeFlags(G){ const F=G.flags, r=F.EXCHANGE_ROUTE, d=G.day;
  if(r==='JP'){ if(d>=DK(RD.JP.dep)&&F.JP_DEPARTED==null) F.JP_DEPARTED=DK(RD.JP.dep); if(d>=DK(RD.JP.ret)&&F.JP_RETURNED==null) F.JP_RETURNED=DK(RD.JP.ret); }
  if(r==='US'){ if(d>=DK(RD.US.dep)){ F.US_DEPARTED=true; if(!F.US_ARRIVED){ F.US_ARRIVED=true; F.US_ARRIVED_DAY=DK(RD.US.dep); } } if(d>=DK(RD.US.ret)&&F.US_RETURNED==null) F.US_RETURNED=DK(RD.US.ret); } }
const setDay=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); E.hour=h; routeFlags(G); };
function fresh(route,seed){ const day=DK('2027-09-01');
  H.G={v:3,day,hour:8,zone:'dorm',stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:{KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:9,examSeed:5000+seed*37,EXCHANGE_ROUTE:route},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},notes:[],memo:[]};
  SOCIAL.bind(H.G); EVENTS.bind(GM); INV.rec(H.G); if(STORY._fy&&STORY._fy.reset) STORY._fy.reset(); if(CLS.resetExamMemo) CLS.resetExamMemo(); CLS.rec(H.G); H.said=[]; return H.G; }

/* ---------- 紀錄 ---------- */
let fails=0, quiet=false; const FAILS=[], INFO=[];
const check=(name,ok,info)=>{ if(!ok){ fails++; FAILS.push(name+(info?'　'+info:'')); } if(!quiet&&(VERB||!ok)) LOG((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); return ok; };
let nCheck=0; const chk=(...a)=>{ nCheck++; return check(...a); };
const info=t=>{ if(!quiet){ INFO.push(t); } };
const rngOf=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
const qOf=id=>EXAM_BANK.questions.find(q=>q.id===id)||(typeof QBANK!=='undefined'&&QBANK.find(q=>q.id===id))||null;

/* ---------- 考試作答：要被當＝五題全錯；要及格＝前 k 題對（k＝1～5） ---------- */
const QRE=/^(\d)／5　/;
async function takeExam(it,wantCorrect){ const G=H.G, d=CLS.drawExam(G,it.c.id,it.term,it.exam); const qs=d.ok?d.qs:null; let n=0;
  answer=ts=>{ const last=H.said[H.said.length-1]||''; const m=QRE.exec(last); if(!m||!qs) return 0; const q=qs[+m[1]-1]; const ok=x=>x===String(q.answer)||x.startsWith('（'+q.answer+'）');
    const want=(+m[1])<=wantCorrect; const k=want?ts.findIndex(ok):ts.findIndex(x=>!ok(x)); n++; return k<0?0:k; };
  try{ return await CLS.runExam(GM,it); } finally{ answer=null; } }

const TERMS=['Y3S1','Y3S2','Y4S1','Y4S2'];
const awayOf=r=>r==='JP'?'Y3S2':r==='US'?'Y4S1':null;
const preOf=r=>r==='US'?'Y3S2':'Y3S1';   /* 國外學期的前一學期（被當的那一科要跳過國外學期）*/
const retExpect={TW:{Y3S1:'Y3S2',Y3S2:'Y4S1',Y4S1:'Y4S2'},JP:{Y3S1:'Y4S1',Y4S1:'Y4S2'},US:{Y3S1:'Y3S2',Y3S2:'Y4S2'}};

/* 這一學期要當哪幾科（課 id 的 Set）*/
function failPick(sc,route,seed,T,list){ const ids=list.map(e=>e.c.id), base=list.filter(e=>!e.c.rt).map(e=>e.c.id), out=new Set();
  if(sc==='mid'){ if(T===preOf(route)&&base.length) out.add(base[seed%base.length]); if(route==='JP'&&T==='Y4S1'&&base.length) out.add(base[(seed+1)%base.length]); }
  if(sc==='y4s2'&&T==='Y4S2'){ const pool=route==='JP'?['maritime','civpro_2_re','insurance_re']:['maritime']; const c=pool[seed%pool.length]; if(ids.includes(c)) out.add(c); }
  if(sc==='y4s2b'){ if(T===preOf(route)&&base.length) out.add(base[seed%base.length]); if(TERMS.indexOf(T)>TERMS.indexOf(preOf(route))) for(const e of list) if(e.c.rt) out.add(e.c.id); }   /* 重修那一門每一次都當，一路到大四下 */
  return out; }

/* 時段重疊 */
function overlaps(G,T){ const seen={}, bad=[]; for(const c of CLS.termCourses(G,T)) for(const s of c.slots){ const k=s.wd+':'+s.block; if(seen[k]) bad.push(k+' '+seen[k]+'／'+c.id); else seen[k]=c.id; } return bad; }
const gradeOfIndep=n=>n>=10?'很好':(n>=5?'不錯':'過了');   /* jp3d.js 檔頭：10 次以上很好、5 次以上不錯 */

async function scenario(route,seed,sc){ const tag='['+route+' s'+seed+' '+sc+']'; const G=fresh(route,seed), R=CLS.rec(G), rnd=rngOf(seed*7919+route.length*31+sc.length);
  const away=awayOf(route), res={tag,route,seed,sc,failed:{},exams:{},grades:{},retakes:[],jpN:null};
  for(const T of TERMS){ const isAway=CLS.termAway(G,T)||false, r=CALENDAR.termDays(T);
    chk(tag+' A0 '+T+' termAway＝'+(T===away),isAway===(T===away),'termAway='+isAway);
    /* 每天的課表 */
    let items=0, exItems=0, abroadItems=0; const exRun=[];
    const failSet=failPick(sc,route,seed,T,CLS.examList(G,T)); res.failed[T]=[...failSet];
    /* JP 大三下：日本的課（attend 次數照種子）*/
    const jpPlan=route==='JP'&&T==='Y3S2'?[0,5,99][seed%3]:null; const jpDone={};
    const mid=r.from+35;
    for(let d=r.from;d<=r.to+1;d++){ setDay(d,8); const its=CLS.dayItems(G,d); items+=its.length;
      if(STORY.abroad(G)) abroadItems+=its.length;
      if(d===mid){ const cur=STUDY.courses(G).filter(e=>e.current); res['cur_'+T]=cur.map(e=>e.c.id);
        if(isAway) chk(tag+' A6 '+T+'（國外）學期中，手機「法律」頁「這學期」沒有台灣的課（STUDY.courses current）',!cur.length,J(cur.map(e=>e.c.id)));
        else { for(const e of cur){ const p=STUDY.progress(G,e.c,'final',T); chk(tag+' B6 '+T+' 學過 x≤y、y＞0 '+e.c.id,p.total>0&&p.heard<=p.total,J(p));
            const rd=CLS.redoOf&&CLS.redoOf(e.c.id); if(rd){ const pb=STUDY.units(G,CLS.byId(rd.id),rd.term,'final').length; chk(tag+' B6b '+T+' 日本補修 '+e.c.id+' 的 y＝原課（'+rd.id+' '+rd.term+'）的觀念卡數 '+pb,p.total===pb,J(p)); } } } }
      for(const it of its){ if(!it.exam) continue; exItems++; if(isAway) continue; setDay(d,it.t0); const want=failSet.has(it.c.id)?0:1+Math.floor(rnd()*5); const r0=await takeExam(it,want); exRun.push({id:it.c.id,day:d,want,held:r0&&r0.held,correct:r0&&r0.correct}); } }
    /* 日本的學期（4/10～7/21，比台灣的大三下長）：照 JP.classesOn 一天一天上 */
    if(jpPlan!=null){ for(let d=JP.D('term0');d<=JP.D('term1');d++){ setDay(d,8); for(const it of JP.classesOn(G,d)){ jpDone[it.c.id]=jpDone[it.c.id]||0; if(jpDone[it.c.id]>=jpPlan||JP.special(G,it)==='g5') continue; setDay(d,it.t0-0.5); try{ if(await JP.attend(GM,it)) jpDone[it.c.id]++; }catch(e){ info(tag+' JP.attend 例外 '+e); } } }
      res.jpMax=jpDone; }
    res.exams[T]=exRun; res.jpN=jpPlan!=null?Object.assign({},JP.rec(G).n):res.jpN;
    const exKeys=Object.keys(R.exam||{}).filter(k=>k.startsWith(T+':'));
    /* 提醒、總複習（考前一週週日）*/
    const rdDay=STUDY.remindDay(T); let sent=null, rv=null; if(rdDay!=null){ setDay(rdDay,20.5); sent=!!STUDY.remind(G)||PHONE.sent(G,'review_'+T); }
    /* reviewInfo 要在考前看：另外開一份同樣的存檔不行（考完了），改用 examList＋R.exam 的狀態推：這裡在提醒那天看 reviewTerm 的條件 → 用備份：把這學期的考試紀錄暫時拿掉 */
    { const bak={}; for(const k of exKeys){ bak[k]=R.exam[k]; delete R.exam[k]; } if(rdDay!=null){ setDay(rdDay,21); rv=STUDY.reviewInfo(G,'final'); } for(const k in bak) R.exam[k]=bak[k]; }
    const el=CLS.examList(G,T);
    if(isAway){
      chk(tag+' A1 '+T+'（國外）台灣的課 0 堂、考試 0 場（dayItems）',items===0&&exItems===0,'課 '+items+'、考試 '+exItems);
      chk(tag+' A2 '+T+'（國外）沒有期末考紀錄（R.exam）',exKeys.length===0,J(exKeys));
      chk(tag+' A3 '+T+'（國外）考前一週不發總複習提醒（STUDY.remind）',!sent,'sent='+sent);
      chk(tag+' A4 '+T+'（國外）總複習開不了（STUDY.reviewInfo＝null）',!rv,J(rv&&rv.courses.map(x=>x.c.id)));
      if(el.length) info(tag+' '+T+'（國外）CLS.examList 仍回傳 '+el.length+' 場：'+el.map(e=>e.c.id+'@'+key(e.day)).join('、')+'（dayItems 沒有排；examList 的其他呼叫者見報告）');
    } else {
      chk(tag+' B0 '+T+' 人在國外的那幾天台灣的課 0 堂',abroadItems===0,'abroad items '+abroadItems);
      const want=el.map(e=>e.c.id).sort(), got=exRun.filter(x=>x.held).map(x=>x.id).sort();
      chk(tag+' B1 '+T+' 期末考：dayItems 排的考試＝examList，每科都考到（'+want.length+' 科）',J(want)===J(got)&&want.length>0,'examList '+J(want)+' 考到 '+J(got));
      chk(tag+' B2 '+T+' 考前一週週日 20:00 有總複習提醒',!!sent,'sent='+sent+' remindDay='+(rdDay!=null?key(rdDay):null));
      chk(tag+' B3 '+T+' 總複習開得了、範圍＝這學期的考試',!!rv&&rv.term===T&&rv.courses.length===el.length,J(rv&&{term:rv.term,n:rv.courses.length}));
      const miss=exRun.filter(x=>x.held&&x.correct<5&&!(G.notes||[]).some(n=>n.id==='examfix_'+T+':'+x.id+':final'));
      chk(tag+' B4 '+T+' 答錯的考試都有訂正筆記（examfix_）',!miss.length,J(miss.map(x=>x.id)));
      const fixAway=(G.notes||[]).filter(n=>away&&n.id.startsWith('examfix_'+away+':'));
      chk(tag+' A5 國外學期 '+away+' 沒有訂正筆記',!fixAway.length,J(fixAway.map(n=>n.id)));
    }
    /* 成績單：公布日早上（人在國外＝回國隔天早上）*/
    let gd=CALENDAR.gradeDay(T); setDay(gd,8); if(STORY.abroad(G)){ const rr=DK(RD[route].ret); gd=rr+1; setDay(gd,8); }
    const rt0=(R.retake||[]).length, s0=H.said.length; await CLS.morning(GM); const said=H.said.slice(s0).join('｜');
    res.grades[T]=R.grades[T]?Object.assign({},R.grades[T]):null;
    chk(tag+' C0 '+T+' 成績單在 '+key(gd)+' 早上發了',!!R.grades[T],said.slice(0,120));
    if(T===away&&route==='JP'){ const g=R.grades.Y3S2||{}, n=JP.rec(G).n, exp={}; for(const c of JP.CLASSES) if(c.credit) exp[c.id]=gradeOfIndep(n[c.id]|0);
      chk(tag+' C1 JP 大三下成績單＝日本兩門（不含日本語）、等第照出席次數（'+J(n)+'）',J(g)===J(exp),'成績單 '+J(g)+' 應為 '+J(exp));
      chk(tag+' C1b JP 大三下成績單的字有兩門課名、沒有日本語',/日本法入門/.test(said)&&/比較行政法/.test(said)&&!/日本語/.test(said),said.slice(0,160));
      if((n.jp_law_intro|0)===0) info(tag+' JP 大三下日本的課一堂都沒上：成績單照樣「'+g.jp_law_intro+'」（CLS.gradeOf(0)，jp3d.js:438）——交 BB：出席 0 也算修過、抵學分？'); }
    if(T===away){ const g0=CALENDAR.gradeDay(T), back=DK(RD[route].ret)+1; chk(tag+' C4 國外學期的成績單在回國後的早上發得到（公布日 '+key(g0)+'～＋45 天、回國隔天 '+key(back)+'）',g0>=back||back<=g0+45,''); }
    if(T===away&&route==='US'){ const g=R.grades.Y4S1||{}; chk(tag+' C2 US 大四上成績單＝美國三門「通過」、說「三門通過」',J(g)===J({us_intro:'通過',us_comp:'通過',us_writing:'通過'})&&/三門通過/.test(said),J(g)+' '+said.slice(0,80)); }
    if(isAway){ chk(tag+' A7 '+T+'（國外）failedIn＝[]、GRADES.lv＝null、書卷獎＝false',CLS.failedIn(G,T).length===0&&GRADES.lv(G,T)==null&&!HONOR.won(G,T),J({f:CLS.failedIn(G,T).map(c=>c.id),lv:GRADES.lv(G,T)}));
      chk(tag+' A8 '+T+'（國外）發成績單不排重修',(R.retake||[]).filter(x=>x.from===T).length===0,J((R.retake||[]).filter(x=>x.from===T))); }
    else { const f=CLS.failedIn(G,T).map(c=>c.id).sort(), wf=[...failSet].sort(); chk(tag+' C3 '+T+' 被當的＝故意答 0 題的那幾科',J(f)===J(wf),'failedIn '+J(f)+' 應為 '+J(wf)); }
    /* 重修 */
    const newRt=(R.retake||[]).slice(rt0); res.retakes.push(...newRt.map(x=>({id:x.id,from:x.from,term:x.term,alt:x.alt,deferred:!!x.deferred})));
    for(const x of newRt){ chk(tag+' D1 重修 '+x.id+'（'+x.from+'）不排進國外學期',!CLS.termAway(G,x.term),x.term);
      const ex=(retExpect[route]||{})[x.from]; if(ex&&!x.deferred) chk(tag+' D2 重修 '+x.id+' '+x.from+' → '+ex,x.term===ex,'排到 '+x.term);
      const ov=overlaps(G,x.term); chk(tag+' D3 '+x.term+' 排進重修以後時段不重疊',!ov.length,J(ov)); }
    if(T!=='Y4S2'&&failSet.size&&T!=='Y4S2') chk(tag+' D4 '+T+' 被當 '+failSet.size+' 科、排了 '+newRt.length+' 門重修',newRt.length===failSet.size,J(newRt.map(x=>x.id)));
  }
  /* ---------- 6/18 之後：補考、延畢 ---------- */
  const F=G.flags, exch=route!=='TW', y4f=res.failed.Y4S2.slice().sort();
  res.FD={FAIL_DELAY_COURSES:F.FAIL_DELAY_COURSES,FAIL_DELAY:F.FAIL_DELAY,FD_MAKEUP:F.FD_MAKEUP&&F.FD_MAKEUP.courses,PGdelayed:PG.delayed(G),exch:PG.exchDelayed(G),Y5:Y5.delayed(G)};
  if(exch){
    chk(tag+' E1 交換路線大四下'+(y4f.length?'被當':'全過')+'：不排補考（沒有 FD_MAKEUP、FD.mkPending＝false）',!F.FD_MAKEUP&&!FD.mkPending(G),J(F.FD_MAKEUP));
    chk(tag+' E2 FAIL_DELAY_COURSES＝大四下被當的那幾門 '+J(y4f),Array.isArray(F.FAIL_DELAY_COURSES)&&J(F.FAIL_DELAY_COURSES.slice().sort())===J(y4f),J(F.FAIL_DELAY_COURSES));
    chk(tag+' E3 交換路線不設 FAIL_DELAY（本來就延畢）、PG.delayed／exchDelayed／Y5.delayed 成立',!F.FAIL_DELAY&&PG.delayed(G)&&PG.exchDelayed(G)&&Y5.delayed(G),J(res.FD));
  } else {
    if(y4f.length) chk(tag+' E4 TW 大四下被當（考五題的課）＝排補考 FD_MAKEUP pending、還沒延畢',FD.mkPending(G)&&J((F.FD_MAKEUP.courses||[]).slice().sort())===J(y4f)&&!F.FAIL_DELAY&&!PG.delayed(G),J(res.FD));
    else chk(tag+' G1 TW 全部及格＝不延畢（PG.delayed＝false、FAIL_DELAY_COURSES＝[]）',!PG.delayed(G)&&J(F.FAIL_DELAY_COURSES)==='[]',J(res.FD));
  }
  /* ---------- 大五上 ---------- */
  const y5=CALENDAR.termDays?(()=>{ const a=DK('2029-09-03'); return {from:a,to:a+16*7-1}; })():null; const y5it={};
  if(Y5.delayed(G)){ for(let d=y5.from;d<=y5.to;d++){ setDay(d,8); for(const it of Y5.classItems(G,d)){ const k=(it.fd?'FD:':'MK:')+it.c.id; y5it[k]=(y5it[k]||0)+1; } } }
  res.y5=y5it;
  if(route==='US') chk(tag+' F1 US 大五上補修：強制執行法、法律倫理每週都有（≥14 堂）',(y5it['MK:enforcement']|0)>=14&&(y5it['MK:legal_ethics']|0)>=14,J(y5it));
  if(route==='JP') chk(tag+' F1 JP 大五上沒有補修課（日本的補修在大四下）',!Object.keys(y5it).some(k=>k.startsWith('MK:')),J(y5it));
  if(exch&&y4f.length){ for(const id of y4f) chk(tag+' F2 大四下被當的 '+id+' 大五上排得到重修（Y5.classItems、≥3 堂）',(y5it['FD:'+id]|0)>=3,'排到 '+(y5it['FD:'+id]|0)+' 堂；FD.items 的時段 '+J(FD.slots(G).filter(x=>x.c.id===id).map(x=>x.slot)));
    /* F3 週二實習（交換版 Y5.internOn，10:00）和重修不能同一個時段；F4 課表（weekHTML 用 FD.slots）和今日頁（classItems）一致 */
    const iOn=Y5.internOn(G), B=COURSES.blocks||{}; const clash=FD.slots(G).filter(x=>{ const b=B[x.slot.block]||{}; return iOn&&x.slot.wd===2&&b.t0<=10&&b.t1>10; });
    chk(tag+' F3 大五上的重修不和週二 10:00 法律實習同一時段',!clash.length,J(clash.map(x=>x.c.id+'@週'+x.slot.wd+x.slot.block)));
    const wk=new Set(FD.slots(G).map(x=>x.c.id)); const missing=[...wk].filter(id=>!(y5it['FD:'+id]>0));
    chk(tag+' F4 課表（CLS.weekHTML 列的 FD.slots）上的重修，今日頁（Y5.classItems）也排得到',!missing.length,'課表有、今日頁沒有：'+J(missing));
    /* INFO：重修沒去 */ setDay(y5.from+5,8); const stop=FD.clsStop(G); setDay(y5.to+2,9); FD.result(G);
    info(tag+' 交換又被當、大五上重修 0 堂：FAIL_DELAY_PASS='+F.FAIL_DELAY_PASS+'、FAIL_DELAY_CERT='+F.FAIL_DELAY_CERT+'、FD.clsStop（學期第 1 週）='+stop+'（FD.on＝FAIL_DELAY 才判證書延期／停點；交換路線 FAIL_DELAY 不設）'); }
  if(!exch&&!y4f.length) chk(tag+' G2 TW 全部及格：大五上不存在（Y5.term＝null）',!Y5.term(G,DK('2029-10-01')),'');
  if(exch&&sc==='pass') chk(tag+' G3 交換全部及格：FAIL_DELAY_COURSES＝[]、大五上沒有重修',J(F.FAIL_DELAY_COURSES)==='[]'&&!Object.keys(y5it).some(k=>k.startsWith('FD:')),J(res.FD)+J(y5it));
  /* INFO：法律頁在國外學期名下列出的課（學期結束以後）*/
  if(away){ setDay(DK('2029-07-01'),9); const L=STUDY.courses(G).filter(e=>e.term===away); if(L.length) info(tag+' 畢業後「法律」頁在 '+away+'（人在國外的學期）名下列出：'+L.map(e=>e.c.id+'（'+e.c.name+'）').join('、')); }
  return res; }

/* ---------- 跑 ---------- */
const SC={TW:['pass','mid','y4s2'],JP:['pass','mid','y4s2','y4s2b'],US:['pass','mid','y4s2','y4s2b']};
async function suite(seeds,routes,scs){ const out=[]; for(const route of routes) for(const s of seeds) for(const sc of SC[route]) if(!scs||scs.includes(sc)){ try{ out.push(await scenario(route,s,sc)); }catch(e){ chk('['+route+' s'+s+' '+sc+'] 沒有例外',false,String(e&&e.stack||e).slice(0,400)); } } return out; }

(async()=>{
  const seeds=[...Array(NSEED)].map((_,i)=>i+1);
  const RES=await suite(seeds,['TW','JP','US']);
  LOG('\n== 摘要表（每個情境）==');
  for(const r of RES){ LOG(r.tag+'　被當 '+J(r.failed)+'　重修 '+J(r.retakes.map(x=>x.id+':'+x.from+'→'+x.term+(x.alt?'(換時段)':'')))+'\n   成績單 Y3S2='+J(r.grades.Y3S2)+' Y4S1='+J(r.grades.Y4S1)+' Y4S2='+J(r.grades.Y4S2)+(r.jpN?'　JP 出席 '+J(r.jpN):'')+'\n   延畢 '+J(r.FD)+'　大五上 '+J(r.y5)); }
  LOG('\n== INFO（不計 PASS/FAIL，交 BB）=='); const seen=new Set(); for(const t of INFO){ const k=t.replace(/^\[[^\]]+\]\s*/,''); if(seen.has(k)) continue; seen.add(k); LOG('  '+t); }
  const realFails=fails, realN=nCheck, realList=FAILS.slice();
  /* ---------- 突變 ---------- */
  if(!NOMUT){ LOG('\n== 突變測試（每一種都要被抓到；這一段的 FAIL 不算進總數）==');
    const run=async(name,patch,unpatch,routes,scs)=>{ const f0=fails, n0=FAILS.length; quiet=true; patch(); try{ await suite([1],routes,scs); }catch(e){} finally{ unpatch(); quiet=false; } const base=new Set(realList.map(t=>t.split('　')[0])); const caught=FAILS.slice(n0).filter(t=>!base.has(t.split('　')[0])); fails=f0; FAILS.length=n0;   /* 只算基準跑沒有的 FAIL（基準本來就 FAIL 的不算抓到）*/
      LOG((caught.length?'PASS ':'FAIL ')+'突變 '+name+' → '+(caught.length?'被抓到（'+caught.length+' 項 FAIL，例：'+caught[0].slice(0,90)+'）':'沒被抓到')); if(!caught.length) fails++; };
    const ta=CLS.termAway; await run('M1 CLS.termAway 不認國外學期',()=>{ CLS.termAway=()=>false; },()=>{ CLS.termAway=ta; },['US'],['pass']);
    const rta=CLS.retakeTermAfter; await run('M2 重修不跳過國外學期',()=>{ CLS.retakeTermAfter=(G,t)=>{ const i=CLS.LAW_TERMS.indexOf(t); return i<0?null:(CLS.LAW_TERMS[i+1]||null); }; },()=>{ CLS.retakeTermAfter=rta; },['JP'],['mid']);
    const fc=FD.check; await run('M3 FD.check 對交換路線也排補考',()=>{ FD.check=async function(){ const r0=STORY.routeAbroadRoute; STORY.routeAbroadRoute=()=>null; try{ return await fc.apply(this,arguments); } finally{ STORY.routeAbroadRoute=r0; } }; },()=>{ FD.check=fc; },['JP'],['y4s2']);
    const go=CLS.gradeOf; await run('M4 日本成績等第一律「過了」',()=>{ CLS.gradeOf=()=>'過了'; },()=>{ CLS.gradeOf=go; },['JP'],['pass','mid']);
    const fi=FD.items; await run('M5 大五上不排被當的重修（FD.items 空）',()=>{ FD.items=()=>[]; },()=>{ FD.items=fi; },['JP'],['y4s2']);
    const rm=STUDY.remind; await run('M6 總複習提醒不看國外學期',()=>{ const ta2=CLS.termAway; STUDY.remind=function(G){ CLS.termAway=()=>false; try{ return rm.apply(this,arguments); } finally{ CLS.termAway=ta2; } }; },()=>{ STUDY.remind=rm; },['US'],['pass']);
  }
  LOG('\n== 結果 ==');
  LOG('檢查 '+realN+' 項，FAIL '+realFails+' 項'+(NOMUT?'':'；突變漏抓 '+(fails-realFails)+' 種'));
  if(realList.length){ LOG('FAIL 清單（去重）：'); const s=new Set(); for(const t of realList){ const k=t.replace(/^\[[^\]]+\]\s*/,'').replace(/\s+s\d+\s+/,' '); if(s.has(k)) continue; s.add(k); LOG('  '+t.slice(0,300)); } }
  LOG(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ LOG('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

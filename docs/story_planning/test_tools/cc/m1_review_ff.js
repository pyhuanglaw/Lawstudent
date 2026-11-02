// CC M1「一鍵總複習＋快轉停點」探針（BB 測試總監；CC 執行）——只用 Node，不開瀏覽器、不改 src/。
// 用法：
//   nice -n 19 node docs/story_planning/test_tools/cc/m1_review_ff.js <受測 ROOT> [--terms Y1S1,Y1S2,...] [--sc A,B] [--no-fd] [--json out.json]
//   （全部跑一次約 6～8 分鐘；CPU 緊時分批：--terms Y1S1,Y1S2,Y2S1 --no-fd ／ --terms "" 只跑延畢）
//   <受測 ROOT>＝有 src/、index.html 的資料夾（例：git archive 5b40dad61 src tests index.html | tar -x -C <dir>）
// 做什麼：
//   照 index.html 的順序載入全部 src/（game3d.js 除外，test_tools/cc/n56_loadall.js），假的 GM；新遊戲（臺灣路線）放到每一學期第一個能快轉的晚上 22:00、宿舍，
//   一直按床的「快轉 → 到下一個有事的時候」（SEMFF.menu）到學期最後一天 20:00。每一次停下來照玩家會做的處理：
//     期末考／有劇情的課＝去考（CLS.runExam，答案都選第一個）／當作上完（劇情不演）；新成立的一定要演的事件＝記成演過；該出發的出遊＝取消；其他照原本時間接著快轉。
//   情境 A：停在「考前一週週日 20:00」提醒時選「考前總複習」；情境 B：選「繼續快轉」。
//   延畢：大四下被當（考五題的課）→ 6/18 成績單排補考 → 6/18～6/26 用畢業後篇的「跳到下一件事」（PG.advance）；補考沒過 → 延畢的大五上（Y5S1）PG.advance 到 12/23。
// 檢查（每一項寫了「哪裡壞掉會 FAIL」）：
//   C1 快轉停點：只有 SEMFF 的 why='remind' 是「系統提醒」造成的停點，而且只在 STUDY.remindDay(term) 20:00；新出現的 sys 訊息（th 'sys' 或【…】開頭）不能讓快轉停（why='msg' 而新的要回訊息是 sys＝FAIL）
//      → 壞掉時：rvSent 不等週日 20:00（PHONE.at 排好就算）＝停點時間不是 20:00 → FAIL；newThing 把所有新訊息當停點＝sys 停點 → FAIL；提醒沒停＝remind 次數 0 → FAIL
//   C2 情境 B：選「繼續快轉」以後，下一個停點在第一科期末考那天（含）以前，每一科期末考那天都有停點、都考到（沒有被自動上）
//      → 壞掉時：classEventful 不把 exam 當劇情＝考試被 autoAttend → 「被自動上的考試」非空 → FAIL；考試紀錄缺 → FAIL
//   C3 情境 A：選「考前總複習」＝當場複習（週日 23:00、範圍內的卡都讀過）、之後每一科期末考都有應考紀錄（R.exam status done）
//      → 壞掉時：複習完接著快轉跳過考試、或 review 沒做 → 卡片沒讀過／考試紀錄缺 → FAIL
//   C4 每學期停點表（日期、時間、原因、分類）
'use strict';
const fs=require('fs'), path=require('path');
const argv=process.argv.slice(2); const opt=k=>{ const i=argv.indexOf(k); return i>=0?argv[i+1]:null; };
const ROOT=path.resolve(argv[0]&&!argv[0].startsWith('--')?argv[0]:(process.env.LW_ROOT||'.'));
const TERMS=(opt('--terms')!=null?opt('--terms'):'Y1S1,Y1S2,Y2S1,Y2S2,Y3S1,Y3S2,Y4S1,Y4S2').split(',').filter(Boolean);
const SCS=(opt('--sc')||'A,B').split(',').filter(Boolean);
const DO_FD=!argv.includes('--no-fd');
const L=require(path.join(__dirname,'n56_loadall.js'))(ROOT);
console.log('受測 ROOT：'+ROOT+'　載入 '+L.loaded.length+' 檔、失敗 '+L.failed.length+(L.failed.length?'（'+L.failed.map(f=>f[0].replace('src/','')).join('、')+'）':''));
const need=['SEMFF','STUDY','CLS','CALENDAR','PHONE','STORY','PG','FD','EVENTS','SOCIAL','INV'];
const miss=need.filter(n=>typeof global[n]==='undefined'); if(miss.length){ console.log('FAIL 缺模組：'+miss.join('、')); process.exit(2); }
console.warn=()=>{}; console.error=()=>{};   /* 遊戲的警告太多；例外另外記 */

/* ---------- 假的 GM（照 tests/pg_harness.js）---------- */
const H={G:null,said:[],toasts:[],cards:[],menus:[],policy:null};
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0,speed:0,pose:'idle'},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,paused:false};
const GM={get G(){ return H.G; },E,D:{active:false},npc:{},running:true,
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){},standUp(){},
  toast(t){ H.toasts.push({at:lbl(now()),t:String(t)}); },
  titleCard:async(a,b)=>{ H.cards.push([a,b]); },enter:async(z)=>{ H.G.zone=z; },advance(h){ H.G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},
  phoneThread:async()=>{}, openPhone(){},
  say:async(who,t)=>{ H.said.push(String(t)); if(H.said.length>4000) H.said.splice(0,2000); },
  choose:async o=>{ const ts=o.map(q=>String(q.t||q.text||'')); return H.policy?H.policy(ts,o):0; }};
const T=(d,h)=>d*24+h; const now=()=>H.G?T(H.G.day,+H.G.hour||0):0; const dayOf=t=>Math.floor(t/24+1e-9);
const lbl=t=>{ const d=dayOf(t), q=CALENDAR.dateOf(d), m=Math.round((t-d*24)*60); return q.key+'（'+'日一二三四五六日'[q.wd%7]+'）'+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const setT=(t)=>{ const G=H.G, d=dayOf(t); if(d>G.day){ G.day=d; G.weekday=wdOf(d); G.energy=100; } G.hour=t-G.day*24; E.hour=G.hour; };
const fresh=(day,hour,flags)=>{ H.G={v:3,day,hour,zone:'dorm',stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,examSeed:12345,EXCHANGE_ROUTE:'TW'},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(H.G); EVENTS.bind(GM); INV.rec(H.G); if(STORY._fy&&STORY._fy.reset) STORY._fy.reset(); H.said=[]; H.toasts=[]; H.cards=[]; H.menus=[]; return H.G; };
const isSys=m=>!!m&&(m.th==='sys'||/^【/.test(String(m.text||'')));
const short=s=>String(s||'').replace(/\s+/g,' ').slice(0,60);

/* ---------- 量測掛勾 ---------- */
let J=[], autoKeys=[], examTaken=[], newEvLog=[];
const oJump=SEMFF.jump, oAuto=SEMFF.autoAttend;
SEMFF.autoAttend=function(G,it){ const r=oAuto.apply(this,arguments); if(r) autoKeys.push({key:it.key,exam:it.exam||null,name:it.c.name}); return r; };
SEMFF.jump=async function(GM_,to){ const G=H.G, t0=now(), preAsk=new Set(PHONE.pending(G)), preInv=new Set((G.invites||[]).filter(iv=>iv.state==='offered'||iv.state==='changed').map(iv=>iv.id)), preEv=new Set(SEMFF.mustEvs(G)), nMsg0=(G.msgs||[]).length;
  const r=await oJump.apply(this,arguments); const e={from:t0,t:now(),why:r.why,stop:r.stop?r.stop.why:null,x:r.stop&&r.stop.x?Object.assign({},r.stop.x):null};
  if(r.why==='msg'){ const nw=PHONE.pending(G).filter(m=>!preAsk.has(m)); e.msgs=nw.map(m=>({th:m.th||PHONE.th&&PHONE.th(m),text:short(m.text),sys:isSys(m)})); const iv=(G.invites||[]).filter(iv=>(iv.state==='offered'||iv.state==='changed')&&!preInv.has(iv.id)); e.inv=iv.map(v=>v.id+'/'+v.who); }
  if(r.why==='event'){ const nw=SEMFF.mustEvs(G).filter(id=>!preEv.has(id)); e.evs=nw; for(const id of nw){ G.events.done[id]=1; newEvLog.push(id); } }   /* 劇情不演：記成演過，接著快轉 */
  J.push(e); return r; };

/* ---------- 停點的分類（照 src/semff3d.js 檔頭與 BB 07:01 ③）---------- */
const classify=(e,term)=>{ const sun=STUDY.remindDay(term);
  switch(e.why){
    case 'remind': return Math.abs(e.t-T(sun,20))<1e-6?'系統提醒（期末前週日 20:00，允許）':'系統提醒・時間不對（違規）';
    case 'msg': { const sys=(e.msgs||[]).filter(m=>m.sys); if(sys.length) return '系統訊息造成停點（違規）'; if((e.msgs||[]).length) return '要回的訊息（NPC，設計上停）'; if((e.inv||[]).length) return '當面約的邀請（設計上停）'; return '訊息停點・找不到是哪一則（分不清）'; }
    case 'event': return '新成立的一定要演的事件（劇情，設計上停）';
    case 'out': return '該出發的出遊（約好的時間，設計上停）';
    case 'now': return '課前 20 分鐘以內有劇情的課（設計上停）';
    case 'stop': { const x=e.x||{}; if(x.class) return x.kind==='exam'?'期末考（課前 20 分鐘，設計上停）':'有劇情／特殊課堂（'+x.kind+'，設計上停）'; if(x.act) return '有劇情的活動（'+x.kind+'，設計上停）'; if(x.wake) return '睡著也會醒來（STORY.lawWakeAt：'+e.stop+'，分不清）';
      if(x.alarm){ if(/考試$/.test(e.stop||'')) return '鬧鐘：考前 1 小時（設計上停）'; return '鬧鐘／電話（wakeAlarms／STOP_FNS：'+e.stop+'，約好的時間或劇情，設計上停）'; } return '其他停點（分不清）'; }
    case 'review': return '總複習做完（情境 A）'; case 'review_stop': return '先停在這裡';
    case 'end': return '到了選的時間（不是停點）';
    default: return '其他（'+e.why+'）'; } };

/* ---------- 一學期 ---------- */
const findItem=(key)=>{ const d=+String(key).split(':')[0]; return CLS.dayItems(H.G,d).find(it=>it.key===key)||null; };
const takeClass=async(it,log)=>{ const G=H.G, R=CLS.rec(G); if(R.done[it.key]) return;
  if(it.exam){ setT(Math.max(now(),T(it.day,it.t0))); let res=null; try{ res=await CLS.runExam(GM,it); }catch(err){ log.err.push('runExam '+it.key+'：'+String(err&&err.message||err)); }
    R.done[it.key]=1; R.attend[it.c.id]=(R.attend[it.c.id]||0)+1; examTaken.push({key:it.key,name:it.c.name,at:lbl(now())}); setT(Math.max(now(),T(it.day,it.t1))); return; }
  /* 課前／課後的人物事件：當作演過（只演一次的記 done；不然每週同一個停點會一直出現＝模擬的假象）*/
  const mk=(f,h)=>{ const k=G.hour; G.hour=h; try{ for(const e of (STORY_EVENTS||[])){ if(!f(e)) continue; let ok=false; try{ ok=!!EVENTS.check(e,{chain:true}); }catch(_){ } if(ok){ G.events.done[e.id]=1; G.events.last[e.id]=G.day; log.classEvs.push(e.id); } } } finally { G.hour=k; } };
  mk(e=>e.beforeClass===it.c.id||(typeof e.beforeClass==='function'&&e.beforeClass(it)),it.t0);
  mk(e=>(e.afterClass===it.c.id||(typeof e.afterClass==='function'&&e.afterClass(it)))&&!e.afterExam,it.t1);
  oAuto(G,it); setT(Math.max(now(),T(it.day,it.t1))); };   /* 有劇情的課：當作上完（劇情不演）*/
const runTerm=async(term,sc,flags)=>{ const r0=CALENDAR.termDays(term); const log={term,sc,stops:[],err:[],menus:[],reviewRes:null,reviewMenu:0,classEvs:[]};
  let d=r0.from; fresh(d,22,flags); while(!SEMFF.on(H.G)&&d<r0.from+21){ d++; fresh(d,22,flags); }
  log.start=lbl(now()); if(!SEMFF.on(H.G)){ log.err.push('這學期一直不能快轉'); return log; }
  J=[]; autoKeys=[]; examTaken=[]; newEvLog=[]; const msg0=0;
  const origReview=STUDY.review; STUDY.review=async function(){ const r=await origReview.apply(this,arguments); log.reviewRes=r?{at:lbl(now()),cards:r.cards,courses:r.courses}:false; return r; };
  H.policy=(ts)=>{ if(ts.includes('繼續快轉')){ log.reviewMenu++; log.menus.push({at:lbl(now()),opts:ts}); const want=sc==='A'?STUDY.REVIEW_LABEL:'繼續快轉'; const k=ts.indexOf(want); return k<0?0:k; }
    if(ts.includes('到下一個有事的時候')) return 0; if(ts.includes('結束總複習')) return 0; return 0; };
  let it=0, stuck=0;
  try{
    const tEnd=T(r0.to,20); log.gaps=[];
    while(now()<tEnd-0.5&&it++<400){ const t0=now(); const j0=J.length; let r=null;
      if(!SEMFF.on(H.G)){ const nt=T(H.G.day+1,22); log.gaps.push(lbl(now())+' 不能快轉（SEMFF.on false）→ 手動過到 '+lbl(nt)); setT(nt); continue; }
      try{ r=await SEMFF.menu(GM); }catch(err){ log.err.push('menu '+lbl(now())+'：'+String(err&&err.stack||err).split('\n').slice(0,2).join(' / ')); setT(now()+1); continue; }
      if(!r){ log.err.push('menu 回傳 false @'+lbl(now())); break; }
      /* 處理停點（玩家會做的事）*/
      if(r.why==='stop'&&r.stop&&r.stop.x&&r.stop.x.class){ const c=findItem(r.stop.x.class); if(c) await takeClass(c,log); }
      else if(r.why==='now'){ for(const c of CLS.dayItems(H.G,H.G.day)){ if(CLS.rec(H.G).done[c.key]) continue; const st=T(c.day,c.t0); if(st>now()-1e-6&&st-SEMFF.PRE<=now()+1e-6){ await takeClass(c,log); break; } } }
      else if(r.why==='stop'&&r.stop&&r.stop.x&&r.stop.x.act){ const q=(ACTIVITIES.list||[]).find(a=>a.id===r.stop.x.act); if(q) setT(Math.max(now(),T(H.G.day,q.t0)+0.05)); }
      else if(r.why==='out'){ const o=OUT.due(H.G); if(o){ o.state='cancelled'; J[J.length-1].out=o.id; } }
      if(now()<=t0+1e-6){ if(++stuck>3){ log.err.push('卡住：'+lbl(now())+' why='+r.why); setT(now()+0.5); stuck=0; } } else stuck=0;
    }
  } finally { STUDY.review=origReview; H.policy=null; }
  log.end=lbl(now()); log.jumps=J.slice(); log.auto=autoKeys.slice(); log.examTaken=examTaken.slice(); log.newEvs=newEvLog.slice();
  const R=CLS.rec(H.G); log.exams=CLS.examList(H.G,term).map(e=>({id:e.c.id,name:e.c.name,day:e.day,t0:e.t0,label:lbl(T(e.day,e.t0)),status:((R.exam||{})[term+':'+e.c.id+':final']||{}).status||null}));
  log.msgs=(H.G.msgs||[]).map(m=>({t:T(m.day,m.h),at:lbl(T(m.day,m.h)),th:m.th||'',from:m.from||'',text:short(m.text),ask:!!m.ask,sys:isSys(m),tag:m.tag||''})).filter(m=>m.from!=='player');
  log.toasts=H.toasts.slice();
  log.remindDay=STUDY.remindDay(term); log.finalStart=STUDY.finalStart(term);
  if(sc==='A'){ const info=null; }
  return log; };

/* ---------- 判定 ---------- */
let fails=0; const out=[]; const P=(s)=>{ console.log(s); out.push(s); };
const check=(name,ok,info)=>{ P((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; return ok; };
const judge=(lg)=>{ const {term,sc}=lg, sun=lg.remindDay, tag=term+'・情境 '+sc;
  if(lg.err.length) P('  錯誤／例外：'+lg.err.slice(0,5).join('｜'));
  const stops=lg.jumps.filter(e=>e.why!=='end');
  const rem=stops.filter(e=>e.why==='remind');
  check('C1['+tag+'] 「期末前週日 20:00」提醒停了一次、時間是 '+(sun!=null?lbl(T(sun,20)):'—'),rem.length===1&&sun!=null&&Math.abs(rem[0].t-T(sun,20))<1e-6,JSON.stringify(rem.map(e=>lbl(e.t))));
  const sysStops=stops.filter(e=>e.why==='msg'&&(e.msgs||[]).some(m=>m.sys));
  check('C1['+tag+'] 系統訊息（th sys／【…】）沒有造成任何停點',!sysStops.length,JSON.stringify(sysStops.map(e=>lbl(e.t)+' '+JSON.stringify(e.msgs))));
  const sysMsgs=lg.msgs.filter(m=>m.sys); const stopTs=stops.map(e=>e.t);
  const coincide=sysMsgs.filter(m=>m.tag!=='review_'+term&&stopTs.some(t=>Math.abs(t-m.t)<0.26)&&!stops.some(e=>Math.abs(e.t-m.t)<0.26&&e.why!=='msg'));
  check('C1['+tag+'] 收到的 '+sysMsgs.length+' 則系統訊息，除了總複習提醒以外沒有一則在送到的那一刻變成停點',!coincide.length,JSON.stringify(coincide.map(m=>m.at+' '+m.text)));
  const autoEx=lg.auto.filter(a=>a.exam);
  check('C2/C3['+tag+'] 沒有考試被快轉自動上（autoAttend）',!autoEx.length,JSON.stringify(autoEx));
  const exs=lg.exams; const noRec=exs.filter(e=>e.status!=='done'&&e.status!=='insufficient');
  check('C2/C3['+tag+'] 每一科期末考都有應考紀錄（'+exs.length+' 科）',exs.length>0&&!noRec.length,JSON.stringify(noRec.map(e=>e.name+' '+e.label+' '+e.status)));
  const exDays=[...new Set(exs.map(e=>e.day))]; const dayNoStop=exDays.filter(d=>!stops.some(e=>dayOf(e.t)===d&&e.why!=='msg'&&e.why!=='event'));
  check('C2['+tag+'] 每一個期末考的日子都有停點（考前 1 小時鬧鐘或課前 20 分鐘）',!dayNoStop.length,JSON.stringify(dayNoStop.map(d=>CALENDAR.dateOf(d).key)));
  if(sc==='B'){ const i=stops.findIndex(e=>e.why==='remind'); const nx=i>=0?stops[i+1]:null; const ex0=Math.min(...exs.map(e=>e.day));
    check('C2['+tag+'] 選「繼續快轉」：選單有出現（'+lg.reviewMenu+' 次），下一個停點在第一科期末考那天（含）以前',lg.reviewMenu===1&&!!nx&&dayOf(nx.t)<=ex0,nx?lbl(nx.t)+' '+(nx.stop||nx.why)+'（第一科考試日 '+CALENDAR.dateOf(ex0).key+'）':'沒有下一個停點'); }
  if(sc==='A'){ const rv=lg.reviewRes; check('C3['+tag+'] 選「考前總複習」：當場複習（週日 23:00 結束、有卡）',lg.reviewMenu===1&&!!rv&&rv.cards>0&&/ 23:00$/.test(rv.at)&&rv.at.startsWith(CALENDAR.dateOf(sun).key),JSON.stringify(rv));
    const i=lg.jumps.findIndex(e=>e.why==='review'); check('C3['+tag+'] 複習完停下來（why review），沒有接著快轉',i>=0&&Math.abs(lg.jumps[i].t-T(sun,20))<1e-6,i>=0?lbl(lg.jumps[i].t):'沒有 why review'); }
};
const table=(lg)=>{ const rows=lg.jumps.filter(e=>e.why!=='end'); P('  停點表（'+lg.term+' 情境 '+lg.sc+'，起點 '+lg.start+'、終點 '+lg.end+'，共 '+rows.length+' 個停點；自動上課 '+lg.auto.length+' 堂；考試 '+lg.examTaken.length+' 場）');
  for(const e of rows) P('   | '+lbl(e.t)+' | '+e.why+' | '+(e.stop||(e.evs?e.evs.join(','):'')||(e.msgs?e.msgs.map(m=>m.th+'「'+m.text+'」').join('；'):'')||(e.inv?e.inv.join(','):'')||(e.out||''))+' | '+classify(e,lg.term)+' |'); };

(async()=>{
  const all=[];
  for(const term of TERMS) for(const sc of SCS){ const t0=Date.now(); const lg=await runTerm(term,sc); lg.ms=Date.now()-t0; all.push(lg);
    P('== '+term+' 情境 '+sc+'（'+(sc==='A'?'考前總複習':'繼續快轉')+'）'+(lg.ms/1000).toFixed(1)+' 秒 =='); table(lg); judge(lg);
    const sm=lg.msgs.filter(m=>m.sys); P('  系統訊息（'+sm.length+' 則）：'+sm.map(m=>m.at+' ['+m.th+'] '+m.text+(m.ask?'［要回］':'')).join('｜'));
    const tu=[...new Set(lg.toasts.map(x=>x.t))]; P('  toast（'+tu.length+' 種）：'+tu.map(short).join('｜')); }

  /* ---------- 延畢 ---------- */
  if(DO_FD){ P('== 延畢路線（FD）==');
    const D=k=>PG.DK(k); const pgLog=[];
    const fdBase=(key,h,fl)=>{ const G=fresh(D(key),h,Object.assign({BAR_REG:true,Y4_PATH:'bar',GRADUATED:D('2029-06-02'),GRAD_DONE:true,MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',PACKED_Y4:D('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},fl||{}));
      PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1; return G; };
    const advLoop=async(untilT,lab,max)=>{ const rows=[]; const oj=PG.jumpTo; let lastRes=null; PG.jumpTo=function(){ const r=oj.apply(this,arguments); lastRes=r; return r; };
      const oRun=PG.runStep; let lastStep=null; PG.runStep=async function(GM_,s){ lastStep=s.id; return oRun.apply(this,arguments); };
      try{ for(let k=0;k<(max||300)&&now()<untilT;k++){ const t0=now(), m0=(H.G.msgs||[]).length; lastRes=null; lastStep=null; let ok=false; try{ ok=await PG.advance(GM); }catch(err){ rows.push({t:now(),why:'例外 '+String(err&&err.message||err)}); break; }
          const nm=(H.G.msgs||[]).slice(m0).filter(m=>m.from!=='player'); const last=nm.slice(-3).map(m=>(isSys(m)?'［系統］':'')+(m.th||'')+'「'+short(m.text)+'」'+(m.ask?'［要回］':''));
          rows.push({t:now(),res:lastRes,step:lastStep,msgs:last,sys:nm.some(isSys)&&lastRes==='msg'});
          if(!ok){ rows[rows.length-1].why='advance 回 false'; setT(now()+1); }
          if(now()<=t0+1e-6) setT(now()+0.25); } }
      finally{ PG.jumpTo=oj; PG.runStep=oRun; }
      P('  停點表（'+lab+'，'+rows.length+' 次）'); for(const r of rows) P('   | '+lbl(r.t)+' | '+(r.res||'')+' | '+(r.step||'')+' | '+(r.msgs.join('；')||r.why||'')+' |'+(r.sys?' ←系統訊息停點':''));
      return rows; };
    // (a) 6/18 成績單 → 補考窗（6/18～6/26）
    { const G=fdBase('2029-06-18',9); H.policy=null; const R=CLS.rec(G); R.exam=R.exam||{}; let first=null;
      for(const c of CLS.termCourses(G,'Y4S2')){ if(!CLS.isExamCourse(c)) continue; if(!first) first=c; R.exam['Y4S2:'+c.id+':final']={qs:[],ans:[],status:'done',correct:first===c?0:3,score:first===c?0:80}; if(CLS.attCourse&&CLS.attCourse(c)) R.attend[c.id]=3; }
      await CLS.showGrades(GM,'Y4S2'); const M=G.flags.FD_MAKEUP;
      check('FD-a 6/18 成績單：考五題的課被當＝排補考（FD_MAKEUP pending）',!!M&&M.status==='pending',JSON.stringify(M));
      setT(T(D('2029-06-18'),12)); let rvAt=null; H.policy=(ts)=>{ return 0; };
      const rows=await advLoop(T(D('2029-06-26'),12),'補考窗 6/18 12:00～6/26 12:00',80);
      const rem=rows.find(r=>/明天上午 10:00 補考/.test(r.msgs.join('')));
      check('FD-a 補考前一天 20:00 系統提醒：跳日期停在 6/25 20:00（faildelay3d.js 設計：「畢業後篇跳日期會停在那裡」）',!!rem&&Math.abs(rem.t-T(D('2029-06-25'),20))<0.26,rem?lbl(rem.t):JSON.stringify(rows.map(r=>lbl(r.t))));
      const mk=(R.exam||{})['Y4S2:'+first.id+':makeup'];
      check('FD-a 補考有考到（Y4S2:'+first.id+':makeup 有紀錄，或 FD_MAKEUP 已經不是 pending）',(!!mk&&mk.status==='done')||G.flags.FD_MAKEUP.status!=='pending',JSON.stringify({mk,st:G.flags.FD_MAKEUP.status}));
      const other=rows.filter(r=>r.sys&&!/補考/.test(r.msgs.join('')));
      P('  INFO FD-a 補考窗裡其他「系統訊息」造成的停點：'+(other.length?other.map(r=>lbl(r.t)+' '+r.msgs.join('；')).join('｜'):'無'));
      pgLog.push({lab:'makeup',rows:rows.map(r=>({at:lbl(r.t),res:r.res,step:r.step,msgs:r.msgs,sys:r.sys}))}); }
    // (b) 大五上（延畢學期）
    { const G=fdBase('2029-09-02',22,{FAIL_DELAY:true,FAIL_DELAY_V:2,FAIL_DELAY_COURSES:['crim_general'],FAIL_DELAY_DAY:D('2029-06-26'),Y5_DAYS:'study',BAR_REG:false,MOVED_OUT:D('2029-06-28')});
      const c=CLS.byId&&CLS.byId('crim_general'); if(!c){ const any=CLS.termCourses(G,'Y4S2').find(x=>CLS.isExamCourse(x)); G.flags.FAIL_DELAY_COURSES=[any.id]; }
      P('  延畢的那一門：'+G.flags.FAIL_DELAY_COURSES.join('、')+'；Y5.on='+(typeof Y5!=='undefined'&&Y5.on(G))+'；SEMFF.on='+SEMFF.on(G)+'；PG.on='+PG.on(G));
      check('FD-b 大五上（延畢學期）用畢業後篇的跳日期（PG.on），不是 SEMFF；SEMFF 的期末提醒不適用（大五上沒有期末考）',PG.on(G)&&!SEMFF.on(G)&&STUDY.reviewInfo(G,'final')==null,JSON.stringify({pg:PG.on(G),semff:SEMFF.on(G),rv:!!STUDY.reviewInfo(G,'final')}));
      H.policy=(ts)=>{ const k=ts.findIndex(t=>/總圖|讀書/.test(t)); return k<0?0:k; };
      const rows=await advLoop(T(D('2029-12-24'),9),'大五上 9/2 22:00～12/24',200);
      const sysStops=rows.filter(r=>r.sys);
      check('FD-b 大五上：系統訊息造成的停點（列出；BB 判定畢業後篇是否也適用「系統訊息不停」）',true,sysStops.length+' 個：'+sysStops.map(r=>lbl(r.t)+' '+r.msgs.join('；')).join('｜'));
      pgLog.push({lab:'y5s1',rows:rows.map(r=>({at:lbl(r.t),res:r.res,step:r.step,msgs:r.msgs,sys:r.sys}))}); }
    all.push({fd:pgLog}); }

  P(fails?('FAILED '+fails):'ALL PASS（注意：PASS 只代表上面每一項的條件，不代表 BB 判定）');
  const jo=opt('--json'); if(jo) fs.writeFileSync(jo,JSON.stringify(all.map(x=>x.fd?x:Object.assign({},x,{jumps:x.jumps.map(e=>Object.assign({},e,{at:lbl(e.t),cls:classify(e,x.term)}))})),null,1));
  process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

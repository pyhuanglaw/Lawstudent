#!/usr/bin/env node
/* CC-C（帳號 C）11-05：D118_B7 ②③（BB-C 00:06，SHA 6a1592a26）——國考總複習的兩則提醒＋美國路線 2030 題池。期望值照 AA_690（企劃線 c860ff820）第 3 節＋BB-C 00:06。
   A 臺灣路線、2029 報了名：從 2029-06-20 照畢業後篇自己的「跳到下一件事」（PG.advance）走到 8/4 一試前，手機照收。
       要對（BB-C 02:00＝BB_255 02:0x：開放那天的提醒改 12:00，考前一週的週日照舊 20:00；8267bc481 起）：①2029-07-05 12:00「【國考】8/4 一試。從今天起，坐到書桌或讀書的位子，可以把四年的筆記一次讀過一遍，要六個小時。」
             ②2029-07-29（日）20:00「【國考】8/4（六）一試。考前想把四年的筆記讀過一遍，坐到書桌或讀書的位子就可以。」
             各一則；跳日期停在這兩個時間。
   B 臺灣路線、2029 沒報名：同一段時間收不到【國考】提醒。
   C 美國路線、2030 報了名（G.y5.cls 有強制執行法、法律倫理各上過一堂）：①2030-07-04 12:00、②2030-07-28（日）20:00（8/3）；強制執行法、法律倫理在一試題池。
   C2 美國路線、G.y5.cls 沒有那兩門：不算修過、不在題池（照實記）。
   D 美國路線、2030 沒報名：收不到。
   【前置／捷徑】pg_harness 的假 GM；畢業、報名、路線、G.y5.cls 直接設；選項都選第一個。
   用法：LW_ROOT=<checkout> [CC_REPO=…] [SHA=…] node cc_d118_remind.js */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(process.env.LW_ROOT||path.join(__dirname,'..','..','..','..'));
const CC_REPO=process.env.CC_REPO||path.resolve(__dirname,'..','..','..','..');
if(fs.existsSync(path.join(ROOT,'tests','alison.js'))) require(path.join(ROOT,'tests','alison.js'));
const H=require(path.join(ROOT,'tests','pg_harness.js'));
const {GM}=H, J=JSON.stringify;
let FAILS=0, PASSES=0; const check=(name,ok,inf)=>{ console.log((ok?'PASS ':'FAIL ')+name+(inf?'　'+inf:'')); if(ok) PASSES++; else FAILS++; return ok; };
const info=s=>console.log('INFO '+s);
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{}; global.ZRUK=global.ZRUK||{W_FROM:'2028-09-01',playW:async()=>'orig'};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
const loadErr=[];
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,100)); } }
GM.caption=()=>{}; GM.toast=()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.addNote=()=>true; GM.money=d=>{ H.G.money=(H.G.money|0)+(+d||0); };
const DK=k=>PG.DK(k), K=d=>d==null?null:CALENDAR.dateOf(d).key, WDN=d=>'日一二三四五六'[CALENDAR.dateOf(d).wd%7];
const OPEN_HM=process.env.OPEN_HM||'12:00';   /* 開放那天的提醒時間：8267bc481 起 12:00（BB-C 02:00）；6a1592a26 那一版是 20:00（OPEN_HM=20:00 重跑舊版）*/
const hm=h=>{ const x=Math.round(h*60); return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0'); };
const gitShow=(rev,p)=>{ try{ return cp.execFileSync('git',['-C',CC_REPO,'-c','core.quotepath=off','show',rev+':'+p],{encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const doc=gitShow('c860ff820','docs/story_planning/AA_690_國考總複習介面字定稿.md');
const row=k=>(doc.split('\n').find(l=>l.startsWith('| '+k))||'').split('|').map(x=>x.trim());
const T_OPEN=row('① 開放那天')[3], T_WEEK=row('② 考前一週')[3];
const fill=(t,o)=>String(t||'').replace(/\{(\w+)\}/g,(m,k)=>o[k]!=null?String(o[k]):m);
const freshPG=(key,h,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({MOVED_OUT:DK('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:DK('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},flags||{}));
  G.acts={att:{}}; G.outings=[]; G.flags.GRADUATED=PG.gradDay(); G.flags.GRAD_DONE=true; PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1; G.stats={classes:0,study:0}; return G; };
/* 畢業後篇照自己跳：手機規則＋PG.rules＋出遊照出發＋場景照演，走到 end（絕對小時）*/
const walkPG=async(G,end)=>{ const now=()=>G.day*24+(+G.hour||0), visits=[], seen=new Set(), msgs=[]; let guard=0;
  const grab=()=>{ for(const m of (G.msgs||[])){ const k=[m.tag,m.text,m.day,m.h].join('|'); if(seen.has(k)) continue; seen.add(k); if(/^【國考】/.test(m.text||'')||/^bar_remind_/.test(m.tag||'')) msgs.push({tag:m.tag,text:m.text,key:K(m.day),wd:WDN(m.day),h:m.h,th:m.th}); } };
  while(guard++<3000&&now()<end){ try{ STORY.phoneRules(GM); }catch(e){} H.tick(); grab();
    const q=OUT.due(G); if(q){ H.picks=[0]; try{ await OUT.tick(GM); }catch(e){} grab(); continue; }
    const s=PG.due(G); if(s){ if(s.id&&/^exam_/.test(s.id)) break; H.picks=[]; try{ await PG.runStep(GM,s); }catch(e){ PG.rec(G).done[s.id]=1; } grab(); continue; }
    const t0=now(); let nx=null; try{ nx=PG.nextStop(G); }catch(e){} if(nx!=null&&nx>=end) break;
    let ok=false; try{ ok=await PG.advance(GM); }catch(e){} visits.push(K(G.day)+' '+hm(G.hour));
    if(!ok||now()<=t0+1e-6){ const t=t0+1; PG.setT(G,H.E,Math.floor(t/24),t%24); } }
  try{ STORY.phoneRules(GM); }catch(e){} grab(); return {visits,msgs}; };
const sec=async(n,f)=>{ console.log('\n===== '+n); try{ await f(); }catch(e){ check(n+'：丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
(async()=>{
console.log('cc_d118_remind　LW_ROOT='+ROOT+'　SHA='+(process.env.SHA||'?')+'　稿 AA_690 c860ff820');
check('0. 載得到 PG、STUDY.barRemindNext；AA_690 第 3 節兩則的字讀得到',typeof PG!=='undefined'&&typeof STUDY!=='undefined'&&typeof STUDY.barRemindNext==='function'&&!!T_OPEN&&!!T_WEEK,(loadErr.length?'載入錯誤 '+J(loadErr.slice(0,3))+'；':'')+J({T_OPEN,T_WEEK}));
const expect=(y,exam)=>{ const d=DK(exam), m=+exam.slice(5,7), dd=+exam.slice(8,10); return {open:fill(T_OPEN,{M:m,D:dd}),week:fill(T_WEEK,{M:m,D:dd}).replace('（六）','（'+WDN(d)+'）')}; };
await sec('A 臺灣路線、2029 報了名',async()=>{ const G=freshPG('2029-06-20',10,{BAR_REG:true}); const r=await walkPG(G,DK('2029-08-04')*24+7.9), E=expect(2029,'2029-08-04');
  info('A 跳過的時間（'+r.visits.length+'）：'+J(r.visits.filter(v=>/^2029-0[78]/.test(v))).slice(0,900));
  info('A 【國考】訊息：'+J(r.msgs));
  const o=r.msgs.filter(m=>m.tag==='bar_remind_open_2029'), w=r.msgs.filter(m=>m.tag==='bar_remind_week_2029');
  check('A ① 2029-07-05 '+OPEN_HM+'「'+E.open+'」一則',o.length===1&&o[0].key==='2029-07-05'&&hm(o[0].h)===OPEN_HM&&o[0].text===E.open,J(o));
  check('A ② 2029-07-29（日）20:00「'+E.week+'」一則',w.length===1&&w[0].key==='2029-07-29'&&w[0].wd==='日'&&hm(w[0].h)==='20:00'&&w[0].text===E.week,J(w));
  check('A 跳到下一件事停在 07-05 '+OPEN_HM+'、07-29 20:00',r.visits.includes('2029-07-05 '+OPEN_HM)&&r.visits.includes('2029-07-29 20:00'),J(r.visits.filter(v=>/^2029-07-(0[4-6]|2[8-9]|30)/.test(v))));
  check('A 【國考】訊息只有這兩則',r.msgs.length===2,J(r.msgs.map(m=>[m.tag,m.key]))); });
await sec('B 臺灣路線、2029 沒報名',async()=>{ const G=freshPG('2029-06-20',10,{BAR_REG:false}); const r=await walkPG(G,DK('2029-08-05')*24+12);
  check('B 沒報名：收不到【國考】提醒、跳日期不停在 07-05 '+OPEN_HM+'／07-29 20:00',!r.msgs.length&&!r.visits.includes('2029-07-05 '+OPEN_HM)&&!r.visits.includes('2029-07-29 20:00'),J({msgs:r.msgs,stop:r.visits.filter(v=>/^2029-07-(05|29) 20:00/.test(v))})); });
const wrongOf=q=>q.type==='tf'||!q.options?(q.answer==='對'?'錯':'對'):Object.keys(q.options).find(k=>String(k)!==String(q.answer));
const transcripts=G=>{ const R=CLS.rec(G); R.exam=R.exam||{}; R.grades=R.grades||{};   /* 同 tests/d118_b7_unit.js：沒有成績單＝題池不到 40 題退回全部，看不出修沒修 */
  for(const t of CLS.LAW_TERMS){ if(CLS.termAway(G,t)) continue; for(const c of CLS.termCourses(G,t)){ if(!CLS.isExamCourse(c)) continue; const r=CLS.drawExam(G,c.id,t,'final'); if(!r.ok) continue;
      R.exam[r.key]={qs:r.qs.map(q=>q.id),ans:r.qs.map((q,i)=>i<3?q.answer:wrongOf(q)),correct:3,score:CLS.scoreOf(3),status:'done'}; } R.grades[t]=CLS.reportFor(G,t); } };
const usG=(reg,cls)=>{ const G=freshPG('2030-06-15',10,{EXCHANGE_ROUTE:'US',BAR_REG:false,BAR_REG_2030:reg}); G.flags.GRADUATED=PG.gradDay(G); G.y5=G.y5||{}; G.y5.cls=Object.assign({},cls||{}); transcripts(G); return G; };
await sec('C 美國路線、2030 報了名（大五上補修上過強制執行法、法律倫理各一堂）',async()=>{ const d0=DK('2029-09-20'); const G=usG(true,{[d0+':enforcement']:1,[(d0+1)+':legal_ethics']:1});
  const tk=CLS.takenCourses(G).map(c=>c.id), pool=PG.poolFor(G)||[], inP=new Set(pool.map(q=>q.course).filter(Boolean));
  check('C 強制執行法、法律倫理算修過（CLS.takenCourses）、在一試題池（BB-C 00:06：G.y5.cls 有上過一堂就算）',tk.includes('enforcement')&&tk.includes('legal_ethics')&&inP.has('enforcement')&&inP.has('legal_ethics'),J({taken:tk.filter(x=>/enforce|ethic/.test(x)),inPool:[...inP].filter(x=>/enforce|ethic/.test(x))}));
  const r=await walkPG(G,DK('2030-08-03')*24+7.9), E=expect(2030,'2030-08-03');
  info('C 【國考】訊息：'+J(r.msgs));
  const o=r.msgs.filter(m=>m.tag==='bar_remind_open_2030'), w=r.msgs.filter(m=>m.tag==='bar_remind_week_2030');
  check('C ① 2030-07-04 '+OPEN_HM+'「'+E.open+'」',o.length===1&&o[0].key==='2030-07-04'&&hm(o[0].h)===OPEN_HM&&o[0].text===E.open,J(o));
  check('C ② 2030-07-28（日）20:00「'+E.week+'」',w.length===1&&w[0].key==='2030-07-28'&&w[0].wd==='日'&&hm(w[0].h)==='20:00'&&w[0].text===E.week,J(w));
  check('C 跳到下一件事停在 07-04 '+OPEN_HM+'、07-28 20:00',r.visits.includes('2030-07-04 '+OPEN_HM)&&r.visits.includes('2030-07-28 20:00'),J(r.visits.filter(v=>/^2030-07-(0[3-5]|2[7-9])/.test(v)))); });
await sec('C2 美國路線、大五上補修沒上（G.y5.cls 沒有那兩門）',async()=>{ const G=usG(true,{}); const tk=CLS.takenCourses(G).map(c=>c.id), inP=new Set((PG.poolFor(G)||[]).map(q=>q.course).filter(Boolean));
  check('C2 一堂都沒上：強制執行法、法律倫理不算修過、不在一試題池（BB-C 00:06 的反面）',!tk.includes('enforcement')&&!tk.includes('legal_ethics')&&!inP.has('enforcement')&&!inP.has('legal_ethics'),J({taken:tk.filter(x=>/enforce|ethic/.test(x)),inPool:[...inP].filter(x=>/enforce|ethic/.test(x)),poolN:(PG.poolFor(G)||[]).length})); });
await sec('D 美國路線、2030 沒報名',async()=>{ const G=usG(false,{}); const r=await walkPG(G,DK('2030-08-04')*24+12);
  check('D 沒報名：收不到【國考】提醒',!r.msgs.length,J(r.msgs)); });
console.log('\n'+(FAILS?'FAILED '+FAILS:'ALL PASS '+PASSES)+'（判定歸 BB）');
process.exit(FAILS?1:0);
})();

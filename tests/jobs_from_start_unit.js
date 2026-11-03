// 打工一開始就有（使用者 2026-11-03「一開始就要有」；AA 確認細節）——不需要瀏覽器。src/jobs3d.js＋data/events.js 的 ev_mingxuan_tutor_intro
//   1  JOBS.eligible：法律系大一上第 1 週就是 true（原本大一下第 1 週起）；經濟系那一年（stage econ）照舊 false；有自己 from 的（事務所大三起）照舊
//   2  家教的邀請（明軒 ev_mingxuan_tutor_intro）：大一上第 1～5 週沒有、第 6 週起有；大一上沒遇到的，大一下照樣遇得到
//   3  大一上答應的家教：答應那天以後照排（週二／週四 19:00）；期末考週、颱風假不排
//   4  大一上答應的，大一下開學第一天 12:00 明軒「家長問你這學期還來嗎」（跟大二上一樣）；回「來」才排；舊存檔（大一下答應）大一下照排、不問
//   5  一週最多兩班（家教也算）照舊
// 修改前（6a8033f4e）：1～4 FAIL。用法：node tests/jobs_from_start_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT|WZ_PARK_LAYOUT|PARK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ for(const f of ['src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/wz_jobs.js','src/jobs3d.js']) load(f); }catch(e){ ok=false; err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const key=d=>CALENDAR.dateOf(d).key, TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; };
const tq=()=>OUT.rec(H.G).filter(q=>/^tutor_/.test(q.id));
const planned=()=>tq().filter(q=>q.state==='planned');
const msgs=th=>{ PHONE.tick(H.G); return (H.G.msgs||[]).filter(m=>!th||m.th===th).map(m=>m.text); };
const MX='p:classmate_mingxuan';

(async()=>{
check('0. 載得到 JOBS',ok&&typeof JOBS!=='undefined',err);

await sec(1,async()=>{ const w1=TD('Y1S1',1,1); H.fresh(key(w1),10,'wenzhou');
  check('1. 開放日＝大一上第 1 週（CALENDAR Y1S1 的第一天）',JOBS.startDay()===CALENDAR.termDays('Y1S1').from,String(JOBS.startDay()));
  check('1. 法律系大一上第 1 週：早午餐、影印、茶屋、Café、書店、便利商店都可以應徵',['brunch','copy','tea','cafe','books','cvs'].every(k=>JOBS.eligible(H.G,k)),J(['brunch','copy','tea','cafe','books','cvs'].map(k=>JOBS.eligible(H.G,k))));
  check('1. 自己有 from 的照舊：補習班大二起、事務所大三起',!JOBS.eligible(H.G,'cram')&&!JOBS.eligible(H.G,'office'));
  H.G.stage='econ'; check('1. 經濟系那一年（stage econ）：照舊不能打工',!['brunch','copy','tea','cafe','books','cvs'].some(k=>JOBS.eligible(H.G,k))); });

await sec(2,async()=>{ const e=ev('ev_mingxuan_tutor_intro');
  const try_=(t,w)=>{ H.fresh(key(TD(t,w,3)),16,'campus'); H.FAMILIAR('classmate_mingxuan'); return EVENTS.check(e); };
  const pre=[1,2,3,4,5].map(w=>try_('Y1S1',w)), post=[6,7,10,15].map(w=>try_('Y1S1',w));
  check('2. 大一上第 1～5 週：明軒還不會問家教',pre.every(x=>!x),J(pre));
  check('2. 大一上第 6 週起：明軒問家教（台詞照舊「欸，你要不要接一個家教？」）',post.every(x=>x)&&e.dialogue[0].text==='欸，你要不要接一個家教？',J(post));
  check('2. 大一上沒遇到的：大一下照樣遇得到；期末考週（第 16 週）沒有',try_('Y1S2',2)&&try_('Y1S2',10)&&!try_('Y1S1',16));
  H.fresh(key(TD('Y1S1',6,3)),16,'campus'); check('2. 條件照舊（看過他念書或熟悉以上）：還不熟的不問',!EVENTS.check(e)); });

await sec(3,async()=>{ const acc=TD('Y1S1',6,3); H.fresh(key(acc),17,'dorm',{JOB_TUTOR:true,TUTOR_WD:2,tutorFromDay:acc}); JOBS.phone(H.G);
  const nx=TD('Y1S1',7,2);
  check('3. 大一上第 6 週（週三）答應：下週二 19:00 排家教（答應那天以前不排）',!!OUT.get(H.G,'tutor_'+nx)&&!tq().some(q=>q.day<=acc),J(planned().map(q=>key(q.day))));
  at(nx,10); check('3. 大一上算有家教：tutorOn、一週算一班、JOBS.at(tutor).today',JOBS.tutorOn(H.G)&&JOBS.tutorWeekly(H.G)===1&&!!JOBS.at(H.G,'tutor')&&JOBS.at(H.G,'tutor').today===true);
  check('3. 大一上期末考週（第 16 週）不排',!JOBS.tutorDayOk(H.G,TD('Y1S1',16,2)));
  check('3. 寒假沒有家教',!JOBS.tutorOn(H.G,CALENDAR.termDays('Y1S1').to+5)); });

await sec(4,async()=>{ const acc=TD('Y1S1',6,3), s1=TD('Y1S2',1,1); H.fresh(key(acc),17,'dorm',{JOB_TUTOR:true,TUTOR_WD:2,tutorFromDay:acc});
  at(s1,9); JOBS.phone(H.G); check('4. 大一下開學（還沒回）：不排',planned().filter(q=>q.day>=s1).length===0&&!JOBS.tutorOn(H.G));
  at(s1,12.2); JOBS.phone(H.G); const M=msgs(MX); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='tutor_term_Y1S2');
  check('4. 大一上答應的：大一下開學第一天 12:00 明軒「家長問你這學期還來嗎」（跟大二上一樣）',M.includes('家長問你這學期還來嗎')&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['來','不了']),J(M));
  PHONE.answer(H.G,'tutor_term_Y1S2',0); JOBS.phone(H.G); check('4. 「來」：大一下照排（第 1 週週二）',!!OUT.get(H.G,'tutor_'+TD('Y1S2',1,2))&&JOBS.tutorOn(H.G),J(planned().map(q=>key(q.day))));
  const y2=TD('Y2S1',1,1); at(y2,12.2); JOBS.phone(H.G); msgs(); check('4. 大二上開學照樣問',(H.G.msgs||[]).some(x=>x.ask&&x.ask.id==='tutor_term_Y2S1'));
  H.fresh(key(acc),17,'dorm',{JOB_TUTOR:true,TUTOR_WD:2,tutorFromDay:acc}); at(s1,12.2); JOBS.phone(H.G); msgs(); PHONE.answer(H.G,'tutor_term_Y1S2',1); JOBS.phone(H.G);
  check('4. 「不了」：停（明軒那一句）、不排',msgs(MX).includes('好，我跟家長說。有空回來看看。')&&H.G.flags.TUTOR_STOP!=null&&planned().length===0);
  const a2=TD('Y1S2',3,3); H.fresh(key(TD('Y1S2',4,1)),12.2,'dorm',{JOB_TUTOR:true,TUTOR_WD:2,tutorFromDay:a2}); JOBS.phone(H.G); msgs();
  check('4. 舊存檔（大一下答應）：大一下照排、不問',!(H.G.msgs||[]).some(x=>x.ask&&x.ask.id==='tutor_term_Y1S2')&&!!OUT.get(H.G,'tutor_'+TD('Y1S2',4,2))); });

await sec(5,async()=>{ const acc=TD('Y1S1',6,3); H.fresh(key(TD('Y1S1',7,1)),10,'wenzhou',{JOB_TUTOR:true,TUTOR_WD:2,tutorFromDay:acc});
  const J0=JOBS.rec(H.G); J0.brunch={since:H.G.day,day:[6],shifts:0,skill:0,worked:[],wk:{},brk:{},ot:{}};
  check('5. 大一上：家教一班＋早午餐一班＝兩班，影印沒有名額（一週最多兩班，家教也算）',JOBS.used(H.G,'copy')===2&&JOBS.cap(H.G,'copy')===0,J({used:JOBS.used(H.G,'copy'),cap:JOBS.cap(H.G,'copy')}));
  toasts.length=0; const r=await JOBS.pickDays(GM,'copy'); check('5. 選班表：「一週最多兩班（所有打工加起來）」',r===null&&toasts.includes('一週最多兩班（所有打工加起來）'),J(toasts)); });

H.done?H.done():(console.log(H.fails?'FAILED '+H.fails:'ALL PASS'),process.exit(H.fails?1:0));
})().catch(e=>{ console.error(e); process.exit(1); });

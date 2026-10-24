// 家教（AA_163 第 2 節，企劃線 d64110e1f；V2-B32）——不需要瀏覽器。src/jobs3d.js（排課、規則）＋src/data/wz_jobs.js（台詞）＋data/events.js 的 ev_tutor_lesson
//   0  ev_tutor_lesson 只有一個 after：TUTOR_N +1 和佔掉晚上的時段（CLS.slotFill）都有跑（原本兩個 after，後一個蓋掉前一個）
//   1  排課：週二或週四 19:00、學生家在溫州街、「這週請假」；story3d.js 的最小版不再另外排（不重複）
//   2  期末考週（AA_163 的第 17～18 週＝遊戲第 16 週）停；前一週那一堂結尾學生的媽媽「考試週你先顧自己。」
//   3  第 4 堂「為什麼要念法律」：三選一＝TUTOR_WHY、國中生「……我也想要有一個理由。」、筆記「我認識的人：家教的學生」；每堂 +1,200 元、toast「家教費 1,200 元」
//   4  沒去：下一堂開場一句（三句輪流）；去了＝連續次數歸零；連續三週沒去＝明軒私訊（「還要做」／「先停」；先停＝明軒「好，我跟家長說。有空回來看看。」、不再排）
//   5  寒暑假停；大二上、大二下開學第一天 12:00 明軒「家長問你這學期還來嗎」（回「來」才排；「不了」＝停）
//   6  會考（2027-05-15）前那一堂是最後一堂（學生一句）；5/16 21:00 學生的訊息「考完了。社會我覺得還好。」、家教結束
// 修改前（開發分支 HEAD）：只有大一下、沒有家教費、沒有第 4 堂——FAIL。用法：node tests/aa163_tutor_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT|WZ_PARK_LAYOUT|PARK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ for(const f of ['src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/wz_jobs.js','src/jobs3d.js']) load(f); }catch(e){ ok=false; err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const notes=[]; GM.addNote=(id,title,body)=>{ notes.push({id,title,body}); };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const said=t=>H.said.some(s=>s.t===t);
const saidBy=(w,t)=>H.said.some(s=>s.t===t&&s.who===w);
const L=()=>H.lines();
const DK=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key, TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; };
const fresh=(k,h,flags)=>{ const G=H.fresh(k,h,'dorm',Object.assign({JOB_TUTOR:true,TUTOR_WD:2,tutorFromDay:TD('Y1S2',3,1)},flags||{})); toasts.length=0; notes.length=0; return G; };
const tq=()=>OUT.rec(H.G).filter(q=>/^tutor_/.test(q.id));
const planned=()=>tq().filter(q=>q.state==='planned');
const lesson=async(n,picks)=>{ if(n!=null) H.G.flags.TUTOR_N=n; H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev('ev_tutor_lesson')); };
/* 那一天的家教：排好的那一個演完（state done）*/
const go=async(d,picks)=>{ at(d,19); const q=OUT.get(H.G,'tutor_'+d); await lesson(null,picks); if(q) q.state='done'; JOBS.phone(H.G); };
const miss=d=>{ const q=OUT.get(H.G,'tutor_'+d); if(q) q.state='missed'; at(d,21); JOBS.phone(H.G); };
const msgs=th=>{ PHONE.tick(H.G); return (H.G.msgs||[]).filter(m=>!th||m.th===th).map(m=>m.text); };
const MX='p:classmate_mingxuan';

(async()=>{
check('0. 載得到；JOBS 接手家教的排課（JOBS.TUTOR_PLAN）',ok&&typeof JOBS!=='undefined'&&JOBS.TUTOR_PLAN===true,err);

await sec(0,async()=>{ const src=fs.readFileSync(path.join(H.ROOT,'src/data/events.js'),'utf8'); const a=src.indexOf("{ id:'ev_tutor_lesson'"), b=src.indexOf('\n  { id:',a+10)>0?src.indexOf('\n  /*',a+10):-1; const blk=src.slice(a,b);
  check('0. ev_tutor_lesson 只有一個 after',(blk.match(/\bafter:/g)||[]).length===1,String((blk.match(/\bafter:/g)||[]).length));
  fresh(key(TD('Y1S2',5,2)),19); const n0=H.G.flags.TUTOR_N|0; await lesson(1);
  check('0. 演完：TUTOR_N +1、晚上的時段佔掉（CLS.slotFill）',H.G.flags.TUTOR_N===2&&CLS.slotRec(H.G).used.ev>0,J(H.G.slots)+' n0='+n0); });

await sec(1,async()=>{ const d5=TD('Y1S2',5,2); fresh(key(d5-1),12); JOBS.phone(H.G); STORY.phoneRules(GM); const q=OUT.get(H.G,'tutor_'+d5);
  check('1. 排第 5 週週二 19:00：學生家在溫州街、走路 10 分鐘、「這週請假」',!!q&&q.h===19&&q.place==='溫州街'&&q.travel==='走路 10 分鐘'&&q.no==='這週請假'&&q.ev==='ev_tutor_lesson',J(q));
  check('1. story3d.js 的最小版不另外排（只有一個）',planned().length===1,J(planned().map(q=>q.id)));
  fresh(key(d5-1),12,{TUTOR_WD:4}); JOBS.phone(H.G); check('1. 選週四＝週四那一天',!!OUT.get(H.G,'tutor_'+TD('Y1S2',5,4))&&!OUT.get(H.G,'tutor_'+d5));
  fresh(key(TD('Y1S2',2,1)),12,{tutorFromDay:TD('Y1S2',3,3)}); JOBS.phone(H.G); check('1. 答應那天以前不排（第 3 週週三答應＝第 4 週週二）',planned().length===1&&planned()[0].day===TD('Y1S2',4,2),J(planned().map(q=>key(q.day))));
  check('1. JOBS.at(G,"tutor")：今天沒課＝today false；一週算一班',JOBS.at(H.G,'tutor').today===false&&JOBS.tutorWeekly(H.G)===1); });

await sec(2,async()=>{ const d15=TD('Y1S2',15,2), d16=TD('Y1S2',16,2); fresh(key(d15),19); JOBS.phone(H.G);
  check('2. 期末考週（遊戲第 16 週）不能上課',!JOBS.tutorDayOk(H.G,d16)&&JOBS.tutorDayOk(H.G,d15));
  await go(d15); check('2. 第 15 週那一堂結尾：學生的媽媽「考試週你先顧自己。」',saidBy('學生的媽媽','考試週你先顧自己。'),J(L()));
  at(d15+1,10); JOBS.phone(H.G); check('2. 第 15 週以後：第 16 週不排',!OUT.get(H.G,'tutor_'+d16)&&planned().length===0,J(planned().map(q=>key(q.day))));
  at(TD('Y1S2',14,2),19); await lesson(9); check('2. 第 14 週那一堂沒有那一句',!said('考試週你先顧自己。'));
  H.G.slots=null; H.G.flags.TUTOR_N=1; H.said=[]; at(d16,10); STORY.phoneRules(GM); check('2. story3d.js 也不在第 16 週排（交給 JOBS）',!OUT.get(H.G,'tutor_'+d16)); });

await sec(3,async()=>{ fresh(key(TD('Y1S2',7,2)),19); const m0=H.G.money; await lesson(3,['我想知道規則是誰定的']);
  const i=H.said.findIndex(s=>s.t==='哥哥，你為什麼要念法律？');
  check('3. 第 4 堂：國中生「哥哥，你為什麼要念法律？」、三個選項',i>=0&&H.said[i].who==='國中生'&&J(H.opts[0])===J(['「以前遇到事情，我會去翻民法。看得到字，看不懂意思。我想學會怎麼讀。」','「我想知道規則是誰定的，為什麼這樣定。」','「我想在別人遇到麻煩的時候，知道自己能做什麼。」']),J(H.opts));
  check('3. 選第二個：TUTOR_WHY 2、國中生「……我也想要有一個理由。」',H.G.flags.TUTOR_WHY===2&&saidBy('國中生','……我也想要有一個理由。'));
  check('3. 筆記「我認識的人：家教的學生」',notes.some(n=>n.id==='tutor_why'&&n.title==='我認識的人：家教的學生'&&n.body==='他問我為什麼念法律。我說：『我想知道規則是誰定的，為什麼這樣定。』'),J(notes));
  check('3. 每堂結束 +1,200 元、toast「家教費 1,200 元」',H.G.money===m0+1200&&toasts.includes('家教費 1,200 元'),H.G.money-m0+' '+J(toasts));
  await lesson(4); check('3. 第 5 堂：不再問',!said('哥哥，你為什麼要念法律？')&&H.G.money===m0+2400);
  await lesson(0); check('3. 第 1 堂照舊、也有家教費',said('老師，課本寫的跟我家發生的事不一樣，那要聽誰的？')&&H.G.money===m0+3600); });

await sec(4,async()=>{ const w=n=>TD('Y1S2',n,2); fresh(key(w(5)-1),12); JOBS.phone(H.G);
  miss(w(5)); check('4. 沒去：記一次（TUTOR_MISS_RUN 1），下一週照排',H.G.flags.TUTOR_MISS_RUN===1&&!!OUT.get(H.G,'tutor_'+w(6)),J(planned().map(q=>key(q.day))));
  await go(w(6)); const i=H.said.findIndex(s=>s.t==='老師上週沒來，我媽以為你被我氣跑了。');
  check('4. 下一堂開場：國中生「老師上週沒來，我媽以為你被我氣跑了。」',i>=0&&H.said[i].who==='國中生'&&i<=1,J(L()));
  check('4. 去了：連續次數歸零',(H.G.flags.TUTOR_MISS_RUN|0)===0);
  await go(w(7)); check('4. 上週有去：沒有那一句',!H.said.some(s=>/上週/.test(s.t)));
  miss(w(8)); await go(w(9)); check('4. 第二次沒去：第二句',said('上週你沒來，我自己把那一課看完了。……騙你的，看一半。'));
  miss(w(10)); await go(w(11)); check('4. 第三次：學生的媽媽「老師上週忙吼？沒關係，柳丁還是有切。」',saidBy('學生的媽媽','老師上週忙吼？沒關係，柳丁還是有切。'));
  const before=msgs(MX).length; miss(w(12)); miss(w(13)); check('4. 連續兩週：明軒還沒問',msgs(MX).length===before);
  miss(w(14)); at(w(14),21.5); const M=msgs(MX); check('4. 連續三週：明軒「家長問我你是不是不做了。不做也沒關係，跟我說一聲就好。」',M.includes('家長問我你是不是不做了。不做也沒關係，跟我說一聲就好。'),J(M));
  const m=(H.G.msgs||[]).find(x=>x.ask&&/^tutor_ask3_/.test(x.ask.id)); check('4. 選項「還要做」「先停」',!!m&&J(m.ask.opts.map(o=>o.t))===J(['還要做','先停']));
  PHONE.answer(H.G,m.ask.id,1); JOBS.phone(H.G); msgs();
  check('4. 先停：明軒「好，我跟家長說。有空回來看看。」、TUTOR_STOP、不再排、JOBS.at＝null',msgs(MX).includes('好，我跟家長說。有空回來看看。')&&H.G.flags.TUTOR_STOP===H.G.day&&planned().length===0&&JOBS.at(H.G,'tutor')===null&&JOBS.tutorWeekly(H.G)===0,J(planned()));
  fresh(key(w(5)-1),12); JOBS.phone(H.G); miss(w(5)); miss(w(6)); miss(w(7)); at(w(7),21.5); msgs(); const m2=(H.G.msgs||[]).find(x=>x.ask&&/^tutor_ask3_/.test(x.ask.id));
  PHONE.answer(H.G,m2.ask.id,0); JOBS.phone(H.G); check('4. 還要做：照排、次數歸零',(H.G.flags.TUTOR_MISS_RUN|0)===0&&H.G.flags.TUTOR_STOP==null&&!!OUT.get(H.G,'tutor_'+w(8)),J(planned().map(q=>key(q.day))));
  miss(w(8)); at(TD('Y2S1',1,1),13); H.G.flags.TUTOR_TERM_Y2S1='go'; JOBS.phone(H.G); await go(TD('Y2S1',1,2)); check('4. 換學期：上學期最後沒去的那一句不說',!H.said.some(s=>/上週/.test(s.t)),J(L())); });

await sec(5,async()=>{ const s1=TD('Y2S1',1,1); fresh(key(TD('Y1S2',16,6)),12); JOBS.phone(H.G);
  at(DK('2026-07-14'),12); JOBS.phone(H.G); check('5. 暑假：沒有家教',planned().length===0&&JOBS.tutorWeekly(H.G)===0&&!JOBS.tutorOn(H.G));
  at(s1,9); JOBS.phone(H.G); at(s1,12.2); const M=msgs(MX); check('5. 大二上開學第一天 12:00：明軒「家長問你這學期還來嗎」',M.includes('家長問你這學期還來嗎'),J(M));
  const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='tutor_term_Y2S1'); check('5. 選項「來」「不了」',!!m&&J(m.ask.opts.map(o=>o.t))===J(['來','不了']));
  JOBS.phone(H.G); check('5. 還沒回：不排',planned().length===0);
  PHONE.answer(H.G,'tutor_term_Y2S1',0); JOBS.phone(H.G); check('5. 「來」：這學期照排（第 1 週週二）',!!OUT.get(H.G,'tutor_'+TD('Y2S1',1,2))&&JOBS.tutorWeekly(H.G)===1,J(planned().map(q=>key(q.day))));
  const s2=TD('Y2S2',1,1); at(s2,13); JOBS.phone(H.G); msgs(); const m2=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='tutor_term_Y2S2');
  check('5. 大二下開學也問一次',!!m2&&m2.text==='家長問你這學期還來嗎');
  PHONE.answer(H.G,'tutor_term_Y2S2',1); JOBS.phone(H.G); check('5. 「不了」：明軒那一句、停',msgs(MX).includes('好，我跟家長說。有空回來看看。')&&H.G.flags.TUTOR_STOP!=null&&planned().length===0);
  fresh(key(s1),13,{TUTOR_STOP:DK('2026-06-01')}); JOBS.phone(H.G); msgs(); check('5. 已經停了：開學不問',!(H.G.msgs||[]).some(x=>x.ask&&/^tutor_term_/.test(x.ask.id))); });

await sec(6,async()=>{ const kk=DK('2027-05-15'); fresh('2027-05-10',12,{TUTOR_TERM_Y2S1:'go',TUTOR_TERM_Y2S2:'go'}); JOBS.phone(H.G); const d=DK('2027-05-11');
  check('6. 會考前那一週的週二照排',!!OUT.get(H.G,'tutor_'+d));
  await go(d); check('6. 最後一堂：國中生「考完我會跟你說考得怎樣」',saidBy('國中生','考完我會跟你說考得怎樣'),J(L()));
  check('6. 會考那週以後不排',!OUT.get(H.G,'tutor_'+(d+7))&&planned().length===0);
  at(DK('2027-05-04'),19); await lesson(9); check('6. 前一週那一堂沒有那一句',!said('考完我會跟你說考得怎樣'));
  at(kk,10); JOBS.phone(H.G); check('6. 會考那天：家教結束（TUTOR_DONE＝5/16）',H.G.flags.TUTOR_DONE===kk+1&&JOBS.at(H.G,'tutor')===null);
  at(kk+1,20.5); check('6. 5/16 21:00 以前還沒有',!msgs('p:tutor_kid').length); at(kk+1,21.1);
  check('6. 5/16 21:00：家教的學生「考完了。社會我覺得還好。」',J(msgs('p:tutor_kid'))===J(['考完了。社會我覺得還好。'])&&(typeof PORTRAIT_ONLY==='undefined'||(!!PORTRAIT_ONLY.tutor_kid&&PORTRAIT_ONLY.tutor_kid.name==='家教的學生')),J(msgs('p:tutor_kid')));
  fresh('2027-05-15',10,{TUTOR_TERM_Y2S1:'go',TUTOR_TERM_Y2S2:'stop',TUTOR_STOP:DK('2027-02-22')}); JOBS.phone(H.G); at(DK('2027-05-16'),22); check('6. 大二下沒上的：沒有那則訊息',!msgs('p:tutor_kid').length); });

H.done();
})();

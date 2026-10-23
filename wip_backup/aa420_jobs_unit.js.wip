// 溫州街三家店的打工（DL-10；USER_WANTS B06；AA_420 第 2 節、AA_164 第 2、6、7 節、AA_165）——不需要瀏覽器。src/jobs3d.js、src/data/wz_jobs.js
//   0  載得到；index.html 接在 b1story3d.js 後面；舊存檔（沒有 G.jobs）：JOBS.at／any 都是 null、讀得到
//   1  應徵：大一上不行；大一下吃過三次，小米姐開口（「你週末早上都起得來嗎？」）→ 應徵 → 選班表；週六＋去過法服＝小米姐那一句（AA_420 第 12 條）；週四影印＋去過公法讀書會＝阿德那一句
//   2  一班：第一班 WZ-B1 兩句（AA_420 2-3）、三段、熟練描述、薪水（2026 年 206×4）、熟練 +1、填滿上午；國定假日加倍＋WZ-B5（大一的回答）
//   3  沒去：下一班小蕙那一句（AA_420 2-4）；連三週沒去＝私訊「還要做嗎？」；影印 2-6 #1、阿芃第 3 題（AA_420 2-4）
//   4  一週最多兩班；那個時段有課的不列
//   5  寒暑假：放假第一天三家各問一次；「放假先停。」不排班、開學第一週恢復、不算沒去；「來。」照班表、營隊那幾天自動請假
//   6  出國：日本路線大三下、美國路線大四上暫停；回國第一次走進店裡老闆一句；「先不了。」＝離開的時候（房間物件）
//   7  延畢：離開的時候在大五上最後一班；臺灣路線在大四下最後一班
//   8  撞時段：週六早午餐＋法服值班、週四影印＋公法讀書會，出門提醒兩個都列，選一個
//   9  JOBS.at 給 wzshops3d.js：影印店的班那時候不能當客人；有班那天的黑板；考試週加班
// 修改前（開發分支 01ade8098）：沒有 src/jobs3d.js——FAIL。用法：node tests/aa420_jobs_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.SISY23={preTalk:async()=>false};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ for(const f of ['src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/wz_jobs.js','src/jobs3d.js']) load(f); }catch(e){ ok=false; err=String(e&&e.stack||e); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
let money=[]; GM.money=d=>{ money.push(d); H.G.money=(H.G.money|0)+d; };
GM.addNote=(id,title,body)=>{ const N=H.G.notes||(H.G.notes=[]); if(!N.some(n=>n.id===id)) N.push({id,title,body}); };
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(k,h,zone||'wenzhou',flags); toasts.length=0; money=[]; return G; };
const DK=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key;
const nextWd=(k,wd)=>{ let d=DK(k); while(CALENDAR.dateOf(d).wd!==wd) d++; return d; };
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const hire=(k,days,flags)=>{ const J0=JOBS.rec(H.G); J0[k]={since:H.G.day-1,from:(H.G.day-1)*24,day:days,shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:H.G.day-1,wk:{},brk:{},ot:{}}; Object.assign(J0[k],flags||{}); return J0[k]; };
const said=t=>H.said.some(s=>s.t===t);
const L=()=>H.lines();

(async()=>{
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
check('0. 新檔載得到；index.html：b1story3d.js → data/wz_jobs.js → jobs3d.js',ok&&typeof JOBS!=='undefined'&&/b1story3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/wz_jobs\.js\?v=[^"]+"><\/script>\n<script src="src\/jobs3d\.js/.test(html),err);
await sec(0,()=>{ const G=fresh('2026-03-07',9); delete G.jobs; check('0. 舊存檔（沒有 G.jobs）：at、any 都是 null；rec 補上空的',JOBS.at(G,'brunch')===null&&JOBS.at(G,'print')===null&&JOBS.any(G)===null&&JOBS.at(G,'cvs')===null&&J(JOBS.rec(G))==='{"_meta":{"n":{},"asked":{}}}');
  G.flags.JOB_TUTOR=true; G.flags.TUTOR_WD=4; const t=JOBS.at(G,'tutor'); check('0. 家教（AA_164 第 7 節 tutor）：照舊 JOB_TUTOR',!!t&&J(t.day)==='[4]'); });

await sec(1,async()=>{ fresh('2025-10-11',9,'wz_brunch'); JOBS.rec(H.G)._meta.n.brunch=5; await JOBS.visit(GM,'brunch','cashier',true); check('1. 大一上：不開口（大一下第 1 週起）',!said('你週末早上都起得來嗎？')&&!JOBS.job(H.G,'brunch'));
  const sat=nextWd('2026-03-02',6); fresh(key(sat),9,'wz_brunch',{LAWCLUB_SAT_VISITS:2}); const M=JOBS.rec(H.G)._meta; M.n.brunch=2;
  H.picks=['（應徵）','週六']; await JOBS.visit(GM,'brunch','cashier',true);
  check('1. 吃第三次：小米姐「你週末早上都起得來嗎？」→ 應徵 → 週六',said('你週末早上都起得來嗎？')&&J(JOBS.job(H.G,'brunch').day)==='[6]',J(L()));
  check('1. 選了週六、去過法服＝小米姐「週六上午你不是有法服？要去的那週，前一天跟我說。」',said('週六上午你不是有法服？要去的那週，前一天跟我說。'));
  fresh(key(sat),20,'wz_print'); global.ACTIVITIES.attendedAny=(G,id)=>id==='public_law_group'; JOBS.rec(H.G)._meta.n.copy=2; H.picks=['（應徵）','週四','就週四一天']; await JOBS.visit(GM,'copy','print',true);
  check('1. 印第三次：阿德「你常來。晚上缺人，要不要來？」；週四＋讀書會＝阿德那一句',said('你常來。晚上缺人，要不要來？')&&said('週四晚上你有讀書會吧。那幾週要去，就去。')&&J(JOBS.job(H.G,'copy').day)==='[4]',J(L()));
  delete global.ACTIVITIES.attendedAny;
  fresh(key(sat),20,'wz_print'); global.ACTIVITIES.attendedAny=()=>false; JOBS.rec(H.G)._meta.n.copy=2; H.picks=['（應徵）','週四','就週四一天']; await JOBS.visit(GM,'copy','print',true);
  check('1. 沒去過讀書會的玩家沒有那一句',!said('週四晚上你有讀書會吧。那幾週要去，就去。')); delete global.ACTIVITIES.attendedAny;
  fresh(key(sat),14,'wz_teahouse'); JOBS.rec(H.G)._meta.n.tea=1; H.picks=['（應徵）','週日']; await JOBS.visit(GM,'tea','tea',true); check('1. 喝第二次：蘇姨「你掃地會不會？」',said('你掃地會不會？')&&J(JOBS.job(H.G,'tea').day)==='[7]'); });

await sec(2,async()=>{ const sat=nextWd('2026-03-02',6); fresh(key(sat),7.4,'wz_brunch'); hire('brunch',[6]); H.picks=[0,0,0,0];
  check('2. 07:24 在店裡：shiftNow',JOBS.shiftNow(H.G,'brunch'));
  await JOBS.runShift(GM,'brunch'); const j=JOBS.job(H.G,'brunch');
  check('2. 第一班：WZ-B1 兩句（AA_420 2-3）',said('半熟是三分四十秒。不是三分半，不是四分。')&&said('差十秒，蛋黃就不會流了。你等一下就知道。')&&!said('你們法律系的，應該最懂差十秒有多重要。'),J(L()));
  check('2. 三段：開店第 1 句、熟練 0～2、尖峰第 1 件、收尾第 1 句',said('鐵捲門拉起來的聲音，是整條溫州街第一個醒來的聲音。你擺好十二副餐具。')&&said('你一次只敢拿一個盤子。')&&said('我的蛋太熟了。')&&said('蛋是我煮的。你的那顆，下次自己煮。'));
  check('2. 薪水 2026 年 206×4＝824；下班 11:30；熟練 1、班數 1；上午填滿',money.includes(824)&&Math.abs(H.G.hour-11.5)<1e-6&&j.skill===1&&j.shifts===1&&H.G.slots&&H.G.slots.used.am>=1,J(money)+' '+H.G.hour);
  check('2. 第一班以後有小米姐的聯絡方式',INV.hasContact(H.G,'wz_mi'));
  /* 國定假日：2026-10-10（六）國慶 */
  const d=DK('2026-10-10'); at(d,7.5,'wz_brunch'); H.said=[]; money=[]; j.shifts=3; j.skill=3; H.picks=[0,0,0,0];
  check('2. 10/10 是國定假日（勞基法的休假日）',JOBS.natHoliday(d)&&!JOBS.natHoliday(DK('2025-11-15')));
  await JOBS.runShift(GM,'brunch');
  check('2. 國定假日：WZ-B5（大二＝「好像有……我去查。」）、小米姐（在廚房）、薪水加倍 206×4×2',said('今天國定假日，我們有加倍嗎？')&&said('好像有……我去查。')&&said('有。薪水單上會寫。')&&money.includes(1648)&&H.G.notes.some(n=>n.id==='NOTE_HOLIDAY_WAGE'),J(L())+J(money));
  const d2=nextWd('2026-10-12',6); at(d2,7.5,'wz_brunch'); H.said=[]; H.picks=[0,0,0,0]; await JOBS.runShift(GM,'brunch');
  check('2. 下一班的旁白（AA_420 2-3）',said('（收尾的時候，小蕙拿出她的打工合約，問你要看哪裡。你們從第一行開始看。）'));
  const d3=DK('2027-10-10'); fresh(key(d3),7.5,'wz_brunch'); const j3=hire('brunch',[7]); j3.shifts=5; H.picks=[0,0,0,0]; await JOBS.runShift(GM,'brunch');
  check('2. 大三的國定假日：勞基法那一句（2027 年 215×4×2）',said('有。國定假日是勞基法的休假日，老闆請我們來，工資要加倍。')&&money.includes(1720),J(money)); });

await sec(3,async()=>{ const sat=nextWd('2026-03-02',6); fresh(key(sat),6,'dorm'); const j=hire('brunch',[6]); j.shifts=2; j.missN=1;
  at(sat+7,13,'dorm'); JOBS.track(H.G); check('3. 上週六沒去＝missPend',j.missPend===true);
  at(sat+14,7.5,'wz_brunch'); H.said=[]; H.picks=[0,0,0,0]; await JOBS.runShift(GM,'brunch');
  check('3. 下一班：小蕙「你上週沒來，我一個人跑了整個早上。……腳現在還在痛。」（AA_420 2-4）',said('你上週沒來，我一個人跑了整個早上。……腳現在還在痛。')&&!said('你上週沒來，我一個人端了八十盤。我數過。'),J(L()));
  /* 連三週沒去 */
  at(sat+14+23,13,'dorm'); JOBS.phone(H.G); PHONE.tick(H.G); check('3. 連三週沒去：私訊「還要做嗎？」',H.msgs('p:wz_mi').includes('還要做嗎？'),J(H.msgs('p:wz_mi')));
  const m=(H.G.msgs||[]).find(x=>x.text==='還要做嗎？'); PHONE.answer(H.G,m.ask.id,1); JOBS.phone(H.G);
  check('3. 回「（辭職）」：小米姐「有空回來看看」；下次走進店裡演離開的時候',H.msgs('p:wz_mi').includes('有空回來看看')&&j.pendLeave===true&&JOBS.any(H.G)===null);
  H.said=[]; await JOBS.onEnter(GM,'brunch'); check('3. 走進店裡：「三分四十秒。以後煮給別人吃。」＋計時器',said('三分四十秒。以後煮給別人吃。')&&!!H.G.flags.WZ_ITEM_TIMER&&STORY.roomItemList(H.G).some(r=>r[0]==='蛋的計時器'&&r[1]==='小米姐的計時器。三分四十秒那一格，有一道舊刮痕。'));
  /* 影印 2-6 #1、阿芃第 3 題 */
  check('3. 影印沒去 #1（AA_420 2-4）',J(WZ_JOBS_DATA.copy.miss[0])===J([['阿德','上週有一份論文，我自己裝的。……書背有一點歪。']]));
  check('3. 阿芃第 3 題：上過 ip_law 第 4 週／其他、「我才{年級}。」',WZ_JOBS_DATA.copy.apeng[2].ip==='這題很好。老師上課剛好講到這個。'&&WZ_JOBS_DATA.copy.apeng[2].no==='這題我要回去想。'&&WZ_JOBS_DATA.copy.apeng[2].next==='那你想好了再跟我說。我不急。我才{年級}。'&&WZ_JOBS_DATA.copy.grade.Y1==='國二'&&WZ_JOBS_DATA.copy.grade.Y4==='高二'); });

await sec(4,async()=>{ const sat=nextWd('2026-03-02',6); fresh(key(sat),14,'wz_teahouse'); hire('brunch',[6,7]); H.picks=['（應徵）']; JOBS.rec(H.G)._meta.n.tea=1; await JOBS.visit(GM,'tea','tea',true);
  check('4. 已經兩班：茶屋排不進去（一週最多兩班）',!JOBS.job(H.G,'tea')&&toasts.some(t=>/一週最多兩班/.test(t)),J(toasts));
  fresh(key(sat),14,'wz_teahouse',{JOB_TUTOR:true}); hire('brunch',[6]); JOBS.rec(H.G)._meta.n.tea=1; H.picks=['（應徵）']; await JOBS.visit(GM,'tea','tea',true); check('4. 大一下有家教（一週一次）＋早午餐一班：茶屋也排不進去',!JOBS.job(H.G,'tea'));
  fresh(key(sat),14,'wz_teahouse'); const keep=COURSES.list.slice(); COURSES.list.push({id:'zz_sat',name:'測試課',term:'Y1S2',slots:[{wd:6,block:'pm1'}],credits:0}); CLS._t=null;
  JOBS.rec(H.G)._meta.n.tea=1; H.picks=['（應徵）']; await JOBS.visit(GM,'tea','tea',true); const opts=H.opts[1]||[];
  check('4. 週六下午有課：茶屋的班表不列週六',!opts.includes('週六')&&opts.includes('週日'),J(opts)); COURSES.list.length=0; keep.forEach(c=>COURSES.list.push(c)); });

await sec(5,async()=>{ const b=HOME.breakOf(DK('2026-06-20')); check('5. 大一暑假從 6/15 起',!!b&&key(b.from)==='2026-06-15',J(b));
  fresh(key(b.from-1),20); for(const k of ['brunch','copy','tea']){ const j=hire(k,k==='copy'?[2]:(k==='brunch'?[6]:[7])); j.shifts=2; }
  at(b.from,13); JOBS.phone(H.G); PHONE.tick(H.G);
  check('5. 放假第一天：三家各問一次（AA_420 第 13 條的三句）',H.msgs('p:wz_mi').includes('放假了。週末早上還來嗎？')&&H.msgs('p:wz_ade').includes('放假了，晚上比較閒。還要來嗎？')&&H.msgs('p:wz_su').includes('放假了。院子還是要掃。'));
  const ask=id=>(H.G.msgs||[]).find(m=>m.th===id&&m.ask);
  PHONE.answer(H.G,ask('p:wz_mi').ask.id,1); PHONE.answer(H.G,ask('p:wz_su').ask.id,0); PHONE.answer(H.G,ask('p:wz_ade').ask.id,0); JOBS.phone(H.G);
  check('5. 回覆：小米姐「好。開學見。」、蘇姨「好。」、阿德「好。」',H.msgs('p:wz_mi').includes('好。開學見。')&&H.msgs('p:wz_su').includes('好。')&&H.msgs('p:wz_ade').includes('好。'));
  const sat=nextWd(key(b.from),6), sun=sat+1;
  check('5. 「放假先停。」：暑假的週六早午餐不排',!JOBS.due(H.G,'brunch',sat)&&JOBS.paused(H.G,'brunch'));
  check('5. 「來。」：暑假的週日茶屋照班表',JOBS.due(H.G,'tea',sun));
  at(sat+21,12); JOBS.track(H.G); check('5. 停的那幾週不算沒去',JOBS.job(H.G,'brunch').missPend!==true&&(JOBS.job(H.G,'brunch').missedRun|0)===0);
  const s0=CALENDAR.termDays('Y2S1').from, w1=nextWd(key(s0),6); check('5. 開學第一週恢復',JOBS.due(H.G,'brunch',w1));
  /* 營隊那幾天自動請假：C02 7/1～7/5（7/5 是週日）*/
  const c02=DK('2026-07-05'); VAC.rec(H.G).reg['C02@Y1']='yes'; check('5. 「來。」的玩家：C02 營隊那天自動請假',CALENDAR.dateOf(c02).wd===7&&JOBS.scheduled(H.G,'tea',c02)&&!JOBS.due(H.G,'tea',c02)); });

await sec(6,async()=>{ /* 日本路線：大三下（2028-02-20 退宿起）*/ const sat=nextWd('2028-01-03',6); fresh(key(sat),6,'dorm',{EXCHANGE_ROUTE:'JP'}); const j=hire('copy',[3]); j.shifts=4;
  const wed=nextWd('2028-03-06',3); check('6. 日本路線大三下：暫停',!JOBS.due(H.G,'copy',wed)&&JOBS.away(H.G,wed));
  at(DK('2028-03-01'),12); JOBS.phone(H.G); at(DK('2028-08-10'),12); JOBS.phone(H.G); check('6. 回國（8/5 以後）：等第一次走進店裡',j.back===true&&!JOBS.due(H.G,'copy',nextWd('2028-09-04',3)));
  H.said=[]; H.picks=['「先不了。」']; at(DK('2028-08-10'),15,'wz_print'); await JOBS.onEnter(GM,'copy');
  check('6. 阿德「回來了喔。阿芃一直問你去哪了。還要來嗎？」→「先不了。」→「好。有東西要印就來。」→「書背對齊了。」',said('回來了喔。阿芃一直問你去哪了。還要來嗎？')&&said('好。有東西要印就來。')&&said('書背對齊了。')&&!!H.G.flags.WZ_ITEM_NOTEBOOK&&j.gone==='quit',J(L()));
  /* 美國路線：大四上（2028-07-25 起）；茶屋回來＝「回來了。」（她把竹掃把遞給你。）→「回來做。」重選 */
  fresh('2028-06-01',12,'dorm',{EXCHANGE_ROUTE:'US'}); const t=hire('tea',[6]); t.shifts=3; check('6. 美國路線大四上：暫停',!JOBS.due(H.G,'tea',nextWd('2028-09-04',6)));
  at(DK('2028-09-01'),12); JOBS.phone(H.G); at(DK('2028-12-26'),12); JOBS.phone(H.G); H.said=[]; H.picks=['「回來做。」','週六']; H.G.zone='wz_teahouse'; await JOBS.onEnter(GM,'tea');
  check('6. 蘇姨「回來了。」（她把竹掃把遞給你。）→「回來做。」→ 重選班表',said('回來了。')&&said('（她把竹掃把遞給你。）')&&!t.back&&J(t.day)==='[6]'&&!t.gone,J(L()));
  /* 半熟「回來了？小蕙說你一定會回來。……週末還來嗎？」 */
  check('6. 半熟回國那一句、「先不了。」那一句',J(WZ_JOBS_DATA.back.brunch.lines[0])===J(['小米姐','回來了？小蕙說你一定會回來。……週末還來嗎？'])&&J(WZ_JOBS_DATA.back.brunch.no)===J(['小米姐','好。來吃飯就好。'])&&J(WZ_JOBS_DATA.back.tea.no)===J(['蘇姨','好。來喝茶。'])); });

await sec(7,async()=>{ /* 臺灣路線：大四下第 15 週最後一班＝離開的時候 */ const r=CALENDAR.termDays('Y4S2'); let last=r.to; while(CALENDAR.dateOf(last).wd!==7) last--; fresh(key(last),12.9,'wz_teahouse'); const j=hire('tea',[7]); j.shifts=20; H.picks=[0,0,0,0];
  check('7. 臺灣路線：大四下最後一個週日有班',JOBS.due(H.G,'tea',last)); await JOBS.runShift(GM,'tea');
  check('7. 大四下最後一班：「你泡得最好的那一種。」＋一小罐茶',said('你泡得最好的那一種。')&&!!H.G.flags.WZ_ITEM_TEA&&j.gone==='grad',J(L().slice(-3)));
  /* 延畢（美國路線）：大四下最後一班不離開；大五上最後一班才離開 */
  fresh(key(last),12.9,'wz_teahouse',{EXCHANGE_ROUTE:'US'}); const k=hire('tea',[7]); k.shifts=20; H.picks=[0,0,0,0]; await JOBS.runShift(GM,'tea');
  check('7. 延畢：大四下最後一班照常（沒有離開）',!said('你泡得最好的那一種。')&&!k.gone);
  const r5=CALENDAR.termDays('Y5S1'); let l5=r5.to; while(CALENDAR.dateOf(l5).wd!==7) l5--; check('7. 大五上的週日有班（termOfDelayed）',JOBS.due(H.G,'tea',l5)&&!JOBS.due(H.G,'tea',l5-7*20));
  at(l5,12.9,'wz_teahouse'); H.said=[]; H.picks=[0,0,0,0]; await JOBS.runShift(GM,'tea'); check('7. 大五上最後一班：離開的時候',said('你泡得最好的那一種。')&&k.gone==='grad'); });

await sec(8,async()=>{ /* 大二上第 3 週週六（單週，法服值班）：社員 */ const sat=STORY.termDayIn('Y2S1',3,6); fresh(key(sat),6.9,'dorm',{lawclub:true}); hire('brunch',[6]);
  STORY.phoneRules(GM); JOBS.plan(H.G); const ids=OUT.rec(H.G).map(q=>q.id); check('8. 週六：早午餐、法服兩個出門提醒都排了',ids.includes('job_brunch_'+sat)&&ids.includes('fafu_'+sat),J(ids));
  H.G.hour=7.1; const q=OUT.due(H.G); H.picks=['出發：法服值班']; await OUT.prompt(GM,q);
  const o=H.opts.slice(-1)[0]||[]; check('8. 出門提醒兩個都列（早午餐、法服）',o.some(t=>/^出發：半熟的班/.test(t))&&o.some(t=>/^出發：法服值班/.test(t)),J(o));
  check('8. 選法服：早午餐算這週請假（missed）、到萬才館',OUT.get(H.G,'job_brunch_'+sat).state==='missed'&&H.entered.includes('wancai'),J(H.entered));
  /* 週四影印＋公法讀書會（大二上第 3 週週四有讀書會）*/ const thu=STORY.termDayIn('Y2S1',3,4); fresh(key(thu),17.5,'dorm',{CLUB_public_law_group:true}); hire('copy',[4]); JOBS.plan(H.G);
  H.G.hour=17.6; const q2=OUT.due(H.G); H.picks=['去公法讀書會']; await OUT.prompt(GM,q2); const o2=H.opts.slice(-1)[0]||[];
  check('8. 週四：影印的班、公法讀書會兩個都列；選讀書會＝影印這週請假',o2.some(t=>/^出發：阿德影印的班/.test(t))&&o2.includes('去公法讀書會')&&OUT.get(H.G,'job_copy_'+thu).state==='missed',J(o2)); });

await sec(9,async()=>{ const tue=STORY.termDayIn('Y2S1',3,2); fresh(key(tue),18,'wz_print'); hire('copy',[2]); const j=JOBS.at(H.G,'print');
  check('9. JOBS.at(G,"print")：有班、shiftNow',!!j&&j.today&&j.shiftNow);
  await WZS.interact(GM,{wzShop:'print',kind:'print'}); check('9. 班的時間不能當客人：「今天是你的班。」',toasts.includes('今天是你的班。'));
  const sat=STORY.termDayIn('Y2S1',3,6); fresh(key(sat),7.5,'wz_brunch'); hire('brunch',[6]); H.picks=[0,0,0,0]; await JOBS.runShift(GM,'brunch'); H.G.hour=12;
  check('9. 有班那天的黑板（今天早上寫的）',J(WZS.boardLines(H.G))===J(['今日推薦：法式吐司。週末，甜一點也沒關係。','這是你早上寫的。字有一點歪。']),J(WZS.boardLines(H.G)));
  /* 考試週加班：大二上第 9 週（期中），週一（第 8 週週一 10/26 是光復節的補假：加倍）*/
  const mon=STORY.termDayIn('Y2S1',9,1); fresh(key(mon),20,'dorm'); hire('copy',[3]); JOBS.plan(H.G); check('9. 考試週：阿德的加班（21:00～24:00）排進出門提醒',!!OUT.get(H.G,'job_copyot_'+mon));
  H.G.hour=20.6; const q=OUT.due(H.G); H.picks=['出發']; await OUT.prompt(GM,q); H.G.zone='wz_print'; H.G.hour=20.8; money=[]; H.said=[];
  check('9. 到了店裡：加班開始',JOBS.otNow(H.G)); await JOBS.runOT(GM);
  check('9. 加班：考試週那一句、2026 年 206×3＝618、到 24:00',said('店門口排了十二個人，每個人手上都有一個隨身碟。阿德說：「今天是法律系。下週是醫學系。」')&&money.includes(618)&&Math.abs(H.G.hour-24)<1e-6,J(money)+H.G.hour);
  JOBS.plan(H.G); check('9. 同一個考試週不再問',!OUT.get(H.G,'job_copyot_'+(mon+1))||(()=>{ H.G.day=mon+1; H.G.hour=12; JOBS.plan(H.G); return !OUT.get(H.G,'job_copyot_'+(mon+1)); })()); });

H.done();
})();

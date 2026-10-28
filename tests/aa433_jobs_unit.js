// 打工第二批（AA_433，企劃線 78641fff5）：便利商店夜班、補習班助教、事務所工讀——不需要瀏覽器。src/jobs3d.js（JOBS：cvs、cram、office）＋src/data/wz_jobs.js
//   1  便利商店：櫃台旁的告示；22:00 以後買東西第 4 次結帳時店長開口；班表週二 18:00～22:00、週五 22:00～02:00；三段工作；夜班最後一句；
//      小事件 AA_289 3-4（熟客＝夜班、颱風天＝颱風假前一天的班（JOB_CVS）、外送員的雨衣）；夜班下班回宿舍睡到 10:00、隔天早上的班自動請假
//   2  補習班（大二起）：霖澤館一樓公布欄 →「打電話問。」→ 班主任 → 下週一 18:00 面試（2D）→ 班表週一、週三 18:30～21:30（從下週起）→ 2D 的班、薪水 588；小事件 AA_289 3-5
//   3  事務所（大三起）：公布欄 →「寄履歷。」→ 一週後 14:00 助理私訊 → 下週二／週四 14:00 面談（律師三選一都錄取）→ 班表週二、週四 13:30～17:30（撞課照樣可以選）；小事件 AA_289 3-6；面談沒去可以重來
// 修改前（開發分支 HEAD）：沒有這三種打工——FAIL。用法：node tests/aa433_jobs_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.SISY23={preTalk:async()=>false};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT|WZ_PARK_LAYOUT|PARK|WZ_EVENTS|WZL|Y2B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ for(const f of ['src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/y2b_events.js','src/data/wz_jobs.js','src/jobs3d.js','src/data/wz_events.js','src/wzlines3d.js']) load(f); }catch(e){ ok=false; err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(k,h,zone||'dorm',flags); toasts.length=0; return G; };
const DK=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key, TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const said=t=>H.said.some(s=>s.t===t);
const saidBy=(w,t)=>H.said.some(s=>s.t===t&&s.who===w);
const L=()=>H.lines();
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const hire=(k,days,o)=>{ const J0=JOBS.rec(H.G); J0[k]=Object.assign({since:H.G.day-1,from:(H.G.day-1)*24,day:days,shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:H.G.day-1,wk:{},brk:{},ot:{}},o||{}); return J0[k]; };
const sleeps=[]; const sl0=STORY.sleepNow; STORY.sleepNow=async(GM,w)=>{ sleeps.push(w); };   /* 夜班回宿舍睡：記下來就好 */
const shift=async(k,d,picks)=>{ const h0=JOBS.hrs(k,d)[0]; at(d,h0-0.1,k==='cvs'?'cvs':'dorm'); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); toasts.length=0; const m0=H.G.money;
  if(k==='cvs') await JOBS.runShift(GM,k); else { at(d,h0); await EVENTS.run(ev('ev_job2d_'+k)); } return H.G.money-m0; };
const msgs=th=>{ PHONE.tick(H.G); return (H.G.msgs||[]).filter(m=>!th||m.th===th).map(m=>m.text); };

(async()=>{
check('0. 載得到：JOBS 有 cvs、cram、office；便利商店的區域；2D 的事件',ok&&['cvs','cram','office'].every(k=>JOBS.KEYS.includes(k))&&JOBS.ZONE_KEY.cvs==='cvs'&&!!ev('ev_job2d_cram')&&!!ev('ev_job2d_office_iv'),err);

await sec(1,async()=>{ fresh(key(TD('Y1S2',2,3)),15,'cvs'); H.E.interactables=[]; const it=JOBS.addDesk(GM,'cvs'); check('1. 櫃台旁的告示「應徵：徵晚班、夜班人員　意者洽店長」',!!it&&it.label==='應徵：徵晚班、夜班人員　意者洽店長'&&it.hidden===false);
  for(let i=0;i<5;i++) await EAT.ordered(GM,'公館的便利商店','飯糰'); check('1. 白天買五次：店長不開口',!said('你常這麼晚來。……要不要乾脆來上班？'));
  at(H.G.day,22.5); H.said=[]; for(let i=0;i<3;i++) await EAT.ordered(GM,'公館的便利商店','飯糰'); check('1. 22:00 以後第 3 次：還沒',!said('你常這麼晚來。……要不要乾脆來上班？'));
  at(H.G.day+1,24.6); H.picks=['「好。」','週五']; H.opts=[]; await EAT.ordered(GM,'公館的便利商店','飯糰');
  check('1. 22:00 以後第 4 次（過午夜也算）：店長「你常這麼晚來。……要不要乾脆來上班？」',saidBy('店長','你常這麼晚來。……要不要乾脆來上班？'),J(L()));
  check('1. 班表：週二、週五、兩天；選週五＝toast「班表：便利商店　週五 22:00～02:00」',J(H.opts[1])===J(['週二','週五','週二和週五','先不要'])&&J(JOBS.job(H.G,'cvs').day)===J([5])&&toasts.includes('班表：便利商店　週五 22:00～02:00'),J(H.opts)+J(toasts));
  const fri=TD('Y1S2',3,5); fresh(key(fri),20,'dorm'); hire('cvs',[2,5]); JOBS.plan(H.G); const q=OUT.get(H.G,'job_cvs_'+fri); check('1. 週五夜班的出門提醒 22:00「便利商店的班（22:00～02:00）」、帶到便利商店',!!q&&q.h===22&&q.title==='便利商店的班（22:00～02:00）'&&q.goto.zone==='cvs',J(q));
  sleeps.length=0; H.entered=[]; const pay=await shift('cvs',fri,['「先補冷藏櫃。」','「說歡迎光臨。」','「拖地。」']);
  check('1. 夜班：三段（新手）＋選了的那一句',said('（一車的飲料，你不知道哪一排先補。）')&&said('（冷藏櫃的門一開一關，手凍到發麻。）')&&said('（客人點了一下頭。）')&&said('（地板乾得很快，鞋印還是一直出現。）'),J(L()));
  /* 2026-10-28 改：AA_497 第 8 節第 3 點（企劃線 60fc3b9a3）芯慈追劇減量——「她手機在放劇：「這是一部很重要的劇。」」換成「她把耳機拿下來：「我在等永和的末班車。……沒等到。」」（tests/aa497_supporting_unit.js 第 8 節）*/
  check('1. 第一班＝夜班：「熟客」（凌晨十二點半芯慈……；AA_497 第 8 節換句）',said('凌晨十二點半芯慈來買咖啡：「……你在這裡打工？」她把耳機拿下來：「我在等永和的末班車。……沒等到。」'));
  check('1. 夜班最後一句「（兩點，換班的人來了。外面的路燈下沒有人。）」、784、toast「便利商店 薪水 784 元」',said('（兩點，換班的人來了。外面的路燈下沒有人。）')&&pay===784&&toasts.includes('便利商店 薪水 784 元')&&Math.abs(H.G.hour-26)<1e-6,pay+' '+H.G.hour);
  check('1. 下班回宿舍睡到隔天 10:00；週五晚上的時段算一件',H.entered.includes('dorm')&&sleeps.includes(10)&&CLS.slotRec(H.G).used.ev>0,J(H.entered)+J(sleeps));
  at(fri+1,7); hire('brunch',[6]); check('1. 隔天週六早上 07:30 的早午餐班：自動請假（夜班）',JOBS.excused(H.G,'brunch',fri+1)==='night');
  const tue=TD('Y1S2',4,2); fresh(key(tue),17,'dorm'); hire('cvs',[2]); await shift('cvs',tue);
  check('1. 週二晚班：沒有夜班那一句；熟客（夜班才有）先不演＝第一班演「外送員的雨衣」',!said('（兩點，換班的人來了。外面的路燈下沒有人。）')&&!said('（兩點。你走回宿舍，路上只有一台垃圾車。）')&&saidBy('外送員','幫我顧一下，一分鐘就好。')&&said('（他回來的時候，雨衣還在滴水，手上拿了兩杯熱飲。）')&&saidBy('外送員','一杯給你。'),J(L()));
  const ty=DK('2027-10-12'); fresh(key(ty),17,'dorm'); hire('cvs',[2]); await shift('cvs',ty);
  check('1. 颱風假前一天的班（2027-10-12）：「颱風天」（店長留了兩碗）、記 JOB_CVS',said('泡麵被搶光，店長留了兩碗在櫃台下：「一碗給你，一碗給我。」')&&H.G.flags.JOB_CVS===ty,J(L()));
  fresh(key(TD('Y1S2',2,3)),15,'cvs'); hire('cvs',[5]); check('1. 自己在便利商店打工：店員那幾句不演（EAT 讀 JOBS.at(G,\'cvs\')）',!!JOBS.at(H.G,'cvs')); });

await sec(2,async()=>{ fresh(key(TD('Y1S2',5,2)),12,'linze'); H.E.interactables=[]; const it=JOBS.addBoard(GM); check('2. 大一下：公布欄沒有徵才單（按鈕藏起來）',!!it&&it.hidden===true&&it.lv===0);
  const d0=TD('Y2S1',1,3); fresh(key(d0),12,'linze'); H.E.interactables=[]; const it2=JOBS.addBoard(GM); check('2. 大二上第 1 週：有補習班的徵才單（還沒有事務所）',it2.hidden===false&&J(JOBS.board2(H.G))===J(['cram']));
  const POST=()=>{ const mk=n=>{ const m={isMesh:true,material:{visible:true}}; return {name:n,mesh:m,traverse(f){ f(this); f(m); }}; }; const c=mk('L0_WALL_notice_job_cram'), o=mk('L0_WALL_notice_job_office');
    const z0=H.E.zone; H.E.zone={formal:true,group:{traverse(f){ f(c); f(o); }}}; JOBS.posterSync(GM); const r=[c.mesh.material.visible,o.mesh.material.visible]; H.E.zone=z0; return r; };
  check('2. 公布欄模型上的徵才單（LAWWW2 fc86f7507）：大二上第 1 週只看得到補習班那張',J(POST())===J([true,false]));
  H.picks=['高中補習班徵助教','「打電話問。」']; H.said=[]; H.opts=[]; await STORY.interact(it2,GM);
  check('2. 徵才單的字、「打電話問。」→ 班主任「下週一六點來面試，帶學生證。」',J(H.opts[0])===J(['高中補習班徵助教　週一、週三 18:30～21:30　會改考卷、能回答學生問題','不看了'])&&saidBy('班主任','下週一六點來面試，帶學生證。'),J(H.opts)+J(L()));
  const mon=TD('Y2S1',2,1), q=OUT.get(H.G,'job_iv_cram_'+mon); check('2. 下週一 18:00 面試（出遊，2D）',!!q&&q.h===18&&q.ev==='ev_job2d_cram_iv'&&q.title==='補習班面試'&&!q.goto,J(q));
  check('2. 面試排好了：公布欄不再列',JOBS.board2(H.G).length===0);
  check('2. 面試排好了：模型上的補習班徵才單也拿掉',J(POST())===J([false,false]));
  at(mon,18); H.said=[]; H.opts=[]; H.picks=['週一']; await EVENTS.run(ev('ev_job2d_cram_iv'));
  check('2. 面試：班主任「改一張考卷給我看。……好，下週開始。」；班表週一、週三 18:30～21:30（從下週一起）',saidBy('班主任','改一張考卷給我看。……好，下週開始。')&&J(H.opts[0])===J(['週一','週三','週一和週三','先不要'])&&J(JOBS.job(H.G,'cram').day)===J([1])&&JOBS.job(H.G,'cram').since===mon+7,J(H.opts)+J(JOBS.job(H.G,'cram')));
  check('2. 這週的週一不上（下週開始）',!JOBS.scheduled(H.G,'cram',mon)&&JOBS.scheduled(H.G,'cram',mon+7));
  at(mon+7,17); JOBS.plan(H.G); const q2=OUT.get(H.G,'job_cram_'+(mon+7)); check('2. 下週一 18:30 的班：2D 的出遊（沒有帶到 3D）',!!q2&&q2.h===18.5&&q2.ev==='ev_job2d_cram'&&!q2.goto&&q2.title==='補習班的班（18:30～21:30）',J(q2));
  const pay=await shift('cram',mon+7,['「照座位發。」','「每題都寫一句。」','「一個一個講。」','「對，一年。」']);
  check('2. 補習班的班：三段＋小選擇；第一件「助教哥哥」（「對，一年。」→「……那還好嘛。」）；588、toast',said('（四十個學生，你只記得最前面兩排的名字。）')&&said('（發到最後一排，少了一張。）')&&said('（改得很慢，可是有一張背面寫了「謝謝」。）')&&said('（下課鐘響的時候，還有兩個人在排。）')&&saidBy('學生','助教哥哥，你也重考過？')&&saidBy('學生','……那還好嘛。')&&pay===588&&toasts.includes('補習班 薪水 588 元'),J(L())+' '+pay);
  await shift('cram',mon+14); await shift('cram',mon+21,['「照座位發。」','「每題都寫一句。」','「一個一個講。」','「有時候。」']);
  check('2. 第三班：「最後一排的學生」（三個回答都接「喔。」＋成績單）',said('重考那一年，你後悔嗎？')&&said('喔。')&&said('（他把那張模擬考的成績單摺起來，收進書包。）'));
  await shift('cram',mon+28); await shift('cram',mon+35,['「照座位發。」','「每題都寫一句。」','「一個一個講。」','「沒有。」']);
  check('2. 第五班：「考前的便利貼」（「沒有。」→「騙人。」）',said('（考前一週，你的桌上貼滿了學生的問題。最後一張：「助教哥哥，你考上的那天，哭了嗎？」）')&&said('（隔天那張便利貼下面多了一行：「騙人。」）')); });

await sec(3,async()=>{ const d0=TD('Y3S1',1,3); fresh(key(d0),12,'linze'); H.E.interactables=[]; const it=JOBS.addBoard(GM);
  check('3. 大三上第 1 週：補習班、事務所都有',J(JOBS.board2(H.G))===J(['cram','office']));
  H.picks=['律師事務所徵工讀生','「寄履歷。」']; H.opts=[]; await STORY.interact(it,GM);
  check('3. 「律師事務所徵工讀生　週二、週四 13:30～17:30　法律系大三以上」→「寄履歷。」',H.opts[0].includes('律師事務所徵工讀生　週二、週四 13:30～17:30　法律系大三以上')&&J(H.opts[1])===J(['「寄履歷。」','（不用了）']));
  at(d0+7,13.5); check('3. 一週後 14:00 以前還沒有私訊',!msgs('p:office_asst').length); at(d0+7,14.1);
  const M=msgs('p:office_asst'), m=(H.G.msgs||[]).find(x=>x.th==='p:office_asst'&&x.ask);
  check('3. 一週後 14:00 助理「您好，下週二 14:00 方便來面談嗎？」；選項「可以。」「那天有課，週四可以嗎？」',J(M)===J(['您好，下週二 14:00 方便來面談嗎？'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['可以。','那天有課，週四可以嗎？']));
  PHONE.answer(H.G,m.ask.id,1); JOBS.phone(H.G); const thu=d0+7-(CALENDAR.dateOf(d0+7).wd-1)+7+3, q=OUT.get(H.G,'job_iv_office_'+thu);
  check('3. 「那天有課，週四可以嗎？」＝下週四 14:00 面談（2D）',!!q&&q.h===14&&q.ev==='ev_job2d_office_iv'&&q.title==='事務所面談',J(OUT.rec(H.G).filter(x=>/iv/.test(x.id))));
  q.state='missed'; JOBS.phone(H.G); check('3. 面談沒去：公布欄又看得到事務所',JOBS.board2(H.G).includes('office'));
  H.picks=['律師事務所徵工讀生','「寄履歷。」']; await STORY.interact(it,GM); at(H.G.day+7,14.1); msgs(); const m2=(H.G.msgs||[]).filter(x=>x.th==='p:office_asst'&&x.ask).pop();
  PHONE.answer(H.G,m2.ask.id,0); JOBS.phone(H.G); const dm=H.G.day, tue=dm-(CALENDAR.dateOf(dm).wd-1)+7+1; check('3. 「可以。」＝下週二 14:00',!!OUT.get(H.G,'job_iv_office_'+tue));
  const cl=JOBS.classOn; JOBS.classOn=()=>true;
  try{ at(tue,14); H.said=[]; H.opts=[]; H.picks=['想學怎麼跟當事人講話','週二和週四']; await EVENTS.run(ev('ev_job2d_office_iv'));
    check('3. 面談：律師「你為什麼想來？」三選一 →「好。下週開始。」',saidBy('律師','你為什麼想來？')&&J(H.opts[0])===J(['「想看書上寫的事，真的發生是什麼樣子。」','「想學怎麼跟當事人講話。」','「想賺生活費。」'])&&saidBy('律師','好。下週開始。')&&H.G.flags.JOB_OFFICE_WHY===2,J(L()));
    check('3. 撞到課照樣可以選（兩天都列）',J(H.opts[1])===J(['週二','週四','週二和週四','先不要'])&&J(JOBS.job(H.G,'office').day)===J([2,4]),J(H.opts));
    const d=TD('Y3S1',1,3); fresh(key(d),12,'dorm'); toasts.length=0; const r=await JOBS.pickDays(GM,'cram'); check('3. 補習班（不能撞課）：那個時段都有課＝不能選',r===null&&toasts.includes('那個時段都有課'),J(toasts)); } finally { JOBS.classOn=cl; }
  const t2=TD('Y3S1',4,2); fresh(key(t2),13,'dorm'); hire('office',[2,4]); const pay=await shift('office',t2,['「先印再一起訂。」','「照日期排。」','「先倒水。」']);
  check('3. 事務所的班：三段＋小選擇；第一件「釘書機」；784、toast「事務所 薪水 784 元」',said('（一份書狀要印五份。你裝訂反了一份。）')&&said('（訂到最後，頁數對了。）')&&said('（排到一半，發現有一份日期寫錯。你用便利貼標起來。）')&&said('（當事人雙手接過去。）')&&said('（一台很重的釘書機，一次可以釘一百頁。）')&&saidBy('律師','這台比我早來。小心手。')&&pay===784&&toasts.includes('事務所 薪水 784 元'),J(L())+' '+pay);
  check('3. 撞到課也不會自動請假（事務所）',JOBS.excused(H.G,'office',t2)===null||JOBS.excused(H.G,'office',t2)==='typhoon');
  await shift('office',t2+2); await shift('office',t2+7); check('3. 第三班：「當事人的便當」',said('（當事人帶了一個便當來。律師說事務所不收。）')&&saidBy('當事人','這個是給那個工讀生的。')&&said('他上次幫我倒水。'));
  await shift('office',t2+9); await shift('office',t2+14); check('3. 第五班：「先問什麼」（祐廷問）',saidBy('祐廷','見到當事人，第一句先說什麼？')&&said('先問他今天怎麼來的。走路、搭車，還是有人陪。')&&said('有人陪的話，你就知道今天要講多久。')); });

STORY.sleepNow=sl0;
H.done();
})();

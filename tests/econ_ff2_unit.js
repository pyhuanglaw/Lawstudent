// 經濟系事件接事件第二階段：10/19 退宿、休學在家到 8/29（D102 ③；AA_292 第 5～8 節；src/econff3d.js S.on2／homeStep／run2）——不需要瀏覽器。
// 使用者 2026-10-18：「休學之後我還住在宿舍？之後沒有劇情」「我根本不會看手機」「休學的人不會回台大」。
// 檢查：① 第一階段多一步 10/19 09:00 ev_y0_a3（退宿）、退宿以後第一階段關、第二階段開，8/29 05:00 關
//       ② 在家那一輪：該出發的出遊自動出發（goOut）；沒事就跳到下一個「要到外面演」的時間（y0Jump 的終點＝下一步 or 8/29 05:00）
//       ③ 時間到了：帶到現場（enter 區域＋位置）、演事件、回家（HOME.go）；做過的記 done；過了 6 小時的算錯過
//       ④ 跳的途中收到要回的訊息（'msg'）＝打開手機 ⑤ 玩樂日（R3）＝排可昕的出遊、自動出發 ⑥ 在外面空下來 3 秒＝自動回家（今天還有出遊就不回）
// 用法：node tests/econ_ff2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|COURSES|CLS|CHARACTERS|ECONFF|RETAKE_HOME)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/courses.js','src/classes3d.js','src/data/retake_home.js','src/econff3d.js']) load(f);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const dayOf=k=>{ for(let d=-600; d<400; d++){ const t=CALENDAR.dateOf(d); if(t&&t.key===k) return d; } return null; };
const T=(k,h)=>dayOf(k)*24+h;
const ran=[]; global.STORY={dayOfKey:dayOf,rtPlanPlay(G){ PLAN.push(G.day); OUTS.push({id:'rt_play_'+G.day,state:'planned',day:G.day,h:10}); }};
global.STORY_EVENTS=['ev_y0_a3','ev_y0_soc_door','ev_y0_e12','ev_y0_r4','ev_y0_e34'].map(id=>({id,trigger:'auto'}));
global.EVENTS={running:null,check:()=>true,cond:()=>true,run:async e=>{ ran.push(e.id); G.events.done[e.id]=1; }};
let PLAN=[], OUTS=[]; global.OUT={get:(G,id)=>OUTS.find(q=>q.id===id)||null,rec:()=>OUTS,go:async()=>true};
global.PHONE={pending:()=>[],tick(){}}; global.ADV={end(){},begin(){}};
let G; const calls=[]; let jumpRes='end', dueQ=null;
global.HOME={rec:G=>G.home, at:G=>!!G.home.at, dueOuting:()=>dueQ, dueInvites:()=>[], y0FfEnd:()=>T('2025-08-29',5), leaveTo:async()=>{},
  y0Jump:async(GM,t)=>{ calls.push(['jump',t]); return jumpRes; }, goOut:async(GM,q)=>{ calls.push(['goOut',q.id]); q.state='done'; return true; }, go:async GM=>{ calls.push(['go']); G.home.at=true; return true; }, bgNow:()=>'blur'};
const mkG=(k,h,f)=>({stage:'econ',day:dayOf(k),hour:h,weekday:CALENDAR.dateOf(dayOf(k)).wd,flags:Object.assign({E01_MORNING:true,LEAVE_WEEK:6,ECON_FULL:true},f||{}),events:{done:{}},home:{at:true,base:true}});
const GM={get G(){ return G; },fade:async()=>{},titleCard:async()=>{},enter:async(z,sp)=>{ calls.push(['enter',z,sp]); G.zone=z; G.home.at=false; },autosave(){},phoneThread:async()=>{ calls.push(['phone']); },E:{player:{}}};
(async()=>{
  // ①
  const a3=ECONFF.STEPS.find(s=>s.ev==='ev_y0_a3'); check('① 第一階段多一步：10/19 09:00 宿舍 ev_y0_a3（退宿）',!!a3&&a3.key==='2024-10-19'&&a3.h===9&&a3.zone==='dorm');
  G=mkG('2024-10-18',1,{Y0_STICKY:true}); G.flags.ECONFF={done:{}}; for(const s of ECONFF.STEPS) if(s.n<30) G.flags.ECONFF.done[s.n]=1;
  check('① 10/18 凌晨（便利貼演過、還沒退宿）：第一階段還開、下一步是退宿',ECONFF.on(G)&&ECONFF.next(G)&&ECONFF.next(G).ev==='ev_y0_a3');
  G.flags.Y0_MOVED_OUT=true; G.day=dayOf('2024-10-19'); G.hour=18; check('① 退宿以後：第一階段關、第二階段開',!ECONFF.on(G)&&ECONFF.on2(G));
  const L=mkG('2025-08-29',5.1,{Y0_MOVED_OUT:true}); check('① 8/29 05:00 以後（轉法律系那天）：第二階段關',!ECONFF.on2(L));
  check('① 法律系：第二階段不開',!ECONFF.on2(Object.assign(mkG('2025-01-01',10,{Y0_MOVED_OUT:true}),{stage:'law'})));
  // ② 沒事：跳到 10/23 12:00（社科院門口）
  G=mkG('2024-10-20',9,{Y0_MOVED_OUT:true}); calls.length=0; let r=await ECONFF.homeStep(GM);
  check('② 在家、沒事：跳到下一個要到外面演的時間（10/23 12:00）',calls[0]&&calls[0][0]==='jump'&&Math.abs(calls[0][1]-T('2024-10-23',12))<1e-6&&r===true,JSON.stringify(calls));
  dueQ={id:'y0_e14',state:'planned'}; calls.length=0; r=await ECONFF.homeStep(GM); check('② 該出發的出遊：自動出發（不出選單）',calls[0]&&calls[0][0]==='goOut'&&calls[0][1]==='y0_e14',JSON.stringify(calls)); dueQ=null;
  // ④
  jumpRes='msg'; calls.length=0; await ECONFF.homeStep(GM); check('④ 跳的途中收到要回的訊息：打開手機',calls.some(c=>c[0]==='phone'),JSON.stringify(calls)); jumpRes='end';
  // ③ 到了 10/23 12:00
  G.day=dayOf('2024-10-23'); G.hour=12; calls.length=0; ran.length=0; r=await ECONFF.homeStep(GM);
  const en=calls.find(c=>c[0]==='enter'); check('③ 時間到了：帶到校園社科院門口、演 ev_y0_soc_door、演完回家',!!en&&en[1]==='campus'&&Math.abs(en[2].x-97.9)<1&&ran[0]==='ev_y0_soc_door'&&calls.some(c=>c[0]==='go')&&r===false,JSON.stringify(calls)+' '+ran);
  check('③ 做過的記 done（下一步換成 11/6 E12）',ECONFF.next2(G)&&ECONFF.next2(G).ev==='ev_y0_e12');
  // E12：出遊由這裡帶，不再停一次
  OUTS.push({id:'y0_e12',state:'planned',day:dayOf('2024-11-06')}); G.day=dayOf('2024-11-06'); G.hour=20; G.home.at=true; ran.length=0; await ECONFF.homeStep(GM);
  check('③ E12 醉月湖：帶到湖邊演、原本的出遊（goto）標成做過',ran[0]==='ev_y0_e12'&&OUT.get(G,'y0_e12').state==='done');
  // 過了 6 小時＝錯過
  const G2=mkG('2025-05-05',23,{Y0_MOVED_OUT:true}); G2.flags.ECONFF={done:{h2:1,h3:1,h29:1}}; const nx=ECONFF.next2(G2); check('③ 過了 6 小時的算錯過、跳到下一個（5/5 R6 14:00，23:00 還沒去）',nx&&nx.play!=='ev_y0_r6'&&G2.flags.ECONFF.done.h34==='missed',nx&&(nx.ev||nx.play||nx.rh));
  check('③ AA_298：R4 模擬考、E34 經原最後一堂拿掉（第二階段沒有這兩步）',!ECONFF.STEPS2.some(s=>s.ev==='ev_y0_r4'||s.ev==='ev_y0_e34'||s.atR4));
  // ⑤ 玩樂日
  G=mkG('2025-04-01',15,{Y0_MOVED_OUT:true}); G.flags.ECONFF={done:{h2:1,h3:1}}; calls.length=0; PLAN=[]; await ECONFF.homeStep(GM);
  check('⑤ 玩樂日 4/1（R3）：排可昕的出遊、自動出發',PLAN.length===1&&calls.some(c=>c[0]==='goOut'&&c[1]==='rt_play_'+G.day),JSON.stringify(calls));
  check('⑤ 玩樂日清單（AA_292 第 6 節）：4/1、5/5、5/24',JSON.stringify(ECONFF.PLAY_DAYS)===JSON.stringify(['2025-04-01','2025-05-05','2025-05-24']));
  // ⑥ 在外面空下來＝回家
  G=mkG('2024-11-06',21,{Y0_MOVED_OUT:true}); G.home.at=false; OUTS=[]; calls.length=0; const GM6=Object.assign(Object.create(GM),{E:{paused:false,player:{busy:false,path:null}},D:{active:false}}); global.Date_now=Date.now; let t0=1e12; const DN=Date.now; Date.now=()=>t0;
  ECONFF.tick2(GM6); t0+=1000; ECONFF.tick2(GM6); check('⑥ 空下來不到 3 秒：還不回',!calls.some(c=>c[0]==='go'));
  t0+=2500; ECONFF.tick2(GM6); await new Promise(r=>setTimeout(r,0)); check('⑥ 空下來 3 秒：自動回家',calls.some(c=>c[0]==='go'),JSON.stringify(calls));
  G.home.at=false; OUTS=[{id:'x',state:'planned',day:G.day,h:G.hour+1}]; calls.length=0; ECONFF.busy=false; ECONFF.tick2(GM6); t0+=4000; ECONFF.tick2(GM6); check('⑥ 今天還有還沒到時間的出遊：不自動回家',!calls.some(c=>c[0]==='go'));
  G.home.at=false; OUTS=[{id:'y',state:'planned',day:G.day,h:G.hour-3}]; calls.length=0; ECONFF.busy=false; ECONFF.tick2(GM6); t0+=4000; ECONFF.tick2(GM6); await new Promise(r=>setTimeout(r,0)); check('⑥ 今天的出遊時間早就過了（沒演到）：照樣回家（瀏覽器 8/7 留在博雅）',calls.some(c=>c[0]==='go'));
  Date.now=DN;
  // ⑦ 重考期在家的日常（AA_297）：每天一段 short、不重複、長場景照日期；跳的終點是隔天那一段的時間
  { G=mkG('2025-02-16',9,{Y0_MOVED_OUT:true}); G.flags.ECONFF={done:{h2:1,h3:1}}; ran.length=0; calls.length=0; await ECONFF.homeStep(GM);
    check('⑦ 重考期在家、今天還沒演：先演一段可昕的日常（rh_…）',ran.length===1&&/^rh_RH-/.test(ran[0])&&ECONFF.rec(G).rhDay===G.day,ran.join(','));
    calls.length=0; await ECONFF.homeStep(GM); const j=calls.find(c=>c[0]==='jump'); check('⑦ 今天演過了：跳到三天後那一段的時間（使用者「重考不用每天停」；不會一口氣跳過好幾段）',!!j&&j[1]>(G.day+2)*24+22&&j[1]<=(G.day+3)*24+22,JSON.stringify(calls));
    const seen=new Set(); for(let i=0;i<30;i++){ G.day=dayOf('2025-03-01')+i*3; G.hour=10; ran.length=0; await ECONFF.homeStep(GM); if(ran[0]) seen.add(ran[0]); }
    check('⑦ 每三天一段、連續 30 段：沒有重複到用完以前',seen.size>=20,seen.size+' 段');
    check('⑦ 資料：short 30、long 18（AA_298：RH-C0～C5）、她睡姊姊的房間（AA_297）、日常到 6/8',RETAKE_HOME.short.length===30&&RETAKE_HOME.long.length===18&&/姊姊/.test(RETAKE_HOME.room)&&RETAKE_HOME.range[1]==='2025-06-08');
    { const gc=mkG('2025-06-10',9,{Y0_MOVED_OUT:true}); gc.flags.ECONFF={done:{}}; const c1=ECONFF.cramCard(gc), c2=ECONFF.cramCard(gc); gc.day=dayOf('2025-06-12');
      check('⑧ 衝刺班（AA_298 第 1 節）：6/9～7/9 每天；跳過的日子卡下面那一行照 cram_cards、每張一次；6/12（RH-C2 那天）沒有卡',ECONFF.cramDay(Object.assign({},gc,{day:dayOf('2025-06-09')}))&&ECONFF.cramDay(Object.assign({},gc,{day:dayOf('2025-07-09')}))&&!ECONFF.cramDay(Object.assign({},gc,{day:dayOf('2025-07-10')}))&&c1&&c1.t==='衝刺班。早上九點到晚上九點。'&&c2===null&&ECONFF.cramCard(gc)===null); }
    { const gs=mkG('2025-06-09',8,{Y0_MOVED_OUT:true}); gs.flags.ECONFF={done:{}}; const L=ECONFF.rhLong(gs).filter(s=>{ const d=dayOf(s.key); return d>=dayOf('2025-06-09')&&d<=dayOf('2025-07-10'); }).sort((a,b)=>dayOf(a.key)*24+a.h-dayOf(b.key)*24-b.h).map(s=>s.rh);
      check('⑧ 6/9～7/10 只停有戲的日子：C1、C2、O5、C3、C4、L6、C5、O6（7/10 14:00）',JSON.stringify(L)===JSON.stringify(['RH-C1','RH-C2','RH-O5','RH-C3','RH-C4','RH-L6','RH-C5','RH-O6']),JSON.stringify(L)); }
    { let dl=null; const E0=global.EVENTS.run; global.EVENTS.run=async e=>{ dl=e.dialogue; }; const L4=RETAKE_HOME.long.find(e=>e.id==='RH-L4'), C2=RETAKE_HOME.long.find(e=>e.id==='RH-C2');
      G=mkG('2025-05-10',17,{Y0_MOVED_OUT:true}); G.flags.ECONFF={done:{}}; await ECONFF.rhPlay(GM,L4); const endI=dl.findIndex(l=>l.label==='end'), aft=dl.findIndex(l=>l.text&&/花插在餐桌中間的玻璃杯裡/.test(l.text));
      const okL4=endI>0&&aft>endI; await ECONFF.rhPlay(GM,C2); const sc=dl[0], mg=dl.find(l=>l.speaker==='管理人員');
      check('⑧ after（選項之後每個分支都演）：RH-L4「花插在玻璃杯裡」在選項匯合以後；補習班那幾段換 cram_class 背景、管理人員說話',okL4&&sc&&sc.bg==='cram_class'&&!!mg&&mg.text==='好。這裡簽名。',JSON.stringify(sc)); global.EVENTS.run=E0; }
    G=mkG('2025-02-22',20,{Y0_MOVED_OUT:true}); G.flags.ECONFF={done:{h2:1,h3:1}}; ran.length=0; await ECONFF.homeStep(GM); check('⑦ 長場景 2/22 20:00 媽媽和她（RH-L1）照日期演',ran.includes('rh_RH-L1'),ran.join(','));
    G=mkG('2024-12-01',10,{Y0_MOVED_OUT:true}); ran.length=0; calls.length=0; await ECONFF.homeStep(GM); check('⑦ 重考期以外（12/1）：不演日常',!ran.some(x=>/^rh_/.test(x))); }
  const hs=fs.readFileSync(path.join(ROOT,'src/home3d.js'),'utf8'); check('home3d.js baseRound：事件模式交給 ECONFF.homeStep、y0Jump 玩樂日不記讀書日',/ECONFF\.on2\(G\)\)\{ H\.wakeAsk=null; return ECONFF\.homeStep\(GM\)/.test(hs)&&/ECONFF\.PLAY_DAYS/.test(hs));
  { const gs=mkG('2024-10-19',18,{Y0_MOVED_OUT:true,ECON_FULL:false}); gs.flags.ECONFF={done:{},lines:[]}; const ids=[]; for(let k=0;k<20;k++){ const s=ECONFF.next2(gs); if(!s) break; ids.push(s.ev||s.play||s.rh); ECONFF.rec(gs).done[s.n]=1; }
    check('AA_303：休學在家只停逐場確認過的（E12、RH-C0 報名、RH-C4 笑出來、RH-L6 熱牛奶；RH-M0 等 AA；高雄要除夕約了才停）；R3、R7、洗碗、粽子、soc_door、R6、其他長場景都不停',JSON.stringify(ids)===JSON.stringify(['ev_y0_e12','RH-C0','RH-C4','RH-L6']),JSON.stringify(ids));
    { const gk=mkG('2025-01-28',23,{Y0_MOVED_OUT:true,ECON_FULL:false,KH_TRIP:true}); gk.flags.ECONFF={done:{h2:1,h3:1},lines:[]}; const n=ECONFF.next2(gk); check('AA_303 第 15 場：除夕約了（KH_TRIP）＝1/31 08:00 高雄三天兩夜一步、回來是 2/2',!!n&&n.trip==='ev_y0_kh3'&&n.back==='2025-02-02'&&Math.abs(n.t-(dayOf('2025-01-31')*24+8))<1e-6,JSON.stringify(n)); gk.flags.KH_TRIP=false; gk.flags.ECONFF={done:{h2:1,h3:1},lines:[]}; const n2=ECONFF.next2(gk); check('AA_303：沒約＝不排高雄、也不記錯過（1/28 還沒過）',!n2||n2.trip!=='ev_y0_kh3'); }
    gs.day=dayOf('2025-03-03'); gs.hour=10; check('AA_300：重考期每天的短場景關掉（rhOn false）',!ECONFF.rhOn(gs));
    gs.day=dayOf('2025-07-13'); check('AA_300：沒演到的對答案＝MATH_100 預設 true',(ECONFF.defaults(gs),gs.flags.MATH_100===true));
    { const g2=mkG('2024-12-20',10,{Y0_MOVED_OUT:true,ECON_FULL:false}); ECONFF.defaults(g2); const g3=mkG('2024-12-10',10,{Y0_MOVED_OUT:true,ECON_FULL:false}); ECONFF.defaults(g3); check('AA_300：12/13 過了就記 CRAM_FREE_KNOWN（2/13 才會約 2/14 一起去問補習班）；12/13 以前不記',g2.flags.CRAM_FREE_KNOWN===true&&!g3.flags.CRAM_FREE_KNOWN); } }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

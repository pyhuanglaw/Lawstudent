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
const ran=[]; global.STORY={dayOfKey:dayOf,R4_AT:{x:78.6,z:0},rtPlanPlay(G){ PLAN.push(G.day); OUTS.push({id:'rt_play_'+G.day,state:'planned',day:G.day,h:10}); }};
global.STORY_EVENTS=['ev_y0_a3','ev_y0_soc_door','ev_y0_e12','ev_y0_r4','ev_y0_e34'].map(id=>({id,trigger:'auto'}));
global.EVENTS={running:null,check:()=>true,cond:()=>true,run:async e=>{ ran.push(e.id); G.events.done[e.id]=1; }};
let PLAN=[], OUTS=[]; global.OUT={get:(G,id)=>OUTS.find(q=>q.id===id)||null,rec:()=>OUTS,go:async()=>true};
global.PHONE={pending:()=>[],tick(){}}; global.ADV={end(){},begin(){}};
let G; const calls=[]; let jumpRes='end', dueQ=null;
global.HOME={rec:G=>G.home, at:G=>!!G.home.at, dueOuting:()=>dueQ, dueInvites:()=>[], y0FfEnd:()=>T('2025-08-29',5), leaveTo:async()=>{},
  y0Jump:async(GM,t)=>{ calls.push(['jump',t]); return jumpRes; }, goOut:async(GM,q)=>{ calls.push(['goOut',q.id]); q.state='done'; return true; }, go:async GM=>{ calls.push(['go']); G.home.at=true; return true; }, bgNow:()=>'blur'};
const mkG=(k,h,f)=>({stage:'econ',day:dayOf(k),hour:h,weekday:CALENDAR.dateOf(dayOf(k)).wd,flags:Object.assign({E01_MORNING:true,LEAVE_WEEK:6},f||{}),events:{done:{}},home:{at:true,base:true}});
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
  const G2=mkG('2025-04-19',23,{Y0_MOVED_OUT:true}); G2.flags.ECONFF={done:{h2:1,h3:1,h29:1}}; const nx=ECONFF.next2(G2); check('③ 過了 6 小時的算錯過、跳到下一個',nx&&nx.ev!=='ev_y0_r4'&&G2.flags.ECONFF.done.h32==='missed',nx&&(nx.ev||nx.play));
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
    check('⑦ 資料：short 30、long 12、她睡姊姊的房間（AA_297）',RETAKE_HOME.short.length===30&&RETAKE_HOME.long.length===12&&/姊姊/.test(RETAKE_HOME.room));
    G=mkG('2025-02-22',20,{Y0_MOVED_OUT:true}); G.flags.ECONFF={done:{h2:1,h3:1}}; ran.length=0; await ECONFF.homeStep(GM); check('⑦ 長場景 2/22 20:00 媽媽和她（RH-L1）照日期演',ran.includes('rh_RH-L1'),ran.join(','));
    G=mkG('2024-12-01',10,{Y0_MOVED_OUT:true}); ran.length=0; calls.length=0; await ECONFF.homeStep(GM); check('⑦ 重考期以外（12/1）：不演日常',!ran.some(x=>/^rh_/.test(x))); }
  const hs=fs.readFileSync(path.join(ROOT,'src/home3d.js'),'utf8'); check('home3d.js baseRound：事件模式交給 ECONFF.homeStep、y0Jump 玩樂日不記讀書日',/ECONFF\.on2\(G\)\)\{ H\.wakeAsk=null; return ECONFF\.homeStep\(GM\)/.test(hs)&&/ECONFF\.PLAY_DAYS/.test(hs));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

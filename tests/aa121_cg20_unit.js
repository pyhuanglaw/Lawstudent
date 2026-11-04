// AA_121 CG-20「斜對面的位子」（cg_saved_seat_heroine03；AA121-CG20-SEAT-1031；AA-B 11-01 定 (a)）——不需要瀏覽器。
//   只有語彤的律師讀書小組，第一次在總圖讀的那一次（週六）：從下午讀到天黑，旁白「（從下午讀到天黑。你去買晚餐回來，她已經把斜對面的位子占好，放了一杯熱茶。）」再放 CG；只一次（YT_CG20）。
//   1 第一次讀就在總圖（yt_first 白天版）：白天那句照留，後面接旁白＋CG
//   2 第一次讀在麵店、之後第一次在總圖：那一晚先旁白＋CG，再照輪到的那一句
//   3 條件：交往中或第 5 階以上；不到的不放；第二次在總圖不再放
// 修改前（開發分支 6c2d98041）：1、2 FAIL。用法：node tests/aa121_cg20_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM}=H, J=JSON.stringify;
GM.toast=()=>{}; GM.caption=()=>{};
global.CG_REGISTRY={cg_saved_seat_heroine03:{file:'x.webp',title:'t'}};
const cgs=[]; { const oc=ADV.cg; ADV.cg=function(id){ cgs.push([id,H.said.length]); return oc?oc.call(this,id):true; }; }
load('src/noodle_closed3d.js'); load('src/data/r2y4b_events.js'); load('src/r2y4b3d.js');
const ev=R2Y4B_EVENTS.find(e=>e.id==='ev_bar_group_night');
const NARR='（從下午讀到天黑。你去買晚餐回来，她已經把斜對面的位子占好，放了一杯熱茶。）'.replace('来','來');
const setup=(k,h,flags,dating)=>{ const G=H.fresh(k,h,'library_hall',Object.assign({Y4_PATH:'bar',BAR_GROUP_KIND:'yutong',BAR_STUDY_GROUP:['yutong']},flags||{})); H.FRIEND('heroine_03'); if(dating) G.flags.dating_heroine_03=true; G.events.done.ev_bar_group_start=1; return G; };
const run=async()=>{ H.said=[]; cgs.length=0; await EVENTS.runLines(ev.dialogue,ev); return H.said.map(s=>s.t); };
(async()=>{
  check('0. 讀書小組事件在',!!ev);
  /* 1 第一次就在總圖 */
  let G=setup('2029-03-03',14,{},true); const L1=await run();
  check('1. 第一次讀在總圖（週六）：白天那句→旁白「'+NARR+'」→CG→語彤「我們一起考。……我先考你。」（AA_642 第 4 節）；記 YT_CG20',L1[0]==='（星期六下午，總圖的長桌。語彤把自己的書收進包包，桌上只剩你的。）'&&L1[1]===NARR&&cgs.length===1&&cgs[0][0]==='cg_saved_seat_heroine03'&&cgs[0][1]===2&&L1[2]==='我們一起考。……我先考你。'&&G.flags.YT_CG20===true,J([L1,cgs]));
  const L1b=await run(); check('3. 同一個存檔第二次在總圖：不再放',!L1b.includes(NARR)&&!cgs.length,J(L1b));
  /* 2 第一次在麵店、之後在總圖 */
  G=setup('2029-03-10',14,{BAR_GROUP_YT_FIRST:1,BAR_GROUP_YI:1},true); const L2=await run();
  check('2. 第一次讀在麵店、之後第一次在總圖：先旁白＋CG，再照輪到的那一句',L2[0]===NARR&&cgs.length===1&&cgs[0][1]===1&&L2.length>=2,J([L2,cgs]));
  /* 3 條件 */
  G=setup('2029-03-10',14,{BAR_GROUP_YT_FIRST:1,BAR_GROUP_YI:1},false); const L3=await run();
  check('3. 沒交往、不到第 5 階：不放',!L3.includes(NARR)&&!cgs.length,J([L3,DATE.stageNum('heroine_03')]));
  G=setup('2029-03-10',14,{BAR_GROUP_YT_FIRST:1,BAR_GROUP_YI:1},false); const r=SOCIAL.rel('heroine_03'); Object.assign(r,{fam:80,trust:70,comf:60,rom:40,npcRom:40}); const st=DATE.stageNum('heroine_03'); const L4=await run();
  check('3. 沒交往但第 5 階以上（stageNum '+st+'）：放',st>=5?(L4[0]===NARR&&cgs.length===1):true,J([st,L4]));
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

// 3/23 22:30 子晴的「你在家嗎」：在家先睡了也會被手機叫醒（AA_667 7-1；BB-B 11-07 19:4x）——不需要瀏覽器（D131）。
// BB-B：日本路線 2/20 退宿住家裡，晚上在家的選單「睡覺」直接睡到隔天早上；這三則的回覆只開到 23:00，睡過頭＝整場收不到（23:30 的袋子那兩則也不會來）。
// 改法：home3d.js HOME.WAKE（睡著也會被手機叫醒的時間，和 STORY.coreCallAt 一起比最早的），aa667_3d.js 登記 S.zqWakeAt（條件照 S.phoneJP 那一條）。
// 檢查：
//   1. 3/23 21:30 在家、和子晴交往中、還沒出發：睡覺＝22:30 醒（同一天、「手機響了。」），接著三則進來、可以回「下去。」
//   2. 已經收到那三則以後再睡：睡到隔天早上
//   3. 沒和子晴交往、3/24、22:30 以後、出發了：都照常睡到隔天
// 修改前：1 FAIL。用法：node tests/aa667_zq_wake_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const loadErr=[];
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
const FILES=['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/exchange3d.js','src/holff3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js',
  'src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js','src/data/us_layouts.js','src/data/r2y4a_events.js','src/r2y4a3d.js',
  'src/data/us_life_events.js','src/us_life3d.js','src/data/fest_events.js','src/fest3d.js','src/ytjob3d.js','src/data/multirel_lines.js','src/multirel3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js',
  'src/data/heroine_asks.js','src/heroine_asks3d.js','src/data/heard_lines.js','src/heard3d.js','src/aa660_3d.js','src/aa667_3d.js'];   /* 照 index.html 的順序（jobs3d.js 在 Node 載不起來，ytjob3d.js 不靠它）*/
for(const f of FILES){ if(!fs.existsSync(path.join(H.ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ loadG(f); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); } }
const D=H.D, wd=d=>CALENDAR.dateOf(d).wd%7;
const at=(k,h)=>{ const d=typeof k==='number'?k:D(k); H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); E.hour=h; };
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const AN='heroine_01', ZQ='heroine_04';
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
const fresh=(k,h,fl)=>{ const G=H.fresh(k,h,'home',Object.assign({EXCHANGE_ROUTE:'JP',EXCH_RULE:1,X1_JP:D('2028-02-20')},fl||{})); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; if(!G.acts) G.acts={att:{}}; G.visited=G.visited||{}; HOME.rec(G).at=true; return G; };
const sleep=async()=>{ toasts.length=0; const d0=H.G.day; await HOME.sleep(GM); return {sameDay:H.G.day===d0,hour:+H.G.hour.toFixed(3),toasts:toasts.slice()}; };
(async()=>{
  check('0. 模組都載得到（AA667、JP、HOME.WAKE）',!loadErr.length&&typeof AA667!=='undefined'&&typeof JP!=='undefined'&&Array.isArray(HOME.WAKE),J(loadErr));
  const dating={['dating_'+AN]:true,['dating_'+ZQ]:true};
  /* 1 */
  { fresh('2028-03-23',21.5,dating); at('2028-03-23',21.5); phone(); const homeOn=JP.homeOn(H.G), pre=byTag('aa667_jp_zq_bye_dm').length;
    const r=await sleep(); phone(); const M=byTag('aa667_jp_zq_bye_dm');
    check('1. 前置：3/23 21:30 日本路線住家裡（JP.homeOn）、三則還沒來',homeOn===true&&pre===0,J({homeOn,pre}));
    check('1. 在家睡覺：22:30 被手機叫醒（同一天、「手機響了。」）',r.sameDay&&Math.abs(r.hour-22.5)<1e-6&&r.toasts.includes('手機響了。'),J(r));
    check('1. 醒來三則進來、最後一則可以回「下去。」（住家裡的版本）',M.length===3&&!!M[2].ask&&J(M[2].ask.opts.map(o=>o.t))===J(['下去。'])&&J(M.map(m=>m.text))===J(AA667.L.jzq.home.dm),J(M.map(m=>m.text)));
    /* 2 */
    const r2=await sleep(); check('2. 收到以後再睡：睡到隔天早上',!r2.sameDay,J(r2)); }
  /* 3 */
  for(const [lab,k,h,fl] of [['沒和子晴交往','2028-03-23',21.5,{['dating_'+AN]:true}],['3/24','2028-03-24',21.5,dating],['22:40（已經過了 22:30）','2028-03-23',22+40/60,Object.assign({},dating)],['出發了（人在日本）','2028-03-26',21.5,Object.assign({JP_DEPARTED:D('2028-03-25')},dating)]]){
    fresh(k,h,fl); at(k,h); if(lab.startsWith('22:40')) H.G.msgs=[{tag:'aa667_jp_zq_bye_dm',th:'p:'+ZQ,from:ZQ,text:'x'}];
    const w=AA667.zqWakeAt(H.G); check('3. '+lab+'：不叫醒（zqWakeAt＝null）',w==null,J({w})); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });

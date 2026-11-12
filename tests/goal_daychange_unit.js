// 換日就重排課表的目標和下一堂（BUG-Y0-GOAL-AFTER-SKIP-1107；BB-B 11-07 BB_255）——不需要瀏覽器（D131）。
// 起因：經濟系事件接事件跳到 9/12 21:00，目標列還寫 9/2 的「今天的課：09:10 經濟學原理（上）」；9/2 開學那天右上「放假中」（9/1 晚上算的）。
// CLS.tick 前面有劇情 return，跳日以後輪不到重排。改法：game3d.js 的 updateHUD 換日（goalDay≠G.day）就 CLS.refreshGoal＋CLS.updateHUD。
// 檢查：1 課表自己設的目標，跳到 9/12 21:00 以後換成 9/12 的；2 下一堂那一列 9/1 晚上「放假中」→ 9/2 早上換掉；3 劇情自己設的目標不動；4 同一天不重排。
// 修改前 1、2 FAIL。用法：node tests/goal_daychange_unit.js
const H=require('./pg_harness.js');
const {check}=H; const fs=require('fs'), path=require('path');
const src=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
const m=src.match(/  function updateHUD\(\)\{[\s\S]*?\n  GM\.updateHUD=updateHUD;/);
if(!m){ check('0. game3d.js 找得到 updateHUD',false); H.done(); }
const els={}; const $=id=>els[id]||(els[id]={id,textContent:'',dataset:{},offsetWidth:0,style:{setProperty(){}},classList:{add(){},remove(){}}});
global.document={getElementById:$,addEventListener(){}};
const GM={get G(){ return H.G; }, titleIdle:false, setGoal(t,dest){ H.G.goal=t; H.G.goalDest=dest===undefined?null:dest; }};
const mk=new Function('GM','CLS','CALENDAR','$','HOME','Z3','getG',
  'let hudDay=null, hudHr=null, goalDay=null, hudRwT=null; const WEEK=["日","一","二","三","四","五","六"]; const fmtTime=h=>String(h); const syncWeekday=()=>{};'+
  'let G; '+m[0].replace(/\n  GM\.updateHUD=updateHUD;$/,'')+'; return ()=>{ G=getG(); updateHUD(); };');
const hud=()=>mk(GM,CLS,CALENDAR,$,undefined,{ZONES:{}},()=>H.G);
(async()=>{
  // CANON-NO-ECON-1112：經濟系那一年拿掉（原本用經濟系大一上開學（2024-09-01～09-12、stage econ）當場景；測的是換日重排目標，跟哪一年無關，日期改成法律系大一下開學（2026-02-22～03-05））
  { const G=H.fresh('2026-02-23',8,'dorm'); const up=hud(); up(); CLS.setGoal(GM); const g0=G.goal;
    G.day=H.D('2026-03-05'); G.hour=21; up(); const want=CLS.goalFor(G).text;
    check('1. 課表的目標：2/23 早上設的，跳到 3/5 21:00 以後換成 3/5 的',g0!==want&&G.goal===want&&CLS.isClsGoal(G),JSON.stringify({g0,now:G.goal,want})); }
  { const G=H.fresh('2026-02-22',22,'dorm'); const up=hud(); up(); const s0=els.nextClass&&els.nextClass.textContent;
    G.day=H.D('2026-02-23'); G.hour=8; up(); const s1=els.nextClass&&els.nextClass.textContent;
    check('2. 下一堂那一列：2/22 晚上「放假中」，跳到 2/23 早上換掉',s0==='放假中'&&s1!=='放假中'&&!!s1,JSON.stringify({s0,s1})); }
  { const G=H.fresh('2026-02-23',8,'dorm'); const up=hud(); up(); GM.setGoal('去宿營集合',null);
    G.day=H.D('2026-03-05'); G.hour=21; up();
    check('3. 劇情自己設的目標（不是課表的）不動',G.goal==='去宿營集合',G.goal); }
  { const G=H.fresh('2026-02-23',8,'dorm'); const up=hud(); up(); CLS.setGoal(GM); let n=0; const r0=CLS.refreshGoal; CLS.refreshGoal=g=>{ n++; return r0(g); };
    G.hour=13; up(); G.hour=15; up(); CLS.refreshGoal=r0;
    check('4. 同一天只動時間＝不在這裡重排（照舊由 CLS.tick 每 15 分鐘排）',n===0,String(n)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });

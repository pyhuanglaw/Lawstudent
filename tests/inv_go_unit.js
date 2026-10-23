// UX-INV-GO-1023（使用者 2026-10-23 08:2x「現在有提醒有約會快到 應該要新增可以直接到約會地點的功能」）——不需要瀏覽器。
// src/invites3d.js（S.goPrompt／S.goNow／S.canGo）、src/game3d.js（快速前往 o.force、手機「今天約好的」的「前往」）。
//   1 約好的時間前 30 分鐘、人不在那一區＝問一次「直接過去：和X約在Y（HH:MM）」／「自己走過去」；選直接過去＝快速前往到那一區（沒去過也可以）
//   2 選自己走過去＝不移動、同一個約不再問；30 分鐘前以前不問；人已經在那一區不問；過了約好的時間 30 分鐘不能前往
//   3 該出發的出遊（OUT）先問，這裡不搶
//   4 手機「今天約好的」每一筆有「前往」（data-invgo → INV.goNow）
// 修改前（開發分支 b8a8bdab）：沒有 INV.goPrompt（全部 FAIL）。用法：node tests/inv_go_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check,GM}=H;
const J=JSON.stringify, D=k=>STORY.dayOfKey(k);
let went=[]; GM.quickGo=async(pl,o)=>{ went.push({pl,o}); H.G.zone=pl[0]; };   /* [前置] 假的快速前往：記下呼叫、換區域（真的在 game3d.js，下面第 4 項看原始碼）*/
const mkInv=(zone,h,place)=>{ const G=H.G; G.invites=G.invites||[]; const P=INV.place(place)||{}; const iv={id:'iv_t'+G.invites.length,who:'heroine_01',place,zone:P.zone,day:G.day,h,state:'accepted',accepted:true,by:'player',label:'和小安約在'+P.name}; G.invites.push(iv); return iv; };
const setup=(h,zone)=>{ const G=H.fresh('2025-10-08',h,zone||'dorm',{}); H.FRIEND('heroine_01'); went=[]; H.opts=[]; G.outings=[]; return G; };
const tick=async()=>{ INV.tick(GM); await new Promise(r=>setTimeout(r,0)); await new Promise(r=>setTimeout(r,0)); };

(async()=>{
  check('0. 有 INV.goPrompt、INV.goNow、INV.canGo',typeof INV!=='undefined'&&typeof INV.goPrompt==='function'&&typeof INV.goNow==='function'&&typeof INV.canGo==='function');
  /* ---- 1 ---- */
  { setup(14.55); const iv=mkInv('cafe',15,'cafe'); H.picks=[0]; await tick(); const o=H.opts[0]||[];
    check('1. 14:33（約 15:00）在宿舍：問「直接過去：和沈以安約在兩點半 Café（15:00）」／「自己走過去」',o.length===2&&/^直接過去：和.+約在兩點半 Café（15:00）$/.test(o[0])&&o[1]==='自己走過去',J(o));
    check('1. 選直接過去：快速前往到 cafe（照 PLACES.quickList 的落點、force＝沒去過也可以）',went.length===1&&went[0].pl[0]==='cafe'&&went[0].pl[1]==='兩點半 Café'&&!!went[0].pl[2]&&went[0].o&&went[0].o.force===true&&H.G.zone==='cafe',J(went)); }
  /* ---- 2 ---- */
  { setup(14.6); const iv=mkInv('cafe',15,'cafe'); H.picks=[1]; await tick(); const n1=H.opts.length; await tick();
    check('2. 選自己走過去：不移動；同一個約不再問',n1===1&&H.opts.length===1&&!went.length&&iv.goAsked===1,J({n:H.opts.length,went})); }
  { setup(14.3); mkInv('cafe',15,'cafe'); H.picks=[0]; await tick(); check('2. 14:18（30 分鐘以前）：不問',!H.opts.length); }
  { setup(14.6,'cafe'); mkInv('cafe',15,'cafe'); H.picks=[0]; await tick(); check('2. 人已經在兩點半 Café：不問',!H.opts.length); }
  { setup(15.6); const iv=mkInv('cafe',15,'cafe'); check('2. 過了約好的時間 30 分鐘：不能前往（canGo false）',!INV.canGo(H.G,iv)&&INV.canGo(Object.assign({},H.G,{hour:15.2}),iv)); }
  /* ---- 3 ---- */
  { setup(14.6); mkInv('cafe',15,'cafe'); const due=OUT.due; OUT.due=()=>({id:'x'}); H.picks=[0]; await tick(); OUT.due=due;
    check('3. 有該出發的出遊：這裡不問（OUT 先問）',!H.opts.length&&!went.length); }
  /* ---- 4 ---- */
  { const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
    check('4. 手機「今天約好的」：可以前往的那一筆有「前往」（data-invgo），按了走 INV.goNow',/data-invgo=/.test(g)&&/querySelectorAll\('\[data-invgo\]'\)[^\n]*INV\.goNow\(GM,iv\)/.test(g));
    check('4. 快速前往 o.force：沒去過也可以（約好的地方）',/async function quickGo\(pl,o\)/.test(g)&&/!st\.known&&!\(o&&o\.force\)/.test(g)); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

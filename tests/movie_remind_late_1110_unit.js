// MOVIE-REMIND-LATE-1110（BB 11-10 18:15 P3）：約看電影，人已經到南洋戲院大廳會合、要進 1 廳了，
// 「提醒：09:50 和沈以安約在南洋戲院。」才跳出來、蓋在 1 廳開場那一頁上——不需要瀏覽器（D131）。
// 檢查：1. 人在別的地方、時間到前 30 分鐘＝照舊跳一次  2. 人已經在約好的地方（或那裡面）＝不跳  3. 對話正在演＝不跳
// 修改前：2、3 FAIL。用法：node tests/movie_remind_late_1110_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
const J=x=>JSON.stringify(x);
const run=(zone,adv)=>{ const G=H.fresh('2025-10-18',9.6,zone); G.invites=[]; H.FRIEND('heroine_01'); const iv=INV.accept(G,'heroine_01','xs_nanyang',G.day,9.83,{by:'player'});
  const seen=[], t0=GM.toast; GM.toast=(m)=>{ seen.push(m); }; const a0=typeof ADV!=='undefined'?ADV.active:undefined; if(typeof ADV!=='undefined') ADV.active=!!adv;
  try{ INV.tick(GM); } finally { GM.toast=t0; if(typeof ADV!=='undefined') ADV.active=a0; }
  return {iv,rem:seen.filter(m=>/^提醒：/.test(String(m)))}; };
(async()=>{
  { const r=run('gongguan'); check('1. 人在公館、09:36（開演前 30 分鐘內）：跳一次「提醒：09:50 和……約在南洋戲院。」',r.rem.length===1&&/09:50/.test(r.rem[0])&&/南洋戲院/.test(r.rem[0]),J(r.rem)); }
  { const r=run('xs_nanyang'); check('2. 人已經在南洋戲院（大廳）：不跳',r.rem.length===0&&r.iv.rem===1,J(r.rem)); }
  { const r=run('gongguan',true); check('3. 對話正在演（ADV.active）：不跳',r.rem.length===0,J(r.rem)); }
  H.done&&H.done();
})().catch(e=>{ console.error(e); process.exit(1); });

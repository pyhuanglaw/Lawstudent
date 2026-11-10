// 約好「現在一起過去」：上方目標列寫要去哪（INV-NOW-GOAL-1110，使用者 2026-11-10 X286「約好現在一起過去的地方 要顯示在行程 以免忘記到底約哪」）——不需要瀏覽器（D131）。
// src/invites3d.js（S.goingGoal、S.goingText；INV.tick 每次都跑）。
//   1 選「現在一起過去」（INV.accept now）以後 INV.tick：目標列＝「和沈以安一起去○○」，目的地是那一區
//   2 到了（state done）：目標換回原本的那一句（和目的地）
//   3 作罷（cancelled）：一樣換回原本的
//   4 途中別的劇情改了目標：不再蓋過去；結束時也不還原（不把別人的目標改掉）
//   5 她帶路（accepted＋lead）也算；二樓坐滿改去三樓（alt）＝跟著改成新的地方
//   6 沒有一起走的約（只是約好晚一點）：目標不動
//   7 STORY.tick 一開始就跑 INV.goingGoal（後面劇情的 return 擋不到）
// 修改前 1、2、3、5 FAIL（沒有 S.goingGoal）。用法：node tests/inv_now_goal_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
let goals=[]; GM.setGoal=(t,d)=>{ H.G.goal=t; H.G.goalDest=d===undefined?null:d; goals.push([t,d]); };   /* [前置] 記下目標列（真的在 game3d.js setGoal）*/
const setup=h=>{ const G=H.fresh('2025-10-23',h,'campus'); H.FRIEND('heroine_01'); G.invites=[]; G.goal='去總圖念書'; G.goalDest={zone:'library_hall'}; goals=[]; return G; };
const tick=()=>{ try{ INV.tick(GM); }catch(e){ console.warn(e); } };
(async()=>{
  check('0. 有 INV.goingGoal、INV.goingText',typeof INV.goingGoal==='function'&&typeof INV.goingText==='function');
  if(typeof INV.goingGoal!=='function'){ H.done(); return; }
  { const G=setup(15); const iv=INV.accept(G,'heroine_01','cafe',G.day,15,{now:true}); tick(); const t1=G.goal, d1=G.goalDest;
    check('1. 選「現在一起過去」：目標列＝「和沈以安一起去 2:30 AM」，目的地是那一區',iv.state==='going'&&/^和沈以安一起去.*2:30 AM/.test(t1)&&d1&&d1.zone===iv.zone,J({st:iv.state,t1,d1}));
    tick(); check('1. 再跑一次 tick 不重設（目標列只設一次）',goals.length===1,J(goals.length));
    iv.state='done'; tick(); check('2. 到了（done）：換回原本的「去總圖念書」和目的地',G.goal==='去總圖念書'&&G.goalDest&&G.goalDest.zone==='library_hall'&&!(G.flags||{}).INV_GOAL,J({g:G.goal,d:G.goalDest})); }
  { const G=setup(15); const iv=INV.accept(G,'heroine_01','cafe',G.day,15,{now:true}); tick(); iv.state='cancelled'; tick();
    check('3. 作罷（cancelled）：換回原本的',G.goal==='去總圖念書',G.goal); }
  { const G=setup(15); const iv=INV.accept(G,'heroine_01','cafe',G.day,15,{now:true}); tick(); GM.setGoal('學姊傳訊息：來法圖一下'); tick();
    check('4. 途中別的劇情改了目標：不蓋過去',G.goal==='學姊傳訊息：來法圖一下',G.goal);
    iv.state='done'; tick(); check('4. 結束時目標不是這一句：不還原',G.goal==='學姊傳訊息：來法圖一下',G.goal); }
  { const G=setup(14); const iv=INV.accept(G,'heroine_01','cafe',G.day,15,{}); iv.lead={z:iv.zone}; const z0=globalThis.Z3; globalThis.Z3={ZONES:{library:{name:'總圖閱覽室'}}};   /* [前置] 測試沒有她本人，INV.tick 會把帶路收掉：這一段直接跑 INV.goingGoal；Z3 只給區域名 */
    try{ INV.goingGoal(GM); const t1=G.goal;
      check('5. 她帶路（accepted＋lead）：也寫「和沈以安一起去…」',/^和沈以安一起去 2:30 AM/.test(t1),t1);
      iv.lead=null; iv.state='going'; iv.alt=1; iv.zone='library'; INV.goingGoal(GM);
      check('5. 改去三樓（alt）：目標跟著改成「和沈以安一起去總圖閱覽室」、目的地 library',G.goal==='和沈以安一起去總圖閱覽室'&&G.goalDest&&G.goalDest.zone==='library',J({t1,g:G.goal,d:G.goalDest}));
      iv.state='done'; INV.goingGoal(GM); check('5. 到了：換回原本的',G.goal==='去總圖念書',G.goal);
    } finally { globalThis.Z3=z0; } }
  { const G=setup(13); INV.accept(G,'heroine_01','cafe',G.day,15,{}); tick();
    check('6. 只是約好 15:00（沒有一起走）：目標不動',G.goal==='去總圖念書'&&!goals.length,J({g:G.goal,n:goals.length})); }
  { const st=require('fs').readFileSync(require('path').join(H.ROOT,'src/story3d.js'),'utf8'), i=st.indexOf('S.tick=function(GM,dt){'), j=st.indexOf('INV.goingGoal(GM)',i), b=st.indexOf('if(E.player.busy||GM.D.active',i);
    check('7. STORY.tick 一開始就跑 INV.goingGoal（在各段劇情的 return 之前；瀏覽器 flow_inv_go_jump C 抓到 INV.tick 整輪跑不到）',i>0&&j>i&&b>j,J({i,j,b})); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });

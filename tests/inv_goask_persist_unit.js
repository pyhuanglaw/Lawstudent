// 讀檔以後約好的見面還會提醒「直接過去」（BUG-INV-GOASK-PERSIST-1110，BB-B 11-10：CC PC SOCX_edae_study_h1_iv——invites3d.js S.goPrompt 跳選單前就設 iv.goAsked=1，
// goAsked 存在 G.invites 跟著存檔；提醒跳出來的那一刻自動存檔，讀回來就不再提醒、站著等到錯過）——不需要瀏覽器（D131）。
//   1 同一次遊戲：問過一次（選自己走過去）＝同一筆不再問（UX-INV-GO-1023 照舊）
//   2 問過以後存檔（JSON）：存檔裡沒有 goAsked
//   3 讀回來（JSON.parse）：時間還在提醒範圍內＝再問一次
//   4 舊存檔（goAsked:1 寫在存檔裡）讀回來：當作沒問過，照樣問
// 修改前 2、3、4 FAIL。用法：node tests/inv_goask_persist_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
GM.quickGo=async(pl)=>{ H.G.zone=pl[0]; };
const mkInv=(h,place)=>{ const G=H.G; G.invites=G.invites||[]; const P=INV.place(place)||{}; const iv={id:'iv_t'+G.invites.length,who:'heroine_01',place,zone:P.zone,day:G.day,h,state:'accepted',accepted:true,by:'player',label:'和小安約在'+P.name}; G.invites.push(iv); return iv; };
const setup=h=>{ const G=H.fresh('2025-10-08',h,'dorm',{}); H.FRIEND('heroine_01'); H.opts=[]; G.outings=[]; return G; };
const tick=async()=>{ INV.tick(GM); await new Promise(r=>setTimeout(r,0)); await new Promise(r=>setTimeout(r,0)); };
(async()=>{
  { const G=setup(14.6); const iv=mkInv(15,'cafe'); H.picks=[1,1]; await tick(); const n1=H.opts.length; await tick();
    check('1. 同一次遊戲：問過（選自己走過去）＝同一筆不再問',n1===1&&H.opts.length===1&&iv.goAsked===1,J({n1,n:H.opts.length}));
    const saved=JSON.stringify(G.invites);
    check('2. 存檔（JSON）裡沒有 goAsked',!/goAsked/.test(saved),saved.slice(0,200));
    G.invites=JSON.parse(saved); H.opts=[]; H.picks=[1]; await tick();
    check('3. 讀回來（還在提醒範圍內）：再問一次「直接過去」',H.opts.length===1&&/^直接過去/.test((H.opts[0]||[])[0]||''),J(H.opts)); }
  { const G=setup(14.6); const iv=mkInv(15,'cafe'); iv.goAsked=1; G.invites=JSON.parse(JSON.stringify(G.invites)); H.opts=[]; H.picks=[1]; await tick();
    check('4. 舊存檔（goAsked:1 寫在存檔裡）讀回來：照樣問',H.opts.length===1,J(H.opts)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });

// 改時間也要聽她的回答（BUG-INV-CONFLICT-SKIP-REPLY-1107，BB-B 11-07 GAME_BUG 候選）——不需要瀏覽器（D131）。
// 起因：約的時間撞到你自己已經約好的事 →「你那個時間已經約了別人。改成 ○○？」→ 按「好，就…」就直接約好，她沒有回；
//       連照設計要婉拒的也約成了（語彤有點熟、約 2:30 AM 念書＝「咖啡廳我坐不住。」「總圖可以。」）。
// 檢查：1 撞到自己的約 → 選系統提的時間 → 重新問她：語彤照設計婉拒、沒有約成；2 會答應的人（以安、總圖）：她的答應那句照播、約成；3 她自己提的新時間（她那時有事）照舊直接約好
// 修改前 1、2 FAIL。用法：node tests/inv_conflict_reply_1107_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const fresh=(key,h)=>{ const G=H.fresh(key,h,'dorm'); G.invites=[]; G.contacts=G.contacts||{}; return G; };
const live=(G,id)=>(G.invites||[]).filter(v=>v.who===id&&v.state==='accepted');
(async()=>{
  { const G=fresh('2025-10-15',10); H.FAMILIAR('heroine_03'); G.contacts.heroine_03=1; H.FRIEND('zhe'); G.contacts.zhe=1;
    INV.accept(G,'zhe','noodle',G.day,15.5,{by:'player'});   /* 你今天 15:30 已經和阿哲約了 */
    H.said=[]; H.opts=[]; H.picks=['念書','2:30 AM','今天 15:30','好，就'];
    let err=null; try{ await INV.flow(GM,'heroine_03',null,false); }catch(e){ err=String(e&&e.stack||e); }
    const T=H.said.map(s=>s.t);
    check('1. 撞到自己的約：先說「你那個時間已經約了別人。改成…？」',T.some(t=>/^你那個時間已經約了別人。改成/.test(t)),J(T));
    check('1. 選了系統提的時間：重新問語彤，她照設計婉拒（「咖啡廳我坐不住。」），沒有約成',!err&&T.includes('咖啡廳我坐不住。')&&live(G,'heroine_03').length===0,err||J({T,iv:live(G,'heroine_03')})); }
  { const G=fresh('2025-10-15',10); H.FRIEND('heroine_01'); G.contacts.heroine_01=1; H.FRIEND('zhe'); G.contacts.zhe=1;
    INV.accept(G,'zhe','noodle',G.day,15.5,{by:'player'});
    H.said=[]; H.picks=['念書','總圖','今天 15:30','好，就'];
    let err=null; try{ await INV.flow(GM,'heroine_01',null,false); }catch(e){ err=String(e&&e.stack||e); }
    const T=H.said.map(s=>s.t), iv=live(G,'heroine_01')[0];
    check('2. 會答應的（以安、總圖）：重新問、她回答（不只系統字）、約成在新的時間',!err&&!!iv&&iv.h!==15.5&&T.some(t=>/^約好 /.test(t))&&T.filter(t=>!/^約好 |^你那個時間/.test(t)).length>0,err||J({T,iv})); }
  { const src=require('fs').readFileSync(require('path').join(H.ROOT,'src/invites3d.js'),'utf8');
    check('3. 她自己提的新時間（why 不是 mine）照舊直接約好',/if\(R\.why==='mine'\)\{ const R2=S\.personal/.test(src)&&/const iv=S\.accept\(G,id,Q\.id,A\.day,A\.h,\{by:'player',cat\}\); await GM\.say\(null,'約好 '/.test(src)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });

// 約好的見面也算行動次數（ACTION-BUDGET-1107，USER_WANTS X262）——不需要瀏覽器（D131）。
// 使用者 11-07 試玩：「約好見面也要算行動次數 不然幾乎無限」「可行動次數沒了要直接跳下一個階段」（取代 DEC-SLOTS-1018「約好的見面不算」）
// 檢查：
//   1. 下午約好的見面演完：下午那一格填滿（G.slots.used.pm）；跨進晚上 30 分鐘以上的晚上也算
//   2. 演完下午用完：排跳轉，空下來以後跳到下一個時段（18:00，或下一堂課前 10 分鐘）——演完那一刻不跳（還在 busy，BB-B 11-07）
//   3. 約時間：今天已經排滿的時段灰掉、寫「這個下午已經排滿了」，選了說原因；明天照常
//   4. 約好的照樣能去（時段用過了也照樣演）
//   5. 開場兩天（slotsOn false）不算；今天的時間說明不再寫「約好的見面不算」
//   6. 晚上用完（使用者 11-07 選「直接跳到隔天早上」）：後面沒有約就回去睡（ONETAP 的回去睡覺）；後面還有約就不睡
// 修改前：1、2、3、5 FAIL。用法：node tests/action_budget_1107_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H;
const fs=require('fs'), path=require('path');
const W=ms=>new Promise(r=>setTimeout(r,ms));
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9; return G; };
const npc=id=>{ const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const skips=[]; if(CLS.skipTo){ const s0=CLS.skipTo; CLS.skipTo=async(GM2,t,o)=>{ skips.push({t,why:o&&o.why}); H.G.hour=t; return true; }; }
CLS.canSkip=()=>false;   /* 測試沒有場景：當成可以跳（afterSlot 在 canSkip 為真時不跳）*/
(async()=>{
  /* 1、2 */
  { const G=fresh('2025-10-15',14,'cafe'), id='heroine_02'; H.FRIEND(id); const used0=CLS.slotRec(G).used.pm|0;
    const iv=INV.accept(G,id,'cafe',G.day,14,{by:'player'}); const n=npc(id); skips.length=0;
    await INV.meet(GM,iv,n,{}); await W(5);
    check('1. 下午 14:00 約好的見面演完：下午那一格填滿',used0===0&&(CLS.slotRec(G).used.pm|0)>=CLS.slotCap(G,'pm'),JSON.stringify(CLS.slotRec(G)));
    check('2. 演完那一刻不跳（玩家還在 busy；BB-B 11-07 PARTIAL 的原因）、跳轉排著（CLS._jump 下午）',skips.length===0&&CLS._jump&&CLS._jump.p==='pm'&&CLS._jump.day===G.day,JSON.stringify({skips,j:CLS._jump}));
    const src3=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
    check('2. 空下來以後 story3d.js 的 tick 讀 CLS._jump 跳（不忙、沒有對話、沒有 ADV）',/CLS\._jump&&!S\._jumping&&!\(GM\.E\.player&&GM\.E\.player\.busy\)&&!\(GM\.D&&GM\.D\.active\)/.test(src3));
    await CLS.afterSlot(GM); check('2. 跳：到下一個時段（「下午的時間用完了」）',skips.length===1&&/下午的時間用完了/.test(skips[0].why||'')&&skips[0].t<=18&&skips[0].t>14,JSON.stringify(skips)); }
  { const G=fresh('2025-10-15',17.4,'cafe'), id='heroine_02'; H.FRIEND(id); const iv=INV.accept(G,id,'cafe',G.day,17.4,{by:'player'}); const n=npc(id); skips.length=0;
    await INV.meet(GM,iv,n,{}); await W(5); const R=CLS.slotRec(G);
    check('1. 17:24 開始、演到 18:30 以後：下午和晚上都算',(R.used.pm|0)>=1&&(G.hour<18.5||(R.used.ev|0)>=1),JSON.stringify({R,h:G.hour})); }
  /* 3 約時間 */
  { const G=fresh('2025-10-15',13,'campus'); CLS.slotUse(G,['pm']); const T=INV.timeOptions(G,true,INV.place('cafe'));
    const today=T.filter(q=>q.day===G.day&&q.h<18), eve=T.filter(q=>q.day===G.day&&q.h>=18), tom=T.filter(q=>q.day===G.day+1);
    check('3. 下午用過了：今天下午的時間灰掉、寫「這個下午已經排滿了」',today.length>0&&today.every(q=>q.dim&&q.hint==='這個下午已經排滿了'),JSON.stringify(today));
    check('3. 今天晚上、明天照常',eve.every(q=>!q.dim)&&tom.length>0&&tom.every(q=>!q.dim),JSON.stringify({eve,tom}));
    const src=fs.readFileSync(path.join(H.ROOT,'src/invites3d.js'),'utf8');
    check('3. 選了灰掉的時間：說原因、再選一次（flow）',/if\(T\[k\]\.dim\)\{ await GM\.say\(null,T\[k\]\.hint\+'。'\); continue; \}/.test(src)); }
  /* 4 約好的照樣能去 */
  { const G=fresh('2025-10-15',15,'cafe'), id='heroine_02'; H.FRIEND(id); CLS.slotUse(G,['pm']); const iv=INV.accept(G,id,'cafe',G.day,15,{by:'player'}); const n=npc(id); H.said=[];
    await INV.meet(GM,iv,n,{}); check('4. 下午已經用過：約好的照樣演（iv done）',iv.state==='done'&&H.said.length>0,iv.state); }
  /* 6 晚上用完：直接回去睡（使用者 11-07 選擇題「直接跳到隔天早上」）*/
  { const slept=[]; global.ONETAP={sleepPlan:()=>({ok:true,k:'sleep'}),goSleep:async(GM2,p)=>{ slept.push(p); }};
    const G=fresh('2025-10-15',19,'cafe'), id='heroine_02'; H.FRIEND(id); const iv=INV.accept(G,id,'cafe',G.day,19,{by:'player'}); const n=npc(id); skips.length=0;
    await INV.meet(GM,iv,n,{}); check('6. 晚上 19:00 的見面演完：晚上那一格填滿、排了跳轉（ev）',(CLS.slotRec(G).used.ev|0)>=1&&CLS._jump&&CLS._jump.p==='ev',JSON.stringify({R:CLS.slotRec(G),j:CLS._jump}));
    await CLS.afterSlot(GM); check('6. 空下來：直接回去睡（ONETAP.goSleep），不是跳時間',slept.length===1&&skips.length===0,JSON.stringify({slept,skips}));
    const G2=fresh('2025-10-15',19,'cafe'); H.FRIEND(id); H.FRIEND('heroine_01'); const iv2=INV.accept(G2,id,'cafe',G2.day,19,{by:'player'}); INV.accept(G2,'heroine_01','library',G2.day,21,{by:'player'}); slept.length=0;
    await INV.meet(GM,iv2,npc(id),{}); await CLS.afterSlot(GM);
    check('6. 後面還有約（21:00 以安）：不睡',slept.length===0,JSON.stringify(slept));
    delete global.ONETAP; }
  /* 5 */
  { const G=fresh('2025-09-08',14,'cafe'); const on=CLS.slotsOn(G); const html=CLS.slotHTML(fresh('2025-10-15',14,'cafe'));
    check('5. 今天的時間說明：約好的見面也算一件，不再寫「約好的見面不算」',/約好的見面也算一件/.test(html)&&!/約好的見面不算/.test(html),html.slice(-160));
    if(!on){ const id='heroine_02'; H.FRIEND(id); const iv=INV.accept(G,id,'cafe',G.day,14,{by:'player'}); await INV.meet(GM,iv,npc(id),{}); check('5. 開場那幾天不算',!(G.slots&&G.slots.used&&G.slots.used.pm)); }
    else check('5. （2025-09-08 不是開場日，略過）',true); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });

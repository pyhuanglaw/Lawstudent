// 讀檔以後，上一局排的「時段用完、跳到下一段」不帶進新的一局（BUG-LOAD-INVITE-LEAK-1107）——不需要瀏覽器（D131）。
// CC-B 11-07 19:1x 重現（claude/cc-testing 21e107409，cc_loadleak_probe）：咖啡廳約會演完（下午用完，CLS 排了跳轉），
// 馬上讀 13:48 的檔（書店，沒有任何約）——2.5～4.5 秒後時鐘 13.81 → 18.00；畫面還是上一局的「提醒：14:00 和杜可昕約在……」。
// 檢查：
//   1. 見面演完排了跳轉（還在 busy＝留著）→ 讀檔（loadRelease 跑 LOADLOCKS）→ 新的一局空下來也不跳
//   2. 讀檔以後，舊流程才排的跳轉（排的是舊的那一局）：新的一局不跳
//   3. 同一局排的照樣跳（ACTION-BUDGET-1107 不變）
//   4. 讀檔、開新遊戲把上一局的提示收掉（排著的、畫面上的；game3d.js 的 loadRelease → toastClear）
// 修改前：1、2、4 FAIL。用法：node tests/load_jump_leak_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H;
const fs=require('fs'), path=require('path');
const W=ms=>new Promise(r=>setTimeout(r,ms));
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9; return G; };
const npc=id=>{ const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const skips=[]; if(CLS.skipTo){ CLS.skipTo=async(GM2,t,o)=>{ skips.push({t,why:o&&o.why}); H.G.hour=t; return true; }; }
const loadRelease=()=>{ for(const f of Object.values(globalThis.LOADLOCKS||{})){ try{ f(); }catch(e){} } };   /* game3d.js 的 loadRelease：換 G 之前跑 */
const J=x=>JSON.stringify(x);
(async()=>{
  const id='heroine_02';
  /* 1 */
  { const G=fresh('2025-10-15',13.8,'cafe'); H.FRIEND(id); const iv=INV.accept(G,id,'cafe',G.day,14,{by:'player'}); const n=npc(id); skips.length=0;
    const cs=CLS.canSkip; CLS.canSkip=()=>'現在不能跳'; await INV.meet(GM,iv,n,{}); CLS.canSkip=cs;
    const queued=!!(CLS._jump&&CLS._jump.p==='pm'&&CLS._jump.day===G.day);
    loadRelease(); const G2=fresh('2025-10-15',13.8,'bookstore'); CLS.canSkip=()=>false;   /* 讀 13:48 的檔：同一天、同一個時段 */
    await CLS.afterSlot(GM); await W(5);
    check('1. 前置：演完那一刻還在 busy，跳轉留著（下午）',queued,J({j:CLS._jump}));
    check('1. 讀檔以後新的一局空下來：不跳（時鐘還是 13:48）',skips.length===0&&Math.abs(G2.hour-13.8)<1e-6&&!CLS._jump,J({skips,hour:G2.hour,j:CLS._jump}));
    CLS.canSkip=cs; }
  /* 2：讀檔前的舊流程，讀檔以後才排（凍住的舊流程醒來、或 LOADLOCKS 已經跑過）*/
  { const G=fresh('2025-10-15',14.9,'cafe'); CLS.slotUse(G,['pm']); const oldG=G; const G2=fresh('2025-10-15',13.8,'bookstore'); skips.length=0; CLS._jump=null;
    CLS.queueJump(oldG); const cs=CLS.canSkip; CLS.canSkip=()=>false; await CLS.afterSlot(GM); CLS.canSkip=cs;
    check('2. 舊的一局排的跳轉：新的一局不跳、丟掉',skips.length===0&&Math.abs(G2.hour-13.8)<1e-6&&!CLS._jump,J({skips,hour:G2.hour,j:CLS._jump})); }
  /* 3 */
  { const G=fresh('2025-10-15',15,'cafe'); CLS.slotUse(G,['pm']); skips.length=0; CLS._jump=null; CLS.queueJump(G); const cs=CLS.canSkip; CLS.canSkip=()=>false; await CLS.afterSlot(GM); CLS.canSkip=cs;
    check('3. 同一局排的照樣跳（下午的時間用完了）',skips.length===1&&/下午的時間用完了/.test(skips[0].why||''),J(skips)); }
  /* 4 */
  { const src=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
    const lr=(src.match(/function loadRelease\(\)\{[^\n]*/)||[''])[0], tc=(src.match(/function toastClear\(\)\{[^\n]*/)||[''])[0];
    check('4. loadRelease（讀檔、開新遊戲都會跑）收掉提示',/GM\.toastClear\(\)/.test(lr),lr.slice(0,200));
    check('4. toastClear：排著的清空、計時器停掉、畫面上那一則藏起來、字清掉',/TQ\.length=0/.test(tc)&&/clearTimeout\(tNext\)/.test(tc)&&/clearTimeout\(tHide\)/.test(tc)&&/classList\.add\('hide'\)/.test(tc)&&/textContent=''/.test(tc)&&/tCur=''/.test(tc),tc.slice(0,300));
    const cl=fs.readFileSync(path.join(H.ROOT,'src/classes3d.js'),'utf8');
    check('4. classes3d.js 登記讀檔放開（LOADLOCKS classes3d:jump）',/\['classes3d:jump'\]=\(\)=>\{ S\._jump=null; \}/.test(cl)); }
  console.log(H.fails?'FAILED '+H.fails:'ALL PASS'); process.exit(H.fails?1:0);
})();

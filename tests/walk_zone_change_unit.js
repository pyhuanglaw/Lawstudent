// BB_255 11-13（STUDY_fix_c，約念書帶路途中走出總圖）：她在總圖大廳走路（GM.walkTo）的那一筆，玩家換到校園以後還留在 walks 裡、算成「4 秒沒動」→ walkFallbacks 0→1、還被放到大廳的座標。
// 修法：walkTo 記下開始走的區域（w.zone）；updateWalks 看到換了區域、不是玩家的那一筆＝直接收掉（resolve false），不算卡住。
// 用 game3d.js 原文的 walkTo／updateWalks 兩段在假的 E、GM 上跑。用法：node tests/walk_zone_change_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const pick=re=>{ const m=src.match(re); return m?m[0]:''; };
const wt=pick(/function walkTo\(ent,x,z,opts\)\{[\s\S]*?walks\.add\(w\); \}\); \}/), uw=pick(/function updateWalks\(dt\)\{[^\n]*\n[^\n]*/);
check('0. 找得到 walkTo、updateWalks 兩段',!!wt&&!!uw);
const zA={id:'library_hall'}, zB={id:'campus'};
const mk=()=>({obj:{position:{x:0,z:0}}});
const ctx={ GM:{loadGen:1,turbo:false,walkFallbacks:0}, E:{zone:zA,player:mk(),moveTo:()=>true,placeAt:(e,x,z)=>{ e.obj.position.x=x; e.obj.position.z=z; placed.push([x,z]); }}, standUp(){}, console:{warn(){}}, Promise, Array, Math };
const placed=[]; ctx.placed=placed;
vm.createContext(ctx); vm.runInContext('const walks=new Set();\n'+wt+'\n'+uw+'\nthis.walkTo=walkTo; this.updateWalks=updateWalks; this.walks=walks;',ctx);
(async()=>{
  const her=mk(); let res='pending'; ctx.walkTo(her,5,5).then(v=>{ res=v; });
  ctx.E.zone=zB;   /* 玩家走出總圖 */
  for(let i=0;i<10;i++) ctx.updateWalks(1);   /* 10 秒遊戲時間，她一步都沒走（舊區域的人不會再動）*/
  await new Promise(r=>setImmediate(r));
  check('1. 換了區域：舊區域那個人的走路收掉、不算卡住（walkFallbacks 還是 0）',ctx.GM.walkFallbacks===0&&ctx.walks.size===0,JSON.stringify({fb:ctx.GM.walkFallbacks,n:ctx.walks.size}));
  check('2. 收掉的那一筆 resolve false、沒有被放到舊區域的目的地',res===false&&placed.length===0,JSON.stringify({res,placed}));
  const me=ctx.E.player; ctx.walkTo(me,3,3); ctx.E.zone=zA; for(let i=0;i<5;i++) ctx.updateWalks(1);
  check('3. 玩家自己的走路不管換區域：照舊 4 秒沒動＝保險放到目的地（walkFallbacks 1）',ctx.GM.walkFallbacks===1,String(ctx.GM.walkFallbacks));
  const n2=mk(); ctx.walkTo(n2,2,2); for(let i=0;i<5;i++) ctx.updateWalks(1);
  check('4. 同一區被擋住：照舊算卡住（保險還在）',ctx.GM.walkFallbacks===2,String(ctx.GM.walkFallbacks));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

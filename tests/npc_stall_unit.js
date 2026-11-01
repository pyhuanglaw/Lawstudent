// NPC 走路卡住的保底（NPC-STALL-1030，使用者 2026-10-30 04:2x：「npc要離開一個空間都會卡在門口一直行走 很白癡」）——不需要瀏覽器。
//   以前：NPC 沿路線走、被牆／門框／家具擋住就一直播走路、原地踏步（玩家有 stallStop，NPC 沒有）；離開的人只有 refreshSchedule 每 3 秒
//   （手機一輪十幾秒）的 leaveStuck 檢查，還要離出口 3.5 m 內、兩次之間沒動才算。
//   現在：engine3d.js 每一格量前進距離，連續 E.NPC_STALL 秒走不到該走的 15%＝npcStall：
//     ①離終點 3.5 m 內＝當作到了（清路線、呼叫 onArrive）；②要離開的人在遠處＝重找一次路，還是卡＝站好、記 stalled（看不到才移除）；③其他＝站好不踏步。
//   story3d.js：要離開的人 arrived＝當下移除（STORY.leaveTouch 每一格）；stalled 又看不到＝移除。
// 檢查（從 src/engine3d.js 抽出 npcStall 原樣執行；路線那一段、story3d.js 看字串）
// 修改前（postrel-1030 0bddf79e4）：第 0 項 FAIL。用法：node tests/npc_stall_unit.js [engine3d.js 路徑] [story3d.js 路徑]
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const ENG=fs.readFileSync(process.argv[2]||path.join(ROOT,'src/engine3d.js'),'utf8');
const STO=fs.readFileSync(process.argv[3]||path.join(ROOT,'src/story3d.js'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const blk=ENG.match(/\n  E\.NPC_STALL=1\.2; E\.NPC_STALL_NEAR=3\.5;\n  function npcStall\(n\)\{[\s\S]*?\n  E\.npcStall=npcStall;\n/);
check('0. 抽得到 npcStall（E.NPC_STALL 1.2 秒、E.NPC_STALL_NEAR 3.5 m）',!!blk);
if(fails){ console.log('FAILED '+fails); process.exit(1); }
let moves=[], moveOk=true;
const E={ moveTo:(n,x,z,f,lv)=>{ moves.push([x,z]); if(moveOk){ n.path=[[x,z]]; n.onArrive=f; } return moveOk; } };
const ctx={E}; vm.createContext(ctx); vm.runInContext(blk[0]+'\nthis.npcStall=npcStall;',ctx);
const mk=(o)=>Object.assign({obj:{position:{x:0,z:0}},pose:'walk',idlePose:'idle',speed:1.35,_stall:2},o);
// ①
let arrived=0, n=mk({path:[[1,0],[2.5,0]],beh:'leave',leaving:true,onArrive:()=>{ arrived++; }});
let r=ctx.npcStall(n);
check('1. 離開的人卡在門口（離終點 2.5 m）：當作到了——清路線、呼叫 onArrive、不再走路',r===true&&arrived===1&&n.path===null&&n.pose==='idle'&&n.speed===0&&n.stalled===true,JSON.stringify({r,arrived,pose:n.pose}));
arrived=0; n=mk({path:[[0.5,0],[1,1]],beh:'idle',onArrive:()=>{ arrived++; },idlePose:'read'});
r=ctx.npcStall(n);
check('1. 走去座位卡在旁邊（終點 1.4 m）：一樣當作到了（坐下的 onArrive 照常）',r===true&&arrived===1&&n.path===null);
// ②
arrived=0; moves=[]; moveOk=true; n=mk({path:[[3,0],[10,0]],beh:'leave',leaving:true,onArrive:()=>{ arrived++; }});
r=ctx.npcStall(n);
check('2. 離開的人在遠處卡住（終點 10 m）：先重找一次路（不算到了）',r===false&&moves.length===1&&J(moves[0])===J([10,0])&&arrived===0&&!!n.path,JSON.stringify(moves));
n._stall=2; r=ctx.npcStall(n);
check('2. 重找以後還是卡：站好、記 stalled、不呼叫 onArrive（不在玩家眼前消失）',r===true&&arrived===0&&n.path===null&&n.onArrive===null&&n.stalled===true&&n.pose==='idle',JSON.stringify({r,arrived,stalled:n.stalled}));
// ③
arrived=0; n=mk({path:[[3,0],[9,0]],beh:'wander',onArrive:()=>{ arrived++; }});
r=ctx.npcStall(n);
check('3. 其他（亂走、遠處卡住）：放掉路線、站好、不呼叫 onArrive',r===true&&arrived===0&&n.path===null&&n.pose==='idle'&&n.speed===0);
// 路線那一段
check('4. engine：沿路線走的那一段量每一格前進（不到該走的 15%＝累加 _stall），超過 E.NPC_STALL 就 npcStall',/n\._stall=mv<ss\*dt\*0\.15\?\(n\._stall\|\|0\)\+dt:0; if\(n\._stall>E\.NPC_STALL&&npcStall\(n\)\) moving=false;/.test(ENG));
check('4. engine：到了路線點 _stall 歸零',/if\(wpReached\(n,d,0\.3,dt\)\)\{ n\.path\.shift\(\); n\._stall=0;/.test(ENG));
check('5. story3d：要離開的人 arrived＝當下移除（leaveTouch 每一格，GM.npc 和路人都一樣）',/n&&n\.leaving&&\(n\.arrived\|\|near\(n\)\)\)\{ GM\.removeNPC\(id\)/.test(STO)&&/n&&n\.isExtra&&n\.leaving&&\(n\.arrived\|\|near\(n\)\)\)\{ E\.removeNPC\(n\)/.test(STO));
check('5. story3d：遠處卡住（stalled）又看不到＝移除（兩處）',(STO.match(/\|\|\(n\.stalled&&!vis\)\|\|leaveStuck\(n,P\)/g)||[]).length===2);
function J(x){ return JSON.stringify(x); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

// PERF-NPC-POOL-1022：換區域以後最大的卡（LAWWW2 量測 PERF-ZONE-ENTER-1018，3d6f2cee）——新的路人底模到了，不要同一格全部換上——不需要瀏覽器。
//   1 GM.upgradeModels（game3d.js，每 1.5 秒叫一次）：路人（isExtra、騎士）一次最多換 GM.UPG_EXTRA（1）個；主角、有名字的人照舊一次全部換
//   2 叫幾次以後全部換完（沒有人一直留著舊的／藏起來）；沒有要換的人不算
//   3 池子每次換區域只換 1 女 1 男（CHAR.anonPool.refresh 往後移一格）：見 tests/anon_pool_unit.js 第 4 段
// 修改前（開發分支 5c2a173f）：第 1 項 FAIL（一次把 5 個路人、2 個騎士全部換上）。用法：node tests/perf_npc_pool_unit.js
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'); let fails=0;
const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const m=src.match(/(?:  GM\.UPG_EXTRA=\d+;\n)?  GM\.upgradeModels=function\(\)\{[\s\S]*?return n; \};/);
check('0. 抽得出 GM.upgradeModels',!!m);
if(!m){ console.log('FAILED '+fails); process.exit(1); }
const mk=(id,need)=>({id,need,position:{x:0,y:0,z:0},userData:{driver:need?'proc':'vrm'}});
const CHAR={needsUpgrade:h=>!!(h&&h.need),upgrade:h=>Object.assign(mk(h.id,false),{up:true})};
const E={player:{obj:mk('hero',true)},npcs:[],prePose(){}};
const GM={};
for(const id of ['an','zhe','sis']) E.npcs.push({obj:mk(id,true),isExtra:false});
for(let i=0;i<5;i++) E.npcs.push({obj:mk('x'+i,true),isExtra:true});
E.npcs.push({obj:mk('x9',false),isExtra:true});   /* 已經是正式模型的路人：不算 */
GM.extras=[{rider:mk('r0',true)},{rider:mk('r1',true)},{rider:null}];
const console0=console.info; console.info=()=>{};
vm.runInNewContext(m[0],{GM,E,CHAR,console});
const ups=()=>({hero:!!E.player.obj.up,named:E.npcs.filter(n=>!n.isExtra&&n.obj.up).length,extra:E.npcs.filter(n=>n.isExtra&&n.obj.up).length,riders:GM.extras.filter(x=>x.rider&&x.rider.up).length});
const n1=GM.upgradeModels(), u1=ups();
check('1. 叫一次：主角、有名字的 3 個全部換；路人（含騎士）只換 1 個',u1.hero&&u1.named===3&&u1.extra+u1.riders===1&&n1===5,JSON.stringify({n1,u1,UPG_EXTRA:GM.UPG_EXTRA}));
let k=1; while(k<20&&(E.npcs.some(n=>n.obj.need)||GM.extras.some(x=>x.rider&&x.rider.need))){ GM.upgradeModels(); k++; }
const u2=ups();
check('2. 再叫幾次全部換完：5 個路人＋2 個騎士＝第 7 次叫完（每 1.5 秒一個，約 10 秒）；已經是正式模型的不換',u2.extra===5&&u2.riders===2&&k===7&&!E.npcs.find(n=>n.obj.id==='x9').obj.up,JSON.stringify({k,u2}));
check('2. 都換完以後再叫：一個都不換',GM.upgradeModels()===0);
console.info=console0;
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

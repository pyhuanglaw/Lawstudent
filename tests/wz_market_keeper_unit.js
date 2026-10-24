// 二手市集的攤主（WZ-MARKET-KEEPER-1024；src/wzlines3d.js 的 WZL.marketKeepers、zones3d.js 的 mktTick 叫它）——不需要瀏覽器。
//   1 市集開（晴天）：三攤各一位攤主，坐在 WZ_PARK_LAYOUT.market.clear.stalls[i].keeper（面向客人），名字「攤主」、不打招呼、不走動
//   2 收攤：三位都拿掉；再開一次不會重複生成
//   3 下雨：照 rain 的兩攤
//   4 zones3d.js 的 mktTick 開、收的時候叫 WZL.marketKeepers(on, 晴雨)
// 修改前（257e403a6）：沒有 WZL.marketKeepers——全部 FAIL。用法：node tests/wz_market_keeper_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const L3=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
if(typeof WZ_PARK_LAYOUT==='undefined') L3('src/data/wz_park_layout.js');
if(typeof WZL==='undefined'||!WZL.marketKeepers){ try{ L3('src/wzlines3d.js'); }catch(e){ console.log('（載入 wzlines3d.js 失敗：'+e.message+'）'); } }
let spawned=[], removed=[];
H.fresh('2026-11-07',10,'wenzhou'); GM.npc={};
GM.spawnNPC=(id,sp,x,z,o)=>{ const n={id,name:sp.name,x,z,o}; spawned.push(n); GM.npc[id]=n; return n; };
GM.removeNPC=id=>{ removed.push(id); delete GM.npc[id]; };
const ok=typeof WZL!=='undefined'&&typeof WZL.marketKeepers==='function';
check('0. WZL.marketKeepers 存在',ok);
if(ok){
  const C=WZ_PARK_LAYOUT.market.clear.stalls, R=WZ_PARK_LAYOUT.market.rain.stalls;
  const n1=WZL.marketKeepers(true,'clear',GM);
  check('1. 晴天開市：每一攤一位攤主、坐在 keeper 的位置、面向客人',n1===C.length&&spawned.length===C.length&&spawned.every((s,i)=>s.x===C[i].keeper.x&&s.z===C[i].keeper.z&&s.o.seat&&s.o.seat.yaw===C[i].keeper.yaw),J(spawned.map(s=>[s.id,s.x,s.z])));
  check('1. 名字「攤主」、不打招呼、不走動（frozen）',spawned.every(s=>s.name==='攤主'&&s.o.greet===false&&s.frozen===true));
  WZL.marketKeepers(true,'clear',GM); check('2. 再開一次不會重複生成',spawned.length===C.length);
  const n2=WZL.marketKeepers(false,'clear',GM); check('2. 收攤：三位都拿掉',n2===C.length&&removed.length===C.length&&!Object.keys(GM.npc).some(k=>/^wz_keeper_/.test(k)),J(removed));
  spawned=[]; WZL.marketKeepers(true,'rain',GM); check('3. 下雨：照 rain 的攤位（'+R.length+' 攤）',spawned.length===R.length&&spawned.every((s,i)=>s.x===R[i].keeper.x&&s.z===R[i].keeper.z));
}
const zs=fs.readFileSync(path.join(H.ROOT,'src/zones3d.js'),'utf8');
check('4. zones3d.js 的 mktTick 開、收的時候叫 WZL.marketKeepers(on,MKT.w)',/mktNav\(on\); if\(typeof WZL!=='undefined'&&WZL\.marketKeepers\) WZL\.marketKeepers\(on,MKT\.w\);/.test(zs));
H.done();

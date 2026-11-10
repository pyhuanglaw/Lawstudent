// 換區域以後 E.zone.id＝區域名（engine3d.js E.loadZone）——不需要瀏覽器。
//   起因：2026-11-04 BB-C／CC-C（WZ4_yizhan_r3，PC）：一盞前院「第一次從冠木門走進來」的旁白沒出來、WZ_TEA_YARD_IN 也沒記——
//   wzshops3d.js yardIntro 看 E.zone.id，可是 loadZone 只設了 z.def＝zoneDef、沒設 z.id，E.zone.id 永遠是 undefined。
//   同一個坑另外三處各自繞過（invites3d、story3d 看 G.zone，us_traffic 看 def.id）；點地的偏好 tapPref.zone 也因此換區還沿用。
//   1 原始碼：loadZone 在 E.zone＝z 以前把 zoneDef.id 寫進 z.id（build 自己設了 id 的不蓋掉）
//   2 一盞前院：E.zone.id＝wz_teahouse、人從冠木門進來（z 9 > yardZ 6.35）→ yardIntro 演、記旗標；E.zone 沒有 id → 不演（修改前的樣子）
//   3 每個區域定義都有 id（zones3d.js 的 campus、wzShop 工廠），而且跟 ZONES 的鍵一樣
// 修改前（開發分支 c94cd808c）：第 1 項 FAIL。用法：node tests/zone_id_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const eng=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
const lz=(eng.match(/E\.loadZone=function\(zoneDef,spawn\)\{[\s\S]*?return z; \};/)||[''])[0];
check('1. loadZone 把 zoneDef.id 寫進 z.id（在 E.zone=z 以前；build 自己有 id 就不蓋）',/const z=zoneDef\.build\(E\); z\.def=zoneDef; if\(z\.id==null\) z\.id=zoneDef\.id; E\.zone=z;/.test(lz),lz?'':'找不到 E.loadZone');
(async()=>{
  const src=fs.readFileSync(path.join(ROOT,'src/wzshops3d.js'),'utf8');
  const ctx={console,Math,JSON,Object,Array,String,Number,Promise,setTimeout,window:{}}; ctx.globalThis=ctx; vm.createContext(ctx);
  let WZS=null; try{ vm.runInContext(src.replace(/^const WZS\s*=/m,'globalThis.WZS='),ctx,{filename:'wzshops3d.js'}); WZS=ctx.WZS; }catch(e){ check('2. wzshops3d.js 載得到',false,String(e&&e.message||e)); }
  if(WZS&&WZS.yardIntro){
    const mk=(zone)=>{ const said=[]; const GM={G:{flags:{},hour:14},E:{zone,player:{obj:{position:{x:-3,z:9}}}},sleep:async()=>{},caption:(a,b)=>said.push(b)}; return {GM,said}; };
    const a=mk({id:'wz_teahouse',yardZ:6.35}); const ra=await WZS.yardIntro(a.GM);
    check('2. E.zone.id＝wz_teahouse、從冠木門進來（z 9）：旁白演、記 WZ_TEA_YARD_IN',ra===true&&a.GM.G.flags.WZ_TEA_YARD_IN===true&&a.said.length===1,JSON.stringify({ra,flag:a.GM.G.flags.WZ_TEA_YARD_IN,n:a.said.length}));
    const b=mk({yardZ:6.35}); const rb=await WZS.yardIntro(b.GM);
    check('2. E.zone 沒有 id（修改前的樣子）：不演、不記',rb===false&&!b.GM.G.flags.WZ_TEA_YARD_IN);
  } else check('2. WZS.yardIntro 存在',false);
  const zs=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
  check('3. 區域定義帶 id：campus 寫 id:\'campus\'、溫州街店面工廠 wzShop 回傳 id:\'wz_\'+key',/const campus=\{ id:'campus'/.test(zs)&&/function wzShop\(key\)\{ return \{ id:'wz_'\+key/.test(zs));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

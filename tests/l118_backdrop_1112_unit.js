/* L118-DIAN-CEILING-1112（LAWWW2-C；BB 17:4x、CC L118_SEAT_dian_tea gate_l118_dian_1215：118 牛排抬頭藍天白雲、進門全景左上角露天）
   原因：跟隨鏡頭 4.2 m 時鏡頭高過天花板（3.2 m），ceilHide 把天花板藏起來，牆也只到 3.2 m——往上看、往遠看都是天空。改法：src/l118_shops3d.js 每間加 Z3.roomBackdrop 暗色的殼。
   1 九間 118 巷的店都有 l118_backdrop（BackSide、不受霧）
   2 殼把房間和鏡頭可能到的地方整個包住：房間四角往外 4.4 m（跟隨距離）、高到 1.45＋4.4 m 都在殼裡面
   3 殼不擋窗景板（l118 的窗景在玻璃外 0.42 m，殼離牆 ≥ 5 m）
   4 BB 17:4x：鏡頭距離 4.2→3.6 m，預設俯角下鏡頭比天花板低（看得到真的天花板；暗殼留著當保險）
   修改前（開發分支 9e3fcbe123）：1 FAIL。模擬（D131）。用法：node tests/l118_backdrop_1112_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){}, querySelector:()=>null, querySelectorAll:()=>[], body:{appendChild(){},classList:{add(){},remove(){}}} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch')); const clog=console.log; console.warn=()=>{}; console.error=()=>{};
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const loadErr=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+e.message.slice(0,50)); } }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});

const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; const R=0.32;
function build(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); z.id=id; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.fitSeatRadius) E.fitSeatRadius();   /* 遊戲載入區域時做的（座位按鈕範圍碰不到站得住的地方就放大）*/ E.player={obj:{position:new THREE.Vector3(0,0,0)},lv:0,radius:R}; return z; }

let fails=0; const check=(name,ok,info)=>{ clog((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const ids=Object.keys(L118_SHOP_LAYOUTS); const miss=[], out=[];
for(const k of ids){ const zid='l118_'+k; if(!Z3.ZONES[zid]){ miss.push(zid+'(沒有區域)'); continue; } const z=build(zid); let bd=null; z.group.traverse(o=>{ if(o.name==='l118_backdrop') bd=o; });
  if(!bd||bd.material.side!==THREE.BackSide||bd.material.fog!==false){ miss.push(zid); continue; }
  bd.geometry.computeBoundingBox(); const bb=bd.geometry.boundingBox.clone().applyMatrix4(bd.matrixWorld); const B=L118_SHOP_LAYOUTS[k].bounds;
  for(const [x,zz] of [[B.x0-4.4,B.z0-4.4],[B.x1+4.4,B.z1+4.4]]) for(const y of [0.2,1.45+4.4]) if(!bb.containsPoint(new THREE.Vector3(x,y,zz))) out.push(zid+' ('+x.toFixed(1)+','+y.toFixed(1)+','+zz.toFixed(1)+')');
  if(Math.min(B.x0-bb.min.x,bb.max.x-B.x1,B.z0-bb.min.z,bb.max.z-B.z1)<5) out.push(zid+' 殼離牆不到 5 m'); }
check('1. 九間 118 巷的店都有暗色的殼（l118_backdrop）',!miss.length&&ids.length>=9,ids.length+' 間；沒有的：'+miss.join('、'));
check('2/3. 殼包住鏡頭可能到的地方、離牆 ≥ 5 m（不擋窗景板）',!out.length,out.slice(0,6).join('；'));
{ const E3s=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'); const m=/pitch=E\.indoor\?([0-9.]+):/.exec(E3s), P=m?+m[1]:0.38; const hi=[];
  for(const k of ids){ const L=L118_SHOP_LAYOUTS[k], zd=Z3.ZONES['l118_'+k], d=zd&&zd.camDist, y=1.45+0.2+Math.sin(P)*d, top=(L.h||3.2)-0.02; if(!(y<top)) hi.push(k+' '+d+' m→鏡頭 '+y.toFixed(2)+' m'); }
  check('4. BB 17:4x：九間的跟隨鏡頭（室內預設俯角 '+P+'）都在天花板（3.2 m）下面，看得到真的天花板',!hi.length,hi.join('、')); }
clog(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

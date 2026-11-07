/* 大口漢堡櫃檯後面的店員（SHOP-STAFF-1107 第 2 件；使用者 11-07 試玩「大口漢堡可以點餐但櫃檯沒店員」）：
   不需要瀏覽器，在 Node 裡建出遊戲真正的區域 xs_dakou，照遊戲換區域的順序叫 STORY.populate（src/dakou_sys3d.js 包上的那一層）：
   ① DKS.populate 有、STORY.populate 包上了（原本的 populate 照樣有叫到）
   ② 營業時間內（24 小時：03:00、12:00、22:00）進來：櫃檯後面有一個店員＝配置 floor1.interact 的 clerk（位置、面向客人）；clerk、frozen、isExtra、第 0 層、不說話（沒有 talk）、不背包
   ③ 店員在櫃檯後面：她站的地方玩家站不到（櫃檯、廚房的阻擋），「點餐」那一點站得住、和她隔著櫃檯（1.2 m 以上）；站在「點餐」那一點按鈕還是「點餐」
   ④ 再 populate 一次：還是一個；別的區域（新生南路）沒有大口的店員
   ⑤ 不營業的時候（PLACES.isOpen 回 false：以後改營業時間）沒有人
   ⑥ 店員不放按鈕（DK3.INTERACT 照舊濾掉 clerk）；點餐照舊是「店員」那幾句（AA_697）
   修改前（開發分支 70cd58a2d）：沒有 DKS.populate＝櫃檯後面沒有人（FAILED）。修改後 ALL PASS。
   用法：node tests/dakou_clerk_1107_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址）
{ const w0=console.warn; console.warn=(...a)=>{ if(/正式模型載入失敗/.test(String(a[0]))) return; w0(...a); }; }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/dakou_layout.js','src/dakou3d.js','src/eat3d.js','src/dakou_sys3d.js'];
/* 遊戲裡 story3d.js 比 dakou_sys3d.js 先載：最小的 STORY（populate、interact、TICKS、extraSpec）*/
let basePop=0;
global.STORY={TICKS:[],populate:()=>{ basePop++; return null; },interact:async()=>false,onStudy:null,studyNarr:null,extraSpec:i=>({id:'x'+i,bag:'backpack',i})};
global.GAME={G:null};
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
global.CHAR={build:sp=>{ const o=new THREE.Group(); o.userData.spec=sp; return o; },SIT_TOP:0.45};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0,busy:false}; E.addNPC=n=>{ n.lv=n.lv|0; E.npcs.push(n); return n; }; return z; }
const sec=(n,f)=>{ try{ return f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const mkGM=G=>{ GAME.G=G; return {G,E,enterN:1}; };
const newG=(hour,zone)=>({day:42,hour,zone:zone||'xs_dakou',money:2000,flags:{},stage:'law'});
const staff=()=>E.npcs.filter(n=>n&&n.clerk);
const C=(DAKOU_LAYOUT.shop.floor1.interact||[]).find(q=>q.kind==='clerk'), ORD=(DAKOU_LAYOUT.shop.floor1.interact||[]).find(q=>q.kind==='order');

check('① 配置有 clerk（櫃檯後面）和 order（點餐）',!!C&&!!ORD,J([C,ORD&&[ORD.x,ORD.z]]));
check('① DKS.populate 有、STORY.populate 包上了',typeof DKS!=='undefined'&&typeof DKS.populate==='function'&&STORY._dks===true);
sec('②',()=>{ for(const h of [3,12,22]){ loadZone('xs_dakou'); const n0=basePop; STORY.populate('xs_dakou',mkGM(newG(h))); const s=staff(), n=s[0];
    check('② '+String(h).padStart(2,'0')+':00 進大口漢堡：櫃檯後面一個店員，在配置的 clerk、面向客人（yaw '+C.yaw+'）',s.length===1&&!!n&&Math.hypot(n.obj.position.x-C.x,n.obj.position.z-C.z)<0.01&&Math.abs(n.obj.rotation.y-(C.yaw||0))<1e-6,
      J(s.map(q=>[+q.obj.position.x.toFixed(2),+q.obj.position.z.toFixed(2),q.obj.rotation.y])));
    if(h===12){ check('② 店員：clerk、frozen、isExtra、第 0 層、不說話（沒有 talk）、路人底模不背包',!!n&&n.clerk===true&&n.frozen===true&&n.isExtra===true&&(n.lv|0)===0&&!n.talk&&n.obj.userData.spec&&n.obj.userData.spec.bag===null);
      check('② 原本的 STORY.populate 照樣有叫到',basePop===n0+1); } } });
sec('③',()=>{ loadZone('xs_dakou'); STORY.populate('xs_dakou',mkGM(newG(12)));
  const oi=E.interactables.find(q=>q.dakou==='order');
  check('③ 店員站的地方玩家站不到（櫃檯後面）；「點餐」那一點站得住、和她隔著櫃檯 1.2 m 以上',!E.canStand(C.x,C.z,0.3,0)&&E.canStand(ORD.x,ORD.z,0.3,0)&&Math.hypot(ORD.x-C.x,ORD.z-C.z)>1.2,
    J([E.canStand(C.x,C.z,0.3,0),E.canStand(ORD.x,ORD.z,0.3,0)]));
  E.player.obj.position.set(ORD.x,0,ORD.z); const it=E.nearestInteractable();
  check('③ 站在「點餐」那一點：按鈕還是「點餐」（店員不搶按鈕）',!!oi&&it===oi,it&&it.label);
  STORY.populate('xs_dakou',mkGM(newG(12))); check('④ 再 populate 一次：還是一個店員',staff().length===1,String(staff().length));
  loadZone('xinsheng'); STORY.populate('xinsheng',mkGM(newG(12,'xinsheng'))); check('④ 新生南路：沒有大口的店員',E.npcs.filter(n=>n&&n.dakouClerk).length===0); });
sec('⑤',()=>{ const io=PLACES.isOpen; PLACES.isOpen=(z,h,d)=>z==='xs_dakou'?false:io.call(PLACES,z,h,d);
  try{ loadZone('xs_dakou'); STORY.populate('xs_dakou',mkGM(newG(12))); check('⑤ 不營業（PLACES.isOpen 假）：櫃檯後面沒有人',staff().length===0,String(staff().length)); } finally { PLACES.isOpen=io; } });
sec('⑥',()=>{ check('⑥ 店員不放按鈕：DK3.INTERACT 沒有 clerk',!DK3.INTERACT().some(q=>q.kind==='clerk'));
  const src=fs.readFileSync(path.join(ROOT,'src/dakou_sys3d.js'),'utf8');
  check('⑥ 點餐照舊是「店員」的那幾句（AA_697：您好，內用還是外帶？／好了會叫號。）',DKS.L.counterAsk==='您好，內用還是外帶？'&&DKS.L.counterCall==='好了會叫號。'&&/GM\.say\(CLERK,S\.L\.counterAsk\)/.test(src)); });
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

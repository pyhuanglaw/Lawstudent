// 路燈的燈柱擋得住人（BUG-NAV-LAMPPOST-1021，LAWWW2 2026-10-21）——不需要瀏覽器。
// 原本：路燈的導航阻擋是 nav.blockCircle(x,z,0.25)。導航是 0.5 m 的格子、只看格子中心；燈柱剛好在格子的角上（整數座標，椰林大道兩排都是）時，
//       四個格子中心都在 0.354 m 外，一格都沒擋到——玩家、路人直接從燈柱中間走過去。不在格角的也只擋到一兩格，斜著走會貼進燈柱。
// 做法：燈柱的阻擋半徑改成 0.5 m（柱座半徑 0.23＋半格；燈柱剛好在格子中心時擋十字五格，斜著走也進不去）。
// 檢查：校園、公館、溫州街、118 巷每一盞有導航的路燈，人物（半徑 0.32）的中心在燈柱 0.4 m 以內（燈桿半徑約 0.08＋人物 0.32：身體一定穿過燈桿）都站不住。
// 用法：node tests/lamppost_nav_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/wz_park_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|WZ_PARK_LAYOUT|LANE118_LAYOUT|LANE118_SHOPS|L118_SHOP_DATA|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{}); vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/wzpark3d.js'),'utf8').replace(/^const PARK\s*=/m,'global.PARK='),{filename:'src/wzpark3d.js'}); global.fetch=()=>Promise.reject(new Error('no fetch'));
global.GAME={G:{day:5,hour:15,flags:{},daily:{}}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3, v=new THREE.Vector3();
function build(id){ const made=[]; const lp0=W3.lampPost; W3.lampPost=(...a)=>{ const l=lp0(...a); made.push(l); return l; };
  E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  let z; try{ z=Z3.ZONES[id].build(E); } finally { W3.lampPost=lp0; }
  E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; (z.group||E.scene).updateMatrixWorld(true);
  return {z,made}; }
/* 一盞路燈「有導航」＝燈柱附近 1.2～2 m 有人站得住的地方（遠景、牆外的燈不算） */
function nearWalkable(x,z){ for(let k=0;k<16;k++){ const a=k/16*Math.PI*2; for(const d of [1.2,1.6,2.0]) if(E.canStand(x+Math.cos(a)*d,z+Math.sin(a)*d,0.32,0)) return true; } return false; }
const R_IN=0.4;   // 燈桿半徑約 0.08（柱座 0.23）＋人物 0.32：中心在 0.4 m 以內，身體一定穿過燈桿
const all={};
for(const id of ['campus','gongguan','wenzhou','lane118']){
  const {made}=build(id); const lamps=made.filter(l=>{ let p=l; while(p.parent) p=p.parent; return p===E.scene||p===(E.zone.group||null)||!!l.parent; });
  const bad=[], used=[];
  for(const l of lamps){ l.getWorldPosition(v); const x=+v.x.toFixed(3), z=+v.z.toFixed(3); if(!nearWalkable(x,z)) continue; used.push([x,z]);
    let worst=null; for(let k=0;k<32;k++){ const a=k/32*Math.PI*2; for(const d of [0,0.1,0.2,0.3,R_IN]){ const px=x+Math.cos(a)*d, pz=z+Math.sin(a)*d; if(E.canStand(px,pz,0.32,0)&&(worst==null||d<worst)) worst=d; } }
    if(worst!=null) bad.push([x,z,worst]); }
  all[id]={used:used.length,bad};
  check(`${id}：${used.length} 盞有導航的路燈，人物中心在燈柱 ${R_IN} m 以內都站不住`,used.length>0&&!bad.length,bad.length?`站得進去的 ${bad.length} 盞，例 ${JSON.stringify(bad.slice(0,5))}（第三個數字＝最近站得住的距離）`:'');
}
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);

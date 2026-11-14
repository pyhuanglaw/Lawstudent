// L118-SEAT-FIX-1112 r4（LAWWW2-C 2026-11-13；CC L118_CAM36_a_r3 run.log 286–292：辛亥韓食 #6／#12 坐到外側那張）：靠內側的座位，按鈕和走近點（ap）在走道上，離外側那張的按鈕只有 0.4 m。
//  點地板點在內側座位的走近點上走過去、停偏 0.23 m（CC：停在 (−0.06,−0.05)，走近點 (−0.05,0.18)），按鈕要是內側那張，不是外側那張（原本 tq 拿點的位置比椅子中心，外側那張比較近）。
//  同時確認：點外側座位自己的走近點＝外側那張；點椅子本身＝那張（L118-IT-REACH-1111 的標準不變）。
// 修改前（開發分支 c64a8caf61）：FAIL 2（#6、#12）。用法：node tests/l118_seat_inner_ap_1113_unit.js
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

let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };

build('l118_tea'); const L=L118_SHOP_LAYOUTS.tea, P0=E.player||{};
const P={obj:{position:new THREE.Vector3()},lv:0}; E.player=P;
const itOf=i=>E.interactables.find(it=>it.seat&&Math.abs(it.seat.x-L.seats[i-1].x)<1e-6&&Math.abs(it.seat.z-L.seats[i-1].z)<1e-6);
const pick=(px,pz,tp)=>{ P.obj.position.set(px,0,pz); P.tapPref=tp?{x:tp[0],z:tp[1],lv:0,zone:E.zone.id}:null; const it=E.nearestInteractable(); return it&&it.seat?L.seats.findIndex(s=>Math.abs(s.x-it.seat.x)<1e-6&&Math.abs(s.z-it.seat.z)<1e-6)+1:0; };
const nm=i=>'#'+i+'（'+L.seats[i-1].x+', '+L.seats[i-1].z+'）';
for(const [inner,outer] of [[6,5],[12,11]]){ const s=L.seats[inner-1], it=itOf(inner); const ap=s.ap;
  /* 停偏 0.23 m：往外側那張按鈕的方向 */ const o=itOf(outer), dx=o.x-ap[0], dz=o.z-ap[1], d=Math.hypot(dx,dz)||1, stop=[ap[0]+dx/d*0.23, ap[1]+dz/d*0.23];
  const got=pick(stop[0],stop[1],ap);
  check('1 點 '+nm(inner)+' 的走近點 ['+ap+']，停偏 0.23 m 在 ['+stop.map(v=>v.toFixed(2))+']：按鈕是 '+nm(inner),got===inner,'實際 #'+got+(it?'':'（找不到互動點）'));
  const got2=pick(o.x,o.z,[o.x,o.z]); check('2 點外側 '+nm(outer)+' 自己的走近點：按鈕是 '+nm(outer),got2===outer,'實際 #'+got2);
  const got3=pick(ap[0],ap[1],[s.x,s.z]); check('3 點椅子 '+nm(inner)+' 本身、站在它的走近點：按鈕是它',got3===inner,'實際 #'+got3); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);

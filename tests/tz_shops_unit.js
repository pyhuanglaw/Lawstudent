// 汀州路／公館六間店的室內（GG-SHOPS3-ART-1110，X320；LAWWW2 帳號 A 2026-11-10；使用者 11-10「六家的內部參考圖」）的導航（不需要瀏覽器）：
// 配置 src/data/tz_shops_layout.js 裡的每一間：在 Node 建出遊戲真正的區域，用引擎真正的找路＋移動碰撞（E.simWalk：走路、跑步＋低幀率）檢查——
//   外面的店門互動點通到這一間、進來站得住；「離開」回到外面站得住的地方、離店門互動點超過半徑（一出來不會又跳出「進」）；
//   每一個座位走得到；每一個互動點站得住、走得到；家具、櫃台、廚房站不進去；店員的位置在櫃台後面（客人走不到）；正式模型的檔案在、資產有登記。
// 這是模擬，不是真實玩家流程（D131）。用法：node tests/tz_shops_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const need=['src/data/tz_shops_layout.js','src/tz_shops3d.js'].filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(need.length){ check('0. 六間店室內的檔案在',false,need.join(' ')); console.log('FAILED: '+fails); process.exit(1); }
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/tingzhou_layout.js','src/tingzhou3d.js','src/data/tz_shops_layout.js','src/tz_shops3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|TZ3|TZS3|TINGZHOU_LAYOUT|TZ_SHOPS_LAYOUT|LINZE_LAYOUT|CLASSROOM_LAYOUT|FLOWER_NOTES_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt,speed)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30,speed});
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.8],[0.1,4.8]]){ const r=sim(a,b,dt,sp); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return {ok:true}; };
const fmt=r=>JSON.stringify(r).slice(0,200);
const stand=(x,z,lv,r)=>E.canStand(x,z,r==null?0.32:r,lv|0);
function standNear(it){ const R=Math.min(it.radius||it.r||1,1.2), lv=it.lv|0; if(stand(it.x,it.z,lv)) return [it.x,it.z,lv]; for(let r=0.15;r<=R-0.1;r+=0.15) for(let a=0;a<16;a++){ const x=it.x+Math.cos(a/16*Math.PI*2)*r, z=it.z+Math.sin(a/16*Math.PI*2)*r; if(stand(x,z,lv)) return [x,z,lv]; } return null; }
function approach(seat){ const yaw=seat.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lv=seat.lv|0; for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=seat.x+dx, z=seat.z+dz; if(stand(x,z,lv,0.3)) return [x,z,lv]; } return null; }
const ALL=TZ_SHOPS_LAYOUT, ids=Object.keys(ALL);
check('0. 配置裡至少有泰米村食；index.html 載入配置和區域',ids.includes('taimi')&&/src\/data\/tz_shops_layout\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8'))&&/src\/tz_shops3d\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8')),ids.join(' '));
for(const id of ids){ const L=ALL[id], N=L.name;
  // ---- 外面 ----
  { const zo=loadZone(L.outZone); const door=E.interactables.find(i=>i.exit&&i.exit.to===L.zone);
    check(N+' 1. 外面（'+L.outZone+'）有通到這一間的店門互動點',!!door,door?`(${door.x},${door.z}) ${door.label}`:'沒有');
    check(N+' 1. 從店裡出來站的地方站得住、離店門互動點超過半徑＋0.2（一出來不會又跳出「進」）',stand(L.out.x,L.out.z,0)&&!!door&&Math.hypot(L.out.x-door.x,L.out.z-door.z)>door.radius+0.2,door?`距離 ${Math.hypot(L.out.x-door.x,L.out.z-door.z).toFixed(2)}、半徑 ${door.radius}`:''); 
    if(door){ const p=standNear(door); check(N+' 1. 出來以後走得回店門口',!!p&&walk([L.out.x,L.out.z,0],p).ok,JSON.stringify(p)); } }
  // ---- 室內 ----
  { const z=loadZone(L.zone), SP=[L.spawn.x,L.spawn.z,0]; const ex=E.interactables.find(i=>i.exit&&i.exit.to===L.outZone);
    check(N+' 2. 進來站的地方站得住；「離開」在門口、回到配置的 out；出生點離「離開」超過半徑＋0.2',stand(SP[0],SP[1],0)&&!!ex&&ex.exit.spawn.x===L.out.x&&ex.exit.spawn.z===L.out.z&&Math.hypot(SP[0]-ex.x,SP[1]-ex.z)>ex.radius+0.2&&!!standNear(ex),ex?`距離 ${Math.hypot(SP[0]-ex.x,SP[1]-ex.z).toFixed(2)}、半徑 ${ex.radius}`:'沒有離開');
    { const bad=[]; for(const q of L.seats||[]){ const a=q.ap?(stand(q.ap.x,q.ap.z,0,0.3)?[q.ap.x,q.ap.z,0]:null):approach({x:q.x,z:q.z,yaw:q.yaw,lv:0}); const r=a&&walk(SP,a); if(!a||!r.ok) bad.push(q.id+(a?JSON.stringify(a)+fmt(r).slice(0,90):'沒有走近點')); } check(N+' 3. 每一個座位有「坐下」、走得到（'+(L.seats||[]).length+' 個）',E.interactables.filter(i=>i.tzSeat).length===(L.seats||[]).length&&!bad.length,bad.join(' ')); }
    { const bad=[]; for(const it of E.interactables){ const p=standNear(it); if(!p||!walk(SP,p).ok) bad.push(it.label+'@'+it.x+','+it.z); } check(N+' 3. 每一個互動點旁邊站得住、走得到',!bad.length,bad.join(' ')||E.interactables.length+' 個'); }
    { const inside=[]; for(const b of TZS3.blocks(L)) if(stand(b[0],b[1],0,0.2)) inside.push(b.join('/')); check(N+' 4. 家具、櫃台、廚房裡面站不住',!inside.length,inside.slice(0,4).join(' ')); }
    if(L.clerk&&!L.clerkOpen){ const c=L.clerk, r=sim(SP,[c.x,c.z,0],1/30,1.8); check(N+' 4. 店員的位置在櫃台後面：客人走不進去（'+c.x+','+c.z+'）',!!z.shopClerk&&!r.ok); }
    check(N+' 5. 互動點的 kind 都有（給 LAWWW 接）；座位的 table 寫了桌號',(L.points||[]).every(p=>E.interactables.some(i=>i.kind===p.kind))&&E.interactables.filter(i=>i.tzSeat).every(i=>/_t\d+$/.test(i.seat.table)));
    check(N+' 6. 正式模型：資產有登記、GLB 檔案在、zone_assets 這一區有它',!!ASSETS.manifest[L.asset]&&fs.existsSync(path.join(ROOT,L.glb))&&new RegExp('"'+L.zone+'":\\[[^\\]]*'+L.asset.replace('.','\\.')).test(fs.readFileSync(path.join(ROOT,'src/data/zone_assets.js'),'utf8')),L.glb); } }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);

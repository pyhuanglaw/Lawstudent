// 花序 Flower Notes（公館 G11 的雙層花藝店；FLOWER-NOTES-ART-1110，X325；LAWWW2 帳號 A 2026-11-10）的導航（不需要瀏覽器）：
// 在 Node 裡建出遊戲真正的公館（gongguan）與花序（flower_notes），用引擎真正的找路＋移動碰撞（E.simWalk：走路、跑步＋低幀率）檢查：
//   公館：G11 門口有「進入花序」、站得住；從花序出來的位置站得住、離門口互動點的處理
//   花序：兩層導航；入口 → 樓梯（往北）→ 二樓教室（第 1 層、高 3.9）；二樓 → 一樓；樓梯頂端在第 0 層站不住；
//         每一個座位走得到；每一個互動點、每一個「看」的位置站得住、走得到；家具站不進去；店員的位置在櫃檯後面
// 這是模擬（證明路走得通、高度對），不是真實玩家流程（D131）。用法：node tests/flower_notes_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const need=['src/data/flower_notes_layout.js','src/flower_notes3d.js'].filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(need.length){ check('0. 花序的檔案在',false,need.join(' ')); console.log('FAILED: '+fails); process.exit(1); }
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/flower_notes_layout.js','src/flower_notes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|FN3|LINZE_LAYOUT|CLASSROOM_LAYOUT|FLOWER_NOTES_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt,speed)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30,speed});
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.8],[0.1,4.8]]){ const r=sim(a,b,dt,sp); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return {ok:true}; };
const fmt=r=>JSON.stringify(r).slice(0,200);
const stand=(x,z,lv,r)=>E.canStand(x,z,r==null?0.32:r,lv|0);
function standNear(it){ const R=Math.min(it.radius||it.r||1,1.2), lv=it.lv|0; if(stand(it.x,it.z,lv)) return [it.x,it.z,lv]; for(let r=0.15;r<=R-0.1;r+=0.15) for(let a=0;a<16;a++){ const x=it.x+Math.cos(a/16*Math.PI*2)*r, z=it.z+Math.sin(a/16*Math.PI*2)*r; if(stand(x,z,lv)) return [x,z,lv]; } return null; }
function approach(seat){ const yaw=seat.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lv=seat.lv|0; for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=seat.x+dx, z=seat.z+dz; if(stand(x,z,lv,0.3)) return [x,z,lv]; } return null; }
const L=FLOWER_NOTES_LAYOUT, Y1=L.floors[1].y, T=L.stair;
check('0. Z3.ZONES.flower_notes 有登記；index.html 載入配置和區域',!!Z3.ZONES.flower_notes&&/src\/data\/flower_notes_layout\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8'))&&/src\/flower_notes3d\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8')));
check('0. 樓梯的數字對得起來：階數 × 階高＝樓高、階數 × 踏面＝水平長度',Math.abs(T.risers*T.rise-Y1)<1e-6&&Math.abs(T.risers*T.tread-(T.zBottom-T.zTop))<1e-6,`${T.risers}×${T.rise}＝${(T.risers*T.rise).toFixed(3)}；${(T.risers*T.tread).toFixed(2)}／${(T.zBottom-T.zTop).toFixed(2)}`);

// ---------- 公館：G11 門口 ----------
{ const z=loadZone('gongguan'); const door=E.interactables.find(i=>i.exit&&i.exit.to==='flower_notes');
  check('1. 公館 G11 門口有「進入花序」（exit → flower_notes），進去站在一樓門內',!!door&&door.exit.spawn.x===L.spawn.x&&door.exit.spawn.z===L.spawn.z,door?`(${door.x},${door.z}) ${door.label}`:'沒有');
  const b=(z.buildings||[]).find(q=>q.userData&&q.userData.ggShop==='G11');
  check('1. 門口在 G11 那一棟的正前面（騎樓裡）',!!door&&!!b&&Math.abs(door.x-b.position.x)<0.05&&door.z>19&&door.z<22.2,b?`樓 x ${b.position.x}`:'找不到 G11');
  if(door){ const p=standNear(door); check('1. 門口站得住',!!p,JSON.stringify(p));
    const o=[FN3.GG.cx,FN3.GG.outZ,0]; check('1. 從花序出來站的地方站得住（G11 門前的人行道）、走得回門口',stand(o[0],o[1],0)&&!!p&&walk(o,p).ok,JSON.stringify(o)); } }

// ---------- 舊花攤拿掉、G11 門前沒有柱子（B 件）----------
{ const z=loadZone('gongguan'); const stall=E.interactables.filter(i=>i.kind==='gg_flower'), cx=FN3.GG.cx;
  check('1b. 公館沒有舊花攤了：沒有 kind gg_flower 的互動點、資產清單沒有 bldg.gg_flower_stall、原本攤子的位置 (−47, 11.7) 走得過去',!stall.length&&!ASSETS.manifest['bldg.gg_flower_stall']&&stand(-47,11.7,0)&&!fs.existsSync(path.join(ROOT,'assets/models/env/second_ai/gg_flower_stall.glb')),stall.map(i=>i.label).join(' '));
  check('1b. G11 店門正前面沒有騎樓柱（中間那根拿掉；兩邊分界的柱子照舊）',stand(cx,19.3,0)&&stand(cx,20.2,0)&&!stand(cx-5,19.3,0),'cx '+cx);
  let J=null; try{ J=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gongguan_shops.props.json'),'utf8')); }catch(e){}
  let imgs=[]; try{ const d=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gongguan_shops.glb')), jl=d.readUInt32LE(12); imgs=(JSON.parse(d.slice(20,20+jl).toString('utf8')).images||[]).map(i=>i.name); }catch(e){}
  const src=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/textures/gen/gg_fronts_atlas.json'),'utf8');
  check('1b. 公館店面街的貼圖集有花序外觀（招牌、二樓、櫥窗、門）和三間的招牌（安泰、汀州鮮果、榮恩典）',['ggfn_sign','ggfn_up','ggfn_winl','ggfn_door','ggfn_winr','ggantai_sign','ggfruit_sign','ggrong_sign'].every(k=>src.includes('"'+k+'"'))&&imgs.some(n=>/gg_fronts_atlas/.test(n)),imgs.filter(n=>/fronts/.test(n)).join(' ')); }

// ---------- 花序 ----------
{ const z=loadZone('flower_notes'); const N0=z.levels[0], N1=z.levels[1], SP=[L.spawn.x,L.spawn.z,0];
  check('2. 兩層導航格（第 1 層地板 3.9）、同尺寸同原點',z.levels.length===2&&N1.y0===Y1&&N0.cols===N1.cols&&N0.rows===N1.rows&&N0.ox===N1.ox&&N0.oz===N1.oz);
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='gongguan');
  check('2. 入口出生點站得住；「離開花序」在門口、回到公館 G11 門前',stand(SP[0],SP[1],0)&&!!ex&&!!standNear(ex)&&ex.exit.spawn.x===FN3.GG.cx&&ex.exit.spawn.z===FN3.GG.outZ,ex?`距離 ${Math.hypot(SP[0]-ex.x,SP[1]-ex.z).toFixed(2)}`:'');
  const up=[-1.0,-4.0,1], sx=(T.x0+T.x1)/2;
  { const r=walk(SP,up); check('3. 一樓入口 → 樓梯 → 二樓教室（走路、跑步＋低幀率）',r.ok,fmt(r)); const r2=walk(up,SP); check('3. 二樓教室 → 一樓入口',r2.ok,fmt(r2)); }
  { const r=sim(SP,up,1/30,1.8); const ys=(r.path||r.pts||[]); check('3. 走到二樓以後在第 1 層、高度＝3.9',r.ok&&(r.lv===1||r.lv===undefined)&&(r.y===undefined||Math.abs(r.y-Y1)<0.05),fmt({lv:r.lv,y:r.y})); }
  check('3. 樓梯頂端在第 0 層站不住（一樓不能直接走進去）；樓梯中段在一樓高度不是 0',!stand(sx,T.zTop+0.2,0)&&N0.heightAt&&Math.abs(N0.heightAt(sx,(T.zTop+T.zBottom)/2)-Y1/2)<0.25,N0.heightAt?String(N0.heightAt(sx,(T.zTop+T.zBottom)/2)):'沒有 heightAt');
  check('3. 樓梯西側的欄杆擋住（不能從旁邊走上樓梯）；二樓的樓梯開口不能從教室直接走下去',!stand(T.railX-0.05,-2,0)&&!stand(T.railX-0.05,-2,1));
  check('3. 二樓南緣的玻璃欄杆：欄杆外（挑高區）在第 1 層站不住',!stand(0,L.upper.railZ+0.6,1)&&!stand(-3,3,1)&&stand(0,L.upper.railZ-0.8,1));
  { const bad=[]; for(const q of L.seats1){ const a=approach({x:q.x,z:q.z,yaw:q.yaw,lv:1}); if(!a||!walk(up,a).ok) bad.push(q.id); } check('4. 二樓十二個座位都有「坐下」、走得到',E.interactables.filter(i=>i.fnSeat).length===12&&!bad.length,bad.join(' ')); }
  { const bad=[]; for(const it of E.interactables){ const p=standNear(it); if(!p||!walk(it.lv?up:SP,p).ok) bad.push(it.label+'@'+it.x+','+it.z); } check('4. 每一個互動點旁邊站得住、走得到',!bad.length,bad.join(' ')||E.interactables.length+' 個'); }
  { const bad=[]; for(const q of L.looks){ const p=standNear(q); if(!p||!walk(q.lv?up:SP,p).ok) bad.push(q.id); } check('4. 配置裡每一個「看」的位置站得住、走得到（句子等 AA）',!bad.length&&z.fnLooks===L.looks,bad.join(' ')); }
  { const buy=E.interactables.find(i=>i.kind==='gg_flower'), C=L.counter; check('5. 買花的互動點在收銀櫃檯前（kind gg_flower，LAWWW 接）；店員站在櫃檯後面、站得住',!!buy&&buy.x<C.x0&&z.fnClerk.x>C.x1&&stand(z.fnClerk.x,z.fnClerk.z,0),buy?`(${buy.x},${buy.z})`:''); }
  { const inside=[]; for(const lv of [0,1]) for(const b of FN3.blocks(L,lv)) if(stand(b[0],b[1],lv,0.2)) inside.push(lv+':'+b.join('/')); check('5. 家具裡面站不住（展示台、櫃檯、花台、冷藏櫃、桌子…）',!inside.length,inside.slice(0,4).join(' ')); }
  { const d=L.display; check('5. 中央展示台四周繞得過去（入口 → 展示台後面 → 冷藏花櫃）',walk(SP,[d.x,d.z-d.d/2-0.8,0]).ok&&walk(SP,[0.1,-5.4,0]).ok&&walk(SP,[-3.4,-2.6,0]).ok); }
  check('6. 樓板資料給鏡頭（zone.slabs）扣掉樓梯開口；點樓梯＝走完這一跑（stairEnds）',(z.slabs||[]).length>=2&&z.walkMeshes.some(m=>m.userData.stairEnds),String((z.slabs||[]).length)); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);

// 騎腳踏車的系統（src/bike3d.js）：上車、下車、停車、換區域、存檔、輪子和踏板——不需要瀏覽器。
// 使用者：「我應該要可以騎腳踏車」、路上的騎士要真的踩踏板；車是 LAWWW2 的 bike_ride.glb（VISUAL_REVIEW（second_ai）第 19 節）。
// 車的節點照 GLB 檔裡的節點表建（名稱、父子關係、原點、原本的旋轉都一樣；不載入網格）。
// 修改前（沒有 bike3d.js）：BIKE 不存在，第 2 項以後全部失敗。
// 用法：node tests/bike_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const btn={cls:new Set(['hide']),classList:{toggle(c,on){ if(on) btn.cls.add(c); else btn.cls.delete(c); }}};
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:id=>id==='btnBike'?btn:null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/library_layout.js','src/library3d.js','src/bike3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LIBRARY_LAYOUT|L3|PROPS|CHAR|BIKE)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
// ---- 車：照 GLB 的節點表建 ----
const glb=fs.readFileSync(path.join(ROOT,'assets/models/env/bike_ride.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString());
const objs=J.nodes.map(n=>{ const o=new THREE.Object3D(); o.name=n.name; if(n.translation) o.position.fromArray(n.translation); if(n.rotation) o.quaternion.fromArray(n.rotation); return o; });
J.nodes.forEach((n,i)=>{ for(const c of n.children||[]) objs[i].add(objs[c]); }); const bikeScene=new THREE.Group(); for(const i of J.scenes[0].nodes) bikeScene.add(objs[i]);
const frameMat=new THREE.MeshStandardMaterial({color:'#7a8f7e'}); frameMat.name='ride_frame'; objs.find(o=>o.name==='frame').add(new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),frameMat));   /* 車架的材質（GLB 裡的名稱 ride_frame）：路上的騎士改色用 */
{ const nm=n=>J.nodes.findIndex(q=>q.name===n), kids=n=>(J.nodes[nm(n)].children||[]).map(i=>J.nodes[i].name).sort().join(',');
  { const fk=kids('frame').split(',');   /* 2026-10-16 載妹墊（LAWWW2-B aed5e46、4c7feb7）：frame 底下多了 rear_cushion 和乘客的定位節點，原本的樞紐不變 */
  check('1 GLB 的節點：frame 底下 crank、fork、wheel_r（＋載妹墊 rear_cushion、passenger_side／astride）；fork 底下 wheel_f；crank 底下兩個踏板',['crank','fork','wheel_r','rear_cushion','passenger_side','passenger_astride'].every(k=>fk.includes(k))&&kids('fork')==='wheel_f'&&kids('crank')==='pedal_l,pedal_r',J.nodes.map(n=>n.name).join(',')); } }
ASSETS.loadOne=k=>k==='prop.bike_ride'?Promise.resolve({scene:bikeScene}):Promise.reject(new Error('no '+k));
// ---- 遊戲的最小替身：區域載入、玩家、GM ----
let toasts=[]; const G={zone:'campus',day:5,hour:15,flags:{}}; const GM={E,G,toast:t=>toasts.push(t)};
const P={obj:new THREE.Group(),lv:0,radius:0.32,pose:'idle'}; E.player=P; E.scene.add(P.obj);
function loadZone(id,sp){ if(E.zone&&E.zone.group.parent) E.scene.remove(E.zone.group); E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
  const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; E.zone=z; E.scene.add(z.group); E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null; E.indoor=!!Z3.ZONES[id].indoor;
  const s=sp||z.spawn; P.obj.position.set(s.x,0,s.z); P.obj.rotation.set(0,s.yaw||0,0); P.lv=s.lv|0; P.path=null; P.pose='idle'; return z; }
async function enter(to,sp,opts){ BIKE.beforeEnter(GM,to,opts||{}); loadZone(to,sp); G.zone=to; P.pose='idle'; P.idlePose='idle'; BIKE.afterEnter(GM,to); await new Promise(r=>setTimeout(r,0)); await new Promise(r=>setTimeout(r,0)); }
const bikeOn=()=>P.obj.children.find(o=>o.name==='bike_ride'), parkedIt=()=>E.interactables.find(i=>i.bike), parkedObj=()=>E.zone.group.children.find(o=>o.name==='bike_ride');
const step=(dist,turn,n)=>{ for(let i=0;i<n;i++){ P.obj.rotation.y+=turn/n; P.obj.position.x+=Math.sin(P.obj.rotation.y)*dist/n; P.obj.position.z+=Math.cos(P.obj.rotation.y)*dist/n; BIKE.tick(GM,1/30); } };
(async()=>{
  check('BIKE 存在',typeof BIKE==='object'&&!!BIKE.mount);
  // ---- 2 宿舍門口的車 ----
  await enter('campus',{x:20,z:54,yaw:Math.PI});
  const s=G.bike, door=E.interactables.find(i=>i.exit&&i.exit.to==='dorm');
  check('2 舊存檔／新遊戲沒有 G.bike：車停在宿舍門口（站得住、和「回宿舍」的範圍不重疊）',!!s&&s.zone==='campus'&&!s.riding&&E.canStand(s.x,s.z,0.45,0)&&!!door&&Math.hypot(s.x-door.x,s.z-door.z)>door.radius+1.3,JSON.stringify(s));
  check('2 停著的車擺在校園、有「騎腳踏車」',!!parkedObj()&&!!parkedIt()&&parkedIt().label==='騎腳踏車'&&Math.hypot(parkedObj().position.x-s.x,parkedObj().position.z-s.z)<1e-6);
  await new Promise(r=>setTimeout(r,1700));
  check('2b 第一次看到自己的車（第三天以後）：告訴玩家車在宿舍門口、怎麼騎（使用者 10-14「我還是不能騎腳踏車」；只說一次）',toasts.some(t=>/宿舍門口東邊停著你的腳踏車/.test(t))&&G.flags.BIKE_TIP===true,toasts.join('／'));
  // ---- 3 上車：先走過去 ----
  P.obj.position.set(s.x-1.0,0,s.z-0.6);
  const r1=BIKE.mount(GM);
  check('3 離車 1 m 按「騎腳踏車」：先走過去（有路線、還沒上車）',r1===false&&!!P.path&&P.path.length>0&&!P.riding,JSON.stringify(P.path&&P.path.slice(-1)));
  { const end=P.path[P.path.length-1]; P.obj.position.set(end[0],0,end[1]); const f=P.onArrive; P.path=null; P.onArrive=null; if(f) f(); }
  check('3 走到車旁邊：上車（車掛在玩家底下、姿勢 ride、停著的車和互動點拿掉、出現「下車」）',P.riding&&!!bikeOn()&&P.pose==='ride'&&!parkedIt()&&!parkedObj()&&G.bike.riding&&!btn.cls.has('hide'));
  check('3 上車的位置、方向＝車停的位置、方向',Math.hypot(P.obj.position.x-s.x,P.obj.position.z-s.z)<1e-6&&Math.abs(P.obj.rotation.y-s.yaw)<1e-6);
  // ---- 4 騎：輪子、曲柄、踏板、把手、傾斜 ----
  const parts={}; bikeOn().traverse(o=>{ parts[o.name]=o; });
  step(2,0,40);
  { const d=BIKE.debug(); check('4 騎 2 m：輪子轉 2/0.333 rad、曲柄轉輪子的 0.45 倍',Math.abs(d.wheel-2/0.333)<1e-3&&Math.abs(d.crank-2/0.333*0.45)<1e-3,JSON.stringify(d)); }
  { E.scene.updateMatrixWorld(true); const qf=new THREE.Quaternion(), qp=new THREE.Quaternion(); parts.frame.getWorldQuaternion(qf); let worst=0; for(const n of ['pedal_r','pedal_l']){ parts[n].getWorldQuaternion(qp); worst=Math.max(worst,qf.angleTo(qp)); }
    const ax=new THREE.Vector3(1,0,0).applyQuaternion(parts.wheel_r.quaternion); check('4 踏板跟著曲柄轉、自己保持水平（和車架同方向）；後輪繞自己的 x 軸轉',worst<1e-4&&ax.distanceTo(new THREE.Vector3(1,0,0))<1e-6,'踏板偏 '+worst.toExponential(1)); }
  check('4 P.ride 給人物的曲柄角度、握點（rideIK 用）',!!P.ride&&Math.abs(P.ride.crank-BIKE.debug().crank)<1e-9&&P.ride.grips&&P.ride.grips.length===2);
  step(4,0.9,40);
  { const d=BIKE.debug(); check('4 往左轉（yaw 變大）：把手往左（+）、車身往左傾（rotation.z < 0），都在上限內',d.steer>0.02&&d.steer<=0.2201&&P.obj.rotation.z<-0.01&&P.obj.rotation.z>=-0.2001,JSON.stringify({steer:d.steer,lean:P.obj.rotation.z})); }
  { const q0=parts.fork.userData.q0, qn=parts.fork.quaternion; const ax=new THREE.Vector3(0,1,0).applyQuaternion(q0); const rel=q0.clone().invert().multiply(qn); const a=2*Math.acos(Math.min(1,Math.abs(rel.w)));
    check('4 把手繞轉向軸轉（前叉原本的旋轉保留：本地 +Y＝往上往後 20°）',Math.abs(ax.y-0.9397)<0.01&&Math.abs(ax.z+0.342)<0.01&&Math.abs(a-BIKE.debug().steer)<1e-3); }
  // ---- 5 下車 ----
  const pb=P.obj.position.clone(), yb=P.obj.rotation.y;
  btn.onclick=null; BIKE.bindUI(GM); btn.onclick();
  const lx=Math.cos(yb), lz=-Math.sin(yb);
  check('5 按「下車」：車停在下車的地方、方向不變；人往左邊讓開 0.65 m；按鈕收起來',!P.riding&&!bikeOn()&&!!parkedObj()&&Math.hypot(parkedObj().position.x-pb.x,parkedObj().position.z-pb.z)<1e-6&&Math.abs(parkedObj().rotation.y-yb)<1e-6&&Math.hypot(P.obj.position.x-(pb.x+lx*0.65),P.obj.position.z-(pb.z+lz*0.65))<1e-6&&btn.cls.has('hide')&&P.obj.rotation.z===0&&P.pose==='idle');
  check('5 存檔裡的車：位置、方向、沒在騎',G.bike.zone==='campus'&&!G.bike.riding&&Math.abs(G.bike.x-pb.x)<1e-6&&Math.abs(G.bike.z-pb.z)<1e-6);
  // ---- 6 有人跟著走：不能騎；騎到一半有人開始跟：下車 ----
  /* 2026-10-15 使用者：「腳踏車要可以載人」——一起走的人坐後座（engine3d.js 的 beh 'passenger'），不再擋上車、不再自動下車；不坐後座的（noRide）照舊 */
  E.npcs.push({beh:'follow',obj:new THREE.Object3D()}); P.obj.position.set(G.bike.x,0,G.bike.z); toasts=[];
  check('6 有人跟著一起走：照樣可以上車（他會坐後座）',BIKE.mount(GM)!==false&&P.riding,toasts.join('／'));
  BIKE.tick(GM,1/30); check('6 騎著、有人跟著：不會自動下車',P.riding); E.npcs.length=0; BIKE.dismount(GM);
  E.npcs.push({beh:'follow',noRide:true,obj:new THREE.Object3D()}); P.obj.position.set(G.bike.x,0,G.bike.z); BIKE.mount(GM); BIKE.tick(GM,1/30); check('6 跟著的人不坐後座（noRide）：自動下車',!P.riding&&!!parkedObj()); E.npcs.length=0;
  // ---- 7 劇情開始（busy）：下車 ----
  P.obj.position.set(G.bike.x,0,G.bike.z); BIKE.mount(GM); P.busy=true; BIKE.tick(GM,1/30); check('7 劇情開始（busy）：自動下車',!P.riding&&!!parkedObj()); P.busy=false;
  // ---- 8 樓梯：萬才館大樓梯（第 1 層）——車停在樓梯前 ----
  { let st=null; for(let x=60;x<=120&&!st;x+=0.5) for(let z=-125;z<=-85&&!st;z+=0.5){ const h=E.heightAt(x,z,0); if(h>0.3&&h<0.6&&E.canStand(x,z,0.3,0)&&E.canStand(x,z+2.5,0.45,0)&&E.heightAt(x,z+2.5,0)<0.02) st=[x,z]; }   /* 一樓那一層、高度 0.3～0.6 m 的台階格（萬才館大樓梯：兩層共用），前面 2.5 m 是平地 */
    if(st){ G.bike={zone:'campus',x:st[0],z:st[1]+2.5,yaw:Math.PI,riding:false}; await enter('campus',{x:st[0],z:st[1]+2.5,yaw:Math.PI}); BIKE.mount(GM); step(0.5,0,5); const flat=P.obj.position.clone();
      P.obj.position.set(st[0],0.4,st[1]); BIKE.tick(GM,1/30);
      check('8 騎上樓梯（高度 0.4 m）：自動下車、車停在樓梯前的平地（最後一個平地的位置）、說明',!P.riding&&!!parkedObj()&&Math.hypot(parkedObj().position.x-flat.x,parkedObj().position.z-flat.z)<1e-6&&parkedObj().position.y===0&&toasts.some(t=>/樓梯/.test(t)),JSON.stringify(G.bike)); }
    else check('8 找得到萬才館大樓梯的格子',false); }
  // ---- 9 騎出校門到公館：車跟著過去 ----
  G.bike={zone:'campus',x:-120,z:0,yaw:-Math.PI/2,riding:false}; await enter('campus',{x:-120,z:0,yaw:-Math.PI/2}); BIKE.mount(GM);
  const gate=E.interactables.find(i=>i.exit&&i.exit.to==='gongguan'); await enter('gongguan',gate.exit.spawn);
  check('9 騎著走出校門：到了公館還在騎（車掛在玩家底下、存檔的區域＝公館）',P.riding&&!!bikeOn()&&G.bike.riding&&G.bike.zone==='gongguan'&&!parkedObj()&&!btn.cls.has('hide'));
  // ---- 10 騎到店門口、進店：車停在門口；出來還在 ----
  { const shop=E.interactables.find(i=>i.exit&&i.exit.to==='cvs'); P.obj.position.set(shop.x,0,shop.z+1.2); await enter('cvs',shop.exit.spawn);
    check('10 騎到便利商店門口、進店：車停在公館的門口（站得住）、不在店裡',!P.riding&&!bikeOn()&&G.bike.zone==='gongguan'&&Math.hypot(G.bike.x-shop.x,G.bike.z-(shop.z+1.2))<3.1&&!parkedObj(),JSON.stringify(G.bike));
    const out=E.interactables.find(i=>i.exit&&i.exit.to==='gongguan'); await enter('gongguan',out.exit.spawn);
    check('10 出店：車停在門口、有「騎腳踏車」',!!parkedObj()&&!!parkedIt()&&E.canStand(G.bike.x,G.bike.z,0.45,0));
    { const dd=Math.hypot(G.bike.x-shop.x,G.bike.z-shop.z), ux=(G.bike.x-shop.x)/dd, uz=(G.bike.z-shop.z)/dd, sx=G.bike.x+ux*0.8, sz=G.bike.z+uz*0.8;
      check('10b 車停在門口旁邊、離門 2 m 以上（停在門正前方時，走回車旁按鈕常是「進入便利商店」；v9.7 回歸 2026-10-14）；站在車旁（離門遠的那邊 0.8 m）車比門近',dd>=2&&dd<=3&&Math.hypot(sx-G.bike.x,sz-G.bike.z)<Math.hypot(sx-shop.x,sz-shop.z)-1,JSON.stringify({dd:+dd.toFixed(2)})); } }
  // ---- 11 快速前往室內（離門口很遠）：車停到那棟建築的門外 ----
  { P.obj.position.set(G.bike.x,0,G.bike.z); BIKE.mount(GM); P.obj.position.x-=3; await enter('library_hall');
    const ex=E.interactables.find(i=>i.exit&&BIKE.ok(i.exit.to)); const sp=ex.exit.spawn;
    check('11 騎著用快速前往進總圖：車停到總圖門外（出來的地方旁邊 1.4 m），不是留在公館',!P.riding&&G.bike.zone===ex.exit.to&&Math.abs(Math.hypot(G.bike.x-sp.x,G.bike.z-sp.z)-1.4)<0.01,JSON.stringify(G.bike));
    await enter(ex.exit.to,sp); check('11 走出總圖：車就在門外、站得住、有「騎腳踏車」',!!parkedObj()&&!!parkedIt()&&E.canStand(G.bike.x,G.bike.z,0.45,0),JSON.stringify(G.bike)); }
  // ---- 12 存檔、讀檔 ----
  { P.obj.position.set(G.bike.x,0,G.bike.z); BIKE.mount(GM); const saved=JSON.parse(JSON.stringify(G)); check('12 騎著存檔：存檔裡 riding=true、區域＝校園',saved.bike&&saved.bike.riding&&saved.bike.zone==='campus');
    Object.keys(G).forEach(k=>delete G[k]); Object.assign(G,saved); await enter('campus',{x:P.obj.position.x,z:P.obj.position.z,yaw:0},{fromLoad:true});
    check('12 讀檔：還在騎（只有一台車掛在玩家底下、區域裡沒有停著的車）',P.riding&&P.obj.children.filter(o=>o.name==='bike_ride').length===1&&!parkedObj()&&!btn.cls.has('hide'));
    delete G.bike; BIKE.dismount(GM); delete G.bike; await enter('campus',{x:0,z:0,yaw:0},{fromLoad:true});
    check('12 舊存檔（沒有 bike）：車在宿舍門口、沒在騎',!P.riding&&G.bike&&G.bike.zone==='campus'&&!G.bike.riding&&Math.abs(G.bike.x-25)<1e-6);
    const pa=BIKE.parkedAt(G), pOld=BIKE.parkedAt({day:3}); P.obj.position.set(G.bike.x,0,G.bike.z); BIKE.mount(GM); const pRide=BIKE.parkedAt(G); BIKE.dismount(GM);
    check('12 地圖的綠點（BIKE.parkedAt）：停著＝車的位置；舊存檔＝宿舍門口；騎著＝沒有',!!pa&&pa.zone==='campus'&&Math.abs(pa.x-G.bike.x)<1.0&&!!pOld&&pOld.x===25&&pOld.zone==='campus'&&pRide===null,JSON.stringify({pa,pOld,pRide})); }
  // ---- 13 路上騎腳踏車的人（game3d.js 的 spawnRider → BIKE.rider）----
  { const calls=[]; global.CHAR={animate:(o,dt,st)=>calls.push(st)}; const route=[[0,0],[10,0],[10,10]], rd=new THREE.Object3D();
    const r=BIKE.rider(rd,route,'#8c3b47',1.60); const k=BIKE.scaleFor(1.60); let maxTurn=0, prevYaw=null, maxOff=0; const dt=1/30;
    const segD=(p,a,b)=>{ const vx=b[0]-a[0], vz=b[1]-a[1], t=Math.max(0,Math.min(1,((p.x-a[0])*vx+(p.z-a[1])*vz)/(vx*vx+vz*vz))); return Math.hypot(p.x-(a[0]+vx*t),p.z-(a[1]+vz*t)); };
    for(let i=0;i<150;i++){ r.update(dt); const p=r.obj.position; maxOff=Math.max(maxOff,Math.min(segD(p,route[0],route[1]),segD(p,route[1],route[2]),segD(p,route[2],route[0]))); if(prevYaw!=null) maxTurn=Math.max(maxTurn,Math.abs(Math.atan2(Math.sin(r.obj.rotation.y-prevYaw),Math.cos(r.obj.rotation.y-prevYaw)))/dt); prevYaw=r.obj.rotation.y; }
    const bk=r.obj.children.find(o=>o.name==='bike_ride'); let col=null; if(bk) bk.traverse(o=>{ if(o.isMesh&&o.material.name==='ride_frame') col='#'+o.material.color.getHexString(); });
    check('13 路人騎士：車掛在同一個群組（尺寸照身高 '+k.toFixed(2)+' 倍）、人看得到；車架改成指定的顏色、原本的共用材質不變',!!bk&&Math.abs(bk.scale.x-k)<1e-9&&rd.visible&&col==='#8c3b47'&&('#'+frameMat.color.getHexString())==='#7a8f7e',col);
    const last=calls[calls.length-1]; check('13 人物用 pose ride、給曲柄角度、握點、車的尺寸（rideIK）',!!last&&last.pose==='ride'&&Math.abs(last.ride.crank-r.crank)<1e-9&&last.ride.grips.length===2&&last.ride.scale===k);
    check('13 照路線騎（離路線 < 1 cm）、轉角不瞬間轉向（每秒最多 2 rad）',maxOff<0.01&&maxTurn<=2.0001,`離路線 ${(maxOff*100).toFixed(2)} cm、最快 ${maxTurn.toFixed(2)} rad/s`);
    check('13 輪子照騎的距離轉',Math.abs(r.wheel-r.speed*dt*150/(0.333*k))<1e-6&&Math.abs(r.crank-r.wheel*0.45)<1e-6); }
  // ---- 14 載人騎車（AA_137 第 5 節第 3、5 步；AA_140 G49）：騎 6 秒以後她一句短話（一趟最多一句）；中途按「下車」她說「……我還是走一下好了。」 ----
  { await enter('campus',{x:20,z:54,yaw:Math.PI}); const caps=[]; GM.caption=(w,t)=>caps.push((w||'')+t);
    const oldS=global.STORY, oldSo=global.SOCIAL; let greetN=0; global.STORY=Object.assign({},oldS||{},{ladGreet:(g,id)=>{ greetN++; return '短招呼（'+id+'）'; }}); global.SOCIAL=Object.assign({},oldSo||{},{displayName:id=>id==='heroine_01'?'沈以安':id});
    const her={beh:'passenger',charId:'heroine_01',name:'沈以安',obj:new THREE.Object3D()}; P.obj.position.set(G.bike.x,0,G.bike.z); BIKE.mount(GM); E.npcs.push(her);
    step(30,0,150); const c5=caps.length; step(30,0,150); const c10=caps.length; step(60,0,300);
    check('14 載人騎：騎了 5 秒還沒說、超過 6 秒說一句（她的短招呼池），一趟只說一句',c5===0&&c10===1&&caps.length===1&&caps[0]==='沈以安：短招呼（heroine_01）'&&greetN===1,JSON.stringify({c5,c10,caps}));
    BIKE.manualDismount(GM); check('14 中途按「下車」：她說「……我還是走一下好了。」',!P.riding&&caps[caps.length-1]==='沈以安：……我還是走一下好了。',JSON.stringify(caps));
    E.npcs.length=0; P.obj.position.set(G.bike.x,0,G.bike.z); BIKE.mount(GM); caps.length=0; BIKE.manualDismount(GM); check('14 一個人騎時按「下車」：沒有那一句',caps.length===0);
    global.STORY=oldS; global.SOCIAL=oldSo; }
  { const src=require('fs').readFileSync(require('path').join(__dirname,'..','src/bike3d.js'),'utf8'), g3=require('fs').readFileSync(require('path').join(__dirname,'..','src/game3d.js'),'utf8');
    check('BB-C 10-18：人在臺北的家、經濟系退宿以後不提示宿舍門口的車；經濟系那一年朋友清單不列阿哲、阿凱',/!\(G\.home&&G\.home\.at\)&&!\(F\.Y0_MOVED_OUT&&\(G\.stage\|\|'law'\)==='econ'\)/.test(src)&&/\['zhe','kai','prof_zhou'\]\.includes\(id\)&&\(G\.stage\|\|'law'\)==='law'/.test(g3)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

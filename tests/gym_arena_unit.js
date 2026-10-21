// 新體育館 3F 主球場接成區域（ART-GYM2-INT，LAWWW2 2026-10-21；gym_layout.js 的 arena 段＋gym_arena.glb）——不需要瀏覽器。
// 檢查：1F 樓梯口的「上樓到 3F 主球場」走得到、按了到 gym_arena；3F 出生點站得住、「下樓回大廳」走得到且一落地不在範圍裡；回 1F 的落點站得住、不在「上樓」範圍裡；
//       場地整片走得到（四個角、中圈）；八條看台走道都走得上去（模擬走路到最上面一排，高度 ≈ 5.2 m）；走道兩側的座位、看台前緣的玻璃欄杆走不進去；
//       座位的走近點走得到、坐下的高度＝那一排的平台；畫面上的高度一階一階（走道中途和最上面）、碰撞用連續斜面；鏡頭碰撞（每一排）有建；正式模型有登記。
//       正式模型（自己讀 gym_arena.glb，Node 沒有 fetch）載入以後：鏡頭看得到人（出生點、入口通道、座位、走道、場地邊，鏡頭轉八個方向，鏡頭到頭之間沒有牆、看台、門擋住）；
//       走道的扶手不在人走的地方；入口通道走得到盡頭的門（沒有看不見的牆）；藏著的布置（舞台、典禮、演講、演唱會）的光暈跟著布置藏起來。
// 用法：node tests/gym_arena_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
for(const f of ['src/data/gym_layout.js','src/gym3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (GYM_LAYOUT|GY3)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius(); return z; }
check('1. 有 gym_arena 區域；manifest 有 bldg.gym_arena、檔案在',!!Z3.ZONES.gym_arena&&!!ASSETS.manifest['bldg.gym_arena']&&fs.existsSync(path.join(ROOT,'assets/models/env/second_ai/gym_arena.glb')));
const walk=(a,b,o)=>E.simWalk(a[0],a[1],b[0],b[1],Object.assign({lv0:0,lv1:0,dt:0.1,speed:4.1},o||{}));
{ const z1=loadZone('gym'), sp=[z1.spawn.x,z1.spawn.z]; const up=E.interactables.find(i=>i.exit&&i.exit.to==='gym_arena'); const old=E.interactables.find(i=>/今天不開放/.test(i.label||''));
  const r=up?walk(sp,[up.x,up.z]):null; check('2. 1F：「上樓到 3F 主球場」有、走得到、到 gym_arena；舊的「往 3F 的樓梯（今天不開放）」沒有了',!!up&&!!r&&r.ok&&!old,up?JSON.stringify([up.label,up.x,up.z,r&&(r.reason||'ok')]):'沒有');
  const dn=GY3.ARENA_DOWN; check('3. 從 3F 下來的落點站得住、不在「上樓」的範圍裡（不一落地就出上樓）',E.canStand(dn.x,dn.z,0.32,0)&&!!up&&Math.hypot(dn.x-up.x,dn.z-up.z)>up.radius,JSON.stringify(dn)); }
const z=loadZone('gym_arena'), A=GYM_LAYOUT.arena, G=GY3.arenaGeo(A), sp=[z.spawn.x,z.spawn.z];
const ex=E.interactables.find(i=>i.exit&&i.exit.to==='gym');
check('4. 3F 出生點站得住；「下樓回大廳」走得到；一進來不在出口的範圍裡',E.canStand(sp[0],sp[1],0.32,0)&&!!ex&&Math.hypot(ex.x-sp[0],ex.z-sp[1])>ex.radius&&walk(sp,[ex.x,ex.z]).ok,ex&&JSON.stringify([ex.x,ex.z,ex.radius]));
{ const pts=[[0,-2],[-20.5,-20.5],[20.5,-20.5],[-20.5,15.5],[20.5,15.5]]; const bad=pts.filter(p=>!walk(sp,p).ok); check('5. 場地走得到：中圈、四個角',!bad.length,JSON.stringify(bad)); }
/* 走道：從場地走到最上面一排（d＝DEPTH−0.7：最上面那一階後半貼著走道頂端關著的門，人的半徑 0.32 m 站不到；最上面一排的前半階），高度要接近 TOP（差不到一階）；中途第 5 排後半的畫面高度＝那一排的平台 */
{ const res=[]; for(const s of G.sides) for(const c of s.aisles){ const top=s.at(c,G.DEPTH-0.7), r=walk(sp,top); res.push({side:s.side,c,ok:r.ok,y:r.y,reason:r.reason}); }
  const bad=res.filter(q=>!q.ok||Math.abs(q.y-G.TOP)>G.R); check('6. 八條看台走道都走得上去、走到最上面一排的高度 ≈ '+G.TOP.toFixed(2)+' m',res.length===8&&!bad.length,JSON.stringify(bad.length?bad:res.map(q=>q.y)));
  const s=G.sides[0], c=s.aisles[1], [mx,mz]=s.at(c,4*G.T+0.6), vh=E.nav.visualHeightAt(mx,mz), ch=E.nav.heightAt(mx,mz);
  check('7. 畫面上的高度一階一階（第 5 排後半＝平台 '+(G.H0+4*G.R).toFixed(2)+' m）、碰撞用連續斜面（差不到半階）',Math.abs(vh-(G.H0+4*G.R))<1e-6&&Math.abs(vh-ch)<G.R,`畫面 ${vh.toFixed(3)}、碰撞 ${ch.toFixed(3)}`); }
{ const s=G.sides[0], c=s.aisles[1]; const seatPt=s.at(c+G.AW/2+0.5,3*G.T+0.4), rail=s.at(c+3,-0.1), inStand=s.at(c+3,5);
  check('8. 走道兩側的座位、看台前緣的玻璃欄杆、看台裡面走不進去',!E.canStand(seatPt[0],seatPt[1],0.1,0)&&!E.canStand(rail[0],rail[1],0.1,0)&&!E.canStand(inStand[0],inStand[1],0.1,0)); }
{ const seats=E.interactables.filter(i=>i.seat); const bad=[]; for(const it of seats){ const r=walk(sp,[it.x,it.z]); if(!r.ok) bad.push([it.x,it.z,r.reason]); }
  const yOk=seats.every(it=>{ const s=G.sides.find(q=>q.yaw===it.seat.yaw), d=s.d(it.seat.x,it.seat.z), row=Math.floor(d/G.T); return Math.abs(it.seat.y-(G.H0+row*G.R))<1e-6; });
  check('9. 座位（每條走道 2 個，共 16）：走近點走得到、坐下的高度＝那一排的平台',seats.length===16&&!bad.length&&yOk,seats.length+' 個；'+JSON.stringify(bad)); }
{ const cc=Array.isArray(z.camCols)&&z.camCols[0]?z.camCols[0]:[], n=k=>cc.filter(m=>m.name===k).length;
  check('10. 鏡頭碰撞（zone.camCols）：看台每一排（東、西各 12、南 24）＋看台後牆與上層看台、入口通道兩側的牆、入口上方的橫樑、看台轉角、北牆',n('cam_row')===48&&n('cam_back')===3&&n('cam_upper')>=3&&n('cam_vom')>=2&&n('cam_beam')===1&&n('cam_corner')===2&&n('cam_north')===1,
    JSON.stringify({row:n('cam_row'),back:n('cam_back'),upper:n('cam_upper'),vom:n('cam_vom'),beam:n('cam_beam'),corner:n('cam_corner'),north:n('cam_north'),all:cc.length})); }
/* ---------- 正式模型載入以後（ART-GYM2-INT 第二輪：遊戲內截圖抓到——進場時鏡頭在入口通道盡頭的牆後面、坐在看台高處鏡頭退進看台後牆，整個畫面是一片牆；走道中間的扶手從人身上穿過去；
   通道走到一半被看不見的牆擋住；演唱會燈架藏著、光暈還飄在半空中）---------- */
/* 自己讀 GLB：照節點的名字、父子、TRS、extras（userData）建場景；網格只放位置、索引（射線、頂點檢查用），GPU instancing 的座位不放 */
function glbScene(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0);
    const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  const objs=J.nodes.map(nd=>{ let o;
    if(nd.mesh!=null&&!(nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing)){ const prs=J.meshes[nd.mesh].primitives.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1));
        const m=new THREE.MeshStandardMaterial(); m.name=pr.material!=null?J.materials[pr.material].name:''; return new THREE.Mesh(g,m); });
      if(prs.length===1) o=prs[0]; else { o=new THREE.Group(); for(const q of prs) o.add(q); } }
    else o=new THREE.Object3D();
    o.name=nd.name||''; if(nd.extras) o.userData=JSON.parse(JSON.stringify(nd.extras)); if(nd.translation) o.position.fromArray(nd.translation); if(nd.rotation) o.quaternion.fromArray(nd.rotation); if(nd.scale) o.scale.fromArray(nd.scale); return o; });
  J.nodes.forEach((nd,i)=>{ for(const c of nd.children||[]) objs[i].add(objs[c]); });
  const sc=new THREE.Group(); for(const r of J.scenes[J.scene||0].nodes) sc.add(objs[r]); return sc; }
(async()=>{
  const SC=glbScene(path.join(ROOT,'assets/models/env/second_ai/gym_arena.glb')); let pend=null; const load0=ASSETS.loadOne; ASSETS.loadOne=k=>k==='bldg.gym_arena'?(pend=Promise.resolve({scene:SC})):new Promise(()=>{});
  const zf=loadZone('gym_arena'); await pend; await new Promise(r=>setTimeout(r,0)); ASSETS.loadOne=load0; zf.group.updateMatrixWorld(true);
  check('11. 正式模型接上了（formal）、備用模型藏起來',zf.formal===true&&zf.group.getObjectByName('fallback').visible===false);
  const byMat=k=>{ const out=[]; zf.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name===k) out.push(o); }); return out; };
  /* 擋視線的東西：看台量體、牆、入口通道的牆、深藍色帶、門、深色鋼（入口的出口燈、門框）——玻璃、細欄杆、座位不算 */
  const SOLID=['arena_riser','arena_plaster','arena_vomitory_wall','arena_fascia','arena_door','arena_steel_dark'].flatMap(byMat).map(o=>{ const m=new THREE.Mesh(o.geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})); m.matrixAutoUpdate=false; m.matrix.copy(o.matrixWorld); m.matrixWorld.copy(o.matrixWorld); return m; });
  if(!E.ray) E.ray=new THREE.Raycaster();   /* 引擎的射線在 E.init 才建（Node 不跑 init）*/
  const ray=new THREE.Raycaster(), PITCH=0.38, DIST=Z3.ZONES.gym_arena.camDist, YAWS=[0,1,2,3,4,5,6,7].map(k=>k*Math.PI/4);
  const blockedAt=(tgt,cam)=>{ const d=cam.clone().sub(tgt), L=d.length(); ray.set(tgt,d.normalize()); ray.far=L-0.05; const h=ray.intersectObjects(SOLID,false); return h.length?h[0]:null; };
  const pts=[], G2=GY3.arenaGeo(GYM_LAYOUT.arena), A2=GYM_LAYOUT.arena;
  pts.push(['出生點',zf.spawn.x,0,zf.spawn.z]);
  for(let zz=17.6;zz<40;zz+=1.5){ if(!E.canStand(0,zz,0.32,0)) break; pts.push(['入口通道 z '+zz.toFixed(1),0,0,zz]); }
  for(const it of E.interactables.filter(i=>i.seat)) pts.push(['座位 ('+it.seat.x.toFixed(1)+','+it.seat.z.toFixed(1)+')',it.seat.x,it.seat.y,it.seat.z]);
  for(const s of G2.sides) for(const c of s.aisles) for(const d of [4,G2.DEPTH-0.7]){ const [x,zz]=s.at(c,d); pts.push([s.side+' 走道 '+c+' d '+d.toFixed(1),x,E.nav.heightAt(x,zz),zz]); }
  for(const s of G2.sides) for(const u of [-12,-4,4,12]){ if(s.gap&&u>s.gap[0]-1&&u<s.gap[1]+1) continue; const [x,zz]=s.at(u,-1.2); if(E.canStand(x,zz,0.32,0)) pts.push([s.side+' 看台前 '+u,x,0,zz]); }
  pts.push(['北端',0,0,A2.floor.z0+0.5]);
  const bad=[]; let n=0; const cam=new THREE.Vector3();
  for(const [nm,x,y,zz] of pts) for(const yaw of YAWS){ const tgt=new THREE.Vector3(x,y+1.45,zz); E.followCam(tgt,yaw,PITCH,DIST,0,cam); n++; const h=blockedAt(tgt,cam); if(h) bad.push(nm+' yaw '+(yaw*180/Math.PI).toFixed(0)+'°：'+h.object.geometry.uuid.slice(0,0)+(byMatName(h.object)||'')+' 在 '+h.distance.toFixed(2)+' m'); }
  function byMatName(m){ let k=''; zf.group.traverse(o=>{ if(o.isMesh&&o.geometry===m.geometry) k=o.material.name; }); return k; }
  check('12. 鏡頭看得到人（'+pts.length+' 個位置×8 個方向＝'+n+' 次）：鏡頭到頭之間沒有看台、牆、門擋住（鏡頭碰撞照遊戲的 E.followCam）',!bad.length,bad.length+' 次被擋：'+bad.slice(0,6).join('；'));
  /* 扶手：每條走道中線 ±0.35 m、走道那一階上方 0.15～1.7 m（人的身體）沒有鋼管的頂點 */
  const st=byMat('arena_steel'), v=new THREE.Vector3(); let inBody=0;
  for(const o of st){ const P=o.geometry.attributes.position; for(let i=0;i<P.count;i++){ v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld);
    for(const s of G2.sides){ const d=s.d(v.x,v.z); if(d<-0.42||d>G2.DEPTH) continue; for(const c of s.aisles){ if(Math.abs(s.u(v.x,v.z)-c)>=0.35) continue; const h=v.y-G2.step(d); if(h>0.15&&h<1.7) inBody++; } } } }
  check('13. 走道的扶手不在人走的地方（走道中線 ±0.35 m、身體的高度沒有鋼管）',st.length>0&&inBody===0,'頂點 '+inBody);
  /* 入口通道：畫面上的通道（兩側牆）到哪裡，就走得到哪裡；盡頭有門（下樓回大廳）。走得到的地方離門 0.75 m 以內＝人的半徑 0.32 m＋導航格 0.3 m（再近就碰到門框）；
     原本走到 z 24.1 就被看不見的牆擋住，離畫面上的盡頭 3.1 m */
  let vz=-1e9; for(const o of byMat('arena_vomitory_wall')){ const P=o.geometry.attributes.position; for(let i=0;i<P.count;i++){ v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld); vz=Math.max(vz,v.z); } }
  let dz=null; for(const o of byMat('arena_door')){ const P=o.geometry.attributes.position; for(let i=0;i<P.count;i++){ v.fromBufferAttribute(P,i).applyMatrix4(o.matrixWorld); if(Math.abs(v.x)<1&&Math.abs(v.z-vz)<0.15&&v.y<0.5) dz=dz==null?v.z:Math.min(dz,v.z); } }
  let wz=0; for(let zz=17;zz<vz;zz+=0.05) if(E.canStand(0,zz,0.32,0)) wz=zz;
  const ex2=E.interactables.find(i=>i.exit&&i.exit.to==='gym');
  /* 從通道裡看盡頭（推桿上面、門片中間）：第一個打到的是門片——門片不能被後牆包在裡面（第一次重建時南看台後牆一路蓋過通道，門片在牆裡、只露出門框和推桿）*/
  const ALL=[]; zf.group.traverse(o=>{ if(o.isMesh&&o.visible!==false&&o.material&&/^arena_/.test(o.material.name)&&o.material.name!=='arena_glass'){ const m=new THREE.Mesh(o.geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})); m.matrixAutoUpdate=false; m.matrix.copy(o.matrixWorld); m.matrixWorld.copy(o.matrixWorld); m.userData.mat=o.material.name; ALL.push(m); } });
  const hitMat=(x,y)=>{ ray.set(new THREE.Vector3(x,y,vz-2.5),new THREE.Vector3(0,0,1)); ray.far=4; const h=ray.intersectObjects(ALL,false); return h.length?h[0].object.userData.mat:null; };
  const seen=[[-0.5,1.6],[0.5,1.6],[-0.5,0.6],[0.5,0.6]].map(([x,y])=>hitMat(x,y));
  check('14. 入口通道：畫面上的通道到 z '+vz.toFixed(2)+'，盡頭有門（從通道看得到門片）；走得到門前 0.75 m 以內（沒有看不見的牆）；「下樓回大廳」在門前',dz!=null&&seen.every(m=>m==='arena_door')&&wz>vz-0.75&&!!ex2&&Math.abs(ex2.z-vz)<1.0&&walk([zf.spawn.x,zf.spawn.z],[ex2.x,ex2.z]).ok,
    JSON.stringify({通道到:+vz.toFixed(2),門:dz==null?null:+dz.toFixed(2),看到:seen,走得到:+wz.toFixed(2),下樓:ex2&&[ex2.x,ex2.z]}));
  /* 光暈：全場那一批不含藏著的布置；布置自己那一批掛在布置底下（布置藏著就不畫）*/
  const under=(o,k)=>{ for(let p=o.parent;p;p=p.parent) if(p.name===k) return true; return false; };
  let all=0, inSet=0; zf.group.traverse(o=>{ if(o.userData&&o.userData.glow){ all++; if(/^SET_/.test(o.parent&&o.parent.name||'')||['SET_STAGE','SET_CEREMONY','SET_LECTURE','SET_CONCERT'].some(k=>under(o,k))) inSet++; } });
  const zb=zf.group.getObjectByName('gym_arena_glows'), con=zf.group.getObjectByName('SET_CONCERT'); let cb=null; if(con) con.traverse(o=>{ if(o.userData&&o.userData.glowBatch) cb=o; });
  check('15. 光暈：全場那一批 '+(all-inSet)+' 個（不含藏著的布置的 '+inSet+' 個）；演唱會的光暈另外一批、掛在演唱會布置底下（布置藏著就不畫）',!!zb&&zb.userData.glowBatch.items.length===all-inSet&&inSet>0&&!!cb&&cb.userData.glowBatch.items.length>0&&con.visible===false,
    JSON.stringify({全場:zb&&zb.userData.glowBatch.items.length,應該:all-inSet,演唱會:cb&&cb.userData.glowBatch.items.length}));
  console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

// 118 巷九間店的室內：天花板單面朝下、店門外兩側的鄰居店面（LAWWW2 2026-10-22）——不需要瀏覽器。
// 修改前（開發分支 774f49c7）的毛病：
//   ①天花板（l118_<店>_ceiling）是雙面、朝上；廚房的天花板在頂點色網格裡也是雙面：雙指拉遠（室內最遠 6 m）、往上拖（俯角最大 1.05）時，鏡頭在天花板上面，畫面上半是一大片白。
//   ②進門時跟隨鏡頭在騎樓（店面外 2 m 多）：門靠側牆的店（蛋包飯、自助餐、家常菜、慢讀咖啡），畫面一側是店外的空白（天空的下半），最多三分之一。
// 改法：
//   正式模型（tools/blender/env_second/lane118_shops.py）：天花板、廚房天花板單面朝下；騎樓地往兩側延伸；兩側貼上鄰居店面（WALL_W_nb_view／WALL_E_nb_view，
//     118 巷街景 GLB 拍的：tools/blender/env_second/lane118_neighbors.py），歸左右牆的組、帶 at（淡出判斷點＝牆線）。
//   src/zones3d.js attachRoomGLB：有 at 的牆用 at 當淡出判斷點（鄰居店面卡的外框中心在牆線外 2.3 m：用外框中心的話，鏡頭在牆線外 2.3 m 以內不會淡出、會擋住人）。
// 這裡在 Node 建出遊戲真正的九間店（l118_shops3d.js 的 build＋attachRoomGLB＋fadeWalls），正式模型照 GLB 的網格、材質單雙面、節點的 extras 建：
//   A 天花板：單面、每個面朝下；天花板那一層沒有雙面的大片水平面（單一三角形 > 0.3 m²：修改前的天花板一片 26 m²；日光燈燈箱的頂面一片不到 0.1 m²，從上面看就是燈具，不算）。
//   B 鄰居店面：左右各一張、歸左右牆、at 在牆線上、單面朝騎樓。
//   C 進門那一刻（出生點、鏡頭在門那一側）、靠兩側前角站：畫面射線（32×14）打不到任何東西（＝店外的空白）不超過 2%。
//   D 拉遠 6 m、往上拖到俯角 0.7、1.05：沒有射線打在天花板的上面。
//   E 鄰居店面不擋人：店裡每 0.8 m 一點、8 個方向的跟隨鏡頭，鏡頭到頭、腰的線不會穿過「沒有淡出」的鄰居店面。
// 用法：node tests/l118_arcade_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|L118_SHOP_LAYOUTS|L118S)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
/* 正式模型：照 GLB 的節點（名字、extras、位移）、網格、材質（名字、單雙面）建 three.js 物件（遊戲的 GLTFLoader 也是這樣：extras → userData）*/
function glbRoot(rel){ const b=fs.readFileSync(path.join(ROOT,rel)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), off=20+n, bin=b.slice(off+8,off+8+b.readUInt32LE(off));
  const acc=i=>{ const a=j.accessors[i], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), nc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], ct=a.componentType, cs={5126:4,5125:4,5123:2,5121:1}[ct], st=bv.byteStride||nc*cs, out=new (ct===5126?Float32Array:Uint32Array)(a.count*nc);
    for(let k=0;k<a.count;k++) for(let c=0;c<nc;c++){ const p=o+k*st+c*cs; out[k*nc+c]=ct===5126?bin.readFloatLE(p):ct===5125?bin.readUInt32LE(p):ct===5123?bin.readUInt16LE(p):bin.readUInt8(p); } return out; };
  const mats={}, mat=i=>mats[i]||(mats[i]=new THREE.MeshStandardMaterial({name:j.materials[i].name,side:j.materials[i].doubleSided?THREE.DoubleSide:THREE.FrontSide}));
  const root=new THREE.Group();
  const walk=(i,parent)=>{ const nd=j.nodes[i]; let obj;
    if(nd.mesh!=null){ const prs=j.meshes[nd.mesh].primitives, ms=prs.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1)); return new THREE.Mesh(g,pr.material!=null?mat(pr.material):new THREE.MeshStandardMaterial()); });
      if(ms.length===1) obj=ms[0]; else { obj=new THREE.Group(); ms.forEach((m,k)=>{ m.name=(nd.name||'')+'_'+k; obj.add(m); }); } }
    else obj=new THREE.Group();
    obj.name=nd.name||''; Object.assign(obj.userData,JSON.parse(JSON.stringify(nd.extras||{})));
    if(nd.matrix) obj.applyMatrix4(new THREE.Matrix4().fromArray(nd.matrix)); else { if(nd.translation) obj.position.fromArray(nd.translation); if(nd.rotation) obj.quaternion.fromArray(nd.rotation); if(nd.scale) obj.scale.fromArray(nd.scale); }
    parent.add(obj); for(const c of nd.children||[]) walk(c,obj); };
  for(const r of j.scenes[j.scene||0].nodes) walk(r,root);
  return root; }
let FAKE=null; ASSETS.loadOne=k=>FAKE&&FAKE[k]?Promise.resolve({scene:FAKE[k]}):new Promise(()=>{});
const visible=o=>{ for(let q=o;q;q=q.parent) if(!q.visible) return false; return true; };
const PI=Math.PI, PITCH=0.38, RC=new THREE.Raycaster();
const camAt=(L,px,pz,yaw,pitch,dist)=>{ const tgt=new THREE.Vector3(px,1.45,pz), pos=new THREE.Vector3(); E.followCam(tgt,yaw,pitch,dist,0,pos); if(pos.y<0.6) pos.y=0.6;
  const cam=new THREE.PerspectiveCamera(46,844/390,0.1,200); cam.position.copy(pos); cam.lookAt(px,1.30,pz); cam.updateMatrixWorld(true); return cam; };
function fade(z,cam,px,pz){ z.fadeWalls(cam,new THREE.Vector3(px,0,pz)); for(const w of z.walls) w.visible=w.material.opacity>0.5; }   /* 和 engine3d.js 的 hideFaded 一樣 */
function frame(z,cam,px,pz){ fade(z,cam,px,pz); z.group.updateMatrixWorld(true); const ms=[]; z.group.traverse(o=>{ if(o.isMesh&&visible(o)) ms.push(o); });   /* 區域裡真的接上去的那一份（l118_shops3d.js 接的是 clone）*/
  let none=0, ceilTop=0, n=0; for(let iy=0;iy<14;iy++) for(let ix=0;ix<32;ix++){ RC.setFromCamera(new THREE.Vector2(-1+(ix+0.5)/16,-1+(iy+0.5)/7),cam); RC.near=0.1; RC.far=150;   /* near＝鏡頭的近裁切面（0.1 m）：貼在鏡頭上的東西畫面上看不到 */ const h=RC.intersectObjects(ms,false)[0]; n++;
    if(!h){ none++; continue; } if(/ceiling$/.test(h.object.material.name)&&h.point.y<cam.position.y-0.01) ceilTop++; }
  return {none:none/n, ceilTop:ceilTop/n}; }
(async()=>{
  const IDS=Object.keys(L118_SHOP_LAYOUTS);
  check('九間店（L118_SHOP_LAYOUTS、Z3.ZONES.l118_*、E.followCam）',IDS.length===9&&IDS.every(id=>!!Z3.ZONES['l118_'+id])&&typeof E.followCam==='function',IDS.join('、'));
  for(const id of IDS){ const L=L118_SHOP_LAYOUTS[id], B=L.bounds, H=L.h||3.2, X0=B.x0, X1=B.x1, Z1=B.z1, dist=L.cam_dist||4.2, rel='assets/models/env/second_ai/l118_'+id+'.glb';
    const root=glbRoot(rel); FAKE={['bldg.l118_'+id]:root};
    E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
    const z=Z3.ZONES['l118_'+id].build(E); E.zone=z; await new Promise(r=>setTimeout(r,0)); z.group.updateMatrixWorld(true);
    const tag=L.name+'（'+id+'）';
    check(tag+'：正式模型接上了（attachRoomGLB）',z.formal===true);
    // A 天花板
    const ce=[]; root.traverse(o=>{ if(o.isMesh&&/ceiling$/.test(o.material.name)) ce.push(o); });
    const down=m=>{ const p=m.geometry.attributes.position, ix=m.geometry.index, a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3(); for(let t=0;t<ix.count;t+=3){ a.fromBufferAttribute(p,ix.getX(t)); b.fromBufferAttribute(p,ix.getX(t+1)); c.fromBufferAttribute(p,ix.getX(t+2)); const nn=b.sub(a).cross(c.sub(a)).normalize(); if(nn.y>-0.99) return false; } return true; };
    check(tag+'：天花板（含廚房）單面、朝下',ce.length>0&&ce.every(m=>m.material.side===THREE.FrontSide&&down(m)),ce.map(m=>m.material.name+(m.material.side===THREE.FrontSide?'單面':'雙面')+(down(m)?'朝下':'不是朝下')).join('、'));
    let dsTop=0, dsMax=0; root.traverse(o=>{ if(!o.isMesh||o.material.side!==THREE.DoubleSide) return; const p=o.geometry.attributes.position, ix=o.geometry.index, a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3();
      for(let t=0;t<ix.count;t+=3){ a.fromBufferAttribute(p,ix.getX(t)); b.fromBufferAttribute(p,ix.getX(t+1)); c.fromBufferAttribute(p,ix.getX(t+2)); if(Math.min(a.y,b.y,c.y)<H-0.02) continue; const cr=b.clone().sub(a).cross(c.clone().sub(a)); if(Math.abs(cr.y)>0.97*cr.length()){ dsTop+=cr.length()/2; dsMax=Math.max(dsMax,cr.length()/2); } } });
    check(tag+'：天花板那一層沒有雙面的大片水平面（單一三角形 ≤ 0.3 m²）',dsMax<=0.3,'最大一片 '+dsMax.toFixed(2)+' m²、合計 '+dsTop.toFixed(1)+' m²');
    // B 鄰居店面
    const nb={}; z.group.traverse(o=>{ const m=/^WALL_([WE])_nb_view$/.exec(o.name); if(m&&o.isMesh) nb[m[1]]=o; });   /* 接上去的那一份：dir 已經換成 Vector3、at 照 GLB */
    const nbOk=s=>{ const o=nb[s]; if(!o) return false; const at=o.userData.at, wx=s==='W'?X0:X1; return Array.isArray(at)&&Math.abs(at[0]-wx)<0.01&&o.material.side===THREE.FrontSide&&o.userData.dir&&Math.abs(o.userData.dir.x-(s==='W'?1:-1))<1e-6&&z.walls.includes(o)&&Math.abs(o.userData.center.x-wx)<0.01; };   /* 在淡出清單裡、淡出判斷點在牆線上（attachRoomGLB 讀 at）*/
    check(tag+'：左右兩張鄰居店面（歸左右牆、at 在牆線上、單面）',nbOk('W')&&nbOk('E'),Object.keys(nb).map(s=>s+(nbOk(s)?'對':'不對')).join('、')||'沒有');
    // C 進門那一刻、靠兩側前角站
    const views=[['出生點',L.spawn.x,L.spawn.z],['左前角',X0+0.7,Z1-1.2],['右前角',X1-0.7,Z1-1.2]];
    const cr=views.map(([nm,x,zz])=>{ const cam=camAt(L,x,zz,0,PITCH,dist); return [nm,frame(z,cam,x,zz)]; });
    check(tag+'：進門、兩側前角的畫面沒有店外的空白（≤ 2%）',cr.every(([,r])=>r.none<=0.02),cr.map(([nm,r])=>nm+' '+(r.none*100).toFixed(1)+'%').join('、'));
    // D 拉遠、往上拖
    const dr=[['拉遠 6 m',PITCH,6.0],['俯角 0.7',0.7,dist],['俯角 1.05',1.05,dist]].map(([nm,p,d])=>{ const cam=camAt(L,L.spawn.x,L.spawn.z,0,p,d); return [nm,frame(z,cam,L.spawn.x,L.spawn.z)]; });
    check(tag+'：拉遠、往上拖，畫面上沒有天花板的上面',dr.every(([,r])=>r.ceilTop===0),dr.map(([nm,r])=>nm+' '+(r.ceilTop*100).toFixed(1)+'%').join('、'));
    // E 鄰居店面不擋人
    let bad=0, tot=0, ex=null; const cards=Object.values(nb);
    if(cards.length) for(let x=X0+0.4;x<=X1-0.4+1e-6;x+=0.8) for(let zz=B.z0+0.4;zz<=Z1-0.4+1e-6;zz+=0.8) for(let k=0;k<8;k++){ const cam=camAt(L,x,zz,k*PI/4,PITCH,dist); fade(z,cam,x,zz); tot++;
      for(const py of [1.6,1.0]){ const tp=new THREE.Vector3(x,py,zz), d=tp.clone().sub(cam.position), len=d.length(); RC.set(cam.position,d.normalize()); RC.near=0.1; RC.far=len; const h=RC.intersectObjects(cards.filter(visible),false)[0];
        if(h){ bad++; if(!ex) ex={x:+x.toFixed(1),z:+zz.toFixed(1),yaw:k,card:h.object.name}; break; } } }
    check(tag+'：鄰居店面不擋人（店裡每 0.8 m、8 個方向）',cards.length===2&&bad===0,cards.length?bad+'／'+tot+(ex?'　例：'+JSON.stringify(ex):''):'沒有鄰居店面');
  }
  console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });

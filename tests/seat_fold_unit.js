// 階梯教室的翻椅（INTERIOR-AAA-REVIEW-1028，LAWWW2-C 2026-10-28）：src/zones3d.js 的 seatFold（SEATFOLD-BEGIN…END）＋正式模型 classroom_201.glb 的 SEATPANS。
// 沒有人坐的椅面掀起來、有人坐（玩家、同學、正走過來要坐的、遠處的替身）就放下；人走了 0.5 秒後才掀起來。不需要瀏覽器（three.js 在 Node 跑）。
// 修改前（v1 的 201：椅子是一個模型 48 個實例、全部放下）：zones3d.js 沒有 seatFold、GLB 沒有 SEATPANS → ①⑧ FAIL。
// 用法：node tests/seat_fold_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'lib/three.bundle.js'),'utf8'),{filename:'lib/three.bundle.js'});
const src=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'); const m0=src.indexOf('/* SEATFOLD-BEGIN'), m1=src.indexOf('/* SEATFOLD-END */');
check('① zones3d.js 有 seatFold（SEATFOLD-BEGIN…END），attachRoomGLB 接上',m0>0&&m1>m0&&/seatFold\(z,root\); \}/.test(src));
if(!(m0>0&&m1>m0)){ console.log('FAILED '+fails); process.exit(1); }
const seatFold=new Function('THREE',src.slice(m0,m1)+'\nreturn seatFold;')(THREE);

/* 兩個座位（201 的方向：坐的人面向 −z，yaw＝π）：椅面照模型的位置（中心往前 0.04、後緣在轉軸 0.15 附近、高 0.445～0.475）*/
const H0=0.3, SEATS=()=>[{x:0,y:H0,z:-3.8,yaw:Math.PI},{x:1.5,y:H0,z:-3.8,yaw:Math.PI}];
function panGeo(seats){ const parts=seats.map(s=>{ const b=new THREE.BoxGeometry(0.48,0.03,0.42).toNonIndexed(); b.translate(s.x,s.y+0.46,s.z-0.04); return b; });
  const n=parts.reduce((a,b)=>a+b.attributes.position.count,0), P=new Float32Array(n*3), N=new Float32Array(n*3); let o=0;
  for(const b of parts){ P.set(b.attributes.position.array,o*3); N.set(b.attributes.normal.array,o*3); o+=b.attributes.position.count; }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('normal',new THREE.BufferAttribute(N,3)); return g; }
function setup(){ const z={seats:SEATS(),update:null}; const root=new THREE.Group(); const g=panGeo(z.seats); const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial()); mesh.name='SEATPANS'; root.add(mesh); root.updateMatrixWorld(true);
  const r=seatFold(z,root); return {z,root,mesh,src:g,r}; }
const pan=(T,k)=>{ const P=T.mesh.geometry.attributes.position, s=T.z.seats[k]; let ymax=-1e9, zmax=-1e9; for(let i=0;i<P.count;i++){ const x=P.getX(i), y=P.getY(i), zz=P.getZ(i); if(Math.abs(x-s.x)<0.4){ ymax=Math.max(ymax,y); zmax=Math.max(zmax,zz); } } return {up:ymax-s.y, back:zmax-s.z}; };
const E=()=>({player:{seat:null,obj:{position:new THREE.Vector3(9,0,9)}},npcs:[]});
{ const z={seats:SEATS()}, root=new THREE.Group(); check('② 沒有 SEATPANS（備用模型、舊 GLB）：不做、不包 z.update',seatFold(z,root)===null&&z.update===undefined); }
{ const T=setup(), a=pan(T,0), b=pan(T,1), sp=T.src.attributes.position;
  check('③ 一開始沒有人：兩張都掀起來（椅面最高點離座位地面 0.8 m 以上）',a.up>0.8&&b.up>0.8,`${a.up.toFixed(3)}、${b.up.toFixed(3)}`);
  check('③ 掀起來的椅面在椅背前面（往後不超過 0.2 m：椅背正面在 0.205）',a.back<0.2&&a.back>0.1,a.back.toFixed(3));
  const fresh=panGeo(SEATS()).attributes.position.array; check('③ 改的是複製的幾何，快取的原本幾何不動（下次進教室還是對的）',T.mesh.geometry!==T.src&&sp.array.every((v,i)=>Math.abs(v-fresh[i])<1e-6)); }
{ const T=setup(), e=E(); e.player.seat=T.z.seats[0]; T.z.update(0.016,e); const a=pan(T,0), b=pan(T,1);
  check('④ 玩家坐下：那一張同一格就放下（不會掃過身體），另一張還是掀著',a.up<0.5&&b.up>0.8,`${a.up.toFixed(3)}、${b.up.toFixed(3)}`);
  e.player.seat=null; for(let t=0;t<0.3;t+=0.05) T.z.update(0.05,e); const c=pan(T,0);
  check('④ 站起來 0.3 秒：還放著（等人走開）',c.up<0.5,c.up.toFixed(3));
  for(let t=0;t<0.9;t+=0.05) T.z.update(0.05,e); const d=pan(T,0); check('④ 站起來 1.2 秒：掀回去',d.up>0.8,d.up.toFixed(3)); }
{ const T=setup(), e=E(), st=T.z.seats[1], n={seat:null,seatTarget:st,obj:{position:new THREE.Vector3(st.x,0,st.z+2.0)}}; e.npcs.push(n);
  T.z.update(0.016,e); const a=pan(T,1); n.obj.position.set(st.x,0,st.z+0.6); T.z.update(0.016,e); const b=pan(T,1); n.seatTarget=null; n.seat=st; T.z.update(0.016,e); const c=pan(T,1);
  check('⑤ 同學走過來要坐（seatTarget）：2 m 外還掀著、0.8 m 內放下、坐下以後放著',a.up>0.8&&b.up<0.5&&c.up<0.5,`${a.up.toFixed(2)}、${b.up.toFixed(2)}、${c.up.toFixed(2)}`); }
{ const T=setup(), e=E(); T.z.seats[0].taken='cls:x'; T.z.update(0.016,e); check('⑥ 遠處的替身坐的位子（st.taken）：放下',pan(T,0).up<0.5); }
{ const T=setup(); let called=0; const z={seats:SEATS(),update(){ called++; }}; const root=new THREE.Group(); const m=new THREE.Mesh(panGeo(z.seats),new THREE.MeshStandardMaterial()); m.name='SEATPANS'; root.add(m); root.updateMatrixWorld(true);
  seatFold(z,root); z.update(0.016,E()); check('⑦ 原本的 z.update（光照貼圖的日夜混合、窗景）照樣呼叫',called===1); }

/* ⑧ 正式模型：GLB 裡有 SEATPANS，頂點照 classroom_layout.js 的 48 個座位分得完、每張都有、放下的高度對 */
{ const f=path.join(ROOT,'assets/models/env/classroom_201.glb'); let ok=false, info='';
  if(fs.existsSync(f)){ const buf=fs.readFileSync(f), jl=buf.readUInt32LE(12), J=JSON.parse(buf.slice(20,20+jl).toString('utf8')), binOff=20+jl+8;
    const node=(J.nodes||[]).find(n=>n.name==='SEATPANS');
    if(node){ const prim=J.meshes[node.mesh].primitives[0], acc=J.accessors[prim.attributes.POSITION], bv=J.bufferViews[acc.bufferView], st=bv.byteStride||12, off=binOff+(bv.byteOffset||0)+(acc.byteOffset||0);
      const L=JSON.parse(fs.readFileSync(path.join(ROOT,'src/data/classroom_layout.js'),'utf8').match(/=\s*(\{[\s\S]*\})\s*;?\s*$/)[1]); const seats=[];
      for(let r=0;r<L.rows;r++) for(let i=0;i<L.cols;i++) seats.push({x:L.colX0+i*L.colDX,y:L.rise*(r+1),z:L.rowZ0+r*L.rowDepth+L.seat.dz});
      const cnt=new Array(seats.length).fill(0); let lost=0, badY=0; const t=node.translation||[0,0,0];
      for(let i=0;i<acc.count;i++){ const x=buf.readFloatLE(off+i*st)+t[0], y=buf.readFloatLE(off+i*st+4)+t[1], z=buf.readFloatLE(off+i*st+8)+t[2]; let b=-1, bd=0.2;
        seats.forEach((s,k)=>{ const d=(x-s.x)**2+(z-s.z)**2; if(d<bd&&Math.abs(y-s.y-0.45)<0.3){ bd=d; b=k; } }); if(b<0) lost++; else { cnt[b]++; if(y-seats[b].y<0.40||y-seats[b].y>0.50) badY++; } }
      ok=lost===0&&cnt.every(c=>c>=50)&&badY===0; info=`頂點 ${acc.count}、分不到座位 ${lost}、最少的一張 ${Math.min(...cnt)}、高度不在 0.40～0.50 的 ${badY}`; }
    else info='GLB 沒有 SEATPANS'; }
  else info='沒有 GLB';
  check('⑧ 正式模型 classroom_201.glb：SEATPANS 的頂點分得到 48 個座位（每張 50 個以上）、放下的高度 0.40～0.50 m',ok,info); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);

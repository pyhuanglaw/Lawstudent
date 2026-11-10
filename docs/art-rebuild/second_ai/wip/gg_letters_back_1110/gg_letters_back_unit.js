// 公館捷運出口前的「GONGGUAN」立體字從背面看是反字（GG-LETTERS-BACK-1110；BB 11-10 P3：CC 從日和往外拍的窗景，字是反的）——不需要瀏覽器（D131）。
// 字在 gg_backdrop.py（公館區域的遠景 gongguan_far.glb、校園背景 campus_gongguan_bd.glb 同一段）：立在花台上、字面朝北（公館區域 −z，朝馬路）；
// 南側的店（日和，tools/shots/shop_views_layers.py 的 cvs 鏡頭 (−27.62, 1.4, 21.41)）看到的是字的背面＝鏡像的字形。修法：字的背面加一片單面的素色背板（和花台底座同色 #f4f4f0）。
// 檢查（Node 讀 gongguan_far.glb，three.js 的 Raycaster；材質單面＝和遊戲一樣，背面打不到）：
//   1 從日和的鏡頭往字的範圍打 5×4 條射線：全部先打到背板（顏色 #f4f4f0、在字的後面 0.1 m 內），沒有一條打到白色的字
//   2 從馬路那一側（北邊 (−30, 1.6, 8)）往同一個範圍打：打到白色的字的 ≥ 6 條（字照舊看得到），沒有一條打到背板（單面：正面看不到）
//   3 校園背景 campus_gongguan_bd.glb 也有同一片背板（同一支腳本）：從字後面的人行道看全部是背板；從校園那一側（字的正面）一樣看不到背板
// 修改前（開發分支 0ec32e6f6）：1 FAIL（打到白色的字＝反字）。用法：node tests/gg_letters_back_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; vm.runInThisContext(fs.readFileSync(path.join(ROOT,'lib/three.bundle.js'),'utf8'),{filename:'three'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function load(file){ const b=fs.readFileSync(path.join(ROOT,file)), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(28+jl);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0), T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
    const arr=new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); const k=a.normalized?(a.componentType===5123?65535:(a.componentType===5121?255:1)):1;
    return {n,arr,k}; };
  const sc=new THREE.Group();
  const mk=(nd,par)=>{ const o=nd.mesh!=null?new THREE.Group():new THREE.Object3D(); if(nd.translation) o.position.fromArray(nd.translation); if(nd.rotation) o.quaternion.fromArray(nd.rotation); if(nd.scale) o.scale.fromArray(nd.scale);
    if(nd.mesh!=null) for(const pr of J.meshes[nd.mesh].primitives){ const g=new THREE.BufferGeometry(), P=acc(pr.attributes.POSITION); g.setAttribute('position',new THREE.BufferAttribute(P.arr,3));
      if(pr.attributes.COLOR_0!=null){ const C=acc(pr.attributes.COLOR_0), c=new Float32Array(P.arr.length/3*3); for(let i=0;i<c.length/3;i++) for(let j=0;j<3;j++) c[i*3+j]=C.arr[i*C.n+j]/C.k; g.setAttribute('color',new THREE.BufferAttribute(c,3)); }
      if(pr.indices!=null){ const I=acc(pr.indices); g.setIndex(new THREE.BufferAttribute(I.arr,1)); }
      o.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.FrontSide,vertexColors:!!g.attributes.color}))); }
    par.add(o); for(const c of nd.children||[]) mk(J.nodes[c],o); };
  for(const r of J.scenes[J.scene||0].nodes) mk(J.nodes[r],sc); sc.updateMatrixWorld(true); return sc; }
const lin=h=>{ const c=parseInt(h,16)/255; return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4); };
const PANEL=lin('f4'), PANEL_B=lin('f0');
const kindOf=hit=>{ if(!hit) return 'none'; const g=hit.object.geometry, C=g.attributes.color; if(!C) return 'other'; const i=hit.face.a, r=C.getX(i), gg=C.getY(i), b=C.getZ(i);
  if(r>0.99&&gg>0.99&&b>0.99) return 'letter'; if(Math.abs(r-PANEL)<0.01&&Math.abs(b-PANEL_B)<0.01) return 'panel'; return 'other'; };
function cast(sc,from,targets){ const rc=new THREE.Raycaster(), out=[]; for(const t of targets){ const d=t.clone().sub(from).normalize(); rc.set(from,d); rc.far=from.distanceTo(t)+3; const h=rc.intersectObject(sc,true)[0]; out.push({k:kindOf(h),h}); } return out; }
/* 字的範圍（公館區域座標：x −33.4～−26.6、y 0.85～1.5、z 15.1 附近） */
const T=[]; for(let i=0;i<5;i++) for(let j=0;j<4;j++) T.push(new THREE.Vector3(-33.0+i*1.5,0.95+j*0.15,15.1));
{ const sc=load('assets/models/env/second_ai/gongguan_far.glb');
  const back=cast(sc,new THREE.Vector3(-27.62,1.4,21.41),T), nP=back.filter(r=>r.k==='panel').length, nL=back.filter(r=>r.k==='letter').length;
  const nearOK=back.every(r=>r.k!=='panel'||Math.abs(r.h.point.z-15.18)<0.12);
  check('1 從日和的鏡頭看過去：全部先打到素色背板，沒有反字', nP===T.length&&nL===0&&nearOK, `${T.length} 條：背板 ${nP}、白色的字 ${nL}、其他 ${T.length-nP-nL}`);
  const front=cast(sc,new THREE.Vector3(-30,1.6,8),T), fP=front.filter(r=>r.k==='panel').length, fL=front.filter(r=>r.k==='letter').length;
  check('2 從馬路那一側（正面）看：字照舊、看不到背板', fL>=6&&fP===0, `${T.length} 條：白色的字 ${fL}、背板 ${fP}、其他 ${T.length-fP-fL}`); }
{ const sc=load('assets/models/env/second_ai/campus_gongguan_bd.glb');   /* 校園座標：公館 (gx,gz) → 校園 (x＝−170−gz, z＝gx) */
  const C=p=>new THREE.Vector3(-170-p.z,p.y,p.x), Tc=T.map(C);
  const back=cast(sc,C(new THREE.Vector3(-30,1.4,17.5)),Tc), nP=back.filter(r=>r.k==='panel').length;   /* 校園背景有公館的店面（日和的位置在店裡面）：從字和店面中間的人行道看 */
  const front=cast(sc,C(new THREE.Vector3(-30,1.6,8)),Tc), fP=front.filter(r=>r.k==='panel').length, fL=front.filter(r=>r.k==='letter').length;
  check('3 校園背景（同一支腳本）也有背板；從字的正面（校園那一側）看不到', nP===T.length&&fP===0&&fL>=6, `背面打到背板 ${nP}／${T.length}；正面：字 ${fL}、背板 ${fP}`); }
console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0);

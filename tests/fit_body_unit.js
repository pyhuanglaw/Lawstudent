// 健身的 3D 體態第二階段：身體形狀（GYM-FIT-1107，LAWWW2-B 2026-11-07；使用者 11-07「肌肉線條更明顯」）——不需要瀏覽器。
// 祐廷的 VRM（vroid_yuting.vrm，?blchar 的 bl_yuting.vrm）身體＋衣服（含系外套）有 morph「fit」（tools/anim/fit_body_morph.py），FIT.sync 照體能四階設 u.fitBody＝0／0.4／0.7／1。
// 檢查：① 兩個 VRM 的身體、衣服有 fit；vroid 版的系外套也有；臉、頭髮沒有
//       ② FIT.BODY 四階、FIT.sync 照體能設 u.fitBody；遊戲（CHAR.animate）照 u.fitBody 開 morph，0 就關
//       ③ 經常鍛鍊（1）：上臂比普通粗 ≥ 10%（離骨頭軸的平均距離）；手掌、頭、腳掌不動（< 2 mm），脖子底部跟著胸口一點（< 5 mm）
//       ④ 衣服在外面：上臂、胸口的皮膚頂點跑到毛衣外面的數量沒有變多（站姿）
//       ⑤ 坐下：大腿底部往下 < 1 cm（坐的高度照 C.SIT_FIT，不重算）
// 修改前（開發 c244ce20e）：① FAIL（沒有 fit）、② FAIL（沒有 FIT.BODY）。用法：node tests/fit_body_unit.js
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const glb=f=>{ const b=fs.readFileSync(path.join(ROOT,f)), jl=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+jl).toString('utf8')); };
(async()=>{
  // ① VRM
  for(const f of ['assets/models/char/vroid_yuting.vrm','assets/models/char/bl_yuting.vrm']){ const J=glb(f), has={}; J.meshes.forEach(m=>{ has[m.name]=((m.extras||{}).targetNames||[]).includes('fit'); });
    const body=Object.keys(has).filter(n=>/Body|Clothes|GYM_/.test(n)), face=Object.keys(has).filter(n=>/Face|Hair/.test(n));
    check('① '+path.basename(f)+'：身體、衣服有 morph fit，臉、頭髮沒有；舊外套網格已從模型拿掉（D158）',body.length>=2&&body.every(n=>has[n])&&face.every(n=>!has[n])&&!Object.keys(has).some(n=>/^JACKET/.test(n)),JSON.stringify(has)); }
  // ② FIT
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/fit3d.js'),'utf8').replace(/^const FIT\s*=/m,'globalThis.FIT='),{filename:'src/fit3d.js'});
  check('② FIT.BODY 四階 0～1、越來越大',Array.isArray(FIT.BODY)&&FIT.BODY.length===4&&FIT.BODY[0]===0&&FIT.BODY[3]===1&&FIT.BODY[1]<FIT.BODY[2]&&FIT.BODY[2]<FIT.BODY[3],JSON.stringify(FIT.BODY));
  { const got=[0,30,60,90].map(f=>{ const o={userData:{}}; FIT.sync({G:{day:30,daily:{gym:{fit:f}},flags:{}},E:{player:{obj:o}}}); return o.userData.fitBody; });
    check('② FIT.sync 照體能設 u.fitBody',Array.isArray(FIT.BODY)&&got.every((v,i)=>v===FIT.BODY[i]),JSON.stringify(got)); }
  await preload(['char.yuting']);
  const h=CHAR.build({id:'player',model:'char.yuting',height:1.75,sex:'m'}), u=h.userData;
  if(u.driver!=='vrm'){ check('（前提）祐廷的 VRM 載得到',false,u.driver); console.log('FAILED '+fails); process.exit(1); }
  const step=(n,st)=>{ for(let i=0;i<n;i++) CHAR.animate(h,1/30,st||{pose:'idle',speed:0}); h.updateMatrixWorld(true); };
  u.fitBody=1; step(2); const on=(u.fitMorph||[]).length>=4&&u.fitMorph.every(([o,i])=>o.morphTargetInfluences[i]===1); u.fitBody=0; step(2); const off=(u.fitMorph||[]).every(([o,i])=>o.morphTargetInfluences[i]===0);
  check('② CHAR.animate 照 u.fitBody 開關 morph（網格 '+((u.fitMorph||[]).length)+' 個）',on&&off);
  // 量：頂點（世界座標）＋主要骨頭
  const H=u.vrm.humanoid, bw=n=>new THREE.Vector3().setFromMatrixPosition(H.getRawBoneNode(n).matrixWorld), V=new THREE.Vector3();
  const meshes=[]; h.traverse(o=>{ if(o.isSkinnedMesh&&o.visible&&o.name!=='npc_far'){ const mn=(Array.isArray(o.material)?o.material[0]:o.material).name||''; meshes.push({o,mn}); } });
  const domBone=(o,i)=>{ const si=o.geometry.attributes.skinIndex, sw=o.geometry.attributes.skinWeight, acc={}; for(let c=0;c<4;c++){ const w=sw.getComponent(i,c); if(w>0){ const n=o.skeleton.bones[si.getComponent(i,c)].name; acc[n]=(acc[n]||0)+w; } } let b=null,bwv=0; for(const k in acc) if(acc[k]>bwv){ bwv=acc[k]; b=k; } return b; };
  const snap=k=>{ u.fitBody=k; u.anim.t=0; step(1); const out=[]; for(const {o,mn} of meshes){ const used=new Set(o.geometry.index?o.geometry.index.array:[]); for(const i of used){ o.getVertexPosition(i,V); o.localToWorld(V); out.push({mn,b:domBone(o,i),p:V.clone()}); } } return {v:out,ua:[bw('leftUpperArm'),bw('leftLowerArm')],sh:bw('rightUpperArm').distanceTo(bw('leftUpperArm'))}; };
  const A=snap(0), B=snap(1);
  const rad=(p,a,b)=>{ const d=b.clone().sub(a), t=Math.max(0,Math.min(1,p.clone().sub(a).dot(d)/d.lengthSq())); return p.distanceTo(a.clone().add(d.multiplyScalar(t))); };
  const armR=S=>{ let s=0,n=0; S.v.forEach(q=>{ if(q.b==='J_Bip_L_UpperArm'){ s+=rad(q.p,S.ua[0],S.ua[1]); n++; } }); return s/Math.max(1,n); };
  const ra=armR(A), rb=armR(B);
  let still=0, neck=0; for(let i=0;i<A.v.length;i++){ const b=A.v[i].b||''; if(/Hair/.test(A.v[i].mn)) continue; const d=A.v[i].p.distanceTo(B.v[i].p); if(/Neck/.test(b)) neck=Math.max(neck,d); else if(/Hand|Head|Foot|Toe|Eye/.test(b)) still=Math.max(still,d); }
  check('③ 經常鍛鍊：上臂比普通粗 ≥ 10%',rb/ra>=1.10,'離骨頭軸平均 '+(ra*100).toFixed(2)+' → '+(rb*100).toFixed(2)+' cm（'+((rb/ra-1)*100).toFixed(1)+'%）');
  check('③ 手掌、頭、腳掌不動（< 2 mm；同一個動畫時間點，idle 本身的雜訊約 0.7 mm）；脖子底部跟著胸口一點（< 5 mm）',still<0.002&&neck<0.005,'手／頭／腳 '+(still*1000).toFixed(2)+' mm、脖子 '+(neck*1000).toFixed(2)+' mm');
  // ④ 皮膚跑到毛衣外面：每一個皮膚頂點（上臂、胸口）和同一根骨頭、同一個角度、同一段的衣服頂點比離軸距離
  const outside=S=>{ const bins={}, axis={J_Bip_L_UpperArm:S.ua}; const key=(q,a)=>{ const d=a[1].clone().sub(a[0]), t=Math.floor(Math.max(0,Math.min(0.999,q.p.clone().sub(a[0]).dot(d)/d.lengthSq()))*8), r=q.p.clone().sub(a[0]); return t; };
    let n=0, tot=0; const top=S.v.filter(q=>q.b==='J_Bip_L_UpperArm'&&/Tops|Knit/.test(q.mn)), skin=S.v.filter(q=>q.b==='J_Bip_L_UpperArm'&&/Body_00_SKIN/.test(q.mn));
    const a=S.ua, d=a[1].clone().sub(a[0]).normalize(), up=new THREE.Vector3(0,1,0), e1=new THREE.Vector3().crossVectors(d,up).normalize(), e2=new THREE.Vector3().crossVectors(d,e1);
    const cell=q=>{ const r=q.p.clone().sub(a[0]), t=r.dot(d)/a[1].distanceTo(a[0]); const rr=r.clone().sub(d.clone().multiplyScalar(r.dot(d))); const ang=Math.atan2(rr.dot(e2),rr.dot(e1)); return Math.floor(Math.max(0,Math.min(0.999,t))*8)+'|'+Math.floor((ang+Math.PI)/(Math.PI/6)); };
    for(const q of top){ const k=cell(q), r=rad(q.p,a[0],a[1]); bins[k]=Math.max(bins[k]||0,r); }
    for(const q of skin){ const k=cell(q); if(bins[k]==null) continue; tot++; if(rad(q.p,a[0],a[1])>bins[k]+0.002) n++; } return {n,tot}; };
  const oa=outside(A), ob=outside(B);
  check('④ 上臂皮膚跑到毛衣外面的頂點沒有變多（站姿）',ob.n<=oa.n+2,'普通 '+oa.n+'／'+oa.tot+' → 經常鍛鍊 '+ob.n+'／'+ob.tot);
  check('③ 骨頭位置不變（兩邊上臂根的距離一樣；變寬的是肩膀的肉，不是骨架）',Math.abs(B.sh-A.sh)<0.0005,(A.sh*100).toFixed(2)+' → '+(B.sh*100).toFixed(2)+' cm');
  // ⑤ 坐下：大腿底部
  const thighBottom=k=>{ u.fitBody=k; step(40,{pose:'sit',speed:0}); let lo=1e9; for(const {o} of meshes){ const used=new Set(o.geometry.index?o.geometry.index.array:[]); for(const i of used){ if(!/UpperLeg/.test(domBone(o,i)||'')) continue; o.getVertexPosition(i,V); o.localToWorld(V); h.worldToLocal(V); if(Math.abs(V.x)<0.22&&V.z>-0.2&&V.z<0.12&&V.y<lo) lo=V.y; } } return lo; };
  const t0=thighBottom(0), t1=thighBottom(1);
  check('⑤ 坐下：大腿底部往下 < 1 cm',t0-t1<0.01,((t0-t1)*100).toFixed(2)+' cm');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });

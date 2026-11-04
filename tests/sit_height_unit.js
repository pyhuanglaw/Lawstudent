// 坐下的高度（SIT-HEIGHT-1104，LAWWW2-C 2026-11-04；LAWWW-C 22:57Z、BB-C 22:43「女生、男生吃飯都彎很低，頭幾乎埋到碗上；桌子在胸口」）
// 原本坐下一律往下 0.47 m×身高比例（照男生 vroid_npc_m1 校的）；VRoid 女生的腿短，坐下以後大腿陷進椅面、桌子到胸口。
// 改成照每個模型自己的大腿根高度（character3d.js 的 C.SIT_UL，tools/anim/sit_fit_table.py 量的）。這支在遊戲自己的骨架上，照遊戲的坐姿（pose sit、靜態）量：
//   大腿底部＝綁在大腿骨上的頂點（蒙皮以後的位置，裙子的輔助骨不算）在大腿中段最低的那一點；椅面＝Z3.chair 的 0.485 m（teach3d 的正式椅子也放大到 0.485）
//   ① 改後：每個人的大腿底部在椅面下 3 cm 以內、上面 2 cm 以內（衣服、坐墊壓下去一點）
//   ② 改前（C.SIT_UL 清空＝舊的 0.47×身高比例）：女生 npc_f1 陷進椅面 8 cm 以上——證明這支量得到原本的問題
//   ③ 男生 vroid_npc_m1：改前、改後的往下一樣（差 ≤ 2 mm：照它校的地方都不用動）
//   ④ 改後女生 npc_f1 的肩膀離桌面（0.75 m）≥ 15 cm（原本 8～9 cm）
//   另外印出：骨盆、大腿根、肩膀、手肘、眼睛離桌面多高（改前／改後），給 LAWWW-C、BB 看。
// 用法（開發分支）：node tests/sit_height_unit.js
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v>=0?'+':'')+(v*100).toFixed(1)+' cm';
const SEAT=0.485, DESK=0.75, DT=1/30;
const WHO=[['F 女生','char.npc_f1'],['M 男生','char.npc_m1'],['F2','char.npc_nf10'],['M2','char.npc_nm11'],['以安','char.heroine_01'],['語彤','char.heroine_03'],['祐廷','char.yuting']];
(async()=>{
  await preload(WHO.map(w=>w[1]));
  const scene=new THREE.Scene(), V=new THREE.Vector3();
  if(!CHAR.SIT_UL||!CHAR.sitDropOf){ check('0 有 C.SIT_UL／sitDropOf（SIT-HEIGHT-1104）',false,'這個分支還沒有'); }
  const UL=Object.assign({},CHAR.SIT_UL||{});
  function measure(key){
    const m=ASSETS.manifest[key]; const h=CHAR.build({model:key,height:m.height}); scene.add(h); h.position.set(0,0,0); h.rotation.y=0;
    for(let i=0;i<8;i++){ CHAR.animate(h,DT,{pose:'sit',speed:0}); } scene.updateMatrixWorld(true);
    const u=h.userData, H=u.vrm.humanoid, bone=n=>H.getRawBoneNode(n), wy=n=>{ const b=bone(n); return b?b.getWorldPosition(V).y:NaN; };
    const legs=[bone('leftUpperLeg'),bone('rightUpperLeg')], knees=[bone('leftLowerLeg'),bone('rightLowerLeg')];
    let low=1e9;
    h.traverse(o=>{ if(!o.isSkinnedMesh||/hair/i.test((o.name||'')+'|'+((o.parent&&o.parent.name)||''))) return;
      const bi=legs.map(b=>o.skeleton.bones.indexOf(b)); if(bi.every(i=>i<0)) return;
      const si=o.geometry.attributes.skinIndex, sw=o.geometry.attributes.skinWeight, pa=o.geometry.attributes.position;
      for(let v=0;v<pa.count;v++){ let w=0, side=-1;
        for(let c=0;c<4;c++){ const j=si.getComponent(v,c), ww=sw.getComponent(v,c); const s=bi.indexOf(j); if(s>=0&&ww>w){ w=ww; side=s; } }
        if(w<0.6) continue;
        o.getVertexPosition(v,V); o.localToWorld(V);
        const A=legs[side].getWorldPosition(new THREE.Vector3()), B=knees[side].getWorldPosition(new THREE.Vector3()), ax=B.clone().sub(A), L=ax.length(); ax.normalize();
        const t=V.clone().sub(A).dot(ax); if(t<0.3*L||t>0.7*L) continue;
        if(V.y<low) low=V.y; } });
    const eye=bone('leftEye')?wy('leftEye'):wy('head')+0.06*u.k;
    const r={drop:CHAR.sitDrop(h),thigh:low,hips:wy('hips'),ul:(wy('leftUpperLeg')+wy('rightUpperLeg'))/2,sh:(wy('leftUpperArm')+wy('rightUpperArm'))/2,el:(wy('leftLowerArm')+wy('rightLowerArm'))/2,eye};
    scene.remove(h); CHAR.release&&CHAR.release(h); return r; }
  const res={};
  for(const [lab,key] of WHO){ for(const k in CHAR.SIT_UL) delete CHAR.SIT_UL[k]; if(CHAR._ambReset) CHAR._ambReset(); const before=measure(key);
    Object.assign(CHAR.SIT_UL,UL); const after=measure(key); res[key]={lab,before,after}; }
  console.log('坐在椅面 0.485 m、桌面 0.75 m 前（pose sit、靜態坐姿）：改前 → 改後');
  for(const key in res){ const {lab,before:b,after:a}=res[key];
    console.log('  '+lab.padEnd(5)+' 往下 '+b.drop.toFixed(3)+' → '+a.drop.toFixed(3)+'｜大腿底部比椅面 '+cm(b.thigh-SEAT)+' → '+cm(a.thigh-SEAT)+'｜骨盆離座位地面 '+b.hips.toFixed(3)+' → '+a.hips.toFixed(3)+
      '｜離桌面：肩膀 '+cm(b.sh-DESK)+' → '+cm(a.sh-DESK)+'、手肘 '+cm(b.el-DESK)+' → '+cm(a.el-DESK)+'、眼睛 '+cm(b.eye-DESK)+' → '+cm(a.eye-DESK)); }
  const bad=Object.values(res).filter(r=>!(r.after.thigh-SEAT>=-0.03&&r.after.thigh-SEAT<=0.02));
  check('① 改後：大腿底部在椅面下 3 cm、上 2 cm 以內（'+Object.keys(res).length+' 個人）',!bad.length,bad.map(r=>r.lab+' '+cm(r.after.thigh-SEAT)).join('、')||'都在範圍裡');
  const f=res['char.npc_f1'], mm=res['char.npc_m1'];
  check('② 改前：女生 npc_f1 陷進椅面 8 cm 以上（原本的問題量得到）',!!f&&f.before.thigh-SEAT<=-0.08,f?cm(f.before.thigh-SEAT):'');
  check('③ 男生 vroid_npc_m1：往下改前、改後一樣（差 ≤ 2 mm）',!!mm&&Math.abs(mm.after.drop-mm.before.drop)<=0.002,mm?mm.before.drop.toFixed(4)+' → '+mm.after.drop.toFixed(4):'');
  check('④ 改後女生 npc_f1 的肩膀離桌面 ≥ 15 cm',!!f&&f.after.sh-DESK>=0.15,f?cm(f.before.sh-DESK)+' → '+cm(f.after.sh-DESK):'');
  console.log(fails?('FAILS: '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });

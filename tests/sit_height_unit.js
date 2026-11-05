// 坐下的高度（SIT-HEIGHT-1104，LAWWW2-C 2026-11-04；LAWWW-C 22:57Z、BB-C 22:43「女生、男生吃飯都彎很低，頭幾乎埋到碗上；桌子在胸口」、22:55「階梯教室大腿陷進椅面」）
// 原本坐下一律往下 0.47 m×身高比例（照男生 vroid_npc_m1 校的）；在遊戲自己的骨架上量，大腿底部離座位地面只有 0.32～0.48 m（椅面 0.45～0.485）：女生陷 10～15 cm、npc_m1 也陷 5 cm。
// 改成照每個模型自己的比例（character3d.js 的 C.SIT_FIT＝[ul, bt]，tools/anim/sit_fit_survey.js 在遊戲骨架上量的）：大腿底部都在座位地面上 SIT_TOP−SIT_PRESS＝0.465 m。
// 這支在遊戲自己的骨架上，照遊戲的坐姿（pose sit、靜態；先站著記下腳踝高度，sitFeet 照遊戲）量：
//   大腿底部＝坐姿時椅面後段（人物座標 |x|≤0.22、z −0.20～+0.12）裡、權重加總以後主要綁在 upperLeg 的頂點（≥0.6，不含頭髮）最低的一點
//   ① 改後：褲子的人大腿底部在 0.47 椅面下 1.5 cm、上 0.5 cm 以內（裙子綁在骨盆上量不到大腿，另外列）
//   ② 改前（C.SIT_FIT 清空＝舊的 0.47×身高比例）：女生 npc_f1 陷進 0.47 椅面 8 cm 以上——證明這支量得到原本的問題
//   ③ 男生 vroid_npc_m1：改前也陷 4 cm 以上，改後往上 3～6 cm
//   ④ 改後女生 npc_f1 的肩膀離桌面（0.75 m）≥ 20 cm（原本 8～9 cm）、男生 npc_m1 ≥ 20 cm
//   ⑤ 一般椅子（sitFeet）：改後每個人腳踝離站著的高度 ±1 cm（腳懸空的往下放、太低的往上抬）
//   ⑥ 階梯教室（座位 sitFeet 關、長桌在座位點前 0.32 m）：改後膝蓋（膝關節 12 cm 內的頂點）在桌下置物架範圍（座位點前 0.435 m 以後）的最高點，比置物架底
//      （從 assets/models/env/classroom_201.glb 的 desks_steel 讀）低 1.5 cm 以上；用原本的置物架高度（平台上 0.515）會撞到——證明架子要往上搬（lecture_shelf_raise.py）
//   另外印出：骨盆、大腿根、肩膀、手肘、眼睛離桌面多高、腳（階梯教室 sitFeet 關掉時）、膝蓋（改前／改後），給 LAWWW-C、BB 看。
// 用法（開發分支）：node tests/sit_height_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v>=0?'+':'')+(v*100).toFixed(1)+' cm';
const SEAT=0.47, DESK=0.75, DT=1/30;
const WHO=[['F 女生','char.npc_f1'],['M 男生','char.npc_m1'],['F2','char.npc_nf10'],['M2','char.npc_nm11'],['以安','char.heroine_01'],['語彤','char.heroine_03'],['祐廷','char.yuting'],['高個 nm6','char.npc_nm6']];
(async()=>{
  await preload(WHO.map(w=>w[1]));
  const scene=new THREE.Scene(), V=new THREE.Vector3();
  const has=!!(CHAR.SIT_FIT&&CHAR.sitDropOf&&CHAR.SIT_TOP);
  check('0 有 C.SIT_FIT／sitDropOf／SIT_TOP（SIT-HEIGHT-1104）',has,has?Object.keys(CHAR.SIT_FIT).length+' 個模型':'這個分支還沒有');
  const FIT=Object.assign({},CHAR.SIT_FIT||{});
  function measure(key,feetOn){
    const m=ASSETS.manifest[key]; const h=CHAR.build({model:key,height:m.height}); scene.add(h); h.position.set(0,0,0); h.rotation.y=0;
    for(let i=0;i<4;i++) CHAR.animate(h,DT,{pose:'idle',speed:0});   /* 站著：sitFeet 記下腳踝離地的高度 */
    scene.updateMatrixWorld(true);
    const u=h.userData, H=u.vrm.humanoid, bone=n=>H.getRawBoneNode(n), wy=n=>{ const b=bone(n); return b?b.getWorldPosition(V).y:NaN; };
    const ra=Math.min(wy('leftFoot'),wy('rightFoot'));
    if(!feetOn) u.sitFeet=false;
    for(let i=0;i<8;i++) CHAR.animate(h,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);
    const thigh=new Set(['leftUpperLeg','rightUpperLeg'].map(bone).filter(Boolean)), body=new Set(['hips','spine'].map(bone).filter(Boolean));
    const ul=(wy('leftUpperLeg')+wy('rightUpperLeg'))/2; let low=1e9, lowHip=1e9;
    h.traverse(o=>{ if(!o.isSkinnedMesh||/hair/i.test((o.name||'')+'|'+((o.parent&&o.parent.name)||''))) return;
      const bs=o.skeleton.bones, si=o.geometry.attributes.skinIndex, sw=o.geometry.attributes.skinWeight, pa=o.geometry.attributes.position;
      for(let v=0;v<pa.count;v++){ const acc=new Map(); for(let c=0;c<4;c++){ const ww=sw.getComponent(v,c); if(ww>0){ const b=bs[si.getComponent(v,c)]; acc.set(b,(acc.get(b)||0)+ww); } }   /* 同一根骨頭可能占兩格：照骨頭加總 */
        let bb=null, bw=0; for(const [b,w] of acc) if(w>bw){ bw=w; bb=b; }
        if(!thigh.has(bb)&&!body.has(bb)) continue;
        o.getVertexPosition(v,V); o.localToWorld(V); if(Math.abs(V.x)>0.22||V.z<-0.20||V.z>0.12||V.y<ul-0.2*m.height) continue;
        if(thigh.has(bb)&&bw>=0.6){ if(V.y<low) low=V.y; } else if(V.y<lowHip) lowHip=V.y; } });
    const eye=bone('leftEye')?wy('leftEye'):wy('head')+0.06*u.k, kn=['leftLowerLeg','rightLowerLeg'].map(n=>bone(n).getWorldPosition(new THREE.Vector3()));
    let kneeTop=-1e9, kneeFront=-1e9; const legB=new Set(['leftUpperLeg','rightUpperLeg','leftLowerLeg','rightLowerLeg'].map(bone).filter(Boolean));   /* 膝蓋：膝關節 12 cm 內、主要綁在腿上的頂點 */
    h.traverse(o=>{ if(!o.isSkinnedMesh||/hair/i.test((o.name||'')+'|'+((o.parent&&o.parent.name)||''))) return; const bs=o.skeleton.bones, si=o.geometry.attributes.skinIndex, sw=o.geometry.attributes.skinWeight, pa=o.geometry.attributes.position;
      for(let v=0;v<pa.count;v++){ let bw=0, bb=null; for(let c=0;c<4;c++){ const ww=sw.getComponent(v,c); if(ww>bw){ bw=ww; bb=bs[si.getComponent(v,c)]; } } if(!legB.has(bb)) continue;
        o.getVertexPosition(v,V); o.localToWorld(V); if(Math.min(V.distanceTo(kn[0]),V.distanceTo(kn[1]))>0.12) continue; if(V.z>kneeFront) kneeFront=V.z; if(V.z>=0.435&&V.y>kneeTop) kneeTop=V.y; } });
    const r={drop:CHAR.sitDrop(h),thigh:low,skirt:lowHip<low-0.003*m.height,hips:wy('hips'),ul,sh:(wy('leftUpperArm')+wy('rightUpperArm'))/2,el:(wy('leftLowerArm')+wy('rightLowerArm'))/2,eye,
      ank:Math.min(wy('leftFoot'),wy('rightFoot')),ra,kneeY:(kn[0].y+kn[1].y)/2,kneeZ:(kn[0].z+kn[1].z)/2,kneeTop,kneeFront};
    scene.remove(h); CHAR.release&&CHAR.release(h); return r; }
  const res={};
  for(const [lab,key] of WHO){ for(const k in CHAR.SIT_FIT) delete CHAR.SIT_FIT[k]; if(CHAR._ambReset) CHAR._ambReset(); const before=measure(key,true), beforeL=measure(key,false);
    Object.assign(CHAR.SIT_FIT,FIT); const after=measure(key,true), afterL=measure(key,false); res[key]={lab,before,after,beforeL,afterL}; }
  console.log('坐在椅面 0.47 m（Café、教室翻椅 0.47～0.475；Z3.chair 0.485、長椅 0.45）、桌面 0.75 m 前（pose sit、靜態坐姿）：改前 → 改後');
  for(const key in res){ const {lab,before:b,after:a,beforeL:bl,afterL:al}=res[key];
    console.log('  '+lab.padEnd(7)+(a.skirt?'（裙）':'　　')+' 往下 '+b.drop.toFixed(3)+' → '+a.drop.toFixed(3)+'｜大腿底部比椅面 '+cm(b.thigh-SEAT)+' → '+cm(a.thigh-SEAT)+'｜骨盆離座位地面 '+b.hips.toFixed(3)+' → '+a.hips.toFixed(3)+
      '｜離桌面：肩膀 '+cm(b.sh-DESK)+' → '+cm(a.sh-DESK)+'、手肘 '+cm(b.el-DESK)+' → '+cm(a.el-DESK)+'、眼睛 '+cm(b.eye-DESK)+' → '+cm(a.eye-DESK));
    console.log('  '+' '.repeat(9)+'腳踝比站著：一般椅子 '+cm(b.ank-b.ra)+' → '+cm(a.ank-a.ra)+'、階梯教室（sitFeet 關）'+cm(bl.ank-bl.ra)+' → '+cm(al.ank-al.ra)+'｜膝蓋（階梯教室）關節高 '+bl.kneeY.toFixed(3)+' → '+al.kneeY.toFixed(3)+'、前緣在座位點前 '+al.kneeFront.toFixed(3)+' m、置物架範圍裡最高 '+(bl.kneeTop>0?bl.kneeTop.toFixed(3):'（沒伸到）')+' → '+(al.kneeTop>0?al.kneeTop.toFixed(3):'（沒伸到）')); }
  const pants=Object.values(res).filter(r=>!r.after.skirt), bad=pants.filter(r=>!(r.after.thigh-SEAT>=-0.015&&r.after.thigh-SEAT<=0.005));
  check('① 改後：褲子的人大腿底部在 0.47 椅面下 1.5 cm、上 0.5 cm 以內（'+pants.length+' 個人；裙子 '+(Object.keys(res).length-pants.length)+' 個另外列）',pants.length>=6&&!bad.length,bad.map(r=>r.lab+' '+cm(r.after.thigh-SEAT)).join('、')||'都在範圍裡');
  const f=res['char.npc_f1'], mm=res['char.npc_m1'];
  check('② 改前：女生 npc_f1 陷進 0.47 椅面 8 cm 以上（原本的問題量得到）',!!f&&f.before.thigh-SEAT<=-0.08,f?cm(f.before.thigh-SEAT):'');
  check('③ 男生 vroid_npc_m1：改前也陷 4 cm 以上、改後往上 3～6 cm',!!mm&&mm.before.thigh-SEAT<=-0.04&&mm.before.drop-mm.after.drop>=0.03&&mm.before.drop-mm.after.drop<=0.06,mm?cm(mm.before.thigh-SEAT)+'；往下 '+mm.before.drop.toFixed(4)+' → '+mm.after.drop.toFixed(4):'');
  check('④ 改後肩膀離桌面 ≥ 20 cm：女生 npc_f1、男生 npc_m1',!!f&&!!mm&&f.after.sh-DESK>=0.20&&mm.after.sh-DESK>=0.20,f&&mm?'女生 '+cm(f.before.sh-DESK)+' → '+cm(f.after.sh-DESK)+'、男生 '+cm(mm.before.sh-DESK)+' → '+cm(mm.after.sh-DESK):'');
  const badF=Object.values(res).filter(r=>Math.abs(r.after.ank-r.after.ra)>0.01);
  check('⑤ 一般椅子（sitFeet）：改後每個人腳踝離站著的高度 ±1 cm（腳懸空的往下放）',!badF.length,badF.map(r=>r.lab+' '+cm(r.after.ank-r.after.ra)).join('、')||'都踩在地上');
  /* ⑥ 階梯教室的桌下置物架：從 201 的正式模型讀第一排的架底（座位點前 0.435～0.745、平台上 0.45～0.70 的 desks_steel 頂點最低的那一個）*/
  let shelf=null;
  { const p=path.join(ROOT,'assets/models/env/classroom_201.glb'), d=fs.readFileSync(p), n=d.readUInt32LE(12), J=JSON.parse(d.slice(20,20+n).toString('utf8')), bo=20+n+8;
    const CL=(()=>{ const s=fs.readFileSync(path.join(ROOT,'src/data/classroom_layout.js'),'utf8'); return JSON.parse(s.slice(s.indexOf('{'),s.lastIndexOf('}')+1)); })();
    const h=CL.rise, seatZ=CL.rowZ0+CL.seat.dz; const m=J.meshes.find(q=>q.name==='desks_steel');
    if(m) for(const pr of m.primitives){ const a=J.accessors[pr.attributes.POSITION], bv=J.bufferViews[a.bufferView], st=bv.byteStride||12, off=bo+(bv.byteOffset||0)+(a.byteOffset||0);
      for(let k=0;k<a.count;k++){ const y=d.readFloatLE(off+k*st+4), z=d.readFloatLE(off+k*st+8), f=seatZ-z;   /* 學生面向 −z：座位點前 f 公尺 */
        if(f>=0.435&&f<=0.745&&y-h>=0.45&&y-h<=0.70&&(shelf===null||y-h<shelf)) shelf=y-h; } } }
  const hits=(top)=>Object.values(res).filter(r=>r.afterL.kneeTop>0&&r.afterL.kneeTop>top-0.015);
  check('⑥ 階梯教室：改後膝蓋在置物架範圍裡的最高點比架底（201 正式模型 '+(shelf!=null?shelf.toFixed(3):'讀不到')+' m）低 1.5 cm 以上；原本的架底 0.515 會撞到',shelf!=null&&!hits(shelf).length&&hits(0.515).length>0,
    '現在的架底：'+(hits(shelf==null?0:shelf).map(r=>r.lab+' '+r.afterL.kneeTop.toFixed(3)).join('、')||'都沒撞到')+'；架底 0.515：'+(hits(0.515).map(r=>r.lab+' '+r.afterL.kneeTop.toFixed(3)).join('、')||'沒人撞到'));
  console.log(fails?('FAILS: '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });

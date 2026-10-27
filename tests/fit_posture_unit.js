// 健身的 3D 體態第一階段（FIT-3D-BODY-1027，USER_WANTS D40；LAWWW2-C 2026-10-27）：體能越高，祐廷站、走的時候越挺（挺胸、肩膀往後、下巴微收）；不改身體形狀。
// 檢查：① FIT.sync 照體能四階設 u.posture（普通沒有）② 真的 VRM（祐廷）：經常鍛鍊比普通肩膀往後、頭往後 ≥ 2 cm、肩膀不變窄 ③ 跑很多格不會累加
//       ④ 坐著、有疊加姿勢（羽球、開門）時不加 ⑤ 拿掉以後完全回到原樣（沒有殘留）。不需要瀏覽器。用法：node tests/fit_posture_unit.js
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
(async()=>{
  vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..','src/fit3d.js'),'utf8').replace(/^const FIT\s*=/m,'globalThis.FIT='),{filename:'src/fit3d.js'});
  check('① FIT.POSTURE 有四階（普通 null）',Array.isArray(FIT.POSTURE)&&FIT.POSTURE.length===4&&FIT.POSTURE[0]===null&&!!FIT.POSTURE[3]);
  if(!Array.isArray(FIT.POSTURE)){ console.log('FAILED '+fails); process.exit(1); }
  { const got=[0,30,60,90].map(f=>{ const o={userData:{}}; FIT.sync({G:{day:30,daily:{gym:{fit:f}},flags:{}},E:{player:{obj:o}}}); return o.userData.posture; });
    check('① FIT.sync 照體能設 u.posture：0→沒有、30→有在運動、60→結實、90→經常鍛鍊',got[0]===null&&got[1]===FIT.POSTURE[1]&&got[2]===FIT.POSTURE[2]&&got[3]===FIT.POSTURE[3]); }
  await preload(['char.yuting']);
  const h=CHAR.build({id:'player',model:'char.yuting',height:1.75,sex:'m'}); const u=h.userData;
  if(u.driver!=='vrm'){ check('（前提）祐廷的 VRM 載得到',false,u.driver); console.log('FAILED '+fails); process.exit(1); }
  const step=(n,st)=>{ for(let i=0;i<n;i++) CHAR.animate(h,1/30,st||{pose:'idle',speed:0}); h.updateMatrixWorld(true); };
  const meas=()=>{ const H=u.vrm.humanoid, g=n=>new THREE.Vector3().setFromMatrixPosition(H.getRawBoneNode(n).matrixWorld); const hip=g('hips'), rs=g('rightUpperArm'), ls=g('leftUpperArm'), hd=g('head');
    const right=rs.clone().sub(ls); right.y=0; right.normalize(); const fw=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),right); const f=v=>v.clone().sub(hip).dot(fw);
    return {sh:(f(rs)+f(ls))/2, hd:f(hd), w:rs.distanceTo(ls)}; };
  const at=(post,n,st)=>{ u.posture=post; u.anim.t=0; step(n||1,st); return meas(); };   /* 同一個動畫時間點比較（idle 有呼吸）*/
  const base=at(null,1), top=at(FIT.POSTURE[3],1), mid=at(FIT.POSTURE[1],1);
  const cm=v=>(v*100).toFixed(1)+' cm';
  check('② 經常鍛鍊：肩膀往後 ≥ 2 cm、頭往後 ≥ 2 cm（比普通）',base.sh-top.sh>=0.02&&base.hd-top.hd>=0.02,'肩 '+cm(base.sh-top.sh)+'、頭 '+cm(base.hd-top.hd));
  check('② 有在運動介於中間（比普通挺、比經常鍛鍊少）',base.sh-mid.sh>0.004&&mid.sh>top.sh,'肩 '+cm(base.sh-mid.sh));
  check('② 肩膀不變窄（往後打開，不是聳肩縮起來）',top.w>=base.w-0.002,cm(top.w)+' vs '+cm(base.w));
  { u.posture=FIT.POSTURE[3]; u.anim.t=0; step(1); const a=meas(); u.anim.t=0; step(1); const b=meas(); for(let i=0;i<300;i++){ u.anim.t=0; step(1); } const c=meas();
    check('③ 一直播不會累加（同一個動畫時間點，第 1、2、302 格一樣）',Math.abs(a.sh-c.sh)<0.002&&Math.abs(a.hd-c.hd)<0.002&&Math.abs(a.sh-b.sh)<0.002,cm(a.sh)+' '+cm(b.sh)+' '+cm(c.sh)); }
  { const s0=at(null,40,{pose:'sit',speed:0}), s3=at(FIT.POSTURE[3],40,{pose:'sit',speed:0}); check('④ 坐著不加（坐姿一樣）',Math.abs(s0.sh-s3.sh)<0.003&&Math.abs(s0.hd-s3.hd)<0.003,cm(s0.sh-s3.sh)); }
  { u.posture=null; step(120); u.overlay={bones:{RightArm:[0,1.2,0]},k:1}; const o0=at(null,1), o3=at(FIT.POSTURE[3],1);   /* 先站回來（坐→站的動作淡入要時間）*/ u.overlay=null; check('④ 有疊加姿勢（羽球、開門）的時候不加',Math.abs(o0.sh-o3.sh)<0.003&&Math.abs(o0.hd-o3.hd)<0.003,cm(o0.sh-o3.sh)); }
  { at(FIT.POSTURE[3],30); const back=at(null,1);   /* base 也是站好以後量的 */ check('⑤ 拿掉以後回到原樣（沒有殘留）',Math.abs(back.sh-base.sh)<0.002&&Math.abs(back.hd-base.hd)<0.002,cm(back.sh-base.sh)); }
  const ch=fs.readFileSync(path.join(__dirname,'..','src/character3d.js'),'utf8'); check('⑥ character3d.js：體態在疊加姿勢後面、只在 idle／walk／run／talk',/if\(u\.posture\|\|u\.postQ\)\{ const on=!\(u\.overlay&&u\.overlay\.bones\)&&!!u\.posture&&\(pose==='idle'\|\|pose==='walk'\|\|pose==='run'\|\|pose==='talk'\)/.test(ch));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

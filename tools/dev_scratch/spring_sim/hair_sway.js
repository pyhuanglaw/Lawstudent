// 頭髮會不會擺（彈簧骨有沒有作用）：站著 2 秒 → 往前跑 1 秒（3.6 m/s）→ 急停、0.4 秒內轉身 90°（遊戲裡轉身也是幾個畫格）→ 再站 1.5 秒；
// 量每個彈簧骨末端相對頭骨（頭的座標系）的最大偏移：太小＝整束綁死（不會動）、太大＝甩出去（像 v9.3 #25）。
// 用法：CHAR_FILE=試作.vrm node tools/dev_scratch/spring_sim/hair_sway.js char.heroine_02
const {preload}=require('./harness.js');
const key=process.argv[2]||'char.heroine_02';
const scene=new THREE.Scene();
(async()=>{
  await preload([key]);
  const h=CHAR.build({model:key}); scene.add(h); const vrm=h.userData.vrm, sbm=vrm.springBoneManager; const head=vrm.humanoid.getRawBoneNode('head');
  const tips=[...sbm.joints].filter(j=>!j.child&&/Hair/.test(j.bone.name));
  if(!tips.length){ console.log(key,'沒有頭髮的彈簧骨'); process.exit(1); }
  const local=()=>{ scene.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(head.matrixWorld).invert(); return tips.map(j=>{ const p=new THREE.Vector3(); j.bone.getWorldPosition(p); return p.applyMatrix4(inv); }); };
  const dt=1/30; let t=0; while(t<2){ CHAR.animate(h,dt,{pose:'idle',speed:0}); t+=dt; }
  const rest=local(); let maxd=0, names=tips.map(j=>j.bone.name);
  const track=()=>{ const cur=local(); cur.forEach((p,i)=>{ maxd=Math.max(maxd,p.distanceTo(rest[i])); }); };
  t=0; while(t<1){ h.position.z+=3.6*dt; CHAR.animate(h,dt,{pose:'run',speed:3.6}); track(); t+=dt; }
  t=0; while(t<0.4){ h.rotation.y+=Math.PI/2*dt/0.4; CHAR.animate(h,dt,{pose:'idle',speed:0}); track(); t+=dt; }
  t=0; while(t<1.5){ CHAR.animate(h,dt,{pose:'idle',speed:0}); track(); t+=dt; }
  const settle=local(); const back=Math.max(...settle.map((p,i)=>p.distanceTo(rest[i])));
  // 每條鏈的長度（最後一節骨頭的位置到鏈的第一節，站著時）：偏移上限＝這個距離（約等於擺 60°；長馬尾本來就擺得多）
  const len=Math.max(...tips.map((j,i)=>{ let b=j.bone; while(b.parent&&/Hair/.test(b.parent.name)) b=b.parent; const a=new THREE.Vector3(), c=new THREE.Vector3(); b.getWorldPosition(a); j.bone.getWorldPosition(c); return a.distanceTo(c); }));
  console.log(`${key}: ${tips.length} 個頭髮彈簧骨末端（${[...new Set(names.map(n=>n.replace(/\d+$/,'')))].join('、')}）；最長的鏈 ${(len*100).toFixed(1)} cm；跑步＋急停急轉時最大偏移 ${(maxd*100).toFixed(1)} cm；停下 1.5 秒後 ${(back*100).toFixed(1)} cm`);
  const ok=maxd>0.005&&maxd<Math.max(0.02,len)&&back<0.02;
  console.log(ok?'PASS':'FAIL', '（標準：會動 > 0.5 cm、不甩出去：偏移小於鏈長（約 60°）、停下後回到 2 cm 內）'); process.exit(ok?0:1);
})().catch(e=>{ console.error('ERR',e); process.exit(2); });

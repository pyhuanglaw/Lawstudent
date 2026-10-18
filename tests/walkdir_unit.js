// 人物走路的方向和看起來的方向一致（2026-10-18 使用者玩 v9.10：「人走路會往後走、也會往左後方、左前方走，但看起來動作是往前走」）——不需要瀏覽器。
// 原因：路人先用備用模型、正式 VRM 載好後換（character3d.js 的 CHAR.upgrade），原本用 quaternion.copy 帶朝向；朝向超過 ±90° 時四元數換回 Euler
// 會變成 (π, π−y, π)，引擎之後只改 rotation.y（stepEntity 轉向），看起來的方向變成 π−y。
// 檢查：① 朝向 2.5 rad 的人物換模型以後 rotation 還是 (0, 2.5, 0)；② engine3d.js 的 flatYaw 把已經變成 (π, π−y, π) 的改回 (0, y, 0)，看起來的方向不變；
//       ③ 改回以後只轉 rotation.y，看起來的方向跟著轉（不是反過來）。修改前 ① 失敗（(3.14, 0.64, 3.14)）。
// 用法：node tests/walkdir_unit.js
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const fwd=o=>{ o.updateMatrixWorld(true); const v=new THREE.Vector3(0,0,1).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion())); return Math.atan2(v.x,v.z); };
const ang=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
(async()=>{
  await preload(['char.npc_nf5']);
  const spec={id:'x1',model:'char.npc_nf5',height:1.62,sex:'f'};
  const h=CHAR.build(spec); h.rotation.y=2.5; h.position.set(1,0,2);
  const nh=CHAR.upgrade(h)||(()=>{ h.userData.driver='proc'; return CHAR.upgrade(h); })();
  check('① 換模型以後 rotation 還是 (0, 2.5, 0)（不是 (π, 0.64, π)）',!!nh&&Math.abs(nh.rotation.x)<1e-6&&Math.abs(nh.rotation.z)<1e-6&&Math.abs(nh.rotation.y-2.5)<1e-6,nh?[nh.rotation.x,nh.rotation.y,nh.rotation.z].map(v=>v.toFixed(2)).join(','):'沒有換');
  // engine3d.js 的 flatYaw（照原始碼取出來，不載入整個引擎）
  const src=fs.readFileSync(path.join(__dirname,'..','src/engine3d.js'),'utf8'); const m=/function flatYaw\(o\)\{[^\n]*?\} \}/.exec(src);
  check('engine3d.js 有 flatYaw',!!m); if(!m){ console.log('FAILED: '+fails); process.exit(1); }
  const flatYaw=vm.runInThisContext('('+m[0]+')');
  const g=new THREE.Group(); g.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),2.5); const before=fwd(g);
  check('（前提）四元數換回 Euler：朝向 2.5 rad 會變成 (π, π−2.5, π)',Math.abs(Math.abs(g.rotation.x)-Math.PI)<1e-3&&Math.abs(g.rotation.y-(Math.PI-2.5))<1e-3,[g.rotation.x,g.rotation.y,g.rotation.z].map(v=>v.toFixed(2)).join(','));
  flatYaw(g); check('② flatYaw 改回 (0, 2.5, 0)、看起來的方向不變',Math.abs(g.rotation.x)<1e-6&&Math.abs(g.rotation.z)<1e-6&&ang(g.rotation.y,2.5)<1e-3&&ang(fwd(g),before)<1e-3,[g.rotation.y.toFixed(2),fwd(g).toFixed(2),before.toFixed(2)].join(' '));
  g.rotation.y+=0.3; check('③ 之後轉 rotation.y +0.3，看起來的方向也 +0.3',ang(fwd(g),before+0.3)<1e-3,fwd(g).toFixed(2));
  const r=new THREE.Group(); r.rotation.set(0,1,0.08); flatYaw(r); check('騎車的側傾（z 小角度）不動',Math.abs(r.rotation.z-0.08)<1e-9&&r.rotation.y===1);
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})();

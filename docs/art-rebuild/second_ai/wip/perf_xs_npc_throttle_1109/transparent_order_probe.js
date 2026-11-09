// 透明的臉部網格（renderOrder 相同的那幾個）在畫面上的先後：用「第一次畫時算的包圍球」（站著／走路／坐著第一次出現）vs「靜止網格的包圍球」，
// 鏡頭在頭的四周（16 個方向 × 3 個高度 × 2 個距離），照 three.js 透明物件排序（renderOrder、z 由遠到近）比先後順序
const W=process.env.WT; process.chdir(W);
const {preload}=require(W+'/tools/dev_scratch/spring_sim/harness.js');
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.yuting','char.heroine_01','char.heroine_02','char.heroine_04','char.heroine_05','char.npc_f1','char.npc_m1'];
const rest=g=>{ const p=g.attributes.position, b=new THREE.Box3().setFromBufferAttribute(p), s=new THREE.Sphere(); b.getCenter(s.center); let r2=0; const v=new THREE.Vector3(); for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); r2=Math.max(r2,s.center.distanceToSquared(v)); } s.radius=Math.sqrt(r2); return s; };
(async()=>{ await preload(keys.filter(k=>ASSETS.manifest[k]));
  { const fs=require('fs'),path=require('path'); const k='char.ual_sit_clips', u=ASSETS.manifest[k]&&ASSETS.manifest[k].url; if(u&&fs.existsSync(path.join(W,u))){ window.ASSET_DATA[u]=fs.readFileSync(path.join(W,u)).toString('base64'); await ASSETS.loadOne(k).catch(()=>null); } }
  const scene=new THREE.Scene(); const cam=new THREE.PerspectiveCamera(50,390/844,0.1,300); let tot=0, diff=0; const ex=[];
  for(const key of keys){ if(!ASSETS.manifest[key]) continue; const H=ASSETS.manifest[key].height||1.65;
    const h=CHAR.build({model:key,height:H}); scene.add(h); h.position.set(3,0,-2); h.rotation.y=0.7;
    for(const first of ['idle','walk','sit']){
      // 第一次畫的時候的姿勢 → 那時候算的包圍球（現在的做法）
      h.userData.sitDrop=first==='sit'?0.47:h.userData.sitDrop; for(let i=0;i<30;i++) CHAR.animate(h,1/30,{pose:first,speed:first==='walk'?1.3:0,ground:()=>0}); scene.updateMatrixWorld(true);
      const parts=[]; h.traverse(o=>{ if(o.isSkinnedMesh&&o.visible&&[].concat(o.material).some(m=>m.transparent)){ o.boundingSphere=null; o.computeBoundingSphere(); parts.push({o,old:o.boundingSphere.clone(),neu:rest(o.geometry)}); } });
      // 之後玩家看到的姿勢：三種都看
      for(const now of ['idle','sit']){ h.userData.sitDrop=now==='sit'?0.47:h.userData.sitDrop; for(let i=0;i<20;i++) CHAR.animate(h,1/30,{pose:now,speed:0,ground:()=>0}); scene.updateMatrixWorld(true);
        const head=h.userData.vrm.humanoid.getRawBoneNode('head').getWorldPosition(new THREE.Vector3());
        for(let a=0;a<16;a++) for(const dy of [-0.3,0,0.4]) for(const dist of [0.9,2.5]){ cam.position.set(head.x+Math.sin(a*Math.PI/8)*dist,head.y+dy,head.z+Math.cos(a*Math.PI/8)*dist); cam.lookAt(head); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
          const PS=new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);
          const order=k=>parts.map((p,i)=>{ const v=new THREE.Vector4(p[k].center.x,p[k].center.y,p[k].center.z,1).applyMatrix4(p.o.matrixWorld).applyMatrix4(PS); return {i,ro:p.o.renderOrder,z:v.z,id:p.o.id}; })
            .sort((x,y)=>x.ro!==y.ro?x.ro-y.ro:(x.z!==y.z?y.z-x.z:x.id-y.id)).map(x=>x.i).join(',');
          tot++; const A=order('old'), B=order('neu'); if(A!==B){ diff++; if(ex.length<12) ex.push(`${key} 第一次畫=${first} 現在=${now} 方向${a} 高${dy} 距${dist}：${A.split(',').map(i=>parts[i].o.name.replace(/baked/,'')).join('>')}  →  ${B.split(',').map(i=>parts[i].o.name.replace(/baked/,'')).join('>')}`); } } } }
    scene.remove(h); CHAR.release(h); }
  console.log(`透明臉部網格的畫的順序：${tot} 個鏡頭位置裡 ${diff} 個不同（${(100*diff/tot).toFixed(1)}%）`); ex.forEach(e=>console.log('  '+e));
  process.exit(0);
})().catch(e=>{ console.log('ERR',e&&e.stack||e); process.exit(1); });

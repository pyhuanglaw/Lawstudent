// 肌肉線條評估（GYM-FIT-1107）：玩家模型的骨頭加粗（只加粗、不加長；子骨頭反向抵銷），匯出 OBJ 給 Blender 拍
const path=require('path'), fs=require('fs'); const WT=process.env.WT; const {preload}=require(path.join(WT,'tools/dev_scratch/spring_sim/harness.js'));
const out=process.argv[2], key='char.yuting';
(async()=>{ fs.mkdirSync(out,{recursive:true}); await preload([key]); const scene=new THREE.Scene(), V=new THREE.Vector3();
 for(const lv of [0,0.5,1]){ const m=ASSETS.manifest[key], h=CHAR.build({model:key,height:m.height}); scene.add(h); const u=h.userData, raw=n=>u.vrm.humanoid.getRawBoneNode(n);
  const s=1+0.12*lv, c=1+0.06*lv;
  // 手臂：長軸 x → 加粗 y、z；手掌抵銷。大腿：長軸 y → 加粗 x、z；腳掌抵銷。胸口：寬 x、厚 z（肩膀跟著寬）；脖子抵銷
  for(const sd of ['left','right']){ raw(sd+'UpperArm').scale.set(1,s,s); raw(sd+'Hand').scale.set(1,1/s,1/s); raw(sd+'UpperLeg').scale.set(1+(s-1)*0.6,1,1+(s-1)*0.6); raw(sd+'Foot').scale.set(1/(1+(s-1)*0.6),1,1/(1+(s-1)*0.6)); }
  const ch=raw('upperChest')||raw('chest'); ch.scale.set(c,1,c); raw('neck').scale.set(1/c,1,1/c);
  for(let i=0;i<12;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0}); scene.updateMatrixWorld(true);
  let obj='', nv=0; const mtl={};
  h.traverse(x=>{ if(!x.isMesh||!x.visible||/blobShadow|npc_far/.test(x.name||'')) return; const g=x.geometry, pa=g.attributes.position; for(let v=0;v<pa.count;v++){ x.getVertexPosition(v,V); x.localToWorld(V); obj+='v '+V.x.toFixed(4)+' '+V.y.toFixed(4)+' '+V.z.toFixed(4)+'\n'; }
   const idx=g.index?g.index.array:null, ms=Array.isArray(x.material)?x.material:[x.material], groups=g.groups&&g.groups.length?g.groups:[{start:0,count:idx?idx.length:pa.count,materialIndex:0}];
   for(const gr of groups){ const mn=((ms[gr.materialIndex]||ms[0])||{}).name||''; if(/Outline/.test(mn)) continue; const k=/SKIN|Face/i.test(mn)?'skin':(/HAIR/i.test(mn)?'hair':(/Bottom|Pants/i.test(mn)?'pants':(/Shoe|Sneaker|Loafer/i.test(mn)?'shoe':'top'))); obj+='usemtl '+k+'\n'; for(let i=gr.start;i<gr.start+gr.count;i+=3) obj+='f '+(nv+(idx?idx[i]:i)+1)+' '+(nv+(idx?idx[i+1]:i+1)+1)+' '+(nv+(idx?idx[i+2]:i+2)+1)+'\n'; }
   nv+=pa.count; });
  fs.writeFileSync(path.join(out,'fit_'+lv+'.obj'),'mtllib m.mtl\n'+obj); scene.remove(h); console.log('lv',lv,'verts',nv); }
 fs.writeFileSync(path.join(out,'m.mtl'),'newmtl skin\nKd 0.93 0.8 0.71\nnewmtl hair\nKd 0.2 0.15 0.12\nnewmtl pants\nKd 0.25 0.3 0.42\nnewmtl shoe\nKd 0.15 0.15 0.16\nnewmtl top\nKd 0.82 0.84 0.86\n');
})().catch(e=>{ console.error(e); process.exit(2); });

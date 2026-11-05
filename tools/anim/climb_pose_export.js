// 祐廷在宿舍 L2 梯子某一階的遊戲姿勢（climb＝爬上去面向牆／climbdown＝爬下來面向房間；headMax、climbTop 照 story3d.js）匯出成 OBJ＋MTL（遊戲座標）。
// DORM-LADDER-HEAD-GRIP-1102（LAWWW2-C 2026-11-05）：給 tools/blender/env_second/dorm_ladder_preview.py 拍扶手、手抓的點（sleep_scene.grips）的對照圖。做法同 tools/anim/sit_pose_export.js。
// 用法（開發分支）：node tools/anim/climb_pose_export.js 輸出資料夾 [up:1,up:3,down:1]（第幾階，1＝最下面）
const path=require('path'), fs=require('fs');
const ROOTDIR=path.resolve(__dirname,'../..'), LAY=JSON.parse(fs.readFileSync(path.join(ROOTDIR,'assets/models/env/second_ai/dorm_room4.layout.json'),'utf8'));
const OUT=process.argv[2], JOBS=(process.argv[3]||'up:1').split(',');
const {preload}=require(path.join(ROOTDIR,'tools/dev_scratch/spring_sim/harness.js'));
const COL=n=>{ n=String(n||''); if(/HAIR/i.test(n)) return [0.30,0.22,0.17]; if(/SKIN|FACE|Face_/i.test(n)) return [0.93,0.80,0.71]; if(/EYE|Iris|Brow|lash|line|Mouth/i.test(n)) return [0.25,0.2,0.2];
  if(/Shoe|Loafer|Sneaker|Boot/i.test(n)) return [0.18,0.18,0.2]; if(/Bottom|Pants|Skirt|Jeans/i.test(n)) return [0.25,0.32,0.48]; if(/Top|Shirt|Knit|Hood|Jacket|Coat|Onepiece|Dress|CLOTH/i.test(n)) return [0.62,0.70,0.80]; return [0.6,0.6,0.62]; };
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); await preload(['char.yuting']);
  const U=LAY.units.find(u=>u.id==='L2'), sc=U.sleep_scene, st=sc.steps, n=st.length, scene=new THREE.Scene(), V=new THREE.Vector3();
  const up=Math.atan2(st[n-1][0]-st[0][0],st[n-1][2]-st[0][2]);
  for(const job of JOBS){ const [dn,ks]=job.split(':'), k=+ks-1, s=st[k];
    const h=CHAR.build({model:'char.yuting',height:1.75}); scene.add(h); h.position.set(s[0],s[1],s[2]); h.rotation.y=dn==='up'?up:up+Math.PI; h.userData.headMax=sc.head_max; h.userData.climbTop=(sc.lie.mattress_top_y||1.86)+0.26; scene.updateMatrixWorld(true);
    for(let i=0;i<8;i++){ CHAR.animate(h,1/30,{pose:'idle',speed:0}); scene.updateMatrixWorld(true); } for(let i=0;i<40;i++){ CHAR.animate(h,1/30,{pose:dn==='up'?'climb':'climbdown',speed:0}); scene.updateMatrixWorld(true); }
    let obj='mtllib '+job.replace(':','_')+'.mtl\n', mtl='', nv=0, mats={};
    h.traverse(o=>{ if(!o.isMesh||!o.visible||/blobShadow/i.test(o.name||'')) return; let vis=true; for(let p=o;p;p=p.parent) if(p.visible===false) vis=false; if(!vis) return;
      const ms=Array.isArray(o.material)?o.material:[o.material], g=o.geometry, pa=g.attributes.position; if(!pa) return;
      for(let v=0;v<pa.count;v++){ if(o.isSkinnedMesh||o.morphTargetInfluences) o.getVertexPosition(v,V); else V.fromBufferAttribute(pa,v); o.localToWorld(V); obj+='v '+V.x.toFixed(4)+' '+V.y.toFixed(4)+' '+V.z.toFixed(4)+'\n'; }
      const idx=g.index?g.index.array:null, groups=g.groups&&g.groups.length?g.groups:[{start:0,count:idx?idx.length:pa.count,materialIndex:0}];
      for(const gr of groups){ const mt=ms[gr.materialIndex]||ms[0], mn=(mt&&mt.name)||o.name||'m'; if(/\(Outline\)/.test(mn)) continue; const id='m'+Object.keys(mats).length; if(!mats[mn]){ mats[mn]=id; mtl+='newmtl '+id+'\nKd '+COL(mn+'|'+o.name).join(' ')+'\n'; }
        obj+='usemtl '+mats[mn]+'\n'; for(let i=gr.start;i<gr.start+gr.count;i+=3){ const a=idx?idx[i]:i, b=idx?idx[i+1]:i+1, c=idx?idx[i+2]:i+2; obj+='f '+(nv+a+1)+' '+(nv+b+1)+' '+(nv+c+1)+'\n'; } }
      nv+=pa.count; });
    fs.writeFileSync(path.join(OUT,job.replace(':','_')+'.obj'),obj); fs.writeFileSync(path.join(OUT,job.replace(':','_')+'.mtl'),mtl); console.log(job,'頂點',nv); scene.remove(h); if(CHAR.release) CHAR.release(h); }
})().catch(e=>{ console.error(e); process.exit(2); });

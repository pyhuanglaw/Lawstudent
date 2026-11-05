// 宿舍上舖梯子：靠床那一側的扶手、每一階兩手抓的點（DORM-LADDER-HEAD-GRIP-1102 ②，LAWWW2-C 2026-11-05）。
// LAWWW 爬梯子手勢（CLIMB-POSE-1102）README「只有一邊有扶手……靠床那一側的手在低幾階時是抓在空中」→ dorm_room4.py 加靠床那一側的扶手、sleep_scene 多 grips／rails。
// 在 Node 裡用遊戲的祐廷（char.yuting）、遊戲的 climb（爬上去，面向牆）／climbdown（爬下來，面向房間）姿勢，在玩家那一組（L2）每一階量：
//   ① sleep_scene.grips.up／down 每一階 [左手, 右手]、和 steps 一樣多；最上面一階以外兩手都有點（最上面一階＝轉身跪上床／從床上下來，可以是 null）
//   ② 每個點都在扶手（中心線）或床尾板上緣上：離 rails 的折線 ≤ 6 mm
//   ③ 正式模型 dorm_room4.glb 真的有靠床那一側的扶手：dorm_frame_white 有頂點在新扶手下半段（直段）上、LOFT_L2_frame 有頂點在上半段（斜段）上
//      （改前的 GLB 沒有：DORM_GLB=舊檔 node tests/dorm_ladder_grips_unit.js 這一項失敗）
//   ④ 搆得到：遊戲姿勢的肩膀到抓的點 0.18～0.53 m（祐廷肩膀到手腕 0.46＋手掌）
//   ⑤ 左手抓在人的左邊、右手在右邊（離身體中線 ≥ 5 cm）
//   ⑥ 不在牆裡：抓的點離牆 ≥ 3 cm（現在的 climbIK 在最上面兩階手會伸進牆 6～24 cm）
//   ⑦ 新扶手不碰人：每一階爬上、爬下，加上跪在上床點、從上床點挪到最上面一階的中間三個位置，身體（手臂以外）離新扶手表面 ≥ 2.5 cm（門那一側的舊扶手約 3～4 cm）
//   ⑧ 不擋上床的開口：新扶手在床板以上的部分都在床尾板那一半（離牆 ≥ 0.47 m）
//   ⑨ 遊戲的 src/data/dorm_room_layout.js（有的話）和 layout.json 的 grips 一樣（LAWWW 換 layout 以後要跑 python3 tools/gen_dorm_room_layout.py）
// 另外印每一階的頭頂高度（離天花板多少；headFit 照 sleep_scene.head_max 彎腰）。
// 用法：node tests/dorm_ladder_grips_unit.js（DORM_GLB＝別的 GLB 檔：拿改前的檔案比）
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path');
const LAY=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/dorm_room4.layout.json'),'utf8'));
const GLB=process.env.DORM_GLB?path.resolve(process.env.DORM_GLB):path.join(ROOT,'assets/models/env/second_ai/dorm_room4.glb');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v*100).toFixed(1)+' cm';
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]], dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2], len=a=>Math.hypot(a[0],a[1],a[2]);
const segD=(p,a,b)=>{ const ab=sub(b,a), L=dot(ab,ab); let t=L>0?dot(sub(p,a),ab)/L:0; t=Math.max(0,Math.min(1,t)); return len(sub(p,[a[0]+ab[0]*t,a[1]+ab[1]*t,a[2]+ab[2]*t])); };
const polyD=(p,P)=>{ let d=1e9; for(let i=0;i+1<P.length;i++) d=Math.min(d,segD(p,P[i],P[i+1])); return d; };
(async()=>{
  const U=LAY.units.find(u=>u.id===(LAY.player_unit||'L2')), sc=U.sleep_scene, G=sc.grips, RL=sc.rails||{}, st=sc.steps, n=st.length;
  const wallX=U.side==='L'?-(LAY.room.w/2-0.1):(LAY.room.w/2-0.1), vOf=x=>Math.abs(x-wallX);   /* 離牆多遠（沿床桌組的深度 v）*/
  /* ① */
  const ok1=!!G&&['up','down'].every(dn=>Array.isArray(G[dn])&&G[dn].length===n&&G[dn].every((r,k)=>Array.isArray(r)&&r.length===2&&(k===n-1||r.every(g=>g&&Array.isArray(g.p)))));
  check('① '+U.id+' 的 sleep_scene.grips：up、down 每一階 [左手, 右手]（'+n+' 階），最上面一階以外兩手都有點',ok1,G?['up','down'].map(dn=>dn+' '+(G[dn]||[]).map(r=>r.map(g=>g?g.on:'—').join('+')).join('、')).join('；'):'沒有 grips');
  if(!ok1){ console.log('FAILS: '+fails); process.exit(1); }
  /* ② */
  const RAILS=['door_rail','door_post','bed_rail','footboard_top','hoop'].filter(k=>Array.isArray(RL[k]));
  let worst2=0, w2='';
  for(const dn of ['up','down']) G[dn].forEach((r,k)=>r.forEach(g=>{ if(!g) return; const d=Math.min(...RAILS.map(k2=>polyD(g.p,RL[k2]))); if(d>worst2){ worst2=d; w2=dn+' 第 '+(k+1)+' 階 '+g.on; } }));
  check('② 每個點都在扶手中心線或床尾板上緣上（離 rails 折線 ≤ 6 mm）',RAILS.length===5&&worst2<=0.006,'最遠 '+cm(worst2)+(w2?'（'+w2+'）':'')+'；rails：'+RAILS.join('、'));
  /* ③ 正式模型裡有靠床那一側的扶手 */
  { const d=fs.readFileSync(GLB), nj=d.readUInt32LE(12), J=JSON.parse(d.slice(20,20+nj).toString('utf8')), bo=20+nj+8;
    const verts=nm=>{ const m=J.meshes.find(q=>q.name===nm), out=[]; if(!m) return out; for(const pr of m.primitives){ const a=J.accessors[pr.attributes.POSITION], bv=J.bufferViews[a.bufferView], s=bv.byteStride||12, off=bo+(bv.byteOffset||0)+(a.byteOffset||0);
      for(let i=0;i<a.count;i++) out.push([d.readFloatLE(off+i*s),d.readFloatLE(off+i*s+4),d.readFloatLE(off+i*s+8)]); } return out; };
    const B=RL.bed_rail||[], lo=B.length>2?B.slice(0,3):null, up=B.length>3?B.slice(2):null;   /* 下半段（踏板上的直段＋斜段到床板底）、上半段（床板底到床尾板的邊、彎進床尾板）*/
    const on=(V,P)=>!!P&&V.filter(p=>polyD(p,P)<0.02&&p[1]>B[0][1]+0.01).length;   /* 扶手（圓管半徑 1.6 cm）的頂點：每個轉折一圈 8 個 */
    const nLo=on(verts('dorm_frame_white'),lo), nUp=on(verts('LOFT_'+U.id+'_frame'),up);
    check('③ '+path.basename(GLB)+' 有靠床那一側的扶手：dorm_frame_white 有下半段、LOFT_'+U.id+'_frame 有上半段的圓管頂點',nLo>=16&&nUp>=16,'下半段 '+nLo+' 個、上半段 '+nUp+' 個頂點（離中心線 2 cm 內）'); }
  /* ④～⑦：遊戲的人物 */
  await preload(['char.yuting']);
  const scene=new THREE.Scene(), key='char.yuting', h=CHAR.build({model:key,height:ASSETS.manifest[key].height||1.75}); scene.add(h);
  const R=nm=>h.userData.vrm.humanoid.getRawBoneNode(nm), P=nm=>{ const v=new THREE.Vector3(); R(nm).getWorldPosition(v); return [v.x,v.y,v.z]; };
  const ARM=/Hand|Arm|Thumb|Index|Middle|Ring|Little|Shoulder/; const V=new THREE.Vector3();
  const bodyMin=(rail,r)=>{ let best=[1e9,'']; h.traverse(o=>{ if(!o.isSkinnedMesh||!o.visible) return; let vis=true; for(let q=o;q;q=q.parent) if(q.visible===false) vis=false; if(!vis) return;
      const g=o.geometry, pa=g.attributes.position, si=g.attributes.skinIndex, sw=g.attributes.skinWeight, bones=o.skeleton.bones;
      for(let v=0;v<pa.count;v+=2){ let bw=0,bn=''; for(let c=0;c<4;c++){ const w=sw.getComponent(v,c); if(w>bw){ bw=w; bn=(bones[si.getComponent(v,c)]||{}).name||''; } } if(ARM.test(bn)) continue;
        o.getVertexPosition(v,V); o.localToWorld(V); const d=polyD([V.x,V.y,V.z],rail)-r; if(d<best[0]) best=[d,bn.replace(/^J_Bip_|^J_Sec_/,'')]; } }); return best; };
  const pose=(p,ry,ps,frames)=>{ h.position.set(p[0],p[1],p[2]); h.rotation.y=ry; h.userData.headMax=sc.head_max; h.userData.climbTop=(sc.lie.mattress_top_y||1.86)+0.26; scene.updateMatrixWorld(true);
    for(let i=0;i<8;i++){ CHAR.animate(h,1/30,{pose:'idle',speed:0}); scene.updateMatrixWorld(true); } for(let i=0;i<frames;i++){ CHAR.animate(h,1/30,{pose:ps,speed:0}); scene.updateMatrixWorld(true); } };   /* 每一格更新矩陣（遊戲每一格都算圖）*/
  const up=Math.atan2(st[n-1][0]-st[0][0],st[n-1][2]-st[0][2]), down=up+Math.PI;   /* 爬上去面向牆（story3d.js 的 faceTo）；爬下來面向房間 */
  let reach=[1e9,-1e9], rw=[], sideBad=[], wallBad=[], clr={bed:[1e9,''],door:[1e9,'']}, heads=[];
  for(const [dn,ry,ps] of [['up',up,'climb'],['down',down,'climbdown']]) st.forEach((s,k)=>{ pose(s,ry,ps,40);
    const left=[Math.cos(ry),0,-Math.sin(ry)];   /* 人物的左邊（人物座標 +x 轉到世界）*/
    G[dn][k].forEach((g,j)=>{ if(!g) return; const sh=P(j?'rightUpperArm':'leftUpperArm'), r=len(sub(g.p,sh)); if(r<reach[0]) reach[0]=r; if(r>reach[1]) reach[1]=r; if(r<0.18||r>0.53) rw.push(dn+(k+1)+(j?'右':'左')+' '+cm(r));
      const lat=dot(sub(g.p,[s[0],s[1],s[2]]),left); if(j?lat>-0.05:lat<0.05) sideBad.push(dn+(k+1)+(j?'右':'左')+' '+cm(lat));
      if(vOf(g.p[0])<0.03) wallBad.push(dn+(k+1)+(j?'右':'左')+' 離牆 '+cm(vOf(g.p[0]))); });
    const b=bodyMin(RL.bed_rail,RL.r||0.016), dr=bodyMin(RL.door_rail,RL.r||0.016); if(b[0]<clr.bed[0]) clr.bed=[b[0],dn+(k+1)+' '+b[1]]; if(dr[0]<clr.door[0]) clr.door=[dr[0],dn+(k+1)+' '+dr[1]];
    if(CHAR.headTop) heads.push(dn+(k+1)+' '+(sc.ceil_y-CHAR.headTop(h)).toFixed(3)); });
  /* 跪在上床點、從上床點挪到最上面一階（climbdown，story3d.js 的 getUp） */
  const be=sc.bed_entry, top=st[n-1]; { const ry=Math.atan2(top[0]-be[0],top[2]-be[2]); pose(be,ry,'kneel',40); const b=bodyMin(RL.bed_rail,RL.r||0.016); if(b[0]<clr.bed[0]) clr.bed=[b[0],'跪在上床點 '+b[1]]; if(CHAR.headTop) heads.push('跪 '+(sc.ceil_y-CHAR.headTop(h)).toFixed(3));
    for(const t of [0.25,0.5,0.75]){ pose(be.map((v,i)=>v+(top[i]-v)*t),ry,'climbdown',30); const c=bodyMin(RL.bed_rail,RL.r||0.016); if(c[0]<clr.bed[0]) clr.bed=[c[0],'上床點→最上面一階 '+t+' '+c[1]]; } }
  check('④ 搆得到：祐廷（遊戲姿勢）肩膀到抓的點 0.18～0.53 m',!rw.length,'全部 '+cm(reach[0])+'～'+cm(reach[1])+(rw.length?'；超出：'+rw.join('、'):''));
  check('⑤ 左手抓在人的左邊、右手在右邊（離身體中線 ≥ 5 cm）',!sideBad.length,sideBad.join('、')||'都對');
  check('⑥ 抓的點不在牆裡（離牆 ≥ 3 cm）',!wallBad.length,wallBad.join('、')||'最近 '+cm(Math.min(...['up','down'].flatMap(dn=>G[dn].flat().filter(Boolean).map(g=>vOf(g.p[0]))))));
  check('⑦ 新扶手不碰人：身體（手臂以外）離新扶手表面 ≥ 2.5 cm（每一階爬上爬下、跪在上床點、挪到最上面一階）',clr.bed[0]>=0.025,'最近 '+cm(clr.bed[0])+'（'+clr.bed[1]+'）；門那一側舊扶手 '+cm(clr.door[0])+'（'+clr.door[1]+'）');
  /* ⑧ */
  const over=(RL.bed_rail||[]).filter(p=>p[1]>1.70&&vOf(p[0])<0.47);
  check('⑧ 新扶手在床板以上的部分不擋上床的開口（離牆 ≥ 0.47 m）',!!(RL.bed_rail||[]).length&&!over.length,over.length?over.map(p=>p.join(',')).join('；'):'床板以上最靠牆 '+Math.min(...(RL.bed_rail||[]).filter(p=>p[1]>1.70).map(p=>vOf(p[0]))).toFixed(3)+' m');
  /* ⑨ */
  const js=path.join(ROOT,'src/data/dorm_room_layout.js');
  if(fs.existsSync(js)){ const s=fs.readFileSync(js,'utf8'), DR=JSON.parse(s.slice(s.indexOf('{',s.indexOf('DORM_ROOM=')),s.lastIndexOf('}')+1)), u2=DR.units.find(u=>u.id===U.id);
    check('⑨ src/data/dorm_room_layout.js 的 grips 和 layout.json 一樣（換 layout 以後跑過 tools/gen_dorm_room_layout.py）',!!u2&&JSON.stringify(u2.sleep_scene.grips)===JSON.stringify(G)&&JSON.stringify(u2.sleep_scene.rails)===JSON.stringify(RL)); }
  else console.log('（沒有 src/data/dorm_room_layout.js：⑨ 在開發分支跑）');
  console.log('頭頂離天花板（m，'+sc.ceil_y+' m）：'+heads.join('、'));
  /* 給 LAWWW（不是這一包的檢查）：最上面三階走一個循環（60 格），腳（走路片段）最深伸進牆多少——CLIMB-POSE-1102 README 第 3 點「腳還是走路片段」*/
  { const deep=[]; for(const [dn,ry,ps] of [['爬上',up,'climb'],['爬下',down,'climbdown']]) for(let k=n-3;k<n;k++){ const s=st[k]; let d=0, who='';
      h.position.set(s[0],s[1],s[2]); h.rotation.y=ry; scene.updateMatrixWorld(true); for(let i=0;i<8;i++){ CHAR.animate(h,1/30,{pose:'idle',speed:0}); scene.updateMatrixWorld(true); }
      for(let i=0;i<60;i++){ CHAR.animate(h,1/30,{pose:ps,speed:0}); scene.updateMatrixWorld(true); if(i<15||i%4) continue;
        h.traverse(o=>{ if(!o.isSkinnedMesh||!o.visible) return; const g=o.geometry, pa=g.attributes.position, si=g.attributes.skinIndex, sw=g.attributes.skinWeight, bones=o.skeleton.bones;
          for(let v=0;v<pa.count;v+=3){ o.getVertexPosition(v,V); o.localToWorld(V); const e=0.0-vOf(V.x)*(Math.sign(V.x-wallX)===Math.sign(s[0]-wallX)?1:-1); if(e<=d) continue;
            let bw=0,bn=''; for(let c=0;c<4;c++){ const w=sw.getComponent(v,c); if(w>bw){ bw=w; bn=(bones[si.getComponent(v,c)]||{}).name||''; } } d=e; who=bn.replace(/^J_Bip_|^J_Sec_/,''); } }); }
      deep.push(dn+'第 '+(k+1)+' 階 '+(d>0?cm(d)+'（'+who+'）':'沒有')); }
    console.log('（給 LAWWW）身體伸進牆最深：'+deep.join('、')); }
  console.log(fails?('FAILS: '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });

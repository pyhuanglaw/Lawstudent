/* ART-PARK2 遊戲內截圖用（只在截圖時）：把 park2_props.glb 擺到 wz_park_layout.js 的位置，並暫時拿掉 wz_park.glb 裡舊的圓柱版鞦韆、健身器材的三角形（地面留著）。
   正式整合由 LAWWW2-B 改 wz_park.py／zones3d.js；這段不進遊戲。用法：把 park2_game_shots.json 裡的 "@park2_game_place.js" 換成這個檔案的內容，再跑 fast_shots.py。 */
(async()=>{
  if(window.__park2) return window.__park2;
  const E=GAME.E, g=E.zone.group;
  let pk=null;
  for(let i=0;i<240&&!pk;i++){ pk=g.getObjectByName('wz_park_glb'); if(!pk) await new Promise(r=>setTimeout(r,250)); }
  if(!pk) return (window.__park2='no wz_park_glb');
  // 只在截圖時：把舊的圓柱版鞦韆、健身器材的三角形拿掉（地面 y<=0.02 的留著）
  const boxes=[[30.55,34.65,23.95,25.65],[33.9,35.25,17.9,22.95]];
  pk.updateMatrixWorld(true); const v=new THREE.Vector3(); let cut=0;
  pk.traverse(o=>{ if(!o.isMesh) return; const ge=o.geometry, P=ge.attributes.position; const idx=ge.index?Array.from(ge.index.array):[...Array(P.count).keys()];
    const keep=[]; const c=new THREE.Vector3();
    for(let t=0;t<idx.length;t+=3){ c.set(0,0,0); for(let k=0;k<3;k++){ v.fromBufferAttribute(P,idx[t+k]).applyMatrix4(o.matrixWorld); c.add(v); } c.multiplyScalar(1/3);
      const hit=c.y>0.012&&boxes.some(b=>c.x>b[0]&&c.x<b[1]&&c.z>b[2]&&c.z<b[3]); if(hit) cut++; else keep.push(idx[t],idx[t+1],idx[t+2]); }
    if(keep.length!==idx.length) ge.setIndex(keep); });
  const gl=await new THREE_JSM.GLTFLoader.GLTFLoader().loadAsync('assets/models/env/second_ai/aa_support/park2_props.glb');
  const S=gl.scene; S.updateMatrixWorld(true); const nodes={}; for(const n of ['PARK_SWINGS','PARK_SWING_SEAT_A','PARK_SWING_SEAT_B','PARK_FIT_WAIST','PARK_FIT_SHOULDER','PARK_FIT_LEG','PARK_FIT_TOWEL','PARK_FIT_BOTTLE']){ const o=S.getObjectByName(n); if(o){ o.parent.updateMatrixWorld(true); o.applyMatrix4(o.parent.matrixWorld); o.parent.remove(o); nodes[n]=o; } }
  const sets=[
    {at:[32.6,24.8,Math.PI], anchor:'PARK_SWINGS', names:['PARK_SWINGS','PARK_SWING_SEAT_A','PARK_SWING_SEAT_B']},
    {at:[34.6,18.6,-Math.PI/2], anchor:'PARK_FIT_WAIST', names:['PARK_FIT_WAIST','PARK_FIT_TOWEL']},
    {at:[34.6,20.4,-Math.PI/2], anchor:'PARK_FIT_SHOULDER', names:['PARK_FIT_SHOULDER']},
    {at:[34.6,22.2,-Math.PI/2], anchor:'PARK_FIT_LEG', names:['PARK_FIT_LEG','PARK_FIT_BOTTLE']}];
  const out=[];
  for(const s of sets){ const grp=new THREE.Group(); grp.name='park2_'+s.anchor; grp.position.set(s.at[0],0,s.at[1]); grp.rotation.y=s.at[2];
    const a=nodes[s.anchor].position.clone(); a.y=0;
    for(const n of s.names){ const o=nodes[n]; if(!o){ out.push('missing '+n); continue; } o.position.sub(a); grp.add(o); }
    grp.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); g.add(grp); out.push(grp.name); }
  return (window.__park2={cut, placed:out});
})()


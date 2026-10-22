// 沛珊長裙：腿從裙子穿出來的量測（PS-SKIRT-LEG，LAWWW2 10-22）——Node，不需要瀏覽器。
// 在 Node 裡載入遊戲的 three.js／three-vrm／CHAR（tools/dev_scratch/spring_sim/harness.js），讓沛珊用遊戲的動畫＋footIK 走上、走下一段霖澤館尺寸的樓梯、平地走路、坐下，
// 每一格（1/30 秒）把裙子、身體的頂點照骨架算出來（SkinnedMesh.applyBoneTransform），從 16 個鏡頭（她的周圍每 45°、俯角 0.38 和 0.10、距離 4.2 m）用 CPU 畫一張小圖（z-buffer），
// 數「應該被裙子蓋住的腿」露出來的像素：K＝膝蓋以上（靜止時高度 ≥ 0.47 m），S＝膝蓋下 8～19 cm（0.36～0.47 m）；裙子在 0.23～1.05 m，靜止時全部蓋住。
// 身體材質單面（背面看不到）、裙子雙面（和 VRM 的材質一樣）。另外量裙子前片的邊被拉長多少（v1 的「中線一條深色直線」）。
// 用法：WT=<有 lib/ src/ tools/dev_scratch/spring_sim 的目錄> [CHAR_FILE=<試作 VRM>] node skirt_vis.js <標籤> [png 輸出目錄]
const path=require('path'), fs=require('fs'), zlib=require('zlib');
{ let sd=12345; Math.random=()=>{ sd=(sd*1103515245+12345)&0x7fffffff; return sd/0x80000000; }; }   // 每次一樣：動畫的起始時間、彈簧骨
const WT=process.env.WT; const {preload}=require(path.join(WT,'tools/dev_scratch/spring_sim/harness.js'));
const KEY='char.classmate_peishan', LABEL=process.argv[2]||'x', PNG=process.argv[3]||null;
const RISE=0.168, TREAD=0.28, NST=13, Z0=0, TOP=NST*RISE, ZT=Z0-NST*TREAD;
const stairs=(x,z)=>{ if(z>=Z0) return 0; if(z<=ZT) return TOP; return RISE*Math.ceil((Z0-z)/TREAD-1e-9); }, flat=()=>0;
const RES=200, FOV=20, DIST=4.2, AZ=[0,45,90,135,180,225,270,315], PITCH=[0.38,0.10];
const ID={none:0,skirtF:1,skirtB:2,K:3,S:4,body:5}; let HIST=null; const HISTS={};
const scene=new THREE.Scene();
const V=new THREE.Vector3();
function crc32(buf){ let c, crc=0xffffffff; for(let n=0;n<buf.length;n++){ c=(crc^buf[n])&0xff; for(let k=0;k<8;k++) c=c&1?0xedb88320^(c>>>1):c>>>1; crc=(crc>>>8)^c; } return (crc^0xffffffff)>>>0; }
function png(file,w,h,rgb){ const raw=Buffer.alloc((w*3+1)*h); for(let y=0;y<h;y++){ raw[y*(w*3+1)]=0; rgb.copy(raw,y*(w*3+1)+1,y*w*3,(y+1)*w*3); }
  const chunk=(t,d)=>{ const len=Buffer.alloc(4); len.writeUInt32BE(d.length); const td=Buffer.concat([Buffer.from(t),d]); const cr=Buffer.alloc(4); cr.writeUInt32BE(crc32(td)); return Buffer.concat([len,td,cr]); };
  const ih=Buffer.alloc(13); ih.writeUInt32BE(w,0); ih.writeUInt32BE(h,4); ih[8]=8; ih[9]=2; ih[10]=0; ih[11]=0; ih[12]=0;
  fs.writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))])); }
(async()=>{
  await preload([KEY]); CHAR.footIK=true;
  const h=CHAR.build({model:KEY,height:1.63}); scene.add(h); const vrm=h.userData.vrm;
  const meshes=[]; vrm.scene.traverse(o=>{ if(!o.isSkinnedMesh) return; const m=Array.isArray(o.material)?o.material[0]:o.material, nm=(m&&m.name)||''; let kind=null; if(/Skirt/.test(nm)) kind='skirt'; else if(/Body/.test(nm)) kind='body'; if(kind) meshes.push({o,kind}); });
  if(meshes.length<2){ console.error('找不到裙子／身體',meshes.map(m=>m.kind)); process.exit(2); }
  for(const M of meshes){ const g=M.o.geometry, idx=g.index.array, grp=(g.groups&&g.groups.length)?g.groups[0]:{start:0,count:idx.length}; M.idx=idx.slice(grp.start,grp.start+grp.count); const P=g.attributes.position;
    M.used=[...new Set(M.idx)]; M.rest=new Float32Array(P.count*3); for(let i=0;i<P.count;i++){ M.rest[i*3]=P.getX(i); M.rest[i*3+1]=P.getY(i); M.rest[i*3+2]=P.getZ(i); }
    M.pos=new Float32Array(P.count*3);
    if(M.kind==='body'){ M.cls=new Uint8Array(P.count); for(let i=0;i<P.count;i++){ const y=M.rest[i*3+1]; M.cls[i]=y>=0.47&&y<0.97?ID.K:(y>=0.36&&y<0.47?ID.S:ID.body); } }
    if(M.kind==='skirt'){ const E=new Map(); for(let t=0;t<M.idx.length;t+=3) for(const [a,b] of [[0,1],[1,2],[2,0]]){ let p=M.idx[t+a], q=M.idx[t+b]; if(p>q) [p,q]=[q,p]; E.set(p*100000+q,[p,q]); } M.edges=[...E.values()];
      M.front=M.edges.filter(([p,q])=>{ const z=(M.rest[p*3+2]+M.rest[q*3+2])/2, x=(M.rest[p*3]+M.rest[q*3])/2, y=(M.rest[p*3+1]+M.rest[q*3+1])/2; return z<-0.03&&y<0.85; }); } }
  const skirt=meshes.find(m=>m.kind==='skirt'), body=meshes.find(m=>m.kind==='body');
  function pose(){ scene.updateMatrixWorld(true); for(const M of meshes){ const o=M.o; o.skeleton.update(); for(const i of M.used){ V.set(M.rest[i*3],M.rest[i*3+1],M.rest[i*3+2]); o.applyBoneTransform(i,V); V.applyMatrix4(o.matrixWorld); M.pos[i*3]=V.x; M.pos[i*3+1]=V.y; M.pos[i*3+2]=V.z; } } }
  const scl=()=>skirt.o.matrixWorld.getMaxScaleOnAxis();
  function stretch(){ const s=scl(); let mx=0, n15=0; for(const [p,q] of skirt.front){ const r=Math.hypot(skirt.rest[p*3]-skirt.rest[q*3],skirt.rest[p*3+1]-skirt.rest[q*3+1],skirt.rest[p*3+2]-skirt.rest[q*3+2])*s; if(r<1e-5) continue; const l=Math.hypot(skirt.pos[p*3]-skirt.pos[q*3],skirt.pos[p*3+1]-skirt.pos[q*3+1],skirt.pos[p*3+2]-skirt.pos[q*3+2]); const k=l/r; if(k>mx) mx=k; if(k>1.5) n15++; } return {mx,n15}; }
  const zb=new Float32Array(RES*RES), idb=new Uint8Array(RES*RES), shb=new Float32Array(RES*RES), trb=new Int32Array(RES*RES); const cam=new THREE.PerspectiveCamera(FOV,1,0.5,30); const MVP=new THREE.Matrix4();
  const LIGHT=new THREE.Vector3(0.4,0.8,0.45).normalize();
  function render(target,yaw,pitch){ const dx=Math.sin(yaw), dz=Math.cos(yaw); cam.position.set(target.x+dx*DIST*Math.cos(pitch),target.y+DIST*Math.sin(pitch),target.z+dz*DIST*Math.cos(pitch)); cam.lookAt(target); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
    MVP.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); const e=MVP.elements; zb.fill(Infinity); idb.fill(0);
    for(const M of meshes){ const P=M.pos, I=M.idx, sx=new Float32Array(P.length/3*3);
      for(const i of M.used){ const x=P[i*3], y=P[i*3+1], z=P[i*3+2]; const w=e[3]*x+e[7]*y+e[11]*z+e[15]; sx[i*3]=((e[0]*x+e[4]*y+e[8]*z+e[12])/w*0.5+0.5)*RES; sx[i*3+1]=(0.5-(e[1]*x+e[5]*y+e[9]*z+e[13])/w*0.5)*RES; sx[i*3+2]=(e[2]*x+e[6]*y+e[10]*z+e[14])/w; }
      for(let t=0;t<I.length;t+=3){ const a=I[t], b=I[t+1], c=I[t+2]; const ax=sx[a*3], ay=sx[a*3+1], bx=sx[b*3], by=sx[b*3+1], cx=sx[c*3], cy=sx[c*3+1];
        const area=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax); if(Math.abs(area)<1e-9) continue; const front=area<0;   // 螢幕 y 往下：逆時針（正面）變成順時針
        let id; if(M.kind==='body'){ if(!front) continue; const k=Math.min(M.cls[a],M.cls[b],M.cls[c]); id=(M.cls[a]===M.cls[b]&&M.cls[b]===M.cls[c])?M.cls[a]:(M.cls[a]===ID.K||M.cls[b]===ID.K||M.cls[c]===ID.K?ID.K:k); } else id=front?ID.skirtF:ID.skirtB;
        // 打光（給 png 看）：三角形法線
        const ux=P[b*3]-P[a*3], uy=P[b*3+1]-P[a*3+1], uz=P[b*3+2]-P[a*3+2], vx=P[c*3]-P[a*3], vy=P[c*3+1]-P[a*3+1], vz=P[c*3+2]-P[a*3+2]; let nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx; const nl=Math.hypot(nx,ny,nz)||1; const sh=Math.abs((nx*LIGHT.x+ny*LIGHT.y+nz*LIGHT.z)/nl);
        const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))), x1=Math.min(RES-1,Math.ceil(Math.max(ax,bx,cx))), y0=Math.max(0,Math.floor(Math.min(ay,by,cy))), y1=Math.min(RES-1,Math.ceil(Math.max(ay,by,cy)));
        for(let py=y0;py<=y1;py++) for(let px=x0;px<=x1;px++){ const qx=px+0.5, qy=py+0.5; const w0=((bx-qx)*(cy-qy)-(by-qy)*(cx-qx))/area, w1=((cx-qx)*(ay-qy)-(cy-qy)*(ax-qx))/area, w2=1-w0-w1; if(w0<0||w1<0||w2<0) continue;
          const z=w0*sx[a*3+2]+w1*sx[b*3+2]+w2*sx[c*3+2]; const k=py*RES+px; if(z<zb[k]){ zb[k]=z; idb[k]=id; shb[k]=sh; trb[k]=M.kind==='body'?t:-2-t; } } } }
    let K=0, S=0, B=0, Kt=0, St=0; for(let k=0;k<RES*RES;k++){ const v=idb[k]; if(v===ID.K) K++; else if(v===ID.S) S++; else if(v===ID.skirtB) B++;
      if((v===ID.K||v===ID.S)&&HC){ const a=body.idx[trb[k]]; const x=body.pos[a*3]-HC.x, z=body.pos[a*3+2]-HC.z, yy=body.pos[a*3+1]; const sct=Math.floor(((Math.atan2(x,z)+Math.PI)/(2*Math.PI))*36)%36; if(yy>HEM[sct]+0.01){ if(v===ID.K) Kt++; else St++; } } if((v===ID.K||v===ID.S)&&HIST){ const a=body.idx[trb[k]]; const x=body.rest[a*3], y=body.rest[a*3+1], z=body.rest[a*3+2]; const lx=x<0?-0.07:0.07; const ang=Math.atan2(x-lx,-(z-0.0))*180/Math.PI*(x<0?-1:1); /* 0＝前、+90＝外側、-90＝內側 */ const yb=y<0.47?'S':y<0.58?'knee':y<0.75?'thigh_lo':'thigh_hi'; const ab=Math.abs(ang)<45?'front':(Math.abs(ang)>135?'back':(ang>0?'outer':'inner')); const key=yb+'/'+ab; HIST[key]=(HIST[key]||0)+1; } } return {K,S,B,Kt,St}; }
  const COL={0:[235,235,235],1:[120,130,150],2:[70,40,90],3:[230,30,30],4:[240,150,30],5:[225,190,170]};
  function sheet(file,target,ry){ const W=RES*AZ.length, Hh=RES*PITCH.length, rgb=Buffer.alloc(W*Hh*3); PITCH.forEach((pt,r)=>AZ.forEach((az,c)=>{ render(target,ry+az*Math.PI/180,pt); for(let y=0;y<RES;y++) for(let x=0;x<RES;x++){ const k=y*RES+x, id=idb[k]; let col=COL[id]; if(process.env.COLOR==='az'&&(id===ID.skirtF||id===ID.skirtB)){ const tt=-2-trb[k], va=skirt.idx[tt]; const ax=skirt.rest[va*3], az_=skirt.rest[va*3+2], yy=skirt.rest[va*3+1]; const ang=Math.atan2(ax,-az_)*180/Math.PI; const sec=Math.round(((ang+360)%360)/45)%8; const PAL=[[60,90,200],[60,170,220],[60,190,120],[170,200,60],[220,140,50],[200,70,60],[170,70,170],[100,80,200]]; col=PAL[sec].map(c=>c*(yy<0.552?0.75:1)); if(id===ID.skirtB) col=col.map(c=>c*0.4); } const f=id===0?1:0.45+0.55*shb[k], o=((r*RES+y)*W+c*RES+x)*3; rgb[o]=Math.min(255,col[0]*f); rgb[o+1]=Math.min(255,col[1]*f); rgb[o+2]=Math.min(255,col[2]*f); } })); png(file,W,Hh,rgb); }
  const hips=vrm.humanoid.getRawBoneNode('hips'); const tgt=new THREE.Vector3();
  const HEM=new Float32Array(36); let HC=null;
  function hemTable(){ hips.getWorldPosition(HCV); HC=HCV; HEM.fill(1e9); for(const i of skirt.used){ if(skirt.rest[i*3+1]>0.245) continue; const x=skirt.pos[i*3]-HC.x, z=skirt.pos[i*3+2]-HC.z; const sct=Math.floor(((Math.atan2(x,z)+Math.PI)/(2*Math.PI))*36)%36; HEM[sct]=Math.min(HEM[sct],skirt.pos[i*3+1]); } for(let k=0;k<36;k++) if(HEM[k]>1e8) HEM[k]=Math.min(HEM[(k+35)%36],HEM[(k+1)%36]); }
  const HCV=new THREE.Vector3();
  function measure(rec,ry){ pose(); hemTable(); hips.getWorldPosition(tgt); tgt.y-=0.42; let K=0,S=0,B=0,Kn=0,Kt=0,St=0, worst=null; for(const pt of PITCH) for(const az of AZ){ const r=render(tgt,ry+az*Math.PI/180,pt); K=Math.max(K,r.K); S=Math.max(S,r.S); B=Math.max(B,r.B); Kt=Math.max(Kt,r.Kt); St=Math.max(St,r.St); if(r.K>8) Kn++; if(!worst||r.K>worst.K) worst={K:r.K,az,pt}; }
    const st=stretch(); rec.frames.push({K,S,B,Kn,Kt,St,st:st.mx,n15:st.n15,worst}); if(!rec.worst||K>rec.worst.K) rec.worst={K,t:rec.frames.length-1,tgt:tgt.clone(),ry,snap:true}; return K; }
  const out={}; const dt=1/30;
  async function run(name,setup,step,meas){ const rec={frames:[]}; out[name]=rec; HIST=HISTS[name]={}; setup(); let t=0; while(true){ const r=step(t); if(r==='stop') break; if(r==='meas'){ measure(rec,h.rotation.y); const DU=(process.env.DUMP||'').split(',').filter(x=>x.startsWith(name+':')).map(x=>+x.split(':')[1]); if(PNG&&DU.includes(rec.frames.length-1)) sheet(path.join(PNG,`${LABEL}_${name}_f${rec.frames.length-1}.png`),tgt.clone(),h.rotation.y); if(PNG&&rec.worst&&rec.worst.snap){ rec.worst.snap=false; sheet(path.join(PNG,`${LABEL}_${name}_worst.png`),rec.worst.tgt,rec.worst.ry); } } t+=dt; } }
  const idle=(g,n)=>{ for(let i=0;i<n;i++) CHAR.animate(h,dt,{pose:'idle',speed:0,ground:g}); };
  // 上樓梯
  vrm.humanoid.resetNormalizedPose(); vrm.humanoid.update(); scene.updateMatrixWorld(true); pose(); if(PNG) fs.writeFileSync(path.join(PNG,LABEL+'_bind.bin'),Buffer.from(skirt.pos.buffer));
  console.log('DRIVE',JSON.stringify((h.userData.drive||[]).map(d=>d.o.name)),'bones',skirt.o.skeleton.bones.length);
  await run('up',()=>{ h.position.set(0,0,1.2); h.rotation.y=Math.PI; idle(flat,30); pose(); if(PNG) fs.writeFileSync(path.join(PNG,LABEL+'_rest.bin'),Buffer.from(skirt.pos.buffer)); },t=>{ const z=h.position.z-1.45*dt; if(z<ZT-0.8) return 'stop'; h.position.z=z; h.position.y+=(stairs(0,z)-h.position.y)*Math.min(1,dt*16); CHAR.animate(h,dt,{pose:'walk',speed:1.45,ground:stairs}); return (z<Z0+0.2&&z>ZT-0.5)?'meas':''; });
  // 下樓梯
  await run('down',()=>{ h.position.set(0,TOP,ZT-1.0); h.rotation.y=0; idle(stairs,30); },t=>{ const z=h.position.z+1.45*dt; if(z>Z0+0.8) return 'stop'; h.position.z=z; h.position.y+=(stairs(0,z)-h.position.y)*Math.min(1,dt*16); CHAR.animate(h,dt,{pose:'walk',speed:1.45,ground:stairs}); return (z>ZT-0.2&&z<Z0+0.5)?'meas':''; });
  // 平地走路
  await run('walk',()=>{ h.position.set(0,0,0); h.rotation.y=0; idle(flat,30); },t=>{ if(t>3.0) return 'stop'; h.position.z+=1.45*dt; CHAR.animate(h,dt,{pose:'walk',speed:1.45,ground:flat}); return t>0.8?'meas':''; });
  // 坐下、看書
  for(const p of ['sit','read']) await run(p,()=>{ h.position.set(0,0.45,0); h.rotation.y=0; idle(flat,10); },t=>{ if(t>1.2) return 'stop'; CHAR.animate(h,dt,{pose:p,speed:0,ground:flat}); return t>0.6?'meas':''; });
  const summ={}; for(const k in out){ const F=out[k].frames; const n=F.length; const px=(DIST*2*Math.tan(FOV/2*Math.PI/180)/RES)**2*1e4;   // 一個像素幾 cm²
    summ[k]={n, K_max:Math.max(...F.map(f=>f.K)), K_avg:+(F.reduce((s,f)=>s+f.K,0)/n).toFixed(1), K_frames:F.filter(f=>f.K>8).length, S_max:Math.max(...F.map(f=>f.S)), Kt_avg:+(F.reduce((s,f)=>s+f.Kt,0)/n).toFixed(1), Kt_frames:F.filter(f=>f.Kt>8).length, St_avg:+(F.reduce((s,f)=>s+f.St,0)/n).toFixed(1), St_frames:F.filter(f=>f.St>8).length, S_avg:+(F.reduce((s,f)=>s+f.S,0)/n).toFixed(1), B_max:Math.max(...F.map(f=>f.B)), stretch_max:+Math.max(...F.map(f=>f.st)).toFixed(2), stretch15_max:Math.max(...F.map(f=>f.n15)), px_cm2:+px.toFixed(3), worst:out[k].worst&&{t:out[k].worst.t,K:out[k].worst.K}}; }
  console.log(JSON.stringify({label:LABEL,file:process.env.CHAR_FILE||'(manifest)',summ},null,0)); console.log('HIST '+JSON.stringify(HISTS));
  if(PNG) fs.writeFileSync(path.join(PNG,`${LABEL}_frames.json`),JSON.stringify(out,(k,v)=>k==='tgt'?undefined:v));
  process.exit(0);
})().catch(e=>{ console.error('ERR',e); process.exit(2); });

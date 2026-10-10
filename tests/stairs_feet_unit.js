// 走樓梯的腳步貼合（v9.4，character3d.js 的 footIK）：在 Node 裡載入遊戲的 three.js／three-vrm／CHAR（不算圖），
// 讓祐廷用走路動畫走上一段樓梯（霖澤館的尺寸：每階高 16.8 cm、深 28 cm），每一格量兩隻腳：
//   穿進台階＝腳跟（或腳尖）比它底下那一階的踏面低多少；漂浮＝比較低的那隻腳（支撐腳）最低的點比它底下最高的踏面高多少。
// 同一段路走兩次：footIK 關掉（舊的行為：腳底永遠在身體那一階的高度）、打開，兩者都印出來；打開時要在門檻內。
// 用法：node tests/stairs_feet_unit.js [char.yuting]
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const key=process.argv[2]||'char.yuting';
const RISE=0.168, TREAD=0.28, N=13, Z0=0;          // 從 z=0 往 -z 上樓梯（第 1 階踏面 z∈[-0.28,0]）
const TOP=N*RISE, ZT=Z0-N*TREAD;
function ground(x,z){ if(z>=Z0) return 0; if(z<=ZT) return TOP; return RISE*Math.ceil((Z0-z)/TREAD-1e-9); }   // 階梯狀（遊戲的 visualHeightAt）
const scene=new THREE.Scene();
(async()=>{
  await preload([key]);
  const out={}; let allOk=true;
  for(const dir of ['up','down']){
  for(const ik of [false,true]){
    CHAR.footIK=ik;
    const h=CHAR.build({model:key,height:1.75}); scene.add(h); const vrm=h.userData.vrm;
    const bones=['leftFoot','rightFoot','leftToes','rightToes'].map(n=>vrm.humanoid.getRawBoneNode(n));
    // 平地站好：量腳踝、腳尖離地的高度（腳底＝骨頭高度減掉這個）
    h.position.set(0,0,2); h.rotation.y=Math.PI; for(let i=0;i<30;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0,ground});
    scene.updateMatrixWorld(true); const off=bones.map(b=>{ const p=new THREE.Vector3(); b.getWorldPosition(p); return p.y; });
    const restAnkle=Math.min(off[0],off[1]), restToe=Math.min(off[2],off[3]);
    const sgn=dir==='up'?-1:1; if(dir==='down'){ h.position.set(0,TOP,ZT-1.0); h.rotation.y=0; for(let i=0;i<10;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0,ground}); }
    let pen=0, flo=0, n=0, penSum=0; const dt=1/30;
    for(let t=0;t<5.5;t+=dt){
      const z=h.position.z+sgn*1.45*dt; if(z<ZT-1.0||z>Z0+2.0) break; h.position.z=z; const ty=ground(0,z); h.position.y+= (ty-h.position.y)*Math.min(1,dt*16);   // 和遊戲的 settleY 一樣
      CHAR.animate(h,dt,{pose:'walk',speed:1.45,ground}); scene.updateMatrixWorld(true);
      if(z>Z0-0.6||z<ZT+0.6) continue;   // 只量樓梯中段
      const P=bones.map(b=>{ const p=new THREE.Vector3(); b.getWorldPosition(p); return p; });
      const sole=[P[0].y-restAnkle,P[1].y-restAnkle], toe=[P[2].y-restToe,P[3].y-restToe];
      const g=[ground(P[0].x,P[0].z),ground(P[1].x,P[1].z)], gt=[ground(P[2].x,P[2].z),ground(P[3].x,P[3].z)];
      for(let k=0;k<2;k++){ const d=Math.max(g[k]-sole[k],gt[k]-toe[k]); pen=Math.max(pen,d); penSum+=Math.max(0,d); }
      // 支撐腳離地：腳最低的點（腳跟或腳尖）和腳底下最高的那一階比（上樓梯時前腳掌踩在上一階、腳跟懸空是正常的）；兩隻腳取比較低的那一隻
      const clr=[0,1].map(k=>Math.min(sole[k],toe[k])-Math.max(g[k],gt[k])); flo=Math.max(flo,Math.min(clr[0],clr[1])); n++;
    }
    out[ik?'on':'off']={pen,flo,avgPen:penSum/Math.max(1,2*n),n};
    scene.remove(h); CHAR.release(h);
  }
  const f=(o)=>`最深穿進台階 ${(o.pen*100).toFixed(1)} cm、平均 ${(o.avgPen*100).toFixed(1)} cm、支撐腳最多離地 ${(o.flo*100).toFixed(1)} cm（${o.n} 格）`;
  const ok=out.on.pen<0.045&&out.on.flo<0.05&&out.on.pen<out.off.pen; allOk=allOk&&ok;
  console.log(`${key} ${dir==='up'?'上樓梯':'下樓梯'}：footIK 關：`, f(out.off)); console.log(`${key} ${dir==='up'?'上樓梯':'下樓梯'}：footIK 開：`, f(out.on), ok?'PASS':'FAIL');
  }
  console.log(allOk?'ALL PASS':'FAILED', `（門檻：穿進 < 4.5 cm、支撐腳離地 < 5 cm，而且比關掉時好）`);
  process.exit(allOk?0:1);
})().catch(e=>{ console.error('ERR',e); process.exit(2); });

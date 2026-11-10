// 健身中心器材會動的零件（GYM-FIT-PROPS-1103 第二包，LAWWW2 帳號 A 2026-11-10）——不需要瀏覽器（D131）。
// 第一包之後的缺點：飛輪的曲柄、踏板是固定的模型，人在踩、曲柄不轉（腳在空中畫圓）；划船機的座椅固定，人前後滑、座椅不動（坐在空中）。
//   1 gym_b1.glb：飛輪、划船機的原型網格裡沒有曲柄、踏板、座椅、滑車、拉把的三角形了（tools/blender/env_second/gym_moving_parts.py 改成退化三角形），其他三角形照舊
//   2 gym_moving_parts.glb：五個零件（曲柄、左右踏板、座椅、拉把），三角形數＝從 gym_b1.glb 拿掉的
//   3 遊戲（gym3d.js gymMoving）：照配置每台飛輪 4、划船機 2 放一份，材質是 gym_b1.glb 那一個同名的材質（看起來和原本一樣）；沒人用的時候零件在原本的位置
//   4 飛輪：遊戲的路人（VRM，CHAR.animate gym_bike）踩：曲柄跟著轉（轉過 ≥ 300°）；每隻腳的腳踝在那一邊踏板「該踩的點」（gymIK 的目標：踏板中心往上 7.5～10 cm、往後 3.5 cm）≤ 4 cm
//   5 划船機：路人划（gym_row）：座椅跟著前後滑 ≥ 25 cm，一直在臀部底下（臀部骨頭的 z 在座椅前後 ±12 cm 內、高度在座面上 3～25 cm）；
//     手上拿著拉把（第一包）時，前面掛著的拉把藏起來；人走了以後拉把回來
// 修改前（開發分支 0ec32e6f6）：1～5 FAIL（零件是固定模型的一部分）。用法：node tests/gym_moving_parts_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v*100).toFixed(1)+' cm', tick=()=>new Promise(r=>setTimeout(r,0));
global.Z3=global.Z3||{ZONES:{}};
for(const f of ['src/data/gym_layout.js','src/gym3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f});
const B=GYM_LAYOUT.b1;

/* ---- 1、2：GLB ---- */
function glb(file){ const b=fs.readFileSync(path.join(ROOT,file)), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(28+jl);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0), T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
    return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  return {J,acc}; }
const crankSel=c=>Math.abs(c[0])>0.052&&c[1]>=0.15&&c[1]<=0.58&&c[2]<0.18;
const inBox=(t,b)=>t.every(p=>p[0]>=b[0]&&p[0]<=b[1]&&p[1]>=b[2]&&p[1]<=b[3]&&p[2]>=b[4]&&p[2]<=b[5]);
const SEAT=[-0.14,0.14,0.295,0.41,-0.26,0.06], HANDLE=[-0.28,0.28,0.425,0.495,0.495,0.565];
const RULES={gymb1_gym_bike_metal:[t=>crankSel(cen(t))], gymb1_gym_bike_vc:[t=>crankSel(cen(t))], gymb1_gym_rower_metal:[t=>inBox(t,SEAT)], gymb1_gym_rower_vc:[t=>inBox(t,SEAT),t=>inBox(t,HANDLE)]};
const cen=t=>[0,1,2].map(k=>(t[0][k]+t[1][k]+t[2][k])/3);
let movTris=0; { const {J,acc}=glb('assets/models/env/second_ai/gym_b1.glb'); const left={}, total={};
  for(const n of J.nodes){ if(n.mesh==null||!(n.extensions&&n.extensions.EXT_mesh_gpu_instancing)) continue; const m=J.meshes[n.mesh]; if(!RULES[m.name]) continue;
    for(const pr of m.primitives){ const P=acc(pr.attributes.POSITION), I=acc(pr.indices); let l=0, tt=0;
      for(let i=0;i<I.length;i+=3){ if(I[i]===I[i+1]&&I[i]===I[i+2]) continue; tt++; const t=[0,1,2].map(k=>[P[I[i+k]*3],P[I[i+k]*3+1],P[I[i+k]*3+2]]); if(RULES[m.name].some(f=>f(t))) l++; }
      left[m.name]=l; total[m.name]=tt; } }
  const names=Object.keys(RULES), ok=names.every(k=>left[k]===0&&total[k]>300);
  check('1 gym_b1.glb：飛輪、划船機的原型網格裡沒有會動零件的三角形（其他照舊）', ok, names.map(k=>`${k.replace('gymb1_gym_','')} 剩 ${left[k]}／共 ${total[k]}`).join('、')); }
{ const f='assets/models/env/second_ai/gym_moving_parts.glb', ex=fs.existsSync(path.join(ROOT,f)); let parts={}, mk=null;
  if(ex){ const {J,acc}=glb(f); for(const n of J.nodes) if(n.mesh!=null){ let t=0; for(const pr of J.meshes[n.mesh].primitives) t+=acc(pr.indices).length/3; parts[n.name]=t; movTris+=t; } }
  try{ mk=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gym_b1.glb')).slice(20,20+fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gym_b1.glb')).readUInt32LE(12)).toString('utf8')).asset.extras.gymMovingStripped; }catch(e){}
  const need=['gym_bike_crank','gym_bike_pedal_L','gym_bike_pedal_R','gym_rower_seat','gym_rower_handle'];
  check('2 gym_moving_parts.glb：五個零件，三角形數＝從 gym_b1.glb 拿掉的', ex&&need.every(k=>parts[k]>0)&&!!mk&&mk.tris===movTris, ex?need.map(k=>`${k.replace('gym_','')} ${parts[k]||0}`).join('、')+`；合計 ${movTris}、gym_b1 拿掉 ${mk?mk.tris:'—'}`:'沒有這個檔'); }

(async()=>{
  const keys=['char.npc_nm1','char.npc_nf1'];
  const extra=['bldg.gym_b1','prop.gym_moving','prop.gym_hand'].filter(k=>ASSETS.manifest[k]);
  await preload(keys.concat(extra));
  const random0=Math.random; let sd=11; Math.random=()=>{ sd=(sd*16807)%2147483647; return (sd-1)/2147483646; };
  /* ---- 3：遊戲端 ---- */
  const scene=new THREE.Scene(), g0=new THREE.Group(), cz=-5; g0.position.z=cz; scene.add(g0);
  const z={group:g0}, E={zone:z,player:null,npcs:[]};
  const c=await ASSETS.loadOne('bldg.gym_b1'); const root=c.scene.clone(true); root.position.z-=cz; g0.add(root);
  if(GY3.gymMoving) GY3.gymMoving(E,z,g0,root,B,cz); for(let i=0;i<50&&!z.gymMoving;i++){ await tick(); await new Promise(r=>setTimeout(r,10)); }
  const L=z.gymMoving||[]; scene.updateMatrixWorld(true);
  const mats={}; root.traverse(o=>{ if(o.isMesh&&o.material&&!mats[o.material.name]) mats[o.material.name]=o.material; });
  let sameMat=true, nMesh=0; for(const it of L) it.m.traverse(o=>{ if(o.isMesh){ nMesh++; if(o.material!==mats[o.material.name]) sameMat=false; } });
  const bikes=L.filter(i=>i.kind==='bike'), rowers=L.filter(i=>i.kind==='rower');
  /* 沒人用：零件在原本的位置（曲柄沒轉、座椅沒滑） */
  const rest=bikes.every(i=>Math.abs(i.crank.rotation.x)<1e-6)&&rowers.every(i=>Math.abs(i.seat.position.z)<1e-6&&i.handle.visible);
  check('3 遊戲：每台飛輪（4）、划船機（2）一份，材質是 gym_b1.glb 同名的那一個；沒人用的在原本的位置', bikes.length===4&&rowers.length===2&&nMesh>0&&sameMat&&rest, `飛輪 ${bikes.length}、划船機 ${rowers.length}、網格 ${nMesh}、同一個材質 ${sameMat}、原位 ${rest}`);
  if(!L.length){ console.log(`FAILED ${fails}`); process.exit(1); }
  for(const key of keys){
    const height=ASSETS.manifest[key].height||1.7;
    /* ---- 4：飛輪 ---- */
    { const it=bikes[0], h=CHAR.build({model:key,height}); scene.add(h); h.position.set(it.eq.at[0],0,it.eq.at[1]); h.rotation.y=0; h.updateMatrixWorld(true);
      const n={obj:h,pose:'gym_bike'}; E.npcs=[n]; const R=s=>h.userData.vrm.humanoid.getRawBoneNode(s);
      let dmax=0, nS=0; const ths=[], BK=CHAR.GYM.bike;
      for(let i=0;i<150;i++){ CHAR.animate(h,1/30,{pose:'gym_bike',speed:0}); scene.updateMatrixWorld(true); z.update(1/30,E); scene.updateMatrixWorld(true); if(i%15===0) await tick(); if(i<40) continue;
        ths.push(it.crank.rotation.x); nS++;
        for(const side of [0,1]){ const a=it.m.worldToLocal(R(side?'rightFoot':'leftFoot').getWorldPosition(new THREE.Vector3())), pl=it.m.worldToLocal((side?it.pr:it.pl).getWorldPosition(new THREE.Vector3()));
          const ang=Math.atan2(pl.z-BK.axle[2],pl.y-BK.axle[1]), want=new THREE.Vector3((side?-1:1)*BK.pedalX,pl.y+0.0875-0.0125*Math.cos(ang),pl.z-0.035);   /* gymIK 的腳踝目標（aoff、−0.035）*/
          dmax=Math.max(dmax,a.distanceTo(want)); } }
      let turn=0; for(let i=1;i<ths.length;i++) turn+=Math.abs(ths[i]-ths[i-1]);
      check(`4 [${key}] 飛輪：曲柄跟著腳轉，腳踝在踏板該踩的點`, nS>0&&turn>=300*Math.PI/180&&dmax<=0.04, `曲柄轉了 ${(turn*180/Math.PI).toFixed(0)}°；腳踝離踏板該踩的點最遠 ${cm(dmax)}`);
      CHAR.release(h); scene.remove(h); E.npcs=[]; }
    /* ---- 5：划船機 ---- */
    { const it=rowers[0], h=CHAR.build({model:key,height}); scene.add(h); h.position.set(it.eq.at[0],0,it.eq.at[1]); h.rotation.y=it.eq.ry; h.updateMatrixWorld(true);
      const n={obj:h,pose:'gym_row'}; E.npcs=[n]; const R=s=>h.userData.vrm.humanoid.getRawBoneNode(s);
      const zs=[]; let off=0, ylo=9, yhi=-9, hid=0, nS=0;
      for(let i=0;i<200;i++){ CHAR.animate(h,1/30,{pose:'gym_row',speed:0}); scene.updateMatrixWorld(true); z.update(1/30,E); scene.updateMatrixWorld(true); if(i%15===0){ await tick(); await new Promise(r=>setTimeout(r,5)); } if(i<60) continue; nS++;
        const sc=it.seat.position.z+GY3.MOV.SEAT0; zs.push(sc); const hp=it.m.worldToLocal(R('hips').getWorldPosition(new THREE.Vector3()));
        off=Math.max(off,Math.abs(hp.z-sc)); ylo=Math.min(ylo,hp.y-0.40); yhi=Math.max(yhi,hp.y-0.40); if(!it.handle.visible) hid++; }
      const rg=Math.max(...zs)-Math.min(...zs), propOn=!!h.userData.gymPropOn;
      E.npcs=[]; z.update(1/30,E); const back=it.handle.visible;
      check(`5 [${key}] 划船機：座椅跟著前後滑、一直在臀部底下；手上有拉把時前面的拉把藏起來、人走了回來`, nS>0&&rg>=0.25&&off<=0.12&&ylo>=0.03&&yhi<=0.25&&(!propOn||hid===nS)&&back,
        `座椅滑 ${cm(rg)}；臀部離座椅中心（前後）最遠 ${cm(off)}；臀部在座面上 ${cm(ylo)}～${cm(yhi)}；手上的拉把 ${propOn?'有':'沒有'}、前面的拉把藏了 ${hid}／${nS} 格；人走了 ${back?'回來':'沒回來'}`);
      CHAR.release(h); scene.remove(h); }
  }
  Math.random=random0;
  console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

// 桃園機場出境／入境大廳：跟隨鏡頭不會退到正門帷幕外、出關門外、報到島背牆後面；擋住玩家的框、背牆、柱子、霧面玻璃網點透空；晚上窗外不再是白天（ART-VAC-AIRPORT-1021）——不需要瀏覽器。
// LAWWW2 機場巡場景（2026-10-21）看到的：出境大廳 (0, 10) 鏡頭在南，退到帷幕外面，中間那支門框貼在鏡頭前，整個畫面一根黑柱、看不到人；
// 報到櫃台 B (−4.1, −2) 鏡頭在西，在報到島 3.2 m 的背牆後面，只看得到腳；入境出關 (0, −10.8) 鏡頭在北，退到霧面自動門外面，畫面整片霧白（一出關往前走就是這個角度）；
// 20:00、21:00 從大廳看出去還是白天（窗外的遠景是自發光，原本跟著燈箱晚上反而更亮）。
// 做法（src/us3d.js）：apCamCols（和公寓、教學館同一套 zone.camCols：followCam 擋到就拉近、抬高）、apSeeThru（材質標 seeThrough＋E.patchSeeThrough；區域 seeThru:true）、apOutside（窗外遠景照時間變暗）。
// 這裡在 Node 建出遊戲真正的兩個區域，每 1 m 一點（人站得住）、8 個方向，照引擎的跟隨鏡頭（camDist 出境 6.0、入境 5.2，俯角 0.38）算鏡頭位置，
// 看「頭 → 鏡頭」有沒有穿過會擋鏡頭的牆：牆照配置自己算（不是拿 camCols 來量）——出境：帷幕（入口門洞 2.6 m 以下可以過）、報到島背牆（3.2 m 高）；入境：出關門那一面、出口那一面（出口門洞可以過）。
// 同一個測試也用修改前的公式（沒有牆的碰撞）跑一次：一定要量得到被擋住的方向（證明這個測試抓得到這個 bug）。
// 用法：node tests/airport_cam_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0, tag=''; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+tag+name+(info?'　'+info:'')); if(!ok) fails++; };
/* 正式模型：假的（每一種材質一個小網格，名字照 airport_t2.py）——只用來檢查材質的處理；牆、導航和配置是同一份 */
const MATS=['ap_mullion','ap_wall_panel','ap_column','ap_steel','ap_floor','ap_wall','ap_concrete','ck_glass','GLOW_ap_frosted','GLOW_ap_airlines','GLOW_ap_signs','GLOW_ap_outside_m','GLOW_ap_outside_night_m'];
/* 網格的名字照 GLB：窗外白天那塊叫 GLOW_ap_outside、夜景那塊叫 GLOW_ap_outside_night；NO_NIGHT＝舊的模型（沒有夜景平面）*/
let NO_NIGHT=false;
function fakeModel(){ const g=new THREE.Group(); for(const n of MATS){ if(NO_NIGHT&&/night/.test(n)) continue; const m=new THREE.MeshStandardMaterial({name:n,color:0xb0b4b8}); if(/^GLOW_/.test(n)){ m.emissive.setRGB(1,1,1); m.emissiveIntensity=1; } const me=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),m); me.name=/^GLOW_ap_outside/.test(n)?n.replace(/_m$/,''):n; g.add(me); } return g; }
let pend=[]; ASSETS.loadOne=k=>{ if(/^bldg\.airport_(dep|arr)$/.test(k)){ const p=Promise.resolve({scene:fakeModel()}); pend.push(p); return p; } return new Promise(()=>{}); };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
global.GAME={G:{hour:15,weather:'clear',flags:{},zone:'airport_dep'}};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; z.group.updateMatrixWorld(true); return z; }
/* 配置 → 會擋鏡頭的牆：{p:[x0,z0,x1,z1], y0, y1}（和 us3d.js 的 apCamCols 分開寫，才算獨立的量法）*/
function solidParts(L,isDep,H){ const out=[], Bd=L.bounds, DOOR=2.6;
  const seg=(x0,z0,x1,z1,y0,y1)=>{ if(Math.hypot(x1-x0,z1-z0)<0.01||y1-y0<0.01) return; out.push({p:[x0,z0,x1,z1],y0,y1}); };
  const wall=(z,gaps)=>{ let a=Bd.x0; for(const d of gaps.slice().sort((p,q)=>p.x-q.x)){ seg(a,z,d.x-d.w/2,z,0,H); seg(d.x-d.w/2,z,d.x+d.w/2,z,DOOR,H); a=d.x+d.w/2; } seg(a,z,Bd.x1,z,0,H); };
  if(isDep){ wall(L.facade_z,L.entrances); for(const isl of L.islands){ const x0=isl.x-isl.spine/2, x1=isl.x+isl.spine/2; seg(x0,isl.z0,x1,isl.z0,0,3.2); seg(x0,isl.z1,x1,isl.z1,0,3.2); seg(x0,isl.z0,x0,isl.z1,0,3.2); seg(x1,isl.z0,x1,isl.z1,0,3.2); } }
  else { wall(Bd.z0,[]); wall(Bd.z1,L.exits); }
  return out; }
function crossT(ax,az,bx,bz,s){ const [cx,cz,dx,dz]=s; const r=[bx-ax,bz-az], q=[dx-cx,dz-cz]; const den=r[0]*q[1]-r[1]*q[0]; if(Math.abs(den)<1e-9) return -1;
  const t=((cx-ax)*q[1]-(cz-az)*q[0])/den, u=((cx-ax)*r[1]-(cz-az)*r[0])/den, e=0.03/Math.max(1e-6,Math.hypot(q[0],q[1])); return (t>0&&t<1&&u>e&&u<1-e)?t:-1; }
function blocked(head,cam,parts){ for(const s of parts){ const t=crossT(head.x,head.z,cam.x,cam.z,s.p); if(t<0) continue; const y=head.y+(cam.y-head.y)*t; if(y>s.y0+0.02&&y<s.y1-0.02) return s; } return null; }
const oldCam=(tgt,yaw,pitch,dist)=>new THREE.Vector3(Math.sin(yaw)*dist*Math.cos(pitch),Math.sin(pitch)*dist+0.2,Math.cos(yaw)*dist*Math.cos(pitch)).add(tgt);
check('引擎有 E.followCam、E.patchSeeThrough',typeof E.followCam==='function'&&typeof E.patchSeeThrough==='function');
const PITCH=0.38, PI=Math.PI;
/* 巡場景看到的三個位置（04、07、15）：修改前的公式被擋住（重現得到），修改後不擋 */
const CASES={airport_dep:[['報到櫃台 B (−4.1, −2)・鏡頭在西（07）',-4.1,-2,-PI/2]],airport_arr:[['入境出關 (0, −10.8)・鏡頭在北（15）',0,-10.8,PI]]};
/* 04（出境大廳 (0, 10)、鏡頭在南）：視線從正中間的入口門洞穿出去——玩家走得過的門洞，鏡頭也可以過（和公寓、教學館的規則一樣），擋住的是自動門中間那支門框：網點透空處理（下面的材質檢查）*/
(async()=>{
for(const id of ['airport_dep','airport_arr']){ const isDep=id==='airport_dep'; tag='['+id+'] '; const def=Z3.ZONES[id]; const z=loadZone(id); await Promise.all(pend); await new Promise(r=>setTimeout(r,0));
  const L=isDep?AIRPORT_T2_LAYOUT.dep:AIRPORT_T2_LAYOUT.arr, H=isDep?(L.roof?L.roof.eave:10.5):(L.h||5.6), parts=solidParts(L,isDep,H), dist=def.camDist||3.8;
  check('區域開了室內網點透空（seeThru：區域實體上，引擎的 updateSeeThrough 看 E.zone.seeThru）',z.seeThru===true);
  check('鏡頭碰撞用的牆（zone.camCols[0]）',Array.isArray(z.camCols)&&z.camCols[0]&&z.camCols[0].length>=(isDep?10:4),z.camCols&&z.camCols[0]?z.camCols[0].length+' 塊':'沒有');
  let n=0, bad=0, badOld=0, ex=null; const Bd=L.bounds;
  for(let x=Bd.x0+0.5;x<=Bd.x1-0.5;x+=1.0) for(let zz=Bd.z0+0.5;zz<=Bd.z1-0.5;zz+=1.0){ if(!E.canStand(x,zz,0.32,0)) continue; const tgt=new THREE.Vector3(x,1.45,zz);
    for(let k=0;k<8;k++){ const yaw=k*PI/4; n++; if(blocked(tgt,oldCam(tgt,yaw,PITCH,dist),parts)) badOld++;
      const cam=new THREE.Vector3(); E.followCam(tgt,yaw,PITCH,dist,0,cam); const hit=blocked(tgt,cam,parts); if(hit){ bad++; if(!ex) ex={x:+x.toFixed(1),z:+zz.toFixed(1),yaw:+yaw.toFixed(2),cam:cam.toArray().map(v=>+v.toFixed(2)),wall:hit.p.map(v=>+v.toFixed(2))}; } } }
  check('修改前的公式量得到被擋住的方向（測試抓得到這個 bug）',badOld>0,`${(100*badOld/Math.max(1,n)).toFixed(1)}%（${badOld}/${n}）`);
  check('跟隨鏡頭不會退到帷幕、出關門、報到島背牆後面',bad===0,`${(100*bad/Math.max(1,n)).toFixed(1)}%（${bad}/${n}）`+(ex?' 例：'+JSON.stringify(ex):''));
  for(const [name,x,zz,yaw] of CASES[id]){ const tgt=new THREE.Vector3(x,1.45,zz), cam=new THREE.Vector3(); const was=!!blocked(tgt,oldCam(tgt,yaw,PITCH,dist),parts); const r=E.followCam(tgt,yaw,PITCH,dist,0,cam);
    check(`${name}：修改前被擋住、修改後鏡頭在牆前`,was&&!blocked(tgt,cam,parts),`修改前${was?'被擋住':'沒擋住'}；鏡頭離頭 ${r.dist.toFixed(2)} m`); }
  if(isDep){ const tgt=new THREE.Vector3(0,1.45,10), cam=new THREE.Vector3(); E.followCam(tgt,0,PITCH,dist,0,cam); const tz=(L.facade_z-tgt.z)/(cam.z-tgt.z), y=tgt.y+(cam.y-tgt.y)*tz, x=tgt.x+(cam.x-tgt.x)*tz;
    const door=L.entrances.find(d=>Math.abs(x-d.x)<d.w/2); check('出境大廳 (0, 10)・鏡頭在南（04）：視線走正中間的入口門洞（門洞可以過），擋住的是門片中間的框',cam.z>L.facade_z&&!!door&&y<2.6,`穿過帷幕的點 x ${x.toFixed(2)}、高 ${y.toFixed(2)} m`); }
  /* 材質：擋住玩家時網點透空；窗外照時間變暗 */
  const mats={}; z.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name) mats[o.material.name]=o.material; });
  check('正式模型接上了（假的模型）',z.formal===true&&Object.keys(mats).length>=MATS.length,Object.keys(mats).length+' 種材質');
  const seeOk=['ap_mullion','ap_wall_panel','ap_column','ap_steel','GLOW_ap_frosted','GLOW_ap_airlines'].every(n=>mats[n]&&mats[n].userData.seeThrough&&mats[n].userData._st);
  const seeNot=['ap_floor','ap_wall','ck_glass','GLOW_ap_signs','GLOW_ap_outside_m'].every(n=>mats[n]&&!mats[n].userData.seeThrough);
  check('帷幕框、背牆、柱子、不鏽鋼、霧面玻璃、航空公司燈箱網點透空；地板、牆、玻璃、招牌、窗外不透空',seeOk&&seeNot);
  const out=mats.GLOW_ap_outside_m, sign=mats.GLOW_ap_signs, conc=mats.ap_concrete; const lum=c=>0.2126*c.r+0.7152*c.g+0.0722*c.b;
  z.applyTime(12,'clear'); const d={c:lum(out.color),e:lum(out.emissive)*out.emissiveIntensity,s:sign.emissiveIntensity,k:lum(conc.color)};
  z.applyTime(21,'clear'); const nt={c:lum(out.color),e:lum(out.emissive)*out.emissiveIntensity,s:sign.emissiveIntensity,k:lum(conc.color)};
  z.applyTime(18,'clear'); const du={c:lum(out.color)};
  z.applyTime(12,'clear'); const d2={c:lum(out.color),e:lum(out.emissive)*out.emissiveIntensity};
  check('窗外的遠景：中午和原本一樣（自發光乘 0.75），21:00 剩兩成以下，18:00 在中間，回到中午會還原',Math.abs(d.e-0.75)<0.01&&nt.c<0.2*d.c&&nt.e<0.2*d.e&&du.c<d.c&&du.c>nt.c&&Math.abs(d2.c-d.c)<1e-6&&Math.abs(d2.e-d.e)<1e-6,
    `基本色 ${d.c.toFixed(3)}→${nt.c.toFixed(3)}（18:00 ${du.c.toFixed(3)}）、自發光 ${d.e.toFixed(3)}→${nt.e.toFixed(3)}`);
  check('招牌、燈箱照舊：白天 0.75、晚上 1',Math.abs(d.s-0.75)<0.01&&Math.abs(nt.s-1)<0.01);
  check(isDep?'出境的混凝土（雨遮底下）晚上不變暗':'入境門外的地面（ap_concrete）晚上變暗',isDep?Math.abs(nt.k-d.k)<1e-6:nt.k<0.3*d.k,`${d.k.toFixed(3)}→${nt.k.toFixed(3)}`);
  /* 夜景平面：18:18 以後、5:42 以前藏起白天那塊、露出夜景；基本色壓低（不被大廳的燈照亮）*/
  const pl={}; z.group.traverse(o=>{ if(o.isMesh&&/^GLOW_ap_outside/.test(o.name)) pl[o.name]=o; }); const dp=pl.GLOW_ap_outside, np=pl.GLOW_ap_outside_night;
  const vis=h=>{ z.applyTime(h,'clear'); return [dp.visible,np.visible]; }; const V={12:vis(12),17.5:vis(17.5),18.5:vis(18.5),21:vis(21),4:vis(4),6:vis(6)};
  check('夜景平面：12、17:30、6 點白天那塊；18:30、21、4 點夜景那塊',!!dp&&!!np&&[12,17.5,6].every(h=>V[h][0]&&!V[h][1])&&[18.5,21,4].every(h=>!V[h][0]&&V[h][1])&&np.material.color.r<0.2*0.7,JSON.stringify(V));
  z.applyTime(12,'clear');
}
/* 舊的模型（沒有夜景平面）：照舊用調暗的做法，不會出錯 */
{ NO_NIGHT=true; pend=[]; tag='[airport_dep 沒有夜景平面] '; const z=loadZone('airport_dep'); await Promise.all(pend); await new Promise(r=>setTimeout(r,0)); let ok=true, dv=null;
  try{ z.applyTime(21,'clear'); z.group.traverse(o=>{ if(o.isMesh&&o.name==='GLOW_ap_outside') dv=o; }); ok=!!dv&&dv.visible&&dv.material.color.r<0.2*0.7; }catch(e){ ok=false; }
  check('21:00 白天那塊照舊顯示、調暗',ok); }
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });

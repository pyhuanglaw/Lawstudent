// 總圖大廳的光照貼圖與擺設（LIB-HALL-LM-1028，LAWWW2-C 2026-10-28；不需要瀏覽器）：
//   1. 正式模型（assets/models/env/library_interior.glb）：場景 extras.lightmap 指到的兩張貼圖在 repo 裡、L0_root／L1_root 在、地板和牆有第二套 UV（TEXCOORD_1）、燈板和頂點色的小東西沒有。
//      天窗寫在 extras.lightmap.dayEmit（遊戲晚上把天窗調暗，RT-NIGHT-1028）；有第二套 UV 的網格沒有「疊在一起、方向相反」的面
//      （lib2.single_side 補的反面：烘焙時光線一出發就打到反面，整面烘成全黑——第一次校正烘焙二樓木地板、一樓天花板、舊樓梯踏面全黑）。
//   2. 總圖大廳真正的建區域流程（src/library3d.js → B3.attachFormal），ASSETS.loadOne 換成讀這個 GLB 的 JSON 做的假場景：
//      有第二套 UV 的材質接上 lightMap、zone.update 照時段換白天／晚上那張。
//      進兩次（快取的 GLB 每次 clone、材質共用）：不再包一層（lmMix 只宣告一次），第二次照樣照時段換。
//   3. 地上的新擺設（library_layout.js 的 prop：傘架、雨傘套袋機、查詢電腦、自助借書機、還書車、飲水機、滅火器、小茶几）擋住導航；
//      出生點、每一個互動點（門、電梯、服務台、影印機、座位……）附近照舊有站得住、從大門（一樓）或二樓連廊走得到的位置；
//      小安「總圖的下午」的兩個座位（seats[0]、seats[1]）沒有變。
// 用法：node tests/library_hall_lightmap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/library_layout.js','src/library3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};

// ---- 1. 正式模型的內容（只讀 GLB 的 JSON）----
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/library_interior.glb')); const J=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString('utf8'));
const lm=J.scenes[J.scene|0].extras&&J.scenes[J.scene|0].extras.lightmap;
check('GLB 場景有 extras.lightmap', !!(lm&&lm.day&&lm.night&&lm.intensity>0), JSON.stringify(lm));
if(lm) for(const k of ['day','night']) check('光照貼圖檔案在 repo 裡：'+lm[k], fs.existsSync(path.join(ROOT,lm[k])));
const names=J.nodes.map(n=>n.name||''); check('L0_root、L1_root 在', names.includes('L0_root')&&names.includes('L1_root'));
const uv1=n=>J.meshes[n.mesh].primitives.every(p=>'TEXCOORD_1' in p.attributes);
const meshNode=rx=>J.nodes.find(n=>'mesh' in n&&rx.test(n.name||''));
for(const [label,rx] of [['一樓地板',/^L0_floor/],['二樓地板（淺色人字拼）',/^L1_.*parquet/],['大樓梯',/^L0_.*step/],['平台',/^L0_landing/],['外牆',/^L0_WALL_wall.*plaster/],['書架、長桌（胡桃木）',/^L1_lb_walnut/],['沙發',/^L0_lb_leather/]]){ const n=meshNode(rx); check('有第二套 UV：'+label+'（'+(n&&n.name)+'）', !!(n&&uv1(n))); }
for(const n of J.nodes.filter(n=>'mesh' in n&&/light_panel|skylight|_lb_vc|lampglow/.test(n.name||''))) check('沒有第二套 UV（照舊即時光）：'+n.name, !uv1(n));
const withUv1=J.nodes.filter(n=>'mesh' in n&&uv1(n)).length; check('有第二套 UV 的網格不少於 30 個', withUv1>=30, withUv1+' 個');
check('天窗寫在 extras.lightmap.dayEmit（晚上調暗）', !!(lm&&[].concat(lm.dayEmit||[]).some(k=>/skylight/.test(k))), JSON.stringify(lm&&lm.dayEmit));
{ const bin=b.slice(20+b.readUInt32LE(12)+8), acc=i=>{ const a=J.accessors[i], bv=J.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), nc={SCALAR:1,VEC2:2,VEC3:3}[a.type], ct=a.componentType, cs={5126:4,5125:4,5123:2,5121:1}[ct], st=bv.byteStride||nc*cs, out=[];
    for(let k=0;k<a.count;k++) for(let c=0;c<nc;c++){ const q=o+k*st+c*cs; out.push(ct===5126?bin.readFloatLE(q):ct===5125?bin.readUInt32LE(q):ct===5123?bin.readUInt16LE(q):bin.readUInt8(q)); } return out; };
  const dup=[]; for(const n of J.nodes.filter(n=>'mesh' in n&&uv1(n))) for(const pr of J.meshes[n.mesh].primitives){ const P=acc(pr.attributes.POSITION), I=acc(pr.indices), seen=new Map(); let d=0;
    const key=(a,b,c)=>[a,b,c].map(k=>[P[k*3],P[k*3+1],P[k*3+2]].map(v=>v.toFixed(3)).join(',')).sort().join('|');
    const nrm=(a,b,c)=>{ const u=[0,1,2].map(j=>P[b*3+j]-P[a*3+j]), w=[0,1,2].map(j=>P[c*3+j]-P[a*3+j]); return [u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]]; };
    for(let t=0;t<I.length;t+=3){ const k=key(I[t],I[t+1],I[t+2]), nn=nrm(I[t],I[t+1],I[t+2]), g=seen.get(k); if(g){ if(g[0]*nn[0]+g[1]*nn[1]+g[2]*nn[2]<0) d++; } else seen.set(k,nn); }
    if(d) dup.push(n.name+' '+d); }
  check('有第二套 UV 的網格沒有疊在一起、方向相反的面（烘焙會全黑）', dup.length===0, dup.slice(0,6).join('、')); }

// ---- 2. 總圖大廳真正的建區域流程（假場景：照 GLB 的節點名、材質名、有沒有第二套 UV 做，幾何是小平面）----
function fakeFromGLB(){
  const root=new THREE.Group(); root.name=J.scenes[J.scene|0].name||'scene'; if(lm) root.userData.lightmap=Object.assign({},lm);
  const build=(i,parent)=>{ const n=J.nodes[i]; let o;
    if('mesh' in n){ const prim=J.meshes[n.mesh].primitives[0]; const g=new THREE.PlaneGeometry(1,1); if('TEXCOORD_1' in prim.attributes) g.setAttribute('uv1',g.attributes.uv.clone());
      o=new THREE.Mesh(g,new THREE.MeshStandardMaterial({name:J.materials[prim.material].name})); }
    else o=new THREE.Group();
    o.name=n.name||''; Object.assign(o.userData,n.extras||{}); parent.add(o); for(const c of n.children||[]) build(c,o); };
  for(const i of J.scenes[J.scene|0].nodes) build(i,root); return root; }
(async()=>{
  const orig=ASSETS.loadOne; const root=fakeFromGLB();
  ASSETS.loadOne=(k)=>k==='bldg.library_interior'?Promise.resolve({scene:root}):orig.call(ASSETS,k);
  const enter=async()=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const zz=Z3.ZONES.library_hall.build(E); E.zone=zz; await new Promise(r=>setTimeout(r,0)); return zz; };
  const z0=await enter();   /* 第一次進去（下面 2b 再進一次）*/
  let fl0=null; z0.group.traverse(o=>{ if(!fl0&&o.isMesh&&/^L0_floor/.test(o.name)) fl0=o; });
  const z=await enter(); ASSETS.loadOne=orig;
  { let f2=null; z.group.traverse(o=>{ if(!f2&&o.isMesh&&/^L0_floor/.test(o.name)) f2=o; });
    const sh={uniforms:{},fragmentShader:'#include <lights_fragment_begin>\n#include <lights_fragment_maps>\n'}; if(f2&&f2.material.onBeforeCompile) f2.material.onBeforeCompile(sh,null);
    z.update(1/30,{hour:20}); const n20=sh.uniforms.lmMix&&sh.uniforms.lmMix.value; z.update(1/30,{hour:12}); const n12=sh.uniforms.lmMix&&sh.uniforms.lmMix.value;
    check('2b. 進兩次：材質共用、不再包一層（lmMix 只宣告一次）、第二次照樣照時段換', !!(fl0&&f2&&f2!==fl0&&f2.material===fl0.material&&(sh.fragmentShader.match(/uniform float lmMix;/g)||[]).length===1&&n20===1&&n12===0), JSON.stringify({same:!!(fl0&&f2&&f2.material===fl0.material),n20,n12})); }
  check('正式模型接上（zone.formal）', z.formal===true);
  const nmat=z.formalInfo&&z.formalInfo.lightmapped; check('接光照貼圖的材質不少於 10 個', nmat>=10, JSON.stringify(z.formalInfo));
  let fl=null; z.group.traverse(o=>{ if(!fl&&o.isMesh&&/^L0_floor/.test(o.name)) fl=o; });
  check('一樓地板：lightMap、強度 2π', !!(fl&&fl.material.lightMap&&Math.abs(fl.material.lightMapIntensity-Math.PI*2)<1e-6), fl&&fl.name);
  if(fl&&fl.material.lightMap){ const sh={uniforms:{},fragmentShader:'#include <lights_fragment_begin>\n#include <lights_fragment_maps>\n'}; fl.material.onBeforeCompile(sh,null);
    const at=h=>{ z.update(1/30,{hour:h}); return +sh.uniforms.lmMix.value.toFixed(3); };
    check('12:00 白天那張、20:00 晚上那張', at(12)===0&&at(20)===1, at(12)+'/'+at(20)); }

  // ---- 3. 新擺設擋住導航；互動點、座位照舊走得到 ----
  const L=LIBRARY_LAYOUT, nav=z.levels||[z.nav], props=L.furniture.filter(f=>f.type==='prop');
  const stand=props.filter(f=>{ const c=f.nav||[f.x,f.z]; return nav[f.lv|0].free(c[0],c[1]); });
  check('地上的新擺設擋住導航（傘架、雨傘套袋機、查詢電腦、自助借書機、還書車、飲水機、滅火器、小茶几）', props.length>=10&&stand.length===0, props.length+' 筆'+(stand.length?'；站得上去的：'+stand.map(f=>f.kind+'('+f.x+','+f.z+')').join('、'):''));
  const reach=(n,x0,z0)=>{ const [c0,r0]=n.toCell(x0,z0), seen=new Uint8Array(n.cols*n.rows), q=[[c0,r0]]; seen[r0*n.cols+c0]=1;
    while(q.length){ const [c,r]=q.pop(); for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const cc=c+dc, rr=r+dr; if(cc<0||rr<0||cc>=n.cols||rr>=n.rows||seen[rr*n.cols+cc]||n.blocked(cc,rr)) continue; seen[rr*n.cols+cc]=1; q.push([cc,rr]); } }
    return seen; };
  const SP=L.entrance.spawn; check('出生點站得住', nav[0].free(SP.x,SP.z));
  const R=[reach(nav[0],SP.x,SP.z), reach(nav[1],0,0.4)];
  /* 每一個互動點：半徑裡（最多 1.2 m）要有站得住、走得到的格子（座位：椅子本身擋住，走到旁邊就能坐） */
  const near=(it)=>{ const lv=it.lv|0, n=nav[lv], rr=Math.min(1.2,Math.max(0.5,it.radius||0.8)); for(let dx=-rr;dx<=rr+1e-9;dx+=0.1) for(let dz=-rr;dz<=rr+1e-9;dz+=0.1){ if(dx*dx+dz*dz>rr*rr) continue; const x=it.x+dx, zz=it.z+dz; if(!n.free(x,zz)) continue; const [c,r]=n.toCell(x,zz); if(R[lv][r*n.cols+c]) return true; } return false; };
  const its=E.interactables.filter(it=>it&&typeof it.x==='number'&&typeof it.z==='number'), bad=its.filter(it=>!near(it));
  check('每一個互動點附近照舊有站得住、走得到的位置', its.length>=20&&bad.length===0, its.length+' 個'+(bad.length?'；走不到：'+bad.map(it=>(it.label||'?')+'('+it.x.toFixed(1)+','+it.z.toFixed(1)+')').join('、'):''));
  const s=z.seats, T=L.furniture.find(f=>f.type==='studyTable'&&f.z>0);
  check('小安「總圖的下午」的兩個座位：z>0 第一張長桌最西邊、面對面', !!(s[0]&&s[1]&&Math.abs(s[0].z-(T.z-0.8))<1e-6&&Math.abs(s[1].z-(T.z+0.8))<1e-6&&Math.abs(s[0].x-s[1].x)<1e-6&&s[0].x<T.x-1.5), s[0]&&s[1]?JSON.stringify([s[0],s[1]]):'');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

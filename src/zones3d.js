/* ===== 世界區域定義：台大核心校園（法學院→校園道路→椰林大道→校門）、公館、溫州街、室內 ===== */
'use strict';
const Z3 = (function(){
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.95},o||{}));
  const texMat=(t,rep,o)=>{ const m=new THREE.MeshStandardMaterial(Object.assign({map:t,roughness:0.95,metalness:0},o||{})); return m; };
  function ground(g,w,d,tex,rep,x,z,y){ const t=tex.clone(); t.needsUpdate=true; t.repeat.set(rep[0],rep[1]); const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),texMat(t)); m.rotation.x=-Math.PI/2; m.position.set(x||0,y||0,z||0); m.receiveShadow=true; g.add(m); return m; }
  /* 步道、路面（strip）都在 0.02 m：交叉的地方兩片疊在同一個高度，畫面一直閃（2026-10-14 使用者回報「男一舍前面的地板一直閃爍」：男一舍的步道和東西向的柏油路在 (20,47) 交叉；校園共 11 處）。
     交叉的路面分層（polygonOffset，層數只在真的重疊時加，通常 0～2 層）：柏油路在步道上面，其他照建立的先後（後蓋的在上面）。高度不變（導航、點地面、腳步都不受影響）*/
  const stripOf=new WeakMap();
  function stripLayer(m,L){ m.userData.stripLayer=L; const mt=m.material; if(L>0){ mt.polygonOffset=true; mt.polygonOffsetFactor=-L; mt.polygonOffsetUnits=-2*L; } else { mt.polygonOffset=false; mt.polygonOffsetFactor=0; mt.polygonOffsetUnits=0; } mt.needsUpdate=true; }
  function strip(g,x0,z0,x1,z1,w,tex,rep){ const dx=x1-x0, dz=z1-z0; const len=Math.hypot(dx,dz); const t=tex.clone(); t.needsUpdate=true; t.repeat.set(w/rep,len/rep); const m=new THREE.Mesh(new THREE.PlaneGeometry(w,len),texMat(t)); m.rotation.x=-Math.PI/2; m.rotation.z=-Math.atan2(dx,dz); m.position.set((x0+x1)/2,0.02,(z0+z1)/2); m.receiveShadow=true; g.add(m);
    const ux=dx/(len||1), uz=dz/(len||1), hx=Math.abs(uz)*w/2, hz=Math.abs(ux)*w/2; const box={x0:Math.min(x0,x1)-hx,x1:Math.max(x0,x1)+hx,z0:Math.min(z0,z1)-hz,z1:Math.max(z0,z1)+hz,road:!!(t.userData&&t.userData.asphalt),m};
    let list=stripOf.get(g); if(!list){ list=[]; stripOf.set(g,list); } const hit=list.filter(b=>Math.min(b.x1,box.x1)-Math.max(b.x0,box.x0)>0.01&&Math.min(b.z1,box.z1)-Math.max(b.z0,box.z0)>0.01);
    let L=0; for(const b of hit) if(!(b.road&&!box.road)) L=Math.max(L,b.m.userData.stripLayer+1); stripLayer(m,L);
    for(const b of hit) if(b.road&&!box.road&&b.m.userData.stripLayer<=L) stripLayer(b.m,L+1);   /* 步道後蓋、和柏油路重疊：柏油路往上一層 */
    list.push(box); return m; }
  function curb(g,x0,z0,x1,z1,w){ const dx=x1-x0, dz=z1-z0; const len=Math.hypot(dx,dz); for(const s of [-1,1]){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.14,len),M('#d9d3c6')); const ang=-Math.atan2(dx,dz); m.rotation.y=ang; m.position.set((x0+x1)/2+Math.cos(ang)*s*(w/2+0.12),0.07,(z0+z1)/2-Math.sin(ang)*s*(w/2+0.12)); g.add(m); } }
  // ---- 資產層：樹／長椅／小道具（有 GLB 就用 GLB，沒有就 fallback 到 W3 placeholder）----
  let treeIdx=0, leafyCount=0; const TREE=(scale)=>{ treeIdx++; /* 闊葉樹（townkit 葉片卡，和溫州街同一套）；舊的 GLB 方塊葉樹／針葉樹看起來不像台北的樹，只在 TK 不存在時退回 */ if(typeof TK!=='undefined'&&TK.tree) return TK.tree(6.4*(scale||1)); const useLeafy=(treeIdx%2===1)&&leafyCount<14; if(useLeafy) leafyCount++; return ASSETS.get(useLeafy?'tree.leafy':'tree.conifer',{height:6*(scale||1)}); };
  let palmIdx=0; const PALM=(h)=>{ palmIdx++; /* 大王椰子：townkit 程序化（灰白筆直樹幹＋綠色葉鞘＋羽狀葉）；舊 GLB 是彎曲的椰子樹，只在 TK 不存在時退回 */ if(typeof TK!=='undefined'&&TK.royalPalm) return TK.royalPalm((h||9)*1.35,palmIdx); return ASSETS.get('tree.palm',{height:h||9}); };
  /* 正式街景模型門口、騎樓裡的雜物：人貼牆走會穿過去的那幾個，模型接上以後才擋住那幾格（ART-WZ0，LAWWW2 10-21；套件備用模型沒有這些雜物，不能先擋，不然是看不見的牆）。
     [x, z, 寬, 深]＝wenzhou_street.props.json／gongguan_shops.props.json 的腳印（wz_street.py 建模時寫出來）；pad 半格（blockRect 只擋格子中心在範圍裡的）。改了 Blender 的雜物要跟著改，tests/street_props_nav_unit.js 會抓 */
  const WZ_PROP_BLOCKS=[[-1.82,5.02,0.83,0.83],[-21.9,-4.9,0.6,0.46],[22.73,-7.6,1.46,0.44],[29.5,-7.5,0.6,0.44],[-37.2,-3.02,0.8,0.64],[-37.23,-3.5,0.63,0.61]];   /* A2 公寓門邊盆栽、B1 鐵捲門前紙箱、B5 茶飲騎樓回收桶、冰菓室 A 字立牌、W0 兩個盆栽 */
  const GG_PROP_BLOCKS=[[-58.0,21.65,0.34,0.34],[-58.6,21.65,0.34,0.34],[-66.23,21.65,1.46,0.44],[-48.8,21.4,0.6,0.44],[-54.83,21.4,1.46,0.44],[-37.4,21.65,1.24,0.52],[-35.41,21.7,0.49,0.52],[-46.0,21.65,0.6,0.44],[-31.43,21.68,1.46,0.44],[-25.6,21.7,0.25,0.26],[-33.3,21.57,0.9,0.74],[-17.0,21.65,0.6,0.44],[-15.2,21.7,0.6,0.46],[-22.12,21.71,0.82,0.68],[-5.9,21.65,0.34,0.34],[-6.5,21.6,0.34,0.34],[-12.23,21.65,1.46,0.44],[11.3,21.6,0.6,0.44],[8.59,21.7,0.49,0.52],[7.3,21.65,1.4,0.36],[6.0,21.7,0.56,0.54],[21.4,21.56,2.2,1.09],[17.0,21.7,0.6,0.46],[27.7,21.65,1.4,0.36],[25.1,21.57,0.9,0.74],[40.3,21.57,0.9,0.74],[38.9,21.7,0.6,0.46],[46.4,21.6,0.6,0.44],[43.0,21.7,0.52,0.54],[50.9,21.7,0.25,0.26],[57.6,21.65,1.24,0.52],[59.0,21.7,0.6,0.46],[52.27,21.7,0.85,0.81],[63.7,21.6,0.6,0.44],[62.7,21.7,0.25,0.26],[60.48,21.71,0.77,0.58],[73.9,21.6,0.6,0.44],[75.9,21.65,1.4,0.36],[69.5,21.7,0.52,0.54]];   /* 公館騎樓 14 間店玻璃前的雜物（G06 腳踏車行的車另外擋） */
  function propBlocks(nav,list){ for(const [x,z,w,d] of list) nav.blockRect(x,z,w,d,0,0.25); }
  const BENCH=()=>W3.formalBench()||ASSETS.get('prop.bench',{});   /* 第二個 AI 的公園長椅（prop.street）優先 */
  const PROP=(g,key,x,y,z,ry,scale)=>{ const o=ASSETS.get(key,{}); if(!o) return null; o.position.set(x,y,z); if(ry) o.rotation.y=ry; if(scale) o.scale.multiplyScalar(scale); g.add(o); return o; };
  function place(g,obj,x,z,ry,scale){ obj.position.set(x,0,z); if(ry) obj.rotation.y=ry; if(scale) obj.scale.setScalar(scale); g.add(obj); return obj; }
  /* 停著的腳踏車分區合併（PERF-CAMPUS-SHADOW-1020，LAWWW2 2026-10-21）：校園約 120 台車（停車架＋單台，正式模型一台約 1,300 個三角形），原本被進區域時的全區合併（P3.mergeStatic）
     併成橫跨 150×180 m 的幾塊——畫面外、很遠的車照樣每一幀畫（大道上主畫面約 14 萬、陰影那一輪約 8 萬個三角形）。改成照 cell 公尺的格子分區合併（同一區、同材質一塊；
     userData.dyn＝不參加全區合併），畫面外的整區被視錐剔除；zone.update 每 0.5 秒照鏡頭到那一區的距離開關（far 公尺外不畫）。導航阻擋另外寫在 blockRect，不受影響 */
  function parkedBikeChunks(g,list,cell,far){ const chunks=new Map(), v=new THREE.Vector3(); g.updateMatrixWorld(true);
    for(const o of list){ if(!o||!o.parent) continue; o.getWorldPosition(v); const k=Math.floor(v.x/cell)+','+Math.floor(v.z/cell); let c=chunks.get(k); if(!c){ c=new THREE.Group(); chunks.set(k,c); } c.attach(o); }
    const out=[]; for(const c of chunks.values()){ const m=W3.mergeGroup(c); m.name='parked_bikes'; m.userData.dyn=true; g.add(m); m.updateMatrixWorld(true); out.push({o:m,box:new THREE.Box3().setFromObject(m)}); }
    let t=0; return { chunks:out, update(dt,cam){ if((t-=dt)>0||!cam) return; t=0.5; for(const b of out){ const vis=b.box.distanceToPoint(cam.position)<far; if(b.o.visible!==vis) b.o.visible=vis; } } }; }
  // 校門（CK.gate）：放好之後把本地座標的阻擋轉成導航格；門房加鏡頭碰撞（ry 只用 0、±π/2）
  // 套件物件（校門、傅鐘）的導航阻擋：userData.gate.blocks 是物件座標的 [x,z,寬,深,pad]，依擺放位置與旋轉換成區域座標（旋轉只支援 90° 的倍數）
  function placeBlocks(nav,obj,x,z,ry){ const c=Math.cos(ry||0), sn=Math.sin(ry||0), q=Math.abs(sn)>0.5;
    for(const [bx,bz,bw,bd,pad] of obj.userData.gate.blocks){ const wx=x+bx*c+bz*sn, wz=z-bx*sn+bz*c; nav.blockRect(wx,wz,q?bd:bw,q?bw:bd,0,pad); } }
  function placeGate(E,g,nav,gate,x,z,ry){ place(g,gate,x,z,ry); placeBlocks(nav,gate,x,z,ry); const c=Math.cos(ry||0), sn=Math.sin(ry||0), q=Math.abs(sn)>0.5;
    const H=gate.userData.gate.house; const m=new THREE.Mesh(new THREE.BoxGeometry(q?H.d:H.w,H.h,q?H.w:H.d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x+H.x*c+H.z*sn,H.h/2,z-H.x*sn+H.z*c); g.add(m); E.colliders.push(m);   /* 門房（2026-10-18 起在門的正中間，CK.gate 的 .house）*/
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.campus_gate']){ gate.userData.ckTag='gate'; gate.userData.dyn=true; } }   /* 有正式模型：套件不參加靜態合併（載入後才藏得掉）*/
  // 校門的出口互動點：兩側通道上各一個（門房在正中間，2026-10-18）。out＝往校外（+z）或校內（−z）離門的中線多遠
  function gateExits(gate,x,z,ry,out,r,base){ const c=Math.cos(ry||0), sn=Math.sin(ry||0); return gate.userData.gate.lanes.map(lx=>Object.assign({},base,{x:x+lx*c+out*sn,z:z-lx*sn+out*c,r})); }
  // 校門的 Blender 正式模型（ART-EXT-GATE，LAWWW2-C：campus_gate.py，校門自己的座標）：放到和套件一樣的位置、方向，再照校園地標的接法藏起套件
  function gateGLB(E,g,gate,x,z,ry,zone){ if(typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.campus_gate']) return;
    ASSETS.loadOne('bldg.campus_gate').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true); root.position.set(x,0,z); root.rotation.y=ry||0; attachWenzhouModel(E,g,root,'ckTag','campus_gate_glb','gate'); }).catch(e=>console.warn('校門正式模型載入失敗，用套件的外觀',e)); }
  function collider(E,x,z,w,d,h,rot){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h||6,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x,(h||6)/2,z); m.rotation.y=rot||0; E.colliders.push(m); E.scene.add(m); E.zone&&E.zone.group; return m; }
  // 椰林大道的路面（照使用者的照片；第十八批是深色柏油＋白邊線，第二十一批再比對後改成）：淺灰、有補過的深色色塊、沒有白色邊線、中線是細的黃色虛線，路邊一條稍深的排水溝。
  // 貼圖 12 m 寬 × 9 m 一段；校園、公館（從校門看進去的背景）共用
  const avenueRoadTex=()=>{ const t=W3.canvasTex('avenueRoad4',256,256,(x,w,h)=>{ x.fillStyle='#acacaa'; x.fillRect(0,0,w,h); let s=17; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; };   /* 第二十二批再調淺（使用者：「柏油路的顏色是淺灰 你的太深」；第二十一批的 #8a8883 算圖後受光處只有約 130、偏暖）*/
        for(let i=0;i<16;i++){ const cx=r()*w, cy=r()*h, rx=10+r()*46, ry=5+r()*22, a=0.08+r()*0.1; x.fillStyle='rgba(98,98,96,'+a+')'; for(const oy of [-h,0,h]){ x.beginPath(); x.ellipse(cx,cy+oy,rx,ry,r()*0.3,0,Math.PI*2); x.fill(); } }   /* 補過的路面（上下接縫處畫兩次，重複時不會斷）*/
        for(let i=0;i<3400;i++){ const v=(r()*44)|0; x.fillStyle='rgba('+(144+v)+','+(144+v)+','+(141+v)+',0.4)'; x.fillRect(r()*w,r()*h,2,2); }
        x.fillStyle='rgba(88,88,86,0.3)'; x.fillRect(0,0,w*0.022,h); x.fillRect(w*0.978,0,w*0.022,h);
        x.fillStyle='#d6a425'; x.fillRect(w*0.4955,0,w*0.009,h*0.33); }); t.userData.asphalt=true; return t; };
  const AVE_TREE={spread:1.45,dark:0.8};   // 椰林大道兩側樹牆（校園、公館看進校門的背景共用；第二十三批照照片）
  const campusWallMat=()=>TK.M('bgWallM',()=>TK.std({map:TK.tileTex('#b8735a','#9c8676','bgWall'),roughness:0.9}));   // 校園圍牆（紅褐色面磚）：校園、公館共用
  // ---------- 校園主區 ----------
  /* 萬才館第二階段（D36；使用者需求 21：「萬才館的弧形大樓梯必須能讓玩家走上去」「玩家能從室外地面走上樓梯，到達二樓平台」）：
     校園加第 1 層導航格（和第 0 層同樣大小、同原點；只有樓梯、樓梯頂端的平台、弧形陽台走得到）。樓梯兩層共用，高度一階一階算（和套件畫出來的台階是同一組外緣
     ck.wancai.outl：每一階的頂面高 (k+1)×16.5 cm），走到樓梯頂端時引擎換到第 1 層（第 0 層的平台是實心石材、擋住）；陽台下面的一樓入口照舊在第 0 層（地面）。
     二樓入口（樓梯正上方、平台後面的玻璃門）：萬才館室內現在只有一樓大廳，這一版先用看得懂的告示關著（D38 第 4 條），之後做二樓室內再打開。
     要在整個校園的導航阻擋都放好之後才呼叫（第 1 層的樓梯格照第 0 層走得到的格子複製）。 */
  function wancaiStairs(E,g,nav,b,bx,bz,walk){ const W=b.userData.ck.wancai; if(!W) return null;
    const halfAt=(R,zp)=>{ for(let i=1;i<R.length;i++){ const a=R[i-1], c=R[i]; if(zp<=c[1]+1e-9){ const t=c[1]>a[1]?(zp-a[1])/(c[1]-a[1]):1; return a[0]+(c[0]-a[0])*Math.max(0,Math.min(1,t)); } } return -1; };   /* 外緣（右半邊）在 zp 的半寬 */
    let hwMax=0; for(const R of W.outl) for(const p of R) hwMax=Math.max(hwMax,p[0]);
    /* 每一階外緣的半寬先算成表（每 1 cm 一格）：高度函式每一幀、每個人物都會叫好幾次 */
    const DZ=0.01, NZ=Math.ceil(W.L/DZ)+1, HW=W.outl.map(R=>{ const zf=R[R.length-1][1], a=new Float32Array(NZ); for(let i=0;i<NZ;i++){ const zp=i*DZ; a[i]=zp>zf+1e-9?-1:halfAt(R,zp); } return a; });
    const kOf=zp=>Math.max(0,Math.min(W.NS-1,W.NS-1-Math.floor(zp/W.TR))), at=zp=>Math.min(NZ-1,Math.round(zp/DZ));
    const CORE=new Float32Array(NZ), OUT=new Float32Array(NZ); for(let i=0;i<NZ;i++){ const kc=kOf(Math.min(i*DZ,W.L-1e-6)); let o=-1; for(let k=0;k<=kc;k++) o=Math.max(o,HW[k][i]); OUT[i]=o; CORE[i]=Math.min(HW[kc][i],o); }
    // 畫面上的高度（腳踩的踏面）：那一點最上面的那一階 (k+1)×16.5 cm；外側（最下面幾階往外張開的地方）往下一階找
    const vfn=(x,z)=>{ const zp=z-bz-W.z0; if(zp<0||zp>=W.L) return null; const dx=Math.abs(x-bx-W.SX), i=at(zp); for(let k=kOf(zp);k>=0;k--){ if(dx<=HW[k][i]) return (k+1)*W.RS; } return null; };
    // 碰撞、找路用的連續高度（和霖澤館的台階一樣：最上面一階踏面中心 3.63 m 連續斜下到最下面一階的邊緣 0）；兩側往外張開的地方往外漸漸降到地面——
    // 張開的那幾階每一階只露出 10～30 cm 寬，照一階一階算的話人物半徑裡高低差超過 25 cm、站不住（走到樓梯下面往旁邊走會卡住，nav_buildings_unit 抓到）；高的地方（石牆盡頭旁邊）照樣是走不下去的邊
    const hsAt=zp=>Math.max(0,Math.min(W.PF,W.PF*(W.L-zp)/(W.L-W.TR/2)));
    const coreW=zp=>W.hw(Math.min(1,zp/W.L))+0.1, bottomRow=zp=>zp>=W.L-W.TR;   /* 主樓梯的寬度（兩道石牆之間那條曲線，一路延伸到最下面）；最下面一階整排都算 */
    const fn=(x,z)=>{ const zp=z-bz-W.z0; if(zp<0||zp>=W.L) return null; const dx=Math.abs(x-bx-W.SX), i=at(zp), o=OUT[i]; if(dx>o) return null; const h=hsAt(zp), c=coreW(zp); return (dx<=c||bottomRow(zp))?h:h*(o-dx)/Math.max(1e-3,o-c); };
    const stair={x0:bx+W.SX-hwMax-0.01,x1:bx+W.SX+hwMax+0.01,z0:bz+W.z0,z1:bz+W.z0+W.L,fn,vfn,wancai:true};
    nav.addSurf(stair);
    /* 樓梯兩側往外張開的部分（石牆盡頭到最下面一階之間）不能走、也不能從側面跨下去：那裡是一層一層疊起來的窄台階（每階只露出 10～30 cm），
       連續高度往外降得很陡，A* 的格子中心站得住、人物稍微偏一點就站不住（reachability_all：從萬才館一樓出來走回霖澤館前，卡在石牆盡頭旁邊；
       只擋「太陡」的格子之後，換成卡在西側張開的地方）→ 主樓梯寬度（兩道石牆之間那條曲線，延伸到最下面）以外、外緣往外 0.25 m 以內整圈擋起來（最下面一階整排不擋）。
       可以走的是主樓梯（一路到最下面）和最下面一階，經過樓梯底下的路會沿著最下面一階或地面走 */
    { const [c0,r0]=nav.toCell(stair.x0-0.6,stair.z0), [c1,r1]=nav.toCell(stair.x1+0.6,stair.z1); for(let cz=r0;cz<=r1;cz++) for(let cx=c0;cx<=c1;cx++){ const i=nav.idx(cx,cz); if(nav.b[i]) continue; const [x,z]=nav.toWorld(cx,cz), zp=z-bz-W.z0;
        if(zp<0||bottomRow(zp)) continue; const k=at(Math.min(zp,W.L-1e-6)), dx=Math.abs(x-bx-W.SX); if(dx>coreW(zp)&&dx<=OUT[k]+0.25) nav.b[i]=1; } nav._cm=null; }
    const nav1=new E3.NavGrid(nav.w,nav.h,nav.cell,nav.ox,nav.oz).fillBlocked().setFloor(W.PF); nav1.addSurf(stair);
    { const [c0,r0]=nav.toCell(stair.x0,stair.z0), [c1,r1]=nav.toCell(stair.x1,stair.z1); for(let cz=r0;cz<=r1;cz++) for(let cx=c0;cx<=c1;cx++){ const i=nav.idx(cx,cz); if(nav.b[i]) continue; const [x,z]=nav.toWorld(cx,cz); if(fn(x,z)!=null) nav1.b[i]=0; } }   // 樓梯（石牆、端塊在第 0 層已經擋住）
    nav1.freeRect(bx+W.LX0+W.CT+0.02,bz+W.d/2+0.12,bx+W.LX1,bz+W.z0);   // 樓梯頂端的平台（西側是石牆、北側是二樓玻璃）
    { const [c0,r0]=nav.toCell(bx+W.BX0,bz+W.d/2), [c1,r1]=nav.toCell(bx+W.BX1,bz+W.d/2+W.BB); for(let cz=r0;cz<=r1;cz++) for(let cx=c0;cx<=c1;cx++){ const [x,z]=nav.toWorld(cx,cz), lx=x-bx, lz=z-bz; if(lx<W.BX0||lx>W.BX1-0.3||lz<W.d/2+0.12) continue; if(lz<W.bzf(lx)-W.railIn-0.1) nav1.b[nav.idx(cx,cz)]=0; } }   // 弧形陽台（欄杆內側）
    nav1._cm=null;
    // 點地面移動：樓梯（斜面，第 0 層）；平台＋陽台（第 1 層，照陽台的弧形外緣；只有從上面看打得到）
    { const N=28, P=[], I=[], R0=W.outl[0], zf0=R0[R0.length-1][1];   /* 照樓梯的寬度（兩道石牆之間；最下面幾階往外張開的地方照最下面那一階的外緣），不是一整片長方形：旁邊的地面（陽台下的一樓入口、弧形量體前）點下去不會先打到樓梯的透明斜面、把目的地算錯 */
      for(let i=0;i<=N;i++){ const sv=i/N, zp=sv*W.L; let hw=W.hw(sv); if(sv>W.SC) hw=Math.max(hw,halfAt(R0,Math.min(zp,zf0))); const y=W.PF*(1-sv)+0.01; P.push(bx+W.SX-hw,y,bz+W.z0+zp, bx+W.SX+hw,y,bz+W.z0+zp); }
      for(let i=0;i<N;i++){ const a=2*i, b=a+1, c=a+2, d=a+3; I.push(a,c,b, b,c,d); }   /* 正面朝上（從上面點才打得到）*/
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setIndex(I); geo.computeVertexNormals(); geo.computeBoundingSphere();
      const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({visible:false})); m.userData.walkLv=0; m.userData.dyn=true; g.add(m); walk.push(m); }
    { const sh=new THREE.Shape(); sh.moveTo(W.LX0,-W.d/2); sh.lineTo(W.LX0,-W.z0); sh.lineTo(W.BX0,-W.z0); for(let i=1;i<=24;i++){ const x=W.BX0+(W.BX1-W.BX0)*i/24; sh.lineTo(x,-W.bzf(x)); } sh.lineTo(W.LX0,-W.d/2);
      const geo=new THREE.ShapeGeometry(sh); geo.rotateX(-Math.PI/2); const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({visible:false})); m.position.set(bx,W.PF+0.01,bz); m.userData.walkLv=1; m.userData.dyn=true; g.add(m); walk.push(m); }
    /* 校園的地面（第 0 層、y=0）也要打得到：站在平台或樓梯上（第 1 層）點廣場時，原本打不到「有高度的地面」就用玩家那一層的基本高度（3.63 m）的平面，
       目的地算在離玩家很近、平台外面走不到的地方（真實玩家流程：從平台走下大樓梯點了 7 次）。正面朝上；在地面那一層時和原本的平面是同一個點（霖澤館室內的一樓地板也是這樣） */
    { const geo=new THREE.PlaneGeometry(nav.w,nav.h); geo.rotateX(-Math.PI/2); const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({visible:false})); m.position.set(nav.ox+nav.w/2,0,nav.oz+nav.h/2); m.name='campus_ground_tap'; m.userData.walkLv=0; m.userData.dyn=true; g.add(m); walk.push(m); }
    /* 二樓入口（萬才館第三階段，D42）：進到室內二樓的西南門廳（src/data/wancai_layout.js 的 upperDoor）。第二階段（D41）這扇門關著 */
    { const UD=(typeof WANCAI_LAYOUT!=='undefined')&&WANCAI_LAYOUT.upperDoor; E.interactables.push(UD?{x:bx+W.SX,z:bz+W.d/2+0.8,radius:1.4,lv:1,y:W.PF,label:'進入萬才館（二樓）',exit:{to:'wancai',spawn:Object.assign({},UD.spawn)}}
        :{x:bx+W.SX,z:bz+W.d/2+0.8,radius:1.4,lv:1,y:W.PF,label:'萬才館二樓入口',look:'二樓入口的玻璃門關著。'}); }
    return nav1; }
  const campus={ id:'campus', name:'台大校園', indoor:false, cityLight:0.25, size:[260,170], viewFar:260, fogNear:100, build(E){   /* 第二十批：邊界外有背景了，視距拉遠（照片裡椰林大道盡頭的總圖看得清楚；從校門口看總圖約 205 m）*/
    treeIdx=0; leafyCount=0; palmIdx=0; const g=new THREE.Group(); const W=260, D=170; const parked=[], parkedRack=n=>{ const r=W3.bikeRack(n); parked.push(r); return r; }, parkedBike=(...a)=>{ const b=W3.bikeAny(...a); parked.push(b); return b; };   /* 停著的車：分區合併、距離開關（parkedBikeChunks）*/ /* 導航格必須涵蓋法學院前庭（z 到 -124），否則霖澤館前完全不能走 */ const nav=new E3.NavGrid(W,217,0.5,-W/2,-132); const seats=[]; const lamps=[]; const buildings=[];
    // 地面：草地
    ground(g,W,D,W3.grassTex(),[W/4,D/4],0,0,0); ground(g,120,44,W3.grassTex(),[30,11],52,-106,-0.002); // 北側法學院區地面
    // 校園配置依台大校總區平面圖（map.ntu.edu.tw，2025.10.13 版）壓縮：x 往東、-z 往北；椰林大道東西向（z=0），西端大門、東端總圖書館；
    // 大道南側：傅鐘＋行政大樓；北側：文學院、校史館、農業陳列館；小椰林道（x=30）往北通法學院；醉月湖在文學院北邊。
    // 主要道路：椰林大道 東西向（z=0），從校門 x=-124 到總圖前廣場 x≈72
    strip(g,-124,0,72,0,16,W3.pathTex(),4); curb(g,-124,0,72,0,16);
    // v9.3 第十八批：大道中間 12 m 是柏油路面（黃色虛線中線、白色邊線；照使用者給的椰林大道照片），兩側各 2 m 石磚人行道（原本整條 16 m 都是淺色石磚，像廣場）。
    // 只是路面貼圖，導航不變；騎腳踏車的路人走 z=±3（路面上），行人走 z=±7（人行道上）
    { const rt=avenueRoadTex().clone(); rt.needsUpdate=true; rt.repeat.set(1,196/9);
      const road=new THREE.Mesh(new THREE.PlaneGeometry(12,196),texMat(rt,null,{roughness:0.9})); road.rotation.x=-Math.PI/2; road.rotation.z=-Math.PI/2; road.position.set(-26,0.024,0); road.receiveShadow=true; g.add(road); }
    // 總圖前廣場（椰林大道盡頭）
    ground(g,17,36,W3.stoneTex('#e3d9c6'),[4,9],78.5,0,0.016);
    // 椰林大道兩側的杜鵑花叢（真實的椰林大道中間沒有分隔島；開學的九月杜鵑不開花，只有綠叢）：每兩棵椰子樹中間一叢；
    // 路口（小椰林道、文學院、往醉月湖的小路、宿舍）、路燈、長椅前、傅鐘廣場前留空，草地和長椅都走得到
    { const bin=new TK.Bin(); const lampXs=[], benchXs=[]; for(let x=-105;x<=55;x+=22) lampXs.push(x); for(let x=-100;x<=50;x+=25) benchXs.push(x);
      const skipN=[[24,36],[-41,-35],[-15.5,-8.5]], skipS=[[-53,-23],[16,24]];
      for(let x=-106.25;x<=66.25;x+=7.5){ if(lampXs.some(l=>Math.abs(x-l)<2.6)||benchXs.some(b=>Math.abs(x-b)<1.8)) continue;
        for(const s of [-1,1]){ if((s<0?skipN:skipS).some(([a,b])=>x>a-1.5&&x<b+1.5)) continue; const z=s*10.8;
          for(let k=-1;k<=1;k++) TK.plantClump(bin,x+k*0.85,0,z+(k%2?0.12:-0.1)*s,0.95+(Math.abs(x*7+k*3)%3)*0.08,6,[0.62,0.82,0.6]);
          nav.blockRect(x,z,2.6,0.9,0,0); } }
      const grp=new THREE.Group(); bin.build(grp); g.add(grp); }
    // 法學院道路：從椰林大道 x=30 向北到法學院區 z=-70
    strip(g,30,0,30,-74,10,W3.pathTex(),4); curb(g,30,0,30,-63.8,10); curb(g,30,-68.2,30,-74,10);   /* X75：z −68～−64 的路緣斷開（往社科院中庭的路） */
    strip(g,30,-60,102,-60,10,W3.pathTex(),4); curb(g,30,-60,102,-60,10);   /* 東端原本到 x=110（舊社科院的中庭）；X75 以後到那棟沒有名字的系館正門 */
    if(typeof SOCSCI_LAYOUT!=='undefined'&&typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.campus_socsci']){   /* X75 社科院（霖澤館西南）：小椰林道往中庭（兩棵椰子樹 z −62、−70 中間）、法學院廣場往大樓正門（東面）的兩小段步道 */
      strip(g,17,-66.5,25,-66.5,3,W3.pathTex(),2); strip(g,17,-85,25,-85,4,W3.pathTex(),2); }   /* 中庭那段 z −68～−65：不疊到模型裡圖書館東側的鋪面（z −65 以南） */
    // 通往醉月湖的小路（文學院東側往北）＋湖南岸步道
    /* 方案 A（D55／D56，使用者 2026-10-13：普通、博雅照官方地圖的真實位置）：醉月湖整組往北搬到 (-36,-112)；小路往北延長到新的湖南岸步道（z=-97）；
       原本的湖南岸步道（z=-51）改成文學院和普通教學館之間的路（z=-46.5）；普通、博雅之間有一條往博雅門口的路（z=-70.5） */
    strip(g,-12,-8,-12,-97,5,W3.pathTex(),4); strip(g,-58,-46.5,-8,-46.5,4,W3.pathTex(),4); strip(g,-54,-97,-8,-97,4,W3.pathTex(),4); strip(g,-44,-70.5,-10,-70.5,3,W3.pathTex(),4);
    // 舟山路（南側，行政大樓後面）
    strip(g,-110,47,110,47,9,W3.asphaltTex(),6); curb(g,-110,47,110,47,9);
    for(const x of [-97,-75,-53,-31,-9,14,26,48,70]){ const l=W3.lampPost(); place(g,l,x,52.6,Math.PI); l.userData.roadPool=true; lamps.push(l); nav.blockCircle(x,52.6,0.5); }   /* 舟山路的路燈（LAWWW2-B 10-24 巡查 P3：整條 220 m 原本沒有一盞路燈，晚上大一女舍門口、回男生宿舍穿過的那一段都是黑的）：南側（宿舍那一側）路緣外 1.1 m、約 22 m 一盞，燈臂朝馬路、路面一圈光（roadPool，和椰林大道同一套）；−97 照女舍長椅後面那段馬路，14、26 夾著往男生宿舍的路（x 17～23）；避開大一女舍 A、B 門口和長椅那一盞 */
    strip(g,20,0,20,58,6,W3.pathTex(),4);
    // ---- 宿舍（舟山路南側）----
    // 校園建築套件：導航格只擋建築本體、拱廊柱子、門廊（拱廊底下可以走）；鏡頭碰撞＝建築本體＋拱廊上方的樓層（鏡頭不會穿到樓上，拱廊裡也不會被拉到臉前面）
    const campusWalk=[];   // 點地面移動時打得到的「有高度的地面」（霖澤館穿堂、台階）
    const ckPlace=(b,x,z,ry)=>{ place(g,b,x,z,ry); const c=Math.cos(ry||0), sn=Math.sin(ry||0), q=Math.abs(sn)>0.5; const ck=b.userData.ck; const W=(lx,lz)=>[x+lx*c+lz*sn,z-lx*sn+lz*c];
      for(const [bx,bz,bw,bd,pad] of ck.blocks){ const p=W(bx,bz); nav.blockRect(p[0],p[1],q?bd:bw,q?bw:bd,0,pad==null?0.15:pad); }
      const colBox=(lx,lz,bw,bd,y0,y1)=>{ const p=W(lx,lz); const m=new THREE.Mesh(new THREE.BoxGeometry(q?bd:bw,y1-y0,q?bw:bd),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(p[0],(y0+y1)/2,p[1]); g.add(m); E.colliders.push(m); };
      if(ck.cols){ for(const [lx,lz,bw,bd,y0,y1] of ck.cols) colBox(lx,lz,bw,bd,y0,y1); }   /* 套件自己給的鏡頭碰撞（霖澤館：門廊下面是空的）*/

      else { colBox(0,-ck.ad/2,ck.w,ck.d-ck.ad,0,ck.H); if(ck.ad>0) colBox(0,ck.d/2-ck.ad/2,ck.w,ck.ad,ck.gfh-0.35,ck.H); }
      /* v9.4（D36）：套件給的地面高度（霖澤館穿堂 0.9 m、前後台階斜面）→ 導航格的高度＋點地面移動用的透明地板（只支援沒有旋轉的擺放）*/
      if(ck.surfs&&ck.surfs.length){ if(Math.abs(sn)>1e-6) console.warn('ck.surfs：旋轉過的建築還不支援高度'); else for(const s0 of ck.surfs){ const s1=Object.assign({},s0,{x0:x+s0.x0,x1:x+s0.x1,z0:z+s0.z0,z1:z+s0.z1}); nav.addSurf(s1);
          const ya=s1.y!==undefined?s1.y:s1.ya, yb=s1.y!==undefined?s1.y:s1.yb, dz=s1.z1-s1.z0; const m=new THREE.Mesh(new THREE.PlaneGeometry(s1.x1-s1.x0,Math.hypot(dz,ya-yb)),new THREE.MeshBasicMaterial({visible:false})); m.position.set((s1.x0+s1.x1)/2,(ya+yb)/2+0.01,(s1.z0+s1.z1)/2); m.rotation.x=-Math.PI/2+Math.atan2(ya-yb,dz); m.userData.walkLv=0; m.userData.dyn=true; g.add(m); campusWalk.push(m); } } };
    // 男一舍：宿舍沒有拱廊——淺灰米色面磚、方窗、平屋頂、一樓正面中間是大門＋小平頂門廊（佔地、門口位置和舊版相同）
    const dormB=CK.hall({w:36,d:14,floors:5,gfh:3.6,fh:3.1,wall:'#cfc6b4',trim:'#e8e2d6',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4},sign:'男一舍'}); ckPlace(dormB,20,68,Math.PI); buildings.push(dormB); const m1GLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_male1']; dormB.userData.ckTag='male1'; if(m1GLB) dormB.userData.dyn=true;   /* 男一舍的 Blender 正式模型（LAWWW2-C campus_male1.py，ART-EXT-M1）：只換外觀；地上 5 層（AA-C 10-21 裁定 J1：祐廷的房間是 507；真實的男一舍是 4 層，10-18 曾照住宿組資料改成 4 層），套件和正式模型一樣高（鏡頭碰撞跟著）；導航、門口照舊 */ for(const x of [-4,44]){ const b=TREE(1.2); place(g,b,x,60,0); nav.blockCircle(x,60,0.9); }
    // ---- 校門（西端）----
    // v9.3 第十四批：CK.gate（面磚門柱＋石材、打開的鑄鐵門、矮牆、校名石牌、門房在校內）；校外（本地 +z）朝西。開口寬度和舊版相同
    const gate=CK.gate(); placeGate(E,g,nav,gate,-124,0,-Math.PI/2);
    // 圍牆（校門兩側）
    { const wb=new TK.Bin(); const wt=campusWallMat(); for(const s of [-1,1]){ wb.add(wt,TK.boxG(1,1.8,70,1.0),-124,0.9,s*45); wb.add(TK.paint('#d9d3c6'),TK.boxG(1.2,0.14,70.2),-124,1.87,s*45); nav.blockRect(-124,s*45,1.2,70,0,0.3); } wb.build(g); }   /* 第二十批：原本 W3.brickTex 沒設重複次數，整面 70 m 的牆只有一張貼圖、拉成一條條暗紋；改成和北側圍牆同一個面磚材質＋牆頭石材（尺寸、導航不變）*/
    // ---- 椰林大道：大王椰子 ----
    for(let x=-110;x<=70;x+=7.5){ for(const s of [-1,1]){ palmIdx++; const p=TK.royalPalm((14.5+((x*7)%3)*0.8)*1.35,palmIdx,{crown:0.66});   /* v9.3 第十八批：照椰林大道照片拉高到約 20 m、樹冠相對變小 */ place(g,p,x,s*9.5,(x*0.3)%6.28); nav.blockCircle(x,s*9.5,0.5); } }
    // 兩側草地小徑與長椅、腳踏車
    for(let x0=-100;x0<=50;x0+=25){ for(const s of [-1,1]){ const x=(x0===25&&s<0)?17:x0;   /* 南側 x=25 那張貼著小椰林道的椰子樹（24.2,-14，樹幹在椅背後 1.3 m）：移到 x=17（使用者 2026-10-16：這張椅子位子有夠奇怪）*/ const b=BENCH(); place(g,b,x,s*13,s>0?Math.PI:0); nav.blockRect(x,s*13,1.4,0.7,0); seats.push({x,z:s*13+(s>0?-0.06:0.06),yaw:s>0?Math.PI:0,label:'坐在椰林大道的長椅上'}); } }
    for(let x=-90;x<=40;x+=32){ const r=parkedRack(7); place(g,r,x+8,-16,0); nav.blockRect(x+8,-16,5,1.4,0); }
    for(let x=-105;x<=55;x+=22){ for(const s of [-1,1]) for(const lx of (s>0&&x===-39)?[-46.25,-31.25]:[x]){ const l=W3.lampPost(); place(g,l,lx,s*11,s>0?Math.PI:0); l.userData.roadPool=true; lamps.push(l); nav.blockCircle(lx,s*11,0.5); } }   /* 傅鐘那一側：原本 (-39, 11) 那一盞正好擋在鐘亭正前方（巡場景 P3）——改成鐘亭兩側各一盞（都在兩棵椰子中間、鐘亭前廣場的範圍裡，那一段本來就不放植栽）*/   /* 燈臂朝大道（2026-10-21 LAWWW2：原本背對大道，晚上 12 m 寬的路面完全照不到、整條是黑的——經濟系、法律系晚上都走這條；燈頭位置照 W3.lampPost 的約定，只是轉向）*/
    // ---- 傅鐘（大道南側小廣場，行政大樓正前方）----
    const plaza=ground(g,28,12,W3.stoneTex('#e3d9c6'),[7,3],-38,17,0.015); const bell=CK.bell(); place(g,bell,-38,16.5,Math.PI); placeBlocks(nav,bell,-38,16.5,Math.PI);   /* v9.3 第十六批：校園套件的鐘亭，石碑朝北對著大道 */
    const bellGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_bell']; bell.userData.ckTag='bell'; if(bellGLB) bell.userData.dyn=true;   /* 傅鐘的 Blender 正式模型（第二個 AI：campus_bell.py → bldg.campus_bell）：和總圖同一套接法；導航阻擋照舊是套件的（placeBlocks） */ for(const [x,z] of [[-51,21.5],[-25,21.5]]){ const b=TREE(1.3); place(g,b,x,z,0); nav.blockCircle(x,z,0.9); }
    for(const x of [-46,-30]){ const b=BENCH(); place(g,b,x,21,Math.PI); nav.blockRect(x,21,1.4,0.7,0); seats.push({x,z:21-0.06,yaw:Math.PI,label:'坐在傅鐘旁的長椅'}); }
    // ---- 行政大樓（大道南側、傅鐘後面）：大圓柱、對稱，正面朝北對著椰林大道 ----
    // v9.3：台大日治時期建築語彙（src/campuskit3d.js）：面磚、一樓拱廊、拱窗、石材腰帶與簷口、寄棟屋頂、中央門廊（佔地不變；門廊的柱墩與側牆另外加碰撞）
    const admin=CK.hall({w:46,d:16,floors:3,gfh:4.2,fh:3.4,wall:'#cdb48e',trim:'#e8e0cf',roof:'#4a3a33',roofH:4.2,arcade:true,porch:{bays:3,depth:3.0,pediment:false},sign:'行政大樓'}); ckPlace(admin,-38,33,Math.PI); buildings.push(admin);
    /* 共同教學館（使用者 2026-10-13：普通、共同、博雅三棟公共教學館；docs/campus/TEACHING_BUILDINGS_PLAN.md）：真實位置在行政大樓東邊（中間隔木造走廊）、南臨舟山路——
       正好是第十八批補的「大道南側、行政大樓東邊」那棟無名系館的位置，換成有名字的建築，位置與大小不變（舊存檔、導航不受影響）。
       外觀是校園套件的方盒（BLOCKOUT），等 LAWWW2 的 Blender 正式模型；正門在北面中間，門口的互動點在 classes3d.js 的 DOORS.common */
    const gongtong=CK.hall({w:24,d:14,floors:3,gfh:4.2,fh:3.6,wall:'#9b5a42',trim:'#d8cfbd',roof:'#43342e',roofH:3.6,arcade:true,porch:{bays:1,depth:2.4,pediment:true,pedH:1.4},sign:'共同教學館'});
    /* 共同教學館的 Blender 正式模型（LAWWW2 55fbedb：campus_gongtong.py → bldg.campus_gongtong；VISUAL_REVIEW 第 20.5 節）：本體、拱廊柱、門廊和套件一樣（導航、DOORS.common 不變）；
       有模型時：鏡頭碰撞照模型（西側木造走廊的屋頂、西翼上方）、大道南側大樹牆在共同前面的 4 棵換成模型裡的 6 棵蒲葵（樹幹的導航阻擋在模型載入後才加：載入失敗不會留下看不見的樹幹）*/
    const gtGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_gongtong']; if(gtGLB) gongtong.userData.ck.cols=[[0,-1.3,24,11.4,0,7.8],[0,5.7,24,2.6,3.85,7.8],[-3.43,1.75,17.14,10.5,7.8,11.4],[-3.43,3.5,17.14,7,11.4,15.0],[8.57,0,6.86,14,7.8,10.0],[14.5,0,5,2.0,2.8,4.1]];
    ckPlace(gongtong,2,33,Math.PI); buildings.push(gongtong); gongtong.userData.ckTag='gongtong'; if(gtGLB) gongtong.userData.dyn=true;
    const GT_PALMS=[[-10.5,19.2],[-6.5,18.8],[-2.5,19.1],[6.5,19.0],[10.5,18.9],[14.5,19.2]];
    /* 大一女舍（使用者 2026-10-13：四棟跨學年公共場景之一；查證見 docs/campus/TEACHING_BUILDINGS_PLAN.md 3b）：學務處官方簡介——在校園內、鄰近公館捷運站 2、3 號出口，
       A、B 兩棟、各 5 層；學生整理的住宿資料：兩棟 2 樓有天橋、傳達室在 A 棟、B 棟靠舟山路、B 棟大門刷學生證。不是女一舍、不是水源 BOT。
       校園西南角、舟山路西段南側（靠校門與公館那一側），取代第二十批的無名系館 (-92,66)。外觀是校園套件（BLOCKOUT），等 LAWWW2 的模型；
       主角是男生：大門「男賓止步」，可以在門口的長椅等人，不能進去（第一階段沒有室內）*/
    { const FD={w:24,d:12,floors:5,gfh:3.6,fh:3.1,wall:'#d9cfc2',trim:'#efe9dd',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4}};
      const fdA=CK.hall(Object.assign({},FD,{sign:'大一女舍 A'})); ckPlace(fdA,-108,68,Math.PI); buildings.push(fdA);
      const fdB=CK.hall(Object.assign({},FD,{sign:'大一女舍 B'})); ckPlace(fdB,-78,66,Math.PI); buildings.push(fdB);
      // 2 樓天橋：A 棟東牆 (x=-96) 到 B 棟西牆 (x=-90)；下面可以走（不擋導航），鏡頭碰撞照建築
      const br=new THREE.Group(); const bw=6.2, by0=3.7, bh=2.7;
      const deck=new THREE.Mesh(new THREE.BoxGeometry(bw,0.3,3.2),M('#cfc6b8')); deck.position.set(0,by0,0); br.add(deck);
      const roofB=new THREE.Mesh(new THREE.BoxGeometry(bw,0.25,3.4),M('#bdb3a4')); roofB.position.set(0,by0+bh,0); br.add(roofB);
      for(const sz of [-1.5,1.5]){ const wall=new THREE.Mesh(new THREE.BoxGeometry(bw,0.9,0.12),M('#d9cfc2')); wall.position.set(0,by0+0.6,sz); br.add(wall);
        const gl=new THREE.Mesh(new THREE.BoxGeometry(bw,bh-1.2,0.05),new THREE.MeshStandardMaterial({color:'#9fb4c2',roughness:0.15,metalness:0.2,transparent:true,opacity:0.55})); gl.position.set(0,by0+0.95+(bh-1.2)/2,sz); br.add(gl); }
      br.position.set(-93,0,67); g.add(br);
      const fdGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_freshman']; for(const o of [fdA,fdB,br]){ o.userData.ckTag='freshman'; if(fdGLB) o.userData.dyn=true; }   /* 大一女舍的 Blender 正式模型（LAWWW2 55fbedb，第 21.5 節）：A、B、天橋一起換；導航、門口、長椅、車架不變 */
      const bc=new THREE.Mesh(new THREE.BoxGeometry(bw,bh+0.3,3.4),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); bc.position.set(-93,by0+bh/2,67); g.add(bc); E.colliders.push(bc);
      // 門口：等人用的長椅（面向兩棟的大門）、B 棟門口的腳踏車架
      { const b=BENCH(); place(g,b,-93,54.2,0); nav.blockRect(-93,54.2,1.4,0.7,0); seats.push({x:-93,z:54.26,yaw:0,label:'坐在大一女舍門口的長椅（等人）'});
        { const l=W3.lampPost(); place(g,l,-91.2,53.5,-Math.PI/2); lamps.push(l); nav.blockCircle(-91.2,53.5,0.5); } }   /* 長椅旁的路燈（燈臂朝西照長椅）：晚上 C13 在這裡等人，原本附近沒有燈（LAWWW2 10-14 回報）*/
      { const r=parkedRack(7); place(g,r,-66,55.4,0); nav.blockRect(-66,55.4,5,1.4,0); }
      E.interactables.push({x:-108,z:59.2,radius:1.6,lv:0,label:'大一女舍 A 棟（傳達室）',mark:true,look:'大一女舍 A 棟。傳達室在這一棟。女生宿舍，男賓止步——要找人，可以在門口的長椅等。'});
      E.interactables.push({x:-78,z:57.2,radius:1.6,lv:0,label:'大一女舍 B 棟',mark:true,look:'大一女舍 B 棟。大門要刷住宿生的學生證。女生宿舍，男賓止步。'}); }
    const admGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_admin']; admin.userData.ckTag='admin'; if(admGLB) admin.userData.dyn=true;   /* 行政大樓的 Blender 正式模型（第二個 AI：campus_hall.py --set admin → bldg.campus_admin）：和總圖同一套接法；導航、鏡頭碰撞、門口照舊是套件的（ckPlace） */
    // ---- 文學院（大道北側，正對行政大樓）：仿羅馬式拱窗 ----
    const arts=CK.hall({w:40,d:18,floors:2,gfh:4.8,fh:4.4,wall:'#9b5a42',trim:'#d8cfbd',roof:'#43342e',roofH:4.8,arcade:true,porch:{bays:3,depth:3.0,pediment:true,pedH:1.8},sign:'文學院'}); ckPlace(arts,-38,-34,0); buildings.push(arts); strip(g,-38,-8,-38,-24,4,W3.pathTex(),4);
    const artsGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_arts']; arts.userData.ckTag='arts'; if(artsGLB) arts.userData.dyn=true;   /* 文學院的 Blender 正式模型（第二個 AI：campus_hall.py --set arts → bldg.campus_arts）：和總圖同一套接法；導航、鏡頭碰撞、門口照舊是套件的（ckPlace） */
    /* ---- 普通教學館、博雅教學館（方案 A，D55；查證：docs/campus/TEACHING_BUILDINGS_PLAN.md 第 1 節）：椰林大道 → 文學院 → 普通 →（二樓空橋）→ 博雅 → 醉月湖。
       外觀是校園套件（BLOCKOUT），等 LAWWW2 的 Blender 正式模型；正門都在南面中間（和室內 src/data/putong_layout.js、boya_layout.js 的入口同一側），
       門口的互動點在 classes3d.js 的 DOORS.putong、DOORS.boya；二樓空橋之後再開（普通二樓的空橋門現在是關著的）---- */
    const putongB=CK.hall({w:34,d:16,floors:5,gfh:4.0,fh:3.6,wall:'#c9b596',trim:'#e8e0cf',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4},sign:'普通教學館'}); ckPlace(putongB,-38,-58.5,0); buildings.push(putongB); const ptGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_putong']; putongB.userData.ckTag='putong'; if(ptGLB) putongB.userData.dyn=true;
    const boyaB=CK.modern({w:34,d:18,floors:5,gfh:4.6,fh:3.85,wall:'#d9d5cb',slab:'#bfc2bb',sign:'博雅教學館'}); ckPlace(boyaB,-38,-83,0); buildings.push(boyaB); const byGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_boya']; boyaB.userData.ckTag='boya'; if(byGLB) boyaB.userData.dyn=true;   /* 普通、博雅的 Blender 正式外觀（LAWWW2-C campus_teach.py，ART-EXT-TEACH）：五層照真的樓層數（套件原本四層，一起改）；普通一樓 4.0 m＝空橋外觀的 Y0、博雅一樓 4.6 m＝空橋往北升 0.6 m 的那一端；導航、門口照舊 */
    { const bf=new THREE.Group(); bf.name='skybridge_fallback'; g.add(bf); const Y0=4.0;   /* 二樓空橋的外觀：正式模型 LAWWW2-B skybridge.glb（和普通教學館室內的空橋同一個；原點＝普通北牆門口的地板），Y0＝普通外觀的二樓 4.0（室內是 4.2→4.8；外觀的 0.2 m 差看不出來）；室內走得過去（src/teach3d.js 的 buildBridge）*/
      const br=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.45,7.5),M('#b9b5ab')); br.position.set(-41.2,Y0-0.23,-70.25); bf.add(br); for(const s of [-1,1]){ const gl=new THREE.Mesh(new THREE.BoxGeometry(0.08,2.6,7.5),M('#8fa9b5')); gl.position.set(-41.2+s*1.56,Y0+2.2,-70.25); bf.add(gl); } const rf=new THREE.Mesh(new THREE.BoxGeometry(3.4,0.2,7.7),M('#9c9a93')); rf.position.set(-41.2,Y0+3.55,-70.25); bf.add(rf);
      if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.skybridge']) ASSETS.loadOne('bldg.skybridge').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const sc=c.scene.clone(true); sc.position.set(-41.2,Y0,-66.5); sc.userData.dyn=true; g.add(sc); bf.visible=false; }).catch(e=>console.warn('空橋外觀正式模型載入失敗，用備用模型',e)); }
    // ---- 農業陳列館（洞洞館）北側近校門 ----
    // 農業陳列館（洞洞館）：上層四面是圓洞鏤空牆、一樓玻璃＋方柱、平屋頂寬屋簷（CK.pavilion；佔地和舊版相同）
    const hole=CK.pavilion({w:22,d:14,gfh:4.0,h:9,sign:'農業陳列館'}); ckPlace(hole,-104,-30,0); buildings.push(hole);
    const pavGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_pavilion']; hole.userData.ckTag='pavilion'; if(pavGLB) hole.userData.dyn=true;   /* 洞洞館的 Blender 正式模型（第二個 AI：campus_pavilion.py → bldg.campus_pavilion）：和總圖同一套接法；導航、鏡頭碰撞照舊是套件的（ckPlace） */
    // ---- 校史館（舊總圖）：大道北側、靠近大門（農業陳列館東邊），紅磚拱窗、圓石柱、屋瓦 ----
    const hist=CK.hall({w:24,d:16,floors:2,gfh:5.0,fh:4.6,wall:'#a25d43',trim:'#d8cfbd',roof:'#43342e',roofH:4.4,arcade:true,porch:{bays:3,depth:2.6,pediment:true,pedH:1.6},sign:'校史館'}); ckPlace(hist,-77,-29,0); buildings.push(hist);
    const histGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_hist']; hist.userData.ckTag='hist'; if(histGLB) hist.userData.dyn=true;   /* 校史館的 Blender 正式模型（第二個 AI：campus_hall.py --set hist → bldg.campus_hist）：同上 */
    // ---- 總圖書館（椰林大道東端盡頭，正面朝西對著大道）----
    const lib=CK.hall({w:60,d:26,floors:4,gfh:5.0,fh:4.3,wall:'#9e5a44',trim:'#dcd3c2',roof:'#4a3a33',roofH:4.0,arcade:true,arcDepth:3.0,porch:{bays:5,depth:4.2,pediment:true,pedH:3.0,h:9.0,ys:5.6},tower:{w:9,h:9},sign:'總圖書館'}); ckPlace(lib,100,0,-Math.PI/2); buildings.push(lib);
    /* 總圖的 Blender 正式模型（第二個 AI：tools/blender/env_second/campus_library.py → bldg.campus_library）：有模型時套件的總圖不參加整區靜態合併，載入後藏起套件外觀；
       ?nobldg 或載入失敗時照舊是套件。導航阻擋、鏡頭碰撞、門口互動點都還是套件的（ckPlace） */
    const libGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_library']; lib.userData.ckTag='library'; if(libGLB) lib.userData.dyn=true;
    // ---- 小椰林道（x=30，從椰林大道往北通到法學院）：兩排較矮的大王椰子 ----
    for(let z=-14;z>=-70;z-=8){ for(const x of [24.2,35.8]){ if(x>30&&z>-66&&z<-54) continue; const p=PALM(7+((-z*3)%2)); place(g,p,x,z,(-z*0.7)%6.28); nav.blockCircle(x,z,0.45); } }
    // ---- 醉月湖（文學院北邊）----
    const lakeU=lake(g,nav,-36,-112,seats,lamps);   /* 方案 A：原本 (-30,-66)，整組往北搬（湖面、湖岸、湖心亭、木棧道、長椅、路燈、樹叢一起，形狀不變）*/
    const courtGLB=bballCourt(E,g,nav,lamps);   /* 系籃球場（LAWWW2 9428f9f，位置 A 醉月湖東側；2026-10-14）：場地、碰撞、路燈現在放；正式模型等 zone 建好再載（courtGLB(zone)）*/
    ground(g,124,44,W3.grassTex(),[31,11],-70,-106,-0.003);   // 湖北邊的地面（方案 A 之前那裡走不到、種了一排樹遮住地面盡頭；湖搬過來之後樹會長在博雅裡面、小路上，2026-10-13 審查拿掉）
    { const hb=new TK.Bin(); for(let x=-61.5;x<=4.5;x+=1.15) TK.plantClump(hb,x,0,-124.35+((x*7)%2)*0.08,0.9+Math.abs((x*13)%3)*0.06,5,[0.7,0.9,0.66]); hb.build(g); }   /* 方案 A 打開的西北角：北邊界 z=-124 原本只是草地中間一道看不見的牆，種一排矮灌木收邊（導航照舊是 blockOutside）*/
    // ---- 法學院區（東北上方）：霖澤館 ＋ 萬才館 ＋ 社科院 ----
    ground(g,72,24,W3.stoneTex('#e6dccb'),[18,6],61,-94,0.012); strip(g,30,-70,30,-84,10,W3.pathTex(),4); strip(g,92.5,-64,92.5,-84,4,W3.pathTex(),4);   /* 第二十四批：萬才館的互動點改到陽台下面的一樓入口（x≈93.8），小路跟著移；4 m 寬，不碰到社科院前 x=96 的白柱 */
    // 法學院前庭：樹列、花圃、矮籬
    for(const x of [22,38,54,70,86]){ const b=TREE(1.15+((x/16)%2)*0.1); place(g,b,x,-80,x*0.4); nav.blockCircle(x,-80,0.9); }
    for(const x of [30,46,62,88]){ const pl=W3.planter(); place(g,pl,x,-83.5,0); nav.blockRect(x,-83.5,1.2,0.5,0); }   /* 第十九批：x=78 的花圃會擋在往萬才館的新小路上，移到 88 */
    for(const x of [12,100]){ const t=TREE(1.3); place(g,t,x,-96,0); nav.blockCircle(x,-96,0.9); const t2=TREE(1.0); place(g,t2,x+(x<50?-6:6),-108,1); nav.blockCircle(x+(x<50?-6:6),-108,0.8); }
    /* 霖澤館西段正面的大樟樹（CLOSED-SPACES-1023，LAWWW2-B 10-23；AA_399 1-1「她的位子在走廊最後一間、靠窗，窗戶對著一棵樹」：5F 碩士班研究室那扇窗前。
       LAWWW-B 10-23 16:02 選 A：種一棵真的樹，從廣場看也在）。樹高 19 m：樟樹的樹冠在 0.24H～0.96H、半徑約 0.38H，五樓的窗（17～18.5 m）看出去是樹冠上半部；
       離霖澤館正面（z −103）8.5 m，樹冠不碰牆；離霖澤館入口（x 34）、公告欄（16.6, −100.6）都遠。樹穴 2.4 m 見方＋矮緣石；導航只擋樹幹 */
    { const BX=24.5, BZ=-94.5; const t=TK.tree(19,4242,{sp:'camphor'}); t.name='linze_big_camphor'; place(g,t,BX,BZ,0.6); nav.blockCircle(BX,BZ,1.0);
      const pit=new THREE.Group(); pit.name='linze_big_camphor_pit'; const soil=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.2),new THREE.MeshStandardMaterial({color:0x3b332b,roughness:1})); soil.rotation.x=-Math.PI/2; soil.position.set(BX,0.014,BZ); soil.receiveShadow=true; pit.add(soil);
      const curbM=new THREE.MeshStandardMaterial({color:0xa8a49c,roughness:0.85}); for(const [dx,dz,w,d] of [[0,-1.15,2.4,0.12],[0,1.15,2.4,0.12],[-1.15,0,0.12,2.2],[1.15,0,0.12,2.2]]){ const c=new THREE.Mesh(new THREE.BoxGeometry(w,0.12,d),curbM); c.position.set(BX+dx,0.06,BZ+dz); c.castShadow=c.receiveShadow=true; pit.add(c); }
      g.add(pit); }
    /* 第十九批拿掉兩段矮籬 (48,-106.5)、(74,-106.5)：大半埋在霖澤館、萬才館的牆裡 */
    // 霖澤館、萬才館（v9.3 第十九批，照使用者提供的照片重做，CK.lawhall）：灰色花崗石下三層＋紅磚方格上層＋寬花崗石轉角＋薄屋頂板。
    // 霖澤館：穿過整棟的三層樓高門廊（穿堂）、整排寬台階。佔地中心和舊版相同
    // 萬才館（第二十四批照使用者的新照片＋配置圖）：正面由西到東＝弧形兩層樓量體、大樓梯、樓梯頂端接弧形陽台（下面是一樓入口，互動點在這裡）、往前凸出的三層樓量體；
    //   紅磚段是偏橘的淺紅磚、每扇窗有凸出的混凝土窗框、屋頂上有鏤空的大框架。原本西側的方形低樓（推測）拿掉
    // v9.4（D38、使用者照片）：十層樓（四樓、七樓灰色帶窗層，十樓開放層＋大屋頂板）、穿堂前排中柱；正式外觀是 Blender 模型（ASSETS 'bldg.linze_exterior'），套件的外觀是備用
    const linze=CK.lawhall({w:40,d:18,floors:10,centerCol:true}); ckPlace(linze,34,-112,0); buildings.push(linze); linze.userData.dyn=true;   /* 不參加整個區域的靜態合併：正式模型載入後要能把套件的外觀藏起來 */
    const wancai=CK.lawhall({entry:'stairs',w:30,d:20,floors:9,entryX:-1,brick:'#b06a4a',winBox:true,roofFrame:true}); ckPlace(wancai,88,-112,0); buildings.push(wancai); wancai.userData.dyn=true;   /* 萬才館第二階段：正式外觀（Blender）載入後要能把套件的外觀藏起來，不參加整區靜態合併 */   /* 一樓入口（陽台下）：x=88+doorX≈93.8、z=-112+doorZ≈-100.75；弧形量體 x 70.5–83.5、z -102–-95.5；樓梯 x 約 83–91、z -98–-90.5 */
    // 社會科學院：現代白色系館（白色粉光牆、每層橫向長窗、一樓玻璃大廳＋薄雨遮）；佔地和舊版相同，門前的白色樹狀柱保留
    /* 新社科院（ART-01，D56 社科院第②步；LAWWW2 的 campus_socsci.glb）：辜先生紀念圖書館＋8 層清水混凝土大樓＋中庭。
       X75（使用者 2026-10-20：「社科院位置其實不是在法律系出去左手邊 應該是朝西南 你實際查社科院位置」；真實的社科院在霖澤館西側、靠辛亥路）：
       從萬才館東南（x 95–125、z −92～−42）搬到霖澤館西南、小椰林道西邊（x −13～17、z −93～−43），整組轉 180°——大樓在北（z −93～−77，正門在東面、朝小椰林道）、
       中庭在中間（z −77～−65，朝小椰林道打開）、圖書館在南（z −65～−43，玻璃牆朝東、朝南，入口在北牆、面向中庭），和真實一樣是大樓靠北、圖書館在南。
       導航、鏡頭碰撞、門照 src/data/socsci_layout.js（tools/gen_socsci_layout.py 從 GLB 旁邊的 campus_socsci.json 產生，搬家的換算也在那裡）；中庭、大樓一樓東面與南面的柱廊走得到；大樓室內還沒做（門不開）。
       正式模型載入前／失敗時的備用：同樣大小的簡單量體（D38 分類 ③）。舊的白色系館（CK.modern 56×22）和門前 7 根白色圓柱不再用（圓柱在新圖書館裡面）*/
    const SOCX=typeof SOCSCI_LAYOUT!=='undefined'&&typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.campus_socsci']?SOCSCI_LAYOUT:null;
    let socGLB=false;
    if(SOCX){ socGLB=true; const sg=new THREE.Group(); sg.userData.ckTag='soc'; sg.userData.dyn=true; g.add(sg);
      const fb=(x0,y0,z0,x1,y1,z1,col)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),M(col,{rough:0.85})); m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2); m.castShadow=m.receiveShadow=true; sg.add(m); };
      SOCX.cams.forEach(([x0,y0,z0,x1,y1,z1],i)=>fb(x0,y0,z0,x1,y1,z1,['#dfe6e8','#b9b5ad','#9fa8ab'][i]||'#b9b5ad'));   /* 圖書館（玻璃盒）、大樓懸挑以上、一樓大廳（往內退的玻璃）：和鏡頭碰撞同一組盒子（X75 搬家以後的位置）*/
      for(const [x,z,w,d] of SOCX.rects){ nav.blockRect(x,z,w,d,0,0.15); if(w<=1&&d<=1) fb(x-w/2,0,z-d/2,x+w/2,4.5,z+d/2,'#b9b5ad'); }   /* 柱廊的柱子在備用量體裡也立起來 */
      for(const [x,z,r] of SOCX.circles) nav.blockCircle(x,z,r);
      for(const [x0,y0,z0,x1,y1,z1] of SOCX.cams){ const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2); g.add(m); E.colliders.push(m); }
      for(const [x,z,w,d,yaw] of SOCX.benches){ const y=yaw||0; seats.push({x:+(x+0.06*Math.sin(y)).toFixed(2),z:+(z+0.06*Math.cos(y)).toFixed(2),yaw:y,label:'坐在社科院中庭的長椅'}); }   /* 清水混凝土長椅：朝中庭坐（X75 以後 z −67.1 的兩張面向北、x −10.6 的兩張面向東；坐的位置往面向那一邊 6 cm）*/
      /* 社科院原本的位置（萬才館東南、總圖北邊）：X75 搬走以後放一棟沒有名字的系館（白色現代系館的套件，不掛名字；正面朝西、門對著 z=-60 那條路）*/
      { const hall=CK.modern({w:44,d:20,floors:4,gfh:4.4,fh:3.85}); ckPlace(hall,112,-62,-Math.PI/2); buildings.push(hall); }
    } else {   /* 舊外觀（manifest 沒有新模型時）*/
      const soc=CK.modern({w:56,d:22,floors:4,gfh:4.4,fh:3.85,sign:'社會科學院'}); ckPlace(soc,110,-70,-Math.PI/2); buildings.push(soc);
      socGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_modern']; soc.userData.ckTag='soc'; if(socGLB) soc.userData.dyn=true;
      for(let i=0;i<7;i++){ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.35,7,10),M('#f4f1ea')); col.position.set(96,3.5,-90+i*6); g.add(col); const cap=new THREE.Mesh(new THREE.CylinderGeometry(1.6,0.6,0.8,10),M('#f4f1ea')); cap.position.set(96,7.2,-90+i*6); g.add(cap); nav.blockCircle(96,-90+i*6,0.5); } }
    // 法學院廣場：長椅、腳踏車、樹、公告欄、販賣機
    for(const x of [40,70]){ const b=BENCH(); place(g,b,x,-88,0); nav.blockRect(x,-88,1.4,0.7,0); seats.push({x,z:-87.94,yaw:0,label:'坐在霖澤館前的長椅'}); }
    
    { const r=parkedRack(9); place(g,r,58,-102,0); nav.blockRect(58,-102,6,1.4,0); const r2=parkedRack(6); place(g,r2,10,-100,0); nav.blockRect(10,-100,4,1.4,0); }
    { const bb=W3.bulletin(); place(g,bb,16.6,-100.6,0); nav.blockRect(16.6,-100.6,2.6,0.4,0); /* v9.3 第十九批：原本掛在霖澤館一樓拱廊的內牆上；新的霖澤館沒有拱廊、正面整排是台階，移到台階西端外面的鋪面上 */ const v=W3.vending(); place(g,v,13.5,-107.5,-Math.PI/2); nav.blockRect(13.5,-107.5,0.9,1.2,0); /* 靠霖澤館西側牆（舊位置一半埋在建築轉角裡）*/ }
    for(const [x,z] of [[30,-86],[62,-86],[97.2,-96.5],[51,-100.5],[69,-98.5]]){ /* 後兩盞原本在 (46,-108)、(76,-108)：埋在霖澤館、萬才館的牆裡，第十九批移到門前；(94,-86) 第二十四批移到萬才館一樓入口東側 (97.2,-96.5)：原本擋在往入口的路線中間（照亮入口）*/ const l=W3.lampPost(); place(g,l,x,z,Math.PI/2); lamps.push(l); nav.blockCircle(x,z,0.5); }
    for(const [x,z] of [...(SOCX?[]:[[8,-70],[8,-50],[0,-56]]),[52,-50],[-54,-19],[-5,-16],[40,-20],[-95,-12],[-62,-56],[-96,24],[-82,31],[-68,24],[78,-38],[64,-44]]){   /* 第十八批拿掉：(8,-30)、(20,-20)、(52,-30)、(66,-28)（新系館的位置）、(-10,18)、(10,18)、(50,18)（換成大道南側的大樹牆）；X75：(8,-70)、(8,-50)、(0,-56) 在社科院的新位置裡面 */ const b=TREE(1+((x+z)%3)*0.2); place(g,b,x,z,(x+z)*0.3); nav.blockCircle(x,z,0.8); }
    // 花圃
    for(const x of [-64,-48]){ const p=W3.planter(); place(g,p,x,-13,0); nav.blockRect(x,-13,1.2,0.5,0); }
    /* 社團博覽會（AA_110 6-8 (b)；activities.js 的 club_expo_y1s1：新局 9/6、舊局 9/30、10/1，CLUBFAIR-REAL-1027）那幾天：LAWWW2 479b7fc 的九頂帳篷（clubFair），原本的招生攤位、公告欄收起來 */
    const fairDay=isFairDay();
    // 社團招生攤位（傅鐘廣場東側，面向椰林大道）：摺疊桌、布條、傳單
    if(!fairDay){ const SX=-18, SZ=14.5; const st=new THREE.Group(); const tb=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.05,0.7),M('#e8e2d6')); tb.position.set(0,0.74,0); st.add(tb); for(const [sx,sz] of [[-0.8,-0.25],[0.8,-0.25],[-0.8,0.25],[0.8,0.25]]){ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.72,0.04),M('#3a3f46')); leg.position.set(sx,0.36,sz); st.add(leg); } const cloth=new THREE.Mesh(new THREE.BoxGeometry(1.85,0.6,0.02),M('#2f5d50')); cloth.position.set(0,0.42,0.36); st.add(cloth); const banner=W3.signPlane('法律服務社 招生中 ・ 免費法律諮詢',1.8,0.5,{color:'#ffffff',size:40}); banner.position.set(0,0.42,0.38); st.add(banner); const fly=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.02,0.42),M('#ffffff')); fly.position.set(-0.4,0.78,0); st.add(fly); st.position.set(SX,0,SZ); st.rotation.y=Math.PI; g.add(st); nav.blockRect(SX,SZ,1.9,0.8,0,0.1); E.interactables.push({x:SX,z:SZ-1,radius:1.5,label:'看法律服務社的招生攤位',notice:'lawclub'}); }
    // 社團博覽會的公告欄（AA_110 6-8 (b)，AA 暫定：用現有的公告欄，不另做攤位）：平常是一塊公告欄；9/30、10/1 11:00–17:00 前面是「社團博覽會」的集合點
    // （activities.js 的 club_expo_y1s1，spot (-13.5,13.6)；classes3d.js 的 fairMenu）。LAWWW2 的攤位做好以後原地換掉，位置不變
    if(!fairDay){ const bb=W3.bulletin(); place(g,bb,-13.5,14.6,Math.PI); nav.blockRect(-13.5,14.6,2.6,0.4,0); }
    const fairGLB=fairDay?(isExpoDay()&&typeof CLUB_FAIR_EXPO!=='undefined'?clubFairExpo(E,g,nav):clubFair(E,g,nav)):null;   /* 博覽會的帳篷：位置、碰撞現在放；正式模型等 zone 建好再載。社博那天（大一、大二）＝椰林大道兩邊 36 頂＋舞台（clubFairExpo）；校慶、經濟系那一年＝九頂那一排 */
    // 路旁散置腳踏車
    for(const [x,z] of [[-60,-15.5],[-57,15.5],[0,-15.5],[24,-64],[36,-64]]){ const b=parkedBike(['#3a6fb0','#8c3b47','#2f5d50','#e0b95b'][(x+z)&3],x*7+z,null,1.7); place(g,b,x,z,Math.PI/2); nav.blockRect(x,z,1.7,0.6,0); }   /* v9.3 第十八批：車子沿 x 方向停，導航原本擋成沿 z 方向（走得過車頭車尾、旁邊空地反而不能走）*/
    // ---- v9.3 第十八批：校園加密 ----
    // 真實的椰林大道兩側幾乎整排都是系館（離大道 20–30 m、前面是草地）；原本這裡大道東半段兩側、行政大樓東邊、男一舍兩側都是空草地。
    // 補上沒有掛名字的系館（不冒用真實系館的名字和位置），同一套校園套件語彙：紅磚／面磚、一樓拱廊、拱窗或方窗
    { const fill=[
        [CK.hall({w:26,d:14,floors:3,gfh:4.4,fh:3.8,wall:'#c8a27c',trim:'#e6dfd0',roof:'#4a3a33',roofH:3.8,arcade:true,porch:{bays:1,depth:2.4,pediment:false}}),7,-28,0],          // 大道北側、文學院東邊
        [CK.hall({w:28,d:16,floors:4,gfh:4.4,fh:3.6,wall:'#a35c48',trim:'#ddd5c6',roofType:'flat',win:'rect',arcade:true,porch:{bays:3,depth:2.6,style:'flat'}}),57,-34,0],   // 大道北側、小椰林道東邊
        [CK.hall({w:34,d:14,floors:4,gfh:4.2,fh:3.5,wall:'#d2c3a5',trim:'#ebe4d6',roofType:'flat',win:'rect',arcade:true,porch:{bays:3,depth:2.6,style:'flat'}}),45,33,Math.PI],   // 大道南側、往宿舍的路東邊
        [CK.hall({w:30,d:13,floors:5,gfh:3.6,fh:3.1,wall:'#bfb5a3',trim:'#e4ddd0',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4}}),-34,68,Math.PI],   // 舟山路南側、宿舍區
        [CK.hall({w:30,d:13,floors:5,gfh:3.6,fh:3.1,wall:'#c9b49a',trim:'#e8e2d6',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4}}),74,68,Math.PI],
];   // 第二十批的「舟山路西段南側」(-92,66) 2026-10-13 換成大一女舍（見行政大樓後面的大一女舍那一段）
      for(const [b,x,z,ry] of fill){ ckPlace(b,x,z,ry); buildings.push(b); }
      // 系館前的樹列、大道外側的樹、宿舍區與校園邊緣的樹帶（擋住草地直接接到遠景的盡頭）
      const rows=[
        [-104,36],[-90,41],[-76,38],[-100,16],[-112,26],[74,-12],[78,14],[68,26],
        [-60,58],[-12,60],[54,58],[93,60],[104,66]];
      for(let x=-116;x<=116;x+=11){ if(x>-52&&x<-16) continue; if(x>-4&&x<44) continue; if(x>56&&x<92) continue; rows.push([x,80]); }
      for(let z=-30;z<=40;z+=10){ rows.push([121,z+((z*7)%3)]); }   /* 總圖東邊；社科院在 z<-42 */
      for(const [x,z] of rows){ const t=TREE(1+((Math.abs(x*3+z))%4)*0.12); place(g,t,x,z,(x+z)*0.37); nav.blockCircle(x,z,0.8); }
      // 大道兩側的大樹牆：椰子樹列後面（z=±17.5），約 6 m 一棵、高 11–13 m（樹冠相連）；路口、門口、停車架、傅鐘廣場、社團攤位留空。整排合成一個網格（一側 2 個 draw call）
      // 第二十三批（照片：椰子樹後面是一整片連在一起的深綠樹冠，幾乎看不到後面的系館）：樹冠加寬、葉色調深（AVE_TREE）；樹幹位置不動，地面的路口、車架、系館門口照樣看得到、走得到
      for(const side of [-1,1]){ const skip=side<0?[[-116,-111],[-84,-70],[-85,-79],[-53,-47],[-46,-30],[-21,-15],[-15,-9],[-7,2],[2,12],[11,17],[23,37],[37,43],[43,50.5],[50,64]]:[[-116,-111],[-53,-23],[-22,-14],gtGLB?[-12,16]:[-2,6],[16,24],[39,51]];   /* 共同教學館有正式模型時，前面的 4 棵換成模型裡的蒲葵 */
        const rowG=new THREE.Group(); let k=0; for(let x=-108;x<=66;x+=6){ const jx=x+((x*13)%5)*0.35; if(skip.some(([a,b])=>jx>a&&jx<b)) continue; k++; const t=TK.tree(6.4*(1.75+((k*7)%4)*0.1),k+(side>0?50:0),AVE_TREE); t.position.set(jx,0,side*(17.5+((k*5)%3)*0.5)); t.rotation.y=k*1.3; rowG.add(t); nav.blockCircle(t.position.x,t.position.z,0.8); }
        g.add(W3.mergeGroup(rowG)); }   /* 北側 [43,50.5]：(49.4,-17.8) 那棵和停車架 (46,-16) 東端之間會留一道比人窄的縫（nav_islands 的孤島，第二十批拿掉）*/
      // 系館門口的腳踏車架（台大的系館前面一定停滿腳踏車）
      for(const [x,z,ry] of [[-6,24,0],[12,24,0],[33,24,0],[57,24,0],[-1,-17.2,Math.PI],[46,-23.5,Math.PI],[68,-23.5,Math.PI]]){ const r=parkedRack(7); place(g,r,x,z,ry); nav.blockRect(x,z,4.6,1.6,0); } }
    // ---- v9.3 第二十批：校園邊界外的背景（走不到，只有畫面；不加導航）----
    // 原本地面在 x=±130、z=-128／+85 就結束：轉鏡頭會看到地面盡頭直接接天空，校門外只有一小塊草地。
    // 西（校門外）：照公館區域的實際配置換算座標（公館 (gx,gz) → 校園 (x=-170-gz, z=gx)）——北側人行道、羅斯福路車道線、南側人行道、
    //   對面整排騎樓街屋（寬度、樓層數和公館區域那一排相同）、捷運出口、路燈、行道樹、機車；後面第二排較高的大樓。
    // 北（法學院後面）：中庭與樹、一棟沒有名字的系館（從霖澤館的穿堂看得到）、校園圍牆、馬路、對面兩排公寓。
    // 東（總圖、社科院後面）：樹帶、遠景系館、再遠一排城市大樓；南（宿舍後面）：校內道路、遠景宿舍、城市大樓。系館都不掛名字（不冒用真實建築）。
    { const far=new THREE.Group(); far.name='campusBackdrop';
      const H=(a,b)=>{ const v=Math.sin(a*12.9898+b*78.233)*43758.5453; return v-Math.floor(v); };
      const WALLC=['#d9cbb0','#cfc5b2','#e3ddd0','#c8bca8','#d6c3a5','#e6dfd0','#bfb2a0'], HALLC=['#b9876a','#a86a52','#c8a27c','#9b5a42','#c2a78a'];
      const TALLC=['#a9a49a','#b9b4aa','#9fa3a6','#b5a48f','#c4bcae','#8f8b84','#a8968a'];   // 後排大樓：灰、磚色、水泥色（全部米色的話，遠一點起霧就變成一片白盒子）
      // 地面：城市（柏油）打底，校園延伸的部分鋪草地
      { /* PERF-PATROL-ECON-1025（LAWWW2-B 2026-10-25，LAWWW-B 同意 ⑤）：城市的柏油只鋪在校園、外圍草地沒蓋到的地方——原本整片 820 m 見方墊在整個校園底下（同一個地方畫兩層）。COVER＝蓋在上面的整片地面（校園 260×170、北側兩片、北邊中庭、東、南；和這裡、上面的 ground() 一致）：改那幾片草地時一起改。把 820 m 照 COVER 的邊切成格子，沒被蓋住的格子一排一排併成長條。測試：node tests/campus_backdrop_ground_unit.js */
        const COVER=[[-130,130,-85,85],[-8,112,-128,-84],[-132,-8,-128,-84],[-132,130,-141,-127],[130,320,-270,250],[-132,130,85,235]], X0=-410, X1=410, Z0=-430, Z1=390;
        const xs=[...new Set([X0,X1,...COVER.flatMap(c=>[c[0],c[1]])])].sort((a,b)=>a-b), zs=[...new Set([Z0,Z1,...COVER.flatMap(c=>[c[2],c[3]])])].sort((a,b)=>a-b), pos=[], uv=[];
        const quad=(a,b,c,d)=>{ pos.push(a,0,c, a,0,d, b,0,d, a,0,c, b,0,d, b,0,c); uv.push(a/5,-c/5, a/5,-d/5, b/5,-d/5, a/5,-c/5, b/5,-d/5, b/5,-c/5); };   /* 朝上；貼圖一格 5 m（和原本 820 m／164 格一樣）*/
        for(let j=0;j+1<zs.length;j++){ const za=zs[j], zb=zs[j+1]; let run=null; for(let i=0;i+1<xs.length;i++){ const cx=(xs[i]+xs[i+1])/2, cz=(za+zb)/2, cov=COVER.some(c=>cx>c[0]&&cx<c[1]&&cz>c[2]&&cz<c[3]); if(!cov){ if(run===null) run=xs[i]; } else if(run!==null){ quad(run,xs[i],za,zb); run=null; } } if(run!==null) quad(run,X1,za,zb); }
        const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.computeVertexNormals();
        const t=W3.asphaltTex().clone(); t.needsUpdate=true; const m=new THREE.Mesh(geo,texMat(t)); m.position.y=-0.06; m.receiveShadow=true; far.add(m); }
      ground(far,190,520,W3.grassTex(),[47,130],225,-10,-0.035);   // 東：x 130–320
      ground(far,262,150,W3.grassTex(),[65,37],-1,160,-0.035);     // 南：z 85–235
      ground(far,262,14,W3.grassTex(),[65,3.5],-1,-134,-0.035);    // 北：法學院後面的中庭（z -141–-127）
      const stoneT=W3.stoneTex('#dcd5c8');
      ground(far,14.5,291,stoneT,[3.6,73],-131.75,4.5,0.012);      // 西：北側人行道（公館 gz -45–-31）
      ground(far,15,291,stoneT,[3.7,73],-181.5,4.5,0.012);        // 西：南側人行道＋騎樓前（公館 gz 4–19）
      ground(far,520,4,stoneT,[130,1],0,-143,0.012); ground(far,520,4,stoneT,[130,1],0,-169,0.012);   // 北：馬路兩側人行道
      strip(far,-130,93,200,93,8,W3.asphaltTex(),6);                // 南：校內道路
      // 車道線（一個合併網格）：西＝羅斯福路（公館區域同樣的四條）、北＝馬路（白虛線＋雙黃線）
      { const lt=W3.canvasTex('laneFull',8,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(255,255,255,0.85)'; x.fillRect(0,0,w,120); }).clone(); lt.needsUpdate=true; lt.repeat.set(1,74);   /* 公館區域的 lane 貼圖線寬只有 5 cm，遠看看不到：背景用整條寬的虛線 */
        const lm=new THREE.MeshStandardMaterial({map:lt,transparent:true,roughness:0.8}), yl=new THREE.MeshStandardMaterial({color:0xd9a521,roughness:0.8}); const lg=new THREE.Group();
        for(const lx of [-145,-151,-162,-168]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(0.15,295),lm); m.rotation.x=-Math.PI/2; m.position.set(lx,0.018,2.5); lg.add(m); }
        for(const lz of [-150.5,-161.5]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(0.15,520),lm); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(0,0.018,lz); lg.add(m); }
        for(const lz of [-155.8,-156.2]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(0.2,520),yl); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(0,0.018,lz); lg.add(m); }
        const mg=W3.mergeGroup(lg); mg.traverse(m=>{ if(m.isMesh){ m.castShadow=false; } }); far.add(mg); }
      // 街屋與大樓（TK.bgCity：一個 style 合併成 4～5 個 draw call）
      const city=[], halls=[], cityRows=[];   /* cityRows：公館那兩排（x −189 第一排、x −212 第二排）——有正式模型（bldg.campus_gongguan_bd，LAWWW2-C gg_backdrop.py）時是載入前、載入失敗的備用 */
      { let gx=-68; [10,8,12,10,8,8,9,9,8,9,9,10,8,9,9].forEach((w,i,a)=>{ const W=w+(i<8&&i<a.length-1?1.2:0); cityRows.push({x:-189,z:gx+W/2,w:W,d:16,floors:4+((i*5)%4),gh:4.2,ry:Math.PI/2,color:WALLC[i%7]}); gx+=W; });   // 公館南側那一排（gx -68–77.6）
        cityRows.push({x:-189,z:-81,w:14,d:16,floors:5,gh:4.2,ry:Math.PI/2,color:'#cdbfa8'});   // 往溫州街巷口的轉角公寓（gx -88–-74；-74–-68 是巷子）
        for(let z=77.6;z<152;){ const w=8+Math.round(H(z,1)*5); cityRows.push({x:-189,z:z+w/2,w,d:16,floors:4+Math.floor(H(z,2)*4),gh:4.2,ry:Math.PI/2,color:WALLC[Math.floor(H(z,3)*7)]}); z+=w; }
        for(let z=-88;z>-142;){ const w=8+Math.round(H(z,1)*5); cityRows.push({x:-189,z:z-w/2,w,d:16,floors:4+Math.floor(H(z,2)*4),gh:4.2,ry:Math.PI/2,color:WALLC[Math.floor(H(z,3)*7)]}); z-=w; }
        for(let z=-140;z<154;){ const w=14+Math.round(H(z,4)*8); cityRows.push({x:-212,z:z+w/2,w,d:18,floors:6+Math.floor(H(z,5)*8),gh:4.2,ry:Math.PI/2,color:TALLC[Math.floor(H(z,6)*7)],shop:false}); z+=w+2+Math.floor(H(z,19)*3)*3; }   // 第二排（較高、高低錯落、中間有縫）
        // 北：馬路對面兩排（立面朝 +z）
        for(let x=-260;x<262;){ const w=10+Math.round(H(x,7)*8); city.push({x:x+w/2,z:-171,w,d:16,floors:5+Math.floor(H(x,8)*6),gh:4.0,ry:0,color:WALLC[Math.floor(H(x,9)*7)],shop:H(x,21)<0.4}); x+=w; }   /* shop：只有四成有店面，其他一樓也是窗（LAWWW2-B 10-24 巡查③：從醉月湖看，整排 500 m 都是彩色招牌，像舞台布景；辛亥路對面多是住宅大樓）*/
        for(let x=-262;x<262;){ const w=16+Math.round(H(x,10)*10); city.push({x:x+w/2,z:-194,w,d:18,floors:6+Math.floor(H(x,11)*8),gh:4.0,ry:0,color:TALLC[Math.floor(H(x,12)*7)],shop:false}); x+=w+3+Math.floor(H(x,20)*3)*3; }
        // 東、南：再遠一排城市大樓（基隆路、長興街方向；只是遠景）
        for(let z=-230;z<230;){ const w=14+Math.round(H(z,13)*10); city.push({x:214,z:z+w/2,w,d:16,floors:5+Math.floor(H(z,14)*5),gh:4.0,ry:-Math.PI/2,color:TALLC[Math.floor(H(z,15)*7)]}); z+=w+2; }
        for(let x=-200;x<214;){ const w=14+Math.round(H(x,16)*10); city.push({x:x+w/2,z:150,w,d:16,floors:5+Math.floor(H(x,17)*5),gh:4.0,ry:Math.PI,color:TALLC[Math.floor(H(x,18)*7)]}); x+=w+2; }
        // 校園外圍的系館（沒有名字）：北側中庭那一棟（從霖澤館穿堂看得到）、東北、東南、南側宿舍區
        halls.push({x:34,z:-132,w:24,d:8,floors:4,ry:0,color:'#a9a7a2',roof:'flat',shop:false});   /* 第二十四批：萬才館後面那棟 (84,-131) 拿掉，位置給國青中心（配置圖：霖澤館和萬才館中間、靠辛亥路）*/
        for(const [x,z,w,f,flat] of [[140,-120,36,5,1],[140,-75,46,4,0],[172,-100,30,3,0],[140,72,44,4,0],[140,118,36,5,1],[172,95,30,3,0]]) halls.push({x,z,w,d:16,floors:f,ry:-Math.PI/2,color:HALLC[Math.floor(H(x,z)*5)],roof:flat?'flat':'hip'});
        for(const [x,w,f] of [[-100,40,6],[-50,36,5],[0,40,6],[50,38,5],[100,40,6]]) halls.push({x,z:104,w,d:14,floors:f,ry:Math.PI,color:['#cfc6b4','#c9b49a','#bfb5a3','#d2c3a5'][Math.floor(H(x,5)*4)],roof:'flat',shop:false}); }
      far.add(TK.bgCity(city,{style:'city'})); far.add(TK.bgCity(halls,{style:'campus'}));
      /* 公館那兩排（使用者 10-20 X86「從學校去看公館……超級醜」）：正式模型是校園座標（放在原點），載入以後把方盒藏起來；不投影；窗、店面、招牌晚上會亮 */
      { const rowsFB=TK.bgCity(cityRows,{style:'city'}); rowsFB.name='gongguanRowsFallback'; rowsFB.userData.dyn=true; far.add(rowsFB);   /* dyn：不參加整區靜態合併（模型載入後要藏得起來）*/
        if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.campus_gongguan_bd']) ASSETS.loadOne('bldg.campus_gongguan_bd').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true);
            r.traverse(o=>{ if(!o.isMesh) return; o.castShadow=false; o.receiveShadow=false; o.userData.dyn=true; const m=o.material, nm=(m&&m.name)||'';
              if(/gg_bd_facade/.test(nm)) TK.addNight(m,0.85,0); else if(/gg_bd_shopfront/.test(nm)) TK.addNight(m,1.0,0.3); else if(/gg_bd_signs/.test(nm)) TK.addNight(m,1.0,0.15); });
            far.add(r); rowsFB.visible=false; zone.gongguanBD=true; }).catch(e=>console.warn('公館背景正式模型載入失敗，用方盒',e)); }
      // 校園圍牆（北側＋西側往南北延長）＋牆頭石材
      { const wb=new TK.Bin(); const wt=campusWallMat(); wb.add(wt,TK.boxG(254,1.8,0.8,1.0),3,0.9,-141); wb.add(TK.paint('#d9d3c6'),TK.boxG(254.4,0.14,1.0),3,1.87,-141); wb.add(wt,TK.boxG(0.8,1.8,61,1.0),-124,0.9,-110.5); wb.add(wt,TK.boxG(0.8,1.8,70,1.0),-124,0.9,115); wb.build(far); }   /* 西側圍牆原本只有 z -80–80，往北接到北側圍牆、往南延伸到宿舍區後面 */
      // 公館：捷運出口、路燈、行道樹、機車（照公館區域的位置）；北側馬路的路燈、行道樹；校園外圍的樹帶——全部合併
      { const mrt=TK.mrtExit({name:'捷運 公館站',sub:'出口 2'}); mrt.position.set(-181,0,-36.6); far.add(mrt);
        const props=new THREE.Group(), trees=new THREE.Group();
        for(let i=0;i<9;i++){ const z=-63+i*18; const a=W3.lampPost(); a.position.set(-138.6,0,z); a.rotation.y=-Math.PI/2; props.add(a); const b=W3.lampPost(); b.position.set(-175,0,z); b.rotation.y=Math.PI/2; props.add(b); }
        for(let x=-120;x<=120;x+=24){ const a=W3.lampPost(); a.position.set(x,0,-144.4); a.rotation.y=Math.PI; props.add(a); }
        const scC=['#e8e8e8','#2b2b2b','#8c3b47','#3a6fb0','#c9b48a','#f2f0ea','#5a5a7a'];
        for(let i=0;i<14;i++){ const gx=-70+i*10, n=Math.abs(gx)<12?1:3; for(let k=0;k<n;k++){ const s=TK.scooter(scC[((k*3+i*7)%7)]); s.position.set(-138+((k*7)%3-1)*0.06,0,gx+(k-(n-1)/2)*0.85); s.rotation.y=-Math.PI/2; props.add(s); } }
        for(let i=0;i<8;i++){ const gx=-60+i*14; for(let k=0;k<3;k++){ const s=TK.scooter(scC[((k*5+i*3)%7)]); s.position.set(-176.8,0,gx+(k-1)*0.85); s.rotation.y=Math.PI/2; props.add(s); } }
        const T=(x,z,h)=>{ const t=TK.tree(h||6.4*(1.6+H(x,z)*0.5)); t.position.set(x,0,z); t.rotation.y=H(z,x)*6.28; trees.add(t); };
        for(let i=0;i<6;i++) T(-134,-65+i*26,6.4*1.2);
        for(let x=-116;x<=116;x+=14) T(x+H(x,1)*3,-143.2,6.4*1.3);
        for(let x=8;x<=104;x+=9){ if(x>26&&x<42) continue; T(x+H(x,2)*2,-125.5); }   // 法學院後面的中庭（霖澤館穿堂正後方留空，看得到後面那棟）
        T(29,-128,6.4*1.5); T(44,-127.5,6.4*1.4);
        for(let z=-98;z>=-136;z-=9.5) for(let x=-116;x<=2;x+=12){ const tx=x+H(x,z)*5, tz=z+H(z,x)*3; if(tx>-64&&tz>-127) continue; T(tx,tz); }   // 西北角走不到的樹林（方案 A：湖和博雅那一塊打開，樹只留在西邊和圍牆外）
        for(const x of [130,142,155]) for(let z=-46;z<=46;z+=9) T(x+H(x,z)*3,z+H(z,x)*3);   // 總圖後面的樹帶
        for(let x=-124;x<=200;x+=13) T(x+H(x,9)*2,99);   // 南側道路旁
        const pm=W3.mergeGroup(props); pm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); far.add(pm);
        const tm=W3.mergeGroup(trees); tm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); far.add(tm); }
      g.add(far); }
    // 邊界
    nav.blockOutside(-123,-124,125,84); nav.blockRect(-92.5,-104,61,40,0,0);   /* 方案 A：西北角原本整塊（x -123～5）走不到，現在只擋西邊 x -123～-62；湖、博雅、普通那一塊走得到 */ nav.blockRect(112.5,-104,25,40,0,0); nav.blockRect(-123,0,2,8,0,0); // 北側只留法學院前庭（x 5–100）可走；校門通道保留
    // 第二十批：法學院後面（建築背面到圍牆）不能走——入口都在正面，霖澤館穿堂與後面的台階不能走；兩棟之間、霖澤館西側用矮籬收邊（原本走得到背面 3 m 寬的窄縫，盡頭就是地圖邊界）
    nav.blockRect(52.5,-121.25,95,5.5,0,0);
    // v9.4（D36，使用者：「霖澤館的穿堂必須真正能走進去、穿過建築」）：穿堂後段、後台階、後面的小廣場（北邊是後面那棟系館的牆、東西兩側矮灌木收邊）可以走
    { nav.freeRect(27.45,-121.45,40.55,-118.0); nav.freeRect(26.65,-123.8,41.35,-121.45); nav.freeRect(22.4,-127.6,45.6,-123.8);
      for(const [bx,bz,bw,bd,pad] of linze.userData.ck.blocks) nav.blockRect(34+bx,-112+bz,bw,bd,0,pad==null?0.15:pad);   /* 柱子、扶手、兩翼再擋一次 */
      nav.blockCircle(29,-128,0.6); nav.blockRect(22.0,-125.7,0.6,4.6,0,0.1); nav.blockRect(46.0,-125.7,0.6,4.6,0,0.1);
      const hb=new TK.Bin(); for(const x0 of [22.0,46.0]) for(let z=-127.6;z<=-123.6;z+=0.8) TK.plantClump(hb,x0,0,z,1.0,6,[0.62,0.82,0.6]); const hg=new THREE.Group(); hb.build(hg); g.add(hg);
      for(let i=0;i<9;i++){ const b=parkedBike(['#3a6fb0','#8c3b47','#2f5d50','#e0b95b','#d9d3c6'][i%5],500+i); b.position.set(24.2+i*0.75,0,-127.0); b.rotation.y=Math.PI/2; g.add(b); } nav.blockRect(27.2,-127.0,7.0,1.1,0,0.05);   /* 腳踏車停在後面那棟的牆邊 */ }
    { const hb=new TK.Bin(); for(const [x0,x1] of [[5,14],[54,73]]) for(let x=x0+0.5;x<=x1-0.4;x+=0.85) TK.plantClump(hb,x,0,-118.3+((Math.round(x*7))%3-1)*0.08,1.0+((Math.round(x*3))%3)*0.08,6,[0.62,0.82,0.6]); const hg=new THREE.Group(); hb.build(hg); g.add(hg); }   /* 矮灌木（和椰林大道的杜鵑叢同一套）*/
    // 校門通道格：兩側通道往公館那一段可走（門房在校門正中間，2026-10-18 起；原本開的是開口正中間 z -4～4）；開完再把門房、燈柱、鐵門擋回去
    for(const lx of gate.userData.gate.lanes) for(let z=lx-2.1;z<=lx+2.1;z+=0.5) for(let x=-127;x<=-118;x+=0.5){ const [cx,cz]=nav.toCell(x,z); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    placeBlocks(nav,gate,-124,0,-Math.PI/2);
    // 碰撞盒（鏡頭用）
    /* 校園建築的鏡頭碰撞都在 ckPlace 裡（套件建築：行政大樓、文學院、校史館、總圖、霖澤館、萬才館、男一舍、社科院、農業陳列館）*/
    // （以下放在校園建構的最後面：TK.tree、小灌木用共用亂數，放在這裡才不會讓前面其他樹的形狀跟著變）
    // 國青中心（第二十四批，使用者提供的法律學院配置圖：霖澤館與萬才館中間、靠辛亥路的灰色宿舍）：遊戲的法學院區是壓縮過的（D25），兩館之間只剩約 20 m，
    // 放在兩館中間的後方（中庭與北側圍牆之間，玩家走不到，不加導航），從兩館之間、霖澤館前都看得到。外觀沒有照片：灰色現代板樓是推測
    { const gq=CK.modern({w:30,d:10,floors:7,gfh:4.0,fh:3.2,wall:'#a9aba6',slab:'#c8c9c4',sign:'國青中心'}); place(g,gq,64,-134,0); }
    // 黑森林（第二十四批，配置圖：法學院靠校園那一側的一片樹林，裡面有步道；霖澤館東南邊有一個小水池）：法學院廣場南邊、到 z=-60 的路之間
    { const fb=new TK.Bin(); const fg=new THREE.Group();
      ground(g,34,14,W3.canvasTex('forestFloor',128,128,(x,w,h)=>{ x.fillStyle='#4d5a37'; x.fillRect(0,0,w,h); let s=11; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; for(let i=0;i<900;i++){ const v=r(); x.fillStyle=v<0.4?'rgba(92,70,44,0.5)':(v<0.75?'rgba(60,82,40,0.55)':'rgba(120,98,60,0.4)'); x.fillRect(r()*w,r()*h,2+r()*3,1+r()*2); } }),[8,3.5],72,-72,0.008);   // 落葉地面
      strip(g,62,-81,68,-72,2.2,W3.pathTex(),2); strip(g,68,-72,78,-65,2.2,W3.pathTex(),2);   // 穿過樹林的小步道（廣場 → 南邊的路）
      const FT=[[58.5,-75.5],[61,-68.5],[61.8,-77.5],[66,-66.5],[71,-75.5],[75,-71.5],[77.5,-77],[80,-70.5],[84,-76.5],[86.5,-68.5],[82.5,-66]];   /* 每棵離步道中線 ≥ 2.5 m */
      FT.forEach(([x,z],i)=>{ const t=TK.tree(6.4*(1.4+(i%3)*0.12),300+i,{spread:1.25,dark:0.72}); place(fg,t,x,z,i*1.7); nav.blockCircle(x,z,0.6); });
      g.add(W3.mergeGroup(fg));
      // 小水池（霖澤館東南邊）：深色水面、石砌池邊、水邊的植物；不能走
      { const PX=49, PZ=-71, RX=4.2, RZ=2.8;   /* 離路人散步路線 (50,-80)→(30,-60) 約 5.7 m */ const wm=new THREE.Mesh(new THREE.CircleGeometry(1,32),new THREE.MeshStandardMaterial({color:0x2f4b4a,roughness:0.15,metalness:0.3})); wm.scale.set(RX,RZ,1); wm.rotation.x=-Math.PI/2; wm.position.set(PX,0.03,PZ); wm.receiveShadow=true; g.add(wm);
        for(let i=0;i<26;i++){ const a=i/26*Math.PI*2; fb.add(TK.paint('#8f8b82'),TK.boxG(1.05,0.22,0.42),PX+Math.cos(a)*(RX+0.15),0.11,PZ+Math.sin(a)*(RZ+0.15),-a+Math.PI/2); }
        for(const a of [0.4,1.3,2.6,3.5,4.4,5.6]) TK.plantClump(fb,PX+Math.cos(a)*(RX+0.7),0,PZ+Math.sin(a)*(RZ+0.6),0.9,6,[0.55,0.75,0.5]);
        nav.blockRect(PX,PZ,2*RX+1.4,2*RZ+1.2,0,0); }
      const fbg=new THREE.Group(); fb.build(fbg); g.add(fbg); }
    // 燈光光暈
    for(const l of lamps){ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd88a,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(3,3,1); glow.position.set(0,3.9,0.75); l.add(glow); glow.visible=false; E.lampGlows.push(glow); const pool=new THREE.Mesh(new THREE.CircleGeometry(4.2,16),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(0,0.03,0.75); l.add(pool); pool.visible=false; E.lampGlows.push(pool);
      if(l.userData.roadPool){ const rp=new THREE.Mesh(new THREE.CircleGeometry(6.5,24),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd59a,transparent:true,opacity:0.38,depthWrite:false,blending:THREE.AdditiveBlending})); rp.rotation.x=-Math.PI/2; rp.scale.set(1.3,1,1); rp.position.set(0,0.035,4.5); rp.material.polygonOffset=true; rp.material.polygonOffsetFactor=-8; rp.material.polygonOffsetUnits=-16; l.add(rp);   /* 深度偏移（LAWWW2-B 10-24）：和步道交疊的柏油路（舟山路）會被 stripLayer 往上推一層，斜看時把只高 1.5 cm 的光圈蓋掉——光圈固定比任何路面層級都前面 */ rp.visible=false; E.lampGlows.push(rp); } }   /* 椰林大道：路面上一圈淡的燈光（離燈 4.5 m、半徑 6.5 m、沿路拉長 1.3 倍），兩側的在路中間接起來 */
    /* 大一女舍 A、B 門廊的吸頂燈（LAWWW2 6f98244 加大燈罩）：晚上燈罩下一團光暈、門口地上一圈光（和路燈同一套開關 E.lampGlows；位置＝campus_freshman.py 門廊天花板中心） */
    if(!/[?&]noporch\b/.test(location.search||'')) for(const [px,pz] of [[-108,61],[-78,59]].concat(m1GLB?[[20,60]]:[]))   /* 男一舍（ART-EXT-M1）門廊的吸頂燈：campus_male1.py 門廊天花板中心 */{ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffe2a8,transparent:true,opacity:0.6,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(1.8,1.8,1); glow.position.set(px,3.15,pz); g.add(glow); glow.visible=false; E.lampGlows.push(glow);
      for(const [y,dz,r,op] of [[0.112,0,1.7,0.85],[0.035,-2.4,2.8,0.6]]){ const pool=new THREE.Mesh(new THREE.CircleGeometry(r,20),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffe0a8,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(px,y,pz+dz); g.add(pool); pool.visible=false; E.lampGlows.push(pool); } }   /* 門廊地坪（高 10 cm）上一圈、門口地上一圈 */
    // 出口
    const exits=[...gateExits(gate,-124,0,-Math.PI/2,1.5,2.5,{to:'gongguan',spawn:{x:-2.5,z:-29,yaw:0},label:'走出校門'}),   /* 門房在校門正中間：兩側通道各一個（世界座標 (-125.5,±5.27)，2026-10-18；原本是開口正中間 (-126,0) r3）*/
      {x:34,z:-126.6,r:1.8,to:'lane118',spawn:{x:0,z:47.6,yaw:Math.PI},label:'從後門出去（118 巷）'},   /* 霖澤館穿堂後面的小廣場＝法學院的後門（辛亥路那一側；D46、使用者 10-18 02:2x）*/{x:34+linze.userData.ck.lobby.x,z:-112+linze.userData.ck.lobby.z,r:1.5,to:'linze',spawn:Object.assign({},LINZE_LAYOUT.entrance.spawn),label:'進入霖澤館',door:true},{x:93.8,z:-100.6,r:1.6,to:'wancai',spawn:{x:0,z:5,yaw:Math.PI},label:'進入萬才館',door:true,lv:0,y:0},(typeof LIBRARY_LAYOUT!=='undefined'?{x:86.4,z:0,r:3.8,to:'library_hall',spawn:Object.assign({},LIBRARY_LAYOUT.entrance.spawn),label:'進入總圖書館',door:true}:{x:86.4,z:0,r:3.8,to:'library',spawn:{x:0,z:7,yaw:Math.PI},label:'進入總圖書館',door:true}),(typeof DORM_LAYOUT!=='undefined'?{x:20,z:59.6,r:2.6,to:'dorm_hall',spawn:Object.assign({},DORM_LAYOUT.entrance.spawn),label:'回宿舍',door:true}:{x:20,z:59.6,r:2.6,to:'dorm',spawn:{x:0,z:2.4,yaw:Math.PI},label:'回宿舍',door:true})];
    /* 社科院圖書館（D56 社科院第①步）：門在現在的社科院正面中間（src/soclib3d.js 的 SL3.DOOR）；一樓才有（萬才館陽台那一層不算）*/
    if(typeof SL3!=='undefined'&&typeof SOCLIB_LAYOUT!=='undefined') exits.push({x:SL3.DOOR.x,z:SL3.DOOR.z,r:SL3.DOOR.r,to:'soclib',spawn:Object.assign({},SOCLIB_LAYOUT.entrance.spawn),label:'進入社科院圖書館',door:true,lv:0,y:0});
    // 總圖：門在一樓拱廊裡面，互動範圍從門廊前緣涵蓋到門口；霖澤館（第十九批）：入口比地面高、前面是大台階（不能走），互動點在台階下面；萬才館（第二十四批）：互動點在陽台下面的一樓入口（半徑 1.6；出來的出生點離互動點 2.2 m，不會一出來就跳出按鈕）
    if(typeof GAME!=='undefined'&&GAME.G&&GAME.G.stage==='econ') E.interactables.push({x:SOCX?SOCX.mainDoor.x:97.9,z:SOCX?SOCX.mainDoor.z:-63.5,radius:1.4,lv:0,label:'社會科學院',look:'經濟系的系辦在這棟。今天沒有要來的事。'});   /* V0-A6（AA_173 第 1 節，第 1 級）：經濟系那一年，社科院門口平常的一句；法律系的那幾年照舊（SK 事件照 BB_106），不讓玩家以為可以進去逛 */
    const G0x=typeof GAME!=='undefined'?GAME.G:null, dormGone=!!G0x&&(G0x.stage||'law')==='law'&&!!G0x.flags&&G0x.flags.MOVED_OUT!=null&&G0x.flags.MOVED_OUT!==false;   /* 畢業後宿舍期滿退宿（1A-15 MOVED_OUT，同 home3d.js HOME.movedOut）*/
    for(const ex of exits){ if(dormGone&&(ex.to==='dorm_hall'||ex.to==='dorm')){ E.interactables.push({x:ex.x,z:ex.z,radius:ex.r,lv:ex.lv,y:ex.y,label:'看宿舍門口',look:'（宿舍門口。門禁卡已經還了。）'}); continue; }   /* AA_363 T7-3：退宿以後宿舍門口進不去，只能看 */
      E.interactables.push({x:ex.x,z:ex.z,radius:ex.r,label:ex.label,exit:ex,lv:ex.lv,y:ex.y}); }   /* 萬才館一樓入口在陽台正下方：只在地面那一層（站在陽台上不會跳出「進入萬才館」）*/
    // 座位互動
    for(const s of seats){ E.interactables.push({x:s.x,z:s.z,radius:1.6,label:s.label,seat:s}); }
    const nav1=wancaiStairs(E,g,nav,wancai,88,-112,campusWalk);   // 萬才館大樓梯、平台、陽台（第 1 層）
    const zone={group:g,nav,levels:nav1?[nav,nav1]:undefined,spawn:{x:34,z:-98,yaw:0},seats,lamps,buildings,exits,walkMeshes:campusWalk,linzeDoor:{x:34+linze.userData.ck.lobby.x,z:-112+linze.userData.ck.lobby.z},
      onLamps(on){ for(const b of buildings) W3.setNight(b,on); CK.setNight(on); },   // 校園套件的窗戶晚上透出暖光
      update(dt,E){ updateLake(lakeU,E); if(bikes) bikes.update(dt,E&&E.camera); },
    };
    const bikes=parked.length?parkedBikeChunks(g,parked,40,45):null; zone.parkedBikes=bikes;   /* 40 m 一區、鏡頭 45 m 外整區不畫 */
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.wancai_exterior']) ASSETS.loadOne('bldg.wancai_exterior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachExterior(wancai,c.scene.clone(true)); }).catch(e=>console.warn('萬才館外觀正式模型載入失敗，用套件的外觀',e));   // 萬才館第二階段：大樓梯、平台、陽台、弧形量體、立面（tools/blender/wancai_exterior.py）
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.linze_exterior']) ASSETS.loadOne('bldg.linze_exterior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachExterior(linze,c.scene.clone(true)); }).catch(e=>console.warn('霖澤館外觀正式模型載入失敗，用套件的外觀',e));
    // 總圖的 Blender 正式模型（第二個 AI）：和溫州街、公館同一套接法（只藏 ckTag==='library' 的套件；窗晚上亮、招牌是石材底色的 canvas 字）
    if(libGLB) ASSETS.loadOne('bldg.campus_library').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_library_glb','library'); }).catch(e=>console.warn('總圖正式模型載入失敗，用套件的外觀',e));
    courtGLB(zone);   /* 系籃球場的正式模型（bballCourt）*/
    gateGLB(E,g,gate,-124,0,-Math.PI/2,zone);   /* 校門（ART-EXT-GATE）*/
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.campus_lake']) ASSETS.loadOne('bldg.campus_lake').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachLakeGLB(E,g,lakeU,c.scene.clone(true)); }).catch(e=>console.warn('醉月湖正式模型載入失敗，用程序化的湖岸、湖心亭',e));   /* 醉月湖（LAWWW2 ⑩）*/
    if(fairGLB) fairGLB(zone);   /* 社團博覽會的帳篷（clubFair）*/
    if(bellGLB) ASSETS.loadOne('bldg.campus_bell').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_bell_glb','bell'); }).catch(e=>console.warn('傅鐘正式模型載入失敗，用套件的外觀',e));
    if(gtGLB) ASSETS.loadOne('bldg.campus_gongtong').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_gongtong_glb','gongtong'); for(const [px,pz] of GT_PALMS) nav.blockCircle(px,pz,0.45); nav._cm=null; }   /* 半徑 0.45（原本 0.35：(6.5,19.0) 剛好在四格的交角，格子中心都在 0.354 m 外，一格都沒擋到、走得進樹幹；LAWWW2 2026-10-14 campus_glb_integration）*/).catch(e=>console.warn('共同教學館正式模型載入失敗，用套件的外觀',e));
    if(m1GLB) ASSETS.loadOne('bldg.campus_male1').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_male1_glb','male1'); }).catch(e=>console.warn('男一舍正式模型載入失敗，用套件的外觀',e));   /* 男一舍（ART-EXT-M1）*/
    if(ptGLB) ASSETS.loadOne('bldg.campus_putong').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_putong_glb','putong'); }).catch(e=>console.warn('普通教學館正式模型載入失敗，用套件的外觀',e));
    if(byGLB) ASSETS.loadOne('bldg.campus_boya').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_boya_glb','boya'); }).catch(e=>console.warn('博雅教學館正式模型載入失敗，用套件的外觀',e));   /* ART-EXT-TEACH */
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.campus_freshman']) ASSETS.loadOne('bldg.campus_freshman').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_freshman_glb','freshman'); }).catch(e=>console.warn('大一女舍正式模型載入失敗，用套件的外觀',e));
    if(admGLB) ASSETS.loadOne('bldg.campus_admin').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_admin_glb','admin'); }).catch(e=>console.warn('行政大樓正式模型載入失敗，用套件的外觀',e));
    if(artsGLB) ASSETS.loadOne('bldg.campus_arts').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_arts_glb','arts'); }).catch(e=>console.warn('文學院正式模型載入失敗，用套件的外觀',e));
    if(histGLB) ASSETS.loadOne('bldg.campus_hist').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_hist_glb','hist'); }).catch(e=>console.warn('校史館正式模型載入失敗，用套件的外觀',e));
    if(pavGLB) ASSETS.loadOne('bldg.campus_pavilion').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_pavilion_glb','pavilion'); }).catch(e=>console.warn('洞洞館正式模型載入失敗，用套件的外觀',e));
    if(socGLB){ const key=SOCX?'bldg.campus_socsci':'bldg.campus_modern'; ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true); if(SOCX&&SOCX.place){ root.rotation.y=SOCX.place.ry; root.position.set(SOCX.place.x,0,SOCX.place.z); }   /* X75：模型是原本的世界座標（萬才館東南），轉 180° 再平移到霖澤館西南（socsci_layout.js 的 place）*/
      attachWenzhouModel(E,g,root,'ckTag',SOCX?'campus_socsci_glb':'campus_modern_glb','soc'); }).catch(e=>console.warn('社科院正式模型載入失敗，用備用的外觀',e)); }
    return zone; } };
  // 建築外觀的正式模型（Blender GLB，建築自己的座標）接到套件的建築上：套件的外觀藏起來（招牌 keepWithFormal 留著）；導航、走路高度、鏡頭碰撞照舊由套件給。
  // 窗玻璃、大廳玻璃、穿堂嵌燈登記成夜間會亮（材質名稱約定見 tools/blender/linze_exterior.py）
  function attachExterior(b,root){ for(const m of b.children) if(m.isMesh&&!m.userData.keepWithFormal) m.visible=false;
    const NIGHT={ext_glass_lit:[0xffd9a0,0.75,0],ext_glass_lobby:[0xffdcae,0.8,0],ext_downlight:[0xfff3dc,1.4,0.25]};
    root.traverse(o=>{ if(!o.isMesh) return; o.castShadow=true; o.receiveShadow=true; const mt=o.material, nn=mt&&NIGHT[mt.name]; if(nn){ if(!mt.userData.nightReg){ mt.userData.nightReg=true; mt.emissive=new THREE.Color(nn[0]); } TK.addNight(mt,nn[1],nn[2]); }   /* 夜間每次接上都要重新登記（見 attachWenzhouModel 的說明）*/ if(mt&&mt.name==='ext_ceiling') TK.bounce(mt,0.32,0.5); });   /* 穿堂天花板：地面反射上來的光（套件的穿堂天花板也是這樣做）*/
    b.add(root); b.userData.formal=true; }
  /* ---- 社團博覽會的帳篷（LAWWW2 479b7fc：club_fair.glb，九頂；配置照 docs/art-rebuild/second_ai/VISUAL_REVIEW.md 28.1，LAWWW 2026-10-14 採用，美術待使用者驗收）----
     只在博覽會那兩天（activities.js 的 club_expo_y1s1.dates）擺：大道南側一排、帳篷中心 z=15.1、面向北（轉 π）；服務台在原本公告欄的位置（博覽會的互動點 (-13.5,13.6) 不動），法服在原本招生攤位的位置。
     每頂帳篷整個擋起來（3×3 m）；人站在帳篷前面 z 12.5–13.5；傅鐘廣場（x≤−24）和長椅前面留空。正式模型載入前／失敗：簡單的帳篷（D38 分類 ③）*/
  const FAIR_Z=15.1, FAIR=[['booth_hiking',-21.3],['booth_lawclub',-17.8],['booth_info',-13.5],['booth_guitar',-9.7],['booth_debate',-5.9],['booth_basketball',3.4],['booth_bg1',7.2],['booth_bg2',11.0],['booth_bg3',14.8]];
  /* 校園擺帳篷的日子（同一排帳篷）：大一的社團博覽會（activities.js club_expo_y1s1 的日子）、大一校慶 2025-11-15（BB_95 3-7，法服的法律問答攤）；
     大二的社團博覽會 9/12（AA_170，祐廷站在攤位後面；AA_485 3-2 從 9/16～9/17 搬到開學第一週的週六）、各年校慶：大二 2026-11-14、大三 2027-11-13、大四 2028-11-11（AA_177 第 7、10 節；「每年 11/15」只留給大一）；
     經濟系那一年的社團博覽會 9/18～9/20（BB_104 E07、AA_154）、校慶園遊會 11/9（E17）*/
  const FAIR_DAYS=['2025-11-15','2026-09-12','2026-11-14','2027-11-13','2028-11-11'], FAIR_DAYS_ECON=['2024-09-18','2024-09-19','2024-09-20','2024-11-09'];   /* 大二的社團博覽會 2026-09-12（六）一天（CLUBFAIR-REAL-1027，AA_485 3-2：原本 9/16、9/17）*/
  function fairDayKey(key,econ,expo){ return FAIR_DAYS.includes(key)||EXPO_DAYS.includes(key)||(!!econ&&FAIR_DAYS_ECON.includes(key))||(expo||[]).includes(key); }
  function isFairDay(){ try{ const A=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list&&ACTIVITIES.list.find(a=>a.id==='club_expo_y1s1'); const G=typeof GAME!=='undefined'&&GAME.G; if(!A||!G||typeof CALENDAR==='undefined') return false;
    return fairDayKey(CALENDAR.dateOf(G.day).key,typeof STORY!=='undefined'&&STORY.isEcon&&STORY.isEcon(G),ACTIVITIES.on(A,G.day,G)?[CALENDAR.dateOf(G.day).key]:[]); }catch(e){ console.warn('isFairDay',e); return false; } }   /* 大一的社博照 ACTIVITIES.on（新局 9/6、舊局 9/30～10/1：CLUBFAIR-REAL-1027）*/
  /* ---- 社團博覽會（大一 2025-09-06、大二 2026-09-12）：椰林大道兩邊 36 頂帳篷＋舞台（CLUBFAIR-REAL-1027，AA_485 第 3 節；LAWWW2-C 2026-10-27）----
     使用者 X109「社團博覽會攤會也太少 都沒人顧」「要參考實際的吧」：照臺大的社團聯展，椰林大道兩邊一路排帳篷、大道中段一個舞台。
     配置 src/data/club_fair_expo_layout.js（CLUB_FAIR_EXPO；Blender tools/blender/env_second/club_fair_expo.py 讀同一份）；正式模型 bldg.club_fair_expo
     （36 頂＋舞台烘成一個網格、一個材質＝一個 draw call，約 2.7 萬三角形；整組放在 (0,0,0)）。博覽會那天（activities.js club_expo_y1s1 的日子、大二 EXPO_DAYS）用這一組；
     校慶、經濟系那一年照舊用下面九頂那一排（clubFair）。每頂帳篷 3×3 m 擋起來；舞台台面、前面兩邊的台階、兩邊的喇叭擋起來；
     大道中間（z ±3.4 以內）、人行道（z ±7）照舊走得到。Z3.fairExpoFront(id)＝站在攤位前的位置（互動點、顧攤的人的對面）。
     正式模型載入前／失敗：簡單的帳篷、台子（D38 分類 ③）*/
  const EXPO_DAYS=['2026-09-12'];   /* 大二的社博（AA_485 3-2）；大一的日子在 activities.js 的 club_expo_y1s1.dates */
  function isExpoDay(){ try{ const G=typeof GAME!=='undefined'&&GAME.G; if(!G||typeof CALENDAR==='undefined') return false; if(typeof STORY!=='undefined'&&STORY.isEcon&&STORY.isEcon(G)) return false;
    const A=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list&&ACTIVITIES.list.find(a=>a.id==='club_expo_y1s1'), key=CALENDAR.dateOf(G.day).key; return EXPO_DAYS.includes(key)||!!(A&&ACTIVITIES.on&&ACTIVITIES.on(A,G.day,G)); }catch(e){ console.warn('isExpoDay',e); return false; } }   /* 大一照 ACTIVITIES.on：新局 9/6、舊局 9/30～10/1 也是 36 頂（攤位的互動點照 36 頂的位置，src/data/club_fair.js）*/
  function fairExpoFront(id){ const L=typeof CLUB_FAIR_EXPO!=='undefined'?CLUB_FAIR_EXPO:null; if(!L) return null; if(id==='stage') return L.stage.front.slice();
    const t=L.tents.find(q=>q.id===id); if(!t) return null; const d=L.tent.front; return [+(t.x+Math.sin(t.ry)*d).toFixed(2),+(t.z+Math.cos(t.ry)*d).toFixed(2)]; }
  function clubFairExpo(E,g,nav){ const L=CLUB_FAIR_EXPO, fb=new THREE.Group(); fb.name='fair_expo_fallback'; fb.userData.dyn=true;   /* 不參加整區靜態合併（同 clubFair）*/
    const roof=P3.M('#e8e4da',{rough:0.9}), pole=P3.M('#9aa0a6',{rough:0.5}), table=P3.M('#3f6b8a',{rough:0.8}), dark=P3.M('#26262a',{rough:0.8});
    for(const t of L.tents){ const o=new THREE.Group(); const r=new THREE.Mesh(new THREE.ConeGeometry(2.15,0.85,4,1),roof); r.rotation.y=Math.PI/4; r.position.y=2.47; o.add(r);
      for(const [px,pz] of [[-1.48,-1.48],[1.48,-1.48],[-1.48,1.48],[1.48,1.48]]){ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,2.05,6),pole); p.position.set(px,1.025,pz); o.add(p); }
      const tb=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.75,0.76),table); tb.position.set(0,0.375,0.95); o.add(tb); o.position.set(t.x,0,t.z); o.rotation.y=t.ry; fb.add(o);
      nav.blockRect(t.x,t.z,L.tent.w,L.tent.d,0); }
    const S=L.stage, st=new THREE.Mesh(new THREE.BoxGeometry(S.w,S.h,S.d),dark); st.position.set(S.x,S.h/2,S.z); fb.add(st);
    nav.blockRect(S.x,S.z,S.w,S.d,0); for(const sx of [-1,1]){ nav.blockRect(S.x+sx*(S.w/2-1.3),S.z+S.d/2+0.45,1.0,0.9,0); nav.blockCircle(S.x+sx*(S.w/2+0.6),S.z+S.d/2-0.6,0.5); }   /* 台階、喇叭（舞台 ry=0：正面朝 +z）*/
    g.add(fb);
    return zone=>{ if(typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.club_fair_expo']) return; ASSETS.loadOne('bldg.club_fair_expo').then(c=>{ if(!c||!c.scene||E.zone!==zone) return;
      const m=c.scene.clone(true); m.position.set(0,0,0); m.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); g.add(m); fb.visible=false; }).catch(e=>console.warn('社團博覽會正式模型載入失敗，用簡單的帳篷',e)); }; }
  function clubFair(E,g,nav){ const fb=new THREE.Group(); fb.name='fair_fallback'; fb.userData.dyn=true;   /* 不參加整區靜態合併（帳篷共用 P3.M 材質，沒有這行會被合併搬走，正式模型載入後 fb.visible=false 藏不到，兩套帳篷疊在一起）*/ const roof=P3.M('#e8e4da',{rough:0.9}), pole=P3.M('#9aa0a6',{rough:0.5}), table=P3.M('#3f6b8a',{rough:0.8});
    for(const [,x] of FAIR){ const t=new THREE.Group(); const r=new THREE.Mesh(new THREE.ConeGeometry(2.15,0.85,4,1),roof); r.rotation.y=Math.PI/4; r.position.y=2.47; t.add(r);
      for(const [px,pz] of [[-1.48,-1.48],[1.48,-1.48],[-1.48,1.48],[1.48,1.48]]){ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,2.05,6),pole); p.position.set(px,1.025,pz); t.add(p); }
      const tb=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.75,0.6),table); tb.position.set(0,0.375,1.0); t.add(tb); t.position.set(x,0,FAIR_Z); t.rotation.y=Math.PI; fb.add(t);
      nav.blockRect(x,FAIR_Z,3,3,0); }
    g.add(fb);
    return zone=>{ if(typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.club_fair']) return; ASSETS.loadOne('bldg.club_fair').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene; let n=0;
      for(const [name,x] of FAIR){ const src=root.getObjectByName(name); if(!src) continue; const m=src.clone(true); m.position.set(x,0,FAIR_Z); m.rotation.set(0,Math.PI,0); m.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); g.add(m); n++; }
      if(n===FAIR.length) fb.visible=false; else console.warn('社團博覽會的帳篷只找到 '+n+' 頂，留著簡單的帳篷'); }).catch(e=>console.warn('社團博覽會正式模型載入失敗，用簡單的帳篷',e)); }; }
  /* ---- 系籃球場（LAWWW2 9428f9f：bball_court.glb；位置 A 醉月湖東側 (-4,-113)、rotation.y=0，LAWWW 2026-10-14 採用，美術待使用者驗收）----
     場地可以走（鋪面 2 cm）；只擋籃架柱子（0.32×0.32，(-4,-120.85)）和兩張長椅（2.0×0.36，長邊沿 z，(4.05,-115.2)／(4.05,-110.2)）。
     活動點（AA_110 系籃練球，src/data/activities.js 的 dept_basketball）在兩張長椅中間、面向場內 (3.3,-112.7)。晚上 17:30–19:00 練球：四個角各一盞路燈。
     正式模型載入前／載入失敗：簡單的場地、柱子、長椅（D38 分類 ③），碰撞看得到，不是隱形牆。改位置要跑 tests/campus_public_unit.js */
  const COURT={x:-4,z:-113,ry:0};
  function bballCourt(E,g,nav,lamps){ const cx=COURT.x, cz=COURT.z; const fb=new THREE.Group(); fb.name='court_fallback'; fb.userData.dyn=true;   /* 同上：兩張長椅共用材質，會被合併搬走 */
    const surf=new THREE.Mesh(new THREE.PlaneGeometry(15,14),P3.M('#8c5f4c',{rough:0.92})); surf.rotation.x=-Math.PI/2; surf.position.set(cx,0.012,cz); surf.receiveShadow=true; fb.add(surf);
    const pole=new THREE.Mesh(new THREE.BoxGeometry(0.32,3.95,0.32),P3.M('#3d4a56',{rough:0.6})); pole.position.set(cx,1.975,cz-7.85); pole.castShadow=true; fb.add(pole);
    for(const bz of [-2.2,2.8]){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.45,2.0),P3.M('#6b5038',{rough:0.85})); b.position.set(cx+8.05,0.225,cz+bz); b.castShadow=true; fb.add(b); }
    g.add(fb);
    nav.blockRect(cx,cz-7.85,0.32,0.32,0,0.15);   // 籃架柱子（含防護墊）；pad 0.15：比 0.5 m 的格子細的東西不加寬會一格都擋不到（格子中心不在框裡）
    for(const bz of [-2.2,2.8]) nav.blockRect(cx+8.05,cz+bz,0.36,2.0,0,0.15);   // 場邊長椅（長邊沿 z）
    for(const [dx,dz] of [[-9,-8.6],[9,-8.6],[-9,8.6],[9,8.6]]){ const lx=cx+dx, lz=cz+dz; const l=W3.lampPost(); place(g,l,lx,lz,dz<0?0:Math.PI); lamps.push(l); nav.blockCircle(lx,lz,0.5); }   /* 燈臂朝場內 */
    return zone=>{ if(typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.bball_court']) return; ASSETS.loadOne('bldg.bball_court').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const m=c.scene.clone(true); m.position.set(cx,0,cz); m.rotation.y=COURT.ry;
      m.traverse(o=>{ if(o.isMesh){ o.receiveShadow=true; o.castShadow=!/court/i.test(o.name); } }); g.add(m); fb.visible=false; }).catch(e=>console.warn('系籃球場正式模型載入失敗，用簡單的場地',e)); }; }
  // ---- 醉月湖：不規則湖面（反射天空顏色＋細碎波紋＋太陽反光）、石砌湖岸、湖心亭＋木棧道（可以走上去）、湖邊樹叢與蘆葦、長椅、路燈 ----
  function lake(g,nav,cx,cz,seats,lamps){
    const A=16.5, B=9.2, N=80; const rad=t=>1+0.10*Math.sin(3*t+0.6)+0.05*Math.cos(5*t+1.3);
    const P=[]; for(let i=0;i<N;i++){ const t=i/N*Math.PI*2, r=rad(t); P.push([cx+Math.cos(t)*A*r, cz+Math.sin(t)*B*r]); }
    const NR=P.map((p,i)=>{ const a=P[(i-1+N)%N], b=P[(i+1)%N]; let nx=b[1]-a[1], nz=-(b[0]-a[0]); const l=Math.hypot(nx,nz)||1; nx/=l; nz/=l; if(nx*(p[0]-cx)+nz*(p[1]-cz)<0){ nx=-nx; nz=-nz; } return [nx,nz]; });
    // 湖心亭與木棧道（從南岸步道走進湖裡）
    const PX=cx-3, PZ=cz+0.6, PR=2.7, BW=1.7; const bwZ0=PZ+PR-0.4, bwZ1=cz+13.4;   /* 木棧道接到南岸步道（湖中心往南 13.4 m；方案 A 整組往北搬，所以都用相對湖中心的距離）*/
    const onBoard=(x,z)=>Math.abs(x-PX)<=BW/2+0.05&&z>=bwZ0-0.2&&z<=bwZ1+0.2;
    // 水面
    const sh=new THREE.Shape(); P.forEach((p,i)=>{ const x=p[0]-cx+NR[i][0]*0.12, y=-(p[1]-cz+NR[i][1]*0.12); if(i===0) sh.moveTo(x,y); else sh.lineTo(x,y); });
    const U={time:{value:0},deep:{value:new THREE.Color().setRGB(0.12,0.2,0.15,THREE.LinearSRGBColorSpace)},skyLo:{value:new THREE.Color(0.7,0.8,0.88)},skyHi:{value:new THREE.Color(0.5,0.65,0.8)},sunDir:{value:new THREE.Vector3(0.3,0.8,0.2)},sunCol:{value:new THREE.Color(1,1,1)}};
    const wmat=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,U]),fog:true,
      vertexShader:['#include <fog_pars_vertex>','varying vec3 vW;','void main(){ vec4 wp=modelMatrix*vec4(position,1.0); vW=wp.xyz; vec4 mvPosition=viewMatrix*wp; gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
      fragmentShader:['#include <fog_pars_fragment>','uniform float time; uniform vec3 deep,skyLo,skyHi,sunCol,sunDir; varying vec3 vW;',
        'float hs(vec2 q){ return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453); }',
        'float vn(vec2 q){ vec2 i=floor(q), f=fract(q); vec2 u=f*f*(3.0-2.0*f); return mix(mix(hs(i),hs(i+vec2(1.0,0.0)),u.x),mix(hs(i+vec2(0.0,1.0)),hs(i+vec2(1.0,1.0)),u.x),u.y); }',
        'float hg(vec2 q){ return vn(q*1.3+vec2(time*0.25,time*0.18))*0.5+vn(q*2.9-vec2(time*0.31,-time*0.22))*0.3+vn(q*6.3+vec2(-time*0.42,time*0.35))*0.2; }',
        'void main(){ vec2 p=vW.xz; float e=0.08; float h0=hg(p); vec2 gr=vec2(hg(p+vec2(e,0.0))-h0,hg(p+vec2(0.0,e))-h0)/e*0.035;',
        '  vec3 n=normalize(vec3(-gr.x,1.0,-gr.y)); vec3 v=normalize(cameraPosition-vW); float ndv=max(dot(n,v),0.0); float fr=0.06+0.84*pow(1.0-ndv,4.0);',
        '  vec3 r=reflect(-v,n); vec3 sky=mix(skyLo,skyHi,clamp(r.y*1.6,0.0,1.0))*0.86; vec3 trees=deep*0.55+vec3(0.02,0.035,0.02); vec3 refl=mix(trees,sky,smoothstep(0.03,0.24,r.y)); vec3 c=mix(deep,refl,fr);',
        '  float sp=pow(max(dot(r,normalize(sunDir)),0.0),220.0); c+=sunCol*sp*1.4;',
        '  gl_FragColor=vec4(c,1.0);','#include <fog_fragment>','}'].join('\n')});
    const water=new THREE.Mesh(new THREE.ShapeGeometry(sh,1),wmat); water.rotation.x=-Math.PI/2; water.position.set(cx,0.035,cz); water.userData.dyn=true; g.add(water);
    const lfb=new THREE.Group(); lfb.name='lake_fallback'; lfb.userData.dyn=true; g.add(lfb);   /* 湖岸、湖心亭、木棧道的程序化版本放進 lake_fallback（dyn：不被 mergeStatic 合併）；正式模型（LAWWW2 campus_lake.glb）載入後整組藏起來（attachLakeGLB）*/
    // 石砌湖岸（內側立面、頂面、外側立面三條帶，木棧道經過的地方留缺口）
    { const st=W3.stoneTex('#b7ad9c').clone(); st.needsUpdate=true; st.wrapS=st.wrapT=THREE.RepeatWrapping; st.repeat.set(0.6,0.6); const rimM=new THREE.MeshStandardMaterial({map:st,roughness:0.95});
      const pos=[], uv=[], idx=[]; const H=0.2, W=0.75; let L=0; const lens=[0]; for(let i=1;i<=N;i++){ const a=P[i-1], b=P[i%N]; L+=Math.hypot(b[0]-a[0],b[1]-a[1]); lens.push(L); }
      const band=(f)=>{ const base=pos.length/3; for(let i=0;i<=N;i++){ const k=i%N, p=P[k], n=NR[k]; for(const [o,y,v] of f){ pos.push(p[0]+n[0]*o,y,p[1]+n[1]*o); uv.push(lens[i],v); } } for(let i=0;i<N;i++){ const a=P[i], b=P[(i+1)%N]; const mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2; if(Math.abs(mx-PX)<BW/2+0.5&&mz>cz) continue; const r0=base+i*2, r1=base+(i+1)*2; idx.push(r0,r1,r0+1, r1,r1+1,r0+1); } };
      band([[-0.05,0.0,0],[-0.05,H,H]]); band([[-0.05,H,0],[W,H,W]]); band([[W,H,0],[W,0.0,H]]);
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.setIndex(idx); geo.computeVertexNormals();
      const rim=new THREE.Mesh(geo,rimM); rim.receiveShadow=true; rim.castShadow=false; rim.material.side=THREE.DoubleSide; lfb.add(rim); }
    // 導航：湖面＋湖岸不能走（外擴 0.5 m），木棧道與湖心亭可以走
    { const out=P.map((p,i)=>[p[0]+NR[i][0]*1.25,p[1]+NR[i][1]*1.25]); const inside=(x,z)=>{ let c=false; for(let i=0,j=out.length-1;i<out.length;j=i++){ const a=out[i], b=out[j]; if(((a[1]>z)!==(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])) c=!c; } return c; };
      for(let z=cz-B*1.3-1;z<=cz+B*1.3+1;z+=nav.cell) for(let x=cx-A*1.3-1;x<=cx+A*1.3+1;x+=nav.cell){ const [ix,iz]=nav.toCell(x,z); if(ix<0||iz<0||ix>=nav.cols||iz>=nav.rows) continue; const [wx,wz]=nav.toWorld(ix,iz); const free=onBoard(wx,wz)||Math.hypot(wx-PX,wz-PZ)<PR-0.7; if(inside(wx,wz)&&!free) nav.b[nav.idx(ix,iz)]=1; }   /* 湖心亭走得到的範圍：格子中心離亭子中心 2.0 m 內（原本 PR-0.35＝2.35：人的身體會穿過柱子 31 cm、超出平台邊緣 17 cm；LAWWW2 lake_nav_check.py 量的）*/
      for(let k=0;k<6;k++){ const [ix,iz]=nav.toCell(PX+Math.cos(k*Math.PI/3)*2.3,PZ+Math.sin(k*Math.PI/3)*2.3); nav.b[nav.idx(ix,iz)]=1; } }   /* 六根柱子（半徑 2.3 的六個頂點）所在的格子擋起來：人不會穿過柱子 */
      nav.addSurf({x0:PX-2.45,x1:PX+2.45,z0:PZ-2.45,z1:PZ+2.45,y:0.05}); nav.addSurf({x0:PX-1.2,x1:PX+1.2,z0:PZ+2.0,z1:bwZ1-0.3,y:0.05}); nav.addSurf({x0:PX-1.2,x1:PX+1.2,z0:bwZ1-0.3,z1:bwZ1+0.15,axis:'z',ya:0.05,yb:0.0});   /* 亭子、木棧道的地板頂面在 y 0.05（水面 0.035 之上；正式模型與程序化版本都是）：人站在上面腳不沉進木板；接岸的地方 45 cm 斜坡 */
    // 湖心亭：六角平台、紅柱、深色瓦頂；木棧道
    { const wood=new THREE.MeshStandardMaterial({color:0x7a5a3e,roughness:0.85}); const deck=new THREE.Mesh(new THREE.CylinderGeometry(PR,PR,0.16,6),new THREE.MeshStandardMaterial({color:0x9a8b74,roughness:0.9})); deck.position.set(PX,-0.03,PZ); deck.rotation.y=Math.PI/6; deck.receiveShadow=true; lfb.add(deck);
      const colM=new THREE.MeshStandardMaterial({color:0x8e3a2c,roughness:0.7}); const roofM=new THREE.MeshStandardMaterial({color:0x3f4a46,roughness:0.8}); for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; const c=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.11,2.7,8),colM); c.position.set(PX+Math.cos(a)*(PR-0.3),1.35,PZ+Math.sin(a)*(PR-0.3)); c.castShadow=true; lfb.add(c); if(i!==1){ const rail=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.45,(PR-0.3)*0.95),wood); const a2=a+Math.PI/6; rail.position.set(PX+Math.cos(a2)*(PR-0.3)*0.86,0.35,PZ+Math.sin(a2)*(PR-0.3)*0.86); rail.rotation.y=-a2; lfb.add(rail); } }
      const beam=new THREE.Mesh(new THREE.CylinderGeometry(PR-0.15,PR-0.15,0.22,6,1,true),colM); beam.position.set(PX,2.72,PZ); beam.rotation.y=Math.PI/6; lfb.add(beam);
      const roof=new THREE.Mesh(new THREE.ConeGeometry(PR+0.75,1.5,6),roofM); roof.position.set(PX,3.55,PZ); roof.rotation.y=Math.PI/6; roof.castShadow=true; lfb.add(roof); const eave=new THREE.Mesh(new THREE.CylinderGeometry(PR+0.78,PR+0.7,0.12,6),roofM); eave.position.set(PX,2.82,PZ); eave.rotation.y=Math.PI/6; lfb.add(eave);
      const fin=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),new THREE.MeshStandardMaterial({color:0xb08a3a,roughness:0.5,metalness:0.4})); fin.position.set(PX,4.38,PZ); lfb.add(fin);
      const len=bwZ1-bwZ0; const bw=new THREE.Mesh(new THREE.BoxGeometry(BW,0.14,len),wood); bw.position.set(PX,-0.02,(bwZ0+bwZ1)/2); bw.receiveShadow=true; lfb.add(bw);
      for(const s of [-1,1]){ const rail=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,len-0.4),wood); rail.position.set(PX+s*(BW/2-0.04),0.62,(bwZ0+bwZ1)/2); lfb.add(rail); for(let z=bwZ0+0.3;z<=bwZ1-0.2;z+=1.6){ const post=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.62,0.08),wood); post.position.set(PX+s*(BW/2-0.04),0.31,z); lfb.add(post); } }
      for(let z=bwZ0+1.2;z<=bwZ1-1.8;z+=2.4){ for(const s of [-1,1]){ const pile=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.4,6),wood); pile.position.set(PX+s*(BW/2-0.1),-0.1,z); lfb.add(pile); } } }
    // 湖邊植物：靠岸的睡蓮葉（平貼水面）、北岸與東西兩側岸上的樹叢、樹
    { const bin=new TK.Bin(); const pad=TK.paint('#5a8a48',{side:THREE.DoubleSide,roughness:0.55}); const pad2=TK.paint('#6f9a52',{side:THREE.DoubleSide,roughness:0.55}); const R=(k)=>{ const v=Math.sin(k*12.9898)*43758.5453; return v-Math.floor(v); };
      for(let i=0;i<N;i++){ const p=P[i], n=NR[i]; if(p[1]>cz+1.5) continue; if(R(i)<0.45) continue; const m=3+((R(i+7)*4)|0); for(let k=0;k<m;k++){ const d=0.8+R(i*3+k)*2.8, sd=(R(i*5+k)-0.5)*2.0; const x=p[0]-n[0]*d+n[1]*sd, z=p[1]-n[1]*d-n[0]*sd; const rr=0.3+R(i*7+k)*0.3; const gpad=new THREE.CircleGeometry(rr,10,0.4,Math.PI*2-0.5); bin.add(R(i+k)<0.5?pad:pad2,gpad,x,0.045,z,R(i*11+k)*6.28,{rx:-Math.PI/2,noShadow:true}); } }
      for(let i=0;i<N;i+=2){ const p=P[i], n=NR[i]; if(p[1]>cz+1) continue; if(R(i+3)<0.35) continue; TK.plantClump(bin,p[0]+n[0]*(1.6+R(i)*0.8),0,p[1]+n[1]*(1.6+R(i)*0.8),1.1+R(i+1)*0.6,6,[0.75,0.95,0.7]); }
      const grp=new THREE.Group(); bin.build(grp); g.add(grp); }
    for(const [x,z,s] of [[cx-21,cz-4,1.25],[cx-19,cz+8.5,1.0],[cx+20,cz-5,1.2],[cx+19.5,cz+8,1.0],[cx-10,cz-13,1.15],[cx+7.5,cz-13,1.3],[cx-1,cz-14,1.0]]){ const t=TK.tree(7.5*s,Math.abs(x*7+z*3)|0); place(g,t,x,z,(x+z)*0.37); nav.blockCircle(x,z,0.6); }
    // 南岸步道旁：面向湖的長椅、路燈
    { const bz=cz+12.1, lz=cz+17.4; for(const x of [cx-11,cx+7]){ const b=BENCH(); place(g,b,x,bz,Math.PI); nav.blockRect(x,bz,1.4,0.7,0); seats.push({x,z:bz-0.06,yaw:Math.PI,label:'坐在醉月湖畔的長椅'}); }
      for(const x of [cx-16,cx+12]){ const l=W3.lampPost(); place(g,l,x,lz,Math.PI); lamps.push(l); nav.blockCircle(x,lz,0.5); } }
    return {mat:wmat,fb:lfb,cx,cz};
  }
  /* 醉月湖的正式模型（LAWWW2 tools/blender/env_second/campus_lake.py → campus_lake.glb，湖的本地座標＝原點在湖中心）：石砌湖岸、置石、湖心亭、2.3 m 寬的木棧道。
     亭子屋頂、橫梁加「樹幹透視」（鏡頭在亭子外面、人在亭子裡時網點透空）；湖岸、置石不投影。導航不變（lake() 裡已經照正式模型：亭子 2.0 m＋擋柱子、地板 0.05）*/
  function attachLakeGLB(E,g,lakeU,m){ m.name='campus_lake_glb'; m.position.set(lakeU.cx,0,lakeU.cz);
    m.traverse(o=>{ if(!o.isMesh) return; const nm=o.name+'|'+((o.material&&o.material.name)||''); o.receiveShadow=true; o.castShadow=!/lake_rim|lake_rocks/.test(nm);   /* 網格名（Blender 物件名）：lake_rim_stone、lake_rocks_rock、lake_pavilion_*、lake_boardwalk_* */
      if(/lake_pavilion_(tile|soffit|gold|teal|red)/.test(nm)&&E.patchSeeThrough){ o.material.userData.seeThrough=true; E.patchSeeThrough(o.material); } });
    g.add(m); if(lakeU.fb) lakeU.fb.visible=false; }
  function updateLake(L,E){ if(!L||!E.sky) return; const U=L.mat.uniforms, S=E.sky.material.uniforms; U.time.value=E.time||0; U.skyLo.value.copy(S.bot.value).lerp(S.mid.value,0.25); U.skyHi.value.copy(S.mid.value).lerp(S.top.value,0.5); U.sunDir.value.copy(S.sunDir.value); U.sunCol.value.copy(E.sun.color).multiplyScalar(Math.min(1.6,E.sun.intensity)); }
  function glowTex(){ return W3.canvasTex('glow',64,64,(x,w,h)=>{ const g=x.createRadialGradient(32,32,2,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.4,'rgba(255,255,255,0.35)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,w,h); }); }
  // ---------- 公館商圈 ----------
  const gongguan={ id:'gongguan', name:'公館', indoor:false, cityLight:1.0, size:[160,110], camDist:6.5, sunYaw:Math.PI/2, build(E){   /* sunYaw：公館的區域座標 +x 往南、+z 往西（羅斯福路南北向、校門在東邊；和校園的換算見 campusBackdrop），太陽方向要轉 90° */
    treeIdx=0; leafyCount=0; const g=new THREE.Group(); const W=160,D=110; const nav=new E3.NavGrid(W,D,0.5,-W/2,-D/2); const lamps=[]; const buildings=[];
    ground(g,W,D,W3.asphaltTex(),[W/6,D/6],0,0,0);
    // 人行道（北側靠校門）與騎樓街區
    ground(g,W,14,W3.stoneTex('#dcd5c8'),[40,4],0,-38,0.02); ground(g,W,16,W3.stoneTex('#dcd5c8'),[40,4],0,12,0.02); ground(g,W,40,W3.stoneTex('#d9d3c6'),[40,10],0,40,0.02);
    // 羅斯福路：車道線
    { const line=W3.canvasTex('lane',64,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(255,255,255,0.85)'; x.fillRect(28,0,8,120); }); for(const z of [-25,-19,-8,-2]){ const t=line.clone(); t.needsUpdate=true; t.repeat.set(1,40); const m=new THREE.Mesh(new THREE.PlaneGeometry(0.4,W),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:0.8})); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(0,0.03,z); m.receiveShadow=true; g.add(m); } /* 路中間的黃色雙實線（路面 z -31..4）*/ for(const z of [-13.65,-13.35]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(W,0.14),new THREE.MeshStandardMaterial({color:0xd9a93a,roughness:0.8})); m.rotation.x=-Math.PI/2; m.position.set(0,0.03,z); m.receiveShadow=true; g.add(m); } /* 車道線改成受光材質：晚上不會像螢光一樣亮 */ }
    // 校門（北側牆中央）——回校園
    // v9.3 第十四批：和校園同一座校門（CK.gate），校外朝南；門房在圍牆裡面（舊版的門房在校外人行道上，而且沒有碰撞）
    const gate=CK.gate(); placeGate(E,g,nav,gate,0,-46,0); { const wb=new TK.Bin(); const wt=campusWallMat(); for(const s of [-1,1]){ wb.add(wt,TK.boxG(70,1.8,1,1.0),s*44,0.9,-46); wb.add(TK.paint('#d9d3c6'),TK.boxG(70.2,0.14,1.2),s*44,1.87,-46); nav.blockRect(s*44,-46,70,1.2,0,0.3); } wb.build(g); }   /* 第二十批：和校園那邊同一個面磚材質（原本的磚紋貼圖被拉長成條紋）*/
    // 捷運公館站出口：人行道上順著街的玻璃亭（TK.mrtExit；原本是 W3 的四柱雨棚），入口朝東，入口外面是互動點
    { const mrt=TK.mrtExit({name:'捷運 公館站',sub:'出口 2'}); mrt.position.set(-36.6,0,11); mrt.rotation.y=Math.PI/2; g.add(mrt); nav.blockRect(-39.8,11,6.6,3.6,0,0);
      /* 正式模型（LAWWW2-C tools/blender/env_second/gg_mrt_exit.py → bldg.gongguan_mrt，ART-EXT-MRT 2026-10-18）：同一個位置、方向；載入後藏起套件。
         裡面的電扶梯、樓梯往地面以下走（PIT_*）：先畫 PIT_*（renderOrder −2），再畫洞口的深度遮罩 PITMASK（只寫深度，−1），之後畫的地面在洞口那一塊畫不上去——區域的地面不用挖洞 */
      if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.gongguan_mrt']){ mrt.userData.ggMrt=true; mrt.userData.dyn=true;
        ASSETS.loadOne('bldg.gongguan_mrt').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true); root.position.copy(mrt.position); root.rotation.copy(mrt.rotation);
          attachWenzhouModel(E,g,root,'ggMrt','gongguan_mrt_glb');
          root.traverse(o=>{ if(!o.isMesh) return; if(/^PIT_/.test(o.name)){ o.renderOrder=-2; o.castShadow=false; } if(o.name==='PITMASK'){ o.material=new THREE.MeshBasicMaterial({colorWrite:false,side:THREE.DoubleSide}); o.renderOrder=-1; o.castShadow=false; o.receiveShadow=false; } }); }).catch(e=>console.warn('捷運出口正式模型載入失敗，用套件',e)); }
      const m=new THREE.Mesh(new THREE.BoxGeometry(6.4,3.4,3.4),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(-39.8,1.7,11); g.add(m); E.colliders.push(m);
      E.interactables.push({x:-35.6,z:11,radius:2.4,label:'捷運公館站入口',mrt:true}); }
    // 店面街（南側）：連續騎樓的台北街屋（TK.apartment；v9.3 第十一批取代 LEVEL_BLOCKOUT 方盒＋另外搭的柱子與招牌）
    /* 立面在 z=19、面向羅斯福路（人行道 z 4–19）；騎樓 3 m 深、整排連續可以走（柱子落在店與店的分界），店面玻璃在 z=22。
       舊版店面在 z=52，和馬路之間隔著 30 m 空蕩蕩的鋪面廣場（LEVEL_BLOCKOUT 留下的），整個南側往北搬 30 m：店面、互動點、立牌、捷運入口、圓環、往溫州街的出口、
       從麵店／書店／便利商店出來的位置、路人路線（story3d.js）一起搬。各店的 x 位置不變；舊版店與店之間 1.2 m 的縫併進左邊那間；x=15.6 以東補上沒有互動的店面，整排店接到街尾。 */
    const addCol=(x,z,w,d,y0,y1)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,y1-y0,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x,(y0+y1)/2,z); g.add(m); E.colliders.push(m); };
    const shops=[{n:'阿鳳麵店',c:'#c9463d',w:10,type:'noodle',it:'noodle',sub:'乾麵・餛飩湯・小菜',v:'阿鳳麵店'},{n:'清葉茶行',c:'#2f7d5b',w:8,type:'tea',it:'tea',sub:'手搖飲・現煮珍珠'},{n:'舊路書房',c:'#3b5a8c',w:12,type:'book',it:'books',sub:'法律書・文具・二手書',v:'舊路書房'},{n:'日日便利',c:'#3a6fb0',w:10,type:'cvs',it:'cvs',band:'#e0a030'},
      {n:'公館藥局',c:'#4a9a6a',w:8,type:'none',it:'cvs',v:'藥局'},{n:'滷味・鹹酥雞',c:'#e0b24a',sc:'#3b2a1e',w:8,type:'none',it:'luwei'},{n:'輪轉單車',c:'#b5532c',w:9,type:'bike',it:'bike',sub:'修車・打氣・配件加裝',v:'單車'},{n:'咖啡・輕食',c:'#8c3b47',w:9,type:'none',it:'cafe'},
      {n:'水果行',c:'#e0a030',sc:'#3b2a1e',w:8,type:'none',it:'fruit'},{n:'自助洗衣',c:'#4a90c2',w:9,type:'none',it:'laundry'},{n:'影印・輸出',c:'#2f3a44',w:9,type:'none',it:'print',v:'影印'},{n:'日日定食',c:'#5c3a21',w:10,type:'none',it:'teishoku',v:'定食'},{n:'二手唱片',c:'#2b2b2b',w:8,type:'none',it:'books'},{n:'文具・畫材',c:'#8c3b47',w:9,type:'none',it:'books'},{n:'早午餐',c:'#c9463d',w:9,type:'none',it:'cafe'}];
    const FZ=19, GH=4.2, ARC=3.0, SHOPD=16, WALLC=['#d9cbb0','#cfc5b2','#e3ddd0','#c8bca8','#d6c3a5','#e6dfd0','#bfb2a0'], WALLT=['tile','mosaic','tile','plaster'];
    /* 店面街 15 棟＋巷口轉角（userData.ggShop＝棟號 G00–G15）：有 Blender 正式模型（bldg.gongguan_shops，第二個 AI：tools/blender/env_second/wz_street.py --set gongguan）時不參加整區靜態合併，
       模型載入後把套件外觀藏起來；?nobldg 或載入失敗時照舊是套件。導航阻擋、鏡頭碰撞、柱子、互動點都不變（照套件算） */
    const ggGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.gongguan_shops']; const ggTag=(b,id)=>{ b.userData.ggShop=id; if(ggGLB) b.userData.dyn=true; };
    let x=-68; shops.forEach((s,i)=>{ const last=i===shops.length-1; const X0=x, X1=x+s.w+(i<8&&!last?1.2:0), W=X1-X0, cx=(X0+X1)/2;
      // 柱子（TK 區域座標；建築轉 180°，區域 +x＝世界西側）：西邊分界一根；沒有互動的寬店面中間再一根（有互動的店門口前面不放柱子）；最後一間另加東邊盡頭
      const pl=[W/2]; const nb=s.type==='none'?Math.max(1,Math.round(W/5)):1; for(let k=1;k<nb;k++) pl.push(W/2-k*W/nb); if(last) pl.push(-W/2);
      const b=TK.apartment({w:W,d:SHOPD,floors:4+((i*5)%4),fh:3.1,groundH:GH,wall:WALLT[i%4],color:WALLC[i%7],balcony:i%3===1,tank:i%2===0,roofAdd:i%5===3,ground:{type:'arcade',through:true,pillars:pl,shop:{type:s.it,name:s.n,sub:s.sub,signBg:s.c,signColor:s.sc||'#ffffff',band:s.band,vertical:s.v,vBg:'#ffffff',vColor:s.c,vBand:s.c}}});
      b.position.set(cx,0,FZ); b.rotation.y=Math.PI; g.add(b); buildings.push(b); ggTag(b,'G'+String(i).padStart(2,'0'));
      for(const lx of pl) nav.blockRect(cx-lx,FZ+0.3,0.55,0.55,0,0.1);
      // 鏡頭碰撞：店面玻璃後面的本體＋騎樓上方的樓層（在騎樓裡鏡頭不會被拉到臉前面，也不會穿到樓上）
      addCol(cx,FZ+ARC+0.3+(SHOPD-ARC-0.3)/2,W,SHOPD-ARC-0.3,0,b.userData.h+1); addCol(cx,FZ+(ARC+0.3)/2,W,ARC+0.3,GH-0.35,b.userData.h+1);
      const ix=x+s.w/2;
      if(s.type==='noodle') E.interactables.push({x:ix,z:FZ+2,radius:2.2,label:'進入阿鳳麵店',exit:{to:'noodle',spawn:{x:0,z:3.4,yaw:Math.PI}}});
      if(s.type==='tea') E.interactables.push({x:ix,z:FZ+2,radius:2.2,label:'買一杯飲料',shop:'tea'});
      if(s.type==='book') E.interactables.push({x:ix,z:FZ+2,radius:2.2,label:'進入舊路書房',exit:{to:'bookstore',spawn:{x:0,z:4,yaw:Math.PI}}});
      if(s.type==='cvs') E.interactables.push({x:ix,z:FZ+2,radius:2.2,label:'進入便利商店',exit:{to:'cvs',spawn:{x:0,z:3.4,yaw:Math.PI}}});
      x=X1; });
    /* 輪轉單車（G06，正對校門；LAWWW2-B 2026-10-16，原本是「眼鏡・手機維修」）：店名虛構（D77）。街景——載妹墊開局就有（使用者 10-16，D78），不用在這裡裝、沒有互動點。
       騎樓靠櫥窗停三台（和店面平行，騎樓還有 1.6 m 寬可以走；店門口 x −2.1～1.7 不放車）、櫥窗裡兩台、騎樓外一塊立牌。
       店門口互動點「找車行老闆」（−0.3, FZ+2，r 2.2，和麵店、茶行、書店、便利商店同一排同一個距離；LAWWW2-B 10-23，順手的事 SQ16（AA_405）要用）：
       shop:'bike'——story3d.js 的互動照 SIDEQ.bikeShop(GM) 演（車行老闆的招呼、SQ16）；SIDEQ 沒有 bikeShop 的版本不顯示（不出一個按了沒反應的按鈕）*/
    { const sx=0.3; for(const [dx,c,k] of [[-3.3,'#2f5d50','bike_road'],[2.3,'#e0b95b','bike_city'],[4.2,'#8c3b47','bike_mtb']]){ const b=W3.bikeAny(c,0,k);   /* 腳踏車行（輪轉單車）：騎樓擺公路車、淑女車、登山車 */ b.position.set(sx+dx,0,FZ+2.55); b.rotation.y=Math.PI/2; g.add(b); nav.blockRect(sx+dx,FZ+2.55,k==='bike_mtb'?1.85:1.75,0.6,0); }
      for(const [dx,c,k] of [[-2.2,'#3a6fb0','bike_fold'],[1.6,'#d9d3c6','bike_road']]){ const b=W3.bikeAny(c,0,k);   /* 櫥窗：小折、公路車 */ b.position.set(sx+dx,0.155,FZ+3.75); b.rotation.y=-Math.PI/2; g.add(b); }
      E.interactables.push({x:sx-0.6,z:FZ+2,radius:2.2,label:'找車行老闆',shop:'bike',get hidden(){ return !(typeof SIDEQ!=='undefined'&&SIDEQ.bikeShop); }});
      /* SQ16 做完的痕跡（AA_405）：騎樓那台淑女車的籃子掛一張紙「免費借給新生，一學期」（朝騎樓走道）；SIDEQ.traceOn(G,'SQ16') 才顯示 */
      { const note=new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.05),new THREE.MeshStandardMaterial({map:TK.signTex('免費借給新生・一學期',{bg:'#f6f1e4',color:'#3a332c',size:46,border:'#c9b89a'}),roughness:0.85,side:THREE.DoubleSide}));
        note.position.set(sx+2.3+0.55,0.84,FZ+2.55-0.2); note.rotation.set(-0.12,Math.PI,0.05); note.name='TRACE_SQ16_note'; note.userData.dyn=true; traceVis(note,'SQ16'); g.add(note); }   /* dyn：不參加整區合併（每一格看要不要顯示）*/
      const ab=TK.aBoard(['打氣免費','修車・換胎','後座墊加裝']); ab.position.set(2.6,0,FZ-0.6); ab.rotation.y=Math.PI; g.add(ab); nav.blockCircle(2.6,FZ-0.6,0.35); }
    // 往溫州街的巷口（店面街西端）：麵店西邊留 6 m 寬的巷子（x −74～−68）往南，巷口對面是轉角公寓（一般店面、沒有騎樓）；巷口有路名牌和反光鏡。
    /* 原本「往溫州街」只是區域邊上地面的互動點，旁邊什麼都沒有 */
    { const cb=TK.apartment({w:14,d:SHOPD,floors:5,fh:3.1,groundH:GH,wall:'tile',color:'#cdbfa8',balcony:true,tank:true,ground:{type:'shop',shop:{type:'teishoku',name:'豆花・甜湯',sub:'粉圓・芋圓・紅豆',signBg:'#f4ead8',signColor:'#5c3a21',band:'#c9a24a'}}}); cb.position.set(-81,0,FZ); cb.rotation.y=Math.PI; g.add(cb); buildings.push(cb); ggTag(cb,'G15');
      nav.blockRect(-81,FZ+SHOPD/2,14.2,SHOPD+0.2,0,0); addCol(-81,FZ+SHOPD/2,14,SHOPD,0,cb.userData.h+1);
      const lane=new THREE.Mesh(new THREE.PlaneGeometry(6,36),new THREE.MeshStandardMaterial({map:(()=>{ const t=W3.asphaltTex().clone(); t.needsUpdate=true; t.repeat.set(1,6); return t; })(),roughness:0.95})); lane.rotation.x=-Math.PI/2; lane.position.set(-71,0.028,FZ+18); lane.receiveShadow=true; g.add(lane);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,3.0,8),M('#7d8288')); pole.position.set(-73.7,1.5,FZ-0.5); g.add(pole); nav.blockCircle(-73.7,FZ-0.5,0.2);
      const st=TK.signTex('溫州街',{bg:'#2f6b4f',color:'#ffffff',size:80}); for(const ry of [0,Math.PI]){ const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.1,0.3),new THREE.MeshStandardMaterial({map:st,roughness:0.6})); sg.position.set(-73.7,2.85,FZ-1.05); sg.rotation.y=ry+Math.PI/2; g.add(sg); }   /* 路名牌掛在柱子靠馬路那一側，沿人行道走的人看得到 */
      const mir=TK.trafficMirror(); mir.position.set(-68.35,0,FZ-0.5); mir.rotation.y=-2.4; g.add(mir); nav.blockCircle(-68.35,FZ-0.5,0.2); }
    // 騎樓外的立牌（店門口前面、騎樓柱子外側；不擋騎樓，也不擋從店裡出來的位置）
    for(const [ax,ls] of [[-66.2,['今日小菜','滷豆干・海帶','餛飩湯 70']],[-49.8,['本日推薦','冬瓜檸檬','大杯 45']],[-45.4,['二手法律書','教科書收購','國考用書']]]){ const ab=TK.aBoard(ls); ab.position.set(ax,0,FZ-0.6); ab.rotation.y=Math.PI; g.add(ab); nav.blockCircle(ax,FZ-0.6,0.35); }
    // 校門北側是校園：從公館看回校門，看得到椰林大道（柏油路面、黃色虛線、兩側很高的大王椰子與大樹牆）、農業陳列館、校史館、文學院、行政大樓
    // v9.3 第二十批：位置全部照校園區域換算（校園 (cx,cz) → 公館 (gx=cz, gz=-170-cx)；校園的朝向 ry → 公館 ry+π/2），和校園那邊看出來的公館背景是同一套對應；
    // 原本只有洞洞館、14 棵舊尺寸的椰子樹，地面到 z=-55 就結束（從校門往裡看、越過圍牆看都是一片空白）。走不到，不加導航
    /* 舊版這裡是兩間「台大書局／公館小吃」方盒，但位置在校門圍牆裡面（校園內），不合理，拿掉 */
    { const hole=CK.pavilion({w:22,d:14,gfh:4.0,h:9,sign:'農業陳列館'}); place(g,hole,-30,-66,Math.PI/2);
      const H=(a,b)=>{ const v=Math.sin(a*12.9898+b*78.233)*43758.5453; return v-Math.floor(v); };
      // 地面：城市柏油打底、圍牆北側是校園草地、椰林大道（石磚人行道＋12 m 柏油路面）
      ground(g,700,700,W3.asphaltTex(),[140,140],0,-100,-0.06);
      ground(g,292,254,W3.grassTex(),[73,64],4.5,-173,-0.035); ground(g,160,8.4,W3.grassTex(),[40,2],0,-50.8,0.004);
      strip(g,0,-46.6,0,-242,16,W3.pathTex(),4);
      { const rt=avenueRoadTex().clone(); rt.needsUpdate=true; rt.repeat.set(1,196/9); const road=new THREE.Mesh(new THREE.PlaneGeometry(12,196),texMat(rt,null,{roughness:0.9})); road.rotation.x=-Math.PI/2; road.position.set(0,0.024,-144); road.receiveShadow=true; g.add(road); }
      // 大王椰子（和校園同一個高度公式，約 20 m）、椰子樹後面的大樹牆、大道南側西段的樹林——合併
      const trees=new THREE.Group(); let pi=0;
      for(let gz=-60;gz>=-190;gz-=7.5) for(const sx of [-1,1]){ pi++; const cx=-170-gz; const p=TK.royalPalm((14.5+((cx*7)%3)*0.8)*1.35,pi,{crown:0.66}); p.position.set(sx*9.5,0,gz); p.rotation.y=(cx*0.3)%6.28; trees.add(p); }
      for(let gz=-62;gz>=-190;gz-=6) for(const sx of [-1,1]){ if(H(gz,sx)<0.15) continue; const t=TK.tree(6.4*(1.75+H(sx,gz)*0.4),Math.round(-gz)+(sx>0?50:0),AVE_TREE); t.position.set(sx*(17.5+H(gz,7)*1.5),0,gz+H(7,gz)*2); t.rotation.y=gz*1.3; trees.add(t); }
      for(const [tx,tz] of [[36,-66],[41,-80],[38,-94],[16,-70],[26,-58],[24,-74],[31,-88],[24,-102],[-62,-53],[-50,-55],[-14,-54],[22,-53],[52,-53],[66,-55]]){ const t=TK.tree(6.4*(1.0+((Math.abs(tx)*13)%3)*0.1)); t.position.set(tx,0,tz); trees.add(t); }
      const tm=W3.mergeGroup(trees); tm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); g.add(tm);
      // 校園建築（遠景方盒，和校園那邊的外觀同色、同尺寸）：校史館、文學院、行政大樓、舟山路西段南側系館、大道東邊的兩棟
      g.add(TK.bgCity([{x:-21,z:-93,w:24,d:16,floors:2,gh:5.0,ry:Math.PI/2,color:'#a25d43',shop:false},{x:-25,z:-132,w:40,d:18,floors:2,gh:4.8,ry:Math.PI/2,color:'#9b5a42',shop:false},
        {x:25,z:-132,w:46,d:16,floors:3,ry:-Math.PI/2,color:'#cdb48e',shop:false},{x:59.5,z:-78,w:34,d:13,floors:4,ry:-Math.PI/2,color:'#c4b29a',roof:'flat',shop:false},
        {x:-21,z:-177,w:26,d:14,floors:3,ry:Math.PI/2,color:'#c8a27c',shop:false},{x:26,z:-172,w:24,d:14,floors:3,ry:-Math.PI/2,color:'#9b5a42',shop:false}],{style:'campus'}));
      // 校園圍牆往東西延長（公館區域本身只到 x=±80）
      const wb=new TK.Bin(); const wt=campusWallMat(); for(const [a,b] of [[-141,-79],[79,150]]){ wb.add(wt,TK.boxG(b-a,1.8,1,1.0),(a+b)/2,0.9,-46); wb.add(TK.paint('#d9d3c6'),TK.boxG(b-a+0.2,0.14,1.2),(a+b)/2,1.87,-46); } wb.build(g);
      // 沿著羅斯福路往東西延伸：人行道、車道線、南側騎樓街屋（和校園背景的那一排是同一套寬度與樓層）、後面一排較高的大樓、路燈、行道樹
      const stoneT=W3.stoneTex('#dcd5c8'); for(const sx of [-1,1]){ ground(g,150,14,stoneT,[37,3.5],sx*155,-38,0.012); ground(g,150,16,stoneT,[37,4],sx*155,12,0.012); }
      { const lt=W3.canvasTex('laneFull',8,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(255,255,255,0.85)'; x.fillRect(0,0,w,120); }).clone(); lt.needsUpdate=true; lt.repeat.set(1,37); const lm=new THREE.MeshStandardMaterial({map:lt,transparent:true,roughness:0.8}); const lg=new THREE.Group();
        for(const sx of [-1,1]) for(const lz of [-25,-19,-8,-2]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(0.15,150),lm); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(sx*155,0.018,lz); lg.add(m); } g.add(W3.mergeGroup(lg)); }
      const WALLC=['#d9cbb0','#cfc5b2','#e3ddd0','#c8bca8','#d6c3a5','#e6dfd0','#bfb2a0'], TALLC=['#a9a49a','#b9b4aa','#9fa3a6','#b5a48f','#c4bcae','#8f8b84','#a8968a'];
      const city=[]; for(let z=77.6;z<230;){ const w=8+Math.round(H(z,1)*5); city.push({x:z+w/2,z:19,w,d:16,floors:4+Math.floor(H(z,2)*4),gh:4.2,ry:Math.PI,color:WALLC[Math.floor(H(z,3)*7)]}); z+=w; }
      for(let z=-88;z>-230;){ const w=8+Math.round(H(z,1)*5); city.push({x:z-w/2,z:19,w,d:16,floors:4+Math.floor(H(z,2)*4),gh:4.2,ry:Math.PI,color:WALLC[Math.floor(H(z,3)*7)]}); z-=w; }
      for(let z=-140;z<230;){ const w=14+Math.round(H(z,4)*8); city.push({x:z+w/2,z:42,w,d:18,floors:6+Math.floor(H(z,5)*8),gh:4.2,ry:Math.PI,color:TALLC[Math.floor(H(z,6)*7)],shop:false}); z+=w+2+Math.floor(H(z,19)*3)*3; }
      for(let z=-142;z>-230;){ const w=14+Math.round(H(z,4)*8); city.push({x:z-w/2,z:42,w,d:18,floors:6+Math.floor(H(z,5)*8),gh:4.2,ry:Math.PI,color:TALLC[Math.floor(H(z,6)*7)],shop:false}); z-=w+2+Math.floor(H(z,19)*3)*3; }   // 店面街後面一排較高的大樓（從店面街看得到樓頂後面）
      /* 遠景（使用者 10-20 X86）：正式模型 bldg.gongguan_far（LAWWW2-C gg_backdrop.py --zone gongguan；公館區域座標、放在原點）＝這兩排＋水源市場、天橋、捷運出口前的 GONGGUAN 字樣、區域裡 15 棟店面的大看板；
         方盒是載入前、載入失敗的備用（dyn：不參加整區靜態合併，載入後藏起來）；不投影；窗、店面、招牌晚上會亮 */
      { const farFB=new THREE.Group(); farFB.name='gongguanFarFallback'; farFB.userData.dyn=true; farFB.add(TK.bgCity(city,{style:'city'}));
        const pl=new THREE.Mesh(new THREE.BoxGeometry(7.0,0.55,0.8),M('#f4f4f0')); pl.position.set(-30,0.275,15.1); farFB.add(pl);   /* GONGGUAN 的花台（模型載入前看得到擋住的是什麼） */
        g.add(farFB);
        if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.gongguan_far']) ASSETS.loadOne('bldg.gongguan_far').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true);
            r.traverse(o=>{ if(!o.isMesh) return; o.castShadow=false; o.receiveShadow=false; o.userData.dyn=true; const m=o.material, nm=(m&&m.name)||'';
              if(/gg_bd_facade/.test(nm)) TK.addNight(m,0.85,0); else if(/gg_bd_shopfront/.test(nm)) TK.addNight(m,1.0,0.3); else if(/gg_bd_signs/.test(nm)) TK.addNight(m,1.0,0.15); });
            g.add(r); farFB.visible=false; zone.gongguanFar=true; }).catch(e=>console.warn('公館遠景正式模型載入失敗，用方盒',e)); }
      const props=new THREE.Group(); for(const sx of [-1,1]) for(let k=0;k<7;k++){ const gx=sx*(99+k*18); const a=W3.lampPost(); a.position.set(gx,0,-31.4); props.add(a); const b=W3.lampPost(); b.position.set(gx,0,5); b.rotation.y=Math.PI; props.add(b); if(k%2===0){ const t=TK.tree(6.4*0.9); t.position.set(gx+4,0,-36); props.add(t); } }
      const pm=W3.mergeGroup(props); pm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); g.add(pm); }
    // 機車、路燈、行道樹
    // 機車（townkit，和溫州街同一套）：人行道邊三台一排；校門正前方只停一台，留出走路的空間
    const scC=['#e8e8e8','#2b2b2b','#8c3b47','#3a6fb0','#c9b48a','#f2f0ea','#5a5a7a'];
    /* 機車的 Blender 正式模型（bldg.wz_scooter，和溫州街同兩款；第二個 AI，LAWWW 03:47Z ⑧）：有模型時套件機車先放進 ggScG、自己合併（載入前 draw call 少），
       模型載入後整組藏起來、換成 InstancedMesh——**分組**（grp：北側 5 組、南側 3 組，每組 6～9 台）：InstancedMesh 是整組一起剔除的，60 台一組的話不管看不看得到都整組畫，
       同鏡頭三角形會超過 42 萬（2026-10-11 量過）；分組之後看不到的那一組整組不畫。?nobldg、載入失敗照舊是套件 */
    const ggScGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.wz_scooter']; const ggScG=new THREE.Group(); ggScG.userData.dyn=true; ggScG.name='gg_kit_scooters'; const ggScList=[]; if(ggScGLB) g.add(ggScG);
    let scIdx=0;   /* 車殼顏色依序輪流用 7 種（原本 scC[((k*3+Math.round(xc*7))%7+7)%7]：每排的 x 都是整數，round(x*7)%7 永遠是 0，整條街只有白、藍、灰藍 3 種）*/
    const scRow=(xc,z,n,ry,grp)=>{ for(let k=0;k<n;k++){ const c=scC[(scIdx++*5+3)%7], s=TK.scooter(c); s.position.set(xc+(k-(n-1)/2)*0.85,0,z+((k*7)%3-1)*0.06); s.rotation.y=ry+((k*5)%3-1)*0.05; s.userData.ggScooter=grp; if(ggScGLB){ ggScG.add(s); ggScList.push({o:s,color:c,grp}); } else g.add(s); } nav.blockRect(xc,z-0.04,n*0.85+0.5,1.7,0); };
    for(let i=0;i<14;i++){ const x=-70+i*10; scRow(x,-32,Math.abs(x)<12?1:3,0,'N'+(x<-55?0:x<-35?1:x<5?2:x<35?3:4)); }
    for(let i=0;i<8;i++){ const x=-60+i*14; scRow(x,6.8,3,Math.PI,'S'+(x<-40?0:x<0?1:2)); }
    /* 騎樓外、人行道上的生活感（ART-GG-STREETLIFE-1023，LAWWW2-B 10-23；使用者「店面外看出去的景也都很假」：從店裡、從騎樓往外看是一大片空的鋪面廣場）。
       ① 騎樓柱子外一排機車（車頭朝騎樓，z 17.35～18.95；臺北的騎樓前就是一整排機車）：路人沿 z 16.5 走（story3d.js walkRoutes）不擋；
          有互動的店門口（麵店、茶行、書店、便利商店、輪轉單車）前後各留 2.6 m、往溫州街的巷口不停車；機車一段跨一根柱子，隔一根柱子留缺口，從廣場走得進騎樓。
       ② 捷運出口東邊、圓環東邊各一個腳踏車停車架（和校園同一套 W3.bikeRack：整排合成一塊）。
       ③ 人行道上一排行道樹（樹穴＋矮緣石），避開路人的斜線（(−40,14.5)→(0,10)→(40,14)）和路邊的機車。
       導航阻擋在套件階段就加（機車、車架、樹本來就是套件畫的，正式模型只換機車的外觀）。測試：tests/gongguan_layout_nav.py、tests/reachability_all.py（公館）、node tests/street_props_nav_unit.js */
    { const DOORS=[-63,-52.8,-41.6,-29.4,-0.3], clear=x=>DOORS.every(d=>Math.abs(x-d)>2.6)&&x>-66; let seg=0;
      for(const [x0,x1] of [[-59.8,-55.8],[-49.6,-44.6],[-38.4,-32.6],[-25.2,-21.2],[-16,-12],[-6.8,-3],[3,7.4],[13.6,17.6],[21.6,25.6],[30.6,34.6],[39.6,43.6],[49.6,53.6],[57.6,61.6],[66.6,70.6]]){   /* 每一段跨在一根騎樓柱子前面，下一根柱子前面空著＝從廣場走進騎樓的缺口（柱子兩側各 2 m 多）*/
        const n=Math.min(5,Math.max(2,Math.floor((x1-x0-0.5)/0.85)+1)), xc=(x0+x1)/2; if(!clear(x0)||!clear(x1)) console.warn('騎樓前的機車擋到店門口',x0,x1); scRow(xc,18.15,n,0,'A'+(seg++)); } }   /* 一段一組：機車的近／遠模型照「鏡頭到這一組中心」切換（attachWzScooters 的 LOD），一組 30 m 寬時整組 20 台都用近的模型，三角形多 7～9 萬 */
    for(const [x,z,n] of [[-14.5,9.2,7],[34,9.2,8]]){ const r=W3.bikeRack(n); r.name='gg_bike_rack'; place(g,r,x,z,Math.PI); nav.blockRect(x,z,n*0.6+0.6,1.4,0); }   /* 停車架：車頭朝騎樓（π）、整排一塊 */
    { const pitM=new THREE.MeshStandardMaterial({color:0x3b332b,roughness:1}), curbM=new THREE.MeshStandardMaterial({color:0xa8a49c,roughness:0.85}), pit=new THREE.Group(); pit.name='gg_tree_pits';
      for(const [x,z] of [[-53,9.4],[-7,9.0],[7.5,9.0],[46,9.6],[58,9.6]]){ const t=TREE(0.95); t.name='gg_street_tree'; place(g,t,x,z,(x*0.37)%6.28); nav.blockCircle(x,z,0.7);
        const soil=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.3),pitM); soil.rotation.x=-Math.PI/2; soil.position.set(x,0.012,z); pit.add(soil);
        for(const [dx,dz,w,d] of [[0,-0.69,1.5,0.1],[0,0.69,1.5,0.1],[-0.69,0,0.1,1.3],[0.69,0,0.1,1.3]]){ const c=new THREE.Mesh(new THREE.BoxGeometry(w,0.08,d),curbM); c.position.set(x+dx,0.04,z+dz); c.receiveShadow=true; pit.add(c); } }   /* 樹穴：黑土＋一圈矮緣石（整區合併時併成兩塊）*/
      g.add(pit); }
    for(let i=0;i<9;i++){ const l=W3.lampPost(); place(g,l,-63+i*18,-31.4,0); lamps.push(l); nav.blockCircle(-63+i*18,-31.4,0.5); /* 北側路燈原本在 z=-24（馬路的車道上），移到人行道邊 */ const l2=W3.lampPost(); place(g,l2,-63+i*18,5,Math.PI); lamps.push(l2); nav.blockCircle(-63+i*18,5,0.5); }
    for(let i=0;i<6;i++){ const t=TREE(0.9); place(g,t,-65+i*26,-36,0); nav.blockCircle(-65+i*26,-36,0.7); }
    nav.blockRect(-30,15.1,7.2,1.0,0); for(const fx of [-34.2,-25.8,-25.0]) nav.blockCircle(fx,15.1,0.25);   /* 捷運出口東邊的 GONGGUAN 花台、三朵藍色小花（bldg.gongguan_far；夾在路人 z 16.5、(−40,14.5)→(0,10) 兩條路線中間） */
    // 集合點：公館圓環意象（小廣場）
    { const c=new THREE.Mesh(new THREE.CylinderGeometry(3,3,0.3,24),M('#d9cbb0')); c.position.set(22,0.15,11.5); g.add(c); nav.blockCircle(22,11.5,3.2); const tree=TREE(1.2); place(g,tree,22,11.5,0); }
    // 通往溫州街（西側）
    E.interactables.push({x:-71,z:FZ+1.2,radius:2.6,label:'往溫州街',exit:{to:'wenzhou',spawn:{x:51.3,z:-9.8,yaw:0}}});
    nav.blockOutside(-78,-45,78,FZ+2.6); /* 南側騎樓（z 19–22，店面玻璃在 z=22）要可走，互動點在 z=21 */ for(let z=-2;z<=2;z+=0.5) for(let x=-78;x<=-74;x+=0.5){} for(let xq=-79;xq<=-74;xq+=0.5) for(let zq=9;zq<=15;zq+=0.5){ const [cx,cz]=nav.toCell(xq,zq); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    for(const lx of gate.userData.gate.lanes) for(let z=-50;z<=-44;z+=0.5) for(let xq=lx-2.1;xq<=lx+2.1;xq+=0.5){ const [cx,cz]=nav.toCell(xq,z); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }   /* 校門兩側通道（門房在正中間，2026-10-18 起；原本開的是開口正中間 x -4～4）*/
    placeBlocks(nav,gate,0,-46,0);   /* 開完通道再把門房、燈柱、鐵門擋回去 */
    for(const ex of gateExits(gate,0,-46,0,-1.5,2.5,{})) E.interactables.push({x:ex.x,z:ex.z,radius:ex.r,label:'回到校園',exit:{to:'campus',spawn:{x:-119,z:0,yaw:Math.PI/2}}});   /* 門房在校門正中間：兩側通道（校內那一側）各一個，(±5.27,-47.5)（2026-10-18；原本 (0,-48) r3，現在是門房）*/
    /* 店面街的鏡頭碰撞在上面逐間加（TK 建築的原點在立面上，不能用舊的 footprint 置中方盒）*/
    for(const l of lamps){ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd88a,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(3,3,1); glow.position.set(0,3.9,0.75); l.add(glow); glow.visible=false; E.lampGlows.push(glow); const pool=new THREE.Mesh(new THREE.CircleGeometry(4.2,16),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(0,0.03,0.75); l.add(pool); pool.visible=false; E.lampGlows.push(pool); }
    // 招牌、店內、窗戶的夜間亮度跟著時間漸變（和溫州街同一套：17:24 開始、19:12 全亮）
    const zoneTime=(h)=>{ let k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); TK.setNight(Math.max(0,Math.min(1,k))); };
    const zone={group:g,nav,spawn:{x:0,z:-30,yaw:Math.PI},lamps,buildings,applyTimeOutdoor:zoneTime,onLamps(on){}};
    // 店面街的 Blender 正式模型（第二個 AI）：載入後藏起套件外觀（和溫州街同一套接法；招牌、直立招牌合成一張 atlas，晚上照 TK.setNight 發光）；失敗或 ?nobldg 時維持套件
    gateGLB(E,g,gate,0,-46,0,zone);   /* 校門（ART-EXT-GATE）：和校園同一個模型 */
    if(ggGLB) ASSETS.loadOne('bldg.gongguan_shops').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ggShop','gongguan_shops_glb'); propBlocks(nav,GG_PROP_BLOCKS); }).catch(e=>console.warn('公館店面正式模型載入失敗，用套件的外觀',e));
    if(ggScGLB){ P3.mergeStatic(ggScG); ASSETS.loadOne('bldg.wz_scooter').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const n=attachWzScooters(g,ggScG,ggScList,c.scene,'gg_scooters_glb'); if(!n) console.warn('機車正式模型沒有 scooter_a／scooter_b，用套件的機車');
      g.traverse(o=>{ if(o.isLOD&&/^scooters_A\d+$/.test(o.name)) o.addLevel(new THREE.Object3D(),40); });   /* 騎樓前那一排（ART-GG-STREETLIFE-1023）：40 m 外不畫（一台 600 個三角形、40 多台；從廣場一端看過去多 3 萬多個三角形，那麼遠只看得到一個小點）*/ }).catch(e=>console.warn('機車正式模型載入失敗，用套件的機車',e)); }
    return zone; } };
  // ---------- 溫州街 ----------
  // ---------- 溫州街（v9 重建：台北巷弄＋日式宿舍；TK 街景套件）----------
  /* 座標：x 往東（公館方向）、主巷沿 x 軸，建築立面在 z=±5（巷寬 10m：柏油 7m＋兩側排水溝與停車帶）。
     東端路口正對「兩點半 Café」（v9.2 從西端搬來：門面朝西，傍晚夕陽沿著巷子照到店門口）；路口往南通往公館；北側小巷（死巷）、南側小巷（死巷）、小公園、騎樓、日式宿舍。
     所有建築與道具都同步登記 NavGrid 與鏡頭碰撞盒。 */
  function buildWenzhou(E){ treeIdx=0; leafyCount=0; const g=new THREE.Group(); const NAVX=-58, NAVZ=-30; const nav=new E3.NavGrid(118,60,0.5,NAVX,NAVZ); nav.b.fill(1);
    const open=(x0,z0,x1,z1)=>{ for(let cz=0;cz<nav.rows;cz++) for(let cx=0;cx<nav.cols;cx++){ const [wx,wz]=nav.toWorld(cx,cz); if(wx>=x0&&wx<=x1&&wz>=z0&&wz<=z1) nav.b[nav.idx(cx,cz)]=0; } };
    // 可走範圍：主巷、西側橫巷、北巷、南巷、小公園、騎樓、東端路口
    open(-36.8,-4.9,54.5,4.9); open(-36.8,-15,-30.2,15); open(3.3,4,8.2,20.5); open(-14.7,-19.5,-9.8,-4); open(20.3,4,31.7,14.6); open(16.4,-8.0,29.6,-4); open(48.2,-15,54.5,15);
    const lamps=[]; const buildings=[]; const colliders=[]; const lights=[]; const pools=[];
    const addCollider=(x,z,w,d,h,rot)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h||14,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x,(h||14)/2,z); m.rotation.y=rot||0; g.add(m); E.colliders.push(m); };
    // 地面：主巷柏油、橫巷、北巷、南巷、東端路口
    const roads=[TK.road(92,10,{manholes:[[-20,0.5],[14,-1.2],[38,0.8]],slow:[[-25,-1.8,Math.PI/2],[4,1.8,Math.PI/2]]}),TK.road(32,7),TK.road(17,5),TK.road(16,5),TK.road(32,8)];
    roads[0].position.set(9,0,0); roads[1].position.set(-33.4,0.002,0); roads[1].rotation.y=Math.PI/2; roads[2].position.set(5.75,0.003,12.5); roads[2].rotation.y=Math.PI/2; roads[3].position.set(-12.25,0.003,-12); roads[3].rotation.y=Math.PI/2; roads[4].position.set(51.3,0.002,0); roads[4].rotation.y=Math.PI/2; for(const r of roads) g.add(r);
    // 遠景地面（建築後面）
    { const m=new THREE.Mesh(new THREE.PlaneGeometry(220,160),TK.col('#6d6a64')); m.rotation.x=-Math.PI/2; m.position.y=-0.02; m.receiveShadow=true; g.add(m); }
    // ---- 建築：A 側（z>0，立面朝 -z）、B 側（z<0，立面朝 +z）----
    /* 主巷兩側的近景公寓（spec.wz＝棟號）：有 Blender 正式模型（bldg.wenzhou_street，第二個 AI）時不參加整區靜態合併，模型載入後才能把套件外觀藏起來；
       ?nobldg 或沒有模型時照舊合併（draw call 和以前一樣） */
    const wzGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.wenzhou_street']; const jpGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.wz_jphouse']; const prGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.wz_props']; const pkGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.wz_park'];
    const pkTag=o=>{ o.userData.wzPark=true; if(pkGLB) o.userData.dyn=true; return o; };   /* 小公園的地面、鋪面、路緣、樹圍座椅、單槓、名牌：Blender 正式模型（bldg.wz_park） */
    const prTag=(o,k)=>{ o.userData.wzProp=k; if(prGLB) o.userData.dyn=true; return o; };   /* 電線桿、反光鏡、路名牌、Café 門前紅磚道：Blender 正式模型（bldg.wz_props）載入後藏起套件外觀 */ const wzTag=(b,id)=>{ b.userData.wzApt=id; if(wzGLB) b.userData.dyn=true; };
    const aptA=(x0,x1,spec,setback)=>{ const w=x1-x0; const b=TK.apartment(Object.assign({w,d:12},spec)); b.position.set((x0+x1)/2,0,5+(setback||0)); b.rotation.y=Math.PI; g.add(b); buildings.push(b); if(spec.wz) wzTag(b,spec.wz); nav.blockRect((x0+x1)/2,5+(setback||0)+6,w,12,0,0); addCollider((x0+x1)/2,5+(setback||0)+6,w,12,b.userData.h+1); return b; };
    const aptB=(x0,x1,spec,setback)=>{ const w=x1-x0; const b=TK.apartment(Object.assign({w,d:12},spec)); b.position.set((x0+x1)/2,0,-5-(setback||0)); g.add(b); buildings.push(b); if(spec.wz) wzTag(b,spec.wz); const arc=spec.ground&&spec.ground.type==='arcade'?3:0; nav.blockRect((x0+x1)/2,-5-(setback||0)-6-arc/2,w,12-arc,0,0); addCollider((x0+x1)/2,-5-(setback||0)-6,w,12,b.userData.h+1); return b; };
    // A 側
    aptA(-12,-4,{wz:'A1',floors:4,wall:'tile',color:'#d9c9a8',ground:{type:'shop',shop:{type:'print',name:'阿德影印輸出',sub:'影印・裝訂・論文輸出',signBg:'#f4f1ea',signColor:'#1f4e8c',band:'#1f4e8c',vertical:'影印',vBg:'#ffffff',vColor:'#1f4e8c',vBand:'#1f4e8c'}}});
    aptA(-4,3.1,{wz:'A2',floors:5,wall:'mosaic',color:'#cfd8d0',ground:{type:'door',color:'#9c2f2a'}});
    aptA(8.4,20,{wz:'A3',floors:4,wall:'tile',color:'#c9b49a',balcony:true,ground:{type:'shop',shop:{type:'books',name:'巷口書房',sub:'二手書・人文社會・法律',signBg:'#2f4a3a',signColor:'#f4ead8',serif:true,awning:'#2f4a3a',vertical:'書',vBg:'#f4ead8',vColor:'#2f4a3a',vBand:'#2f4a3a'}}});
    aptA(32,40,{wz:'A4',floors:4,wall:'plaster',color:'#e8e1d4',ground:{type:'shop',shop:{type:'noodle',name:'林家乾麵',sub:'乾麵・餛飩・滷味',signBg:'#f4ead8',signColor:'#9c2f2a',vertical:'麵',vBg:'#ffffff',vColor:'#9c2f2a',vBand:'#9c2f2a',awning:'#9c2f2a'}}});
    aptA(40,48,{wz:'A5',floors:3,wall:'tile',color:'#b8a088',roofAdd:true,ground:{type:'shop',shop:{type:'cvs',name:'日日便利',sub:'24H',signBg:'#ffffff',signColor:'#1f6f78',band:'#e8a33a',frame:'#cfd6d6'}}});
    // B 側
    aptB(-30,-21,{wz:'B1',floors:3,wall:'plaster',color:'#d8d0c0',roofAdd:true,ground:{type:'shutter'}});
    aptB(-21,-15,{wz:'B2',floors:4,wall:'tile',color:'#bfb3a3',ground:{type:'shop',shop:{type:'laundry',name:'自助洗衣',sub:'24 小時・投幣式',signBg:'#e9f2f6',signColor:'#2a5f8a',frame:'#cfd6d6'}}});
    aptB(-9.6,4,{wz:'B3',floors:5,wall:'tile',color:'#d5c7b0',ground:{type:'shop',shop:{type:'teishoku',name:'巷子裡定食',sub:'日式家庭料理',signBg:'#1f2e45',signColor:'#f4ead8',serif:true,awning:'#1f2e45',vertical:'定食',vBg:'#f4ead8',vColor:'#1f2e45',vBand:'#1f2e45'}}});
    aptB(4,16,{wz:'B4',floors:4,wall:'mosaic',color:'#d8d2c6',ground:{type:'door',color:'#2f4a3a'}});
    aptB(16,30,{wz:'B5',floors:4,wall:'tile',color:'#cbbba3',ground:{type:'arcade',shop:{type:'tea',name:'巷口茶飲',sub:'手搖飲・現煮珍珠',signBg:'#f4ead8',signColor:'#5c3a21',band:'#7a9a5a'}}});
    aptB(30,40,{wz:'B6',floors:5,wall:'plaster',color:'#e6dccb',ground:{type:'shop',shop:{type:'fruit',name:'阿忠水果',sub:'當季水果・果汁',signBg:'#f2b33e',signColor:'#5c2a1a'}}});
    aptB(40,48,{wz:'B7',floors:4,wall:'tile',color:'#a89a88',ground:{type:'door',color:'#8a3a2a'}});
    // 巷底與遠景（讓巷子看起來還有延伸）
    { const b=TK.apartment({w:12,d:10,floors:5,wall:'tile',color:'#c7b9a3',detail:false,ground:{type:'door'}}); b.position.set(5.75,0,21); b.rotation.y=Math.PI; g.add(b); buildings.push(b); wzTag(b,'F1'); addCollider(5.75,26,12,10,17); }
    { const b=TK.apartment({w:12,d:10,floors:4,wall:'mosaic',color:'#d6d0c2',detail:false,ground:{type:'shutter'}}); b.position.set(-12.25,0,-20); g.add(b); buildings.push(b); wzTag(b,'F2'); addCollider(-12.25,-25,12,10,14); }
    for(const [x,z,ry,w,f,c] of [[-33.4,16.2,Math.PI,9,4,'#cfc4b2'],[-33.4,-16.2,0,9,5,'#d9cdb8']]){ const b=TK.apartment({w,d:10,floors:f,wall:'tile',color:c,detail:false,ground:{type:f>5?'shop':'door',shop:{type:'cvs',name:'新生大樓',sub:'',signBg:'#f4f1ea',signColor:'#333'}}}); b.position.set(x,0,z); b.rotation.y=ry; g.add(b); buildings.push(b); wzTag(b,z>0?'F3':'F4'); addCollider(x,z,ry%Math.PI?10:w,ry%Math.PI?w:10,30); }
    // 西端（巷底）：住家公寓。v9.2 起兩點半 Café 搬到東端路口（門面朝西，傍晚夕陽沿著巷子照到店門口）
    { const endB=TK.apartment({w:14,d:13,floors:4,wall:'tile',color:'#cdbfa8',balcony:true,ground:{type:'door',color:'#5c3a21'}}); endB.position.set(-37.2,0,-1); endB.rotation.y=Math.PI/2; g.add(endB); buildings.push(endB); wzTag(endB,'W0'); nav.blockRect(-43.7,-1,13,14,0,0); addCollider(-43.7,-1,13,14,16); }
    // 東端路口：兩點半 Café（一樓咖啡廳＋樓上住家；正對主巷，從公館走進溫州街第一眼就看到）
    const cafeB=TK.apartment({w:14,d:13,floors:3,fh:3.2,groundH:3.8,wall:'tile',color:'#e6d9c4',balcony:true,tank:false,grille:'#3b2a1e',ground:{type:'shop',shop:{type:'cafe',name:'兩點半 Café',sub:'營業 11:00–02:30',signBg:'#3b2a1e',signColor:'#f4ead8',serif:true,awning:'#3b2a1e',frame:'#3b2a1e'}}}); cafeB.position.set(55.4,0,0); cafeB.rotation.y=-Math.PI/2; g.add(cafeB); buildings.push(cafeB); cafeB.userData.dyn=true;   /* 不參加整區靜態合併：Blender 正式模型（bldg.cafe_exterior）載入後要能把套件外觀藏起來 */ nav.blockRect(61.9,0,13,14,0,0); addCollider(61.9,0,13,14,14);
    open(54.5,-6.6,55.15,6.6); // 店門口的騎樓地（可以走到門邊）
    // Café 南側：轉角公寓；路口往南是通往公館的路（遠景）
    { const b=TK.apartment({w:10,d:12,floors:5,wall:'tile',color:'#cbbba6',ground:{type:'shutter'}}); b.position.set(55.4,0,-12.4); b.rotation.y=-Math.PI/2; g.add(b); buildings.push(b); wzTag(b,'C1'); nav.blockRect(61.4,-12.4,12,10,0,0); addCollider(61.4,-12.4,12,10,18); }
    { const r=TK.road(30,8); r.position.set(51.3,0.002,-31); r.rotation.y=Math.PI/2; g.add(r); }
    // v9.3：路口往北的路也延伸出去（原本 z=15.5 被一棟 6 樓公寓整個堵住，Café 前面往北看只看到一面牆、看不到天空）：兩側遠景公寓＋行道樹，路的盡頭是天空；
    // 可走範圍仍到 z=15 為止，用道路施工的護欄和三角錐擋住（不是隱形牆）
    { const r=TK.road(34,8); r.position.set(51.3,0.002,32.5); r.rotation.y=Math.PI/2; g.add(r);
      for(const [x,z,ry,w,f,c,id] of [[47.9,23,Math.PI/2,11,5,'#cdbfa9','S1'],[54.7,22.5,-Math.PI/2,10,4,'#d6cab6','S2'],[47.9,37,Math.PI/2,14,6,'#c3b6a0','S3'],[54.7,36,-Math.PI/2,14,5,'#cfc3ae','S4']]){ const b=TK.apartment({w,d:10,floors:f,wall:'tile',color:c,detail:false,ground:{type:'door'}}); b.position.set(x,0,z); b.rotation.y=ry; g.add(b); buildings.push(b); wzTag(b,id); }
      for(const [tx,tz,sc] of [[49.0,18.6,0.9],[53.7,29.5,1.0],[49.0,43,1.1]]){ const t=TK.tree(7*sc); place(g,t,tx,tz,0); }
      const sb=new TK.Bin(); const stripe=TK.M('roadworkStripe',()=>TK.std({map:TK.tex('roadwork',128,16,(x,w,h)=>{ for(let i=-16;i<w+16;i+=16){ x.fillStyle='#e8622a'; x.beginPath(); x.moveTo(i,0); x.lineTo(i+8,0); x.lineTo(i+8-h,h); x.lineTo(i-h,h); x.fill(); x.fillStyle='#f4f1ea'; x.beginPath(); x.moveTo(i+8,0); x.lineTo(i+16,0); x.lineTo(i+16-h,h); x.lineTo(i+8-h,h); x.fill(); } }),roughness:0.6}));
      for(const bx of [49.8,53.0]){ sb.add(stripe,TK.boxG(2.8,0.22,0.06),bx,0.95,15.7,0); sb.add(stripe,TK.boxG(2.8,0.22,0.06),bx,0.55,15.7,0); for(const sx of [-1.25,1.25]) sb.add(TK.paint('#3a3d42'),TK.boxG(0.08,1.1,0.4),bx+sx,0.55,15.7,0); }
      for(const cx of [48.6,51.4,54.0]){ sb.add(TK.paint('#e8622a'),new THREE.ConeGeometry(0.2,0.7,12),cx,0.35,15.2,0); sb.add(TK.paint('#f4f1ea'),new THREE.CylinderGeometry(0.11,0.14,0.12,12),cx,0.42,15.2,0); sb.add(TK.paint('#2b2b2b'),TK.boxG(0.42,0.04,0.42),cx,0.02,15.2,0); }
      const sg=new THREE.Group(); sb.build(sg); g.add(sg); }
    // Café 北側：轉角公寓（原本是空地，從路口看會露出遠景地面）
    { const b=TK.apartment({w:7,d:12,floors:4,wall:'mosaic',color:'#d3cbbd',balcony:true,ground:{type:'door',color:'#2f4a3a'}}); b.position.set(55.4,0,11.2); b.rotation.y=-Math.PI/2; g.add(b); buildings.push(b); wzTag(b,'C2'); nav.blockRect(61.4,11.2,12,7,0,0); addCollider(61.4,11.2,12,7,16); }
    // 巷口斑馬線（主巷接路口處）＋轉角行道樹
    { const st=TK.tex('zebra',256,64,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(240,238,230,0.92)'; for(let i=0;i<w;i+=32) x.fillRect(i+4,0,18,h); },false); const m=new THREE.Mesh(new THREE.PlaneGeometry(8.4,2.4),new THREE.MeshStandardMaterial({map:st,transparent:true,roughness:0.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(46.4,0.012,0); m.receiveShadow=true; g.add(m); }
    for(const [tx,tz,sc] of [[48.9,-5.6,0.95],[48.9,6.0,1.05]]){ const t=TK.tree(7*sc); place(g,t,tx,tz,0); nav.blockCircle(tx,tz,0.45); }
    for(const [x,z,ry,w,f,c,id] of [[47.9,-24,Math.PI/2,12,5,'#c9bba5','N1'],[54.7,-24,-Math.PI/2,12,6,'#d4c8b4','N2'],[47.9,-38,Math.PI/2,14,4,'#bfb29c','N3'],[54.7,-38,-Math.PI/2,14,7,'#cdc2ae','N4']]){ const b=TK.apartment({w,d:10,floors:f,wall:'tile',color:c,detail:false,ground:{type:'door'}}); b.position.set(x,0,z); b.rotation.y=ry; g.add(b); buildings.push(b); wzTag(b,id); addCollider(x+(ry>0?-5:5),z,10,w,f*3.3+4); }
    for(const [z,ry,c,id] of [[11,Math.PI/2,'#d4c6b0','W1'],[-13,Math.PI/2,'#cbbfae','W2']]){ const b=TK.apartment({w:10,d:12,floors:4,wall:'tile',color:c,detail:false,ground:{type:'door'}}); b.position.set(-37.2,0,z); b.rotation.y=ry; g.add(b); buildings.push(b); wzTag(b,id); addCollider(-43.2,z,12,10,14); }
    E.interactables.push({x:54.2,z:0,radius:2.3,label:'進入兩點半 Café',exit:{to:'cafe',spawn:{x:0,z:5,yaw:Math.PI}}});
    const cafeKitProps=[];   // 套件的 A 字立牌、門口盆栽：Café 正式模型裡有自己的版本（位置、導航阻擋相同），載入後藏起來
    { const ab=TK.aBoard(['今日手沖','衣索比亞','耶加雪菲','—','讀書位 有']); ab.position.set(54.4,0,3.6); ab.rotation.y=-Math.PI/2; g.add(ab); nav.blockCircle(54.4,3.6,0.35); ab.userData.dyn=true; cafeKitProps.push(ab); }
    { const bk=W3.bikeAny('#2f5d50',546); bk.position.set(54.6,0,-5.4); bk.rotation.y=Math.PI+0.15; g.add(bk); nav.blockRect(54.6,-5.4,0.6,1.8,0.15,0.1); }
    { const pt=TK.pots(5,1); pt.position.set(54.85,0,4.6); pt.rotation.y=-Math.PI/2; g.add(pt); nav.blockRect(54.85,5.4,0.6,1.8,0,0); pt.userData.dyn=true; cafeKitProps.push(pt); }
    nav.blockRect(54.8,4.22,0.7,0.65,0,0); nav.blockRect(46.25,4.7,0.9,0.7,0,0);   // 比人窄的縫（A 字立牌和盆栽之間、電線桿和郵筒之間）：會留下只有一點站得住的小孤島，滑進去就出不來（v9.3 #31，tools/dev_scratch/nav_islands.py）
    { const pt=TK.pots(4,3); pt.position.set(54.85,0,-4.6); pt.rotation.y=-Math.PI/2; g.add(pt); nav.blockRect(54.85,-3.8,0.6,1.6,0,0); pt.userData.dyn=true; cafeKitProps.push(pt); }
    { const bk=W3.bikeAny('#3a6fb0',-359); bk.position.set(-35.9,0,-5.2); bk.rotation.y=0.15; g.add(bk); nav.blockRect(-35.9,-5.2,0.6,1.8,0.15,0.1); }
    { const pt=TK.pots(5,1); pt.position.set(-36.6,0,3.4); pt.rotation.y=Math.PI/2; g.add(pt); nav.blockRect(-36.4,4.2,0.6,1.8,0,0); }
    // A 側：日式宿舍（圍牆＋黑瓦木屋＋老樹）
    // v9.3：圍牆降到 1.15 m、門開著（冠木門）、房子往前 0.5 m——從巷子就看得到木造外觀、格子窗、玄關（以前 1.7 m 的牆把房子整個擋住）
    { const w=TK.wall(17,1.15,{gate:2.4,gateX:-0.5,openGate:true}); w.position.set(-21,0,5.35); w.rotation.y=Math.PI; g.add(w); nav.blockRect(-21,5.4,17.2,0.5,0,0.05); addCollider(-21,5.4,17,0.4,1.6);
      const h=TK.japaneseHouse(10,7); h.position.set(-21.5,0,12.0); h.rotation.y=Math.PI; g.add(h); addCollider(-21.5,12.0,11,8,6);
      w.userData.wzJp='wall'; h.userData.wzJp='house'; if(jpGLB){ w.userData.dyn=true; h.userData.dyn=true; }   /* Blender 正式模型（bldg.wz_jphouse，第二個 AI）載入後藏起套件外觀 */
      { const gk=h.userData.genkan; const sp=TK.glowSprite('rgba(255,210,138,1)',1.6,0,0.9); sp.position.set(-21.5-gk.x,gk.y,12.0-gk.z-0.12); g.add(sp); }
      const yb=new TK.Bin();
      for(let x=-29;x<=-13;x+=1.1){ if(Math.abs(x+20.5)<1.6) continue; TK.plantClump(yb,x,0,5.95+((x*7)%2)*0.08,0.95+Math.abs((x*13)%3)*0.06,5,[0.7,0.9,0.66]); }   // 牆後的矮籬，只從牆頭露出一點
      for(const [sx,sz,r] of [[-20.6,6.05,0.32],[-20.9,6.7,0.28]]) yb.add(TK.paint('#9a948a'),new THREE.CylinderGeometry(r,r*1.05,0.08,9),sx,0.04,sz,0);   // 踏石：門口到玄關
      { const L=[-24.6,6.9]; const st=TK.paint('#a19a8e'); yb.add(st,new THREE.CylinderGeometry(0.22,0.26,0.2,6),L[0],0.1,L[1],0); yb.add(st,new THREE.CylinderGeometry(0.08,0.1,0.5,6),L[0],0.45,L[1],0); yb.add(st,new THREE.BoxGeometry(0.34,0.06,0.34),L[0],0.72,L[1],0); yb.add(st,new THREE.ConeGeometry(0.34,0.24,4),L[0],1.06,L[1],Math.PI/4); yb.add(st,new THREE.SphereGeometry(0.05,6,4),L[0],1.21,L[1],0);
        yb.add(TK.glowMat('toroLight',null,{dayI:0.05,nightI:1.4,mat:{color:new THREE.Color('#e8dcc0'),emissive:new THREE.Color('#ffc878')}}),new THREE.BoxGeometry(0.22,0.2,0.22),L[0],0.85,L[1],0,{noShadow:true});
        const ls=TK.glowSprite('rgba(255,200,120,1)',0.9,0,0.8); ls.position.set(L[0],0.86,L[1]); g.add(ls); }   // 石燈籠（晚上微亮）
      for(const [bx,bz,sz] of [[-27.2,7.3,1.3],[-15.8,6.9,1.2],[-18.2,7.6,1.0]]) TK.plantClump(yb,bx,0,bz,sz,7,[0.66,0.88,0.62]);
      const yg=new THREE.Group(); yb.build(yg); g.add(yg);
      for(const [tx,tz,sc] of [[-15.2,8.2,1.3],[-27.5,8.6,1.05],[-13.6,14,0.9]]){ const t=TK.tree(8*sc); place(g,t,tx,tz,0); }
      if(typeof WZ_SHOPS_LAYOUT==='undefined') E.interactables.push({x:-21.5,z:4.2,radius:1.8,label:'看日式宿舍',look:'圍牆後面是一棟日式宿舍。黑瓦、木雨淋板，樹比屋頂還高。門牌旁貼著「私人住宅，請勿進入」。'}); }   /* 整修成一盞茶屋以後（AA_164 2-3）：改成進店（下面的 wzShopDoors）*/
    // 三家新店的店門（DL-09；WZ_SHOPS_LAYOUT 的 enterAt：溫州街世界座標，在人行道上）
    let copyDoor=null;   /* 阿德影印的店門：搬到轉角以後（WZ_COPY_SHOP＝'moved'）換到北巷那一間（ART-WZ6；wz_shops_layout.js 的 print.moved），每一幀照旗標（copyTick）*/
    if(typeof WZ_SHOPS_LAYOUT!=='undefined') for(const k of ['brunch','print','teahouse','lin','teishoku']){ const L=WZ_SHOPS_LAYOUT[k]; if(!L||!L.enterAt) continue; const at=k==='print'?wzCopyAt(typeof GAME!=='undefined'?GAME.G:null):L.enterAt; const it={x:at.x,z:at.z,radius:1.4,label:L.enterAt.label,exit:{to:'wz_'+k,spawn:Object.assign({},L.spawn)}}; E.interactables.push(it); if(k==='print') copyDoor=it; }
    // 小公園：擴大版照 WZ_PARK_LAYOUT（ART-WZ1，LAWWW2-B；AA_164 第 5 節）；沒有配置檔（舊的測試環境）照舊的小公園
    if(typeof WZ_PARK_LAYOUT!=='undefined') buildWzPark(E,g,nav,open,pkTag,pools,place);
    else { const gr=new THREE.Mesh(new THREE.PlaneGeometry(11.6,10.4),new THREE.MeshStandardMaterial({map:(()=>{ const t=W3.grassTex().clone(); t.needsUpdate=true; t.repeat.set(3,3); return t; })(),roughness:0.95})); gr.rotation.x=-Math.PI/2; gr.position.set(26,0.01,10.2); gr.receiveShadow=true; g.add(gr); pkTag(gr);
      // v9.3：鋪面步道（有路緣）→ 圓形小廣場，中間一棵大樹＋樹圍座椅（台北鄰里公園常見）；兩側灌木、伸展架、公園路燈、長椅上睡覺的貓
      const paverT=()=>TK.tex('parkPaver',128,128,(x,w,h)=>{ x.fillStyle='#a79e90'; x.fillRect(0,0,w,h); for(let j=0;j<4;j++) for(let i=0;i<4;i++){ const v=200+((i*7+j*13)%5)*8; x.fillStyle='rgb('+v+','+(v-8)+','+(v-22)+')'; x.fillRect(i*32+2,j*32+2,28,28); } });
      { const t=paverT().clone(); t.needsUpdate=true; t.repeat.set(1.1,2.9); const m=new THREE.Mesh(new THREE.PlaneGeometry(2.2,5.8),new THREE.MeshStandardMaterial({map:t,roughness:0.9})); m.rotation.x=-Math.PI/2; m.position.set(26,0.016,7.9); m.receiveShadow=true; g.add(m); pkTag(m); }
      { const t=paverT().clone(); t.needsUpdate=true; t.repeat.set(2.7,2.7); const m=new THREE.Mesh(new THREE.CircleGeometry(2.75,28),new THREE.MeshStandardMaterial({map:t,roughness:0.9})); m.rotation.x=-Math.PI/2; m.position.set(26,0.017,13.2); m.receiveShadow=true; g.add(m); pkTag(m); }
      const pb=new TK.Bin(), pbH=new TK.Bin(); const curbP=TK.paint('#c9c2b4');   /* pbH＝鋪面以外的硬體（路緣、樹圍座椅、單槓）：正式模型載入後藏起來；pb＝灌木（留著） */
      for(const sx of [-1,1]) pbH.add(curbP,TK.boxG(0.12,0.08,5.6),26+sx*1.16,0.04,7.9,0);
      { const big=TK.tree(10.5,7,{sp:'banyan'}); place(g,big,26,13.2,0.6);   /* 小公園中間的大樹：正式模型是榕樹（台北的公園常見；程序化的樹不受影響）*/ nav.blockCircle(26,13.2,1.3);
        const wood=TK.paint('#8a6a4a'), legP=TK.paint('#5a5550'); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; const cx=26+Math.sin(a)*1.15, cz=13.2+Math.cos(a)*1.15; pbH.add(wood,TK.boxG(0.98,0.06,0.36),cx,0.44,cz,a); pbH.add(legP,TK.boxG(0.06,0.42,0.3),cx+Math.sin(a+Math.PI/2)*0.42,0.21,cz+Math.cos(a+Math.PI/2)*0.42,a); }
        E.interactables.push({x:26,z:11.5,radius:1.3,label:'坐在大樹下的圓椅',seat:{x:26,z:11.82,yaw:Math.PI}}); }
      for(const [tx,tz,sc] of [[21.6,12.8,1.0],[30.6,12.6,0.95],[30.8,6.4,0.8]]){ const t=TK.tree(7.5*sc); place(g,t,tx,tz,0); nav.blockCircle(tx,tz,0.5); }
      for(let z=7.2;z<=15;z+=1.25){ for(const x of [20.7,31.3]){ if(x>30&&z<8.6) continue; TK.plantClump(pb,x,0,z,1.05+Math.abs((z*7)%3)*0.12,6,[0.68,0.9,0.64]); } }   // 兩側灌木
      for(let x=21.8;x<=30.2;x+=1.3){ if(Math.abs(x-26)<3.0) continue; TK.plantClump(pb,x,0,15.0,1.2,6,[0.66,0.88,0.62]); }
      { const gp=TK.paint('#3f7a5a'); for(const sx of [-0.6,0.6]) pbH.add(gp,new THREE.CylinderGeometry(0.05,0.05,1.7,8),22.3+sx,0.85,10.4,0); pbH.add(gp,new THREE.CylinderGeometry(0.03,0.03,1.3,8),22.3,1.62,10.4,0,{rz:Math.PI/2}); pbH.add(TK.paint('#e8c23a'),new THREE.CylinderGeometry(0.035,0.035,1.3,8),22.3,1.1,10.4,0,{rz:Math.PI/2}); nav.blockRect(22.3,10.4,1.5,0.3,0,0.1); }   // 伸展架（單槓）
      { const L=W3.lampPost(); place(g,L,31.0,9.6,-Math.PI/2); nav.blockCircle(31.0,9.6,0.25); const pool=TK.lightPool(4.2,'rgba(255,214,150,1)'); pool.position.set(30.25,0.03,9.6); g.add(pool); pools.push(pool); const gs=TK.glowSprite('rgba(255,214,150,1)',1.8,0,0.85); gs.position.set(30.25,3.9,9.6); g.add(gs); }   // 公園路燈
      { const cat=new TK.Bin(); const fur=TK.paint('#d98a3c'), furL=TK.paint('#f0c08a'), dk=TK.paint('#5a3a22'); const cx=29.05, cy=0.5, cz=8.08;   // 長椅上睡覺的橘貓（AMBIENT 文字裡提到的那隻）
        const body=new THREE.SphereGeometry(0.2,14,9); body.scale(1.0,0.5,0.72); cat.add(fur,body,cx,cy+0.08,cz,0.3);
        const head=new THREE.SphereGeometry(0.085,12,8); cat.add(fur,head,cx+0.15,cy+0.07,cz-0.07,0); const muzzle=new THREE.SphereGeometry(0.04,8,6); cat.add(furL,muzzle,cx+0.2,cy+0.05,cz-0.12,0);
        for(const ex of [-0.04,0.04]) cat.add(fur,new THREE.ConeGeometry(0.028,0.06,4),cx+0.15+ex,cy+0.15,cz-0.06,0);
        const tail=new THREE.TorusGeometry(0.16,0.026,6,14,Math.PI*1.1); cat.add(dk,tail,cx-0.02,cy+0.035,cz-0.02,0.4,{rx:-Math.PI/2});
        const cg=new THREE.Group(); cat.build(cg); cg.traverse(o=>{ if(o.isMesh) o.castShadow=false; }); g.add(cg); }
      { const pg=new THREE.Group(); pb.build(pg); g.add(pg); const ph=new THREE.Group(); pbH.build(ph); g.add(ph); pkTag(ph); }
      for(const [bx,bz] of [[23.6,8.0],[28.4,8.0]]){ const b=BENCH(); place(g,b,bx,bz,Math.PI); nav.blockRect(bx,bz,1.4,0.7,0); E.interactables.push({x:bx,z:bz-0.06,radius:1.4,label:'坐在小公園的長椅',seat:{x:bx,z:bz-0.06,yaw:Math.PI}}); }
      for(const [hx,hz] of [[20.6,5.6],[30.0,5.6]]){ const pt=TK.pots(4,7); pt.position.set(hx,0,hz); pt.rotation.y=Math.PI; g.add(pt); nav.blockRect(hx-0.8,hz,1.8,0.7,0,0); }
      const sg=TK.signTex('溫州公園',{bg:'#2f4a3a',color:'#f4ead8',serif:true}); const sp=new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.4),new THREE.MeshStandardMaterial({map:sg})); sp.position.set(20.2,1.4,5.6); sp.rotation.y=Math.PI; g.add(sp); pkTag(sp); }
    // ---- 電線桿＋路燈（A 側沿街）、電線 ----
    const poleXs=[-26.5,-9.2,12.2,34.2,45.5]; const tops=[];
    poleXs.forEach((px,i)=>{ const p=TK.utilityPole({arm:true,armDir:1,transformer:i===2,sign:i===4?'溫州街':null}); p.position.set(px,0,4.65); p.rotation.y=Math.PI/2; g.add(p); prTag(p,'pole'); nav.blockCircle(px,4.65,0.3); tops.push([px,8.52,4.65]); const L=p.userData.lamp; if(L){ const wx=px, wz=4.65-L.x; lamps.push({x:wx,z:wz}); const pool=TK.lightPool(4.5,'rgba(255,214,150,1)'); pool.position.set(wx,0.03,wz); g.add(pool); pools.push(pool); } });
    { const pairs=[]; for(let i=0;i<tops.length-1;i++){ for(const dy of [0,-0.6]) pairs.push([[tops[i][0]-0.75,tops[i][1]+dy,tops[i][2]],[tops[i+1][0]-0.75,tops[i+1][1]+dy,tops[i+1][2]],0.7]); pairs.push([[tops[i][0]+0.75,tops[i][1],tops[i][2]],[tops[i+1][0]+0.75,tops[i+1][1],tops[i+1][2]],0.55]); }
      // 跨巷到對面建築、到巷子
      for(const [px,tx,tz] of [[-9.2,-6,-5.2],[12.2,10,-5.2],[34.2,36,-5.2],[12.2,5.8,9],[-26.5,-30,-5.2]]) pairs.push([[px,8.0,4.65],[tx,7.2,tz],0.4]);
      g.add(TK.wires(pairs)); }
    // 轉角反光鏡
    for(const [mx,mz,ry] of [[8.7,4.5,-2.4],[-9.4,-4.5,0.7],[-30.4,4.6,-2.3]]){ const m=TK.trafficMirror(); m.position.set(mx,0,mz); m.rotation.y=ry; g.add(m); prTag(m,'mirror'); nav.blockCircle(mx,mz,0.2); }
    // 機車（停車格裡，車頭朝建築）＋腳踏車
    /* 機車的 Blender 正式模型（bldg.wz_scooter，第二個 AI）：有模型時套件機車先放進 scG、自己合併（載入前 draw call 少），模型載入後整組藏起來、換成 InstancedMesh（每台車殼顏色照套件）；?nobldg 照舊 */
    const scGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.wz_scooter']; const scG=new THREE.Group(); scG.userData.dyn=true; scG.name='wz_kit_scooters'; const scList=[]; if(scGLB) g.add(scG);
    const scAdd=(o,c)=>{ if(scGLB){ scG.add(o); scList.push({o,color:c}); } else g.add(o); };
    const scColors=['#e8e8e8','#2b2b2b','#8c3b47','#4a6c8c','#c9b48a','#f2f0ea','#3e5a48'];
    const scRow=(x0,n,z,ry,gap)=>{ for(let k=0;k<n;k++){ if(TK.rnd()<0.15) continue; const c=scColors[(k*3+Math.round(x0))%scColors.length], s=TK.scooter(c); const x=x0+k*0.85; s.position.set(x,0,z+(TK.rnd()-0.5)*0.15); s.rotation.y=ry+(TK.rnd()-0.5)*0.12; if(gap&&x>gap[0]&&x<gap[1]) continue; scAdd(s,c); }   /* gap：這一段不停車（亂數照樣抽，其他機車的位置、顏色不變）*/
      if(!gap) nav.blockRect(x0+(n-1)*0.85/2,z,n*0.85,1.7,0,0.05); else { const a=x0-0.425, b=x0+(n-1)*0.85+0.425; for(const [u,v] of [[a,gap[0]],[gap[1],b]]) if(v-u>0.4) nav.blockRect((u+v)/2,z,v-u,1.7,0,0.05); } };
    if(typeof WZ_SHOPS_LAYOUT!=='undefined'){ scRow(-11.5,2,3.95,0); scRow(-6.8,3,3.95,0); } else scRow(-11.5,7,3.95,0);   /* 阿德影印輸出的店門（x −8）前面留空（DL-09）*/ scRow(5.0,12,-3.95,Math.PI); scRow(31.5,8,-3.95,Math.PI,[32.8,36.2]);   /* AA_413（10-23）：阿忠水果（B6）攤子前面不停車，留 3.4 m 給買水果的人（x 32.8–36.2）*/ scRow(-28.5,6,-3.95,Math.PI); scRow(typeof WZ_PARK_LAYOUT!=='undefined'?16.4:24.4,4,3.95,0);   /* 擴大版小公園：入口 A（x 22.6–29.4）前面不停機車，這一排挪到 A3 巷口書房前面 */
    for(const [bx,bz,ry,c] of [[9.4,4.1,0.1,'#3a6fb0'],[10.3,4.1,-0.08,'#8c3b47'],[18.6,4.1,0.05,'#e0b95b']]){ const bk=W3.bikeAny(c,Math.round(bx*10)); bk.position.set(bx,0,bz); bk.rotation.y=ry; g.add(bk); nav.blockRect(bx,bz,0.6,1.8,ry,0.05); }
    // 盆栽（住家門口）、郵筒、立牌
    for(const [px,pz,ry,n] of [[-2.6,4.55,Math.PI,6],[9.6,-4.55,0,5],[41.5,-4.55,0,7],[3.6,9.5,-Math.PI/2,5],[-13.5,-9,Math.PI/2,4],[-14.4,4.6,Math.PI,4]].filter(q=>!(q[0]===41.5&&typeof WZ_SHOPS_LAYOUT!=='undefined'))){   /* B7 改成半熟（溫州街 v5）：店門口有自己的黑板、長椅、大盆栽（模型），套件那一排盆栽會擋住店門 */ const pt=TK.pots(n,Math.round(px)); pt.position.set(px,0,pz); pt.rotation.y=ry; g.add(pt); const L=pt.userData.len; const c=Math.cos(ry), sn=Math.sin(ry); nav.blockRect(px+c*L/2,pz-sn*L/2,Math.abs(c)*L+0.6,Math.abs(sn)*L+0.6,0,0); }
    { const mb=TK.mailbox(); mb.position.set(47.3,0,4.3); mb.rotation.y=Math.PI; g.add(mb); nav.blockRect(47.3,4.3,1.2,0.6,0,0); }
    for(const [ax,az,ry,ls] of [[14.6,3.9,Math.PI,['二手書','民法・刑法','教科書收購']],[-2.4,-3.9,0,['本日定食','鯖魚 / 豚汁','11:30–20:00']]]){ const ab=TK.aBoard(ls); ab.position.set(ax,0,az); ab.rotation.y=ry; g.add(ab); nav.blockCircle(ax,az,0.35); }
    // 店面（不能進去的）用「看櫥窗」：清楚表示只能看，不假裝有完整室內
    for(const it of [{x:14.2,z:3.8,label:'看書店的櫥窗',look:'巷口書房的櫥窗裡擺著一套舊版的《民法總則》，旁邊手寫的紙條：「學長姐留下來的，筆記很多」。'},{x:44,z:3.8,label:'看便利商店',look:'日日便利的自動門開了又關。櫃檯後面的店員在補咖啡豆。'},{x:36,z:3.8,label:'看林家乾麵',look:'林家乾麵外面排了三個人。滷味的味道飄到巷子中間。'},{x:23,z:-6.5,label:'看手搖飲菜單',look:'巷口茶飲的菜單：紅茶 30、綠茶 30、珍珠奶茶 55。騎樓下有兩張塑膠椅。'},{x:-2.6,z:-3.8,label:'看定食店',look:'巷子裡定食的布簾後面傳來煎魚的聲音。今天的定食是鯖魚。'}].filter(it=>!(typeof WZ_SHOPS_LAYOUT!=='undefined'&&((it.label==='看林家乾麵'&&WZ_SHOPS_LAYOUT.lin)||(it.label==='看定食店'&&WZ_SHOPS_LAYOUT.teishoku)))&&!(it.label==='看手搖飲菜單'&&typeof WZS!=='undefined'&&WZS.WINDOW))) E.interactables.push(Object.assign({radius:1.6},it));   /* 林家乾麵、定食店能進去以後（WZ-SHOP-AA364-ART），門口的「看」換成上面 wzShopDoors（三家新店的店門那一段）的「進去」 */
    /* 巷口茶飲、夏日冰菓室的外帶窗口（AA_364 第 4 節 #3；src/wzshops3d.js 的 WZS.WINDOW，座標照 LAWWW2 交件 README）：茶飲「買一杯飲料」；冰菓室 5～9 月「買一碗冰」、10～4 月「看夏日冰菓室」（鐵捲門＋「五月見」）。
       騎樓中間原本的「看手搖飲菜單」(23,−6.5) 拿掉（LAWWW2 建議；它的菜單寫「綠茶 30」，AA_364 是「青茶 30」）*/
    if(typeof WZS!=='undefined'&&WZS.windowItems) for(const it of WZS.windowItems()) E.interactables.push(it);
    // 騎樓柱子
    for(const px of [16.3,23.0,29.7]) nav.blockRect(px,-5.3,0.6,0.6,0,0.05);   /* B5 騎樓的柱子；中間 23.0＝巷口茶飲和夏日冰菓室的分隔柱（溫州街 v5，LAWWW2-B 31323eb9）*/
    // v9.3 參考圖 07 的街道細節：Café 門前的紅磚人行道（平的，不改導航、腳不會陷進去；外緣一條低路緣）＋路口的「溫州街 Wenzhou St.」路名牌
    { const bt=TK.tex('redBrickWalk',256,256,(x,w,h)=>{ x.fillStyle='#7d6a60'; x.fillRect(0,0,w,h); for(let r=0;r<16;r++) for(let c=0;c<5;c++){ const v=0.84+((r*7+c*13)%9)/40; const cr=Math.round(156*v), cg=Math.round(92*v), cb=Math.round(74*v); x.fillStyle='rgb('+cr+','+cg+','+cb+')'; x.fillRect(c*52+(r%2)*26-26+2,r*16+2,48,12); } x.fillStyle='rgba(0,0,0,0.05)'; for(let i=0;i<40;i++) x.fillRect((i*53)%w,(i*97)%h,3,3); }); const t=bt.clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1.9/1.2,13.4/1.2);
      const sw=new THREE.Mesh(new THREE.PlaneGeometry(1.9,13.4),TK.std({map:t,roughness:0.92})); sw.rotation.x=-Math.PI/2; sw.position.set(54.3,0.014,0); sw.receiveShadow=true; g.add(sw); prTag(sw,'walk');
      const curb=new THREE.Mesh(TK.boxG(0.14,0.04,13.4),TK.paint('#b9b2a6')); curb.position.set(53.33,0.02,0); curb.receiveShadow=true; g.add(curb); prTag(curb,'walk'); }
    { const sg=new THREE.Group(); const pm=TK.paint('#6f747a'); const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.05,3.0,10),pm); pole.position.y=1.5; sg.add(pole);
      const st=TK.signTex('溫州街',{bg:'#1f6448',color:'#f4f6f2',border:'#f4f6f2',sub:'Wenzhou St.'}); const pmat=new THREE.MeshStandardMaterial({map:st,roughness:0.6}); for(const sd of [0,1]){ const plate=new THREE.Mesh(new THREE.PlaneGeometry(0.95,0.3),pmat); plate.position.set(0.5,2.75,sd?-0.006:0.006); plate.rotation.y=sd?Math.PI:0; sg.add(plate); }   // 兩面各一片（單片雙面的背面字會左右相反）
      const arm=new THREE.Mesh(TK.boxG(0.1,0.04,0.04),pm); arm.position.set(0.04,2.75,0); sg.add(arm);
      sg.position.set(47.7,0,7.6); sg.rotation.y=Math.PI*0.08; g.add(sg); prTag(sg,'roadname'); nav.blockCircle(47.7,7.6,0.15); }
    // 路口往北那段：Café 北側公寓前停一排機車（車頭朝建築）、西側一根電線桿＋電線（參考圖 07 的街景）
    { const cols=['#e8e8e8','#2b2b2b','#8c3b47','#4a6c8c','#c9b48a','#f2f0ea','#3e5a48']; for(let k=0;k<7;k++){ if(k===3) continue; const c=cols[(k*3+2)%cols.length], sc=TK.scooter(c); sc.position.set(54.55,0,8.7+k*0.85); sc.rotation.y=Math.PI/2+(k%2?0.06:-0.05); scAdd(sc,c); } nav.blockRect(54.6,11.25,1.5,5.6,0,0.05);
      const up=TK.utilityPole({}); up.position.set(47.55,0,14.2); up.rotation.y=Math.PI/2; g.add(up); prTag(up,'pole'); nav.blockCircle(47.55,14.2,0.3);
      g.add(TK.wires([[[47.55-0.75,8.52,14.2],[45.5-0.75,8.52,4.65],0.6],[[47.55+0.75,8.52,14.2],[45.5+0.75,8.52,4.65],0.55],[[47.55,8.0,14.2],[55.2,7.4,13.0],0.4]])); }
    // v9.3 三時段光影：Café 櫥窗灑到騎樓與路面的暖光、路口往北那條路的路燈（參考圖晚上 20:30：路燈照亮路面、店家燈光灑出來；
    // 原本 Café 門口的路面晚上是一片均勻的暗色）。光暈是加法混色的貼地圓片，不增加即時光源
    { const sp=TK.lightPool(3.6,'rgba(255,190,120,1)'); sp.position.set(53.2,0.031,0); sp.scale.set(1,1.75,1); g.add(sp); pools.push(sp); sp.userData.poolMax=(sp.userData.poolMax||0.55)*0.9; }
    { const L=W3.lampPost(); place(g,L,47.75,11.8,Math.PI/2); nav.blockCircle(47.75,11.8,0.25); const pool=TK.lightPool(4.4,'rgba(255,214,150,1)'); pool.position.set(48.5,0.03,11.8); g.add(pool); pools.push(pool); const gs=TK.glowSprite('rgba(255,214,150,1)',1.8,0,0.85); gs.position.set(48.5,3.9,11.8); g.add(gs); }
    // 夜間點光源（數量固定，白天強度 0，避免換燈數造成 shader 重編）
    for(const [lx,ly,lz,c,i] of [[53.8,3.2,0,0xffc88a,1],[44,3.0,3.8,0xf2fbff,0.85],[14.2,3.0,3.6,0xffd6a0,0.7]]){ const L=new THREE.PointLight(c,0,16,1.8); L.position.set(lx,ly,lz); L.userData.maxI=i*18; g.add(L); lights.push(L); }
    // 東端：回公館
    E.interactables.push({x:51.3,z:-13.4,radius:2.6,label:'回公館',exit:{to:'gongguan',spawn:{x:-71,z:16.5,yaw:Math.PI}}});
    for(const b of buildings) b.traverse(o=>{ if(o.isMesh){ o.castShadow=o.castShadow!==false; } });
    // 時間：0 白天 → 1 夜晚（傍晚漸亮）
    const warmSky=new THREE.Color(0xffc48a), warmGround=new THREE.Color(0x6a5644); const zoneTime=(h,E)=>{ let k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); k=Math.max(0,Math.min(1,k)); TK.setNight(k); if(E&&E.hemi){ E.hemi.intensity+=0.85*k; E.hemi.color.lerp(warmSky,0.3*k); E.hemi.groundColor.lerp(warmGround,0.55*k); } for(const L of lights) L.intensity=L.userData.maxI*Math.max(0,Math.min(1,k)); for(const p of pools) p.material.opacity=p.userData.poolMax*Math.max(0,Math.min(1,k*1.2-0.2)); };
    const zone={group:g,nav,spawn:{x:44,z:-1,yaw:-Math.PI/2},lamps:[],buildings,applyTimeOutdoor:zoneTime,onLamps(on){}};
    /* 阿德影印的兩種外觀（ART-WZ6；AA_420 第 3 節、12-1；wenzhou_street.glb 的 COPY_* 節點，LAWWW2-B 10-24）：WZ_COPY_SHOP 'moved'＝A1 鐵捲門拉下＋遷址告示、轉角（A2 東側，北巷）的小店開著、店門換到轉角；
       'stay'＝A1 玻璃門上多一張「本店續約三年」；其他（還沒決定）＝轉角是拉下鐵捲門、貼招租的空店面。旗標在溫州街上變了（事件演完）下一幀就換 */
    const copyNodes=[]; let copyKey=null; zone.copyNodes=copyNodes;
    const copyTick=()=>{ const G=typeof GAME!=='undefined'?GAME.G:null, st=wzCopyState(G); if(st===copyKey) return; copyKey=st; for(const o of copyNodes) o.visible=wzCopyVis(o.name,st); if(copyDoor){ const at=wzCopyAt(G); copyDoor.x=at.x; copyDoor.z=at.z; } };
    /* 二手市集（ART-WZ-MARKET-1023；AA_420 12-2，wzlines3d.js 的 WZL.market；wz_market.glb，LAWWW2-B 10-24）：每月第一個週六那一天才載入；09:00～13:00（WZL.marketOn）才顯示、
       才擋導航格（WZ_PARK_LAYOUT.market.<晴雨>.blocks：桌子、椅子、地攤布、雨棚），時段過了把那幾格還原。晴雨照進溫州街時的天氣（市集的互動點 WZL.addMarket 也是進區域時決定）。攤主（NPC）的位置在配置的 keeper */
    const G0=typeof GAME!=='undefined'?GAME.G:null, MKT={on:null,grp:null,cells:null,w:G0&&G0.weather==='rain'?'rain':'clear'}; zone.market=MKT;
    const mktNav=on=>{ const L=typeof WZ_PARK_LAYOUT!=='undefined'&&WZ_PARK_LAYOUT.market; if(!L||!L[MKT.w]) return;
      if(on&&!MKT.cells){ const b0=nav.b.slice(); for(const r of L[MKT.w].blocks) nav.blockRect(r[0],r[1],r[2],r[3],r[4]||0,0); MKT.cells=[]; for(let i=0;i<nav.b.length;i++) if(nav.b[i]!==b0[i]) MKT.cells.push([i,b0[i]]); nav._cm=null; }
      else if(!on&&MKT.cells){ for(const [i,v] of MKT.cells) nav.b[i]=v; MKT.cells=null; nav._cm=null; } };
    const mktTick=()=>{ const G=typeof GAME!=='undefined'?GAME.G:null, on=!!(G&&typeof WZL!=='undefined'&&WZL.marketOn&&WZL.marketOn(G)); if(on===MKT.on) return; MKT.on=on; if(MKT.grp) MKT.grp.visible=on; mktNav(on); if(typeof WZL!=='undefined'&&WZL.marketKeepers) WZL.marketKeepers(on,MKT.w);   /* 攤主（LAWWW，WZ-MARKET-KEEPER-1024）*/ };
    if(G0&&typeof WZL!=='undefined'&&WZL.marketDay&&WZL.marketDay(G0)&&typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.wz_market']){ MKT.grp=new THREE.Group(); MKT.grp.name='wz_market'; MKT.grp.userData.dyn=true; MKT.grp.visible=false; g.add(MKT.grp);
      ASSETS.loadOne('bldg.wz_market').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true); root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } if(/^MARKET_(CLEAR|RAIN)$/.test(o.name)) o.visible=o.name==='MARKET_'+MKT.w.toUpperCase(); }); MKT.grp.add(root); MKT.grp.visible=!!MKT.on; }).catch(e=>console.warn('二手市集的攤子載入失敗',e)); }
    { const up0=zone.update; zone.update=function(dt,E2){ if(up0) up0.call(zone,dt,E2); copyTick(); mktTick(); if(typeof WZCAT!=='undefined') WZCAT.update(dt,E2); }; } copyTick(); mktTick();   /* WZCAT：公園的貓走動（src/wzcat3d.js，J13）*/
    // 兩點半 Café 的 Blender 正式模型（第二個 AI：tools/blender/env_second/cafe_exterior.py）：載入後接到套件建築上；失敗或 ?nobldg 時維持套件外觀
    // 主巷兩側公寓的 Blender 正式模型（第二個 AI：tools/blender/env_second/wz_street.py）：載入後藏起套件外觀；失敗或 ?nobldg 時維持套件
    if(wzGLB) ASSETS.loadOne('bldg.wenzhou_street').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true); attachWenzhouModel(E,g,root,'wzApt','wenzhou_street_glb'); propBlocks(nav,WZ_PROP_BLOCKS); wzParkSeason(root); root.traverse(o=>{ if(/^COPY_(CORNER_SHUT|CORNER_OPEN|A1_SHUT|A1_RENEW)$/.test(o.name)) copyNodes.push(o); }); copyKey=null; copyTick(); })   /* 季節節點：夏日冰菓室冬天休息（SEASON_ICECLOSED）*/.catch(e=>console.warn('溫州街公寓正式模型載入失敗，用套件的外觀',e));
    if(scGLB){ P3.mergeStatic(scG); ASSETS.loadOne('bldg.wz_scooter').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const n=attachWzScooters(g,scG,scList,c.scene); if(!n) console.warn('機車正式模型沒有 scooter_a／scooter_b，用套件的機車'); }).catch(e=>console.warn('機車正式模型載入失敗，用套件的機車',e)); }
    if(pkGLB) ASSETS.loadOne('bldg.wz_park').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true); attachWenzhouModel(E,g,root,'wzPark','wz_park_glb'); wzParkSeason(root); for(const o of g.children) if(o.userData.wzParkFb) o.visible=false; }).catch(e=>console.warn('小公園正式模型載入失敗，用套件的外觀',e));
    if(prGLB) ASSETS.loadOne('bldg.wz_props').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'wzProp','wz_props_glb'); }).catch(e=>console.warn('溫州街街道細節正式模型載入失敗，用套件的外觀',e));
    if(jpGLB) ASSETS.loadOne('bldg.wz_jphouse').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'wzJp','wz_jphouse_glb'); }).catch(e=>console.warn('日式宿舍正式模型載入失敗，用套件的外觀',e));
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.cafe_exterior']) ASSETS.loadOne('bldg.cafe_exterior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachCafeExterior(cafeB,c.scene.clone(true),cafeKitProps); }).catch(e=>console.warn('兩點半 Café 正式模型載入失敗，用套件的外觀',e));
    return zone; }
  /* 兩點半 Café 正式模型接到套件建築上（GLB 是建築自己的座標：正面朝 +z、原點在正面中央地面，和 TK.apartment 相同）。
     套件的外觀與光暈藏起來（導航、鏡頭碰撞、店門互動點不在這裡，照舊）；hide＝一起藏起來的套件道具（A 字立牌、盆栽）。
     名稱約定（見 cafe_exterior.py）：SIGN_FACE／ABOARD_FACE_*／MENU_FACE＝空白板面，字用 canvas 畫（自訂屬性帶文字）；
     CAFE_NIGHT 的材質夜間發光（TK.addNight）、CAFE_BOUNCE 的店內材質有燈光感（TK.bounce）；GLOW_* 空節點＝光暈位置（TK.glowSprite）。 */
  const CAFE_NIGHT={cafe_bulb:[0xfff1d6,2.4,1.0],cafe_lampglass:[0xffd49a,1.5,0.3],ext_glass_lit:[0xffd9a0,0.75,0]};
  /* cafe_int_atlas：溫州街效能第二輪把店內的地板、書、層架、吧台合成一張貼圖集（LAWWW2-B 35513f11）*/
  const CAFE_BOUNCE={cafe_int_floor:[0.35,0.7],cafe_int_plaster:[0.42,0.85],cafe_int_wood:[0.32,0.65],cafe_int_ceiling:[0.35,0.75],cafe_int_beam:[0.3,0.6],cafe_int_books:[0.4,0.75],cafe_int_shelf:[0.32,0.65],cafe_int_bar:[0.32,0.65],cafe_int_atlas:[0.35,0.7]};   /* 白天店裡也開燈：從玻璃外看得到暖色的店內 */
  function cafeCanvas(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.flipY=false; t.anisotropy=8; return t; }   /* glTF 的 UV：flipY=false */
  const CAFE_SERIF='"Noto Serif TC","Songti TC","Noto Serif CJK TC","Source Han Serif TC",serif', CAFE_SANS='"Noto Sans TC","PingFang TC","Noto Sans CJK TC","Microsoft JhengHei",sans-serif';
  function cafeSignTex(d){ return cafeCanvas(2048,192,(x,w,h)=>{ x.fillStyle=d.bg||'#3b2a1e'; x.fillRect(0,0,w,h); const gr=x.createLinearGradient(0,0,0,h); gr.addColorStop(0,'rgba(255,240,220,0.06)'); gr.addColorStop(1,'rgba(0,0,0,0.12)'); x.fillStyle=gr; x.fillRect(0,0,w,h);
      x.strokeStyle='rgba(222,200,160,0.55)'; x.lineWidth=3; x.strokeRect(14,12,w-28,h-24); x.fillStyle=d.color||'#f4ead8'; x.textBaseline='middle'; x.textAlign='center'; x.font='600 118px '+CAFE_SERIF; x.fillText(d.sign||'兩點半 Café',w/2,h*0.5+4);
      if(d.sub){ x.font='34px '+CAFE_SANS; x.textAlign='right'; x.fillStyle='rgba(244,234,216,0.75)'; x.fillText(d.sub,w-48,h*0.5+6); } }); }   /* 板面 6.6×0.62 m → 2048×192 */
  function cafeChalkTex(lines,w,h,o){ o=o||{}; return cafeCanvas(w,h,(x,W,H)=>{ x.fillStyle='#26302b'; x.fillRect(0,0,W,H); for(let i=0;i<60;i++){ x.fillStyle='rgba(255,255,255,'+(0.015+((i*37)%7)/400)+')'; x.beginPath(); x.ellipse((i*97)%W,(i*53)%H,30+(i*13)%40,8+(i*7)%10,(i%5)*0.6,0,7); x.fill(); }
      const fs=o.fs||Math.round(H/(lines.length+(o.cup?3.6:3))); const gap=o.cup?1.25:1.35; x.textAlign='center'; x.textBaseline='middle'; x.font='600 '+fs+'px '+CAFE_SANS; lines.forEach((l,i)=>{ x.fillStyle=i===0?'#f6e3b0':'#f2ecdc'; x.fillText(l,W/2,H*(o.top||0.16)+i*fs*gap); });   /* 有咖啡杯時字小一點、行距密一點，杯子放到最下面（之前最後一行被杯子的熱氣蓋住） */
      if(o.cup){ const cx=W/2, cy=H*0.9, r=H*0.042; x.strokeStyle='#f2ecdc'; x.lineWidth=Math.max(2,H/120); x.beginPath(); x.moveTo(cx-r*1.4,cy-r); x.lineTo(cx-r*1.1,cy+r); x.lineTo(cx+r*1.1,cy+r); x.lineTo(cx+r*1.4,cy-r); x.closePath(); x.stroke(); x.beginPath(); x.arc(cx+r*1.6,cy-r*0.1,r*0.5,-1.4,1.4); x.stroke(); for(const dx of [-0.5,0,0.5]){ x.beginPath(); x.moveTo(cx+dx*r,cy-r*1.4); x.quadraticCurveTo(cx+dx*r+r*0.3,cy-r*1.9,cx+dx*r,cy-r*2.4); x.stroke(); } } }); }   /* 黑板：深綠底、粉筆字、手繪咖啡杯 */
  function cafeFacePaint(mesh,tex,nightI,dayI){ const m=mesh.material.clone(); m.map=tex; m.color=new THREE.Color(0xffffff); m.emissive=new THREE.Color(0xffffff); m.emissiveMap=tex; m.roughness=0.85; m.metalness=0; mesh.material=m; if(nightI!=null) TK.addNight(m,nightI,dayI||0); else m.emissiveIntensity=0; m.needsUpdate=true; }
  /* 正式模型的哪些網格要投影：陰影貼圖一格約 4 cm（1024² 蓋 44 m），窗框、鐵窗、冷氣、盆栽、招牌這些小零件的影子看不出來，
     卻要在陰影那一輪整組再畫一次（instancing 的窗一次就是幾萬個三角形）。只讓不是 instancing、由大面組成的網格投影（牆、屋頂、陽台、雨遮…）；招牌面不投影 */
  const WZ_NO_SHADOW=/^(wz_menu_|wz_in_|wz_shop_notes|wz_shutter|cafe_int_|cafe_room_dark|cafe_curtain|ext_glass_lit|wz_room_lit|jp_shoji|cafe_leaf_|cafe_glass|cafe_win_glass|cafe_lampglass|cafe_bulb|cafe_books|cafe_vc_|ck_trim_win|ck_glass|ck_frame|ck_door|ck_ceiling|ck_stone_base|ck_pav_dark|ck_soc_metal|ck_bell_lens|ck_bell_wash)/;   /* ck_*：校園地標的窗框、窗台、窗洞內側、玻璃、深色木作（窗框、門）（小零件，影子看不出來）；拱廊天花板、簷底板、勒腳與地坪（都在屋頂的影子裡或貼地；2026-10-11 校門鏡頭五個地標的陰影那一輪各少兩次 draw call） */   /* 店內、窗內的房間與窗簾、紙拉門、玻璃、燈泡、葉子、Café 的小零件（頂點色合併的 cafe_vc_*）：不投影；貼在牆上的菜單、店內的書與價目、便條、鐵捲門（wz_menu_、wz_in_、wz_shop_notes、wz_shutter；2026-10-16 溫州街效能）也不投影 */
  function wzCastsShadow(o){ if(o.isInstancedMesh||/FACE/.test(o.name)||/^NOSHADOW_/.test(o.name)) return false;   /* NOSHADOW_：公館店面七樓以上的牆、樓板線、屋頂（LAWWW2-C wz_street.py；10-20 決定七樓以上不投影：高樓的影子在馬路上畫出陰影範圍的直線）*/ const g=o.geometry; if(!g||!g.attributes.position) return false; const mn=o.material&&o.material.name||''; if(WZ_NO_SHADOW.test(mn)) return false;
    if(/^wz_vc_/.test(mn)) return true;   /* 溫州街的純色零件合成的頂點色網格（門、鋁框、雨遮、屋頂板、鐵件…，第二輪減量）：整條巷子一個網格、陰影一次 draw call；平均面積混了小零件，不用下面的規則 */
    if(!g.boundingBox) g.computeBoundingBox(); if(g.boundingBox.max.y<0.35) return false;   /* 貼地的（草地、地磚、人行道、路緣）：影子落不到別的東西上 */
    if(g.userData.wzMeanArea===undefined){ const p=g.attributes.position, ix=g.index, n=Math.floor((ix?ix.count:p.count)/3), step=Math.max(1,Math.floor(n/400)); const A=new THREE.Vector3(), B=new THREE.Vector3(), C=new THREE.Vector3(); let a=0, m=0;
      for(let t=0;t<n;t+=step){ const k=t*3; A.fromBufferAttribute(p,ix?ix.getX(k):k); B.fromBufferAttribute(p,ix?ix.getX(k+1):k+1); C.fromBufferAttribute(p,ix?ix.getX(k+2):k+2); a+=B.sub(A).cross(C.sub(A)).length()/2; m++; }
      g.userData.wzMeanArea=m?a/m:0; }
    return g.userData.wzMeanArea>0.1; }   /* 平均三角形面積 > 0.1 m²：牆、屋頂、雨遮、鐵捲門、騎樓天花板這種大面才投影；門把、花盆、窗框、欄杆、信箱這種小零件不投影 */
  function attachCafeExterior(cafe,root,hide){
    for(const m of cafe.children) if(m.isMesh||m.isSprite){ m.visible=false; if(m.isSprite&&m.userData.nightO!==undefined){ m.userData.nightO=0; m.userData.dayO=0; } }   /* 套件的光暈（TK.glowSprite）：TK.setNight 每次依時段重設 visible，只藏起來的話又會出現、疊在正式外觀上（和 attachWenzhouModel 一樣，日夜的亮度都設成 0；LAWWW2 2026-10-21 cafe_glb_integration 量到 7 個）*/
    for(const o of hide||[]) o.visible=false;
    const glows=[];
    root.traverse(o=>{ if(o.userData&&o.userData.glow) glows.push(o); if(!o.isMesh) return; const mt=o.material, nm=mt&&mt.name;
      const glassy=!!(mt&&mt.transparent); o.castShadow=!glassy&&wzCastsShadow(o); o.receiveShadow=!glassy;
      if(o.name==='SIGN_FACE'){ cafeFacePaint(o,cafeSignTex(o.userData),1.1,0.15); return; }
      if(o.name.indexOf('ABOARD_FACE')===0){ cafeFacePaint(o,cafeChalkTex(o.userData.aboard||[],256,336,{cup:true,top:0.15}),null); return; }
      if(o.name==='MENU_FACE'){ cafeFacePaint(o,cafeMenuTex(o.userData.menu||[]),0.35,0.12); return; }
      if(mt&&mt.userData.cafeReg){ const n=CAFE_NIGHT[nm]; if(n) TK.addNight(mt,n[1],n[2]); }   /* 夜間每次接上都要重新登記（見 attachWenzhouModel 的說明）*/
      if(!mt||mt.userData.cafeReg) return; mt.userData.cafeReg=true;
      const n=CAFE_NIGHT[nm]; if(n){ mt.emissive=new THREE.Color(n[0]); TK.addNight(mt,n[1],n[2]); }
      const b=CAFE_BOUNCE[nm]; if(b) TK.bounce(mt,b[0],b[1]);
      if(nm&&nm.indexOf('cafe_leaf_')===0){ mt.alphaTest=Math.max(mt.alphaTest||0,0.5); mt.side=THREE.DoubleSide; } });
    cafe.add(root); root.updateMatrixWorld(true); const v=new THREE.Vector3();
    for(const o of glows){ const d=o.userData; const sp=TK.glowSprite(d.glow,d.size||1.4,d.day||0,d.night==null?1:d.night); cafe.worldToLocal(o.getWorldPosition(v)); sp.position.copy(v); sp.userData.formalGlow=true; cafe.add(sp); }
    cafe.userData.formal=true; return root; }
  /* 溫州街主巷兩側的台北老公寓（第二個 AI：tools/blender/env_second/wz_street.py → bldg.wenzhou_street；GLB 用溫州街的世界座標）。
     套件公寓（userData.wzApt＝A1…A5、B1…B7、C1、C2）的外觀藏起來；導航、鏡頭碰撞、看櫥窗的互動點不在這裡，照舊。
     SIGN_FACE_<棟>／VSIGN_FACE_<棟>_a|b／INTERIOR_FACE_<棟>＝空白板面（自訂屬性帶店名、顏色、店種）：招牌照套件原本的設計（底色、色帶、粗體字、小字）
     但畫成板面的比例（套件的 512×128 貼在 6.5×0.75 m 的招牌上，字被拉寬）；店內景深卡用套件的 TK.interiorTex 依板面寬度重複 */
  /* 亮燈的窗：深色窗玻璃（55% 不透明）在溫州街夜間的環境光下會變淺灰、把燈光蓋掉——亮燈那戶改用比較透明的玻璃（wz_win_glass_lit，30%）＋晚上自己帶一點暖光，窗內房間與窗簾也要夠亮（1.5–1.9） */
  const WZ_NIGHT={wz_signs_lit:[0xffffff,1.1,0.25],   /* 溫州街 v5 的燈箱招牌（設計稿貼圖、emissiveTexture）：晚上亮、白天微亮 */ ext_glass_lit:[0xffcf8f,1.5,0],wz_room_lit:[0xffb866,1.9,0],wz_win_glass_lit:[0xffc070,0.55,0],cafe_bulb:[0xfff1d6,2.2,0.6],wz_tube:[0xffffff,1.3,0.2],jp_lamp:[0xffcf8a,1.6,0.15],jp_shoji:[0xffe2b8,0.7,0],wz_lamp_lens:[0xffe0a0,2.2,0],ck_glass_lit:[0xffd49a,1.0,0],ck_glass:[0xffd49a,1.0,0],ck_pav_dark:[0xffd49a,0.9,0],ck_ceiling:[0xfff2dc,0.04,0.15],ck_bell_lens:[0xfff1d6,1.6,0]};   /* ck_glass_lit：總圖亮燈的窗（約七成，和套件一樣；自發光貼圖由上往下漸暗）；ck_ceiling：拱廊、門廊、屋簷底下白天在陰影裡只有半球光，加一點地面反射上來的光——晚上沒有陽光反射，要比白天暗（第一版晚上 0.3：沒有燈的拱廊天花板整片發亮） */   /* 亮燈的窗（窗簾、房間）、門燈、騎樓日光燈：晚上發光，白天不亮 */   /* ck_bell_lens：傅鐘前面兩盞地燈的燈罩（和套件一樣 1.6） */
  const WZ_SANS='"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif', WZ_SERIF='"Noto Serif TC","Songti TC",serif';
  function wzSignTex(d,wM,hM,vertical){ const H=vertical?Math.round(128*hM/wM):128, W=vertical?128:Math.min(1536,Math.round(128*wM/hM));
    return cafeCanvas(W,H,(x,w,h)=>{ const bg=vertical?d.vBg:d.bg, band=vertical?d.vBand:d.band; x.fillStyle=bg||'#ffffff'; x.fillRect(0,0,w,h);
      if(band){ x.fillStyle=band; if(vertical) x.fillRect(0,0,w*0.18,h); else x.fillRect(0,h*0.8,w,h*0.2); }
      const font=d.serif?WZ_SERIF:WZ_SANS; x.fillStyle=(vertical?d.vColor:d.color)||'#222'; x.textAlign='center'; x.textBaseline='middle';
      if(vertical){ const ch=[...(d.vertical||'')]; const fs=Math.min(w*0.62,(h-30)/Math.max(1,ch.length)*0.8); x.font='bold '+fs+'px '+font; ch.forEach((c,i)=>x.fillText(c,w/2+(band?8:0),h/2+(i-(ch.length-1)/2)*fs*1.25)); return; }
      const t=d.sign||''; let fs=Math.round(h*(d.sub?0.5:0.58)); x.font='bold '+fs+'px '+font; while(x.measureText(t).width>w*0.7&&fs>20){ fs-=4; x.font='bold '+fs+'px '+font; }
      x.fillText(t,w/2,h*(band?0.4:(d.sub?0.42:0.52))); if(d.sub){ x.font='500 '+Math.round(h*0.15)+'px '+font; x.globalAlpha=0.85; x.fillText(d.sub,w/2,band?h*0.9:h*0.82); x.globalAlpha=1; } }); }
  /* 機車 v2（LAWWW2-B，tools/blender/env_second/scooters_v2.py；使用者 2026-10-16：「機車都只是同個模板換顏色，太假了……路上不會全部都一樣，不要只改顏色」）：
     scooter.glb 有 12 款（節點 scooter_<代號>：國民通勤兩款、運動型、電動、復古圓弧、50cc 舊款、大型速克達、方塊越野、彎樑、外送箱、掛安全帽、機車罩）＋每款一個遠處用的簡化版 scooter_<代號>_lod1；
     節點的 extras（userData）：weight＝街上的比例、palette＝這一型常見的車殼顏色。
     每台照自己的位置挑一款（照 weight）、從那一款的配色挑顏色（位置算的雜湊：每次進來都一樣）；
     每一段（公館照 grp、溫州街照位置每 20 m 一段、路的兩側分開）合成一個網格、一個材質（頂點色；粗糙度／金屬度用 3×1 的查表貼圖：車殼／塑膠橡膠／金屬），
     外面包 THREE.LOD：離鏡頭 SC_LOD_D 公尺以外換簡化版（約 600 個三角形）。看不到的那一段整段剔除。
     沒有新節點（舊的 scooter.glb）時照舊用 scooter_a／scooter_b（attachWzScootersAB）。 */
  const SC_LOD_D=16;
  let scMat=null;
  function scooterMat(){ if(scMat) return scMat;
    const d=new Uint8Array([0,82,0,255, 0,140,0,255, 0,82,115,255]);   /* G＝粗糙度（0.32／0.55／0.32）、B＝金屬度（0／0／0.45）：和 GLB 的三個材質一樣 */
    const t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat); t.needsUpdate=true;
    scMat=new THREE.MeshStandardMaterial({vertexColors:true,roughnessMap:t,metalnessMap:t,roughness:1,metalness:1}); scMat.name='scooter_merged'; return scMat; }
  function scMerge(items,center){   /* items：[{node, M4（這台車的世界矩陣，已轉成車頭朝 +x）, color}] → 一個 BufferGeometry（位置相對 center） */
    const P=[],N=[],C=[],U=[],I=[]; let base=0; const v=new THREE.Vector3(), n=new THREE.Vector3(), nm=new THREE.Matrix3(), col=new THREE.Color(), M=new THREE.Matrix4(), inv=new THREE.Matrix4(), loc=new THREE.Matrix4();
    for(const it of items){ inv.copy(it.node.matrixWorld).invert(); col.set(it.color);
      it.node.traverse(o=>{ if(!o.isMesh) return; const g=o.geometry, mn=o.material.name, slot=mn==='scooter_paint'?0:mn==='scooter_metal'?2:1;
        M.multiplyMatrices(it.M4,loc.multiplyMatrices(inv,o.matrixWorld)); nm.getNormalMatrix(M);
        const pa=g.attributes.position, na=g.attributes.normal, ca=g.attributes.color, u=(slot+0.5)/3, mc=o.material.color;
        for(let k=0;k<pa.count;k++){ v.fromBufferAttribute(pa,k).applyMatrix4(M); P.push(v.x-center.x,v.y-center.y,v.z-center.z); n.fromBufferAttribute(na,k).applyMatrix3(nm).normalize(); N.push(n.x,n.y,n.z);
          if(slot===0) C.push(col.r,col.g,col.b); else if(ca) C.push(ca.getX(k),ca.getY(k),ca.getZ(k)); else C.push(mc.r,mc.g,mc.b); U.push(u,0.5); }
        if(g.index){ const ix=g.index; for(let k=0;k<ix.count;k++) I.push(base+ix.getX(k)); } else for(let k=0;k<pa.count;k++) I.push(base+k);
        base+=pa.count; }); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
    geo.setIndex(base>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1)); geo.computeBoundingSphere(); return geo; }
  function attachWzScooters(g,scG,list,root,name,lodD){ if(!list.length) return 0; root.updateMatrixWorld(true);   /* lodD：近的模型換成簡化版的距離（預設 SC_LOD_D；118 巷 9 m：本來就 55～60 萬三角形，X69 卡）*/
    const V=[]; root.traverse(o=>{ const m=/^scooter_(S\w+)$/.exec(o.name); if(!m||/_lod1$/.test(o.name)||!o.userData||!(o.userData.weight>0)) return; let pal=[]; try{ pal=JSON.parse(o.userData.palette||'[]'); }catch(e){}
      V.push({code:m[1],node:o,lod:root.getObjectByName(o.name+'_lod1')||o,w:+o.userData.weight,pal}); });
    if(!V.length) return attachWzScootersAB(g,scG,list,root,name);
    const W=V.reduce((a,b)=>a+b.w,0), fix=new THREE.Matrix4().makeRotationY(-Math.PI/2), out=new THREE.Group(); out.name=name||'wz_scooters_glb';
    const hash=(x,z,k)=>{ const t=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453; return t-Math.floor(t); };
    const grps=new Map(), pick={}, cols=new Set();
    list.forEach(s=>{ s.o.updateMatrixWorld(true); const p=new THREE.Vector3().setFromMatrixPosition(s.o.matrixWorld); const gk=s.grp||(Math.floor((p.x+100)/20)+(p.z<0?'n':'s'));
      let r=hash(p.x,p.z,1)*W, v=V[V.length-1]; for(const c of V){ if((r-=c.w)<=0){ v=c; break; } }
      const col=v.pal.length?v.pal[Math.floor(hash(p.x,p.z,2)*v.pal.length)]:s.color; pick[v.code]=(pick[v.code]||0)+1; cols.add(col);
      if(!grps.has(gk)) grps.set(gk,[]); grps.get(gk).push({p,v,col,M4:new THREE.Matrix4().multiplyMatrices(s.o.matrixWorld,fix)}); });
    for(const [gk,L] of grps){ const c=new THREE.Vector3(); L.forEach(e=>c.add(e.p)); c.divideScalar(L.length);
      const near=new THREE.Mesh(scMerge(L.map(e=>({node:e.v.node,M4:e.M4,color:e.col})),c),scooterMat()), far=new THREE.Mesh(scMerge(L.map(e=>({node:e.v.lod,M4:e.M4,color:e.col})),c),scooterMat());
      for(const m of [near,far]){ m.castShadow=false; m.receiveShadow=true; }
      const lod=new THREE.LOD(); lod.position.copy(c); lod.addLevel(near,0); lod.addLevel(far,lodD||SC_LOD_D); lod.name='scooters_'+gk; lod.userData.scGroup=gk; out.add(lod); }
    out.userData.scPick=pick; out.userData.scColors=cols.size; out.userData.scPerGroup=Object.fromEntries([...grps].map(([k,L])=>[k,L.length]));   /* 每一款擺了幾台、用了幾種顏色（測試、截圖紀錄用） */
    scooterShadows(out,list,fix); scG.visible=false; g.add(out); return list.length; }
  /* 影子：機車不進陰影那一輪，改成每台車底下一片柔和的影子貼片（全部一個 InstancedMesh、一次 draw call） */
  function scooterShadows(out,list,fix){ const tex=W3.canvasTex('wzScooterBlob',64,64,(x,w,h)=>{ const gr=x.createRadialGradient(w/2,h/2,1,w/2,h/2,w/2); gr.addColorStop(0,'rgba(0,0,0,0.6)'); gr.addColorStop(0.55,'rgba(0,0,0,0.35)'); gr.addColorStop(1,'rgba(0,0,0,0)'); x.clearRect(0,0,w,h); x.fillStyle=gr; x.fillRect(0,0,w,h); });
    const geo=new THREE.PlaneGeometry(2.05,0.8); geo.rotateX(-Math.PI/2); geo.translate(0,0.012,0); const bl=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({map:tex,color:0x000000,transparent:true,depthWrite:false}),list.length); const M4=new THREE.Matrix4();
    list.forEach((s,i)=>{ M4.multiplyMatrices(s.o.matrixWorld,fix); bl.setMatrixAt(i,M4); }); bl.instanceMatrix.needsUpdate=true; bl.computeBoundingSphere(); bl.name='wz_scooter_shadows'; out.add(bl); }
  /* 機車（tools/blender/env_second/scooter.py：scooter_a 現代款、scooter_b 復古款；車頭朝 +x）→ 每一款每一個零件一個 InstancedMesh，擺在套件機車的位置（套件車頭朝 +z）；
     車殼（scooter_paint，白色）乘上每台的顏色（instanceColor）。三台裡一台是復古款。
     list 的 grp（公館）：每一組各自一套 InstancedMesh（看不到的那一組整組被剔除）；溫州街沒有 grp＝全部一組（和分組之前一樣） */
  function attachWzScootersAB(g,scG,list,root,name){ const vars={a:root.getObjectByName('scooter_a'),b:root.getObjectByName('scooter_b')}; if(!vars.a||!vars.b||!list.length) return 0;
    const fix=new THREE.Matrix4().makeRotationY(-Math.PI/2), out=new THREE.Group(); out.name=name||'wz_scooters_glb'; const grps=new Map(); list.forEach((s,i)=>{ const gk=s.grp||''; if(!grps.has(gk)) grps.set(gk,{a:[],b:[]}); grps.get(gk)[i%3===2?'b':'a'].push(s); }); root.updateMatrixWorld(true);
    for(const [gk,by] of grps) for(const k of ['a','b']){ const node=vars[k], L=by[k]; if(!L.length) continue; const inv=new THREE.Matrix4().copy(node.matrixWorld).invert(); const meshes=[]; node.traverse(o=>{ if(o.isMesh) meshes.push(o); });
      for(const m of meshes){ const local=new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld); const im=new THREE.InstancedMesh(m.geometry,m.material,L.length); const paint=m.material.name==='scooter_paint'; const M4=new THREE.Matrix4();
        L.forEach((s,i)=>{ s.o.updateMatrixWorld(true); M4.multiplyMatrices(s.o.matrixWorld,fix).multiply(local); im.setMatrixAt(i,M4); if(paint) im.setColorAt(i,new THREE.Color(s.color)); });
        im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true; im.castShadow=false; im.receiveShadow=true; im.computeBoundingSphere(); if(gk) im.userData.scGroup=gk; out.add(im); } }
    /* 影子：機車不進陰影那一輪（39 台×1.5k 個三角形要再畫一次），改成每台車底下一片柔和的影子貼片（全部一個 InstancedMesh、一次 draw call） */
    { const tex=W3.canvasTex('wzScooterBlob',64,64,(x,w,h)=>{ const gr=x.createRadialGradient(w/2,h/2,1,w/2,h/2,w/2); gr.addColorStop(0,'rgba(0,0,0,0.6)'); gr.addColorStop(0.55,'rgba(0,0,0,0.35)'); gr.addColorStop(1,'rgba(0,0,0,0)'); x.clearRect(0,0,w,h); x.fillStyle=gr; x.fillRect(0,0,w,h); });
      const geo=new THREE.PlaneGeometry(2.05,0.8); geo.rotateX(-Math.PI/2); geo.translate(0,0.012,0); const bl=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({map:tex,color:0x000000,transparent:true,depthWrite:false}),list.length); const M4=new THREE.Matrix4();
      list.forEach((s,i)=>{ M4.multiplyMatrices(s.o.matrixWorld,fix); bl.setMatrixAt(i,M4); }); bl.instanceMatrix.needsUpdate=true; bl.computeBoundingSphere(); bl.name='wz_scooter_shadows'; out.add(bl); }
    scG.visible=false; g.add(out); return list.length; }
  function wzPlateTex(d,wM,hM){ const vert=hM>wM, S=d.serif?128:96, W=vert?S:Math.round(S*wM/hM), H=vert?Math.round(S*hM/wM):S;   /* 門牌（藍底白字，直式）、告示牌（白底紅字） */
    if(d.serif&&!vert) return cafeCanvas(W,H,(x,w,h)=>{ x.fillStyle=d.bg||'#ffffff'; x.fillRect(0,0,w,h);   /* serif：石材匾額（總圖）：刻字一樣的大字、字距拉開、一圈細的內框（門牌那種粗外框在匾額上像黑色相框） */
      x.strokeStyle=d.color||'#222'; x.globalAlpha=0.45; x.lineWidth=2; x.strokeRect(h*0.08,h*0.08,w-h*0.16,h-h*0.16); x.globalAlpha=1;
      const ch=[...(d.text||'')], fs=Math.round(h*(d.fs||0.6)), span=Math.min(w*0.74,ch.length*fs*1.55);   /* d.fs：字高是板面高的幾倍（行政大樓的檐部匾額比較扁，字放大到 0.72） */ x.font='bold '+fs+'px '+WZ_SERIF; x.fillStyle=d.color||'#222'; x.textAlign='center'; x.textBaseline='middle';
      ch.forEach((c,i)=>x.fillText(c,w/2-span/2+span*(i+0.5)/ch.length,h*0.53)); });
    return cafeCanvas(W,H,(x,w,h)=>{ x.fillStyle=d.bg||'#ffffff'; x.fillRect(0,0,w,h); x.strokeStyle=d.color||'#222'; x.lineWidth=Math.max(3,w*0.04); x.strokeRect(x.lineWidth,x.lineWidth,w-x.lineWidth*2,h-x.lineWidth*2);
      x.fillStyle=d.color||'#222'; x.textAlign='center'; x.textBaseline='middle';
      if(vert){ const ch=[...(d.text||'')], fs=Math.min(w*0.56,h*(d.sub?0.6:0.8)/Math.max(1,ch.length)/1.1); x.font='bold '+fs+'px '+WZ_SANS; ch.forEach((c,i)=>x.fillText(c,w/2,h*0.07+fs*0.62+i*fs*1.1)); if(d.sub){ x.font='bold '+Math.round(Math.min(w*0.3,h*0.14))+'px '+WZ_SANS; x.fillText(d.sub,w/2,h*0.86); } return; }
      x.font='bold '+Math.round(h*(d.sub?0.34:0.5))+'px '+WZ_SANS; x.fillText(d.text||'',w/2,h*(d.sub?0.36:0.52)); if(d.sub){ x.font='bold '+Math.round(h*0.26)+'px '+WZ_SANS; x.fillText(d.sub,w/2,h*0.72); } }); }
  /* 溫州街小公園（ART-WZ1 擴大版，LAWWW2-B 48aed1c9／ceb545f2；AA_164 第 5 節）：導航格、座位、路燈的地面光圈都照 WZ_PARK_LAYOUT（Blender 模型 tools/blender/env_second/wz_park.py 讀同一份）。
     入口段 x 20.2–31.8、z 5–17（主巷進來）＋A3、A4 後面的主園區 x 8.4–36、z 17–29（西北角是巷底那棟 F1）；入口 B 從北巷（x 3.3–8.2）進來。
     外觀是正式模型 bldg.wz_park；載入前、載入失敗時的備用（D38 ③）：草地、樹、長椅、路燈用套件，涼亭、遊戲場這些用低矮的色塊標出位置（不是隱形牆），模型載入後藏起來（userData.wzParkFb）。
     互動點（公布欄、象棋、土地公、直飲台）和貓的事件照 AA_171（src/wzpark3d.js；AA_164 5-4、5-6，DL-09／DL-13）；公園的路人照 AA_283（crowd3d.js 的 CROWD.parkSpots；下雨貓在涼亭的石桌底下、象棋的互動點藏起來）。改這裡要跑 node tests/wz_park_unit.js、node tests/wz_park_people_unit.js、tests/reachability_all.py、tests/touch_flow_wenzhou.py */
  /* 溫州街的貓（ART-WZ5，bldg.wz_cat）：三個姿勢留一個（原點＝四腳中間的地面、頭朝 +z）；照學期換樣子（AA_171 第 7 節、LAWWW2-B 的說明）：
     大二上胖（fat 1.0）、大二下瘦一點（0.5）；大三起有項圈名牌；大三上第 11 週（貓不見的第 10 週之後那一週，AA_420 6-1）左前腳有繃帶；大四毛色淡（cat_fur_old）*/
  function wzCatModel(root,G,pose){ const T=G&&typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, id=T?T.id:'', yr=+id.charAt(1)||1;
    const fat=id==='Y2S1'?1:(id==='Y2S2'?0.5:0), tag=yr>=3, band=id==='Y3S1'&&T.week===11, old=yr>=4;
    let oldMat=null; root.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name==='cat_fur_old') oldMat=o.material; });
    if(pose==='curl'&&!root.getObjectByName('CAT_curl')) pose='lie';   /* CAT_curl（寒流縮成一團，LAWWW2-B 10-23）：舊的模型沒有，退回趴姿 */
    const keep=root.getObjectByName('CAT_'+pose); if(!keep) return null;
    for(const n of ['sit','lie','walk','curl']){ const o=root.getObjectByName('CAT_'+n); if(o) o.visible=n===pose; }
    const holder=root.getObjectByName('CAT_fur_old_holder'); if(holder) holder.visible=false;
    keep.position.set(0,0,0);
    keep.traverse(o=>{ if(/_tag$/.test(o.name)) o.visible=tag; if(/_bandage$/.test(o.name)) o.visible=band;
      if(!o.isMesh) return; o.castShadow=false; o.receiveShadow=true;
      if(o.morphTargetDictionary&&o.morphTargetInfluences&&o.morphTargetDictionary.fat!=null) o.morphTargetInfluences[o.morphTargetDictionary.fat]=fat;
      if(old&&oldMat&&o.material&&o.material.name==='cat_fur') o.material=oldMat; });
    const out=new THREE.Group(); out.name='wz_cat_glb'; out.add(keep); out.userData.catState={pose,fat,tag,band,old}; return out; }
  function buildWzPark(E,g,nav,open,pkTag,pools,place){ const L=WZ_PARK_LAYOUT, A=L.area, f=A.front, b=A.back;
    open(f.x0+0.1,4,f.x1-0.1,f.z1); open(b.x0+0.1,b.z0,b.x1-0.1,b.z1-0.1);
    if(b.cut) nav.blockRect((b.x0+b.cut.x1)/2,(b.cut.z0+b.z1)/2+0.5,b.cut.x1-b.x0,b.z1-b.cut.z0+1,0,0);   // 西北角：巷底那棟 F1（x 8.4～11.8）
    open(A.entranceB.x-0.4,A.entranceB.z0,A.entranceB.x+0.2,A.entranceB.z1);   // 入口 B：北巷接主園區
    const pav=L.items.find(i=>i.kind==='pavilion');
    for(const k of L.blocks){ if(Array.isArray(k)){ if(pav&&Math.abs(k[0]-pav.x)<0.01&&Math.abs(k[1]-pav.z)<0.01) continue; nav.blockRect(k[0],k[1],k[2],k[3],0,0); } else if(k.type==='circle') nav.blockCircle(k.x,k.z,k.r); }
    /* 涼亭走得進去（石凳是座位）：layout 把整個涼亭擋住，改成只擋圓石桌、東西兩張石凳（裝飾）、四根柱子；地台 0.14 m（wz_park.py 的石基座）*/
    if(pav){ const h=pav.w/2-0.2; nav.blockCircle(pav.x,pav.z,0.62); for(const sx of [-0.95,0.95]) nav.blockCircle(pav.x+sx,pav.z,0.22); for(const a of [-1,1]) for(const b of [-1,1]) nav.blockRect(pav.x+a*h,pav.z+b*h,0.4,0.4,0,0);
      nav.addSurf({x0:pav.x-pav.w/2,x1:pav.x+pav.w/2,z0:pav.z-pav.d/2,z1:pav.z+pav.d/2,y:0.14}); }
    { const fo=L.items.find(i=>i.kind==='drinking_fountain'); if(fo) nav.blockRect(fo.x+1.05,fo.z+0.05,1.5,1.3,0,0); }   /* 直飲台、東側花籬和 A4 之間的小縫（只有一點站得住，滑進去出不來：v9.3 #31 那種孤島）*/
    const hedge=L.items.find(i=>i.kind==='azalea_hedge'); if(hedge) for(const [x0,z0,x1,z1] of hedge.segments) nav.blockRect((x0+x1)/2,(z0+z1)/2,Math.abs(x1-x0)+0.6,Math.abs(z1-z0)+0.6,0,0);   // 杜鵑花籬（layout 的 blocks 沒列）：0.6 m 厚
    /* 座位與互動（AA_171，src/wzpark3d.js 的 PARK）：老樹下的圓椅＝坐在樹下（20 分）、鞦韆＝20:00 以後才能盪；公布欄、象棋、土地公、直飲台照 layout 的 interact */
    const swg=L.items.find(i=>i.kind==='swings');
    for(const st of L.seats){ const pk=st.kind==='swing'?'swing':(/老樹下的圓椅/.test(st.label||'')?'tree':null);
      const ap=pk==='swing'?[st.x,(swg?swg.z:st.z)-1.4]:null;   /* 鞦韆：座位在座板上（ART-PARK2），前後左右 0.9 m 內都在鞦韆架的導航阻擋（z 23.9～25.7）裡，從架子前面走近（QA-HANDOFF-B1 reachability_all）*/
      E.interactables.push(Object.assign({x:st.x,z:st.z,radius:1.3,label:st.label,seat:Object.assign({x:st.x,z:st.z,yaw:st.yaw},ap?{ap}:{})},pk?{park:pk}:{})); }
    for(const q of (L.interact||[])){ const it={x:q.x,z:q.z,radius:1.4,label:q.label,park:q.kind};
      if(q.kind==='chess') Object.defineProperty(it,'hidden',{enumerable:true,get(){ const G=typeof GAME!=='undefined'&&GAME.G; return !!(G&&typeof PARK!=='undefined'&&PARK.rainy&&PARK.rainy(G)); }});   /* 下雨公園一個人都沒有＝沒有人下象棋（AA_283 第 1 節）*/
      E.interactables.push(it); }
    const G0=typeof GAME!=='undefined'&&GAME.G, catHere=!(typeof PARK!=='undefined'&&G0&&PARK.catLost(G0));   /* 大三上第 10 週貓不見了（AA_166 線四；AA_420 6-1）*/
    const ring=L.items.find(i=>i.kind==='ring_bench'), under=!!(catHere&&pav&&typeof PARK!=='undefined'&&G0&&PARK.catUnder&&PARK.catUnder(G0));   /* 下雨：貓躲在涼亭的石桌底下（AA_164 5-2、AA_283 第 1 節；石桌在涼亭中間，地台 0.14 m）*/
    const catAt=under?{x:pav.x+0.3,z:pav.z+0.05,yaw:Math.PI/2,y:0.14}:(ring?{x:ring.x,z:ring.z+(ring.r||1.45),yaw:Math.PI}:null);
    if(catAt&&catHere){ const nm=typeof PARK!=='undefined'&&G0?PARK.catName(G0):null, Gn=()=>typeof GAME!=='undefined'&&GAME.G;   /* 名字、藏起來照 PARK（AA_397 第 3 節：寒流那一週只能「看」、收養以後「看圓椅」一次就藏起來；src/wzpark3d.js catLabel／catHidden）*/
      E.interactables.push({x:catAt.x,z:catAt.z+(under?0:0.2),radius:1.4,get label(){ const G=Gn(); return G&&typeof PARK!=='undefined'&&PARK.catLabel?PARK.catLabel(G):(nm?'摸摸'+nm:'那隻貓'); },get hidden(){ const G=Gn(); return !!(G&&typeof PARK!=='undefined'&&PARK.catHidden&&PARK.catHidden(G)); },park:'cat'}); }
    for(const it of L.items) if(it.kind==='park_lamp'){ const pool=TK.lightPool(4.2,'rgba(255,214,150,1)'); pool.position.set(it.x,0.03,it.z); g.add(pool); pools.push(pool); }
    // 睡在老樹圓椅上的橘白色胖貓（AA_164 5-1、AA_171 第 7 節；3D 正式模型是 ART-WZ5，到之前用套件的貓）
    { const bf=catAt&&catHere?{x:catAt.x-0.05,z:catAt.z+0.45,yaw:catAt.yaw-Math.PI/2}:null; if(bf){ const cat=new TK.Bin(); const fur=TK.paint('#d98a3c'), furL=TK.paint('#f0c08a'), dk=TK.paint('#5a3a22'); const cy=0.5;
        const body=new THREE.SphereGeometry(0.2,14,9); body.scale(1.0,0.5,0.72); cat.add(fur,body,0,cy+0.08,0,0.3);
        cat.add(fur,new THREE.SphereGeometry(0.085,12,8),0.15,cy+0.07,-0.07,0); cat.add(furL,new THREE.SphereGeometry(0.04,8,6),0.2,cy+0.05,-0.12,0);
        for(const ex of [-0.04,0.04]) cat.add(fur,new THREE.ConeGeometry(0.028,0.06,4),0.15+ex,cy+0.15,-0.06,0);
        cat.add(dk,new THREE.TorusGeometry(0.16,0.026,6,14,Math.PI*1.1),-0.02,cy+0.035,-0.02,0.4,{rx:-Math.PI/2});
        const cg=new THREE.Group(); cat.build(cg); cg.traverse(o=>{ if(o.isMesh) o.castShadow=false; }); cg.position.set(bf.x+0.05,0,bf.z-0.45); cg.rotation.y=bf.yaw+Math.PI/2;
        const catG=new THREE.Group(); catG.name='wz_cat'; catG.userData.dyn=true; catG.add(cg); g.add(catG);
        /* 被子晴收養以後（PARK.catAdopted：12/14 23:00 起，或那一場演完）公園不顯示貓（WZ-CAT-LIFE-1023，AA_397 第 3 節）：每一格看，玩家待在公園裡過了 23:00 也會不見；「看圓椅」的互動點照 PARK.catHidden */
        { let shown=true; Object.defineProperty(catG,'visible',{configurable:true,get(){ const G=typeof GAME!=='undefined'&&GAME.G; return shown&&!(G&&typeof PARK!=='undefined'&&PARK.catAdopted&&PARK.catAdopted(G)); },set(v){ shown=!!v; }}); }   /* dyn：不參加整區靜態合併（正式模型載入後要藏起套件的貓）*/
        if(under){ catG.position.y=catAt.y-0.45; catG.userData.under=true; }   /* 套件的貓、正式模型（0.47）都是照圓椅的座面（0.45 m）放的：石桌底下整組放低到涼亭的地台上 */
        if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.wz_cat']) ASSETS.loadOne('bldg.wz_cat').then(c=>{ if(!c||!c.scene) return;
          if(!under&&typeof WZCAT!=='undefined'&&WZCAT.attach(E,catG,c,{G:G0,lie:{x:bf.x+0.05,y:0.47,z:bf.z-0.45,yaw:bf.yaw+Math.PI}})){ cg.visible=false; return; }   /* 白天醒著：有骨架的貓在公園裡走（src/wzcat3d.js，J13）；晚上、下雨、寒流照舊趴著／縮著 */
          const m=wzCatModel(c.scene.clone(true),G0,(typeof PARK!=='undefined'&&G0&&PARK.catCold&&PARK.catCold(G0))?'curl':'lie');   /* 寒流那一週縮成一團（石桌底下，catUnder 已經照寒流放）*/ if(!m) return;
          m.position.set(bf.x+0.05,0.47,bf.z-0.45); m.rotation.y=bf.yaw+Math.PI; cg.visible=false; catG.add(m); }).catch(e=>console.warn('貓的正式模型載入失敗，用套件的貓',e)); } }
    // 備用外觀（模型載入後藏起來）
    const fb=o=>{ pkTag(o); o.userData.wzParkFb=true; return o; };
    const grassM=new THREE.MeshStandardMaterial({map:(()=>{ const t=W3.grassTex().clone(); t.needsUpdate=true; t.repeat.set(5,5); return t; })(),roughness:0.95});
    for(const [x0,z0,x1,z1] of [[f.x0,f.z0,f.x1,f.z1],[b.x0,b.z0,b.x1,b.z1]]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),grassM); m.rotation.x=-Math.PI/2; m.position.set((x0+x1)/2,0.01,(z0+z1)/2); m.receiveShadow=true; g.add(fb(m)); }
    const box=(c,x,z,w,d,h)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),TK.col(c)); m.position.set(x,h/2,z); m.castShadow=true; g.add(fb(m)); };
    for(const it of L.items){ const k=it.kind;
      if(/^tree_/.test(k)){ const t=TK.tree(k==='tree_bischofia'?10.5:7.5,k==='tree_bischofia'?7:undefined); place(g,t,it.x,it.z,0); fb(t); }
      else if(k==='bench'){ const bn=BENCH(); place(g,bn,it.x,it.z,it.yaw||0); fb(bn); }
      else if(k==='park_lamp'){ const lp=W3.lampPost(); place(g,lp,it.x,it.z,0); fb(lp); }
      else if(k==='pavilion') box('#8a3a2a',it.x,it.z,it.w,it.d,0.5);
      else if(k==='playground') box('#c9784a',it.x,it.z,it.w,it.d,0.35);
      else if(k==='swings') box('#5a6a7a',it.x,it.z,it.w||3.8,1.6,0.4);
      else if(/^fitness_/.test(k)) box('#3f7a5a',it.x,it.z,0.8,1.2,0.6);
      else if(k==='tudigong_shrine') box('#9c2f2a',it.x,it.z,1.1,0.9,0.9);
      else if(k==='notice_board') box('#2f4a3a',it.x,it.z,1.6,0.25,1.2);
      else if(k==='drinking_fountain') box('#8c9aa0',it.x,it.z,0.5,0.5,0.9);
      else if(k==='bike_rack') box('#5a5550',it.x,it.z,0.6,2.4,0.4);
      else if(k==='ring_bench') box('#8a6a4a',it.x,it.z,3.2,3.2,0.45);
      else if(k==='azalea_hedge') for(const [x0,z0,x1,z1] of it.segments) box('#3f6a3a',(x0+x1)/2,(z0+z1)/2,Math.abs(x1-x0)+0.6,Math.abs(z1-z0)+0.6,0.8); } }
  /* 季節節點（LAWWW2-B）：SEASON_AZALEA_on／_off（3 月杜鵑開）、SEASON_SWEETGUM_on_*／_off_*（12～1 月楓香紅葉）；那個季節顯示 _on、藏 _off，其他月份相反。月份照遊戲日期（進區域時決定） */
  /* ICECLOSED（溫州街 v5 的夏日冰菓室）：AA_164 1-2「只在 5～9 月拉開鐵門」——10～4 月顯示 _on（鐵捲門、冬天休息）*/
  function wzParkSeason(root){ let m=6; try{ const G=typeof GAME!=='undefined'&&GAME.G; if(G&&typeof CALENDAR!=='undefined') m=CALENDAR.dateOf(G.day).m; }catch(e){}
    root.traverse(o=>{ const k=/^SEASON_([A-Z]+)_(on|off)/.exec(o.name||''); if(!k) return; const on=k[1]==='AZALEA'?m===3:(k[1]==='SWEETGUM'?(m===12||m===1):(k[1]==='ICECLOSED'?!(m>=5&&m<=9):false)); o.visible=(k[2]==='on')===on; }); return m; }
  /* 阿德影印的狀態（WZ_COPY_SHOP，wz_events.js 1-5／wzlines3d.js）：'moved'｜'stay'｜''（還沒決定）；節點顯示的規則；店門在哪裡 */
  function wzCopyState(G){ const v=G&&G.flags&&G.flags.WZ_COPY_SHOP; return v==='moved'||v==='stay'?v:''; }
  function wzCopyVis(name,st){ return name==='COPY_CORNER_OPEN'||name==='COPY_A1_SHUT'?st==='moved':(name==='COPY_A1_RENEW'?st==='stay':st!=='moved'); }
  function wzCopyAt(G){ const L=typeof WZ_SHOPS_LAYOUT!=='undefined'?WZ_SHOPS_LAYOUT.print:null; return L&&L.moved&&wzCopyState(G)==='moved'?L.moved.enterAt:(L?L.enterAt:{x:-8,z:4.6}); }
  function attachWenzhouModel(E,g,root,tag,name,tagVal){ let n=0; const box=new THREE.Box3(), sz=new THREE.Vector3(); const signFaces=[], plateFaces=[], intFaces=[];   /* tag＝套件建築上的標記（wzApt 公寓、wzJp 日式宿舍與院牆、ggShop 公館店面、ckTag 校園地標）；tagVal：只藏標記等於這個值的（校園一棟一個模型） */
    for(const b of g.children) if(b.userData&&b.userData[tag]&&(tagVal===undefined||b.userData[tag]===tagVal)){ if(b.isMesh) b.visible=false; else for(const m of b.children) if(m.isMesh||m.isSprite){ m.visible=false; if(m.isSprite&&m.userData.nightO!==undefined){ m.userData.nightO=0; m.userData.dayO=0; } } b.userData.formal=true; n++; }   /* 套件的光暈（TK.glowSprite）：TK.setNight 每次會依時段重設 visible，只藏起來的話晚上又會出現（和正式模型的光暈疊在一起）→ 日夜的亮度都設成 0 */
    const glows=[];
    root.traverse(o=>{ if(o.userData&&o.userData.glow) glows.push(o); if(!o.isMesh) return; const ud=o.userData||{}, mt=o.material, nm=mt&&mt.name; const glassy=!!(mt&&mt.transparent); o.castShadow=!glassy&&wzCastsShadow(o); o.receiveShadow=!glassy;
      if(/^PLATE_FACE_/.test(o.name)){ o.geometry.computeBoundingBox(); box.copy(o.geometry.boundingBox).getSize(sz); cafeFacePaint(o,wzPlateTex(ud,Math.max(sz.x,sz.z),sz.y),null); o.castShadow=false; plateFaces.push(o); return; }
      if(/^(V?SIGN|INTERIOR)_FACE_/.test(o.name)){ o.geometry.computeBoundingBox(); box.copy(o.geometry.boundingBox).getSize(sz); const wM=Math.max(sz.x,sz.z), hM=sz.y; o.castShadow=false;
        if(o.name.indexOf('SIGN_FACE_')===0){ cafeFacePaint(o,wzSignTex(ud,wM,hM,false),0.9,0); signFaces.push(o); return; }
        if(o.name.indexOf('VSIGN_FACE_')===0){ cafeFacePaint(o,wzSignTex(ud,wM,hM,true),1.0,0); signFaces.push(o); return; }
        const r=Math.max(1,Math.round(wM/hM/2)), t=TK.interiorTex(ud.interior||'cafe').clone(); t.flipY=false; t.wrapS=THREE.RepeatWrapping; t.needsUpdate=true;
        if(!(r>1&&wzSplitQuadU(o,r))) t.repeat.set(r,1);   /* 店內景深卡（LAWWW2-C 2026-10-21）：要合成 atlas，atlas 裡不能重複貼圖 → 重複幾次就把板面切成幾塊，每一塊貼一整張 */
        cafeFacePaint(o,t,null); intFaces.push(o); return; }
      if(mt&&(nm==='wz_road'||/^wz_road_(main|ns|side)$/.test(nm))){ if(mt.map){ mt.map.userData.asphalt=true; mt.map.anisotropy=Math.min(8,E.renderer.capabilities.getMaxAnisotropy()); mt.map.needsUpdate=true; } if(E.roadMats&&E.roadMats.indexOf(mt)<0) E.roadMats.push(mt); }   /* 溫州街的正式路面（LAWWW2-B 精修第 3 批 f0c2bfec，wz_props.glb：主巷、Café 前南北向路、三條側巷）：和套件的柏油一樣入夜變暗；斜看不糊（anisotropy）。放在 wzReg 前面：第二次進溫州街時 E.roadMats 是新的 */
      /* 夜間的登記每次接上都要重做（LAWWW2-C 2026-10-18，男一舍遊戲內截圖）：正式模型的材質和 ASSETS 的快取共用（c.scene.clone(true) 不複製材質），
         離開區域時 disposeGroup → TK.forget 會把它們從夜間清單拿掉；wzReg 擋住的話第二次進來就不會再登記——窗、燈的亮度停在第一次接上時的樣子
         （白天第一次進來：之後天黑窗也不亮；晚上第一次進來：白天窗也亮著）。TK.addNight 自己會去重複 */
      if(mt&&mt.userData.wzReg){ const nn=WZ_NIGHT[nm]; if(nn) TK.addNight(mt,nn[1],nn[2]); if(nm==='ck_bell_wash') TK.addNight(mt,0.75,0); }
      if(!mt||mt.userData.wzReg) return; mt.userData.wzReg=true;
      const nn=WZ_NIGHT[nm]; if(nn){ mt.emissive=new THREE.Color(nn[0]); TK.addNight(mt,nn[1],nn[2]); }
      if((nm==='ck_glass'||nm==='ck_pav_dark')&&mt.emissiveMap){ const t=mt.emissiveMap; t.generateMipmaps=false; t.minFilter=THREE.LinearFilter; t.needsUpdate=true; }   /* 校園地標的玻璃：亮燈、沒亮燈的窗同一個材質，自發光貼圖左半黑、右半燈光（campus_hall.py）；不用 mipmap，遠處左右兩半才不會混在一起（沒亮燈的窗發光） */
      if(nm==='jp_shoji'){ mt.emissiveMap=mt.map; }   /* 紙拉門：亮燈時整片紙發光、木格比較暗 */
      if((/^wz_pillar_/.test(nm)||nm==='wz_pole_concrete'||nm==='gt_palm_bark'||nm==='gt_palm')&&E.patchSeeThrough){ mt.userData.seeThrough=true; E.patchSeeThrough(mt); }   /* 騎樓柱子、共同教學館前的蒲葵：擋住玩家時網點透空（和套件的柱子、樹一樣） */
      if(nm&&nm.indexOf('cafe_leaf_')===0){ mt.alphaTest=Math.max(mt.alphaTest||0,0.5); mt.side=THREE.DoubleSide; }
      if(nm==='ck_bell_wash'){ mt.emissive=new THREE.Color(0xffffff); mt.emissiveMap=mt.map; mt.map=null; mt.color=new THREE.Color(0x000000); mt.roughness=1; mt.metalness=0; mt.transparent=true; mt.depthWrite=false; mt.blending=THREE.AdditiveBlending; mt.fog=false; TK.addNight(mt,0.75,0); mt.needsUpdate=true; } });   /* 傅鐘柱面的暖光（和套件一樣）：黑色底＋由下往上淡出的自發光、加法混合——白天看不到，晚上像地燈往上打的光 */
    /* 招牌（橫、直立）、門牌告示牌：每一面原本各自一張 canvas、各自一次 draw call（整條巷子 29 面）→ 合成一張 atlas、一個網格 */
    if(signFaces.length) wzAtlasFaces(root,signFaces,'wz_signs_atlas',0.95,0);
    if(plateFaces.length) wzAtlasFaces(root,plateFaces,'wz_plates_atlas',null,0);
    /* 店內景深卡也一樣（LAWWW2-C 2026-10-21）：公館 15 面、118 巷 13 面各自一次 draw call → 一個網格；同一種店（cafe、books…）共用 atlas 的同一格 */
    if(intFaces.length) wzAtlasFaces(root,intFaces.filter(o=>o.material.map.repeat.x===1),'wz_interior_atlas',1.15,0.6);
    root.name=name; g.add(root);
    /* GLOW_* 空節點（userData.glow）＝光暈的位置（和 TK.glowSprite 一樣的光暈）；校園的夜間只在路燈開關時切換（CK.setNight），所以照現在路燈開了沒先設好亮度。
       一個模型的光暈合成一個網格（LAWWW2-C 2026-10-21）：原本一個光暈一個 Sprite、一次 draw call——公館店面 86 個、溫州街 56 個，天快黑（17:24 起）就全部要畫 */
    if(glows.length) wzGlowBatch(E,g,root,glows,name+'_glows');
    return n; }
  /* 光暈合成一個網格：每個光暈是面向鏡頭的四邊形（和 Sprite 同樣的算法：中心點換到鏡頭座標、再往上下左右展開），貼圖是白色的放射漸層 × 頂點色；
     亮度＝白天值、晚上值照夜間程度內插（材質登記在 TK 的夜間清單、白天 0 晚上 1，emissiveIntensity 就是夜間程度；shader 讀它），太暗（≤ 0.02）的不畫，和 Sprite 一樣；
     全部都太暗的時候整個網格不畫（白天不多一次 draw call）。userData.glowBatch.items：每個光暈的位置、大小、白天、晚上的亮度（測試用） */
  function wzGlowBatch(E,g,root,glows,name,nearFade){ root.updateMatrixWorld(true); const v=new THREE.Vector3(), c=new THREE.Color(); const n=glows.length;
    const pos=new Float32Array(n*12), cor=new Float32Array(n*8), uv=new Float32Array(n*8), siz=new Float32Array(n*4), col=new Float32Array(n*12), op=new Float32Array(n*8), idx=[]; const items=[]; let maxS=0, maxD=0, maxN=0;
    glows.forEach((o,i)=>{ const d=o.userData, s=d.size||1.4; g.worldToLocal(o.getWorldPosition(v)); const a=/rgba\([^)]*,\s*([\d.]+)\s*\)/.exec(d.glow||''), al=a?+a[1]:1;   /* rgba 的透明度乘進亮度（放射漸層從這個顏色淡到透明） */
      c.setStyle(String(d.glow||'#ffffff').replace(/rgba\(([^,]+),([^,]+),([^,]+),[^)]*\)/,'rgb($1,$2,$3)')); const dO=(d.day||0)*al, nO=(d.night==null?1:d.night)*al;
      items.push({x:+v.x.toFixed(2),y:+v.y.toFixed(2),z:+v.z.toFixed(2),size:s,day:dO,night:nO}); maxS=Math.max(maxS,s); maxD=Math.max(maxD,dO); maxN=Math.max(maxN,nO);
      [[-0.5,-0.5],[0.5,-0.5],[0.5,0.5],[-0.5,0.5]].forEach(([cx,cy],k)=>{ const j=i*4+k; pos.set([v.x,v.y,v.z],j*3); cor.set([cx,cy],j*2); uv.set([cx+0.5,cy+0.5],j*2); siz[j]=s; col.set([c.r,c.g,c.b],j*3); op.set([dO,nO],j*2); });
      const b=i*4; idx.push(b,b+1,b+2,b,b+2,b+3); });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('aCorner',new THREE.BufferAttribute(cor,2)); geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    geo.setAttribute('aSize',new THREE.BufferAttribute(siz,1)); geo.setAttribute('color',new THREE.BufferAttribute(col,3)); geo.setAttribute('aOp',new THREE.BufferAttribute(op,2)); geo.setIndex(idx);
    geo.computeBoundingBox(); geo.computeBoundingSphere(); geo.boundingSphere.radius+=maxS*0.75; geo.boundingBox.expandByScalar(maxS*0.75);   /* 位置只有中心點：範圍加上光暈的大小，才不會邊緣還在畫面裡就被裁掉 */
    const map=TK.tex('rad_glowWhite',128,128,(x,w,h)=>{ const gr=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=gr; x.fillRect(0,0,w,h); },false); map.userData.shared=true;
    const m=new THREE.MeshBasicMaterial({map,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}); m.name='wz_glow_batch';
    TK.addNight(m,1,0); m.emissiveIntensity=E.lampsOn?1:0;   /* emissiveIntensity＝夜間程度（MeshBasicMaterial 本身不用這個值）；一開始照路燈開了沒，和原本的 Sprite 一樣 */
    /* nearFade（公尺，體育館 B1 的低天花板用；預設 0＝不淡出）：光暈離鏡頭比這個近就淡掉——面向鏡頭的板子在頭頂 1～2 m 會撐滿半個畫面 */
    m.onBeforeCompile=sh=>{ sh.uniforms.uNightK={get value(){ return m.emissiveIntensity; }}; sh.uniforms.uNearFade={value:nearFade||0};
      sh.vertexShader='attribute vec2 aCorner;\nattribute float aSize;\nattribute vec2 aOp;\nuniform float uNightK;\nuniform float uNearFade;\nvarying float vGlowOp;\n'+sh.vertexShader
        .replace('#include <project_vertex>','vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );\n\tmvPosition.xy += aCorner * aSize;\n\tgl_Position = projectionMatrix * mvPosition;\n\tvGlowOp = mix( aOp.x, aOp.y, uNightK ) * ( uNearFade > 0.0 ? smoothstep( uNearFade * 0.4, uNearFade, -mvPosition.z ) : 1.0 );');
      sh.fragmentShader='varying float vGlowOp;\n'+sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );','if ( vGlowOp <= 0.02 ) discard;\n\tvec4 diffuseColor = vec4( diffuse, opacity * vGlowOp );'); };
    m.customProgramCacheKey=()=>'wzGlowBatch1';
    const mesh=new THREE.Mesh(geo,m); mesh.name=name; mesh.castShadow=false; mesh.receiveShadow=false; mesh.renderOrder=1;   /* 光暈都在玻璃外面（騎樓燈、燈箱、直立招牌）：畫在半透明的玻璃之後，不被玻璃蓋暗 */
    mesh.userData.glowBatch={items}; mesh.userData.formalGlow=true;
    let shown=true; Object.defineProperty(mesh,'visible',{configurable:true, get(){ const k=m.emissiveIntensity; return shown&&maxD*(1-k)+maxN*k>0.02; }, set(x){ shown=!!x; }});
    g.add(mesh); return mesh; }
  /* 四個頂點的板面（Blender 的平面）沿 u 切成 r 塊，每一塊的 uv 都是 0～1（店內景深卡重複 r 次）；不是這種板面就不切、回傳 false */
  function wzSplitQuadU(o,r){ const g=o.geometry, P=g.attributes.position, N=g.attributes.normal, U=g.attributes.uv; if(!U||P.count!==4||!g.index||g.index.count!==6) return false;
    const c={}; for(let i=0;i<4;i++) c[(U.getX(i)>0.5?1:0)+''+(U.getY(i)>0.5?1:0)]=i; if(Object.keys(c).length!==4) return false;
    const ix=g.index, a=ix.getX(0), b=ix.getX(1), d=ix.getX(2), ccw=((U.getX(b)-U.getX(a))*(U.getY(d)-U.getY(a))-(U.getX(d)-U.getX(a))*(U.getY(b)-U.getY(a)))>0;
    const v=k=>new THREE.Vector3().fromBufferAttribute(P,c[k]); const p00=v('00'), p10=v('10'), p01=v('01'), p11=v('11'), n=new THREE.Vector3().fromBufferAttribute(N,0);
    const pos=[], nor=[], uv=[], idx=[]; const lerp=(u,vv)=>p00.clone().multiplyScalar((1-u)*(1-vv)).addScaledVector(p10,u*(1-vv)).addScaledVector(p11,u*vv).addScaledVector(p01,(1-u)*vv);
    for(let k=0;k<r;k++){ const u0=k/r, u1=(k+1)/r, b0=k*4; for(const [u,vv,su] of [[u0,0,0],[u1,0,1],[u1,1,1],[u0,1,0]]){ const q=lerp(u,vv); pos.push(q.x,q.y,q.z); nor.push(n.x,n.y,n.z); uv.push(su,vv); }
      if(ccw) idx.push(b0,b0+1,b0+2,b0,b0+2,b0+3); else idx.push(b0,b0+2,b0+1,b0,b0+3,b0+2); }
    const ng=new THREE.BufferGeometry(); ng.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); ng.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); ng.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); ng.setIndex(idx); ng.computeBoundingBox(); ng.computeBoundingSphere();
    g.dispose(); o.geometry=ng; return true; }
  /* 把好幾面 canvas 字牌合成一張 atlas（一列一列排、每格留 2 px）、網格合成一個（UV 換到 atlas 裡的那一格）；原本的字牌網格拿掉。
     userData.atlas.items 記每一格：名稱、在 atlas 裡的位置大小（px）、板面的長寬比（測試用：每一格的字照板面比例、沒有被拉寬） */
  function wzAtlasFaces(root,faces,name,nightI,dayI){ root.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(); const P=2;
    const items=faces.map(o=>{ const c=o.material.map.image; o.geometry.computeBoundingBox(); const s=o.geometry.boundingBox.getSize(new THREE.Vector3()); const rot=c.height>c.width;   /* 直的字牌轉 90° 放（全部變成橫條，排得比較密）*/
      return {o, c, w:c.width, h:c.height, rot, bw:rot?c.height:c.width, bh:rot?c.width:c.height, board:Math.max(s.x,s.z)/Math.max(1e-6,s.y), key:JSON.stringify(Object.assign({},o.userData,{name:0}))+'|'+c.width+'x'+c.height}; });   /* userData.name＝GLTFLoader 放的原始節點名稱（每一面不同），比對內容時不算 */
    /* 內容一樣的板面（直立招牌的兩面：同一組字、同樣大小）共用 atlas 的同一格（公館 50 面招牌不共用會排成 2048×4096） */
    const cells=[], byKey={}; for(const it of items){ const u=byKey[it.key]; if(u) it.src=u; else { byKey[it.key]=it; it.src=it; cells.push(it); } }
    /* 最寬的字牌只比 2 的次方寬一點點（社科院匾額 1029 px）：全部等比例縮小幾 %，atlas 的寬度少一半（原本 2048 寬、右半邊全空） */
    const mw=Math.max(...cells.map(i=>i.bw)), a0=1<<Math.ceil(Math.log2(mw+P*2)), kW=(a0>256&&mw+P*2<=a0/2*1.12)?(a0/2-P*2-1)/mw:1;
    let AW=Math.min(2048, Math.max(256, 1<<Math.ceil(Math.log2(Math.ceil(mw*kW)+P*2))));
    /* 一列一列排；只超過 2 的次方一點點時，全部等比例縮小幾 %（例如 128 px 高的字牌變 124 px，看不出差別），atlas 就小一半 */
    const pack=k=>{ const rest=cells.slice().sort((a,b)=>b.bh-a.bh||b.bw-a.bw); let y=0;   /* 每一列：先放最高（再最寬）的，再把剩下放得進這一列的都塞進去 */
      while(rest.length){ let x=0, rowH=0; for(let i=0;i<rest.length;){ const it=rest[i], w=Math.ceil(it.bw*k), h=Math.ceil(it.bh*k); if(x+w+P*2<=AW||x===0){ it.x=x+P; it.y=y+P; it.k=k; x+=w+P*2; rowH=Math.max(rowH,h+P*2); rest.splice(i,1); } else i++; } y+=rowH; }
      return 1<<Math.ceil(Math.log2(Math.max(4,y))); };
    const fit=()=>{ let best=kW, AH=pack(kW); for(const f of [0.97,0.94,0.9]){ const h=pack(kW*f); if(h<AH){ AH=h; best=kW*f; break; } } return {AH,best}; };
    /* 也試寬一倍（一列放兩格以上）：面積比較小、或面積一樣但長邊比較短就用寬的（LAWWW2-C 2026-10-21：公館店內景深卡 10 種店、每格 512×256，窄的排成 512×4096） */
    let fr=fit(); if(AW*2<=2048){ const a1=AW, f1=fr; AW=a1*2; const f2=fit(); if(!(AW*f2.AH<a1*f1.AH||(AW*f2.AH===a1*f1.AH&&Math.max(AW,f2.AH)<Math.max(a1,f1.AH)))){ AW=a1; fr=f1; } else fr=f2; }
    const AH=fr.AH; pack(fr.best);   /* 最後用選到的寬度、比例重排一次（pack 會改每一格的 x、y、k） */
    const cv=document.createElement('canvas'); cv.width=AW; cv.height=AH; const cx=cv.getContext('2d');
    /* 空白處填所有字牌的平均顏色、每一格先往外多畫 P px（邊緣的顏色延伸出去）再畫本體：縮小取樣（mipmap）時不會混到黑色的空白
      （2026-10-11 社科院匾額：atlas 只有左上角一格，遠一點看整面變成黑的） */
    { const sm=document.createElement('canvas'); sm.width=sm.height=4; const sx=sm.getContext('2d'); let r=0,g=0,b=0,n=0;
      for(const it of cells){ sx.clearRect(0,0,4,4); sx.drawImage(it.c,0,0,4,4); const d=sx.getImageData(0,0,4,4).data, wt=it.bw*it.bh; for(let i=0;i<64;i+=4){ r+=d[i]*wt; g+=d[i+1]*wt; b+=d[i+2]*wt; n+=wt; } }
      cx.fillStyle=n?'rgb('+Math.round(r/n)+','+Math.round(g/n)+','+Math.round(b/n)+')':'#808080'; cx.fillRect(0,0,AW,AH); }
    for(const it of cells){ const k=it.k; it.dw=it.w*k; it.dh=it.h*k; if(!it.rot){ cx.drawImage(it.c,it.x-P,it.y-P,it.dw+P*2,it.dh+P*2); cx.drawImage(it.c,it.x,it.y,it.dw,it.dh); continue; } cx.save(); cx.translate(it.x+it.dh,it.y); cx.rotate(Math.PI/2); cx.drawImage(it.c,-P,-P,it.dw+P*2,it.dh+P*2); cx.drawImage(it.c,0,0,it.dw,it.dh); cx.restore(); }   /* 轉 90°：canvas 的 (cx,cy) → atlas (x+h−cy, y+cx)（h、w 是縮放後的大小）*/
    const tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace; tex.flipY=false; tex.anisotropy=8;
    const geos=items.map(it=>{ const g=it.o.geometry.clone(); for(const k of Object.keys(g.attributes)) if(!['position','normal','uv'].includes(k)) g.deleteAttribute(k); it.o.updateMatrixWorld(true); g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,it.o.matrixWorld));
      const s=it.src, uv=g.attributes.uv; for(let i=0;i<uv.count;i++){ const u=uv.getX(i), v=uv.getY(i); if(s.rot) uv.setXY(i,(s.x+s.dh*(1-v))/AW,(s.y+u*s.dw)/AH); else uv.setXY(i,(s.x+u*s.dw)/AW,(s.y+v*s.dh)/AH); } return g; });
    const merged=THREE_JSM.BufferGeometryUtils.mergeGeometries(geos,false); if(!merged) return null; for(const g of geos) g.dispose();
    const m=faces[0].material.clone(); m.map=tex; m.emissiveMap=tex; if(nightI!=null) TK.addNight(m,nightI,dayI||0); else m.emissiveIntensity=0; m.needsUpdate=true;
    const mesh=new THREE.Mesh(merged,m); mesh.name=name; mesh.castShadow=false; mesh.receiveShadow=true; mesh.userData.atlas={w:AW,h:AH,cells:cells.length,items:items.map(it=>({name:it.o.name,x:it.src.x,y:it.src.y,w:+it.src.dw.toFixed(1),h:+it.src.dh.toFixed(1),rot:it.src.rot,board:+it.board.toFixed(3)}))};
    for(const it of items){ it.o.parent.remove(it.o); it.o.material.map.dispose(); it.o.material.dispose(); }
    root.add(mesh); return mesh; }
  const wenzhou={ id:'wenzhou', name:'溫州街', indoor:false, cityLight:0.85, size:[110,60], camDist:5.2, build(E){ return buildWenzhou(E); } };
  // ---------- 室內：通用房間 ----------
  // ---------- 室內共用貼圖（v9.3 第十五批）----------
  // 礦纖天花板：60 cm 一格（一張貼圖 1.2 m），格線＋細小孔點
  const ceilTileTex=()=>W3.canvasTex('ceilTile',128,128,(x,w,h)=>{ x.fillStyle='#f1f1ec'; x.fillRect(0,0,w,h); let s=5; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; x.fillStyle='rgba(120,120,110,0.18)'; for(let i=0;i<420;i++) x.fillRect(r()*w,r()*h,1.2,1.2); x.fillStyle='#c4c4bd'; for(const v of [0,63,64,127]){ x.fillRect(v,0,1,h); x.fillRect(0,v,w,1); } });
  // 窗外景：天空、遠方樓房、行道樹樹冠（白天）；夜晚是深藍天空＋亮燈的窗。只畫一次、所有窗共用
  const viewTex=(night)=>W3.canvasTex(night?'winViewN':'winViewD',256,192,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h*0.7); if(night){ g.addColorStop(0,'#0e1426'); g.addColorStop(1,'#26304c'); } else { g.addColorStop(0,'#8fb6d9'); g.addColorStop(1,'#dbe8ef'); } x.fillStyle=g; x.fillRect(0,0,w,h);
      let s=9; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
      for(let i=0;i<9;i++){ const bw=18+r()*34, bh=40+r()*70, bx=i*30-10+r()*10; x.fillStyle=night?'#1a2133':'#b9c3cc'; x.fillRect(bx,h*0.72-bh,bw,bh+h*0.3); for(let yy=h*0.72-bh+6;yy<h*0.72;yy+=9) for(let xx=bx+4;xx<bx+bw-4;xx+=8){ if(night){ if(r()<0.4){ x.fillStyle=r()<0.7?'#ffd890':'#cfe3ff'; x.fillRect(xx,yy,4,4); } } else { x.fillStyle='rgba(90,110,130,0.35)'; x.fillRect(xx,yy,4,4); } } }
      for(let i=0;i<14;i++){ x.fillStyle=night?'#0d1410':['#5f8a4e','#4f7a44','#6c9a58'][i%3]; x.beginPath(); x.arc(i*20+r()*8,h*0.86+r()*10,16+r()*10,0,7); x.fill(); } });
  // 便利商店的貨架正面：一層層的商品（飲料、零食、泡麵、日用品）＋價格條
  const goodsTex=()=>W3.canvasTex('goodsShelf',256,128,(x,w,h)=>{ x.fillStyle='#f4f4f2'; x.fillRect(0,0,w,h); let s=3; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; const cols=['#e05a4a','#f2c14e','#4a90c2','#7ab04a','#e88a3a','#c94a7a','#f4f1ea','#3a6fb0','#d9d3c6'];
      for(let row=0;row<4;row++){ const y0=row*32; x.fillStyle='#c9ccd0'; x.fillRect(0,y0+28,w,4); x.fillStyle='#fff7c8'; for(let k=0;k<w;k+=32) x.fillRect(k+4,y0+28,12,3); let xx=2; while(xx<w-4){ const bw=6+r()*10, bh=12+r()*14; x.fillStyle=cols[(r()*cols.length)|0]; x.fillRect(xx,y0+28-bh,bw,bh); x.fillStyle='rgba(255,255,255,0.35)'; x.fillRect(xx+1,y0+28-bh+2,2,bh-4); xx+=bw+1.5; } } });
  function room(E,o){ const g=new THREE.Group(); const W=o.w,D=o.d,H=o.h||3.6; const nav=new E3.NavGrid(W+2,D+2,0.4,-W/2-1,-D/2-1); const floor=ground(g,W,D,o.floorTex||W3.stoneTex('#e6dccb'),[W/2,D/2],0,0,0); floor.material.roughness=0.7;
    const wallM=M(o.wallColor||'#efe6d6'); const walls=[]; const mk=(x,z,w,d,rot,dir)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,H,0.2),wallM); m.position.set(x,H/2,z); m.rotation.y=rot; m.userData.dir=dir; m.material=wallM.clone(); m.material.transparent=true; g.add(m); walls.push(m); }; mk(0,-D/2,W,0,0,new THREE.Vector3(0,0,1)); mk(0,D/2,W,0,0,new THREE.Vector3(0,0,-1)); mk(-W/2,0,D,0,Math.PI/2,new THREE.Vector3(1,0,0)); mk(W/2,0,D,0,Math.PI/2,new THREE.Vector3(-1,0,0));
    nav.blockOutside(-W/2+0.4,-D/2+0.4,W/2-0.4,D/2-0.4);
    // 天花板（v9.3 第十五批）：只從下面看得到（單面、法線朝下）——鏡頭在天花板下時蓋住天空（原本房間沒有頂，往上看是天空和雲）；鏡頭拉到天花板以上時看不到它，剖面視角照舊。不投影、不接受陰影
    { const ct=ceilTileTex().clone(); ct.needsUpdate=true; ct.repeat.set(W/1.2,D/1.2); const cm=new THREE.MeshStandardMaterial({map:ct,color:o.warm?0xf3e6d2:0xffffff,roughness:0.95,emissive:o.warm?0x6a5a48:0x8a8a86,emissiveMap:ct,emissiveIntensity:1.0});   /* 自發光代替反射光：只被半球光的地面色照到時看起來髒暗 */ const ceil=new THREE.Mesh(new THREE.PlaneGeometry(W,D),cm); ceil.rotation.x=Math.PI/2; ceil.position.y=H; ceil.castShadow=false; ceil.receiveShadow=false; g.add(ceil); }
    // 天花板燈
    const lights=[]; const cols=Math.max(1,Math.round(W/6)), rows=Math.max(1,Math.round(D/6)); for(let i=0;i<cols;i++) for(let j=0;j<rows;j++){ const p=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.06,0.3),new THREE.MeshBasicMaterial({color:0xfff6e0})); p.position.set(-W/2+(i+0.5)*W/cols,H-0.05,-D/2+(j+0.5)*D/rows); g.add(p); lights.push(p); }
    const ceilLight=new THREE.PointLight(0xfff0d8,12,Math.max(W,D)*1.4,2); ceilLight.position.set(0,H-0.3,0); g.add(ceilLight);
    const zone={group:g,nav,walls,lights,ceilLight,warm:!!o.warm,cool:!!o.cool,spawn:o.spawn||{x:0,z:D/2-1.5,yaw:Math.PI},
      fadeWalls(cam,pp){ for(const w of walls){ const c=w.userData.center||w.position, toCam=new THREE.Vector3().subVectors(cam.position,c); let facing=toCam.dot(w.userData.dir)>0;
          if(w.userData.partition&&pp) facing=facing===(new THREE.Vector3().subVectors(pp,c).dot(w.userData.dir)>0);   /* 隔間牆（GLB 的 partition＝1，例：新體育館 B1 v6）：鏡頭和玩家在牆的不同邊才淡出 */
          w.material.opacity= facing?1:0.12; w.material.depthWrite=facing; }
        /* 窗的零件（窗、框、窗台、窗簾）跟著所在的牆：牆淡出時一起隱藏，不然會浮在半空中擋住房間 */ if(this.winParts) for(const wp of this.winParts){ const toCam=new THREE.Vector3().subVectors(cam.position,wp.at); let v=toCam.dot(wp.dir)>0; if(wp.partition&&pp) v=v===(new THREE.Vector3().subVectors(pp,wp.at).dot(wp.dir)>0); wp.obj.visible=v; } },
      onLamps(on){ ceilLight.intensity=on?28:12; for(const l of lights) l.material.color.set(on?0xfff6e0:0xf4efe6); }, bounds:{w:W,d:D} };
    // 窗（外牆上的假窗，帶天光）
    if(o.windows!==false){ zone.wins=[]; zone.sunPatches=[]; const nW=Math.max(1,Math.round(W/5)); const xs=o.winXs||Array.from({length:nW},(_,i)=>-W/2+(i+0.5)*W/nW); const WW=o.winWall||'back'; const ry=WW==='left'?Math.PI/2:(WW==='right'?-Math.PI/2:(WW==='front'?Math.PI:0)); const half=(WW==='left'||WW==='right')?W/2:D/2;
      /* 牆上的位置 → 房間座標：t＝沿牆的位置、n＝離牆面的距離 */ const at=(t,n)=>WW==='left'?[-half+n,t]:(WW==='right'?[half-n,-t]:(WW==='front'?[-t,half-n]:[t,-half+n]));
      const inDir=new THREE.Vector3(Math.sin(ry),0,Math.cos(ry)); zone.winParts=zone.winParts||[]; const WY=o.winY||2.1, WWd=o.winW||2.2, WHt=o.winH||1.6;   /* winW／winH：窗（外面的景）的大小，預設 2.2×1.6（溫州街林家乾麵、定食店整面店面用一片大的）*/   /* 窗中心高度（v9.4：階梯教室比較高）*/ const wg=new THREE.Group(); g.add(wg);
      for(const wx of xs){ const win=new THREE.Mesh(new THREE.PlaneGeometry(WWd,WHt),o.view?W3.windowMat(o.viewDepth||25):new THREE.MeshBasicMaterial({color:0xcfe3ea,map:viewTex(false)})); { const q=at(wx,0.12); win.position.set(q[0],WY,q[1]); } win.rotation.y=ry; win.userData.dyn=true; if(o.view){ win.userData.pview=o.view; W3.setWindowView(win.material,o.view,false,viewTex(false),0xffffff); } zone.wins.push(win);   /* o.view：窗外的景用遊戲裡拍的照片＋視差（2026-10-11 使用者「窗景都很假」；W3.windowMat、tools/shots/window_views.py）*/
        const part=new THREE.Group(); part.add(win); wg.add(part); { const q=at(wx,0); zone.winParts.push({obj:part,at:new THREE.Vector3(q[0],H/2,q[1]),dir:inDir}); }
        // 鋁窗框、中間的直框、窗台（v9.3 第十五批：原本只是一塊會變色的平面）
        const fr=M('#c9ccd0',{rough:0.4}); for(const [fx,fy,fw,fh] of [[0,WHt/2+0.03,WWd+0.12,0.07],[0,-WHt/2-0.03,WWd+0.12,0.07],[-WWd/2-0.03,0,0.07,WHt+0.13],[WWd/2+0.03,0,0.07,WHt+0.13],[0,0,0.05,WHt]]){ const b=new THREE.Mesh(new THREE.BoxGeometry(fw,fh,0.06),fr); const q=at(wx+fx,0.15); b.position.set(q[0],WY+fy,q[1]); b.rotation.y=ry; part.add(b); } const sill=new THREE.Mesh(new THREE.BoxGeometry(WWd+0.3,0.05,0.22),M('#e6e2da',{rough:0.6})); { const q=at(wx,0.2); sill.position.set(q[0],WY-WHt/2-0.07,q[1]); } sill.rotation.y=ry; part.add(sill);
        if(o.curtains){ const ct=W3.canvasTex('curtain',64,128,(x,w,h)=>{ x.fillStyle='#d9c9a8'; x.fillRect(0,0,w,h); for(let i=0;i<w;i+=8){ const gg=x.createLinearGradient(i,0,i+8,0); gg.addColorStop(0,'rgba(0,0,0,0.10)'); gg.addColorStop(0.5,'rgba(255,255,255,0.10)'); gg.addColorStop(1,'rgba(0,0,0,0.12)'); x.fillStyle=gg; x.fillRect(i,0,8,h); } }); for(const sx of [-1,1]){ const c=new THREE.Mesh(new THREE.PlaneGeometry(0.38,2.0),new THREE.MeshStandardMaterial({map:ct,color:o.curtains,roughness:0.95,side:THREE.DoubleSide})); const q=at(wx+sx*1.3,0.24); c.position.set(q[0],WY-0.1,q[1]); c.rotation.y=ry; part.add(c); } const rod=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.03,0.03),M('#8f9399')); { const q=at(wx,0.24); rod.position.set(q[0],Math.min(WY+0.88,H-0.08),q[1]); } rod.rotation.y=ry; part.add(rod); }
        // 窗光落在地板上的光斑（下午暖光／清晨冷光，夜晚消失）
        const sp=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.2),new THREE.MeshBasicMaterial({color:0xffd9a0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending})); sp.rotation.x=-Math.PI/2; { const q=at(wx+0.4,1.6); sp.position.set(q[0],0.012,q[1]); } sp.rotation.z=ry; sp.userData.dyn=true; g.add(sp); zone.sunPatches.push(sp); } }
    // 室內時間感：窗色、光斑、燈色依時段與天氣變化
    zone.applyTime=function(h,weather){ h=h%24; const rain=weather==='rain'; let winC, patchA=0, patchC=0xffd9a0; if(h<5.5||h>=19.2){ winC=0x141c2c; } else if(h<6.5){ winC=0x5a6a8a; } else if(h<8){ winC=rain?0x8a949c:0xd9e3ea; patchA=rain?0:0.10; patchC=0xdfe8ff; } else if(h<16){ winC=rain?0x9aa4ac:0xcfe3ea; patchA=rain?0.04:0.16; patchC=0xfff3d6; } else if(h<17.6){ winC=rain?0x8a8f96:0xe8d6b8; patchA=rain?0.03:0.22; patchC=0xffcf8a; } else if(h<18.4){ winC=rain?0x6a6c74:0xf0a868; patchA=rain?0:0.18; patchC=0xff9a5a; } else { winC=0x3a4260; patchA=0.03; patchC=0xff8a4a; }
      const nightView=(h<5.5||h>=19.2);   /* 19.4 → 19.2（LAWWW2-B 10-24 路線巡查④）：和引擎的夜晚係數 nk＝1、屋外完全天黑同一刻換夜景；原本晚 0.2 小時，冬天傍晚光線拉長後，12 月 17:35～17:58 屋外全黑、窗外還是調暗的白天照片 */ if(zone.wins) for(const w of zone.wins){ if(w.userData.pview){ const ph=W3.viewPhoto(w.userData.pview,nightView); W3.setWindowView(w.material,w.userData.pview,nightView,viewTex(nightView),ph?W3.photoTint(h,rain):(nightView?(rain?0x9098a8:0xd8dce6):winC),ph&&W3.photoFade?W3.photoFade(h):0); continue; } const want=w.userData.viewFixed?null:viewTex(nightView); if(want&&w.material.map!==want){ w.material.map=want; w.material.needsUpdate=true; } w.material.color.set(nightView?(rain?0x9098a8:0xd8dce6):winC); } if(zone.sunPatches) for(const p of zone.sunPatches){ p.material.opacity=patchA; p.material.color.set(patchC); }
      const night=(h<6.5||h>=18); if(o.warm){ ceilLight.color.set(night?0xffb870:0xfff0d8); ceilLight.intensity=night?22:14; for(const l of lights) l.material.color.set(night?0xffc890:0xfff6e0); } };
    return zone; }
  // 書桌／長桌（v9.3 第十七批：原本是一塊板＋四根方棒，12 m 的教室長桌也只有四根腳）：5 cm 桌板＋深色封邊、金屬圓管腳（長桌約每 2 m 一組）＋橫桿。
  // 桌面高度（0.77）與導航阻擋不變；同一張桌子的零件合成同材質一個網格（TK.Bin）
  function desk(g,nav,x,z,rot,w,d,color,legs){ const grp=new THREE.Group(); grp.position.set(x,0,z); grp.rotation.y=rot||0; g.add(grp); const bin=new TK.Bin(); const col=color||'#c9a57a';
    bin.add(M(col,{rough:0.6}),new THREE.BoxGeometry(w,0.05,d),0,0.745,0); bin.add(M(P3.shade(col,0.38),{rough:0.6}),new THREE.BoxGeometry(w+0.012,0.026,d+0.012),0,0.728,0);
    const wood=legs==='wood', lm=wood?M('#5c3a21',{rough:0.7}):M('#4a4f55',{rough:0.45}); const n=Math.max(2,Math.ceil(w/2.0)+1);   /* legs='wood'：閱覽室的木頭長桌 */
    for(let i=0;i<n;i++){ const lx=-w/2+0.08+(w-0.16)*i/(n-1); for(const sz of [-1,1]) bin.add(lm,wood?new THREE.BoxGeometry(0.06,0.715,0.06):new THREE.CylinderGeometry(0.018,0.018,0.715,8),lx,0.3575,sz*(d/2-0.08)); bin.add(lm,new THREE.BoxGeometry(0.03,0.03,Math.max(0.1,d-0.16)),lx,0.12,0); }
    bin.build(grp); grp.userData.furn=true; nav.blockRect(x,z,w,d,rot||0,0.1); return grp; }   /* furn：教學館把整層的桌椅合成幾個網格（teach3d.js 的 mergeFurniture）*/
  // 椅子（v9.3 第十七批：原本是方板＋方棒）：有厚度的椅面、微彎的靠背板＋兩根背柱、金屬圓管腳；佔地不變（約 0.46 m 見方），+z 是前面
  function chair(g,x,z,rot,color){ const c=new THREE.Group(); const bin=new TK.Bin(); const col=color||'#8b5e3c', cm=M(col,{rough:0.7});
    /* 木頭色的椅子（Café、閱覽室）用同色系的木腳；其他（教室、宿舍、麵店）用金屬圓管腳 */ const hsl=new THREE.Color(col).getHSL({}); const woody=hsl.h>0.03&&hsl.h<0.13&&hsl.s>0.25; const lm=woody?M(P3.shade(col,0.25),{rough:0.75}):M('#4a4f55',{rough:0.45});
    const leg=(h)=>woody?new THREE.BoxGeometry(0.035,h,0.035):new THREE.CylinderGeometry(0.012,0.012,h,6);
    bin.add(cm,new THREE.BoxGeometry(0.44,0.05,0.42),0,0.46,0.01);
    const back=new THREE.BoxGeometry(0.42,0.26,0.035,6,1,1); { const p=back.attributes.position; for(let i=0;i<p.count;i++){ const px=p.getX(i)/0.21; p.setZ(i,p.getZ(i)+0.05*px*px); } back.computeVertexNormals(); } bin.add(cm,back,0,0.8,-0.2,0,{rx:-0.08});
    for(const sx of [-1,1]) bin.add(lm,leg(0.44),sx*0.19,0.7,-0.2);
    for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) bin.add(lm,leg(0.45),sx*0.19,0.225,sz*0.18);
    bin.build(c); c.position.set(x,0,z); c.rotation.y=rot||0; c.userData.furn=true; g.add(c); return c; }
  // 書櫃（v9.3 第十七批：原本是一個方塊、正面貼一張書的圖）：側板＋約每 1 m 一片直隔板、頂板、底座、四層層板、背板；每一層的書是一張去背貼圖，
  // 高矮不一、露出後面的背板，看得出深度。尺寸（長 × 2.4 m 高 × 0.4 m 深）與導航阻擋不變
  const bookRowTex=()=>W3.canvasTex('bookRow',512,96,(c,w,h)=>{ c.clearRect(0,0,w,h); const cols=['#2f5d50','#8c3b47','#e0b95b','#4a6c8c','#7b6a5a','#c46a4a','#3e5a48','#d9d3c6','#6b4a7a','#b8a27a']; let s=7; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; let xx=2;
    while(xx<w-4){ if(r()<0.06){ xx+=10+r()*16; continue; } const bw=7+r()*11, bh=h*(0.62+r()*0.36); const col=cols[(r()*cols.length)|0]; c.fillStyle=col; c.fillRect(xx,h-bh,bw,bh); c.fillStyle='rgba(255,255,255,0.18)'; c.fillRect(xx+1,h-bh+3,1.5,bh-6); c.fillStyle='rgba(0,0,0,0.22)'; c.fillRect(xx+bw-2,h-bh,2,bh); if(bw>10){ c.fillStyle='rgba(255,240,200,0.55)'; c.fillRect(xx+2,h-bh+bh*0.18,bw-4,2); c.fillRect(xx+2,h-bh+bh*0.7,bw-4,2); } xx+=bw+1; } });
  function shelfWall(g,nav,x,z,rot,len){ const grp=new THREE.Group(); grp.position.set(x,0,z); grp.rotation.y=rot||0; g.add(grp); const bin=new TK.Bin();
    const wood=M('#8b5e3c',{rough:0.8}), dark=M('#4f3524',{rough:0.85}); const H=2.4, D=0.4, T=0.03;
    bin.add(dark,new THREE.BoxGeometry(len,H,0.02),0,H/2,-D/2+0.01);
    const nb=Math.max(1,Math.round(len/1.0)); for(let i=0;i<=nb;i++) bin.add(wood,new THREE.BoxGeometry(T,H,D),-len/2+T/2+(len-T)*i/nb,H/2,0);
    bin.add(dark,new THREE.BoxGeometry(len,0.1,D-0.02),0,0.05,0.01);
    const lv=[0.1,0.66,1.22,1.78]; for(const y of lv) bin.add(wood,new THREE.BoxGeometry(len,T,D),0,y+T/2,0); bin.add(wood,new THREE.BoxGeometry(len+0.04,0.04,D+0.03),0,H-0.02,0.005);
    bin.build(grp);
    const t=bookRowTex().clone(); t.needsUpdate=true; t.repeat.set(len/1.6,1); const bm=new THREE.MeshStandardMaterial({map:t,roughness:0.85,alphaTest:0.5});
    for(const y of lv){ const pl=new THREE.Mesh(new THREE.PlaneGeometry(len-0.06,0.36),bm); pl.position.set(0,y+T+0.18,D/2-0.06); grp.add(pl); }
    nav.blockRect(x,z,len,0.5,rot||0,0.1); }
  // 便利商店的貨架（v9.3 第十五批：原本用書架）：和 shelfWall 同樣的尺寸與導航阻擋，白色金屬架＋商品
  function goodsWall(g,nav,x,z,rot,len){ const s=new THREE.Mesh(new THREE.BoxGeometry(len,2.0,0.45),M('#e8e8e6',{rough:0.5})); s.position.set(x,1.0,z); s.rotation.y=rot||0; g.add(s); for(const side of [1,-1]){ const t=goodsTex().clone(); t.needsUpdate=true; t.repeat.set(len/2,1); const front=new THREE.Mesh(new THREE.PlaneGeometry(len-0.1,1.9),texMat(t)); front.position.set(x+Math.sin(rot||0)*0.231*side,1.0,z+Math.cos(rot||0)*0.231*side); front.rotation.y=(rot||0)+(side<0?Math.PI:0); g.add(front); } const top=new THREE.Mesh(new THREE.BoxGeometry(len+0.04,0.05,0.5),M('#c9ccd0',{rough:0.4})); top.position.set(x,2.02,z); top.rotation.y=rot||0; g.add(top); nav.blockRect(x,z,len,0.5,rot||0,0.1); }
  // ---------- 教室（霖澤館）----------
  // v9.4（D36，使用者：「教室可以有階梯式座位，人物必須能正確站在階梯平台上」；照使用者的教室照片：深色長桌＋木翻椅、灰地磚、木講桌、投影幕、白色方格天花板＋日光燈、右側窗）：
  // 霖澤館 201 階梯教室——講台在前面（地面高度），六排座位一排比一排高 30 cm（每排的平台：長桌、椅子、椅子後面的走道），兩側走道是台階（每排兩階）。
  // 座位 6 排 × 8 個，全部可以坐（走到椅子後面 → 坐下 → 起身回到椅子後面，都在同一排的平台上）。row／col 和舊教室一樣（劇情用第 0、1 排）。
  // 從二樓迴廊的 201 教室門進來，站在最後面最高的走道；出去回到二樓迴廊。
  // 配置在 src/data/classroom_layout.js（Blender 正式模型讀同一份）；zones3d.js 比資料檔先載入，所以在 build() 裡才讀
  const crL=()=>{ const C=CLASSROOM_LAYOUT; const o={C,rows:C.rows,z0:C.rowZ0,depth:C.rowDepth,rise:C.rise,aisle:[C.aisleX0,C.aisleX1],cols:C.cols,colX:(i)=>C.colX0+i*C.colDX}; o.rowZ=(r)=>o.z0+r*o.depth; o.rowH=(r)=>r<0?0:o.rise*(r+1); return o; };
  const classroom={ id:'classroom', name:'霖澤館 201 階梯教室', indoor:true, camDist:4.4, build(E){ const CR=crL(), C=CR.C, W=C.W, D=C.D, H=C.H; const z=room(E,{w:W,d:D,h:H,cool:true,view:'linze_201',viewDepth:30,wallColor:'#e9e6df',floorTex:W3.stoneTex('#bdbcb8'),spawn:{x:C.door.x,z:C.door.spawnZ,yaw:Math.PI},winWall:C.windows.wall,winXs:C.windows.xs,winY:C.windows.y}); const g0=z.group, nav=z.nav;
    // 程序化的畫面全部放在 g（備用模型）：正式模型（ASSETS 'bldg.classroom_201'，Blender）載入後藏起來；導航、座位、互動點、黑板上的字、時鐘指針不受影響（D38）
    const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
    // 講台與黑板（前牆 z=-8）
    const FZ=-D/2+0.1;
    const board=new THREE.Mesh(new THREE.BoxGeometry(6,1.6,0.08),M('#2e4e44',{rough:0.5})); board.position.set(-1.5,2.0,FZ); g.add(board); const chalkT=W3.canvasTex('chalk',1024,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='#f3ebd3'; x.font='bold 44px "Noto Sans TC",sans-serif'; x.fillText('民法總則：法律行為的成立與生效',40,80); x.font='30px "Noto Sans TC",sans-serif'; x.fillText('案例：網拍標價 1,000 元的相機',40,150); x.fillText('要約？要約之引誘？承諾？錯誤？',40,210); }); const chalk=new THREE.Mesh(new THREE.PlaneGeometry(5.8,1.45),new THREE.MeshBasicMaterial({map:chalkT,transparent:true})); chalk.position.set(-1.5,2.0,FZ+0.07); chalk.userData.dyn=true; g0.add(chalk); z.chalk=chalk;
    z.setBoard=function(title,l1,l2){ const t=W3.canvasTex('chalk_'+title+l1+l2,1024,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='#f3ebd3'; x.font='bold 44px "Noto Sans TC",sans-serif'; x.fillText(title||'',40,80); x.font='30px "Noto Sans TC",sans-serif'; if(l1) x.fillText(l1,40,150); if(l2) x.fillText(l2,40,210); }); chalk.material.map=t; chalk.material.needsUpdate=true; };
    const clock=new THREE.Mesh(new THREE.CircleGeometry(0.28,24),new THREE.MeshBasicMaterial({color:0xf7f4ee})); clock.position.set(6.6,3.6,FZ+0.04); g0.add(clock); const clockRim=new THREE.Mesh(new THREE.RingGeometry(0.26,0.3,24),new THREE.MeshBasicMaterial({color:0x2b2b2b})); clockRim.position.set(6.6,3.6,FZ+0.045); g0.add(clockRim); const hand=new THREE.Mesh(new THREE.PlaneGeometry(0.03,0.2),new THREE.MeshBasicMaterial({color:0x2b2b2b})); hand.position.set(6.6,3.68,FZ+0.055);   /* 時鐘在牆面前 4 cm：正式模型（Blender）的前牆內面在 FZ+0.025，比備用模型的牆厚 */ hand.userData.dyn=true; g0.add(hand); z.clockHand=hand;
    // 投影幕（照片：大投影幕在講台上方）、木講桌
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(4.2,2.5),new THREE.MeshBasicMaterial({color:0xf2f0ea})); screen.position.set(4.0,3.0,FZ+0.04); g.add(screen); const scr2=new THREE.Mesh(new THREE.BoxGeometry(4.4,0.12,0.12),M('#3a3d40')); scr2.position.set(4.0,4.3,FZ+0.08); g.add(scr2);
    { const pb=new TK.Bin(); pb.add(TK.std({color:0x8a5f3c,roughness:0.6}),TK.boxG(1.3,1.05,0.65),-3.2,0.525,-6.0); pb.add(TK.std({color:0x5c3a21,roughness:0.6}),TK.boxG(1.4,0.05,0.75),-3.2,1.075,-6.0); pb.build(g); nav.blockRect(-3.2,-6.0,1.4,0.75,0,0.1); }
    // 六排座位的平台（每排高 30 cm）：長桌（深色，照片）在平台前緣、椅子（木翻椅）、椅子後面的走道；兩側走道是台階
    const plat=new TK.Bin(), platM=TK.std({map:W3.stoneTex('#c4c2bd'),roughness:0.8}), riserM=TK.std({color:0x8f8b84,roughness:0.85}); const walk=[]; z.seats=[];
    const A0=CR.aisle[0], A1=CR.aisle[1];
    for(let r=0;r<CR.rows;r++){ const z0=CR.rowZ(r), z1=r===CR.rows-1?D/2:z0+CR.depth, h=CR.rowH(r), hp=CR.rowH(r-1);
      plat.add(platM,TK.boxG(2*A0,h,z1-z0,2.4),0,h/2,(z0+z1)/2); plat.add(riserM,TK.boxG(2*A0,0.04,0.04),0,h-0.02,z0+0.02);   /* 平台＋前緣收邊 */
      nav.addSurf({x0:-A0,x1:A0,z0,z1,y:h});
      for(const sx of [-1,1]){ const xa=sx<0?-A1:A0, xb=sx<0?-A0:A1, xc=(xa+xb)/2, aw=xb-xa;   /* 兩側走道：每排兩階＋平的一段 */
        const st=1.03; plat.add(platM,TK.boxG(aw,hp+0.15,st/2,2.4),xc,(hp+0.15)/2,z0+st/4); plat.add(platM,TK.boxG(aw,h,st/2,2.4),xc,h/2,z0+st*3/4); plat.add(platM,TK.boxG(aw,h,z1-z0-st,2.4),xc,h/2,(z0+st+z1)/2);
        nav.addSurf({x0:xa,x1:xb,z0,z1:z0+st,axis:'z',ya:hp,yb:h,tread:st/2,rise:0.15,low:'z0'}); nav.addSurf({x0:xa,x1:xb,z0:z0+st,z1,y:h});
        const wm=new THREE.Mesh(new THREE.PlaneGeometry(aw,Math.hypot(st,h-hp)),new THREE.MeshBasicMaterial({visible:false})); wm.position.set(xc,(hp+h)/2,z0+st/2); wm.rotation.x=-Math.PI/2+Math.atan2(h-hp,st); wm.userData.walkLv=0; wm.userData.dyn=true; g0.add(wm); walk.push(wm);
        const wf=new THREE.Mesh(new THREE.PlaneGeometry(aw,z1-z0-st),new THREE.MeshBasicMaterial({visible:false})); wf.rotation.x=-Math.PI/2; wf.position.set(xc,h+0.01,(z0+st+z1)/2); wf.userData.walkLv=0; wf.userData.dyn=true; g0.add(wf); walk.push(wf); }
      { const wp=new THREE.Mesh(new THREE.PlaneGeometry(2*A0,z1-z0),new THREE.MeshBasicMaterial({visible:false})); wp.rotation.x=-Math.PI/2; wp.position.set(0,h+0.01,(z0+z1)/2); wp.userData.walkLv=0; wp.userData.dyn=true; g0.add(wp); walk.push(wp); }
      // 長桌（照片：深色長桌）：平台前緣；導航擋住長桌（也擋住平台前緣的高低差）
      { const dk=desk(g,nav,0,z0+C.desk.dz,0,C.desk.w,C.desk.d,'#3b3330'); dk.position.y=h; }
      for(let i=0;i<CR.cols;i++){ const x=CR.colX(i), sz=z0+C.seat.dz; const c=chair(g,x,sz,Math.PI,'#8a5f3c'); c.position.y=h; z.seats.push({x,z:sz,y:h,yaw:Math.PI,row:r,col:i}); } }
    plat.build(g);
    // 平台側面的牆裙（走道和平台之間看得到的高低差）
    { const fl=g.children.find(o=>o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&Math.abs(o.rotation.x+Math.PI/2)<1e-6&&o.position.y===0); if(fl){ fl.userData.walkLv=0; walk.push(fl); } }
    z.walkMeshes=walk; z.camMaxY=5.0; roomBackdrop(g0,W,D,H);   /* 牆外暗色的殼（窗都有窗景板）*/
    for(const [r,c] of [[1,1],[3,5],[2,6],[4,2]]){ const st=z.seats.find(s=>s.row===r&&s.col===c); if(st) PROP(g0,'prop.bag',st.x+0.3,st.y,st.z+0.55,0.6); } { const st=z.seats.find(s=>s.row===1&&s.col===3); PROP(g0,'prop.bottle',st.x,st.y+0.78,st.z-0.55); } { const st=z.seats.find(s=>s.row===2&&s.col===5); PROP(g0,'prop.cup',st.x,st.y+0.78,st.z-0.55); }
    // 座位互動：全部 48 個（v9.4：使用者「教室內所有可使用的座位，都必須真的能走到、坐下、站起來」）
    for(const s of z.seats) E.interactables.push({x:s.x,z:s.z+0.35,y:s.y,radius:0.62,label:'坐下',seat:s});
    E.interactables.push({x:C.door.x,z:C.door.exitZ,y:CR.rowH(CR.rows-1),radius:1.2,label:'離開教室',exit:{to:'linze',spawn:{x:-2.0,z:-6.0,lv:1,yaw:0}}});
    z.spawn={x:C.door.x,z:C.door.spawnZ,yaw:Math.PI}; z.teacherSpot={x:C.teacher.x,z:C.teacher.z,yaw:0};
    P3.mergeStatic(g);   /* 備用模型自己合併（外層合併會跳過它，正式模型載入後要能整組藏起來）*/
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.classroom_201']) ASSETS.loadOne('bldg.classroom_201').then(c=>{ if(!c||!c.scene||E.zone!==z) return; attachRoomGLB(z,g0,g,c.scene.clone(true)); }).catch(e=>console.warn('201 教室正式模型載入失敗，用程序化備用模型',e));
    return z; } };
  // 正式模型（Blender GLB）接到室內區域：名字含 WALL_ 的是會淡出的牆（自訂屬性 dir＝往室內的法線）；其他照原樣；程序化備用模型藏起來
  /* 店員支線「順手的事」做完以後店裡多的東西（痕跡，AA_404／405；LAWWW2-B 10-23）：SIDEQ.traceOn(G,'SQ12') 是 true 才顯示。每一格看：在店裡剛做完也會馬上出現。
     正式模型裡的節點叫 TRACE_SQ12_photo 這種（tools/blender/env_second/aa_support/sq_traces.py），attachRoomGLB 照名字接；公館腳踏車行的紙條（SQ16）在上面公館的街景 */
  function condVis(o,fn){ let shown=true; Object.defineProperty(o,'visible',{configurable:true,get(){ const G=typeof GAME!=='undefined'&&GAME.G; return shown&&!!(G&&fn(G)); },set(v){ shown=!!v; }}); }   /* 照條件顯示（同 traceVis，每一格問）*/
  function catBowlOn(G){ const F=G.flags||{}; return F.WZ_CAT_FOUND!=null&&!(typeof PARK!=='undefined'&&PARK.catGone&&PARK.catGone(G)); }
  function traceVis(o,id){ let shown=true; Object.defineProperty(o,'visible',{configurable:true,get(){ const G=typeof GAME!=='undefined'&&GAME.G; return shown&&!!(G&&typeof SIDEQ!=='undefined'&&SIDEQ.traceOn&&SIDEQ.traceOn(G,id)); },set(v){ shown=!!v; }}); }
  /* 室內光照貼圖（INTERIOR-AAA-REVIEW-1028 P1，LAWWW2-C；tools/blender/env_second/lightbake/bake_room.py 用 Cycles 烘焙）：GLB 場景的 extras.lightmap＝{day,night,intensity}。
     有第二套 UV（uv1）的網格：材質接 lightMap（白天、晚上兩張照時段混合）；間接光已經烘焙在貼圖裡，所以這些材質不吃半球光，方向光只留 LM_DIRK（人物在地上還有影子）。
     人物、沒有烘焙的東西照舊吃原本的光。原因：室內只有一盞方向光＋半球光，沒有反彈光、接觸陰影，整間平均亮、東西像貼在地上（docs/art-rebuild/second_ai/INTERIOR_AAA_REVIEW_1028.md）*/
  const LM_DIRK=0.3, lmTex={};
  function lmLoad(url){ if(!lmTex[url]){ const t=new THREE.TextureLoader().load(url); t.flipY=false; t.colorSpace=THREE.SRGBColorSpace; t.channel=1; lmTex[url]=t; } return lmTex[url]; }
  function lmMixAt(h){ h=((h%24)+24)%24; if(h>=6.8&&h<17.0) return 0; if(h>=18.6||h<5.6) return 1; return h>=17.0?(h-17.0)/1.6:(6.8-h)/1.2; }   /* 0＝白天那張、1＝晚上那張（17:00～18:36、05:36～06:48 慢慢換）*/
  const LM_MAPS=THREE.ShaderChunk.lights_fragment_maps.replace('vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );','vec4 lightMapTexel = mix( texture2D( lightMap, vLightMapUv ), texture2D( lmNight, vLightMapUv ), lmMix );');
  /* 快取的 GLB 每次進區域都是 c.scene.clone(true)：網格是新的、材質是同一批（clone 不複製材質）。接過光照貼圖的材質記在 lmWired（材質 → 它的 uniform）：
     再進一次只換這一次的白天／晚上貼圖、照時段更新同一組 uniform，不再包一層 onBeforeCompile——包兩層＝lmNight 等 uniform 宣告兩次、shader 編不過、
     那個網格整個不畫（BB-C 10-28 10:0x：霖澤館大廳第二次進去地板沒紋理、沙發長椅不見、NPC 坐在空氣上；201、202、多功能教室同一段程式）*/
  const lmWired=new WeakMap();
  function roomLightmap(z,root,spec){ const U={lmNight:{value:lmLoad(spec.night)},lmMix:{value:0},lmDirK:{value:LM_DIRK}}, day=lmLoad(spec.day), done=new Set(), Us=new Set([U]);
    root.traverse(o=>{ if(!o.isMesh||!o.geometry||!o.geometry.attributes.uv1) return;
      for(const m of [].concat(o.material)){ if(!m||done.has(m)||!m.isMeshStandardMaterial) continue; done.add(m); m.lightMap=day; m.lightMapIntensity=spec.intensity||Math.PI*2;
        const U0=lmWired.get(m); if(U0){ U0.lmNight.value=U.lmNight.value; Us.add(U0); continue; }   /* 已經接過（快取的 GLB 再進一次）：不再包一層 */
        lmWired.set(m,U);
        const prev=m.onBeforeCompile; m.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); Object.assign(sh.uniforms,U);
          sh.fragmentShader='uniform sampler2D lmNight; uniform float lmMix; uniform float lmDirK;\n'+sh.fragmentShader.replace('#include <lights_fragment_begin>','#include <lights_fragment_begin>\nreflectedLight.directDiffuse *= lmDirK; reflectedLight.directSpecular *= lmDirK;\n#if defined( RE_IndirectDiffuse )\nirradiance = vec3( 0.0 );\n#endif').replace('#include <lights_fragment_maps>',LM_MAPS); };
        const pk=m.customProgramCacheKey; m.customProgramCacheKey=function(){ return (pk?pk.call(this):'')+'|roomLM'; }; m.needsUpdate=true; } });
    const mix=h=>{ const v=lmMixAt(h); for(const u of Us) u.lmMix.value=v; };   /* 這一次用到的每一組 uniform（新接的、之前接過的）都照時段 */
    const up0=z.update; z.update=function(dt,E){ if(up0) up0.call(this,dt,E); mix(E&&E.hour!=null?E.hour:12); }; mix(typeof GAME!=='undefined'&&GAME.G?GAME.G.hour:12);
    z.lightmapped=done.size; return done.size; }
  /* 室內鏡頭在牆外時（牆淡出）看到的背景（INTERIOR-AAA-REVIEW-1028 P2，LAWWW2-C）：房間外 m 公尺一圈暗色的殼（只從裡面看得到、不受光、不吃霧），鏡頭在牆外也看不到天空
     （v1：鏡頭從側面的走道往前看，牆淡出的那一邊整片淺藍色的天空，教室像飄在天上）。鏡頭最多在牆外 4.4 m（跟隨距離），殼在 7 m：永遠在鏡頭後面，不會擋住房間。
     只給窗戶都有窗景板的房間用（窗景板在玻璃外 0.42 m，在殼的裡面）；玻璃帷幕直接看出去的房間不要用（2026-10-11 試過整個室內改深灰背景：萬才館東窗、霖澤館玻璃底下的縫變成深灰色，更假）。*/
  function roomBackdrop(g,W,D,H,m,cx,cz){ m=m||7; const geo=new THREE.BoxGeometry(W+2*m,H+2*m,D+2*m); geo.translate(cx||0,H/2,cz||0);   /* cx、cz：房間中心（GLB 房間的 bounds 不一定以原點為中心）*/ const P=geo.attributes.position, c=new Float32Array(P.count*3), lo=new THREE.Color(0x3a3733), hi=new THREE.Color(0x1a1a1d), t=new THREE.Color();
    for(let i=0;i<P.count;i++){ const k=Math.min(1,Math.max(0,(P.getY(i)+m)/(H+2*m))); t.copy(lo).lerp(hi,k); c[i*3]=t.r; c[i*3+1]=t.g; c[i*3+2]=t.b; } geo.setAttribute('color',new THREE.BufferAttribute(c,3));
    const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false})); mesh.name='room_backdrop'; mesh.userData.dyn=true; mesh.castShadow=false; mesh.receiveShadow=false; g.add(mesh); return mesh; }
  /* SEATFOLD-BEGIN 階梯教室的翻椅（INTERIOR-AAA-REVIEW-1028，LAWWW2-C；tools/blender/classroom_201.py v2 的 SEATPANS 網格：48 張椅面一個網格）：
     沒有人坐的椅面掀起來（真的階梯教室翻椅；v1 每張都是放下的，一排一排一模一樣），有人坐就放下：玩家、同學（n.seat；正要坐的 seatTarget 走到 0.8 m 內）、遠處的替身（st.taken）。
     放下是同一格就放好（人坐下的那一格椅面已經在下面，不會掃過身體）；人離開 0.5 秒後 0.3 秒轉上去。
     頂點照最近的座位分組，繞椅面後緣的轉軸（座位地面中心往後 0.15 m、高 0.445 m；軸＝坐的人的右手方向）轉 92°。
     幾何是快取共用的（GLB 每次 clone 共用 geometry）：先複製一份再改。沒有 SEATPANS（備用模型、舊 GLB）就不做。測試：tests/seat_fold_unit.js */
  const PAN_UP=1.6, PAN_SPD=5.0, PAN_WAIT=0.5;
  function seatFold(z,root){ const m=root&&root.getObjectByName&&root.getObjectByName('SEATPANS'), S=z&&z.seats; if(!m||!m.isMesh||!S||!S.length) return null;
    m.geometry=m.geometry.clone(); const g=m.geometry, P=g.attributes.position, N=g.attributes.normal, n=P.count; m.updateWorldMatrix(true,false);
    const toW=m.matrixWorld.clone(), toL=toW.clone().invert(), nW=new THREE.Matrix3().getNormalMatrix(toW), nL=new THREE.Matrix3().getNormalMatrix(toL);
    const base=Float32Array.from(P.array), nb=N?Float32Array.from(N.array):null, v=new THREE.Vector3(), w=new THREE.Vector3(), vs=S.map(()=>[]);
    for(let i=0;i<n;i++){ v.fromBufferAttribute(P,i).applyMatrix4(toW); let b=-1, bd=0.2; for(let k=0;k<S.length;k++){ const s=S[k], dx=v.x-s.x, dz=v.z-s.z, d=dx*dx+dz*dz; if(d<bd&&Math.abs(v.y-(s.y||0)-0.45)<0.3){ bd=d; b=k; } } if(b>=0) vs[b].push(i); }
    const ang=new Float32Array(S.length), idle=new Float32Array(S.length), Q=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0), H=new THREE.Vector3(), AX=new THREE.Vector3();
    function pose(k){ const s=S[k], fx=Math.sin(s.yaw||0), fz=Math.cos(s.yaw||0); H.set(s.x-fx*0.15,(s.y||0)+0.445,s.z-fz*0.15); AX.set(fx,0,fz).cross(UP).normalize(); Q.setFromAxisAngle(AX,ang[k]);
      for(const i of vs[k]){ v.set(base[3*i],base[3*i+1],base[3*i+2]).applyMatrix4(toW).sub(H).applyQuaternion(Q).add(H).applyMatrix4(toL); P.setXYZ(i,v.x,v.y,v.z);
        if(nb){ w.set(nb[3*i],nb[3*i+1],nb[3*i+2]).applyMatrix3(nW).applyQuaternion(Q).applyMatrix3(nL).normalize(); N.setXYZ(i,w.x,w.y,w.z); } } }
    const near=(a,s)=>!!a&&Math.abs(a.x-s.x)<0.3&&Math.abs(a.z-s.z)<0.3;
    function occupied(E,k){ const s=S[k]; if(s.taken) return true; const p=E&&E.player; if(p&&(p.seat===s||near(p.seat,s))) return true;
      for(const q of (E&&E.npcs)||[]){ if(q.seat===s||near(q.seat,s)) return true; const t=q.seatTarget; if(t&&(t===s||near(t,s))&&q.obj&&Math.hypot(q.obj.position.x-s.x,q.obj.position.z-s.z)<0.8) return true; }
      return false; }
    function step(dt,E){ let dirty=false; for(let k=0;k<S.length;k++){ if(occupied(E,k)){ idle[k]=0; if(ang[k]!==0){ ang[k]=0; pose(k); dirty=true; } continue; }
        idle[k]+=dt; if(idle[k]<PAN_WAIT||ang[k]>=PAN_UP) continue; ang[k]=Math.min(PAN_UP,ang[k]+PAN_SPD*dt); pose(k); dirty=true; }
      if(dirty){ P.needsUpdate=true; if(N) N.needsUpdate=true; } return dirty; }
    for(let k=0;k<S.length;k++){ ang[k]=PAN_UP; idle[k]=PAN_WAIT; pose(k); } P.needsUpdate=true; if(N) N.needsUpdate=true;   /* 一開始全部掀起來；有人坐的下一格就放下 */
    g.computeBoundingSphere(); if(g.boundingSphere) g.boundingSphere.radius+=0.5;
    const up0=z.update; z.update=function(dt,E){ if(up0) up0.call(this,dt,E); step(Math.min(dt||0,0.1),E); };
    return (z.seatFold={mesh:m,ang,step,occupied,groups:vs.map(a=>a.length)}); }
  /* SEATFOLD-END */
  /* 熄燈（DORM-SLEEP-VISUAL-1030，LAWWW2-B 10-30；使用者「宿舍睡覺要真的有畫面」）：GLB 的 extras.lightmap.dark＝第三張光照貼圖（tools/blender/env_second/lightbake/bake_room.py --dark：
     室內的燈全關，只剩窗外路燈、夜空）。z.lightsOff(k)：k＝0 照原本（白天／晚上兩張照時段）、1＝熄燈那一張，中間是漸變（睡覺流程照時間推）。
     接在 roomLightmap 的 onBeforeCompile 後面，把它換上的日夜混合再和熄燈那張混一次（不改 roomLightmap 本身）；燈管、床下燈條的自發光（材質名合 spec.darkOff，預設 tube|lamp_bulb）、
     房間自己的點光源跟著 k 暗下去。快取的 GLB 再進一次：不再包一層、熄燈回到 0。沒有 dark 的房間不呼叫，什麼都不變。測試：tests/dorm_lightmap_unit.js */
  const lmDarkWired=new WeakMap();
  function roomDarkMap(z,root,spec){ const U={lmDark:{value:lmLoad(spec.dark)},lmOff:{value:0}}, Us=new Set([U]), done=new Set(), glow=[], re=new RegExp(spec.darkOff||'tube|lamp_bulb');
    root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m||done.has(m)) continue; done.add(m);
      if(re.test(m.name||'')&&m.emissive){ glow.push(m); continue; }
      if(!m.lightMap||!o.geometry||!o.geometry.attributes.uv1) continue;
      const U0=lmDarkWired.get(m); if(U0){ U0.lmDark.value=U.lmDark.value; U0.lmOff.value=0; Us.add(U0); continue; }
      lmDarkWired.set(m,U); const prev=m.onBeforeCompile; m.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); Object.assign(sh.uniforms,U);
        sh.fragmentShader='uniform sampler2D lmDark; uniform float lmOff;\n'+sh.fragmentShader.replace('vec4 lightMapTexel = mix( texture2D( lightMap','vec4 lightMapTexel = mix( mix( texture2D( lightMap').replace('texture2D( lmNight, vLightMapUv ), lmMix )','texture2D( lmNight, vLightMapUv ), lmMix ), texture2D( lmDark, vLightMapUv ), lmOff )'); };
      const pk=m.customProgramCacheKey; m.customProgramCacheKey=function(){ return (pk?pk.call(this):'')+'|roomDark'; }; m.needsUpdate=true; } });
    const lights=[]; if(z.group) z.group.traverse(o=>{ if(o.isPointLight||o.isSpotLight) lights.push(o); });
    z.lightsOffK=0; z.lightsOff=k=>{ k=Math.max(0,Math.min(1,+k||0)); z.lightsOffK=k; for(const u of Us) u.lmOff.value=k;
      for(const m of glow){ if(m.userData.emi0==null) m.userData.emi0=m.emissiveIntensity; m.emissiveIntensity=m.userData.emi0*(1-k); }
      for(const l of lights){ if(l.userData.i0==null) l.userData.i0=l.intensity; l.intensity=l.userData.i0*(1-0.9*k); } };
    return Us.size; }
  function attachRoomGLB(z,g0,fb,root){ const LMS=root.userData&&root.userData.lightmap; root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; if(o.material&&/ceiling/.test(o.material.name)&&!LMS) TK.bounce(o.material,0.5,0.5); } });   /* 有光照貼圖：天花板的亮已經烘焙進去，不另外加自發光 */   /* 天花板：和 room() 的天花板一樣帶自發光 */ g0.add(root); root.updateMatrixWorld(true); const nw=[];
    root.traverse(o=>{ const m=/^TRACE_(SQ\d+)/.exec(o.name); if(m) traceVis(o,m[1]); });   /* 痕跡（見 traceVis）*/
    root.traverse(o=>{ if(o.name==='WZ_CATBOWL') condVis(o,catBowlOn); });   /* 一盞前院的貓碗（ART-WZ6，AA_420 第 9 節）：找到貓以後（WZ_CAT_FOUND）、收養以前（PARK.catGone）*/
    const glassy=[];   /* 本來就半透明的牆面材質（玻璃、紗窗）：不放進淡出清單（淡出邏輯每格會把不透明度設回 1，玻璃會變成不透明的灰板），改成窗的零件：固定透明、牆淡出時一起藏（和 Café 室內一樣）*/
    root.traverse(o=>{ if(o.isMesh&&/WALL_/.test(o.name)){ const see=o.material.transparent&&o.material.opacity<0.9; o.material=o.material.clone(); o.material.transparent=true; const d=o.userData.dir||[0,0,1]; o.userData.dir=new THREE.Vector3(d[0],d[1],d[2]); o.geometry.computeBoundingBox(); o.userData.center=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld);
      if(Array.isArray(o.userData.at)) o.userData.center=new THREE.Vector3().fromArray(o.userData.at).applyMatrix4(root.matrixWorld);   /* 淡出判斷點（GLB 的 at，正式模型的座標）：外框中心不在牆線上的零件用（118 巷店門外兩側的鄰居店面卡：外框中心在牆線外 2.3 m，鏡頭在牆線外 2.3 m 以內不會淡出、會擋住人；LAWWW2 10-22）*/
      if(see){ o.material.depthWrite=false; glassy.push(o); } else nw.push(o); } });
    /* 窗外的景（白天／夜景貼圖、隨時段變色，room() 的 applyTime 照舊換）：從備用模型的窗框組裡拿出來，放到正式模型的玻璃外面 0.3 m（放大一點：斜著看窗洞也看不到外面的空白）；牆淡出時一起藏（不然鏡頭在牆外時會擋住房間）*/
    const wp=[]; if(z.wins) for(const w of z.wins){ const part=w.parent; const ent=z.winParts&&z.winParts.find(p=>p.obj===part); const d=ent?ent.dir:new THREE.Vector3(1,0,0); w.position.addScaledVector(d,-0.42); w.scale.set(1.35,1.4,1); if(w.material.uniforms&&w.material.uniforms.sxy) w.material.uniforms.sxy.value.set(1.35,1.4); part.remove(w); g0.add(w); wp.push({obj:w,at:ent?ent.at:w.position.clone(),dir:d}); }
    for(const o of glassy) wp.push({obj:o,at:o.userData.center,dir:o.userData.dir,partition:!!o.userData.partition});
    fb.visible=false; z.walls.length=0; for(const w of nw) z.walls.push(w); z.winParts=wp; z.formal=true; if(LMS) roomLightmap(z,root,LMS); if(LMS&&LMS.dark) roomDarkMap(z,root,LMS); seatFold(z,root); }
  // ---------- 萬才館大廳／研討室 ----------
  // 萬才館（室內兩層樓）：src/wancai3d.js（萬才館第三階段，D42；一樓大廳的座標和 v9.3 一樣）
  // ---------- 總圖閱覽室 ----------
  const library={ id:'library', name:'總圖書館 閱覽室', indoor:true, camDist:4.4, build(E){ const z=room(E,{w:22,d:16,h:4.0,cool:true,view:'library_3f',viewDepth:45,wallColor:'#efe8dc',floorTex:W3.stoneTex('#d9cbb0'),spawn:{x:0,z:7,yaw:Math.PI}}); const g0=z.group, nav=z.nav;
    /* 程序化的畫面放在 fallback：Blender 正式模型（ASSETS 'bldg.library_3f'，LAWWW2 ⑪）載入後整組藏起來（和 Café 同一套）；導航、座位、互動點、出口、窗、東側電梯（readingExtras）都不受影響 */
    const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
    shelfWall(g,nav,-9,-7.6,0,10); shelfWall(g,nav,9,-7.6,0,10); shelfWall(g,nav,-10.8,0,Math.PI/2,12); z.seats=[]; for(let r=0;r<3;r++){ for(let c=0;c<2;c++){ const x=-4+c*8, zz=-3+r*3.6; desk(g,nav,x,zz,0,5,1.2,'#c9a57a','wood'); for(let i=0;i<3;i++){ const lamp=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.18,10,1,true),M('#2f5d50',{rough:0.5})); lamp.position.set(x-1.6+i*1.6,1.05,zz); g.add(lamp); const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.28,6),M('#c9a24f')); stem.position.set(x-1.6+i*1.6,0.9,zz); g.add(stem); const glow=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,6),new THREE.MeshBasicMaterial({color:0xffe9a8})); glow.position.set(x-1.6+i*1.6,1.0,zz); g.add(glow); }
      for(let i=0;i<3;i++){ for(const s of [-1,1]){ const cx=x-1.6+i*1.6, cz=zz+s*0.9; chair(g,cx,cz,s>0?Math.PI:0,'#5c3a21'); z.seats.push({x:cx,z:cz,yaw:s>0?Math.PI:0}); if(i%2===0) E.interactables.push({x:cx,z:cz,radius:0.9,label:'坐下讀書',seat:{x:cx,z:cz,yaw:s>0?Math.PI:0},study:true}); } } } }
    for(const [x,zz] of [[-4,-3],[4,-3],[-4,0.6],[4,4.2]]){ PROP(g,'prop.bottle',x+1.9,0.77,zz+0.35); PROP(g,'prop.bagFlat',x-2.4,0,zz+1.3,0.6); } PROP(g,'prop.cup',-2.6,0.77,0.6-0.3);
    /* 總圖第一階段（D43）：閱覽室在三樓——前面的門是樓梯間（下樓到二樓自習區、一樓大廳），東側多一部電梯（src/library3d.js）；沒有載入 library3d 時照舊直接回校園 */
    P3.mergeStatic(g);   /* 備用模型自己合併（外層合併會跳過它，正式模型載入後要能整組藏起來）*/
    if(typeof LB3!=='undefined'){ E.interactables.push({x:0,z:7.6,radius:1.6,label:'樓梯間：下樓（2F 自習區、1F 大廳）',exit:{to:'library_hall',spawn:Object.assign({},LIBRARY_LAYOUT.stairDoor.spawn)}}); LB3.readingExtras(E,z); }
    else E.interactables.push({x:0,z:7.6,radius:1.6,label:'離開圖書館',exit:{to:'campus',spawn:{x:80,z:0,yaw:-Math.PI/2}}});
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.library_3f']) ASSETS.loadOne('bldg.library_3f').then(c=>{ if(!c||!c.scene||E.zone!==z) return; attachRoomGLB(z,g0,g,c.scene.clone(true)); }).catch(e=>console.warn('總圖 3F 正式模型',e));
    return z; } };
  // ---------- 溫州街咖啡廳 ----------
  const cafe={ id:'cafe', name:'兩點半 Café', indoor:true, camDist:4.2, seeThru:true, build(E){   /* seeThru：吊燈電線（seethru_cafe_cord）擋住玩家時網點透空 */ const z=room(E,{view:'cafe',viewDepth:11,w:14,d:12,h:3.4,warm:true,wallColor:'#e8dcc4',floorTex:W3.canvasTex('cafe_screed',256,256,(x,w,h)=>{ x.fillStyle='#9d9b96'; x.fillRect(0,0,w,h); for(let n=0;n<70;n++){ const cx=(n*73)%w, cy=(n*151)%h, r=18+(n*37)%40, a=0.035+((n*13)%5)*0.01; const g=x.createRadialGradient(cx,cy,0,cx,cy,r); const v=n%2?255:40; g.addColorStop(0,'rgba('+v+','+v+','+v+','+a+')'); g.addColorStop(1,'rgba('+v+','+v+','+v+',0)'); x.fillStyle=g; x.fillRect(cx-r,cy-r,r*2,r*2); } for(let n=0;n<240;n++){ x.fillStyle='rgba(60,58,55,0.28)'; x.fillRect((n*97)%w,(n*61)%h,1,1); } })   /* 自流坪水泥灰（使用者 2026-10-16 23:4x「地板跟桌子顏色太近 我要自流坪那種水泥顏色」；正式模型 cafe_interior.glb 由 LAWWW2-B 改 ART-CAFE-FLOOR，這是載入前／失敗時的備用）*/,spawn:{x:0,z:5,yaw:Math.PI},winWall:'right',winXs:[2.5,-1.5],winY:1.9}); const g0=z.group, nav=z.nav; z.seeThru=true;   /* 吊燈電線擋住玩家時網點透空：engine3d.js 的 updateSeeThrough 看的是區域實體（E.zone.seeThru），寫在定義上沒有用 */   /* 窗在右牆 z=−2.5、1.5（窗邊的雙人桌旁邊；正式模型的窗也在這裡）*/
    // 程序化的畫面全部放在 g（備用模型）：Blender 正式模型（ASSETS 'bldg.cafe_interior'，第二個 AI）載入後整組藏起來；導航、座位、互動點、出口都不受影響
    const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
    // 吧檯
    const bar=new THREE.Mesh(new THREE.BoxGeometry(7,1.05,0.9),M('#5c3a21',{rough:0.6})); bar.position.set(-2.5,0.52,-4.4); g.add(bar); nav.blockRect(-2.5,-4.4,7,0.9,0,0.15); const top=new THREE.Mesh(new THREE.BoxGeometry(7.2,0.06,1.0),M('#d9cbb0',{rough:0.4})); top.position.set(-2.5,1.08,-4.4); g.add(top); const machine=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.6,0.6),M('#8f9399',{rough:0.3})); machine.position.set(-4.5,1.4,-4.8); g.add(machine); shelfWall(g,nav,-2.5,-5.75,0,7);
    for(let i=0;i<3;i++){ const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),new THREE.MeshBasicMaterial({color:0xffcf8a})); bulb.position.set(-5+i*2.5,2.4,-3.6); g.add(bulb); const cord=new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.9,4),M('#2b2118')); cord.position.set(-5+i*2.5,2.9,-3.6); g.add(cord); }
    // 窗邊雙人桌 ×2、中間桌 ×2、吧檯座
    z.seats=[]; const twoTop=(x,zz,label,rect)=>{ const t=rect?new THREE.Mesh(new THREE.BoxGeometry(rect[0],0.05,rect[1]),M('#c9a57a',{rough:0.5})):new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.05,16),M('#c9a57a',{rough:0.5})); t.position.set(x,0.74,zz); g.add(t); const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.2,0.72,10),M('#3a3f46')); leg.position.set(x,0.36,zz); g.add(leg); if(rect) nav.blockRect(x,zz,rect[0],rect[1],0,0.1); else nav.blockCircle(x,zz,0.5); for(const s of [-1,1]){ chair(g,x,zz+s*0.8,s>0?Math.PI:0,'#3b2a1e'); z.seats.push({x,z:zz+s*0.8,yaw:s>0?Math.PI:0,pair:x+','+zz}); } E.interactables.push({x,z:zz+0.8,radius:1.1,label:label||'坐在這一桌',seat:{x,z:zz+0.8,yaw:Math.PI},pairSeat:{x,z:zz-0.8,yaw:0},cafeTable:true}); };
    twoTop(4.5,-2.5,'坐在窗邊的雙人桌'); twoTop(4.5,1.5,'坐在窗邊的雙人桌'); twoTop(0,1.5,null,[1.1,0.84]); twoTop(-4,2.5);
    /* ART-WZ4（LAWWW2-B patches/cafe_wz4.md，AA_164 第 4 節）：格局不動、座位只增不減——中間那張改成四人長方桌（兩端各加一個位子）、吧檯座 ×4、角落沙發 ×3；
       沙發、矮桌、立燈、傘桶擋住。原本的站位、seatApproach、存檔都不變 */
    for(const sx of [-1,1]){ chair(g,sx*0.85,1.5,sx<0?Math.PI/2:-Math.PI/2,'#3b2a1e'); z.seats.push({x:sx*0.85,z:1.5,yaw:sx<0?Math.PI/2:-Math.PI/2,pair:'0,1.5'}); }
    for(const sx of [-4.5,-2.9,-1.3,0.3]) z.seats.push({x:sx,z:-3.3,yaw:Math.PI,bar:true,lift:0.27});   /* 吧檯高腳椅座面 0.72 m（一般椅子 0.45）：坐姿抬高 0.27，原本人坐進椅子裡（QA-W1 seats_on_furniture）*/
    nav.blockRect(-6.35,3.4,0.9,2.2,0,0.1); nav.blockRect(-5.3,3.4,0.5,0.8,0,0.1); nav.blockCircle(-6.55,4.85,0.18); nav.blockCircle(-1.05,5.15,0.2);
    for(const [sz,ap] of [[2.85,[-5.0,2.4]],[3.4,[-5.0,4.4]],[3.95,[-5.0,4.4]]]) z.seats.push({x:-5.95,z:sz,yaw:Math.PI/2,sofa:true,ap});   /* ap：前面是矮桌（離沙發 0.15 m），從桌子的一端走近再坐下 */
    E.interactables.push({x:-5.0,z:4.2,radius:1.1,label:'坐在角落的沙發',seat:{x:-5.95,z:3.4,yaw:Math.PI/2,ap:[-5.0,4.4]}});
    { const sm=M('#6b4a3a',{rough:0.8}), lt=M('#c9a57a',{rough:0.5}), mt=M('#3a3f46',{rough:0.5}); const sofa=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.45,2.2),sm); sofa.position.set(-6.35,0.225,3.4); g.add(sofa); const back=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.45,2.2),sm); back.position.set(-6.7,0.65,3.4); g.add(back);
      const ct=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.4,0.8),lt); ct.position.set(-5.3,0.2,3.4); g.add(ct); const lp=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.12,1.5,8),mt); lp.position.set(-6.55,0.75,4.85); g.add(lp); const um=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.5,10),mt); um.position.set(-1.05,0.25,5.15); g.add(um); }   /* 備用模型的量體 */
    // 桌上吊燈（暖光；夜晚是店裡主要的光）
    for(const [x,zz] of [[4.5,-2.5],[4.5,1.5],[0,1.5],[-4,2.5]]){ const cord=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,1.1,4),M('#2b2118')); cord.position.set(x,2.85,zz); g.add(cord); const shade=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.24,14,1,true),M('#2f2a26',{rough:0.5})); shade.material.side=THREE.DoubleSide; shade.position.set(x,2.3,zz); g.add(shade); const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),new THREE.MeshBasicMaterial({color:0xffd9a0})); bulb.position.set(x,2.22,zz); g.add(bulb); const glow=new THREE.Mesh(new THREE.CircleGeometry(0.9,16),new THREE.MeshBasicMaterial({color:0xffb870,transparent:true,opacity:0.16,depthWrite:false,blending:THREE.AdditiveBlending})); glow.rotation.x=-Math.PI/2; glow.position.set(x,0.775,zz); g.add(glow); }
    for(const [x,zz] of [[4.5,-2.5],[4.5,1.5],[0,1.5],[-4,2.5]]){ PROP(g,'prop.cupSaucer',x-0.15,0.77,zz+0.2,0.5); if(zz>0) PROP(g,'prop.glass',x+0.2,0.77,zz-0.2); } PROP(g,'prop.cup',-3.5,1.11,-4.4); PROP(g,'prop.cup',-1.2,1.11,-4.3,0.4); PROP(g,'prop.bagFlat',5.6,0,0.2,0.3); PROP(g,'prop.bottle',0.25,0.77,1.35);
    { /* 吧檯椅（v9.3 第十七批：原本是三個實心圓柱）：木坐墊、金屬立柱、腳踏環、底座 */ const sb=new TK.Bin(); const wd=M('#3b2a1e',{rough:0.6}), mt=M('#4a4f55',{rough:0.4}); for(let i=0;i<4;i++){ const sx=-4.5+i*1.6, sz=-3.3; sb.add(wd,new THREE.CylinderGeometry(0.19,0.17,0.06,16),sx,0.7,sz); sb.add(mt,new THREE.CylinderGeometry(0.03,0.03,0.64,8),sx,0.36,sz); sb.add(mt,new THREE.TorusGeometry(0.16,0.012,6,16),sx,0.28,sz,0,{rx:Math.PI/2}); sb.add(mt,new THREE.CylinderGeometry(0.2,0.22,0.03,16),sx,0.015,sz); } sb.build(g); }
    const menu=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.2,0.05),M('#2b2118')); menu.position.set(2,2.4,-5.85); g.add(menu); const mp=W3.signPlane('拿鐵 120 ・ 手沖 150 ・ 檸檬塔 110',2.3,0.5,{color:'#f4ead8',size:44}); mp.position.set(2,2.5,-5.8); g.add(mp); const mp2=W3.signPlane('營業至 02:30 ・ 讀書免低消',2.3,0.4,{color:'#c9a24f',size:40}); mp2.position.set(2,2.05,-5.8); g.add(mp2);
    E.interactables.push({x:-2.5,z:-3.2,radius:1.6,label:'到吧檯點餐',counter:'cafe'});
    E.interactables.push({x:0.7,z:-3.7,radius:0.9,label:'看班表',cafeRota:true});   /* 牆上的班表（ART-WZ4 的模型；字在 story3d.js S.CAFE_ROTA，BB_159）*/
    E.interactables.push({x:0,z:5.6,radius:1.6,label:'離開咖啡廳',exit:{to:'wenzhou',spawn:{x:51.7,z:0,yaw:-Math.PI/2}}}); z.spawn={x:0,z:4.6,yaw:Math.PI};
    // 正式模型（tools/blender/env_second/cafe_layout.py）多出來的家具：店面玻璃內側的窗邊吧台（兩段）、後牆右段的書牆、三盆大盆栽——導航擋住；
    // 備用模型也放同樣大小的簡單量體（正式模型載入失敗時不會撞到看不見的東西）
    { const wm=M('#7a5536',{rough:0.6}), bm=M('#5a3d26',{rough:0.7}), pm=M('#e4dccb',{rough:0.4});
      for(const s of [-1,1]){ const c=new THREE.Mesh(new THREE.BoxGeometry(4.85,0.05,0.42),wm); c.position.set(s*3.775,1.0,5.56); g.add(c); nav.blockRect(s*3.775,5.56,4.85,0.42,0,0.1); }
      const bc=new THREE.Mesh(new THREE.BoxGeometry(5.4,3.08,0.38),bm); bc.position.set(4.1,1.54,-5.81); g.add(bc); nav.blockRect(4.1,-5.81,5.4,0.38,0,0.1);
      for(const [px,pz] of [[-6.35,0.4],[6.35,-0.5],[-6.3,-2.6]]){ const pt=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.22,0.45,14),pm); pt.position.set(px,0.225,pz); g.add(pt); nav.blockCircle(px,pz,0.3); } }
    P3.mergeStatic(g);   /* 備用模型自己合併（外層合併會跳過它，正式模型載入後要能整組藏起來）*/
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.cafe_interior']) ASSETS.loadOne('bldg.cafe_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); attachRoomGLB(z,g0,g,root); attachCafeInterior(z,g0,root); }).catch(e=>console.warn('兩點半 Café 室內正式模型載入失敗，用程序化備用模型',e));
    return z; } };
  /* 兩點半 Café 室內正式模型（attachRoomGLB 之後）：黑板菜單的字、燈泡與燈罩發光、葉片、吊燈光暈；店面玻璃外的街景（從店裡往溫州街看）。
     街景平面放在店面玻璃外 0.55 m，跟著前牆淡出（winParts），依時段換白天／黃昏／夜晚三張。 */
  function attachCafeInterior(z,g0,root){
    root.traverse(o=>{ if(!o.isMesh) return; const mt=o.material, nm=mt&&mt.name;
      if(nm&&/^seethru_/.test(nm)&&!mt.userData.seeThrough){ mt.userData.seeThrough=true; if(typeof E3!=='undefined'&&E3.patchSeeThrough) E3.patchSeeThrough(mt); }   /* 吊燈電線：跟隨鏡頭貼著電線經過時，整根電線擋在畫面中間（巡場景 2026-10-21）——擋住玩家時網點透空（正式模型是進區域以後才載入的，自己 patch）*/
      if(/MENU_FACE/.test(o.name)){ cafeFacePaint(o,cafeMenuTex(o.userData.menu||[]),null); o.material.emissiveIntensity=0.22; return; }
      if(nm==='cafe_bulb'){ mt.emissive=new THREE.Color(0xfff1d6); mt.emissiveIntensity=2.2; }
      if(nm==='cafe_lampglass'){ mt.emissive=new THREE.Color(0xffd49a); mt.emissiveIntensity=1.1; }
      if(nm&&nm.indexOf('cafe_leaf_')===0){ mt.alphaTest=Math.max(mt.alphaTest||0,0.5); mt.side=THREE.DoubleSide; } });
    root.updateMatrixWorld(true); const v=new THREE.Vector3();
    root.traverse(o=>{ if(!(o.userData&&o.userData.glow)) return; const d=o.userData; const sp=TK.glowSprite(d.glow,d.size||1.2,d.day==null?0.45:d.day,d.night==null?0.45:d.night); o.getWorldPosition(v); g0.worldToLocal(v); sp.position.copy(v); g0.add(sp); });
    /* 玻璃（WALL_front_shop_glass、WALL_right_winglass）不參加牆面淡出：淡出會把面向鏡頭的牆設成不透明，玻璃就變成一片灰、擋住窗外的景。
       改成和窗景一樣——鏡頭在牆外時藏起來，平常維持原本的透明度 */
    for(const w of z.walls.filter(w=>w.material&&/cafe_glass/.test(w.material.name))){ z.walls.splice(z.walls.indexOf(w),1); w.material.opacity=0.16; w.material.transparent=true; w.material.depthWrite=false; z.winParts.push({obj:w,at:w.userData.center,dir:w.userData.dir}); }
    /* 牆面淡出時整面藏起來（店面的木框、壁柱很細，留 12% 的殘影會在鏡頭前變成一條條鬼影）*/
    const baseFade=z.fadeWalls; z.fadeWalls=function(cam,pp){ baseFade.call(this,cam,pp); for(const w of this.walls) w.visible=w.material.opacity>0.5; };
    const view=new THREE.Mesh(new THREE.PlaneGeometry(15,3.5),new THREE.MeshBasicMaterial({map:cafeStreetTex('day'),fog:false})); view.position.set(0,1.75,6.55); view.rotation.y=Math.PI; view.userData.dyn=true; g0.add(view);
    z.winParts.push({obj:view,at:new THREE.Vector3(0,1.7,6),dir:new THREE.Vector3(0,0,-1)});
    const baseTime=z.applyTime; z.applyTime=function(h,weather){ if(baseTime) baseTime.call(this,h,weather); h=h%24; const t=cafeStreetTex((h<5.6||h>=19.2)?'night':(h>=16.6||h<6.6)?'dusk':'day'); if(view.material.map!==t){ view.material.map=t; view.material.needsUpdate=true; } };   /* 引擎每幾幀呼叫一次 */
  }
  // 黑板菜單（後牆 4.64×0.68 m）：兩行粉筆字
  function cafeMenuTex(lines){ return cafeCanvas(1024,152,(x,W,H)=>{ x.fillStyle='#26302b'; x.fillRect(0,0,W,H); for(let i=0;i<40;i++){ x.fillStyle='rgba(255,255,255,'+(0.015+((i*37)%7)/400)+')'; x.beginPath(); x.ellipse((i*97)%W,(i*53)%H,30+(i*13)%40,6+(i*7)%8,(i%5)*0.6,0,7); x.fill(); }
      x.textBaseline='middle'; x.font='600 40px '+CAFE_SANS; x.fillStyle='#f6e3b0'; x.textAlign='left'; x.fillText(lines[0]||'',36,H*0.32); x.fillStyle='#f2ecdc'; x.font='34px '+CAFE_SANS; x.fillText((lines[1]||'')+'　／　'+(lines[2]||''),250,H*0.32); x.textAlign='center'; x.fillText(lines[3]||'',W/2,H*0.72); }); }
  // 店面玻璃外的街景：從店裡往西看溫州街（透視：兩排台北老公寓、淺灰柏油路、電線桿與電線、停在路邊的機車；夜晚窗戶與路燈亮）。只是玻璃後面的背景（room() 的窗景也是這樣做）
  const cafeStreetCache={};
  function cafeStreetTex(mode){ if(cafeStreetCache[mode]) return cafeStreetCache[mode]; const night=mode==='night', dusk=mode==='dusk';
    const t=cafeCanvas(2048,480,(x,W,H)=>{ let s=23; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; const VX=W/2, VY=H*0.56;
      const sky=x.createLinearGradient(0,0,0,VY); if(night){ sky.addColorStop(0,'#0c1224'); sky.addColorStop(1,'#2a3354'); } else if(dusk){ sky.addColorStop(0,'#5d6fa8'); sky.addColorStop(0.6,'#f0a56a'); sky.addColorStop(1,'#ffd9a0'); } else { sky.addColorStop(0,'#8fb6d9'); sky.addColorStop(1,'#e6eef2'); } x.fillStyle=sky; x.fillRect(0,0,W,H);
      const road=night?'#3c3f46':(dusk?'#a39486':'#b1b1ae'); x.fillStyle=road; x.beginPath(); x.moveTo(0,H); x.lineTo(VX-14,VY); x.lineTo(VX+14,VY); x.lineTo(W,H); x.closePath(); x.fill();
      x.strokeStyle=night?'rgba(200,60,50,0.5)':'rgba(190,50,40,0.8)'; x.lineWidth=3; for(const sx of [-1,1]){ x.beginPath(); x.moveTo(VX+sx*(W*0.36),H); x.lineTo(VX+sx*12,VY+2); x.stroke(); }   /* 路邊紅線 */
      const P=(side,s,hf)=>{ const x0=side<0?-60:W+60, yg=H*0.98, yt=-H*0.55; return [VX+(x0-VX)*s, VY+((yg+(yt-yg)*hf)-VY)*s]; };
      const quad=(pts,c)=>{ x.fillStyle=c; x.beginPath(); x.moveTo(pts[0][0],pts[0][1]); for(const p of pts.slice(1)) x.lineTo(p[0],p[1]); x.closePath(); x.fill(); };
      const tiles=['#d9cdb6','#c8bba5','#e3dccd','#b9ab95','#cfc6b8','#a99880','#d6c9b0'];
      for(const side of [-1,1]){ let s0=1.0; let b=0; while(s0>0.07){ const s1=s0*(0.62+r()*0.12); const hf=0.55+r()*0.35; const col=tiles[(b*3+(side>0?2:0))%tiles.length];
          const wallC=night?'#2b2f3a':(dusk?P3.shade(col,0.85):col); quad([P(side,s0,0),P(side,s1,0),P(side,s1,hf),P(side,s0,hf)],wallC);
          const fl=Math.max(3,Math.round(hf*7)); for(let f=1;f<fl;f++){ const h0=hf*f/fl+0.02, h1=h0+hf/fl*0.55; for(let k=0;k<3;k++){ const a=s0+(s1-s0)*(0.12+k*0.3), c=a+(s1-s0)*0.18; const lit=night&&r()<0.55;
              quad([P(side,a,h0),P(side,c,h0),P(side,c,h1),P(side,a,h1)],lit?(r()<0.7?'#ffcf86':'#e9efff'):(night?'#1a1f2a':(dusk?'#6b5a5a':'#6f8090'))); } }
          quad([P(side,s0,0),P(side,s1,0),P(side,s1,0.11),P(side,s0,0.11)],night?(r()<0.6?'#ffd9a0':'#22252c'):(dusk?'#7a6658':'#5c5248'));   /* 一樓店面／鐵捲門 */
          if(r()<0.6){ const a=s0+(s1-s0)*0.5; quad([P(side,a,0.16),P(side,a+(s1-s0)*0.06,0.16),P(side,a+(s1-s0)*0.06,0.34),P(side,a,0.34)],['#c9463d','#2f5d50','#e0b24a','#4a6c8c'][b%4]); }   /* 直立招牌 */
          s0=s1; b++; } }
      x.strokeStyle=night?'#0b0d12':'#3a3530'; for(const side of [-1,1]) for(const s1 of [0.9,0.48,0.26,0.14]){ const p0=P(side,s1,0), p1=P(side,s1,0.62); const px=VX+(p0[0]-VX)*0.78; x.lineWidth=Math.max(1,9*s1); x.beginPath(); x.moveTo(px,VY+(p0[1]-VY)); x.lineTo(px,VY+(p1[1]-VY)); x.stroke(); }   /* 電線桿 */
      x.lineWidth=1.2; for(const yy of [0.58,0.6]) for(const side of [-1,1]){ x.beginPath(); for(const s1 of [0.9,0.48,0.26,0.14]){ const p=P(side,s1,yy); const px=VX+(p[0]-VX)*0.78; s1===0.9?x.moveTo(px,p[1]):x.lineTo(px,p[1]); } x.stroke(); }
      for(const side of [-1,1]) for(let k=0;k<7;k++){ const s1=0.95*Math.pow(0.78,k); const p=P(side,s1,0.0); const px=VX+(p[0]-VX)*0.86, w=70*s1, h=34*s1; x.fillStyle=night?'#15171c':['#e8e8e8','#2b2b2b','#8c3b47','#4a6c8c','#c9b48a'][k%5]; x.fillRect(px-w/2,p[1]-h,w,h*0.8); }   /* 路邊機車 */
      if(night) for(const side of [-1,1]) for(const s1 of [0.48,0.26,0.14]){ const p=P(side,s1,0.5); const px=VX+(p[0]-VX)*0.74; const g=x.createRadialGradient(px,p[1],0,px,p[1],60*s1+6); g.addColorStop(0,'rgba(255,214,150,0.9)'); g.addColorStop(1,'rgba(255,214,150,0)'); x.fillStyle=g; x.fillRect(px-70,p[1]-70,140,140); }
      if(!night){ x.fillStyle=dusk?'rgba(255,170,90,0.10)':'rgba(255,255,255,0.08)'; x.fillRect(0,0,W,H); } });
    t.flipY=true; t.needsUpdate=true; cafeStreetCache[mode]=t; return t; }
  // ---------- 便利商店 ----------
  const cvs={ id:'cvs', name:'日日便利', indoor:true, camDist:4.0, build(E){ const fromWZ=typeof GAME!=='undefined'&&GAME.G&&GAME.G.flags&&GAME.G.flags.CVS_FROM==='wenzhou';   /* AA_413：從溫州街進去（日日便利 A5）窗外是溫州街（對面阿忠水果、半熟；tools/shots/shop_views_layers.py 的 cvs_wz，景深 10.6 m、一層），不是公館 */
    const z=room(E,{view:fromWZ?'cvs_wz':'cvs',viewDepth:fromWZ?10.6:24,w:12,d:9,h:3.2,wallColor:'#f4f1ea',floorTex:W3.stoneTex('#e8e4da'),spawn:{x:0,z:3.5,yaw:Math.PI},winWall:'front',winXs:[-3.6,3.6]});   /* 窗在店面（後牆是貨架）*/ const g0=z.group, nav=z.nav;
    // 程序化的畫面全部放在 g（備用模型）：Blender 正式模型（ASSETS 'bldg.cvs_interior'，第二個 AI）載入後整組藏起來；導航、互動點、出口都不受影響
    const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
    goodsWall(g,nav,-4.5,-4.2,0,6); goodsWall(g,nav,4.5,-4.2,0,3); for(let i=0;i<2;i++){ goodsWall(g,nav,-2+i*4,0,Math.PI/2,5); }   /* v9.3 第十五批：原本是書架（shelfWall）*/ const counter=new THREE.Mesh(new THREE.BoxGeometry(3,1.0,0.8),M('#d9d3c6',{rough:0.5})); counter.position.set(4,0.5,-1.5); g.add(counter); nav.blockRect(4,-1.5,3,0.8,0,0.15); const fridge=new THREE.Mesh(new THREE.BoxGeometry(0.8,2.2,4),new THREE.MeshStandardMaterial({color:0xbcd6df,roughness:0.2,metalness:0.1})); fridge.position.set(5.6,1.1,2); g.add(fridge); nav.blockRect(5.6,2,0.8,4,0,0.1); const glow=new THREE.Mesh(new THREE.PlaneGeometry(3.8,1.8),new THREE.MeshBasicMaterial({color:0xe6f5ff})); glow.position.set(5.19,1.2,2); glow.rotation.y=-Math.PI/2; g.add(glow);
    for(let i=0;i<4;i++){ PROP(g,'prop.riceBall',-6+i*0.35,2.07,-4.05,0.2); PROP(g,'prop.sandwich',-4.2+i*0.4,2.07,-4.05); } for(let i=0;i<6;i++){ PROP(g,'prop.sodaCan',5.45,1.6+(i%3)*0.3,0.6+Math.floor(i/3)*0.5); } PROP(g,'prop.riceBall',3.4,1.02,-1.5); PROP(g,'prop.bag',4.9,1.02,-1.4,0.6);
    E.interactables.push({x:3.2,z:-0.6,radius:1.4,label:'結帳：飯糰／咖啡／飲料',shop:'cvs'}); E.interactables.push({x:0,z:4.2,radius:1.5,label:'離開便利商店',exit:{to:'gongguan',spawn:{x:-29.4,z:18,yaw:Math.PI}}});
    P3.mergeStatic(g);   /* 備用模型自己合併（外層合併會跳過它，正式模型載入後要能整組藏起來；和 201 教室、Café 相同）*/
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.cvs_interior']) ASSETS.loadOne('bldg.cvs_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); attachRoomGLB(z,g0,g,root); attachCvsInterior(z,g0,root); }).catch(e=>console.warn('便利商店室內正式模型載入失敗，用程序化備用模型',e));
    return z; } };
  /* 便利商店室內的正式模型（第二個 AI：tools/blender/env_second/cvs_interior.py）：LED 燈條、飲料櫃背光一直亮；店內材質有燈光感（TK.bounce）；
     走道分類牌用 canvas 畫（白底、店的青綠色字、琥珀色色帶，和溫州街「日日便利」招牌同一套）；自動門玻璃外放一片窗景（和窗戶同一個材質，跟著時段換） */
  const CVS_BOUNCE={cvs_wall:[0.45,0.55],cvs_floor:[0.4,0.5],cvs_shelf:[0.4,0.5],cvs_counter:[0.4,0.5],cvs_countertop:[0.3,0.4]};   /* TK.bounce 的自發光是白色（乘貼圖）：只給白色或有貼圖的材質；有顏色的純色材質不加（會變白） */
  function attachCvsInterior(z,g0,root){
    root.traverse(o=>{ if(!o.isMesh) return; const mt=o.material, nm=mt&&mt.name;
      if(/SIGN_FACE_aisle/.test(o.name)){ const t=cafeCanvas(512,128,(x,w,h)=>{ x.fillStyle='#ffffff'; x.fillRect(0,0,w,h); x.fillStyle='#e8a33a'; x.fillRect(0,h*0.84,w,h*0.16); x.fillStyle='#1f6f78'; x.textAlign='center'; x.textBaseline='middle'; x.font='bold 60px '+WZ_SANS; x.fillText((o.userData||{}).sign||'',w/2,h*0.44); }); cafeFacePaint(o,t,null); o.material.emissiveIntensity=0.35; return; }
      if(/SIGN_FACE_promo/.test(o.name)){ const t=cafeCanvas(1152,128,(x,w,h)=>{ x.fillStyle='#e8a33a'; x.fillRect(0,0,w,h); x.fillStyle='#1f6f78'; x.fillRect(0,0,w,h*0.12); x.fillStyle='#ffffff'; x.textAlign='center'; x.textBaseline='middle'; x.font='bold 64px '+WZ_SANS; x.fillText((o.userData||{}).sign||'',w/2,h*0.58); }); cafeFacePaint(o,t,null); o.material.emissive=new THREE.Color(0xffffff); o.material.emissiveMap=t; o.material.emissiveIntensity=0.3; return; }   /* 後牆的促銷看板（琥珀底白字） */
      if(!mt||mt.userData.cvsReg) return; mt.userData.cvsReg=true;
      if(nm==='cvs_led'){ mt.emissive=new THREE.Color(0xffffff); mt.emissiveIntensity=1.5; }
      if(nm==='cvs_cooler_light'){ mt.emissive=new THREE.Color(0xe9f4ff); mt.emissiveIntensity=1.1; }
      const b=CVS_BOUNCE[nm]; if(b) TK.bounce(mt,b[0],b[1]);
      if(nm==='cvs_goods'||nm==='cvs_poster'){ /* 商品與海報的顏色在頂點色：自發光也照頂點色加一點（店裡很亮，只靠燈光會偏暗） */ mt.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n totalEmissiveRadiance += vColor.rgb * 0.32;\n#endif'); }; mt.customProgramCacheKey=()=>'cvsVcGlow'; mt.needsUpdate=true; } });
    if(z.wins&&z.wins[0]){ const v=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.7),z.wins[0].material); v.position.set(0,1.25,4.5+0.35); v.rotation.y=Math.PI; g0.add(v); (z.winParts=z.winParts||[]).push({obj:v,at:new THREE.Vector3(0,1.25,4.5),dir:new THREE.Vector3(0,0,-1)}); }
    return root; }
  // ---------- 麵店 ----------
  const noodle={ id:'noodle', name:'阿鳳麵店', indoor:true, camDist:4.0, build(E){ const z=room(E,{view:'noodle',viewDepth:24,w:10,d:9,h:3.2,warm:true,wallColor:'#f1e7d6',floorTex:W3.stoneTex('#d9cbb0'),spawn:{x:0,z:3.5,yaw:Math.PI},winWall:'front',winXs:[-3,3]});   /* 窗在店面那一面（後牆是廚房和價目表）*/ const g0=z.group, nav=z.nav;
    // 程序化的畫面全部放在 g（備用模型）：Blender 正式模型（ASSETS 'bldg.noodle_interior'，第二個 AI）載入後整組藏起來；導航、座位、互動點、出口都不受影響
    const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
    const kitchen=new THREE.Mesh(new THREE.BoxGeometry(6,1.0,1.2),M('#8f9399',{rough:0.4})); kitchen.position.set(-1,0.5,-3.8); g.add(kitchen); nav.blockRect(-1,-3.8,6,1.2,0,0.15); const pot=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.5,14),M('#3a3f46',{rough:0.4})); pot.position.set(-2,1.25,-3.8); g.add(pot); z.seats=[]; for(let i=0;i<3;i++){ const x=-3+i*3; desk(g,nav,x,0.5,0,1.4,0.9,'#d9cbb0'); for(const s of [-1,1]){ chair(g,x,0.5+s*0.8,s>0?Math.PI:0,'#c9463d'); z.seats.push({x,z:0.5+s*0.8,yaw:s>0?Math.PI:0}); } E.interactables.push({x,z:1.3,radius:1.1,label:'坐下吃麵',seat:{x,z:1.3,yaw:Math.PI},pairSeat:{x,z:-0.3,yaw:0},eat:'noodle'}); }
    for(let i=0;i<3;i++){ const x=-3+i*3; PROP(g,'prop.bowl',x-0.2,0.77,0.5+0.25); PROP(g,'prop.chopstick',x+0.15,0.78,0.45,0.3); if(i===1) PROP(g,'prop.bowl',x+0.25,0.77,0.5-0.25,2.4); } PROP(g,'prop.bowl',-1.5,1.02,-3.8); PROP(g,'prop.bowl',-0.9,1.02,-3.7,1.2);
    const mp=W3.signPlane('乾麵 60 ・ 餛飩湯 70 ・ 滷蛋 15',3,0.6,{color:'#3b2a1e',size:44}); mp.position.set(0,2.4,-4.35); g.add(mp); E.interactables.push({x:0,z:4.2,radius:1.5,label:'離開麵店',exit:{to:'gongguan',spawn:{x:-63,z:18,yaw:Math.PI}}});
    P3.mergeStatic(g);   /* 備用模型自己合併（外層合併會跳過它，正式模型載入後要能整組藏起來）*/
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.noodle_interior']) ASSETS.loadOne('bldg.noodle_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); attachRoomGLB(z,g0,g,root); attachNoodleInterior(z,g0,root); }).catch(e=>console.warn('麵店室內正式模型載入失敗，用程序化備用模型',e));
    return z; } };
  /* 麵店室內的正式模型（第二個 AI：tools/blender/env_second/noodle_interior.py）：日光燈管一直亮；店內材質有燈光感（TK.bounce，只給白色或有貼圖的材質）；
     價目板（白底深咖啡字）、紅紙菜單（直式黑字）用 canvas 畫；自動門玻璃外放一片窗景（和窗戶同一個材質） */
  const NDL_BOUNCE={ndl_wall_paint:[0.4,0.5],ndl_wall_tile:[0.35,0.45],ndl_floor:[0.3,0.4],ndl_table_top:[0.35,0.45],ndl_ceiling:[0.4,0.5]};
  function attachNoodleInterior(z,g0,root){
    root.traverse(o=>{ if(!o.isMesh) return; const mt=o.material, nm=mt&&mt.name, ud=o.userData||{};
      if(/SIGN_FACE_/.test(o.name)){ o.geometry.computeBoundingBox(); const sz=o.geometry.boundingBox.getSize(new THREE.Vector3()); const wM=Math.max(sz.x,sz.z), hM=sz.y;
        const t=ud.style==='price'?cafeCanvas(1024,Math.round(1024*hM/wM),(x,w,h)=>{ x.fillStyle='#fbf7ee'; x.fillRect(0,0,w,h); x.strokeStyle='#8a3b2e'; x.lineWidth=8; x.strokeRect(8,8,w-16,h-16); x.fillStyle='#3b2a1e'; x.textAlign='center'; x.textBaseline='middle'; let fs=Math.round(h*0.42); x.font='bold '+fs+'px '+WZ_SANS; const tw=x.measureText(ud.sign||'').width, maxW=w-48; if(tw>maxW){ fs=Math.floor(fs*maxW/tw); x.font='bold '+fs+'px '+WZ_SANS; } x.fillText(ud.sign||'',w/2,h*0.52); })   /* 字比板面寬就縮字（LAWWW2 10-14 回報：價目板的字被切掉）*/
          : cafeCanvas(96,Math.round(96*hM/wM),(x,w,h)=>{ x.fillStyle='#c8332a'; x.fillRect(0,0,w,h); x.fillStyle='rgba(255,255,255,0.08)'; x.fillRect(0,0,w,h*0.04); const ch=[...(ud.sign||'')], fs=Math.min(w*0.62,h*0.8/Math.max(1,ch.length)); x.fillStyle='#1d1a18'; x.textAlign='center'; x.textBaseline='middle'; x.font='bold '+fs+'px '+WZ_SANS; ch.forEach((c,i)=>x.fillText(c,w/2,h*0.1+fs*0.6+i*fs*1.05)); });
        const keep=o.material; cafeFacePaint(o,t,null); o.material.emissiveIntensity=0.25; o.material.emissive=new THREE.Color(0xffffff); o.material.emissiveMap=t; return; }
      if(!mt||mt.userData.ndlReg) return; mt.userData.ndlReg=true;
      if(nm==='ndl_tube'){ mt.emissive=new THREE.Color(0xfff4e0); mt.emissiveIntensity=1.4; }
      const b=NDL_BOUNCE[nm]; if(b) TK.bounce(mt,b[0],b[1]); });
    if(z.wins&&z.wins[0]){ const v=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.7),z.wins[0].material); v.position.set(0,1.25,4.5+0.35); v.rotation.y=Math.PI; g0.add(v); (z.winParts=z.winParts||[]).push({obj:v,at:new THREE.Vector3(0,1.25,4.5),dir:new THREE.Vector3(0,0,-1)}); }
    return root; }
  // ---------- 書店 ----------
  const bookstore={ id:'bookstore', name:'舊路書房', indoor:true, camDist:4.0, build(E){ const z=room(E,{view:'bookstore',viewDepth:17,w:12,d:10,h:3.4,wallColor:'#efe6d6',floorTex:W3.canvasTex('woodfloor_lt',256,256,(x,w,h)=>{ x.fillStyle='#cbb390'; x.fillRect(0,0,w,h); x.strokeStyle='rgba(90,60,30,0.22)'; x.lineWidth=2; for(let j=0;j<h;j+=32){ x.beginPath(); x.moveTo(0,j); x.lineTo(w,j); x.stroke(); } }),spawn:{x:0,z:4,yaw:Math.PI},winWall:'front',winXs:[-3.5,3.5]}); /* 窗在店面那一面（後牆是書架）*/ const g0=z.group, nav=z.nav;
    // 程序化的畫面全部放在 g（備用模型）：Blender 正式模型（ASSETS 'bldg.bookstore_interior'，第二個 AI）載入後整組藏起來；導航、互動點、出口都不受影響
    const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
    shelfWall(g,nav,0,-4.7,0,11); shelfWall(g,nav,-5.7,0,Math.PI/2,8); shelfWall(g,nav,5.7,0,Math.PI/2,8); shelfWall(g,nav,-2,0,Math.PI/2,5); shelfWall(g,nav,2,0,Math.PI/2,5); const table=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.8,1.2),M('#8b5e3c')); table.position.set(0,0.4,3); g.add(table); nav.blockRect(0,3,2.4,1.2,0,0.1); E.interactables.push({x:1.8,z:3.2,radius:0.9,label:'看看法律書與文具',shop:'book'})   /* 櫃台桌的東端、收銀機那一頭（BOOKSTORE-EXIT-SHOP-1028，LAWWW2-C）：原本 (0,4.05) 半徑 1.1 就在門口——桌子前緣到門口站得到的地方只有 0.37 m，進門落腳點 (0,4) 也在範圍裡，門口按下去是買書選單。店員站桌子北側 (0.55,1.95) 面向門口，所以不移到桌子後面 */;   /* v9.3 第二十五批：原本在桌子和書架之間 (0,2)，那裡比人還窄、走不進去（tests/reachability_all.py 抓到），買不到教科書；改成桌子靠門口那一側（像櫃台）*/ E.interactables.push({x:0,z:4.6,radius:1.5,label:'離開書店',exit:{to:'gongguan',spawn:{x:-42,z:18,yaw:Math.PI}}});
    P3.mergeStatic(g);   /* 備用模型自己合併（外層合併會跳過它，正式模型載入後要能整組藏起來）*/
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.bookstore_interior']) ASSETS.loadOne('bldg.bookstore_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); attachRoomGLB(z,g0,g,root); attachBookstoreInterior(z,g0,root); }).catch(e=>console.warn('書店室內正式模型載入失敗，用程序化備用模型',e));
    return z; } };
  /* 書店室內的正式模型（第二個 AI：tools/blender/env_second/bookstore_interior.py）：吊燈燈罩、檯燈一直亮；書架、牆、地板有燈光感（TK.bounce）；
     書背的顏色在頂點色（自發光也照頂點色加一點）；手寫牌用 canvas 畫；自動門玻璃外放一片窗景（和窗戶同一個材質） */
  const BK_BOUNCE={bk_wall:[0.38,0.5],bk_floor:[0.3,0.4],bk_shelf:[0.3,0.4],bk_table:[0.3,0.4],bk_ceiling:[0.35,0.45]};
  function attachBookstoreInterior(z,g0,root){
    root.traverse(o=>{ if(!o.isMesh) return; const mt=o.material, nm=mt&&mt.name, ud=o.userData||{};
      if(/SIGN_FACE_/.test(o.name)){ const t=cafeCanvas(1024,170,(x,w,h)=>{ x.fillStyle='#efe6d2'; x.fillRect(0,0,w,h); x.strokeStyle='rgba(60,40,20,0.55)'; x.lineWidth=4; x.strokeRect(10,10,w-20,h-20); x.fillStyle='#2b2118'; x.textAlign='center'; x.textBaseline='middle'; x.font='600 86px '+CAFE_SERIF; x.fillText(ud.sign||'',w/2,h*0.54); });
        cafeFacePaint(o,t,null); o.material.emissive=new THREE.Color(0xffffff); o.material.emissiveMap=t; o.material.emissiveIntensity=0.3; return; }
      if(!mt||mt.userData.bkReg) return; mt.userData.bkReg=true;
      if(nm==='bk_lampshade'){ mt.emissive=new THREE.Color(0xffcf8a); mt.emissiveIntensity=1.2; }
      const b=BK_BOUNCE[nm]; if(b) TK.bounce(mt,b[0],b[1]);
      if(nm==='bk_books'||nm==='bk_poster'){ mt.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n totalEmissiveRadiance += vColor.rgb * 0.28;\n#endif'); }; mt.customProgramCacheKey=()=>'bkVcGlow'; mt.needsUpdate=true; } });
    if(z.wins&&z.wins[0]){ const v=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.7),z.wins[0].material); v.position.set(0,1.25,5+0.35); v.rotation.y=Math.PI; g0.add(v); (z.winParts=z.winParts||[]).push({obj:v,at:new THREE.Vector3(0,1.25,5),dir:new THREE.Vector3(0,0,-1)}); }
    return root; }
  // ---------- 宿舍房間 ----------
  /* 宿舍房間＝台大四人房（DORM-LOFT-L；LAWWW2-B a09ebf4d，使用者 2026-10-17 01:0x 照片、01:3x「宿舍ok」）：上舖床、下面書桌四組（左右各兩組）、進門右邊洗手間、窗在後牆中間。
     配置全部讀 DORM_ROOM（src/data/dorm_room_layout.js，和 dorm_room4.glb 同一份）；玩家是 L2（左邊靠門那組）。203（法律系）＝祐廷、阿凱 R2、柏翰 R1、阿哲 L1；412（經濟系）＝祐廷、阿勳 R2、唐睿 R1、韋綸 L1（AA_208）。
     年份切換 z.dormSet(key)：'203'、'203_movein'（8/29 阿哲還沒到）、'412'、'412_first_night'（韋綸、唐睿 9/2 才搬進來）。窗景：法律系 203＝dorm_room、經濟系 412＝dorm_room412（四樓、往東偏，ART-V0-DORM）。備用模型（GLB 載入失敗）是簡單的床桌方塊（D38 ③）。*/
  /* 大二～大四（LAWWW2-C 2026-10-17，AA_208 第 7、8 節；dorm_room4.glb 的 Y312_／Y507_／Y409_ 各組）：312＝祐廷、阿哲、柏翰、大一學弟；507＝祐廷、柏翰、大二學弟、別系的同屆；409＝祐廷、柏翰、大二學弟、大一學弟。
     舊的四組也要藏這三年的東西（GLB 和這段要一起換）*/
  const DORM_SETS={ '203':{hide:/^(Y412_|Y312_|Y507_|Y409_|NAMETAG_)/}, '203_movein':{hide:/^(Y412_|Y312_|Y507_|Y409_|NAMETAG_|Y203_ZHE$|BEDDING_L1$)/}, '412':{hide:/^(Y203_|Y312_|Y507_|Y409_|ROOMMATE_KAI$|NAMETAG_)/}, '412_first_night':{hide:/^(Y203_|Y312_|Y507_|Y409_|ROOMMATE_KAI$|Y412_TANGRUI$|Y412_WEILUN$|BEDDING_R1$|BEDDING_L1$)/},
    '312':{hide:/^(Y203_|Y412_|Y507_|Y409_|ROOMMATE_KAI$|NAMETAG_)/}, '507':{hide:/^(Y203_|Y412_|Y312_|Y409_|ROOMMATE_KAI$|NAMETAG_)/}, '409':{hide:/^(Y203_|Y412_|Y312_|Y507_|ROOMMATE_KAI$|NAMETAG_)/} };
  function dormSetKey(G){ const F=(G&&G.flags)||{}; if(G&&G.stage==='econ') return F.E412_MOVEIN?'412':'412_first_night'; if(F.ROOM_Y4||F.ROOM_Y4_MOVING) return '409'; if(F.ROOM_Y3||F.ROOM_Y3_MOVING) return '507'; if(F.ROOM_Y2||F.ROOM_Y2_MOVING) return '312';   /* ROOM_Y2_MOVING：搬進 312 那一刻（拆箱前，story3d.js roomY2InDorm、home3d.js roomY2FromHome）*/ return (F.LAW_MOVEIN_DAY!=null&&G.day===F.LAW_MOVEIN_DAY&&!F.KAI_MOVEIN)?'203_movein':'203'; }
  /* 每年的窗景（AA_208 第 7、8 節；LAWWW2-C 4fa4a1e2，tools/shots/window_views.py）：經濟系 412、大一 203（朝舟山路）；大二 312（三樓）、大三 507（五樓）、大四 409（四樓）都朝宿舍背面的樟樹。
     312／507／409 的照片 2026-10-20 起是 Blender 渲染的（tools/blender/env_second/dorm_back_view.py：樟樹、巷子、對面的老公寓與一片屋頂；鏡頭往上抬 9°，窗裡看到的大約是平視的那一段——三樓在樹冠裡、四樓平樹梢、五樓看得到樹梢底下和遠一點的屋頂；SCN-V4-01／SCN-V5-01）。
     393eda85 的 112／218／105（照較舊的 AA_183）作廢、照片已刪。ROOM_Y2／ROOM_Y3／ROOM_Y4 是 dorm3d.js homeOf 用的旗標名，搬房間事件做的時候照這三個設 */
  /* 跟隨鏡頭的碰撞（BUG-CAM-203-R2-1021，BB_218 artrev3 01／04／05／08：站在 R2 書桌旁 (1.0, 0.25)，鏡頭在東被 R2 的上鋪擋住整個畫面、在南被洗手間的磁磚牆擋住）——
     和教學館、美國公寓同一套（engine3d.js 的 followCam 查 zone.camCols：擋到就拉近、抬高，autoSwing 轉向空的那一邊）：
     洗手間整個隔間（地板到天花板）、四組上鋪（床板底到床欄頂：dorm_room4.py 的 DECK0 1.56～GUARD 2.02）。四面牆照舊淡出（剖面視角），不擋。
     站在某一組上鋪底下（書桌前、坐著讀書）時那一組不算：頭在床板下面，視線一出發就撞到床板，鏡頭會被拉到頭上（z.update 每一格換清單）。測試：node tests/dorm_cam_unit.js */
  function dormCamCols(R,H,g){ const inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}), all=[];
    const box=(x0,x1,z0,z1,y0,y1,under)=>{ x0-=0.06; x1+=0.06; z0-=0.06; z1+=0.06; const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),inv); m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
      m.userData.noMerge=true; m.userData.under=under?{x0:x0-0.04,x1:x1+0.04,z0:z0-0.04,z1:z1+0.04}:null; g.add(m); all.push(m); };
    const hb=R.bath.block; box(hb.x[0],hb.x[1],hb.z[0],hb.z[1],0,H,false);
    for(const u of R.units){ const b=u.block; box(b.x[0],b.x[1],b.z[0],b.z[1],1.56,2.02,true); }
    return all; }
  function dormView(G){ const F=(G&&G.flags)||{}; if(G&&G.stage==='econ') return 'dorm_room412'; return (F.ROOM_Y4||F.ROOM_Y4_MOVING)?'dorm_room409':(F.ROOM_Y3||F.ROOM_Y3_MOVING)?'dorm_room507':(F.ROOM_Y2||F.ROOM_Y2_MOVING)?'dorm_room312':'dorm_room'; }   /* AA_208：312 三樓、507 五樓、409 四樓，都朝宿舍的背面（203 朝舟山路）——LAWWW2-C 2026-10-17 */
  const dorm={ id:'dorm', name:'宿舍 房間', indoor:true, camDist:3.6, seeThru:true, build(E){ const G0=typeof GAME!=='undefined'?GAME.G:null, econ=!!G0&&G0.stage==='econ'; const R=DORM_ROOM, RM=R.room, WN=R.window, U={}; for(const u of R.units) U[u.id]=u; const me=U[R.player_unit||'L2'];
    const z=room(E,{w:RM.w,d:RM.d,h:RM.h,view:dormView(G0),viewDepth:25,wallColor:'#f1ebe0',floorTex:W3.stoneTex('#e3d9c6'),spawn:{x:RM.spawn[0],z:RM.spawn[1],yaw:Math.PI},winXs:WN.winXs,winY:WN.view_center[1],curtains:'#c9b48a'}); const g0=z.group, nav=z.nav;
    z.seeThru=true;   /* 上舖床板、被子擋住鏡頭時網點透空：engine3d.js 的 updateSeeThrough 看的是區域實體（E.zone.seeThru），只寫在上面的定義裡，室內透空從來沒開過 */
    z.camBox={x:[-1.6,1.6]};   /* 運鏡只在中間走道：兩側是上舖床（床板 1.6～1.76 m，x ±1.9 以外），鏡頭推到那裡會卡進床板、只拍到床底（BB_218：412 第一晚和阿勳的對話只看到「天花板」）*/
    { const camAll=dormCamCols(R,RM.h,g0), L0=camAll.slice(); z.camCols=[L0];   /* 鏡頭碰撞（BUG-CAM-203-R2-1021）：站在哪一組上鋪底下，那一組就不算 */
      const up0=z.update; z.update=function(dt,E2){ if(up0) up0.call(z,dt,E2); const P=E2&&E2.player; if(!P) return; const p=P.obj.position; L0.length=0; for(const m of camAll){ const u=m.userData.under; if(u&&p.x>u.x0&&p.x<u.x1&&p.z>u.z0&&p.z<u.z1) continue; L0.push(m); } }; }
    // 程序化的畫面全部放在 g（備用模型）：正式模型（ASSETS 'bldg.dorm_room4'）載入後整組藏起來；導航、睡覺、書桌座位、離開都不受影響。月曆、社團傳單、z.deskItems 掛在 g0
    const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
    for(const b of R.blocks) nav.blockRect((b.x[0]+b.x[1])/2,(b.z[0]+b.z[1])/2,b.x[1]-b.x[0],b.z[1]-b.z[0],0,0);   /* 四組床桌、鞋櫃、垃圾桶、曬衣架、洗手間 */
    const y2Room=!econ&&['312','507','409'].includes(dormSetKey(G0));   /* 1A-03：大三 507 照舊擺大二拆出來的東西（同一組家具）＋大三拆出來的（dorm_y3_items.glb）；1A-09、1A-11：大四 409 再加大四的 */ if(y2Room) nav.blockRect((Y2_BOX[0]+Y2_BOX[1])/2,(Y2_BOX[2]+Y2_BOX[3])/2,Y2_BOX[1]-Y2_BOX[0],Y2_BOX[3]-Y2_BOX[2],0,0);   /* 大二 312：書桌旁走道邊的紙箱（拆箱前封好、拆完壓平，dorm_y2_items.glb 的 nav_block）*/
    { const bb=new TK.Bin(), wood=M('#c9a57a',{rough:0.7}), frame=M('#e8e6e0',{rough:0.6}), sheet=M('#efe9dd',{rough:0.9}), bath=M('#dcd8cf',{rough:0.8});
      for(const u of R.units){ const b=u.block, cx=(b.x[0]+b.x[1])/2, cz=(b.z[0]+b.z[1])/2, w=b.x[1]-b.x[0], d=b.z[1]-b.z[0], top=u.bed_top_y||1.76;
        bb.add(frame,new THREE.BoxGeometry(w,0.1,d),cx,top-0.25,cz); bb.add(sheet,new THREE.BoxGeometry(w-0.1,0.15,d-0.1),cx,top-0.12,cz);
        for(const px of [b.x[0]+0.04,b.x[1]-0.04]) for(const pz of [b.z[0]+0.04,b.z[1]-0.04]) bb.add(frame,new THREE.BoxGeometry(0.06,top,0.06),px,top/2,pz);
        bb.add(wood,new THREE.BoxGeometry(0.6,0.04,u.desk_u[1]-u.desk_u[0]),u.desk_center[0],u.desk_top_y-0.02,(u.desk_u[0]+u.desk_u[1])/2); }
      const hb=R.bath.block; bb.add(bath,new THREE.BoxGeometry(hb.x[1]-hb.x[0],RM.h,hb.z[1]-hb.z[0]),(hb.x[0]+hb.x[1])/2,RM.h/2,(hb.z[0]+hb.z[1])/2); bb.build(g); }
    z.deskItems=new THREE.Group(); z.deskItems.position.set(me.desk_center[0],me.desk_top_y,me.desk_center[1]); g0.add(z.deskItems);
    /* 跟著劇情出現的東西的位置（story3d.js 的 dormItems 讀 E.zone.spots）：黃金葛在玩家書桌、阿凱的鍵盤盒子在他的書桌下、方奕廷的三盆植物在窗台 */
    z.spots={pothos:[me.seat_approach[0],me.desk_u[1]-0.1],kaiBox:[U.R2.seat_approach[0],U.R2.desk_u[0]+0.25],fyPots:[0,-RM.d/2+0.55],roomItems:[me.seat_approach[0],me.desk_u[0]+0.05],home:[me.sleep[0],me.sleep[1]+0.8]}; for(const k in z.spots) z.spots[k]=z.spots[k].map(v=>Math.round(v*1000)/1000);   /* home＝週末回家的背包（梯子前再往門口一點）*/
    { const G1=G0, dt=G1&&typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G1.day):{y:2025,m:10,d:15}, f0=new Date(Date.UTC(dt.y,dt.m-1,1)).getUTCDay(), nd=new Date(Date.UTC(dt.y,dt.m,0)).getUTCDate();   /* 月曆照遊戲日期（BUG-DORM-CAL）；週日開頭。貼圖一個月一張；區域每次進來重建，換月就換 */
      const cal=W3.canvasTex('dormCal_'+dt.y+'_'+dt.m,128,176,(x,w,h)=>{ x.fillStyle='#fbfaf6'; x.fillRect(0,0,w,h); x.fillStyle='#b0332a'; x.fillRect(0,0,w,34); x.fillStyle='#ffffff'; x.font='bold 22px "Noto Sans TC",sans-serif'; x.textAlign='center'; x.fillText(dt.m+' 月',w/2,25); x.textAlign='left'; x.fillStyle='#555'; x.font='12px sans-serif'; const rows=Math.ceil((f0+nd)/7); for(let r=0;r<rows;r++) for(let c=0;c<7;c++){ const d=r*7+c-f0+1; if(d>=1&&d<=nd) x.fillText(String(d),8+c*17,58+r*(rows>5?20:24)); } });
      const cs=R.calendar_spot, cm=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.55),new THREE.MeshStandardMaterial({map:cal,roughness:0.9})); cm.position.set(cs.x,cs.y,cs.z); cm.rotation.y=cs.ry; cm.name='dorm_calendar'; g0.add(cm);   /* 洗手間隔間朝房間那一面 */
      const fly=W3.canvasTex('dormFlyer',128,180,(x,w,h)=>{ x.fillStyle='#f4ead8'; x.fillRect(0,0,w,h); x.fillStyle='#2f5d50'; x.fillRect(0,0,w,46); x.fillStyle='#f4ead8'; x.font='bold 18px "Noto Sans TC",sans-serif'; x.fillText('法律服務社',18,29); x.fillStyle='#2f5d50'; x.font='bold 15px "Noto Sans TC",sans-serif'; x.fillText('招 新 中',36,74); x.fillStyle='#555'; x.font='11px "Noto Sans TC",sans-serif'; ['一年級也可以','週三晚上 社課','萬才館 社辦'].forEach((t,i)=>x.fillText(t,22,104+i*20)); x.fillStyle='#c9a24a'; x.fillRect(16,164,96,4); });
      const fs=me.wall_spot_by_desk, fm=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.6),new THREE.MeshStandardMaterial({map:fly,roughness:0.9})); fm.position.set(fs.x+(y2Room?0.02:0),fs.y,fs.z); fm.rotation.y=fs.ry; fm.name='dorm_flyer';   /* 大二有軟木板：傳單釘在板上（往房間多 2 cm，不和板子疊在同一面，LAWWW2-C 899f9bcd）*/ g0.add(fm); dormWallItems(z,g0); }   /* 社團傳單貼在書桌前的牆上（AA_208 第 6 節）*/
    const st=me.seat; E.interactables.push({x:st.x,z:st.z,radius:1.0,label:'坐在書桌前',seat:{x:st.x,z:st.z,yaw:st.yaw,ap:me.seat_approach},deskStudy:true}); E.interactables.push({x:me.sleep[0],z:me.sleep[1],radius:0.9,label:'睡覺',sleep:true});   /* 梯子前：選了睡覺／小睡就從這裡爬上床、躺下、熄燈（story3d.js 的 goToBed，DORM-SLEEP-1030；位置、踏點、鏡頭讀 DORM_ROOM 的 sleep_scene）*/
    /* 宿舍走廊（D44）：房門出去是二樓走廊、自己的房門前（src/dorm3d.js）；沒有載入 dorm3d 時照舊直接回校園 */ if(typeof DM3!=='undefined') E.interactables.push({x:RM.exit[0],z:RM.exit[1],radius:1.4,label:'走出房間',exit:{to:'dorm_hall',spawn:Object.assign({},DM3.homeOf?DM3.homeOf(typeof GAME!=='undefined'&&GAME.G).spawn:DORM_LAYOUT.home.spawn)}}); else E.interactables.push({x:RM.exit[0],z:RM.exit[1],radius:1.4,label:'離開宿舍',exit:{to:'campus',spawn:{x:20,z:54,yaw:Math.PI}}});
    E.interactables.push({x:z.spots.roomItems[0],z:z.spots.roomItems[1],radius:0.6,label:'看看房間裡的東西',roomItems:true});   /* 交接包 v1 第 1 節「房間物件」（玩家書桌前；story3d.js 的 roomItems）*/
    P3.mergeStatic(g);
    z.dormSetKey=dormSetKey(G0); z.dormRoot=null; z.dormSet=key=>{ z.dormSetKey=key; const S=DORM_SETS[key]||DORM_SETS['203']; if(z.dormRoot) z.dormRoot.traverse(o=>{ if(/^(Y203_|Y412_|Y312_|Y507_|Y409_|NAMETAG_|ROOMMATE_KAI|BEDDING_)/.test(o.name)&&!/_(duvet|pillow|card|black|bulb|items|screen|metal)$/.test(o.name)) o.visible=!S.hide.test(o.name); }); };
    if(y2Room) roomItemState(z,G0);   /* 拆箱事件一進房間就呼叫 z.setY2Items：模型還沒載完也先記住 */
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.dorm_room4']) ASSETS.loadOne('bldg.dorm_room4').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); attachRoomGLB(z,g0,g,root); attachDormInterior(z,g0,root); z.dormRoot=root; z.dormSet(z.dormSetKey); if(!econ&&z.dormSetKey==='203') loadY1Items(z,g0,E); if(y2Room) loadY2Items(z,g0,E); if(!econ) loadWzItems(z,g0,E); }).catch(e=>console.warn('宿舍室內正式模型載入失敗，用程序化備用模型',e));
    /* 經濟系那一年（412）：開學那晚的紙箱、經濟學原理、阿勳的書桌與保齡球袋（V0-ART-DORM；AA_168、AA_208）。紙箱照 E01（story3d.js 的 y0FirstNight）：
       開場三箱疊在祐廷的書桌上 → 22:00 兩箱在書桌旁邊的地上 → 先睡＝隔天還在地上（隔天晚上拆完）／拆完＝不見 */
    z.setV0Box=()=>{};
    /* ART-04 黃金葛（方奕廷送的，POTHOS）：法律系 203 祐廷書桌上（GLB 根節點 place：L2 書桌 +z 端前緣）；四種大小照澆水次數（S.pothosSize）。只在拿到以後載入 */
    z.pothosState=null; z.setPothos=(on,n)=>{ const k=on?'S'+pothosSize(n):null; if(z.pothosState===k) return; z.pothosState=k; if(!on){ const o=g0.getObjectByName('dorm_pothos'); if(o) o.visible=false; return; }
      const show=pg=>{ pg.visible=true; pg.traverse(o=>{ if(/^POTHOS_S\d$/.test(o.name)) o.visible=o.name==='POTHOS_'+k; }); };
      let pg=g0.getObjectByName('dorm_pothos'); if(pg){ show(pg); return; }
      if(econ||typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.pothos']) return;
      pg=new THREE.Group(); pg.name='dorm_pothos'; pg.userData.dyn=true; g0.add(pg);
      ASSETS.loadOne('bldg.pothos').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); let P=null; root.traverse(o=>{ if(!P&&o.userData&&o.userData.place) P=o.userData.place; });
        P=P||{x:-2.39,y:0.76,z:0.145,ry:Math.PI/2}; root.position.set(P.x,P.y,P.z); root.rotation.set(0,P.ry||0,0);
        root.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; if(m.material) TK.bounce(m.material,0.3,0.4); } }); pg.add(root); show(pg); }).catch(e=>console.warn('黃金葛載入失敗',e)); };
    if(econ&&typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.v0_dorm_props']){ const vg=new THREE.Group(); vg.name='v0_dorm_props'; vg.userData.dyn=true; g0.add(vg); const VP=R.v0_props;
      z.v0Box=v0BoxFromFlags(GAME.G.flags||{}); z.setV0Box=s=>{ z.v0Box=s; for(const [k,n] of [['onbed','BOXES_ONBED'],['bed','BOXES_BED'],['foot','BOXES_FOOT']]){ const o=vg.getObjectByName(n); if(o) o.visible=s===k; } };
      ASSETS.loadOne('bldg.v0_dorm_props').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
        const put=(n,p,dx,dz,ry)=>{ const o=root.getObjectByName(n); if(!o||!p) return; o.position.set(p.x+(dx||0),p.y||0,p.z+(dz||0)); o.rotation.set(0,ry!=null?ry:(p.ry||0),0); o.traverse(m=>{ if(m.isMesh){ m.castShadow=false; m.receiveShadow=true; } }); vg.add(o); };
        put('BOXES_ONBED',VP.BOXES_DESK,0,0,Math.PI/2); put('BOXES_BED',VP.BOXES_FLOOR,0,0,0.3); put('BOXES_FOOT',VP.BOXES_FLOOR,0,0,0.1);   /* 「書桌上」「書桌旁邊的地上」（AA_208 第 6 節）*/
        put('BOOK_ECON',{x:me.desk_center[0],y:me.desk_top_y,z:me.desk_u[1]-0.25},0,0,Math.PI/2+0.2); put('XUN_DESK',VP.XUN_DESK); put('XUN_BOWLING',VP.XUN_BOWLING);
        z.setV0Box(z.v0Box); }).catch(e=>console.warn('經濟系宿舍的小物件載入失敗',e)); }
    return z; } };
  /* 黃金葛的大小（ART-04；json 寫「LAWWW 定規則」）：每週最多澆一次（story3d.js pothosScene），沒澆不長大。0～5 次＝S1 剛送來、6～19＝S2、20～39＝S3（一年多）、40 以上＝S4 */
  function pothosSize(n){ n=n|0; return n>=40?4:n>=20?3:n>=6?2:1; }
  function v0BoxFromFlags(F){ if(!F.E01_NIGHT) return 'onbed'; if(F.E01_NIGHT==='sleep'&&!F.E01_BOXES) return 'foot'; return 'none'; }
  /* 宿舍房間的正式模型（第二個 AI：tools/blender/env_second/dorm_interior.py）：日光燈管、檯燈燈泡、筆電與螢幕一直亮；
     牆、地板、木家具有燈光感（TK.bounce）；書、雜物的顏色在頂點色（自發光也照頂點色加一點） */
  const DORM_BOUNCE={dorm_wall:[0.4,0.5],dorm_floor:[0.32,0.42],dorm_wood:[0.3,0.4],dorm_wood_dark:[0.25,0.35],dorm_door:[0.25,0.35],dorm_sheet:[0.3,0.4],dorm_duvet:[0.25,0.35],dorm_pillow:[0.3,0.4],dorm_curtain:[0.3,0.4],dorm_ac:[0.3,0.4],dorm_bath_tile:[0.4,0.5],dorm_bath_floor:[0.32,0.42]};   /* 洗手間的牆磚、地磚原本沒有補光：剖面視角看進洗手間是一整片暗灰色（經濟系 412 每天早上第一個畫面右邊四成；LAWWW2 2026-10-21），和房間的牆、地板同一級 */
  function attachDormInterior(z,g0,root){
    root.traverse(o=>{ if(!o.isMesh) return; const mt=o.material, nm=mt&&mt.name; if(!mt||mt.userData.dormReg) return; mt.userData.dormReg=true;
      if(nm==='dorm_tube'){ mt.emissive=new THREE.Color(0xfff7ea); mt.emissiveIntensity=1.3; }
      if(nm==='dorm_lamp_bulb'){ mt.emissive=new THREE.Color(0xffe9b8); mt.emissiveIntensity=1.6; }
      if(nm==='dorm_lcd'){ mt.emissive=new THREE.Color(0x6f98bd); mt.emissiveIntensity=0.9; }
      const b=DORM_BOUNCE[nm.replace(/^seethru_/,'').replace(/_(L|R)[12]$/,'').replace(/_rt$/,'')]; if(b&&!mt.lightMap) TK.bounce(mt,b[0],b[1]);   /* 有光照貼圖（DORM203-LM-1030：bake_dorm_room4.sh；attachRoomGLB 先接好）的材質不加補光：燈、窗的光和牆角、床底下的暗都已經烘焙進去，再加自發光會整片發白、影子不見。
        _rt＝烘焙工具給「同一個材質、這個物件不烘」複製的那一份（洗手間朝前牆、右牆的斷面 dorm_wall_rt）：照舊補光，和改前一樣白 */ if(/^seethru_/.test(nm)){ mt.userData.seeThrough=true; if(typeof E3!=='undefined'&&E3.patchSeeThrough) E3.patchSeeThrough(mt); }   /* 上舖（床架、床單、被子、枕頭）擋住玩家時網點透空（engine3d 的樹幹透視；區域 seeThru）。正式模型是進區域以後才載入的：引擎進區域時那一次整理已經過了，這裡要自己 patch（原本只標記、沒 patch，上舖從來沒有透空過——LAWWW2 2026-10-21 查到）*/
      if(nm==='dorm_items'){ const prev=mt.onBeforeCompile, pk=mt.customProgramCacheKey; mt.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n totalEmissiveRadiance += vColor.rgb * 0.25;\n#endif'); }; mt.customProgramCacheKey=function(){ return (pk?pk.call(this):'')+'|dormVcGlow'; }; mt.needsUpdate=true; }   /* 接在原本的 onBeforeCompile 後面（不蓋掉）：roomLightmap 晚上讓沒烘焙的小東西跟著暗（RT-NIGHT-1028 的 rtK）也是包在這裡 */ });
    dormWallItems(z,g0);   /* attachRoomGLB 換掉了 z.walls：月曆、傳單再加回去 */
    return root; }
  /* 宿舍牆上的月曆（右牆）、社團傳單（左牆）跟著那面牆淡出（放進 z.walls；dir＝往室內的法線，和牆一樣）：
     不然鏡頭在側牆外、牆淡出時，它們會浮在半空中（2026-10-10 LAWWW 回報正式模型的掛勾、冷氣有這個問題，這兩張是同一類） */
  /* 大二房間拆箱的物件（主線 3；dorm_y2_items.glb，LAWWW2-C 899f9bcd，AA_208 7-1；READY_FOR_ART_REVIEW）：軟木板 WALL_left_Y2_BOARD（左牆、書桌前，牆淡出時一起淡出）、
     ITEM_<id>＝STORY.roomY2Items 拆出來的東西（大一的摩天輪票根 y1_3＝ITEM_y1_ferris、河堤相簿 y1_4＝ITEM_y1_album；舊《民法》、經濟學原理在 dorm_room4 的 Y312_YUTING 層架）、
     Y2_BOXES_CLOSED／Y2_BOXES_OPEN（拆箱前／拆完）。z.setY2Items({shown:[id…], boxes:'closed'|'open'})：拆箱事件一件一件拿出來（story3d.js 的 unboxY2）；平常照旗標（ROOM_Y2_ITEMS）。
     大三、大四（507／409）整組帶過去（1A-03、1A-09）：大三丟掉的（ROOM_Y3_DISCARD）、大四留在紙箱的（BOX_KEPT_Y4）不出現；1A-11 收拾好了（PACKED_Y4）全部收起來。
     大三、大四拆出來的東西（SCN-V4-01／SCN-V5-01；dorm_y3_items.glb，tools/blender/env_second/dorm_y3_items.py，LAWWW-C 的美術子代理 2026-10-20；READY_FOR_ART_REVIEW）：
     ITEM_<id>＝S.ROOM_Y3_TEXT（507 起）、S.ROOM_Y4_TEXT（409）的 key，照 ROOM_Y3_ITEMS／ROOM_Y4_ITEMS；FORM_STAMP＝志願表上系辦的章（日本、美國路線才有）。兩組一起由 z.setY2Items 管 */
  /* 大一 203 的兩樣東西（ART-Y1-BOX-1021；dorm_y1_items.glb，tools/blender/env_second/dorm_y1_items.py，LAWWW2-C；AA_347 1-1、5-1；READY_FOR_ART_REVIEW）：
     Y1_BOX_WINTER＝「冬天的衣服」紙箱（8/29 起、拆以前；祐廷衣櫃前、床板底下）、Y1_BOX_FOLDED＝拆了以後壓平、靠在衣櫃門前（原本封好的那格；BOX_WINTER_OPEN；LAWWW2 6437fcf6，原本在書桌底下看不到）；
     Y1_KAI_TAPE＝阿凱的國界（KAI_TAPE 以後、還是室友；R2 床桌組外面一圈，寬 4.8 cm），中間那段 Y1_KAI_TAPE_MID「國界」／_TEXT「法律系免簽」只顯示一個（ev_kai_tape2 演過＝後者；AA 2026-10-21）。
     都在床桌組裡面或貼在地上（離地 1.5～2.2 mm；走道那一條離牆 1.38 m），不改導航。y1fill3d.js 的 S.tick 每一幀叫 z.setY1Items（狀態沒變就不動）*/
  function y1State(G){ const F=(G&&G.flags)||{}, d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2025-08-29'):null, done=(G&&G.events&&G.events.done)||{};
    const mate=typeof STORY==='undefined'||!STORY.kaiRoommate||STORY.kaiRoommate(G);
    return {box:F.BOX_WINTER_OPEN?'folded':(G&&d!=null&&G.day>=d?'closed':null), tape:!!F.KAI_TAPE&&mate&&!F.KAI_TAPE_GONE, text:!!done.ev_kai_tape2}; }
  function loadY1Items(z,g0,E){ if(typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.dorm_y1_items']) return; const grp=new THREE.Group(); grp.name='dorm_y1_items'; grp.userData.dyn=true; g0.add(grp); let key='';
    z.setY1Items=G=>{ const s=y1State(G), k=JSON.stringify(s); if(k===key) return; key=k;
      grp.traverse(o=>{ if(o.name==='Y1_BOX_WINTER') o.visible=s.box==='closed'; else if(o.name==='Y1_BOX_FOLDED') o.visible=s.box==='folded'; else if(o.name==='Y1_KAI_TAPE') o.visible=s.tape; else if(o.name==='Y1_KAI_TAPE_MID') o.visible=s.tape&&!s.text; else if(o.name==='Y1_KAI_TAPE_TEXT') o.visible=s.tape&&s.text; }); };
    ASSETS.loadOne('bldg.dorm_y1_items').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); root.traverse(m=>{ if(m.isMesh){ m.castShadow=/^Y1_BOX_/.test(m.parent&&m.parent.name||''); m.receiveShadow=true; if(m.material) TK.bounce(m.material,0.3,0.4); } });   /* 紙箱有接地的影子；膠帶貼在地上不投影 */
      grp.add(root); key=''; z.setY1Items(typeof GAME!=='undefined'?GAME.G:null); }).catch(e=>console.warn('大一房間的紙箱、膠帶載入失敗',e)); }
  const Y2_BOX=[-1.80,-1.12,-0.88,-0.36];
  const Y2_NODE=id=>id==='y1_3'?'ITEM_y1_ferris':(id==='y1_4'?'ITEM_y1_album':'ITEM_'+id);
  const itemRoot=o=>/^ITEM_/.test(o.name)&&!(o.parent&&/^ITEM_/.test(o.parent.name));   /* 每一件的根節點；底下的網格叫 ITEM_<id>_<部位>，不能一起判斷（2026-10-20 以前大二那組的網格全被藏起來，房間裡看不到）*/
  const stampOn=()=>{ const G=typeof GAME!=='undefined'?GAME.G:null, r=typeof STORY!=='undefined'&&STORY.route?STORY.route(G):((G&&G.flags)||{}).EXCHANGE_ROUTE; return r==='JP'||r==='US'; };   /* ROOM_Y4_TEXT.form：日本、美國路線是蓋了章的影本 */
  function y2State(G){ const F=(G&&G.flags)||{}; if(F.ROOM_Y3_MOVING) return {shown:[],boxes:'closed'};   /* 1A-03 搬進 507、還沒拆箱 */ if(F.ROOM_Y4_MOVING||F.PACKED_Y4) return {shown:[],boxes:'closed'};   /* 1A-09 搬進 409、還沒拆箱；1A-11 收拾好了（畢業前一晚起）*/ const y34=[].concat(F.ROOM_Y3&&Array.isArray(F.ROOM_Y3_ITEMS)?F.ROOM_Y3_ITEMS:[],F.ROOM_Y4&&Array.isArray(F.ROOM_Y4_ITEMS)?F.ROOM_Y4_ITEMS:[]);   /* 大三、大四拆出來的（舊存檔沒有＝沒有）*/ const shown=(Array.isArray(F.ROOM_Y2_ITEMS)?F.ROOM_Y2_ITEMS:(F.ROOM_Y2&&typeof STORY!=='undefined'&&STORY.roomY2Items?STORY.roomY2Items(G).map(r=>r[0]):[])).concat(y34).filter(id=>id!==F.ROOM_Y3_DISCARD).filter(id=>id!==F.BOX_KEPT_Y4);   /* 大三丟掉的那一件不再出現；大四留在紙箱裡的那一件也不拿出來 */ return {shown,boxes:F.ROOM_Y2&&!F.ROOM_Y2_MOVING?'open':'closed'}; }
  function roomItemState(z,G){ z.y2=y2State(G); z.itemGroups=[]; z.itemsLoading=0;
    z.setY2Items=st=>{ z.y2=Object.assign({},z.y2,st||{}); const S=z.y2, stamp=stampOn(); for(const grp of z.itemGroups) grp.traverse(o=>{ if(itemRoot(o)) o.visible=(S.shown||[]).some(id=>Y2_NODE(id)===o.name); else if(o.name==='Y2_BOXES_CLOSED') o.visible=S.boxes==='closed'; else if(o.name==='Y2_BOXES_OPEN') o.visible=S.boxes==='open'; else if(o.name==='FORM_STAMP') o.visible=stamp; }); }; }
  function loadY2Items(z,g0,E){ if(typeof ASSETS==='undefined') return; if(!z.setY2Items) roomItemState(z,typeof GAME!=='undefined'?GAME.G:null);
    const load=(key,name,att,msg)=>{ if(!ASSETS.manifest[key]) return; const grp=new THREE.Group(); grp.name=name; grp.userData.dyn=true; g0.add(grp); z.itemGroups.push(grp); z.itemsLoading++;
      ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); root.traverse(m=>{ if(m.isMesh){ m.castShadow=false; m.receiveShadow=true; } }); grp.add(root); root.updateMatrixWorld(true); att(root); z.setY2Items(); }).catch(e=>console.warn(msg,e)).finally(()=>{ z.itemsLoading--; }); };
    load('bldg.dorm_y2_items','dorm_y2_items',root=>root.traverse(o=>{ if(o.isMesh&&/WALL_/.test(o.name)){ o.material=o.material.clone(); o.material.transparent=true; const d=o.userData.dir||[1,0,0]; o.userData.dir=new THREE.Vector3(d[0],d[1],d[2]); o.geometry.computeBoundingBox(); o.userData.center=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld); z.walls.push(o); } }),'大二房間的物件載入失敗');   /* 軟木板跟著左牆淡出 */
    if(['507','409'].includes(z.dormSetKey)) load('bldg.dorm_y3_items','dorm_y3_items',root=>root.traverse(o=>{ if(o.isMesh&&o.material&&/^seethru_/.test(o.material.name)){ o.material.userData.seeThrough=true; if(typeof E3!=='undefined'&&E3.patchSeeThrough) E3.patchSeeThrough(o.material); } }),'大三、大四房間的物件載入失敗'); }   /* 床欄上的隊服、名牌：和上舖同一套（seethru_，attachDormInterior；載入以後自己 patch）*/
  /* 溫州街打工、故事線留在房間的六件東西（ART-WZ6；AA_420 第 9 節，DL-11；dorm_wz_items.glb，tools/blender/env_second/dorm_wz_items.py，LAWWW2-B 2026-10-24；READY_FOR_ART_REVIEW）：
     ITEM_wz_<key>（key＝WZ_JOBS_DATA.room：timer 書桌右後角、card 書桌前緣、notebook／tea 層架頂、board 層架和衣櫃中間的牆、poster 上舖旁邊的牆）照 JOBS.roomKeys（和「看看房間裡的東西」的文字同一份）；
     搬家、收拾的那幾天（紙箱封著）全部收起來。四個年級都是同一組家具（L2），不和大一～大四的其他物件、黃金葛重疊。牆上那兩件的網格叫 WALL_left_*：跟左牆一起淡出（同大二的軟木板）。
     一件都沒有的時候不載入；旗標在房間裡變了（例：把茶送出去）每一幀比一次（只比一個字串）*/
  function wzItemKeys(G){ const F=(G&&G.flags)||{}; if(F.ROOM_Y2_MOVING||F.ROOM_Y3_MOVING||F.ROOM_Y4_MOVING||F.PACKED_Y4) return []; return typeof JOBS!=='undefined'&&JOBS.roomKeys?JOBS.roomKeys(G):[]; }
  function loadWzItems(z,g0,E){ if(typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.dorm_wz_items']) return; let grp=null, key=null, loading=false;
    const apply=K=>{ if(grp) grp.traverse(o=>{ if(/^ITEM_wz_/.test(o.name)) o.visible=K.includes(o.name.slice(8)); }); };
    z.setWzItems=G=>{ const K=wzItemKeys(G), k=K.join(','); if(k===key) return; key=k; if(grp){ apply(K); return; } if(!K.length||loading) return; loading=true;
      grp=new THREE.Group(); grp.name='dorm_wz_items'; grp.userData.dyn=true; g0.add(grp);
      ASSETS.loadOne('bldg.dorm_wz_items').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
        grp.add(root); root.updateMatrixWorld(true);
        root.traverse(o=>{ if(!o.isMesh) return; o.castShadow=false; o.receiveShadow=true;
          if(/WALL_/.test(o.name)){ o.material=o.material.clone(); o.material.transparent=true; const d=o.userData.dir||[1,0,0]; o.userData.dir=new THREE.Vector3(d[0],d[1],d[2]); o.geometry.computeBoundingBox(); o.userData.center=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld); z.walls.push(o); }   /* 牆上那兩件：材質先複製（淡出各自的透明度）再加補光 */
          if(o.material) TK.bounce(o.material,0.3,0.4); });
        apply(key?key.split(','):[]); }).catch(e=>console.warn('房間的溫州街物件載入失敗',e)); };
    const up0=z.update; z.update=function(dt,E2){ if(up0) up0.call(z,dt,E2); if(typeof GAME!=='undefined'&&GAME.G) z.setWzItems(GAME.G); };
    z.setWzItems(typeof GAME!=='undefined'?GAME.G:null); }
  function dormWallItems(z,g0){ for(const n of ['dorm_calendar','dorm_flyer']){ const o=g0.getObjectByName(n); if(!o||z.walls.includes(o)) continue;
    o.material.transparent=true; o.userData.dir=new THREE.Vector3(Math.sin(o.rotation.y),0,Math.cos(o.rotation.y));   /* 貼的那一面朝室內的方向（四人房：月曆在洗手間隔間、傳單在書桌前的牆）*/ o.updateWorldMatrix(true,false); o.userData.center=o.getWorldPosition(new THREE.Vector3()); z.walls.push(o); } }
  /* ---------- 溫州街三家新店的室內（DL-09 第一步；ART-WZ3，LAWWW2-B ce586623；AA_164 第 2 節）----------
     配置 src/data/wz_shops_layout.js（Blender 讀同一份）：大小、家具阻擋、座位、互動點、出口、溫州街的進店點 enterAt（世界座標）。
     做法照麵店：room() 的空房間＋家具色塊是備用（D38 ③），正式模型 bldg.wz_*_interior 載入後整組藏起來（attachRoomGLB：WALL_ 淡出牆）。
     一盞的前面沒有牆：房子 z −5～5、緣側 5～6.2、前院 6.2～9.6（layout 的 block 擋住，看得到、走不到）——room() 以原點為中心，建好後整個往 +z 移 2.3（導航格的原點一起移）。
     這一版：走得進去、選位子坐下、離開；點餐、印東西、喝茶的文字照 AA_172（src/wzshops3d.js；AA_355 第 3 節），打工是 DL-10。測試：node tests/wz_shops_unit.js */
  const WZ_FLOOR={wood_light:'#cdb08a',tile_grey:'#c9c9c4',wood_dark:'#c9b08c',mosaic:'#a7aeaa'};   /* 淺色木地板（使用者 10-23：不要深色木地板，整個遊戲都不要；ART-NO-DARK-WOOD-1023）*/   /* wood_dark 原本 #7d5c40；溫州街店家的配置已改成 wood_light，這個鍵留著相容 */
  function wzShop(key){ return { id:'wz_'+key, name:(typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT[key])?WZ_SHOPS_LAYOUT[key].name:key, indoor:true, camDist:4.0, build(E){ const L=WZ_SHOPS_LAYOUT[key], tea=!!(L.front&&L.front.openFront);
      const winXs=(L.front&&(L.front.views||L.front.windows)||[]).map(w=>-(w[0]+w[1])/2);   /* views：窗外街景的照片平面（林家、定食店整面一片）；沒有的照建築的窗 */   /* 店面那一面的窗（room() 的 front：沿牆位置 t＝−x）*/
      const sp=Object.assign({},L.spawn); if(!tea) sp.z=Math.min(sp.z,L.d/2-0.95);   /* room() 的牆內 0.4 m 不能站（阿德影印的出生點 3.9 太靠門）*/
      const z=room(E,{w:L.w,d:L.d,h:L.h,warm:key!=='print',cool:key==='print',wallColor:L.wallColor,floorTex:W3.stoneTex(WZ_FLOOR[L.floor]||'#d9cbb0'),spawn:sp,windows:tea||!winXs.length?false:undefined,winWall:'front',winXs,winW:L.front&&L.front.viewW,winH:L.front&&L.front.viewH,winY:L.front&&L.front.viewY,view:L.front&&L.front.view,viewDepth:L.front&&L.front.viewDepth})   /* 阿德影印是日光燈：warm:false（LAWWW2-B 10-16 建議，截圖 wz_shops_ingame/print_entry_night.webp）*/;
      const g0=z.group, nav=z.nav, cz=tea?(9.6-L.d/2):0;   /* 一盞：房間 z −5～9.6 */
      if(L.seeThru) z.seeThru=true;   /* 室內的網點透空要區域打開（engine3d.js updateSeeThrough）*/
      if(cz){ g0.position.z+=cz; nav.oz+=cz; for(const w of z.walls) w.userData.center=new THREE.Vector3(w.position.x,w.position.y,w.position.z+cz); }
      const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
      if(L.camWalls){ const inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}), cols=[], ch=L.h+2;   /* 隔間牆當跟隨鏡頭的牆（engine3d.js followCam 的 zone.camCols：擋到就拉近、抬高）；比天花板高 2 m：鏡頭在天花板上方往下看時，越過隔間上緣的線也要擋 */
        for(const [x,zz,w,d] of L.camWalls){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,ch,d),inv); m.position.set(x,ch/2,zz-cz); m.userData.noMerge=true; g0.add(m); cols.push(m); }
        z.camCols=[cols]; }
      const fbM=M('#a88b6a',{rough:0.8});
      for(const b of L.blocks){ nav.blockRect(b[0],b[1],b[2],b[3],0,0.05); const m=new THREE.Mesh(new THREE.BoxGeometry(b[2],0.85,b[3]),fbM); m.position.set(b[0],0.425,b[1]-cz); g.add(m); }   /* 備用的家具色塊（模型載入後藏起來）*/
      z.seats=[]; for(const st of L.seats){ if(st.npcOnly||/打工/.test(st.label||'')) continue; const fl=st.kind==='floor'?{floor:0.08}:(st.lift?{lift:st.lift}:{}); z.seats.push(Object.assign({x:st.x,z:st.z,yaw:st.yaw,table:st.table,kind:'shop'},fl,st.ap?{ap:st.ap}:{}));   /* floor＝坐墊的高度（茶屋的和室、緣側：跪坐，GAME.sitAt → character3d.js 的 sitFloor；QA-W1 座位檢查：原本用椅子的坐姿，人坐在坐墊上方 0.4 m 的空中）；lift＝吧台高腳凳（巷子裡定食的吧台，座面 0.72 m：坐姿抬高 0.27，和 Café 的吧台一樣）*/
        E.interactables.push({x:st.x,z:st.z,radius:0.9,label:st.label||'坐下',seat:Object.assign({x:st.x,z:st.z,yaw:st.yaw},fl,st.ap?{ap:st.ap}:{}),shop:key}); }   /* 按鈕的座位也要帶 ap：「坐下」用的是這一份（GAME.freeSeat 沒人坐就原樣回傳）*/
      const ex=L.exit, exSp=key==='print'&&L.moved&&wzCopyState(typeof GAME!=='undefined'?GAME.G:null)==='moved'?L.moved.exitSpawn:ex.spawn; E.interactables.push({x:ex.at.x,z:ex.at.z,radius:1.3,label:ex.label,exit:{to:ex.to,spawn:Object.assign({},exSp)}});   /* 阿德影印搬到轉角以後從轉角出來（ART-WZ6）*/
      /* 客人的選單（AA_172，src/wzshops3d.js）：配置檔的互動點只接客人用的；打工用的（出餐檯、廚房、櫃台、膠裝、水屋）等 DL-10。
         林家乾麵、巷子裡定食（AA_364，WZS.order364）：攤車旁／結帳台＝點餐（店員招呼、選單、坐下吃）、看菜單＝牆上菜單那一行 */
      const CUST={brunch:{cashier:'點餐',chalkboard:'看今日推薦'},teahouse:{tea:'喝茶',garden:'看院子',tokonoma:'看床之間的掛軸'},print:{print:'印東西',stationery:'買文具'},lin:{order:'點餐',menu:'看菜單'},teishoku:{cashier:'點餐',menu:'看木札菜單'}}[key]||{};
      for(const q of (L.interact||[])) if(CUST[q.kind]) E.interactables.push({x:q.x,z:q.z,radius:1.0,label:CUST[q.kind],wzShop:key,kind:q.kind});
      P3.mergeStatic(g);
      const mk='bldg.wz_'+key+'_interior'; if(typeof ASSETS!=='undefined'&&ASSETS.manifest[mk]) ASSETS.loadOne(mk).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); if(cz) root.position.z-=cz; attachRoomGLB(z,g0,g,root);
        if(L.seeThru) root.traverse(q=>{ if(!q.isMesh) return; for(const m of [].concat(q.material)){ if(!m||m.userData.seeThrough||!L.seeThru.includes(m.name)) continue; m.userData.seeThrough=true; if(E.patchSeeThrough) E.patchSeeThrough(m); } }); }).catch(e=>console.warn(L.name+' 室內正式模型載入失敗，用備用模型',e));   /* L.seeThru：這些材質擋住人、或離鏡頭太近時網點透空（巷子裡定食的和紙燈籠）*/
      return z; } }; }
  const wz_brunch=wzShop('brunch'), wz_print=wzShop('print'), wz_teahouse=wzShop('teahouse');
  /* 林家乾麵（A4）、巷子裡定食（B3）能進去內用（WZ-SHOP-AA364-ART，LAWWW2 2026-10-22；AA_364）：同一套 wzShop，配置在 WZ_SHOPS_LAYOUT.lin／teishoku；正式模型 tools/blender/env_second/wz_aa364_shops.py --shop lin|teishoku（118 巷店面的零件）。
     這一版：走得進去、選位子坐下、離開；點餐、店員、營業時間由 LAWWW 接（AA_364 第 4 節 #2）。資產登錄放這裡（和 118 巷店面 l118_shops3d.js 一樣），不動 assets3d.js */
  const wz_lin=wzShop('lin'), wz_teishoku=wzShop('teishoku');
  if(typeof ASSETS!=='undefined') for(const k of ['lin','teishoku']){ const mk='bldg.wz_'+k+'_interior'; if(!ASSETS.manifest[mk]) ASSETS.manifest[mk]={url:'assets/models/env/second_ai/wz_'+k+'_interior.glb',type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/wz_aa364_shops.py --shop '+k+'（溫州街'+(k==='lin'?'「林家乾麵」':'「巷子裡定食」')+'室內，配置 src/data/wz_shops_layout.js；LAWWW2 WZ-SHOP-AA364-ART）',license:'本作；貼圖 Poly Haven CC0＋本作程式產生'}; }
  // ---------- 和平東路二段 118 巷（D46；使用者 2026-10-18 02:2x「118巷如果已經做好了，現在就放進這個發佈版本」）----------
  /* 配置 src/data/lane118_layout.js（Blender 的 lane118_street.glb 讀同一份，座標相同：x 往東、z 往南）；店家、點餐、常客、阿哲週一揪人在 src/lane118.js（AA_280）。
     可走：巷子＋兩側人行道（x −5～5、z −41.5～33.8）、南端過辛亥路到台大後門（x −2～2、z 33.8～49.5）；兩條小巷、和平東路是背景。店先不做室內：店門口點餐。
     正式模型沒載入（或 ?nobldg）時，兩側是方塊立面（D38 分類 ③ 備用）*/
  function buildLane118(E){ const L=typeof LANE118_LAYOUT!=='undefined'?LANE118_LAYOUT:null; const g=new THREE.Group();
    const NX=-14, NZ=-48; const nav=new E3.NavGrid(28,100,0.5,NX,NZ); nav.b.fill(1);
    const open=(x0,z0,x1,z1)=>{ for(let cz=0;cz<nav.rows;cz++) for(let cx=0;cx<nav.cols;cx++){ const [wx,wz]=nav.toWorld(cx,cz); if(wx>=x0&&wx<=x1&&wz>=z0&&wz<=z1) nav.b[nav.idx(cx,cz)]=0; } };
    const fw=L?L.facade.west:-5.2, fe=L?L.facade.east:5.2, z0=L?L.lane.z0:-42, z1=L?L.lane.z1:34, gz=L?L.backGate.z:49;
    open(fw+0.25,z0+0.5,fe-0.25,z1-0.2); open(-2,z1-0.2,2,gz+0.5); nav._cm=null;
    const addCollider=(x,z,w,d,h)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h||14,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x,(h||14)/2,z); g.add(m); E.colliders.push(m); };
    // 地面：巷子柏油、兩側人行道、辛亥路、和平東路、遠景地面
    const n0=g.children.length;
    { const r=TK.road(z1-z0,(L?L.lane.x1-L.lane.x0:6.8)); r.position.set(0,0,(z0+z1)/2); r.rotation.y=Math.PI/2; g.add(r); }
    for(const [x0,x1] of [[fw,L?L.lane.x0:-3.4],[L?L.lane.x1:3.4,fe]]) ground(g,x1-x0,z1-z0,W3.stoneTex('#bdb6aa'),[(x1-x0)/2,(z1-z0)/2],(x0+x1)/2,(z0+z1)/2,0.012);
    if(L){ const rs=L.roadSouth, rn=L.roadNorth; { const r=TK.road(80,rs.z1-rs.z0); r.position.set(0,0.004,(rs.z0+rs.z1)/2); g.add(r); } { const r=TK.road(80,rn.z1-rn.z0); r.position.set(0,0.004,(rn.z0+rn.z1)/2); g.add(r); }
      // 斑馬線（過辛亥路回台大）
      for(let z=rs.z0+1;z<rs.z1-0.6;z+=1.2){ const m=new THREE.Mesh(new THREE.PlaneGeometry(rs.crossW||4,0.55),TK.col('#efefe8')); m.rotation.x=-Math.PI/2; m.position.set(rs.crossX||0,0.02,z); g.add(m); } }
    { const m=new THREE.Mesh(new THREE.PlaneGeometry(160,220),TK.col('#6d6a64')); m.rotation.x=-Math.PI/2; m.position.y=-0.02; m.receiveShadow=true; g.add(m); }
    // 後門那一側：台大的圍牆和門柱（背景）
    { const wallM=M('#9a9086'), postM=M('#7d756c'); for(const [x,w] of [[-22,36],[22,36]]){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,1.6,0.5),wallM); m.position.set(x,0.8,gz+1.2); g.add(m); } for(const x of [-4,4]){ const p=new THREE.Mesh(new THREE.BoxGeometry(0.8,2.6,0.8),postM); p.position.set(x,1.3,gz+1.2); g.add(p); } }
    /* 上面這些（套件的路、人行道平面、斑馬線長條、遠景地面、圍牆和門柱方塊）是暫代：正式模型 lane118_ground.glb（ART-L118-GROUND，LAWWW2-C）載入後藏起來。
       dyn：引擎載入區域時會把靜態網格合併（P3.mergeStatic），合併後就藏不掉 */
    const tmpGround=g.children.slice(n0); for(const o of tmpGround){ o.userData.dyn=true; o.userData.l118g=true; }
    // 兩側立面：備用方塊（tag l118，正式模型載入後藏起來）＋鏡頭碰撞
    const fb=[]; const gaps=side=>((L&&L.alleys)||[]).filter(a=>a.side===side);
    for(const side of ['W','E']){ const fx=side==='W'?fw:fe, sx=side==='W'?-1:1; const cuts=gaps(side).map(a=>[a.z0,a.z1]).sort((a,b)=>a[0]-b[0]); let cur=z0; const segs=[]; for(const [a,b] of cuts){ if(a>cur) segs.push([cur,a]); cur=b; } if(z1>cur) segs.push([cur,z1]);
      for(const [a,b] of segs){ const w=b-a, cx=fx+sx*6; const m=new THREE.Mesh(new THREE.BoxGeometry(12,13,w),M(side==='W'?'#cfc5b2':'#d6c3a5')); m.position.set(cx,6.5,(a+b)/2); m.userData.l118=true; m.userData.dyn=true; g.add(m); fb.push(m); addCollider(cx,(a+b)/2,12,w,14); } }
    // 店門口（點餐）：店的中間、人行道上
    for(const sh of ((L&&L.shops)||[])){ const x=sh.side==='W'?fw+0.9:fe-0.9, z=(sh.z0+sh.z1)/2; const nm=(typeof LANE118_SHOPS!=='undefined'&&(LANE118_SHOPS.shops.find(q=>q.id===sh.id)||{}).name)||sh.name;
      /* 店走得進去（LANE118-SHOPS-1020，X66；使用者 2026-10-20「店裡可以進去 店員也在裡面」）：有室內配置的店，營業時間按鈕是「進○○」（區域 l118_<id>，src/l118_shops3d.js）；
         沒開的時候照舊是店門口那個按鈕（L118.order 說鐵門拉下來一半） */
      const open118=()=>{ try{ return typeof L118!=='undefined'&&typeof GAME!=='undefined'&&GAME.G?L118.isOpen(sh.id,GAME.G):true; }catch(e){ return true; } };
      if(typeof L118_SHOP_LAYOUTS!=='undefined'&&L118_SHOP_LAYOUTS[sh.id]){ const LL=L118_SHOP_LAYOUTS[sh.id];
        E.interactables.push({x,z,radius:1.4,prio:1,label:'進'+nm+'（'+sh.type+'）',exit:{to:'l118_'+sh.id,spawn:{x:LL.spawn.x,z:LL.spawn.z,yaw:LL.spawn.yaw}},get hidden(){ return !open118(); }});
        E.interactables.push({x,z,radius:1.4,prio:1,label:nm+'（'+sh.type+'）',shop118:sh.id,get hidden(){ return open118(); }}); }   /* prio：在門口等的常客不擋店門（BB-C 10-20：好家自助餐門口江明軒站著，按鈕變「和江明軒說話」進不去）；要跟他說話就進店（L118.populateShop 讓他跟進來）*/
      else E.interactables.push({x,z,radius:1.4,label:nm+'（'+sh.type+'）',shop118:sh.id}); }
    E.interactables.push({x:0,z:gz-0.6,radius:2.2,label:(L&&L.backGate.label)||'回到台大（後門）',exit:{to:'campus',spawn:{x:34,z:-125.6,yaw:0}}});   /* 回到霖澤館後面的小廣場（校園那一側的出口在同一個地方）*/
    // 路燈與店家燈光（晚上）
    const pools=[]; for(const z of [-30,-10,10,28]){ const lp=W3.lampPost(); place(g,lp,fe-0.35,z,-Math.PI/2); nav.blockCircle(fe-0.35,z,0.5); const pool=TK.lightPool(4.2,'rgba(255,214,150,1)'); pool.position.set(fe-1.1,0.03,z); g.add(pool); pools.push(pool); }
    /* 街道道具（ART-L118-LANE-1020，使用者 10-20「118 巷很寬、很空，像大馬路」；LAWWW2-C tools/blender/env_second/lane118_props.py，配置 src/data/lane118_props.js）：
       店門口的盆栽、保麗龍箱、回收桶、菜單板、靠牆的腳踏車、電線桿、頭上的電線（bldg.lane118_props；沒載入時是灰色方塊，不是看不見的牆）；
       機車：巷口、巷底的機車格垂直停，中間那一段靠路邊順著停（店門口、紅線不停），和公館同一套（bldg.wz_scooter，套件機車是載入前、載入失敗的備用）；
       晚上店門口的光灑到人行道（TK.lightPool，跟著 zoneTime 亮） */
    const LP=typeof LANE118_PROPS!=='undefined'?LANE118_PROPS:null, propFB=new THREE.Group(); propFB.name='l118_props_fallback'; propFB.userData.dyn=true;
    const scGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.wz_scooter'], scG=new THREE.Group(), scList=[]; scG.userData.dyn=true; scG.name='l118_kit_scooters';
    if(LP){ const fbM=M('#9a958c');
      for(const [x,z,w,d] of LP.blocks){ nav.blockRect(x,z,w,d,0); const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.2,w-0.1),0.7,Math.max(0.2,d-0.1)),fbM); m.position.set(x,0.35,z); propFB.add(m); }
      for(const [x,z,r] of LP.circles){ nav.blockCircle(x,z,r); const m=new THREE.Mesh(new THREE.CylinderGeometry(Math.max(0.12,r-0.08),Math.max(0.12,r-0.08),0.7,10),fbM); m.position.set(x,0.35,z); propFB.add(m); }
      g.add(propFB);
      for(const [x,z,w,d] of LP.scooter_blocks) nav.blockRect(x,z,w,d,0);
      const scC=['#e8e8e8','#2b2b2b','#8c3b47','#3a6fb0','#c9b48a','#f2f0ea','#5a5a7a'];
      LP.scooters.forEach(([x,z,ry,grp],i)=>{ const c=scC[(i*5+3)%7], s=TK.scooter(c); s.position.set(x,0,z); s.rotation.y=ry; s.userData.l118Scooter=grp; if(scGLB){ scG.add(s); scList.push({o:s,color:c,grp}); } else g.add(s); });
      if(scGLB) g.add(scG);
      for(const [x,z,r] of LP.pools){ const pl=TK.lightPool(r,'rgba(255,206,140,1)'); pl.position.set(x,0.031,z); pl.userData.poolMax=0.62; g.add(pl); pools.push(pl); } }
    const zoneTime=(h,E)=>{ let k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); k=Math.max(0,Math.min(1,k)); TK.setNight(k); if(E&&E.hemi) E.hemi.intensity+=0.7*k; for(const p of pools) if(p.material) p.material.opacity=(p.userData.poolMax||0.55)*k; };
    const zone={group:g,nav,spawn:L?{x:L.backGate.spawn.x,z:L.backGate.spawn.z,yaw:L.backGate.spawn.yaw}:{x:0,z:31,yaw:Math.PI},lamps:[],buildings:fb,applyTimeOutdoor:zoneTime,onLamps(on){}};
    if(scGLB&&scList.length){ P3.mergeStatic(scG); ASSETS.loadOne('bldg.wz_scooter').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const n=attachWzScooters(g,scG,scList,c.scene,'l118_scooters_glb',9); if(!n) console.warn('機車正式模型沒有 scooter_*，用套件的機車'); }).catch(e=>console.warn('機車正式模型載入失敗，用套件的機車',e)); }
    if(LP&&typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.lane118_props']) ASSETS.loadOne('bldg.lane118_props').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true); r.name='lane118_props_glb';
      r.traverse(o=>{ if(!o.isMesh) return; o.receiveShadow=true; o.castShadow=false; o.userData.dyn=true; });   /* 道具、電線桿、電線都不投影（LAWWW-C 10-20：118 巷本來就 55～60 萬三角形，X69 卡；電線的細影子在地上會閃）*/
      g.add(r); propFB.visible=false; zone.l118Props=true; }).catch(e=>console.warn('118 巷街道道具正式模型載入失敗，用方塊',e));
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.lane118_ground']) ASSETS.loadOne('bldg.lane118_ground').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true);
      r.traverse(o=>{ if(!o.isMesh) return; const mt=o.material, nm=(mt&&mt.name)||''; o.receiveShadow=true; o.castShadow=/gate|booth|bark|trunk|leaf|tree|far_hall/.test(nm);
        if(/^l118_road_/.test(nm)&&mt.map){ mt.map.userData.asphalt=true; mt.map.anisotropy=Math.min(8,E.renderer.capabilities.getMaxAnisotropy()); mt.map.needsUpdate=true; if(E.roadMats&&E.roadMats.indexOf(mt)<0) E.roadMats.push(mt); }   /* 柏油：入夜調暗（和溫州街的正式路面一樣）*/
        if(/^GLOW_l118/.test(nm)&&!mt.userData.l118n){ mt.userData.l118n=true; mt.emissive=new THREE.Color(0xffe2a8); TK.addNight(mt,1.8,0.05); }   /* 門柱上的燈籠：晚上亮 */
        if(/leaf/.test(nm)){ mt.alphaTest=Math.max(mt.alphaTest||0,0.5); mt.side=THREE.DoubleSide; } });
      g.add(r); for(const o of tmpGround) o.visible=false; }).catch(e=>console.warn('118 巷地面正式模型載入失敗，用套件暫代',e));
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.lane118_street']) ASSETS.loadOne('bldg.lane118_street').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'l118','lane118_street_glb'); }).catch(e=>console.warn('118 巷正式模型載入失敗，用方塊立面',e));
    return zone; }
  const lane118={ id:'lane118', name:'118 巷', indoor:false, cityLight:0.85, size:[28,100], camDist:5.2, build(E){ return buildLane118(E); } };
  const ZONES={campus,gongguan,wenzhou,lane118,classroom,library,cafe,cvs,noodle,bookstore,dorm,wz_brunch,wz_print,wz_teahouse,wz_lin,wz_teishoku};   /* wancai：src/wancai3d.js；linze：src/building3d.js；wz_*：溫州街三家新店（WZ_SHOPS_LAYOUT）*/   /* wancai：src/wancai3d.js；linze：src/building3d.js */
  /* 換區域不卡（PERF-ZONE-ENTER-1018，使用者 X14「電腦換畫面卡一兩秒（溫州街、咖啡廳）」，LAWWW2 2026-10-21）：GAME.enter 在畫面全黑、淡入之前呼叫。
     原本：區域建好、第一格畫完，已經載過的正式模型才接上（ASSETS.loadOne().then 是 microtask，在 await fade(false) 才跑）；
     淡入那幾格才編新材質的 shader、把貼圖傳上 GPU——淡入看到的畫面停住一兩秒。
     現在：先等一個 macrotask 讓已載過的正式模型接上；再用 compileAsync 編整個場景的材質（有 KHR_parallel_shader_compile 時不卡主執行緒、多個 shader 同時編）；
     最後把場景裡的貼圖傳上 GPU，每傳約 400 萬像素讓出一次主執行緒。最多等 cap 毫秒，超過就照原本的方式（剩下的第一格做）。E.lastPrewarm 記每一段的時間（測試、量測用）。
     只做看得到的物件（traverseVisible）：被正式模型取代、藏起來的套件備用模型不編、不傳（省時間也省 GPU 記憶體；晚上才出現的東西照舊在出現那一格做）。
     compileAsync 本身會走到藏起來的物件：先把它們的 material 暫時拿掉，編完馬上放回去——溫州街有三個藏起來的套件零件 material 是 TK 的 paint 描述（不是 THREE.Material），編下去會丟例外。
     等的時候主迴圈照樣每一格 E.render：畫面是黑的，先不畫（E.renderSkip 暫時回 true，做完還原），不然那一格會停下來等還沒編好的 shader，平行編譯就白做了。
     只在電腦上做（使用者回報的是電腦；ASSETS.texCap 是空的＝不是手機）。*/
  async function prewarm(E,opts){ opts=opts||{}; const R=E.renderer; if(!R||!R.compileAsync||!E.scene||!E.camera) return null;
    const q=(typeof location!=='undefined'&&location.search)||''; if(/[?&]noprewarm\b/.test(q)||(typeof ASSETS!=='undefined'&&ASSETS.texCap&&!/[?&]prewarm\b/.test(q))) return null;   /* 只在電腦上做（同 prefetchNext）：手機照原本的做法——SwiftShader 手機模擬量到一次黑畫面拉長到 13.6 秒（淡入的計時器被很長的格子擠到後面）；沒有真機數字以前手機不動。?prewarm 手機模擬也做（量測用）、?noprewarm 關掉 */
    const qc=+((q.match(/[?&]prewarmcap=(\d+)/)||[])[1]||0); if(qc) opts=Object.assign({},opts,{cap:qc});   /* 量測用：?prewarmcap=毫秒 改黑畫面最多等多久 */
    const skip0=E.renderSkip; E.renderSkip=()=>true; try{ return await prewarmRun(E,R,opts); } finally{ E.renderSkip=skip0; } }
  async function prewarmRun(E,R,opts){
    const t0=performance.now(), cap=opts.cap||2000, left=()=>cap-(performance.now()-t0), tick=()=>new Promise(r=>setTimeout(r,0));
    const out={ms:0,attachMs:0,compileMs:0,texMs:0,textures:0,mpix:0,skipped:0,timedOut:false};
    await tick(); out.attachMs=performance.now()-t0;
    const shown=new Set(); E.scene.traverseVisible(o=>{ if(o.material) shown.add(o); });
    const isMat=m=>Array.isArray(m)?m.every(x=>x&&x.isMaterial):!!(m&&m.isMaterial), off=[];
    const tc=performance.now(); let job;
    try{ E.scene.traverse(o=>{ if(o.material&&(!shown.has(o)||!isMat(o.material))){ off.push([o,o.material]); o.material=null; } }); job=R.compileAsync(E.scene,E.camera); }
    catch(e){ console.warn('prewarm compile',e); job=Promise.resolve(); }
    finally{ for(const [o,m] of off) o.material=m; }
    out.skipped=off.length; let to=null; const ok=await Promise.race([job.then(()=>true,()=>true),new Promise(r=>{ to=setTimeout(()=>r(false),Math.max(0,left())); })]); clearTimeout(to);
    out.compileMs=performance.now()-tc; if(!ok) out.timedOut=true;
    /* 編譯結果先讀一次（X14，LAWWW2-C 2026-10-27）：沒有平行編譯時 isReady() 一律是 true，compileAsync 馬上就好，真正的等待留到淡入第一格（three.js 第一次畫到時讀編譯結果：onFirstUse）——
       SwiftShader 電腦模式量到公館→溫州街第一次淡入那一格 10.3 秒，其中 3.9 秒在等編譯結果。黑畫面時在 cap 之內先讀（program.getUniforms）；讀不完的照舊第一格讀 */
    const tsl=performance.now(); for(const pg of ((R.info&&R.info.programs)||[])){ if(left()<=0){ out.timedOut=true; break; } if(pg.isReady&&!pg.isReady()) continue; try{ pg.getUniforms(); out.settled=(out.settled|0)+1; }catch(e){ console.warn('prewarm settle',e); } }
    out.settleMs=performance.now()-tsl;
    const texs=new Set(), add=v=>{ if(v&&v.isTexture&&!v.isRenderTargetTexture) texs.add(v); };
    for(const o of shown){ if(!o.parent||!isMat(o.material)) continue; const ms=Array.isArray(o.material)?o.material:[o.material]; for(const m of ms){ for(const k in m) add(m[k]); if(m.uniforms) for(const k in m.uniforms){ const u=m.uniforms[k]; if(u) add(u.value); } } }
    const tt=performance.now(); let batch=0;
    for(const t of texs){ if(left()<=0){ out.timedOut=true; break; } const im=t.image, px=im&&im.width&&im.height?im.width*im.height:0; R.initTexture(t); out.textures++; out.mpix+=px/1e6; batch+=px; if(batch>=(opts.batchPx||4e6)){ batch=0; await tick(); } }
    out.texMs=performance.now()-tt; out.ms=performance.now()-t0; E.lastPrewarm=out; prefetchNext(E); return out; }
  /* 下一個區域的建築模型先在背景載好（PERF-ZONE-ENTER-1018）：第一次進溫州街、咖啡廳時，正式模型淡入以後才一個一個到，每到一個畫面就停一下
     （80af0168 量測：公館→溫州街第一次，模型 5～13 秒才到齊）。prewarm 做完 4 秒後，照 NEXT 把下一個區域的模型一個一個 ASSETS.loadOne
     （一次一個、中間空 1.5 秒；已經載過的跳過；換了區域就停）。下次進去時模型已經在快取裡，prewarm 在黑畫面就接上、編好。
     只在電腦上做（ASSETS.texCap 是空的＝不是手機；手機記憶體少，照舊進去才載）；網址 ?noprefetch 關掉，?prefetch 在手機模擬也做（量測用）。*/
  const ZONE_GLBS={ wenzhou:['bldg.wenzhou_street','bldg.wz_park','bldg.wz_props','bldg.wz_jphouse','bldg.cafe_exterior','bldg.wz_scooter'], cafe:['bldg.cafe_interior'] };
  const NEXT={ gongguan:['wenzhou'], wenzhou:['cafe'], cafe:['wenzhou'] };
  let prefetchGen=0;
  function prefetchNext(E,opts){ opts=opts||{}; const q=(typeof location!=='undefined'&&location.search)||'';
    if(/[?&]noprefetch\b/.test(q)||typeof ASSETS==='undefined'||!ASSETS.loadOne||(ASSETS.texCap&&!/[?&]prefetch\b/.test(q))) return null;
    const zone=E.zone, zid=zone&&zone.def&&zone.def.id, keys=[].concat(...(NEXT[zid]||[]).map(z=>ZONE_GLBS[z]||[])).filter(k=>ASSETS.manifest[k]&&!ASSETS.has(k));
    const gen=++prefetchGen; if(!keys.length) return null; const out={zone:zid,keys:keys.slice(),done:[]}; E.lastPrefetch=out;
    const gap=opts.gap!=null?opts.gap:1500, step=i=>{ if(gen!==prefetchGen||E.zone!==zone||i>=keys.length) return; const k=keys[i]; if(ASSETS.has(k)) return step(i+1);
      ASSETS.loadOne(k).then(()=>{ out.done.push(k); },()=>{}).then(()=>setTimeout(()=>step(i+1),gap)); };
    setTimeout(()=>step(0),opts.delay!=null?opts.delay:4000); return out; }
  /* 走起來不卡（X79 PERF-CAMPUS-DAY-1027，使用者「校園白天走起來還是會卡」，LAWWW2-C 2026-10-27）：GAME.enter 淡入以後呼叫。
     量測（tools/shots/x79_walk.py，SwiftShader 手機模擬，校門 → 椰林大道 → 總圖 → 社科院 → 霖澤館）：第一次走，路上 13 次「這一格編新的 shader」，每次停 0.5～2.2 秒——
     還沒進過畫面的建築材質（社科院門廊、屋頂…）、路人的遠距離版本（第一個人走到 18 m 外）、陰影的深度 shader（新的投影子物件走進陰影範圍）；同一條路第二次走 0 次。
     three.js 第一次畫到才編；prewarm 只在電腦、只在剛進區域、只編那時候已經接上的，之後才接上的正式模型、藏著的遠距離版本、陰影那一輪都沒編。
     現在：淡入以後每 0.25 秒做一小批——①看得到（visible，不管在不在畫面裡）而沒編過的材質：R.compile(物件, 鏡頭, E.scene)，燈光、霧照區域的，所以編出來的就是畫的時候要用的；
     路人的遠距離版本（npc_far，藏著）也編；還沒放進場景的路人底模（ASSETS 快取裡的 VRM 樣板）和遠距離版本的 toon 材質也編——等一下才生出來的人第一格不用停
     （量測：只編場景裡的，起點附近新生出來的路人臉、頭髮、第一個走到 18 m 外的人，還是各停 1.5～2 秒）。
     ②場景裡沒有沒編過的、連續幾次都沒有新的（正式模型都接上了）以後，陰影相機暫時放大到整個區域畫一格，陰影的深度 shader 一次編完（那一格陰影比較糊）。
     ③做完以後每 3 秒再看一次有沒有新的（之後才載完的路人底模、正式模型），有就照樣一小批一小批編；換區域就停。
     ④編好的 shader 主動「讀一次」（program.getUniforms＝three.js 第一次畫到時做的 onFirstUse：讀編譯結果、uniform 位置）：只送出編譯還不夠，
     GPU 真的編完、第一次讀結果時照樣要等（第二版量測：路上 0 個新 shader，起點附近還是有 4 格 1～2.5 秒全花在 getProgramInfoLog）。
     沒有平行編譯一批讀 1 個（那一批不再送新的）；有平行編譯只讀已經好的（isReady），不會等。
     有平行編譯（KHR_parallel_shader_compile）一批最多 8 個新的 shader、不卡主執行緒；沒有的（不保證）一批 1 個，停頓分散在剛進來的那幾秒，不在走路的時候。
     電腦另外把這些物件的貼圖先傳上 GPU（每批約 400 萬像素）；手機貼圖照舊第一次畫到才傳（記憶體）。網址 ?nowarmup 關掉（比較用）。E.lastWarmup 記結果（測試、量測用）。*/
  let warmGen=0;
  function warmup(E,opts){ opts=opts||{}; const R=E.renderer, q=(typeof location!=='undefined'&&location.search)||'';
    if(!R||!R.compile||!R.properties||!E.scene||!E.camera||/[?&]nowarmup\b/.test(q)) return null;
    const zone=E.zone, gen=++warmGen, mobile=typeof ASSETS!=='undefined'&&!!ASSETS.texCap, par=!!(R.extensions&&R.extensions.get&&R.extensions.get('KHR_parallel_shader_compile'));
    const out={zone:zone&&zone.def&&zone.def.id,objects:0,programs:0,textures:0,mpix:0,depth:false,depthPrograms:0,ticks:0,parallel:par,done:false,ms:0}; E.lastWarmup=out;
    const t0=performance.now(), gap=opts.gap||250, budget=opts.budget||12, maxProg=opts.maxProg||(par?8:1), idleScans=opts.idleScans||8;
    const nprog=()=>(R.info.programs||[]).length, mats=o=>Array.isArray(o.material)?o.material:[o.material], isMat=m=>!!(m&&m.isMaterial);
    const tried=new WeakSet(), need=m=>!tried.has(m)&&!R.properties.get(m).currentProgram, shown=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };   /* tried：試過的材質不再排（編不起來的不會一直重排）*/
    let queue=[], idle=0; const loose=new WeakSet(), settled=new WeakSet();
    const settle=()=>{ let n=0; for(const pg of (R.info.programs||[])){ if(settled.has(pg)) continue; if(par&&pg.isReady&&!pg.isReady()) continue;
        try{ pg.getUniforms(); }catch(e){ console.warn('warmup settle',e); } settled.add(pg); n++; if(n>=maxProg) break; } out.settled=(out.settled|0)+n; return n; };
    const unsettled=()=>(R.info.programs||[]).some(pg=>!settled.has(pg));   /* 不在場景裡的（路人底模、遠距離版本）：沒有 parent 也要編 */
    const scan=()=>{ queue=[]; E.scene.traverse(o=>{ if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite)||!o.material) return; const ms=mats(o); if(!ms.every(isMat)||!ms.some(need)) return;
      if(o.name==='npc_far'?!shown(o.parent):!shown(o)) return; let lit=false; o.traverse(c=>{ if(c.isLight) lit=true; }); if(!lit) queue.push(o); }); queue.push(...extras()); };   /* 子樹裡有燈的不編：compile 會把那盞燈多算一次，編出來的 key 對不上 */
    const extras=()=>{ const out_=[], A=typeof ASSETS!=='undefined'&&ASSETS.cache; if(!A) return out_;
      for(const k in A){ const c=A[k]; if(!c||!c.tpl||!c.tpl.vrm) continue; const sc=c.tpl.vrm.scene;
        if(sc&&!sc.parent) sc.traverse(o=>{ if((o.isMesh||o.isSkinnedMesh)&&o.material&&shown(o)&&mats(o).every(isMat)&&mats(o).some(need)) out_.push(o); });   /* 路人底模（不在場景裡）：骨架 clone 共用幾何、材質 */
        const L=c.lod; if(L&&L.parts) for(const p of L.parts) if(p.toon&&p.geo&&need(p.toon)){ const sm=new THREE.SkinnedMesh(p.geo,p.toon); loose.add(sm); out_.push(sm); } }   /* 遠距離版本的 toon：和遊戲裡一樣是 SkinnedMesh、不收影子 */
      return out_; };
    const texs=o=>{ const out_=[], add=v=>{ if(v&&v.isTexture&&!v.isRenderTargetTexture&&!R.properties.get(v).__webglTexture&&!out_.includes(v)) out_.push(v); };
      for(const m of mats(o)){ for(const k in m) add(m[k]); if(m.uniforms) for(const k in m.uniforms){ const u=m.uniforms[k]; if(u) add(u.value); } } return out_; };   /* VRM 的 MToon 貼圖放在 uniforms */
    const depthOnce=()=>{ out.depth=true; const c=E.sun.shadow.camera, keep=[c.left,c.right,c.top,c.bottom,c.near,c.far], sz=(zone&&zone.def&&zone.def.size)||[200,200], h=Math.hypot(sz[0],sz[1])+20, p0=nprog(), td=performance.now();
      c.left=-h; c.right=h; c.top=h; c.bottom=-h; c.near=-2*h; c.far=2*h; c.updateProjectionMatrix(); R.shadowMap.needsUpdate=true;
      try{ E.render(); } catch(e){ console.warn('warmup depth',e); } finally { [c.left,c.right,c.top,c.bottom,c.near,c.far]=keep; c.updateProjectionMatrix(); R.shadowMap.needsUpdate=true; }
      out.depthPrograms=nprog()-p0; out.depthMs=Math.round(performance.now()-td); };
    const step=()=>{ if(gen!==warmGen||E.zone!==zone) return; out.ticks++; const ts=performance.now();
      if(settle()&&!par){ setTimeout(step,gap); return; }   /* 這一批已經等過一個 */
      if(!queue.length&&unsettled()){ setTimeout(step,gap); return; }   /* 有平行編譯：等還沒好的 */
      if(!queue.length){ scan(); if(queue.length) idle=0; else if(++idle>=idleScans){ if(!out.depth&&R.shadowMap.enabled&&E.sun&&E.sun.castShadow){ depthOnce(); idle=0; } else { if(!out.done){ out.done=true; out.ms=Math.round(performance.now()-t0); } idle=0; setTimeout(step,opts.watch||3000); return; } } }
      const p0=nprog(); let px=0;
      while(queue.length&&performance.now()-ts<budget&&nprog()-p0<maxProg){ const o=queue.shift(); if((!o.parent&&!loose.has(o))||!mats(o).some(need)) continue;
        try{ R.compile(o,E.camera,E.scene); out.objects++; } catch(e){ console.warn('warmup compile',e); } for(const m of mats(o)) tried.add(m);
        if(!mobile) for(const t of texs(o)){ if(px>=4e6) break; const im=t.image; try{ R.initTexture(t); out.textures++; const a=im&&im.width&&im.height?im.width*im.height:0; px+=a; out.mpix+=a/1e6; } catch(e){} } }
      const d=nprog()-p0; out.programs+=d; if(out.done) out.later=(out.later|0)+d; setTimeout(step,gap); };   /* later＝做完以後才看到、才編的（之後才載完的路人底模…）*/
    setTimeout(step,opts.delay!=null?opts.delay:1000); return out; }
  return {ZONES,room,desk,chair,glowTex,attachRoomGLB,roomLightmap,roomDarkMap,seatFold,roomBackdrop,attachDormInterior,glowBatch:wzGlowBatch,wzParkSeason,wzCatModel,v0BoxFromFlags,fairDayKey,fairExpoFront,isExpoDay,EXPO_DAYS,pothosSize,prewarm,prefetchNext,warmup,PROP_BLOCKS:{wenzhou:WZ_PROP_BLOCKS,gongguan:GG_PROP_BLOCKS},propBlocks};   /* attachRoomGLB：社科院圖書館（src/soclib3d.js）也用這個接法 ；attachDormInterior：宿舍 205（rooms_glb3d.js 的 dorm_interior，和祐廷的房間同一型）；roomLightmap：霖澤館大廳（src/building3d.js 的 attachFormal）也用 */
})();

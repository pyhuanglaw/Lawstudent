/* ===== 世界區域定義：台大核心校園（法學院→校園道路→椰林大道→校門）、公館、溫州街、室內 ===== */
'use strict';
const Z3 = (function(){
  /* 總圖 B1 的獨立入口（LIB-B1-OUTSIDE-1110，使用者 11-10 X298「總圖地下室入口應該是獨立 總圖建築物外面左邊有個下樓到一個小中庭到地下一樓 露天的 有B1入口 不是從一樓過去」→ 選擇題「北側」）：
     總圖北牆（z −30）外面的露天下沉中庭。x0..x1、z0..z1＝中庭（地面在這裡開洞）；dep＝深度；樓梯在北邊（z st0..st1），x0（地面）往東下到 stx（中庭地面）；
     door＝南牆（靠總圖）B1 的門；spawn＝從 B1 走出來站的位置（面向北）。library_b1_3d.js（B1 的出口）、guide3d.js、classes3d.js 讀這一份 */
  const B1C={x0:92,x1:104,z0:-41,z1:-31,dep:4.2,st0:-41,st1:-39,stx:99.2,tread:0.3,door:{x:98,z:-31,w:1.6,h:2.4},spawn:{x:98,z:-32.8,lv:0,yaw:Math.PI}};
  /* BIKE-PARK-1104（AA_646 第 3 節，LAWWW2 11-04）：各建築出口、區域入口附近新加的腳踏車停車架 [x,z,ry]（W3.bikeRack(7)，導航阻擋 4.6×1.6）。
     位置是用 Node 掃出來的：靠牆或靠台階、站得住、不在台階平台上、不切斷走道（擋掉的格子 ≤ 架子本身）、架子兩端停得下車；ry 讓車頭朝牆。
     bike3d.js 的 PARKS 讀同一份（合法停車處）；xinsheng3d.js 讀 xinsheng。改位置要跑 tests/bike_park_1104_unit.js。*/
  const BIKE_RACKS={
    campus:[[-45,-72.1,Math.PI],[-45,-44.9,0],[66.5,59.5,0],[15.5,-66.4,0],[61.5,9,0],[61.5,-9,Math.PI],[23,-99.2,Math.PI],[94.21,-77.01,2.304],
            [-121.5,-10,-Math.PI/2],[-121.5,10,-Math.PI/2],[-94.6,-131,Math.PI/2],[-68,-123.0,0],[89.5,-35,Math.PI/2]],   /* BIKE-PARK-B1-1110（LAWWW2 帳號 A 11-10；GHA bike_park_1104 ①：從總圖 B1 中庭出來 (98,−32.8) 最近的停車處 28.5 m）：下沉中庭西邊、樓梯口南邊的空地，架子沿 z（離 B1 出口 8.8 m；腳踏車不會牽下樓梯）*/   /* XS-GATE-NORTH-1105：新生南路側門內小廣場（原本西牆舊側門那一座 (−113.5,−82.5) 搬過來）、體育館門前（原本的 (66.5,59.5) 照舊留著）*/   // 博雅、普通、體育館、社科院圖書館、總圖（大道兩側）、霖澤館、萬才館（照萬才館轉 42°）、校門內兩側、新生南路側門（往 118 巷的後門那裡是 2.5 m 的窄通道，不放架子：bike3d.js 的 spots 停一台）
    gongguan:[[0,-42,Math.PI]],   // 校門外（從校園走到公館的地方）
    xinsheng:[[15.5,18.5,Math.PI/2],[15.5,1.5,Math.PI/2],   /* 側門兩邊：XS-GATE-FORMAL-1110（BB_255 P3「側門正面右邊那台腳踏車疊進花台」）原本 x 17，架子 x 16.18～17.82 疊進花台（x 16.45～18.15，xs_planters）——兩台都疊到；往人行道移 1.5 m（只移 0.5 m 還疊 0.87 m）*/
               [-8.6,15,Math.PI/2],[-8.6,-8,Math.PI/2],[-8.6,37,Math.PI/2],[-8.6,-22,Math.PI/2]] };   // 側門兩邊（圍牆前）、店面那一側的路邊
  /* 校園西北角（XS-GATE-NORTH-1105，LAWWW2-C 11-05；使用者 09:0x「新月台…要很靠新生南路那門 就不要往左邊開了 直接往上面開 跟公館不同側／新月台也貼著上方的最左邊」、
     09:1x「好」（北牆外西段叫新生南路、辛亥路從東邊一點才開始；118 巷後門照舊在東邊）、09:2x「體育館實際上是在新生南路辛亥路交接口 遊戲中就改到新月台法學院中間」）：
     新生南路側門開在北側圍牆（z −141）、靠西北角，往北出去；望月台（真實的新月台：側門旁兩層樓，紀念品店＋咖啡）在西北角貼北牆；新南停車場在望月台南邊；
     體育館在望月台東邊、貼北牆，門朝南；新生南路／辛亥路的路口在體育館東邊 x XSG.xh。都是 [x0, z0, x1, z1]（x0<x1、z0<z1）。
     之前（XS-GATE-MOVE-1105）門在 x −66 往西開，還是和公館同一側。改這裡要跑 tests/xs_gate_north_unit.js、tests/xinsheng_unit.js、tests/bike_park_1104_unit.js */
  const XSG={x:-101.4,z:-141,gw:5.2,
    moon:[-123.2,-140.4,-106.4,-127.2],        // 望月台本體（兩層）
    plaza:[-105.8,-140.2,-93,-122.4],          // 側門內的小廣場（望月台正門朝東對著它；南邊接停車場）
    park:[-123.2,-122.6,-103,-104],            // 新南停車場（汽車、機車）
    path:[-99.4,-124.6,-95.4,-96.2],           // 小廣場往南的步道
    pathE:[-99.4,-100.2,-61.5,-96.2],          // 接映月湖和博思中間那條步道
    gym:[-90,-140.4,-60,-126.4],               // 體育館本體（門在南面中間）
    gymPlaza:[-93,-126,-59.5,-121.5],          // 體育館門前（西接小廣場、東接映月湖西岸的步道）
    xh:-56};                                   // 新生南路／辛亥路路口（北牆外馬路的中心線 x）
  const xsIn=(x,z,m)=>{ m=m||0; for(const k of ['moon','plaza','park','path','pathE','gym','gymPlaza']){ const r=XSG[k]; if(x>=r[0]-m&&x<=r[2]+m&&z>=r[1]-m&&z<=r[3]+m) return true; } return false; };
  function xsGateNav(nav){   /* 西北角原本整塊是走不到的樹林（z −124 以北又在 blockOutside 外）：開出小廣場、步道、停車場、體育館門前；望月台、體育館本體由 ckPlace 擋 */
    for(const k of ['plaza','path','pathE','park','gymPlaza']){ const r=XSG[k]; nav.freeRect(r[0],r[1],r[2],r[3]); }
    for(const k of ['moon','gym']){ const r=XSG[k]; nav.blockRect((r[0]+r[2])/2,(r[1]+r[3])/2,r[2]-r[0],r[3]-r[1],0,0.3); }
    for(const [x,z,ry] of BIKE_RACKS.campus) if(xsIn(x,z,1)) nav.blockRect(x,z,4.6,1.6,-ry);   /* 開出來的地方裡的停車架再擋一次（架子先放、這裡後開）*/
    for(const c of XSG.cars||[]) nav.blockRect(c.x,c.z,2.0,4.8,0,0.1);
    if(XSG.moto) nav.blockRect(XSG.moto[0],XSG.moto[1],XSG.moto[2],XSG.moto[3],0,0.1);
    nav._cm=null; }
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.95},o||{}));
  const texMat=(t,rep,o)=>{ const m=new THREE.MeshStandardMaterial(Object.assign({map:t,roughness:0.95,metalness:0},o||{})); return m; };
  /* ART-LIB-FRONT-PAVING-1103（使用者 11-03「總圖前椰影大道地磚是怎樣」）：校園的路面、人行道、廣場改用照片做的 PBR 貼圖（Poly Haven CC0：granite_tile 調成淺米色石磚、asphalt_02 取沒有裂縫的那一塊、
     去掉大面積的深淺＝不像污漬、調成 D30 的淺灰；tools/blender/env_second/textures/campus_paving_tex.py 重產），取代 Canvas 亂點的 W3.stoneTex／pathTex 和畫了污漬的 avenueRoadTex（D38 第 1 點）。
     貼圖：assets/textures/campus/*.webp。法線貼圖記在 PHOTO_NOR（Texture.clone 會把 userData 轉成 JSON，物件放不進去）。載入失敗時照舊用 Canvas 的（同一個材質，載到才換圖）*/
  const PHOTO={}, PHOTO_INFO=new WeakMap();   /* base 貼圖 → {nor:法線 base, clones:[…], ready} */
  function photoTex(name,o){ o=o||{}; if(PHOTO[name]) return PHOTO[name]; const fb=o.fallback;
    const t=new THREE.Texture(fb&&fb.image); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; t.needsUpdate=!!(fb&&fb.image); if(o.asphalt) t.userData.asphalt=true;   /* 自己的 Source：換圖不影響其他區域的 Canvas 貼圖 */
    const info={nor:null,clones:[],norClones:[]}; PHOTO_INFO.set(t,info);
    const load=(file,tex,list,cs)=>{ try{ new THREE.TextureLoader().load('assets/textures/campus/'+file,im=>{ tex.image=im.image; if(cs) tex.colorSpace=cs; tex.needsUpdate=true; for(const c of list){ c.needsUpdate=true; } },undefined,()=>{}); }catch(e){} };
    load(name+'_diff.webp',t,info.clones,THREE.SRGBColorSpace);
    if(o.nor){ const n=new THREE.Texture(); n.wrapS=n.wrapT=THREE.RepeatWrapping; info.nor=n; load(name+'_nor.webp',n,info.norClones,null); }
    PHOTO[name]=t; return t; }
  const pavingTex=()=>photoTex('paving_light',{nor:true,fallback:W3.pathTex()});   /* 淺米色石磚：一張貼圖 5×5 塊，每塊約 0.6 m＝一張 3 m */
  const asphaltPhotoTex=()=>photoTex('asphalt_light',{asphalt:true,fallback:W3.asphaltTex()});
  function photoNor(tex,t,m){ const info=PHOTO_INFO.get(tex); if(!info) return; info.clones.push(t); if(!info.nor) return; const c=info.nor.clone(); c.repeat.copy(t.repeat); info.norClones.push(c);
    if(info.nor.image) c.needsUpdate=true; m.material.normalMap=c; m.material.normalScale=new THREE.Vector2(0.6,0.6); m.material.roughness=0.88; m.material.needsUpdate=true; }
  /* 一大片地面、中間開洞（B1C：總圖北邊的下沉中庭）：ShapeGeometry 的 UV 是公尺，tile＝一張貼圖幾公尺。轉 −90° 以後 shape 的 y＝世界的 −z */
  function groundHoles(g,w,d,tex,tile,holes){ const sh=new THREE.Shape(); sh.moveTo(-w/2,-d/2); sh.lineTo(w/2,-d/2); sh.lineTo(w/2,d/2); sh.lineTo(-w/2,d/2); sh.lineTo(-w/2,-d/2);
    for(const [x0,z0,x1,z1] of holes){ const hp=new THREE.Path(); hp.moveTo(x0,-z1); hp.lineTo(x0,-z0); hp.lineTo(x1,-z0); hp.lineTo(x1,-z1); hp.lineTo(x0,-z1); sh.holes.push(hp); }
    const t=tex.clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1/tile,1/tile); const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),texMat(t)); m.rotation.x=-Math.PI/2; m.receiveShadow=true; photoNor(tex,t,m); g.add(m); return m; }
  function ground(g,w,d,tex,rep,x,z,y){ const t=tex.clone(); t.needsUpdate=true; t.repeat.set(rep[0],rep[1]); const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),texMat(t)); m.rotation.x=-Math.PI/2; m.position.set(x||0,y||0,z||0); m.receiveShadow=true; photoNor(tex,t,m); g.add(m); return m; }
  /* 步道、路面（strip）都在 0.02 m：交叉的地方兩片疊在同一個高度，畫面一直閃（2026-10-14 使用者回報「男一舍前面的地板一直閃爍」：男一舍的步道和東西向的柏油路在 (20,47) 交叉；校園共 11 處）。
     交叉的路面分層（polygonOffset，層數只在真的重疊時加，通常 0～2 層）：柏油路在步道上面，其他照建立的先後（後蓋的在上面）。高度不變（導航、點地面、腳步都不受影響）*/
  const stripOf=new WeakMap();
  function stripLayer(m,L){ m.userData.stripLayer=L; const mt=m.material; if(L>0){ mt.polygonOffset=true; mt.polygonOffsetFactor=-L; mt.polygonOffsetUnits=-2*L; } else { mt.polygonOffset=false; mt.polygonOffsetFactor=0; mt.polygonOffsetUnits=0; } mt.needsUpdate=true; }
  function strip(g,x0,z0,x1,z1,w,tex,rep){ const dx=x1-x0, dz=z1-z0; const len=Math.hypot(dx,dz); const t=tex.clone(); t.needsUpdate=true; t.repeat.set(w/rep,len/rep); const m=new THREE.Mesh(new THREE.PlaneGeometry(w,len),texMat(t)); m.rotation.x=-Math.PI/2; m.rotation.z=-Math.atan2(dx,dz); m.position.set((x0+x1)/2,0.02,(z0+z1)/2); m.receiveShadow=true; photoNor(tex,t,m); g.add(m);
    const ux=dx/(len||1), uz=dz/(len||1), hx=Math.abs(uz)*w/2, hz=Math.abs(ux)*w/2; const box={x0:Math.min(x0,x1)-hx,x1:Math.max(x0,x1)+hx,z0:Math.min(z0,z1)-hz,z1:Math.max(z0,z1)+hz,road:!!(t.userData&&t.userData.asphalt),m,o:{cx:(x0+x1)/2,cz:(z0+z1)/2,ux,uz,w,len}};
    let list=stripOf.get(g); if(!list){ list=[]; stripOf.set(g,list); } const hit=list.filter(b=>Math.min(b.x1,box.x1)-Math.max(b.x0,box.x0)>0.01&&Math.min(b.z1,box.z1)-Math.max(b.z0,box.z0)>0.01);
    let L=0; for(const b of hit) if(!(b.road&&!box.road)) L=Math.max(L,b.m.userData.stripLayer+1); stripLayer(m,L);
    for(const b of hit) if(b.road&&!box.road&&b.m.userData.stripLayer<=L) stripLayer(b.m,L+1);   /* 步道後蓋、和柏油路重疊：柏油路往上一層 */
    list.push(box); return m; }
  /* 路緣（步道兩側 0.25 × 0.14 m 的石條）。CAMPUS-FLOOR-STRIP-1110（使用者 11-10 截圖「路上有奇怪的地磚」，LAWWW2-B）：以前照整條路放，
     碰到別條步道也不斷開——x 30 南北向和 z −60 東西向兩條 10 m 步道的 T 字路口，兩邊的路緣橫過對方的石磚（浮起來的長條），大道路緣也橫過步道口。
     改成先記下來，等整個校園的步道都鋪好（flushCurbs，campus.build 最後），落在別條步道裡面的那幾段不放；剩下的合成一個網格（10 個 → 1 個 draw call）。 */
  const curbQ=new WeakMap();
  function curb(g,x0,z0,x1,z1,w){ let q=curbQ.get(g); if(!q){ q=[]; curbQ.set(g,q); } q.push([x0,z0,x1,z1,w]); }
  function flushCurbs(g){ const q=curbQ.get(g); if(!q) return null; curbQ.delete(g); const S=(stripOf.get(g)||[]).filter(b=>b.o);
    const inside=(x,z)=>S.some(b=>{ const o=b.o, dx=x-o.cx, dz=z-o.cz, al=dx*o.ux+dz*o.uz, ac=-dx*o.uz+dz*o.ux; return Math.min(o.len/2-Math.abs(al),o.w/2-Math.abs(ac))>0.02; });
    const geos=[];
    for(const [x0,z0,x1,z1,w] of q){ const dx=x1-x0, dz=z1-z0, len=Math.hypot(dx,dz); if(len<1e-6) continue; const ux=dx/len, uz=dz/len, r=w/2+0.12, n=Math.max(1,Math.ceil(len/0.05));
      for(const s of [-1,1]){ const ox=uz*s*r, oz=-ux*s*r; let k0=null;
        const emit=(a,b)=>{ if(b-a<0.3) return; const gg=new THREE.BoxGeometry(0.25,0.14,b-a); const c=(a+b)/2; gg.rotateY(Math.atan2(ux,uz)); gg.translate(x0+ux*c+ox,0.07,z0+uz*c+oz); geos.push(gg); };
        for(let k=0;k<=n;k++){ const t=(k+0.5)*len/n, px=x0+ux*t+ox, pz=z0+uz*t+oz, free=k<n&&![0,-0.11,0.11].some(e=>inside(px+uz*e,pz-ux*e));   /* 路緣整個寬度（0.25 m）都要在步道外面：斜著接進來的小步道也不會壓到一角 */
          if(free&&k0===null) k0=k; else if(!free&&k0!==null){ emit(k0*len/n,k*len/n); k0=null; } } } }
    if(!geos.length) return null; const merged=THREE_JSM.BufferGeometryUtils.mergeGeometries(geos,false); for(const gg of geos) gg.dispose(); if(!merged) return null;
    const m=new THREE.Mesh(merged,M('#d9d3c6')); m.name='campus_curbs'; g.add(m); return m; }
  // ---- 資產層：樹／長椅／小道具（有 GLB 就用 GLB，沒有就 fallback 到 W3 placeholder）----
  let treeIdx=0, leafyCount=0; const TREE=(scale)=>{ treeIdx++; /* 闊葉樹（townkit 葉片卡，和溫州街同一套）；舊的 GLB 方塊葉樹／針葉樹看起來不像台北的樹，只在 TK 不存在時退回 */ if(typeof TK!=='undefined'&&TK.tree) return TK.tree(6.4*(scale||1)); const useLeafy=(treeIdx%2===1)&&leafyCount<14; if(useLeafy) leafyCount++; return ASSETS.get(useLeafy?'tree.leafy':'tree.conifer',{height:6*(scale||1)}); };
  let palmIdx=0; const PALM=(h)=>{ palmIdx++; /* 大王椰子：townkit 程序化（灰白筆直樹幹＋綠色葉鞘＋羽狀葉）；舊 GLB 是彎曲的椰子樹，只在 TK 不存在時退回 */ if(typeof TK!=='undefined'&&TK.royalPalm) return TK.royalPalm((h||9)*1.35,palmIdx); return ASSETS.get('tree.palm',{height:h||9}); };
  /* 正式街景模型門口、騎樓裡的雜物：人貼牆走會穿過去的那幾個，模型接上以後才擋住那幾格（ART-WZ0，LAWWW2 10-21；套件備用模型沒有這些雜物，不能先擋，不然是看不見的牆）。
     [x, z, 寬, 深]＝wenzhou_street.props.json／gongguan_shops.props.json 的腳印（wz_street.py 建模時寫出來）；pad 半格（blockRect 只擋格子中心在範圍裡的）。改了 Blender 的雜物要跟著改，tests/street_props_nav_unit.js 會抓 */
  const WZ_PROP_BLOCKS=[[-1.82,5.02,0.83,0.83],[-21.9,-4.9,0.6,0.46],[22.73,-7.6,1.46,0.44],[29.5,-7.5,0.6,0.44],[-37.2,-3.02,0.8,0.64],[-37.23,-3.5,0.63,0.61],[-36.78,-8.5,0.5,0.66]];   /* A2 公寓門邊盆栽、B1 鐵捲門前紙箱、B5 茶飲騎樓回收桶、冰菓室 A 字立牌、W0 兩個盆栽、日常失速門口的 A 字立牌（WZ-OFFBEAT-1104） */
  const GG_PROP_BLOCKS=[[15.6,19.8,0.34,0.34],[-58.0,21.65,0.34,0.34],[-58.6,21.65,0.34,0.34],[-66.23,21.65,1.46,0.44],[-51.3,21.5,0.64,0.48],[-38.0,21.5,0.64,0.48],[-1.75,21.45,0.64,0.48],[-35.17,21.75,0.75,0.35],[-32.74,21.75,0.83,0.4],[-32.03,21.75,0.53,0.4],[-33.63,21.8,0.89,0.7],[-4.25,21.75,0.3,0.3],[-49.63,21.69,0.7,0.83],[-48.89,21.6,0.65,0.65],[-46.96,21.65,0.65,0.65],[-38.78,21.7,0.85,0.79],[-27.8,21.66,0.53,0.5],[-9.3,21.5,0.64,0.48],[75.7,21.5,0.64,0.48],[9.55,21.88,1.4,0.35],[52.6,21.85,0.8,0.4],[-13.3,21.8,0.7,0.4],[6.06,21.65,0.58,0.56],[51.69,21.67,0.82,0.68],[69.16,21.6,0.61,0.62],[76.95,21.66,0.55,0.58],[47.84,21.55,0.74,0.73],[45.35,21.54,0.74,0.73]];   /* 公館騎樓 14 間店玻璃前的雜物（G06 腳踏車行的車另外擋） */
  function propBlocks(nav,list){ for(const [x,z,w,d] of list) nav.blockRect(x,z,w,d,0,0.25); }
  /* 正式模型載好才擋的雜物（盆栽、立牌…）擋好以後：玩家剛好站在擋到的地方就挪到最近站得住的地方（V7-RELOCATE-1104，BB-C 11-04 18:01：v7 舊存檔讀進公館，
     出生點照「模型還沒載好」的導航格找在 (−8.75, 20.75)；一兩秒後模型載好、頁間門口的盆栽（GG_PROP_BLOCKS (−9.3, 21.5)，01505ccd0）擋在旁邊，人站不住）。
     站得住、在演、坐著、不在這一層：不動（E.unstick 站得住就不動）*/
  function propReStand(E,nav){ const P=E&&E.player; if(!P||P.busy||P.seat||!E.unstick||E.nav!==nav) return false; return E.unstick(P,6); }

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
  function wancaiStairs(E,g,nav,b,bx,bz,walk,ry){ const W=b.userData.ck.wancai; if(!W) return null;
    /* 萬才館可以轉向（LAW-RELAYOUT-1102 第二輪：轉 42°）：高度、導航、點地面的透明地板都照建築本身的座標（本地 x 沿建築、z 往正面）算，再轉回校園座標；ry＝0 時和以前完全一樣 */
    ry=ry||0; const rc=Math.cos(ry), rs=Math.sin(ry); const toL=(x,z)=>{ const dx=x-bx, dz=z-bz; return [dx*rc-dz*rs, dx*rs+dz*rc]; }, toW=(lx,lz)=>[bx+lx*rc+lz*rs, bz-lx*rs+lz*rc];
    const aabb=(x0,x1,z0,z1)=>{ const P=[toW(x0,z0),toW(x1,z0),toW(x0,z1),toW(x1,z1)]; return {x0:Math.min(...P.map(p=>p[0])),x1:Math.max(...P.map(p=>p[0])),z0:Math.min(...P.map(p=>p[1])),z1:Math.max(...P.map(p=>p[1]))}; };
    const halfAt=(R,zp)=>{ for(let i=1;i<R.length;i++){ const a=R[i-1], c=R[i]; if(zp<=c[1]+1e-9){ const t=c[1]>a[1]?(zp-a[1])/(c[1]-a[1]):1; return a[0]+(c[0]-a[0])*Math.max(0,Math.min(1,t)); } } return -1; };   /* 外緣（右半邊）在 zp 的半寬 */
    let hwMax=0; for(const R of W.outl) for(const p of R) hwMax=Math.max(hwMax,p[0]);
    /* 每一階外緣的半寬先算成表（每 1 cm 一格）：高度函式每一幀、每個人物都會叫好幾次 */
    const DZ=0.01, NZ=Math.ceil(W.L/DZ)+1, HW=W.outl.map(R=>{ const zf=R[R.length-1][1], a=new Float32Array(NZ); for(let i=0;i<NZ;i++){ const zp=i*DZ; a[i]=zp>zf+1e-9?-1:halfAt(R,zp); } return a; });
    const kOf=zp=>Math.max(0,Math.min(W.NS-1,W.NS-1-Math.floor(zp/W.TR))), at=zp=>Math.min(NZ-1,Math.round(zp/DZ));
    const CORE=new Float32Array(NZ), OUT=new Float32Array(NZ); for(let i=0;i<NZ;i++){ const kc=kOf(Math.min(i*DZ,W.L-1e-6)); let o=-1; for(let k=0;k<=kc;k++) o=Math.max(o,HW[k][i]); OUT[i]=o; CORE[i]=Math.min(HW[kc][i],o); }
    // 畫面上的高度（腳踩的踏面）：那一點最上面的那一階 (k+1)×16.5 cm；外側（最下面幾階往外張開的地方）往下一階找
    const vfn=(x,z)=>{ const L_=toL(x,z), zp=L_[1]-W.z0; if(zp<0||zp>=W.L) return null; const dx=Math.abs(L_[0]-W.SX), i=at(zp); for(let k=kOf(zp);k>=0;k--){ if(dx<=HW[k][i]) return (k+1)*W.RS; } return null; };
    // 碰撞、找路用的連續高度（和霖澤館的台階一樣：最上面一階踏面中心 3.63 m 連續斜下到最下面一階的邊緣 0）；兩側往外張開的地方往外漸漸降到地面——
    // 張開的那幾階每一階只露出 10～30 cm 寬，照一階一階算的話人物半徑裡高低差超過 25 cm、站不住（走到樓梯下面往旁邊走會卡住，nav_buildings_unit 抓到）；高的地方（石牆盡頭旁邊）照樣是走不下去的邊
    const hsAt=zp=>Math.max(0,Math.min(W.PF,W.PF*(W.L-zp)/(W.L-W.TR/2)));
    const coreW=zp=>W.hw(Math.min(1,zp/W.L))+0.1, bottomRow=zp=>zp>=W.L-W.TR;   /* 主樓梯的寬度（兩道石牆之間那條曲線，一路延伸到最下面）；最下面一階整排都算 */
    const fn=(x,z)=>{ const L_=toL(x,z), zp=L_[1]-W.z0; if(zp<0||zp>=W.L) return null; const dx=Math.abs(L_[0]-W.SX), i=at(zp), o=OUT[i]; if(dx>o) return null; const h=hsAt(zp), c=coreW(zp); return (dx<=c||bottomRow(zp))?h:h*(o-dx)/Math.max(1e-3,o-c); };
    const SB=aabb(W.SX-hwMax-0.01,W.SX+hwMax+0.01,W.z0,W.z0+W.L); const stair={x0:SB.x0,x1:SB.x1,z0:SB.z0,z1:SB.z1,fn,vfn,wancai:true,ry};
    nav.addSurf(stair);
    /* 樓梯兩側往外張開的部分（石牆盡頭到最下面一階之間）不能走、也不能從側面跨下去：那裡是一層一層疊起來的窄台階（每階只露出 10～30 cm），
       連續高度往外降得很陡，A* 的格子中心站得住、人物稍微偏一點就站不住（reachability_all：從萬才館一樓出來走回霖澤館前，卡在石牆盡頭旁邊；
       只擋「太陡」的格子之後，換成卡在西側張開的地方）→ 主樓梯寬度（兩道石牆之間那條曲線，延伸到最下面）以外、外緣往外 0.25 m 以內整圈擋起來（最下面一階整排不擋）。
       可以走的是主樓梯（一路到最下面）和最下面一階，經過樓梯底下的路會沿著最下面一階或地面走 */
    { const [c0,r0]=nav.toCell(stair.x0-0.6,stair.z0-(ry?0.6:0)), [c1,r1]=nav.toCell(stair.x1+0.6,stair.z1+(ry?0.6:0)); for(let cz=r0;cz<=r1;cz++) for(let cx=c0;cx<=c1;cx++){ const i=nav.idx(cx,cz); if(nav.b[i]) continue; const [x,z]=nav.toWorld(cx,cz), L_=toL(x,z), zp=L_[1]-W.z0;
        if(zp<0||bottomRow(zp)||(ry&&zp>W.L)) continue; const k=at(Math.min(zp,W.L-1e-6)), dx=Math.abs(L_[0]-W.SX); if(dx>coreW(zp)&&dx<=OUT[k]+0.25) nav.b[i]=1; } nav._cm=null; }
    const nav1=new E3.NavGrid(nav.w,nav.h,nav.cell,nav.ox,nav.oz).fillBlocked().setFloor(W.PF); nav1.addSurf(stair);
    { const [c0,r0]=nav.toCell(stair.x0,stair.z0), [c1,r1]=nav.toCell(stair.x1,stair.z1); for(let cz=r0;cz<=r1;cz++) for(let cx=c0;cx<=c1;cx++){ const i=nav.idx(cx,cz); if(nav.b[i]) continue; const [x,z]=nav.toWorld(cx,cz); if(fn(x,z)!=null) nav1.b[i]=0; } }   // 樓梯（石牆、端塊在第 0 層已經擋住）
    if(!ry) nav1.freeRect(bx+W.LX0+W.CT+0.02,bz+W.d/2+0.12,bx+W.LX1,bz+W.z0);
    else { const lx0=W.LX0+W.CT+0.02, lz0=W.d/2+0.12, lx1=W.LX1, lz1=W.z0, A=aabb(lx0,lx1,lz0,lz1), [c0,r0]=nav.toCell(A.x0,A.z0), [c1,r1]=nav.toCell(A.x1,A.z1); for(let cz=r0;cz<=r1;cz++) for(let cx=c0;cx<=c1;cx++){ const [x,z]=nav.toWorld(cx,cz), L_=toL(x,z); if(L_[0]>=lx0&&L_[0]<=lx1&&L_[1]>=lz0&&L_[1]<=lz1) nav1.b[nav.idx(cx,cz)]=0; } }   // 樓梯頂端的平台（西側是石牆、北側是二樓玻璃）
    { const BA=aabb(W.BX0,W.BX1,W.d/2,W.d/2+W.BB), [c0,r0]=nav.toCell(BA.x0,BA.z0), [c1,r1]=nav.toCell(BA.x1,BA.z1); for(let cz=r0;cz<=r1;cz++) for(let cx=c0;cx<=c1;cx++){ const [x,z]=nav.toWorld(cx,cz), [lx,lz]=toL(x,z); if(lx<W.BX0||lx>W.BX1-0.3||lz<W.d/2+0.12) continue; if(lz<W.bzf(lx)-W.railIn-0.1) nav1.b[nav.idx(cx,cz)]=0; } }   // 弧形陽台（欄杆內側）
    nav1._cm=null;
    // 點地面移動：樓梯（斜面，第 0 層）；平台＋陽台（第 1 層，照陽台的弧形外緣；只有從上面看打得到）
    { const N=28, P=[], I=[], R0=W.outl[0], zf0=R0[R0.length-1][1];   /* 照樓梯的寬度（兩道石牆之間；最下面幾階往外張開的地方照最下面那一階的外緣），不是一整片長方形：旁邊的地面（陽台下的一樓入口、弧形量體前）點下去不會先打到樓梯的透明斜面、把目的地算錯 */
      for(let i=0;i<=N;i++){ const sv=i/N, zp=sv*W.L; let hw=W.hw(sv); if(sv>W.SC) hw=Math.max(hw,halfAt(R0,Math.min(zp,zf0))); const y=W.PF*(1-sv)+0.01; const pa=toW(W.SX-hw,W.z0+zp), pb=toW(W.SX+hw,W.z0+zp); P.push(pa[0],y,pa[1], pb[0],y,pb[1]); }
      for(let i=0;i<N;i++){ const a=2*i, b=a+1, c=a+2, d=a+3; I.push(a,c,b, b,c,d); }   /* 正面朝上（從上面點才打得到）*/
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setIndex(I); geo.computeVertexNormals(); geo.computeBoundingSphere();
      const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({visible:false})); m.userData.walkLv=0; m.userData.dyn=true; g.add(m); walk.push(m); }
    { const sh=new THREE.Shape(); sh.moveTo(W.LX0,-W.d/2); sh.lineTo(W.LX0,-W.z0); sh.lineTo(W.BX0,-W.z0); for(let i=1;i<=24;i++){ const x=W.BX0+(W.BX1-W.BX0)*i/24; sh.lineTo(x,-W.bzf(x)); } sh.lineTo(W.LX0,-W.d/2);
      const geo=new THREE.ShapeGeometry(sh); geo.rotateX(-Math.PI/2); const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({visible:false})); m.position.set(bx,W.PF+0.01,bz); m.rotation.y=ry; m.userData.walkLv=1; m.userData.dyn=true; g.add(m); walk.push(m); }
    /* 校園的地面（第 0 層、y=0）也要打得到：站在平台或樓梯上（第 1 層）點廣場時，原本打不到「有高度的地面」就用玩家那一層的基本高度（3.63 m）的平面，
       目的地算在離玩家很近、平台外面走不到的地方（真實玩家流程：從平台走下大樓梯點了 7 次）。正面朝上；在地面那一層時和原本的平面是同一個點（霖澤館室內的一樓地板也是這樣） */
    { const geo=new THREE.PlaneGeometry(nav.w,nav.h); geo.rotateX(-Math.PI/2); const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({visible:false})); m.position.set(nav.ox+nav.w/2,0,nav.oz+nav.h/2); m.name='campus_ground_tap'; m.userData.walkLv=0; m.userData.dyn=true; g.add(m); walk.push(m); }
    /* 二樓入口（萬才館第三階段，D42）：進到室內二樓的西南門廳（src/data/wancai_layout.js 的 upperDoor）。第二階段（D41）這扇門關著 */
    { const UD=(typeof WANCAI_LAYOUT!=='undefined')&&WANCAI_LAYOUT.upperDoor, DP=toW(W.SX,W.d/2+0.8); E.interactables.push(UD?{x:DP[0],z:DP[1],radius:1.4,lv:1,y:W.PF,label:'進入法律系館B（二樓）',exit:{to:'wancai',spawn:Object.assign({},UD.spawn)}}
        :{x:DP[0],z:DP[1],radius:1.4,lv:1,y:W.PF,label:'法律系館B二樓入口',look:'二樓入口的玻璃門關著。'}); }
    return nav1; }
  const campus={ id:'campus', name:'首都帝大校園', indoor:false, cityLight:0.25, size:[260,170], viewFar:260, fogNear:100, build(E){   /* 第二十批：邊界外有背景了，視距拉遠（照片裡椰林大道盡頭的總圖看得清楚；從校門口看總圖約 205 m）*/
    treeIdx=0; leafyCount=0; palmIdx=0; const g=new THREE.Group(); const W=260, D=170; const parked=[], parkedRack=n=>{ const r=W3.bikeRack(n); parked.push(r); return r; }, parkedBike=(...a)=>{ const b=W3.bikeAny(...a); parked.push(b); return b; };   /* 停著的車：分區合併、距離開關（parkedBikeChunks）*/ /* 導航格必須涵蓋法學院前庭（z 到 -124），否則霖澤館前完全不能走 */ const nav=new E3.NavGrid(W,227,0.5,-W/2,-142);   /* XS-GATE-NORTH-1105：往北多 10 m（z −142～−132），北牆邊的側門、望月台、體育館門口才在格子裡 */ const seats=[]; const lamps=[]; const buildings=[];
    const LR=typeof BLACKFOREST_LAYOUT==='undefined'||BLACKFOREST_LAYOUT.version>=4;   /* 預設就是新配置（wancai3d.js、heroine_circle.js、places.js 的座標都寫死新的）；只有載入舊版黑森林配置（v2/v3）時才是舊的 */   /* 法學院區照官方地圖重排（LAW-RELAYOUT-1102，使用者 11-02 22:1x「霖澤館跟萬才不應該是平行隔壁」，選「照提案做」）：
       霖澤館不動；國青大樓、研三舍在霖澤館東邊；萬才館往東南移 (+2, +12)，正面照舊朝南（大樓梯兩層導航照朝南寫）、對著黑森林；小湖在霖澤館前庭南邊，兩館之間的走道經過小湖 */
    const WCX=LR?94:88, WCZ=LR?-96:-112, WRY=LR?-0.733:0;   /* 萬才館中心（舊 (88,−112)）＋轉向：使用者 11-03「系館a不應該跟系館b平行」→ 照官方地圖順著辛亥路斜放，長軸轉 42°（西北—東南）、正面朝西南對著霖澤館和廣場 */
    const WCW=(lx,lz)=>[WCX+lx*Math.cos(WRY)+lz*Math.sin(WRY), WCZ-lx*Math.sin(WRY)+lz*Math.cos(WRY)];   /* 萬才館的本地座標 → 校園座標（入口、出來的落點、路燈、陽台…都用這個）*/
    // 地面：草地
    groundHoles(g,W,D,W3.grassTex(),4,[[B1C.x0,B1C.z0,B1C.x1,B1C.z1]]); ground(g,120,44,W3.grassTex(),[30,11],52,-106,-0.002); // 北側法學院區地面
    // 校園配置依台大校總區平面圖（map.ntu.edu.tw，2025.10.13 版）壓縮：x 往東、-z 往北；椰林大道東西向（z=0），西端大門、東端總圖書館；
    // 大道南側：傅鐘＋行政大樓；北側：文學院、校史館、農業陳列館；小椰林道（x=30）往北通法學院；醉月湖在文學院北邊。
    // 主要道路：椰林大道 東西向（z=0），從校門 x=-124 到總圖前廣場 x≈72
    /* LIB-FRONT-1102（使用者 11-02 08:45 五張照片＋09:4x 一張；LAWWW2 tools/blender/env_second/campus_library.py、campus_lib_lawn.py）：總圖前改成照片的樣子——
       大道的柏油、步道在小椰林道路口以東（x 35）結束；x 35～63.5 是一大片長草坪（兩邊龍柏籬、籬笆外大王椰子、紅磚步道），x 63.5～73.75 淺色石板廣場（「台階下方還有磁磚 蠻寬的 之後才是草坪」），
       x 73.75～76 五階寬台階走上 0.9 m 的平台；平台 6 m 深（x 76～82，10:4x「總圖出來還有個平台 之後才是階梯往下」）、再進一樓拱廊。總圖不搬（門口互動點 (86.4,0)、門外 (80,0)、門廊前 (82,0) 照舊走得到；LAWWW 11-02 09:11）。
       兩個正式模型都有時才換（?nobldg 或 manifest 沒有：照舊是大道到 x 72＋石板小廣場＋套件的總圖）*/
    const LIBF=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_lib_lawn']&&!!ASSETS.manifest['bldg.campus_library'];
    const AVE_X1=LIBF?35:72;
    strip(g,-124,0,AVE_X1,0,16,pavingTex(),3); curb(g,-124,0,AVE_X1,0,16);
    // v9.3 第十八批：大道中間 12 m 是柏油路面（黃色虛線中線、白色邊線；照使用者給的椰林大道照片），兩側各 2 m 石磚人行道（原本整條 16 m 都是淺色石磚，像廣場）。
    // 只是路面貼圖，導航不變；騎腳踏車的路人走 z=±3（路面上），行人走 z=±7（人行道上）
    { const RL=AVE_X1+124; const base=asphaltPhotoTex(); const rt=base.clone(); rt.repeat.set(12/3,RL/3); PHOTO_INFO.get(base).clones.push(rt); if(base.image) rt.needsUpdate=true;   /* ART-LIB-FRONT-PAVING-1103：照片柏油（每 3 m 一張，沒有污漬、裂縫）*/
      const road=new THREE.Mesh(new THREE.PlaneGeometry(12,RL),texMat(rt,null,{roughness:0.9})); road.rotation.x=-Math.PI/2; road.rotation.z=-Math.PI/2; road.position.set((AVE_X1-124)/2,0.024,0); road.receiveShadow=true; g.add(road);
      const lineM=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:0.75,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
      for(const [zz,w,c] of [[0,0.15,'#d9a826'],[-5.55,0.12,'#e8e6df'],[5.55,0.12,'#e8e6df']]){ const ln=new THREE.Mesh(new THREE.PlaneGeometry(RL,w),lineM(c)); ln.rotation.x=-Math.PI/2; ln.position.set((AVE_X1-124)/2,0.026,zz); ln.receiveShadow=true; ln.name='avenue_line'; g.add(ln); } }   /* 黃色中線一整條（以前 Canvas 畫的是三分之一的虛線，到總圖前被石磚蓋到、看起來斷斷續續）、兩側白色邊線 */
    // 總圖前廣場（椰林大道盡頭）
    const libPlaza=ground(g,17,36,pavingTex(),[17/3,12],78.5,0,0.016);
    /* 總圖前草皮（X133 LIB-LAWN-1030 第一版，LAWWW2-B；tools/blender/env_second/campus_lib_lawn.py → bldg.campus_lib_lawn）：中軸（z −5～5）兩邊各一塊 L 形草皮、
       紅磚步道、北側草皮的老樟樹（企劃：「總圖前面的樟樹比總圖老」「他在樟樹下等你」）、南側一棵中型的樹、沿中軸六張長椅、六盞路燈。
       有正式模型時才換：原本廣場兩邊的兩棵樹 (74,−12)、(78,14) 拿掉（位置在草皮上）。模型載入失敗時照舊是石板廣場（樹、長椅、路燈還在，走得到）。
       草皮走得到、坐得到（草皮面 4.5 cm、路緣 7 cm；導航是平的）。導航只擋樹幹、長椅、燈柱。 */
    const lawnGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_lib_lawn'];
    if(lawnGLB){   /* LIB-FRONT-1102 第二版草坪（campus_lib_lawn.glb 的 info.layout）：老樟樹、南邊的大樹、四張長椅由遊戲放；白色球形路燈、龍柏籬、石墩在模型裡，這裡只擋導航 */
      const ct=TK.tree(16,1331,{sp:'camphor'}); ct.name='lib_old_camphor'; place(g,ct,68.5,-25.5,0.4); nav.blockCircle(68.5,-25.5,1.0);   /* 老樟樹（「他在樟樹下等你」「總圖前面的樟樹比總圖老」）：廣場北邊 */
      const st=TREE(1.15); place(g,st,68.5,25.5,2.1); nav.blockCircle(68.5,25.5,0.8);   /* 廣場南邊的大樹 */
      for(const [x,z,ry] of [[65.3,-22.2,0.0],[71.7,-22.2,0.0],[65.3,22.2,Math.PI],[71.7,22.2,Math.PI]]){ const b=BENCH(); place(g,b,x,z,ry); nav.blockRect(x,z,1.4,0.7,0); seats.push({x,z:z+(ry?-0.06:0.06),yaw:ry,label:'坐在總圖前的長椅上'}); }   /* 大樹兩旁，面向廣場中間 */
      for(const [x,z] of [[38.0,-15.35],[49.0,-15.35],[60.0,-15.35],[38.0,15.35],[49.0,15.35],[60.0,15.35],[64.3,-20.0],[64.3,20.0],[72.8,-19.2],[72.8,19.2]]) nav.blockCircle(x,z,0.5);   /* 白色球形路燈（模型裡；BUG-NAV-LAMPPOST-1021：r 0.25 在格角不擋任何格，用 0.5）*/
      for(const [x,z] of [[40.0,-11.0],[40.0,11.0]]) nav.blockRect(x,z,0.9,0.9,0,0.05);   /* 草坪西端兩個白色石墩 */
      for(const s of [-1,1]) nav.blockRect(51.8,s*11.0,22.6,1.4,0,0);   /* 龍柏籬（x 40.5～63.1、|z| 10.3～11.7）：草坪只能從兩頭進出，和照片一樣 */
    }
    // 椰林大道兩側的杜鵑花叢（真實的椰林大道中間沒有分隔島；開學的九月杜鵑不開花，只有綠叢）：每兩棵椰子樹中間一叢；
    // 路口（小椰林道、文學院、往醉月湖的小路、宿舍）、路燈、長椅前、傅鐘廣場前留空，草地和長椅都走得到
    { const bin=new TK.Bin(); const lampXs=[], benchXs=[]; for(let x=-105;x<=(LIBF?27:55);x+=22) lampXs.push(x); for(let x=-100;x<=(LIBF?25:50);x+=25) benchXs.push(x);
      const skipN=[[24,36],[-41,-35],[-15.5,-8.5]], skipS=[[-53,-23],[16,24]];
      for(let x=-106.25;x<=(LIBF?30:66.25);x+=7.5){ if(lampXs.some(l=>Math.abs(x-l)<2.6)||benchXs.some(b=>Math.abs(x-b)<1.8)) continue;   /* LIB-FRONT-1102：路口以東是草坪、龍柏籬 */
        for(const s of [-1,1]){ if((s<0?skipN:skipS).some(([a,b])=>x>a-1.5&&x<b+1.5)) continue; const z=s*10.8;
          for(let k=-1;k<=1;k++) TK.plantClump(bin,x+k*0.85,0,z+(k%2?0.12:-0.1)*s,0.95+(Math.abs(x*7+k*3)%3)*0.08,6,[0.62,0.82,0.6]);
          nav.blockRect(x,z,2.6,0.9,0,0); } }
      const grp=new THREE.Group(); bin.build(grp); g.add(grp); }
    // 法學院道路：從椰林大道 x=30 向北到法學院區 z=-70
    strip(g,30,-8,30,-74,10,pavingTex(),3); curb(g,30,-8,30,-63.8,10);   /* ART-LIB-FRONT-PAVING-1103：從大道人行道外緣（z −8）開始；以前從大道中線 z 0 開始，石磚蓋掉大道北半邊 x 25～35 的柏油（使用者截圖裡「接縫錯開」、黃線被蓋住）*/ curb(g,30,-68.2,30,-74,10);   /* X75：z −68～−64 的路緣斷開（往社科院中庭的路） */
    strip(g,30,-60,LR?109:102,-60,10,pavingTex(),3); curb(g,30,-60,LR?109:102,-60,10);   /* 東端原本到 x=110（舊社科院的中庭）；X75 以後到那棟沒有名字的系館正門 */
    if(typeof SOCSCI_LAYOUT!=='undefined'&&typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.campus_socsci']){   /* X75 社科院（霖澤館西南）：小椰林道往中庭（兩棵椰子樹 z −62、−70 中間）、法學院廣場往大樓正門（東面）的兩小段步道 */
      strip(g,17,-66.5,25,-66.5,3,pavingTex(),3); strip(g,17,-85,25,-85,4,pavingTex(),3); }   /* 中庭那段 z −68～−65：不疊到模型裡圖書館東側的鋪面（z −65 以南） */
    // 通往醉月湖的小路（文學院東側往北）＋湖南岸步道
    /* 方案 A（D55／D56，使用者 2026-10-13：普通、博雅照官方地圖的真實位置）：醉月湖整組往北搬到 (-36,-112)；小路往北延長到新的湖南岸步道（z=-97）；
       原本的湖南岸步道（z=-51）改成文學院和普通教學館之間的路（z=-46.5）；普通、博雅之間有一條往博雅門口的路（z=-70.5） */
    strip(g,-12,-8,-12,-97,5,pavingTex(),3); strip(g,-58,-46.5,-8,-46.5,4,pavingTex(),3); strip(g,-54,-97,-8,-97,4,pavingTex(),3); strip(g,-44,-70.5,-10,-70.5,3,pavingTex(),3);
    // 舟山路（南側，行政大樓後面）
    strip(g,-110,47,110,47,9,W3.asphaltTex(),6); curb(g,-110,47,110,47,9);
    for(const x of [-97,-75,-53,-31,-9,14,26,48,70]){ const l=W3.lampPost(); place(g,l,x,52.6,Math.PI); l.userData.roadPool=true; lamps.push(l); nav.blockCircle(x,52.6,0.5); }   /* 舟山路的路燈（LAWWW2-B 10-24 巡查 P3：整條 220 m 原本沒有一盞路燈，晚上大一女舍門口、回男生宿舍穿過的那一段都是黑的）：南側（宿舍那一側）路緣外 1.1 m、約 22 m 一盞，燈臂朝馬路、路面一圈光（roadPool，和椰林大道同一套）；−97 照女舍長椅後面那段馬路，14、26 夾著往男生宿舍的路（x 17～23）；避開大一女舍 A、B 門口和長椅那一盞 */
    strip(g,20,8,20,58,6,pavingTex(),3);   /* ART-LIB-FRONT-PAVING-1103：從大道南邊人行道外緣（z 8）開始，不蓋到大道的柏油 */
    // ---- 宿舍（舟山路南側）----
    // 校園建築套件：導航格只擋建築本體、拱廊柱子、門廊（拱廊底下可以走）；鏡頭碰撞＝建築本體＋拱廊上方的樓層（鏡頭不會穿到樓上，拱廊裡也不會被拉到臉前面）
    const campusWalk=[];   // 點地面移動時打得到的「有高度的地面」（霖澤館穿堂、台階）
    const ckPlace=(b,x,z,ry)=>{ place(g,b,x,z,ry); const c=Math.cos(ry||0), sn=Math.sin(ry||0), q=Math.abs(sn)>0.5; const ck=b.userData.ck; const W=(lx,lz)=>[x+lx*c+lz*sn,z-lx*sn+lz*c];
      const odd=Math.abs(Math.sin(2*(ry||0)))>1e-6;   /* 不是 0／90／180／270°（萬才館轉 42°）：導航擋住、鏡頭碰撞照建築的角度斜放 */
      for(const [bx,bz,bw,bd,pad] of ck.blocks){ const p=W(bx,bz); if(odd) nav.blockRect(p[0],p[1],bw,bd,-(ry||0),pad==null?0.15:pad); else nav.blockRect(p[0],p[1],q?bd:bw,q?bw:bd,0,pad==null?0.15:pad); }
      const colBox=(lx,lz,bw,bd,y0,y1)=>{ const p=W(lx,lz); const m=new THREE.Mesh(new THREE.BoxGeometry(odd?bw:(q?bd:bw),y1-y0,odd?bd:(q?bw:bd)),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(p[0],(y0+y1)/2,p[1]); if(odd) m.rotation.y=ry; g.add(m); E.colliders.push(m); };
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
    for(let x=-110;x<=70;x+=7.5){ for(const s of [-1,1]){ palmIdx++; if(LIBF&&x>66) continue; const pz=(LIBF&&x>35)?13.4:9.5;   /* LIB-FRONT-1102：草坪那一段的椰子在龍柏籬外面（照片：籬笆後面一排大王椰子）；x 70 那一棵在廣場上，拿掉 */ const p=TK.royalPalm((14.5+((x*7)%3)*0.8)*1.35,palmIdx,{crown:0.66});   /* v9.3 第十八批：照椰林大道照片拉高到約 20 m、樹冠相對變小 */ place(g,p,x,s*pz,(x*0.3)%6.28); nav.blockCircle(x,s*pz,0.5); } }
    // 兩側草地小徑與長椅、腳踏車
    for(let x0=-100;x0<=(LIBF?25:50);x0+=25){ for(const s of [-1,1]){ const x=(x0===25&&s<0)?17:x0;   /* 南側 x=25 那張貼著小椰林道的椰子樹（24.2,-14，樹幹在椅背後 1.3 m）：移到 x=17（使用者 2026-10-16：這張椅子位子有夠奇怪）*/ const b=BENCH(); place(g,b,x,s*13,s>0?Math.PI:0); nav.blockRect(x,s*13,1.4,0.7,0); seats.push({x,z:s*13+(s>0?-0.06:0.06),yaw:s>0?Math.PI:0,label:'坐在椰影大道的長椅上'}); } }
    for(let x=-90;x<=40;x+=32){ const r=parkedRack(7); place(g,r,x+8,-16,0); nav.blockRect(x+8,-16,5,1.4,0); }
    for(let x=-105;x<=(LIBF?27:55);x+=22){ for(const s of [-1,1]) for(const lx of (s>0&&x===-39)?[-46.25,-31.25]:[x]){ const l=W3.lampPost(); place(g,l,lx,s*11,s>0?Math.PI:0); l.userData.roadPool=true; lamps.push(l); nav.blockCircle(lx,s*11,0.5); } }   /* 傅鐘那一側：原本 (-39, 11) 那一盞正好擋在鐘亭正前方（巡場景 P3）——改成鐘亭兩側各一盞（都在兩棵椰子中間、鐘亭前廣場的範圍裡，那一段本來就不放植栽）*/   /* 燈臂朝大道（2026-10-21 LAWWW2：原本背對大道，晚上 12 m 寬的路面完全照不到、整條是黑的——舊序章、法律系晚上都走這條；燈頭位置照 W3.lampPost 的約定，只是轉向）*/
    // ---- 傅鐘（大道南側小廣場，行政大樓正前方）----
    const plaza=ground(g,28,12,pavingTex(),[28/3,4],-38,17,0.015); const bell=CK.bell(); place(g,bell,-38,16.5,Math.PI); placeBlocks(nav,bell,-38,16.5,Math.PI);   /* v9.3 第十六批：校園套件的鐘亭，石碑朝北對著大道 */
    const bellGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_bell']; bell.userData.ckTag='bell'; if(bellGLB) bell.userData.dyn=true;   /* 傅鐘的 Blender 正式模型（第二個 AI：campus_bell.py → bldg.campus_bell）：和總圖同一套接法；導航阻擋照舊是套件的（placeBlocks） */ for(const [x,z] of [[-51,21.5],[-25,21.5]]){ const b=TREE(1.3); place(g,b,x,z,0); nav.blockCircle(x,z,0.9); }
    for(const x of [-46,-30]){ const b=BENCH(); place(g,b,x,21,Math.PI); nav.blockRect(x,21,1.4,0.7,0); seats.push({x,z:21-0.06,yaw:Math.PI,label:'坐在晨思鐘旁的長椅'}); }
    // ---- 行政大樓（大道南側、傅鐘後面）：大圓柱、對稱，正面朝北對著椰林大道 ----
    // v9.3：台大日治時期建築語彙（src/campuskit3d.js）：面磚、一樓拱廊、拱窗、石材腰帶與簷口、寄棟屋頂、中央門廊（佔地不變；門廊的柱墩與側牆另外加碰撞）
    const admin=CK.hall({w:46,d:16,floors:2,gfh:4.2,fh:3.4,wall:'#9e5139',trim:'#e8e0cf',roof:'#4a3a33',roofH:4.2,arcade:true,porch:{bays:3,depth:3.0,pediment:false},sign:'行政大樓'}); ckPlace(admin,-38,33,Math.PI); buildings.push(admin);   /* NTU-REF-1110 ②（LAWWW2 帳號 A 11-10；X223）：官網「外牆以紅色清水磚為主」、北棟二層——原本米黃 #cdb48e、3 層；文學院（國防色）、校史館（土黃）十三溝面磚也照官網改色。正式模型 campus_hall.py 同一組數字（鏡頭碰撞照套件的高度） */
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
    const arts=CK.hall({w:40,d:18,floors:2,gfh:4.8,fh:4.4,wall:'#9a8560',trim:'#d8cfbd',roof:'#43342e',roofH:4.8,arcade:true,porch:{bays:3,depth:3.0,pediment:true,pedH:1.8},sign:'文學院'}); ckPlace(arts,-38,-34,0); buildings.push(arts); strip(g,-38,-8,-38,-24,4,pavingTex(),3);
    const artsGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_arts']; arts.userData.ckTag='arts'; if(artsGLB) arts.userData.dyn=true;   /* 文學院的 Blender 正式模型（第二個 AI：campus_hall.py --set arts → bldg.campus_arts）：和總圖同一套接法；導航、鏡頭碰撞、門口照舊是套件的（ckPlace） */
    /* ---- 普通教學館、博雅教學館（方案 A，D55；查證：docs/campus/TEACHING_BUILDINGS_PLAN.md 第 1 節）：椰林大道 → 文學院 → 普通 →（二樓空橋）→ 博雅 → 醉月湖。
       外觀是校園套件（BLOCKOUT），等 LAWWW2 的 Blender 正式模型；正門都在南面中間（和室內 src/data/putong_layout.js、boya_layout.js 的入口同一側），
       門口的互動點在 classes3d.js 的 DOORS.putong、DOORS.boya；二樓空橋之後再開（普通二樓的空橋門現在是關著的）---- */
    const putongB=CK.hall({w:34,d:16,floors:5,gfh:4.0,fh:3.6,wall:'#c9b596',trim:'#e8e0cf',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4},sign:'普通教學館'}); ckPlace(putongB,-38,-58.5,0); buildings.push(putongB); const ptGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_putong']; putongB.userData.ckTag='putong'; if(ptGLB) putongB.userData.dyn=true;
    const boyaB=CK.modern({w:34,d:18,floors:5,gfh:4.6,fh:3.85,wall:'#d9d5cb',slab:'#bfc2bb',sign:'博思教學館'}); ckPlace(boyaB,-38,-83,0); buildings.push(boyaB); const byGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_boya']; boyaB.userData.ckTag='boya'; if(byGLB) boyaB.userData.dyn=true;   /* 普通、博雅的 Blender 正式外觀（LAWWW2-C campus_teach.py，ART-EXT-TEACH）：五層照真的樓層數（套件原本四層，一起改）；普通一樓 4.0 m＝空橋外觀的 Y0、博雅一樓 4.6 m＝空橋往北升 0.6 m 的那一端；導航、門口照舊 */
    { const bf=new THREE.Group(); bf.name='skybridge_fallback'; g.add(bf); const Y0=4.0;   /* 二樓空橋的外觀：正式模型 LAWWW2-B skybridge.glb（和普通教學館室內的空橋同一個；原點＝普通北牆門口的地板），Y0＝普通外觀的二樓 4.0（室內是 4.2→4.8；外觀的 0.2 m 差看不出來）；室內走得過去（src/teach3d.js 的 buildBridge）*/
      const br=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.45,7.5),M('#b9b5ab')); br.position.set(-41.2,Y0-0.23,-70.25); bf.add(br); for(const s of [-1,1]){ const gl=new THREE.Mesh(new THREE.BoxGeometry(0.08,2.6,7.5),M('#8fa9b5')); gl.position.set(-41.2+s*1.56,Y0+2.2,-70.25); bf.add(gl); } const rf=new THREE.Mesh(new THREE.BoxGeometry(3.4,0.2,7.7),M('#9c9a93')); rf.position.set(-41.2,Y0+3.55,-70.25); bf.add(rf);
      if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.skybridge']) ASSETS.loadOne('bldg.skybridge').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const sc=c.scene.clone(true); sc.position.set(-41.2,Y0,-66.5); sc.userData.dyn=true; g.add(sc); bf.visible=false; }).catch(e=>console.warn('空橋外觀正式模型載入失敗，用備用模型',e)); }
    // ---- 農業陳列館（洞洞館）北側近校門 ----
    // 農業陳列館（洞洞館）：上層四面是圓洞鏤空牆、一樓玻璃＋方柱、平屋頂寬屋簷（CK.pavilion；佔地和舊版相同）
    const hole=CK.pavilion({w:22,d:14,gfh:4.0,h:9,sign:'農業陳列館'}); ckPlace(hole,-104,-30,0); buildings.push(hole);
    const pavGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_pavilion']; hole.userData.ckTag='pavilion'; if(pavGLB) hole.userData.dyn=true;   /* 洞洞館的 Blender 正式模型（第二個 AI：campus_pavilion.py → bldg.campus_pavilion）：和總圖同一套接法；導航、鏡頭碰撞照舊是套件的（ckPlace） */
    // ---- 校史館（舊總圖）：大道北側、靠近大門（農業陳列館東邊），紅磚拱窗、圓石柱、屋瓦 ----
    const hist=CK.hall({w:24,d:16,floors:2,gfh:5.0,fh:4.6,wall:'#b39762',trim:'#d8cfbd',roof:'#43342e',roofH:4.4,arcade:true,porch:{bays:3,depth:2.6,pediment:true,pedH:1.6},sign:'校史館'}); ckPlace(hist,-77,-29,0); buildings.push(hist);
    const histGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_hist']; hist.userData.ckTag='hist'; if(histGLB) hist.userData.dyn=true;   /* 校史館的 Blender 正式模型（第二個 AI：campus_hall.py --set hist → bldg.campus_hist）：同上 */
    // ---- 總圖書館（椰林大道東端盡頭，正面朝西對著大道）----
    const lib=CK.hall({w:60,d:26,floors:4,gfh:5.0,fh:4.3,wall:'#9e5a44',trim:'#dcd3c2',roof:'#4a3a33',roofH:4.0,arcade:true,arcDepth:3.0,porch:{bays:5,depth:4.2,pediment:true,pedH:3.0,h:9.0,ys:5.6},tower:{w:9,h:9},sign:'總圖書館'}); ckPlace(lib,100,0,-Math.PI/2); buildings.push(lib);
    /* 總圖的 Blender 正式模型（第二個 AI：tools/blender/env_second/campus_library.py → bldg.campus_library）：有模型時套件的總圖不參加整區靜態合併，載入後藏起套件外觀；
       ?nobldg 或載入失敗時照舊是套件。導航阻擋、鏡頭碰撞、門口互動點都還是套件的（ckPlace） */
    const libGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_library']; lib.userData.ckTag='library'; if(libGLB) lib.userData.dyn=true;
    if(LIBF){   /* LIB-FRONT-1102：照片的總圖（campus_library.layout.json）——一樓拱廊突出在前面（正面 x 81.6～82.6、拱的位置留開口）、拱廊後牆 x 86.4（大門 z=0）、
         五階寬台階（x 73.75～76、|z| ≤ 18，一階 0.18 m）走上 0.9 m 的平台（x 76～82：使用者 10:4x「總圖出來還有個平台 之後才是階梯往下」，兩端白石矮牆）、兩旁花台、北邊的方塔。
         套件的門廊、拱廊柱子（舊外觀）的導航先拿掉，再擋新的。 */
      nav.freeRect(73.7,-30.0,87.2,30.0);
      for(const s of [-1,1]) nav.blockCircle(78.9,s*12.4,0.75);   /* LIB-FRONT v3.1（照片 40）：平台上白石翼拱前的兩棵尖塔形針葉樹（模型在 campus_lib_lawn.glb；要在上一行的 freeRect 之後擋） */
      for(const [x0,z0,x1,z1] of [[76.0,-30.0,82.05,-29.4],[76.0,29.4,82.05,30.0],[73.75,-30.0,76.0,-18.0],[73.75,18.0,76.0,30.0],[81.6,-8.4,82.6,-7.3],[81.6,-3.9,82.6,-2.3],[81.6,2.3,82.6,3.9],[81.6,7.3,82.6,8.4],[82.0,-30.0,82.6,-23.2],[82.0,-20.0,82.6,-13.8],[82.0,-10.6,82.6,-8.4],[82.0,8.4,82.6,10.6],[82.0,13.8,82.6,20.0],[82.0,23.2,82.6,30.0],[82.55,-30.0,86.5,-27.4],[82.55,27.4,86.5,30.0],[86.38,-27.4,87.0,27.4],[87.0,-30.0,113.0,30.0],[82.0,-37.6,87.6,-32.0]]) nav.blockRect((x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,0,0);
      for(const s1 of [{"x0":73.75,"x1":76.0,"z0":-18.0,"z1":18.0,"axis":"x","ya":0.0,"yb":0.9,"tread":0.45,"rise":0.18,"low":"x0"},{"x0":76.0,"x1":86.4,"z0":-29.8,"z1":29.8,"y":0.9}]){ nav.addSurf(s1);   /* 點地面移動打得到的透明地面（平台 0.9 m、台階斜面；和霖澤館穿堂同一套 campusWalk）*/
        const ya=s1.y!==undefined?s1.y:s1.ya, yb=s1.y!==undefined?s1.y:s1.yb, dx=s1.x1-s1.x0; const m=new THREE.Mesh(new THREE.PlaneGeometry(Math.hypot(dx,yb-ya),s1.z1-s1.z0),new THREE.MeshBasicMaterial({visible:false}));
        m.rotation.order='ZYX'; m.rotation.z=Math.atan2(yb-ya,dx); m.rotation.x=-Math.PI/2; m.position.set((s1.x0+s1.x1)/2,(ya+yb)/2+0.01,(s1.z0+s1.z1)/2); m.userData.walkLv=0; m.userData.dyn=true; g.add(m); campusWalk.push(m); }
      { const T=[82.1,0,-37.5,87.5,28,-32.1]; const m=new THREE.Mesh(new THREE.BoxGeometry(T[3]-T[0],T[4]-T[1],T[5]-T[2]),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set((T[0]+T[3])/2,(T[1]+T[4])/2,(T[2]+T[5])/2); g.add(m); E.colliders.push(m); }   /* 方塔的鏡頭碰撞 */
    }
    // ---- 總圖 B1 的下沉中庭（LIB-B1-OUTSIDE-1110；B1C）：程序化 BLOCKOUT＝正式模型（LIB-B1-COURT-ART-1110，LAWWW2 lib_b1_court.glb）載入失敗時的備用 ----
    { const fbg=new THREE.Group(); fbg.name='b1c_fallback'; g.add(fbg); const C=B1C, Y=-C.dep, T=0.3, PH=1.0, cx=(C.x0+C.x1)/2, cz=(C.z0+C.z1)/2, wM=new THREE.MeshStandardMaterial({map:(()=>{ const t=W3.stoneTex('#bfbab0').clone(); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,1.2); t.needsUpdate=true; return t; })(),roughness:0.9});
      const railM=new THREE.MeshStandardMaterial({color:0x3a3d41,roughness:0.45,metalness:0.4}), pv=pavingTex();
      const box=(x0,x1,y0,y1,z0,z1,m,col)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),m); b.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2); b.castShadow=true; b.receiveShadow=true; fbg.add(b); if(col) E.colliders.push(b); return b; };   /* 碰撞盒（col）藏起來照樣擋鏡頭（Raycaster 不看 visible）*/
      { const f=ground(g,C.x1-C.x0,C.z1-C.z0,pv,[(C.x1-C.x0)/3,(C.z1-C.z0)/3],cx,cz,Y); f.userData.dyn=true; fbg.add(f); }   // 中庭地面
      box(C.x0-T,C.x1+T,Y,0,C.z0-T,C.z0,wM,true);                        // 北牆（樓梯靠著它）
      box(C.x1,C.x1+T,Y,0,C.z0-T,C.z1+T,wM,true);                         // 東牆
      box(C.x0-T,C.x0,Y,0,C.st1,C.z1+T,wM,true);                          // 西牆（北邊是樓梯口）
      const D=C.door; box(C.x0-T,D.x-D.w/2,Y,0,C.z1,C.z1+T,wM,true); box(D.x+D.w/2,C.x1+T,Y,0,C.z1,C.z1+T,wM,true); box(D.x-D.w/2,D.x+D.w/2,Y+D.h,0,C.z1,C.z1+T,wM,true);   // 南牆（靠總圖）：中間 B1 的門
      { const dm=new THREE.MeshStandardMaterial({color:0x4b5966,emissive:0x8fa6b8,emissiveIntensity:0.35,roughness:0.15,metalness:0.3,transparent:true,opacity:0.85});   /* 玻璃門透出一點 B1 的燈（晚上看得出是入口；GPU 截圖 L98E_b1court 晚上太暗）*/ box(D.x-D.w/2,D.x+D.w/2,Y,Y+D.h,C.z1+0.12,C.z1+0.18,dm,true); box(D.x-0.03,D.x+0.03,Y,Y+D.h,C.z1+0.1,C.z1+0.2,railM); }   // 玻璃門
      { const lm=new THREE.MeshStandardMaterial({color:0xfff4dc,emissive:0xfff1d6,emissiveIntensity:1.2}); box(D.x-0.35,D.x+0.35,Y+D.h+0.85,Y+D.h+0.95,C.z1-0.18,C.z1,lm); const pl=new THREE.PointLight(0xfff1d6,7,10,2); pl.position.set(D.x,Y+D.h+0.6,C.z1-1.0); g.add(pl); }   // 門上的壁燈（地下中庭晚上很暗）
      { const sg=new THREE.Mesh(new THREE.PlaneGeometry(2.4,0.42),new THREE.MeshBasicMaterial({map:TK.signTex('總圖書館 B1　24 小時自習室',{bg:'#24303a',color:'#f3efe4'})})); sg.position.set(D.x,Y+D.h+0.45,C.z1-0.02); sg.rotation.y=Math.PI; fbg.add(sg); }
      for(let k=0;k<Math.round(C.dep/0.175);k++){ const xa=C.stx-(k+1)*C.tread, xb=C.stx-k*C.tread, top=Y+(k+1)*0.175; if(top>-0.01) continue; box(xa,xb,Y,top,C.st0,C.st1,wM); }   // 台階（畫面上一階一階，和導航 visualHeightAt 同一個算法：低的那端在 stx）
      for(const [x0,x1,z0,z1] of [[C.x0-T,C.x1+T,C.z0-T,C.z0],[C.x1,C.x1+T,C.z0-T,C.z1+T],[C.x0-T,C.x0,C.st1,C.z1+T],[C.x0-T,C.x1+T,C.z1,C.z1+T]]){   // 地面那一圈：石砌矮牆（0.5 m，就是擋土牆往上）＋細的金屬扶手和立柱（樓梯口不擋）
        box(x0,x1,0,0.5,z0,z1,wM); const ax=(x1-x0)>(z1-z0), mx=(x0+x1)/2, mz=(z0+z1)/2, L2=ax?x1-x0:z1-z0;
        box(ax?x0:mx-0.025,ax?x1:mx+0.025,PH-0.05,PH,ax?mz-0.025:z0,ax?mz+0.025:z1,railM);
        for(let u=0.15;u<L2;u+=1.5){ const px=ax?x0+u:mx, pz=ax?mz:z0+u; box(px-0.02,px+0.02,0.5,PH,pz-0.02,pz+0.02,railM); } }
      { const L=C.stx-C.x0, H=C.dep, rail=new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(L,H),0.06,0.06),railM); rail.position.set((C.x0+C.stx)/2,Y+H/2+0.9,C.st1+0.05); rail.rotation.z=-Math.atan2(H,L); fbg.add(rail); for(let x=C.x0+0.6;x<C.stx;x+=1.2){ const yy=-(x-C.x0)/L*H; box(x-0.03,x+0.03,yy,yy+0.9,C.st1+0.02,C.st1+0.08,railM); } }   // 樓梯靠中庭那一側的扶手
      // 導航：中庭地面、樓梯斜面；四周（含地面那一圈）擋住，只留樓梯口、樓梯底
      nav.addSurf({x0:C.x0,x1:C.x1,z0:C.z0,z1:C.z1,y:Y}); nav.addSurf({x0:C.x0,x1:C.stx,z0:C.st0,z1:C.st1,axis:'x',ya:0,yb:Y,tread:C.tread,rise:0.175,low:'x1'});
      nav.blockRect(cx,C.z0-0.35,C.x1-C.x0+1.4,0.7,0); nav.blockRect(cx,C.z1+0.35,C.x1-C.x0+1.4,0.7,0); nav.blockRect(C.x1+0.35,cz,0.7,C.z1-C.z0+1.4,0); nav.blockRect(C.x0-0.35,(C.st1+C.z1)/2+0.35,0.7,C.z1-C.st1+0.7,0);
      nav.blockRect((C.x0+C.stx-0.6)/2,C.st1+0.1,C.stx-0.6-C.x0,0.5,0);   // 樓梯和中庭地面之間（扶手），樓梯底 0.6 m 留開
      /* LIB-B1-COURT-ART-1110（使用者 11-10「總圖b1樓梯 是往地下走到一個中庭 中庭的部分，我現在看不出來」，X307；LAWWW2 帳號 A）：正式模型 lib_b1_court.glb（清水模擋土牆、花崗石地面、樓梯踏面＋扶手＋腳燈、
         B1 的玻璃帷幕＋玻璃門＋雨遮＋招牌、亮著的自習室、種花槽、兩個樹槽、一張石凳）。尺寸照 B1C，導航、門、樓梯不動；樹槽兩個、石凳一張是新的，在這裡加阻擋（座標＝lib_b1_court.json 的 planters、bench）。
         載好以後藏備用的方塊（碰撞盒照舊擋鏡頭）；燈的材質 lbc_lit_* 晚上亮 */
      for(const r of [[102.2,103.9,-32.8,-31.1],[102.2,103.9,-38.9,-37.2],[103.35,103.95,-36.4,-33.8]]) nav.blockRect((r[0]+r[1])/2,(r[2]+r[3])/2,r[1]-r[0],r[3]-r[2],0,0.05);
      if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.lib_b1_court']) ASSETS.loadOne('bldg.lib_b1_court').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true); r.name='lib_b1_court_glb';
        r.traverse(o=>{ if(!o.isMesh) return; o.receiveShadow=true; const mn=(o.material&&o.material.name)||''; o.castShadow=!/^lbc_(lit_|glass|canopy|ivy|cafe_leaf)|^cafe_leaf/.test(mn); if(/^lbc_lit_/.test(mn)&&!o.material.userData.nightReg){ o.material.userData.nightReg=true; if(TK.addNight) TK.addNight(o.material,1.4,0.35);   /* 晚上 1.4、白天 0.35 */ } });
        g.add(r); fbg.visible=false; }).catch(e=>console.warn('總圖 B1 中庭正式模型載入失敗，用備用的方塊',e));
      for(const s1 of [{x0:C.x0,x1:C.x1,z0:C.z0,z1:C.z1,y:Y},{x0:C.x0,x1:C.stx,z0:C.st0,z1:C.st1,ya:0,yb:Y}]){ const ya=s1.y!==undefined?s1.y:s1.ya, yb=s1.y!==undefined?s1.y:s1.yb, dx=s1.x1-s1.x0;   // 點地面移動打得到的透明地面（同總圖台階）
        const m=new THREE.Mesh(new THREE.PlaneGeometry(Math.hypot(dx,yb-ya),s1.z1-s1.z0),new THREE.MeshBasicMaterial({visible:false})); m.rotation.order='ZYX'; m.rotation.z=Math.atan2(yb-ya,dx); m.rotation.x=-Math.PI/2; m.position.set((s1.x0+s1.x1)/2,(ya+yb)/2+0.01,(s1.z0+s1.z1)/2); m.userData.walkLv=0; m.userData.dyn=true; g.add(m); campusWalk.push(m); }
      E.interactables.push({x:D.x,z:C.z1-0.9,radius:1.0,lv:0,label:'進 B1（24 小時自習室）',exit:{to:'library_b1',spawn:Object.assign({},(typeof LIBRARY_B1_LAYOUT!=='undefined'&&LIBRARY_B1_LAYOUT.stairs.spawn)||{x:-20.5,z:-2.4,yaw:Math.PI/2})}});
      E.interactables.push({x:C.x0-1.0,z:(C.st0+C.st1)/2,radius:1.4,lv:0,label:'看樓梯下面',look:'總圖北邊的下沉中庭。樓梯下去是 B1：24 小時自習室、討論室、影印中心。'}); }
    // ---- 小椰林道（x=30，從椰林大道往北通到法學院）：兩排較矮的大王椰子 ----
    for(let z=-14;z>=-70;z-=8){ for(const x of [24.2,35.8]){ if(x>30&&z>-66&&z<-54) continue; const p=PALM(7+((-z*3)%2)); place(g,p,x,z,(-z*0.7)%6.28); nav.blockCircle(x,z,0.45); } }
    // ---- 醉月湖（文學院北邊）----
    const lakeU=lake(g,nav,-36,-112,seats,lamps);   /* 方案 A：原本 (-30,-66)，整組往北搬（湖面、湖岸、湖心亭、木棧道、長椅、路燈、樹叢一起，形狀不變）*/
    const courtGLB=bballCourt(E,g,nav,lamps);   /* 系籃球場（LAWWW2 9428f9f，位置 A 醉月湖東側；2026-10-14）：場地、碰撞、路燈現在放；正式模型等 zone 建好再載（courtGLB(zone)）*/
    ground(g,124,44,W3.grassTex(),[31,11],-70,-106,-0.003);   // 湖北邊的地面（方案 A 之前那裡走不到、種了一排樹遮住地面盡頭；湖搬過來之後樹會長在博雅裡面、小路上，2026-10-13 審查拿掉）
    { const hb=new TK.Bin(); for(let x=-58.6;x<=4.5;x+=1.15) TK.plantClump(hb,x,0,-124.35+((x*7)%2)*0.08,0.9+Math.abs((x*13)%3)*0.06,5,[0.7,0.9,0.66]); hb.build(g); }   /* 方案 A 打開的西北角：北邊界 z=-124 原本只是草地中間一道看不見的牆，種一排矮灌木收邊（導航照舊是 blockOutside）*/
    /* XS-GATE-NORTH-1105：側門內小廣場、步道、體育館門前、停車場的鋪面；停車場的車位線、汽車（美式小車暫代）、機車 */
    { const pv=pavingTex(); const PL=XSG.plaza, PA=XSG.path, PE=XSG.pathE, GP=XSG.gymPlaza;
      /* 鋪面不互相重疊（ground_zfight_unit：同一個高度疊在一起會閃）：步道只鋪小廣場和東西向步道中間那一段；體育館門前從小廣場東邊開始。導航照舊用完整的範圍 */
      for(const r of [PL,[PA[0],PL[3],PA[2],PE[1]],PE,[Math.max(GP[0],PL[2]),GP[1],GP[2],GP[3]]]){ const w=r[2]-r[0], d=r[3]-r[1]; if(w<=0.01||d<=0.01) continue; ground(g,w,d,pv,[w/3,d/3],(r[0]+r[2])/2,(r[1]+r[3])/2,0.012); }
      const P=XSG.park, pw=P[2]-P[0], pd=P[3]-P[1]; ground(g,pw,pd,W3.asphaltTex(),[pw/8,pd/8],(P[0]+P[2])/2,(P[1]+P[3])/2,0.011).material.map.userData.asphalt=true;
      const lb=new TK.Bin(), lw=TK.col('#ecebe4'); for(let i=0;i<=7;i++){ const x=P[0]+1.2+i*2.6; lb.add(lw,TK.boxG(0.12,0.01,5.0),x,0.02,P[1]+2.7); lb.add(lw,TK.boxG(0.12,0.01,5.0),x,0.02,P[3]-2.7); } lb.build(g);   /* 南北兩排車位（2.6 × 5 m），車道在中間 */
      XSG.cars=[]; for(let i=0;i<7;i++){ const x=P[0]+2.5+i*2.6; if(i!==2) XSG.cars.push({x,z:P[1]+2.7,ry:Math.PI,kind:['car_sedan','car_hatch','car_suv'][i%3]}); if(i%2===0) XSG.cars.push({x,z:P[3]-2.7,ry:0,kind:['car_hatch','car_sedan','car_minivan'][(i/2)%3]}); }
      /* 停著的車、機車的導航阻擋在 xsGateNav（停車場是後面才開出來的）；北排第 3 格空著＝開車出發的那一台的位置（XSG.carSpot）*/
      XSG.carSpot={x:P[0]+2.5+2*2.6,z:P[1]+2.7,ry:Math.PI,stand:{x:P[0]+2.5+2*2.6+1.6,z:P[1]+5.8}};
      if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.us_cars']) ASSETS.loadOne('bldg.us_cars').then(c=>{ if(!c||!c.scene||(typeof zone!=='undefined'&&E.zone!==zone)) return; const src=c.scene;
        const grp=new THREE.Group(); grp.name='xs_park_cars'; const prep=nd=>{ const q=nd.clone(true); q.position.set(0,0,0); q.rotation.set(0,0,0); q.traverse(r=>{ if(r.isMesh) r.castShadow=false; }); return q; };
        for(const k of XSG.cars){ const node=src.getObjectByName(k.kind); if(!node) continue; const low=src.getObjectByName(k.kind+'_lod1'); let q; if(low){ q=new THREE.LOD(); q.addLevel(prep(node),0); q.addLevel(prep(low),25); } else q=prep(node);
          q.position.set(k.x,0,k.z); q.rotation.set(0,k.ry,0); grp.add(q); } g.add(grp); }).catch(e=>console.warn('新南停車場的車載入失敗',e));   /* 美式汽車（us_cars.glb，沒有車牌、廠牌）暫代；車頭朝 +z、離鏡頭 25 m 換低面數 */
      for(let i=0;i<9;i++){ const sc=TK.scooter(['#d8d8d4','#3c4a5e','#8a2f2a','#e6e2d6'][i%4]); sc.position.set(P[0]+1.2,0,P[1]+6.6+i*0.9); g.add(sc); } XSG.moto=[P[0]+1.2,P[1]+6.6+3.6,1.9,8.6];   /* 西牆邊一排機車（TK.scooter，和校園其他地方同一款）*/ }
    // ---- 法學院區（東北上方）：霖澤館 ＋ 萬才館 ＋ 社科院 ----
    const BF2=typeof BLACKFOREST_LAYOUT!=='undefined'&&BLACKFOREST_LAYOUT.version>=2;   /* 黑森林第二版（使用者 11-02 21:3x 實景照片＋官方地圖：兩館之間的走道經過小湖，湖再往校園是一大片樹林）*/
    if(BF2){ ground(g,37,22,pavingTex(),[37/3,22/3],43.5,-95,0.012); if(LR){ const ap=WCW(1.5,19.5); const m=ground(g,22,15,pavingTex(),[22/3,15/3],ap[0],ap[1],0.012); m.rotation.z=WRY; } else ground(g,35,9,pavingTex(),[35/3,9/3],79.5,-101.5,0.012);   /* 重排：萬才館大樓梯、陽台下一樓入口前的鋪面 x 81.5～101.5、z −88～−75 */   /* 霖澤館前庭（劇情的「法學院廣場」：站位 (50,−93)、(58,−90)、事件 (61,−94)）＋兩館正面一條；其餘是小湖和黑森林 */
      strip(g,30,-70,30,-84,10,pavingTex(),3);
      for(const pth of BLACKFOREST_LAYOUT.paths) if(pth.kind==='paved') for(let i=0;i<pth.pts.length-1;i++){ const a=pth.pts[i], b=pth.pts[i+1]; strip(g,a[0],a[1],b[0],b[1],pth.w,pavingTex(),3); } }   /* 兩館之間往南的走道（3 m）、往萬才館的路（4 m）*/
    else { ground(g,72,24,pavingTex(),[24,8],61,-94,0.012); strip(g,30,-70,30,-84,10,pavingTex(),3); strip(g,92.5,(typeof BLACKFOREST_LAYOUT!=='undefined')?-78.6:-64,92.5,-84,4,pavingTex(),3); }   /* CAMPUS-BLACKFOREST-1102：z −78.6 以南是黑森林的土徑（配置 paths.wancai），地磚只留廣場那一段 */   /* 第二十四批：萬才館的互動點改到陽台下面的一樓入口（x≈93.8），小路跟著移；4 m 寬，不碰到社科院前 x=96 的白柱 */
    // 法學院前庭：樹列、花圃、矮籬
    for(const x of (BF2?[22]:[22,38,54,70,86])){ const b=TREE(1.15+((x/16)%2)*0.1); place(g,b,x,-80,x*0.4); nav.blockCircle(x,-80,0.9); }   /* 黑森林第二版：x 38～86 那幾棵在森林裡（森林自己的樹）*/
    for(const x of (BF2?[30,46]:[30,46,62,88])){ const pl=W3.planter(); place(g,pl,x,-83.5,0); nav.blockRect(x,-83.5,1.2,0.5,0); }   /* 黑森林第二版：62 在走道上、88 在森林裡 */   /* 第十九批：x=78 的花圃會擋在往萬才館的新小路上，移到 88 */
    for(const x of (LR?[12]:[12,100])){ const t=TREE(1.3); place(g,t,x,-96,0); nav.blockCircle(x,-96,0.9); const t2=TREE(1.0); place(g,t2,x+(x<50?-6:6),-108,1); nav.blockCircle(x+(x<50?-6:6),-108,0.8); }
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
    const wancai=CK.lawhall({entry:'stairs',w:30,d:20,floors:9,entryX:-1,brick:'#b06a4a',winBox:true,roofFrame:true}); ckPlace(wancai,WCX,WCZ,WRY); buildings.push(wancai); wancai.userData.dyn=true;   /* 萬才館第二階段：正式外觀（Blender）載入後要能把套件的外觀藏起來，不參加整區靜態合併 */   /* 一樓入口（陽台下）：x=88+doorX≈93.8、z=-112+doorZ≈-100.75；弧形量體 x 70.5–83.5、z -102–-95.5；樓梯 x 約 83–91、z -98–-90.5 */
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
      { const hall=CK.hall({w:44,d:20,floors:4,gfh:4.4,fh:3.85,wall:'#9b4f3c',trim:'#d6cdbb',roofType:'flat',arcade:false,sign:'電機二館'}); ckPlace(hall,LR?119:112,-62,-Math.PI/2); buildings.push(hall); }   /* NTU-REF-1110 套件五棟（LAWWW2 帳號 A；X223／D136）：官網是長條的紅磚樓、拱窗 → 紅磚、拱窗、平屋頂；不照抄山牆、大拱門 */   /* CAMPUS-RELAYOUT-1102（使用者 11-02 09:03「舊的那棟要叫什麼」）：官方地圖總圖東北邊的電機二館 */
    } else {   /* 舊外觀（manifest 沒有新模型時）*/
      const soc=CK.modern({w:56,d:22,floors:4,gfh:4.4,fh:3.85,sign:'社會科學院'}); ckPlace(soc,110,-70,-Math.PI/2); buildings.push(soc);
      socGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_modern']; soc.userData.ckTag='soc'; if(socGLB) soc.userData.dyn=true;
      for(let i=0;i<7;i++){ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.35,7,10),M('#f4f1ea')); col.position.set(96,3.5,-90+i*6); g.add(col); const cap=new THREE.Mesh(new THREE.CylinderGeometry(1.6,0.6,0.8,10),M('#f4f1ea')); cap.position.set(96,7.2,-90+i*6); g.add(cap); nav.blockCircle(96,-90+i*6,0.5); } }
    // 法學院廣場：長椅、腳踏車、樹、公告欄、販賣機
    for(const x of (BF2?[40]:[40,70])){ const b=BENCH(); place(g,b,x,-88,0); nav.blockRect(x,-88,1.4,0.7,0); seats.push({x,z:-87.94,yaw:0,label:'坐在法律系館A前的長椅'}); }
    if(BF2&&LR){ const b=BENCH(); place(g,b,58,-85.5,0); nav.blockRect(58,-85.5,1.4,0.7,0); seats.push({x:58,z:-85.44,yaw:0,label:'坐在小湖邊的長椅'}); }   /* 重排：小湖在前庭南邊，長椅在前庭南緣面向小湖（往南）*/
    else if(BF2){ const b=BENCH(); place(g,b,61.4,-88,Math.PI/2); nav.blockRect(61.4,-88,0.7,1.4,0); seats.push({x:61.46,z:-88,yaw:Math.PI/2,label:'坐在小湖邊的長椅'}); }   /* 第二版：(70,−88) 那張在小湖裡，搬到走道西邊、面向小湖（往東）*/
    
    { const r=parkedRack(9); place(g,r,58,-102,0); nav.blockRect(58,-102,6,1.4,0); const r2=parkedRack(6); place(g,r2,10,-100,0); nav.blockRect(10,-100,4,1.4,0); }
    { const bb=W3.bulletin(); place(g,bb,16.6,-100.6,0); nav.blockRect(16.6,-100.6,2.6,0.4,0); /* v9.3 第十九批：原本掛在霖澤館一樓拱廊的內牆上；新的霖澤館沒有拱廊、正面整排是台階，移到台階西端外面的鋪面上 */ const v=W3.vending(); place(g,v,13.5,-107.5,-Math.PI/2); nav.blockRect(13.5,-107.5,0.9,1.2,0); /* 靠霖澤館西側牆（舊位置一半埋在建築轉角裡）*/ }
    for(const [x,z] of [[30,-86],[62,-86],WCW(9.2,15.5),[51,-100.5],LR?[67.2,-99]:[69,-98.5]]){ /* 後兩盞原本在 (46,-108)、(76,-108)：埋在霖澤館、萬才館的牆裡，第十九批移到門前；(94,-86) 第二十四批移到萬才館一樓入口東側 (97.2,-96.5)：原本擋在往入口的路線中間（照亮入口）*/ const l=W3.lampPost(); place(g,l,x,z,Math.PI/2); lamps.push(l); nav.blockCircle(x,z,0.5); }
    const BFL0=typeof BLACKFOREST_LAYOUT!=='undefined';   /* 黑森林的配置有載入（CAMPUS-BLACKFOREST-1102）*/
    for(const [x,z] of [...(SOCX?[]:[[8,-70],[8,-50],[0,-56]]),...(BFL0?[]:[[52,-50]]),[-54,-19],[-5,-16],[40,-20],[-95,-12],[-62,-56],[-96,24],[-82,31],[-68,24],LIBF?[75,-41]:[78,-38],...(BFL0&&LIBF?[]:[LIBF?[68.5,-45]:[64,-44]])]){   /* CAMPUS-BLACKFOREST-1102：(52,−50)、(68.5,−45) 在黑森林南塊裡面——黑森林的樹照配置放（土徑 s1 原本會穿過 (52,−50) 這棵）*/   /* 第十八批拿掉：(8,-30)、(20,-20)、(52,-30)、(66,-28)（新系館的位置）、(-10,18)、(10,18)、(50,18)（換成大道南側的大樹牆）；X75：(8,-70)、(8,-50)、(0,-56) 在社科院的新位置裡面 */ const b=TREE(1+((x+z)%3)*0.2); place(g,b,x,z,(x+z)*0.3); nav.blockCircle(x,z,0.8); }
    // 花圃
    for(const x of [-64,-48]){ const p=W3.planter(); place(g,p,x,-13,0); nav.blockRect(x,-13,1.2,0.5,0); }
    /* 社團博覽會（AA_110 6-8 (b)；activities.js 的 club_expo_y1s1：新局 9/6、舊局 9/30、10/1，CLUBFAIR-REAL-1027）那幾天：LAWWW2 479b7fc 的九頂帳篷（clubFair），原本的招生攤位、公告欄收起來 */
    const fairDay=isFairDay();
    // 法律服務社的招生攤位：摺疊桌、布條、傳單。LAWCLUB-BOOTH-MOVE-1110（使用者 11-10 對 LAWWW-B：「法服徵人 到底為何不在法律系館前? 為什麼在校園中間」，X294；LAWWW2 帳號 A）：
    // 原本在晨思鐘廣場東側 (−18, 14.5)、面向椰影大道，搬到法學院廣場（法律系館A前庭）靠小椰林道進來的那一頭 (34.5, −90.2)，正面朝南（從校園走過來的人看得到布條），互動點在攤位南邊 1 m
    if(!fairDay){ const SX=34.5, SZ=-90.2; const st=new THREE.Group(); const tb=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.05,0.7),M('#e8e2d6')); tb.position.set(0,0.74,0); st.add(tb); for(const [sx,sz] of [[-0.8,-0.25],[0.8,-0.25],[-0.8,0.25],[0.8,0.25]]){ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.72,0.04),M('#3a3f46')); leg.position.set(sx,0.36,sz); st.add(leg); } const cloth=new THREE.Mesh(new THREE.BoxGeometry(1.85,0.6,0.02),M('#2f5d50')); cloth.position.set(0,0.42,0.36); st.add(cloth); const banner=W3.signPlane('法律服務社 招生中 ・ 免費法律諮詢',1.8,0.5,{color:'#ffffff',size:40}); banner.position.set(0,0.42,0.38); st.add(banner); const fly=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.02,0.42),M('#ffffff')); fly.position.set(-0.4,0.78,0); st.add(fly); st.position.set(SX,0,SZ); st.rotation.y=0; g.add(st); nav.blockRect(SX,SZ,1.9,0.8,0,0.1); E.interactables.push({x:SX,z:SZ+1,radius:1.5,label:'看法律服務社的招生攤位',notice:'lawclub'}); }
    // 社團博覽會的公告欄（AA_110 6-8 (b)，AA 暫定：用現有的公告欄，不另做攤位）：平常是一塊公告欄；9/30、10/1 11:00–17:00 前面是「社團博覽會」的集合點
    // （activities.js 的 club_expo_y1s1，spot (-13.5,13.6)；classes3d.js 的 fairMenu）。LAWWW2 的攤位做好以後原地換掉，位置不變
    if(!fairDay){ const bb=W3.bulletin(); place(g,bb,-13.5,14.6,Math.PI); nav.blockRect(-13.5,14.6,2.6,0.4,0); }
    const fairGLB=fairDay?(isExpoDay()&&typeof CLUB_FAIR_EXPO!=='undefined'?clubFairExpo(E,g,nav):clubFair(E,g,nav)):null;   /* 博覽會的帳篷：位置、碰撞現在放；正式模型等 zone 建好再載。社博那天（大一、大二）＝椰林大道兩邊 36 頂＋舞台（clubFairExpo）；校慶、舊序章那一年＝九頂那一排 */
    // 路旁散置腳踏車
    for(const [x,z] of [[-60,-15.5],[-57,15.5],[0,-15.5],[24,-64],[36,-64]]){ const b=parkedBike(['#3a6fb0','#8c3b47','#2f5d50','#e0b95b'][(x+z)&3],x*7+z,null,1.7); place(g,b,x,z,Math.PI/2); nav.blockRect(x,z,1.7,0.6,0); }   /* v9.3 第十八批：車子沿 x 方向停，導航原本擋成沿 z 方向（走得過車頭車尾、旁邊空地反而不能走）*/
    // ---- v9.3 第十八批：校園加密 ----
    // 真實的椰林大道兩側幾乎整排都是系館（離大道 20–30 m、前面是草地）；原本這裡大道東半段兩側、行政大樓東邊、男一舍兩側都是空草地。
    // 補上沒有掛名字的系館（不冒用真實系館的名字和位置），同一套校園套件語彙：紅磚／面磚、一樓拱廊、拱窗或方窗
    { const fill=[
        [CK.hall({w:26,d:14,floors:4,gfh:4.4,fh:3.6,wall:'#c8a27c',trim:'#e6dfd0',roofType:'flat',win:'rect',arcade:false,stairTower:{w:4.2,d:2.4},sign:'土木工程館'}),7,-28,0],   /* NTU-REF-1110：官網是平屋頂、4 層、中間一座玻璃樓梯塔 → 拿掉一樓拱廊和斜屋頂（方正的大門改成塔一樓的玻璃門）*/          // 大道北側、文學院東邊
        [CK.hall({w:LIBF?23:28,d:16,floors:4,gfh:4.4,fh:3.6,wall:'#e8e4da',trim:'#f3f0e9',roofType:'flat',win:'rect',topArch:true,arcade:true,porch:{bays:3,depth:2.6,style:'flat'},sign:'圖書資訊學系館'})   /* NTU-REF-1110：官網是白色、頂層拱形窗 */,LIBF?51.5:57,-34,0],   // 大道北側、小椰林道東邊（LIB-FRONT-1102：總圖前的廣場 x 63.5～73.75、|z| ≤ 30，原本 x 43～71 壓到廣場西北角 → 23 m 寬、中心 x 51.5：x 40～63）
        [CK.hall({w:34,d:14,floors:5,gfh:4.2,fh:3.5,wall:'#9a5040',trim:'#b8b3aa',roofType:'flat',win:'rect',arcade:true,porch:{bays:3,depth:2.6,style:'flat'},sign:'農業綜合大樓'}),45,33,Math.PI],   /* NTU-REF-1110：官網是紅磚＋花崗石帶、5 層（樓層腰帶、勒腳用花崗石的灰） */   // 大道南側、往宿舍的路東邊
        [CK.hall({w:30,d:13,floors:5,gfh:3.6,fh:3.1,wall:'#bfb5a3',trim:'#e4ddd0',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4}}),-34,68,Math.PI],   // 舟山路南側、宿舍區
        [CK.hall({w:30,d:13,floors:5,gfh:3.6,fh:3.1,wall:'#c9b49a',trim:'#e8e2d6',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4}}),74,68,Math.PI],
];   // 第二十批的「舟山路西段南側」(-92,66) 2026-10-13 換成大一女舍（見行政大樓後面的大一女舍那一段）
      for(const [b,x,z,ry] of fill){ ckPlace(b,x,z,ry); buildings.push(b); }
      /* XS-GATE-NORTH-1105：望月台（正門朝東、對著側門內的小廣場）、體育館（正門朝南）。套件暫代，正式模型之後用 Blender 做（先將就）。
         舊的東南角 (74, 68) 那棟本來就是沒有名字的系館（體育館的門口是 classes3d 的互動點），照舊 */
      { const R=XSG.moon, moon=CK.modern({w:R[3]-R[1],d:R[2]-R[0],floors:2,gfh:4.2,fh:3.6,wall:'#efece4',slab:'#c9c6bd',sign:'望月台'}); moon.userData.ckTag='moon';
        ckPlace(moon,(R[0]+R[2])/2,(R[1]+R[3])/2,Math.PI/2); buildings.push(moon);
        const Gy=XSG.gym, gym=CK.modern({w:Gy[2]-Gy[0],d:Gy[3]-Gy[1],floors:4,gfh:5.0,fh:4.4,wall:'#d8d4ca',slab:'#a9aba6',sign:'體育館'}); gym.userData.ckTag='gym_ext';
        ckPlace(gym,(Gy[0]+Gy[2])/2,(Gy[1]+Gy[3])/2,0); buildings.push(gym);
        for(const [b,key,name] of [[moon,'bldg.campus_moon','campus_moon_glb'],[gym,'bldg.campus_gymext','campus_gymext_glb']]) if(typeof ASSETS!=='undefined'&&ASSETS.manifest[key]){ b.userData.dyn=true;
          ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||(typeof zone!=='undefined'&&E.zone!==zone)) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag',name,b.userData.ckTag); }).catch(e=>console.warn(name+' 正式模型載入失敗，用套件的外觀',e)); } }   /* XS-NORTH-EXT-1105：Blender 正式外觀（tools/blender/env_second/campus_xsnorth.py），載入後藏起同 ckTag 的套件 */
      // 系館前的樹列、大道外側的樹、宿舍區與校園邊緣的樹帶（擋住草地直接接到遠景的盡頭）
      const rows=[
        [-104,36],[-90,41],[-76,38],[-100,16],[-112,26]].concat(lawnGLB?[]:[[74,-12],[78,14]]).concat([[68,26],   /* X133：有總圖前草皮時，(74,−12)、(78,14) 在草皮上，換成老樟樹、南側的樹 */
        [-60,58],[-12,60],[54,58],[93,60],[104,66]]);
      for(let x=-116;x<=116;x+=11){ if(x>-52&&x<-16) continue; if(x>-4&&x<44) continue; if(x>56&&x<92) continue; rows.push([x,80]); }
      for(let z=-30;z<=40;z+=10){ rows.push([121,z+((z*7)%3)]); }   /* 總圖東邊；社科院在 z<-42 */
      for(const [x,z] of rows){ const t=TREE(1+((Math.abs(x*3+z))%4)*0.12); place(g,t,x,z,(x+z)*0.37); nav.blockCircle(x,z,0.8); }
      // 大道兩側的大樹牆：椰子樹列後面（z=±17.5），約 6 m 一棵、高 11–13 m（樹冠相連）；路口、門口、停車架、傅鐘廣場、社團攤位留空。整排合成一個網格（一側 2 個 draw call）
      // 第二十三批（照片：椰子樹後面是一整片連在一起的深綠樹冠，幾乎看不到後面的系館）：樹冠加寬、葉色調深（AVE_TREE）；樹幹位置不動，地面的路口、車架、系館門口照樣看得到、走得到
      for(const side of [-1,1]){ const skip=side<0?[[-116,-111],[-84,-70],[-85,-79],[-53,-47],[-46,-30],[-21,-15],[-15,-9],[-7,2],[2,12],[11,17],[23,37],[37,43],[43,50.5],[50,64]]:[[-116,-111],[-53,-23],[-22,-14],gtGLB?[-12,16]:[-2,6],[16,24],[39,51]];   /* 共同教學館有正式模型時，前面的 4 棵換成模型裡的蒲葵 */
        const rowG=new THREE.Group(); let k=0; for(let x=-108;x<=66;x+=6){ const jx=x+((x*13)%5)*0.35; if(skip.some(([a,b])=>jx>a&&jx<b)) continue; k++; const t=TK.tree(6.4*(1.75+((k*7)%4)*0.1),k+(side>0?50:0),AVE_TREE); t.position.set(jx,0,side*(17.5+((k*5)%3)*0.5)); t.rotation.y=k*1.3; rowG.add(t); nav.blockCircle(t.position.x,t.position.z,0.8); }
        g.add(W3.mergeGroup(rowG)); }   /* 北側 [43,50.5]：(49.4,-17.8) 那棵和停車架 (46,-16) 東端之間會留一道比人窄的縫（nav_islands 的孤島，第二十批拿掉）*/
      // 系館門口的腳踏車架（台大的系館前面一定停滿腳踏車）
      for(const [x,z,ry] of [[-6,24,0],[12,24,0],[33,24,0],[57,24,0],[-1,-17.2,Math.PI],[46,-23.5,Math.PI],[68,-23.5,Math.PI]]){ const r=parkedRack(7); place(g,r,x,z,ry); nav.blockRect(x,z,4.6,1.6,0); }
      for(const [x,z,ry] of BIKE_RACKS.campus){ const r=parkedRack(7); place(g,r,x,z,ry); nav.blockRect(x,z,4.6,1.6,-ry); }   /* BIKE-PARK-1104：blockRect 的旋轉方向和 rotation.y 相反（萬才館那一座不是 0／90°）*/ }
    // ---- v9.3 第二十批：校園邊界外的背景（走不到，只有畫面；不加導航）----
    // 原本地面在 x=±130、z=-128／+85 就結束：轉鏡頭會看到地面盡頭直接接天空，校門外只有一小塊草地。
    // 西（校門外）：照公館區域的實際配置換算座標（公館 (gx,gz) → 校園 (x=-170-gz, z=gx)）——北側人行道、羅斯福路車道線、南側人行道、
    //   對面整排騎樓街屋（寬度、樓層數和公館區域那一排相同）、捷運出口、路燈、行道樹、機車；後面第二排較高的大樓。
    // 北（法學院後面）：中庭與樹、一棟沒有名字的系館（從霖澤館的穿堂看得到）、校園圍牆、馬路、對面兩排公寓。
    // 東（總圖、社科院後面）：樹帶、遠景系館、再遠一排城市大樓；南（宿舍後面）：校內道路、遠景宿舍、城市大樓。系館都不掛名字（不冒用真實建築）。
    { const far=new THREE.Group(); far.name='campusBackdrop';
      /* 辛亥路（LAW-RELAYOUT-1102 補充，BB 驗收條件；官方地圖 docs/art-rebuild/second_ai/wip/law_relayout_r2/map_law_xinhai_curve.jpg）：校園北側筆直（中線 z −156），
         過了霖澤館往東南彎（三段），順著萬才館的長軸（萬才館照地圖順著辛亥路斜放 42°）。SE 段的校園側圍牆＝萬才館背後那塊導航阻擋的邊（萬才館本地 z −23.3），
         所以路中線＝本地 z −38.5（路半寬 11＋人行道 4＋圍牆 0.4）。彎道半徑 60 m。全部是走不到的背景（導航不變）。舊配置（!LR）照舊一條直路。
         XH.T1＝彎道起點（直路在這裡結束）、XH.pts＝彎道＋東南段的中線點、XH.dist(x,z)＝到這一段中線的距離（擺背景房子時避開馬路） */
      const XH=(()=>{ const cz=-156; if(!LR) return {T1x:262,pts:[],dist:()=>1e9,on:false};
        const Q=WCW(0,-38.5), dx=Math.cos(WRY), dz=-Math.sin(WRY), th=Math.atan2(dz,dx), t=(cz-Q[1])/dz, K=[Q[0]+t*dx,cz], R=60, L=R*Math.tan(th/2), T1x=K[0]-L, C=[T1x,cz+R];
        const pts=[]; for(let i=0;i<=14;i++){ const a=th*i/14; pts.push([C[0]+R*Math.sin(a),C[1]-R*Math.cos(a)]); }
        const T2=pts[pts.length-1]; for(let k=8;k<=232;k+=8) pts.push([T2[0]+dx*k,T2[1]+dz*k]);
        const dist=(x,z)=>{ let m=1e9; for(let i=0;i+1<pts.length;i++){ const a=pts[i], b=pts[i+1], ux=b[0]-a[0], uz=b[1]-a[1], l2=ux*ux+uz*uz, q=Math.max(0,Math.min(1,((x-a[0])*ux+(z-a[1])*uz)/l2)); m=Math.min(m,Math.hypot(x-a[0]-q*ux,z-a[1]-q*uz)); } return m; };
        return {T1x,pts,dist,on:true,dir:[dx,dz]}; })();
      /* 沿著中線的帶子（一個材質一個網格）：o0～o1＝離中線的距離（正＝校園那一側）；v 照長度、u 照寬度（貼圖一格 rep m）*/
      const ribbon=(o0,o1,mat,rep,y,dash)=>{ const P=XH.pts, pos=[], uv=[]; let s0=0;
        const nrm=i=>{ const a=P[Math.max(0,i-1)], b=P[Math.min(P.length-1,i+1)], ux=b[0]-a[0], uz=b[1]-a[1], l=Math.hypot(ux,uz)||1; return [-uz/l,ux/l]; };
        for(let i=0;i+1<P.length;i++){ const a=P[i], b=P[i+1], na=nrm(i), nb=nrm(i+1), sl=Math.hypot(b[0]-a[0],b[1]-a[1]);
          const segs=dash?Math.max(1,Math.round(sl/dash)):1;
          for(let k=0;k<segs;k++){ const f0=k/segs, f1=dash?(k+0.5)/segs:(k+1)/segs;
            const at=(f,o)=>{ const x=a[0]+(b[0]-a[0])*f, z=a[1]+(b[1]-a[1])*f, nx=na[0]+(nb[0]-na[0])*f, nz=na[1]+(nb[1]-na[1])*f, nl=Math.hypot(nx,nz)||1; return [x+nx/nl*o,z+nz/nl*o]; };
            const A=at(f0,o0), B=at(f0,o1), Cc=at(f1,o1), D=at(f1,o0), v0=(s0+sl*f0)/rep, v1=(s0+sl*f1)/rep, u0=o0/rep, u1=o1/rep;
            pos.push(A[0],y,A[1], Cc[0],y,Cc[1], D[0],y,D[1], A[0],y,A[1], B[0],y,B[1], Cc[0],y,Cc[1]); uv.push(u0,v0, u1,v1, u0,v1, u0,v0, u1,v0, u1,v1); }   /* 繞的方向讓法線朝上（反了從上面看不到）*/
          s0+=sl; }
        const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.computeVertexNormals();
        const m=new THREE.Mesh(geo,mat); m.receiveShadow=true; return m; };
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
      { const xw=XH.T1x+260, xc=(XH.T1x-260)/2; ground(far,xw,4,stoneT,[xw/4,1],xc,-143,0.012); ground(far,xw,4,stoneT,[xw/4,1],xc,-169,0.012); }   // 北：馬路兩側人行道（辛亥路往東南彎以前）
      if(XH.on){ const at=W3.asphaltTex().clone(); at.needsUpdate=true; at.wrapS=at.wrapT=THREE.RepeatWrapping; const am=texMat(at); const road=ribbon(-11,11,am,5,0.008); road.name='xinhai_curve_road';   /* y 0.008：和其他馬路、人行道一樣是鋪在城市柏油上面的窄條（不算整片地面；y −0.02 會和外圍打底的柏油重疊，campus_backdrop_ground_unit）*/ far.add(road);   // 辛亥路彎道＋東南段：柏油（直路那一段是底下的城市柏油）
        const st=stoneT.clone(); st.needsUpdate=true; st.wrapS=st.wrapT=THREE.RepeatWrapping; const sm=texMat(st); far.add(ribbon(11,15,sm,4,0.012)); far.add(ribbon(-15,-11,sm,4,0.012)); }
      strip(far,-130,93,200,93,8,W3.asphaltTex(),6);                // 南：校內道路
      // 車道線（一個合併網格）：西＝羅斯福路（公館區域同樣的四條）、北＝馬路（白虛線＋雙黃線）
      { const lt=W3.canvasTex('laneFull',8,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(255,255,255,0.85)'; x.fillRect(0,0,w,120); }).clone(); lt.needsUpdate=true; lt.repeat.set(1,74);   /* 公館區域的 lane 貼圖線寬只有 5 cm，遠看看不到：背景用整條寬的虛線 */
        const lm=new THREE.MeshStandardMaterial({map:lt,transparent:true,roughness:0.8}), yl=new THREE.MeshStandardMaterial({color:0xd9a521,roughness:0.8}); const lg=new THREE.Group();
        for(const lx of [-145,-151,-162,-168]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(0.15,295),lm); m.rotation.x=-Math.PI/2; m.position.set(lx,0.018,2.5); lg.add(m); }
        { const zb=zebraMesh(34.2,12); zb.name='zebra_campus_gate'; zb.position.set(-156.5,0.05,0); far.add(zb); }   /* GG-ZEBRA-1104：校門外過羅斯福路的斑馬線（和公館區域同一條） */
        const LW=XH.T1x+260, LX=(XH.T1x-260)/2;   /* 直路那一段的車道線（辛亥路往東南彎以前）*/
        for(const lz of [-150.5,-161.5]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(0.15,LW),lm); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(LX,0.018,lz); lg.add(m); }
        for(const lz of [-155.8,-156.2]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(0.2,LW),yl); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(LX,0.018,lz); lg.add(m); }
        if(XH.on){ const wl=new THREE.MeshStandardMaterial({color:0xe6e6e0,roughness:0.8}); for(const o of [-5.5,5.5]) lg.add(ribbon(o-0.075,o+0.075,wl,1,0.018,6)); for(const o of [-0.2,0.2]) lg.add(ribbon(o-0.1,o+0.1,yl,1,0.018)); }   // 彎道：白虛線（6 m 一段、畫一半）＋雙黃線
        const mg=W3.mergeGroup(lg); mg.traverse(m=>{ if(m.isMesh){ m.castShadow=false; } }); far.add(mg); }
      /* XS-GATE-NORTH-1105：北牆外的路口——新生南路（側門前那一段＋往北那一段）、辛亥路（路口以東）；斑馬線：側門前、路口西側；路名牌（綠底白字，和溫州街巷口同一款）*/
      { for(const zx of [XSG.x,XSG.xh-9]){ const zb=zebraMesh(22,5); zb.name='zebra_xs_north'; zb.rotation.z=Math.PI/2; zb.position.set(zx,0.05,-156); far.add(zb); }
        { const zb=zebraMesh(16,4); zb.name='zebra_xs_branch'; zb.position.set(XSG.xh,0.05,-169); far.add(zb); }   /* XS-NORTH-ROAD-1107：12 → 16 m，和往北那一段的車道一樣寬 */
        const pole=(x,z,names)=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,3.0,8),M('#7d8288')); p.position.set(x,1.5,z); far.add(p);
          names.forEach(([t,ry],k)=>{ const st=TK.signTex(t,{bg:'#2f6b4f',color:'#ffffff',size:80}); for(const f of [0,Math.PI]){ const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.3),new THREE.MeshStandardMaterial({map:st,roughness:0.6})); sg.position.set(x+Math.sin(ry)*0.62,2.85-k*0.36,z+Math.cos(ry)*0.62); sg.rotation.y=ry+Math.PI/2+f; far.add(sg); } }); };
        pole(XSG.x+3.8,-143.2,[['新生南路',Math.PI/2]]); pole(XSG.xh+7.2,-143.2,[['辛亥路',Math.PI/2],['新生南路',0]]); }
      /* XS-NORTH-ROAD-1107（LAWWW2-B 2026-11-07；XS-GATE-NORTH-1105 先將就第 6 點「往北那一段只是把對面的房子空出來，路面是城市底色的柏油，沒有車道線、分隔島、行道樹」）：
         路口往北（z −167 → −262）：16 m 車道（兩向各兩線 3.5 m）＋中間 2 m 分隔島（新生南路蓋在瑠公圳上，中間一長條綠帶）＋兩側 3 m 人行道；
         兩排房子空出來的寬度 ±7 → ±11 m（下面 city 那一段）；z −214 以北補兩排面向這條路的房子（不然路直直通到空地）；分隔島的行道樹、兩側路燈在下面 props／trees 那一段（一起合併）。
         只是遠景：北牆外本來就走不到（nav.blockOutside），導航不動。 */
      { const X=XSG.xh, Z0=-167, Z1=-262, L=Z0-Z1, zc=(Z0+Z1)/2;
        const at=W3.asphaltTex().clone(); at.needsUpdate=true; at.wrapS=at.wrapT=THREE.RepeatWrapping; at.repeat.set(16/5,L/5);
        const road=new THREE.Mesh(new THREE.PlaneGeometry(16,L),texMat(at)); road.rotation.x=-Math.PI/2; road.position.set(X,0.016,zc); road.receiveShadow=true; road.name='xs_north_branch_road'; far.add(road);   /* y 0.016：蓋過路口北側那一條人行道（0.012）——路口不是人行道 */
        for(const sd of [-1,1]){ const sw=ground(far,3,L-4,stoneT,[0.75,(L-4)/4],X+sd*9.5,zc-2,0.012); if(sw) sw.name='xs_north_branch_walk'; }   // 兩側人行道（從路口北側那一條人行道往北接）
        const cm=new THREE.Mesh(new THREE.BoxGeometry(2,0.2,L-6),M('#a9a59c')); cm.position.set(X,0.1,zc-3); cm.name='xs_north_branch_median'; far.add(cm);   // 分隔島的緣石（路口那一頭留 6 m 給斑馬線）
        { const gt=W3.grassTex().clone(); gt.needsUpdate=true; gt.wrapS=gt.wrapT=THREE.RepeatWrapping; gt.repeat.set(0.5,(L-6.3)/3);
          const gm=new THREE.Mesh(new THREE.PlaneGeometry(1.7,L-6.3),new THREE.MeshStandardMaterial({map:gt,roughness:0.95})); gm.rotation.x=-Math.PI/2; gm.position.set(X,0.205,zc-3); gm.receiveShadow=true; far.add(gm); }   // 分隔島上的草
        const lg=new THREE.Group(), wl=new THREE.MeshStandardMaterial({color:0xe6e6e0,roughness:0.8});
        for(const sd of [-1,1]){ for(let z=Z0-8;z>Z1+2;z-=8){ const d=new THREE.Mesh(new THREE.PlaneGeometry(0.15,4),wl); d.rotation.x=-Math.PI/2; d.position.set(X+sd*4.5,0.022,z-2); lg.add(d); }   // 車道之間的白虛線（4 m 畫、4 m 空）
          const e=new THREE.Mesh(new THREE.PlaneGeometry(0.15,L-4),wl); e.rotation.x=-Math.PI/2; e.position.set(X+sd*7.8,0.022,zc-2); lg.add(e); }   // 靠人行道的白實線
        const lmg=W3.mergeGroup(lg); lmg.name='xs_north_branch_lines'; lmg.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); far.add(lmg); }
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
        for(let i=city.length-1;i>=0;i--){ const c=city[i]; if((c.z===-171||c.z===-194)&&Math.abs(c.x-XSG.xh)<c.w/2+11) city.splice(i,1); }   /* XS-GATE-NORTH-1105：新生南路往北那一段兩排都空出來；XS-NORTH-ROAD-1107：±7 → ±11 m（16 m 車道＋兩側 3 m 人行道）*/
        for(const sd of [-1,1]) for(let z=-214;z>-262;){ const w=10+Math.round(H(z,30+sd)*7); city.push({x:XSG.xh+sd*11,z:z-w/2,w,d:16,floors:5+Math.floor(H(z,32+sd)*6),gh:4.0,ry:sd<0?Math.PI/2:-Math.PI/2,color:WALLC[Math.floor(H(z,34+sd)*7)],shop:H(z,36+sd)<0.5,xsBranch:true}); z-=w; }   /* XS-NORTH-ROAD-1107：往北那一段兩側、第二排背後（z −214 以北）補一排面向這條路的房子（x＝正面那一條線，西側朝東、東側朝西）*/
        // 東、南：再遠一排城市大樓（基隆路、長興街方向；只是遠景）
        for(let z=-230;z<230;){ const w=14+Math.round(H(z,13)*10); city.push({x:214,z:z+w/2,w,d:16,floors:5+Math.floor(H(z,14)*5),gh:4.0,ry:-Math.PI/2,color:TALLC[Math.floor(H(z,15)*7)]}); z+=w+2; }
        for(let x=-200;x<214;){ const w=14+Math.round(H(x,16)*10); city.push({x:x+w/2,z:150,w,d:16,floors:5+Math.floor(H(x,17)*5),gh:4.0,ry:Math.PI,color:TALLC[Math.floor(H(x,18)*7)]}); x+=w+2; }
        // 校園外圍的系館（沒有名字）：北側中庭那一棟（從霖澤館穿堂看得到）、東北、東南、南側宿舍區
        halls.push({x:34,z:-132,w:24,d:8,floors:4,ry:0,color:'#a9a7a2',roof:'flat',shop:false});   /* 第二十四批：萬才館後面那棟 (84,-131) 拿掉，位置給國青中心（配置圖：霖澤館和萬才館中間、靠辛亥路）*/
        for(const [x,z,w,f,flat] of (XH.on?[[140,72,44,4,0],[140,118,36,5,1],[172,95,30,3,0]]:[[140,-120,36,5,1],[140,-75,46,4,0],[172,-100,30,3,0],[140,72,44,4,0],[140,118,36,5,1],[172,95,30,3,0]])) halls.push({x,z,w,d:16,floors:f,ry:-Math.PI/2,color:HALLC[Math.floor(H(x,z)*5)],roof:flat?'flat':'hip'});
        for(const [x,w,f] of [[-100,40,6],[-50,36,5],[0,40,6],[50,38,5],[100,40,6]]) halls.push({x,z:104,w,d:14,floors:f,ry:Math.PI,color:['#cfc6b4','#c9b49a','#bfb5a3','#d2c3a5'][Math.floor(H(x,5)*4)],roof:'flat',shop:false}); }
      if(XH.on){ /* 辛亥路東南段：馬路上原本那三棟系館拿掉（上面），東側那一排大樓壓到馬路的拿掉；
           兩側照地圖補：校園那一側是教職員宿舍（低的公寓，沒有名字）、對面是城市的大樓（往世貿那一側）。房子的長邊順著馬路、正面朝馬路（bgCity 的正面＝本地 +z）*/
        const [dx,dz]=XH.dir, ry=-Math.atan2(dz,dx), P0=XH.pts[14];
        for(let i=city.length-1;i>=0;i--){ const c=city[i]; if(c.x>XH.T1x&&c.z>-163&&(XH.dist(c.x,c.z)<15+Math.max(c.w,c.d)*0.6||(c.x===214&&c.z>-95&&c.z<15))) city.splice(i,1); }   /* 北側那兩排（z −171、−194）不動；東側那一排（x 214）在馬路兩邊各留一段空地給新補的房子 */
        const nx=-dz, nz=dx;   // 校園那一側
        for(let k=6;k<130;){ const w=14+Math.round(H(k,31)*8), cx=P0[0]+dx*(k+w/2), cz=P0[1]+dz*(k+w/2);
          city.push({x:cx-nx*26,z:cz-nz*26,w,d:16,floors:6+Math.floor(H(k,32)*7),gh:4.0,ry,color:TALLC[Math.floor(H(k,33)*7)],shop:H(k,34)<0.35}); k+=w+2+Math.floor(H(k,35)*3)*2; }
        for(let k=30;k<130;){ const w=22+Math.round(H(k,36)*10), cx=P0[0]+dx*(k+w/2), cz=P0[1]+dz*(k+w/2);
          if(cx>126) halls.push({x:cx+nx*28,z:cz+nz*28,w,d:12,floors:4+Math.floor(H(k,37)*2),ry:ry+Math.PI,color:WALLC[Math.floor(H(k,38)*7)],roof:'flat',shop:false}); k+=w+8; } }
      far.add(TK.bgCity(city,{style:'city'})); far.add(TK.bgCity(halls,{style:'campus'}));
      /* 公館那兩排（使用者 10-20 X86「從學校去看公館……超級醜」）：正式模型是校園座標（放在原點），載入以後把方盒藏起來；不投影；窗、店面、招牌晚上會亮 */
      { const rowsFB=TK.bgCity(cityRows,{style:'city'}); rowsFB.name='gongguanRowsFallback'; rowsFB.userData.dyn=true; far.add(rowsFB);   /* dyn：不參加整區靜態合併（模型載入後要藏得起來）*/
        if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.campus_gongguan_bd']) ASSETS.loadOne('bldg.campus_gongguan_bd').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true);
            r.traverse(o=>{ if(!o.isMesh) return; o.castShadow=false; o.receiveShadow=false; o.userData.dyn=true; const m=o.material, nm=(m&&m.name)||'';
              if(/gg_bd_facade/.test(nm)) TK.addNight(m,0.85,0); else if(/gg_bd_shopfront/.test(nm)) TK.addNight(m,1.0,0.3); else if(/gg_bd_signs/.test(nm)) TK.addNight(m,1.0,0.15); });
            far.add(r); rowsFB.visible=false; zone.gongguanBD=true; }).catch(e=>console.warn('公館背景正式模型載入失敗，用方盒',e)); }
      // 校園圍牆（北側＋西側往南北延長）＋牆頭石材
      { const wb=new TK.Bin(); const wt=campusWallMat(); { const x1=Math.min(130,XH.T1x); for(const [a,b] of [[-124,XSG.x-XSG.gw/2],[XSG.x+XSG.gw/2,x1]]){ const wl=b-a, wx=(a+b)/2; wb.add(wt,TK.boxG(wl,1.8,0.8,1.0),wx,0.9,-141); wb.add(TK.paint('#d9d3c6'),TK.boxG(wl+0.4,0.14,1.0),wx,1.87,-141); } }   /* 北側圍牆：新生南路側門的門洞 x XSG.x ± 2.6（XS-GATE-NORTH-1105）*/
        if(XH.on){ const P=XH.pts; for(let i=0;i+1<P.length&&i<16;i++){ const a=P[i], b=P[i+1], ux=b[0]-a[0], uz=b[1]-a[1], l=Math.hypot(ux,uz), nx=-uz/l, nz=ux/l, mx=(a[0]+b[0])/2+nx*15.4, mz=(a[1]+b[1])/2+nz*15.4, ry=-Math.atan2(uz,ux);
            const L2=l+0.3; wb.add(wt,TK.boxG(L2,1.8,0.8,1.0),mx,0.9,mz,ry); wb.add(TK.paint('#d9d3c6'),TK.boxG(L2+0.1,0.14,1.0),mx,1.87,mz,ry); } }   /* 校園圍牆沿著辛亥路彎過去，到東南段走出地圖邊界（x 130）一點 */ wb.add(wt,TK.boxG(0.8,1.8,61.4,1.0),-124,0.9,-110.5);   /* 西側圍牆北段（z −141～−80）一整段：側門搬到北牆（XS-GATE-NORTH-1105；原本 ART-XINSHENG-GATE-1103 在 z −87.2～−80.8 開門洞，和校門、公館同一面牆）*/   /* 新生南路側門（ART-XINSHENG-GATE-1103，LAWWW 11-03 20:20 同意）：西側圍牆北段在 z −87.2～−80.8 開一個門洞（原本一整段 z −141～−80）*/ wb.add(wt,TK.boxG(0.8,1.8,70,1.0),-124,0.9,115); wb.build(far); }   /* 西側圍牆原本只有 z -80–80，往北接到北側圍牆、往南延伸到宿舍區後面 */
      { const pm=TK.col('#bdb5a6'), cm=TK.col('#d9d3c6'); for(const xx of [XSG.x-XSG.gw/2,XSG.x+XSG.gw/2]){ const p=new THREE.Mesh(TK.boxG(1.0,3.0,1.0),pm); p.position.set(xx,1.5,XSG.z); far.add(p); const c=new THREE.Mesh(TK.boxG(1.2,0.16,1.2),cm); c.position.set(xx,3.08,XSG.z); far.add(c); } }   /* 側門的兩根門柱（套件暫代；門柱上「首都帝大」的字、鐵柵門、門燈等正式模型）*/
      // 公館：捷運出口、路燈、行道樹、機車（照公館區域的位置）；北側馬路的路燈、行道樹；校園外圍的樹帶——全部合併
      { const mrt=TK.mrtExit({name:'捷運 公館站',sub:'出口 2'}); mrt.position.set(-181,0,-36.6); far.add(mrt);
        const props=new THREE.Group(), trees=new THREE.Group();
        for(let i=0;i<9;i++){ const z=-63+i*18; const a=W3.lampPost(); a.position.set(-138.6,0,z); a.rotation.y=-Math.PI/2; props.add(a); const b=W3.lampPost(); b.position.set(-175,0,z); b.rotation.y=Math.PI/2; props.add(b); }
        for(let x=-120;x<=Math.min(120,XH.T1x-4);x+=24){ const a=W3.lampPost(); a.position.set(x,0,-144.4); a.rotation.y=Math.PI; props.add(a); }
        const along=(step,o,fn)=>{ const P=XH.pts; let acc=step/2; for(let i=0;i+1<P.length;i++){ const a=P[i], b=P[i+1], ux=b[0]-a[0], uz=b[1]-a[1], l=Math.hypot(ux,uz); while(acc<l){ const f=acc/l, nx=-uz/l, nz=ux/l; fn(a[0]+ux*f+nx*o,a[1]+uz*f+nz*o,nx,nz); acc+=step; } acc-=l; } };
        if(XH.on) along(24,11.6,(x,z,nx,nz)=>{ if(x>215) return; const a=W3.lampPost(); a.position.set(x,0,z); a.rotation.y=Math.atan2(-nx,-nz); props.add(a); });   // 辛亥路彎道的路燈（燈臂朝馬路）
        const scC=['#e8e8e8','#2b2b2b','#8c3b47','#3a6fb0','#c9b48a','#f2f0ea','#5a5a7a'];
        for(let i=0;i<14;i++){ const gx=-70+i*10, n=Math.abs(gx)<12?1:3; for(let k=0;k<n;k++){ const s=TK.scooter(scC[((k*3+i*7)%7)]); s.position.set(-138+((k*7)%3-1)*0.06,0,gx+(k-(n-1)/2)*0.85); s.rotation.y=-Math.PI/2; props.add(s); } }
        for(let i=0;i<8;i++){ const gx=-60+i*14; for(let k=0;k<3;k++){ const s=TK.scooter(scC[((k*5+i*3)%7)]); s.position.set(-176.8,0,gx+(k-1)*0.85); s.rotation.y=Math.PI/2; props.add(s); } }
        const T=(x,z,h)=>{ const t=TK.tree(h||6.4*(1.6+H(x,z)*0.5)); t.position.set(x,0,z); t.rotation.y=H(z,x)*6.28; trees.add(t); };
        for(let i=0;i<6;i++) T(-134,-65+i*26,6.4*1.2);
        for(let x=-116;x<=Math.min(116,XH.T1x-6);x+=14) T(x+H(x,1)*3,-143.2,6.4*1.3);
        if(XH.on) along(14,12.8,(x,z)=>{ if(x<215) T(x+H(x,3)*1.5,z,6.4*1.3); });   // 辛亥路彎道的行道樹
        for(let x=8;x<=104;x+=9){ if(x>26&&x<42) continue; T(x+H(x,2)*2,-125.5); }   // 法學院後面的中庭（霖澤館穿堂正後方留空，看得到後面那棟）
        T(29,-128,6.4*1.5); T(44,-127.5,6.4*1.4);
        for(let z=-178;z>=-258;z-=10){ const t=TK.tree(6.4*(1.25+H(z,41)*0.25)); t.position.set(XSG.xh,0.2,z+(H(z,42)-0.5)*1.5); t.rotation.y=H(z,43)*6.28; trees.add(t); }   // XS-NORTH-ROAD-1107：新生南路往北那一段，分隔島上一排行道樹
        for(let z=-176;z>=-256;z-=20) for(const sd of [-1,1]){ const a=W3.lampPost(); a.position.set(XSG.xh+sd*8.6,0,z); a.rotation.y=sd<0?Math.PI/2:-Math.PI/2; props.add(a); }   // 兩側路燈（燈臂朝馬路）
        for(let z=-98;z>=-136;z-=9.5) for(let x=-116;x<=2;x+=12){ const tx=x+H(x,z)*5, tz=z+H(z,x)*3; if(tx>-64&&tz>-127) continue; if(xsIn(tx,tz,2.2)) continue; T(tx,tz); }   /* XS-GATE-NORTH-1105：側門、望月台、停車場、體育館、步道上不種 */   // 西北角走不到的樹林（方案 A：湖和博雅那一塊打開，樹只留在西邊和圍牆外）
        for(const x of [130,142,155]) for(let z=-46;z<=46;z+=9) T(x+H(x,z)*3,z+H(z,x)*3);   // 總圖後面的樹帶
        for(let x=-124;x<=200;x+=13) T(x+H(x,9)*2,99);   // 南側道路旁
        const pm=W3.mergeGroup(props); pm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); far.add(pm);
        const tm=W3.mergeGroup(trees); tm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); far.add(tm); }
      g.add(far); }
    // 邊界
    nav.blockOutside(-123,-124,125,84); nav.blockRect(-92.5,-104,61,40,0,0); xsGateNav(nav);   /* 方案 A：西北角原本整塊（x -123～5）走不到，現在只擋西邊 x -123～-62；湖、博雅、普通那一塊走得到 */ nav.blockRect(112.5,-104,25,40,0,0); nav.blockRect(-123,0,2,8,0,0); // 北側只留法學院前庭（x 5–100）可走；校門通道保留
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
    { const gq=CK.modern({w:LR?20:30,d:10,floors:LR?11:7,gfh:4.0,fh:3.2,wall:LR?'#d6c9ad':'#a9aba6',slab:LR?'#e4dccb':'#c8c9c4',bays:LR?{floors:3,col:'#4a3527'}:null,roofCol:'#77736b',sign:'國際學苑'})   /* NTU-REF-1110：官網是 11 層、米色面磚、上面三層深褐色凸窗（研三舍在這一棟裡面）；屋頂面灰色（BB_248 P3）*/; place(g,gq,LR?65:64,LR?-119:-134,0);
      if(LR){ nav.blockRect(65,-119,20,10,0,0);   /* 重排：國青大樓在霖澤館東邊、辛亥路旁（官方地圖）；後面到圍牆走不到 */
        /* 研三舍那一棟拿掉（NTU-REF-1110 ③-4，LAWWW2 帳號 A 11-10；X223）：住宿組「研三舍位於國青大樓」＝同一棟（男 5～7 樓、女 2、8～11 樓），原本另外蓋的 4 層「研三舍」(63,−108) 是多的；AA 11-10：劇情沒用到 */
        { const bk=WCW(-1,-17.3); nav.blockRect(bk[0],bk[1],34,12,-WRY,0); } } }   /* 萬才館背面到辛亥路圍牆（法學院後面不能走，D31 同一個做法）*/
    // 黑森林（CAMPUS-BLACKFOREST-1102，LAWWW2 11-02；使用者 20:3x「你的黑森林超奇怪的，而且裡面怎麼還會有草皮中的磁磚啊，而且你這一小塊根本就不能叫做黑森林」）：
    //   配置 src/data/blackforest_layout.js（tools/blender/env_second/campus_blackforest_layout.py）：法學院廣場南邊整塊＋z −60 那條路的南邊（路變成穿過森林），
    //   榕樹為主、樟樹少數（TK.tree 的 sp → street_trees.glb 正式模型），樹冠交疊；樹幹擋導航。地面（落葉泥土地、土徑、板根、蕨類、灌木）是正式模型 bldg.campus_blackforest，
    //   載入前／載入失敗用這裡的程序化地面（深色落葉地＋土徑；沒有地磚）。水池（第二十四批）照舊。配置沒載入時照舊是第二十四批的版本（else）。
    let bfFallback=null; const BFL=typeof BLACKFOREST_LAYOUT!=='undefined'?BLACKFOREST_LAYOUT:null;
    if(BFL){ const fb=new TK.Bin(); const fg=new THREE.Group(); bfFallback=new THREE.Group(); bfFallback.name='blackforest_fallback'; bfFallback.userData.dyn=true; g.add(bfFallback);
      const floorT=W3.canvasTex(BFL.version>=2?'forestFloor3':'forestFloor2',128,128,(x,w,h)=>{ x.fillStyle=BFL.version>=2?'#5d6440':'#3f3a2c'; x.fillRect(0,0,w,h); let s=13; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; for(let i=0;i<1100;i++){ const v=r(); x.fillStyle=v<0.45?'rgba(96,72,44,0.55)':(v<0.75?'rgba(58,66,36,0.5)':'rgba(130,104,64,0.45)'); x.fillRect(r()*w,r()*h,2+r()*3,1+r()*2); } });   // 落葉地
      const dirtT=W3.canvasTex('forestDirt',128,128,(x,w,h)=>{ x.fillStyle='#6a5843'; x.fillRect(0,0,w,h); let s=29; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; for(let i=0;i<700;i++){ const v=r(); x.fillStyle=v<0.5?'rgba(84,68,50,0.6)':'rgba(140,120,92,0.45)'; x.fillRect(r()*w,r()*h,1+r()*3,1+r()*2); } });   // 土徑
      for(const A of BFL.areas) ground(bfFallback,A.x1-A.x0+0.6,A.z1-A.z0+0.6,floorT,[(A.x1-A.x0)/4,(A.z1-A.z0)/4],(A.x0+A.x1)/2,(A.z0+A.z1)/2,0.012);
      for(const pth of BFL.paths) if(pth.kind!=='paved') for(let i=0;i<pth.pts.length-1;i++){ const a=pth.pts[i], b=pth.pts[i+1]; strip(bfFallback,a[0],a[1],b[0],b[1],pth.w,dirtT,2); }
      BFL.trees.forEach(t=>{ const tr=TK.tree(t.h,t.seed,{spread:t.spread,dark:t.dark,sp:t.sp}); place(fg,tr,t.x,t.z,t.ry); nav.blockCircle(t.x,t.z,t.trunk); });
      g.add(W3.mergeGroup(fg));
      // 小水池（霖澤館東南邊）：深色水面、石砌池邊、水邊的植物；不能走
      if(BFL.version>=3&&BFL.pond.outline){ const P=BFL.pond;   /* 第三版（BB_248 末節）：彎曲長條的水道；池邊、水、石頭、莎草、垂柳是正式模型，這裡是備用水面＋導航（照池邊外緣的多邊形擋）*/
        const sh=new THREE.Shape(P.outline.map(q=>new THREE.Vector2(q[0],-q[1]))); const wm=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshStandardMaterial({color:0x34463a,roughness:0.12})); wm.rotation.x=-Math.PI/2; wm.position.y=0.11; bfFallback.add(wm);
        const inPoly=(x,zz,poly)=>{ let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const [xi,zi]=poly[i], [xj,zj]=poly[j]; if(((zi>zz)!==(zj>zz))&&(x<(xj-xi)*(zz-zi)/(zj-zi)+xi)) c=!c; } return c; };
        let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; for(const [x,zz] of P.outer){ x0=Math.min(x0,x); x1=Math.max(x1,x); z0=Math.min(z0,zz); z1=Math.max(z1,zz); }
        for(let x=x0;x<=x1;x+=0.25) for(let zz=z0;zz<=z1;zz+=0.25) if(inPoly(x,zz,P.outer)) nav.blockRect(x,zz,0.3,0.3,0,0);
        nav.blockCircle(P.willow[0],P.willow[1],0.4); }
      else if(BFL.version>=2){ const P=BFL.pond, PR=a=>1+0.10*Math.sin(2*a+0.6)+0.05*Math.cos(3*a);   /* 第二版的小湖（走道東邊）：池邊、水、石頭、水生植物、垂柳是正式模型；這裡是載入前／失敗的備用水面＋導航 */
        const wm=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshStandardMaterial({color:0x34463a,roughness:0.12})); wm.scale.set(P.rx*1.04,P.rz*1.04,1); wm.rotation.x=-Math.PI/2; wm.position.set(P.x,0.13,P.z); bfFallback.add(wm);
        for(let dz=-P.rz*1.2;dz<=P.rz*1.2;dz+=0.25){ let hw=0; for(let k=0;k<72;k++){ const a=k/72*Math.PI*2, kk=PR(a), z=Math.sin(a)*P.rz*kk; if(Math.abs(z-dz)<0.3) hw=Math.max(hw,Math.abs(Math.cos(a))*P.rx*kk); } if(hw>0) nav.blockRect(P.x,P.z+dz,2*(hw+0.4),0.3,0,0); }   /* 水＋0.4 m 的水泥池邊不能走（照輪廓一條一條擋）*/
        nav.blockCircle(P.willow[0],P.willow[1],0.4); }   // 垂柳的樹幹
      else { const PX=49, PZ=-71, RX=4.2, RZ=2.8;   /* 離路人散步路線 (50,-80)→(30,-60) 約 5.7 m */ const wm=new THREE.Mesh(new THREE.CircleGeometry(1,32),new THREE.MeshStandardMaterial({color:0x2f4b4a,roughness:0.15,metalness:0.3})); wm.scale.set(RX,RZ,1); wm.rotation.x=-Math.PI/2; wm.position.set(PX,0.03,PZ); wm.receiveShadow=true; g.add(wm);
        for(let i=0;i<26;i++){ const a=i/26*Math.PI*2; fb.add(TK.paint('#8f8b82'),TK.boxG(1.05,0.22,0.42),PX+Math.cos(a)*(RX+0.15),0.11,PZ+Math.sin(a)*(RZ+0.15),-a+Math.PI/2); }
        for(const a of [0.4,1.3,2.6,3.5,4.4,5.6]) TK.plantClump(fb,PX+Math.cos(a)*(RX+0.7),0,PZ+Math.sin(a)*(RZ+0.6),0.9,6,[0.55,0.75,0.5]);
        nav.blockRect(PX,PZ,2*RX+1.4,2*RZ+1.2,0,0); }
      const fbg=new THREE.Group(); fb.build(fbg); g.add(fbg); }
    else { // 第二十四批（配置圖：法學院靠校園那一側的一片樹林，裡面有步道；霖澤館東南邊有一個小水池）：法學院廣場南邊、到 z=-60 的路之間
    { const fb=new TK.Bin(); const fg=new THREE.Group();
      ground(g,34,14,W3.canvasTex('forestFloor',128,128,(x,w,h)=>{ x.fillStyle='#4d5a37'; x.fillRect(0,0,w,h); let s=11; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; for(let i=0;i<900;i++){ const v=r(); x.fillStyle=v<0.4?'rgba(92,70,44,0.5)':(v<0.75?'rgba(60,82,40,0.55)':'rgba(120,98,60,0.4)'); x.fillRect(r()*w,r()*h,2+r()*3,1+r()*2); } }),[8,3.5],72,-72,0.008);   // 落葉地面
      strip(g,62,-81,68,-72,2.2,pavingTex(),3); strip(g,68,-72,78,-65,2.2,pavingTex(),3);   // 穿過樹林的小步道（廣場 → 南邊的路）
      const FT=[[58.5,-75.5],[61,-68.5],[61.8,-77.5],[66,-66.5],[71,-75.5],[75,-71.5],[77.5,-77],[80,-70.5],[84,-76.5],[86.5,-68.5],[82.5,-66]];   /* 每棵離步道中線 ≥ 2.5 m */
      FT.forEach(([x,z],i)=>{ const t=TK.tree(6.4*(1.4+(i%3)*0.12),300+i,{spread:1.25,dark:0.72}); place(fg,t,x,z,i*1.7); nav.blockCircle(x,z,0.6); });
      g.add(W3.mergeGroup(fg));
      // 小水池（霖澤館東南邊）：深色水面、石砌池邊、水邊的植物；不能走
      { const PX=49, PZ=-71, RX=4.2, RZ=2.8;   /* 離路人散步路線 (50,-80)→(30,-60) 約 5.7 m */ const wm=new THREE.Mesh(new THREE.CircleGeometry(1,32),new THREE.MeshStandardMaterial({color:0x2f4b4a,roughness:0.15,metalness:0.3})); wm.scale.set(RX,RZ,1); wm.rotation.x=-Math.PI/2; wm.position.set(PX,0.03,PZ); wm.receiveShadow=true; g.add(wm);
        for(let i=0;i<26;i++){ const a=i/26*Math.PI*2; fb.add(TK.paint('#8f8b82'),TK.boxG(1.05,0.22,0.42),PX+Math.cos(a)*(RX+0.15),0.11,PZ+Math.sin(a)*(RZ+0.15),-a+Math.PI/2); }
        for(const a of [0.4,1.3,2.6,3.5,4.4,5.6]) TK.plantClump(fb,PX+Math.cos(a)*(RX+0.7),0,PZ+Math.sin(a)*(RZ+0.6),0.9,6,[0.55,0.75,0.5]);
        nav.blockRect(PX,PZ,2*RX+1.4,2*RZ+1.2,0,0); }
      const fbg=new THREE.Group(); fb.build(fbg); g.add(fbg); } }
    // 燈光光暈
    for(const l of lamps){ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd88a,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(3,3,1); glow.position.set(0,3.9,0.75); l.add(glow); glow.visible=false; E.lampGlows.push(glow); const pool=new THREE.Mesh(new THREE.CircleGeometry(4.2,16),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(0,0.03,0.75); l.add(pool); pool.visible=false; E.lampGlows.push(pool);
      if(l.userData.roadPool){ const rp=new THREE.Mesh(new THREE.CircleGeometry(6.5,24),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd59a,transparent:true,opacity:0.38,depthWrite:false,blending:THREE.AdditiveBlending})); rp.rotation.x=-Math.PI/2; rp.scale.set(1.3,1,1); rp.position.set(0,0.035,4.5); rp.material.polygonOffset=true; rp.material.polygonOffsetFactor=-8; rp.material.polygonOffsetUnits=-16; l.add(rp);   /* 深度偏移（LAWWW2-B 10-24）：和步道交疊的柏油路（舟山路）會被 stripLayer 往上推一層，斜看時把只高 1.5 cm 的光圈蓋掉——光圈固定比任何路面層級都前面 */ rp.visible=false; E.lampGlows.push(rp); } }   /* 椰林大道：路面上一圈淡的燈光（離燈 4.5 m、半徑 6.5 m、沿路拉長 1.3 倍），兩側的在路中間接起來 */
    /* 湖心亭的宮燈（ART-ECON-3D-GAP-1021 D，LAWWW2-B 11-01）：燈旁一團光暈、亭子平台上一圈光（和路燈同一套開關 E.lampGlows；水面的倒影在 lake() 的 shader）*/
    if(lakeU&&lakeU.lantern){ const [lx,ly,lz]=lakeU.lantern; const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.6,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(1.7,1.7,1); glow.position.set(lx,ly,lz); g.add(glow); glow.visible=false; E.lampGlows.push(glow);
      const pool=new THREE.Mesh(new THREE.CircleGeometry(2.2,24),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd59a,transparent:true,opacity:0.42,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(lx,0.065,lz); g.add(pool); pool.visible=false; E.lampGlows.push(pool); }
    /* 大一女舍 A、B 門廊的吸頂燈（LAWWW2 6f98244 加大燈罩）：晚上燈罩下一團光暈、門口地上一圈光（和路燈同一套開關 E.lampGlows；位置＝campus_freshman.py 門廊天花板中心） */
    if(!/[?&]noporch\b/.test(location.search||'')) for(const [px,pz] of [[-108,61],[-78,59]].concat(m1GLB?[[20,60]]:[]))   /* 男一舍（ART-EXT-M1）門廊的吸頂燈：campus_male1.py 門廊天花板中心 */{ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffe2a8,transparent:true,opacity:0.6,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(1.8,1.8,1); glow.position.set(px,3.15,pz); g.add(glow); glow.visible=false; E.lampGlows.push(glow);
      for(const [y,dz,r,op] of [[0.112,0,1.7,0.85],[0.035,-2.4,2.8,0.6]]){ const pool=new THREE.Mesh(new THREE.CircleGeometry(r,20),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffe0a8,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(px,y,pz+dz); g.add(pool); pool.visible=false; E.lampGlows.push(pool); } }   /* 門廊地坪（高 10 cm）上一圈、門口地上一圈 */
    // 出口
    const exits=[...gateExits(gate,-124,0,-Math.PI/2,1.5,2.5,{to:'gongguan',spawn:{x:-2.5,z:-29,yaw:0},label:'走出校門'}),   /* 門房在校門正中間：兩側通道各一個（世界座標 (-125.5,±5.27)，2026-10-18；原本是開口正中間 (-126,0) r3）*/
      {x:34,z:-126.6,r:1.8,to:'lane118',spawn:{x:0,z:47.6,yaw:Math.PI},label:'從後門出去（118 巷）'},   /* 霖澤館穿堂後面的小廣場＝法學院的後門（辛亥路那一側；D46、使用者 10-18 02:2x）*/{x:34+linze.userData.ck.lobby.x,z:-112+linze.userData.ck.lobby.z,r:1.5,to:'linze',spawn:Object.assign({},LINZE_LAYOUT.entrance.spawn),label:'進入法律系館A',door:true},{x:WCW(5.8,11.4)[0],z:WCW(5.8,11.4)[1],r:1.6,to:'wancai',spawn:{x:0,z:5,yaw:Math.PI},label:'進入法律系館B',door:true,lv:0,y:0},(typeof LIBRARY_LAYOUT!=='undefined'?{x:86.4,z:0,r:3.8,to:'library_hall',spawn:Object.assign({},LIBRARY_LAYOUT.entrance.spawn),label:'進入總圖書館',door:true}:{x:86.4,z:0,r:3.8,to:'library',spawn:{x:0,z:7,yaw:Math.PI},label:'進入總圖書館',door:true}),(typeof DORM_LAYOUT!=='undefined'?{x:20,z:59.6,r:2.6,to:'dorm_hall',spawn:Object.assign({},DORM_LAYOUT.entrance.spawn),label:'回宿舍',door:true}:{x:20,z:59.6,r:2.6,to:'dorm',spawn:{x:0,z:2.4,yaw:Math.PI},label:'回宿舍',door:true})];
    if((typeof XS3!=='undefined')&&typeof XINSHENG_LAYOUT!=='undefined') exits.push({x:XSG.x,z:XSG.z+1.6,r:2.0,to:'xinsheng',spawn:Object.assign({},XINSHENG_LAYOUT.sideGate.spawn),label:'往新生南路（側門）',lv:0,y:0});   /* 新生南路側門（ART-XINSHENG-GATE-1103，LAWWW 11-03 20:20 同意）：西側圍牆北段 (−124, −84)；src/xinsheng3d.js 沒有載入時沒有這個出口 */
    /* 社科院圖書館（D56 社科院第①步）：門在現在的社科院正面中間（src/soclib3d.js 的 SL3.DOOR）；一樓才有（萬才館陽台那一層不算）*/
    if(typeof SL3!=='undefined'&&typeof SOCLIB_LAYOUT!=='undefined') exits.push({x:SL3.DOOR.x,z:SL3.DOOR.z,r:SL3.DOOR.r,to:'soclib',spawn:Object.assign({},SOCLIB_LAYOUT.entrance.spawn),label:'進入社科院圖書館',door:true,lv:0,y:0});
    // 總圖：門在一樓拱廊裡面，互動範圍從門廊前緣涵蓋到門口；霖澤館（第十九批）：入口比地面高、前面是大台階（不能走），互動點在台階下面；萬才館（第二十四批）：互動點在陽台下面的一樓入口（半徑 1.6；出來的出生點離互動點 2.2 m，不會一出來就跳出按鈕）
    const G0x=typeof GAME!=='undefined'?GAME.G:null, dormGone=!!G0x&&(G0x.stage||'law')==='law'&&!!G0x.flags&&G0x.flags.MOVED_OUT!=null&&G0x.flags.MOVED_OUT!==false;   /* 畢業後宿舍期滿退宿（1A-15 MOVED_OUT，同 home3d.js HOME.movedOut）*/
    for(const ex of exits){ if(dormGone&&(ex.to==='dorm_hall'||ex.to==='dorm')){ E.interactables.push({x:ex.x,z:ex.z,radius:ex.r,lv:ex.lv,y:ex.y,label:'看宿舍門口',look:'（宿舍門口。門禁卡已經還了。）'}); continue; }   /* AA_363 T7-3：退宿以後宿舍門口進不去，只能看 */
      E.interactables.push({x:ex.x,z:ex.z,radius:ex.r,label:ex.label,exit:ex,lv:ex.lv,y:ex.y}); }   /* 萬才館一樓入口在陽台正下方：只在地面那一層（站在陽台上不會跳出「進入萬才館」）*/
    // 座位互動
    for(const s of seats){ E.interactables.push({x:s.x,z:s.z,radius:1.6,label:s.label,seat:s}); }
    const nav1=wancaiStairs(E,g,nav,wancai,WCX,WCZ,campusWalk,WRY);   // 萬才館大樓梯、平台、陽台（第 1 層）
    const zone={group:g,nav,levels:nav1?[nav,nav1]:undefined,spawn:{x:34,z:-98,yaw:0},seats,lamps,buildings,exits,walkMeshes:campusWalk,linzeDoor:{x:34+linze.userData.ck.lobby.x,z:-112+linze.userData.ck.lobby.z},
      onLamps(on){ for(const b of buildings) W3.setNight(b,on); CK.setNight(on); },   // 校園套件的窗戶晚上透出暖光
      update(dt,E){ updateLake(lakeU,E); if(bikes) bikes.update(dt,E&&E.camera); },
    };
    const bikes=parked.length?parkedBikeChunks(g,parked,40,45):null; zone.parkedBikes=bikes;   /* 40 m 一區、鏡頭 45 m 外整區不畫 */
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.wancai_exterior']) ASSETS.loadOne('bldg.wancai_exterior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachExterior(wancai,c.scene.clone(true)); }).catch(e=>console.warn('萬才館外觀正式模型載入失敗，用套件的外觀',e));   // 萬才館第二階段：大樓梯、平台、陽台、弧形量體、立面（tools/blender/wancai_exterior.py）
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.linze_exterior']) ASSETS.loadOne('bldg.linze_exterior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachExterior(linze,c.scene.clone(true)); }).catch(e=>console.warn('霖澤館外觀正式模型載入失敗，用套件的外觀',e));
    // 總圖的 Blender 正式模型（第二個 AI）：和溫州街、公館同一套接法（只藏 ckTag==='library' 的套件；窗晚上亮、招牌是石材底色的 canvas 字）
    if(libGLB) ASSETS.loadOne('bldg.campus_library').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'ckTag','campus_library_glb','library'); }).catch(e=>console.warn('總圖正式模型載入失敗，用套件的外觀',e));
    if(lawnGLB) ASSETS.loadOne('bldg.campus_lib_lawn').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true); r.name='campus_lib_lawn_glb';   /* X133 總圖前草皮：只有地面（不投影、接受影子），載入後藏掉石板廣場 */
      r.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); g.add(r); libPlaza.visible=false; }).catch(e=>console.warn('總圖前草皮正式模型載入失敗，用石板廣場',e));
    if(BFL&&typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.campus_blackforest']) ASSETS.loadOne('bldg.campus_blackforest').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true); r.name='campus_blackforest_glb';   /* 黑森林的地面（CAMPUS-BLACKFOREST-1102）：落葉泥土地、土徑、板根、蕨類、灌木——不投影、接受樹的影子；載入後藏掉程序化地面 */
      r.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); r.userData.dyn=true; g.add(r); if(bfFallback) bfFallback.visible=false; }).catch(e=>console.warn('黑森林正式模型載入失敗，用程序化的地面',e));
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
    flushCurbs(g);   /* CAMPUS-FLOOR-STRIP-1110：步道都鋪好了才放路緣（在別條步道上的那幾段斷開） */
    return zone; } };
  // 建築外觀的正式模型（Blender GLB，建築自己的座標）接到套件的建築上：套件的外觀藏起來（招牌 keepWithFormal 留著）；導航、走路高度、鏡頭碰撞照舊由套件給。
  // 窗玻璃、大廳玻璃、穿堂嵌燈登記成夜間會亮（材質名稱約定見 tools/blender/linze_exterior.py）
  function attachExterior(b,root){ for(const m of b.children) if(m.isMesh&&!m.userData.keepWithFormal) m.visible=false;
    const NIGHT={ext_glass_lit:[0xffd9a0,0.75,0],ext_glass_lobby:[0xffdcae,0.8,0],ext_downlight:[0xfff3dc,1.4,0.25]};
    root.traverse(o=>{ if(!o.isMesh) return; o.castShadow=true; o.receiveShadow=true; const mt=o.material, nn=mt&&NIGHT[mt.name]; if(nn){ if(!mt.userData.nightReg){ mt.userData.nightReg=true; mt.emissive=new THREE.Color(nn[0]); } TK.addNight(mt,nn[1],nn[2]); }   /* 夜間每次接上都要重新登記（見 attachWenzhouModel 的說明）*/ if(mt&&mt.name==='ext_ceiling') TK.bounce(mt,0.32,0.5); });   /* 穿堂天花板：地面反射上來的光（套件的穿堂天花板也是這樣做）*/
    root.traverse(o=>{ const mt=o.isMesh&&o.material; if(mt&&/^seethru_/.test(mt.name)&&!mt.userData.seeThrough){ mt.userData.seeThrough=true; if(typeof E3!=='undefined'&&E3.patchSeeThrough) E3.patchSeeThrough(mt); } });   /* 穿堂的柱子（seethru_ext_granite_col）：擋在跟隨鏡頭和玩家之間時網點透空，和行道樹樹幹一樣（BUG-CAM-PILLAR-LAWA-1031：從南邊走到霖澤館穿堂門口時前排中柱把人整個擋住）。測試：node tests/linze_pillar_seethru_unit.js */
    b.add(root); b.userData.formal=true; }
  /* ---- 社團博覽會的帳篷（LAWWW2 479b7fc：club_fair.glb，九頂；配置照 docs/art-rebuild/second_ai/VISUAL_REVIEW.md 28.1，LAWWW 2026-10-14 採用，美術待使用者驗收）----
     只在博覽會那兩天（activities.js 的 club_expo_y1s1.dates）擺：大道南側一排、帳篷中心 z=15.1、面向北（轉 π）；服務台在原本公告欄的位置（博覽會的互動點 (-13.5,13.6) 不動），法服在原本招生攤位的位置。
     每頂帳篷整個擋起來（3×3 m）；人站在帳篷前面 z 12.5–13.5；傅鐘廣場（x≤−24）和長椅前面留空。正式模型載入前／失敗：簡單的帳篷（D38 分類 ③）*/
  const FAIR_Z=15.1, FAIR=[['booth_hiking',-21.3],['booth_lawclub',-17.8],['booth_info',-13.5],['booth_guitar',-9.7],['booth_debate',-5.9],['booth_basketball',3.4],['booth_bg1',7.2],['booth_bg2',11.0],['booth_bg3',14.8]];
  /* 校園擺帳篷的日子（同一排帳篷）：大一的社團博覽會（activities.js club_expo_y1s1 的日子）、大一校慶 2025-11-15（BB_95 3-7，法服的法律問答攤）；
     大二的社團博覽會 9/12（AA_170，祐廷站在攤位後面；AA_485 3-2 從 9/16～9/17 搬到開學第一週的週六）、各年校慶：大二 2026-11-14、大三 2027-11-13、大四 2028-11-11（AA_177 第 7、10 節；「每年 11/15」只留給大一）；
     舊序章那一年的社團博覽會 9/18～9/20（BB_104 E07、AA_154）、校慶園遊會 11/9（E17）*/
  const FAIR_DAYS=['2025-11-15','2026-09-12','2026-11-14','2027-11-13','2028-11-11'];   /* 大二的社團博覽會 2026-09-12（六）一天（CLUBFAIR-REAL-1027，AA_485 3-2：原本 9/16、9/17）*/
  function fairDayKey(key,econ,expo){ return FAIR_DAYS.includes(key)||EXPO_DAYS.includes(key)||(expo||[]).includes(key); }
  function isFairDay(){ try{ const A=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list&&ACTIVITIES.list.find(a=>a.id==='club_expo_y1s1'); const G=typeof GAME!=='undefined'&&GAME.G; if(!A||!G||typeof CALENDAR==='undefined') return false;
    return fairDayKey(CALENDAR.dateOf(G.day).key,false,ACTIVITIES.on(A,G.day,G)?[CALENDAR.dateOf(G.day).key]:[]); }catch(e){ console.warn('isFairDay',e); return false; } }   /* 大一的社博照 ACTIVITIES.on（新局 9/6、舊局 9/30～10/1：CLUBFAIR-REAL-1027）*/
  /* ---- 社團博覽會（大一 2025-09-06、大二 2026-09-12）：椰林大道兩邊 36 頂帳篷＋舞台（CLUBFAIR-REAL-1027，AA_485 第 3 節；LAWWW2-C 2026-10-27）----
     使用者 X109「社團博覽會攤會也太少 都沒人顧」「要參考實際的吧」：照臺大的社團聯展，椰林大道兩邊一路排帳篷、大道中段一個舞台。
     配置 src/data/club_fair_expo_layout.js（CLUB_FAIR_EXPO；Blender tools/blender/env_second/club_fair_expo.py 讀同一份）；正式模型 bldg.club_fair_expo
     （36 頂＋舞台烘成一個網格、一個材質＝一個 draw call，約 2.7 萬三角形；整組放在 (0,0,0)）。博覽會那天（activities.js club_expo_y1s1 的日子、大二 EXPO_DAYS）用這一組；
     校慶、舊序章那一年照舊用下面九頂那一排（clubFair）。每頂帳篷 3×3 m 擋起來；舞台台面、前面兩邊的台階、兩邊的喇叭擋起來；
     大道中間（z ±3.4 以內）、人行道（z ±7）照舊走得到。Z3.fairExpoFront(id)＝站在攤位前的位置（互動點、顧攤的人的對面）。
     正式模型載入前／失敗：簡單的帳篷、台子（D38 分類 ③）*/
  const EXPO_DAYS=['2026-09-12'];   /* 大二的社博（AA_485 3-2）；大一的日子在 activities.js 的 club_expo_y1s1.dates */
  function isExpoDay(){ try{ const G=typeof GAME!=='undefined'&&GAME.G; if(!G||typeof CALENDAR==='undefined') return false;
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
      const m=c.scene.clone(true); m.position.set(0,0,0); m.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; fairSeeThru(o); } }); g.add(m); fb.visible=false; }).catch(e=>console.warn('社團博覽會正式模型載入失敗，用簡單的帳篷',e)); }; }
  /* 社博帳篷擋跟隨鏡頭（FAIR-TENT-CAM-1102，BB_218 最後兩節；LAWWW2 帳號 A 11-10）：正式模型（club_fair.glb、club_fair_expo.glb）每一攤是一個合併的網格、一個材質，
     帳篷頂、桌子、立牌分不開——整攤接樹幹透視（engine3d.js：擋在鏡頭和玩家之間的部分在玩家周圍網點透空、離鏡頭 1.7 m 內透空；其他時候照常畫）。
     攤位之間走、站在攤位後面時鏡頭在帳篷頂上或另一攤後面，原本整個人被帳篷蓋住。測試：node tests/fair_tent_cam_unit.js */
  function fairSeeThru(o){ for(const m of [].concat(o.material)){ if(!m||m.userData.seeThrough) continue; m.userData.seeThrough=true; if(E3.patchSeeThrough) E3.patchSeeThrough(m); } }
  function clubFair(E,g,nav){ const fb=new THREE.Group(); fb.name='fair_fallback'; fb.userData.dyn=true;   /* 不參加整區靜態合併（帳篷共用 P3.M 材質，沒有這行會被合併搬走，正式模型載入後 fb.visible=false 藏不到，兩套帳篷疊在一起）*/ const roof=P3.M('#e8e4da',{rough:0.9}), pole=P3.M('#9aa0a6',{rough:0.5}), table=P3.M('#3f6b8a',{rough:0.8});
    for(const [,x] of FAIR){ const t=new THREE.Group(); const r=new THREE.Mesh(new THREE.ConeGeometry(2.15,0.85,4,1),roof); r.rotation.y=Math.PI/4; r.position.y=2.47; t.add(r);
      for(const [px,pz] of [[-1.48,-1.48],[1.48,-1.48],[-1.48,1.48],[1.48,1.48]]){ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,2.05,6),pole); p.position.set(px,1.025,pz); t.add(p); }
      const tb=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.75,0.6),table); tb.position.set(0,0.375,1.0); t.add(tb); t.position.set(x,0,FAIR_Z); t.rotation.y=Math.PI; fb.add(t);
      nav.blockRect(x,FAIR_Z,3,3,0); }
    g.add(fb);
    return zone=>{ if(typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.club_fair']) return; ASSETS.loadOne('bldg.club_fair').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene; let n=0;
      for(const [name,x] of FAIR){ const src=root.getObjectByName(name); if(!src) continue; const m=src.clone(true); m.position.set(x,0,FAIR_Z); m.rotation.set(0,Math.PI,0); m.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; fairSeeThru(o); } }); g.add(m); n++; }
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
    const U={time:{value:0},deep:{value:new THREE.Color().setRGB(0.12,0.2,0.15,THREE.LinearSRGBColorSpace)},skyLo:{value:new THREE.Color(0.7,0.8,0.88)},skyHi:{value:new THREE.Color(0.5,0.65,0.8)},sunDir:{value:new THREE.Vector3(0.3,0.8,0.2)},sunCol:{value:new THREE.Color(1,1,1)},
      lampP:{value:Array.from({length:8},()=>new THREE.Vector3())},lampN:{value:0},lampK:{value:0},lampC:{value:new THREE.Color(1.0,0.78,0.5)}};   /* 路燈、湖心亭宮燈在水面的倒影（ART-ECON-3D-GAP-1021 D，LAWWW2-B 11-01）：updateLake 照 E.lampsOn 開 */
    const wmat=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,U]),fog:true,
      vertexShader:['#include <fog_pars_vertex>','varying vec3 vW;','void main(){ vec4 wp=modelMatrix*vec4(position,1.0); vW=wp.xyz; vec4 mvPosition=viewMatrix*wp; gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
      fragmentShader:['#include <fog_pars_fragment>','uniform float time; uniform vec3 deep,skyLo,skyHi,sunCol,sunDir; varying vec3 vW;','uniform vec3 lampP[8]; uniform int lampN; uniform float lampK; uniform vec3 lampC;',
        'float hs(vec2 q){ return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453); }',
        'float vn(vec2 q){ vec2 i=floor(q), f=fract(q); vec2 u=f*f*(3.0-2.0*f); return mix(mix(hs(i),hs(i+vec2(1.0,0.0)),u.x),mix(hs(i+vec2(0.0,1.0)),hs(i+vec2(1.0,1.0)),u.x),u.y); }',
        'float hg(vec2 q){ return vn(q*1.3+vec2(time*0.25,time*0.18))*0.5+vn(q*2.9-vec2(time*0.31,-time*0.22))*0.3+vn(q*6.3+vec2(-time*0.42,time*0.35))*0.2; }',
        'void main(){ vec2 p=vW.xz; float e=0.08; float h0=hg(p); vec2 gr=vec2(hg(p+vec2(e,0.0))-h0,hg(p+vec2(0.0,e))-h0)/e*0.035;',
        '  vec3 n=normalize(vec3(-gr.x,1.0,-gr.y)); vec3 v=normalize(cameraPosition-vW); float ndv=max(dot(n,v),0.0); float fr=0.06+0.84*pow(1.0-ndv,4.0);',
        '  vec3 r=reflect(-v,n); vec3 sky=mix(skyLo,skyHi,clamp(r.y*1.6,0.0,1.0))*0.86; vec3 trees=deep*0.55+vec3(0.02,0.035,0.02); vec3 refl=mix(trees,sky,smoothstep(0.03,0.24,r.y)); vec3 c=mix(deep,refl,fr);',
        '  float sp=pow(max(dot(r,normalize(sunDir)),0.0),220.0); c+=sunCol*sp*1.4;',
        /* 燈的倒影：水平方向要對準（窄），上下可以差很多（一條往看的人拉長的光柱）；波紋的法線把它打碎成一段一段 */
        '  if(lampK>0.0){ vec2 rh=normalize(r.xz+vec2(1e-5)); for(int i=0;i<8;i++){ if(i>=lampN) break; vec3 ld=normalize(lampP[i]-vW); float a=max(dot(rh,normalize(ld.xz+vec2(1e-5))),0.0); float e=r.y-ld.y; c+=lampC*lampK*pow(a,700.0)*exp(-e*e*30.0)*(0.35+0.65*fr)*1.6; } }',
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
    { const bz=cz+12.1, lz=cz+17.4; for(const x of [cx-11,cx+7]){ const b=BENCH(); place(g,b,x,bz,Math.PI); nav.blockRect(x,bz,1.4,0.7,0); seats.push({x,z:bz-0.06,yaw:Math.PI,label:'坐在映月湖畔的長椅'}); }
      for(const x of [cx-16,cx+12]){ const l=W3.lampPost(); place(g,l,x,lz,Math.PI); lamps.push(l); nav.blockCircle(x,lz,0.5); wmat.uniforms.lampP.value[wmat.uniforms.lampN.value++].set(x,3.95,lz-0.75); } }
    /* 北岸的路燈（ART-ECON-3D-GAP-1021 D，LAWWW2-B 11-01）：E12「湖對面的燈一盞一盞亮起來」（11/6 17:45 在南岸步道，那時已經天黑）原本北岸一盞燈都沒有。
       湖岸往外 3.4 m（岸邊的草叢在 1.6～2.4 m）、燈臂朝湖；四盞的位置避開北岸的三棵樹（離樹 3 m 以上）。外形 80 點的第 48、56、62、70 點 */
    for(const i of [48,56,62,70]){ const p=P[i], n=NR[i], x=p[0]+n[0]*3.4, z=p[1]+n[1]*3.4, ry=Math.atan2(-n[0],-n[1]); const l=W3.lampPost(); place(g,l,x,z,ry); lamps.push(l); nav.blockCircle(x,z,0.5);
      wmat.uniforms.lampP.value[wmat.uniforms.lampN.value++].set(x+Math.sin(ry)*0.75,3.95,z+Math.cos(ry)*0.75); }
    const lantern=[PX,2.28,PZ]; wmat.uniforms.lampP.value[wmat.uniforms.lampN.value++].set(lantern[0],lantern[1],lantern[2]);   /* 湖心亭的宮燈（正式模型 campus_lake.glb 的 lake_lantern_paper；光暈在 campus 的 build 加）*/
    return {mat:wmat,fb:lfb,cx,cz,lantern};
  }
  /* 醉月湖的正式模型（LAWWW2 tools/blender/env_second/campus_lake.py → campus_lake.glb，湖的本地座標＝原點在湖中心）：石砌湖岸、置石、湖心亭、2.3 m 寬的木棧道。
     亭子屋頂、橫梁加「樹幹透視」（鏡頭在亭子外面、人在亭子裡時網點透空）；湖岸、置石不投影。導航不變（lake() 裡已經照正式模型：亭子 2.0 m＋擋柱子、地板 0.05）*/
  function attachLakeGLB(E,g,lakeU,m){ m.name='campus_lake_glb'; m.position.set(lakeU.cx,0,lakeU.cz);
    m.traverse(o=>{ if(!o.isMesh) return; const nm=o.name+'|'+((o.material&&o.material.name)||''); o.receiveShadow=true; o.castShadow=!/lake_rim|lake_rocks/.test(nm);   /* 網格名（Blender 物件名）：lake_rim_stone、lake_rocks_rock、lake_pavilion_*、lake_boardwalk_* */
      if(/lake_pavilion_(tile|soffit|gold|teal|red)/.test(nm)&&E.patchSeeThrough){ o.material.userData.seeThrough=true; E.patchSeeThrough(o.material); }
      if(/lake_willow_(bark|willow)/.test(nm)){ const mt=o.material; if(E.patchSeeThrough&&!mt.userData.seeThrough){ mt.userData.seeThrough=true; E.patchSeeThrough(mt); } if(/willow_willow/.test(nm)){ o.castShadow=false; mt.alphaTest=Math.max(mt.alphaTest||0,0.5); mt.side=THREE.DoubleSide; } }   /* 垂柳（NTU-REF-1110 ③-3）：枝條是葉片卡（透明裁切、雙面、不投影）；樹幹、枝條擋住玩家時網點透空（和行道樹一樣）*/
      if(/lake_lantern_paper/.test(nm)){ const mt=o.material; mt.emissive=new THREE.Color(0xffc477); TK.addNight(mt,1.15,0); o.castShadow=false; } });   /* 宮燈的燈紙：和路燈同一個開關（校園 onLamps → CK.setNight → TK.setNight）*/
    g.add(m); if(lakeU.fb) lakeU.fb.visible=false; }
  function updateLake(L,E){ if(!L||!E.sky) return; const U=L.mat.uniforms, S=E.sky.material.uniforms; U.time.value=E.time||0; U.skyLo.value.copy(S.bot.value).lerp(S.mid.value,0.25); U.skyHi.value.copy(S.mid.value).lerp(S.top.value,0.5); U.sunDir.value.copy(S.sunDir.value); U.sunCol.value.copy(E.sun.color).multiplyScalar(Math.min(1.6,E.sun.intensity)); U.lampK.value=E.lampsOn?1:0; }
  function glowTex(){ return W3.canvasTex('glow',64,64,(x,w,h)=>{ const g=x.createRadialGradient(32,32,2,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.4,'rgba(255,255,255,0.35)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,w,h); }); }
  // ---------- 公館商圈 ----------
  const gongguan={ id:'gongguan', name:'公館', indoor:false, cityLight:1.0, size:[160,110], camDist:6.5, sunYaw:Math.PI/2, viewFar:240, fogNear:90, build(E){   /* sunYaw：公館的區域座標 +x 往南、+z 往西（羅斯福路南北向、校門在東邊；和校園的換算見 campusBackdrop），太陽方向要轉 90° */
    treeIdx=0; leafyCount=0; const g=new THREE.Group(); const W=160,D=110; const nav=new E3.NavGrid(W,D,0.5,-W/2,-D/2); const lamps=[]; const buildings=[];
    ground(g,W,D,W3.asphaltTex(),[W/6,D/6],0,0,0);
    // 人行道（北側靠校門）與騎樓街區
    ground(g,W,14,W3.stoneTex('#dcd5c8'),[40,4],0,-38,0.02); ground(g,W,16,W3.stoneTex('#dcd5c8'),[40,4],0,12,0.02); ground(g,W,40,W3.stoneTex('#d9d3c6'),[40,10],0,40,0.02);
    // 羅斯福路：車道線
    { const line=W3.canvasTex('lane',64,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(255,255,255,0.85)'; x.fillRect(28,0,8,120); }); for(const z of [-25,-19,-8,-2]){ const t=line.clone(); t.needsUpdate=true; t.repeat.set(1,40); const m=new THREE.Mesh(new THREE.PlaneGeometry(0.4,W),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:0.8})); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(0,0.03,z); m.receiveShadow=true; g.add(m); } /* 路中間的黃色雙實線（路面 z -31..4）*/ for(const z of [-13.65,-13.35]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(W,0.14),new THREE.MeshStandardMaterial({color:0xd9a93a,roughness:0.8})); m.rotation.x=-Math.PI/2; m.position.set(0,0.03,z); m.receiveShadow=true; g.add(m); } /* 車道線改成受光材質：晚上不會像螢光一樣亮 */ }
    { const zb=zebraMesh(34.2,12); zb.rotation.z=Math.PI/2; zb.position.set(0,0.034,-13.5); g.add(zb); }   /* GG-ZEBRA-1104：校門口過羅斯福路的斑馬線（北側人行道 z −31 到南側人行道 z 4，對面是輪轉單車）；導航照舊（整條路都走得到） */
    // 校門（北側牆中央）——回校園
    // v9.3 第十四批：和校園同一座校門（CK.gate），校外朝南；門房在圍牆裡面（舊版的門房在校外人行道上，而且沒有碰撞）
    const gate=CK.gate(); gate.name='gg_kit_gate'; placeGate(E,g,nav,gate,0,-46,0); { const wb=new TK.Bin(); const wt=campusWallMat(); for(const s of [-1,1]){ wb.add(wt,TK.boxG(70,1.8,1,1.0),s*44,0.9,-46); wb.add(TK.paint('#d9d3c6'),TK.boxG(70.2,0.14,1.2),s*44,1.87,-46); nav.blockRect(s*44,-46,70,1.2,0,0.3); } wb.build(g); }   /* 第二十批：和校園那邊同一個面磚材質（原本的磚紋貼圖被拉長成條紋）*/
    // 捷運公館站出口：人行道上順著街的玻璃亭（TK.mrtExit；原本是 W3 的四柱雨棚），入口朝東，入口外面是互動點
    { const mrt=TK.mrtExit({name:'捷運 公館站',sub:'出口 2'}); mrt.name='gg_kit_mrt'; mrt.position.set(-36.6,0,11); mrt.rotation.y=Math.PI/2; g.add(mrt); nav.blockRect(-39.8,11,6.6,3.6,0,0);
      /* 正式模型（LAWWW2-C tools/blender/env_second/gg_mrt_exit.py → bldg.gongguan_mrt，ART-EXT-MRT 2026-10-18）：同一個位置、方向；載入後藏起套件。
         裡面的電扶梯、樓梯往地面以下走（PIT_*）：先畫 PIT_*（renderOrder −2），再畫洞口的深度遮罩 PITMASK（只寫深度，−1），之後畫的地面在洞口那一塊畫不上去——區域的地面不用挖洞 */
      if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.gongguan_mrt']){ mrt.userData.ggMrt=true; mrt.userData.dyn=true;
        ASSETS.loadOne('bldg.gongguan_mrt').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true); root.position.copy(mrt.position); root.rotation.copy(mrt.rotation);
          attachWenzhouModel(E,g,root,'ggMrt','gongguan_mrt_glb');
          root.traverse(o=>{ if(!o.isMesh) return; if(/^PIT_/.test(o.name)){ o.renderOrder=-2; o.castShadow=false; } if(o.name==='PITMASK'){ o.material=new THREE.MeshBasicMaterial({colorWrite:false,side:THREE.DoubleSide}); o.renderOrder=-1; o.castShadow=false; o.receiveShadow=false; } }); }).catch(e=>console.warn('捷運出口正式模型載入失敗，用套件',e)); }
      /* 鏡頭碰撞照正式模型 gongguan_mrt_exit.glb 地面以上的外框（x −43～−35.78、z 8.73～13.27；GG-DOOR-CAMS-1104：原本 x 只到 −36.6、z 9.3～12.7，
         頁間書屋門前 6 m（−36.4, 15）往店門看時鏡頭在出口亭東端後面，整個畫面是亭子的牆）。導航阻擋不動 */
      const m=new THREE.Mesh(new THREE.BoxGeometry(7.22,3.4,4.54),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(-39.39,1.7,11); m.name='gg_mrt_camcol'; g.add(m); E.colliders.push(m);
      E.interactables.push({x:-35.6,z:11,radius:2.4,label:'捷運公館站入口',mrt:true}); }
    // 店面街（南側）：連續騎樓的台北街屋（TK.apartment；v9.3 第十一批取代 LEVEL_BLOCKOUT 方盒＋另外搭的柱子與招牌）
    /* 立面在 z=19、面向羅斯福路（人行道 z 4–19）；騎樓 3 m 深、整排連續可以走（柱子落在店與店的分界），店面玻璃在 z=22。
       舊版店面在 z=52，和馬路之間隔著 30 m 空蕩蕩的鋪面廣場（LEVEL_BLOCKOUT 留下的），整個南側往北搬 30 m：店面、互動點、立牌、捷運入口、圓環、往溫州街的出口、
       從麵店／書店／便利商店出來的位置、路人路線（story3d.js）一起搬。各店的 x 位置不變；舊版店與店之間 1.2 m 的縫併進左邊那間；x=15.6 以東補上沒有互動的店面，整排店接到街尾。 */
    const addCol=(x,z,w,d,y0,y1)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,y1-y0,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x,(y0+y1)/2,z); g.add(m); E.colliders.push(m); };
    const shops=[{n:'公館燒臘',c:'#c9463d',w:10,type:'noodle',it:'noodle',sub:'叉燒・燒鴨・油雞',v:'公館燒臘'},{n:'青木茶室',c:'#2f7d5b',w:8,type:'tea',it:'tea',sub:'手搖飲・現煮珍珠'},{n:'頁間書屋',c:'#3b5a8c',w:12,type:'book',it:'books',sub:'法律書・文具・二手書',v:'頁間書屋',door:-36.4},{n:'日和便利店',c:'#3a6fb0',w:10,type:'cvs',it:'cvs',band:'#e0a030'},
      {n:'安泰藥局',c:'#f5f5f2',sc:'#1f5a3a',w:8,type:'none',it:'cvs',v:'藥局'},{n:'洋洋鹹酥雞',c:'#e0b24a',sc:'#3b2a1e',w:8,type:'none',it:'luwei',gg2:'yangyang'},{n:'慢輪單車',c:'#b5532c',w:9,type:'bike',it:'bike',sub:'修車・打氣・配件加裝',v:'單車'},{n:'afar café',c:'#8c3b47',w:9,type:'none',it:'cafe',gg2:'afar'},
      {n:'汀州鮮果',c:'#e8a33a',sc:'#3b2a1e',w:8,type:'none',it:'fruit'},{n:'',c:'#8f9295',w:9,type:'none',it:'laundry',shut:true},{n:'',c:'#8f9295',w:9,type:'none',it:'print',lane:true},{n:'花序 Flower Notes',c:'#f4efe6',sc:'#3b2a1e',w:10,type:'none',it:'cafe'},{n:'轉角唱片',c:'#2b2b2b',w:8,type:'none',it:'books',gg2:'corner_records'},{n:'榮恩典文具社',c:'#f2ede0',sc:'#1a1a1a',w:9,type:'none',it:'books'},{n:'Daybreak',c:'#c9463d',w:9,type:'none',it:'cafe',gg2:'daybreak'}];
    /* GG-SHOPS3-SYS-1110（使用者 11-10 18:5x 正式規格 X320，docs/handoff/user_specs/GG_SHOPS3_1110.md）：G04 安泰藥局、G08 汀州鮮果、G09 洗樂洗衣坊、G10 印得好、G11 泰米村食（泰式，取代日日定食；it 改 noodle、不用日式布簾）、G13 榮恩典文具社；
       2026-11-11：洗樂、印得好、泰米村食搬到汀州路（X321）以後——G09、G10 使用者選「先拉下鐵門」（X335；shut:true＝套件畫鐵捲門、沒有招牌，之後放什麼店使用者決定）；G10 使用者 11-11 選「改成真的巷口」（lane:true＝一樓是通往汀州路的巷口，不放店）、G11 是花序 Flower Notes（X325）；
       這裡是套件（備用）招牌的字和顏色（照使用者第三節的燈箱顏色），正式招牌在 LAWWW2 的 gongguan_shops GLB；棟號、座標、寬度不動 */
    const FZ=19, GH=4.2, ARC=3.0, SHOPD=16, WALLC=['#d9cbb0','#cfc5b2','#e3ddd0','#c8bca8','#d6c3a5','#e6dfd0','#bfb2a0'], WALLT=['tile','mosaic','tile','plaster'];
    /* 店面街 15 棟＋巷口轉角（userData.ggShop＝棟號 G00–G15）：有 Blender 正式模型（bldg.gongguan_shops，第二個 AI：tools/blender/env_second/wz_street.py --set gongguan）時不參加整區靜態合併，
       模型載入後把套件外觀藏起來；?nobldg 或載入失敗時照舊是套件。導航阻擋、鏡頭碰撞、柱子、互動點都不變（照套件算） */
    const ggGLB=typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.gongguan_shops']; const ggTag=(b,id)=>{ b.userData.ggShop=id; if(ggGLB) b.userData.dyn=true; };
    let x=-68; shops.forEach((s,i)=>{ const last=i===shops.length-1; const X0=x, X1=x+s.w+(i<8&&!last?1.2:0), W=X1-X0, cx=(X0+X1)/2;
      // 柱子（TK 區域座標；建築轉 180°，區域 +x＝世界西側）：西邊分界一根；沒有互動的寬店面中間再一根（有互動的店門口前面不放柱子）；最後一間另加東邊盡頭
      const pl=[W/2]; const nb=(s.type==='none'&&![4,5,7,8,10,11,12,13,14].includes(i))?Math.max(1,Math.round(W/5)):1;   /* 第二批四間（AA_650：洋洋、Afar、轉角、Daybreak）變成進得去的店：店門前不放中間那根柱子（和 wz_street.py 的 gongguan_shops 一樣）*/ for(let k=1;k<nb;k++) pl.push(W/2-k*W/nb); if(last) pl.push(-W/2);
      const b=TK.apartment({w:W,d:SHOPD,floors:4+((i*5)%4),fh:3.1,groundH:GH,wall:WALLT[i%4],color:WALLC[i%7],balcony:i%3===1,tank:i%2===0,roofAdd:i%5===3,ground:{type:'arcade',through:true,pillars:pl,shop:{shut:s.shut,lane:s.lane,type:s.it,name:s.n,sub:s.sub,signBg:s.c,signColor:s.sc||'#ffffff',band:s.band,vertical:s.v,vBg:'#ffffff',vColor:s.c,vBand:s.c}}});
      b.position.set(cx,0,FZ); b.rotation.y=Math.PI; g.add(b); buildings.push(b); ggTag(b,'G'+String(i).padStart(2,'0'));
      for(const lx of pl) nav.blockRect(cx-lx,FZ+0.3,0.55,0.55,0,0.1);
      // 鏡頭碰撞：店面玻璃後面的本體＋騎樓上方的樓層（在騎樓裡鏡頭不會被拉到臉前面，也不會穿到樓上）
      addCol(cx,FZ+ARC+0.3+(SHOPD-ARC-0.3)/2,W,SHOPD-ARC-0.3,0,b.userData.h+1); addCol(cx,FZ+(ARC+0.3)/2,W,ARC+0.3,GH-0.35,b.userData.h+1);
      const ix=x+s.w/2;
      if(s.type==='noodle') E.interactables.push({x:ix,z:FZ+2,radius:2.2,label:'進入公館燒臘',exit:{to:'noodle',spawn:{x:0,z:3.4,yaw:Math.PI}}});
      /* 青木茶室進得去坐（GG-SHOPS-REDO-1104，AA_647 第 1 節；新區域 aoki，配置 src/data/aoki_layout.js）：門在店面中間偏西（配置的門 x 1.85＝世界 cx−1.85，房間轉 180°）；
         門口的「外帶」照舊（AA_647 第 6 節的三種茶；AA_653 A：兩個都要），店裡吧台的「點茶」是內用（src/ggshops_sys3d.js）。沒有 aoki 區域（配置檔沒載入）時照舊是門口的「買一杯飲料」 */
      if(s.type==='tea'){ if(ZONES.aoki){ E.interactables.push({x:+(cx-SHOP_IN.aoki.door).toFixed(2),z:FZ+2,radius:2.2,label:'進入青木茶室',exit:{to:'aoki',spawn:inSp('aoki')}});
          E.interactables.push({x:+(cx-SHOP_IN.aoki.take).toFixed(2),z:FZ+2,radius:1.2,label:'外帶',shop:'tea',ggsTake:true}); }   /* AA_653 A：門口的外帶窗口照舊（AA_647 第 6 節三種茶、key「清葉茶行」）；窗口在門的西邊（配置 front.takeaway 的中間）；打烊、颱風天＝src/ggshops_sys3d.js 的門口那一句 */
        else E.interactables.push({x:ix,z:FZ+2,radius:2.2,label:'買一杯飲料',shop:'tea'}); }
      if(s.type==='book') E.interactables.push({x:s.door!=null?s.door:ix,z:FZ+2,radius:2.2,label:'進入頁間書屋',exit:{to:'bookstore',spawn:inSp('bookstore')}});   /* door：頁間書屋的門在店面最左邊（LAWWW2 新外觀 fb5d7f367；2026-11-04 從店面中間 −41.6 移到 −36.4，z 照舊）*/
      if(s.type==='cvs') E.interactables.push({x:ix,z:FZ+2,radius:2.2,label:'進入便利商店',exit:{to:'cvs',spawn:inSp('cvs')}});   /* 進門站的地方照配置（SHOP_IN；GG-SHOPS-REDO-1104）*/
      /* 公館第二批（GG-SHOPS2-1104；USER_WANTS X209；AA_650、AA_652）：afar café（G07）、Daybreak（G14）進得去（新區域 afar、daybreak，配置 src/data/afar_layout.js、daybreak_layout.js）。
         門照配置的門 x（房間轉 180°：世界 cx − door；afar 7.93、Daybreak 70.94，和下面騎樓機車讓開的 DOORS 同一個位置）；營業時間在 places.js，打烊時按門＝src/gg2shops3d.js 寫開放時間（Daybreak 15:00 以後是木牌那一句）。
         配置沒載入＝沒有區域、門口照舊沒有互動點。
         轉角唱片（G12；CORNER-IN-1107）：新區域 corner_records（CC 的 bb_support/corner.glb v1c、LAWWW2-B 改原型分組 38f4021e1 MODEL_READY＋src/data/corner_layout.js，cc-testing 4fc38d513），門 x 1.63（世界 53.97）；台詞 AA_725＝src/gg2shops3d.js。
         洋洋鹹酥雞（G05；YANGYANG-IN-1107）：新區域 yangyang（BB 的 bb_support/yangyang_interior.glb＋src/data/yangyang_layout.js v3，LAWWW2 驗收 ART_APPROVED），門 x 1.2（世界 −10.6）；台詞 AA_724＝src/gg2shops3d.js */
      if(s.gg2&&ZONES[s.gg2]) E.interactables.push({x:+(cx-SHOP_IN[s.gg2].door).toFixed(2),z:FZ+2,radius:2.2,label:'進入 '+GG2_NAME[s.gg2],exit:{to:s.gg2,spawn:inSp(s.gg2)}});
      x=X1; });
    /* 輪轉單車（G06，正對校門；LAWWW2-B 2026-10-16，原本是「眼鏡・手機維修」）：店名虛構（D77）。街景——載妹墊開局就有（使用者 10-16，D78），不用在這裡裝、沒有互動點。
       騎樓靠櫥窗停三台（和店面平行，騎樓還有 1.6 m 寬可以走；店門口 x −2.1～1.7 不放車）、櫥窗裡兩台、騎樓外一塊立牌。
       店門口互動點「找車行老闆」（−0.3, FZ+2，r 2.2，和麵店、茶行、書店、便利商店同一排同一個距離；LAWWW2-B 10-23，順手的事 SQ16（AA_405）要用）：
       shop:'bike'——story3d.js 的互動照 SIDEQ.bikeShop(GM) 演（車行老闆的招呼、SQ16）；SIDEQ 沒有 bikeShop 的版本不顯示（不出一個按了沒反應的按鈕）*/
    { const sx=0.3; for(const [dx,c,k] of [[-3.3,'#2f5d50','bike_road'],[2.3,'#e0b95b','bike_city'],[4.2,'#8c3b47','bike_mtb']]){ const b=W3.bikeAny(c,0,k);   /* 腳踏車行（輪轉單車）：騎樓擺公路車、淑女車、登山車 */ b.position.set(sx+dx,0,FZ+2.55); b.rotation.y=Math.PI/2; g.add(b); nav.blockRect(sx+dx,FZ+2.55,k==='bike_mtb'?1.85:1.75,0.6,0); }
      for(const [dx,c,k] of [[-2.2,'#3a6fb0','bike_fold'],[1.6,'#d9d3c6','bike_road']]){ const b=W3.bikeAny(c,0,k);   /* 櫥窗：小折、公路車 */ b.position.set(sx+dx,0.155,FZ+3.75); b.rotation.y=-Math.PI/2; g.add(b); }
      /* 慢輪單車進得去（AA_646 第 1 節；使用者 11-04 01:0x；BIKE-SHOP-PARK-1104）：營業時間（PLACES.hours.bikeshop 10:00～20:00、週一公休）「進入慢輪單車」，打烊時門口的字；
         老闆、SQ16 改在店裡（src/bikeshop3d.js）。沒有 bikeshop3d.js 的版本照舊「找車行老闆」 */
      if(typeof BIKESHOP!=='undefined'&&!!ZONES.bikeshop){ E.interactables.push({x:sx-0.6,z:FZ+2,radius:2.2,label:'進入慢輪單車',exit:{to:'bikeshop',spawn:Object.assign({},BIKESHOP.SPAWN||{x:0,z:3.8,yaw:Math.PI})},get hidden(){ return !BIKESHOP.isOpen(); }});
        E.interactables.push({x:sx-0.6,z:FZ+2,radius:2.2,label:'慢輪單車',look:BIKESHOP.CLOSED,get hidden(){ return BIKESHOP.isOpen(); }}); }
      else E.interactables.push({x:sx-0.6,z:FZ+2,radius:2.2,label:'找車行老闆',shop:'bike',get hidden(){ return !(typeof SIDEQ!=='undefined'&&SIDEQ.bikeShop); }});
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
      /* 路名牌「溫州街」拿掉（WZ-ENTRY-XINSHENG-1103，X199：溫州街只從新生南路進出，這條巷子不再通溫州街；柱子、反光鏡照留）*/
      /* 巷口用一排住戶的盆栽擋起來（看得出來走不進去，不是隱形牆，D36）：巷子的柏油、轉角公寓、麵店側面照留；導航在下面「通往溫州街」那裡擋 */
      { const pt=TK.pots(14,71); pt.position.set(-73.9,0,FZ+1.15); g.add(pt); pt.name='gg_lane_closed_pots'; }
      const mir=TK.trafficMirror(); mir.position.set(-68.35,0,FZ-0.5); mir.rotation.y=-2.4; g.add(mir); nav.blockCircle(-68.35,FZ-0.5,0.2); }
    // 騎樓外的立牌（店門口前面、騎樓柱子外側；不擋騎樓，也不擋從店裡出來的位置）
    for(const [ax,ls] of [[-66.2,['今日推薦','蜜汁叉燒','三寶飯 130']],[-49.8,['本日推薦','冬瓜檸檬','大杯 45']],[-45.4,['二手法律書','教科書收購','國考用書']]]){ const ab=TK.aBoard(ls); ab.position.set(ax,0,FZ-0.6); ab.rotation.y=Math.PI; g.add(ab); nav.blockCircle(ax,FZ-0.6,0.35); }
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
      const tm=W3.mergeGroup(trees); tm.name='gg_kit_trees'; tm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); g.add(tm);
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
        if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.gongguan_far']) ASSETS.loadOne('bldg.gongguan_far').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true); r.name='gongguan_far_glb';
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
          有互動的店門口（麵店、茶行、書店、便利商店、輪轉單車）前後各留 2.6 m、往溫州街的巷口不停車（頁間書屋的門 11-04 移到 x −36.4：原本 −38.4～−32.6 那一段機車搬到舊門口前 −43.4～−39.6，LAWWW2）；機車一段跨一根柱子，隔一根柱子留缺口，從廣場走得進騎樓。
       ② 捷運出口東邊、圓環東邊各一個腳踏車停車架（和校園同一套 W3.bikeRack：整排合成一塊）。
       ③ 人行道上一排行道樹（樹穴＋矮緣石），避開路人的斜線（(−40,14.5)→(0,10)→(40,14)）和路邊的機車。
       導航阻擋在套件階段就加（機車、車架、樹本來就是套件畫的，正式模型只換機車的外觀）。測試：tests/gongguan_layout_nav.py、tests/reachability_all.py（公館）、node tests/street_props_nav_unit.js */
    { const DOORS=[-63,-52.8,-36.4,-29.4,-10.6,-0.3,7.93,53.97,70.94], clear=x=>DOORS.every(d=>Math.abs(x-d)>2.6)&&x>-66; let seg=0;
      for(const [x0,x1] of [[-59.8,-55.8],[-49.6,-44.6],[-43.4,-39.6],[-25.2,-21.2],[-16.4,-13.4],[-6.8,-3],[2.4,5.2],[13.6,17.6],[21.6,25.6],[30.6,34.6],[39.6,43.6],[47.6,51.2],[57.6,61.6],[64.6,68.2]]){   /* 每一段跨在一根騎樓柱子前面，下一根柱子前面空著＝從廣場走進騎樓的缺口（柱子兩側各 2 m 多）*/
        const n=Math.min(5,Math.max(2,Math.floor((x1-x0-0.5)/0.85)+1)), xc=(x0+x1)/2; if(!clear(x0)||!clear(x1)) console.warn('騎樓前的機車擋到店門口',x0,x1); scRow(xc,18.15,n,0,'A'+(seg++)); } }   /* 一段一組：機車的近／遠模型照「鏡頭到這一組中心」切換（attachWzScooters 的 LOD），一組 30 m 寬時整組 20 台都用近的模型，三角形多 7～9 萬 */
    for(const [x,z,n] of [[-14.5,9.2,7],[34,9.2,8]]){ const r=W3.bikeRack(n); r.name='gg_bike_rack'; place(g,r,x,z,Math.PI); nav.blockRect(x,z,n*0.6+0.6,1.4,0); }   /* 停車架：車頭朝騎樓（π）、整排一塊 */
    for(const [x,z,ry] of BIKE_RACKS.gongguan){ const r=W3.bikeRack(7); r.name='gg_bike_rack'; place(g,r,x,z,ry); nav.blockRect(x,z,4.6,1.6,-ry); }   /* BIKE-PARK-1104：校門外 */
    { const pitM=new THREE.MeshStandardMaterial({color:0x3b332b,roughness:1}), curbM=new THREE.MeshStandardMaterial({color:0xa8a49c,roughness:0.85}), pit=new THREE.Group(); pit.name='gg_tree_pits';
      for(const [x,z] of [[-53,9.4],[-7,9.0],[7.5,9.0],[46,9.6],[58,9.6]]){ const t=TREE(0.95); t.name='gg_street_tree'; place(g,t,x,z,(x*0.37)%6.28); nav.blockCircle(x,z,0.7);
        const soil=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.3),pitM); soil.rotation.x=-Math.PI/2; soil.position.set(x,0.012,z); pit.add(soil);
        for(const [dx,dz,w,d] of [[0,-0.69,1.5,0.1],[0,0.69,1.5,0.1],[-0.69,0,0.1,1.3],[0.69,0,0.1,1.3]]){ const c=new THREE.Mesh(new THREE.BoxGeometry(w,0.08,d),curbM); c.position.set(x+dx,0.04,z+dz); c.receiveShadow=true; pit.add(c); } }   /* 樹穴：黑土＋一圈矮緣石（整區合併時併成兩塊）*/
      g.add(pit); }
    for(let i=0;i<9;i++){ const l=W3.lampPost(); place(g,l,-63+i*18,-31.4,0); lamps.push(l); nav.blockCircle(-63+i*18,-31.4,0.5); /* 北側路燈原本在 z=-24（馬路的車道上），移到人行道邊 */ const l2=W3.lampPost(); place(g,l2,-63+i*18,5,Math.PI); lamps.push(l2); nav.blockCircle(-63+i*18,5,0.5); }
    for(let i=0;i<6;i++){ const t=TREE(0.9); place(g,t,-65+i*26,-36,0); nav.blockCircle(-65+i*26,-36,0.7); }
    nav.blockRect(-30,15.1,7.2,1.0,0); for(const fx of [-34.2,-25.8,-25.0]) nav.blockCircle(fx,15.1,0.25);   /* 捷運出口東邊的 GONGGUAN 花台、三朵藍色小花（bldg.gongguan_far；夾在路人 z 16.5、(−40,14.5)→(0,10) 兩條路線中間） */
    /* 捷運站口的花攤「晨露花舖」（GG-FLOWER-STALL-1110）拿掉了：使用者 2026-11-10（X325）升級成 G11 的雙層花藝店「花序 Flower Notes」（區域 flower_notes，src/flower_notes3d.js），舊花攤完全取代——
       阻擋、互動點、模型載入一起拿掉；買花的互動點 kind gg_flower 搬到花序一樓的收銀櫃檯前。 */
    // 集合點：公館圓環意象（小廣場）
    { const c=new THREE.Mesh(new THREE.CylinderGeometry(3,3,0.3,24),M('#d9cbb0')); c.position.set(22,0.15,11.5); g.add(c); nav.blockCircle(22,11.5,3.2); const tree=TREE(1.2); place(g,tree,22,11.5,0); }
    /* 公館往溫州街的巷口拿掉（WZ-ENTRY-XINSHENG-1103；使用者 X199，11-03 選擇題：「溫州街主要入口應該是新生南路側門 溫州街就在新生南路後面」、公館那頭的巷口「拿掉」）：
       原本這裡是「往溫州街」(−71, FZ+1.2) → 溫州街東端 (51.3, −9.8)。現在溫州街只從新生南路（西側橫巷北口）進出；從公館去溫州街＝回校園 → 新生南路側門 → 新生南路「往溫州街」。
       巷口 x −74～−68、z 19～22（騎樓那一段）擋起來（盆栽在上面畫）；只擋巷口那一小塊，騎樓、人行道照舊走得通（tests/wz_entry_xinsheng_unit.js）*/
    nav.blockRect(-71,FZ+1.4,6.2,3.2,0);
    nav.blockOutside(-78,-45,78,FZ+2.6); /* 南側騎樓（z 19–22，店面玻璃在 z=22）要可走，互動點在 z=21 */ for(let z=-2;z<=2;z+=0.5) for(let x=-78;x<=-74;x+=0.5){} for(let xq=-79;xq<=-74;xq+=0.5) for(let zq=9;zq<=15;zq+=0.5){ const [cx,cz]=nav.toCell(xq,zq); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    for(const lx of gate.userData.gate.lanes) for(let z=-50;z<=-44;z+=0.5) for(let xq=lx-2.1;xq<=lx+2.1;xq+=0.5){ const [cx,cz]=nav.toCell(xq,z); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }   /* 校門兩側通道（門房在正中間，2026-10-18 起；原本開的是開口正中間 x -4～4）*/
    placeBlocks(nav,gate,0,-46,0);   /* 開完通道再把門房、燈柱、鐵門擋回去 */
    for(const ex of gateExits(gate,0,-46,0,-1.5,2.5,{})) E.interactables.push({x:ex.x,z:ex.z,radius:ex.r,label:'回到校園',exit:{to:'campus',spawn:{x:-119,z:0,yaw:Math.PI/2}}});   /* 門房在校門正中間：兩側通道（校內那一側）各一個，(±5.27,-47.5)（2026-10-18；原本 (0,-48) r3，現在是門房）*/
    /* 店面街的鏡頭碰撞在上面逐間加（TK 建築的原點在立面上，不能用舊的 footprint 置中方盒）*/
    for(const l of lamps){ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd88a,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(3,3,1); glow.position.set(0,3.9,0.75); l.add(glow); glow.visible=false; E.lampGlows.push(glow); const pool=new THREE.Mesh(new THREE.CircleGeometry(4.2,16),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(0,0.03,0.75); l.add(pool); pool.visible=false; E.lampGlows.push(pool); }
    // 招牌、店內、窗戶的夜間亮度跟著時間漸變（和溫州街同一套：17:24 開始、19:12 全亮）
    const zoneTime=(h)=>{ let k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); TK.setNight(Math.max(0,Math.min(1,k))); };
    /* 騎樓的板凳（ZQ-ARCADE-SEAT-1028，LAWWW2-B 11-01）：G07／G08 交界那根柱子（x 15.6、z 19.3）靠騎樓那一面一張紅色塑膠凳（背靠柱子、面向騎樓），柱子那一面離地 35 cm 一個插座（她左手邊）（都在 gongguan_shops.glb：wz_shopkit.py 的 G08 clutter）。
       子晴（heroine_04）linger 在 (16, 20.6)「坐在騎樓下的插座旁邊，筆電開著」：作息的 seatAt 找這一張（3.5 m 內最近的空位）；玩家也坐得下去。凳子只在正式模型裡，模型沒有登記就不放座位 */
    const seats=ggGLB?[{x:15.6,z:19.8,yaw:0,label:'坐在騎樓的板凳',kind:'stool'}]:[];
    for(const s of seats) E.interactables.push({x:s.x,z:s.z,radius:1.4,label:s.label,seat:s});
    /* 預設落點（沒給落點就用這個；手機「地點」的「公館商圈」同一點，src/data/places.js）：面向南邊的店（yaw 0），鏡頭在背後、校門那一側。
       原本 yaw π（面向校門）：鏡頭在羅斯福路那一側看著校門，店在鏡頭後面——要去店裡只能往鏡頭走，鏡頭不會轉（CAM-GONGGUAN-GATE-1107，CC 試玩 8/30 07:51，LAWWW2-B）。
       位置和「走出校門」同一點 (−2.5, −29)：原本 (0, −30) 鏡頭和人中間是校門正前方那一台機車 (0, −32)（BB-B 11-07 18:40 P3，直向擋住腿）*/
    const zone={group:g,nav,spawn:{x:-2.5,z:-29,yaw:0},lamps,buildings,seats,applyTimeOutdoor:zoneTime,onLamps(on){}};
    // 店面街的 Blender 正式模型（第二個 AI）：載入後藏起套件外觀（和溫州街同一套接法；招牌、直立招牌合成一張 atlas，晚上照 TK.setNight 發光）；失敗或 ?nobldg 時維持套件
    gateGLB(E,g,gate,0,-46,0,zone);   /* 校門（ART-EXT-GATE）：和校園同一個模型 */
    /* GG-LANE-CLOSE-1110（X199 配套，LAWWW2 帳號 A 11-10；LAWWW 14:21 派）：往溫州街那條巷子，騎樓店面玻璃那條線往裡 0.3 m 一道住戶的鐵門（混凝土門柱、深綠鐵門、「私人巷道 請勿進入」告示牌），
       tools/blender/env_second/gg_lane_gate.py → bldg.gg_lane_gate（這一區的座標）。正式模型 gongguan_shops.glb 照舊看得到巷子往南延伸，現在一看就是關著的門（D36，不是隱形牆）。
       導航不動：巷口那一塊照舊是上面的 blockRect、門後面本來就在 blockOutside 外面。載入失敗＝只有盆栽（和原本一樣）。測試：node tests/gg_lane_close_unit.js */
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.gg_lane_gate']){
      ASSETS.loadOne('bldg.gg_lane_gate').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true); attachWenzhouModel(E,g,r,'ggLaneGate','gg_lane_gate_glb'); r.userData.dyn=true; }).catch(e=>console.warn('公館巷口鐵門載入失敗（照舊只有盆栽）',e)); }
    if(ggGLB) ASSETS.loadOne('bldg.gongguan_shops').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true); attachWenzhouModel(E,g,r,'ggShop','gongguan_shops_glb'); shopInsideLit(r,zone,GG_IN_PLACE); shopInsideReal(E,g,zone,GG_SHOP_REAL); propBlocks(nav,GG_PROP_BLOCKS); propReStand(E,nav); ggShopLit(r,zone,GG_SHOP_REAL); }).catch(e=>console.warn('公館店面正式模型載入失敗，用套件的外觀',e));
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
    aptA(8.4,20,{wz:'A3',floors:4,wall:'tile',color:'#c9b49a',balcony:true,ground:{type:'shop',shop:{type:'books',name:'溫州書屋',sub:'二手書・人文社會・法律',signBg:'#2f4a3a',signColor:'#f4ead8',serif:true,awning:'#2f4a3a',vertical:'書',vBg:'#f4ead8',vColor:'#2f4a3a',vBand:'#2f4a3a'}}});
    aptA(32,40,{wz:'A4',floors:4,wall:'plaster',color:'#e8e1d4',ground:{type:'shop',shop:{type:'noodle',name:'林家乾麵',sub:'乾麵・餛飩・滷味',signBg:'#f4ead8',signColor:'#9c2f2a',vertical:'麵',vBg:'#ffffff',vColor:'#9c2f2a',vBand:'#9c2f2a',awning:'#9c2f2a'}}});
    aptA(40,48,{wz:'A5',floors:3,wall:'tile',color:'#b8a088',roofAdd:true,ground:{type:'shop',shop:{type:'cvs',name:'日和便利店',sub:'24H',signBg:'#f4efe2',signColor:'#5a6b2e',band:'#e8a33a',frame:'#cfd6d6'}}});
    // B 側
    aptB(-30,-21,{wz:'B1',floors:3,wall:'plaster',color:'#d8d0c0',roofAdd:true,ground:{type:'shutter'}});
    aptB(-21,-15,{wz:'B2',floors:4,wall:'tile',color:'#bfb3a3',ground:{type:'shop',shop:{type:'laundry',name:'常在洗衣',sub:'24 小時・投幣式',signBg:'#e9f2f6',signColor:'#2a5f8a',frame:'#cfd6d6'}}});
    aptB(-9.6,4,{wz:'B3',floors:5,wall:'tile',color:'#d5c7b0',ground:{type:'shop',shop:{type:'teishoku',name:'小路',sub:'居酒屋',signBg:'#1f2e45',signColor:'#f4ead8',serif:true,awning:'#1f2e45',vertical:'酒処',vBg:'#f4ead8',vColor:'#1f2e45',vBand:'#1f2e45'}}});
    aptB(4,16,{wz:'B4',floors:4,wall:'mosaic',color:'#d8d2c6',ground:{type:'door',color:'#2f4a3a'}});
    aptB(16,30,{wz:'B5',floors:4,wall:'tile',color:'#cbbba3',ground:{type:'arcade',shop:{type:'tea',name:'帝大紅茶',sub:'手搖飲・現煮珍珠',signBg:'#f4ead8',signColor:'#5c3a21',band:'#7a9a5a'}}});
    aptB(30,40,{wz:'B6',floors:5,wall:'plaster',color:'#e6dccb',ground:{type:'shop',shop:{type:'fruit',name:'阿忠鮮果',sub:'當季水果・果汁',signBg:'#f2b33e',signColor:'#5c2a1a'}}});
    aptB(40,48,{wz:'B7',floors:4,wall:'tile',color:'#a89a88',ground:{type:'door',color:'#8a3a2a'}});
    // 巷底與遠景（讓巷子看起來還有延伸）
    { const b=TK.apartment({w:12,d:10,floors:5,wall:'tile',color:'#c7b9a3',detail:false,ground:{type:'door'}}); b.position.set(5.75,0,21); b.rotation.y=Math.PI; g.add(b); buildings.push(b); wzTag(b,'F1'); addCollider(5.75,26,12,10,17); }
    { const b=TK.apartment({w:12,d:10,floors:4,wall:'mosaic',color:'#d6d0c2',detail:false,ground:{type:'shutter'}}); b.position.set(-12.25,0,-20); g.add(b); buildings.push(b); wzTag(b,'F2'); addCollider(-12.25,-25,12,10,14); }
    const XSL=typeof XS3!=='undefined'&&typeof XINSHENG_LAYOUT!=='undefined';   /* 新生南路（ART-XINSHENG-GATE-1103）：西側橫巷的北口打開（遠景 F4 拿掉；正式模型 wz_street.py 也拿掉了），往北走出去是新生南路 */
    for(const [x,z,ry,w,f,c] of [[-33.4,16.2,Math.PI,9,4,'#cfc4b2'],[-33.4,-16.2,0,9,5,'#d9cdb8']].filter(q=>!(XSL&&q[1]<0))){ const b=TK.apartment({w,d:10,floors:f,wall:'tile',color:c,detail:false,ground:{type:f>5?'shop':'door',shop:{type:'cvs',name:'新生大樓',sub:'',signBg:'#f4f1ea',signColor:'#333'}}}); b.position.set(x,0,z); b.rotation.y=ry; g.add(b); buildings.push(b); wzTag(b,z>0?'F3':'F4'); addCollider(x,z,ry%Math.PI?10:w,ry%Math.PI?w:10,30); }
    if(XSL){ open(-36.4,-29.6,-30.6,-15); { const r=TK.road(15,6.6); r.position.set(-33.4,0.002,-22.4); r.rotation.y=Math.PI/2; g.add(r); }
      E.interactables.push({x:-33.4,z:-28.4,radius:2.2,label:'往新生南路',exit:{to:'xinsheng',spawn:{x:XINSHENG_LAYOUT.wenzhouLane.exit.x+2.8,z:XINSHENG_LAYOUT.wenzhouLane.exit.z,yaw:Math.PI/2}}}); }   /* 溫州街靠新生南路那一頭（AA_617 第 1 節：轉角是日常失速）；回來落在新生南路那一側巷口、面向馬路；離「往溫州街」2.8 m，在它的範圍（2.4）外面（tests/spawn_exit_unit.js）*/
    // 西端（巷底）：住家公寓。v9.2 起兩點半 Café 搬到東端路口（門面朝西，傍晚夕陽沿著巷子照到店門口）
    { const endB=TK.apartment({w:14,d:13,floors:4,wall:'tile',color:'#cdbfa8',balcony:true,ground:{type:'door',color:'#5c3a21'}}); endB.position.set(-37.2,0,-1); endB.rotation.y=Math.PI/2; g.add(endB); buildings.push(endB); wzTag(endB,'W0'); nav.blockRect(-43.7,-1,13,14,0,0); addCollider(-43.7,-1,13,14,16); }
    // 東端路口：兩點半 Café（一樓咖啡廳＋樓上住家；正對主巷，從公館走進溫州街第一眼就看到）
    const cafeB=TK.apartment({w:14,d:13,floors:3,fh:3.2,groundH:3.8,wall:'tile',color:'#e6d9c4',balcony:true,tank:false,grille:'#3b2a1e',ground:{type:'shop',shop:{type:'cafe',name:'2:30 AM',sub:'Business Hours 11:00 – 02:30',signBg:'#3b2a1e',signColor:'#f4ead8',serif:true,awning:'#3b2a1e',frame:'#3b2a1e'}}}); cafeB.position.set(55.4,0,0); cafeB.rotation.y=-Math.PI/2; g.add(cafeB); buildings.push(cafeB); cafeB.userData.dyn=true;   /* 不參加整區靜態合併：Blender 正式模型（bldg.cafe_exterior）載入後要能把套件外觀藏起來 */ nav.blockRect(61.9,0,13,14,0,0); addCollider(61.9,0,13,14,14);
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
    for(const [z,ry,c,id,w] of [[11,Math.PI/2,'#d4c6b0','W1',10],[-13.5,Math.PI/2,'#cbbfae','W2',11]]){ const b=TK.apartment({w,d:12,floors:4,wall:'tile',color:c,detail:false,ground:{type:'door'}}); b.position.set(-37.2,0,z); b.rotation.y=ry; g.add(b); buildings.push(b); wzTag(b,id); addCollider(-43.2,z,12,w,14); }   /* W2＝日常失速（WZ-OFFBEAT-1104）：z −13 → −13.5、寬 10 → 11，和正式模型 wz_street.py 一樣 */
    if(typeof DAILY_OFFBEAT_LAYOUT!=='undefined'&&Z3.ZONES&&Z3.ZONES.wz_offbeat){ const OB=DAILY_OFFBEAT_LAYOUT; E.interactables.push({x:OB.enterAt.x,z:OB.enterAt.z,radius:1.2,label:OB.enterAt.label,exit:{to:'wz_offbeat',spawn:Object.assign({},OB.spawn)}}); }   /* 日常失速（AA_617、AA_618）：W2 一樓的店門（溫州街 (−37.2, −9.6)），進去是 wz_offbeat */
    E.interactables.push({x:54.2,z:0,radius:2.3,label:'進入 2:30 AM',exit:{to:'cafe',spawn:{x:0,z:5,yaw:Math.PI}}});
    const cafeKitProps=[];   // 套件的 A 字立牌、門口盆栽：Café 正式模型裡有自己的版本（位置、導航阻擋相同），載入後藏起來
    { const ab=TK.aBoard(['今日手沖','衣索比亞','耶加雪菲','—','讀書位 有']); ab.position.set(54.4,0,3.6); ab.rotation.y=-Math.PI/2; g.add(ab); nav.blockRect(54.45,3.6,0.9,0.9,0,0);   /* WZ-FIVE-1104（LAWWW2-C 20:55）：畫架三支腳，0.5 m 格上圓形只擋一格、人可以站在腳中間；改成蓋住整個畫架（tests/cafe230_ext_nav_unit.js）*/ ab.userData.dyn=true; cafeKitProps.push(ab); }
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
    /* 木曜日（ART-MOKUYOBI-1103，AA_617）：B4（37 號）的深綠鐵門＋往上的窄樓梯，二樓是店（區域 wz_mokuyobi，src/mokuyobi3d.js）*/
    if(typeof MOK3!=='undefined') E.interactables.push({x:MOK3.DOOR_WZ.x,z:MOK3.DOOR_WZ.z,radius:1.4,label:'上二樓（木曜日）',exit:{to:'wz_mokuyobi',spawn:Object.assign({},MOK3.IN)}});
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
    const poleXs=[-26.5,-16.0,12.2,34.2,45.5]; const tops=[];   /* ADE-PROPS-1104（BB_255 P3，LAWWW2-C 11-04）：第二支原本在 x −9.2＝阿德影印輸出店面正前方，擋住右邊白磁磚壁面上的價目表、布告欄。使用者 11-04 21:4x「阿德影印前面不應該有電線桿」：−12.7（分界）還是看起來在店前面 → −16.0＝日式宿舍院牆前（院牆 x −29.5～−12.5、門 −21.7～−19.3），離阿德西緣（x −12）4 m。正式模型 wz_props.glb 同一個位置（tests/wz_props_poles_unit.js） */
    poleXs.forEach((px,i)=>{ const p=TK.utilityPole({arm:true,armDir:1,transformer:i===2,sign:i===4?'溫州街':null}); p.position.set(px,0,4.65); p.rotation.y=Math.PI/2; g.add(p); prTag(p,'pole'); nav.blockCircle(px,4.65,0.3); tops.push([px,8.52,4.65]); const L=p.userData.lamp; if(L){ const wx=px, wz=4.65-L.x; lamps.push({x:wx,z:wz}); const pool=TK.lightPool(4.5,'rgba(255,214,150,1)'); pool.position.set(wx,0.03,wz); g.add(pool); pools.push(pool); } });
    { const pairs=[]; for(let i=0;i<tops.length-1;i++){ for(const dy of [0,-0.6]) pairs.push([[tops[i][0]-0.75,tops[i][1]+dy,tops[i][2]],[tops[i+1][0]-0.75,tops[i+1][1]+dy,tops[i+1][2]],0.7]); pairs.push([[tops[i][0]+0.75,tops[i][1],tops[i][2]],[tops[i+1][0]+0.75,tops[i+1][1],tops[i+1][2]],0.55]); }
      // 跨巷到對面建築、到巷子
      for(const [px,tx,tz] of [[-16.0,-16.0,-5.2],[12.2,10,-5.2],[34.2,36,-5.2],[12.2,5.8,9],[-26.5,-30,-5.2]]) pairs.push([[px,8.0,4.65],[tx,7.2,tz],0.4]);
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
    if(typeof WZ_SHOPS_LAYOUT!=='undefined'){ scRow(-11.5,2,3.95,0,[-12.0,-10.0]); scRow(-6.8,3,3.95,0); } else scRow(-11.5,7,3.95,0);   /* 阿德影印輸出的店門（x −8）前面留空（DL-09）；門西邊那兩台（x −11.5、−10.65）用 gap 不停：停在白磁磚壁面（價目表、布告欄）正前方（ADE-PROPS-1104，BB_255）。用 gap 不是整排拿掉：亂數照樣抽，後面每一排機車的位置、顏色、有沒有停都不變 */ scRow(5.0,12,-3.95,Math.PI,typeof MOK3!=='undefined'?[6.3,8.5]:undefined); scRow(31.5,8,-3.95,Math.PI,[32.8,36.2]);   /* 木曜日（B4 鐵門 x 7.4，src/mokuyobi3d.js）：門口 x 6.3–8.5 不停機車 */   /* AA_413（10-23）：阿忠水果（B6）攤子前面不停車，留 3.4 m 給買水果的人（x 32.8–36.2）*/ scRow(-28.5,6,-3.95,Math.PI); scRow(typeof WZ_PARK_LAYOUT!=='undefined'?16.4:24.4,4,3.95,0);   /* 擴大版小公園：入口 A（x 22.6–29.4）前面不停機車，這一排挪到 A3 巷口書房前面 */
    for(const [bx,bz,ry,c] of [[9.4,4.1,0.1,'#3a6fb0'],[10.3,4.1,-0.08,'#8c3b47'],[18.6,4.1,0.05,'#e0b95b']]){ const bk=W3.bikeAny(c,Math.round(bx*10)); bk.position.set(bx,0,bz); bk.rotation.y=ry; g.add(bk); nav.blockRect(bx,bz,0.6,1.8,ry,0.05); }
    // 盆栽（住家門口）、郵筒、立牌
    for(const [px,pz,ry,n] of [[-2.6,4.55,Math.PI,6],[9.6,-4.55,0,5],[41.5,-4.55,0,7],[3.6,9.5,-Math.PI/2,5],[-13.5,-9,Math.PI/2,4],[-14.4,4.6,Math.PI,4]].filter(q=>!(q[0]===41.5&&typeof WZ_SHOPS_LAYOUT!=='undefined'))){   /* B7 改成半熟（溫州街 v5）：店門口有自己的黑板、長椅、大盆栽（模型），套件那一排盆栽會擋住店門 */ const pt=TK.pots(n,Math.round(px)); pt.position.set(px,0,pz); pt.rotation.y=ry; g.add(pt); const L=pt.userData.len; const c=Math.cos(ry), sn=Math.sin(ry); nav.blockRect(px+c*L/2,pz-sn*L/2,Math.abs(c)*L+0.6,Math.abs(sn)*L+0.6,0,0); }
    { const mb=TK.mailbox(); mb.position.set(47.3,0,4.3); mb.rotation.y=Math.PI; g.add(mb); nav.blockRect(47.3,4.3,1.2,0.6,0,0); }
    for(const [ax,az,ry,ls] of [[14.6,3.9,Math.PI,['二手書','民法・刑法','教科書收購']],[-2.4,-3.9,0,['本日のおすすめ','焼き鳥・だし巻き玉子','烤雞串・玉子燒']]]){ const ab=TK.aBoard(ls); ab.position.set(ax,0,az); ab.rotation.y=ry; g.add(ab); nav.blockCircle(ax,az,0.35); }
    // 店面（不能進去的）用「看櫥窗」：清楚表示只能看，不假裝有完整室內
    for(const it of [{x:14.2,z:3.8,label:'看書店的櫥窗',look:'溫州書屋的櫥窗裡擺著一套舊版的《民法總則》，旁邊手寫的紙條：「學長姐留下來的，筆記很多」。'},{x:44,z:3.8,label:'看便利商店',look:'日和便利店的自動門開了又關。櫃檯後面的店員在補咖啡豆。'},{x:36,z:3.8,label:'看林家乾麵',look:'林家乾麵外面排了三個人。滷味的味道飄到巷子中間。'},{x:23,z:-6.5,label:'看手搖飲菜單',look:'帝大紅茶的菜單：紅茶 30、綠茶 30、珍珠奶茶 55。騎樓下有兩張塑膠椅。'},{x:-2.6,z:-3.8,label:'看定食店',look:'小路的布簾後面傳來煎魚的聲音。今天的定食是鯖魚。'}].filter(it=>!(typeof WZ_SHOPS_LAYOUT!=='undefined'&&((it.label==='看林家乾麵'&&WZ_SHOPS_LAYOUT.lin)||(it.label==='看定食店'&&WZ_SHOPS_LAYOUT.teishoku)))&&!(it.label==='看手搖飲菜單'&&typeof WZS!=='undefined'&&WZS.WINDOW))) E.interactables.push(Object.assign({radius:1.6},it));
    { const bw=E.interactables.find(q=>q.label==='看書店的櫥窗'); if(bw&&typeof WZS!=='undefined'&&WZS.booksLook) Object.defineProperty(bw,'look',{get(){ const G=typeof GAME!=='undefined'?GAME.G:null; return WZS.booksLook(G); },enumerable:true,configurable:true}); }   /* 溫州書屋（AA_658 第 5 節）：營業中、打烊、週一、颱風天各一句 */   /* 林家乾麵、定食店能進去以後（WZ-SHOP-AA364-ART），門口的「看」換成上面 wzShopDoors（三家新店的店門那一段）的「進去」 */
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
    /* 東端的「回公館」拿掉（WZ-ENTRY-XINSHENG-1103，X199）：溫州街只剩西側橫巷北口「往新生南路」一個出入口。
       只有新生南路沒載入（XSL false：沒有 src/xinsheng3d.js 的建置）時留著，免得溫州街出不去（D36）*/
    if(!XSL) E.interactables.push({x:51.3,z:-13.4,radius:2.6,label:'回公館',exit:{to:'gongguan',spawn:{x:-71,z:16.5,yaw:Math.PI}}});
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
    if(wzGLB) ASSETS.loadOne('bldg.wenzhou_street').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true); attachWenzhouModel(E,g,root,'wzApt','wenzhou_street_glb'); shopInsideLit(root,zone,{B7:'wz_brunch',B3:'wz_teishoku'}); { const wr=wzShopReal(); shopInsideReal(E,g,zone,wr); shopRealGlow(g,'wenzhou_street_glb',zone,wr.concat(WZ_GLOW_ONLY)); } propBlocks(nav,WZ_PROP_BLOCKS); propReStand(E,nav); wzParkSeason(root); root.traverse(o=>{ if(/^COPY_(CORNER_SHUT|CORNER_OPEN|A1_SHUT|A1_RENEW)$/.test(o.name)) copyNodes.push(o); }); copyKey=null; copyTick(); })   /* 季節節點：夏日冰菓室冬天休息（SEASON_ICECLOSED）*/.catch(e=>console.warn('溫州街公寓正式模型載入失敗，用套件的外觀',e));
    if(scGLB){ P3.mergeStatic(scG); ASSETS.loadOne('bldg.wz_scooter').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const n=attachWzScooters(g,scG,scList,c.scene); if(!n) console.warn('機車正式模型沒有 scooter_a／scooter_b，用套件的機車'); }).catch(e=>console.warn('機車正式模型載入失敗，用套件的機車',e)); }
    if(pkGLB) ASSETS.loadOne('bldg.wz_park').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true); attachWenzhouModel(E,g,root,'wzPark','wz_park_glb'); wzParkSeason(root); for(const o of g.children) if(o.userData.wzParkFb) o.visible=false; }).catch(e=>console.warn('小公園正式模型載入失敗，用套件的外觀',e));
    if(prGLB) ASSETS.loadOne('bldg.wz_props').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'wzProp','wz_props_glb'); }).catch(e=>console.warn('溫州街街道細節正式模型載入失敗，用套件的外觀',e));
    if(jpGLB) ASSETS.loadOne('bldg.wz_jphouse').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'wzJp','wz_jphouse_glb'); }).catch(e=>console.warn('日式宿舍正式模型載入失敗，用套件的外觀',e));
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.cafe_exterior']) ASSETS.loadOne('bldg.cafe_exterior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachCafeExterior(cafeB,c.scene.clone(true),cafeKitProps); }).catch(e=>console.warn('2:30 AM 正式模型載入失敗，用套件的外觀',e));
    return zone; }
  /* 兩點半 Café 正式模型接到套件建築上（GLB 是建築自己的座標：正面朝 +z、原點在正面中央地面，和 TK.apartment 相同）。
     套件的外觀與光暈藏起來（導航、鏡頭碰撞、店門互動點不在這裡，照舊）；hide＝一起藏起來的套件道具（A 字立牌、盆栽）。
     名稱約定（見 cafe_exterior.py）：SIGN_FACE／ABOARD_FACE_*／MENU_FACE＝空白板面，字用 canvas 畫（自訂屬性帶文字）；
     CAFE_NIGHT 的材質夜間發光（TK.addNight）、CAFE_BOUNCE 的店內材質有燈光感（TK.bounce）；GLOW_* 空節點＝光暈位置（TK.glowSprite）。 */
  const CAFE_NIGHT={cafe_bulb:[0xfff1d6,2.4,1.0],cafe_lampglass:[0xffd49a,1.5,0.3],ext_glass_lit:[0xffd9a0,0.75,0]};
  /* cafe_int_atlas：溫州街效能第二輪把店內的地板、書、層架、吧台合成一張貼圖集（LAWWW2-B 35513f11）*/
  const CAFE_BOUNCE={cafe_int_floor:[0.35,0.7],cafe_int_plaster:[0.42,0.85],cafe_int_wood:[0.32,0.65],cafe_int_ceiling:[0.35,0.75],cafe_int_beam:[0.3,0.6],cafe_int_books:[0.4,0.75],cafe_int_shelf:[0.32,0.65],cafe_int_bar:[0.32,0.65],cafe_int_atlas:[0.35,0.7]};   /* 白天店裡也開燈：從玻璃外看得到暖色的店內 */
  function cafeCanvas(w,h,draw,soft){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(soft?c.getContext('2d',{willReadFrequently:true}):c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.flipY=false; t.anisotropy=8; return t; }   /* glTF 的 UV：flipY=false。soft：畫在 CPU 上（willReadFrequently；wzAtlasFaces 讀平均色不用等 GPU，見那裡的註解） */
  const wzCanvas=(w,h,draw)=>cafeCanvas(w,h,draw,true);   /* 溫州街、公館、校園的字牌、門牌：只拿來合成 atlas，原本的 CanvasTexture 不會傳上 GPU */
  const CAFE_SERIF='"Noto Serif TC","Songti TC","Noto Serif CJK TC","Source Han Serif TC",serif', CAFE_SANS='"Noto Sans TC","PingFang TC","Noto Sans CJK TC","Microsoft JhengHei",sans-serif';
  function cafeSignTex(d){ return cafeCanvas(2048,192,(x,w,h)=>{ x.fillStyle=d.bg||'#3b2a1e'; x.fillRect(0,0,w,h); const gr=x.createLinearGradient(0,0,0,h); gr.addColorStop(0,'rgba(255,240,220,0.06)'); gr.addColorStop(1,'rgba(0,0,0,0.12)'); x.fillStyle=gr; x.fillRect(0,0,w,h);
      x.strokeStyle='rgba(222,200,160,0.55)'; x.lineWidth=3; x.strokeRect(14,12,w-28,h-24); x.fillStyle=d.color||'#f4ead8'; x.textBaseline='middle'; x.textAlign='center'; x.font='600 118px '+CAFE_SERIF; x.fillText(d.sign||'2:30 AM',w/2,h*0.5+4);
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
    return wzCanvas(W,H,(x,w,h)=>{ const bg=vertical?d.vBg:d.bg, band=vertical?d.vBand:d.band; x.fillStyle=bg||'#ffffff'; x.fillRect(0,0,w,h);
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
      if(s.code){ const f=V.find(c=>c.code===s.code); if(f) v=f; }   /* 汀州路第 3 版（BB_255）：區域自己照擺放規則指定款式（code）和顏色（pcol）；沒指定的照舊照位置挑 */
      const col=s.pcol||(v.pal.length?v.pal[Math.floor(hash(p.x,p.z,2)*v.pal.length)]:s.color); pick[v.code]=(pick[v.code]||0)+1; cols.add(col);
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
    if(d.serif&&!vert) return wzCanvas(W,H,(x,w,h)=>{ x.fillStyle=d.bg||'#ffffff'; x.fillRect(0,0,w,h);   /* serif：石材匾額（總圖）：刻字一樣的大字、字距拉開、一圈細的內框（門牌那種粗外框在匾額上像黑色相框） */
      x.strokeStyle=d.color||'#222'; x.globalAlpha=0.45; x.lineWidth=2; x.strokeRect(h*0.08,h*0.08,w-h*0.16,h-h*0.16); x.globalAlpha=1;
      const ch=[...(d.text||'')], fs=Math.round(h*(d.fs||0.6)), span=Math.min(w*0.74,ch.length*fs*1.55);   /* d.fs：字高是板面高的幾倍（行政大樓的檐部匾額比較扁，字放大到 0.72） */ x.font='bold '+fs+'px '+WZ_SERIF; x.fillStyle=d.color||'#222'; x.textAlign='center'; x.textBaseline='middle';
      ch.forEach((c,i)=>x.fillText(c,w/2-span/2+span*(i+0.5)/ch.length,h*0.53)); });
    return wzCanvas(W,H,(x,w,h)=>{ x.fillStyle=d.bg||'#ffffff'; x.fillRect(0,0,w,h); x.strokeStyle=d.color||'#222'; x.lineWidth=Math.max(3,Math.min(w*0.04,h*0.16));   /* 外框上限＝板面高的 16%：很扁的長條（博思雨遮名牌 4.8×0.16 m，30:1）原本外框比板面還厚、字被黑邊吃掉。4:1 以內的牌子（門牌、路名牌）和原本一樣；變的只有溫州公園牌（5.2:1）、社科院系所牌（9.5:1）、博思名牌 */ x.strokeRect(x.lineWidth,x.lineWidth,w-x.lineWidth*2,h-x.lineWidth*2);
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
  /* 貓趴著的位置（WZ-CAT-FLOAT-RUB-1103，使用者 11-03「懸空的橘貓」）：原本放在 ring.z＋r（1.45，圓椅外緣的外接圓），
     可是圓椅是 10 片的多邊形（wz_park.py：R1＝r、R0＝r−0.38、木板間隙 0.012、第一片的角在 π/10，正北那一片是平的），正北的外緣只到 (r−0.012)·cos(π/10)＝1.367——
     貓的中心在座面外 8 cm、身體 0.32 m 寬有 0.23 m 懸在草地上；高度也高了 2 cm（座面頂 0.45、貓的底 −0.003）。
     現在照 GLB 量的包圍盒（CAT_lie／CAT_curl，x 是身體的寬、z 是身長；原點＝四腳中間的地面）把整隻放在座面中間（徑向 1.03～1.37 m）、底部貼座面。
     石桌底下（下雨、寒流）：石桌的底座半徑 0.24 m（地台上 6 cm）、桌面半徑 0.5、東邊的石凳內緣 0.74（park3_props.glb 量的）——貓放在底座外、石凳內（舊的位置 +0.3 m 會插進底座）。
     回傳 {x,y,z,yaw}（溫州街世界座標；y＝地面以上，石桌那一版是涼亭地台 0.14 再加上去）。tests/wz_cat_float_rub_unit.js 讀 GLB 量 */
  const WZ_CAT_BOX={lie:{x0:-0.171,x1:0.149,z0:-0.237,z1:0.256,y0:-0.003},curl:{x0:-0.183,x1:0.204,z0:-0.212,z1:0.243,y0:-0.003}};
  const WZ_RING_SEAT={depth:0.38,gap:0.012,top:0.45,n:10};   /* tools/blender/env_second/wz_park.py「樹圍圓形座椅」：R0＝R1−0.38、H 0.39＋板厚 0.06、10 片、角在 π/10＋k·2π/10 */
  const WZ_TABLE={base:0.24,stool:0.74,floor:0.14};
  function wzCatSpot(L,where,pose){ L=L||(typeof WZ_PARK_LAYOUT!=='undefined'?WZ_PARK_LAYOUT:null); if(!L) return null; const b=WZ_CAT_BOX[pose]||WZ_CAT_BOX.lie;
    if(where==='under'){ const pv=L.items.find(i=>i.kind==='pavilion'); if(!pv) return null; const gap=0.02;   /* 轉 π：身體的 x 朝 −x、z 朝 −z */
      const c=WZ_TABLE.base+gap+b.x1; return {x:pv.x+c,y:WZ_TABLE.floor-b.y0,z:pv.z+(b.z0+b.z1)/2,yaw:Math.PI,inner:c-b.x1,outer:c-b.x0}; }
    const rg=L.items.find(i=>i.kind==='ring_bench'); if(!rg) return null; const R1=rg.r||1.45, R0=R1-WZ_RING_SEAT.depth, k=Math.cos(Math.PI/WZ_RING_SEAT.n);
    const ri=(R0+WZ_RING_SEAT.gap)*k, ro=(R1-WZ_RING_SEAT.gap)*k, mid=(ri+ro)/2;   /* 正北那一片的內外緣（平的那一邊）*/
    return {x:rg.x+(b.z0+b.z1)/2,y:WZ_RING_SEAT.top-b.y0,z:rg.z+mid-(b.x0+b.x1)/2,yaw:Math.PI*1.5,seatIn:rg.z+ri,seatOut:rg.z+ro};   /* 轉 3π/2：身體的 x 朝 +z（徑向）、頭朝 −x（沿著圓椅）*/ }
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
      const iz=pk==='swing'?st.z-0.8:st.z;   /* BUG-SWING-FRONT-1103（CC／BB）：座位搬到座板上（z 25.0／24.8）以後，鞦韆 A 正面最近站得住的點（z 23.65）離互動點 1.35 m＞radius，從正面按不到；
         互動點往正面移 0.8 m（A 24.2、B 24.0＝座位搬家以前的位置），座位照舊在座板上。兩座一樣 */
      E.interactables.push(Object.assign({x:st.x,z:iz,radius:1.3,label:st.label,seat:Object.assign({x:st.x,z:st.z,yaw:st.yaw},ap?{ap}:{})},pk?{park:pk}:{})); }
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
    { const cold=!!(typeof PARK!=='undefined'&&G0&&PARK.catCold&&PARK.catCold(G0)), pose=cold?'curl':'lie', sp=catAt&&catHere?wzCatSpot(L,under?'under':'bench',pose):null;   /* 趴著的位置照座面量（wzCatSpot，WZ-CAT-FLOAT-RUB-1103）*/
      if(sp){ const cat=new TK.Bin(); const fur=TK.paint('#d98a3c'), furL=TK.paint('#f0c08a'), dk=TK.paint('#5a3a22'); const cy=0.5;
        const body=new THREE.SphereGeometry(0.2,14,9); body.scale(1.0,0.5,0.72); cat.add(fur,body,0,cy+0.08,0,0.3);
        cat.add(fur,new THREE.SphereGeometry(0.085,12,8),0.15,cy+0.07,-0.07,0); cat.add(furL,new THREE.SphereGeometry(0.04,8,6),0.2,cy+0.05,-0.12,0);
        for(const ex of [-0.04,0.04]) cat.add(fur,new THREE.ConeGeometry(0.028,0.06,4),0.15+ex,cy+0.15,-0.06,0);
        cat.add(dk,new THREE.TorusGeometry(0.16,0.026,6,14,Math.PI*1.1),-0.02,cy+0.035,-0.02,0.4,{rx:-Math.PI/2});
        const catG=new THREE.Group(); catG.name='wz_cat'; catG.userData.dyn=true; g.add(catG);
        if(under){ catG.position.y=WZ_TABLE.floor-WZ_RING_SEAT.top; catG.userData.under=true; }   /* 石桌底下：整組放低到涼亭的地台（舊的測試照這個量，tests/wz_park_people_unit.js）；裡面的模型照 sp.y 減回來 */
        const cg=new THREE.Group(); cat.build(cg); cg.traverse(o=>{ if(o.isMesh) o.castShadow=false; }); cg.position.set(sp.x,sp.y-0.483-catG.position.y,sp.z); cg.rotation.y=sp.yaw-Math.PI/2; catG.add(cg);   /* 套件的貓：身體的底在 0.48、身長沿 x、頭朝 +x */
        /* 被子晴收養以後（PARK.catAdopted：12/14 23:00 起，或那一場演完）公園不顯示貓（WZ-CAT-LIFE-1023，AA_397 第 3 節）：每一格看，玩家待在公園裡過了 23:00 也會不見；「看圓椅」的互動點照 PARK.catHidden */
        { let shown=true; Object.defineProperty(catG,'visible',{configurable:true,get(){ const G=typeof GAME!=='undefined'&&GAME.G; return shown&&!(G&&typeof PARK!=='undefined'&&PARK.catAdopted&&PARK.catAdopted(G)); },set(v){ shown=!!v; }}); }   /* dyn：不參加整區靜態合併（正式模型載入後要藏起套件的貓）*/
        if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.wz_cat']) ASSETS.loadOne('bldg.wz_cat').then(c=>{ if(!c||!c.scene) return;
          const bench=wzCatSpot(L,'bench','lie'), tbl=wzCatSpot(L,'under','lie');
          if(!under&&typeof WZCAT!=='undefined'&&WZCAT.attach(E,catG,c,{G:G0,lie:bench,under:tbl})){ cg.visible=false; return; }   /* 有骨架的貓交給 WZCAT（src/wzcat3d.js，J13）：白天在公園裡走、晚上趴在圓椅上（會呼吸）、時間到了自己醒來或回去睡；下雨、寒流進公園照舊在石桌底下 */
          const m=wzCatModel(c.scene.clone(true),G0,pose);   /* 寒流那一週縮成一團（石桌底下，catUnder 已經照寒流放）*/ if(!m) return;
          m.position.set(sp.x,sp.y-catG.position.y,sp.z); m.rotation.y=sp.yaw; cg.visible=false; catG.add(m); if(typeof WZCAT!=='undefined'&&WZCAT.breathe) WZCAT.breathe(m); }).catch(e=>console.warn('貓的正式模型載入失敗，用套件的貓',e)); } }
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
    /* 冰菓室改全年營業（AA-C 11-12；places.js wz_ice）：鐵捲門照 PLACES.inSeason，不再寫死 5～9 月（BB_379 WZ_ICE_tue FAIL）*/
    let iceShut=!(m>=5&&m<=9); try{ const G=typeof GAME!=='undefined'&&GAME.G; if(typeof PLACES!=='undefined'&&PLACES.inSeason) iceShut=!PLACES.inSeason('wz_ice',G&&G.day)||!!(G&&G.hour!=null&&PLACES.isOpen&&!PLACES.isOpen('wz_ice',((G.hour%24)+24)%24,G.day)); }catch(e){}   /* 公休日、打烊也拉鐵捲門（BB_379 WZ_ICE_r2：週二公休櫃台照擺）；進區域時決定 */
    root.traverse(o=>{ const k=/^SEASON_([A-Z]+)_(on|off)/.exec(o.name||''); if(!k) return; const on=k[1]==='AZALEA'?m===3:(k[1]==='SWEETGUM'?(m===12||m===1):(k[1]==='ICECLOSED'?iceShut:false)); o.visible=(k[2]==='on')===on; }); return m; }
  /* 阿德影印的狀態（WZ_COPY_SHOP，wz_events.js 1-5／wzlines3d.js）：'moved'｜'stay'｜''（還沒決定）；節點顯示的規則；店門在哪裡 */
  function wzCopyState(G){ const v=G&&G.flags&&G.flags.WZ_COPY_SHOP; return v==='moved'||v==='stay'?v:''; }
  function wzCopyVis(name,st){ return name==='COPY_CORNER_OPEN'||name==='COPY_A1_SHUT'?st==='moved':(name==='COPY_A1_RENEW'?st==='stay':st!=='moved'); }
  function wzCopyAt(G){ const L=typeof WZ_SHOPS_LAYOUT!=='undefined'?WZ_SHOPS_LAYOUT.print:null; return L&&L.moved&&wzCopyState(G)==='moved'?L.moved.enterAt:(L?L.enterAt:{x:-8,z:4.6}); }
  /* 斑馬線（GG-ZEBRA-1104，使用者 11-04「從學校到對面要斑馬線」；LAWWW2）：PlaneGeometry(L,Wd)，白條和本地 y（寬）平行、沿本地 x 每 0.9 m 一條（條寬 0.5 m）；
     貼圖和溫州街巷口的斑馬線同一張（TK.tex('zebra')），用 repeat 鋪滿長度。路上的車道線不剪（斑馬線疊在上面，polygonOffset） */
  function zebraMesh(L,Wd){ const st=TK.tex('zebra',256,64,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(240,238,230,0.92)'; for(let i=0;i<w;i+=32) x.fillRect(i+4,0,18,h); },false).clone();
    st.wrapS=THREE.RepeatWrapping; st.repeat.set(L/0.9/8,1); st.needsUpdate=true;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(L,Wd),new THREE.MeshStandardMaterial({map:st,transparent:true,roughness:0.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})); m.rotation.x=-Math.PI/2; m.receiveShadow=true; m.name='zebra'; return m; }
  /* 公館窗卡 v5（LAWWW2 1d4675069）：亮窗網格 NOSHADOW_xs_fronts_lit 的第二組 UV（uv1.x）＝店編號（1～8，0＝永遠亮；對照在 node extras.xsShops），
     打烊的店乘 0.18（BB 11-04「打烊的店窗還亮」FAIL）；照 PLACES.isOpen 每 30 幀更新一次 uniform，不多 draw call。洋洋 17:00～01:00、轉角唱片 12:00～21:00（AA_650 §4，BB 11-04） */
  const GG_LIT_ZONE={ggtea:'aoki',ggbook:'bookstore',ggcvs:'cvs',ggyy:'yangyang',ggbike:'bikeshop',ggafar:'afar',ggcorner:'corner_records',ggdb:'daybreak',ggantai:'gg_antai',ggfruit:'gg_xianguo',ggfn:'flower_notes',ggrong:'gg_rongendian'};   /* GG-LIT-12-1112（LAWWW2-C）：公館街景模型的亮窗現在有 12 間（extras.xsShops），原本只處理前 8 間、對照表也只有 8 筆——花序、轉角唱片、榮恩典、Daybreak（第 9～12 間）打烊不會暗，安泰、汀州鮮果沒有對到營業時間。陣列放大到 16 間 */
  const GG_LIT_N=16;   /* 洋洋、轉角唱片：AA_650 §4 的營業時間（places.js；洋洋 YANGYANG-IN-1107、轉角唱片 CORNER-IN-1107 進得去了）*/
  /* SHOP-WINDOW-3D-1112（LAWWW2-C；使用者 11-12：新生南路、汀州路、公館的店從外面看要像 118 巷一樣是立體的）：街景模型裡「玻璃後面的立體店內」是一間一個網格 sk_in_<店>
     （不受場景光的頂點色材質 wz_in_shop，整條街共用一個材質）。打烊的店要看得出來關了（L118-CLOSED-LOOKS-OPEN）：這裡把每一間的材質各複製一份，
     照 PLACES.isOpen 把顏色乘數設成 1（營業）或 0.07（打烊：店裡關燈，只看得到輪廓）；颱風停業也算打烊。map＝{模型裡的店 id: 地點 id}；沒列的店不動（一直亮著）。
     每 30 幀看一次（和 ggShopLit 一樣掛在 zone.update）。回傳 {items:[{id,place,mesh,mat,k}],upd}，也記在 zone.shopInLit（測試、CC 在瀏覽器看）。 */
  function shopInsideLit(root,zone,map){ const items=[]; if(!root||!zone||!map) return null;
    root.traverse(o=>{ if(!o.isMesh||!o.material||Array.isArray(o.material)) return; let id=null; for(let q=o;q&&!id;q=q.parent){ const m=/^sk_in_(.+)$/.exec(q.name||''); if(m){ const k=m[1].replace(/_\d+$/,'').replace(/_wz_in_shop$/,'').replace(/_\d+$/,''); id=map[m[1]]?m[1]:(map[k]?k:null); if(!id) return; }   /* 模型裡的名字：sk_in_<店>_wz_in_shop（合併後帶材質名）、GLTFLoader 可能再加 _1 */ if(q===root) break; }
      if(!id) return; const mat=o.material.clone(); mat.name=(o.material.name||'wz_in_shop'); mat.userData=Object.assign({},o.material.userData,{shopIn:id}); o.material=mat; items.push({id,place:map[id],mesh:o,mat,k:1}); });
    if(!items.length) return null;
    const upd=()=>{ const G=typeof GAME!=='undefined'?GAME.G:null; const P=typeof PLACES!=='undefined'?PLACES:null;
      for(const it of items){ let open=true; if(G&&P&&P.isOpen){ open=!!P.isOpen(it.place,(+G.hour)%24,G.day)&&!(P.typhoonClosed&&P.typhoonClosed(it.place,G.day)); } const k=open?1:0.07; if(k!==it.k||it.mat.color.r!==k){ it.k=k; it.mat.color.setRGB(k,k,k); } } };
    let f=0; const up0=zone.update; zone.update=function(dt,E2){ if(up0) up0.call(this,dt,E2); if((f++)%30===0) upd(); }; upd();
    const R={items,upd}; zone.shopInLit=R; return R; }
  /* SHOP-REAL-INSIDE-1112（LAWWW2-C；使用者 11-12 對 BB：「大步球鞋店外面看進去牆壁是灰色，可是人在店裡面居然牆壁是木頭的」→ §12 第 1 點「從店外看到的牆、地板、擺設、燈色要和走進去的室內一樣」）：
     玻璃後面直接放**那一間店走進去的室內模型**（同一顆 GLB、同一批貼圖），不另外做一套——擺設、材質一定一樣。
     list＝[{id, place 地點（營業時間）, key 室內模型的 ASSETS 鍵, x,z 室內原點在這一區的位置, ry 轉向（室內的正面 +z 轉到朝街）, w,d,h 室內的寬、深、高, near／far 幾公尺內接上／超過就拿掉}]。
     · 只接玩家附近的店（near 內才載入、far 外拿掉並釋放材質）：一間室內十幾個材質，整條街全接手機吃不消。
     · 室內模型自己的正面牆（WALL_front*：街景模型已經有店面的玻璃和框）、陽光斑、窗景卡、光暈不放；範圍外的零件（夜景板之類）不放。
     · 材質換成不受場景光的（MeshBasicMaterial，貼圖／頂點色照舊）：街上的太陽照不進店裡，店是被自己的燈照亮的；亮度 0.86，打烊（PLACES.isOpen 假、颱風停業）0.07。
     · 接上以後把街景模型裡那一間的簡化店內（sk_in_<店>，載入前的備用）藏起來；拿掉就放回來。
     回傳 {shops, tick, lite}，也記在 zone.shopReal（測試、CC 在瀏覽器看：shops[i].built 做好了沒、on 顯示中、meshes 幾個零件、k 亮度）。 */
  function shopInsideReal(E,g,zone,list,opt){ if(!E||!g||!zone||!Array.isArray(list)||!list.length) return null;
    const HIDE=/(^|\/)(WALL_front|GLOW_)|(^|\/|_)sun(_|\/|$)|sunpatch|sunlight|VIEW_|_view(_|$)/i,   /* 11-12：原本寫 /sun/，SUNNY SIDE 的根節點 sunnyside_interior 整間被當成陽光斑藏掉 */ _hideNote=0, B=new THREE.Box3(), C=new THREE.Vector3(), LIT=0.86;
    const shops=list.map(q=>Object.assign({near:26,far:40,on:false,built:false,loading:false,grp:null,mats:[],meshes:0,k:-1},q));
    /* 兩種接法（CC 11-12 在使用者電腦量：兩間同時接 60 fps 沒掉，但第一次走近最長一幀 233 ms——那一下在載入、上傳貼圖、編譯材質）：
       · 一般（電腦）：進這一區就一間一間先做好（每 20 幀做一間：載入、換材質、貼圖先上傳、材質先編譯），掛在場景裡但不顯示；走近只是打開顯示，走遠關掉，不釋放。
       · 省資源 lite（畫質 low／medium 或觸控裝置；opt.lite 可以指定）：只接最近的一間，走近才載入、其他的拿掉並釋放。 */
    /* 11-12 第 2 版（CC 在使用者電腦量：進區域 10 秒每一間還是 built:false＝預載沒生效——遊戲預設畫質是 medium，第 1 版把 medium 也算成省資源）：省資源只有畫質 low 或觸控裝置。 */
    const lite=opt&&opt.lite!==undefined?!!opt.lite:(!!(E.q&&E.q.level==='low')||(typeof window!=='undefined'&&('ontouchstart' in window||(window.navigator&&window.navigator.maxTouchPoints>0))));
    /* 打烊拉下鐵捲門（11-12 第 2 版；BB FAIL：汀州鮮果 23:30 打烊後水果攤還擺在門口、沒有鐵門——§12 第 1 點「打烊看得出來關了（燈暗、鐵門或門關上）」）：
       每一間在店面玻璃外 6 cm 放一片鐵捲門（橫條浪板，整條街共用一張貼圖、一個材質），營業中藏起來、打烊（PLACES.isOpen 假、颱風停業）才顯示；一直掛著，不跟室內模型一起載入。
       寬＝s.sx 那一段（門窗的範圍，室內座標）或 s.sw（都沒給＝室內寬 −0.3）、高＝s.sh（沒給 3.0）；朝街的方向＝室內正面轉 ry。opt.shutter===false 不做。 */
    const isOpen=s=>{ const G=typeof GAME!=='undefined'?GAME.G:null, P=typeof PLACES!=='undefined'?PLACES:null; return !(G&&P&&P.isOpen&&s.place)||(!!P.isOpen(s.place,(+G.hour)%24,G.day)&&!(P.typhoonClosed&&P.typhoonClosed(s.place,G.day))); };
    if(!(opt&&opt.shutter===false)&&typeof document!=='undefined'&&THREE.CanvasTexture&&THREE.PlaneGeometry){ let mat=null;
      try{ const c=document.createElement('canvas'); c.width=64; c.height=256; const x=c.getContext('2d'); for(let i=0;i<16;i++){ const y=i*16, gr=x.createLinearGradient(0,y,0,y+16); gr.addColorStop(0,'#9a9c9e'); gr.addColorStop(0.45,'#c9cbcc'); gr.addColorStop(0.8,'#a9abad'); gr.addColorStop(1,'#6f7173'); x.fillStyle=gr; x.fillRect(0,y,64,16); }
        const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; if(THREE.SRGBColorSpace) t.colorSpace=THREE.SRGBColorSpace; mat=new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}); mat.name='shopreal_shutter'; }catch(e){ mat=null; }
      if(mat) for(const s of shops){ const cx=s.cx===undefined?s.x:s.cx, cz=s.cz===undefined?s.z:s.cz, nx=Math.sin(s.ry||0), nz=Math.cos(s.ry||0),   /* 朝街的方向＝室內的正面（+z）轉 ry。原本用「室內中心 → 玻璃面中心」：室內不在這一棟正中間的（SUNNY SIDE 偏東 0.62 m）鐵捲門會斜 7°、一頭縮到玻璃後面 */ sr=Array.isArray(s.sx)?s.sx:null, sw=sr?(sr[1]-sr[0]+0.2):(s.sw||(s.w-0.3)), sh=s.sh||3.0, sb=Math.max(0,Math.min(sh-0.4,s.sb||0)), hh=sh-sb, lx=sr?(sr[0]+sr[1])/2:0, ry=s.ry||0, ox=lx*Math.cos(ry), oz=-lx*Math.sin(ry);   /* sx＝[室內 x0, x1]：只蓋門窗那一段（沒給＝整間寬）*/
        const geo=new THREE.PlaneGeometry(sw,hh); const uv=geo.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*sw/0.8,uv.getY(i)*hh/2.0); const m=new THREE.Mesh(geo,mat); m.name='shop_shutter_'+s.id; m.userData.dyn=true;
        m.position.set(cx+ox+nx*0.06,(s.y||0)+sb+hh/2,cz+oz+nz*0.06);   /* s.sb（SHOP-WINDOW-3D-1112 v2，AA_902 溫特寶邸打烊「鐵捲門拉一半」）：門片下緣離地 sb 公尺，軌道照舊到地 */ m.rotation.y=Math.atan2(nx,nz); m.visible=!isOpen(s);
        /* SHUTTER-DEPTH-1112（LAWWW2-C；BB：鐵捲門一片平的）：上面的捲箱、底下的底條、兩邊的軌道——掛在那一片下面（一起顯示／藏），整條街共用一個素色金屬材質；捲箱往街上凸 0.2 m、有影子面 */
        if(THREE.BoxGeometry){ if(!mat.userData.frame){ mat.userData.frame=new THREE.MeshLambertMaterial({color:0x8d9092}); mat.userData.frame.name='shopreal_shutter_frame'; mat.userData.dark=new THREE.MeshLambertMaterial({color:0x5d6062}); mat.userData.dark.name='shopreal_shutter_dark'; }
          const part=(n,w,h,d,x,y,z,mm)=>{ const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mm); q.name='shop_shutter_'+n+'_'+s.id; q.position.set(x,y,z); q.userData.dyn=true; m.add(q); return q; };
          part('box',sw+0.16,0.3,0.24,0,hh/2-0.15,0.1,mat.userData.frame); part('bar',sw-0.04,0.09,0.07,0,-hh/2+0.045,0.03,mat.userData.dark); part('railL',0.08,sh-0.28,0.08,-sw/2+0.02,-0.14-sb/2,0.03,mat.userData.dark); part('railR',0.08,sh-0.28,0.08,sw/2-0.02,-0.14-sb/2,0.03,mat.userData.dark); }
        g.add(m); s.shutter=m; } }
    const fallback=(s,vis)=>{ const R=zone.shopInLit; if(!R) return; for(const it of R.items) if(it.id===s.id&&it.mesh) it.mesh.visible=vis; };
    /* SHOP-REALISM-1112（LAWWW2-C 11-13）：店內模型有烘好的光照貼圖（GLB extras.lightmap＝白天／晚上兩張，和走進去用的同一份；改用 CC0 素材的店：泰米村食起）——
       從街上看進去也乘上同一張光照貼圖（MeshBasic 的 lightMap 走第二套 UV：顏色×光照×強度/π，和店裡的間接光同一個算法），外面看、裡面看一樣亮、一樣有影子（CLAUDE.md §12 第 1 點）；
       白天／晚上照時段換那一張（lmMixAt 過半就換）；營業中不再乘 LIT（光照貼圖本身就是店裡的亮度）、打烊照舊壓暗。沒有第二套 UV 的零件（小東西、植物）照舊。 */
    const lmOf=(o,s)=>s.lm&&o.geometry&&o.geometry.attributes.uv1?s.lm:null;
    const basic=(m,s,cache,lm)=>{ if(!m) return m; const ck=lm?(cache.lmc||(cache.lmc=new Map())):cache; let b=ck.get(m); if(b) return b; cache=ck; const map=m.map||m.emissiveMap||null; const col=new THREE.Color(1,1,1);
      if(!map){ if(m.emissive&&(m.emissive.r+m.emissive.g+m.emissive.b)>0.05&&!m.vertexColors) col.copy(m.emissive); else if(m.color) col.copy(m.color); } else if(m.map&&m.color) col.copy(m.color);
      b=new THREE.MeshBasicMaterial({map,vertexColors:!!m.vertexColors,transparent:!!m.transparent,opacity:m.opacity===undefined?1:m.opacity,alphaTest:m.alphaTest||0,side:m.side,depthWrite:m.depthWrite!==false});
      if(lm){ b.lightMap=lm.day; b.lightMapIntensity=lm.intensity; b.userData.lm=true; }
      if(m.vertexColors&&m.metalness>0.2) col.multiplyScalar(2.2);   /* 金屬的頂點色零件（南洋戲院大廳的老放映機）不受光以後是純黑的剪影：提亮一點 */
      b.name='shopreal_'+(m.name||''); b.userData.base=col; b.color.copy(col); cache.set(m,b); s.mats.push(b); return b; };
    const light=s=>{ const G=typeof GAME!=='undefined'?GAME.G:null, P=typeof PLACES!=='undefined'?PLACES:null; let open=true;
      if(G&&P&&P.isOpen&&s.place) open=!!P.isOpen(s.place,(+G.hour)%24,G.day)&&!(P.typhoonClosed&&P.typhoonClosed(s.place,G.day)); const k=open?LIT:0.07;
      const lt=s.lm?(G&&lmMixAt(+G.hour)>0.5?s.lm.night:s.lm.day):null; if(k===s.k&&lt===s.lmCur) return; s.k=k; s.lmCur=lt;
      for(const b of s.mats){ if(b.userData.lm){ b.lightMap=lt; b.color.copy(b.userData.base).multiplyScalar(open?1:0.07); } else b.color.copy(b.userData.base).multiplyScalar(k); } };
    /* 先上傳貼圖、先編譯材質，而且分幀：一幀只上傳一張貼圖（一次全部上傳本身就是一頓），全部上傳完再編譯，然後才算「可以顯示」（s.ready）。 */
    /* SHOP-FIRST-APPROACH r7（LAWWW2-C 11-12；BB_379 r6：最長一幀前 30 ms 沒有任何記錄到的事件＝卡在 GPU 端第一次畫這一間（貼圖上傳、program link、頂點上傳）或 GC）：
       零件都打開以後，在畫面外先「真的畫一次」整間：同一個鏡頭、只畫 1×1 像素（viewport＋scissor 都設 1×1，畫在畫布左下角那一點；這一幀的正式畫面接著整張清掉重畫，看不到），
       用一個暫時的場景（同一個霧——霧會改著色器，不一樣的話正式畫的時候又要編一次）。材質都是不受光的 MeshBasic，跟燈沒有關係。不用 1×1 的 render target：畫到 render target 時 three.js 用不同的輸出色彩空間／色調映射，編的是另一個著色器。
       ?noshoppre 關掉（CC 對照用）。量測：prof.step.pre。*/
    /* r8（LAWWW2-C 11-13；CC r7 0b32cab5cc：整間一次先畫，pre 自己就是那一頓——公館 G03 153 ms、新生南路 shanlan 115 ms；compile 只剩 2 ms，剩下的是頂點上傳＋第一次用到的光照貼圖上傳）：
       分幀先畫——一幀只畫 PRE_V 個頂點以內的幾個零件（其他零件這一下藏起來），光照貼圖（白天／晚上兩張）排在貼圖上傳那一段先傳。 */
    const PRE=!(typeof location!=='undefined'&&/[?&]noshoppre\b/.test(location.search||'')), PRE_V=12000;
    const preDraw=(s,part)=>{ const Rn=E.renderer; if(!Rn||!s.grp||!E.camera||!THREE.Scene||!THREE.Vector4) return; const par=s.grp.parent, vis=s.grp.visible, vp=new THREE.Vector4(), sc=new THREE.Vector4(), st=Rn.getScissorTest?Rn.getScissorTest():false;
      const keep=part?s.list.map(o=>o.visible):null; if(part) for(const o of s.list) o.visible=part.has(o);
      const tmp=new THREE.Scene(); tmp.fog=E.scene&&E.scene.fog||null; try{ Rn.getViewport(vp); Rn.getScissor(sc); tmp.add(s.grp); s.grp.visible=true; s.grp.updateMatrixWorld(true);
        Rn.setViewport(0,0,1,1); Rn.setScissor(0,0,1,1); Rn.setScissorTest(true); Rn.render(tmp,E.camera); }catch(e){}
      try{ Rn.setViewport(vp); Rn.setScissor(sc); Rn.setScissorTest(st); }catch(e){} if(par) par.add(s.grp); s.grp.visible=vis; if(keep) s.list.forEach((o,i)=>{ o.visible=keep[i]; }); };
    const preParts=s=>{ const out=[]; let cur=null, v=0; for(const o of s.list){ const a=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position, n=a?a.count:0; if(!cur||(v+n>PRE_V&&cur.size)){ cur=new Set(); v=0; out.push(cur); } cur.add(o); v+=n; } return out; };
    const warmQ=[]; const warm=s=>{ s.ready=false; const seen=new Set();
      /* SHOP-FIRST-APPROACH-1112（LAWWW2-C；BB FIRST_gg_desk_r3：公館燒臘 233 ms、新生南路 150 ms、SUNNY 333 ms，都是第一次走近建店內那一幀）：材質第一次畫時 WebGL 在主執行緒同步編譯、連結著色器——
         一開始就用 compileAsync 把這一間全部的材質送去編（有 KHR_parallel_shader_compile 的話不卡主執行緒；照場景的燈編，之後畫的時候直接用同一個程式），編好以前零件先不打開（warmRun 看 s.compiling）。
         compile 只走看得到的物件：暫時打開、呼叫完馬上藏回去（compile 是同步收集材質的） */
      /* 第 2 版（BB／CC FIRST_*_r4：整間一次 compileAsync 時，那一間的著色器還是擠在同一幀——公館 G06、新生南路大步約 200 ms）：改成一幀只編一個材質
         （Rn.compile(那個網格, 鏡頭, 整個場景)，同一組材質只編一次），全部送出以後再 compileAsync 整間等 isReady（材質都準備過了，這一步不再編）。排在貼圖上傳後面、零件打開前面。 */
      const cj=[]; { const Rn=E.renderer; if(Rn&&Rn.compile&&E.camera&&E.scene&&s.grp&&s.list&&s.list.length){ const keys=new Set();
          for(const o of s.list) (o.traverse?o.traverse.bind(o):(f=>f(o)))(m=>{ if(!m.material) return; const ms=Array.isArray(m.material)?m.material:[m.material]; const k=ms.map(x=>x.uuid||x.id||'').join('|'); if(keys.has(k)) return; keys.add(k); cj.push({s,c:m}); });
          if(cj.length){ s.compiling=true; s.ct0=now(); cj.push({s,cwait:true}); } } } for(const b of s.mats) if(b.map&&b.map.image&&!seen.has(b.map)){ seen.add(b.map); warmQ.push({s,t:b.map}); } if(s.lm) for(const t of [s.lm.day,s.lm.night]) if(t&&t.image&&!seen.has(t)){ seen.add(t); warmQ.push({s,t}); }   /* r8：光照貼圖也先傳（不然第一次畫才傳）*/ for(const q of cj) warmQ.push(q); for(const o of s.list) warmQ.push({s,m:o}); if(PRE) for(const p of preParts(s)) warmQ.push({s,pre:p});   /* r8：分幀先畫 */ warmQ.push({s,hold:true}); warmQ.push({s,done:true}); };   /* 第 2 版：貼圖一幀上傳一張以後，零件也一幀打開一個（不做視錐裁切，一定會畫到）——頂點資料上傳、材質編譯跟著分幀；全部畫過一幀才算可以顯示。原本 compile 一次編譯全部、第一次顯示那一幀上傳整間的頂點資料，就是第一次走近那一頓（CC：150～167 ms）*/
    const warmStep=()=>{ const j=warmQ.shift(); if(!j) return; const Rn=E.renderer; if(j.stage){ stage(j); return; } if(!j.s.built) return;
      if(j.pre){ preDraw(j.s,j.pre===true?null:j.pre); return; }
      if(j.c){ try{ Rn.compile(j.c,E.camera,E.scene); }catch(e){} return; } if(j.cwait){ const s=j.s; const fin=()=>{ if(!s.compiling) return; s.compiling=false; rec(prof.step,'compileWait',now()-s.ct0,s.id); }; try{ const pr=Rn&&Rn.compileAsync?Rn.compileAsync(s.grp,E.camera,E.scene):null; if(pr&&pr.then){ pr.then(fin,fin); if(typeof setTimeout==='function') setTimeout(fin,2500); } else fin(); }catch(e){ fin(); } return; }   /* 2.5 秒保險：等不到 isReady 也照常一幀一個打開 */
      try{ if(j.m){ if(!j.s.grp.visible){ j.s.grp.visible=true; j.s.k=-1; light(j.s); if(j.s.want) fallback(j.s,false); } j.m.visible=true; j.m.frustumCulled=false; } else if(j.t&&Rn&&Rn.initTexture) Rn.initTexture(j.t); }catch(e){}
      if(j.done){ for(const o of j.s.list) o.frustumCulled=true; j.s.ready=true; show(j.s,!!j.s.want); } };
    const show=(s,v)=>{ if(!s.grp) return; s.grp.visible=v; s.on=v; fallback(s,!v); if(v){ s.k=-1; light(s); } };
    /* 第 3 版（LAWWW 11-12：省資源模式第一次走近那一下——載入完的那一幀 clone＋逐零件換材質＋掛上場景一次做完）：拆成分幀，和貼圖上傳、零件打開排同一條佇列（warmQ，一幀一件）：
       載入完 → 一幀 clone → 每幀處理 PREP 個零件（藏正面牆／範圍外的、算範圍、換材質）→ 掛上場景 → 貼圖一幀一張 → 零件一幀一個 → 可以顯示。 */
    const PREP=3;
    const build=(s,vis)=>{ if(s.built||s.loading||s.building||typeof ASSETS==='undefined'||!ASSETS.manifest[s.key]) return; s.loading=true;
      ASSETS.loadOne(s.key).then(c=>{ s.loading=false; if(!c||!c.scene||E.zone!==zone||s.built||s.building) return; s.building=true; s.want=!!vis; s.src=c.scene; warmQ.push({s,stage:'clone'}); }).catch(e=>{ s.loading=false; console.warn('店內模型（從街上看）載入失敗，用簡化的店內：'+s.id,e); }); };
    const stage=j=>{ const s=j.s; if(!s.building) return;
      if(j.stage==='clone'){ const r=s.src.clone(true); s.src=null; r.name='shop_real_'+s.id; r.userData.dyn=true; r.position.set(0,0,0); r.rotation.set(0,0,0); r.updateMatrixWorld(true); s.tmp=r; s.cache=new Map(); s.list=[]; s.pend=[];
        r.traverse(o=>{ if(o.isLight){ o.visible=false; return; } if(o.isMesh&&o.geometry) s.pend.push(o); });
        { const L=r.userData&&r.userData.lightmap; s.lm=L&&L.day&&L.night?{day:lmLoad(L.day),night:lmLoad(L.night),intensity:L.intensity||Math.PI*2}:null; }   /* 店內模型烘好的光照貼圖（上面 lmOf 的註解）*/
        warmQ.push({s,stage:'prep'}); return; }
      const r=s.tmp;
      for(let k=0;k<PREP&&s.pend.length;k++){ const o=s.pend.shift(); let nm=''; for(let q=o;q&&q!==r;q=q.parent) nm=(q.name||'')+'/'+nm;
        if(HIDE.test(nm)){ o.visible=false; continue; } { let dv=null; for(let q=o;q&&q!==r&&!dv;q=q.parent) dv=q.userData&&q.userData.dir; if(Array.isArray(dv)&&dv[2]<-0.9&&Math.abs(dv[0])<0.1){ o.visible=false; continue; } }   /* 正面牆：模型自訂屬性 dir＝[0,0,−1]（牆淡出用的「這面牆朝室內的方向」；汀州路的店叫 WALL_S、WALL_Sfix_*，名字對不上 WALL_front）*/
        if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); B.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld).getCenter(C);
        if(Math.abs(C.x)>s.w/2+0.4||Math.abs(C.z)>s.d/2+0.4||C.y>s.h+0.6||C.y<-0.5){ o.visible=false; continue; }
        o.castShadow=false; o.receiveShadow=false; o.material=Array.isArray(o.material)?o.material.map(m=>basic(m,s,s.cache,lmOf(o,s))):basic(o.material,s,s.cache,lmOf(o,s)); o.visible=false; s.list.push(o); }
      if(s.pend.length){ warmQ.push({s,stage:'prep'}); return; }
      r.position.set(s.x,s.y||0,s.z); r.rotation.y=s.ry||0; if(s.kx&&s.kx!==1) r.scale.x=s.kx;   /* kx：室內的寬度方向縮一點（公館：室內和那一棟一樣寬、牆又往外厚 14～20 cm，會伸進隔壁店裡，從隔壁的窗看到一片牆的背面）*/ r.visible=false; g.add(r); s.grp=r; s.tmp=null; s.cache=null; s.pend=null; s.building=false; s.built=true; s.meshes=s.list.length; warm(s); };
    const detach=s=>{ if(s.building){ s.building=false; s.tmp=null; s.pend=null; s.cache=null; s.src=null; for(const b of s.mats) b.dispose(); s.mats=[]; s.list=[]; for(let i=warmQ.length-1;i>=0;i--) if(warmQ[i].s===s) warmQ.splice(i,1); return; } if(!s.built) return; if(s.grp&&s.grp.parent) s.grp.parent.remove(s.grp); for(const b of s.mats) b.dispose(); s.mats=[]; s.list=[]; s.grp=null; s.on=false; s.built=false; s.ready=false; s.want=false; s.meshes=0; for(let i=warmQ.length-1;i>=0;i--) if(warmQ[i].s===s) warmQ.splice(i,1); fallback(s,true); };
    const dist=(s,p)=>Math.hypot(Math.max(0,Math.abs(p.x-(s.cx===undefined?s.x:s.cx))-(s.ex||0)),Math.max(0,Math.abs(p.z-(s.cz===undefined?s.z:s.cz))-(s.ez||0)));
    const tick=()=>{ const p=E.player&&E.player.obj?E.player.obj.position:null; if(!p) return; for(const s of shops) s.dd=dist(s,p); const by=shops.slice().sort((a,b)=>a.dd-b.dd);
      if(lite){ const n0=by[0]; for(const s of shops){ if(s===n0&&s.dd<s.near){ if(!s.built) build(s,true); else{ s.want=true; if(s.ready&&!s.on) show(s,true); } } else if((s.built||s.building)&&(s!==n0||s.dd>s.far)) detach(s); } }
      else{ for(const s of shops){ if(s.built){ if(s.dd<s.near){ s.want=true; if(s.ready&&!s.on) show(s,true); } else if(s.dd>s.far){ s.want=false; if(s.on) show(s,false); } } }
        /* 走到店前的那一間優先（BB 11-12 FAIL：第一次從街上走到 SUNNY SIDE 前 3 m，B7 built:false，看到空的玻璃盒——溫州街四間排隊預載，B7 離進場點最遠、排最後，一間要五十幾幀）：
           人已經在某一間的 near 裡、它還沒開始建，而正在建的是另一間遠的 → 先放掉那一間（之後再排），馬上建眼前這一間 */
        { const need=typeof ASSETS!=='undefined'?by.find(s=>!s.built&&!s.building&&!s.loading&&s.dd<s.near&&ASSETS.manifest[s.key]):null, busy=shops.find(s=>s.building); if(need&&busy&&busy!==need&&busy.dd>busy.near) detach(busy); }
        if(!shops.some(s=>s.loading||s.building)){ const nx=typeof ASSETS!=='undefined'?by.find(s=>!s.built&&ASSETS.manifest[s.key]):null; if(nx) build(nx,nx.dd<nx.near); } }
      for(const s of shops){ if(s.on) light(s); if(s.shutter) s.shutter.visible=!isOpen(s); } };
    let f=0; const up0=zone.update; /* 眼前那一間還沒好（人在 near 裡、正在建或正在暖機）＝一幀做 4 件（原本 1 件；等一幀、收尾、clone 那幾步照舊各佔一幀），而且每 5 幀看一次距離；沒有人在等的預載照舊一幀 1 件、20 幀看一次 */
    const urgent=()=>shops.some(s=>s.dd!==undefined&&s.dd<s.near&&!s.ready&&(s.building||s.built||s.loading));
    /* 量哪一步慢（BB 11-12：第一次走近店面的長幀 150～167 ms，都在建店內那一刻——要知道是哪一步）。CC 在瀏覽器看 GAME.E.zone.shopReal.prof：
       step＝這支函式自己每一種工作花的時間（clone／prep／tex 上傳貼圖／mesh 打開零件／show 顯示／tick）；frame＝做那一種工作的那一幀「整幀」多長（含畫面：編譯材質、上傳頂點都在畫的時候發生）；
       load＝模型載入完成的那一幀整幀多長（解析 GLB 在主執行緒）。每一格 {n 次數, max 最長 ms, sum 合計 ms, who 最長那一次是哪一間}。只記數字，不影響行為。 */
    const now=()=>(typeof performance!=='undefined'&&performance.now?performance.now():0), prof={step:{},frame:{},reset(){ this.step={}; this.frame={}; }}, rec=(t,k,ms,id)=>{ const o=t[k]||(t[k]={n:0,max:0,sum:0,who:''}); o.n++; o.sum=Math.round((o.sum+ms)*10)/10; if(ms>o.max){ o.max=Math.round(ms*10)/10; o.who=id||''; } };
    let lastT=0, lastK=null, lastId='';
    const kindOf=j=>j.stage?j.stage:(j.pre?'pre':j.c?'compile':(j.cwait?'cwait':(j.t?'tex':(j.m?'mesh':(j.hold?'hold':'done')))));
    const warmRun=()=>{ let n=urgent()?4:1; while(n-->0&&warmQ.length){ if(warmQ[0].s&&warmQ[0].s.compiling&&(warmQ[0].m||warmQ[0].pre||warmQ[0].hold||warmQ[0].done)){ const k=warmQ.findIndex(q=>!(q.s&&q.s.compiling&&(q.m||q.pre||q.hold||q.done))); if(k<0) break; warmQ.unshift(warmQ.splice(k,1)[0]); }   /* 還在編著色器的那一間：先做別的（別間的貼圖、clone、prep），都沒有就這一幀不做 */
      const j=warmQ[0], stop=!!(j.hold||j.done||j.c||j.pre||j.stage==='clone'), k=kindOf(j), id=j.s&&j.s.id, t0=now(); warmStep(); rec(prof.step,k,now()-t0,id); lastK=k; lastId=id; if(stop) break; } };
    zone.update=function(dt,E2){ const t=now(); if(lastT&&lastK){ rec(prof.frame,lastK,t-lastT,lastId); lastK=null; } lastT=t; if(up0) up0.call(this,dt,E2);
      const ld=shops.find(s=>s.loading), on0=shops.filter(s=>s.on).length; warmRun(); f++;
      if(f%20===1||(f%5===1&&shops.some(s=>s.dd!==undefined&&s.dd<s.near&&!s.ready))){ const t1=now(); tick(); rec(prof.step,'tick',now()-t1,''); }
      if(!lastK){ const sh=shops.find(s=>s.on&&!s._seen); if(sh||shops.filter(s=>s.on).length!==on0){ lastK='show'; lastId=sh?sh.id:''; } else if(ld&&!ld.loading){ lastK='load'; lastId=ld.id; } } for(const s of shops) s._seen=s.on; }; tick();
    const R={shops,tick,detach,lite,warmQ,prof}; zone.shopReal=R; return R; }
  /* 只有鐵捲門、沒有室內模型可以放的店面（同弦樂器：店在二樓，一樓櫥窗和樓梯口是街景模型自己的；BB 11-12 FAIL：新生南路 23:30 同一條街大步、好拍、山嵐、新運動都有鐵門，同弦沒有）。
     和 shopInsideReal 同一套鐵捲門（同一張浪板、營業中藏、打烊／颱風停業顯示、每 20 幀看一次），只是不接室內：list＝[{id, place, cx,cz 玻璃面中心, ry 朝街的方向, sw 寬, sh 高}]。
     不動 zone.shopReal（那是有室內模型的店，CC 在瀏覽器看 built／on）；結果記在 zone.shopShut（shops[i].shutter.visible）。 */
  function shopShutters(E,g,zone,list){ if(!E||!g||!zone||!Array.isArray(list)||!list.length) return null; const keep=zone.shopReal;
    const R=shopInsideReal(E,g,zone,list.map(q=>Object.assign({w:q.sw||1,d:1,h:q.sh||3,x:q.cx,z:q.cz,ex:0,ez:(q.sw||1)/2},q,{key:null}))); zone.shopReal=keep; zone.shopShut=R; return R; }
  /* SHOP-REAL-INSIDE 溫州街（LAWWW2-C 11-12 自查 shop_out_in_audit_1112：日常失速店外是一份烘光的店內、顏色偏粉，和走進去的黃牆、綠白方格地板不一樣）：
     日常失速（W2，正面朝東的橫巷 +x、玻璃面 x −37.5；室內 11×10×3.4，室內 x → 溫州街 z＝−13.5−x）放走進去的那一顆（bldg.wz_offbeat_interior，載入時已登錄）。室內原點＝街景腳本的 (−42.2,−13.5)（wz_street.py W2：本地 z＝室內 z−5、立面在 x −37.2；玻璃退 0.3 m 在室內前緣裡面）。北側的窗沒有鐵捲門（只做正面） */
  /* WZ-CLOSED-SIGN-1112（LAWWW2-C；店面標準 §12 第 1 點）：溫州街不是「真的店內」的店（櫥窗是街景模型自己的），打烊時招牌、店內、門口的光暈也要熄——只給 Z3.shopRealGlow 用的範圍表（不放室內模型）。
     位置照 wz_street.py 各棟的 x 範圍：A 側（z ≥ 5.9）阿德 A1 −12～−4、溫州書屋 A2 10～18.5、日和 A5 40～48、一盞 −24.7～−16.3；B 側（z ≤ −5.9）木曜日的招牌燈 5～9、巷口茶飲 B5 西半 16～23、夏日冰菓室 B5 東半 23～30（騎樓退 3.4 m）。
     常在洗衣（24 小時）不列；阿忠鮮果 B6 30～40（AA 定的營業時間 wz_fruit，LAWWW ec4e20f59c）*/
  const WZ_GLOW_ONLY=(()=>{ const mk=(place,x0,x1,side,dep)=>{ const w=x1-x0, d=8, cx=(x0+x1)/2, f=side*(5.9+(dep||0)); return {place,w,d,x:cx,z:f+side*d/2,ry:0,cx,cz:f,ex:w/2,ez:0,glowOnly:true}; };
    return [mk('wz_print',-12,-4,1),mk('wz_books',10,18.5,1),mk('cvs',40,48,1),mk('wz_teahouse',-24.7,-16.3,1),mk('wz_mokuyobi',5,9,-1),mk('wz_tea',16,23,-1,3.4),mk('wz_ice',23,30,-1,3.4),mk('wz_fruit',30,40,-1)]; })();
  const wzShopReal=()=>{ const out=[{id:'W2',place:'wz_offbeat',key:'bldg.wz_offbeat_interior',w:11,d:10,h:3.4,x:-42.2,z:-13.5,ry:Math.PI/2,cx:-37.5,cz:-13.5,ex:0,ez:5.5,sx:[-4.55,5.25],sh:3.15}];
    /* SUNNY SIDE（B7，x 40～48、朝南 +z、玻璃面 z −5.9；室內 6.4×10×3.2，右牆貼著東側的落地窗：室內中心在這一棟中心往東 0.65−0.03）、小路（B3，x −9.6～4；室內 8×8×2.9 在這一棟正中間）：
       街景模型的簡化店內（暗褐色的牆／窗後一整面碗盤架）和走進去的不一樣（自查 11-12）。鍵用 wzGlbKey（和進店用的同一顆）；sx＝店面玻璃的範圍（以 cx 為準），鐵捲門蓋整面玻璃 */
    const Ly=typeof WZ_SHOPS_LAYOUT!=='undefined'?WZ_SHOPS_LAYOUT:null, add=(id,k,place,cx,dx,sx)=>{ const L=Ly&&Ly[k]; if(!L||!L.glb||!L.w||!L.d) return; out.push({id,place,key:wzGlbKey(k,L),w:L.w,d:L.d,h:L.h||3,x:cx+dx,z:-5.92-L.d/2,ry:0,cx,cz:-5.9,ex:L.w/2,ez:0,sx,sh:2.7}); };
    add('B7','brunch','wz_brunch',44,0.62,[-3.7,3.7]); add('B3','teishoku','wz_teishoku',-2.8,0,[-6.5,6.5]);
    /* 林家乾麵（A4，x 32～40、朝北 −z、店面 z 5.9；室內 6.4×8×3 正面 +z 轉成朝 −z）：整面開著的店，原本街景模型裡是另外做的一套簡化店內（第三批 11-12）。門在室內本地 x +1 → 世界 x 35，和進店點一樣 */
    { const L=Ly&&Ly.lin; if(L&&L.glb&&L.w&&L.d) out.push({id:'A4',place:'wz_lin',key:wzGlbKey('lin',L),w:L.w,d:L.d,h:L.h||3,x:36,z:5.92+L.d/2,ry:Math.PI,cx:36,cz:5.9,ex:L.w/2,ez:0,sx:[-3.3,3.3],sh:2.7}); }
    return out; };
  const GG_SHOP_REAL=(()=>{ const WB={G00:11.2,G01:9.2,G02:13.2,G03:11.2,G04:9.2,G05:9.2,G06:10.2,G07:10.2,G08:8,G11:10,G12:8,G13:9,G14:9};   /* 各棟的寬（wz_street.py）*/
    const mk=(id,place,key,cx,w,d,h,sx)=>({id,place,key,w,d,h,x:cx,z:22.02+d/2,ry:Math.PI,cx,cz:22,ex:w/2,ez:0,sx,sh:2.95,kx:Math.floor(Math.min(1,(WB[id]/2)/(w/2+0.2))*1000)/1000});   /* sx＝門窗的範圍（鐵捲門只蓋這一段；照 wz_street.py GG_XS 的 cards＋door）*/ return [mk('G04','gg_antai','bldg.gg_antai_interior',-18.6,9,10,3.3,[-4.15,4.15]),mk('G08','gg_xianguo','bldg.gg_xianguo_interior',19.6,8,10,3.3,[-3.65,3.65]),mk('G13','gg_rongendian','bldg.gg_rongendian_interior',64.1,9,10,3.3,[-4.15,4.15]),
      /* 第二批（11-12）：青木茶室、頁間書屋、日和便利店、洋洋鹹酥雞、慢輪單車、Afar、轉角唱片、Daybreak——室內配置的門窗本來就照這一排外觀做的（各店 layout 的 front），寬深高照各自的配置檔 */
      mk('G01','aoki','bldg.aoki_interior',-52.2,9.2,7,3.6,[-1.93,4.24]),mk('G02','bookstore','bldg.yejian_interior',-41.0,12,10,3.8,[-5.15,5.6]),mk('G03','cvs','bldg.cvs_interior_v2',-28.8,11.2,11,3.3,[-5.3,2.93]),mk('G05','yangyang','bldg.yangyang_interior',-9.4,9.2,11,3.3,[-4.3,3.5]),
      mk('G06','bikeshop','bldg.bikeshop_interior',0.3,10.2,12,3.6,[-4.4,4.1]),mk('G07','afar','bldg.afar_interior',10.5,10.2,8,3.7,[-3.9,3.35]),mk('G12','corner_records','bldg.corner_interior',55.6,8,11.5,3.3,[-3.39,2.42]),mk('G14','daybreak','bldg.daybreak_interior',73.1,9,8,3.7,[-3.31,3.07]),
      mk('G00','noodle','bldg.shaola_interior',-62.4,6,13,3.2,[-3,3]),
      mk('G11','flower_notes','bldg.flower_notes_interior',46.6,10,14,7.6,[-4.3,4.3])]; })();   /* 花序（第四批）：兩層樓的室內整顆放（前半是挑高），街上只開一樓的窗；二樓的窗照舊是照片 */   /* 公館燒臘（第三批）：店面照室內配置重開門窗（wz_street.py GG_XS G00）；模型鍵在載入時登錄（ggReg） */   /* SHOP-REAL-INSIDE 公館第一批（LAWWW2-C 11-12 自查 docs/art-rebuild/second_ai/wip/shop_out_in_audit_1112）：安泰藥局、汀州鮮果、榮恩典文具社——店外原本是照片卡（榮恩典暖色塞滿、店內白而疏；鮮果深色背景、店內白牆），改成玻璃後面放走進去的那一顆室內模型。店面玻璃在 z 22（立面 19＋騎樓 3），室內正面 +z 轉到朝 −z（ry π）；中心 x＝wz_street.py 那一棟的中心 */
  const GG_IN_PLACE={G00:'noodle'};   /* 公館街景模型裡立體的店內（sk_in_<棟>）→ 地點：G00＝燒臘店（區域 noodle，每天 11:00～23:00，AA_831）。Z3.shopInsideLit 打烊調暗（LAWWW 11-12：燒臘有營業時間了，打烊時從街上看窗不會變暗）*/
  /* OPEN-ONLY-1113（LAWWW2-C；BB_379 v4：溫特寶邸打烊門口立式衣架還擺在騎樓）：街景模型裡名字開頭 OPENONLY__<地點> 的物件只在營業時顯示、CLOSEDONLY__<地點> 只在打烊時顯示
     （地點＝PLACES 的 id，例 OPENONLY__tz_wente__rack；颱風停業算打烊）。掛在 zone.update 每 30 幀看一次（同 ggShopLit）。水果攤收攤（FRUIT 蓋布）也用這一套。回傳／記在 zone.openOnly＝{items,upd} */
  function openOnly(root,zone){ const items=[]; root.traverse(o=>{ const m=/^(OPENONLY|CLOSEDONLY)__([a-z0-9]+(?:_[a-z0-9]+)*)/.exec(o.name||''); if(m) items.push({o,open:m[1]==='OPENONLY',place:m[2]}); }); if(!items.length) return null;
    const upd=()=>{ const G=typeof GAME!=='undefined'?GAME.G:null; if(!G||typeof PLACES==='undefined'||!PLACES.isOpen) return; for(const it of items){ const op=!!PLACES.isOpen(it.place,(+G.hour)%24,G.day)&&!(PLACES.typhoonClosed&&PLACES.typhoonClosed(it.place,G.day)); it.o.visible=it.open?op:!op; } };
    let f=0; const up0=zone.update; zone.update=function(dt,E2){ if(up0) up0.call(this,dt,E2); if((f++)%30===0) upd(); }; upd(); zone.openOnly={items,upd}; return zone.openOnly; }
  const ggLitWired=new WeakMap();   /* 接過窗卡打烊調暗的材質 → {lit, U, mine, compiled, rewrap, entries}（第二次進公館沿用，見 ggShopLit 裡的註解）*/
  function ggShopLit(root,zone,a3,opt){ const real=Array.isArray(a3)?a3:null, LZ=(!real&&a3)||GG_LIT_ZONE; let mesh=null;   /* 第三個參數：陣列＝真的店內清單（公館 GG_SHOP_REAL，各佔一格、光暈照那一棟的寬分）；物件＝{模型裡的店 id: 地點}（別條街的窗卡用：新生南路 xs_fronts_lit——運動廣場、同弦、山嵐、南洋、大口；BB 11-12：同弦 23:30 二樓櫥窗還亮著）；不給＝公館那一張。opt.glow===false＝光暈不跟著熄 */ root.traverse(o=>{ if(!mesh&&o.isMesh&&/xs_fronts_lit/.test(o.name||'')) mesh=o; if(!mesh&&o.name==='NOSHADOW_xs_fronts_lit') o.traverse(q=>{ if(!mesh&&q.isMesh) mesh=q; }); }); if(!mesh||!mesh.material||!mesh.geometry||!mesh.geometry.attributes.uv1) return null;
    let ex=null; root.traverse(o=>{ if(!ex&&o.userData&&o.userData.xsShops) ex=o.userData.xsShops; }); const ids=String(ex||'ggtea,ggbook,ggcvs,ggyy,ggbike,ggafar,ggcorner,ggdb').split(',');
    /* GG-CLOSED-SIGN-1112（LAWWW2-C；店面標準 §12 第 1 點「打烊看得出來關了」）：十三間店的櫥窗改成真的店內以後沒有窗卡，招牌、店內、門口的光暈找不到是哪一間 → 打烊了招牌還亮。
       真的店內那幾間（GG_SHOP_REAL）也各佔一格（窗卡已經有那個地點的就共用同一格），光暈照那一棟的寬分 */
    const realBox={}; for(const q of (real||[])){ let k=ids.findIndex(id=>(GG_LIT_ZONE[id]||(id.indexOf('real:')===0?id.slice(5):null))===q.place); if(k<0){ if(ids.length>=GG_LIT_N) continue; ids.push('real:'+q.place); k=ids.length-1; } realBox[k+1]={x0:q.cx-q.w/2,x1:q.cx+q.w/2,z0:q.cz-3,z1:q.cz}; }
    const m=mesh.material;   /* 不複製材質：夜間亮度（TK.addNight 登記在原本的材質上）要照舊跟著走（CC 11-04 GG_night：複製以後 22:00／14:00 亮度比 ≈1）*/
    /* 第二次進公館（GG-NIGHT-CARDS-1104：CC-C r8c 11-04 12:52、BB-C 讀碼）：快取的 GLB 每次進區域是 c.scene.clone(true)，材質是同一個——原本每次都再包一層 onBeforeCompile（新的 mine.prev＝上一次的 mine），
       shader 被 patch 兩次（uv1、vShopIdx、uShopLit 重複宣告）→ 程式連結失敗、整張窗卡不畫（營業中的店也一樣，只看到後面的磚牆；r8b 設黑、打烊乘數改多少都沒差就是這個）。
       和 LOBBY-REENTRY（roomLightmap 的 lmWired）同型：接過的材質記在 ggLitWired（材質 → uniform、lit 陣列、包裝函式），再進來沿用、不再包；
       uniform 物件也沿用：材質沒有被丟掉的話 three.js 用快取的程式、不會再呼叫 onBeforeCompile，綁著的是第一次的 uniform——新的 upd 要寫同一個 lit 陣列才有用。
       patch 本身也先看原始碼有沒有 uShopLit：有就只接 uniform、不改原始碼（別的程式串接時被叫兩次也不會重複宣告）；包裝函式防遞迴（guard 接回去時兩個包裝互相串）*/
    let W=ggLitWired.get(m);
    if(!W){ const lit=new Array(GG_LIT_N+1).fill(1), U={value:lit};
      const patch=sh=>{ sh.uniforms.uShopLit=U;
        if(sh.vertexShader.indexOf('vShopIdx')<0) sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n#ifndef USE_UV1\nattribute vec2 uv1;\n#endif\nvarying float vShopIdx;').replace('#include <begin_vertex>','#include <begin_vertex>\nvShopIdx=uv1.x;');
        if(sh.fragmentShader.indexOf('uShopLit')<0) sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uShopLit[17];\nvarying float vShopIdx;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{ int si=int(vShopIdx+0.5); float k=1.0; for(int i=1;i<17;i++){ if(i==si) k=uShopLit[i]; } totalEmissiveRadiance*=k; diffuseColor.rgb*=k; }'); };
      let busy=false; const mine=function(sh,r){ if(busy) return; busy=true; try{ if(mine.prev&&mine.prev!==mine) mine.prev.call(this,sh,r); patch(sh); W.compiled++; } finally{ busy=false; } };
      const prev0=m.onBeforeCompile; mine.prev=prev0&&prev0!==THREE.Material.prototype.onBeforeCompile?prev0:null;
      W={lit,U,mine,compiled:0,rewrap:0,entries:0}; ggLitWired.set(m,W);
      m.onBeforeCompile=mine; m.customProgramCacheKey=()=>'ggShopLit'; m.needsUpdate=true; }
    W.entries++; const lit=W.lit, U=W.U, mine=W.mine;
    const upd=()=>{ const G=typeof GAME!=='undefined'?GAME.G:null; if(!G||typeof PLACES==='undefined'||!PLACES.isOpen) return; for(let i=0;i<ids.length&&i<GG_LIT_N;i++){ const zk=ids[i].indexOf('real:')===0?ids[i].slice(5):LZ[ids[i]]; lit[i+1]=zk?(PLACES.isOpen(zk,(+G.hour)%24,G.day)&&!(PLACES.typhoonClosed&&PLACES.typhoonClosed(zk,G.day))?1:0.03):1; } };
    let f=0;
    /* 別的程式（夜間、透視、調色）後來換掉 onBeforeCompile 的話：每次更新時接回去（串在它後面），重新編譯 */
    const guard=()=>{ if(m.onBeforeCompile!==mine){ mine.prev=m.onBeforeCompile; m.onBeforeCompile=mine; m.needsUpdate=true; W.rewrap++; } };
    const up0=zone.update; zone.update=function(dt,E2){ if(up0) up0.call(this,dt,E2); if((f++)%30===0){ guard(); upd(); } }; upd();
    const glow=opt&&opt.glow===false?null:ggShopGlow(root,mesh,U,realBox); if(real) shopSignLit(root,zone,real);   /* 打烊的店：店內、招牌、店門口自己的燈的光暈一起熄（LAWWW 11-04 06:58；CC GG_night：窗卡調暗了，但亮的主要是前面的光暈）*/
    const R={mesh,lit,ids,upd,glow}; zone.ggLit={glow:glow&&glow.info,name:mesh.name,mat:m.name,uv1:!!mesh.geometry.attributes.uv1,inScene:()=>{ let o=mesh; while(o.parent) o=o.parent; return o.isScene===true; },compiled:()=>W.compiled,rewrap:()=>W.rewrap,entries:()=>W.entries,lit};   /* 除錯：CC 在瀏覽器看 GAME.E.zone.ggLit（GG_night 沒暗的原因）；entries＝這個材質接過幾次（第幾次進公館）、compiled＝patch 跑了幾次（每個新程式一次）*/
    return R; }
  /* 公館打烊調暗的光暈那一半（LAWWW2 11-04，LAWWW 06:58 P1）：wzGlowBatch 合成的光暈網格加一個每頂點的店編號 aShop（和窗卡 uv1.x 同一套 1～8、xsShops 同順序，0＝不屬於哪一間），
     著色器乘 ggShopLit 的同一組 uShopLit：那一間打烊（< 0.99）就整個不畫。哪個光暈屬於哪一間：光暈中心落在那一間窗卡的範圍（z 在店面前後 5 m）裡——店內、門口的燈 x 前後各放 0.8 m（門口的燈在門框兩側，窗卡外面一點）；招牌、直立招牌不放寬（在店的邊上，放寬會分到隔壁那間：公館 GLB 的 vsign_40、vsign_50 就是隔壁店的）；
     只收店自己的燈——GLOW_gg_xs_in（新店店內）、GLOW_shopin（店內）、GLOW_signbox／GLOW_vsign（招牌）、GLOW_gg_xs_lamp（新店門口的燈）；騎樓燈 GLOW_arcadelamp 是整排騎樓的、不熄。
     回傳 info（除錯：GAME.E.zone.ggLit.glow）：每一間分到幾個光暈 */
  const GG_GLOW_SHOP=/^GLOW_(gg_xs_in|shopin|signbox|vsign|gg_xs_lamp)(_|$)/;
  function ggShopGlow(root,lit,U,realBox){ const g=root.parent; if(!g) return null; const gm=g.children.find(o=>o.isMesh&&o.userData&&o.userData.glowBatch&&o.name===root.name+'_glows'); if(!gm) return null;
    const P=lit.geometry.attributes.position, S=lit.geometry.attributes.uv1, v=new THREE.Vector3(), box={}; lit.updateMatrixWorld(true);
    for(let i=0;i<P.count;i++){ const s=Math.round(S.getX(i)); if(s<1||s>GG_LIT_N) continue; v.fromBufferAttribute(P,i); lit.localToWorld(v); g.worldToLocal(v); const b=box[s]||(box[s]={x0:1e9,x1:-1e9,z0:1e9,z1:-1e9}); b.x0=Math.min(b.x0,v.x); b.x1=Math.max(b.x1,v.x); b.z0=Math.min(b.z0,v.z); b.z1=Math.max(b.z1,v.z); }
    if(realBox) for(const s in realBox){ const r=realBox[s], b=box[s]; box[s]=b?{x0:Math.min(b.x0,r.x0),x1:Math.max(b.x1,r.x1),z0:Math.min(b.z0,r.z0),z1:Math.max(b.z1,r.z1)}:r; }   /* 真的店內那幾間：那一棟的寬 */
    const items=gm.userData.glowBatch.items, A=new Float32Array(items.length*4), info={}; let k=0;
    items.forEach((it,i)=>{ if(!GG_GLOW_SHOP.test(it.n||'')) return; let best=0, bd=1e9; const mg=/^GLOW_(signbox|vsign)/.test(it.n)?0:0.8;
      for(const s in box){ const b=box[s]; if(it.x<b.x0-mg||it.x>b.x1+mg||it.z<b.z0-5||it.z>b.z1+5) continue; const d=Math.abs(it.x-(b.x0+b.x1)/2); if(d<bd){ bd=d; best=+s; } }
      if(best){ A.fill(best,i*4,i*4+4); info[best]=(info[best]||0)+1; k++; } });
    gm.geometry.setAttribute('aShop',new THREE.BufferAttribute(A,1)); const m=gm.material, prev=m.onBeforeCompile;
    m.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); sh.uniforms.uShopLit=U;
      sh.vertexShader='attribute float aShop;\nuniform float uShopLit[17];\nfloat ggShopK(float s){ int si=int(s+0.5); float k=1.0; for(int i=1;i<17;i++){ if(i==si) k=uShopLit[i]; } return k>0.99?1.0:0.0; }\n'+sh.vertexShader.replace('vGlowOp = mix( aOp.x, aOp.y, uNightK )','vGlowOp = ggShopK( aShop ) * mix( aOp.x, aOp.y, uNightK )'); };
    m.customProgramCacheKey=()=>'wzGlowBatch1_ggShop'; m.needsUpdate=true;
    return {mesh:gm,info,n:k}; }
  /* SHOP-CLOSED-SIGN-1112（LAWWW2-C；店面標準 §12 第 1 點「打烊看得出來關了」）：公館以外的街（溫州街、汀州路、新生南路）沒有「照店熄光暈」，打烊了招牌、店內、門口的燈還亮。
     Z3.shopRealGlow(g,模型名,zone,真的店內清單)：街景模型合成的光暈網格（<模型名>_glows）每個光暈照位置分給那一間（那一間室內的範圍＋店門前後 4 m；最近的那一間），
     那一間沒開（PLACES.isOpen、颱風）就不畫。只收店自己的燈（店內、招牌、招牌燈、門口的燈、菜單燈箱）；騎樓燈、住家門燈、壁燈、路燈不動。最多 32 間。回傳 {mesh,lit,ids,upd,info} */
  /* SHOP-SIGN-LIT-1112（LAWWW2-C；BB 17:4x 公館燒臘 23:30 鐵門拉了招牌還亮；店面標準 §12 第 1 點）：街景模型的招牌面（SIGN_FACE_／VSIGN_FACE_）全部合成一張 wz_signs_atlas、
     晚上整片一起亮（TK.addNight），不分哪一間——所有街打烊的店招牌都還亮。每一塊板面（aItem）先看名稱有沒有那一棟的編號（q.id），沒有再照中心位置分給那一間（店面寬＋左右 0.4 m、店面前後 6 m；最近的那一間），
     那一間沒開＝那一塊不發光（字照樣看得到，只是不亮）。list 和 shopRealGlow／GG_SHOP_REAL 同一種表。回傳 {mesh,ids,slot,upd,info} */
  function shopSignLit(root,zone,list){ if(!root||!zone||!Array.isArray(list)||!list.length) return null; let mesh=null; root.traverse(o=>{ if(!mesh&&o.isMesh&&o.name==='wz_signs_atlas') mesh=o; });
    if(!mesh||!mesh.geometry.attributes.aItem||!mesh.userData.atlas||mesh.geometry.attributes.aShopS) return null; mesh.updateMatrixWorld(true);
    const N=32, ids=[], box=[]; for(const q of list){ if(!q||!q.place) continue; const c=Math.abs(Math.cos(q.ry||0)), sn=Math.abs(Math.sin(q.ry||0)), along=c>=sn, cx=q.cx===undefined?q.x:q.cx, cz=q.cz===undefined?q.z:q.cz, hw=(along?(q.ex||q.w/2):(q.ez||q.w/2))+0.4;
      const b=along?{x0:cx-hw,x1:cx+hw,z0:cz-6,z1:cz+6}:{x0:cx-6,x1:cx+6,z0:cz-hw,z1:cz+hw}; b.mx=cx; b.mz=cz; if(q.id) b.re=new RegExp('^V?SIGN_FACE_(.*[_T])?'+String(q.id).replace(/[^A-Za-z0-9]/g,'')+'(_|$)'); let k=ids.indexOf(q.place); if(k<0){ if(ids.length>=N) continue; ids.push(q.place); box.push([b]); } else box[k].push(b); }
    const items=mesh.userData.atlas.items, slot=new Array(items.length).fill(0), info={}, v=new THREE.Vector3();
    const TENANT=/(_t(_[ab])?|_2F)$|_t_[ab]$/;   /* 樓上住戶、二樓別家的招牌（wz_street.py 的 vtenant＝VSIGN_FACE_<棟>_t_a／_b、SIGN_FACE_<棟>_2F：套房出租、按摩、桌遊、鋼琴教室、美髮）——不是一樓這間店的，照自己的時間亮，不跟著這間關 */
    items.forEach((it,i)=>{ if(!it.c||TENANT.test(it.name||'')) return; v.set(it.c[0],it.c[1],it.c[2]).applyMatrix4(mesh.matrixWorld); let best=0, bd=1e9; for(let k=0;k<box.length&&!best;k++) for(const b of box[k]) if(b.re&&b.re.test(it.name||'')) best=k+1;   /* 板面名稱帶那一棟的編號（SIGN_FACE_G00、VSIGN_FACE_Tdongnan_t_a）＝那一間；直立招牌掛在樓房邊上，照位置會落在店面範圍外 */
      if(!best) for(let k=0;k<box.length;k++) for(const b of box[k]){ if(v.x<b.x0||v.x>b.x1||v.z<b.z0||v.z>b.z1) continue; const d=Math.hypot(v.x-b.mx,v.z-b.mz); if(d<bd){ bd=d; best=k+1; } } slot[i]=best; if(best) info[ids[best-1]]=(info[ids[best-1]]||0)+1; });
    const AI=mesh.geometry.attributes.aItem, A=new Float32Array(AI.count); for(let i=0;i<AI.count;i++) A[i]=slot[Math.round(AI.getX(i))]||0; mesh.geometry.setAttribute('aShopS',new THREE.BufferAttribute(A,1));
    const lit=new Array(N+1).fill(1), U={value:lit}, m=mesh.material, prev=m.onBeforeCompile;
    m.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); sh.uniforms.uSignLit=U;
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aShopS;\nvarying float vShopS;').replace('#include <begin_vertex>','#include <begin_vertex>\nvShopS=aShopS;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uSignLit[33];\nvarying float vShopS;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{ int si=int(vShopS+0.5); float k=1.0; for(int i=1;i<33;i++){ if(i==si) k=uSignLit[i]; } totalEmissiveRadiance*=k; }'); };
    m.customProgramCacheKey=()=>'shopSignLit'; m.needsUpdate=true;
    const upd=()=>{ const G=typeof GAME!=='undefined'?GAME.G:null, op=zone.placeOpen; if(!G||(!op&&(typeof PLACES==='undefined'||!PLACES.isOpen))) return; for(let i=0;i<ids.length;i++) lit[i+1]=(op?op(ids[i],G):PLACES.isOpen(ids[i],(+G.hour)%24,G.day)&&!(PLACES.typhoonClosed&&PLACES.typhoonClosed(ids[i],G.day)))?1:0; };   /* zone.placeOpen(地點, G)：這條街自己的開店判斷（118 巷照 L118.isOpen，PLACES 沒有它的營業時間）*/
    let f=0; const up0=zone.update; zone.update=function(dt,E2){ if(up0) up0.call(this,dt,E2); if((f++)%30===0) upd(); }; upd();
    const R={mesh,ids,slot,lit,upd,info}; zone.signLit=R; return R; }
  const SHOP_GLOW_OWN=/^GLOW_(gg_xs_in|shopin|shoplamp|signbox|vsign|gg_xs_lamp|signspot|menubox|offbeat_in|offbeat_lamp|xs_sign|mok_signlamp)(_|$)/;
  /* L118-CLOSED-LOOKS-OPEN-1112（LAWWW2-C；使用者截圖：水上便當沒開的時候燈亮、沒有鐵門，按了才說「鐵門拉下來一半」）：118 巷的店沒開（公休日、打烊後、颱風、L118.isOpen 假）——
     ①店裡的燈、招牌照 shopRealGlow／shopSignLit 一樣調暗（光暈網格 lane118_street_glb_glows 照位置分給各店）
     ②鐵捲門拉下來一半：掛在模型本來就有的捲門箱下面（wz_shopkit.shopfront_v2：箱在玻璃前 0.06～0.36 m、底 ih+0.2；一樓高 3.6 → ih 2.7），
       底到 1.25 m（和沒開時那一句「鐵門拉下來一半」一樣），寬＝店面開口（店寬 − 0.6）。每秒看一次開不開。 */
  function l118ClosedLook(E,g,zone,L,fw,fe){ if(!g||!zone||!L||!Array.isArray(L.shops)||!THREE.PlaneGeometry) return null;
    const isOpen=id=>{ try{ const G=typeof GAME!=='undefined'?GAME.G:null; if(!G) return true; if(typeof L118!=='undefined'&&L118.isOpen) return !!L118.isOpen(id,G); return typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen('l118_'+id,G.hour,G.day); }catch(e){ return true; } };
    const GH=L.groundH||3.6, ih=GH-0.9, yTop=ih+0.2, yBot=0.02, sh=yTop-yBot, list=[], doors=[];   /* L118-SHUTTER-FULL-1112（BB_379：只拉到一半，下半截露出暗玻璃和櫃台）：拉到地（離地 2 cm，不和地面疊面）*/
    for(const q of L.shops){ const W=q.z1-q.z0, sx=q.side==='W'?-1:1, fx=q.side==='W'?fw:fe, z=(q.z0+q.z1)/2;
      list.push({place:'l118_'+q.id,x:fx+sx*4,z,w:W,d:8,ry:Math.PI/2,cx:fx+sx*4,cz:z});
      const R=/^drink/.test(q.id)?0.3:0.9, iw=W-0.6, x=fx+sx*(R-0.2); doors.push({id:q.id,x,z,iw,sx}); }
    zone.placeOpen=place=>isOpen(String(place).replace(/^l118_/,''));   /* 光暈、招牌照 L118.isOpen（PLACES 沒有 118 巷的營業時間，一律算開著）*/
    let glow=null; try{ glow=shopRealGlow(g,'lane118_street_glb',zone,list); }catch(e){ console.warn('l118ClosedLook glow',e); }
    let mat=null; try{ const c=document.createElement('canvas'); c.width=64; c.height=256; const x=c.getContext('2d'); for(let i=0;i<16;i++){ const y=i*16, gr=x.createLinearGradient(0,y,0,y+16); gr.addColorStop(0,'#9a9c9e'); gr.addColorStop(0.45,'#c9cbcc'); gr.addColorStop(0.8,'#a9abad'); gr.addColorStop(1,'#6f7173'); x.fillStyle=gr; x.fillRect(0,y,64,16); }
      const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; if(THREE.SRGBColorSpace) t.colorSpace=THREE.SRGBColorSpace; mat=new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}); mat.name='l118_shutter'; }catch(e){ mat=null; }
    const shut=[]; if(mat){ const dark=new THREE.MeshLambertMaterial({color:0x5d6062}); dark.name='l118_shutter_bar';
      for(const d of doors){ const geo=new THREE.PlaneGeometry(d.iw,sh), uv=geo.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*d.iw/0.8,uv.getY(i)*sh/2.0);
        const m=new THREE.Mesh(geo,mat); m.name='l118_shutter_'+d.id; m.userData.dyn=true; m.position.set(d.x,yBot+sh/2,d.z); m.rotation.y=-d.sx*Math.PI/2;
        if(THREE.BoxGeometry){ const b=new THREE.Mesh(new THREE.BoxGeometry(d.iw-0.04,0.09,0.07),dark); b.name='l118_shutter_bar_'+d.id; b.position.set(0,-sh/2+0.045,0.03); b.userData.dyn=true; m.add(b); }
        m.visible=!isOpen(d.id); g.add(m); shut.push([d.id,m]); } }
    /* ③玻璃後面的淺店內（wz_in_*：整條街合成一個網格）沒開的店調暗：每個頂點照世界座標落在哪一間店的範圍（店面往裡 6 m、往外 0.5 m），乘那一間的亮度（開 1、沒開 0.12）。
       材質是快取共用的（再進來一次同一個材質）：uniform 掛在材質上只建一次，之後只改值。 */
    const NB=L.shops.length, inMats=[]; const rt=g.getObjectByName('lane118_street_glb');
    if(rt&&THREE.Vector4) rt.traverse(o=>{ if(!o.isMesh||!o.material||Array.isArray(o.material)) return; const m=o.material; if(!/^(wz_in_|sk_in_)/.test(m.name||'')||inMats.indexOf(m)>=0) return; inMats.push(m);
      if(!m.userData.l118In){ const U={box:{value:L.shops.map(()=>new THREE.Vector4(0,0,0,0))},lit:{value:new Array(NB).fill(1)}}; m.userData.l118In=U; const prev=m.onBeforeCompile;
        m.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); sh.uniforms.uL118Box=U.box; sh.uniforms.uL118Lit=U.lit;
          sh.vertexShader='uniform vec4 uL118Box['+NB+'];\nuniform float uL118Lit['+NB+'];\nvarying float vL118K;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{ vec4 l118W=modelMatrix*vec4(transformed,1.0); vL118K=1.0; for(int i=0;i<'+NB+';i++){ vec4 b=uL118Box[i]; if(l118W.x>=b.x&&l118W.x<=b.y&&l118W.z>=b.z&&l118W.z<=b.w) vL118K=uL118Lit[i]; } }');
          sh.fragmentShader='varying float vL118K;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=vL118K;'); };
        const ck=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):null; m.customProgramCacheKey=()=>(ck?ck():'')+'|l118In'; m.needsUpdate=true; }
      const U=m.userData.l118In; L.shops.forEach((q,i)=>{ const sx=q.side==='W'?-1:1, fx=q.side==='W'?fw:fe, a=fx+sx*6, b2=fx-sx*0.5; U.box.value[i].set(Math.min(a,b2),Math.max(a,b2),q.z0,q.z1); }); });
    const updIn=()=>{ for(const m of inMats){ const U=m.userData.l118In; if(U) L.shops.forEach((q,i)=>{ U.lit.value[i]=isOpen(q.id)?1:0.12; }); } }; updIn();
    let t=0; const up0=zone.update; zone.update=function(dt,E2){ if(up0) up0.call(this,dt,E2); t+=dt||0; if(t<1) return; t=0; for(const [id,m] of shut) m.visible=!isOpen(id); updIn(); };
    zone.l118Closed={glow,shutters:shut.map(x=>x[1]),inMats,isOpen};
    return zone.l118Closed; }
  function shopRealGlow(g,name,zone,list){ if(!g||!zone||!Array.isArray(list)||!list.length) return null; { const rt=g.getObjectByName(name); if(rt) shopSignLit(rt,zone,list); } const gm=g.children.find(o=>o.isMesh&&o.userData&&o.userData.glowBatch&&o.name===name+'_glows'); if(!gm||gm.geometry.attributes.aShop) return null;
    const N=32, ids=[], box=[]; for(const q of list){ if(!q||!q.place||ids.length>=N) continue; let k=ids.indexOf(q.place); const c=Math.abs(Math.cos(q.ry||0)), sn=Math.abs(Math.sin(q.ry||0)), hx=c*q.w/2+sn*q.d/2, hz=sn*q.w/2+c*q.d/2, along=c>=sn;   /* along＝店面沿 x */
      const b={x0:Math.min(q.x-hx,q.cx-(q.ex||0)),x1:Math.max(q.x+hx,q.cx+(q.ex||0)),z0:Math.min(q.z-hz,q.cz-(q.ez||0)),z1:Math.max(q.z+hz,q.cz+(q.ez||0))}; if(along){ b.z0-=4; b.z1+=4; } else { b.x0-=4; b.x1+=4; } b.mx=(b.x0+b.x1)/2; b.mz=(b.z0+b.z1)/2;
      if(k<0){ ids.push(q.place); box.push([b]); } else box[k].push(b); }
    const items=gm.userData.glowBatch.items, A=new Float32Array(items.length*4), info={}; let n=0;
    items.forEach((it,i)=>{ if(!SHOP_GLOW_OWN.test(it.n||'')) return; let best=0, bd=1e9; for(let k=0;k<box.length;k++) for(const b of box[k]){ if(it.x<b.x0||it.x>b.x1||it.z<b.z0||it.z>b.z1) continue; const d=Math.hypot(it.x-b.mx,it.z-b.mz); if(d<bd){ bd=d; best=k+1; } }
      if(best){ A.fill(best,i*4,i*4+4); info[ids[best-1]]=(info[ids[best-1]]||0)+1; n++; } });
    gm.geometry.setAttribute('aShop',new THREE.BufferAttribute(A,1)); const lit=new Array(N+1).fill(1), U={value:lit}, m=gm.material, prev=m.onBeforeCompile;
    m.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); sh.uniforms.uShopLit=U;
      sh.vertexShader='attribute float aShop;\nuniform float uShopLit[33];\nfloat ggShopK(float s){ int si=int(s+0.5); float k=1.0; for(int i=1;i<33;i++){ if(i==si) k=uShopLit[i]; } return k>0.99?1.0:0.0; }\n'+sh.vertexShader.replace('vGlowOp = mix( aOp.x, aOp.y, uNightK )','vGlowOp = ggShopK( aShop ) * mix( aOp.x, aOp.y, uNightK )'); };
    m.customProgramCacheKey=()=>'wzGlowBatch1_shopReal'; m.needsUpdate=true;
    const upd=()=>{ const G=typeof GAME!=='undefined'?GAME.G:null, op=zone.placeOpen; if(!G||(!op&&(typeof PLACES==='undefined'||!PLACES.isOpen))) return; for(let i=0;i<ids.length;i++) lit[i+1]=(op?op(ids[i],G):PLACES.isOpen(ids[i],(+G.hour)%24,G.day)&&!(PLACES.typhoonClosed&&PLACES.typhoonClosed(ids[i],G.day)))?1:0.03; };   /* zone.placeOpen(地點, G)：這條街自己的開店判斷（118 巷照 L118.isOpen，PLACES 沒有它的營業時間）*/
    let f=0; const up0=zone.update; zone.update=function(dt,E2){ if(up0) up0.call(this,dt,E2); if((f++)%30===0) upd(); }; upd();
    const R={mesh:gm,lit,ids,upd,info,n}; zone.shopGlow=R; return R; }
  /* PUTONG101-WINDOW-1102 第 2 版 B（LAWWW2 帳號 A 11-10；BB PARTIAL：博思一樓玻璃大廳白天 RGB 只從 [35,31,22] 到 [42,38,28]，從普通 101 北窗看還是黑洞）：
     那片帷幕退在樓板下面、照不到光，ck_glass 白天又不發光——頂點色調亮看不出來。真的玻璃白天會反射對面的天空和普通的白牆。
     做法：campus_teach.py 把那片帷幕的範圍（玻璃網格自己的座標）寫進 by_glass 的 extras.skyBox；這裡給那個材質加一段 shader：範圍內的像素白天加一層灰藍（輸出色空間直接加，
     和加法混合一樣，不受玻璃透明度影響：半透明時除以 alpha），晚上 0（照 TK.addNight 的亮度：ck_glass 白天 0、晚上 1 → 白天的比例＝1−emissiveIntensity/nightI），霧裡跟著淡掉。
     不另外加網格（LAWWW 選 B：teach_east_drawcall 博雅一棟 ≤ 4 個網格）。其他棟的玻璃沒有 skyBox，不受影響。測試：tests/putong101_window_unit.js
     第 3 版（BB 11-10 BB_255 v2b PARTIAL：北窗白天玻璃只到 [50,54,57]，要 [110,120,130]；東南角那一片沒套到）：加上去的量到畫面只剩三成左右（原因沒查到：瀏覽器才看得到），
     改成直接混到目標色（輸出色空間 [110,120,130]、往上亮一點，混 85%，alpha 一起混到 1：透明不透明都一樣）——結果不受玻璃原本多暗、透明度影響；skyBox 往東延到東南角那一片。 */
  const GLASS_SKY=0x6e7882, GLASS_SKY_K=0.85;   /* 第 3 版：目標色 [110,120,130]（輸出色空間），往上亮一點（×0.9～1.1）；混 85%（還看得到一點窗框後面的東西）*/
  function glassSky(o,mt,bx){
    if(!mt.userData.skyPatch){ const U=mt.userData.skyPatch={uDay:{value:0},uMin:{value:new THREE.Vector3(bx[0],bx[1],bx[2])},uMax:{value:new THREE.Vector3(bx[3],bx[4],bx[5])},uCol:{value:new THREE.Vector3(((GLASS_SKY>>16)&255)/255,((GLASS_SKY>>8)&255)/255,(GLASS_SKY&255)/255)}}   /* 第 4 版（v2D）：輸出色空間的數值直接傳（THREE.Color(hex) 會轉成線性：0x6e7882 → (40,48,57)，v2c 因此比 v2b 暗；v2b 的 0x4f5f73 → (20,29,44)＝CC 量到的「只到三成」）*/, prev=mt.onBeforeCompile, k0=mt.customProgramCacheKey;
      mt.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); Object.assign(sh.uniforms,{uSkyDay:U.uDay,uSkyMin:U.uMin,uSkyMax:U.uMax,uSkyCol:U.uCol});
        sh.vertexShader='varying vec3 vSkyP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n  vSkyP=position;');
        sh.fragmentShader='uniform float uSkyDay;\nuniform vec3 uSkyMin, uSkyMax, uSkyCol;\nvarying vec3 vSkyP;\n'+sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n'+
          '  if(uSkyDay>0.0&&all(greaterThanEqual(vSkyP,uSkyMin))&&all(lessThanEqual(vSkyP,uSkyMax))){\n    float skyF=uSkyDay*'+GLASS_SKY_K.toFixed(3)+';\n'+
          '    #ifdef USE_FOG\n    skyF*=1.0-fogFactor;\n    #endif\n    float skyT=clamp((vSkyP.y-uSkyMin.y)/max(uSkyMax.y-uSkyMin.y,0.01),0.0,1.0);\n'+
          '    gl_FragColor=mix(gl_FragColor,vec4(uSkyCol*(0.9+0.2*skyT),1.0),skyF);\n  }'); };
      mt.customProgramCacheKey=function(){ return (k0?k0.call(this):'')+'|glassSky4'; }; mt.needsUpdate=true; }
    const U=mt.userData.skyPatch; o.onBeforeRender=function(){ U.uDay.value=Math.max(0,Math.min(1,1-(mt.emissiveIntensity||0)/(mt.userData.nightI||1))); }; }
  function attachWenzhouModel(E,g,root,tag,name,tagVal){ let n=0; const box=new THREE.Box3(), sz=new THREE.Vector3(); const signFaces=[], plateFaces=[], intFaces=[];   /* tag＝套件建築上的標記（wzApt 公寓、wzJp 日式宿舍與院牆、ggShop 公館店面、ckTag 校園地標）；tagVal：只藏標記等於這個值的（校園一棟一個模型） */
    for(const b of g.children) if(b.userData&&b.userData[tag]&&(tagVal===undefined||b.userData[tag]===tagVal)){ if(b.isMesh) b.visible=false; else for(const m of b.children) if(m.isMesh||m.isSprite){ m.visible=false; if(m.isSprite&&m.userData.nightO!==undefined){ m.userData.nightO=0; m.userData.dayO=0; } } b.userData.formal=true; n++; }   /* 套件的光暈（TK.glowSprite）：TK.setNight 每次會依時段重設 visible，只藏起來的話晚上又會出現（和正式模型的光暈疊在一起）→ 日夜的亮度都設成 0 */
    const glows=[];
    root.traverse(o=>{ if(o.userData&&o.userData.glow) glows.push(o); if(!o.isMesh) return; const ud=o.userData||{}, mt=o.material, nm=mt&&mt.name; const glassy=!!(mt&&mt.transparent); o.castShadow=!glassy&&wzCastsShadow(o); o.receiveShadow=!glassy;
      if(/^PLATE_FACE_/.test(o.name)){ o.geometry.computeBoundingBox(); box.copy(o.geometry.boundingBox).getSize(sz); cafeFacePaint(o,wzPlateTex(ud,Math.max(sz.x,sz.z),sz.y),null); o.castShadow=false; plateFaces.push(o); return; }
      if(/^(V?SIGN|INTERIOR)_FACE_/.test(o.name)){ o.geometry.computeBoundingBox(); box.copy(o.geometry.boundingBox).getSize(sz); const wM=Math.max(sz.x,sz.z), hM=sz.y; o.castShadow=false;
        /* 118 巷（tag 'l118'）招牌上的字照店家資料（L118-SHOPS-REDO-1111，使用者 2026-11-11 九間店換店名）：街景模型 lane118_street.glb 的板面帶的是匯出當時的店名（自訂屬性 sign／sub），
           LAWWW2 的新外觀延後，這裡先把字換成 src/data/lane118_shops.js 的店名、類型。哪一塊板面是哪一間店：板面上的字等於那間店室內配置（src/data/l118_shop_layouts.js，LAWWW2 匯出）記的店名才換
           （直式招牌：板面的字是那個店名的開頭幾個字）；底色、色帶照模型原本的。直式：新店名五個字以內整個寫，更長的寫前四個字。模型重新匯出、配置重產以後兩邊一樣，這裡就等於沒換 */
        const ud118=(tag==='l118'&&typeof ud.sign==='string'&&ud.sign&&typeof LANE118_SHOPS!=='undefined'&&Array.isArray(LANE118_SHOPS.shops)&&typeof L118_SHOP_LAYOUTS!=='undefined')?(()=>{ const v=o.name.indexOf('VSIGN_FACE_')===0;
          for(const id of Object.keys(L118_SHOP_LAYOUTS)){ const old=L118_SHOP_LAYOUTS[id].name, sh=LANE118_SHOPS.shops.find(q=>q.id===id); if(!old||!sh||old===sh.name) continue;
            if(v?(ud.sign.length>=2&&old.indexOf(ud.sign)===0):ud.sign===old) return Object.assign({},ud,{sign:v?(sh.name.length<=5?sh.name:sh.name.slice(0,4)):sh.name},v||ud.sub==null||ud.sub===''?{}:{sub:sh.type}); }
          return ud; })():ud;
        if(o.name.indexOf('SIGN_FACE_')===0){ cafeFacePaint(o,wzSignTex(ud118,wM,hM,false),0.9,0); signFaces.push(o); return; }
        if(o.name.indexOf('VSIGN_FACE_')===0){ cafeFacePaint(o,wzSignTex(ud118,wM,hM,true),1.0,0); signFaces.push(o); return; }
        const r=Math.max(1,Math.round(wM/hM/2)), t=TK.interiorTex(ud.interior||'cafe').clone(); t.flipY=false; t.wrapS=THREE.RepeatWrapping; t.needsUpdate=true;
        if(!(r>1&&wzSplitQuadU(o,r))) t.repeat.set(r,1);   /* 店內景深卡（LAWWW2-C 2026-10-21）：要合成 atlas，atlas 裡不能重複貼圖 → 重複幾次就把板面切成幾塊，每一塊貼一整張 */
        cafeFacePaint(o,t,null); intFaces.push(o); return; }
      if(mt&&(nm==='wz_road'||/^wz_road_(main|ns|side)$/.test(nm))){ if(mt.map){ mt.map.userData.asphalt=true; mt.map.anisotropy=Math.min(8,E.renderer.capabilities.getMaxAnisotropy()); mt.map.needsUpdate=true; } if(E.roadMats&&E.roadMats.indexOf(mt)<0) E.roadMats.push(mt); }   /* 溫州街的正式路面（LAWWW2-B 精修第 3 批 f0c2bfec，wz_props.glb：主巷、Café 前南北向路、三條側巷）：和套件的柏油一樣入夜變暗；斜看不糊（anisotropy）。放在 wzReg 前面：第二次進溫州街時 E.roadMats 是新的 */
      /* 夜間的登記每次接上都要重做（LAWWW2-C 2026-10-18，男一舍遊戲內截圖）：正式模型的材質和 ASSETS 的快取共用（c.scene.clone(true) 不複製材質），
         離開區域時 disposeGroup → TK.forget 會把它們從夜間清單拿掉；wzReg 擋住的話第二次進來就不會再登記——窗、燈的亮度停在第一次接上時的樣子
         （白天第一次進來：之後天黑窗也不亮；晚上第一次進來：白天窗也亮著）。TK.addNight 自己會去重複 */
      if(nm==='ck_glass'&&Array.isArray(ud.skyBox)&&ud.skyBox.length===6) glassSky(o,mt,ud.skyBox);   /* 博思一樓玻璃大廳白天反射天空（PUTONG101-WINDOW v2 B，見 glassSky）；每次接上都要設 onBeforeRender（clone 不複製） */
      if(mt&&mt.userData.wzReg){ const nn=WZ_NIGHT[nm]; if(nn) TK.addNight(mt,nn[1],nn[2]); if(nm==='ck_bell_wash') TK.addNight(mt,0.75,0); }
      if(!mt||mt.userData.wzReg) return; mt.userData.wzReg=true;
      const nn=WZ_NIGHT[nm]; if(nn){ mt.emissive=new THREE.Color(nn[0]); TK.addNight(mt,nn[1],nn[2]); }
      if((nm==='ck_glass'||nm==='ck_pav_dark')&&mt.emissiveMap){ const t=mt.emissiveMap; t.generateMipmaps=false; t.minFilter=THREE.LinearFilter; t.needsUpdate=true; }   /* 校園地標的玻璃：亮燈、沒亮燈的窗同一個材質，自發光貼圖左半黑、右半燈光（campus_hall.py）；不用 mipmap，遠處左右兩半才不會混在一起（沒亮燈的窗發光） */
      if(nm==='jp_shoji'){ mt.emissiveMap=mt.map; }   /* 紙拉門：亮燈時整片紙發光、木格比較暗 */
      if((/^wz_pillar_/.test(nm)||/^seethru_/.test(nm)||nm==='wz_pole_concrete'||nm==='gt_palm_bark'||nm==='gt_palm')&&E.patchSeeThrough){ mt.userData.seeThrough=true; E.patchSeeThrough(mt); }   /* seethru_ 開頭：校舍門廊、拱廊的柱子（campus_hall.py 的 seethru_ck_col、seethru_ck_pier；CAM-PILLAR-HALLS-1031，測試 node tests/campus_hall_pillar_seethru_unit.js）*/ /* 騎樓柱子、共同教學館前的蒲葵：擋住玩家時網點透空（和套件的柱子、樹一樣） */
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
      items.push({x:+v.x.toFixed(2),y:+v.y.toFixed(2),z:+v.z.toFixed(2),size:s,day:dO,night:nO,n:o.name||''}); maxS=Math.max(maxS,s); maxD=Math.max(maxD,dO); maxN=Math.max(maxN,nO);
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
  /* 每一格的平均色（4×4 的 16 個像素加起來）只讀一次（PERF-ZONE-ENTER-1018，LAWWW2-B 2026-10-30）：原本每次進溫州街、Café（窗外的街）、校園都把每一格字牌畫到 4×4 再 getImageData——
     第一次讀像素要等 GPU 把排在前面的工作都做完（字牌的字、上一個區域的貼圖、shader），SwiftShader 電腦模式量到黑畫面裡停 1.4～3.4 秒（溫州街每次進來都停）。
     現在：同一張 canvas、或內容一樣（key：板面資料＋大小）的格子用記下來的值；字牌、門牌畫在 CPU 上的 canvas（wzCanvas），讀的時候不經過 GPU。
     店內景深卡（TK.interiorTex，townkit3d.js 的 canvas，跨區域共用同一張）第一次照舊要讀一次。 */
  const wzAvgK=new Map(), wzAvgW=new WeakMap();   /* 內容的 key → 平均（字串，數量＝不同的板面）；canvas → 平均（WeakMap：不留住已經丟掉的 canvas） */
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
    { let sx=null, r=0,g=0,b=0,n=0;
      for(const it of cells){ let a=wzAvgW.get(it.c)||wzAvgK.get(it.key), wt=it.bw*it.bh;
        if(!a){ if(!sx){ const sm=document.createElement('canvas'); sm.width=sm.height=4; sx=sm.getContext('2d',{willReadFrequently:true}); }
          sx.clearRect(0,0,4,4); sx.drawImage(it.c,0,0,4,4); const d=sx.getImageData(0,0,4,4).data; a=[0,0,0]; for(let i=0;i<64;i+=4){ a[0]+=d[i]; a[1]+=d[i+1]; a[2]+=d[i+2]; } wzAvgW.set(it.c,a); wzAvgK.set(it.key,a); }
        r+=a[0]*wt; g+=a[1]*wt; b+=a[2]*wt; n+=16*wt; }
      cx.fillStyle=n?'rgb('+Math.round(r/n)+','+Math.round(g/n)+','+Math.round(b/n)+')':'#808080'; cx.fillRect(0,0,AW,AH); }
    for(const it of cells){ const k=it.k; it.dw=it.w*k; it.dh=it.h*k; if(!it.rot){ cx.drawImage(it.c,it.x-P,it.y-P,it.dw+P*2,it.dh+P*2); cx.drawImage(it.c,it.x,it.y,it.dw,it.dh); continue; } cx.save(); cx.translate(it.x+it.dh,it.y); cx.rotate(Math.PI/2); cx.drawImage(it.c,-P,-P,it.dw+P*2,it.dh+P*2); cx.drawImage(it.c,0,0,it.dw,it.dh); cx.restore(); }   /* 轉 90°：canvas 的 (cx,cy) → atlas (x+h−cy, y+cx)（h、w 是縮放後的大小）*/
    const tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace; tex.flipY=false; tex.anisotropy=8;
    const geos=items.map((it,ii)=>{ const g=it.o.geometry.clone(); for(const k of Object.keys(g.attributes)) if(!['position','normal','uv'].includes(k)) g.deleteAttribute(k); it.o.updateMatrixWorld(true); g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,it.o.matrixWorld)); g.setAttribute('aItem',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(ii),1)); g.computeBoundingBox(); it.c3=g.boundingBox.getCenter(new THREE.Vector3());   /* aItem＝第幾塊板面、c3＝那一塊的中心（root 座標）：打烊的店招牌不亮（shopSignLit，SHOP-SIGN-LIT-1112）*/
      const s=it.src, uv=g.attributes.uv; for(let i=0;i<uv.count;i++){ const u=uv.getX(i), v=uv.getY(i); if(s.rot) uv.setXY(i,(s.x+s.dh*(1-v))/AW,(s.y+u*s.dw)/AH); else uv.setXY(i,(s.x+u*s.dw)/AW,(s.y+v*s.dh)/AH); } return g; });
    const merged=THREE_JSM.BufferGeometryUtils.mergeGeometries(geos,false); if(!merged) return null; for(const g of geos) g.dispose();
    const m=faces[0].material.clone(); m.map=tex; m.emissiveMap=tex; if(nightI!=null) TK.addNight(m,nightI,dayI||0); else m.emissiveIntensity=0; m.needsUpdate=true;
    const mesh=new THREE.Mesh(merged,m); mesh.name=name; mesh.castShadow=false; mesh.receiveShadow=true; mesh.userData.atlas={w:AW,h:AH,cells:cells.length,items:items.map(it=>({name:it.o.name,c:[+it.c3.x.toFixed(2),+it.c3.y.toFixed(2),+it.c3.z.toFixed(2)],x:it.src.x,y:it.src.y,w:+it.src.dw.toFixed(1),h:+it.src.dh.toFixed(1),rot:it.src.rot,board:+it.board.toFixed(3)}))};
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
  function room(E,o){ const g=new THREE.Group(); const W=o.w,D=o.d,H=o.h||3.6; const nav=new E3.NavGrid(W+2,D+2,o.cell||0.4,-W/2-1,-D/2-1); const floor=ground(g,W,D,o.floorTex||W3.stoneTex('#e6dccb'),[W/2,D/2],0,0,0); floor.material.roughness=0.7;
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
        /* 窗的零件（窗、框、窗台、窗簾）跟著所在的牆：牆淡出時一起隱藏，不然會浮在半空中擋住房間 */ if(this.winParts) for(const wp of this.winParts){ const toCam=new THREE.Vector3().subVectors(cam.position,wp.at); let v=toCam.dot(wp.dir)>0; if(wp.partition&&pp) v=v===(new THREE.Vector3().subVectors(pp,wp.at).dot(wp.dir)>0);
          if(v&&wp.side) v=Math.abs(cam.position.x*wp.side.ax+cam.position.z*wp.side.az-wp.side.c)<=wp.side.half;   /* 放大的窗景卡（ggViewPanes）：鏡頭跑到店面左右範圍外（側牆外）也藏，不然超出店面的那一段擋在畫面旁邊（CAM-VIEWPANE-SIDE-1109，BB-B 23:12 阿德影印 270°）*/ wp.obj.visible=v; } },
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
  const classroom={ id:'classroom', name:'法律系館A 201 階梯教室', indoor:true, camDist:4.4, build(E){ const CR=crL(), C=CR.C, W=C.W, D=C.D, H=C.H; const z=room(E,{w:W,d:D,h:H,cool:true,view:'linze_201',viewDepth:30,wallColor:'#e9e6df',floorTex:W3.stoneTex('#bdbcb8'),spawn:{x:C.door.x,z:C.door.spawnZ,yaw:Math.PI},winWall:C.windows.wall,winXs:C.windows.xs,winY:C.windows.y}); const g0=z.group, nav=z.nav;
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
    /* 地上的紙袋拿掉（使用者 11-03「為什麼教室地板有奇怪的袋子」：放在座位後面 0.55 m，看起來浮在走道上；CLASSROOM-BAGS-1103）*/ { const st=z.seats.find(s=>s.row===1&&s.col===3); PROP(g0,'prop.bottle',st.x,st.y+0.78,st.z-0.55); } { const st=z.seats.find(s=>s.row===2&&s.col===5); PROP(g0,'prop.cup',st.x,st.y+0.78,st.z-0.55); }
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
  function lmLoad(url){ if(!lmTex[url]){ let res; const ready=new Promise(r=>{ res=r; }); const t=new THREE.TextureLoader().load(url,()=>res(t),undefined,()=>res(null)); t.flipY=false; t.colorSpace=THREE.SRGBColorSpace; t.channel=1; t.userData.ready=ready; lmTex[url]=t; } return lmTex[url]; }
  function lmMixAt(h){ h=((h%24)+24)%24; if(h>=6.8&&h<17.0) return 0; if(h>=18.6||h<5.6) return 1; return h>=17.0?(h-17.0)/1.6:(6.8-h)/1.2; }   /* 0＝白天那張、1＝晚上那張（17:00～18:36、05:36～06:48 慢慢換）*/
  const LM_MAPS=THREE.ShaderChunk.lights_fragment_maps.replace('vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );','vec4 lightMapTexel = mix( texture2D( lightMap, vLightMapUv ), texture2D( lmNight, vLightMapUv ), lmMix );');
  /* 快取的 GLB 每次進區域都是 c.scene.clone(true)：網格是新的、材質是同一批（clone 不複製材質）。接過光照貼圖的材質記在 lmWired（材質 → 它的 uniform）：
     再進一次只換這一次的白天／晚上貼圖、照時段更新同一組 uniform，不再包一層 onBeforeCompile——包兩層＝lmNight 等 uniform 宣告兩次、shader 編不過、
     那個網格整個不畫（BB-C 10-28 10:0x：霖澤館大廳第二次進去地板沒紋理、沙發長椅不見、NPC 坐在空氣上；201、202、多功能教室同一段程式）*/
  const lmWired=new WeakMap();
  /* 有光照貼圖的房間裡、沒有第二套 UV 的東西（細小零件、頂點色的小東西、門框窗框：照舊即時光）晚上跟著房間暗下來（RT-NIGHT-1028，LAWWW2-C）：
     晚上那張光照貼圖比白天暗很多（只剩燈），即時光的半球光只從 1.2 降到 0.95，這些東西晚上比旁邊的牆、地板亮 2～3 倍，像浮在畫面上。
     rtK：白天 1；晚上＝這一間晚上／白天光照貼圖的平均亮度比 × 1.2／0.95（限 0.3～1；貼圖還沒載好、讀不到像素時 RT_NIGHT_DEF），照 lmMix 混合。
     乘在半球光、方向光、點光源上（lights_fragment_maps 之後）。自己發光的（emissive 夠亮）不動；人物不在房間的 GLB 裡，不受影響。 */
  const RT_NIGHT_DEF=0.55, rtWired=new WeakMap();
  /* 只在白天發光的材質（GLB 的 extras.lightmap.dayEmit，材質名字含其中一個字串；bake_room.py 的 --dayemit：總圖大廳的天窗）：烘焙時只有白天那一張發光，
     遊戲裡原本整晚照樣亮（像一片日光燈）。晚上發光降到 DAY_EMIT_NIGHT、顏色換成夜空的暗藍灰，照 lmMix 混合（和換光照貼圖同一條曲線）。 */
  const DAY_EMIT_NIGHT=0.04, DAY_EMIT_NC=new THREE.Color(0x1c2230);
  function lmMean(t){ try{ const im=t&&t.image; if(!im||!im.width) return 0; const c=document.createElement('canvas'); c.width=c.height=32; const x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(im,0,0,32,32); const d=x.getImageData(0,0,32,32).data; let s=0,n=0;
      for(let i=0;i<d.length;i+=4){ const v=Math.max(d[i],d[i+1],d[i+2])/255; if(v<0.01) continue; s+=v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4); n++; } return n?s/n:0; }catch(e){ return 0; } }   /* 全黑的（貼圖空白的地方）不算 */
  /* 平均亮度每個網址只算一次、不卡畫面（PERF-ZONE-ENTER-1018，LAWWW2-B 2026-10-30）：原本每次進房間，貼圖載好就在主執行緒把整張光照貼圖（1024～2048 px）畫到 32×32 再讀像素——
     畫布在 GPU 上，讀像素要等 GPU 把這張大圖解碼、上傳，連同排在前面的 shader 都做完：SwiftShader 電腦模式量到社科圖淡入那一格停 4.7 秒、Café、麵店、宿舍 1.5～1.7 秒。
     現在：createImageBitmap 在背景把圖縮成 32×32（瀏覽器另外的執行緒解碼、縮小），再畫到 CPU 上的小畫布讀；同一個網址記下結果，再進來直接用。
     沒有 createImageBitmap、或它失敗時照舊（lmMean）。 */
  const lmMeanC=new Map();
  function lmMeanAsync(t,url){ if(url&&lmMeanC.has(url)) return lmMeanC.get(url); const im=t&&t.image; if(!im||!im.width) return Promise.resolve(0);
    const p=(typeof createImageBitmap==='function'?createImageBitmap(im,{resizeWidth:32,resizeHeight:32,resizeQuality:'medium'}).then(b=>{ const v=lmMean({image:b}); if(b.close) b.close(); return v; }):Promise.reject()).catch(()=>lmMean(t));
    if(url) lmMeanC.set(url,p); return p; }
  function roomLightmap(z,root,spec){ const U={lmNight:{value:lmLoad(spec.night)},lmMix:{value:0},lmDirK:{value:LM_DIRK}}, day=lmLoad(spec.day), done=new Set(), Us=new Set([U]);
    const RT={rtK:{value:1}}, Rs=new Set([RT]), rdone=new Set(); let kN=RT_NIGHT_DEF, nrt=0;
    root.traverse(o=>{ if(!o.isMesh||!o.geometry||!o.geometry.attributes.uv1) return;
      for(const m of [].concat(o.material)){ if(!m||done.has(m)||!m.isMeshStandardMaterial) continue; done.add(m); m.lightMap=day; m.lightMapIntensity=spec.intensity||Math.PI*2;
        const U0=lmWired.get(m); if(U0){ U0.lmNight.value=U.lmNight.value; Us.add(U0); continue; }   /* 已經接過（快取的 GLB 再進一次）：不再包一層 */
        lmWired.set(m,U);
        const prev=m.onBeforeCompile; m.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); Object.assign(sh.uniforms,U);
          sh.fragmentShader='uniform sampler2D lmNight; uniform float lmMix; uniform float lmDirK;\n'+sh.fragmentShader.replace('#include <lights_fragment_begin>','#include <lights_fragment_begin>\nreflectedLight.directDiffuse *= lmDirK; reflectedLight.directSpecular *= lmDirK;\n#if defined( RE_IndirectDiffuse )\nirradiance = vec3( 0.0 );\n#endif').replace('#include <lights_fragment_maps>',LM_MAPS); };
        const pk=m.customProgramCacheKey; m.customProgramCacheKey=function(){ return (pk?pk.call(this):'')+'|roomLM'; }; m.needsUpdate=true; } });
    const DE=[].concat(spec.dayEmit||[]), Ds=[];
    if(DE.length) root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m||Ds.indexOf(m)>=0||!DE.some(k=>(m.name||'').indexOf(k)>=0)) continue;
      if(m.userData.dayEmitI==null){ m.userData.dayEmitI=m.emissiveIntensity==null?1:m.emissiveIntensity; m.userData.dayEmitC=m.color?m.color.clone():null; } Ds.push(m); } });   /* 第一次接的時候記下原本的值（快取的 GLB 再進一次是同一批材質）*/
    root.traverse(o=>{ if(!o.isMesh||!o.geometry||o.geometry.attributes.uv1) return;   /* 沒有第二套 UV 的：晚上跟著暗（上面的註解） */
      for(const m of [].concat(o.material)){ if(!m||done.has(m)||rdone.has(m)||!m.isMeshStandardMaterial||Ds.indexOf(m)>=0) continue; rdone.add(m);   /* 只在白天發光的另外處理（下面 mix）*/
        if(m.emissive&&(m.emissive.r+m.emissive.g+m.emissive.b)*(m.emissiveIntensity==null?1:m.emissiveIntensity)>0.3) continue;
        nrt++; const R0=rtWired.get(m); if(R0){ Rs.add(R0); continue; } rtWired.set(m,RT);
        const prev=m.onBeforeCompile; m.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); Object.assign(sh.uniforms,RT);
          sh.fragmentShader='uniform float rtK;\n'+sh.fragmentShader.replace('#include <lights_fragment_maps>','#include <lights_fragment_maps>\nirradiance *= rtK; reflectedLight.directDiffuse *= rtK; reflectedLight.directSpecular *= rtK;'); };
        const pk=m.customProgramCacheKey; m.customProgramCacheKey=function(){ return (pk?pk.call(this):'')+'|roomRT'; }; m.needsUpdate=true; } });
    Promise.all([day.userData.ready,U.lmNight.value.userData.ready]).then(([a,b])=>Promise.all([lmMeanAsync(a,spec.day),lmMeanAsync(b,spec.night)])).then(([md,mn])=>{ if(md>0&&mn>0) kN=Math.min(1,Math.max(0.3,mn/md*1.2/0.95)); z.rtNight=kN; });
    z.rtNight=kN;
    const mix=h=>{ const v=lmMixAt(h); for(const u of Us) u.lmMix.value=v; for(const r of Rs) r.rtK.value=1+(kN-1)*v;   /* 這一次用到的每一組 uniform（新接的、之前接過的）都照時段 */
      for(const m of Ds){ m.emissiveIntensity=m.userData.dayEmitI*(1-v*(1-DAY_EMIT_NIGHT)); if(m.userData.dayEmitC) m.color.copy(m.userData.dayEmitC).lerp(DAY_EMIT_NC,v); } };
    const up0=z.update; z.update=function(dt,E){ if(up0) up0.call(this,dt,E); mix(E&&E.hour!=null?E.hour:12); }; mix(typeof GAME!=='undefined'&&GAME.G?GAME.G.hour:12);
    z.lightmapped=done.size; z.rtWired=nrt; z.dayEmit=Ds.length; return done.size; }
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
  /* 牆的淡出方向（往房間裡的法線）：網格自己的 extras.dir；沒有就用上層節點的（GLB-WALLDIR-1105，LAWWW2-C 11-05：BB 的 Blender 套件把 dir 寫在空節點 WALL_back／WALL_left…，
     底下真正的網格 WALL_back_print…沒有——原本一律當成 [0,0,1]，左、右、前牆在鏡頭從外面看的時候不淡出、擋住人：日和便利店 cvs_interior.glb、林家乾麵 lin_interior.glb。tests/wall_dir_inherit_unit.js）*/
  function wallDirOf(o,root){ const v=x=>x&&(x.isVector3?[x.x,x.y,x.z]:(Array.isArray(x)&&x.length===3?x:null)); let d=v(o.userData&&o.userData.dir); for(let p=o.parent;!d&&p;p=p.parent){ d=v(p.userData&&p.userData.dir); if(p===root) break; } return d||[0,0,1]; }
  function attachRoomGLB(z,g0,fb,root){ const LMS=root.userData&&root.userData.lightmap, LMA=root.userData&&Array.isArray(root.userData.lightmaps)&&root.userData.lightmaps.length?root.userData.lightmaps:null; root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; if(o.material&&/ceiling/.test(o.material.name)&&!LMS&&!LMA) TK.bounce(o.material,0.5,0.5); } });   /* 有光照貼圖：天花板的亮已經烘焙進去，不另外加自發光 */   /* 天花板：和 room() 的天花板一樣帶自發光 */ g0.add(root); root.updateMatrixWorld(true); const nw=[];
    root.traverse(o=>{ const m=/^TRACE_(SQ\d+)/.exec(o.name); if(m) traceVis(o,m[1]); });   /* 痕跡（見 traceVis）*/
    root.traverse(o=>{ if(o.name==='WZ_CATBOWL') condVis(o,catBowlOn); });   /* 一盞前院的貓碗（ART-WZ6，AA_420 第 9 節）：找到貓以後（WZ_CAT_FOUND）、收養以前（PARK.catGone）*/
    const glassy=[];   /* 本來就半透明的牆面材質（玻璃、紗窗）：不放進淡出清單（淡出邏輯每格會把不透明度設回 1，玻璃會變成不透明的灰板），改成窗的零件：固定透明、牆淡出時一起藏（和 Café 室內一樣）*/
    root.traverse(o=>{ if(o.isMesh&&/WALL_/.test(o.name)){ const see=o.material.transparent&&o.material.opacity<0.9; o.material=o.material.clone(); o.material.transparent=true; const d=wallDirOf(o,root); o.userData.dir=new THREE.Vector3(d[0],d[1],d[2]); o.geometry.computeBoundingBox(); o.userData.center=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld);
      if(Array.isArray(o.userData.at)) o.userData.center=new THREE.Vector3().fromArray(o.userData.at).applyMatrix4(root.matrixWorld);   /* 淡出判斷點（GLB 的 at，正式模型的座標）：外框中心不在牆線上的零件用（118 巷店門外兩側的鄰居店面卡：外框中心在牆線外 2.3 m，鏡頭在牆線外 2.3 m 以內不會淡出、會擋住人；LAWWW2 10-22）*/
      if(see){ o.material.depthWrite=false; glassy.push(o); } else nw.push(o); } });
    /* 窗外的景（白天／夜景貼圖、隨時段變色，room() 的 applyTime 照舊換）：從備用模型的窗框組裡拿出來，放到正式模型的玻璃外面 0.3 m（放大一點：斜著看窗洞也看不到外面的空白）；牆淡出時一起藏（不然鏡頭在牆外時會擋住房間）*/
    const wp=[]; if(z.wins) for(const w of z.wins){ const part=w.parent; const ent=z.winParts&&z.winParts.find(p=>p.obj===part); const d=ent?ent.dir:new THREE.Vector3(1,0,0); w.position.addScaledVector(d,-0.42); w.scale.set(1.35,1.4,1); if(w.material.uniforms&&w.material.uniforms.sxy) w.material.uniforms.sxy.value.set(1.35,1.4); part.remove(w); g0.add(w); wp.push({obj:w,at:ent?ent.at:w.position.clone(),dir:d}); }
    /* 正式模型自己有窗景照片卡（WALL_*_VIEW*：SUNNY SIDE、小路…）的那一面：備用模型的窗（程序化的卡通樹和樓）搬到玻璃外 0.3 m 會擋在照片卡前面——
       SNS-VIEW-COVER-1110（LAWWW2 帳號 A 11-10；BB X254「SUNNY SIDE 窗外的樹和樓是平面卡通畫風」：遊戲裡看到的是這一片，不是模型裡那張溫州街照片）。
       只拿程序化的窗（視差窗 pview 是照片，照舊：小路的視差窗擋在 komichi 照片卡前面，要不要換由 LAWWW／BB 決定）；照片卡在這扇窗的正後方（往外＝−dir：winParts 的 dir 朝房間裡；窗的中心落在卡的左右、上下範圍內）就拿掉這扇窗；其他面照舊。 */
    { const cards=[]; root.traverse(o=>{ if(o.isMesh&&/WALL_.*VIEW/.test(o.name||'')) cards.push(new THREE.Box3().setFromObject(o)); });
      if(cards.length) for(let i=wp.length-1;i>=0;i--){ const e=wp[i], w=e.obj; if(!w.material||!(z.wins||[]).includes(w)||w.userData.pview) continue; w.updateWorldMatrix(true,false); const p=w.getWorldPosition(new THREE.Vector3()), d=e.dir.clone().negate(), lat=new THREE.Vector3(-d.z,0,d.x);
        const hit=cards.some(b=>{ const c=b.getCenter(new THREE.Vector3()); if(c.clone().sub(p).dot(d)<=0) return false; const lo=Math.min(b.min.dot(lat),b.max.dot(lat), new THREE.Vector3(b.min.x,0,b.max.z).dot(lat), new THREE.Vector3(b.max.x,0,b.min.z).dot(lat)), hi=Math.max(b.min.dot(lat),b.max.dot(lat), new THREE.Vector3(b.min.x,0,b.max.z).dot(lat), new THREE.Vector3(b.max.x,0,b.min.z).dot(lat)), pl=p.dot(lat);
          return pl>=lo-0.05&&pl<=hi+0.05&&p.y>=b.min.y&&p.y<=b.max.y; });
        if(hit){ g0.remove(w); w.geometry.dispose(); z.wins.splice(z.wins.indexOf(w),1); wp.splice(i,1); } } }
    for(const o of glassy) wp.push({obj:o,at:o.userData.center,dir:o.userData.dir,partition:!!o.userData.partition});
    fb.visible=false; z.walls.length=0; for(const w of nw) z.walls.push(w); z.winParts=wp; z.formal=true; if(LMS) roomLightmap(z,root,LMS); if(LMS&&LMS.dark) roomDarkMap(z,root,LMS);   /* 好幾顆 GLB 放在同一個 Group 給這裡（大口一樓、二樓）：Group 本身沒有 extras.lightmap，各顆的放在 root.userData.lightmaps＝[[那一顆的 scene, 它的 extras.lightmap], …]，各自接（XS-LM-1108，LAWWW2-B）*/ if(LMA){ let n=0; for(const [r,s] of LMA){ if(!r||!s) continue; n+=roomLightmap(z,r,s); if(s.dark) roomDarkMap(z,r,s); } z.lightmapped=n; } ceilHide(z,root); seatFold(z,root); }
  /* 貼著天花板的東西（GLB 的 CEIL_* 網格、extras.ceilHide；CORNER-CEIL-1107，LAWWW2-B 11-07；BB-B 16:04 判轉角唱片：天花板切掉時，樑、吸頂冷氣、店名飾板從上面擋住畫面）：
     天花板是單面朝下，鏡頭高過天花板就看不到；樑、管線、軌道燈這些還在，從上面擋住房間——鏡頭高過天花板時一起藏起來（和美國公寓的屋頂、吊扇同一個做法，us3d.js）。
     天花板高度＝CEIL_ 網格最高的地方（不是 instancing 的）；沒有 CEIL_ 的模型不受影響 */
  function ceilHide(z,root){ const list=[]; let top=0; root.updateMatrixWorld(true);
    root.traverse(o=>{ if(!o.isMesh||!(/^CEIL_/.test(o.name||'')||(o.userData&&o.userData.ceilHide))) return; list.push(o); if(!o.isInstancedMesh&&/^CEIL_/.test(o.name)) top=Math.max(top,new THREE.Box3().setFromObject(o).max.y); });
    if(!list.length) return 0; const lim=(top||3)-0.02; z.ceilHideList=list; z.ceilTop=lim;
    const up0=z.update; z.update=function(dt,E2){ if(up0) up0.call(z,dt,E2); const cam=E2&&E2.camera; if(!cam) return; const v=cam.position.y<=lim; if(v!==z._ceilVis){ z._ceilVis=v; for(const o of list) o.visible=v; } };
    return list.length; }
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
  const cafe={ id:'cafe', name:'2:30 AM', indoor:true, camDist:4.2, seeThru:true, build(E){   /* seeThru：吊燈電線（seethru_cafe_cord）擋住玩家時網點透空 */ const z=room(E,{view:'cafe',viewDepth:11,w:14,d:12,h:3.4,warm:true,wallColor:'#e8dcc4',floorTex:W3.canvasTex('cafe_screed',256,256,(x,w,h)=>{ x.fillStyle='#9d9b96'; x.fillRect(0,0,w,h); for(let n=0;n<70;n++){ const cx=(n*73)%w, cy=(n*151)%h, r=18+(n*37)%40, a=0.035+((n*13)%5)*0.01; const g=x.createRadialGradient(cx,cy,0,cx,cy,r); const v=n%2?255:40; g.addColorStop(0,'rgba('+v+','+v+','+v+','+a+')'); g.addColorStop(1,'rgba('+v+','+v+','+v+',0)'); x.fillStyle=g; x.fillRect(cx-r,cy-r,r*2,r*2); } for(let n=0;n<240;n++){ x.fillStyle='rgba(60,58,55,0.28)'; x.fillRect((n*97)%w,(n*61)%h,1,1); } })   /* 自流坪水泥灰（使用者 2026-10-16 23:4x「地板跟桌子顏色太近 我要自流坪那種水泥顏色」；正式模型 cafe_interior.glb 由 LAWWW2-B 改 ART-CAFE-FLOOR，這是載入前／失敗時的備用）*/,spawn:{x:0,z:5,yaw:Math.PI},winWall:'right',winXs:[2.5,-1.5],winY:1.9}); const g0=z.group, nav=z.nav; z.seeThru=true; const L230=cafe230L(); if(L230) z.cafe230=L230.version;   /* 2:30 AM 室內 v1b（AA cafe230_layout.js v2、aa_support/cafe230.glb；WZ-SHOPS1-1104）：配置沒載入＝照舊 */   /* 吊燈電線擋住玩家時網點透空：engine3d.js 的 updateSeeThrough 看的是區域實體（E.zone.seeThru），寫在定義上沒有用 */   /* 窗在右牆 z=−2.5、1.5（窗邊的雙人桌旁邊；正式模型的窗也在這裡）*/
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
    for(const sx of [-4.5,-2.9,-1.3,0.3]) z.seats.push({x:sx,z:-3.3,yaw:Math.PI,bar:true,tag:'bar',lift:+(0.72-((typeof CHAR!=='undefined'&&CHAR.SIT_TOP)||0.45)).toFixed(2)});   /* 吧檯高腳椅座面 0.72 m：坐姿抬高＝座面－CHAR.SIT_TOP（SIT-HEIGHT-1104 以後坐下的高度照 0.47 的椅面算；原本 0.27＝照 0.45 算），原本人坐進椅子裡（QA-W1 seats_on_furniture）*/
    nav.blockRect(-6.35,3.4,0.9,2.2,0,0.1); nav.blockRect(-5.3,3.4,0.5,0.8,0,0.1); nav.blockCircle(-6.55,4.85,0.18); nav.blockCircle(-1.05,5.15,0.2);
    for(const [sz,ap] of [[2.85,[-5.0,2.4]],[3.4,[-5.0,4.4]],[3.95,[-5.0,4.4]]]) z.seats.push({x:-5.95,z:sz,yaw:Math.PI/2,sofa:true,tag:'sofa',ap});   /* ap：前面是矮桌（離沙發 0.15 m），從桌子的一端走近再坐下 */
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
      const mv=L230&&(L230.added||[]).find(q=>q.kind==='plant_moved'&&q.from&&q.from[0]===-6.35&&q.from[1]===0.4), P1=mv?mv.to:[-6.35,0.4];   /* 2:30 AM（cafe230_layout.js v2）：西牆中間那盆搬到拱門北邊 (−6.35, 1.95)，讓出拱門卡座 */
      for(const [px,pz] of [P1,[6.35,-0.5],[-6.3,-2.6]]){ const pt=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.22,0.45,14),pm); pt.position.set(px,0.225,pz); g.add(pt); nav.blockCircle(px,pz,0.3); } }
    if(L230) cafe230Add(E,z,g,nav,L230);
    /* CAFE-BAR-CAM-1111（LAWWW2 11-11）：天花板下面那一層（水泥大梁深 0.42、風管底 H−0.62：2.78～3.4 m，tools/blender/env_second/aa_support/cafe230_interior.py）當「樓板」給 engine3d.js slabClip——
       跟隨鏡頭拉高（坐吧檯的人高 0.27，俯角 0.38 就到 3.46 m）穿進這一層時沿著視線拉近，停在梁下面（原本鏡頭在梁旁邊 0.44 m，整個畫面是梁）。
       站著、預設俯角 0.22 的鏡頭在 2.57 m，碰不到（slabClip 外加 0.15 m：2.63 m 以下照舊）。沒有 levelGroups：這一塊一直有效 */
    z.slabs=[{lv:0,x0:-7,x1:7,z0:-6,z1:6,y:3.4,t:0.62}];
    P3.mergeStatic(g);   /* 備用模型自己合併（外層合併會跳過它，正式模型載入後要能整組藏起來）*/
    if(L230){ cafe230Reg(L230); if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.cafe230_interior']) ASSETS.loadOne('bldg.cafe230_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); attachRoomGLB(z,g0,g,root); attachCafe230(E,z,g0,root); }).catch(e=>console.warn('2:30 AM 室內正式模型（cafe230）載入失敗，用程序化備用模型',e)); }
    else if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.cafe_interior']) ASSETS.loadOne('bldg.cafe_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); attachRoomGLB(z,g0,g,root); attachCafeInterior(z,g0,root); }).catch(e=>console.warn('2:30 AM 室內正式模型載入失敗，用程序化備用模型',e));
    return z; } };
  /* ---------- 2:30 AM 室內 v1b（WZ-SHOPS1-1104；AA src/data/cafe230_layout.js v2＋aa_support/cafe230.glb，LAWWW2 MODEL_READY）----------
     固定的 17 個座位、出口、進門落點、點餐、班表、告示都照 cafe 原本的（docs/handoff/WZ_SHOPS1_FIXED_COORDS.md 第 1 節）；這裡只加配置寫的新東西：
     · 座位：吧檯高腳椅 10～13 號開放玩家坐（「坐吧檯」、可以「點杯咖啡慢慢讀」，AA_659 第 1 節）、長桌兩端 8、9 號（「坐下」、可以讀書）；
       拱門卡座三個（配置 seats，接在 17 號後面＝17～19 號，tag booth，late：照作息坐下的人最後才挑，誰坐哪裡照舊，story3d.js seatFree）；
     · 阻擋：卡座 (−6.56, 0, 0.9×2.6；照 cafe230.glb 的坐墊前緣 −6.13，LAWWW 11-04)、卡座小圓桌 (−5.4, 0, 0.7×0.7)；大盆栽 (−6.35, 0.4) → (−6.35, 1.95) 在上面備用模型那一段搬；
     · 互動：「看唱片」(4.1, −5.0)、「看蛋糕櫃」(1.4, −3.65)（kind record、pastry；台詞 src/wzshops3d.js S.cafe230Line，AA_659 第 1 節）。 */
  function cafe230L(){ const L=typeof CAFE230_LAYOUT!=='undefined'?CAFE230_LAYOUT:null; return L&&L.version>=2&&L.zone==='cafe'?L:null; }
  /* LAWWW2 烘了光照貼圖的那一顆（aede8b99a：用 AA v1f 30c2d5998 的 aa_support/cafe230.glb 重烘，extras.lightmap＝second_ai/cafe230_lm_day／night.webp；attachRoomGLB 看 extras.lightmap）。
     配置指的還是 AA 那顆（aa_support）就換成烘好的這顆；AA 換了別的路徑就照配置（舊烘焙不蓋掉新幾何）。AA 改了 aa_support/cafe230.glb 以後要請 LAWWW2 重烘、更新 bakedFrom */
  const CAFE230_BAKED={from:'assets/models/env/second_ai/aa_support/cafe230.glb',url:'assets/models/env/second_ai/cafe230.glb',bakedFrom:'30c2d5998'};
  function cafe230Reg(L){ if(typeof ASSETS==='undefined'||!ASSETS.manifest||ASSETS.nobldg||ASSETS.manifest['bldg.cafe230_interior']) return;   /* ?nobldg：不登錄（照舊是程序化備用模型；assets3d.js 只在開機時刪 bldg.*）*/ ASSETS.manifest['bldg.cafe230_interior']={url:(L.glb===CAFE230_BAKED.from?CAFE230_BAKED.url:L.glb),type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/aa_support/cafe230_interior.py（溫州街「2:30 AM」室內 v1b，AA〔帳號 A〕製作、LAWWW2 驗收 MODEL_READY；claude/story-planning 8d494790d，配置 src/data/cafe230_layout.js v2）',license:'本作；貼圖 Poly Haven CC0＋本作程式產生'}; }
  const CAFE230_CUST={record:'看唱片',pastry:'看蛋糕櫃'};
  function cafe230Add(E,z,g,nav,L){ const fbM=M('#5a6b4e',{rough:0.8});
    for(const b of L.blocks||[]){ nav.blockRect(b[0],b[1],b[2],b[3],0,0.05); const m=new THREE.Mesh(new THREE.BoxGeometry(b[2],0.5,b[3]),fbM); m.position.set(b[0],0.25,b[1]); g.add(m); }   /* 備用模型的卡座、小圓桌色塊 */
    const S0=z.seats.slice(0,17), lab=i=>i>=10&&i<=13?'坐吧檯':'坐下';
    for(const i of [8,9,10,11,12,13]){ const q=S0[i]; if(!q) continue; const seat={x:q.x,z:q.z,yaw:q.yaw}; if(q.lift) seat.lift=q.lift; E.interactables.push({x:q.x,z:q.z,radius:0.9,label:lab(i),seat,cafeTable:true,cafeSeat:i}); }   /* 「點杯咖啡慢慢讀」只認 cafeTable（game3d.js seatMenu）*/
    for(const st of L.seats||[]){ const q={x:st.x,z:st.z,yaw:st.yaw,tag:st.tag||st.table||'booth',table:st.table||'booth',late:true}, seat={x:st.x,z:st.z,yaw:st.yaw}; if(st.ap){ q.ap=st.ap.slice(); seat.ap=st.ap.slice(); } z.seats.push(q); E.interactables.push({x:st.x,z:st.z,radius:0.9,label:st.label||'坐下',seat,cafeTable:true,cafeSeat:z.seats.length-1}); }   /* ap：配置指定的走近點（卡座前到小圓桌只有 0.35 m，從桌子南北側走近；game3d.js seatApproach 先試它）*/
    for(const q of L.interact||[]) if(CAFE230_CUST[q.kind]) E.interactables.push({x:q.x,z:q.z,radius:0.9,label:CAFE230_CUST[q.kind],wzShop:'cafe',kind:q.kind});
    nav._cm=null; }
  /* 正式模型（attachRoomGLB 之後）：GLOW_* 光暈合成一個網格（照開燈切白天／晚上，和 AA 的公館店一樣 ggAAattach）；窗外的畫（WALL_*_VIEW_*）晚上調暗；
     正面那張畫（z 8.5）不參加牆面淡出、改成窗的零件——溫州街的 3D 街景（cafeStreetLive）載入以後藏起來（不然會蓋住窗外真的街）；牆面淡出時整面藏起來（細木框的殘影，和舊 Café 一樣）*/
  /* CAFE-BAR-CAM-1111（LAWWW2 11-11；BB 11:2x：吧檯高腳椅坐下以後鏡頭整片是牆，線上 779 就有）：坐吧檯（高腳椅，人高 0.27 m）鏡頭往上調一點（俯角 0.38 左右）就到 3.4 m 以上，
     天花板的水泥大梁（深 0.42、底在 3.2 m 左右，a23_vc）離鏡頭 0.2～0.6 m、擋住整個畫面；其他方向（鏡頭轉到吧台那一邊、店的後牆外面）還有吧台後面的胡桃木層架（a23_walnut）、
     風管（a23_vc_metal）、亮面小東西（a23_vc_gloss）、燈泡（a23_bulb）、黃金葛（a23_leaf_pothos）。
     鏡頭停在梁下面（上面 cafe 的 z.slabs）；剩下擋住的（鏡頭轉到吧台那一邊時的吊燈、層架…）照溫州街 SUNNY SIDE、小路座位鏡頭的做法（WZ-SEAT-CAMS-1104：家具、管線、植物、胡桃木的材質網點透空）：這幾個材質擋在鏡頭和人中間、或離鏡頭 1.7 m 內時網點透空
     （engine3d.js updateSeeThrough；區域本來就 seeThru:true；比人遠的照常畫——人面前的吧台不會透）。牆（WALL_，本來就淡出）、地板、天花板不動。測試：node tests/cafe_bar_cam_1111_unit.js */
  const CAFE230_SEETHRU=['a23_vc','a23_vc_metal','a23_vc_gloss','a23_walnut','a23_bulb','a23_leaf_pothos'];
  /* SHOP-REALISM-1112 第八批（LAWWW2-C 11-13）：CC0 化把 a23_vc 的家具、燈具、皮面照顏色搬到 ambientCG 材質組（a23_c_*）、大盆栽換 Poly Haven（a23_ph_*）——照舊透空；地毯（a23_c_rug）在地上不擋，不加 */
  const CAFE230_SEETHRU_RE=/^a23_(c_(?!rug)|ph_)/;
  function attachCafe230(E,z,g0,root){ const gl=[]; root.traverseVisible(o=>{ if(o.userData&&o.userData.glow) gl.push(o); });
    if(gl.length){ const mesh=wzGlowBatch(E,g0,root,gl,'cafe230_glows',2.5); const on0=z.onLamps; z.onLamps=function(on){ if(on0) on0.call(z,on); mesh.material.emissiveIntensity=on?1:0; }; }
    root.traverse(o=>{ if(!o.isMesh) return; const mt=o.material, nm=mt&&mt.name; if(nm&&(/^seethru_/.test(nm)||CAFE230_SEETHRU.includes(nm)||CAFE230_SEETHRU_RE.test(nm))&&!mt.userData.seeThrough){ mt.userData.seeThrough=true; if(typeof E3!=='undefined'&&E3.patchSeeThrough) E3.patchSeeThrough(mt); } if(nm&&/leaf|pothos/.test(nm)){ mt.alphaTest=Math.max(mt.alphaTest||0,0.5); mt.side=THREE.DoubleSide; } });
    const vm=[]; let front=null; root.traverse(o=>{ if(o.isMesh&&/VIEW/.test(o.name)){ if(/^WALL_front/.test(o.name)) front=o; for(const m of [].concat(o.material)) if(m&&!vm.includes(m)){ if(m.userData.ei0==null) m.userData.ei0=m.emissiveIntensity!=null?m.emissiveIntensity:1; vm.push(m); } } });
    /* 窗景卡 a23_window_view（AA v1f 30c2d5998：上半正面溫州街、下半右窗毛玻璃）：晚上換夜版圖、不調暗（和 SUNNY SIDE 一樣，WZ_AA_NIGHTVIEW）；夜版圖載不到或其他窗景卡：照舊調暗 */
    const nv=CAFE230_NIGHTVIEW, nt=wzNightViewTex(nv.url), nvm=nt?vm.filter(m=>m.name===nv.mat):[]; for(const m of nvm){ m.userData.mapDay=m.map; m.userData.emDay=m.emissiveMap; } z.cafe230NightView=nvm.length;
    if(vm.length){ const at=z.applyTime; z.applyTime=function(h,w){ if(at) at.call(this,h,w); const hh=((h%24)+24)%24, night=hh<6||hh>=18.8;
        for(const m of vm){ if(nvm.includes(m)&&!nt.userData.failed){ const mp=night?nt:m.userData.mapDay, em=night?nt:m.userData.emDay; if(m.map!==mp||m.emissiveMap!==em){ m.map=mp; m.emissiveMap=em; m.needsUpdate=true; } m.color.setScalar(1); m.emissiveIntensity=m.userData.ei0; continue; }
          if(nvm.includes(m)&&(m.map!==m.userData.mapDay||m.emissiveMap!==m.userData.emDay)){ m.map=m.userData.mapDay; m.emissiveMap=m.userData.emDay; m.needsUpdate=true; }
          m.color.setScalar(night?0.18:1); m.emissiveIntensity=m.userData.ei0*(night?0.35:1); } };
      if(typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); }
    if(front){ const i=z.walls.indexOf(front); if(i>=0) z.walls.splice(i,1); front.material.opacity=1; z.winParts.push({obj:front,at:new THREE.Vector3(0,1.7,6),dir:new THREE.Vector3(0,0,-1)}); }
    const baseFade=z.fadeWalls; z.fadeWalls=function(cam,pp){ baseFade.call(this,cam,pp); for(const w of this.walls) w.visible=w.material.opacity>0.5; };
    if(front) cafeStreetLive(z,g0,front);
    return root; }
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
    cafeStreetLive(z,g0,view);
  }
  /* 店面玻璃外看得到真的溫州街（X132 CAFE-WINDOW-LIVE-1030，LAWWW2-B 2026-10-30；使用者 10-30「兩點半 Café 往進門那個方向的窗景還是靜態、很像貼一張圖」）：
     溫州街的正式模型（主巷兩側公寓 bldg.wenzhou_street、路面＋電線桿 bldg.wz_props）照溫州街的座標擺在玻璃外——Café 的店面在溫州街 x≈55、門在 z=0、面向西，
     溫州街 (x,z) → Café (z, 61−x)：往外看就是路口、斑馬線、主巷一路到巷底的公寓；鏡頭移動有真的視差。加上路口的兩棵行道樹、天空、走過的路人。
     · 合併過的大網格整條街都有（範圍到 Café 自己和隔壁兩棟）→ 材質複製一份、加裁切平面，只畫玻璃外面（Café 的 z≥6.35）；複製的材質不會動到溫州街本身。
     · 晚上：窗戶、招牌、店燈照溫州街的夜間設定（attachWenzhouModel 登記、這裡照時段 TK.setNight）；室內的燈比戶外暗，白天給街景一點自發光補亮（CAFE_ST_DAY）。
     · 鏡頭到前牆外時和原本的街景一樣藏起來（winParts）。載入失敗、或模型還沒到：照舊是畫的街景（view）。 */
  const CAFE_ST_OFF=61, CAFE_ST_CLIP=6.35, CAFE_ST_DAY=[0.32,0.2,0.0], CAFE_ST_DIM=0.2;   /* 補亮：白天、黃昏、晚上；DIM：晚上街景的顏色乘多少（室內晚上的環境光比戶外強很多，不壓暗的話晚上的街是白天的灰）*/
  function cafeStreetNight(h){ const k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); return Math.max(0,Math.min(1,k)); }   /* 和溫州街的 zoneTime 一樣 */
  function cafeStreetLive(z,g0,view){ const E=typeof GAME!=='undefined'&&GAME.E; if(!E||typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.wenzhou_street']) return;
    const st=new THREE.Group(); st.name='cafe_street'; st.userData.dyn=true; st.rotation.y=Math.PI/2; st.position.set(0,0,CAFE_ST_OFF); st.visible=false; g0.add(st);
    const clip=[new THREE.Plane(new THREE.Vector3(0,0,1),-CAFE_ST_CLIP)]; if(E.renderer) E.renderer.localClippingEnabled=true;
    const own=new Set(), boost=[];
    const prep=root=>{ const drop=[]; root.traverse(o=>{ if(o.userData&&o.userData.glow&&o.position.x>CAFE_ST_OFF-CAFE_ST_CLIP) drop.push(o); }); for(const o of drop) o.parent.remove(o);   /* 玻璃以內（Café 自己、隔壁兩棟）的光暈：光暈合成的網格沒辦法裁切，先拿掉 */
      root.traverse(o=>{ if(!o.isMesh) return; o.castShadow=false; o.receiveShadow=false; const one=m=>{ if(!m) return m; const c=m.clone(); c.userData=Object.assign({},m.userData); delete c.userData.wzReg; c.clippingPlanes=clip; own.add(c); return c; }; o.material=Array.isArray(o.material)?o.material.map(one):one(o.material); }); };
    const dimL=[]; const done=()=>{ for(const m of own){ if(m.color&&!(m.userData&&m.userData.nightI!=null)){ m.userData.c0=m.color.clone(); dimL.push(m); }
        if(!m.isMeshStandardMaterial||!m.map||m.transparent||(m.emissive&&m.emissive.getHex()!==0)||(m.userData&&(m.userData.nightI!=null))) continue; m.emissive=new THREE.Color(0xffffff); m.emissiveMap=m.map; m.emissiveIntensity=0; boost.push(m); }
      const vi=z.winParts.findIndex(p=>p.obj===view); if(vi>=0) z.winParts.splice(vi,1); view.visible=false;   /* 畫的街景在 winParts 裡（每一幀照鏡頭位置重設顯示）：要先拿掉，不然會蓋在 3D 街前面 */
      st.visible=true; z.cafeStreet=st; applyNow(); };
    let need=0, got=0; const keys=[['bldg.wenzhou_street','wzApt'],['bldg.wz_props','wzProp']];
    for(const [k,tag] of keys){ if(!ASSETS.manifest[k]) continue; need++;
      ASSETS.loadOne(k).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); prep(root); attachWenzhouModel(E,st,root,tag,'cafe_street_'+k.slice(5)); root.traverse(o=>{ if(!o.isMesh) return; o.castShadow=false; o.receiveShadow=false; for(const m of [].concat(o.material)) if(m&&!m.clippingPlanes) m.clippingPlanes=clip; });   /* 招牌、門牌合成 atlas 以後是新的網格、新的材質：一樣只畫玻璃外面 */ if(++got===need) done(); })
        .catch(e=>console.warn('Café 窗外的溫州街載入失敗，照舊用畫的街景',e)); }
    /* 套件的部分（溫州街 buildWenzhou 裡同樣的參數）：路口兩棵行道樹、斑馬線、路燈＋地上的光圈、Café 門口的燈光。材質複製一份（套件的材質是共用的，要照時段壓暗） */
    const mine=o=>{ o.traverse(q=>{ if(!q.isMesh) return; q.castShadow=false; q.receiveShadow=false; q.material=[].concat(q.material).map(m=>{ const c=m.clone(); c.userData=Object.assign({},m.userData); own.add(c); return c; }); if(q.material.length===1) q.material=q.material[0]; }); return o; };
    for(const [tx,tz,sc] of [[48.9,-5.6,0.95],[48.9,6.0,1.05]]){ const t=mine(TK.tree(7*sc)); t.position.set(tx,0,tz); st.add(t); }
    const pools=[]; const pool=(x,zz,r,col,sx,max)=>{ const p=TK.lightPool(r,col); p.material.clippingPlanes=clip; p.position.set(x,0.031,zz); if(sx) p.scale.set(1,sx,1); if(max) p.userData.poolMax=max; st.add(p); pools.push(p); };   /* 光圈也只畫玻璃外（Café 門口那一圈半徑 3.6 m，有一截在店內的地板上；TK.lightPool 每次新建材質，加裁切不會動到溫州街）*/
    for(const px of [12.2,34.2,45.5]) pool(px,4.65-1.9,4.5,'rgba(255,214,150,1)');   /* 電線桿上的路燈（電線桿在 wz_props.glb；燈頭在桿子往巷子 1.9 m） */
    { const L=mine(W3.lampPost()); L.position.set(47.75,0,11.8); L.rotation.y=Math.PI/2; st.add(L); pool(48.5,11.8,4.4,'rgba(255,214,150,1)'); const gs=TK.glowSprite('rgba(255,214,150,1)',1.8,0,0.85); gs.position.set(48.5,3.9,11.8); st.add(gs); }   /* 路口北側的路燈 */
    pool(53.2,0,3.6,'rgba(255,190,120,1)',1.75,0.5);   /* Café 自己的燈光灑在門口 */
    { const zt=TK.tex('zebra',256,64,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(240,238,230,0.92)'; for(let i=0;i<w;i+=32) x.fillRect(i+4,0,18,h); },false); const m=new THREE.Mesh(new THREE.PlaneGeometry(8.4,2.4),new THREE.MeshStandardMaterial({map:zt,transparent:true,roughness:0.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(46.4,0.012,0); st.add(m); own.add(m.material); }
    /* 天空：街景後面一個大的半球（溫州街區域有引擎的天空，Café 是室內區域沒有），白天、黃昏、晚上換顏色 */
    const skyM=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.BackSide,fog:false,depthWrite:false,clippingPlanes:clip});   /* 天空也只畫玻璃外面（BB-B 11-07 P3：鏡頭在側牆外、牆淡出時，看到的是整個半球的內壁——16:27 黃昏那一組下半部是橘色，畫面左邊一大塊橘色斜面）*/ const sky=new THREE.Mesh(new THREE.SphereGeometry(140,24,12,0,Math.PI*2,0,Math.PI/2),skyM); sky.position.set(10,-2,0); sky.renderOrder=-1; st.add(sky);
    const skyTex={}; const skyOf=k=>skyTex[k]||(skyTex[k]=cafeCanvas(8,256,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h); const S={day:['#7fa9d6','#b9d3ea','#e4ecf2'],dusk:['#4f5f8a','#d98a5e','#f3c58e'],night:['#0e1424','#1b2438','#2c3348']}[k]; g.addColorStop(0,S[0]); g.addColorStop(0.75,S[1]); g.addColorStop(1,S[2]); x.fillStyle=g; x.fillRect(0,0,w,h); }));
    z.winParts.push({obj:st,at:new THREE.Vector3(0,1.7,6),dir:new THREE.Vector3(0,0,-1)});
    let lastH=null; const tint=new THREE.Color(); const applyNow=()=>{ const h=(lastH==null?(E.hour||12):lastH)%24, k=cafeStreetNight(h); TK.setNight(k);
      const ph=k>=0.99?2:(h>=16.6||h<6.6?1:0); for(const m of boost) m.emissiveIntensity=CAFE_ST_DAY[ph]*(1-k*0.8);
      const dk=1-(1-CAFE_ST_DIM)*k, du=Math.max(0,1-Math.abs(h-18.0)/1.6)*(1-k*0.6); tint.setRGB(1,1-0.18*du,1-0.34*du).multiplyScalar(dk);   /* 黃昏偏暖（和引擎戶外黃昏同一個時段公式）*/
      for(const m of dimL) m.color.copy(m.userData.c0).multiply(tint);
      for(const p of pools) p.material.opacity=(p.userData.poolMax||0.55)*Math.max(0,Math.min(1,k*1.2-0.2));   /* 和溫州街的 zoneTime 一樣 */
      const t=skyOf(['day','dusk','night'][ph]); if(skyM.map!==t){ skyM.map=t; skyM.needsUpdate=true; } };
    const baseTime=z.applyTime; z.applyTime=function(h,weather){ if(baseTime) baseTime.call(this,h,weather); lastH=h; if(z.cafeStreet) applyNow(); };
    cafeStreetWalkers(E,z,st); }
  /* 窗外走過的路人（溫州街的座標；E.addExtra：換區域時引擎自動拿掉、放掉人物模型，和騎腳踏車的人一樣）：
     店門口騎樓前（溫州街 x≈53.6）、路口斑馬線、主巷兩側。直線來回走，不用導航格（街在 Café 的導航格外面）。人數照時段（深夜沒有人） */
  const CAFE_WALK=[[[53.4,-13],[53.4,13]],[[49.6,-7.5],[49.6,7.5]],[[47.2,-3.6],[18,-3.8]],[[46.5,3.8],[12,3.6]]];
  function cafeStreetWalkers(E,z,st){ if(typeof CHAR==='undefined'||!CHAR.build||!E.addExtra||typeof STORY==='undefined'||!STORY.extraSpec) return;
    const G=typeof GAME!=='undefined'?GAME.G:null, h=G?G.hour%24:12; const n=h>=1&&h<6?0:(h>=22||h<7||(E.q&&E.q.level==='low')?2:4);   /* 4 個：店門口、斑馬線、主巷兩側（第一版 6 個，門口鏡頭黃昏 330 次 draw call、58 萬三角形；靠近玻璃的是全細節人物）*/
    const toCafe=(x,zz)=>[zz,CAFE_ST_OFF-x];
    for(let i=0;i<n;i++){ const r=CAFE_WALK[i].map(p=>toCafe(p[0],p[1])); let o; try{ o=CHAR.build(STORY.extraSpec(940+i)); }catch(e){ break; }   /* 人物模型池用完就不再加 */
      o.traverse(q=>{ if(q.isMesh) q.castShadow=false; });   /* 玻璃外：室內的陰影照不到街上，投影只是多畫一次（下次建這個人物模型時 buildVRM 會重設）*/
      const g=new THREE.Group(); g.add(o); g.name='cafe_walker'; const len=Math.hypot(r[1][0]-r[0][0],r[1][1]-r[0][1]);
      const w={obj:g,rider:o,t:((i*0.37)%1)*len,dir:i%2?-1:1,speed:1.15+(i%3)*0.12,
        update(dt){ this.t+=this.dir*this.speed*dt; if(this.t>len){ this.t=len; this.dir=-1; } if(this.t<0){ this.t=0; this.dir=1; }
          const ex=(r[1][0]-r[0][0])/len, ez=(r[1][1]-r[0][1])/len; g.position.set(r[0][0]+ex*this.t,0,r[0][1]+ez*this.t); g.rotation.y=Math.atan2(ex*this.dir,ez*this.dir);
          g.visible=!!(z.cafeStreet&&z.cafeStreet.visible); if(g.visible) CHAR.animate(o,dt,{pose:'walk',speed:this.speed}); } };
      E.addExtra(w); } }
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
  /* ---------- 公館三間新室內（GG-SHOPS-REDO-1104；USER_WANTS X206；AA_647；LAWWW2 驗收 MODEL_READY）----------
     日和便利店（cvs：BB 的 bb_support/cvs_interior.glb＋src/data/cvs_layout.js v4＝模型 v2b，story-planning 61a107016）、
     頁間書屋（bookstore：AA 的 aa_support/yejian.glb＋src/data/yejian_layout.js v3＝模型 v3b，d593be119）、
     青木茶室（新區域 aoki：AA 的 aa_support/aoki.glb＋src/data/aoki_layout.js v3＝模型 v2c，697ed69cf）。
     接法照溫州街 wzShop、慢輪單車：room()（尺寸照配置）＋配置的導航阻擋（備用的家具色塊，D38 ③）＋座位＋互動點，正式模型 attachRoomGLB。
     配置檔沒有載入（Node 測試沒載、或拿掉）時 cvs、bookstore 照舊是舊的程序化室內，也沒有 aoki 區域（公館門口照舊外帶）。
     進門站的地方（SHOP_IN）：配置的 spawn 在店門出口的範圍裡（tests/spawn_exit_unit.js 的規則：出生點離出口要大於半徑＋0.2），改成往店裡走一段；出口在門內、半徑小一點（店都不大）。
     door：店門在配置裡的 x（公館的店門口互動點＝那一棟的中心 cx − door：房間轉 180°）；out：回公館站的地方（人行道、門口互動範圍外）；clerk：店員站哪；job：打工的告示（jobs3d.js S.addDesk）。
     測試：node tests/gg_interiors_1104_unit.js */
  const GG_L={cvs:()=>typeof CVS_LAYOUT!=='undefined'&&CVS_LAYOUT.shop?CVS_LAYOUT.shop:null, bookstore:()=>typeof YEJIAN_LAYOUT!=='undefined'?YEJIAN_LAYOUT:null, aoki:()=>typeof AOKI_LAYOUT!=='undefined'?AOKI_LAYOUT:null, afar:()=>typeof AFAR_LAYOUT!=='undefined'?AFAR_LAYOUT:null, daybreak:()=>typeof DAYBREAK_LAYOUT!=='undefined'?DAYBREAK_LAYOUT:null,
    yangyang:()=>typeof YANGYANG_LAYOUT!=='undefined'&&YANGYANG_LAYOUT.shop?YANGYANG_LAYOUT.shop:null,
    corner_records:()=>typeof CORNER_LAYOUT!=='undefined'&&CORNER_LAYOUT.corner?CORNER_LAYOUT.corner:null};   /* 轉角唱片（CORNER-IN-1107）：配置包一層 {version, corner}；區域 id 照 places.js 的 corner_records */   /* 洋洋鹹酥雞（YANGYANG-IN-1107）：配置 v3 的格式照 shaola_layout.js（{version, shop}）*/
  const GG2_NAME={afar:'afar café',daybreak:'Daybreak',yangyang:'洋洋鹹酥雞',corner_records:'轉角唱片'};   /* 公館店門口「進入 …」的字 */
  const SHOP_IN=(()=>{ const c=GG_L.cvs(), b=GG_L.bookstore(), a=GG_L.aoki(), P=Math.PI, o={};
    /* 日和便利店：門 x 0.4（自動門）；進門往裡 2 m（門墊上、櫃台西邊）；結帳的店員在收銀機後面（配置的 clerk）；打工的告示在櫃台北端外面（配置沒有寫：LAWWW 放的位置）*/
    o.cvs=c?{x:c.exit.at.x,z:+(c.d/2-2).toFixed(2),yaw:P,door:c.front.door.x,exit:{x:c.exit.at.x,z:+(c.d/2-0.6).toFixed(2),r:0.9},out:{x:-29.4,z:18,yaw:P},clerk:{x:c.clerk.x,z:c.clerk.z,yaw:c.clerk.yaw},job:{x:1.5,z:-1.6},gg:true}
      :{x:0,z:3.4,yaw:P,exit:{x:0,z:4.2,r:1.5},out:{x:-29.4,z:18,yaw:P},clerk:{x:4.0,z:-2.35,yaw:0},job:null};
    /* 頁間書屋：門在西端 x −4.6；進門往裡 2 m；店員在咖啡吧後面（配置 walkNote：x 5.05～5.7），面向西；打工的告示＝配置的 job_notice（門邊）*/
    const jn=b&&(b.interact||[]).find(q=>q.kind==='job_notice');
    o.bookstore=b?{x:b.exit.at.x,z:+(b.d/2-2).toFixed(2),yaw:P,door:b.front.door.x,exit:{x:b.exit.at.x,z:+(b.d/2-0.6).toFixed(2),r:0.9},out:{x:-38.8,z:20.2,yaw:P},clerk:{x:5.35,z:0.6,yaw:-P/2},job:jn?{x:jn.x,z:jn.z}:null,gg:true}
      :{x:0,z:4,yaw:P,exit:{x:0,z:4.6,r:1.5},out:{x:-38.8,z:20.2,yaw:P},clerk:{x:0.55,z:1.95,yaw:0},job:null};
    /* 青木茶室：門 x 1.85（店深只有 7 m：配置的出口往裡 1.2 m＝(1.85, 2.05)，就在方桌三的旁邊；places.js 的快速前往同一個算法）；店員在吧台後面東段（z −2.85～−2.2），面向客人 */
    if(a) o.aoki={x:a.exit.at.x,z:+(a.exit.at.z-1.2).toFixed(2),yaw:P,door:a.front.door.x,take:a.front.takeaway?+((a.front.takeaway.x0+a.front.takeaway.x1)/2).toFixed(2):3.59,exit:{x:a.exit.at.x,z:3.0,r:0.7},out:{x:-54.05,z:18,yaw:P},clerk:{x:3.3,z:-2.5,yaw:0},gg:true};
    /* afar café、Daybreak（GG-SHOPS2-1104）：店深 8 m，進門往裡 2 m（配置的 spawn (門 x, 3.3) 在出口的範圍裡）；出口在門內 (門 x, 3.4)、半徑 0.9（和便利店、頁間一樣）；
       回公館站在門口正前方的人行道 z 18（門口互動點 z 21 半徑 2.2 的外面；騎樓前的機車在門口兩側讓開）；店員在吧台後面：afar 吧台（x −2.725～−2.075）和深綠隔牆（x −3.4）中間、點咖啡那一段，面向東；
       Daybreak 長吧台（z −3.2～−2.5）後面（配置 walkNote：z −3.5～−3.2 是店員）、收銀機那一段，面向南（客人）。cx：那一棟的中心（店面街第 7、14 棟，照上面 shops 表算）*/
    const af=GG_L.afar(), db=GG_L.daybreak(), g2=(L,cx,clerk)=>({x:L.exit.at.x,z:+(L.d/2-2).toFixed(2),yaw:P,door:L.front.door.x,exit:{x:L.exit.at.x,z:+(L.d/2-0.6).toFixed(2),r:0.9},out:{x:+(cx-L.front.door.x).toFixed(2),z:18,yaw:P},clerk,gg:true});
    if(af) o.afar=g2(af,10.5,{x:-3.05,z:1.2,yaw:P/2});
    if(db) o.daybreak=g2(db,73.1,{x:-1.0,z:-3.4,yaw:0});
    /* 洋洋鹹酥雞（YANGYANG-IN-1107）：店深 11 m；店門口第一張四人桌（table 1，z 2.5～3.3、椅子 z 3.5）就在門後，afar 那一套「進門往裡 2 m」會站在椅子上——
       進門站 (1.2, 4.1)（門往裡 1.4 m、四人桌北邊 0.8 m）；出口在門內 (1.2, 5.1)、半徑 0.7（進門的地方在出口範圍＋0.2 m 外面）；回公館站在門口正前方的人行道 z 18；
       老闆站在臨騎樓的炸物櫃台後面、面向騎樓（配置 clerk）；第二個店員在店內炸物櫃後面、面向店裡（配置 clerk2）。cx＝店面街第 5 棟的中心 −9.4 */
    const yy=GG_L.yangyang(); if(yy){ const cl=q=>q?{x:q.x,z:q.z,yaw:q.yaw}:null;
      o.yangyang={x:yy.exit.at.x,z:+(yy.d/2-1.4).toFixed(2),yaw:P,door:yy.front.door.x,exit:{x:yy.exit.at.x,z:+(yy.d/2-0.4).toFixed(2),r:0.7},out:{x:+(-9.4-yy.front.door.x).toFixed(2),z:18,yaw:P},clerk:cl(yy.clerk),clerk2:cl(yy.clerk2),gg:true}; }
    /* 轉角唱片（CORNER-IN-1107）：配置的 exit、enterAt 是空的（CC 留給 LAWWW 填）、spawn (1.63, 4.65) 在門口出口的範圍裡——照洋洋：進門站 (1.63, 4.25)（門往裡 1.5 m；
       門扇（x 2.35～2.43、z 4.07～5.63）西邊 0.7 m、第一座唱片箱（z 2.5～3.65）北邊 0.6 m）、出口在門內 (1.63, 5.35) 半徑 0.7、回公館站在門口正前方的人行道 z 18（店面街第 12 棟的中心 55.6）；
       店員站在櫃台後面（配置 npc.staff 第一個，面向店門）*/
    const cr=GG_L.corner_records(); if(cr){ const st=((cr.npc||{}).staff||[])[0];
      o.corner_records={x:cr.front.door.x,z:+(cr.d/2-1.5).toFixed(2),yaw:P,door:cr.front.door.x,exit:{x:cr.front.door.x,z:+(cr.d/2-0.4).toFixed(2),r:0.7},out:{x:+(55.6-cr.front.door.x).toFixed(2),z:18,yaw:P},clerk:st?{x:st.x,z:st.z,yaw:st.yaw}:null,gg:true}; }
    return o; })();
  const inSp=k=>{ const q=SHOP_IN[k]; return q?{x:q.x,z:q.z,yaw:q.yaw}:null; };
  /* 室內共用的建法（三間都一樣；導航格 0.2 m：配置的走道 0.8 m（便利店貨架之間、茶室窗邊椅子後面），0.4 m 的格子會把走道整條吃掉）：k＝區域 id、L＝配置、o：{label 出口的字、warm、floor 備用地板色、winXs／winW／winH／winY／view／viewDepth（窗外的景）、glb 資產 key、attach 接完正式模型以後、study 座位能不能讀書、seatR、shop 座位的 shop 值} */
  /* 正式模型的店，玻璃外面接回視差窗景（WINVIEW-AUDIT-1105 第三包，LAWWW2-C；使用者 07:4x「應該很多店面看出去的街景都不對吧」）：
     日和、燒臘的正式模型（BB）沒有窗景卡；原本的程序化房間有視差窗（W3.windowMat，照片 assets/models/env/views/<名>_{day,night}.webp，遊戲裡拍的兩層景深），
     但正式模型載入時整個備用房間藏起來，窗也跟著藏，玻璃外只剩天空。
     ggViewPanes：把房間原本的視差窗搬到正式模型的玻璃外面（往外推 0.3 m）；shopViewPane：沒有開窗的房間（燒臘）照玻璃的位置放一片。
     兩種都放進 z.wins（房間的 applyTime 照舊換白天／晚上、照時段調色）和 z.winParts（鏡頭在牆外時跟著前牆藏，不然會擋住鏡頭；ggViewPanes 放大的那一片，鏡頭在店面左右範圍外時也藏：CAM-VIEWPANE-SIDE-1109）。
     模型裡已經有窗景卡（名字有 VIEW）的店不動 */
  function vpPart(z,w,side){ const dir=new THREE.Vector3(0,0,1).applyQuaternion(w.quaternion); z.winParts=(z.winParts||[]).filter(p=>p.obj!==w); const wp={obj:w,at:w.position.clone(),dir};   /* 同一片窗景以前會有兩筆（attachRoomGLB 搬窗時一筆、這裡一筆，後面那筆蓋掉前面的）：只留這一筆 */
    if(side&&z.bounds&&w.parent){ const g=w.parent; g.updateMatrixWorld(true); const lat=new THREE.Vector3(-dir.z,0,dir.x).normalize(), half=Math.abs(lat.x)*z.bounds.w/2+Math.abs(lat.z)*z.bounds.d/2;   /* 店面左右的範圍：room() 以原點為中心、寬 w 深 d；換成世界座標（一盞整組往 +z 移）*/
      const o=g.localToWorld(new THREE.Vector3()), lw=g.localToWorld(lat.clone()).sub(o).normalize(); wp.side={ax:lw.x,az:lw.z,c:o.x*lw.x+o.z*lw.z,half}; }
    z.winParts.push(wp); }
  function ggViewPanes(z,g0,root){ let card=false; root.traverse(o=>{ if(o.isMesh&&/VIEW/.test(o.name||'')) card=true; }); if(card||!z.wins) return 0;
    const ws=z.wins.filter(w=>w.userData&&w.userData.pview&&w.parent); if(!ws.length) return 0; root.updateMatrixWorld(true); g0.updateMatrixWorld(true);
    const groups=[]; for(const w of ws){ g0.attach(w); const dir=new THREE.Vector3(0,0,1).applyQuaternion(w.quaternion); const pl=w.position.dot(dir); let gr=groups.find(q=>q.dir.dot(dir)>0.99&&Math.abs(q.pl-pl)<0.5); if(!gr){ gr={dir,pl,ws:[]}; groups.push(gr); } gr.ws.push(w); }
    const tb=new THREE.Box3(), cn=new THREE.Vector3(); let n=0;
    for(const gr of groups){ const w=gr.ws[0], out=gr.dir.clone().negate();
      if(gr.ws.length>1){ const c=new THREE.Vector3(); for(const q of gr.ws) c.add(q.position); c.divideScalar(gr.ws.length); const along=c.clone().sub(w.position); along.addScaledVector(gr.dir,-along.dot(gr.dir)); w.position.add(along);   /* 同一面牆的幾扇窗（慢輪兩扇櫥窗）：一片放在中間，其他的拿掉（放大以後會疊在一起閃）*/
        for(const q of gr.ws.slice(1)){ q.parent&&q.parent.remove(q); const k=z.wins.indexOf(q); if(k>=0) z.wins.splice(k,1); } }
      let far=w.position.dot(out)+0.3;   /* 往外推：至少 0.3 m；正式模型這一面的玻璃比較厚（慢輪 0.6 m）就推到玻璃外緣再 5 cm */
      root.traverse(o=>{ if(!o.isMesh) return; const mn=(([].concat(o.material)[0])||{}).name||''; if(!/glass/i.test(mn+' '+(o.name||''))) return; tb.setFromObject(o); const ctr=g0.worldToLocal(tb.getCenter(cn.clone())); if(Math.abs(ctr.dot(out)-w.position.dot(out))>1.2) return;
        for(const x of [tb.min.x,tb.max.x]) for(const y of [tb.min.y,tb.max.y]) for(const zz of [tb.min.z,tb.max.z]){ const p=g0.worldToLocal(new THREE.Vector3(x,y,zz)); far=Math.max(far,p.dot(out)+0.05); } });
      w.position.addScaledVector(out,far-w.position.dot(out)); w.visible=true;
      { const pr=w.geometry.parameters||{}, W=Math.max(pr.width||0,14), H=Math.max(pr.height||0,2*Math.max(w.position.y,4.2-w.position.y)); if(W!==pr.width||H!==pr.height){ w.geometry.dispose(); w.geometry=new THREE.PlaneGeometry(W,H); } }   /* 平面放大到蓋住整面店面（林家乾麵整面開著）：中心不動＝照片的地平線不動，視差照舊（windowMat 照平面上的點算，平面大小不影響照片）*/
      w.name='VIEWPANE_'+w.userData.pview; vpPart(z,w,true); n++; }
    z.viewPanes=n; if(n&&z.applyTime&&typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); return n; }
  function shopViewPane(z,g0,o){ if(typeof W3==='undefined'||!W3.windowMat) return null; const w=new THREE.Mesh(new THREE.PlaneGeometry(o.w,o.h),W3.windowMat(o.depth||20));
    w.position.set(o.x,o.y,o.z); w.rotation.y=o.ry||0; w.userData.pview=o.kind; w.userData.dyn=true; w.name='VIEWPANE_'+o.kind; g0.add(w); (z.wins||(z.wins=[])).push(w); vpPart(z,w);
    z.viewPanes=(z.viewPanes||0)+1; if(z.applyTime&&typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); return w; }
  function ggRoom(E,k,L,o){ const IN=SHOP_IN[k]; ggReg();
    const z=room(E,{w:L.w,d:L.d,h:L.h,cell:0.2,warm:!!o.warm,wallColor:L.wallColor||o.wallColor||'#efe6d6',floorTex:W3.stoneTex(o.floor||'#d8d3c8'),spawn:inSp(k),windows:o.winXs&&o.winXs.length?undefined:false,winWall:'front',winXs:o.winXs,winW:o.winW,winH:o.winH,winY:o.winY,view:o.view,viewDepth:o.viewDepth});
    const g0=z.group, nav=z.nav; z.gg=k;
    const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const c of g0.children.slice()){ if(c.isLight) continue; g0.remove(c); fb.add(c); } g0.add(fb);   /* 正式模型來了整組藏起來 */
    const onSeat=b=>(L.seats||[]).some(s=>Math.abs(b[0]-s.x)<0.05&&Math.abs(b[1]-s.z)<0.05);   /* 椅子、高腳椅本身不擋路（便利店的配置把座位也列進 blocks；溫州街、118 巷的店都不擋座位：坐下要走到椅子旁邊）*/
    const fbM=M('#a88b6a',{rough:0.8}); for(const b of L.blocks||[]){ if(onSeat(b)) continue; nav.blockRect(b[0],b[1],b[2],b[3],0,0.05); const m=new THREE.Mesh(new THREE.BoxGeometry(b[2],0.85,b[3]),fbM); m.position.set(b[0],0.425,b[1]); fb.add(m); }   /* 備用的家具色塊 */
    z.seats=[]; for(const s of L.seats||[]){ const lift=s.seatH&&s.seatH>0.6?+(s.seatH-((typeof CHAR!=='undefined'&&CHAR.SIT_TOP)||0.45)).toFixed(2):0, seat=Object.assign({x:s.x,z:s.z,yaw:s.yaw},lift?{lift}:{});   /* lift＝高腳椅（座面 seatH 0.72～0.75 m：坐姿抬高，和木曜日、巷子裡定食的吧台一樣）*/
      const ap=o.ap&&o.ap(s); if(ap) seat.ap=ap;   /* ap：指定的走近點（沙發前面是矮桌：從桌子的一端走近，和 Café 的沙發一樣）；按鈕範圍 1.5 m：站在矮桌另一邊也按得到 */
      z.seats.push(Object.assign({table:s.table,kind:'shop'},seat)); if(o.noSit&&o.noSit(s)){ z.seats[z.seats.length-1].npcOnly=true; continue; }   /* 玩家走不到的位子：不出「坐下」（路人照坐），見各店的說明 */
      E.interactables.push({x:s.x,z:s.z,radius:ap?1.5:(o.seatR||0.9),label:s.label||'坐下',seat,shop:o.shop||k,study:!!(o.study&&s.canStudy)}); }
    E.interactables.push({x:IN.exit.x,z:IN.exit.z,radius:IN.exit.r,label:o.label||L.exit.label,exit:{to:'gongguan',spawn:Object.assign({},IN.out)}});
    nav._cm=null; P3.mergeStatic(fb);
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest[o.glb]) ASSETS.loadOne(o.glb).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); attachRoomGLB(z,g0,fb,root); if(o.attach) o.attach(E,z,g0,root); if(o.view) ggViewPanes(z,g0,root); }).catch(e=>console.warn(L.name+' 室內正式模型載入失敗，用備用模型',e));   /* ggViewPanes：視差窗搬到正式模型的玻璃外（WINVIEW-AUDIT-1105）*/
    return z; }
  /* 正式模型的資產登錄（url 照配置；不動 assets3d.js 的舊登錄：配置沒載入時 cvs、bookstore 照舊用舊模型）*/
  function ggReg(){ if(typeof ASSETS==='undefined'||!ASSETS.manifest) return; const reg=(key,L,src,lic)=>{ if(L&&!ASSETS.manifest[key]) ASSETS.manifest[key]={url:L.glb,type:'building',lazy:true,source:src,license:lic||'本作；貼圖 Poly Haven CC0＋本作程式產生'}; };
    reg('bldg.cvs_interior_v2',GG_L.cvs(),'本作 Blender 腳本 tools/blender/env_second/bb_support/cvs_interior.py（公館「日和便利店」室內 v2，BB〔帳號 A〕製作、LAWWW2 驗收 MODEL_READY；claude/story-planning 61a107016（v2b），配置 src/data/cvs_layout.js v4）');
    reg('bldg.yejian_interior',GG_L.bookstore(),'本作 Blender 腳本 tools/blender/env_second/aa_support/yejian_interior.py（公館「頁間書屋」室內 v2，AA〔帳號 A〕製作、LAWWW2 驗收 MODEL_READY；claude/story-planning d593be119（v3b），配置 src/data/yejian_layout.js v3）');
    reg('bldg.aoki_interior',GG_L.aoki(),'本作 Blender 腳本 tools/blender/env_second/aa_support/aoki_interior.py（公館「青木茶室」室內 v2b，AA〔帳號 A〕製作、LAWWW2 驗收 MODEL_READY；claude/story-planning 697ed69cf（v2c），配置 src/data/aoki_layout.js v3）');
    reg('bldg.afar_interior',GG_L.afar(),'本作 Blender（tools/blender/env_second/aa_support/README_afar.md；公館「afar café」室內 v1b，AA〔帳號 A〕製作、LAWWW2 驗收 MODEL_READY；claude/story-planning 8a0bd80f2，配置 src/data/afar_layout.js）');
    reg('bldg.shaola_interior',typeof SHAOLA_LAYOUT!=='undefined'&&SHAOLA_LAYOUT.shop?SHAOLA_LAYOUT.shop:null,'本作 Blender 腳本 tools/blender/env_second/bb_support/shaola_interior.py（公館燒臘室內 v7，BB〔帳號 A〕製作、LAWWW2 驗收 MODEL_READY；claude/story-planning 65c2a43c5，配置 src/data/shaola_layout.js v1）','本作；貼圖本作程式產生（shaola_tex.py）');   /* 從街上看也要用（Z3.shopInsideReal）：載入時就登錄，不等進店 */
    reg('bldg.yangyang_interior',GG_L.yangyang(),'本作 Blender 腳本 tools/blender/env_second/bb_support/yangyang_interior.py、yangyang_tex.py（公館「洋洋鹹酥雞」室內 v1c，BB〔帳號 A〕製作、LAWWW2 驗收 ART_APPROVED；claude/cool-heisenberg-o8kuqx e5e9351e0，配置 src/data/yangyang_layout.js v3）','本作；貼圖本作程式產生（yangyang_tex.py）');
    reg('bldg.corner_interior',GG_L.corner_records(),'本作 Blender 腳本 tools/blender/env_second/bb_support/corner_interior.py、corner_tex.py（公館「轉角唱片」室內 v1c，CC〔帳號 A〕製作 cc-testing 4fc38d513、LAWWW2-B 改原型分組 38f4021e1、驗收 MODEL_READY；配置 src/data/corner_layout.js v1）','本作；貼圖 Poly Haven CC0＋本作程式產生（corner_tex.py）');
    reg('bldg.daybreak_interior',GG_L.daybreak(),'本作 Blender（tools/blender/env_second/aa_support/README_daybreak.md；公館「Daybreak」室內 v1b，AA〔帳號 A〕製作、LAWWW2 驗收 MODEL_READY；claude/story-planning 8094770c7，配置 src/data/daybreak_layout.js）'); }
  ggReg();   /* 載入時登錄；建區域時再登錄一次（Node 測試 assets3d.js 可能比這個檔晚載入）*/
  /* AA 的兩間（頁間、青木）：GLOW_* 空節點＝燈的光暈（合成一個網格，照路燈開了沒切白天／晚上，和體育館一樣）；窗外的景是模型裡的一張圖（WALL_front_VIEW_*）：晚上調暗（和木曜日的街景卡一樣）*/
  /* 公館 AA 的店換窗景照片（AFAR-VIEW-1105，LAWWW2-C 11-05；使用者 08:3x「AFAR看出去不太像公館」）：afar 模型裡的窗景卡（WALL_front_VIEW、材質 afr_window_view）用的是木曜日的樹（mok_view）。
     換成在 Blender 用公館的正式模型拍的：站在店裡往外看——自己這一棟的騎樓、柱子、停著的機車、羅斯福路、對面的校門和紅磚圍牆、椰子樹（tools/blender/env_second/wz_window_view.py --gg-street；
     鏡頭在公館 (10.5, 1.4, 26.07)＝窗景卡正中間後面 6.5 m，視野剛好蓋滿那一片 16 × 6.5 m 的卡；照片左右鏡像過，貼上去才是正的）。晚上換夜景那一張、不調暗。*/
  const GG_VIEW={afar:{mat:'afr_window_view',day:'assets/models/env/second_ai/aa_support/afar_view_day.webp',night:'assets/models/env/second_ai/aa_support/afar_view_night.webp'},
    aoki:{mat:'aok_window_view',day:'assets/models/env/second_ai/aa_support/aoki_view_day.webp',night:'assets/models/env/second_ai/aa_support/aoki_view_night.webp'},
    bookstore:{mat:'yej_window_view',day:'assets/models/env/second_ai/aa_support/yejian_view_day.webp',night:'assets/models/env/second_ai/aa_support/yejian_view_night.webp'},
    daybreak:{mat:'dbk_window_view',day:'assets/models/env/second_ai/aa_support/daybreak_view_day.webp',night:'assets/models/env/second_ai/aa_support/daybreak_view_night.webp'},
    yangyang:{mat:'yy_window_view',day:'assets/models/env/second_ai/bb_support/yangyang_view_day.webp',night:'assets/models/env/second_ai/bb_support/yangyang_view_night.webp'},
    corner_records:{mat:'cr_window_view',day:'assets/models/env/second_ai/bb_support/corner_view_day.webp',night:'assets/models/env/second_ai/bb_support/corner_view_night.webp'}};   /* WINVIEW-AUDIT-1105（LAWWW2-C；使用者 07:4x「應該很多店面看出去的街景都不對吧」）：青木、頁間、Daybreak 原本也是 mok_view（木曜日的樹）。照 afar 的做法，各在自己那一棟的位置拍（青木 x −52.2、頁間 −41.0、Daybreak 73.1）*/
  /* 洋洋鹹酥雞、轉角唱片（LAWWW2-B 11-07；LAWWW-B 15:35「兩間的 GLB 都沒有窗外的景，從店裡看玻璃外面是空的」）：BB／CC 的模型沒有窗景卡，LAWWW2-B 烘光照時加了一張
     （tools/blender/env_second/lightbake/glb_add_viewcard.py：照 afar，玻璃外 2.5 m、16 × 6.5 m；WALL_front_VIEW_yy／cr_window_view）。照片 tools/blender/env_second/gg_shop_views.sh：
     洋洋 x −9.4、轉角唱片 55.6；機車、行道樹、路燈照遊戲公館區域的實際位置（gg_scene/*.json）*/
  function ggAAattach(E,z,g0,root){ const gl=[]; root.traverseVisible(o=>{ if(o.userData&&o.userData.glow) gl.push(o); });
    if(gl.length){ const mesh=wzGlowBatch(E,g0,root,gl,z.gg+'_glows',2.5); const on0=z.onLamps; z.onLamps=function(on){ if(on0) on0.call(z,on); mesh.material.emissiveIntensity=on?1:0; }; }
    const vm=[]; root.traverse(o=>{ if(o.isMesh&&/VIEW/.test(o.name)) for(const m of [].concat(o.material)) if(m&&!vm.includes(m)){ if(m.userData.ei0==null) m.userData.ei0=m.emissiveIntensity!=null?m.emissiveIntensity:1; vm.push(m); } });
    const gv=GG_VIEW[z.gg], gvT=gv?{d:wzNightViewTex(gv.day),n:wzNightViewTex(gv.night)}:null; if(gvT){ if(gvT.d) gvT.d.userData.url=gv.day; if(gvT.n) gvT.n.userData.url=gv.night; }   /* 換窗景照片（白天／晚上兩張，晚上不調暗）：GG_VIEW */
    if(gvT) for(const m of vm) if(m.name===gv.mat&&!m.userData.ggMap0){ m.userData.ggMap0=m.map; m.userData.ggEm0=m.emissiveMap; }
    if(vm.length){ const at=z.applyTime; z.applyTime=function(h,w){ if(at) at.call(this,h,w); const hh=((h%24)+24)%24, night=hh<6||hh>=18.8; for(const m of vm){
        if(gvT&&m.name===gv.mat){ const t=night?gvT.n:gvT.d, ok=t&&!(t.userData&&t.userData.failed), mp=ok?t:m.userData.ggMap0; if(m.map!==mp){ m.map=mp; if(m.emissiveMap) m.emissiveMap=mp; m.needsUpdate=true; } if(ok){ m.color.setScalar(1); m.emissiveIntensity=m.userData.ei0; continue; } }   /* 照片載入失敗：換回模型原本那張、照舊調暗 */
        m.color.setScalar(night?0.18:1); m.emissiveIntensity=m.userData.ei0*(night?0.35:1); } };
      if(typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); }
    return root; }
  function buildCvs2(E){ const L=GG_L.cvs(), fromWZ=typeof GAME!=='undefined'&&GAME.G&&GAME.G.flags&&GAME.G.flags.CVS_FROM==='wenzhou';
    /* 窗外的景：一整片（正面左段落地窗 x −5.3～−0.66、自動門、右段窗 1.46～2.93 一起；attachRoomGLB 會放大 1.35 倍放到玻璃外面）。cvs 那兩張 11-10 照新店面的窗重拍（WINVIEW-AUDIT-1105：拍攝點 (−27.62,1.4,21.41)＝正式模型視差窗中心；cvs_wz 照舊）*/
    const z=ggRoom(E,'cvs',L,{label:L.exit.label,floor:'#e3e1dc',winXs:[1.18],winW:8.3,winH:2.65,winY:1.4,view:fromWZ?'cvs_wz':'cvs',viewDepth:fromWZ?10.6:24,glb:'bldg.cvs_interior_v2',shop:'cvs_seat',attach:(E,z,g0,root)=>attachCvsInterior(z,g0,root)});
    if(z.nav&&typeof CVS_LAYOUT!=="undefined"&&CVS_LAYOUT.version===4){ z.nav.blockRect(-0.65,-4.5,3.3,0.8,0); z.nav._cm=null; }   /* 配置 v4：中、右兩排貨架後面離後牆只剩 0.4～0.6 m（人站不住、找路卻會走進去＝卡住；CC 11-04 GG_int_cvs_menu：微波→結帳 601 秒走不到）。封掉那一段，找路改走貨架之間的通道；微波（左排後面的口袋）、冷藏櫃（東側）照舊走得到。BB 改配置把後面走道留到 0.9 m 以上就可以拿掉 */
    const ck=L.interact.find(q=>q.kind==='checkout');
    E.interactables.push({x:ck.x,z:ck.z,radius:1.1,label:ck.label,shop:'cvs'});   /* 結帳（照舊 story3d.js 的 shop:'cvs'）*/
    ggLooks(E,L,'cvs');   /* 熱食櫃、日和咖啡、包裹暫取、微波、冷藏櫃（AA_653 第 1 節；src/ggshops_sys3d.js）*/
    return z; }
  /* 三間室內「看東西、買東西」的互動點（AA_653；台詞和買賣在 src/ggshops_sys3d.js，互動點帶 ggs＝配置的 kind）：位置、字照配置 interact；GGS_KINDS＝每一間接哪幾個（稿上有台詞的）。
     半徑 0.9（便利店的櫃台前四個點間隔只有 0.65～1.2 m：照「最近的那一個」選）*/
  const GGS_KINDS={cvs:['hotfood','coffee','parcel','microwave','cooler'],bookstore:['shelf_browse','new_books','cafe_order'],aoki:['bookcase','vitrine','tea_tins','order']};
  function ggLooks(E,L,k){ for(const q of (L.interact||[])) if(GGS_KINDS[k].includes(q.kind)) E.interactables.push({x:q.x,z:q.z,radius:0.9,label:q.label,ggs:q.kind}); }
  function buildYejian(E){ const L=GG_L.bookstore();
    const z=ggRoom(E,'bookstore',L,{label:L.exit.label,warm:true,floor:'#d9d4c8',glb:'bldg.yejian_interior',attach:ggAAattach,study:true});   /* 頁間 v3b（AA d593be119，LAWWW2 驗過導航）：茶几往南 0.6 m、沙發往北 0.2 m，沙發前留 0.9 m——兩個位子照一般的走近（原本茶几離沙發只有 0.3 m，用 ap 從茶几西端走近，拿掉）*/   /* 窗外的景在模型裡（WALL_front_VIEW）；座位照配置的 canStudy 可以讀書（和木曜日、山嵐同一種書店，AA_647 第 2 節）*/
    const law=L.interact.find(q=>q.kind==='shelf_law');
    E.interactables.push({x:law.x,z:law.z,radius:1.0,label:law.label,shop:'book'});   /* 買教科書（story3d.js bookshop，照舊）*/
    ggLooks(E,L,'bookstore');   /* 看看書牆、看新書、點咖啡（AA_653 第 2 節）*/
    if(typeof YJBUY!=='undefined'&&YJBUY.extraPoints) for(const q of YJBUY.extraPoints(L)) E.interactables.push({x:q.x,z:q.z,radius:0.9,label:q.label,ggs:q.kind});   /* 雜誌、明信片（GG-YEJIAN-SHOP-1112，AA_853）：位置照配置 interact 的 magazines、postcards（LAWWW2 11-12 補的；配置沒有＝不放），按鈕的字在 src/yejian_buy3d.js（「看」＋稿的點名）。買東西的選單、招呼也在那一支 */
    return z; }
  const aoki={ id:'aoki', name:'青木茶室', indoor:true, camDist:3.8, build(E){ const L=GG_L.aoki();
    const z=ggRoom(E,'aoki',L,{label:L.exit.label,warm:true,floor:'#d9d1c3',glb:'bldg.aoki_interior',attach:ggAAattach,seatR:0.8,shop:'aoki',study:true,ap:s=>s.x<-4?[-3.6,1.3]:null});   /* v2c（AA 697ed69cf，LAWWW2 驗收）：吧台西端縮 0.5 m，最裡面四人桌北側兩張走得進去了（原本 noSit 只給路人坐，拿掉）；
     卡座兩位 (−4.15, 2.0)、(−4.15, 0.6)：前面是小圓桌，從兩張圓桌中間 (−3.6, 1.3) 走近（LAWWW2 量過：到兩個位子 0.89／0.71 m）*/   /* 可以讀書：照配置 canStudy（吧台高腳椅沒有＝不能），AA_653 B（和一盞茶屋不一樣）；窗外的景在模型裡 */
    ggLooks(E,L,'aoki');   /* 吧台的「點茶」＝內用（熱茶一壺、冷泡、茶點，AA_653 第 3 節）；門口的外帶照舊在公館（AA_653 A）。看書櫃、看茶具櫃、看茶罐（AA_653 第 3 節）*/
    return z; } };
  /* afar café、Daybreak（GG-SHOPS2-1104；AA_650、AA_652）：照青木茶室的 ggRoom；座位照配置的 canStudy 可以讀書（AA_652 第 1 節「在這裡讀書照讀書系統算」）。
     點餐、看甜點櫃、看看書架、看菜單（配置的 interact）＝src/gg2shops3d.js（GG2.interact，台詞照 AA_652）。
     Daybreak 的「看菜單」配置在 (−0.75, −2.1)，離「點餐」(−0.9, −2.1) 只有 0.15 m（兩個按鈕疊在一起，有一個永遠按不到）：這一版移到吧台中段 (−1.75, −2.1)（黑板在後牆 x −0.75，站在吧台前看得到）；配置要 LAWWW2／AA 調 */
  const GG2_MOVE={};   /* Daybreak 看菜單：配置 v2（AA 68c166ed2）已經移到 (−1.75,−2.1)，程式不再挪 */
  /* 洋洋鹹酥雞（YANGYANG-IN-1107）：配置 interact 的 kind 對到 AA_724 第 5 節「看店裡的東西」的 id（GG2_KIND）；配置沒有的兩個（炸物櫃 case、開放式廚房 kitchen）程式補（GG2_ADD）。
     · drink（配置的字「拿冷飲」）＝AA_724 的冷飲櫃（fridge）：稿上是「看」（紅茶、可樂在點餐選單的「冷飲櫃」那一類裡），字改「看冷飲櫃」。
     · order_street（騎樓那一側的「點炸物（騎樓）」，配置寫「LAWWW 接在公館區域」）：這一版不接（公館這一次只加店門），店內「點炸物（店內）」照常點。
     · case：店內炸物櫃前面、點餐和看菜單中間（x 0.2 那條走道：炸物櫃 z 1.0～4.7）；kitchen：隔間（白磁磚腰牆＋玻璃，z −2.5～1.0）前面、四人桌二和三中間的走道 */
  const GG2_KIND={yangyang:{order_street:null,drink:'fridge',selfserve:'self'}}, GG2_LABEL={yangyang:{fridge:'看冷飲櫃'}};
  const GG2_ADD={yangyang:[{kind:'case',x:0.2,z:2.5,label:'看炸物櫃'},{kind:'kitchen',x:0.2,z:-0.5,label:'看廚房'}]};
  /* 洋洋：沿著店內炸物櫃那一條走道（x 0.2）的三個「看」（炸物櫃、菜單、廚房）就在四人桌一、二西側那三張椅子的旁邊（0.75 m）——
     玩家站在椅子旁邊（坐下前走到的那一點 x 0.37）離「看」0.26～0.53 m、離椅子 0.55 m，按鈕永遠是「看炸物櫃／看菜單／看廚房」，不是「坐下吃」
     （BB 2026-11-12 FAIL：(0.92, 2.3) 那張旁邊的互動鍵是「看炸物櫃」）。點椅子走過去的有 tapPref 照椅子算；推搖桿走過去的沒有。
     改：這三個「看」讓 0.4 m（engine3d.js nearestInteractable 的 prio：比遠近時當成遠 0.4 m）——站在椅子旁邊是「坐下吃」，貼著炸物櫃、菜單那一點站才是「看」。點餐（order）、自助區、冷飲櫃不動。 */
  const GG2_PRIO={yangyang:{case:-0.4,menu:-0.4,kitchen:-0.4}};
  function gg2Items(E,k,L){ const KM=GG2_KIND[k]||{}, LB=GG2_LABEL[k]||{};
    for(const q of (L.interact||[]).concat(GG2_ADD[k]||[])){ const kind=Object.prototype.hasOwnProperty.call(KM,q.kind)?KM[q.kind]:q.kind; if(!kind||q.outside) continue; const mv=(GG2_MOVE[k]||{})[kind]||q;
      E.interactables.push(Object.assign({x:mv.x,z:mv.z,radius:0.9,label:LB[kind]||q.label,gg2:k,kind:kind},q.genre?{genre:q.genre}:{},(GG2_PRIO[k]||{})[kind]!=null?{prio:GG2_PRIO[k][kind]}:{})); } }   /* genre：轉角唱片翻的是哪一箱（corner_browse）*/
  const afar={ id:'afar', name:'afar café', indoor:true, camDist:3.8, build(E){ const L=GG_L.afar();
    const z=ggRoom(E,'afar',L,{label:L.exit.label,warm:true,floor:'#d6d4cf',glb:'bldg.afar_interior',attach:ggAAattach,study:true,shop:'afar',noSit:s=>s.seatH===0.45});   /* 卡座（西牆，table 4、5 的 seatH 0.45 兩張）：卡座前緣（x −4.6）到小圓桌（x −4.46）只有 0.14 m、南北兩頭是牆和隔牆，人走不到——這一版玩家不能坐（路人照坐），配置要 LAWWW2／AA 調 */ gg2Items(E,'afar',L); z.nav.blockRect(-2.8,2.15,0.4,0.5,0,0); z.nav._cm=null; return z; } };   /* ISLAND-SWEEP-1105（LAWWW2-C，LAWWW-C 06:26 要擋）：靠窗長凳西端、吧台南端、西牆層架中間的小縫（x −2.9～−2.7、z 2.0～2.3）站得住 9 點、四周都站不住，跑步一步 0.4 m 跳得進去——擋起來（AA 的配置不動）*/
  const daybreak={ id:'daybreak', name:'Daybreak', indoor:true, camDist:3.8, build(E){ const L=GG_L.daybreak();
    const DB_AP={'-1.5,3.45':[-1.55,2.95],'-4.2,0.3':[-3.8,-0.55],'-4.2,1.5':[-3.8,2.3],'2.05,-3.5':[1.3,-3.1]};   /* DAYBREAK-SEAT-AP-1105（LAWWW2-C；BB-C SEATSCAN ee7afe9c2：這 4 張 seatApproach 的 8 個候選點一個都站不住，點椅子會走到站不住的備用點，v9.10.20 線上就有）：
       指定走近點（ggRoom 的 ap；有 ap 的按鈕範圍 1.5 m）。窗邊二人桌二西側那張：兩張小桌中間的走道 (−1.55, 2.95)；長桌西側兩張（西牆到桌子 0.34 m，人站不進去）：從桌子南、北兩頭；卡座小桌二的卡座：兩張小桌中間 (1.3, −3.1)。
       點是 Node 在導航格上搜的：站得住（半徑 0.3）、從店門走得到、離座位最近（長桌那兩張：0.94、0.89 m；其他兩張：到座位之間沒有家具）*/
    const z=ggRoom(E,'daybreak',L,{label:L.exit.label,warm:true,floor:'#e3dfd6',glb:'bldg.daybreak_interior',attach:ggAAattach,study:true,shop:'daybreak',noSit:s=>(s.table===7&&s.seatH===0.45),ap:s=>DB_AP[s.x+','+s.z]||null});   /* 配置 v2 拿掉了長桌西側中間那張；小桌一的卡座照舊只給路人 */   /* 走不到的兩張（這一版玩家不能坐，路人照坐；配置要 LAWWW2／AA 調）：長桌西側中間 (−4.2, 0.9)——西牆到長桌只有 0.34 m，兩頭的位子從桌角按得到、中間那張按不到；卡座小桌一的卡座 (0.6, −3.5)——卡座前緣到小桌只有 0.085 m、西邊是吧台（卡座小桌二的卡座從兩張小桌中間按得到）*/ gg2Items(E,'daybreak',L); return z; } };
  /* 洋洋鹹酥雞（YANGYANG-IN-1107，公館 G05；AA_650、AA_724）：照 afar、Daybreak 的 ggRoom；BB 的配置 v3（{version, shop}，id 照舊 luwei）、模型 v1c（LAWWW2 驗收 ART_APPROVED）。
     座位 22 張（四人桌 4、兩人桌 3）：沒有寫 canStudy（這間不念書）。點炸物、看菜單、看炸物櫃、看自助區、看冷飲櫃、看廚房＝src/gg2shops3d.js（GG2.interact，台詞照 AA_724）。
     光照烘焙（lightmap）還沒做（LAWWW2 之後做，attachRoomGLB 照 GLB 的 userData.lightmap 自動接）；窗外的景還沒有（G05 這一棟的照片要 LAWWW2 拍）*/
  const yangyang={ id:'yangyang', name:'洋洋鹹酥雞', indoor:true, camDist:3.8, build(E){ const L=GG_L.yangyang();
    /* 四人桌四（廚房後面、後牆前，table 4）南側那兩張（z −4.9）：椅子夾在桌子（z −4.68）和後牆中間，人站不進去（後牆往裡 0.4 m 都站不住）——這一版玩家不能坐（路人照坐），
       要坐得到要 BB 把四人桌四往北挪約 0.35 m（配置、模型一起改）。同一桌北側兩張照常坐 */
    const z=ggRoom(E,'yangyang',L,{label:L.exit.label,warm:true,floor:'#d6d6d2',wallColor:'#e8d6a8',glb:'bldg.yangyang_interior',attach:ggAAattach,shop:'yangyang',noSit:s=>s.table===4&&s.z<-4.5}); gg2Items(E,'yangyang',L);
    z.nav.blockRect(-3.8,-4.72,0.5,0.3,0,0); z.nav._cm=null;   /* 四人桌四西邊、西牆和後牆的角落（x −3.85～−3.6、z −4.75）站得住 2 點、四周都站不住（0.1 m 取樣，和 afar 的 ISLAND-SWEEP-1105 一樣）：擋起來 */
    return z; } };
  /* 轉角唱片（CORNER-IN-1107，公館 G12；AA_650、AA_725）：照洋洋、afar 的 ggRoom；CC 的配置 v1（{version, corner}，原檔沒改）、模型 v1c（LAWWW2-B 38f4021e1：牆邊家具上的音響、唱盤跟著那面牆淡出；MODEL_READY）。
     · 座位 4 張：試聽的高腳椅 2（座面 0.74＝lift；桌號 'listen'：約來兩個人先坐這裡、「一起聽」那一則開場句只在這裡）、休息區單人沙發 2（'lounge'）。
       高腳椅的字「坐下」（配置草稿寫「坐下來試聽」；坐下是 AA_725 第 6 節的坐下句，試聽是「試聽」那個按鈕）。單人沙發和別的店的椅子一樣不擋路（ggRoom 的慣例；擋了休息區兩張沙發中間會變成走不出去的孤島，CC 的導航也是這樣量的）。
     · 翻唱片（7 箱，genre）、試聽、看音響、問店員／結帳＝src/gg2shops3d.js（GG2.interact，台詞照 AA_725）。光照烘焙還沒做（LAWWW2）；窗外的景：模型沒有窗景卡、G12 的照片還沒拍（LAWWW2）*/
  const CR_TABLE={stool:'listen',armchair:'lounge'};
  const corner_records={ id:'corner_records', name:'轉角唱片', indoor:true, camDist:3.8, build(E){ const L0=GG_L.corner_records();
    const L=Object.assign({},L0,{seats:L0.seats.map(s=>Object.assign({},s,{table:CR_TABLE[s.kind]||null,seatH:s.h,label:s.kind==='stool'?'坐下':s.label}))});
    const z=ggRoom(E,'corner_records',L,{label:'離開轉角唱片',warm:true,floor:'#cdc8c0',glb:'bldg.corner_interior',attach:ggAAattach,shop:'corner_records'});
    gg2Items(E,'corner_records',L); return z; } };
  // ---------- 便利商店 ----------
  const cvs={ id:'cvs', name:'日和便利店', indoor:true, camDist:4.0, build(E){ if(GG_L.cvs()) return buildCvs2(E); const fromWZ=typeof GAME!=='undefined'&&GAME.G&&GAME.G.flags&&GAME.G.flags.CVS_FROM==='wenzhou';   /* AA_413：從溫州街進去（日日便利 A5）窗外是溫州街（對面阿忠水果、半熟；tools/shots/shop_views_layers.py 的 cvs_wz，景深 10.6 m、一層），不是公館 */
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
  const CVS_BOUNCE={cvs_wall:[0.45,0.55],cvs_floor:[0.4,0.5],cvs_shelf:[0.4,0.5],cvs_counter:[0.4,0.5],cvs_countertop:[0.3,0.4],cvs_wood:[0.3,0.4],cvs_print:[0.25,0.35]};   /* cvs_wood、cvs_print：日和便利店 v2（BB 的 bb_support/cvs_interior.glb，GG-SHOPS-REDO-1104）的淺色橡木、印刷圖集；v2 的燈都是 GLOW_cvs_led／GLOW_cvs_cooler／GLOW_cvs_screen（模型自己帶發光強度 KHR_materials_emissive_strength），不用另外設 */   /* TK.bounce 的自發光是白色（乘貼圖）：只給白色或有貼圖的材質；有顏色的純色材質不加（會變白） */
  function attachCvsInterior(z,g0,root){
    root.traverse(o=>{ if(!o.isMesh) return; const mt=o.material, nm=mt&&mt.name;
      if(/SIGN_FACE_aisle/.test(o.name)){ const t=cafeCanvas(512,128,(x,w,h)=>{ x.fillStyle='#ffffff'; x.fillRect(0,0,w,h); x.fillStyle='#e8a33a'; x.fillRect(0,h*0.84,w,h*0.16); x.fillStyle='#1f6f78'; x.textAlign='center'; x.textBaseline='middle'; x.font='bold 60px '+WZ_SANS; x.fillText((o.userData||{}).sign||'',w/2,h*0.44); }); cafeFacePaint(o,t,null); o.material.emissiveIntensity=0.35; return; }
      if(/SIGN_FACE_promo/.test(o.name)){ const t=cafeCanvas(1152,128,(x,w,h)=>{ x.fillStyle='#e8a33a'; x.fillRect(0,0,w,h); x.fillStyle='#1f6f78'; x.fillRect(0,0,w,h*0.12); x.fillStyle='#ffffff'; x.textAlign='center'; x.textBaseline='middle'; x.font='bold 64px '+WZ_SANS; x.fillText((o.userData||{}).sign||'',w/2,h*0.58); }); cafeFacePaint(o,t,null); o.material.emissive=new THREE.Color(0xffffff); o.material.emissiveMap=t; o.material.emissiveIntensity=0.3; return; }   /* 後牆的促銷看板（琥珀底白字） */
      if(!mt||mt.userData.cvsReg) return; mt.userData.cvsReg=true;
      if(nm==='cvs_led'){ mt.emissive=new THREE.Color(0xffffff); mt.emissiveIntensity=1.5; }
      if(/^GLOW_cvs_/.test(nm||'')&&mt.emissive&&mt.emissive.getHex()===0){ mt.emissive=new THREE.Color(0xffffff); mt.emissiveIntensity=1.2; }   /* v2 的發光材質：模型沒帶發光色時（舊版 GLTFLoader 不認 emissive_strength）補一個 */
      if(nm==='cvs_cooler_light'){ mt.emissive=new THREE.Color(0xe9f4ff); mt.emissiveIntensity=1.1; }
      const b=CVS_BOUNCE[nm]; if(b&&!mt.lightMap) TK.bounce(mt,b[0],b[1]);   /* 有光照貼圖（tools/blender/env_second/lightbake/bake_cvs.sh；attachRoomGLB 先接好）的材質不加補光：燈的光、貨架和櫃檯的影子都在貼圖裡，再加一層均勻的自發光會把影子洗掉（和宿舍四人房 DORM_BOUNCE 一樣）。測試：node tests/cvs_interior_lm_unit.js */
      if(nm==='cvs_goods'||nm==='cvs_poster'){ /* 商品與海報的顏色在頂點色：自發光也照頂點色加一點（店裡很亮，只靠燈光會偏暗） */ mt.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n totalEmissiveRadiance += vColor.rgb * 0.32;\n#endif'); }; mt.customProgramCacheKey=()=>'cvsVcGlow'; mt.needsUpdate=true; } });
    if(!z.gg&&z.wins&&z.wins[0]){ const v=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.7),z.wins[0].material); v.position.set(0,1.25,4.5+0.35); v.rotation.y=Math.PI; g0.add(v); (z.winParts=z.winParts||[]).push({obj:v,at:new THREE.Vector3(0,1.25,4.5),dir:new THREE.Vector3(0,0,-1)}); }
    return root; }
  // ---------- 麵店 ----------
  const noodle={ id:'noodle', name:'公館燒臘', indoor:true, camDist:4.0, build(E){ if(typeof SHAOLA_LAYOUT!=='undefined'&&SHAOLA_LAYOUT.shop) return buildShaola(E);   /* SHAOLA-WIRE-1105：BB 的燒臘店室內（下面 buildShaola）；配置沒載入＝照舊的麵店 */ const z=room(E,{view:'noodle',viewDepth:24,w:10,d:9,h:3.2,warm:true,wallColor:'#f1e7d6',floorTex:W3.stoneTex('#d9cbb0'),spawn:{x:0,z:3.5,yaw:Math.PI},winWall:'front',winXs:[-3,3]});   /* 窗在店面那一面（後牆是廚房和價目表）*/ const g0=z.group, nav=z.nav;
    // 程序化的畫面全部放在 g（備用模型）：Blender 正式模型（ASSETS 'bldg.noodle_interior'，第二個 AI）載入後整組藏起來；導航、座位、互動點、出口都不受影響
    const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
    const kitchen=new THREE.Mesh(new THREE.BoxGeometry(6,1.0,1.2),M('#8f9399',{rough:0.4})); kitchen.position.set(-1,0.5,-3.8); g.add(kitchen); nav.blockRect(-1,-3.8,6,1.2,0,0.15); const pot=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.5,14),M('#3a3f46',{rough:0.4})); pot.position.set(-2,1.25,-3.8); g.add(pot); z.seats=[]; for(let i=0;i<3;i++){ const x=-3+i*3; desk(g,nav,x,0.5,0,1.4,0.9,'#d9cbb0'); for(const s of [-1,1]){ chair(g,x,0.5+s*0.8,s>0?Math.PI:0,'#c9463d'); z.seats.push({x,z:0.5+s*0.8,yaw:s>0?Math.PI:0}); } E.interactables.push({x,z:1.3,radius:1.1,label:'坐下吃飯',seat:{x,z:1.3,yaw:Math.PI},pairSeat:{x,z:-0.3,yaw:0},eat:'noodle'}); }
    for(let i=0;i<3;i++){ const x=-3+i*3; PROP(g,'prop.bowl',x-0.2,0.77,0.5+0.25); PROP(g,'prop.chopstick',x+0.15,0.78,0.45,0.3); if(i===1) PROP(g,'prop.bowl',x+0.25,0.77,0.5-0.25,2.4); } PROP(g,'prop.bowl',-1.5,1.02,-3.8); PROP(g,'prop.bowl',-0.9,1.02,-3.7,1.2);
    { const bt=typeof SHAOLA!=='undefined'&&SHAOLA.boardText?SHAOLA.boardText():''; if(bt){ const mp=W3.signPlane(bt,6,0.6,{color:'#3b2a1e',size:36}); mp.position.set(0,2.4,-4.35); g.add(mp); } }   /* 價目板從資料排（src/data/yejian_shaola_buy.js，AA_853；GG-SHAOLA-FIX-1112）：原本寫死「叉燒飯 100 ・ 燒鴨飯 110 ・ 三寶飯 130 ・ 滷蛋 15」和稿的價錢不一樣。這是配置沒載入時的備用房間，平常看到的是 shaola_interior.glb 貼圖上的菜單（LAWWW2）*/ E.interactables.push({x:0,z:4.2,radius:1.5,label:'離開公館燒臘',exit:{to:'gongguan',spawn:{x:-63,z:18,yaw:Math.PI}}});
    P3.mergeStatic(g);   /* 備用模型自己合併（外層合併會跳過它，正式模型載入後要能整組藏起來）*/
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.noodle_interior']) ASSETS.loadOne('bldg.noodle_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); attachRoomGLB(z,g0,g,root); attachNoodleInterior(z,g0,root); }).catch(e=>console.warn('麵店室內正式模型載入失敗，用程序化備用模型',e));
    return z; } };
  /* ---------- 公館燒臘 v7（SHAOLA-WIRE-1105，LAWWW2-C 11-05；使用者 06:4x「公館燒臘線上版本怎麼還是麵店」）----------
     BB〔帳號 A〕的 shaola_interior.glb v7（企劃線 65c2a43c5，LAWWW2 驗 MODEL_READY）＋配置 src/data/shaola_layout.js v1（BB 原檔，沒改）：6 × 13 × 3.2 m 窄長老店，
     左邊一排五張不鏽鋼方桌（x −2.1）、中間走道（x −1.3～0.9）、右邊整排櫃台（燒臘櫃、砧板檯、盛飯台）、最裡面廚房門。區域 id 照舊 noodle。
     · 進門：公館店門的落點照舊 (0, 3.4)（走道上；劇情 OUT.plan、快速前往都用這一點）；z.spawn (0, 4.5)；出口在門內 (0, 5.9)、半徑 0.9（和公館 AA 的店一樣）、回公館照舊 (−63, 18)。
     · 「坐下吃飯」（eat:'noodle'＝story3d.js noodleScene）：每一張桌子一個，坐面向店裡那一張（桌子南邊），對面那一張是 pairSeat（阿哲的位子是第 3 桌北邊，配置 spots.zhe_seat）。
     · z.spots：zhe_seat（阿哲）、clerk（老闆，砧板檯後面）、ndlSeats（週二週四的固定客人，第 4、5 桌）、door（從門口走進來、走出去的點）——story3d.js、hcircle3d.js 讀這一份。
     · 導航：配置的 blocks（桌子、櫃台、層架、冰箱）＋SHAOLA_EXTRA（GLB 根節點 extras.extraBlocks，BB 寫的：工作檯、圓凳、椅疊、紙箱、水桶；tests/shaola_wire_unit.js 對照 GLB）。導航格 0.2 m。
     · 燈：GLOW_ 光暈（日光燈、燒臘櫃燈泡、電視）合成一個網格，白天晚上都亮（店裡開燈）。 */
  const SHAOLA_EXTRA=[[-1.625,-6.21,2.55,0.58],[-2.74,4.0,0.36,0.36],[-2.74,2.2,0.36,0.36],[-2.74,0.4,0.36,0.36],[-2.74,-1.4,0.36,0.36],[-2.74,-3.2,0.36,0.36],[-1.5,4.0,0.36,0.36],[-1.5,2.2,0.36,0.36],[-1.5,0.4,0.36,0.36],[-1.5,-1.4,0.36,0.36],[-1.5,-3.2,0.36,0.36],
    [-1.82,5.78,0.46,0.46],[-2.62,5.9,0.46,0.46],[-2.47,-5.65,0.96,0.44],[2.63,5.47,0.7,1.8],[2.6,3.9,0.46,0.46]];
  function shaolaSpots(L){ const S=L.spots||{}, sv=s=>s?{x:s.x,z:s.z,yaw:s.yaw}:null, t4=L.seats.find(q=>q.table===4&&q.yaw===0);
    return {zhe_seat:sv(S.zhe_seat),clerk:L.clerk?{x:L.clerk.x,z:L.clerk.z,yaw:L.clerk.yaw}:null,ndlSeats:[S.regular_1,S.regular_2,S.regular_3,t4].filter(Boolean).map(s=>[s.x,s.z,s.yaw]),door:[L.exit.at.x,+(L.d/2-0.9).toFixed(2)]}; }
  function buildShaola(E){ const L=SHAOLA_LAYOUT.shop, P=Math.PI;
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest&&!ASSETS.manifest['bldg.shaola_interior']) ASSETS.manifest['bldg.shaola_interior']={url:L.glb,type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/bb_support/shaola_interior.py（公館燒臘室內 v7，BB〔帳號 A〕製作、LAWWW2 驗收 MODEL_READY；claude/story-planning 65c2a43c5，配置 src/data/shaola_layout.js v1）',license:'本作；貼圖本作程式產生（shaola_tex.py）'};
    const z=room(E,{w:L.w,d:L.d,h:L.h,cell:0.2,warm:true,wallColor:'#d8c69e',floorTex:W3.stoneTex('#e2d8c4'),spawn:{x:0,z:+(L.d/2-2).toFixed(2),yaw:P},windows:false});
    const g0=z.group, nav=z.nav; z.shaola=true; z.spots=shaolaSpots(L);
    const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const c of g0.children.slice()){ if(c.isLight) continue; g0.remove(c); fb.add(c); } g0.add(fb);   /* 正式模型來了整組藏起來 */
    const fbM=M('#b8bcbe',{rough:0.5}); for(const b of L.blocks.concat(SHAOLA_EXTRA)){ nav.blockRect(b[0],b[1],b[2],b[3],0,0.05); const m=new THREE.Mesh(new THREE.BoxGeometry(b[2],0.85,b[3]),fbM); m.position.set(b[0],0.425,b[1]); fb.add(m); }   /* 備用的家具色塊 */
    nav.blockRect(2.3,-4.83,0.8,0.66,0,0);   /* 櫃台南端、冰箱、層架圍起來的一小塊（x 1.9～2.7、z −5.15～−4.5）：站得住 6 點、四周都站不住，跑步一步 0.4 m 跳得進去（v9.3 #31）——擋起來；櫃台後面是老闆站的地方，本來就走不進去 */
    z.seats=L.seats.map(s=>({x:s.x,z:s.z,yaw:s.yaw,table:s.table,kind:'shop'}));
    for(const t of L.tables){ const s=L.seats.find(q=>q.table===t.n&&q.z>t.z), p=L.seats.find(q=>q.table===t.n&&q.z<t.z); if(!s||!p) continue;
      E.interactables.push({x:s.x,z:s.z,radius:1.0,label:s.label||'坐下吃飯',seat:{x:s.x,z:s.z,yaw:s.yaw},pairSeat:{x:p.x,z:p.z,yaw:p.yaw},eat:'noodle'}); }   /* 面向店裡那一張（背對店門）；noodleScene 走到 (x, z+0.5)＝椅子後面 */
    if(typeof SHAOLA!=='undefined'&&SHAOLA.on&&SHAOLA.on()) for(const q of (L.interact||[])) if(SHAOLA.LOOK[q.kind]) E.interactables.push({x:q.x,z:q.z,radius:0.9,label:q.label,shaola:q.kind});   /* 「看菜單」「看櫥窗」（GG-SHAOLA-FIX-1112；字＝AA_853 的 menu_look、window_look，src/shaola_order3d.js）：位置、按鈕的字照配置 interact。配置的「點餐」不放——點餐掛在每一桌的「坐下吃飯」*/
    E.interactables.push({x:L.exit.at.x,z:+(L.d/2-0.6).toFixed(2),radius:0.9,label:L.exit.label,exit:{to:'gongguan',spawn:{x:-63,z:18,yaw:P}}});
    nav._cm=null; P3.mergeStatic(fb);
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.shaola_interior']) ASSETS.loadOne('bldg.shaola_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); attachRoomGLB(z,g0,fb,root); shopViewPane(z,g0,{kind:'noodle',x:0,y:2.1,z:+(L.d/2+0.8).toFixed(2),w:7.0,h:4.4,ry:Math.PI,depth:24});   /* 燒臘的正面玻璃（x −3～3、y 0.14～2.56、z 6.47～7.19）外面 0.1 m 一片視差窗：照片是舊麵店同一個店面（公館 G00）在遊戲裡拍的 noodle_{day,night}（地平線 2.1 m＝舊麵店的窗中心）；WINVIEW-AUDIT-1105 */
      const gl=[]; root.traverseVisible(o=>{ if(o.userData&&o.userData.glow) gl.push(o); }); if(gl.length){ const mesh=wzGlowBatch(E,g0,root,gl,'shaola_glows',2.5); mesh.material.emissiveIntensity=1; z.shaolaGlows=gl.length; } }).catch(e=>console.warn('公館燒臘室內正式模型載入失敗，用備用模型',e));
    return z; }
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
  const bookstore={ id:'bookstore', name:'頁間書屋', indoor:true, camDist:4.0, build(E){ if(GG_L.bookstore()) return buildYejian(E); const z=room(E,{view:'bookstore',viewDepth:17,w:12,d:10,h:3.4,wallColor:'#efe6d6',floorTex:W3.canvasTex('woodfloor_lt',256,256,(x,w,h)=>{ x.fillStyle='#cbb390'; x.fillRect(0,0,w,h); x.strokeStyle='rgba(90,60,30,0.22)'; x.lineWidth=2; for(let j=0;j<h;j+=32){ x.beginPath(); x.moveTo(0,j); x.lineTo(w,j); x.stroke(); } }),spawn:{x:0,z:4,yaw:Math.PI},winWall:'front',winXs:[-3.5,3.5]}); /* 窗在店面那一面（後牆是書架）*/ const g0=z.group, nav=z.nav;
    // 程序化的畫面全部放在 g（備用模型）：Blender 正式模型（ASSETS 'bldg.bookstore_interior'，第二個 AI）載入後整組藏起來；導航、互動點、出口都不受影響
    const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
    shelfWall(g,nav,0,-4.7,0,11); shelfWall(g,nav,-5.7,0,Math.PI/2,8); shelfWall(g,nav,5.7,0,Math.PI/2,8); shelfWall(g,nav,-2,0,Math.PI/2,5); shelfWall(g,nav,2,0,Math.PI/2,5); const table=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.8,1.2),M('#8b5e3c')); table.position.set(0,0.4,3); g.add(table); nav.blockRect(0,3,2.4,1.2,0,0.1); E.interactables.push({x:1.8,z:3.2,radius:0.9,label:'看看法律書與文具',shop:'book'})   /* 櫃台桌的東端、收銀機那一頭（BOOKSTORE-EXIT-SHOP-1028，LAWWW2-C）：原本 (0,4.05) 半徑 1.1 就在門口——桌子前緣到門口站得到的地方只有 0.37 m，進門落腳點 (0,4) 也在範圍裡，門口按下去是買書選單。店員站桌子北側 (0.55,1.95) 面向門口，所以不移到桌子後面 */;   /* v9.3 第二十五批：原本在桌子和書架之間 (0,2)，那裡比人還窄、走不進去（tests/reachability_all.py 抓到），買不到教科書；改成桌子靠門口那一側（像櫃台）*/ E.interactables.push({x:0,z:4.6,radius:1.5,label:'離開書店',exit:{to:'gongguan',spawn:{x:-38.8,z:20.2,yaw:Math.PI}}});   /* 出來站在店門（−36.4，在店面最左邊）旁邊的騎樓、門口互動範圍外（原本 (−42,18)：門在店面中間 −41.6 時的人行道）*/
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
      const b=BK_BOUNCE[nm]; if(b&&!mt.lightMap) TK.bounce(mt,b[0],b[1]);   /* 有光照貼圖（tools/blender/env_second/lightbake/bake_bookstore.sh；attachRoomGLB 先接好）的材質不加補光：吊燈的光、書架和櫃台桌的影子都在貼圖裡（和便利商店 CVS_BOUNCE 一樣）。測試：node tests/bookstore_interior_lm_unit.js */
      if(nm==='bk_books'||nm==='bk_poster'){ mt.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )\n totalEmissiveRadiance += vColor.rgb * 0.28;\n#endif'); }; mt.customProgramCacheKey=()=>'bkVcGlow'; mt.needsUpdate=true; } });
    if(z.wins&&z.wins[0]){ const v=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.7),z.wins[0].material); v.position.set(0,1.25,5+0.35); v.rotation.y=Math.PI; g0.add(v); (z.winParts=z.winParts||[]).push({obj:v,at:new THREE.Vector3(0,1.25,5),dir:new THREE.Vector3(0,0,-1)}); }
    return root; }
  // ---------- 宿舍房間 ----------
  /* 宿舍房間＝台大四人房（DORM-LOFT-L；LAWWW2-B a09ebf4d，使用者 2026-10-17 01:0x 照片、01:3x「宿舍ok」）：上舖床、下面書桌四組（左右各兩組）、進門右邊洗手間、窗在後牆中間。
     配置全部讀 DORM_ROOM（src/data/dorm_room_layout.js，和 dorm_room4.glb 同一份）；玩家是 L2（左邊靠門那組）。203（法律系）＝祐廷、阿凱 R2、柏翰 R1、阿哲 L1；412（舊序章）＝祐廷、舊序章的人 R2、舊序章的人 R1、舊序章的人 L1（AA_208）。
     年份切換 z.dormSet(key)：'203'、'203_movein'（8/29 阿哲還沒到）、'412'、'412_first_night'（舊序章的人 9/2 才搬進來）。窗景：法律系 203＝dorm_room、舊序章 412＝dorm_room412（四樓、往東偏，ART-V0-DORM）。備用模型（GLB 載入失敗）是簡單的床桌方塊（D38 ③）。*/
  /* 大二～大四（LAWWW2-C 2026-10-17，AA_208 第 7、8 節；dorm_room4.glb 的 Y312_／Y507_／Y409_ 各組）：312＝祐廷、阿哲、柏翰、大一學弟；507＝祐廷、柏翰、大二學弟、別系的同屆；409＝祐廷、柏翰、大二學弟、大一學弟。
     舊的四組也要藏這三年的東西（GLB 和這段要一起換）*/
  const DORM_SETS={ '203':{hide:/^(Y412_|Y312_|Y507_|Y409_|NAMETAG_)/}, '203_movein':{hide:/^(Y412_|Y312_|Y507_|Y409_|NAMETAG_|Y203_ZHE$|BEDDING_L1$)/}, 
    '312':{hide:/^(Y203_|Y412_|Y507_|Y409_|ROOMMATE_KAI$|NAMETAG_)/}, '507':{hide:/^(Y203_|Y412_|Y312_|Y409_|ROOMMATE_KAI$|NAMETAG_)/}, '409':{hide:/^(Y203_|Y412_|Y312_|Y507_|ROOMMATE_KAI$|NAMETAG_)/} };
  function dormSetKey(G){ const F=(G&&G.flags)||{}; if(F.ROOM_Y4||F.ROOM_Y4_MOVING) return '409'; if(F.ROOM_Y3||F.ROOM_Y3_MOVING) return '507'; if(F.ROOM_Y2||F.ROOM_Y2_MOVING) return '312';   /* ROOM_Y2_MOVING：搬進 312 那一刻（拆箱前，story3d.js roomY2InDorm、home3d.js roomY2FromHome）*/ return (F.LAW_MOVEIN_DAY!=null&&G.day===F.LAW_MOVEIN_DAY&&!F.KAI_MOVEIN)?'203_movein':'203'; }
  /* 每年的窗景（AA_208 第 7、8 節；LAWWW2-C 4fa4a1e2，tools/shots/window_views.py）：舊序章 412、大一 203（朝舟山路）；大二 312（三樓）、大三 507（五樓）、大四 409（四樓）都朝宿舍背面的樟樹。
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
    for(const u of R.units){ const b=u.block, top=u.bed_top_y||1.76; box(b.x[0],b.x[1],b.z[0],b.z[1],top-0.2,top+0.26,true); }   /* 床板底～床欄頂（DORM-LOFT-SCALE-1102：床桌組加高以後照配置的床面高度算；以前寫死 1.56～2.02）*/
    return all; }
  function dormView(G){ const F=(G&&G.flags)||{}; return (F.ROOM_Y4||F.ROOM_Y4_MOVING)?'dorm_room409':(F.ROOM_Y3||F.ROOM_Y3_MOVING)?'dorm_room507':(F.ROOM_Y2||F.ROOM_Y2_MOVING)?'dorm_room312':'dorm_room'; }   /* AA_208：312 三樓、507 五樓、409 四樓，都朝宿舍的背面（203 朝舟山路）——LAWWW2-C 2026-10-17 */
  const dorm={ id:'dorm', name:'宿舍 房間', indoor:true, camDist:3.6, seeThru:true, build(E){ const G0=typeof GAME!=='undefined'?GAME.G:null; const R=DORM_ROOM, RM=R.room, WN=R.window, U={}; for(const u of R.units) U[u.id]=u; const me=U[R.player_unit||'L2'];
    const z=room(E,{w:RM.w,d:RM.d,h:RM.h,cell:0.2,view:dormView(G0),viewDepth:25,wallColor:'#f1ebe0',floorTex:W3.stoneTex('#e3d9c6'),spawn:{x:RM.spawn[0],z:RM.spawn[1],yaw:Math.PI},winXs:WN.winXs,winY:WN.view_center[1],curtains:'#c9b48a'}); const g0=z.group, nav=z.nav;
    z.seeThru=true;   /* 上舖床板、被子擋住鏡頭時網點透空：engine3d.js 的 updateSeeThrough 看的是區域實體（E.zone.seeThru），只寫在上面的定義裡，室內透空從來沒開過 */
    { const ax=Math.min(...R.units.map(u=>Math.min(Math.abs(u.block.x[0]),Math.abs(u.block.x[1]))))-0.1; z.camBox={x:[-ax,ax]}; }   /* 運鏡只在中間走道（DORM-LOFT-SCALE-1102：房間 6→4.2 m 寬，照床桌組阻擋的內緣算；以前寫死 ±1.6）*/   /* 運鏡只在中間走道：兩側是上舖床（床板 1.6～1.76 m，x ±1.9 以外），鏡頭推到那裡會卡進床板、只拍到床底（BB_218：412 第一晚和舊序章的人的對話只看到「天花板」）*/
    { const camAll=dormCamCols(R,RM.h,g0), L0=camAll.slice(); z.camCols=[L0];   /* 鏡頭碰撞（BUG-CAM-203-R2-1021）：站在哪一組上鋪底下，那一組就不算 */
      const up0=z.update; z.update=function(dt,E2){ if(up0) up0.call(z,dt,E2); const P=E2&&E2.player; if(!P) return; const p=P.obj.position; L0.length=0; for(const m of camAll){ const u=m.userData.under; if(u&&p.x>u.x0&&p.x<u.x1&&p.z>u.z0&&p.z<u.z1) continue; L0.push(m); } }; }
    // 程序化的畫面全部放在 g（備用模型）：正式模型（ASSETS 'bldg.dorm_room4'）載入後整組藏起來；導航、睡覺、書桌座位、離開都不受影響。月曆、社團傳單、z.deskItems 掛在 g0
    const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
    for(const b of R.blocks) nav.blockRect((b.x[0]+b.x[1])/2,(b.z[0]+b.z[1])/2,b.x[1]-b.x[0],b.z[1]-b.z[0],0,0);   /* 四組床桌、鞋櫃、垃圾桶、曬衣架、洗手間 */
    const y2Room=['312','507','409'].includes(dormSetKey(G0));   /* 1A-03：大三 507 照舊擺大二拆出來的東西（同一組家具）＋大三拆出來的（dorm_y3_items.glb）；1A-09、1A-11：大四 409 再加大四的 */ if(y2Room) nav.blockRect((Y2_BOX[0]+Y2_BOX[1])/2,(Y2_BOX[2]+Y2_BOX[3])/2,Y2_BOX[1]-Y2_BOX[0],Y2_BOX[3]-Y2_BOX[2],0,0);   /* 大二 312：書桌旁走道邊的紙箱（拆箱前封好、拆完壓平，dorm_y2_items.glb 的 nav_block）*/
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
      const fly=W3.canvasTex('dormFlyer',128,180,(x,w,h)=>{ x.fillStyle='#f4ead8'; x.fillRect(0,0,w,h); x.fillStyle='#2f5d50'; x.fillRect(0,0,w,46); x.fillStyle='#f4ead8'; x.font='bold 18px "Noto Sans TC",sans-serif'; x.fillText('法律服務社',18,29); x.fillStyle='#2f5d50'; x.font='bold 15px "Noto Sans TC",sans-serif'; x.fillText('招 新 中',36,74); x.fillStyle='#555'; x.font='11px "Noto Sans TC",sans-serif'; ['一年級也可以','週三晚上 社課','法律系館B 社辦'].forEach((t,i)=>x.fillText(t,22,104+i*20)); x.fillStyle='#c9a24a'; x.fillRect(16,164,96,4); });
      const fs=me.wall_spot_by_desk, fm=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.6),new THREE.MeshStandardMaterial({map:fly,roughness:0.9})); fm.position.set(fs.x+(y2Room?0.02:0),fs.y,fs.z); fm.rotation.y=fs.ry; fm.name='dorm_flyer';   /* 大二有軟木板：傳單釘在板上（往房間多 2 cm，不和板子疊在同一面，LAWWW2-C 899f9bcd）*/ g0.add(fm); dormWallItems(z,g0); }   /* 社團傳單貼在書桌前的牆上（AA_208 第 6 節）*/
    const st=me.seat; E.interactables.push({x:st.x,z:st.z,radius:1.0,label:'坐在書桌前',seat:{x:st.x,z:st.z,yaw:st.yaw,ap:me.seat_approach},deskStudy:true}); E.interactables.push({x:me.sleep[0],z:me.sleep[1],radius:0.9,label:'睡覺',sleep:true});   /* 梯子前：選了睡覺／小睡就從這裡爬上床、躺下、熄燈（story3d.js 的 goToBed，DORM-SLEEP-1030；位置、踏點、鏡頭讀 DORM_ROOM 的 sleep_scene）*/
    /* 宿舍走廊（D44）：房門出去是二樓走廊、自己的房門前（src/dorm3d.js）；沒有載入 dorm3d 時照舊直接回校園 */ if(typeof DM3!=='undefined') E.interactables.push({x:RM.exit[0],z:RM.exit[1],radius:1.4,label:'走出房間',exit:{to:'dorm_hall',spawn:Object.assign({},DM3.homeOf?DM3.homeOf(typeof GAME!=='undefined'&&GAME.G).spawn:DORM_LAYOUT.home.spawn)}}); else E.interactables.push({x:RM.exit[0],z:RM.exit[1],radius:1.4,label:'離開宿舍',exit:{to:'campus',spawn:{x:20,z:54,yaw:Math.PI}}});
    E.interactables.push({x:z.spots.roomItems[0],z:z.spots.roomItems[1],radius:0.6,label:'看看房間裡的東西',roomItems:true});   /* 交接包 v1 第 1 節「房間物件」（玩家書桌前；story3d.js 的 roomItems）*/
    P3.mergeStatic(g);
    z.dormSetKey=dormSetKey(G0); z.dormRoot=null; z.dormSet=key=>{ z.dormSetKey=key; const S=DORM_SETS[key]||DORM_SETS['203']; if(z.dormRoot) z.dormRoot.traverse(o=>{ if(/^(Y203_|Y412_|Y312_|Y507_|Y409_|NAMETAG_|ROOMMATE_KAI|BEDDING_)/.test(o.name)&&!/_(duvet|pillow|card|black|bulb|items|screen|metal)$/.test(o.name)) o.visible=!S.hide.test(o.name); }); };
    if(y2Room) roomItemState(z,G0);   /* 拆箱事件一進房間就呼叫 z.setY2Items：模型還沒載完也先記住 */
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.dorm_room4']) ASSETS.loadOne('bldg.dorm_room4').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); attachRoomGLB(z,g0,g,root); attachDormInterior(z,g0,root); z.dormRoot=root; z.dormSet(z.dormSetKey); if(z.dormSetKey==='203') loadY1Items(z,g0,E); if(y2Room) loadY2Items(z,g0,E); loadWzItems(z,g0,E); loadDeskItems(z,g0,E); }).catch(e=>console.warn('宿舍室內正式模型載入失敗，用程序化備用模型',e));
    /* ART-04 黃金葛（方奕廷送的，POTHOS）：法律系 203 祐廷書桌上（GLB 根節點 place：L2 書桌 +z 端前緣）；四種大小照澆水次數（S.pothosSize）。只在拿到以後載入 */
    z.pothosState=null; z.setPothos=(on,n)=>{ const k=on?'S'+pothosSize(n):null; if(z.pothosState===k) return; z.pothosState=k; if(!on){ const o=g0.getObjectByName('dorm_pothos'); if(o) o.visible=false; return; }
      const show=pg=>{ pg.visible=true; pg.traverse(o=>{ if(/^POTHOS_S\d$/.test(o.name)) o.visible=o.name==='POTHOS_'+k; }); };
      let pg=g0.getObjectByName('dorm_pothos'); if(pg){ show(pg); return; }
      if(typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.pothos']) return;
      pg=new THREE.Group(); pg.name='dorm_pothos'; pg.userData.dyn=true; g0.add(pg);
      ASSETS.loadOne('bldg.pothos').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); let P=null; root.traverse(o=>{ if(!P&&o.userData&&o.userData.place) P=o.userData.place; });
        P=P||{x:-2.39,y:0.76,z:0.145,ry:Math.PI/2}; root.position.set(P.x,P.y,P.z); root.rotation.set(0,P.ry||0,0);
        root.traverse(m=>{ if(m.isMesh){ m.castShadow=true; m.receiveShadow=true; if(m.material) TK.bounce(m.material,0.3,0.4); } }); pg.add(root); show(pg); }).catch(e=>console.warn('黃金葛載入失敗',e)); };
    return z; } };
  /* 黃金葛的大小（ART-04；json 寫「LAWWW 定規則」）：每週最多澆一次（story3d.js pothosScene），沒澆不長大。0～5 次＝S1 剛送來、6～19＝S2、20～39＝S3（一年多）、40 以上＝S4 */
  function pothosSize(n){ n=n|0; return n>=40?4:n>=20?3:n>=6?2:1; }
  /* 宿舍房間的正式模型（第二個 AI：tools/blender/env_second/dorm_interior.py）：日光燈管、檯燈燈泡、筆電與螢幕一直亮；
     牆、地板、木家具有燈光感（TK.bounce）；書、雜物的顏色在頂點色（自發光也照頂點色加一點） */
  const DORM_BOUNCE={dorm_wall:[0.4,0.5],dorm_floor:[0.32,0.42],dorm_wood:[0.3,0.4],dorm_wood_dark:[0.25,0.35],dorm_door:[0.25,0.35],dorm_sheet:[0.3,0.4],dorm_duvet:[0.25,0.35],dorm_pillow:[0.3,0.4],dorm_curtain:[0.3,0.4],dorm_ac:[0.3,0.4],dorm_bath_tile:[0.4,0.5],dorm_bath_floor:[0.32,0.42]};   /* 洗手間的牆磚、地磚原本沒有補光：剖面視角看進洗手間是一整片暗灰色（舊序章 412 每天早上第一個畫面右邊四成；LAWWW2 2026-10-21），和房間的牆、地板同一級 */
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
  const Y2_BOX=[-0.90,-0.22,-0.705,-0.185];   /* DORM-LOFT-SCALE-1102：房間變窄、床桌組往門口挪（dorm_y2_items.py 的 NAV；以前 [-1.80,-1.12,-0.88,-0.36]）*/
  const Y2_NODE=id=>(id==='y1_3'||id==='y1_4')?'ITEM_y1_album':'ITEM_'+id;   /* CANON-NO-ECON-1112 第四批（AA_887）：大一的票根拿掉，y1_3 現在是相簿；舊存檔的 y1_4（原本的相簿）照舊是相簿 */
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
  /* 祐廷書桌「看東西」選單上的東西（DORM-DESK-ITEMS-3D-1103；dorm_desk_items.glb，tools/blender/env_second/dorm_desk_items.py，LAWWW2 2026-11-03；READY_FOR_ART_REVIEW）：
     ITEM_desk_<key>＝STORY.roomItemKeys(G)（和選單同一份）。節點的 room='203'（書背、筆記本的字、桌墊下的票根、大一的軟木板和釘在上面的東西）只在大一 203；
     on='board'（釘在軟木板上）要軟木板也顯示（軟木板＝大一才有；大二起換成 dorm_y2_items 那一塊）。手機、三色螢光筆每一年都在。搬家、收拾那幾天全部收起來。
     牆上的網格叫 WALL_left_desk_*：跟左牆一起淡出（同溫州街那幾件）。旗標在房間裡變了每一幀比一次（只比一個字串）*/
  function deskItemKeys(G,room){ const F=(G&&G.flags)||{}; if(F.ROOM_Y2_MOVING||F.ROOM_Y3_MOVING||F.ROOM_Y4_MOVING||F.PACKED_Y4) return []; const K=typeof STORY!=='undefined'&&STORY.roomItemKeys?STORY.roomItemKeys(G):[]; if(room==='203') K.push('board'); if(['203','312','507','409'].includes(room)) K.push('liufa_'+room); return K; }   /* liufa_<房間>：書桌上的六法（厚書，蓋住 dorm_room4 的紅色方塊；BB 11-03 16:16 P3）*/
  function loadDeskItems(z,g0,E){ if(typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.dorm_desk_items']) return; let grp=null, key=null, loading=false;
    const apply=K=>{ if(!grp) return; const room=z.dormSetKey, board=K.includes('board')&&room==='203';
      grp.traverse(o=>{ if(!/^ITEM_desk_/.test(o.name)) return; const u=o.userData||{}; o.visible=K.includes(o.name.slice(10))&&(!u.room||u.room===room)&&(u.on!=='board'||board); }); };
    z.setDeskItems=G=>{ const K=deskItemKeys(G,z.dormSetKey), k=z.dormSetKey+':'+K.join(','); if(k===key) return; key=k; if(grp){ apply(K); return; } if(!K.length||loading) return; loading=true;
      grp=new THREE.Group(); grp.name='dorm_desk_items'; grp.userData.dyn=true; g0.add(grp);
      ASSETS.loadOne('bldg.dorm_desk_items').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
        grp.add(root); root.updateMatrixWorld(true);
        root.traverse(o=>{ if(!o.isMesh) return; o.castShadow=false; o.receiveShadow=true;
          if(/WALL_/.test(o.name)){ o.material=o.material.clone(); o.material.transparent=true; const d=o.userData.dir||[1,0,0]; o.userData.dir=new THREE.Vector3(d[0],d[1],d[2]); o.geometry.computeBoundingBox(); o.userData.center=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld); z.walls.push(o); }
          else if(/glass/.test(o.material&&o.material.name||'')){ o.material.transparent=true; o.material.depthWrite=false; o.renderOrder=2; }   /* 透明桌墊 */
          if(o.material) TK.bounce(o.material,0.3,0.4); });
        apply(deskItemKeys(typeof GAME!=='undefined'?GAME.G:null,z.dormSetKey)); }).catch(e=>console.warn('書桌上的東西載入失敗',e)); };
    const up0=z.update; z.update=function(dt,E2){ if(up0) up0.call(z,dt,E2); if(typeof GAME!=='undefined'&&GAME.G) z.setDeskItems(GAME.G); };
    z.setDeskItems(typeof GAME!=='undefined'?GAME.G:null); }
  function dormWallItems(z,g0){ for(const n of ['dorm_calendar','dorm_flyer']){ const o=g0.getObjectByName(n); if(!o||z.walls.includes(o)) continue;
    o.material.transparent=true; o.userData.dir=new THREE.Vector3(Math.sin(o.rotation.y),0,Math.cos(o.rotation.y));   /* 貼的那一面朝室內的方向（四人房：月曆在洗手間隔間、傳單在書桌前的牆）*/ o.updateWorldMatrix(true,false); o.userData.center=o.getWorldPosition(new THREE.Vector3()); z.walls.push(o); } }
  /* ---------- 溫州街三家新店的室內（DL-09 第一步；ART-WZ3，LAWWW2-B ce586623；AA_164 第 2 節）----------
     配置 src/data/wz_shops_layout.js（Blender 讀同一份）：大小、家具阻擋、座位、互動點、出口、溫州街的進店點 enterAt（世界座標）。
     做法照麵店：room() 的空房間＋家具色塊是備用（D38 ③），正式模型 bldg.wz_*_interior 載入後整組藏起來（attachRoomGLB：WALL_ 淡出牆）。
     一盞的前面沒有牆：房子 z −5～5、緣側 5～6.2、前院 6.2～9.6（layout 的 block 擋住，看得到、走不到）——room() 以原點為中心，建好後整個往 +z 移 2.3（導航格的原點一起移）。
     這一版：走得進去、選位子坐下、離開；點餐、印東西、喝茶的文字照 AA_172（src/wzshops3d.js；AA_355 第 3 節），打工是 DL-10。測試：node tests/wz_shops_unit.js */
  const WZ_FLOOR={wood_light:'#cdb08a',tile_grey:'#c9c9c4',wood_dark:'#c9b08c',mosaic:'#a7aeaa'};   /* 淺色木地板（使用者 10-23：不要深色木地板，整個遊戲都不要；ART-NO-DARK-WOOD-1023）*/   /* wood_dark 原本 #7d5c40；溫州街店家的配置已改成 wood_light，這個鍵留著相容 */
  const WZ_CAMDIST={print:3.2,lin:3.2,teishoku:3.2,teahouse:3.2};   /* 一盞（LAWWW2-C 11-13）：yizhan.glb 2.34 m 以上（天花板、梁、牆頂、柱頂、吊燈線）整體抬高 0.3 m，天花板 2.6→2.9 m；鏡頭距離 3.2＝鏡頭 2.86 m，低於天花板 */   /* SHOP-INTERIOR-VIEW-1112（LAWWW-C 11-13）：天花板 3.0／3.0／2.9 m，鏡頭距離 4.0 時跟隨鏡頭 3.134 m 高過天花板（天花板不畫、抬頭看到背景色）；3.2 m＝鏡頭 2.86 m（118 巷 BB 定 3.6 的同一個做法）。一盞 2.6 m 要 ≤2.43 m 太擠，交 LAWWW2 */
  function wzShop(key){ return { id:'wz_'+key, name:(typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT[key])?WZ_SHOPS_LAYOUT[key].name:key, indoor:true, camDist:WZ_CAMDIST[key]||4.0, build(E){ const L=WZ_SHOPS_LAYOUT[key], tea=!!(L.front&&L.front.openFront);
      const winXs=(L.front&&(L.front.views||L.front.windows)||[]).map(w=>-(w[0]+w[1])/2);   /* views：窗外街景的照片平面（林家、定食店整面一片）；沒有的照建築的窗 */   /* 店面那一面的窗（room() 的 front：沿牆位置 t＝−x）*/
      const sp=Object.assign({},L.spawn); if(!tea) sp.z=Math.min(sp.z,L.d/2-0.95);   /* room() 的牆內 0.4 m 不能站（阿德影印的出生點 3.9 太靠門）*/
      const z=room(E,{w:L.w,d:L.d,h:L.h,cell:wzAANew(key,L)&&key==='teishoku'?0.2:undefined/* 小路（AA 新室內）：導航格 0.2 m（和公館 AA 的店 ggRoom 一樣；0.4 m 的格子量不到 0.1 m 厚的玻璃隔板，人會穿過去）。SUNNY SIDE、一盞照舊 0.4（0.2 會在卡座和桌子中間量出孤島、店員的站位貼牆站不住）*/,warm:key!=='print',cool:key==='print',wallColor:L.wallColor,floorTex:W3.stoneTex(WZ_FLOOR[L.floor]||'#d9cbb0'),spawn:sp,windows:tea||!winXs.length?false:undefined,winWall:'front',winXs,winW:L.front&&L.front.viewW,winH:L.front&&L.front.viewH,winY:L.front&&L.front.viewY,view:L.front&&L.front.view,viewDepth:L.front&&L.front.viewDepth})   /* 阿德影印是日光燈：warm:false（LAWWW2-B 10-16 建議，截圖 wz_shops_ingame/print_entry_night.webp）*/;
      const g0=z.group, nav=z.nav, cz=tea?(9.6-L.d/2):0;   /* 一盞：房間 z −5～9.6 */
      if(L.seeThru&&L.seeThru.length) z.seeThru=true;   /* 室內的網點透空要區域打開（engine3d.js updateSeeThrough）；小路 v3 是空的（新版吊燈不在鏡頭前）*/
      if(cz){ g0.position.z+=cz; nav.oz+=cz; for(const w of z.walls) w.userData.center=new THREE.Vector3(w.position.x,w.position.y,w.position.z+cz); }
      const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
      if(L.camWalls){ const inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}), cols=[], ch=L.h+2;   /* 隔間牆當跟隨鏡頭的牆（engine3d.js followCam 的 zone.camCols：擋到就拉近、抬高）；比天花板高 2 m：鏡頭在天花板上方往下看時，越過隔間上緣的線也要擋 */
        for(const [x,zz,w,d] of L.camWalls){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,ch,d),inv); m.position.set(x,ch/2,zz-cz); m.userData.noMerge=true; g0.add(m); cols.push(m); }
        z.camCols=[cols]; }
      const fbM=M('#a88b6a',{rough:0.8});
      for(const b of L.blocks){ nav.blockRect(b[0],b[1],b[2],b[3],0,0.05); const m=new THREE.Mesh(new THREE.BoxGeometry(b[2],0.85,b[3]),fbM); m.position.set(b[0],0.425,b[1]-cz); g.add(m); }   /* 備用的家具色塊（模型載入後藏起來）*/
      if(L.yard) teaYard(E,z,g0,g,nav,L,cz);   /* 一盞的前院（WZ-YIZHAN-1104）：高度、冠木門、前院模型、在前院才顯示屋頂 */
      z.seats=[]; for(const st of L.seats){ if(st.npcOnly||/打工/.test(st.label||'')) continue;   /* 小路 v4（komichi_layout，AA bc021c7e1）起走不進去的位子都在配置寫 npcOnly：原本的 WZ_AA_NOSIT 拿掉 */ const fl=st.kind==='floor'?{floor:0.08}:(st.lift?{lift:st.lift}:{}); z.seats.push(Object.assign({x:st.x,z:st.z,yaw:st.yaw,table:st.table,kind:'shop'},fl,st.ap?{ap:st.ap}:{},st.tag?{tag:st.tag}:{}));   /* tag：店內偶遇照標記挑位子（corner／bar／door／sofa／window；src/shopenc3d.js S.seatPick；WZ-SHOPS1-1104）*/   /* floor＝坐墊的高度（茶屋的和室、緣側：跪坐，GAME.sitAt → character3d.js 的 sitFloor；QA-W1 座位檢查：原本用椅子的坐姿，人坐在坐墊上方 0.4 m 的空中）；lift＝吧台高腳凳（巷子裡定食的吧台，座面 0.72 m：坐姿抬高 0.27，和 Café 的吧台一樣）*/
        E.interactables.push({x:st.x,z:st.z,radius:WZ_SEAT_R[key]||0.9,label:st.label||'坐下',seat:Object.assign({x:st.x,z:st.z,yaw:st.yaw},fl,st.ap?{ap:st.ap}:{}),shop:key}); }   /* 按鈕的座位也要帶 ap：「坐下」用的是這一份（GAME.freeSeat 沒人坐就原樣回傳）*/
      const ex=L.exit, exSp=key==='print'&&L.moved&&wzCopyState(typeof GAME!=='undefined'?GAME.G:null)==='moved'?L.moved.exitSpawn:ex.spawn; E.interactables.push({x:ex.at.x,z:ex.at.z,radius:1.3,label:ex.label,exit:{to:ex.to,spawn:Object.assign({},exSp)}});   /* 阿德影印搬到轉角以後從轉角出來（ART-WZ6）*/
      /* 客人的選單（AA_172，src/wzshops3d.js）：配置檔的互動點只接客人用的；打工用的（出餐檯、廚房、櫃台、膠裝、水屋）等 DL-10。
         林家乾麵、巷子裡定食（AA_364，WZS.order364）：攤車旁／結帳台＝點餐（店員招呼、選單、坐下吃）、看菜單＝牆上菜單那一行 */
      const CUST={brunch:{cashier:'點餐',chalkboard:'看今日推薦'},teahouse:{tea:'喝茶',garden:'看院子',tokonoma:'看床之間的掛軸',lantern:'看石燈籠',camphor:'看樟樹',catbowl:'看貓碗',gatesign:'看門口的木牌'},print:{print:'印東西',stationery:'買文具'},lin:{order:'點餐',menu:'看菜單'},teishoku:{cashier:'點餐',menu:'看木札菜單'}}[key]||{};
      for(const q of (L.interact||[])) if(CUST[q.kind]&&!(q.cond==='WZ_CATBOWL'&&!(typeof GAME!=='undefined'&&GAME.G&&catBowlOn(GAME.G)))) E.interactables.push({x:q.x,z:q.z,radius:1.0,label:CUST[q.kind],wzShop:key,kind:q.kind});   /* cond WZ_CATBOWL：一盞前院的「看貓碗」只在貓碗看得到的時候（找到貓以後、收養以前；碗在 teaYard 放）*/
      P3.mergeStatic(g);
      const mk=wzGlbKey(key,L), aaNew=wzAANew(key,L); if(typeof ASSETS!=='undefined'&&ASSETS.manifest[mk]) ASSETS.loadOne(mk).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); if(cz) root.position.z-=cz; attachRoomGLB(z,g0,g,root);
        const stN=n=>aaNew?String(n||'').replace(/^(wzs|kmc|sns|yzn)_/,''):n, ST=(L.seeThru||[]).map(stN);   /* AA 的新室內：材質名的前綴換了（wzs_bulb → SUNNY SIDE 的 sns_bulb），照去掉前綴的名字比 */
        if(ST.length) root.traverse(q=>{ if(!q.isMesh) return; for(const m of [].concat(q.material)){ if(!m||m.userData.seeThrough||!ST.includes(stN(m.name))) continue; m.userData.seeThrough=true; if(E.patchSeeThrough) E.patchSeeThrough(m); } });
        if(aaNew) wzAAattach(E,z,g0,root,key,cz); if(key==='offbeat') offbeatAttach(E,z,g0,root,L); ggViewPanes(z,g0,root);   /* 視差窗搬到正式模型的玻璃外（WINVIEW-AUDIT-1105；模型有窗景卡的店不動）*/ }).catch(e=>console.warn(L.name+' 室內正式模型載入失敗，用備用模型',e));   /* L.seeThru：這些材質擋住人、或離鏡頭太近時網點透空（巷子裡定食的和紙燈籠）*/
      return z; } }; }
  /* ---------- 溫州街第一批 AA 的新室內（WZ-SHOPS1-1104／WZ-YIZHAN-1104；AA 製作、BB 照 LAWWW2 標準驗 MODEL_READY，BB_257 §12）----------
     小路（wz_teishoku）komichi.glb＋komichi_layout v3、SUNNY SIDE（wz_brunch）sunnyside.glb＋sunnyside_layout v3、一盞（wz_teahouse）yizhan.glb＋yizhan_layout v2。
     配置照抄進 WZ_SHOPS_LAYOUT 那三筆（tools/layout/sync_wz_aa_layouts.js），遊戲、crowd3d、jobs3d、story3d、測試讀同一份。
     正式模型的登錄：配置的 glb 和 assets3d.js 舊的那一筆不一樣（舊的是 LAWWW2 的 wz_*_interior.glb）＝另外登錄一個 bldg.wz_<店>_interior_v<版本>，舊的登錄不動 */
  /* 「坐下」的範圍（沒寫＝0.9）：阿德影印 v1c 自助電腦的椅子在長桌西側、椅子西緣 x −0.30，0.4 m 的導航格上人只站得到西側走道 x −0.9～−1.0（離椅子 0.83～0.93 m）；
     0.9 的範圍只剩邊上一條縫（tests/seat_reach_unit.js 的 0.2 m 格點量不到 (−0.07, 0.85)）。放到 1.05：走道上站在椅子旁邊就看得到「坐下」；「印東西」比較近的地方照舊是「印東西」（最近的優先）*/
  const WZ_SEAT_R={print:1.05};
  const WZ_AA_NEW={print:'阿德影印 室內 v1c（ade_interior，cc-testing 5977272dc；CC〔帳號 A〕製作、BB 代驗 MODEL_READY BB_257、CC_49 v1c）',brunch:'SUNNY SIDE 室內 v1e（sunnyside_interior，story-planning 86688bd91：窗景換成溫州街）',teishoku:'小路 室內 v4 配置（komichi_interior，story-planning bc021c7e1：隔板內側三張 npcOnly、卡座桌往東 0.25）',teahouse:'一盞 室內 v1e（yizhan_interior，story-planning bc021c7e1：天花板小梁停在 z 4.91；v1c 3d0131fe0 MODEL_READY、v1d 只換地板貼圖）'};
  function wzAANew(key,L){ return !!(WZ_AA_NEW[key]&&L&&/\/(aa|bb)_support\//.test(L.glb||'')); }   /* bb_support：阿德影印 v1c（CC 做、BB 代驗）*/
  function wzGlbKey(key,L){ const base='bldg.wz_'+key+'_interior'; if(typeof ASSETS==='undefined'||!ASSETS.manifest||!L||!L.glb) return base; const m=ASSETS.manifest[base]; if(m&&m.url===L.glb) return base;
    const k2=base+'_v'+(L.version|0); if(!ASSETS.manifest[k2]) ASSETS.manifest[k2]={url:L.glb,type:'building',lazy:true,source:(/\/bb_support\//.test(L.glb)?'本作 Blender（tools/blender/env_second/bb_support/'+String(L.glb).replace(/^.*\/|\.glb$/g,'')+'_interior.py；溫州街「'+L.name+'」'+(WZ_AA_NEW[key]||'')+'，配置 src/data/ade_layout.js 照抄進 src/data/wz_shops_layout.js 的 '+key+'）':'本作 Blender（tools/blender/env_second/aa_support/README_'+String(L.glb).replace(/^.*\/|\.glb$/g,'')+'.md；溫州街「'+L.name+'」'+(WZ_AA_NEW[key]||'')+'，AA〔帳號 A〕製作、BB 照 LAWWW2 標準驗 MODEL_READY（BB_257 §12），配置 src/data/wz_shops_layout.js 的 '+key+'）'),license:'本作；貼圖 Poly Haven CC0＋本作程式產生'};
    return k2; }
  /* 日常失速接上正式模型以後（OFFBEAT-CAT-BOARD-1105，LAWWW2-C 11-05；使用者 06:5x 兩件）：
     ① 「沒看到貓」：offbeat_sys3d.js 有「看看店長／摸摸店長」（一隻虎斑貓趴在空椅子上睡覺），模型裡沒有貓（配置 cat_chair 寫「3D 的貓這一版沒做」）。
        用溫州街那隻貓的模型（bldg.wz_cat，J13）的趴姿（CAT_lie），趴在長桌東端那張空椅子的坐墊上（配置 cat_chair (2.45, 0.15)；坐墊頂面在模型裡量是 0.523 m），會呼吸（WZCAT.breathe）。
        不是公園那一隻（不照公園的貓長胖、戴牌子、變老：wzCatModel 不給 G）；被收養、颱風天都照舊在店裡。
     ② 「首都帝大學生社團＆活動那塊牌子一直閃」：東牆佈告欄的標題牌（WALL_right_dof_print，x 5.470）和軟木板面（WALL_right_dof_wood，x 5.470）同一個平面；
        最裡面兩張傳單和板面只差 0.4、0.8 mm，有兩張傳單互相只差 0.4 mm。每一張印刷品（標題、44 張傳單、便利貼）照原本的前後順序重排：最少在板面前 4 mm、疊在別張上面的再往前 1.5 mm。tests/offbeat_cat_board_unit.js */
  const OFFBEAT_CAT={x:2.45,y:0.523,z:0.15,yaw:0}, OFFBEAT_PRINT_DX=-0.004;   /* y＝坐墊頂面（模型裡量的）*/
  function offbeatAttach(E,z,g0,root,L){ wzViewSwap(z,root,'offbeat');   /* 窗景照片（WZ_VIEW，WINVIEW-AUDIT-1105）*/
    const pr=root.getObjectByName('WALL_right_dof_print'); if(pr&&!pr.userData.obShift&&pr.geometry&&pr.geometry.attributes.position){ pr.userData.obShift=true; pr.geometry=pr.geometry.clone();   /* 模型可能被別的區域共用（ASSETS 快取）：改複本 */
      const P=pr.geometry.attributes.position, n=Math.floor(P.count/4), Q=[];   /* 每一張是 4 個頂點的一片（標題、傳單、便利貼），面向店裡（−x）*/
      for(let q=0;q<n;q++){ let x=0,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9; for(let k=0;k<4;k++){ const i=q*4+k; x+=P.getX(i)/4; y0=Math.min(y0,P.getY(i)); y1=Math.max(y1,P.getY(i)); z0=Math.min(z0,P.getZ(i)); z1=Math.max(z1,P.getZ(i)); } Q.push({q,x,y0,y1,z0,z1,nx:null}); }
      const ov=(a,b)=>a.y0<b.y1-1e-4&&b.y0<a.y1-1e-4&&a.z0<b.z1-1e-4&&b.z0<a.z1-1e-4;
      for(const a of Q.slice().sort((a,b)=>b.x-a.x)){ let nx=a.x+OFFBEAT_PRINT_DX; for(const b of Q) if(b.nx!=null&&ov(a,b)) nx=Math.min(nx,b.nx-0.0015); a.nx=nx; for(let k=0;k<4;k++) P.setX(a.q*4+k,P.getX(a.q*4+k)+(nx-a.x)); }   /* 從最裡面那張開始：比板面前 4 mm，疊在別張上面的再往前 1.5 mm（原本 1.2 mm 一層，最裡面兩張只差 0.4 mm）*/
      P.needsUpdate=true; pr.geometry.computeBoundingBox(); pr.geometry.computeBoundingSphere(); z.offbeatBoardFix=n; }
    const ch=(L&&L.items||[]).find(q=>q.kind==='cat_chair'), sp=Object.assign({},OFFBEAT_CAT,ch?{x:ch.x,z:ch.z}:{});
    if(typeof ASSETS==='undefined'||!ASSETS.manifest['bldg.wz_cat']) return;
    ASSETS.loadOne('bldg.wz_cat').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const m=wzCatModel(c.scene.clone(true),null,'lie'); if(!m) return;
      const b0=new THREE.Box3().setFromObject(m), lift=isFinite(b0.min.y)?-b0.min.y:0;   /* 趴姿的模型底部在原點下面一點（爪子）：抬到坐墊上 */
      m.name='OFFBEAT_CAT'; m.position.set(sp.x,sp.y+lift+0.003,sp.z); m.rotation.y=sp.yaw; m.userData.dyn=true; g0.add(m); z.offbeatCat=m; if(typeof WZCAT!=='undefined'&&WZCAT.breathe){ WZCAT.breathe(m); if(!z.obBreath){ z.obBreath=true; const up0=z.update; z.update=function(dt,E2){ if(up0) up0.call(z,dt,E2); WZCAT.update(dt,E2); }; } } })   /* 呼吸：WZCAT.update 每一格動 breathers（溫州街的區域 update 才有呼叫，這裡自己接）*/.catch(e=>console.warn('日常失速的店長（貓的模型）載入失敗',e)); }
  /* AA 新室內接上以後（attachRoomGLB 之後）：GLOW_* 空節點＝燈的光暈（合成一個網格，照開燈切白天／晚上，和 2:30 AM、公館 AA 的店一樣）；窗景卡（WALL_*_VIEW_*）晚上調暗；
     一盞的前院是 LAWWW2 的 wz_teahouse_yard.glb（配置 yard、teaYard，WZ-YIZHAN-1104）*/
  function wzAAattach(E,z,g0,root,key,cz){ const gl=[];
    { const L=typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT[key], CS=L&&L.chairShift; if(CS&&CS.length){ const m4=new THREE.Matrix4(), p=new THREE.Vector3(), q=new THREE.Quaternion(), sc=new THREE.Vector3(); let n=0;   /* 阿德影印：長桌那三張椅子往後挪（wz_shops_layout.js 最後那一段 chairShift，ADE-SEAT-CLIP-1105）：模型裡的椅子是 instancing，照原本的位置找到那一個 instance 挪過去 */
        root.traverse(o=>{ if(!o.isInstancedMesh||!/chair/.test((o.name||'')+' '+((o.parent&&o.parent.name)||''))) return; for(let i=0;i<o.count;i++){ o.getMatrixAt(i,m4); m4.decompose(p,q,sc); const c=CS.find(c=>Math.abs(p.x-c.from[0])<0.02&&Math.abs(p.z+(cz||0)-c.from[1])<0.02); if(!c) continue; p.x=c.to[0]; p.z=c.to[1]-(cz||0); m4.compose(p,q,sc); o.setMatrixAt(i,m4); n++; } o.instanceMatrix.needsUpdate=true; if(o.computeBoundingSphere) o.computeBoundingSphere(); });
        z.chairShifted=n; } } root.traverseVisible(o=>{ if(o.userData&&o.userData.glow) gl.push(o); });
    if(gl.length){ const mesh=wzGlowBatch(E,g0,root,gl,'wz_'+key+'_glows',2.5); const on0=z.onLamps; z.onLamps=function(on){ if(on0) on0.call(z,on); mesh.material.emissiveIntensity=on?1:0; }; z.aaGlows=gl.length; }
    wzViewSwap(z,root,key);   /* WZ_VIEW：換成窗景照片的卡自己管日夜（下面的 vm 跳過它們）*/
    const vm=[]; root.traverse(o=>{ if(o.isMesh&&/VIEW/.test(o.name)) for(const m of [].concat(o.material)) if(m&&!m.userData.wvOwn&&!vm.includes(m)){ if(m.userData.ei0==null) m.userData.ei0=m.emissiveIntensity!=null?m.emissiveIntensity:1; vm.push(m); } });
    const nv=WZ_AA_NIGHTVIEW[key], nt=nv&&wzNightViewTex(nv.url), nvm=nt?vm.filter(m=>m.name===nv.mat):[];
    for(const m of nvm){ m.userData.mapDay=m.map; m.userData.emDay=m.emissiveMap; }
    if(vm.length){ const at=z.applyTime; z.applyTime=function(h,w){ if(at) at.call(this,h,w); const hh=((h%24)+24)%24, night=hh<6||hh>=18.8;
        for(const m of vm){ if(nvm.includes(m)&&!nt.userData.failed){ const mp=night?nt:m.userData.mapDay, em=night?nt:m.userData.emDay; if(m.map!==mp||m.emissiveMap!==em){ m.map=mp; m.emissiveMap=em; m.needsUpdate=true; } m.color.setScalar(1); m.emissiveIntensity=m.userData.ei0; continue; }
          if(nvm.includes(m)&&(m.map!==m.userData.mapDay||m.emissiveMap!==m.userData.emDay)){ m.map=m.userData.mapDay; m.emissiveMap=m.userData.emDay; m.needsUpdate=true; }   /* 夜版圖載入失敗：換回白天的圖（下面照舊調暗）*/   /* 有夜版圖的窗景卡：晚上換圖、不調暗 */
          m.color.setScalar(night?0.18:1); m.emissiveIntensity=m.userData.ei0*(night?0.35:1); } };
      if(typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); }
    z.aaNightView=nvm.length;
    return root; }
  /* 窗景卡的夜版圖（日夜換圖，和 2:30 AM 舊 Café 的店面街景 cafeStreetTex 白天／晚上換圖一樣；沒有夜版圖的店照舊晚上調暗）：
     SUNNY SIDE v1e（AA 86688bd91）兩塊窗景卡（WALL_front_VIEW、WALL_right_VIEW）共用材質 sns_window_view，貼圖是 LAWWW2 a485b6722 從 SUNNY SIDE 往外拍的溫州街（上半正面、下半東側）；
     夜版 tools/blender/env_second/textures/gen/sns_views_night.jpg 同樣的排法，轉成 webp 放 assets（遊戲讀這份）*/
  const CAFE230_NIGHTVIEW={mat:'a23_window_view',url:'assets/models/env/second_ai/aa_support/cafe230_views_night.webp'};   /* AA v1f a23_views_night.jpg 轉 webp */
  /* 溫州街的店換窗景照片（WINVIEW-AUDIT-1105，LAWWW2-C；使用者 07:4x「應該很多店面看出去的街景都不對吧」）：小路（komichi.glb）、日常失速的窗景卡原本是木曜日的樹（mok_view）。
     照公館 GG_VIEW 的做法，在 Blender 用溫州街正式模型、站在店裡往外拍白天／晚上兩張（tools/blender/env_second/wz_window_view.py）。mesh＝窗景卡網格名字（正規式）；
     換照片的那一塊卡複製一份材質（日常失速前窗、右窗共用 dof_window_view：只換前窗，右窗照舊）。晚上不調暗；照片載入失敗就換回模型原本那張、照舊調暗（wzAAattach 那一段）*/
  const WZ_VIEW={teishoku:[{mesh:'VIEW',day:'assets/models/env/second_ai/aa_support/komichi_view_day.webp',night:'assets/models/env/second_ai/aa_support/komichi_view_night.webp'}],
    mokuyobi:[{mesh:'mok_window_view',day:'assets/models/env/second_ai/aa_support/mokuyobi_view_day.webp',night:'assets/models/env/second_ai/aa_support/mokuyobi_view_night.webp'}],   /* 木曜日（溫州街 B4 二樓）臨街窗往南看：原本是手繪的樹（mok_view），換成溫州街正式模型拍的街景（WINVIEW-AUDIT，LAWWW2-B 11-07；mokuyobi3d.js 載入室內模型後呼叫 Z3.wzViewSwap）*/
    offbeat:[{mesh:'WALL_front_VIEW',day:'assets/models/env/second_ai/aa_support/offbeat_view_front_day.webp',night:'assets/models/env/second_ai/aa_support/offbeat_view_front_night.webp'}]};   /* 日常失速右窗（朝北）：遊戲裡那一頭是地圖外、什麼都沒有，拍出來是一片空地，先留模型原本那張樹 */
  function wzViewSwap(z,root,key,tab){ const wv=(tab||WZ_VIEW)[key]||[], L=[];   /* tab：別的表（美國兩間超市 US3.US_VIEW，src/us3d.js）；沒給＝溫州街 WZ_VIEW */
    for(const e of wv){ const tD=wzNightViewTex(e.day), tN=wzNightViewTex(e.night); if(!tD||!tN) continue; tD.userData.url=e.day; tN.userData.url=e.night; const re=new RegExp(e.mesh); let mc=null;
      root.traverse(o=>{ if(!o.isMesh||!re.test(o.name||'')) return; if(!mc){ const m0=[].concat(o.material)[0]; if(!m0) return; mc=m0.clone(); mc.userData.wvOwn=true; mc.userData.wvMap0=m0.map; mc.userData.wvEm0=m0.emissiveMap; mc.userData.ei0=m0.emissiveIntensity!=null?m0.emissiveIntensity:1; } o.material=mc; });
      if(mc) L.push({m:mc,d:tD,n:tN}); }
    if(!L.length) return 0; const at=z.applyTime; z.applyTime=function(h,w){ if(at) at.call(this,h,w); const hh=((h%24)+24)%24, night=hh<6||hh>=18.8;
      for(const q of L){ const m=q.m, t=night?q.n:q.d, ok=!(t.userData&&t.userData.failed), mp=ok?t:m.userData.wvMap0, em=ok?(m.userData.wvEm0?t:null):m.userData.wvEm0;
        if(m.map!==mp||m.emissiveMap!==em){ m.map=mp; m.emissiveMap=em; m.needsUpdate=true; }
        if(ok){ m.color.setScalar(1); m.emissiveIntensity=m.userData.ei0; } else { m.color.setScalar(night?0.18:1); m.emissiveIntensity=m.userData.ei0*(night?0.35:1); } } };
    if(typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); z.wzViews=L.length; return L.length; }
  const WZ_AA_NIGHTVIEW={brunch:{mat:'sns_window_view',url:'assets/models/env/second_ai/aa_support/sunnyside_views_night.webp'}};
  const wzNVTex={};
  function wzNightViewTex(url){ if(typeof THREE==='undefined'||!THREE.TextureLoader) return null; if(!wzNVTex[url]){ let t; try{ t=new THREE.TextureLoader().load(url,undefined,undefined,()=>{ t.userData.failed=true; console.warn('窗景夜版圖載入失敗，晚上照舊調暗白天的圖',url); }); }catch(e){ return null; } t.flipY=false; t.colorSpace=THREE.SRGBColorSpace; wzNVTex[url]=t; } return wzNVTex[url]; }   /* flipY false：和 GLB 裡的貼圖同一種 UV 方向 */
  /* 一盞茶屋的前院（WZ-YIZHAN-1104，AA_656，LAWWW2 11-04）：從溫州街進冠木門以後就在前院，走踏石到玄關前的石板土間、進玄關；或從緣側前的沓脫石下院子。
     高度（nav.addSurf）：前院 -0.42、土間 -0.24、玄關 -0.12、室內 0（每一階 0.21 以內，A* 每格 0.30 以內）；緣側和前院差 0.42：除了沓脫石那一段都上不去（E.canStand 的高度差）。
     模型：wz_teahouse_yard.glb（前院、冠木門、竹垣、石燈籠、老樟樹、牆外的街）；YARD_EAVE（簷）、YARD_ROOF（主屋屋頂）只在玩家站在前院時顯示——人在屋裡是剖面視角，屋頂會擋住。
     玩家在前院時，緣側那一組牆（WALL_engawa_*：玄關的格子門、緣側兩端的紙拉門、橫樑）不淡出：鏡頭在前院上方，那一組在玩家後面。*/
  /* 一盞前院的貓碗（AA_659 第 3 節：樟樹南邊的地上約 (4.05, 8.35)（2026-11-04 拉開互動點，原本 (4.0, 8.7)），只在 WZ_CATBOWL 時出現、碗和按鈕一起）：前院模型（wz_teahouse_yard.glb）沒有碗，用 LAWWW2 desk_props.glb 的 item_bowl；
     condVis 每一格問 catBowlOn（找到貓以後 WZ_CAT_FOUND、收養以前），和溫州街外面那個 WZ_CATBOWL 同一個條件 */
  function teaCatBowl(z,g0,L,cz){ const q=(L.interact||[]).find(i=>i.kind==='catbowl'&&i.bowl); if(!q||typeof ASSETS==='undefined'||!ASSETS.manifest['prop.desk_props']) return;
    const Y=L.yard, fy=(Y&&Y.surfs&&Y.surfs[0]&&Y.surfs[0].y)||-0.42;
    ASSETS.loadOne('prop.desk_props').then(c=>{ if(!c||!c.scene) return; const src=c.scene.getObjectByName('item_bowl'); if(!src) return; const b=src.clone(true); b.name='WZ_TEA_CATBOWL'; b.position.set(q.bowl.x,fy,q.bowl.z-(cz||0)); b.rotation.set(0,0.4,0); b.scale.setScalar(1.15);
      b.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); condVis(b,catBowlOn); g0.add(b); z.teaCatBowl=b; }).catch(()=>{}); }
  /* 可以點的地面（點地移動，E.screenToFloor）：照導航格的高度（nav.heightAt）做一片看不到的網格，每 step m 一格、每一格自己四個頂點（角的高度往格子中心縮 1 cm 取）：
     同一塊高度裡完全照導航格（斜面、沓脫石照連續高度），兩塊高度的交界是斷開的（不做斜坡，點交界旁邊不會被斜坡擋住、落到旁邊）。
     區域沒有 walkMeshes 時，點地退回「玩家那一層的 y0 平面」：地板比 y0 低或高的地方（一盞的前院 −0.42、土間、玄關）點下去會偏（BB-C TAPSCAN 06:4x；同南洋 1 廳、體育館看台）。
     x0..z1 是世界座標；off＝網格掛的群組在世界裡的 z 位移（一盞的 g0 往 +z 搬了 cz，這裡要扣回來）。TEA-SUNKEN-TAP-1105，tests/teahouse_tap_unit.js */
  function navTapMesh(nav,x0,x1,z0,z1,step,lv,off){ const nx=Math.max(1,Math.round((x1-x0)/step)), nz=Math.max(1,Math.round((z1-z0)/step)), dx=(x1-x0)/nx, dz=(z1-z0)/nz, e=0.01;
    const pos=new Float32Array(nx*nz*12), idx=new Uint32Array(nx*nz*6); let p=0, q=0, v=0;
    for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ const ax=x0+i*dx, az=z0+j*dz;
      for(const [cx,cz2,sx,sz] of [[ax,az,1,1],[ax+dx,az,-1,1],[ax,az+dz,1,-1],[ax+dx,az+dz,-1,-1]]){ pos[p++]=cx-sx*0.003; pos[p++]=nav.heightAt(cx+sx*e,cz2+sz*e)+0.01; pos[p++]=cz2-sz*0.003-(off||0); }   /* 每一格往外多 3 mm、和旁邊那一格疊一點：射線剛好沿著格子的邊時不會兩格都漏接 */
      idx[q++]=v; idx[q++]=v+2; idx[q++]=v+1; idx[q++]=v+1; idx[q++]=v+2; idx[q++]=v+3; v+=4; }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setIndex(new THREE.BufferAttribute(idx,1)); geo.computeBoundingSphere(); geo.computeBoundingBox();
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.name='TAP_FLOOR'; m.userData.walkLv=lv|0; m.userData.dyn=true; m.userData.noMerge=true; return m; }
  function teaYard(E,z,g0,g,nav,L,cz){ const Y=L.yard;
    for(const s of Y.surfs) nav.addSurf(Object.assign({},s)); for(const r of (Y.open||[])) nav.freeRect(r[0],r[1],r[2],r[3]);
    { let x0=-L.w/2, x1=L.w/2, z0=9.6-L.d, z1=9.6; for(const s of Y.surfs){ x0=Math.min(x0,s.x0); x1=Math.max(x1,s.x1); z0=Math.min(z0,s.z0); z1=Math.max(z1,s.z1); }   /* 整間（室內 0、玄關、土間、前院、沓脫石）一片：只蓋下沉的地方的話，從屋裡往前院的方向點室內地板，射線會穿過去打到前院那一片 */
      const tm=navTapMesh(nav,x0,x1,z0,z1,0.2,0,cz); g0.add(tm); z.walkMeshes=(z.walkMeshes||[]).concat([tm]); }
    const fy=new THREE.Mesh(new THREE.PlaneGeometry(9.2,3.4),M('#6f7a52',{rough:0.95})); fy.rotation.x=-Math.PI/2; fy.position.set(0,-0.41,7.9-cz); g.add(fy);   /* 備用（模型載入失敗時）：前院的地面 */
    z.yardZ=Y.inYardZ||6.35; z._inYard=!!(z.spawn&&z.spawn.z>z.yardZ); z.yardParts=[];
    /* 前院的鏡頭碰撞（CAM-TEAYARD-1109，LAWWW2-B；BB-B 11-09 WALLFADE_W1P：出生點把鏡頭轉到 180°、270°，鏡頭跑進屋裡、鄰居的牆裡，整個畫面只剩牆）：
       這一區的 camCols 原本只有屋裡兩道隔間牆；在前院時緣側那面牆照下面的規則不淡出，鏡頭退到屋裡就被它擋住，西邊、北邊鄰居的房子也沒有碰撞。
       玩家在前院時，把緣側的牆（WALL_engawa_*）、前院模型的鄰居房子和兩側灰泥牆（wzy_apt、wzy_apt2、wzy_plaster）加進鏡頭碰撞（擋到就拉近、抬高，和教學館、美國公寓同一套）；回到屋裡照舊 */
    const camBase=z.camCols?z.camCols[0]:[]; z.yardCams=[];
    const fw=z.fadeWalls; z.fadeWalls=function(cam,pp){ if(fw) fw.call(this,cam,pp); const iy=!!pp&&pp.z>(this._inYard?this.yardZ-0.15:this.yardZ); this._inYard=iy;
      const ck=iy?this.yardCams.length+'|'+this.walls.length:'in'; if(this._camKey!==ck){ this._camKey=ck; this.camCols=[iy?camBase.concat(this.yardCams,this.walls.filter(w=>/WALL_engawa/.test(w.name||''))):camBase]; this._lcAll=null; }
      for(const o of this.yardParts) o.visible=iy;
      if(iy&&this.yardEave&&cam){ const ez=this.yardEaveZ, under=cam.position.z<(this._eaveHid?ez+0.1:ez-0.1); this._eaveHid=under; if(under) this.yardEave.visible=false; } else this._eaveHid=false;   /* 鏡頭跑到緣側屋簷外緣的房子那一側（轉到 150°～210°）：屋簷整組藏起來，和牆淡出同一個道理——鏡頭在屋簷的體積裡、或隔著屋簷看前院的人，橫樑、椽子、瓦蓋住畫面上半、擋住頭（CAM-TEAYARD-1109 第二輪，BB-B 23:23 180° PARTIAL；加進鏡頭碰撞試過：鏡頭被擠到簷下，畫面上半一樣是簷下板）*/
      if(iy) for(const w of this.walls){ if(/WALL_engawa/.test(w.name||'')&&w.material&&!Array.isArray(w.material)){ w.material.opacity=1; w.material.depthWrite=true; } } };
    teaCatBowl(z,g0,L,cz);
    const mk=Y.manifest||'bldg.wz_teahouse_yard'; if(typeof ASSETS==='undefined'||!ASSETS.manifest[mk]) return;
    ASSETS.loadOne(mk).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const r=c.scene.clone(true); if(cz) r.position.z-=cz; r.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); g0.add(r); r.updateMatrixWorld(true);
      r.traverse(o=>{ if(/^YARD_(ROOF|EAVE)$/.test(o.name)) z.yardParts.push(o); }); for(const o of z.yardParts) o.visible=z._inYard;
      z.yardEave=r.getObjectByName('YARD_EAVE')||null; if(z.yardEave){ g0.updateMatrixWorld(true); z.yardEaveZ=new THREE.Box3().setFromObject(z.yardEave).max.z; }   /* 屋簷外緣（世界座標 z 6.93）；g0 整組往 +z 移了 cz，先更新矩陣（不然少算 2.3 m）*/
      r.traverse(o=>{ if(o.isMesh&&/^wzy_(apt|apt2|plaster)$/.test(o.name)) z.yardCams.push(o); }); z._camKey=null;   /* 前院的鏡頭碰撞（見上面）*/
      fy.visible=false;
      const gl=[]; r.traverse(o=>{ if(o.userData&&o.userData.glow) gl.push(o); });
      if(gl.length){ const mesh=wzGlowBatch(E,g0,r,gl,'wz_teahouse_yard_glows',2.5); const on0=z.onLamps; z.onLamps=function(on){ if(on0) on0.call(z,on); mesh.material.emissiveIntensity=on?1:0; }; mesh.material.emissiveIntensity=E.lampsOn?1:0; }   /* 冠木門的門燈、石燈籠、玄關的提燈：晚上亮 */
      if(L.seeThru) r.traverse(q=>{ if(!q.isMesh) return; for(const m of [].concat(q.material)){ if(!m||m.userData.seeThrough||!L.seeThru.includes(m.name)) continue; m.userData.seeThrough=true; if(E.patchSeeThrough) E.patchSeeThrough(m); } });   /* 老樟樹的樹幹擋住人時網點透空 */
    }).catch(e=>console.warn('一盞前院正式模型載入失敗，用備用的地面',e)); }
  const wz_brunch=wzShop('brunch'), wz_print=wzShop('print'), wz_teahouse=wzShop('teahouse');
  /* 林家乾麵（A4）、巷子裡定食（B3）能進去內用（WZ-SHOP-AA364-ART，LAWWW2 2026-10-22；AA_364）：同一套 wzShop，配置在 WZ_SHOPS_LAYOUT.lin／teishoku；正式模型 tools/blender/env_second/wz_aa364_shops.py --shop lin|teishoku（118 巷店面的零件）。
     這一版：走得進去、選位子坐下、離開；點餐、店員、營業時間由 LAWWW 接（AA_364 第 4 節 #2）。資產登錄放這裡（和 118 巷店面 l118_shops3d.js 一樣），不動 assets3d.js */
  /* 林家乾麵 v1c（WZ-SHOPS1-1104，AA_654：BB〔帳號 A〕11-04 照使用者的參考圖 wz_lin_int.webp 重做，LAWWW2-C 11-05 收件；配置 src/data/lin_layout.js v2，模型 bb_support/lin_interior.glb）：
     門、窗、出口、出生點、enterAt 和舊的 lin 一樣；桌子重排（四張方桌＋紅凳，12 個座位，桌號照舊：明軒「門口那桌」＝桌 1）。配置檔（index.html 在 wz_shops_layout.js 後面載入）一載入就換掉 WZ_SHOPS_LAYOUT.lin；沒載入時照舊。
     牆的淡出方向寫在空節點（WALL_back…）——attachRoomGLB 的 wallDirOf 沿用上層節點的（GLB-WALLDIR-1105）*/
  if(typeof LIN_LAYOUT!=='undefined'&&typeof ASSETS!=='undefined'&&!ASSETS.manifest['bldg.wz_lin_interior_v'+(LIN_LAYOUT.version|0)]) ASSETS.manifest['bldg.wz_lin_interior_v'+(LIN_LAYOUT.version|0)]={url:LIN_LAYOUT.glb,type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/bb_support/lin_interior.py＋lin_tex.py（溫州街「林家乾麵」室內 v1c，BB〔帳號 A〕製作、LAWWW2-C 收件；配置 src/data/lin_layout.js，載入時換掉 WZ_SHOPS_LAYOUT.lin）',license:'本作；貼圖 Poly Haven CC0＋本作程式產生'};
  const wz_lin=wzShop('lin'), wz_teishoku=wzShop('teishoku');
  /* 日常失速（WZ-OFFBEAT-1104，LAWWW2 11-04；AA_617、AA_618）：溫州街轉角 W2 一樓。室內是 AA 的 Blender 模型（aa_support/daily_offbeat.glb，配置 src/data/daily_offbeat_layout.js），同一套 wzShop。
     這一版：走得進去、選位子坐下、離開；點東西吃、桌遊、店長（貓）、佈告欄（配置的 interact）由 LAWWW 照 AA_618 接。座位不給讀書（使用者 11-03：「日常失速是吃飯打屁桌遊」）。
     配置檔沒有載入（index.html 沒加）時沒有這個區域，溫州街也沒有「進去日常失速」 */
  let wz_offbeat=null;
  if(typeof DAILY_OFFBEAT_LAYOUT!=='undefined'&&typeof WZ_SHOPS_LAYOUT!=='undefined'){ WZ_SHOPS_LAYOUT.offbeat=DAILY_OFFBEAT_LAYOUT; wz_offbeat=wzShop('offbeat');
    if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['bldg.wz_offbeat_interior']) ASSETS.manifest['bldg.wz_offbeat_interior']={url:'assets/models/env/second_ai/aa_support/daily_offbeat.glb',type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/aa_support/daily_offbeat_interior.py＋v2／v3 fill（溫州街「日常失速」室內，AA 子代理 11-03 v3c，配置 src/data/daily_offbeat_layout.js）',license:'本作；貼圖 Poly Haven CC0＋本作程式產生'}; }
  if(typeof ASSETS!=='undefined') for(const k of ['lin','teishoku']){ const mk='bldg.wz_'+k+'_interior'; if(!ASSETS.manifest[mk]) ASSETS.manifest[mk]={url:'assets/models/env/second_ai/wz_'+k+'_interior.glb',type:'building',lazy:true,source:'本作 Blender 腳本 tools/blender/env_second/wz_aa364_shops.py --shop '+k+'（溫州街'+(k==='lin'?'「林家乾麵」':'「小路」')+'室內，配置 src/data/wz_shops_layout.js；LAWWW2 WZ-SHOP-AA364-ART）',license:'本作；貼圖 Poly Haven CC0＋本作程式產生'}; }
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
    for(const sh of ((L&&L.shops)||[])){ const x=sh.side==='W'?fw+0.9:fe-0.9, z=(sh.z0+sh.z1)/2; const SD=(typeof LANE118_SHOPS!=='undefined'&&LANE118_SHOPS.shops.find(q=>q.id===sh.id))||null, nm=(SD&&SD.name)||sh.name, ty=(SD&&SD.type)||sh.type;   /* 店名、類型照店家資料（L118-SHOPS-REDO-1111：原本類型讀配置）；配置有、資料沒有的店照配置 */
      /* 店走得進去（LANE118-SHOPS-1020，X66；使用者 2026-10-20「店裡可以進去 店員也在裡面」）：有室內配置的店，營業時間按鈕是「進○○」（區域 l118_<id>，src/l118_shops3d.js）；
         沒開的時候照舊是店門口那個按鈕（L118.order 說鐵門拉下來一半） */
      const open118=()=>{ try{ return typeof L118!=='undefined'&&typeof GAME!=='undefined'&&GAME.G?L118.isOpen(sh.id,GAME.G):true; }catch(e){ return true; } };
      if(typeof L118_SHOP_LAYOUTS!=='undefined'&&L118_SHOP_LAYOUTS[sh.id]){ const LL=L118_SHOP_LAYOUTS[sh.id];
        E.interactables.push({x,z,radius:1.4,prio:1,label:'進'+nm+'（'+ty+'）',exit:{to:'l118_'+sh.id,spawn:{x:LL.spawn.x,z:LL.spawn.z,yaw:LL.spawn.yaw}},get hidden(){ return !open118(); }});
        E.interactables.push({x,z,radius:1.4,prio:1,label:nm+'（'+ty+'）',shop118:sh.id,get hidden(){ return open118(); }}); }   /* prio：在門口等的常客不擋店門（BB-C 10-20：好家自助餐門口江明軒站著，按鈕變「和江明軒說話」進不去）；要跟他說話就進店（L118.populateShop 讓他跟進來）*/
      else E.interactables.push({x,z,radius:1.4,label:nm+'（'+ty+'）',shop118:sh.id}); }   /* 沒有室內配置的店（外帶飲料店 drink_a／drink_b）：店門口點餐 */
    E.interactables.push({x:0,z:gz-0.6,radius:2.2,label:(L&&L.backGate.label)||'回到首都帝大（後門）',exit:{to:'campus',spawn:{x:34,z:-125.6,yaw:0}}});   /* 回到霖澤館後面的小廣場（校園那一側的出口在同一個地方）*/
    // 路燈與店家燈光（晚上）
    /* 第二支原本在 z −10：正好站在迪倫窯烤披薩招牌的「烤」字和店門中間（BB_341 第 3 項，L118-STREET-FIX-1111 2026-11-11）→ 移到迪倫和北邊那一棟之間的壁柱前（z −14.2）。四支都在兩棟之間的壁柱前或小巷口，不在十一間店的店門、招牌正前方（tests/l118_street_fix_1111_unit.js）*/
    const pools=[]; for(const z of [-30,-14.2,10,28]){ const lp=W3.lampPost(); place(g,lp,fe-0.35,z,-Math.PI/2); nav.blockCircle(fe-0.35,z,0.5); const pool=TK.lightPool(4.2,'rgba(255,214,150,1)'); pool.position.set(fe-1.1,0.03,z); g.add(pool); pools.push(pool); }
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
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.lane118_street']) ASSETS.loadOne('bldg.lane118_street').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachWenzhouModel(E,g,c.scene.clone(true),'l118','lane118_street_glb'); l118ClosedLook(E,g,zone,L,fw,fe); }).catch(e=>console.warn('118 巷正式模型載入失敗，用方塊立面',e));
    return zone; }
  const lane118={ id:'lane118', name:'118 巷', indoor:false, cityLight:0.85, size:[28,100], camDist:5.2, build(E){ return buildLane118(E); } };
  /* 導航的小縫（ECON-NAV-TRAPS-1111，LAWWW2；和 US-NAV-TRAPS-1111、MOKU-PLANT-CORNER-1111 同一類）：「站得住」只看人的前後左右四點，斜放的東西在 0.5 m 的格子上變成一階一階，
     每一階的內角剩一小塊四點都站得住、周圍站不住的地方——走得進去（走路斜著推就進去），16 個方向推都出不來。
     Node 掃（引擎真的 canStand＋stepEntity）：校園法學院那一帶兩處（斜的那一排 13 塊、(91.25,−113) 兩塊）、溫州街 (20.75,5.75)、社科院圖書館 (10.2,−7.0)。
     只擋那幾格（格子裡沒有大區站得住的點，擋了不會切斷路），模型不動。測試：node tests/econ_nav_traps_1111_unit.js */
  const NAV_NOTCHES={ campus:{lv:0,cell:0.5,pts:[[91.25,-113.25],[91.25,-112.75],[96.25,-108.75],[96.25,-108.25],[93.75,-79.25],[93.75,-78.75],[94.25,-78.75],[94.25,-78.25],[94.75,-78.25],[94.75,-77.75],[95.25,-77.75],[95.25,-77.25],[95.75,-77.25],[95.75,-76.75],[96.25,-76.75]]},
    wenzhou:{lv:0,cell:0.5,pts:[[20.75,5.75]]}, soclib:{lv:0,cell:0.4,pts:[[10.2,-7.0]]} };
  function navNotch(z,id){ const N=NAV_NOTCHES[id]; if(!N||!z) return z; const n=(z.levels&&z.levels[N.lv|0])||z.nav; if(!n||!n.blockRect) return z; for(const [x,zz] of N.pts) n.blockRect(x,zz,N.cell*0.9,N.cell*0.9,0,0); n._cm=null; return z; }
  for(const [id,def] of [['campus',campus],['wenzhou',wenzhou]]){ const b=def.build; def.build=function(E){ return navNotch(b.call(this,E),id); }; }
  const ZONES={campus,gongguan,wenzhou,lane118,classroom,library,cafe,cvs,noodle,bookstore,dorm,wz_brunch,wz_print,wz_teahouse,wz_lin,wz_teishoku}; if(wz_offbeat) ZONES.wz_offbeat=wz_offbeat; if(GG_L.aoki()) ZONES.aoki=aoki; if(GG_L.afar()) ZONES.afar=afar; if(GG_L.daybreak()) ZONES.daybreak=daybreak;   /* afar café、Daybreak（GG-SHOPS2-1104）：配置檔有載入才有 */ if(GG_L.yangyang()) ZONES.yangyang=yangyang;   /* 洋洋鹹酥雞（YANGYANG-IN-1107）：配置檔有載入才有 */ if(GG_L.corner_records()) ZONES.corner_records=corner_records;   /* 轉角唱片（CORNER-IN-1107）：配置檔有載入才有 */   /* 青木茶室（GG-SHOPS-REDO-1104）：配置檔有載入才有 */   /* wancai：src/wancai3d.js；linze：src/building3d.js；wz_*：溫州街三家新店（WZ_SHOPS_LAYOUT）*/   /* wancai：src/wancai3d.js；linze：src/building3d.js */
  /* 換區域不卡（PERF-ZONE-ENTER-1018，使用者 X14「電腦換畫面卡一兩秒（溫州街、咖啡廳）」，LAWWW2 2026-10-21）：GAME.enter 在畫面全黑、淡入之前呼叫。
     原本：區域建好、第一格畫完，已經載過的正式模型才接上（ASSETS.loadOne().then 是 microtask，在 await fade(false) 才跑）；
     淡入那幾格才編新材質的 shader、把貼圖傳上 GPU——淡入看到的畫面停住一兩秒。
     現在：先等一個 macrotask 讓已載過的正式模型接上；再用 compileAsync 編整個場景的材質（有 KHR_parallel_shader_compile 時不卡主執行緒、多個 shader 同時編）；
     最後把場景裡的貼圖傳上 GPU，每傳約 400 萬像素讓出一次主執行緒。最多等 cap 毫秒，超過就照原本的方式（剩下的第一格做）。E.lastPrewarm 記每一段的時間（測試、量測用）。
     只做看得到的物件（traverseVisible）：被正式模型取代、藏起來的套件備用模型不編、不傳（省時間也省 GPU 記憶體；晚上才出現的東西照舊在出現那一格做）。
     compileAsync 本身會走到藏起來的物件：先把它們的 material 暫時拿掉，編完馬上放回去——溫州街有三個藏起來的套件零件 material 是 TK 的 paint 描述（不是 THREE.Material），編下去會丟例外。
     等的時候主迴圈照樣每一格 E.render：畫面是黑的，先不畫（E.renderSkip 暫時回 true，做完還原），不然那一格會停下來等還沒編好的 shader，平行編譯就白做了。
     只在電腦上做（使用者回報的是電腦；ASSETS.texCap 是空的＝不是手機）。*/
  /* 只是「這一刻的鏡頭看不到」才藏起來的東西（BUG-RUN-STUTTER-1112，使用者「跑步會頓」；CC 在使用者電腦量：東南大聯店內一開跑，renderer 的 programs 多 16 支——
     路人 VRM 的材質（眼睛、臉、毛衣、裙子＋外框）＋VIEWPANE（窗景片）＋店內牆 tzs_vc；站著、走路沒有超過 50 ms 的幀）：
       · 路人、同學：引擎每一格照鏡頭的視錐設 obj.visible（engine3d.js updateNPC），進店那一刻在鏡頭外的人＝false；
       · 淡出的牆（鏡頭和房間中間的那一面：E.hideFaded 設 visible=false）、跟著那面牆藏的窗景片和窗框（zone.winParts：fadeWalls 設 visible）；
       · 先生好、還沒進場的客人（crowd3d.js 的 E.preObjs，掛在場景裡不顯示）。
     prewarm、warmup 原本都只編「看得到的」——這些一個都沒編到，鏡頭一轉（開跑）第一次畫到才編 shader、傳貼圖＝那一頓。
     這裡列出來，prewarm 在黑畫面裡一起編、一起傳貼圖，warmup 之後每一輪掃到也編（之後才走進來、還在鏡頭外的人）。
     n.hidden（故意藏的人：收攤的老闆、還沒出發的課輔班）、被正式模型取代的備用模型不在這裡：照舊不編。 */
  function revealList(E){ const out=[], z=E&&E.zone; if(!E) return out;
    for(const n of E.npcs||[]) if(n&&n.obj&&!n.hidden&&n.obj.visible===false) out.push(n.obj);
    for(const o of E.preObjs||[]) if(o&&o.parent&&o.visible===false) out.push(o);
    if(z){ for(const w of z.walls||[]) if(w&&w.isObject3D&&w.visible===false) out.push(w); for(const wp of z.winParts||[]) if(wp&&wp.obj&&wp.obj.visible===false) out.push(wp.obj); }
    return out; }
  async function prewarm(E,opts){ opts=opts||{}; const R=E.renderer; if(!R||!R.compileAsync||!E.scene||!E.camera) return null;
    const q=(typeof location!=='undefined'&&location.search)||''; if(/[?&]noprewarm\b/.test(q)||(typeof ASSETS!=='undefined'&&ASSETS.texCap&&!/[?&]prewarm\b/.test(q))) return null;   /* 只在電腦上做（同 prefetchNext）：手機照原本的做法——SwiftShader 手機模擬量到一次黑畫面拉長到 13.6 秒（淡入的計時器被很長的格子擠到後面）；沒有真機數字以前手機不動。?prewarm 手機模擬也做（量測用）、?noprewarm 關掉 */
    const qc=+((q.match(/[?&]prewarmcap=(\d+)/)||[])[1]||0); if(qc) opts=Object.assign({},opts,{cap:qc});   /* 量測用：?prewarmcap=毫秒 改黑畫面最多等多久 */
    const skip0=E.renderSkip; E.renderSkip=()=>true; try{ return await prewarmRun(E,R,opts); } finally{ E.renderSkip=skip0; } }
  async function prewarmRun(E,R,opts){
    const t0=performance.now(), cap=opts.cap||2000, left=()=>cap-(performance.now()-t0), tick=()=>new Promise(r=>setTimeout(r,0));
    const out={ms:0,attachMs:0,compileMs:0,texMs:0,textures:0,mpix:0,skipped:0,revealed:0,timedOut:false};
    await tick(); out.attachMs=performance.now()-t0;
    const shown=new Set(), rev=revealList(E); for(const o of rev) o.visible=true;   /* 鏡頭外的人、淡出的牆、窗景片、先生好的客人：算看得到的（上面 revealList）*/
    try{ E.scene.traverseVisible(o=>{ if(o.material) shown.add(o); }); } finally { for(const o of rev) o.visible=false; }
    const isMat=m=>Array.isArray(m)?m.every(x=>x&&x.isMaterial):!!(m&&m.isMaterial), off=[];
    const tc=performance.now(); let job;
    try{ E.scene.traverse(o=>{ if(o.material&&(!shown.has(o)||!isMat(o.material))){ off.push([o,o.material]); o.material=null; } }); job=R.compileAsync(E.scene,E.camera); }
    catch(e){ console.warn('prewarm compile',e); job=Promise.resolve(); }
    finally{ for(const [o,m] of off) o.material=m; }
    out.skipped=off.length; out.revealed=rev.length; let to=null; const ok=await Promise.race([job.then(()=>true,()=>true),new Promise(r=>{ to=setTimeout(()=>r(false),Math.max(0,left())); })]); clearTimeout(to);
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
  const NEXT={ xinsheng:['wenzhou'], wenzhou:['cafe'], cafe:['wenzhou'] };   /* 溫州街只從新生南路進出（WZ-ENTRY-XINSHENG-1103，X199）：原本 gongguan:['wenzhou']（公館巷口拿掉）*/
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
    let rv=new Set(); const tried=new WeakSet(), need=m=>!tried.has(m)&&!R.properties.get(m).currentProgram, shown=o=>{ for(let p=o;p;p=p.parent) if(!p.visible&&!rv.has(p)) return false; return true; };   /* rv＝這一刻鏡頭看不到才藏起來的（revealList：鏡頭外的人、淡出的牆、窗景片、先生好的客人）：照樣編（BUG-RUN-STUTTER-1112）；R.compile 不看 visible */   /* tried：試過的材質不再排（編不起來的不會一直重排）*/
    let queue=[], idle=0; const loose=new WeakSet(), settled=new WeakSet();
    const settle=()=>{ let n=0; for(const pg of (R.info.programs||[])){ if(settled.has(pg)) continue; if(par&&pg.isReady&&!pg.isReady()) continue;
        try{ pg.getUniforms(); }catch(e){ console.warn('warmup settle',e); } settled.add(pg); n++; if(n>=maxProg) break; } out.settled=(out.settled|0)+n; return n; };
    const unsettled=()=>(R.info.programs||[]).some(pg=>!settled.has(pg));   /* 不在場景裡的（路人底模、遠距離版本）：沒有 parent 也要編 */
    const scan=()=>{ queue=[]; rv=new Set(revealList(E)); out.revealed=rv.size; E.scene.traverse(o=>{ if(!(o.isMesh||o.isPoints||o.isLine||o.isSprite)||!o.material) return; const ms=mats(o); if(!ms.every(isMat)||!ms.some(need)) return;
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
  /* 每間店的櫥窗四角（PLACE-GATE-WINDOW-RECT-1112，BB-C 2026-11-12）：地點關卡第二層要比「店外看到的」和「走進去的」——整條街的玻璃是同一塊網格，探針分不出每間店自己的那一段。
     這裡照 Z3.shopInsideReal 那張表（玻璃面中心 cx,cz、半寬 ex,ez、室內高 h、室內模型中心 x,z）算：
     回傳 [{id,place,corners:[[x,y,z]×4]（左下、右下、右上、左上，從街上看）,center:[x,y,z],normal:[nx,0,nz]（朝街上）,w,h}]。沒有 shopReal 的區域＝[]。*/
  function shopWindowRects(zone){ const R=zone&&zone.shopReal; if(!R||!Array.isArray(R.shops)) return []; const out=[];
    for(const q of R.shops){ if(!q||typeof q.cx!=='number'||typeof q.cz!=='number') continue; const ex=+q.ex||0, ez=+q.ez||0, h=+q.h||3; let nx=q.cx-(+q.x||0), nz=q.cz-(+q.z||0); const nl=Math.hypot(nx,nz)||1; nx/=nl; nz/=nl;
      /* 從街上看的左右：站在玻璃外面往店裡看，右手邊＝(−nz, nx) 的反方向 */ const tx=nz, tz=-nx, hw=Math.hypot(ex,ez), sx=tx*hw, sz=tz*hw;
      out.push({id:q.id,place:q.place,w:+(hw*2).toFixed(3),h,center:[q.cx,h/2,q.cz],normal:[+nx.toFixed(4),0,+nz.toFixed(4)],
        corners:[[q.cx-sx,0,q.cz-sz],[q.cx+sx,0,q.cz+sz],[q.cx+sx,h,q.cz+sz],[q.cx-sx,h,q.cz-sz]].map(c=>c.map(v=>+v.toFixed(3)))}); }
    return out; }
  return {B1C,wzViewSwap,GG_VIEW,WZ_VIEW,WZ_AA_NIGHTVIEW,ggViewPanes,shopViewPane,ggShopLit,openOnly,shopInsideLit,shopInsideReal,shopRealGlow,shopSignLit,l118ClosedLook,wzShopReal,WZ_GLOW_ONLY,shopWindowRects,BIKE_RACKS,XSG,ZONES,SHOP_IN,attachWenzhouModel,attachWzScooters,room,desk,chair,glowTex,attachRoomGLB,roomLightmap,roomDarkMap,seatFold,roomBackdrop,attachDormInterior,glowBatch:wzGlowBatch,wzParkSeason,wzCatModel,wzCatSpot,fairDayKey,fairExpoFront,isExpoDay,EXPO_DAYS,pothosSize,prewarm,prefetchNext,warmup,PROP_BLOCKS:{wenzhou:WZ_PROP_BLOCKS,gongguan:GG_PROP_BLOCKS},propBlocks,navNotch,NAV_NOTCHES,shopShutters,revealList};   /* attachRoomGLB：社科院圖書館（src/soclib3d.js）也用這個接法 ；attachDormInterior：宿舍 205（rooms_glb3d.js 的 dorm_interior，和祐廷的房間同一型）；roomLightmap：霖澤館大廳（src/building3d.js 的 attachFormal）也用 */
})();

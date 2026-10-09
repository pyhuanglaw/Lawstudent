/* ===== 世界區域定義：台大核心校園（法學院→校園道路→椰林大道→校門）、公館、溫州街、室內 ===== */
'use strict';
const Z3 = (function(){
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.95},o||{}));
  const texMat=(t,rep,o)=>{ const m=new THREE.MeshStandardMaterial(Object.assign({map:t,roughness:0.95,metalness:0},o||{})); return m; };
  function ground(g,w,d,tex,rep,x,z,y){ const t=tex.clone(); t.needsUpdate=true; t.repeat.set(rep[0],rep[1]); const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),texMat(t)); m.rotation.x=-Math.PI/2; m.position.set(x||0,y||0,z||0); m.receiveShadow=true; g.add(m); return m; }
  function strip(g,x0,z0,x1,z1,w,tex,rep){ const dx=x1-x0, dz=z1-z0; const len=Math.hypot(dx,dz); const t=tex.clone(); t.needsUpdate=true; t.repeat.set(w/rep,len/rep); const m=new THREE.Mesh(new THREE.PlaneGeometry(w,len),texMat(t)); m.rotation.x=-Math.PI/2; m.rotation.z=-Math.atan2(dx,dz); m.position.set((x0+x1)/2,0.02,(z0+z1)/2); m.receiveShadow=true; g.add(m); return m; }
  function curb(g,x0,z0,x1,z1,w){ const dx=x1-x0, dz=z1-z0; const len=Math.hypot(dx,dz); for(const s of [-1,1]){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.14,len),M('#d9d3c6')); const ang=-Math.atan2(dx,dz); m.rotation.y=ang; m.position.set((x0+x1)/2+Math.cos(ang)*s*(w/2+0.12),0.07,(z0+z1)/2-Math.sin(ang)*s*(w/2+0.12)); g.add(m); } }
  // ---- 資產層：樹／長椅／小道具（有 GLB 就用 GLB，沒有就 fallback 到 W3 placeholder）----
  let treeIdx=0, leafyCount=0; const TREE=(scale)=>{ treeIdx++; /* 闊葉樹（townkit 葉片卡，和溫州街同一套）；舊的 GLB 方塊葉樹／針葉樹看起來不像台北的樹，只在 TK 不存在時退回 */ if(typeof TK!=='undefined'&&TK.tree) return TK.tree(6.4*(scale||1)); const useLeafy=(treeIdx%2===1)&&leafyCount<14; if(useLeafy) leafyCount++; return ASSETS.get(useLeafy?'tree.leafy':'tree.conifer',{height:6*(scale||1)}); };
  let palmIdx=0; const PALM=(h)=>{ palmIdx++; /* 大王椰子：townkit 程序化（灰白筆直樹幹＋綠色葉鞘＋羽狀葉）；舊 GLB 是彎曲的椰子樹，只在 TK 不存在時退回 */ if(typeof TK!=='undefined'&&TK.royalPalm) return TK.royalPalm((h||9)*1.35,palmIdx); return ASSETS.get('tree.palm',{height:h||9}); };
  const BENCH=()=>ASSETS.get('prop.bench',{});
  const PROP=(g,key,x,y,z,ry,scale)=>{ const o=ASSETS.get(key,{}); if(!o) return null; o.position.set(x,y,z); if(ry) o.rotation.y=ry; if(scale) o.scale.multiplyScalar(scale); g.add(o); return o; };
  function place(g,obj,x,z,ry,scale){ obj.position.set(x,0,z); if(ry) obj.rotation.y=ry; if(scale) obj.scale.setScalar(scale); g.add(obj); return obj; }
  // 校門（CK.gate）：放好之後把本地座標的阻擋轉成導航格；門房加鏡頭碰撞（ry 只用 0、±π/2）
  // 套件物件（校門、傅鐘）的導航阻擋：userData.gate.blocks 是物件座標的 [x,z,寬,深,pad]，依擺放位置與旋轉換成區域座標（旋轉只支援 90° 的倍數）
  function placeBlocks(nav,obj,x,z,ry){ const c=Math.cos(ry||0), sn=Math.sin(ry||0), q=Math.abs(sn)>0.5;
    for(const [bx,bz,bw,bd,pad] of obj.userData.gate.blocks){ const wx=x+bx*c+bz*sn, wz=z-bx*sn+bz*c; nav.blockRect(wx,wz,q?bd:bw,q?bw:bd,0,pad); } }
  function placeGate(E,g,nav,gate,x,z,ry){ place(g,gate,x,z,ry); placeBlocks(nav,gate,x,z,ry); const c=Math.cos(ry||0), sn=Math.sin(ry||0), q=Math.abs(sn)>0.5;
    const hx=7.6, hz=-3.4; const m=new THREE.Mesh(new THREE.BoxGeometry(q?3.2:3.8,4.4,q?3.8:3.2),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x+hx*c+hz*sn,2.2,z-hx*sn+hz*c); g.add(m); E.colliders.push(m); }
  function collider(E,x,z,w,d,h,rot){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h||6,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x,(h||6)/2,z); m.rotation.y=rot||0; E.colliders.push(m); E.scene.add(m); E.zone&&E.zone.group; return m; }
  // ---------- 校園主區 ----------
  const campus={ id:'campus', name:'台大校園', indoor:false, cityLight:0.25, size:[260,170], viewFar:260, fogNear:100, build(E){   /* 第二十批：邊界外有背景了，視距拉遠（照片裡椰林大道盡頭的總圖看得清楚；從校門口看總圖約 205 m）*/
    treeIdx=0; leafyCount=0; palmIdx=0; const g=new THREE.Group(); const W=260, D=170; /* 導航格必須涵蓋法學院前庭（z 到 -124），否則霖澤館前完全不能走 */ const nav=new E3.NavGrid(W,210,0.5,-W/2,-125); const seats=[]; const lamps=[]; const buildings=[];
    // 地面：草地
    ground(g,W,D,W3.grassTex(),[W/4,D/4],0,0,0); ground(g,120,44,W3.grassTex(),[30,11],52,-106,-0.002); // 北側法學院區地面
    // 校園配置依台大校總區平面圖（map.ntu.edu.tw，2025.10.13 版）壓縮：x 往東、-z 往北；椰林大道東西向（z=0），西端大門、東端總圖書館；
    // 大道南側：傅鐘＋行政大樓；北側：文學院、校史館、農業陳列館；小椰林道（x=30）往北通法學院；醉月湖在文學院北邊。
    // 主要道路：椰林大道 東西向（z=0），從校門 x=-124 到總圖前廣場 x≈72
    strip(g,-124,0,72,0,16,W3.pathTex(),4); curb(g,-124,0,72,0,16);
    // v9.3 第十八批：大道中間 12 m 是柏油路面（黃色虛線中線、白色邊線；照使用者給的椰林大道照片），兩側各 2 m 石磚人行道（原本整條 16 m 都是淺色石磚，像廣場）。
    // 只是路面貼圖，導航不變；騎腳踏車的路人走 z=±3（路面上），行人走 z=±7（人行道上）
    { const rt=W3.canvasTex('avenueRoad2',256,256,(x,w,h)=>{ x.fillStyle='#5f5d5a'; x.fillRect(0,0,w,h); let s=17; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; for(let i=0;i<2600;i++){ const v=(r()*28)|0; x.fillStyle='rgba('+(78+v)+','+(76+v)+','+(73+v)+',0.5)'; x.fillRect(r()*w,r()*h,2,2); }
        x.fillStyle='rgba(50,48,46,0.3)'; for(let i=0;i<5;i++){ x.fillRect(0,r()*h,w,1); } x.fillStyle='#dedbd2'; x.fillRect(w*0.025,0,w*0.008,h); x.fillRect(w*0.967,0,w*0.008,h); x.fillStyle='#d9a521'; x.fillRect(w*0.493,0,w*0.014,h*0.4); }).clone(); rt.needsUpdate=true; rt.repeat.set(1,196/9);
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
    strip(g,30,0,30,-74,10,W3.pathTex(),4); curb(g,30,0,30,-74,10);
    strip(g,30,-60,110,-60,10,W3.pathTex(),4); curb(g,30,-60,110,-60,10);
    // 通往醉月湖的小路（文學院東側往北）＋湖南岸步道
    strip(g,-12,-8,-12,-51,5,W3.pathTex(),4); strip(g,-48,-51,-8,-51,4,W3.pathTex(),4);
    // 舟山路（南側，行政大樓後面）
    strip(g,-110,47,110,47,9,W3.asphaltTex(),6); curb(g,-110,47,110,47,9);
    strip(g,20,0,20,58,6,W3.pathTex(),4);
    // ---- 宿舍（舟山路南側）----
    // 校園建築套件：導航格只擋建築本體、拱廊柱子、門廊（拱廊底下可以走）；鏡頭碰撞＝建築本體＋拱廊上方的樓層（鏡頭不會穿到樓上，拱廊裡也不會被拉到臉前面）
    const ckPlace=(b,x,z,ry)=>{ place(g,b,x,z,ry); const c=Math.cos(ry||0), sn=Math.sin(ry||0), q=Math.abs(sn)>0.5; const ck=b.userData.ck; const W=(lx,lz)=>[x+lx*c+lz*sn,z-lx*sn+lz*c];
      for(const [bx,bz,bw,bd,pad] of ck.blocks){ const p=W(bx,bz); nav.blockRect(p[0],p[1],q?bd:bw,q?bw:bd,0,pad==null?0.15:pad); }
      const colBox=(lx,lz,bw,bd,y0,y1)=>{ const p=W(lx,lz); const m=new THREE.Mesh(new THREE.BoxGeometry(q?bd:bw,y1-y0,q?bw:bd),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(p[0],(y0+y1)/2,p[1]); g.add(m); E.colliders.push(m); };
      if(ck.cols){ for(const [lx,lz,bw,bd,y0,y1] of ck.cols) colBox(lx,lz,bw,bd,y0,y1); }   /* 套件自己給的鏡頭碰撞（霖澤館：門廊下面是空的）*/
      else { colBox(0,-ck.ad/2,ck.w,ck.d-ck.ad,0,ck.H); if(ck.ad>0) colBox(0,ck.d/2-ck.ad/2,ck.w,ck.ad,ck.gfh-0.35,ck.H); } };
    // 男一舍：宿舍沒有拱廊——淺灰米色面磚、方窗、平屋頂、一樓正面中間是大門＋小平頂門廊（佔地、門口位置和舊版相同）
    const dormB=CK.hall({w:36,d:14,floors:5,gfh:3.6,fh:3.1,wall:'#cfc6b4',trim:'#e8e2d6',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4},sign:'男一舍'}); ckPlace(dormB,20,68,Math.PI); buildings.push(dormB); for(const x of [-4,44]){ const b=TREE(1.2); place(g,b,x,60,0); nav.blockCircle(x,60,0.9); }
    // ---- 校門（西端）----
    // v9.3 第十四批：CK.gate（面磚門柱＋石材、打開的鑄鐵門、矮牆、校名石牌、門房在校內）；校外（本地 +z）朝西。開口寬度和舊版相同
    const gate=CK.gate(); placeGate(E,g,nav,gate,-124,0,-Math.PI/2);
    // 圍牆（校門兩側）
    for(const s of [-1,1]){ const wall=new THREE.Mesh(new THREE.BoxGeometry(1,1.8,70),texMat(W3.brickTex('#b8735a'))); wall.position.set(-124,0.9,s*45); g.add(wall); nav.blockRect(-124,s*45,1.2,70,0,0.3); }
    // ---- 椰林大道：大王椰子 ----
    for(let x=-110;x<=70;x+=7.5){ for(const s of [-1,1]){ palmIdx++; const p=TK.royalPalm((14.5+((x*7)%3)*0.8)*1.35,palmIdx,{crown:0.66});   /* v9.3 第十八批：照椰林大道照片拉高到約 20 m、樹冠相對變小 */ place(g,p,x,s*9.5,(x*0.3)%6.28); nav.blockCircle(x,s*9.5,0.5); } }
    // 兩側草地小徑與長椅、腳踏車
    for(let x=-100;x<=50;x+=25){ for(const s of [-1,1]){ const b=BENCH(); place(g,b,x,s*13,s>0?Math.PI:0); nav.blockRect(x,s*13,2.0,0.7,0); seats.push({x,z:s*13+(s>0?-0.55:0.55),yaw:s>0?Math.PI:0,label:'坐在椰林大道的長椅上'}); } }
    for(let x=-90;x<=40;x+=32){ const r=W3.bikeRack(7); place(g,r,x+8,-16,0); nav.blockRect(x+8,-16,5,1.4,0); }
    for(let x=-105;x<=55;x+=22){ for(const s of [-1,1]){ const l=W3.lampPost(); place(g,l,x,s*11,s>0?0:Math.PI); lamps.push(l); nav.blockCircle(x,s*11,0.25); } }
    // ---- 傅鐘（大道南側小廣場，行政大樓正前方）----
    const plaza=ground(g,28,12,W3.stoneTex('#e3d9c6'),[7,3],-38,17,0.015); const bell=CK.bell(); place(g,bell,-38,16.5,Math.PI); placeBlocks(nav,bell,-38,16.5,Math.PI);   /* v9.3 第十六批：校園套件的鐘亭，石碑朝北對著大道 */ for(const [x,z] of [[-51,21.5],[-25,21.5]]){ const b=TREE(1.3); place(g,b,x,z,0); nav.blockCircle(x,z,0.9); }
    for(const x of [-46,-30]){ const b=BENCH(); place(g,b,x,21,Math.PI); nav.blockRect(x,21,2,0.7,0); seats.push({x,z:21-0.55,yaw:Math.PI,label:'坐在傅鐘旁的長椅'}); }
    // ---- 行政大樓（大道南側、傅鐘後面）：大圓柱、對稱，正面朝北對著椰林大道 ----
    // v9.3：台大日治時期建築語彙（src/campuskit3d.js）：面磚、一樓拱廊、拱窗、石材腰帶與簷口、寄棟屋頂、中央門廊（佔地不變；門廊的柱墩與側牆另外加碰撞）
    const admin=CK.hall({w:46,d:16,floors:3,gfh:4.2,fh:3.4,wall:'#cdb48e',trim:'#e8e0cf',roof:'#4a3a33',roofH:4.2,arcade:true,porch:{bays:3,depth:3.0,pediment:false},sign:'行政大樓'}); ckPlace(admin,-38,33,Math.PI); buildings.push(admin);
    // ---- 文學院（大道北側，正對行政大樓）：仿羅馬式拱窗 ----
    const arts=CK.hall({w:40,d:18,floors:2,gfh:4.8,fh:4.4,wall:'#9b5a42',trim:'#d8cfbd',roof:'#43342e',roofH:4.8,arcade:true,porch:{bays:3,depth:3.0,pediment:true,pedH:1.8},sign:'文學院'}); ckPlace(arts,-38,-34,0); buildings.push(arts); strip(g,-38,-8,-38,-24,4,W3.pathTex(),4);
    // ---- 農業陳列館（洞洞館）北側近校門 ----
    // 農業陳列館（洞洞館）：上層四面是圓洞鏤空牆、一樓玻璃＋方柱、平屋頂寬屋簷（CK.pavilion；佔地和舊版相同）
    const hole=CK.pavilion({w:22,d:14,gfh:4.0,h:9,sign:'農業陳列館'}); ckPlace(hole,-104,-30,0); buildings.push(hole);
    // ---- 校史館（舊總圖）：大道北側、靠近大門（農業陳列館東邊），紅磚拱窗、圓石柱、屋瓦 ----
    const hist=CK.hall({w:24,d:16,floors:2,gfh:5.0,fh:4.6,wall:'#a25d43',trim:'#d8cfbd',roof:'#43342e',roofH:4.4,arcade:true,porch:{bays:3,depth:2.6,pediment:true,pedH:1.6},sign:'校史館'}); ckPlace(hist,-77,-29,0); buildings.push(hist);
    // ---- 總圖書館（椰林大道東端盡頭，正面朝西對著大道）----
    const lib=CK.hall({w:60,d:26,floors:4,gfh:5.0,fh:4.3,wall:'#9e5a44',trim:'#dcd3c2',roof:'#4a3a33',roofH:4.0,arcade:true,arcDepth:3.0,porch:{bays:5,depth:4.2,pediment:true,pedH:3.0,h:9.0,ys:5.6},tower:{w:9,h:9},sign:'總圖書館'}); ckPlace(lib,100,0,-Math.PI/2); buildings.push(lib);
    // ---- 小椰林道（x=30，從椰林大道往北通到法學院）：兩排較矮的大王椰子 ----
    for(let z=-14;z>=-70;z-=8){ for(const x of [24.2,35.8]){ if(x>30&&z>-66&&z<-54) continue; const p=PALM(7+((-z*3)%2)); place(g,p,x,z,(-z*0.7)%6.28); nav.blockCircle(x,z,0.45); } }
    // ---- 醉月湖（文學院北邊）----
    const lakeU=lake(g,nav,-30,-66,seats,lamps);
    ground(g,124,44,W3.grassTex(),[31,11],-70,-106,-0.003); for(let x=-62;x<=0;x+=7){ const t=TREE(1.15+((-x)%3)*0.1); place(g,t,x+((x*13)%3),-88-((x*7)%4),x*0.3); }   // 湖北邊（不能走的區域）：補地面＋一排樹，遮住地面盡頭
    // ---- 法學院區（東北上方）：霖澤館 ＋ 萬才館 ＋ 社科院 ----
    ground(g,72,24,W3.stoneTex('#e6dccb'),[18,6],61,-94,0.012); strip(g,30,-70,30,-84,10,W3.pathTex(),4); strip(g,79.5,-64,79.5,-84,6,W3.pathTex(),4);   /* 第十九批：萬才館入口在正面偏西（x=79.5），小路跟著移 */
    // 法學院前庭：樹列、花圃、矮籬
    for(const x of [22,38,54,70,86]){ const b=TREE(1.15+((x/16)%2)*0.1); place(g,b,x,-80,x*0.4); nav.blockCircle(x,-80,0.9); }
    for(const x of [30,46,62,88]){ const pl=W3.planter(); place(g,pl,x,-83.5,0); nav.blockRect(x,-83.5,1.2,0.5,0); }   /* 第十九批：x=78 的花圃會擋在往萬才館的新小路上，移到 88 */
    for(const x of [12,100]){ const t=TREE(1.3); place(g,t,x,-96,0); nav.blockCircle(x,-96,0.9); const t2=TREE(1.0); place(g,t2,x+(x<50?-6:6),-108,1); nav.blockCircle(x+(x<50?-6:6),-108,0.8); }
    /* 第十九批拿掉兩段矮籬 (48,-106.5)、(74,-106.5)：大半埋在霖澤館、萬才館的牆裡 */
    // 霖澤館、萬才館（v9.3 第十九批，照使用者提供的照片重做，CK.lawhall）：灰色花崗石下三層＋紅磚方格上層＋寬花崗石轉角＋薄屋頂板。
    // 霖澤館：穿過整棟的三層樓高門廊（穿堂）、整排寬台階；萬才館：正面偏西的玻璃入口＋往下張開的弧形大台階、西側兩層樓低樓。佔地中心和舊版相同
    const linze=CK.lawhall({w:40,d:18,floors:8}); ckPlace(linze,34,-112,0); buildings.push(linze);
    const wancai=CK.lawhall({entry:'stairs',w:30,d:20,floors:9,entryX:-8.5,annex:true}); ckPlace(wancai,88,-112,0); buildings.push(wancai);   /* 入口（台階下緣）：x=88-8.5=79.5、z=-112+doorZ≈-95.0 */
    // 社會科學院：現代白色系館（白色粉光牆、每層橫向長窗、一樓玻璃大廳＋薄雨遮）；佔地和舊版相同，門前的白色樹狀柱保留
    const soc=CK.modern({w:56,d:22,floors:4,gfh:4.4,fh:3.85,sign:'社會科學院'}); ckPlace(soc,110,-70,-Math.PI/2); buildings.push(soc);
    // 社科院前的樹狀白柱意象（圖書館的柱）
    for(let i=0;i<7;i++){ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.35,7,10),M('#f4f1ea')); col.position.set(96,3.5,-90+i*6); g.add(col); const cap=new THREE.Mesh(new THREE.CylinderGeometry(1.6,0.6,0.8,10),M('#f4f1ea')); cap.position.set(96,7.2,-90+i*6); g.add(cap); nav.blockCircle(96,-90+i*6,0.5); }
    // 法學院廣場：長椅、腳踏車、樹、公告欄、販賣機
    for(const x of [40,70]){ const b=BENCH(); place(g,b,x,-88,0); nav.blockRect(x,-88,2,0.7,0); seats.push({x,z:-87.45,yaw:0,label:'坐在霖澤館前的長椅'}); }
    
    { const r=W3.bikeRack(9); place(g,r,58,-102,0); nav.blockRect(58,-102,6,1.4,0); const r2=W3.bikeRack(6); place(g,r2,10,-100,0); nav.blockRect(10,-100,4,1.4,0); }
    { const bb=W3.bulletin(); place(g,bb,16.6,-100.6,0); nav.blockRect(16.6,-100.6,2.6,0.4,0); /* v9.3 第十九批：原本掛在霖澤館一樓拱廊的內牆上；新的霖澤館沒有拱廊、正面整排是台階，移到台階西端外面的鋪面上 */ const v=W3.vending(); place(g,v,13.5,-107.5,-Math.PI/2); nav.blockRect(13.5,-107.5,0.9,1.2,0); /* 靠霖澤館西側牆（舊位置一半埋在建築轉角裡）*/ }
    for(const [x,z] of [[30,-86],[62,-86],[94,-86],[51,-100.5],[69,-98.5]]){ /* 後兩盞原本在 (46,-108)、(76,-108)：埋在霖澤館、萬才館的牆裡，第十九批移到門前 */ const l=W3.lampPost(); place(g,l,x,z,Math.PI/2); lamps.push(l); nav.blockCircle(x,z,0.25); }
    for(const [x,z] of [[8,-70],[8,-50],[52,-50],[-54,-19],[-5,-16],[40,-20],[-95,-12],[-62,-56],[0,-56],[-96,24],[-82,31],[-68,24],[78,-38],[64,-44]]){   /* 第十八批拿掉：(8,-30)、(20,-20)、(52,-30)、(66,-28)（新系館的位置）、(-10,18)、(10,18)、(50,18)（換成大道南側的大樹牆）*/ const b=TREE(1+((x+z)%3)*0.2); place(g,b,x,z,(x+z)*0.3); nav.blockCircle(x,z,0.8); }
    // 花圃
    for(const x of [-64,-48]){ const p=W3.planter(); place(g,p,x,-13,0); nav.blockRect(x,-13,1.2,0.5,0); }
    // 社團招生攤位（傅鐘廣場東側，面向椰林大道）：摺疊桌、布條、傳單
    { const SX=-18, SZ=14.5; const st=new THREE.Group(); const tb=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.05,0.7),M('#e8e2d6')); tb.position.set(0,0.74,0); st.add(tb); for(const [sx,sz] of [[-0.8,-0.25],[0.8,-0.25],[-0.8,0.25],[0.8,0.25]]){ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.72,0.04),M('#3a3f46')); leg.position.set(sx,0.36,sz); st.add(leg); } const cloth=new THREE.Mesh(new THREE.BoxGeometry(1.85,0.6,0.02),M('#2f5d50')); cloth.position.set(0,0.42,0.36); st.add(cloth); const banner=W3.signPlane('法律服務社 招生中 ・ 免費法律諮詢',1.8,0.5,{color:'#ffffff',size:40}); banner.position.set(0,0.42,0.38); st.add(banner); const fly=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.02,0.42),M('#ffffff')); fly.position.set(-0.4,0.78,0); st.add(fly); st.position.set(SX,0,SZ); st.rotation.y=Math.PI; g.add(st); nav.blockRect(SX,SZ,1.9,0.8,0,0.1); E.interactables.push({x:SX,z:SZ-1,radius:1.5,label:'看法律服務社的招生攤位',notice:'lawclub'}); }
    // 路旁散置腳踏車
    for(const [x,z] of [[-60,-15.5],[-57,15.5],[0,-15.5],[24,-64],[36,-64]]){ const b=W3.bike(['#3a6fb0','#8c3b47','#2f5d50','#e0b95b'][(x+z)&3]); place(g,b,x,z,Math.PI/2); nav.blockRect(x,z,1.7,0.6,0); }   /* v9.3 第十八批：車子沿 x 方向停，導航原本擋成沿 z 方向（走得過車頭車尾、旁邊空地反而不能走）*/
    // ---- v9.3 第十八批：校園加密 ----
    // 真實的椰林大道兩側幾乎整排都是系館（離大道 20–30 m、前面是草地）；原本這裡大道東半段兩側、行政大樓東邊、男一舍兩側都是空草地。
    // 補上沒有掛名字的系館（不冒用真實系館的名字和位置），同一套校園套件語彙：紅磚／面磚、一樓拱廊、拱窗或方窗
    { const fill=[
        [CK.hall({w:26,d:14,floors:3,gfh:4.4,fh:3.8,wall:'#c8a27c',trim:'#e6dfd0',roof:'#4a3a33',roofH:3.8,arcade:true,porch:{bays:1,depth:2.4,pediment:false}}),7,-28,0],          // 大道北側、文學院東邊
        [CK.hall({w:28,d:16,floors:4,gfh:4.4,fh:3.6,wall:'#a35c48',trim:'#ddd5c6',roofType:'flat',win:'rect',arcade:true,porch:{bays:3,depth:2.6,style:'flat'}}),57,-34,0],   // 大道北側、小椰林道東邊
        [CK.hall({w:24,d:14,floors:3,gfh:4.2,fh:3.6,wall:'#9b5a42',trim:'#d8cfbd',roof:'#43342e',roofH:3.6,arcade:true,porch:{bays:1,depth:2.4,pediment:true,pedH:1.4}}),2,33,Math.PI],   // 大道南側、行政大樓東邊
        [CK.hall({w:34,d:14,floors:4,gfh:4.2,fh:3.5,wall:'#d2c3a5',trim:'#ebe4d6',roofType:'flat',win:'rect',arcade:true,porch:{bays:3,depth:2.6,style:'flat'}}),45,33,Math.PI],   // 大道南側、往宿舍的路東邊
        [CK.hall({w:30,d:13,floors:5,gfh:3.6,fh:3.1,wall:'#bfb5a3',trim:'#e4ddd0',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4}}),-34,68,Math.PI],   // 舟山路南側、宿舍區
        [CK.hall({w:30,d:13,floors:5,gfh:3.6,fh:3.1,wall:'#c9b49a',trim:'#e8e2d6',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4}}),74,68,Math.PI],
        [CK.hall({w:34,d:13,floors:4,gfh:3.8,fh:3.3,wall:'#c4b29a',trim:'#e6dfd0',roofType:'flat',win:'rect',arcade:false,porch:{bays:1,depth:2.0,style:'flat',h:3.4}}),-92,66,Math.PI]];   // 第二十批：舟山路西段南側（360° 盤點：這裡往南看是一整片空草地）
      for(const [b,x,z,ry] of fill){ ckPlace(b,x,z,ry); buildings.push(b); }
      // 系館前的樹列、大道外側的樹、宿舍區與校園邊緣的樹帶（擋住草地直接接到遠景的盡頭）
      const rows=[
        [-104,36],[-90,41],[-76,38],[-100,16],[-112,26],[74,-12],[78,14],[68,26],
        [-60,58],[-12,60],[54,58],[93,60],[104,66]];
      for(let x=-116;x<=116;x+=11){ if(x>-52&&x<-16) continue; if(x>-4&&x<44) continue; if(x>56&&x<92) continue; rows.push([x,80]); }
      for(let z=-30;z<=40;z+=10){ rows.push([121,z+((z*7)%3)]); }   /* 總圖東邊；社科院在 z<-42 */
      for(const [x,z] of rows){ const t=TREE(1+((Math.abs(x*3+z))%4)*0.12); place(g,t,x,z,(x+z)*0.37); nav.blockCircle(x,z,0.8); }
      // 大道兩側的大樹牆：椰子樹列後面（z=±17.5），約 6 m 一棵、高 11–13 m（樹冠相連）；路口、門口、停車架、傅鐘廣場、社團攤位留空。整排合成一個網格（一側 2 個 draw call）
      for(const side of [-1,1]){ const skip=side<0?[[-116,-111],[-84,-70],[-85,-79],[-53,-47],[-46,-30],[-21,-15],[-15,-9],[-7,2],[2,12],[11,17],[23,37],[37,43],[43,49],[50,64]]:[[-116,-111],[-53,-23],[-22,-14],[-2,6],[16,24],[39,51]];
        const rowG=new THREE.Group(); let k=0; for(let x=-108;x<=66;x+=6){ const jx=x+((x*13)%5)*0.35; if(skip.some(([a,b])=>jx>a&&jx<b)) continue; k++; const t=TK.tree(6.4*(1.75+((k*7)%4)*0.1),k+(side>0?50:0)); t.position.set(jx,0,side*(17.5+((k*5)%3)*0.5)); t.rotation.y=k*1.3; rowG.add(t); nav.blockCircle(t.position.x,t.position.z,0.8); }
        g.add(W3.mergeGroup(rowG)); }
      // 系館門口的腳踏車架（台大的系館前面一定停滿腳踏車）
      for(const [x,z,ry] of [[-6,24,0],[12,24,0],[33,24,0],[57,24,0],[-1,-17.2,Math.PI],[46,-23.5,Math.PI],[68,-23.5,Math.PI]]){ const r=W3.bikeRack(7); place(g,r,x,z,ry); nav.blockRect(x,z,4.6,1.6,0); } }
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
      ground(far,820,820,W3.asphaltTex(),[164,164],0,-20,-0.06);
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
      const city=[], halls=[];
      { let gx=-68; [10,8,12,10,8,8,9,9,8,9,9,10,8,9,9].forEach((w,i,a)=>{ const W=w+(i<8&&i<a.length-1?1.2:0); city.push({x:-189,z:gx+W/2,w:W,d:16,floors:4+((i*5)%4),gh:4.2,ry:Math.PI/2,color:WALLC[i%7]}); gx+=W; });   // 公館南側那一排（gx -68–77.6）
        city.push({x:-189,z:-81,w:14,d:16,floors:5,gh:4.2,ry:Math.PI/2,color:'#cdbfa8'});   // 往溫州街巷口的轉角公寓（gx -88–-74；-74–-68 是巷子）
        for(let z=77.6;z<152;){ const w=8+Math.round(H(z,1)*5); city.push({x:-189,z:z+w/2,w,d:16,floors:4+Math.floor(H(z,2)*4),gh:4.2,ry:Math.PI/2,color:WALLC[Math.floor(H(z,3)*7)]}); z+=w; }
        for(let z=-88;z>-142;){ const w=8+Math.round(H(z,1)*5); city.push({x:-189,z:z-w/2,w,d:16,floors:4+Math.floor(H(z,2)*4),gh:4.2,ry:Math.PI/2,color:WALLC[Math.floor(H(z,3)*7)]}); z-=w; }
        for(let z=-140;z<154;){ const w=14+Math.round(H(z,4)*8); city.push({x:-212,z:z+w/2,w,d:18,floors:6+Math.floor(H(z,5)*8),gh:4.2,ry:Math.PI/2,color:TALLC[Math.floor(H(z,6)*7)],shop:false}); z+=w+2+Math.floor(H(z,19)*3)*3; }   // 第二排（較高、高低錯落、中間有縫）
        // 北：馬路對面兩排（立面朝 +z）
        for(let x=-260;x<262;){ const w=10+Math.round(H(x,7)*8); city.push({x:x+w/2,z:-171,w,d:16,floors:5+Math.floor(H(x,8)*6),gh:4.0,ry:0,color:WALLC[Math.floor(H(x,9)*7)]}); x+=w; }
        for(let x=-262;x<262;){ const w=16+Math.round(H(x,10)*10); city.push({x:x+w/2,z:-194,w,d:18,floors:6+Math.floor(H(x,11)*8),gh:4.0,ry:0,color:TALLC[Math.floor(H(x,12)*7)],shop:false}); x+=w+3+Math.floor(H(x,20)*3)*3; }
        // 東、南：再遠一排城市大樓（基隆路、長興街方向；只是遠景）
        for(let z=-230;z<230;){ const w=14+Math.round(H(z,13)*10); city.push({x:214,z:z+w/2,w,d:16,floors:5+Math.floor(H(z,14)*5),gh:4.0,ry:-Math.PI/2,color:TALLC[Math.floor(H(z,15)*7)]}); z+=w+2; }
        for(let x=-200;x<214;){ const w=14+Math.round(H(x,16)*10); city.push({x:x+w/2,z:150,w,d:16,floors:5+Math.floor(H(x,17)*5),gh:4.0,ry:Math.PI,color:TALLC[Math.floor(H(x,18)*7)]}); x+=w+2; }
        // 校園外圍的系館（沒有名字）：北側中庭那一棟（從霖澤館穿堂看得到）、東北、東南、南側宿舍區
        halls.push({x:34,z:-132,w:24,d:8,floors:4,ry:0,color:'#a9a7a2',roof:'flat',shop:false},{x:84,z:-131,w:20,d:9,floors:3,ry:0,color:'#b46e55'});
        for(const [x,z,w,f,flat] of [[140,-120,36,5,1],[140,-75,46,4,0],[172,-100,30,3,0],[140,72,44,4,0],[140,118,36,5,1],[172,95,30,3,0]]) halls.push({x,z,w,d:16,floors:f,ry:-Math.PI/2,color:HALLC[Math.floor(H(x,z)*5)],roof:flat?'flat':'hip'});
        for(const [x,w,f] of [[-100,40,6],[-50,36,5],[0,40,6],[50,38,5],[100,40,6]]) halls.push({x,z:104,w,d:14,floors:f,ry:Math.PI,color:['#cfc6b4','#c9b49a','#bfb5a3','#d2c3a5'][Math.floor(H(x,5)*4)],roof:'flat',shop:false}); }
      far.add(TK.bgCity(city,{style:'city'})); far.add(TK.bgCity(halls,{style:'campus'}));
      // 校園圍牆（北側＋西側往南北延長）＋牆頭石材
      { const wb=new TK.Bin(); const wt=TK.M('bgWallM',()=>TK.std({map:TK.tileTex('#b8735a','#9c8676','bgWall'),roughness:0.9})); wb.add(wt,TK.boxG(254,1.8,0.8,1.0),3,0.9,-141); wb.add(TK.paint('#d9d3c6'),TK.boxG(254.4,0.14,1.0),3,1.87,-141); wb.add(wt,TK.boxG(0.8,1.8,61,1.0),-124,0.9,-110.5); wb.add(wt,TK.boxG(0.8,1.8,70,1.0),-124,0.9,115); wb.build(far); }   /* 西側圍牆原本只有 z -80–80，往北接到北側圍牆、往南延伸到宿舍區後面 */
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
        for(let z=-98;z>=-136;z-=9.5) for(let x=-116;x<=2;x+=12) T(x+H(x,z)*5,z+H(z,x)*3);   // 醉月湖北邊（走不到）一路到圍牆的樹林
        for(const x of [130,142,155]) for(let z=-46;z<=46;z+=9) T(x+H(x,z)*3,z+H(z,x)*3);   // 總圖後面的樹帶
        for(let x=-124;x<=200;x+=13) T(x+H(x,9)*2,99);   // 南側道路旁
        const pm=W3.mergeGroup(props); pm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); far.add(pm);
        const tm=W3.mergeGroup(trees); tm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); far.add(tm); }
      g.add(far); }
    // 邊界
    nav.blockOutside(-123,-124,125,84); nav.blockRect(-59,-104,128,40,0,0); nav.blockRect(112.5,-104,25,40,0,0); nav.blockRect(-123,0,2,8,0,0); // 北側只留法學院前庭（x 5–100）可走；校門通道保留
    // 第二十批：法學院後面（建築背面到圍牆）不能走——入口都在正面，霖澤館穿堂與後面的台階不能走；兩棟之間、霖澤館西側用矮籬收邊（原本走得到背面 3 m 寬的窄縫，盡頭就是地圖邊界）
    nav.blockRect(52.5,-121.25,95,5.5,0,0); { const hb=new TK.Bin(); for(const [x0,x1] of [[5,14],[54,63]]) for(let x=x0+0.5;x<=x1-0.4;x+=0.85) TK.plantClump(hb,x,0,-118.3+((Math.round(x*7))%3-1)*0.08,1.0+((Math.round(x*3))%3)*0.08,6,[0.62,0.82,0.6]); const hg=new THREE.Group(); hb.build(hg); g.add(hg); }   /* 矮灌木（和椰林大道的杜鵑叢同一套）*/
    // 校門通道格：確保 -124..-118 之間可走（往公館）
    for(let z=-4;z<=4;z+=0.5) for(let x=-127;x<=-118;x+=0.5){ const [cx,cz]=nav.toCell(x,z); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    // 碰撞盒（鏡頭用）
    /* 校園建築的鏡頭碰撞都在 ckPlace 裡（套件建築：行政大樓、文學院、校史館、總圖、霖澤館、萬才館、男一舍、社科院、農業陳列館）*/
    // 燈光光暈
    for(const l of lamps){ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd88a,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(3,3,1); glow.position.set(0,3.9,0.75); l.add(glow); glow.visible=false; E.lampGlows.push(glow); const pool=new THREE.Mesh(new THREE.CircleGeometry(4.2,16),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(0,0.03,0.75); l.add(pool); pool.visible=false; E.lampGlows.push(pool); }
    // 出口
    const exits=[{x:-126,z:0,r:3,to:'gongguan',spawn:{x:-2.5,z:-29,yaw:0},label:'走出校門'},{x:34,z:-99.8,r:1.6,to:'classroom',spawn:{x:0,z:5,yaw:Math.PI},label:'進入霖澤館',door:true},{x:79.5,z:-94.4,r:1.6,to:'wancai',spawn:{x:0,z:5,yaw:Math.PI},label:'進入萬才館',door:true},{x:86.4,z:0,r:3.8,to:'library',spawn:{x:0,z:7,yaw:Math.PI},label:'進入總圖書館',door:true},{x:20,z:59.6,r:2.6,to:'dorm',spawn:{x:0,z:2.4,yaw:Math.PI},label:'回宿舍',door:true}];
    // 總圖：門在一樓拱廊裡面，互動範圍從門廊前緣涵蓋到門口；霖澤館、萬才館（第十九批）：入口比地面高、前面是大台階（不能走），互動點在台階下面（半徑 1.6；出來的出生點離互動點 2.2 m，不會一出來就跳出按鈕）
    for(const ex of exits){ E.interactables.push({x:ex.x,z:ex.z,radius:ex.r,label:ex.label,exit:ex}); }
    // 座位互動
    for(const s of seats){ E.interactables.push({x:s.x,z:s.z,radius:1.6,label:s.label,seat:s}); }
    const zone={group:g,nav,spawn:{x:34,z:-98,yaw:0},seats,lamps,buildings,exits,
      onLamps(on){ for(const b of buildings) W3.setNight(b,on); CK.setNight(on); },   // 校園套件的窗戶晚上透出暖光
      update(dt,E){ updateLake(lakeU,E); },
    };
    return zone; } };
  // ---- 醉月湖：不規則湖面（反射天空顏色＋細碎波紋＋太陽反光）、石砌湖岸、湖心亭＋木棧道（可以走上去）、湖邊樹叢與蘆葦、長椅、路燈 ----
  function lake(g,nav,cx,cz,seats,lamps){
    const A=16.5, B=9.2, N=80; const rad=t=>1+0.10*Math.sin(3*t+0.6)+0.05*Math.cos(5*t+1.3);
    const P=[]; for(let i=0;i<N;i++){ const t=i/N*Math.PI*2, r=rad(t); P.push([cx+Math.cos(t)*A*r, cz+Math.sin(t)*B*r]); }
    const NR=P.map((p,i)=>{ const a=P[(i-1+N)%N], b=P[(i+1)%N]; let nx=b[1]-a[1], nz=-(b[0]-a[0]); const l=Math.hypot(nx,nz)||1; nx/=l; nz/=l; if(nx*(p[0]-cx)+nz*(p[1]-cz)<0){ nx=-nx; nz=-nz; } return [nx,nz]; });
    // 湖心亭與木棧道（從南岸步道走進湖裡）
    const PX=cx-3, PZ=cz+0.6, PR=2.7, BW=1.7; const bwZ0=PZ+PR-0.4, bwZ1=-52.6;
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
    // 石砌湖岸（內側立面、頂面、外側立面三條帶，木棧道經過的地方留缺口）
    { const st=W3.stoneTex('#b7ad9c').clone(); st.needsUpdate=true; st.wrapS=st.wrapT=THREE.RepeatWrapping; st.repeat.set(0.6,0.6); const rimM=new THREE.MeshStandardMaterial({map:st,roughness:0.95});
      const pos=[], uv=[], idx=[]; const H=0.2, W=0.75; let L=0; const lens=[0]; for(let i=1;i<=N;i++){ const a=P[i-1], b=P[i%N]; L+=Math.hypot(b[0]-a[0],b[1]-a[1]); lens.push(L); }
      const band=(f)=>{ const base=pos.length/3; for(let i=0;i<=N;i++){ const k=i%N, p=P[k], n=NR[k]; for(const [o,y,v] of f){ pos.push(p[0]+n[0]*o,y,p[1]+n[1]*o); uv.push(lens[i],v); } } for(let i=0;i<N;i++){ const a=P[i], b=P[(i+1)%N]; const mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2; if(Math.abs(mx-PX)<BW/2+0.5&&mz>cz) continue; const r0=base+i*2, r1=base+(i+1)*2; idx.push(r0,r1,r0+1, r1,r1+1,r0+1); } };
      band([[-0.05,0.0,0],[-0.05,H,H]]); band([[-0.05,H,0],[W,H,W]]); band([[W,H,0],[W,0.0,H]]);
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.setIndex(idx); geo.computeVertexNormals();
      const rim=new THREE.Mesh(geo,rimM); rim.receiveShadow=true; rim.castShadow=false; rim.material.side=THREE.DoubleSide; g.add(rim); }
    // 導航：湖面＋湖岸不能走（外擴 0.5 m），木棧道與湖心亭可以走
    { const out=P.map((p,i)=>[p[0]+NR[i][0]*1.25,p[1]+NR[i][1]*1.25]); const inside=(x,z)=>{ let c=false; for(let i=0,j=out.length-1;i<out.length;j=i++){ const a=out[i], b=out[j]; if(((a[1]>z)!==(b[1]>z))&&(x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])) c=!c; } return c; };
      for(let z=cz-B*1.3-1;z<=cz+B*1.3+1;z+=nav.cell) for(let x=cx-A*1.3-1;x<=cx+A*1.3+1;x+=nav.cell){ const [ix,iz]=nav.toCell(x,z); if(ix<0||iz<0||ix>=nav.cols||iz>=nav.rows) continue; const [wx,wz]=nav.toWorld(ix,iz); const free=onBoard(wx,wz)||Math.hypot(wx-PX,wz-PZ)<PR-0.35; if(inside(wx,wz)&&!free) nav.b[nav.idx(ix,iz)]=1; } }
    // 湖心亭：六角平台、紅柱、深色瓦頂；木棧道
    { const wood=new THREE.MeshStandardMaterial({color:0x7a5a3e,roughness:0.85}); const deck=new THREE.Mesh(new THREE.CylinderGeometry(PR,PR,0.16,6),new THREE.MeshStandardMaterial({color:0x9a8b74,roughness:0.9})); deck.position.set(PX,-0.03,PZ); deck.rotation.y=Math.PI/6; deck.receiveShadow=true; g.add(deck);
      const colM=new THREE.MeshStandardMaterial({color:0x8e3a2c,roughness:0.7}); const roofM=new THREE.MeshStandardMaterial({color:0x3f4a46,roughness:0.8}); for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; const c=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.11,2.7,8),colM); c.position.set(PX+Math.cos(a)*(PR-0.3),1.35,PZ+Math.sin(a)*(PR-0.3)); c.castShadow=true; g.add(c); if(i!==1){ const rail=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.45,(PR-0.3)*0.95),wood); const a2=a+Math.PI/6; rail.position.set(PX+Math.cos(a2)*(PR-0.3)*0.86,0.35,PZ+Math.sin(a2)*(PR-0.3)*0.86); rail.rotation.y=-a2; g.add(rail); } }
      const beam=new THREE.Mesh(new THREE.CylinderGeometry(PR-0.15,PR-0.15,0.22,6,1,true),colM); beam.position.set(PX,2.72,PZ); beam.rotation.y=Math.PI/6; g.add(beam);
      const roof=new THREE.Mesh(new THREE.ConeGeometry(PR+0.75,1.5,6),roofM); roof.position.set(PX,3.55,PZ); roof.rotation.y=Math.PI/6; roof.castShadow=true; g.add(roof); const eave=new THREE.Mesh(new THREE.CylinderGeometry(PR+0.78,PR+0.7,0.12,6),roofM); eave.position.set(PX,2.82,PZ); eave.rotation.y=Math.PI/6; g.add(eave);
      const fin=new THREE.Mesh(new THREE.SphereGeometry(0.16,8,6),new THREE.MeshStandardMaterial({color:0xb08a3a,roughness:0.5,metalness:0.4})); fin.position.set(PX,4.38,PZ); g.add(fin);
      const len=bwZ1-bwZ0; const bw=new THREE.Mesh(new THREE.BoxGeometry(BW,0.14,len),wood); bw.position.set(PX,-0.02,(bwZ0+bwZ1)/2); bw.receiveShadow=true; g.add(bw);
      for(const s of [-1,1]){ const rail=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,len-0.4),wood); rail.position.set(PX+s*(BW/2-0.04),0.62,(bwZ0+bwZ1)/2); g.add(rail); for(let z=bwZ0+0.3;z<=bwZ1-0.2;z+=1.6){ const post=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.62,0.08),wood); post.position.set(PX+s*(BW/2-0.04),0.31,z); g.add(post); } }
      for(let z=bwZ0+1.2;z<=bwZ1-1.8;z+=2.4){ for(const s of [-1,1]){ const pile=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.4,6),wood); pile.position.set(PX+s*(BW/2-0.1),-0.1,z); g.add(pile); } } }
    // 湖邊植物：靠岸的睡蓮葉（平貼水面）、北岸與東西兩側岸上的樹叢、樹
    { const bin=new TK.Bin(); const pad=TK.paint('#5a8a48',{side:THREE.DoubleSide,roughness:0.55}); const pad2=TK.paint('#6f9a52',{side:THREE.DoubleSide,roughness:0.55}); const R=(k)=>{ const v=Math.sin(k*12.9898)*43758.5453; return v-Math.floor(v); };
      for(let i=0;i<N;i++){ const p=P[i], n=NR[i]; if(p[1]>cz+1.5) continue; if(R(i)<0.45) continue; const m=3+((R(i+7)*4)|0); for(let k=0;k<m;k++){ const d=0.8+R(i*3+k)*2.8, sd=(R(i*5+k)-0.5)*2.0; const x=p[0]-n[0]*d+n[1]*sd, z=p[1]-n[1]*d-n[0]*sd; const rr=0.3+R(i*7+k)*0.3; const gpad=new THREE.CircleGeometry(rr,10,0.4,Math.PI*2-0.5); bin.add(R(i+k)<0.5?pad:pad2,gpad,x,0.045,z,R(i*11+k)*6.28,{rx:-Math.PI/2,noShadow:true}); } }
      for(let i=0;i<N;i+=2){ const p=P[i], n=NR[i]; if(p[1]>cz+1) continue; if(R(i+3)<0.35) continue; TK.plantClump(bin,p[0]+n[0]*(1.6+R(i)*0.8),0,p[1]+n[1]*(1.6+R(i)*0.8),1.1+R(i+1)*0.6,6,[0.75,0.95,0.7]); }
      const grp=new THREE.Group(); bin.build(grp); g.add(grp); }
    for(const [x,z,s] of [[cx-21,cz-4,1.25],[cx-19,cz+8.5,1.0],[cx+20,cz-5,1.2],[cx+19.5,cz+8,1.0],[cx-10,cz-13,1.15],[cx+7.5,cz-13,1.3],[cx-1,cz-14,1.0]]){ const t=TK.tree(7.5*s,Math.abs(x*7+z*3)|0); place(g,t,x,z,(x+z)*0.37); nav.blockCircle(x,z,0.6); }
    // 南岸步道旁：面向湖的長椅、路燈
    for(const x of [cx-11,cx+7]){ const b=BENCH(); place(g,b,x,-53.9,Math.PI); nav.blockRect(x,-53.9,2.0,0.7,0); seats.push({x,z:-53.9-0.55,yaw:Math.PI,label:'坐在醉月湖畔的長椅'}); }
    for(const x of [cx-16,cx+12]){ const l=W3.lampPost(); place(g,l,x,-48.6,Math.PI); lamps.push(l); nav.blockCircle(x,-48.6,0.25); }
    return {mat:wmat};
  }
  function updateLake(L,E){ if(!L||!E.sky) return; const U=L.mat.uniforms, S=E.sky.material.uniforms; U.time.value=E.time||0; U.skyLo.value.copy(S.bot.value).lerp(S.mid.value,0.25); U.skyHi.value.copy(S.mid.value).lerp(S.top.value,0.5); U.sunDir.value.copy(S.sunDir.value); U.sunCol.value.copy(E.sun.color).multiplyScalar(Math.min(1.6,E.sun.intensity)); }
  function glowTex(){ return W3.canvasTex('glow',64,64,(x,w,h)=>{ const g=x.createRadialGradient(32,32,2,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.4,'rgba(255,255,255,0.35)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,w,h); }); }
  // ---------- 公館商圈 ----------
  const gongguan={ id:'gongguan', name:'公館', indoor:false, cityLight:1.0, size:[160,110], camDist:6.5, build(E){
    treeIdx=0; leafyCount=0; const g=new THREE.Group(); const W=160,D=110; const nav=new E3.NavGrid(W,D,0.5,-W/2,-D/2); const lamps=[]; const buildings=[];
    ground(g,W,D,W3.asphaltTex(),[W/6,D/6],0,0,0);
    // 人行道（北側靠校門）與騎樓街區
    ground(g,W,14,W3.stoneTex('#dcd5c8'),[40,4],0,-38,0.02); ground(g,W,16,W3.stoneTex('#dcd5c8'),[40,4],0,12,0.02); ground(g,W,40,W3.stoneTex('#d9d3c6'),[40,10],0,40,0.02);
    // 羅斯福路：車道線
    { const line=W3.canvasTex('lane',64,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(255,255,255,0.85)'; x.fillRect(28,0,8,120); }); for(const z of [-25,-19,-8,-2]){ const t=line.clone(); t.needsUpdate=true; t.repeat.set(1,40); const m=new THREE.Mesh(new THREE.PlaneGeometry(0.4,W),new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:0.8})); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(0,0.03,z); m.receiveShadow=true; g.add(m); } /* 路中間的黃色雙實線（路面 z -31..4）*/ for(const z of [-13.65,-13.35]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(W,0.14),new THREE.MeshStandardMaterial({color:0xd9a93a,roughness:0.8})); m.rotation.x=-Math.PI/2; m.position.set(0,0.03,z); m.receiveShadow=true; g.add(m); } /* 車道線改成受光材質：晚上不會像螢光一樣亮 */ }
    // 校門（北側牆中央）——回校園
    // v9.3 第十四批：和校園同一座校門（CK.gate），校外朝南；門房在圍牆裡面（舊版的門房在校外人行道上，而且沒有碰撞）
    const gate=CK.gate(); placeGate(E,g,nav,gate,0,-46,0); for(const s of [-1,1]){ const wall=new THREE.Mesh(new THREE.BoxGeometry(70,1.8,1),texMat(W3.brickTex('#b8735a'))); wall.position.set(s*44,0.9,-46); g.add(wall); nav.blockRect(s*44,-46,70,1.2,0,0.3); }
    // 捷運公館站出口：人行道上順著街的玻璃亭（TK.mrtExit；原本是 W3 的四柱雨棚），入口朝東，入口外面是互動點
    { const mrt=TK.mrtExit({name:'捷運 公館站',sub:'出口 2'}); mrt.position.set(-36.6,0,11); mrt.rotation.y=Math.PI/2; g.add(mrt); nav.blockRect(-39.8,11,6.6,3.6,0,0);
      const m=new THREE.Mesh(new THREE.BoxGeometry(6.4,3.4,3.4),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(-39.8,1.7,11); g.add(m); E.colliders.push(m);
      E.interactables.push({x:-35.6,z:11,radius:2.4,label:'捷運公館站入口',mrt:true}); }
    // 店面街（南側）：連續騎樓的台北街屋（TK.apartment；v9.3 第十一批取代 LEVEL_BLOCKOUT 方盒＋另外搭的柱子與招牌）
    /* 立面在 z=19、面向羅斯福路（人行道 z 4–19）；騎樓 3 m 深、整排連續可以走（柱子落在店與店的分界），店面玻璃在 z=22。
       舊版店面在 z=52，和馬路之間隔著 30 m 空蕩蕩的鋪面廣場（LEVEL_BLOCKOUT 留下的），整個南側往北搬 30 m：店面、互動點、立牌、捷運入口、圓環、往溫州街的出口、
       從麵店／書店／便利商店出來的位置、路人路線（story3d.js）一起搬。各店的 x 位置不變；舊版店與店之間 1.2 m 的縫併進左邊那間；x=15.6 以東補上沒有互動的店面，整排店接到街尾。 */
    const addCol=(x,z,w,d,y0,y1)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,y1-y0,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x,(y0+y1)/2,z); g.add(m); E.colliders.push(m); };
    const shops=[{n:'阿鳳麵店',c:'#c9463d',w:10,type:'noodle',it:'noodle',sub:'乾麵・餛飩湯・小菜',v:'阿鳳麵店'},{n:'青葉茶行',c:'#2f7d5b',w:8,type:'tea',it:'tea',sub:'手搖飲・現煮珍珠'},{n:'舊路書房',c:'#3b5a8c',w:12,type:'book',it:'books',sub:'法律書・文具・二手書',v:'舊路書房'},{n:'全日便利商店',c:'#3a6fb0',w:10,type:'cvs',it:'cvs',band:'#e0a030'},
      {n:'公館藥局',c:'#4a9a6a',w:8,type:'none',it:'cvs',v:'藥局'},{n:'滷味・鹹酥雞',c:'#e0b24a',sc:'#3b2a1e',w:8,type:'none',it:'teishoku'},{n:'眼鏡・手機維修',c:'#5a5a7a',w:9,type:'none',it:'print',v:'眼鏡'},{n:'咖啡・輕食',c:'#8c3b47',w:9,type:'none',it:'cafe'},
      {n:'水果行',c:'#e0a030',sc:'#3b2a1e',w:8,type:'none',it:'fruit'},{n:'自助洗衣',c:'#4a90c2',w:9,type:'none',it:'laundry'},{n:'影印・輸出',c:'#2f3a44',w:9,type:'none',it:'print',v:'影印'},{n:'日日定食',c:'#5c3a21',w:10,type:'none',it:'teishoku',v:'定食'},{n:'二手唱片',c:'#2b2b2b',w:8,type:'none',it:'books'},{n:'文具・畫材',c:'#8c3b47',w:9,type:'none',it:'books'},{n:'早午餐',c:'#c9463d',w:9,type:'none',it:'cafe'}];
    const FZ=19, GH=4.2, ARC=3.0, SHOPD=16, WALLC=['#d9cbb0','#cfc5b2','#e3ddd0','#c8bca8','#d6c3a5','#e6dfd0','#bfb2a0'], WALLT=['tile','mosaic','tile','plaster'];
    let x=-68; shops.forEach((s,i)=>{ const last=i===shops.length-1; const X0=x, X1=x+s.w+(i<8&&!last?1.2:0), W=X1-X0, cx=(X0+X1)/2;
      // 柱子（TK 區域座標；建築轉 180°，區域 +x＝世界西側）：西邊分界一根；沒有互動的寬店面中間再一根（有互動的店門口前面不放柱子）；最後一間另加東邊盡頭
      const pl=[W/2]; const nb=s.type==='none'?Math.max(1,Math.round(W/5)):1; for(let k=1;k<nb;k++) pl.push(W/2-k*W/nb); if(last) pl.push(-W/2);
      const b=TK.apartment({w:W,d:SHOPD,floors:4+((i*5)%4),fh:3.1,groundH:GH,wall:WALLT[i%4],color:WALLC[i%7],balcony:i%3===1,tank:i%2===0,roofAdd:i%5===3,ground:{type:'arcade',through:true,pillars:pl,shop:{type:s.it,name:s.n,sub:s.sub,signBg:s.c,signColor:s.sc||'#ffffff',band:s.band,vertical:s.v,vBg:'#ffffff',vColor:s.c,vBand:s.c}}});
      b.position.set(cx,0,FZ); b.rotation.y=Math.PI; g.add(b); buildings.push(b);
      for(const lx of pl) nav.blockRect(cx-lx,FZ+0.3,0.55,0.55,0,0.1);
      // 鏡頭碰撞：店面玻璃後面的本體＋騎樓上方的樓層（在騎樓裡鏡頭不會被拉到臉前面，也不會穿到樓上）
      addCol(cx,FZ+ARC+0.3+(SHOPD-ARC-0.3)/2,W,SHOPD-ARC-0.3,0,b.userData.h+1); addCol(cx,FZ+(ARC+0.3)/2,W,ARC+0.3,GH-0.35,b.userData.h+1);
      const ix=x+s.w/2;
      if(s.type==='noodle') E.interactables.push({x:ix,z:FZ+2,radius:2.2,label:'進入阿鳳麵店',exit:{to:'noodle',spawn:{x:0,z:3.4,yaw:Math.PI}}});
      if(s.type==='tea') E.interactables.push({x:ix,z:FZ+2,radius:2.2,label:'買一杯飲料',shop:'tea'});
      if(s.type==='book') E.interactables.push({x:ix,z:FZ+2,radius:2.2,label:'進入舊路書房',exit:{to:'bookstore',spawn:{x:0,z:4,yaw:Math.PI}}});
      if(s.type==='cvs') E.interactables.push({x:ix,z:FZ+2,radius:2.2,label:'進入便利商店',exit:{to:'cvs',spawn:{x:0,z:3.4,yaw:Math.PI}}});
      x=X1; });
    // 往溫州街的巷口（店面街西端）：麵店西邊留 6 m 寬的巷子（x −74～−68）往南，巷口對面是轉角公寓（一般店面、沒有騎樓）；巷口有路名牌和反光鏡。
    /* 原本「往溫州街」只是區域邊上地面的互動點，旁邊什麼都沒有 */
    { const cb=TK.apartment({w:14,d:SHOPD,floors:5,fh:3.1,groundH:GH,wall:'tile',color:'#cdbfa8',balcony:true,tank:true,ground:{type:'shop',shop:{type:'teishoku',name:'豆花・甜湯',sub:'粉圓・芋圓・紅豆',signBg:'#f4ead8',signColor:'#5c3a21',band:'#c9a24a'}}}); cb.position.set(-81,0,FZ); cb.rotation.y=Math.PI; g.add(cb); buildings.push(cb);
      nav.blockRect(-81,FZ+SHOPD/2,14.2,SHOPD+0.2,0,0); addCol(-81,FZ+SHOPD/2,14,SHOPD,0,cb.userData.h+1);
      const lane=new THREE.Mesh(new THREE.PlaneGeometry(6,36),new THREE.MeshStandardMaterial({map:(()=>{ const t=W3.asphaltTex().clone(); t.needsUpdate=true; t.repeat.set(1,6); return t; })(),roughness:0.95})); lane.rotation.x=-Math.PI/2; lane.position.set(-71,0.028,FZ+18); lane.receiveShadow=true; g.add(lane);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,3.0,8),M('#7d8288')); pole.position.set(-73.7,1.5,FZ-0.5); g.add(pole); nav.blockCircle(-73.7,FZ-0.5,0.2);
      const st=TK.signTex('溫州街',{bg:'#2f6b4f',color:'#ffffff',size:80}); for(const ry of [0,Math.PI]){ const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.1,0.3),new THREE.MeshStandardMaterial({map:st,roughness:0.6})); sg.position.set(-73.7,2.85,FZ-1.05); sg.rotation.y=ry+Math.PI/2; g.add(sg); }   /* 路名牌掛在柱子靠馬路那一側，沿人行道走的人看得到 */
      const mir=TK.trafficMirror(); mir.position.set(-68.35,0,FZ-0.5); mir.rotation.y=-2.4; g.add(mir); nav.blockCircle(-68.35,FZ-0.5,0.2); }
    // 騎樓外的立牌（店門口前面、騎樓柱子外側；不擋騎樓，也不擋從店裡出來的位置）
    for(const [ax,ls] of [[-66.2,['今日小菜','滷豆干・海帶','餛飩湯 70']],[-49.8,['本日推薦','冬瓜檸檬','大杯 45']],[-45.4,['二手法律書','教科書收購','國考用書']]]){ const ab=TK.aBoard(ls); ab.position.set(ax,0,FZ-0.6); ab.rotation.y=Math.PI; g.add(ab); nav.blockCircle(ax,FZ-0.6,0.35); }
    // 校門北側是校園：從公館看回校門，看得到大道的大王椰子、洞洞館（農業陳列館）的側面和校園的樹（和校園區域的配置一致：校門往裡是椰林大道，洞洞館在大道北側、靠近校門）
    /* 舊版這裡是兩間「台大書局／公館小吃」方盒，但位置在校門圍牆裡面（校園內），不合理，拿掉 */
    { const hole=CK.pavilion({w:22,d:14,gfh:4.0,h:9,sign:'農業陳列館'}); place(g,hole,-30,-66,Math.PI/2);
      for(let z=-60;z>=-106;z-=7.5) for(const sx of [-1,1]){ const p=PALM(9+((-z*7)%3)); place(g,p,sx*9.5,z,(z*0.3)%6.28); }
      for(const [tx,tz] of [[-62,-53],[-50,-55],[-14,-54],[22,-53],[36,-57],[52,-53],[66,-55]]){ const t=TREE(1.0+((Math.abs(tx)*13)%3)*0.1); place(g,t,tx,tz,0); } }
    // 機車、路燈、行道樹
    // 機車（townkit，和溫州街同一套）：人行道邊三台一排；校門正前方只停一台，留出走路的空間
    const scC=['#e8e8e8','#2b2b2b','#8c3b47','#3a6fb0','#c9b48a','#f2f0ea','#5a5a7a'];
    const scRow=(xc,z,n,ry)=>{ for(let k=0;k<n;k++){ const s=TK.scooter(scC[((k*3+Math.round(xc*7))%7+7)%7]); s.position.set(xc+(k-(n-1)/2)*0.85,0,z+((k*7)%3-1)*0.06); s.rotation.y=ry+((k*5)%3-1)*0.05; g.add(s); } nav.blockRect(xc,z-0.04,n*0.85+0.5,1.7,0); };
    for(let i=0;i<14;i++){ const x=-70+i*10; scRow(x,-32,Math.abs(x)<12?1:3,0); }
    for(let i=0;i<8;i++) scRow(-60+i*14,6.8,3,Math.PI);
    for(let i=0;i<9;i++){ const l=W3.lampPost(); place(g,l,-63+i*18,-31.4,0); lamps.push(l); nav.blockCircle(-63+i*18,-31.4,0.25); /* 北側路燈原本在 z=-24（馬路的車道上），移到人行道邊 */ const l2=W3.lampPost(); place(g,l2,-63+i*18,5,Math.PI); lamps.push(l2); nav.blockCircle(-63+i*18,5,0.25); }
    for(let i=0;i<6;i++){ const t=TREE(0.9); place(g,t,-65+i*26,-36,0); nav.blockCircle(-65+i*26,-36,0.7); }
    // 集合點：公館圓環意象（小廣場）
    { const c=new THREE.Mesh(new THREE.CylinderGeometry(3,3,0.3,24),M('#d9cbb0')); c.position.set(22,0.15,11.5); g.add(c); nav.blockCircle(22,11.5,3.2); const tree=TREE(1.2); place(g,tree,22,11.5,0); }
    // 通往溫州街（西側）
    E.interactables.push({x:-71,z:FZ+1.2,radius:2.6,label:'往溫州街',exit:{to:'wenzhou',spawn:{x:51.3,z:-9.8,yaw:0}}});
    nav.blockOutside(-78,-45,78,FZ+2.6); /* 南側騎樓（z 19–22，店面玻璃在 z=22）要可走，互動點在 z=21 */ for(let z=-2;z<=2;z+=0.5) for(let x=-78;x<=-74;x+=0.5){} for(let xq=-79;xq<=-74;xq+=0.5) for(let zq=9;zq<=15;zq+=0.5){ const [cx,cz]=nav.toCell(xq,zq); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    for(let z=-50;z<=-44;z+=0.5) for(let xq=-4;xq<=4;xq+=0.5){ const [cx,cz]=nav.toCell(xq,z); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    E.interactables.push({x:0,z:-48,radius:3,label:'回到校園',exit:{to:'campus',spawn:{x:-119,z:0,yaw:Math.PI/2}}});
    /* 店面街的鏡頭碰撞在上面逐間加（TK 建築的原點在立面上，不能用舊的 footprint 置中方盒）*/
    for(const l of lamps){ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd88a,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(3,3,1); glow.position.set(0,3.9,0.75); l.add(glow); glow.visible=false; E.lampGlows.push(glow); const pool=new THREE.Mesh(new THREE.CircleGeometry(4.2,16),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(0,0.03,0.75); l.add(pool); pool.visible=false; E.lampGlows.push(pool); }
    // 招牌、店內、窗戶的夜間亮度跟著時間漸變（和溫州街同一套：17:24 開始、19:12 全亮）
    const zoneTime=(h)=>{ let k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); TK.setNight(Math.max(0,Math.min(1,k))); };
    return {group:g,nav,spawn:{x:0,z:-30,yaw:Math.PI},lamps,buildings,applyTimeOutdoor:zoneTime,onLamps(on){}}; } };
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
    const aptA=(x0,x1,spec,setback)=>{ const w=x1-x0; const b=TK.apartment(Object.assign({w,d:12},spec)); b.position.set((x0+x1)/2,0,5+(setback||0)); b.rotation.y=Math.PI; g.add(b); buildings.push(b); nav.blockRect((x0+x1)/2,5+(setback||0)+6,w,12,0,0); addCollider((x0+x1)/2,5+(setback||0)+6,w,12,b.userData.h+1); return b; };
    const aptB=(x0,x1,spec,setback)=>{ const w=x1-x0; const b=TK.apartment(Object.assign({w,d:12},spec)); b.position.set((x0+x1)/2,0,-5-(setback||0)); g.add(b); buildings.push(b); const arc=spec.ground&&spec.ground.type==='arcade'?3:0; nav.blockRect((x0+x1)/2,-5-(setback||0)-6-arc/2,w,12-arc,0,0); addCollider((x0+x1)/2,-5-(setback||0)-6,w,12,b.userData.h+1); return b; };
    // A 側
    aptA(-12,-4,{floors:4,wall:'tile',color:'#d9c9a8',ground:{type:'shop',shop:{type:'print',name:'大學影印',sub:'影印・裝訂・論文輸出',signBg:'#f4f1ea',signColor:'#1f4e8c',band:'#1f4e8c',vertical:'影印',vBg:'#ffffff',vColor:'#1f4e8c',vBand:'#1f4e8c'}}});
    aptA(-4,3.1,{floors:5,wall:'mosaic',color:'#cfd8d0',ground:{type:'door',color:'#9c2f2a'}});
    aptA(8.4,20,{floors:4,wall:'tile',color:'#c9b49a',balcony:true,ground:{type:'shop',shop:{type:'books',name:'巷口書房',sub:'二手書・人文社會・法律',signBg:'#2f4a3a',signColor:'#f4ead8',serif:true,awning:'#2f4a3a',vertical:'書',vBg:'#f4ead8',vColor:'#2f4a3a',vBand:'#2f4a3a'}}});
    aptA(32,40,{floors:4,wall:'plaster',color:'#e8e1d4',ground:{type:'shop',shop:{type:'noodle',name:'林家乾麵',sub:'乾麵・餛飩・滷味',signBg:'#f4ead8',signColor:'#9c2f2a',vertical:'麵',vBg:'#ffffff',vColor:'#9c2f2a',vBand:'#9c2f2a',awning:'#9c2f2a'}}});
    aptA(40,48,{floors:3,wall:'tile',color:'#b8a088',roofAdd:true,ground:{type:'shop',shop:{type:'cvs',name:'日日便利',sub:'24H',signBg:'#ffffff',signColor:'#1f6f78',band:'#e8a33a',frame:'#cfd6d6'}}});
    // B 側
    aptB(-30,-21,{floors:3,wall:'plaster',color:'#d8d0c0',roofAdd:true,ground:{type:'shutter'}});
    aptB(-21,-15,{floors:4,wall:'tile',color:'#bfb3a3',ground:{type:'shop',shop:{type:'laundry',name:'自助洗衣',sub:'24 小時・投幣式',signBg:'#e9f2f6',signColor:'#2a5f8a',frame:'#cfd6d6'}}});
    aptB(-9.6,4,{floors:5,wall:'tile',color:'#d5c7b0',ground:{type:'shop',shop:{type:'teishoku',name:'巷子裡定食',sub:'日式家庭料理',signBg:'#1f2e45',signColor:'#f4ead8',serif:true,awning:'#1f2e45',vertical:'定食',vBg:'#f4ead8',vColor:'#1f2e45',vBand:'#1f2e45'}}});
    aptB(4,16,{floors:4,wall:'mosaic',color:'#d8d2c6',ground:{type:'door',color:'#2f4a3a'}});
    aptB(16,30,{floors:4,wall:'tile',color:'#cbbba3',ground:{type:'arcade',shop:{type:'tea',name:'巷口茶飲',sub:'手搖飲・現煮珍珠',signBg:'#f4ead8',signColor:'#5c3a21',band:'#7a9a5a'}}});
    aptB(30,40,{floors:5,wall:'plaster',color:'#e6dccb',ground:{type:'shop',shop:{type:'fruit',name:'阿忠水果',sub:'當季水果・果汁',signBg:'#f2b33e',signColor:'#5c2a1a'}}});
    aptB(40,48,{floors:4,wall:'tile',color:'#a89a88',ground:{type:'door',color:'#8a3a2a'}});
    // 巷底與遠景（讓巷子看起來還有延伸）
    { const b=TK.apartment({w:12,d:10,floors:5,wall:'tile',color:'#c7b9a3',detail:false,ground:{type:'door'}}); b.position.set(5.75,0,21); b.rotation.y=Math.PI; g.add(b); buildings.push(b); addCollider(5.75,26,12,10,17); }
    { const b=TK.apartment({w:12,d:10,floors:4,wall:'mosaic',color:'#d6d0c2',detail:false,ground:{type:'shutter'}}); b.position.set(-12.25,0,-20); g.add(b); buildings.push(b); addCollider(-12.25,-25,12,10,14); }
    for(const [x,z,ry,w,f,c] of [[-33.4,16.2,Math.PI,9,4,'#cfc4b2'],[-33.4,-16.2,0,9,5,'#d9cdb8']]){ const b=TK.apartment({w,d:10,floors:f,wall:'tile',color:c,detail:false,ground:{type:f>5?'shop':'door',shop:{type:'cvs',name:'新生大樓',sub:'',signBg:'#f4f1ea',signColor:'#333'}}}); b.position.set(x,0,z); b.rotation.y=ry; g.add(b); buildings.push(b); addCollider(x,z,ry%Math.PI?10:w,ry%Math.PI?w:10,30); }
    // 西端（巷底）：住家公寓。v9.2 起兩點半 Café 搬到東端路口（門面朝西，傍晚夕陽沿著巷子照到店門口）
    { const endB=TK.apartment({w:14,d:13,floors:4,wall:'tile',color:'#cdbfa8',balcony:true,ground:{type:'door',color:'#5c3a21'}}); endB.position.set(-37.2,0,-1); endB.rotation.y=Math.PI/2; g.add(endB); buildings.push(endB); nav.blockRect(-43.7,-1,13,14,0,0); addCollider(-43.7,-1,13,14,16); }
    // 東端路口：兩點半 Café（一樓咖啡廳＋樓上住家；正對主巷，從公館走進溫州街第一眼就看到）
    const cafeB=TK.apartment({w:14,d:13,floors:3,fh:3.2,groundH:3.8,wall:'tile',color:'#e6d9c4',balcony:true,tank:false,grille:'#3b2a1e',ground:{type:'shop',shop:{type:'cafe',name:'兩點半 Café',sub:'營業 11:00–02:30',signBg:'#3b2a1e',signColor:'#f4ead8',serif:true,awning:'#3b2a1e',frame:'#3b2a1e'}}}); cafeB.position.set(55.4,0,0); cafeB.rotation.y=-Math.PI/2; g.add(cafeB); buildings.push(cafeB); nav.blockRect(61.9,0,13,14,0,0); addCollider(61.9,0,13,14,14);
    open(54.5,-6.6,55.15,6.6); // 店門口的騎樓地（可以走到門邊）
    // Café 南側：轉角公寓；路口往南是通往公館的路（遠景）
    { const b=TK.apartment({w:10,d:12,floors:5,wall:'tile',color:'#cbbba6',ground:{type:'shutter'}}); b.position.set(55.4,0,-12.4); b.rotation.y=-Math.PI/2; g.add(b); buildings.push(b); nav.blockRect(61.4,-12.4,12,10,0,0); addCollider(61.4,-12.4,12,10,18); }
    { const r=TK.road(30,8); r.position.set(51.3,0.002,-31); r.rotation.y=Math.PI/2; g.add(r); }
    // v9.3：路口往北的路也延伸出去（原本 z=15.5 被一棟 6 樓公寓整個堵住，Café 前面往北看只看到一面牆、看不到天空）：兩側遠景公寓＋行道樹，路的盡頭是天空；
    // 可走範圍仍到 z=15 為止，用道路施工的護欄和三角錐擋住（不是隱形牆）
    { const r=TK.road(34,8); r.position.set(51.3,0.002,32.5); r.rotation.y=Math.PI/2; g.add(r);
      for(const [x,z,ry,w,f,c] of [[47.9,23,Math.PI/2,11,5,'#cdbfa9'],[54.7,22.5,-Math.PI/2,10,4,'#d6cab6'],[47.9,37,Math.PI/2,14,6,'#c3b6a0'],[54.7,36,-Math.PI/2,14,5,'#cfc3ae']]){ const b=TK.apartment({w,d:10,floors:f,wall:'tile',color:c,detail:false,ground:{type:'door'}}); b.position.set(x,0,z); b.rotation.y=ry; g.add(b); buildings.push(b); }
      for(const [tx,tz,sc] of [[49.0,18.6,0.9],[53.7,29.5,1.0],[49.0,43,1.1]]){ const t=TK.tree(7*sc); place(g,t,tx,tz,0); }
      const sb=new TK.Bin(); const stripe=TK.M('roadworkStripe',()=>TK.std({map:TK.tex('roadwork',128,16,(x,w,h)=>{ for(let i=-16;i<w+16;i+=16){ x.fillStyle='#e8622a'; x.beginPath(); x.moveTo(i,0); x.lineTo(i+8,0); x.lineTo(i+8-h,h); x.lineTo(i-h,h); x.fill(); x.fillStyle='#f4f1ea'; x.beginPath(); x.moveTo(i+8,0); x.lineTo(i+16,0); x.lineTo(i+16-h,h); x.lineTo(i+8-h,h); x.fill(); } }),roughness:0.6}));
      for(const bx of [49.8,53.0]){ sb.add(stripe,TK.boxG(2.8,0.22,0.06),bx,0.95,15.7,0); sb.add(stripe,TK.boxG(2.8,0.22,0.06),bx,0.55,15.7,0); for(const sx of [-1.25,1.25]) sb.add(TK.paint('#3a3d42'),TK.boxG(0.08,1.1,0.4),bx+sx,0.55,15.7,0); }
      for(const cx of [48.6,51.4,54.0]){ sb.add(TK.paint('#e8622a'),new THREE.ConeGeometry(0.2,0.7,12),cx,0.35,15.2,0); sb.add(TK.paint('#f4f1ea'),new THREE.CylinderGeometry(0.11,0.14,0.12,12),cx,0.42,15.2,0); sb.add(TK.paint('#2b2b2b'),TK.boxG(0.42,0.04,0.42),cx,0.02,15.2,0); }
      const sg=new THREE.Group(); sb.build(sg); g.add(sg); }
    // Café 北側：轉角公寓（原本是空地，從路口看會露出遠景地面）
    { const b=TK.apartment({w:7,d:12,floors:4,wall:'mosaic',color:'#d3cbbd',balcony:true,ground:{type:'door',color:'#2f4a3a'}}); b.position.set(55.4,0,11.2); b.rotation.y=-Math.PI/2; g.add(b); buildings.push(b); nav.blockRect(61.4,11.2,12,7,0,0); addCollider(61.4,11.2,12,7,16); }
    // 巷口斑馬線（主巷接路口處）＋轉角行道樹
    { const st=TK.tex('zebra',256,64,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(240,238,230,0.92)'; for(let i=0;i<w;i+=32) x.fillRect(i+4,0,18,h); },false); const m=new THREE.Mesh(new THREE.PlaneGeometry(8.4,2.4),new THREE.MeshStandardMaterial({map:st,transparent:true,roughness:0.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(46.4,0.012,0); m.receiveShadow=true; g.add(m); }
    for(const [tx,tz,sc] of [[48.9,-5.6,0.95],[48.9,6.0,1.05]]){ const t=TK.tree(7*sc); place(g,t,tx,tz,0); nav.blockCircle(tx,tz,0.45); }
    for(const [x,z,ry,w,f,c] of [[47.9,-24,Math.PI/2,12,5,'#c9bba5'],[54.7,-24,-Math.PI/2,12,6,'#d4c8b4'],[47.9,-38,Math.PI/2,14,4,'#bfb29c'],[54.7,-38,-Math.PI/2,14,7,'#cdc2ae']]){ const b=TK.apartment({w,d:10,floors:f,wall:'tile',color:c,detail:false,ground:{type:'door'}}); b.position.set(x,0,z); b.rotation.y=ry; g.add(b); buildings.push(b); addCollider(x+(ry>0?-5:5),z,10,w,f*3.3+4); }
    for(const [z,ry,c] of [[11,Math.PI/2,'#d4c6b0'],[-13,Math.PI/2,'#cbbfae']]){ const b=TK.apartment({w:10,d:12,floors:4,wall:'tile',color:c,detail:false,ground:{type:'door'}}); b.position.set(-37.2,0,z); b.rotation.y=ry; g.add(b); buildings.push(b); addCollider(-43.2,z,12,10,14); }
    E.interactables.push({x:54.2,z:0,radius:2.3,label:'進入兩點半 Café',exit:{to:'cafe',spawn:{x:0,z:5,yaw:Math.PI}}});
    { const ab=TK.aBoard(['今日手沖','衣索比亞','耶加雪菲','—','讀書位 有']); ab.position.set(54.4,0,3.6); ab.rotation.y=-Math.PI/2; g.add(ab); nav.blockCircle(54.4,3.6,0.35); }
    { const bk=W3.bike('#2f5d50'); bk.position.set(54.6,0,-5.4); bk.rotation.y=Math.PI+0.15; g.add(bk); nav.blockRect(54.6,-5.4,0.6,1.8,0.15,0.1); }
    { const pt=TK.pots(5,1); pt.position.set(54.85,0,4.6); pt.rotation.y=-Math.PI/2; g.add(pt); nav.blockRect(54.85,5.4,0.6,1.8,0,0); }
    nav.blockRect(54.8,4.22,0.7,0.65,0,0); nav.blockRect(46.25,4.7,0.9,0.7,0,0);   // 比人窄的縫（A 字立牌和盆栽之間、電線桿和郵筒之間）：會留下只有一點站得住的小孤島，滑進去就出不來（v9.3 #31，tools/dev_scratch/nav_islands.py）
    { const pt=TK.pots(4,3); pt.position.set(54.85,0,-4.6); pt.rotation.y=-Math.PI/2; g.add(pt); nav.blockRect(54.85,-3.8,0.6,1.6,0,0); }
    { const bk=W3.bike('#3a6fb0'); bk.position.set(-35.9,0,-5.2); bk.rotation.y=0.15; g.add(bk); nav.blockRect(-35.9,-5.2,0.6,1.8,0.15,0.1); }
    { const pt=TK.pots(5,1); pt.position.set(-36.6,0,3.4); pt.rotation.y=Math.PI/2; g.add(pt); nav.blockRect(-36.4,4.2,0.6,1.8,0,0); }
    // A 側：日式宿舍（圍牆＋黑瓦木屋＋老樹）
    // v9.3：圍牆降到 1.15 m、門開著（冠木門）、房子往前 0.5 m——從巷子就看得到木造外觀、格子窗、玄關（以前 1.7 m 的牆把房子整個擋住）
    { const w=TK.wall(17,1.15,{gate:2.4,gateX:-0.5,openGate:true}); w.position.set(-21,0,5.35); w.rotation.y=Math.PI; g.add(w); nav.blockRect(-21,5.4,17.2,0.5,0,0.05); addCollider(-21,5.4,17,0.4,1.6);
      const h=TK.japaneseHouse(10,7); h.position.set(-21.5,0,12.0); h.rotation.y=Math.PI; g.add(h); addCollider(-21.5,12.0,11,8,6);
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
      E.interactables.push({x:-21.5,z:4.2,radius:1.8,label:'看日式宿舍',look:'圍牆後面是一棟日式宿舍。黑瓦、木雨淋板，樹比屋頂還高。門牌旁貼著「私人住宅，請勿進入」。'}); }
    // 小公園（A 側 x 20–32）
    { const gr=new THREE.Mesh(new THREE.PlaneGeometry(11.6,10.4),new THREE.MeshStandardMaterial({map:(()=>{ const t=W3.grassTex().clone(); t.needsUpdate=true; t.repeat.set(3,3); return t; })(),roughness:0.95})); gr.rotation.x=-Math.PI/2; gr.position.set(26,0.01,10.2); gr.receiveShadow=true; g.add(gr);
      // v9.3：鋪面步道（有路緣）→ 圓形小廣場，中間一棵大樹＋樹圍座椅（台北鄰里公園常見）；兩側灌木、伸展架、公園路燈、長椅上睡覺的貓
      const paverT=()=>TK.tex('parkPaver',128,128,(x,w,h)=>{ x.fillStyle='#a79e90'; x.fillRect(0,0,w,h); for(let j=0;j<4;j++) for(let i=0;i<4;i++){ const v=200+((i*7+j*13)%5)*8; x.fillStyle='rgb('+v+','+(v-8)+','+(v-22)+')'; x.fillRect(i*32+2,j*32+2,28,28); } });
      { const t=paverT().clone(); t.needsUpdate=true; t.repeat.set(1.1,2.9); const m=new THREE.Mesh(new THREE.PlaneGeometry(2.2,5.8),new THREE.MeshStandardMaterial({map:t,roughness:0.9})); m.rotation.x=-Math.PI/2; m.position.set(26,0.016,7.9); m.receiveShadow=true; g.add(m); }
      { const t=paverT().clone(); t.needsUpdate=true; t.repeat.set(2.7,2.7); const m=new THREE.Mesh(new THREE.CircleGeometry(2.75,28),new THREE.MeshStandardMaterial({map:t,roughness:0.9})); m.rotation.x=-Math.PI/2; m.position.set(26,0.017,13.2); m.receiveShadow=true; g.add(m); }
      const pb=new TK.Bin(); const curbP=TK.paint('#c9c2b4');
      for(const sx of [-1,1]) pb.add(curbP,TK.boxG(0.12,0.08,5.6),26+sx*1.16,0.04,7.9,0);
      { const big=TK.tree(10.5,7); place(g,big,26,13.2,0.6); nav.blockCircle(26,13.2,1.3);
        const wood=TK.paint('#8a6a4a'), legP=TK.paint('#5a5550'); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; const cx=26+Math.sin(a)*1.15, cz=13.2+Math.cos(a)*1.15; pb.add(wood,TK.boxG(0.98,0.06,0.36),cx,0.44,cz,a); pb.add(legP,TK.boxG(0.06,0.42,0.3),cx+Math.sin(a+Math.PI/2)*0.42,0.21,cz+Math.cos(a+Math.PI/2)*0.42,a); }
        E.interactables.push({x:26,z:11.5,radius:1.3,label:'坐在大樹下的圓椅',seat:{x:26,z:11.82,yaw:Math.PI}}); }
      for(const [tx,tz,sc] of [[21.6,12.8,1.0],[30.6,12.6,0.95],[30.8,6.4,0.8]]){ const t=TK.tree(7.5*sc); place(g,t,tx,tz,0); nav.blockCircle(tx,tz,0.5); }
      for(let z=7.2;z<=15;z+=1.25){ for(const x of [20.7,31.3]){ if(x>30&&z<8.6) continue; TK.plantClump(pb,x,0,z,1.05+Math.abs((z*7)%3)*0.12,6,[0.68,0.9,0.64]); } }   // 兩側灌木
      for(let x=21.8;x<=30.2;x+=1.3){ if(Math.abs(x-26)<3.0) continue; TK.plantClump(pb,x,0,15.0,1.2,6,[0.66,0.88,0.62]); }
      { const gp=TK.paint('#3f7a5a'); for(const sx of [-0.6,0.6]) pb.add(gp,new THREE.CylinderGeometry(0.05,0.05,1.7,8),22.3+sx,0.85,10.4,0); pb.add(gp,new THREE.CylinderGeometry(0.03,0.03,1.3,8),22.3,1.62,10.4,0,{rz:Math.PI/2}); pb.add(TK.paint('#e8c23a'),new THREE.CylinderGeometry(0.035,0.035,1.3,8),22.3,1.1,10.4,0,{rz:Math.PI/2}); nav.blockRect(22.3,10.4,1.5,0.3,0,0.1); }   // 伸展架（單槓）
      { const L=W3.lampPost(); place(g,L,31.0,9.6,-Math.PI/2); nav.blockCircle(31.0,9.6,0.25); const pool=TK.lightPool(4.2,'rgba(255,214,150,1)'); pool.position.set(30.25,0.03,9.6); g.add(pool); pools.push(pool); const gs=TK.glowSprite('rgba(255,214,150,1)',1.8,0,0.85); gs.position.set(30.25,3.9,9.6); g.add(gs); }   // 公園路燈
      { const cat=new TK.Bin(); const fur=TK.paint('#d98a3c'), furL=TK.paint('#f0c08a'), dk=TK.paint('#5a3a22'); const cx=29.05, cy=0.5, cz=8.08;   // 長椅上睡覺的橘貓（AMBIENT 文字裡提到的那隻）
        const body=new THREE.SphereGeometry(0.2,14,9); body.scale(1.0,0.5,0.72); cat.add(fur,body,cx,cy+0.08,cz,0.3);
        const head=new THREE.SphereGeometry(0.085,12,8); cat.add(fur,head,cx+0.15,cy+0.07,cz-0.07,0); const muzzle=new THREE.SphereGeometry(0.04,8,6); cat.add(furL,muzzle,cx+0.2,cy+0.05,cz-0.12,0);
        for(const ex of [-0.04,0.04]) cat.add(fur,new THREE.ConeGeometry(0.028,0.06,4),cx+0.15+ex,cy+0.15,cz-0.06,0);
        const tail=new THREE.TorusGeometry(0.16,0.026,6,14,Math.PI*1.1); cat.add(dk,tail,cx-0.02,cy+0.035,cz-0.02,0.4,{rx:-Math.PI/2});
        const cg=new THREE.Group(); cat.build(cg); cg.traverse(o=>{ if(o.isMesh) o.castShadow=false; }); g.add(cg); }
      { const pg=new THREE.Group(); pb.build(pg); g.add(pg); }
      for(const [bx,bz] of [[23.6,8.0],[28.4,8.0]]){ const b=BENCH(); place(g,b,bx,bz,Math.PI); nav.blockRect(bx,bz,2,0.7,0); E.interactables.push({x:bx,z:bz-0.55,radius:1.4,label:'坐在小公園的長椅',seat:{x:bx,z:bz-0.55,yaw:Math.PI}}); }
      for(const [hx,hz] of [[20.6,5.6],[30.0,5.6]]){ const pt=TK.pots(4,7); pt.position.set(hx,0,hz); pt.rotation.y=Math.PI; g.add(pt); nav.blockRect(hx-0.8,hz,1.8,0.7,0,0); }
      const sg=TK.signTex('溫州公園',{bg:'#2f4a3a',color:'#f4ead8',serif:true}); const sp=new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.4),new THREE.MeshStandardMaterial({map:sg})); sp.position.set(20.2,1.4,5.6); sp.rotation.y=Math.PI; g.add(sp); }
    // ---- 電線桿＋路燈（A 側沿街）、電線 ----
    const poleXs=[-26.5,-9.2,12.2,34.2,45.5]; const tops=[];
    poleXs.forEach((px,i)=>{ const p=TK.utilityPole({arm:true,armDir:1,transformer:i===2,sign:i===4?'溫州街':null}); p.position.set(px,0,4.65); p.rotation.y=Math.PI/2; g.add(p); nav.blockCircle(px,4.65,0.3); tops.push([px,8.52,4.65]); const L=p.userData.lamp; if(L){ const wx=px, wz=4.65-L.x; lamps.push({x:wx,z:wz}); const pool=TK.lightPool(4.5,'rgba(255,214,150,1)'); pool.position.set(wx,0.03,wz); g.add(pool); pools.push(pool); } });
    { const pairs=[]; for(let i=0;i<tops.length-1;i++){ for(const dy of [0,-0.6]) pairs.push([[tops[i][0]-0.75,tops[i][1]+dy,tops[i][2]],[tops[i+1][0]-0.75,tops[i+1][1]+dy,tops[i+1][2]],0.7]); pairs.push([[tops[i][0]+0.75,tops[i][1],tops[i][2]],[tops[i+1][0]+0.75,tops[i+1][1],tops[i+1][2]],0.55]); }
      // 跨巷到對面建築、到巷子
      for(const [px,tx,tz] of [[-9.2,-6,-5.2],[12.2,10,-5.2],[34.2,36,-5.2],[12.2,5.8,9],[-26.5,-30,-5.2]]) pairs.push([[px,8.0,4.65],[tx,7.2,tz],0.4]);
      g.add(TK.wires(pairs)); }
    // 轉角反光鏡
    for(const [mx,mz,ry] of [[8.7,4.5,-2.4],[-9.4,-4.5,0.7],[-30.4,4.6,-2.3]]){ const m=TK.trafficMirror(); m.position.set(mx,0,mz); m.rotation.y=ry; g.add(m); nav.blockCircle(mx,mz,0.2); }
    // 機車（停車格裡，車頭朝建築）＋腳踏車
    const scColors=['#e8e8e8','#2b2b2b','#8c3b47','#4a6c8c','#c9b48a','#f2f0ea','#3e5a48'];
    const scRow=(x0,n,z,ry)=>{ for(let k=0;k<n;k++){ if(TK.rnd()<0.15) continue; const s=TK.scooter(scColors[(k*3+Math.round(x0))%scColors.length]); const x=x0+k*0.85; s.position.set(x,0,z+(TK.rnd()-0.5)*0.15); s.rotation.y=ry+(TK.rnd()-0.5)*0.12; g.add(s); } nav.blockRect(x0+(n-1)*0.85/2,z,n*0.85,1.7,0,0.05); };
    scRow(-11.5,7,3.95,0); scRow(5.0,12,-3.95,Math.PI); scRow(31.5,8,-3.95,Math.PI); scRow(-28.5,6,-3.95,Math.PI); scRow(24.4,4,3.95,0);
    for(const [bx,bz,ry,c] of [[9.4,4.1,0.1,'#3a6fb0'],[10.3,4.1,-0.08,'#8c3b47'],[18.6,4.1,0.05,'#e0b95b']]){ const bk=W3.bike(c); bk.position.set(bx,0,bz); bk.rotation.y=ry; g.add(bk); nav.blockRect(bx,bz,0.6,1.8,ry,0.05); }
    // 盆栽（住家門口）、郵筒、立牌
    for(const [px,pz,ry,n] of [[-2.6,4.55,Math.PI,6],[9.6,-4.55,0,5],[41.5,-4.55,0,7],[3.6,9.5,-Math.PI/2,5],[-13.5,-9,Math.PI/2,4],[-14.4,4.6,Math.PI,4]]){ const pt=TK.pots(n,Math.round(px)); pt.position.set(px,0,pz); pt.rotation.y=ry; g.add(pt); const L=pt.userData.len; const c=Math.cos(ry), sn=Math.sin(ry); nav.blockRect(px+c*L/2,pz-sn*L/2,Math.abs(c)*L+0.6,Math.abs(sn)*L+0.6,0,0); }
    { const mb=TK.mailbox(); mb.position.set(47.3,0,4.3); mb.rotation.y=Math.PI; g.add(mb); nav.blockRect(47.3,4.3,1.2,0.6,0,0); }
    for(const [ax,az,ry,ls] of [[14.6,3.9,Math.PI,['二手書','民法・刑法','教科書收購']],[-2.4,-3.9,0,['本日定食','鯖魚 / 豚汁','11:30–20:00']]]){ const ab=TK.aBoard(ls); ab.position.set(ax,0,az); ab.rotation.y=ry; g.add(ab); nav.blockCircle(ax,az,0.35); }
    // 店面（不能進去的）用「看櫥窗」：清楚表示只能看，不假裝有完整室內
    for(const it of [{x:14.2,z:3.8,label:'看書店的櫥窗',look:'巷口書房的櫥窗裡擺著一套舊版的《民法總則》，旁邊手寫的紙條：「學長姐留下來的，筆記很多」。'},{x:44,z:3.8,label:'看便利商店',look:'日日便利的自動門開了又關。櫃檯後面的店員在補咖啡豆。'},{x:36,z:3.8,label:'看林家乾麵',look:'林家乾麵外面排了三個人。滷味的味道飄到巷子中間。'},{x:23,z:-6.5,label:'看手搖飲菜單',look:'巷口茶飲的菜單：紅茶 30、綠茶 30、珍珠奶茶 55。騎樓下有兩張塑膠椅。'},{x:-2.6,z:-3.8,label:'看定食店',look:'巷子裡定食的布簾後面傳來煎魚的聲音。今天的定食是鯖魚。'}]) E.interactables.push(Object.assign({radius:1.6},it));
    // 騎樓柱子
    for(const px of [16.3,29.7]) nav.blockRect(px,-5.3,0.6,0.6,0,0.05);
    // v9.3 參考圖 07 的街道細節：Café 門前的紅磚人行道（平的，不改導航、腳不會陷進去；外緣一條低路緣）＋路口的「溫州街 Wenzhou St.」路名牌
    { const bt=TK.tex('redBrickWalk',256,256,(x,w,h)=>{ x.fillStyle='#7d6a60'; x.fillRect(0,0,w,h); for(let r=0;r<16;r++) for(let c=0;c<5;c++){ const v=0.84+((r*7+c*13)%9)/40; const cr=Math.round(156*v), cg=Math.round(92*v), cb=Math.round(74*v); x.fillStyle='rgb('+cr+','+cg+','+cb+')'; x.fillRect(c*52+(r%2)*26-26+2,r*16+2,48,12); } x.fillStyle='rgba(0,0,0,0.05)'; for(let i=0;i<40;i++) x.fillRect((i*53)%w,(i*97)%h,3,3); }); const t=bt.clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1.9/1.2,13.4/1.2);
      const sw=new THREE.Mesh(new THREE.PlaneGeometry(1.9,13.4),TK.std({map:t,roughness:0.92})); sw.rotation.x=-Math.PI/2; sw.position.set(54.3,0.014,0); sw.receiveShadow=true; g.add(sw);
      const curb=new THREE.Mesh(TK.boxG(0.14,0.04,13.4),TK.paint('#b9b2a6')); curb.position.set(53.33,0.02,0); curb.receiveShadow=true; g.add(curb); }
    { const sg=new THREE.Group(); const pm=TK.paint('#6f747a'); const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.05,3.0,10),pm); pole.position.y=1.5; sg.add(pole);
      const st=TK.signTex('溫州街',{bg:'#1f6448',color:'#f4f6f2',border:'#f4f6f2',sub:'Wenzhou St.'}); const pmat=new THREE.MeshStandardMaterial({map:st,roughness:0.6}); for(const sd of [0,1]){ const plate=new THREE.Mesh(new THREE.PlaneGeometry(0.95,0.3),pmat); plate.position.set(0.5,2.75,sd?-0.006:0.006); plate.rotation.y=sd?Math.PI:0; sg.add(plate); }   // 兩面各一片（單片雙面的背面字會左右相反）
      const arm=new THREE.Mesh(TK.boxG(0.1,0.04,0.04),pm); arm.position.set(0.04,2.75,0); sg.add(arm);
      sg.position.set(47.7,0,7.6); sg.rotation.y=Math.PI*0.08; g.add(sg); nav.blockCircle(47.7,7.6,0.15); }
    // 路口往北那段：Café 北側公寓前停一排機車（車頭朝建築）、西側一根電線桿＋電線（參考圖 07 的街景）
    { const cols=['#e8e8e8','#2b2b2b','#8c3b47','#4a6c8c','#c9b48a','#f2f0ea','#3e5a48']; for(let k=0;k<7;k++){ if(k===3) continue; const sc=TK.scooter(cols[(k*3+2)%cols.length]); sc.position.set(54.55,0,8.7+k*0.85); sc.rotation.y=Math.PI/2+(k%2?0.06:-0.05); g.add(sc); } nav.blockRect(54.6,11.25,1.5,5.6,0,0.05);
      const up=TK.utilityPole({}); up.position.set(47.55,0,14.2); up.rotation.y=Math.PI/2; g.add(up); nav.blockCircle(47.55,14.2,0.3);
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
    return {group:g,nav,spawn:{x:44,z:-1,yaw:-Math.PI/2},lamps:[],buildings,applyTimeOutdoor:zoneTime,onLamps(on){}}; }
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
      fadeWalls(cam,pp){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity= facing?1:0.12; w.material.depthWrite=facing; }
        /* 窗的零件（窗、框、窗台、窗簾）跟著所在的牆：牆淡出時一起隱藏，不然會浮在半空中擋住房間 */ if(this.winParts) for(const wp of this.winParts){ const toCam=new THREE.Vector3().subVectors(cam.position,wp.at); wp.obj.visible=toCam.dot(wp.dir)>0; } },
      onLamps(on){ ceilLight.intensity=on?28:12; for(const l of lights) l.material.color.set(on?0xfff6e0:0xf4efe6); }, bounds:{w:W,d:D} };
    // 窗（外牆上的假窗，帶天光）
    if(o.windows!==false){ zone.wins=[]; zone.sunPatches=[]; const nW=Math.max(1,Math.round(W/5)); const xs=o.winXs||Array.from({length:nW},(_,i)=>-W/2+(i+0.5)*W/nW); const WW=o.winWall||'back'; const ry=WW==='left'?Math.PI/2:(WW==='right'?-Math.PI/2:(WW==='front'?Math.PI:0)); const half=(WW==='left'||WW==='right')?W/2:D/2;
      /* 牆上的位置 → 房間座標：t＝沿牆的位置、n＝離牆面的距離 */ const at=(t,n)=>WW==='left'?[-half+n,t]:(WW==='right'?[half-n,-t]:(WW==='front'?[-t,half-n]:[t,-half+n]));
      const inDir=new THREE.Vector3(Math.sin(ry),0,Math.cos(ry)); zone.winParts=zone.winParts||[]; const wg=new THREE.Group(); g.add(wg);
      for(const wx of xs){ const win=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.6),new THREE.MeshBasicMaterial({color:0xcfe3ea,map:viewTex(false)})); { const q=at(wx,0.12); win.position.set(q[0],2.1,q[1]); } win.rotation.y=ry; win.userData.dyn=true; zone.wins.push(win);
        const part=new THREE.Group(); part.add(win); wg.add(part); { const q=at(wx,0); zone.winParts.push({obj:part,at:new THREE.Vector3(q[0],H/2,q[1]),dir:inDir}); }
        // 鋁窗框、中間的直框、窗台（v9.3 第十五批：原本只是一塊會變色的平面）
        const fr=M('#c9ccd0',{rough:0.4}); for(const [fx,fy,fw,fh] of [[0,0.83,2.32,0.07],[0,-0.83,2.32,0.07],[-1.13,0,0.07,1.73],[1.13,0,0.07,1.73],[0,0,0.05,1.6]]){ const b=new THREE.Mesh(new THREE.BoxGeometry(fw,fh,0.06),fr); const q=at(wx+fx,0.15); b.position.set(q[0],2.1+fy,q[1]); b.rotation.y=ry; part.add(b); } const sill=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.05,0.22),M('#e6e2da',{rough:0.6})); { const q=at(wx,0.2); sill.position.set(q[0],2.1-0.87,q[1]); } sill.rotation.y=ry; part.add(sill);
        if(o.curtains){ const ct=W3.canvasTex('curtain',64,128,(x,w,h)=>{ x.fillStyle='#d9c9a8'; x.fillRect(0,0,w,h); for(let i=0;i<w;i+=8){ const gg=x.createLinearGradient(i,0,i+8,0); gg.addColorStop(0,'rgba(0,0,0,0.10)'); gg.addColorStop(0.5,'rgba(255,255,255,0.10)'); gg.addColorStop(1,'rgba(0,0,0,0.12)'); x.fillStyle=gg; x.fillRect(i,0,8,h); } }); for(const sx of [-1,1]){ const c=new THREE.Mesh(new THREE.PlaneGeometry(0.38,2.0),new THREE.MeshStandardMaterial({map:ct,color:o.curtains,roughness:0.95,side:THREE.DoubleSide})); const q=at(wx+sx*1.3,0.24); c.position.set(q[0],2.0,q[1]); c.rotation.y=ry; part.add(c); } const rod=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.03,0.03),M('#8f9399')); { const q=at(wx,0.24); rod.position.set(q[0],Math.min(2.98,H-0.08),q[1]); } rod.rotation.y=ry; part.add(rod); }
        // 窗光落在地板上的光斑（下午暖光／清晨冷光，夜晚消失）
        const sp=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.2),new THREE.MeshBasicMaterial({color:0xffd9a0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending})); sp.rotation.x=-Math.PI/2; { const q=at(wx+0.4,1.6); sp.position.set(q[0],0.012,q[1]); } sp.rotation.z=ry; sp.userData.dyn=true; g.add(sp); zone.sunPatches.push(sp); } }
    // 室內時間感：窗色、光斑、燈色依時段與天氣變化
    zone.applyTime=function(h,weather){ h=h%24; const rain=weather==='rain'; let winC, patchA=0, patchC=0xffd9a0; if(h<5.5||h>=19.4){ winC=0x141c2c; } else if(h<6.5){ winC=0x5a6a8a; } else if(h<8){ winC=rain?0x8a949c:0xd9e3ea; patchA=rain?0:0.10; patchC=0xdfe8ff; } else if(h<16){ winC=rain?0x9aa4ac:0xcfe3ea; patchA=rain?0.04:0.16; patchC=0xfff3d6; } else if(h<17.6){ winC=rain?0x8a8f96:0xe8d6b8; patchA=rain?0.03:0.22; patchC=0xffcf8a; } else if(h<18.4){ winC=rain?0x6a6c74:0xf0a868; patchA=rain?0:0.18; patchC=0xff9a5a; } else { winC=0x3a4260; patchA=0.03; patchC=0xff8a4a; }
      const nightView=(h<5.5||h>=19.4); if(zone.wins) for(const w of zone.wins){ const want=w.userData.viewFixed?null:viewTex(nightView); if(want&&w.material.map!==want){ w.material.map=want; w.material.needsUpdate=true; } w.material.color.set(nightView?(rain?0x9098a8:0xd8dce6):winC); } if(zone.sunPatches) for(const p of zone.sunPatches){ p.material.opacity=patchA; p.material.color.set(patchC); }
      const night=(h<6.5||h>=18); if(o.warm){ ceilLight.color.set(night?0xffb870:0xfff0d8); ceilLight.intensity=night?22:14; for(const l of lights) l.material.color.set(night?0xffc890:0xfff6e0); } };
    return zone; }
  // 書桌／長桌（v9.3 第十七批：原本是一塊板＋四根方棒，12 m 的教室長桌也只有四根腳）：5 cm 桌板＋深色封邊、金屬圓管腳（長桌約每 2 m 一組）＋橫桿。
  // 桌面高度（0.77）與導航阻擋不變；同一張桌子的零件合成同材質一個網格（TK.Bin）
  function desk(g,nav,x,z,rot,w,d,color,legs){ const grp=new THREE.Group(); grp.position.set(x,0,z); grp.rotation.y=rot||0; g.add(grp); const bin=new TK.Bin(); const col=color||'#c9a57a';
    bin.add(M(col,{rough:0.6}),new THREE.BoxGeometry(w,0.05,d),0,0.745,0); bin.add(M(P3.shade(col,0.38),{rough:0.6}),new THREE.BoxGeometry(w+0.012,0.026,d+0.012),0,0.728,0);
    const wood=legs==='wood', lm=wood?M('#5c3a21',{rough:0.7}):M('#4a4f55',{rough:0.45}); const n=Math.max(2,Math.ceil(w/2.0)+1);   /* legs='wood'：閱覽室的木頭長桌 */
    for(let i=0;i<n;i++){ const lx=-w/2+0.08+(w-0.16)*i/(n-1); for(const sz of [-1,1]) bin.add(lm,wood?new THREE.BoxGeometry(0.06,0.715,0.06):new THREE.CylinderGeometry(0.018,0.018,0.715,8),lx,0.3575,sz*(d/2-0.08)); bin.add(lm,new THREE.BoxGeometry(0.03,0.03,Math.max(0.1,d-0.16)),lx,0.12,0); }
    bin.build(grp); nav.blockRect(x,z,w,d,rot||0,0.1); return grp; }
  // 椅子（v9.3 第十七批：原本是方板＋方棒）：有厚度的椅面、微彎的靠背板＋兩根背柱、金屬圓管腳；佔地不變（約 0.46 m 見方），+z 是前面
  function chair(g,x,z,rot,color){ const c=new THREE.Group(); const bin=new TK.Bin(); const col=color||'#8b5e3c', cm=M(col,{rough:0.7});
    /* 木頭色的椅子（Café、閱覽室）用同色系的木腳；其他（教室、宿舍、麵店）用金屬圓管腳 */ const hsl=new THREE.Color(col).getHSL({}); const woody=hsl.h>0.03&&hsl.h<0.13&&hsl.s>0.25; const lm=woody?M(P3.shade(col,0.25),{rough:0.75}):M('#4a4f55',{rough:0.45});
    const leg=(h)=>woody?new THREE.BoxGeometry(0.035,h,0.035):new THREE.CylinderGeometry(0.012,0.012,h,6);
    bin.add(cm,new THREE.BoxGeometry(0.44,0.05,0.42),0,0.46,0.01);
    const back=new THREE.BoxGeometry(0.42,0.26,0.035,6,1,1); { const p=back.attributes.position; for(let i=0;i<p.count;i++){ const px=p.getX(i)/0.21; p.setZ(i,p.getZ(i)+0.05*px*px); } back.computeVertexNormals(); } bin.add(cm,back,0,0.8,-0.2,0,{rx:-0.08});
    for(const sx of [-1,1]) bin.add(lm,leg(0.44),sx*0.19,0.7,-0.2);
    for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) bin.add(lm,leg(0.45),sx*0.19,0.225,sz*0.18);
    bin.build(c); c.position.set(x,0,z); c.rotation.y=rot||0; g.add(c); return c; }
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
  const classroom={ id:'classroom', name:'霖澤館 教室', indoor:true, camDist:4.2, build(E){ const z=room(E,{w:16,d:12,h:3.6,cool:true,wallColor:'#f1ebe0',spawn:{x:0,z:5,yaw:Math.PI},winWall:'left',winXs:[-3.2,0.6,4.0]});   /* 窗在左側牆：後牆是黑板和投影幕（v9.3 第十五批：新窗框會穿過黑板）*/ const g=z.group, nav=z.nav;
    // 講台與黑板
    const board=new THREE.Mesh(new THREE.BoxGeometry(6,1.6,0.08),M('#2e4e44',{rough:0.5})); board.position.set(0,1.9,-5.9); g.add(board); const chalkT=W3.canvasTex('chalk',1024,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='#f3ebd3'; x.font='bold 44px "Noto Sans TC",sans-serif'; x.fillText('民法總則：法律行為的成立與生效',40,80); x.font='30px "Noto Sans TC",sans-serif'; x.fillText('案例：網拍標價 1,000 元的相機',40,150); x.fillText('要約？要約之引誘？承諾？錯誤？',40,210); }); const chalk=new THREE.Mesh(new THREE.PlaneGeometry(5.8,1.45),new THREE.MeshBasicMaterial({map:chalkT,transparent:true})); chalk.position.set(0,1.9,-5.85); chalk.userData.dyn=true; g.add(chalk); z.chalk=chalk;
    // 黑板內容依課表更換（STORY.populate 會呼叫）
    z.setBoard=function(title,l1,l2){ const t=W3.canvasTex('chalk_'+title+l1+l2,1024,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='#f3ebd3'; x.font='bold 44px "Noto Sans TC",sans-serif'; x.fillText(title||'',40,80); x.font='30px "Noto Sans TC",sans-serif'; if(l1) x.fillText(l1,40,150); if(l2) x.fillText(l2,40,210); }); chalk.material.map=t; chalk.material.needsUpdate=true; };
    // 牆上時鐘與投影幕（環境敘事）
    const clock=new THREE.Mesh(new THREE.CircleGeometry(0.28,24),new THREE.MeshBasicMaterial({color:0xf7f4ee})); clock.position.set(6.2,3.0,-5.88); g.add(clock); const clockRim=new THREE.Mesh(new THREE.RingGeometry(0.26,0.3,24),new THREE.MeshBasicMaterial({color:0x2b2b2b})); clockRim.position.set(6.2,3.0,-5.87); g.add(clockRim); const hand=new THREE.Mesh(new THREE.PlaneGeometry(0.03,0.2),new THREE.MeshBasicMaterial({color:0x2b2b2b})); hand.position.set(6.2,3.08,-5.86); hand.userData.dyn=true; g.add(hand); z.clockHand=hand;
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(3.2,2.0),new THREE.MeshBasicMaterial({color:0xf2f0ea})); screen.position.set(5.2,2.2,-5.86); g.add(screen);
    const podium=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.1,0.6),M('#8b5e3c')); podium.position.set(-3,0.55,-4.6); g.add(podium); nav.blockRect(-3,-4.6,1.3,0.7,0);
    // 階梯座位（三排長桌）
    z.seats=[]; for(let r=0;r<3;r++){ const zz=-2.6+r*2.2; const step=new THREE.Mesh(new THREE.BoxGeometry(14,0.012,2.2),M('#d9cbb0')); step.position.set(0,0.006,zz); g.add(step);   /* v9.3 第十七批：原本是 0.25／0.5 m 高的階梯平台，但人物和椅子都在地面高度（引擎沒有地形高度），後兩排的椅面和坐著的同學會陷進平台；改成平的，地上一塊淺色地墊標出座位區 */ desk(g,nav,0,zz-0.5,0,12,0.6,'#c9a57a'); for(let i=0;i<8;i++){ const x=-5.25+i*1.5; chair(g,x,zz+0.3,Math.PI,'#4a5a78'); z.seats.push({x,z:zz+0.3,yaw:Math.PI,row:r,col:i}); } }
    for(const [x,zz] of [[-4.5,-0.4],[2.2,1.8],[5.2,-2.6],[-1.2,1.8]]){ PROP(g,'prop.bag',x+0.3,0,zz+0.75,0.6); } PROP(g,'prop.bottle',-0.75,0.78,-0.9); PROP(g,'prop.cup',3.75,0.78,1.3);
    // 座位互動（只登記幾個，避免太多）
    for(const s of z.seats){ if(s.col%2===1) E.interactables.push({x:s.x,z:s.z,radius:0.9,label:'坐下',seat:s}); }
    E.interactables.push({x:0,z:5.6,radius:1.6,label:'離開教室',exit:{to:'campus',spawn:{x:34,z:-97.6,yaw:0}}});
    z.spawn={x:0,z:4.6,yaw:Math.PI}; z.teacherSpot={x:-1.5,z:-4.4,yaw:0}; return z; } };
  // ---------- 萬才館大廳／研討室 ----------
  const wancai={ id:'wancai', name:'萬才館 大廳', indoor:true, camDist:4.6, build(E){ const z=room(E,{w:18,d:14,h:4.2,wallColor:'#eae1d3',spawn:{x:0,z:6,yaw:Math.PI}}); const g=z.group, nav=z.nav; for(let i=0;i<4;i++){ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,4.2,12),M('#d9cbb0')); col.position.set(-6+i*4,2.1,-2); g.add(col); nav.blockCircle(-6+i*4,-2,0.4); } const sofa=(x,zz,rot)=>{ /* v9.3 第十七批：原本是兩個方塊；改成底座、兩塊坐墊、靠背、扶手、短腳（佔地、導航、座位不變）*/ const sg=new THREE.Group(); sg.position.set(x,0,zz); sg.rotation.y=rot; g.add(sg); const sb=new TK.Bin(); const fab=M('#3e5a48',{rough:0.85}), fab2=M('#2f5d50',{rough:0.85}), lg=M('#3a2a20',{rough:0.6}); sb.add(fab2,new THREE.BoxGeometry(2.2,0.22,0.86),0,0.19,0); for(const sx of [-0.49,0.49]) sb.add(fab,new THREE.BoxGeometry(0.96,0.14,0.66),sx,0.37,0.08); sb.add(fab2,new THREE.BoxGeometry(2.0,0.52,0.2),0,0.56,-0.33,0,{rx:-0.08}); for(const sx of [-1,1]) sb.add(fab2,new THREE.BoxGeometry(0.16,0.34,0.86),sx*1.02,0.43,0); for(const [lx,lz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) sb.add(lg,new THREE.BoxGeometry(0.06,0.08,0.06),lx*1.0,0.04,lz*0.36); sb.build(sg); nav.blockRect(x,zz,2.2,0.9,rot,0.1); E.interactables.push({x:x+Math.sin(rot)*0.7,z:zz+Math.cos(rot)*0.7,radius:1.2,label:'坐在沙發上',seat:{x:x,z:zz,yaw:rot}}); }; sofa(-5,2,0); sofa(5,2,0); const table=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,0.06,24),M('#c9a57a')); table.position.set(0,0.5,2); g.add(table); /* v9.3 第十七批：原本桌面浮在半空中，加上桌腳和底座 */ const tst=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.06,0.47,10),M('#4a4f55',{rough:0.45})); tst.position.set(0,0.235,2); g.add(tst); const tbs=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.32,0.03,20),M('#4a4f55',{rough:0.45})); tbs.position.set(0,0.015,2); g.add(tbs);
    const bb=W3.bulletin(); bb.position.set(6,0,-6.6); g.add(bb); nav.blockRect(6,-6.6,2.6,0.4,0); E.interactables.push({x:6,z:-5.6,radius:1.6,label:'看公告：法律服務社招募',notice:'lawclub'});
    const sp=W3.signPlane('演講廳 →',2.2,0.5,{color:'#3b2a1e'}); sp.position.set(-7,2.6,-6.85); g.add(sp);
    E.interactables.push({x:0,z:6.6,radius:1.6,label:'離開萬才館',exit:{to:'campus',spawn:{x:79.5,z:-92.2,yaw:0}}});   /* 第十九批：萬才館大台階下面（舊的門口 88,-98 現在在台階旁邊）*/ return z; } };
  // ---------- 總圖閱覽室 ----------
  const library={ id:'library', name:'總圖書館 閱覽室', indoor:true, camDist:4.4, build(E){ const z=room(E,{w:22,d:16,h:4.0,cool:true,wallColor:'#efe8dc',floorTex:W3.stoneTex('#d9cbb0'),spawn:{x:0,z:7,yaw:Math.PI}}); const g=z.group, nav=z.nav; shelfWall(g,nav,-9,-7.6,0,10); shelfWall(g,nav,9,-7.6,0,10); shelfWall(g,nav,-10.8,0,Math.PI/2,12); z.seats=[]; for(let r=0;r<3;r++){ for(let c=0;c<2;c++){ const x=-4+c*8, zz=-3+r*3.6; desk(g,nav,x,zz,0,5,1.2,'#c9a57a','wood'); for(let i=0;i<3;i++){ const lamp=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.18,10,1,true),M('#2f5d50',{rough:0.5})); lamp.position.set(x-1.6+i*1.6,1.05,zz); g.add(lamp); const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.28,6),M('#c9a24f')); stem.position.set(x-1.6+i*1.6,0.9,zz); g.add(stem); const glow=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,6),new THREE.MeshBasicMaterial({color:0xffe9a8})); glow.position.set(x-1.6+i*1.6,1.0,zz); g.add(glow); }
      for(let i=0;i<3;i++){ for(const s of [-1,1]){ const cx=x-1.6+i*1.6, cz=zz+s*0.9; chair(g,cx,cz,s>0?Math.PI:0,'#5c3a21'); z.seats.push({x:cx,z:cz,yaw:s>0?Math.PI:0}); if(i%2===0) E.interactables.push({x:cx,z:cz,radius:0.9,label:'坐下讀書',seat:{x:cx,z:cz,yaw:s>0?Math.PI:0},study:true}); } } } }
    for(const [x,zz] of [[-4,-3],[4,-3],[-4,0.6],[4,4.2]]){ PROP(g,'prop.bottle',x+1.9,0.77,zz+0.35); PROP(g,'prop.bagFlat',x-2.4,0,zz+1.3,0.6); } PROP(g,'prop.cup',-2.6,0.77,0.6-0.3);
    E.interactables.push({x:0,z:7.6,radius:1.6,label:'離開圖書館',exit:{to:'campus',spawn:{x:80,z:0,yaw:-Math.PI/2}}}); return z; } };
  // ---------- 溫州街咖啡廳 ----------
  const cafe={ id:'cafe', name:'兩點半 Café', indoor:true, camDist:4.2, build(E){ const z=room(E,{w:14,d:12,h:3.4,warm:true,wallColor:'#e8dcc4',floorTex:W3.canvasTex('woodfloor',256,256,(x,w,h)=>{ x.fillStyle='#a8744a'; x.fillRect(0,0,w,h); x.strokeStyle='rgba(60,30,10,0.35)'; x.lineWidth=2; for(let j=0;j<h;j+=32){ x.beginPath(); x.moveTo(0,j); x.lineTo(w,j); x.stroke(); } for(let j=0;j<h/32;j++){ const off=(j%2)*64; for(let i=off;i<w;i+=128){ x.beginPath(); x.moveTo(i,j*32); x.lineTo(i,j*32+32); x.stroke(); } } }),spawn:{x:0,z:5,yaw:Math.PI}}); const g=z.group, nav=z.nav;
    // 吧檯
    const bar=new THREE.Mesh(new THREE.BoxGeometry(7,1.05,0.9),M('#5c3a21',{rough:0.6})); bar.position.set(-2.5,0.52,-4.4); g.add(bar); nav.blockRect(-2.5,-4.4,7,0.9,0,0.15); const top=new THREE.Mesh(new THREE.BoxGeometry(7.2,0.06,1.0),M('#d9cbb0',{rough:0.4})); top.position.set(-2.5,1.08,-4.4); g.add(top); const machine=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.6,0.6),M('#8f9399',{rough:0.3})); machine.position.set(-4.5,1.4,-4.8); g.add(machine); shelfWall(g,nav,-2.5,-5.75,0,7);
    for(let i=0;i<3;i++){ const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),new THREE.MeshBasicMaterial({color:0xffcf8a})); bulb.position.set(-5+i*2.5,2.4,-3.6); g.add(bulb); const cord=new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.9,4),M('#2b2118')); cord.position.set(-5+i*2.5,2.9,-3.6); g.add(cord); }
    // 窗邊雙人桌 ×2、中間桌 ×2、吧檯座
    z.seats=[]; const twoTop=(x,zz,label)=>{ const t=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.05,16),M('#c9a57a',{rough:0.5})); t.position.set(x,0.74,zz); g.add(t); const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.2,0.72,10),M('#3a3f46')); leg.position.set(x,0.36,zz); g.add(leg); nav.blockCircle(x,zz,0.5); for(const s of [-1,1]){ chair(g,x,zz+s*0.8,s>0?Math.PI:0,'#3b2a1e'); z.seats.push({x,z:zz+s*0.8,yaw:s>0?Math.PI:0,pair:x+','+zz}); } E.interactables.push({x,z:zz+0.8,radius:1.1,label:label||'坐在這一桌',seat:{x,z:zz+0.8,yaw:Math.PI},pairSeat:{x,z:zz-0.8,yaw:0},cafeTable:true}); };
    twoTop(4.5,-2.5,'坐在窗邊的雙人桌'); twoTop(4.5,1.5,'坐在窗邊的雙人桌'); twoTop(0,1.5); twoTop(-4,2.5);
    // 桌上吊燈（暖光；夜晚是店裡主要的光）
    for(const [x,zz] of [[4.5,-2.5],[4.5,1.5],[0,1.5],[-4,2.5]]){ const cord=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,1.1,4),M('#2b2118')); cord.position.set(x,2.85,zz); g.add(cord); const shade=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.24,14,1,true),M('#2f2a26',{rough:0.5})); shade.material.side=THREE.DoubleSide; shade.position.set(x,2.3,zz); g.add(shade); const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),new THREE.MeshBasicMaterial({color:0xffd9a0})); bulb.position.set(x,2.22,zz); g.add(bulb); const glow=new THREE.Mesh(new THREE.CircleGeometry(0.9,16),new THREE.MeshBasicMaterial({color:0xffb870,transparent:true,opacity:0.16,depthWrite:false,blending:THREE.AdditiveBlending})); glow.rotation.x=-Math.PI/2; glow.position.set(x,0.775,zz); g.add(glow); }
    for(const [x,zz] of [[4.5,-2.5],[4.5,1.5],[0,1.5],[-4,2.5]]){ PROP(g,'prop.cupSaucer',x-0.15,0.77,zz+0.2,0.5); if(zz>0) PROP(g,'prop.glass',x+0.2,0.77,zz-0.2); } PROP(g,'prop.cup',-3.5,1.11,-4.4); PROP(g,'prop.cup',-1.2,1.11,-4.3,0.4); PROP(g,'prop.bagFlat',5.6,0,0.2,0.3); PROP(g,'prop.bottle',0.25,0.77,1.35);
    { /* 吧檯椅（v9.3 第十七批：原本是三個實心圓柱）：木坐墊、金屬立柱、腳踏環、底座 */ const sb=new TK.Bin(); const wd=M('#3b2a1e',{rough:0.6}), mt=M('#4a4f55',{rough:0.4}); for(let i=0;i<3;i++){ const sx=-4.5+i*1.6, sz=-3.3; sb.add(wd,new THREE.CylinderGeometry(0.19,0.17,0.06,16),sx,0.7,sz); sb.add(mt,new THREE.CylinderGeometry(0.03,0.03,0.64,8),sx,0.36,sz); sb.add(mt,new THREE.TorusGeometry(0.16,0.012,6,16),sx,0.28,sz,0,{rx:Math.PI/2}); sb.add(mt,new THREE.CylinderGeometry(0.2,0.22,0.03,16),sx,0.015,sz); } sb.build(g); }
    const menu=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.2,0.05),M('#2b2118')); menu.position.set(2,2.4,-5.85); g.add(menu); const mp=W3.signPlane('拿鐵 120 ・ 手沖 150 ・ 檸檬塔 110',2.3,0.5,{color:'#f4ead8',size:44}); mp.position.set(2,2.5,-5.8); g.add(mp); const mp2=W3.signPlane('營業至 02:30 ・ 讀書免低消',2.3,0.4,{color:'#c9a24f',size:40}); mp2.position.set(2,2.05,-5.8); g.add(mp2);
    // 窗（右側牆）
    for(let i=0;i<2;i++){ const win=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.8),new THREE.MeshBasicMaterial({color:0xcfe3ea})); win.position.set(6.88,2.0,-2.5+i*4); win.rotation.y=-Math.PI/2; win.userData.dyn=true; g.add(win); z.wins=z.wins||[]; z.wins.push(win); }
    E.interactables.push({x:-2.5,z:-3.2,radius:1.6,label:'到吧檯點餐',counter:'cafe'});
    E.interactables.push({x:0,z:5.6,radius:1.6,label:'離開咖啡廳',exit:{to:'wenzhou',spawn:{x:51.7,z:0,yaw:-Math.PI/2}}}); z.spawn={x:0,z:4.6,yaw:Math.PI}; return z; } };
  // ---------- 便利商店 ----------
  const cvs={ id:'cvs', name:'全日便利商店', indoor:true, camDist:4.0, build(E){ const z=room(E,{w:12,d:9,h:3.2,wallColor:'#f4f1ea',floorTex:W3.stoneTex('#e8e4da'),spawn:{x:0,z:3.5,yaw:Math.PI},winWall:'front',winXs:[-3.6,3.6]});   /* 窗在店面（後牆是貨架）*/ const g=z.group, nav=z.nav; goodsWall(g,nav,-4.5,-4.2,0,6); goodsWall(g,nav,4.5,-4.2,0,3); for(let i=0;i<2;i++){ goodsWall(g,nav,-2+i*4,0,Math.PI/2,5); }   /* v9.3 第十五批：原本是書架（shelfWall）*/ const counter=new THREE.Mesh(new THREE.BoxGeometry(3,1.0,0.8),M('#d9d3c6',{rough:0.5})); counter.position.set(4,0.5,-1.5); g.add(counter); nav.blockRect(4,-1.5,3,0.8,0,0.15); const fridge=new THREE.Mesh(new THREE.BoxGeometry(0.8,2.2,4),new THREE.MeshStandardMaterial({color:0xbcd6df,roughness:0.2,metalness:0.1})); fridge.position.set(5.6,1.1,2); g.add(fridge); nav.blockRect(5.6,2,0.8,4,0,0.1); const glow=new THREE.Mesh(new THREE.PlaneGeometry(3.8,1.8),new THREE.MeshBasicMaterial({color:0xe6f5ff})); glow.position.set(5.19,1.2,2); glow.rotation.y=-Math.PI/2; g.add(glow);
    for(let i=0;i<4;i++){ PROP(g,'prop.riceBall',-6+i*0.35,2.07,-4.05,0.2); PROP(g,'prop.sandwich',-4.2+i*0.4,2.07,-4.05); } for(let i=0;i<6;i++){ PROP(g,'prop.sodaCan',5.45,1.6+(i%3)*0.3,0.6+Math.floor(i/3)*0.5); } PROP(g,'prop.riceBall',3.4,1.02,-1.5); PROP(g,'prop.bag',4.9,1.02,-1.4,0.6);
    E.interactables.push({x:3.2,z:-0.6,radius:1.4,label:'結帳：飯糰／咖啡／飲料',shop:'cvs'}); E.interactables.push({x:0,z:4.2,radius:1.5,label:'離開便利商店',exit:{to:'gongguan',spawn:{x:-29.4,z:18,yaw:Math.PI}}}); return z; } };
  // ---------- 麵店 ----------
  const noodle={ id:'noodle', name:'阿鳳麵店', indoor:true, camDist:4.0, build(E){ const z=room(E,{w:10,d:9,h:3.2,warm:true,wallColor:'#f1e7d6',floorTex:W3.stoneTex('#d9cbb0'),spawn:{x:0,z:3.5,yaw:Math.PI},winWall:'front',winXs:[-3,3]});   /* 窗在店面那一面（後牆是廚房和價目表）*/ const g=z.group, nav=z.nav; const kitchen=new THREE.Mesh(new THREE.BoxGeometry(6,1.0,1.2),M('#8f9399',{rough:0.4})); kitchen.position.set(-1,0.5,-3.8); g.add(kitchen); nav.blockRect(-1,-3.8,6,1.2,0,0.15); const pot=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.5,14),M('#3a3f46',{rough:0.4})); pot.position.set(-2,1.25,-3.8); g.add(pot); z.seats=[]; for(let i=0;i<3;i++){ const x=-3+i*3; desk(g,nav,x,0.5,0,1.4,0.9,'#d9cbb0'); for(const s of [-1,1]){ chair(g,x,0.5+s*0.8,s>0?Math.PI:0,'#c9463d'); z.seats.push({x,z:0.5+s*0.8,yaw:s>0?Math.PI:0}); } E.interactables.push({x,z:1.3,radius:1.1,label:'坐下吃麵',seat:{x,z:1.3,yaw:Math.PI},pairSeat:{x,z:-0.3,yaw:0},eat:'noodle'}); }
    for(let i=0;i<3;i++){ const x=-3+i*3; PROP(g,'prop.bowl',x-0.2,0.77,0.5+0.25); PROP(g,'prop.chopstick',x+0.15,0.78,0.45,0.3); if(i===1) PROP(g,'prop.bowl',x+0.25,0.77,0.5-0.25,2.4); } PROP(g,'prop.bowl',-1.5,1.02,-3.8); PROP(g,'prop.bowl',-0.9,1.02,-3.7,1.2);
    const mp=W3.signPlane('乾麵 60 ・ 餛飩湯 70 ・ 滷蛋 15',3,0.6,{color:'#3b2a1e',size:44}); mp.position.set(0,2.4,-4.35); g.add(mp); E.interactables.push({x:0,z:4.2,radius:1.5,label:'離開麵店',exit:{to:'gongguan',spawn:{x:-63,z:18,yaw:Math.PI}}}); return z; } };
  // ---------- 書店 ----------
  const bookstore={ id:'bookstore', name:'舊路書房', indoor:true, camDist:4.0, build(E){ const z=room(E,{w:12,d:10,h:3.4,wallColor:'#efe6d6',floorTex:W3.canvasTex('woodfloor2',256,256,(x,w,h)=>{ x.fillStyle='#b98a5f'; x.fillRect(0,0,w,h); x.strokeStyle='rgba(60,30,10,0.3)'; x.lineWidth=2; for(let j=0;j<h;j+=32){ x.beginPath(); x.moveTo(0,j); x.lineTo(w,j); x.stroke(); } }),spawn:{x:0,z:4,yaw:Math.PI},winWall:'front',winXs:[-3.5,3.5]}); /* 窗在店面那一面（後牆是書架）*/ const g=z.group, nav=z.nav; shelfWall(g,nav,0,-4.7,0,11); shelfWall(g,nav,-5.7,0,Math.PI/2,8); shelfWall(g,nav,5.7,0,Math.PI/2,8); shelfWall(g,nav,-2,0,Math.PI/2,5); shelfWall(g,nav,2,0,Math.PI/2,5); const table=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.8,1.2),M('#8b5e3c')); table.position.set(0,0.4,3); g.add(table); nav.blockRect(0,3,2.4,1.2,0,0.1); E.interactables.push({x:0,z:2,radius:1.4,label:'看看法律書與文具',shop:'book'}); E.interactables.push({x:0,z:4.6,radius:1.5,label:'離開書店',exit:{to:'gongguan',spawn:{x:-42,z:18,yaw:Math.PI}}}); return z; } };
  // ---------- 宿舍房間 ----------
  const dorm={ id:'dorm', name:'宿舍 房間', indoor:true, camDist:3.6, build(E){ const z=room(E,{w:6,d:7,h:3.0,wallColor:'#f1ebe0',floorTex:W3.stoneTex('#e3d9c6'),spawn:{x:0,z:2.8,yaw:Math.PI},winXs:[1.5],curtains:'#c9b48a'}); const g=z.group, nav=z.nav; // 床、書桌、室友桌（v9.3 第十五批：窗原本在書架後面，移到書桌上方；加窗簾）
    { /* 床（v9.3 第十七批：原本是三個方塊）：木床架＋床頭板、床墊、被子（床尾摺起一段）、枕頭；佔地與導航不變 */ const bb=new TK.Bin(), bx=-2.2, bz=-1.5; const wood=M('#a9825c',{rough:0.7});
      bb.add(wood,new THREE.BoxGeometry(1.1,0.28,2.1),bx,0.2,bz); for(const [lx,lz] of [[-0.5,-0.98],[0.5,-0.98],[-0.5,0.98],[0.5,0.98]]) bb.add(wood,new THREE.BoxGeometry(0.07,0.07,0.07),bx+lx,0.035,bz+lz); bb.add(wood,new THREE.BoxGeometry(1.14,0.9,0.06),bx,0.45,bz-1.08); bb.add(wood,new THREE.BoxGeometry(1.18,0.05,0.09),bx,0.92,bz-1.08);
      bb.add(M('#efe9dd',{rough:0.9}),new THREE.BoxGeometry(1.0,0.18,2.0),bx,0.43,bz); bb.add(M('#4a6c8c',{rough:0.95}),new THREE.BoxGeometry(1.04,0.06,1.42),bx,0.55,bz+0.28); bb.add(M('#5d7f9f',{rough:0.95}),new THREE.BoxGeometry(1.06,0.1,0.34),bx,0.58,bz+0.8);
      const pw=new THREE.SphereGeometry(1,16,8); pw.scale(0.33,0.075,0.19); bb.add(M('#ffffff',{rough:0.9}),pw,bx,0.6,bz-0.78); bb.build(g); } nav.blockRect(-2.2,-1.5,1.1,2.1,0,0.1); nav.blockRect(-2.3,-2.95,1.4,0.7,0,0); /* 床頭和書架之間的窄縫（約 0.5 m，比人窄）：同書桌後面，整段不可走 */
    desk(g,nav,1.8,-2.6,0,1.6,0.7,'#c9a57a'); nav.blockRect(1.45,-3.25,2.3,0.6,0,0); /* 書桌後面和後牆之間只有約 0.5 m（比人窄），沿牆滑進去會卡在只有一個點站得住的小空隙（v9.3 #31）：整段不可走 */ chair(g,1.8,-1.9,Math.PI,'#3a3f46'); desk(g,nav,1.8,1.5,0,1.6,0.7,'#c9a57a'); chair(g,1.8,2.2,Math.PI,'#3a3f46'); const mon=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.4,0.04),M('#2b2b2b')); mon.position.set(1.8,1.05,1.3); g.add(mon); const mon2=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.4,0.04),M('#2b2b2b')); mon2.position.set(1.3,1.05,1.35); mon2.rotation.y=0.3; g.add(mon2); const screen=new THREE.Mesh(new THREE.PlaneGeometry(0.56,0.36),new THREE.MeshBasicMaterial({color:0x8fb8d8})); screen.position.set(1.8,1.05,1.32); g.add(screen);
    z.deskItems=new THREE.Group(); z.deskItems.position.set(1.8,0.77,-2.6); g.add(z.deskItems); shelfWall(g,nav,-1,-3.3,0,2.4); PROP(g,'prop.cup',2.3,0.77,-2.5); PROP(g,'prop.bottle',1.3,0.77,1.4); PROP(g,'prop.bag',2.55,0,-1.6,0.8); PROP(g,'prop.pizzaBox',0.8,0.77,1.6,0.3); PROP(g,'prop.sodaCan',2.35,0.77,1.55);
    // v9.3 第十五批：檯燈（燈罩裡一直亮著）、牆上的月曆、床頭的社團傳單（法律服務社，和校園社團攤位同一個社團）
    { const lamp=new THREE.Group(); const base=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.08,0.02,16),M('#3a3f46')); base.position.y=0.01; lamp.add(base); const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.38,6),M('#3a3f46')); arm.position.set(0,0.19,0.03); arm.rotation.x=-0.18; lamp.add(arm); const shade=new THREE.Mesh(new THREE.ConeGeometry(0.085,0.12,16,1,true),M('#3a3f46')); shade.position.set(0,0.4,0.1); shade.rotation.x=0.6; lamp.add(shade); const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.03,10,8),new THREE.MeshBasicMaterial({color:0xfff1c8})); bulb.position.set(0,0.37,0.12); lamp.add(bulb); lamp.position.set(2.45,0.77,-2.85); lamp.rotation.y=-0.4; g.add(lamp); }
    { const cal=W3.canvasTex('dormCal',128,176,(x,w,h)=>{ x.fillStyle='#fbfaf6'; x.fillRect(0,0,w,h); x.fillStyle='#b0332a'; x.fillRect(0,0,w,34); x.fillStyle='#ffffff'; x.font='bold 22px "Noto Sans TC",sans-serif'; x.fillText('10 月',36,25); x.fillStyle='#555'; x.font='12px sans-serif'; for(let r=0;r<5;r++) for(let c=0;c<7;c++){ const d=r*7+c-2; if(d>=1&&d<=31) x.fillText(String(d),8+c*17,58+r*24); } x.strokeStyle='#b0332a'; x.lineWidth=2; x.beginPath(); x.arc(8+4*17+6,58+2*24-4,9,0,7); x.stroke(); });
      const cm=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.55),new THREE.MeshStandardMaterial({map:cal,roughness:0.9})); cm.position.set(2.88,1.75,-0.9); cm.rotation.y=-Math.PI/2; g.add(cm);
      const fly=W3.canvasTex('dormFlyer',128,180,(x,w,h)=>{ x.fillStyle='#f4ead8'; x.fillRect(0,0,w,h); x.fillStyle='#2f5d50'; x.fillRect(0,0,w,46); x.fillStyle='#f4ead8'; x.font='bold 18px "Noto Sans TC",sans-serif'; x.fillText('法律服務社',18,29); x.fillStyle='#2f5d50'; x.font='bold 15px "Noto Sans TC",sans-serif'; x.fillText('招 新 中',36,74); x.fillStyle='#555'; x.font='11px "Noto Sans TC",sans-serif'; ['一年級也可以','週三晚上 社課','萬才館 社辦'].forEach((t,i)=>x.fillText(t,22,104+i*20)); x.fillStyle='#c9a24a'; x.fillRect(16,164,96,4); });
      const fm=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.6),new THREE.MeshStandardMaterial({map:fly,roughness:0.9})); fm.position.set(-2.88,1.75,-1.3); fm.rotation.y=Math.PI/2; g.add(fm); }
    E.interactables.push({x:1.8,z:-1.9,radius:1.0,label:'坐在書桌前',seat:{x:1.8,z:-1.9,yaw:Math.PI},deskStudy:true}); E.interactables.push({x:-1.4,z:-1.5,radius:1.1,label:'睡覺',sleep:true}); E.interactables.push({x:0,z:3.3,radius:1.4,label:'離開宿舍',exit:{to:'campus',spawn:{x:20,z:54,yaw:Math.PI}}}); return z; } };
  const ZONES={campus,gongguan,wenzhou,classroom,wancai,library,cafe,cvs,noodle,bookstore,dorm};
  return {ZONES,room,desk,chair,glowTex};
})();

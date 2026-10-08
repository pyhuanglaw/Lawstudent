/* ===== 世界區域定義：台大核心校園（法學院→校園道路→椰林大道→校門）、公館、溫州街、室內 ===== */
'use strict';
const Z3 = (function(){
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.95},o||{}));
  const texMat=(t,rep,o)=>{ const m=new THREE.MeshStandardMaterial(Object.assign({map:t,roughness:0.95,metalness:0},o||{})); return m; };
  function ground(g,w,d,tex,rep,x,z,y){ const t=tex.clone(); t.needsUpdate=true; t.repeat.set(rep[0],rep[1]); const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),texMat(t)); m.rotation.x=-Math.PI/2; m.position.set(x||0,y||0,z||0); m.receiveShadow=true; g.add(m); return m; }
  function strip(g,x0,z0,x1,z1,w,tex,rep){ const dx=x1-x0, dz=z1-z0; const len=Math.hypot(dx,dz); const t=tex.clone(); t.needsUpdate=true; t.repeat.set(w/rep,len/rep); const m=new THREE.Mesh(new THREE.PlaneGeometry(w,len),texMat(t)); m.rotation.x=-Math.PI/2; m.rotation.z=-Math.atan2(dx,dz); m.position.set((x0+x1)/2,0.02,(z0+z1)/2); m.receiveShadow=true; g.add(m); return m; }
  function curb(g,x0,z0,x1,z1,w){ const dx=x1-x0, dz=z1-z0; const len=Math.hypot(dx,dz); for(const s of [-1,1]){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.14,len),M('#d9d3c6')); const ang=-Math.atan2(dx,dz); m.rotation.y=ang; m.position.set((x0+x1)/2+Math.cos(ang)*s*(w/2+0.12),0.07,(z0+z1)/2-Math.sin(ang)*s*(w/2+0.12)); g.add(m); } }
  // ---- 資產層：樹／長椅／小道具（有 GLB 就用 GLB，沒有就 fallback 到 W3 placeholder）----
  let treeIdx=0, leafyCount=0; const TREE=(scale)=>{ treeIdx++; const useLeafy=(treeIdx%2===1)&&leafyCount<14; if(useLeafy) leafyCount++; return ASSETS.get(useLeafy?'tree.leafy':'tree.conifer',{height:6*(scale||1)}); };
  const PALM=(h)=>ASSETS.get('tree.palm',{height:h||9});
  const BENCH=()=>ASSETS.get('prop.bench',{});
  const PROP=(g,key,x,y,z,ry,scale)=>{ const o=ASSETS.get(key,{}); if(!o) return null; o.position.set(x,y,z); if(ry) o.rotation.y=ry; if(scale) o.scale.multiplyScalar(scale); g.add(o); return o; };
  function place(g,obj,x,z,ry,scale){ obj.position.set(x,0,z); if(ry) obj.rotation.y=ry; if(scale) obj.scale.setScalar(scale); g.add(obj); return obj; }
  function collider(E,x,z,w,d,h,rot){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h||6,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x,(h||6)/2,z); m.rotation.y=rot||0; E.colliders.push(m); E.scene.add(m); E.zone&&E.zone.group; return m; }
  // ---------- 校園主區 ----------
  const campus={ id:'campus', name:'台大校園', indoor:false, cityLight:0.25, size:[260,170], build(E){
    treeIdx=0; leafyCount=0; const g=new THREE.Group(); const W=260, D=170; /* 導航格必須涵蓋法學院前庭（z 到 -124），否則霖澤館前完全不能走 */ const nav=new E3.NavGrid(W,210,0.5,-W/2,-125); const seats=[]; const lamps=[]; const buildings=[];
    // 地面：草地
    ground(g,W,D,W3.grassTex(),[W/4,D/4],0,0,0); ground(g,120,44,W3.grassTex(),[30,11],52,-106,-0.002); // 北側法學院區地面
    // 主要道路：椰林大道 東西向（z=0），從校門 x=-118 到 x=+70
    strip(g,-124,0,72,0,16,W3.pathTex(),4); curb(g,-124,0,72,0,16);
    // 中央分隔綠帶（杜鵑花圃）：椰林大道中間
    // 中央分隔花圃：每 20m 一個穿越口
    for(let cx=-100;cx<=50;cx+=20){ const len=15; const bed=new THREE.Mesh(new THREE.BoxGeometry(len,0.42,1.3),M('#8a7a66')); bed.position.set(cx+10,0.21,0); g.add(bed); const soil=new THREE.Mesh(new THREE.BoxGeometry(len-0.2,0.1,1.1),M('#5a4636')); soil.position.set(cx+10,0.44,0); g.add(soil); const hedge=new THREE.Mesh(new THREE.BoxGeometry(len-0.6,0.55,0.8,1,1,1),W3.foliageMat('#4e8c57')); hedge.position.set(cx+10,0.72,0); g.add(hedge); for(let x=cx+4;x<=cx+16;x+=4){ const fl=new THREE.Mesh(new THREE.SphereGeometry(0.16,6,5),W3.foliageMat(x%8?'#e07a9a':'#f2f2f2')); fl.position.set(x,1.02,(x%2?0.2:-0.2)); g.add(fl); } nav.blockRect(cx+10,0,len+0.4,1.7,0,0); }
    // 法學院道路：從椰林大道 x=30 向北到法學院區 z=-70
    strip(g,30,0,30,-74,10,W3.pathTex(),4); curb(g,30,0,30,-74,10);
    strip(g,30,-60,110,-60,10,W3.pathTex(),4); curb(g,30,-60,110,-60,10);
    // 通往醉月湖／活動中心的小路
    strip(g,-30,0,-30,-70,6,W3.pathTex(),4);
    // 舟山路（南側）
    strip(g,-110,40,110,40,9,W3.asphaltTex(),6); curb(g,-110,40,110,40,9);
    strip(g,20,0,20,58,6,W3.pathTex(),4);
    // ---- 宿舍（舟山路南側）----
    const dormB=W3.building({key:'dormb',w:36,h:16,d:14,floors:5,style:'grid',wall:'#d9cbb0',glass:'#b9cfd6',frame:'#6b6f76',roof:'parapet',entrance:{w:3,h:3,side:'front',canopy:true,canopyColor:'#6b6f76'},sign:'男一舍',signColor:'#3b2a1e'}); place(g,dormB,20,68,Math.PI); nav.blockRect(20,68,36.6,14.6,0,0.6); buildings.push(dormB); for(const x of [-4,44]){ const b=TREE(1.2); place(g,b,x,60,0); nav.blockCircle(x,60,0.9); }
    // ---- 校門（西端）----
    const gate=W3.gate(); place(g,gate,-124,0,Math.PI/2); nav.blockRect(-123.1,13.5,3.6,4.4,0,0.4); nav.blockRect(-124,-5,2,4,0,0.4); nav.blockRect(-124,5,2,4,0,0.4); nav.blockRect(-124,-10,2,6,0); nav.blockRect(-124,10,2,6,0);
    // 圍牆（校門兩側）
    for(const s of [-1,1]){ const wall=new THREE.Mesh(new THREE.BoxGeometry(1,1.8,70),texMat(W3.brickTex('#b8735a'))); wall.position.set(-124,0.9,s*45); g.add(wall); nav.blockRect(-124,s*45,1.2,70,0,0.3); }
    // ---- 椰林大道：大王椰子 ----
    for(let x=-110;x<=60;x+=7.5){ for(const s of [-1,1]){ const p=PALM(9+((x*7)%3)); place(g,p,x,s*9.5,(x*0.3)%6.28); nav.blockCircle(x,s*9.5,0.5); } }
    // 兩側草地小徑與長椅、腳踏車
    for(let x=-100;x<=50;x+=25){ for(const s of [-1,1]){ const b=BENCH(); place(g,b,x,s*13,s>0?Math.PI:0); nav.blockRect(x,s*13,2.0,0.7,0); seats.push({x,z:s*13+(s>0?-0.55:0.55),yaw:s>0?Math.PI:0,label:'坐在椰林大道的長椅上'}); } }
    for(let x=-90;x<=40;x+=32){ const r=W3.bikeRack(7); place(g,r,x+8,-16,0); nav.blockRect(x+8,-16,5,1.4,0); }
    for(let x=-105;x<=55;x+=22){ for(const s of [-1,1]){ const l=W3.lampPost(); place(g,l,x,s*11,s>0?0:Math.PI); lamps.push(l); nav.blockCircle(x,s*11,0.25); } }
    // ---- 傅鐘（大道中段北側小廣場）----
    const plaza=ground(g,26,20,W3.stoneTex('#e3d9c6'),[6,5],-32,-20,0.015); const bell=W3.bell(); place(g,bell,-32,-22,0); nav.blockCircle(-32,-22,2.0); for(const [x,z] of [[-42,-16],[-22,-16]]){ const b=TREE(1.3); place(g,b,x,z,0); nav.blockCircle(x,z,0.9); }
    for(const x of [-40,-24]){ const b=BENCH(); place(g,b,x,-27,0); nav.blockRect(x,-27,2,0.7,0); seats.push({x,z:-27+0.55,yaw:0,label:'坐在傅鐘旁的長椅'}); }
    // ---- 行政大樓（南側，靠近校門）：大圓柱、對稱 ----
    const admin=W3.building({key:'admin',w:46,h:11,d:16,floors:3,style:'arch',wall:'#e8dcc4',glass:'#b9cfd6',frame:'#6b5a4a',roof:'hip',roofColor:'#7a4a3a',roofH:2.6,entrance:{w:3.6,h:3.6,side:'back',canopy:false,stepColor:'#cfc5b2'},sign:'行政大樓',signColor:'#3b2a1e'}); place(g,admin,-78,28,0); nav.blockRect(-78,28,46.6,16.6,0,0.6); buildings.push(admin); for(let i=0;i<6;i++){ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,9,14),M('#efe6d6')); col.position.set(-78-15+i*6,4.5,28-8.6); g.add(col); nav.blockCircle(col.position.x,col.position.z,0.7); }
    // ---- 文學院（北側）：仿羅馬式拱窗 ----
    const arts=W3.building({key:'arts',w:52,h:10,d:18,floors:2,style:'arch',wall:'#d9a98c',glass:'#b9cfd6',frame:'#5c3a21',roof:'hip',roofColor:'#6e4636',roofH:3,entrance:{w:3.4,h:3.8,side:'front',canopy:false,stepColor:'#cfc5b2'},sign:'文學院',signColor:'#3b2a1e'}); place(g,arts,-70,-34,0); nav.blockRect(-70,-34,52.6,18.6,0,0.6); buildings.push(arts);
    // ---- 農業陳列館（洞洞館）北側近校門 ----
    const hole=W3.building({key:'hole',w:22,h:9,d:14,floors:2,style:'grid',wall:'#e6dfd0',glass:'#c8d8de',frame:'#8f9399',roof:'parapet',entrance:{w:3,h:3,side:'front',canopy:false},sign:'農業陳列館'}); place(g,hole,-104,-30,0); nav.blockRect(-104,-30,22.6,14.6,0,0.6); buildings.push(hole);
    // 洞洞館的外牆格柵（琉璃筒瓦意象：以格柵近似）
    { const grille=new THREE.Mesh(new THREE.BoxGeometry(22.4,7,0.3),texMat(W3.canvasTex('grille',128,128,(x,w,h)=>{ x.fillStyle='#cfc2ad'; x.fillRect(0,0,w,h); x.fillStyle='#8a7a66'; for(let j=8;j<h;j+=16) for(let i=8;i<w;i+=16){ x.beginPath(); x.arc(i,j,5,0,Math.PI*2); x.fill(); } }),null,{transparent:false})); grille.material.map.repeat.set(8,3); grille.position.set(-104,4.6,-30+7.35); g.add(grille); }
    // ---- 校史館（舊總圖）：椰林大道東端，紅磚拱窗、圓石柱、屋瓦 ----
    const hist=W3.building({key:'hist',w:34,h:12,d:18,floors:2,style:'arch',wall:'#c5806a',glass:'#b9cfd6',frame:'#5c3a21',roof:'hip',roofColor:'#5c3a2a',roofH:3.4,entrance:{w:3.8,h:4.2,side:'front',canopy:false,stepColor:'#cfc5b2',frame:'#8b5e3c'},sign:'校史館',signColor:'#f4ead8',signBg:'rgba(0,0,0,0)'}); place(g,hist,82,-4,-Math.PI/2); nav.blockRect(82,-4,18.6,34.6,0,0.6); buildings.push(hist); for(let i=0;i<5;i++){ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,8,12),M('#d9cbb0')); col.position.set(82-9.6,4,-4-12+i*6); g.add(col); nav.blockCircle(col.position.x,col.position.z,0.7); }
    // ---- 總圖書館（東北，振興草坪前）----
    const lib=W3.building({key:'lib',w:60,h:18,d:26,floors:4,style:'arch',wall:'#cf8f78',glass:'#bcd6df',frame:'#5c3a21',roof:'hip',roofColor:'#5c3a2a',roofH:4.2,entrance:{w:5,h:4.5,side:'front',canopy:false,stepColor:'#d9cbb0'},sign:'總圖書館',signColor:'#f4ead8',signBg:'rgba(0,0,0,0)',signY:12.5}); place(g,lib,100,-52,-Math.PI/2); nav.blockRect(100,-52,26.6,60.6,0,0.6); buildings.push(lib); ground(g,34,40,W3.grassTex(),[8,10],66,-52,0.01);
    // 總圖：紅磚拱廊門廳（三連拱、山牆）
    { const bm=texMat(W3.brickTex('#c5806a')); const porch=new THREE.Group(); for(let i=-1;i<=1;i++){ for(const sx of [-1,1]){ const pier=new THREE.Mesh(new THREE.BoxGeometry(1.2,6.5,1.2),bm); pier.position.set(0,3.25,i*6+sx*2.4); porch.add(pier); } const arch=new THREE.Mesh(new THREE.TorusGeometry(2.4,0.6,8,16,Math.PI),bm); arch.rotation.y=Math.PI/2; arch.position.set(0,6.5,i*6); porch.add(arch); } const beam=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,19),bm); beam.position.set(0,9.3,0); porch.add(beam); const gable=new THREE.Mesh(new THREE.CylinderGeometry(0,3.2,19,3,1),M('#5c3a2a')); gable.rotation.z=Math.PI/2; gable.rotation.x=Math.PI/2; gable.position.set(0,10.8,0); gable.scale.set(1,1,0.9); porch.add(gable); const roof=new THREE.Mesh(new THREE.BoxGeometry(6,0.3,19.4),M('#5c3a2a')); roof.position.set(0,9.95,0); porch.add(roof); const stepsM=new THREE.Mesh(new THREE.BoxGeometry(6,0.5,10),M('#d9cbb0')); stepsM.position.set(-2.5,0.25,0); porch.add(stepsM); porch.position.set(84.2,0,-52); g.add(porch); nav.blockRect(84.2,-52-6,1.4,5.2,0,0.2); nav.blockRect(84.2,-52+6,1.4,5.2,0,0.2); }
    strip(g,66,-52,84,-52,6,W3.pathTex(),4);
    // ---- 法學院區（東北上方）：霖澤館 ＋ 萬才館 ＋ 社科院 ----
    ground(g,72,24,W3.stoneTex('#e6dccb'),[18,6],61,-94,0.012); strip(g,30,-70,30,-84,10,W3.pathTex(),4); strip(g,88,-70,88,-84,8,W3.pathTex(),4);
    // 法學院前庭：樹列、花圃、矮籬
    for(const x of [22,38,54,70,86]){ const b=TREE(1.15+((x/16)%2)*0.1); place(g,b,x,-80,x*0.4); nav.blockCircle(x,-80,0.9); }
    for(const x of [30,46,62,78]){ const pl=W3.planter(); place(g,pl,x,-83.5,0); nav.blockRect(x,-83.5,1.2,0.5,0); }
    for(const x of [12,100]){ const t=TREE(1.3); place(g,t,x,-96,0); nav.blockCircle(x,-96,0.9); const t2=TREE(1.0); place(g,t2,x+(x<50?-6:6),-108,1); nav.blockCircle(x+(x<50?-6:6),-108,0.8); }
    { const h=W3.hedge(20); h.position.set(48,0.35,-106.5); g.add(h); nav.blockRect(48,-106.5,20,0.7,0,0.1); const h2=W3.hedge(14); h2.position.set(74,0.35,-106.5); g.add(h2); nav.blockRect(74,-106.5,14,0.7,0,0.1); }
    const linze=W3.building({key:'linze',w:40,h:19,d:18,floors:5,style:'band',wall:'#d8cbb2',glass:'#b6d0da',frame:'#5b5f66',bandColor:'#c9b89a',roof:'parapet',ground:'glass',entrance:{w:5,h:4,side:'front',canopy:true,canopyColor:'#7b6a5a',stepColor:'#cfc5b2'},sign:'霖澤館',signColor:'#3b2a1e'}); place(g,linze,34,-112,0); nav.blockRect(34,-112,40.6,18.6,0,0.6); buildings.push(linze);
    const wancai=W3.building({key:'wancai',w:30,h:21,d:20,floors:5,style:'slit',wall:'#b46a55',glass:'#bcd6df',frame:'#3a3f46',roof:'parapet',ground:'glass',entrance:{w:4.4,h:4,side:'front',canopy:true,canopyColor:'#3a3f46',stepColor:'#cfc5b2'},sign:'萬才館',signColor:'#f4ead8'}); place(g,wancai,88,-112,0); nav.blockRect(88,-112,30.6,20.6,0,0.6); buildings.push(wancai);
    const soc=W3.building({key:'soc',w:56,h:16,d:22,floors:4,style:'grid',wall:'#e9e4da',glass:'#c8d8de',frame:'#8f9399',roof:'parapet',ground:'glass',entrance:{w:5,h:4.2,side:'front',canopy:false},sign:'社會科學院',signColor:'#3b2a1e'}); place(g,soc,110,-70,-Math.PI/2); nav.blockRect(110,-70,22.6,56.6,0,0.6); buildings.push(soc);
    // 社科院前的樹狀白柱意象（圖書館的柱）
    for(let i=0;i<7;i++){ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.35,7,10),M('#f4f1ea')); col.position.set(96,3.5,-90+i*6); g.add(col); const cap=new THREE.Mesh(new THREE.CylinderGeometry(1.6,0.6,0.8,10),M('#f4f1ea')); cap.position.set(96,7.2,-90+i*6); g.add(cap); nav.blockCircle(96,-90+i*6,0.5); }
    // 法學院廣場：長椅、腳踏車、樹、公告欄、販賣機
    for(const x of [40,70]){ const b=BENCH(); place(g,b,x,-88,0); nav.blockRect(x,-88,2,0.7,0); seats.push({x,z:-87.45,yaw:0,label:'坐在霖澤館前的長椅'}); }
    
    { const r=W3.bikeRack(9); place(g,r,58,-102,0); nav.blockRect(58,-102,6,1.4,0); const r2=W3.bikeRack(6); place(g,r2,10,-100,0); nav.blockRect(10,-100,4,1.4,0); }
    { const bb=W3.bulletin(); place(g,bb,48,-104,0); nav.blockRect(48,-104,2.6,0.4,0); const v=W3.vending(); place(g,v,14,-105,0); nav.blockRect(14,-105,1.2,0.9,0); }
    for(const [x,z] of [[30,-86],[62,-86],[94,-86],[46,-108],[76,-108]]){ const l=W3.lampPost(); place(g,l,x,z,Math.PI/2); lamps.push(l); nav.blockCircle(x,z,0.25); }
    for(const [x,z] of [[8,-70],[8,-50],[8,-30],[52,-50],[52,-30],[-50,-16],[-10,-16],[20,-20],[40,-20],[-10,18],[-40,18],[10,18],[50,18],[-95,-12],[-60,-56],[-30,-56],[0,-56]]){ const b=TREE(1+((x+z)%3)*0.2); place(g,b,x,z,(x+z)*0.3); nav.blockCircle(x,z,0.8); }
    // 花圃
    for(const x of [-64,-48]){ const p=W3.planter(); place(g,p,x,-13,0); nav.blockRect(x,-13,1.2,0.5,0); }
    // 社團招生攤位（傅鐘廣場東側）：摺疊桌、布條、傳單
    { const tb=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.05,0.7),M('#e8e2d6')); tb.position.set(-14,0.74,-24); g.add(tb); for(const [sx,sz] of [[-0.8,-0.25],[0.8,-0.25],[-0.8,0.25],[0.8,0.25]]){ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.72,0.04),M('#3a3f46')); leg.position.set(-14+sx,0.36,-24+sz); g.add(leg); } const cloth=new THREE.Mesh(new THREE.BoxGeometry(1.85,0.6,0.02),M('#2f5d50')); cloth.position.set(-14,0.42,-23.64); g.add(cloth); const banner=W3.signPlane('法律服務社 招生中 ・ 免費法律諮詢',1.8,0.5,{color:'#ffffff',size:40}); banner.position.set(-14,0.42,-23.62); g.add(banner); const fly=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.02,0.42),M('#ffffff')); fly.position.set(-14.4,0.78,-24); g.add(fly); nav.blockRect(-14,-24,1.9,0.8,0,0.1); E.interactables.push({x:-14,z:-23,radius:1.5,label:'看法律服務社的招生攤位',notice:'lawclub'}); }
    // 路旁散置腳踏車
    for(const [x,z] of [[-60,-15.5],[-30,15.5],[0,-15.5],[24,-64],[36,-64]]){ const b=W3.bike(['#3a6fb0','#8c3b47','#2f5d50','#e0b95b'][(x+z)&3]); place(g,b,x,z,Math.PI/2); nav.blockRect(x,z,1.7,0.6,Math.PI/2); }
    // 邊界
    nav.blockOutside(-123,-124,125,84); nav.blockRect(-59,-104,128,40,0,0); nav.blockRect(112.5,-104,25,40,0,0); nav.blockRect(-123,0,2,8,0,0); // 北側只留法學院前庭（x 5–100）可走；校門通道保留
    // 校門通道格：確保 -124..-118 之間可走（往公館）
    for(let z=-4;z<=4;z+=0.5) for(let x=-127;x<=-118;x+=0.5){ const [cx,cz]=nav.toCell(x,z); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    // 碰撞盒（鏡頭用）
    const boxes=[[20,68,36,14],[-78,28,46,16],[-70,-34,52,18],[-104,-30,22,14],[82,-4,18,34],[100,-52,26,60],[34,-112,40,18],[88,-112,30,20],[110,-70,22,56]]; for(const [x,z,w,d] of boxes){ const h=12; const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x,h/2,z); g.add(m); E.colliders.push(m); }
    // 燈光光暈
    for(const l of lamps){ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd88a,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(3,3,1); glow.position.set(0,3.9,0.75); l.add(glow); glow.visible=false; E.lampGlows.push(glow); const pool=new THREE.Mesh(new THREE.CircleGeometry(4.2,16),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(0,0.03,0.75); l.add(pool); pool.visible=false; E.lampGlows.push(pool); }
    // 出口
    const exits=[{x:-126,z:0,r:3,to:'gongguan',spawn:{x:-2.5,z:-29,yaw:0},label:'走出校門'},{x:34,z:-102,r:2.2,to:'classroom',spawn:{x:0,z:5,yaw:Math.PI},label:'進入霖澤館',door:true},{x:88,z:-101,r:2.2,to:'wancai',spawn:{x:0,z:5,yaw:Math.PI},label:'進入萬才館',door:true},{x:83,z:-52,r:2.6,to:'library',spawn:{x:0,z:7,yaw:Math.PI},label:'進入總圖書館',door:true},{x:20,z:58.5,r:2.4,to:'dorm',spawn:{x:0,z:2.4,yaw:Math.PI},label:'回宿舍',door:true}];
    for(const ex of exits){ E.interactables.push({x:ex.x,z:ex.z,radius:ex.r,label:ex.label,exit:ex}); }
    // 座位互動
    for(const s of seats){ E.interactables.push({x:s.x,z:s.z,radius:1.6,label:s.label,seat:s}); }
    const zone={group:g,nav,spawn:{x:34,z:-98,yaw:0},seats,lamps,buildings,exits,
      onLamps(on){ for(const b of buildings) W3.setNight(b,on); },
      update(dt,E){},
    };
    return zone; } };
  function glowTex(){ return W3.canvasTex('glow',64,64,(x,w,h)=>{ const g=x.createRadialGradient(32,32,2,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.4,'rgba(255,255,255,0.35)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,w,h); }); }
  // ---------- 公館商圈 ----------
  const gongguan={ id:'gongguan', name:'公館', indoor:false, cityLight:1.0, size:[160,110], camDist:6.5, build(E){
    treeIdx=0; leafyCount=0; const g=new THREE.Group(); const W=160,D=110; const nav=new E3.NavGrid(W,D,0.5,-W/2,-D/2); const lamps=[]; const buildings=[];
    ground(g,W,D,W3.asphaltTex(),[W/6,D/6],0,0,0);
    // 人行道（北側靠校門）與騎樓街區
    ground(g,W,14,W3.stoneTex('#dcd5c8'),[40,4],0,-38,0.02); ground(g,W,16,W3.stoneTex('#dcd5c8'),[40,4],0,12,0.02); ground(g,W,40,W3.stoneTex('#d9d3c6'),[40,10],0,40,0.02);
    // 羅斯福路：車道線
    { const line=W3.canvasTex('lane',64,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='rgba(255,255,255,0.85)'; x.fillRect(28,0,8,120); }); for(const z of [-16,-4,8]){ const t=line.clone(); t.needsUpdate=true; t.repeat.set(1,40); const m=new THREE.Mesh(new THREE.PlaneGeometry(0.4,W),new THREE.MeshBasicMaterial({map:t,transparent:true})); m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(0,0.03,z); g.add(m); } }
    // 校門（北側牆中央）——回校園
    const gate=W3.gate(); place(g,gate,0,-46,0); nav.blockRect(-5,-46,1.6,1.6,0,0.4); nav.blockRect(5,-46,1.6,1.6,0,0.4); for(const s of [-1,1]){ const wall=new THREE.Mesh(new THREE.BoxGeometry(70,1.8,1),texMat(W3.brickTex('#b8735a'))); wall.position.set(s*44,0.9,-46); g.add(wall); nav.blockRect(s*44,-46,70,1.2,0,0.3); }
    // 捷運公館站入口
    const mrt=W3.mrtEntrance('捷運 公館站'); place(g,mrt,-40,26,0); nav.blockRect(-40,26,3.4,2.8,0); E.interactables.push({x:-40,z:28.5,radius:2.4,label:'捷運公館站入口',mrt:true});
    // 店面街（南側）：騎樓
    const shops=[{n:'阿鳳麵店',c:'#c9463d',w:10,type:'noodle'},{n:'青葉茶行 手搖飲',c:'#2f7d5b',w:8,type:'tea'},{n:'舊路書房 文具',c:'#3b5a8c',w:12,type:'book'},{n:'全日便利商店',c:'#3a6fb0',w:10,type:'cvs'},{n:'公館藥局',c:'#4a9a6a',w:8,type:'none'},{n:'滷味・鹹酥雞',c:'#c9a24a',w:8,type:'none'},{n:'眼鏡 · 手機維修',c:'#5a5a7a',w:9,type:'none'},{n:'咖啡・輕食',c:'#8c3b47',w:9,type:'none'}];
    let x=-68; for(const s of shops){ const b=W3.building({key:'shop'+s.n,w:s.w,h:14,d:16,floors:4,style:'grid',wall:['#e3ddd0','#d9cbb0','#cfc5b2','#e6dfd0'][(x/7|0)%4],glass:'#bcd6df',frame:'#6b6f76',roof:'parapet',entrance:{w:3,h:3,side:'back',canopy:false,steps:false},sign:s.n,signColor:'#ffffff',signBg:s.c}); place(g,b,x+s.w/2,60,0); nav.blockRect(x+s.w/2,60,s.w+0.2,16.2,0,0.4); buildings.push(b);
      // 騎樓柱與招牌
      for(let i=0;i<=1;i++){ const col=new THREE.Mesh(new THREE.BoxGeometry(0.6,3.6,0.6),M('#cfc5b2')); col.position.set(x+0.5+i*(s.w-1),1.8,50); g.add(col); nav.blockRect(col.position.x,50,0.7,0.7,0); } const arcade=new THREE.Mesh(new THREE.BoxGeometry(s.w,0.4,4.2),M('#d9cbb0')); arcade.position.set(x+s.w/2,3.8,50); g.add(arcade);
      const sign=new THREE.Mesh(new THREE.BoxGeometry(s.w-1,1.2,0.3),M(s.c)); sign.position.set(x+s.w/2,4.6,48.2); g.add(sign); const sp=W3.signPlane(s.n,s.w-1.4,0.9,{color:'#ffffff'}); sp.position.set(x+s.w/2,4.6,48.0); g.add(sp); const vsign=new THREE.Mesh(new THREE.BoxGeometry(0.4,4,1.4),M(s.c)); vsign.position.set(x+s.w-0.5,7,49.6); g.add(vsign); const lit=new THREE.Mesh(new THREE.BoxGeometry(s.w-1.2,1.0,0.02),new THREE.MeshBasicMaterial({color:new THREE.Color(s.c).lerp(new THREE.Color(1,1,1),0.5)})); lit.position.set(x+s.w/2,4.6,48.0-0.16); lit.visible=false; g.add(lit); E.lampGlows.push(lit);
      if(s.type==='noodle') E.interactables.push({x:x+s.w/2,z:51,radius:2.2,label:'進入阿鳳麵店',exit:{to:'noodle',spawn:{x:0,z:3.4,yaw:Math.PI}}});
      if(s.type==='tea') E.interactables.push({x:x+s.w/2,z:51,radius:2.2,label:'買一杯飲料',shop:'tea'});
      if(s.type==='book') E.interactables.push({x:x+s.w/2,z:51,radius:2.2,label:'進入舊路書房',exit:{to:'bookstore',spawn:{x:0,z:4,yaw:Math.PI}}});
      if(s.type==='cvs') E.interactables.push({x:x+s.w/2,z:51,radius:2.2,label:'進入便利商店',exit:{to:'cvs',spawn:{x:0,z:3.4,yaw:Math.PI}}});
      x+=s.w+1.2; }
    // 北側店面（校門兩側外的騎樓）
    for(const [xx,name,c] of [[-30,'台大書局',' #3b5a8c'],[30,'公館小吃',' #c9463d']]){ const b=W3.building({key:'nshop'+name,w:16,h:12,d:12,floors:3,style:'grid',wall:'#d9cbb0',glass:'#bcd6df',frame:'#6b6f76',roof:'parapet',entrance:{w:3,h:3,side:'front',canopy:false,steps:false},sign:name,signColor:'#ffffff',signBg:c.trim()}); place(g,b,xx,-56,0); buildings.push(b); }
    // 機車、路燈、行道樹
    for(let i=0;i<14;i++){ const sc=W3.scooter(['#e8e8e8','#2b2b2b','#8c3b47','#3a6fb0'][i%4]); place(g,sc,-70+i*10,-32,Math.PI/2+(i%2?0.2:-0.2)); nav.blockRect(-70+i*10,-32,0.8,1.6,0); }
    for(let i=0;i<8;i++){ const sc=W3.scooter(['#e8e8e8','#2b2b2b','#5a5a7a'][i%3]); place(g,sc,-60+i*14,18,Math.PI/2); nav.blockRect(-60+i*14,18,0.8,1.6,0); }
    for(let i=0;i<9;i++){ const l=W3.lampPost(); place(g,l,-63+i*18,-24,0); lamps.push(l); nav.blockCircle(-63+i*18,-24,0.25); const l2=W3.lampPost(); place(g,l2,-63+i*18,20,Math.PI); lamps.push(l2); nav.blockCircle(-63+i*18,20,0.25); }
    for(let i=0;i<6;i++){ const t=TREE(0.9); place(g,t,-65+i*26,-36,0); nav.blockCircle(-65+i*26,-36,0.7); }
    // 集合點：公館圓環意象（小廣場）
    { const c=new THREE.Mesh(new THREE.CylinderGeometry(3,3,0.3,24),M('#d9cbb0')); c.position.set(20,0.15,28); g.add(c); nav.blockCircle(20,28,3.2); const tree=TREE(1.2); place(g,tree,20,28,0); }
    // 通往溫州街（西側）
    E.interactables.push({x:-76,z:40,radius:3,label:'往溫州街',exit:{to:'wenzhou',spawn:{x:38,z:-7,yaw:-Math.PI/2}}});
    nav.blockOutside(-78,-45,78,51.6); /* 南側騎樓走道（z 47.9–51.7）要可走，店門在 z=51 */ for(let z=-2;z<=2;z+=0.5) for(let x=-78;x<=-74;x+=0.5){} for(let xq=-79;xq<=-74;xq+=0.5) for(let zq=37;zq<=43;zq+=0.5){ const [cx,cz]=nav.toCell(xq,zq); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    for(let z=-50;z<=-44;z+=0.5) for(let xq=-4;xq<=4;xq+=0.5){ const [cx,cz]=nav.toCell(xq,z); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    E.interactables.push({x:0,z:-48,radius:3,label:'回到校園',exit:{to:'campus',spawn:{x:-119,z:0,yaw:Math.PI/2}}});
    for(const b of buildings){ const fp=b.userData.footprint; const m=new THREE.Mesh(new THREE.BoxGeometry(fp.w,12,fp.d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(b.position.x,6,b.position.z); m.rotation.y=b.rotation.y; g.add(m); E.colliders.push(m); }
    for(const l of lamps){ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd88a,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(3,3,1); glow.position.set(0,3.9,0.75); l.add(glow); glow.visible=false; E.lampGlows.push(glow); const pool=new THREE.Mesh(new THREE.CircleGeometry(4.2,16),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(0,0.03,0.75); l.add(pool); pool.visible=false; E.lampGlows.push(pool); }
    return {group:g,nav,spawn:{x:0,z:-30,yaw:Math.PI},lamps,buildings,onLamps(on){ for(const b of buildings) W3.setNight(b,on); }}; } };
  // ---------- 溫州街 ----------
  const wenzhou={ id:'wenzhou', name:'溫州街', indoor:false, cityLight:0.6, size:[100,80], camDist:5.6, build(E){
    treeIdx=0; leafyCount=0; const g=new THREE.Group(); const W=100,D=80; const nav=new E3.NavGrid(W,D,0.5,-W/2,-D/2); const lamps=[]; const buildings=[];
    ground(g,W,D,W3.asphaltTex(),[W/6,D/6],0,0,0); // 巷道
    // 兩排公寓（有陽台與植物）
    const apt=(x,z,w,rot,i)=>{ const b=W3.building({key:'apt'+i,w,h:13,d:12,floors:4,style:'grid',wall:['#e0d6c6','#d3c6b0','#cfd0c8','#e6dcc8','#d9cbb0'][i%5],glass:'#b9cfd6',frame:'#6b6f76',roof:'parapet',entrance:{w:2.2,h:2.6,side:'front',canopy:false,steps:false}}); place(g,b,x,z,rot); buildings.push(b); nav.blockRect(x,z,w+0.2,12.2,rot,0.4); for(let f=1;f<4;f++){ const bal=new THREE.Mesh(new THREE.BoxGeometry(w*0.6,0.9,1.2),M('#b9b1a3')); bal.position.set(x,f*3.2+0.5,z+(rot?0:6.6)); if(rot) bal.position.set(x+6.6,f*3.2+0.5,z); bal.rotation.y=rot; g.add(bal); const pl=W3.bush(0.35); pl.position.set(bal.position.x-(rot?0:w*0.25),f*3.2+0.9,bal.position.z-(rot?w*0.25:0)); g.add(pl); } return b; };
    let i=0; for(let x=-40;x<=40;x+=17){ apt(x,-26,15,0,i++); apt(x,26,15,Math.PI,i++); }
    // 咖啡廳（西側轉角）：兩點半 Café
    const cafe=W3.building({key:'cafe',w:14,h:9,d:12,floors:2,style:'grid',wall:'#f1e7d6',glass:'#bcd6df',frame:'#3b2a1e',roof:'parapet',ground:'glass',entrance:{w:2.6,h:2.8,side:'front',canopy:true,canopyColor:'#3b2a1e',steps:false},sign:'兩點半 Café',signColor:'#f4ead8',signBg:'#3b2a1e'}); place(g,cafe,-40,-2,Math.PI/2); nav.blockRect(-40,-2,12.2,14.2,0,0.4); buildings.push(cafe); const aw=W3.awning(6,'#3b2a1e'); place(g,aw,-33.4,-2,Math.PI/2); aw.position.y=3.2;
    E.interactables.push({x:-32,z:-2,radius:2.4,label:'進入 兩點半 Café（營業到凌晨 2:30）',exit:{to:'cafe',spawn:{x:0,z:5,yaw:Math.PI}}});
    const cafeSign=W3.signPlane('營業 11:00–02:30',3,0.5,{color:'#f4ead8'}); cafeSign.position.set(-33.3,2.2,-2); cafeSign.rotation.y=Math.PI/2; g.add(cafeSign);
    // 小公園
    ground(g,16,12,W3.grassTex(),[4,3],30,0,0.02); { const t=TREE(1.4); place(g,t,30,0,0); nav.blockCircle(30,0,0.9); const b=BENCH(); place(g,b,26,4,0); nav.blockRect(26,4,2,0.7,0); E.interactables.push({x:26,z:4.55,radius:1.6,label:'坐在小公園的長椅',seat:{x:26,z:4.55,yaw:0}}); }
    for(let k=0;k<10;k++){ const sc=W3.scooter(['#e8e8e8','#2b2b2b','#8c3b47'][k%3]); place(g,sc,-44+k*9,-16,(k%2?0.3:-0.3)); nav.blockRect(-44+k*9,-16,0.8,1.6,0); }
    for(let k=0;k<6;k++){ const l=W3.lampPost(); place(g,l,-40+k*16,14,Math.PI); lamps.push(l); nav.blockCircle(-40+k*16,14,0.25); }
    for(let k=0;k<5;k++){ const b=W3.bush(0.6); place(g,b,-36+k*18,-18,0); nav.blockCircle(-36+k*18,-18,0.6); }
    E.interactables.push({x:46,z:0,radius:3,label:'回公館',exit:{to:'gongguan',spawn:{x:-72,z:40,yaw:Math.PI/2}}});
    nav.blockOutside(-48,-19,48,19); for(let xq=44;xq<=49;xq+=0.5) for(let zq=-3;zq<=3;zq+=0.5){ const [cx,cz]=nav.toCell(xq,zq); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    for(const b of buildings){ const fp=b.userData.footprint; const m=new THREE.Mesh(new THREE.BoxGeometry(fp.w,12,fp.d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(b.position.x,6,b.position.z); m.rotation.y=b.rotation.y; g.add(m); E.colliders.push(m); }
    for(const l of lamps){ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd88a,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(3,3,1); glow.position.set(0,3.9,0.75); l.add(glow); glow.visible=false; E.lampGlows.push(glow); const pool=new THREE.Mesh(new THREE.CircleGeometry(4.2,16),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(0,0.03,0.75); l.add(pool); pool.visible=false; E.lampGlows.push(pool); }
    return {group:g,nav,spawn:{x:38,z:-7,yaw:-Math.PI/2},lamps,buildings,onLamps(on){ for(const b of buildings) W3.setNight(b,on); }}; } };
  // ---------- 室內：通用房間 ----------
  function room(E,o){ const g=new THREE.Group(); const W=o.w,D=o.d,H=o.h||3.6; const nav=new E3.NavGrid(W+2,D+2,0.4,-W/2-1,-D/2-1); const floor=ground(g,W,D,o.floorTex||W3.stoneTex('#e6dccb'),[W/2,D/2],0,0,0); floor.material.roughness=0.7;
    const wallM=M(o.wallColor||'#efe6d6'); const walls=[]; const mk=(x,z,w,d,rot,dir)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,H,0.2),wallM); m.position.set(x,H/2,z); m.rotation.y=rot; m.userData.dir=dir; m.material=wallM.clone(); m.material.transparent=true; g.add(m); walls.push(m); }; mk(0,-D/2,W,0,0,new THREE.Vector3(0,0,1)); mk(0,D/2,W,0,0,new THREE.Vector3(0,0,-1)); mk(-W/2,0,D,0,Math.PI/2,new THREE.Vector3(1,0,0)); mk(W/2,0,D,0,Math.PI/2,new THREE.Vector3(-1,0,0));
    nav.blockOutside(-W/2+0.4,-D/2+0.4,W/2-0.4,D/2-0.4);
    // 天花板燈
    const lights=[]; const cols=Math.max(1,Math.round(W/6)), rows=Math.max(1,Math.round(D/6)); for(let i=0;i<cols;i++) for(let j=0;j<rows;j++){ const p=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.06,0.3),new THREE.MeshBasicMaterial({color:0xfff6e0})); p.position.set(-W/2+(i+0.5)*W/cols,H-0.05,-D/2+(j+0.5)*D/rows); g.add(p); lights.push(p); }
    const ceilLight=new THREE.PointLight(0xfff0d8,12,Math.max(W,D)*1.4,2); ceilLight.position.set(0,H-0.3,0); g.add(ceilLight);
    const zone={group:g,nav,walls,lights,ceilLight,warm:!!o.warm,cool:!!o.cool,spawn:o.spawn||{x:0,z:D/2-1.5,yaw:Math.PI},
      fadeWalls(cam,pp){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity= facing?1:0.12; w.material.depthWrite=facing; } },
      onLamps(on){ ceilLight.intensity=on?28:12; for(const l of lights) l.material.color.set(on?0xfff6e0:0xf4efe6); }, bounds:{w:W,d:D} };
    // 窗（外牆上的假窗，帶天光）
    if(o.windows!==false){ zone.wins=[]; zone.sunPatches=[]; const nW=Math.max(1,Math.round(W/5)); for(let i=0;i<nW;i++){ const wx=-W/2+(i+0.5)*W/nW; const win=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.6),new THREE.MeshBasicMaterial({color:0xcfe3ea})); win.position.set(wx,2.1,-D/2+0.12); win.userData.dyn=true; g.add(win); zone.wins.push(win);
        // 窗光落在地板上的光斑（下午暖光／清晨冷光，夜晚消失）
        const sp=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.2),new THREE.MeshBasicMaterial({color:0xffd9a0,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending})); sp.rotation.x=-Math.PI/2; sp.position.set(wx+0.4,0.012,-D/2+1.6); sp.userData.dyn=true; g.add(sp); zone.sunPatches.push(sp); } }
    // 室內時間感：窗色、光斑、燈色依時段與天氣變化
    zone.applyTime=function(h,weather){ h=h%24; const rain=weather==='rain'; let winC, patchA=0, patchC=0xffd9a0; if(h<5.5||h>=19.4){ winC=0x141c2c; } else if(h<6.5){ winC=0x5a6a8a; } else if(h<8){ winC=rain?0x8a949c:0xd9e3ea; patchA=rain?0:0.10; patchC=0xdfe8ff; } else if(h<16){ winC=rain?0x9aa4ac:0xcfe3ea; patchA=rain?0.04:0.16; patchC=0xfff3d6; } else if(h<17.6){ winC=rain?0x8a8f96:0xe8d6b8; patchA=rain?0.03:0.22; patchC=0xffcf8a; } else if(h<18.4){ winC=rain?0x6a6c74:0xf0a868; patchA=rain?0:0.18; patchC=0xff9a5a; } else { winC=0x3a4260; patchA=0.03; patchC=0xff8a4a; }
      if(zone.wins) for(const w of zone.wins) w.material.color.set(winC); if(zone.sunPatches) for(const p of zone.sunPatches){ p.material.opacity=patchA; p.material.color.set(patchC); }
      const night=(h<6.5||h>=18); if(o.warm){ ceilLight.color.set(night?0xffb870:0xfff0d8); ceilLight.intensity=night?22:14; for(const l of lights) l.material.color.set(night?0xffc890:0xfff6e0); } };
    return zone; }
  function desk(g,nav,x,z,rot,w,d,color){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.05,d),M(color||'#c9a57a',{rough:0.6})); m.position.set(x,0.74,z); m.rotation.y=rot||0; g.add(m); for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.72,0.06),M('#5c3a21')); const lx=sx*(w/2-0.1), lz=sz*(d/2-0.1); leg.position.set(x+lx*Math.cos(rot||0)-lz*Math.sin(rot||0),0.36,z+lx*Math.sin(rot||0)+lz*Math.cos(rot||0)); g.add(leg); } nav.blockRect(x,z,w,d,rot||0,0.1); return m; }
  function chair(g,x,z,rot,color){ const c=new THREE.Group(); const seat=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.05,0.46),M(color||'#8b5e3c',{rough:0.7})); seat.position.y=0.46; c.add(seat); const back=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.5,0.05),M(color||'#8b5e3c',{rough:0.7})); back.position.set(0,0.74,-0.2); c.add(back); for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.46,0.04),M('#3a3f46')); leg.position.set(sx*0.2,0.23,sz*0.2); c.add(leg); } c.position.set(x,0,z); c.rotation.y=rot||0; g.add(c); return c; }
  function shelfWall(g,nav,x,z,rot,len){ const s=new THREE.Mesh(new THREE.BoxGeometry(len,2.4,0.4),M('#8b5e3c',{rough:0.8})); s.position.set(x,1.2,z); s.rotation.y=rot||0; g.add(s); const tex=W3.canvasTex('books',256,128,(c,w,h)=>{ c.fillStyle='#6b4a32'; c.fillRect(0,0,w,h); const cols=['#2f5d50','#8c3b47','#e0b95b','#4a6c8c','#7b6a5a','#c46a4a','#3e5a48','#d9d3c6']; for(let r=0;r<3;r++){ let xx=4; while(xx<w-6){ const bw=6+Math.random()*8; c.fillStyle=cols[(Math.random()*cols.length)|0]; c.fillRect(xx,r*42+6,bw,34); xx+=bw+2; } } }); tex.repeat.set(len/2,1); const front=new THREE.Mesh(new THREE.PlaneGeometry(len-0.1,2.3),texMat(tex)); front.position.set(x+Math.sin(rot||0)*0.21,1.2,z+Math.cos(rot||0)*0.21); front.rotation.y=rot||0; g.add(front); nav.blockRect(x,z,len,0.5,rot||0,0.1); }
  // ---------- 教室（霖澤館）----------
  const classroom={ id:'classroom', name:'霖澤館 教室', indoor:true, camDist:4.2, build(E){ const z=room(E,{w:16,d:12,h:3.6,cool:true,wallColor:'#f1ebe0',spawn:{x:0,z:5,yaw:Math.PI}}); const g=z.group, nav=z.nav;
    // 講台與黑板
    const board=new THREE.Mesh(new THREE.BoxGeometry(6,1.6,0.08),M('#2e4e44',{rough:0.5})); board.position.set(0,1.9,-5.9); g.add(board); const chalkT=W3.canvasTex('chalk',1024,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='#f3ebd3'; x.font='bold 44px "Noto Sans TC",sans-serif'; x.fillText('民法總則：法律行為的成立與生效',40,80); x.font='30px "Noto Sans TC",sans-serif'; x.fillText('案例：網拍標價 1,000 元的相機',40,150); x.fillText('要約？要約之引誘？承諾？錯誤？',40,210); }); const chalk=new THREE.Mesh(new THREE.PlaneGeometry(5.8,1.45),new THREE.MeshBasicMaterial({map:chalkT,transparent:true})); chalk.position.set(0,1.9,-5.85); chalk.userData.dyn=true; g.add(chalk); z.chalk=chalk;
    // 黑板內容依課表更換（STORY.populate 會呼叫）
    z.setBoard=function(title,l1,l2){ const t=W3.canvasTex('chalk_'+title+l1+l2,1024,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='#f3ebd3'; x.font='bold 44px "Noto Sans TC",sans-serif'; x.fillText(title||'',40,80); x.font='30px "Noto Sans TC",sans-serif'; if(l1) x.fillText(l1,40,150); if(l2) x.fillText(l2,40,210); }); chalk.material.map=t; chalk.material.needsUpdate=true; };
    // 牆上時鐘與投影幕（環境敘事）
    const clock=new THREE.Mesh(new THREE.CircleGeometry(0.28,24),new THREE.MeshBasicMaterial({color:0xf7f4ee})); clock.position.set(6.2,3.0,-5.88); g.add(clock); const clockRim=new THREE.Mesh(new THREE.RingGeometry(0.26,0.3,24),new THREE.MeshBasicMaterial({color:0x2b2b2b})); clockRim.position.set(6.2,3.0,-5.87); g.add(clockRim); const hand=new THREE.Mesh(new THREE.PlaneGeometry(0.03,0.2),new THREE.MeshBasicMaterial({color:0x2b2b2b})); hand.position.set(6.2,3.08,-5.86); hand.userData.dyn=true; g.add(hand); z.clockHand=hand;
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(3.2,2.0),new THREE.MeshBasicMaterial({color:0xf2f0ea})); screen.position.set(5.2,2.2,-5.86); g.add(screen);
    const podium=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.1,0.6),M('#8b5e3c')); podium.position.set(-3,0.55,-4.6); g.add(podium); nav.blockRect(-3,-4.6,1.3,0.7,0);
    // 階梯座位（三排長桌）
    z.seats=[]; for(let r=0;r<3;r++){ const zz=-2.6+r*2.2; const step=new THREE.Mesh(new THREE.BoxGeometry(14,0.25*r+0.01,2.2),M('#d9cbb0')); step.position.set(0,(0.25*r)/2,zz); g.add(step); desk(g,nav,0,zz-0.5,0,12,0.6,'#c9a57a'); for(let i=0;i<8;i++){ const x=-5.25+i*1.5; chair(g,x,zz+0.3,Math.PI,'#4a5a78'); z.seats.push({x,z:zz+0.3,yaw:Math.PI,row:r,col:i}); } }
    for(const [x,zz] of [[-4.5,-0.4],[2.2,1.8],[5.2,-2.6],[-1.2,1.8]]){ PROP(g,'prop.bag',x+0.3,0,zz+0.75,0.6); } PROP(g,'prop.bottle',-0.75,0.78,-0.9); PROP(g,'prop.cup',3.75,0.78,1.3);
    // 座位互動（只登記幾個，避免太多）
    for(const s of z.seats){ if(s.col%2===1) E.interactables.push({x:s.x,z:s.z,radius:0.9,label:'坐下',seat:s}); }
    E.interactables.push({x:0,z:5.6,radius:1.6,label:'離開教室',exit:{to:'campus',spawn:{x:34,z:-99,yaw:0}}});
    z.spawn={x:0,z:4.6,yaw:Math.PI}; z.teacherSpot={x:-1.5,z:-4.4,yaw:0}; return z; } };
  // ---------- 萬才館大廳／研討室 ----------
  const wancai={ id:'wancai', name:'萬才館 大廳', indoor:true, camDist:4.6, build(E){ const z=room(E,{w:18,d:14,h:4.2,wallColor:'#eae1d3',spawn:{x:0,z:6,yaw:Math.PI}}); const g=z.group, nav=z.nav; for(let i=0;i<4;i++){ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,4.2,12),M('#d9cbb0')); col.position.set(-6+i*4,2.1,-2); g.add(col); nav.blockCircle(-6+i*4,-2,0.4); } const sofa=(x,zz,rot)=>{ const s=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.5,0.9),M('#3e5a48',{rough:0.8})); s.position.set(x,0.25,zz); s.rotation.y=rot; g.add(s); const b=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.5,0.2),M('#2f5d50',{rough:0.8})); b.position.set(x-Math.sin(rot)*0.35,0.7,zz-Math.cos(rot)*0.35); b.rotation.y=rot; g.add(b); nav.blockRect(x,zz,2.2,0.9,rot,0.1); E.interactables.push({x:x+Math.sin(rot)*0.7,z:zz+Math.cos(rot)*0.7,radius:1.2,label:'坐在沙發上',seat:{x:x,z:zz,yaw:rot}}); }; sofa(-5,2,0); sofa(5,2,0); const table=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,0.06,16),M('#c9a57a')); table.position.set(0,0.5,2); g.add(table);
    const bb=W3.bulletin(); bb.position.set(6,0,-6.6); g.add(bb); nav.blockRect(6,-6.6,2.6,0.4,0); E.interactables.push({x:6,z:-5.6,radius:1.6,label:'看公告：法律服務社招募',notice:'lawclub'});
    const sp=W3.signPlane('演講廳 →',2.2,0.5,{color:'#3b2a1e'}); sp.position.set(-7,2.6,-6.85); g.add(sp);
    E.interactables.push({x:0,z:6.6,radius:1.6,label:'離開萬才館',exit:{to:'campus',spawn:{x:88,z:-98,yaw:0}}}); return z; } };
  // ---------- 總圖閱覽室 ----------
  const library={ id:'library', name:'總圖書館 閱覽室', indoor:true, camDist:4.4, build(E){ const z=room(E,{w:22,d:16,h:4.0,cool:true,wallColor:'#efe8dc',floorTex:W3.stoneTex('#d9cbb0'),spawn:{x:0,z:7,yaw:Math.PI}}); const g=z.group, nav=z.nav; shelfWall(g,nav,-9,-7.6,0,10); shelfWall(g,nav,9,-7.6,0,10); shelfWall(g,nav,-10.8,0,Math.PI/2,12); z.seats=[]; for(let r=0;r<3;r++){ for(let c=0;c<2;c++){ const x=-4+c*8, zz=-3+r*3.6; desk(g,nav,x,zz,0,5,1.2,'#c9a57a'); for(let i=0;i<3;i++){ const lamp=new THREE.Mesh(new THREE.ConeGeometry(0.16,0.18,10,1,true),M('#2f5d50',{rough:0.5})); lamp.position.set(x-1.6+i*1.6,1.05,zz); g.add(lamp); const stem=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.28,6),M('#c9a24f')); stem.position.set(x-1.6+i*1.6,0.9,zz); g.add(stem); const glow=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,6),new THREE.MeshBasicMaterial({color:0xffe9a8})); glow.position.set(x-1.6+i*1.6,1.0,zz); g.add(glow); }
      for(let i=0;i<3;i++){ for(const s of [-1,1]){ const cx=x-1.6+i*1.6, cz=zz+s*0.9; chair(g,cx,cz,s>0?Math.PI:0,'#5c3a21'); z.seats.push({x:cx,z:cz,yaw:s>0?Math.PI:0}); if(i%2===0) E.interactables.push({x:cx,z:cz,radius:0.9,label:'坐下讀書',seat:{x:cx,z:cz,yaw:s>0?Math.PI:0},study:true}); } } } }
    for(const [x,zz] of [[-4,-3],[4,-3],[-4,0.6],[4,4.2]]){ PROP(g,'prop.bottle',x+1.9,0.77,zz+0.35); PROP(g,'prop.bagFlat',x-2.4,0,zz+1.3,0.6); } PROP(g,'prop.cup',-2.6,0.77,0.6-0.3);
    E.interactables.push({x:0,z:7.6,radius:1.6,label:'離開圖書館',exit:{to:'campus',spawn:{x:80,z:-52,yaw:-Math.PI/2}}}); return z; } };
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
    for(let i=0;i<3;i++){ const stool=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.7,10),M('#3b2a1e')); stool.position.set(-4.5+i*1.6,0.35,-3.3); g.add(stool); }
    const menu=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.2,0.05),M('#2b2118')); menu.position.set(2,2.4,-5.85); g.add(menu); const mp=W3.signPlane('拿鐵 120 ・ 手沖 150 ・ 檸檬塔 110',2.3,0.5,{color:'#f4ead8',size:44}); mp.position.set(2,2.5,-5.8); g.add(mp); const mp2=W3.signPlane('營業至 02:30 ・ 讀書免低消',2.3,0.4,{color:'#c9a24f',size:40}); mp2.position.set(2,2.05,-5.8); g.add(mp2);
    // 窗（右側牆）
    for(let i=0;i<2;i++){ const win=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.8),new THREE.MeshBasicMaterial({color:0xcfe3ea})); win.position.set(6.88,2.0,-2.5+i*4); win.rotation.y=-Math.PI/2; win.userData.dyn=true; g.add(win); z.wins=z.wins||[]; z.wins.push(win); }
    E.interactables.push({x:-2.5,z:-3.2,radius:1.6,label:'到吧檯點餐',counter:'cafe'});
    E.interactables.push({x:0,z:5.6,radius:1.6,label:'離開咖啡廳',exit:{to:'wenzhou',spawn:{x:-30,z:-2,yaw:Math.PI/2}}}); z.spawn={x:0,z:4.6,yaw:Math.PI}; return z; } };
  // ---------- 便利商店 ----------
  const cvs={ id:'cvs', name:'全日便利商店', indoor:true, camDist:4.0, build(E){ const z=room(E,{w:12,d:9,h:3.2,wallColor:'#f4f1ea',floorTex:W3.stoneTex('#e8e4da'),spawn:{x:0,z:3.5,yaw:Math.PI}}); const g=z.group, nav=z.nav; shelfWall(g,nav,-4.5,-4.2,0,6); shelfWall(g,nav,4.5,-4.2,0,3); for(let i=0;i<2;i++){ shelfWall(g,nav,-2+i*4,0,Math.PI/2,5); } const counter=new THREE.Mesh(new THREE.BoxGeometry(3,1.0,0.8),M('#d9d3c6',{rough:0.5})); counter.position.set(4,0.5,-1.5); g.add(counter); nav.blockRect(4,-1.5,3,0.8,0,0.15); const fridge=new THREE.Mesh(new THREE.BoxGeometry(0.8,2.2,4),new THREE.MeshStandardMaterial({color:0xbcd6df,roughness:0.2,metalness:0.1})); fridge.position.set(5.6,1.1,2); g.add(fridge); nav.blockRect(5.6,2,0.8,4,0,0.1); const glow=new THREE.Mesh(new THREE.PlaneGeometry(3.8,1.8),new THREE.MeshBasicMaterial({color:0xe6f5ff})); glow.position.set(5.19,1.2,2); glow.rotation.y=-Math.PI/2; g.add(glow);
    for(let i=0;i<4;i++){ PROP(g,'prop.riceBall',-6+i*0.35,2.42,-4.05,0.2); PROP(g,'prop.sandwich',-4.2+i*0.4,2.42,-4.05); } for(let i=0;i<6;i++){ PROP(g,'prop.sodaCan',5.45,1.6+(i%3)*0.3,0.6+Math.floor(i/3)*0.5); } PROP(g,'prop.riceBall',3.4,1.02,-1.5); PROP(g,'prop.bag',4.9,1.02,-1.4,0.6);
    E.interactables.push({x:3.2,z:-0.6,radius:1.4,label:'結帳：飯糰／咖啡／飲料',shop:'cvs'}); E.interactables.push({x:0,z:4.2,radius:1.5,label:'離開便利商店',exit:{to:'gongguan',spawn:{x:-19,z:48,yaw:Math.PI}}}); return z; } };
  // ---------- 麵店 ----------
  const noodle={ id:'noodle', name:'阿鳳麵店', indoor:true, camDist:4.0, build(E){ const z=room(E,{w:10,d:9,h:3.2,warm:true,wallColor:'#f1e7d6',floorTex:W3.stoneTex('#d9cbb0'),spawn:{x:0,z:3.5,yaw:Math.PI}}); const g=z.group, nav=z.nav; const kitchen=new THREE.Mesh(new THREE.BoxGeometry(6,1.0,1.2),M('#8f9399',{rough:0.4})); kitchen.position.set(-1,0.5,-3.8); g.add(kitchen); nav.blockRect(-1,-3.8,6,1.2,0,0.15); const pot=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.5,14),M('#3a3f46',{rough:0.4})); pot.position.set(-2,1.25,-3.8); g.add(pot); z.seats=[]; for(let i=0;i<3;i++){ const x=-3+i*3; desk(g,nav,x,0.5,0,1.4,0.9,'#d9cbb0'); for(const s of [-1,1]){ chair(g,x,0.5+s*0.8,s>0?Math.PI:0,'#c9463d'); z.seats.push({x,z:0.5+s*0.8,yaw:s>0?Math.PI:0}); } E.interactables.push({x,z:1.3,radius:1.1,label:'坐下吃麵',seat:{x,z:1.3,yaw:Math.PI},pairSeat:{x,z:-0.3,yaw:0},eat:'noodle'}); }
    for(let i=0;i<3;i++){ const x=-3+i*3; PROP(g,'prop.bowl',x-0.2,0.77,0.5+0.25); PROP(g,'prop.chopstick',x+0.15,0.78,0.45,0.3); if(i===1) PROP(g,'prop.bowl',x+0.25,0.77,0.5-0.25,2.4); } PROP(g,'prop.bowl',-1.5,1.02,-3.8); PROP(g,'prop.bowl',-0.9,1.02,-3.7,1.2);
    const mp=W3.signPlane('乾麵 60 ・ 餛飩湯 70 ・ 滷蛋 15',3,0.6,{color:'#3b2a1e',size:44}); mp.position.set(0,2.4,-4.35); g.add(mp); E.interactables.push({x:0,z:4.2,radius:1.5,label:'離開麵店',exit:{to:'gongguan',spawn:{x:-63,z:48,yaw:Math.PI}}}); return z; } };
  // ---------- 書店 ----------
  const bookstore={ id:'bookstore', name:'舊路書房', indoor:true, camDist:4.0, build(E){ const z=room(E,{w:12,d:10,h:3.4,wallColor:'#efe6d6',floorTex:W3.canvasTex('woodfloor2',256,256,(x,w,h)=>{ x.fillStyle='#b98a5f'; x.fillRect(0,0,w,h); x.strokeStyle='rgba(60,30,10,0.3)'; x.lineWidth=2; for(let j=0;j<h;j+=32){ x.beginPath(); x.moveTo(0,j); x.lineTo(w,j); x.stroke(); } }),spawn:{x:0,z:4,yaw:Math.PI}}); const g=z.group, nav=z.nav; shelfWall(g,nav,0,-4.7,0,11); shelfWall(g,nav,-5.7,0,Math.PI/2,8); shelfWall(g,nav,5.7,0,Math.PI/2,8); shelfWall(g,nav,-2,0,Math.PI/2,5); shelfWall(g,nav,2,0,Math.PI/2,5); const table=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.8,1.2),M('#8b5e3c')); table.position.set(0,0.4,3); g.add(table); nav.blockRect(0,3,2.4,1.2,0,0.1); E.interactables.push({x:0,z:2,radius:1.4,label:'看看法律書與文具',shop:'book'}); E.interactables.push({x:0,z:4.6,radius:1.5,label:'離開書店',exit:{to:'gongguan',spawn:{x:-42,z:48,yaw:Math.PI}}}); return z; } };
  // ---------- 宿舍房間 ----------
  const dorm={ id:'dorm', name:'宿舍 房間', indoor:true, camDist:3.6, build(E){ const z=room(E,{w:6,d:7,h:3.0,wallColor:'#f1ebe0',floorTex:W3.stoneTex('#e3d9c6'),spawn:{x:0,z:2.8,yaw:Math.PI}}); const g=z.group, nav=z.nav; // 床、書桌、室友桌
    const bed=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.5,2.1),M('#d9cbb0')); bed.position.set(-2.2,0.25,-1.5); g.add(bed); const mat=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.2,2.0),M('#4a6c8c',{rough:0.9})); mat.position.set(-2.2,0.6,-1.5); g.add(mat); const pillow=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.15,0.4),M('#ffffff')); pillow.position.set(-2.2,0.78,-2.3); g.add(pillow); nav.blockRect(-2.2,-1.5,1.1,2.1,0,0.1);
    desk(g,nav,1.8,-2.6,0,1.6,0.7,'#c9a57a'); chair(g,1.8,-1.9,Math.PI,'#3a3f46'); desk(g,nav,1.8,1.5,0,1.6,0.7,'#c9a57a'); chair(g,1.8,2.2,Math.PI,'#3a3f46'); const mon=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.4,0.04),M('#2b2b2b')); mon.position.set(1.8,1.05,1.3); g.add(mon); const mon2=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.4,0.04),M('#2b2b2b')); mon2.position.set(1.3,1.05,1.35); mon2.rotation.y=0.3; g.add(mon2); const screen=new THREE.Mesh(new THREE.PlaneGeometry(0.56,0.36),new THREE.MeshBasicMaterial({color:0x8fb8d8})); screen.position.set(1.8,1.05,1.32); g.add(screen);
    z.deskItems=new THREE.Group(); z.deskItems.position.set(1.8,0.77,-2.6); g.add(z.deskItems); shelfWall(g,nav,-1,-3.3,0,2.4); PROP(g,'prop.cup',2.3,0.77,-2.5); PROP(g,'prop.bottle',1.3,0.77,1.4); PROP(g,'prop.bag',2.55,0,-1.6,0.8); PROP(g,'prop.pizzaBox',0.8,0.77,1.6,0.3); PROP(g,'prop.sodaCan',2.35,0.77,1.55);
    E.interactables.push({x:1.8,z:-1.9,radius:1.0,label:'坐在書桌前',seat:{x:1.8,z:-1.9,yaw:Math.PI},deskStudy:true}); E.interactables.push({x:-1.4,z:-1.5,radius:1.1,label:'睡覺',sleep:true}); E.interactables.push({x:0,z:3.3,radius:1.4,label:'離開宿舍',exit:{to:'campus',spawn:{x:20,z:54,yaw:Math.PI}}}); return z; } };
  const ZONES={campus,gongguan,wenzhou,classroom,wancai,library,cafe,cvs,noodle,bookstore,dorm};
  return {ZONES,room,desk,chair,glowTex};
})();

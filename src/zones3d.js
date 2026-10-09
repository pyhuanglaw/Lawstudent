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
  function collider(E,x,z,w,d,h,rot){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h||6,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x,(h||6)/2,z); m.rotation.y=rot||0; E.colliders.push(m); E.scene.add(m); E.zone&&E.zone.group; return m; }
  // ---------- 校園主區 ----------
  const campus={ id:'campus', name:'台大校園', indoor:false, cityLight:0.25, size:[260,170], build(E){
    treeIdx=0; leafyCount=0; palmIdx=0; const g=new THREE.Group(); const W=260, D=170; /* 導航格必須涵蓋法學院前庭（z 到 -124），否則霖澤館前完全不能走 */ const nav=new E3.NavGrid(W,210,0.5,-W/2,-125); const seats=[]; const lamps=[]; const buildings=[];
    // 地面：草地
    ground(g,W,D,W3.grassTex(),[W/4,D/4],0,0,0); ground(g,120,44,W3.grassTex(),[30,11],52,-106,-0.002); // 北側法學院區地面
    // 校園配置依台大校總區平面圖（map.ntu.edu.tw，2025.10.13 版）壓縮：x 往東、-z 往北；椰林大道東西向（z=0），西端大門、東端總圖書館；
    // 大道南側：傅鐘＋行政大樓；北側：文學院、校史館、農業陳列館；小椰林道（x=30）往北通法學院；醉月湖在文學院北邊。
    // 主要道路：椰林大道 東西向（z=0），從校門 x=-124 到總圖前廣場 x≈72
    strip(g,-124,0,72,0,16,W3.pathTex(),4); curb(g,-124,0,72,0,16);
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
    const dormB=W3.building({key:'dormb',w:36,h:16,d:14,floors:5,style:'grid',wall:'#d9cbb0',glass:'#b9cfd6',frame:'#6b6f76',roof:'parapet',entrance:{w:3,h:3,side:'front',canopy:true,canopyColor:'#6b6f76'},sign:'男一舍',signColor:'#3b2a1e'}); place(g,dormB,20,68,Math.PI); nav.blockRect(20,68,36.6,14.6,0,0.6); buildings.push(dormB); for(const x of [-4,44]){ const b=TREE(1.2); place(g,b,x,60,0); nav.blockCircle(x,60,0.9); }
    // ---- 校門（西端）----
    const gate=W3.gate(); place(g,gate,-124,0,Math.PI/2); nav.blockRect(-123.1,13.5,3.6,4.4,0,0.4); nav.blockRect(-124,-5,2,4,0,0.4); nav.blockRect(-124,5,2,4,0,0.4); nav.blockRect(-124,-10,2,6,0); nav.blockRect(-124,10,2,6,0);
    // 圍牆（校門兩側）
    for(const s of [-1,1]){ const wall=new THREE.Mesh(new THREE.BoxGeometry(1,1.8,70),texMat(W3.brickTex('#b8735a'))); wall.position.set(-124,0.9,s*45); g.add(wall); nav.blockRect(-124,s*45,1.2,70,0,0.3); }
    // ---- 椰林大道：大王椰子 ----
    for(let x=-110;x<=70;x+=7.5){ for(const s of [-1,1]){ const p=PALM(9+((x*7)%3)); place(g,p,x,s*9.5,(x*0.3)%6.28); nav.blockCircle(x,s*9.5,0.5); } }
    // 兩側草地小徑與長椅、腳踏車
    for(let x=-100;x<=50;x+=25){ for(const s of [-1,1]){ const b=BENCH(); place(g,b,x,s*13,s>0?Math.PI:0); nav.blockRect(x,s*13,2.0,0.7,0); seats.push({x,z:s*13+(s>0?-0.55:0.55),yaw:s>0?Math.PI:0,label:'坐在椰林大道的長椅上'}); } }
    for(let x=-90;x<=40;x+=32){ const r=W3.bikeRack(7); place(g,r,x+8,-16,0); nav.blockRect(x+8,-16,5,1.4,0); }
    for(let x=-105;x<=55;x+=22){ for(const s of [-1,1]){ const l=W3.lampPost(); place(g,l,x,s*11,s>0?0:Math.PI); lamps.push(l); nav.blockCircle(x,s*11,0.25); } }
    // ---- 傅鐘（大道南側小廣場，行政大樓正前方）----
    const plaza=ground(g,28,12,W3.stoneTex('#e3d9c6'),[7,3],-38,17,0.015); const bell=W3.bell(); place(g,bell,-38,16.5,0); nav.blockCircle(-38,16.5,2.0); for(const [x,z] of [[-51,21.5],[-25,21.5]]){ const b=TREE(1.3); place(g,b,x,z,0); nav.blockCircle(x,z,0.9); }
    for(const x of [-46,-30]){ const b=BENCH(); place(g,b,x,21,Math.PI); nav.blockRect(x,21,2,0.7,0); seats.push({x,z:21-0.55,yaw:Math.PI,label:'坐在傅鐘旁的長椅'}); }
    // ---- 行政大樓（大道南側、傅鐘後面）：大圓柱、對稱，正面朝北對著椰林大道 ----
    const admin=W3.building({key:'admin',w:46,h:11,d:16,floors:3,style:'arch',wall:'#e8dcc4',glass:'#b9cfd6',frame:'#6b5a4a',roof:'hip',roofColor:'#7a4a3a',roofH:2.6,entrance:{w:3.6,h:3.6,side:'back',canopy:false,stepColor:'#cfc5b2'},sign:'行政大樓',signColor:'#3b2a1e'}); place(g,admin,-38,33,0); nav.blockRect(-38,33,46.6,16.6,0,0.6); buildings.push(admin); for(let i=0;i<6;i++){ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,9,14),M('#efe6d6')); col.position.set(-38-15+i*6,4.5,33-8.6); g.add(col); nav.blockCircle(col.position.x,col.position.z,0.7); }
    // ---- 文學院（大道北側，正對行政大樓）：仿羅馬式拱窗 ----
    const arts=W3.building({key:'arts',w:40,h:10,d:18,floors:2,style:'arch',wall:'#d9a98c',glass:'#b9cfd6',frame:'#5c3a21',roof:'hip',roofColor:'#6e4636',roofH:3,entrance:{w:3.4,h:3.8,side:'front',canopy:false,stepColor:'#cfc5b2'},sign:'文學院',signColor:'#3b2a1e'}); place(g,arts,-38,-34,0); nav.blockRect(-38,-34,40.6,18.6,0,0.6); buildings.push(arts); strip(g,-38,-8,-38,-24,4,W3.pathTex(),4);
    // ---- 農業陳列館（洞洞館）北側近校門 ----
    const hole=W3.building({key:'hole',w:22,h:9,d:14,floors:2,style:'grid',wall:'#e6dfd0',glass:'#c8d8de',frame:'#8f9399',roof:'parapet',entrance:{w:3,h:3,side:'front',canopy:false},sign:'農業陳列館'}); place(g,hole,-104,-30,0); nav.blockRect(-104,-30,22.6,14.6,0,0.6); buildings.push(hole);
    // 洞洞館的外牆格柵（琉璃筒瓦意象：以格柵近似）
    { const grille=new THREE.Mesh(new THREE.BoxGeometry(22.4,7,0.3),texMat(W3.canvasTex('grille',128,128,(x,w,h)=>{ x.fillStyle='#cfc2ad'; x.fillRect(0,0,w,h); x.fillStyle='#8a7a66'; for(let j=8;j<h;j+=16) for(let i=8;i<w;i+=16){ x.beginPath(); x.arc(i,j,5,0,Math.PI*2); x.fill(); } }),null,{transparent:false})); grille.material.map.repeat.set(8,3); grille.position.set(-104,4.6,-30+7.35); g.add(grille); }
    // ---- 校史館（舊總圖）：大道北側、靠近大門（農業陳列館東邊），紅磚拱窗、圓石柱、屋瓦 ----
    const hist=W3.building({key:'hist',w:24,h:12,d:16,floors:2,style:'arch',wall:'#c5806a',glass:'#b9cfd6',frame:'#5c3a21',roof:'hip',roofColor:'#5c3a2a',roofH:3.4,entrance:{w:3.8,h:4.2,side:'front',canopy:false,stepColor:'#cfc5b2',frame:'#8b5e3c'},sign:'校史館',signColor:'#f4ead8',signBg:'rgba(0,0,0,0)'}); place(g,hist,-77,-29,0); nav.blockRect(-77,-29,24.6,16.6,0,0.6); buildings.push(hist); for(let i=0;i<5;i++){ const col=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,8,12),M('#d9cbb0')); col.position.set(-77+(i-2)*5,4,-29+8.6); g.add(col); nav.blockCircle(col.position.x,col.position.z,0.7); }
    // ---- 總圖書館（椰林大道東端盡頭，正面朝西對著大道）----
    const lib=W3.building({key:'lib',w:60,h:18,d:26,floors:4,style:'arch',wall:'#cf8f78',glass:'#bcd6df',frame:'#5c3a21',roof:'hip',roofColor:'#5c3a2a',roofH:4.2,entrance:{w:5,h:4.5,side:'front',canopy:false,stepColor:'#d9cbb0'},sign:'總圖書館',signColor:'#f4ead8',signBg:'rgba(0,0,0,0)',signY:14.2}); place(g,lib,100,0,-Math.PI/2); nav.blockRect(100,0,26.6,60.6,0,0.6); buildings.push(lib);
    // 總圖：紅磚拱廊門廳（三連拱、山牆）
    { const bm=texMat(W3.brickTex('#c5806a')); const porch=new THREE.Group(); for(let i=-1;i<=1;i++){ for(const sx of [-1,1]){ const pier=new THREE.Mesh(new THREE.BoxGeometry(1.2,6.5,1.2),bm); pier.position.set(0,3.25,i*6+sx*2.4); porch.add(pier); } const arch=new THREE.Mesh(new THREE.TorusGeometry(2.4,0.6,8,16,Math.PI),bm); arch.rotation.y=Math.PI/2; arch.position.set(0,6.5,i*6); porch.add(arch); } const beam=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,19),bm); beam.position.set(0,9.3,0); porch.add(beam); /* 山牆：三角形斷面往後延伸到建築立面（舊版是一個尖錐，正面看是一塊黑色三角形，還擋住館名） */ { const sh=new THREE.Shape(); sh.moveTo(-9.7,0); sh.lineTo(9.7,0); sh.lineTo(0,1.6); sh.lineTo(-9.7,0); const ped=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:5.8,bevelEnabled:false}),M('#e8dcc4')); ped.rotation.y=Math.PI/2; ped.position.set(-3.0,10.1,0); porch.add(ped); const ang=Math.atan2(1.6,9.7), L=Math.hypot(9.7,1.6)+0.3; for(const s of [-1,1]){ const rf=new THREE.Mesh(new THREE.BoxGeometry(6.3,0.2,L),M('#5c3a2a')); rf.rotation.x=s*ang; rf.position.set(-0.15,10.1+0.8+0.12,s*4.85); porch.add(rf); } } const roof=new THREE.Mesh(new THREE.BoxGeometry(6,0.3,19.4),M('#5c3a2a')); roof.position.set(0,9.95,0); porch.add(roof); const stepsM=new THREE.Mesh(new THREE.BoxGeometry(6,0.06,10),M('#d9cbb0')); stepsM.position.set(-2.5,0.03,0); /* 門口石板：只高 6 cm（人物不會陷進台階裡） */ porch.add(stepsM); porch.position.set(84.2,0,0); g.add(porch); nav.blockRect(84.2,-6,1.4,5.2,0,0.2); nav.blockRect(84.2,6,1.4,5.2,0,0.2); }
    // ---- 小椰林道（x=30，從椰林大道往北通到法學院）：兩排較矮的大王椰子 ----
    for(let z=-14;z>=-70;z-=8){ for(const x of [24.2,35.8]){ if(x>30&&z>-66&&z<-54) continue; const p=PALM(7+((-z*3)%2)); place(g,p,x,z,(-z*0.7)%6.28); nav.blockCircle(x,z,0.45); } }
    // ---- 醉月湖（文學院北邊）----
    const lakeU=lake(g,nav,-30,-66,seats,lamps);
    ground(g,124,44,W3.grassTex(),[31,11],-70,-106,-0.003); for(let x=-62;x<=0;x+=7){ const t=TREE(1.15+((-x)%3)*0.1); place(g,t,x+((x*13)%3),-88-((x*7)%4),x*0.3); }   // 湖北邊（不能走的區域）：補地面＋一排樹，遮住地面盡頭
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
    for(const [x,z] of [[8,-70],[8,-50],[8,-30],[52,-50],[52,-30],[-54,-19],[-5,-16],[20,-20],[40,-20],[-10,18],[10,18],[50,18],[-95,-12],[-62,-56],[0,-56],[-96,24],[-82,31],[-68,24],[66,-28],[78,-38],[64,-44]]){ const b=TREE(1+((x+z)%3)*0.2); place(g,b,x,z,(x+z)*0.3); nav.blockCircle(x,z,0.8); }
    // 花圃
    for(const x of [-64,-48]){ const p=W3.planter(); place(g,p,x,-13,0); nav.blockRect(x,-13,1.2,0.5,0); }
    // 社團招生攤位（傅鐘廣場東側，面向椰林大道）：摺疊桌、布條、傳單
    { const SX=-18, SZ=14.5; const st=new THREE.Group(); const tb=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.05,0.7),M('#e8e2d6')); tb.position.set(0,0.74,0); st.add(tb); for(const [sx,sz] of [[-0.8,-0.25],[0.8,-0.25],[-0.8,0.25],[0.8,0.25]]){ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.72,0.04),M('#3a3f46')); leg.position.set(sx,0.36,sz); st.add(leg); } const cloth=new THREE.Mesh(new THREE.BoxGeometry(1.85,0.6,0.02),M('#2f5d50')); cloth.position.set(0,0.42,0.36); st.add(cloth); const banner=W3.signPlane('法律服務社 招生中 ・ 免費法律諮詢',1.8,0.5,{color:'#ffffff',size:40}); banner.position.set(0,0.42,0.38); st.add(banner); const fly=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.02,0.42),M('#ffffff')); fly.position.set(-0.4,0.78,0); st.add(fly); st.position.set(SX,0,SZ); st.rotation.y=Math.PI; g.add(st); nav.blockRect(SX,SZ,1.9,0.8,0,0.1); E.interactables.push({x:SX,z:SZ-1,radius:1.5,label:'看法律服務社的招生攤位',notice:'lawclub'}); }
    // 路旁散置腳踏車
    for(const [x,z] of [[-60,-15.5],[-57,15.5],[0,-15.5],[24,-64],[36,-64]]){ const b=W3.bike(['#3a6fb0','#8c3b47','#2f5d50','#e0b95b'][(x+z)&3]); place(g,b,x,z,Math.PI/2); nav.blockRect(x,z,1.7,0.6,Math.PI/2); }
    // 邊界
    nav.blockOutside(-123,-124,125,84); nav.blockRect(-59,-104,128,40,0,0); nav.blockRect(112.5,-104,25,40,0,0); nav.blockRect(-123,0,2,8,0,0); // 北側只留法學院前庭（x 5–100）可走；校門通道保留
    // 校門通道格：確保 -124..-118 之間可走（往公館）
    for(let z=-4;z<=4;z+=0.5) for(let x=-127;x<=-118;x+=0.5){ const [cx,cz]=nav.toCell(x,z); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    // 碰撞盒（鏡頭用）
    const boxes=[[20,68,36,14],[-38,33,46,16],[-38,-34,40,18],[-104,-30,22,14],[-77,-29,24,16],[100,0,26,60],[34,-112,40,18],[88,-112,30,20],[110,-70,22,56]]; for(const [x,z,w,d] of boxes){ const h=12; const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(x,h/2,z); g.add(m); E.colliders.push(m); }
    // 燈光光暈
    for(const l of lamps){ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd88a,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(3,3,1); glow.position.set(0,3.9,0.75); l.add(glow); glow.visible=false; E.lampGlows.push(glow); const pool=new THREE.Mesh(new THREE.CircleGeometry(4.2,16),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(0,0.03,0.75); l.add(pool); pool.visible=false; E.lampGlows.push(pool); }
    // 出口
    const exits=[{x:-126,z:0,r:3,to:'gongguan',spawn:{x:-2.5,z:-29,yaw:0},label:'走出校門'},{x:34,z:-102,r:2.2,to:'classroom',spawn:{x:0,z:5,yaw:Math.PI},label:'進入霖澤館',door:true},{x:88,z:-101,r:2.2,to:'wancai',spawn:{x:0,z:5,yaw:Math.PI},label:'進入萬才館',door:true},{x:83,z:0,r:2.6,to:'library',spawn:{x:0,z:7,yaw:Math.PI},label:'進入總圖書館',door:true},{x:20,z:58.5,r:2.4,to:'dorm',spawn:{x:0,z:2.4,yaw:Math.PI},label:'回宿舍',door:true}];
    for(const ex of exits){ E.interactables.push({x:ex.x,z:ex.z,radius:ex.r,label:ex.label,exit:ex}); }
    // 座位互動
    for(const s of seats){ E.interactables.push({x:s.x,z:s.z,radius:1.6,label:s.label,seat:s}); }
    const zone={group:g,nav,spawn:{x:34,z:-98,yaw:0},seats,lamps,buildings,exits,
      onLamps(on){ for(const b of buildings) W3.setNight(b,on); },
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
    E.interactables.push({x:-76,z:40,radius:3,label:'往溫州街',exit:{to:'wenzhou',spawn:{x:51.3,z:-9.8,yaw:0}}});
    nav.blockOutside(-78,-45,78,51.6); /* 南側騎樓走道（z 47.9–51.7）要可走，店門在 z=51 */ for(let z=-2;z<=2;z+=0.5) for(let x=-78;x<=-74;x+=0.5){} for(let xq=-79;xq<=-74;xq+=0.5) for(let zq=37;zq<=43;zq+=0.5){ const [cx,cz]=nav.toCell(xq,zq); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    for(let z=-50;z<=-44;z+=0.5) for(let xq=-4;xq<=4;xq+=0.5){ const [cx,cz]=nav.toCell(xq,z); if(cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows) nav.b[nav.idx(cx,cz)]=0; }
    E.interactables.push({x:0,z:-48,radius:3,label:'回到校園',exit:{to:'campus',spawn:{x:-119,z:0,yaw:Math.PI/2}}});
    for(const b of buildings){ const fp=b.userData.footprint; const m=new THREE.Mesh(new THREE.BoxGeometry(fp.w,12,fp.d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set(b.position.x,6,b.position.z); m.rotation.y=b.rotation.y; g.add(m); E.colliders.push(m); }
    for(const l of lamps){ const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:0xffd88a,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(3,3,1); glow.position.set(0,3.9,0.75); l.add(glow); glow.visible=false; E.lampGlows.push(glow); const pool=new THREE.Mesh(new THREE.CircleGeometry(4.2,16),new THREE.MeshBasicMaterial({map:glowTex(),color:0xffd08a,transparent:true,opacity:0.34,depthWrite:false,blending:THREE.AdditiveBlending})); pool.rotation.x=-Math.PI/2; pool.position.set(0,0.03,0.75); l.add(pool); pool.visible=false; E.lampGlows.push(pool); }
    return {group:g,nav,spawn:{x:0,z:-30,yaw:Math.PI},lamps,buildings,onLamps(on){ for(const b of buildings) W3.setNight(b,on); }}; } };
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
    // v9.3 三時段光影：Café 櫥窗灑到騎樓與路面的暖光、路口往北那條路的路燈（參考圖晚上 20:30：路燈照亮路面、店家燈光灑出來；
    // 原本 Café 門口的路面晚上是一片均勻的暗色）。光暈是加法混色的貼地圓片，不增加即時光源
    { const sp=TK.lightPool(3.6,'rgba(255,190,120,1)'); sp.position.set(53.2,0.031,0); sp.scale.set(1,1.75,1); g.add(sp); pools.push(sp); sp.userData.poolMax=(sp.userData.poolMax||0.55)*0.9; }
    { const L=W3.lampPost(); place(g,L,47.75,11.8,Math.PI/2); nav.blockCircle(47.75,11.8,0.25); const pool=TK.lightPool(4.4,'rgba(255,214,150,1)'); pool.position.set(48.5,0.03,11.8); g.add(pool); pools.push(pool); const gs=TK.glowSprite('rgba(255,214,150,1)',1.8,0,0.85); gs.position.set(48.5,3.9,11.8); g.add(gs); }
    // 夜間點光源（數量固定，白天強度 0，避免換燈數造成 shader 重編）
    for(const [lx,ly,lz,c,i] of [[53.8,3.2,0,0xffc88a,1],[44,3.0,3.8,0xf2fbff,0.85],[14.2,3.0,3.6,0xffd6a0,0.7]]){ const L=new THREE.PointLight(c,0,16,1.8); L.position.set(lx,ly,lz); L.userData.maxI=i*18; g.add(L); lights.push(L); }
    // 東端：回公館
    E.interactables.push({x:51.3,z:-13.4,radius:2.6,label:'回公館',exit:{to:'gongguan',spawn:{x:-72,z:40,yaw:Math.PI/2}}});
    for(const b of buildings) b.traverse(o=>{ if(o.isMesh){ o.castShadow=o.castShadow!==false; } });
    // 時間：0 白天 → 1 夜晚（傍晚漸亮）
    const warmSky=new THREE.Color(0xffc48a), warmGround=new THREE.Color(0x6a5644); const zoneTime=(h,E)=>{ let k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); k=Math.max(0,Math.min(1,k)); TK.setNight(k); if(E&&E.hemi){ E.hemi.intensity+=0.85*k; E.hemi.color.lerp(warmSky,0.3*k); E.hemi.groundColor.lerp(warmGround,0.55*k); } for(const L of lights) L.intensity=L.userData.maxI*Math.max(0,Math.min(1,k)); for(const p of pools) p.material.opacity=p.userData.poolMax*Math.max(0,Math.min(1,k*1.2-0.2)); };
    return {group:g,nav,spawn:{x:44,z:-1,yaw:-Math.PI/2},lamps:[],buildings,applyTimeOutdoor:zoneTime,onLamps(on){}}; }
  const wenzhou={ id:'wenzhou', name:'溫州街', indoor:false, cityLight:0.85, size:[110,60], camDist:5.2, build(E){ return buildWenzhou(E); } };
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
    for(let i=0;i<3;i++){ const stool=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.7,10),M('#3b2a1e')); stool.position.set(-4.5+i*1.6,0.35,-3.3); g.add(stool); }
    const menu=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.2,0.05),M('#2b2118')); menu.position.set(2,2.4,-5.85); g.add(menu); const mp=W3.signPlane('拿鐵 120 ・ 手沖 150 ・ 檸檬塔 110',2.3,0.5,{color:'#f4ead8',size:44}); mp.position.set(2,2.5,-5.8); g.add(mp); const mp2=W3.signPlane('營業至 02:30 ・ 讀書免低消',2.3,0.4,{color:'#c9a24f',size:40}); mp2.position.set(2,2.05,-5.8); g.add(mp2);
    // 窗（右側牆）
    for(let i=0;i<2;i++){ const win=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.8),new THREE.MeshBasicMaterial({color:0xcfe3ea})); win.position.set(6.88,2.0,-2.5+i*4); win.rotation.y=-Math.PI/2; win.userData.dyn=true; g.add(win); z.wins=z.wins||[]; z.wins.push(win); }
    E.interactables.push({x:-2.5,z:-3.2,radius:1.6,label:'到吧檯點餐',counter:'cafe'});
    E.interactables.push({x:0,z:5.6,radius:1.6,label:'離開咖啡廳',exit:{to:'wenzhou',spawn:{x:51.7,z:0,yaw:-Math.PI/2}}}); z.spawn={x:0,z:4.6,yaw:Math.PI}; return z; } };
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
    const bed=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.5,2.1),M('#d9cbb0')); bed.position.set(-2.2,0.25,-1.5); g.add(bed); const mat=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.2,2.0),M('#4a6c8c',{rough:0.9})); mat.position.set(-2.2,0.6,-1.5); g.add(mat); const pillow=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.15,0.4),M('#ffffff')); pillow.position.set(-2.2,0.78,-2.3); g.add(pillow); nav.blockRect(-2.2,-1.5,1.1,2.1,0,0.1); nav.blockRect(-2.3,-2.95,1.4,0.7,0,0); /* 床頭和書架之間的窄縫（約 0.5 m，比人窄）：同書桌後面，整段不可走 */
    desk(g,nav,1.8,-2.6,0,1.6,0.7,'#c9a57a'); nav.blockRect(1.45,-3.25,2.3,0.6,0,0); /* 書桌後面和後牆之間只有約 0.5 m（比人窄），沿牆滑進去會卡在只有一個點站得住的小空隙（v9.3 #31）：整段不可走 */ chair(g,1.8,-1.9,Math.PI,'#3a3f46'); desk(g,nav,1.8,1.5,0,1.6,0.7,'#c9a57a'); chair(g,1.8,2.2,Math.PI,'#3a3f46'); const mon=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.4,0.04),M('#2b2b2b')); mon.position.set(1.8,1.05,1.3); g.add(mon); const mon2=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.4,0.04),M('#2b2b2b')); mon2.position.set(1.3,1.05,1.35); mon2.rotation.y=0.3; g.add(mon2); const screen=new THREE.Mesh(new THREE.PlaneGeometry(0.56,0.36),new THREE.MeshBasicMaterial({color:0x8fb8d8})); screen.position.set(1.8,1.05,1.32); g.add(screen);
    z.deskItems=new THREE.Group(); z.deskItems.position.set(1.8,0.77,-2.6); g.add(z.deskItems); shelfWall(g,nav,-1,-3.3,0,2.4); PROP(g,'prop.cup',2.3,0.77,-2.5); PROP(g,'prop.bottle',1.3,0.77,1.4); PROP(g,'prop.bag',2.55,0,-1.6,0.8); PROP(g,'prop.pizzaBox',0.8,0.77,1.6,0.3); PROP(g,'prop.sodaCan',2.35,0.77,1.55);
    E.interactables.push({x:1.8,z:-1.9,radius:1.0,label:'坐在書桌前',seat:{x:1.8,z:-1.9,yaw:Math.PI},deskStudy:true}); E.interactables.push({x:-1.4,z:-1.5,radius:1.1,label:'睡覺',sleep:true}); E.interactables.push({x:0,z:3.3,radius:1.4,label:'離開宿舍',exit:{to:'campus',spawn:{x:20,z:54,yaw:Math.PI}}}); return z; } };
  const ZONES={campus,gongguan,wenzhou,classroom,wancai,library,cafe,cvs,noodle,bookstore,dorm};
  return {ZONES,room,desk,chair,glowTex};
})();

/* 新生南路（首都帝大新生南路側門外的店面街；ART-XINSHENG-GATE-1103，D108；LAWWW2 11-03 草案，WIP，還沒接進 index.html）
   需求：AA_615 第 1～3 節、AA_617 第 1 節的路線、AA_622；配置 src/data/xinsheng_layout.js（和 Blender 的 wz_street.py --set xinsheng 共用）。
   座標：x 往東（+x＝校園那一側）、z 往南。走得到的地方：校園那一側的人行道、兩條斑馬線、店面那一側的人行道和騎樓、溫州街巷口；馬路其他地方走不到（車道）。
   出口：側門 → campus（校園西側圍牆北段 (−124, −88)，LAWWW 11-03 20:20 同意）；溫州街巷口 → wenzhou 的西端（LAWWW 11-03 20:24 同意）。
   店：室內由 AA、BB、CC 做（AA 11-03 分工）；還沒有室內的店，門口是「看櫥窗」的互動點（note 寫在 layout 的 shops[].note）。
   正式模型：bldg.xinsheng_street（立面；接法和 118 巷同一套 Z3.attachWenzhouModel）；地面、椰子、樟樹、候車亭的正式模型還沒做，先用套件；校園那一側的圍牆、側門是正式模型 bldg.xs_gate（XS-GATE-FORMAL-1110）。 */
const XS3=(function(){
  const S={};
  const LAY=()=>typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null;
  const M=c=>TK.col?TK.col(c):new THREE.MeshStandardMaterial({color:c,roughness:0.85});
  /* XS-ARCADE-NAV-1105（LAWWW2-C 11-05）：騎樓的分段照正式模型（wz_street.py --set xinsheng 的 _xinsheng_lj）。
     arcadeShops：有騎樓的店（照 z0 排）；店和店之間、店和溫州街巷口之間不到 1.5 m 的縫，模型把店面加寬補滿。
     noArcade：其他段（街的南北兩段公寓）——模型一樓的牆在立面往裡 0.2 m，沒有騎樓。 */
  S.arcadeShops=function(L){ const WL=L.wenzhouLane, sh=L.shops.map(q=>({id:q.id,z0:q.z0,z1:q.z1})).sort((a,b)=>a.z0-b.z0);
    for(let i=0;i+1<sh.length;i++){ const gap=sh[i+1].z0-sh[i].z1; if(gap>0&&gap<1.5) sh[i].z1=sh[i+1].z0; }
    for(const q of sh){ const a=WL.z0-q.z1, b=q.z0-WL.z1; if(a>0&&a<1.5) q.z1=WL.z0; if(b>0&&b<1.5) q.z0=WL.z1; }
    return sh; };
  S.noArcade=function(L){ const R=L.road, WL=L.wenzhouLane, taken=S.arcadeShops(L).map(q=>[q.z0,q.z1]).concat([[WL.z0,WL.z1]]).sort((a,b)=>a[0]-b[0]); const out=[]; let cur=R.z0;
    for(const [a,b] of taken){ if(a>cur+0.05) out.push([cur,a]); cur=Math.max(cur,b); } if(R.z1>cur+0.05) out.push([cur,R.z1]); return out; };
  S.SHOP_IN_PLACE={dabu:'xs_dabu',haopai:'xs_haopai',shanlan:'xs_shanlan',tongxian:'xs_tongxian',xsports:'xs_xsports',dakou:'xs_dakou'};   /* SHOP-WINDOW-3D-1112：街景模型裡立體店內的網格 sk_in_<店> → 地點（營業時間）；Z3.shopInsideLit 用 */
  /* SHOP-REAL-INSIDE-1112：玻璃後面放各店走進去的室內模型（Z3.shopInsideReal）。室內的原點在店的中心、正面是 +z（各店 *_layout.js：w 寬、d 深、h 高）；
     新生南路西側的店朝東（+x）：轉 π/2，正面那一面（z＝d/2）貼在店面玻璃（x −16.5）後面 2 cm。cz＝這一間在街上的中心（xinsheng_layout shops 的 z0、z1）；ez＝半個店面寬（離店面多遠才算遠）。
     同弦樂器的店在二樓，一樓櫥窗是街景模型自己的（不是室內），不在這裡。 */
  S.SHOP_REAL=(()=>{ const GX=-16.5, mk=(id,place,key,cz,w,d,h)=>({id,place,key,w,d,h,x:GX-0.02-d/2,z:cz,ry:Math.PI/2,cx:GX,cz,ex:0,ez:w/2});
    return [mk('dabu','xs_dabu','bldg.xs_dabu',-16.7,7.4,12,3.4), mk('haopai','xs_haopai','bldg.xs_haopai',-23.2,4.4,14,3.4), mk('xsports','xs_xsports','bldg.xs_xsports',-33,14,16,3.4),
            mk('shanlan','xs_shanlan','bldg.xs_shanlan',10.2,14,18,3.95), mk('dakou','xs_dakou','bldg.xs_dakou_1f',40.4,12,16,3.6), mk('nanyang','xs_nanyang','bldg.xs_nanyang',25.3,9,14,4.5)];   /* 南洋戲院：大廳（NANYANG_LAYOUT.lobby 9×14×4.5） */ })();
  /* 同弦樂器打烊要看得出來關了（BB 11-12 FAIL：新生南路 23:30 標籤「已閉館」，櫥窗吊燈亮、吉他牆照得清楚、沒有鐵捲門；同一條街大步、好拍、山嵐、新運動都有）。
     店在二樓、一樓櫥窗和樓梯口是街景模型自己的，不在 SHOP_REAL（沒有室內模型可以放）——所以原本只有一樓簡化的店內（sk_in_tongxian）會調暗，二樓那張亮窗卡（xs_fronts_lit）一直亮、也沒有鐵門。
     ① SHOP_LIT_PLACE：街景模型的亮窗卡 xs_fronts_lit（node extras.xsShops＝xsports,tongxian,shanlan,nanyang,dakou；第二組 UV＝店編號）照營業時間調暗——和公館同一套（Z3.ggShopLit）。
     ② SHOP_SHUT：一樓櫥窗、樓梯口各一片鐵捲門（Z3.shopShutters，和其他店同一張浪板）。位置照 tools/blender/env_second/wz_street.py XS_FRONTS 的 tongxian：
        這一棟的中心 z −8.9（模型量的：sk_in_tongxian z −9.50～−5.85、樓梯燈 z −10.43）、本地 +x＝北（−z）；櫥窗 glass (−3.0, 0.55) → z −9.45～−5.9；樓梯口 stair x 1.45～2.95 → z −11.85～−10.35、高 GH−0.38＝3.82。 */
  S.SHOP_LIT_PLACE={xsports:'xs_xsports',tongxian:'xs_tongxian',shanlan:'xs_shanlan',nanyang:'xs_nanyang',dakou:'xs_dakou'};
  S.SHOP_SHUT=(()=>{ const GX=-16.5, C=-8.9, mk=(id,x0,x1,sh)=>({id,place:'xs_tongxian',cx:GX,cz:+(C-(x0+x1)/2).toFixed(3),ry:Math.PI/2,sw:+(x1-x0+0.2).toFixed(2),sh});
    return [mk('tongxian',-3.0,0.55,3.0), mk('tongxian_stair',1.45,2.95,3.82)]; })();
  S.NO_ARCADE_REC=0.2;
  /* XS-FARVIEW-1105：街的兩頭（走不到的遠景）。數字和 tools/blender/env_second/wz_street.py --set xinsheng_far 的 XSF 同一組，改一邊要一起改（tests/xs_farview_unit.js 比對 GLB）*/
  S.FAR={zN:-178,zS:178,armN:[-100,-84],armS:[74,90],armRoad:2};   // 沒有騎樓的那幾段：一樓牆在立面（facade.upper）往裡 0.2 m（wz_street.py 住家／鐵捲門的 rec）
  /* 路邊機車的位置（XS-SCOOTERS-1111）：配置 scooters＝{x, spans:[[z0,z1]…]}。一小群三到五台、間距約 0.85 m、群和群之間空 1.4～2.4 m；
     店門口（門中心前後 1.3 m）、斑馬線（前後多 0.8 m）、溫州街巷口不停。回傳 [{x,z,ry,g}]（g＝第幾群）；位置是固定的（照 z 的雜湊），每次進來都一樣 */
  S.scooterSpots=function(L){ const SC=L&&L.scooters, out=[]; if(!SC||!SC.spans) return out; const hash=(a,b)=>{ const t=Math.sin(a*12.9898+b*78.233)*43758.5453; return t-Math.floor(t); };
    const WL=L.wenzhouLane, busy=z=>(L.shops||[]).some(q=>q.door&&Math.abs(q.door.z-z)<(q.door.w||2)/2+0.7)||(L.crossings||[]).some(c=>Math.abs(z-c.z)<c.w/2+0.8)||(WL&&z>WL.z0-0.6&&z<WL.z1+0.6);
    let gi=0; for(const [a,b] of SC.spans){ const z0=Math.min(a,b)+0.5, z1=Math.max(a,b)-0.5; let z=z0+hash(a,1)*0.6;
      while(z<z1){ gi++; const n=3+Math.floor(hash(gi,5)*3), slant=(hash(gi,11)-0.5)*0.4, pitch=0.82+hash(gi,13)*0.1;
        for(let k=0;k<n&&z<z1;k++,z+=pitch){ if(busy(z)) continue; out.push({x:+(SC.x+(hash(z,3)-0.5)*0.26).toFixed(3),z:+z.toFixed(3),ry:-Math.PI/2+slant+(hash(z,5)-0.5)*0.2+(hash(z,7)<0.15?Math.PI:0),g:gi}); }
        z+=1.4+hash(gi,17)*1.0; } }
    return out; };
  S.build=function(E){ const L=LAY(); const g=new THREE.Group(); g.name='xinsheng_zone';
    const N=L.nav, nav=new E3.NavGrid(N.w,N.d,N.cell,N.x0,N.z0); nav.b.fill(1);
    const open=(x0,z0,x1,z1)=>{ for(let cz=0;cz<nav.rows;cz++) for(let cx=0;cx<nav.cols;cx++){ const [wx,wz]=nav.toWorld(cx,cz); if(wx>=x0&&wx<=x1&&wz>=z0&&wz<=z1) nav.b[nav.idx(cx,cz)]=0; } };
    const R=L.road, WE=L.walkEast, WW=L.walkWest, AR=L.arcade, F=L.facade, CW=L.campusWall, SG=L.sideGate, WL=L.wenzhouLane;
    const zA=R.z0+0.6, zB=R.z1-0.6;
    open(WE.x0+0.2,zA,CW.x-0.6,zB);                                        // 校園那一側的人行道（圍牆內縮 0.6）
    open(AR.x0+0.35,zA,WW.x1-0.2,zB);                                       // 店面那一側：騎樓（店面玻璃內縮 0.35）＋人行道
    for(const c of L.crossings) open(WW.x1-0.3,c.z-c.w/2,WE.x0+0.3,c.z+c.w/2);   // 斑馬線
    open(WL.x0+1.0,WL.z0+0.6,AR.x0+0.4,WL.z1-0.6);                          // 溫州街巷口
    open(CW.x-0.7,SG.z-SG.w/2+0.6,CW.x+0.9,SG.z+SG.w/2-0.6);                // 側門的門洞
    nav._cm=null;
    const zoneRef={z:null}, backFormal=[];   /* 側門裡面的校園：正式模型等 zone 建好才載入（判斷是不是還在這個區域） */
    // 騎樓柱子：照正式模型（xs_front）每間店靠北那一端一根（x 立面往裡 0.6 m、z 店的 z0 往南 0.3 m）。原本每 4 m 一根，模型裡沒有的 31 根是看不到的柱子，
    //   南洋戲院、山嵐、大口、大步、運動廣場的店門正前方都擋了一根（XS-ARCADE-NAV-1105；tests/xinsheng_unit.js 17 讀 GLB 對位置）
    for(const q of S.arcadeShops(L)) nav.blockRect(AR.x1-0.3,q.z0+0.15,0.6,0.5,0);
    // 沒有騎樓的那幾段（南北兩段公寓）：導航擋到一樓的牆（原本騎樓開到底，走得進公寓的牆裡面 3 m；tests/xinsheng_unit.js 18）
    const NA=S.noArcade(L), wallX=F.upper-S.NO_ARCADE_REC;
    for(const [a,b] of NA) nav.blockRect((AR.x0-1+wallX)/2,(a+b)/2,wallX-(AR.x0-1),b-a,0);
    // 樹、路燈、候車亭、車阻
    for(const [x,z] of L.trees.palms.concat(L.trees.camphor)) nav.blockCircle(x,z,0.45);
    for(const [x,z] of L.lamps) nav.blockCircle(x,z,0.3);
    for(const [x,z] of L.bollards) nav.blockCircle(x,z,0.2);
    { const b=L.busStop; nav.blockRect(b.x+0.9,b.z,0.5,b.w,0); }
    const BR=(typeof Z3!=='undefined'&&Z3.BIKE_RACKS&&Z3.BIKE_RACKS.xinsheng)||[];   /* BIKE-PARK-1104：腳踏車停車架（側門兩邊圍牆前、店面那一側路邊）；bike3d.js 的合法停車處讀同一份 */
    for(const [x,z,ry] of BR) nav.blockRect(x,z,4.6,1.6,-ry);
    if(W3.bikeRack) for(const [x,z,ry] of BR){ const r=W3.bikeRack(7); r.name='xs_bike_rack'; r.position.set(x,0,z); r.rotation.y=ry; g.add(r); }
    // 樹、路燈（套件；參考圖：校園那一側是大王椰子和樟樹，店面那一側是樟樹）
    L.trees.palms.forEach(([x,z],i)=>{ if(!TK.royalPalm) return; const p=TK.royalPalm(15+(i%3)*1.2,700+i,{crown:0.72}); p.position.set(x,0,z); p.rotation.y=i*1.7; g.add(p); });
    L.trees.camphor.forEach(([x,z],i)=>{ if(!TK.tree) return; const t=TK.tree(9+(i%4)*1.1,900+i,{sp:'camphor'}); t.position.set(x,0,z); t.rotation.y=i*2.3; g.add(t); });
    for(const [x,z] of L.lamps){ if(!W3.lampPost) break; const lp=W3.lampPost(); lp.position.set(x,0,z); lp.rotation.y=x>0?-Math.PI/2:Math.PI/2; g.add(lp); }   /* 燈臂朝馬路（W3.lampPost 的燈頭在本地 +z 0.75）*/
    { const b=L.busStop, sh=new THREE.Group(), pm=M('#3a3f45'), gm=new THREE.MeshStandardMaterial({color:0xcfe0e6,transparent:true,opacity:0.35,roughness:0.1}); const roof=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.08,b.w),M('#d9dde0')); roof.position.set(0,2.55,0); sh.add(roof);
      const back=new THREE.Mesh(new THREE.BoxGeometry(0.04,1.9,b.w-0.4),gm); back.position.set(0.85,1.35,0); sh.add(back); for(const dz of [-b.w/2+0.2,b.w/2-0.2]){ const post=new THREE.Mesh(new THREE.BoxGeometry(0.08,2.55,0.08),pm); post.position.set(0.85,1.27,dz); sh.add(post); }
      const bench=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.06,b.w*0.6),M('#8a6440')); bench.position.set(0.5,0.46,0); sh.add(bench); sh.position.set(b.x,0,b.z); g.add(sh); }   /* 候車亭（套件暫代；長椅可以坐之後接）*/
    // 地面（套件，暫代：地面的正式模型還沒做）
    { const r=TK.road(R.z1-R.z0,R.x1-R.x0); r.position.set((R.x0+R.x1)/2,0,(R.z0+R.z1)/2); r.rotation.y=Math.PI/2; r.userData.dyn=true; g.add(r); }
    /* X246 紅磚人行道磚紋（XS-BRICK-WALK-1110，LAWWW2 帳號 A 11-10；LAWWW 派：PBR 磚紋、draw call 不增加，D38 第 6 點）：校園那一側的紅磚人行道（近景、遠景兩頭、南端沿圍牆那一段、側門洞裡那一小段）
       原本是純色 #b77a62 → Poly Haven CC0 brick_pavement_04 的丁字砌紅磚（tools/blender/env_second/textures/xs_brick_tex.py：平均調成原本的 #b77a62，assets/textures/campus/brick_red_{diff,nor}.webp）。
       全部共用一個材質，UV 照世界座標（一張 1.8 m，磚的長邊順著人行道 z 方向）：遠景照舊照材質合成一個網格，draw call 和原本一樣；每一段接得上、不會每段從頭開始。
       貼圖載入前、載入失敗：照舊是 #b77a62 的純色（同一個材質，載到才換圖）*/
    const BRICK_T=1.8, brickM=new THREE.MeshStandardMaterial({color:new THREE.Color('#b77a62'),roughness:0.9,metalness:0}); brickM.name='xs_brick_walk';
    try{ const TL=new THREE.TextureLoader();
      TL.load('assets/textures/campus/brick_red_diff.webp',t=>{ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; brickM.map=t; brickM.color.set(0xffffff); brickM.needsUpdate=true; },undefined,()=>{});
      TL.load('assets/textures/campus/brick_red_nor.webp',t=>{ t.wrapS=t.wrapT=THREE.RepeatWrapping; brickM.normalMap=t; brickM.normalScale.set(0.7,0.7); brickM.needsUpdate=true; },undefined,()=>{}); }catch(e){}
    const brick=m=>{ m.material=brickM; m.updateMatrix(); const p=m.geometry.attributes.position, uv=m.geometry.attributes.uv, v=new THREE.Vector3(); for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i).applyMatrix4(m.matrix); uv.setXY(i,v.z/BRICK_T,v.x/BRICK_T); } uv.needsUpdate=true; return m; };
    const flat=(x0,x1,z0,z1,c,y)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),M(c)); m.rotation.x=-Math.PI/2; m.position.set((x0+x1)/2,y||0.012,(z0+z1)/2); m.receiveShadow=true; m.userData.dyn=true; g.add(m); return m; };
    brick(flat(WE.x0,CW.x+0.4,R.z0,R.z1,'#b77a62'));                        // 紅磚人行道
    flat(AR.x0,WW.x1,R.z0,R.z1,'#cfc8bb');                                  // 騎樓、人行道
    flat(WL.x0,AR.x0,WL.z0,WL.z1,'#a9a9a6',0.006);                          // 巷口
    flat(R.median.x0,R.median.x1,R.z0,R.z1,'#8e8a82',0.03);                 // 分隔島（斑馬線那一段照舊畫，導航是開的）
    for(const c of L.crossings) for(let x=R.x0+0.7;x<R.x1-0.5;x+=1.2) flat(x-0.28,x+0.28,c.z-c.w/2+0.3,c.z+c.w/2-0.3,'#efefe8',0.022);
    flat(-150,150,-200,200,'#6d6a64',-0.02);   /* XS-FARVIEW-1105：原本 ±120／±160，街往兩頭接到 ±178 以後外面還要有地 */
    /* XS-FARVIEW-1105（LAWWW2-B 11-07；使用者 11-05「新生南路側門 遠景太假」：一排方盒、路口外面平的）：街的兩頭接下去（走不到，導航不動）——
       路面、人行道、分隔島、斑馬線、校園那一側的圍牆與行道樹、路燈照近景同一套延伸到 z ±178（S.FAR）：北端 z −100～−84 往西的 T 字路口、南端 z 74～90 十字路口
       （東邊那一段是校園西南角外的路；校園的草地、圍牆在路口前收邊）。樓房是正式模型 bldg.xinsheng_far（下面載入；失敗就只有地面和樹）。
       合併：人行道、分隔島、斑馬線、路燈各照材質合成一個網格（W3.mergeGroup），樹照校園遠景樹的做法。 */
    { const FA=S.FAR, ext=new THREE.Group(); ext.name='xs_far_ext'; const AN=FA.armN, AS=FA.armS, ar=FA.armRoad;
      const cut=(a,b,cs)=>{ let out=[[a,b]]; for(const [c0,c1] of cs) out=[].concat(...out.map(([x,y])=>(c1<=x||c0>=y)?[[x,y]]:[[x,Math.min(y,c0)],[Math.max(x,c1),y]].filter(q=>q[1]-q[0]>0.01))); return out; };
      const mainN=cut(FA.zN,R.z0,[[AN[0]+ar,AN[1]-ar]]), mainS=cut(R.z1,FA.zS,[[AS[0]+ar,AS[1]-ar]]);
      for(const [a,b] of mainN.concat(mainS)){ const r=TK.road(b-a,R.x1-R.x0); r.position.set((R.x0+R.x1)/2,0,(a+b)/2); r.rotation.y=Math.PI/2; r.name='xs_far_road'; ext.add(r); }
      { const r=TK.road(R.x1+140,AN[1]-AN[0]-2*ar); r.position.set((R.x1-140)/2,0,(AN[0]+AN[1])/2); r.name='xs_far_road_armN'; ext.add(r); }   // 北端往西（路口中間那一塊也是它）
      { const r=TK.road(280,AS[1]-AS[0]-2*ar); r.position.set(0,0,(AS[0]+AS[1])/2); r.name='xs_far_road_armS'; ext.add(r); }                    // 南端兩邊
      const fg=new THREE.Group(); const fl=(x0,x1,z0,z1,c,y)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),M(c)); m.rotation.x=-Math.PI/2; m.position.set((x0+x1)/2,y||0.012,(z0+z1)/2); m.receiveShadow=true; fg.add(m); return m; };
      for(const [a,b] of cut(FA.zN,R.z0,[AN]).concat(cut(R.z1,FA.zS,[AS]))) fl(AR.x0,WW.x1,a,b,'#cfc8bb');                       // 西側騎樓＋人行道
      brick(fl(WE.x0,CW.x+0.4,FA.zN,R.z0,'#b77a62'));                                                                                       // 東側（校園那一側）紅磚：北段（T 字路口東側沒有路，不斷開）
      brick(fl(WE.x0,CW.x+0.4,R.z1,AS[0]+ar,'#b77a62'));                                                                                    // 南段到路口前
      fl(WE.x0,-WW.x0,AS[1]-ar,FA.zS,'#cfc8bb');                                                                                     // 南端路口過去：東側是城市（人行道到樓房立面 x 13）
      const zc=AS[0]-1.6;   // 南端：校園圍牆在路口前轉角往東的那一條（牆中心）
      for(const [z0,z1] of [[AN[0],AN[0]+ar],[AN[1]-ar,AN[1]],[AS[0],AS[0]+ar],[AS[1]-ar,AS[1]]]) fl(-140,WW.x1,z0,z1,'#cfc8bb');   // 橫向路兩邊的人行道（西邊，接到主路的路緣）
      brick(fl(CW.x+0.4,140,zc+0.3,AS[0]+ar,'#b77a62')); fl(-WW.x0,140,AS[1]-ar,AS[1],'#cfc8bb');                                           // 南端東邊：北側沿著校園圍牆（紅磚，從牆腳開始）、南側是城市
      for(const [a,b] of mainN.concat(mainS)) fl(R.median.x0,R.median.x1,a,b,'#8e8a82',0.03);                                       // 分隔島
      for(const zc of [AN[0]-2.5,AN[1]+2.5,AS[0]-2.5,AS[1]+2.5]) for(let x=R.x0+0.7;x<R.x1-0.5;x+=1.2) fl(x-0.28,x+0.28,zc-2.2,zc+2.2,'#efefe8',0.022);   // 斑馬線（過主路）
      for(const [x0,x1,zA] of [[-15,-11,AN],[-15,-11,AS],[8.5,12.5,AS]]) for(let z=zA[0]+ar+0.6;z<zA[1]-ar-0.4;z+=1.2) fl(x0,x1,z-0.28,z+0.28,'#efefe8',0.022);   // 斑馬線（過橫向路）
      // 校園圍牆：北段接下去；南段在路口前轉角往東
      /* XS-GATE-FORMAL-1110：遠景的圍牆另外合成一組、標 xsGate，直接放在區域群組底下——正式模型 bldg.xs_gate 也蓋了遠景這幾段，接上以後一起藏（draw call 和原本一樣：牆、壓頂各一個網格）*/
      const fw=new THREE.Group();
      { const wallM=M('#a8634a'), capM=M('#d9d3c6'), seg=(x0,x1,z0,z1)=>{ const w=x1-x0, d=z1-z0; const m=new THREE.Mesh(new THREE.BoxGeometry(w,CW.h,d),wallM); m.position.set((x0+x1)/2,CW.h/2,(z0+z1)/2); fw.add(m); const c=new THREE.Mesh(new THREE.BoxGeometry(w+0.15,0.12,d+0.15),capM); c.position.set((x0+x1)/2,CW.h+0.06,(z0+z1)/2); fw.add(c); };
        seg(CW.x-0.3,CW.x+0.3,FA.zN,CW.z0); seg(CW.x-0.3,CW.x+0.3,CW.z1,zc+0.3); seg(CW.x-0.3,150,zc-0.3,zc+0.3); }
      // 路燈（燈臂朝馬路，和近景同一款）
      for(const [a,b] of cut(FA.zN,R.z0-6,[[AN[0]-3,AN[1]+3]]).concat(cut(R.z1+6,FA.zS,[[AS[0]-3,AS[1]+3]]))) for(let z=b-2;z>a;z-=20){ if(!W3.lampPost) break;
        for(const [x,ry] of [[-8.6,Math.PI/2],[9,-Math.PI/2]]){ const lp=W3.lampPost(); lp.position.set(x,0,z); lp.rotation.y=ry; fg.add(lp); } }
      { const fwm=W3.mergeGroup?W3.mergeGroup(fw):fw; fwm.name='xs_far_wall'; fwm.userData.xsGate=true; fwm.userData.dyn=true; fwm.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); g.add(fwm); }
      const fm=W3.mergeGroup?W3.mergeGroup(fg):fg; fm.name='xs_far_ground'; fm.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); ext.add(fm);
      // 行道樹：東側北段大王椰子和樟樹（和近景一樣排在 x 11.2／10.6）；西側樟樹；南端路口過去東側也是樟樹；校園圍牆後面一排大樹
      { const tg=new THREE.Group(); const H=(a,b)=>{ const h=Math.sin(a*12.9898+b*78.233)*43758.5453; return h-Math.floor(h); }; let sd=2100;
        const T=(x,z,h,o)=>{ if(!TK.tree) return; const t=TK.tree(h,sd++,o); t.position.set(x,0,z); t.rotation.y=H(z,x)*6.28; tg.add(t); };
        for(let z=R.z0-6,i=0;z>FA.zN+2;z-=12,i++){ if(i%2===0&&TK.royalPalm){ const p=TK.royalPalm(15+(i%3)*1.2,2400+i,{crown:0.72}); p.position.set(11.2,0,z); p.rotation.y=i*1.7; tg.add(p); } else T(10.6,z,9+(i%4)*1.1,{sp:'camphor'}); }
        for(const [a,b] of cut(FA.zN,R.z0-4,[[AN[0]-3,AN[1]+3]]).concat(cut(R.z1+4,FA.zS,[[AS[0]-3,AS[1]+3]]))) for(let z=a+5;z<b;z+=13) T(-10.8,z,9+H(z,1)*3,{sp:'camphor'});
        for(let z=AS[1]+5;z<FA.zS;z+=13) T(10.6,z,9+H(z,2)*3,{sp:'camphor'});
        for(let z=FA.zN+4;z<CW.z0-2;z+=9) T(CW.x+7+H(z,9)*3,z+(H(9,z)-0.5)*3,10+H(z,4)*3,{sp:'camphor',spread:1.2});
        for(let z=FA.zN+8;z<CW.z0-6;z+=11) T(CW.x+18+H(z,5)*8,z,11+H(z,6)*4,{sp:H(z,7)<0.35?'banyan':'camphor',spread:1.15});
        const tm=W3.mergeGroup?W3.mergeGroup(tg):tg; tm.name='xs_far_trees'; tm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); ext.add(tm); }
      ext.traverse(o=>{ o.userData.dyn=true; }); g.add(ext); }
    // 校園那一側：圍牆＋側門門柱（套件：正式模型 bldg.xs_gate 載入前、載入失敗時的備用（D38 ③）；標 xsGate，接上正式模型就藏起來。導航照舊是這幾個 blockRect）
    { const wallM=M('#a8634a'), capM=M('#d9d3c6'), postM=M('#bdb5a6'); const segs=[[CW.z0,CW.gateGap[0]],[CW.gateGap[1],CW.z1]];
      for(const [a,b] of segs){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.6,CW.h,b-a),wallM); m.position.set(CW.x,CW.h/2,(a+b)/2); m.userData.dyn=true; m.userData.xsGate=true; g.add(m); const cap=new THREE.Mesh(new THREE.BoxGeometry(0.75,0.12,b-a),capM); cap.position.set(CW.x,CW.h+0.06,(a+b)/2); cap.userData.dyn=true; cap.userData.xsGate=true; g.add(cap); nav.blockRect(CW.x,(a+b)/2,0.9,b-a,0); }
      for(const z of CW.gateGap){ const p=new THREE.Mesh(new THREE.BoxGeometry(1.0,3.0,1.0),postM); p.position.set(CW.x,1.5,z); p.userData.dyn=true; p.userData.xsGate=true; g.add(p); nav.blockRect(CW.x,z,1.2,1.2,0); } }
    // 側門裡面的校園（XS-CAMPUS-BACK-1104 → XS-NORTH-EXT-1105，LAWWW2）：圍牆後面照校園的配置換算（側門在校園北牆 (−101.4, −141)，下面的 C2X）。
    //   側門南邊＝望月台、北邊＝體育館（校園的 Blender 正式模型，校園座標，整組轉 90°＋平移；載入失敗用套件 CK.modern），再過去是校園西北角的樹林。圍牆後面導航本來就整片擋住，走不到，鏡頭也不會進去。
    //   樹用 TK.tree（有正式樹模型時是 TreeField 的 instancing＋遠處卡片，不會一棵一次 draw call）。
    { const back=new THREE.Group(); back.name='xs_campus_back'; // 校園座標 → 新生南路座標：下面的 C2X（XS-NORTH-EXT-1105；舊的是西牆側門的平移 (x+142.4, z+94)）
      const H=(a,b)=>{ const h=Math.sin(a*12.9898+b*78.233)*43758.5453; return h-Math.floor(h); };
      const GZ0=S.FAR.zN, GZ1=S.FAR.armS[0]-1.9;   /* XS-FARVIEW-1105：草地往北接到街的盡頭、往南停在路口前的圍牆（原本 z ±85，南端會蓋到路口的路面）*/
      const gt=W3.grassTex().clone(); gt.wrapS=gt.wrapT=THREE.RepeatWrapping; const GW=140, GD=GZ1-GZ0; gt.repeat.set(GW/4,GD/4); gt.needsUpdate=true;
      const lawn=new THREE.Mesh(new THREE.PlaneGeometry(GW,GD),new THREE.MeshStandardMaterial({map:gt,roughness:0.95})); lawn.rotation.x=-Math.PI/2; lawn.position.set(CW.x+0.35+GW/2,0.004,(GZ0+GZ1)/2); lawn.receiveShadow=true; lawn.userData.dyn=true; back.add(lawn);
      { const pv=new THREE.Mesh(new THREE.PlaneGeometry(3.4,SG.w+0.6),M('#b77a62')); pv.rotation.x=-Math.PI/2; pv.position.set(CW.x+1.6,0.012,SG.z); pv.receiveShadow=true; pv.userData.dyn=true; brick(pv); back.add(pv); }   // 門洞裡面一小段紅磚（和人行道同色），不是草直接接到門口
      const trees=new THREE.Group(); trees.name='xs_campus_trees'; let sd=1300;
      const T=(x,z,h,o)=>{ if(!TK.tree) return; const t=TK.tree(h,sd++,o); t.position.set(x,0,z); t.rotation.y=H(z,x)*6.28; trees.add(t); };
      /* XS-NORTH-EXT-1105（LAWWW2-C 11-05；使用者「門就不要往左邊開了直接往上面開」「新月台也貼著上方的最左邊」「體育館…改到新月台法學院中間」）：
         側門搬到校園北牆以後，圍牆後面照新的換算：新生南路 (x,z) ↔ 校園 (101.4 往西… cx＝−101.4−(z−SG.z)、cz＝−141＋(x−CW.x))——往校園走（+x）＝校園往南（+z）、
         沿街往北（−z）＝校園往東（+x）。側門南邊（z 14.6～31.6）是望月台，北邊（z −1.4～−31.4）是體育館，再過去是校園西北角的樹林。
         街的兩頭（z > 32.6＝校園西牆以西、z < −35.4＝辛亥路那一段）不在校園北牆上，照舊只種一排樹。 */
      const C2X=(cx,cz)=>[CW.x+(cz+141),SG.z-(cx+101.4)], XG=(typeof Z3!=='undefined'&&Z3.XSG)||null;
      const inXSG=(cx,cz,m)=>{ if(!XG) return false; for(const k of ['moon','plaza','park','path','pathE','gym','gymPlaza']){ const r=XG[k]; if(r&&cx>=r[0]-m&&cx<=r[2]+m&&cz>=r[1]-m&&cz<=r[3]+m) return true; } return false; };
      // ① 校園西北角的樹林（校園 x −123～−62、z −124～−84；側門、望月台、停車場、體育館、步道上不種）
      for(let cz=-121;cz<=-86;cz+=7.5) for(let cx=-121;cx<=-62;cx+=8){ const tx=cx+(H(cx,cz)-0.5)*4.5, tz=cz+(H(cz,cx)-0.5)*3.5; if(tz<-124||inXSG(tx,tz,2.5)) continue;   /* 北牆邊（z −141～−124）是望月台、小廣場、體育館；開出來的地方也不種 */
        const [x,z]=C2X(tx,tz); T(x,z,9.5+H(tx,tz)*5.5,{sp:H(tz,tx)<0.35?'banyan':'camphor',spread:1.15+H(tx,7)*0.25}); }
      // ② 圍牆內側一排矮樹：只在街的兩頭（不在校園北牆上的那兩段），和望月台、體育館之間的空檔
      for(let z=CW.z0+2;z<=CW.z1-2;z+=5.5){ const cx=-101.4-(z-SG.z); if(Math.abs(z-SG.z)<SG.w/2+4) continue; if(cx>=-124&&cx<=-56&&inXSG(cx,-139,1.5)) continue;
        T(CW.x+2.2+H(z,3)*0.6,z+(H(3,z)-0.5)*1.2,3.6+H(z,5)*1.2,{sp:'camphor',spread:1.3}); }
      // ③ 街的兩頭，圍牆後面再一排大樹（不讓那兩段看起來空）
      for(let z=CW.z0+4;z<=CW.z1-4;z+=9){ const cx=-101.4-(z-SG.z); if(cx>=-126&&cx<=-54) continue; T(CW.x+7+H(z,9)*3,z+(H(9,z)-0.5)*3,10+H(z,4)*3,{sp:'camphor',spread:1.2}); }
      const tm=W3.mergeGroup?W3.mergeGroup(trees):trees; tm.name='xs_campus_trees'; tm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); tm.userData.dyn=true; back.add(tm);   /* 合併（和校園的遠景樹同一套；有正式樹模型時合併的是記號，TreeField 照樣讀） */
      // ④ 校園的建築：套件版（備用）照換算放；正式模型是校園座標的 GLB，包一層「轉 90°＋平移」交給 Z3.attachWenzhouModel（藏起同標記的套件）
      const fbs=[]; const put=(b,cx,cz,ry,tag)=>{ const [x,z]=C2X(cx,cz); b.position.set(x,0,z); b.rotation.y=ry+Math.PI/2; b.userData.xsBack=tag; b.userData.dyn=true; b.traverse(o=>{ if(o.isMesh) o.castShadow=false; }); g.add(b); fbs.push(b); };
      if(typeof CK!=='undefined'&&CK.modern&&XG){ const R=XG.moon, Gy=XG.gym;
        put(CK.modern({w:R[3]-R[1],d:R[2]-R[0],floors:2,gfh:4.2,fh:3.6,wall:'#efece4',slab:'#c9c6bd',sign:'望月台'}),(R[0]+R[2])/2,(R[1]+R[3])/2,Math.PI/2,'moon');
        put(CK.modern({w:Gy[2]-Gy[0],d:Gy[3]-Gy[1],floors:4,gfh:5.0,fh:4.4,wall:'#d8d4ca',slab:'#a9aba6',sign:'體育館'}),(Gy[0]+Gy[2])/2,(Gy[1]+Gy[3])/2,0,'gym'); }
      if(XG){ const P=XG.plaza; const pv=new THREE.Mesh(new THREE.PlaneGeometry(P[3]-P[1],P[2]-P[0]),M('#c9c2b4')); pv.rotation.x=-Math.PI/2; const [x,z]=C2X((P[0]+P[2])/2,(P[1]+P[3])/2); pv.position.set(x,0.01,z); pv.receiveShadow=true; pv.userData.dyn=true; back.add(pv); }   // 側門內的小廣場（校園 XSG.plaza 那一塊鋪面）
      g.add(back);
      const formal=(key,tag,name)=>{ if(typeof ASSETS==='undefined'||!ASSETS.manifest[key]||!Z3.attachWenzhouModel) return; ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==zoneRef.z) return;
          const wrap=new THREE.Group(); wrap.position.set(CW.x+141,0,SG.z-101.4); wrap.rotation.y=Math.PI/2; wrap.add(c.scene.clone(true)); Z3.attachWenzhouModel(E,g,wrap,'xsBack',name,tag); wrap.traverse(o=>{ if(o.isMesh) o.castShadow=false; }); wrap.userData.dyn=true; })
        .catch(e=>console.warn('新生南路：校園'+tag+'正式模型載入失敗，用套件',e)); };
      backFormal.push(()=>{ formal('bldg.campus_moon','moon','xs_campus_moon_glb'); formal('bldg.campus_gymext','gym','xs_campus_gym_glb'); }); }
    // 店面那一側：備用方塊（正式模型 bldg.xinsheng_street 載入後藏起來）＋鏡頭碰撞
    const fb=[]; const colM=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide});
    const addCollider=(x,z,w,d,h)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h||14,d),colM); m.position.set(x,(h||14)/2,z); g.add(m); E.colliders.push(m); };
    for(const q of L.shops.concat(L.fill)){ const w=q.z1-q.z0, dp=F.upper-F.back, cx=(F.upper+F.back)/2, h=F.groundH+(q.floors-1)*F.floorH;
      const fx=L.fill.includes(q)?wallX:F.x;   // 沒有騎樓的公寓：一樓（備用方塊、鏡頭碰撞）從牆開始，和正式模型、導航一樣
      const up=new THREE.Mesh(new THREE.BoxGeometry(dp,h-F.groundH,w),M('#d6cdbd')); up.position.set(cx,F.groundH+(h-F.groundH)/2,(q.z0+q.z1)/2); up.userData.xsfb=true; up.userData.dyn=true; g.add(up); fb.push(up);
      const lo=new THREE.Mesh(new THREE.BoxGeometry(fx-F.back,F.groundH,w),M('#bfb6a8')); lo.position.set((fx+F.back)/2,F.groundH/2,(q.z0+q.z1)/2); lo.userData.xsfb=true; lo.userData.dyn=true; g.add(lo); fb.push(lo);
      addCollider((fx+F.back)/2,(q.z0+q.z1)/2,fx-F.back,w,h); }
    // 互動點：側門、溫州街巷口、各店門口
    E.interactables.push({x:SG.x-1.6,z:SG.z,radius:2.2,label:SG.label,exit:{to:'campus',spawn:Object.assign({},SG.campusSpawn)}});
    E.interactables.push({x:WL.exit.x,z:WL.exit.z,radius:2.4,label:WL.exit.label,exit:{to:WL.exit.to,spawn:Object.assign({},WL.exit.spawn)}});
    for(const q of L.shops){ const zn='xs_'+q.id, hasRoom=typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[zn];
      const it={x:F.x+0.9,z:q.door.z,radius:1.4,label:(hasRoom?'進':'')+q.name+'（'+String(q.type).replace(/（[^（）]*）/g,'')+'）'};   /* 種類裡的括號（兩層、二樓、24 小時）不放進店門的字：原本「進山嵐書店（書店（兩層））」括號套括號（TODO_SHORTCUTS，LAWWW2 帳號 A 11-10）*/
      if(hasRoom) it.exit={to:zn}; else it.look=q.name+'。'+(q.type||'')+'。玻璃門裡面看得到店員在整理架子。';   /* 室內還沒做的店：先「看」（暫定的字，AA 可以改）*/
      E.interactables.push(it); }
    // 夜間：路燈地上的光圈（套件）
    const pools=[]; for(const [x,z] of L.lamps){ const pl=TK.lightPool(4.0,'rgba(255,214,150,1)'); pl.position.set(x+(x>0?-0.8:0.8),0.03,z); pl.userData.dyn=true; g.add(pl); pools.push(pl); }
    const zoneTime=(h,E2)=>{ let k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); k=Math.max(0,Math.min(1,k)); TK.setNight(k); if(E2&&E2.hemi) E2.hemi.intensity+=0.7*k; for(const p of pools) if(p.material) p.material.opacity=0.55*k; };
    const zone={group:g,nav,spawn:Object.assign({},SG.spawn),lamps:[],buildings:fb,applyTimeOutdoor:zoneTime,onLamps(on){}};
    zoneRef.z=zone; for(const f of backFormal) f();
    /* 店面那一側人行道邊停的機車（XS-SCOOTERS-1111，LAWWW2 帳號 A 11-11；BB／CC 11-11 03:44 讀碼發現：配置 xinsheng_layout.js 的 scooters 從 11-03 就在，這支程式一直沒有讀——新生南路 0 台）。
       照配置的 x 和幾段 z：一小群一小群（三到五台）、群和群之間空一格；店門口、斑馬線、溫州街巷口前不停；每台前後錯開一點、車頭左右轉幾度。
       模型和公館、溫州街、汀州路同一套（Z3.attachWzScooters；款式和顏色用汀州路的挑法 TZ3.pickScooter：相鄰不同款、不同色系）；沒有正式模型時是套件的機車。每台擋導航（和汀州路一樣大） */
    { const SC=L.scooters, spots=S.scooterSpots(L), scG=new THREE.Group(), scList=[], st={n:0,dark:0,tailA:0,run3:0,adjSame:0,codes:{}}, kit=['#c9463d','#2b2b2d','#e8e6e0','#3d6fb0','#8a8f98','#2f6a4a','#d9b23a']; let pv=null; scG.name='xs_kit_scooters'; scG.userData.dyn=true;
      const hash=(a,b)=>{ const t=Math.sin(a*12.9898+b*78.233)*43758.5453; return t-Math.floor(t); };
      /* 三款配件車（擋風鏡、腳踏板的袋子、蓋座墊的雨衣）每款指定一台（第 2、6、10 台）：一款的機率只有 3%，這條街 12 台照位置抽剛好一台都沒有（BB 11-11 04:4x） */
      const ACC=['S1A_W','S1B_G','S7_R']; let qi=-1;
      for(const q of spots){ qi++; let pk=(typeof TZ3!=='undefined'&&TZ3.pickScooter)?TZ3.pickScooter(q.z,-1,pv,st):null; const acc=(qi%4===1)?ACC[(qi-1)/4]:null;
        if(pk&&acc&&TZ3.SC&&TZ3.SC[acc]) pk=Object.assign({},pk,{code:acc});
        const c=pk?pk.col:kit[Math.floor(hash(q.z,9)*7)]; if(pk) pv={code:pk.code,tail:pk.tail,cf:pk.cf,pp:pv};
        const o=TK.scooter(c); o.position.set(q.x,0,q.z); o.rotation.y=q.ry; o.userData.dyn=true; scG.add(o); scList.push(pk?{o,color:c,code:pk.code,pcol:c,grp:'xs'+q.g}:{o,color:c,grp:'xs'+q.g}); nav.blockRect(SC.x,q.z,1.5,0.8,0); }
      nav._cm=null; g.add(scG); zone.xsScooters=scList.length; zone.xsScList=scList.map(q=>({code:q.code||null,col:q.color,grp:q.grp}));
      if(scList.length&&Z3.attachWzScooters&&typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.wz_scooter']){ if(typeof P3!=='undefined'&&P3.mergeStatic) P3.mergeStatic(scG);
        ASSETS.loadOne('bldg.wz_scooter').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; zone.xsScooterGLB=Z3.attachWzScooters(g,scG,scList,c.scene,'xs_scooters_glb'); }).catch(e=>console.warn('新生南路機車模型載入失敗，用套件的機車',e)); } }
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.xinsheng_street']&&Z3.attachWenzhouModel) ASSETS.loadOne('bldg.xinsheng_street').then(c=>{ if(!c||!c.scene||E.zone!==zone) return;
      const xsR=c.scene.clone(true); Z3.attachWenzhouModel(E,g,xsR,'xsfb','xinsheng_street_glb');
      if(Z3.shopInsideLit) Z3.shopInsideLit(xsR,zone,S.SHOP_IN_PLACE);
      if(Z3.shopInsideReal) Z3.shopInsideReal(E,g,zone,S.SHOP_REAL);
      if(Z3.shopShutters) Z3.shopShutters(E,g,zone,S.SHOP_SHUT);   /* 同弦樂器：一樓櫥窗、樓梯口的鐵捲門 */
      if(Z3.ggShopLit) Z3.ggShopLit(xsR,zone,S.SHOP_LIT_PLACE,{glow:false});   /* 二樓以上的亮窗卡：打烊的店調暗（這條街的光暈只有樓梯燈和一個招牌，不跟著熄）*/   /* SHOP-REAL-INSIDE-1112：附近的店換成真的室內模型（簡化的 sk_in_<店> 只當載入前的備用）*/   /* SHOP-WINDOW-3D-1112：立體店內（sk_in_<店>）打烊就關燈 */
      }).catch(e=>console.warn('新生南路正式模型載入失敗，用方塊立面',e));
    /* XS-FARVIEW-1105：街兩頭的樓房（正式模型，遠景：不投影）；接上以後這一區不畫引擎的城市剪影圓筒（engine3d.js 讀 zone.noSkylineCity；圓筒在校園那一側正好落在校園裡）*/
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.xinsheng_far']&&Z3.attachWenzhouModel) ASSETS.loadOne('bldg.xinsheng_far').then(c=>{ if(!c||!c.scene||E.zone!==zone) return;
      const root=c.scene.clone(true); Z3.attachWenzhouModel(E,g,root,'xsFar','xinsheng_far_glb'); root.traverse(o=>{ if(o.isMesh) o.castShadow=false; }); root.userData.dyn=true; zone.noSkylineCity=true; }).catch(e=>console.warn('新生南路遠景模型載入失敗',e));
    /* X246 人行道花台（XS-PLANTERS-1110，LAWWW2 帳號 A 11-10；使用者 11-05「新生南路側門改成我的照片的樣子」：人行道花台、紅磚、廣場——紅磚、廣場已經有，花台沒有）：
       tools/blender/env_second/xs_planters.py → bldg.xs_planters：沿校園圍牆內側一段一段的花崗石矮花台＋修剪過的杜鵑（溫州公園同一套 SEASON_AZALEA_on／off：3 月開花，Z3.wzParkSeason）。
       花台的範圍在 GLB 的 extras.planters（[x0,z0,x1,z1]，這一區的座標），載入以後照它擋導航（離牆 5 cm、寬 1.7 m；側門洞前後各留 1 m、每段之間 1.2 m）。載入失敗＝沒有花台，導航照舊。
       測試：node tests/xs_planters_unit.js */
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.xs_planters']) ASSETS.loadOne('bldg.xs_planters').then(c=>{ if(!c||!c.scene||E.zone!==zone) return;
      const root=c.scene.clone(true); root.name='xs_planters_glb'; root.userData.dyn=true; let pl=null;
      root.traverse(o=>{ if(!pl&&o.userData&&Array.isArray(o.userData.planters)) pl=o.userData.planters; if(!o.isMesh) return; const n=(o.material&&o.material.name)||''; o.receiveShadow=true; o.castShadow=/granite|azalea_core/.test(n);
        if(/azalea_(leaf|flower)/.test(n)){ o.material.alphaTest=Math.max(o.material.alphaTest||0,0.5); o.material.side=THREE.DoubleSide; } });
      g.add(root); if(Z3.wzParkSeason) Z3.wzParkSeason(root); else root.traverse(o=>{ if(/^SEASON_AZALEA_on/.test(o.name||'')) o.visible=false; });
      for(const r of pl||[]) nav.blockRect((r[0]+r[2])/2,(r[1]+r[3])/2,r[2]-r[0],r[3]-r[1],0,0.05); nav._cm=null; zone.planters=pl||[]; }).catch(e=>console.warn('新生南路人行道花台載入失敗（沒有花台，導航照舊）',e));
    /* X246 側門正式門柱、鐵門、圍牆（XS-GATE-FORMAL-1110，LAWWW2 帳號 A 11-10；LAWWW 13:39 派）：tools/blender/env_second/xs_gate.py → bldg.xs_gate（這一區的座標）。
       紅磚矮牆＋鑄鐵欄杆＋牆墩、門柱（花崗石柱礎、紅磚柱身、石材柱帽、鑄鐵燈籠，北邊門柱面向馬路掛「首都帝大」直式石牌）、兩扇開著的鐵門（往校內、和圍牆垂直）；
       近景 z −68～68 加遠景兩頭（北到 −178、南端轉角往東到 x 150）。接上以後標 xsGate 的套件（近景的牆、壓頂、門柱，遠景的牆）藏起來；導航不動。
       欄杆是一片貼圖卡（xg_rail：透明裁切、兩面、不投影）。燈籠 wz_lamp_lens 晚上亮（WZ_NIGHT）、GLOW_ 光暈；石牌 PLATE_FACE_ 遊戲畫字。載入失敗＝照舊是套件。測試：node tests/xs_gate_formal_unit.js */
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.xs_gate']&&Z3.attachWenzhouModel) ASSETS.loadOne('bldg.xs_gate').then(c=>{ if(!c||!c.scene||E.zone!==zone) return;
      const root=c.scene.clone(true); Z3.attachWenzhouModel(E,g,root,'xsGate','xs_gate_glb'); root.userData.dyn=true;
      root.traverse(o=>{ if(!o.isMesh) return; const n=(o.material&&o.material.name)||''; if(/^xg_rail/.test(n)){ o.material.alphaTest=Math.max(o.material.alphaTest||0,0.5); o.material.side=THREE.DoubleSide; o.material.transparent=false; o.castShadow=false; } }); }).catch(e=>console.warn('新生南路側門正式模型載入失敗（照舊是套件的牆和門柱）',e));
    return zone; };
  /* 正式模型登錄在這裡（和木曜日、118 巷店家一樣，不動 assets3d.js）：七家店照參考圖的店面（ART-XINSHENG-FRONTS-1104，LAWWW2 tools/blender/env_second/wz_street.py --set xinsheng；
     招牌、店內、二樓窗的貼圖從使用者的參考圖裁出來，xs_front_tex.py）＋其他樓房、騎樓 */
  if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['bldg.xinsheng_far']) ASSETS.manifest['bldg.xinsheng_far']={url:'assets/models/env/second_ai/xinsheng_far.glb',type:'building',lazy:true,source:'LAWWW2 tools/blender/env_second/wz_street.py --set xinsheng_far（XS-FARVIEW-1105：街兩頭的樓房、路口、號誌）',license:'本作'};
  if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['bldg.xs_gate']) ASSETS.manifest['bldg.xs_gate']={url:'assets/models/env/second_ai/xs_gate.glb',type:'building',lazy:true,source:'LAWWW2 tools/blender/env_second/xs_gate.py（X246 新生南路側門正式門柱、鐵門、圍牆；貼圖 Poly Haven CC0 red_brick、sandstone_blocks_08、granite_tile_03，欄杆貼圖本作）',license:'本作；貼圖 CC0'};
  if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['bldg.xs_planters']) ASSETS.manifest['bldg.xs_planters']={url:'assets/models/env/second_ai/xs_planters.glb',type:'building',lazy:true,source:'LAWWW2 tools/blender/env_second/xs_planters.py（X246 新生南路人行道花台：花崗石框＋修剪杜鵑，杜鵑貼圖同溫州公園）',license:'本作'};
  if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['bldg.xinsheng_street']) ASSETS.manifest['bldg.xinsheng_street']={url:'assets/models/env/second_ai/xinsheng_street.glb',type:'building',lazy:true,source:'LAWWW2 tools/blender/env_second/wz_street.py --set xinsheng（店面貼圖：使用者提供的參考圖 ref_images/shops/*_ext.webp）',license:'本作'};
  if(typeof Z3!=='undefined'&&Z3.ZONES) Z3.ZONES.xinsheng={id:'xinsheng',name:'新生南路',indoor:false,cityLight:0.9,size:[76,136],camDist:5.6,build(E){ return S.build(E); }};
  return S;
})();

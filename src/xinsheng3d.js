/* 新生南路（首都帝大新生南路側門外的店面街；ART-XINSHENG-GATE-1103，D108；LAWWW2 11-03 草案，WIP，還沒接進 index.html）
   需求：AA_615 第 1～3 節、AA_617 第 1 節的路線、AA_622；配置 src/data/xinsheng_layout.js（和 Blender 的 wz_street.py --set xinsheng 共用）。
   座標：x 往東（+x＝校園那一側）、z 往南。走得到的地方：校園那一側的人行道、兩條斑馬線、店面那一側的人行道和騎樓、溫州街巷口；馬路其他地方走不到（車道）。
   出口：側門 → campus（校園西側圍牆北段 (−124, −88)，LAWWW 11-03 20:20 同意）；溫州街巷口 → wenzhou 的西端（LAWWW 11-03 20:24 同意）。
   店：室內由 AA、BB、CC 做（AA 11-03 分工）；還沒有室內的店，門口是「看櫥窗」的互動點（note 寫在 layout 的 shops[].note）。
   正式模型：bldg.xinsheng_street（立面；接法和 118 巷同一套 Z3.attachWenzhouModel）；地面、校園那一側（圍牆、側門、椰子、樟樹、候車亭）的正式模型還沒做，先用套件。 */
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
  S.NO_ARCADE_REC=0.2;   // 沒有騎樓的那幾段：一樓牆在立面（facade.upper）往裡 0.2 m（wz_street.py 住家／鐵捲門的 rec）
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
    const flat=(x0,x1,z0,z1,c,y)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),M(c)); m.rotation.x=-Math.PI/2; m.position.set((x0+x1)/2,y||0.012,(z0+z1)/2); m.receiveShadow=true; m.userData.dyn=true; g.add(m); return m; };
    flat(WE.x0,CW.x+0.4,R.z0,R.z1,'#b77a62');                               // 紅磚人行道
    flat(AR.x0,WW.x1,R.z0,R.z1,'#cfc8bb');                                  // 騎樓、人行道
    flat(WL.x0,AR.x0,WL.z0,WL.z1,'#a9a9a6',0.006);                          // 巷口
    flat(R.median.x0,R.median.x1,R.z0,R.z1,'#8e8a82',0.03);                 // 分隔島（斑馬線那一段照舊畫，導航是開的）
    for(const c of L.crossings) for(let x=R.x0+0.7;x<R.x1-0.5;x+=1.2) flat(x-0.28,x+0.28,c.z-c.w/2+0.3,c.z+c.w/2-0.3,'#efefe8',0.022);
    flat(-120,120,-160,160,'#6d6a64',-0.02);
    // 校園那一側：圍牆＋側門門柱（套件，暫代）
    { const wallM=M('#a8634a'), capM=M('#d9d3c6'), postM=M('#bdb5a6'); const segs=[[CW.z0,CW.gateGap[0]],[CW.gateGap[1],CW.z1]];
      for(const [a,b] of segs){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.6,CW.h,b-a),wallM); m.position.set(CW.x,CW.h/2,(a+b)/2); m.userData.dyn=true; g.add(m); const cap=new THREE.Mesh(new THREE.BoxGeometry(0.75,0.12,b-a),capM); cap.position.set(CW.x,CW.h+0.06,(a+b)/2); cap.userData.dyn=true; g.add(cap); nav.blockRect(CW.x,(a+b)/2,0.9,b-a,0); }
      for(const z of CW.gateGap){ const p=new THREE.Mesh(new THREE.BoxGeometry(1.0,3.0,1.0),postM); p.position.set(CW.x,1.5,z); p.userData.dyn=true; g.add(p); nav.blockRect(CW.x,z,1.2,1.2,0); } }
    // 側門裡面的校園（XS-CAMPUS-BACK-1104，LAWWW2）：圍牆後面原本只有一片灰色地面。照校園的配置換算（新生南路 (x,z) → 校園 (x−142.4, z−94)；側門 (18.4,10)＝校園的側門 (−124,−84)）：
    //   側門北邊＝校園西北角走不到的樹林（校園 z ≤ −88、x −123～−62，zones3d.js 的「西北角走不到的樹林」）；側門南邊是草地，遠一點是農業陳列館（洞洞館）和校史館
    //   （校園的 Blender 正式模型，校園座標，整組平移；載入失敗用套件 CK）。圍牆後面導航本來就整片擋住（只開了圍牆外和門洞），走不到，鏡頭也不會進去。
    //   樹用 TK.tree（有正式樹模型時是 TreeField 的 instancing＋遠處卡片，不會一棵一次 draw call）。
    { const back=new THREE.Group(); back.name='xs_campus_back'; const OX=CW.x+124, OZ=SG.z+84;   // 校園座標 → 新生南路座標的位移
      const H=(a,b)=>{ const h=Math.sin(a*12.9898+b*78.233)*43758.5453; return h-Math.floor(h); };
      const gt=W3.grassTex().clone(); gt.wrapS=gt.wrapT=THREE.RepeatWrapping; const GW=140, GD=170; gt.repeat.set(GW/4,GD/4); gt.needsUpdate=true;
      const lawn=new THREE.Mesh(new THREE.PlaneGeometry(GW,GD),new THREE.MeshStandardMaterial({map:gt,roughness:0.95})); lawn.rotation.x=-Math.PI/2; lawn.position.set(CW.x+0.35+GW/2,0.004,0); lawn.receiveShadow=true; lawn.userData.dyn=true; back.add(lawn);
      { const pv=new THREE.Mesh(new THREE.PlaneGeometry(3.4,SG.w+0.6),M('#b77a62')); pv.rotation.x=-Math.PI/2; pv.position.set(CW.x+1.6,0.012,SG.z); pv.receiveShadow=true; pv.userData.dyn=true; back.add(pv); }   // 門洞裡面一小段紅磚（和人行道同色），不是草直接接到門口
      const trees=new THREE.Group(); trees.name='xs_campus_trees'; let sd=1300;
      const T=(x,z,h,o)=>{ if(!TK.tree) return; const t=TK.tree(h,sd++,o); t.position.set(x,0,z); t.rotation.y=H(z,x)*6.28; trees.add(t); };
      // ① 樹林：校園 x −121～−62、z −88 以北（新生南路這邊 x 21～80、z 6 以北；北端多種到 z −80，不讓圍牆外的人看到樹林突然沒了）
      for(let z=SG.z-6;z>=-80;z-=7.5) for(let x=CW.x+3.5;x<=CW.x+62;x+=8){ const tx=x+(H(x,z)-0.5)*4.5, tz=z+(H(z,x)-0.5)*3.5;
        T(tx,tz,9.5+H(tx,tz)*5.5,{sp:H(tz,tx)<0.35?'banyan':'camphor',spread:1.15+H(tx,7)*0.25}); }
      // ② 圍牆內側一排矮樹（只在樹林那一段的外緣與草地那一段；門洞前後各留 4 m）
      for(let z=CW.z0+2;z<=CW.z1-2;z+=5.5){ if(Math.abs(z-SG.z)<SG.w/2+4) continue; if(z<SG.z-6) continue; T(CW.x+2.2+H(z,3)*0.6,z+(H(3,z)-0.5)*1.2,3.6+H(z,5)*1.2,{sp:'camphor',spread:1.3}); }
      // ③ 側門南邊的草地：零星幾棵大樹（避開洞洞館、校史館前面）
      for(let z=SG.z+9;z<=CW.z1+6;z+=13) for(let x=CW.x+9;x<=CW.x+70;x+=15){ const tx=x+(H(x,z)-0.5)*7, tz=z+(H(z,x)-0.5)*6; if(tz>50&&tx<CW.x+62) continue; if(H(tx,tz)<0.3) continue;
        T(tx,tz,10+H(tz,tx)*4,{sp:'camphor',spread:1.25}); }
      const tm=W3.mergeGroup?W3.mergeGroup(trees):trees; tm.name='xs_campus_trees'; tm.traverse(m=>{ if(m.isMesh) m.castShadow=false; }); tm.userData.dyn=true; back.add(tm);   /* 合併（和校園的遠景樹同一套；有正式樹模型時合併的是記號，TreeField 照樣讀） */
      // ④ 遠處的兩棟校園建築：套件版（備用）在新生南路座標；正式模型是校園座標的 GLB，包一層平移後交給 Z3.attachWenzhouModel（藏起同標記的套件）
      const fbs=[]; const put=(b,cx,cz,tag)=>{ b.position.set(cx+OX,0,cz+OZ); b.userData.xsBack=tag; b.userData.dyn=true; b.traverse(o=>{ if(o.isMesh) o.castShadow=false; }); g.add(b); fbs.push(b); };
      if(typeof CK!=='undefined'){ if(CK.pavilion) put(CK.pavilion({w:22,d:14,gfh:4.0,h:9,sign:'農業陳列館'}),-104,-30,'pavilion');
        if(CK.hall) put(CK.hall({w:24,d:16,floors:2,gfh:5.0,fh:4.6,wall:'#a25d43',trim:'#d8cfbd',roof:'#43342e',roofH:4.4,arcade:true,porch:{bays:3,depth:2.6,pediment:true,pedH:1.6},sign:'校史館'}),-77,-29,'hist'); }
      g.add(back);
      const formal=(key,tag,name)=>{ if(typeof ASSETS==='undefined'||!ASSETS.manifest[key]||!Z3.attachWenzhouModel) return; ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==zoneRef.z) return;
          const wrap=new THREE.Group(); wrap.position.set(OX,0,OZ); wrap.add(c.scene.clone(true)); Z3.attachWenzhouModel(E,g,wrap,'xsBack',name,tag); wrap.traverse(o=>{ if(o.isMesh) o.castShadow=false; }); wrap.userData.dyn=true; })
        .catch(e=>console.warn('新生南路：校園'+tag+'正式模型載入失敗，用套件',e)); };
      backFormal.push(()=>{ formal('bldg.campus_pavilion','pavilion','xs_campus_pavilion_glb'); formal('bldg.campus_hist','hist','xs_campus_hist_glb'); }); }
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
      const it={x:F.x+0.9,z:q.door.z,radius:1.4,label:(hasRoom?'進':'')+q.name+'（'+q.type+'）'};
      if(hasRoom) it.exit={to:zn}; else it.look=q.name+'。'+(q.type||'')+'。玻璃門裡面看得到店員在整理架子。';   /* 室內還沒做的店：先「看」（暫定的字，AA 可以改）*/
      E.interactables.push(it); }
    // 夜間：路燈地上的光圈（套件）
    const pools=[]; for(const [x,z] of L.lamps){ const pl=TK.lightPool(4.0,'rgba(255,214,150,1)'); pl.position.set(x+(x>0?-0.8:0.8),0.03,z); pl.userData.dyn=true; g.add(pl); pools.push(pl); }
    const zoneTime=(h,E2)=>{ let k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); k=Math.max(0,Math.min(1,k)); TK.setNight(k); if(E2&&E2.hemi) E2.hemi.intensity+=0.7*k; for(const p of pools) if(p.material) p.material.opacity=0.55*k; };
    const zone={group:g,nav,spawn:Object.assign({},SG.spawn),lamps:[],buildings:fb,applyTimeOutdoor:zoneTime,onLamps(on){}};
    zoneRef.z=zone; for(const f of backFormal) f();
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.xinsheng_street']&&Z3.attachWenzhouModel) ASSETS.loadOne('bldg.xinsheng_street').then(c=>{ if(!c||!c.scene||E.zone!==zone) return;
      Z3.attachWenzhouModel(E,g,c.scene.clone(true),'xsfb','xinsheng_street_glb'); }).catch(e=>console.warn('新生南路正式模型載入失敗，用方塊立面',e));
    return zone; };
  /* 正式模型登錄在這裡（和木曜日、118 巷店家一樣，不動 assets3d.js）：七家店照參考圖的店面（ART-XINSHENG-FRONTS-1104，LAWWW2 tools/blender/env_second/wz_street.py --set xinsheng；
     招牌、店內、二樓窗的貼圖從使用者的參考圖裁出來，xs_front_tex.py）＋其他樓房、騎樓 */
  if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['bldg.xinsheng_street']) ASSETS.manifest['bldg.xinsheng_street']={url:'assets/models/env/second_ai/xinsheng_street.glb',type:'building',lazy:true,source:'LAWWW2 tools/blender/env_second/wz_street.py --set xinsheng（店面貼圖：使用者提供的參考圖 ref_images/shops/*_ext.webp）',license:'本作'};
  if(typeof Z3!=='undefined'&&Z3.ZONES) Z3.ZONES.xinsheng={id:'xinsheng',name:'新生南路',indoor:false,cityLight:0.9,size:[76,136],camDist:5.6,build(E){ return S.build(E); }};
  return S;
})();

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
    // 騎樓柱子（每間店的分界、每 4 m 一根）、樹、路燈、候車亭、車阻
    const pillarZ=[]; for(const q of L.shops.concat(L.fill)) for(let z=q.z0;z<=q.z1+0.01;z+=Math.max(3.6,(q.z1-q.z0)/Math.max(1,Math.round((q.z1-q.z0)/4)))) pillarZ.push(z);
    for(const z of pillarZ){ if(z>WL.z0-0.2&&z<WL.z1+0.2) continue; nav.blockRect(AR.x1-0.3,z,0.5,0.5,0); }
    for(const [x,z] of L.trees.palms.concat(L.trees.camphor)) nav.blockCircle(x,z,0.45);
    for(const [x,z] of L.lamps) nav.blockCircle(x,z,0.3);
    for(const [x,z] of L.bollards) nav.blockCircle(x,z,0.2);
    { const b=L.busStop; nav.blockRect(b.x+0.9,b.z,0.5,b.w,0); }
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
    // 店面那一側：備用方塊（正式模型 bldg.xinsheng_street 載入後藏起來）＋鏡頭碰撞
    const fb=[]; const colM=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide});
    const addCollider=(x,z,w,d,h)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h||14,d),colM); m.position.set(x,(h||14)/2,z); g.add(m); E.colliders.push(m); };
    for(const q of L.shops.concat(L.fill)){ const w=q.z1-q.z0, dp=F.upper-F.back, cx=(F.upper+F.back)/2, h=F.groundH+(q.floors-1)*F.floorH;
      const up=new THREE.Mesh(new THREE.BoxGeometry(dp,h-F.groundH,w),M('#d6cdbd')); up.position.set(cx,F.groundH+(h-F.groundH)/2,(q.z0+q.z1)/2); up.userData.xsfb=true; up.userData.dyn=true; g.add(up); fb.push(up);
      const lo=new THREE.Mesh(new THREE.BoxGeometry(F.x-F.back,F.groundH,w),M('#bfb6a8')); lo.position.set((F.x+F.back)/2,F.groundH/2,(q.z0+q.z1)/2); lo.userData.xsfb=true; lo.userData.dyn=true; g.add(lo); fb.push(lo);
      addCollider((F.x+F.back)/2,(q.z0+q.z1)/2,F.x-F.back,w,h); }
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
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.xinsheng_street']&&Z3.attachWenzhouModel) ASSETS.loadOne('bldg.xinsheng_street').then(c=>{ if(!c||!c.scene||E.zone!==zone) return;
      Z3.attachWenzhouModel(E,g,c.scene.clone(true),'xsfb','xinsheng_street_glb'); }).catch(e=>console.warn('新生南路正式模型載入失敗，用方塊立面',e));
    return zone; };
  if(typeof Z3!=='undefined'&&Z3.ZONES) Z3.ZONES.xinsheng={id:'xinsheng',name:'新生南路',indoor:false,cityLight:0.9,size:[76,136],camDist:5.6,build(E){ return S.build(E); }};
  return S;
})();

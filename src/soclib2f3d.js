/* ===== 社會科學院圖書館 東側館（SOCLIB-2F-1104，LAWWW2-C 2026-11-04）：一樓門廳＋樓梯＋電梯＋影印休息區、二樓自習室、討論室、洗手間 =====
   使用者 11-04 16:1x（對 AA-C）：「我那時候大學最喜歡去社科院圖書館2樓，你現在好像沒有2樓，你查一下他的2樓有一個專門的讀書室還會有洗手間啊」；規格 AA_669 第 6 節（企劃線 468a1d0b9）。
   配置：src/data/soclib2f_layout.js（tools/blender/env_second/soclib2f_layout_gen.py 產生；Blender 正式模型 tools/blender/env_second/soclib2f_interior.py 讀同一份，兩邊的位置一定一致）。
   區域：閱覽室（soclib）東牆的門 → soclib_2f（這個檔案，兩層導航）；一樓西牆的門回閱覽室（出生點 SL2.HALL）。
         一樓閱覽室那種樹狀柱不延伸到這裡（D136）：這是閱覽室東邊另外接的兩層樓（閱覽室挑高 5.6 m，二樓不在它上面）。
         開放時間跟著閱覽室（src/data/places.js 的 soclib）：閉館的處理在 story3d.js（現在只看 G.zone==='soclib'，要 LAWWW 把 soclib_2f 加進去：接線 patch 寫在交件 README）。
   導航：兩層 NavGrid（1F y=0、2F y=4.2；同尺寸、同原點）；A 跑（往南）、平台、B 跑（往北）兩層共用（D36；宿舍走廊同一種做法，方向相反）；
         B 跑最上面一排在第 0 層擋起來（走到那裡之前要換到第 1 層，不能從一樓門廳直接走進去）；電梯 B3.buildElevator（車廂的格子由電梯自己開關）。
   座位：自習室南北向長桌 6 張 × 6 位＝36（中間一道矮隔板、插座）、靠窗長檯面 13 位（北往南第三個＝劇情的「老位子」：seat.old；SL2.oldSeat()）、討論室 3 間 × 4 位。
         seat.table：同一張桌子（npcNear「坐同一張桌子」、習慣記憶用）——長桌 st00…st12、靠窗每 3 個一組 sw0…sw4、討論室 d1…d3。
   鏡頭：室內的牆、玻璃隔間是鏡頭碰撞（E.colliders，放在樓層群組外面：正式模型載入後照樣有）；外牆擋住鏡頭時淡出；二樓樓板是 zone.slabs（鏡頭不穿過）。
   電梯運鏡（game3d.js 的 elevatorRide）固定在車廂中心往西 3.4 m、往南 4.2 m：兩層都要是空的（配置的 elevCam；二樓是自習室，北面是玻璃隔間）。
   畫面：程序化備用模型（正式模型載入前、載入失敗時；D38 分類 ③）；正式模型（ASSETS 'bldg.soclib2f_interior'，這支自己登記）載入後由 B3.attachFormal 換掉。 */
'use strict';
const SL2=(function(){
  const LAYOUT=()=>SOCLIB2F_LAYOUT;
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  if(typeof ASSETS!=='undefined'&&ASSETS.manifest&&!ASSETS.manifest['bldg.soclib2f_interior']) ASSETS.manifest['bldg.soclib2f_interior']={url:'assets/models/env/second_ai/soclib2f_interior.glb',type:'building',lazy:true,
    source:'本作 Blender 腳本 tools/blender/env_second/soclib2f_interior.py（社科院圖書館東側館：一樓門廳、樓梯、影印休息區，二樓自習室、討論室、洗手間；配置 soclib2f_layout_gen.py；遊戲化設計、不是實測；貼圖 Poly Haven CC0）',license:'本作；貼圖 CC0'};
  const HALL=()=>Object.assign({},LAYOUT().hall.spawn);           // 回閱覽室：站在閱覽室東牆的門內、面向西
  const ENTRY=()=>Object.assign({},LAYOUT().entrance.spawn);      // 從閱覽室進來：一樓門廳西牆的門內、面向東

  // ---- 樓梯的高度：A 跑往南（+z）從 0 爬到平台、B 跑往北（−z）從平台爬到二樓；連續斜面給碰撞與找路，畫面上一階一階（tread／rise／low）----
  function stairSurfs(L){ const S=L.stair, r=S.rise, t=S.tread, A=S.A, B=S.B, LD=S.landing, Y1=L.floors[1].y;
    const a={x0:A.x0,x1:A.x1,z0:A.z0,z1:A.z1-t/2,axis:'z',ya:0,yb:A.risers*r,tread:t,rise:r,low:'z0'};
    const atop={x0:A.x0,x1:A.x1,z0:A.z1-t/2,z1:A.z1,y:LD.y};                                 // A 跑最上面一階（和平台同高）的後半
    const ld={x0:LD.x0,x1:LD.x1,z0:LD.z0,z1:LD.z1,y:LD.y};
    const b={x0:B.x0,x1:B.x1,z0:B.z0+t/2,z1:B.z1,axis:'z',ya:Y1,yb:LD.y,tread:t,rise:r,low:'z1'};
    const btop={x0:B.x0,x1:B.x1,z0:B.z0,z1:B.z0+t/2,y:Y1};                                   // B 跑最上面一階（和二樓同高）的前半
    return {a,atop,ld,b,btop,all:[ld,atop,a,b,btop]}; }

  // ---- 導航：兩層（先整層擋起來，再開出走得到的地方；家具在 buildFurniture 擋）----
  function buildNav(L){ const S=L.stair, B=S.B, MW=S.midWall, Y1=L.floors[1].y, c=L.cell, NS=L.navSize, NO=L.navOrigin, EB=L.elevator.block;
    const mk=()=>new E3.NavGrid(NS[0],NS[1],c,NO[0],NO[1]); const nav0=mk(), nav1=mk().setFloor(Y1); const ss=stairSurfs(L);
    nav0.fillBlocked(); for(const r of L.free0) nav0.freeRect(r[0],r[1],r[2],r[3]);
    for(const s of ss.all) nav0.addSurf(Object.assign({},s));
    nav0.blockRect((MW.x0+MW.x1)/2,(B.z0+B.z1)/2,MW.x1-MW.x0,B.z1-B.z0,0);         // 兩跑中間的牆
    nav0.blockRect((B.x0+B.x1)/2,B.z0+0.2,B.x1-B.x0,0.4,0);                         // B 跑最上面那一排（約 4 m 高）在第 0 層擋住：一樓門廳不能直接走上去
    nav1.fillBlocked(); for(const r of L.free1) nav1.freeRect(r[0],r[1],r[2],r[3]);
    nav1.addSurf(Object.assign({},ss.b)); nav1.addSurf(Object.assign({},ss.btop));
    for(const n of [nav0,nav1]) n.blockRect(EB[0],EB[1],EB[2],EB[3],0);              // 電梯井道和四周一圈（車廂裡的格子由電梯自己開關）
    nav0._cm=null; nav1._cm=null; return {nav0,nav1,ss}; }

  // ---- 材質（備用模型）：D112 不要深色木地板——一樓、走廊淺色磨石子，自習室、討論室淺灰地毯 ----
  const floorM=(key,col,w,d,rep)=>{ const tx=W3.stoneTex(col).clone(); tx.needsUpdate=true; tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.repeat.set(w/(rep||2),d/(rep||2)); return new THREE.MeshStandardMaterial({map:tx,roughness:0.62}); };
  const carpetM=()=>TK.M('sl2_carpet',()=>TK.std({color:0xa9aeaf,roughness:0.98}));
  const alu=()=>TK.M('sl2_alu',()=>TK.std({color:0xbfc3c6,roughness:0.38,metalness:0.35}));
  const frost=()=>TK.M('sl2_frost',()=>TK.std({color:0xe8eef0,roughness:0.5,transparent:true,opacity:0.7}));

  // ---- 牆：一段一段（配置的 walls，中心線）；有窗的牆照窗切開；外牆一段一個 mesh（淡出），其他的合併 ----
  function wallPieces(w,wins,L){ const Y1=L.floors[1].y, along=Math.abs(w.x1-w.x0)>=Math.abs(w.z1-w.z0), a0=along?Math.min(w.x0,w.x1):Math.min(w.z0,w.z1), a1=along?Math.max(w.x0,w.x1):Math.max(w.z0,w.z1);
    const fy=w.lv===1?Y1:0, holes=wins.map(o=>({a0:Math.max(a0,o.a0),a1:Math.min(a1,o.a1),y0:fy+o.y0,y1:fy+o.y1})).filter(h=>h.a1-h.a0>0.05).sort((p,q)=>p.a0-q.a0);
    const out=[]; let cur=a0; for(const h of holes){ if(h.a0>cur) out.push({a0:cur,a1:h.a0,y0:w.y0,y1:w.y1}); out.push({a0:h.a0,a1:h.a1,y0:w.y0,y1:h.y0}); out.push({a0:h.a0,a1:h.a1,y0:h.y1,y1:w.y1}); cur=h.a1; }
    if(a1>cur) out.push({a0:cur,a1,y0:w.y0,y1:w.y1}); return {along,holes,pieces:out.filter(p=>p.a1-p.a0>0.01&&p.y1-p.y0>0.01)}; }
  function winsOn(L,w){ const along=Math.abs(w.x1-w.x0)>=Math.abs(w.z1-w.z0); if(w.kind!=='outer') return [];
    const side=along?(Math.abs(w.z0-(-L.D/2))<0.05?'N':'S'):(Math.abs(w.x0-L.W/2)<0.05?'E':'W'); return L.windows.filter(o=>o.wall===side&&(o.lv===w.lv)); }

  const inw0=o=>(o.inward||[1,0,0])[0];
  function buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,cols,outs){ const W=L.W, D=L.D, Y1=L.floors[1].y, RY=L.roofY, T=L.wallT, ST=L.slabT, S=L.stair, A=S.A, B=S.B, LD=S.landing, MW=S.midWall, WL=S.well, MAT=B3.MAT, r=S.rise, t=S.tread;
    const b0=new TK.Bin(), b1=new TK.Bin(); const binOf=lv=>lv===1?b1:b0, grpOf=lv=>lv===1?lv1:lv0, fbOf=lv=>lv===1?fb1:fb0;
    const plaster=MAT.plaster(), dado=M('#c9cbc4',{rough:0.7}), inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide});
    const col=(x,y,z,w,h,d)=>{ const c=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),inv); c.position.set(x,y,z); c.userData.dyn=true; cols.push(c); };
    // 地板（點地面移動用：walkLv）
    const floor=(x0,z0,x1,z1,y,lv,mat,grp)=>{ const f=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),mat); f.rotation.x=-Math.PI/2; f.position.set((x0+x1)/2,y+0.004,(z0+z1)/2); f.receiveShadow=true; f.userData.walkLv=lv; grp.add(f); walkMeshes.push(f); return f; };
    const hz=T/2, X0=-W/2+hz, X1=W/2-hz, Z0=-D/2+hz, Z1=D/2-hz;
    floor(X0,Z0,X1,2.7,0,0,floorM('sl2f0','#d9d5cc',X1-X0,2.7-Z0),fb0);
    // 二樓樓板：扣掉樓梯間、電梯井（slabPieces）；上面是地板（走廊磨石子、自習室與討論室地毯），下面是一樓的天花板
    const EL=L.elevator, holes=[{x0:WL.x0,x1:WL.x1,z0:WL.z0,z1:WL.z1},{x0:EL.x0-0.1,x1:EL.x1+0.1,z0:EL.z0-0.1,z1:EL.z1+0.1}], slabs=B3.slabPieces({x0:X0,x1:X1,z0:Z0,z1:Z1},holes,{lv:1,y:Y1,t:ST});
    const ceilM=MAT.ceil(), corM=floorM('sl2f1','#dcd8cf',X1-X0,Z1-Z0);
    for(const p of slabs){ const w=p.x1-p.x0, d=p.z1-p.z0; b0.add(plaster,TK.boxG(w,ST-0.02,d,1.2),(p.x0+p.x1)/2,Y1-ST/2-0.01,(p.z0+p.z1)/2,0,{noShadow:false});
      const c=new THREE.Mesh(new THREE.PlaneGeometry(w,d),ceilM); c.rotation.x=Math.PI/2; c.position.set((p.x0+p.x1)/2,Y1-ST-0.005,(p.z0+p.z1)/2); fb0.add(c);
      floor(p.x0,p.z0,p.x1,p.z1,Y1,1,corM,fb1); }
    { const SR=L.study; const cm=carpetM(); const carpet=(x0,z0,x1,z1)=>{ const f=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),cm); f.rotation.x=-Math.PI/2; f.position.set((x0+x1)/2,Y1+0.008,(z0+z1)/2); f.receiveShadow=true; fb1.add(f); };
      carpet(SR.x0+hz,SR.z0+0.05,X1,Z1); for(const d of L.disc) carpet(d.x0+hz,Z0,d.x1-hz,L.discZ[1]-0.05); }
    // 天花板：二樓（7.8）、樓梯間頂（7.8）
    { const c2=new THREE.Mesh(new THREE.PlaneGeometry(X1-X0,Z1-Z0),ceilM); c2.rotation.x=Math.PI/2; c2.position.set(0,RY-0.005,0); fb1.add(c2); }
    // 牆
    for(const w of L.walls){ const wins=winsOn(L,w), P=wallPieces(w,wins,L), grp=w.lv===1?fb1:fb0, bb=binOf(w.lv===1?1:0);
      const cx=(w.x0+w.x1)/2, cz=(w.z0+w.z1)/2, at=(a)=>P.along?[a,cz]:[cx,a];
      if(w.kind==='rail'){ const len=Math.abs(w.x1-w.x0)+Math.abs(w.z1-w.z0); b1.add(MAT.steel(),P.along?TK.boxG(len,0.05,0.05):TK.boxG(0.05,0.05,len),cx,w.y1,cz); const gp=new THREE.Mesh(new THREE.PlaneGeometry(len,0.92),MAT.glass()); gp.position.set(cx,w.y0+0.5,cz); gp.rotation.y=P.along?0:Math.PI/2; lv1.add(gp); continue; }
      if(w.kind==='glass'){ const len=Math.abs(w.x1-w.x0)+Math.abs(w.z1-w.z0), h=w.y1-w.y0, yb=w.y0; const gp=new THREE.Mesh(new THREE.PlaneGeometry(len,h-0.05),MAT.glass()); gp.position.set(cx,yb+h/2,cz); gp.rotation.y=P.along?0:Math.PI/2; grpOf(w.lv).add(gp);
        const a0=P.along?Math.min(w.x0,w.x1):Math.min(w.z0,w.z1), n=Math.max(1,Math.round(len/1.2)); for(let k=0;k<=n;k++){ const [mx,mz]=at(a0+len*k/n); bb.add(alu(),TK.boxG(0.06,h,0.08),mx,yb+h/2,mz,P.along?0:Math.PI/2); }
        bb.add(alu(),P.along?TK.boxG(len,0.08,0.1):TK.boxG(0.1,0.08,len),cx,yb+0.04,cz); bb.add(alu(),P.along?TK.boxG(len,0.08,0.1):TK.boxG(0.1,0.08,len),cx,w.y1-0.04,cz);
        bb.add(frost(),P.along?TK.boxG(len,0.12,0.012):TK.boxG(0.012,0.12,len),cx,yb+1.35,cz,0,{noShadow:true});   /* 腰線一條霧面貼紙（撞玻璃的防撞條）*/
        col(cx,yb+h/2,cz,P.along?len:0.12,h,P.along?0.12:len); continue; }
      for(const p of P.pieces){ const len=p.a1-p.a0, h=p.y1-p.y0, [px,pz]=at((p.a0+p.a1)/2), g=P.along?TK.boxG(len,h,T,1.2):TK.boxG(T,h,len,1.2);
        if(w.kind==='outer'){ const ms=new THREE.Mesh(g,plaster.clone()); ms.material.transparent=true; ms.position.set(px,p.y0+h/2,pz); ms.userData.dir=new THREE.Vector3(w.dir[0],w.dir[1],w.dir[2]); ms.userData.noMerge=true; ms.receiveShadow=true; grp.add(ms); walls.push(ms); }
        else { bb.add(plaster,g,px,p.y0+h/2,pz); col(px,p.y0+h/2,pz,P.along?len:T,h,P.along?T:len); } }
      if(w.kind==='inner'&&w.lv!==2){ const len=Math.abs(w.x1-w.x0)+Math.abs(w.z1-w.z0), fy=w.lv===1?Y1:0; bb.add(dado,P.along?TK.boxG(len,0.1,T+0.02):TK.boxG(T+0.02,0.1,len),cx,fy+0.05,cz,0,{noShadow:true}); }   /* 踢腳板 */
      // 窗：框＋窗外的景（遊戲裡拍的校園畫面；一樓、二樓都先用閱覽室西面的樹，二樓的另外拍是之後的事）
      for(const h of P.holes){ const len=h.a1-h.a0, hh=h.y1-h.y0, [wx,wz]=at((h.a0+h.a1)/2), yc=(h.y0+h.y1)/2, inward=new THREE.Vector3(w.dir[0],0,w.dir[2]);
        bb.add(MAT.frame(),P.along?TK.boxG(len+0.1,0.06,T+0.04):TK.boxG(T+0.04,0.06,len+0.1),wx,h.y0+0.03,wz); bb.add(MAT.frame(),P.along?TK.boxG(len+0.1,0.06,T+0.04):TK.boxG(T+0.04,0.06,len+0.1),wx,h.y1-0.03,wz);
        const nm=Math.max(1,Math.round(len/1.5)); for(let k=0;k<=nm;k++){ const a=h.a0+len*k/nm, [mx,mz]=at(a); bb.add(MAT.frame(),TK.boxG(0.06,hh,0.06),mx,yc,mz); }
        bb.add(M('#e6e3dc',{rough:0.6}),P.along?TK.boxG(len,0.04,0.26):TK.boxG(0.26,0.04,len),wx+inward.x*0.12,h.y0-0.02,wz+inward.z*0.12,0,{noShadow:true});   /* 窗台 */
        const ry=Math.atan2(inward.x,inward.z), ov=B3.outView('south',w.lv===1?'soclib_west':'soclib_north',len,hh,wx-inward.x*(T/2+0.03),yc,wz-inward.z*(T/2+0.03),ry,26,grpOf(w.lv===1?1:0));
        ov.userData.fpos=new THREE.Vector3(wx-inward.x*0.9,yc,wz-inward.z*0.9); ov.userData.fsize=[len+3,hh+2.2]; outs.push(ov); } }
    // 開口：門框（玻璃門＝兩扇玻璃＋鋁框；入口＝深色門框）
    for(const o of L.openings){ const y=o.lv===1?Y1:0, along=o.axis==='x', bb=binOf(o.lv), hw=o.w/2;
      const post=(a)=>along?[o.x+a,o.z]:[o.x,o.z+a]; for(const s of [-1,1]){ const [px,pz]=post(s*hw); bb.add(o.kind==='door'?MAT.frame():alu(),TK.boxG(0.08,o.h,0.12),px,y+o.h/2,pz,along?0:Math.PI/2); }
      bb.add(o.kind==='door'?MAT.frame():alu(),along?TK.boxG(o.w+0.16,0.1,0.14):TK.boxG(0.14,0.1,o.w+0.16),o.x,y+o.h+0.05,o.z);
      const top=(o.lv===1?RY:Y1-ST)-(y+o.h+0.1); if(top>0.05) bb.add(plaster,along?TK.boxG(o.w+0.16,top,T):TK.boxG(T,top,o.w+0.16),o.x,y+o.h+0.1+top/2,o.z);   /* 門上面的牆（門的開口在 walls 裡是空的）*/
      /* 從閱覽室進來的門（kind 'door'）：兩扇關著的木門（開著的話門外是區域外面，什麼都沒有；出入是互動點，DOOR 會播推門）*/
      if(o.kind==='door'){ const dx=o.x+inw0(o)*0.12; for(const s of [-1,1]){ const zc=o.z+s*hw/2; bb.add(M('#c9ad7c',{rough:0.55}),TK.boxG(0.045,o.h-0.02,hw-0.01),dx,y+o.h/2,zc); bb.add(frost(),TK.boxG(0.05,1.05,0.14),dx,y+1.42,zc,0,{noShadow:true}); bb.add(MAT.steel(),TK.boxG(0.01,0.3,0.12),dx+0.03,y+1.1,zc-s*(hw/2-0.07)); } }
      /* 玻璃門：兩扇往房間裡推開 90°（靠著門邊，開著走得過去）；門扇是玻璃＋鋁框 */
      if(o.kind==='glassDoor'){ const inw=o.inward||[0,0,1], lw=hw-0.04; for(const s of [-1,1]){ const [hx,hz]=post(s*(hw-0.02)), px=hx+inw[0]*lw/2, pz=hz+inw[2]*lw/2;
          const leaf=new THREE.Mesh(new THREE.PlaneGeometry(lw,o.h-0.1),MAT.glass()); leaf.position.set(px,y+o.h/2,pz); leaf.rotation.y=along?Math.PI/2:0; grpOf(o.lv).add(leaf);
          for(const e of [-1,1]) bb.add(alu(),along?TK.boxG(0.03,o.h-0.1,0.04):TK.boxG(0.04,o.h-0.1,0.03),px+(along?0:e*lw/2),y+o.h/2,pz+(along?e*lw/2:0));
          bb.add(alu(),along?TK.boxG(0.03,0.05,lw):TK.boxG(lw,0.05,0.03),px,y+0.06,pz); bb.add(MAT.steel(),along?TK.boxG(0.04,0.5,0.03):TK.boxG(0.03,0.5,0.04),px,y+1.05,pz); } } }   /* 門把：門扇中間的直桿 */
    // 樓梯：A 跑每一階實心到地面、平台實心、B 跑懸空（踏階＋斜的樓梯板）、兩跑中間的牆；止滑條
    const stairM=M('#c9c4b8',{rough:0.6}), nose=M('#7d8186',{rough:0.5});
    for(let k=0;k<A.risers;k++){ const top=(k+1)*r, z0=A.z0+k*t, w=A.x1-A.vx0, cx=(A.vx0+A.x1)/2; b0.add(stairM,TK.boxG(w,top,t,1.2),cx,top/2,z0+t/2); b0.add(nose,TK.boxG(w,0.012,0.05),cx,top-0.004,z0+0.025); }
    b0.add(stairM,TK.boxG(B.vx1-A.vx0,LD.y,LD.vz1-LD.z0,1.2),(A.vx0+B.vx1)/2,LD.y/2,(LD.z0+LD.vz1)/2);
    { const w=B.vx1-B.x0, cx=(B.x0+B.vx1)/2, slope=Math.atan2(Y1-LD.y,B.z1-B.z0), slen=Math.hypot(Y1-LD.y,B.z1-B.z0);
      for(let k=0;k<B.risers;k++){ const top=LD.y+(k+1)*r, z1=B.z1-k*t; b0.add(stairM,TK.boxG(w,r+0.02,t,1.2),cx,top-(r+0.02)/2,z1-t/2); b0.add(nose,TK.boxG(w,0.012,0.05),cx,top-0.004,z1-0.025); }
      b0.add(plaster,TK.boxG(w,0.24,slen,1.2),cx,(LD.y+Y1)/2-0.15,(B.z0+B.z1)/2,0,{rx:slope});
      const mh=MW.h; b0.add(plaster,TK.boxG(MW.x1-MW.x0,mh,B.z1-B.z0,1.2),(MW.x0+MW.x1)/2,mh/2,(B.z0+B.z1)/2); col((MW.x0+MW.x1)/2,mh/2,(B.z0+B.z1)/2,MW.x1-MW.x0,mh,B.z1-B.z0); }
    // 扶手（牆上的）：A 跑西牆、B 跑東牆、中間的牆兩側
    { const steel=MAT.steel(); const hand=(za,ya,zb,yb,x)=>{ const len=Math.hypot(zb-za,yb-ya); const hr=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,len,8),steel); hr.position.set(x,(ya+yb)/2+0.9,(za+zb)/2); hr.lookAt(x,yb+0.9,zb); hr.rotateX(Math.PI/2); lv0.add(hr); };
      hand(A.z0,0,A.z1,LD.y,A.vx0+0.06); hand(A.z0,0,A.z1,LD.y,MW.x0-0.03); hand(B.z1,LD.y,B.z0,Y1,MW.x1+0.03); hand(B.z1,LD.y,B.z0,Y1,B.vx1-0.06); }
    // 日光燈盤
    { const panel=MAT.lightPanel(); for(const l of L.lights){ const y=l.lv===1?RY:Y1-ST; binOf(l.lv).add(panel,TK.boxG(l.w,0.03,l.d),l.x,y-0.02,l.z,0,{noShadow:true}); } }
    b0.build(fb0); b1.build(fb1);
    return slabs; }

  // ---- 門（關著：洗手間、研究小間、書庫、館員辦公室）＋看得懂的說明 ----
  function buildDoors(E,L,fb0,fb1,lv0,lv1){ const MAT=B3.MAT, IT=E.interactables, Y1=L.floors[1].y, off=L.wallT/2+0.02;
    for(const d of L.doors){ const y=d.lv===1?Y1:0, ry={'+z':0,'-z':Math.PI,'+x':Math.PI/2,'-x':-Math.PI/2}[d.face]||0, fx=Math.sin(ry), fz=Math.cos(ry);
      const dg=new THREE.Group(); dg.position.set(d.x+fx*off,y,d.z+fz*off); dg.rotation.y=ry; const db=new TK.Bin();
      db.add(MAT.frame(),TK.boxG(1.0,2.2,0.06),0,1.1,0); db.add(d.wc?M('#8d9aa2',{rough:0.5}):M('#b9a88e',{rough:0.55}),TK.boxG(0.86,2.1,0.04),0,1.05,0.03); db.add(MAT.steel(),TK.boxG(0.12,0.03,0.05),0.3,1.0,0.07); db.build(dg); (d.lv===1?fb1:fb0).add(dg);
      const sg=new THREE.Mesh(new THREE.PlaneGeometry(d.wc?0.26:0.5,d.wc?0.26:0.16),new THREE.MeshBasicMaterial({map:TK.signTex(d.wc?(d.id==='wc_m'?'男':'女'):d.label,{bg:d.wc?(d.id==='wc_m'?'#2f5d8a':'#a33b4a'):'#f4f2ec',color:d.wc?'#ffffff':'#2b2b2b'})})); sg.position.set(0,d.wc?1.6:1.85,0.07); dg.add(sg); (d.lv===1?lv1:lv0).attach(sg);
      IT.push({x:d.x+fx*0.8,z:d.z+fz*0.8,radius:0.95,lv:d.lv,label:d.label,look:d.look}); } }

  // ---- 家具（程序化）＋座位、互動點 ----
  const LOOK={
    floor1:'樓層簡介：1F 閱覽室（往西）、影印區、館員辦公室；2F 自習室、討論室（要預約）、研究小間（研究生）、洗手間。電梯在影印區旁邊，樓梯在門廳南邊。',
    floor2:'二樓的公告欄：「討論室請上網預約，一次兩小時」「自習室請勿占位，離開超過 30 分鐘的物品館員會收到服務台」「期末考週延長開放」，旁邊還貼了幾張讀書會徵人和二手書的紙條。',
    lockers:'置物櫃：投十元硬幣就能鎖，退鑰匙會把硬幣還你。好幾格的鑰匙都不在上面——期末快到了。',
    water:'飲水機：熱水、溫水、冰水。旁邊貼著「請自備杯子」。',
    copier:'影印機：要先在旁邊的儲值機買卡。黑白一張一元，雙面也算兩張。',
    kiosk:'影印卡儲值機：投硬幣或鈔票加值。螢幕上寫著「找零請洽閱覽室服務台」。',
    booking:'預約的小螢幕：今天的時段一格一格排滿了，只有傍晚六點那一格還是綠色的。',
    whiteboard:'白板上還留著上一組沒擦乾淨的字：一張畫到一半的表格，和「下週三前交初稿！！」',
    rules:'自習室使用規則：請保持安靜、手機請轉靜音、不可占位、請勿飲食（有蓋的水可以）。',
    clock:'牆上的鐘。走得比手機慢了一分鐘。',
    reserve:'預約書架：一格一格放著別人預約的書，每本都夾著一張寫了名字和取書期限的紙條。',
    newbooks:'新書推薦：館員挑的這個月新書，經濟、社會、政治、社工都有，旁邊放了一疊推薦卡。',
    bookcart:'還書車：剛還回來、還沒上架的書，兩層都排得滿滿的。最上面一本夾著一張紙條：「請勿自行上架」。',
    poster:'海報：「期末考週，自習室請勿占位：離開超過 30 分鐘，東西會被館員收到服務台」。下面一張小的是「論文寫作工作坊，報名請洽一樓服務台」。',
    kiosk2:'自助服務機：查館藏、印預約單、查自己借了哪些書。螢幕上是「請先感應學生證」。' };
  function buildFurniture(E,L,lv0,lv1,fb0,fb1,nav0,nav1,zone){ const Y1=L.floors[1].y, MAT=B3.MAT, IT=E.interactables; const b0=new TK.Bin(), b1=new TK.Bin();
    const tableM=M('#d9cdb4',{rough:0.55}), legM=M('#7b8086',{rough:0.45}), divM=frost(), outletM=M('#3a3e44',{rough:0.5});
    for(const f of L.furniture){ const b=f.lv===1?b1:b0, y=f.lv===1?Y1:0, nav=f.lv===1?nav1:nav0, ry=f.ry||0, fx=Math.sin(ry), fz=Math.cos(ry), fb=f.lv===1?fb1:fb0;
      if(f.type==='studyTable'){ b.add(tableM,TK.boxG(f.w,0.04,f.d,1.2),f.x,y+0.74,f.z); for(const [lx,lz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) b.add(legM,TK.boxG(0.05,0.72,0.05),f.x+lx*(f.w/2-0.08),y+0.36,f.z+lz*(f.d/2-0.12));
        if(f.divider){ b.add(divM,TK.boxG(0.02,0.34,f.d-0.06),f.x,y+0.93,f.z,0,{noShadow:true}); for(const dz of [-0.5,0.5]) b.add(divM,TK.boxG(f.w-0.04,0.26,0.015),f.x,y+0.89,f.z+dz,0,{noShadow:true}); }   /* 中間一道矮隔板（面對面的人看不到對方的桌面）＋位子和位子之間的小隔板 */
        for(let k=0;k<(f.outlets||3);k++) b.add(outletM,TK.boxG(0.05,0.06,0.12),f.x,y+0.79,f.z-f.d/2+f.d*(k+0.5)/(f.outlets||3));   /* 插座盒（隔板底下，兩邊各用一個）*/
        nav.blockRect(f.x,f.z,f.w,f.d,0,0.05); }
      else if(f.type==='windowCounter'){ const len=f.z1-f.z0, cz=(f.z0+f.z1)/2, dx=f.x1-f.x0, cx=(f.x0+f.x1)/2; b.add(tableM,TK.boxG(dx,0.045,len,1.2),cx,y+0.75,cz); b.add(M('#c6bba4',{rough:0.6}),TK.boxG(0.04,0.7,len),f.x0+0.06,y+0.38,cz);
        for(let k=0;k<(f.outlets||7);k++) b.add(outletM,TK.boxG(0.12,0.06,0.05),f.x1-0.12,y+0.8,f.z0+len*(k+0.5)/(f.outlets||7));
        nav.blockRect(cx,cz,dx,len,0,0); }
      else if(f.type==='discTable'){ b.add(M('#e4ddd0',{rough:0.5}),TK.boxG(f.w,0.04,f.d,1.2),f.x,y+0.74,f.z); for(const sx of [-1,1]) b.add(legM,TK.boxG(0.06,0.72,f.d-0.2),f.x+sx*(f.w/2-0.15),y+0.36,f.z); nav.blockRect(f.x,f.z,f.w,f.d,0,0.05); }
      else if(f.type==='whiteboard'){ b.add(M('#f6f7f5',{rough:0.25}),TK.boxG(f.w,1.0,0.03),f.x,y+1.45,f.z); b.add(alu(),TK.boxG(f.w+0.06,0.04,0.08),f.x,y+0.93,f.z+0.03); IT.push({x:f.x,z:f.z+0.65,radius:0.9,lv:f.lv,label:'看白板',look:LOOK.whiteboard}); }   /* 白板和桌子北端之間（三格走道的中間那一格）*/
      else if(f.type==='bookingScreen'){ b.add(M('#2a2e33',{rough:0.4}),TK.boxG(0.188,0.123,0.024),f.x,y+1.46,f.z); const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.17,0.105),new THREE.MeshBasicMaterial({map:TK.signTex(f.name,{bg:'#e9f4ee',color:'#1f4d38'})})); sc.position.set(f.x,y+1.46,f.z+0.022); (f.lv===1?lv1:lv0).add(sc);   /* BB_260 §5 第 3 點：螢幕縮小、框改細（正式模型：框 0.188×0.123、螢幕 0.18×0.115）*/   /* 字放在樓層群組（正式模型載入後照樣在）、在正式模型的螢幕面（f.z+0.015）前面 7 mm */
        IT.push({x:f.x,z:f.z+0.75,radius:0.75,lv:f.lv,label:'看預約螢幕（'+f.name+'）',look:LOOK.booking}); }
      else if(f.type==='lockers'){ const len=f.z1-f.z0, cz=(f.z0+f.z1)/2, x=f.x+f.d/2; b.add(M('#c3c9cd',{rough:0.42,metal:0.2}),TK.boxG(f.d,1.8,len),x,y+0.9,cz); const cw=len/f.n;
        for(let i=0;i<f.n;i++) for(let j=0;j<4;j++){ const zc=f.z0+cw*(i+0.5), yc=y+0.25+j*0.44; b.add(M('#aeb5ba',{rough:0.42,metal:0.2}),TK.boxG(0.012,0.4,cw-0.03),f.x+f.d+0.006,yc,zc,0,{noShadow:true}); b.add(M('#6a7076',{rough:0.4}),TK.boxG(0.02,0.05,0.03),f.x+f.d+0.014,yc+0.08,zc+cw/2-0.07,0,{noShadow:true}); }
        nav.blockRect(x,cz,f.d,len,0,0); IT.push({x:f.x+f.d+0.75,z:cz,radius:1.3,lv:f.lv,label:'看置物櫃',look:LOOK.lockers}); }
      else if(f.type==='notice'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; const sb=new TK.Bin(); sb.add(M('#7a6a58',{rough:0.6}),TK.boxG(f.w+0.08,1.28,0.04),0,1.55,0); sb.add(M('#c4a77d',{rough:0.9}),TK.boxG(f.w,1.2,0.02),0,1.55,0.02);
        const cs=['#f6dfa8','#ffffff','#cfe3ea','#f4b8a8','#d7e3ce','#ffffff']; for(let i=0;i<6;i++) sb.add(M(cs[i],{rough:0.9}),TK.boxG(0.3,0.4,0.004),-f.w/2+0.3+(i%3)*(f.w-0.6)/2,1.8-(i>2?0.55:0),0.034,0,{noShadow:true}); sb.build(g); fb.add(g);
        IT.push({x:f.x+fx*0.85,z:f.z+fz*0.85,radius:1.1,lv:f.lv,label:f.what==='floor1'?'看樓層簡介':'看公告欄',look:LOOK[f.what]||LOOK.floor2}); }
      else if(f.type==='water'){ b.add(M('#e4e6e8',{rough:0.4}),TK.boxG(0.4,1.2,0.4),f.x,y+0.6,f.z); b.add(M('#3a6ea5',{rough:0.3}),TK.boxG(0.3,0.06,0.02),f.x,y+1.0,f.z+0.21); nav.blockRect(f.x,f.z,0.42,0.42,0,0.05); IT.push({x:f.x,z:f.z+0.8,radius:0.85,lv:f.lv,label:'看飲水機',look:LOOK.water}); }
      else if(f.type==='bench'){ const sg=new THREE.Group(); sg.position.set(f.x,y,f.z); sg.rotation.y=ry; const sb=new TK.Bin(); sb.add(MAT.wood(),TK.boxG(f.w,0.05,f.d),0,0.45,0); for(const sx of [-1,1]) sb.add(MAT.steel(),TK.boxG(0.05,0.43,f.d*0.9),sx*(f.w/2-0.12),0.215,0); sb.build(sg); fb.add(sg); nav.blockRect(f.x,f.z,f.w,f.d,-ry,0.05);
        if(f.seat) IT.push({x:f.x+fx*0.65,z:f.z+fz*0.65,radius:0.9,lv:f.lv,label:'坐在長椅上',seat:{x:f.x,z:f.z,yaw:ry,lv:f.lv}}); }
      else if(f.type==='bins'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; const sb=new TK.Bin(), bw=(f.w-0.08)/3; ['#3a3f46','#2f8a4e','#2e6fb0'].forEach((c,k)=>sb.add(M(c,{rough:0.6}),TK.boxG(bw,0.82,0.42),-f.w/2+bw/2+k*(bw+0.04),0.41,0)); sb.build(g); fb.add(g); nav.blockRect(f.x,f.z,f.w,0.45,-ry,0.05); }
      else if(f.type==='planter'){ b.add(M('#8c7f6e',{rough:0.8}),new THREE.CylinderGeometry(f.r,f.r*0.85,0.5,14),f.x,y+0.25,f.z); b.add(MAT.plant(),new THREE.IcosahedronGeometry(f.r*1.3,1),f.x,y+0.95,f.z); nav.blockCircle(f.x,f.z,f.r+0.1); }
      else if(f.type==='extinguisher'){ b.add(M('#b8262b',{rough:0.4}),new THREE.CylinderGeometry(0.08,0.08,0.5,12),f.x,y+0.4,f.z); }
      else if(f.type==='clock'){ const c=new THREE.Mesh(new THREE.CircleGeometry(0.17,24),new THREE.MeshBasicMaterial({map:TK.signTex('12',{bg:'#f7f5ef',color:'#444',size:40})})); c.position.set(f.x,y+2.55,f.z); c.rotation.y=ry; fb.add(c); IT.push({x:f.x+fx*1.2,z:f.z+fz*1.2,radius:0.8,lv:f.lv,label:'看時鐘',look:LOOK.clock}); }
      else if(f.type==='rules'){ const p=new THREE.Mesh(new THREE.PlaneGeometry(f.w,0.8),new THREE.MeshBasicMaterial({map:TK.signTex('自習室使用規則',{bg:'#fbfaf6',color:'#2f3338',size:44})})); p.position.set(f.x+fx*0.028,y+1.6,f.z+fz*0.028); p.rotation.y=ry; (f.lv===1?lv1:lv0).add(p);   /* 字放在樓層群組、正式模型的紙面（牆前 2.4 cm）前面 */ IT.push({x:f.x+fx*0.8,z:f.z+fz*0.8,radius:0.9,lv:f.lv,label:'看使用規則',look:LOOK.rules}); }
      else if(f.type==='copier'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; const sb=new TK.Bin(); sb.add(M('#e8e8e3',{rough:0.5}),TK.boxG(f.w,0.9,f.d),0,0.45,0); sb.add(M('#c9ccce',{rough:0.45}),TK.boxG(f.w*0.9,0.16,f.d*0.86),0,0.98,-0.02); sb.add(M('#2c2f34',{rough:0.4}),TK.boxG(0.3,0.05,0.16),0.18,0.93,f.d/2-0.06,0,{rx:-0.4}); sb.add(M('#fbfaf4',{rough:0.8}),TK.boxG(0.32,0.03,0.24),-0.05,0.62,f.d/2+0.1); sb.build(g); fb.add(g);
        nav.blockRect(f.x,f.z,f.w,f.d,-ry,0.05); IT.push({x:f.x+fx*0.85,z:f.z+fz*0.85,radius:0.8,lv:f.lv,label:'影印',look:LOOK.copier}); }
      else if(f.type==='cardKiosk'){ b.add(M('#3c5a78',{rough:0.45}),TK.boxG(f.w,1.25,f.d),f.x,y+0.625,f.z); b.add(M('#cfe2ee',{rough:0.2}),TK.boxG(0.3,0.22,0.02),f.x,y+1.05,f.z-f.d/2-0.01); nav.blockRect(f.x,f.z,f.w,f.d,0,0.05); IT.push({x:f.x+fx*0.8,z:f.z+fz*0.8,radius:0.7,lv:f.lv,label:'影印卡儲值機',look:LOOK.kiosk}); }
      else if(f.type==='sofa'){ const sg=new THREE.Group(); sg.position.set(f.x,y,f.z); sg.rotation.y=ry; fb.add(sg); const sb=new TK.Bin(); const fab=M('#7f8a8c',{rough:0.88}), fab2=M('#6f797b',{rough:0.88});
        sb.add(fab2,new THREE.BoxGeometry(f.w,0.22,0.86),0,0.19,0); for(const sx of [-1,1]) sb.add(fab,new THREE.BoxGeometry(f.w/2-0.04,0.14,0.66),sx*(f.w/4),0.37,0.08); sb.add(fab2,new THREE.BoxGeometry(f.w-0.2,0.52,0.2),0,0.56,-0.33); for(const sx of [-1,1]) sb.add(fab2,new THREE.BoxGeometry(0.16,0.34,0.86),sx*(f.w/2-0.08),0.43,0); sb.build(sg);
        nav.blockRect(f.x,f.z,f.w,0.9,-ry,0.05); if(f.seat) IT.push({x:f.x+fx*0.75,z:f.z+fz*0.75,radius:1.1,lv:f.lv,label:'坐在沙發上',seat:{x:f.x,z:f.z,yaw:ry,lv:f.lv}}); }
      else if(f.type==='lowShelf'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); fb.add(g); const sb=new TK.Bin(); sb.add(MAT.wood(),TK.boxG(f.w,f.h,f.d),0,f.h/2,0); sb.add(M('#6b4a3a',{rough:0.8}),TK.boxG(f.w-0.1,0.26,0.02),0,f.h*0.28,f.d/2+0.011); sb.add(M('#3f5a6e',{rough:0.8}),TK.boxG(f.w-0.1,0.26,0.02),0,f.h*0.72,f.d/2+0.011); sb.build(g);
        nav.blockRect(f.x,f.z,f.w,f.d,0,0.05); IT.push({x:f.x,z:f.z+0.85,radius:1.2,lv:f.lv,label:f.what==='reserve'?'看預約書架':'看新書推薦',look:LOOK[f.what]}); }   /* 北面窗下的矮書架（預約書架、新書推薦）*/
      else if(f.type==='slatWall'){ const len=f.z1-f.z0, pl=new THREE.Mesh(new THREE.PlaneGeometry(len,f.h),MAT.wood()); pl.position.set(f.x+0.02,y+0.1+f.h/2,(f.z0+f.z1)/2); pl.rotation.y=Math.PI/2; fb.add(pl); }   /* 竹木條牆（備用模型：一片竹色的面）*/
      else if(f.type==='hose'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; fb.add(g); const sb=new TK.Bin(); sb.add(M('#b3262b',{rough:0.4}),TK.boxG(0.74,1.3,0.12),0,0.9,0.06); sb.add(M('#e03a30',{rough:0.3}),TK.boxG(0.1,0.1,0.07),0,1.67,0.035); sb.build(g); }   /* 消防栓箱 */
      else if(f.type==='exitSign'){ const g=new THREE.Group(); g.position.set(f.x,y+f.y,f.z); g.rotation.y=ry; fb.add(g); const sb=new TK.Bin(); sb.add(M('#e6e8e6'),TK.boxG(0.44,0.16,0.06),0,0,0); sb.add(new THREE.MeshBasicMaterial({color:0x5fe08a}),TK.boxG(0.38,0.12,0.07),0,0,0); sb.build(g); }   /* 避難方向指示燈（綠色）*/
      else if(f.type==='bookcart'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; fb.add(g); const sb=new TK.Bin(); sb.add(MAT.steel(),TK.boxG(f.w,0.04,f.d),0,0.25,0); sb.add(MAT.steel(),TK.boxG(f.w,0.04,f.d),0,0.62,0); sb.add(M('#5a1f24'),TK.boxG(f.w-0.1,0.24,f.d-0.1),0,0.39,0); sb.add(M('#1f3350'),TK.boxG(f.w-0.1,0.24,f.d-0.1),0,0.76,0); sb.build(g);
        nav.blockRect(f.x,f.z,f.w,f.d,-ry,0.05); IT.push({x:f.x+fx*0.75,z:f.z+fz*0.75,radius:0.9,lv:f.lv,label:'看還書車',look:LOOK.bookcart}); }   /* 還書車（BB_260 §5 第 1 點）*/
      else if(f.type==='umbrella'){ b.add(M('#6b7075',{rough:0.4}),new THREE.CylinderGeometry(f.r,f.r*0.9,0.55,14),f.x,y+0.275,f.z); nav.blockCircle(f.x,f.z,f.r+0.1); }   /* 傘架 */
      else if(f.type==='posterStand'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; fb.add(g); const sb=new TK.Bin(); sb.add(M('#3a3d41'),TK.boxG(f.w,1.25,0.04),0,0.95,0,0,{rx:-0.12}); sb.add(M('#3a3d41'),TK.boxG(f.w,1.25,0.04),0,0.95,-0.3,0,{rx:0.12}); sb.build(g);
        const pp=new THREE.Mesh(new THREE.PlaneGeometry(f.w-0.08,0.9),new THREE.MeshBasicMaterial({map:TK.signTex('期末考週 請勿占位',{bg:'#f6f1e4',color:'#7a2e2a',size:40})})); pp.position.set(0,1.0,0.075); pp.rotation.x=-0.12; g.add(pp); (f.lv===1?lv1:lv0).attach(pp);
        nav.blockRect(f.x,f.z,f.w,f.d,-ry,0.05); IT.push({x:f.x+fx*0.85,z:f.z+fz*0.85,radius:0.9,lv:f.lv,label:'看海報',look:LOOK.poster}); }   /* 海報立牌（A 字型）；海報的字放在樓層群組 */
      else if(f.type==='kiosk'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; fb.add(g); const sb=new TK.Bin(); sb.add(M('#d9d6d0'),TK.boxG(f.w,1.0,f.d),0,0.5,0); sb.add(M('#1a1c1f'),TK.boxG(f.w-0.06,0.42,0.05),0,1.22,0.0,0,{rx:-0.3}); sb.build(g);
        nav.blockRect(f.x,f.z,f.w,f.d,-ry,0.05); IT.push({x:f.x+fx*0.8,z:f.z+fz*0.8,radius:0.8,lv:f.lv,label:'自助服務機',look:LOOK.kiosk2}); }   /* 自助服務機 */
      else if(f.type==='coffeeTable'){ b.add(MAT.wood(),TK.boxG(f.w,0.42,f.d),f.x,y+0.21,f.z); nav.blockRect(f.x,f.z,f.w,f.d,0,0.05); } }
    b0.build(fb0); b1.build(fb1);
    /* 沙發的走近點（ECON-NAV-TRAPS-1111，LAWWW2）：沙發前面是矮桌，中間只有 0.4 m（人要 0.64 m）站不進去；GAME.seatApproach 的前、左、右都落在沙發或矮桌上，
       退回沙發後面（離「坐在沙發上」按鈕 1.5 m：點沙發走到背後、按鈕不出來）。走近點（seat.ap）改成按鈕旁邊、站得住的地方（沙發側邊）。
       兩側哪一邊：挑「最寬」的（周圍 0.5 m 內站得住的點最多；一樣寬挑離按鈕近的）——西側貼牆那一條只有 0.2 m 寬、走到入口就卡住（Node：stuck@(−3.48,−3.03)），東側對著自習區是開的 */
    for(const it of IT){ if(it.label!=='坐在沙發上'||!it.seat||it.seat.ap) continue; const nav=(it.lv|0)===1?nav1:nav0; nav._cm=null; let best=null, bw=-1, bR=1e9;
      for(let R=0.3;R<=(it.radius||1.1)-0.15+1e-6;R+=0.05) for(let a=0;a<48;a++){ const x=it.x+Math.cos(a*Math.PI/24)*R, z=it.z+Math.sin(a*Math.PI/24)*R; if(!nav.clear(x,z,0.32)) continue;
        let w=0; for(let i=-5;i<=5;i++) for(let j=-5;j<=5;j++){ if(i*i+j*j>25) continue; if(nav.clear(x+i*0.1,z+j*0.1,0.32)) w++; }   /* 寬不寬＝周圍 0.5 m 內站得住的點數（四點檢查跨得過窄縫，單看 clear 的半徑會高估）*/
        if(w>bw||(w===bw&&R<bR-1e-6)){ bw=w; bR=R; best=[+x.toFixed(2),+z.toFixed(2)]; } }
      if(best) it.seat.ap=best; }
    // 座位（每一個都標樓層；椅子是備用模型的一部分，正式模型有自己的椅子）
    const seats=zone.seats=[]; for(const s of L.seats){ const seat={x:s.x,z:s.z,yaw:s.yaw,lv:s.lv,kind:s.kind,table:s.table}; if(s.old) seat.old=true; seats.push(seat);
      const ch=Z3.chair(s.lv===1?fb1:fb0,s.x,s.z,s.yaw,s.kind==='discuss'?'#5f6b75':'#c9b48e'); if(ch&&s.lv===1) ch.position.y=Y1;
      IT.push({x:s.x,z:s.z,radius:0.8,lv:s.lv,label:s.kind==='window'?'坐下讀書（靠窗）':(s.kind==='discuss'?'坐下（討論室）':'坐下讀書'),seat,study:s.kind!=='discuss'}); }
    // 指標（中文字一直顯示：正式模型沒有字）
    for(const s of L.signs){ const y=(s.lv===1?Y1:0)+s.y, mat=new THREE.MeshBasicMaterial({map:TK.signTex(s.text,{bg:'#2f4f5e',color:'#f3efe4'})});
      for(const back of (s.hang?[0,1]:[0])){ const sp=new THREE.Mesh(new THREE.PlaneGeometry(s.w,s.w*0.22),mat), ry=(s.ry||0)+(back?Math.PI:0), off=s.hang?0.026:0; sp.position.set(s.x+Math.sin(ry)*off,y,s.z+Math.cos(ry)*off); sp.rotation.y=ry; sp.name='sign_'+s.text; (s.lv===1?lv1:lv0).add(sp);
        if(s.hang&&!back){ const fr=new THREE.Mesh(TK.boxG(s.w+0.06,s.w*0.22+0.06,0.04),M('#2b2d30')); fr.position.set(s.x,y,s.z); fr.rotation.y=s.ry||0; (s.lv===1?fb1:fb0).add(fr); } } } }   /* 吊牌（hang）：兩面都有字，中間一個深色框（框在備用模型裡；正式模型有自己的框和吊桿）*/

  // ---- 窗外的景：白天／晚上（B3.setOutView）；正式模型的玻璃是透明的：景搬到玻璃外面、放大 ----
  // ---- 區域 ----
  const soclib_2f={ id:'soclib_2f', name:'社科院圖書館 2F', indoor:true, camDist:3.8, cool:true, build(E){ const L=LAYOUT(), W=L.W, D=L.D, Y1=L.floors[1].y;
    const g=new THREE.Group(); const lv0=new THREE.Group(), lv1=new THREE.Group(); lv0.name='L0'; lv1.name='L1'; lv0.userData.dyn=true; lv1.userData.dyn=true; g.add(lv0); g.add(lv1);
    const {nav0,nav1,ss}=buildNav(L);
    const walls=[], walkMeshes=[], cols=[], outs=[]; const fb0=new THREE.Group(), fb1=new THREE.Group(); fb0.name='fallback0'; fb1.name='fallback1'; fb0.userData.dyn=true; fb1.userData.dyn=true; lv0.add(fb0); lv1.add(fb1);
    const lights=[];
    const zone={group:g,nav:nav0,levels:[nav0,nav1],levelGroups:[{group:lv0,y:0},{group:lv1,y:Y1}],walkMeshes,walls,spawn:ENTRY(),bounds:{w:W,d:D},camMaxY:3.2,cool:true,
      fadeWalls(cam,pp){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.userData.center||w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity=facing?1:0.12; w.material.depthWrite=facing; } },
      applyTime(h,weather){ const night=(h%24<6||h%24>=19.2); for(const o of outs) B3.setOutView(o,h,weather,night); },
      onLamps(on){ for(const l of lights) l.intensity=on?l.userData.on:l.userData.off; } };
    zone.slabs=buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,cols,outs);
    buildDoors(E,L,fb0,fb1,lv0,lv1); buildFurniture(E,L,lv0,lv1,fb0,fb1,nav0,nav1,zone);
    for(const c of cols){ g.add(c); E.colliders.push(c); }   // 室內的牆、玻璃隔間：鏡頭碰撞（放在樓層群組外面）
    // 樓梯可以點的面（點地面移動；正式模型載入後也用這幾片）：點在一跑樓梯上＝走完這一跑（engine3d.js 的 stairEnds）
    { const S=L.stair, LD=S.landing, ldz=(LD.z0+LD.z1)/2;
      for(const s of ss.all){ const w=s.x1-s.x0, d=s.z1-s.z0; const ya=s.y!==undefined?s.y:s.ya, yb=s.y!==undefined?s.y:s.yb; const m=new THREE.Mesh(new THREE.PlaneGeometry(w,Math.hypot(d,yb-ya)),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));
        m.position.set((s.x0+s.x1)/2,(ya+yb)/2+0.01,(s.z0+s.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(yb-ya,d); m.userData.walkLv=(s===ss.b||s===ss.btop)?1:0; m.userData.dyn=true; lv0.add(m); walkMeshes.push(m);
        if(s===ss.a) m.userData.stairEnds=[{x:(S.A.x0+S.A.x1)/2,z:S.A.z0-0.6,lv:0},{x:(S.A.x0+S.A.x1)/2,z:ldz,lv:0}];
        if(s===ss.b) m.userData.stairEnds=[{x:(S.B.x0+S.B.x1)/2,z:ldz,lv:0},{x:(S.B.x0+S.B.x1)/2,z:S.B.z0-0.6,lv:1}]; } }
    // 電梯
    zone.elev=B3.buildElevator(L,g,nav0,nav1,zone); zone.update=function(dt){ zone.elev.update(dt); };
    // 燈（一樓門廳、影印區、樓梯間；二樓走廊、電梯廳、自習室、討論室）
    for(const [x,y,z,on,off] of [[-4,3.4,-8,5,3],[4,3.4,-8,5,3],[1,3.4,-1,5,3],[-6,5.6,-2,3,2],[-4,7.2,-6.4,5,3],[4,7.2,-6.4,5,3],[2,7.2,-3,5,3],[-2.8,7.2,4,4,2.5],[1.6,7.2,2,6,4],[5,7.2,2,6,4],[1.6,7.2,8,6,4],[5,7.2,8,6,4],[2,7.2,-9.6,4,2.5]]){ const l=new THREE.PointLight(0xf5f3ee,off,13,2); l.position.set(x,y,z); l.userData.on=on; l.userData.off=off; g.add(l); lights.push(l); }
    // 互動點：回閱覽室、電梯
    const IT=E.interactables, EN=L.entrance;
    IT.push({x:EN.exitAt.x,z:EN.exitAt.z,radius:EN.exitAt.r,lv:0,label:'回閱覽室',door:true,exit:{to:'soclib',spawn:HALL()}});
    for(const f of L.floors) IT.push({x:zone.elev.cx,z:L.elevator.callZ,radius:1.0,lv:f.lv,label:'搭電梯',elevator:true});
    // 正式模型（GLB）：載入成功就藏起程序化備用模型（導航、互動點、鏡頭碰撞不變）；窗外的景搬到玻璃外面
    zone.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.soclib2f_interior']){ ASSETS.loadOne('bldg.soclib2f_interior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; B3.attachFormal(zone,c.scene.clone(true),fb0,fb1,lv0,lv1,walls,walkMeshes);
      for(const o of outs){ if(o.userData.fpos){ o.position.copy(o.userData.fpos); const [fw,fh]=o.userData.fsize; o.scale.set(fw/o.geometry.parameters.width,fh/o.geometry.parameters.height,1); } } }).catch(e=>console.warn('社科院圖書館東側館正式模型載入失敗，用程序化備用模型',e)); }
    return zone; } };

  /* 劇情用：靠窗那排北往南第三個（AA_669 第 6 節「老位子」）；沒有配置時回 null */
  function oldSeat(){ const L=typeof SOCLIB2F_LAYOUT!=='undefined'?SOCLIB2F_LAYOUT:null; if(!L) return null; const s=L.seats.find(q=>q.old); return s?Object.assign({},s):null; }
  /* 背景人物散步路線的建議（[x, z, 層]；tests/soclib2f_unit.js 檢查每一段走得到）：一樓門廳 → 電梯前 → 影印區 → 樓梯下 → 二樓走廊（B 跑上來）→ 南北向走廊 → 自習室 → 電梯廳 → 下樓回門廳。
     樓梯中段的點不要放（兩層共用的樓梯中段算第 0 層，指定第 1 層會走到一半就結束）*/
  const WALK_ROUTE=[[-6.4,-8.4,0],[0,-8.4,0],[4.4,-5.8,0],[0.0,0.8,0],[-6.6,-5.6,0],[-5.0,-5.8,1],[0,-5.8,1],[-2.8,4.0,1],[3.0,3.4,1],[5.0,-5.8,1],[-6.4,-8.4,0]];
  return {soclib_2f,stairSurfs,buildNav,HALL,ENTRY,oldSeat,WALK_ROUTE};
})();
Z3.ZONES.soclib_2f=SL2.soclib_2f;

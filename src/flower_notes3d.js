/* ===== 花序 Flower Notes（公館店面街 G11 的雙層精品花藝店；FLOWER-NOTES-ART-1110，USER_WANTS X325；LAWWW2 帳號 A 2026-11-10）=====
   使用者規格 docs/handoff/user_specs/FLOWER_NOTES_1110.md（一樓花藝賣場、二樓花藝教室；舊的花攤「晨露花舖」整個拿掉）；參考圖 flower_notes_ref/。
   配置：src/data/flower_notes_layout.js（Blender 正式模型 tools/blender/env_second/flower_notes_interior.py 讀同一份，兩邊的位置一定一致）。
   區域 flower_notes：兩層 NavGrid（1F y=0、2F y=3.9；同尺寸、同原點，D36）。前半挑高、後半上面是二樓；樓梯沿東牆一跑往北爬，兩層共用；
     最上面一排在第 0 層擋起來（走到那裡之前要換到第 1 層）。二樓不做課程玩法（規格第六節），只有走上去、坐下、看。
   進出：公館店面街 G11 門口「進入花序」→ 一樓門內；一樓門口「離開花序」→ 公館 G11 門前的人行道。公館那一邊的互動點由 S.hookGongguan 加（包住 gongguan 的 build，不改 zones3d.js）。
   買花：收銀櫃檯前的互動點 kind＝gg_flower（src/flower_notes_sys3d.js 接 GIFTH）。商品、店員台詞、各區的「看」是 AA 的稿（AA_792，src/data/flower_notes_text.js），這裡不寫句子。
   畫面：程序化備用模型（正式模型載入前、載入失敗時；D38 分類 ③）；正式模型（ASSETS 'bldg.flower_notes_interior'，這支自己登記）載入後由 B3.attachFormal 換掉。 */
'use strict';
const FN3=(function(){
  const S={};
  const LAY=()=>(typeof FLOWER_NOTES_LAYOUT!=='undefined'?FLOWER_NOTES_LAYOUT:null);
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  S.GG={cx:46.6,doorZ:21,outZ:18};   /* 公館 G11：店面中心 x（zones3d.js 的店面街：x 從 −68 排過去，G11 是 41.6～51.6）、門口互動點 z（FZ＋2）、出來站的地方 z；hookGongguan 會照實際的樓房位置更新 cx */
  if(typeof ASSETS!=='undefined'&&ASSETS.manifest&&!ASSETS.manifest['bldg.flower_notes_interior']) ASSETS.manifest['bldg.flower_notes_interior']={url:'assets/models/env/second_ai/flower_notes_interior.glb',type:'building',lazy:true,
    source:'本作 Blender 腳本 tools/blender/env_second/flower_notes_interior.py（花序 Flower Notes：一樓花藝賣場、樓梯、二樓花藝教室；照使用者 11-10 的參考圖；貼圖 Poly Haven CC0）',license:'本作；貼圖 CC0'};

  // ---- 樓梯的高度（往 −z 爬）：連續斜面給碰撞與找路，畫面上一階一階 ----
  S.stairSurfs=function(L){ const T=L.stair, Y1=L.floors[1].y, t=T.tread;
    const run={x0:T.x0,x1:T.x1,z0:T.zTop+t/2,z1:T.zBottom,axis:'z',ya:Y1,yb:0,tread:t,rise:T.rise,low:'z1'};
    const top={x0:T.x0,x1:T.x1,z0:T.zTop,z1:T.zTop+t/2,y:Y1};
    return {run,top,all:[run,top]}; };

  // ---- 導航：兩層 ----
  S.buildNav=function(L){ const W=L.W, D=L.D, Y1=L.floors[1].y, T=L.stair, U=L.upper, LD=L.landing, WL=L.well, c=L.cell;
    const mk=()=>new E3.NavGrid(W+2,D+2,c,-W/2-1,-D/2-1); const nav0=mk(), nav1=mk().setFloor(Y1), ss=S.stairSurfs(L);
    nav0.blockOutside(-W/2+0.35,-D/2+0.35,W/2-0.35,D/2-0.35);
    for(const s of ss.all) nav0.addSurf(Object.assign({},s));
    nav0.blockRect(T.railX-0.05,(T.zTop-1.5+T.zBottom-0.3)/2,0.3,(T.zBottom-0.3)-(T.zTop-1.5),0);   // 樓梯西側（欄杆、樓梯底下封起來）：只有最下面從南邊上去
    nav0.blockRect((T.x0+T.x1)/2,(-D/2+T.zTop)/2,T.x1-T.x0+0.2,T.zTop+D/2,0);                        // 樓梯頂端後面（平台底下，一樓是儲藏間）
    nav0.blockRect((T.x0+T.x1)/2,T.zTop+0.2,T.x1-T.x0,0.4,0);                                        // 最上面那一排在第 0 層擋住
    // 二樓：先整層擋起來，再開出教室、樓梯平台、樓梯
    nav1.fillBlocked(); nav1.freeRect(U.x0+0.35,U.z0+0.35,WL.x0-0.25,U.railZ-0.3);                   // 教室（東邊到樓梯開口的欄杆、南邊到玻璃欄杆）
    nav1.freeRect(LD.x0-0.3,LD.z0+0.15,LD.x1-0.25,LD.z1);                                            // 樓梯平台（連到教室）
    nav1.freeRect(T.x0,T.zTop,T.x1,T.zBottom); for(const s of ss.all) nav1.addSurf(Object.assign({},s));
    { const mid=(T.zTop+T.zBottom)/2; nav1.blockRect((T.x0+T.x1)/2,(mid+T.zBottom+0.5)/2,T.x1-T.x0+0.2,T.zBottom+0.5-mid,0); }   /* STAIR-LEVEL-AUDIT-1111（LAWWW2 11-11，木曜日 2c962ad66 同一類）：樓梯下半段在第 1 層擋起來——原本第 1 層一路開到樓梯底，下樓的人過了一半還留在第 1 層（tests/stair_levels_audit_1111_unit.js 的「過了一半以後還有幾步在上面那一層」），走到底才靠高度差換回第 0 層；BB 在木曜日 PC 上同一種樓梯 30 趟卡 3 次。改成走到一半一定換回第 0 層（兩層在樓梯上高度一樣，換層不跳）*/
    nav1.blockRect(T.railX-0.05,(LD.z1+0.1+U.railZ)/2,0.3,U.railZ-(LD.z1+0.1),0);                    // 樓梯開口西邊的欄杆（平台那一段留開口）
    nav1.blockRect(T.railX-0.275,LD.z1+0.32,0.2,0.5,0);   /* FN-STAIRTOP-POCKET-1111（LAWWW2 11-11；LAWWW 要的「每個站得到的點都走得回離開」掃出來）：欄杆只有一格厚（0.25 m），人的半徑 0.32——
      樓梯最上面兩三階和二樓地板一樣高的那一小段（z −5.3～−4.8），站在樓梯西緣 x 3.5 時左邊的取樣點跨過欄杆落在教室地板上，被當成站得住；
      站進去以後點地板走不出來（往東是樓梯中間、身體卡著欄杆）。欄杆北端靠教室那一側多擋一格，這個口袋就站不進去；教室到樓梯平台的開口（z ≤ −5.32）不變 */
    const blk=(nav,b)=>nav.blockRect(b[0],b[1],b[2],b[3],0,0.05);
    for(const b of S.blocks(L,0)) blk(nav0,b); for(const b of S.blocks(L,1)) blk(nav1,b);
    nav0._cm=null; nav1._cm=null; return {nav0,nav1,ss}; };
  // 家具的阻擋（配置 → [x 中心, z 中心, 寬, 深]）
  S.blocks=function(L,lv){ const out=[], rect=o=>[(o.x0+o.x1)/2,(o.z0+o.z1)/2,o.x1-o.x0,o.z1-o.z0];
    if(lv===0){ out.push(rect(L.counter)); const d=L.display; out.push([d.x,d.z,d.w,d.d]);
      for(const it of L.items0){ if(it.x0!==undefined) out.push(rect(it)); else if(it.kind==='plinth') out.push([it.x,it.z,it.w,it.w]); else if(it.kind==='plant_big') out.push([it.x,it.z,0.6,0.6]); } }
    else { for(const it of L.items1){ if(it.x0!==undefined) out.push(rect(it)); else if(it.kind==='demo_table') out.push([it.x,it.z,it.w,it.d]); else if(it.kind==='stool') out.push([it.x,it.z,0.4,0.4]); else if(it.kind==='blackboard') out.push([it.x,it.z,it.w,0.5]); else if(it.kind==='plant_big') out.push([it.x,it.z,0.6,0.6]); }
      for(const t of L.tables1) out.push([t.x,t.z,t.w,t.d]); }
    return out; };

  // ---- 程序化備用模型（方塊；正式模型載入後藏起來）----
  function buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,slabs){ const W=L.W, D=L.D, Y1=L.floors[1].y, RY=L.roofY, T=L.wallT, U=L.upper, WL=L.well, ST=L.stair, MAT=B3.MAT;
    const b0=new TK.Bin(), b1=new TK.Bin(); const stone=M('#e9e3d8',{rough:0.5}), wood=M('#cdb28c',{rough:0.6}), cream=M('#f1ece2');
    { const f=new THREE.Mesh(new THREE.PlaneGeometry(W,D),stone); f.rotation.x=-Math.PI/2; f.receiveShadow=true; f.userData.walkLv=0; fb0.add(f); walkMeshes.push(f); }
    for(const q of B3.slabPieces({x0:U.x0,x1:U.x1,z0:U.z0,z1:U.z1},[WL],{lv:1,y:Y1,t:L.slabT})){ if(slabs) slabs.push(q); b1.add(cream,TK.boxG(q.x1-q.x0,L.slabT,q.z1-q.z0,1.2),(q.x0+q.x1)/2,Y1-L.slabT/2,(q.z0+q.z1)/2);
      const f=new THREE.Mesh(new THREE.PlaneGeometry(q.x1-q.x0,q.z1-q.z0),wood); f.rotation.x=-Math.PI/2; f.position.set((q.x0+q.x1)/2,Y1+0.004,(q.z0+q.z1)/2); f.receiveShadow=true; f.userData.walkLv=1; fb1.add(f); walkMeshes.push(f); }
    for(let k=0;k<ST.risers;k++){ const top=(k+1)*ST.rise, za=ST.zBottom-(k+1)*ST.tread; b0.add(stone,TK.boxG(ST.x1-ST.x0,top,ST.tread,2.4),(ST.x0+ST.x1)/2,top/2,za+ST.tread/2); }
    const wall=(x,z,w,h,y,ry,dir,grp)=>{ const ms=new THREE.Mesh(TK.boxG(w,h,T,2.4),cream.clone()); ms.material.transparent=true; ms.position.set(x,y+h/2,z); ms.rotation.y=ry; ms.userData.dir=dir; ms.userData.noMerge=true; grp.add(ms); walls.push(ms); };
    for(const [grp,y,h] of [[fb0,0,Y1],[fb1,Y1,RY-Y1]]){ wall(0,-D/2,W,h,y,0,new THREE.Vector3(0,0,1),grp); wall(-W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(1,0,0),grp); wall(W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(-1,0,0),grp); wall(0,D/2,W,h,y,0,new THREE.Vector3(0,0,-1),grp); }
    for(const b of S.blocks(L,0)) b0.add(wood,TK.boxG(b[2],0.95,b[3],1.2),b[0],0.475,b[1]); for(const b of S.blocks(L,1)) b1.add(wood,TK.boxG(b[2],0.8,b[3],1.2),b[0],Y1+0.4,b[1]);
    { const c=new THREE.Mesh(new THREE.PlaneGeometry(W,D),MAT.ceil()); c.rotation.x=Math.PI/2; c.position.y=RY; fb1.add(c); }
    b0.build(fb0); b1.build(fb1); }

  S.build=function(E){ const L=LAY(), W=L.W, D=L.D, Y1=L.floors[1].y, T=L.stair, U=L.upper, WL=L.well;
    const g=new THREE.Group(); g.name='flower_notes_zone'; const lv0=new THREE.Group(), lv1=new THREE.Group(); lv0.name='L0'; lv1.name='L1'; lv0.userData.dyn=true; lv1.userData.dyn=true; g.add(lv0); g.add(lv1);
    const {nav0,nav1,ss}=S.buildNav(L);
    const walls=[], walkMeshes=[], slabs=[]; const fb0=new THREE.Group(), fb1=new THREE.Group(); fb0.name='fallback0'; fb1.name='fallback1'; fb0.userData.dyn=true; fb1.userData.dyn=true; lv0.add(fb0); lv1.add(fb1);
    buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,slabs);
    // 樓梯可以點的面（點地面移動；正式模型載入後也用）：點在樓梯上＝走完這一跑
    for(const s of ss.all){ const w=s.x1-s.x0, d=s.z1-s.z0, ya=s.y!==undefined?s.y:s.ya, yb=s.y!==undefined?s.y:s.yb; const m=new THREE.Mesh(new THREE.PlaneGeometry(w,Math.hypot(d,yb-ya)),new THREE.MeshBasicMaterial({visible:false}));
      m.position.set((s.x0+s.x1)/2,(ya+yb)/2+0.01,(s.z0+s.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(yb-ya,d); m.userData.walkLv=1; m.userData.dyn=true; lv0.add(m); walkMeshes.push(m);
      if(s===ss.run) m.userData.stairEnds=[{x:(T.x0+T.x1)/2,z:T.zBottom+0.6,lv:0},{x:(T.x0+T.x1)/2-1.2,z:(L.landing.z0+L.landing.z1)/2,lv:1}]; }
    const light=new THREE.PointLight(0xfff1dc,12,26,2); light.position.set(-0.4,5.6,3.4); g.add(light);
    const zone={group:g,nav:nav0,levels:[nav0,nav1],levelGroups:[{group:lv0,y:0},{group:lv1,y:Y1}],walkMeshes,walls,slabs,spawn:Object.assign({},L.spawn),bounds:{w:W,d:D},camMaxY:3.3,
      fadeWalls(cam,pp){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.userData.center||w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity=facing?1:0.12; w.material.depthWrite=facing; } },
      applyTime(h,weather){ const night=(h%24<6||h%24>=19.2); g.traverse(o=>{ if(o.userData&&o.userData.outside) B3.setOutView(o,h,weather,night); }); },
      onLamps(on){ light.intensity=on?17:12; } };
    // 窗外的景（正面的玻璃門、櫥窗、二樓整排玻璃）：這一版先用公館店面街現成的街景照片（慢輪單車門前，一樓高度）；使用者要的是「遊戲裡公館這一段、從二樓高度看出去」——要另外拍（第 2 版）
    S.viewPhoto='bikeshop'; try{ B3.outView('south',S.viewPhoto,W+10,L.roofY+1.2,0,(L.roofY+1.2)/2-0.6,D/2+2.4,Math.PI,18,lv0); }catch(e){ console.warn('花序窗外的景沒有接上',e); }
    // 互動點（每一個都標樓層）
    const IT=E.interactables, EX=L.exit, C=L.counter;
    IT.push({x:EX.x,z:EX.z,radius:EX.r,lv:0,label:EX.label,exit:{to:EX.to,spawn:{x:S.GG.cx,z:S.GG.outZ,yaw:Math.PI}}});
    IT.push({x:C.buyAt.x,z:C.buyAt.z,radius:C.buyAt.r,lv:0,label:'買花',kind:'gg_flower',fnCounter:true});   /* 買花接好了（FLOWER-NOTES-1110，src/flower_notes_sys3d.js：花藝師、十樣商品、營業時間）；原本暫用的「看」那一句拿掉，櫃檯的「看」照 AA_792 在包裝那一頭（FNS.lookPoints） */
    for(const q of L.seats1) IT.push({x:q.x,z:q.z,radius:0.7,lv:1,label:'坐下',fnSeat:q.id,seat:{x:q.x,z:q.z,yaw:q.yaw,lv:1,table:'fn_t'+q.table}});
    zone.fnLooks=L.looks;   /* 各區的「看」（永生花、鮮花花束、冷藏花櫃、展示台、黑板、示範桌）：位置在配置；句子 AA_792、互動點由 src/flower_notes_sys3d.js 加（中央展示台稿沒有句子＝不放） */
    zone.fnClerk=Object.assign({},C.clerk);
    // 正式模型
    zone.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.flower_notes_interior']){ ASSETS.loadOne('bldg.flower_notes_interior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; B3.attachFormal(zone,c.scene.clone(true),fb0,fb1,lv0,lv1,walls,walkMeshes); }).catch(e=>console.warn('花序室內正式模型載入失敗，用程序化備用模型',e)); }
    return zone; };

  /* 公館那一邊的門口：G11 店面前（騎樓裡）多一個「進入花序」的互動點；出來站的位置照實際的樓房位置更新。包住 gongguan 的 build（不改 zones3d.js） */
  S.hookGongguan=function(){ if(typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES.gongguan||Z3.ZONES.gongguan._fn) return false; const zd=Z3.ZONES.gongguan, b0=zd.build;
    zd.build=function(E){ const z=b0.call(this,E); const L=LAY(); if(L&&Z3.ZONES.flower_notes){ const b=(z.buildings||[]).find(q=>q.userData&&q.userData.ggShop==='G11'); if(b) S.GG.cx=+b.position.x.toFixed(2);
        E.interactables.push({x:S.GG.cx,z:S.GG.doorZ,radius:2.2,prio:1,label:'進入花序',exit:{to:'flower_notes',spawn:Object.assign({},L.spawn)},fnDoor:true}); } return z; };
    zd._fn=true; return true; };
  if(typeof Z3!=='undefined'&&Z3.ZONES&&LAY()){ Z3.ZONES.flower_notes={id:'flower_notes',name:'花序 Flower Notes',indoor:true,camDist:4.4,build(E){ return S.build(E); }}; S.hookGongguan(); }
  return S;
})();

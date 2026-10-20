/* ===== 社會科學院 辜先生紀念圖書館：一樓開架閱覽室（D56 社科院第①步；2026-10-13）=====
   使用者 D46：法律系學生念書也會去「新社科院的辜先生紀念圖書館」；D56：社科院在霖澤館對面，經濟系大一那年就在。
   配置：src/data/soclib_layout.js（LAWWW2 的 tools/blender/env_second/soclib_layout_gen.py 產生；Blender 正式模型 soclib_interior.py 讀同一份，兩邊的位置一定一致）。
   座標：x 往東、z 往南（+z＝南牆：入口、服務台）；一層，地板 y=0。室內本身的座標照舊；校園上的社科院 X75（2026-10-20）搬到霖澤館西南、整組轉 180°
         （校園 x −13～17、z −65～−43，src/data/socsci_layout.js）：室內的「北牆、西牆」玻璃帷幕＝校園上圖書館朝南、朝東的玻璃，入口（室內南牆）＝校園上圖書館的北牆（中庭那一面）。
   區域：校園社科院正面的門（zones3d.js 校園的 exits，門的位置在下面的 DOOR）→ soclib（這個檔案）；離開回到社科院正面。
         第①步沿用現在的社科院外觀（門在西面），所以從西邊的門進來、出現在圖書館南面的入口（外觀換成正式模型的第②步再對齊）。
         開放時間（D62，使用者 2026-10-14 查證館方網頁）：src/data/places.js；沒開的時候校園的門擋著（story3d.js 的 onInteract），館裡的人在閉館時被請出去（回到社科院正門前）。
   導航：配置的 nav.rects（[x, z, 寬, 深, ry]）、nav.circles（柱子）。rects 的 ry 是 Blender／three.js 的旋轉方向（物件的 x 軸在世界的 (cos ry, −sin ry)），
         E3.NavGrid.blockRect 的 rot 方向相反（本地 x 軸在世界的 (cos rot, sin rot)），所以傳 −ry（只有弧形書架有旋轉；tests/nav_soclib_unit.js 檢查書架和導航對得上）。
   畫面：程序化備用模型（正式模型載入前、載入失敗時：簡單的牆、桌椅、書架、柱子；D38 分類 ③）；
         正式模型（ASSETS 'bldg.soclib_interior'，LAWWW2 ⑬）載入後照其他單層室內的接法（Z3.attachRoomGLB：WALL_* 淡出、備用模型藏起來），招牌的字由這裡畫。
   窗外的景：北面、西面的玻璃帷幕外面各一片 B3.outView（遊戲裡拍的校園畫面 soclib_north／soclib_west，tools/shots/window_views.py；X75 以後在校園上是圖書館朝南、朝東的玻璃外面拍）。 */
'use strict';
const SL3=(function(){
  const LAYOUT=()=>SOCLIB_LAYOUT;
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  /* 校園上的門（舊外觀）：社科院（CK.modern，(110,−70) 轉 −90°，正面朝西 x=99）一樓玻璃大廳中間的門前；互動點離建築的導航阻擋（x≥98.7）還有半個人 */
  /* 新社科院外觀（ART-01，src/data/socsci_layout.js）：圖書館的門在中庭那一面；出來站在門前 1.7 m、面向中庭。X75（2026-10-20）整組搬到霖澤館西南、轉 180°：門在圖書館北牆 (11,−65.7)、出來面向北。manifest 沒有新模型時照舊外觀 */
  const NEW=typeof SOCSCI_LAYOUT!=='undefined'&&typeof ASSETS!=='undefined'&&!!ASSETS.manifest['bldg.campus_socsci'];
  const DOOR=NEW?Object.assign({},SOCSCI_LAYOUT.libDoor):{x:97.9,z:-70,r:1.6};
  const CAMPUS=NEW?Object.assign({},SOCSCI_LAYOUT.libOut):{x:95.6,z:-70,yaw:-Math.PI/2};   // 從圖書館出來：站在社科院門前、面向西（法學院廣場）；離門的互動點 2.3 m（一出來不會又跳出「進入社科院圖書館」）；兩邊的白色圓柱在 z=−72、−66（2 m 外）

  // ---- 導航（room() 已經擋了牆外）：家具、書架、閘門、服務台、館員區（rects），柱子（circles）----
  /* 格子 0.4 m：比一格薄的東西（閘門兩邊的玻璃欄杆 0.1 m）照原本的大小擋不到任何格子的中心，人會直接穿過去——加寬到蓋住一排格子；
     柱子（半徑約 0.25）也可能一格都沒擋到，至少用 0.36 m（每一支至少擋一格，通常 2–4 格）*/
  function buildNav(L,nav){ const c=L.cell||0.4; for(const [x,z,w,d,ry] of L.nav.rects){ const t=Math.min(w,d); nav.blockRect(x,z,w,d,-(ry||0),t<c?c/2-t/2+0.01:0); } for(const [x,z,r] of L.nav.circles) nav.blockCircle(x,z,Math.max(r,0.36)); nav._cm=null; }

  // ---- 座位：配置的 65 個（長桌 24、窗邊 33、閱報區沙發 8）；yaw＝坐下時面向的方向 ----
  /* 座位：table＝同一張桌子（AA_110 5-3 的 npcNear「坐同一張桌子」、5-4 的習慣記憶 table:soclib:…）——長桌 rt0～rt3（最近的那張）、閱報區 lounge0／lounge1；
     窗邊的長檯面每 3 個相鄰的位子算一張（wn0…北面、ww0…西面）*/
  function seatsOf(L){ const near=(arr,s)=>{ let bi=0,bd=1e9; arr.forEach((f,i)=>{ const d=Math.hypot(f.x-s.x,f.z-s.z); if(d<bd){ bd=d; bi=i; } }); return bi; };
    const rt=L.furniture.filter(f=>f.type==='readingTable'), lg=L.furniture.filter(f=>f.type==='lounge'); const win={};
    for(const side of ['n','w']){ const ws=L.seats.filter(s=>s.kind==='window'&&(side==='n'?Math.abs(s.yaw)<0.8||Math.abs(Math.abs(s.yaw)-Math.PI)<0.8:!(Math.abs(s.yaw)<0.8||Math.abs(Math.abs(s.yaw)-Math.PI)<0.8))).sort((a,b)=>side==='n'?a.x-b.x:a.z-b.z); ws.forEach((s,k)=>{ win[L.seats.indexOf(s)]='w'+side+Math.floor(k/3); }); }
    return L.seats.map((s,i)=>({x:s.x,z:s.z,yaw:s.yaw,lv:0,kind:s.kind,table:s.kind==='table'&&rt.length?'rt'+near(rt,s):(s.kind==='lounge'&&lg.length?'lounge'+near(lg,s):(win[i]||s.kind+'_'+i))})); }
  const seatLabel=s=>s.kind==='window'?'坐下讀書（窗邊）':(s.kind==='lounge'?'坐下（閱報區）':'坐下讀書');

  // ---- 林間書房（弧形書架圍著一支樹狀柱）：缺口的方向＝弧的反方向；看書架的互動點在缺口裡面、柱子旁邊 ----
  function groves(L){ return L.furniture.filter(f=>f.type==='arcShelf'&&f.a1-f.a0>Math.PI&&L.columns.some(c=>Math.hypot(c.x-f.cx,c.z-f.cz)<0.05)).map(f=>{   /* 圍起來的（超過半圈）；外面那道 100° 的矮弧不算 */ const open=(f.a0+f.a1)/2+Math.PI; return {f,open,x:+(f.cx+Math.cos(open)*0.95).toFixed(3),z:+(f.cz+Math.sin(open)*0.95).toFixed(3)}; }); }

  // ---- 窗外的景：北面、西面的玻璃帷幕（備用模型的牆沒有洞：景貼在牆的內側；正式模型的玻璃是透明的：景搬到玻璃外面、放大）----
  function windowViews(L,g,outs){ const W=L.W, D=L.D, H=L.H, T=L.wallT, y0=0.15, y1=H-0.35, h=y1-y0, yc=(y0+y1)/2;
    const add=(photo,kind,len,x,z,ry,fx,fz)=>{ const p=B3.outView(kind,photo,len,h,x,yc,z,ry,30,g); p.userData.fpos=new THREE.Vector3(fx,yc,fz); p.userData.fsize=[len+4,h+2.6]; outs.push(p); };
    if(L.walls.north==='glass') add('soclib_north','south',W-0.4,0,-D/2+T/2+0.03,0,0,-D/2-0.7);
    if(L.walls.west==='glass') add('soclib_west','east',D-0.4,-W/2+T/2+0.03,0,Math.PI/2,-W/2-0.7,0); }

  // ---- 程序化備用模型（正式模型載入前、載入失敗時）----
  function buildFallback(L,fb){ const W=L.W, D=L.D, H=L.H, T=L.wallT; const b=new TK.Bin();
    const bamboo=M('#d2b47e',{rough:0.65}), bambooD=M('#a9864f',{rough:0.7}), white=M('#f3f1ec',{rough:0.55}), metal=M('#a3a8ae',{rough:0.4}), dark=M('#2c3034',{rough:0.5}), glassM=new THREE.MeshStandardMaterial({color:0xcfe0e6,transparent:true,opacity:0.35,roughness:0.1,depthWrite:false});
    const books=W3.canvasTex('slBooks',256,64,(c,w,h)=>{ const cols=['#5a1f24','#1f3350','#2f4a3a','#3a2f2a','#6b5a3a','#8c3b47','#d9d3c6','#283a52']; let s=7; const rr=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; c.fillStyle='#3a3026'; c.fillRect(0,0,w,h); let x=0; while(x<w){ const bw=4+rr()*7, bh=h*(0.62+rr()*0.38); c.fillStyle=cols[(rr()*cols.length)|0]; c.fillRect(x,h-bh,bw,bh); x+=bw+1; } });
    const bookM=new THREE.MeshStandardMaterial({map:books,roughness:0.8});
    // 樹狀柱：白色細柱＋往上張開的柱頂（荷葉）
    for(const c of L.columns){ b.add(white,new THREE.CylinderGeometry(c.r,c.r*1.12,c.capY-0.6,12),c.x,(c.capY-0.6)/2,c.z); b.add(white,new THREE.CylinderGeometry(c.cap,c.r,0.6,28,1,true),c.x,c.capY-0.3,c.z,0,{noShadow:true}); b.add(white,new THREE.CylinderGeometry(c.cap,c.cap,0.05,28),c.x,c.capY+0.025,c.z,0,{noShadow:true}); }
    // 天窗：天花板上的圓形亮面
    const skyM=new THREE.MeshBasicMaterial({color:0xeef5fb}); for(const s of L.skylights) b.add(skyM,new THREE.CircleGeometry(s.r,20),s.x,H-0.03,s.z,0,{rx:Math.PI/2,noShadow:true});
    for(const f of L.furniture){ const t=f.type;
      if(t==='readingTable'){ Z3.desk(fb,{blockRect(){}},f.x,f.z,0,f.w,f.d,'#d2b47e','wood'); const n=f.seats/2; for(let i=0;i<n;i++){ const lx=f.x-f.w/2+f.w*(i+0.5)/n; b.add(dark,new THREE.CylinderGeometry(0.015,0.015,0.32,6),lx,0.93,f.z); b.add(white,new THREE.CylinderGeometry(0.05,0.13,0.1,14),lx,1.1,f.z); } }
      else if(t==='windowCounter'){ const len=f.side==='north'?f.x1-f.x0:f.z1-f.z0, cx=f.side==='north'?(f.x0+f.x1)/2:f.x, cz=f.side==='north'?f.z:(f.z0+f.z1)/2; const geo=f.side==='north'?TK.boxG(len,0.05,f.d):TK.boxG(f.d,0.05,len); b.add(bamboo,geo,cx,0.745,cz); b.add(bambooD,f.side==='north'?TK.boxG(len,0.7,0.04):TK.boxG(0.04,0.7,len),f.side==='north'?cx:cx-f.d/2+0.02,0.36,f.side==='north'?cz-f.d/2+0.02:cz); }
      else if(t==='wallShelf'){ const len=f.z1-f.z0, cz=(f.z0+f.z1)/2; b.add(bamboo,TK.boxG(f.d,f.h,len),f.x,f.h/2,cz); b.add(bookM,new THREE.PlaneGeometry(len-0.1,f.h-0.25),f.x-f.d/2-0.006,f.h/2,cz,-Math.PI/2); }
      else if(t==='arcShelf'){ const span=f.a1-f.a0, n=Math.max(3,Math.ceil(span*f.r/0.5)), seg=span*f.r/n; for(let k=0;k<n;k++){ const a=f.a0+(k+0.5)*span/n, x=f.cx+f.r*Math.cos(a), z=f.cz+f.r*Math.sin(a), ry=Math.PI/2-a;   /* 書架段的 x 軸沿著弧的切線（和配置的 nav.rects 同一個 ry）*/
          b.add(bamboo,TK.boxG(seg+0.02,f.h,f.d),x,f.h/2,z,ry); for(const s of [1,-1]){ const o=s*(f.d/2+0.006); b.add(bookM,new THREE.PlaneGeometry(seg-0.06,f.h-0.2),x+Math.cos(a)*o,f.h/2,z+Math.sin(a)*o,ry+(s>0?0:Math.PI)); } } }
      else if(t==='lounge'){ for(const sx of [-1,1]) for(const sz of [-0.55,0.55]){ const x=f.x+sx*1.0, z=f.z+sz, ry=sx<0?Math.PI/2:-Math.PI/2; b.add(M('#5d6b73',{rough:0.9}),TK.boxG(0.62,0.42,0.6),x-sx*0.04,0.21,z,ry); b.add(M('#5d6b73',{rough:0.9}),TK.boxG(0.62,0.45,0.14),x-sx*0.3,0.62,z,ry); }
        b.add(bamboo,new THREE.CylinderGeometry(0.42,0.42,0.04,24),f.x,0.42,f.z); b.add(bambooD,new THREE.CylinderGeometry(0.05,0.05,0.4,8),f.x,0.2,f.z); }
      else if(t==='display'){ b.add(bambooD,TK.boxG(f.w,0.85,f.d),f.x,0.425,f.z); for(let i=0;i<6;i++) b.add(M(['#5a1f24','#1f3350','#d9d3c6','#2f4a3a','#c9a24f','#8c3b47'][i]),TK.boxG(0.17,0.24,0.03),f.x-f.w/2+0.25+i*0.34,0.97,f.z+(i%2?0.15:-0.1),0.15*(i-2.5)); }
      else if(t==='opac'){ for(let i=0;i<f.n;i++){ const x=f.x+(i-(f.n-1)/2)*0.9; b.add(dark,TK.boxG(0.4,1.05,0.35),x,0.525,f.z); b.add(M('#1d2329',{rough:0.3}),TK.boxG(0.42,0.3,0.05),x,1.25,f.z-0.12,0,{rx:-0.3}); } }
      else if(t==='returnBox'){ b.add(metal,TK.boxG(0.7,1.05,0.6),f.x,0.525,f.z,f.ry||0); b.add(dark,TK.boxG(0.44,0.06,0.02),f.x+Math.sin(f.ry||0)*0.31,0.89,f.z+Math.cos(f.ry||0)*0.31,f.ry||0); }
      else if(t==='periodicals'){ const len=f.x1-f.x0, cx=(f.x0+f.x1)/2; b.add(bamboo,TK.boxG(len,f.h,f.d),cx,f.h/2,f.z); for(let i=0;i<Math.floor(len/0.5);i++) b.add(M(['#c94b3b','#e8e2d4','#2f5d7a','#d9a441','#3c6b4f'][i%5]),TK.boxG(0.32,0.42,0.02),f.x0+0.25+i*0.5,0.4+(i%3)*0.45,f.z-f.d/2-0.012,0,{rx:0.12}); } }
    // 服務台＋館員區（矮隔板）、閘門（門柱＋玻璃翼板）、閘門兩邊的玻璃欄杆
    { const dk=L.desk; b.add(white,TK.boxG(dk.x1-dk.x0,1.05,dk.z1-dk.z0),(dk.x0+dk.x1)/2,0.525,(dk.z0+dk.z1)/2); b.add(bamboo,TK.boxG(dk.x1-dk.x0+0.06,0.05,dk.z1-dk.z0+0.08),(dk.x0+dk.x1)/2,1.075,(dk.z0+dk.z1)/2);
      for(const x of [dk.x0+1.2,dk.x1-1.4]) b.add(dark,TK.boxG(0.5,0.32,0.04),x,1.32,dk.z0+0.25);
      const sz0=dk.staff.z0, sz1=dk.staff.z1; for(const x of [dk.x0-0.95,dk.x1+0.95]) b.add(bambooD,TK.boxG(0.08,1.2,sz1-sz0),x,0.6,(sz0+sz1)/2); }
    { const G=L.gates; for(const px of G.posts){ b.add(metal,TK.boxG(G.postW,1.0,G.postD),px,0.5,G.z); } for(const [a,c] of G.rails){ const gp=new THREE.Mesh(new THREE.PlaneGeometry(c-a,0.9),glassM); gp.position.set((a+c)/2,0.55,G.z); fb.add(gp); b.add(metal,TK.boxG(c-a,0.04,0.05),(a+c)/2,1.02,G.z); } }
    b.build(fb);
    // 招牌（南牆內側，入口上方）
    for(const s of L.signs){ const sp=new THREE.Mesh(new THREE.PlaneGeometry(s.w,s.w*0.17),new THREE.MeshBasicMaterial({map:signTex(s.text,false)})); sp.position.set(s.x,s.y,s.z); sp.rotation.y=s.ry||0; fb.add(sp); } }

  // ---- 招牌的字：「社會科學院圖書館」＋小字「辜先生紀念圖書館」（glTF 的板面 flipY=false）----
  function signTex(text,gltf){ const c=document.createElement('canvas'); c.width=1024; c.height=174; const x=c.getContext('2d'); x.fillStyle='#f7f6f2'; x.fillRect(0,0,1024,174);
    x.fillStyle='#2f3338'; x.textAlign='center'; x.textBaseline='middle'; x.font='600 84px "Noto Sans TC","PingFang TC","Noto Sans CJK TC","Microsoft JhengHei",sans-serif'; x.fillText(text||'社會科學院圖書館',512,70);
    x.font='34px "Noto Sans TC","PingFang TC","Noto Sans CJK TC","Microsoft JhengHei",sans-serif'; x.fillStyle='#6b7076'; x.fillText('辜先生紀念圖書館',512,138);
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; if(gltf) t.flipY=false; return t; }
  /* 正式模型的招牌板面（WALL_front_SIGN_FACE_*）：沒有 UV 的話照板面的寬高補一組（u 沿著板面、v 往下），再換上畫好字的貼圖；板面跟著南牆淡出（還在 z.walls 裡）*/
  function paintSign(o){ const g=o.geometry; if(!g.attributes.uv){ g.computeBoundingBox(); const bb=g.boundingBox, p=g.attributes.position, uv=new Float32Array(p.count*2), wx=bb.max.x-bb.min.x, wz=bb.max.z-bb.min.z, h=bb.max.y-bb.min.y||1, alongX=wx>=wz;
      for(let i=0;i<p.count;i++){ const a=alongX?(p.getX(i)-bb.min.x)/(wx||1):(p.getZ(i)-bb.min.z)/(wz||1); uv[i*2]=alongX?1-a:a; uv[i*2+1]=1-(p.getY(i)-bb.min.y)/h; }   /* 板面朝北（ry=π）：從室內看 x 往左變大，所以 u＝1−a */
      g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); }
    const t=signTex((o.userData||{}).sign,true); const m=o.material; m.map=t; m.color=new THREE.Color(0xffffff); m.emissive=new THREE.Color(0xffffff); m.emissiveMap=t; m.emissiveIntensity=0.25; m.needsUpdate=true; }

  // ---- 區域 ----
  const soclib={ id:'soclib', name:'社科院圖書館', indoor:true, camDist:4.6, build(E){ const L=LAYOUT(), W=L.W, D=L.D, H=L.H;
    const z=Z3.room(E,{w:W,d:D,h:H,windows:false,cool:true,wallColor:'#f1efea',floorTex:W3.stoneTex('#d6d3cb'),spawn:Object.assign({},L.entrance.spawn)}); const g0=z.group, nav=z.nav;
    /* 程序化的畫面全部放在 fb（備用模型）：正式模型載入後整組藏起來；導航、座位、互動點、出口不受影響（和 Café 一樣）*/
    const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    buildNav(L,nav); buildFallback(L,fb);
    const outs=[]; windowViews(L,g0,outs);
    // 燈：一盞房間預設的頂燈不夠照 30×22 m，挑高 5.6 m 的閱覽室每一區多一盞（白天弱、晚上亮）
    const lamps=[]; for(const [x,zz] of [[-9,-5],[-2,-5],[6,-4],[12,-3],[-9,3],[-2,4],[7,6],[12,4]]){ const l=new THREE.PointLight(0xfff2e0,3,13,2); l.position.set(x,H-0.6,zz); l.userData.on=7; l.userData.off=3; g0.add(l); lamps.push(l); }
    const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    /* 天窗（正式模型的 soclib_skylight 自發光）：白天亮、黃昏變暗、晚上只剩一點（夜空）；陰雨天暗一點 */
    const skyMats=[]; const skyLevel=(h,weather)=>{ h=h%24; const k=(h<5.5||h>=19.2)?0.08:(h<6.5?0.35:(h>=17.8?0.3:1)); return k*(weather==='rain'?0.6:(weather==='cloudy'?0.8:1)); };
    const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); const night=(h%24<6||h%24>=18.6); for(const o of outs) B3.setOutView(o,h,weather,night); const k=skyLevel(h,weather); for(const m of skyMats) m.emissiveIntensity=m.userData.slBase*k; };
    // 座位、互動點（一層，全部 lv 0）
    const IT=E.interactables, seats=z.seats=seatsOf(L);
    for(const st of seats){ if(st.kind!=='lounge') Z3.chair(fb,st.x,st.z,st.yaw,'#c9a46a'); IT.push({x:st.x,z:st.z,radius:0.8,lv:0,label:seatLabel(st),seat:st,study:true}); }
    const EN=L.entrance; IT.push({x:EN.x,z:D/2-0.5,radius:0.9,lv:0,label:'離開圖書館（回社科院前）',exit:{to:'campus',spawn:Object.assign({},CAMPUS)}});   /* 南牆的門：配置的 exitZ（10.2）離出生點只有 0.9 m，一進來就會跳出「離開」——貼著牆放（出生點 1.2 m 外）*/
    { const dk=L.desk; IT.push({x:(dk.x0+dk.x1)/2,z:dk.z0-0.7,radius:1.2,lv:0,label:'服務台',look:'服務台：借書、還書都在這裡辦。館員小聲說：「閱覽室裡請保持安靜，飲料要有蓋子喔。」'}); }
    for(const f of L.furniture){
      if(f.type==='opac') IT.push({x:f.x,z:f.z-0.85,radius:0.9,lv:0,label:'館藏查詢',look:'館藏查詢：輸入書名就查得到書在哪一區、有沒有被借走。這裡的書大多是社會科學——經濟、政治、社會、社工、國發。'});
      else if(f.type==='display') IT.push({x:f.x,z:f.z-f.d/2-0.7,radius:1.0,lv:0,label:'看新書展示',look:'新書展示：這個月新進的書，經濟學、公共政策、社會學都有。'});
      else if(f.type==='periodicals') IT.push({x:(f.x0+f.x1)/2,z:f.z-f.d/2-0.75,radius:1.2,lv:0,label:'看期刊',look:'期刊架：經濟、政治、社會的中外文期刊，最新一期放在架子上，過期的要到櫃台問。'});
      else if(f.type==='wallShelf') IT.push({x:f.x-f.d/2-0.75,z:(f.z0+f.z1)/2,radius:1.2,lv:0,label:'看書架',look:'靠牆的書架：一整面的書，從地板排到比人還高。'});
      else if(f.type==='returnBox') IT.push({x:f.x+0.9,z:f.z,radius:0.9,lv:0,label:'還書箱',look:'還書箱：閉館的時候也可以從這裡還書。'}); }
    for(const gv of groves(L)) IT.push({x:gv.x,z:gv.z,radius:1.0,lv:0,label:'看書架（林間書房）',look:'弧形的竹書架圍著一根白色的樹狀柱，像樹林裡的小書房。抬頭看，柱頂像荷葉一樣散開，光從天窗灑下來。'});
    // 正式模型（GLB）：載入成功就藏起程序化備用模型（導航、互動點不變）；招牌畫字；窗外的景搬到玻璃外面
    z.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.soclib_interior']){ ASSETS.loadOne('bldg.soclib_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
      Z3.attachRoomGLB(z,g0,fb,root);
      root.traverse(o=>{ if(o.isMesh&&/SIGN_FACE/.test(o.name)) paintSign(o);
        if(o.isMesh&&o.material&&/^soclib_skylight/.test(o.material.name||'')&&!skyMats.includes(o.material)){ if(o.material.userData.slBase==null) o.material.userData.slBase=o.material.emissiveIntensity||1; skyMats.push(o.material); } });   /* 引擎每 5 格呼叫 applyTime，天窗的亮度下一次就跟上時段。
        原本的亮度只記第一次：clone 出來的模型共用快取的材質，第二次進館時材質已經被調暗過（2026-10-13 批次 2：晚上量到 0.0064＝0.08×0.08）*/
      for(const o of outs){ o.position.copy(o.userData.fpos); const [fw,fh]=o.userData.fsize; o.scale.set(fw/o.geometry.parameters.width,fh/o.geometry.parameters.height,1); } }).catch(e=>console.warn('社科院圖書館正式模型載入失敗，用程序化備用模型',e)); }
    return z; } };
  return {soclib,DOOR,CAMPUS,buildNav,seatsOf,groves};
})();
Z3.ZONES.soclib=SL3.soclib;

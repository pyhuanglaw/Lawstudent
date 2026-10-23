/* ===== 美國交換篇（大三下，D47）的區域＋桃園機場第二航廈（LAWWW2-C 2026-10-17；使用者 21:0x「先做1，把美國場景接進遊戲」）=====
   四個區域，都照 LAWWW2 交的配置（Blender 正式模型讀同一份，兩邊的位置一定一致）：
     us_apartment  公寓室內（單人戶 1x1＋門外的戶外樓梯平台）：src/data/us_apartment_layout.js；正式模型 bldg.us_apartment
     us_outside    公寓社區 Linden Grove 的戶外（停車場、三棟兩層樓）：src/data/us_layouts.js 的 US_COMMUNITY_LAYOUT；正式模型 bldg.us_community＋bldg.us_cars（車照配置停）
     us_market     草原超市（Prairie Basket）室內：US_MARKET_LAYOUT；正式模型 bldg.us_market
     us_shared     學姊她們的 C 棟 208（三人合租，US2 的共用廚房）：US_SHARED_LAYOUT（從單人戶的配置轉出來）；正式模型 bldg.us_shared（同一支 us_apartment.py）
     airport_dep   桃園機場第二航廈 出境大廳＋下車處：AIRPORT_T2_LAYOUT.dep；正式模型 bldg.airport_dep
     airport_arr   桃園機場第二航廈 入境大廳：AIRPORT_T2_LAYOUT.arr；正式模型 bldg.airport_arr
   連接：us_outside 的「回公寓」↔ us_apartment 平台東端的「出門」；社區入口的「出門（去超市）」↔ 超市的「離開超市」（真的要搭公車，公車站先不做 3D）。
         機場：安檢入口「出境（前往美國）」→ us_outside 的社區入口——**這是測試用的接法**：搭飛機、抵達、巴士站 → 超市 → 公寓（AA_144 5-4、US1）
         是交換系統（LAWWW-C）的事，那邊做好時把 US_LINK 換成真正的流程。下車處「搭車離開」、入境大廳的出口 → 公館（捷運站出口）。
   座標：區域座標 x 往東、z 往南、y 往上（三份配置都一樣）；yaw＝面向 (sin yaw, cos yaw)；家具的 ry 是 three.js 的旋轉方向，
         E3.NavGrid.blockRect 的 rot 方向相反（soclib3d.js 的說明），所以傳 −ry。
   導航：公寓的格子 0.4 m、格子中心在 0.4 的整數倍（配置的牆都在 0.2 的奇數倍＝格子交界，同 dorm_layout.js）：整個先擋住，再打開每個房間；
         兩個打開的房間中間的牆擋一排格子（門的位置留空）。關著的門（衛浴、衣物間、衣帽櫃、洗衣機櫃、隔壁 213）：房間不打開，門口一個「看」的互動點。
         社區、機場：格子 0.5 m，照配置的 blocks（長方形，都有 why）＋車。
   畫面：正式模型載入前、載入失敗時用程序化備用模型（D38 ③：地面、牆、家具的方塊）；載入後整組藏起來，導航、互動點不變。
   試玩入口（開發用）：網址加 ?usdemo，進到遊戲以後左上角多一顆「美國篇（測試）」按鈕：到機場出境大廳。正式的入口是交換系統（src/exchange3d.js，EXCH）。
   交換系統（LAWWW-C）：這個檔在 exchange3d.js 後面載入，Z3.ZONES 同名蓋過它的臨時場景；EXCH.SPAWN 改成這裡的出生點；機場安檢入口是它的「登機：飛往美國」（exchFly）。
   企劃（BB_215）：交換在大四上 2028/8/2～12/23；超市一定要（社區「出門」去超市）；主街不需要（模型 us_street.glb 在，沒有接成區域）。 */
'use strict';
const US3=(function(){
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  const has=k=>typeof ASSETS!=='undefined'&&!!ASSETS.manifest[k];
  const G_=()=>typeof GAME!=='undefined'?GAME.G:null;
  const night=h=>{ h=h%24; return h<6.3||h>=18.2; };
  /* 正式模型的發光材質（GLOW_*、US_glow）：晚上亮、白天暗。clone 出來的模型共用快取的材質，原本的亮度只記第一次（soclib3d.js 的教訓）*/
  function glowMats(root,re){ const out=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(m&&re.test(m.name||'')&&!out.includes(m)){ if(m.userData.usBase==null) m.userData.usBase=m.emissiveIntensity!=null?m.emissiveIntensity:1; out.push(m); } } }); return out; }
  function setGlow(mats,k){ for(const m of mats) m.emissiveIntensity=m.userData.usBase*k; }
  function plane(g,w,d,mat,x,z,y){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat); m.rotation.x=-Math.PI/2; m.position.set(x,y||0,z); m.receiveShadow=true; g.add(m); return m; }
  function tiled(tex,rx,ry){ const t=tex.clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); return t; }
  /* 門牌（PLATE_FACE_*，props text）：canvas 畫字。UV 一律照板面重算（u 沿著「站在板子前面看」的右手方向、v 往下）：
     Blender 匯出的 UV 是公尺座標（−1.09～−0.91），貼圖只看得到邊緣的底色（2026-10-17 合租戶截圖：門牌是一塊沒有字的紅色）*/
  function paintPlate(o,text,bg,fg){ const g=o.geometry, p=g.attributes.position, nr=g.attributes.normal; let nx=0,nz=0;
      if(nr){ for(let i=0;i<nr.count;i++){ nx+=nr.getX(i); nz+=nr.getZ(i); } } if(Math.hypot(nx,nz)<1e-3){ g.computeBoundingBox(); const bb=g.boundingBox; nx=nz=0; if(bb.max.x-bb.min.x>=bb.max.z-bb.min.z) nz=1; else nx=1; }   /* 沒有法線（或雙面、互相抵消）：照板面比較長的方向 */
      const n=new THREE.Vector3(nx,0,nz).transformDirection(o.matrixWorld); const inv=new THREE.Matrix3().getNormalMatrix(o.matrixWorld).invert();
      const right=new THREE.Vector3(n.z,0,-n.x).applyMatrix3(inv).normalize();   /* 看板子的人面向 −n，右手邊＝(n.z, 0, −n.x)（換回網格自己的座標）*/
      let s0=1e9,s1=-1e9,y0=1e9,y1=-1e9; for(let i=0;i<p.count;i++){ const sv=p.getX(i)*right.x+p.getZ(i)*right.z, y=p.getY(i); s0=Math.min(s0,sv); s1=Math.max(s1,sv); y0=Math.min(y0,y); y1=Math.max(y1,y); }
      const uv=new Float32Array(p.count*2); for(let i=0;i<p.count;i++){ uv[i*2]=((p.getX(i)*right.x+p.getZ(i)*right.z)-s0)/((s1-s0)||1); uv[i*2+1]=1-(p.getY(i)-y0)/((y1-y0)||1); } g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    const c=document.createElement('canvas'); c.width=256; c.height=128; const x=c.getContext('2d'); x.fillStyle=bg||'#7a2a26'; x.fillRect(0,0,256,128); x.fillStyle=fg||'#f4efe6'; x.textAlign='center'; x.textBaseline='middle';
    x.font='600 72px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif'; x.fillText(String(text||''),128,68);
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.flipY=false; const m=o.material.clone(); m.map=t; m.color=new THREE.Color(0xffffff); o.material=m; }
  /* 「看」的文字：只寫東西是什麼（企劃還沒寫這些地方的文字；AA 寫好時換掉，劇情文字不由開發組自己編）*/
  const lookText=s=>s;

  // =================== 公寓室內 us_apartment ===================
  const APT=()=>US_APARTMENT_LAYOUT;
  const APT_CLOSED=new Set(['bath','closet','coat','storage','laundry']);   /* 門關著的房間：不打開導航（衛浴從臥室進，這一版門關著；之後要開再打開這兩間＋家具阻擋）。配置裡 walk:false 的房間也一樣 */
  const APT_BOX={x0:-5.4,z0:-5.4,w:11.6,d:11.2};                /* 導航格：x −5.4～6.2、z −5.4～5.8（格子中心 −5.2、−4.8、…＝0.4 的整數倍）*/
  function aptNav(L){ const nav=new E3.NavGrid(APT_BOX.w,APT_BOX.d,0.4,APT_BOX.x0,APT_BOX.z0); nav.fillBlocked();
    const band=(x0,x1,z0,z1)=>{ if(x1-x0>0.01&&z1-z0>0.01) nav.blockRect((x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,0,0); };
    for(const r of L.rooms) if(r.walk!==false&&!APT_CLOSED.has(r.id)) nav.freeRect(r.x0,r.z0,r.x1,r.z1);
    const B=L.balcony, BW=L.breezeway; nav.freeRect(B.x0,B.z0,B.x1,B.z1); nav.freeRect(BW.x0,BW.z0,BW.x1,BW.z1);
    /* 兩個打開的區域中間的牆：擋一排格子，門留空。門 0.8 m＝兩格，但人物的碰撞半徑 0.32 m：要剛好走在門的正中間 ±8 cm 才過得去，
       路線走在格子中心（偏 20 cm）就卡在門框（第一次測試：大門、臥室門都卡住）→ 能開的門在導航上多開一格（人的身體約 0.22 m 寬，畫面上不會穿門框）*/
    band(1.4,1.8,-3.0,-1.0); band(1.4,1.8,0.2,1.0);            // bed_w：客廳｜臥室（臥室門 z −1.0～−0.2，導航開到 0.2）
    band(-4.6,-1.8,1.0,1.4);                                    // kit_n：客廳｜廚房（窗口有吧台，不能走）
    band(-2.2,-1.8,1.0,1.4); band(-2.2,-1.8,2.6,3.0);           // kit_e：廚房｜走道（廚房門 z 1.4～2.2，導航開到 2.6）
    band(BW.x0,-1.4,3.0,3.4); band(-0.2,BW.x1,3.0,3.4);         // 南牆：走道、廚房｜樓梯平台（大門 x −1.4～−0.6，導航開到 −0.2）
    band(B.x0,-1.4,-3.4,-3.0); band(-0.2,B.x1,-3.4,-3.0);       // 北牆：客廳｜陽台（陽台門 x −1.4～−0.6，導航開到 −0.2）
    for(const [px,pz] of BW.posts) nav.blockCircle(px,pz,0.36);
    // 家具
    const rect=(x,z,w,d,ry,pad)=>nav.blockRect(x,z,w,d,-(ry||0),pad||0);
    for(const f of L.furniture){ const t=f.type;
      if(t==='fridge'||t==='bed'||t==='desk') rect(f.x,f.z,f.w,f.d,f.ry);
      else if(t==='coffeeTable') rect(f.x+0.1,f.z,0.4,f.d,0);   /* 茶几離沙發只有 0.4 m：導航只擋東邊 0.4 m（西邊那一格留給沙發前面的路；人最多碰到桌邊 20 cm）*/
      else if(t==='sofa'){ const k=f.d-0.55; rect(f.x-Math.sin(f.ry)*k/2,f.z-Math.cos(f.ry)*k/2,f.w,0.55,f.ry); }   /* 沙發只擋後面 0.55 m（坐墊前緣留給走近點）*/
      else if(t==='counterRun') band(f.x0,f.x1,f.z0+0.1,f.z1);   /* 往後收 10 cm：廚房門（z 1.4～2.2）兩側都被擋，門口要多一格才走得進去 */
      else if(t==='breakfastBar') rect((f.x0+f.x1)/2,f.z,f.x1-f.x0,f.d,0);
      else if(t==='endTable'||t==='nightstand') rect(f.x,f.z,0.48,0.48,0);
      else if(t==='armchair') rect(f.x,f.z,0.8,0.8,f.ry);
      else if(t==='ladderShelf') rect(f.x,f.z,0.5,0.32,0);
      else if(t==='tvStand') rect(f.x,f.z,f.w,0.45,f.ry);
      else if(t==='suitcase') rect(f.x+(f.cx||0),f.z+(f.cz||0),f.w,f.d,f.ry);
      else if(t==='lifeSuitcase') rect(f.x-0.21,f.z+0.065,0.95,0.99,f.ry);   /* 合租戶客廳裡沒收完的行李箱（同一個模型 US_SUITCASE）*/
      else if(t==='balconyChairs'){ for(const [cx,cz] of f.chairs) nav.blockCircle(cx,cz,0.22); nav.blockCircle(f.table.x,f.table.z,0.3); } }
    nav._cm=null; return nav; }
  /* 備用模型：地板（木紋／地毯／磁磚的顏色）、1.1 m 高的矮牆（剖面看得到格局，不擋鏡頭）、家具方塊 */
  /* 跟隨鏡頭的牆（BUG-CAM-C208-1021，BB_218：樓梯平台上鏡頭在北跑進屋裡、屋頂下，在西被平台西端的牆擋住；一進門鏡頭在東、廚房裡鏡頭在南／東，整個畫面是一面牆）——
     和教學館同一套：engine3d.js 的 followCam 查 zone.camCols[lv]，擋到就拉近到牆前、拉近時抬高，autoSwing 轉向空的那一邊。
     配置的每一面牆扣掉鏡頭看得過去的開口：開著的大門、沒有門板的廚房門、陽台門（玩家走得過去）、吧台窗口（窗台到窗楣之間）；
     關著的門、窗照樣擋。門楣以上到天花板也擋。樓梯平台西端的牆（207 的門，關著）一起擋，高到平台的屋頂。測試：node tests/us_cam_walls_unit.js */
  function aptCamCols(L,g,H){ const inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}), out=[], T=0.24;
    const box=(axis,at,a,b,y0,y1)=>{ a-=0.06; b+=0.06; if(b-a<0.05||y1-y0<0.05) return; const ax=axis==='x';   /* 兩端各多 6 cm：視線擦過牆的端點也擋得到（教學館同一個做法）*/
      const m=new THREE.Mesh(new THREE.BoxGeometry(ax?b-a:T,y1-y0,ax?T:b-a),inv); m.position.set(ax?(a+b)/2:at,(y0+y1)/2,ax?at:(a+b)/2); m.userData.noMerge=true; g.add(m); out.push(m); };
    const doorIn=(w,a,b)=>L.doors.find(d=>{ const u=w.axis==='x'?d.x:d.z, c=w.axis==='x'?d.z:d.x; return Math.abs(c-w.at)<0.15&&u>a-0.05&&u<b+0.05; });
    /* 外牆（N、S、E、W）外面還有一層壁板，高到 H+0.4（tools/blender/env_second/us_apartment.py 的 OUTER）：鏡頭比天花板高時，視線從 2.6～3.0 m 穿過去也算擋住
       （遊戲內 BB 57：平台上鏡頭轉開以後，停在屋裡貼著南牆、比牆頂高一點，畫面整個是牆頂）*/
    for(const w of L.walls[0].list){ const lo=Math.min(w.from,w.to), hi=Math.max(w.from,w.to), pass=[], Hw=/^[NSEW]$/.test(w.id||'')?H+0.4:H;
      for(const o of (w.open||[])){ const a=Math.min(o[0],o[1]), b=Math.max(o[0],o[1]), kind=o[2]||'', d=doorIn(w,a,b);
        if(kind==='passThrough') pass.push({a,b,y0:w.sill||0,y1:w.head||2.05});
        else if(d?!d.closed:!/window/i.test(kind)) pass.push({a,b,y0:0,y1:w.head||2.05}); }
      pass.sort((p,q)=>p.a-q.a); let a=lo;
      for(const p of pass){ box(w.axis,w.at,a,p.a,0,Hw); box(w.axis,w.at,p.a,p.b,0,p.y0); box(w.axis,w.at,p.a,p.b,p.y1,Hw); a=p.b; }
      box(w.axis,w.at,a,hi,0,Hw); }
    const BW=L.breezeway; if(BW) box('z',BW.x0,BW.z0,BW.z1,0,2.85);
    return out; }
  function aptFallback(L,fb){ const H=1.1; const col={wood:'#9a6a46',carpet:'#b7ada0',tile:'#d9d6cf'};
    for(const r of L.rooms){ const m=plane(fb,r.x1-r.x0,r.z1-r.z0,M(col[r.floor]||'#b8a48a'),(r.x0+r.x1)/2,(r.z0+r.z1)/2,0.005); m.userData.dyn=true; }
    for(const a of [L.balcony,L.breezeway]) plane(fb,a.x1-a.x0,a.z1-a.z0,M('#a8a49c'),(a.x0+a.x1)/2,(a.z0+a.z1)/2,0.005);
    const wm=M('#efe4cf'); for(const w of L.walls[0].list){ const segs=[]; let a=w.from; for(const o of (w.open||[]).slice().sort((p,q)=>p[0]-q[0])){ if(o[0]>a) segs.push([a,o[0]]); a=Math.max(a,o[1]); } if(w.to>a) segs.push([a,w.to]);
      for(const [s0,s1] of segs){ const len=s1-s0, c=(s0+s1)/2; const m=new THREE.Mesh(new THREE.BoxGeometry(w.axis==='x'?len:0.2,H,w.axis==='x'?0.2:len),wm); m.position.set(w.axis==='x'?c:w.at,H/2,w.axis==='x'?w.at:c); fb.add(m); } }
    const fm=M('#3a3634'), wd=M('#6a4a34'), wh=M('#e8e4dc'); const box=(x,z,w,d,h,ry,mat)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,h/2,z); m.rotation.y=ry||0; fb.add(m); };
    for(const f of L.furniture){ const t=f.type;
      if(t==='fridge') box(f.x,f.z,f.w,f.d,1.75,f.ry,wh); else if(t==='counterRun') box((f.x0+f.x1)/2,(f.z0+f.z1)/2,f.x1-f.x0,f.z1-f.z0,f.h,0,wd);
      else if(t==='breakfastBar') box((f.x0+f.x1)/2,f.z,f.x1-f.x0,f.d,f.h,0,M('#3c3a38'));
      else if(t==='sofa') box(f.x,f.z,f.w,f.d,0.8,f.ry,fm); else if(t==='armchair') box(f.x,f.z,0.8,0.8,0.8,f.ry,fm);
      else if(t==='coffeeTable') box(f.x,f.z,f.w,f.d,0.42,0,wd); else if(t==='tvStand') box(f.x,f.z,f.w,0.45,0.55,f.ry,fm);
      else if(t==='bed') box(f.x,f.z,f.w,f.d,0.55,f.ry,M('#cfcac2')); else if(t==='desk') box(f.x,f.z,f.w,f.d,0.75,f.ry,wd);
      else if(t==='nightstand'||t==='endTable') box(f.x,f.z,0.45,0.45,0.55,0,fm); else if(t==='barStool') box(f.x,f.z,0.38,0.38,0.76,0,fm); else if(t==='deskChair') box(f.x,f.z,0.46,0.46,0.46,0,fm); } }
  function aptSeason(root){ const G=G_(); const d=G&&typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day):{m:9,d:1}; const snow=(d.m===12&&d.d>=2)||(d.m>=1&&d.m<=3);   /* 窗外、陽台的雪：交換在大四上（2028/8/2～12/23，BB_215），初雪 12/2；1～3 月照舊（配置 season 原本是大三下的企劃）*/
    root.traverse(o=>{ if(o.name==='SEASON_SNOW_on') o.visible=snow; else if(o.name==='SEASON_SNOW_off') o.visible=!snow; }); }   /* 北邊的原版＋南邊轉過來的那一份 */
  /* 美國篇的季節（ART-US-SEASON；日期照 AA_213）：同一個 GLB 帶四季（tools/blender/env_second/us_season.py 的約定）。
     summer 夏末 8/2～10/8（4/16～8/1 也是）、autumn 秋天 10/9～10/31、bare 初冬 11/1～12/1（3/16～4/15 也是）、snow 雪 12/2～3/15。
     SEASON_MATS 底下每個小三角形帶一個替換材質「<原材質名>__S_<季節>」：用原材質的網格在那一季換成它；SEASON_GEO_*（userData.seasons＝'bare,snow'…）只有那幾季看得到 */
  function usSeasonKey(){ const G=G_(); const d=G&&typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day):{m:9,d:1}; const md=d.m*100+d.d;
    return (md>=1202||md<=315)?'snow':md>=1101?'bare':md>=1009?'autumn':(md>=316&&md<=415)?'bare':'summer'; }
  const SEA_MAT0=new WeakMap();   /* 網格原本的材質（不放 userData：clone 的時候 userData 會被 JSON 複製）*/
  function usSeason(root){ const key=usSeasonKey(); if(root.userData.usSeason===key) return; root.userData.usSeason=key;
    const car=root.getObjectByName('SEASON_MATS'), inCar=new Set(), sw={};
    if(car){ car.visible=false; car.traverse(o=>{ inCar.add(o); if(!o.isMesh) return; for(const m of [].concat(o.material)){ const n=(m&&m.name)||'', i=n.lastIndexOf('__S_'); if(i<0) continue; (sw[n.slice(0,i)]||(sw[n.slice(0,i)]={}))[n.slice(i+4).split('.')[0]]=m; } }); }
    root.traverse(o=>{ if(inCar.has(o)) return; const sv=o.userData&&o.userData.seasons; if(typeof sv==='string') o.visible=sv.split(',').includes(key);
      if(!o.isMesh) return; if(!SEA_MAT0.has(o)) SEA_MAT0.set(o,[].concat(o.material));
      const out=SEA_MAT0.get(o).map(m=>{ const alt=m&&sw[m.name]&&sw[m.name][key]; return alt||m; }); o.material=Array.isArray(o.material)?out:out[0]; }); }
  /* 窗外的景（停車場、對面的公寓、樹林）只做在北邊（陽台、客廳的窗）；門外的樓梯平台朝南，欄杆外面是空的（第一次遊戲內截圖：一整片橘色的背景）。
     整組轉 180° 複製到南邊（景在 z +12、地面在 y −3）*/
  /* 第二次截圖（合租戶、鏡頭在平台東端往西看）：景外面還是空白——南、西、東三面都各放三份並排（社區本來就是一排一排同樣的公寓）。
     轉 θ：南 π（景在 z +12）、西 +π/2（x −12）、東 −π/2（x +12）；並排的位移沿著景的方向 */
  function aptSouthView(root){ for(const k of ['SEASON_SNOW_on','SEASON_SNOW_off']){ const g=root.getObjectByName(k); if(!g) continue;
    for(const [ry,ax] of [[Math.PI,'x'],[Math.PI/2,'z'],[-Math.PI/2,'z']]) for(const d of [-18,0,18]){ const c=g.clone(true); c.rotation.y=ry; c.position[ax]+=d; c.userData.southView=true; g.parent.add(c); } } }
  /* 窗外的景（自發光貼圖）跟著時段變色：天空的部分是透明的（遊戲照時段畫的天空透出來），對面的公寓、停車場白天原色、黃昏偏暖、晚上暗 */
  const VT=[[5.5,[0.22,0.25,0.36]],[7,[1,1,1]],[16.5,[1,1,1]],[18.2,[1,0.82,0.68]],[19.5,[0.22,0.25,0.36]]];
  function viewTint(mats,h){ if(!mats.length) return; h=((h%24)+24)%24; let c=VT[0][1];
    if(h>=VT[VT.length-1][0]||h<VT[0][0]) c=VT[0][1]; else for(let i=0;i<VT.length-1;i++){ const [a,ca]=VT[i], [b,cb]=VT[i+1]; if(h>=a&&h<b){ const t=(h-a)/(b-a); c=ca.map((v,k)=>v+(cb[k]-v)*t); break; } }
    for(const m of mats){ m.color.setRGB(c[0],c[1],c[2]); if(m.emissive) m.emissive.setRGB(c[0],c[1],c[2]); } }
  /* 公寓單位（同一套格局的模板，LAWWW2-C 2026-10-17）：祐廷的單人戶 us_apartment、學姊她們的 C 棟合租戶 us_shared。
     o：id、name、layout()、glb、exitSpawn()（「出門」到社區的哪裡）、look（冰箱、爐子的字）、tag（給交換系統的互動 id）。
     家具的互動點只做在走得進去的房間（合租戶的臥室 A、B 門關著：床、書桌不能用）*/
  function aptZone(o){ return { id:o.id, name:o.name, indoor:true, camDist:3.6, seeThru:true, build(E){ const L=o.layout(), H=L.ceilY||2.6;
    const openRoom=id=>{ const r=L.rooms.find(q=>q.id===id); return !r||(r.walk!==false&&!APT_CLOSED.has(r.id)); };
    const z=Z3.room(E,{w:10.4,d:10.4,h:H,windows:false,warm:true,wallColor:'#efe4cf',floorTex:W3.stoneTex('#cfb796'),spawn:Object.assign({},L.spawns.fromOutside)});   /* room() 的框 x、z −5.2～5.2 蓋住整戶＋陽台＋樓梯平台（室內鏡頭照 bounds 夾住）*/
    const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    for(const w of z.walls) w.visible=false; z.walls.length=0;   /* room() 的四面大牆不是這間的形狀：備用模型用配置的矮牆 */
    z.nav=aptNav(L); aptFallback(L,fb);
    z.camCols=[aptCamCols(L,g0,H)];   /* 跟隨鏡頭撞到牆就拉近、轉開（BUG-CAM-C208-1021）*/
    // 燈：客廳吊扇的燈、臥室吸頂燈、廚房（白天弱、晚上亮）
    const lamps=[]; for(const [x,zz] of [[-1.6,-1.0],[3.2,-1.0],[-3.2,2.0],[-1.0,2.0],[0,4.0]]){ const l=new THREE.PointLight(0xffe2bc,2,7,2); l.position.set(x,H-0.35,zz); l.userData.on=9; l.userData.off=2; g0.add(l); lamps.push(l); }
    let glow=[]; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    let views=[]; const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); setGlow(glow,night(h)?1:0.15); viewTint(views,h); };
    // 互動點
    const IT=E.interactables; z.seats=[]; const seat=(x,zz,yaw,label,extra,lift)=>{ const s={x,z:zz,yaw,lv:0}; if(lift) s.lift=lift; z.seats.push(s); IT.push(Object.assign({x,z:zz,radius:0.8,lv:0,label,seat:s},extra||{})); };
    for(const f of L.furniture){ const t=f.type;
      if(f.room&&!openRoom(f.room)) continue;
      if(t==='barStool') seat(f.x,f.z,f.ry||0,'坐在吧台',o.bar||null,(f.seatY||0.76)-0.45);   /* 高腳椅：椅面 0.76（一般椅子 0.45），人往上抬 0.31 */
      /* 沙發和茶几中間只有 0.4 m（照片的擺法）、單人沙發前面是茶几的角、書桌椅後面是床和行李箱：「坐下」照預設會走到座位前面 0.5 m（被家具擋住），
         所以都指定走近點 ap（和 Café 的沙發同一個做法），互動點也放在那裡 */
      else if(t==='sofa'){ const s={x:f.x,z:f.z,yaw:f.ry,lv:0,ap:[-3.8,f.z]}; z.seats.push(s); IT.push({x:s.ap[0],z:s.ap[1],radius:0.9,lv:0,label:'坐在沙發上',seat:s}); }
      else if(t==='armchair'){ const s={x:f.x,z:f.z,yaw:f.ry,lv:0,ap:[-2.2,-2.2]}; z.seats.push(s); IT.push({x:s.ap[0],z:s.ap[1],radius:0.9,lv:0,label:'坐在單人沙發上',seat:s}); }
      else if(t==='deskChair'){ const s={x:f.x,z:f.z,yaw:f.ry,lv:0,ap:[2.55,-2.0]}; z.seats.push(s); IT.push({x:f.x,z:f.z,radius:0.8,lv:0,label:'坐在書桌前',seat:s,deskStudy:true}); }
      else if(t==='bed') IT.push({x:f.x-f.d/2-0.45,z:f.z,radius:0.9,lv:0,label:'睡覺',sleep:true});   /* 床尾朝西（x 2.93）：站在床尾 */
      /* 冰箱、爐子（ART-US2-FIX-1018，BB-C 10-18：站在冰箱前出「看爐子」）：窄廚房站得住的只有 z 1.8～2.2 一條（0.4 m），爐子就在冰箱旁邊——
         冰箱的點放在廚房西端（冰箱門前 x+0.7）、爐子的點放在爐子東緣、水槽旁（x+0.75, z−0.65）：分界在 x≈−3.05，冰箱門前站得住的位置都出冰箱（tests/nav_us_unit.js）*/
      else if(t==='fridge') IT.push(Object.assign({x:f.x+0.7,z:f.z,radius:0.7,lv:0},o.fridge||{label:'打開冰箱',look:lookText('冰箱。')}));
      /* 爐子的互動點往東 0.45 m（爐子東半邊、水槽旁）：冰箱的點在 (x+0.75)、爐子原本在 (x, z−0.75)，兩個只差 0.16 m，站哪裡都只出得了一個（瀏覽器流程：合租戶的輪值表點不到）*/
      else if(t==='range') IT.push(Object.assign({x:f.x+0.75,z:f.z-0.65,radius:0.75,lv:0},o.range||{label:'看爐子',look:lookText('電爐和烤箱，上面是微波爐。')})); }
    for(const d of L.doors) if(d.closed){ const ax=d.axis==='z'; const side=d.breezeway?1:-1;   /* 門口站哪一邊：衛浴、衣物間從臥室（北邊）；衣帽櫃、洗衣機、臥室 A／B 從走道、客廳（西邊）；隔壁從平台（東邊）*/
      if(d.id==='bath'||d.id==='closet'){ const ab=L.rooms.find(q=>q.id==='bedroom'||q.id==='bedB'); if(ab&&!openRoom(ab.id)) continue; }   /* 衛浴、衣物間從臥室進：臥室關著（合租戶的 B）就不做 */
      IT.push({x:ax?d.x+side*0.45:d.x,z:ax?d.z:d.z+side*0.45,radius:0.75,lv:0,label:d.label,look:d.closed}); }
    { const X=L.exit; IT.push({x:X.x-0.2,z:X.z,radius:X.r,lv:0,label:'出門',exit:{to:'us_outside',spawn:Object.assign({},o.exitSpawn())}}); }   /* 平台東端的樓梯（配置寫「下樓（停車場）」）；字照 LAWWW-C 的最小流程（src/exchange3d.js：公寓「出門」、社區「回公寓」）*/
    // 正式模型
    z.us2On=false; z.us2=on=>{ z.us2On=!!on; };   /* 正式模型還沒載入時先記著，載入後照這個開關 */
    z.formal=false; if(has(o.glb)) ASSETS.loadOne(o.glb).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
      Z3.attachRoomGLB(z,g0,fb,root); aptSouthView(root); aptSeason(root);
      /* 門牌跟著所在的牆淡出（BB_218 C208：鏡頭在臥室 B 那一側時門板淡出、「B」門牌浮在半空）：會淡出的內牆（fade、不是外牆 N／S／W／E）上的 PLATE_FACE_door_* 放進 winParts——
         和窗的零件同一套：鏡頭和玩家在牆的兩邊就藏起來（partition）。門上的外套、掛勾、白板、貼紙在 GLB 裡已經是 WALL_<牆>_deco_*（LAWWW2 us_apartment.py） */
      { root.updateMatrixWorld(true); const inner=L.walls[0].list.filter(w=>w.fade&&!/^[NSWE]$/.test(w.id)); const p=new THREE.Vector3();
        root.traverse(o=>{ if(!o.isMesh||!/^PLATE_FACE_door_/.test(o.name)) return; new THREE.Box3().setFromObject(o).getCenter(p);   /* 頂點是世界座標、物件原點在 (0,0,0)：用網格的中心 */
          for(const w of inner){ const c=w.axis==='z'?p.x:p.z, u=w.axis==='z'?p.z:p.x; if(Math.abs(c-w.at)<0.1&&u>Math.min(w.from,w.to)&&u<Math.max(w.from,w.to)){ (z.winParts=z.winParts||[]).push({obj:o,at:p.clone(),dir:new THREE.Vector3(w.dir[0],w.dir[1],w.dir[2]),partition:true}); break; } } }); }
      /* 南牆＝樓梯平台那一面（WALL_S_*，props inside）：原本一律不淡出——玩家在屋裡、鏡頭退到平台那一側時畫面被壁板擋住（合租戶截圖：整個畫面是牆）。
         改成：玩家在屋裡（z < 南牆）而且鏡頭在南牆外面才淡出，門牌、門口的壁燈一起藏；玩家在平台上時照舊是實牆（看得到大門）*/
      { const SW=L.walls[0].list.find(w=>w.id==='S'), sAt=SW?SW.at:3.0, sw=z.walls.filter(w=>w.userData&&w.userData.inside); for(const w of sw) z.walls.splice(z.walls.indexOf(w),1);
        const extra=[]; root.traverse(q=>{ if(q.name==='PLATE_FACE_door_front'||q.name==='usa_sconce') extra.push(q); });
        if(sw.length){ const fade0=z.fadeWalls; z.fadeWalls=function(cam,pp){ fade0.call(this,cam,pp); const cut=!!pp&&pp.z<sAt-0.1&&cam.position.z>sAt+0.1; for(const w of sw){ w.material.opacity=cut?0.12:1; w.material.depthWrite=!cut; } for(const q of extra) q.visible=!cut; }; } }
      /* 劇情的道具（合租戶的 EVENT_US2：鍋、泡麵、碗、紅筆圈滿的報告；BB_217）：平常藏著，交換系統演出時 z.us2(true) 打開 */
      const ev=root.getObjectByName('EVENT_US2'); if(ev) ev.visible=!!z.us2On; z.us2=on=>{ z.us2On=!!on; if(ev) ev.visible=!!on; };
      root.traverse(o=>{ if(o.isMesh&&/^PLATE_FACE/.test(o.name)){ const t=(o.userData&&o.userData.text)||((/(\d{3})/.exec(o.name)||[])[1])||''; paintPlate(o,t); } });
      /* 景的貼圖天空是透明的（glTF BLEND）：半透明不寫深度，引擎的天空球最後畫、會整片蓋掉——改成鏤空（alphaTest），景寫深度、天空只從挖空的地方透出來 */
      const vm=new Set(); root.traverse(q=>{ if(q.isMesh&&/^usa_view/.test(q.name)) vm.add(q.material); }); views=[...vm]; for(const m of views){ m.transparent=false; m.alphaTest=0.5; m.depthWrite=true; m.needsUpdate=true; }
      glow=glowMats(root,/^US_glow/); const G=G_(); if(G) z.applyTime(G.hour,G.weather);
      /* 屋頂（usa_roof：y 2.85、雙面，蓋住陽台到樓梯平台）：室內是剖面視角，鏡頭會在天花板上面往下看——屋頂要在鏡頭比它高的時候藏起來
         （第一次遊戲內截圖：平台上整個畫面是一片灰＝從上面看到屋頂）。天花板 usa_ceil 是單面朝下，本來就看不到 */
      /* 吊扇、吸頂燈也一樣（第二次截圖：坐在沙發上，鏡頭在天花板上面，整個畫面被吊扇的葉片擋住）*/
      const roof=root.getObjectByName('usa_roof'), hang=[]; root.traverse(o=>{ if(/^US_CEILING(FAN|LIGHT)/.test(o.name||'')) hang.push(o); });
      const up0=z.update; z.update=function(dt,E2){ if(up0) up0.call(z,dt,E2); const cy=E2&&E2.camera?E2.camera.position.y:0; if(roof) roof.visible=cy<=2.8; for(const o of hang) o.visible=cy<=2.5; }; }).catch(e=>console.warn('美國公寓正式模型載入失敗，用程序化備用模型',e));
    return z; } }; }
  /* C 棟 208 的樓梯間（社區的 C 棟正面朝西、樓梯間在局部 u＝2）：樓梯口、從樓梯下來站的地方（us_community_layout_gen.py 的 W_ 同一個換算）*/
  const C208={foot:{x:27.4,z:8.0,r:1.0},out:{x:25.5,z:8.0,yaw:-Math.PI/2}};
  const us_apartment=aptZone({ id:'us_apartment', name:'美國的公寓', glb:'bldg.us_apartment', layout:()=>APT(), exitSpawn:()=>US_COMMUNITY_LAYOUT.spawn_home });
  /* 學姊她們的 C 棟三人合租戶（BB_215：US2 9/13 唯一要玩家自己走去的必要劇情；配置 src/data/us_shared_layout.js 從單人戶轉出來）。
     usShared：給交換系統（LAWWW-C）接 US2 的演出（爐子＝煮泡麵、冰箱的輪值表）*/
  const us_shared=aptZone({ id:'us_shared', name:'C 棟 208（學姊她們那一戶）', glb:'bldg.us_shared', layout:()=>US_SHARED_LAYOUT, exitSpawn:()=>C208.out,
    fridge:{label:'看冰箱上的輪值表',usShared:'chores',look:lookText('冰箱門上的輪值表：倒垃圾、洗碗、買衛生紙，A、B、C 三格輪。')},
    range:{label:'看爐子',usShared:'stove',look:lookText('電爐和烤箱，上面是微波爐。')},
    bar:{usShared:'bar'} });   /* BB_217：US2 祐廷坐窗口吧台外側的高腳椅，「坐下」＝演出開始（交換系統攔 usShared:'bar'）*/

  // =================== 戶外：公寓社區 us_outside（主街 us_street 之後也可以用同一套）===================
  const CAR_DIMS={car_sedan:[4.88,1.84],car_suv:[4.6,1.85],car_pickup:[5.9,2.03],car_hatch:[4.4,1.8],car_minivan:[5.15,2.0]};   /* us_cars.json 的 dims：[車長, 車寬]；車頭朝 +z */
  const US_LINK={x:-35.0,z:0,yaw:Math.PI/2};   /* 從社區入口（西邊的車道）走進來、面向東：登機抵達、從超市回來都到這裡；離「出門」3.8 m（−37.5 的時候一到就在「出門」的範圍裡）*/
  const MS=()=>typeof US_MARKET_STREET_LAYOUT!=='undefined'?US_MARKET_STREET_LAYOUT:null;   /* 超市街（US-MARKET-STREET）：有這份配置就把超市、亞洲超市、社區的「出門」接過去；沒有就照舊直接進店 */
  /* 戶外區域：配置的 bounds、blocks（長方形，why）、cars；正式模型 glb＋bldg.us_cars（車照配置停）。
     o.interact(E,L,IT)：這一區自己的互動點。建築本體（why 開頭是 building）＝鏡頭碰撞（加高到屋簷 6 m）＋備用模型的方塊 */
  /* 擋住玩家時網點透空的材質（戶外區域的正式模型，照區域 id；和台灣的電線桿、行道樹同一套 engine3d.js updateSeeThrough）。
     超市街（US-PATROL-1021，LAWWW2 10-22 巡場景）：從社區搭公車來，下車的地方 (−22.6, 12.9) 面向北、鏡頭在後面，站牌柱剛好在鏡頭和人中間——
     一根直的柱子把人切成兩半。模型裡的金屬桿（停車場燈桿、路燈、號誌桿、站牌柱、公車亭的框）都是 usms_vc_metal
     （us_market_street.py 匯出時把純色材質轉成頂點色）。測試：node tests/us_ms_seethru_unit.js */
  const SEE_MATS={us_market_street:/^usms_vc_metal$/, us_campus:/^(usu_steel|usu_shelter_glass|usu_shelter_roof)$/};   /* 美國校園：公車站候車亭（框、玻璃、屋頂）、站牌柱擋人時網點透空（LAWWW2 10-22，j38b）*/
  function outdoorZone(o){ return { id:o.id, name:o.name, indoor:false, cityLight:o.cityLight||0.3, size:o.size, camDist:o.camDist||6.0, noSkyline:o.noSkyline!==false, build(E){   /* noSkyline：不畫引擎的遠景剪影（台北的山和城市大樓；US-CAMPUS-WIRE-1018）*/ const L=o.layout(), B=L.bounds;
    const g=new THREE.Group(); const nav=new E3.NavGrid(B.x1-B.x0,B.z1-B.z0,0.5,B.x0,B.z0);
    nav.blockOutside(B.x0+0.5,B.z0+0.5,B.x1-0.5,B.z1-0.5);
    for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.5),Math.max(b.z1-b.z0,0.5),0,0);
    const OWN=c=>typeof US_TRAFFIC!=='undefined'&&US_TRAFFIC.owns&&US_TRAFFIC.owns(L,c);   /* 超市街馬路上等紅燈的車歸 src/us_traffic3d.js 開（US-MARKET-CROWD-1021，LAWWW）：這裡不畫、不擋導航 */
    for(const c of (L.cars||[])){ if(OWN(c)) continue; const d=CAR_DIMS[c.kind]||[4.8,1.9]; nav.blockRect(c.x,c.z,d[1]+0.1,d[0]+0.1,-c.yaw,0); }
    nav._cm=null;
    const bld=L.blocks.filter(b=>/^building/.test(b.why));
    for(const b of bld){ const m=new THREE.Mesh(new THREE.BoxGeometry(b.x1-b.x0,6.0,b.z1-b.z0),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set((b.x0+b.x1)/2,3.0,(b.z0+b.z1)/2); g.add(m); E.colliders.push(m); }
    // 備用模型：草地、柏油（配置有 lot／road 就鋪）、建築的方塊、車的方塊
    const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; g.add(fb);   /* dyn：引擎載入區域時會把靜態網格合併（P3.mergeStatic），合併後就藏不掉（第一次遊戲內截圖：正式的車和備用的車方塊疊在一起）*/
    plane(fb,B.x1-B.x0+40,B.z1-B.z0+40,new THREE.MeshStandardMaterial({map:tiled(W3.grassTex(),(B.x1-B.x0)/3,(B.z1-B.z0)/3),roughness:0.95}),(B.x0+B.x1)/2,(B.z0+B.z1)/2,0);
    const asph=(x0,x1,z0,z1)=>{ const t=tiled(W3.asphaltTex(),(x1-x0)/4,(z1-z0)/4); t.userData.asphalt=true; plane(fb,x1-x0,z1-z0,new THREE.MeshStandardMaterial({map:t,roughness:0.9}),(x0+x1)/2,(z0+z1)/2,0.01); };
    if(L.lot) asph(L.lot.x0,L.lot.x1,L.lot.z0,L.lot.z1); if(L.road) asph(B.x0,B.x1,L.road.z0,L.road.z1);
    const sid=M('#8a8272'); for(const b of bld){ const m=new THREE.Mesh(new THREE.BoxGeometry(b.x1-b.x0,6.0,b.z1-b.z0),sid); m.position.set((b.x0+b.x1)/2,3.0,(b.z0+b.z1)/2); fb.add(m); }
    const carFb=new THREE.Group(); fb.add(carFb); for(const c of (L.cars||[])){ if(OWN(c)) continue; const d=CAR_DIMS[c.kind]||[4.8,1.9]; const m=new THREE.Mesh(new THREE.BoxGeometry(d[1],1.4,d[0]),M(c.color,{rough:0.4})); m.position.set(c.x,0.7,c.z); m.rotation.y=c.yaw; carFb.add(m); }
    o.interact(E,L,E.interactables);
    /* 路燈的地面光圈（US-MS-NIGHT-1021，LAWWW2：20:00 超市街停車場只有燈頭亮、地上一片黑）：和溫州街、校園同一套 E.lampGlows——入夜才開；
       區域定義的 lampPools(L) 給每個燈頭的位置、光圈半徑。放在自己的 dyn 群組（引擎合併靜態網格時不動它）*/
    if(o.lampPools){ const pg=new THREE.Group(); pg.name='lamp_pools'; pg.userData.dyn=true; g.add(pg);
      for(const p of o.lampPools(L)){ const pool=new THREE.Mesh(new THREE.CircleGeometry(p.r,24),new THREE.MeshBasicMaterial({map:Z3.glowTex(),color:p.color||0xfff1dc,transparent:true,opacity:p.op||0.3,depthWrite:false,blending:THREE.AdditiveBlending}));
        pool.rotation.x=-Math.PI/2; pool.position.set(p.x,0.04,p.z); pool.visible=false; pool.name='lamp_pool'; pg.add(pool); E.lampGlows.push(pool); } }
    // 時間：路燈、樓梯間壁燈晚上亮；店裡的燈白天也亮一點；停著的車燈一直關著
    let lampGlow=[], shopGlow=[], formalRoot=null; const zoneTime=(h)=>{ setGlow(lampGlow,night(h)?1:0); setGlow(shopGlow,night(h)?1:0.55); if(formalRoot) usSeason(formalRoot); };
    const zone={group:g,nav,spawn:Object.assign({},o.spawn(L)),lamps:[],buildings:[],applyTimeOutdoor:zoneTime,onLamps(on){}};
    if(has(o.glb)) ASSETS.loadOne(o.glb).then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true); root.traverse(q=>{ if(q.isMesh){ q.castShadow=true; q.receiveShadow=true; if(q.material&&/asphalt/.test(q.material.name||'')&&q.material.map) q.material.map.userData.asphalt=true; } }); g.add(root);
      for(const q of fb.children) if(q!==carFb) q.visible=false; lampGlow=glowMats(root,/^GLOW_.*lamp/); shopGlow=glowMats(root,/^GLOW_.*interior/); usSeason(root); formalRoot=root;
      { const sm=SEE_MATS[o.id]; if(sm) root.traverse(q=>{ if(!q.isMesh) return; for(const m of [].concat(q.material)){ if(!m||!sm.test(m.name||'')||m.userData.seeThrough) continue; m.userData.seeThrough=true; if(E.patchSeeThrough) E.patchSeeThrough(m); } }); } const G=G_(); if(G) zoneTime(G.hour); }).catch(e=>console.warn(o.name+' 正式模型載入失敗，用程序化備用模型',e));
    if(L.cars&&L.cars.length&&has('bldg.us_cars')) ASSETS.loadOne('bldg.us_cars').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const src=c.scene, paint={};
      const cg=new THREE.Group(); cg.name='us_cars'; let n=0;
      for(const car of L.cars){ if(OWN(car)) continue; const node=src.getObjectByName(car.kind); if(!node) continue; const q=node.clone(true); q.position.set(car.x,0,car.z); q.rotation.set(0,car.yaw,0);
        q.traverse(r=>{ if(!r.isMesh) return; r.castShadow=true; const ms=[].concat(r.material).map(m=>{ if(m&&m.name==='car_paint'){ return paint[car.color]||(paint[car.color]=Object.assign(m.clone(),{color:new THREE.Color(car.color)})); } if(m&&/^GLOW_car/.test(m.name||'')){ if(car.waiting) return m; const k='off_'+m.name; return paint[k]||(paint[k]=Object.assign(m.clone(),{emissiveIntensity:0})); } return m; });   /* 停著的車燈關著；等紅燈的車（waiting，超市街路口）頭燈、煞車燈亮著 */ r.material=Array.isArray(r.material)?ms:ms[0]; });
        cg.add(q); n++; }
      if(n){ g.add(cg); carFb.visible=false; } }).catch(e=>console.warn('美式汽車正式模型載入失敗，用方塊',e));
    return zone; } }; }
  const us_outside=outdoorZone({ id:'us_outside', name:'公寓社區（美國）', size:[84,64], glb:'bldg.us_community', layout:()=>US_COMMUNITY_LAYOUT, spawn:L=>L.spawn_home,
    lampPools:L=>(L.props||[]).filter(t=>t.type==='lamp').map(t=>({x:t.x,z:t.z+0.9,r:4.5,op:0.3})),   /* 燈頭照 us_community.py：桿子往 +z 0.9 m、高 6 m */
    interact(E,L,IT){ const H_=L.to_home, X=L.exit_west;
      IT.push({x:H_.x,z:H_.z,radius:H_.r,lv:0,label:'回公寓',exit:{to:'us_apartment',spawn:Object.assign({},APT().spawns.fromOutside)}});   /* 配置寫「上樓（213）」：公寓那份的門牌是自己 214、隔壁 213（兩份不一致，先不寫號碼）；字照 LAWWW-C 的最小流程 */
      /* 「出門」（LAWWW-C 的最小可玩流程：外出 → 回公寓睡覺）：usGoOut＝交換系統可以攔下來換成自己的外出；現在去超市（BB_215：超市一定要、主街不需要；
         真的要搭公車，公車站先不做 3D）*/
      IT.push({x:X.x+1.2,z:X.z,radius:X.r,lv:0,label:'出門（去超市）',usGoOut:true,exit:MS()?{to:'us_market_street',spawn:Object.assign({},MS().spawn_bus)}:{to:'us_market',spawn:Object.assign({},US_MARKET_LAYOUT.spawn)}});   /* US-MARKET-STREET：搭公車到超市街（北側人行道的公車站），走過停車場進草原超市 */
      /* 搭公車去學校（US-CAMPUS-WIRE-1018）：社區出口旁邊（和「出門（去超市）」相距 3.6 m、範圍不重疊）→ 美國校園的公車站；usBus＝交換系統可以攔下來換成自己的字卡、時間 */
      if(typeof US_CAMPUS_LAYOUT!=='undefined') IT.push({x:X.x+1.2,z:X.z-3.6,radius:1.2,lv:0,label:'搭公車（去學校）',usBus:'campus',exit:{to:'us_campus',spawn:Object.assign({},US_CAMPUS_LAYOUT.spawn_bus)}});
      for(const p of L.props){ if(p.type==='mailboxes') IT.push({x:p.x,z:p.z+1.1,radius:1.0,lv:0,label:'看信箱',look:lookText('社區的集中信箱。')}); }
      /* C 棟 208（學姊她們那一戶）：樓梯口上樓。什麼時候可以去（US2 9/13 被叫去吃泡麵……）由交換系統決定（usShared＝攔下來換成自己的演出）*/
      IT.push({x:C208.foot.x,z:C208.foot.z,radius:C208.foot.r,lv:0,label:'上樓（C 棟 208）',usShared:'door',exit:{to:'us_shared',spawn:Object.assign({},US_SHARED_LAYOUT.spawns.fromOutside)}});
      /* 會所（社區辦公室＋交誼廳；BB_215「社區走到會所門口」）：停車場南邊、門廊下。裡面不做 3D（會所的晚餐是 2D）；usClub＝交換系統可以攔下來換成自己的演出 */
      if(L.clubhouse){ const D=L.clubhouse.door; IT.push({x:D.x,z:D.z,radius:D.r,lv:0,label:D.label,usClub:'door',look:lookText('社區的會所：辦公室和交誼廳。')}); } } });
  // =================== 美國校園 us_campus（法學院前的人行道、公車站、校門；SCN-US-02 v3；US-CAMPUS-WIRE-1018）===================
  /* 公車站（從社區搭公車來）→ 法學院前的人行道 → 台階下「進教室」「進圖書館」；校門「往活動中心」這一版關著。
     老校區、樹林、對面的房子都是背景（走不到，配置的 blocks 擋住）。正式模型 bldg.us_campus（tools/blender/env_second/us_campus.py，配置同一份；四季照 usSeason）。
     進教室：usClass＝交換系統接（美國的課是 2D 課堂，下課回到 spawn_class_out）；沒有接的時候只說一句 */
  const LOOK_CAMPUS={class:'法學院的台階。上去的走廊兩邊都是教室，門上貼著課號和上課時間。',gate:'往學生活動中心的路，兩旁是一排老橡樹。（這一版還沒開放。）'};
  const us_campus=outdoorZone({ id:'us_campus', name:'校園（美國）', size:[180,86], glb:'bldg.us_campus', layout:()=>US_CAMPUS_LAYOUT, spawn:L=>L.spawn_bus,
    interact(E,L,IT){ for(const q of L.interact){ const it={x:q.x,z:q.z,radius:q.r,lv:0,label:q.label};
        if(q.id==='bus') it.exit={to:'us_outside',spawn:Object.assign({},US_LINK)};                                         /* 回社區的入口（和登機抵達、從超市回來同一個點）*/
        else if(q.id==='library') it.exit={to:'us_lawlib',spawn:Object.assign({},US_LAWLIB_LAYOUT.spawn)};
        else if(q.id==='class'){ it.usClass='law'; it.look=lookText(LOOK_CAMPUS.class); }
        else if(q.id==='gate'){ it.usGate='union'; it.look=lookText(LOOK_CAMPUS.gate); }
        else it.look=lookText(q.label+'。');
        IT.push(it); } } });
  // =================== 法學院圖書館 us_lawlib（SCN-US-LIB；US-CAMPUS-WIRE-1018）===================
  /* 一樓：大門、服務台、中庭長桌（坐下可以讀書）、窗前短桌、圓桌、軟椅；樓上書庫這一版關著（樓梯口紅絨繩）。
     正式模型 bldg.us_lawlib（tools/blender/env_second/us_lawlib.py，配置同一份）。一樓走廊的天花板（樓板底）4.2 m：鏡頭在這下面（camDist 5）；四面牆各自淡出（WALL_<面>_*）*/
  const LOOK_LIB={desk:'服務台。館員在蓋還書章，旁邊一盒鉛筆，寫著可以自己拿。',stair_rope:'樓梯口拉著紅絨繩，掛著一張牌子：樓上書庫整理中，暫停開放。',window:'彩色玻璃窗，拼的是一架天平和幾本書。有幾片玻璃的顏色比較淡。',stacks:'書架。一整排深紅色書背的判例彙編，編號一路排到最裡面。',catalog:'查詢電腦。螢幕還停在前一個人查的那一頁：一本英國的契約法。'};
  const us_lawlib={ id:'us_lawlib', name:'法學院圖書館（美國）', indoor:true, camDist:US_LAWLIB_LAYOUT.cam_dist||5.0, build(E){ const L=US_LAWLIB_LAYOUT, Bd=L.bounds, H=4.2;
    const W=Math.max(-Bd.x0,Bd.x1)*2+3, D=Math.max(-Bd.z0,Bd.z1)*2+3;   /* 鏡頭可以退到牆外 1.5 m（牆淡出），不會卡在牆面上 */
    const z=Z3.room(E,{w:W,d:D,h:H,windows:false,warm:true,wallColor:'#e9e3d4',floorTex:W3.stoneTex('#5f7f93'),spawn:{x:L.spawn.x,z:L.spawn.z,yaw:L.spawn.yaw}});
    const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    for(const w of z.walls) w.visible=false; z.walls.length=0;
    const nav=new E3.NavGrid(Bd.x1-Bd.x0,Bd.z1-Bd.z0,0.4,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
    for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.4),Math.max(b.z1-b.z0,0.4),0,0);
    nav._cm=null; z.nav=nav; z.bounds={w:W,d:D};
    // 備用模型：地板、桌子、書架、服務台的方塊
    plane(fb,Bd.x1-Bd.x0,Bd.z1-Bd.z0,M('#5f7f93'),0,0,0.005); const bm=M('#b9a486'); for(const b of L.blocks){ const h=/stacks|column|stair/.test(b.why)?2.2:(/desk|catalog/.test(b.why)?1.0:0.75); const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
    const lamps=[]; for(const [x,zz] of [[-8,-5],[8,-5],[-8,5],[8,5],[0,0]]){ const l=new THREE.PointLight(0xffefd6,3,14,2); l.position.set(x,H-0.5,zz); l.userData.on=6; l.userData.off=3.5; g0.add(l); lamps.push(l); }
    let glow=[]; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); setGlow(glow,1); };   /* 檯燈、嵌燈整天都亮 */
    const IT=E.interactables; z.seats=[];
    for(const s of L.seats){ const st={x:s.x,z:s.z,yaw:s.yaw,lv:0}; if(s.ap) st.ap=s.ap; z.seats.push(st);   /* ap：椅子後面是方柱的那一張，走近點另外給（配置算好的）*/ IT.push(Object.assign({x:s.x,z:s.z,radius:0.7,lv:0,seat:st},s.kind==='lounge'?{label:'坐在軟椅上'}:{label:'坐下來讀書',study:true})); }   /* study：坐下的選單有「讀書」（和總圖一樣）*/
    for(const q of L.interact) IT.push({x:q.x,z:q.z,radius:q.r,lv:0,label:q.label,usLib:q.id,look:lookText(LOOK_LIB[q.id]||q.label+'。')});
    for(const X of L.exits){ const sp=Object.assign({},(X.to==='us_campus'&&US_CAMPUS_LAYOUT[X.spawn])||US_CAMPUS_LAYOUT.spawn_library_out); IT.push({x:X.x,z:X.z,radius:X.r,lv:0,label:X.label,exit:{to:X.to,spawn:sp}}); }
    z.formal=false; if(has('bldg.us_lawlib')) ASSETS.loadOne('bldg.us_lawlib').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
      root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true;
      glow=glowMats(root,/^GLOW_/); const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('法學院圖書館正式模型載入失敗，用程序化備用模型',e));
    return z; } };
  // =================== 超市 us_market（草原超市 Prairie Basket；US1 抵達那天、之後的日常採買）===================
  const AISLE_ZH={cereal:'早餐穀片',snacks:'零食',drinks:'飲料',canned:'罐頭',pasta:'義大利麵、米',baking:'烘焙材料',household:'日用品',personal:'清潔、個人用品'};
  /* 草原超市的四面外牆當跟隨鏡頭的牆（US-PATROL-1021，LAWWW2 10-22 巡場景）：一進門（入口 IN 門內 2.4 m、面向北），鏡頭在南、camDist 5 m，退到正面玻璃外面，
     隔著門框、門楣往裡看——畫面上橫著兩條黑帶、人被擋住。正面的門洞也擋（走到門口就換區域，鏡頭不必出去）；和公寓、教學館、機場同一套 zone.camCols：
     engine3d.js 的 followCam 擋到就拉近、抬高（最多 0.9 m，天花板 6.4 m），autoSwing 轉向空的那一邊。測試：node tests/us_market_cam_unit.js */
  function usmCamCols(Bd,g,H){ const inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}), out=[], T=0.24;
    const box=(x0,x1,z0,z1)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,H,z1-z0),inv); m.position.set((x0+x1)/2,H/2,(z0+z1)/2); m.userData.noMerge=true; g.add(m); out.push(m); };
    box(Bd.x0-T,Bd.x1+T,Bd.z0-T/2,Bd.z0+T/2); box(Bd.x0-T,Bd.x1+T,Bd.z1-T/2,Bd.z1+T/2); box(Bd.x0-T/2,Bd.x0+T/2,Bd.z0,Bd.z1); box(Bd.x1-T/2,Bd.x1+T/2,Bd.z0,Bd.z1);
    return out; }
  const us_market={ id:'us_market', name:'草原超市（美國）', indoor:true, camDist:5.0, build(E){ const L=US_MARKET_LAYOUT, Bd=L.bounds, H=L.h||6.4;
    const W=Math.max(-Bd.x0,Bd.x1)*2, D=Math.max(-Bd.z0,Bd.z1)*2;
    const z=Z3.room(E,{w:W,d:D,h:H,windows:false,cool:true,wallColor:'#eceae4',floorTex:W3.stoneTex('#d9d6cc'),spawn:{x:L.spawn.x,z:L.spawn.z,yaw:L.spawn.yaw}});
    const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    for(const w of z.walls) w.visible=false; z.walls.length=0;   /* 正式模型沒有會淡出的牆（挑高 6.4 m，鏡頭在天花板下）*/
    const nav=new E3.NavGrid(Bd.x1-Bd.x0,Bd.z1-Bd.z0,0.5,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
    for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.5),Math.max(b.z1-b.z0,0.5),0,0);
    nav._cm=null; z.nav=nav; z.bounds={w:W,d:D};
    z.camCols=[usmCamCols(Bd,g0,H)];   /* 跟隨鏡頭撞到外牆就拉近（一進門鏡頭不會退到正面玻璃外面）*/
    // 備用模型：地板、貨架、冷藏櫃的方塊
    plane(fb,Bd.x1-Bd.x0,Bd.z1-Bd.z0,M('#d9d6cc'),0,0,0.005); const bm=M('#c9c6be'); for(const b of L.blocks){ const h=/gondola|freezer|dairy|meat|deli|produce wall/.test(b.why)?1.9:1.0; const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
    const lamps=[]; for(let i=-1;i<=1;i++) for(const zz of [-8,4]){ const l=new THREE.PointLight(0xf8f6ee,4,24,2); l.position.set(i*14,H-1.0,zz); l.userData.on=9; l.userData.off=6; g0.add(l); lamps.push(l); }
    let glow=[]; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); setGlow(glow,1); };   /* 冷藏櫃、收銀台的燈、螢幕整天都亮 */
    const IT=E.interactables;
    for(const q of L.interact) IT.push({x:q.x,z:q.z,radius:q.r,lv:0,label:q.label,usMarket:q.id,look:lookText(q.label+'。')});   /* usMarket＝互動的 id（serviceDesk、dairy……）：採買、US1 的「看蛋的日期」由交換系統（LAWWW-C）接 */
    for(const a of L.aisle_signs){ const gd=L.gondolas.find(q=>q.aisle===a.aisle); const cat=gd?AISLE_ZH[gd.cat]||gd.cat:''; IT.push({x:a.x,z:a.z,radius:1.0,lv:0,label:'第 '+a.aisle+' 走道：'+cat,usMarket:'aisle_'+(gd?gd.cat:a.aisle),look:lookText(cat+'。')}); }
    { const X=L.exit; IT.push({x:X.x,z:X.z-0.4,radius:X.r,lv:0,label:X.label,exit:MS()?{to:'us_market_street',spawn:Object.assign({},MS().spawn_pb_out)}:{to:'us_outside',spawn:Object.assign({},US_LINK)}}); }   /* 從 OUT 門出去到停車場（US-MARKET-STREET）；沒有超市街時照舊回社區入口（真的要搭公車）*/
    /* 對面的小亞洲超市（使用者 2026-10-17 23:0x）：從出口那扇門出去過馬路；第一階段直接接到亞洲超市門口（超市前的停車場、馬路之後做成走得過去的戶外）*/
    if(typeof US_ASIAN_MARKET_LAYOUT!=='undefined'&&!MS()){ const X=L.exit; IT.push({x:X.x+2.6,z:X.z-0.4,radius:1.0,lv:0,label:'過馬路（對面的亞洲超市）',exit:{to:'us_asian_market',spawn:Object.assign({},US_ASIAN_MARKET_LAYOUT.spawn)}}); }
    z.formal=false; if(has('bldg.us_market')) ASSETS.loadOne('bldg.us_market').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
      root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); g0.add(root); fb.visible=false; z.formal=true;
      root.traverse(o=>{ if(o.isMesh&&/^PLATE_FACE_lane/.test(o.name)) paintPlate(o,(/(\d+)$/.exec(o.name)||[])[1]||'','#1f4f8f','#ffffff'); });
      glow=glowMats(root,/^GLOW_/); const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('草原超市正式模型載入失敗，用程序化備用模型',e));
    return z; } };

  // =================== 大超市對面的小亞洲超市 us_asian_market（竹葉亞洲超市，虛構；使用者 2026-10-17 23:0x）===================
  /* US1 的「台灣泡麵」在這裡買（usMarket:'asia_noodles'，交換系統接）。正式模型 bldg.us_asian_market（tools/blender/env_second/us_asian_market.py，配置同一份）。
     天花板 3.4 m：鏡頭比天花板高時藏天花板、格子、嵌燈；四面牆各自淡出（WALL_<面>_*）；正面玻璃外面的景（馬路對面的草原超市）天空挖空、照時段變色 */
  const us_asian_market={ id:'us_asian_market', name:'竹葉亞洲超市（美國）', indoor:true, camDist:4.4, build(E){ const L=US_ASIAN_MARKET_LAYOUT, Bd=L.bounds, H=L.h||3.4;
    const W=Math.max(-Bd.x0,Bd.x1)*2+3, D=Math.max(-Bd.z0,Bd.z1)*2+3;   /* 鏡頭可以退到牆外 1.5 m（牆淡出），不會卡在牆面上 */
    const z=Z3.room(E,{w:W,d:D,h:H,windows:false,warm:true,wallColor:'#eeeae0',floorTex:W3.stoneTex('#e2dccd'),spawn:{x:L.spawn.x,z:L.spawn.z,yaw:L.spawn.yaw}});
    const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    for(const w of z.walls) w.visible=false; z.walls.length=0;
    const nav=new E3.NavGrid(Bd.x1-Bd.x0,Bd.z1-Bd.z0,0.4,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);
    for(const b of L.blocks) nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.4),Math.max(b.z1-b.z0,0.4),0,0);
    nav._cm=null; z.nav=nav; z.bounds={w:W,d:D};
    // 備用模型：地板、矮牆、貨架、櫃子的方塊
    plane(fb,Bd.x1-Bd.x0,Bd.z1-Bd.z0,M('#e2dccd'),0,0,0.005); const bm=M('#c9c6be'); for(const b of L.blocks){ const h=/gondola|freezers|drinks|produce/.test(b.why)?1.8:1.0; const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
    const lamps=[]; for(const [x,zz] of [[-4,-2],[4,-2],[-4,3],[4,3]]){ const l=new THREE.PointLight(0xf8f6ee,3,12,2); l.position.set(x,H-0.4,zz); l.userData.on=7; l.userData.off=5; g0.add(l); lamps.push(l); }
    let glow=[], views=[]; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); setGlow(glow,1); viewTint(views,h); };   /* 燈盤、冷藏櫃、燈籠整天都亮 */
    const IT=E.interactables;
    for(const q of L.interact) IT.push({x:q.x,z:q.z,radius:q.r,lv:0,label:q.label,usMarket:q.id,look:lookText(q.label+'。')});
    if(MS()){ const X=L.exits[0], X2=L.exits[1]||X; IT.push({x:(X.x+X2.x)/2,z:X.z,radius:Math.max(X.r,1.1),lv:0,label:'出門',exit:{to:'us_market_street',spawn:Object.assign({},MS().spawn_am_out)}}); }   /* US-MARKET-STREET：出門到騎樓；回大超市（過斑馬線）、搭公車都從外面走 */
    else for(const X of L.exits){ const sp=X.to==='us_market'?Object.assign({},US_MARKET_LAYOUT.spawn):Object.assign({},US_LINK); IT.push({x:X.x,z:X.z,radius:X.r,lv:0,label:X.label,exit:{to:X.to,spawn:sp}}); }
    z.formal=false; if(has('bldg.us_asian_market')) ASSETS.loadOne('bldg.us_asian_market').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
      root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); Z3.attachRoomGLB(z,g0,fb,root); z.formal=true;
      const vm=new Set(); root.traverse(q=>{ if(q.isMesh&&/^usam_view/.test(q.name)) vm.add(q.material); }); views=[...vm]; for(const m of views){ m.transparent=false; m.alphaTest=0.5; m.depthWrite=true; m.needsUpdate=true; }   /* 和公寓的窗外景一樣：天空挖空 */
      const top=[]; root.traverse(q=>{ if(q.isMesh&&/^(usam_ceiling|usam_grid|GLOW_usam_troffers|usam_sign_wires)/.test(q.name)) top.push(q); });
      const up0=z.update; z.update=function(dt,E2){ if(up0) up0.call(z,dt,E2); const cy=E2&&E2.camera?E2.camera.position.y:0; for(const q of top) q.visible=cy<=H-0.05; };
      glow=glowMats(root,/^GLOW_/); const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('亞洲超市正式模型載入失敗，用程序化備用模型',e));
    return z; } };

  // =================== 超市街 us_market_street（草原超市和對面竹葉亞洲超市之間的停車場、馬路；US-MARKET-STREET，LAWWW2 2026-10-21）===================
  /* 使用者 2026-10-17：「超市一個大的超市對面有一個小的亞洲超市」，選「做停車場和馬路」。社區搭公車來（北側人行道的公車站）→ 停車場 → 草原超市的 IN 門；
     從 OUT 門出來 → 停車場 → 路口的斑馬線過馬路（中央分隔島只在斑馬線那裡斷開）→ 竹葉亞洲超市。
     正式模型 bldg.us_market_street（tools/blender/env_second/us_market_street.py，配置 us_market_street.layout.json 同一份；四季照 usSeason）。
     公車：usBus＝交換系統可以攔下來換成自己的字卡、時間（社區、校園的公車同一個做法）*/
  const us_market_street=MS()?outdoorZone({ id:'us_market_street', name:'超市街（美國）', size:[84,76], glb:'bldg.us_market_street', layout:MS, spawn:L=>L.spawn_bus,
    /* 燈頭位置照 us_market_street.py：停車場燈桿每支兩個燈頭（桿子前後 1.1 m、冷白光）；眼鏡蛇頭路燈的燈頭在桿子往馬路 2.75 m */
    lampPools:L=>[].concat(...(L.poles||[]).map(p=>[-1.1,1.1].map(d=>({x:p.x,z:p.z+d,r:7.5,op:0.24,color:0xeef2ff}))),
      (L.props||[]).filter(t=>t.type==='street_lamp').map(t=>({x:t.x+Math.sin(t.yaw)*2.75,z:t.z+Math.cos(t.yaw)*2.75,r:6.0,op:0.3}))),
    interact(E,L,IT){ for(const q of L.interact){ const it={x:q.x,z:q.z,radius:q.r,lv:0,label:q.label};
        if(q.id==='pb_in') it.exit={to:'us_market',spawn:Object.assign({},US_MARKET_LAYOUT.spawn)};
        else if(q.id==='am_in') it.exit={to:'us_asian_market',spawn:Object.assign({},US_ASIAN_MARKET_LAYOUT.spawn)};
        else if(q.id==='bus'){ it.exit={to:'us_outside',spawn:Object.assign({},US_LINK)}; it.usBus='community'; }
        else if(q.look) it.look=lookText(q.look);
        IT.push(it); } } }):null;

  // =================== 桃園機場第二航廈 airport_dep／airport_arr ===================
  const AP=()=>AIRPORT_T2_LAYOUT;
  const TAIPEI={to:'gongguan',spawn:{x:-2.5,z:-29,yaw:0}};   /* 搭車離開機場 → 回到台北（公館，校門口那一側；和校園「走出校門」的落點一樣）*/
  const LOOK_AP={checkin:'報到櫃台。排隊的人推著兩三個行李箱。',info:'服務台。可以問航班、借推車。',fids:'航班看板。東京、舊金山、香港……一排一排往上跳。',mart:'便利商店。賣的東西和外面一樣，貴一點。',cafe:'咖啡店。坐滿了在等登機的人。',fx:'外幣兌換。看板上是今天的匯率。',info_arr:'旅客服務台。可以問怎麼搭車進市區。',cafe_arr:'咖啡店。有人拖著行李，在等接機的人。',fids_arr:'抵達看板。剛落地的班次一個一個變成「已抵達」。'};
  /* 跟隨鏡頭的牆（ART-VAC-AIRPORT-1021，LAWWW2 機場巡場景）：鏡頭退到正門玻璃帷幕外面（中間那支門框貼在鏡頭前，整個畫面一根黑柱）、
     入境出關的霧面自動門外面（一出關往前走，鏡頭跟在後面，畫面整片霧白）、報到島 3.2 m 背牆後面（看不到人）。和公寓、教學館同一套 zone.camCols：
     engine3d.js 的 followCam 擋到就拉近、抬高，autoSwing 轉向空的那一邊。出境：帷幕（facade_z，扣掉五個入口，門洞高 2.6 m 以上照樣擋）、報到島背牆；
     入境：出關門那一面（範圍的 z0，整面）、出口那一面（z1，扣掉三個出口）。測試：node tests/airport_cam_unit.js */
  function apCamCols(L,isDep,g,H){ const inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}), out=[], T=0.24, DOOR=2.6, Bd=L.bounds;
    const box=(x0,x1,z0,z1,y0,y1)=>{ if(x1-x0<0.05||z1-z0<0.05||y1-y0<0.05) return; const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),inv); m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2); m.userData.noMerge=true; g.add(m); out.push(m); };
    const wall=(z,gaps)=>{ let a=Bd.x0; for(const d of gaps.slice().sort((p,q)=>p.x-q.x)){ const g0=d.x-d.w/2, g1=d.x+d.w/2; box(a,g0+0.06,z-T/2,z+T/2,0,H); box(g0,g1,z-T/2,z+T/2,DOOR,H); a=g1-0.06; } box(a,Bd.x1,z-T/2,z+T/2,0,H); };   /* 門洞兩邊各多 6 cm：視線擦過門框也擋得到 */
    if(isDep){ wall(L.facade_z,L.entrances); for(const isl of L.islands) box(isl.x-isl.spine/2-0.06,isl.x+isl.spine/2+0.06,isl.z0-0.06,isl.z1+0.06,0,3.2); }
    else { wall(Bd.z0,[]); wall(Bd.z1,L.exits); }
    return out; }
  /* 擋住玩家時網點透空（engine3d.js 的 updateSeeThrough；區域有 seeThru 才在室內作用）：帷幕和門的框、報到島背牆和燈箱框、柱子、不鏽鋼（護樁、欄杆柱、雨遮柱）、出關的霧面玻璃、航空公司燈箱 */
  const AP_SEE=/^(ap_mullion|ap_wall_panel|ap_column|ap_steel|GLOW_ap_frosted|GLOW_ap_airlines)$/;
  function apSeeThru(root,E){ root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m||!AP_SEE.test(m.name||'')||m.userData.seeThrough) continue; m.userData.seeThrough=true; if(E.patchSeeThrough) E.patchSeeThrough(m); } }); }
  function apMats(root,re){ const out=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)) if(m&&re.test(m.name||'')&&!out.includes(m)) out.push(m); }); return out; }
  /* 窗外的遠景（GLOW_ap_outside：白天的天空、停車大樓）原本跟著其他燈箱，晚上反而更亮——20:00 從大廳看出去還是白天。
     白天 7～17 點照原本；17～19 點、5～7 點慢慢變；晚上基本色和自發光都乘深藍（剩一成多的亮度）。入境的門外地面（ap_concrete）晚上一起變暗。
     模型有夜景平面（GLOW_ap_outside_night：airport_backdrop.py --night，停車場樓層、路燈、窗戶亮著；在白天那塊後面 0.5 m）時，18:18 以後、5:42 以前藏起白天那塊、露出夜景 */
  const AP_NIGHT=[0.13,0.16,0.26];
  function apOutside(mats,h,planes){ h=((h%24)+24)%24; const d=h>=7&&h<=17?1:(h>=19||h<5?0:(h<7?(h-5)/2:(19-h)/2));
    if(planes&&planes.night.length){ const nt=d<0.35; for(const o of planes.night) o.visible=nt; for(const o of planes.day) o.visible=!nt; }
    for(const m of mats){ const u=m.userData; if(!u.apC0){ u.apC0=m.color.clone(); u.apE0=m.emissive?m.emissive.clone():null; }
      const k=[0,1,2].map(i=>AP_NIGHT[i]+(1-AP_NIGHT[i])*d); m.color.setRGB(u.apC0.r*k[0],u.apC0.g*k[1],u.apC0.b*k[2]); if(u.apE0) m.emissive.setRGB(u.apE0.r*k[0],u.apE0.g*k[1],u.apE0.b*k[2]);
      if(u.usBase!=null) m.emissiveIntensity=u.usBase*0.75; } }   /* 白天的亮度和原本一樣（原本跟著燈箱乘 0.75）*/
  function apZone(key){ const isDep=key==='dep';
    return { id:'airport_'+key, name:isDep?'桃園機場 第二航廈 出境大廳':'桃園機場 第二航廈 入境大廳', indoor:true, seeThru:true, camDist:isDep?6.0:5.2, build(E){ const L=AP()[key], Bd=L.bounds, H=isDep?(L.roof?L.roof.eave:10.5):(L.h||5.6);
      const W=Math.max(-Bd.x0,Bd.x1)*2, D=Math.max(-Bd.z0,Bd.z1)*2;   /* room() 以原點為中心：框要蓋住整個範圍（出境的下車處到 z 30）；室內鏡頭照 bounds 夾住 */
      const sp=isDep?L.spawn_curb:L.spawn_customs;
      const z=Z3.room(E,{w:W,d:D,h:H,windows:false,cool:true,wallColor:'#e9e7e2',floorTex:W3.stoneTex('#d8d6d0'),spawn:{x:sp.x,z:sp.z,yaw:sp.yaw}});
      const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
      for(const w of z.walls) w.visible=false; z.walls.length=0;   /* 大廳挑高、鏡頭不會穿牆：正式模型的牆不淡出（WALL_ap_walls 是一整個節點，跟著一面一面的淡出規則會整組忽隱忽現）*/
      // 導航
      const nav=new E3.NavGrid(Bd.x1-Bd.x0,Bd.z1-Bd.z0,0.5,Bd.x0,Bd.z0); nav.blockOutside(Bd.x0+0.25,Bd.z0+0.25,Bd.x1-0.25,Bd.z1-0.25);   /* 範圍的邊＝側牆：最外面那一格可以站（0.5 的話靠牆那張長椅最旁邊的位子站不到）*/
      for(const b0 of L.blocks){ let b=b0;
        if(/^bench/.test(b.why)){ const s=L.seats.find(q=>q.x>=b.x0-0.05&&q.x<=b.x1+0.05&&q.z>=b.z0-0.05&&q.z<=b.z1+0.05);   /* 長椅：只擋座位後面那一半（坐下要走到椅子前面 0.5 m；第一次整張擋住，走近點卡在椅面上）*/
          if(s){ const fx=Math.sin(s.yaw), fz=Math.cos(s.yaw); b=Object.assign({},b); if(Math.abs(fz)>=Math.abs(fx)){ if(fz>0) b.z1=s.z; else b.z0=s.z; } else { if(fx>0) b.x1=s.x; else b.x0=s.x; } } }
        nav.blockRect((b.x0+b.x1)/2,(b.z0+b.z1)/2,Math.max(b.x1-b.x0,0.5),Math.max(b.z1-b.z0,0.5),0,0); }   /* 欄杆、牆比一格薄：至少 0.5 m（格子中心才擋得到）*/
      if(!isDep) for(const d of L.exits) nav.freeRect(d.x-d.w/2+0.2,Bd.z1-1.2,d.x+d.w/2-0.2,Bd.z1-0.5);   /* 入境：正面那一整片是一個阻擋，出口的門由遊戲打開（配置的說明）*/
      if(isDep){ const C=L.curb; nav.blockRect((Bd.x0+Bd.x1)/2,(C.road_z0+Bd.z1)/2,Bd.x1-Bd.x0,Bd.z1-C.road_z0,0,0); }   /* 車道（下車處以外）：人站在人行道 */
      nav._cm=null; z.nav=nav; z.bounds={w:W,d:D};
      z.camCols=[apCamCols(L,isDep,g0,H)];   /* 跟隨鏡頭撞到帷幕、出關門那面牆、報到島背牆就拉近（ART-VAC-AIRPORT-1021）*/
      // 備用模型：地板、櫃台島、店面的方塊
      const fl=M('#cfccc4'); plane(fb,Bd.x1-Bd.x0,Bd.z1-Bd.z0,fl,(Bd.x0+Bd.x1)/2,(Bd.z0+Bd.z1)/2,0.005);
      const bm=M('#8c8e92'); for(const b of L.blocks){ if(/^(curb|canopy column)/.test(b.why)) continue; const h=/wall|facade|shop/.test(b.why)?3.0:1.0; const m=new THREE.Mesh(new THREE.BoxGeometry(Math.max(b.x1-b.x0,0.1),h,Math.max(b.z1-b.z0,0.1)),bm); m.position.set((b.x0+b.x1)/2,h/2,(b.z0+b.z1)/2); fb.add(m); }
      // 燈：挑高大廳多幾盞（白天弱、晚上亮）
      const lamps=[]; for(let i=-2;i<=2;i++) for(const zz of (isDep?[-10,2]:[-6,4])){ const l=new THREE.PointLight(0xf6f1e8,3,26,2); l.position.set(i*14,H-1.2,zz); l.userData.on=9; l.userData.off=4; g0.add(l); lamps.push(l); }
      let glow=[], outside=[], outPlanes=null; const onLamps0=z.onLamps; z.onLamps=function(on){ onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
      const applyTime0=z.applyTime; z.applyTime=function(h,weather){ applyTime0.call(z,h,weather); setGlow(glow,night(h)?1:0.75); apOutside(outside,h,outPlanes); };   /* 看板、招牌、燈箱白天也亮（室內），晚上再亮一點；窗外的遠景（和入境門外的地面）照時間變暗 */
      // 座位、互動點
      const IT=E.interactables; z.seats=[];
      for(const s of L.seats){ const st={x:s.x,z:s.z,yaw:s.yaw,lv:0}; if(s.y!=null&&Math.abs(s.y-0.45)>0.02) st.lift=s.y-0.45; z.seats.push(st); IT.push({x:s.x,z:s.z,radius:0.7,lv:0,label:'坐在長椅上',seat:st}); }
      for(const q of L.interact){ const k=/^checkin/.test(q.id)?'checkin':(isDep?q.id:q.id+'_arr'); const t=LOOK_AP[k]||LOOK_AP[q.id]; if(t) IT.push({x:q.x,z:q.z,radius:q.r,lv:0,label:q.label,look:lookText(t)}); }
      if(isDep){ const F=L.farewell, X=L.exit;
        /* 機場不只交換用：寒暑假出國也從這裡出發（使用者 2026-10-17 23:0x）。
           ・交換出發那一趟（交換系統 EXCH 在、已經出發 US_DEPARTED、還沒抵達 US_ARRIVED）：LAWWW-C 的「登機：飛往美國」（exchFly：字卡、時差、抵達社區）
           ・其他時候：通用的「登機」（airportBoard：寒暑假系統攔下來換成自己的行程；沒有人攔就只說今天沒有航班）
           ・沒有交換系統（只有這個檔，開發測試）：直接到美國社區入口的測試接法 */
        const fl=((G_()||{}).flags)||{};
        if(typeof EXCH!=='undefined'&&fl.US_DEPARTED&&!fl.US_ARRIVED) IT.push({x:F.x,z:F.z,radius:F.r,lv:0,label:'登機：飛往美國',exchFly:true});
        else if(typeof EXCH!=='undefined') IT.push({x:F.x,z:F.z,radius:F.r,lv:0,label:'登機',airportBoard:true,look:'今天沒有要搭的飛機。'});
        else IT.push({x:F.x,z:F.z,radius:F.r,lv:0,label:'出境（前往美國）',usLink:true,exit:{to:'us_outside',spawn:Object.assign({},US_LINK)}});
        if(!(typeof EXCH!=='undefined'&&fl.US_DEPARTED&&!fl.US_ARRIVED)) IT.push({x:X.x,z:X.z,radius:X.r,lv:0,label:'搭車離開（回台北）',exit:Object.assign({},TAIPEI,{spawn:Object.assign({},TAIPEI.spawn)})}); }   /* AA_370 H2：交換出發那天進了出境大廳就不能搭車回去，只剩登機（時間到自動登機，exchange3d.js S.tick）*/
      else { const X=L.exit; IT.push({x:X.x,z:X.z-0.4,radius:X.r,lv:0,label:'出口（搭車回台北）',exit:Object.assign({},TAIPEI,{spawn:Object.assign({},TAIPEI.spawn)})});
        IT.push({x:L.meet.x,z:L.meet.z,radius:L.meet.r,lv:0,label:L.meet.label,look:lookText('接機處。欄杆外面有人舉著寫了名字的紙板。')}); }
      // 正式模型
      z.formal=false; const KEY='bldg.airport_'+key; if(has(KEY)) ASSETS.loadOne(KEY).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true);
        root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); g0.add(root); fb.visible=false; z.formal=true;
        glow=glowMats(root,/^GLOW_(?!ap_outside)/); outside=glowMats(root,/^GLOW_ap_outside_m$/).concat(isDep?[]:apMats(root,/^ap_concrete$/)); apSeeThru(root,E);
        outPlanes={day:[],night:[]}; root.traverse(o=>{ if(!o.isMesh) return; if(o.name==='GLOW_ap_outside') outPlanes.day.push(o); else if(/^GLOW_ap_outside_night/.test(o.name)){ outPlanes.night.push(o); for(const m of [].concat(o.material)) if(m&&!m.userData.apNight){ m.userData.apNight=true; m.color.multiplyScalar(0.15); } } });   /* 夜景平面：顯示的是圖本身的自發光，基本色壓低，不被大廳的燈照亮 */
        const G=G_(); if(G) z.applyTime(G.hour,G.weather); }).catch(e=>console.warn('桃園機場正式模型載入失敗，用程序化備用模型',e));
      z.seeThru=true;   /* 網點透空：引擎看的是區域實體（E.zone.seeThru），只寫在上面的定義上沒有作用（宿舍、Café 同一個錯，10-22）*/
      return z; } }; }
  const airport_dep=apZone('dep'), airport_arr=apZone('arr');

  // =================== 試玩入口（開發用，?usdemo）===================
  function demoButton(){ if(typeof location==='undefined'||!/[?&]usdemo\b/.test(location.search)) return; const t=setInterval(()=>{ if(typeof GAME==='undefined'||!GAME.G||!GAME.G.zone) return; clearInterval(t);
      const b=document.createElement('button'); b.textContent='美國篇（測試）'; b.id='usDemoBtn';
      Object.assign(b.style,{position:'fixed',left:'calc(env(safe-area-inset-left) + 8px)',top:'calc(env(safe-area-inset-top) + 64px)',zIndex:60,minHeight:'44px',padding:'0 12px',borderRadius:'10px',border:'1px solid #fff8',background:'#1f3350cc',color:'#fff',font:'15px sans-serif'});
      b.onclick=()=>{ if(GAME.G.zone==='airport_dep') return; GAME.enter('airport_dep',Object.assign({},AP().dep.spawn_curb)); }; document.body.appendChild(b); },500); }
  demoButton();
  /* 各區域的出生點（給交換系統：src/exchange3d.js 的 S.SPAWN 用這幾個，臨時場景的 (0,5)、(0,4)、(0,2) 在正式區域裡是服務台旁、停車格、洗衣機櫃）*/
  const SPAWN={ airport_dep:Object.assign({},AP().dep.spawn_curb), airport_arr:Object.assign({},AP().arr.spawn_customs), us_outside:Object.assign({},US_LINK),
    us_apartment:Object.assign({},APT().spawns.fromOutside), us_apartment_bed:Object.assign({},APT().spawns.bedroom), us_market:Object.assign({},US_MARKET_LAYOUT.spawn), us_shared:Object.assign({},US_SHARED_LAYOUT.spawns.fromOutside), us_shared_kitchen:Object.assign({},US_SHARED_LAYOUT.spawns.kitchen), us_asian_market:Object.assign({},US_ASIAN_MARKET_LAYOUT.spawn), us_campus:Object.assign({},US_CAMPUS_LAYOUT.spawn_bus), us_campus_class_out:Object.assign({},US_CAMPUS_LAYOUT.spawn_class_out), us_lawlib:Object.assign({},US_LAWLIB_LAYOUT.spawn) };   /* 美國校園：公車到站、下課從法學院出來；法學院圖書館：從門進來 */
  if(US_COMMUNITY_LAYOUT.clubhouse){ const D=US_COMMUNITY_LAYOUT.clubhouse.door; SPAWN.us_clubhouse={x:D.x,z:+(D.z-1.5).toFixed(2),yaw:Math.PI}; }   /* 會所門口的走道上、面向停車場（會所裡的 2D 演完回到社區站這裡）*/
  if(MS()){ SPAWN.us_market_street=Object.assign({},MS().spawn_bus); SPAWN.us_market_street_pb_out=Object.assign({},MS().spawn_pb_out); SPAWN.us_market_street_am_out=Object.assign({},MS().spawn_am_out); }   /* 超市街：公車站、草原超市 OUT 門外、亞洲超市門外 */
  for(const k in SPAWN) delete SPAWN[k].note;
  /* 交換系統（LAWWW-C 的 src/exchange3d.js，比這個檔先載入）：出發、登機抵達、睡醒、凌晨走回公寓、手機「地點」都讀 EXCH.SPAWN（LAWWW-C 21:13 的介面）*/
  if(typeof EXCH!=='undefined'&&EXCH.SPAWN) Object.assign(EXCH.SPAWN,{airport_dep:Object.assign({},SPAWN.airport_dep),us_outside:Object.assign({},SPAWN.us_outside),us_apartment:Object.assign({},SPAWN.us_apartment_bed)});
  return {usSeasonKey,usSeason,us_campus,us_lawlib,us_apartment,us_shared,us_outside,us_market,us_asian_market,us_market_street,airport_dep,airport_arr,aptNav,US_LINK,CAR_DIMS,SPAWN,C208};
})();
Z3.ZONES.us_campus=US3.us_campus; Z3.ZONES.us_lawlib=US3.us_lawlib; Z3.ZONES.us_apartment=US3.us_apartment; Z3.ZONES.us_shared=US3.us_shared; Z3.ZONES.us_outside=US3.us_outside; Z3.ZONES.us_market=US3.us_market; Z3.ZONES.us_asian_market=US3.us_asian_market; Z3.ZONES.airport_dep=US3.airport_dep; Z3.ZONES.airport_arr=US3.airport_arr; if(US3.us_market_street) Z3.ZONES.us_market_street=US3.us_market_street;

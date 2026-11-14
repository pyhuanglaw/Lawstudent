/* ===== 美國交換：社區 Linden Grove 會所的室內（US-CLUBHOUSE-3D-1110，AA_741；LAWWW2 帳號 A 2026-11-10）=====
   區域 us_clubhouse_in：一層三塊——門廳（社區辦公室的櫃台、信件架）、交誼廳（兩張可以併起來的長桌、L 型沙發＋電視、熱飲販賣機、小廚房、通後面草地的玻璃門、12/1 起聖誕樹）、
   自習室（四張長桌×四席、檯燈、軟木公布欄）。配置 src/data/us_clubhouse_layout.js（tools/blender/env_second/us_clubhouse_layout_gen.py 產生）；
   正式模型 assets/models/env/second_ai/us_clubhouse.glb（tools/blender/env_second/us_clubhouse.py，讀同一份配置）；載入失敗＝備用模型（地板、矮牆、家具方塊），一樣能走、能坐。
   窗外：會所後面的草地、烤肉架（views/usch_<季節>_{day,night}.webp）、正面的停車場（views/usch_front_…）——tools/blender/env_second/us_clubhouse_view.py 用社區的正式模型拍；照 US3.usSeasonKey() 換季。
   這個檔只做「地方」：進來（社區「會所」門口改成 exit:{to:'us_clubhouse_in',spawn:US_CLUBHOUSE.SPAWN}）、讀書（自習室的座位 seat.study＝CLS.chooseStudy）、
   誰坐哪（z.seatOf／z.npc／z.events）、晚餐併桌（z.setDinner）、學姊旁邊的外套（z.setSisCoat）、公布欄的單子（z.setNotice）、讀書計畫（z.setPlan）由 LAWWW 接；作息、台詞不改（AA_741）。 */
const US_CLUBHOUSE=(function(){
  const S={}; const LAY=()=>typeof US_CLUBHOUSE_LAYOUT!=='undefined'?US_CLUBHOUSE_LAYOUT:null;
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.8},o||{}));
  const G_=()=>(typeof GAME!=='undefined'&&GAME.G)||null;
  const dateMD=()=>{ const G=G_(); const d=G&&typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day):{m:9,d:1}; return d; };
  const season=()=>(typeof US3!=='undefined'&&US3.usSeasonKey)?US3.usSeasonKey():'summer';
  /* 窗景兩組：usch＝會所後面（北牆的玻璃門、東西牆的窗：草地、烤肉架、樹林）；usch_front＝正面（南牆的窗：門廊、停車場、對面的公寓）*/
  const viewKind=(front)=>(front?'usch_front_':'usch_')+season();
  S.viewKind=viewKind;
  /* 聖誕樹：12/1 起到離開（AA_741）。f＝配置的 from（'12-01'）*/
  S.xmasOn=(d)=>{ d=d||dateMD(); return d.m===12&&d.d>=1; };
  /* 櫃台：平日 09:00～17:00 有人，其他時間拉下百葉（AA_741 第 1 節）*/
  S.officeOpen=(G)=>{ G=G||G_(); if(!G) return true; const h=((G.hour%24)+24)%24, w=G.weekday; return (w==null||(w>=1&&w<=5))&&h>=9&&h<17; };
  const outSpawn=()=>Object.assign({},(typeof US3!=='undefined'&&US3.SPAWN&&US3.SPAWN.us_clubhouse)||{x:-28,z:10.6,yaw:Math.PI});

  /* 導航：0.2 m 一格（格子中心落在牆線上：牆擋剛好一格＝0.2 m 厚）；先整個擋起來，打開走得到的房間，再擋牆（開口留空）、家具 */
  function buildNav(L){ const B=L.bounds, T=L.wallT, nav=new E3.NavGrid(B.x1-B.x0+0.6,B.z1-B.z0+0.6,0.2,B.x0-0.3,B.z0-0.3); nav.fillBlocked();
    const band=(x0,x1,z0,z1)=>{ if(x1-x0>0.01&&z1-z0>0.01) nav.blockRect((x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,0,0); };
    for(const r of L.rooms) if(r.walk!==false) nav.freeRect(r.x0,r.z0,r.x1,r.z1);
    for(const w of L.walls){ const ops=(w.open||[]).filter(o=>o[2]!=='window'&&o[2]!=='counter'&&o[2]!=='patioDoor'&&o[2]!=='frontDoor').map(o=>[Math.min(o[0],o[1]),Math.max(o[0],o[1])]).sort((a,b)=>a[0]-b[0]); let a=w.from;
      const seg=(p,q)=>{ if(w.axis==='x') band(p,q,w.at-T/2,w.at+T/2); else band(w.at-T/2,w.at+T/2,p,q); };
      for(const [p,q] of ops){ if(p>a) seg(a,p); a=q; } if(a<w.to) seg(a,w.to); }
    const rect=(x0,x1,z0,z1)=>band(Math.min(x0,x1),Math.max(x0,x1),Math.min(z0,z1),Math.max(z0,z1));
    for(const f of L.furniture){ const t=f.type;
      if(t==='tvConsole') rect(f.x-f.d/2,f.x+f.d/2,f.z-f.w/2,f.z+f.w/2);
      else if(t==='sofaLong'||t==='sofaShort'||t==='coffeeTable'||t==='counterRun'||t==='counter'||t==='mailRack') rect(f.x0,f.x1,f.z0,f.z1);
      else if(t==='vending') rect(f.x-f.d/2,f.x+f.d/2,f.z-f.w/2,f.z+f.w/2);
      else if(t==='longTables') rect(f.navX0,f.navX1,f.z-f.d/2,f.z+f.d/2);
      else if(t==='studyTable') rect(f.x-f.w/2,f.x+f.w/2,f.z-f.d/2,f.z+f.d/2);
      else if(t==='xmasTree'||t==='plant') nav.blockCircle(f.x,f.z,f.r); }
    /* US-NAV-TRAPS-1111（LAWWW2 美國區擋玩巡檢）：門廳和自習室中間那道牆（x 3，0.2 m 只有一格厚）在櫃台東頭 (3.1, 0.2～0.5) 被「站得住」的四點檢查跨過去，
       成了一條人站得住的小縫：跑步斜著進去，16 個方向推 3 秒都出不來（Node：跑 30 fps 5 次進去、2 次出不來）。只擋導航那一小塊，模型不動 */
    band(3.0,3.2,0.15,0.55);
    nav._cm=null; return nav; }
  /* 跟隨鏡頭的牆（美國公寓同一套：engine3d.js 的 followCam 查 zone.camCols）：牆扣掉人走得過去的開口（門口、自習室的門）；窗、玻璃門、櫃台窗口照樣擋（窗口上下的牆也擋）*/
  function camCols(L,g,H){ const inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}), out=[], T=0.24;
    const box=(axis,at,a,b,y0,y1)=>{ a-=0.06; b+=0.06; if(b-a<0.05||y1-y0<0.05) return; const ax=axis==='x'; const m=new THREE.Mesh(new THREE.BoxGeometry(ax?b-a:T,y1-y0,ax?T:b-a),inv); m.position.set(ax?(a+b)/2:at,(y0+y1)/2,ax?at:(a+b)/2); m.userData.noMerge=true; g.add(m); out.push(m); };
    for(const w of L.walls){ const pass=(w.open||[]).filter(o=>o[2]==='opening'||o[2]==='studyDoor').map(o=>({a:Math.min(o[0],o[1]),b:Math.max(o[0],o[1])})).sort((p,q)=>p.a-q.a); let a=w.from;
      for(const p of pass){ box(w.axis,w.at,a,p.a,0,H+0.3); box(w.axis,w.at,p.a,p.b,2.1,H+0.3); a=p.b; } box(w.axis,w.at,a,w.to,0,H+0.3); }
    return out; }
  /* 備用模型：地板（木紋／地毯／磁磚的顏色）、1.1 m 高的矮牆（剖面看得到格局）、家具方塊 */
  function fallback(L,fb){ const H=1.1, col={wood:'#cdb48f',carpet:'#7d838b',tile:'#d8d4cc'};
    const plane=(w,d,mat,x,z,y)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat); m.rotation.x=-Math.PI/2; m.position.set(x,y||0.005,z); m.receiveShadow=true; fb.add(m); return m; };
    for(const r of L.rooms) plane(r.x1-r.x0,r.z1-r.z0,M(col[r.floor]||'#b8a48a'),(r.x0+r.x1)/2,(r.z0+r.z1)/2);
    const wm=M('#ece6da'); for(const w of L.walls){ const segs=[]; let a=w.from; for(const o of (w.open||[]).slice().sort((p,q)=>p[0]-q[0])){ if(o[0]>a) segs.push([a,o[0]]); a=Math.max(a,o[1]); } if(w.to>a) segs.push([a,w.to]);
      for(const [s0,s1] of segs){ const len=s1-s0, c=(s0+s1)/2, m=new THREE.Mesh(new THREE.BoxGeometry(w.axis==='x'?len:0.2,H,w.axis==='x'?0.2:len),wm); m.position.set(w.axis==='x'?c:w.at,H/2,w.axis==='x'?w.at:c); fb.add(m); } }
    const fm=M('#5d6670'), wd=M('#b89b74'), wh=M('#e8e4dc'), dk=M('#2c2e31');
    const box=(x0,x1,z0,z1,h,mat,y0)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1-x0),h,Math.abs(z1-z0)),mat); m.position.set((x0+x1)/2,(y0||0)+h/2,(z0+z1)/2); fb.add(m); return m; };
    for(const f of L.furniture){ const t=f.type;
      if(t==='tvConsole'){ box(f.x-f.d/2,f.x+f.d/2,f.z-f.w/2,f.z+f.w/2,0.5,wd); box(f.x-0.05,f.x+0.0,f.z-0.7,f.z+0.7,0.75,dk,0.75); }
      else if(t==='sofaLong'||t==='sofaShort') box(f.x0,f.x1,f.z0,f.z1,0.8,fm);
      else if(t==='coffeeTable') box(f.x0,f.x1,f.z0,f.z1,f.h,wd);
      else if(t==='counterRun') box(f.x0,f.x1,f.z0,f.z1,f.h,wh);
      else if(t==='counter') box(f.x0,f.x1,f.z0,f.z1,f.h,wd);
      else if(t==='vending') box(f.x-f.d/2,f.x+f.d/2,f.z-f.w/2,f.z+f.w/2,1.83,M('#7a2d22'));
      else if(t==='studyTable') box(f.x-f.w/2,f.x+f.w/2,f.z-f.d/2,f.z+f.d/2,f.h,wd);
      else if(t==='mailRack') box(f.x0,f.x1,f.z0,f.z1,f.y1-f.y0,wd,f.y0);
      else if(t==='longTables'){ const tabs=[]; for(const x of f.apart) tabs.push(box(x-f.w/2,x+f.w/2,f.z-f.d/2,f.z+f.d/2,f.h,wd)); fb.userData.longTables=tabs; } } }

  S.zone={ id:'us_clubhouse_in', name:'會所（美國）', indoor:true, camDist:4.2, seeThru:true, build(E){ const L=LAY(), B=L.bounds, H=L.ceilY||2.9;
    const W=B.x1-B.x0, D=B.z1-B.z0;
    const z=Z3.room(E,{w:W+0.4,d:D+0.4,h:H,windows:false,warm:true,wallColor:'#ece6da',floorTex:W3.stoneTex('#cdb48f'),spawn:Object.assign({},L.spawn)});
    const g0=z.group; const fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    for(const w of z.walls) w.visible=false; z.walls.length=0;   /* room() 的四面大牆不是這間的形狀：備用模型用配置的矮牆 */
    z.nav=buildNav(L); fallback(L,fb); z.camCols=[camCols(L,g0,H)]; z.camMaxY=H+1.6; z.spawn=Object.assign({},L.spawn);
    // 燈：三個房間的天花板（白天弱、晚上亮）
    const lamps=[]; for(const [x,zz] of [[-8.5,-2],[-3.5,-2],[-8.5,2],[-3.5,2],[1,2],[5,0],[9,0],[5,2.6],[9,2.6]]){ const l=new THREE.PointLight(0xffe6c4,2,8,2); l.position.set(x,H-0.35,zz); l.userData.on=8; l.userData.off=2.5; g0.add(l); lamps.push(l); }
    const onLamps0=z.onLamps; z.onLamps=function(on){ if(onLamps0) onLamps0.call(z,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    // 窗外的景：每個窗洞、玻璃門外面一片視差窗景（W3.windowMat；總圖三樓同一套）；牆淡出時一起藏（winParts）
    const WN=L.windows, wins=[], myParts=[]; const fbTex=(typeof W3!=='undefined'&&W3.canvasTex)?W3.canvasTex('usch_fallback',64,64,(x,w,h)=>{ const gr=x.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#a9c4dc'); gr.addColorStop(0.62,'#dfe6e4'); gr.addColorStop(0.64,'#7d9a5e'); gr.addColorStop(1,'#5f7d47'); x.fillStyle=gr; x.fillRect(0,0,w,h); }):null;
    if(typeof W3!=='undefined'&&W3.windowMat) for(const w of L.walls) for(const o of (w.open||[])){ if(o[2]!=='window'&&o[2]!=='patioDoor'&&o[2]!=='frontDoor') continue; if(!/^[NSWE]/.test(w.id)||w.partition) continue;
      const a=Math.min(o[0],o[1]), b=Math.max(o[0],o[1]), y0=o[2]==='window'?WN.y0:0, y1=o[2]==='window'?WN.y1:2.15, d=w.dir; const m=new THREE.Mesh(new THREE.PlaneGeometry(b-a+0.1,y1-y0+0.1),W3.windowMat(30));
      const off=-(L.wallT/2+0.16); if(w.axis==='x') m.position.set((a+b)/2,(y0+y1)/2,w.at+d[2]*off); else m.position.set(w.at+d[0]*off,(y0+y1)/2,(a+b)/2);
      m.rotation.y=Math.atan2(d[0],d[2]); m.userData.dyn=true; m.userData.front=w.id==='S'; g0.add(m); wins.push(m); myParts.push({obj:m,at:m.position.clone(),dir:new THREE.Vector3(d[0],d[1],d[2])}); }
    z.winParts=(z.winParts||[]).concat(myParts); z.viewPanes=wins;
    const applyTime0=z.applyTime; z.applyTime=function(h,weather){ if(applyTime0) applyTime0.call(z,h,weather); h=((h%24)+24)%24; const night=(h<6||h>=19.2);
      for(const m of wins){ const kind=viewKind(m.userData.front); const ph=W3.viewPhoto?W3.viewPhoto(kind,night):null, tint=(ph&&W3.photoTint)?W3.photoTint(h,weather==='rain'):0xffffff, xf=W3.photoFade?W3.photoFade(h):0; W3.setWindowView(m.material,kind,night,fbTex,tint,xf); }
      z.refreshState(); };
    // ---- 座位、互動點 ----
    const IT=E.interactables; z.seats=[]; const byId={};
    z.dinnerOn=false; z.sisCoatOn=false;
    for(const s0 of L.seats){ const s={x:s0.x,z:s0.z,yaw:s0.yaw,lv:0,id:s0.id,room:s0.room}; if(s0.ap) s.ap=s0.ap.slice(); if(s0.study) s.study=true; z.seats.push(s); byId[s0.id]=s;
      const ip=s.ap?{x:s.ap[0],z:s.ap[1]}:{x:s.x-Math.sin(s.yaw)*0.35,z:s.z-Math.cos(s.yaw)*0.35};
      const it={x:ip.x,z:ip.z,radius:s.ap?0.8:0.6,lv:0,label:s0.label,seat:s}; if(s.study) it.usClubStudy=true;   /* 自習室：坐下＝讀書（LAWWW 接 CLS.chooseStudy → studySession）*/
      const set=s0.set; Object.defineProperty(it,'hidden',{get:()=>(set==='apart'&&z.dinnerOn)||(set==='merged'&&!z.dinnerOn)||(s0.id===L.npc.sisNext&&z.sisCoatOn),enumerable:true,configurable:true});
      IT.push(it); }
    z.seatById=id=>byId[id]||null;
    for(const lk of (L.looks||[])) IT.push({x:lk.x,z:lk.z,radius:lk.r,lv:0,label:lk.label,usClubLook:lk.id});   /* 字由 LAWWW 接（AA_741：櫃台照舊 aa287 那句）*/
    { const X=L.exit; IT.push({x:X.x,z:X.z,radius:X.r,lv:0,label:X.label,exit:{to:'us_outside',spawn:outSpawn()}}); }
    // ---- 誰坐哪、劇情站位（照配置；LAWWW 接）----
    const pick=v=>v==null?null:(typeof v==='string'?byId[v]||null:Object.assign({},v));
    z.npc={long:pick(L.npc.long),longNext:pick(L.npc.longNext),sis:pick(L.npc.sis),sisNext:pick(L.npc.sisNext),sisStand:pick(L.npc.sisStand),office:pick(L.npc.office),
      lounge:L.npc.lounge.map(q=>q.seat?Object.assign({kind:q.kind},byId[q.seat]):Object.assign({},q)),study:L.npc.study.map(pick)};
    z.events={}; for(const k in L.events){ const e=L.events[k], o={}; for(const f in e){ const v=e[f]; if(f==='note') continue; o[f]=Array.isArray(v)?v.map(pick):(v&&typeof v==='object'&&!('x' in v)?Object.fromEntries(Object.entries(v).map(([a,b])=>[a,pick(b)])):(typeof v==='string'?pick(v):v)); } z.events[k]=o; }
    // ---- 狀態切換：正式模型的節點（GLB 載好之前先記著）----
    let root=null; const node=n=>root?root.getObjectByName(n):null; const vis=(n,v)=>{ const o=node(n); if(o) o.visible=!!v; };
    z.noticeOn=false; z.planOn=false; z.xmasForce=null;
    z.refreshState=function(){ const xm=z.xmasForce!=null?z.xmasForce:S.xmasOn(); const G=G_(), h=G?((G.hour%24)+24)%24:12, night=h<6||h>=17.5;
      vis('XMAS_TREE',xm); vis('XMAS_LIGHTS',xm&&night); vis('TABLES_APART',!z.dinnerOn); vis('TABLES_MERGED',z.dinnerOn); vis('DINNER_SET',z.dinnerOn); vis('SIS_COAT',z.sisCoatOn);
      vis('CORK_NOTICE',z.noticeOn); vis('SIS_PLAN',z.planOn); vis('LOUNGE_DOOR',z.loungeClosed); const op=S.officeOpen(G); vis('SHUTTER_DOWN',!op); vis('OFFICE_LIT',op);
      const t=fb.userData.longTables; if(t){ const f=L.furniture.find(q=>q.type==='longTables'); const xs=z.dinnerOn?f.merged:f.apart; t.forEach((m,i)=>{ m.position.x=xs[i]; }); } };
    z.setDinner=on=>{ z.dinnerOn=!!on; z.refreshState(); };      /* 12/14 晚餐：兩張長桌併成一張、桌巾、一排菜；座位換成併桌的 10 個（ld_*）*/
    z.setSisCoat=on=>{ z.sisCoatOn=!!on; z.refreshState(); };    /* 挽回中：學姊旁邊那張椅子放著她的外套，不能坐 */
    z.setNotice=on=>{ z.noticeOn=!!on; z.refreshState(); };      /* ev_usl_long3 開頭：公布欄貼一張單子 */
    z.setPlan=on=>{ z.planOn=!!on; z.refreshState(); };          /* ev_sis_plan_us：學姊那張桌上攤著讀書計畫 */
    z.setXmas=on=>{ z.xmasForce=on==null?null:!!on; z.refreshState(); };   /* 不給＝照日期（12/1 起）*/
    /* 交誼廳的門（US-CLUB-LOUNGE-CLOSE-1110，AA：12/14 晚上 18:30～21:30 沒排晚餐的玩家走進會所，交誼廳的門關著；門廳、自習室照常）：
       z.setLoungeClosed(true)＝門板（正式模型的 LOUNGE_DOOR）、導航擋住門口、鏡頭不穿過、門廳這邊一個「看」（字 LAWWW 給：「今晚交誼廳有聚餐。」）；false＝打開。
       玩家已經在交誼廳裡（x < 門口）時不關（D36：玩家一定離得開）：回傳 false，門照舊開著 */
    const LO=L.walls.find(w=>w.id==='lf'), LOP=LO.open.find(o=>o[2]==='opening'), LZ0=Math.min(LOP[0],LOP[1]), LZ1=Math.max(LOP[0],LOP[1]), LX=LO.at;
    const loungeCam=new THREE.Mesh(new THREE.BoxGeometry(0.24,2.1,LZ1-LZ0+0.12),new THREE.MeshBasicMaterial({visible:false})); loungeCam.position.set(LX,1.05,(LZ0+LZ1)/2); loungeCam.userData.noMerge=true;
    const loungeLook={x:LX+0.55,z:(LZ0+LZ1)/2,radius:0.9,lv:0,label:'交誼廳',usClubLook:'lounge_closed',look:'今晚交誼廳有聚餐。'}; Object.defineProperty(loungeLook,'hidden',{get:()=>!z.loungeClosed,enumerable:true,configurable:true}); IT.push(loungeLook);
    z.loungeClosed=false;
    z.setLoungeClosed=on=>{ on=!!on; const P=E.player&&E.player.obj&&E.player.obj.position; if(on&&P&&E.zone===z&&P.x<LX-0.05) return false;
      if(on===z.loungeClosed) return true; z.loungeClosed=on; const cc=z.camCols&&z.camCols[0];
      if(on){ z.nav.blockRect(LX,(LZ0+LZ1)/2,0.2,LZ1-LZ0+0.02,0,0); if(cc&&!cc.includes(loungeCam)){ g0.add(loungeCam); cc.push(loungeCam); } }
      else { z.nav.freeRect(LX-0.1,LZ0+0.1,LX+0.1,LZ1-0.1);   /* 門口兩端那兩格本來就是牆：只放開中間 */ if(cc){ const i=cc.indexOf(loungeCam); if(i>=0) cc.splice(i,1); } g0.remove(loungeCam); }
      z.nav._cm=null; if(E.levels) for(const n of E.levels) n._cm=null; z.refreshState(); return true; };
    // ---- 正式模型 ----
    z.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.us_clubhouse']) ASSETS.loadOne('bldg.us_clubhouse').then(c=>{ if(!c||!c.scene||E.zone!==z) return; root=c.scene.clone(true);
      Z3.attachRoomGLB(z,g0,fb,root); z.winParts=(z.winParts||[]).concat(myParts.filter(p=>!(z.winParts||[]).includes(p)));
      const glow=[]; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)) if(m&&/^GLOW_/.test(m.name||'')&&!glow.includes(m)){ m.userData.base=m.emissiveIntensity||1; glow.push(m); } }); z.glowMats=glow;
      const G=G_(); if(G) z.applyTime(G.hour,G.weather); else z.refreshState(); }).catch(e=>console.warn('會所正式模型載入失敗，用程序化備用模型',e));
    try{ z.applyTime(12); }catch(e){ z.refreshState(); } return z; } };
  S.SPAWN=(()=>{ const L=LAY(); return L?Object.assign({},L.spawn,{note:undefined}):{x:1,z:3.2,yaw:Math.PI}; })(); delete S.SPAWN.note;
  if(typeof Z3!=='undefined'&&Z3.ZONES&&LAY()) Z3.ZONES.us_clubhouse_in=S.zone;
  return S;
})();

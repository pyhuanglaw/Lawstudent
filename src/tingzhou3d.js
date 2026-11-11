/* 汀州路商圈（TINGZHOU-AREA-1110，USER_WANTS X321／X322，D108；LAWWW2 帳號 A 2026-11-10 第 1 版）
   使用者 11-10：「公館商圈往南新增汀州路商圈」；泰米村食、洗樂洗衣坊、印得好放在這裡；五間正式店名（越好吃小館、客居雲南、東南大聯商行、汀州聯通、溫特寶邸）照概念圖；
   真實城市道路（車流、機車、行人、固定店面、部分夜市攤位共存），不是封閉的觀光夜市。原文、參考圖：docs/art-rebuild/second_ai/ref/tingzhou_1110/。
   配置 src/data/tingzhou_layout.js（和 Blender 的 wz_street.py --set tingzhou 共用）。座標：x 往東、z 往南；汀州路沿著 z；巷 A 往東接公館。
   走得到：汀州路的路面（遊戲沒有會動的車；路邊機車格的機車另外擋）、兩側騎樓（立面 x ±5 到店面玻璃 x ±8.2 前 0.35 m）、巷 A；兩端 z ±40 以外是走不到的背景（路口，不用隱形牆：路面接下去、樓房擋住）。
   出口：巷 A 東端 → 公館店面街 G10 的位置（這一版公館那邊先加一個「往汀州路」的互動點，下面 S.hookGongguan；G10 的店面改成巷口的模型是下一步）。
   店：這一版都還沒有室內——店門口是「看」（暫定的字，AA 可以改）；有室內區域（Z3.ZONES['tz_'+id]）以後自動變成「進○○」。
   夜市攤（配置 stalls，之後加）：照時間擺出來才擋導航，時間切換、「看」「買」LAWWW 接（TINGZHOU-NIGHTMARKET-1110）。
   正式模型 bldg.tingzhou_street（接法和 118 巷、新生南路同一套 Z3.attachWenzhouModel）；沒載入時兩側是方塊立面（D38 分類 ③）。測試：node tests/tingzhou_unit.js */
const TZ3=(function(){
  const S={};
  const LAY=()=>typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT:null;
  const M=c=>TK.col?TK.col(c):new THREE.MeshStandardMaterial({color:c,roughness:0.85});
  S.GLASS_IN=0.35;      // 騎樓走到店面玻璃前 0.35 m
  /* 騎樓柱子：每一棟一根，在那一棟的一端、立面往裡 0.3 m（wz_street.py 的 pillars=[w/2]：本地 +x 那一端——西側的樓本地 +x＝北（z0），東側＝南（z1））；巷口兩邊的不重複 */
  S.pillars=function(L){ const F=L.facade, out=[]; for(const q of L.shops){ if(q.arcade===false) continue;   /* 沒有騎樓的五間（使用者「混合」）：門前沒有柱子 */ const w=q.side==='W'; out.push({x:(w?F.west-0.3:F.east+0.3),z:(w?q.z0:q.z1),id:q.id}); } return out; };
  /* 路邊機車第 3 版（BB_255，11-10 23:07／23:10）：哪一台是哪一款、什麼顏色，照擺放規則挑（模型不重做；Z3.attachWzScooters 照 code、pcol 用）
     車款＝scooter.glb 的十二款；S1A、S1B、S2 三款車尾一樣（CC 並排拍過）→ 算同一種車尾 'A'，全街合計四成以下、同一群裡不連三台；帶機車罩、外送箱、掛安全帽的是自己的輪廓。
     顏色照色系（白／米／銀灰／黑與深藍／紅／藍／綠／黃橘）：同一群相鄰兩台不同色系；黑與深藍全街不超過四分之一。款式的配色表和 scooter.glb 節點的 palette 一樣（測試對）。 */
  S.SC={ S1A:{w:0.12,tail:'A',pal:['#e9e9e6','#e9e9e6','#b8bcc0','#b8bcc0','#d9cdb6','#8c9095','#1d1f22','#22344f','#8f1f24']}, S1B:{w:0.12,tail:'A',pal:['#f1f1ee','#f1f1ee','#f1f1ee','#a9adb2','#a9adb2','#c9c1b3','#6f7378','#141517','#334a6b','#5d6a5a']},
    S2:{w:0.12,tail:'A',pal:['#e8e8e6','#e8e8e6','#9ea3a8','#3b3f44','#1b1c1e','#20427a','#7a1c22','#2f5a3c']}, S1A_C:{w:0.03,tail:'C',pal:['#8e949a','#2d3a52','#6d7176']}, S1B_D:{w:0.06,tail:'D',pal:['#f1f1ee','#a9adb2','#6f7378','#334a6b','#141517']},
    S3:{w:0.09,tail:'3',pal:['#e9e9e7','#6b6f73','#4a4e54','#141517','#1f2e48']}, S4:{w:0.11,tail:'4',pal:['#efe6cf','#efe6cf','#a9d3c4','#a9c4dc','#d8c8a8','#e6b8a8','#7b2a32','#1c1d1f']}, S5:{w:0.10,tail:'5',pal:['#eef0f0','#eef0f0','#c9cdd0','#9fc4d2','#7fb8ab','#e3a79c','#55595e','#1e2023']},
    S5_H:{w:0.06,tail:'H',pal:['#eef0f0','#eef0f0','#c9cdd0','#9fc4d2','#7fb8ab','#e3a79c','#55595e','#1e2023']}, S6:{w:0.04,tail:'6',pal:['#e8e8e6','#b5a27a','#4f5a3c','#e3c22b','#1b1c1e']}, S7:{w:0.09,tail:'7',pal:['#c7c2b6','#dcd6c8','#dcd6c8','#9a9aa0','#5d6f86','#7d2a2a','#3e4a3c']}, S9:{w:0.06,tail:'9',pal:['#8f2626','#1f2f4f','#1c1d1f','#2f4a36','#d9d2c2']} };
  S.colorFam=function(hex){ const r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255, mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn, sat=mx?d/mx:0; let h=0;
    if(d>1e-6){ h=mx===r?((g-b)/d)%6:(mx===g?(b-r)/d+2:(r-g)/d+4); h*=60; if(h<0) h+=360; }
    if(mx<0.3) return 'dark'; if(sat<0.12) return mx>0.86?'white':'grey'; if(h>=195&&h<270&&mx<0.5) return 'dark';   /* 深藍算黑那一系 */
    if(sat<0.3&&mx>0.72&&h>=20&&h<75) return 'beige'; if(h<20||h>=335) return 'red'; if(h<75) return 'yellow'; if(h<195) return 'green'; if(h<270) return 'blue'; return 'red'; };
  S.pickScooter=function(zz,sx,pv,st){ const hash=(a,b)=>{ const t=Math.sin(a*12.9898+b*78.233)*43758.5453; return t-Math.floor(t); }, codes=Object.keys(S.SC), W=codes.reduce((a,c)=>a+S.SC[c].w,0); let best=null;
    for(let tr=0;tr<24&&!best;tr++){ let r=hash(zz+tr*3.7,sx+31+tr)*W, code=codes[codes.length-1]; for(const c of codes){ if((r-=S.SC[c].w)<=0){ code=c; break; } } const V=S.SC[code];
      if(pv&&pv.code===code&&tr<16) continue; if(pv&&pv.pp&&pv.tail===V.tail&&pv.pp.tail===V.tail) continue;                       /* 同一群：相鄰不同款（盡量）；車尾一樣的不連三台 */
      if(V.tail==='A'&&(st.tailA+1)>0.38*(st.n+1)+1) continue;                                                                    /* 三款同車尾的合計四成以下 */
      for(let k=0;k<V.pal.length;k++){ const col=V.pal[(Math.floor(hash(zz+tr,sx+41)*V.pal.length)+k)%V.pal.length], cf=S.colorFam(col);
        if(pv&&pv.cf===cf) continue; if(cf==='dark'&&(st.dark+1)>0.22*(st.n+1)+0.5) continue; best={code,tail:V.tail,col,cf}; break; } }
    if(!best){ const code=pv&&pv.tail==='4'?'S7':'S4', V=S.SC[code], col=V.pal.find(c=>{ const f=S.colorFam(c); return f!=='dark'&&(!pv||pv.cf!==f); })||V.pal[0]; best={code,tail:V.tail,col,cf:S.colorFam(col)}; }
    st.n++; if(best.cf==='dark') st.dark++; if(best.tail==='A') st.tailA++; if(pv&&pv.cf===best.cf) st.adjSame++; if(pv&&pv.pp&&pv.tail===best.tail&&pv.pp.tail===best.tail) st.run3++; st.codes[best.code]=(st.codes[best.code]||0)+1; return best; };
  /* 夜市攤幾點擺（NIGHT-MARKET-1110：各攤不一樣，配置 stalls.kinds[kind].from～to；跨午夜的 to 寫 24 以上，凌晨的鐘點加 24 再比）。stallOpen＝這一攤；stallsOpen＝有沒有任何一攤開著 */
  S.stallOpen=function(h,q,L){ const ST=(L||LAY()).stalls; if(!ST) return false; const K=(ST.kinds&&ST.kinds[q.kind||q])||ST, a=K.from!=null?K.from:ST.from, b=K.to!=null?K.to:ST.to; return (h>=a&&h<b)||(h+24>=a&&h+24<b); };
  S.stallsOpen=function(h,L){ const ST=(L||LAY()).stalls; return !!ST&&ST.list.some(q=>S.stallOpen(h,q,L)); };
  S.stallBlock=function(q,L){ const ST=(L||LAY()).stalls, K=ST.kinds&&ST.kinds[q.kind]; return (K&&K.block)||ST.block; };
  S.build=function(E){ const L=LAY(); const g=new THREE.Group(); g.name='tingzhou_zone';
    const N=L.nav, nav=new E3.NavGrid(N.w,N.d,N.cell,N.x0,N.z0); nav.b.fill(1);
    const open=(x0,z0,x1,z1)=>{ for(let cz=0;cz<nav.rows;cz++) for(let cx=0;cx<nav.cols;cx++){ const [wx,wz]=nav.toWorld(cx,cz); if(wx>=x0&&wx<=x1&&wz>=z0&&wz<=z1) nav.b[nav.idx(cx,cz)]=0; } };
    const R=L.road, F=L.facade, WK=L.walk, A=L.alleys[0], AD=F.arcade;
    open(F.west-AD+S.GLASS_IN,WK.z0+0.5,F.east+AD-S.GLASS_IN,WK.z1-0.5);            // 路面＋兩側騎樓
    open(F.east,A.z0+0.5,F.east+A.len-0.6,A.z1-0.5);                              // 巷 A
    // 東側騎樓在巷 A 口斷開：巷口兩邊的樓房是牆角（騎樓照舊接到巷口）——巷子比騎樓深的那一段，兩側是樓房
    nav.blockRect((F.east+AD+F.east+A.len)/2,A.z0-10,A.len-AD,20-0.5,0); nav.blockRect((F.east+AD+F.east+A.len)/2,A.z1+10,A.len-AD,20-0.5,0);
    for(const p of S.pillars(L)) nav.blockRect(p.x,p.z,0.7,0.7,0);
    nav._cm=null;
    // 地面（套件，暫代）：柏油路、路邊機車格白線、雙黃線、騎樓地坪、巷子；兩頭接下去到 ±R.z1
    const n0=g.children.length;
    { const r=TK.road(R.z1-R.z0,R.x1-R.x0); r.position.set(0,0,(R.z0+R.z1)/2); r.rotation.y=Math.PI/2; g.add(r); }
    const flat=(x0,x1,z0,z1,c,y)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),M(c)); m.rotation.x=-Math.PI/2; m.position.set((x0+x1)/2,y||0.012,(z0+z1)/2); m.receiveShadow=true; g.add(m); return m; };
    flat(F.west-AD-0.4,F.west,R.z0,R.z1,'#bdb6aa'); flat(F.east,F.east+AD+0.4,R.z0,A.z0,'#bdb6aa'); flat(F.east,F.east+AD+0.4,A.z1,R.z1,'#bdb6aa');   // 騎樓地坪
    flat(F.east,F.east+A.len+2,A.z0,A.z1,'#9d9c98',0.008);                         // 巷 A（柏油，淺灰 D30）
    for(const sx of [-1,1]){ const xe=sx*R.x1, xi=xe-sx*(R.parkW||1.6); flat(Math.min(xi,xi+sx*0.1),Math.max(xi,xi+sx*0.1),WK.z0,WK.z1,'#efefe8',0.02);
      for(let z=WK.z0;z<=WK.z1;z+=2){ if(sx>0&&z>A.z0-1&&z<A.z1+1) continue; flat(Math.min(xi,xe),Math.max(xi,xe),z-0.05,z+0.05,'#efefe8',0.02); } }
    for(const dx of [-0.09,0.09]) flat(dx-0.05,dx+0.05,R.z0,R.z1,'#e8c040',0.02);
    for(const c of L.crossings||[]) for(let x=R.x0+0.8;x<R.x1-0.5;x+=1.2) flat(x-0.28,x+0.28,c.z-c.w/2+0.3,c.z+c.w/2-0.3,'#efefe8',0.022);
    { const m=new THREE.Mesh(new THREE.PlaneGeometry(220,260),M('#6d6a64')); m.rotation.x=-Math.PI/2; m.position.y=-0.02; m.receiveShadow=true; g.add(m); }
    const tmpGround=g.children.slice(n0); for(const o of tmpGround) o.userData.dyn=true;
    // 兩側樓房：備用方塊（正式模型載入後藏起來）＋鏡頭碰撞；巷 A 兩側、盡頭也擋
    const fb=[], colM=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide});
    const addCollider=(x,z,w,d,h)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h||14,d),colM); m.position.set(x,(h||14)/2,z); g.add(m); E.colliders.push(m); };
    for(const q of L.shops){ const w=q.z1-q.z0, sx=q.side==='W'?-1:1, fx=sx>0?F.east:F.west, h=L.groundH+(q.floors-1)*L.floorH, cz=(q.z0+q.z1)/2;
      const ud=q.arcade===false?F.depth-AD:F.depth, ux=q.arcade===false?fx+sx*(AD+ud/2):fx+sx*F.depth/2;   /* 沒有騎樓的五間：樓上也退到店面線，門前是露天的人行道 */
      const up=new THREE.Mesh(new THREE.BoxGeometry(ud,h-L.groundH,w),M(sx>0?'#d6cdbd':'#cfc5b2')); up.position.set(ux,L.groundH+(h-L.groundH)/2,cz); up.userData.tzfb=true; up.userData.dyn=true; g.add(up); fb.push(up);
      const lo=new THREE.Mesh(new THREE.BoxGeometry(F.depth-AD,L.groundH,w),M('#bfb6a8')); lo.position.set(fx+sx*(AD+(F.depth-AD)/2),L.groundH/2,cz); lo.userData.tzfb=true; lo.userData.dyn=true; g.add(lo); fb.push(lo);
      addCollider(fx+sx*(AD+(F.depth-AD)/2),cz,F.depth-AD,w,h); if(q.arcade!==false) addCollider(fx+sx*F.depth/2,cz,F.depth,w,h-L.groundH); }
    addCollider(F.east+A.len+2+7,0,14,A.z1-A.z0+8,22);
    // 互動點：回公館、各店門口
    const TG=L.toGongguan; E.interactables.push({x:TG.x,z:TG.z,radius:TG.r+0.6,label:TG.label,exit:{to:'gongguan',spawn:Object.assign({},TG.spawn)}});
    for(const q of L.shops){ const sx=q.side==='W'?-1:1, zn='tz_'+q.id, hasRoom=typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[zn];
      const it={x:(sx>0?F.east:F.west)+sx*(AD-0.9),z:(q.z0+q.z1)/2,radius:Math.min(1.6,Math.max(1.0,(q.z1-q.z0)/2-0.2)),label:(hasRoom?'進':'看')+q.name,tzShop:q.id};
      if(hasRoom) it.exit={to:zn}; else it.look=q.name+(q.sub?'。'+q.sub:(q.type?'。'+q.type:''))+'。';   /* 暫定的字（AA 可以改）；店名照配置：五間、三間是使用者指定的正式名稱，其他是種類 */
      E.interactables.push(it); }
    // 夜間：路燈（套件，兩側交錯）＋地上的光圈
    const pools=[]; let li=0; for(let z=WK.z0+6;z<WK.z1;z+=14,li++){ const sx=li%2?-1:1, x=sx*(R.x1-0.3); if(sx>0&&z>A.z0-2&&z<A.z1+2) continue;
      if(W3.lampPost){ const lp=W3.lampPost(); lp.position.set(x,0,z); lp.rotation.y=sx>0?-Math.PI/2:Math.PI/2; g.add(lp); } nav.blockCircle(x,z,0.3);
      const pl=TK.lightPool(4.2,'rgba(255,206,140,1)'); pl.position.set(x-sx*1.0,0.03,z); pl.userData.dyn=true; g.add(pl); pools.push(pl); }
    // 夜市攤（第 2 版）：位置照配置 stalls；導航照攤車＋後面站人的範圍擋（營業、收攤一樣大：導航不隨時間變）。模型 tingzhou_stalls.glb 的 STALL_<kind>_open／_closed，照時間切換
    const ST=L.stalls, stalls=[]; if(ST) for(const q of ST.list){ const b=S.stallBlock(q,L), c=Math.cos(q.yaw), sn=Math.sin(q.yaw), ax=Math.abs(sn)>0.5;
      nav.blockRect(q.x-sn*b.back,q.z-c*b.back,ax?b.d:b.w,ax?b.w:b.d,0); stalls.push({id:q.id,kind:q.kind,x:q.x,z:q.z,yaw:q.yaw,half:b.w/2,name:(ST.kinds&&ST.kinds[q.kind]||{}).name,isOpen:false,open:null,closed:null}); }
    // 禮貌生財（X332）：巷 A 後段南側靠公館那一端，一樓退成騎樓——騎樓裡走得進去；兩根柱子、算命桌（連兩張椅子、盆栽）擋住；門前留通道
    const LM=L.limao; let lm=null; if(LM){ const T=LM.table; open(LM.x0+0.25,A.z1-0.5,LM.x1-0.25,LM.z+LM.dep-0.5); for(const p of LM.pillars) nav.blockRect(p[0],p[1],0.7,0.7,0);
      nav.blockRect(T.x,T.z,T.w+0.2,T.d+1.5,0); nav.blockRect(T.x+0.95,T.z+0.55,0.5,0.5,0); lm={open:false,masterAway:false,table:T,door:null,nodes:{}}; }
    S.limaoOpen=function(h,L2){ const q=(L2||LAY()).limao; return !!q&&h>=q.from&&h<q.to; };
    nav._cm=null;
    const zoneTime=(h,E2)=>{ let k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); k=Math.max(0,Math.min(1,k)); TK.setNight(k); if(E2&&E2.hemi) E2.hemi.intensity+=0.7*k; for(const p of pools) if(p.material) p.material.opacity=0.55*k; 
      let on=false; const off=zone.tzStallOff||{}; for(const q of stalls){ const o=!zone.tzStallsClosed&&!off[q.id]&&S.stallOpen(h,q,L); q.isOpen=o; on=on||o; if(q.open) q.open.visible=o; if(q.closed) q.closed.visible=!o; }
      if(lm){ const o=S.limaoOpen(h,L)&&!zone.tzLimaoOff, N=lm.nodes, room=typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[LM.zone]; lm.open=o; lm.masterAway=o&&!!zone.tzLimaoAway;
        if(N.LIMAO_TABLE_open) N.LIMAO_TABLE_open.visible=o; if(N.LIMAO_TABLE_closed) N.LIMAO_TABLE_closed.visible=!o; if(N.LIMAO_SHOPLIGHT) N.LIMAO_SHOPLIGHT.visible=o;
        if(lm.door){ const d=lm.door; if(o&&room){ d.label='進'+LM.name; d.exit={to:LM.zone}; delete d.look; } else { d.label='看'+LM.name; delete d.exit; d.look=o?LM.name+'。':LM.name+'。門關著，裡面沒有開燈。'; } } }   /* 關著的那一句是暫定的（AA 可以改） */
      if(zone.tzStallMat) zone.tzStallMat.emissiveIntensity=0.25+0.85*k; if(zone.tzGlowMat) zone.tzGlowMat.emissiveIntensity=0.5+2.5*k; zone.tzStallsOn=on; };
    const FG=L.fromGongguan, zone={group:g,nav,spawn:{x:FG.x,z:FG.z,yaw:FG.yaw},lamps:[],buildings:fb,applyTimeOutdoor:zoneTime,onLamps(on){}};
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.tingzhou_street']&&Z3.attachWenzhouModel) ASSETS.loadOne('bldg.tingzhou_street').then(c=>{ if(!c||!c.scene||E.zone!==zone) return;
      Z3.attachWenzhouModel(E,g,c.scene.clone(true),'tzfb','tingzhou_street_glb'); zone.tzFormal=true; }).catch(e=>console.warn('汀州路正式模型載入失敗，用方塊立面',e));
    // 路邊的機車、腳踏車（第 3 版；使用者 11-10 21:5x：「路邊新加的機車……長得幾乎一樣莫名其妙」；BB：兩側從頭排到尾、同樣間距、同樣角度，像複製貼上的一道牆）：
    //   一小群一小群停（三到六台），群和群之間空一到三格，有的路段整段沒車；同一群斜的方向差不多、每台再歪一點；有的車頭朝外；五群裡一群是腳踏車（淑女車、公共單車、登山車…混著）。
    //   店門口、巷 A 口、斑馬線、攤位前不停。機車用公館、溫州街同一套模型（十二款，各自的配色，照位置挑）；腳踏車用校園那一套（W3.bikeAny）。
    { const scG=new THREE.Group(), scList=[], scC=['#c9463d','#2b2b2d','#e8e6e0','#3d6fb0','#8a8f98','#2f6a4a','#d9b23a']; const hash=(a,b)=>{ const t=Math.sin(a*12.9898+b*78.233)*43758.5453; return t-Math.floor(t); };
      const doors=L.shops.filter(q=>q.enter||q.arcade===false||q.concept).map(q=>({s:q.side==='W'?-1:1,z:(q.z0+q.z1)/2}));
      const busy=(x,zz,sx)=>stalls.some(q=>Math.abs(q.x-x)<1.6&&Math.abs(q.z-zz)<q.half+0.9)||(L.crossings||[]).some(c=>Math.abs(zz-c.z)<c.w/2+0.6)||doors.some(d=>d.s===sx&&Math.abs(d.z-zz)<1.1);
      const PW=R.parkW||1.6; let pv=null, bikes=0, groups=0; const gaps={'-1':0,'1':0}, scSt={n:0,dark:0,tailA:0,run3:0,adjSame:0,codes:{}};
      for(const sx of [-1,1]){ const x=sx*(R.x1-PW/2); let zz=WK.z0+1.2+hash(sx,1)*2, gi=0;
        while(zz<WK.z1-1.5){ gi++; const hg=hash(gi*3.1+sx*17,2), n=3+Math.floor(hash(gi,sx+5)*4), isBike=hash(gi*1.7,sx+9)<0.2, slant=(hash(gi,sx+11)-0.5)*0.5, pitch=isBike?0.62:0.8+hash(gi,sx+13)*0.14;
          if(hg<0.18){ zz+=4+hash(gi,sx+3)*4; gaps[sx]++; continue; }   /* 這一段整段沒車 */
          groups++; for(let k=0;k<n&&zz<WK.z1-1.2;k++,zz+=pitch){ if(busy(x,zz,sx)) continue; const jx=(hash(zz,3)-0.5)*0.32, ry=sx*Math.PI/2+slant+(hash(zz,5)-0.5)*0.22+(hash(zz,7)<0.12?Math.PI:0);   /* 第 3 版：前後錯開 ±16 cm、車頭左右各轉到 6 度 */
            if(isBike){ if(W3.bikeAny){ const b=W3.bikeAny(scC[Math.floor(hash(zz,9)*7)],Math.round(zz*10)+sx*999,null,1.7); b.position.set(x+jx,0,zz); b.rotation.y=ry; g.add(b); bikes++; nav.blockRect(x,zz,PW-0.2,0.55,0); } continue; }
            const pk=S.pickScooter(zz,sx,pv,scSt); pv={code:pk.code,tail:pk.tail,cf:pk.cf,pp:pv}; const c=pk.col, o=TK.scooter(c); o.position.set(x+jx,0,zz); o.rotation.y=ry; o.userData.dyn=true; scG.add(o);
            scList.push({o,color:c,code:pk.code,pcol:c,grp:(sx>0?'E':'W')+Math.floor((zz-WK.z0)/20)}); nav.blockRect(x,zz,PW-0.2,0.8,0); }
          zz+=1.5+hash(gi,sx+15)*2.6; gaps[sx]++; } }
      nav._cm=null; g.add(scG); zone.tzScStat=scSt; zone.tzScList=scList.map(q=>({code:q.code,col:q.pcol,grp:q.grp})); zone.tzScooters=scList.length; zone.tzBikes=bikes; zone.tzParkGroups=groups; zone.tzParkGaps=gaps[-1]+gaps[1];
      if(scList.length&&Z3.attachWzScooters&&typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.wz_scooter']){ if(typeof P3!=='undefined'&&P3.mergeStatic) P3.mergeStatic(scG);
        ASSETS.loadOne('bldg.wz_scooter').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const n=Z3.attachWzScooters(g,scG,scList,c.scene,'tz_scooters_glb'); zone.tzScooterGLB=n; }).catch(e=>console.warn('汀州路機車模型載入失敗',e)); } }
    if(lm){ zone.tzLimao=lm; lm.door={x:LM.door.x,z:LM.door.z,radius:LM.door.r,prio:1,label:'看'+LM.name,look:LM.name+'。',tzLimaoDoor:true}; if(typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[LM.zone]){ lm.door.label='進'+LM.name; lm.door.exit={to:LM.zone}; delete lm.door.look; } E.interactables.push(lm.door); }   /* LAWWW 接：桌前的互動（配置 limao.table.at）、上師（seatMaster）、zone.tzLimaoOff／tzLimaoAway */
    zone.tzStalls=stalls;   /* LAWWW 接看／買：每一攤的 id、kind、name、位置、isOpen（現在開著嗎）；zone.tzStallsClosed＝true 全部收攤（颱風、大雨）；zone.tzStallOff[id]＝true 那一攤今天不擺（套圈圈只有週五六日：配置 kinds.ring.days） */
    if((stalls.length||lm)&&typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.tingzhou_stalls']) ASSETS.loadOne('bldg.tingzhou_stalls').then(c=>{ if(!c||!c.scene||E.zone!==zone) return;
      for(const q of stalls) for(const st of ['open','closed']){ const src=c.scene.getObjectByName('STALL_'+q.kind+'_'+st); if(!src) continue; const o=src.clone(true); o.position.set(q.x,0,q.z); o.rotation.set(0,q.yaw,0); o.userData.dyn=true;
        o.traverse(m=>{ if(m.isMesh){ m.castShadow=true; if(m.material&&m.material.name==='tzs_atlas') zone.tzStallMat=m.material; if(m.material&&m.material.name==='tzs_glow'){ zone.tzGlowMat=m.material; m.castShadow=false; } } }); o.visible=false; g.add(o); q[st]=o; }
      if(lm){ const T=lm.table; for(const nm of ['LIMAO_TABLE_open','LIMAO_TABLE_closed','LIMAO_SHOPLIGHT']){ const src=c.scene.getObjectByName(nm); if(!src) continue; const o=src.clone(true); o.position.set(T.x,0,T.z); o.rotation.set(0,T.yaw,0); o.userData.dyn=true;
          o.traverse(m=>{ if(m.isMesh){ m.castShadow=nm!=='LIMAO_SHOPLIGHT'; if(m.material&&m.material.name==='tzs_glow') zone.tzGlowMat=m.material; } }); o.visible=false; g.add(o); lm.nodes[nm]=o; } }
      if(E.applyTime) try{ E.applyTime(); }catch(e){} else zoneTime(E.hour||12,E); }).catch(e=>console.warn('汀州路攤位模型載入失敗',e));
    return zone; };
  /* 公館那一側的三攤（NIGHT-MARKET-1110；使用者 11-10「公館那一側也擺幾攤」；配置 stalls.gongguan，公館區域的座標）：擋導航、照各攤的時間切換營業／收攤（包住公館的 applyTimeOutdoor）。
     zone.ggStalls＝每一攤的 id、kind、name、位置、isOpen（LAWWW 接看／買）；zone.tzStallsClosed、zone.tzStallOff 和汀州路同一套開關 */
  S.gongguanStalls=function(E,zone,L){ const ST=L&&L.stalls, list=(ST&&ST.gongguan)||[]; if(!zone||!zone.nav||!list.length) return 0; const stalls=[];
    for(const q of list){ const b=S.stallBlock(q,L), c=Math.cos(q.yaw), sn=Math.sin(q.yaw), ax=Math.abs(sn)>0.5; zone.nav.blockRect(q.x-sn*b.back,q.z-c*b.back,ax?b.d:b.w,ax?b.w:b.d,0);
      stalls.push({id:q.id,kind:q.kind,x:q.x,z:q.z,yaw:q.yaw,half:b.w/2,name:(ST.kinds&&ST.kinds[q.kind]||{}).name,isOpen:false,open:null,closed:null}); }
    zone.nav._cm=null; zone.ggStalls=stalls; const t0=zone.applyTimeOutdoor;
    zone.applyTimeOutdoor=function(h,E2){ if(t0) t0.call(this,h,E2); let k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); k=Math.max(0,Math.min(1,k)); const off=zone.tzStallOff||{};
      for(const q of stalls){ const o=!zone.tzStallsClosed&&!off[q.id]&&S.stallOpen(h,q,L); q.isOpen=o; if(q.open) q.open.visible=o; if(q.closed) q.closed.visible=!o; }
      if(zone.tzStallMat) zone.tzStallMat.emissiveIntensity=0.25+0.85*k; if(zone.tzGlowMat) zone.tzGlowMat.emissiveIntensity=0.5+2.5*k; };
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.tingzhou_stalls']) ASSETS.loadOne('bldg.tingzhou_stalls').then(c=>{ if(!c||!c.scene||E.zone!==zone) return;
      for(const q of stalls) for(const st of ['open','closed']){ const src=c.scene.getObjectByName('STALL_'+q.kind+'_'+st); if(!src) continue; const o=src.clone(true); o.position.set(q.x,0,q.z); o.rotation.set(0,q.yaw,0); o.userData.dyn=true;
        o.traverse(m=>{ if(m.isMesh){ m.castShadow=true; if(m.material&&m.material.name==='tzs_atlas') zone.tzStallMat=m.material; if(m.material&&m.material.name==='tzs_glow'){ zone.tzGlowMat=m.material; m.castShadow=false; } } }); o.visible=false; zone.group.add(o); q[st]=o; }
      if(E.applyTime) try{ E.applyTime(); }catch(e){} }).catch(e=>console.warn('公館攤位模型載入失敗',e));
    return stalls.length; };
  /* 公館那一邊的入口（這一版）：店面街 G10 門口（配置 toGongguan.spawn 的位置往店面 3 m）多一個「往汀州路」的互動點。G10 的店面模型改成巷口、G09／G11 換店是下一步（等使用者定）。
     包住 gongguan 的 build（不改 zones3d.js）：build 完以後加互動點 */
  S.hookGongguan=function(){ if(typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES.gongguan||Z3.ZONES.gongguan._tz) return false; const zd=Z3.ZONES.gongguan, b0=zd.build;
    zd.build=function(E){ const z=b0.call(this,E); const L=LAY(); if(L&&Z3.ZONES.tingzhou){ const sp=L.toGongguan.spawn, FG=L.fromGongguan;
        E.interactables.push({x:sp.x,z:sp.z+3,radius:1.6,prio:1,label:'往汀州路（巷子）',exit:{to:'tingzhou',spawn:{x:FG.x,z:FG.z,yaw:FG.yaw}},tzGate:true}); }
      S.gongguanStalls(E,z,L); return z; };
    zd._tz=true; return true; };
  if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['bldg.tingzhou_street']) ASSETS.manifest['bldg.tingzhou_street']={url:'assets/models/env/second_ai/tingzhou_street.glb',type:'building',lazy:true,source:'LAWWW2 tools/blender/env_second/wz_street.py --set tingzhou（汀州路三段一段街的樓房、騎樓、店面；五間店面的貼圖從使用者 11-10 的概念圖裁出來：tz_fronts_tex.py）',license:'本作'};
  if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['bldg.tingzhou_stalls']) ASSETS.manifest['bldg.tingzhou_stalls']={url:'assets/models/env/second_ai/tingzhou_stalls.glb',type:'building',lazy:true,source:'LAWWW2 tools/blender/env_second/nm_stalls.py（夜市十攤＋背景三攤，各有營業、收攤兩個樣子；招牌、菜單從使用者 11-10 的十張參考圖裁：nm_stalls_tex.py）',license:'本作'};
  if(typeof Z3!=='undefined'&&Z3.ZONES&&LAY()){ Z3.ZONES.tingzhou={id:'tingzhou',name:'汀州路',indoor:false,cityLight:0.95,size:[LAY().nav.w,LAY().nav.d],camDist:5.6,build(E){ return S.build(E); }}; S.hookGongguan(); }
  return S;
})();

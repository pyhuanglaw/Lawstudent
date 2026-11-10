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
  S.pillars=function(L){ const F=L.facade, out=[]; for(const q of L.shops){ const w=q.side==='W'; out.push({x:(w?F.west-0.3:F.east+0.3),z:(w?q.z0:q.z1),id:q.id}); } return out; };
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
      const up=new THREE.Mesh(new THREE.BoxGeometry(F.depth,h-L.groundH,w),M(sx>0?'#d6cdbd':'#cfc5b2')); up.position.set(fx+sx*F.depth/2,L.groundH+(h-L.groundH)/2,cz); up.userData.tzfb=true; up.userData.dyn=true; g.add(up); fb.push(up);
      const lo=new THREE.Mesh(new THREE.BoxGeometry(F.depth-AD,L.groundH,w),M('#bfb6a8')); lo.position.set(fx+sx*(AD+(F.depth-AD)/2),L.groundH/2,cz); lo.userData.tzfb=true; lo.userData.dyn=true; g.add(lo); fb.push(lo);
      addCollider(fx+sx*(AD+(F.depth-AD)/2),cz,F.depth-AD,w,h); addCollider(fx+sx*F.depth/2,cz,F.depth,w,h-L.groundH); fb[fb.length-1]&&0; }
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
    nav._cm=null;
    const zoneTime=(h,E2)=>{ let k=h>=19.2||h<5.6?1:(h>=17.4?(h-17.4)/1.8:(h<6.3?(6.3-h)/0.7:0)); k=Math.max(0,Math.min(1,k)); TK.setNight(k); if(E2&&E2.hemi) E2.hemi.intensity+=0.7*k; for(const p of pools) if(p.material) p.material.opacity=0.55*k; };
    const FG=L.fromGongguan, zone={group:g,nav,spawn:{x:FG.x,z:FG.z,yaw:FG.yaw},lamps:[],buildings:fb,applyTimeOutdoor:zoneTime,onLamps(on){}};
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.tingzhou_street']&&Z3.attachWenzhouModel) ASSETS.loadOne('bldg.tingzhou_street').then(c=>{ if(!c||!c.scene||E.zone!==zone) return;
      Z3.attachWenzhouModel(E,g,c.scene.clone(true),'tzfb','tingzhou_street_glb'); zone.tzFormal=true; }).catch(e=>console.warn('汀州路正式模型載入失敗，用方塊立面',e));
    return zone; };
  /* 公館那一邊的入口（這一版）：店面街 G10 門口（配置 toGongguan.spawn 的位置往店面 3 m）多一個「往汀州路」的互動點。G10 的店面模型改成巷口、G09／G11 換店是下一步（等使用者定）。
     包住 gongguan 的 build（不改 zones3d.js）：build 完以後加互動點 */
  S.hookGongguan=function(){ if(typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES.gongguan||Z3.ZONES.gongguan._tz) return false; const zd=Z3.ZONES.gongguan, b0=zd.build;
    zd.build=function(E){ const z=b0.call(this,E); const L=LAY(); if(L&&Z3.ZONES.tingzhou){ const sp=L.toGongguan.spawn, FG=L.fromGongguan;
        E.interactables.push({x:sp.x,z:sp.z+3,radius:1.6,prio:1,label:'往汀州路（巷子）',exit:{to:'tingzhou',spawn:{x:FG.x,z:FG.z,yaw:FG.yaw}},tzGate:true}); } return z; };
    zd._tz=true; return true; };
  if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['bldg.tingzhou_street']) ASSETS.manifest['bldg.tingzhou_street']={url:'assets/models/env/second_ai/tingzhou_street.glb',type:'building',lazy:true,source:'LAWWW2 tools/blender/env_second/wz_street.py --set tingzhou（汀州路三段一段街的樓房、騎樓、店面；五間店面的貼圖從使用者 11-10 的概念圖裁出來：tz_fronts_tex.py）',license:'本作'};
  if(typeof Z3!=='undefined'&&Z3.ZONES&&LAY()){ Z3.ZONES.tingzhou={id:'tingzhou',name:'汀州路',indoor:false,cityLight:0.95,size:[LAY().nav.w,LAY().nav.d],camDist:5.6,build(E){ return S.build(E); }}; S.hookGongguan(); }
  return S;
})();

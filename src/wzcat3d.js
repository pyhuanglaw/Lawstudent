/* ===== 溫州街的貓會走動（WZ-CAT-LIFE-1023／USER_WANTS J13「貓咪要能動」；LAWWW2-C 2026-10-27）=====
   正式模型 bldg.wz_cat 的 CAT_walk（v3）有骨架和四段動畫：cat_walk（1 秒一步、原地走）、cat_idle（站著甩尾巴、轉頭）、cat_sit（0.75 秒坐下；倒著播＝站起來）、cat_sit_idle（坐著甩尾巴）。
   白天（07:00～17:30）、沒下雨、不是寒流那一週、沒有走失、沒被收養：貓醒著，在公園幾個點之間慢慢走——到一個點坐下待一陣子（真實時間 25～70 秒），站起來、看一下，再走到下一個點。
   晚上、下雨、寒流照舊（zones3d.js buildWzPark：趴在老樹圓椅上／躲在涼亭石桌底下）。
   - 玩家走到 1.6 m 內：貓停下來站著看玩家（走路的話停住）；劇情在演（GAME 忙）時坐著不動。
   - 「摸摸」的互動點（buildWzPark 推進 E.interactables、park:'cat' 那一個）跟著貓走。
   - 找路用公園的導航格（E.pathTo）；幾個點在 attach 時用 E.canStand 檢查，站不住的不用。
   - 舊的 GLB（沒有骨架、沒有動畫）：attach 回傳 false，照舊放趴著的貓。
   - 存檔不動（貓的位置不存）。
   - 劇情要貓趴在圓椅上（AA_493「所長回來」那一場，不管幾點；LAWWW-C 10-27 23:08Z）：演之前 WZCAT.hold('lie')，演完 WZCAT.release()（請放在 finally）。見下面 S.hold。*/
const WZCAT=(function(){
  const S={};
  /* 貓會去的地方（溫州街區域座標；x 往東、z 往南）：老樹圓椅前（兩個點，最常回來）、涼亭東邊台階下、路燈下、土地公旁邊、東邊路燈和鞦韆之間、前面草地的步道邊 */
  S.SPOTS=[{x:26.0,z:23.3,w:3},{x:24.2,z:22.4,w:2},{x:17.0,z:25.6,w:1},{x:23.1,z:24.3,w:1},{x:13.9,z:26.9,w:1},{x:29.8,z:23.6,w:1},{x:25.2,z:14.2,w:1}];
  S.SPEED=0.32;   /* m/s：cat_walk 一步一秒、步幅約 0.32 m（腳不滑）*/
  S.AWAKE=[7,17.5];
  S.NEAR=1.6; S.FAR=2.8;
  let cat=null, held=null;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['wzcat3d:held']=()=>{ held=null; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const P=()=>typeof PARK!=='undefined'?PARK:null;
  S.awake=function(G){ if(!G||held) return false;   /* hold 期間＝趴著（取名、環境句照「趴在圓椅上」那一版：PARK.catAwake 照這個）*/ const h=G.hour; if(!(h>=S.AWAKE[0]&&h<S.AWAKE[1])) return false; const K=P();
    if(K&&((K.rainy&&K.rainy(G))||(K.catCold&&K.catCold(G))||(K.catLost&&K.catLost(G))||(K.catAdopted&&K.catAdopted(G)))) return false; return true; };
  const pick=(not,rnd)=>{ const L=cat.spots.filter(s=>s!==not); let t=L.reduce((a,s)=>a+s.w,0)*rnd(); for(const s of L){ t-=s.w; if(t<=0) return s; } return L[L.length-1]; };
  /* 接手：opts={G, rnd}；成功回傳 true（呼叫的地方就不要再放趴著的貓）*/
  S.attach=function(E,parent,glb,opts){ opts=opts||{}; const G=opts.G; cat=null;
    if(!E||!parent||!glb||!glb.scene||!(glb.animations&&glb.animations.length)||!S.awake(G)) return false;
    if(typeof THREE_JSM==='undefined'||!THREE_JSM.SkeletonUtils||typeof Z3==='undefined'||!Z3.wzCatModel) return false;
    const root=THREE_JSM.SkeletonUtils.clone(glb.scene); if(!root.getObjectByName('CAT_walk_mesh')) return false;   /* v2 的 GLB：CAT_walk 是靜止的網格 */
    const m=Z3.wzCatModel(root,G,'walk'); if(!m) return false;
    const rnd=opts.rnd||Math.random, can=(x,z)=>!E.canStand||E.canStand(x,z,0.18,0);
    const spots=S.SPOTS.filter(s=>can(s.x,s.z)); if(spots.length<2) return false;
    const mixer=new THREE.AnimationMixer(m), act={};
    for(const c of glb.animations){ const a=mixer.clipAction(c); act[c.name]=a; }
    if(!act.cat_walk||!act.cat_idle||!act.cat_sit||!act.cat_sit_idle) return false;
    act.cat_sit.setLoop(THREE.LoopOnce,1); act.cat_sit.clampWhenFinished=true;
    m.traverse(o=>{ if(o.isMesh) o.frustumCulled=false; });   /* 骨架動畫的包圍盒是靜止的：走出去以後會被誤判在畫面外 */
    const blob=shadowBlob(); m.add(blob);
    const s0=spots[0]; m.position.set(s0.x,0,s0.z); m.rotation.y=Math.PI; parent.add(m);
    const it=(E.interactables||[]).find(q=>q&&q.park==='cat')||null;
    cat={E,obj:m,mixer,act,spots,at:s0,next:null,path:null,state:'sit',t:15+rnd()*30,cur:null,rnd,it,yaw:Math.PI,glb,parent,G,lie:opts.lie||null,it0:it&&{x:it.x,z:it.z},lieObj:null};   /* lie：趴在圓椅上的位置（zones3d.js 晚上放趴著的貓的同一個位置）、it0：互動點原本的位置（圓椅）*/
    play('cat_sit_idle',0); return true; };
  function shadowBlob(){ if(typeof document==='undefined'||!document.createElement) return new THREE.Object3D(); const cv=document.createElement('canvas'); cv.width=cv.height=64; const c=cv.getContext('2d'), g=c.createRadialGradient(32,32,2,32,32,31);
    g.addColorStop(0,'rgba(0,0,0,0.42)'); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(0,0,64,64);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(0.34,0.56),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));
    m.rotation.x=-Math.PI/2; m.position.y=0.012; m.renderOrder=1; m.name='wz_cat_shadow'; return m; }   /* 貓的影子（模型不投影，走起來會像浮著）*/
  function play(name,fade){ const a=cat.act[name]; if(!a||cat.cur===name) return; const prev=cat.cur&&cat.act[cat.cur];
    a.reset(); a.timeScale=1; a.enabled=true; a.setEffectiveWeight(1); a.play(); if(prev&&fade>0) prev.crossFadeTo(a,fade,false); else if(prev) prev.stop(); cat.cur=name; }
  function standUp(){ const a=cat.act.cat_sit; play('cat_sit',0.15); a.time=a.getClip().duration; a.timeScale=-1; a.paused=false; }   /* 坐下倒著播＝站起來 */
  const inScene=o=>{ for(let p=o;p;p=p.parent) if(p.isScene) return true; return false; };
  const busy=()=>{ const GM=typeof GAME!=='undefined'?GAME:null; return !!(GM&&GM.E&&GM.E.player&&GM.E.player.busy); };
  /* 每一格（溫州街區域的 update 呼叫）*/
  S.update=function(dt,E){ if(!cat||cat.E!==E) return; if(!inScene(cat.obj)){ cat=null; return; }
    if(held&&cat.lieObj){ if(cat.it&&cat.it0){ cat.it.x=cat.it0.x; cat.it.z=cat.it0.z; } return; }   /* 趴在圓椅上：不走、不更新動畫 */
    dt=Math.min(dt,0.25); const c=cat, o=c.obj, pl=E.player&&E.player.obj, G=typeof GAME!=='undefined'&&GAME.G;
    const dp=pl?Math.hypot(pl.position.x-o.position.x,pl.position.z-o.position.z):99;
    const turnTo=(yaw,k)=>{ let d=yaw-o.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); o.rotation.y+=d*Math.min(1,k*dt); };
    c.t-=dt;
    if(c.state==='sit'){
      if(c.cur!=='cat_sit_idle'&&c.cur==='cat_sit'&&!c.act.cat_sit.isRunning()) play('cat_sit_idle',0.2);
      if(c.t<=0&&!busy()&&dp>S.NEAR&&S.awake(G)){ standUp(); c.state='rise'; c.t=c.act.cat_sit.getClip().duration+0.05; } }
    else if(c.state==='rise'){ if(c.t<=0){ play('cat_idle',0.2); c.state='look'; c.t=1.5+c.rnd()*2.5; } }
    else if(c.state==='look'){
      if(pl&&dp<S.FAR) turnTo(Math.atan2(pl.position.x-o.position.x,pl.position.z-o.position.z),3);
      if(busy()){ play('cat_sit',0.2); c.state='sit'; c.t=20; }
      else if(c.t<=0&&dp>S.NEAR){ const tgt=S.awake(G)?pick(c.at,c.rnd):c.spots[0]; const p=E.pathTo?E.pathTo(o.position.x,o.position.z,0,tgt.x,tgt.z,0):[[tgt.x,tgt.z]];
        if(p&&p.length){ c.path=p.map(q=>({x:q[0],z:q[1]})); c.next=tgt; c.state='walk'; play('cat_walk',0.25); } else c.t=3; } }
    else if(c.state==='walk'){
      if(dp<S.NEAR||busy()){ play('cat_idle',0.2); c.state='look'; c.t=busy()?99:2.5; }
      else { const w=c.path[0], dx=w.x-o.position.x, dz=w.z-o.position.z, d=Math.hypot(dx,dz), st=S.SPEED*dt;
        if(d<=st){ o.position.x=w.x; o.position.z=w.z; c.path.shift(); if(!c.path.length){ c.at=c.next; c.state='sit'; c.t=25+c.rnd()*45; play('cat_sit',0.25); } }
        else { const yaw=Math.atan2(dx,dz); turnTo(yaw,5); const f=Math.max(0,Math.cos(yaw-o.rotation.y)); o.position.x+=dx/d*st*f; o.position.z+=dz/d*st*f; c.act.cat_walk.timeScale=0.35+0.65*f; } } }
    if(c.it){ c.it.x=o.position.x; c.it.z=o.position.z+0.0; }
    c.mixer.update(dt); };
  S.state=()=>cat?{state:cat.state,t:+cat.t.toFixed(1),busy:busy(),x:+cat.obj.position.x.toFixed(2),z:+cat.obj.position.z.toFixed(2),yaw:+cat.obj.rotation.y.toFixed(2),clip:cat.cur,at:cat.at&&[cat.at.x,cat.at.z],path:cat.path?cat.path.length:0}:null;
  S._cat=()=>cat;   /* 測試用 */
  /* 劇情要貓固定趴在圓椅上（不管幾點）：hold('lie')。
     - 貓正在公園裡走（白天）：藏起走路的貓，圓椅上放趴著的貓（和晚上同一個模型、同一個位置），「摸摸」的互動點回到圓椅。
     - 還沒進公園、或晚上：進公園時 attach 不接手（awake＝false），zones3d.js 照晚上放趴著的貓。下雨照舊在石桌底下（AA_493 第 5 節）。
     - release()：拿掉趴著的貓，走路的貓從剛才的位置接著走（hold 的時候沒有走路的貓：下次進公園才會走）。hold 不存檔（讀檔以後沒有）。*/
  S.hold=function(mode){ held=mode||'lie'; if(!cat||cat.lieObj||!cat.lie||typeof Z3==='undefined'||!Z3.wzCatModel) return true;
    const m=Z3.wzCatModel(cat.glb.scene.clone(true),cat.G,'lie'); if(!m) return true; const L=cat.lie; m.position.set(L.x,L.y||0,L.z); m.rotation.y=L.yaw||0; cat.parent.add(m); cat.lieObj=m; cat.obj.visible=false;
    if(cat.it&&cat.it0){ cat.it.x=cat.it0.x; cat.it.z=cat.it0.z; } return true; };
  S.release=function(){ held=null; if(!cat) return; if(cat.lieObj){ if(cat.lieObj.parent) cat.lieObj.parent.remove(cat.lieObj); cat.lieObj=null; } cat.obj.visible=true; };
  S.held=()=>held;
  return S;
})();

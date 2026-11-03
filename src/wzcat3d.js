/* ===== 溫州街的貓會走動（WZ-CAT-LIFE-1023／USER_WANTS J13「貓咪要能動」；LAWWW2-C 2026-10-27）=====
   正式模型 bldg.wz_cat 的 CAT_walk（v3）有骨架和四段動畫：cat_walk（1 秒一步、原地走）、cat_idle（站著甩尾巴、轉頭）、cat_sit（0.75 秒坐下；倒著播＝站起來）、cat_sit_idle（坐著甩尾巴）。
   白天（07:00～17:30）、沒下雨、不是寒流那一週、沒有走失、沒被收養：貓醒著，在公園幾個點之間慢慢走——到一個點坐下待一陣子（真實時間 25～70 秒），站起來、看一下，再走到下一個點。
   - 玩家走到 1.6 m 內：貓停下來站著看玩家（走路的話停住）；劇情在演（GAME 忙）時坐著不動。
   - 「摸摸」的互動點（buildWzPark 推進 E.interactables、park:'cat' 那一個）跟著貓走。
   - 找路用公園的導航格（E.pathTo）；幾個點在 attach 時用 E.canStand 檢查，站不住的不用。
   - 舊的 GLB（沒有骨架、沒有動畫）：attach 回傳 false，照舊放趴著的貓。
   - 存檔不動（貓的位置不存）。
   - 劇情要貓趴在圓椅上（AA_493「所長回來」那一場，不管幾點；LAWWW-C 10-27 23:08Z）：演之前 WZCAT.hold('lie')，演完 WZCAT.release()（請放在 finally）。見下面 S.hold。
   WZ-CAT-FLOAT-RUB-1103（USER_WANTS X186；使用者 11-03「懸空的橘貓」「要會動吧」「會走過來蹭」）：
   - 原本醒著、睡著只在「進溫州街那一刻」判斷一次：早上 7 點前進來（或 17:30 前進來待到晚上），貓整天趴著（或整晚坐在草地上）。
     現在有骨架的模型一律交給這裡（opts.lie＝趴在圓椅上的位置，zones3d.js wzCatSpot）：睡著＝圓椅上放趴著的模型（state 'sleep'）、會呼吸；
     時間到了（07:00、雨停）自己醒來、從圓椅前站起來走；17:30 以後（或下雨）走回圓椅前（下雨走到涼亭東邊的台階下），再趴上去（下雨趴到石桌底下）。
   - 趴著的模型沒有骨架：用整隻上下微微起伏的「呼吸」（S.breathe；石桌底下、舊 GLB 那幾種 zones3d.js 自己放的也一樣）。甩尾巴要 LAWWW2 補有骨架的趴姿（cat_lie_idle）。
   - 蹭腳（S.RUB）：醒著、玩家站在 4 m 內不動 3 秒（坐著不算）→ 擲一次骰（55%；沒中 20 秒內不再擲）→ 貓走到玩家腳邊（離玩家中心 0.44 m，玩家碰撞半徑 0.33、貓身體半寬 0.11，貼著不穿過）、
     沿著腳邊慢慢繞半圈到一圈（0.16 m/s、身體側面朝玩家、頭往內偏一點），繞完一半機率坐在旁邊、一半走開；玩家一動就停下來看。蹭完 45 秒內不再蹭；劇情在演、被收養、寒流、走失、hold 期間都不蹭。
     專用的磨蹭動畫（頭和側身貼著磨）要 LAWWW2 補 cat_rub；現在用 cat_walk 慢速播。*/
const WZCAT=(function(){
  const S={};
  /* 貓會去的地方（溫州街區域座標；x 往東、z 往南）：老樹圓椅前（兩個點，最常回來）、涼亭東邊台階下、路燈下、土地公旁邊、東邊路燈和鞦韆之間、前面草地的步道邊 */
  S.SPOTS=[{x:26.0,z:23.3,w:3},{x:24.2,z:22.4,w:2},{x:17.0,z:25.6,w:1},{x:23.1,z:24.3,w:1},{x:13.9,z:26.9,w:1},{x:29.8,z:23.6,w:1},{x:25.2,z:14.2,w:1}];
  S.WAKE={bench:{x:26.0,z:23.3,yaw:0},under:{x:17.0,z:25.6,yaw:Math.PI/2}};   /* 睡醒站起來的地方／回去睡之前走到的地方：圓椅前（SPOTS[0]）、涼亭東邊台階下（SPOTS[2]）*/
  S.SPEED=0.32;   /* m/s：cat_walk 一步一秒、步幅約 0.32 m（腳不滑）*/
  S.AWAKE=[7,17.5];
  S.NEAR=1.6; S.FAR=2.8;
  S.RUB={R:4,WAIT:3,P:0.55,CD:45,MISS:20,RING:0.44,V:0.16,LEAN:0.25,CAT_R:0.12,MOVE:0.12};
  let cat=null, held=null; const breathers=[];
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['wzcat3d:held']=()=>{ held=null; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const P=()=>typeof PARK!=='undefined'?PARK:null;
  S.awake=function(G){ if(!G||held) return false;   /* hold 期間＝趴著（取名、環境句照「趴在圓椅上」那一版：PARK.catAwake 照這個）*/ const h=G.hour; if(!(h>=S.AWAKE[0]&&h<S.AWAKE[1])) return false; const K=P();
    if(K&&((K.rainy&&K.rainy(G))||(K.catCold&&K.catCold(G))||(K.catLost&&K.catLost(G))||(K.catAdopted&&K.catAdopted(G)))) return false; return true; };
  S.sleepWhere=G=>{ const K=P(); return !held&&K&&K.catUnder&&G&&K.catUnder(G)?'under':'bench'; };   /* 下雨睡石桌底下（AA_164 5-2）；hold 一律圓椅 */
  /* 呼吸：趴著的模型沒有骨架，整隻（原點在地面）上下微微起伏，3.4 秒一次 */
  function breath(o,dt){ const u=o.userData; u.bt=(u.bt==null?Math.random()*3.4:u.bt)+dt; const s=Math.sin(u.bt/3.4*Math.PI*2); o.scale.set(1+0.006*s,1+0.022*s,1+0.004*s); }
  S.breathe=function(o){ if(o&&breathers.indexOf(o)<0) breathers.push(o); return o; };
  const pick=(not,rnd)=>{ const L=cat.spots.filter(s=>s!==not); let t=L.reduce((a,s)=>a+s.w,0)*rnd(); for(const s of L){ t-=s.w; if(t<=0) return s; } return L[L.length-1]; };
  /* 接手：opts={G, rnd, lie:{x,y,z,yaw}（圓椅上）, under:{x,y,z,yaw}（石桌底下）}；成功回傳 true（呼叫的地方就不要再放趴著的貓）。
     睡著的時段要有 opts.lie 才接手（沒有就回傳 false，照舊由呼叫的地方放趴著的貓）*/
  S.attach=function(E,parent,glb,opts){ opts=opts||{}; const G=opts.G; cat=null;
    if(!E||!parent||!glb||!glb.scene||!(glb.animations&&glb.animations.length)) return false;
    const aw=S.awake(G); if(!aw&&!opts.lie) return false;
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
    cat={E,obj:m,mixer,act,spots,at:s0,next:null,path:null,state:'sit',t:15+rnd()*30,cur:null,rnd,it,yaw:Math.PI,glb,parent,G,lie:opts.lie||null,under:opts.under||null,it0:it&&{x:it.x,z:it.z},lieObj:null,lieAt:null,lieModel:null,
      rubCd:0,still:0,rolled:false,anchor:null,moved:false,rub:null,leave:false,pend:null,holdPrev:null};   /* lie：趴在圓椅上的位置（zones3d.js wzCatSpot）、it0：互動點原本的位置（圓椅）*/
    play('cat_sit_idle',0);
    if(!aw){ sleepNow(S.sleepWhere(G)); if(held) cat.holdPrev='sleep'; }   /* hold 期間進公園：release 以後照時段醒來 */
    return true; };
  function shadowBlob(){ if(typeof document==='undefined'||!document.createElement) return new THREE.Object3D(); const cv=document.createElement('canvas'); cv.width=cv.height=64; const c=cv.getContext('2d'), g=c.createRadialGradient(32,32,2,32,32,31);
    g.addColorStop(0,'rgba(0,0,0,0.42)'); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(0,0,64,64);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(0.34,0.56),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));
    m.rotation.x=-Math.PI/2; m.position.y=0.012; m.renderOrder=1; m.name='wz_cat_shadow'; return m; }   /* 貓的影子（模型不投影，走起來會像浮著）*/
  function play(name,fade){ const a=cat.act[name]; if(!a||cat.cur===name) return; const prev=cat.cur&&cat.act[cat.cur];
    a.reset(); a.timeScale=1; a.enabled=true; a.setEffectiveWeight(1); a.play(); if(prev&&fade>0) prev.crossFadeTo(a,fade,false); else if(prev) prev.stop(); cat.cur=name; }
  function standUp(){ const a=cat.act.cat_sit; play('cat_sit',0.15); a.time=a.getClip().duration; a.timeScale=-1; a.paused=false; }   /* 坐下倒著播＝站起來 */
  /* 趴著的模型（圓椅上／石桌底下）：放上去就藏起走路的貓；「摸摸」的互動點回到那裡 */
  function lieSpot(where){ return where==='under'?(cat.under||cat.lie):cat.lie; }
  function showLie(where){ const c=cat, L=lieSpot(where); if(!L||typeof Z3==='undefined'||!Z3.wzCatModel) return false;
    if(!c.lieModel) c.lieModel=Z3.wzCatModel(c.glb.scene.clone(true),c.G,'lie'); const m=c.lieModel; if(!m) return false;
    m.position.set(L.x,L.y||0,L.z); m.rotation.y=L.yaw||0; if(m.parent!==c.parent) c.parent.add(m); c.lieObj=m; c.lieAt=where; c.obj.visible=false;
    if(c.it){ if(where==='bench'&&c.it0){ c.it.x=c.it0.x; c.it.z=c.it0.z; } else { c.it.x=L.x-0.1; c.it.z=L.z+0.04; } } return true; }
  function hideLie(){ const c=cat; if(c.lieObj&&c.lieObj.parent) c.lieObj.parent.remove(c.lieObj); c.lieObj=null; c.lieAt=null; c.obj.visible=true; }
  function sleepNow(where){ if(!showLie(where)) return false; cat.state='sleep'; cat.path=null; cat.next=null; cat.rub=null; cat.leave=false; cat.pend=null; return true; }
  function wakeNow(E){ const c=cat, w=S.WAKE[c.lieAt]||S.WAKE.bench; hideLie(); const o=c.obj; o.position.set(w.x,E.heightAt?E.heightAt(w.x,w.z,0):0,w.z); o.rotation.y=w.yaw; c.at=c.spots.find(s=>Math.hypot(s.x-w.x,s.z-w.z)<0.05)||null;
    play('cat_sit_idle',0); standUp(); c.state='rise'; c.t=c.act.cat_sit.getClip().duration+0.05; }   /* 從圓椅前（或涼亭台階下）站起來：趴→坐→站要 LAWWW2 補跳下來的動畫（cat_jump）*/
  const inScene=o=>{ for(let p=o;p;p=p.parent) if(p.isScene) return true; return false; };
  const busy=()=>{ const GM=typeof GAME!=='undefined'?GAME:null; return !!(GM&&GM.E&&GM.E.player&&GM.E.player.busy); };
  /* 蹭腳：走到玩家腳邊 */
  function beginApproach(E,pp){ const c=cat, o=c.obj, R=S.RUB.RING, a0=Math.atan2(o.position.x-pp.x,o.position.z-pp.z);
    for(const da of [0,0.5,-0.5,1.0,-1.0,1.6,-1.6,2.4,-2.4,Math.PI]){ const a=a0+da, tx=pp.x+Math.sin(a)*R, tz=pp.z+Math.cos(a)*R; if(E.canStand&&!E.canStand(tx,tz,S.RUB.CAT_R,0)) continue;
      const p=E.pathTo?E.pathTo(o.position.x,o.position.z,0,tx,tz,0):[[tx,tz]]; if(!p||!p.length||Math.hypot(p[p.length-1][0]-tx,p[p.length-1][1]-tz)>0.3) continue;
      c.path=p.map(q=>({x:q[0],z:q[1]})); c.state='approach'; c.t=25; c.rub=null; play('cat_walk',0.25); return true; }
    c.rubCd=S.RUB.MISS; return false; }
  function beginRub(pp){ const c=cat, o=c.obj.position; c.rub={cx:pp.x,cz:pp.z,a:Math.atan2(o.x-pp.x,o.z-pp.z),r:Math.max(S.RUB.RING,Math.hypot(o.x-pp.x,o.z-pp.z)),dir:c.rnd()<0.5?1:-1,left:Math.PI*(1+c.rnd()),flips:0,swept:0};
    c.state='rub'; c.path=null; play('cat_walk',0.2); c.act.cat_walk.timeScale=S.RUB.V/S.SPEED; }
  function endRub(E,stopped){ const c=cat; c.rubCd=stopped?S.RUB.MISS+10:S.RUB.CD; c.rub=null;
    if(stopped){ play('cat_idle',0.2); c.state='look'; c.t=2.5; return; }
    if(c.rnd()<0.5){ play('cat_sit',0.25); c.state='sit'; c.at=null; c.t=8+c.rnd()*12; return; }   /* 坐在玩家旁邊 */
    const tgt=pick(c.at,c.rnd), o=c.obj.position, p=E.pathTo?E.pathTo(o.x,o.z,0,tgt.x,tgt.z,0):[[tgt.x,tgt.z]];
    if(p&&p.length){ c.path=p.map(q=>({x:q[0],z:q[1]})); c.next=tgt; c.leave=true; c.state='walk'; play('cat_walk',0.25); } else { play('cat_idle',0.2); c.state='look'; c.t=2; } }   /* 走開（玩家在旁邊也照走）*/
  function walkStep(E,dt,o,turnTo){ const c=cat, w=c.path[0], dx=w.x-o.position.x, dz=w.z-o.position.z, d=Math.hypot(dx,dz), st=S.SPEED*dt;
    if(d<=st){ o.position.x=w.x; o.position.z=w.z; c.path.shift(); return !c.path.length; }
    const yaw=Math.atan2(dx,dz); turnTo(yaw,5); const f=Math.max(0,Math.cos(yaw-o.rotation.y)); o.position.x+=dx/d*st*f; o.position.z+=dz/d*st*f; c.act.cat_walk.timeScale=0.35+0.65*f; return false; }
  /* 每一格（溫州街區域的 update 呼叫）*/
  S.update=function(dt,E){
    for(let i=breathers.length-1;i>=0;i--){ const b=breathers[i]; if(!inScene(b)){ breathers.splice(i,1); continue; } breath(b,Math.min(dt,0.25)); }
    if(!cat||cat.E!==E) return; if(!inScene(cat.obj)){ cat=null; return; }
    dt=Math.min(dt,0.25); const c=cat, o=c.obj, pl=E.player&&E.player.obj, G=typeof GAME!=='undefined'&&GAME.G;
    if(held){ if(c.lieObj) breath(c.lieObj,dt); if(c.it&&c.it0&&c.lieAt==='bench'){ c.it.x=c.it0.x; c.it.z=c.it0.z; } return; }   /* 趴在圓椅上：不走、不更新動畫 */
    const dp=pl?Math.hypot(pl.position.x-o.position.x,pl.position.z-o.position.z):99, aw=S.awake(G), bz=busy();
    if(c.state==='sleep'){ if(c.lieObj) breath(c.lieObj,dt);
      const lp=c.lieObj&&c.lieObj.position, dl=pl&&lp?Math.hypot(pl.position.x-lp.x,pl.position.z-lp.z):99;
      if(aw&&!bz&&dl>S.NEAR) wakeNow(E);   /* 07:00、雨停：玩家不在旁邊時醒來 */
      else if(!aw&&c.lieAt&&S.sleepWhere(G)!==c.lieAt&&dl>6) showLie(S.sleepWhere(G));   /* 半夜下起雨：沒人看的時候躲到石桌底下 */
      return; }
    const turnTo=(yaw,k)=>{ let d=yaw-o.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); o.rotation.y+=d*Math.min(1,k*dt); };
    c.t-=dt; c.rubCd-=dt;
    /* 玩家站著不動多久（坐著不算）*/
    const pp=pl&&pl.position, seated=!!(E.player&&(E.player.seat||E.player.frozen)); c.moved=false;
    if(pp){ if(!c.anchor||Math.hypot(pp.x-c.anchor.x,pp.z-c.anchor.z)>S.RUB.MOVE||seated){ if(c.anchor) c.moved=true; c.anchor={x:pp.x,z:pp.z}; c.still=0; c.rolled=false; } else c.still+=dt; }
    const canRub=aw&&!bz&&!seated&&pp&&c.rubCd<=0&&!c.rolled&&c.still>=S.RUB.WAIT&&dp<=S.RUB.R&&(c.state==='sit'||c.state==='look'||(c.state==='walk'&&!c.leave));
    if(canRub){ c.rolled=true; if(c.rnd()<S.RUB.P){ if(c.state==='sit'){ standUp(); c.state='rise'; c.t=c.act.cat_sit.getClip().duration+0.05; c.pend='approach'; } else beginApproach(E,pp); } else c.rubCd=S.RUB.MISS; }
    if(c.state==='sit'){
      if(c.cur!=='cat_sit_idle'&&c.cur==='cat_sit'&&!c.act.cat_sit.isRunning()) play('cat_sit_idle',0.2);
      const home=!aw&&c.at&&S.WAKE[S.sleepWhere(G)]&&Math.hypot(o.position.x-S.WAKE[S.sleepWhere(G)].x,o.position.z-S.WAKE[S.sleepWhere(G)].z)<0.3;
      if(home&&!bz&&dp>S.NEAR) sleepNow(S.sleepWhere(G));   /* 坐在圓椅前、時間到了：趴上去 */
      else if((c.t<=0||!aw)&&!bz&&dp>S.NEAR){ standUp(); c.state='rise'; c.t=c.act.cat_sit.getClip().duration+0.05; } }
    else if(c.state==='rise'){ if(c.t<=0){ play('cat_idle',0.2); if(c.pend==='approach'&&aw&&!bz&&pp){ c.pend=null; if(!beginApproach(E,pp)){ c.state='look'; c.t=1.5; } } else { c.pend=null; c.state='look'; c.t=1.5+c.rnd()*2.5; } } }
    else if(c.state==='look'){
      if(pl&&dp<S.FAR) turnTo(Math.atan2(pl.position.x-o.position.x,pl.position.z-o.position.z),3);
      if(bz){ play('cat_sit',0.2); c.state='sit'; c.t=20; }
      else if((c.t<=0||!aw)&&dp>S.NEAR){ const where=aw?null:S.sleepWhere(G), tgt=aw?pick(c.at,c.rnd):S.WAKE[where]; const p=E.pathTo?E.pathTo(o.position.x,o.position.z,0,tgt.x,tgt.z,0):[[tgt.x,tgt.z]];
        if(Math.hypot(o.position.x-tgt.x,o.position.z-tgt.z)<0.3&&!aw) sleepNow(where);
        else if(p&&p.length){ c.path=p.map(q=>({x:q[0],z:q[1]})); c.next=aw?tgt:{home:where,x:tgt.x,z:tgt.z}; c.state='walk'; play('cat_walk',0.25); } else c.t=3; } }
    else if(c.state==='walk'){
      if((dp<S.NEAR&&!c.leave)||bz||(!aw&&c.next&&!c.next.home)){ play('cat_idle',0.2); c.state='look'; c.t=bz?99:(aw?2.5:0); c.leave=false; }   /* 時間到了：先停下來，look 會改走回圓椅 */
      else if(walkStep(E,dt,o,turnTo)){ const n=c.next; c.leave=false; if(n&&n.home&&!aw&&!bz){ sleepNow(n.home); } else { c.at=n&&!n.home?n:c.at; c.state='sit'; c.t=25+c.rnd()*45; play('cat_sit',0.25); } } }
    else if(c.state==='approach'){
      if(!aw||bz||c.moved||c.t<=0){ c.rubCd=S.RUB.MISS; play(bz?'cat_sit':'cat_idle',0.2); c.state=bz?'sit':'look'; c.t=bz?20:2.5; c.path=null; }
      else if(dp<=S.RUB.RING+0.02||walkStep(E,dt,o,turnTo)) beginRub(pp); }
    else if(c.state==='rub'){ const r=c.rub;
      if(!aw||bz||c.moved){ if(bz){ c.rub=null; c.rubCd=S.RUB.CD; play('cat_sit',0.2); c.state='sit'; c.t=20; } else endRub(E,true); }
      else { r.r+=(S.RUB.RING-r.r)*Math.min(1,dt*2); const da=S.RUB.V/r.r*dt, na=r.a+r.dir*da, nx=r.cx+Math.sin(na)*r.r, nz=r.cz+Math.cos(na)*r.r;
        if(E.canStand&&!E.canStand(nx,nz,S.RUB.CAT_R,0)){ if(r.flips<1){ r.dir=-r.dir; r.flips++; } else endRub(E,false); }
        else { o.position.x=nx; o.position.z=nz; r.a=na; r.left-=da; r.swept+=da;
          const h=Math.atan2(r.dir*Math.cos(na),-r.dir*Math.sin(na)), cy=na+Math.PI; let dd=cy-h; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); turnTo(h+Math.sign(dd)*S.RUB.LEAN,6);   /* 身體沿著腳邊、頭往玩家那邊偏 */
          if(r.left<=0) endRub(E,false); } } }
    if(c.state!=='sleep'){ o.position.y=E.heightAt?E.heightAt(o.position.x,o.position.z,0):0; if(c.it){ c.it.x=o.position.x; c.it.z=o.position.z; } c.mixer.update(dt); } };
  S.state=()=>cat?{state:cat.state,t:+cat.t.toFixed(1),busy:busy(),x:+cat.obj.position.x.toFixed(2),z:+cat.obj.position.z.toFixed(2),yaw:+cat.obj.rotation.y.toFixed(2),clip:cat.cur,at:cat.at&&[cat.at.x,cat.at.z],path:cat.path?cat.path.length:0,lie:cat.lieAt,still:+cat.still.toFixed(1),rubCd:+cat.rubCd.toFixed(1),rub:cat.rub?{left:+cat.rub.left.toFixed(2),swept:+cat.rub.swept.toFixed(2),dir:cat.rub.dir}:null}:null;
  S._cat=()=>cat;   /* 測試用 */
  /* 劇情要貓固定趴在圓椅上（不管幾點）：hold('lie')。
     - 貓正在公園裡走（白天）：藏起走路的貓，圓椅上放趴著的貓（和晚上同一個模型、同一個位置），「摸摸」的互動點回到圓椅。
     - 已經睡在圓椅上：照舊。還沒進公園：進公園時 attach 照睡著的時段接手（趴在圓椅上）。下雨照舊在石桌底下（AA_493 第 5 節；zones3d.js 不交給這裡）。
     - release()：hold 前醒著：拿掉趴著的貓，走路的貓從剛才的位置接著走；hold 前睡著：繼續睡（時間到了照常醒）。hold 不存檔（讀檔以後沒有）。*/
  S.hold=function(mode){ held=mode||'lie'; if(!cat||!cat.lie||typeof Z3==='undefined'||!Z3.wzCatModel) return true;
    if(cat.holdPrev==null) cat.holdPrev=cat.state==='sleep'?'sleep':'awake';
    if(cat.lieAt!=='bench'){ if(cat.lieObj) hideLie(); showLie('bench'); } cat.state='sleep'; cat.path=null; cat.rub=null; return true; };
  S.release=function(){ held=null; if(!cat) return; const prev=cat.holdPrev; cat.holdPrev=null; if(prev==='sleep') return;
    if(cat.lieObj) hideLie(); cat.obj.visible=true; if(cat.state==='sleep'){ cat.state='look'; cat.t=1; play('cat_idle',0); } };
  S.held=()=>held;
  return S;
})();

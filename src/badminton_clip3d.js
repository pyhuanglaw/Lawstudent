/* ===== 羽球小短片（BADMINTON-CLIP-1027，使用者 X106「跟陳語彤打羽球也只是對話帶過? 不能做個小短片?」；演出 AA_485 第 2 節；LAWWW2-C 2026-10-27）=====
   和一個人一起打羽球（invites3d.js 的 gym_badminton）時演：第一次＝完整版三個鏡頭（約 13 秒），之後只演鏡頭 2（約 6 秒）；點畫面或「跳過」就跳過。
     鏡頭 1（約 3 秒）：遠景，一面場地兩個人，她（他）站在發球線發球。
     鏡頭 2（約 6 秒）：側面中景，來回四拍高遠球，鏡頭跟著球。
     鏡頭 3（約 4 秒）：照人換（AA_485 的表：以安的平抽、語彤發球掛網、芷若放小球、子晴揮空、學姊漂亮的發球、沛珊撲過去坐在地上、可昕殺球、男生朋友漏接）；
       一句台詞（以安、語彤、學姊、沛珊）由呼叫的人在短片後面接（BADCLIP.LINES[id]），短片裡不說話。
   場地：新體育館 1F 的羽球場（src/data/gym_layout.js 的 courts.badminton：六面、網都在；遊戲裡打羽球就在這裡）北排中間那一面。不換區域。
   做法：
     - 揮拍：程式驅動骨頭（character3d.js 的 u.overlay：右上臂、前臂、手、胸、左臂），發球、高遠球、殺球三種，加「伸拍」「揮空」；腳照舊待機。
     - 球拍、羽球、球網：Blender 正式模型 bldg.badminton_props（tools/blender/env_second/badminton_props.py），球拍掛在右手骨。
     - 球：程式算的弧線（往上衝得快、落下陡，像真的羽球），軟木頭在前；擊球那一格和揮拍同步。
     - 鏡頭：E.cinematic＋直接切（不慢慢轉）；鏡頭 2 跟著球。
   BADCLIP.play(GM,{who:人物 id, full:true/false}) → Promise（播完或跳過都回來）；播完人物回到原本的位置、拿掉球拍和球。 */
const BADCLIP=(function(){
  const S={}, PI=Math.PI;
  // ---- 揮拍姿勢（VRM 正規化骨架；角度和 character3d.js 的 SIT_VRM 同一套：x、z 乘 sx。右上臂 z 負＝往上舉、y 正＝往前；左上臂相反）----
  const P={
    ready:{RightArm:[0,0.85,0.3],RightForeArm:[0,0.5,-1.0],RightHand:[0,0,0],LeftArm:[0,-0.7,-0.6],LeftForeArm:[0,-0.8,0],Spine1:[0,0,0]},   /* 準備：拍子舉在胸前、手肘彎 */
    back:{RightArm:[-1.6,-0.25,-0.7],RightForeArm:[0,0.2,-1.9],RightHand:[0,-1.5,0],LeftArm:[0,-0.5,1.05],LeftForeArm:[0,-0.25,0],Spine1:[0,-0.45,0]},   /* 引拍：手肘抬到肩膀高、上臂往外轉（前臂往後倒）、手腕往後折——拍頭垂到頭後面、比頭低（10-27 v2；v1 拍子朝上像舉拍）、左手指著球 */
    hit:{RightArm:[0,0.35,-1.45],RightForeArm:[0,0.1,-0.12],RightHand:[0,0,-0.15],LeftArm:[0,-0.3,-0.6],LeftForeArm:[0,-0.6,0],Spine1:[0,0.2,0]},
    follow:{RightArm:[0,1.25,0.85],RightForeArm:[0,0.7,0],RightHand:[0,0,0],LeftArm:[0,-0.2,-1.0],LeftForeArm:[0,-0.5,0],Spine1:[0,0.45,0]},
    smashHit:{RightArm:[0,0.65,-1.3],RightForeArm:[0,0.1,-0.08],RightHand:[0,0,-0.3],LeftArm:[0,-0.2,-0.8],LeftForeArm:[0,-0.5,0],Spine1:[0.28,0.3,0]},
    smashFollow:{RightArm:[0,1.4,1.05],RightForeArm:[0,0.9,0],RightHand:[0,0,0],LeftArm:[0,-0.1,-1.1],LeftForeArm:[0,-0.4,0],Spine1:[0.38,0.5,0]},
    sv0:{RightArm:[0,0.15,0.95],RightForeArm:[0,0.95,0],RightHand:[0,0,0.2],LeftArm:[0,-1.05,-0.45],LeftForeArm:[0,-0.95,0],Spine1:[0,-0.15,0]},   /* 發球：左手拿球在身前、拍子在右下 */
    sv1:{RightArm:[0,-0.35,1.15],RightForeArm:[0,0.6,0],RightHand:[0,0,0.5],LeftArm:[0,-1.1,-0.5],LeftForeArm:[0,-0.95,0],Spine1:[0,-0.3,0]},
    sv2:{RightArm:[0,1.05,0.55],RightForeArm:[0,0.5,0],RightHand:[0,0,-0.3],LeftArm:[0,-0.6,-0.95],LeftForeArm:[0,-0.6,0],Spine1:[0,0.2,0]},
    drive:{RightArm:[0,0.95,0.15],RightForeArm:[0,0.35,0],RightHand:[0,0,-0.2],LeftArm:[0,-0.3,-0.9],LeftForeArm:[0,-0.6,0],Spine1:[0,0.3,0]},
    reach:{RightArm:[0,0.95,-0.15],RightForeArm:[0,0.15,0],RightHand:[0,0,0],LeftArm:[0,-0.2,-0.95],LeftForeArm:[0,-0.4,0],Spine1:[0.12,0.25,0]},
    rest:{RightArm:[0,0.35,1.0],RightForeArm:[0,0.6,0],RightHand:[0,0,0],LeftArm:[0,-0.2,-1.15],LeftForeArm:[0,-0.3,0],Spine1:[0,0,0]},   /* 拍子垂在身邊 */
    floorSit:{LeftUpLeg:[-1.45,0,0.1],RightUpLeg:[-1.3,0,-0.08],LeftLeg:[0.15,0,0],RightLeg:[0.75,0,0],LeftArm:[0,0.6,-1.05],RightArm:[0,-0.6,1.05],LeftForeArm:[0,0,0],RightForeArm:[0,0,0],Spine1:[-0.22,0,0]}   /* 坐在地上（沛珊撲球以後）：搭在坐下的動作上——腿往前伸、一邊膝蓋微彎、兩手撐在身後、身體往後仰；人放低到屁股貼地（見 youSmashSheSits）*/
  };
  // 一次揮拍：[進度, 姿勢]；hit＝擊球那一刻（進度）；dur＝秒
  const SW={ clear:{k:[[0,'ready'],[0.38,'back'],[0.5,'hit'],[0.72,'follow'],[1,'ready']],hit:0.5,dur:0.9},
    smash:{k:[[0,'ready'],[0.36,'back'],[0.47,'smashHit'],[0.7,'smashFollow'],[1,'ready']],hit:0.47,dur:0.85},
    serve:{k:[[0,'ready'],[0.25,'sv0'],[0.55,'sv1'],[0.66,'sv2'],[1,'ready']],hit:0.66,dur:1.2},
    drive:{k:[[0,'ready'],[0.35,'back'],[0.5,'drive'],[0.75,'follow'],[1,'ready']],hit:0.5,dur:0.7},
    drop:{k:[[0,'ready'],[0.4,'back'],[0.55,'hit'],[0.75,'ready'],[1,'ready']],hit:0.55,dur:0.9},
    whiff:{k:[[0,'ready'],[0.38,'back'],[0.55,'hit'],[0.78,'follow'],[1,'ready']],hit:-1,dur:0.95},   /* 揮空：沒有擊球 */
    reach:{k:[[0,'ready'],[0.45,'reach'],[0.85,'reach'],[1,'ready']],hit:-1,dur:0.9} };
  const sm=t=>t*t*(3-2*t);
  function pose(name,t){ const s=SW[name], K=s.k; t=Math.max(0,Math.min(1,t)); let i=0; while(i<K.length-2&&t>K[i+1][0]) i++;
    const [t0,a]=K[i], [t1,b]=K[i+1], f=sm(t1>t0?(t-t0)/(t1-t0):1), A=P[a], Bp=P[b], out={};
    for(const n in A){ const ra=A[n], rb=Bp[n]||ra; out[n]=[ra[0]+(rb[0]-ra[0])*f,ra[1]+(rb[1]-ra[1])*f,ra[2]+(rb[2]-ra[2])*f]; } return out; }
  function still(name){ return Object.assign({},P[name]); }
  // ---- 演出：照人換的最後一拍（AA_485 第 2 節的表）----
  S.LINES={ heroine_01:'替補也是校隊。', heroine_03:'……你說不笑的。', heroine_05:'發球我練過。後面的沒有。', classmate_peishan:'欸，剛剛那球怎麼打的？再一次！' };
  const ENDINGS={
    heroine_01:'herDriveYouMiss', heroine_03:'herServeNet', heroine_02:'herDropYouMiss', heroine_04:'herWhiff', heroine_05:'herServeThenMiss',
    classmate_peishan:'youSmashSheSits', kexin:'herSmashYouMiss' };
  // ---- 場地 ----
  function court(){ const Ly=typeof GYM_LAYOUT!=='undefined'?GYM_LAYOUT:null, C=Ly&&Ly.courts&&Ly.courts.badminton; const c=C&&C.length>1?C[1]:[0,-11.2]; return {x:c[0],z:c[1]}; }   /* 北排中間那一面（南排離大廳的隔牆 z 11 太近，遠景機位會撞牆）*/
  // ---- 道具（正式模型；載入失敗用簡單的）----
  function propsFrom(c){ const sc=c&&c.scene; const g=n=>sc&&sc.getObjectByName(n); return {racketA:g('badminton_racket'),racketB:g('badminton_racket_b'),shuttle:g('badminton_shuttle'),net:g('badminton_net')}; }
  function simpleRacket(col){ const g=new THREE.Group(), m=new THREE.MeshStandardMaterial({color:col,roughness:0.4}); const sh=new THREE.Mesh(new THREE.CylinderGeometry(0.005,0.005,0.45,6),m); sh.position.y=0.23; g.add(sh);
    const fr=new THREE.Mesh(new THREE.TorusGeometry(0.1,0.006,6,24),m); fr.scale.set(1,1.2,1); fr.position.y=0.585; g.add(fr); return g; }
  function simpleShuttle(){ const g=new THREE.Group(); const c=new THREE.Mesh(new THREE.SphereGeometry(0.013,8,6),new THREE.MeshStandardMaterial({color:0xf2efe6})); g.add(c);
    const k=new THREE.Mesh(new THREE.ConeGeometry(0.033,0.065,12,1,true),new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide})); k.rotation.x=PI; k.position.y=0.055; g.add(k); return g; }
  /* 球拍掛在右手骨：從手骨、中指、拇指的位置算手的方向（不管 VRM 0.x 還是 1.0、骨頭有沒有轉）——拍子沿「拇指方向往手指方向轉 35°」伸出去、拍面平行手掌，握在手掌中間 */
  function attachRacket(ent,obj){ const h=ent.obj, u=h.userData, vrm=u&&u.vrm; if(!vrm||!obj) return null; const H=vrm.humanoid, hand=H.getRawBoneNode('rightHand');
    const mid=H.getRawBoneNode('rightMiddleProximal')||H.getRawBoneNode('rightIndexProximal'), th=H.getRawBoneNode('rightThumbProximal')||H.getRawBoneNode('rightThumbMetacarpal'); if(!hand) return null;
    h.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(hand.matrixWorld).invert(), sc=new THREE.Vector3(); hand.getWorldScale(sc); const s=sc.x||1;
    const loc=b=>b?new THREE.Vector3().setFromMatrixPosition(b.matrixWorld).applyMatrix4(inv):null;
    const f=(loc(mid)||new THREE.Vector3(0.08/s,0,0)), fl=f.length(); f.normalize(); const t0=loc(th)||new THREE.Vector3(0,0,-0.03/s); const t=t0.clone().addScaledVector(f,-t0.dot(f)).normalize();
    const n=new THREE.Vector3().crossVectors(f,t).normalize(), a=t.clone().multiplyScalar(Math.cos(0.6)).addScaledVector(f,Math.sin(0.6)).normalize(), x=new THREE.Vector3().crossVectors(a,n).normalize();
    const r=obj.clone(true); r.matrixAutoUpdate=true; const m=new THREE.Matrix4().makeBasis(x,a,n); r.quaternion.setFromRotationMatrix(m); r.scale.setScalar(1/s);
    const palm=f.clone().multiplyScalar(fl*0.55).addScaledVector(n,0.012/s); r.position.copy(palm).addScaledVector(a,-0.095/s); r.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.frustumCulled=false; } });
    hand.add(r); return r; }
  function racketHead(r){ const v=new THREE.Vector3(0,0.585,0); r.updateMatrixWorld(true); return v.applyMatrix4(r.matrixWorld); }
  // ---- 球的弧線：起點 A、終點 B、最高點高度 top；往上衝得快、落下陡（水平進度先快後慢）----
  function flightPos(A,B,top,u,out){ u=Math.max(0,Math.min(1,u)); const s=1-Math.pow(1-u,1.55);   /* u 超過 1 時 (1−u) 是負的，開 1.55 次方是 NaN */ out.set(A.x+(B.x-A.x)*s,0,A.z+(B.z-A.z)*s); const lin=A.y+(B.y-A.y)*s, peak=Math.max(top-Math.max(A.y,B.y),0);
    out.y=lin+peak*4*s*(1-s)*(1+0.35*(1-2*s)); return out; }
  // ---- 跳過：點畫面或按鈕 ----
  function skipUI(onSkip){ if(typeof document==='undefined'||!document.body||!document.createElement) return ()=>{}; const b=document.createElement('button'); b.textContent='跳過'; b.id='badclipSkip';
    Object.assign(b.style,{position:'fixed',right:'calc(16px + env(safe-area-inset-right))',bottom:'calc(16px + env(safe-area-inset-bottom))',minWidth:'64px',minHeight:'44px',zIndex:9999,borderRadius:'22px',border:'none',background:'rgba(20,24,30,0.72)',color:'#fff',fontSize:'15px'});
    const go=e=>{ if(e){ e.preventDefault&&e.preventDefault(); e.stopPropagation&&e.stopPropagation(); } onSkip(); }; b.addEventListener('click',go); b.addEventListener('touchend',go); document.body.appendChild(b);
    const tap=e=>{ if(e.target===b) return; onSkip(); }; const c=document.getElementById&&document.getElementById('c'); setTimeout(()=>{ if(c) c.addEventListener('pointerdown',tap); },400);
    return ()=>{ b.remove(); if(c) c.removeEventListener('pointerdown',tap); }; }
  // ---- 主流程 ----
  S.busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['badminton_clip3d:busy']=()=>{ S.busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.play=async function(GM,opts){ opts=opts||{}; const E=GM&&GM.E; if(!E||!E.player||S.busy) return false; S.busy=true; let skipped=false; const id=opts.who;
    const C=court(), half=4.4, P1=E.player, keep=[]; let partner=GM.npc&&GM.npc[id], spawned=false;
    if(!partner&&GM.spawnCharacter&&id){ partner=GM.spawnCharacter(id,C.x,C.z-half,{yaw:0}); spawned=!!partner; }
    if(!partner){ S.busy=false; return false; }
    for(const e of [P1,partner]) keep.push({e,x:e.obj.position.x,z:e.obj.position.z,y:e.obj.position.y,ry:e.obj.rotation.y,pose:e.pose,frozen:e.frozen,path:e.path,
      bags:typeof CHAR!=='undefined'&&CHAR.carryOff?CHAR.carryOff(e.obj):null});   /* 打球不背包：後背包、托特包、吉他、資料夾…先拿下來，演完（含跳過、出錯）照原本還原（BADCLIP-BAG-1027，使用者 10-27 22:4x）*/
    const grp=new THREE.Group(); grp.name='badclip'; E.scene.add(grp);
    let props={}; try{ if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.badminton_props']) props=propsFrom(await ASSETS.loadOne('bldg.badminton_props')); }catch(e){ console.warn('羽球道具載入失敗，用簡單的',e); }
    const rA=attachRacket(P1,props.racketA||simpleRacket(0x1d2b57)), rB=attachRacket(partner,props.racketB||simpleRacket(0xeef1f4));
    const sh=(props.shuttle||simpleShuttle()).clone(true); sh.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.frustumCulled=false; } }); sh.scale.multiplyScalar(1.5); grp.add(sh);   /* 放大 1.5 倍：側面中景裡真實大小只有幾個像素（v1）*/
    // 站位：玩家在南半場（面向北）、她在北半場（面向南）
    const place=(e,x,z,yaw)=>{ e.path=null; e.frozen=true; e.pose='idle'; e.speed=0; e.obj.position.set(x,e.obj.position.y,z); e.obj.rotation.y=yaw; };
    place(P1,C.x+0.4,C.z+half,PI); place(partner,C.x-0.4,C.z-half,0);
    const ov=(e,bones,k)=>{ e.obj.userData.overlay={bones,k:k==null?1:k}; };
    ov(P1,still('ready')); ov(partner,still('ready'));
    const undo=skipUI(()=>{ skipped=true; });
    const cam=E.camera, cut=(p,l)=>{ E.cinematic(p,l); cam.position.copy(p); if(E.cam.look) E.cam.look.copy(l); };
    const V=(x,y,z)=>new THREE.Vector3(x,y,z);
    // 一段時間軸：acts＝[{who:e, sw:'clear', t0:秒}]、fly＝[{from:e|Vector3, to:Vector3, top, t0, dur}]、camf(t)
    const run=(dur,acts,fly,camf)=>new Promise(res=>{ let t=0, last=performance.now(); const tmp=new THREE.Vector3();
      const f=now=>{ if(skipped){ res(); return; } const dt=Math.min(0.25,(now-last)/1000); last=now; t+=dt;
        for(const a of acts){ const s=SW[a.sw]; const u=(t-a.t0)/s.dur; if(u<0||u>1){ if(u>1&&!a.end){ a.end=true; ov(a.who,still(a.after||'ready')); } continue; } ov(a.who,pose(a.sw,u)); }
        let shown=false; for(const q of fly){ const u=(t-q.t0)/q.dur; if(u<0||u>1+1e-6){ if(u>1&&q.land){ sh.position.copy(q.to); sh.position.y=0.012; sh.rotation.set(PI/2-0.25,0,0.6); shown=true; } continue; }
          if(!q.A) q.A=q.from.isVector3?q.from.clone():racketHead(q.from===P1?rA:rB); const p=flightPos(q.A,q.to,q.top,Math.min(1,u),tmp); const v=flightPos(q.A,q.to,q.top,Math.min(1,u+0.02),new THREE.Vector3()).sub(p);
          sh.position.copy(p); if(v.lengthSq()>1e-8) sh.quaternion.setFromUnitVectors(V(0,-1,0),v.normalize()); shown=true; }
        sh.visible=shown; if(camf) camf(t,sh.position);
        if(t>=dur){ res(); return; } requestAnimationFrame(f); }; requestAnimationFrame(f); });
    const hitP=(e,y)=>{ const p=e.obj.position; const fz=Math.cos(e.obj.rotation.y); return V(p.x-0.25*Math.cos(e.obj.rotation.y),y||2.45,p.z+fz*0.45); };   /* 這個人頭頂右前方的擊球點 */
    try{ if(GM.sceneBegin) GM.sceneBegin();
      const A=P1, Bn=partner;
      if(opts.full!==false&&!skipped){   // 鏡頭 1：遠景，她發球
        cut(V(C.x+5.5,5.8,C.z+12.5),V(C.x,0.9,C.z-0.5));   /* 場地南邊、兩面場地之間的上方：看得到旁邊的場地 */ const T=SW.serve.dur*SW.serve.hit;
        await run(3.0,[{who:Bn,sw:'serve',t0:0.3},{who:A,sw:'clear',t0:0.3+T+1.25-SW.clear.dur*SW.clear.hit}],[{from:Bn,to:hitP(A),top:3.6,t0:0.3+T,dur:1.25}],null); }
      if(!skipped){   // 鏡頭 2：側面中景，四拍高遠球，鏡頭跟著球
        const side=V(C.x+8.2,2.2,C.z), seq=[A,Bn,A,Bn]; const acts=[], fly=[]; let t=0.2; const D=1.35, sw=SW.clear;
        cut(side,V(C.x,1.8,C.z+half*0.6));
        for(let i=0;i<4;i++){ const h=seq[i], o=h===A?Bn:A; acts.push({who:h,sw:'clear',t0:t}); const th=t+sw.dur*sw.hit; fly.push({from:h,to:hitP(o),top:6.2,t0:th,dur:D}); t=th+D-sw.dur*sw.hit; }
        await run(t+0.6,acts,fly,(tt,p)=>{ if(E.cam.cine){ E.cam.cine.look.set(C.x,Math.max(1.4,p.y*0.6+0.6),p.z); E.cam.cine.pos.set(C.x+8.2,2.2,C.z+(p.z-C.z)*0.35); } }); }
      if(opts.full!==false&&!skipped){ await ending(ENDINGS[id]||'youSmashHeMisses'); }
    } catch(e){ console.warn('羽球短片',e); }
    finally{
      undo(); for(const r of [rA,rB]) if(r&&r.parent) r.parent.remove(r); E.scene.remove(grp);
      for(const k of keep){ const e=k.e; e.obj.userData.overlay=null; e.obj.position.set(k.x,k.y,k.z); e.obj.rotation.y=k.ry; e.pose=k.pose||'idle'; e.frozen=k.frozen; e.path=null; if(k.bags) k.bags(e.obj); }
      if(spawned&&GM.removeNPC) GM.removeNPC(id); if(E.endCinematic) E.endCinematic(); if(GM.sceneEnd) GM.sceneEnd(); S.busy=false; }
    return !skipped;
    // 鏡頭 3：照人換
    async function ending(kind){ const A=P1, Bn=partner; let cut2=false, floor0=null;
      const hipsY=e=>{ const v=e.obj.userData.vrm, b=v&&v.humanoid&&v.humanoid.getRawBoneNode('hips'); if(!b) return null; b.updateWorldMatrix(true,false); return b.matrixWorld.elements[13]-e.obj.position.y; };   /* 屁股（hips 骨）離人物原點的高度 */ const near=V(C.x-3.2,1.6,C.z-half+3.0), herFace=V(Bn.obj.position.x,1.45,Bn.obj.position.z), you=V(A.obj.position.x,1.45,A.obj.position.z);
      const T=s=>SW[s].dur*SW[s].hit, netTop=V(C.x+0.1,1.53,C.z), floorB=z=>V(C.x+0.6,0.02,z);
      switch(kind){
        case 'herDriveYouMiss':   // 以安：平抽，你來不及；她把拍子收回胸前
          cut(V(C.x+5.5,1.7,C.z-1.0),V(C.x,1.3,C.z)); await run(4.0,[{who:A,sw:'clear',t0:0.1},{who:Bn,sw:'drive',t0:0.1+T('clear')+1.2-T('drive')},{who:A,sw:'reach',t0:0.1+T('clear')+1.2+0.25}],
            [{from:A,to:hitP(Bn,1.6),top:5.5,t0:0.1+T('clear'),dur:1.2},{from:hitP(Bn,1.6),to:floorB(C.z+half+1.6),top:1.75,t0:0.1+T('clear')+1.2,dur:0.55,land:true}],
            (tt)=>{ if(tt>2.4&&!cut2){ cut2=true; cut(V(Bn.obj.position.x+1.2,1.5,Bn.obj.position.z+2.2),herFace); } }); break;   /* 直接切到她正前方（v1 用 cine.pos 慢慢飛過去，中途沿著球網、她在畫面邊上被切掉）*/
        case 'herServeNet':       // 語彤：發球掛網；她看了你一眼
          cut(V(C.x-2.8,1.6,C.z-half+3.2),herFace); await run(4.0,[{who:Bn,sw:'serve',t0:0.2}],[{from:Bn,to:V(netTop.x,1.2,netTop.z),top:1.7,t0:0.2+T('serve'),dur:0.55},{from:V(netTop.x,1.2,netTop.z),to:V(netTop.x,0.02,C.z-0.25),top:1.2,t0:0.75+T('serve'),dur:0.35,land:true}],
            (tt)=>{ if(tt>1.8){ Bn.obj.rotation.y=0; } }); break;
        case 'herDropYouMiss':    // 芷若：輕輕一點，球貼著網落下，你衝上去沒接到；她甩了一下手腕
          cut(V(C.x+5.0,1.5,C.z+1.0),V(C.x,0.9,C.z)); await run(4.0,[{who:A,sw:'clear',t0:0.1},{who:Bn,sw:'drop',t0:0.1+T('clear')+1.2-T('drop')},{who:A,sw:'reach',t0:0.1+T('clear')+1.2+0.35}],
            [{from:A,to:hitP(Bn),top:5.5,t0:0.1+T('clear'),dur:1.2},{from:hitP(Bn),to:floorB(C.z+0.5),top:1.75,t0:0.1+T('clear')+1.2,dur:0.85,land:true}],null); break;
        case 'herWhiff':          // 子晴：揮空，球落在她腳邊；她低頭看球
          cut(near,herFace); await run(4.0,[{who:A,sw:'clear',t0:0.1},{who:Bn,sw:'whiff',t0:0.1+T('clear')+1.25-0.5}],[{from:A,to:V(Bn.obj.position.x+0.5,0.02,Bn.obj.position.z+0.4),top:5.5,t0:0.1+T('clear'),dur:1.25,land:true}],null); break;
        case 'herServeThenMiss':  // 學姊：漂亮的發球；你回過去，她第二拍沒接到
          cut(V(C.x+6.0,1.9,C.z),V(C.x,1.4,C.z)); await run(4.2,[{who:Bn,sw:'serve',t0:0.1},{who:A,sw:'clear',t0:0.1+T('serve')+1.2-T('clear')},{who:Bn,sw:'reach',t0:0.1+T('serve')+1.2+1.0}],
            [{from:Bn,to:hitP(A),top:4.2,t0:0.1+T('serve'),dur:1.2},{from:A,to:V(Bn.obj.position.x+1.0,0.02,Bn.obj.position.z-0.6),top:5.2,t0:0.1+T('serve')+1.2,dur:1.3,land:true}],null); break;
        case 'youSmashSheSits':   // 沛珊：你殺一球，她撲過去，坐在地上笑
          cut(V(C.x+5.0,1.5,C.z-1.5),V(C.x,0.9,C.z-half+0.6)); await run(4.2,[{who:A,sw:'smash',t0:0.1},{who:Bn,sw:'reach',t0:0.1+T('smash')+0.25}],[{from:A,to:V(Bn.obj.position.x+0.9,0.02,Bn.obj.position.z+0.9),top:2.5,t0:0.1+T('smash'),dur:0.5,land:true}],
            (tt)=>{ if(tt>1.4&&Bn.pose!=='sit'){ Bn.pose='sit'; ov(Bn,still('floorSit')); Bn.obj.position.x+=0.35; floor0=Bn.obj.position.y; }
              if(floor0!=null){ const hy=hipsY(Bn); if(hy!=null) Bn.obj.position.y=floor0+0.13-hy; }   /* 坐下的動作是坐椅子的高度（v1 像坐在空氣上）：每一格量屁股的高度，整個人放低到屁股離地 13 cm */
              if(tt>1.9&&!cut2){ cut2=true; const q=Bn.obj.position; cut(V(q.x+1.6,1.0,q.z+2.0),V(q.x,0.45,q.z)); } }); break;   /* 她坐下以後切近一點（v1 只有遠景，坐在地上很小）*/
        case 'herSmashYouMiss':   // 可昕：她殺球，你漏接；她回到底線
          cut(V(C.x+5.5,1.6,C.z+0.5),V(C.x,1.2,C.z)); await run(4.0,[{who:A,sw:'clear',t0:0.1},{who:Bn,sw:'smash',t0:0.1+T('clear')+1.2-T('smash')},{who:A,sw:'reach',t0:0.1+T('clear')+1.2+0.2}],
            [{from:A,to:hitP(Bn),top:5.5,t0:0.1+T('clear'),dur:1.2},{from:hitP(Bn),to:V(A.obj.position.x+1.0,0.02,A.obj.position.z-0.8),top:2.4,t0:0.1+T('clear')+1.2,dur:0.45,land:true}],null); break;
        default:                  // 男生朋友：你殺一球，他漏接，舉手示意再來
          cut(V(C.x+5.0,1.5,C.z-1.5),V(C.x,1.0,C.z-half+0.6)); await run(4.0,[{who:A,sw:'smash',t0:0.1},{who:Bn,sw:'reach',t0:0.1+T('smash')+0.2,after:'rest'}],[{from:A,to:V(Bn.obj.position.x-0.8,0.02,Bn.obj.position.z+0.7),top:2.5,t0:0.1+T('smash'),dur:0.5,land:true}],null); } }
  };
  S._pose=pose; S._flight=flightPos; S._attachRacket=attachRacket; S._court=court; S._props=propsFrom; S.SW=SW; S.P=P; S.ENDINGS=ENDINGS;   /* 測試用 */
  return S;
})();

// 騎腳踏車（使用者：「我應該要可以騎腳踏車」、路上的騎士要真的踩踏板；車是 LAWWW2 的 bike_ride.glb，VISUAL_REVIEW（second_ai）第 19 節）
// - 只在戶外區域騎（校園、公館、溫州街）。自己的車一開始停在宿舍門口東邊；走近「騎腳踏車」上車，右邊的「下車」按鈕下車（車停在下車的地方）。
// - 騎的時候：搖桿、點地面照常，速度 E.SPD.bike；輪子照走的距離轉、曲柄和踏板照齒比轉（輪子一圈、曲柄 0.45 圈），轉彎時把手轉、車身往內側傾。
//   人物的腳踩在踏板上、手握把手（character3d.js 的 rideIK，在真實骨架上算）。
// - 自動下車：和別人說話、坐下、進建築（車停在門口）、走上樓梯或平台（車停在樓梯前）、有人跟著走（劇情、約朋友一起走）、劇情開始。
//   騎著走出校門、往溫州街：車跟著過去。快速前往室內的地方：車停在那棟建築的門外。
// - 存檔：G.bike {zone,x,z,yaw,riding}（舊存檔沒有＝車在宿舍門口）。
'use strict';
const BIKE=(function(){
  const B={};
  const ZONES={campus:1,gongguan:1,wenzhou:1};
  const HOME={zone:'campus',x:25,z:57.9,yaw:Math.PI/2};   /* 宿舍門口（門 (20,59.6)）東邊、和牆平行；tests/bike_unit.js 檢查站得住、不擋門 */
  const WHEEL_R=0.333, GEAR=0.45, WHEELBASE=1.06;
  const STEER_AXIS={p:new THREE.Vector3(0,0.7,0.3732), d:new THREE.Vector3(0,0.9397,-0.342).normalize()};
  const GRIPS=[new THREE.Vector3(0.29,1.07,0.053),new THREE.Vector3(-0.29,1.07,0.053)];   /* 手腕要到的地方（握點往上 1 cm、往後 3 cm；左＝+x）*/
  let src=null, loading=null;
  let parked=null;    /* {obj,it,zone}：停著的車（目前區域）*/
  let ride=null;      /* {obj,parts,crank,wheel,steer,lean,yaw,lastFlat}：騎著的車（掛在玩家底下）*/
  let pendingPark=false, opts_walked=false;
  B.ok=z=>!!ZONES[z];
  B.SPEED=8.5;   /* 和 engine3d.js 的 E.SPD.bike 一樣 */
  function st(G){ if(!G.bike||typeof G.bike!=='object') G.bike=Object.assign({riding:false},HOME); return G.bike; }
  B.state=st;
  function load(){ if(src) return Promise.resolve(src); if(!loading) loading=ASSETS.loadOne('prop.bike_ride').then(c=>{ const s=c&&c.scene; if(!s) return null;
      s.traverse(o=>{ if(o.isMesh){ const g=o.geometry, n=g?(g.index?g.index.count:g.attributes.position.count)/3:0; o.castShadow=n>=250&&!/^ride_(alpha|lamp_lens)/.test((o.material&&o.material.name)||''); o.receiveShadow=false; if(g) g.userData.shared=true; } });   /* 換區域時 disposeGroup 不要丟掉共用的幾何。
         投影只留車架、前叉、輪子（250 個三角形以上）；踏板、曲柄、座墊、車燈、輻條的影子小到看不出來，每台車陰影那一輪少 8 次 draw call（2026-10-16 溫州街效能）*/
      src=s; return s; }).catch(e=>{ console.warn('腳踏車模型載入失敗',e); loading=null; return null; });
    return loading; }
  B.load=load;
  /* color：車架改色（路上的騎士每台不同色；材質 ride_frame 複製一份再改，原本的共用材質不動）*/
  function make(color){ if(!src) return null; const o=src.clone(true); const parts={}; let frameMat=null; o.traverse(n=>{ if(/^(frame|fork|wheel_f|wheel_r|crank|pedal_r|pedal_l)$/.test(n.name)&&!parts[n.name]){ parts[n.name]=n; n.userData.q0=n.quaternion.clone(); }
      if(color&&n.isMesh&&n.material&&n.material.name==='ride_frame'){ if(!frameMat){ frameMat=n.material.clone(); frameMat.color.set(color); } n.material=frameMat; } });
    o.userData.parts=parts; o.name='bike_ride'; return o; }
  B.make=make;
  const QA=new THREE.Quaternion(), XA=new THREE.Vector3(1,0,0), YA=new THREE.Vector3(0,1,0);
  /* 姿勢：輪子角度、曲柄角度、把手角度（都繞零件自己的軸；原本的旋轉 q0 保留）*/
  function pose(parts,wheel,crank,steer){ const set=(n,ax,a)=>{ const p=parts[n]; if(p) p.quaternion.copy(p.userData.q0).multiply(QA.setFromAxisAngle(ax,a)); };
    set('wheel_f',XA,wheel); set('wheel_r',XA,wheel); set('crank',XA,crank); set('pedal_r',XA,-crank); set('pedal_l',XA,-crank); set('fork',YA,steer||0); }
  B.pose=pose;
  /* 把手轉了 steer 之後，左右手腕要到的位置（車的座標＝人物控制器的座標）：繞轉向軸轉；k＝車的尺寸（整台車對原點縮放）*/
  function grips(steer,k){ k=k||1; return GRIPS.map(g=>{ const v=g.clone().sub(STEER_AXIS.p).applyAxisAngle(STEER_AXIS.d,steer||0).add(STEER_AXIS.p).multiplyScalar(k); return [v.x,v.y,v.z]; }); }
  B.grips=grips;
  /* 車的尺寸：175 cm 以上騎原尺寸（26 吋）；矮的人騎小一號（最小 0.88 倍）——腿才踩得到最下面的踏板、不會坐進座墊裡（tests/ride_pose_unit.js）*/
  B.scaleFor=hm=>Math.max(0.88,Math.min(1,(hm||1.75)/1.75));
  const STEER_MAX=0.22;   /* 把手最多轉 0.22 rad（約 13°）：再多手臂短的人（林芷若 161 cm）搆不到外側的握把 */
  const btn=()=>typeof document!=='undefined'&&document.getElementById?document.getElementById('btnBike'):null;
  function showBtn(on){ const b=btn(); if(b) b.classList.toggle('hide',!on); }
  function removeParked(E){ if(!parked) return; if(parked.obj.parent) parked.obj.parent.remove(parked.obj); const i=E.interactables.indexOf(parked.it); if(i>=0) E.interactables.splice(i,1); parked=null; }
  /* 停著的車：放在區域裡、加「騎腳踏車」互動點 */
  function placeParked(GM){ const E=GM.E, G=GM.G, s=st(G); removeParked(E); if(s.riding||s.zone!==G.zone||!E.zone||!src) return;
    const o=make(); if(!o) return; pose(o.userData.parts,0,0,0); o.position.set(s.x,0,s.z); o.rotation.y=s.yaw; E.zone.group.add(o);
    const it={x:s.x,z:s.z,radius:1.3,lv:0,y:0,label:'騎腳踏車',bike:true,onInteract:()=>B.mount(GM)};
    E.interactables.push(it); parked={obj:o,it,zone:G.zone};
    /* 第一次看到自己的車（第三天以後，避開第一二天的劇情）告訴玩家在哪裡、怎麼騎：2026-10-14 使用者試玩 v9.6「我還是不能騎腳踏車」——v9.7 才有騎車，車停在宿舍門口，沒有人說 */
    const F=G.flags||(G.flags={}); if(!F.BIKE_TIP&&!(typeof STORY!=='undefined'&&STORY.opening?STORY.opening(G):G.day<3)&&!(G.home&&G.home.at)&&!(F.Y0_MOVED_OUT&&(G.stage||'law')==='econ')&&GM.toast){   /* 人在臺北的家、經濟系退宿以後：不提示宿舍門口的車（BB-C 10-18 BUG-HOME-BIKE-HINT）*/ F.BIKE_TIP=true; const home=s.zone===HOME.zone&&Math.hypot(s.x-HOME.x,s.z-HOME.z)<3; setTimeout(()=>GM.toast((home?'宿舍門口東邊停著你的腳踏車':'這附近停著你的腳踏車')+'：走過去按「騎腳踏車」，右邊的「下車」停車。大地圖上有 🚲。',5200),1500); } }
  /* 找一個站得住的地方（車停的位置：原本的位置不行就往外找；都不行就用原本的）*/
  function spotNear(E,x,z,yaw){ if(!E.canStand||E.canStand(x,z,0.45,0)) return [x,z]; for(const r of [0.5,1,1.5,2,2.5,3]) for(let k=0;k<12;k++){ const a=yaw+k*Math.PI/6, px=x+Math.sin(a)*r, pz=z+Math.cos(a)*r; if(E.canStand(px,pz,0.45,0)) return [px,pz]; } return [x,z]; }
  /* 走進門時車停在門口旁邊、離門 2.2～2.8 m（v9.7 回歸 2026-10-14：停在門的正前方時，走回車旁邊常常是門比車近、按鈕是「進入便利商店」，騎不了）：
     從門往外（門→玩家）的方向左右轉 30～90°，找站得住的地方；都不行才照舊停在玩家旁邊 */
  function parkBeside(E,door,P,yaw){ const vx=P.x-door.x, vz=P.z-door.z, l=Math.hypot(vx,vz), a0=l>0.1?Math.atan2(vx,vz):yaw+Math.PI;
    for(const r of [2.4,2.8,2.2]) for(const d of [Math.PI/3,-Math.PI/3,Math.PI/2,-Math.PI/2,Math.PI/6,-Math.PI/6]){ const a=a0+d, px=door.x+Math.sin(a)*r, pz=door.z+Math.cos(a)*r; if(!E.canStand||E.canStand(px,pz,0.45,0)) return [px,pz]; }
    return spotNear(E,P.x,P.z,yaw); }
  B.mount=function(GM){ const E=GM.E, G=GM.G, P=E.player, s=st(G); if(s.riding||P.busy||!B.ok(G.zone)) return false;
    /* 一起走的人還不願意坐後座：不上車，一起走路（AA_137 第 5 節；載妹墊開局就有，使用者 2026-10-16）*/
    if(typeof STORY!=='undefined'&&STORY.rideBlock){ for(const n of E.npcs){ if(n.beh!=='follow'||n.noRide) continue; const why=STORY.rideBlock(GM,n); if(why){ if(GM.caption) GM.caption('',why,3200); else if(GM.toast) GM.toast(why,3200); return false; } } }
    if(!src){ load().then(()=>{ if(src) B.mount(GM); }); return false; }
    /* 有人跟著一起走：照樣上車，他會坐到後座（engine3d.js 的 beh 'passenger'；使用者 2026-10-15「腳踏車要可以載人」）——原本「有人跟著一起走，先用走的」*/
    { const p=P.obj.position; if(Math.hypot(p.x-s.x,p.z-s.z)>0.5&&!opts_walked&&E.moveTo(P,s.x,s.z,()=>{ opts_walked=true; try{ B.mount(GM); } finally { opts_walked=false; } })) return false; }   /* 先走到車旁邊再上車（不瞬移）*/
    removeParked(E);
    P.path=null; P.target=null; P.onArrive=null; P.obj.position.set(s.x,0,s.z); P.obj.rotation.y=s.yaw; if(E.setLv) E.setLv(P,0); else P.lv=0; if(E.settleY) E.settleY(P);
    attach(GM); return true; };
  function attach(GM){ const E=GM.E, G=GM.G, P=E.player, s=st(G); const o=make(); if(!o) return false; const k=B.scaleFor(P.heightM); P.obj.add(o); o.position.set(0,0,0); o.rotation.set(0,0,0); o.scale.setScalar(k);
    ride={obj:o,parts:o.userData.parts,crank:0,wheel:0,steer:0,lean:0,k,yaw:P.obj.rotation.y,px:P.obj.position.x,pz:P.obj.position.z,lastFlat:{x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y}};
    pose(ride.parts,0,0,0); s.riding=true; s.zone=G.zone; P.riding=true; P.pose='ride'; P.idlePose='ride'; P.ride={crank:0,grips:grips(0,k),scale:k}; showBtn(true); return true; }
  /* 下車：車停在 at（預設＝現在的位置）；人往左邊（+x）讓開一步（站不住就右邊；都不行就不動）*/
  B.dismount=function(GM,opts){ opts=opts||{}; const E=GM.E, G=GM.G, P=E.player, s=st(G); if(!s.riding&&!ride) return false;
    const at=opts.at||{x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y};
    if(ride&&ride.obj.parent) ride.obj.parent.remove(ride.obj); ride=null; P.obj.rotation.z=0;
    s.riding=false; P.riding=false; P.ride=null; if(P.pose==='ride') P.pose='idle'; if(P.idlePose==='ride') P.idlePose='idle';
    s.zone=opts.zone||G.zone; s.x=at.x; s.z=at.z; s.yaw=at.yaw;
    if(!opts.away&&!opts.at){ const y=P.obj.rotation.y, lx=Math.cos(y), lz=-Math.sin(y); for(const sd of [1,-1]){ const x=P.obj.position.x+lx*0.65*sd, z=P.obj.position.z+lz*0.65*sd; if(!E.canStand||E.canStand(x,z,0.3,P.lv|0)){ P.obj.position.x=x; P.obj.position.z=z; break; } } }
    showBtn(false); if(!opts.away) placeParked(GM); return true; };
  /* 換區域（GM.enter 開頭）：要去的地方騎得到就連車一起過去；不行就把車停下 */
  B.beforeEnter=function(GM,to,opts){ opts=opts||{}; const E=GM.E, G=GM.G, s=st(G); pendingPark=false; if(opts.fromLoad){ if(ride&&ride.obj.parent) ride.obj.parent.remove(ride.obj); ride=null; parked=null; if(E.player){ E.player.riding=false; E.player.ride=null; E.player.obj.rotation.z=0; } return; }
    if(!s.riding){ parked=null; return; }
    if(B.ok(to)){ s.zone=to; return; }   /* 騎著過去（車還掛在玩家底下；afterEnter 重新接上）*/
    const P=E.player.obj.position; const door=E.interactables.find(i=>i.exit&&i.exit.to===to&&Math.hypot(i.x-P.x,i.z-P.z)<(i.radius||1.5)+3);
    if(door){ const [x,z]=parkBeside(E,door,P,E.player.obj.rotation.y); B.dismount(GM,{at:{x,z,yaw:E.player.obj.rotation.y},away:true}); }   /* 走進門：車停在門口旁邊（parkBeside）*/
    else { B.dismount(GM,{away:true}); pendingPark=true; }   /* 快速前往（或劇情帶過去）：車停到那棟建築的門外（afterEnter 找出口）*/
    parked=null; };
  /* 換區域之後（populate 之後）：騎著就重新接上；停在這裡就擺出來；快速前往進了建築就把車移到這棟的門外 */
  B.afterEnter=function(GM,to){ const E=GM.E, G=GM.G, s=st(G);
    if(pendingPark){ pendingPark=false; const ex=E.interactables.find(i=>i.exit&&B.ok(i.exit.to)&&i.exit.spawn); if(ex){ const sp=ex.exit.spawn; s.zone=ex.exit.to; s.x=sp.x+Math.cos(sp.yaw||0)*1.4; s.z=sp.z-Math.sin(sp.yaw||0)*1.4; s.yaw=(sp.yaw||0)+Math.PI/2; s.fix=true; } }
    if(s.riding&&!B.ok(to)) s.riding=false;   /* 不該發生（騎著進了室內）：當作沒騎 */
    const go=()=>{ if(E.zone&&E.zone.def&&E.zone.def.id!==G.zone) return; if(s.riding){ if(!ride||!ride.obj.parent) attach(GM); else { const p=E.player.obj.position; ride.lastFlat={x:p.x,z:p.z,yaw:E.player.obj.rotation.y}; ride.px=p.x; ride.pz=p.z; E.player.pose='ride'; E.player.idlePose='ride'; showBtn(true); } } else { showBtn(false); if(s.zone===G.zone){ if(s.fix){ const [x,z]=spotNear(E,s.x,s.z,s.yaw); s.x=x; s.z=z; s.fix=false; } placeParked(GM); } } };
    if(src) go(); else if(s.riding||s.zone===G.zone) load().then(go); };
  /* 每一幀（E.update 之後）*/
  B.tick=function(GM,dt){ const E=GM.E, G=GM.G; if(!G||!E||!E.player) return; const P=E.player, s=st(G); if(!ride) return; const o=P.obj;
    if(ride.obj.parent!==o){ o.add(ride.obj); ride.obj.position.set(0,0,0); ride.obj.rotation.set(0,0,0); }   /* 正式人物模型晚到時玩家的 obj 會換新（game3d.js 的 upgradeModels）：車跟著換過去 */
    // 自動下車
    const follow=E.npcs.some(n=>n.beh==='follow'&&(n.noRide||(E.rideMode&&E.rideMode(n)==='refuse')));   /* 一起走的人會坐後座（beh 'passenger'）；不坐後座的（noRide、還不願意）要下車一起走 */
    if(P.busy||follow||P.seat||(P.pose!=='ride'&&P.pose!=='idle'&&P.pose!=='walk'&&P.pose!=='run')){ B.dismount(GM); return; }
    if((P.lv|0)!==0||o.position.y>0.12){ const lf=ride.lastFlat; B.dismount(GM,{at:lf}); if(GM.toast) GM.toast('（樓梯不能騎，車停在下面。）',2200); return; }
    ride.lastFlat.x=o.position.x; ride.lastFlat.z=o.position.z; ride.lastFlat.yaw=o.rotation.y;
    // 輪子、曲柄、把手、車身傾斜
    const dist=Math.hypot(o.position.x-(ride.px===undefined?o.position.x:ride.px),o.position.z-(ride.pz===undefined?o.position.z:ride.pz)); ride.px=o.position.x; ride.pz=o.position.z;
    const d=dist<2.5?dist:0;   /* 換區域、瞬移不算（?turbo 一幀最多 0.3 秒 × 6.2 m/s＝1.9 m）*/
    ride.wheel+=d/(WHEEL_R*ride.k); ride.crank+=d/(WHEEL_R*ride.k)*GEAR;
    let dy=o.rotation.y-ride.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); ride.yaw=o.rotation.y; const v=dt>0?d/dt:0, w=dt>0?dy/dt:0;
    const steerT=v>0.3?Math.max(-STEER_MAX,Math.min(STEER_MAX,Math.atan(WHEELBASE*ride.k*w/Math.max(v,1)))):0, leanT=v>0.3?Math.max(-0.2,Math.min(0.2,-Math.atan(v*w/9.8))):0, k=Math.min(1,dt*6);
    ride.steer+=(steerT-ride.steer)*k; ride.lean+=(leanT-ride.lean)*k;
    pose(ride.parts,ride.wheel,ride.crank,ride.steer); o.rotation.z=ride.lean;
    P.ride=P.ride||{}; P.ride.crank=ride.crank; P.ride.grips=grips(ride.steer,ride.k); P.ride.scale=ride.k;
    if(P.pose!=='ride') P.pose='ride';
    /* AA_137 第 5 節第 3 步（AA_140 G49）：載著人一起騎，實際騎了 6 秒以後，她隨機一句短話（她的閒聊短招呼池 STORY.ladGreet），一趟（上車到下車）最多一句；字幕，不打斷騎車 */
    const pas=E.npcs.find(n=>n.beh==='passenger'&&n.charId);
    if(pas){ if(v>1) ride.tripT=(ride.tripT||0)+dt; if(!ride.tripSaid&&ride.tripT>6){ ride.tripSaid=true; const t=typeof STORY!=='undefined'&&STORY.ladGreet?STORY.ladGreet(G,pas.charId):null; if(t&&GM.caption) GM.caption((typeof SOCIAL!=='undefined'?SOCIAL.displayName(pas.charId):pas.name)+'：',t,3600); } } };
  /* 路上騎腳踏車的人（game3d.js 的 spawnRider）：一個群組＝人＋車（同一個座標，和玩家一樣）；照路線一段一段騎，轉角不瞬間轉向（每秒最多轉 2 rad）；
     輪子、曲柄照距離轉，轉彎時把手轉、車身往內側傾；人物用 pose 'ride'（rideIK）。車的模型還沒載好時人先不顯示。
     o＝CHAR.build 出來的人（模型晚到時 upgradeModels 會換掉 x.rider，所以每一幀用 this.rider）*/
  B.rider=function(o,route,color,height){ const g=new THREE.Group(); g.add(o); g.position.set(route[0][0],0,route[0][1]); const k=B.scaleFor(height);
    return {obj:g,rider:o,route,ri:0,seg:0,speed:4.2+Math.random()*1.2,bike:null,wheel:0,crank:0,steer:0,lean:0,yaw:null,k,
      update(dt){ const rd=this.rider; if(!this.bike){ const b=make(color); if(!b){ load(); rd.visible=false; return; } b.scale.setScalar(k); g.add(b); this.bike=b; rd.visible=true; }
        const step=this.speed*dt; let a=route[this.ri], c=route[(this.ri+1)%route.length], len=Math.hypot(c[0]-a[0],c[1]-a[1])||1; this.seg+=step;
        if(this.seg>=len){ this.seg-=len; this.ri=(this.ri+1)%route.length; a=route[this.ri]; c=route[(this.ri+1)%route.length]; len=Math.hypot(c[0]-a[0],c[1]-a[1])||1; this.seg=Math.min(this.seg,len); }
        const ex=(c[0]-a[0])/len, ez=(c[1]-a[1])/len; g.position.set(a[0]+ex*this.seg,0,a[1]+ez*this.seg);
        const want=Math.atan2(ex,ez); if(this.yaw==null) this.yaw=want; const dy=Math.atan2(Math.sin(want-this.yaw),Math.cos(want-this.yaw)), turn=Math.max(-2*dt,Math.min(2*dt,dy)); this.yaw+=turn; g.rotation.y=this.yaw;
        const w=dt>0?turn/dt:0, v=this.speed, kk=Math.min(1,dt*6); this.wheel+=step/(WHEEL_R*k); this.crank+=step/(WHEEL_R*k)*GEAR;
        this.steer+=(Math.max(-STEER_MAX,Math.min(STEER_MAX,Math.atan(WHEELBASE*k*w/Math.max(v,1))))-this.steer)*kk; this.lean+=(Math.max(-0.2,Math.min(0.2,-Math.atan(v*w/9.8)))-this.lean)*kk; g.rotation.z=this.lean;
        if(typeof E3!=='undefined'&&E3.seeLOD){ const vis=E3.seeLOD(g.position.x,1.0,g.position.z,1.8); if(g.visible!==vis) g.visible=vis; if(!vis&&E3.seeCd>16) return; }   /* 畫面外、遠處（距離 LOD）不畫、不算車和人的動畫，照樣往前騎（X69）；16 m 內畫面外照算（鏡頭一轉過去不會露出沒更新的姿勢，同 NPC）*/
        pose(this.bike.userData.parts,this.wheel,this.crank,this.steer);
        if(typeof CHAR!=='undefined'&&CHAR.animate) CHAR.animate(rd,dt,{pose:'ride',speed:0,ride:{crank:this.crank,grips:grips(this.steer,k),scale:k}}); } }; };
  B.riding=()=>!!ride;
  /* 車停在哪（小地圖、大地圖的綠點）：沒在騎才有；舊存檔沒有 G.bike＝宿舍門口 */
  B.parkedAt=G=>{ if(!G) return null; const s=G.bike||HOME; return s.riding?null:{zone:s.zone,x:s.x,z:s.z}; };
  B.debug=()=>ride?{wheel:ride.wheel,crank:ride.crank,steer:ride.steer,lean:ride.lean,k:ride.k}:null;   /* 測試用（tests/bike_unit.js）*/
  /* 下車按鈕 */
  B.bindUI=function(GM){ const b=btn(); if(b) b.onclick=()=>B.manualDismount(GM); };
  /* 按「下車」（AA_137 第 5 節第 5 步，AA_140 G49）：載著人的時候中途下車＝她先下車、站在旁邊說一句；之後騎到她旁邊停下，她照第 2 步再坐上來 */
  B.manualDismount=function(GM){ if(!ride||GM.E.player.busy) return false; const pas=GM.E.npcs.find(n=>n.beh==='passenger'&&n.charId); B.dismount(GM);
    if(pas&&GM.caption) GM.caption((typeof SOCIAL!=='undefined'?SOCIAL.displayName(pas.charId):pas.name)+'：','……我還是走一下好了。',3200); return true; };
  return B;
})();

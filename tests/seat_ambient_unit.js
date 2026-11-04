// 坐著的 NPC 真的會動、在做事（NPC-AMBIENT-ANIM-1104，USER_WANTS X222；使用者 11-04 13:5x：「關於 NPC 要有什麼動作？難道沒有任何開源？……
// 就算只是拿著書和拿著手機都太不自然了一個人坐在那裡什麼都不做」）——不需要瀏覽器。
// 在 Node 載入遊戲的 three.js／three-vrm／CHAR／SEATACT（不算圖）、坐姿動作片段 assets/models/char/ual_sit_clips.glb（Quaternius UAL，CC0）、書和桌上小物的 GLB，
// 人物坐著跑（每格 1/30 秒），量真實骨架（人物座標：x 往左、y 往上、z 往前）：
//   ① 會動：坐著 10 秒內胸口、上胸、脖子、頭的方向（相對骨盆）都有在變（各 ≥ 0.4°）；每個人 60 秒裡至少 2 個小動作（第一個 ≤ 18 秒、
//      一個做完到下一個開始 8～25 秒）；幾個人加起來至少 4 種小動作；看四周的時候頭真的轉過去（≥ 15°）
//   ② 不同步：兩個人（同一個模型）同時坐下：10 秒裡同一格的上胸方向平均差 ≥ 0.5°、坐姿循環的速度不一樣
//   ③ read：手腕到 readIK 的目標每一格 ≤ 1.5 cm、書看得到、在兩手中間（≤ 6 cm）、每一格書的中心移動 ≤ 1 cm；翻頁的時候右手拇指在動（≥ 1 cm）、書不動；
//      滑手機（手機＝desk_props 的 item_phone_on）：拇指在動、手機不動；讀書的人頭照舊低著（頭比書高、往前看書）
//   ④ 坐著注視（st.lookAt）不累加：胸口偏離 < 26°、最後 1 秒變化 < 3°（同 tests/seated_look_unit.js）；正在看四周的時候有人跟他說話：0.6 秒內頭的小動作收回來
//   ⑤ 片段沒載好：退回原本的靜態坐姿（脊椎、胸口、頭、手臂的角度和舊程式一模一樣）、不報錯；載入失敗以後不再試（不會每一格下載）；
//      片段晚一點才好：已經坐著的人 0.8 秒內慢慢換過去（每一格 ≤ 8°、不到總變化的五分之一），不會一格跳過去
//   ⑥ 同桌兩個人（SEATACT.tick：一桌兩個路人互相看著對方＝聊天的一組）：每一格剛好一個人在說話（Sitting_Talking_Loop）、一個在點頭（Sitting_Nodding_Loop）；
//      15 秒內換過人；說話的人手在比劃（手腕移動 ≥ 3 cm）；一個人起身＝兩個人都拿掉
//   ⑦ 不能壞：腿、骨盆照舊 SIT_VRM（膝蓋、腳踝位置和靜態坐姿差 ≤ 1 cm）；跪坐的腿照舊；腿上的筆電照舊（上臂、前臂和靜態一樣）；
//      玩家（hero_m）不做頭的小動作（看四周、抬頭、伸脖子）；VRM 1.0 的模型（char.vrm_sample）也會動、手在大腿上方；
//      坐著、手上拿著東西（小說：配件掛在手上）＝手臂照舊、不撥頭髮，身體和頭照樣動
// 修改前（開發分支 c7fcc5b81）：①②⑥ FAIL（脊椎、胸口完全不動；兩個人一模一樣；沒有輪流說話）；③④⑤⑦ 只有舊的部分（不會動的部分）照樣 PASS。
// 用法：node tests/seat_ambient_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/seatact3d.js'),'utf8'),{filename:'src/seatact3d.js'});
const KEYS=['char.npc_m1','char.heroine_01','char.heroine_05','char.npc_nf1'];
const scene=new THREE.Scene();
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const deg=r=>(r*180/Math.PI).toFixed(1)+'°', cm=v=>(v*100).toFixed(1)+' cm';
const hasAmb=typeof CHAR.sitAmbReady==='function';
/* 固定的亂數（每次跑結果一樣）*/
const seeded=s=>()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; };
if(hasAmb) CHAR.ambRand=seeded(20261104);
const DT=1/30;
const R=(h,n)=>h.userData.vrm.humanoid.getRawBoneNode(n);
const relQ=(h,n)=>{ const b=R(h,n), hp=R(h,'hips'); if(!b||!hp) return null; return hp.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(b.getWorldQuaternion(new THREE.Quaternion())); };
const W=(h,n)=>{ const b=R(h,n); return b?b.getWorldPosition(new THREE.Vector3()):null; };
const step=(h,pose,st)=>{ CHAR.animate(h,DT,Object.assign({pose,speed:0},st||{})); scene.updateMatrixWorld(true); };
const mk=(key,spec)=>{ const h=CHAR.build(Object.assign({model:key,height:ASSETS.manifest[key].height||1.7},spec||{})); scene.add(h); return h; };
const rm=h=>{ scene.remove(h); CHAR.release(h); };
const amb=h=>h.userData.amb||null;
(async()=>{
  await preload(KEYS.concat(['char.yuting','char.vrm_sample']));
  for(const k of ['prop.book_open','prop.desk_props','prop.laptop_lap','char.ual_sit_clips']){ const u=ASSETS.manifest[k]&&ASSETS.manifest[k].url; if(u&&fs.existsSync(path.join(ROOT,u))){ window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); await ASSETS.loadOne(k).catch(()=>null); } }
  check('0 坐姿動作片段載好了（char.ual_sit_clips：Quaternius UAL1／UAL2，CC0）',!!ASSETS.manifest['char.ual_sit_clips']&&!!ASSETS.getRaw('char.ual_sit_clips'),ASSETS.manifest['char.ual_sit_clips']?'':'manifest 沒有 char.ual_sit_clips');
  /* ---------- ① 會動 ---------- */
  const kindsAll=new Set();
  for(const key of KEYS){ for(const pose of ['sit','read']){
    const h=mk(key); h.position.set(1.2,0,-0.6); h.rotation.y=0.7; const u=h.userData;
    for(let i=0;i<3;i++) step(h,pose); await new Promise(r=>setTimeout(r,5));
    const q0={}, mx={}; const bones=['chest','upperChest','neck','head']; let headYaw=0;
    const starts=[], ends=[]; let was=null;
    for(let i=0;i<30*60;i++){ step(h,pose); const m=amb(h), fx=m&&m.fx?m.fx.kind:null;
      if(i<300) for(const b of bones){ const q=relQ(h,b); if(!q) continue; if(!q0[b]) q0[b]=q.clone(); mx[b]=Math.max(mx[b]||0,q.angleTo(q0[b])); }
      if(fx&&!was){ starts.push(i*DT); kindsAll.add(fx); } if(!fx&&was) ends.push(i*DT); was=fx;
      if(fx==='look'){ const q=relQ(h,'head'); if(q){ const e=new THREE.Euler().setFromQuaternion(q,'YXZ'); headYaw=Math.max(headYaw,Math.abs(e.y)); } } }
    const moved=bones.filter(b=>R(h,b)).every(b=>(mx[b]||0)>=0.4*Math.PI/180);
    check(`① ${key} ${pose}：10 秒內胸口、上胸、脖子、頭都有在動（各 ≥ 0.4°）`,moved,bones.map(b=>b+' '+deg(mx[b]||0)).join('、'));
    const gaps=[]; for(let k=1;k<starts.length;k++){ const e=ends.filter(t=>t<=starts[k]).pop(); if(e!=null) gaps.push(starts[k]-e); }
    check(`① ${key} ${pose}：60 秒裡至少 2 個小動作、第一個 ≤ 18 秒、間隔 8～25 秒`,starts.length>=2&&starts[0]<=18.1&&gaps.every(g=>g>=7.9&&g<=25.1),'開始 '+starts.map(t=>t.toFixed(1)).join('、')+' 秒；間隔 '+gaps.map(t=>t.toFixed(1)).join('、')+'；'+(amb(h)?Object.entries(amb(h).kinds).map(([k,v])=>k+'×'+v).join(' '):'沒有小動作'));
    if(amb(h)&&amb(h).kinds.look) check(`① ${key} ${pose}：看四周的時候頭真的轉過去（≥ 15°）`,headYaw>=15*Math.PI/180,deg(headYaw));
    rm(h); } }
  check('① 幾個人加起來至少 4 種小動作',kindsAll.size>=4,[...kindsAll].join('、')||'沒有');
  /* ---------- ② 不同步 ---------- */
  { const a=mk('char.npc_m1'), b=mk('char.npc_m1'); a.position.set(0,0,0); b.position.set(0.8,0,0); let sum=0, n=0;
    for(let i=0;i<300;i++){ step(a,'sit'); step(b,'sit'); const qa=relQ(a,'upperChest')||relQ(a,'chest'), qb=relQ(b,'upperChest')||relQ(b,'chest'); sum+=qa.angleTo(qb); n++; }
    const ra=amb(a)&&amb(a).rate, rb=amb(b)&&amb(b).rate;
    check('② 兩個人同時坐下：上胸的方向不一樣（10 秒平均差 ≥ 0.5°）、坐姿循環的速度不一樣',sum/n>=0.5*Math.PI/180&&ra&&rb&&Math.abs(ra-rb)>1e-3,'平均差 '+deg(sum/n)+'、速度 '+(ra?ra.toFixed(3):'-')+'／'+(rb?rb.toFixed(3):'-')+'、片段 '+(amb(a)&&amb(a).base)+'／'+(amb(b)&&amb(b).base));
    rm(a); rm(b); }
  /* ---------- ③ read：手臂還是 readIK 的、書沒掉；翻頁、滑手機 ---------- */
  for(const key of KEYS.slice(0,3)){ for(const item of ['book','phone']){
    const h=mk(key); h.position.set(-2,0.05,1); h.rotation.y=2.3; const u=h.userData; if(item!=='book') CHAR.setReadItem(h,item);
    for(let i=0;i<3;i++) step(h,'read'); await new Promise(r=>setTimeout(r,5)); for(let i=0;i<20;i++) step(h,'read');
    const held=()=>item==='book'?u.readBook:(u.readHeld&&u.readHeld[item]);
    if(item!=='book'&&!(held()&&held().visible&&!held().userData.failed)){ console.log('INFO '+key+' 沒有手機的模型（desk_props 沒載好）：不測滑手机'); rm(h); continue; }
    let maxErr=0, maxJump=0, mid=0, prevC=null, thumb=0, t0=null, headAbove=true, vis=true;
    if(hasAmb&&item==='book') CHAR.sitAmbFidget(h,'page');
    const thumbOf=()=>W(h,'rightThumbDistal')&&h.worldToLocal(W(h,'rightThumbDistal'));
    for(let i=0;i<30*8;i++){ step(h,'read'); const bk=held(); if(!bk||!bk.visible){ vis=false; continue; }
      const hand=[W(h,'leftHand'),W(h,'rightHand')], tg=u.readHands||[]; if(tg.length===2) maxErr=Math.max(maxErr,hand[0].distanceTo(tg[0]),hand[1].distanceTo(tg[1]));
      const c=bk.getWorldPosition(new THREE.Vector3()); if(prevC) maxJump=Math.max(maxJump,c.distanceTo(prevC)); prevC=c;
      { bk.updateMatrixWorld(true); const inv=bk.matrixWorld.clone().invert(), hm=hand[0].clone().add(hand[1]).multiplyScalar(0.5).applyMatrix4(inv); mid=Math.max(mid,Math.abs(hm.x)); }   /* 左右（書的 x，同 read_book_unit ④）*/
      const tp=thumbOf(); if(tp){ if(!t0) t0=tp.clone(); thumb=Math.max(thumb,tp.distanceTo(t0)); }
      const hd=W(h,'head'); if(hd.y<c.y+0.05) headAbove=false; }
    check(`③ ${key} 手上${item==='book'?'的書':'的手機'}：手腕到 readIK 的目標每一格 ≤ 1.5 cm、看得到、在兩手中間（左右 ≤ 6 cm）、每一格移動 ≤ 1 cm、頭在上面`,vis&&maxErr<=0.015&&mid<=0.06&&maxJump<=0.01&&headAbove,'手腕 '+cm(maxErr)+'、兩手中間 '+cm(mid)+'、每格移動 '+cm(maxJump)+(headAbove?'':'、頭比書低'));
    check(`③ ${key} ${item==='book'?'翻頁':'滑手機'}的時候右手拇指在動（≥ 1 cm）`,thumb>=0.01,cm(thumb)+(item==='book'?'（翻頁）':'（滑 '+(hasAmb&&amb(h)?'×'+'計時':'')+'）'));
    rm(h); } }
  /* ---------- ④ 注視不累加；有人說話時頭的小動作收回來 ---------- */
  { const yawOf=o=>{ const q=new THREE.Quaternion(); o.getWorldQuaternion(q); const f=new THREE.Vector3(0,0,1).applyQuaternion(q); return Math.atan2(f.x,f.z); }; const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
    for(const pose of ['sit','read']){ const h=mk('char.npc_m1'); h.position.set(1.8,0,2.2); h.rotation.y=Math.PI; const look=new THREE.Vector3(0.2,0,1.0);
      for(let i=0;i<15;i++) step(h,pose); const chest=R(h,'chest'), hips=R(h,'hips'); const base=wrap(yawOf(chest)-yawOf(hips)); let maxDev=0, last=0, at2=0;
      for(let i=0;i<90;i++){ step(h,pose,{lookAt:look}); const d=Math.abs(wrap(yawOf(chest)-yawOf(hips)-base)); maxDev=Math.max(maxDev,d); last=d; if(i===59) at2=d; }
      check(`④ ${pose} 看著旁邊 3 秒：胸口不累加（偏離 < 26°、最後 1 秒變化 < 3°）`,maxDev<0.45&&Math.abs(last-at2)<0.05,'偏離 '+deg(maxDev)+'、最後 1 秒 '+deg(Math.abs(last-at2)));
      rm(h); }
    if(hasAmb){ const h=mk('char.heroine_01'); for(let i=0;i<10;i++) step(h,'sit'); CHAR.sitAmbFidget(h,'side'); for(let i=0;i<30;i++) step(h,'sit'); const m=amb(h), mid0=Math.max(Math.abs(m.head[0]),Math.abs(m.head[1]));
      for(let i=0;i<18;i++) step(h,'sit',{lookAt:new THREE.Vector3(1,1,1)}); const after=Math.max(Math.abs(m.head[0]),Math.abs(m.head[1]));
      check('④ 正在往一邊看（程式的頭）的時候有人跟他說話：0.6 秒內頭的小動作收回來',mid0>0.1&&after<0.01,'往一邊看 '+deg(mid0)+' → 說話 0.6 秒後 '+deg(after));
      for(let i=0;i<30;i++) step(h,'sit'); CHAR.sitAmbFidget(h,'look'); for(let i=0;i<20;i++) step(h,'sit'); const w0=m.ov===CHAR.SIT_AMB.look?m.ow:0;
      for(let i=0;i<21;i++) step(h,'sit',{lookAt:new THREE.Vector3(1,1,1)}); const w1=m.ov===CHAR.SIT_AMB.look?m.ow:0;
      check('④ 正在看看四周（Sitting_Idle02_Loop 疊一次）的時候有人跟他說話：0.7 秒內放掉',w0>0.5&&w1<0.01,'疊的權重 '+w0.toFixed(2)+' → 說話 0.7 秒後 '+w1.toFixed(2)); rm(h); }
    else check('④ 正在看四周的時候有人跟他說話：0.6 秒內頭的小動作收回來',false,'沒有坐著的小動作（CHAR.sitAmbReady）'); }
  /* ---------- ⑦ 不能壞 ---------- */
  if(hasAmb){ const legs=['leftLowerLeg','rightLowerLeg','leftFoot','rightFoot'];
    const pos=(h,list)=>list.map(n=>h.worldToLocal(W(h,n)));
    const runSet=(flag,fn)=>{ const was=CHAR.sitAmb; CHAR.sitAmb=flag; const r=fn(); CHAR.sitAmb=was; return r; };
    for(const key of KEYS.slice(0,2)){ const h=mk(key); for(let i=0;i<5;i++) step(h,'sit'); const A=pos(h,legs); runSet(false,()=>{ for(let i=0;i<3;i++) step(h,'sit'); }); const B=pos(h,legs); runSet(true,()=>step(h,'sit'));
      const d=Math.max(...A.map((v,i)=>v.distanceTo(B[i]))); check(`⑦ ${key} 腿照舊 SIT_VRM：膝蓋、腳踝和靜態坐姿差 ≤ 1 cm`,d<=0.01,cm(d)); rm(h); }
    { const h=mk('char.heroine_01'); h.userData.sitFloor=0.05; for(let i=0;i<5;i++) step(h,'sit'); const A=pos(h,legs); runSet(false,()=>{ for(let i=0;i<3;i++) step(h,'sit'); }); const B=pos(h,legs); runSet(true,()=>step(h,'sit'));
      const d=Math.max(...A.map((v,i)=>v.distanceTo(B[i]))), ua=h.userData.bones.LeftArm.quaternion.clone(); const ex=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-0.35,-1.15*(h.userData.sx||1)));
      check('⑦ 跪坐（sitFloor）：腿照舊 SEIZA_VRM（差 ≤ 1 cm）、手臂照舊（上臂＝SEIZA_VRM）',d<=0.01&&ua.angleTo(ex)<1e-3,cm(d)+'、上臂差 '+deg(ua.angleTo(ex))); rm(h); }
    { const h=mk('char.heroine_04'.replace('04','01'),{props:['laptop_lap']}); const ok=CHAR.setProp(h,'laptop_lap',true); for(let i=0;i<5;i++) step(h,'sit'); const B=h.userData.bones, sx=h.userData.sx||1;
      const ex=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,-1.25*sx)), d=B.LeftArm.quaternion.angleTo(ex), lap=h.userData.props&&h.userData.props.laptop_lap;
      check('⑦ 腿上的筆電：手臂照舊（上臂＝SIT_VRM）',!lap||!lap.visible||d<1e-3,lap?(lap.visible?'上臂差 '+deg(d):'筆電沒顯示（模型沒載）'):'沒有 laptop_lap 配件'); rm(h); }
    { const h=mk('char.yuting',{id:'hero_m'}); for(let i=0;i<30*80;i++) step(h,'sit'); const m=amb(h)||{kinds:{}}; const bad=['look','side','up','stretch','glance','hair'].filter(k=>m.kinds[k]);
      check('⑦ 玩家（hero_m）不做頭的小動作（看四周、抬頭、伸脖子）、照樣換坐姿',!bad.length&&(m.kinds.posture|0)>=1,Object.entries(m.kinds).map(([k,v])=>k+'×'+v).join(' ')||'沒有'); rm(h); }
    { const h=mk('char.vrm_sample'); const v0=h.userData.v0; const q0={}, mx={}; for(let i=0;i<300;i++){ step(h,'sit'); for(const b of ['upperChest','neck','head']){ const q=relQ(h,b); if(!q) continue; if(!q0[b]) q0[b]=q.clone(); mx[b]=Math.max(mx[b]||0,q.angleTo(q0[b])); } }
      const L=h.worldToLocal(W(h,'leftHand')), T=h.worldToLocal(W(h,'leftUpperLeg')), K=h.worldToLocal(W(h,'leftLowerLeg')); const onLap=L.y>T.y&&L.y<T.y+0.25&&L.z>T.z+0.05&&L.z<K.z+0.05&&Math.abs(L.x-T.x)<0.15;
      check('⑦ VRM 1.0 的模型（char.vrm_sample）也會動、手在大腿上方',!v0&&Object.values(mx).some(v=>v>=0.4*Math.PI/180)&&onLap,'VRM '+(v0?'0.x':'1.0')+'、'+Object.entries(mx).map(([k,v])=>k+' '+deg(v)).join('、')+'、左手相對大腿根 '+[L.x-T.x,L.y-T.y,L.z-T.z].map(cm).join('／')); rm(h); } }
  else check('⑦ 坐著會動的部分（沒有 CHAR.sitAmbReady）',false,'修改前');
  /* ---------- ⑥ 同桌兩個人：輪流說話、點頭 ---------- */
  { const ha=mk('char.npc_m1'), hb=mk('char.npc_nf1'); const sa={x:0,z:0,yaw:0,lv:0}, sb={x:0,z:1.1,yaw:Math.PI,lv:0};
    ha.position.set(sa.x,0,sa.z); ha.rotation.y=sa.yaw; hb.position.set(sb.x,0,sb.z); hb.rotation.y=sb.yaw;
    const na={obj:ha,seat:sa,pose:'sit',idlePose:'sit',isExtra:true,name:'',lv:0,frozen:true}, nb={obj:hb,seat:sb,pose:'sit',idlePose:'sit',isExtra:true,name:'',lv:0,frozen:true}; na.lookAt=hb.position; nb.lookAt=ha.position;
    const E={zone:{seats:[sa,sb],group:new THREE.Group()},npcs:[na,nb],player:{obj:{position:new THREE.Vector3(3,0,3)}},scene}; const GM={E,G:{zone:'cafe',day:5}};
    SEATACT.tick(GM); await new Promise(r=>setTimeout(r,5)); SEATACT.tick(GM);
    const P=ha.userData.sitChat&&ha.userData.sitChat.pair; check('⑥ SEATACT：一桌兩個路人互相看著對方＝聊天的一組（兩個人的 userData.sitChat 是同一組）',!!P&&hb.userData.sitChat&&hb.userData.sitChat.pair===P);
    let bad=0, n=0, swaps=0, lastTalker=null, hand0=null, wave=0, onOk=0; const T=hasAmb?CHAR.SIT_AMB.talk:'?', N=hasAmb?CHAR.SIT_AMB.nod:'?';
    for(let i=0;i<30*16;i++){ step(ha,na.pose,{lookAt:hb.position}); step(hb,nb.pose,{lookAt:ha.position}); if(i<45) continue;
      const ma=amb(ha), mb=amb(hb); const ra=ma&&ma.chatRole, rb=mb&&mb.chatRole; n++; if(!((ra==='talk'&&rb==='nod')||(ra==='nod'&&rb==='talk'))) bad++;
      const talker=ra==='talk'?ha:(rb==='talk'?hb:null); if(talker&&lastTalker&&talker!==lastTalker) swaps++; if(talker) lastTalker=talker;
      if(ma&&mb&&((ma.ov===T&&mb.ov===N)||(ma.ov===N&&mb.ov===T))&&ma.ow>0.5&&mb.ow>0.5) onOk++;   /* 疊的片段真的在播（換人的時候兩邊各有 0.6 秒在交叉淡入）*/
      if(talker===ha){ const w=ha.worldToLocal(W(ha,'rightHand')); if(!hand0) hand0=w.clone(); wave=Math.max(wave,w.distanceTo(hand0)); } }
    check('⑥ 每一格剛好一個人在說話（Sitting_Talking_Loop）、一個在點頭（Sitting_Nodding_Loop）（換人那一格可以差一格：兩個人更新的先後；片段真的在播 ≥ 六成的格）；15 秒內換過人；說話的人手在比劃（≥ 3 cm）',n>0&&bad<=swaps&&swaps>=1&&wave>=0.03&&onOk>=0.6*n,'不對的格數 '+bad+'／'+n+'、片段在播 '+onOk+'／'+n+'、換人 '+swaps+' 次、手 '+cm(wave));
    nb.pose='idle'; SEATACT.tick(GM); check('⑥ 一個人起身：兩個人的聊天都拿掉',!ha.userData.sitChat&&!hb.userData.sitChat);
    SEATACT.clear(); rm(ha); rm(hb); }
  /* ---------- ⑤ 片段沒載好：照舊靜止、不報錯、不再試 ---------- */
  { const key='char.npc_m1'; const raw=ASSETS.cache['char.ual_sit_clips']; delete ASSETS.cache['char.ual_sit_clips']; delete ASSETS.status['char.ual_sit_clips']; const url=ASSETS.manifest['char.ual_sit_clips']&&ASSETS.manifest['char.ual_sit_clips'].url; if(url) delete window.ASSET_DATA[url];
    if(hasAmb) CHAR._ambReset(); let calls=0; const lo=ASSETS.loadOne; ASSETS.loadOne=k=>{ if(k==='char.ual_sit_clips') calls++; return lo(k); }; const ow=console.warn; console.warn=()=>{};
    const h=mk(key); const u=h.userData, B=u.bones, sx=u.sx||1; let err=null, worst=0;
    const SIT={LeftUpLeg:[-1.45,0,0],LeftLeg:[1.5,0,0],LeftArm:[0,0,-1.25],RightArm:[0,0,1.25],LeftForeArm:[0,0,0]};
    try{ for(let i=0;i<60;i++){ step(h,'sit'); if(i===2) await new Promise(r=>setTimeout(r,20)); const t=u.anim.t;
        const exp={Spine:[0.06*sx,0,0],Spine1:[0,0,0],Head:[Math.sin(t*0.7)*0.03*sx,Math.sin(t*0.4)*0.15,0]}; for(const n in SIT) exp[n]=[SIT[n][0]*sx,SIT[n][1],SIT[n][2]*sx];
        for(const n in exp){ if(!B[n]) continue; const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(...exp[n])); worst=Math.max(worst,B[n].quaternion.angleTo(q)); } } }catch(e){ err=e; }
    console.warn=ow;
    check('⑤ 片段沒載好：照舊的靜態坐姿（脊椎、胸口、頭、腿、手臂和舊程式一樣）、不報錯',!err&&worst<1e-4,err?String(err).slice(0,120):'最大差 '+deg(worst));
    check('⑤ 載入失敗以後不再試（60 格只下載 1 次）、記下失敗',calls<=1&&(!hasAmb||CHAR._amb.failed===true),'下載 '+calls+' 次'+(hasAmb?'、failed '+CHAR._amb.failed:''));
    if(hasAmb){ const now0=Date.now, c0=calls; Date.now=()=>now0()+31000; console.warn=()=>{}; step(h,'sit'); step(h,'sit'); Date.now=now0; await new Promise(r=>setTimeout(r,30)); console.warn=ow;
      check('⑤ 30 秒後再試一次（手機網路斷一下不會整場都不動）',calls===c0+1,'過 31 秒以後下載 '+(calls-c0)+' 次'); }
    ASSETS.loadOne=lo;
    /* 片段晚一點才好（下載慢）：已經坐著（靜態）的人 0.8 秒內慢慢換過去，不會一格跳過去（手從身體兩側到大腿上差 60° 以上）*/
    if(raw){ ASSETS.cache['char.ual_sit_clips']=raw; if(hasAmb) CHAR._ambReset(); }
    { const bones=['leftUpperArm','rightUpperArm','chest','neck','head']; let prev=null, jump=0, i=0; const q0=bones.map(b=>relQ(h,b));
      for(;i<45;i++){ step(h,'sit'); const q=bones.map(b=>relQ(h,b)); if(prev) jump=Math.max(jump,...q.map((x,j)=>x.angleTo(prev[j]))); prev=q; }
      const tot=Math.max(...prev.map((x,j)=>x.angleTo(q0[j]))), m=amb(h);
      check('⑤ 片段晚一點才好：已經坐著的人慢慢換過去（每一格 ≤ 8°、而且不到總變化的五分之一）、1.5 秒內換好',hasAmb&&!!h.userData.ambOn&&!!m&&m.inW>=1&&jump<=8*Math.PI/180&&tot>=10*Math.PI/180&&jump<=tot/5,'每一格最多 '+deg(jump)+'、總共 '+deg(tot)+(m?'、inW '+m.inW.toFixed(2):'')); }
    rm(h); }
  /* ---------- 手上拿著東西（采潔的小說）：手臂照舊、不撥頭髮 ---------- */
  if(hasAmb){ const nv=ASSETS.manifest['prop.novel']&&ASSETS.manifest['prop.novel'].url; if(nv&&fs.existsSync(path.join(ROOT,nv))){ window.ASSET_DATA[nv]=fs.readFileSync(path.join(ROOT,nv)).toString('base64'); await ASSETS.loadOne('prop.novel').catch(()=>null); }
    const h=mk('char.heroine_01',{props:['novel']}); for(let i=0;i<3;i++) step(h,'sit'); await new Promise(r=>setTimeout(r,5)); const u=h.userData, sx=u.sx||1, nov=u.props&&u.props.novel;
    let worst=0; for(let i=0;i<30*70;i++){ step(h,'sit'); const ex=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,-1.25*sx)); worst=Math.max(worst,u.bones.LeftArm.quaternion.angleTo(ex)); }
    const m=amb(h)||{kinds:{}};
    check('⑦ 坐著、手上拿著小說：手臂照舊（上臂＝SIT_VRM）、不撥頭髮；身體、頭照樣動',!!nov&&nov.visible&&worst<1e-3&&!m.kinds.hair&&m.n>=2,nov?('小說 '+(nov.visible?'看得到':'藏起來')+'、上臂差 '+deg(worst)+'、'+Object.entries(m.kinds).map(([k,v])=>k+'×'+v).join(' ')):'沒有小說的配件'); rm(h); }
  console.log(fails?`FAILED ${fails}`:'ALL PASS');
  process.exit(fails?1:0);
})().catch(e=>{ console.error('ERR',e); process.exit(2); });

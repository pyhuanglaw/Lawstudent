// 坐著滑手機（SEAT-ACTIVITY-1104，使用者 11-04「有可能會出現筆記型電腦、平板或者單純在滑手機」；character3d.js 的 readIK＋C.READ_ITEM.phone、props3d.js 的 readHeld；src/seatact3d.js 決定誰在滑手機）：
// 在 Node 裡載入遊戲的人物（不算圖）、desk_props.glb（手機＝item_phone_on）、書的 GLB，pose 'read'＋CHAR.setReadItem(人物,'phone') 跑一秒（每格 1/30 秒），量真實骨架（手機的座標：x 往人物的右邊、y 往上、+z 朝向看的人）：
//   ① 手上是手機：看得到、正式模型載好了（desk_props 的 item_phone_on）；書藏起來（沒有兩樣東西）
//   ② 兩手在手機的左右兩側（左手腕 x −13～−2 cm、右手腕 2～13 cm）、高度在手機範圍附近（|y| ≤ 12 cm）、在手機背面後面 0.3～6 cm（不在螢幕前面）
//   ③ 螢幕朝臉：法線和「手機→兩眼中點」的夾角 ≤ 20°；頭比手機高 ≥ 15 cm（低頭看）
//   ④ 手機在大腿上方、胸口下方、在髖關節前面 ≥ 15 cm；手腕比大腿根高 ≥ 6 cm（手不穿進大腿）
//   ⑤ 平滑：每一格手腕最多移動 1 cm
//   ⑥ 換回書（setReadItem 'book'）：書出現、手機藏起來；再換成手機：手機出現、書藏起來；起身（idle）兩樣都藏
//   ⑦ 沒有這個單件（平板，desk_props 還沒有 item_tablet）：照拿書（不會兩手空空）
// 修改前（只有書：沒有 CHAR.setReadItem、PROPS.readHeld）：①②③④⑥⑦ FAIL。用法：node tests/read_phone_unit.js [char.npc_f1 ...]
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path');
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.npc_f1','char.npc_nm1','char.heroine_05'];
const scene=new THREE.Scene();
(async()=>{
  await preload(keys);
  for(const k of ['prop.book_open','prop.desk_props']){ const u=ASSETS.manifest[k]&&ASSETS.manifest[k].url; if(u){ window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); await ASSETS.loadOne(k); } }
  let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
  const cm=v=>(v*100).toFixed(1)+' cm', deg=r=>(r*180/Math.PI).toFixed(0)+'°';
  const tick=async(h,pose,n)=>{ for(let i=0;i<n;i++){ CHAR.animate(h,1/30,{pose,speed:0}); scene.updateMatrixWorld(true); if(i===1) await new Promise(r=>setTimeout(r,5)); } };
  const has=typeof CHAR.setReadItem==='function';
  check('0 有 CHAR.setReadItem、PROPS.readHeld',has&&typeof PROPS.readHeld==='function');
  for(const key of keys){
    const h=CHAR.build({model:key,height:ASSETS.manifest[key].height||1.7}); scene.add(h); const u=h.userData, R=n=>u.vrm.humanoid.getRawBoneNode(n);
    h.position.set(2.1,0.02,-1.3); h.rotation.y=-0.8; h.updateMatrixWorld(true);
    const Lc=n=>h.worldToLocal(R(n).getWorldPosition(new THREE.Vector3())), W=n=>R(n).getWorldPosition(new THREE.Vector3());
    if(has) CHAR.setReadItem(h,'phone');
    await tick(h,'read',30);
    const ph=u.readHeld&&u.readHeld.phone; let glb=false; if(ph) ph.traverse(o=>{ if(o.isMesh&&o.name==='item_phone_on') glb=true; });
    check(`① ${key} 手上是手機（看得到、desk_props 的 item_phone_on）、書藏起來`,!!ph&&ph.visible&&glb&&!(u.readBook&&u.readBook.visible),ph?('visible '+ph.visible+'、GLB '+glb+'、書 '+!!(u.readBook&&u.readBook.visible)):'沒有手機');
    { const m=ph&&ph.children[0]; const up=m?new THREE.Vector3(0,1,0).applyQuaternion(m.quaternion):null, top=m?new THREE.Vector3(0,0,1).applyQuaternion(m.quaternion):null, lf=m?new THREE.Vector3(1,0,0).applyQuaternion(m.quaternion):null;
      check(`① ${key} 手機的方向：螢幕（單件 +y）朝看的人（+z）、頂端（單件 +z）朝上、單件的左邊（+x）在人物的左邊（手機座標 −x）；厚度的中間在 0`,!!m&&up.z>0.999&&top.y>0.999&&lf.x<-0.999&&Math.abs(m.position.z+0.004)<0.002,m?('螢幕 '+up.toArray().map(v=>v.toFixed(2))+'、頂端 '+top.toArray().map(v=>v.toFixed(2))+'、z '+m.position.z.toFixed(4)):'沒有'); }
    const F=[]; let prev=null, jump=0;
    for(let i=0;i<30&&ph;i++){ await tick(h,'read',1); const hand=[W('leftHand'),W('rightHand')]; if(prev) jump=Math.max(jump,hand[0].distanceTo(prev[0]),hand[1].distanceTo(prev[1])); prev=hand;
      ph.updateMatrixWorld(true); const inv=ph.matrixWorld.clone().invert(), sc=new THREE.Vector3().setFromMatrixScale(ph.matrixWorld), PL=v=>v.clone().applyMatrix4(inv).multiply(sc);
      const q=ph.getWorldQuaternion(new THREE.Quaternion()), nrm=new THREE.Vector3(0,0,1).applyQuaternion(q), ctr=ph.getWorldPosition(new THREE.Vector3()), eye=W('leftEye').add(W('rightEye')).multiplyScalar(0.5);
      F.push({wl:PL(hand[0]),wr:PL(hand[1]),face:nrm.angleTo(eye.clone().sub(ctr).normalize()),c:h.worldToLocal(ctr.clone()),head:Lc('head'),hips:Lc('hips'),chest:Lc('upperChest'),uleg:Math.max(Lc('leftUpperLeg').y,Lc('rightUpperLeg').y),hy:[Lc('leftHand').y,Lc('rightHand').y]}); }
    if(F.length){ const mx=a=>Math.max(...a), mn=a=>Math.min(...a);
      const xl=F.map(f=>f.wl.x), xr=F.map(f=>f.wr.x), ys=F.flatMap(f=>[f.wl.y,f.wr.y]), zs=F.flatMap(f=>[f.wl.z,f.wr.z]);
      check(`② ${key} 兩手在手機兩側（左 −13～−2 cm、右 2～13 cm）、|y| ≤ 12 cm、在背面後面 0.3～6 cm`,xl.every(x=>x>=-0.13&&x<=-0.02)&&xr.every(x=>x>=0.02&&x<=0.13)&&ys.every(y=>Math.abs(y)<=0.12)&&zs.every(z=>z<=-0.003&&z>=-0.06),
        '左 '+cm(mn(xl))+'～'+cm(mx(xl))+'、右 '+cm(mn(xr))+'～'+cm(mx(xr))+'、y '+cm(mn(ys))+'～'+cm(mx(ys))+'、z '+cm(mn(zs))+'～'+cm(mx(zs)));
      const fa=F.map(f=>f.face); check(`③ ${key} 螢幕朝臉（≤ 20°）、頭比手機高 ≥ 15 cm`,fa.every(a=>a<=20*Math.PI/180)&&F.every(f=>f.head.y>f.c.y+0.15),'最大 '+deg(mx(fa)));
      check(`④ ${key} 手機在大腿上方、胸口下方、髖關節前面 ≥ 15 cm；手腕比大腿根高 ≥ 6 cm`,F.every(f=>f.c.y>f.uleg+0.08&&f.c.y<f.chest.y&&f.c.z-f.hips.z>=0.15&&f.hy.every(y=>y>=f.uleg+0.06)),
        '中心比大腿根高 '+cm(mn(F.map(f=>f.c.y-f.uleg)))+'、往前 '+cm(mn(F.map(f=>f.c.z-f.hips.z)))+'、手腕 '+cm(mn(F.flatMap(f=>f.hy.map(y=>y-f.uleg)))));
      check(`⑤ ${key} 平滑：每一格手腕最多移動 1 cm`,jump<=0.01,'最大 '+cm(jump)); }
    else for(const n of ['②','③','④','⑤']) check(`${n} ${key}（沒有手機，量不到）`,false);
    if(has){ CHAR.setReadItem(h,'book'); await tick(h,'read',5); const b1=!!(u.readBook&&u.readBook.visible), p1=!!(ph&&ph.visible);
      CHAR.setReadItem(h,'phone'); await tick(h,'read',5); const b2=!!(u.readBook&&u.readBook.visible), p2=!!(ph&&ph.visible);
      await tick(h,'idle',3); const b3=!!(u.readBook&&u.readBook.visible), p3=!!(ph&&ph.visible);
      check(`⑥ ${key} 換回書：書出現、手機藏；再換成手機：手機出現、書藏；起身兩樣都藏`,b1&&!p1&&p2&&!b2&&!b3&&!p3,'書 '+[b1,b2,b3]+'、手機 '+[p1,p2,p3]);
      CHAR.setReadItem(h,'tablet'); await tick(h,'read',8); const tb=u.readHeld&&u.readHeld.tablet;
      check(`⑦ ${key} 平板（desk_props 還沒有 item_tablet）：照拿書`,!!(u.readBook&&u.readBook.visible)&&!(tb&&tb.visible),'書 '+!!(u.readBook&&u.readBook.visible)+'、平板 '+!!(tb&&tb.visible)); }
    else { check(`⑥ ${key}（沒有 setReadItem）`,false); check(`⑦ ${key}（沒有 setReadItem）`,false); }
    scene.remove(h); CHAR.release(h); }
  console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

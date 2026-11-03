// 坐著讀書手上有書（READ-POSE-BOOK-1103；使用者 11-03 附 Café 沙發截圖：「不管事咖啡廳 還是圖書館 都給我這樣念書 會笑出來 書在哪」）：
// 在 Node 裡載入遊戲的人物（不算圖）與書的 GLB（prop.book_open），pose 'read' 跑一秒（每格 1/30 秒），量真實骨架（人物座標：x 往左、y 往上、z 往前；書的座標：x 往右頁、y 頁面往上、+z 朝向讀的人）：
//   ① 讀書的時候有一本打開的書、看得到、正式模型載好了（不是空的群組）；
//   ② 其他姿勢看不到：read → sit、idle、walk 書都藏起來，再回到 read 又出現；從來沒讀過書的人沒有書；
//   ③ 兩手捧著書的兩側：左手腕在書的左半邊外側、右手腕在右半邊外側（書的 x：8～19 cm），高度在頁面範圍內（|y| ≤ 11 cm），在封底後面 0.5～5 cm（手掌貼著封底，不穿過書頁、不在書前面）；
//      手腕到最近的外緣（左右邊）≤ 6 cm；
//   ④ 書在兩手中間：書的中心到兩手腕中點 ≤ 6 cm（左右）；書在大腿上方到胸口下方：最低的角比大腿根高 ≥ 10 cm、中心比胸口（upperChest）低、在髖關節前面 ≥ 18 cm；
//   ⑤ 書面朝臉：頁面的法線和「書→兩眼中點」的夾角 ≤ 15°；頭在書上面（低頭看書）；
//   ⑥ 手不穿過書、大腿：手指（中節、末節的關節＝手指的中心線）都在封底後面 ≥ 0.6 cm（封底的高度照 book_open.py 的式子）；手腕比大腿根高 ≥ 8 cm；
//   ⑦ 手肘在身體外側、肩膀下面（離中線 ≥ 13 cm），手掌朝向書（掌心方向和書的 +z 夾角 ≤ 30°）；
//   ⑧ 手上原本拿的東西（例：采潔的小說）讀書時收起來、坐著、站著照舊拿著；
//   ⑨ 平滑：連續讀書的時候每一格手腕最多移動 1 cm（頭的小晃動不會讓書、手抖）；
//   ⑩ 前面有桌子（桌面比髖關節高 22 cm）：書整本、兩手腕比桌面高 ≥ 3 cm（不穿進桌子、不藏在桌子底下）；拿走桌子就不抬（Café 的桌子、總圖長桌截圖發現的，2026-11-03 接手的子代理）。
// 修改前（READ_VRM 只有手臂角度：兩手往前下方張開、沒有書）：①②③④⑤⑥⑦⑧ 失敗；⑩ 在加 readTable 之前失敗（書在桌面底下）。
// 用法：node tests/read_book_unit.js [char.yuting ...]（不給就祐廷、沈以安、溫學姊、兩個路人底模、GLB driver 的 rpm_sample；GLB 沒有配件，不測 ⑧）
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path');
const keys=process.argv.slice(2).length?process.argv.slice(2):['char.yuting','char.heroine_01','char.heroine_05','char.npc_f1','char.npc_nm1','char.rpm_sample'];   /* char.rpm_sample：GLB driver（Mixamo 骨架；已停用的開發用模型，只拿來測 GLB 那一條路）*/
/* GLB driver 的骨頭名稱（Mixamo）；VRM 用 humanoid 的真實骨架 */
const GLBN={hips:'Hips',head:'Head',upperChest:'Spine2',leftEye:'LeftEye',rightEye:'RightEye',leftUpperLeg:'LeftUpLeg',rightUpperLeg:'RightUpLeg',leftLowerLeg:'LeftLeg',rightLowerLeg:'RightLeg'};
for(const [s,S] of [['left','Left'],['right','Right']]){ Object.assign(GLBN,{[s+'UpperArm']:S+'Arm',[s+'LowerArm']:S+'ForeArm',[s+'Hand']:S+'Hand'}); for(const [f,F] of [['Index','Index'],['Middle','Middle'],['Ring','Ring'],['Little','Pinky']]) ['Proximal','Intermediate','Distal'].forEach((j,i)=>{ GLBN[s+f+j]=S+'Hand'+F+(i+1); }); }
const scene=new THREE.Scene();
/* 封底（書的外側）的 z：和 tools/blender/char_second/book_open.py 的 top()、under()、cover_in() 同一組式子（x＝離書溝多遠，公尺）*/
const BW=0.15, BT=0.009, BCT=0.0025;
const btop=s=>{ s=Math.min(1,Math.max(0,s)); return 0.0135*Math.sin(Math.min(1,s*1.45)*Math.PI/2)-0.0025*Math.max(0,s-0.7)/0.3; };
const bunder=s=>btop(s)-BT*Math.min(1,0.35+s*4)-0.004*Math.max(0,1-s/0.08);
const backZ=x=>{ const s=x/BW; let c=bunder(Math.min(1,s)); if(x<0.014) c=Math.min(c,bunder(0)-0.006*(1-(x/0.014)**2)); return c-BCT; };
(async()=>{
  await preload(keys);
  const bu=ASSETS.manifest['prop.book_open']&&ASSETS.manifest['prop.book_open'].url; if(bu){ window.ASSET_DATA[bu]=fs.readFileSync(path.join(ROOT,bu)).toString('base64'); await ASSETS.loadOne('prop.book_open'); }
  const nv=ASSETS.manifest['prop.novel'].url; window.ASSET_DATA[nv]=fs.readFileSync(path.join(ROOT,nv)).toString('base64'); await ASSETS.loadOne('prop.novel');
  let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
  const cm=v=>(v*100).toFixed(1)+' cm', deg=r=>(r*180/Math.PI).toFixed(0)+'°';
  const tick=async(h,pose,n)=>{ for(let i=0;i<n;i++){ CHAR.animate(h,1/30,{pose,speed:pose==='walk'?1.4:0}); scene.updateMatrixWorld(true); if(i===1) await new Promise(r=>setTimeout(r,5)); } };
  for(const key of keys){
    const height=ASSETS.manifest[key].height||1.75;
    const h=CHAR.build({model:key,height,props:['novel']}); scene.add(h); const u=h.userData, vrm=u.vrm, glb=u.driver==='glb', R=glb?(n=>u.bones[GLBN[n]]||null):(n=>vrm.humanoid.getRawBoneNode(n));
    check(`${key} 人物用 ${u.driver} driver`,u.driver==='vrm'||(glb&&key==='char.rpm_sample'),u.driver);
    h.position.set(-3.2,0.05,1.4); h.rotation.y=2.3; h.updateMatrixWorld(true);   /* 不在原點、有轉向：確認是在人物座標裡算 */
    const Lc=n=>h.worldToLocal(R(n).getWorldPosition(new THREE.Vector3())), W=n=>R(n).getWorldPosition(new THREE.Vector3());
    await tick(h,'sit',10);
    const novel=u.props&&u.props.novel, novelSit=!!(novel&&novel.visible);
    const book0=u.readBook||h.getObjectByName('readBook');
    check(`② ${key} 坐著（sit，還沒讀過書）沒有書`,!book0||!book0.visible);
    await tick(h,'read',30);
    const book=u.readBook||h.getObjectByName('readBook');
    let bookGlb=false; if(book) book.traverse(o=>{ if(o.isMesh&&o.name&&/book_open/i.test(o.name+(o.parent&&o.parent.name))) bookGlb=true; });
    check(`① ${key} 讀書：手上有一本打開的書、看得到、是正式模型`,!!book&&book.visible&&!!(book.userData&&book.userData.ready)&&bookGlb,book?('visible '+book.visible+'、ready '+!!book.userData.ready+'、GLB '+bookGlb):'沒有書');
    // 量 1 秒（每一格）
    const F=[]; let prev=null, jump=0;
    for(let i=0;i<30;i++){ await tick(h,'read',1);
      const hand=[W('leftHand'),W('rightHand')]; if(prev) jump=Math.max(jump,hand[0].distanceTo(prev[0]),hand[1].distanceTo(prev[1])); prev=hand;
      if(!book) continue; book.updateMatrixWorld(true); const inv=book.matrixWorld.clone().invert(); const sc=new THREE.Vector3().setFromMatrixScale(book.matrixWorld);
      const BL=v=>v.clone().applyMatrix4(inv).multiply(sc);   /* 書的座標（公尺；書沒有縮放的話 sc＝1）*/
      const fing=['left','right'].flatMap(s=>['MiddleIntermediate','MiddleDistal','IndexIntermediate','IndexDistal','RingDistal','LittleDistal'].map(j=>R(s+j)).filter(Boolean).map(b=>BL(b.getWorldPosition(new THREE.Vector3()))));
      const q=book.getWorldQuaternion(new THREE.Quaternion()), nrm=new THREE.Vector3(0,0,1).applyQuaternion(q), ctr=book.getWorldPosition(new THREE.Vector3());
      const eyeL=R('leftEye'), eyeR=R('rightEye'); const eye=eyeL&&eyeR?W('leftEye').add(W('rightEye')).multiplyScalar(0.5):W('head');
      const corners=[[-0.153,-0.1065],[0.153,-0.1065],[-0.153,0.1065],[0.153,0.1065]].map(([x,y])=>h.worldToLocal(new THREE.Vector3(x,y,0).divide(sc).applyMatrix4(book.matrixWorld)));
      // 掌心方向（真實骨架：左手 +(f×a)、右手 −(f×a)；f＝手腕→中指根，a＝小指根→食指根）
      const palm=['left','right'].map((s,k)=>{ const p=W(s+'Hand'), f=W(s+'MiddleProximal').sub(p).normalize(), a=W(s+'IndexProximal').sub(W(s+'LittleProximal')); const n=new THREE.Vector3().crossVectors(f,a).normalize(); return k?n.negate():n; });
      F.push({wl:BL(hand[0]),wr:BL(hand[1]),fing,nrm,toEye:eye.clone().sub(ctr).normalize(),ctrL:h.worldToLocal(ctr.clone()),corners,elbow:[Lc('leftLowerArm'),Lc('rightLowerArm')],sh:[Lc('leftUpperArm'),Lc('rightUpperArm')],
        handL:[Lc('leftHand'),Lc('rightHand')],head:Lc('head'),hips:Lc('hips'),uleg:Math.max(Lc('leftUpperLeg').y,Lc('rightUpperLeg').y),knee:Math.max(Lc('leftLowerLeg').y,Lc('rightLowerLeg').y),chest:Lc('upperChest'),palmAng:palm.map(n=>n.angleTo(nrm))}); }
    if(book&&F.length){
      const all=(fn)=>F.every(fn), mx=a=>Math.max(...a), mn=a=>Math.min(...a);
      const xl=F.map(f=>f.wl.x), xr=F.map(f=>f.wr.x), ys=F.flatMap(f=>[f.wl.y,f.wr.y]), zs=F.flatMap(f=>[f.wl.z,f.wr.z]);
      check(`③ ${key} 兩手在書的左右兩側（左手 x −19～−8 cm、右手 8～19 cm）`,all(f=>f.wl.x>=-0.19&&f.wl.x<=-0.08&&f.wr.x>=0.08&&f.wr.x<=0.19),'左 '+cm(mn(xl))+'～'+cm(mx(xl))+'、右 '+cm(mn(xr))+'～'+cm(mx(xr)));
      check(`③ ${key} 手腕高度在頁面範圍內（|y| ≤ 11 cm）、在封底後面 0.5～5 cm`,ys.every(y=>Math.abs(y)<=0.11)&&zs.every(z=>z<=-0.005&&z>=-0.05),'y '+cm(mn(ys))+'～'+cm(mx(ys))+'、z '+cm(mn(zs))+'～'+cm(mx(zs)));
      const edge=F.flatMap(f=>[0.153+f.wl.x,0.153-f.wr.x]).map(Math.abs);
      check(`③ ${key} 手腕到最近的書外緣 ≤ 6 cm`,edge.every(d=>d<=0.06),'最遠 '+cm(mx(edge)));
      const mid=F.map(f=>Math.abs((f.wl.x+f.wr.x)/2));
      check(`④ ${key} 書在兩手中間（書的中心到兩手腕中點 ≤ 6 cm）`,mid.every(d=>d<=0.06),'最多 '+cm(mx(mid)));
      const lowC=F.map(f=>mn(f.corners.map(c=>c.y))-f.uleg), hiC=F.map(f=>f.chest.y-f.ctrL.y), fwd=F.map(f=>f.ctrL.z-f.hips.z);
      check(`④ ${key} 書在大腿上方到胸口下方（最低的角比大腿根高 ≥ 10 cm、中心比胸口低、在髖關節前面 ≥ 18 cm）`,lowC.every(v=>v>=0.10)&&hiC.every(v=>v>0)&&fwd.every(v=>v>=0.18),'最低角高出大腿根 '+cm(mn(lowC))+'、比胸口低 '+cm(mn(hiC))+'、往前 '+cm(mn(fwd)));
      const face=F.map(f=>f.nrm.angleTo(f.toEye));
      check(`⑤ ${key} 書面朝臉（法線和書→眼睛的夾角 ≤ 15°）、頭在書上面`,face.every(a=>a<=15*Math.PI/180)&&all(f=>f.head.y>f.ctrL.y+0.2),'最大 '+deg(mx(face)));
      const fp=F.flatMap(f=>f.fing.filter(p=>Math.abs(p.x)<0.153&&Math.abs(p.y)<0.1065)), lim=p=>backZ(Math.abs(p.x))-0.006, fz=fp.map(p=>p.z-lim(p));
      check(`⑥ ${key} 手指都在封底後面（關節是手指的中心線：比那裡的封底再後面 ≥ 0.6 cm）`,fp.length>0&&fz.every(d=>d<=0),fp.length?'離界線最近 '+cm(mx(fz))+'（'+fp.length+' 點在書的範圍內；最前 z '+cm(mx(fp.map(p=>p.z)))+'）':'沒有手指在書的範圍內');
      const wy=F.flatMap(f=>f.handL.map(p=>p.y-f.uleg));
      check(`⑥ ${key} 手腕比大腿根高 ≥ 8 cm（手不穿進大腿）`,wy.every(v=>v>=0.08),'最低 '+cm(mn(wy)));
      const ex=F.flatMap(f=>[f.elbow[0].x,-f.elbow[1].x]), ebel=all(f=>f.elbow[0].y<f.sh[0].y&&f.elbow[1].y<f.sh[1].y);
      check(`⑦ ${key} 手肘在身體外側（離中線 ≥ 13 cm）、在肩膀下面`,ex.every(x=>x>=0.13)&&ebel,'離中線 '+cm(mn(ex))+'～'+cm(mx(ex)));
      const pa=F.flatMap(f=>f.palmAng);
      check(`⑦ ${key} 掌心朝向書（和書的 +z 夾角 ≤ 30°）`,pa.every(a=>a<=30*Math.PI/180),'最大 '+deg(mx(pa)));
      check(`⑨ ${key} 平滑：每一格手腕最多移動 1 cm`,jump<=0.01,'最大 '+cm(jump));
    } else { for(const n of ['③','④','⑤','⑥','⑦']) check(`${n} ${key} （沒有書，量不到）`,false); }
    if(!glb) check(`⑧ ${key} 手上拿的東西（小說）讀書時收起來、坐著的時候照舊拿著`,!!novel&&novelSit&&!novel.visible,novel?('坐著 '+novelSit+'、讀書 '+novel.visible):'沒有小說');
    await tick(h,'sit',3); const v1=!!(book&&book.visible);
    await tick(h,'idle',3); const v2=!!(book&&book.visible);
    await tick(h,'walk',3); const v3=!!(book&&book.visible), nv3=!!(novel&&novel.visible);
    await tick(h,'read',3); const v4=!!(book&&book.visible);
    check(`② ${key} 其他姿勢看不到書（read→sit、idle、walk 藏起來，再 read 又出現）${glb?'':'、站起來小說照舊拿著'}`,!!book&&!v1&&!v2&&!v3&&v4&&(glb||nv3),'sit '+v1+'、idle '+v2+'、walk '+v3+'、read '+v4+'、走路拿小說 '+nv3);
    // ⑩ 前面有桌子（Café 的桌子、總圖的長桌：桌面比髖關節高 22 cm、桌子的邊在髖關節前面 20 cm）：書整本在桌面上方（最低的角比桌面高 ≥ 3 cm）、兩手腕也在桌面上方；沒有桌子的時候不抬
    if(book){ const hp=Lc('hips'), top=hp.y+0.22*u.k, tb=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.04,0.8),new THREE.MeshBasicMaterial());
      tb.position.copy(h.localToWorld(new THREE.Vector3(hp.x,top-0.02,hp.z+0.2*u.k+0.4))); tb.rotation.y=h.rotation.y; scene.add(tb); scene.updateMatrixWorld(true);
      h.position.x+=0.07; h.updateMatrixWorld(true); tb.position.x+=0.07;   /* 換位置＝重新找桌子 */
      await tick(h,'read',20); book.updateMatrixWorld(true); const sc=new THREE.Vector3().setFromMatrixScale(book.matrixWorld);
      const low=Math.min(...[[-0.153,-0.1065],[0.153,-0.1065],[-0.153,0.1065],[0.153,0.1065]].flatMap(([x,y])=>[0.003,-0.004].map(z=>h.worldToLocal(new THREE.Vector3(x,y,z).divide(sc).applyMatrix4(book.matrixWorld)).y)));
      const wr=Math.min(Lc('leftHand').y,Lc('rightHand').y);
      check(`⑩ ${key} 前面有桌子：書整本在桌面上方（最低的角比桌面高 ≥ 3 cm）、兩手腕也比桌面高 ≥ 3 cm`,book.visible&&low>=top+0.03&&wr>=top+0.03,'最低的角 '+cm(low-top)+'、手腕 '+cm(wr-top)+'（比桌面高）');
      scene.remove(tb); h.position.x-=0.07; h.updateMatrixWorld(true); await tick(h,'read',20);
      check(`⑩ ${key} 拿走桌子（換位置）：書回到腿上方（不再抬高）`,!(u.readLift>0.001),'抬高 '+cm(u.readLift||0)); }
    scene.remove(h); CHAR.release(h);
  }
  console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
})();

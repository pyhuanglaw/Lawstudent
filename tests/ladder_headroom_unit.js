// 宿舍上舖的梯子、上床、起床：頭不撞天花板（DORM-LADDER-STOOP-1103）——不需要瀏覽器。
// 使用者 11-03：「宿舍天花板太低了 走上去都撞到頭 不合理」「至少微微彎腰不要整個頭卡進去天花板」。
// 在 Node 裡載入遊戲真正的祐廷（VRM，不算圖）＋ story3d.js 真正的上床（goToBedFull）、起床（getUp）流程（GM 是假的：GM.sleep 照毫秒數一格一格 1/30 秒跑 CHAR.animate），
// 每一格量「頭頂」＝整個模型（含頭髮、彈簧骨甩動以後）最高的頂點（Box3.setFromObject(vrm.scene, precise)），和 sleep_scene 的天花板限制比：
//   兩種版面：A＝現在的版面（沒有 head_max：房間高 3.0 m → 限制 2.92 m）；B＝LAWWW2 要交的版面（ceil_y 3.4、head_max 3.32、bed_entry_pose 'kneel'）。
//   ① 爬上去（梯子每一階、最上面一階轉身、跪上床）每一格頭頂 ≤ 限制（舊版：最上面一階站直 3.35 m、上床點站直 3.6 m）
//   ② 起床（跪在床上 → 最上面一階 → 一階一階下來）每一格頭頂 ≤ 限制
//   ③ 上床點（bed_entry）跪著：臀部離床墊 ≤ 0.70 m（站著約 0.98 m）、兩個膝蓋離床墊 ≤ 0.12 m；起床的第一個看得到的畫面也是跪著
//   ④ 平滑：人物座標裡的關節沒有跳格——相鄰兩格移動量的差（二階差分）身體 ≤ 5 cm、手腳 ≤ 8 cm，每一格 ≤ 12 cm（30 fps；走路片段的腳本來就一格約 8 cm；黑幕裡換位置的那一格不算）——彎腰、蹲低、跪下、站起來都不跳
//   ⑤ 腳踩在踏點上：梯子上每一格最低的腳（腳踝、腳尖）不低於踏點 3 cm 以上（蹲低時腳照樣踩在那一階）
//   ⑥ 站回梯子前以後拿掉限制（userData.headMax 沒了）、姿勢 idle；站直時頭頂回到身高
// 修改前（e3d773589 那一版的 character3d.js、story3d.js）：① ② ③ 失敗。用法：node tests/ladder_headroom_unit.js
const path=require('path'), fs=require('fs'), vm=require('vm');
const {ROOT,preload}=require('../tools/dev_scratch/spring_sim/harness.js');
global.location={search:''}; document.addEventListener=()=>{}; document.body=document.body||{appendChild(){}};
global.SOCIAL={displayName:id=>id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true,remember(){},meet(){}};
global.EVENTS={npcOf:()=>null,onEnter(){},tick(){}};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/data/dorm_room_layout.js','src/story3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS|DORM_ROOM)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v*100).toFixed(1)+' cm';
const KEY='char.yuting', scene=new THREE.Scene();
const JOINTS=['hips','spine','chest','neck','head','leftUpperLeg','rightUpperLeg','leftLowerLeg','rightLowerLeg','leftFoot','rightFoot','leftUpperArm','rightUpperArm','leftLowerArm','rightLowerArm','leftHand','rightHand'];
(async()=>{
  await preload([KEY]);
  const U=DORM_ROOM.units.find(u=>u.id===(DORM_ROOM.player_unit||'L2')), SC0=U.sleep_scene;
  const roomH=DORM_ROOM.room.h;
  const layouts=[{name:'A 現在的版面（房間 '+roomH+' m、沒有 head_max）',sc:JSON.parse(JSON.stringify(SC0)),lim:(SC0.head_max!=null?SC0.head_max:(SC0.ceil_y!=null?SC0.ceil_y:roomH)-0.08)},
    {name:'B LAWWW2 的版面（ceil_y 3.4、head_max 3.32、bed_entry_pose kneel）',sc:Object.assign(JSON.parse(JSON.stringify(SC0)),{ceil_y:3.4,head_max:3.32,bed_entry_pose:'kneel'}),lim:3.32}];
  const H=ASSETS.manifest[KEY].height||1.75;
  const h=CHAR.build({model:KEY,height:H}); scene.add(h); const vrm=h.userData.vrm, R=n=>vrm.humanoid.getRawBoneNode(n); if(process.env.NOSPRING) vrm.springBoneManager=null;
  const box=new THREE.Box3(), tmp=new THREE.Vector3();
  const topV=()=>{ box.setFromObject(vrm.scene,true); if(process.env.DBG_TOP){ let bo=null,bv=-9; vrm.scene.traverse(o=>{ if(!o.isMesh) return; const b=new THREE.Box3().setFromObject(o,true); if(b.max.y>bv){ bv=b.max.y; bo=o.name+'<'+(o.parent&&o.parent.name); } }); topV.who=bo; } return box.max.y; };
  /* 站直的頭頂（平地、idle）：確認量法 */
  h.position.set(0,0,0); for(let i=0;i<40;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0}); scene.updateMatrixWorld(true); const stand=topV(), hips0=R('hips').getWorldPosition(tmp).y;
  console.log(`[${KEY}] 站直頭頂 ${cm(stand)}（含頭髮）、臀部 ${cm(hips0)}`);
  for(const LY of layouts){ const sc=LY.sc, lim=LY.lim, be=sc.bed_entry, mat=sc.lie.mattress_top_y, st=sc.steps;
    console.log('— '+LY.name+'：頭頂限制 '+lim.toFixed(2)+' m（最上面一階 '+st[st.length-1][1]+' m、上床點 '+be[1]+' m）');
    /* 假的 GM：GM.sleep(ms)＝跑 ms 毫秒的動畫（1/30 秒一格）；每一格記錄 */
    const P={obj:h,pose:'idle',idlePose:'idle',busy:false,lv:0}; const frames=[]; let black=false, jumped=false;
    const step=n=>{ for(let i=0;i<n;i++){ CHAR.animate(h,1/30,{pose:P.pose,speed:0}); scene.updateMatrixWorld(true); const u=h.userData;
        const J={}; for(const j of JOINTS){ const b=R(j); if(b) J[j]=h.worldToLocal(b.getWorldPosition(new THREE.Vector3())); }
        const W=n=>R(n).getWorldPosition(new THREE.Vector3());
        frames.push({who:topV.who,pose:P.pose,black,jump:jumped,x:h.position.x,y:h.position.y,z:h.position.z,top:topV(),topC:CHAR.headTop?CHAR.headTop(h):null,J,hipsW:W('hips').y,kneeW:[W('leftLowerLeg').y,W('rightLowerLeg').y],footW:Math.min(W('leftFoot').y,W('rightFoot').y,...['leftToes','rightToes'].filter(n=>R(n)).map(n=>W(n).y)),kneelW:u.kneelW||0,fitE:u.fitE,fitR:u.fitR,headMax:u.headMax}); jumped=false; } };
    const E={zone:{id:'dorm'},player:P,npcs:[],toneK:1,hour:22,cam:{mode:'follow'},q:{level:'high'},applyTime(){},endCinematic(){ this.cam.mode='follow'; },placeAt(ent,x,z){ ent.obj.position.set(x,0,z); },prePose(){}};
    const GM={G:{day:6,hour:22,flags:{},zone:'dorm'},E,turbo:false,depth:0,
      sleep:async ms=>{ step(Math.max(1,Math.round(ms/1000*30))); },
      fade:async on=>{ if(on){ step(14); black=true; } else { black=false; step(15); } },
      walkTo:async(ent,x,z)=>{ ent.obj.position.set(x,0,z); jumped=true; P.pose='idle'; step(20); return true; },
      cine(){ E.cam.mode='cinematic'; },sceneBegin(){ this.depth++; P.busy=true; },sceneEnd(){ this.depth=Math.max(0,this.depth-1); if(!this.depth){ P.busy=false; E.endCinematic(); } },standUp(ent){ ent.pose='idle'; ent.seat=null; }};
    /* 上床（完整演出：goToBedFull）*/
    STORY.SLEEP_FULL=true; h.position.set(0,0,2); h.rotation.y=0; P.pose='idle'; step(10); frames.length=0;
    await STORY._bedFx.goToBed(GM,sc); const up=frames.slice(); const upMax=Math.max(...up.map(f=>f.top)), upW=up.reduce((a,f)=>f.top>a.top?f:a,up[0]);
    check(`① ${LY.name.slice(0,1)} 爬上去、跪上床：每一格頭頂 ≤ ${lim.toFixed(2)} m`,upMax<=lim,`最高 ${cm(upMax)}（${upW.pose}、腳 ${cm(upW.y)}；頭骨估計 ${upW.topC!=null?cm(upW.topC):"—"}${upW.who?'、'+upW.who:''}）、${up.length} 格${process.env.DBG_TOP?' fitE '+upW.fitE+' fitR '+upW.fitR:''}`);
    const kn=up.filter(f=>f.pose==='kneel'&&Math.abs(f.y-be[1])<1e-6&&Math.abs(f.x-be[0])<1e-6&&f.kneelW>=0.999), kl=kn[kn.length-1];
    check(`③ ${LY.name.slice(0,1)} 上床點跪著：臀部離床墊 ≤ 70 cm（站著 ${cm(hips0)}）、兩膝離床墊 ≤ 12 cm`,!!kl&&kl.hipsW-mat<=0.70&&kl.kneeW.every(y=>y-mat<=0.12&&y-mat>=0.0),kl?`臀部 ${cm(kl.hipsW-mat)}、膝 ${kl.kneeW.map(y=>cm(y-mat)).join('／')}（${kn.length} 格）`:'沒有跪在上床點的格子');
    /* 躺下（S.lieDown）→ 起床（getUp）*/
    STORY.lieDown(GM,sc); jumped=true; step(10); frames.length=0;
    await STORY._bedFx.getUp(GM,sc); const dn=frames.slice(); const dnV=dn.filter(f=>f.pose!=='lie'); const dnMax=Math.max(...dnV.map(f=>f.top)), dnW=dnV.reduce((a,f)=>f.top>a.top?f:a,dnV[0]);
    check(`② ${LY.name.slice(0,1)} 起床：跪在床上 → 最上面一階 → 下梯子，每一格頭頂 ≤ ${lim.toFixed(2)} m`,dnMax<=lim,`最高 ${cm(dnMax)}（${dnW.pose}、腳 ${cm(dnW.y)}）、${dnV.length} 格${process.env.DBG_TOP?' fitE '+dnW.fitE+' fitR '+dnW.fitR:''}`);
    const firstSeen=dn.find(f=>!f.black&&f.pose!=='lie');
    check(`③ ${LY.name.slice(0,1)} 起床第一個看得到的畫面：跪在上床點（臀部離床墊 ≤ 70 cm）`,!!firstSeen&&firstSeen.pose==='kneel'&&Math.abs(firstSeen.y-be[1])<1e-6&&firstSeen.hipsW-mat<=0.70,firstSeen&&`${firstSeen.pose}、臀部 ${cm(firstSeen.hipsW-mat)}`);
    /* ④ 平滑（人物座標的關節；黑幕、瞬移、躺著的格子不算）：跳格＝某一格的速度突然變了——相鄰兩格移動量的差（二階差分）：身體（臀部到頭）≤ 5 cm、手腳 ≤ 8 cm
       （走路片段換成站著的片段、爬梯子的手碰到床欄頂的上限，本來就有 7 cm 左右；修好以前跪的權重歸零那一格手肘翻回去 10～11.5 cm）；每一格移動 ≤ 12 cm（走路片段的腳本來就一格 8 cm）*/
    const CORE=new Set(['hips','spine','chest','neck','head']); let acc=0, af=null, accL=0, afL=null, vel=0, vf=null; for(const F of [up,dn]) for(let i=1;i<F.length;i++){ const a=F[i-1], b=F[i], c=F[i+1]; const ok=f=>f&&!f.black&&!f.jump&&f.pose!=='lie'; if(!ok(a)||!ok(b)) continue;
      for(const j in b.J){ const d=b.J[j].distanceTo(a.J[j]); if(d>vel){ vel=d; vf=`${j}（${a.pose}→${b.pose}、腳 ${cm(b.y)}）`; }
        if(ok(c)&&c.J[j]){ const d2=c.J[j].clone().sub(b.J[j]).sub(b.J[j].clone().sub(a.J[j])).length(); if(process.env.DBG_JMP&&d2>0.03) console.log('  acc',F===up?'up':'dn',i,j,cm(d2),a.pose+'→'+b.pose+'→'+c.pose,'y',b.y.toFixed(3),'kw',b.kneelW.toFixed(2),'fitE',b.fitE!=null?b.fitE.toFixed(3):'-'); const tag=`${j}（${a.pose}→${b.pose}→${c.pose}、腳 ${cm(b.y)}）`; if(CORE.has(j)){ if(d2>acc){ acc=d2; af=tag; } } else if(d2>accL){ accL=d2; afL=tag; } } } }
    check(`④ ${LY.name.slice(0,1)} 平滑：沒有跳格（相鄰兩格移動量的差：身體 ≤ 5 cm、手腳 ≤ 8 cm；每一格 ≤ 12 cm）`,acc<=0.05&&accL<=0.08&&vel<=0.12,`身體 ${cm(acc)} ${af||''}；手腳 ${cm(accL)} ${afL||''}；每格最大 ${cm(vel)} ${vf||''}`);
    /* ⑤ 腳踩在踏點上 */
    const onSteps=up.concat(dn).filter(f=>!f.black&&(f.pose==='climb'||f.pose==='climbdown')&&st.some(s=>Math.abs(f.y-s[1])<1e-6&&Math.abs(f.x-s[0])<1e-6));
    const sink=Math.max(...onSteps.map(f=>f.y-f.footW)); if(process.env.DBG_SINK) onSteps.filter(f=>f.y-f.footW>0.015).forEach(f=>console.log('  sink',f.pose,f.y.toFixed(2),cm(f.y-f.footW),'kw',f.kneelW.toFixed(2),'fitE',f.fitE!=null?f.fitE.toFixed(3):'-'));
    check(`⑤ ${LY.name.slice(0,1)} 腳踩在踏點上：最低的腳不低於踏點 3 cm 以上`,onSteps.length>=4&&sink<=0.03,`最多低 ${cm(sink)}（${onSteps.length} 格）`);
    /* ⑥ 站回梯子前 */
    step(20); const after=topV();
    check(`⑥ ${LY.name.slice(0,1)} 站回梯子前：拿掉限制、姿勢 idle、頭頂回到站直的高度`,h.userData.headMax==null&&P.pose==='idle'&&Math.abs(h.position.y)<1e-6&&Math.abs(after-stand)<0.03,`headMax ${h.userData.headMax}、${P.pose}、頭頂 ${cm(after)}`);
    STORY.SLEEP_FULL=false;
  }
  console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });

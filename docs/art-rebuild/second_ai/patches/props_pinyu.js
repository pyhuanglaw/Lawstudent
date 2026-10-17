/* 曾品妤的工程計算機、黑色保溫瓶（LAWWW2-C 2026-10-17；BB_131 標準圖「手上常拿工程計算機、黑色保溫瓶」）——給 LAWWW-C 整合用的片段，LAWWW2 沒有改 src/。
   模型：assets/models/char/second_ai/calc_engineering.glb、thermos_black.glb（tools/blender/char_second/prop_pinyu.py；計算機原點在中心、螢幕朝 +y；保溫瓶原點在瓶身中間、瓶蓋朝 +y）。
   掛法：計算機貼著左手掌、保溫瓶右手直握（瓶蓋朝上）。兩個都掛在**前臂**（leftLowerArm／rightLowerArm），不是手：
   掛在手上時走路動畫手腕一轉，東西就跟著轉成水平（家豪筆記本 BB-C 18819b79 退件的原因）。位置在 GLB 載入時算：前臂底下找手的骨頭，
   從手腕往指尖 PALM 公尺、往掌心那一側（T 字姿勢掌心朝下＝−y）SIDE 公尺。兩個可以同時拿，也可以只拿一個（事件裡換）。
   用法：放在 src/props3d.js 載入之後執行，或照這個寫法搬進 props3d 的 DEF。人物：CHARACTERS.econ_pinyu.char3d.props 加 'calc'、'thermos'。 */
(function(){
  if(typeof PROPS==='undefined'||!PROPS.DEF) return;
  const add=(key,url,src)=>{ if(typeof ASSETS!=='undefined'&&!ASSETS.manifest[key]) ASSETS.manifest[key]={url, type:'building', lazy:true, source:src, license:'本作'}; };
  add('prop.calc_engineering','assets/models/char/second_ai/calc_engineering.glb','本作 Blender 腳本 tools/blender/char_second/prop_pinyu.py（LAWWW2-C：品妤的工程計算機——深灰機身、液晶、按鍵；沒有牌子、型號）');
  add('prop.thermos_black','assets/models/char/second_ai/thermos_black.glb','本作 Blender 腳本 tools/blender/char_second/prop_pinyu.py（LAWWW2-C：品妤的黑色保溫瓶——霧黑瓶身、瓶蓋、提環；沒有牌子）');
  function glbProp(key,name,PALM,SIDE,rot,tilt){ return function(o){ const g=new THREE.Group(); g.name=name;
    if(typeof ASSETS!=='undefined') ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene) return; const n=c.scene.clone(true);
      const arm=g.parent, hand=arm&&arm.children.find(b=>/Hand$/i.test(b.name));   // 前臂骨頭底下的手
      if(hand){ const d=hand.position.clone().normalize(); g.position.copy(hand.position).addScaledVector(d,PALM); g.position.y+=SIDE; if(rot) n.rotation.set(rot[0],rot[1],rot[2]*Math.sign(d.x||1)); if(tilt) g.rotation.set(tilt[0],tilt[1]*Math.sign(d.x||1),tilt[2]); }   // tilt：繞手掌轉（往前斜）
      n.traverse(m=>{ if(!m.isMesh) return; const s=m.material; m.material=new THREE.MeshToonMaterial({color:s.color.clone(), vertexColors:!!s.vertexColors}); m.castShadow=true; m.frustumCulled=false; });   // 和人物一樣的卡通明暗
      g.add(n); }).catch(e=>console.warn(name+' glb',e));
    return g; }; }
  // 計算機：長邊（模型的 z）沿著前臂（轉 90°）、螢幕朝外；保溫瓶：瓶身（模型的 y）沿著前臂、瓶蓋朝手肘（往上）
  PROPS.DEF.calc={bone:'leftLowerArm', make:glbProp('prop.calc_engineering','calc_engineering',0.055,-0.024,[0,Math.PI/2,0])};
  // 保溫瓶：提環勾在手指上（待機時手指往掌心彎，沿前臂方向離手腕約 8 cm），瓶身中心再往下 13 cm（提環頂到瓶身中心）；瓶蓋朝上
  PROPS.DEF.thermos={bone:'rightLowerArm', make:glbProp('prop.thermos_black','thermos_black',0.21,-0.022,[0,0,Math.PI/2])};
})();

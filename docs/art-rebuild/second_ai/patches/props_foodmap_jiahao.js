/* 宋家豪的「公館美食地圖」筆記本（LAWWW2-C 2026-10-17；BB_109：寫滿公館小吃的筆記本是識別物、BB_201：「有的話拿在手上」）——給 LAWWW-C 整合用的片段，LAWWW2 沒有改 src/。
   模型：assets/models/char/second_ai/notebook_foodmap.glb（tools/blender/char_second/prop_foodmap_notebook.py；原點在筆記本中心、封面朝 +y、書背 −x、書口 +x）。
   掛法（BB-C 18819b79 退件後改）：掛在**左前臂**（leftLowerArm），不是手——掛在手上時，走路動畫手腕一轉、掌心朝上，本子就跟著變成水平、像托盤子；
   掛在前臂上，本子一直是直的、跟前臂擺。位置在 GLB 載入時算：前臂骨頭底下找手的骨頭（J_Bip_L_Hand），從手腕沿前臂方向再往前 PALM 公尺（手掌中間）、往掌心那一側 SIDE 公尺。
   用法（任選一種）：① 放在 src/props3d.js 載入之後執行這一段；② 照這個寫法搬進 props3d 的 DEF（材質改用裡面的 mat()）。
   人物：CHARACTERS.econ_jiahao.char3d.props 加 'foodmap'。 */
(function(){
  if(typeof PROPS==='undefined'||!PROPS.DEF) return;
  if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['prop.notebook_foodmap'])
    ASSETS.manifest['prop.notebook_foodmap']={url:'assets/models/char/second_ai/notebook_foodmap.glb', type:'building', lazy:true,
      source:'本作 Blender 腳本 tools/blender/char_second/prop_foodmap_notebook.py（LAWWW2-C：宋家豪的「公館美食地圖」筆記本——牛皮紙封面、手畫地圖、紙膠帶標籤、索引貼、鬆緊帶；圖是 PIL 畫的，沒有店名、商標）', license:'本作'};
  const PALM=0.055, SIDE=-0.027;   // 手腕往指尖方向 5.5 cm、往掌心那一側（T 字姿勢掌心朝下＝−y）2.7 cm
  function notebook(o){ const g=new THREE.Group(); g.name='notebook_foodmap';
    if(typeof ASSETS!=='undefined') ASSETS.loadOne('prop.notebook_foodmap').then(c=>{ if(!c||!c.scene) return; const n=c.scene.clone(true);
      const arm=g.parent, hand=arm&&arm.children.find(b=>/Hand$/i.test(b.name));   // 前臂骨頭底下的手（attach 已經把 g 掛到前臂）
      if(hand){ const d=hand.position.clone(), L=d.length(); d.normalize(); g.position.copy(hand.position).addScaledVector(d,PALM); g.position.y+=SIDE; }
      n.traverse(m=>{ if(!m.isMesh) return; const s=m.material; m.material=new THREE.MeshToonMaterial({color:s.color.clone(), map:s.map||null, vertexColors:!!s.vertexColors, side:s.side}); m.castShadow=true; m.frustumCulled=false; });   // 和人物一樣的卡通明暗（遊戲沒有環境貼圖）
      g.add(n); }).catch(e=>console.warn('notebook glb',e));
    return g; }
  PROPS.DEF.foodmap={bone:'leftLowerArm', make:notebook};   // 位置在 make 裡、載入時算（見上面）
})();

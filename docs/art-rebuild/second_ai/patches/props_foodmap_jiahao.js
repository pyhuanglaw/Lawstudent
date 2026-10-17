/* 宋家豪的「公館美食地圖」筆記本（LAWWW2-C 2026-10-17；BB_109：寫滿公館小吃的筆記本是識別物、BB_201：「有的話拿在手上」）——給 LAWWW-C 整合用的片段，LAWWW2 沒有改 src/。
   模型：assets/models/char/second_ai/notebook_foodmap.glb（tools/blender/char_second/prop_foodmap_notebook.py；原點在筆記本中心、封面朝 +y、書背 −x、書口 +x）。
   掛法照 props3d 的資料夾（folder）：左手平拿（notebook_foodmap.json 的 hold）。
   用法（任選一種）：① 放在 src/props3d.js 載入之後執行這一段；② 照這個寫法搬進 props3d 的 DEF（材質改用裡面的 mat()）。
   人物：CHARACTERS.econ_jiahao.char3d.props 加 'foodmap'。 */
(function(){
  if(typeof PROPS==='undefined'||!PROPS.DEF) return;
  if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['prop.notebook_foodmap'])
    ASSETS.manifest['prop.notebook_foodmap']={url:'assets/models/char/second_ai/notebook_foodmap.glb', type:'building', lazy:true,
      source:'本作 Blender 腳本 tools/blender/char_second/prop_foodmap_notebook.py（LAWWW2-C：宋家豪的「公館美食地圖」筆記本——牛皮紙封面、手畫地圖、紙膠帶標籤、索引貼、鬆緊帶；圖是 PIL 畫的，沒有店名、商標）', license:'本作'};
  function notebook(o){ const g=new THREE.Group(); g.name='notebook_foodmap';
    if(typeof ASSETS!=='undefined') ASSETS.loadOne('prop.notebook_foodmap').then(c=>{ if(!c||!c.scene) return; const n=c.scene.clone(true);
      n.traverse(m=>{ if(!m.isMesh) return; const s=m.material; m.material=new THREE.MeshToonMaterial({color:s.color.clone(), map:s.map||null, vertexColors:!!s.vertexColors, side:s.side}); m.castShadow=true; m.frustumCulled=false; });   // 和人物一樣的卡通明暗（遊戲沒有環境貼圖）
      g.add(n); }).catch(e=>console.warn('notebook glb',e));
    return g; }
  PROPS.DEF.foodmap={bone:'leftHand', make:notebook, pos:[-0.07,-0.02,0.0], rot:[0,0,0]};
})();

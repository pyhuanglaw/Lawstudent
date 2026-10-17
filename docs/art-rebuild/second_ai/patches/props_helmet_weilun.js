/* 邱韋綸的腳踏車安全帽（LAWWW2-C 2026-10-17；BB_201 第 1 節「掛在後背包側邊就好」）——給 LAWWW-C 整合用的片段，LAWWW2 沒有改 src/。
   模型：assets/models/char/second_ai/helmet_bike.glb（tools/blender/char_second/helmet_bike.py；原點在下緣的中心、前方 −z、上方 +y）。
   用法（任選一種）：
   ① 放在 src/props3d.js 載入之後執行這一段（在 PROPS 外面加一個配件，不改 props3d 本身）；
   ② 或照這個寫法搬進 props3d 的 DEF（材質改用裡面的 mat()，和其他配件一樣的卡通明暗）。
   人物：CHARACTERS.econ_weilun.char3d.props 加 'helmet'（和 'backpack' 一起）；掛法 o.hang＝'side'（後背包右側，預設）或 'back'（背包外面，不會碰到手）。 */
(function(){
  if(typeof PROPS==='undefined'||!PROPS.DEF) return;
  if(typeof ASSETS!=='undefined'&&!ASSETS.manifest['prop.helmet_bike'])
    ASSETS.manifest['prop.helmet_bike']={url:'assets/models/char/second_ai/helmet_bike.glb', type:'building', lazy:true,
      source:'本作 Blender 腳本 tools/blender/char_second/helmet_bike.py（LAWWW2-C：邱韋綸的公路車安全帽——黑色外殼、銀色側條、長條通風孔、深灰內襯、下巴帶）', license:'本作'};
  const HANG={side:{pos:[0.178,-0.09,0.15],rot:[0,0,-Math.PI/2]}, back:{pos:[0,-0.10,0.29],rot:[Math.PI/2,0,0]}};
  function helmet(o){ o=o||{}; const g=new THREE.Group(); g.name='helmet_bike';
    if(typeof ASSETS!=='undefined') ASSETS.loadOne('prop.helmet_bike').then(c=>{ if(!c||!c.scene) return; const h=c.scene.clone(true);
      h.traverse(m=>{ if(!m.isMesh) return; const src=m.material; m.material=new THREE.MeshToonMaterial({color:src.color.clone()}); m.castShadow=true; m.frustumCulled=false; });   // 遊戲沒有環境貼圖：PBR 會變暗，改成和人物一樣的卡通明暗
      g.add(h); }).catch(e=>console.warn('helmet glb',e));
    return g; }
  // 掛法用 pos／rot（attach 照 DEF 的 pos、rot 放）；要改掛法就在人物的 props 寫 {name:'helmet', hang:'back'}，這裡依 hang 換掉 make 回傳物件的位置
  PROPS.DEF.helmet={bone:'upperChest', make:function(o){ const g=helmet(o); const h=HANG[(o&&o.hang)||'side']||HANG.side; const w=new THREE.Group(); g.position.set(h.pos[0],h.pos[1],h.pos[2]); g.rotation.set(h.rot[0],h.rot[1],h.rot[2]); w.add(g); return w; }, pos:[0,0,0]};
})();

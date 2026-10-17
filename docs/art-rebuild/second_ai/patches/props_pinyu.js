/* 曾品妤的工程計算機、黑色保溫瓶（LAWWW2-C 2026-10-17；BB_131 標準圖「手上常拿工程計算機、黑色保溫瓶」）——給 LAWWW-C 整合用的片段，LAWWW2 沒有改 src/。
   模型：assets/models/char/second_ai/calc_engineering.glb、thermos_black.glb（tools/blender/char_second/prop_pinyu.py；計算機原點在中心、螢幕朝 +y；保溫瓶原點在瓶身中間、瓶蓋朝 +y）。
   掛法：計算機照資料夾（folder）左手平拿；保溫瓶右手直握。兩個可以同時拿，也可以只拿一個（事件裡換）。
   用法：放在 src/props3d.js 載入之後執行，或照這個寫法搬進 props3d 的 DEF。人物：CHARACTERS.econ_pinyu.char3d.props 加 'calc'、'thermos'。 */
(function(){
  if(typeof PROPS==='undefined'||!PROPS.DEF) return;
  const add=(key,url,src)=>{ if(typeof ASSETS!=='undefined'&&!ASSETS.manifest[key]) ASSETS.manifest[key]={url, type:'building', lazy:true, source:src, license:'本作'}; };
  add('prop.calc_engineering','assets/models/char/second_ai/calc_engineering.glb','本作 Blender 腳本 tools/blender/char_second/prop_pinyu.py（LAWWW2-C：品妤的工程計算機——深灰機身、液晶、按鍵；沒有牌子、型號）');
  add('prop.thermos_black','assets/models/char/second_ai/thermos_black.glb','本作 Blender 腳本 tools/blender/char_second/prop_pinyu.py（LAWWW2-C：品妤的黑色保溫瓶——霧黑瓶身、瓶蓋、提環；沒有牌子）');
  function glbProp(key,name){ return function(o){ const g=new THREE.Group(); g.name=name;
    if(typeof ASSETS!=='undefined') ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene) return; const n=c.scene.clone(true);
      n.traverse(m=>{ if(!m.isMesh) return; const s=m.material; m.material=new THREE.MeshToonMaterial({color:s.color.clone(), vertexColors:!!s.vertexColors}); m.castShadow=true; m.frustumCulled=false; });   // 和人物一樣的卡通明暗
      g.add(n); }).catch(e=>console.warn(name+' glb',e));
    return g; }; }
  PROPS.DEF.calc={bone:'leftHand', make:glbProp('prop.calc_engineering','calc_engineering'), pos:[-0.07,-0.02,0.0], rot:[0,0,0]};
  PROPS.DEF.thermos={bone:'rightHand', make:glbProp('prop.thermos_black','thermos_black'), pos:[0.06,-0.03,0.0], rot:[0,0,Math.PI/2]};
})();

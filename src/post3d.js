/* 後製（POST）：HDR 畫面 → 光暈（bloom）→ 色調映射（和遊戲原本一樣的 ACES）→ 調色（依時段）→ 暗角 → 螢幕。
   LAWWW2-B 2026-10-16（使用者：美術要像得獎、Steam 上會賣的遊戲；方向由 LAWWW2-B 決定＝繪本感半寫實環境＋日系動畫人物）。
   原本畫面直接用 renderer 的 ACES 輸出到螢幕：沒有光暈（路燈、窗戶、夕陽不會發亮）、沒有調色（黃昏和白天只差光線顏色）、沒有暗角——
   商業遊戲幾乎都有這一層，它決定「整個畫面的色調」。這裡用三個全螢幕 pass 做，不改任何材質、不改遊戲邏輯：
   ①場景畫到半浮點的 render target（線性 HDR；three.js 畫到 render target 時不做色調映射）
   ②亮部抽出來縮到 1/4、1/8 解析度模糊（手機負擔小）
   ③合成：場景＋光暈 → ACES（公式和 three.js 的 ACESFilmicToneMapping 相同，曝光照用 renderer.toneMappingExposure）→ sRGB → 調色 → 暗角。
   自己掛上去（包住 renderer.render，只處理「主場景畫到螢幕」那一次）；網址加 ?nopost 關掉、POST.enabled=false 也可以。
   調色參數依時段內插（白天、黃昏、夜晚、室內），POST.override 可以在測試時覆蓋。 */
(function(){
  'use strict';
  const POST={enabled:!/[?&]nopost\b/.test(location.search), override:null, installed:false, stats:{frames:0}};
  window.POST=POST;
  // 調色預設（sRGB 空間）：sat 飽和度、con 對比、lift 暗部加色、gain 亮部乘色、vig 暗角、bk 光暈強度、bt 光暈門檻（線性亮度）、warm 中間調偏暖
  const PRESETS={
    day:   {sat:1.08, con:1.05, lift:[0.000,0.004,0.014], gain:[1.015,1.000,0.975], vig:0.22, bk:0.10, bt:1.15},
    dusk:  {sat:1.14, con:1.07, lift:[0.012,0.004,0.030], gain:[1.060,0.985,0.890], vig:0.32, bk:0.24, bt:0.85},
    night: {sat:1.04, con:1.08, lift:[0.004,0.010,0.040], gain:[1.000,0.990,1.040], vig:0.36, bk:0.40, bt:0.55},
    indoor:{sat:1.06, con:1.04, lift:[0.006,0.004,0.010], gain:[1.030,1.000,0.960], vig:0.24, bk:0.14, bt:0.95}};
  function lerpP(a,b,t){ const o={}; for(const k in a) o[k]=Array.isArray(a[k])?a[k].map((v,i)=>v+(b[k][i]-v)*t):a[k]+(b[k]-a[k])*t; return o; }
  function presetFor(E){
    if(POST.override) return POST.override;
    if(E.indoor) return PRESETS.indoor;
    const h=((E.hour||12)%24+24)%24;
    if(h>=6.5&&h<16) return PRESETS.day;
    if(h>=16&&h<17) return lerpP(PRESETS.day,PRESETS.dusk,h-16);
    if(h>=17&&h<18.3) return PRESETS.dusk;
    if(h>=18.3&&h<19.4) return lerpP(PRESETS.dusk,PRESETS.night,(h-18.3)/1.1);
    if(h>=5.4&&h<6.5) return lerpP(PRESETS.night,PRESETS.day,(h-5.4)/1.1);
    return PRESETS.night; }
  POST.PRESETS=PRESETS;

  const VS='varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }';
  const FS_BRIGHT=`uniform sampler2D tSrc; uniform float uThr; uniform float uExp; varying vec2 vUv;
    void main(){ vec3 c=texture2D(tSrc,vUv).rgb*uExp; float l=max(c.r,max(c.g,c.b)); float k=max(0.0,l-uThr)/max(l,1e-4); gl_FragColor=vec4(min(c*k,vec3(8.0)),1.0); }`;
  const FS_BLUR=`uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
    void main(){ vec3 s=texture2D(tSrc,vUv).rgb*0.2270270; s+=texture2D(tSrc,vUv+uDir*1.3846154).rgb*0.3162162; s+=texture2D(tSrc,vUv-uDir*1.3846154).rgb*0.3162162;
      s+=texture2D(tSrc,vUv+uDir*3.2307692).rgb*0.0702703; s+=texture2D(tSrc,vUv-uDir*3.2307692).rgb*0.0702703; gl_FragColor=vec4(s,1.0); }`;
  const FS_COMP=`uniform sampler2D tScene; uniform sampler2D tB1; uniform sampler2D tB2; uniform float uExp; uniform float uBk;
    uniform float uSat; uniform float uCon; uniform vec3 uLift; uniform vec3 uGain; uniform float uVig; uniform vec2 uAspect; varying vec2 vUv;
    vec3 RRTAndODTFit(vec3 v){ vec3 a=v*(v+0.0245786)-0.000090537; vec3 b=v*(0.983729*v+0.4329510)+0.238081; return a/b; }
    vec3 aces(vec3 c){ const mat3 I=mat3(vec3(0.59719,0.07600,0.02840),vec3(0.35458,0.90834,0.13383),vec3(0.04823,0.01566,0.83777));
      const mat3 O=mat3(vec3(1.60475,-0.10208,-0.00327),vec3(-0.53108,1.10813,-0.07276),vec3(-0.07367,-0.00605,1.07602));
      c*=uExp/0.6; c=I*c; c=RRTAndODTFit(c); c=O*c; return clamp(c,0.0,1.0); }
    vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(c,vec3(1.0/2.4))-0.055, step(vec3(0.0031308),c)); }
    void main(){
      vec3 c=texture2D(tScene,vUv).rgb + (texture2D(tB1,vUv).rgb*0.6 + texture2D(tB2,vUv).rgb*0.4)*uBk;
      c=toSRGB(aces(c));
      c=uLift*(1.0-c)+c*uGain;                                         // 暗部加色、亮部乘色（split toning）
      float l=dot(c,vec3(0.299,0.587,0.114)); c=mix(vec3(l),c,uSat);    // 飽和度
      c=(c-0.5)*uCon+0.5;                                              // 對比
      vec2 d=(vUv-0.5)*uAspect; float v=1.0-uVig*smoothstep(0.35,1.05,length(d)*1.25); c*=v;   // 暗角
      gl_FragColor=vec4(clamp(c,0.0,1.0),1.0); }`;

  let R, E, rtScene=null, rtB=[], quad, qScene, qCam, mBright, mBlur, mComp, size=new THREE.Vector2();
  function mat(fs,uni){ return new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:fs,uniforms:uni,depthTest:false,depthWrite:false,toneMapped:false}); }
  function makeTargets(w,h){
    if(rtScene){ rtScene.dispose(); rtB.forEach(r=>r.dispose()); }
    const isGL2=R.capabilities.isWebGL2; const hq=!(E.q&&E.q.forcePR&&E.q.forcePR<0.6);
    rtScene=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,depthBuffer:true,samples:isGL2&&hq?4:0});
    const mk=(d)=>new THREE.WebGLRenderTarget(Math.max(1,w>>d),Math.max(1,h>>d),{type:THREE.HalfFloatType,depthBuffer:false});
    rtB=[mk(2),mk(2),mk(3),mk(3)];   // 1/4（亮部、模糊）、1/8（第二層模糊）
  }
  function pass(m,target){ quad.material=m; R.setRenderTarget(target); R.render(qScene,qCam); }
  POST.install=function(e){
    if(POST.installed) return; E=e; R=e.renderer; POST.installed=true;
    qScene=new THREE.Scene(); qCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1); quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2)); quad.frustumCulled=false; qScene.add(quad);
    mBright=mat(FS_BRIGHT,{tSrc:{value:null},uThr:{value:1},uExp:{value:1}});
    mBlur=mat(FS_BLUR,{tSrc:{value:null},uDir:{value:new THREE.Vector2()}});
    mComp=mat(FS_COMP,{tScene:{value:null},tB1:{value:null},tB2:{value:null},uExp:{value:1},uBk:{value:0.1},uSat:{value:1},uCon:{value:1},uLift:{value:new THREE.Vector3()},uGain:{value:new THREE.Vector3(1,1,1)},uVig:{value:0.2},uAspect:{value:new THREE.Vector2(1,1)}});
    const orig=R.render.bind(R);
    R.render=function(scene,camera){
      if(!POST.enabled||scene!==E.scene||R.getRenderTarget()!==null) return orig(scene,camera);
      R.getDrawingBufferSize(size); const w=size.x|0, h=size.y|0;
      if(!rtScene||rtScene.width!==w||rtScene.height!==h) makeTargets(w,h);
      const p=presetFor(E), exp=R.toneMappingExposure;
      R.setRenderTarget(rtScene); orig(scene,camera);                   // ①線性 HDR
      const ac=R.autoClear; R.autoClear=true;
      mBright.uniforms.tSrc.value=rtScene.texture; mBright.uniforms.uThr.value=p.bt; mBright.uniforms.uExp.value=exp; pass(mBright,rtB[0]);   // ②亮部（1/4）
      const blur=(src,dst,dx,dy)=>{ mBlur.uniforms.tSrc.value=src.texture; mBlur.uniforms.uDir.value.set(dx/src.width,dy/src.height); pass(mBlur,dst); };
      blur(rtB[0],rtB[1],1,0); blur(rtB[1],rtB[0],0,1);
      blur(rtB[0],rtB[2],1,0); blur(rtB[2],rtB[3],0,1); blur(rtB[3],rtB[2],1,0); blur(rtB[2],rtB[3],0,1);   // 1/8 再糊一層（大範圍的柔光）
      const u=mComp.uniforms; u.tScene.value=rtScene.texture; u.tB1.value=rtB[0].texture; u.tB2.value=rtB[3].texture; u.uExp.value=exp; u.uBk.value=p.bk;
      u.uSat.value=p.sat; u.uCon.value=p.con; u.uLift.value.set(p.lift[0],p.lift[1],p.lift[2]); u.uGain.value.set(p.gain[0],p.gain[1],p.gain[2]); u.uVig.value=p.vig; u.uAspect.value.set(w>h?w/h:1,h>w?h/w:1);
      pass(mComp,null);                                                 // ③合成到螢幕
      R.autoClear=ac; POST.stats.frames++;
    };
  };
  (function wait(){ if(typeof GAME!=='undefined'&&GAME.E&&GAME.E.renderer) POST.install(GAME.E); else setTimeout(wait,150); })();   /* GAME 是 const 宣告（game3d.js），不在 window 上：原本寫 window.GAME 永遠掛不上去（LAWWW2 2026-10-21 查到）*/
})();

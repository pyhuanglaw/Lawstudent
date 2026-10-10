/* ===== 引擎：渲染、時間光線、鏡頭、觸控輸入、導航格、實體與 NPC、分區載入 ===== */
'use strict';
const E3 = (function(){
  const E={}; let renderer, scene, camera, clock; const cont={}; E.q={pr:1,shadows:false,far:140,level:'medium'};
  const UP=new THREE.Vector3(0,1,0); const tmpV=new THREE.Vector3(), tmpV2=new THREE.Vector3(), tmpV3=new THREE.Vector3();
  // ---------- 導航格 ----------
  class NavGrid{ constructor(w,h,cell,ox,oz){ this.w=w; this.h=h; this.cell=cell; this.ox=ox; this.oz=oz; this.cols=Math.ceil(w/cell); this.rows=Math.ceil(h/cell); this.b=new Uint8Array(this.cols*this.rows); }
    idx(cx,cz){ return cz*this.cols+cx; } toCell(x,z){ return [Math.floor((x-this.ox)/this.cell),Math.floor((z-this.oz)/this.cell)]; } toWorld(cx,cz){ return [this.ox+(cx+0.5)*this.cell,this.oz+(cz+0.5)*this.cell]; }
    blocked(cx,cz){ if(cx<0||cz<0||cx>=this.cols||cz>=this.rows) return true; return this.b[this.idx(cx,cz)]===1; }
    free(x,z){ const [cx,cz]=this.toCell(x,z); return !this.blocked(cx,cz); }
    blockCircle(x,z,r){ this._cm=null; const [c0,r0]=this.toCell(x-r,z-r), [c1,r1]=this.toCell(x+r,z+r); for(let cz=r0;cz<=r1;cz++) for(let cx=c0;cx<=c1;cx++){ if(cx<0||cz<0||cx>=this.cols||cz>=this.rows) continue; const [wx,wz]=this.toWorld(cx,cz); if((wx-x)**2+(wz-z)**2<=r*r) this.b[this.idx(cx,cz)]=1; } }
    blockRect(x,z,w,d,rot,pad){ this._cm=null; pad=pad||0; const hw=w/2+pad, hd=d/2+pad; const cos=Math.cos(rot||0), sin=Math.sin(rot||0); const R=Math.hypot(hw,hd); const [c0,r0]=this.toCell(x-R,z-R), [c1,r1]=this.toCell(x+R,z+R); for(let cz=r0;cz<=r1;cz++) for(let cx=c0;cx<=c1;cx++){ if(cx<0||cz<0||cx>=this.cols||cz>=this.rows) continue; const [wx,wz]=this.toWorld(cx,cz); const dx=wx-x, dz=wz-z; const lx=dx*cos+dz*sin, lz=-dx*sin+dz*cos; if(Math.abs(lx)<=hw&&Math.abs(lz)<=hd) this.b[this.idx(cx,cz)]=1; } }
    blockOutside(x0,z0,x1,z1){ this._cm=null; for(let cz=0;cz<this.rows;cz++) for(let cx=0;cx<this.cols;cx++){ const [wx,wz]=this.toWorld(cx,cz); if(wx<x0||wx>x1||wz<z0||wz>z1) this.b[this.idx(cx,cz)]=1; } }
    nearestFree(x,z,maxR){ const [cx,cz]=this.toCell(x,z); if(!this.blocked(cx,cz)) return [x,z]; maxR=maxR||12; for(let r=1;r<=maxR;r++){ for(let dz=-r;dz<=r;dz++) for(let dx=-r;dx<=r;dx++){ if(Math.max(Math.abs(dx),Math.abs(dz))!==r) continue; if(!this.blocked(cx+dx,cz+dz)) return this.toWorld(cx+dx,cz+dz); } } return null; }
    los(x0,z0,x1,z1){ const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/(this.cell*0.5)); for(let i=0;i<=n;i++){ const t=i/n; if(!this.free(x0+(x1-x0)*t,z0+(z1-z0)*t)) return false; } return true; }
    // v9.3 第二十五批（2026-10-10 線上回報：進教室上課劇情卡在桌角）：路徑原本只避開「被擋住的格子」，會貼著障礙物走；
    // 人物有 0.32 m 的半徑，貼著障礙物那一格其實站不住（canStand 會失敗）→ 自動走路卡在轉角。
    // near()：八個鄰格有被擋的 → A* 經過要多付成本（優先走走道中間）；losR()：平滑時直線上每一點都要「人物半徑過得去」
    near(cx,cz){ for(let dz=-1;dz<=1;dz++) for(let dx=-1;dx<=1;dx++){ if((dx||dz)&&this.blocked(cx+dx,cz+dz)) return true; } return false; }
    clear(x,z,r){ return this.free(x,z)&&this.free(x+r,z)&&this.free(x-r,z)&&this.free(x,z+r)&&this.free(x,z-r); }
    clearMask(){ if(this._cm) return this._cm; const m=new Uint8Array(this.cols*this.rows); for(let cz=0;cz<this.rows;cz++) for(let cx=0;cx<this.cols;cx++){ const i=cz*this.cols+cx; if(this.b[i]) continue; const [x,z]=this.toWorld(cx,cz); if(this.clear(x,z,0.33)) m[i]=1; } this._cm=m; return m; }
    losR(x0,z0,x1,z1,r){ const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/(this.cell*0.4)); for(let i=0;i<=n;i++){ const t=i/n; if(!this.clear(x0+(x1-x0)*t,z0+(z1-z0)*t,r)) return false; } return true; }
    path(x0,z0,x1,z1){ const s=this.toCell(x0,z0); let e=this.toCell(x1,z1); if(this.blocked(e[0],e[1])){ const nf=this.nearestFree(x1,z1,20); if(!nf) return null; e=this.toCell(nf[0],nf[1]); } if(this.blocked(s[0],s[1])){ const nf=this.nearestFree(x0,z0,6); if(nf){ const c=this.toCell(nf[0],nf[1]); s[0]=c[0]; s[1]=c[1]; } }
      const cols=this.cols, rows=this.rows; const N=cols*rows; const g=new Float32Array(N).fill(1e9); const f=new Float32Array(N).fill(1e9); const from=new Int32Array(N).fill(-1); const closed=new Uint8Array(N); const open=[]; const si=s[1]*cols+s[0], ei=e[1]*cols+e[0]; g[si]=0; const HW=1.1; f[si]=HW*Math.hypot(e[0]-s[0],e[1]-s[1]); open.push(si);   // HW：啟發函數略加權（路徑最多長 10%，但長距離搜尋快很多；之後還會直線平滑）
      const push=(i)=>{ open.push(i); let k=open.length-1; while(k>0){ const p=(k-1)>>1; if(f[open[p]]<=f[open[k]]) break; [open[p],open[k]]=[open[k],open[p]]; k=p; } };
      const pop=()=>{ const top=open[0]; const last=open.pop(); if(open.length){ open[0]=last; let k=0; for(;;){ let l=2*k+1, r=l+1, m=k; if(l<open.length&&f[open[l]]<f[open[m]]) m=l; if(r<open.length&&f[open[r]]<f[open[m]]) m=r; if(m===k) break; [open[m],open[k]]=[open[k],open[m]]; k=m; } } return top; };
      const CM=E.navLegacy?null:this.clearMask(); const strictOK=(i)=>!CM||CM[i]||i===si||i===ei;   /* 起點、終點本身可以貼邊（玩家站在牆邊、目標在家具旁）*/
      const search=(strict)=>{ g.fill(1e9); f.fill(1e9); from.fill(-1); closed.fill(0); open.length=0; g[si]=0; f[si]=HW*Math.hypot(e[0]-s[0],e[1]-s[1]); open.push(si);
      let it=0; while(open.length&&it++<200000){   /* 校園格子約 21.8 萬格；舊的 6 萬上限在 v9.3 新增醉月湖、樹列後，霖澤館 → 校門的長路徑會找不到 */ const cur=pop(); if(cur===ei) break; if(closed[cur]) continue; closed[cur]=1; const cx=cur%cols, cz=(cur/cols)|0; for(let dz=-1;dz<=1;dz++) for(let dx=-1;dx<=1;dx++){ if(!dx&&!dz) continue; const nx=cx+dx, nz=cz+dz; if(this.blocked(nx,nz)) continue; if(dx&&dz&&(this.blocked(cx+dx,cz)||this.blocked(cx,cz+dz))) continue; const ni=nz*cols+nx; if(closed[ni]) continue; if(strict&&!strictOK(ni)) continue; if(strict&&dx&&dz&&!(strictOK(nz*cols+cx)||strictOK(cz*cols+nx))) continue; const ng=g[cur]+((dx&&dz)?1.414:1)+((!E.navLegacy&&this.near(nx,nz))?3:0); if(ng<g[ni]){ g[ni]=ng; f[ni]=ng+HW*Math.hypot(e[0]-nx,e[1]-nz); from[ni]=cur; push(ni); } } }
      return from[ei]>=0||ei===si; };
      /* v9.3 第二十五批：先找「人物寬度過得去」的路；完全沒有才退回舊的（貼邊、經過比人窄的縫的路，可能走到一半被擋住）*/ if(!(CM&&search(true))&&!search(false)) return null;
      if(from[ei]<0&&ei!==si) return null; const cells=[]; let c=ei; while(c>=0&&c!==si){ cells.push(c); c=from[c]; } cells.reverse(); const pts=cells.map(i=>this.toWorld(i%cols,(i/cols)|0)); pts.push([x1,z1]); // 直線平滑
      const out=[]; let cur=[x0,z0]; let i=0; while(i<pts.length){ let j=pts.length-1; while(j>i&&!(E.navLegacy?this.los(cur[0],cur[1],pts[j][0],pts[j][1]):this.losR(cur[0],cur[1],pts[j][0],pts[j][1],0.33))) j--; out.push(pts[j]); cur=pts[j]; i=j+1; } return out; }
  }
  E.NavGrid=NavGrid;
  E.navLegacy=typeof location!=='undefined'&&/[?&]navlegacy\b/.test(location.search);   // 測試用：切回第二十五批之前的找路（證明 tests/reachability_all.py 抓得到教室卡住）
  // ---------- 初始化 ----------
  E.init=function(canvas,opts){ opts=opts||{}; E.canvas=canvas; renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'}); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.0; renderer.shadowMap.enabled=false; renderer.shadowMap.type=THREE.PCFShadowMap; E.renderer=renderer;
    scene=new THREE.Scene(); E.scene=scene; camera=new THREE.PerspectiveCamera(46,1,0.1,200); E.camera=camera; clock=new THREE.Timer?null:null; E.time=0;
    E.hemi=new THREE.HemisphereLight(0xdfe9f5,0xb9a98d,0.8); scene.add(E.hemi); E.sun=new THREE.DirectionalLight(0xfff2dc,1.9); E.sun.position.set(30,50,20); scene.add(E.sun); E.sun.target.position.set(0,0,0); scene.add(E.sun.target); E.fill=new THREE.DirectionalLight(0xcfe3ff,0.35); E.fill.position.set(-20,20,-30); scene.add(E.fill);
    E.sun.shadow.mapSize.set(1024,1024); E.sun.shadow.camera.near=1; E.sun.shadow.camera.far=120; E.sun.shadow.camera.left=-22; E.sun.shadow.camera.right=22; E.sun.shadow.camera.top=22; E.sun.shadow.camera.bottom=-22; E.sun.shadow.bias=-0.0006; E.sun.shadow.normalBias=0.03;
    scene.fog=new THREE.Fog(0xdbe6ea,40,150); E.sky=makeSky(); scene.add(E.sky); E.skyline=makeSkyline(); scene.add(E.skyline);
    E.groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0); E.ray=new THREE.Raycaster(); E.ndc=new THREE.Vector2();
    E.cam={yaw:Math.PI,pitch:0.22,dist:6.0,distTarget:6.0,target:new THREE.Vector3(),mode:'follow',shake:0}; E.player=null; E.npcs=[]; E.extras=[]; E.zone=null; E.colliders=[]; E.interactables=[]; E.hour=8.5; E.weather='clear'; E.paused=false; E.lampGlows=[]; E.windowsLit=false;
    setupInput(); E.setQuality(opts.quality||'medium'); E.resize(); window.addEventListener('resize',E.resize); return E; };
  // 天空（v9.2）：漸層＋地平線霧氣＋會隨時間變色的雲（程序雜訊，緩慢飄動）＋夜晚星星
  function makeSky(){ const geo=new THREE.SphereGeometry(120,32,16); const mat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
      uniforms:{top:{value:new THREE.Color(0x7fb0d8)},mid:{value:new THREE.Color(0xd8e8ef)},bot:{value:new THREE.Color(0xf1e7d6)},sunDir:{value:new THREE.Vector3(0,1,0)},sunCol:{value:new THREE.Color(0xffe6b0)},sunAmt:{value:0.3},
        time:{value:0},cover:{value:0.5},cloudLit:{value:new THREE.Color(0xffffff)},cloudDark:{value:new THREE.Color(0xb8c4d2)},starAmt:{value:0},oct:{value:5}},
      vertexShader:'varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader:[
        'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform vec3 sunDir; uniform vec3 sunCol; uniform float sunAmt; uniform float time; uniform float cover; uniform vec3 cloudLit; uniform vec3 cloudDark; uniform float starAmt; uniform float oct; varying vec3 vP;',
        'float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }',
        'float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f); float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0)); return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }',
        'float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ if(float(i)>=oct) break; v+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return v; }',
        'void main(){ vec3 d=normalize(vP); float h=d.y;',
        '  vec3 c= h>0.0? mix(mid,top,pow(clamp(h,0.0,1.0),0.85)) : mix(mid,bot,pow(-h,0.6));',
        '  c=mix(c,mid,exp(-abs(h)*16.0)*0.45);',  /* 地平線的霧氣 */
        '  vec3 sd3=normalize(sunDir); float sd=max(0.0,dot(d,sd3));',
        '  c+=sunCol*pow(sd,18.0)*sunAmt+sunCol*pow(sd,3.0)*sunAmt*0.25;',
        '  float dens=0.0;',
        '  if(h>0.0){ vec2 uv=d.xz/(h+0.16)*1.25+vec2(time*0.0045,time*0.0016); float n=fbm(uv*1.5)*0.75+fbm(uv*0.55+vec2(3.1,1.7))*0.35; dens=smoothstep(cover,cover+0.26,n)*smoothstep(0.0,0.12,h);',
        '    float shade=clamp(0.6+1.1*(n-fbm(uv*1.5+sd3.xz*0.12)*0.75-fbm(uv*0.55+vec2(3.1,1.7)+sd3.xz*0.05)*0.35),0.0,1.0); vec3 cc=mix(cloudDark,cloudLit,shade); cc+=sunCol*pow(sd,5.0)*0.45*sunAmt*(1.0-dens*0.4);',
        '    c=mix(c,cc,dens*0.9); }',
        '  if(starAmt>0.001&&h>0.04){ vec2 sp=d.xz/(h+0.35)*180.0; float st=step(0.9972,hash(floor(sp))); c+=vec3(0.9,0.92,1.0)*st*starAmt*smoothstep(0.04,0.3,h)*(1.0-dens); }',
        '  gl_FragColor=vec4(c,1.0); }'].join('\n')});
    const m=new THREE.Mesh(geo,mat); m.renderOrder=-10; m.frustumCulled=false; return m; }
  // 遠方天際線（v9.2）：跟著鏡頭的兩圈圓柱（遠山＋台北市區剪影），越遠越淡（空氣感）；晚上市區窗戶亮燈。只在室外區域顯示
  function skylineTex(kind){ const W=2048, H=256; const c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d'); let seed=kind==='city'?7:3; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
    const win=document.createElement('canvas'); win.width=W; win.height=H; const wx=win.getContext('2d');
    if(kind==='mount'){ // 兩層山稜線（遠的淡、近的深一點）
      for(const [base,amp,g,ph] of [[140,80,'rgba(232,236,240,1)',1.3],[175,56,'rgba(196,204,212,1)',2.6],[205,34,'rgba(168,178,188,1)',0.4]]){ x.fillStyle=g; x.beginPath(); x.moveTo(0,H); for(let i=0;i<=W;i+=6){ const t=i/W*Math.PI*2; const y=base-amp*(0.55+0.25*Math.sin(t*3+ph)+0.12*Math.sin(t*7+ph*2.1)+0.06*Math.sin(t*17+ph*0.7)+0.03*Math.sin(t*41+ph)); x.lineTo(i,y); } x.lineTo(W,H); x.closePath(); x.fill(); }
      for(let k=0;k<900;k++){ const px=rnd()*W, py=150+rnd()*100; x.fillStyle='rgba(120,135,140,0.10)'; x.fillRect(px,py,3+rnd()*6,2+rnd()*3); } // 山坡上的樹林斑點
      // 台北 101（遠景地標剪影，在山前面）
      const cx=W*0.18, by=H-14; x.fillStyle='rgba(150,158,168,1)'; for(let k=0;k<8;k++){ const w0=26-k*1.2, y0=by-22-k*17; x.beginPath(); x.moveTo(cx-w0/2,y0+17); x.lineTo(cx-w0/2-3,y0); x.lineTo(cx+w0/2+3,y0); x.lineTo(cx+w0/2,y0+17); x.fill(); } x.fillRect(cx-16,by-22,32,22); x.fillRect(cx-5,by-170,10,14); x.fillRect(cx-1.5,by-205,3,36);
      return {map:c}; }
    // 市區：後排（淡）＋前排（深）建築剪影，可水平接續；窗戶另外一張（晚上亮）
    for(const [row,minH,maxH,g] of [[0,60,150,'rgba(255,255,255,1)'],[1,30,110,'rgba(170,176,184,1)']]){ let px=0; while(px<W){ const bw=18+rnd()*46, bh=minH+rnd()*(maxH-minH)*(rnd()<0.12?1.6:1); const top=H-bh; x.fillStyle=g;
        const draw=(ox)=>{ x.fillRect(ox,top,bw,bh); if(rnd()<0.35){ x.fillRect(ox+bw*0.2,top-6,bw*0.25,6); } if(rnd()<0.15){ x.fillRect(ox+bw*0.6,top-14,2,14); } };
        draw(px); if(px+bw>W) draw(px-W);
        if(row===1){ for(let wy=top+6;wy<H-6;wy+=9){ for(let wxp=px+4;wxp<px+bw-5;wxp+=7){ const lit=rnd(); x.fillStyle='rgba(120,128,138,1)'; x.fillRect(wxp,wy,3,4); if(lit<0.38){ wx.fillStyle=lit<0.27?'rgba(255,214,150,1)':'rgba(220,235,255,1)'; wx.fillRect(wxp%W,wy,3,4); } } } }
        px+=bw+(rnd()<0.2?6:0); } }
    return {map:c,win}; }
  function makeSkyline(){ const g=new THREE.Group(); g.name='skyline';
    const mk=(canvas,r,hgt,y,o)=>{ const t=new THREE.CanvasTexture(canvas); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=THREE.RepeatWrapping; t.repeat.set(o.rep||1,1); const m=new THREE.MeshBasicMaterial(Object.assign({map:t,transparent:false,alphaTest:0.5,depthWrite:false,fog:false,side:THREE.BackSide},o.mat||{})); const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,hgt,64,1,true),m); mesh.position.y=y; mesh.renderOrder=o.ro||-9;   /* v9.3 第二十批：放在不透明的那一輪、緊接在天空之後先畫（不寫深度），所有建築、地面都畫在它上面。原本是半透明的那一輪（最後才畫），比 118 m 遠的建築（例如椰林大道盡頭的總圖）會被這圈剪影蓋過去 */ mesh.frustumCulled=false; g.add(mesh); return mesh; };
    const M=skylineTex('mount'), C=skylineTex('city');
    g.userData.mount=mk(M.map,150,40,15,{rep:1,ro:-9.5});   /* 不透明那一輪是由近到遠排序：用 renderOrder 讓山先畫、市區剪影再畫在山前面 */
    g.userData.city=mk(C.map,118,40,15,{rep:2});
    g.userData.win=mk(C.win,117.5,40,15,{rep:2,ro:-8,mat:{blending:THREE.AdditiveBlending,opacity:0,alphaTest:0}});   /* 加法混合在不透明那一輪也有效 */
    return g; }
  E.setQuality=function(level){ E.q.level=level; const dpr=window.devicePixelRatio||1; if(level==='high'){ E.q.pr=Math.min(dpr,2); E.q.shadows=true; E.q.far=160; } else if(level==='low'){ E.q.pr=Math.min(dpr,1); E.q.shadows=false; E.q.far=90; } else { E.q.pr=Math.min(dpr,1.5); E.q.shadows=true; E.q.far=130; } renderer.setPixelRatio(E.q.forcePR||E.q.pr); renderer.shadowMap.enabled=E.q.shadows; E.sun.castShadow=E.q.shadows; camera.far=E.q.far+40; camera.updateProjectionMatrix(); scene.fog.far=E.q.far; E.applyViewFar&&E.applyViewFar(); if(E.sky){ const s=(camera.far-10)/120; E.sky.scale.setScalar(s); E.sky.material.uniforms.oct.value=level==='low'?3:5; } E.resize(); scene.traverse(o=>{ if(o.material&&o.material.needsUpdate!==undefined) o.material.needsUpdate=true; }); };
  E.resize=function(){ const w=E.canvas.clientWidth||innerWidth, h=E.canvas.clientHeight||innerHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.fov=w<h?60:46; camera.updateProjectionMatrix(); E.w=w; E.h=h; E.portrait=w<h; };
  // ---------- 時間與天氣 ----------
  const KEY0=[ // hour, sun color, sun int, elev(deg), azimuth(deg), hemi sky, hemi ground, hemi int, fog color, exposure, skyTop, skyMid, skyBot, lamps
    [5.5,'#c8c2d8',0.35,2,80,'#8f9ebf','#3d3a3a',0.55,'#b9c4d4',0.85,'#5f7aa8','#b9c4d4','#d7c9b8',1],
    [7,'#ffd9a8',1.4,12,88,'#cfdcef','#a9967a',0.75,'#dbe6ea',0.95,'#7fb0d8','#d8e8ef','#f1e7d6',0],
    [9,'#fff2dc',1.9,32,100,'#dfe9f5','#b9a98d',0.8,'#dbe6ea',1.0,'#79aedb','#d8e8ef','#f1e7d6',0],
    [12,'#fff8ec',2.2,68,150,'#e6eefa','#c0b29a',0.85,'#dfe9ec',1.0,'#6fa9dc','#dbe9f0','#eee6d8',0],
    [15,'#fff1d6',2.0,45,225,'#dfe9f5','#c0b29a',0.8,'#dfe6ea',1.0,'#75acd9','#dbe7ee','#efe4d2',0],
    [17,'#ffcc8c',2.0,26,262,'#e2dfe6','#c9a67a',0.9,'#e6dccd',1.02,'#78a4cf','#e9d8c0','#f5d6a8',0],   // v9.3：黃昏略調亮、偏暖（往參考圖 07／06 的 17:30 金橘方向；效果小，畫面平均亮度約 +3%）
    [18,'#ffa462',1.7,13,268,'#e0c0b8','#8f6c56',0.95,'#e0bba0',1.08,'#5f7fb2','#efb383','#f8c587',1],
    [18.6,'#ff8a5a',0.75,3,272,'#a88fb0','#6a5248',0.85,'#b9a0b0',1.0,'#3f5a95','#c98a8e','#f0a878',1],
    [19.2,'#7080b8',0.25,-2,276,'#6a7ab0','#3a3440',0.8,'#3a4468',0.95,'#22386a','#5a6a9a','#8a7a8c',1],
    [21,'#3a4670',0.08,-10,280,'#2b3a5c','#1a1a24',0.55,'#1b2233',0.85,'#0f1a33','#243052','#3a3a4a',1],
    [24,'#3a4670',0.05,-10,280,'#232f4c','#151520',0.5,'#141a2b',0.8,'#0b1329','#1c2540','#2b2b3a',1],
  ];
  // 黃昏調色提案（v9.3，使用者還沒決定，預設不開）：網址加 ?grade=golden 才用。目標是參考圖 07 的 17:30——
  // 暖金色的陽光、陰影裡也偏暖（環境光從冷灰改成暖杏色）、街道盡頭的空氣有一層暖橘色的霧、天空下緣金黃。只換 17:00–18:00 這一段。
  const KEY_GOLDEN=[
    [17,'#ffbb70',2.4,24,262,'#ffd2a4','#b8845e',1.1,'#f6c294',1.1,'#7a9acb','#f6c08a','#ffd49a',0],
    [17.5,'#ffa458',2.6,18,265,'#ffc488','#a8704e',1.18,'#ffb074',1.18,'#6f8cc2','#ffae72','#ffc480',0.5],   // 路燈：最後一欄 0.5，17:30 一過就亮（和預設一樣）
    [18,'#ff9450',2.1,13,268,'#f6b088','#8f6248',1.08,'#f4a272',1.14,'#5f7fb2','#f6a070','#ffb47c',1]];
  const KEYG=KEY0.filter(r=>r[0]<17||r[0]>18).concat(KEY_GOLDEN).sort((a,b)=>a[0]-b[0]);
  E.grade=(typeof location!=='undefined'&&(location.search.match(/[?&]grade=(\w+)/)||[])[1])||null;
  const c1=new THREE.Color(), c2=new THREE.Color();
  E.applyTime=function(hour){ E.hour=hour; const KEY=E.grade==='golden'?KEYG:KEY0; let h=hour%24; if(h<KEY[0][0]) h=KEY[0][0]; let i=0; while(i<KEY.length-2&&KEY[i+1][0]<=h) i++; const A=KEY[i], B=KEY[i+1]; const t=Math.max(0,Math.min(1,(h-A[0])/(B[0]-A[0]))); const lerpC=(a,b)=>{ c1.set(a); c2.set(b); return c1.lerp(c2,t); }; const lerp=(a,b)=>a+(b-a)*t;
    E.sun.color.copy(lerpC(A[1],B[1])); E.sun.intensity=lerp(A[2],B[2]); const el=lerp(A[3],B[3])*Math.PI/180, az=lerp(A[4],B[4])*Math.PI/180; const target=E.player?E.player.obj.position:new THREE.Vector3(); /* 太陽方向（v9.3 第二十一批）：azimuth 是羅盤方位（0 北、90 東、180 南）。戶外區域 x 往東、-z 往北（D25），所以 z 用 -cos；區域座標轉過方向的用 def.sunYaw（公館：+x 往南、+z 往西）。之前戶外也用 +cos：中午太陽在北邊，朝南的牆（霖澤館、萬才館正面）整天背光，台北的太陽中午一定在南邊。室內沒有方位，維持原本的方向（室內的光影是照那個方向調的）*/ let sx=Math.sin(az), sz=E.indoor?Math.cos(az):-Math.cos(az); const syw=(!E.indoor&&E.zone&&E.zone.def&&E.zone.def.sunYaw)||0; if(syw){ const cy=Math.cos(syw), sy=Math.sin(syw), x2=sx*cy+sz*sy; sz=-sx*sy+sz*cy; sx=x2; } E.sun.position.set(target.x+Math.cos(el)*sx*60,Math.max(2,Math.sin(el)*60)+target.y,target.z+Math.cos(el)*sz*60); E.sun.target.position.copy(target); E.sun.target.updateMatrixWorld();
    E.hemi.color.copy(lerpC(A[5],B[5])); E.hemi.groundColor.copy(lerpC(A[6],B[6])); E.hemi.intensity=lerp(A[7],B[7]); scene.fog.color.copy(lerpC(A[8],B[8])); renderer.toneMappingExposure=lerp(parseFloat(A[9]),parseFloat(B[9]));
    const sk=E.sky.material.uniforms; sk.top.value.copy(lerpC(A[10],B[10])); sk.mid.value.copy(lerpC(A[11],B[11])); sk.bot.value.copy(lerpC(A[12],B[12])); sk.sunDir.value.copy(E.sun.position).sub(target).normalize(); sk.sunCol.value.copy(E.sun.color); sk.sunAmt.value=0.15+0.45*Math.max(0,1-Math.abs(el)/0.6);
    { // 雲與天際線：白天白雲、黃昏染上夕陽色、夜晚暗；天際線用霧的顏色做空氣感，越暗越像剪影
      const nk=h>=19.2||h<5.6?1:(h>=17.6?(h-17.6)/1.6:(h<6.4?(6.4-h)/0.8:0)); const dusk=Math.max(0,1-Math.abs(h-18.0)/1.6)*(1-nk*0.6); const elDeg=lerp(A[3],B[3]); if(typeof CHAR!=='undefined'&&CHAR.setDuskRim) CHAR.setDuskRim(E.indoor?0:Math.max(0,1-Math.abs(h-17.8)/1.0),E.sun.color);   /* 黃昏人物的暖色輪廓光（室內不用）*/
      /* 柏油路面（第二十二批改成照片的淺灰）入夜後變暗：遊戲的夜間環境光（城市夜光）會把朝上的大片淺色路面整片照亮，看起來像傍晚；真實的路面晚上只有路燈附近亮。只調柏油材質，不動全域光線 */
      if(E.roadMats&&E.roadMats.length){ const rf=1-0.42*nk; for(const m of E.roadMats) m.color.setScalar(rf); }
      const lit=new THREE.Color(0xffffff).lerp(E.sun.color,0.25+0.6*dusk); lit.lerp(new THREE.Color(0x323a52),nk*0.92); const dark=sk.top.value.clone().lerp(new THREE.Color(0xa6b0bf),0.55).lerp(new THREE.Color(0x9a7472),dusk*0.45).lerp(new THREE.Color(0x141a28),nk*0.9);
      sk.cloudLit.value.copy(lit); sk.cloudDark.value.copy(dark); sk.cover.value=0.43-0.04*dusk; sk.starAmt.value=Math.max(0,nk-0.3)*0.9;
      if(E.skyline){ const fc=scene.fog.color; const haze=fc.clone().lerp(sk.mid.value,0.35); const U=E.skyline.userData; U.mount.material.color.copy(haze).lerp(new THREE.Color(0x67798c),0.7*(1-nk)).lerp(new THREE.Color(0x8a6f80),dusk*0.3).lerp(new THREE.Color(0x232a3c),nk*0.8); U.city.material.color.copy(haze).lerp(new THREE.Color(0x6f7c8c),0.45*(1-nk)).lerp(new THREE.Color(0x7a5e6c),dusk*0.35).lerp(new THREE.Color(0x121827),nk*0.9); U.win.material.opacity=Math.max(0,Math.min(1,(nk-0.15)*1.4)); } }
    const lamps=lerp(A[13],B[13])>0.5; if(lamps!==E.lampsOn){ E.lampsOn=lamps; E.setLamps(lamps); }
    if(!E.indoor&&E.zone&&E.zone.def&&E.zone.def.cityLight&&E.lampsOn){ const cl=E.zone.def.cityLight; E.hemi.intensity+=0.45*cl; E.hemi.color.lerp(new THREE.Color(0xffd9a8),0.5*cl); scene.fog.color.lerp(new THREE.Color(0x4a4058),0.4*cl); }
    if(E.indoor){ const night=(h<6.5||h>=18); const dusk=(h>=16.5&&h<18.4); const warm=!!(E.zone&&E.zone.warm), cool=!!(E.zone&&E.zone.cool); E.hemi.intensity=night?(warm?0.8:(cool?1.05:0.95)):(dusk?1.1:1.2); E.hemi.color.set(night?(warm?0xffdcb0:(cool?0xe6ecfa:0xfff0dc)):(dusk?0xf9e6c8:(h<8?0xeef2f8:0xf4f1ea))); E.hemi.groundColor.set(night?0x6e5f52:(dusk?0xa08a6a:0x9a8a78)); E.sun.intensity=night?0.12:(dusk?0.7:0.9); if(E.sun.color) E.sun.color.set(dusk?0xffc07a:0xffffff); renderer.toneMappingExposure=1.0; scene.fog.far=E.q.far; if(E.zone&&E.zone.applyTime) E.zone.applyTime(h,E.weather); return; }
    if(E.zone&&E.zone.applyTimeOutdoor) E.zone.applyTimeOutdoor(h,E);
    if(E.weather==='rain'||E.weather==='cloudy'){ E.sun.intensity*=E.weather==='rain'?0.35:0.55; E.hemi.intensity*=0.9; sk.sunAmt.value*=0.2; sk.cover.value=E.weather==='rain'?0.22:0.32; sk.cloudLit.value.lerp(new THREE.Color(0xb7bec8),0.6); sk.cloudDark.value.lerp(new THREE.Color(0x6d7682),0.6); sk.top.value.lerp(new THREE.Color(0x7f8a99),0.7); sk.mid.value.lerp(new THREE.Color(0xa9b3bd),0.6); scene.fog.color.lerp(new THREE.Color(0xa9b3bd),0.5); scene.fog.far=(E.fogFar||E.q.far)*0.7; } else scene.fog.far=E.fogFar||E.q.far; };   /* v9.3 第二十批：原本這裡每次都重設成畫質預設的 E.q.far，區域的 viewFar（applyViewFar）實際上沒有生效 */
  E.setLamps=function(on){ for(const l of E.lampGlows){ l.visible=on; } if(E.zone&&E.zone.onLamps) E.zone.onLamps(on); };
  E.setWeather=function(w){ E.weather=w; if(w==='rain'){ if(!E.rain){ E.rain=makeRain(); scene.add(E.rain); } E.rain.visible=true; } else if(E.rain) E.rain.visible=false; if(E.zone&&E.zone.onWeather) E.zone.onWeather(w); E.applyTime(E.hour); };
  function makeRain(){ const n=1400; const pos=new Float32Array(n*3); for(let i=0;i<n;i++){ pos[i*3]=(Math.random()-0.5)*40; pos[i*3+1]=Math.random()*18; pos[i*3+2]=(Math.random()-0.5)*40; } const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); const c=document.createElement('canvas'); c.width=8; c.height=32; const x=c.getContext('2d'); const gr=x.createLinearGradient(0,0,0,32); gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(0.5,'rgba(220,230,255,0.8)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(3,0,2,32); const t=new THREE.CanvasTexture(c); const m=new THREE.PointsMaterial({size:0.45,map:t,transparent:true,depthWrite:false,opacity:0.7}); const p=new THREE.Points(g,m); p.frustumCulled=false; return p; }
  // ---------- 區域 ----------
  // 視距與霧（v9.3 第十八批）：區域可以要求更遠的視距（viewFar）與較晚開始的霧（fogNear）——椰林大道從中段要看得到盡頭的總圖（照片）；
  // 低畫質打 75 折。室內與沒有設定的區域照畫質預設（near 40、far＝畫質的 far）
  E.applyViewFar=function(){ const zd=E.zone&&E.zone.def; let far=E.q.far; if(zd&&!E.indoor&&zd.viewFar) far=Math.max(far,Math.round(zd.viewFar*(E.q.level==='low'?0.75:1))); scene.fog.far=far; E.fogFar=far; scene.fog.near=(zd&&!E.indoor&&zd.fogNear)||40; camera.far=far+40; camera.updateProjectionMatrix(); if(E.sky){ E.sky.scale.setScalar((camera.far-10)/120); } };
  E.loadZone=function(zoneDef,spawn){ if(E.zone){ scene.remove(E.zone.group); disposeGroup(E.zone.group); for(const n of E.npcs){ scene.remove(n.obj); if(CHAR.release) CHAR.release(n.obj); } for(const x of E.extras) scene.remove(x.obj); } E.npcs=[]; E.extras=[]; E.colliders=[]; E.interactables=[]; E.lampGlows=[]; E.seats=[]; E.exits=[];
    const z=zoneDef.build(E); z.def=zoneDef; E.zone=z; if(P3.mergeStatic&&!zoneDef.noMerge){ const t0=performance.now(); const n=P3.mergeStatic(z.group); z.mergedCount=n; z.mergeMs=performance.now()-t0; } scene.add(z.group); E.roadMats=[]; z.group.traverse(o=>{ if(o.isMesh&&o.material){ for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(m.userData&&m.userData.seeThrough) patchSeeThrough(m); if(m.map&&m.map.userData&&m.map.userData.asphalt&&E.roadMats.indexOf(m)<0) E.roadMats.push(m); } } }); E.nav=z.nav; if(E.nav) E.nav._cm=null; E.indoor=!!zoneDef.indoor; E.applyViewFar(); E.cam.distTarget=E.indoor?(zoneDef.camDist||3.8):(zoneDef.camDist||6.0); E.cam.pitch=E.indoor?0.38:0.22;
    if(E.player){ const sp=spawn||z.spawn||{x:0,z:0,yaw:0}; E.player.obj.position.set(sp.x,0,sp.z); E.player.obj.rotation.y=sp.yaw||0; let moved=false; if(E.unstick(E.player,16)){ moved=true; console.warn('spawn was inside a blocked cell:',zoneDef.id,sp); } if(E.nav&&!canStand(E.player.obj.position.x,E.player.obj.position.z,0.3)){ moved=true; /* 舊存檔的位置在區域改版後落在新建築裡（8 m 內沒有空地）：擴大搜尋，再不行就回到區域預設出生點 */ if(!(E.unstick(E.player,90)&&canStand(E.player.obj.position.x,E.player.obj.position.z,0.3))&&z.spawn) E.player.obj.position.set(z.spawn.x,0,z.spawn.z); console.warn('spawn relocated (old layout):',zoneDef.id,sp,'→',E.player.obj.position.x.toFixed(1),E.player.obj.position.z.toFixed(1)); } /* 移過去的空地要走得到區域出生點（不能是新建築後面的封閉小空地，否則玩家被關在裡面）*/ if(moved&&E.nav&&z.spawn){ const p=E.player.obj.position; if(Math.hypot(p.x-z.spawn.x,p.z-z.spawn.z)>1&&!E.nav.path(p.x,p.z,z.spawn.x,z.spawn.z)){ console.warn('relocated spot is cut off → zone spawn:',zoneDef.id,p.x.toFixed(1),p.z.toFixed(1)); p.set(z.spawn.x,0,z.spawn.z); } } E.lastSpawn={zone:zoneDef.id,x:sp.x,z:sp.z,fixed:[+E.player.obj.position.x.toFixed(2),+E.player.obj.position.z.toFixed(2)]}; E.player.path=null; E.player.target=null; E.cam.yaw=(sp.yaw||0)+Math.PI; E.cam.target.copy(E.player.obj.position); tmpV.copy(E.player.obj.position); tmpV.y+=1.4; camera.position.copy(tmpV).add(new THREE.Vector3(Math.sin(E.cam.yaw)*E.cam.distTarget*Math.cos(E.cam.pitch),Math.sin(E.cam.pitch)*E.cam.distTarget,Math.cos(E.cam.yaw)*E.cam.distTarget*Math.cos(E.cam.pitch))); }
    E.applyTime(E.hour); E.setLamps(E.lampsOn); if(E.zone.onWeather) E.zone.onWeather(E.weather); if(E.rain) E.rain.visible=(E.weather==='rain'&&!E.indoor); return z; };
  function disposeGroup(g){ g.traverse(o=>{ if(o.geometry&&!o.geometry.userData.shared) o.geometry.dispose(); }); }
  // ---------- 實體 ----------
  E.setPlayer=function(obj){ if(E.player) scene.remove(E.player.obj); E.player={obj,speed:0,path:null,target:null,pose:'idle',run:false,busy:false,radius:0.32}; scene.add(obj); };
  E.addNPC=function(n){ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.timer=0; n.lodPhase=E.npcs.length; scene.add(n.obj); E.npcs.push(n); return n; };
  E.addExtra=function(x){ scene.add(x.obj); E.extras.push(x); };
  E.removeNPC=function(n){ scene.remove(n.obj); if(CHAR.release) CHAR.release(n.obj); E.npcs=E.npcs.filter(m=>m!==n); };
  // ---------- 輸入 ----------
  const input={keys:{},joy:{x:0,y:0,active:false},drag:null,pinch:null,tap:null,runToggle:false};
  E.input=input;
  function setupInput(){ const c=E.canvas; addEventListener('keydown',e=>{ input.keys[e.key.toLowerCase()]=true; if(e.key==='Shift') input.runToggle=true; }); addEventListener('keyup',e=>{ input.keys[e.key.toLowerCase()]=false; if(e.key==='Shift') input.runToggle=false; });
    const pts=new Map();
    c.addEventListener('pointerdown',e=>{ if(E.paused) return; try{ c.setPointerCapture(e.pointerId); }catch(err){} pts.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:e.timeStamp||performance.now(),moved:false}); if(pts.size===2){ const [a,b]=[...pts.values()]; input.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),dist:E.cam.distTarget}; } });
    c.addEventListener('pointermove',e=>{ const p=pts.get(e.pointerId); if(!p) return; const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY; if(Math.hypot(e.clientX-p.sx,e.clientY-p.sy)>12) p.moved=true; if(pts.size===2&&input.pinch){ const [a,b]=[...pts.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); E.cam.distTarget=Math.max(E.indoor?2.2:3.2,Math.min(E.indoor?6:11,input.pinch.dist*(input.pinch.d/Math.max(1,d)))); return; } if(pts.size===1&&p.moved){ E.cam.yaw-=dx*0.0075; E.cam.pitch=Math.max(0.06,Math.min(1.05,E.cam.pitch+dy*0.005)); E.cam.manualT=1.5; } });
    const up=e=>{ const p=pts.get(e.pointerId); if(!p) return; pts.delete(e.pointerId); if(pts.size<2) input.pinch=null; const dtms=(e.timeStamp||performance.now())-p.t; E.lastTapInfo={moved:p.moved,dtms,rest:pts.size}; if(!p.moved&&pts.size===0){ input.tap={x:e.clientX,y:e.clientY}; } }; // 沒有拖曳就算點擊（不看按多久：低幀率手機上 handler 間隔可能很長） // 用事件時間戳（低幀率時 handler 之間可能隔很久）
    c.addEventListener('pointerup',up); c.addEventListener('pointercancel',up); c.addEventListener('contextmenu',e=>e.preventDefault()); }
  E.screenToGround=function(x,y){ E.ndc.set(x/E.w*2-1,-(y/E.h)*2+1); E.ray.setFromCamera(E.ndc,camera); const hit=new THREE.Vector3(); if(E.ray.ray.intersectPlane(E.groundPlane,hit)) return hit; return null; };
  E.screenRay=function(x,y){ E.ndc.set(x/E.w*2-1,-(y/E.h)*2+1); E.ray.setFromCamera(E.ndc,camera); return E.ray; };
  // ---------- 更新 ----------
  E.onTapGround=null; E.onInteractNear=null; E.frame=0;
  E.update=function(dt){ E.time+=dt; E.frame++; const P=E.player; if(!P) return;
    // 點擊
    if(input.tap&&!E.paused){ const tp=input.tap; input.tap=null; let handled=false; if(E.onTap) handled=E.onTap(tp); if(!handled&&!P.busy&&E.cam.mode==='follow'){ const hit=E.screenToGround(tp.x,tp.y); if(hit&&E.nav){ E.moveTo(P,hit.x,hit.z); P.run=Math.hypot(hit.x-P.obj.position.x,hit.z-P.obj.position.z)>16||input.runToggle; if(E.onTapGround) E.onTapGround(hit); } } }
    // 直接操控
    let mv=tmpV.set(0,0,0); if(!P.busy&&E.cam.mode==='follow'){ if(input.keys['w']||input.keys['arrowup']) mv.z-=1; if(input.keys['s']||input.keys['arrowdown']) mv.z+=1; if(input.keys['a']||input.keys['arrowleft']) mv.x-=1; if(input.keys['d']||input.keys['arrowright']) mv.x+=1; if(input.joy.active){ mv.x+=input.joy.x; mv.z+=input.joy.y; } }
    const spdWalk=1.45, spdRun=4.1; let moving=false;
    if(mv.lengthSq()>0.02){ mv.normalize(); const ang=E.cam.yaw; const dx=mv.x*Math.cos(ang)-mv.z*Math.sin(ang); const dz=mv.x*Math.sin(ang)+mv.z*Math.cos(ang); const run=input.runToggle||input.joy.run||P.runHold; const sp=run?spdRun:spdWalk; P.path=null; P.target=null; stepEntity(P,dx,dz,sp,dt); moving=true; P.pose=run?'run':'walk'; P.speed=sp; }
    else if(P.path){ const t=P.path[0]; const dx=t[0]-P.obj.position.x, dz=t[1]-P.obj.position.z; const d=Math.hypot(dx,dz); if(d<0.25){ P.path.shift(); if(!P.path.length){ P.path=null; if(P.onArrive){ const f=P.onArrive; P.onArrive=null; f(); } } } else { const sp=P.run?spdRun:spdWalk; stepEntity(P,dx/d,dz/d,sp,dt); moving=true; P.pose=P.run?'run':'walk'; P.speed=sp; } }
    if(!moving){ if(P.pose==='walk'||P.pose==='run'){ P.pose='idle'; } P.speed=0; }
    CHAR.animate(P.obj,dt,{pose:P.busy?P.pose:(P.pose),speed:P.speed,handsPockets:P.pocketsIdle&&P.pose==='idle',lookAt:P.lookAt});
    // NPC
    camera.updateMatrixWorld(); _frM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse); _fr.setFromProjectionMatrix(_frM); for(const n of E.npcs){ updateNPC(n,dt); }
    for(const x of E.extras){ if(x.update) x.update(dt); }
    // 鏡頭
    updateCamera(dt); if(E.sky){ E.sky.position.copy(camera.position); E.sky.material.uniforms.time.value=E.time; } if(E.skyline){ E.skyline.position.set(camera.position.x,0,camera.position.z); E.skyline.visible=!E.indoor; }
    // 雨
    if(E.rain&&E.rain.visible){ const pos=E.rain.geometry.attributes.position; const cx=P.obj.position.x, cz=P.obj.position.z; for(let i=0;i<pos.count;i++){ let y=pos.getY(i)-dt*14; if(y<0){ y=16+Math.random()*4; pos.setX(i,cx+(Math.random()-0.5)*40); pos.setZ(i,cz+(Math.random()-0.5)*40); } pos.setY(i,y); } pos.needsUpdate=true; }
    if(E.zone&&E.zone.update) E.zone.update(dt,E); if(typeof W3!=='undefined'&&W3.updateWind) W3.updateWind(E.time);
    if(E.frame%5===0) E.applyTime(E.hour);
  };
  function stepEntity(ent,dx,dz,sp,dt){ const o=ent.obj; const nx=o.position.x+dx*sp*dt, nz=o.position.z+dz*sp*dt; const r=ent.radius||0.3; // 圓形碰撞（對導航格）
    ent.blockedAt=null; if(E.nav){ const mx=Math.abs(dx*sp*dt)>1e-4, mz=Math.abs(dz*sp*dt)>1e-4; // 滑動只在那個方向真的有位移時才算（沿著床邊直走時 dx=0，舊版會「滑動成功」但原地不動）
      if(canStand(nx,nz,r)||escapeOK(ent,nx,nz,r)) { o.position.x=nx; o.position.z=nz; } else if(mx&&canStand(nx,o.position.z,r)) { o.position.x=nx; ent.blockedAt={x:nx,z:nz,slide:'x'}; } else if(mz&&canStand(o.position.x,nz,r)) { o.position.z=nz; ent.blockedAt={x:nx,z:nz,slide:'z'}; } else { ent.blockedAt={x:nx,z:nz,slide:'none'};
        // 擦到家具或格子的角：前進方向再往左或右偏一點（最多 0.48 m，導航格是 0.5 m）就過得去時，往空的那一側讓開（正面撞平的牆時偏移也過不去，不會亂滑）
        const px=-dz, pz=dx; let side=0; for(const e of [0.08,0.16,0.24,0.32,0.4,0.48]){ if(canStand(nx+px*e,nz+pz*e,r)){ side=1; break; } if(canStand(nx-px*e,nz-pz*e,r)){ side=-1; break; } }
        if(side){ const lat=Math.min(0.18,sp*dt*0.8), lx=o.position.x+px*side*lat, lz=o.position.z+pz*side*lat; if(canStand(lx,lz,r)){ o.position.x=lx; o.position.z=lz; ent.blockedAt.slide='corner'; } }
        // 還是過不去（v9.3 #31：宿舍書桌後面的窄縫，玩家沿牆滑進去之後，往哪個正方向推都過不去，永久卡住）：前進方向往左右各偏 30°／50°／70° 試一步，
        // 站得住就走。每個方向都還有往前的分量；正面頂著平的牆或在牆角時這些方向都過不去，所以不會亂滑；只移到站得住的位置，不穿牆。
        // 目前位置本身站不住（卡在阻擋格裡）時不用這個，交給 escapeOK（否則可能從阻擋格被帶進另一個小空隙）
        else if(!stuckIn(ent)){ const st=Math.hypot(nx-o.position.x,nz-o.position.z); for(const a of [0.52,-0.52,0.87,-0.87,1.22,-1.22]){ const c=Math.cos(a), sn=Math.sin(a), rx=dx*c-dz*sn, rz=dx*sn+dz*c, tx=o.position.x+rx*st, tz=o.position.z+rz*st; if(canStand(tx,tz,r)){ o.position.x=tx; o.position.z=tz; ent.blockedAt.slide='turn'; break; } } } } } else { o.position.x=nx; o.position.z=nz; }
    const targetYaw=Math.atan2(dx,dz); let d=targetYaw-o.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); o.rotation.y+=d*Math.min(1,dt*12); }
  function canStand(x,z,r){ const n=E.nav; if(!n) return true; return n.free(x,z)&&n.free(x+r,z)&&n.free(x-r,z)&&n.free(x,z+r)&&n.free(x,z-r); }
  // 卡在阻擋格裡（例如舊存檔的位置、資料錯誤）時，允許往任何方向移動，走出去就恢復正常碰撞
  function freeScore(x,z,r){ const n=E.nav; if(!n) return 5; return (n.free(x,z)?1:0)+(n.free(x+r,z)?1:0)+(n.free(x-r,z)?1:0)+(n.free(x,z+r)?1:0)+(n.free(x,z-r)?1:0); }
  function stuckIn(ent){ const n=E.nav; if(!n) return false; const o=ent.obj.position; return !canStand(o.x,o.z,ent.radius||0.3); }
  // 目前位置本身就不合法（起身位置太靠近桌子、舊存檔、資料錯誤）時：允許「不會變更糟」的移動，讓玩家走出來；不允許穿牆（分數變低的方向仍擋）
  function escapeOK(ent,nx,nz,r){ const o=ent.obj.position; return stuckIn(ent)&&freeScore(nx,nz,r)>=freeScore(o.x,o.z,r); }
  E.canStand=canStand; E.freeScore=freeScore;
  // 測試用（tests/reachability_all.py）：用和玩家完全一樣的找路（nav.path）＋移動碰撞（stepEntity）模擬從 (x0,z0) 走到 (x1,z1)；
  // 不畫面、不動到真正的玩家。連續 4 秒（模擬時間）沒有前進 0.25 m 就算卡住，回傳卡住的位置
  E.simWalk=function(x0,z0,x1,z1,opts){ opts=opts||{}; const r=opts.radius||(E.player&&E.player.radius)||0.32, dt=opts.dt||1/30, sp=opts.speed||1.45;   /* 1.45＝E.update 的 spdWalk（走路速度）*/ const ent={obj:{position:new THREE.Vector3(x0,0,z0),rotation:{y:0}},radius:r};
    const p=E.nav?E.nav.path(x0,z0,x1,z1):[[x1,z1]]; if(!p||!p.length) return {ok:false,reason:'no-path'}; ent.path=p.map(q=>[q[0],q[1]]); let ax=x0, az=z0, still=0; const maxSteps=Math.ceil((Math.hypot(x1-x0,z1-z0)*4+30)/(sp*dt));
    for(let i=0;i<maxSteps;i++){ const t=ent.path[0]; const o=ent.obj.position; const dx=t[0]-o.x, dz=t[1]-o.z, d=Math.hypot(dx,dz); if(d<0.25){ ent.path.shift(); if(!ent.path.length) return {ok:true,steps:i,x:+o.x.toFixed(2),z:+o.z.toFixed(2),n:p.length}; continue; }
      stepEntity(ent,dx/d,dz/d,sp,dt); if(Math.hypot(o.x-ax,o.z-az)>0.25){ ax=o.x; az=o.z; still=0; } else if(++still>Math.ceil(4/dt)) return {ok:false,reason:'stuck',x:+o.x.toFixed(2),z:+o.z.toFixed(2),path:p.map(q=>[+q[0].toFixed(2),+q[1].toFixed(2)])}; }
    const o=ent.obj.position; return {ok:false,reason:'timeout',x:+o.x.toFixed(2),z:+o.z.toFixed(2)}; };
  E.unstick=function(ent,maxR){ const n=E.nav; if(!n||!ent) return false; const o=ent.obj.position; if(canStand(o.x,o.z,0.3)) return false; const nf=n.nearestFree(o.x,o.z,maxR||16); if(!nf) return false; // 找一個四周也能站的格子
    let best=null; const [cx,cz]=n.toCell(o.x,o.z); for(let r=1;r<=(maxR||16)&&!best;r++){ for(let dz=-r;dz<=r&&!best;dz++) for(let dx=-r;dx<=r;dx++){ if(Math.max(Math.abs(dx),Math.abs(dz))!==r) continue; const [wx,wz]=n.toWorld(cx+dx,cz+dz); if(canStand(wx,wz,0.3)){ best=[wx,wz]; break; } } } if(!best) best=nf; o.x=best[0]; o.z=best[1]; console.warn('unstick →',best); return true; };
  E.moveTo=function(ent,x,z,onArrive){ if(!E.nav){ ent.path=[[x,z]]; ent.onArrive=onArrive; return true; } const p=E.nav.path(ent.obj.position.x,ent.obj.position.z,x,z); if(p&&p.length){ ent.path=p; ent.onArrive=onArrive; return true; } ent.path=null; return false; };
  const _fr=new THREE.Frustum(), _frM=new THREE.Matrix4(), _frS=new THREE.Sphere();
  function updateNPC(n,dt){ const o=n.obj; n.timer-=dt; let moving=false;
    if(n.beh==='chat'&&n.chatWith){ if(!(E.player&&E.player.busy)){ const c=n.chatWith.obj; const ty=Math.atan2(c.position.x-o.position.x,c.position.z-o.position.z); let dd=ty-o.rotation.y; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); if(Math.abs(dd)>0.05) o.rotation.y+=dd*Math.min(1,dt*3); if(!n.lookAt||n.lookAt!==c.position) n.lookAt=c.position; } if(n.chatLead&&!(E.player&&E.player.busy)&&n.timer<=0){ const b=n.chatWith; const aTalks=n.pose!=='talk'; n.pose=aTalks?'talk':'idle'; n.idlePose=n.pose; b.pose=aTalks?'idle':'talk'; b.idlePose=b.pose; n.timer=1.8+Math.random()*3.5; } }
    else if((n.beh==='follow'&&E.player)||(n.beh==='buddy'&&n.buddy)){ const Pp=n.beh==='buddy'?n.buddy.obj:E.player.obj; const side=n.side||1; const yaw=Pp.rotation.y; const fx=Math.sin(yaw), fz=Math.cos(yaw); const rx=Math.cos(yaw), rz=-Math.sin(yaw); const off=n.followOff||0.95; const tx=Pp.position.x+rx*side*off-fx*0.3, tz=Pp.position.z+rz*side*off-fz*0.3; const d=Math.hypot(tx-o.position.x,tz-o.position.z); const ps=(n.beh==='buddy'?n.buddy.speed:E.player.speed)||0;
      if(d>0.4&&(ps>0||d>1.7)){ let sp; if(d>6) sp=4.2; else if(d>2.4) sp=Math.max(ps,2.2); else sp=ps>0?ps*Math.min(1.4,0.85+d*0.35):1.45; stepEntity(n,(tx-o.position.x)/d,(tz-o.position.z)/d,Math.min(sp,4.2),dt); moving=true; n.pose=sp>3?'run':'walk'; n.speed=sp; n.faceYaw=null; }
      else { if(ps>0) n.faceYaw=yaw; else if(n.faceYaw==null||Math.random()<0.002) n.faceYaw=Math.atan2(Pp.position.x-o.position.x,Pp.position.z-o.position.z)*0.5+yaw*0.5; } }
    else if(n.path){ const t=n.path[0]; const dx=t[0]-o.position.x, dz=t[1]-o.position.z; const d=Math.hypot(dx,dz); if(d<0.3){ n.path.shift(); if(!n.path.length){ n.path=null; if(n.onArrive){ const f=n.onArrive; n.onArrive=null; f(n); } } } else { const sp=n.run?4.0:(n.walkSpeed||1.35); stepEntity(n,dx/d,dz/d,sp,dt); moving=true; n.pose=n.run?'run':'walk'; n.speed=sp; } }
    else if(n.beh==='wander'&&n.timer<=0&&!n.frozen){ const w=n.waypoints; if(w&&w.length){ const wp=w[(Math.random()*w.length)|0]; E.moveTo(n,wp[0]+(Math.random()-0.5)*1.5,wp[1]+(Math.random()-0.5)*1.5); n.timer=4+Math.random()*8; } }
    else if(n.beh==='route'&&!n.path&&n.timer<=0&&!n.frozen){ const w=n.waypoints; if(w&&w.length){ n.ri=((n.ri||0)+1)%w.length; const wp=w[n.ri]; E.moveTo(n,wp[0],wp[1]); n.timer=n.pauseAt?1+Math.random()*3:0; } }
    if(!moving&&(n.pose==='walk'||n.pose==='run')){ n.pose=n.idlePose||'idle'; n.speed=0; }
    // 打招呼：認識的人靠近時揮手
    if(n.greet&&E.player){ n.greetCd=(n.greetCd||0)-dt; const pp=E.player.obj.position; const d=Math.hypot(pp.x-o.position.x,pp.z-o.position.z); if(!n.frozen&&!E.player.busy&&n.greetCd<=0&&d<3.4&&!n.waveT){ if(n.path&&d>2.2){} else { n.waveT=1.9; n.greetCd=50; n.lookAt=pp; CHAR.setExpr(o,'smile'); if(E.onGreet) E.onGreet(n); } } if(n.waveT>0){ n.waveT-=dt; if(!moving) n.pose='wave'; if(n.waveT<=0){ n.waveT=0; n.pose=n.idlePose||'idle'; n.lookAt=null; CHAR.setExpr(o,'normal'); } } }
    if(!moving&&n.faceYaw!=null&&!n.frozen){ let d=n.faceYaw-o.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); o.rotation.y+=d*Math.min(1,dt*6); }
    // 距離 LOD：遠處路人不畫、動畫降頻
    const cd=Math.hypot(camera.position.x-o.position.x,camera.position.z-o.position.z); const lim=E.q.level==='low'?34:(E.q.level==='high'?95:60); _frS.center.set(o.position.x,o.position.y+0.9,o.position.z); _frS.radius=1.3; const vis=(cd<lim||!n.isExtra)&&_fr.intersectsSphere(_frS); /* 畫面外的人不畫也不更新骨架（VRM 人物 frustumCulled 關掉，所以在這裡做）*/ if(o.visible!==vis) o.visible=vis; if(!vis) return; if(cd>28&&(E.frame+(n.lodPhase||0))%2) { n._skipDt=(n._skipDt||0)+dt; return; } const adt=dt+(n._skipDt||0); n._skipDt=0;
    CHAR.animate(o,adt,{pose:n.pose,speed:n.speed,handsPockets:n.pockets&&n.pose==='idle',lookAt:n.lookAt}); }
  // ---------- 樹幹透視 ----------
  // 跟隨鏡頭時，擋在鏡頭和玩家之間的樹幹、電線桿，在玩家周圍（直立的橢圓，高約玩家身高的 1.2 倍）變成網點透空（鏡頭本身不動、碰撞不變）；離鏡頭 1.7 m 內的部分也透空。
  // 只作用在 userData.seeThrough 的材質（大王椰子、行道樹樹幹、電線桿）。用 shader 判斷，所以區域合併過的靜態網格也適用。
  const ST={uSeeP:{value:new THREE.Vector3(-1e4,-1e4,0)},uSeeR:{value:0}}; const _stA=new THREE.Vector3(), _stB=new THREE.Vector3(), _stS=new THREE.Vector2();
  const ST_GLSL='uniform vec3 uSeeP; uniform float uSeeR;\nconst float ST_B[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);\nvoid main() {\n'+
    '\tif(uSeeR>0.0){ float stF=0.0; if(gl_FragCoord.z<uSeeP.z){ vec2 stV=gl_FragCoord.xy-uSeeP.xy; float stD=length(vec2(stV.x*2.0,stV.y))/uSeeR; stF=0.85*smoothstep(1.0,0.75,stD); }\n'+
    '\t\tstF=max(stF,smoothstep(1.7,0.8,length(vViewPosition)));\n'+
    '\t\tif(stF>0.0){ int stI=int(mod(gl_FragCoord.x,4.0))*4+int(mod(gl_FragCoord.y,4.0)); if((ST_B[stI]+0.5)/16.0<stF) discard; } }\n';
  function patchSeeThrough(m){ if(!m||m.userData._st||!(m.isMeshStandardMaterial||m.isMeshPhysicalMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial)) return; m.userData._st=true; const prev=m.onBeforeCompile;
    m.onBeforeCompile=function(sh,r){ if(prev) prev.call(this,sh,r); sh.uniforms.uSeeP=ST.uSeeP; sh.uniforms.uSeeR=ST.uSeeR; sh.fragmentShader=sh.fragmentShader.replace('void main() {',ST_GLSL); };
    const pk=m.customProgramCacheKey; m.customProgramCacheKey=function(){ return (pk?pk.call(this):'')+'|seeThrough1'; }; m.needsUpdate=true; }
  E.patchSeeThrough=patchSeeThrough;
  function updateSeeThrough(){ const P=E.player; if(!P||E.cam.mode!=='follow'||E.indoor){ ST.uSeeR.value=0; return; }
    const o=P.obj.position; _stA.set(o.x,o.y+0.9,o.z).project(camera); if(_stA.z>1||_stA.z<-1){ ST.uSeeR.value=0; return; }
    renderer.getDrawingBufferSize(_stS); _stB.set(o.x,o.y+1.75,o.z).project(camera); const top=_stB.y; _stB.set(o.x,o.y+0.05,o.z).project(camera); const ph=Math.abs(top-_stB.y)*0.5*_stS.y; // 玩家在畫面上的高度（像素）
    ST.uSeeP.value.set((_stA.x*0.5+0.5)*_stS.x,(_stA.y*0.5+0.5)*_stS.y,_stA.z*0.5+0.5); ST.uSeeR.value=Math.max(20,ph*0.62); }
  E.seeThrough=ST;
  function updateCamera(dt){ const C=E.cam; const P=E.player; if(C.mode==='cinematic'&&C.cine){ const s=C.cine; camera.position.lerp(s.pos,Math.min(1,dt*4)); C.look=C.look||new THREE.Vector3(); C.look.lerp(s.look,Math.min(1,dt*4)); camera.lookAt(C.look); if(E.zone&&E.zone.fadeWalls) E.zone.fadeWalls(camera,P.obj.position); ST.uSeeR.value=0; return; }
    C.dist+=(C.distTarget-C.dist)*Math.min(1,dt*4); if(C.manualT>0) C.manualT-=dt; C.target.lerp(tmpV2.copy(P.obj.position).add(tmpV3.set(0,1.45,0)),Math.min(1,dt*7));
    const desired=tmpV.set(Math.sin(C.yaw)*C.dist*Math.cos(C.pitch),Math.sin(C.pitch)*C.dist+0.2,Math.cos(C.yaw)*C.dist*Math.cos(C.pitch)).add(C.target);
    // 鏡頭碰撞：對建築碰撞盒
    let dist=C.dist; if(E.colliders.length){ const dir=tmpV3.copy(desired).sub(C.target); const len=dir.length(); dir.normalize(); E.ray.set(C.target,dir); E.ray.far=len; const hits=E.ray.intersectObjects(E.colliders,false); if(hits.length){ dist=Math.max(0.7,hits[0].distance-0.35); desired.copy(C.target).addScaledVector(dir,dist); } }
    if(desired.y<0.6) desired.y=0.6; camera.position.lerp(desired,Math.min(1,dt*(C.manualT>0?18:7))); camera.lookAt(C.target.x,C.target.y-0.15,C.target.z); if(E.zone&&E.zone.fadeWalls) E.zone.fadeWalls(camera,P.obj.position); camera.updateMatrixWorld(); updateSeeThrough(); }
  E.cinematic=function(pos,look){ if(E.cam.mode!=='cinematic'||!E.cam.look){ /* 從目前的視線方向開始平滑轉過去（舊版注視點從世界原點出發，第一次運鏡會甩頭） */ const fwd=new THREE.Vector3(); camera.getWorldDirection(fwd); E.cam.look=camera.position.clone().addScaledVector(fwd,Math.max(1,camera.position.distanceTo(look))); } E.cam.mode='cinematic'; E.cam.cine={pos:pos.clone(),look:look.clone()}; };
  E.endCinematic=function(){ E.cam.mode='follow'; E.cam.cine=null; };
  E.nearestInteractable=function(){ const P=E.player; if(!P) return null; let best=null, bd=1e9; const occupied=(st)=>E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.35); for(const it of E.interactables){ if(it.hidden) continue; if(it.seat&&occupied(it.seat)) continue; /* 有人坐的位子不能再坐，也不能擋住和那個人說話 */ const d=Math.hypot(it.x-P.obj.position.x,it.z-P.obj.position.z); if(d<(it.radius||1.8)&&d<bd){ bd=d; best=it; } } for(const n of E.npcs){ if(!n.talk||n.hidden) continue; const d=Math.hypot(n.obj.position.x-P.obj.position.x,n.obj.position.z-P.obj.position.z); if(d<2.2&&d-0.5<bd){ /* 人優先於旁邊的椅子 */ bd=d; best={npc:n,label:n.talkLabel||('和'+n.name+'說話'),x:n.obj.position.x,z:n.obj.position.z,onInteract:()=>n.talk(n)}; } } return best; };
  E.render=function(){ renderer.render(scene,camera); };
  E.recenter=function(){ if(E.player){ E.cam.yaw=E.player.obj.rotation.y+Math.PI; E.cam.manualT=0; } };
  E.faceEachOther=function(a,b){ const dx=b.position.x-a.position.x, dz=b.position.z-a.position.z; a.rotation.y=Math.atan2(dx,dz); b.rotation.y=Math.atan2(-dx,-dz); };
  return E;
})();

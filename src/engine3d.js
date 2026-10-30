/* ===== 引擎：渲染、時間光線、鏡頭、觸控輸入、導航格、實體與 NPC、分區載入 ===== */
'use strict';
const E3 = (function(){
  const E={}; let renderer, scene, camera, clock; const cont={}; E.q={pr:1,shadows:false,far:140,level:'medium'};
  const UP=new THREE.Vector3(0,1,0); const tmpV=new THREE.Vector3(), tmpV2=new THREE.Vector3(), tmpV3=new THREE.Vector3();
  // ---------- 導航格 ----------
  // 多樓層（v9.4 第一批，D36：使用者 2026-10-10 撤銷 D26「沒有地形高度」）：每一層一張導航格（同一個區域的各層格子大小、原點相同），
  // 每格有地板高度——y0＝這一層的基本高度；surf＝高度區塊（平台 {y}、斜坡／樓梯 {axis,ya,yb} 沿 x 或 z 線性、或 {fn(x,z)} 任意形狀＋可選的 vfn(x,z)＝畫面上的高度），後加的蓋過先加的。
  // 樓梯是「兩層都走得到、高度一樣」的格子：人物走到樓梯頂（這一層被擋、另一層走得到、高度接得上）就換到另一層；A* 也在這種格子換層。
  // 沒有設定高度的區域（surf＝null、y0＝0）行為和第二十五批完全一樣。
  const HT=0.25;                                   // 人物半徑內允許的高度差：樓梯（每階 15 cm、深 30 cm，坡度 0.5）在 0.32 m 內差 0.16 m；平台邊、樓板邊（落差 ≥ 0.3 m）站不上去
  const hStep=(d)=>0.06+0.6*d;                     // A* 相鄰格允許的高度差（0.4 m 格：0.30；對角：0.40）——樓板邊、高低差大的地方不相連
  class NavGrid{ constructor(w,h,cell,ox,oz){ this.w=w; this.h=h; this.cell=cell; this.ox=ox; this.oz=oz; this.cols=Math.ceil(w/cell); this.rows=Math.ceil(h/cell); this.b=new Uint8Array(this.cols*this.rows); this.y0=0; this.surf=null; this._h=null; }
    setFloor(y){ this.y0=y; this._h=null; this._cm=null; return this; }
    addSurf(s){ (this.surf||(this.surf=[])).push(s); this._h=null; this._cm=null; return s; }
    heightAt(x,z){ const S=this.surf; if(S){ for(let i=S.length-1;i>=0;i--){ const s=S[i]; if(x<s.x0||x>s.x1||z<s.z0||z>s.z1) continue; if(s.fn){ const v=s.fn(x,z); if(v!=null) return v; continue; } if(s.y!==undefined) return s.y; const t=s.axis==='x'?(x-s.x0)/(s.x1-s.x0):(z-s.z0)/(s.z1-s.z0); return s.ya+(s.yb-s.ya)*t; } } return this.y0; }
    // 多樓層的上層通常只有一部分有地板：先整層擋起來（fillBlocked），再開出有地板的地方（freeRect，軸對齊）
    fillBlocked(){ this.b.fill(1); this._cm=null; return this; }
    freeRect(x0,z0,x1,z1){ this._cm=null; const [c0,r0]=this.toCell(x0,z0), [c1,r1]=this.toCell(x1,z1); for(let cz=Math.max(0,r0);cz<=Math.min(this.rows-1,r1);cz++) for(let cx=Math.max(0,c0);cx<=Math.min(this.cols-1,c1);cx++){ const [wx,wz]=this.toWorld(cx,cz); if(wx>=x0-1e-6&&wx<=x1+1e-6&&wz>=z0-1e-6&&wz<=z1+1e-6) this.b[this.idx(cx,cz)]=0; } return this; }   /* 邊界剛好在格子中心時也算（浮點誤差：-3.4 會變成 -3.3999999）*/
    // 畫面上的高度（v9.4）：樓梯的斜面（有 tread／rise／low）一階一階算（人物一階一階踩上去，不是滑上斜坡）；碰撞與找路照樣用連續的斜面
    visualHeightAt(x,z){ const S=this.surf; if(S){ for(let i=S.length-1;i>=0;i--){ const s=S[i]; if(x<s.x0||x>s.x1||z<s.z0||z>s.z1) continue; if(s.fn){ const v=(s.vfn||s.fn)(x,z); if(v!=null) return v; continue; } if(s.y!==undefined) return s.y;   /* vfn：任意形狀的樓梯（萬才館大樓梯）畫面上一階一階的高度；fn 是給碰撞、找路的連續高度 */
          if(s.tread){ const lo=s.low==='z0'?s.z0:s.z1, d=s.axis==='x'?Math.abs(x-(s.low==='x0'?s.x0:s.x1)):Math.abs(z-lo), base=Math.min(s.ya,s.yb), n=Math.max(1,Math.round((Math.max(s.ya,s.yb)-base)/s.rise)); return base+Math.min(n,Math.floor(d/s.tread)+1)*s.rise; }
          const t=s.axis==='x'?(x-s.x0)/(s.x1-s.x0):(z-s.z0)/(s.z1-s.z0); return s.ya+(s.yb-s.ya)*t; } } return this.y0; }
    hArr(){ if(this._h) return this._h; const H=new Float32Array(this.cols*this.rows); for(let cz=0;cz<this.rows;cz++) for(let cx=0;cx<this.cols;cx++){ const [x,z]=this.toWorld(cx,cz); H[cz*this.cols+cx]=this.heightAt(x,z); } this._h=H; return H; }
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
    clear(x,z,r){ if(!(this.free(x,z)&&this.free(x+r,z)&&this.free(x-r,z)&&this.free(x,z+r)&&this.free(x,z-r))) return false; if(!this.surf) return true; const h=this.heightAt(x,z); return Math.abs(this.heightAt(x+r,z)-h)<=HT&&Math.abs(this.heightAt(x-r,z)-h)<=HT&&Math.abs(this.heightAt(x,z+r)-h)<=HT&&Math.abs(this.heightAt(x,z-r)-h)<=HT; }   /* 多樓層：也要高度連續 */
    clearMask(){ if(this._cm) return this._cm; const m=new Uint8Array(this.cols*this.rows); for(let cz=0;cz<this.rows;cz++) for(let cx=0;cx<this.cols;cx++){ const i=cz*this.cols+cx; if(this.b[i]) continue; const [x,z]=this.toWorld(cx,cz); if(this.clear(x,z,0.33)) m[i]=1; } this._cm=m; return m; }
    losR(x0,z0,x1,z1,r){ const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/(this.cell*0.4)); for(let i=0;i<=n;i++){ const t=i/n; if(!this.clear(x0+(x1-x0)*t,z0+(z1-z0)*t,r)) return false; } return true; }
    path(x0,z0,x1,z1){ const p=gridPath([this],x0,z0,0,x1,z1,0); return p&&p.map(q=>[q[0],q[1]]); }   // 單層：和第二十五批相同的找路（同一個 A*，見 gridPath）
  }
  // A*（第二十五批的找路，v9.4 擴充成多層）：G＝各層導航格（大小、原點相同），從第 l0 層 (x0,z0) 到第 l1 層 (x1,z1)。
  // 狀態＝(層, 格)；同一層八方向（高度要接得上），同一格在另一層也走得到而且高度一樣（共用的樓梯）可以換層。
  // 單層時和第二十五批完全一樣：先找「人物寬度過得去」的路（clearMask），沒有才退回貼邊的路；靠近障礙物多付成本；直線平滑用 losR。
  // 回傳 [x,z,層] 的點列（平滑只在同一層裡做，換層的地方一定留一個點）
  function gridPath(G,x0,z0,l0,x1,z1,l1){ const A=G[l0], B=G[l1]; if(!A||!B) return null; const cols=A.cols, rows=A.rows, N=cols*rows, L=G.length;
    const s=A.toCell(x0,z0); let e=B.toCell(x1,z1); if(B.blocked(e[0],e[1])){ const nf=B.nearestFree(x1,z1,20); if(!nf) return null; e=B.toCell(nf[0],nf[1]); } if(A.blocked(s[0],s[1])){ const nf=A.nearestFree(x0,z0,6); if(nf){ const c=A.toCell(nf[0],nf[1]); s[0]=c[0]; s[1]=c[1]; } }
    const M=N*L; const PB=gridPath._b&&gridPath._b.M===M?gridPath._b:(gridPath._b={M,g:new Float32Array(M),f:new Float32Array(M),from:new Int32Array(M),closed:new Uint8Array(M)});   /* 暫存陣列重用（search() 開頭會全部重設）：校園約 22.6 萬格，萬才館陽台加了第 1 層之後每次找路要 45 萬格×13 bytes，每次重新配置會一直觸發 GC */ const g=PB.g, f=PB.f, from=PB.from, closed=PB.closed; const open=[]; const si=l0*N+s[1]*cols+s[0], ei=l1*N+e[1]*cols+e[0]; const HW=1.1;   // HW：啟發函數略加權（路徑最多長 10%，但長距離搜尋快很多；之後還會直線平滑）
    const push=(i)=>{ open.push(i); let k=open.length-1; while(k>0){ const p=(k-1)>>1; if(f[open[p]]<=f[open[k]]) break; [open[p],open[k]]=[open[k],open[p]]; k=p; } };
    const pop=()=>{ const top=open[0]; const last=open.pop(); if(open.length){ open[0]=last; let k=0; for(;;){ let l=2*k+1, r=l+1, m=k; if(l<open.length&&f[open[l]]<f[open[m]]) m=l; if(r<open.length&&f[open[r]]<f[open[m]]) m=r; if(m===k) break; [open[m],open[k]]=[open[k],open[m]]; k=m; } } return top; };
    const Hs=G.map(n=>n.surf?n.hArr():null); const CMs=E.navLegacy?null:G.map(n=>n.clearMask()); const strictOK=(k)=>!CMs||CMs[(k/N)|0][k%N]||k===si||k===ei;   /* 起點、終點本身可以貼邊（玩家站在牆邊、目標在家具旁）*/
    const search=(strict)=>{ g.fill(1e9); f.fill(1e9); from.fill(-1); closed.fill(0); open.length=0; g[si]=0; f[si]=HW*Math.hypot(e[0]-s[0],e[1]-s[1]); open.push(si);
      let it=0; while(open.length&&it++<200000*L){   /* 校園格子約 21.8 萬格；舊的 6 萬上限在 v9.3 新增醉月湖、樹列後，霖澤館 → 校門的長路徑會找不到 */ const cur=pop(); if(cur===ei) break; if(closed[cur]) continue; closed[cur]=1; const lv=(cur/N)|0, ci=cur-lv*N, cx=ci%cols, cz=(ci/cols)|0, n=G[lv], H=Hs[lv], base=lv*N;
        for(let dz=-1;dz<=1;dz++) for(let dx=-1;dx<=1;dx++){ if(!dx&&!dz) continue; const nx=cx+dx, nz=cz+dz; if(n.blocked(nx,nz)) continue; if(dx&&dz&&(n.blocked(cx+dx,cz)||n.blocked(cx,cz+dz))) continue; const nci=nz*cols+nx, ni=base+nci; if(closed[ni]) continue; const dd=(dx&&dz)?1.414:1;
          if(H&&(Math.abs(H[nci]-H[ci])>hStep(dd*n.cell)||(dx&&dz&&(Math.abs(H[cz*cols+nx]-H[ci])>hStep(n.cell)||Math.abs(H[nz*cols+cx]-H[ci])>hStep(n.cell))))) continue;   /* 高度接不上（樓板邊、平台邊）*/
          if(strict&&!strictOK(ni)) continue; if(strict&&dx&&dz&&!(strictOK(base+nz*cols+cx)||strictOK(base+cz*cols+nx))) continue; const ng=g[cur]+dd+((!E.navLegacy&&n.near(nx,nz))?3:0); if(ng<g[ni]){ g[ni]=ng; f[ni]=ng+HW*Math.hypot(e[0]-nx,e[1]-nz); from[ni]=cur; push(ni); } }
        if(L>1) for(let l2=0;l2<L;l2++){ if(l2===lv) continue; const n2=G[l2]; if(n2.blocked(cx,cz)) continue; const H2=Hs[l2]; const h1=H?H[ci]:n.y0, h2=H2?H2[ci]:n2.y0; if(Math.abs(h1-h2)>0.05) continue; const ni=l2*N+ci; if(closed[ni]) continue; if(strict&&!strictOK(ni)) continue; const ng=g[cur]+0.01; if(ng<g[ni]){ g[ni]=ng; f[ni]=ng+HW*Math.hypot(e[0]-cx,e[1]-cz); from[ni]=cur; push(ni); } }   /* 換層（共用的樓梯格）*/ }
      return from[ei]>=0||ei===si; };
    /* v9.3 第二十五批：先找「人物寬度過得去」的路；完全沒有才退回舊的（貼邊、經過比人窄的縫的路，可能走到一半被擋住）*/ if(!(CMs&&search(true))&&!search(false)) return null;
    if(from[ei]<0&&ei!==si) return null; const cells=[]; let c=ei; while(c>=0&&c!==si){ cells.push(c); c=from[c]; } cells.reverse(); const pts=cells.map(k=>{ const lv=(k/N)|0, ci=k-lv*N, w=G[lv].toWorld(ci%cols,(ci/cols)|0); return [w[0],w[1],lv]; }); pts.push([x1,z1,l1]); // 直線平滑（只在同一層裡）
    const out=[]; let cur=[x0,z0,l0]; let i=0; while(i<pts.length){ if(pts[i][2]!==cur[2]){ out.push(pts[i]); cur=pts[i]; i++; continue; } let lim=i; while(lim+1<pts.length&&pts[lim+1][2]===cur[2]) lim++; const n=G[cur[2]]; let j=lim; while(j>i&&!(E.navLegacy?n.los(cur[0],cur[1],pts[j][0],pts[j][1]):n.losR(cur[0],cur[1],pts[j][0],pts[j][1],0.33))) j--; out.push(pts[j]); cur=pts[j]; i=j+1; } return out; }
  E.NavGrid=NavGrid;
  E.navLegacy=typeof location!=='undefined'&&/[?&]navlegacy\b/.test(location.search);   // 測試用：切回第二十五批之前的找路（證明 tests/reachability_all.py 抓得到教室卡住）
  // ---------- 初始化 ----------
  E.init=function(canvas,opts){ opts=opts||{}; E.canvas=canvas; renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'}); renderer.outputColorSpace=THREE.SRGBColorSpace; /* 色調映射（ART-POLISH 第 2 批，LAWWW2 2026-10-22）：預設 Khronos PBR Neutral（21 個同鏡頭 A/B：亮度一樣、彩度高 20～50%，陽光下的臉不再洗成灰白；docs/art-rebuild/second_ai/test_shots/tone_1022）；網址加 ?tone=aces 回到舊的 ACES。Neutral 的曝光乘 1.3：0.03～0.8 的灰平均和 ACES 一樣亮（中灰 0.18：ACES 127、Neutral 122，sRGB 8 位元）；差別在亮面：ACES 把亮的顏色洗成灰白（陽光下的臉彩度 0.15、暖色燈 0.11），Neutral 留住（0.27、0.30），亮部也比較亮（1.0：226 對 246）、暗部稍深（0.03：31 對 25）*/ E.tone=(typeof location!=='undefined'&&(location.search.match(/[?&]tone=(\w+)/)||[])[1])||'neutral'; E.toneK=E.tone==='neutral'?1.3:1; renderer.toneMapping=E.tone==='neutral'?THREE.NeutralToneMapping:THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=E.toneK; renderer.shadowMap.enabled=false; renderer.shadowMap.type=THREE.PCFShadowMap; shadowLevels(renderer.shadowMap); E.renderer=renderer;
    scene=new THREE.Scene(); E.scene=scene; camera=new THREE.PerspectiveCamera(46,1,0.1,200); E.camera=camera; clock=new THREE.Timer?null:null; E.time=0;
    E.hemi=new THREE.HemisphereLight(0xdfe9f5,0xb9a98d,0.8); scene.add(E.hemi); E.sun=new THREE.DirectionalLight(0xfff2dc,1.9); E.sun.position.set(30,50,20); scene.add(E.sun); E.sun.target.position.set(0,0,0); scene.add(E.sun.target); E.fill=new THREE.DirectionalLight(0xcfe3ff,0.35); E.fill.position.set(-20,20,-30); scene.add(E.fill);
    E.sun.shadow.mapSize.set(1024,1024); E.sun.shadow.camera.near=1; E.sun.shadow.camera.far=120; E.sun.shadow.camera.left=-22; E.sun.shadow.camera.right=22; E.sun.shadow.camera.top=22; E.sun.shadow.camera.bottom=-22; E.sun.shadow.bias=-0.0006; E.sun.shadow.normalBias=0.03;
    scene.fog=new THREE.Fog(0xdbe6ea,40,150); E.sky=makeSky(); scene.add(E.sky); E.skyline=makeSkyline(); scene.add(E.skyline);
    E.groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0); E.ray=new THREE.Raycaster(); E.ndc=new THREE.Vector2();
    E.cam={yaw:Math.PI,pitch:0.22,dist:6.0,distTarget:6.0,target:new THREE.Vector3(),mode:'follow',shake:0}; E.player=null; E.npcs=[]; E.extras=[]; E.zone=null; E.colliders=[]; E.interactables=[]; E.hour=8.5; E.weather='clear'; E.paused=false; E.lampGlows=[]; E.windowsLit=false;
    setupInput(); E.setQuality(opts.quality||'medium'); E.resize(); window.addEventListener('resize',E.resize); window.addEventListener('orientationchange',()=>{ for(const t of [60,250,600]) setTimeout(E.resize,t); }); if(window.visualViewport) window.visualViewport.addEventListener('resize',E.resize); canvas.addEventListener('webglcontextlost',()=>{ E.ctxLost=(E.ctxLost|0)+1; console.warn('WEBGL_CONTEXT_LOST',E.ctxLost); }); canvas.addEventListener('webglcontextrestored',()=>{ console.warn('WEBGL_CONTEXT_RESTORED'); scene.traverse(o=>{ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; for(const m of ms){ m.needsUpdate=true; for(const k in m){ const v=m[k]; if(v&&v.isTexture) v.needsUpdate=true; } } }); });   /* 使用者 2026-10-15「很少見：畫面大部分變黑、臉只剩面膜的形狀」——還沒重現；先記下 WebGL 有沒有掉（E.ctxLost，?debug 面板），恢復時把材質、貼圖重新上傳 */ return E; };
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
  // 黃昏調色（v9.3 提案；使用者 2026-10-18 選「預設就開」，GRADE-GOLDEN-DEFAULT，LAWWW2 2026-10-21 改）：預設就用；網址加 ?grade=off 回到原本的黃昏（比較用）。目標是參考圖 07 的 17:30——
  // 暖金色的陽光、陰影裡也偏暖（環境光從冷灰改成暖杏色）、街道盡頭的空氣有一層暖橘色的霧、天空下緣金黃。只換 17:00–18:00 這一段。
  const KEY_GOLDEN=[
    [17,'#ffbb70',2.4,24,262,'#ffd2a4','#b8845e',1.1,'#f6c294',1.1,'#7a9acb','#f6c08a','#ffd49a',0],
    [17.5,'#ffa458',2.6,18,265,'#ffc488','#a8704e',1.18,'#ffb074',1.18,'#6f8cc2','#ffae72','#ffc480',0.5],   // 路燈：最後一欄 0.5，17:30 一過就亮（和預設一樣）
    [18,'#ff9450',2.1,13,268,'#f6b088','#8f6248',1.08,'#f4a272',1.14,'#5f7fb2','#f6a070','#ffb47c',1]];
  const KEYG=KEY0.filter(r=>r[0]<17||r[0]>18).concat(KEY_GOLDEN).sort((a,b)=>a[0]-b[0]);
  E.grade=(typeof location!=='undefined'&&(location.search.match(/[?&]grade=(\w+)/)||[])[1])||'golden';   /* ?grade=off（或任何不是 golden 的值）＝原本的黃昏 */
  const c1=new THREE.Color(), c2=new THREE.Color();
  /* 半夜 00:00～04:30 用 24:00 那一列（AFTER-MIDNIGHT-1024，LAWWW2-B 2026-10-24）：原本 h<5.5 一律用 05:30 那一列（清晨的藍天、霧、路面），一過午夜天空就突然變亮；
     04:30～05:30 從夜晚接到清晨。這兩列的方位用 70°（東北，太陽還在地平線下），不會從西邊（280°）繞過南邊 */
  const nightPre=K=>{ const n=K[K.length-1].slice(1); n[3]=70; return [[0].concat(n),[4.5].concat(n)].concat(K); };
  const KEY0N=nightPre(KEY0), KEYGN=nightPre(KEYG);
  /* 影子不閃（X79，使用者 2026-10-20「有些建築旁邊影子也一直在閃爍」；BB-C 量到：陰影相機每 5 格跟著玩家移動、沒對齊陰影貼圖格子，1024 蓋 44 m，一格約 4.3 cm）：
     ①陰影相機的中心在光的平面上對齊到整格（texel snapping；three.js 的 DirectionalLight 用 lookAt、up＝(0,1,0)，右＝cross(up,d)、上＝cross(d,右)）——玩家走動時影子貼圖的格子固定在世界上；
     ②太陽的方向每 3 遊戲分鐘才換一次（顏色、亮度照舊連續）——時間流動時不會每一格都轉一點點 */
  function shadowSnap(t,d,texel){ let rx=d.z, rz=-d.x; const rl=Math.hypot(rx,rz); if(rl<1e-4){ rx=1; rz=0; } else { rx/=rl; rz/=rl; }
    const ux=d.y*rz, uy=d.z*rx-d.x*rz, uz=-d.y*rx; const r=t.x*rx+t.z*rz, u=t.x*ux+t.y*uy+t.z*uz, f=t.x*d.x+t.y*d.y+t.z*d.z;
    if(!(texel>0)) return {x:t.x,y:t.y,z:t.z}; const r2=Math.round(r/texel)*texel, u2=Math.round(u/texel)*texel;
    return {x:rx*r2+ux*u2+d.x*f, y:uy*u2+d.y*f, z:rz*r2+uz*u2+d.z*f}; }
  function sunAng(KEY,h){ const hq=Math.round(h*20)/20; let i=0; while(i<KEY.length-2&&KEY[i+1][0]<=hq) i++; const A=KEY[i], B=KEY[i+1]; const t=Math.max(0,Math.min(1,(hq-A[0])/(B[0]-A[0]))); return [(A[3]+(B[3]-A[3])*t)*Math.PI/180,(A[4]+(B[4]-A[4])*t)*Math.PI/180]; }
  E.shadowSnap=shadowSnap; E.sunAng=sunAng;
  /* 傍晚的光線照日期（ENGINE-SEASON-DUSK-1024，LAWWW2-B 2026-10-24，LAWWW-B 派工）：KEY0 一年四季同一張表，每天 18:57 左右日落；臺北 12 月 17:06 就日落、17:30 天黑。
     光線、天空、路燈、窗景（各區的 applyTime）用「光線用的時刻」lightHour：15:00→15:00、當天的日落→18.95（表上太陽 0° 的時刻）、日落＋2.05 小時（不早於 21:00）→21:00，再線性接到 24:00；15:00 以前照舊。
     時鐘（G.hour、E.hour）、作息、事件、存檔都不動。日落用 NOAA 的簡化公式（誤差幾分鐘）：臺灣＝臺北 25.03°N 121.56°E UTC+8；美國的區域（us_*）＝布魯明頓 39.17°N 86.53°W，2028-11-05 以前夏令時間 UTC−4、之後 UTC−5；日本的區域（jp_*，關西的宿舍）＝大阪 34.69°N 135.50°E UTC+9。*/
  function sunsetAt(y,m,d,lat,lon,tz){ const n=Math.round((Date.UTC(y,m-1,d)-Date.UTC(y,0,1))/864e5)+1, g=2*Math.PI/365*(n-1); const eqt=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g)); const dec=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g); const la=lat*Math.PI/180, c=(Math.sin(-0.833*Math.PI/180)-Math.sin(la)*Math.sin(dec))/(Math.cos(la)*Math.cos(dec)); return (720-4*lon-eqt+tz*60+4*Math.acos(Math.max(-1,Math.min(1,c)))*180/Math.PI)/60; }
  function lightHour(h,ss){ if(!(ss>15.5&&ss<22)||h<=15||h>=24) return h; const B=Math.max(21,ss+2.05); if(h<=ss) return 15+(h-15)*(18.95-15)/(ss-15); if(h<=B) return 18.95+(h-ss)*(21-18.95)/(B-ss); return 21+(h-B)*(24-21)/(24-B); }
  function sunsetPlace(key,pl){ const y=+key.slice(0,4), m=+key.slice(5,7), d=+key.slice(8,10); return pl==='us'?sunsetAt(y,m,d,39.17,-86.53,key<'2028-11-05'?-4:-5):(pl==='jp'?sunsetAt(y,m,d,34.69,135.5,9):sunsetAt(y,m,d,25.03,121.56,8)); }
  E.sunsetAt=sunsetAt; E.lightHour=lightHour; E.sunsetPlace=sunsetPlace;
  E.sunsetNow=function(){ if(E.sunsetFix!=null) return E.sunsetFix; const G=typeof GAME!=='undefined'&&GAME.G; if(!G||G.day==null||typeof CALENDAR==='undefined'||!CALENDAR.dateOf) return null; const id=(E.zone&&E.zone.def&&E.zone.def.id)||'', pl=/^us_/.test(id)?'us':(/^jp_/.test(id)?'jp':'tw'), ck=G.day+pl; if(E._ssK!==ck){ E._ssK=ck; E._ss=sunsetPlace(CALENDAR.dateOf(G.day).key,pl); } return E._ss; };   /* E.sunsetFix：測試用，直接指定日落時刻 */
  E.applyTime=function(hour){ E.hour=hour; const KEY=E.grade==='golden'?KEYGN:KEY0N; let h=lightHour(hour%24,E.sunsetNow()); E.lightH=h; if(h<KEY[0][0]) h=KEY[0][0]; let i=0; while(i<KEY.length-2&&KEY[i+1][0]<=h) i++; const A=KEY[i], B=KEY[i+1]; const t=Math.max(0,Math.min(1,(h-A[0])/(B[0]-A[0]))); const lerpC=(a,b)=>{ c1.set(a); c2.set(b); return c1.lerp(c2,t); }; const lerp=(a,b)=>a+(b-a)*t;
    E.sun.color.copy(lerpC(A[1],B[1])); E.sun.intensity=lerp(A[2],B[2]); const [el,az]=sunAng(KEY,h); const target=E.player?E.player.obj.position:new THREE.Vector3(); /* 太陽方向（v9.3 第二十一批）：azimuth 是羅盤方位（0 北、90 東、180 南）。戶外區域 x 往東、-z 往北（D25），所以 z 用 -cos；區域座標轉過方向的用 def.sunYaw（公館：+x 往南、+z 往西）。之前戶外也用 +cos：中午太陽在北邊，朝南的牆（霖澤館、萬才館正面）整天背光，台北的太陽中午一定在南邊。室內沒有方位，維持原本的方向（室內的光影是照那個方向調的）*/ let sx=Math.sin(az), sz=E.indoor?Math.cos(az):-Math.cos(az); const syw=(!E.indoor&&E.zone&&E.zone.def&&E.zone.def.sunYaw)||0; if(syw){ const cy=Math.cos(syw), sy=Math.sin(syw), x2=sx*cy+sz*sy; sz=-sx*sy+sz*cy; sx=x2; } { const ox=Math.cos(el)*sx*60, oy=Math.max(2,Math.sin(el)*60), oz=Math.cos(el)*sz*60, ol=Math.hypot(ox,oy,oz)||1, sc=E.sun.shadow.camera, tx=(sc.right-sc.left)/((E.sun.shadow.mapSize&&E.sun.shadow.mapSize.x)||1024); const T=shadowSnap(target,{x:ox/ol,y:oy/ol,z:oz/ol},tx); E.sun.position.set(T.x+ox,T.y+oy,T.z+oz); E.sun.target.position.set(T.x,T.y,T.z); } E.sun.target.updateMatrixWorld();   /* 陰影相機對齊整格（shadowSnap）*/
    E.hemi.color.copy(lerpC(A[5],B[5])); E.hemi.groundColor.copy(lerpC(A[6],B[6])); E.hemi.intensity=lerp(A[7],B[7]); scene.fog.color.copy(lerpC(A[8],B[8])); renderer.toneMappingExposure=lerp(parseFloat(A[9]),parseFloat(B[9]))*(E.toneK||1);
    const sk=E.sky.material.uniforms; sk.top.value.copy(lerpC(A[10],B[10])); sk.mid.value.copy(lerpC(A[11],B[11])); sk.bot.value.copy(lerpC(A[12],B[12])); sk.sunDir.value.copy(E.sun.position).sub(target).normalize(); sk.sunCol.value.copy(E.sun.color); sk.sunAmt.value=0.15+0.45*Math.max(0,1-Math.abs(el)/0.6);
    { // 雲與天際線：白天白雲、黃昏染上夕陽色、夜晚暗；天際線用霧的顏色做空氣感，越暗越像剪影
      const nk=h>=19.2||h<5.6?1:(h>=17.6?(h-17.6)/1.6:(h<6.4?(6.4-h)/0.8:0)); const dusk=Math.max(0,1-Math.abs(h-18.0)/1.6)*(1-nk*0.6); const elDeg=lerp(A[3],B[3]); if(typeof CHAR!=='undefined'&&CHAR.setDuskRim) CHAR.setDuskRim(E.indoor?0:Math.max(0,1-Math.abs(h-17.8)/1.0),E.sun.color);   /* 黃昏人物的暖色輪廓光（室內不用）*/
      /* 柏油路面（第二十二批改成照片的淺灰）入夜後變暗：遊戲的夜間環境光（城市夜光）會把朝上的大片淺色路面整片照亮，看起來像傍晚；真實的路面晚上只有路燈附近亮。只調柏油材質，不動全域光線 */
      if(E.roadMats&&E.roadMats.length){ const rf=1-0.42*nk; for(const m of E.roadMats) m.color.setScalar(rf); }
      const lit=new THREE.Color(0xffffff).lerp(E.sun.color,0.25+0.6*dusk); lit.lerp(new THREE.Color(0x323a52),nk*0.92); const dark=sk.top.value.clone().lerp(new THREE.Color(0xa6b0bf),0.55).lerp(new THREE.Color(0x9a7472),dusk*0.45).lerp(new THREE.Color(0x141a28),nk*0.9);
      sk.cloudLit.value.copy(lit); sk.cloudDark.value.copy(dark); sk.cover.value=0.43-0.04*dusk; sk.starAmt.value=Math.max(0,nk-0.3)*0.9;
      if(E.skyline){ const fc=scene.fog.color; const haze=fc.clone().lerp(sk.mid.value,0.35); const U=E.skyline.userData; U.mount.material.color.copy(haze).lerp(new THREE.Color(0x67798c),0.7*(1-nk)).lerp(new THREE.Color(0x8a6f80),dusk*0.3).lerp(new THREE.Color(0x232a3c),nk*0.8); U.city.material.color.copy(haze).lerp(new THREE.Color(0x6f7c8c),0.45*(1-nk)).lerp(new THREE.Color(0x7a5e6c),dusk*0.35).lerp(new THREE.Color(0x121827),nk*0.9); U.win.material.opacity=Math.max(0,Math.min(1,(nk-0.15)*1.4)); } }
    const nw=!!(E.indoor&&E.zone&&E.zone.def&&E.zone.def.windowless);   /* 沒有窗的室內（地下室、視聽室；區域 def.windowless）：整天都是白天的光——燈不切到夜間、下面室內那一段的 night／dusk／清晨色調都不用（LAWWW2-B 10-25：B1 健身房 21:00 偏藍偏暗）*/
    const lamps=!nw&&lerp(A[13],B[13])>0.5; if(lamps!==E.lampsOn){ E.lampsOn=lamps; E.setLamps(lamps); }
    if(!E.indoor&&E.zone&&E.zone.def&&E.zone.def.cityLight&&E.lampsOn){ const cl=E.zone.def.cityLight; E.hemi.intensity+=0.45*cl; E.hemi.color.lerp(new THREE.Color(0xffd9a8),0.5*cl); scene.fog.color.lerp(new THREE.Color(0x4a4058),0.4*cl); }
    if(E.indoor){ const night=!nw&&(h<6.5||h>=18); const dusk=!nw&&(h>=16.5&&h<18.4); const warm=!!(E.zone&&E.zone.warm), cool=!!(E.zone&&E.zone.cool); E.hemi.intensity=night?(warm?0.8:(cool?1.05:0.95)):(dusk?1.1:1.2); E.hemi.color.set(night?(warm?0xffdcb0:(cool?0xe6ecfa:0xfff0dc)):(dusk?0xf9e6c8:(h<8&&!nw?0xeef2f8:0xf4f1ea))); E.hemi.groundColor.set(night?0x6e5f52:(dusk?0xa08a6a:0x9a8a78)); E.sun.intensity=night?0:(dusk?0.7:0.9);   /* 室內晚上原本 0.12：太陽在地平線附近、會投影，陰影範圍的邊界在牆上留下一塊方形亮區（博雅一樓圓桌後牆，LAWWW2 10-14 C13 回報；關掉投影就不見）*/ if(E.sun.color) E.sun.color.set(dusk?0xffc07a:0xffffff); renderer.toneMappingExposure=E.toneK||1; scene.fog.far=E.q.far; if(E.zone&&E.zone.applyTime) E.zone.applyTime(h,E.weather); return; }
    if(E.zone&&E.zone.applyTimeOutdoor) E.zone.applyTimeOutdoor(h,E);
    if(E.weather==='rain'||E.weather==='cloudy'){ E.sun.intensity*=E.weather==='rain'?0.35:0.55; E.hemi.intensity*=0.9; sk.sunAmt.value*=0.2; sk.cover.value=E.weather==='rain'?0.22:0.32; sk.cloudLit.value.lerp(new THREE.Color(0xb7bec8),0.6); sk.cloudDark.value.lerp(new THREE.Color(0x6d7682),0.6); sk.top.value.lerp(new THREE.Color(0x7f8a99),0.7); sk.mid.value.lerp(new THREE.Color(0xa9b3bd),0.6); scene.fog.color.lerp(new THREE.Color(0xa9b3bd),0.5); scene.fog.far=(E.fogFar||E.q.far)*0.7; } else scene.fog.far=E.fogFar||E.q.far; };   /* v9.3 第二十批：原本這裡每次都重設成畫質預設的 E.q.far，區域的 viewFar（applyViewFar）實際上沒有生效 */
  E.setLamps=function(on){ for(const l of E.lampGlows){ l.visible=on; } if(E.zone&&E.zone.onLamps) E.zone.onLamps(on); };
  E.setWeather=function(w){ E.weather=w; if(w==='rain'){ if(!E.rain){ E.rain=makeRain(); scene.add(E.rain); } E.rain.visible=true; } else if(E.rain) E.rain.visible=false; if(E.zone&&E.zone.onWeather) E.zone.onWeather(w); E.applyTime(E.hour); };
  function makeRain(){ const n=1400; const pos=new Float32Array(n*3); for(let i=0;i<n;i++){ pos[i*3]=(Math.random()-0.5)*40; pos[i*3+1]=Math.random()*18; pos[i*3+2]=(Math.random()-0.5)*40; } const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); const c=document.createElement('canvas'); c.width=8; c.height=32; const x=c.getContext('2d'); const gr=x.createLinearGradient(0,0,0,32); gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(0.5,'rgba(220,230,255,0.8)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(3,0,2,32); const t=new THREE.CanvasTexture(c); const m=new THREE.PointsMaterial({size:0.45,map:t,transparent:true,depthWrite:false,opacity:0.7}); const p=new THREE.Points(g,m); p.frustumCulled=false; return p; }
  // ---------- 區域 ----------
  // 視距與霧（v9.3 第十八批）：區域可以要求更遠的視距（viewFar）與較晚開始的霧（fogNear）——椰林大道從中段要看得到盡頭的總圖（照片）；
  // 低畫質打 75 折。室內與沒有設定的區域照畫質預設（near 40、far＝畫質的 far）
  E.applyViewFar=function(){ const zd=E.zone&&E.zone.def; let far=E.q.far; if(zd&&!E.indoor&&zd.viewFar) far=Math.max(far,Math.round(zd.viewFar*(E.q.level==='low'?0.75:1))); scene.fog.far=far; E.fogFar=far; scene.fog.near=(zd&&!E.indoor&&zd.fogNear)||40; camera.far=far+40; camera.updateProjectionMatrix(); if(E.sky){ E.sky.scale.setScalar((camera.far-10)/120); } };
  E.loadZone=function(zoneDef,spawn){ if(E.zone){ scene.remove(E.zone.group); disposeGroup(E.zone.group); for(const n of E.npcs){ scene.remove(n.obj); if(CHAR.release) CHAR.release(n.obj); } for(const x of E.extras){ scene.remove(x.obj); if(x.rider&&CHAR.release) CHAR.release(x.rider); } }   /* 騎腳踏車的路人（BIKE.rider）的人物也要還給 VRM pool：原本只拿出場景，複製的模型一直留在 ASSETS 的 clones 裡（2026-10-14 zone_memory：校園來回一次貼圖約 +110）*/ E.npcs=[]; E.extras=[]; E.colliders=[]; E.interactables=[]; E.lampGlows=[]; E.seats=[]; E.exits=[];
    E.spawnHint=spawn||null;   /* 區域建立時看得到玩家要出現在哪裡（總圖：搭電梯換區域時，車廂要停在那一層、人在車廂裡）*/
    const z=zoneDef.build(E); z.def=zoneDef; E.zone=z; if(P3.mergeStatic&&!zoneDef.noMerge){ const t0=performance.now(); const n=P3.mergeStatic(z.group); z.mergedCount=n; z.mergeMs=performance.now()-t0; } scene.add(z.group); E.roadMats=[]; z.group.traverse(o=>{ if(o.isMesh&&o.material){ for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(m.userData&&m.userData.seeThrough) patchSeeThrough(m); if(m.map&&m.map.userData&&m.map.userData.asphalt&&E.roadMats.indexOf(m)<0) E.roadMats.push(m); } } }); E.levels=z.levels||null; if(E.levels) for(const n of E.levels) n._cm=null; E.nav=z.nav; if(E.nav) E.nav._cm=null; z.seatFit=fitSeatRadius(); E.indoor=!!zoneDef.indoor; E.applyViewFar(); E.cam.distTarget=E.indoor?(zoneDef.camDist||3.8):(zoneDef.camDist||6.0); E.cam.pitch=E.indoor?0.38:0.22; E.cam.pitchAdd=0;
    if(E.player){ const sp=spawn||z.spawn||{x:0,z:0,yaw:0}; E.player.lv=E.levels?Math.max(0,Math.min(E.levels.length-1,sp.lv|0)):0; E.nav=navOf(E.player.lv); E.player.obj.position.set(sp.x,0,sp.z); E.player.obj.rotation.y=sp.yaw||0; let moved=false; if(E.unstick(E.player,16)){ moved=true; console.warn('spawn was inside a blocked cell:',zoneDef.id,sp); } if(E.nav&&!canStand(E.player.obj.position.x,E.player.obj.position.z,0.3)){ moved=true; /* 舊存檔的位置在區域改版後落在新建築裡（8 m 內沒有空地）：擴大搜尋，再不行就回到區域預設出生點 */ if(!(E.unstick(E.player,90)&&canStand(E.player.obj.position.x,E.player.obj.position.z,0.3))&&z.spawn){ E.player.obj.position.set(z.spawn.x,0,z.spawn.z); setLv(E.player,E.levels?(z.spawn.lv|0):0); } console.warn('spawn relocated (old layout):',zoneDef.id,sp,'→',E.player.obj.position.x.toFixed(1),E.player.obj.position.z.toFixed(1)); } /* 移過去的空地要走得到區域出生點（不能是新建築後面的封閉小空地，否則玩家被關在裡面）*/ if(moved&&E.nav&&z.spawn){ const p=E.player.obj.position; if(Math.hypot(p.x-z.spawn.x,p.z-z.spawn.z)>1&&!E.pathTo(p.x,p.z,E.player.lv,z.spawn.x,z.spawn.z,z.spawn.lv|0)){ console.warn('relocated spot is cut off → zone spawn:',zoneDef.id,p.x.toFixed(1),p.z.toFixed(1)); p.set(z.spawn.x,0,z.spawn.z); setLv(E.player,E.levels?(z.spawn.lv|0):0); } } settleY(E.player); E.lastSpawn={zone:zoneDef.id,x:sp.x,z:sp.z,lv:E.player.lv|0,fixed:[+E.player.obj.position.x.toFixed(2),+E.player.obj.position.z.toFixed(2)]}; E.player.path=null; E.player.target=null; E.cam.yaw=(sp.yaw||0)+Math.PI; E.cam.target.copy(E.player.obj.position); E.cam.blend=null; tmpV.copy(E.player.obj.position); tmpV.y+=1.4; camera.position.copy(tmpV).add(new THREE.Vector3(Math.sin(E.cam.yaw)*E.cam.distTarget*Math.cos(E.cam.pitch),Math.sin(E.cam.pitch)*E.cam.distTarget,Math.cos(E.cam.yaw)*E.cam.distTarget*Math.cos(E.cam.pitch))); }
    E.applyTime(E.hour); E.setLamps(E.lampsOn); if(E.zone.onWeather) E.zone.onWeather(E.weather); if(E.rain) E.rain.visible=(E.weather==='rain'&&!E.indoor); return z; };
  /* 換區域：舊區域的幾何、材質、貼圖都釋放（2026-10-14 使用者 iPhone 試玩 v9.6：「有時候換地點…會跳出跑到進入遊戲的畫面，顯示請把手機轉為橫向」——
     原本只釋放幾何，材質和貼圖（例如校園每一條步道都複製一張路面貼圖）留在顯示記憶體裡，每換一次區域就多一批；iOS Safari 記憶體到上限會把整個網頁重新載入）。
     之後再用到同一個材質／貼圖（快取的正式模型、共用的材質），three.js 會自動重新上傳——只是第一次出現時慢一點。標了 userData.shared 的不釋放 */
  function disposeGroup(g){ const mats=new Set(), texs=new Set(), sprites=new Set(); g.traverse(o=>{ if(o.isSprite) sprites.add(o); if(o.geometry&&!o.geometry.userData.shared) o.geometry.dispose();
    const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; for(const m of ms){ if(!m||!m.isMaterial||(m.userData&&m.userData.shared)) continue; mats.add(m); for(const k in m){ const v=m[k]; if(v&&v.isTexture&&!(v.userData&&v.userData.shared)) texs.add(v); } } });
    for(const m of mats) m.dispose(); for(const t of texs) t.dispose(); if(typeof TK!=='undefined'&&TK.forget) TK.forget(mats,sprites);   /* 夜間材質、光暈的清單也拿掉這一區的（不然舊區域整套材質、canvas 都留著）*/ E.lastDispose={materials:mats.size,textures:texs.size}; }
  E.disposeGroup=disposeGroup;   /* 測試用 */
  // ---------- 實體 ----------
  E.setPlayer=function(obj){ if(E.player) scene.remove(E.player.obj); E.player={obj,speed:0,path:null,target:null,pose:'idle',run:false,busy:false,radius:0.32,lv:0}; scene.add(obj); };
  E.addNPC=function(n){ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.timer=0; n.lodPhase=E.npcs.length; n.lv=n.lv|0; /* 多樓層：坐著的放在座位的高度、其他的放在所在那一層的地板上 */ { const o=n.obj.position; if(n.seat&&n.seat.y!=null) o.y=n.seat.y; else { const nv=navOf(n.lv); if(nv&&(nv.surf||nv.y0)) o.y=nv.heightAt(o.x,o.z); } } scene.add(n.obj); E.npcs.push(n); if(n.pose==='sit'||n.pose==='read') prePose(n); return n; };
  /* 先套好姿勢再畫（2026-10-13 LAWWW2 審查：博雅 101 的聽眾出現後的前幾秒有一半是站姿、站在椅子和桌板中間）：人物建好時骨架是站姿，
     要等引擎的 updateNPC 跑過一次 CHAR.animate 才坐下——但 ① 課堂、人流、劇情加人物是在 E.update 之後、畫面之前（game3d 的每幀 tick），那一幀是站的；
     ② 在畫面外的人不跑動畫（LOD），一直是站姿；③ 晚到的正式模型換上去時（GM.upgradeModels）新的骨架也是站姿。坐著（sit／read）的人一加進來就套一次姿勢（dt 0）；
     換模型之後也套一次。測試：tests/flow_seated_spawn.py（每一幀畫之前檢查看得到的座位上的人）*/
  function prePose(n){ n.obj.updateMatrixWorld(true); CHAR.animate(n.obj,0,{pose:n.pose,speed:0,ground:groundFn(n)}); }
  E.prePose=prePose;
  E.addExtra=function(x){ scene.add(x.obj); E.extras.push(x); };
  E.removeNPC=function(n){ scene.remove(n.obj); if(CHAR.release) CHAR.release(n.obj); E.npcs=E.npcs.filter(m=>m!==n); };
  // ---------- 輸入 ----------
  const input={keys:{},joy:{x:0,y:0,active:false},drag:null,pinch:null,tap:null,runToggle:false};
  E.input=input;
  function setupInput(){ const c=E.canvas; addEventListener('keydown',e=>{ input.keys[e.key.toLowerCase()]=true; if(e.key==='Shift') input.runToggle=true; }); addEventListener('keyup',e=>{ input.keys[e.key.toLowerCase()]=false; if(e.key==='Shift') input.runToggle=false; });
    const pts=new Map();
    c.addEventListener('pointerdown',e=>{ if(E.paused) return; try{ c.setPointerCapture(e.pointerId); }catch(err){} pts.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:e.timeStamp||performance.now(),moved:false}); if(pts.size===2){ const [a,b]=[...pts.values()]; input.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),dist:E.cam.distTarget}; } });
    c.addEventListener('pointermove',e=>{ const p=pts.get(e.pointerId); if(!p) return; const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY; if(Math.hypot(e.clientX-p.sx,e.clientY-p.sy)>12) p.moved=true; if(pts.size===2&&input.pinch){ const [a,b]=[...pts.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y); E.cam.distTarget=Math.max(E.indoor?2.2:3.2,Math.min(E.indoor?6:11,input.pinch.dist*(input.pinch.d/Math.max(1,d)))); return; } if(pts.size===1&&p.moved){ E.cam.yaw-=dx*0.0075; E.cam.pitch=Math.max(0.06,Math.min(1.05,E.cam.pitch+dy*0.005)); E.cam.manualT=1.5; E.cam.dragging=true; } });
    const up=e=>{ const p=pts.get(e.pointerId); if(!p) return; pts.delete(e.pointerId); if(pts.size<2) input.pinch=null; E.cam.dragging=[...pts.values()].some(q=>q.moved);   /* 還有手指在拖鏡頭：鏡頭不自動轉開（updateCamera 的 autoSwing）*/ const dtms=(e.timeStamp||performance.now())-p.t; E.lastTapInfo={moved:p.moved,dtms,rest:pts.size}; if(!p.moved&&pts.size===0){ input.tap={x:e.clientX,y:e.clientY}; } }; // 沒有拖曳就算點擊（不看按多久：低幀率手機上 handler 間隔可能很長） // 用事件時間戳（低幀率時 handler 之間可能隔很久）
    c.addEventListener('pointerup',up); c.addEventListener('pointercancel',up); c.addEventListener('contextmenu',e=>e.preventDefault()); }
  E.screenToGround=function(x,y){ E.ndc.set(x/E.w*2-1,-(y/E.h)*2+1); E.ray.setFromCamera(E.ndc,camera); const hit=new THREE.Vector3(); if(E.ray.ray.intersectPlane(E.groundPlane,hit)) return hit; return null; };
  // 點地面（v9.4）：多樓層／有高度的區域，先打「看得到的地板」（zone.walkMeshes，userData.walkLv＝第幾層）；打不到就用玩家那一層的基本地板高度的平面
  E.screenToFloor=function(x,y){ E.ndc.set(x/E.w*2-1,-(y/E.h)*2+1); E.ray.setFromCamera(E.ndc,camera); E.ray.near=0; E.ray.far=Infinity; const P=E.player; const wm=E.zone&&E.zone.walkMeshes;
    if(wm&&wm.length){ const vis=wm.filter(m=>{ for(let o=m;o;o=o.parent){ if(!o.visible) return false; } return true; }); const hits=E.ray.intersectObjects(vis,false); if(hits.length){ const h=hits[0]; return {x:h.point.x,z:h.point.z,y:h.point.y,lv:h.object.userData.walkLv|0,obj:h.object}; } }
    const lv=P?P.lv|0:0, n=navOf(lv); const fy=n?n.y0:0; const pl=new THREE.Plane(UP,-fy); const hit=new THREE.Vector3(); if(E.ray.ray.intersectPlane(pl,hit)) return {x:hit.x,z:hit.z,y:fy,lv}; return null; };
  E.screenRay=function(x,y){ E.ndc.set(x/E.w*2-1,-(y/E.h)*2+1); E.ray.setFromCamera(E.ndc,camera); return E.ray; };
  // ---------- 更新 ----------
  E.onTapGround=null; E.onInteractNear=null; E.frame=0;
  /* 玩家沿路線走一步（點地面、劇情 walkTo 都走這裡）；回傳這一幀有沒有在走。
     點地面點到人過不去的地方（v9.7 回歸 LAWWW2：201 點到下一排長桌的邊，人的半徑 0.33 m 到不了，會靠著桌子一直原地走）：
     玩家自己點的路線（沒有 onArrive、不是劇情）連續 1.5 秒（遊戲時間）幾乎沒有前進，就放掉路線、站好。劇情的 walkTo 照舊（它有自己的 4 秒保底）。
     E.stallStop=false＝舊的做法（測試對照用）*/
  E.stallStop=true;
  function pathStep(P,dt){ const t=P.path[0]; const dx=t[0]-P.obj.position.x, dz=t[1]-P.obj.position.z; const d=Math.hypot(dx,dz);
    if(wpReached(P,d,0.25,dt)){ P.path.shift(); if(!P.path.length){ P.path=null; if(P.onArrive){ const f=P.onArrive; P.onArrive=null; f(); } } return false; }
    const sp=P.riding?E.bikeSp()*(E.fitBike||1):(P.run?E.SPD.run:E.SPD.walk*(E.fitWalk||1)), st=stepSp(sp,d,dt), x0=P.obj.position.x, z0=P.obj.position.z; stepEntity(P,dx/d,dz/d,st,dt); P.pose=P.riding?'ride':(P.run?'run':'walk'); P.speed=sp;
    if(E.stallStop&&!P.onArrive&&!P.busy&&st*dt>1e-4){ const mv=Math.hypot(P.obj.position.x-x0,P.obj.position.z-z0); P._stall=mv<st*dt*0.15?(P._stall||0)+dt:0; if(P._stall>1.5){ P._stall=0; P.path=null; return false; } }
    return true; }
  E.playerPathStep=pathStep;   /* 測試用 */
  E.update=function(dt){ E.time+=dt; E.frame++; const P=E.player; if(!P) return;
    // 點擊
    if(input.tap&&!E.paused){ const tp=input.tap; input.tap=null; let handled=false; if(E.onTap) handled=E.onTap(tp); if(!handled&&!P.busy&&E.cam.mode==='follow'){ const hit=E.screenToFloor(tp.x,tp.y); if(hit&&E.nav){ let tx=hit.x, tz=hit.z, tlv=hit.lv;
        /* 室內的樓梯（任務 #42）：點在一跑樓梯上＝走完這一跑（點的地方比腳高就走到上面那一端、比較低就走到下面那一端）。
           原本只走到點的那一點：從一樓看不到二樓的地板，只點得到前面幾階，上一層樓要點十幾次（萬才館 14 次、霖澤館 16 次）*/
        const se=hit.obj&&hit.obj.userData.stairEnds; if(se){ const e2=se[hit.y>=P.obj.position.y-0.05?1:0]; tx=e2.x; tz=e2.z; tlv=e2.lv; }
        if(!se&&E.tapRedirect){ const r=E.tapRedirect(tx,tz,tlv==null?(P.lv|0):tlv); if(r){ tx=r[0]; tz=r[1]; if(r[2]!=null) tlv=r[2]; } }   /* 點在椅子上＝走到那張椅子坐下前站的位置（game3d.js；2026-10-14 v9.6 回歸：點椅子那一格不能站，找路改去最近能站的地方，人走到 2 m 外別張椅子旁邊）*/
        E.moveTo(P,tx,tz,null,tlv); P.tapPref={x:hit.x,z:hit.z,lv:tlv==null?(P.lv|0):tlv,zone:E.zone&&E.zone.id};   /* 點的那個位置：走到以後，範圍重疊的互動以離點的位置最近的為準（nearestInteractable；BB-C 10-28 main_day12：點床走過去，停在床底下紙箱那一側，按鈕是紙箱不是睡覺）*/ P.run=Math.hypot(tx-P.obj.position.x,tz-P.obj.position.z)>16||input.runToggle; if(E.onTapGround) E.onTapGround(Object.assign({},hit,{x:tx,z:tz,lv:tlv})); } } }
    // 直接操控
    let mv=tmpV.set(0,0,0); if(!P.busy&&E.cam.mode==='follow'){ if(input.keys['w']||input.keys['arrowup']) mv.z-=1; if(input.keys['s']||input.keys['arrowdown']) mv.z+=1; if(input.keys['a']||input.keys['arrowleft']) mv.x-=1; if(input.keys['d']||input.keys['arrowright']) mv.x+=1; if(input.joy.active){ mv.x+=input.joy.x; mv.z+=input.joy.y; } }
    const spdWalk=E.SPD.walk, spdRun=E.SPD.run; let moving=false;
    E.cam.ctl=mv.lengthSq()>0.02; if(!E.cam.ctl) E.cam.swingAcc=0; else P.tapPref=null;   /* 推搖桿＝自己走：點的位置不再算（nearestInteractable）*/   /* 推著搖桿時鏡頭自動轉開的角度（swingAcc）不算進方向：放開再推才照新的鏡頭方向 */
    if(E.cam.ctl){ mv.normalize(); const ang=E.cam.yaw-(E.cam.swingAcc||0); /* 搖桿／鍵盤的方向換成世界方向（v9.3 第二十五批修正，2026-10-10 線上回報「霖澤館外面跑的方向相反」）：鏡頭在玩家的 (sin yaw, cos yaw) 那一側，畫面的「前」是 (-sin yaw,-cos yaw)、「右」是 (cos yaw,-sin yaw)；推 (x,y)（y 往下為正）＝ x·右 − y·前。原本旋轉方向寫反：只有鏡頭朝正北／正南時對，鏡頭轉 45° 時偏 90°、轉到側面時整個相反（往鏡頭這邊跑）*/ const dx=mv.x*Math.cos(ang)+mv.z*Math.sin(ang); const dz=-mv.x*Math.sin(ang)+mv.z*Math.cos(ang); const run=input.runToggle||input.joy.run||P.runHold; const sp=P.riding?E.bikeSp()*(E.fitBike||1):(run?spdRun:spdWalk*(E.fitWalk||1)); P.path=null;   /* fitWalk／fitBike：體能的走路、騎車加成（AA_126 6-2，src/fit3d.js；跑步不變）*/ P.target=null; stepEntity(P,dx,dz,sp,dt); moving=true; P.pose=P.riding?'ride':(run?'run':'walk'); P.speed=sp; }   /* P.riding：騎腳踏車（src/bike3d.js）*/
    else if(P.path) moving=pathStep(P,dt);
    if(!moving){ if(P.pose==='walk'||P.pose==='run'){ P.pose='idle'; } P.speed=0; }
    if(moving||E.cam.ctl) P.lastMoveT=E.time;   /* 最後一次在走（搖桿、鍵盤、點地面）的時間：要回的訊息自動打開手機等玩家停下來（story3d.js S.phoneAuto，UX-PHONE-AUTO-WALK-1021）*/
    CHAR.animate(P.obj,dt,{pose:P.busy?P.pose:(P.pose),speed:P.speed,handsPockets:P.pocketsIdle&&P.pose==='idle',lookAt:P.lookAt,ground:groundFn(P),ride:P.ride});
    // NPC
    camera.updateMatrixWorld(); _frM.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse); _fr.setFromProjectionMatrix(_frM); for(const n of E.npcs){ updateNPC(n,dt); }
    for(const x of E.extras){ if(x.update) x.update(dt); const rd=x.rider; if(rd&&rd.userData&&rd.userData.farLOD&&x.obj){ const cd=Math.hypot(camera.position.x-x.obj.position.x,camera.position.z-x.obj.position.z); CHAR.setFar(rd,rd.userData.isFar?cd>CHAR.FAR_IN:cd>CHAR.FAR_OUT); } }   /* 騎腳踏車的路人：同一套遠距離版本 */
    // 鏡頭
    updateCamera(dt); if(E.sky){ E.sky.position.copy(camera.position); E.sky.material.uniforms.time.value=E.time; }   /* 室內也畫天空：從玻璃帷幕、窗戶看出去是天空（2026-10-11 試過室內不畫天空、改深灰背景：萬才館東窗、霖澤館玻璃底下的縫會變成深灰色，反而更假）。上下樓梯看到大片天空的問題由 updateLevelVis 解決 */ if(E.skyline){ E.skyline.position.set(camera.position.x,0,camera.position.z); E.skyline.visible=!E.indoor&&!(E.zone&&E.zone.def&&E.zone.def.noSkyline); }   /* noSkyline：區域不要遠景剪影（美國篇：台北的山和城市大樓不該出現在印第安納；US-CAMPUS-WIRE-1018）*/
    // 雨
    if(E.rain&&E.rain.visible){ const pos=E.rain.geometry.attributes.position; const cx=P.obj.position.x, cz=P.obj.position.z; for(let i=0;i<pos.count;i++){ let y=pos.getY(i)-dt*14; if(y<0){ y=16+Math.random()*4; pos.setX(i,cx+(Math.random()-0.5)*40); pos.setZ(i,cz+(Math.random()-0.5)*40); } pos.setY(i,y); } pos.needsUpdate=true; }
    if(E.zone&&E.zone.update) E.zone.update(dt,E); if(typeof W3!=='undefined'&&W3.updateWind) W3.updateWind(E.time);
    if(E.frame%5===0) E.applyTime(E.hour);
  };
  function stepEntity(ent,dx,dz,sp,dt){ const o=ent.obj; const nx=o.position.x+dx*sp*dt, nz=o.position.z+dz*sp*dt; const r=ent.radius||0.3; const cs=(x,z)=>standL(x,z,r,ent.lv|0); // 圓形碰撞（對導航格；多樓層：對人物所在那一層，高度要接得上）
    ent.blockedAt=null; if(navOf(ent.lv|0)){ const mx=Math.abs(dx*sp*dt)>1e-4, mz=Math.abs(dz*sp*dt)>1e-4; // 滑動只在那個方向真的有位移時才算（沿著床邊直走時 dx=0，舊版會「滑動成功」但原地不動）
      if(cs(nx,nz)||escapeOK(ent,nx,nz,r)) { o.position.x=nx; o.position.z=nz; } else if(E.levels&&switchLevel(ent,nx,nz,r)) { o.position.x=nx; o.position.z=nz; } else if(mx&&cs(nx,o.position.z)) { o.position.x=nx; ent.blockedAt={x:nx,z:nz,slide:'x'}; } else if(mz&&cs(o.position.x,nz)) { o.position.z=nz; ent.blockedAt={x:nx,z:nz,slide:'z'}; } else { ent.blockedAt={x:nx,z:nz,slide:'none'};
        // 擦到家具或格子的角：前進方向再往左或右偏一點（最多 0.48 m，導航格是 0.5 m）就過得去時，往空的那一側讓開（正面撞平的牆時偏移也過不去，不會亂滑）
        const px=-dz, pz=dx; let side=0; for(const e of [0.08,0.16,0.24,0.32,0.4,0.48]){ if(cs(nx+px*e,nz+pz*e)){ side=1; break; } if(cs(nx-px*e,nz-pz*e)){ side=-1; break; } }
        if(side){ const lat=Math.min(0.18,sp*dt*0.8), lx=o.position.x+px*side*lat, lz=o.position.z+pz*side*lat; if(cs(lx,lz)){ o.position.x=lx; o.position.z=lz; ent.blockedAt.slide='corner'; } }
        // 還是過不去（v9.3 #31：宿舍書桌後面的窄縫，玩家沿牆滑進去之後，往哪個正方向推都過不去，永久卡住）：前進方向往左右各偏 30°／50°／70° 試一步，
        // 站得住就走。每個方向都還有往前的分量；正面頂著平的牆或在牆角時這些方向都過不去，所以不會亂滑；只移到站得住的位置，不穿牆。
        // 目前位置本身站不住（卡在阻擋格裡）時不用這個，交給 escapeOK（否則可能從阻擋格被帶進另一個小空隙）
        else if(!stuckIn(ent)){ const st=Math.hypot(nx-o.position.x,nz-o.position.z); for(const a of [0.52,-0.52,0.87,-0.87,1.22,-1.22]){ const c=Math.cos(a), sn=Math.sin(a), rx=dx*c-dz*sn, rz=dx*sn+dz*c, tx=o.position.x+rx*st, tz=o.position.z+rz*st; if(cs(tx,tz)){ o.position.x=tx; o.position.z=tz; ent.blockedAt.slide='turn'; break; } } } } } else { o.position.x=nx; o.position.z=nz; }
    settleY(ent,dt);
    flatYaw(o); const targetYaw=Math.atan2(dx,dz); let d=targetYaw-o.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); o.rotation.y+=d*Math.min(1,dt*12); }
  /* 人物只轉 y：rotation 變成 (±π, y, ±π)（四元數換回 Euler、超過 ±90° 的朝向）時改回 (0, π−y, 0)——看起來的方向一樣，之後改 rotation.y 才是真的轉向（2026-10-18 路人往後走）。騎車的側傾（z 小角度）不動 */
  function flatYaw(o){ const r=o.rotation; if(Math.abs(r.x)>1.5&&Math.abs(r.z)>1.5){ r.set(0,Math.atan2(Math.sin(Math.PI-r.y),Math.cos(Math.PI-r.y)),0); } }
  E.flatYaw=flatYaw;
  // 多樓層（v9.4）：E.levels＝這個區域每一層的導航格（沒有就是 null＝單層）；E.nav 永遠是「玩家所在那一層」（舊程式照用）；NPC 用自己的層（n.lv）
  function navOf(lv){ const L=E.levels; return L?(L[lv|0]||L[0]):E.nav; }
  // 路線的轉折點：在 tol 以內、而且「從現在的位置到下一個點」的直線人物過得去（losR，和找路平滑時同一個檢查）才換下一個點；不然繼續走到轉折點上（d<6 cm），
  // 最多 1.2 秒（免得卡在轉折點旁邊）。原因（萬才館大樓梯，reachability_all）：在轉折點前 0.25 m 就轉向，接下來的直線比找路檢查過的那條偏了 0.2 m，
  // 貼著障礙物或高低差的長直線就撞上（從萬才館一樓出來走回霖澤館前，卡在大樓梯底下）
  /* 沿路線走的一步不超過到轉折點的距離（2026-10-11，萬才館大樓梯真實流程）：跑步（4.1 m/s）＋低幀率（dt 0.1）一步 0.41 m，
     轉折點要走到 6 cm 內才算到時（下一段直線過不去，例如樓梯底換層的那一點），人物在轉折點前後來回跳，最多晃到 1.2 秒的保險才放行 */
  function stepSp(sp,d,dt){ return Math.min(sp,d/Math.max(dt,1e-4)); }
  function wpReached(ent,d,tol,dt){ if(d>=tol) return false; const P=ent.path; if(d<0.06||!P||P.length<2){ ent.wpT=0; return true; } const n=navOf(ent.lv|0), q=P[1], o=ent.obj.position;
    if(!n||n.losR(o.x,o.z,q[0],q[1],ent.radius||0.3)){ ent.wpT=0; return true; } ent.wpT=(ent.wpT||0)+(dt||1/30); if(ent.wpT>1.2){ ent.wpT=0; return true; } return false; }
  function standL(x,z,r,lv){ const n=navOf(lv); if(!n) return true; return n.clear(x,z,r); }
  function canStand(x,z,r,lv){ return standL(x,z,r,lv===undefined?(E.player?E.player.lv|0:0):lv); }
  // 換層：這一層站不住，但另一層站得住、而且高度接得上（走到共用樓梯的頂端／底端）
  /* 2026-10-11（萬才館大樓梯）：原本拿人物畫面上的 y（一階一階的踏面高度、還在平順變化）去比另一層的高度——跑步一步 0.41 m 時，
     從倒數第二階（畫面 0.33 m）跨到地面（0 m）差 0.33 > 0.3，換層失敗，人物沿著最下面一階橫著滑走、停住。改用這一層在現在位置的連續高度（碰撞與找路用的那一個），
     容許值 0.3 m 再加上這一步可能的高低差（坡度 0.5×步長，最多 0.55 m；上下兩層至少差 3.6 m，不會錯換到正上方或正下方的地板）*/
  function switchLevel(ent,x,z,r){ const L=E.levels; if(!L) return false; const o=ent.obj.position, hc=navOf(ent.lv|0).heightAt(o.x,o.z), tol=Math.min(0.55,0.3+0.5*Math.hypot(x-o.x,z-o.z)); for(let k=0;k<L.length;k++){ if(k===(ent.lv|0)) continue; if(L[k].clear(x,z,r)&&Math.abs(L[k].heightAt(x,z)-hc)<tol){ setLv(ent,k); return true; } } return false; }
  function setLv(ent,k){ ent.lv=k; if(ent===E.player){ E.nav=navOf(k); if(E.onLevel) E.onLevel(k); } }
  // 人物的高度跟著地板（樓梯、斜坡、平台）；差太多（換區域、讀檔）直接放上去
  // 人物動畫的腳步貼合（character3d.js 的 footIK）用：那一層有高度面（樓梯、台階、平台）時給地面高度函式，平地區域不給
  function groundFn(ent){ const n=navOf(ent.lv|0); if(!n||!n.surf) return null; return n._gf||(n._gf=(x,z)=>n.visualHeightAt(x,z)); }
  function settleY(ent,dt){ const n=navOf(ent.lv|0); if(!n) return; const o=ent.obj.position; const ty=n.surf?n.visualHeightAt(o.x,o.z):n.y0; if(dt===undefined||Math.abs(ty-o.y)>0.6) o.y=ty; else o.y+=(ty-o.y)*Math.min(1,dt*16); }
  // 卡在阻擋格裡（例如舊存檔的位置、資料錯誤）時，允許往任何方向移動，走出去就恢復正常碰撞
  function freeScore(x,z,r,lv){ const n=lv===undefined?E.nav:navOf(lv); if(!n) return 5; return (n.free(x,z)?1:0)+(n.free(x+r,z)?1:0)+(n.free(x-r,z)?1:0)+(n.free(x,z+r)?1:0)+(n.free(x,z-r)?1:0); }
  function stuckIn(ent){ const n=navOf(ent.lv|0); if(!n) return false; const o=ent.obj.position; return !standL(o.x,o.z,ent.radius||0.3,ent.lv|0); }
  // 目前位置本身就不合法（起身位置太靠近桌子、舊存檔、資料錯誤）時：允許「不會變更糟」的移動，讓玩家走出來；不允許穿牆（分數變低的方向仍擋）
  function escapeOK(ent,nx,nz,r){ const o=ent.obj.position; return stuckIn(ent)&&freeScore(nx,nz,r,ent.lv|0)>=freeScore(o.x,o.z,r,ent.lv|0); }
  E.canStand=canStand; E.freeScore=freeScore; E.navOf=navOf; E.setLv=setLv; E.settleY=settleY;
  E.SPD={walk:1.8,run:6.2,bike:8.5};   /* 跑步 4.8 → 6.2（使用者 2026-10-20「跑步好慢」，X72）；跑步動畫照速度加快（character3d.js run 的 timeScale＝spd/4.1）*/
  /* 騎車的速度：載人時 85%（AA_137 第 5 節）；一起走、不坐後座的人走在旁邊（rideMode 'walk'，目前沒有人用；使用者 10-16 要學姊也坐後座）時騎慢，跟走路差不多 */
  E.bikeSp=function(){ let k=1, cap=Infinity; for(const n of E.npcs){ if(n.beh==='passenger') k=0.85; else if(n.beh==='follow'&&E.rideMode&&E.rideMode(n)==='walk') cap=2.4; } return Math.min(E.SPD.bike*k,cap); };
  E.PASSENGER={back:0.52,side:0.03,backAstride:0.54,y:0.334,mount:[0.55,-0.75],mountT:1.5};   /* 後座的位置（車的座標，乘上車的縮放）：LAWWW2-B 的載妹墊坐墊頂面在 (0, 0.784, −0.50)；坐姿的人物原點放在坐墊表面往下 0.45 m（坐姿把模型往下 0.47）——正式 GLB 交付後改讀 passenger_side 節點 */   /* 腳踏車 6.2 → 8.5（使用者 2026-10-15：「騎腳踏車還是好慢」）*/   /* 玩家走路／跑步／騎腳踏車速度（m/s）。2026-10-11 使用者：「走路又很慢完全不想玩遊戲」——原本 1.45／4.1（真實步行速度），校園一頭到另一頭要走兩三分鐘；動畫播放速度跟著速度調整（character3d.js：速度／1.45），不會滑步 */
  E.heightAt=function(x,z,lv){ const n=navOf(lv===undefined?(E.player?E.player.lv|0:0):lv); return n?n.heightAt(x,z):0; };
  // 把人物放到某一層的 (x,z)，高度照地板（劇情、讀檔、坐下、電梯用）
  E.placeAt=function(ent,x,z,lv){ if(lv!==undefined&&lv!==null) setLv(ent,lv|0); const o=ent.obj.position; o.x=x; o.z=z; const n=navOf(ent.lv|0); o.y=n?n.heightAt(x,z):0; };
  // 找路（多層區域用各層一起找；單層照舊）
  E.pathTo=function(x0,z0,l0,x1,z1,l1){ if(E.levels) return gridPath(E.levels,x0,z0,l0|0,x1,z1,l1|0); return E.nav?E.nav.path(x0,z0,x1,z1):[[x1,z1]]; };
  // 測試用（tests/reachability_all.py）：用和玩家完全一樣的找路（nav.path）＋移動碰撞（stepEntity）模擬從 (x0,z0) 走到 (x1,z1)；
  // 不畫面、不動到真正的玩家。連續 4 秒（模擬時間）沒有前進 0.25 m 就算卡住，回傳卡住的位置
  E.simWalk=function(x0,z0,x1,z1,opts){ opts=opts||{}; const r=opts.radius||(E.player&&E.player.radius)||0.32, dt=opts.dt||1/30, sp=opts.speed||E.SPD.walk;   /* 預設＝玩家走路速度 */ const l0=opts.lv0|0, l1=opts.lv1===undefined?l0:opts.lv1|0; const ent={obj:{position:new THREE.Vector3(x0,0,z0),rotation:{y:0}},radius:r,lv:l0}; settleY(ent);
    const p=E.pathTo(x0,z0,l0,x1,z1,l1); if(!p||!p.length) return {ok:false,reason:'no-path'}; ent.path=p.map(q=>[q[0],q[1]]); let ax=x0, az=z0, still=0; let pl=0; for(let k=0,px=x0,pz=z0;k<p.length;k++){ pl+=Math.hypot(p[k][0]-px,p[k][1]-pz); px=p[k][0]; pz=p[k][1]; }
    /* 步數上限：直線距離×4 和路線長度×2 取大的（2026-10-14 v9.6 回歸：法圖二樓的座位在出生點正上方，直線 0.4 m、要繞樓梯走約 35 m；舊的上限只看直線距離，人還在走就算逾時）*/ const maxSteps=Math.ceil((Math.max(Math.hypot(x1-x0,z1-z0)*4,pl*2)+30)/(sp*dt));
    for(let i=0;i<maxSteps;i++){ const t=ent.path[0]; const o=ent.obj.position; const dx=t[0]-o.x, dz=t[1]-o.z, d=Math.hypot(dx,dz); if(wpReached(ent,d,0.25,dt)){ ent.path.shift(); if(!ent.path.length) return (ent.lv|0)===l1||!E.levels?{ok:true,steps:i,x:+o.x.toFixed(2),z:+o.z.toFixed(2),y:+o.y.toFixed(2),lv:ent.lv|0,n:p.length}:{ok:false,reason:'wrong-level',lv:ent.lv|0,x:+o.x.toFixed(2),z:+o.z.toFixed(2),y:+o.y.toFixed(2)}; continue; }
      stepEntity(ent,dx/d,dz/d,stepSp(sp,d,dt),dt); if(Math.hypot(o.x-ax,o.z-az)>0.25){ ax=o.x; az=o.z; still=0; } else if(++still>Math.ceil(4/dt)) return {ok:false,reason:'stuck',x:+o.x.toFixed(2),z:+o.z.toFixed(2),path:p.map(q=>[+q[0].toFixed(2),+q[1].toFixed(2)])}; }
    const o=ent.obj.position; return {ok:false,reason:'timeout',x:+o.x.toFixed(2),z:+o.z.toFixed(2)}; };
  E.unstick=function(ent,maxR){ if(!ent) return false; const lv=ent.lv|0, n=navOf(lv); if(!n) return false; const o=ent.obj.position; if(standL(o.x,o.z,0.3,lv)) return false; const nf=n.nearestFree(o.x,o.z,maxR||16); if(!nf) return false; // 找一個四周也能站的格子
    let best=null; const [cx,cz]=n.toCell(o.x,o.z); for(let r=1;r<=(maxR||16)&&!best;r++){ for(let dz=-r;dz<=r&&!best;dz++) for(let dx=-r;dx<=r;dx++){ if(Math.max(Math.abs(dx),Math.abs(dz))!==r) continue; const [wx,wz]=n.toWorld(cx+dx,cz+dz); if(standL(wx,wz,0.3,lv)){ best=[wx,wz]; break; } } } if(!best) best=nf; o.x=best[0]; o.z=best[1]; o.y=n.heightAt(o.x,o.z); console.warn('unstick →',best); return true; };
  /* NPC 走路卡住（使用者 2026-10-30 04:2x：「npc要離開一個空間都會卡在門口一直行走 很白癡」，NPC-STALL-1030）：
     沿路線走、被牆／門框／家具擋住時原本一直播走路、原地踏步，沒有任何保底（玩家有 stallStop，NPC 沒有）。
     連續 E.NPC_STALL 秒（遊戲時間）幾乎沒前進（每一格走不到該走距離的 15%）：
       ①離路線終點 E.NPC_STALL_NEAR 以內（離開的人卡在門口、走去座位卡在旁邊）＝當作到了：清路線、照常呼叫 onArrive（離開的人＝出門；STORY.leaveTouch 當下移除）；
       ②要離開的人（beh leave）在遠處卡住＝重新找一次路（只一次），還是卡＝站好、記 n.stalled（鏡頭看不到時才移除，見 story3d.js）；
       ③其他＝放掉路線、站好（不原地踏步）。回傳 true＝這一格不再走 */
  E.NPC_STALL=1.2; E.NPC_STALL_NEAR=3.5;
  function npcStall(n){ const P=n.path, o=n.obj.position; n._stall=0; if(!P||!P.length) return false; const end=P[P.length-1], rem=Math.hypot(end[0]-o.x,end[1]-o.z);
    const arrive=()=>{ n.path=null; n.stalled=true; n.pose=n.idlePose&&n.idlePose!=='walk'&&n.idlePose!=='run'?n.idlePose:'idle'; n.speed=0; if(n.onArrive){ const f=n.onArrive; n.onArrive=null; f(n); } return true; };
    if(rem<E.NPC_STALL_NEAR) return arrive();
    if(n.beh==='leave'||n.leaving){ if(!n._repath){ n._repath=true; const f=n.onArrive; if(E.moveTo(n,end[0],end[1],f,n.lv|0)) return false; } n.path=null; n.onArrive=null; n.stalled=true; n.pose='idle'; n.speed=0; return true; }   /* 遠處卡住、重找也卡：站好，鏡頭看不到時才移除（story3d.js refreshSchedule 的 n.stalled&&!vis），不在玩家眼前消失 */
    n.path=null; n.onArrive=null; n.pose=n.idlePose&&n.idlePose!=='walk'&&n.idlePose!=='run'?n.idlePose:'idle'; n.speed=0; return true; }
  E.npcStall=npcStall;
  E.moveTo=function(ent,x,z,onArrive,lv){ if(!navOf(ent.lv|0)){ ent.path=[[x,z]]; ent.onArrive=onArrive; return true; } const p=E.pathTo(ent.obj.position.x,ent.obj.position.z,ent.lv|0,x,z,lv===undefined||lv===null?(ent.lv|0):lv); if(p&&p.length){ ent.path=p; ent.onArrive=onArrive; return true; } ent.path=null; return false; };   // lv：目標在哪一層（多樓層區域；不給＝同一層）
  const _fr=new THREE.Frustum(), _frM=new THREE.Matrix4(), _frS=new THREE.Sphere();
  /* 這一格看得到嗎（鏡頭視錐＋和 NPC 一樣的距離 LOD）：不是 NPC 的會動的人（路上騎腳踏車的人，bike3d.js B.rider）用。
     X69（使用者 2026-10-20「溫州街、公館與校園卡頓」；tests/perf_breakdown.py：椰林大道一次 488 個 draw call 裡，騎士的人＋車佔 162 個、20 萬個三角形——
     騎士原本不分遠近、畫面外也一直畫、一直算動畫）。E.seeCd＝離鏡頭的水平距離 */
  E.seeLOD=function(x,y,z,r){ if(!camera){ E.seeCd=0; return true; } const cd=Math.hypot(camera.position.x-x,camera.position.z-z); E.seeCd=cd; const lim=E.q.level==='low'?34:(E.q.level==='high'?95:60); if(cd>=lim) return false; _frS.center.set(x,y,z); _frS.radius=r||1.3; return _fr.intersectsSphere(_frS); };
  /* 跟著人走（follow：跟玩家；buddy：路人跟同伴）。直線追；對方在別層，或同一層但中間有牆、建築（直線走會一直撞）時用找路
     （2026-10-13 使用者試玩：高子晴背吉他跟著同伴跑，一直被牆卡住——原本只有不同層才找路）。E.followStep 給測試用 */
  function followStep(n,dt){ const o=n.obj; let moving=false; const Pp=n.beh==='buddy'?n.buddy.obj:E.player.obj; const side=n.side||1; const yaw=Pp.rotation.y; const fx=Math.sin(yaw), fz=Math.cos(yaw); const rx=Math.cos(yaw), rz=-Math.sin(yaw); const off=n.followOff||0.95; const tx=Pp.position.x+rx*side*off-fx*0.3, tz=Pp.position.z+rz*side*off-fz*0.3; const d=Math.hypot(tx-o.position.x,tz-o.position.z); const ps=(n.beh==='buddy'?n.buddy.speed:E.player.speed)||0;
    const tlv=(n.beh==='buddy'?n.buddy.lv:E.player.lv)|0, otherLv=!!E.levels&&(n.lv|0)!==tlv, nv=navOf(n.lv|0);
    const blocked=!otherLv&&d>1.2&&!!nv&&!!nv.losR&&!nv.losR(o.position.x,o.position.z,tx,tz,0.3);
    if(otherLv||blocked){ n.repathT=(n.repathT||0)-dt; if(!n.path||n.repathT<=0){ E.moveTo(n,Pp.position.x,Pp.position.z,null,tlv); n.repathT=1.5; }
      if(n.path){ const t=n.path[0]; const ddx=t[0]-o.position.x, ddz=t[1]-o.position.z, dl=Math.hypot(ddx,ddz); const sp=d>6?E.SPD.run+0.3:2.2; if(wpReached(n,dl,0.3,dt)) n.path.shift(); else { stepEntity(n,ddx/dl,ddz/dl,stepSp(sp,dl,dt),dt); moving=true; n.pose=sp>3?'run':'walk'; n.speed=sp; n.faceYaw=null; } if(n.path&&!n.path.length) n.path=null; }
      return moving; }
    if(n.path){ n.path=null; n.repathT=0; }   /* 看得到了：放掉繞路的路線，照舊直線跟 */
    if(d>0.4&&(ps>0||d>1.7)){ let sp; if(d>6) sp=E.SPD.run+0.3; else if(d>2.4) sp=Math.max(ps,2.2); else sp=ps>0?ps*Math.min(1.4,0.85+d*0.35):1.45; stepEntity(n,(tx-o.position.x)/d,(tz-o.position.z)/d,Math.min(sp,E.SPD.run+0.3),dt);   /* 跟隨的人（小安）上限比玩家跑步快一點，才跟得上 */ moving=true; n.pose=sp>3?'run':'walk'; n.speed=sp; n.faceYaw=null; }
    else { if(ps>0) n.faceYaw=yaw; else if(n.faceYaw==null||Math.random()<0.002) n.faceYaw=Math.atan2(Pp.position.x-o.position.x,Pp.position.z-o.position.z)*0.5+yaw*0.5; }
    return moving; }
  E.followStep=followStep;
  function updateNPC(n,dt){ const o=n.obj; n.timer-=dt; let moving=false;
    /* 可以搭話的人在走走（wander）時，玩家走到 2.8 m 內就停下來、轉頭看玩家；玩家離開 3.5 m 以外才繼續走；正在和玩家說話時不走（2026-10-13 使用者試玩：
       林芷若、高子晴走來走去，追著按「說話」很難；走近時才開始的事件——芷若的通識分組「5 m 內」——每 30 幀才檢查一次，人一直走開就不會發生）。時段結束要離開的人（leaving）不停 */
    if(n.beh==='wander'&&(n.talk||n.talkLabel)&&!n.leaving&&E.player&&(n.lv|0)===(E.player.lv|0)){ const pp=E.player.obj.position, dd=Math.hypot(pp.x-o.position.x,pp.z-o.position.z);
      if((dd<(n.held?3.5:2.8)&&!E.player.busy)||(n.held&&E.player.busy)){ if(n.path){ n.path=null; n.onArrive=null; } n.timer=Math.max(n.timer,1.5); if(!n.held){ n.held=true; if(!n.lookAt) n.lookAt=pp; } }
      else if(n.held){ n.held=false; if(n.lookAt===pp) n.lookAt=null; } }
    if(n.beh==='chat'&&n.chatWith){ if(!(E.player&&E.player.busy)){ flatYaw(o); const c=n.chatWith.obj; const ty=Math.atan2(c.position.x-o.position.x,c.position.z-o.position.z); let dd=ty-o.rotation.y; dd=Math.atan2(Math.sin(dd),Math.cos(dd)); if(Math.abs(dd)>0.05) o.rotation.y+=dd*Math.min(1,dt*3); if(!n.lookAt||n.lookAt!==c.position) n.lookAt=c.position; } if(n.chatLead&&!(E.player&&E.player.busy)&&n.timer<=0){ const b=n.chatWith; const aTalks=n.pose!=='talk'; n.pose=aTalks?'talk':'idle'; n.idlePose=n.pose; b.pose=aTalks?'idle':'talk'; b.idlePose=b.pose; n.timer=1.8+Math.random()*3.5; } }
    else if(n.beh==='passenger'&&E.player){ const P=E.player.obj, y=P.rotation.y, k=(E.player.ride&&E.player.ride.scale)||1, PS=E.PASSENGER, fx=Math.sin(y), fz=Math.cos(y), rx=Math.cos(y), rz=-Math.sin(y);   /* 載妹墊（使用者 2026-10-15、AA_137 第 5 節）：女生側坐（臉朝車的左邊 +x）、男生跨坐（朝車頭）；車的座標：+z 車頭、+x 左邊 */
      const lp=(bx,bz)=>[P.position.x+rx*bx*k+fx*bz*k,P.position.z+rz*bx*k+fz*bz*k];   /* 車的座標 → 世界 */
      if(!E.player.riding){ const [mx,mz]=lp(PS.mount[0],PS.mount[1]); n.beh='follow'; n.mountT=null; o.position.x=mx; o.position.z=mz; o.position.y=P.position.y; o.rotation.set(0,y,0); n.pose=n.idlePose='idle'; n.lv=E.player.lv|0; if(E.onRide) E.onRide(n,false); }   /* 下車：站到車的左後方（mount_point），照舊跟著走 */
      else { const back=n.astride?PS.backAstride:PS.back, [sx,sz]=lp(n.astride?0:PS.side,-back), sy=y+(n.astride?0:Math.PI/2);
        if(n.mountT!=null&&n.mountT<PS.mountT){ n.mountT+=dt; const t=n.mountT;   /* 上車（約 1.5 秒）：先走到車子左後方、轉身、坐上去——不是瞬間出現在車上 */
          if(!n.mount0) n.mount0={x:o.position.x,z:o.position.z,ry:o.rotation.y}; const [mx,mz]=lp(PS.mount[0],PS.mount[1]);
          if(t<0.9){ const u=t/0.9; o.position.x=n.mount0.x+(mx-n.mount0.x)*u; o.position.z=n.mount0.z+(mz-n.mount0.z)*u; o.position.y=P.position.y; o.rotation.set(0,Math.atan2(mx-n.mount0.x,mz-n.mount0.z)||y,0); n.pose='walk'; n.speed=1.4; }
          else { const u=Math.min(1,(t-0.9)/0.6); o.position.set(mx+(sx-mx)*u,P.position.y+PS.y*k*u,mz+(sz-mz)*u); let dr=sy-y; o.rotation.set(0,y+dr*u,P.rotation.z*u); n.pose=u<0.5?'idle':'sit'; n.idlePose=n.pose; n.speed=0; }
          n.lv=E.player.lv|0; }
        else { n.mount0=null; o.position.set(sx,P.position.y+PS.y*k,sz); o.rotation.set(0,sy,P.rotation.z); n.pose='sit'; n.idlePose='sit'; n.speed=0; n.lv=E.player.lv|0; } } }
    else if(n.beh==='follow'&&E.player&&E.player.riding&&!n.noRide&&(!E.rideMode||E.rideMode(n)==='ride')&&(E.player.speed||0)<0.2&&Math.hypot(E.player.obj.position.x-o.position.x,E.player.obj.position.z-o.position.z)<3.0){ n.beh='passenger'; n.path=null; n.mountT=0; n.mount0=null; if(E.onRide) E.onRide(n,true); }   /* 一起走的人：你騎著車停在她旁邊（3 m 內、停下來），她自己走到後座坐上去（AA_137 第 5 節）；沒裝載妹墊、不願意的人照舊走路（rideMode）*/
    else if((n.beh==='follow'&&E.player)||(n.beh==='buddy'&&n.buddy)){ if(followStep(n,dt)) moving=true; }
    else if(n.path){ const t=n.path[0]; const dx=t[0]-o.position.x, dz=t[1]-o.position.z; const d=Math.hypot(dx,dz); if(wpReached(n,d,0.3,dt)){ n.path.shift(); n._stall=0; if(!n.path.length){ n.path=null; if(n.onArrive){ const f=n.onArrive; n.onArrive=null; f(n); } } } else { const sp=n.run?4.0:(n.walkSpeed||1.35), x0=o.position.x, z0=o.position.z, ss=stepSp(sp,d,dt); stepEntity(n,dx/d,dz/d,ss,dt); moving=true; n.pose=n.run?'run':'walk'; n.speed=sp;
        if(ss*dt>1e-4){ const mv=Math.hypot(o.position.x-x0,o.position.z-z0); n._stall=mv<ss*dt*0.15?(n._stall||0)+dt:0; if(n._stall>E.NPC_STALL&&npcStall(n)) moving=false; } } }
    else if(n.beh==='wander'&&n.timer<=0&&!n.frozen){ const w=n.waypoints; if(w&&w.length){ const wp=w[(Math.random()*w.length)|0]; E.moveTo(n,wp[0]+(Math.random()-0.5)*1.5,wp[1]+(Math.random()-0.5)*1.5,null,wp[2]); n.timer=4+Math.random()*8; } }
    else if(n.beh==='route'&&!n.path&&n.timer<=0&&!n.frozen){ const w=n.waypoints; if(w&&w.length){ n.ri=((n.ri||0)+1)%w.length; const wp=w[n.ri]; E.moveTo(n,wp[0],wp[1],null,wp[2]); n.timer=n.pauseAt?1+Math.random()*3:0; } }
    if(!moving&&(n.pose==='walk'||n.pose==='run')){ n.pose=n.beh==='follow'?'idle':(n.idlePose||'idle'); if(n.beh==='follow') n.idlePose='idle'; n.speed=0; }   /* 跟著你走的人停下來是站著（原本退回作息的坐姿：使用者 2026-10-16「我停下來她就恢復坐姿」）*/
    // 打招呼：認識的人靠近時揮手
    if(n.greet&&E.player){ n.greetCd=(n.greetCd||0)-dt; if(n.beh==='follow'||n.beh==='passenger') n.greetCd=Math.max(n.greetCd,90);   /* 和你一起走、坐你後座的人不跟你揮手；到了以後 90 秒內也不揮（使用者 2026-10-16「一起到達地點的人為什麼要跟我揮手」）*/ const pp=E.player.obj.position; const d=Math.hypot(pp.x-o.position.x,pp.z-o.position.z); if(!n.frozen&&!E.player.busy&&n.greetCd<=0&&d<3.4&&!n.waveT){ if(n.path&&d>2.2){} else { n.waveT=1.9; n.greetCd=50; n.lookAt=pp; CHAR.setExpr(o,'smile'); if(E.onGreet) E.onGreet(n); } } if(n.waveT>0){ n.waveT-=dt; if(!moving) n.pose='wave'; if(n.waveT<=0){ n.waveT=0; n.pose=n.idlePose||'idle'; n.lookAt=null; CHAR.setExpr(o,'normal'); } } }
    if(!moving&&n.faceYaw!=null&&!n.frozen){ flatYaw(o); let d=n.faceYaw-o.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); o.rotation.y+=d*Math.min(1,dt*6); }
    // 距離 LOD：遠處路人不畫、動畫降頻；n.lodLim＝{low,medium,high} 這個人比較短的距離（社博顧攤的人，FAIR-STAFF-LOD-1027）
    const cd=Math.hypot(camera.position.x-o.position.x,camera.position.z-o.position.z); const lim0=E.q.level==='low'?34:(E.q.level==='high'?95:60), lim=n.lodLim&&n.lodLim[E.q.level]?Math.min(lim0,n.lodLim[E.q.level]):lim0; _frS.center.set(o.position.x,o.position.y+0.9,o.position.z); _frS.radius=1.3; const vis=!n.hidden&&(cd<lim||!n.isExtra)&&_fr.intersectsSphere(_frS)&&!(E.zone&&E.zone.hideAbove!==undefined&&o.position.y>E.zone.hideAbove-0.5);   /* 多樓層剖面視角：被藏起來的樓層上的人也不畫 */ /* 畫面外的人不畫也不更新骨架（VRM 人物 frustumCulled 關掉，所以在這裡做）*/ if(o.visible!==vis) o.visible=vis; if(n.isExtra&&o.userData.farLOD) CHAR.setFar(o,farWant(!!o.userData.isFar,cd,!!E.indoor));   /* 30 m 外的路人換遠距離版本（PERF-CROWD-LOD-1021；回到 28 m 內才換回來，不會在邊界閃）*/ if(!vis&&cd>16) return;   /* 16 m 內的人畫面外也更新骨架：鏡頭一切過去（劇情運鏡、轉身）的那一格，視錐用的是上一格的鏡頭，沒更新過的人會露出模型原始的 T 字手臂（BB-C 2026-10-17：沛珊上樓梯第一段手臂往前平舉）*/ if(cd>28&&(E.frame+(n.lodPhase||0))%2) { n._skipDt=(n._skipDt||0)+dt; return; } const adt=dt+(n._skipDt||0); n._skipDt=0;
    CHAR.animate(o,adt,{pose:n.pose,speed:n.speed,handsPockets:n.pockets&&n.pose==='idle',lookAt:n.lookAt,ground:groundFn(n)}); }
  /* 無名路人要不要換遠距離版本（PERF-CROWD-LOD-1021）：室外 18 m 外換、16.5 m 內換回來（原本 30／28 m，PERF-PATROL-ECON-1025 改）；室內 7 m 外換、6.5 m 內換回來（LAWWW2-B 2026-10-24，LAWWW-B 同意：
     博雅一樓階梯教室一整班坐著的路人，後排換了幾乎看不出來；有名字的角色不換）。中間差一段才換回來：在邊界上不會一直切換。測試：node tests/crowd_far_indoor_unit.js */
  function farWant(isFar,cd,indoor){ const out=indoor&&CHAR.FAR_OUT_IN?CHAR.FAR_OUT_IN:CHAR.FAR_OUT, back=indoor&&CHAR.FAR_IN_IN?CHAR.FAR_IN_IN:CHAR.FAR_IN; return isFar?cd>back:cd>out; }
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
  function updateSeeThrough(){ const P=E.player; if(!P||E.cam.mode!=='follow'||(E.indoor&&!(E.zone&&E.zone.seeThru))){ ST.uSeeR.value=0; return; }   /* 室內：區域有 seeThru 才用（法律學院圖書館的書架，走道很窄）*/
    const o=P.obj.position; _stA.set(o.x,o.y+0.9,o.z).project(camera); if(_stA.z>1||_stA.z<-1){ ST.uSeeR.value=0; return; }
    renderer.getDrawingBufferSize(_stS); _stB.set(o.x,o.y+1.75,o.z).project(camera); const top=_stB.y; _stB.set(o.x,o.y+0.05,o.z).project(camera); const ph=Math.abs(top-_stB.y)*0.5*_stS.y; // 玩家在畫面上的高度（像素）
    ST.uSeeP.value.set((_stA.x*0.5+0.5)*_stS.x,(_stA.y*0.5+0.5)*_stS.y,_stA.z*0.5+0.5); ST.uSeeR.value=Math.max(20,ph*0.62); }
  E.seeThrough=ST;
  /* 跟隨鏡頭的位置：從 target（頭）往 (yaw, pitch) 退 dist0。擋到建築碰撞盒（E.colliders）或玩家那一層的隔間牆（zone.camCols[lv]：教學館，
     2026-10-13 LAWWW2 審查——原本室內沒有鏡頭碰撞，鏡頭跑到隔間牆後面時整個畫面是那面牆）就拉近到牆前 0.35 m（最近 0.7 m）；
     被隔間牆拉近時鏡頭抬高（拉得越近抬越多、最多 0.9 m：看得到腳下，不是只看到後腦；原本最多 1.1 m，LAWWW2 量到貼牆時鏡頭在頭頂上方 1.0–1.35 m、畫面只剩頭頂——現在由 autoSwing 轉開、往前看，抬高少一點）。out＝鏡頭位置；回傳 {dist, inner}。測試：node tests/teach_cam_walls_unit.js */
  const fcDir=new THREE.Vector3();
  function followCam(target,yaw,pitch,dist0,lv,out){ out.set(Math.sin(yaw)*dist0*Math.cos(pitch),Math.sin(pitch)*dist0+0.2,Math.cos(yaw)*dist0*Math.cos(pitch)).add(target);
    let dist=dist0, inner=false; let LC=E.zone&&E.zone.camCols?E.zone.camCols[lv|0]:null; const EC=E.zone&&E.zone.elevCams;   /* 電梯井道（building3d.js buildElevator）也當隔間牆 */
    if(EC&&EC.length){ const ck=E.zone._lcAll||(E.zone._lcAll={}); LC=ck[lv|0]||(ck[lv|0]=(LC&&LC.length?LC.concat(EC):EC)); }
    if(E.colliders.length||(LC&&LC.length)){ fcDir.copy(out).sub(target); const len=fcDir.length(); fcDir.normalize(); E.ray.set(target,fcDir); E.ray.far=len; let hd=Infinity;
      if(E.colliders.length){ const hits=E.ray.intersectObjects(E.colliders,false); if(hits.length) hd=hits[0].distance; }
      if(LC&&LC.length){ const h2=E.ray.intersectObjects(LC,false); if(h2.length&&h2[0].distance<hd){ hd=h2[0].distance; inner=true; } }
      if(hd<Infinity){ if(!inner) dist=Math.max(0.7,hd-0.35);   /* 建築碰撞盒（戶外）：和以前一樣 */
        else dist=hd-0.35>=0.7?hd-0.35:Math.max(0.12,hd-0.15);   /* 隔間牆：人可以貼著牆站（離牆中線 0.42 m），最近 0.7 m 的規則會把鏡頭放到牆後面——貼牆時鏡頭留在牆前、拉高從上面看 */
        out.copy(target).addScaledVector(fcDir,dist);
        if(inner){ out.y+=Math.min(0.9,(1-dist/dist0)*1.0);   /* 抬高之後再看一次頭 → 鏡頭：抬高可能抬進門楣（鏡頭剛好在門洞的平面上）、或從門洞看出去時被門楣擋住——擋到就沿著新的線拉近 */
          fcDir.copy(out).sub(target); const l2=fcDir.length(); fcDir.normalize(); E.ray.set(target,fcDir); E.ray.far=l2; const h3=E.ray.intersectObjects(LC,false); if(h3.length){ const d3=Math.max(0.12,h3[0].distance-0.15); out.copy(target).addScaledVector(fcDir,d3); dist=Math.min(dist,d3); } } } }   /* 回傳的 dist 也要是拉近以後的（BUG-CAM-C208-1021：抬高撞到門楣、又拉近到 0.8 m，回傳的還是 2.2 m——autoSwing 以為不貼牆、不轉開，往前看也沒作用）*/
    return {dist,inner}; }
  E.followCam=followCam;
  /* 鏡頭貼牆時自動轉開（2026-10-13 LAWWW2 CAMERA_WALLS §1(1)；使用者轉達「鏡頭穿牆是最優先的共用技術問題」）：被隔間牆拉近到 1.5 m 以內、
     沒有在拖鏡頭（放開 1.5 秒內也不轉）、沒有坐著的時候，往 ±30°／±60°／±90° 各試一次跟隨鏡頭，每秒約 75° 轉向最空的方向——轉越多扣越多分、
     在人物背後加分（走廊裡轉成跟在後面）、同一個方向繼續轉加分（不會左右來回）；比現在空 0.5 m 以上才開始轉，離牆 2.4 m 以上或沒有更空的方向就停。
     推著搖桿時，自動轉的角度記在 swingAcc、不算進搖桿的方向（人照原本的方向走，不會被鏡頭轉去撞牆）。回傳這一幀轉了多少。測試：node tests/teach_cam_walls_unit.js */
  const SW_OFF=[0.52,-0.52,1.05,-1.05,1.57,-1.57], swV=new THREE.Vector3();
  function autoSwing(C,P,pitch,res,dt){ if(!res||!res.inner||C.dragging||C.manualT>0||(P.seat&&P.pose==='sit')||res.dist>=(C.swing?2.4:1.5)){ C.swing=0; return 0; }
    const ry=P.obj.rotation.y, sc=(yaw,d)=>d+0.4*(-Math.cos(yaw-ry)); const cur=sc(C.yaw,res.dist); let best=0, bs=cur+(C.swing?0.2:0.5);
    for(const off of SW_OFF){ const r=followCam(C.target,C.yaw+off,pitch,C.dist,P.lv,swV); const v=sc(C.yaw+off,r.dist)-Math.abs(off)*0.25+(C.swing&&Math.sign(off)===Math.sign(C.swing)?0.3:0); if(v>bs){ bs=v; best=off; } }
    C.swing=best; if(!best) return 0; const st=Math.sign(best)*Math.min(Math.abs(best),1.3*dt); C.yaw+=st; if(C.ctl) C.swingAcc=(C.swingAcc||0)+st; return st; }
  E.autoSwing=autoSwing;
  const _lookPt=new THREE.Vector3();
  function updateCamera(dt){ const C=E.cam; const P=E.player; if(C.mode==='cinematic'&&C.cine){ const s=C.cine; camera.position.lerp(s.pos,Math.min(1,dt*2.4)); C.look=C.look||new THREE.Vector3(); C.look.lerp(s.look,Math.min(1,dt*2.4));   /* 原本 dt*4（約 0.25 秒就轉過去）：轉太快會暈（使用者 2026-10-15），放慢一點 */ slabClip(C.look,camera.position,0.9); camera.lookAt(C.look); if(E.zone&&E.zone.fadeWalls){ E.zone.fadeWalls(camera,P.obj.position); hideFaded(); } updateLevelVis(); ST.uSeeR.value=0; return; }
    C.dist+=(C.distTarget-C.dist)*Math.min(1,dt*4); if(C.manualT>0) C.manualT-=dt; C.target.lerp(tmpV2.copy(P.obj.position).add(tmpV3.set(0,1.45,0)),Math.min(1,dt*7));
    /* 往下走樓梯時鏡頭抬高（戶外：萬才館大樓梯；萬才館第二階段的真實玩家測試抓到）：鏡頭在玩家背後 2.7 m 高，往下走的時候平台邊緣擋住下面的台階，
       畫面上看不到要走去的地方（點下面的台階會點到平台、又走回去）。前方 3～5.5 m 的地面比腳下低超過 0.4 m 時，俯角最多加 0.32（約 18°），平順地變化；室內維持原本的鏡頭 */
    let pa=0; const nv=!E.indoor&&navOf(P.lv|0); if(nv&&nv.surf){ const fx=-Math.sin(C.yaw), fz=-Math.cos(C.yaw), po=P.obj.position, drop=po.y-Math.min(nv.heightAt(po.x+fx*3,po.z+fz*3),nv.heightAt(po.x+fx*5.5,po.z+fz*5.5)); if(drop>0.4) pa=Math.min(0.32,(drop-0.4)*0.16); }
    C.pitchAdd=(C.pitchAdd||0)+(pa-(C.pitchAdd||0))*Math.min(1,dt*2.5); const pitch=C.pitch+C.pitchAdd;
    const desired=tmpV, res=followCam(C.target,C.yaw,pitch,C.dist,P.lv,desired);   /* 鏡頭碰撞：建築碰撞盒＋玩家那一層的隔間牆 */
    autoSwing(C,P,pitch,res,dt);   /* 貼牆時轉開（下一幀生效）*/
    /* 被隔間牆拉近時往前看（LAWWW2 §1(1)b）：看的點往鏡頭前方移，最多 0.6 m（再多頭就出畫面：鏡頭在頭的斜上方 0.4 m、橫向的垂直視角 46°）——畫面看得到前面的地板，不是只有頭頂 */
    const ahT=res.inner?Math.max(0,Math.min(1,(1.5-res.dist)/0.8)):0; C.ahead=(C.ahead||0)+(ahT-(C.ahead||0))*Math.min(1,dt*4); const ah=C.ahead*0.6;
    const fy=P.obj.position.y; if(desired.y<fy+0.6) desired.y=fy+0.6; slabClip(C.target,desired,1.15); let posK=dt*(C.manualT>0?18:7); const lookPt=_lookPt.set(C.target.x-Math.sin(C.yaw)*ah,C.target.y-0.15,C.target.z-Math.cos(C.yaw)*ah);
    if(C.blend){ const B=C.blend; B.t+=dt; const k=Math.min(1,B.t/B.dur), e=k*k*(3-2*k); if(C.manualT>0||C.ctl) B.t=Math.max(B.t,B.dur*0.6); posK=dt*(1.4+5.6*e); B.look.lerp(lookPt,Math.min(1,dt*(1.2+6*e))); lookPt.copy(B.look); if(k>=1) C.blend=null; }   /* 劇情結束的轉場（endCinematic）：玩家一推搖桿、轉鏡頭就加快 */
    camera.position.lerp(desired,Math.min(1,posK)); slabClip(C.target,camera.position,1.15); camera.lookAt(lookPt); if(E.zone&&E.zone.fadeWalls){ E.zone.fadeWalls(camera,P.obj.position); hideFaded(); } updateLevelVis(); camera.updateMatrixWorld(); updateSeeThrough(); }
  /* 淡出的牆整面藏起來（BUG-LIGHTBAND，使用者 2026-10-16 總圖大廳、舊路書房「畫面中間一道從上到下的半透明直條」）：各區域的 fadeWalls 把鏡頭這一側的牆調成 12% 透明，
     細長的牆段、門框、壁柱留下的殘影在鏡頭前變成一條條鬼影（Café 早就改成整面藏，zones3d.js）。鏡頭碰撞的射線不看 visible，藏起來不影響 */
  function hideFaded(){ const W=E.zone&&E.zone.walls; if(!W) return; for(const w of W){ const m=w&&w.material; if(m&&!Array.isArray(m)) w.visible=m.opacity>0.5; } }
  E.hideFaded=hideFaded;
  // 多樓層的剖面視角（v9.4）：zone.levelGroups＝[{group,y}]（每一層的模型、那一層地板的高度）。玩家所在的那一層和下面的層一定畫；
  // 上面的層只有在鏡頭比那一層的地板低的時候才畫（從下面看得到上面的天花板、走廊欄杆；鏡頭拉高到上一層地板以上時藏起來，才看得到玩家）。
  // 「玩家所在的層」用腳的高度判斷（離上一層地板 0.8 m 以內就算上去了：快走完樓梯時上一層先出現）
  function displayLv(LG,py){ let dl=0; for(let k=0;k<LG.length;k++){ if(LG[k].y<=py+0.8||(k>0&&py>=LG[k-1].y+0.5&&py<LG[k].y)) dl=k; } return dl; }
  E.displayLv=displayLv;
  /* 上一層的樓板擋在鏡頭和人中間（2026-10-11 v9.5 審查）：人在樓梯上、電梯裡時上一層會顯示（下面的 updateLevelVis），鏡頭比上一層的地板高的時候，
     總圖大廳的連廊與兩翼、萬才館北側走廊的樓板會擋住樓梯上的人（電梯運鏡也會）。做法和牆的鏡頭碰撞一樣：鏡頭沿著視線拉近到看得到頭和腳的地方（最近 0.7 m）。
     樓板的範圍來自各區域的配置（zone.slabs：{lv,x0,x1,z0,z1,y＝那一層地板的高度,t＝樓板厚度}，和模型、導航格同一份資料）。只看「現在會畫出來」的那一層：
     人在下一層、鏡頭拉高到上一層地板以上時，上一層照舊整層藏起來（剖面視角），不拉近。測試：node tests/stairs_cam_slab_unit.js */
  function segSlab(ax,ay,az,bx,by,bz,s){ const m=0.15, lo=[s.x0-m,s.y-s.t-m,s.z0-m], hi=[s.x1+m,s.y+m,s.z1+m], A=[ax,ay,az], D=[bx-ax,by-ay,bz-az];
    if(ax>lo[0]&&ax<hi[0]&&ay>lo[1]&&ay<hi[1]&&az>lo[2]&&az<hi[2]) return false;   /* 起點就在樓板邊上（樓梯最上面一階）：這一塊不算 */
    let t0=0, t1=1; for(let i=0;i<3;i++){ const o=A[i], d=D[i]; if(Math.abs(d)<1e-9){ if(o<lo[i]||o>hi[i]) return false; continue; } let a=(lo[i]-o)/d, b=(hi[i]-o)/d; if(a>b){ const q=a; a=b; b=q; } if(a>t0) t0=a; if(b<t1) t1=b; if(t0>t1) return false; } return true; }
  function slabClip(from,to,down){ const z=E.zone, SL=z&&z.slabs; if(!SL||!SL.length||E.noSlabClip) return false; const LG=z.levelGroups; const dl=LG?displayLv(LG,E.player.obj.position.y):0;
    const dx=to.x-from.x, dy=to.y-from.y, dz=to.z-from.z, len=Math.hypot(dx,dy,dz); if(len<0.75) return false; const fy=from.y-(down||0);
    /* 看兩條線：鏡頭 → 頭（from）、鏡頭 → 腳（from 往下 down）：人在樓梯上半段時頭已經高過上一層的地板、腳還在下面，只看頭的線會讓地板邊擋住腳 */
    const blocked=(k)=>{ const cx=from.x+dx*k, cy=from.y+dy*k, cz=from.z+dz*k; for(const s of SL){ if(LG&&LG[s.lv]&&!(s.lv<=dl||cy<LG[s.lv].y-0.15)) continue;
        if(segSlab(from.x,from.y,from.z,cx,cy,cz,s)||(down&&segSlab(from.x,fy,from.z,cx,cy,cz,s))) return true; } return false; };
    if(!blocked(1)) return false; let lo=Math.min(1,0.7/len), hi=1; if(!blocked(lo)){ for(let it=0;it<12;it++){ const mid=(lo+hi)/2; if(blocked(mid)) hi=mid; else lo=mid; } }
    to.set(from.x+dx*lo,from.y+dy*lo,from.z+dz*lo); return true; }
  E.slabClip=slabClip;
  function updateLevelVis(){ const z=E.zone; if(!z||!z.levelGroups) return; const LG=z.levelGroups, py=E.player.obj.position.y; const dl=displayLv(LG,py);   /* 人一離開下一層的地板（在樓梯上、電梯裡）就顯示上一層（2026-10-11 使用者：霖澤館上下樓梯、搭電梯會出現天空——原本要到上一層地板下 0.8 m 才顯示，爬第二跑時上一層整層不見）。鏡頭高過上一層地板時，上一層的樓板可能擋住樓梯上的人（總圖大廳、萬才館）：slabClip 把鏡頭拉近到樓板下面 */ const cy=camera.position.y; let hide=Infinity; for(let k=0;k<LG.length;k++){ const vis=k<=dl||cy<LG[k].y-0.15; if(LG[k].group.visible!==vis) LG[k].group.visible=vis; if(!vis&&LG[k].y<hide) hide=LG[k].y; } z.displayLv=dl; z.hideAbove=hide===Infinity?undefined:hide; }
  E.updateLevelVis=updateLevelVis;
  /* 多樓層：玩家這一層以上的樓層不投影子（LAWWW2-B 2026-10-24 巡場景第 7 區）。鏡頭比上一層的地板低時 updateLevelVis 會把上一層整層顯示（看得到天花板），
     上一層的桌椅也就進了陰影貼圖；室內的太陽沒有被樓板擋住，二樓桌椅的影子會打在一樓的牆上（普通 101、博雅一樓）。陰影那一輪把那些層暫時藏起來、畫完還原：
     一般畫面不變；之後才載入的模型也一樣（不用一個一個改 castShadow）。「玩家這一層」用導航的層（player.lv），不用 displayLv：
     階梯教室後排的座位離地板超過 0.5 m，displayLv 會當成在樓梯上、算成二樓（博雅一樓的階梯教室）。測試：node tests/shadow_levels_unit.js */
  function shadowLevels(SM){ const smr=SM.render; SM.render=function(){ const z=E.zone, LG=z&&z.levelGroups, hid=[], P=E.player; if(LG&&LG.length>1){ const dl=P&&P.lv!=null?(P.lv|0):(z.displayLv|0); for(let k=dl+1;k<LG.length;k++){ const g=LG[k]&&LG[k].group; if(g&&g.visible){ g.visible=false; hid.push(g); } } }
      try{ return smr.apply(SM,arguments); } finally{ for(const g of hid) g.visible=true; } }; }
  E.cinematic=function(pos,look){ if(E.cam.mode!=='cinematic'||!E.cam.look){ /* 從目前的視線方向開始平滑轉過去（舊版注視點從世界原點出發，第一次運鏡會甩頭） */ const fwd=new THREE.Vector3(); camera.getWorldDirection(fwd); E.cam.look=camera.position.clone().addScaledVector(fwd,Math.max(1,camera.position.distanceTo(look))); } E.cam.mode='cinematic'; E.cam.cine={pos:pos.clone(),look:look.clone()}; };
  /* 劇情鏡頭結束回到跟隨鏡頭（2026-10-18 使用者：「轉換視角太快了，在宿舍認識阿勳的時候轉回來玩的視角也很暈，隔天起來也是」）：
     原本看的點瞬間跳回玩家、位置 0.3 秒內拉回背後（還會繞半圈）。改成：跟隨鏡頭的方向接在劇情鏡頭現在的方位（不繞），1.1 秒內慢慢拉回距離、看的點慢慢移過去 */
  E.endCinematic=function(){ const C=E.cam; if(C.mode==='cinematic'&&E.player){ const p=E.player.obj.position, dx=camera.position.x-p.x, dz=camera.position.z-p.z;
      if(Math.hypot(dx,dz)>0.6) C.yaw=Math.atan2(dx,dz); C.blend={t:0,dur:1.1,look:(C.look||camera.getWorldDirection(new THREE.Vector3()).add(camera.position)).clone()}; }
    C.mode='follow'; C.cine=null; };
  E.snapCinematic=function(){ const s=E.cam.cine; if(!s) return; camera.position.copy(s.pos); E.cam.look=(E.cam.look||new THREE.Vector3()).copy(s.look); camera.lookAt(E.cam.look); camera.updateMatrixWorld(); };   /* 直接放到運鏡位置（換區域、淡入之前用：不從上一個區域的座標飛過來）*/
  E.nearestInteractable=function(){ const P=E.player; if(!P) return null; let best=null, bd=1e9; const occupied=(st)=>E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.35); const plv=P.lv|0, py=P.obj.position.y; const tp=P.tapPref&&P.tapPref.zone===(E.zone&&E.zone.id)&&(P.tapPref.lv|0)===plv?P.tapPref:null; let tpIt=null, tpd=1e9, tpBd=1e9; for(const it of E.interactables){ if(it.hidden) continue; if(it.seat&&(occupied(it.seat)||it.seat.taken)) continue; /* 有人坐的位子（taken：替身坐的，classes3d.js）不能再坐，也不能擋住和那個人說話 */ if(E.levels&&it.lv!==undefined&&(it.lv|0)!==plv) continue; if(it.y!==undefined&&Math.abs(it.y-py)>1.4) continue; /* 多樓層：別層的東西（正上方、正下方）不算 */ const d=Math.hypot(it.x-P.obj.position.x,it.z-P.obj.position.z); if(d<(it.radius||1.8)&&d-(it.prio||0)<bd){ bd=d-(it.prio||0); best=it; } if(tp&&d<(it.radius||1.8)){ const dt=Math.hypot(it.x-tp.x,it.z-tp.z); if(dt<(it.radius||1.8)&&dt<tpd){ tpd=dt; tpIt=it; tpBd=d-(it.prio||0); } } } if(tpIt&&tpIt!==best){ best=tpIt; bd=tpBd; }   /* 點地面走過來的：人站的地方在好幾個互動範圍裡時，取離「點的位置」最近、點的位置也在它範圍裡的那一個（點床＝睡覺，不是床底下的紙箱）；推搖桿以後照舊取離人最近的 */   /* prio：兩個範圍重疊時優先（宿舍的回家背包離床 0.8 m，站在背包旁邊卻出「睡覺」，flow_law_break）*/
    /* 人和互動點比遠近：人只優先於旁邊的椅子（差 0.5 m 以內算人）；門口、出口、公告欄照實際距離。2026-10-13 v9.6 回歸 flow_class_real：
       走路的人玩家走近就停下來（a77f1f9），下課時同學停在後門旁邊，「離開教室」被「和郭沛珊說話」蓋掉（原本人對所有互動點都先讓 0.5 m）*/
    let yb=null, ybd=1e9;   /* 路人（AA_495 各系的學生：crowd3d.js deptOne 的 yieldIt）最後才算：旁邊有互動點（出口、座位、公告欄）或別的人（有名字的同學）時不擋——路上的人很多，不能讓「進入○○」「和小安說話」變成「聽一句」*/
    for(const n of E.npcs){ if(!n.talk||n.hidden) continue; if(Math.abs(n.obj.position.y-py)>1.4) continue; if((n.leaving||n.beh==='follow')&&best&&(best.exit||best.enter)) continue;   /* 要離開的人（時段結束、走向出口）不擋出口：下課時同學和玩家一起走到後門（v9.6 回歸 flow_class_real 第二次）；跟著玩家走的人（beh follow：同行、一起出遊）也不擋門口、出口——人站得比門近時按鈕會變成「和她說話」，要退一步才進得去（BB-B 10-24 RELEASE-9109-TEST flow_library_scene）*/ /* 櫃台後面的店員（staff，兩點半的芷若）比櫃台的點餐點優先：店員站在吧檯後面，玩家站得到的地方點餐點永遠比較近，「和店員說話」從來不會出現（2026-10-14 v9.7 flow_first_meet C）；和店員說話＝她的事件或點餐（story3d.js）*/ const d=Math.hypot(n.obj.position.x-P.obj.position.x,n.obj.position.z-P.obj.position.z); if(n.yieldIt){ if(d<2.2&&d<ybd){ ybd=d; yb={npc:n,label:n.talkLabel||('和'+n.name+'說話'),x:n.obj.position.x,z:n.obj.position.z,onInteract:()=>n.talk(n)}; } continue; } const bias=!best||best.seat?0.5:(n.staff&&best.counter?9:0); if(d<2.2&&d-bias<bd){ bd=d; best={npc:n,label:n.talkLabel||('和'+n.name+'說話'),x:n.obj.position.x,z:n.obj.position.z,onInteract:()=>n.talk(n)}; } } if(!best) best=yb; return best; };
  /* 座位的互動範圍要碰得到人物站得住的地方（2026-10-14 v9.6 發布回歸 reachability_all：法圖一樓靠窗座位、社科院閱覽長桌與閱報區、普通二樓長椅——
     椅子後面是桌子、牆或欄杆，最近站得住的位置離椅子 0.65～0.8 m，互動範圍 0.8 m：「坐下」只在 15 cm 以下的一條細縫裡出現，玩家幾乎按不到）。
     區域建好、導航格設好之後掃一次：從最近站得住的位置（人物半徑 0.32 m）往外至少要有 0.3 m 的範圍會出現按鈕——不夠的座位，範圍放大到那個距離＋0.3 m（最多 1.3 m）；其他座位不動。
     回傳放大了幾個（it.radiusFit 記原本的範圍）。測試：node tests/seat_reach_unit.js、tests/reachability_all.py */
  function fitSeatRadius(){ let n=0; for(const it of E.interactables){ if(!it.seat) continue; const r0=it.radius||1.8, lv=(E.levels&&it.lv!==undefined)?(it.lv|0):0; if(!navOf(lv)) continue; let best=null;
      for(let R=0.3;R<=1.3+1e-6&&best===null;R+=0.05) for(let a=0;a<48;a++){ const x=it.x+Math.cos(a*Math.PI/24)*R, z=it.z+Math.sin(a*Math.PI/24)*R; if(standL(x,z,0.32,lv)){ best=R; break; } }
      if(best!==null&&best+0.3>r0+1e-6){ it.radiusFit=r0; it.radius=Math.min(1.3,best+0.3); n++; } } return n; }
  E.fitSeatRadius=fitSeatRadius;
  /* 手機轉向（使用者 2026-10-15：先橫再直，人物變細／變扁，要重開才正常）：iOS 的 resize 事件常在版面還沒換好時就來，讀到舊的寬高。
     每一幀比一次畫布的實際大小，不一樣就重設（只讀兩個數字，很便宜）；另外 orientationchange、visualViewport 也接上 */
  /* 晚上的太陽陰影（X79，使用者 2026-10-20「校園地圖卡」；BB-C 量到校園 19:30 有 857 個投影子的網格、516 draw calls）：19:12～05:30 太陽在地平線下、亮度 0.25 以下，影子幾乎看不到，
     陰影貼圖改成 2 秒重畫一次（換區域馬上重畫）——不關 castShadow（關掉會讓全部材質重新編譯，黃昏那一下會頓）；白天照舊每一格畫。網址加 ?nightshadow=full＝每一格都畫（量修改前的數字用）*/
  E.nightShadowFull=typeof location!=='undefined'&&/[?&]nightshadow=full/.test(location.search||'');
  E.nightShadow=function(now){ if(!renderer||!renderer.shadowMap.enabled) return; const hh=E.lightH!=null?E.lightH:(((E.hour||0)%24)+24)%24, night=!E.nightShadowFull&&(hh>=19.2||hh<5.5);   /* 光線用的時刻（ENGINE-SEASON-DUSK-1024）：冬天 17:35 天黑就換夜間影子 */
    if(!night){ renderer.shadowMap.autoUpdate=true; return; } renderer.shadowMap.autoUpdate=false; if(!(E._shT>0)||now-E._shT>2000||E._shZone!==E.zone){ renderer.shadowMap.needsUpdate=true; E._shT=now; E._shZone=E.zone; } };
  E.render=function(){ const w=E.canvas.clientWidth||innerWidth, h=E.canvas.clientHeight||innerHeight; if(w!==E.w||h!==E.h) E.resize(); if(E.renderSkip&&E.renderSkip()){ E.skipped=(E.skipped|0)+1; return; } E.nightShadow(performance.now()); renderer.render(scene,camera); };   /* renderSkip：全畫面 2D（出遊、CG、深色底）蓋住 3D 時不畫（P0 BUG-IOS-RELOAD：手機少做一份 GPU 工作，game3d.js 設定）*/
  E.recenter=function(){ if(E.player){ E.cam.yaw=E.player.obj.rotation.y+Math.PI; E.cam.manualT=0; } };
  E.faceEachOther=function(a,b){ const dx=b.position.x-a.position.x, dz=b.position.z-a.position.z; a.rotation.y=Math.atan2(dx,dz); b.rotation.y=Math.atan2(-dx,-dz); };
  return E;
})();
